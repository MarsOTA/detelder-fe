import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { AlertCircle, Pencil } from "lucide-react";
import { OperatorBottomSheet } from "./OperatorBottomSheet";

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
    <OperatorBottomSheet
      open={open}
      setOpen={setOpen}
      title="Modifica orario turno"
      subtitle="Invia una richiesta di correzione per questa giornata."
      icon={<Pencil className="h-5 w-5" />}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
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
            className="h-12 rounded-xl border-[#2b4457] bg-[#102536] text-[15px] text-white placeholder:text-[#68818e] focus-visible:border-[#16f0c4] focus-visible:ring-[#16f0c4]/20"
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
            className="h-11 rounded-xl border-[#2b4457] bg-[#102536] text-[#c8d5dc] hover:bg-[#18354a] hover:text-white"
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
    </OperatorBottomSheet>
  );
};
