import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { ClockAlert } from "lucide-react";
import { OperatorBottomSheet } from "./OperatorBottomSheet";

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
    setMotivazione("");
  };

  return (
    <OperatorBottomSheet
      open={open}
      setOpen={setOpen}
      title="Inserimento giustificativo"
      subtitle="Stai effettuando la timbratura in ritardo rispetto all'orario previsto."
      icon={<ClockAlert className="h-5 w-5" />}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="motivazione-ritardo" className="mb-1.5 block text-[11px] font-black uppercase tracking-[0.07em] text-[#b6c5cc]">
            Motivazione del ritardo
          </label>
          <Input
            id="motivazione-ritardo"
            placeholder="Descrivi la motivazione del ritardo"
            value={motivazione}
            onChange={(e) => setMotivazione(e.target.value)}
            required
            minLength={5}
            className="h-12 rounded-xl border-[#2b4457] bg-[#102536] text-[15px] text-white placeholder:text-[#68818e] focus-visible:border-[#16f0c4] focus-visible:ring-[#16f0c4]/20"
          />
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
            className="h-11 rounded-xl bg-[#067a48] font-black text-white hover:bg-[#05663d]"
          >
            Invia
          </Button>
        </div>
      </form>
    </OperatorBottomSheet>
  );
};
