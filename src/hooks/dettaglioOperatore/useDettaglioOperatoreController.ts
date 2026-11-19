import {useChiamateOperatore} from "./useChiamateOperatore";
import {useContrattiOperatore} from "./useContrattiOperatore";
import {useFormContratti} from "./useFormContratti";
import {useImmaginiOperatore} from "./useImmaginiOperatore";
import {useAllegatiOperatore} from "./useAllegatiOperatore";
import {useAnagraficaOperatore} from "./useAnagraficaOperatore";
import {useState,useEffect} from "react";
import {useParams,useSearchParams} from "react-router-dom";
import type {ContrattoChiamataPadre} from "@/pages/admin/dialog/IntermittentiDialog";
import {listaChiamateHR} from "@/utils/chiamateHR";
import {hrMe} from "@/utils/hrWorkflow";
import {ruoloConsente} from "@/utils/hrAccessPolicy";
import {usePraticaOperatoreHR} from "@/hooks/usePraticaOperatoreHR";
import {datiContrattoMancanti} from "@/utils/hrCompliance";
import type {TipoContratto,Contratto} from "@/pages/admin/dettaglioOperatore.types";

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
    const {archivioChiamateOpen,setArchivioChiamateOpen,nuovaChiamataOpen,setNuovaChiamataOpen,aggiornamentoAzioniHR,setAggiornamentoAzioniHR,contrattoPadre,dateProposta,aggiornaChiamate}=useChiamateOperatore(id,contratti,searchParams);
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
  const {editAllegati,allegati,formAllegati,editaAllegati,aggiornaAllegati,handleChangeFormAllegati,caricaAllegati,dowloadAllegato,caricaDocumento,eliminaDocumento}=useAllegatiOperatore(id,aggiornaDipendente);
  return {
    searchParams, aggiornaAllegati, aggiornaChiamate, aggiornaDatiAnagrafici, aggiornaDatiGenerici, aggiornaHeader, aggiornaNascitaResidenza, aggiornamentoAzioniHR, allegati, archivioChiamateOpen, caricaContrattoFirmato, caricaDocumento, caricaImmagine, caricaListaContratti, contratti, contrattiPrecedenti, contrattoPadre, dateProposta, datiMancantiHR, dipendente, disabilitaDatiAnagrafici, disabilitaDatiGenerali, disabilitaHeader, disabilitaNascitaResidenza, dowloadAllegato, dowloadPdf, editAllegati, editDatiAnagrafici, editDatiGenerali, editHeader, editNascitaResidenza, editaAllegati, editaDatiAnagrafici, editaDatiGenerali, editaHeader, editaNascitaResidenza, eliminaDocumento, formAllegati, formConsegnaBeniFormazione, formContrattoChiamata, formContrattoOccasionale, formContrattoOpen, formContrattoTempoDeterminato, formContrattoTempoIndeterminato, formDatiAnagrafici, formDatiGenerali, formDatiNascitaResidenza, formHeader, generaContrattoChiamata, generaContrattoConsegnaBeniFormazione, generaContrattoOccasionale, generaContrattoTempoDeterminato, generaContrattoTempoIndeterminato, getsioneCancellazioneSingoloContratto, getsioneCancellazioneTuttiContratti, handleChangeConsegnaBeniFormazione, handleChangeContrattoChiamata, handleChangeContrattoOccasionale, handleChangeContrattoTempoDeterminato, handleChangeContrattoTempoIndeterminato, handleChangeDatiAnagrafici, handleChangeDatiGenerali, handleChangeDatiNascitaResidenza, handleChangeFormAllegati, handleChangeFormHeader, id, imgFiguraIntera, imgMezzoBusto, imgPrimoPiano, listaMansioniHeader, loading, nuovaChiamataOpen, praticaHR, puoEseguireChiamate, setAggiornamentoAzioniHR, setArchivioChiamateOpen, setFormContrattoChiamata, setFormContrattoOccasionale, setFormContrattoOpen, setFormContrattoTempoDeterminato, setFormContrattoTempoIndeterminato, setNuovaChiamataOpen, setPraticaHR, tipoContratto
  };
};
export type OperatoreController=ReturnType<typeof useDettaglioOperatoreController>;
