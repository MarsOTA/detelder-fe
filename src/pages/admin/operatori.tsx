import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, ArrowUp, ArrowDown, KeyRound, ListChecks } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import React, { useEffect, useState, useMemo } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import type { Dipendente } from "@/entity";
import { prefissi } from "@/pages/admin/utils/prefissi"

const Operatori = () => {

  const [formData, setFormData] = useState({
    nome: "",
    cognome: "",
    email: "",
    prefisso: "",
    telefono: "",
    gpg: false
  });

  const navigate = useNavigate();

  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  type SortDirection = "asc" | "desc"

  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [ricercaKeyword, setRicercaKeyword] = useState("")

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fethcOperatori();
  }, [])

  const handleEdit = (dipendente: Dipendente) => {
    navigate(`/admin/dettaglio-operatore/${dipendente.id}`);
  };

  const mostraPresenze = (dipendente: Dipendente) => {
    navigate(`/admin/timbrature-operatore/${dipendente.id}`);
  }

  const reinviaPassword = async (dipendente: Dipendente) => {

    const conferma = window.confirm(
      `Vuoi inviare nuovamente la password a ${dipendente.nome} ${dipendente.cognome}?`
    );

    if (!conferma) return;

    setIsLoading(true);

    try {
      console.log('Reinvia passord per:', dipendente.nome);

      const resp = await fetch(`${ezystaffBEUrl}operatori/reinviaPassword/${dipendente.id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
      });

      if (!resp.ok) {
        throw new Error(`Errore nella richiesta: ${resp.status}`);
      }

      const data = await resp.json();
      console.log(data);
      alert(data.message);

      return data;

    } catch (error) {
      console.error(`Errore durante l'invio della password :`, error);
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
      gpg: false
    });

    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resp = await fetch(ezystaffBEUrl + 'operatori', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      method: "POST",
      credentials: 'include',
      body: JSON.stringify(formData)
    });
    const data = await resp.json();
    console.log(data);

    setIsDialogOpen(false);
    fethcOperatori();

    if (!data.success) {
      alert(`Errore: ${data.message}\nDettagli: ${data.error || 'Nessun dettaglio disponibile'}`);
      return;
    }
  };

  const fethcOperatori = async () => {
    const resp = await fetch(ezystaffBEUrl + 'operatori', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      credentials: 'include',
    })
    const data = await resp.json();
    setDipendenti(data);
  }

  const handleGpgChange = (gpg: boolean) => {
    setFormData((prev) => ({
      ...prev,
      gpg: gpg,
    }));
  }

  const handleExportToExcel = () => {
    let dataToExport: any[] = [];

    dataToExport = dipendenti.map(d => ({
      Cognome: d.cognome,
      Nome: d.nome,
      Email: d.email,
      Telefono: `${d.prefisso}/${d.telefono}`,
      G_P_G: d.gpg ? "Si" : "No",
      Eventi_Assegnati: d.turniAttivi,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operatori");
    XLSX.writeFile(workbook, "operatori.xlsx");
  };

  const filteredAndSortedDipendenti = useMemo(() => {
    const keyword = ricercaKeyword.toLowerCase()

    return [...dipendenti]
      .filter((dipendente) =>
        dipendente.cognome.toLowerCase().includes(keyword) ||
        dipendente.nome.toLowerCase().includes(keyword) ||
        dipendente.email.toLowerCase().includes(keyword) ||
        dipendente.telefono.toLowerCase().includes(keyword)
      )
      .sort((a, b) => {
        const cognomeA = a.cognome.toLowerCase()
        const cognomeB = b.cognome.toLowerCase()

        if (cognomeA < cognomeB) return sortDirection === "asc" ? -1 : 1
        if (cognomeA > cognomeB) return sortDirection === "asc" ? 1 : -1
        return 0
      })

  }, [dipendenti, ricercaKeyword, sortDirection])

  return (
    <section className="m-6" style={{ fontFamily: "'Mulish', sans-serif" }}>
      <div className="space-y-6">
        <h1 className="text-[38px] font-black leading-[1.05] tracking-[-0.035em] text-[#007a55]">
          Lista operatori
        </h1>
        <Button
          onClick={handleNewOperator}
          className="rounded-[18px] bg-[#007a55] hover:bg-[#007a55] px-6 cursor-pointer">
          CREA NUOVO OPERATORE
        </Button>
        <div className="flex items-center justify-between bg-[#ecf3f1] px-6 py-4 mb-1">
          <div>
            <Input
              type="text"
              placeholder="Ricerca per keyword"
              value={ricercaKeyword}
              onChange={(e) => setRicercaKeyword(e.target.value)}
              className="border border-gray-300 rounded-l-md px-2 py-1 w-48 bg-white"
            />
          </div>
          <div>
            <Button className="rounded-[18px] bg-[#5e8a7a] hover:bg-[#5e8a7a] cursor-pointer pl-8 pr-8"
              onClick={handleExportToExcel}
            >
              Scarica .csv
            </Button>
          </div>
        </div>
        <Table>
          <TableHeader className="bg-[#ebebeb]">
            <TableRow className="text-[16px] font-bold">
              <TableHead
                className="text-[#656565] cursor-pointer"
                onClick={() =>
                  setSortDirection(prev => (prev === "asc" ? "desc" : "asc"))
                }
              >
                Cognome {sortDirection === "asc" ? <ArrowUp className="h-4 w-4 inline ml-1" /> : <ArrowDown className="h-4 w-4 inline ml-1" />}
              </TableHead>
              <TableHead className="text-[#656565]">Nome</TableHead>
              <TableHead className="text-[#656565]">Email</TableHead>
              <TableHead className="text-[#656565]">Telefono</TableHead>
              <TableHead className="text-[#656565]">G.P.G.</TableHead>
              <TableHead className="text-[#656565]">Eventi Assegnati</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedDipendenti.map((dipendente) => (
              <TableRow className="text-[16px] text-[#2e2e2e]">
                <TableCell className="font-bold" >{dipendente.cognome}</TableCell>
                <TableCell className="font-bold" >{dipendente.nome}</TableCell>
                <TableCell>{dipendente.email}</TableCell>
                <TableCell>{dipendente.prefisso}/{dipendente.telefono}</TableCell>
                <TableCell>{dipendente.gpg ? "Si" : "No"}</TableCell>
                <TableCell>{dipendente.turniAttivi}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(dipendente)}
                      title="Modifica operatore"
                      className="cursor-pointer rounded-[5px] border border-[#007a55] bg-white text-[#007a55] hover:bg-[#007a55] hover:text-white transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => mostraPresenze(dipendente)}
                      title="Presenze operatore"
                      className="cursor-pointer rounded-[5px] border border-[#007a55] bg-white text-[#007a55] hover:bg-[#007a55] hover:text-white transition-colors duration-200"
                    >
                      <ListChecks className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => reinviaPassword(dipendente)}
                      title="Reinvia password"
                      className="cursor-pointer rounded-[5px] border border-[#007a55] bg-white text-[#007a55] hover:bg-[#007a55] hover:text-white transition-colors duration-200"
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

      {isLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white px-8 py-6 rounded-xl shadow-lg flex flex-col items-center gap-4">
            <div className="animate-spin h-10 w-10 border-4 border-[#007a55] border-t-transparent rounded-full"></div>
            <span className="text-[#007a55] font-semibold text-lg">
              Invio in corso...
            </span>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {"Nuovo Operatore"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label >Nome</Label>
                <Input id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="col-span-3"
                  required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label >Cognome</Label>
                <Input id="cognome"
                  value={formData.cognome}
                  onChange={(e) => setFormData({ ...formData, cognome: e.target.value })}
                  className="col-span-3"
                  required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label >Email</Label>
                <Input id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="col-span-3"
                  required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Telefono</Label>
                <div className="col-span-3 flex gap-2">
                  <Select
                    value={formData.prefisso}
                    onValueChange={(value) =>
                      setFormData({ ...formData, prefisso: value })
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {prefissi.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    className="flex-1"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>G.P.G.</Label>
                <Switch
                  checked={formData.gpg}
                  onCheckedChange={handleGpgChange}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="submit">
                {"Aggiungi"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  )
}

export default Operatori