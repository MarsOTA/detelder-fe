import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { CirclePause, StickyNote, ChevronsUpDown, Clock3, Paintbrush } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from "@/components/ui/command";
import DetelderDateRangePicker from "@/components/filters/DateRangePicker";
import type { DateRange } from "react-day-picker";

type FiltriRicerca = {
    statoElaborazione?: string;
    nomeEvento?: string;
    operatore?: string;
    idOperatore?: number;
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

type Evento = {
    idEvento: number
    nomeEvento: string;
}

type Operatore = {
    idOperatore: number
    operatore: string;
}

const payroll = () => {

    const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();
    const [turni, setTurni] = useState<TurnoCompleto[]>([]);
    const [comboEventi, setComboEventi] = useState<Evento[]>([]);
    const [comboOperatori, setComboOperatori] = useState<Operatore[]>([]);
    const [ricercaEvento, setRicercaEvento] = useState("");
    const [ricercaOperatore, setRicercaOperatore] = useState("");
    const [filtroSelezionato, setFiltroSelezionato] = useState<string | null>(null);
    const [filtroDataSelezionato, setFiltroDataSelezionato] = useState<string | null>(null);


    useEffect(() => {

        resetFiltriRicerca();

    }, []);

    const resetFiltriRicerca = () => {
        const filtriRicerca: FiltriRicerca = {
            //  dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)),

            dataInizio: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            dataFine: new Date(),

        }
        setFiltriRicerca(filtriRicerca);
        cercaComboEventi();
        cercaComboOperatori();
        caricaPayroll(filtriRicerca);
        setFiltroSelezionato(null);
        setFiltroDataSelezionato(null);
    }

    /*
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
    */

    const setNomeEvento = (nomeEvento: string) => {
        setFiltriRicerca((prev) => {
            if (!prev) return undefined;

            return {
                ...prev,
                nomeEvento: nomeEvento,
            };
        });
    };

    const setIdOperatore = (idOperatore: number, operatore: string) => {   
        setFiltriRicerca((prev) => {
            if (!prev) return undefined;

            return {
                ...prev,
                idOperatore: idOperatore,
                operatore: operatore
            };
        });
    };

    const salvaPayroll = async (idTurno: number) => {
        const turno = turni.find(t => t.idTurno === idTurno);
        console.log("turno: ", turno);

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

        console.log(payrollForm);

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
        const data = await resp.json();
        console.log(data);

        if (filtriRicerca) {
            caricaPayroll(filtriRicerca);
        }

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
        const data = await resp.json();
        console.log(data);

        if (filtriRicerca) {
            caricaPayroll(filtriRicerca);
        }
    }

    const modificaPayroll = async (idTurno: number, stato: string) => {

        const turno = turni.find(t => t.idTurno === idTurno);
        console.log("turno: ", turno);

        if (!turno) {
            console.error("Turno non trovato");
            return;
        }

        const body = {
            oraInizioDefinitivo: turno.oraInizioDefinitivo,
            oraFineDefinitivo: turno.oraFineDefinitivo,
            orePausaDefinitivo: turno.orePausaDefinitiva,
            stato: stato
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
        const data = await resp.json();
        console.log(data);

        if (filtriRicerca) {
            caricaPayroll(filtriRicerca);
        }
    }

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mesi 0-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };


    const determinaPeriodo = (
        dataInizio: Date | undefined,
        dataFine: Date | undefined
    ): "giorno" | "settimana" | "mese" | null => {


        if (!dataInizio || !dataFine) {
            return null;
        }

        // Giorno
        const giorno = new Date(dataFine);
        giorno.setDate(giorno.getDate() - 1);

        if (
            dataInizio.getFullYear() === giorno.getFullYear() &&
            dataInizio.getMonth() === giorno.getMonth() &&
            dataInizio.getDate() === giorno.getDate()
        ) {
            return "giorno";
        }

        // Settimana
        const settimana = new Date(dataFine);
        settimana.setDate(settimana.getDate() - 7);

        if (
            dataInizio.getFullYear() === settimana.getFullYear() &&
            dataInizio.getMonth() === settimana.getMonth() &&
            dataInizio.getDate() === settimana.getDate()
        ) {
            return "settimana";
        }

        // Mese
        const mese = new Date(dataFine);
        mese.setMonth(mese.getMonth() - 1);

        if (
            dataInizio.getFullYear() === mese.getFullYear() &&
            dataInizio.getMonth() === mese.getMonth() &&
            dataInizio.getDate() === mese.getDate()
        ) {
            return "mese";
        }

        return null;

    };


    const caricaPayroll = async (filtri: FiltriRicerca) => {
        const dataInizioStr = formatDateToYYYYMMDD(filtri.dataInizio);
        const dataFineStr = formatDateToYYYYMMDD(filtri.dataFine);
        const statoElaborazione = filtri.statoElaborazione?.trim();
        const nomeEvento = filtri.nomeEvento?.trim();
        const idOperatore = filtri.idOperatore;

        const queryParams = new URLSearchParams();

        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
        if (dataFineStr) queryParams.append("dataFine", dataFineStr);
        if (statoElaborazione) queryParams.append("statoElaborazione", statoElaborazione);
        if (nomeEvento) queryParams.append("nomeEvento", nomeEvento);
        if (idOperatore) queryParams.append("idOperatore", idOperatore.toString());

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
        console.log(data);
        setTurni(data);
        setFiltroDataSelezionato(determinaPeriodo(filtri.dataInizio, filtri.dataFine));

    }

    const cercaComboEventi = async () => {
        const resp = await fetch(ezystaffBEUrl + 'eventi/comboEventi', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setComboEventi(data);
    }

    const cercaComboOperatori = async () => {
        const resp = await fetch(ezystaffBEUrl + 'operatori/comboOperatori', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setComboOperatori(data);
    }

    const calcolaTotaleOre = (
        oraInizio: string,
        oraFine: string,
        oraPausa: number = 0
    ): string => {
        if (!oraInizio || !oraFine) {
            return "00:00";
        }

        const [h1, m1] = oraInizio.split(":").map(Number);
        const [h2, m2] = oraFine.split(":").map(Number);

        const inizio = h1 * 60 + m1;
        let fine = h2 * 60 + m2;

        // Se fine < inizio → turno nel giorno successivo
        if (fine < inizio) {
            fine += 24 * 60;
        }

        // Minuti lavorati al netto della pausa
        const minutiLavorati = fine - inizio - (oraPausa * 60);

        const ore = Math.floor(minutiLavorati / 60);
        const minuti = minutiLavorati % 60;

        return [
            String(ore).padStart(2, "0"),
            String(minuti).padStart(2, "0"),
        ].join(":");
    };

    const calcolaTotaleOreTurni = (
        turni: TurnoCompleto[]
    ): { ore: number; minuti: number } => {
        let totaleMinuti = 0;

        turni.forEach((turno) => {
            const {
                oraInizioDefinitivo,
                oraFineDefinitivo,
                orePausaDefinitiva
            } = turno;

            if (!oraInizioDefinitivo || !oraFineDefinitivo) {
                return;
            }

            const [h1, m1] = oraInizioDefinitivo.split(":").map(Number);
            const [h2, m2] = oraFineDefinitivo.split(":").map(Number);

            const inizio = h1 * 60 + m1;
            let fine = h2 * 60 + m2;

            // Turno che termina il giorno successivo
            if (fine < inizio) {
                fine += 24 * 60;
            }

            // Sottraggo la pausa
            const minutiLavorati =
                fine - inizio - ((orePausaDefinitiva ?? 0) * 60);

            totaleMinuti +=
                turno.statoPayroll === "ELABORATO" ||
                    turno.statoPayroll === "MODIFICATO"
                    ? minutiLavorati
                    : 0;
        });

        const ore = Math.floor(totaleMinuti / 60);
        const minuti = totaleMinuti % 60;

        return {
            ore,
            minuti
        };
    };

    const calcolaTotalePause = (
        turni: TurnoCompleto[]
    ): { ore: number; minuti: number } => {
        let totaleMinutiPausa = 0;

        turni.forEach((turno) => {
            const { orePausaDefinitiva } = turno;

            if (
                turno.statoPayroll === "ELABORATO" ||
                turno.statoPayroll === "MODIFICATO"
            ) {
                totaleMinutiPausa += (orePausaDefinitiva ?? 0) * 60;
            }
        });

        const ore = Math.floor(totaleMinutiPausa / 60);
        const minuti = totaleMinutiPausa % 60;

        return {
            ore,
            minuti
        };
    };


    const setOraInizioTurno = (
        idTurno: number,
        ora: string
    ) => {
        setTurni((prev) => {
            return prev.map((t): TurnoCompleto => {
                if (t.idTurno === idTurno) {
                    return {
                        ...t,
                        oraInizioDefinitivo: ora,
                    };
                }
                return t;
            });
        });
    };

    const setOraFineTurno = (
        idTurno: number,
        ora: string
    ) => {
        setTurni((prev) => {
            return prev.map((t): TurnoCompleto => {
                if (t.idTurno === idTurno) {
                    return {
                        ...t,
                        oraFineDefinitivo: ora,
                    };
                }
                return t;
            });
        });
    };

    const setNumeroOrePausa = (
        idTurno: number,
        numero: number | undefined
    ) => {
        setTurni((prev) => {
            return prev.map((t): TurnoCompleto => {
                if (t.idTurno === idTurno) {
                    return {
                        ...t,
                        orePausaDefinitiva: numero,
                    };
                }
                return t;
            });
        });
    };

    const handlePeriodoClick = (
        periodo: "giorno" | "settimana" | "mese"
    ) => {
        const dataFine = new Date();
        const dataInizio = new Date(dataFine);

        switch (periodo) {
            case "giorno":
                dataInizio.setDate(dataInizio.getDate() - 1);
                break;

            case "settimana":
                dataInizio.setDate(dataInizio.getDate() - 7);
                break;

            case "mese":
                dataInizio.setMonth(dataInizio.getMonth() - 1);
                break;
        }

        const filtriRicerca: FiltriRicerca = {
            dataInizio,
            dataFine,
            statoElaborazione: filtroSelezionato ?? undefined
        };

        setFiltriRicerca(filtriRicerca);
        caricaPayroll(filtriRicerca);
    };

    const filtraPerStatoElaborazione = (statoElaborazione: string) => {
        if (!filtriRicerca) return;

        const nuoviFiltri: FiltriRicerca = {
            ...filtriRicerca,
            statoElaborazione,
        };

        setFiltriRicerca(nuoviFiltri);
        caricaPayroll(nuoviFiltri);
        setFiltroSelezionato(statoElaborazione);
    };

    const totaleOre = calcolaTotaleOreTurni(turni);
    const totalePause = calcolaTotalePause(turni);

    const applicaRange = (range: DateRange) => {
        if (!range.from) return;
        setFiltriRicerca(prev => ({
            ...prev,
            dataInizio: range.from,
            dataFine: range.to ?? range.from,
        }));

        if (filtriRicerca) {
            caricaPayroll(filtriRicerca);
        }        
    };

    const rangeCorrente: DateRange = {
        from: filtriRicerca?.dataInizio,
        to: filtriRicerca?.dataFine,
    };

    return (
        <section className="m-6">
            <div className="mb-8">
                <div className="text-3xl font-extrabold text-[#007a55] mb-4">
                    RENDICONTAZIONE ORE OPERATORI
                </div>
            </div>

            <div className="flex items-center gap-4 mb-1 bg-[#f6f7f7] p-4 py-6 rounded-[12px] shadow-[0_4px_20px_0_rgba(0,0,0,0.05)] border border-[#dde5e2]">

                <div className="w-4/5">

                    {/* PRIMA RIGA: filtri */}
                    <div className="flex items-center gap-2">

                        {/* Evento */}
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="min-w-[265px] justify-between border border-gray-300 rounded-none px-2 py-1 bg-white font-normal"
                                    >
                                        {filtriRicerca?.nomeEvento || "Seleziona evento"}

                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="min-w-[265px] p-0">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Cerca evento..."
                                            value={ricercaEvento}
                                            onValueChange={setRicercaEvento}
                                        />

                                        <CommandList>
                                            <CommandEmpty>
                                                Nessun evento trovato.
                                            </CommandEmpty>

                                            <CommandGroup>
                                                {comboEventi
                                                    .filter((evento) =>
                                                        evento.nomeEvento
                                                            .toLowerCase()
                                                            .includes(ricercaEvento.toLowerCase())
                                                    )
                                                    .map((evento) => (
                                                        <CommandItem
                                                            key={evento.nomeEvento}
                                                            value={evento.nomeEvento}
                                                            onSelect={() => {
                                                                setNomeEvento(evento.nomeEvento);
                                                            }}
                                                        >
                                                            {evento.nomeEvento}
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Operatore */}
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        className="w-full justify-between border border-gray-300 rounded-none px-2 py-1 bg-white font-normal"
                                    >
                                        {filtriRicerca?.operatore || "Seleziona operatore"}

                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                    <Command shouldFilter={false}>
                                        <CommandInput
                                            placeholder="Cerca operatore..."
                                            value={ricercaOperatore}
                                            onValueChange={setRicercaOperatore}
                                        />

                                        <CommandList>
                                            <CommandEmpty>
                                                Nessun operatore trovato.
                                            </CommandEmpty>

                                            <CommandGroup>
                                                {comboOperatori
                                                    .filter((filtroOperatore) =>
                                                        filtroOperatore.operatore
                                                            .toLowerCase()
                                                            .includes(ricercaOperatore.toLowerCase())
                                                    )
                                                    .map((filtroOperatore) => (
                                                        <CommandItem
                                                            key={filtroOperatore.operatore}
                                                            value={filtroOperatore.operatore}
                                                            onSelect={() => {
                                                                setIdOperatore(filtroOperatore.idOperatore, filtroOperatore.operatore);
                                                            }}
                                                        >
                                                            {filtroOperatore.operatore}
                                                        </CommandItem>
                                                    ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Filtra */}
                        <div>
                            <Button
                                className="bg-[#007a55] hover:bg-[#007a55] cursor-pointer rounded-r-full rounded-l-none -ml-px"
                                onClick={() => {
                                    if (filtriRicerca) {
                                        caricaPayroll(filtriRicerca);
                                    }
                                }}
                            >
                                Filtra
                            </Button>
                        </div>                        

                        <DetelderDateRangePicker
                            value={rangeCorrente}
                            onApply={applicaRange}
                            label=""
                        />

                        {/* 
                        <div>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-none"
                                    >
                                        {filtriRicerca?.dataInizio
                                            ? filtriRicerca?.dataInizio.toLocaleDateString()
                                            : "Seleziona data"}

                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
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
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-none"
                                    >
                                        {filtriRicerca?.dataFine
                                            ? filtriRicerca?.dataFine.toLocaleDateString()
                                            : "Seleziona data"}

                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                    </Button>
                                </PopoverTrigger>

                                <PopoverContent
                                    className="w-auto p-0"
                                    align="start"
                                >
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
                         */}

                    </div>


                    {/* SECONDA RIGA: resto dei componenti */}
                    <div className="flex items-center gap-3 mt-5">

                        <Button
                            onClick={() => handlePeriodoClick("giorno")}
                            className={`rounded-[18px] border text-[16px] font-bold cursor-pointer transition-all
                            ${filtroDataSelezionato === "giorno"
                                    ? "bg-[#007a55] border-[#007a55] text-white hover:bg-[#007a55] hover:text-white"
                                    : "border-[#007a55] bg-[#f3fffa] text-[#007a55] hover:bg-[#f3fffa] hover:text-[#007a55]"
                                }
                        `}
                        >
                            Ieri
                        </Button>

                        <Button
                            onClick={() => handlePeriodoClick("settimana")}
                            className={`rounded-[18px] border text-[16px] font-bold cursor-pointer transition-all
                            ${filtroDataSelezionato === "settimana"
                                    ? "bg-[#007a55] border-[#007a55] text-white hover:bg-[#007a55] hover:text-white"
                                    : "border-[#007a55] bg-[#f3fffa] text-[#007a55] hover:bg-[#f3fffa] hover:text-[#007a55]"
                                }
                        `}
                        >
                            Settimana
                        </Button>

                        <Button
                            onClick={() => handlePeriodoClick("mese")}
                            className={`rounded-[18px] border text-[16px] font-bold cursor-pointer transition-all
                            ${filtroDataSelezionato === "mese"
                                    ? "bg-[#007a55] border-[#007a55] text-white hover:bg-[#007a55] hover:text-white"
                                    : "border-[#007a55] bg-[#f3fffa] text-[#007a55] hover:bg-[#f3fffa] hover:text-[#007a55]"
                                }
                        `}
                        >
                            Mese
                        </Button>

                        <div className="h-8 w-px bg-[#c4c7c5]" />

                        <Button
                            onClick={() => filtraPerStatoElaborazione("ELABORATO")}
                            className={`rounded-full border text-[13px] font-semibold cursor-pointer transition-all
                            ${filtroSelezionato === "ELABORATO"
                                    ? "bg-[#0b8a5d] hover:bg-[#0b8a5d] text-white hover:text-white"
                                    : "bg-[#e8f8f0] text-[#176b4a] hover:bg-[#e8f8f0] hover:text-[#176b4a]"
                                }
                        `}
                        >
                            Elaborati
                        </Button>

                        <Button
                            onClick={() => filtraPerStatoElaborazione("DA_ELABORARE")}
                            className={`rounded-full border text-[13px] font-semibold cursor-pointer transition-all
                            ${filtroSelezionato === "DA_ELABORARE"
                                    ? "bg-[#d97706] hover:bg-[#d97706] text-white hover:text-white"
                                    : "bg-[#fff2e1] text-[#b45309] hover:bg-[#fff2e1] hover:text-[#b45309]"
                                }
                        `}
                        >
                            Da Elaborare
                        </Button>

                        <Button
                            onClick={() => filtraPerStatoElaborazione("MODIFICATO")}
                            className={`rounded-full border text-[13px] font-semibold cursor-pointer transition-all
                            ${filtroSelezionato === "MODIFICATO"
                                    ? "bg-[#7c3aed] hover:bg-[#7c3aed] text-white hover:text-white"
                                    : "bg-[#f2eaff] text-[#6d28d9] hover:bg-[#f2eaff] hover:text-[#6d28d9]"
                                }
                        `}
                        >
                            Modificato
                        </Button>

                        <Button
                            onClick={() => filtraPerStatoElaborazione("CONTESTATO")}
                            className={`rounded-full border text-[13px] font-semibold cursor-pointer transition-all
                            ${filtroSelezionato === "CONTESTATO"
                                    ? "bg-[#c93c3c] hover:bg-[#c93c3c] text-white hover:text-white"
                                    : "bg-[#ffe7e7] text-[#b42318] hover:bg-[#ffe7e7] hover:text-[#b42318]"
                                }
                        `}
                        >
                            Contestato
                        </Button>

                        <Button
                            onClick={() => resetFiltriRicerca()}
                            className="rounded-[5px] bg-[#007a55] text-white hover:bg-[#009e6d] cursor-pointer"
                        >
                            <Paintbrush className="h-4 w-4" />
                        </Button>

                    </div>
                </div>

                <div className="w-1/5 rounded-lg bg-white px-4 py-2 shadow-[inset_0_0_0_1px_#e2ebe7]">
                    <div className="grid grid-cols-2 gap-x-6 text-center">

                        <div className="flex w-full items-center justify-center text-[14px] font-semibold text-[#006b44]">
                            <Clock3 className="mr-1 h-4 w-4" /> Totale ore:
                        </div>

                        <div className="flex w-full items-center justify-center text-[14px] font-semibold text-[#6b7772]">
                            <CirclePause className="mr-1 h-4 w-4" /> Pause:
                        </div>

                        <span>
                            <span className="text-[23px] font-bold text-[#006b44]">
                                {String(totaleOre.ore).padStart(2, "0")}
                            </span>
                            <span className="text-[14px] font-semibold text-[#6f7f79]">
                                :{String(totaleOre.minuti).padStart(2, "0")}
                            </span>
                        </span>

                        <span>
                            <span className="text-[23px] font-bold text-[#006b44]">
                                {String(totalePause.ore).padStart(2, "0")}
                            </span>

                            <span className="text-[14px] font-semibold text-[#6f7f79]">
                                :{String(totalePause.minuti).padStart(2, "0")}
                            </span>
                        </span>
                    </div>
                </div>



            </div>

            <div className="border rounded-md bg-white border-r border-r-[#e5e7eb]">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] border-r border-r-[#e5e7eb]">
                                NOMINATIVO
                            </TableHead>
                            <TableHead colSpan={2} className="text-center text-[12px] font-bold text-[#3f4942] bg-[rgba(65,101,89,0.2)] border-r border-r-[#e5e7eb]">
                                PREVISTO
                            </TableHead>
                            <TableHead colSpan={2} className="text-center text-[12px] font-bold text-[#3f4942] bg-[rgba(0,80,50,0.2)] border-r border-r-[#e5e7eb]">
                                EFFETTIVO
                            </TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] border-r border-r-[#e5e7eb]">
                                DELTA
                            </TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] border-r border-r-[#e5e7eb]" />
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] bg-[#e6f4ff] border-r border-r-[#e5e7eb]">
                                DEFINITIVO
                            </TableHead>
                            <TableHead className="text-center text-[12px] font-bold text-[#3f4942] bg-[#d0e8fe] border-r border-r-[#e5e7eb]">
                                ORE
                            </TableHead>
                            <TableHead colSpan={2} className="text-center text-[12px] font-bold text-[#3f4942]">
                                STATO
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

                            const campiReadOnly =
                                turno.statoPayroll === "ELABORATO" ||
                                turno.statoPayroll === "MODIFICATO";

                            return (
                                <React.Fragment key={index}>

                                    {isNewDate && (
                                        <TableRow >

                                            <TableCell colSpan={11} className="bg-[#007a55] text-white">
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


                                    {!isNewDate && isNewEvento && (
                                        <TableRow >
                                            <TableCell colSpan={11} className="bg-[#8f8f8f] text-white">
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

                                    <TableRow className="h-full">
                                        <TableCell className="text-[16px] font-medium text-[#005032]">
                                            {turno.operatore}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col items-center text-[16px] font-normal text-[#3f4942]">
                                                <span>{turno.oraInizio} - {turno.oraFine}</span>

                                                <span className="flex items-center">
                                                    <CirclePause className="mr-1 h-4 w-4" />
                                                    {turno.orePausa}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="bg-[rgba(65,101,89,0.2)]  p-0">
                                            <div className="h-full w-full flex items-center justify-center px-2 text-[16px] font-bold text-[#191c1d]">
                                                {turno.orePreviste} h
                                            </div>
                                        </TableCell>

                                        <TableCell>
                                            <div className="space-y-1 text-[16px] font-normal text-[#3f4942]">
                                                {turno.checkInCheckOut.map((item, idx) => (
                                                    <div key={idx}>
                                                        {item.dataInserimentoCheckIn
                                                            ? format(new Date(item.dataInserimentoCheckIn), "HH.mm")
                                                            : "--"}
                                                        {" - "}
                                                        {item.dataInserimentoCheckOut
                                                            ? format(new Date(item.dataInserimentoCheckOut), "HH.mm")
                                                            : "--"}
                                                    </div>
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell className="bg-[rgba(0,80,50,0.2)]  p-0">
                                            <div className="h-full w-full flex items-center justify-center px-2 text-[16px] font-bold text-[#191c1d]">
                                                {turno.oreLavorateTurno} h
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div
                                                className={`h-full w-full flex items-center justify-center px-2 text-[16px] ${turno.delta === "00:00:00"
                                                    ? "font-normal text-[#3f4942]"
                                                    : "font-bold text-[#ba1a1a]"
                                                    }`}
                                            >
                                                {turno.delta} h
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="inline-flex cursor-default">
                                                            <StickyNote className="h-4 w-4 text-muted-foreground" />
                                                        </span>
                                                    </TooltipTrigger>

                                                    <TooltipContent className="max-w-[60ch]">
                                                        <p className="whitespace-pre-wrap break-words">
                                                            {turno.motivazioneRitardo || "Nessuna motivazione"}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-2 w-full">
                                                <div className="flex items-center gap-2 w-full">
                                                    <Input
                                                        type="time"
                                                        value={turno.oraInizioDefinitivo}
                                                        readOnly={campiReadOnly}
                                                        onChange={(e) => setOraInizioTurno(turno.idTurno, e.target.value)}
                                                        className="flex-1 bg-white !border-0 !shadow-none !outline-none focus:ring-0 focus-visible:ring-0"
                                                    />

                                                    <Input
                                                        type="time"
                                                        value={turno.oraFineDefinitivo}
                                                        readOnly={campiReadOnly}
                                                        onChange={(e) => setOraFineTurno(turno.idTurno, e.target.value)}
                                                        className="flex-1 bg-white !border-0 !shadow-none !outline-none focus:ring-0 focus-visible:ring-0"
                                                    />
                                                </div>

                                                <div className="flex justify-center">
                                                    <div className="relative w-fit">
                                                        <CirclePause
                                                            size={18}
                                                            className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                                                        />

                                                        <Input
                                                            type="number"
                                                            min={0}
                                                            max={5}
                                                            step={0.5}
                                                            value={turno.orePausaDefinitiva}
                                                            readOnly={campiReadOnly}
                                                            onChange={(e) =>
                                                                setNumeroOrePausa(
                                                                    turno.idTurno,
                                                                    e.target.value !== ""
                                                                        ? parseFloat(e.target.value)
                                                                        : undefined
                                                                )
                                                            }
                                                            className="w-[100px] pl-8 !bg-white !border-0 !shadow-none !outline-none focus:ring-0 focus-visible:ring-0"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="bg-[#d0e8fe]  p-0">
                                            <div className="h-full w-full flex items-center justify-center px-2 text-[16px] font-bold text-[#191c1d]">
                                                {calcolaTotaleOre(
                                                    turno.oraInizioDefinitivo,
                                                    turno.oraFineDefinitivo,
                                                    turno.orePausaDefinitiva
                                                )} h
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <span className="inline-flex cursor-default">
                                                            <StickyNote className="h-4 w-4 text-muted-foreground" />
                                                        </span>
                                                    </TooltipTrigger>

                                                    <TooltipContent className="max-w-[60ch]">
                                                        <p className="whitespace-pre-wrap break-words">
                                                            {turno.motivazioneContestazione || "Nessuna motivazione"}
                                                        </p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </TableCell>
                                        <TableCell>
                                            {turno.statoPayroll === "DA_ELABORARE" && (
                                                <Button
                                                    onClick={() => salvaPayroll(turno.idTurno)}
                                                    className="w-full cursor-pointer rounded-[5px] bg-[#ffedd5] text-[11px] font-bold text-[#c2410c] hover:bg-[#fed7aa] hover:text-[#9a3412]"
                                                >
                                                    Da elaborare
                                                </Button>
                                            )}

                                            {turno.statoPayroll === "ELABORATO" && (
                                                <Button
                                                    onClick={() => eliminaPayroll(turno.idTurno)}
                                                    className="w-full cursor-pointer rounded-[5px] bg-[#9df5c3] text-[11px] font-bold text-[#002112] hover:bg-[#6ee7a5] hover:text-[#00150b]"
                                                >
                                                    Rielabora
                                                </Button>
                                            )}
                                            {turno.statoPayroll === "CONTESTATO" && (
                                                <Button
                                                    onClick={() => modificaPayroll(turno.idTurno, 'MODIFICATO')}
                                                    className="w-full cursor-pointer rounded-[5px] bg-[#ffd5d5] text-[11px] font-bold text-[#c2410c]  hover:bg-[#fecaca] hover:text-[#9a3412]"
                                                >
                                                    Contestato
                                                </Button>
                                            )}
                                            {turno.statoPayroll === "MODIFICATO" && (
                                                <Button
                                                    onClick={() => modificaPayroll(turno.idTurno, 'CONTESTATO')}
                                                    className="w-full cursor-pointer rounded-[5px] bg-[#d5e2ff] text-[11px] font-bold text-[#4c608b] hover:bg-[#c5d6ff] hover:text-[#3f527a]"
                                                >
                                                    Rimodifica
                                                </Button>
                                            )}
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