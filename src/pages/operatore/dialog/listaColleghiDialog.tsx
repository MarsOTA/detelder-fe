import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Circle, Crown } from "lucide-react"

type ListaColleghi = {
  nome: string
  cognome: string
  telefono: string
  oraInizio: string
  oraFine: string
  tipoMansione: string
  teamLeader: boolean
  gpg: boolean
  timbraturaEffettuata: boolean
}

interface ListaColleghiDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  listaColleghi: ListaColleghi[];
}

export const ListaColleghiDialog = ({
  open,
  setOpen,
  listaColleghi,
}: ListaColleghiDialogProps) => {
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
            <span>Colleghi</span>
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
          {listaColleghi.map((collega, index) => (
            <div key={index} className="dialog-collega-content">
              <div>
                <div className="dialog-collega-text" >
                  <Circle
                    size={10}
                    strokeWidth={0}
                    fill={
                      collega.timbraturaEffettuata
                        ? "#00D68E"
                        : "#B8B8B8"
                    }
                    color={
                      collega.timbraturaEffettuata
                        ? "#00D68E"
                        : "#B8B8B8"
                    }
                    style={{ marginRight: 8 }}
                  />

                  {collega.nome} {collega.cognome}

                </div>
                <div className="dialog-orario-collega" >{collega.tipoMansione} {collega.oraInizio} - {collega.oraFine}</div>
             {/* MARCELLO - Team Leader con icona Crown Lucide */}
              {collega.teamLeader && (
                  <div className="dialog-team-leader">
                      <Crown
                          size={14}
                          strokeWidth={1.5}
                      />
                      <span>Team leader</span>
                  </div>
              )}
              </div>
              <span className="dialog-telefono-collega" >
                <a href={`tel:${collega.telefono}`} >
                  {collega.telefono}
                </a>
              </span>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
