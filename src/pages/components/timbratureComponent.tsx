
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { format, differenceInSeconds } from "date-fns";
import { ExternalLink } from "lucide-react";
import type { CheckInCheckOut } from "@/type/CheckInCheckOut";
import { MapPin, CalendarDays, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";

type PresenzeProps = {
    idOperatore: string
}

type FiltriRicerca = {
    dataInizio: Date | undefined
    dataFine: Date | undefined
}

export const TimbratureComponent = ({ idOperatore }: PresenzeProps) => {


    const [checkInCheckOut, setCheckInCheckOut] = useState<CheckInCheckOut[]>([]);
    const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();

    useEffect(() => {
        const filtriRicerca: FiltriRicerca = {
            dataInizio: new Date(),
            dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
        setFiltriRicerca(filtriRicerca);
        caricaCheckInCheckOut(filtriRicerca.dataInizio, filtriRicerca.dataFine);
    }, [])


    const openGoogleMaps = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    const getHMSDifference = (start: Date, end: Date): string => {
        const totalSeconds = Math.abs(differenceInSeconds(end, start));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const format = (n: number) => String(n).padStart(2, '0');

        return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
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

    return (

        <section className="m-3">
            <div className="text-[36px] font-extrabold text-[#007a55] pb-2">
                Presenze
            </div>

            <div className="flex items-center gap-4 p-4 mb-1">
                <div className="flex flex-col">
                <span className="text-[22px] font-normal text-[#5e5d5d] mb-1">Periodo da:</span>
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
                <div className="flex flex-col">
                    <span className="text-[22px] font-normal text-[#5e5d5d] mb-1">a:</span>
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

            </div>
            <div className="flex justify-center mb-4">
                <Button
                    className="w-[90%] rounded-[8px] bg-[#007a55] text-[21px] font-bold text-white"
                    onClick={() =>
                        caricaCheckInCheckOut(filtriRicerca?.dataInizio, filtriRicerca?.dataFine)
                    }
                >
                    FILTRA
                </Button>
            </div>

            {checkInCheckOut.map((singoloCheck) => (
                <>
                    <Card className="shadow-lg w-full mx-auto border-[#72ad97] mb-4 p-0">

                        <CardContent className="p-0">
                            <div className="p-4">
                                <div>
                                    <span className="text-[#5e5d5d] text-[24px] font-bold">Check-in</span>
                                </div>

                                <div className="flex items-center gap-2 pb-4">
                                    <CalendarDays className="h-6 w-6 text-[#007a55]" />
                                    <span className="text-[22px] font-normal text-[#5e5d5d]">
                                        {format(new Date(singoloCheck.dataInserimentoCheckIn), "dd/MM/yyyy")}
                                    </span>
                                    <Clock className="h-6 w-6 ml-4 text-[#007a55]" />
                                    <span className="text-[22px] font-normal text-[#5e5d5d]">
                                        {format(new Date(singoloCheck.dataInserimentoCheckIn), "HH:mm:ss")}
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 pb-4">
                                    <MapPin className="h-6 w-6 text-[#007a55]" />
                                    <button
                                        className="flex items-center text-blue-500 hover:underline"
                                        onClick={() => openGoogleMaps(
                                            singoloCheck.latitudineCheckIn,
                                            singoloCheck.longitudineCheckIn
                                        )}
                                    >
                                        Posizione check-in <ExternalLink className="h-3 w-3 ml-1" />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-[#fff7f7] p-4">
                                <div>
                                    <span className="text-[#5e5d5d] text-[24px] font-bold">Check-out</span>
                                </div>

                                <div className="flex items-center gap-2 pb-4">
                                    <CalendarDays className="h-6 w-6 text-[#007a55]" />
                                    <span className="text-[22px] font-normal text-[#5e5d5d]">
                                        {singoloCheck.dataInserimentoCheckOut ?
                                            (<>{format(new Date(singoloCheck.dataInserimentoCheckOut), "dd/MM/yyyy")}</>)
                                            :
                                            (<>{"—/—/—"}</>)
                                        }
                                    </span>
                                    <Clock className="h-6 w-6 ml-4 text-[#007a55]" />
                                    <span className="text-[22px] font-normal text-[#5e5d5d]">
                                        {singoloCheck.dataInserimentoCheckOut ?
                                            (<>{format(new Date(singoloCheck.dataInserimentoCheckOut), "HH:mm:ss")}</>)
                                            :
                                            (<>{"In attesa"}</>)
                                        }
                                    </span>
                                </div>

                                <div className="flex items-center gap-2 pb-4">
                                    <MapPin className="h-6 w-6 text-[#007a55]" />
                                    {singoloCheck.latitudineCheckOut ?
                                        (<>
                                            <button
                                                className="flex items-center text-blue-500 hover:underline"
                                                onClick={() => openGoogleMaps(
                                                    singoloCheck.latitudineCheckOut,
                                                    singoloCheck.longitudineCheckOut
                                                )}
                                            >
                                                Posizione check-out <ExternalLink className="h-3 w-3 ml-1" />
                                            </button>
                                        </>)
                                        :
                                        (<>{"In attesa"}</>)
                                    }
                                </div>
                            </div>

                            <div className="bg-[#72ad97] p-4 text-white rounded-b-[9px]">
                                {singoloCheck.dataInserimentoCheckOut ?
                                    (<>{
                                        `Ore lavorate: ${getHMSDifference(
                                            new Date(singoloCheck.dataInserimentoCheckOut),
                                            new Date(singoloCheck.dataInserimentoCheckIn)
                                        )} h.`
                                    }</>)
                                    :
                                    (<>{"Ore lavorate: -- -- h."}</>)
                                }
                            </div>

                        </CardContent>
                    </Card>

                </>
            ))}

        </section>
    )

}