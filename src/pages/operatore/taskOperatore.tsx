import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import {
    CalendarDays,
    ChevronRight,
    ContactRound,
    Crown,
    MapPin,
    MapPinCheckInside,
    MapPinXInside,
    UsersRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificaRitardoTimbraturaDialog } from "./dialog/notificaRitardoTimbraturaDialog";
import { ReferenteEventoDialog } from "./dialog/referenteEventoDialog";
import { ColleghiTurnoDialog } from "./dialog/colleghiTurnoDialog";

type OrarioTurni = {
    oraInizio: string
    oraFine: string
    notaTurno: string
    tipologiaTurno: string
    tipoMansione: string
    teamLeader: boolean
}

type ListaColleghi = {
    nome: string
    cognome: string
    telefono: string
    oraInizio: string
    oraFine: string
    teamLeader: boolean
    gpg: boolean
}

type TurnoEvento = {
    idTurno: number
    titoloEvento: string
    localitaEvento: string
    nomeCognomeReferente: string
    telefonoReferente: string
    dataTurno: string;
    orarioTurni: OrarioTurni[];
    listaColleghi: ListaColleghi[];
}

type CheckInCheckOut = {
    idOperatore: number
    checkIn: boolean
    latitudine: number
    longitudine: number
    motivazione: string
}

const TaskOperatore = () => {
    console.log('Sono in TaskOperatore***');
    const idOperatore = localStorage.getItem('idOperatore');
    console.log('idOperatore: ' + idOperatore);

    const [turniGiornalieri, setTurniGiornalieri] = useState<TurnoEvento[]>([]);
    const [loading, setLoading] = useState(false);
    const [statoCheck, setStatoCheck] = useState<boolean>(true);
    const [notificaRitardoTimbraturaDialogOpen, setNotificaRitardoTimbraturaDialogOpen] = useState(false);
    const [referenteEventoDialogOpen, setReferenteEventoDialogOpen] = useState(false);
    const [colleghiTurnoDialogOpen, setColleghiTurnoDialogOpen] = useState(false);
    const [checkInValue, setCheckInValue] = useState<boolean>(true);
    const [turnoSelezionato, setTurnoSelezionato] = useState<TurnoEvento | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        caricaTurniAssegnati();
        checkInCheckOutControl();
    }, [])

    const caricaTurniAssegnati = async () => {
        const resp = await fetch(ezystaffBEUrl + `turni/turniGiornalieri/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log("Turni giornalieri inizio******");
        console.log(data);
        console.log("Turni giornalieri fine******");
        setTurniGiornalieri(data);
    }

    const checkInCheckOutControl = async () => {
        const resp = await fetch(ezystaffBEUrl + `operatori/statoCheck/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log("data: ******** " + data);
        console.log("risposta: ******** " + JSON.stringify(data));
        console.log("data.statoCheck: " + data.statoCheck);

        setStatoCheck(!data.statoCheck);
    }

    const creaCheckInCheckOut = async (checkInCheckOut: CheckInCheckOut) => {
        console.log(JSON.stringify(checkInCheckOut));
        const resp = await fetch(ezystaffBEUrl + `operatori/checkInCheckOut/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(checkInCheckOut)
        });
        const data = await resp.json();

        if (!resp.ok) {
            return { success: false, message: data.message };
        }

        console.log(data);
    }

    const effettuaCheckInCheckOut = async (checkIn: boolean) => {
        setCheckInValue(checkIn);

        if (!checkIn) {
            const motivaTimbratura = await verificaRitardoTimbratura();

            if (motivaTimbratura) {
                setNotificaRitardoTimbraturaDialogOpen(true);
                return;
            }
        }

        await handleClick(checkIn);
    };

    const handleSubmitRitardo = async (
        e: React.FormEvent,
        checkIn: boolean,
        motivazione: string
    ) => {
        e.preventDefault();
        setNotificaRitardoTimbraturaDialogOpen(false);
        await handleClick(checkIn, motivazione);
    };

    const verificaRitardoTimbratura = async () => {
        const resp = await fetch(ezystaffBEUrl + `operatori/richiediMotivazioneTimbratura/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "GET",
            credentials: 'include',
        });
        const data = await resp.json();
        console.log('verificaRitradoTimbratura: ', data);
        return data;
    }

    const handleClick = async (checkIn: boolean, motivazione?: string) => {
        console.log("motivazione: ", motivazione);
        if (!navigator.geolocation) {
            alert("Geolocalizzazione non supportata");
            return;
        }
        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    console.log("Latitudine:", position.coords.latitude);
                    console.log("Longitudine:", position.coords.longitude);

                    const checkInCheckOut: CheckInCheckOut = {
                        idOperatore: Number(idOperatore),
                        checkIn: checkIn,
                        latitudine: position.coords.latitude,
                        longitudine: position.coords.longitude,
                        motivazione: motivazione ?? ""
                    }
                    console.log(checkInCheckOut);
                    const result = await creaCheckInCheckOut(checkInCheckOut);
                    setLoading(false);

                    if (result && !result.success) {
                        alert(result.message);
                        return;
                    }

                    alert(`${checkIn ? 'Effettuato Check In' : 'Effettuato Check Out'}`);
                    checkInCheckOutControl();
                } catch (err) {
                    console.error(err);
                    alert(`${err}`);
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Errore:", error);
                setLoading(false);
                alert(`${error.message}`);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 10000,
            }
        );
    };

    const apriReferenteEvento = (turno: TurnoEvento) => {
        setTurnoSelezionato(turno);
        setReferenteEventoDialogOpen(true);
    };

    const apriColleghiTurno = (turno: TurnoEvento) => {
        setTurnoSelezionato(turno);
        setColleghiTurnoDialogOpen(true);
    };

    const formatDateShort = (): string => {
        const today = new Date();

        const weekday = today.toLocaleDateString("it-IT", {
            weekday: "long",
        });

        const date = today.toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });

        return `${weekday}, ${date}`;
    };

    const formatTimeShort = (): string => {
        const now = new Date();

        return now.toLocaleTimeString("it-IT", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
        });
    };

    const [oraCorrente, setOraCorrente] = useState<string>(formatTimeShort());

    useEffect(() => {
        const timer = setInterval(() => {
            setOraCorrente(formatTimeShort());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="min-h-screen bg-[#031821] p-3 font-['Mulish'] text-white">
            <div className="pb-2 text-[24px] font-black text-[#19e6b3]">
                Turni di oggi
            </div>

            <div className="mb-6 flex items-center gap-2 text-[#9db7b6] leading-none">
                <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-[16px] font-normal">
                    {formatDateShort()}
                </span>
            </div>

            <div className="w-full max-w-xl mx-auto text-center mt-2 mb-6 border border-[#0b6d5c] pl-4 pr-4 pt-8 pb-8 rounded-[20px] bg-[#061e28] shadow-[0_18px_40px_rgba(0,0,0,0.35)]">
                <div>
                    <div className="mb-6 leading-none text-center">
                        <div className="text-[40px] font-semibold text-[#19e6b3]">
                            {oraCorrente}
                        </div>
                        <div className="text-[12px] font-medium text-[#9db7b6]">
                            ORARIO CORRENTE
                        </div>
                    </div>
                    {turniGiornalieri.length === 0 ? (
                        <div className="flex flex-col items-center w-full gap-3">
                            <span className="text-[22px] font-normal text-white">
                                Nessun turno assegnato
                            </span>

                            <Button
                                onClick={() => navigate("/operator/turniFuturi")}
                                className="w-full rounded-[24px] bg-[#e48946] shadow-[0_2px_4px_0_rgba(0,0,0,0.5)] cursor-pointer hover:bg-[#cc773b]"
                                size="lg"
                            >
                                <span className="text-white text-[26px] font-bold">
                                    Vedi i prossimi turni
                                </span>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => effettuaCheckInCheckOut(statoCheck)}
                            disabled={loading}
                            className={`w-full rounded-[25.5px] cursor-pointer ${statoCheck
                                ? 'bg-[#019165] hover:bg-[#017a56]'
                                : 'bg-[#d64933] hover:bg-[#b63d2b]'}`}
                            size="lg"
                        >
                            <span className="text-white text-[26px] font-bold flex items-center gap-2">
                                {statoCheck ? (
                                    loading ? (
                                        'Localizzazione in corso...'
                                    ) : (
                                        <>
                                            <MapPinCheckInside className="!w-[20px] !h-[20px]" />
                                            CHECK-IN
                                        </>
                                    )
                                ) : (
                                    loading ? (
                                        'Localizzazione in corso...'
                                    ) : (
                                        <>
                                            <MapPinXInside className="!w-[20px] !h-[20px]" />
                                            CHECK-OUT
                                        </>
                                    )
                                )}
                            </span>
                        </Button>
                    )}
                </div>
            </div>

            {turniGiornalieri.map((turnoGiornaliero) => (
                <Card key={turnoGiornaliero.idTurno} className="shadow-lg w-full mx-auto mb-4 border-[#0b6d5c] bg-[#061e28] text-white">
                    <CardContent className="space-y-6 px-0 pt-6">
                        <div className="pr-4 pl-4 flex flex-col items-center">
                            <span className="text-[#19e6b3] text-[16px] font-normal">EVENTO</span>
                            <span className="text-[#19e6b3] text-[32px] font-extrabold leading-[1.2em] text-center">
                                {turnoGiornaliero.titoloEvento}
                            </span>
                        </div>

                        <div className="border-b border-[#16464d] pr-4 pl-4 pb-4 flex flex-col items-center">
                            <MapPin className="h-10 w-10" style={{ color: '#19e6b3' }} />
                            <span className="text-[22px] font-normal text-[#cfe7e4] text-center">
                                {turnoGiornaliero.localitaEvento}
                            </span>
                        </div>

                        <div className="items-center space-x-3 border-b border-[#16464d] pb-4">
                            {turnoGiornaliero.orarioTurni.map((orarioTurno, index) => {
                                const isEven = index % 2 === 0;
                                const bgColor = isEven ? "bg-[#071f2c]" : "bg-[#082a24]";

                                return (
                                    <div key={index} className={`w-full space-y-1 p-4 ${bgColor}`}>
                                        <div
                                            className={`text-[18px] font-semibold mb-2 text-center rounded-[21px] py-2 ${isEven
                                                ? "bg-[#0b3242] text-[#9be7ff]"
                                                : "bg-[#123b30] text-[#19e6b3]"
                                            }`}
                                        >
                                            {index + 1 === 1
                                                ? "DETTAGLIO TURNO"
                                                : `DETTAGLIO TURNO ${index + 1}`}
                                        </div>

                                        <div className="border-b border-b-[#16464d] pt-5 pb-5 font-bold text-[20px] text-white">
                                            Dalle {orarioTurno.oraInizio} alle {orarioTurno.oraFine}
                                        </div>

                                        <div className="space-y-2 pt-5 pb-5 border-b border-b-[#16464d]">
                                            <div className="flex flex-col gap-1 text-[20px]">
                                                <div className="text-[#9db7b6] font-bold">
                                                    Tipologia di turno:
                                                </div>
                                                <div className="text-white font-normal">
                                                    {orarioTurno.tipologiaTurno}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1 text-[20px]">
                                                <div className="text-[#9db7b6] font-bold">
                                                    La tua mansione:
                                                </div>
                                                <div className="text-white font-normal">
                                                    {orarioTurno.tipoMansione}
                                                </div>
                                            </div>
                                        </div>

                                        {orarioTurno.teamLeader ? (
                                            <div className="flex items-center w-full gap-2 pt-5 pb-5 border-b border-b-[#16464d]">
                                                <div className="text-[20px] font-bold text-[#19e6b3]">
                                                    SEI TEAM LEADER
                                                </div>
                                                <Crown className="h-6 w-6 stroke-[#19e6b3]" />
                                            </div>
                                        ) : null}

                                        <div className="items-center w-full text-[20px] gap-2 p-1 pt-5">
                                            <div className="font-bold text-[#9db7b6]">
                                                Note:
                                            </div>
                                            <div className="font-normal text-white">
                                                {orarioTurno.notaTurno}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="space-y-3 p-4 pt-0">
                            <button
                                type="button"
                                onClick={() => apriReferenteEvento(turnoGiornaliero)}
                                className="flex w-full items-center justify-between rounded-[18px] border border-[#16464d] bg-[#071f2c] p-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b3b38] text-[#19e6b3]">
                                        <ContactRound className="h-6 w-6" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <div className="text-[19px] font-extrabold text-white">Referente evento</div>
                                        <div className="text-[13px] font-normal text-[#9db7b6]">
                                            {turnoGiornaliero.nomeCognomeReferente || "Apri contatto referente"}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-[#19e6b3]" strokeWidth={2} />
                            </button>

                            <button
                                type="button"
                                onClick={() => apriColleghiTurno(turnoGiornaliero)}
                                className="flex w-full items-center justify-between rounded-[18px] border border-[#16464d] bg-[#071f2c] p-4 text-left shadow-[0_10px_24px_rgba(0,0,0,0.22)]"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0b3b38] text-[#19e6b3]">
                                        <UsersRound className="h-6 w-6" strokeWidth={1.5} />
                                    </div>
                                    <div>
                                        <div className="text-[19px] font-extrabold text-white">Colleghi</div>
                                        <div className="text-[13px] font-normal text-[#9db7b6]">
                                            {turnoGiornaliero.listaColleghi?.length || 0} persone collegate al turno
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-[#19e6b3]" strokeWidth={2} />
                            </button>
                        </div>
                    </CardContent>
                </Card>
            ))}

            <ReferenteEventoDialog
                open={referenteEventoDialogOpen}
                setOpen={setReferenteEventoDialogOpen}
                nomeCognomeReferente={turnoSelezionato?.nomeCognomeReferente}
                telefonoReferente={turnoSelezionato?.telefonoReferente}
            />

            <ColleghiTurnoDialog
                open={colleghiTurnoDialogOpen}
                setOpen={setColleghiTurnoDialogOpen}
                colleghi={turnoSelezionato?.listaColleghi ?? []}
            />

            <NotificaRitardoTimbraturaDialog
                open={notificaRitardoTimbraturaDialogOpen}
                setOpen={setNotificaRitardoTimbraturaDialogOpen}
                onSubmit={handleSubmitRitardo}
                checkIn={checkInValue}
            />
        </section>
    )
}

export default TaskOperatore
