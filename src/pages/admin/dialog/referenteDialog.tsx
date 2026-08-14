import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

interface ReferenteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formDatiReferente: {
    nome: string;
    email: string;
    telefono: string;
  };
  setFormDatiReferente: (data: { nome: string; email: string; telefono: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClickNuovo: () => void;
  isEditing: boolean;
}

export const ReferenteDialog = ({
  open,
  setOpen,
  formDatiReferente,
  setFormDatiReferente,
  onSubmit,
  onClickNuovo,
  isEditing
}: ReferenteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={onClickNuovo}
          className="rounded-full bg-[#019165] hover:bg-[#019165] p-2 cursor-pointer">
          <UserPlus className="w-5 h-5" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#007A55]">{isEditing ? "Modifica Referente" : "Nuovo Referente"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label className="text-[#007A55]" >Nome</Label>
            <Input
              value={formDatiReferente.nome}
              placeholder="Inserisci nome e cognome"
              onChange={(e) =>
                setFormDatiReferente({
                  ...formDatiReferente,
                  nome: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#007A55]" >Email</Label>
            <Input
              value={formDatiReferente.email}
              placeholder="Inserisci email"
              onChange={(e) =>
                setFormDatiReferente({
                  ...formDatiReferente,
                  email: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#007A55]" >Telefono</Label>
            <Input
              value={formDatiReferente.telefono}
              placeholder="Inserisci telefono"
              onChange={(e) =>
                setFormDatiReferente({
                  ...formDatiReferente,
                  telefono: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>

            <Button 
              type="submit"
              className="bg-[#007A55] text-white hover:bg-[#006644]">
              {isEditing ? "Modifica Referente" : "Salva Referente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
