import { ezystaffBEUrl } from "@/utils/baseUrl";
import { useEffect, useState } from "react";
import { format, differenceInSeconds } from "date-fns";
import type { CheckInCheckOut } from "@/type/CheckInCheckOut";
import { CalendarDays, CalendarIcon, Clock3, ExternalLink, MapPin, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";

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
        const filtri: FiltriRicerca = {
            dataInizio: new Date(),
            dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
        setFiltriRicerca(filtri);
        caricaCheckInCheckOut(filtri.dataInizio, filtri.dataFine);
    }, [])

    const openGoogleMaps = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    };

    const getHMSDifference = (start: Date, end: Date): string => {
        const totalSeconds = Math.abs(differenceInSeconds(end, start));
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const pad = (n: number) => String(n).padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    const setDataInizio = (date: Date | undefined) => {
        setFiltriRicerca((prev) => prev ? { ...prev, dataInizio: date } : undefined);
    };

    const setDataFine = (date: Date | undefined) => {
        setFiltriRicerca((prev) => prev ? { ...prev, dataFine: date } : undefined);
    };

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const caricaCheckInCheckOut = async (dataInizio: Date | undefined, dataFine: Date | undefined) => {
        const dataInizioStr = formatDateToYYYYMMDD(dataInizio);
        const dataFineStr = formatDateToYYYYMMDD(dataFine);
        const queryParams = new URLSearchParams();
        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
        if (dataFineStr) queryParams.append("dataFine", dataFineStr);

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
            setCheckInCheckOut(data);
        } catch (err) {
            console.error("Errore durante il fetch delle timbrature:", err);
        }
    };

    const DatePicker = ({ label, value, onSelect }: { label: string, value: Date | undefined, onSelect: (date: Date | undefined) => void }) => (
        <div className="flex-1">
            <div className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#7895a3]">{label}</div>
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="h-11 w-full justify-between rounded-xl border-[#29495b] bg-[#0b202e] px-3 text-sm font-semibold text-[#d6e2e8] hover:bg-[#102a39] hover:text-white">
                        {value ? value.toLocaleDateString('it-IT') : 'Seleziona'}
                        <CalendarIcon className="h-4 w-4 text-[#08efbd]" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto border-[#29495b] bg-[#0b202e] p-0 text-white" align="start">
                    <Calendar
                        mode="single"
                        selected={value}
                        onSelect={onSelect}
                        locale={it}
                        className="pointer-events-auto"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );

    return (
        <section className="min-h-screen bg-[#031522] px-4 pb-14 pt-2 text-white sm:px-5">
            <div className="mx-auto w-full max-w-[430px]">
                <h1 className="mb-4 text-[26px] font-black tracking-[-0.02em] text-[#08f0bd]">Presenze</h1>

                <div className="mb-4 rounded-2xl border border-[#214253] bg-[#071f2c] p-4">
                    <div className="flex gap-2.5">
                        <DatePicker label="Da" value={filtriRicerca?.dataInizio} onSelect={setDataInizio} />
                        <DatePicker label="A" value={filtriRicerca?.dataFine} onSelect={setDataFine} />
                    </div>
                    <Button
                        className="mt-3 h-11 w-full rounded-xl bg-[#08e8b6] text-[13px] font-black text-[#032219] hover:bg-[#18f2c2]"
                        onClick={() => caricaCheckInCheckOut(filtriRicerca?.dataInizio, filtriRicerca?.dataFine)}
                    >
                        <Search className="mr-2 h-4 w-4" /> Filtra presenze
                    </Button>
                </div>

                <div className="space-y-4">
                    {checkInCheckOut.map((singoloCheck, index) => (
                        <article key={index} className="overflow-hidden rounded-2xl border border-[#315467] bg-[#102537] shadow-[0_16px_40px_rgba(0,0,0,0.18)]">
                            <div className="border-b border-[#29495b] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="rounded-full border border-[#08dba8]/60 bg-[#07372f] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.05em] text-[#08efbd]">Check-in</span>
                                    <span className="text-[12px] text-[#7895a3]">Ingresso</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-[13px] text-[#d6e2e8]">
                                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#08efbd]" /> {format(new Date(singoloCheck.dataInserimentoCheckIn), "dd/MM/yyyy")}</div>
                                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#08efbd]" /> {format(new Date(singoloCheck.dataInserimentoCheckIn), "HH:mm:ss")}</div>
                                </div>
                                <button
                                    className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#9ed0dd] underline decoration-[#4f7a88] underline-offset-4"
                                    onClick={() => openGoogleMaps(singoloCheck.latitudineCheckIn, singoloCheck.longitudineCheckIn)}
                                >
                                    <MapPin className="h-4 w-4" /> Posizione check-in <ExternalLink className="h-3 w-3" />
                                </button>
                            </div>

                            <div className="border-b border-[#29495b] bg-[#0c202d] p-4">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="rounded-full border border-[#5a8dff]/60 bg-[#162744] px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.05em] text-[#8fb2ff]">Check-out</span>
                                    <span className="text-[12px] text-[#7895a3]">Uscita</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-[13px] text-[#d6e2e8]">
                                    <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-[#8fb2ff]" /> {singoloCheck.dataInserimentoCheckOut ? format(new Date(singoloCheck.dataInserimentoCheckOut), "dd/MM/yyyy") : '—/—/—'}</div>
                                    <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#8fb2ff]" /> {singoloCheck.dataInserimentoCheckOut ? format(new Date(singoloCheck.dataInserimentoCheckOut), "HH:mm:ss") : 'In attesa'}</div>
                                </div>
                                {singoloCheck.latitudineCheckOut ? (
                                    <button
                                        className="mt-3 flex items-center gap-2 text-[12px] font-semibold text-[#9ed0dd] underline decoration-[#4f7a88] underline-offset-4"
                                        onClick={() => openGoogleMaps(singoloCheck.latitudineCheckOut, singoloCheck.longitudineCheckOut)}
                                    >
                                        <MapPin className="h-4 w-4" /> Posizione check-out <ExternalLink className="h-3 w-3" />
                                    </button>
                                ) : (
                                    <div className="mt-3 text-[12px] text-[#7895a3]">Check-out non ancora registrato</div>
                                )}
                            </div>

                            <div className="flex items-center justify-between bg-[#0a3b35] px-4 py-3">
                                <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#9bc7bd]">Ore lavorate</span>
                                <span className="text-[18px] font-black text-[#08efbd]">
                                    {singoloCheck.dataInserimentoCheckOut
                                        ? `${getHMSDifference(new Date(singoloCheck.dataInserimentoCheckOut), new Date(singoloCheck.dataInserimentoCheckIn))} h`
                                        : '--:--:-- h'}
                                </span>
                            </div>
                        </article>
                    ))}

                    {checkInCheckOut.length === 0 && (
                        <div className="rounded-2xl border border-[#315467] bg-[#0b202e] px-4 py-10 text-center text-sm text-[#7892a0]">
                            Nessuna presenza nel periodo selezionato.
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}