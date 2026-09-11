import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Download,
  FileArchive,
  FileCode2,
  ShieldCheck,
} from "lucide-react";

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

export type StatoChiamata =
  | "DA_GENERARE"
  | "XML_GENERATO"
  | "INVIATA"
  | "CONSEGNATA";

export interface ChiamataIntermittenteDemo {
  id: number;
  dataInizio: string;
  dataFine?: string;
  stato: StatoChiamata;
  xmlArchiviato?: string;
  ricevutaAccettazione?: string;
  ricevutaConsegna?: string;
}

interface IntermittentiDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  contrattoPadre: ContrattoChiamataPadre | null;
  operatore: OperatoreIntermittente;
  chiamateIniziali?: ChiamataIntermittenteDemo[];
}

interface ZipEntry {
  nome: string;
  contenuto: string;
}

const formatData = (value?: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

const statoLabel: Record<StatoChiamata, string> = {
  DA_GENERARE: "Da generare",
  XML_GENERATO: "XML generato",
  INVIATA: "Inviata",
  CONSEGNATA: "Consegnata PEC",
};

const statoClass: Record<StatoChiamata, string> = {
  DA_GENERARE: "bg-amber-50 text-amber-700 border-amber-200",
  XML_GENERATO: "bg-blue-50 text-blue-700 border-blue-200",
  INVIATA: "bg-violet-50 text-violet-700 border-violet-200",
  CONSEGNATA: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const scaricaBlob = (blob: Blob, nomeFile: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeFile;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const scaricaTesto = (
  contenuto: string,
  nomeFile: string,
  mimeType = "text/plain;charset=utf-8",
) => {
  scaricaBlob(new Blob([contenuto], { type: mimeType }), nomeFile);
};

const crc32 = (bytes: Uint8Array) => {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }

  return (crc ^ 0xffffffff) >>> 0;
};

const concatenaBytes = (parti: Uint8Array[]) => {
  const totale = parti.reduce((somma, parte) => somma + parte.length, 0);
  const risultato = new Uint8Array(totale);
  let offset = 0;

  for (const parte of parti) {
    risultato.set(parte, offset);
    offset += parte.length;
  }

  return risultato;
};

const creaZipNonCompresso = (entries: ZipEntry[]) => {
  const encoder = new TextEncoder();
  const partiLocali: Uint8Array[] = [];
  const partiCentrali: Uint8Array[] = [];
  let offsetLocale = 0;

  for (const entry of entries) {
    const nomeBytes = encoder.encode(entry.nome);
    const contenutoBytes = encoder.encode(entry.contenuto);
    const checksum = crc32(contenutoBytes);

    const headerLocale = new Uint8Array(30 + nomeBytes.length);
    const viewLocale = new DataView(headerLocale.buffer);
    viewLocale.setUint32(0, 0x04034b50, true);
    viewLocale.setUint16(4, 20, true);
    viewLocale.setUint16(6, 0, true);
    viewLocale.setUint16(8, 0, true);
    viewLocale.setUint16(10, 0, true);
    viewLocale.setUint16(12, 0x0021, true);
    viewLocale.setUint32(14, checksum, true);
    viewLocale.setUint32(18, contenutoBytes.length, true);
    viewLocale.setUint32(22, contenutoBytes.length, true);
    viewLocale.setUint16(26, nomeBytes.length, true);
    viewLocale.setUint16(28, 0, true);
    headerLocale.set(nomeBytes, 30);

    partiLocali.push(headerLocale, contenutoBytes);

    const headerCentrale = new Uint8Array(46 + nomeBytes.length);
    const viewCentrale = new DataView(headerCentrale.buffer);
    viewCentrale.setUint32(0, 0x02014b50, true);
    viewCentrale.setUint16(4, 20, true);
    viewCentrale.setUint16(6, 20, true);
    viewCentrale.setUint16(8, 0, true);
    viewCentrale.setUint16(10, 0, true);
    viewCentrale.setUint16(12, 0, true);
    viewCentrale.setUint16(14, 0x0021, true);
    viewCentrale.setUint32(16, checksum, true);
    viewCentrale.setUint32(20, contenutoBytes.length, true);
    viewCentrale.setUint32(24, contenutoBytes.length, true);
    viewCentrale.setUint16(28, nomeBytes.length, true);
    viewCentrale.setUint16(30, 0, true);
    viewCentrale.setUint16(32, 0, true);
    viewCentrale.setUint16(34, 0, true);
    viewCentrale.setUint16(36, 0, true);
    viewCentrale.setUint32(38, 0, true);
    viewCentrale.setUint32(42, offsetLocale, true);
    headerCentrale.set(nomeBytes, 46);
    partiCentrali.push(headerCentrale);

    offsetLocale += headerLocale.length + contenutoBytes.length;
  }

  const directoryCentrale = concatenaBytes(partiCentrali);
  const fineDirectory = new Uint8Array(22);
  const viewFine = new DataView(fineDirectory.buffer);
  viewFine.setUint32(0, 0x06054b50, true);
  viewFine.setUint16(4, 0, true);
  viewFine.setUint16(6, 0, true);
  viewFine.setUint16(8, entries.length, true);
  viewFine.setUint16(10, entries.length, true);
  viewFine.setUint32(12, directoryCentrale.length, true);
  viewFine.setUint32(16, offsetLocale, true);
  viewFine.setUint16(20, 0, true);

  const zipBytes = concatenaBytes([
    ...partiLocali,
    directoryCentrale,
    fineDirectory,
  ]);
  const zipBuffer = zipBytes.buffer.slice(
    zipBytes.byteOffset,
    zipBytes.byteOffset + zipBytes.byteLength,
  ) as ArrayBuffer;

  return new Blob([zipBuffer], { type: "application/zip" });
};

export const IntermittentiDialog = ({
  open,
  setOpen,
  contrattoPadre,
  operatore,
  chiamateIniziali = [],
}: IntermittentiDialogProps) => {
  const periodoPadre = useMemo(() => {
    if (!contrattoPadre) return "";
    return `${formatData(contrattoPadre.dataInizio)} → ${formatData(
      contrattoPadre.dataFine,
    )}`;
  }, [contrattoPadre]);

  const contenutoAccettazione = (chiamata: ChiamataIntermittenteDemo) =>
    [
      "DETELDER - PROTOTIPO RICEVUTA DI ACCETTAZIONE PEC",
      `Chiamata #${chiamata.id}`,
      `Lavoratore: ${operatore.nome} ${operatore.cognome}`,
      `Codice fiscale: ${operatore.codiceFiscale}`,
      `Periodo: ${formatData(chiamata.dataInizio)} - ${formatData(chiamata.dataFine)}`,
      "Destinatario: intermittenti@pec.lavoro.gov.it",
      "",
      "Nel prodotto finale questo file sarà la ricevuta di accettazione PEC originale",
      "acquisita dalla casella utilizzata per l'invio.",
    ].join("\n");

  const contenutoConsegna = (chiamata: ChiamataIntermittenteDemo) =>
    [
      "DETELDER - PROTOTIPO RICEVUTA DI AVVENUTA CONSEGNA PEC",
      `Chiamata #${chiamata.id}`,
      `Lavoratore: ${operatore.nome} ${operatore.cognome}`,
      `Codice fiscale: ${operatore.codiceFiscale}`,
      `Periodo: ${formatData(chiamata.dataInizio)} - ${formatData(chiamata.dataFine)}`,
      "Destinatario: intermittenti@pec.lavoro.gov.it",
      "",
      "Nel prodotto finale questo file sarà la ricevuta di avvenuta consegna PEC originale",
      "acquisita dalla casella utilizzata per l'invio.",
    ].join("\n");

  const scaricaProveConsegna = (chiamata: ChiamataIntermittenteDemo) => {
    const prove: ZipEntry[] = [];

    if (chiamata.ricevutaAccettazione) {
      prove.push({
        nome: chiamata.ricevutaAccettazione,
        contenuto: contenutoAccettazione(chiamata),
      });
    }

    if (chiamata.ricevutaConsegna) {
      prove.push({
        nome: chiamata.ricevutaConsegna,
        contenuto: contenutoConsegna(chiamata),
      });
    }

    if (prove.length === 0) return;

    if (prove.length === 1) {
      scaricaTesto(
        prove[0].contenuto,
        prove[0].nome,
        "message/rfc822;charset=utf-8",
      );
      return;
    }

    scaricaBlob(
      creaZipNonCompresso(prove),
      `Prove_PEC_chiamata_${chiamata.id}.zip`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#007a55]">
            Archivio chiamate intermittenti
          </DialogTitle>
          <DialogDescription>
            Storico delle comunicazioni collegate al contratto a chiamata. Da qui puoi
            scaricare direttamente l'XML trasmesso e le relative ricevute PEC.
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
                  {chiamateIniziali.map((chiamata) => {
                    const haProvePec = Boolean(
                      chiamata.ricevutaAccettazione || chiamata.ricevutaConsegna,
                    );

                    return (
                      <div key={chiamata.id} className="rounded-lg border bg-white p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div className="min-w-[190px]">
                            <div className="font-medium text-[#2e2e2e]">
                              Chiamata #{chiamata.id}
                            </div>
                            <div className="text-sm text-[#5e5d5d]">
                              {formatData(chiamata.dataInizio)} → {formatData(chiamata.dataFine)}
                            </div>
                          </div>

                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statoClass[chiamata.stato]}`}
                          >
                            {statoLabel[chiamata.stato]}
                          </span>

                          <div className="ml-auto flex flex-wrap gap-2">
                            <Button
                              type="button"
                              size="sm"
                              disabled={!chiamata.xmlArchiviato}
                              onClick={() =>
                                chiamata.xmlArchiviato &&
                                scaricaTesto(
                                  chiamata.xmlArchiviato,
                                  `UNI_Intermittenti_chiamata_${chiamata.id}.xml`,
                                  "application/xml;charset=utf-8",
                                )
                              }
                              className="bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-500"
                            >
                              <FileCode2 className="mr-1.5 h-4 w-4" />
                              Scarica XML
                            </Button>

                            <Button
                              type="button"
                              size="sm"
                              disabled={!haProvePec}
                              onClick={() => scaricaProveConsegna(chiamata)}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-500"
                              title={
                                chiamata.ricevutaAccettazione && chiamata.ricevutaConsegna
                                  ? "Scarica ZIP con ricevuta di accettazione e avvenuta consegna PEC"
                                  : "Scarica la ricevuta PEC disponibile"
                              }
                            >
                              {chiamata.ricevutaAccettazione && chiamata.ricevutaConsegna ? (
                                <FileArchive className="mr-1.5 h-4 w-4" />
                              ) : (
                                <Download className="mr-1.5 h-4 w-4" />
                              )}
                              Scarica prove consegna
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
