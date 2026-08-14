import { Button } from "@/components/ui/button";
import { Trash2, View, LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import type { Dipendente } from "@/entity";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { DatiAnagraficiComponent } from "../components/DatiAnagraficiComponent";
import { NascitaResidenzaComponent } from "../components/NascitaResidenzaComponent";
import { ContrattoChiamataComponent } from "../components/ContrattoChiamataComponent";
import { ContrattoOccasionaleComponent } from "../components/ContrattoOccasionaleComponent";
import { ConsegnaBeniFormazioneComponent } from "../components/ConsegnaBeniFormazioneComponent";
import { DatiGeneraliComponent } from "../components/DatiGeneraliComponent";
import { HeaderDipendenteComponent } from "../components/HeaderDipendenteComponent";
import { TypeCardAComponent } from "../components/TypeCardAComponent";
import { TypeCardBComponent } from "../components/TypeCardBComponent";
import { TypeCardCComponent } from "../components/TypeCardCComponent";

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
}

interface FormConsegnaBeniFormazione {
    elencoContenutiFormazione: string;
    elencoBeniStrumentali: string;
}

export type TipoContratto = "CHIAMATA" | "OCCASIONALE" | "CONSGNA_BENI_FORMAZIONE";

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

    const tabTriggerClass = `
        !shadow-none
        cursor-pointer
        !text-[24px]
        text-[#5e5d5d]
        data-[state=active]:bg-transparent
        data-[state=active]:underline
        data-[state=active]:underline-offset-8
        data-[state=active]:font-semibold
        data-[state=active]:text-[#007a55]
        `;

    const [formContrattoChiamata, setFormContrattoChiamata] = useState<FormContratto>({
        dataInizio: null,
        dataFine: null,
        dataFirmaContratto: null,
        //  listaMansioni: [],
        //  compensoTotaleLordo: 0,
        //  qualifica: "",
        cittaPredefinita: "",
        indirizzoPredefinito: "",
        cittaAlternativa: "",
        indirizzoAlternativo: "",
        //  giorniPeriodoProva: 0,       
    });

    const [formContrattoOccasionale, setFormContrattoOccasionale] = useState<FormContrattoOccasionale>({
        dataInizio: null,
        dataFine: null,
        dataFirmaContratto: null,
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
    });

    const [formConsegnaBeniFormazione, setFormConsegnaBeniFormazione] = useState<FormConsegnaBeniFormazione>({
        elencoContenutiFormazione: "",
        elencoBeniStrumentali: ""
    });

    const [tipoContratto, setTipoContratto] = useState<TipoContratto | null>(null);

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

    const handleDeleteTuttiContratti = async (idContratto: number) => {
        await getsioneCancellazioneTuttiContratti(idContratto);
        await caricaListaContratti();
    };

    const handleDeleteContratto = async (idContratto: number, tipoContratto: String) => {
        await getsioneCancellazioneSingoloContratto(idContratto, tipoContratto);
        await caricaListaContratti();
    };



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

            <Tabs defaultValue="anagrafica">
                <TabsList className="w-[38%]  bg-transparent border-0">
                    <TabsTrigger value="anagrafica" className={tabTriggerClass}>
                        Anagrafica
                    </TabsTrigger>

                    <TabsTrigger value="contratti" className={tabTriggerClass}>
                        Contratti
                    </TabsTrigger>

                    <TabsTrigger value="allegati" className={tabTriggerClass}>
                        Allegati
                    </TabsTrigger>

                </TabsList>

                <div className="border-b border-[#d4d4d4] my-2 mt-6 mb-6" />

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

                <TabsContent value="contratti">

                    <div>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-[#ecf3f1] text-[16px] font-bold text-[#5e5d5d]">
                                    <TableHead>Tipo Contratto</TableHead>
                                    <TableHead>Data Inizio</TableHead>
                                    <TableHead>Data Fine</TableHead>
                                    <TableHead>Compenso </TableHead>
                                    <TableHead>Contratto firmato</TableHead>
                                    <TableHead>Unilav</TableHead>
                                    <TableHead>Azioni </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {contratti.map((contratto) => (
                                    <TableRow className="text-[16px] font-normal text-[#2e2e2e]">
                                        <TableCell>{contratto.tipologia}</TableCell>                                        
                                        <TableCell>{contratto.dataInizio ? format(contratto.dataInizio, "dd/MM/yyyy") : ""}</TableCell>                                        
                                        <TableCell>{contratto.dataFine ? format(contratto.dataFine, "dd/MM/yyyy") : ""}</TableCell>
                                        <TableCell>{contratto.compensoTotaleLordo}</TableCell>
                                        <TableCell>
                                            {contratto.pathContrattoFirmato ? (
                                                <>
                                                    <button
                                                        onClick={() => dowloadPdf(contratto.idContratto, "contrattoFirmato")}
                                                        className="cursor-pointer text-[#007a55]"
                                                        title="Scarica contratto firmato"
                                                    >
                                                        <View className="mr-2 h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteContratto(contratto.idContratto, "contrattoFirmato")} className="cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                    </button>
                                                </>

                                            ) : (
                                                <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                                                    Carica
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf"
                                                        onChange={(e) =>
                                                            caricaContrattoFirmato(e, contratto.idContratto, "contrattoFirmato")
                                                        }
                                                    />
                                                </label>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {contratto.pathContrattoUnilav ? (
                                                <>
                                                    <button
                                                        onClick={() => dowloadPdf(contratto.idContratto, "contrattoUnilav")}
                                                        className="cursor-pointer text-[#007a55]"
                                                        title="Scarica unilav"
                                                    >
                                                        <View className="mr-2 h-4 w-4" />
                                                    </button>
                                                    <button onClick={() => handleDeleteContratto(contratto.idContratto, "contrattoUnilav")} className="cursor-pointer">
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                    </button>
                                                </>

                                            ) : (
                                                <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                                                    Carica
                                                    <input
                                                        type="file"
                                                        className="hidden"
                                                        accept=".pdf"
                                                        onChange={(e) =>
                                                            caricaContrattoFirmato(e, contratto.idContratto, "contrattoUnilav")
                                                        }
                                                    />
                                                </label>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <button onClick={() => dowloadPdf(contratto.idContratto, "downloadContratto")} className="cursor-pointer">
                                                <View className="mr-2 h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDeleteTuttiContratti(contratto.idContratto)} className="cursor-pointer">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                            </button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>


                    <div className="flex gap-3 items-stretch rounded-[10px] bg-[#ecf3f1] p-4 mt-6">  {/* Tutti i div figli vengono messi in orizzontale e spaziati di 32px */}
                        <div className="w-full"> {/* Left side - Event details (40%) */}
                            <div className="text-[26px] font-extrabold font-[800] text-[#007a55] text-center border-b border-[#d8d8d8] pb-2 mb-6">
                                Generatore Contratti
                            </div>

                            <Select
                                value={tipoContratto ?? ""}
                                onValueChange={(value) =>
                                    setTipoContratto(value as TipoContratto)
                                }
                            >
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="Seleziona tipo contratto" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="CHIAMATA">Contratto a chiamata</SelectItem>
                                    <SelectItem value="OCCASIONALE">Contratto occasionale</SelectItem>
                                    <SelectItem value="CONSGNA_BENI_FORMAZIONE">Consegna beni e formazione</SelectItem>
                                </SelectContent>
                            </Select>

                            {tipoContratto === "CHIAMATA" && (
                                <ContrattoChiamataComponent
                                    formContrattoChiamata={formContrattoChiamata}
                                    //  listaMansioni={listaMansioni}
                                    //  tipoQualifica={tipoQualifica}
                                    //   livelloInquadramento={livelloInquadramento}
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
                        </div>
                    </div>
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

                        </div>

                    </div>


                </TabsContent>
            </Tabs>
        </section>
    )
}

export default DettaglioOperatore