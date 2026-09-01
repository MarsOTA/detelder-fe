// CreaEventoDialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import LocalitaEvento from "@/utils/LocalitaEvento";
interface Cliente {
  idCliente: number;
  ragioneSociale: string;
}

interface Brand {
  idBrand: number;
  nome: string;
}

interface IndirizzoBrand {
  idIndirizzo: number;
  via: string;
}

interface FormDataEvento {
  idCliente: number;
  idBrand: number;
  idIndirizzo: number;
  indirizzo: string;
  dataIniziale: string;
  dataFinale: string;
  note: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: FormDataEvento;
  setFormData: (data: FormDataEvento) => void;
  clienti: Cliente[];
  brands: Brand[];
  indirizzi: IndirizzoBrand[],
  creaEvento: (e: React.FormEvent) => void;
  clienteOnValueChange: (id: number) => void;
  brandOnValueChange: (id: number) => void;
  indirizzoOnValueChange: (id: number) => void;
  handleDataInizioChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isAltroSelected: boolean;
  setIsAltroSelected: (val: boolean) => void;
}

export default function CreaEventoDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  clienti,
  brands,
  indirizzi,
  creaEvento,
  clienteOnValueChange,
  brandOnValueChange,
  indirizzoOnValueChange,
  handleDataInizioChange,
  isAltroSelected,
  setIsAltroSelected
}: Props) {
  const [isBrandSelected, setIsBrandSelected] = useState(false);

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
    setIsBrandSelected(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-[#007a55] hover:bg-[#007a55] cursor-pointer rounded-full px-6">
          CREA NUOVO EVENTO
        </Button>
      </DialogTrigger>

      <DialogContent showCloseButton={false} className="admin-create-event-dialog">
        <DialogHeader>
          <DialogTitle className="text-[#007a55] font-semibold">
            Crea evento
          </DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={creaEvento}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#007a55]">Cliente</Label>
              <Select onValueChange={(value) => clienteOnValueChange(parseInt(value))} required>
                <SelectTrigger className="w-full"><SelectValue placeholder="Seleziona cliente" /></SelectTrigger>
                <SelectContent>{clienti.map((c) => <SelectItem key={c.idCliente} value={c.idCliente.toString()}>{c.ragioneSociale}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#007a55]">Brand</Label>
              <Select onValueChange={(value) => { setIsBrandSelected(!!value); setIsAltroSelected(false); brandOnValueChange(parseInt(value)); }} required>
                <SelectTrigger className="w-full"><SelectValue placeholder="Seleziona brand" /></SelectTrigger>
                <SelectContent>{brands.map((b) => <SelectItem key={b.idBrand} value={b.idBrand.toString()}>{b.nome}</SelectItem>)}</SelectContent>
              </Select>
            </div>

            <div className="space-y-2 w-full md:col-span-2">
              <Label className="text-[#007a55]">Località evento</Label>
              <Select onValueChange={(value) => { const isAltro = value === "altro"; setIsAltroSelected(isAltro); if (!isAltro) indirizzoOnValueChange(parseInt(value)); }} required>
                <SelectTrigger className="w-full"><SelectValue placeholder="Seleziona località" /></SelectTrigger>
                <SelectContent>
                  {indirizzi.map((b) => <SelectItem key={b.idIndirizzo} value={b.idIndirizzo.toString()}>{b.via}</SelectItem>)}
                  {isBrandSelected && <SelectItem value="altro">ALTRO</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {isAltroSelected && (
              <div className="space-y-2 w-full md:col-span-2">
                <LocalitaEvento localitaEventoValue={formData.indirizzo} onValueChange={(val) => setFormData({ ...formData, indirizzo: val })} />
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-[#007a55]">Data Inizio Evento</Label>
              <Input type="date" required onChange={handleDataInizioChange} />
            </div>

            <div className="space-y-2">
              <Label className="text-[#007a55]">Data Fine Evento</Label>
              <Input type="date" required value={formData.dataFinale} onChange={(e) => setFormData({ ...formData, dataFinale: e.target.value })} />
            </div>

            <div className="space-y-2 w-full md:col-span-2">
              <Label className="text-[#007a55]">Note (opzionale)</Label>
              <Input className="w-full" placeholder="Note per l'evento..." value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} />
            </div>
          </div>

          <div className="admin-create-event-actions flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" className="admin-dialog-secondary" onClick={() => { resetForm(); onOpenChange(false); }}>
              Annulla
            </Button>
            <Button type="submit" className="admin-dialog-primary bg-[#007a55] text-white hover:bg-[#006347]">
              Salva evento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
