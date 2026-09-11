import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileCheck2, MailCheck, PhoneCall, Trash2, View } from "lucide-react";
import { IntermittentiDialog } from "./dialog/IntermittentiDialog";
import type {
  ChiamataIntermittenteDemo,
  ContrattoChiamataPadre,
} from "./dialog/IntermittentiDialog";

const contrattoPadreDemo: ContrattoChiamataPadre = {
  idContratto: 1042,
  tipologia: "CHIAMATA",
  dataInizio: "2026-09-01",
  dataFine: "2026-12-31",
};

const chiamateDemo: ChiamataIntermittenteDemo[] = [
  {
    id: 1,
    dataInizio: "2026-09-10",
    dataFine: "2026-09-12",
    stato: "CONSEGNATA",
    ricevuta: "ricevuta-pec-demo.eml",
  },
  {
    id: 2,
    dataInizio: "2026-09-18",
    dataFine: "2026-09-18",
    stato: "INVIATA",
  },
  {
    id: 3,
    dataInizio: "2026-09-23",
    dataFine: "2026-09-25",
    stato: "XML_GENERATO",
  },
];

const formatData = (value: string) => {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const IntermittentiPrototype = () => {
  const [open, setOpen] = useState(false);
  const [contrattoSelezionato, setContrattoSelezionato] =
    useState<ContrattoChiamataPadre | null>(null);

  const apriGestioneChiamate = () => {
    setContrattoSelezionato(contrattoPadreDemo);
    setOpen(true);
  };

  return (
    <section className="m-6 space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-[#2e2e2e]">
            Prototipo · Lavoro intermittente
          </h1>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Nessun invio reale
          </span>
        </div>
        <p className="mt-2 max-w-4xl text-sm text-[#5e5d5d]">
          Prova isolata della gerarchia contratto a chiamata (padre) → comunicazioni
          intermittenti (figlie), con generazione, anteprima e download XML. La funzione
          di invio al Ministero è mostrata ma volutamente disabilitata in questo step.
        </p>
      </div>

      <div className="rounded-[10px] border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-[#007a55]">
              Operatore demo
            </div>
            <div className="text-xl font-bold text-[#2e2e2e]">Jaime Angulo</div>
            <div className="text-sm text-[#5e5d5d]">CF: LNDMCL79D08F205X</div>
          </div>
          <div className="rounded-lg bg-[#ecf3f1] px-4 py-2 text-sm text-[#315e51]">
            Il prototipo non modifica DB, contratti o allegati reali.
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-[#ecf3f1] text-[16px] font-bold text-[#5e5d5d]">
              <TableHead>Tipo Contratto</TableHead>
              <TableHead>Data Inizio</TableHead>
              <TableHead>Data Fine</TableHead>
              <TableHead>Compenso</TableHead>
              <TableHead>Contratto firmato</TableHead>
              <TableHead>Unilav</TableHead>
              <TableHead>Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow className="text-[16px] font-normal text-[#2e2e2e]">
              <TableCell>
                <div className="space-y-1">
                  <div className="font-semibold">Contratto a chiamata</div>
                  <div className="inline-flex rounded-full border border-[#b7d7cc] bg-[#f5faf8] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#007a55]">
                    Padre
                  </div>
                  <div className="text-xs text-[#5e5d5d]">
                    {chiamateDemo.length} comunicazioni figlie
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatData(contrattoPadreDemo.dataInizio)}</TableCell>
              <TableCell>{formatData(contrattoPadreDemo.dataFine)}</TableCell>
              <TableCell>1.273,50 €</TableCell>
              <TableCell>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-[#007a55]"
                    title="Esempio contratto firmato"
                  >
                    <View className="h-4 w-4" />
                    <span className="text-xs">Contratto</span>
                  </button>
                  <div
                    className="flex items-center gap-1 text-xs font-medium text-[#007a55]"
                    title="Esempio di ricevuta associata a una chiamata figlia"
                  >
                    <MailCheck className="h-4 w-4" />
                    1 ricevuta PEC
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 text-[#007a55]"
                  title="Esempio UNILAV"
                >
                  <FileCheck2 className="h-4 w-4" />
                  <span className="text-xs">Unilav</span>
                </button>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={apriGestioneChiamate}
                    className="bg-[#007a55] text-white hover:bg-[#006449]"
                  >
                    <PhoneCall className="mr-2 h-4 w-4" />
                    Gestisci chiamate
                  </Button>
                  <button type="button" className="cursor-pointer" title="Visualizza contratto">
                    <View className="h-4 w-4" />
                  </button>
                  <button type="button" className="cursor-pointer" title="Elimina contratto">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <div className="rounded-[10px] border border-dashed border-[#b7d7cc] bg-[#f5faf8] p-4 text-sm text-[#315e51]">
        <strong>Regola del prototipo:</strong> una nuova chiamata può essere creata solo
        partendo dalla riga di un contratto a chiamata padre. Le date della figlia sono
        vincolate all'intervallo del contratto padre.
      </div>

      <IntermittentiDialog
        open={open}
        setOpen={setOpen}
        contrattoPadre={contrattoSelezionato}
        operatore={{
          nome: "Jaime",
          cognome: "Angulo",
          codiceFiscale: "LNDMCL79D08F205X",
        }}
        chiamateIniziali={chiamateDemo}
      />
    </section>
  );
};

export default IntermittentiPrototype;
