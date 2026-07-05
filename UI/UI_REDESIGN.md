# Piano di Ridisegno UI/UX di PagaTu

> **Domanda dell'utente**: "vorrei capire a cosa servirà il documento :: grok-design-doc-ee8aab5a.md, spiegami i passi successivi"

## A cosa serve il documento `grok-design-doc-ee8aab5a.md`?

Quello è il **documento tecnico completo** generato automaticamente dal comando `/design`.

Serve come:
- **Specifica di design autorevole** — descrive esattamente quali problemi ha l'interfaccia attuale e come risolverli.
- **Piano di implementazione** — contiene un PR Plan diviso in **7 passi ordinati**, ognuno indipendente e reviewable.
- **Memoria delle decisioni** — include le analisi, i diagrammi, le alternative considerate e le tue scelte su alcune domande aperte.

**Importante**: è scritto in stile "senior engineer" (molto dettagliato, con riferimenti a file e righe di codice). Non è pensato per essere letto tutto ogni giorno.

Noi useremo principalmente **questo file** (`UI_REDESIGN.md`) per orientarci. Il documento tecnico originale rimarrà come riferimento profondo quando serve.

## Problemi attuali dell'UI/UX (riassunti)

Dal documento tecnico emergono questi punti principali (tutti verificati sul codice reale):

- **Duplicazione forte di CSS** (home.module.css, group.module.css, error, auth, shared...). Stessi componenti (separator, card, button, modal, empty state) sono riscritti in più file.
- **Navigazione fragile** — per passare da Home a un Group si usa solo `localStorage` + `navigate('/group')`. Se refreshi la pagina o usi link diretti può rompersi.
- **Esperienza "turno di caffè" poco chiara** — i pulsanti grossi "Registra / Salta / Paga per amico" sono l'unica indicazione visiva.
- **Mobile e responsive parziali** — le media query esistono ma sono sparse e i layout sono ancora desktop-first.
- **Componenti inconsistenti** — Loading, Error, pulsanti, card sono implementati in modi diversi.
- **README sbagliato** — ancora parla di Tailwind che non esiste nel progetto.

## Visione del nuovo design

Vogliamo un redesign **evolutivo** (non una riscrittura da zero):
- Manteniamo l'anima "caffè" (colori, icone, separatori con la tazza, avatar con la lettera + icona, tagline "Il caffè che unisce il team").
- Manteniamo tutto il funzionamento attuale (myTurn, classifica, regole gruppo, bilanci, inviti...).
- Introduciamo:
  - Un piccolo sistema di componenti riutilizzabili (Button, Card, TurnIndicator, ecc.)
  - Forte riduzione della duplicazione CSS
  - Navigazione più robusta (Context + Router + localStorage solo come fallback)
  - Indicatore visivo del turno (coda di avatar)
  - Esperienza mobile-first con bottom sheet
  - Miglior accessibilità e polish

## Decisioni già prese dall'utente

Durante la revisione del design hai scelto:
- Group switcher nell'header → **solo quando l'utente ha più di un gruppo**
- Visuale del Turn → **coda orizzontale di avatar caffè** (come raccomandato)
- Aggiornamenti ottimistici → **no**, manteniamo il pattern attuale (refresh dopo la chiusura del modale)
- Aumento bundle → **massimo +10%**, da misurare
- Paginazione → "Other" (decideremo dopo, per ora non la tocchiamo)

Queste decisioni sono già registrate nel documento tecnico.

## I prossimi passi: i 7 PR

Ecco il piano concreto (dal documento tecnico):

| # | Titolo PR | Cosa fa in pratica | File principali | Dipende da |
|---|-----------|--------------------|------------------|------------|
| 1 | Introduce design tokens + shared UI primitives | Crea Button, Card, Separator, EmptyState, TurnIndicator + token in app.css | `app.css`, nuovi file in `shared/ui/`, aggiornamento shared | — |
| 2 | Consolidate duplicated styles | Sposta le parti duplicate in shared.module.css e pulisce i file | tutti i *.module.css + componenti che li importano | PR 1 |
| 3 | Add GroupContext + improve navigation | Rende più robusta la navigazione tra gruppi (Context + Router state) | `context/`, `header/`, `home/`, `group/`, `main.jsx` | — (parallelo ok) |
| 4 | Implement visual TurnIndicator | Aggiunge la coda visiva degli avatar del turno | `group/TurnIndicator.jsx`, `paymentActions.jsx`, `group.jsx` | PR 1 + 3 |
| 5 | Mobile-first + bottom sheets + measurement | Rende tutto bello su mobile e aggiunge misurazioni | header, home, group, Drawer, stili | PR 1-2 |
| 6 | Enhance GroupStats + data viz + toasts | Migliora statistiche e feedback (barre CSS, toast centralizzati) | `GroupStatsSection.jsx` + nuovo Toast | PR 1 |
| 7 | A11y + cleanup + theming + README + dead code | Accessibilità, pulizia codice morto (`GroupExpansionSections.jsx`), fix README | tutto il resto | Tutti |

**Ordine consigliato**: 1 → 2 → 3 → 4 → 5 → 6 → 7

Ogni PR è pensato per essere piccolo, portare valore da solo e non rompere l'app esistente (coesistenza vecchio/nuovo codice).

## Come iniziare

La raccomandazione forte è **iniziare dal PR #1**.

PR #1 crea le fondamenta (i componenti base) che useremo in tutti gli altri PR. È il rischio più basso e dà subito benefici.

## Come verificare i progressi

- `npm run dev`
- Cambia i 4 temi (classic/espresso/latte/office)
- Prova su schermi piccoli e grandi
- Controlla che i flussi principali (crea gruppo, entra in gruppo, registra/salta pagamento) continuino a funzionare
- Durante i primi PR le cose vecchie devono ancora funzionare (non cancelliamo nulla subito)

## Riferimenti

- Documento tecnico completo: `C:\tmp\grok-design-doc-ee8aab5a.md`
- Codice attuale: cartella `app/`
- Questo file (`UI_REDESIGN.md`) è la tua mappa di orientamento.

Vuoi che iniziamo con la creazione dei primi componenti del PR #1, o preferisci prima approfondire/ modificare qualcosa nel piano?