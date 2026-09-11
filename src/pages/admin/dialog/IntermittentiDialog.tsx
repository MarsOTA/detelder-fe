import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Download, FileCode2, ShieldCheck } from "lucide-react";

export interface ContrattoChiamataPadre {
  idContratto: number;
  tipologia: "CHIAMATA";
  dataInizio: string;
  dataFine: string;
}

export interface OperatoreIntermittente {
  nome: string;
  cognome: string;
  codiceFiscale: string;
}

export type StatoChiamata = "DA_GENERARE" | "XML_GENERATO" | "INVIATA";

export interface ChiamataIntermittenteDemo {
  id: number;
  dataInizio: string;
  dataFine?: string;
  stato: StatoChiamata;
  xmlArchiviato?: string;
  dataOraInvio?: string;
}

interface IntermittentiDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  contrattoPadre: ContrattoChiamataPadre | null;
  operatore: OperatoreIntermittente;
  chiamateIniziali?: ChiamataIntermittenteDemo[];
}

const formatData = (value?: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const formatDataOra = (value?: string) => {
  if (!value) return "";
  const [data, ora = ""] = value.split("T");
  const dataFormattata = formatData(data);
  const oraFormattata = ora.slice(0, 5);
  return oraFormattata ? `${dataFormattata} · ${oraFormattata}` : dataFormattata;
};

const statoLabel: Record<StatoChiamata, string> = {
  DA_GENERARE: "Da generare",
  XML_GENERATO: "XML generato",
  INVIATA: "Inviata",
};

const statoClass: Record<StatoChiamata, string> = {
  DA_GENERARE: "bg-amber-50 text-amber-700 border-amber-200",
  XML_GENERATO: "bg-[#f5faf8] text-[#315e51] border-[#b7d7cc]",
  INVIATA: "bg-[#e8f4ef] text-[#007a55] border-[#b7d7cc]",
};

const scaricaTesto = (
  contenuto: string,
  nomeFile: string,
  mimeType = "text/plain;charset=utf-8",
) => {
  const blob = new Blob([contenuto], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeFile;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const IntermittentiDialog = ({
  open,
  setOpen,
  contrattoPadre,
  chiamateIniziali = [],
}: IntermittentiDialogProps) => {
  const periodoPadre = useMemo(() => {
    if (!contrattoPadre) return "";
    return `${formatData(contrattoPadre.dataInizio)} → ${formatData(
      contrattoPadre.dataFine,
    )}`;
  }, [contrattoPadre]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#007a55]">
            Archivio chiamate intermittenti
          </DialogTitle>
          <DialogDescription>
            Storico delle comunicazioni collegate al contratto a chiamata. Detelder
            conserva l'XML e, per le chiamate inviate, data e ora dell'invio. Le ricevute
            PEC restano consultabili direttamente nella casella PEC del mittente.
          </DialogDescription>
        </DialogHeader>

        {!contrattoPadre ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Nessun contratto a chiamata padre selezionato.
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-lg border border-[#cfe2dc] bg-[#f5faf8] p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#007a55]">
                    Contratto a chiamata · padre
                  </div>
                  <div className="mt-1 text-lg font-semibold text-[#2e2e2e]">
                    Contratto #{contrattoPadre.idContratto}
                  </div>
                  <div className="text-sm text-[#5e5d5d]">Periodo: {periodoPadre}</div>
                </div>
                <div className="rounded-full border border-[#b7d7cc] bg-white px-3 py-1 text-xs font-semibold text-[#007a55]">
                  {chiamateIniziali.length} chiamate registrate
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#007a55]" />
                <h3 className="font-semibold text-[#2e2e2e]">Chiamate registrate</h3>
              </div>

              {chiamateIniziali.length === 0 ? (
                <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
                  Nessuna chiamata ancora registrata per questo contratto.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {chiamateIniziali.map((chiamata) => (
                    <div key={chiamata.id} className="rounded-lg border bg-white p-4">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="min-w-[190px]">
                          <div className="font-medium text-[#2e2e2e]">
                            Chiamata #{chiamata.id}
                          </div>
                          <div className="text-sm text-[#5e5d5d]">
                            {formatData(chiamata.dataInizio)} → {formatData(chiamata.dataFine)}
                          </div>
                        </div>

                        <div className="min-w-[150px]">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statoClass[chiamata.stato]}`}
                          >
                            {statoLabel[chiamata.stato]}
                          </span>
                          {chiamata.dataOraInvio && (
                            <div className="mt-1 text-xs text-[#6b6b6b]">
                              Inviata il {formatDataOra(chiamata.dataOraInvio)}
                            </div>
                          )}
                        </div>

                        <div className="ml-auto">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={!chiamata.xmlArchiviato}
                            onClick={() =>
                              chiamata.xmlArchiviato &&
                              scaricaTesto(
                                chiamata.xmlArchiviato,
                                `UNI_Intermittenti_chiamata_${chiamata.id}.xml`,
                                "application/xml;charset=utf-8",
                              )
                            }
                            className="border-[#b7d7cc] bg-[#f5faf8] text-[#315e51] hover:bg-[#dfece8] hover:text-[#007a55]"
                          >
                            {chiamata.xmlArchiviato ? (
                              <Download className="mr-1.5 h-4 w-4" />
                            ) : (
                              <FileCode2 className="mr-1.5 h-4 w-4" />
                            )}
                            Scarica XML
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
