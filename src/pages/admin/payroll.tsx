import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { CirclePause } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";

type FiltriRicerca = {
    statoElaborazione?: string;
    dataInizio: Date | undefined;
    dataFine: Date | undefined;
}

type CheckInCheckOut = {
    dataInserimentoCheckIn: Date | undefined
    dataInserimentoCheckOut: Date | undefined
    statoTimbratura: string
}

type TurnoCompleto = {
    idTurno: number
    dataTurno: Date | undefined
    oraInizio: string
    oraInizioDefinitivo: string
    oraFine: string
    oraFineDefinitivo: string
    nomeEvento: string
    nomeBrand: string
    ragioneSociale: string
    operatore: string
    orePausa: number | undefined
    orePausaDefinitiva: number | undefined
    via: string
    statoPayroll: string
    motivazioneRitardo: string
    motivazioneContestazione: string
    checkInCheckOut: CheckInCheckOut[]
    statoTurno: string
    orePreviste: number | undefined
    oreLavorateTurno: number | undefined
    delta: string | undefined
}

type PayrollForm = {
    idTurno: number
    oraInizioDefinitivo: string
    oraFineDefinitivo: string
    orePausaDefinitivo: number | undefined
    stato: string | undefined
}

const payroll = () => {
    const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();
    const [turni, setTurni] = useState<TurnoCompleto[]>([]);

    useEffect(() => {
        const filtriRicerca: FiltriRicerca = {
            dataInizio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            dataFine: new Date(),
        }
        setFiltriRicerca(filtriRicerca);
        caricaPayroll(filtriRicerca);
    }, []);

    const setDataInizio = (date: Date | undefined) => {
        setFiltriRicerca((prev) => {
            if (!prev) return undefined;
            return { ...prev, dataInizio: date };
        });
    };

    const setDataFine = (date: Date | undefined) => {
        setFiltriRicerca((prev) => {
            if (!prev) return undefined;
            return { ...prev, dataFine: date };
        });
    };

    const salvaPayroll = async (idTurno: number) => {
        const turno = turni.find(t => t.idTurno === idTurno);
        if (!turno) {
            console.error("Turno non trovato");
            return;
        }

        const payrollForm: PayrollForm = {
            idTurno: turno.idTurno,
            oraInizioDefinitivo: turno.oraInizioDefinitivo,
            oraFineDefinitivo: turno.oraFineDefinitivo,
            orePausaDefinitivo: turno.orePausaDefinitiva,
            stato: 'ELABORATO'
        };

        const resp = await fetch(ezystaffBEUrl + 'payroll', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(payrollForm)
        });
        await resp.json();
        if (filtriRicerca) caricaPayroll(filtriRicerca);
    }

    const eliminaPayroll = async (idTurno: number) => {
        const resp = await fetch(ezystaffBEUrl + `payroll/${idTurno}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "DELETE",
            credentials: 'include'
        });
        await resp.json();
        if (filtriRicerca) caricaPayroll(filtriRicerca);
    }

    const modificaPayroll = async (idTurno: number) => {
        const turno = turni.find(t => t.idTurno === idTurno);
        if (!turno) {
            console.error("Turno non trovato");
            return;
        }

        const body = {
            oraInizioDefinitivo: turno.oraInizioDefinitivo,
            oraFineDefinitivo: turno.oraFineDefinitivo,
            orePausaDefinitivo: turno.orePausaDefinitiva,
            stato: 'MODIFICATO'
        };

        const resp = await fetch(ezystaffBEUrl + `payroll/${turno.idTurno}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include',
            body: JSON.stringify(body)
        });
        await resp.json();
        if (filtriRicerca) caricaPayroll(filtriRicerca);
    }

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const caricaPayroll = async (filtri: FiltriRicerca) => {
        const dataInizioStr = formatDateToYYYYMMDD(filtri.dataInizio);
        const dataFineStr = formatDateToYYYYMMDD(filtri.dataFine);
        const statoElaborazione = filtri.statoElaborazione?.trim();
        const queryParams = new URLSearchParams();

        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
        if (dataFineStr) queryParams.append("dataFine", dataFineStr);
        if (statoElaborazione) queryParams.append("statoElaborazione", statoElaborazione);

        const url = `${ezystaffBEUrl}payroll?${queryParams.toString()}`;
        const resp = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        setTurni(data);
    }

    const calcolaTotaleOre = (oraInizio: string, oraFine: string, oraPausa: number = 0): string => {
        if (!oraInizio || !oraFine) return "00:00";
        const [h1, m1] = oraInizio.split(":").map(Number);
        const [h2, m2] = oraFine.split(":").map(Number);
        const inizio = h1 * 60 + m1;
        let fine = h2 * 60 + m2;
        if (fine < inizio) fine += 24 * 60;
        const minutiLavorati = fine - inizio - (oraPausa * 60);
        const ore = Math.floor(minutiLavorati / 60);
        const minuti = minutiLavorati % 60;
        return [String(ore).padStart(2, "0"), String(minuti).padStart(2, "0")].join(":");
    };

    const formatOreBrevi = (valore: string | number | undefined): string => {
        if (valore === undefined || valore === null || valore === "") return "00:00";
        const parti = String(valore).split(":");
        return parti.length >= 2 ? `${parti[0]}:${parti[1]}` : String(valore);
    };

    const getTotalHours = (records: TurnoCompleto[]): string => {
        let totalMinutes = 0;

        records.forEach((turno) => {
            const valore = turno.oreLavorateTurno;
            if (valore === undefined || valore === null || valore === "") return;

            if (typeof valore === "number") {
                totalMinutes += Math.round(valore * 60);
                return;
            }

            const valoreStringa = String(valore);
            if (valoreStringa.includes(":")) {
                const [ore = 0, minuti = 0] = valoreStringa.split(":").map(Number);
                totalMinutes += (ore * 60) + minuti;
                return;
            }

            const oreDecimali = Number(valoreStringa);
            if (!Number.isNaN(oreDecimali)) {
                totalMinutes += Math.round(oreDecimali * 60);
            }
        });

        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const setOraInizioTurno = (idTurno: number, ora: string) => {
        setTurni((prev) => prev.map((t): TurnoCompleto => t.idTurno === idTurno ? { ...t, oraInizioDefinitivo: ora } : t));
    };

    const setOraFineTurno = (idTurno: number, ora: string) => {
        setTurni((prev) => prev.map((t): TurnoCompleto => t.idTurno === idTurno ? { ...t, oraFineDefinitivo: ora } : t));
    };

    const setNumeroOrePausa = (idTurno: number, numero: number | undefined) => {
        setTurni((prev) => prev.map((t): TurnoCompleto => t.idTurno === idTurno ? { ...t, orePausaDefinitiva: numero } : t));
    };

    const handlePeriodoClick = (periodo: "giorno" | "settimana" | "mese") => {
        const dataFine = new Date();
        const dataInizio = new Date(dataFine);
        switch (periodo) {
            case "giorno": dataInizio.setDate(dataInizio.getDate() - 1); break;
            case "settimana": dataInizio.setDate(dataInizio.getDate() - 7); break;
            case "mese": dataInizio.setMonth(dataInizio.getMonth() - 1); break;
        }
        const filtriRicerca: FiltriRicerca = { dataInizio, dataFine };
        setFiltriRicerca(filtriRicerca);
        caricaPayroll(filtriRicerca);
    };

    const filtraPerStatoElaborazione = (statoElaborazione: string) => {
        if (!filtriRicerca) return;
        const nuoviFiltri: FiltriRicerca = { ...filtriRicerca, statoElaborazione };
        setFiltriRicerca(nuoviFiltri);
        caricaPayroll(nuoviFiltri);
    };

    return (
        <section className="m-6" style={{ fontFamily: "'Mulish', sans-serif" }}>
            <div className="mb-5 flex items-center justify-between gap-6 border-b border-[#e4ebe8] pb-5">
                <div>
                    <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#007a55]">Rendicontazione ore operatori</h1>
                    <p className="mt-1 text-[14px] font-medium text-[#7a7a7a]">Riconcilia le ore lavorate, verifica gli scostamenti e gestisci lo stato di elaborazione dei turni.</p>
                </div>
            </div>

            <div className="flex items-center bg-[#ecf3f1] mb-1">
                <div className="flex items-center bg-[#ecf3f1] p-4 mb-1">
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full rounded-none">
                                    {filtriRicerca?.dataInizio ? filtriRicerca.dataInizio.toLocaleDateString() : "Seleziona data"}
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={filtriRicerca?.dataInizio} onSelect={setDataInizio} locale={it} className="pointer-events-auto" />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full rounded-none">
                                    {filtriRicerca?.dataFine ? filtriRicerca.dataFine.toLocaleDateString() : "Seleziona data"}
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={filtriRicerca?.dataFine} onSelect={setDataFine} locale={it} className="pointer-events-auto" />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Button className="bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer rounded-r-full rounded-l-none -ml-px" onClick={() => filtriRicerca && caricaPayroll(filtriRicerca)}>Filtra</Button>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => handlePeriodoClick("giorno")} className="rounded-[18px] border border-[#007a55] bg-[#f3fffa] text-[#007a55] text-[16px] font-bold hover:bg-[#e6fff5] cursor-pointer">Ieri</Button>
                    <Button onClick={() => handlePeriodoClick("settimana")} className="rounded-[18px] border border-[#007a55] bg-[#f3fffa] text-[#007a55] text-[16px] font-bold hover:bg-[#f3fffa] cursor-pointer">Settimana</Button>
                    <Button onClick={() => handlePeriodoClick("mese")} className="rounded-[18px] border border-[#007a55] bg-[#f3fffa] text-[#007a55] text-[16px] font-bold hover:bg-[#f3fffa] cursor-pointer">Mese</Button>
                    <div className="h-8 w-px bg-[#c4c7c5]" />
                    <Button onClick={() => filtraPerStatoElaborazione("ELABORATO")} className="rounded-full border border-[#9df5c3] bg-[#9df5c3] text-[#002112] text-[13px] font-semibold hover:bg-[#9df5c3] hover:border-[#9df5c3] hover:text-[#002112] cursor-pointer">Elaborati</Button>
                    <Button onClick={() => filtraPerStatoElaborazione("DA_ELABORARE")} className="rounded-full border border-[#fed7aa] bg-[#ffedd5] text-[#c2410c] text-[13px] font-semibold hover:bg-[#ffedd5] hover:border-[#fed7aa] hover:text-[#c2410c] cursor-pointer">Da Elaborare</Button>
                    <Button onClick={() => filtraPerStatoElaborazione("MODIFICATO")} className="rounded-full border border-[#c3cfeb] bg-[#d5e2ff] text-[#4c608b] text-[13px] font-semibold hover:bg-[#d5e2ff] hover:border-[#c3cfeb] hover:text-[#4c608b] cursor-pointer">Modificato</Button>
                    <Button onClick={() => filtraPerStatoElaborazione("CONTESTATO")} className="rounded-full border border-[#ffacac] bg-[#ffd5d5] text-[#ba1a1a] text-[13px] font-semibold hover:bg-[#ffd5d5] hover:border-[#ffacac] hover:text-[#ba1a1a] cursor-pointer">Contestato</Button>
                </div>
                <div className="ml-auto mr-4 whitespace-nowrap rounded-lg bg-white px-4 py-2 text-[16px] font-extrabold text-[#4f796a] shadow-[inset_0_0_0_1px_#e2ebe7]">
                    Totale ore: {getTotalHours(turni)}
                </div>
            </div>

            <div className="border rounded-md bg-white border-r border-r-[#e5e7eb]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] border-r border-r-[#e5e7eb]">NOMINATIVO</TableHead>
                            <TableHead colSpan={2} className="text-center text-[12px] font-bold text-[#3f4942] bg-[rgba(65,101,89,0.2)] border-r border-r-[#e5e7eb]">PREVISTO</TableHead>
                            <TableHead colSpan={2} className="text-center text-[12px] font-bold text-[#3f4942] bg-[rgba(0,80,50,0.2)] border-r border-r-[#e5e7eb]">EFFETTIVO</TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] border-r border-r-[#e5e7eb]">DELTA</TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] border-r border-r-[#e5e7eb]">NOTA</TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] bg-[#e6f4ff] border-r border-r-[#e5e7eb]">DEFINITIVO</TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] bg-[#d0e8fe] border-r border-r-[#e5e7eb]">ORE</TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] border-r border-r-[#e5e7eb]">NOTA</TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942]">STATO</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {turni.map((turno, index) => {
                            const prevTurno = turni[index - 1];
                            const isNewDate = index === 0 || (prevTurno?.dataTurno && turno.dataTurno && format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") !== format(new Date(turno.dataTurno), "yyyy-MM-dd"));
                            const isNewEvento = prevTurno && turno.dataTurno && prevTurno.dataTurno && format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") === format(new Date(turno.dataTurno), "yyyy-MM-dd") && prevTurno.nomeEvento !== turno.nomeEvento;

                            return (
                                <React.Fragment key={index}>
                                    {isNewDate && (
                                        <TableRow>
                                            <TableCell colSpan={11} className="bg-[#007a55] text-white">
                                                <div className="flex justify-between">
                                                    <span className="w-[10%] font-bold">{turno.dataTurno ? format(new Date(turno.dataTurno), "dd/MM/yyyy") : ""}</span>
                                                    <span className="w-[45%] uppercase font-bold">{(turno.nomeEvento && turno.nomeEvento.trim() !== '' ? turno.nomeEvento : `${turno.nomeBrand ?? ''} - ${turno.ragioneSociale ?? ''}`).toUpperCase()}</span>
                                                    <span className="w-[45%] text-right">{turno.via}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    {!isNewDate && isNewEvento && (
                                        <TableRow>
                                            <TableCell colSpan={11} className="bg-[#8f8f8f] text-white">
                                                <div className="flex justify-between">
                                                    <span className="w-[10%] font-bold">{turno.dataTurno ? format(new Date(turno.dataTurno), "dd/MM/yyyy") : ""}</span>
                                                    <span className="w-[45%] uppercase font-bold">{(turno.nomeEvento && turno.nomeEvento.trim() !== '' ? turno.nomeEvento : `${turno.nomeBrand ?? ''} - ${turno.ragioneSociale ?? ''}`).toUpperCase()}</span>
                                                    <span className="w-[45%] text-right">{turno.via}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                    <TableRow className="h-full">
                                        <TableCell className="text-[16px] font-medium text-[#005032]">{turno.operatore}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-center text-[16px] font-normal text-[#3f4942]">
                                                <span>{turno.oraInizio} - {turno.oraFine}</span>
                                                <span className="flex items-center"><CirclePause className="mr-1 h-4 w-4" />{turno.orePausa}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="bg-[rgba(65,101,89,0.2)] p-0"><div className="h-full w-full flex items-center justify-center px-2 text-[16px] font-bold text-[#191c1d]">{turno.orePreviste} h</div></TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-[16px] font-normal text-[#3f4942]">
                                                {turno.checkInCheckOut.map((item, idx) => (
                                                    <div key={idx}>{item.dataInserimentoCheckIn ? format(new Date(item.dataInserimentoCheckIn), "HH.mm") : "--"}{" - "}{item.dataInserimentoCheckOut ? format(new Date(item.dataInserimentoCheckOut), "HH.mm") : "--"}</div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="bg-[rgba(0,80,50,0.2)] p-0"><div className="h-full w-full flex items-center justify-center px-2 text-[16px] font-bold text-[#191c1d]">{formatOreBrevi(turno.oreLavorateTurno)} h</div></TableCell>
                                        <TableCell><div className={`h-full w-full flex items-center justify-center px-2 text-[16px] ${turno.delta === "00:00:00" ? "font-normal text-[#3f4942]" : "font-bold text-[#ba1a1a]"}`}>{formatOreBrevi(turno.delta)} h</div></TableCell>
                                        <TableCell className="text-center">
                                            <span className="block max-w-[160px] truncate text-[13px] text-[#656565]" title={turno.motivazioneRitardo || "Nessuna motivazione"}>
                                                {turno.motivazioneRitardo || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input type="time" value={turno.oraInizioDefinitivo} onChange={(e) => setOraInizioTurno(turno.idTurno, e.target.value)} className="flex-1 bg-white !border-0 !shadow-none !outline-none focus:ring-0 focus-visible:ring-0" />
                                                    <Input type="time" value={turno.oraFineDefinitivo} onChange={(e) => setOraFineTurno(turno.idTurno, e.target.value)} className="flex-1 bg-white !border-0 !shadow-none !outline-none focus:ring-0 focus-visible:ring-0" />
                                                </div>
                                                <div className="flex justify-center">
                                                    <div className="relative w-fit">
                                                        <CirclePause size={18} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                                        <Input type="number" min={0} max={5} step={0.5} value={turno.orePausaDefinitiva} onChange={(e) => setNumeroOrePausa(turno.idTurno, e.target.value !== "" ? parseFloat(e.target.value) : undefined)} className="w-[100px] pl-8 !bg-white !border-0 !shadow-none !outline-none focus:ring-0 focus-visible:ring-0" />
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="bg-[#d0e8fe] p-0"><div className="h-full w-full flex items-center justify-center px-2 text-[16px] font-bold text-[#191c1d]">{calcolaTotaleOre(turno.oraInizioDefinitivo, turno.oraFineDefinitivo, turno.orePausaDefinitiva)} h</div></TableCell>
                                        <TableCell className="text-center">
                                            <span className="block max-w-[160px] truncate text-[13px] text-[#656565]" title={turno.motivazioneContestazione || "Nessuna motivazione"}>
                                                {turno.motivazioneContestazione || "—"}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {turno.statoPayroll === "DA_ELABORARE" && <Button onClick={() => salvaPayroll(turno.idTurno)} className="w-full cursor-pointer rounded-[5px] bg-[#ffedd5] text-[11px] font-bold text-[#c2410c] hover:bg-[#fed7aa] hover:text-[#9a3412]">Da elaborare</Button>}
                                            {turno.statoPayroll === "ELABORATO" && <Button onClick={() => eliminaPayroll(turno.idTurno)} className="w-full cursor-pointer rounded-[5px] bg-[#9df5c3] text-[11px] font-bold text-[#002112] hover:bg-[#6ee7a5] hover:text-[#00150b]">Rielabora</Button>}
                                            {turno.statoPayroll === "CONTESTATO" && <Button onClick={() => modificaPayroll(turno.idTurno)} className="w-full cursor-pointer rounded-[5px] bg-[#ffd5d5] text-[11px] font-bold text-[#c2410c] hover:bg-[#fecaca] hover:text-[#9a3412]">Contestato</Button>}
                                            {turno.statoPayroll === "MODIFICATO" && <Button disabled className="w-full cursor-not-allowed rounded-[5px] bg-[#d5e2ff] text-[11px] font-bold text-[#4c608b]">Modificato</Button>}
                                        </TableCell>
                                    </TableRow>
                                </React.Fragment>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        </section>
    )
}

export default payroll