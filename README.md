<p align="center">
  <img src="public/pagaTu.svg" alt="PagaTu logo" width="140" />
</p>

<h1 align="center">PagaTu — Frontend</h1>

<p align="center">
  <strong>Il caffè che unisce il team.</strong><br />
  Dashboard React per gestire i turni del caffè, i pagamenti e i premi del gruppo.<br />
  Installabile come app, installabile offline, costruita per essere veloce.
</p>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/UI-8_pagine-8_modali-61DAFB?logo=react&logoColor=white&style=flat-square" alt="UI"></a>
  <img src="https://img.shields.io/badge/Componenti-48-61DAFB?logo=react&logoColor=white&style=flat-square" alt="Componenti">
  <img src="https://img.shields.io/badge/CSS_Modules-14_file-1572B6?style=flat-square" alt="CSS Modules">
  <img src="https://img.shields.io/badge/PWA-Installabile-5A0FC8?style=flat-square" alt="PWA">
  <img src="https://img.shields.io/badge/Licenza-MIT-8A2BE2?style=flat-square" alt="Licenza">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/React_Router-7-CA424E?logo=reactrouter&logoColor=white" alt="React Router">
  <img src="https://img.shields.io/badge/CSS_Modules-1572B6?logo=css&logoColor=white" alt="CSS">
  <img src="https://img.shields.io/badge/Workbox-PWA-5A0FC8?logo=googlepwa&logoColor=white" alt="PWA">
  <img src="https://img.shields.io/badge/Docker-nginx-2496ED?logo=docker&logoColor=white" alt="Docker">
</p>

<p align="center">
  <img src="https://img.shields.io/github/last-commit/Lele97/PagaTu-Frontend?label=ultimo%20commit" alt="Ultimo commit">
  <img src="https://img.shields.io/github/languages/top/Lele97/PagaTu-Frontend?label=linguaggio" alt="Linguaggio principale">
  <img src="https://img.shields.io/github/license/Lele97/PagaTu-Frontend?label=licenza" alt="Licenza">
  <img src="https://img.shields.io/github/stars/Lele97/PagaTu-Frontend?style=social&label=star" alt="Star">
  <img src="https://img.shields.io/github/forks/Lele97/PagaTu-Frontend?style=social&label=fork" alt="Fork">
  <img src="https://img.shields.io/github/contributors/Lele97/PagaTu-Frontend?style=social&label=contributors" alt="Contributors">
  <img src="https://img.shields.io/badge/dipendenze-9_inutilizzate-da_pulire-orange?style=flat" alt="Dipendenze inutilizzate">
</p>

<p align="center">
  <img src="public/og-image.png" alt="PagaTu" width="620" />
</p>

---

## Indice

- [Cos'è PagaTu](#cosè-pagatu)
- [Stack reale](#stack-reale)
- [Le schermate](#le-schermate)
- [Routing](#routing)
- [Architettura](#architettura)
- [Il design system](#il-design-system)
- [Gestione dei dati](#gestione-dei-dati)
- [Autenticazione](#autenticazione)
- [Performance](#performance)
- [PWA e SEO](#pwa-e-seo)
- [Getting Started](#getting-started)
- [Build e deploy](#build-e-deploy)
- [Limiti noti e roadmap](#limiti-noti-e-roadmap)
- [Come contribuire](#come-contribuire)
- [Licenza](#licenza)

---

## Cos'è PagaTu

Il classico *«chi va a comprare il caffè?»* costa ai team tempo, malumore e zero tracciabilità di chi ha
pagato cosa. **PagaTu** lo risolve.

Ogni membro di un gruppo ha un **turno** assegnato e visibile. Può **registrare il pagamento**, **saltarlo**
o **pagare per un collega**. Il gruppo mantiene **classifica**, **bilancio** con quota equa e link
Satispay/Revolut, e un sistema a **premi** gamificato.

Questo repository contiene il **frontend**: la dashboard React che gira sopra i microservizi Spring Boot del
backend.

> **Progetto personale end-to-end.** Architettura, implementazione, containerizzazione e deploy: tutto
> progettato e realizzato da zero.

---

## Stack reale

Nessuna sorpresa, nessuna tecnologia dichiarata e non usata:

| Categoria | Scelta | Note |
|---|---|---|
| **UI** | **React 18.2** | functional component, hook |
| **Build** | **Vite 7** | dev server con HMR, alias `~` → `app/` |
| **Routing** | **React Router 7** | `createBrowserRouter`, `React.lazy` |
| **Stile** | **CSS Modules** | 14 file in `app/styles/`, ~5.400 righe |
| **Icone** | **Font Awesome 7** (solid) | da cdnjs, helper `fa(name)` |
| **Font** | **Outfit** (UI) + **Oatlander** (wordmark) | Google Fonts + `@font-face` |
| **HTTP** | **`fetch` nativo** | nessun axios, nessun interceptor |
| **Linguaggio** | **JavaScript (JSX)** | ~6.100 righe in `app/` |
| **PWA** | **vite-plugin-pwa** + Workbox | precache degli asset |
| **Deploy** | **Docker** → **nginx** | build multi-stage |

**Cosa questo progetto *non* usa**, e non userà senza un motivo: niente Tailwind, niente Bootstrap CSS,
niente SSR, niente TypeScript, niente Redux o Zustand, niente React Query.

---

## Le schermate

| Schermata | Cosa fa |
|---|---|
| **Splash** (`/`) | Schermata d'attesa con 20 chicchi di caffè su orbita, logo e wordmark ad arco. 2.500 ms + dissolvenza di 600 ms, poi reindirizza a `/home` o `/welcome` |
| **Welcome** (`/welcome`) | Landing con hero e pannello auth a tab (login / signup / recupera password). Se l'utente è già autenticato va a `/home` |
| **Home** (`/home`) | Dashboard: griglia dei gruppi con badge del turno di chi tocca a lui, ultimi pagamenti, 6 riquadri statistica incluso il **Coffee Karma**, griglia dei premi. Paginazione 6 gruppi / 4 pagamenti per pagina |
| **Group** (`/group/:groupName`) | Il cuore dell'app: membri con stato, coda orizzontale dei turni, classifica, bilancio con quota equa e debiti pairwise, sezione premi con il re del caffè del mese, e la sidebar con le azioni (registra / salta / paga per un amico) |
| **Invito** (`/invitation`) | Accetta o rifiuta un invito a un gruppo. Funziona anche da non autenticato: l'invito resta salvato e si riprende dopo il login |
| **Reset password** (`/resetPassword`) | Nuova password dal token ricevuto via email |
| **Verifica email** (`/verify-email`) | Conferma l'indirizzo e permette di reinviare il messaggio |
| **Errore** (`*`, `/error`, `/errore-token`) | 404, 500, token scaduto — con le sue varianti e la traccia dello stack in sviluppo |

Le modali sono **8**: crea gruppo, registra pagamento, salta pagamento, paga per un amico, invita utente,
elimina gruppo, impostazioni utente (4 tab), impostazioni gruppo (3 tab, solo admin).

---

## Routing

Tutte le rotte sono definite in un unico punto, `app/main.jsx`, con `createBrowserRouter`.

| Path | Pagina | Protetta |
|---|---|:---:|
| `/` | Splash | — |
| `/welcome` | AuthLanding | — |
| `/login` · `/signup` · `/forgotPassword` | → redirect a `/welcome` | — |
| `/home` | Home | 🔒 |
| `/group` | → redirect a `/home` | — |
| `/group/:groupName` | Group | 🔒 |
| `/invitation` | Invitation | — |
| `/resetPassword` | ResetPswForm | — |
| `/verify-email` | VerifyEmail | — |
| `/profile/payment-links` | → `/home?settings=payments` | — |
| `/errore-token` · `/error` · `*` | ErrorPage | — |

**15 rotte**, di cui 6 sono redirect legacy e **2 sono protette** (`/home` e `/group/:groupName`).

La protezione passa da `RequireAuth`, che verifica solo la *presenza* del token in `localStorage` e non la sua
validità: la verifica avviene alla prima richiesta API, e un `401` fa tornare al welcome.

> Il gruppo si raggiunge **via URL** (`/group/:groupName`), non solo con lo stato interno: questo rende
> condivisibile il link a un gruppo e fa funzionare il tasto indietro del browser.

---

## Architettura

```
app/
├── main.jsx                      # createBrowserRouter, 15 rotte, React.lazy
├── routes/root.jsx               # layout: <Outlet/> + Footer + provider
│
├── context/                      # 2 provider, solo stato di UI e navigazione
│   ├── SettingsContext.jsx       #   modali aperte e tab attiva
│   └── GroupContext.jsx          #   helpers di navigazione verso il gruppo
│
├── hooks/
│   ├── useGroupPage.js           #   710 righe: stato + API della pagina gruppo
│   └── useSectionReveal.js       #   fade-in allo scroll con IntersectionObserver
│
├── utils/
│   ├── api.js                    #   sendRequest, authHeaders, cache, formatCurrency
│   ├── apiService.js             #   ~37 funzioni endpoint, auth e coffee
│   └── groupHelpers.js           #   helper dominio + icone + costanti di rotta
│
├── components/                   # 48 component
│   ├── group/                    #   pagina gruppo, header, info membri, turn indicator, stats
│   │   └── modals/               #     5 modali del gruppo
│   ├── home/                     #   dashboard, header, gruppi, pagamenti, statistiche, premi
│   │   └── modals/
│   ├── auth/ login/ signup/ resetPassword/   #   flussi di autenticazione
│   ├── settings/modals/          #   impostazioni utente e gruppo
│   ├── shared/                   #   ModalWrapper, ModalButtons, spinner, paginazione, rivelazione
│   ├── header/ footer/ splash/ invitation/ verify-email/ error/ buttons/
│   └── OAuthButtons.jsx
│
└── styles/                       # 14 file: app.css + 13 CSS Module
```

**Totale: 57 file `.js`/`.jsx`, 48 component, 8 pagine, ~11.500 righe** (6.100 JSX + 5.400 CSS).

### Lo stato

Non c'è uno store globale. I dati live in `useState` dentro i due orchestratori — `home.jsx` e
`useGroupPage.js` — mentre i due Context si occupano solo di stato di interfaccia (quale modale è aperta) e di
navigazione. È una scelta consapevole per un'app di queste dimensioni: introdurre Redux per due schermate
avrebbe aggiunto indirezione senza guadagno.

I pezzi presentazionali sono wrappati in `React.memo` (`GroupStatsSection` in particolare) e le sezioni si
rivelano allo scroll con un unico `IntersectionObserver` che si disconnette dopo il primo passaggio.

---

## Il design system

Il tema è definito una volta sola, in `app/styles/app.css`, con circa 50 custom property.

### Palette

Una scala `--coffee-0` → `--coffee-1000`, dal crema al marrone quasi nero, con `--coffee-600` come colore
del brand.

```css
--coffee-0:   #fffef8;    /* sfondo pagina */
--coffee-50:  #faf7f2;
--coffee-100: #f3ece4;
--coffee-200: #e8ddd2;
--coffee-300: #d8c5b3;
--coffee-400: #bfa48d;
--coffee-500: #9b7b62;
--coffee-600: #6f4e37;    /* brand, bottoni */
--coffee-700: #5a3e2d;
--coffee-800: #3e2c20;
--coffee-900: #2a1e16;
--coffee-1000:#17100c;
```

Superfici, testo, stati e ombre seguono la stessa logica:

```css
--text-primary: #2d1f17;   --success: #4caf50;
--text-secondary: #6f5a4c;  --error:   #d94b3d;
--text-soft: #9f8a7b;        --warning: #c98a2e;

--surface-card: rgba(255, 253, 249, 0.94);
--border-soft:  rgba(111, 78, 55, 0.14);

--shadow-sm: 0 8px 20px  rgba(62, 44, 32, 0.06);
--shadow-md: 0 14px 30px rgba(62, 44, 32, 0.1);
--shadow-lg: 0 24px 60px rgba(62, 44, 32, 0.14);
```

### Tipografia

- **UI**: Outfit, pesi 400 / 600 / 700 / 800
- **Wordmark** (splash e welcome): Oatlander, caricato come `CustomFont` da `/Oatlander.ttf` e applicato come
  testo su un percorso SVG ad arco
- Scala: h1 `2rem/800` · h2 `1.5rem/700` · h3 `1.25rem/600`

### Layout

- Breakpoint: **480 / 768 / 1024**
- Home e gruppo usano una griglia `2fr 1fr` fino a 1024 px, con sidebar `sticky` a `top: 76px`
- Card di sezione: `surface-card`, bordo da `--border-soft`, raggio `--radius-md` (20px), ombra `--shadow-md`

### Pattern di sfondo

Lo stesso tile (`/patterns/splash-tile.svg`) Compare su splash, welcome, home e gruppo, con
`background-size` fluid (`clamp(340px, 84vmin, 620px)`). È il dettaglio che dà coesione all'app senza
un'immagine pesante.

### Icone e avatar

Le icone sono **Font Awesome 7 solid** via cdnjs, con un helper `fa(name)` che restituisce
`fa-solid fa-<name>`. Gli avatar utente sono una scelta fra 5 preset (`default`, `cup`, `beans`, `steam`,
`office`); l'avatar del turno di chi tocca a lui ha `scale(1.12)` e un pulse.

### Documentazione del design system

`CONTEXT.md` è il **documento di riferimento** per il design system, le rotte, le convenzioni di codice e le
decisioni di prodotto — incluse quelle prese e poi abbandonate, con la ragione. Prima di modificare l'UI,
leggilo: evita di reintrodurre cose già scartate.

---

## Gestione dei dati

### Due strati HTTP, deliberatamente

**`sendRequest`** (`app/utils/api.js`) — il livello basso: `fetch` con header `Authorization: Bearer`, parse
della risposta, e **non interpreta lo status code**. Ritorna `{ ok, status, body }`.

**`apiService.js`** — una funzione per endpoint, circa 37 in tutto. Alcune ritornano l'oggetto sopra e lasciano
al componente il `switch (status)`; altre usano `request()`, che **lancia un errore** se la risposta non è OK.
La separazione è voluta: dove l'errore è un caso previsto (un 404 in una lista) è più comodo gestirlo in
locale; dove è un'eccezione vera, l'eccezione è più pulita.

```js
// caso previsto: il componente decide
const res = await getGroupsByUsername(username)
if (res.status === 401) logout()

// caso eccezionale: l'errore sale
await updatePreferences(payload)   // throw se !ok
```

### Cache in memoria con deduplicazione

`createCachedFetcher` mantiene una `Map` in RAM e, soprattutto, tiene traccia delle richieste **in volo**: se
due componenti chiedono gli stessi dati nello stesso momento, parte una sola richiesta e la seconda si aggancia
alla stessa promise. Le risposte di errore non vengono mai cachate. TTL di default 30 s.

```js
const fetchCached = useMemo(() => createCachedFetcher(), [])
const gruppi = await fetchCached(`gruppi_by_Id_${username}`, () => getGroupsByUsername(username))
```

Dopo un'azione che cambia i dati — registra pagamento, salta, paga per un amico — la cache viene invalidata
con `clearRequestCache('classifica_…')` e i dati ricaricati.

> **Nessun aggiornamento ottimistico**, per scelta: dopo ogni azione che chiude una modale, i dati vengono
> ricaricati dal server. Il vantaggio è che lo schermo non mente mai; il costo è una richiesta in più.

---

## Autenticazione

Token JWT e dati utente in `localStorage`, `Authorization: Bearer` su ogni richiesta.

```
localStorage.authToken   →  il JWT
localStorage.user        →  { username, email } in JSON
localStorage.pendingInvitation  →  invito in attesa se l'utente non è autenticato
```

Login, signup, OAuth (Google Identity Services e Microsoft), verifica email e reset password sono gestiti
nelle rispettive schermate. Il logout rimuove le chiavi e riporta a `/welcome`.

**Nessun refresh token**: esiste un solo JWT con scadenza a 24 ore, e non c'è un interceptor che intercetti il
`401` per rinnovarlo. La gestione del `401` è locale a ogni chiamata.

> ⚠️ **Sicurezza — da sapere prima di contribuire.** Il token in `localStorage` è leggibile da qualsiasi
> script della pagina: un XSS equivale a una sessione rubata. La correzione prevista è spostare il token in
> un cookie `HttpOnly` con `SameSite`, lato backend. È una delle attività della roadmap.

---

## Performance

| Tecnica | Dettaglio |
|---|---|
| **Code splitting per rotta** | `React.lazy` su ogni pagina: lo splash è l'unico pezzo nel bundle iniziale |
| **Code splitting per modale** | tutte e 8 le modali sono chunk separati, caricate solo quando servono |
| **Chunk vendor** | `manualChunks` isola React in un chunk separato, così le correzioni non invalidano tutto |
| **`React.memo`** | sui pezzi presentazionali che ricevono props stabili |
| **IntersectionObserver unico** | il reveal allo scroll non usa listener di scroll, e l'observer si disconnette |
| **rAF sullo scroll** | l'ombra dell'header sticky è aggiornata con `requestAnimationFrame` |
| **CSS Modules** | scoping nativo, nessuna perdita di specificità, CSS diviso per rotta |

La build di produzione produce **16 chunk JS e 8 chunk CSS**, di cui uno per pagina e uno per modale.

> **Prossimo passo naturale:** le dipendenze inutilizzate in `package.json` (`bootstrap`, `autoprefixer`,
> `cssnano`, `purgecss`, `dotenv`, `isbot`, `react-dotenv`, `react-env`, `@types/react-router-dom`)
> non sono importate da nessun file ma vengono comunque risolte dal bundler: rimuoverle riduce i tempi di
> installazione e il rischio di dipendenze vulnerabili.

---

## PWA e SEO

### Installabile

`vite-plugin-pwa` in modalità `autoUpdate` con Workbox: in produzione il service worker precacha tutti gli
asset con hash. Il `manifest.json` è scritto a mano (il plugin ha `manifest: false`) con icone incluso
l'insieme *maskable*, `display: standalone` e `theme_color` `#ffc107`.

In sviluppo il service worker viene **disregistrato**: evita cache fastidiose con l'HMR.

### Motori di ricerca

`index.html` è completo: Open Graph, Twitter card, meta description e parole chiave, link canonico, tre
blocchi **JSON-LD** (`SoftwareApplication`, `BreadcrumbList`, `WebSite`), `theme-color`, preconnect a cdnjs e
Google Fonts, più `robots.txt` e `sitemap.xml`.

---

## Getting Started

### Prerequisiti

- **Node.js 20** (richiesto dalla build Docker: `node:20-alpine`)
- **npm 10+**
- Il **backend PagaTu** in esecuzione, oppure un gateway raggiungibile

### 1. Clona e installa

```bash
git clone https://github.com/Lele97/PagaTu-Frontend.git
cd PagaTu-Frontend
npm install
```

### 2. Configura il gateway

Il frontend chiama **solo il gateway**, mai i microservizi direttamente. L'URL si configura con
`VITE_GATEWAY_SERVER_URL` e cambia in base al profilo:

| File | Variabile | Quando |
|---|---|---|
| `.env.test` | `http://localhost:8080` | sviluppo con stack locale |
| `.env.locale` | `http://api.pagatu.local` | sviluppo con cluster locale |
| `.env.production` | `https://api.pagatu.app` | produzione |

Per puntare altrove, crea un `.env.local` (gitignored):

```
VITE_GATEWAY_SERVER_URL=http://localhost:8080
```

Il dev server di Vite fa da **proxy** di `/api` verso il gateway, quindi in sviluppo non serve alcun CORS.

### 3. Avvia

```bash
npm run dev
```

L'app è su **http://localhost:8888**.

### Script disponibili

| Script | Cosa fa |
|---|---|
| `npm run dev` | dev server con HMR |
| `npm run dev:local` | dev server con il profilo `test` |
| `npm run build` | build di produzione |
| `npm run build:local` | build con profilo `test` |
| `npm run build:locale` | build con profilo `locale` |
| `npm run build:prod` | build con profilo `production` |
| `npm run preview` | anteprima della build |

---

## Build e deploy

### Docker

Il `Dockerfile` è **multi-stage**: build con `node:20-alpine`, runtime con `nginx:stable-alpine`.

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:locale

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t pagatu-fe .
docker run -p 8080:80 pagatu-fe
```

### nginx

La configurazione (`nginx.conf`) è pensata per una SPA e fa quattro cose:

- **Fallback SPA** — `try_files $uri /index.html`, così ogni rotta del router funziona al ricaricamento
- **gzip** su 8 tipi MIME, con soglia 1000 byte
- **Header di sicurezza** — `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`,
  `Referrer-Policy: strict-origin-when-cross-origin`
- **Cache degli asset statici** a 6 mesi con `access_log off`

### Script di rilascio

`script/buildone.sh` esegue la build **multi-architrice** (`linux/amd64` + `linux/arm64`) con `docker buildx`,
fa il push sul registry e poi il rollout del deployment Kubernetes.

```bash
bash script/buildone.sh
```

> Attenzione: l'immagine Docker è costruita con `npm run build:locale`, quindi punta a
> `http://api.pagatu.local`. Per un'immagine destinata a un altro ambiente, il profilo di build va cambiato.

---

## Limiti noti e roadmap

Elencati apertamente, così chi contribuisce sa dove intervenire.

| Area | Stato attuale | Direzione |
|---|---|---|
| **Test** | **nessun test**, nessun framework | Vitest + Testing Library: le prime PR possono partire da qui |
| **Linting** | nessuna configurazione ESLint o Prettier | ESLint + Prettier con regole condivise |
| **Refresh token** | un solo JWT da 24 h in `localStorage` | access + refresh con rotazione |
| **Sicurezza** | JWT in `localStorage` | cookie `HttpOnly` + `SameSite`, lato backend |
| **OAuth Microsoft** | flusso implicito con token nell'hash dell'URL | Authorization Code con PKCE |
| **Notifiche** | nessun canale push, l'utente deve ricaricare | SSE o WebSocket per il cambio turno |
| **Gestione 401** | locale a ogni chiamata, in 4 punti diversi | interceptor centralizzato, un unico logout |
| **CSS** | duplicato tra `home`, `group` e `shared`; due linguaggi visivi per le card | consolidare in `shared` |
| **i18n** | italiano hardcoded nei JSX | nessun problema finché l'app è solo italiana |
| **TypeScript** | il progetto è JavaScript puro | valutazione caso per caso, non di default |
| **Orari** | Lighthouse: Group 64, Home 69, Welcome 59 | rifare le misure ora che il bundle è alleggerito |

### Storico dei bug

Difetti e pulizierecentemente corretti, elencati perché indicano dove il codice è fragile:

- **«Reinvia verifica email» andava in ricorsione infinita** in `login-form.jsx` e `verify-email.jsx`: la
  funzione locale omonima della funzione importata la chiamava su sé stessa invece di chiamare l'API.
- **OAuth Microsoft non funzionava**: in `OAuthButtons.jsx` la funzione locale omonima dell'API veniva
  invocata al posto del client HTTP e finiva per navigare invece di fare la richiesta.
- **Reset password mostrava il messaggio di successo anche quando la richiesta falliva**: mancava un
  `return` dopo il controllo della risposta in `resetPsw-form.jsx`.
- **11 dipendenze mai importate** (`bootstrap`, `autoprefixer`, `cssnano`, `purgecss`, `dotenv`, `isbot`,
  `react-dotenv`, `react-env`, `@react-router/node`, `@react-router/serve`, `@types/react-router-dom`) e lo
  script `typecheck`, che chiamava `tsc` senza che TypeScript fosse installato.
- **`package-lock.json` era in `.gitignore`** mentre il `Dockerfile` usa `npm ci`: le build Docker non erano
  riproducibili. Ora il lock file è tracciato.

I primi tre avevano la stessa causa: **un nome locale che ombreggia un import**. Se aggiungi una funzione a un
componente, controlla che il nome non collida con nessuno degli import in testa al file.

> `npm install` ora riporta **0 vulnerabilità** su 388 pacchetti.

---

## Come contribuire

L'interfaccia è la parte più accogliente del progetto per chi arriva, e c'è un sacco di spazio. Ecco da dove
partire.

### Prima di tutto

Cerca le issue aperte e i `good first issue` — la sezione [Limiti noti](#limiti-noti-e-roadmap) qui sopra
elenca le candidate più interessanti. Se hai un'idea, aprila prima in una issue.

### Setup

```bash
git clone https://github.com/Lele97/PagaTu-Frontend.git
cd PagaTu-Frontend
npm install
cp .env.local .env    # con VITE_GATEWAY_SERVER_URL=http://localhost:8080
npm run dev
```

Prima di aprire una PR: `npm run build` deve completare senza errori.

### Le prime PR che consiglio

1. **Aggiungere Vitest e Testing Library.** Il progetto non ha un solo test. Configurare il runner e coprire
   `groupHelpers.js` (è pura logica, 114 righe, testabile senza rendering) è un ottimo primo passo.
2. **Aggiungere ESLint e Prettier.** Nessuna regola automatica al momento: ognuno scrive come vuole e le
   review diventano noiose. Allegandolo a Vitest si chiude il cerchio sulla qualità in una volta sola.
3. **Unificare il logout.** È implementato tre volte, in `home.jsx`, `useGroupPage.js` e `invitation.jsx`,
   con lo stesso codice. Vale anche per la normalizzazione degli errori, che è triplicata.

Poi, a seguire: il layout a due linguaggi visivi, la gestione centralizzata del `401`, il canale real-time
per il cambio turno.

### Come organizzare il codice

- **CSS Modules in `app/styles/`**, mai dentro `components/`. Un file per area schermata.
- **Icone**: `<i className="fa-solid fa-<nome>" />`. Mai Bootstrap Icons: sono già state rimosse di proposito.
- **Modali**: riusa sempre `ModalWrapper` + `ErrorSuccessMessages` + `ModalButtons`, invece di reinventarli.
- **Soldi**: sempre `formatCurrency` da `api.js` (`it-IT`, EUR). Non `toFixed` a mano.
- **Nessun aggiornamento ottimistico**: dopo un'azione che cambia i dati, invalida la cache e ricarica.
- **`React.memo`** sui pezzi presentazionali che ricevono props stabili.
- **CSS**: usa i token di `app.css`, non valori hex sciolti. I colori hardcoded residui sono debito noto.

### Cosa non reintrodurre

`CONTEXT.md` elenca le decisioni già prese e le cose abbandonate **con la ragione**. Prima di proporre un
tema, un tema switcher, un drawer, un selettore di gruppo o Tailwind, leggi quel file: sono state scartate
deliberatamente.

### Commit

Il versioning del progetto è semantico e calcolato dal messaggio di commit:

| Prefisso | Effetto |
|---|---|
| `BREAKING CHANGE:` o `breaking:` | MAJOR |
| `feat:` o `feature:` | MINOR |
| `fix:` o `bug:` | PATCH |

Conventional Commits, quindi: `feat(home): aggiungere il riquadro dei premi mensili`.

---

## Licenza

MIT — vedi [LICENSE](LICENSE).

```
Copyright (c) 2025-2026 Gabriele Grandinetti
```

---

## Progetti collegati

| Repository | Contenuto |
|---|---|
| **[PagaTu-Backend](https://github.com/Lele97/PagaTu-Backend)** | 5 microservizi Spring Boot · NATS · Transactional Outbox · Kubernetes |
| `PagaTu-Cluster` *(privato)* | K3s su Hetzner · Kustomize · cert-manager |

---

<p align="center">
  <sub>
    Fatto con ☕ da <a href="https://github.com/Lele97">Lele97</a>
  </sub>
</p>
