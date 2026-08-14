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

type FiltriRicerca = {
    ricercaKeyword: string;
    dataInizio: Date | undefined;
    dataFine: Date | undefined;
}

type TurnoCompleto = {
    idTurno: number
    idEvento: number
    idCheckInCheckOut: number
    dataTurno: Date | undefined
    oraInizio: string
    oraFine: string
    nomeEvento: string
    nomeBrand: string
    ragioneSociale: string
    tipologiaTurno: string
    tipoMansione: string
    operatore: string
    orePausa: string
    via: string
}

const turni = () => {

    const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();
    const [turni, setTurni] = useState<TurnoCompleto[]>([]);

    useEffect(() => {

        const filtriRicerca: FiltriRicerca = {
            ricercaKeyword: "",
            dataInizio: new Date(),
            dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
        setFiltriRicerca(filtriRicerca);
        caricaTurni(filtriRicerca);

    }, []);

    const handleGiornoClick = (offsetGiorni: number) => {

        const now = new Date();
        now.setDate(now.getDate() + offsetGiorni);

        const filtriRicerca: FiltriRicerca = {
            ricercaKeyword: "",
            dataInizio: new Date(now),
            dataFine: new Date(now),
        }
        setFiltriRicerca(filtriRicerca);
        caricaTurni(filtriRicerca);

    };

    const setRicercaKeyword = (value: string) => {
        setFiltriRicerca((prev) => {
            if (!prev) return undefined;
            return {
                ...prev,
                ricercaKeyword: value,
            };
        });
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

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mesi 0-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    const caricaTurni = async (filtri: FiltriRicerca) => {
        const dataInizioStr = formatDateToYYYYMMDD(filtri.dataInizio);
        const dataFineStr = formatDateToYYYYMMDD(filtri.dataFine);
        const ricercaKeyword = filtri.ricercaKeyword?.trim();

        const queryParams = new URLSearchParams();

        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
        if (dataFineStr) queryParams.append("dataFine", dataFineStr);
        if (ricercaKeyword) queryParams.append("keyword", ricercaKeyword);

        const url = `${ezystaffBEUrl}turni?${queryParams.toString()}`;

        const resp = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setTurni(data);

    }

    const handleExportToExcel = () => {
        let dataToExport: any[] = [];


        // ✅ Se enabled è true, esporta i turni
        dataToExport = turni.map(turno => ({
            DataTurno: turno.dataTurno ? format(turno.dataTurno, "dd/MM/yyyy") : "",
            NomeEvento: turno.nomeEvento,
            OraInizio: turno.oraInizio,
            OraFine: turno.oraFine,
            TipologiaAttività: turno.tipologiaTurno,
            Mansione: turno.tipoMansione,
            Operatore: turno.operatore,
            OrePausa: turno.orePausa,
        }));


        //Creazione del file Excel
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            "TurniCompleti"
        );

        XLSX.writeFile(
            workbook,
            "tutti_i_turni.xlsx"
        );
    };

    const navigaSuSingoloEvento = (idEvento: number, dataTurno?: Date) => {
        if (!dataTurno) return;

        const url = `/admin/gestione-turni/${idEvento}/${format(
            new Date(dataTurno),
            "yyyy-MM-dd"
        )}`;

        window.open(url, "_blank", "noopener,noreferrer");
    };

    const isMancataTimbratura = (
        dataTurno: Date | undefined,
        oraInizio: string
    ): boolean => {
        if (!dataTurno || !oraInizio) return false;

        // Copia la dataTurno per non modificarla
        const turnoDate = new Date(dataTurno);

        // Split oraInizio "HH:mm"
        const [oreStr, minutiStr] = oraInizio.split(":");
        const ore = parseInt(oreStr, 10);
        const minuti = parseInt(minutiStr, 10);

        // Imposta ore e minuti
        turnoDate.setHours(ore, minuti, 0, 0);

        // Confronto con ora attuale
        return turnoDate < new Date();
    };

    return (
        <section className="m-6">
            <div className="mb-8">
                <div className="text-3xl font-extrabold text-[#007a55] mb-4">
                    PLANNING TURNI
                </div>
            </div>

            <div className="flex items-center bg-[#ecf3f1] mb-1">
                <div className="flex items-center bg-[#ecf3f1] p-4 mb-1">
                    <div>
                        <Input
                            type="text"
                            placeholder="Ricerca per keyword"
                            value={filtriRicerca?.ricercaKeyword}
                            onChange={(e) => setRicercaKeyword(e.target.value)}
                            className="border border-gray-300 rounded-l-md px-2 py-1 w-48 bg-white rounded-r-none"
                        />
                    </div>
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full rounded-none">
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
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full rounded-none">
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
                        <Button
                            className="bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer rounded-r-full rounded-l-none -ml-px"
                            onClick={() => {
                                if (filtriRicerca) {
                                    caricaTurni(filtriRicerca)
                                }
                            }}
                        >
                            Filtra
                        </Button>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div>
                        <Button
                            onClick={() => handleGiornoClick(0)}
                            className="w-[70px] rounded-[18px] border border-[#007a55] bg-[#f3fffa] text-[#007a55] text-[16px] font-bold hover:bg-[#e6fff5] cursor-pointer">
                            Oggi
                        </Button>
                    </div>

                    <div>
                        <Button onClick={() => handleGiornoClick(+1)}
                            className="w-[70px] rounded-[18px] border border-[#007a55] bg-white text-[#007a55] text-[16px] font-bold hover:bg-[#f3fffa] cursor-pointer">
                            Domani
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-4 ml-auto">

                    <Button className="rounded-[18px] bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer  pl-8 pr-8"
                        onClick={handleExportToExcel}>
                        Scarica .csv
                    </Button>

                </div>
            </div>
            <div className="border rounded-md p-4 bg-gray-50">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>
                                Ora inizio
                            </TableHead>
                            <TableHead>
                                Ora fine
                            </TableHead>
                            <TableHead>
                                Operatore
                            </TableHead>
                            <TableHead>
                                Mansione
                            </TableHead>
                            <TableHead>
                                Tipo Turno
                            </TableHead>
                            <TableHead>
                                Pausa h.
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {turni.map((turno, index) => {
                            const prevTurno = turni[index - 1];

                            const isNewDate =
                                index === 0 ||
                                (prevTurno?.dataTurno &&
                                    turno.dataTurno &&
                                    format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") !==
                                    format(new Date(turno.dataTurno), "yyyy-MM-dd"));

                            const isNewEvento =
                                prevTurno &&
                                turno.dataTurno &&
                                prevTurno.dataTurno &&
                                format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") ===
                                format(new Date(turno.dataTurno), "yyyy-MM-dd") &&
                                prevTurno.nomeEvento !== turno.nomeEvento;

                            return (
                                <React.Fragment key={index}>

                                    {/* separatore cambio data */}
                                    {isNewDate && (
                                        <TableRow >

                                            <TableCell colSpan={6} className="bg-[#007a55] text-white">
                                                <div className="flex justify-between">
                                                    <span className="w-[10%] font-bold">
                                                        {turno.dataTurno
                                                            ? format(new Date(turno.dataTurno), "dd/MM/yyyy")
                                                            : ""}
                                                    </span>

                                                    <span className=" w-[45%] uppercase font-bold">
                                                        {(turno.nomeEvento && turno.nomeEvento.trim() !== ''
                                                            ? turno.nomeEvento
                                                            : `${turno.nomeBrand ?? ''} - ${turno.ragioneSociale ?? ''}`
                                                        ).toUpperCase()}
                                                    </span>

                                                    <span className="w-[45%] text-right">{turno.via}</span>
                                                </div>
                                            </TableCell>

                                        </TableRow>
                                    )}

                                    {/* separatore cambio evento stessa data */}
                                    {!isNewDate && isNewEvento && (
                                        <TableRow >
                                            <TableCell colSpan={6} className="bg-[#8f8f8f] text-white">
                                                <div className="flex justify-between">
                                                    <span className="w-[10%] font-bold">
                                                        {turno.dataTurno
                                                            ? format(new Date(turno.dataTurno), "dd/MM/yyyy")
                                                            : ""}
                                                    </span>
                                                    <span className="w-[45%] uppercase font-bold">
                                                        {(turno.nomeEvento && turno.nomeEvento.trim() !== ''
                                                            ? turno.nomeEvento
                                                            : `${turno.nomeBrand ?? ''} - ${turno.ragioneSociale ?? ''}`
                                                        ).toUpperCase()}
                                                    </span>
                                                    <span className="w-[45%] text-right">{turno.via}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}

                                    <TableRow onClick={() => navigaSuSingoloEvento(turno.idEvento, turno.dataTurno)}
                                        style={{ cursor: "pointer" }}>

                                        <TableCell>{turno.oraInizio}</TableCell>

                                        <TableCell>{turno.oraFine}</TableCell>

                                        <TableCell style={{ display: "flex", alignItems: "center" }}>
                                            <Circle
                                                size={10}
                                                strokeWidth={0}
                                                fill={
                                                    turno.idCheckInCheckOut !== null
                                                        ? "#00D68E"
                                                        : isMancataTimbratura(turno.dataTurno, turno.oraInizio)
                                                            ? "red"
                                                            : "#B8B8B8"
                                                }
                                                color={
                                                    turno.idCheckInCheckOut !== null
                                                        ? "#00D68E"
                                                        : isMancataTimbratura(turno.dataTurno, turno.oraInizio)
                                                            ? "#EA6B62"
                                                            : "#B8B8B8"
                                                }
                                                style={{ marginRight: 8 }}
                                            />

                                            {turno.operatore}
                                        </TableCell>

                                        <TableCell>{turno.tipoMansione}</TableCell>

                                        <TableCell>{turno.tipologiaTurno}</TableCell>

                                        <TableCell>{turno.orePausa}</TableCell>
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

export default turni