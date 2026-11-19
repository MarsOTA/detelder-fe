# Detelder · ModuloHR — regole e confini

> Inventario tecnico del prototipo. **Nessuna regola qui descritta autorizza da sola l'invio PEC ministeriale.**
> I test di simulazione non equivalgono a ricevute di invio effettive.

## Responsabilità

| Modulo | Responsabilità |
| --- | --- |
| `src/utils/hrValutazione.ts` | Calcolo puro di stato, motivi, priorità della tabella Admin |
| `src/utils/hrContrattoRestrittivo.ts` | Contratti in vigore, date valide e blocchi gestionali |
| `src/utils/hrDateRules.ts` | Fine turno (inclusi turni che attraversano mezzanotte) |
| `src/utils/hrCompliance.ts` | Controllo di regolarità e prerequisiti della coda HR |
| `src/utils/intermittentiPrestazioni.ts` | Prestazioni e copertura puntuale di ogni riga XML |
| `src/utils/intermittentiXml.ts` | Generazione ministeriale: massimo dieci righe |
| `src/utils/intermittentiPdf.ts` | PDF compilato per consultazione, non prova di trasmissione |
| `src/hooks/usePraticaOperatoreHR.ts` | Selezione e aggiornamento della pratica dell'operatore |
| Backend `services/hrCallCoverage.js` | Fonte autorevole per verificare la copertura in archivio |
| Backend `services/hrPermissions.js` | Autorizzazioni effettive del ruolo ADMIN, HR o ADMIN_HR |

## Regole applicative

| ID | Regola | Test atteso |
| --- | --- | --- |
| HR-01 | In assenza di contratto in vigore, possibile nuova assegnazione senza riscrivere la pratica storica | Occasionale scaduto → Chiamata |
| HR-02 | Il contratto in vigore blocca la nuova assegnazione amministrativa secondo la policy Detelder | Scadenza successiva a oggi |
| HR-03 | Un turno notturno che termina il giorno seguente richiede copertura per entrambe le date | Turno 22:00–06:00 |
| HR-04 | Le giornate consecutive nel planning costituiscono una prestazione continua | 18–19 novembre → una riga |
| HR-05 | Giornate isolate NON coprono i giorni intermedi | 18 e 22 novembre → due righe |
| HR-06 | Per una singola giornata, data inizio e fine coincidono | 18/11–18/11 sia in XML che in PDF |
| HR-07 | Il tracciato UNI_Intermittenti contiene massimo 10 prestazioni | 11 prestazioni → più moduli |
| HR-08 | La copertura deve leggere le singole righe dell'XML archiviato, non il minimo/massimo del record | Invio 18 e 22 NON copre 19–21 |
| HR-09 | PEC_PREPARATA e BOZZA non provano un invio completato | Stato INVIATA con prova reale distinto dalla simulazione |
| HR-10 | Gli annullamenti di prova mantengono traccia della comunicazione iniziale | Una comunicazione annullata non risulta coperta |
| HR-11 | ADMIN_HR comprende le capacità ADMIN e HR, senza concederle a HR puro | Check backend, non solo frontend |
| HR-12 | Le azioni privilegiate devono essere autorizzate su API con la sessione verificata | Richiesta anonima → 401 |
| HR-13 | Dopo assegnazione iniziale e con pratica aperta, la CTA Admin è **Apri pratica HR** | Non creare/prendere il nome di una seconda pratica prima di completare la prima |
| HR-14 | `ADMIN_HR` può preparare le chiamate anche dalla scheda operatore Admin, non solo da `/hr` | Il normale `ADMIN` rimane senza esecuzione chiamate |

## Stati e ricevute

- **BOZZA:** XML archiviato, nessun invio confermato.
- **PEC_PREPARATA:** comunicazione pronta, non equivale a inviata.
- **INVIATA / SIMULAZIONE TEST:** stato tecnico del prototipo: non mostrare come consegna PEC effettiva.
- **INVIATA reale:** richiede un flusso di invio/archiviazione ricevute da completare in ambiente autorizzato.

## Profili

| Azione | ADMIN | HR | ADMIN_HR |
| --- | --- | --- | --- |
| Assegnare pratica | sì | no | sì |
| Elaborare pratica, codice comunicazione, attività | no | sì | sì |
| Gestire utenti HR | sì | no | sì |
| Accedere alla coda di lavorazione HR | no | sì | sì |
| Preparare e simulare chiamate intermittenti (anche in vista Admin) | no | sì | sì |

La verifica di ruolo è nel backend. I controlli dei componenti React sono solo una guida UX.

## Collaudo prima di un rilascio

Per architettura, limiti attuali, API, test automatizzati e backlog per il DEV: [handoff-dev-modulohr-20261119.md](./handoff-dev-modulohr-20261119.md).

1. Salvare la build precedente del prototipo.
2. Eseguire `npm test` sul branch backend `refactor/modulohr-regole-20261117` e `npm run build` sul frontend.
3. Fare una copia di sicurezza del database Aiven **di test**.
4. Verificare il tipo `ruolo` in `hr_ruoli_assegnati` sul solo database Aiven di test. **Nel branch corrente** `middleware/hrAccess.js` esegue anche `ALTER TABLE` alla prima richiesta HR quando trova il vecchio ENUM. Il file `db/migrations/20261117_admin_hr_role.sql` è il riferimento per la futura migrazione esplicita/versionata; non eseguirlo indiscriminatamente su OVH.
5. Verificare autenticazione e separazione ruoli con account ADMIN, HR, ADMIN_HR e operatore non abilitato.
6. Provare assegnazione da contratto occasionale scaduto a chiamata e ricerca della nuova pratica.
7. Provare XML con 18–19 e 22–22, PDF conforme, blocco duplicazioni e nessuna falsa copertura del 20–21.
8. Provare annullamento simulato e confermare la marcatura TEST, mai come prova PEC reale.
9. Solo dopo collaudo funzionale autorizzare eventuali ulteriori rilasci.

**Non distribuire automaticamente queste modifiche sulla produzione OVH.**
