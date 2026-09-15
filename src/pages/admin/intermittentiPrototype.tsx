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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Archive,
  Eye,
  FileCheck2,
  Plus,
  Trash2,
} from "lucide-react";
import { generaUniIntermittentiXml } from "@/utils/intermittentiXml";
import { IntermittentiDialog } from "./dialog/IntermittentiDialog";
import { NuovaChiamataIntermittenteDialog } from "./dialog/NuovaChiamataIntermittenteDialog";
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

const creaXmlStoricoDemo = (dataInizio: string, dataFine?: string) =>
  generaUniIntermittentiXml({
    cfDatore: "DEMOAA00A00A000A",
    emailDatore: "demo@detelder.com",
    annullamento: false,
    lavoratori: [
      {
        cfLavoratore: "DEMOAA00A00A000A",
        codiceComunicazione: "372920101",
        dataInizio,
        dataFine,
      },
    ],
  });

const chiamateDemo: ChiamataIntermittenteDemo[] = [
  {
    id: 1,
    dataInizio: "2026-09-10",
    dataFine: "2026-09-12",
    stato: "INVIATA",
    dataOraInvio: "2026-09-10T09:42:00",
    xmlArchiviato: creaXmlStoricoDemo("2026-09-10", "2026-09-12"),
  },
  {
    id: 2,
    dataInizio: "2026-09-18",
    dataFine: "2026-09-18",
    stato: "INVIATA",
    dataOraInvio: "2026-09-18T08:55:00",
    xmlArchiviato: creaXmlStoricoDemo("2026-09-18", "2026-09-18"),
  },
  {
    id: 3,
    dataInizio: "2026-09-23",
    dataFine: "2026-09-25",
    stato: "XML_GENERATO",
    xmlArchiviato: creaXmlStoricoDemo("2026-09-23", "2026-09-25"),
  },
];

const operatoreDemo = {
  nome: "Mario",
  cognome: "Demo",
  codiceFiscale: "DEMOAA00A00A000A",
};

const formatData = (value: string) => {
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const IntermittentiPrototype = () => {
  const [archivioOpen, setArchivioOpen] = useState(false);
  const [nuovaChiamataOpen, setNuovaChiamataOpen] = useState(false);
  const [contrattoSelezionato, setContrattoSelezionato] =
    useState<ContrattoChiamataPadre | null>(null);

  const apriArchivio = () => {
    setContrattoSelezionato(contrattoPadreDemo);
    setArchivioOpen(true);
  };

  const apriNuovaChiamata = () => {
    setContrattoSelezionato(contrattoPadreDemo);
    setNuovaChiamataOpen(true);
  };

  const secondaryActionClass =
    "h-8 w-8 p-0 border border-[#b7d7cc] bg-[#f5faf8] text-[#315e51] hover:bg-[#dfece8] hover:text-[#007a55]";

  return (
    <section className="m-6 space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-[#2e2e2e]">CONTRATTI</h1>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            Nessun invio reale
          </span>
        </div>
        <p className="mt-2 max-w-4xl text-sm text-[#5e5d5d]">
          Gestione del contratto a chiamata e delle comunicazioni intermittenti collegate.
          Detelder conserva lo storico delle chiamate e l'XML generato; le ricevute PEC
          restano nella casella PEC utilizzata per l'invio.
        </p>
      </div>

      <div className="rounded-[10px] border bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-semibold uppercase tracking-wide text-[#007a55]">
              Operatore demo
            </div>
            <div className="text-xl font-bold text-[#2e2e2e]">Mario Demo</div>
            <div className="text-sm text-[#5e5d5d]">CF: DEMOAA00A00A000A</div>
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
                <div className="space-y-1.5">
                  <div className="font-semibold">Contratto a chiamata</div>
                  <div className="inline-flex rounded-full border border-[#b7d7cc] bg-[#f5faf8] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#007a55]">
                    {chiamateDemo.length} chiamate
                  </div>
                </div>
              </TableCell>
              <TableCell>{formatData(contrattoPadreDemo.dataInizio)}</TableCell>
              <TableCell>{formatData(contrattoPadreDemo.dataFine)}</TableCell>
              <TableCell>1.273,50 €</TableCell>
              <TableCell>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#315e51] transition-colors hover:bg-[#ecf3f1] hover:text-[#007a55]"
                  title="Visualizza contratto firmato"
                  aria-label="Visualizza contratto firmato"
                >
                  <Eye className="h-4 w-4" />
                </button>
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
                <div className="flex flex-wrap items-center gap-1.5">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        onClick={apriNuovaChiamata}
                        aria-label="Crea una nuova chiamata intermittente"
                        className="h-8 w-8 p-0 bg-[#007a55] text-white hover:bg-[#006449]"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Crea una nuova chiamata intermittente
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={apriArchivio}
                        aria-label={`Apri archivio chiamate: ${chiamateDemo.length} registrate`}
                        className={secondaryActionClass}
                      >
                        <Archive className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Archivio chiamate · {chiamateDemo.length} registrate
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label="Visualizza contratto"
                        className={secondaryActionClass}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Visualizza contratto</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label="Elimina contratto"
                        className={secondaryActionClass}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">Elimina contratto</TooltipContent>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <IntermittentiDialog
        open={archivioOpen}
        setOpen={setArchivioOpen}
        contrattoPadre={contrattoSelezionato}
        operatore={operatoreDemo}
        chiamateIniziali={chiamateDemo}
      />

      <NuovaChiamataIntermittenteDialog
        open={nuovaChiamataOpen}
        setOpen={setNuovaChiamataOpen}
        contrattoPadre={contrattoSelezionato}
        operatore={operatoreDemo}
      />
    </section>
  );
};

export default IntermittentiPrototype;
