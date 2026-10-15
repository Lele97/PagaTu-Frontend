# PagaTu Frontend — Report Pulizia, Bug Critici e Performance

**Data:** 2026-08-04
**Nota preliminare:** non è stato possibile importare il progetto Claude Design (`PagaTu Redesign Prototype.dc.html`) — nessun connettore MCP di design era disponibile e l'estensione Claude in Chrome non era collegata. Su tua indicazione ho lavorato direttamente sul codice esistente in `app/`. Il documento `UI/UX_LAST.md` presente nel repo si è rivelato in gran parte già implementato (commit `bf9d22a`); questo report parte da una verifica puntuale dello stato reale del codice, non dal documento.

---

## 1. Bug critici risolti

### 1.1 Animazioni CSS rotte (4 punti)
`group.module.css`, `home.module.css` e `forgotPsw.module.css` referenziavano nomi di keyframe corrotti/hashati che non esistevano in nessun `@keyframes`:
- `animation: _slideIn_1gnii_1 ...` → nessuna animazione di apertura modale funzionava
- `animation: __shakeFadeIn_mroe0_1_1ka6y_1 ...` → nessuna animazione "shake" sui messaggi di errore funzionava

Corretto in tutti e 4 i punti (`slideIn`, `shakeFadeIn`), riportando le animazioni di apertura modali e messaggi di errore.

### 1.2 Email di supporto placeholder nella pagina di errore
`error-page.jsx` puntava a `mailto:someone@example.com` (chiaramente un placeholder mai sostituito) invece di `support@pagatu.app` (usato correttamente nel footer). Un utente che finiva sulla pagina di errore e cliccava "supporto tecnico" scriveva a un indirizzo inesistente. Corretto.

### 1.3 `.errorIcon` in `auth.module.css` referenziava un'animazione inesistente
`animation: bounce 2s infinite` ma nessun `@keyframes bounce` era definito in quel file. La regola era comunque dead code (nessun componente la usa) → rimossa.

---

## 2. Pulizia codice morto

Rimossi selettori CSS non referenziati da nessun componente (verificato con grep su tutto `app/`):

| File | Rimosso |
|---|---|
| `group.module.css` | `.settingsHintBtn`, `.groupAdminButtons` (+ 2 varianti responsive), `.groupButtonSelected`, `.inviteButton`, l'intero sistema tabella mai usato (`.tableContainer/.table/.tableHeader/.tableRow/.tableCell` ecc.), `.warningText`, `.modalButtonGroup`, 2 blocchi duplicati (`.loadingSpinner`, `.textEmpty` doppi) |
| `home.module.css` | `.groupButtonSelected`, `.textEmpty` |
| `auth.module.css` | `.errorIcon` (rotto e inutilizzato) |
| `error.module.css` | `.errorIcon` (3 occorrenze incl. media query) + `@keyframes bounce` orfano |
| `invitation.module.css` | `.errorCard` rimosso dal selettore combinato (mai usato) |
| `shared.module.css` | `.dangerButton`, `.sharedCard` |
| `footer.module.css` | `.repoSection`, `.socialSection`, `.footerLinks`, `.pagatuimage` |

Circa 150 righe di CSS morto rimosse, verificate una ad una (nessuna classe rimossa era referenziata in JSX). Bilanciamento parentesi graffe verificato programmaticamente su tutti i file toccati.

---

## 3. Ottimizzazioni applicate subito

1. **Rimosso `bootstrap/dist/css/bootstrap.min.css`** da `main.jsx` — Bootstrap CSS (~200KB minificati) era importato globalmente ma **zero classi Bootstrap sono usate nell'app** (verificato via grep: nessun `btn-`, `col-`, `d-flex`, `form-control`, `navbar`). Rimozione a costo zero.
2. **Font Awesome: da `all.min.css` a `fontawesome.min.css` + `solid.min.css`** — l'app usa solo icone `fa-solid` (34 glifi diversi, mai `fa-brands`/`fa-regular`). Il CDN caricava l'intero pacchetto (tutti gli stili + tutti i font). Cambiato a caricare solo il necessario.
3. **Immagini: sostituiti `.png` con `.webp` già presenti ma non collegati** (`BuyMeACoffeeButton`, `BuyMeACoffeeIconButton`): `yellow-button.png` 24KB→15KB, `bmc-logo-yellow.png` 115KB→57KB. I file `.webp` esistevano già nella cartella `public/` ma nessun componente li referenziava.
4. **Code-splitting delle rotte** in `main.jsx`: `Home`, `Group`, `Invitation`, `AuthLanding`, `ForgotPswForm`, `ResetPswForm`, `VerifyEmail` ora usano `React.lazy` + `Suspense` invece di import statici. Solo la Splash Screen (rotta iniziale `/`) resta nel bundle caricato subito; le altre pagine si scaricano on-demand quando l'utente ci naviga.

**Verifica:** non è stato possibile eseguire `npm run build`/`vite build` in sandbox perché `node_modules` è stato installato su Windows (binari nativi `rollup`/`esbuild` non compatibili con Linux) e l'accesso al registro npm dalla sandbox è bloccato. Ho verificato staticamente: bilanciamento parentesi CSS su tutti i file modificati, assenza di riferimenti JSX a classi rimosse, assenza di residui di codice morto. **Ti consiglio di lanciare `npm run build` e `npm run typecheck` in locale prima di deployare**, per sicurezza.

---

## 4. Altri punti per velocizzare le pagine (da valutare, non ancora applicati)

Elencati in ordine di impatto/sforzo stimato.

1. **Rimuovere `bootstrap` da `package.json`** (ora inutilizzato) e disinstallarlo: `npm uninstall bootstrap`. Riduce `node_modules` e il tempo di install/CI.
2. **`@fullhuman/postcss-purgecss` e `cssnano` sono in `package.json` ma non c'è nessun `postcss.config.js`** — quindi non vengono mai eseguiti. O li configuri (per rimuovere CSS inutilizzato in produzione e minificare oltre a quanto fa già Vite) oppure li rimuovi come dipendenze morte.
3. **Asset orfano**: `coffee-cup-coffee-svgrepo-com.png` (97KB) e la sua versione `.webp` non sono referenziati da nessuna parte nel codice — possono essere eliminati dalla cartella `public/`.
4. **Self-host dei font invece del CDN cdnjs** per Font Awesome e/o Google Fonts: elimina una connessione TLS esterna e dipendenza da terzi; con Vite puoi importare solo le icone effettivamente usate (34 glifi) via `@fortawesome/react-fontawesome` + subset, invece di un intero foglio icone.
5. **Service Worker (`public/sw.js`) troppo minimale**: precarica solo 6 file statici e non gli asset JS/CSS con hash generati dalla build. Su visite ripetute l'utente non beneficia di cache reale dell'app. Vale la pena passare a `vite-plugin-pwa` (genera automaticamente il precache dei chunk hashati) o estendere manualmente `urlsToCache` dopo ogni build.
6. **Immagini social/OG** (`og-image.png`, 278KB) — non impatta il caricamento delle pagine dell'app (viene letta solo dai crawler social), ma vale la pena comprimerla se la userete anche altrove nell'UI.
7. **`localStorage` per il token JWT** (`utils/api.js`): funziona, ma è esposto a XSS se mai introdotto uno script di terze parti. Non è una modifica "veloce da fare" (richiede coordinamento col backend per cookie httpOnly), la segnalo come nota di sicurezza/robustezza per il futuro, non come bug.
8. **Bundle vendor**: `vite.config.js` già separa `vendor` (react/react-dom/react-router-dom) e `utils` (jsonpath) in chunk dedicati — buona pratica già in atto, nessuna azione necessaria.

---

## 5. Riepilogo file modificati

```
app/main.jsx
app/components/error/error-page.jsx
app/components/buttons/BuyMeACoffeeButton.jsx
app/components/buttons/BuyMeACoffeeIconButton.jsx
app/styles/group.module.css
app/styles/home.module.css
app/styles/forgotPsw.module.css
app/styles/auth.module.css
app/styles/error.module.css
app/styles/invitation.module.css
app/styles/shared.module.css
app/styles/footer.module.css
index.html
```

Nessuna modifica alla logica di business, alle chiamate API o al comportamento funzionale dei componenti: solo bug fix, pulizia CSS morto e ottimizzazioni di caricamento.
