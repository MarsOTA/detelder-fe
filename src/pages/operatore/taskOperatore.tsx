import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { MapPin, CalendarDays, Users, UserStar, MapPinCheckInside, MapPinXInside, Coffee, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificaRitardoTimbraturaDialog } from "./dialog/notificaRitardoTimbraturaDialog";
import { ListaColleghiDialog } from "./dialog/listaColleghiDialog";
import { ReferenteEventoDialog } from "./dialog/referenteEventoDialog";

type ListaColleghi = {
    nome: string
    cognome: string
    telefono: string
    oraInizio: string
    oraFine: string
    tipoMansione: string
    teamLeader: boolean
    gpg: boolean
    timbraturaEffettuata: boolean
}

type TurnoEvento = {
    idTurno: number
    titoloEvento: string
    localitaEvento: string
    nomeCognomeReferente: string
    telefonoReferente: string
    dataTurno: string;
    oraInizio: string
    oraFine: string
    orePausa: number
    notaTurno: string
    tipologiaTurno: string
    tipoMansione: string
    teamLeader: boolean
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
    const [turnoSelezionato, setTurnoSelezionato] = useState<TurnoEvento>();
    const [loading, setLoading] = useState(false);
    const [statoCheck, setStatoCheck] = useState<boolean>(true);
    const [notificaRitardoTimbraturaDialogOpen, setNotificaRitardoTimbraturaDialogOpen] = useState(false);
    const [checkInValue, setCheckInValue] = useState<boolean>(true);
    const navigate = useNavigate();
    const [openListaColleghiDialog, setOpenListaColleghiDialog] = useState(false);
    const [openReferenteEventoDialog, setOpenReferenteEventoDialog] = useState(false);
    const [totaleOre, setTotaleOre] = useState<string>("00:00");
    const [prossimoTurno, setProssimoTurno] = useState<{
        mese: string;
        giorno: string;
    } | null>(null);

    const [numeroTurniFuturi, setNumeroTurniFuturi] = useState<number>(0);


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
        totaleOreRendicontazione();
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

    const totaleOreRendicontazione = async () => {
        console.log("INIZIO totaleOreRendicontazione");

        try {
            const resp = await fetch(
                ezystaffBEUrl + `payroll/totaleOreRendicontazione/${idOperatore}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                        accept: 'application/json'
                    },
                    credentials: 'include',
                }
            );

            console.log("Risposta fetch:", resp.status);

            const data = await resp.json();

            console.log("Totale ore rendicontazione inizio******");
            console.log(data);
            console.log("Totale ore rendicontazione fine******");
            setTotaleOre(data.totaleOre);
            setProssimoTurno(data.prossimoTurno);
            setNumeroTurniFuturi(data.numeroTurniFuturi);
        } catch (error) {
            console.error("Errore totaleOreRendicontazione:", error);
        }
    };

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

    const apriListaColleghi = (idTurno: number) => {

        const turno = turniGiornalieri.find(
            (t) => t.idTurno === idTurno
        );

        if (turno) {
            setTurnoSelezionato(turno);
        }

        setOpenListaColleghiDialog(true);
    };

    const apriRferenteDialog = (idTurno: number) => {

        const turno = turniGiornalieri.find(
            (t) => t.idTurno === idTurno
        );

        if (turno) {
            setTurnoSelezionato(turno);
        }

        setOpenReferenteEventoDialog(true);
    };

    type StatoTurno = "IN_CORSO" | "FUTURO" | "PASSATO";

    const getStatoTurno = (
        dataTurno: string,
        oraInizio: string,
        oraFine: string
    ): StatoTurno => {
        const [giorno, mese, anno] = dataTurno.split("/").map(Number);

        const [oraInizioOre, oraInizioMinuti] = oraInizio.split(":").map(Number);
        const [oraFineOre, oraFineMinuti] = oraFine.split(":").map(Number);

        const inizioTurno = new Date(
            anno,
            mese - 1,
            giorno,
            oraInizioOre,
            oraInizioMinuti
        );

        const fineTurno = new Date(
            anno,
            mese - 1,
            giorno,
            oraFineOre,
            oraFineMinuti
        );

        const adesso = new Date();

        // Il turno è in corso
        if (adesso >= inizioTurno && adesso <= fineTurno) {
            return "IN_CORSO";
        }

        // Il turno deve ancora iniziare
        if (adesso < inizioTurno) {
            return "FUTURO";
        }

        // Il turno è terminato
        return "PASSATO";
    };

    const ordinaTurni = (turni: TurnoEvento[]) => {
        const prioritaStato = {
            IN_CORSO: 0,
            FUTURO: 1,
            PASSATO: 2
        };
    
        const turniConStato = turni.map(turno => ({
            ...turno,
            statoTurno: getStatoTurno(
                turno.dataTurno,
                turno.oraInizio,
                turno.oraFine
            )
        }));
    
        return turniConStato.sort((a, b) => {
            // Prima ordiniamo per stato
            const differenzaStato =
                prioritaStato[a.statoTurno] - prioritaStato[b.statoTurno];
    
            if (differenzaStato !== 0) {
                return differenzaStato;
            }
    
            // A parità di stato ordiniamo per data + ora
            const dataA = new Date(`${a.dataTurno}T${a.oraInizio}`);
            const dataB = new Date(`${b.dataTurno}T${b.oraInizio}`);
    
            return dataA.getTime() - dataB.getTime();
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
        <section className="main-section">
            <div className="titolo">
                Turni di oggi
            </div>

            <div className="dataOggi">
                <CalendarDays className="h-4 w-4" strokeWidth={1.5} />
                <span>
                    {formatDateShort()}
                </span>
            </div>

            <div className="box-checkin-checkout">
                <div>
                    <div className="box-timer">
                        <div className="timer-value">
                            {oraCorrente}
                        </div>
                        <div className="timer-label">
                            ORARIO CORRENTE
                        </div>
                    </div>
                    {turniGiornalieri.length === 0 ? (
                        <div className="flex flex-col items-center w-full gap-3">

                            <span className="text-[22px] font-normal text-[#f2f7f7]">
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
                            className={`check-button ${statoCheck ? "check-button-in" : "check-button-out"}`}
                            size="lg"
                        >
                            <span className="check-button-content">
                                {statoCheck ? (
                                    loading ? (
                                        'Localizzazione in corso...'
                                    ) : (
                                        <>
                                            <MapPinCheckInside className="!w-[20px] !h-[20px]" />
                                            <span className="check-button-in-label">CHECK-IN</span>
                                        </>
                                    )
                                ) : (
                                    loading ? (
                                        'Localizzazione in corso...'
                                    ) : (
                                        <>
                                            <MapPinXInside className="!w-[20px] !h-[20px]" />
                                            <span className="check-button-out-label">CHECK-OUT</span>
                                        </>
                                    )
                                )}
                            </span>
                        </Button>
                    )}
                </div>
            </div>

            {ordinaTurni(turniGiornalieri).map((turnoGiornaliero) => {

                const {statoTurno} = turnoGiornaliero;

                /* MARCELLO - colore card in base allo stato del turno */
                return (
                    <Card className={`card-turni ${statoTurno}`}>

                        <CardContent className="turno-content">

                            <div className="info-orario-turno">
                                <div className="info-ora">

                                    <div className={`stato-turno ${statoTurno}`}>
                                        {statoTurno === "IN_CORSO" && "TURNO IN CORSO"}
                                        {statoTurno === "FUTURO" && "PROSSIMO TURNO"}
                                        {statoTurno === "PASSATO" && "TURNO PASSATO"}
                                    </div>

                                    <div className="orario-turno">
                                        {turnoGiornaliero.oraInizio} - {turnoGiornaliero.oraFine}
                                    </div>
                                </div>
                                <div className="info-pausa">
                                    <div className="pausa-label">
                                        <Coffee
                                            className="h-4 w-4 text-[#ccffec]"
                                            strokeWidth={1.5}
                                        />
                                        <span>Pausa</span>
                                    </div>
                                    <div className="pausa-value">{turnoGiornaliero.orePausa} ora</div>
                                </div>
                            </div>
                            <div className="info-turno">
                                <div className="titolo-evento">{turnoGiornaliero.titoloEvento}</div>

                                <div className="luogo-evento-content">
                                    <MapPin className="h-6 w-6" style={{ color: '#a5e8cf' }} />
                                    <span className="luogo-evento-text">
                                        {turnoGiornaliero.localitaEvento}
                                    </span>
                                </div>

                                <div className="tipo-evento">Tipo evento: {turnoGiornaliero.tipologiaTurno}</div>
                                <div className="tipo-mansione">Mansione: {turnoGiornaliero.tipoMansione}</div>

                                {turnoGiornaliero.notaTurno && (
                                    <div className="note-operative-content">
                                        <div className="note-operative-label">NOTE OPERATIVE</div>
                                        <div className="note-operative-value">
                                            {turnoGiornaliero.notaTurno}
                                        </div>
                                    </div>
                                )}

                            </div>

                            <div className="info-personale-content">

                                <div
                                    className="colleghi-evento"
                                    onClick={() => apriListaColleghi(turnoGiornaliero.idTurno)}
                                >
                                    <Users
                                        className="h-7 w-7 text-[#00ffb8]"
                                        strokeWidth={1.5}
                                    />

                                    <span className="colleghi-evento-label">
                                        Colleghi
                                    </span>
                                </div>

                                <div
                                    className="referente-evento"
                                    onClick={() => apriRferenteDialog(turnoGiornaliero.idTurno)}
                                >
                                    <UserStar
                                        className="h-7 w-7 text-[#00ffb8]"
                                        strokeWidth={1.5} />
                                    <span className="referente-evento-label">
                                        Referente evento
                                    </span>
                                </div>

                            </div>
                        </CardContent>
                    </Card>
                );
            })}

            <div className="sintesi-container">
                <div className="ore-mese-sintesi">
                    <div className="ore-mese-label">ORE DEL MESE</div>
                    <div className="ore-mese-value-content">
                        <CalendarClock
                            className="h-7 w-7 text-[#00d96f]"
                            /* MARCELLO - icona più leggera */
                            strokeWidth={1}
                        />

                        {/* MARCELLO - ore e minuti separati per gestire valori a 3 cifre */}
                        <div className="ore-mese-value">
                            <span className="ore-mese-ore">
                                {totaleOre.split(":")[0]}
                            </span>
                            <span className="ore-mese-minuti">
                                :{totaleOre.split(":")[1] ?? "00"}
                            </span>
                        </div>
                        {/* MARCELLO - abbreviazione unità ore */}
                        <div className="ore-label">h</div>
                    </div>
                    <div className="dettaglio-mese-sintesi" onClick={() => navigate("/operator/rendicontazione")}>Vai al dettaglio</div>
                </div>
                <div className="prossimi-turni-sintesi">
                    <div className="prossimi-turni-label">PROSSIMI TURNI</div>
                    <div className="prossimi-turni-row">
                        {numeroTurniFuturi > 0 ? (
                            <>
                                <div className="prossimi-turni-next-content">
                                    <div className="prossimi-turni-mese-value">
                                        {prossimoTurno?.mese}
                                    </div>
                                    <div className="prossimi-turni-giorno-value">
                                        {prossimoTurno?.giorno}
                                    </div>
                                </div>

                                <div className="prossimi-turni-value-content">
                                    <div>
                                        {numeroTurniFuturi}{" "}
                                        {numeroTurniFuturi === 1 ? "turno" : "turni"}
                                    </div>
                                    <div>
                                        {numeroTurniFuturi === 1 ? "previsto" : "previsti"}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="prossimi-turni-nessuno">
                                Nessun turno previsto
                            </div>
                        )}
                    </div>

                    <div className="dettaglio-turni-sintesi" onClick={() => navigate("/operator/turniFuturi")}>Vedi tutti</div>
                </div>
            </div>

            <NotificaRitardoTimbraturaDialog
                open={notificaRitardoTimbraturaDialogOpen}
                setOpen={setNotificaRitardoTimbraturaDialogOpen}
                onSubmit={handleSubmitRitardo}
                checkIn={checkInValue}
            />

            <ListaColleghiDialog
                open={openListaColleghiDialog}
                setOpen={setOpenListaColleghiDialog}
                listaColleghi={turnoSelezionato?.listaColleghi ?? []}
            />

            <ReferenteEventoDialog
                open={openReferenteEventoDialog}
                setOpen={setOpenReferenteEventoDialog}
                turnoSelezionato={turnoSelezionato}
            />

        </section>
    )
}

export default TaskOperatore
