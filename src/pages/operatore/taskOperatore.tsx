import { useEffect, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import {
    CalendarDays,
    CalendarClock,
    ChevronRight,
    Clock3,
    ContactRound,
    Crown,
    LogIn,
    LogOut,
    MapPin,
    UsersRound
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { NotificaRitardoTimbraturaDialog } from "./dialog/notificaRitardoTimbraturaDialog";
import { ReferenteEventoDialog } from "./dialog/referenteEventoDialog";
import { ColleghiTurnoDialog } from "./dialog/colleghiTurnoDialog";

type OrarioTurni = {
    oraInizio: string;
    oraFine: string;
    notaTurno: string;
    tipologiaTurno: string;
    tipoMansione: string;
    teamLeader: boolean;
    orePausa?: string | number;
};

type ListaColleghi = {
    nome: string;
    cognome: string;
    telefono: string;
    oraInizio: string;
    oraFine: string;
    teamLeader: boolean;
    gpg: boolean;
};

type TurnoEvento = {
    idTurno: number;
    titoloEvento: string;
    localitaEvento: string;
    nomeCognomeReferente: string;
    telefonoReferente: string;
    dataTurno: string;
    orarioTurni: OrarioTurni[];
    listaColleghi: ListaColleghi[];
};

type CheckInCheckOut = {
    idOperatore: number;
    checkIn: boolean;
    latitudine: number;
    longitudine: number;
    motivazione: string;
};

type RendicontazioneTurno = {
    oraInizioDefinitivo: string;
    oraFineDefinitivo: string;
    orePausaDefinitivo: string | number;
};

type ProssimoTurno = {
    dataTurno: string;
};

const TaskOperatore = () => {
    const idOperatore = localStorage.getItem("idOperatore");
    const navigate = useNavigate();

    const [turniGiornalieri, setTurniGiornalieri] = useState<TurnoEvento[]>([]);
    const [loading, setLoading] = useState(false);
    const [statoCheck, setStatoCheck] = useState<boolean>(true);
    const [oreMese, setOreMese] = useState(0);
    const [prossimiTurni, setProssimiTurni] = useState<ProssimoTurno[]>([]);
    const [notificaRitardoTimbraturaDialogOpen, setNotificaRitardoTimbraturaDialogOpen] = useState(false);
    const [referenteEventoDialogOpen, setReferenteEventoDialogOpen] = useState(false);
    const [colleghiTurnoDialogOpen, setColleghiTurnoDialogOpen] = useState(false);
    const [checkInValue, setCheckInValue] = useState<boolean>(true);
    const [turnoSelezionato, setTurnoSelezionato] = useState<TurnoEvento | null>(null);

    const authHeaders = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        accept: "application/json"
    };

    useEffect(() => {
        caricaTurniAssegnati();
        checkInCheckOutControl();
        caricaRiepilogo();
    }, []);

    const caricaTurniAssegnati = async () => {
        const resp = await fetch(ezystaffBEUrl + `turni/turniGiornalieri/${idOperatore}`, {
            headers: authHeaders,
            credentials: "include"
        });
        const data = await resp.json();
        setTurniGiornalieri(Array.isArray(data) ? data : []);
    };

    const caricaRiepilogo = async () => {
        try {
            const [rendResp, futuriResp] = await Promise.all([
                fetch(ezystaffBEUrl + `payroll/rendicontazione/${idOperatore}`, {
                    headers: authHeaders,
                    credentials: "include"
                }),
                fetch(ezystaffBEUrl + `turni/turniFuturi/${idOperatore}`, {
                    headers: authHeaders,
                    credentials: "include"
                })
            ]);

            if (rendResp.ok) {
                const rendicontazione: RendicontazioneTurno[] = await rendResp.json();
                const totale = (Array.isArray(rendicontazione) ? rendicontazione : []).reduce((sum, turno) => {
                    const [h1 = 0, m1 = 0] = String(turno.oraInizioDefinitivo || "0:0").split(":").map(Number);
                    const [h2 = 0, m2 = 0] = String(turno.oraFineDefinitivo || "0:0").split(":").map(Number);
                    let minuti = h2 * 60 + m2 - (h1 * 60 + m1);
                    if (minuti < 0) minuti += 24 * 60;
                    minuti -= Number(turno.orePausaDefinitivo || 0) * 60;
                    return sum + Math.max(0, minuti / 60);
                }, 0);
                setOreMese(Math.round(totale * 10) / 10);
            }

            if (futuriResp.ok) {
                const futuri = await futuriResp.json();
                setProssimiTurni(Array.isArray(futuri) ? futuri : []);
            }
        } catch (error) {
            console.error("Errore caricamento riepilogo operatore", error);
        }
    };

    const checkInCheckOutControl = async () => {
        const resp = await fetch(ezystaffBEUrl + `operatori/statoCheck/${idOperatore}`, {
            headers: authHeaders,
            credentials: "include"
        });
        const data = await resp.json();
        setStatoCheck(!data.statoCheck);
    };

    const creaCheckInCheckOut = async (checkInCheckOut: CheckInCheckOut) => {
        const resp = await fetch(ezystaffBEUrl + `operatori/checkInCheckOut/${idOperatore}`, {
            headers: authHeaders,
            method: "POST",
            credentials: "include",
            body: JSON.stringify(checkInCheckOut)
        });
        const data = await resp.json();

        if (!resp.ok) {
            return { success: false, message: data.message };
        }
    };

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
            headers: authHeaders,
            method: "GET",
            credentials: "include"
        });
        return resp.json();
    };

    const handleClick = async (checkIn: boolean, motivazione?: string) => {
        if (!navigator.geolocation) {
            alert("Geolocalizzazione non supportata");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const result = await creaCheckInCheckOut({
                        idOperatore: Number(idOperatore),
                        checkIn,
                        latitudine: position.coords.latitude,
                        longitudine: position.coords.longitude,
                        motivazione: motivazione ?? ""
                    });

                    if (result && !result.success) {
                        alert(result.message);
                        return;
                    }

                    alert(`${checkIn ? "Effettuato Check In" : "Effettuato Check Out"}`);
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
                alert(error.message);
            },
            { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
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

    const formatDateShort = () => {
        const today = new Date();
        const weekday = today.toLocaleDateString("it-IT", { weekday: "long" });
        const date = today.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
        return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)}, ${date}`;
    };

    const formatTimeShort = () => new Date().toLocaleTimeString("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });

    const [oraCorrente, setOraCorrente] = useState(formatTimeShort());

    useEffect(() => {
        const timer = setInterval(() => setOraCorrente(formatTimeShort()), 1000);
        return () => clearInterval(timer);
    }, []);

    const minutiDaOrario = (value: string) => {
        const [h = 0, m = 0] = String(value || "0:0").split(":").map(Number);
        return h * 60 + m;
    };

    const statoTurno = (orario: OrarioTurni) => {
        const now = new Date();
        const corrente = now.getHours() * 60 + now.getMinutes();
        const inizio = minutiDaOrario(orario.oraInizio);
        let fine = minutiDaOrario(orario.oraFine);

        if (fine < inizio) {
            fine += 24 * 60;
            const correnteCorretto = corrente < inizio ? corrente + 24 * 60 : corrente;
            return correnteCorretto >= inizio && correnteCorretto <= fine ? "in-corso" : correnteCorretto < inizio ? "prossimo" : "terminato";
        }

        if (corrente >= inizio && corrente <= fine) return "in-corso";
        if (corrente < inizio) return "prossimo";
        return "terminato";
    };

    const formatNextDate = (input?: string) => {
        if (!input) return { giorno: "--", mese: "---" };
        const parts = input.includes("/") ? input.split("/") : [];
        const date = parts.length === 3
            ? new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]))
            : new Date(input);
        if (Number.isNaN(date.getTime())) return { giorno: "--", mese: "---" };
        return {
            giorno: String(date.getDate()).padStart(2, "0"),
            mese: date.toLocaleDateString("it-IT", { month: "short" }).replace(".", "")
        };
    };

    const prossimaData = formatNextDate(prossimiTurni[0]?.dataTurno);

    return (
        <section className="min-h-screen bg-[#021520] px-4 pb-12 pt-4 font-['Mulish'] text-white">
            <div className="mx-auto w-full max-w-[390px]">
                <h1 className="mb-6 px-2 text-[24px] font-black leading-none text-[#08f0bd]">
                    Turni di oggi
                </h1>

                <div className="mb-[22px] rounded-[12px] border border-[#0b8f73] bg-[#0d4a45] px-[28px] pb-[13px] pt-[15px]">
                    <div className="flex items-center justify-center gap-2 text-[15px] text-[#d6e4e8]">
                        <CalendarDays className="h-4 w-4 text-[#b9d4d5]" strokeWidth={1.8} />
                        <span>{formatDateShort()}</span>
                    </div>

                    {turniGiornalieri.length > 0 ? (
                        <div className="mt-2 text-center text-[#08f0bd]">
                            <span className="text-[40px] font-black leading-none tracking-[-1.5px]">
                                {oraCorrente.slice(0, 5)}
                            </span>
                            <span className="ml-0.5 align-baseline text-[20px] font-black">
                                {oraCorrente.slice(6)}
                            </span>
                        </div>
                    ) : null}

                    <Button
                        onClick={() => turniGiornalieri.length > 0
                            ? effettuaCheckInCheckOut(statoCheck)
                            : navigate("/operator/turniFuturi")}
                        disabled={loading}
                        className={`mt-[18px] h-[57px] w-full rounded-[13px] border-0 text-[17px] font-black text-[#001714] shadow-none ${statoCheck
                            ? "bg-[#08f0bd] hover:bg-[#08f0bd]"
                            : "bg-[#ff6257] text-white hover:bg-[#ff6257]"}`}
                    >
                        {turniGiornalieri.length === 0 ? (
                            <>Vedi i prossimi turni <ChevronRight className="ml-1 h-5 w-5" /></>
                        ) : loading ? (
                            "Localizzazione in corso..."
                        ) : statoCheck ? (
                            <><LogIn className="mr-2 h-5 w-5" strokeWidth={2.2} /> CHECK-IN</>
                        ) : (
                            <><LogOut className="mr-2 h-5 w-5" strokeWidth={2.2} /> CHECK-OUT</>
                        )}
                    </Button>
                </div>

                <div className="space-y-8 px-1">
                    {turniGiornalieri.flatMap((turno) =>
                        turno.orarioTurni.map((orario, index) => {
                            const stato = statoTurno(orario);
                            const prossimo = stato === "prossimo";
                            const accent = prossimo ? "#5792ff" : "#08f0bd";
                            const headerBg = prossimo ? "#344d72" : "#0d4a45";
                            const pausa = orario.orePausa ? `${orario.orePausa} ${Number(orario.orePausa) === 1 ? "ora" : "min"}` : null;

                            return (
                                <article
                                    key={`${turno.idTurno}-${index}`}
                                    className="overflow-hidden rounded-[16px] bg-[#1a2f41] shadow-[0_3px_12px_rgba(0,0,0,0.18)]"
                                    style={{ borderTop: `5px solid ${accent}` }}
                                >
                                    <div className="grid grid-cols-[1fr_78px]" style={{ backgroundColor: headerBg }}>
                                        <div className="px-[14px] pb-[8px] pt-[9px]">
                                            <div
                                                className="mb-1 inline-flex rounded-[5px] border px-[7px] py-[2px] text-[10px] font-bold leading-none"
                                                style={{ borderColor: accent, color: prossimo ? "#d9e7ff" : accent }}
                                            >
                                                {prossimo ? "PROSSIMO TURNO" : stato === "in-corso" ? "TURNO IN CORSO" : "TURNO"}
                                            </div>
                                            <div className="text-[22px] font-black leading-none tracking-[-0.3px] text-white">
                                                {orario.oraInizio} - {orario.oraFine}
                                            </div>
                                        </div>

                                        <div className="border-l border-white/10 px-2 py-[9px] text-center text-[#d2dde1]">
                                            <div className="flex items-center justify-center gap-1 text-[11px]">
                                                <Clock3 className="h-3.5 w-3.5" strokeWidth={1.6} /> Pausa
                                            </div>
                                            <div className="mt-1 text-[13px] font-bold">{pausa || "—"}</div>
                                        </div>
                                    </div>

                                    <div className="px-[18px] pb-[15px] pt-[10px]">
                                        <div className="text-[17px] font-black" style={{ color: prossimo ? "#dbe5f8" : "#08f0bd" }}>
                                            {turno.titoloEvento}
                                        </div>

                                        <div className="mt-2 flex items-start gap-2 text-[13px] text-[#d0dce4]">
                                            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b8d8e8]" strokeWidth={2} />
                                            <span className="underline decoration-[#8cb4bd] underline-offset-2">
                                                {turno.localitaEvento}
                                            </span>
                                        </div>

                                        <div className="mt-4 space-y-1 text-[13px] text-[#d0d7df]">
                                            <div>Tipo evento: <span className="text-white">{orario.tipologiaTurno || "—"}</span></div>
                                            <div>Mansione: <span className="text-white">{orario.tipoMansione || "—"}</span></div>
                                        </div>

                                        {orario.teamLeader ? (
                                            <div className="mt-3 flex items-center gap-1.5 text-[12px] font-bold text-[#ffc23e]">
                                                <Crown className="h-4 w-4" /> Team leader
                                            </div>
                                        ) : null}

                                        {orario.notaTurno ? (
                                            <div className="mt-4 max-w-[252px] rounded-[11px] border border-[#a96808] bg-[#342616] px-[13px] py-[11px]">
                                                <div className="text-[12px] font-black text-[#ffbd3b]">NOTE OPERATIVE</div>
                                                <div className="mt-1 text-[13px] leading-[1.35] text-[#e8e3dc]">{orario.notaTurno}</div>
                                            </div>
                                        ) : null}
                                    </div>

                                    <div className="grid grid-cols-2 border-t border-[#365064] bg-[#183044]">
                                        <button
                                            type="button"
                                            onClick={() => apriColleghiTurno(turno)}
                                            className="flex h-[43px] items-center justify-center gap-2 border-r border-[#496175] text-[14px] font-medium text-[#08f0bd]"
                                        >
                                            <UsersRound className="h-[18px] w-[18px]" strokeWidth={1.8} /> Colleghi
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => apriReferenteEvento(turno)}
                                            className="flex h-[43px] items-center justify-center gap-2 text-[14px] font-medium text-[#08f0bd]"
                                        >
                                            <ContactRound className="h-[18px] w-[18px]" strokeWidth={1.8} /> Referente evento
                                        </button>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>

                <div className="mt-[38px] grid grid-cols-2 gap-3 px-1">
                    <button
                        type="button"
                        onClick={() => navigate("/operator/rendicontazione")}
                        className="rounded-[15px] border border-[#08d795] bg-[#08271f] px-[14px] py-[16px] text-left"
                    >
                        <div className="text-[14px] font-black text-[#08f0bd]">ORE DEL MESE</div>
                        <div className="mt-3 flex items-end gap-2 text-[#08f0bd]">
                            <CalendarClock className="h-9 w-9" strokeWidth={1.4} />
                            <span className="text-[31px] font-black leading-none">{String(oreMese).replace(".", ",")}</span>
                            <span className="pb-1 text-[10px] font-bold">ore</span>
                        </div>
                        <div className="mt-5 flex h-[27px] items-center justify-between rounded-[6px] border border-[#08f0bd] px-2 text-[11px] font-bold text-[#08f0bd]">
                            Vai al dettaglio <ChevronRight className="h-4 w-4" />
                        </div>
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate("/operator/turniFuturi")}
                        className="rounded-[15px] border border-[#c55cff] bg-[#241836] px-[14px] py-[16px] text-left"
                    >
                        <div className="text-[14px] font-black text-[#d06bff]">PROSSIMI TURNI</div>
                        <div className="mt-3 flex items-center gap-3 text-white">
                            <div className="rounded-[8px] border border-[#d06bff] px-3 py-1 text-center">
                                <div className="text-[11px] leading-none capitalize text-[#d5d0dc]">{prossimaData.mese}</div>
                                <div className="text-[22px] font-black leading-tight">{prossimaData.giorno}</div>
                            </div>
                            <div className="text-[13px] leading-[1.35] text-[#c7bfce]">
                                {prossimiTurni.length} {prossimiTurni.length === 1 ? "turno" : "turni"}<br />previsti
                            </div>
                        </div>
                        <div className="mt-5 flex h-[27px] items-center justify-between rounded-[6px] border border-[#d06bff] px-2 text-[11px] font-bold text-[#d06bff]">
                            Vedi tutti <ChevronRight className="h-4 w-4" />
                        </div>
                    </button>
                </div>
            </div>

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
    );
};

export default TaskOperatore;
