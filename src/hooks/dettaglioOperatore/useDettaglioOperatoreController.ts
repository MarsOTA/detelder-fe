import {useFormContratti} from "./useFormContratti";
import {useImmaginiOperatore} from "./useImmaginiOperatore";
import {useAllegatiOperatore} from "./useAllegatiOperatore";
import {useAnagraficaOperatore} from "./useAnagraficaOperatore";
import { useState,useEffect } from "react";
import { useParams,useSearchParams } from "react-router-dom";
import type { ContrattoChiamataPadre } from "@/pages/admin/dialog/IntermittentiDialog";
import { listaChiamateHR } from "@/utils/chiamateHR";
import { hrRegistraAttivita, hrMe } from "@/utils/hrWorkflow";
import { ruoloConsente } from "@/utils/hrAccessPolicy";
import { usePraticaOperatoreHR } from "@/hooks/usePraticaOperatoreHR";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { messaggioBloccoContratto } from "@/utils/hrContrattoRestrittivo";
import type { Dipendente } from "@/entity";
import { datiContrattoMancanti } from "@/utils/hrCompliance";
import { format } from "date-fns";
import type { FormDatiAnagrafici,FormNascitaResidenza,FormDatiGenerali,FormContratto,
 FormContrattoOccasionale,FormContrattoTempoIndeterminato,FormContrattoTempoDeterminato,
 FormHeader,FormAllegati,FormConsegnaBeniFormazione,TipoContratto,ContrattoBase,Contratto,
 Allegati,ContrattoPayload,ImageData
} from "@/pages/admin/dettaglioOperatore.types";

export const useDettaglioOperatoreController = () => {
    const { id } = useParams();
    //const [loading, setLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const {dipendente, editHeader, disabilitaHeader, editDatiAnagrafici, disabilitaDatiAnagrafici, editNascitaResidenza, disabilitaNascitaResidenza, editDatiGenerali, disabilitaDatiGenerali, formDatiAnagrafici, formDatiNascitaResidenza, formDatiGenerali, formHeader, caricaOperatore, aggiornaDipendente, editaDatiAnagrafici, editaHeader, editaDatiGenerali, editaNascitaResidenza, aggiornaDatiAnagrafici, aggiornaHeader, aggiornaDatiGenerici, aggiornaNascitaResidenza, handleChangeDatiAnagrafici, handleChangeDatiNascitaResidenza, handleChangeDatiGenerali, handleChangeFormHeader}=useAnagraficaOperatore(id);





    // const [editCartaIdentita, setEditCartaIdentita] = useState<boolean>(false);

    const [contratti, setContratti] = useState<Contratto[]>([]);
    const datiMancantiHR=datiContrattoMancanti(dipendente);
    const [formContrattoOpen,setFormContrattoOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const [archivioChiamateOpen, setArchivioChiamateOpen] = useState(false);
    const [nuovaChiamataOpen, setNuovaChiamataOpen] = useState(false);
    const [aggiornamentoAzioniHR,setAggiornamentoAzioniHR]=useState(0);
    // Permission to perform intermittent calls is based on the verified backend role,
    // not the /admin vs /hr route. ADMIN_HR may work from either operator view.
    const [puoEseguireChiamate,setPuoEseguireChiamate]=useState(false);
    useEffect(()=>{
      let active=true;
      void hrMe().then(identity=>{
        if(active)setPuoEseguireChiamate(ruoloConsente(identity.role,"HR"));
      }).catch(()=>{if(active)setPuoEseguireChiamate(false)});
      return()=>{active=false};
    },[]);

    const {praticaHR,setPraticaHR}=usePraticaOperatoreHR({
      id,praticaId:searchParams.get("pratica"),
      isHR:window.location.pathname.startsWith("/hr/"),
      contratti,aggiornamentoAzioniHR
    });

    const {formContrattoChiamata,setFormContrattoChiamata,formContrattoOccasionale,setFormContrattoOccasionale,formContrattoTempoDeterminato,setFormContrattoTempoDeterminato,formContrattoTempoIndeterminato,setFormContrattoTempoIndeterminato,formConsegnaBeniFormazione,handleChangeContrattoChiamata,handleChangeContrattoOccasionale,handleChangeContrattoTempoDeterminato,handleChangeContrattoTempoIndeterminato,handleChangeConsegnaBeniFormazione}=useFormContratti(praticaHR);

    const [contrattoPadre, setContrattoPadre] = useState<ContrattoChiamataPadre | null>(null);
    const [dateProposta,setDateProposta]=useState<{inizio:string;fine:string}|null>(null);
    useEffect(()=>{
      if(searchParams.get("azione")!=="chiamata"||!id||!contratti.length)return;
      const requested=Number(searchParams.get("contratto"));
      const c=contratti.find(item=>item.idContratto===requested&&item.tipologia==="CHIAMATA");
      if(!c||!c.dataInizio||!c.dataFine)return;
      const current=new Date();const today=[current.getFullYear(),String(current.getMonth()+1).padStart(2,"0"),String(current.getDate()).padStart(2,"0")].join("-");
      if(c.dataInizio.slice(0,10)>today||c.dataFine.slice(0,10)<today)return;
      const inizio=searchParams.get("inizio")||"";
      const fine=searchParams.get("fine")||inizio;
      const dal=c.dataInizio.slice(0,10),al=c.dataFine.slice(0,10);
      if(!/^\d{4}-\d{2}-\d{2}$/.test(inizio)||!/^\d{4}-\d{2}-\d{2}$/.test(fine)||inizio<dal||fine>al||fine<inizio)return;
      setContrattoPadre({idContratto:c.idContratto,tipologia:"CHIAMATA",dataInizio:dal,dataFine:al});
      setDateProposta({inizio,fine});
      setNuovaChiamataOpen(true);
    },[id,contratti,searchParams]);

    const [,setChiamateCounts] = useState<Record<number,number>>({});
    const aggiornaChiamate = async () => {
      if(!id)return;
      const padri=contratti.filter(c=>c.tipologia==="CHIAMATA");
      const results=await Promise.allSettled(padri.map(c=>listaChiamateHR(Number(id),c.idContratto)));
      const counts:Record<number,number>={};
      results.forEach((res,i)=>{if(res.status==="fulfilled")counts[padri[i].idContratto]=res.value.length;});
      setChiamateCounts(counts);
    };
    useEffect(()=>{void aggiornaChiamate();},[id,contratti]);
    // Non mostrare conteggi fittizi: manca ancora la persistenza delle chiamate su Aiven.


    const listaMansioniHeader = [
        "Doorman",
        "Controllo accessi",
        "GPG",
        "Team Leader",
        "Antincendio base",
        "Antincendio avanzato",
        "Primo soccorso"
    ];



    // L'HR riceve il tipo esclusivamente dalla pratica assegnata dall'ADMIN.
    // Legacy contracts are presented through the same modern card as newly assigned HR contracts.
    // These view-only records must not create or update HR workflow practices.
    const contrattiPrecedenti=contratti.filter(c=>{
      if(!praticaHR)return true;
      const norm=(v:string)=>v.replace(/^CONTRATTO_/,"");
      return !(norm(c.tipologia)===norm(praticaHR.tipologia) &&
        !!c.dataInizio && !!praticaHR.dataInizio &&
        c.dataInizio.slice(0,10)===String(praticaHR.dataInizio).slice(0,10));
    });
    const tipoContratto: TipoContratto | null = praticaHR ?
       ({ TEMPO_DETERMINATO:"CONTRATTO_TEMPO_DETERMINATO",
          TEMPO_INDETERMINATO:"CONTRATTO_TEMPO_INDETERMINATO",
          CHIAMATA:"CHIAMATA", OCCASIONALE:"OCCASIONALE",
          CONSGNA_BENI_FORMAZIONE:"CONSGNA_BENI_FORMAZIONE" } as Record<string,TipoContratto>)[praticaHR.tipologia] ?? null : null;
    useEffect(() => {
        caricaOperatore();
        caricaListaContratti();
        fetchImage('primoPiano');
        fetchImage('mezzoBusto');
        fetchImage('figuraIntera');
        caricaAllegati();
    }, []);

    /*
    const generaContratto = async () => {

        setLoading(true);
        let contrattoFinale: ContrattoPayload;

        if (tipoContratto === null) {
            setLoading(false);
            alert("Tipo contratto non selezionato");
            throw new Error("Tipo contratto non selezionato");
        }

        const contrattoBase: ContrattoBase = {
            idContratto: 0,
            idOperatore: Number(id),
            tipologia: tipoContratto,
        };

        if (!isValidSedeAlternativa()) {
            alert(
                "Città alternativa e indirizzo alternativo devono essere entrambi compilati oppure entrambi vuoti."
            );
            setLoading(false);
            return;
        }

        if (tipoContratto === "CONSGNA_BENI_FORMAZIONE") {
            contrattoFinale = {
                ...contrattoBase,
                ...formConsegnaBeniFormazione,
            };
        } else if (tipoContratto === "OCCASIONALE") {
            contrattoFinale = {
                ...contrattoBase,
                dataInizio: formContrattoOccasionale.dataInizio
                    ? format(formContrattoOccasionale.dataInizio, "yyyy-MM-dd")
                    : null,
                dataFine: formContrattoOccasionale.dataFine
                    ? format(formContrattoOccasionale.dataFine, "yyyy-MM-dd")
                    : null,
                dataFirmaContratto: formContrattoOccasionale.dataFirmaContratto
                    ? format(formContrattoOccasionale.dataFirmaContratto, "yyyy-MM-dd")
                    : null,
            };
        } else {
            contrattoFinale = {
                ...contrattoBase,
                ...formContrattoChiamata,
                dataInizio: formContrattoChiamata.dataInizio
                    ? format(formContrattoChiamata.dataInizio, "yyyy-MM-dd")
                    : null,
                dataFine: formContrattoChiamata.dataFine
                    ? format(formContrattoChiamata.dataFine, "yyyy-MM-dd")
                    : null,
                dataFirmaContratto: formContrattoChiamata.dataFirmaContratto
                    ? format(formContrattoChiamata.dataFirmaContratto, "yyyy-MM-dd")
                    : null,
                cittaAlternativa: formContrattoChiamata.cittaAlternativa,
                indirizzoAlternativo: formContrattoChiamata.indirizzoAlternativo,
                cittaPredefinita: formContrattoChiamata.cittaPredefinita,
                indirizzoPredefinito: formContrattoChiamata.indirizzoPredefinito
            };
        }


        const url = new URL(ezystaffBEUrl + "operatori/creaContratto");

        const resp = await fetch(url.toString(), {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(contrattoFinale)
        });
        const data = await resp.json();
        console.info("Generazione contratto");

        await caricaListaContratti();
        setLoading(false);

    };
    */

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

    /*
        const getsioneCancellazioneSingoloContratto = async (idContratto: number) => {
            try {
                const resp = await fetch(
                    ezystaffBEUrl + `operatori/cancellaSingoloContratto/${idContratto}`,
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
        */

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

  const {imgPrimoPiano,imgFiguraIntera,imgMezzoBusto,caricaImmagine,fetchImage}=useImmaginiOperatore(id,caricaListaContratti);
  return {
    aggiornaAllegati, aggiornaChiamate, aggiornaDatiAnagrafici, aggiornaDatiGenerici, aggiornaHeader, aggiornaNascitaResidenza, aggiornamentoAzioniHR, allegati, archivioChiamateOpen, caricaContrattoFirmato, caricaDocumento, caricaImmagine, caricaListaContratti, contratti, contrattiPrecedenti, contrattoPadre, dateProposta, datiMancantiHR, dipendente, disabilitaDatiAnagrafici, disabilitaDatiGenerali, disabilitaHeader, disabilitaNascitaResidenza, dowloadAllegato, dowloadPdf, editAllegati, editDatiAnagrafici, editDatiGenerali, editHeader, editNascitaResidenza, editaAllegati, editaDatiAnagrafici, editaDatiGenerali, editaHeader, editaNascitaResidenza, eliminaDocumento, formAllegati, formConsegnaBeniFormazione, formContrattoChiamata, formContrattoOccasionale, formContrattoOpen, formContrattoTempoDeterminato, formContrattoTempoIndeterminato, formDatiAnagrafici, formDatiGenerali, formDatiNascitaResidenza, formHeader, generaContrattoChiamata, generaContrattoConsegnaBeniFormazione, generaContrattoOccasionale, generaContrattoTempoDeterminato, generaContrattoTempoIndeterminato, getsioneCancellazioneSingoloContratto, getsioneCancellazioneTuttiContratti, handleChangeConsegnaBeniFormazione, handleChangeContrattoChiamata, handleChangeContrattoOccasionale, handleChangeContrattoTempoDeterminato, handleChangeContrattoTempoIndeterminato, handleChangeDatiAnagrafici, handleChangeDatiGenerali, handleChangeDatiNascitaResidenza, handleChangeFormAllegati, handleChangeFormHeader, id, imgFiguraIntera, imgMezzoBusto, imgPrimoPiano, listaMansioniHeader, loading, nuovaChiamataOpen, praticaHR, puoEseguireChiamate, setAggiornamentoAzioniHR, setArchivioChiamateOpen, setFormContrattoChiamata, setFormContrattoOccasionale, setFormContrattoOpen, setFormContrattoTempoDeterminato, setFormContrattoTempoIndeterminato, setNuovaChiamataOpen, setPraticaHR, tipoContratto
  };
};
