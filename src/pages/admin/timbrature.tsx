import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { format, differenceInSeconds } from "date-fns";
import { ExternalLink } from "lucide-react";
import type { CheckInCheckOut } from "@/type/CheckInCheckOut";
import { CreaTimbraturaDialog } from "./dialog/creaTimbraturaDialog";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, CalendarIcon } from "lucide-react";
import type { Dipendente } from "@/entity";
import * as XLSX from "xlsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";

type FormDatiTimbratura = {
    dataCheckIn: Date | undefined;
    oraCheckIn: string;
    dataCheckOut: Date | undefined;
    oraCheckOut: string;
    creaTimbratura: boolean;
    idCheckIn: number | undefined;
    idCheckOut: number | undefined;
};

type FiltriRicerca = {
    dataInizio: Date | undefined
    dataFine: Date | undefined
}

const headers = [
    "Data Check-In",
    "Posizione Check-In",
    "Data Check-Out",
    "Posizione Check-Out",
    "Titolo Evento",
    "Ore lavorate",
    "Funzioni"
];

const Timbrature = () => {
    const { id } = useParams();
    const idOperatore = id ?? "";

    const [checkInCheckOut, setCheckInCheckOut] = useState<CheckInCheckOut[]>([]);
    const [dipendente, setDipendente] = useState<Dipendente>();

    const [timbraturaDialogOpen, setTimbraturaDialogOpen] = useState(false);

    const [formDatiTimbratura, setFormDatiTimbratura] = useState<FormDatiTimbratura>({
        dataCheckIn: undefined,
        oraCheckIn: "",
        dataCheckOut: undefined,
        oraCheckOut: "",
        creaTimbratura: true,
        idCheckIn: undefined,
        idCheckOut: undefined,
    });
    const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();

    useEffect(() => {
        const filtriRicerca: FiltriRicerca = {
            dataInizio: new Date(),
            dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
        setFiltriRicerca(filtriRicerca);
        getOperatore();
        caricaCheckInCheckOut(filtriRicerca.dataInizio, filtriRicerca.dataFine);
    }, []);

    const getOperatore = async () => {
        const resp = await fetch(ezystaffBEUrl + `operatori/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setDipendente(data);
        console.log(dipendente);
    }

    const caricaCheckInCheckOut = async (dataInizo: Date | undefined, dataFine: Date | undefined) => {

        const dataInizioStr = formatDateToYYYYMMDD(dataInizo);
        const dataFineStr = formatDateToYYYYMMDD(dataFine);

        const queryParams = new URLSearchParams();
        if (dataInizioStr) { queryParams.append("dataInizio", dataInizioStr) };
        if (dataFineStr) { queryParams.append("dataFine", dataFineStr) };

        const url = `${ezystaffBEUrl}operatori/checkInCheckOut/${idOperatore}?${queryParams.toString()}`;

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
            console.log(data);
            setCheckInCheckOut(data);
        } catch (err) {
            console.error("Errore durante il fetch delle timbrature:", err);
        }
    };

    const openGoogleMaps = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    /*
    const openGoogleMaps2  = async (lat: number, lng: number) => {

        import.meta.env.VITE_GOOGLE_MAPS_API_KEY

        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${import.meta.env.VITE_GOOGLE_API_KEY}`
          );
          
          const data = await response.json();
          console.log(data);
          
        //  console.log(data.results[0].formatted_address);

    }
        */

    const getHMSDifference = (start: Date, end: Date): string => {
        const totalSeconds = Math.abs(differenceInSeconds(end, start));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const formatNumber = (n: number) => String(n).padStart(2, '0');
        return `${formatNumber(hours)}:${formatNumber(minutes)}:${formatNumber(seconds)}`;
    };

    // Funzione per calcolare il totale delle ore lavorate
    const getTotalHours = (records: typeof checkInCheckOut): string => {
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

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mesi 0-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };

    function creaDataOra(data: Date, ora: string): Date {
        const [hours, minutes] = ora.split(":");

        return new Date(
            data.getFullYear(),
            data.getMonth(),
            data.getDate(),
            Number(hours),
            Number(minutes)
        );
    }

    const inserisciTimbratura = async (e: React.FormEvent) => {
        e.preventDefault();


        if (!formDatiTimbratura.dataCheckIn) {
            alert("Data check-in obbligatoria");
            return;
        }

        if (formDatiTimbratura.oraCheckIn.trim() === "") {
            alert("Ora check-in obbligatoria");
            return;
        }

        const now = new Date();

        // controllo data/ora futura
        const dataOraCheckIn = creaDataOra(
            formDatiTimbratura.dataCheckIn,
            formDatiTimbratura.oraCheckIn
        );


        if (dataOraCheckIn > now) {
            alert("Il check-in non può essere nel futuro");
            return;
        }

        // Check-out: entrambi o nessuno
        const soloUnoDeiDueCheckOutCompilato =
            (formDatiTimbratura.dataCheckOut && !formDatiTimbratura.oraCheckOut.trim()) ||
            (!formDatiTimbratura.dataCheckOut && formDatiTimbratura.oraCheckOut.trim());

        if (soloUnoDeiDueCheckOutCompilato) {
            alert("Data e ora check-out devono essere o entrambi valorizzati o entrambi vuoti.");
            return;
        }

        // nuovo controllo: check-out non nel futuro
        if (formDatiTimbratura.dataCheckOut && formDatiTimbratura.oraCheckOut.trim()) {
            const dataOraCheckOut = creaDataOra(
                formDatiTimbratura.dataCheckOut,
                formDatiTimbratura.oraCheckOut
            );

            if (dataOraCheckOut > now) {
                alert("Il check-out non può essere nel futuro");
                return;
            }
        }


        const creazioneTimbratura = {
            ...formDatiTimbratura,
            dataCheckIn: formatDateToYYYYMMDD(formDatiTimbratura.dataCheckIn),
            dataCheckOut: formatDateToYYYYMMDD(formDatiTimbratura.dataCheckOut),
            idOperatore: idOperatore
        };

        console.log("creazioneTimbratura: " + JSON.stringify(creazioneTimbratura));

        if (creazioneTimbratura.creaTimbratura) {
            const resp = await fetch(ezystaffBEUrl + 'operatori/recuperoTimbratura', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                },
                method: "POST",
                credentials: 'include',
                body: JSON.stringify(creazioneTimbratura)
            });
            const data = await resp.json();
            console.log(data);
        } else {
            const resp = await fetch(ezystaffBEUrl + 'operatori/recuperoTimbratura', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                },
                method: "PATCH",
                credentials: 'include',
                body: JSON.stringify(creazioneTimbratura)
            });
            const data = await resp.json();
            console.log(data);
        }

        caricaCheckInCheckOut(filtriRicerca?.dataInizio, filtriRicerca?.dataFine);
        setTimbraturaDialogOpen(false);
    }

    const creaTimbratura = () => {

        setFormDatiTimbratura({
            dataCheckIn: undefined,
            oraCheckIn: "",
            dataCheckOut: undefined,
            oraCheckOut: "",
            creaTimbratura: true,
            idCheckIn: undefined,
            idCheckOut: undefined,
        });


        setTimbraturaDialogOpen(true);
    };

    const modificaTimbratura = (idCheckIn: number) => {

        const checkInCheckOutSelected = checkInCheckOut.find((check) => check.idCheckIn === idCheckIn);

        console.log("checkInCheckOutSelected " + JSON.stringify(checkInCheckOutSelected));
        console.log("checkInCheckOutSelected?.dataInserimentoCheckIn: " + checkInCheckOutSelected?.dataInserimentoCheckIn)

        if (checkInCheckOutSelected?.dataInserimentoCheckIn) {

            const dataCheckIn = checkInCheckOutSelected?.dataInserimentoCheckIn
                ? new Date(checkInCheckOutSelected.dataInserimentoCheckIn)
                : undefined;

            const oraCheckIn = new Date(checkInCheckOutSelected?.dataInserimentoCheckIn)
                .toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

            const dataCheckOut = checkInCheckOutSelected?.dataInserimentoCheckOut
                ? new Date(checkInCheckOutSelected.dataInserimentoCheckOut)
                : undefined;

            let oraCheckOut = "";

            if (checkInCheckOutSelected?.dataInserimentoCheckOut) {
                oraCheckOut = new Date(checkInCheckOutSelected.dataInserimentoCheckOut).toLocaleTimeString("it-IT", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });
            }

            console.log("checkInCheckOutSelected?.dataInserimentoCheckOut: ", checkInCheckOutSelected?.dataInserimentoCheckOut);
            console.log("Ora:", oraCheckOut);   // ➜ 13:45


            setFormDatiTimbratura({
                dataCheckIn: dataCheckIn,
                oraCheckIn: oraCheckIn,
                dataCheckOut: dataCheckOut,
                oraCheckOut: oraCheckOut,
                creaTimbratura: false,
                idCheckIn: checkInCheckOutSelected.idCheckIn,
                idCheckOut: checkInCheckOutSelected.idCheckOut
            });

        }

        setTimbraturaDialogOpen(true);
    };

    const handleTimbratura = async (idCheckIn: number) => {
        const conferma = window.confirm("Sei sicuro di voler eliminare questa timbratura?");

        if (!conferma) return;

        await eliminaTimbratura(idCheckIn);
    };

    const eliminaTimbratura = async (idCheckIn: number) => {

        const resp = await fetch(ezystaffBEUrl + `operatori/eliminaTimbratura/${idCheckIn}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "DELETE",
            credentials: 'include',
        });
        const data = await resp.json();
        console.log(data);

        caricaCheckInCheckOut(filtriRicerca?.dataInizio, filtriRicerca?.dataFine);

    }

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

    const handleExportToExcel = () => {
        const dataToExport = checkInCheckOut.map((singoloCheck) => ({
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
                <div className="text-[#5e5d5d] text-[32px] font-extrabold mb-2">
                    RIEPILOGO PRESENZE
                </div>
                <div className="text-[#007a55] text-[32px] font-extrabold mb-4">
                    {dipendente?.nome} {dipendente?.cognome}
                </div>
                <div className="flex items-center gap-4">
                    <div>
                        <Button onClick={handleExportToExcel}
                            className="rounded-[18px] bg-[#007a55] text-white text-[18px] !font-bold hover:bg-[#009e6d] transition-colors cursor-pointer">
                            SCARICA CSV
                        </Button>
                    </div>
                    <div>
                        <Button onClick={() => creaTimbratura()}
                            className="rounded-[18px] bg-[#007a55] text-white text-[18px] !font-bold hover:bg-[#009e6d] transition-colors cursor-pointer"
                        >
                            INSERISCI TIMBRATURA
                        </Button>

                        <CreaTimbraturaDialog
                            open={timbraturaDialogOpen}
                            setOpen={setTimbraturaDialogOpen}
                            formDatiTimbratura={formDatiTimbratura}
                            setFormDatiTimbratura={setFormDatiTimbratura}
                            onSubmit={inserisciTimbratura}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-4 bg-[#f0f0f0] p-4 mb-1">
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full">
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
                                <Button variant="outline" className="w-full">
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
                            onClick={() =>
                                caricaCheckInCheckOut(filtriRicerca?.dataInizio, filtriRicerca?.dataFine)
                            }
                        >
                            Cerca
                        </Button>
                    </div>

                    <div className="ml-auto text-[#5e8a7a] text-[24px] font-extrabold">
                        Totale ore lavorate: {getTotalHours(checkInCheckOut)}
                    </div>
                </div>

                <div>
                    <Table>
                        <TableHeader className="bg-[#ecf3f1]">
                            <TableRow>
                                {headers.map((title, index) => (
                                    <TableHead key={index} className="text-[16px] font-bold text-[#656565]">
                                        {title}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {checkInCheckOut.map((singoloCheck, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        {format(new Date(singoloCheck.dataInserimentoCheckIn), "dd/MM/yyyy - HH:mm:ss")}
                                    </TableCell>
                                    <TableCell>
                                        <Button variant={"ghost"}
                                            className="flex items-center text-blue-500 hover:underline"
                                            onClick={() =>
                                                openGoogleMaps(singoloCheck.latitudineCheckIn, singoloCheck.longitudineCheckIn)
                                            }
                                        >
                                            Vedi mappa <ExternalLink className="h-3 w-3 ml-1" />
                                        </Button>
                                    </TableCell>
                                    <TableCell>
                                        {singoloCheck.dataInserimentoCheckOut
                                            ? format(new Date(singoloCheck.dataInserimentoCheckOut), "dd/MM/yyyy - HH:mm:ss")
                                            : "In attesa di checkout"}
                                    </TableCell>
                                    <TableCell>
                                        {singoloCheck.latitudineCheckOut ? (
                                            <Button variant={"ghost"}
                                                className="flex items-center text-blue-500 hover:underline"
                                                onClick={() =>
                                                    openGoogleMaps(singoloCheck.latitudineCheckOut, singoloCheck.longitudineCheckOut)
                                                }
                                            >
                                                Vedi mappa <ExternalLink className="h-3 w-3 ml-1" />
                                            </Button>
                                        ) : (
                                            "In attesa di checkout"
                                        )}
                                    </TableCell>
                                    <TableCell>{singoloCheck.eventoAssociato}</TableCell>
                                    <TableCell>
                                        {singoloCheck.dataInserimentoCheckOut
                                            ? getHMSDifference(
                                                new Date(singoloCheck.dataInserimentoCheckOut),
                                                new Date(singoloCheck.dataInserimentoCheckIn)
                                            )
                                            : "In attesa di checkout"}
                                    </TableCell>
                                    <TableCell>
                                        <Button onClick={() => modificaTimbratura(singoloCheck.idCheckIn)} variant="ghost" className="cursor-pointer">
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button onClick={() => handleTimbratura(singoloCheck.idCheckIn)} variant="ghost" className="cursor-pointer">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </section>
    );
};

export default Timbrature;
