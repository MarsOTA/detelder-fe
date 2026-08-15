import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import React, { useEffect, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { ChevronDown, CalendarIcon, ArrowUp, ArrowDown, ArrowUpDown, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";
import CreaEventoDialog from "./dialog/creaEventoDialog";
import { calcolaTotaleOre, calcolaTotaleOreLavorate } from "./utils/calcoloOre";

interface Cliente {
    idCliente: number;
    ragioneSociale: string;
    piva_cfiscale: string;
    email: string;
    telefono: string;
}

interface IndirizzoBrand {
    idIndirizzo: number;
    via: string;
}

interface Brand {
    idBrand: number;
    nome: string;
    listaIndirizzi: IndirizzoBrand[];
}

type Turno = {
    dataTurno: Date | undefined
    oraInizio: string;
    oraFine: string;
    tipologiaTurno: string;
    tipoMansione: string;
    orePausa: string;
    operatore: string;
};

type EventoTurni = {
    idEvento: number;
    nomeEvento: string | null;
    dataIniziale: string;
    dataFinale: string;
    ragioneSociale: string;
    nomeBrand: string;
    turni: Turno[];
};

type FiltriRicerca = {
    ricercaKeyword: string;
    dataInizio: Date | undefined;
    dataFine: Date | undefined;
}

const eventi = () => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();
    const [isAltroSelected, setIsAltroSelected] = useState(false);

    const toggleAll = () => {
        if (expandedItems.length === eventiTurni.length) {
            setExpandedItems([]);
        } else {
            setExpandedItems(eventiTurni.map((e) => `item-${e.idEvento}`));
        }
    };

    const navigate = useNavigate();
    const [clienti, setClienti] = useState<Cliente[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [indirizzi, setIndirizzi] = useState<IndirizzoBrand[]>([]);
    const [isDialogEventiOpen, setIsDialogEventiOpen] = useState(false);
    const [eventiTurni, setEventiTurni] = useState<EventoTurni[]>([]);
    const [selectedEventi, setSelectedEventi] = useState<Set<number>>(new Set());
    const [sortConfigEventi, setSortConfigEventi] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

    const [formDataEvento, setFormData] = useState({
        idCliente: 0,
        idBrand: 0,
        idIndirizzo: 0,
        indirizzo: "",
        dataIniziale: "",
        dataFinale: "",
        note: "",
    });

    const handleExportToExcel = () => {
        let dataToExport: any[] = [];
        const eventiSelezionati = eventiTurni.filter(evento => selectedEventi.has(evento.idEvento));
        dataToExport = eventiSelezionati.flatMap(evento =>
            evento.turni.map(turno => ({
                DataEvento: format(evento.dataIniziale, "dd/MM/yyyy"),
                NomeEvento: evento.nomeEvento,
                RagioneSociale: evento.ragioneSociale,
                OraInizio: turno.oraInizio,
                OraFine: turno.oraFine,
                TipologiaAttività: turno.tipologiaTurno,
                Mansione: turno.tipoMansione,
                Operatore: turno.operatore,
                OrePausa: turno.orePausa,
            }))
        );
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "TurniEventi");
        XLSX.writeFile(workbook, "turni_eventi_selezionati.xlsx");
    };

    const stampaReport = async (filtri: FiltriRicerca) => {
        const dataInizioStr = formatDateToYYYYMMDD(filtri.dataInizio);
        const dataFineStr = formatDateToYYYYMMDD(filtri.dataFine);
        const ricercaKeyword = filtri.ricercaKeyword?.trim();
        const queryParams = new URLSearchParams();
        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
        if (dataFineStr) queryParams.append("dataFine", dataFineStr);
        if (ricercaKeyword) queryParams.append("keyword", ricercaKeyword);

        try {
            const urlInput = `${ezystaffBEUrl}eventi/creaReportTurni?${queryParams.toString()}`;
            const response = await fetch(urlInput, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "application/json",
                    accept: "application/json",
                },
                credentials: "include",
            });
            if (!response.ok) throw new Error("Errore download PDF");
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", "document.pdf");
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Errore scaricando PDF:", error);
        }
    }

    useEffect(() => {
        const filtriRicerca: FiltriRicerca = {
            ricercaKeyword: "",
            dataInizio: new Date(),
            dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)),
        }
        setFiltriRicerca(filtriRicerca);
        cercaListaTurniEventi(filtriRicerca);
        cercaListaClienti();
    }, [])

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const cercaListaTurniEventi = async (filtri: FiltriRicerca) => {
        const dataInizioStr = formatDateToYYYYMMDD(filtri.dataInizio);
        const dataFineStr = formatDateToYYYYMMDD(filtri.dataFine);
        const ricercaKeyword = filtri.ricercaKeyword?.trim();
        const queryParams = new URLSearchParams();
        if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
        if (dataFineStr) queryParams.append("dataFine", dataFineStr);
        if (ricercaKeyword) queryParams.append("keyword", ricercaKeyword);
        const url = `${ezystaffBEUrl}eventi/turni?${queryParams.toString()}`;
        const resp = await fetch(url, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            credentials: "include",
        });
        const data = await resp.json();
        setEventiTurni(data);
    };

    const cercaListaClienti = async () => {
        const resp = await fetch(ezystaffBEUrl + 'clienti', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        setClienti(data);
    }

    const clienteOnValueChange = (value: number) => {
        caricaListaBrandsCliente(value);
        setFormData((prev) => ({ ...prev, idCliente: value }));
    }

    const brandOnValueChange = (idBrand: number) => {
        const brand = brands.find((b) => b.idBrand === idBrand);
        if (brand) {
            setIndirizzi(brand.listaIndirizzi);
            setFormData((prev) => ({ ...prev, idBrand: idBrand }));
        }
    }

    const indirizzoOnValueChange = (idIndirizzo: number) => {
        setFormData((prev) => ({ ...prev, idIndirizzo: idIndirizzo }));
    }

    const caricaListaBrandsCliente = async (id: number | null) => {
        const resp = await fetch(ezystaffBEUrl + `clienti/brands/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        setBrands(data);
    }

    const creaEvento = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = { ...formDataEvento, isAltroSelected };
        const resp = await fetch(ezystaffBEUrl + 'eventi', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        resetForm();
        setIsDialogEventiOpen(false);
        navigate(`/admin/gestione-turni/${data.idEvento}`);
    }

    const resetForm = () => {
        setFormData({
            idCliente: 0,
            idBrand: 0,
            idIndirizzo: 0,
            indirizzo: "",
            dataIniziale: "",
            dataFinale: "",
            note: "",
        });
        setIsAltroSelected(false);
    };

    const handleDataInizioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const nuovaDataInizio = e.target.value;
        setFormData(prev => ({ ...prev, dataIniziale: nuovaDataInizio, dataFinale: nuovaDataInizio }));
    };

    const getsioneTurni = (idEvento: number) => navigate(`/admin/gestione-turni/${idEvento}`);

    const setRicercaKeyword = (value: string) => {
        setFiltriRicerca((prev) => prev ? { ...prev, ricercaKeyword: value } : undefined);
    };

    const setDataInizio = (date: Date | undefined) => {
        setFiltriRicerca((prev) => prev ? { ...prev, dataInizio: date } : undefined);
    };

    const setDataFine = (date: Date | undefined) => {
        setFiltriRicerca((prev) => prev ? { ...prev, dataFine: date } : undefined);
    };

    const sortEventiBy = (key: "nomeEvento" | "dataIniziale" | "dataFinale" | "ragioneSociale" | "nomeBrand") => {
        const newDirection = sortConfigEventi && sortConfigEventi.key === key && sortConfigEventi.direction === "asc" ? "desc" : "asc";
        setSortConfigEventi({ key, direction: newDirection });
        const sorted = [...eventiTurni].sort((a, b) => {
            let cmp = 0;
            if (key === "dataIniziale" || key === "dataFinale") {
                cmp = new Date(a[key]).getTime() - new Date(b[key]).getTime();
            } else {
                cmp = String(a[key]).localeCompare(String(b[key]));
            }
            return newDirection === "asc" ? cmp : -cmp;
        });
        setEventiTurni(sorted);
    };

    const renderArrowEventi = (key: keyof EventoTurni) => {
        if (sortConfigEventi?.key !== key) return <ArrowUpDown className="h-4 w-4 inline ml-1" />;
        return sortConfigEventi.direction === "asc" ? <ArrowUp className="h-4 w-4 inline ml-1" /> : <ArrowDown className="h-4 w-4 inline ml-1" />;
    };

    const checkedUncheckedEventi = (idEvento: number, checked: boolean | string) => {
        setSelectedEventi((prev) => {
            const updated = new Set(prev);
            if (checked === true) updated.add(idEvento); else updated.delete(idEvento);
            return updated;
        });
    };

    function contaOperatoriEvento(evento?: EventoTurni): number {
        if (!evento || !evento.turni) return 0;
        return evento.turni.filter(turno => turno.operatore && turno.operatore.trim() !== "").length;
    }

    return (
        <section className="m-6" style={{ fontFamily: "'Mulish', sans-serif" }}>
            <div className="mb-8">
                <h1 className="text-[38px] font-black leading-[1.05] tracking-[-0.035em] text-[#007a55] mb-4">
                    Gestione eventi
                </h1>

                <div className="min-h-[40px]">
                    <CreaEventoDialog
                        open={isDialogEventiOpen}
                        onOpenChange={setIsDialogEventiOpen}
                        formData={formDataEvento}
                        setFormData={setFormData}
                        clienti={clienti}
                        brands={brands}
                        indirizzi={indirizzi}
                        creaEvento={creaEvento}
                        clienteOnValueChange={clienteOnValueChange}
                        brandOnValueChange={brandOnValueChange}
                        indirizzoOnValueChange={indirizzoOnValueChange}
                        handleDataInizioChange={handleDataInizioChange}
                        isAltroSelected={isAltroSelected}
                        setIsAltroSelected={setIsAltroSelected}
                    />
                </div>
            </div>

            <div className="flex items-center bg-[#ecf3f1] p-4 mb-1">
                <div>
                    <Input type="text" placeholder="Ricerca per keyword" value={filtriRicerca?.ricercaKeyword} onChange={(e) => setRicercaKeyword(e.target.value)} className="border border-gray-300 rounded-l-md px-2 py-1 w-48 bg-white rounded-r-none" />
                </div>
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
                <Button className="bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer rounded-r-full rounded-l-none -ml-px" onClick={() => filtriRicerca && cercaListaTurniEventi(filtriRicerca)}>
                    Filtra
                </Button>

                <div className="flex items-center gap-4 ml-auto">
                    <Button className="rounded-[18px] bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer px-8" onClick={toggleAll}>
                        {expandedItems.length === eventiTurni.length ? "Comprimi tutti" : "Espandi tutti"}
                    </Button>
                    <Button className="rounded-[18px] bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer pl-8 pr-8" onClick={handleExportToExcel}>Scarica .csv</Button>
                    <Button className="rounded-[18px] bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer px-8" onClick={() => filtriRicerca && stampaReport(filtriRicerca)}>Scarica pdf</Button>
                </div>
            </div>

            <div>
                <div className="grid w-full grid-cols-[40px_1fr_1fr_1fr_0.5fr_1fr_1fr_80px_40px] gap-2 bg-[#ebebeb] pt-4 pb-4">
                    <div></div>
                    <div onClick={() => sortEventiBy("nomeEvento")} className="cursor-pointer select-none text-left font-semibold hover:underline">Nome evento {renderArrowEventi("nomeEvento")}</div>
                    <div onClick={() => sortEventiBy("dataIniziale")} className="cursor-pointer select-none text-left font-semibold hover:underline">Dal {renderArrowEventi("dataIniziale")}</div>
                    <div onClick={() => sortEventiBy("dataFinale")} className="cursor-pointer select-none text-left font-semibold hover:underline">Al {renderArrowEventi("dataFinale")}</div>
                    <div onClick={() => sortEventiBy("ragioneSociale")} className="cursor-pointer select-none text-left font-semibold hover:underline">Cliente {renderArrowEventi("ragioneSociale")}</div>
                    <div className="select-none font-semibold flex items-center justify-center">Turni/Operatori</div>
                    <div className="select-none text-left font-semibold">Ore totali/Ore assegnate</div>
                    <div></div>
                    <div></div>
                </div>

                <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems} className="w-full">
                    {eventiTurni.map((evento) => (
                        <AccordionItem key={evento.idEvento} value={`item-${evento.idEvento}`}>
                            <AccordionTrigger className="text-lg font-semibold text-[#326455] hover:no-underline hover:text-[#5e8a7a] [&>svg:last-child]:hidden cursor-pointer">
                                <div className="grid w-full grid-cols-[40px_1fr_1fr_1fr_0.5fr_1fr_1fr_80px_40px] gap-2">
                                    <div><Checkbox checked={selectedEventi.has(evento.idEvento)} onClick={(e) => e.stopPropagation()} onCheckedChange={(checked) => checkedUncheckedEventi(evento.idEvento, checked)} /></div>
                                    <div>{evento.nomeEvento}</div>
                                    <div>{format(evento.dataIniziale, 'dd/MM/yyyy')}</div>
                                    <div>{format(evento.dataFinale, 'dd/MM/yyyy')}</div>
                                    <div>{`${evento.ragioneSociale}-${evento.nomeBrand}`}</div>
                                    <div className="flex items-center justify-center">{`${evento.turni.length}/${contaOperatoriEvento(evento)}`}</div>
                                    <div>{calcolaTotaleOre(evento.turni)} h / {calcolaTotaleOreLavorate(evento.turni)} h</div>
                                    <div><Button variant="outline" onClick={(e) => { e.stopPropagation(); getsioneTurni(evento.idEvento); }}><Pencil className="h-4 w-4" /></Button></div>
                                    <div className="flex justify-center"><ChevronDown className="transition-transform duration-200 data-[state=open]:rotate-180" data-state={expandedItems.includes(`item-${evento.idEvento}`) ? "open" : "closed"} /></div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data turno</TableHead>
                                            <TableHead>Ora Inizio</TableHead>
                                            <TableHead>Ora Fine</TableHead>
                                            <TableHead>Tipologia attività</TableHead>
                                            <TableHead>Mansione</TableHead>
                                            <TableHead>Operatore</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody className="bg-[#F8F8F8]">
                                        {evento.turni.map((turno, index) => {
                                            const prevTurno = evento.turni[index - 1];
                                            const isNewDate = index === 0 || (prevTurno?.dataTurno && turno.dataTurno && format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") !== format(new Date(turno.dataTurno), "yyyy-MM-dd"));
                                            return (
                                                <React.Fragment key={index}>
                                                    {isNewDate && index !== 0 && (
                                                        <TableRow><TableCell colSpan={6} className="p-0"><hr className="border-t-3 border-[#8ecdb6]" /></TableCell></TableRow>
                                                    )}
                                                    <TableRow>
                                                        <TableCell>{turno.dataTurno ? format(new Date(turno.dataTurno), "dd/MM/yyyy") : ""}</TableCell>
                                                        <TableCell>{turno.oraInizio}</TableCell>
                                                        <TableCell>{turno.oraFine}</TableCell>
                                                        <TableCell>{turno.tipologiaTurno}</TableCell>
                                                        <TableCell>{turno.tipoMansione}</TableCell>
                                                        <TableCell>{turno.operatore}</TableCell>
                                                    </TableRow>
                                                </React.Fragment>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </section>
    )
}

export default eventi