import { ezystaffBEUrl } from "@/utils/baseUrl";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, NotebookPen } from "lucide-react";

type OrarioTurni = {
    oraInizio: string
    oraFine: string
    notaTurno: string
}

type TurnoEvento = {
    idTurno: number
    titoloEvento: string
    localitaEvento: string
    nomeCognomeReferente: string
    telefonoReferente: string
    tipologiaTurno: string
    tipoMansione: string
    dataTurno: string;
    orarioTurni: OrarioTurni[];
}

const TurniFuturi = () => {
    const idOperatore = localStorage.getItem('idOperatore');
    const [turniFuturi, setTurniFuturi] = useState<TurnoEvento[]>([]);

    useEffect(() => {
        caricaTurniAssegnati();
    }, [])

    const caricaTurniAssegnati = async () => {
        const resp = await fetch(ezystaffBEUrl + `turni/turniFuturi/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        setTurniFuturi(data);
    }

    const parseDate = (input: string) => {
        const [day, month, year] = input.split("/");
        if (!day || !month || !year) return null;
        const date = new Date(`${year}-${month}-${day}`);
        return isNaN(date.getTime()) ? null : date;
    };

    const formatDay = (input: string) => parseDate(input)?.toLocaleDateString("it-IT", { day: "2-digit" }) ?? '--';
    const formatMonth = (input: string) => parseDate(input)?.toLocaleDateString("it-IT", { month: "short" }).replace('.', '').toUpperCase() ?? '---';
    const formatWeekday = (input: string) => parseDate(input)?.toLocaleDateString("it-IT", { weekday: "long" }) ?? '';

    return (
        <section className="min-h-screen bg-[#031522] px-4 pb-14 pt-2 text-white sm:px-5">
            <div className="mx-auto w-full max-w-[430px]">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-[26px] font-black tracking-[-0.02em] text-[#08f0bd]">Prossimi turni</h1>
                    <span className="rounded-full bg-[#08293a] px-3 py-1 text-[11px] font-semibold text-[#6b8cff]">
                        {turniFuturi.length} previsti
                    </span>
                </div>

                <div className="space-y-4">
                    {turniFuturi.map((turnoFuturo, cardIndex) => (
                        <article
                            key={turnoFuturo.idTurno}
                            className={`overflow-hidden rounded-2xl border bg-[#102537] shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${cardIndex === 0 ? 'border-[#5a8dff]' : 'border-[#315467]'}`}
                        >
                            <div className={`flex items-center gap-4 border-b px-4 py-3 ${cardIndex === 0 ? 'border-[#5a8dff]/40 bg-[#2b4266]' : 'border-[#28485a] bg-[#123142]'}`}>
                                <div className={`flex h-[72px] w-[72px] shrink-0 flex-col items-center justify-center rounded-xl ${cardIndex === 0 ? 'bg-[#13274a] text-[#8fb2ff]' : 'bg-[#073a31] text-[#08efbd]'}`}>
                                    <span className="text-[31px] font-black leading-none">{formatDay(turnoFuturo.dataTurno)}</span>
                                    <span className="mt-1 text-[12px] font-black">{formatMonth(turnoFuturo.dataTurno)}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#9eb5c1]">{formatWeekday(turnoFuturo.dataTurno)}</div>
                                    <div className="mt-1 text-[20px] font-black leading-tight text-[#eef4f7]">{turnoFuturo.titoloEvento}</div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {turnoFuturo.tipologiaTurno && (
                                            <span className="rounded-full bg-[#47638f] px-2.5 py-1 text-[11px] font-semibold text-white">{turnoFuturo.tipologiaTurno}</span>
                                        )}
                                        {turnoFuturo.tipoMansione && (
                                            <span className="rounded-full bg-[#5b3475] px-2.5 py-1 text-[11px] font-semibold text-white">{turnoFuturo.tipoMansione}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3 p-4">
                                <div className="flex items-start gap-2 text-[13px] text-[#c3d1d9]">
                                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9fc4d1]" />
                                    <span>{turnoFuturo.localitaEvento}</span>
                                </div>

                                {turnoFuturo.orarioTurni.map((orarioTurno, index) => (
                                    <div key={index} className="rounded-xl border border-[#29485b] bg-[#0b202e] p-3.5">
                                        <div className="flex items-center gap-2 text-[#eaf2f5]">
                                            <Clock3 className="h-4 w-4 text-[#08efbd]" />
                                            <span className="text-[16px] font-black">{orarioTurno.oraInizio} - {orarioTurno.oraFine}</span>
                                        </div>

                                        {orarioTurno.notaTurno && (
                                            <div className="mt-3 rounded-xl border border-[#a36712] bg-[#3b2a1c] p-3">
                                                <div className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.04em] text-[#ffb128]">
                                                    <NotebookPen className="h-4 w-4" /> Nota operativa
                                                </div>
                                                <div className="text-[12px] leading-5 text-[#efe2d3]">{orarioTurno.notaTurno}</div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </article>
                    ))}

                    {turniFuturi.length === 0 && (
                        <div className="rounded-2xl border border-[#315467] bg-[#0b202e] px-4 py-10 text-center">
                            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-[#557b90]" />
                            <div className="font-bold text-[#d2dde2]">Nessun turno futuro</div>
                            <div className="mt-1 text-sm text-[#7892a0]">I prossimi impegni compariranno qui.</div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

export default TurniFuturi;