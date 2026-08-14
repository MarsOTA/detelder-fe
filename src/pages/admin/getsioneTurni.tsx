import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { CalendarIcon, LockKeyhole, LockKeyholeOpen, Trash2, Edit2, MapPin, Badge, StickyNote, ContactRound, Pencil, Save, X, CirclePause, Users, Copy, UserRoundX } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import React, { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { useParams } from "react-router-dom";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { format } from "date-fns";
//import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NoteDialog } from "./dialog/noteDialog";
import { InviaNotificaOperatoreDialog } from "./dialog/inviaNotificaOperatoreDialog";
import { AssegnaOperatoreDialog } from "./dialog/assegnaOperatoreDialog";
import { calcolaTotaleOreTurnoEvento, calcolaTotaleOreLavorateTurnoEvento, calcolaOreRimanenti } from "./utils/calcoloOre";
import { CopiaTurnoDialog } from "./dialog/copiaTurnoDialog";

type CreaTurniForm = {
    dataTurnoInizo: Date | undefined
    dataTurnoFine: Date | undefined
    oraInizio: string
    oraFine: string
    tipologiaTurno: string | undefined
    tipoMansione: string | undefined
    orePausa: number | undefined
    noteTurno: string | undefined
    numeroTurni: number | undefined
    idEvento: number
}

type TurnoEvento = {
    idTurno: number
    idOperatore: number | null;
    nomeOperatore: string
    cognomeOperatore: string
    nicknameOperatore: string
    dataTurno: Date | undefined
    dataTurnoFormattato?: string;
    oraInizio: string
    oraFine: string
    tipologiaTurno: string
    tipoMansione: string
    orePausa: number | string
    teamLeader: number
    noteTurno: string
    invioNotifica: boolean
    infoEvento: {
        titoloEvento: string
        indirizzoEvento: string
    }
}

type AggiornaTurniPayload = {
    invioNotifica: boolean;
    turni: TurnoEvento[];
};

type Evento = {
    nomeEvento: string
    idEvento: number
    dataIniziale: string | undefined
    dataFinale: string | undefined
    note: string
    ragioneSociale: string
    nomeBrand: string
    idIndirizzo: number
    indirizzo: string
    codiceAttivita: string
    nomeCognomeReferente: string
    telefonoReferente: string
}

type Operatori = {
    idOperatore: number
    nomeOperatore: string
    cognomeOperatore: string
    nicknameOperatore: string
    disponibilita: string
    turno: string
    nomeEvento: string
    indirizzoEvento: string
}

type ErroreWhatsApp = {
    dipendente: string;
    cellulare: string;
    motivo: string;
};

interface IndirizzoBrand {
    idIndirizzo: number;
    via: string;
}

const getsioneTurni = () => {
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [modificheTurni, setModificheTurni] = useState<
        Record<number, TurnoEvento>
    >({});
    const [idTurnoSelezionato, setIdTurnoSelezionato] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [almenoUnOperatoreAssegnato, setAlmenoUnOperatoreAssegnato] = useState(false);

    const [editIndirizzo, setEditIndirizzo] = useState<boolean>(false);

    const [indirizzo, setIndirizzo] = useState<string>();
    const [idIndirizzo, setIdIndirizzo] = useState<number>();
    const [dataDA, setDataDA] = useState<Date>();
    const [dataA, setDataA] = useState<Date>();
    const [noteEvento, setNoteEvento] = useState<string>();
    const [codiceAttivita, setCodiceAttivita] = useState<string>();
    const [nomeCognomeReferente, setNomeCognomeReferente] = useState<string>();
    const [telefonoReferente, setTelefonoReferente] = useState<string>();

    const [editModificaNomeEvento, setEditModificaNomeEvento] = useState<boolean>(false);
    const [nomeEvento, setNomeEvento] = useState<string>();

    const [filtroData, setFiltroData] = useState<Date | undefined>();
    const [copiaTurnoDialogOpen, setCopiaTurnoDialogOpen] = useState(false);


    const tipologieTurno = [
        "Evento",
        "Boutique",
        "Shooting",
        "Gala",
        "Sfilata",
        "Allestimento/Disallestimento",
        "Cantiere",
        "Stampa",
        "Inaugurazione",
        "Endorsement",
        "Party/Festa",
        "Cena",
        "Edicola",
        "Family and friends"
    ];

    const tipoMansione = [
        "Fiduciario",
        "Doorman",
        "Close Protection",
        "Gestione Liste ingressi",
        "Gestione ingressi automezzi",
        "Controllo sala telecamere  GPG",
        "GPG con macchina",
        "GPG",
        "Housekeeper",
        "Autista",
        "Accompagnatore",
        "Gestione Parcheggi",
        "Pause"
    ];

    const [creaTurniForm, setCreaTurniForm] = useState<CreaTurniForm>();
    const [turni, setTurni] = useState<TurnoEvento[]>([]);
    const [turniRaggruppati, setTurniRaggruppati] = useState<Record<string, TurnoEvento[]>>({});
    const [indirizzi, setIndirizzi] = useState<IndirizzoBrand[]>([]);
    const [evento, setEvento] = useState<Evento>();
    const [dataMinima, setDataMinima] = useState<Date>();
    //  const [modificaTurno, setModificaTurno] = useState<TurnoEvento>();

    const [formDatiNoteTurno, setFormDatiNoteTurno] = useState({
        nota: "",
        idTurno: 0
    });
    const [noteTurnoDialogOpen, setNoteTurnoDialogOpen] = useState(false);


    const [inviaNotificheOperatoreOpen, setInviaNotificheOperatoreOpen] = useState(false);
    const [dipendenti, setDipendenti] = useState<Operatori[]>([]);


    const [assegnaOperatoreDialogOpen, setAssegnaOperatoreDialogOpen] = useState(false);

    const { id, dataTurno } = useParams();

    //Con il primo useEffect carico i turni
    useEffect(() => {
        const data = dataTurno ? new Date(dataTurno) : new Date();
        setFiltroData(data);
        caricaTurni(data);
    }, []);

    //Con il secondo useEffect uso event valorizzato con caricaTurni() e valorizzo la dataTurno
    const initialized = useRef(false);  // Reset fatto solo in fase di init
    useEffect(() => {
        if (evento && evento.dataIniziale && !initialized.current) {
            const creaTurniForm: CreaTurniForm = {
                dataTurnoInizo: new Date(evento.dataIniziale),
                dataTurnoFine: new Date(evento.dataIniziale),
                oraInizio: "09:00",
                oraFine: "18:00",
                tipologiaTurno: '',
                tipoMansione: '',
                orePausa: 1,
                noteTurno: '',
                numeroTurni: 1,
                idEvento: Number(id)
            }

            setCreaTurniForm(creaTurniForm);

            initialized.current = true;
        }

    }, [evento]);

    function formatDateLocal(date: Date): string {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // mesi 0-11
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const ricercaDipendenti = async (idTurno: number, dataTurno: Date | undefined, oraInizio: string, oraFine: string) => {
        // Costruzione della query string
        const params = new URLSearchParams();
        console.log("dataTurno: " + dataTurno);
        if (dataTurno) {
            params.append('dataTurno', formatDateLocal(new Date(dataTurno)));
        }
        params.append('oraInizio', oraInizio);
        params.append('oraFine', oraFine);
        params.append("idTurno", idTurno.toString());

        console.log("Parametri: ", params.toString());

        const url = `${ezystaffBEUrl}operatori/ricercaDipendenti?${params.toString()}`;

        const resp = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
        });

        const data = await resp.json();
        console.log(data);
        setDipendenti(data);
    };



    const setDataTurnoInizio = (date: Date | undefined) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                dataTurnoInizo: date,
                dataTurnoFine: date,
            };
        });
    };

    const setDataTurnoFine = (date: Date | undefined) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                dataTurnoFine: date,
            };
        });
    };

    const setModificaDataTurno = (
        idTurno: number,
        date: Date | undefined
    ) => {

        setModificheTurni((prev) => {

            const turno = prev[idTurno];

            if (!turno) return prev;

            return {
                ...prev,

                [idTurno]: {
                    ...turno,
                    dataTurno: date,
                },
            };
        });
    };

    const setOraInizioTurno = (ora: string) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                oraInizio: ora,
            };
        });
    };

    const aggiornaTurnoModifica = (
        idTurno: number,
        field: keyof TurnoEvento,
        value: any
    ) => {

        setModificheTurni((prev) => ({
            ...prev,

            [idTurno]: {
                ...prev[idTurno],
                [field]: value,
            },
        }));
    };

    const aggiornaTeamLeader = (
        idTurno: number,
        checked: boolean | "indeterminate"
    ) => {
        aggiornaTurnoModifica(
            idTurno,
            "teamLeader",
            checked === true ? 1 : 0
        );
    };

    const setOraFineTurno = (ora: string) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                oraFine: ora,
            };
        });
    };

    const setOperatori = (numero: number | undefined) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                numeroTurni: numero,
            };
        });
    };

    const setNumeroOrePausa = (numero: number | undefined) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                orePausa: numero,
            };
        });
    };

    const setTipologiaTurno = (valore: string) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                tipologiaTurno: valore,
            };
        });
    };

    const setTipoMansione = (valore: string) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                tipoMansione: valore,
            };
        });
    };

    const setNoteTurno = (valore: string) => {
        setCreaTurniForm((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                noteTurno: valore, // o qualunque campo stai aggiornando
            };
        });
    };

    const handleDeleteTurno = async (idTurno: number) => {
        const conferma = window.confirm("Sei sicuro di voler cancellare questo turno?");

        if (!conferma) return;

        await cancellaTurno(idTurno);
    };

    const invioWhatsappOperatore = async (idTurno: number) => {

        const conferma = window.confirm("Vuoi inviare la notifica all'operatore?");

        if (!conferma) return;


        console.log("idTurno: " + idTurno);
        console.log("modificheTurni: ", modificheTurni);

        const turno = turni.find((t) => t.idTurno === idTurno);

        if (turno) {
            turno.infoEvento = {
                titoloEvento: evento?.nomeEvento ?? "",
                indirizzoEvento: evento?.indirizzo ?? "",
            };
        }

        console.log("turnoEdit: ", turno);

        setIsLoading(true);

        try {

            const data = await invioNotificaTurno(turno);

            setIsLoading(false);

            await new Promise(resolve => setTimeout(resolve, 0));

            if (!data.success) {
                alert(`Errore: ${data.message}\nDettagli: ${data.error || 'Nessun dettaglio disponibile'}`);
                return;
            }

            alert("Notifica inviata!");

        } catch (error) {

            setIsLoading(false);

            await new Promise(resolve => setTimeout(resolve, 0));

            console.error(error);
            alert("Errore durante l'invio della notifica");
        }

    }


    const duplicaRiga = async (idTurno: number) => {

        duplicaRigaTurno(idTurno);
    }

    const duplicaRigaTurno = async (idTurno: number) => {

        const resp = await fetch(ezystaffBEUrl + `turni/duplicaRiga/${idTurno}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include',
        });

        const data = await resp.json();
        console.log("data: ", data);
        caricaTurni(filtroData);
    };

    const cancellaTurno = async (idTurno: number) => {
        const turno = turni.find((t) => t.idTurno === idTurno);

        const titoloEvento =
            evento?.nomeEvento && evento.nomeEvento.trim() !== ''
                ? evento.nomeEvento
                : `${evento?.nomeBrand ?? ''} - ${evento?.ragioneSociale ?? ''}`;

        const resp = await fetch(ezystaffBEUrl + `turni/${idTurno}`, {
            method: "DELETE",
            credentials: 'include',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                idOperatore: turno?.idOperatore,
                dataTurno: turno?.dataTurno,
                oraInizioTurno: turno?.oraInizio,
                oraFineTurno: turno?.oraFine,
                titoloEvento,
                indirizzoEvento: evento?.indirizzo,
            }),
        });

        const data = await resp.json();
        console.log(data);
        caricaTurni(filtroData);

        // Mostra un alert se success è false
        if (!data.success) {
            alert(`Errore: ${data.message}\nDettagli: ${data.error || 'Nessun dettaglio disponibile'}`);
            return; // esce prima di chiudere il dialog o aggiornare
        }


    }

    const modificaTurniDataSelezionata = async (invioNotifica: boolean) => {
        console.log("Salva turni******");

        const payloadFormattato = {
            invioNotifica,

            turni: Object.values(modificheTurni).map((turno) => ({
                ...turno,

                dataTurnoFormattato: turno.dataTurno
                    ? formatDateToYYYYMMDD(new Date(turno.dataTurno))
                    : "",

                infoEvento: {
                    titoloEvento: evento?.nomeEvento ?? "",
                    indirizzoEvento: evento?.indirizzo ?? "",
                },
            })),
        };

        console.log("payload: ", payloadFormattato);
        await aggiornaTurniPerData(payloadFormattato);

        setEditingDate(null);

    }

    const aggiornaOperatoreSenzaInvioNotifica = async () => {
        setInviaNotificheOperatoreOpen(false);

        requestAnimationFrame(async () => {
            setIsLoading(true);
            try {
                await modificaTurniDataSelezionata(false);
            } finally {
                setIsLoading(false);
            }
        });

    };

    const aggiornaOperatoreConInvioNotifica = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {

        e.preventDefault();
        setInviaNotificheOperatoreOpen(false);

        requestAnimationFrame(async () => {
            setIsLoading(true);
            try {
                await modificaTurniDataSelezionata(true);
            } finally {
                setIsLoading(false);
            }
        });
    };

    const inviaNotificaOperatoreDialogOpen = () => {
        const presente = Object.values(modificheTurni).some(
            (turno) => turno.idOperatore !== null
        );

        setAlmenoUnOperatoreAssegnato(presente);
        setInviaNotificheOperatoreOpen(true);
    };


    /*
    const selezionaTurnoPerModifica = (idTurno: number) => {
        const turno = turni.find((t) => t.idTurno === idTurno);

        if (turno && turno.dataTurno) {
            setModificaTurno({
                ...turno,
                dataTurno: new Date(turno.dataTurno),
            });
        }
    };
    */

    const aggiungiTurno = async () => {
        console.log(JSON.stringify(creaTurniForm));

        if (!creaTurniForm!.tipologiaTurno) {
            alert("Seleziona una tipologia");
            return;
        }

        if (!creaTurniForm!.tipoMansione) {
            alert("Seleziona un tipo Mansione");
            return;
        }

        if (!creaTurniForm!.dataTurnoInizo || !creaTurniForm!.dataTurnoFine) {
            alert("Obbligatorio selezionare data iniziale e data finale!");
            return;
        }

        // Controllo che la data di inizio sia <= data di fine
        const dataInizio = new Date(creaTurniForm!.dataTurnoInizo);
        const dataFine = new Date(creaTurniForm!.dataTurnoFine);

        if (dataInizio > dataFine) {
            alert("Data finale deve essere maggiore o uguale alla data iniziale!");
            return;
        }

        const turnoDaInviare = {
            ...creaTurniForm!,
            dataTurnoInizo: formatDateToYYYYMMDD(creaTurniForm!.dataTurnoInizo),
            dataTurnoFine: formatDateToYYYYMMDD(creaTurniForm!.dataTurnoFine)
        };

        const resp = await fetch(ezystaffBEUrl + 'turni', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(turnoDaInviare)
        });
        const data = await resp.json();
        console.log(data);
        alert(JSON.stringify(data));
        caricaTurni(filtroData);

    }

    const invioNotificaTurno = async (turnoDaModificare: any) => {

        console.log("turnoDaModificare: ", turnoDaModificare);

        const resp = await fetch(ezystaffBEUrl + `turni/notificaTurno/invio`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include',
            body: JSON.stringify(turnoDaModificare)
        });
        const data = await resp.json();
        console.log(data);
        // caricaTurni(filtroData);
        return data;
    }

    const aggiornaTurniPerData = async (
        turniDaModificare: AggiornaTurniPayload
    ) => {
        const resp = await fetch(ezystaffBEUrl + `turni/aggiornaTurniPerData/batch`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
                accept: "application/json",
            },
            method: "PATCH",
            credentials: "include",
            body: JSON.stringify(turniDaModificare),
        });

        const data = await resp.json();

        console.log(data);

        if (!data.success) {
            // alert(`Errore: ${data.message} Dettaglio: ${data.erroriWhatsApp}`);

            alert(
                `Errore: ${data.message}\n\nDettaglio:\n${data.erroriWhatsApp
                    .map((e: ErroreWhatsApp) =>
                        `- Dipendente: ${e.dipendente}, Cellulare: ${e.cellulare}, Motivo: ${e.motivo}`
                    )
                    .join("\n")}`
            );
            return false;
        }
        caricaTurni(filtroData);

    };


    const caricaTurni = async (filtroData: Date | undefined) => {

        const filtroDataStr = formatDateToYYYYMMDD(filtroData);
        const queryParams = new URLSearchParams();

        if (filtroDataStr) queryParams.append("dataInizio", filtroDataStr);

        const resp = await fetch(ezystaffBEUrl + `turni/turniEvento/${id}?${queryParams.toString()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);

        const turni = data.turniOperatorePerEvento;
        const turniRaggruppati = raggruppaTurniPerData(turni);
        console.log("turniRaggruppati: ", turniRaggruppati);

        setTurni(turni);
        setTurniRaggruppati(turniRaggruppati);
        setEvento(data.ottieniDatiEvento);
        setIndirizzi(data.ottieniListaIndirizzi)

        const dataMinima = data.ottieniDatiEvento.dataIniziale;
        setDataMinima(dataMinima);

    }

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mesi 0-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    //Pulsantiera modifica evento

    //Indirizzo
    const editaIndirizzo = () => {
        setIndirizzo(evento?.indirizzo);
        setDataDA(toLocalDate(evento?.dataIniziale));
        setDataA(toLocalDate(evento?.dataFinale));
        setCodiceAttivita(evento?.codiceAttivita);
        setNoteEvento(evento?.note);
        setNomeCognomeReferente(evento?.nomeCognomeReferente);
        setTelefonoReferente(evento?.telefonoReferente);
        setEditIndirizzo(true);
        setIdIndirizzo(evento?.idIndirizzo);
    };

    const pulisciDati = () => {
        setIndirizzo("");
        setDataDA(undefined);
        setDataA(undefined);
        setCodiceAttivita("");
        setNoteEvento("");
        setNomeCognomeReferente("");
        setTelefonoReferente("");
        setEditIndirizzo(false);
    };

    const salvaIndirizzo = () => {
        setEvento((prev) => {
            if (!prev || !dataDA || !dataA) return undefined;
            const eventoAggiornato = {
                ...prev,
                indirizzo: indirizzo ?? '',
                idIndirizzo: idIndirizzo ?? 0,
                dataIniziale: formatDateToInputValue(dataDA),
                dataFinale: formatDateToInputValue(dataA),
                codiceAttivita: codiceAttivita ?? '',
                note: noteEvento ?? '',
                nomeCognomeReferente: nomeCognomeReferente ?? '',
                telefonoReferente: telefonoReferente ?? ''
            };
            aggiornaEvento(eventoAggiornato);
            return eventoAggiornato;
        });
        pulisciDati();
        setEditIndirizzo(false);
    };

    function toLocalDate(dateString?: string | undefined): Date | undefined {
        if (!dateString) return undefined;

        const [year, month, day] = dateString.split('-').map(Number);

        if (!year || !month || !day) return undefined;
        console.log(year, month - 1, day);
        console.log(new Date(year, month - 1, day));
        // Crea un oggetto Date a mezzanotte nel fuso orario locale
        return new Date(year, month - 1, day);
    }

    function formatDateToInputValue(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mesi 0-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    const aggiornaEvento = async (evento: Evento) => {

        console.log('Evento aggiornato:', JSON.stringify(evento));

        try {
            const resp = await fetch(ezystaffBEUrl + `eventi/dettaglioSingolo/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                method: 'PATCH',
                credentials: 'include',
                body: JSON.stringify(evento),
            });

            if (!resp.ok) {
                throw new Error(`Errore nella richiesta: ${resp.status}`);
            }

            const data = await resp.json();
            console.log('Risposta dal server:', data);
            caricaTurni(filtroData);

        } catch (error) {
            console.error('Errore durante l’invio del turno:', error);
        }

    };


    const handleSubmitNote = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Test note:', JSON.stringify(formDatiNoteTurno));
        aggiornaNotaTurno();
    };

    const handleOperatoreClick = async (
        idTurno: number,
        idOperatore: number | undefined,
        nomeOperatore: string,
        cognomeOperatore: string,
        nicknameOperatore: string
    ) => {

        setModificheTurni((prev) => {

            const turnoCorrente = prev[idTurno];

            if (!turnoCorrente) return prev;

            return {
                ...prev,

                [idTurno]: {
                    ...turnoCorrente,
                    idOperatore: idOperatore ?? null,
                    nomeOperatore: idOperatore === undefined ? "" : nomeOperatore,
                    cognomeOperatore: idOperatore === undefined ? "" : cognomeOperatore,
                    nicknameOperatore: idOperatore === undefined ? "" : nicknameOperatore,
                },
            };
        });

        setAssegnaOperatoreDialogOpen(false);
    };


    const aggiornaNotaTurno = async () => {

        const resp = await fetch(ezystaffBEUrl + `turni/aggiornaNota/${formDatiNoteTurno.idTurno}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PUT",
            credentials: 'include',
            body: JSON.stringify(formDatiNoteTurno)
        });

        const data = await resp.json();
        console.log("Modificato:", data);
        setNoteTurnoDialogOpen(false);
        caricaTurni(filtroData);
    };

    const aggiungiNote = (idTurnoOperatore: number) => {
        const turno = turni.find((t) => t.idTurno === idTurnoOperatore);
        if (turno) {
            setFormDatiNoteTurno({
                nota: turno.noteTurno,
                idTurno: idTurnoOperatore
            });
        }
        setNoteTurnoDialogOpen(true);
    };

    const assegnaOperatore = (idTurno: number) => {
        //  console.log("modificaTurno: " + modificaTurno);
        const turnoEdit = modificheTurni[idTurno];

        console.log("turnoEdit: ", turnoEdit);
        if (turnoEdit) {
            ricercaDipendenti(turnoEdit.idTurno, turnoEdit.dataTurno, turnoEdit.oraInizio, turnoEdit.oraFine);
        }
        setIdTurnoSelezionato(idTurno);
        setAssegnaOperatoreDialogOpen(true);
    };

    //Modifica nome evento
    const editaModificaNomeEvento = () => {

        const titoloEvento =
            evento?.nomeEvento && evento.nomeEvento.trim() !== ''
                ? evento.nomeEvento
                : '';

        setNomeEvento(titoloEvento);
        setEditModificaNomeEvento(true);
    };

    const annullaModificaNomeEvento = () => {
        setNomeEvento("");
        setEditModificaNomeEvento(false);
    };

    const modificaNomeEvento = async () => {

        try {
            const resp = await fetch(ezystaffBEUrl + `eventi/modificaNomeEvento/${id}`, {
                method: "PATCH",
                credentials: 'include',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    nomeEvento
                }),
            });

            const data = await resp.json();

            console.log('Risposta dal server:', data);
            caricaTurni(filtroData);

        } catch (error) {
            console.error('Errore durante l’invio del turno:', error);
        }

        setEditModificaNomeEvento(false);
    };

    const calcolaTotaleOre = (oraInizio: string, oraFine: string) => {
        if (!oraInizio || !oraFine) return 0;

        const [h1, m1] = oraInizio.split(":").map(Number);
        const [h2, m2] = oraFine.split(":").map(Number);

        const inizio = h1 * 60 + m1;
        let fine = h2 * 60 + m2;

        // Se fine < inizio → turno nel giorno successivo
        if (fine < inizio) {
            fine += 24 * 60; // aggiungiamo 24h
        }

        const diff = (fine - inizio) / 60;
        return diff;
    };

    const setDataInizio = (date: Date | undefined) => {
        setFiltroData(date);
    };

    const handleSubmitCopiaTurno = async (data: { inizio?: Date; fine?: Date }) => {
        console.log("Data inizio:", data.inizio);
        console.log("Data fine:", data.fine);

        if (!data.inizio || !data.fine) {
            alert("Data inizio e Data fine obbligatorie");
            return;
        }

        if (data.fine < data.inizio) {
            alert("La data di fine deve essere maggiore o uguale alla data di inizio");
            return;
        }

        const intervalloTurniDaCopiare = {
            dataCopiaInizio: formatDateToYYYYMMDD(data.inizio),
            dataCopiaFine: formatDateToYYYYMMDD(data.fine),
            filtroData: formatDateToYYYYMMDD(filtroData),
            idEvento: id
        };

        const resp = await fetch(ezystaffBEUrl + 'turni/copiaTurni', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(intervalloTurniDaCopiare)
        });
        const dataResp = await resp.json();
        console.log(dataResp);
        alert(JSON.stringify(dataResp));
        caricaTurni(filtroData);


        setCopiaTurnoDialogOpen(false);
    };


    const copiaTurnoSelezionato = async () => {

        setCopiaTurnoDialogOpen(true);
    };

    const formatDateKey = (date: Date | string) => {
        return format(new Date(date), "yyyy-MM-dd");
    };

    const modificaTurniStessaData = (dataTurno?: Date) => {
        if (!dataTurno) return;

        setEditingDate(
            formatDateKey(dataTurno)
        );
        selezionaTurniPerData(dataTurno)
    };

    const selezionaTurniPerData = (
        dataTurno: Date | string
    ) => {

        const dataKey =
            formatDateKey(dataTurno);

        const turniStessaData = turni.filter(
            (t) =>
                t.dataTurno &&
                formatDateKey(t.dataTurno) === dataKey
        );

        const nuoviTurni: Record<number, TurnoEvento> =
            {};

        turniStessaData.forEach((turno) => {

            nuoviTurni[turno.idTurno] = {
                ...turno,
                dataTurno: turno.dataTurno,
            };
        });

        console.log("turniStessaData: ", turniStessaData);
        console.log("nuoviTurni: ", nuoviTurni);

        setModificheTurni(nuoviTurni);

        setEditingDate(dataKey);
    };

    const isNuovaData = (
        turni: TurnoEvento[],
        index: number
    ): boolean => {

        let nuovaData = false;

        if (index === 0) {
            nuovaData = true;
        } else {

            const turnoCorrente = turni[index];
            const turnoPrecedente = turni[index - 1];

            if (
                turnoCorrente?.dataTurno &&
                turnoPrecedente?.dataTurno
            ) {

                nuovaData = format(new Date(turnoCorrente.dataTurno), "yyyy-MM-dd") !== format(new Date(turnoPrecedente.dataTurno), "yyyy-MM-dd");
            }
        }

        return nuovaData;
    };

    const getNuovaData = (
        turni: TurnoEvento[],
        index: number
    ): string | null => {

        let nuovaData: string | null = null;

        const turnoCorrente = turni[index];

        if (!turnoCorrente?.dataTurno) {
            return nuovaData;
        }

        const dataCorrente = format(
            new Date(turnoCorrente.dataTurno),
            "yyyy-MM-dd"
        );

        // Primo elemento
        if (index === 0) {
            nuovaData = dataCorrente;
        } else {

            const turnoPrecedente = turni[index - 1];

            if (!turnoPrecedente?.dataTurno) {

                nuovaData = dataCorrente;

            } else {

                const dataPrecedente = format(
                    new Date(turnoPrecedente.dataTurno),
                    "yyyy-MM-dd"
                );

                if (dataCorrente !== dataPrecedente) {
                    nuovaData = dataCorrente;
                }
            }
        }

        return nuovaData;
    };


    const raggruppaTurniPerData = (
        turni: TurnoEvento[]
    ): Record<string, TurnoEvento[]> => {

        const gruppi: Record<string, TurnoEvento[]> = {};

        turni.forEach((turno) => {

            if (!turno.dataTurno) {
                return;
            }

            const dataKey = format(
                new Date(turno.dataTurno),
                "yyyy-MM-dd"
            );

            if (!gruppi[dataKey]) {
                gruppi[dataKey] = [];
            }

            gruppi[dataKey].push(turno);
        });

        return gruppi;
    };



    return (
        <>

            <section className="m-6"> {/* Crea una sezione con 32px top e 32px bottom */}
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                        {editModificaNomeEvento ? (
                            <>
                                <Input
                                    value={nomeEvento}
                                    onChange={(e) => setNomeEvento(e.target.value)}
                                    className="flex-1 h-10 border-0 border-b border-border/30 rounded-none focus:border-primary bg-transparent"
                                    placeholder="Inserisci note per l'evento..."
                                    autoFocus
                                />
                                <Button variant="ghost" size="sm" onClick={() => modificaNomeEvento()} >
                                    <Save className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={annullaModificaNomeEvento}>
                                    <X className="h-4 w-4" />
                                </Button>

                            </>
                        ) : (
                            <>

                                <div className="group flex items-center gap-2 flex-1">
                                    <h1 className="text-3xl font-extrabold text-[#007a55]">
                                        {evento?.nomeEvento && evento.nomeEvento.trim() !== ''
                                            ? evento.nomeEvento
                                            : `${evento?.nomeBrand ?? ''} - ${evento?.ragioneSociale ?? ''}`}
                                    </h1>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={editaModificaNomeEvento}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto"
                                    >
                                        <Pencil className="h-4 w-4 text-[#007a55]" />
                                    </Button>
                                </div>


                            </>

                        )}
                    </div>

                    <div className="text-right space-x-3 font-extrabold">
                        <div className="inline-block px-4 py-2 " style={{ color: "#5e8a7a", backgroundColor: "#dcf2ec", borderRadius: 18 }}>
                            {evento?.nomeBrand}
                        </div>
                        <div className="inline-block px-4 py-2 " style={{ color: "#5e8a7a", backgroundColor: "#dce8f2", borderRadius: 18 }}>
                            {evento?.ragioneSociale}
                        </div>
                    </div>
                </div>


                <div className="flex gap-3 items-stretch">  {/* Tutti i div figli vengono messi in orizzontale e spaziati di 32px */}
                    <div className="flex-[0_0_45%] flex"> {/* Left side - Event details (40%) */}
                        <div className=" flex-1 space-y-4" style={{ color: "#5e5d5d", backgroundColor: "#eaeff4", borderRadius: 9, padding: 14, fontSize: 16 }}>

                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-extrabold" style={{ color: "#5e8a7a", fontSize: 24 }}>Info evento</h3>
                                {editIndirizzo ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => salvaIndirizzo()}
                                            className="cursor-pointer"
                                        >
                                            <LockKeyholeOpen className="h-4 w-4" />
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={editaIndirizzo}
                                            disabled={editingDate !== null}
                                            className="cursor-pointer"
                                        >
                                            <LockKeyhole className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-3">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <MapPin className="h-6 w-6 p-1 rounded" style={{ color: '#FFF', backgroundColor: "#5e8a7a" }} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Indirizzo evento</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {editIndirizzo ? (
                                    <>
                                        <Select
                                            value={String(idIndirizzo)}
                                            onValueChange={(value) => setIdIndirizzo(Number(value))}
                                        >
                                            <SelectTrigger className="flex-1 h-10 border-0 border-b border-border/30 rounded-none bg-transparent">
                                                <SelectValue />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {indirizzi.map((ind) => (
                                                    <SelectItem key={ind.idIndirizzo} value={String(ind.idIndirizzo)}>
                                                        {ind.via}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/*
                                        <Input
                                            value={indirizzo}
                                            onChange={(e) => setIndirizzo(e.target.value)}
                                            className="flex-1 h-10 border-0 border-b border-border/30 rounded-none focus:border-primary bg-transparent"
                                            placeholder="Indirizzo brand"
                                            autoFocus
                                        />
                                        */}

                                    </>
                                ) : (
                                    <>
                                        <span className="flex-1 py-2">{evento?.indirizzo}</span>
                                    </>
                                )}

                            </div>

                            <div className="flex items-center gap-1">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <CalendarIcon className="h-6 w-6 p-1 rounded" style={{ color: '#FFF', backgroundColor: "#5e8a7a" }} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Data inizio e fine evento</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {editIndirizzo ? (
                                    <>
                                        {/* Edit Mode */}
                                        <div className="flex gap-2 items-center">
                                            <span>dal</span>
                                            <Input
                                                type="date"
                                                value={dataDA ? formatDateToInputValue(dataDA) : ''}
                                                onChange={(e) => {
                                                    const [year, month, day] = e.target.value.split('-').map(Number);
                                                    setDataDA(new Date(year, month - 1, day));
                                                }}
                                                className="border-0 border-b border-border/30 rounded-none bg-transparent"
                                                placeholder="GG/MM/AA"
                                            />
                                            <span>al</span>
                                            <Input
                                                type="date"
                                                value={dataA ? formatDateToInputValue(dataA) : ''}
                                                onChange={(e) => {
                                                    const [year, month, day] = e.target.value.split('-').map(Number);
                                                    setDataA(new Date(year, month - 1, day));
                                                }}
                                                className="border-0 border-b border-border/30 rounded-none bg-transparent"
                                                placeholder="GG/MM/AA"
                                            />
                                        </div>

                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Badge className="h-6 w-6 p-1 rounded" style={{ color: '#FFF', backgroundColor: "#5e8a7a" }} />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p>Codice attività</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>

                                        <div className="flex-1 flex items-center gap-2">
                                            <Input
                                                value={codiceAttivita}
                                                onChange={(e) => setCodiceAttivita(e.target.value)}
                                                className="flex-1 h-10 border-0 border-b border-border/30 rounded-none focus:border-primary bg-transparent"
                                                placeholder="Codice attività"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        {/* View Mode */}
                                        <div className="flex gap-2 items-center">
                                            <span>dal</span>
                                            <span className="py-2">
                                                {evento?.dataIniziale ? format(evento.dataIniziale, 'dd/MM/yyyy') : 'N/D'}
                                            </span>
                                            <span>al</span>
                                            <span className="py-2">
                                                {evento?.dataFinale ? format(evento.dataFinale, 'dd/MM/yyyy') : 'N/D'}
                                            </span>
                                        </div>

                                        <div className="ml-[20%]">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Badge className="h-6 w-6 p-1 rounded" style={{ color: '#FFF', backgroundColor: "#5e8a7a" }} />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Codice attività</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </div>
                                        <div className="flex-1 flex items-center gap-2">
                                            <span className="flex-1 py-2">{evento?.codiceAttivita || 'Codice non specificato'}</span>
                                        </div>

                                    </>
                                )}
                            </div>

                            {/* Note evento */}
                            <div className="flex items-center gap-3">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <StickyNote className="h-6 w-6 p-1 rounded" style={{ color: '#FFF', backgroundColor: "#5e8a7a" }} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Note evento</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                <div className="flex-1 flex items-center gap-2">
                                    {editIndirizzo ? (
                                        <>
                                            <Input
                                                value={noteEvento}
                                                onChange={(e) => setNoteEvento(e.target.value)}
                                                className="flex-1 h-10 border-0 border-b border-border/30 rounded-none focus:border-primary bg-transparent"
                                                placeholder="Inserisci note per l'evento..."
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 py-2">{evento?.note || 'Nota evento non presente'}</span>
                                        </>

                                    )}
                                </div>
                            </div>

                            {/*Referente*/}
                            <div className="flex items-center gap-3">
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <ContactRound className="h-6 w-6 p-1 rounded" style={{ color: '#FFF', backgroundColor: "#5e8a7a" }} />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Refernte</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>

                                {/*<div className="flex-1 flex items-center gap-2">*/}
                                <div className="flex items-center gap-2">
                                    {editIndirizzo ? (
                                        <>
                                            <Input
                                                value={nomeCognomeReferente}
                                                onChange={(e) => setNomeCognomeReferente(e.target.value)}
                                                className="flex-1 h-10 border-0 border-b border-border/30 rounded-none focus:border-primary bg-transparent"
                                                placeholder="Inserisci nome cognome"
                                            />
                                        </>
                                    ) : (
                                        <span className="flex-1 py-2">{evento?.nomeCognomeReferente || 'Referente non presente'}</span>
                                    )}
                                </div>
                                <span className="text-muted-foreground"> - </span>
                                <div className="flex items-center gap-2">
                                    {editIndirizzo ? (
                                        <>
                                            <Input
                                                value={telefonoReferente}
                                                onChange={(e) => setTelefonoReferente(e.target.value)}
                                                className="flex-1 h-10 border-0 border-b border-border/30 rounded-none focus:border-primary bg-transparent"
                                                placeholder="Inserisci cellulare"
                                            />
                                        </>
                                    ) : (
                                        <span className="flex-1 py-2">{evento?.telefonoReferente || 'cellulare non presente'}</span>
                                    )}
                                </div>

                            </div>

                        </div>
                    </div>
                    <div className="flex-[0_0_55%] flex">
                        <div className="flex-1 space-y-6" style={{ color: "#5e5d5d", backgroundColor: "#ecf3f1", borderRadius: 9, padding: 14, fontSize: 16 }}>
                            <h3 className="font-extrabold" style={{ color: "#5e8a7a", fontSize: 24 }}>Inserimento turno</h3>
                            <div className="space-y-4">

                                <div className="grid grid-cols-1 md:grid-cols-4 gap-1">
                                    <div className="w-full">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full">
                                                    {creaTurniForm?.dataTurnoInizo
                                                        ? creaTurniForm?.dataTurnoInizo.toLocaleDateString()
                                                        : "Seleziona data"}
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={creaTurniForm?.dataTurnoInizo}
                                                    onSelect={setDataTurnoInizio}
                                                    locale={it}
                                                    className="pointer-events-auto"
                                                    disabled={dataMinima ? { before: dataMinima } : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="w-full">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="w-full">
                                                    {creaTurniForm?.dataTurnoFine
                                                        ? creaTurniForm?.dataTurnoFine.toLocaleDateString()
                                                        : "Seleziona data"}
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={creaTurniForm?.dataTurnoFine}
                                                    onSelect={setDataTurnoFine}
                                                    locale={it}
                                                    className="pointer-events-auto"
                                                    disabled={dataMinima ? { before: dataMinima } : undefined}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="w-full">
                                        <Input
                                            type="time"
                                            value={creaTurniForm?.oraInizio}
                                            onChange={(e) => setOraInizioTurno(e.target.value)}
                                            className="w-full bg-white"
                                        />
                                    </div>

                                    <div className="w-full">
                                        <Input
                                            type="time"
                                            value={creaTurniForm?.oraFine}
                                            onChange={(e) => setOraFineTurno(e.target.value)}
                                            className="w-full bg-white"
                                        />
                                    </div>

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">

                                    <div className="w-full">
                                        <Select
                                            value={creaTurniForm?.tipologiaTurno ?? ''}
                                            onValueChange={(value) => setTipologiaTurno(value)}
                                        >
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder="Seleziona tipologia" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {tipologieTurno.map((tipologia) => (
                                                    <SelectItem key={tipologia} value={tipologia}>
                                                        {tipologia}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="w-full">
                                        <Select
                                            value={creaTurniForm?.tipoMansione ?? ''}
                                            onValueChange={(value) => setTipoMansione(value)}
                                        >
                                            <SelectTrigger className="w-full bg-white">
                                                <SelectValue placeholder="Seleziona tipo mansione" />
                                            </SelectTrigger>

                                            <SelectContent>
                                                {tipoMansione.map((mansione) => (
                                                    <SelectItem key={mansione} value={mansione}>
                                                        {mansione}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <div className="w-1/10 min-w-[100px] relative">
                                        {/* Icona posizionata dentro l'input */}
                                        <Users size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

                                        <Input
                                            id="operatori"
                                            type="number"
                                            min={1}
                                            max={20}
                                            value={creaTurniForm?.numeroTurni ?? ""}
                                            onChange={(e) =>
                                                setOperatori(e.target.value ? parseInt(e.target.value) : undefined)
                                            }
                                            className="w-full pl-8 bg-white" // pl-8 per fare spazio all'icona
                                        />
                                    </div>
                                    <div className="w-1/10 min-w-[100px] relative">
                                        {/* Icona posizionata dentro l'input */}
                                        <CirclePause size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />

                                        <Input
                                            type="number"
                                            min={1}
                                            max={5}
                                            value={creaTurniForm?.orePausa ?? ""}
                                            onChange={(e) =>
                                                setNumeroOrePausa(e.target.value ? parseInt(e.target.value) : undefined)
                                            }
                                            className="w-full pl-8 bg-white" // pl-8 per fare spazio all'icona
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Note per il turno..."
                                            value={creaTurniForm?.noteTurno ?? ''}
                                            onChange={(e) => setNoteTurno(e.target.value)}
                                            className="w-full bg-white"
                                        />
                                    </div>
                                </div>


                                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                    <div className="w-full">
                                        <Button onClick={aggiungiTurno}
                                            className="w-full bg-[#72ad97] hover:bg-[#8ECDB6] text-white cursor-pointer"
                                            disabled={editingDate !== null}
                                        >
                                            AGGIUNGI TURNO
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-300 my-4" />

                <div className="flex items-center bg-[#ecf3f1] p-4 mb-1">
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full rounded-none">
                                    {filtroData
                                        ? filtroData.toLocaleDateString()
                                        : "Seleziona data"}
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filtroData}
                                    onSelect={setDataInizio}
                                    locale={it}
                                    className="pointer-events-auto"
                                />
                            </PopoverContent>
                        </Popover>

                    </div>

                    <div className="mr-8">
                        <Button
                            className="bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer rounded-r-full rounded-l-none -ml-px"
                            onClick={() => {
                                if (filtroData) {
                                    caricaTurni(filtroData);
                                }
                            }}
                        >
                            Filtra
                        </Button>
                    </div>

                    <div>
                        <CopiaTurnoDialog
                            open={copiaTurnoDialogOpen}
                            setOpen={setCopiaTurnoDialogOpen}
                            onSubmit={handleSubmitCopiaTurno}
                            onClickNuovo={copiaTurnoSelezionato}
                            filtroData={filtroData}
                            disabled={editingDate !== null}
                        />
                    </div>

                </div>

                <Table className="mt-1">
                    <TableHeader>
                        <TableRow className="[&>th]:text-[16px] [&>th]:font-bold [&>th]:text-[#656565]">
                            <TableHead>DATA</TableHead>
                            <TableHead>ORA INIZIO</TableHead>
                            <TableHead>ORA FINE</TableHead>
                            <TableHead>ORE</TableHead>
                            <TableHead>TIPOLOGIA</TableHead>
                            <TableHead>MANSIONE</TableHead>
                            <TableHead>OPERATORE</TableHead>
                            <TableHead>ORE PAUSA</TableHead>
                            <TableHead>TL</TableHead>
                            <TableHead>NOTE</TableHead>
                            <TableHead>Azioni</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {turni.map((turno, index) => {

                            const turnoEdit = modificheTurni[turno.idTurno];

                            const isEditing =
                                editingDate !== null &&
                                turno.dataTurno &&
                                formatDateKey(turno.dataTurno) === editingDate;

                            const isAnotherDateEditing =
                                editingDate !== null &&
                                turno.dataTurno &&
                                formatDateKey(turno.dataTurno) !== editingDate;

                            const isNewDate = isNuovaData(turni, index);
                            const nuovaData = getNuovaData(turni, index);

                            const oreAssegnate = nuovaData
                                ? calcolaTotaleOreLavorateTurnoEvento(
                                    turniRaggruppati[nuovaData]
                                )
                                : "00:00";

                            const oreTotali = nuovaData
                                ? calcolaTotaleOreTurnoEvento(
                                    turniRaggruppati[nuovaData]
                                )
                                : "00:00";

                            const oreRimanenti = calcolaOreRimanenti(
                                oreAssegnate,
                                oreTotali
                            );


                            return (
                                <React.Fragment key={turno.idTurno}>

                                    {/* SEPARATORE DATA */}

                                    {isNewDate && (
                                        <TableRow>
                                            <TableCell
                                                colSpan={12}
                                                className="bg-[#d9d8d8]"
                                            >
                                                <div className="flex justify-center items-center  gap-4">

                                                    {!isEditing ? (

                                                        <Button
                                                            variant="ghost"
                                                            className="cursor-pointer rounded-full bg-[#007a55] hover:bg-[#006847] text-white w-7 h-7 p-0 transition"
                                                            onClick={() =>
                                                                modificaTurniStessaData(turno.dataTurno)
                                                            }
                                                            disabled={isAnotherDateEditing}
                                                        >
                                                            <LockKeyhole className="h-4 w-4 text-white" />
                                                        </Button>


                                                    ) : (

                                                        <InviaNotificaOperatoreDialog
                                                            open={inviaNotificheOperatoreOpen}
                                                            setOpen={setInviaNotificheOperatoreOpen}
                                                            onSubmit={aggiornaOperatoreConInvioNotifica}
                                                            onClickNuovo={
                                                                inviaNotificaOperatoreDialogOpen
                                                            }
                                                            onClickAnnulla={
                                                                aggiornaOperatoreSenzaInvioNotifica
                                                            }
                                                            almenoUnOperatoreAssegnato={almenoUnOperatoreAssegnato}
                                                        />

                                                    )}


                                                    {
                                                        nuovaData && (
                                                            <>
                                                                <span className="text-[16px] font-semibold text-[#2e2e2e]">
                                                                    Assegnate
                                                                </span>
                                                                <span className="text-[18px] font-bold text-[#e48946]">
                                                                    {oreAssegnate} / {oreTotali}
                                                                </span>

                                                                <span className="text-[16px] font-semibold text-[#2e2e2e]">
                                                                    Mancano:
                                                                </span>
                                                                <span className="text-[18px] font-bold text-[#e48946]">
                                                                    {oreRimanenti}.
                                                                </span>


                                                            </>
                                                        )
                                                    }
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    {/* ===================================================== */}
                                    {/* ====================== EDIT ========================= */}
                                    {/* ===================================================== */}

                                    {isEditing ? (

                                        <TableRow>

                                            <TableCell>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline">
                                                            <CalendarIcon className="mr-2 h-4 w-4" />

                                                            {turnoEdit?.dataTurno
                                                                ? new Date(turnoEdit.dataTurno).toLocaleDateString()
                                                                : "Seleziona data"}
                                                        </Button>
                                                    </PopoverTrigger>

                                                    <PopoverContent
                                                        className="w-auto p-0"
                                                        align="start"
                                                    >
                                                        <Calendar
                                                            mode="single"
                                                            selected={
                                                                turnoEdit?.dataTurno
                                                                    ? new Date(
                                                                        turnoEdit.dataTurno
                                                                    )
                                                                    : undefined
                                                            }
                                                            onSelect={(date) =>
                                                                setModificaDataTurno(
                                                                    turno.idTurno,
                                                                    date
                                                                )
                                                            }
                                                            locale={it}
                                                            className="pointer-events-auto"
                                                            disabled={
                                                                dataMinima
                                                                    ? { before: dataMinima }
                                                                    : undefined
                                                            }
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </TableCell>

                                            <TableCell>
                                                <Input
                                                    type="time"
                                                    value={turnoEdit?.oraInizio ?? ""}
                                                    onChange={(e) =>
                                                        aggiornaTurnoModifica(
                                                            turno.idTurno,
                                                            "oraInizio",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Input
                                                    type="time"
                                                    value={turnoEdit?.oraFine ?? ""}
                                                    onChange={(e) =>
                                                        aggiornaTurnoModifica(
                                                            turno.idTurno,
                                                            "oraFine",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell>
                                                {calcolaTotaleOre(
                                                    turnoEdit?.oraInizio ?? "",
                                                    turnoEdit?.oraFine ?? ""
                                                ).toFixed(2)}
                                            </TableCell>

                                            <TableCell>
                                                <Select
                                                    value={turnoEdit?.tipologiaTurno}
                                                    onValueChange={(value) =>
                                                        aggiornaTurnoModifica(
                                                            turno.idTurno,
                                                            "tipologiaTurno",
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleziona tipologia" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {tipologieTurno.map((tipologia) => (
                                                            <SelectItem
                                                                key={tipologia}
                                                                value={tipologia}
                                                            >
                                                                {tipologia}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            <TableCell>
                                                <Select
                                                    value={turnoEdit?.tipoMansione}
                                                    onValueChange={(value) =>
                                                        aggiornaTurnoModifica(
                                                            turno.idTurno,
                                                            "tipoMansione",
                                                            value
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Seleziona tipo mansione" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        {tipoMansione.map((mansione) => (
                                                            <SelectItem
                                                                key={mansione}
                                                                value={mansione}
                                                            >
                                                                {mansione}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>

                                            <TableCell>

                                                {turnoEdit?.idOperatore ? (

                                                    <div className="flex items-center gap-1">
                                                        {turnoEdit?.nicknameOperatore ||
                                                            `${turnoEdit?.nomeOperatore} ${turnoEdit?.cognomeOperatore}`}

                                                        <Button
                                                            variant="ghost"
                                                            onClick={() =>
                                                                assegnaOperatore(turno.idTurno)
                                                            }
                                                            className="h-5 w-5 p-0 flex items-center justify-center"
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() =>
                                                                handleOperatoreClick(turno.idTurno, undefined, "", "", "")
                                                            }
                                                            className="h-5 w-5 p-0 flex items-center justify-center"

                                                        >
                                                            <UserRoundX className="h-4 w-4" />

                                                        </Button>
                                                    </div>

                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() =>
                                                                assegnaOperatore(turno.idTurno)
                                                            }
                                                            className="flex items-center gap-2 rounded-[14px]
                                                                    border border-[#72ad97] bg-[#f0fff9]
                                                                    py-1 px-3 cursor-pointer
                                                                    hover:bg-[#e0fff4]
                                                                    hover:border-[#5cae88]
                                                                    transition-colors duration-200"
                                                        >
                                                            <div className="w-6 h-6">
                                                                <img
                                                                    src="/assets/user_plus.svg"
                                                                    className="w-full h-full"
                                                                />
                                                            </div>

                                                            <span className="text-[14px] font-semibold text-[#326455]">
                                                                ASSEGNA
                                                            </span>
                                                        </Button>
                                                    </>
                                                )}

                                            </TableCell>

                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="4"
                                                    step="0.5"
                                                    value={turnoEdit?.orePausa ?? 0}
                                                    onChange={(e) =>
                                                        aggiornaTurnoModifica(
                                                            turno.idTurno,
                                                            "orePausa",
                                                            e.target.value
                                                        )
                                                    }
                                                />
                                            </TableCell>

                                            <TableCell>
                                                <Checkbox
                                                    checked={turnoEdit?.teamLeader === 1}
                                                    onCheckedChange={(checked) =>
                                                        aggiornaTeamLeader(turno.idTurno, checked)
                                                    }
                                                    className="
                                                        bg-[#e3e3e3]
                                                        border-[#e3e3e3]
                                                        data-[state=checked]:bg-[#72ad97]
                                                        data-[state=checked]:border-[#72ad97]
                                                    "
                                                />
                                            </TableCell>

                                            <TableCell>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    aggiungiNote(turno.idTurno);
                                                                    setNoteTurnoDialogOpen(true);
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <StickyNote className="w-4 h-4 mr-2" />
                                                            </Button>
                                                        </TooltipTrigger>

                                                        <TooltipContent className="max-w-[60ch]">
                                                            <p className="whitespace-pre-wrap break-words">
                                                                {turno.noteTurno}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                            </TableCell>

                                            <TableCell>

                                            </TableCell>

                                        </TableRow>

                                    ) : (

                                        /* ===================================================== */
                                        /* ====================== VIEW ========================= */
                                        /* ===================================================== */

                                        <TableRow>

                                            <TableCell>
                                                {format(
                                                    turno.dataTurno!,
                                                    "d MMMM yyyy",
                                                    { locale: it }
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {turno.oraInizio}
                                            </TableCell>

                                            <TableCell>
                                                {turno.oraFine}
                                            </TableCell>

                                            <TableCell>
                                                {calcolaTotaleOre(
                                                    turno.oraInizio ?? "",
                                                    turno.oraFine ?? ""
                                                ).toFixed(2)}
                                            </TableCell>

                                            <TableCell>
                                                {turno.tipologiaTurno}
                                            </TableCell>

                                            <TableCell>
                                                {turno.tipoMansione}
                                            </TableCell>

                                            <TableCell>
                                                {turno.idOperatore != null ? (
                                                    turno.nicknameOperatore ||
                                                    `${turno.nomeOperatore} ${turno.cognomeOperatore}`
                                                ) : (
                                                    <span className="font-bold text-[#CE4545]">
                                                        NON ASSEGNATO
                                                    </span>
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {turno.orePausa ?? 0}
                                            </TableCell>

                                            <TableCell>
                                                {turno.teamLeader ? "Si" : "No"}
                                            </TableCell>

                                            <TableCell>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => {
                                                                    aggiungiNote(turno.idTurno);
                                                                    setNoteTurnoDialogOpen(true);
                                                                }}
                                                                className="cursor-pointer"
                                                            >
                                                                <StickyNote
                                                                    className={
                                                                        turno.noteTurno?.trim()
                                                                            ? "w-4 h-4 mr-2 text-green-500"
                                                                            : "w-4 h-4 mr-2"
                                                                    }
                                                                />
                                                            </Button>
                                                        </TooltipTrigger>

                                                        <TooltipContent className="max-w-[60ch]">
                                                            <p className="whitespace-pre-wrap break-words">
                                                                {turno.noteTurno}
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                            </TableCell>

                                            <TableCell>
                                                <>
                                                    <Button variant="ghost"
                                                        onClick={() =>
                                                            duplicaRiga(turno.idTurno)
                                                        }
                                                        className="cursor-pointer"
                                                        disabled={editingDate !== null}
                                                    >
                                                        <Copy className="mr-2 h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="ghost"
                                                        onClick={() => invioWhatsappOperatore(turno.idTurno)}
                                                        disabled={turno.idOperatore == null || editingDate !== null}
                                                        className="cursor-pointer"
                                                    >
                                                        <img
                                                            src="/assets/whatsapp.svg"
                                                            alt="Logo"
                                                            className="mr-2 h-4 w-4"
                                                        />
                                                    </Button>

                                                    <Button variant="ghost"
                                                        onClick={() =>
                                                            handleDeleteTurno(turno.idTurno)
                                                        }
                                                        className="cursor-pointer"
                                                        disabled={editingDate !== null}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                    </Button>
                                                </>
                                            </TableCell>

                                        </TableRow>
                                    )}

                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>

                <NoteDialog
                    open={noteTurnoDialogOpen}
                    setOpen={setNoteTurnoDialogOpen}
                    formDatiNoteTurno={formDatiNoteTurno}
                    setFormDatiNoteTurno={setFormDatiNoteTurno}
                    onSubmit={handleSubmitNote}
                    onClickNuovo={aggiungiNote}
                    idTurno={formDatiNoteTurno.idTurno}
                />


                <div className="w-full mt-4 flex justify-end">
                    <div className="flex gap-x-8 bg-[#e9f2ef] p-4 rounded-bl-md rounded-br-md">
                        <div>
                            <span style={{ color: '#2e2e2e', fontSize: '18px', fontWeight: 'normal' }}>Totale ore fatturate: </span>
                            <span style={{ fontSize: '25px', fontWeight: 'bold', color: '#72ad97' }}>{calcolaTotaleOreTurnoEvento(turni)}</span>
                        </div>
                        <div>
                            <span style={{ color: '#2e2e2e', fontSize: '18px', fontWeight: 'normal' }}>Totale ore assegnate: </span>
                            <span style={{ fontSize: '25px', fontWeight: 'bold', color: '#72ad97' }}>{calcolaTotaleOreLavorateTurnoEvento(turni)}</span>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                        <div className="bg-white px-8 py-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
                            <div className="animate-spin h-10 w-10 border-4 border-[#007a55] border-t-transparent rounded-full"></div>
                            <span className="text-[#007a55] font-semibold text-lg">
                                Invio in corso...
                            </span>
                        </div>
                    </div>
                )}

                <AssegnaOperatoreDialog
                    open={assegnaOperatoreDialogOpen}
                    setOpen={setAssegnaOperatoreDialogOpen}
                    idTurno={idTurnoSelezionato ?? 0}
                    listaOperatori={dipendenti}
                    handleOperatoreClick={handleOperatoreClick}
                />


            </section>

        </>

    )
}

export default getsioneTurni