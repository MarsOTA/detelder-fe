import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface contestazioneTimbraturaDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (
    e: React.FormEvent,
    motivazione: string,
    idPayroll?: number,
    idTurno?: number
  ) => void;
  idPayroll?: number;
  idTurno?: number;
}

export const ContestazioneTimbraturaDialog = ({
  open,
  setOpen,
  onSubmit,
  idPayroll,
  idTurno
}: contestazioneTimbraturaDialogProps) => {
  const [motivazione, setMotivazione] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const motivazionePulita = motivazione.trim();

    if (motivazionePulita.length < 5) {
      alert("La motivazione deve contenere almeno 5 caratteri.");
      return;
    }

    onSubmit(
      e,
      motivazionePulita,
      idPayroll,
      idTurno
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full md:max-w-[1000px] top-[20%] -translate-y-0">
        <DialogHeader>
          <DialogTitle>Modifica orario Turno</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            MOTIVAZIONE DELLA NOTIFICA
          </p>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <Input
            placeholder="Descrivi il motivo della richiesta di modifica"
            value={motivazione}
            onChange={(e) => setMotivazione(e.target.value)}
            required
            minLength={5}
          />

          <div className="rounded-lg border border-border overflow-hidden">
            <div className="max-h-80 overflow-y-auto">

            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annulla
            </Button>
            <Button
              type="submit"
              className="bg-[#007A55] text-white hover:bg-[#006644]">
              Invia
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
