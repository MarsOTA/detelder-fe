import type {Dispatch,SetStateAction} from "react";
import {format} from "date-fns";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {messaggioBloccoContratto} from "@/utils/hrContrattoRestrittivo";
import {hrRegistraAttivita} from "@/utils/hrWorkflow";
import type {HRPratica} from "@/utils/hrWorkflow";
import type {Contratto,TipoContratto,ContrattoBase,ContrattoPayload,FormContratto,FormContrattoOccasionale,FormContrattoTempoDeterminato,FormContrattoTempoIndeterminato,FormConsegnaBeniFormazione} from "@/pages/admin/dettaglioOperatore.types";
type Options={
 id:string|undefined;
 contratti:Contratto[];
 setContratti:Dispatch<SetStateAction<Contratto[]>>;
 praticaHR:HRPratica|null;
 tipoContratto:TipoContratto|null;
 datiMancantiHR:string[];
 setLoading:Dispatch<SetStateAction<boolean>>;
 setFormContrattoOpen:Dispatch<SetStateAction<boolean>>;
 formContrattoChiamata:FormContratto;
 formContrattoOccasionale:FormContrattoOccasionale;
 formContrattoTempoIndeterminato:FormContrattoTempoIndeterminato;
 formContrattoTempoDeterminato:FormContrattoTempoDeterminato;
 formConsegnaBeniFormazione:FormConsegnaBeniFormazione;
};
// Owns contract persistence, upload/download and generation; never owns profile data.
export function useContrattiOperatore({id,contratti,setContratti,praticaHR,tipoContratto,datiMancantiHR,setLoading,setFormContrattoOpen,formContrattoChiamata,formContrattoOccasionale,formContrattoTempoIndeterminato,formContrattoTempoDeterminato,formConsegnaBeniFormazione}:Options){
    const inviaContratto = async (contrattoFinale: ContrattoPayload, generazionePdf: boolean) => {
        if(contrattoFinale.tipologia!=="CONSGNA_BENI_FORMAZIONE"){
            const blocco=messaggioBloccoContratto(contratti);
            if(blocco){window.alert(blocco);return;}
        }
        if(datiMancantiHR.length){window.alert("Impossibile generare il contratto. Completa: "+datiMancantiHR.join(", "));return;}
        try {
            // Tempo determinato/indeterminato: il backend prevede un inserimento manuale,
            // senza generatore PDF. Non inviare la richiesta a una rotta inesistente.
            const endpoint = generazionePdf ? "operatori/creaContratto" : "operatori/creaContrattoManuale";
            const payload = generazionePdf ? contrattoFinale : {
                idOperatore: contrattoFinale.idOperatore,
                tipologia: contrattoFinale.tipologia.replace(/^CONTRATTO_/, ""),
                dataInizio: "dataInizio" in contrattoFinale ? contrattoFinale.dataInizio : null,
                dataFine: "dataFine" in contrattoFinale ? contrattoFinale.dataFine : null
            };
            if(!generazionePdf && payload.tipologia==="TEMPO_INDETERMINATO"&&!payload.dataFine){
                throw new Error("Il backend test richiede erroneamente una data fine anche per il tempo indeterminato. Creazione bloccata per evitare un contratto con scadenza fittizia.");
            }
            const url = new URL(ezystaffBEUrl + endpoint);

            const resp = await fetch(url.toString(), {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                method: "POST",
                credentials: "include",
                body: JSON.stringify(payload),
            });

            if (!resp.ok) {
                const raw=await resp.text().catch(()=>"");
                let detail=raw;
                try {const parsed=JSON.parse(raw);detail=parsed.message||parsed.error||raw;}catch{}
                throw new Error(`Generazione non completata (HTTP ${resp.status})${detail?": "+String(detail).slice(0,300):""}`);
            }

            const data = await resp.json();


            const aggiornati=await caricaListaContratti();
            if(praticaHR && window.location.pathname.startsWith("/hr/")){
                const expected=(value:string)=>value.replace(/^CONTRATTO_/,"");
                const matches=(aggiornati||[]).filter(c=>expected(c.tipologia)===expected(contrattoFinale.tipologia));
                const dataRichiesta="dataInizio" in contrattoFinale?contrattoFinale.dataInizio:null;
                const matchingDate=matches.filter(c=>!dataRichiesta||String(c.dataInizio||"").slice(0,10)===String(dataRichiesta).slice(0,10));
                const idCreato=Number(data?.idContratto||data?.insertId||[...matchingDate].sort((a,b)=>b.idContratto-a.idContratto)[0]?.idContratto);
                if(Number.isSafeInteger(idCreato)&&idCreato>0){
                    try{await hrRegistraAttivita(praticaHR.id,"CONTRATTO_CREATO",idCreato)}
                    catch(e){console.warn("Contratto creato, registrazione attività HR non riuscita:",e)}
                }
                setFormContrattoOpen(false);
            }
        } catch (error) {
            console.error("Errore generazione contratto:", error);
            // Il backend può avere salvato il record prima del fallimento PDF.
            // Aggiornare l'elenco permette di verificare lo stato ed evitare doppi inserimenti.
            let registrato=false;
            try {
                const aggiornati=await caricaListaContratti();
                const norma=(v:string)=>v.replace(/^CONTRATTO_/,"");
                const dataRichiesta="dataInizio" in contrattoFinale?String(contrattoFinale.dataInizio||"").slice(0,10):"";
                registrato=Array.isArray(aggiornati)&&aggiornati.some(c=>norma(c.tipologia)===norma(contrattoFinale.tipologia)&&!!dataRichiesta&&String(c.dataInizio||"").slice(0,10)===dataRichiesta);
            }catch(e){console.warn("Impossibile verificare il record contratto dopo il fallimento:",e)}
            const detail=error instanceof Error?error.message:"Errore sconosciuto";
            alert(detail+"\\n"+(registrato?"Attenzione: esiste un record per il contratto richiesto, ma il PDF potrebbe non essere stato creato. Non ripetere la creazione: verifica e completa il documento.":"Verifica l'elenco contratti prima di riprovare: il backend potrebbe aver salvato il record anche se la generazione PDF è fallita."));
        }
    };

    const generaContrattoChiamata = async () => {
        setLoading(true);

        try {
            const contrattoBase: ContrattoBase = {
                idContratto: 0,
                idOperatore: Number(id),
                tipologia: "CHIAMATA",
            };

            if (!isValidSedeAlternativa()) {
                alert(
                    "Città alternativa e indirizzo alternativo devono essere entrambi compilati oppure entrambi vuoti."
                );
                return;
            }

            const contrattoFinale: ContrattoPayload = {
                ...contrattoBase,
                ...formContrattoChiamata,

                dataInizio: formContrattoChiamata.dataInizio
                    ? format(formContrattoChiamata.dataInizio, "yyyy-MM-dd")
                    : null,

                dataFine: formContrattoChiamata.dataFine
                    ? format(formContrattoChiamata.dataFine, "yyyy-MM-dd")
                    : null,

                dataFirmaContratto: formContrattoChiamata.dataFirmaContratto
                    ? format(
                        formContrattoChiamata.dataFirmaContratto,
                        "yyyy-MM-dd"
                    )
                    : null,

                cittaAlternativa:
                    formContrattoChiamata.cittaAlternativa,

                indirizzoAlternativo:
                    formContrattoChiamata.indirizzoAlternativo,

                cittaPredefinita:
                    formContrattoChiamata.cittaPredefinita,

                indirizzoPredefinito:
                    formContrattoChiamata.indirizzoPredefinito,
            };


            await inviaContratto(contrattoFinale, true);
        } finally {
            setLoading(false);
        }
    };


    const generaContrattoOccasionale = async () => {
        const from=formContrattoOccasionale.dataInizio;
        const to=formContrattoOccasionale.dataFine;
        if(!from||!to||format(to,"yyyy-MM-dd")<format(from,"yyyy-MM-dd")){
            window.alert("Imposta date valide di inizio e fine del contratto occasionale.");
            return;
        }
        if(contratti.some(c=>c.tipologia==="OCCASIONALE"&&c.dataInizio?.slice(0,10)===format(from,"yyyy-MM-dd"))){
            window.alert("Esiste già un contratto occasionale con la stessa data di inizio.");
            return;
        }
        setLoading(true);

        try {
            const contrattoBase: ContrattoBase = {
                idContratto: 0,
                idOperatore: Number(id),
                tipologia: "OCCASIONALE",
            };

            const contrattoFinale: ContrattoPayload = {
                ...contrattoBase,
                dataInizio: formContrattoOccasionale.dataInizio ? format(formContrattoOccasionale.dataInizio, "yyyy-MM-dd") : null,
                dataFine: formContrattoOccasionale.dataFine ? format(formContrattoOccasionale.dataFine, "yyyy-MM-dd") : null,
                dataFirmaContratto: formContrattoOccasionale.dataFirmaContratto ? format(formContrattoOccasionale.dataFirmaContratto, "yyyy-MM-dd") : null,
            };
            await inviaContratto(contrattoFinale, true);
        } finally {
            setLoading(false);
        }
    };

    const generaContrattoConsegnaBeniFormazione = async () => {
        setLoading(true);

        try {
            const contrattoBase: ContrattoBase = {
                idContratto: 0,
                idOperatore: Number(id),
                tipologia: "CONSGNA_BENI_FORMAZIONE",
            };

            const contrattoFinale: ContrattoPayload = {
                ...contrattoBase,
                ...formConsegnaBeniFormazione,
            };


            await inviaContratto(contrattoFinale, true);
        } finally {
            setLoading(false);
        }
    };

    const generaContrattoTempoIndeterminato = async () => {
        setLoading(true);
        try {
            const contrattoBase: ContrattoBase = {
                idContratto: 0,
                idOperatore: Number(id),
                tipologia: "CONTRATTO_TEMPO_INDETERMINATO",
            };
            const contrattoFinale: ContrattoPayload = {
                ...contrattoBase,
                dataInizio: formContrattoTempoIndeterminato.dataInizio ? format(formContrattoTempoIndeterminato.dataInizio, "yyyy-MM-dd") : null,
                dataFine: formContrattoTempoIndeterminato.dataFine ? format(formContrattoTempoIndeterminato.dataFine, "yyyy-MM-dd") : null,
            };
            await inviaContratto(contrattoFinale, false);
        } finally {
            setLoading(false);
        }
    };

    const generaContrattoTempoDeterminato = async () => {
        setLoading(true);
        try {
            const contrattoBase: ContrattoBase = {
                idContratto: 0,
                idOperatore: Number(id),
                tipologia: "CONTRATTO_TEMPO_DETERMINATO",
            };
            const contrattoFinale: ContrattoPayload = {
                ...contrattoBase,
                dataInizio: formContrattoTempoDeterminato.dataInizio ? format(formContrattoTempoDeterminato.dataInizio, "yyyy-MM-dd") : null,
                dataFine: formContrattoTempoDeterminato.dataFine ? format(formContrattoTempoDeterminato.dataFine, "yyyy-MM-dd") : null,
            };
            await inviaContratto(contrattoFinale, false);
        } finally {
            setLoading(false);
        }
    };


    const isValidSedeAlternativa = () => {
        if (tipoContratto !== "CHIAMATA") {
            return true;
        }

        const hasCitta = !!formContrattoChiamata.cittaAlternativa?.trim();
        const hasIndirizzo = !!formContrattoChiamata.indirizzoAlternativo?.trim();

        // entrambe valorizzate oppure entrambe vuote
        return (hasCitta && hasIndirizzo) || (!hasCitta && !hasIndirizzo);
    };

    const caricaListaContratti = async () => {
        const resp = await fetch(ezystaffBEUrl + `operatori/listaContrattiOperatore/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.info("**CARICAMENTO CONTRATTI INIZIO**");
        setContratti(data);
        console.info("**CARICAMENTO CONTRATTI FINE**");
        return data as Contratto[];
    }

    const getsioneCancellazioneSingoloContratto = async (
        idContratto: number,
        tipoContratto: String
    ) => {

        try {

            const resp = await fetch(
                `${ezystaffBEUrl}operatori/cancellaSingoloContratto/${idContratto}?tipoContratto=${tipoContratto}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                        accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!resp.ok) {
                throw new Error("Errore nella cancellazione del contratto");
            }

            console.info(
                "**CANCELLAZIONE CONTRATTO OK**",
                idContratto,
                tipoContratto
            );

            const data = await resp.json();


            return data;

        } catch (error) {

            console.error(
                "**ERRORE CANCELLAZIONE CONTRATTO**",
                error
            );

            throw error;
        }
    };

    

    const getsioneCancellazioneTuttiContratti = async (idContratto: number) => {
        try {
            const resp = await fetch(
                ezystaffBEUrl + `operatori/cancellaTuttiContratti/${idContratto}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "application/json",
                        accept: "application/json",
                    },
                    credentials: "include",
                }
            );

            if (!resp.ok) {
                throw new Error("Errore nella cancellazione del contratto");
            }

            console.info("**CANCELLAZIONE CONTRATTO OK**", idContratto);

            // opzionale: risposta JSON
            const data = await resp.json();

            return data;
        } catch (error) {
            console.error("**ERRORE CANCELLAZIONE CONTRATTO**", error);
            throw error;
        }
    };


    const dowloadPdf = async (idContratto: number, tipoContratto: String) => {
        const response = await fetch(ezystaffBEUrl + `operatori/downloadContratto/${idContratto}?tipoContratto=${tipoContratto}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                credentials: "include",
            }
        );

        if (!response.ok) {
            throw new Error("Errore download PDF");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `contratto_${idContratto}.pdf`;
        document.body.appendChild(a);
        a.click();

        a.remove();
        window.URL.revokeObjectURL(url);
    };

    type TipoContrattoUpload = "contrattoFirmato" | "contrattoUnilav";

    const caricaContrattoFirmato = async (
        e: React.ChangeEvent<HTMLInputElement>,
        idContratto: number,
        tipoContratto: TipoContrattoUpload
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;


        const formData = new FormData();
        formData.append("tipoContratto", tipoContratto);
        formData.append("file", file);
        try {

            const response = await fetch(ezystaffBEUrl + `upload/contrattoFirmato/${idContratto}`,
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        //"Content-Type": "application/json",
                        accept: "application/json",
                    },
                    credentials: "include",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error(`Errore nel caricamento: ${response.statusText}`);
            }

            await response.json();
            await caricaListaContratti();
            if(praticaHR && window.location.pathname.startsWith("/hr/")){
                const azione=tipoContratto==="contrattoFirmato"?"CONTRATTO_FIRMATO_CARICATO":"UNILAV_CARICATO";
                try{await hrRegistraAttivita(praticaHR.id,azione,idContratto)}
                catch(e){console.warn("Documento caricato, tracciamento HR non riuscito:",e)}
            }
            // Qui puoi aggiornare lo stato o mostrare un messaggio di successo
        } catch (error) {
            console.error("Errore durante l'upload:", error);
            // Qui puoi gestire l'errore (es. mostrare alert)
        }
    };


 return {caricaListaContratti,generaContrattoChiamata,generaContrattoOccasionale,generaContrattoConsegnaBeniFormazione,generaContrattoTempoIndeterminato,generaContrattoTempoDeterminato,getsioneCancellazioneSingoloContratto,getsioneCancellazioneTuttiContratti,dowloadPdf,caricaContrattoFirmato};
}
