# Documento di revisione delle modifiche grafiche in riferimento al documento "UI_REDESIGN.md"

***

# Padina di welcome "/welcome"

***

- > Per la pagina di welcome ovvero la pagina dopo lo spalsh screen
  > la grafica dovra essere organizzata con il logo originale e la scritta originale in alto a sinistra
  > mentre le altre sezioni si alterneranno tra destra e sinistra ovviamente con uno spazio tra le sezioni.
  > la form di login e register dovra essere accanto alla seconda div
  > le altre section che seguiranno dovranno avere lo stesso stile spiegando come funziona l'applicazione
  > l'importante è aggiungere dei contenuti validi

- > lo sondo non deve essere vuoto ovviamente seguendo le palette di colori dell applicativo però deve avere oltre al
  colore anche delle immaggini anche ripetute che rimandal al caffe.
  > perchè ci sarà la possibilità di cambiare tema quindi oltre alle palette di colori cambiera anche lo sfondo.
  > lo sfondo per come lo penso conterrà delle grafiche dei loghi da sottofondo per esempio tazze di caffè espresso,
  cappuccini , latte e caffe, latte e ciccolato, starbucs etc etc etc.

- > animazioni e transizioni ma molto molto light

# Pagina di home "/home"

***

- > Per la pagina home il tuo prospetto va bene però ci sono delle cose da cambiare:
  > lo sfondo di cui abbiamo parlate nella prima sezione
  > le sezioni vanno bene però devono occupare più spazio in altezza
  > tra una sezione e laltra vorrei avere tranzizione o animazione ligth e ci dovra essere il separatore:

  ```
  <div className={styles.separator}>
  <div className={styles.separatorLeft}></div>
  <img src="/coffee-medium-svgrepo-com.svg" alt="Coffee icon separator"/>
  <div className={styles.separatorRight}></div>
  </div>
  ```
- > il cambio del tema dovra essere nelle impostazioni dell utente
  > nella home ci dovra essere una sezione Award che conterra tutti i badge che l'utente si è guadagnato sotto forma di
  stendardi
  > non ci deve essere la linea tra header e pagina
  > il logo va bene nella posizione stavo penzando senza la scritta,ovviamente il logo originale,
  > nella parte header utente vabbene però ci deve essere anche il logout
  > non mi convince questa scritta nella home "Il caffè che unisce il team
  Crea gruppi e gestisci i turni in modo semplice e piacevole"
  > l'header poi dovra rimanere fisso duranete lo scrolling

# Pagina di group "/group"

***

- > stesse regole per l'header in più avremo il settagio per il gruppo
  >  > tra una sezione e laltra vorrei avere tranzizione o animazione ligth e ci dovra essere il separatore:

  ```
  <div className={styles.separator}>
  <div className={styles.separatorLeft}></div>
  <img src="/coffee-medium-svgrepo-com.svg" alt="Coffee icon separator"/>
  <div className={styles.separatorRight}></div>
  </div>
  ```
- > il tasto indietro dovrà essere un button
  > la sezione statistiche va bene

>

# Award

***

- > per la parte Award stavo pensando a delle grafiche tipo trofe o stendardi di colore oro argento e bronzo con
  gradiente comè è ora la div

 ```
   <div className={expansionStyles.kingBanner}>
                                <i className="bi bi-cup-hot-fill" /> Caffè-king del mese: <strong>{gamification.coffeeKingOfMonth}</strong>
                            </div>
 ```

- > dove non ci dovra essere il banner ma solo gli stendardi presentati in modo molto bello
  > si avra la sezione award del gruppo nella schermata gruppo e la sezione award del singolo utente nella scheramata hone