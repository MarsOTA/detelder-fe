import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle, Pencil } from "lucide-react";

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

    onSubmit(e, motivazionePulita, idPayroll, idTurno);
    setMotivazione("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-auto bottom-0 w-full max-w-none translate-y-0 rounded-b-none rounded-t-[24px] border-[#315467] bg-[#071b28] p-0 text-white sm:bottom-auto sm:top-1/2 sm:max-w-[430px] sm:-translate-y-1/2 sm:rounded-[24px]">
        <div className="mx-auto mt-2 h-1 w-14 rounded-full bg-[#88a5b5] sm:hidden" />
        <div className="p-5">
          <DialogHeader className="text-left">
            <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#e69b18]/60 bg-[#3d2b1d] text-[#ffb529]">
              <Pencil className="h-5 w-5" />
            </div>
            <DialogTitle className="text-[22px] font-black text-[#08efbd]">Modifica orario turno</DialogTitle>
            <p className="mt-1 text-[13px] leading-5 text-[#9eb1bb]">
              Invia una richiesta di correzione per questa giornata. La motivazione sarà visibile a chi gestisce la rendicontazione.
            </p>
          </DialogHeader>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="motivazione-modifica" className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.07em] text-[#b6c5cc]">
                Motivazione della modifica
              </label>
              <Input
                id="motivazione-modifica"
                placeholder="Es. orario di uscita non corretto"
                value={motivazione}
                onChange={(e) => setMotivazione(e.target.value)}
                required
                minLength={5}
                className="h-12 rounded-xl border-[#315467] bg-[#0c2635] text-[15px] text-white placeholder:text-[#68818e] focus-visible:border-[#08dba8] focus-visible:ring-[#08dba8]/20"
              />
            </div>

            <div className="flex gap-2.5 rounded-xl border border-[#684d1c] bg-[#312619] p-3 text-[12px] leading-5 text-[#e7d7ba]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#ffb529]" />
              <span>La giornata resterà segnalata come modificata fino alla verifica della richiesta.</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                className="h-11 rounded-xl border-[#315467] bg-[#0b202e] text-[#c8d5dc] hover:bg-[#123142] hover:text-white"
              >
                Annulla
              </Button>
              <Button
                type="submit"
                className="h-11 rounded-xl bg-[#ffad20] font-black text-[#211300] hover:bg-[#ffbc45]"
              >
                Invia modifica
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};