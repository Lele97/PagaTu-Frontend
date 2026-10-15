<p align="center">
  <img src="public/pagaTu.svg" alt="PagaTu logo" width="140" />
</p>

<h1 align="center">PagaTu — Frontend</h1>

<p align="center">
  <strong>Il caffè che unisce il team.</strong><br />
  Interfaccia React 18 per l'applicazione PagaTu: turni, gruppi, pagamenti, inviti e gamification.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Branch-main-2ea44f?logo=github&logoColor=white" alt="Branch: main">
  <img src="https://img.shields.io/badge/Status-Production%20Ready-6DB33F?logo=checkmarx&logoColor=white" alt="Status: Production Ready">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white" alt="React Router">
  <img src="https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?logo=pwa&logoColor=white" alt="PWA">
  <img src="https://img.shields.io/badge/Licenza-MIT-8A2BE2?style=flat-square" alt="Licenza">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/OAuth2-GitHub%20·%20Discord%20·%20Slack-181717?logo=github&logoColor=white" alt="OAuth2 Providers">
  <img src="https://img.shields.io/badge/Responsive-Mobile%20First-0078D4?logo=css3&logoColor=white" alt="Responsive">
  <img src="https://img.shields.io/badge/TypeScript-JSDoc-3178C6?logo=typescript&logoColor=white" alt="TypeScript">
</p>

---

## Indice

- [Panoramica](#panoramica)
- [Stack tecnologico](#stack-tecnologico)
- [Funzionalità principali](#funzionalità-principali)
- [Autenticazione OAuth2](#autenticazione-oauth2)
- [Getting Started](#getting-started)
- [Struttura del progetto](#struttura-del-progetto)
- [Script disponibili](#script-disponibili)
- [Variabili d'ambiente](#variabili-dambiente)
- [Deployment](#deployment)
- [Progetti collegati](#progetti-collegati)
- [Licenza](#licenza)

---

## Panoramica

Il frontend di **PagaTu** è una **Single Page Application** costruita con **React 18** e **React Router 7** (modalità framework). Gestisce l'interfaccia utente per:

- **Autenticazione**: login tradizionale, registrazione, reset password, verifica email
- **OAuth2**: login con GitHub, Discord, Slack
- **Gestione gruppi**: creazione, inviti, membri, regole
- **Turni e pagamenti**: visualizzazione turno corrente, registrazione pagamento, skip, paga per amico
- **Bilancio e statistiche**: quota equa, debiti pairwise, cronologia
- **Gamification**: karma, premi, classifiche
- **Profilo utente**: preferenze, notifiche, impostazioni

L'applicazione è **responsive (mobile-first)**, installabile come **PWA** e comunica con il backend tramite API REST protette da **JWT**.

---

## Stack tecnologico

| Categoria | Tecnologie |
|---|---|
| **Core** | React 18.2 · React Router 7.5 (framework mode) |
| **Build** | Vite 6 · ES modules |
| **Styling** | Bootstrap 5.3 · Bootstrap Icons · CSS Modules |
| **Stato** | React hooks (`useState`, `useEffect`, `useContext`) + `localStorage` |
| **HTTP** | `fetch` nativo con wrapper custom |
| **Routing** | React Router 7 (file-based routes, SSR-ready) |
| **PWA** | Vite PWA plugin · Service Worker · Web App Manifest |
| **Qualità** | ESLint · Prettier · JSDoc per documentazione componenti |

---

## Funzionalità principali

### Autenticazione completa
- **Login/password** con validazione client-side e server-side
- **Registrazione** con verifica email via token
- **Reset password** con token a 30 minuti
- **OAuth2** con GitHub, Discord, Slack (authorization code flow)

### Gestione gruppi
- Creazione gruppo con regole personalizzabili (skip/giro, limiti mensili, paga-per)
- Sistema inviti con link univoci e scadenza
- Ruoli: **admin** e **membro**
- Visualizzazione membri con stato turno e karma

### Turni e pagamenti
- Turno corrente evidenziato con animazione
- Registrazione pagamento con importo e note
- **Skip turno** (con limiti per giro e mensili)
- **Paga per amico** (genera debito pairwise nel bilancio)

### Bilancio trasparente
- Quota equa calcolata automaticamente (totale / membri)
- Delta per membro (pagato vs quota)
- **Debiti pairwise** con link Satispay/Revolut per saldo immediato

### Gamification
- **Coffee Karma** (0–100) aggiornato ad ogni azione
- **7 premi** (bronzo, argento, oro) con condizioni diverse
- Classifiche per gruppo e globali

### PWA & UX
- Installabile su desktop e mobile
- Funzionamento offline parziale (cache statica)
- Notifiche push (pianificate)
- Tema coffee consistente in tutta l'app

---

## Autenticazione OAuth2

Il frontend implementa l'**Authorization Code Flow** per tre provider:

| Provider | Scope richiesti | Endpoint backend |
|---|---|---|
| **GitHub** | `read:user user:email` | `POST /api/auth/oauth/github` |
| **Discord** | `identify email` | `POST /api/auth/oauth/discord` |
| **Slack** | `identity:read users:read users:read.email` | `POST /api/auth/oauth/slack` |

### Flusso

1. L'utente clicca un pulsante OAuth → redirect al provider
2. Provider ritorna su `/auth/callback?code=...&state=provider`
3. Frontend invia il `code` al backend (`/api/auth/oauth/{provider}`)
4. Backend scambia il code per access token, legge profilo/email
5. Backend restituisce JWT → frontend salva in `localStorage`
6. Redirect a `/home` (o a invito pendente)

### Configurazione

Le credenziali client-side (solo `client_id` e `redirect_uri`) sono in `.env`:

```env
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:8888/auth/callback/github

VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:8888/auth/callback/discord

VITE_SLACK_CLIENT_ID=your_slack_client_id
VITE_SLACK_REDIRECT_URI=http://localhost:8888/auth/callback/slack
```

> ⚠️ **Sicurezza**: `client_secret` **non** è mai nel frontend. Lo scambio code→token avviene solo nel backend.

---

## Getting Started

### Prerequisiti
- **Node.js 18+** (consigliato 20 LTS)
- **npm 9+** (o pnpm/yarn)
- Backend in esecuzione (vedi [PagaTu-Backend](https://github.com/Lele97/PagaTu-Backend))

### Installazione

```bash
git clone https://github.com/Lele97/PagaTu-Frontend.git
cd PagaTu-Frontend
npm install
cp .env.example .env   # vedi sezione Variabili d'ambiente
```

### Sviluppo

```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173` (o porta configurata in `vite.config.js`).

> **Nota**: il backend deve essere raggiungibile all'URL specificato in `VITE_NGROK_SERVER_URL` (o URL diretto in produzione).

### Build produzione

```bash
npm run build
```

L'output è in `dist/` (static assets + server bundle per SSR).

---

## Struttura del progetto

```
PagaTu-Frontend/
├── public/                    # Asset statici serviti direttamente
│   ├── pagaTu.svg             # Logo
│   └── manifest.json          # PWA manifest
├── app/                       # Codice sorgente principale
│   ├── main.jsx               # Entry point + router config
│   ├── routes/                # Route React Router (file-based)
│   │   ├── root.jsx           # Layout radice (outlet + footer)
│   │   ├── auth/              # Login, signup, OAuth callback, reset password
│   │   ├── home/              # Dashboard principale
│   │   ├── group/             # Gestione gruppi
│   │   ├── invitation/        # Accettazione/rifiuto inviti
│   │   ├── register/          # Registrazione
│   │   ├── resetPassword/     # Forgot/reset password
│   │   └── error/             # Error boundary pages
│   ├── components/            # Componenti riutilizzabili
│   │   ├── OAuthButtons.jsx   # Pulsanti login OAuth2
│   │   ├── header.jsx         # Header con navigazione
│   │   ├── footer.jsx         # Footer
│   │   └── BuyMeACoffeeButton.jsx
│   ├── styles/                # CSS Modules per scoping locale
│   │   ├── auth.module.css    # Stili login/signup/OAuth
│   │   ├── app.css            # Variabili CSS globali + reset
│   │   └── *.module.css       # Uno per route/componente
│   └── utils/                 # Helper (api client, form validation, etc.)
├── .env                       # Variabili d'ambiente (NON committare)
├── .env.example               # Template per .env
├── package.json
├── vite.config.js             # Config Vite + PWA + alias
├── Dockerfile                 # Multi-stage build per produzione
└── README.md                  # Questo file
```

### Convenzioni

- **Route**: una cartella per route, `route.jsx` come entry, componenti in `components/` locale se specifici
- **Stili**: CSS Modules (`.module.css`) per evitare collisioni, variabili CSS in `app.css`
- **Componenti**: functional components + hooks, JSDoc per props e logica complessa
- **Alias**: `~/` mappa su `app/` (es. `import styles from '~/styles/auth.module.css'`)

---

## Script disponibili

| Comando | Descrizione |
|---|---|
| `npm run dev` | Avvia server dev Vite con HMR |
| `npm run build` | Build produzione in `dist/` |
| `npm run preview` | Anteprima build produzione locale |
| `npm run typecheck` | Controllo tipi TypeScript (solo JSDoc) |

---

## Variabili d'ambiente

Crea un file `.env` nella root (non committato):

```env
# URL del backend (ngrok in dev, dominio in prod)
VITE_NGROK_SERVER_URL=https://your-backend.ngrok-free.app

# OAuth2 GitHub
VITE_GITHUB_CLIENT_ID=your_github_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:8888/auth/callback/github

# OAuth2 Discord
VITE_DISCORD_CLIENT_ID=your_discord_client_id
VITE_DISCORD_REDIRECT_URI=http://localhost:8888/auth/callback/discord

# OAuth2 Slack
VITE_SLACK_CLIENT_ID=your_slack_client_id
VITE_SLACK_REDIRECT_URI=http://localhost:8888/auth/callback/slack
```

> In produzione, `VITE_NGROK_SERVER_URL` diventa l'URL pubblico del backend (es. `https://api.pagatu.app`).

---

## Deployment

### Docker (consigliato)

```bash
# Build immagine
docker build -t pagatu-frontend .

# Run
docker run -p 3000:3000 --env-file .env pagatu-frontend
```

Il `Dockerfile` usa **multi-stage build**: stage `builder` con Node per `npm run build`, stage `runtime` con `nginx` per servire gli static file e fare da reverse proxy per le API (se SSR abilitato).

### Piattaforme supportate
- **Kubernetes** (tramite `PagaTu-Cluster` con Kustomize)
- **Docker Compose** (stack completo con backend)
- **Cloud Run / ECS / Fly.io / Railway** (qualsiasi platform Docker)

---

## Progetti collegati

| Repository | Descrizione |
|---|---|
| **[PagaTu-Backend](https://github.com/Lele97/PagaTu-Backend)** | 5 microservizi Spring Boot · NATS · Transactional Outbox · OAuth2 |
| **[PagaTu-Cluster](https://github.com/Lele97/PagaTu-Cluster)** *(privato)* | K3s su Hetzner · Kustomize · cert-manager · Registry privato |

---

## Licenza

MIT — vedi [LICENSE](LICENSE).

```
Copyright (c) 2025-2026 Gabriele Grandinetti
```

---

<p align="center">
  <sub>
    Fatto con ☕ da <a href="https://github.com/Lele97">Lele97</a>
  </sub>
</p>