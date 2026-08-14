import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import { CalendarIcon, ChevronsLeft, ChevronsRight, Paintbrush } from "lucide-react";
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
        const orderNominativo: string | undefined = undefined;
        const orderNomeEvento: string | undefined = undefined;
        const filtri: FiltriRicerca = {
            dataInizio: undefined,
            dataFine: undefined,
            titoloEvento: undefined,
        };

        setFiltriRicerca(filtri);
        setSortOrderCheckIn(orderDataCeckIn);
        setSortOrderNominativo(undefined);
        setSortOrderNomeEvento(undefined);

        caricaPresenzeOperatore(
            filtri.dataInizio,
            filtri.dataFine,
            filtri.titoloEvento,
            page,
            pageSize,
            orderDataCeckIn,
            orderNominativo,
            orderNomeEvento
        );
    };


    const caricaPresenzeOperatore = async (
        dataInizio: Date | undefined,
        dataFine: Date | undefined,
        titoloEvento: string | undefined,
        page: number,
        pageSize: number,
        sortOrderDataCeckIn?: string,
        sortOrderNominativo?: string,
        sortNomeEvento?: string
    ) => {
        const dataInizioStr = formatDateToYYYYMMDD(dataInizio);
        const dataFineStr = formatDateToYYYYMMDD(dataFine);

        const queryParams = new URLSearchParams();
        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
        if (dataFineStr) queryParams.append("dataFine", dataFineStr);

        if (titoloEvento) queryParams.append("titoloEvento", titoloEvento);
        queryParams.append("page", String(page));
        queryParams.append("pageSize", String(pageSize));
        if (sortOrderDataCeckIn) {
            queryParams.append("sortOrderDataCeckIn", sortOrderDataCeckIn);
        }
        if (sortOrderNominativo) {
            queryParams.append("sortOrderNominativo", sortOrderNominativo);
        }
        if (sortNomeEvento) {
            queryParams.append("sortNomeEvento", sortNomeEvento);
        }

        // console.log("sortOrderDataCeckIn: ", sortOrderDataCeckIn);

        const url = `${ezystaffBEUrl}operatori/ottieniPresenzeGenerale?${queryParams.toString()}`;

        try {
            console.log("Chiamata ottieniPresenzeGenerale con sortOrderDataCeckIn:", sortOrderDataCeckIn);
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

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mesi 0-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const setDataInizio = (date: Date | undefined) => {
        setFiltriRicerca((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                dataInizio: date,
            };
        });
    };

    const setDataFine = (date: Date | undefined) => {
        setFiltriRicerca((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                dataFine: date,
            };
        });
    };

    const setTitoloEvento = (titoloEvento: string | undefined) => {
        setFiltriRicerca((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                titoloEvento,
            };
        });
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

    const handleGiornoClick = (offsetGiorni: number) => {

        const now = new Date();
        now.setDate(now.getDate() + offsetGiorni);

        const filtri: FiltriRicerca = {
            dataInizio: new Date(now),
            dataFine: new Date(now),
            titoloEvento: ""
        };

        setFiltriRicerca(filtri);

        caricaPresenzeOperatore(
            filtri.dataInizio,
            filtri.dataFine,
            filtri.titoloEvento,
            page,
            pageSize,
            sortOrderCheckIn,
            sortOrderNominativo,
            sortOrderNomeEvento
        );
    };

    // Funzione per calcolare il totale delle ore lavorate
    const getTotalHours = (records: typeof listaPresenze): string => {
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
        const seconds = totalSeconds % 60;

        const formatNumber = (n: number) => String(n).padStart(2, "0");
        return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
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

    return (
        <section className="m-6">
            <div className="space-y-6">
                <div className="text-[#007a55] text-[32px] font-extrabold mb-2">
                    GENERALE PRESENZE
                </div>

                <div>
                    <Button onClick={handleExportToExcel}
                        className="w-[200px] rounded-[18px] bg-[#007a55] text-white text-[18px] !font-bold hover:bg-[#009e6d] transition-colors cursor-pointer">
                        SCARICA CSV
                    </Button>
                </div>
                <div className="flex items-center gap-4 bg-[#f0f0f0] p-4 mb-1">
                    <span className="text-[13px] font-normal text-[#656565]">Periodo da</span>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full text-[13px] font-normal text-[#747474]"
                                >
                                    {filtriRicerca?.dataInizio
                                        ? filtriRicerca?.dataInizio.toLocaleDateString()
                                        : "Seleziona data"}
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filtriRicerca?.dataInizio}
                                    onSelect={setDataInizio}
                                    locale={it}
                                    className="pointer-events-auto"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <span className="text-[13px] font-normal text-[#656565]">a</span>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full text-[13px] font-normal text-[#747474]"
                                >
                                    {filtriRicerca?.dataFine
                                        ? filtriRicerca?.dataFine.toLocaleDateString()
                                        : "Seleziona data"}
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={filtriRicerca?.dataFine}
                                    onSelect={setDataFine}
                                    locale={it}
                                    className="pointer-events-auto"
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <Input
                            type="text"
                            placeholder="Ricerca per Titolo evento"
                            value={filtriRicerca?.titoloEvento}
                            onChange={(e) => setTitoloEvento(e.target.value)}
                            className="border border-gray-300 px-2 py-1 w-48 bg-white"
                        />
                    </div>                    

                    <div>
                        <Button
                            onClick={() =>
                                caricaPresenzeOperatore(filtriRicerca?.dataInizio, filtriRicerca?.dataFine, filtriRicerca?.titoloEvento, page, pageSize, sortOrderCheckIn, sortOrderNominativo, sortOrderNomeEvento)
                            }
                            className="rounded-[5px] bg-[#007a55] text-white text-[16px] font-bold hover:bg-[#009e6d] cursor-pointer"
                        >
                            FILTRA
                        </Button>
                    </div>

                    <div>
                        <Button
                            onClick={() => resetFiltriRicerca()}
                            className="rounded-[5px] bg-[#007a55] text-white hover:bg-[#009e6d] cursor-pointer"
                        >
                            <Paintbrush className="h-4 w-4" />
                        </Button>
                    </div>

                    <div>
                        <Button
                            onClick={() => handleGiornoClick(0)}
                            className="w-[70px] rounded-[18px] border border-[#007a55] bg-[#f3fffa] text-[#007a55] text-[16px] font-bold hover:bg-[#e6fff5] cursor-pointer">
                            Oggi
                        </Button>
                    </div>

                    <div>
                        <Button onClick={() => handleGiornoClick(-1)}
                            className="w-[70px] rounded-[18px] border border-[#007a55] bg-white text-[#007a55] text-[16px] font-bold hover:bg-[#f3fffa] cursor-pointer">
                            Ieri
                        </Button>
                    </div>

                    <div className="ml-auto text-[#5e8a7a] text-[24px] font-extrabold">
                        Totale ore lavorate: {getTotalHours(listaPresenze)}
                    </div>

                </div>

                <div>
                    <Table>
                        <TableHeader className="bg-[#ecf3f1]">
                            <TableRow>
                                <TableHead
                                    className="text-[16px] font-bold text-[#656565] cursor-pointer"
                                    onClick={() => {

                                        const orderNominativo = sortOrderNominativo === undefined
                                            ? "DESC"
                                            : sortOrderNominativo === "ASC"
                                                ? "DESC"
                                                : "ASC";

                                        const orderNomeEvento: string | undefined = undefined;
                                        const orderDataCeckIn: string | undefined = undefined;

                                        setSortOrderCheckIn(orderDataCeckIn);
                                        setSortOrderNominativo(orderNominativo);
                                        setSortOrderNomeEvento(orderNomeEvento);

                                        // chiama la funzione passando il sort aggiornato
                                        caricaPresenzeOperatore(
                                            filtriRicerca?.dataInizio,
                                            filtriRicerca?.dataFine,
                                            filtriRicerca?.titoloEvento,
                                            page,
                                            pageSize,
                                            orderDataCeckIn,
                                            orderNominativo,
                                            sortOrderNomeEvento
                                        );
                                    }}
                                >
                                    Operatore
                                    {sortOrderNominativo === "ASC" ? (
                                        <ArrowUp className="h-4 w-4 inline ml-1" />
                                    ) : sortOrderNominativo === "DESC" ? (
                                        <ArrowDown className="h-4 w-4 inline ml-1" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 inline ml-1 opacity-50" />
                                    )}
                                </TableHead>

                                <TableHead
                                    className="text-[16px] font-bold text-[#656565] cursor-pointer"
                                    onClick={() => {

                                        const orderDataCeckIn = sortOrderCheckIn === undefined
                                            ? "DESC"
                                            : sortOrderCheckIn === "ASC"
                                                ? "DESC"
                                                : "ASC";

                                        const orderNominativo: string | undefined = undefined;
                                        const orderNomeEvento: string | undefined = undefined;

                                        setSortOrderCheckIn(orderDataCeckIn);
                                        setSortOrderNominativo(orderNominativo);
                                        setSortOrderNomeEvento(orderNomeEvento);

                                        // chiama la funzione passando il sort aggiornato
                                        caricaPresenzeOperatore(
                                            filtriRicerca?.dataInizio,
                                            filtriRicerca?.dataFine,
                                            filtriRicerca?.titoloEvento,
                                            page,
                                            pageSize,
                                            orderDataCeckIn,
                                            orderNominativo,
                                            sortOrderNomeEvento
                                        );
                                    }}
                                >
                                    Data Check-In
                                    {sortOrderCheckIn === "ASC" ? (
                                        <ArrowUp className="h-4 w-4 inline ml-1" />
                                    ) : sortOrderCheckIn === "DESC" ? (
                                        <ArrowDown className="h-4 w-4 inline ml-1" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 inline ml-1 opacity-50" />
                                    )}
                                </TableHead>

                                <TableHead className="text-[16px] font-bold text-[#656565]">
                                    Posizione Check-In
                                </TableHead>

                                <TableHead className="text-[16px] font-bold text-[#656565]">
                                    Data Check-Out
                                </TableHead>

                                <TableHead className="text-[16px] font-bold text-[#656565]">
                                    Posizione Check-Out
                                </TableHead>
                                {/*
                                <TableHead className="text-[16px] font-bold text-[#656565]">
                                    Titolo Evento
                                </TableHead>
                                        */}
                                <TableHead
                                    className="text-[16px] font-bold text-[#656565] cursor-pointer"
                                    onClick={() => {

                                        const orderNomeEvento = sortOrderNomeEvento === undefined
                                            ? "DESC"
                                            : sortOrderNomeEvento === "ASC"
                                                ? "DESC"
                                                : "ASC";

                                        const orderNominativo: string | undefined = undefined;
                                        const orderDataCeckIn: string | undefined = undefined;

                                        setSortOrderCheckIn(orderDataCeckIn);
                                        setSortOrderNominativo(orderNominativo);
                                        setSortOrderNomeEvento(orderNomeEvento);

                                        // chiama la funzione passando il sort aggiornato
                                        caricaPresenzeOperatore(
                                            filtriRicerca?.dataInizio,
                                            filtriRicerca?.dataFine,
                                            filtriRicerca?.titoloEvento,
                                            page,
                                            pageSize,
                                            orderDataCeckIn,
                                            orderNominativo,
                                            orderNomeEvento
                                        );
                                    }}
                                >
                                    Titolo Evento
                                    {sortOrderNomeEvento === "ASC" ? (
                                        <ArrowUp className="h-4 w-4 inline ml-1" />
                                    ) : sortOrderNomeEvento === "DESC" ? (
                                        <ArrowDown className="h-4 w-4 inline ml-1" />
                                    ) : (
                                        <ArrowUpDown className="h-4 w-4 inline ml-1 opacity-50" />
                                    )}
                                </TableHead>

                                <TableHead className="text-[16px] font-bold text-[#656565]">
                                    Ore lavorate
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {listaPresenze.map((presenza, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <Link
                                            to={`/admin/timbrature-operatore/${presenza.idOperatore}`}
                                            className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                                        >
                                            {presenza.nominativo}
                                        </Link>
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(presenza.dataInserimentoCheckIn), "dd/MM/yyyy - HH:mm:ss")}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant={"ghost"}
                                            className="flex items-center text-blue-500 hover:underline"
                                            onClick={() =>
                                                openGoogleMaps(presenza.latitudineCheckIn, presenza.longitudineCheckIn)
                                            }
                                        >
                                            Vedi mappa <ExternalLink className="h-3 w-3 ml-1" />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {presenza.dataInserimentoCheckOut
                                            ? format(new Date(presenza.dataInserimentoCheckOut), "dd/MM/yyyy - HH:mm:ss")
                                            : "In attesa di checkout"}
                                    </TableCell>
                                    <TableCell>
                                        {presenza.latitudineCheckOut ? (
                                            <Button variant={"ghost"}
                                                className="flex items-center text-blue-500 hover:underline"
                                                onClick={() =>
                                                    openGoogleMaps(presenza.latitudineCheckOut, presenza.longitudineCheckOut)
                                                }
                                            >
                                                Vedi mappa <ExternalLink className="h-3 w-3 ml-1" />
                                            </Button>
                                        ) : (
                                            "In attesa di checkout"
                                        )}
                                    </TableCell>
                                    <TableCell>{presenza.eventoAssociato}</TableCell>
                                    <TableCell>
                                        {presenza.dataInserimentoCheckOut
                                            ? getHMSDifference(
                                                new Date(presenza.dataInserimentoCheckOut),
                                                new Date(presenza.dataInserimentoCheckIn)
                                            )
                                            : "In attesa di checkout"}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="flex items-center mt-4">
                        <div className="flex-1 flex justify-center items-center space-x-4">
                            <Button
                                variant="outline"
                                disabled={page === 1}
                                onClick={() => {
                                    const newPage = Math.max(page - 1, 1);
                                    setPage(newPage);

                                    caricaPresenzeOperatore(
                                        filtriRicerca?.dataInizio,
                                        filtriRicerca?.dataFine,
                                        filtriRicerca?.titoloEvento,
                                        newPage,
                                        pageSize,
                                        sortOrderCheckIn,
                                        sortOrderNominativo,
                                        sortOrderNomeEvento
                                    );
                                }}
                                className="rounded-[5px] border border-[#007a55] bg-white text-[#007a55] text-[16px] font-bold hover:bg-[#f3fffa]"
                            >
                                <ChevronsLeft className="h-4 w-4" /> Precedente
                            </Button>

                            {/* Selettore pageSize */}
                            <div className="flex items-center space-x-2">
                                <span className="ml-auto text-[20px] font-bold text-[#4c4a4a]">Mostra</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        const newPageSize = parseInt(e.target.value);
                                        setPageSize(newPageSize);
                                        setPage(1); // reset pagina
                                        caricaPresenzeOperatore(
                                            filtriRicerca?.dataInizio,
                                            filtriRicerca?.dataFine,
                                            filtriRicerca?.titoloEvento,
                                            1,
                                            newPageSize,
                                            sortOrderCheckIn,
                                            sortOrderNominativo,
                                            sortOrderNomeEvento
                                        );
                                    }}
                                    className="border rounded px-2 py-1 text-[19px] font-bold text-[#007a55]"
                                >
                                    {[20, 50, 100].map((size) => (
                                        <option key={size} value={size}>
                                            {size}
                                        </option>
                                    ))}
                                </select>
                                <span className="ml-auto text-[20px] font-bold text-[#4c4a4a]" >righe per pagina</span>
                            </div>

                            <Button
                                variant="outline"
                                disabled={page === totalPages}
                                onClick={() => {
                                    const newPage = Math.min(page + 1, totalPages);
                                    setPage(newPage);

                                    caricaPresenzeOperatore(
                                        filtriRicerca?.dataInizio,
                                        filtriRicerca?.dataFine,
                                        filtriRicerca?.titoloEvento,
                                        newPage,
                                        pageSize,
                                        sortOrderCheckIn,
                                        sortOrderNominativo,
                                        sortOrderNomeEvento
                                    );
                                }}
                                className="rounded-[5px] border border-[#007a55] bg-white text-[#007a55] text-[16px] font-bold hover:bg-[#f3fffa]"
                            >
                                Successiva <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>

                        <div className="ml-auto text-[20px] font-bold text-[#4c4a4a]">
                            Pagina {page} di {totalPages}
                        </div>

                    </div>

                </div>

            </div>
        </section>
    )
}

export default presenze