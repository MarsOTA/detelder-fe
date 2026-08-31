import React, { useEffect, useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { ContestazioneTimbraturaDialog } from "./dialog/contestazioneTimbraturaDialog";
import { CalendarDays, Check, Clock3, Info, MapPin, Pencil, TimerReset } from "lucide-react";

type TurnoOperatore = {
    idPayroll: number
    idTurno: number
    stato: string
    dataTurno: string
    oraInizioDefinitivo: string
    oraFineDefinitivo: string
    orePausaDefinitivo: string
    ragioneSociale: string
    nomeBrand: string
    indirizzoEvento: string
}

const Rendicontazione = () => {
    const idOperatore = localStorage.getItem('idOperatore');
    const [listaTurniMensili, setListaTurniMensili] = useState<TurnoOperatore[]>([]);
    const [contestazioneDialogOpen, setContestazioneDialogOpen] = useState(false);
    const [approvazioneInCorso, setApprovazioneInCorso] = useState<number | null>(null);
    const [turnoSelezionato, setTurnoSelezionato] = useState<{
        idPayroll: number;
        idTurno: number;
    } | null>(null);

    useEffect(() => {
        caricaRendicontazione();
    }, [])

    const oggi = new Date();

    const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

    const meseCorrente = capitalize(
        new Intl.DateTimeFormat("it-IT", { month: "long" }).format(oggi)
    );

    const mesePrecedente = capitalize(
        new Intl.DateTimeFormat("it-IT", { month: "long" }).format(
            new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1)
        )
    );

    const caricaRendicontazione = async () => {
        const resp = await fetch(ezystaffBEUrl + `payroll/rendicontazione/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        setListaTurniMensili(data);
    }

    const approvaTurno = async (turno: TurnoOperatore) => {
        try {
            setApprovazioneInCorso(turno.idPayroll);
            const resp = await fetch(ezystaffBEUrl + `payroll/approvaRendicontazione/${turno.idPayroll}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                },
                method: "PATCH",
                credentials: 'include'
            });

            if (!resp.ok) {
                throw new Error('Impossibile approvare il turno');
            }

            await caricaRendicontazione();
        } catch (error) {
            console.error(error);
            alert('Non è stato possibile approvare il turno. Riprova.');
        } finally {
            setApprovazioneInCorso(null);
        }
    }

    const handleSubmitContestazione = async (
        e: React.FormEvent,
        motivazione: string,
        idPayroll?: number,
        idTurno?: number
    ) => {
        e.preventDefault();

        const body = { motivazione, idTurno };

        const resp = await fetch(ezystaffBEUrl + `payroll/aggiornaRendicontazione/${idPayroll}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include',
            body: JSON.stringify(body)
        });

        if (!resp.ok) {
            alert('Non è stato possibile inviare la modifica. Riprova.');
            return;
        }

        setContestazioneDialogOpen(false);
        caricaRendicontazione();
    };

    const richiestaModificaTimbratura = (turno: TurnoOperatore) => {
        setTurnoSelezionato({
            idPayroll: turno.idPayroll,
            idTurno: turno.idTurno,
        });
        setContestazioneDialogOpen(true);
    }

    const totaleOre = useMemo(() => {
        const totalMinutes = listaTurniMensili.reduce((totale, turno) => {
            if (!turno.oraInizioDefinitivo || !turno.oraFineDefinitivo) return totale;
            const [h1, m1] = turno.oraInizioDefinitivo.split(':').map(Number);
            const [h2, m2] = turno.oraFineDefinitivo.split(':').map(Number);
            let start = h1 * 60 + m1;
            let end = h2 * 60 + m2;
            if (end < start) end += 24 * 60;
            const pausa = Number(turno.orePausaDefinitivo || 0) * 60;
            return totale + Math.max(0, end - start - pausa);
        }, 0);
        return (totalMinutes / 60).toLocaleString('it-IT', { maximumFractionDigits: 1 });
    }, [listaTurniMensili]);

    return (
        <section className="min-h-screen bg-[#031522] px-4 pb-12 pt-2 text-white sm:px-5">
            <div className="mx-auto w-full max-w-[430px]">
                <h1 className="pb-4 text-[26px] font-black tracking-[-0.02em] text-[#08f0bd]">
                    Rendicontazione
                </h1>

                <Tabs defaultValue="approvare" className="w-full">
                    <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl border border-[#214253] bg-[#0b2634] p-1">
                        <TabsTrigger
                            value="approvare"
                            className="rounded-lg text-[#90a9b7] data-[state=active]:bg-[#08e8b6] data-[state=active]:font-bold data-[state=active]:text-[#022016]"
                        >
                            Da approvare
                        </TabsTrigger>
                        <TabsTrigger
                            value="archivio"
                            className="rounded-lg text-[#90a9b7] data-[state=active]:bg-[#44629b] data-[state=active]:font-bold data-[state=active]:text-white"
                        >
                            Archivio
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="approvare" className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#08dba8]/60 bg-[#0c3a37] p-4">
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4c7c2]">Totale ore</div>
                                <div className="mt-1 flex items-end gap-1 text-[#08efbd]">
                                    <span className="text-[32px] font-black leading-none">{totaleOre}</span>
                                    <span className="pb-1 text-sm font-bold">h</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a4c7c2]">Giorni lavorati</div>
                                <div className="mt-1 flex items-end justify-end gap-1 text-[#08efbd]">
                                    <span className="text-[32px] font-black leading-none">{listaTurniMensili.length}</span>
                                    <span className="pb-1 text-sm font-bold">giorni</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 rounded-2xl border border-[#214253] bg-[#071f2c] p-4 text-[13px] leading-5 text-[#c9d7de]">
                            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#315d95] text-white">
                                <Info className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="font-bold text-[#08efbd]">Periodo di approvazione</div>
                                Hai tempo fino al 5 {meseCorrente} {oggi.getFullYear()} per approvare o modificare i turni di {mesePrecedente}. Dopo tale data verranno approvati automaticamente.
                            </div>
                        </div>

                        {listaTurniMensili.map((turno) => {
                            const approvato = turno.stato === 'APPROVATO';
                            const modificato = turno.stato === 'CONTESTATO';

                            return (
                                <article
                                    key={turno.idPayroll}
                                    className={`rounded-2xl border p-4 shadow-[0_16px_40px_rgba(0,0,0,0.18)] ${
                                        approvato
                                            ? 'border-[#08dba8]/70 bg-[#0a3834]'
                                            : modificato
                                                ? 'border-[#f2a317]/60 bg-[#172728]'
                                                : 'border-[#315467] bg-[#102637]'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="inline-flex items-center gap-1.5 rounded-full border border-[#08dba8]/60 bg-[#08352f] px-2.5 py-1 text-[11px] font-semibold text-[#08efbd]">
                                            <CalendarDays className="h-3.5 w-3.5" />
                                            {turno.dataTurno}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[18px] font-black text-[#08efbd]">
                                                {turno.oraInizioDefinitivo} - {turno.oraFineDefinitivo}
                                            </div>
                                            <div className="mt-0.5 flex items-center justify-end gap-1 text-[12px] text-[#a9bdc8]">
                                                <TimerReset className="h-3.5 w-3.5" />
                                                Pausa {turno.orePausaDefinitivo} h
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-3 text-[19px] font-bold leading-tight text-[#f1f5f7]">
                                        {turno.ragioneSociale} — {turno.nomeBrand}
                                    </div>
                                    <div className="mt-2 flex items-start gap-2 text-[13px] text-[#c0d0d8]">
                                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#9bc6d3]" />
                                        <span>{turno.indirizzoEvento}</span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-[12px] text-[#829ba8]">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        Orario registrato per la rendicontazione
                                    </div>

                                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                                        {approvato ? (
                                            <div className="col-span-2 flex h-10 items-center justify-center gap-2 rounded-xl border border-[#08dba8]/60 bg-[#073b31] text-[13px] font-bold text-[#08efbd]">
                                                <Check className="h-4 w-4" /> Approvato
                                            </div>
                                        ) : (
                                            <>
                                                <Button
                                                    type="button"
                                                    disabled={approvazioneInCorso === turno.idPayroll || modificato}
                                                    onClick={() => approvaTurno(turno)}
                                                    className="h-10 rounded-xl bg-[#12df63] text-[13px] font-black text-[#02170b] hover:bg-[#20ee72] disabled:opacity-50"
                                                >
                                                    <Check className="mr-1.5 h-4 w-4" />
                                                    {approvazioneInCorso === turno.idPayroll ? 'Attendi…' : 'Approva'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    onClick={() => richiestaModificaTimbratura(turno)}
                                                    className="h-10 rounded-xl border border-[#e69b18] bg-[#3d2b1d] text-[13px] font-black text-[#ffb529] hover:bg-[#493421]"
                                                >
                                                    <Pencil className="mr-1.5 h-4 w-4" />
                                                    {modificato ? 'Modificato' : 'Modifica'}
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </article>
                            );
                        })}

                        {listaTurniMensili.length === 0 && (
                            <div className="rounded-2xl border border-[#214253] bg-[#071f2c] px-4 py-8 text-center text-sm text-[#8fa8b5]">
                                Nessun turno da approvare nel periodo corrente.
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="archivio" className="mt-4">
                        <div className="rounded-2xl border border-[#31506b] bg-[#102238] p-5 text-sm text-[#b8c8d2]">
                            <div className="mb-2 font-bold text-[#c56cff]">Archivio rendicontazioni</div>
                            Qui verranno visualizzati i mesi già chiusi con il dettaglio dei giorni approvati.
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            <ContestazioneTimbraturaDialog
                open={contestazioneDialogOpen}
                setOpen={setContestazioneDialogOpen}
                onSubmit={handleSubmitContestazione}
                idPayroll={turnoSelezionato?.idPayroll}
                idTurno={turnoSelezionato?.idTurno}
            />
        </section>
    );
};

export default Rendicontazione;