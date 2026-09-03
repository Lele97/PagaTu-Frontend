# PagaTu — contesto UI e frontend

Unico file di contesto. Sostituisce `UI/*.md`, `UI/*.html` di preview, `docs/FRONTEND_CODE_AUDIT.md`, `docs/PERFORMANCE_AND_CLEANUP_REPORT.md`, `docs/backend-user-statistics.md`, `docs/backend/user_stats.go` e il README template di React Router.

Stack reale: **Vite 7 + React 18 + react-router-dom 7 + CSS modules**. Non Tailwind, non SSR, non Bootstrap CSS, non temi. Alias `~` → `app/`. Gateway: `import.meta.env.VITE_GETAWAY_SERVER_URL` (typo GETAWAY). Dev default porta **8888**.

---

## Prodotto
10→
Web app per gruppi che vanno al bar: turni, pagamenti, “paga per un amico”, skip, classifica, bilancio, award. Anima caffè: palette, tazza, avatar lettera + icona, tagline **«Il caffè che unisce il team»** solo sulla splash.

Decisioni di prodotto ancora valide:

- Nessun aggiornamento ottimistico: refresh dopo chiusura modal.
- Turno visivo = coda orizzontale di avatar.
- Header sticky, logo senza wordmark, niente riga sotto l’header.
- Impostazioni utente e gruppo nell’header (ingranaggio / slider), non un theme switcher.
- Award utente in home, award/king del gruppo in group.
20→- Navigazione gruppo via URL `/group/:groupName`, non solo `localStorage`.

Abbandonato (non reintrodurre senza decisione esplicita): 4 temi (`themes.css`, espresso/latte/office), Bootstrap Icons come sistema, Drawer/bottom sheet, group switcher in header, `shared/ui` Button/Card.

---

## Design system

Fonte: `app/styles/app.css`.

30→```css
:root {
  --coffee-0: #fffef8;
  --coffee-50: #faf7f2;
  --coffee-100: #f3ece4;
  --coffee-200: #e8ddd2;
  --coffee-300: #d8c5b3;
  --coffee-400: #bfa48d;
  --coffee-500: #9b7b62;
  --coffee-600: #6f4e37;   /* brand, bottoni */
40→  --coffee-700: #5a3e2d;
  --coffee-800: #3e2c20;
  --coffee-900: #2a1e16;
  --coffee-1000: #17100c;

  --text-primary: #2d1f17;
  --text-secondary: #6f5a4c;
  --text-soft: #9f8a7b;
  --text-white: #fffaf5;
  --text-grey-light: #b3b3b3;
50→
  --surface-main: rgba(255, 253, 249, 0.82);
  --surface-card: rgba(255, 253, 249, 0.94);
  --surface-soft: rgba(243, 236, 228, 0.9);
  --surface-strong: #f4ede6;
  --border-soft: rgba(111, 78, 55, 0.14);

  --success: #4caf50; --success-bg: #edf8ee;
  --error: #d94b3d;   --error-bg: #fff1ef;
  --warning: #c98a2e;
60→
  --shadow-sm: 0 8px 20px rgba(62, 44, 32, 0.06);
  --shadow-md: 0 14px 30px rgba(62, 44, 32, 0.1);
  --shadow-lg: 0 24px 60px rgba(62, 44, 32, 0.14);

  --radius-sm: 12px;
  --radius-md: 20px;
  --radius-lg: 28px;

  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
70→  --space-5: 20px; --space-6: 24px; --space-8: 32px; --space-10: 40px;

  --transition-fast: 180ms ease;
  --transition-smooth: 320ms ease;
}
```

- Font UI: **Outfit** 400/600/700/800 (Google). Wordmark splash/welcome: **Oatlander** `/Oatlander.ttf` come `CustomFont`.
- Heading: h1 2rem / 800, h2 1.5rem / 700, h3 1.25rem / 600.
- Icone: **Font Awesome 7 solid** da cdnjs (`index.html`: `fontawesome.min.css` + `solid.min.css`). Helper `fa(name)` in `app/utils/icons.js`. Non usare `bi bi-*`.
80→- Avatar preset (`AVATAR_PRESETS`): `mug-hot`, `mug-saucer`, `circle`, `cloud`, `building`.
- Breakpoint: 480 / 768 / 1024. Home/group: griglia `2fr 1fr` fino a 1024px; sidebar `sticky; top: 76px`.

### Pattern di sfondo

Stesso tile su splash, welcome, home, group: `CoffeePatternIcons` + `.coffeePattern` in `shared.module.css`.

```css
.coffeePattern {
  position: absolute;
90→  inset: 0;
  z-index: 0;
  pointer-events: none;
  background-image: url('/patterns/splash-tile.svg');
  background-repeat: repeat;
  background-size: clamp(340px, 84vmin, 620px) clamp(340px, 84vmin, 620px);
  opacity: 0.8;
}
```

100→Pagine: `background: var(--coffee-0)`. Body ha anche un wash radiale su `--coffee-50`. Altri SVG in `public/patterns/` (bean, cup, waffle…) non sono usati.

Wordmark ad arco: splash `#51361b` / `#c29159`; welcome `#462a17` / `#d4a470`.

### Card di sezione (home e group)

`.groupSection`, `.recentSection`, `.groupInfoSection`, `.actionsCard` / sidebar:

- `background: var(--surface-card)`
- `border: 1px solid var(--border-soft)`
110→- `border-radius: var(--radius-md)`
- `padding: 3rem 2.5rem` (sidebar 1.5rem)
- `min-height: 200px` sulle section principali
- `box-shadow: var(--shadow-md)`
- Titolo: 1.5rem / 700, flex + icona FA, `--coffee-800`

Inner card (group list, payment) ancora hardcoded: `linear-gradient(135deg, #fff, #f8f9fa)`, raggio 0.75–1rem. `expansion.module.css` (bilancio/award gruppo) è un secondo linguaggio visivo (bordo sinistro `--coffee-600`).

### Header

120→`.header`: `position: sticky; top: 0; z-index: 1000; backdrop-filter: blur(12px); background: var(--surface-main)`. Scroll → `.headerScrolled` + `--shadow-md`. Logo `.pagatu_image` height **80px**. Logout `fa-right-from-bracket`. Avatar: icona FA + lettera.

### Altri pezzi UI

- Separator: `CoffeeSeparator` + `.separator*` in shared; tazza `/coffee-medium-svgrepo-com.svg`. Oggi usato solo in error page (in home/group le section usano gap 1.5rem).
- Modal canonico: `ModalWrapper` overlay blur, z-index 1100, max 560px, `--radius-lg`. Group ha ancora una skin parallela in `group.module.css`.
- Turn avatar: 42px; attivo scale 1.12 + glow `turnPulse`.
- Award home: medaglie circolari gold/silver/bronze. King gruppo: clip-path pentagono, gradient `#ffc107 → #ff9800`.
- Reveal: `SectionReveal` + IntersectionObserver (threshold 0.12). Default `as="section"` — evita di wrappare un altro `<section>` o passa `as="div"`.
- Bottoni shared: `.primaryButton` gradient 600→700; `.secondaryButton` `--coffee-100`; raggio 14px.
130→
CSS modules in `app/styles/`: `app.css`, `auth`, `error`, `expansion`, `footer`, `group`, `header`, `home`, `invitation`, `resetPsw`, `settings`, `shared`, `signup`, `splash`. Non esistono più `themes.css`, `logo.module.css`, `profile.module.css`, `forgotPsw.module.css`.

---

## Schermate e rotte

| Path | Pagina |
|---|---|
| `/` | Splash (bundle iniziale) |
140→| `/welcome` | AuthLanding (tab login / signup / forgot) |
| `/login` `/signup` `/forgotPassword` | redirect a `/welcome` |
| `/home` | Home |
| `/group` | redirect `/home` |
| `/group/:groupName` | Group |
| `/invitation` | Invito |
| `/resetPassword` | Reset password |
| `/verify-email` | Verifica email |
| `/profile/payment-links` | `/home?settings=payments` |
| `/errore-token` `/error` `*` | Error |
150→
Footer da `root.jsx` su tutte le rotte **tranne splash**. Welcome ha il footer.

**Splash** — 2500ms + fade 600ms. Se `authToken` → invito pending o `/home`, senno `/welcome`. 20 chicchi su raggio 43%, logo, arco PagaTu, tagline.

**Welcome** — brand in alto a sinistra; hero + panel auth (tab); 3 info card; zigzag (turni / paga per / award). OAuth Google GSI + Microsoft implicit (`response_type=token`, redirect `/welcome`).

**Home** — greeting “Ciao, {user}”; colonna: gruppi (6/pagina) + pagamenti (4/pagina); sidebar: stats + award. Modal crea gruppo e settings utente.

**Group** — `useGroupPage` per stato/API; JSX in `group.jsx`. Info membri + TurnIndicator, classifica, bilancio/award; sidebar azioni. Modal: registra, skip, paga-per, invita, elimina, settings.
160→
**Settings utente** — tab `profile` | `payments` | `preferences` | `security`. Nessun tab tema.

---

## Architettura frontend

```
app/
  main.jsx, routes/root.jsx
170→  hooks/useGroupPage.js, useSectionReveal.js
  context/GroupContext.jsx, SettingsContext.jsx
  utils/api.js          # GATEWAY_URL, authHeaders, sendRequest, createCachedFetcher
  services/requestApi.js # endpoint, ritorna { ok, status, body }
  services/userApi.js    # profilo/settings, throw se !ok
```

### Due layer HTTP (voluto)

- **`sendRequest`**: fetch + Bearer se c’è token + `credentials: 'include'` + parse. Non interpreta lo status.
180→- **`requestApi`**: un metodo per endpoint (login, createGroup, getGroupsByUsername, …). Il componente fa `switch (status)`.
- **`userApi.request`**: stesso `sendRequest`, ma **throw** se `!ok`. Per profilo, preferenze, leave group, karma.
- **`createCachedFetcher(cache)`** → `(cacheKey, requestFn, ttl = 30000)`.

```js
cachedFetchJson(cacheKey, () => getGroupsByUsername(username));
```

Non passare `(url, cacheKey, options)`: `requestFn` deve essere una funzione. Cache 30s in RAM; invalidare con `clearCache('classifica_…')` dopo paga/skip/paga-per.

190→### Auth

- Token: `localStorage.authToken`. User: `localStorage.user` JSON.
- Logout: remove + `/welcome`.
- Splash/welcome/home: se c’è un token si entra; 401 dopo fa logout. Il token non viene validato prima del redirect.

### Navigazione gruppo

`GroupContext.openGroup(name)` → `/group/${encodeURIComponent(name)}`. Invito pending: `localStorage.pendingInvitation`.

200→### Contratto stats/award (home)

`GET /api/coffee/user/statistics` (Java, non il Go in `docs/backend/`):

Campi usati in UI: `totalPaid`, `totalCoffeesForOthers`, `skippedCount`, `averagePayment`, `coffeeKarma`. Spec originale citava anche `timesKing`, `currentStreak`, `funTitle` — il backend Java **non li popola** oggi.

`GET /api/coffee/user/awards`: lista `{ id, name, level: gold|silver|bronze, icon, … }`.

Karma: `KARMA_OPS.PAYMENT | PAYMENT_FOR | JUMP_TURN` → `PUT /api/coffee/user/coffeekarma`.

210→---

## Convenzioni codice UI

- CSS modules in `app/styles/`, non accanto al jsx.
- Icone: `<i className="fa-solid fa-…" />`.
- Modal: `ModalWrapper` + `ErrorSuccessMessages` + `ModalButtons`.
- Soldi: `formatCurrency` (`it-IT`, EUR) in `api.js`.
- Nessun update ottimistico.
- `React.memo` sui pezzi presentazionali.
220→
Componenti morti già tolti: `GroupExpansionSections`, `Drawer`, `payment-links`, `BuyMeACoffeeButton`.

---

## Sicurezza (aperta)

1. JWT in `localStorage` — XSS = sessione rubata. Fix: cookie HttpOnly + backend/gateway.
2. Microsoft OAuth implicit: token nell’hash URL. Fix: Authorization Code + PKCE.
3. Script Google `accounts.google.com/gsi/client` iniettato a runtime.
230→4. Email reset in `localStorage` (PII).
5. `credentials: 'include'` e header Bearer insieme.

---

## Debito UI / codice ancora vero

- CSS duplicato home vs group vs shared (modal, payment card, spinner, empty state).
- `.homePage` / `.groupPage` `overflow: hidden` può tagliare ombre.
- `SectionReveal` come `<section>` intorno a un altro `<section>`.
240→- Footer su welcome (stacco dalla splash).
- Spinner invitation ancora `#007bff`.
- `CoffeeSeparator` non usato tra le section di home/group.
- Card interne `#fff` invece dei token.
- Date picker enorme dentro `signup-form.jsx`.
- Nessun toast: error/success spariscono con timeout.
- README ancora template React Router (Tailwind/SSR).
- `package.json` ancora: `jsonpath`, `bootstrap`, purgecss, cssnano, react-dotenv, react-env (non usati nel codice).
- Service worker `public/sw.js` non precacha i chunk hashati di Vite.

250→---

## Cosa non rifare

Già fatto: header sticky/glass/80px, greeting home, section card + reveal, pattern splash su welcome/home/group, zigzag welcome, TurnIndicator, back button gruppo, `/group/:name` + GroupContext, split `useGroupPage`, `requestApi`, splash timer, FA solid-only, lazy routes, email supporto `support@pagatu.app`.

Non reintrodurre: temi, `themes.css`, Bootstrap Icons, Drawer, Tailwind, jsonpath, fetch `(url, cacheKey, options)` sulla cache.

---

## Analisi prestazioni Lighthouse e suggerimenti

Dopo l'analisi con Google Lighthouse, i punteggi attuali sono:
- Group page: 64
- Home page: 69
- Welcome page: 59

### Principali opportunità di miglioramento

1. **Ridurre il bundle JavaScript**
   - Il bundle iniziale è ancora grande a causa di dipendenze non necessarie (es. jsonpath, bootstrap, ecc. in package.json sebbene non usate).
   - Rimuovere le dipendenze inutilizzate da package.json e reinstallare.
   - Considerare la code-splitting per le route non critiche (es. modali, pagine di impostazioni).
   - Utilizzare dinamici import() per componenti pesanti che non sono necessari al caricamento iniziale.

2. **Ottimizzare le immagini e gli SVG**
   - Gli sprite di pattern sono già SVG, ma assicurarsi che siano ottimizzati (rimuovere metadati, ridurre dimensioni viewBox se non necessario).
   - Le immagini nella cartella public/ (logo, icone) dovrebbero essere compresse e servite in formati moderni (WebP/AVIF) con dimensioni appropriate.
   - Considerare l'inlining delle SVG piccole direttamente nel CSS/JS per evitare richieste aggiuntive.

3. **Sfruttare la cache del browser**
   - Il service worker (sw.js) non precacha i chunk hashati di Vite. Aggiornarlo per precassare gli asset statici.
   - Impostare header di cache adeguati per gli asset statici (immagini, font, CSS, JS) tramite il server (nginx) o tramite Vite build con plugin.

4. **Minimizzare il lavoro sul thread principale**
   - Alcuni componenti eseguono calcoli costosi durante il rendering (es. formattazione di grandi liste). Utilizzare useMemo e useCallback.
   - Considerare lo spostamento di lavori non urgenti in requestIdleCallback o setTimeout.

5. **Ridurre lo spostamento di layout (CLS)**
   - Assicurarsi che le immagini e gli elementi dinamici abbiano dimensioni prestabilite (width/height) per evitare spostamenti durante il caricamento.
   - Il pattern di sfondo con `inset: 0` e `background-size: clamp` potrebbe causare ridisegni; verificare se è necessario.

6. **Ottimizzare il caricamento dei font**
   - Il font Oatlander è caricato come CustomFont; verificare che sia in formato ottimizzato (woff2) e che venga effettuato il preload.
   - Il font Outfit è già da Google Fonts; assicurarsi di caricare solo i pesi utilizzati (400,600,700,800) e utilizzare `display: swap`.

7. **Pulizia delle dipendenze e del codice**
   - Come già iniziato, rimuovere le cartelle vuote e consolidare le utility.
   - Eliminare i file di configurazione non utilizzati (es. tailwind.config.js se esiste, purgecss, cssnano).
   - Aggiornare il servizio di caching (createCachedFetcher) per aumentare il TTL dove appropriato.

### Azioni già intraprese
- Unione delle cartelle `services` e `util` in un'unica `utils`, riducendo il numero di file e semplificando gli import.
- Rimozione delle cartelle vuote (`services`).

### Prossimi passi consigliati
1. Eseguire `npm audit` e rimuovere le dipendenze non utilizzate.
2. Eseguire un nuovo build con l'analisi del bundle (vite build --mode report) per identificare i moduli più grandi.
3. Aggiornare il service worker per precassare gli asset.
4. Ottimizzare le immagini e gli SVG con strumenti come imagemin o SVGO.
5. Implementare lazy loading per le immagini non critiche (sebbene attualmente non ce ne siano molte oltre i pattern).
6. Testare nuovamente con Lighthouse dopo ogni modifica.