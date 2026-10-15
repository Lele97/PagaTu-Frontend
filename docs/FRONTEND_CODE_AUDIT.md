# Audit frontend PagaTu

Analisi del codice in `app/`: componenti, CSS, codice morto, anomalie grafiche, sicurezza.  
Le pulizie sicure sono già applicate. Le modifiche più impattanti sono descritte sotto **senza essere state eseguite**.

---

## Cosa è stato fatto in questa passata

### Codice morto rimosso
- Componenti non referenziati: `GroupExpansionSections.jsx`, `Drawer.jsx`, `profile/payment-links.jsx`, `BuyMeACoffeeButton.jsx`
- CSS orfani: `profile.module.css`, `logo.module.css`, `forgotPsw.module.css`
- Classi CSS non usate: steam splash, `turnHeading`, `leaveGroupBtn`, `repoCard`, blocco story di welcome, export inutili (`TOKEN_ERROR_PATH`, `authRedirect`, `fetchUserStatistics`, `fetchUserAwards`)
- Dipendenza `jsonpath` tolta dal codice (restano `package.json` / lockfile: vedi sotto)

### Leggibilità
- Fetch con cache unificato in `createCachedFetcher` (`app/utils/api.js`), usato da home e group
- Login / signup / forgot: rimossa la variante “pagina standalone”. Restano solo i form dentro `/welcome` (le rotte `/login`, `/signup`, `/forgotPassword` già reindirizzavano lì)
- `getFriend` in group usa `getCurrentTurnMember` invece di jsonpath

### Bug grafici / funzionali corretti
- **Splash non navigava più**: i timer di fade/redirect erano commentati. Ripristinati. Senza questo la splash resta infinita e l’app non parte.
- **Blur dei modal in group**: si applicava la stringa globale `modal-active`, che i CSS module non matchano. Ora usa `styles.modalActive` come home.
- Header: import e commento di `BuyMeACoffeeButton` (mai renderizzato)

---

## Sicurezza (non cambiata, da valutare)

### 1. JWT in `localStorage` — impatto alto
Il Bearer sta in `localStorage.authToken`. Qualsiasi XSS (script di terzi, HTML non sanitizzato, estensione) può rubarlo e impersonare l’utente.

**Come modificarlo:** cookie `HttpOnly` + `Secure` + `SameSite` emesso dall’auth service; il frontend smette di leggere/scrivere il token e usa `credentials: 'include'`. Va allineato gateway, CORS (`allowCredentials`) e logout (invalidare il cookie lato server). Non è una modifica solo frontend.

### 2. OAuth Microsoft implicit flow — impatto alto
`response_type=token` mette l’access token nell’hash dell’URL (`/welcome#access_token=...`). Finisce in history, log, referrer.

**Come modificarlo:** Authorization Code + PKCE (`response_type=code`). Serve endpoint backend che scambia il code e setta sessione/JWT. Google GSI è più solido; Microsoft va allineata.

### 3. Script Google GSI da CDN — impatto medio
`https://accounts.google.com/gsi/client` è iniettato a runtime. Compromissione CDN = esecuzione nel contesto dell’app.

**Come modificarlo:** self-host dello script, Subresource Integrity, o CSP `script-src` stretta. Coordinare con `index.html` (già Font Awesome da cdnjs).

### 4. Token reset password / email in `localStorage` — impatto medio
`forgotPsw-form` salva `email` in localStorage; `resetPsw-form` la rilegge. Non è un secret ma è PII persistente sul device.

**Come modificarlo:** passare l’email nello state di navigazione o rileggerla dalla validazione token (`GET /reset-password?key=`).

### 5. `credentials: 'include'` + header `Authorization` — impatto basso/medio
Doppia autenticazione. Se un giorno il backend setta cookie di sessione, le chiamate cross-origin diventano bersaglio CSRF. Oggi il JWT è nell’header, quindi CSRF classico è limitato.

**Come modificarlo:** quando si passa ai cookie, aggiungere CSRF token o `SameSite=Strict` e togliere il Bearer dal JS.

### 6. Redirect “se c’è un token” senza validarlo — impatto basso
Splash, login e welcome reindirizzano a home se `authToken` esiste, anche se scaduto. Poi le API 401 fanno logout. UX goffa, non è un bypass.

**Come modificarlo:** chiamata `GET /api/auth/profile` (o analoga) prima del redirect.

---

## Anomalie grafiche residue (non toccate)

| Problema | Effetto | Come modificarlo |
|---|---|---|
| `homePage` / `groupPage` con `overflow: hidden` | contenuto alto o ombre possono venire tagliati | `overflow-x: hidden; overflow-y: visible` (o togliere overflow) |
| `SectionReveal` è un `<section>` che avvolge un altro `<section>` | HTML non semantico, possibile doppio padding/annuncio screen reader | `as="div"` su `SectionReveal` |
| Date picker signup: `querySelector(".container")` non matcha i CSS module | il blur della welcome sotto il date picker non partiva; ora si blocca solo lo scroll del body | se serve il blur, passare un className module al container di AuthLanding |
| Card home vs group: padding/shadow allineati, ma inner card di bilancio (`expansion.module.css`) restano diverse dalle payment card | visivamente “due sistemi” dentro group | portare `.card` expansion sullo stesso token di `.paymentCard` |
| Footer visibile su welcome (non su splash) | stacco splash → welcome | nascondere footer anche su `/welcome` in `root.jsx` se si vuole continuità splash |
| Inline style sul header password del login | rompe il pattern CSS module | spostare in `signup.module.css` (flex space-between) |

---

## Modifiche impattanti **non** applicate

### A. Unificare tutte le `fetch` su `userApi.request`
Oggi home/group/invitation/signup fanno `fetch` a mano (header Bearer, `credentials`, switch su status). `userApi.js` già ha un `request` unico.

**Cosa comporta:** un 401 gestito in un solo interceptor (logout globale) invece che in ogni `switch`. Rischio: cambiare il contratto `{ status, body }` di `cachedFetchJson` e rompere i `case 200/401/404`. Va fatto per pagina, con test manuale di login, home, group, inviti.

### B. Spezzare `group.jsx` (~900 righe)
È un orchestratore: fetch, modal, azioni pagamento, cache.

**Come:** hook `useGroupPage(groupName)` per lo stato/API; il JSX resta nel componente. Impatto: diff grande, stesso comportamento se i callback restano identici. Utile prima di aggiungere altre feature.

### C. Spezzare `signup-form.jsx` (date picker enorme nello stesso file)
`CustomSelect` + `DatePickerModal` + form.

**Come:** `DatePickerModal.jsx` + `CustomSelect.jsx` accanto al form. Nessun cambio UX se le props restano le stesse.

### D. `npm uninstall jsonpath bootstrap @fullhuman/postcss-purgecss cssnano react-dotenv react-env`
Sono in `package.json` ma non importati (o non configurati).

**Cosa comporta:** lockfile e `node_modules` più piccoli. `bootstrap` già non è in CSS. Non l’ho lanciato per non toccare il lock senza tua conferma.

### E. Cookie httpOnly (vedi sicurezza §1)
Cambio di architettura auth. Richiede backend + gateway + frontend insieme.

### F. Service worker (`public/sw.js`)
Precacha pochi statici, non i chunk hashati di Vite. Su deploy nuovi può servire JS vecchio.

**Come:** `vite-plugin-pwa` o disabilitare lo SW in dev. Impatto: cache aggressiva = utenti che non vedono il frontend nuovo finché non fanno hard refresh.

---

## Mappa attuale (dopo pulizia)

| Area | File principali | Ruolo |
|---|---|---|
| Shell | `main.jsx`, `routes/root.jsx` | router, lazy routes, footer |
| Auth | `AuthLanding`, `login-form`, `signup-form`, `forgotPsw-form`, `resetPsw-form`, `verify-email`, `OAuthButtons` | solo `/welcome` + reset + verify |
| Home | `home.jsx` + sezioni + `AddGroupModal` | gruppi, pagamenti, stats, award |
| Group | `group.jsx` + info/stats/cards/actions + modal | pagina gruppo |
| Shared | `SectionReveal`, modal wrapper, pattern splash | UI comune |
| API | `utils/api.js`, `services/userApi.js` | token, fetch, cache |

Rotte morte già reindirizzate: `/login`, `/signup`, `/forgotPassword`, `/group`, `/profile/payment-links`.

---

## Cosa conviene fare dopo, in ordine

1. `npm uninstall jsonpath bootstrap @fullhuman/postcss-purgecss cssnano react-dotenv react-env` e build locale
2. Verificare splash → welcome → login → home → group (blur modal, pattern, section)
3. Decidere se passare il JWT sui cookie (con il backend)
4. Sostituire Microsoft implicit flow
5. Solo dopo, spezzare `group.jsx` / `signup-form.jsx`
