import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { MapPin, CalendarDays, ContactRound, UsersRound, Crown, MapPinCheckInside, MapPinXInside } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificaRitardoTimbraturaDialog } from "./dialog/notificaRitardoTimbraturaDialog";

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

    //const [turnoGiornaliero, setTurnoGiornaliero] = useState<TurnoEvento>();
    const [turniGiornalieri, setTurniGiornalieri] = useState<TurnoEvento[]>([]);
    const [loading, setLoading] = useState(false);
    const [statoCheck, setStatoCheck] = useState<boolean>(true);
    const [notificaRitardoTimbraturaDialogOpen, setNotificaRitardoTimbraturaDialogOpen] = useState(false);
    const [checkInValue, setCheckInValue] = useState<boolean>(true);
    const navigate = useNavigate();


    useEffect(() => {

        /*
        if (!navigator.geolocation) {
            console.error('La geolocalizzazione non è supportata dal browser.');
            return;
        }

        setWatcher(navigator.geolocation.watchPosition(
            (pos: GeolocationPosition) => {
                console.log("success inizio*****");
                setPosition({
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude,
                });
                console.log("success fine*****");
            },
            (err: GeolocationPositionError) => {
                console.log("failure inizio*****");
                console.error(err.message);
                console.log("failure fine*****");
            }
        ));
        */

        caricaTurniAssegnati();
        checkInCheckOutControl();
        //getlocation();
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

        //if (data) {
        setStatoCheck(!data.statoCheck);
        //}

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
        /*
        if (!resp.ok) {
            // alert("creaCheckInCheckOut!");
            throw new Error(data.message || "Errore nella richiesta");
        }
            */

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

                    alert(
                        `${checkIn ? 'Effettuato Check In' : 'Effettuato Check Out'}`
                    );
                    checkInCheckOutControl();
                } catch (err) {
                    console.error(err);
                    alert(`${err}`);
                } finally {
                    setLoading(false);
                }
                //setStatoCheck(!checkIn);
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
        <section className="p-3">
            <div className="pb-2 text-[24px] font-black text-[#006b44]">
                Turni di oggi
            </div>

            <div className="mb-6 flex items-center gap-2 text-[#424940] leading-none">
                <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
                <span className="text-[16px] font-normal">
                    {formatDateShort()}
                </span>
            </div>

            <div className="w-full max-w-xl mx-auto text-center mt-2 mb-6 border border-[#72ad97] pl-4 pr-4 pt-8 pb-8 rounded-[15px] bg-white">
                <div>
                    <div className="mb-6 leading-none text-center">
                        <div className="text-[40px] font-semibold text-[#006b44]">
                            {oraCorrente}
                        </div>
                        <div className="text-[12px] font-medium text-[#424940]">
                            ORARIO CORRENTE
                        </div>
                    </div>
                    {turniGiornalieri.length === 0 ? (
                        <div className="flex flex-col items-center w-full gap-3">

                            <span className="text-[22px] font-normal text-[#2b2b2b]">
                                Nessun turno assegnato
                            </span>

                            <Button
                                onClick={() => navigate("/operator/turniFuturi")}
                                className="w-full rounded-[24px] bg-[#e48946] shadow-[0_2px_4px_0_rgba(0,0,0,0.5)] cursor-pointer"
                                size="lg"
                            >
                                <span className="text-white text-[26px] font-bold">
                                    Vedi i prossimi turni
                                </span>
                            </Button>
                        </div>
                    ) : (
                        <Button
                            onClick={() => effettuaCheckInCheckOut(statoCheck)} disabled={loading}
                            className={`w-full rounded-[25.5px] cursor-pointer 
                             ${statoCheck
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
                <>
                    <Card className="shadow-lg w-full mx-auto mb-4 border-[#72ad97]">

                        <CardContent className="space-y-6 px-0">

                            <div className="pr-4 pl-4 flex flex-col items-center">
                                <span className="text-[#007a55] text-[16px] font-normal">EVENTO</span>
                                <span className="text-[#007a55] text-[32px] font-extrabold leading-[1.2em]">{turnoGiornaliero.titoloEvento}</span>
                            </div>

                            <div className="border-b border-gray-300 pr-4 pl-4 pb-4 flex flex-col items-center">
                                <MapPin className="h-10 w-10" style={{ color: '#007a55' }} />
                                <span className="text-[22px] font-normal text-[#5e5d5d]">{turnoGiornaliero.localitaEvento}</span>
                            </div>

                            <div className=" items-center space-x-3  border-b border-gray-300  pb-4">
                                {turnoGiornaliero.orarioTurni.map((orarioTurno, index) => {
                                    const isEven = index % 2 === 0;
                                    const bgColor = isEven ? "bg-[#f7fbff]" : "bg-[#fffaf4]";

                                    return (
                                        <div key={index} className={`w-full space-y-1 p-4 ${bgColor}`}>

                                            <div
                                                className={`
                                                        text-[18px] font-semibold mb-2 text-center rounded-[21px] py-2
                                                        ${isEven
                                                        ? "bg-[#e4f1ff] text-[#003a63]"  // PARI
                                                        : "bg-[#fff4e6] text-[#7a4900]"  // DISPARI
                                                    }
                                                        `}
                                            >
                                                {index + 1 === 1
                                                    ? "DETTAGLIO TURNO"
                                                    : `DETTAGLIO TURNO ${index + 1}`}
                                            </div>

                                            <div className="border-b border-b-[#ececec] pt-5 pb-5 font-bold text-[20px] text-[#4f4f4f]">
                                                Dalle {orarioTurno.oraInizio} alle {orarioTurno.oraFine}
                                            </div>

                                            <div className="space-y-2 pt-5 pb-5 border-b border-b-[#ececec]">
                                                <div className="flex gap-2 text-[20px] ">
                                                    <div className="text-[#4f4f4f] font-bold">
                                                        Tipologia di turno:
                                                    </div>
                                                    <div className="text-[#2b2b2b] font-normal">
                                                        {orarioTurno.tipologiaTurno}
                                                    </div>
                                                </div>

                                                <div className="flex gap-2 text-[20px]">
                                                    <div className="text-[#4f4f4f]  font-bold">
                                                        La tua mansione:
                                                    </div>
                                                    <div className="text-[#2b2b2b] font-normal">
                                                        {orarioTurno.tipoMansione}
                                                    </div>
                                                </div>
                                            </div>

                                            {orarioTurno.teamLeader ?
                                                <div className="flex items-center w-full gap-2 pt-5 pb-5 border-b border-b-[#ececec]">
                                                    <div className="text-[20px] font-bold text-[#4f4f4f]">
                                                        SEI TEAM LEADER
                                                    </div>
                                                    <Crown className="h-6 w-6  stroke-[#007a55]" />
                                                </div>
                                                : ""}

                                            <div className="items-center w-full text-[20px] gap-2 p-1 pt-5">
                                                <div className="font-bold text-[#4f4f4f]">
                                                    Note:
                                                </div>
                                                <div className="font-normal text-[#2b2b2b]" >
                                                    {orarioTurno.notaTurno}
                                                </div>
                                            </div>


                                        </div>
                                    );
                                })}

                            </div>

                            {/*
                            <div className="border-b border-gray-300 pb-4">
                                <div className="flex items-center gap-2">
                                    <Pin className="h-6 w-6 text-[#007a55]" strokeWidth={1.5} />
                                    <span className="text-[26px] font-extrabold text-[#007a55]">Info incarico</span>
                                </div>

                                <div className="flex gap-2 ml-4 p-1">
                                    <div className="text-[#656565] text-[16px] font-bold">
                                        Tipologia di turno:
                                    </div>
                                    <div className="text-[#5e8a7a] text-[16px] font-normal">
                                        {turnoGiornaliero?.tipologiaTurno}
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4 p-1">
                                    <div className="text-[#656565] text-[16px] font-bold">
                                        La tua mansione:
                                    </div>
                                    <div className="text-[#5e8a7a] text-[16px] font-normal">
                                        {turnoGiornaliero?.tipoMansione}
                                    </div>
                                </div>
                            </div>
                            */}

                            <div className="border-b border-gray-300 p-4 pb-4">
                                {/* Titolo con icona */}
                                <div className="flex items-center gap-2">
                                    <ContactRound className="h-7 w-7 text-[#007a55]" strokeWidth={1.5} />
                                    <span className="text-[26px] font-extrabold text-[#007a55]">Referente evento</span>
                                </div>

                                {/* Dettagli referente */}
                                <div className="flex gap-2 ml-4 p-1">
                                    <div className="text-[#656565] text-[16px] font-bold">
                                        {turnoGiornaliero?.nomeCognomeReferente}:
                                    </div>
                                    <div className="text-[#5e8a7a] text-[16px] font-normal">
                                        <a href={`tel:${turnoGiornaliero?.telefonoReferente}`} style={{ color: 'blue', textDecoration: 'underline' }}>
                                            {turnoGiornaliero?.telefonoReferente}
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex items-center gap-2">
                                    <UsersRound className="h-6 w-6" style={{ color: '#007a55' }} strokeWidth={1.5} />
                                    <span className="text-[26px] font-extrabold text-[#007a55]">Colleghi</span>
                                </div>

                                {turnoGiornaliero.listaColleghi.map((collega) => (
                                    <>
                                        <div className="w-full ml-4 p-1">
                                            <div className="flex gap-2">
                                                <div className="text-[#656565] text-[16px] font-bold">
                                                    {`${collega.nome} ${collega.cognome}`}
                                                </div>
                                                <div className="text-[#5e8a7a] text-[16px] font-normal">
                                                    {collega.telefono}
                                                </div>
                                            </div>
                                            <div className="flex gap-4">
                                                <div className="text-[#656565] text-[16px] font-normal">
                                                    Dalle {collega.oraInizio} alle {collega.oraFine}
                                                </div>
                                                <div className="text-[#333333] text-[16px] font-light">
                                                    {collega.teamLeader ? "TEAM LEADER" : ""}
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </>
            ))}

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