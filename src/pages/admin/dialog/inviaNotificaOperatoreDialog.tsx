import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LockKeyholeOpen } from "lucide-react";

interface inviaNotificaOperatoreDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  //onSubmit: (e: React.FormEvent) => void;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  onClickNuovo: () => void;
  onClickAnnulla: () => void;
  almenoUnOperatoreAssegnato: boolean;
  // idOperatoreSelezionato: number | undefined;
}

export const InviaNotificaOperatoreDialog = ({
  open,
  setOpen,
  onSubmit,
  onClickNuovo,
  onClickAnnulla,
  almenoUnOperatoreAssegnato,
}: inviaNotificaOperatoreDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          onClick={() => onClickNuovo()}
          className="cursor-pointer rounded-full bg-[#d52e14] hover:bg-[#b82610] text-white w-7 h-7 p-0 transition"
        >
          <LockKeyholeOpen className="h-4 w-4 text-white" />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!almenoUnOperatoreAssegnato
              ? "Nessun Operatore selezionato"
              : "Vuoi inviare notifica all'operatore?"}
          </DialogTitle>
        </DialogHeader>

        {!almenoUnOperatoreAssegnato ? (
          <div className="mt-4 space-y-4">
            Impossibile inviare un messaggio: nessun operatore selezionato.
            <div className="flex justify-end">
              <Button type="button" variant="outline" onClick={onClickAnnulla}>
                Ok
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClickAnnulla}>
                No
              </Button>
              <Button type="submit">
                si
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
