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

        const resp = await fetch(`${ezystaffBEUrl}operatori/ottieniOperatore/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        });

        const data = await resp.json();
        return data; // restituisco solo i dati, nessun setState qui
    };

    const caricaOperatore = async () => {
        if (!id) {
            console.error("ID non definito");
            return; // o gestisci diversamente
        }
        try {
            const data = await getOperatore(id);
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

            await response.json();
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

            await response.json();
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



  return {
    aggiornaAllegati, aggiornaChiamate, aggiornaDatiAnagrafici, aggiornaDatiGenerici, aggiornaHeader, aggiornaNascitaResidenza, aggiornamentoAzioniHR, allegati, archivioChiamateOpen, caricaContrattoFirmato, caricaDocumento, caricaImmagine, caricaListaContratti, contratti, contrattiPrecedenti, contrattoPadre, dateProposta, datiMancantiHR, dipendente, disabilitaDatiAnagrafici, disabilitaDatiGenerali, disabilitaHeader, disabilitaNascitaResidenza, dowloadAllegato, dowloadPdf, editAllegati, editDatiAnagrafici, editDatiGenerali, editHeader, editNascitaResidenza, editaAllegati, editaDatiAnagrafici, editaDatiGenerali, editaHeader, editaNascitaResidenza, eliminaDocumento, formAllegati, formConsegnaBeniFormazione, formContrattoChiamata, formContrattoOccasionale, formContrattoOpen, formContrattoTempoDeterminato, formContrattoTempoIndeterminato, formDatiAnagrafici, formDatiGenerali, formDatiNascitaResidenza, formHeader, generaContrattoChiamata, generaContrattoConsegnaBeniFormazione, generaContrattoOccasionale, generaContrattoTempoDeterminato, generaContrattoTempoIndeterminato, getsioneCancellazioneSingoloContratto, getsioneCancellazioneTuttiContratti, handleChangeConsegnaBeniFormazione, handleChangeContrattoChiamata, handleChangeContrattoOccasionale, handleChangeContrattoTempoDeterminato, handleChangeContrattoTempoIndeterminato, handleChangeDatiAnagrafici, handleChangeDatiGenerali, handleChangeDatiNascitaResidenza, handleChangeFormAllegati, handleChangeFormHeader, id, imgFiguraIntera, imgMezzoBusto, imgPrimoPiano, listaMansioniHeader, loading, nuovaChiamataOpen, praticaHR, puoEseguireChiamate, setAggiornamentoAzioniHR, setArchivioChiamateOpen, setFormContrattoChiamata, setFormContrattoOccasionale, setFormContrattoOpen, setFormContrattoTempoDeterminato, setFormContrattoTempoIndeterminato, setNuovaChiamataOpen, setPraticaHR, tipoContratto
  };
};
