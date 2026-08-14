import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface creaClienteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formDatiCliente: {
    ragioneSociale: string;
    shortName: string;
    piva_cfiscale: string;
  };
  setFormDatiCliente: (data: { ragioneSociale: string; shortName: string; piva_cfiscale: string }) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

export const CreaClienteDialog = ({
  open,
  setOpen,
  formDatiCliente,
  setFormDatiCliente,
  onSubmit,
  isEditing
}: creaClienteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-[#007A55]">{isEditing ? "Modifica Cliente" : "Nuovo Cliente"}</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label className="text-[#007A55]" >Ragione Sociale</Label>
            <Input
              value={formDatiCliente.ragioneSociale}
              placeholder="Inserisci ragione sociale"
              onChange={(e) =>
                setFormDatiCliente({
                  ...formDatiCliente,
                  ragioneSociale: e.target.value,
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#007A55]" >Short Name</Label>
            <Input
              value={formDatiCliente.shortName}
              placeholder="Inserisci short name"
              onChange={(e) =>
                setFormDatiCliente({
                  ...formDatiCliente,
                  shortName: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#007A55]">P.IVA</Label>
            <Input
              value={formDatiCliente.piva_cfiscale}
              placeholder="Inserisci p. iva"
              onChange={(e) =>
                setFormDatiCliente({
                  ...formDatiCliente,
                  piva_cfiscale: e.target.value,
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
              {isEditing ? "Modifica Cliente" : "Salva Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
