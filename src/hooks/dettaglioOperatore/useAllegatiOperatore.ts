import {useState} from "react";
import {format} from "date-fns";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import type {FormAllegati,Allegati} from "@/pages/admin/dettaglioOperatore.types";

// Owns documents and attachment metadata for the operator.
// Uses the profile update callback but does not read or modify HR contracts.
export function useAllegatiOperatore(id:string|undefined,aggiornaDipendente:(data:unknown,scheda:string)=>Promise<unknown>){
    const [editAllegati, setEditAllegati] = useState<boolean>(false);
    const [allegati, setAllegati] = useState<Allegati>();
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

    const handleChangeFormAllegati = (
        key: string, value: string | Date | null
    ) => {
        setFormAllegati((prev) => ({
            ...prev,
            [key]: value,
        }))
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


 return {editAllegati,allegati,formAllegati,editaAllegati,aggiornaAllegati,handleChangeFormAllegati,caricaAllegati,dowloadAllegato,caricaDocumento,eliminaDocumento};
}
