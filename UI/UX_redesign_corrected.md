# Documento di Revisione UI/UX di PagaTu (Versione Corrett a e Strutturata)

**Fonte originale:** `UX_redesign_after_revision.md` (scritto dall'utente)  
**Data revisione:** 2026-06-29  
**Scopo:** Rendere il documento chiaro, corretto, fattibile e pronto per l'implementazione.

---

## 1. Pagina Welcome (`/welcome`)

### Richieste
- Logo originale + scritta originale in alto a sinistra.
- Le sezioni si alternano destra/sinistra con spazio tra di loro.
- La form di login/register deve stare accanto alla seconda sezione.
- Le sezioni successive devono avere lo stesso stile e spiegare come funziona l'applicazione.
- Aggiungere contenuti validi e utili.
- Sfondo con grafiche ripetute di caffè (tazze, espresso, cappuccino, latte, Starbucks ecc.) che cambiano in base al tema.
- Animazioni e transizioni molto leggere.

### Note di implementazione
- File principali: `app/components/auth/AuthLanding.jsx`, `app/styles/signup.module.css`, `app/styles/logo.module.css`.
- Lo sfondo va gestito in `themes.css` (aggiungere regole `background-image` diverse per ogni `[data-theme]`).
- Riorganizzare il layout della heroSection per avere logo a sinistra + form a destra della seconda div.
- Mantenere il tab login/register.

**Priorità:** Media (dopo Header e Home).

---

## 2. Pagina Home (`/home`)

### Richieste
- Usare lo sfondo tematico descritto sopra.
- Le sezioni devono occupare più spazio in altezza.
- Tra una sezione e l'altra: transizioni/animazioni leggere + il separatore esistente:
  ```html
  <div className={styles.separator}>
    <div className={styles.separatorLeft}></div>
    <img src="/coffee-medium-svgrepo-com.svg" alt="Coffee icon separator"/>
    <div className={styles.separatorRight}></div>
  </div>
  ```
- Il cambio tema deve stare nelle impostazioni utente (non nella top bar).
- Aggiungere una sezione **Award** con badge/stendardi (oro, argento, bronzo) che l'utente si è guadagnato.
- Non ci deve essere la linea/bordo tra header e contenuto della pagina.
- Logo nell'header: versione originale senza testo.
- Header utente: mantenere avatar + aggiungere logout visibile.
- Rimuovere o cambiare la scritta "Il caffè che unisce il team...".
- L'header deve rimanere fisso durante lo scrolling (sticky/fixed).

### Note di implementazione
- File: `app/components/header/header.jsx` + `header.module.css`
- `app/components/home/home.jsx` + `homeHeader.jsx` + `home.module.css`
- Nuova sezione Award da creare (riutilizzare logica da `GroupStatsSection` + `expansion.module.css`).
- Header: aggiungere `position: sticky; top: 0;` e z-index adeguato.
- Sfondo: estendere le regole in `themes.css` + `app.css`.

**Priorità:** Alta (primo passo dopo correzione documento).

---

## 3. Pagina Group (`/group`)

### Richieste
- Stesse regole header della Home + pulsante impostazioni gruppo.
- Tra le sezioni: transizioni leggere + separatore (stesso di sopra).
- Il tasto indietro deve essere un vero `<button>`.
- La sezione statistiche va bene così com'è.

### Note di implementazione
- File: `app/components/group/group.jsx`, `groupHeader.jsx`, `GroupStatsSection.jsx`
- Riutilizzare il separatore esistente.
- Aggiungere sezione Award del gruppo (stendardi del gruppo).

**Priorità:** Media.

---

## 4. Sezione Award (trasversale)

### Richieste
- Grafiche tipo trofei o stendardi di colore oro, argento e bronzo con gradiente.
- Non solo il banner attuale, ma stendardi presentati in modo bello.
- Sezione Award del gruppo nella schermata `/group`.
- Sezione Award del singolo utente nella schermata `/home`.

### Note di implementazione
- Riutilizzare e estendere `expansion.module.css` (attualmente ha `.kingBanner` e `.badges`).
- Creare componenti riutilizzabili tipo `<AwardBanner level="gold|silver|bronze" />`.
- Dati: attualmente arrivano da `/api/coffee/gamification/gruppo`. Per l'utente in Home serve estensione o nuova chiamata.

**Priorità:** Alta (da fare insieme a Home e Group).

---

## Priorità di Implementazione Consigliate

1. **Header** (sticky, logo pulito, logout) — impatto visivo immediato.
2. **Home** (sfondo tematico + Award skeleton + sezioni alte + separatori).
3. **Group** (Award gruppo + back button + separatori).
4. **Welcome** (layout alternato + sfondi).
5. **Pulizia e rifiniture** (transizioni, coerenza temi, mobile).

---

## Azioni Immediate

- Creare questo documento corretto.
- Iniziare con modifiche all'Header (rendere sticky + logo senza testo).
- Poi lavorare su sfondo e Award in Home.

Il documento originale `UX_redesign_after_revision.md` è stato analizzato e questa è la versione corretta e actionable.