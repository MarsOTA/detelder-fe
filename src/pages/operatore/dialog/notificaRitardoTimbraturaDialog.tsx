import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface notificaRitardoTimbraturaDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  checkIn: boolean;
  onSubmit: (
    e: React.FormEvent,
    checkIn: boolean,
    motivazione: string
  ) => void;
}

export const NotificaRitardoTimbraturaDialog = ({
  open,
  setOpen,
  checkIn,
  onSubmit
}: notificaRitardoTimbraturaDialogProps) => {
  const [motivazione, setMotivazione] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const motivazionePulita = motivazione.trim();

    if (motivazionePulita.length < 5) {
      alert("La motivazione deve contenere almeno 5 caratteri.");
      return;
    }

    onSubmit(e, checkIn, motivazionePulita);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-full md:max-w-[1000px] top-[20%] -translate-y-0">
        <DialogHeader>
          <DialogTitle>Inserimento giustificativo</DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Stai effettuando la timbratura in ritardo rispetto all'orario previsto
          </p>
        </DialogHeader>
        <form
          className="space-y-4"
          onSubmit={handleSubmit}
        >
          <Input
            placeholder="Descrivi la tua motivazione del ritardo"
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
