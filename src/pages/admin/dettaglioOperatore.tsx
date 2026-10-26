import { Button } from "@/components/ui/button";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { IntermittentiDialog } from "./dialog/IntermittentiDialog";
import { NuovaChiamataIntermittenteDialog } from "./dialog/NuovaChiamataIntermittenteDialog";
import type { ContrattoChiamataPadre } from "./dialog/IntermittentiDialog";
import { listaChiamateHR } from "@/utils/chiamateHR";
import { hrPratiche, hrAggiornaPeriodo, hrRegistraAttivita, hrPrendiInCarico } from "@/utils/hrWorkflow";
import type { HRPratica } from "@/utils/hrWorkflow";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import {messaggioBloccoContratto} from "@/utils/hrContrattoRestrittivo";
import type { Dipendente } from "@/entity";
import {datiContrattoMancanti} from "@/utils/hrCompliance";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FileText, UserRound, Paperclip } from "lucide-react";
import { format } from "date-fns"
import { DatiAnagraficiComponent } from "../components/DatiAnagraficiComponent";
import { NascitaResidenzaComponent } from "../components/NascitaResidenzaComponent";
import { ContrattoChiamataComponent } from "../components/ContrattoChiamataComponent";
import { ContrattoAttivoHR } from "../components/ContrattoAttivoHR";
import ArchivioContrattiHR from "../components/ArchivioContrattiHR";
import AzioniHRIntermittenti from "../components/AzioniHRIntermittenti";
import { ContrattoOccasionaleComponent } from "../components/ContrattoOccasionaleComponent";
import { ConsegnaBeniFormazioneComponent } from "../components/ConsegnaBeniFormazioneComponent";
import { DatiGeneraliComponent } from "../components/DatiGeneraliComponent";
import { HeaderDipendenteComponent } from "../components/HeaderDipendenteComponent";
import { TypeCardAComponent } from "../components/TypeCardAComponent";
import { TypeCardBComponent } from "../components/TypeCardBComponent";
import { TypeCardCComponent } from "../components/TypeCardCComponent";
import { TypeCardDComponent } from "../components/TypeCardDComponent";
import { ContrattoTempoIndeterminatoComponent } from "../components/ContrattoTempoIndeterminatoComponent";
import { ContrattoTempoDeterminatoComponent } from "../components/ContrattoTempoDeterminatoComponent";

interface FormDatiAnagrafici {
    nickname: string;
    nome: string;
    cognome: string;
    matricola: string;
    email: string;
    prefisso: string;
    telefono: string;
    codiceFiscale: string;
    sesso: string;
    dataNascita: Date | null;
    luogoNascita: string;
    provinciaNascita: string;
    statoNascita: string;
    cittadinanza: string;
}

interface FormNascitaResidenza {
    indirizzoResidenza: string;
    numeroCivicoResidenza: string;
    comuneResidenza: string;
    provinciaResidenza: string;
    capResidenza: string;
    residenzaUgualeDomicilio: boolean
    indirizzoDomicilio: string;
    numeroCivicoDomicilio: string;
    comuneDomicilio: string;
    provinciaDomicilio: string;
    capDomicilio: string;
}

interface FormDatiGenerali {
    altezza: number | null;
    peso: number | null;
    numeroScarpe: number | null;
    tagliaVestiti: string;
    livelloIstruzione: string;
    tesserino: string;
}

interface FormContratto {
    //  qualifica: string;
    dataInizio: Date | null;
    dataFine: Date | null;
    dataFirmaContratto: Date | null;
    //  listaMansioni: string[];
    //  compensoTotaleLordo: number;
    cittaPredefinita: string;
    indirizzoPredefinito: string;
    cittaAlternativa: string;
    indirizzoAlternativo: string;
    //  giorniPeriodoProva: number;
}

interface FormContrattoOccasionale {
    dataInizio: Date | null;
    dataFine: Date | null;
    dataFirmaContratto: Date | null;
}

interface FormContrattoTempoIndeterminato {
    dataInizio: Date | null;
    dataFine: Date | null;
}

interface FormContrattoTempoDeterminato {
    dataInizio: Date | null;
    dataFine: Date | null;
}

interface FormHeader {
    listaMansioni: string[];
}

interface FormAllegati {
    cartaIdentitaNdocumento: string;
    cartaIdentitaDataScadenza: Date | null;
    tesseraSanitariaNdocumento: string;
    tesseraSanitariaDataScadenza: Date | null;
    permessoSoggiornoNdocumento: string;
    permessoSoggiornoDataScadenza: Date | null;
    antincendioLivello: string;
    antincendioDataConseguimento: Date | null;
    primoSoccorsoLivello: string;
    primoSoccorsoDataConseguimento: Date | null;
    passaportoNdocumento: string;
    passaportoDataScadenza: Date | null;
    formazioneSicurezzaLavoroLivello: string;
    formazioneSicurezzaLavoroDataConseguimento: Date | null;
    blsdLivello: string;
    blsdDataConseguimento: Date | null;
    attestatoPrepostoLivello: string;
    attestatoPrepostoDataConseguimento: Date | null;
    attestatoSecurityManagerDataConseguimento: Date | null;
    attestatoIdoneitaVisitaMedicaDataConseguimento: Date | null;
    attestatoAddettoServiziControlloDataConseguimento: Date | null;
}

interface FormConsegnaBeniFormazione {
    elencoContenutiFormazione: string;
    elencoBeniStrumentali: string;
}

export type TipoContratto = "CHIAMATA" | "OCCASIONALE" | "CONSGNA_BENI_FORMAZIONE" | "CONTRATTO_TEMPO_INDETERMINATO" | "CONTRATTO_TEMPO_DETERMINATO";

interface ContrattoBase {
    idContratto: number;
    idOperatore: number;
    tipologia: TipoContratto;
}

interface Contratto extends ContrattoBase {
    dataInizio: string | null;
    dataFine: string | null;
    dataFirmaContratto: string | null;
    listaMansioni: string[];
    compensoTotaleLordo: number;
    pathContrattoFirmato: string;
    pathContrattoUnilav: string;
    cittaAlternativa: string;
    indirizzoAlternativo: string;
    cittaPredefinita: string;
    indirizzoPredefinito: string;
}

interface Allegati {
    cartaIdentitaNdocumento: string;
    cartaIdentitaDataScadenza: string;
    cartaIdentitaImgFronte: string;
    cartaIdentitaImgRetro: string;
    tesseraSanitariaNdocumento: string;
    tesseraSanitariaDataScadenza: string;
    tesseraSanitariaImgFronte: string;
    tesseraSanitariaImgRetro: string;
    permessoSoggiornoNdocumento: string;
    permessoSoggiornoDataScadenza: string;
    permessoSoggiornoImgFronte: string;
    permessoSoggiornoImgRetro: string;
    antincendioLivello: string;
    antincendioDataConseguimento: string;
    antincendioDocFronte: string;
    antincendioDocRetro: string;
    primoSoccorsoLivello: string;
    primoSoccorsoDataConseguimento: string;
    primoSoccorsoAttestatoFronte: string;
    primoSoccorsoAttestatoRetro: string;
    passaportoNdocumento: string;
    passaportoDataScadenza: string;
    passaportoImgFronte: string;
    passaportoImgRetro: string;
    formazioneSicurezzaLavoroLivello: string;
    formazioneSicurezzaLavoroDataConseguimento: string;
    formazioneSicurezzaLavoroAttestatoFronte: string;
    formazioneSicurezzaLavoroAttestatoRetro: string;
    blsdLivello: string;
    blsdDataConseguimento: string;
    blsdAttestatoFronte: string;
    blsdAttestatoRetro: string;
    attestatoPrepostoLivello: string;
    attestatoPrepostoDataConseguimento: string;
    attestatoPrepostoFronte: string;
    attestatoPrepostoRetro: string;
    attestatoSecurityManagerDataConseguimento: string;
    attestatoSecurityManagerFronte: string;
    attestatoIdoneitaVisitaMedicaDataConseguimento: string;
    attestatoIdoneitaVisitaMedicaFronte: string
    attestatoAddettoServiziControlloDataConseguimento: string
    attestatoAddettoServiziControlloFronte: string
    attestatoIndoneitaTecnicaAntincendioFronte: string
}


interface ContrattoConsegnaBeniFormazione extends ContrattoBase { }


type ContrattoPayload =
    | Contratto
    | ContrattoConsegnaBeniFormazione;

interface ImageData {
    url: string | null;
    extension: string | null;
}

const DettaglioOperatore = () => {
    const { id } = useParams();
    //const [loading, setLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    const [editHeader, setEditHeader] = useState<boolean>(false);
    const [disabilitaHeader, setDisabilitaHeader] = useState<boolean>(false);

    const [editDatiAnagrafici, setEditDatiAnagrafici] = useState<boolean>(false);
    const [disabilitaDatiAnagrafici, setDisabilitaDatiAnagrafici] = useState<boolean>(false);

    const [editNascitaResidenza, setEditNascitaResidenza] = useState<boolean>(false);
    const [disabilitaNascitaResidenza, setDisabilitaascitaResidenza] = useState<boolean>(false);

    const [editDatiGenerali, setEditDatiGenerali] = useState<boolean>(false);
    const [disabilitaDatiGenerali, setDisabilitaDatiGenerali] = useState<boolean>(false);

    const [editAllegati, setEditAllegati] = useState<boolean>(false);
    // const [editCartaIdentita, setEditCartaIdentita] = useState<boolean>(false);

    const [dipendente, setDipendente] = useState<Dipendente>();
    const [contratti, setContratti] = useState<Contratto[]>([]);
    const datiMancantiHR=datiContrattoMancanti(dipendente);
    const [formContrattoOpen,setFormContrattoOpen] = useState(false);
    const [searchParams] = useSearchParams();
    const [praticaHR,setPraticaHR] = useState<HRPratica|null>(null);
    useEffect(()=>{
      if(!id)return;
      const praticaId=Number(searchParams.get("pratica"));
      let active=true;
      void (async()=>{
        const rows=await hrPratiche();
        const all=rows.filter(p=>p.idOperatore===Number(id)).sort((a,b)=>b.id-a.id);
        const selected=praticaId?all.find(p=>p.id===praticaId):all[0];
        if(!selected){if(active)setPraticaHR(null);return}
        if(window.location.pathname.startsWith("/hr/")&&selected.stato!=="COMPLETATO")await hrPrendiInCarico(selected.id);
        if(active)setPraticaHR(selected);
      })().catch(()=>{if(active)setPraticaHR(null)});
      return ()=>{active=false};
    },[id,searchParams]);

    const [archivioChiamateOpen, setArchivioChiamateOpen] = useState(false);
    const [nuovaChiamataOpen, setNuovaChiamataOpen] = useState(false);
    const [aggiornamentoAzioniHR,setAggiornamentoAzioniHR]=useState(0);
    // The workflow derives status from persisted contracts, UNILAV and PEC confirmations.
    useEffect(()=>{
      if(!praticaHR?.id)return;
      let active=true;
      void hrPratiche().then(rows=>{
        const latest=rows.find(p=>p.id===praticaHR.id);
        if(active&&latest&&(latest.stato!==praticaHR.stato||latest.note!==praticaHR.note))setPraticaHR(latest);
      }).catch(()=>{});
      return ()=>{active=false};
    },[contratti,aggiornamentoAzioniHR,praticaHR?.id]);

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
    const [allegati, setAllegati] = useState<Allegati>();
    const [formDatiAnagrafici, setFormDatiAnagrafici] = useState<FormDatiAnagrafici>({
        nickname: "",
        nome: "",
        cognome: "",
        matricola: "",
        email: "",
        prefisso: "",
        telefono: "",
        codiceFiscale: "",
        sesso: "",
        dataNascita: null,
        luogoNascita: "",
        provinciaNascita: "",
        statoNascita: "",
        cittadinanza: "",
    });

    const [formDatiNascitaResidenza, setFormDatiNascitaResidenza] = useState<FormNascitaResidenza>({
        indirizzoResidenza: "",
        numeroCivicoResidenza: "",
        comuneResidenza: "",
        provinciaResidenza: "",
        capResidenza: "",
        residenzaUgualeDomicilio: false,
        indirizzoDomicilio: "",
        numeroCivicoDomicilio: "",
        comuneDomicilio: "",
        provinciaDomicilio: "",
        capDomicilio: "",
    });

    const [formDatiGenerali, setFormDatiGenerali] = useState<FormDatiGenerali>({
        altezza: null,
        peso: null,
        numeroScarpe: null,
        tagliaVestiti: "",
        livelloIstruzione: "",
        tesserino: "",
    });

    const [imgPrimoPiano, setImgPrimoPiano] = useState<ImageData | undefined>();
    const [imgFiguraIntera, setImgFiguraIntera] = useState<ImageData | undefined>();

    const [imgMezzoBusto, setImgMezzoBusto] = useState<ImageData | undefined>();

    const listaMansioniHeader = [
        "Doorman",
        "Controllo accessi",
        "GPG",
        "Team Leader",
        "Antincendio base",
        "Antincendio avanzato",
        "Primo soccorso"
    ];



    const [formContrattoChiamata, setFormContrattoChiamata] = useState<FormContratto>({
        dataInizio: null,
        dataFine: null,
        dataFirmaContratto: null,
        //  listaMansioni: [],
        //  compensoTotaleLordo: 0,
        //  qualifica: "",
        cittaPredefinita: "MILANO",
        indirizzoPredefinito: "VIA A. RIZZOLI 4",
        cittaAlternativa: "",
        indirizzoAlternativo: "",
        //  giorniPeriodoProva: 0,       
    });

    const [formContrattoOccasionale, setFormContrattoOccasionale] = useState<FormContrattoOccasionale>({
        dataInizio: null,
        dataFine: null,
        dataFirmaContratto: null
    });

    const [formContrattoTempoIndeterminato, setFormContrattoTempoIndeterminato] = useState<FormContrattoTempoIndeterminato>({
        dataInizio: null,
        dataFine: null
    });

    const [formContrattoTempoDeterminato, setFormContrattoTempoDeterminato] = useState<FormContrattoTempoDeterminato>({
        dataInizio: null,
        dataFine: null
    });

    const [formHeader, setFormHeader] = useState<FormHeader>({
        listaMansioni: []
    });

    const [formAllegati, setFormAllegati] = useState<FormAllegati>({
        cartaIdentitaNdocumento: "",
        cartaIdentitaDataScadenza: null,
        tesseraSanitariaNdocumento: "",
        tesseraSanitariaDataScadenza: null,
        permessoSoggiornoNdocumento: "",
        permessoSoggiornoDataScadenza: null,
        antincendioLivello: "",
        antincendioDataConseguimento: null,
        primoSoccorsoLivello: "",
        primoSoccorsoDataConseguimento: null,
        passaportoNdocumento: "",
        passaportoDataScadenza: null,
        formazioneSicurezzaLavoroLivello: "",
        formazioneSicurezzaLavoroDataConseguimento: null,
        blsdLivello: "",
        blsdDataConseguimento: null,
        attestatoPrepostoLivello: "",
        attestatoPrepostoDataConseguimento: null,
        attestatoSecurityManagerDataConseguimento: null,
        attestatoIdoneitaVisitaMedicaDataConseguimento: null,
        attestatoAddettoServiziControlloDataConseguimento: null
    });

    const [formConsegnaBeniFormazione, setFormConsegnaBeniFormazione] = useState<FormConsegnaBeniFormazione>({
        elencoContenutiFormazione: "",
        elencoBeniStrumentali: ""
    });

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
    useEffect(()=>{
      if(!praticaHR)return;
      // Le date suggerite dall'ADMIN restano modificabili nei form originali.
      const toDate=(value:string|null)=>value?new Date(value.slice(0,10)+"T12:00:00"):null;
      const dataInizio=toDate(praticaHR.dataInizio),dataFine=toDate(praticaHR.dataFine);
      setFormContrattoChiamata(prev=>({...prev,dataInizio,dataFine}));
      setFormContrattoOccasionale(prev=>({...prev,dataInizio,dataFine}));
      setFormContrattoTempoDeterminato(prev=>({...prev,dataInizio,dataFine}));
      setFormContrattoTempoIndeterminato(prev=>({...prev,dataInizio,dataFine}));
    },[praticaHR?.id,praticaHR?.dataInizio,praticaHR?.dataFine]);

    useEffect(() => {
        caricaOperatore();
        caricaListaContratti();
        fetchImage('primoPiano');
        fetchImage('mezzoBusto');
        fetchImage('figuraIntera');
        caricaAllegati();
    }, []);

    const getOperatore = async (id: string) => {

        console.log("Sto per chiamare /operatori/ottieniOperatore/", id, new Date().toISOString());
        const resp = await fetch(`${ezystaffBEUrl}operatori/ottieniOperatore/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        });

        const data = await resp.json();
        console.log("Dati ricevuti**********", data);
        return data; // restituisco solo i dati, nessun setState qui
    };

    const caricaOperatore = async () => {
        if (!id) {
            console.error("ID non definito");
            return; // o gestisci diversamente
        }
        try {
            const data = await getOperatore(id);
            console.log("Dati ricevuti**********", data);
            setDipendente(data); // aggiorno lo stato qui
        } catch (error) {
            console.error("Errore nel fetch operatore:", error);
        } finally {
            console.info("Dati caricati");
        }
    };

    type EditSection = "header" | "anagrafici" | "generali" | "nascitaResidenza";

    const setEditMode = (section: EditSection) => {
        const isAnagrafici = section === "anagrafici";
        const isGenerali = section === "generali";
        const isNascitaResidenza = section === "nascitaResidenza";
        const isHeader = section === "header";

        setEditDatiAnagrafici(isAnagrafici);
        setEditDatiGenerali(isGenerali);
        setEditNascitaResidenza(isNascitaResidenza);
        setEditHeader(isHeader);

        setDisabilitaDatiAnagrafici(!isAnagrafici);
        setDisabilitaDatiGenerali(!isGenerali);
        setDisabilitaascitaResidenza(!isNascitaResidenza);
        setDisabilitaHeader(!isHeader);
    };

    const resetEditMode = () => {
        setEditDatiAnagrafici(false);
        setEditDatiGenerali(false);
        setEditNascitaResidenza(false);
        setEditHeader(false);

        setDisabilitaDatiAnagrafici(false);
        setDisabilitaDatiGenerali(false);
        setDisabilitaascitaResidenza(false);
        setDisabilitaHeader(false);
    };


    const editaDatiAnagrafici = () => {
        setFormDatiAnagrafici({
            nickname: dipendente?.nickname || "",
            nome: dipendente?.nome || "",
            cognome: dipendente?.cognome || "",
            matricola: dipendente?.matricola || "",
            email: dipendente?.email || "",
            prefisso: dipendente?.prefisso || "",
            telefono: dipendente?.telefono || "",
            codiceFiscale: dipendente?.codiceFiscale || "",
            sesso: dipendente?.sesso || "",
            dataNascita: dipendente?.dataNascita ? new Date(dipendente.dataNascita) : null,
            luogoNascita: dipendente?.luogoNascita || "",
            provinciaNascita: dipendente?.provinciaNascita || "",
            statoNascita: dipendente?.statoNascita || "",
            cittadinanza: dipendente?.cittadinanza || "",
        });
        setEditMode("anagrafici");
    };

    const editaHeader = () => {
        setFormHeader({
            listaMansioni: dipendente?.listaMansioni || [],
        });
        setEditMode("header");
    }

    const editaAllegati = () => {
        console.log("allegati?.cartaIdentitaNdocumento: " + allegati?.cartaIdentitaNdocumento);
        setFormAllegati({
            cartaIdentitaNdocumento: allegati?.cartaIdentitaNdocumento || "",
            cartaIdentitaDataScadenza: allegati?.cartaIdentitaDataScadenza
                ? new Date(allegati.cartaIdentitaDataScadenza)
                : null,
            tesseraSanitariaNdocumento: allegati?.tesseraSanitariaNdocumento || "",
            tesseraSanitariaDataScadenza: allegati?.tesseraSanitariaDataScadenza
                ? new Date(allegati.tesseraSanitariaDataScadenza)
                : null,
            permessoSoggiornoNdocumento: allegati?.permessoSoggiornoNdocumento || "",
            permessoSoggiornoDataScadenza: allegati?.permessoSoggiornoDataScadenza
                ? new Date(allegati.permessoSoggiornoDataScadenza)
                : null,
            antincendioLivello: allegati?.antincendioLivello || "",
            antincendioDataConseguimento: allegati?.antincendioDataConseguimento
                ? new Date(allegati.antincendioDataConseguimento)
                : null,
            primoSoccorsoLivello: allegati?.primoSoccorsoLivello || "",
            primoSoccorsoDataConseguimento: allegati?.primoSoccorsoDataConseguimento
                ? new Date(allegati.primoSoccorsoDataConseguimento)
                : null,
            passaportoNdocumento: allegati?.passaportoNdocumento || "",
            passaportoDataScadenza: allegati?.passaportoDataScadenza
                ? new Date(allegati.passaportoDataScadenza)
                : null,
            formazioneSicurezzaLavoroLivello: allegati?.formazioneSicurezzaLavoroLivello || "",
            formazioneSicurezzaLavoroDataConseguimento: allegati?.formazioneSicurezzaLavoroDataConseguimento
                ? new Date(allegati.formazioneSicurezzaLavoroDataConseguimento)
                : null,
            blsdLivello: allegati?.blsdLivello || "",
            blsdDataConseguimento: allegati?.blsdDataConseguimento
                ? new Date(allegati.blsdDataConseguimento)
                : null,
            attestatoPrepostoLivello: allegati?.attestatoPrepostoLivello || "",
            attestatoPrepostoDataConseguimento: allegati?.attestatoPrepostoDataConseguimento
                ? new Date(allegati.attestatoPrepostoDataConseguimento)
                : null,
            attestatoSecurityManagerDataConseguimento: allegati?.attestatoSecurityManagerDataConseguimento
                ? new Date(allegati.attestatoSecurityManagerDataConseguimento)
                : null,
            attestatoIdoneitaVisitaMedicaDataConseguimento: allegati?.attestatoIdoneitaVisitaMedicaDataConseguimento
                ? new Date(allegati.attestatoIdoneitaVisitaMedicaDataConseguimento)
                : null,
            attestatoAddettoServiziControlloDataConseguimento: allegati?.attestatoAddettoServiziControlloDataConseguimento
                ? new Date(allegati.attestatoAddettoServiziControlloDataConseguimento)
                : null,

        });


        setEditAllegati(true);
    }

    const editaDatiGenerali = () => {
        setFormDatiGenerali({
            altezza: dipendente?.altezza || null,
            peso: dipendente?.peso || null,
            numeroScarpe: dipendente?.numeroScarpe || null,
            tagliaVestiti: dipendente?.tagliaVestiti || "",
            livelloIstruzione: dipendente?.livelloIstruzione || "",
            tesserino: dipendente?.tesserino || "",
        });
        setEditMode("generali");
    };

    const editaNascitaResidenza = () => {
        setFormDatiNascitaResidenza({
            indirizzoResidenza: dipendente?.indirizzoResidenza || "",
            numeroCivicoResidenza: dipendente?.numeroCivicoResidenza || "",
            comuneResidenza: dipendente?.comuneResidenza || "",
            provinciaResidenza: dipendente?.provinciaResidenza || "",
            residenzaUgualeDomicilio: dipendente?.residenzaUgualeDomicilio ?? false,
            capResidenza: dipendente?.capResidenza || "",
            indirizzoDomicilio: dipendente?.indirizzoDomicilio || "",
            numeroCivicoDomicilio: dipendente?.numeroCivicoDomicilio || "",
            comuneDomicilio: dipendente?.comuneDomicilio || "",
            provinciaDomicilio: dipendente?.provinciaDomicilio || "",
            capDomicilio: dipendente?.capDomicilio || "",
        });
        setEditMode("nascitaResidenza");
    };


    const formatDate = (date: Date) => {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    const aggiornaDatiAnagrafici = async () => {
        try {
            // Creo l'oggetto datiAnagrafici da inviare
            const datiAnagrafici = {
                nickname: formDatiAnagrafici.nickname ?? '',
                nome: formDatiAnagrafici.nome ?? '',
                cognome: formDatiAnagrafici.cognome ?? '',
                matricola: formDatiAnagrafici.matricola ?? '',
                email: formDatiAnagrafici.email ?? '',
                prefisso: formDatiAnagrafici.prefisso ?? '',
                telefono: formDatiAnagrafici.telefono ?? '',
                codiceFiscale: formDatiAnagrafici.codiceFiscale ?? '',
                sesso: formDatiAnagrafici.sesso ?? '',
                dataNascita: formDatiAnagrafici.dataNascita ? formatDate(formDatiAnagrafici.dataNascita) : null,
                luogoNascita: formDatiAnagrafici.luogoNascita ?? '',
                provinciaNascita: formDatiAnagrafici.provinciaNascita ?? '',
                statoNascita: formDatiAnagrafici.statoNascita ?? '',
                cittadinanza: formDatiAnagrafici.cittadinanza ?? '',
            };

            // Chiamata asincrona al backend
            await aggiornaDipendente(datiAnagrafici, "modificaOperatore");

            if (!id) {
                console.error("ID non definito");
                return; // o gestisci diversamente
            }
            const updatedDipendente = await getOperatore(id);

            // Aggiorno lo stato con i dati restituiti dal backend
            setDipendente(updatedDipendente);

            // Reset form e chiudo modalità edit
            setFormDatiAnagrafici({
                nickname: "",
                nome: "",
                cognome: "",
                matricola: "",
                email: "",
                prefisso: "",
                telefono: "",
                codiceFiscale: "",
                sesso: "",
                dataNascita: null,
                luogoNascita: "",
                provinciaNascita: "",
                statoNascita: "",
                cittadinanza: "",
            });
            resetEditMode();

        } catch (error) {
            console.error("Errore durante l'aggiornamento dei dati:", error);
        } finally {
            console.error("Dati aggiornati");
        }
    };

    const aggiornaHeader = async () => {

        try {
            await aggiornaDipendente(formHeader, "aggiornaHeaderOperatore");

            if (!id) {
                console.error("ID non definito");
                return; // o gestisci diversamente
            }
            const updatedDipendente = await getOperatore(id);

            // Aggiorno lo stato con i dati restituiti dal backend
            setDipendente(updatedDipendente);

            // Reset form e chiudo modalità edit
            setFormHeader({
                listaMansioni: []
            });

            resetEditMode();

        } catch (error) {
            console.error("Errore durante l'aggiornamento dei dati:", error);
        } finally {
            console.error("Dati aggiornati");
        }
    }

    const aggiornaAllegati = async () => {

        const datiAllegati = {
            ...formAllegati,
            cartaIdentitaDataScadenza: formAllegati.cartaIdentitaDataScadenza
                ? format(formAllegati.cartaIdentitaDataScadenza, "yyyy-MM-dd")
                : null,
            tesseraSanitariaDataScadenza: formAllegati.tesseraSanitariaDataScadenza
                ? format(formAllegati.tesseraSanitariaDataScadenza, "yyyy-MM-dd")
                : null,
            permessoSoggiornoDataScadenza: formAllegati.permessoSoggiornoDataScadenza
                ? format(formAllegati.permessoSoggiornoDataScadenza, "yyyy-MM-dd")
                : null,
            antincendioDataConseguimento: formAllegati.antincendioDataConseguimento
                ? format(formAllegati.antincendioDataConseguimento, "yyyy-MM-dd")
                : null,
            primoSoccorsoDataConseguimento: formAllegati.primoSoccorsoDataConseguimento
                ? format(formAllegati.primoSoccorsoDataConseguimento, "yyyy-MM-dd")
                : null,
            passaportoDataScadenza: formAllegati.passaportoDataScadenza
                ? format(formAllegati.passaportoDataScadenza, "yyyy-MM-dd")
                : null,
            formazioneSicurezzaLavoroDataConseguimento: formAllegati.formazioneSicurezzaLavoroDataConseguimento
                ? format(formAllegati.formazioneSicurezzaLavoroDataConseguimento, "yyyy-MM-dd")
                : null,
            blsdDataConseguimento: formAllegati.blsdDataConseguimento
                ? format(formAllegati.blsdDataConseguimento, "yyyy-MM-dd")
                : null,
            attestatoPrepostoDataConseguimento: formAllegati.attestatoPrepostoDataConseguimento
                ? format(formAllegati.attestatoPrepostoDataConseguimento, "yyyy-MM-dd")
                : null,
            attestatoSecurityManagerDataConseguimento: formAllegati.attestatoSecurityManagerDataConseguimento
                ? format(formAllegati.attestatoSecurityManagerDataConseguimento, "yyyy-MM-dd")
                : null,
            attestatoIdoneitaVisitaMedicaDataConseguimento: formAllegati.attestatoIdoneitaVisitaMedicaDataConseguimento
                ? format(formAllegati.attestatoIdoneitaVisitaMedicaDataConseguimento, "yyyy-MM-dd")
                : null,
            attestatoAddettoServiziControlloDataConseguimento: formAllegati.attestatoAddettoServiziControlloDataConseguimento
                ? format(formAllegati.attestatoAddettoServiziControlloDataConseguimento, "yyyy-MM-dd")
                : null,
        }

        console.log("datiAllegati: ", datiAllegati);

        await aggiornaDipendente(datiAllegati, "aggiornaAllegatiOperatore");

        caricaAllegati();

        setEditAllegati(false);
    }

    const aggiornaDatiGenerici = async () => {
        try {
            // Chiamata asincrona al backend
            await aggiornaDipendente(formDatiGenerali, "aggiornaDatiGenerici");

            if (!id) {
                console.error("ID non definito");
                return; // o gestisci diversamente
            }
            const updatedDipendente = await getOperatore(id);

            // Aggiorno lo stato con i dati restituiti dal backend
            setDipendente(updatedDipendente);

            // Reset form e chiudo modalità edit
            setFormDatiGenerali({
                altezza: null,
                peso: null,
                numeroScarpe: null,
                tagliaVestiti: "",
                livelloIstruzione: "",
                tesserino: "",
            });
            resetEditMode();

        } catch (error) {
            console.error("Errore durante l'aggiornamento dei dati:", error);
        } finally {
            console.error("Dati aggiornati");
        }
    };

    const aggiornaNascitaResidenza = async () => {
        try {

            await aggiornaDipendente(formDatiNascitaResidenza, "modificaNascitaResidenzaOperatore");

            if (!id) {
                console.error("ID non definito");
                return; // o gestisci diversamente
            }
            const updatedDipendente = await getOperatore(id);

            // Aggiorno lo stato con i dati restituiti dal backend
            setDipendente(updatedDipendente);

            // Reset form e chiudo modalità edit
            setFormDatiNascitaResidenza({
                indirizzoResidenza: "",
                numeroCivicoResidenza: "",
                comuneResidenza: "",
                residenzaUgualeDomicilio: false,
                provinciaResidenza: "",
                capResidenza: "",
                indirizzoDomicilio: "",
                numeroCivicoDomicilio: "",
                comuneDomicilio: "",
                provinciaDomicilio: "",
                capDomicilio: "",
            });
            resetEditMode();

        } catch (error) {
            console.error("Errore durante l'aggiornamento dei dati:", error);
        } finally {
            console.info("Dati aggiornati");
        }
    };

    async function aggiornaDipendente<T>(dipendente: T, scheda: string) {
        try {
            console.log('Dati da inviare per nascita/residenza:', JSON.stringify(dipendente));

            const resp = await fetch(`${ezystaffBEUrl}operatori/${scheda}/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(dipendente),
            });

            if (!resp.ok) {
                throw new Error(`Errore nella richiesta: ${resp.status}`);
            }

            const data = await resp.json(); // restituisce i dati aggiornati dal server
            return data;

        } catch (error) {
            console.error('Errore durante l’invio dei dati nascita/residenza:', error);
            throw error; // rilancio l’errore al chiamante
        }

    }

    const handleChangeDatiAnagrafici = (key: string, value: string | Date | null) => {
        setFormDatiAnagrafici(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleChangeDatiNascitaResidenza = (key: string, value: string | Date | null) => {
        setFormDatiNascitaResidenza(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleChangeDatiGenerali = (key: string, value: string | Date | null) => {
        setFormDatiGenerali(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleChangeContrattoChiamata = (
        key: string,
        value: string | number | Date | string[] | null
    ) => {
        setFormContrattoChiamata((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleChangeContrattoOccasionale = (
        key: string,
        value: Date | null
    ) => {
        setFormContrattoOccasionale((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleChangeContrattoTempoIndeterminato = (
        key: string,
        value: Date | null
    ) => {
        setFormContrattoTempoIndeterminato((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleChangeContrattoTempoDeterminato = (
        key: string,
        value: Date | null
    ) => {
        setFormContrattoTempoDeterminato((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleChangeFormHeader = (
        key: string,
        value: string[] | null
    ) => {
        setFormHeader((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleChangeFormAllegati = (
        key: string, value: string | Date | null
    ) => {
        setFormAllegati((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

    const handleChangeConsegnaBeniFormazione = (
        key: string,
        value: string | null
    ) => {
        setFormConsegnaBeniFormazione((prev) => ({
            ...prev,
            [key]: value,
        }))
    }

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

        console.log("***contrattoFinale*****: ", contrattoFinale);

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
        console.log(data);
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

            console.log("*** contratto generato ***", data);

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

            console.log("*** contratto CHIAMATA ***", contrattoFinale);

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
            console.log("*** contratto OCCASIONALE ***", contrattoFinale);
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

            console.log(
                "*** contratto CONSEGNA BENI FORMAZIONE ***",
                contrattoFinale
            );

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
            console.log("*** contratto tempo indeterminato ***", contrattoFinale);
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
            console.log("*** contratto tempo determinato ***", contrattoFinale);
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
        console.log(data);
        setContratti(data);
        console.info("**CARICAMENTO CONTRATTI FINE**");
        return data as Contratto[];
    }

    const caricaAllegati = async () => {
        const resp = await fetch(ezystaffBEUrl + `operatori/allegatiOperatore/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.info("**CARICAMENTO ALLEGATI INIZIO**");
        console.log(data);
        setAllegati(data);
        console.info("**CARICAMENTO ALLEGATI FINE**");
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

            console.log(data);

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
                console.log(data);
    
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
            console.log(data);

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

    const dowloadAllegato = async (tipoAllegato?: string) => {

        if (!tipoAllegato) {
            console.warn('Download allegato saltato: parametri mancanti');
            return;
        }

        const urlScaricaAllegato = new URL(
            `${ezystaffBEUrl}upload/scaricaAllegato/${id}`
        );
        urlScaricaAllegato.searchParams.append("tipoAllegato", tipoAllegato);

        const response = await fetch(urlScaricaAllegato.toString(), {
            method: "GET",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
                accept: "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Errore download PDF");
        }

        const contentDisposition = response.headers.get("Content-Disposition");

        let fileName = tipoAllegato;

        if (contentDisposition) {
            const match = contentDisposition.match(/filename="?([^"]+)"?/);
            if (match) {
                fileName = match[1];
            }
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    };

    type TipoContrattoUpload = "contrattoFirmato" | "contrattoUnilav";

    const caricaContrattoFirmato = async (
        e: React.ChangeEvent<HTMLInputElement>,
        idContratto: number,
        tipoContratto: TipoContrattoUpload
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("Upload file:", file, "per contratto:", idContratto);

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

            const data = await response.json();
            console.log("Upload completato con successo:", data);
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

    const caricaDocumento = async (
        e: React.ChangeEvent<HTMLInputElement>,
        nomeFileAllegato?: string
    ) => {

        if (!nomeFileAllegato) {
            console.warn('Download allegato saltato: parametri mancanti');
            return;
        }

        const file = e.target.files?.[0];
        if (!file) return;

        console.log("Upload file:", file, "id operatore:", id);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("nomeFileAllegato", nomeFileAllegato);

        try {

            const response = await fetch(ezystaffBEUrl + `upload/caricaDocumentoPersonale/${id}`,
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

            const data = await response.json();
            console.log("Upload completato con successo:", data);
            // Qui puoi aggiornare lo stato o mostrare un messaggio di successo
            caricaAllegati();
        } catch (error) {
            console.error("Errore durante l'upload:", error);
            // Qui puoi gestire l'errore (es. mostrare alert)
        }

    };

    const eliminaDocumento = async (tipoAllegato?: string) => {

        if (!tipoAllegato) {
            console.warn('Download allegato saltato: parametri mancanti');
            return;
        }

        const urlEliminaAllegato = new URL(
            `${ezystaffBEUrl}upload/eliminaAllegato/${id}`
        );
        urlEliminaAllegato.searchParams.append("tipoAllegato", tipoAllegato);

        const response = await fetch(urlEliminaAllegato.toString(), {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
                accept: "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Errore download PDF");
        }

        caricaAllegati();

    }

    const caricaImmagine = async (
        e: React.ChangeEvent<HTMLInputElement>,
        tipoImmagine: string
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        console.log("Upload file:", file, "per contratto:", id, "tipoImmagine: " + tipoImmagine);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("tipoImmagine", tipoImmagine);

        try {

            const response = await fetch(ezystaffBEUrl + `upload/immagineProfilo/${id}`,
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

            const data = await response.json();
            console.log("Upload completato con successo:", data);
            await fetchImage(tipoImmagine);
            await caricaListaContratti();
            // Qui puoi aggiornare lo stato o mostrare un messaggio di successo
        } catch (error) {
            console.error("Errore durante l'upload:", error);
            // Qui puoi gestire l'errore (es. mostrare alert)
        }
    };

    const fetchImage = async (tipoImmagine: string) => {
        const response = await fetch(
            `${ezystaffBEUrl}upload/mostraImmagineProfilo/${id}?tipoImmagine=${tipoImmagine}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                credentials: "include",
            }
        );

        let imageUrl: string | null = null;
        let extension: string | null = null;

        if (response.status !== 204) {
            const blob = await response.blob();

            // sicurezza aggiuntiva
            if (blob.size > 0) {
                imageUrl = URL.createObjectURL(blob);
                extension = blob.type.split("/")[1] ?? null;
            }
        }

        console.log(imageUrl);
        console.log(extension);

        switch (tipoImmagine) {
            case 'primoPiano':
                setImgPrimoPiano({
                    url: imageUrl,
                    extension
                });
                break;

            case 'mezzoBusto':
                setImgMezzoBusto({
                    url: imageUrl,
                    extension
                });
                break;

            case 'figuraIntera':
                setImgFiguraIntera({
                    url: imageUrl,
                    extension
                });
                break;
        }
    };


    return (
        <section className="m-6">

            <HeaderDipendenteComponent
                editHeader={editHeader}
                disabilitaHeader={disabilitaHeader}
                dipendente={dipendente}
                imgPrimoPiano={imgPrimoPiano}
                imgFiguraIntera={imgFiguraIntera}
                imgMezzoBusto={imgMezzoBusto}
                listaMansioniHeader={listaMansioniHeader}
                formHeader={formHeader}
                editaHeader={editaHeader}
                aggiornaHeader={aggiornaHeader}
                handleChangeFormHeader={handleChangeFormHeader}
                caricaImmagine={caricaImmagine}
            />

            <Tabs key={searchParams.get("tab")||"contratti"} defaultValue={searchParams.get("tab")||"contratti"}>
                <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-2 rounded-xl border border-[#cfe2dc] bg-white p-2 shadow-sm">
                    <TabsTrigger value="contratti" className="inline-flex flex-none items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-gray-600 data-[state=active]:bg-[#007a55] data-[state=active]:text-white data-[state=active]:shadow-sm"><FileText className="h-4 w-4"/>Contratti</TabsTrigger>
                    <TabsTrigger value="anagrafica" className="inline-flex flex-none items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-gray-600 data-[state=active]:bg-[#007a55] data-[state=active]:text-white data-[state=active]:shadow-sm"><UserRound className="h-4 w-4"/>Anagrafica</TabsTrigger>
                    <TabsTrigger value="allegati" className="inline-flex flex-none items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-gray-600 data-[state=active]:bg-[#007a55] data-[state=active]:text-white data-[state=active]:shadow-sm"><Paperclip className="h-4 w-4"/>Allegati</TabsTrigger>
                </TabsList>

                <TabsContent value="anagrafica">
                    <div className="flex justify-between items-start">
                        <div className="flex-[0_0_49%]">

                            <DatiAnagraficiComponent
                                editDatiAnagrafici={editDatiAnagrafici}
                                disabilitaDatiAnagrafici={disabilitaDatiAnagrafici}
                                formDatiAnagrafici={formDatiAnagrafici}
                                dipendente={dipendente}
                                editaDatiAnagrafici={editaDatiAnagrafici}
                                aggiornaDatiAnagrafici={aggiornaDatiAnagrafici}
                                handleChangeDatiAnagrafici={handleChangeDatiAnagrafici}
                            />
                            <div className="mt-6">
                                <DatiGeneraliComponent
                                    editDatiGenerali={editDatiGenerali}
                                    disabilitaDatiGenerali={disabilitaDatiGenerali}
                                    formDatiGenerali={formDatiGenerali}
                                    dipendente={dipendente}
                                    editaDatiGenerali={editaDatiGenerali}
                                    aggiornaDatiGenerici={aggiornaDatiGenerici}
                                    handleChangeDatiGenerali={handleChangeDatiGenerali}
                                />
                            </div>
                        </div>

                        <div className="flex-[0_0_49%] flex">
                            <NascitaResidenzaComponent
                                editNascitaResidenza={editNascitaResidenza}
                                disabilitaNascitaResidenza={disabilitaNascitaResidenza}
                                formDatiNascitaResidenza={formDatiNascitaResidenza}
                                dipendente={dipendente}
                                editaNascitaReidenza={editaNascitaResidenza}
                                aggiornaNascitaResidenza={aggiornaNascitaResidenza}
                                handleChangeDatiNascitaResidenza={handleChangeDatiNascitaResidenza}
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="contratti" className="space-y-5">
                  <ContrattoAttivoHR
                    contratti={contratti}
                    idOperatore={id}
                    pratica={praticaHR}
                    codiceFiscale={dipendente?.codiceFiscale}
                    datiMancanti={datiMancantiHR}
                    isHR={window.location.pathname.startsWith("/hr/")}
                    azioni={praticaHR?.tipologia==="CHIAMATA"&&id?(
                      <AzioniHRIntermittenti
                        key={aggiornamentoAzioniHR}
                        idOperatore={Number(id)}
                        readOnly={!window.location.pathname.startsWith("/hr/")}
                        pratica={praticaHR}
                        contratti={contratti}
                        codiceFiscale={dipendente?.codiceFiscale||""}
                        onCreateContract={()=>setFormContrattoOpen(true)}
                        missingPrerequisites={datiMancantiHR.length>0}
                        createFields={window.location.pathname.startsWith("/hr/")?<div className="w-full space-y-3 rounded-lg border bg-white p-3">
                          <p className="text-xs text-gray-600">Periodo definito dall'ADMIN: {praticaHR.dataInizio?.slice(0,10)||"—"} – {praticaHR.dataFine?.slice(0,10)||"—"}</p>
                          <label className="block text-xs">Data firma contratto<input type="date" className="mt-1 block w-full rounded border bg-white p-2" value={formContrattoChiamata.dataFirmaContratto?format(formContrattoChiamata.dataFirmaContratto,"yyyy-MM-dd"):""} onChange={e=>setFormContrattoChiamata(v=>({...v,dataFirmaContratto:e.target.value?new Date(e.target.value+"T12:00:00"):null}))}/></label>
                          <div className="grid gap-2 md:grid-cols-2">{(["cittaPredefinita","indirizzoPredefinito","cittaAlternativa","indirizzoAlternativo"] as const).map(k=><label key={k} className="block text-xs">{({cittaPredefinita:"Città sede",indirizzoPredefinito:"Indirizzo sede",cittaAlternativa:"Città alternativa",indirizzoAlternativo:"Indirizzo alternativo"})[k]}<input className="mt-1 block w-full rounded border bg-white p-2" value={formContrattoChiamata[k]} onChange={e=>setFormContrattoChiamata(v=>({...v,[k]:e.target.value}))}/></label>)}</div>
                          <button type="button" disabled={loading||datiMancantiHR.length>0||!praticaHR.dataInizio||!praticaHR.dataFine} onClick={()=>void generaContrattoChiamata()} className="rounded bg-[#007a55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading?"Generazione…":"Genera contratto a chiamata"}</button>
                        </div>:null}
                        onProgressUpdated={()=>setAggiornamentoAzioniHR(x=>x+1)}
                      />
                    ):praticaHR?(
                      contratti.some(c=>c.tipologia.replace(/^CONTRATTO_/,"")===praticaHR.tipologia&&!!praticaHR.dataInizio&&c.dataInizio?.slice(0,10)===praticaHR.dataInizio.slice(0,10))
                      ?null
                      :<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-sm font-semibold text-[#273b35]">Crea {praticaHR.tipologia.replace(/_/g," ").toLowerCase()}</p>
                        {praticaHR.tipologia!=="FATTURA"&&window.location.pathname.startsWith("/hr/")&&<div className="w-full space-y-3 rounded-lg border bg-white p-4">
                          <p className="text-xs text-gray-500">Periodo definito dall'ADMIN: {praticaHR.dataInizio?.slice(0,10)||"—"} – {praticaHR.dataFine?.slice(0,10)||"senza scadenza"}</p>
                          {tipoContratto==="OCCASIONALE"&&<label className="block text-sm">Data firma contratto<input type="date" className="mt-1 block w-full rounded border bg-white p-2" value={formContrattoOccasionale.dataFirmaContratto?format(formContrattoOccasionale.dataFirmaContratto,"yyyy-MM-dd"):""} onChange={e=>setFormContrattoOccasionale(v=>({...v,dataFirmaContratto:e.target.value?new Date(e.target.value+"T12:00:00"):null}))}/></label>}
                          {tipoContratto==="CONSGNA_BENI_FORMAZIONE"&&<ConsegnaBeniFormazioneComponent formConsegnaBeniFormazione={formConsegnaBeniFormazione} handleChangeConsegnaBeniFormazione={handleChangeConsegnaBeniFormazione}/>}
                          <button type="button" disabled={loading||datiMancantiHR.length>0||!praticaHR.dataInizio} onClick={()=>void (tipoContratto==="OCCASIONALE"?generaContrattoOccasionale():tipoContratto==="CONTRATTO_TEMPO_DETERMINATO"?generaContrattoTempoDeterminato():tipoContratto==="CONTRATTO_TEMPO_INDETERMINATO"?generaContrattoTempoIndeterminato():tipoContratto==="CONSGNA_BENI_FORMAZIONE"?generaContrattoConsegnaBeniFormazione():Promise.resolve())} className="rounded-md bg-[#007a55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading?"Generazione…":"Genera contratto"}</button>
                        </div>}
                      </div>
                    ):null}
                    archivioChiamate={praticaHR?.tipologia==="CHIAMATA"&&id?(
                      <AzioniHRIntermittenti
                        key={"archivio-"+aggiornamentoAzioniHR}
                        mode="archive"
                        readOnly={!window.location.pathname.startsWith("/hr/")}
                        idOperatore={Number(id)}
                        pratica={praticaHR}
                        contratti={contratti}
                        codiceFiscale={dipendente?.codiceFiscale||""}
                        onCreateContract={()=>setFormContrattoOpen(true)}
                      />
                    ):null}
                    onCreate={()=>setFormContrattoOpen(true)}
                    onPeriodSave={async (dataInizio,dataFine)=>{
                      if(!praticaHR)return;
                      await hrAggiornaPeriodo(praticaHR.id,dataInizio,dataFine);
                      setPraticaHR({...praticaHR,dataInizio,dataFine});
                      const date=(value:string|null)=>value?new Date(value+"T12:00:00"):null;
                      setFormContrattoChiamata(old=>({...old,dataInizio:date(dataInizio),dataFine:date(dataFine)}));
                      setFormContrattoOccasionale(old=>({...old,dataInizio:date(dataInizio),dataFine:date(dataFine)}));
                      setFormContrattoTempoDeterminato(old=>({...old,dataInizio:date(dataInizio),dataFine:date(dataFine)}));
                      setFormContrattoTempoIndeterminato(old=>({...old,dataInizio:date(dataInizio),dataFine:date(dataFine)}));
                    }}
                    onDownload={(contractId,kind)=>{void dowloadPdf(contractId,kind)}}
                    onUpload={(event,contractId,kind)=>{void caricaContrattoFirmato(event,contractId,kind)}}
                    onDelete={async(contractId,kind)=>{
                      if(kind==="contratto")await getsioneCancellazioneTuttiContratti(contractId);
                      else await getsioneCancellazioneSingoloContratto(contractId,kind);
                      await caricaListaContratti();
                      setAggiornamentoAzioniHR(x=>x+1);
                    }}

                  />
                  <ArchivioContrattiHR contratti={contrattiPrecedenti} idOperatore={Number(id)} codiceFiscale={dipendente?.codiceFiscale||""} onDownload={(contractId,kind)=>{void dowloadPdf(contractId,kind)}}/>
                  <Dialog open={formContrattoOpen} onOpenChange={setFormContrattoOpen}>
                    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[780px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-[#007a55]">Crea {tipoContratto?tipoContratto.replace(/_/g," ").toLowerCase():"contratto"}</DialogTitle>
                        <DialogDescription>Completa i campi richiesti e genera il documento. Il form riprende tutte le sezioni originali del generatore.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-5">
                        <div className="w-full"> {/* Left side - Event details (40%) */}
                            <div className="text-[26px] font-extrabold font-[800] text-[#007a55] text-center border-b border-[#d8d8d8] pb-2 mb-6">
                                Compila i dati del contratto
                            </div>

                            <div className="mb-4 rounded-lg border border-[#cfe2dc] bg-white p-4">
                                <div className="text-xs font-semibold text-gray-500">Tipologia assegnata dall'ADMIN</div>
                                <div className="mt-1 font-bold text-[#007a55]">{praticaHR?.tipologia?.replace(/_/g," ") || "Nessuna pratica selezionata"}</div>
                                <div className="mt-1 text-sm text-gray-500">Il tipo di contratto non è modificabile dall'HR: per cambiarlo occorre una nuova assegnazione ADMIN.</div>
                            </div>
                            {!praticaHR && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Apri una pratica dalla coda HR per compilare il contratto assegnato.</p>}
                            {praticaHR && !tipoContratto && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">La tipologia richiesta non dispone ancora di un form di generazione: chiedere all'ADMIN una tipologia supportata.</p>}


                            {tipoContratto === "CHIAMATA" && (
                                <>
                                    <ContrattoChiamataComponent
                                        formContrattoChiamata={formContrattoChiamata}
                                        handleChangeContrattoChiamata={handleChangeContrattoChiamata}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoChiamata}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading ? "Generazione in corso..." : "GENERA CONTRATTO CHIAMATA"}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {tipoContratto === "OCCASIONALE" && (
                                <>
                                    <ContrattoOccasionaleComponent
                                        formContrattoOccasionale={formContrattoOccasionale}
                                        handleChangeContrattoChiamata={handleChangeContrattoOccasionale}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoOccasionale}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading ? "Generazione in corso..." : "GENERA CONTRATTO OCCASIONALE"}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {tipoContratto === "CONSGNA_BENI_FORMAZIONE" && (
                                <>
                                    <ConsegnaBeniFormazioneComponent
                                        formConsegnaBeniFormazione={formConsegnaBeniFormazione}
                                        handleChangeConsegnaBeniFormazione={handleChangeConsegnaBeniFormazione}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoConsegnaBeniFormazione}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading
                                                ? "Generazione in corso..."
                                                : "GENERA CONTRATTO CONSEGNA BENI"}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {tipoContratto === "CONTRATTO_TEMPO_INDETERMINATO" && (
                                <>
                                    <ContrattoTempoIndeterminatoComponent
                                        formContrattoTempoIndeterminato={formContrattoTempoIndeterminato}
                                        handleChangeContrattoTempoIndeterminato={handleChangeContrattoTempoIndeterminato}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoTempoIndeterminato}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading ? "Generazione in corso..." : "GENERA CONTRATTO TEMPO INDETERMINATO"}
                                        </Button>
                                    </div>
                                </>
                            )}
                            {tipoContratto === "CONTRATTO_TEMPO_DETERMINATO" && (
                                <>
                                    <ContrattoTempoDeterminatoComponent
                                        formContrattoTempoDeterminato={formContrattoTempoDeterminato}
                                        handleChangeContrattoTempoDeterminato={handleChangeContrattoTempoDeterminato}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoTempoDeterminato}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading ? "Generazione in corso..." : "GENERA CONTRATTO TEMPO DETERMINATO"}
                                        </Button>
                                    </div>
                                </>
                            )}
                            {/*
                            {tipoContratto === "CHIAMATA" && (
                                <ContrattoChiamataComponent
                                    formContrattoChiamata={formContrattoChiamata}
                                    handleChangeContrattoChiamata={handleChangeContrattoChiamata}
                                />
                            )}

                            {tipoContratto === "OCCASIONALE" && (
                                <ContrattoOccasionaleComponent
                                    formContrattoOccasionale={formContrattoOccasionale}
                                    handleChangeContrattoChiamata={handleChangeContrattoOccasionale}
                                />
                            )}
                            {tipoContratto === "CONSGNA_BENI_FORMAZIONE" && (
                                <ConsegnaBeniFormazioneComponent
                                    formConsegnaBeniFormazione={formConsegnaBeniFormazione}
                                    handleChangeConsegnaBeniFormazione={handleChangeConsegnaBeniFormazione}
                                />
                            )}
                            <div className="w-full mt-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => generaContratto()}
                                    className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                >
                                    {loading ? "Generazione in corso..." : "GENERA CONTRATTO"}
                                </Button>
                            </div>
                            */}
                        </div>

                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
                <TabsContent value="allegati">
                    <div className="rounded-[9px] shadow-[0_2px_4px_0_rgba(168,166,166,0.5)] p-6 mb-6">
                        {/* ACTION BUTTON */}
                        <div className="flex items-center justify-end">
                            {editAllegati ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={aggiornaAllegati}
                                >
                                    <LockKeyholeOpen className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={editaAllegati}
                                >
                                    <LockKeyhole className="h-4 w-4" />
                                </Button>
                            )}
                        </div>



                        <div className="grid grid-cols-2 gap-6">


                            <TypeCardAComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                numdocumentoKey="cartaIdentitaNdocumento"
                                numdocumentoValue={formAllegati?.cartaIdentitaNdocumento ?? ""}
                                numeroDocumento={allegati?.cartaIdentitaNdocumento ?? ""}

                                dataScadenzaKey="cartaIdentitaDataScadenza"
                                dataScadenzaValue={
                                    formAllegati?.cartaIdentitaDataScadenza
                                        ? new Date(formAllegati.cartaIdentitaDataScadenza)
                                        : null
                                }
                                dataScadenza={
                                    allegati?.cartaIdentitaDataScadenza
                                        ? new Date(allegati.cartaIdentitaDataScadenza)
                                        : null
                                }

                                tipoFronte="carta_identita_img_fronte"
                                tipoRetro="carta_identita_img_retro"
                                imgFronte={allegati?.cartaIdentitaImgFronte ?? null}
                                imgRetro={allegati?.cartaIdentitaImgRetro ?? null}

                                titoloDocumento="Carta d'Identità"
                            />


                            <TypeCardAComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                numdocumentoKey="tesseraSanitariaNdocumento"
                                numdocumentoValue={formAllegati?.tesseraSanitariaNdocumento ?? ""}
                                numeroDocumento={allegati?.tesseraSanitariaNdocumento ?? ""}

                                dataScadenzaKey="tesseraSanitariaDataScadenza"
                                dataScadenzaValue={
                                    formAllegati?.tesseraSanitariaDataScadenza
                                        ? new Date(formAllegati.tesseraSanitariaDataScadenza)
                                        : null
                                }
                                dataScadenza={
                                    allegati?.tesseraSanitariaDataScadenza
                                        ? new Date(allegati.tesseraSanitariaDataScadenza)
                                        : null
                                }

                                tipoFronte="tessera_sanitaria_img_fronte"
                                tipoRetro="tessera_sanitaria_img_retro"
                                imgFronte={allegati?.tesseraSanitariaImgFronte ?? null}
                                imgRetro={allegati?.tesseraSanitariaImgRetro ?? null}

                                titoloDocumento="Tessera sanitaria"
                            />

                            <TypeCardAComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                numdocumentoKey="passaportoNdocumento"
                                numdocumentoValue={formAllegati?.passaportoNdocumento ?? ""}
                                numeroDocumento={allegati?.passaportoNdocumento ?? ""}

                                dataScadenzaKey="passaportoDataScadenza"
                                dataScadenzaValue={
                                    formAllegati?.passaportoDataScadenza
                                        ? new Date(formAllegati.passaportoDataScadenza)
                                        : null
                                }
                                dataScadenza={
                                    allegati?.passaportoDataScadenza
                                        ? new Date(allegati.passaportoDataScadenza)
                                        : null
                                }

                                tipoFronte="passaporto_img_fronte"
                                tipoRetro="passaporto_img_retro"
                                imgFronte={allegati?.passaportoImgFronte ?? null}
                                imgRetro={allegati?.passaportoImgRetro ?? null}

                                titoloDocumento="Passaporto"
                            />

                            <TypeCardAComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                numdocumentoKey="permessoSoggiornoNdocumento"
                                numdocumentoValue={formAllegati?.permessoSoggiornoNdocumento ?? ""}
                                numeroDocumento={allegati?.permessoSoggiornoNdocumento ?? ""}

                                dataScadenzaKey="permessoSoggiornoDataScadenza"
                                dataScadenzaValue={
                                    formAllegati?.permessoSoggiornoDataScadenza
                                        ? new Date(formAllegati.permessoSoggiornoDataScadenza)
                                        : null
                                }
                                dataScadenza={
                                    allegati?.permessoSoggiornoDataScadenza
                                        ? new Date(allegati.permessoSoggiornoDataScadenza)
                                        : null
                                }

                                tipoFronte="permesso_soggiorno_img_fronte"
                                tipoRetro="permesso_soggiorno_img_retro"
                                imgFronte={allegati?.permessoSoggiornoImgFronte ?? null}
                                imgRetro={allegati?.permessoSoggiornoImgRetro ?? null}

                                titoloDocumento="Permesso di Soggiorno"
                            />

                            <TypeCardBComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                livelloKey="antincendioLivello"
                                livelloValue={formAllegati?.antincendioLivello ?? ""}
                                livello={allegati?.antincendioLivello ?? ""}
                                items={[
                                    { value: "L.1: 4h. ex risc.basso", label: "L.1: 4h. ex risc.basso" },
                                    { value: "L.2: 8h. ex risc.medio", label: "L.2: 8h. ex risc.medio" },
                                    { value: "L.3: 16h. ex risc.alto", label: "L.3: 16h. ex risc.alto" },
                                    { value: "L.3 + idoneità tecnica", label: "L.3 + idoneità tecnica" },
                                ]}

                                dataConseguimentoKey="antincendioDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.antincendioDataConseguimento
                                        ? new Date(formAllegati.antincendioDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.antincendioDataConseguimento
                                        ? new Date(allegati.antincendioDataConseguimento)
                                        : null
                                }

                                tipoFronte="antincendio_doc_fronte"
                                //   tipoRetro="antincendio_doc_retro"
                                imgFronte={allegati?.antincendioDocFronte ?? null}
                                //   imgRetro={allegati?.antincendioDocRetro ?? null}

                                titoloDocumento="Attestato Antincendio"
                            />

                            <TypeCardDComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}
                                tipoFronte="attestato_indoneita_tecnica_antincendio_fronte"
                                imgFronte={allegati?.attestatoIndoneitaTecnicaAntincendioFronte ?? null}

                                titoloDocumento="Attestato  indoneità tecnica antincendio"
                            />

                            <TypeCardBComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                livelloKey="primoSoccorsoLivello"
                                livelloValue={formAllegati?.primoSoccorsoLivello ?? ""}
                                livello={allegati?.primoSoccorsoLivello ?? ""}
                                items={[
                                    { value: "Gruppo A: 16h.", label: "Gruppo A: 16h." },
                                    { value: "Gruppo B e C: 12h.", label: "Gruppo B e C: 12h." },
                                ]}

                                dataConseguimentoKey="primoSoccorsoDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.primoSoccorsoDataConseguimento
                                        ? new Date(formAllegati.primoSoccorsoDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.primoSoccorsoDataConseguimento
                                        ? new Date(allegati.primoSoccorsoDataConseguimento)
                                        : null
                                }

                                tipoFronte="primo_soccorso_attestato_fronte"
                                //   tipoRetro="primo_soccorso_attestato_retro"
                                imgFronte={allegati?.primoSoccorsoAttestatoFronte ?? null}
                                //   imgRetro={allegati?.primoSoccorsoAttestatoRetro ?? null}

                                titoloDocumento="Attestato primo soccorso"
                            />

                            <TypeCardBComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                livelloKey="formazioneSicurezzaLavoroLivello"
                                livelloValue={formAllegati?.formazioneSicurezzaLavoroLivello ?? ""}
                                livello={allegati?.formazioneSicurezzaLavoroLivello ?? ""}
                                items={[
                                    { value: "Generale 4h.", label: "Generale 4h." },
                                    { value: "Rischio Bas.: Gen.4h.+Risc.spec.4h.", label: "Rischio Bas.: Gen.4h.+Risc.spec.4h." },
                                    { value: "Rischio Med.: Gen.4h.+Risc.spec.8h.", label: "Rischio Med.: Gen.4h.+Risc.spec.8h." },
                                    { value: "Rischio Alto: Gen.4h.+Risc.spec.12h.", label: "Rischio Alto: Gen.4h.+Risc.spec.12h." },
                                ]}

                                dataConseguimentoKey="formazioneSicurezzaLavoroDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.formazioneSicurezzaLavoroDataConseguimento
                                        ? new Date(formAllegati.formazioneSicurezzaLavoroDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.formazioneSicurezzaLavoroDataConseguimento
                                        ? new Date(allegati.formazioneSicurezzaLavoroDataConseguimento)
                                        : null
                                }

                                tipoFronte="formazione_sicurezza_lavoro_attestato_fronte"
                                //   tipoRetro="formazione_sicurezza_lavoro_attestato_retro"
                                imgFronte={allegati?.formazioneSicurezzaLavoroAttestatoFronte ?? null}
                                //   imgRetro={allegati?.formazioneSicurezzaLavoroAttestatoRetro ?? null}

                                titoloDocumento="Attestato formazione sicurezza sul lavoro"
                            />

                            <TypeCardBComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                livelloKey="blsdLivello"
                                livelloValue={formAllegati?.blsdLivello ?? ""}
                                livello={allegati?.blsdLivello ?? ""}
                                items={[
                                    { value: "Base", label: "Base" },
                                    { value: "Aggiornamento", label: "Aggiornamento" },
                                ]}

                                dataConseguimentoKey="blsdDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.blsdDataConseguimento
                                        ? new Date(formAllegati.blsdDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.blsdDataConseguimento
                                        ? new Date(allegati.blsdDataConseguimento)
                                        : null
                                }

                                tipoFronte="blsd_attestato_fronte"
                                //  tipoRetro="blsd_attestato_retro"
                                imgFronte={allegati?.blsdAttestatoFronte ?? null}
                                //  imgRetro={allegati?.blsdAttestatoRetro ?? null}

                                titoloDocumento="Attestato BLSD"
                            />

                            <TypeCardCComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                //livelloKey="attestatoPrepostoLivello"
                                //livelloValue={formAllegati?.attestatoPrepostoLivello ?? ""}
                                //livello={allegati?.attestatoPrepostoLivello ?? ""}

                                // items={[
                                //    { value: "Base", label: "Base" },
                                //    { value: "Aggiornamento", label: "Aggiornamento" },
                                // ]}

                                dataConseguimentoKey="attestatoPrepostoDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.attestatoPrepostoDataConseguimento
                                        ? new Date(formAllegati.attestatoPrepostoDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.attestatoPrepostoDataConseguimento
                                        ? new Date(allegati.attestatoPrepostoDataConseguimento)
                                        : null
                                }

                                tipoFronte="attestato_preposto_fronte"
                                // tipoRetro="attestato_preposto_retro"
                                imgFronte={allegati?.attestatoPrepostoFronte ?? null}
                                // imgRetro={allegati?.attestatoPrepostoRetro ?? null}

                                titoloDocumento="Attestato Preposto"
                            />

                            <TypeCardCComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                dataConseguimentoKey="attestatoSecurityManagerDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.attestatoSecurityManagerDataConseguimento
                                        ? new Date(formAllegati.attestatoSecurityManagerDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.attestatoSecurityManagerDataConseguimento
                                        ? new Date(allegati.attestatoSecurityManagerDataConseguimento)
                                        : null
                                }

                                tipoFronte="attestato_security_manager_fronte"
                                imgFronte={allegati?.attestatoSecurityManagerFronte ?? null}

                                titoloDocumento="Security Manager"
                            />

                            <TypeCardCComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                dataConseguimentoKey="attestatoIdoneitaVisitaMedicaDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.attestatoIdoneitaVisitaMedicaDataConseguimento
                                        ? new Date(formAllegati.attestatoIdoneitaVisitaMedicaDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.attestatoIdoneitaVisitaMedicaDataConseguimento
                                        ? new Date(allegati.attestatoIdoneitaVisitaMedicaDataConseguimento)
                                        : null
                                }
                                tipoFronte="attestato_idoneita_visita_medica_fronte"
                                imgFronte={allegati?.attestatoIdoneitaVisitaMedicaFronte ?? null}

                                titoloDocumento="Avvenuta Idoneità alla mansione/visita medica"
                            />

                            <TypeCardCComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                dataConseguimentoKey="attestatoAddettoServiziControlloDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.attestatoAddettoServiziControlloDataConseguimento
                                        ? new Date(formAllegati.attestatoAddettoServiziControlloDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.attestatoAddettoServiziControlloDataConseguimento
                                        ? new Date(allegati.attestatoAddettoServiziControlloDataConseguimento)
                                        : null
                                }
                                tipoFronte="attestato_addetto_servizi_controllo_fronte"
                                imgFronte={allegati?.attestatoAddettoServiziControlloFronte ?? null}

                                titoloDocumento="Attestato addetto servizi controllo"
                            />

                        </div>

                    </div>


                </TabsContent>
            </Tabs>
            <IntermittentiDialog open={archivioChiamateOpen} setOpen={setArchivioChiamateOpen} contrattoPadre={contrattoPadre} operatore={{nome:dipendente?.nome||"",cognome:dipendente?.cognome||"",codiceFiscale:dipendente?.codiceFiscale||""}} idOperatore={Number(id)} onUpdated={()=>void aggiornaChiamate()} />
            <NuovaChiamataIntermittenteDialog open={nuovaChiamataOpen} setOpen={setNuovaChiamataOpen} contrattoPadre={contrattoPadre} operatore={{nome:dipendente?.nome||"",cognome:dipendente?.cognome||"",codiceFiscale:dipendente?.codiceFiscale||""}} idOperatore={Number(id)} onSaved={()=>{void aggiornaChiamate();setAggiornamentoAzioniHR(x=>x+1)}} dataInizioProposta={dateProposta?.inizio} dataFineProposta={dateProposta?.fine} />
        </section>
    )
}

export default DettaglioOperatore