import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react"

type TurnoEvento = {
  titoloEvento: string
  nomeCognomeReferente: string
  telefonoReferente: string
}

interface ReferenteEventoDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  turnoSelezionato?: TurnoEvento;
}

export const ReferenteEventoDialog = ({
  open,
  setOpen,
  turnoSelezionato,
}: ReferenteEventoDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="
          sheet-dialog-core

          translate-x-0
          translate-y-0

          data-[state=open]:animate-in
          data-[state=closed]:animate-out

          data-[state=open]:slide-in-from-bottom-full
          data-[state=closed]:slide-out-to-bottom-full

          data-[state=open]:duration-500
          data-[state=closed]:duration-500

          [&>button:last-of-type]:hidden

        "
      >
        <DialogHeader>
          <DialogTitle className="dialog-evento-title">
            <span>Referente evento</span>
            <Button
              type="button"
              onClick={() => setOpen(false)}
              className="dialog-btn-chiudi"
            >
              <X
                style={{ color: "#f7fcff" }}
                strokeWidth={2}
              />
            </Button>

          </DialogTitle>
        </DialogHeader>

        <div className="dialog-evento-content">
          <div className="dialog-collega-content">
            <div>
              <div className="dialog-collega-text" >
                {turnoSelezionato?.nomeCognomeReferente}
              </div>
              <div className="dialog-orario-collega" >{turnoSelezionato?.titoloEvento}</div>
            </div>
            <span className="dialog-telefono-collega" >
              <a href={`tel:${turnoSelezionato?.telefonoReferente}`} >
                {turnoSelezionato?.telefonoReferente}
              </a>
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
