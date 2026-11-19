import {useState,useEffect} from "react";
import type {HRPratica} from "@/utils/hrWorkflow";
import type {FormContratto,FormContrattoOccasionale,FormContrattoTempoDeterminato,FormContrattoTempoIndeterminato,FormConsegnaBeniFormazione} from "@/pages/admin/dettaglioOperatore.types";

// Forms are bound to the HR assignment period, but submission is a separate responsibility.
export function useFormContratti(praticaHR:HRPratica|null){
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

    const [formConsegnaBeniFormazione, setFormConsegnaBeniFormazione] = useState<FormConsegnaBeniFormazione>({
        elencoContenutiFormazione: "",
        elencoBeniStrumentali: ""
    });

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

    const handleChangeConsegnaBeniFormazione = (
        key: string,
        value: string | null
    ) => {
        setFormConsegnaBeniFormazione((prev) => ({
            ...prev,
            [key]: value,
        }))
    }


 return {formContrattoChiamata,setFormContrattoChiamata,formContrattoOccasionale,setFormContrattoOccasionale,formContrattoTempoDeterminato,setFormContrattoTempoDeterminato,formContrattoTempoIndeterminato,setFormContrattoTempoIndeterminato,formConsegnaBeniFormazione,handleChangeContrattoChiamata,handleChangeContrattoOccasionale,handleChangeContrattoTempoDeterminato,handleChangeContrattoTempoIndeterminato,handleChangeConsegnaBeniFormazione};
}
