import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Download,
  Eye,
  FileCode2,
  MailCheck,
  Plus,
  Send,
  ShieldCheck,
} from "lucide-react";
import {
  downloadXml,
  generaUniIntermittentiXml,
} from "@/utils/intermittentiXml";

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
  provaInvio?: string;
  ricevuta?: string;
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

const scaricaTesto = (contenuto: string, nomeFile: string, mimeType = "text/plain;charset=utf-8") => {
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

const visualizzaTesto = (contenuto: string, mimeType = "text/plain;charset=utf-8") => {
  const blob = new Blob([contenuto], { type: mimeType });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const IntermittentiDialog = ({
  open,
  setOpen,
  contrattoPadre,
  operatore,
  chiamateIniziali = [],
}: IntermittentiDialogProps) => {
  const [cfDatore, setCfDatore] = useState("LNDMCL79D08F205X");
  const [emailDatore, setEmailDatore] = useState("info@detelder.com");
  const [codiceComunicazione, setCodiceComunicazione] = useState("");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [annullamento, setAnnullamento] = useState(false);
  const [xmlGenerato, setXmlGenerato] = useState("");
  const [errore, setErrore] = useState("");

  const periodoPadre = useMemo(() => {
    if (!contrattoPadre) return "";
    return `${formatData(contrattoPadre.dataInizio)} → ${formatData(
      contrattoPadre.dataFine,
    )}`;
  }, [contrattoPadre]);

  useEffect(() => {
    if (!open) {
      setXmlGenerato("");
      setErrore("");
      setCodiceComunicazione("");
      setDataInizio("");
      setDataFine("");
      setAnnullamento(false);
    }
  }, [open]);

  const invalidaXml = () => {
    if (xmlGenerato) setXmlGenerato("");
    if (errore) setErrore("");
  };

  const generaXml = () => {
    if (!contrattoPadre) return;

    setErrore("");

    if (!dataInizio) {
      setErrore("Inserisci la data di inizio della chiamata.");
      return;
    }

    if (
      dataInizio < contrattoPadre.dataInizio ||
      dataInizio > contrattoPadre.dataFine ||
      (dataFine &&
        (dataFine < contrattoPadre.dataInizio ||
          dataFine > contrattoPadre.dataFine))
    ) {
      setErrore(
        "La chiamata deve ricadere nel periodo del contratto a chiamata padre.",
      );
      return;
    }

    if (dataFine && dataFine < dataInizio) {
      setErrore("La data di fine non può precedere la data di inizio.");
      return;
    }

    try {
      const xml = generaUniIntermittentiXml({
        cfDatore,
        emailDatore,
        annullamento,
        lavoratori: [
          {
            cfLavoratore: operatore.codiceFiscale,
            codiceComunicazione,
            dataInizio,
            dataFine,
          },
        ],
      });
      setXmlGenerato(xml);
    } catch (error) {
      setErrore(error instanceof Error ? error.message : "Errore nella generazione XML.");
    }
  };

  const scaricaXml = () => {
    if (!xmlGenerato) return;
    const safeSurname = operatore.cognome.replace(/[^a-zA-Z0-9_-]/g, "_");
    downloadXml(
      xmlGenerato,
      `UNI_Intermittenti_${safeSurname}_${dataInizio || "bozza"}.xml`,
    );
  };

  const contenutoProvaInvio = (chiamata: ChiamataIntermittenteDemo) =>
    [
      "DETELDER - PROTOTIPO PROVA INVIO",
      `Chiamata #${chiamata.id}`,
      `Lavoratore: ${operatore.nome} ${operatore.cognome}`,
      `Codice fiscale: ${operatore.codiceFiscale}`,
      `Periodo: ${formatData(chiamata.dataInizio)} - ${formatData(chiamata.dataFine)}`,
      "Destinatario: intermittenti@pec.lavoro.gov.it",
      "",
      "Nel prodotto finale questo file sarà la copia integrale del messaggio realmente inviato,",
      "con data/ora, destinatario, oggetto, Message-ID e allegato XML associato.",
    ].join("\n");

  const contenutoRicevuta = (chiamata: ChiamataIntermittenteDemo) =>
    [
      "DETELDER - PROTOTIPO RICEVUTA PEC",
      `Chiamata #${chiamata.id}`,
      `Periodo: ${formatData(chiamata.dataInizio)} - ${formatData(chiamata.dataFine)}`,
      "",
      "Nel prodotto finale verrà conservata qui la ricevuta PEC originale acquisita dalla casella.",
    ].join("\n");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[920px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#007a55]">
            Comunicazioni lavoro intermittente
          </DialogTitle>
          <DialogDescription>
            Prototipo Detelder: la singola chiamata è sempre figlia di un contratto a
            chiamata esistente. Nessuna email viene inviata da questa versione.
          </DialogDescription>
        </DialogHeader>

        {!contrattoPadre ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Nessun contratto a chiamata padre selezionato. Non è possibile creare una
            comunicazione intermittente.
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-lg border border-[#cfe2dc] bg-[#f5faf8] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
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
                  {chiamateIniziali.length} chiamate figlie
                </div>
              </div>
            </section>

            <section>
              <div className="mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#007a55]" />
                <h3 className="font-semibold text-[#2e2e2e]">
                  Comunicazioni intermittenti · figlie
                </h3>
              </div>

              {chiamateIniziali.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Nessuna chiamata ancora registrata per questo contratto.
                </div>
              ) : (
                <div className="space-y-2">
                  {chiamateIniziali.map((chiamata) => {
                    const numeroDocumenti =
                      Number(Boolean(chiamata.xmlArchiviato)) +
                      Number(Boolean(chiamata.provaInvio)) +
                      Number(Boolean(chiamata.ricevuta));

                    return (
                      <div key={chiamata.id} className="rounded-lg border bg-white p-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
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
                        </div>

                        {numeroDocumenti > 0 && (
                          <details className="mt-3 rounded-md border border-[#dce9e5] bg-[#f8fbfa] px-3 py-2">
                            <summary className="cursor-pointer text-sm font-semibold text-[#007a55]">
                              Archivio documenti e prove · {numeroDocumenti}
                            </summary>
                            <div className="mt-3 space-y-2">
                              {chiamata.xmlArchiviato && (
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-2.5">
                                  <div className="flex items-center gap-2 text-sm">
                                    <FileCode2 className="h-4 w-4 text-blue-600" />
                                    <div>
                                      <div className="font-medium">XML archiviato</div>
                                      <div className="text-xs text-[#6b6b6b]">
                                        File esatto associato a questa chiamata
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        visualizzaTesto(chiamata.xmlArchiviato!, "application/xml;charset=utf-8")
                                      }
                                    >
                                      <Eye className="mr-1.5 h-4 w-4" /> Visualizza
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        scaricaTesto(
                                          chiamata.xmlArchiviato!,
                                          `UNI_Intermittenti_chiamata_${chiamata.id}.xml`,
                                          "application/xml;charset=utf-8",
                                        )
                                      }
                                    >
                                      <Download className="mr-1.5 h-4 w-4" /> Scarica
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {chiamata.provaInvio && (
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-2.5">
                                  <div className="flex items-center gap-2 text-sm">
                                    <Send className="h-4 w-4 text-violet-600" />
                                    <div>
                                      <div className="font-medium">Prova invio</div>
                                      <div className="text-xs text-[#6b6b6b]">
                                        Copia del messaggio inviato e relativi metadati
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => visualizzaTesto(contenutoProvaInvio(chiamata))}
                                    >
                                      <Eye className="mr-1.5 h-4 w-4" /> Visualizza
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        scaricaTesto(
                                          contenutoProvaInvio(chiamata),
                                          chiamata.provaInvio!,
                                          "message/rfc822;charset=utf-8",
                                        )
                                      }
                                    >
                                      <Download className="mr-1.5 h-4 w-4" /> Scarica
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {chiamata.ricevuta && (
                                <div className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-white p-2.5">
                                  <div className="flex items-center gap-2 text-sm">
                                    <MailCheck className="h-4 w-4 text-emerald-600" />
                                    <div>
                                      <div className="font-medium">Ricevuta PEC di consegna</div>
                                      <div className="text-xs text-[#6b6b6b]">
                                        Ricevuta associata a questa specifica chiamata
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() => visualizzaTesto(contenutoRicevuta(chiamata))}
                                    >
                                      <Eye className="mr-1.5 h-4 w-4" /> Visualizza
                                    </Button>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        scaricaTesto(
                                          contenutoRicevuta(chiamata),
                                          chiamata.ricevuta!,
                                          "message/rfc822;charset=utf-8",
                                        )
                                      }
                                    >
                                      <Download className="mr-1.5 h-4 w-4" /> Scarica
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="rounded-lg border p-4">
              <div className="mb-4 flex items-center gap-2">
                <Plus className="h-5 w-5 text-[#007a55]" />
                <h3 className="font-semibold text-[#2e2e2e]">Nuova chiamata figlia</h3>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Operatore</span>
                  <Input value={`${operatore.nome} ${operatore.cognome}`} disabled />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Codice fiscale lavoratore</span>
                  <Input value={operatore.codiceFiscale} disabled />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">CF datore di lavoro</span>
                  <Input
                    value={cfDatore}
                    onChange={(event) => {
                      setCfDatore(event.target.value);
                      invalidaXml();
                    }}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Email datore di lavoro</span>
                  <Input
                    type="email"
                    value={emailDatore}
                    onChange={(event) => {
                      setEmailDatore(event.target.value);
                      invalidaXml();
                    }}
                  />
                </label>
                <label className="space-y-1.5 text-sm md:col-span-2">
                  <span className="font-medium">Codice comunicazione UNILAV</span>
                  <Input
                    value={codiceComunicazione}
                    placeholder="Facoltativo nel modello ministeriale"
                    onChange={(event) => {
                      setCodiceComunicazione(event.target.value);
                      invalidaXml();
                    }}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Data inizio prestazione</span>
                  <Input
                    type="date"
                    min={contrattoPadre.dataInizio}
                    max={contrattoPadre.dataFine}
                    value={dataInizio}
                    onChange={(event) => {
                      setDataInizio(event.target.value);
                      invalidaXml();
                    }}
                  />
                </label>
                <label className="space-y-1.5 text-sm">
                  <span className="font-medium">Data fine prestazione</span>
                  <Input
                    type="date"
                    min={dataInizio || contrattoPadre.dataInizio}
                    max={contrattoPadre.dataFine}
                    value={dataFine}
                    onChange={(event) => {
                      setDataFine(event.target.value);
                      invalidaXml();
                    }}
                  />
                </label>
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={annullamento}
                  onChange={(event) => {
                    setAnnullamento(event.target.checked);
                    invalidaXml();
                  }}
                  className="h-4 w-4 accent-[#007a55]"
                />
                Comunicazione di annullamento
              </label>

              {errore && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {errore}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={generaXml}
                  className="bg-[#007a55] text-white hover:bg-[#006449]"
                >
                  <FileCode2 className="mr-2 h-4 w-4" />
                  Genera XML
                </Button>
                <Button type="button" variant="outline" onClick={scaricaXml} disabled={!xmlGenerato}>
                  <Download className="mr-2 h-4 w-4" />
                  Scarica XML
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled
                  title="L'invio reale sarà collegato al backend/PEC nel prossimo step"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Invia al Ministero · step 2
                </Button>
              </div>
            </section>

            {xmlGenerato && (
              <section className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4">
                <div className="flex items-center gap-2 font-semibold text-emerald-700">
                  <CheckCircle2 className="h-5 w-5" />
                  XML generato e pronto per il controllo
                </div>
                <p className="mt-1 text-sm text-[#5e5d5d]">
                  Se modifichi un dato del form, l'XML viene invalidato e dovrà essere
                  rigenerato prima dell'invio.
                </p>
                <details className="mt-3 rounded-lg border bg-white p-3">
                  <summary className="cursor-pointer font-medium text-[#007a55]">
                    Visualizza XML generato
                  </summary>
                  <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-all rounded bg-[#f7f7f7] p-3 text-xs text-[#333]">
                    {xmlGenerato}
                  </pre>
                </details>
              </section>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
