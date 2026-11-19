import {useContrattiOperatore} from "./useContrattiOperatore";
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

  const {caricaListaContratti,generaContrattoChiamata,generaContrattoOccasionale,generaContrattoConsegnaBeniFormazione,generaContrattoTempoIndeterminato,generaContrattoTempoDeterminato,getsioneCancellazioneSingoloContratto,getsioneCancellazioneTuttiContratti,dowloadPdf,caricaContrattoFirmato}=useContrattiOperatore({id,contratti,setContratti,praticaHR,tipoContratto,datiMancantiHR,setLoading,setFormContrattoOpen,formContrattoChiamata,formContrattoOccasionale,formContrattoTempoIndeterminato,formContrattoTempoDeterminato,formConsegnaBeniFormazione});
  const {imgPrimoPiano,imgFiguraIntera,imgMezzoBusto,caricaImmagine,fetchImage}=useImmaginiOperatore(id,caricaListaContratti);
  return {
    aggiornaAllegati, aggiornaChiamate, aggiornaDatiAnagrafici, aggiornaDatiGenerici, aggiornaHeader, aggiornaNascitaResidenza, aggiornamentoAzioniHR, allegati, archivioChiamateOpen, caricaContrattoFirmato, caricaDocumento, caricaImmagine, caricaListaContratti, contratti, contrattiPrecedenti, contrattoPadre, dateProposta, datiMancantiHR, dipendente, disabilitaDatiAnagrafici, disabilitaDatiGenerali, disabilitaHeader, disabilitaNascitaResidenza, dowloadAllegato, dowloadPdf, editAllegati, editDatiAnagrafici, editDatiGenerali, editHeader, editNascitaResidenza, editaAllegati, editaDatiAnagrafici, editaDatiGenerali, editaHeader, editaNascitaResidenza, eliminaDocumento, formAllegati, formConsegnaBeniFormazione, formContrattoChiamata, formContrattoOccasionale, formContrattoOpen, formContrattoTempoDeterminato, formContrattoTempoIndeterminato, formDatiAnagrafici, formDatiGenerali, formDatiNascitaResidenza, formHeader, generaContrattoChiamata, generaContrattoConsegnaBeniFormazione, generaContrattoOccasionale, generaContrattoTempoDeterminato, generaContrattoTempoIndeterminato, getsioneCancellazioneSingoloContratto, getsioneCancellazioneTuttiContratti, handleChangeConsegnaBeniFormazione, handleChangeContrattoChiamata, handleChangeContrattoOccasionale, handleChangeContrattoTempoDeterminato, handleChangeContrattoTempoIndeterminato, handleChangeDatiAnagrafici, handleChangeDatiGenerali, handleChangeDatiNascitaResidenza, handleChangeFormAllegati, handleChangeFormHeader, id, imgFiguraIntera, imgMezzoBusto, imgPrimoPiano, listaMansioniHeader, loading, nuovaChiamataOpen, praticaHR, puoEseguireChiamate, setAggiornamentoAzioniHR, setArchivioChiamateOpen, setFormContrattoChiamata, setFormContrattoOccasionale, setFormContrattoOpen, setFormContrattoTempoDeterminato, setFormContrattoTempoIndeterminato, setNuovaChiamataOpen, setPraticaHR, tipoContratto
  };
};
