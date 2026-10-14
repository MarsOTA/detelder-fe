import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface noteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  formDatiNoteTurno: {
    nota: string;
    idTurno: number;
  };
  setFormDatiNoteTurno: (data: { nota: string; idTurno: number; }) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClickNuovo: (idTurno: number) => void;
  idTurno: number;
}

export const NoteDialog = ({
  open,
  setOpen,
  formDatiNoteTurno,
  setFormDatiNoteTurno,
  onSubmit,
  onClickNuovo,
  idTurno
}: noteDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Note</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>Modifica note</Label>
            <Input
              value={formDatiNoteTurno.nota}
              placeholder="Aggiungi note"
              onChange={(e) =>
                setFormDatiNoteTurno({
                  ...formDatiNoteTurno,
                  nota: e.target.value,
                })
              }
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button type="submit">
              {"Modifica "}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
