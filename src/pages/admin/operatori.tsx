import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Pencil, ArrowUp, ArrowDown, KeyRound, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import React, { useEffect, useMemo, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import type { Dipendente } from "@/entity";
import { prefissi } from "@/pages/admin/utils/prefissi";

type StatoContratto = "REGOLARE" | "SCADUTO" | "ASSENTE";

type StatoContrattoResponse = {
  idOperatore: number;
  statoContratto: StatoContratto;
};

const statoContrattoOptions: { value: StatoContratto; label: string }[] = [
  { value: "REGOLARE", label: "In regola" },
  { value: "SCADUTO", label: "Non in regola" },
  { value: "ASSENTE", label: "Assente" },
];

const Operatori = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    prefisso: "",
    telefono: "",
    gpg: false,
  });
  const navigate = useNavigate();
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [statiContratto, setStatiContratto] = useState<Record<number, StatoContratto>>({});
  const [statiSelezionati, setStatiSelezionati] = useState<StatoContratto[]>([
    "REGOLARE",
    "SCADUTO",
    "ASSENTE",
  ]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  type SortDirection = "asc" | "desc";
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [ricercaKeyword, setRicercaKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    caricaOperatoriEContratti();
  }, []);

  const handleEdit = (dipendente: Dipendente) =>
    navigate(`/admin/dettaglio-operatore/${dipendente.id}`);

  const mostraPresenze = (dipendente: Dipendente) =>
    navigate(`/admin/timbrature-operatore/${dipendente.id}`);

  const reinviaPassword = async (dipendente: Dipendente) => {
    const conferma = window.confirm(
      `Vuoi inviare nuovamente la password a ${dipendente.nome} ${dipendente.cognome}?`
    );
    if (!conferma) return;

    setIsLoading(true);
    try {
      const resp = await fetch(`${ezystaffBEUrl}operatori/reinviaPassword/${dipendente.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
      });

      if (!resp.ok) throw new Error(`Errore nella richiesta: ${resp.status}`);
      const data = await resp.json();
      alert(data.message);
      return data;
    } catch (error) {
      console.error("Errore durante l'invio della password:", error);
      alert(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewOperator = () => {
    setFormData({
      nome: "",
      cognome: "",
      email: "",
      prefisso: "+39",
      telefono: "",
      gpg: false,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resp = await fetch(ezystaffBEUrl + "operatori", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      method: "POST",
      credentials: "include",
      body: JSON.stringify(formData),
    });

    const data = await resp.json();
    setIsDialogOpen(false);
    await caricaOperatoriEContratti();

    if (!data.success) {
      alert(`Errore: ${data.message}\nDettagli: ${data.error || "Nessun dettaglio disponibile"}`);
    }
  };

  const fetchOperatori = async () => {
    const resp = await fetch(ezystaffBEUrl + "operatori", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      credentials: "include",
    });

    if (!resp.ok) throw new Error(`Errore caricamento operatori: ${resp.status}`);
    const data = await resp.json();
    setDipendenti(data);
  };

  const fetchStatiContratto = async () => {
    const resp = await fetch(ezystaffBEUrl + "operatori/statoContratti", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      credentials: "include",
    });

    if (!resp.ok) throw new Error(`Errore caricamento contratti: ${resp.status}`);

    const data: StatoContrattoResponse[] = await resp.json();
    const mappa = data.reduce<Record<number, StatoContratto>>((acc, item) => {
      acc[item.idOperatore] = item.statoContratto;
      return acc;
    }, {});

    setStatiContratto(mappa);
  };

  const caricaOperatoriEContratti = async () => {
    try {
      await Promise.all([fetchOperatori(), fetchStatiContratto()]);
    } catch (error) {
      console.error("Errore caricamento lista operatori:", error);
    }
  };

  const handleGpgChange = (gpg: boolean) =>
    setFormData((prev) => ({ ...prev, gpg }));

  const toggleStatoContratto = (stato: StatoContratto) => {
    setStatiSelezionati((prev) =>
      prev.includes(stato)
        ? prev.filter((item) => item !== stato)
        : [...prev, stato]
    );
  };

  const getStatoContrattoLabel = (stato?: StatoContratto) => {
    if (stato === "REGOLARE") return "In regola";
    if (stato === "SCADUTO") return "Non in regola";
    return "Assente";
  };

  const renderStatoContratto = (stato?: StatoContratto) => {
    if (stato === "REGOLARE") {
      return (
        <span className="inline-flex min-w-[94px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-extrabold text-emerald-700">
          In regola
        </span>
      );
    }

    if (stato === "SCADUTO") {
      return (
        <span className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-extrabold text-orange-700">
          Non in regola
        </span>
      );
    }

    return (
      <span className="inline-flex min-w-[84px] items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[12px] font-extrabold text-red-600">
        Assente
      </span>
    );
  };

  const handleExportToExcel = () => {
    const dataToExport = dipendenti.map((d) => ({
      Cognome: d.cognome,
      Nome: d.nome,
      Email: d.email,
      Telefono: `${d.prefisso}/${d.telefono}`,
      Contratto: getStatoContrattoLabel(statiContratto[d.id]),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operatori");
    XLSX.writeFile(workbook, "operatori.xlsx");
  };

  const filteredAndSortedDipendenti = useMemo(() => {
    const keyword = ricercaKeyword.toLowerCase();

    return [...dipendenti]
      .filter((dipendente) => {
        const matchesKeyword =
          dipendente.cognome.toLowerCase().includes(keyword) ||
          dipendente.nome.toLowerCase().includes(keyword) ||
          dipendente.email.toLowerCase().includes(keyword) ||
          dipendente.telefono.toLowerCase().includes(keyword);

        const stato = statiContratto[dipendente.id] ?? "ASSENTE";
        const matchesContratto = statiSelezionati.includes(stato);

        return matchesKeyword && matchesContratto;
      })
      .sort((a, b) => {
        const cognomeA = a.cognome.toLowerCase();
        const cognomeB = b.cognome.toLowerCase();
        if (cognomeA < cognomeB) return sortDirection === "asc" ? -1 : 1;
        if (cognomeA > cognomeB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [dipendenti, ricercaKeyword, sortDirection, statiContratto, statiSelezionati]);

  return (
    <section className="m-6" style={{ fontFamily: "'Mulish', sans-serif" }}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-6 border-b border-[#e4ebe8] pb-5">
          <div>
            <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#007a55]">
              Lista operatori
            </h1>
            <p className="mt-1 text-[14px] font-medium text-[#7a7a7a]">
              Consulta gli operatori, gestisci i profili e accedi rapidamente a presenze e credenziali.
            </p>
          </div>
          <Button
            onClick={handleNewOperator}
            className="h-10 rounded-xl bg-[#007a55] px-5 text-[14px] font-extrabold text-white shadow-[0_5px_14px_rgba(0,122,85,0.15)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#006f4d]"
          >
            Crea nuovo operatore
          </Button>
        </div>

        <div className="flex items-center justify-between bg-[#ecf3f1] px-6 py-4">
          <div className="flex items-center gap-3">
            <Input
              type="text"
              placeholder="Ricerca per keyword"
              value={ricercaKeyword}
              onChange={(e) => setRicercaKeyword(e.target.value)}
              className="w-[280px] rounded-xl border border-gray-300 bg-white px-3 py-2"
            />

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="h-10 min-w-[180px] justify-between rounded-xl border border-[#b8d2c8] bg-white px-4 font-bold text-[#007a55] hover:bg-[#f7fbf9] hover:text-[#006f4d]"
                >
                  Contratto ({statiSelezionati.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[220px] p-3">
                <div className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#656565]">
                  Stato contratto
                </div>
                <div className="space-y-2">
                  {statoContrattoOptions.map((option) => (
                    <label
                      key={option.value}
                      className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[14px] font-semibold text-[#3f4942] hover:bg-[#f3f8f6]"
                    >
                      <input
                        type="checkbox"
                        checked={statiSelezionati.includes(option.value)}
                        onChange={() => toggleStatoContratto(option.value)}
                        className="h-4 w-4 accent-[#007a55]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <Button
            className="rounded-xl border border-[#b8d2c8] bg-white px-6 font-bold text-[#007a55] shadow-sm hover:bg-[#f7fbf9] hover:text-[#006f4d]"
            onClick={handleExportToExcel}
          >
            Scarica .csv
          </Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#e7e7e7] bg-white">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-[#ebebeb]">
              <TableRow className="text-[15px] font-bold">
                <TableHead
                  className="w-[16%] cursor-pointer whitespace-nowrap text-[#656565]"
                  onClick={() => setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))}
                >
                  Cognome
                  {sortDirection === "asc" ? (
                    <ArrowUp className="ml-1 inline h-4 w-4" />
                  ) : (
                    <ArrowDown className="ml-1 inline h-4 w-4" />
                  )}
                </TableHead>
                <TableHead className="w-[14%] whitespace-nowrap text-[#656565]">Nome</TableHead>
                <TableHead className="w-[28%] text-[#656565]">Email</TableHead>
                <TableHead className="w-[18%] whitespace-nowrap text-[#656565]">Telefono</TableHead>
                <TableHead className="w-[13%] whitespace-nowrap text-[#656565]">Contratto</TableHead>
                <TableHead className="w-[11%] whitespace-nowrap text-right text-[#656565]">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedDipendenti.map((dipendente) => (
                <TableRow key={dipendente.id} className="text-[15px] text-[#2e2e2e]">
                  <TableCell className="font-bold">{dipendente.cognome}</TableCell>
                  <TableCell className="font-bold">{dipendente.nome}</TableCell>
                  <TableCell className="truncate" title={dipendente.email}>{dipendente.email}</TableCell>
                  <TableCell className="whitespace-nowrap">{dipendente.prefisso}/{dipendente.telefono}</TableCell>
                  <TableCell>{renderStatoContratto(statiContratto[dipendente.id])}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(dipendente)}
                        title="Modifica operatore"
                        aria-label="Modifica operatore"
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-[#007a55] bg-white text-[#007a55] transition-colors hover:bg-[#007a55] hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => mostraPresenze(dipendente)}
                        title="Presenze operatore"
                        aria-label="Presenze operatore"
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-[#007a55] bg-white text-[#007a55] transition-colors hover:bg-[#007a55] hover:text-white"
                      >
                        <ListChecks className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => reinviaPassword(dipendente)}
                        title="Reinvia password"
                        aria-label="Reinvia password"
                        className="h-9 w-9 shrink-0 cursor-pointer rounded-lg border border-[#007a55] bg-white text-[#007a55] transition-colors hover:bg-[#007a55] hover:text-white"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-8 py-6 shadow-lg">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#007a55] border-t-transparent" />
            <span className="text-lg font-semibold text-[#007a55]">Invio in corso...</span>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nuovo Operatore</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Nome</Label>
                <Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Cognome</Label>
                <Input id="cognome" value={formData.cognome} onChange={(e) => setFormData({ ...formData, cognome: e.target.value })} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Email</Label>
                <Input id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Telefono</Label>
                <div className="col-span-3 flex gap-2">
                  <Select value={formData.prefisso} onValueChange={(value) => setFormData({ ...formData, prefisso: value })}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{prefissi.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input id="telefono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="flex-1" required />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>G.P.G.</Label>
                <Switch checked={formData.gpg} onCheckedChange={handleGpgChange} />
              </div>
            </div>
            <DialogFooter><Button type="submit">Aggiungi</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Operatori;
