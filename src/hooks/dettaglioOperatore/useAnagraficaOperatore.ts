import {useState} from "react";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import type {Dipendente} from "@/entity";
import type {FormDatiAnagrafici,FormNascitaResidenza,FormDatiGenerali,FormHeader} from "@/pages/admin/dettaglioOperatore.types";

// Owns identity/anagrafica state, edits and persistence. No contract or call behavior.
export function useAnagraficaOperatore(id:string|undefined){
    const [editHeader, setEditHeader] = useState<boolean>(false);
    const [disabilitaHeader, setDisabilitaHeader] = useState<boolean>(false);
    const [editDatiAnagrafici, setEditDatiAnagrafici] = useState<boolean>(false);
    const [disabilitaDatiAnagrafici, setDisabilitaDatiAnagrafici] = useState<boolean>(false);
    const [editNascitaResidenza, setEditNascitaResidenza] = useState<boolean>(false);
    const [disabilitaNascitaResidenza, setDisabilitaascitaResidenza] = useState<boolean>(false);
    const [editDatiGenerali, setEditDatiGenerali] = useState<boolean>(false);
    const [disabilitaDatiGenerali, setDisabilitaDatiGenerali] = useState<boolean>(false);
    const [dipendente, setDipendente] = useState<Dipendente>();
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

    const [formHeader, setFormHeader] = useState<FormHeader>({
        listaMansioni: []
    });

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

    const handleChangeFormHeader = (
        key: string,
        value: string[] | null
    ) => {
        setFormHeader((prev) => ({
            ...prev,
            [key]: value,
        }))
    }


  return {dipendente,editHeader,disabilitaHeader,editDatiAnagrafici,disabilitaDatiAnagrafici,editNascitaResidenza,disabilitaNascitaResidenza,editDatiGenerali,disabilitaDatiGenerali,formDatiAnagrafici,formDatiNascitaResidenza,formDatiGenerali,formHeader,caricaOperatore,aggiornaDipendente,editaDatiAnagrafici,editaHeader,editaDatiGenerali,editaNascitaResidenza,aggiornaDatiAnagrafici,aggiornaHeader,aggiornaDatiGenerici,aggiornaNascitaResidenza,handleChangeDatiAnagrafici,handleChangeDatiNascitaResidenza,handleChangeDatiGenerali,handleChangeFormHeader};
}
