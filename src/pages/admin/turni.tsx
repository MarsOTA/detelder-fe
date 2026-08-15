import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Circle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import * as XLSX from "xlsx";
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type FiltriRicerca = { ricercaKeyword: string; dataInizio: Date | undefined; dataFine: Date | undefined; }
type TurnoCompleto = { idTurno: number; idEvento: number; idCheckInCheckOut: number; dataTurno: Date | undefined; oraInizio: string; oraFine: string; nomeEvento: string; nomeBrand: string; ragioneSociale: string; tipologiaTurno: string; tipoMansione: string; operatore: string; orePausa: string; via: string; }

const turni = () => {
    const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();
    const [turni, setTurni] = useState<TurnoCompleto[]>([]);

    useEffect(() => {
        const filtriRicerca: FiltriRicerca = { ricercaKeyword: "", dataInizio: new Date(), dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)) };
        setFiltriRicerca(filtriRicerca);
        caricaTurni(filtriRicerca);
    }, []);

    const handleGiornoClick = (offsetGiorni: number) => {
        const now = new Date(); now.setDate(now.getDate() + offsetGiorni);
        const filtriRicerca: FiltriRicerca = { ricercaKeyword: "", dataInizio: new Date(now), dataFine: new Date(now) };
        setFiltriRicerca(filtriRicerca); caricaTurni(filtriRicerca);
    };

    const setRicercaKeyword = (value: string) => setFiltriRicerca((prev) => prev ? { ...prev, ricercaKeyword: value } : undefined);
    const setDataInizio = (date: Date | undefined) => setFiltriRicerca((prev) => prev ? { ...prev, dataInizio: date } : undefined);
    const setDataFine = (date: Date | undefined) => setFiltriRicerca((prev) => prev ? { ...prev, dataFine: date } : undefined);

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const caricaTurni = async (filtri: FiltriRicerca) => {
        const queryParams = new URLSearchParams();
        const dataInizioStr = formatDateToYYYYMMDD(filtri.dataInizio); const dataFineStr = formatDateToYYYYMMDD(filtri.dataFine); const ricercaKeyword = filtri.ricercaKeyword?.trim();
        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr); if (dataFineStr) queryParams.append("dataFine", dataFineStr); if (ricercaKeyword) queryParams.append("keyword", ricercaKeyword);
        const resp = await fetch(`${ezystaffBEUrl}turni?${queryParams.toString()}`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}`, 'Content-Type': 'application/json', accept: 'application/json' }, credentials: 'include' });
        setTurni(await resp.json());
    }

    const handleExportToExcel = () => {
        const dataToExport = turni.map(turno => ({ DataTurno: turno.dataTurno ? format(turno.dataTurno, "dd/MM/yyyy") : "", NomeEvento: turno.nomeEvento, OraInizio: turno.oraInizio, OraFine: turno.oraFine, TipologiaAttività: turno.tipologiaTurno, Mansione: turno.tipoMansione, Operatore: turno.operatore, OrePausa: turno.orePausa }));
        const worksheet = XLSX.utils.json_to_sheet(dataToExport); const workbook = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(workbook, worksheet, "TurniCompleti"); XLSX.writeFile(workbook, "tutti_i_turni.xlsx");
    };

    const navigaSuSingoloEvento = (idEvento: number, dataTurno?: Date) => { if (!dataTurno) return; window.open(`/admin/gestione-turni/${idEvento}/${format(new Date(dataTurno), "yyyy-MM-dd")}`, "_blank", "noopener,noreferrer"); };
    const isMancataTimbratura = (dataTurno: Date | undefined, oraInizio: string): boolean => { if (!dataTurno || !oraInizio) return false; const turnoDate = new Date(dataTurno); const [oreStr, minutiStr] = oraInizio.split(":"); turnoDate.setHours(parseInt(oreStr, 10), parseInt(minutiStr, 10), 0, 0); return turnoDate < new Date(); };

    return (
        <section className="m-6" style={{ fontFamily: "'Mulish', sans-serif" }}>
            <div className="mb-5 flex items-center justify-between gap-6 border-b border-[#e4ebe8] pb-5">
                <div>
                    <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#007a55]">Planning turni</h1>
                    <p className="mt-1 text-[14px] font-medium text-[#7a7a7a]">Consulta la pianificazione dei turni, filtra per periodo e apri rapidamente il dettaglio dell’evento.</p>
                </div>
            </div>

            <div className="flex items-center bg-[#ecf3f1] mb-1">
                <div className="flex items-center bg-[#ecf3f1] p-4 mb-1">
                    <Input type="text" placeholder="Ricerca per keyword" value={filtriRicerca?.ricercaKeyword} onChange={(e) => setRicercaKeyword(e.target.value)} className="border border-gray-300 rounded-l-md px-2 py-1 w-48 bg-white rounded-r-none" />
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full rounded-none">{filtriRicerca?.dataInizio ? filtriRicerca.dataInizio.toLocaleDateString() : "Seleziona data"}<CalendarIcon className="mr-2 h-4 w-4" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={filtriRicerca?.dataInizio} onSelect={setDataInizio} locale={it} className="pointer-events-auto" /></PopoverContent></Popover>
                    <Popover><PopoverTrigger asChild><Button variant="outline" className="w-full rounded-none">{filtriRicerca?.dataFine ? filtriRicerca.dataFine.toLocaleDateString() : "Seleziona data"}<CalendarIcon className="mr-2 h-4 w-4" /></Button></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={filtriRicerca?.dataFine} onSelect={setDataFine} locale={it} className="pointer-events-auto" /></PopoverContent></Popover>
                    <Button className="bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer rounded-r-full rounded-l-none -ml-px" onClick={() => filtriRicerca && caricaTurni(filtriRicerca)}>Filtra</Button>
                </div>
                <div className="flex gap-3"><Button onClick={() => handleGiornoClick(0)} className="w-[70px] rounded-[18px] border border-[#007a55] bg-[#f3fffa] text-[#007a55] text-[16px] font-bold hover:bg-[#e6fff5] cursor-pointer">Oggi</Button><Button onClick={() => handleGiornoClick(+1)} className="w-[70px] rounded-[18px] border border-[#007a55] bg-white text-[#007a55] text-[16px] font-bold hover:bg-[#f3fffa] cursor-pointer">Domani</Button></div>
                <div className="flex items-center gap-4 ml-auto"><Button className="rounded-[18px] bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer pl-8 pr-8" onClick={handleExportToExcel}>Scarica .csv</Button></div>
            </div>

            <div className="border rounded-md p-4 bg-gray-50">
                <Table>
                    <TableHeader><TableRow><TableHead>Ora inizio</TableHead><TableHead>Ora fine</TableHead><TableHead>Operatore</TableHead><TableHead>Mansione</TableHead><TableHead>Tipo Turno</TableHead><TableHead>Pausa h.</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {turni.map((turno, index) => {
                            const prevTurno = turni[index - 1];
                            const isNewDate = index === 0 || (prevTurno?.dataTurno && turno.dataTurno && format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") !== format(new Date(turno.dataTurno), "yyyy-MM-dd"));
                            const isNewEvento = prevTurno && turno.dataTurno && prevTurno.dataTurno && format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") === format(new Date(turno.dataTurno), "yyyy-MM-dd") && prevTurno.nomeEvento !== turno.nomeEvento;
                            return <React.Fragment key={index}>
                                {isNewDate && <TableRow><TableCell colSpan={6} className="bg-[#007a55] text-white"><div className="flex justify-between"><span className="w-[10%] font-bold">{turno.dataTurno ? format(new Date(turno.dataTurno), "dd/MM/yyyy") : ""}</span><span className="w-[45%] uppercase font-bold">{(turno.nomeEvento && turno.nomeEvento.trim() !== '' ? turno.nomeEvento : `${turno.nomeBrand ?? ''} - ${turno.ragioneSociale ?? ''}`).toUpperCase()}</span><span className="w-[45%] text-right">{turno.via}</span></div></TableCell></TableRow>}
                                {!isNewDate && isNewEvento && <TableRow><TableCell colSpan={6} className="bg-[#8f8f8f] text-white"><div className="flex justify-between"><span className="w-[10%] font-bold">{turno.dataTurno ? format(new Date(turno.dataTurno), "dd/MM/yyyy") : ""}</span><span className="w-[45%] uppercase font-bold">{(turno.nomeEvento && turno.nomeEvento.trim() !== '' ? turno.nomeEvento : `${turno.nomeBrand ?? ''} - ${turno.ragioneSociale ?? ''}`).toUpperCase()}</span><span className="w-[45%] text-right">{turno.via}</span></div></TableCell></TableRow>}
                                <TableRow onClick={() => navigaSuSingoloEvento(turno.idEvento, turno.dataTurno)} style={{ cursor: "pointer" }}><TableCell>{turno.oraInizio}</TableCell><TableCell>{turno.oraFine}</TableCell><TableCell style={{ display: "flex", alignItems: "center" }}><Circle size={10} strokeWidth={0} fill={turno.idCheckInCheckOut !== null ? "#00D68E" : isMancataTimbratura(turno.dataTurno, turno.oraInizio) ? "red" : "#B8B8B8"} color={turno.idCheckInCheckOut !== null ? "#00D68E" : isMancataTimbratura(turno.dataTurno, turno.oraInizio) ? "#EA6B62" : "#B8B8B8"} style={{ marginRight: 8 }} />{turno.operatore}</TableCell><TableCell>{turno.tipoMansione}</TableCell><TableCell>{turno.tipologiaTurno}</TableCell><TableCell>{turno.orePausa}</TableCell></TableRow>
                            </React.Fragment>
                        })}
                    </TableBody>
                </Table>
            </div>
        </section>
    )
}

export default turni