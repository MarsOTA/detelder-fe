import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import { CalendarIcon, ChevronsLeft, ChevronsRight, Download, Paintbrush } from "lucide-react";
import { useState, useEffect } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { Button } from "@/components/ui/button";
import { format, differenceInSeconds } from "date-fns";
import { ExternalLink, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

type Presenza = {
    idOperatore: number
    idCheckIn: number
    nominativo: string
    latitudineCheckIn: number
    longitudineCheckIn: number
    dataInserimentoCheckIn: Date
    idCheckOut: number
    latitudineCheckOut: number
    longitudineCheckOut: number
    eventoAssociato: string
    dataInserimentoCheckOut: Date
};

type FiltriRicerca = {
    dataInizio: Date | undefined
    dataFine: Date | undefined
    titoloEvento: string | undefined
}

const presenze = () => {
    const [listaPresenze, setListaPresenze] = useState<Presenza[]>([]);
    const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalPages, setTotalPages] = useState(Number);

    const [sortOrderCheckIn, setSortOrderCheckIn] = useState<string>();
    const [sortOrderNominativo, setSortOrderNominativo] = useState<string>();
    const [sortOrderNomeEvento, setSortOrderNomeEvento] = useState<string>();

    useEffect(() => {
        resetFiltriRicerca();
    }, []);

    const resetFiltriRicerca = () => {
        const orderDataCeckIn = "DESC";
        const filtri: FiltriRicerca = {
            dataInizio: undefined,
            dataFine: undefined,
            titoloEvento: undefined,
        };

        setFiltriRicerca(filtri);
        setSortOrderCheckIn(orderDataCeckIn);
        setSortOrderNominativo(undefined);
        setSortOrderNomeEvento(undefined);
        setPage(1);

        caricaPresenzeOperatore(
            filtri.dataInizio,
            filtri.dataFine,
            filtri.titoloEvento,
            1,
            pageSize,
            orderDataCeckIn,
            undefined,
            undefined
        );
    };

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const caricaPresenzeOperatore = async (
        dataInizio: Date | undefined,
        dataFine: Date | undefined,
        titoloEvento: string | undefined,
        pagina: number,
        righePerPagina: number,
        sortOrderDataCeckIn?: string,
        sortOrderNominativoParam?: string,
        sortNomeEvento?: string
    ) => {
        const queryParams = new URLSearchParams();
        const dataInizioStr = formatDateToYYYYMMDD(dataInizio);
        const dataFineStr = formatDateToYYYYMMDD(dataFine);

        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
        if (dataFineStr) queryParams.append("dataFine", dataFineStr);
        if (titoloEvento) queryParams.append("titoloEvento", titoloEvento);
        queryParams.append("page", String(pagina));
        queryParams.append("pageSize", String(righePerPagina));
        if (sortOrderDataCeckIn) queryParams.append("sortOrderDataCeckIn", sortOrderDataCeckIn);
        if (sortOrderNominativoParam) queryParams.append("sortOrderNominativo", sortOrderNominativoParam);
        if (sortNomeEvento) queryParams.append("sortNomeEvento", sortNomeEvento);

        const url = `${ezystaffBEUrl}operatori/ottieniPresenzeGenerale?${queryParams.toString()}`;

        try {
            const resp = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                credentials: 'include',
            });

            const data = await resp.json();
            setListaPresenze(data.data);
            setTotalPages(data.totalPages);
        } catch (err) {
            console.error("Errore durante il fetch delle timbrature:", err);
        }
    };

    const setDataInizio = (date: Date | undefined) => {
        setFiltriRicerca((prev) => prev ? { ...prev, dataInizio: date } : undefined);
    };

    const setDataFine = (date: Date | undefined) => {
        setFiltriRicerca((prev) => prev ? { ...prev, dataFine: date } : undefined);
    };

    const setTitoloEvento = (titoloEvento: string | undefined) => {
        setFiltriRicerca((prev) => prev ? { ...prev, titoloEvento } : undefined);
    };

    const openGoogleMaps = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    const getHMSDifference = (start: Date, end: Date): string => {
        const totalSeconds = Math.abs(differenceInSeconds(end, start));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const formatNumber = (n: number) => String(n).padStart(2, '0');
        return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
    };

    const getTotalHours = (records: Presenza[]): string => {
        let totalSeconds = 0;

        records.forEach((record) => {
            if (record.dataInserimentoCheckOut) {
                const start = new Date(record.dataInserimentoCheckIn);
                const end = new Date(record.dataInserimentoCheckOut);
                totalSeconds += Math.abs(differenceInSeconds(end, start));
            }
        });

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const handleGiornoClick = (offsetGiorni: number) => {
        const now = new Date();
        now.setDate(now.getDate() + offsetGiorni);
        const filtri: FiltriRicerca = {
            dataInizio: new Date(now),
            dataFine: new Date(now),
            titoloEvento: ""
        };
        setFiltriRicerca(filtri);
        setPage(1);
        caricaPresenzeOperatore(
            filtri.dataInizio,
            filtri.dataFine,
            filtri.titoloEvento,
            1,
            pageSize,
            sortOrderCheckIn,
            sortOrderNominativo,
            sortOrderNomeEvento
        );
    };

    const handleExportToExcel = () => {
        const dataToExport = listaPresenze.map((singoloCheck) => ({
            "Data Check-In": singoloCheck.dataInserimentoCheckIn
                ? new Date(singoloCheck.dataInserimentoCheckIn).toLocaleString("it-IT")
                : "",
            "Posizione Check-In": `${singoloCheck.latitudineCheckIn}, ${singoloCheck.longitudineCheckIn}`,
            "Data Check-Out": singoloCheck.dataInserimentoCheckOut
                ? new Date(singoloCheck.dataInserimentoCheckOut).toLocaleString("it-IT")
                : "In attesa di checkout",
            "Posizione Check-Out": singoloCheck.latitudineCheckOut
                ? `${singoloCheck.latitudineCheckOut}, ${singoloCheck.longitudineCheckOut}`
                : "In attesa di checkout",
            "Titolo Evento": singoloCheck.eventoAssociato || "",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Timbrature");
        XLSX.writeFile(workbook, "timbrature.xlsx");
    };

    const applicaFiltri = () => {
        setPage(1);
        caricaPresenzeOperatore(
            filtriRicerca?.dataInizio,
            filtriRicerca?.dataFine,
            filtriRicerca?.titoloEvento,
            1,
            pageSize,
            sortOrderCheckIn,
            sortOrderNominativo,
            sortOrderNomeEvento
        );
    };

    const cambiaOrdinamentoNominativo = () => {
        const nuovoOrdine = sortOrderNominativo === "ASC" ? "DESC" : "ASC";
        setSortOrderNominativo(nuovoOrdine);
        setSortOrderCheckIn(undefined);
        setSortOrderNomeEvento(undefined);
        caricaPresenzeOperatore(
            filtriRicerca?.dataInizio,
            filtriRicerca?.dataFine,
            filtriRicerca?.titoloEvento,
            page,
            pageSize,
            undefined,
            nuovoOrdine,
            undefined
        );
    };

    const cambiaOrdinamentoCheckIn = () => {
        const nuovoOrdine = sortOrderCheckIn === "ASC" ? "DESC" : "ASC";
        setSortOrderCheckIn(nuovoOrdine);
        setSortOrderNominativo(undefined);
        setSortOrderNomeEvento(undefined);
        caricaPresenzeOperatore(
            filtriRicerca?.dataInizio,
            filtriRicerca?.dataFine,
            filtriRicerca?.titoloEvento,
            page,
            pageSize,
            nuovoOrdine,
            undefined,
            undefined
        );
    };

    const cambiaOrdinamentoEvento = () => {
        const nuovoOrdine = sortOrderNomeEvento === "ASC" ? "DESC" : "ASC";
        setSortOrderNomeEvento(nuovoOrdine);
        setSortOrderNominativo(undefined);
        setSortOrderCheckIn(undefined);
        caricaPresenzeOperatore(
            filtriRicerca?.dataInizio,
            filtriRicerca?.dataFine,
            filtriRicerca?.titoloEvento,
            page,
            pageSize,
            undefined,
            undefined,
            nuovoOrdine
        );
    };

    return (
        <section className="m-6" style={{ fontFamily: "'Mulish', sans-serif" }}>
            <div className="space-y-5">
                <div className="flex items-center justify-between gap-6 border-b border-[#e4ebe8] pb-5">
                    <div>
                        <h1 className="text-[30px] font-extrabold tracking-[-0.03em] text-[#007a55]">Generale presenze</h1>
                        <p className="mt-1 text-[14px] font-medium text-[#7a7a7a]">Visualizza, filtra ed esporta le presenze registrate dagli operatori.</p>
                    </div>
                    <Button onClick={handleExportToExcel} className="h-10 rounded-xl bg-[#007a55] px-5 text-[14px] font-extrabold text-white shadow-[0_5px_14px_rgba(0,122,85,0.15)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#006f4d]">
                        <Download className="h-4 w-4" />
                        Scarica CSV
                    </Button>
                </div>

                <div className="flex items-center gap-3 rounded-xl border border-[#e4ebe8] bg-[#f7f9f8] p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <span className="text-[13px] font-semibold text-[#656565]">Periodo da</span>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full bg-white text-[13px] font-normal text-[#747474]">
                                    {filtriRicerca?.dataInizio ? filtriRicerca.dataInizio.toLocaleDateString() : "Seleziona data"}
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={filtriRicerca?.dataInizio} onSelect={setDataInizio} locale={it} className="pointer-events-auto" />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <span className="text-[13px] font-semibold text-[#656565]">a</span>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full bg-white text-[13px] font-normal text-[#747474]">
                                    {filtriRicerca?.dataFine ? filtriRicerca.dataFine.toLocaleDateString() : "Seleziona data"}
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={filtriRicerca?.dataFine} onSelect={setDataFine} locale={it} className="pointer-events-auto" />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <Input
                        type="text"
                        placeholder="Ricerca per Titolo evento"
                        value={filtriRicerca?.titoloEvento ?? ""}
                        onChange={(e) => setTitoloEvento(e.target.value)}
                        className="w-52 border border-[#d8dfdc] bg-white px-3 py-1"
                    />
                    <Button onClick={applicaFiltri} className="rounded-lg bg-[#007a55] px-4 text-[14px] font-extrabold text-white hover:bg-[#006f4d]">Filtra</Button>
                    <Button onClick={resetFiltriRicerca} title="Azzera filtri" className="rounded-lg bg-[#007a55] text-white hover:bg-[#006f4d]">
                        <Paintbrush className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => handleGiornoClick(0)} className="rounded-full border border-[#007a55] bg-[#f3fffa] px-5 text-[14px] font-bold text-[#007a55] hover:bg-[#e9f8f2]">Oggi</Button>
                    <Button onClick={() => handleGiornoClick(-1)} className="rounded-full border border-[#007a55] bg-white px-5 text-[14px] font-bold text-[#007a55] hover:bg-[#f5faf8]">Ieri</Button>
                    <div className="ml-auto whitespace-nowrap rounded-lg bg-white px-4 py-2 text-[16px] font-extrabold text-[#4f796a] shadow-[inset_0_0_0_1px_#e2ebe7]">
                        Totale ore: {getTotalHours(listaPresenze)}
                    </div>
                </div>

                <div>
                    <Table>
                        <TableHeader className="bg-[#ecf3f1]">
                            <TableRow>
                                <TableHead className="cursor-pointer text-[16px] font-bold text-[#656565]" onClick={cambiaOrdinamentoNominativo}>
                                    Operatore
                                    {sortOrderNominativo === "ASC" ? <ArrowUp className="ml-1 inline h-4 w-4" /> : sortOrderNominativo === "DESC" ? <ArrowDown className="ml-1 inline h-4 w-4" /> : <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />}
                                </TableHead>
                                <TableHead className="cursor-pointer text-[16px] font-bold text-[#656565]" onClick={cambiaOrdinamentoCheckIn}>
                                    Data Check-In
                                    {sortOrderCheckIn === "ASC" ? <ArrowUp className="ml-1 inline h-4 w-4" /> : sortOrderCheckIn === "DESC" ? <ArrowDown className="ml-1 inline h-4 w-4" /> : <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />}
                                </TableHead>
                                <TableHead className="text-[16px] font-bold text-[#656565]">Posizione Check-In</TableHead>
                                <TableHead className="text-[16px] font-bold text-[#656565]">Data Check-Out</TableHead>
                                <TableHead className="text-[16px] font-bold text-[#656565]">Posizione Check-Out</TableHead>
                                <TableHead className="cursor-pointer text-[16px] font-bold text-[#656565]" onClick={cambiaOrdinamentoEvento}>
                                    Titolo Evento
                                    {sortOrderNomeEvento === "ASC" ? <ArrowUp className="ml-1 inline h-4 w-4" /> : sortOrderNomeEvento === "DESC" ? <ArrowDown className="ml-1 inline h-4 w-4" /> : <ArrowUpDown className="ml-1 inline h-4 w-4 opacity-50" />}
                                </TableHead>
                                <TableHead className="text-[16px] font-bold text-[#656565]">Ore lavorate</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listaPresenze.map((presenza, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Link to={`/admin/timbrature-operatore/${presenza.idOperatore}`} className="cursor-pointer text-blue-600 underline hover:text-blue-800">
                                            {presenza.nominativo}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{format(new Date(presenza.dataInserimentoCheckIn), "dd/MM/yyyy - HH:mm:ss")}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" className="flex items-center text-blue-500 hover:underline" onClick={() => openGoogleMaps(presenza.latitudineCheckIn, presenza.longitudineCheckIn)}>
                                            Vedi mappa <ExternalLink className="ml-1 h-3 w-3" />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {presenza.dataInserimentoCheckOut ? format(new Date(presenza.dataInserimentoCheckOut), "dd/MM/yyyy - HH:mm:ss") : "In attesa di checkout"}
                                    </TableCell>
                                    <TableCell>
                                        {presenza.latitudineCheckOut ? (
                                            <Button variant="ghost" className="flex items-center text-blue-500 hover:underline" onClick={() => openGoogleMaps(presenza.latitudineCheckOut, presenza.longitudineCheckOut)}>
                                                Vedi mappa <ExternalLink className="ml-1 h-3 w-3" />
                                            </Button>
                                        ) : "In attesa di checkout"}
                                    </TableCell>
                                    <TableCell>{presenza.eventoAssociato}</TableCell>
                                    <TableCell>
                                        {presenza.dataInserimentoCheckOut ? getHMSDifference(new Date(presenza.dataInserimentoCheckOut), new Date(presenza.dataInserimentoCheckIn)) : "In attesa di checkout"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="mt-4 flex items-center">
                        <div className="flex flex-1 items-center justify-center space-x-4">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => {
                                    const newPage = Math.max(page - 1, 1);
                                    setPage(newPage);
                                    caricaPresenzeOperatore(filtriRicerca?.dataInizio, filtriRicerca?.dataFine, filtriRicerca?.titoloEvento, newPage, pageSize, sortOrderCheckIn, sortOrderNominativo, sortOrderNomeEvento);
                                }}
                                className="rounded-[5px] border border-[#007a55] bg-white text-[16px] font-bold text-[#007a55] hover:bg-[#f3fffa]"
                            >
                                <ChevronsLeft className="h-4 w-4" /> Precedente
                            </Button>

                            <div className="flex items-center space-x-2">
                                <span className="ml-auto text-[20px] font-bold text-[#4c4a4a]">Mostra</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        const newPageSize = parseInt(e.target.value);
                                        setPageSize(newPageSize);
                                        setPage(1);
                                        caricaPresenzeOperatore(filtriRicerca?.dataInizio, filtriRicerca?.dataFine, filtriRicerca?.titoloEvento, 1, newPageSize, sortOrderCheckIn, sortOrderNominativo, sortOrderNomeEvento);
                                    }}
                                    className="rounded border px-2 py-1 text-[19px] font-bold text-[#007a55]"
                                >
                                    {[20, 50, 100].map((size) => <option key={size} value={size}>{size}</option>)}
                                </select>
                                <span className="ml-auto text-[20px] font-bold text-[#4c4a4a]">righe per pagina</span>
                            </div>

                            <Button
                                variant="outline"
                                disabled={page === totalPages}
                                onClick={() => {
                                    const newPage = Math.min(page + 1, totalPages);
                                    setPage(newPage);
                                    caricaPresenzeOperatore(filtriRicerca?.dataInizio, filtriRicerca?.dataFine, filtriRicerca?.titoloEvento, newPage, pageSize, sortOrderCheckIn, sortOrderNominativo, sortOrderNomeEvento);
                                }}
                                className="rounded-[5px] border border-[#007a55] bg-white text-[16px] font-bold text-[#007a55] hover:bg-[#f3fffa]"
                            >
                                Successiva <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="ml-auto text-[20px] font-bold text-[#4c4a4a]">Pagina {page} di {totalPages}</div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default presenze