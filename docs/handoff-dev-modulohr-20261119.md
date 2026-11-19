# Detelder ModuloHR — Handoff DEV (19/11/2026)

**Stato:** refactoring funzionale presentabile su Vercel/Aiven **TEST**; non pronto per OVH o comunicazioni ministeriali reali. Questo file va letto insieme a [modulo-hr-regole.md](./modulo-hr-regole.md), che contiene la matrice delle regole HR-01..HR-12.

## 1. Branch, ambienti e confini

| | Frontend | Backend |
| --- | --- | --- |
| Repo | `MarsOTA/detelder-fe` | `MarsOTA/detelder-be` |
| Branch | `refactor/modulohr-20261117` | `refactor/modulohr-regole-20261117` |
| Codice verificato (19/11) | `b4291fbf0a8b3d5184282eaac675a2a996c5aedb` | `b8c312a9746149a6fa9af064adb3e96834b035d4` |
| Preview Vercel | `detelder-fe-git-refactor-b8af07-otareposito-gmailcoms-projects.vercel.app` | `detelder-be-git-refactor-1079de-otareposito-gmailcoms-projects.vercel.app` |

FE -> BE -> **Aiven MySQL TEST**. Le variabili CORS e API sono specializzate per i rispettivi branch. La protezione Vercel ha un'eccezione **solo sull'alias BE di test** per consentire al browser le richieste CORS: rimuovere/irrobustire l'eccezione al termine del collaudo.

**NON modificare** OVH di produzione, né `detelder-hr-test.vercel.app` o i branch principali senza collaudo completo e autorizzazione.

## 2. Architettura di responsabilità

### FE — dati, UI e regole

- `src/pages/admin/moduloHR.tsx`: matrice Admin, analisi turni/contratti e assegnazione pratica.
- `src/pages/admin/hrCoda.tsx`, `hrRuoli.tsx`: coda HR, gestione ruoli.
- `src/pages/admin/dettaglioOperatore.tsx`: scheda/contratti e orchestrazione; **componente ancora esteso**, prossimo candidato all'estrazione.
- `src/pages/components/ContrattoAttivoHR.tsx`, `AzioniHRIntermittenti.tsx`, `ArchivioContrattiHR.tsx`: documenti, comunicazioni e archivio.
- `src/hooks/usePraticaOperatoreHR.ts`: selezione e presa in carico.
- `src/utils/hrValutazione.ts`, `hrRegolarizzazione.ts`, `hrContrattoRestrittivo.ts`, `hrCompliance.ts`: regole turni/contratti/prerequisiti.
- `src/utils/intermittentiPrestazioni.ts`, `intermittentiXml.ts`, `intermittentiPdf.ts`: copertura delle prestazioni, XML e PDF.
- `src/utils/hrWorkflow.ts`, `chiamateHR.ts`: client API; `hrAccessPolicy.ts`: abilitazioni UI.

### BE — fonte autorevole e persistenza

- `middleware/hrAccess.js`: riconosce la sessione e il ruolo effettivo; **non fidarsi del localStorage**.
- `services/hrPermissions.js`: `ADMIN_HR` unisce `ADMIN` e `HR`, senza estendere i due ruoli separati.
- `routes/api/hrWorkflow.js`: assegnazione, coda, presa in carico, periodi, codice UNILAV, ruoli, log/stati.
- `routes/api/chiamateIntermittentiHR.js`: chiamate figlie, XML archiviato, simulazioni/annullamenti, configurazione datore.
- `services/hrCallCoverage.js`: copertura puntuale ricavata dalle righe XML, non dalle sole date esterne del record.

**Tabelle:** `hr_ruoli_assegnati`, `hr_pratiche`, `hr_pratiche_log`, `hr_codici_comunicazione`, `chiamata_intermit_hr`, `chiamata_intermit_hr_annullamenti_test`, `configurazione_datore_intermit_hr`; referenze legacy a `dipendenti`, `sessione`, `contratto`, `turnoOperatore`.

## 3. Ruoli e decisioni

| Operazione | ADMIN | HR | ADMIN_HR |
| --- | :---: | :---: | :---: |
| Assegna contratto/pratica, gestisce ruoli HR | Sì | No | Sì |
| Prende in carico, genera documenti nel flusso HR | No | Sì | Sì |
| Gestisce codice comunicazione e chiamate intermittenti | No | Sì | Sì |
| Esegue simulazioni di invio/annullamento | No | Sì | Sì |
| Legge archivio chiamate | Sì | Sì | Sì |

**Regole UX recentemente corrette:** `ADMIN_HR` deve poter preparare/eseguire chiamate anche dalla scheda `/admin/dettaglio-operatore/:id`; il normale ADMIN resta in sola lettura. Dopo la **prima** assegnazione (pratica non `COMPLETATO`), la CTA è **Apri pratica HR**, non **Assegna nuovo contratto**.

## 4. Flusso e matrice casi

1. **Turno non coperto, nessun contratto:** Admin sceglie `tipologia`, `datore`, `dataInizio/dataFine`, crea pratica `DA_ELABORARE` con log; contratto non generato automaticamente.
2. **Pratica aperta:** pulsante `Apri pratica HR`; non invitare a fare un'altra assegnazione.
3. **Contratto in vigore:** blocco della nuova assegnazione secondo la *policy Detelder*, non presentarla come regola generale di legge.
4. **Scaduto / turno oltre scadenza:** segnala la criticità; nuovo contratto nel periodo ammesso, senza sostituire la cronologia.
5. **HR prende in carico:** `IN_LAVORAZIONE`, verifica anagrafica, genera contratto, carica firmato e UNILAV (quando richiesto), inserisce codice comunicazione.
6. **Contratto CHIAMATA:** le chiamate figlie coprono le singole giornate/turni previsti. Max **10 prestazioni in un XML**; giornate consecutive raggruppabili, giornate isolate in righe separate; un giorno usa inizio=fine anche nel PDF; turni a cavallo della mezzanotte richiedono copertura completa.
7. **Simulazione / annullamento:** persistono XML e archivio Aiven, ma non si inviano email/PEC. Una chiamata annullata non deve più coprire i turni.
8. **Stato pratica e regolarità:** non confondere stato `hr_pratiche`, contratto padre, chiamate figlie e copertura dei turni. `GET /hr-workflow/pratiche` esegue anche riconciliazione automatica e scritture di stato/log; va revisionato per idempotenza/efficienza.

**Stati pratica:** `DA_ELABORARE`, `IN_LAVORAZIONE`, `DOCUMENTI_MANCANTI`, `COMPLETATO`. **Stati chiamata:** `BOZZA`, `PEC_PREPARATA`, `INVIATA`. Nel test `INVIATA + SIMULAZIONE TEST` **NON** è trasmissione effettiva.

## 5. API essenziali

| API | Utilizzo |
| --- | --- |
| `GET /hr-workflow/me` | ruolo verificato dal server |
| `GET /hr-workflow/pratiche` | elenco e riconciliazione stati |
| `POST /hr-workflow/pratiche` | assegnazione ADMIN |
| `POST /hr-workflow/pratiche/:id/prendi-in-carico` | lavorazione HR |
| `GET /hr-workflow/pratiche/:id/log` | log della pratica |
| `PATCH /hr-workflow/pratiche/:id/periodo` | variazione periodo non completato |
| `PATCH /hr-workflow/pratiche/:id/stato` | cambi stato con controlli |
| `GET/PUT /hr-workflow/pratiche/:id/codice-comunicazione` | codice UNILAV |
| `POST /hr-workflow/pratiche/:id/attivita` | audit generazione/caricamenti |
| `GET /hr-workflow/utenti`, `PUT /hr-workflow/utenti/:id/ruolo` | gestione autorizzazioni |
| `GET/POST /chiamate-hr/:idOperatore/:idContratto` | archivio e bozza |
| `POST /chiamate-hr/:idOperatore/:idContratto/:idChiamata/simula-invio` | invio solo dimostrativo |
| `POST /chiamate-hr/:idOperatore/:idContratto/:idChiamata/simula-annullamento` | annullamento solo dimostrativo |

## 6. Test esistenti e limiti

- FE Chromium/CI ultimo commit: [#44457446493](https://github.com/MarsOTA/detelder-fe/actions/runs/44457446493) — **success**, include ruoli, Admin-HR e prima assegnazione.
- BE suite unit/HTTP isolata: [#44454554058](https://github.com/MarsOTA/detelder-be/actions/runs/44454554058) — **success**.
- Full-stack FE+BE+MySQL usa fixture CI, non Aiven: [#44444143804](https://github.com/MarsOTA/detelder-be/actions/runs/44444143804) — **success su commit precedente**.
- Preflight CORS esterno: [#44454554104](https://github.com/MarsOTA/detelder-be/actions/runs/44454554104) — **success**.
- Il committente ha verificato **contratti, PDF e chiamate** nell'anteprima Vercel/Aiven. Non equivale a collaudo ministeriale.

## 7. Cosa manca prima di parlare di produzione (ordine di priorità)

**P0**
1. Implementare **invii REALI autorizzati, annullamenti e ricevute autentiche** con correlazione, verifica dell'esito e conservazione. Le attuali ricevute sono soltanto DEMO.
2. Allineare il controllo `PATCH /pratiche/:id/stato` con quello del ricalcolo automatico per annullamenti, simulazioni e stato `COMPLETATO`; impedire stati ingannevoli.
3. Validare il tracciato XML e il modello PDF contro la versione ministeriale ufficiale corrente.
4. Sicurezza e migrazioni: testare endpoint legacy; rimuovere/restringere l'eccezione pubblica sul preview backend alla fine dei test; DDL/schema attualmente inizializzati anche su prima richiesta HR in `middleware/hrAccess.js`, da spostare a migrazioni controllate.
5. Eseguire un collaudo end-to-end sull'**esatto commit candidate al rilascio** e definire rollback.

**P1**
6. Completare estrazione del monolite `dettaglioOperatore.tsx`.
7. Spostare gli effetti collaterali dal `GET /pratiche` in un servizio/evento esplicito.
8. Sostituire i controlli ambientali basati su suffisso `DB_HOST` con impostazioni di ambiente robuste.
9. Rendere riproducibile PDF template e dipendenza `pdf-lib` (attualmente importata da CDN nel browser).
10. Aggiungere casi di concorrenza, 11+ giornate, turni notturni, PEC fallita e sessioni scadute.

## 8. Demo consigliata al DEV (10 minuti)

Admin assegna una pratica a un nuovo operatore -> mostra **Apri pratica HR** -> HR apre e genera contratto -> carica UNILAV di test -> prepara due giorni non consecutivi in XML/PDF -> simula invio -> visualizza archivio e annullamento DEMO -> torna in Admin come **ADMIN_HR** e dimostra i comandi attivi -> chiudi evidenziando **assenza di PEC/reale ricevuta**.

**Vincolo di collaborazione:** modifiche solo sui branch di refactoring e Aiven test. Nessun merge/main, alias stabile o OVH senza collaudo completo e specifica approvazione.