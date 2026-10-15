import { useEffect, useMemo, useState } from "react";
import { salvaChiamataHR, aggiornaEsitoChiamataHR, leggiDatoreIntermittenti, salvaDatoreIntermittenti, DATORE_DETELDER_DEFAULT } from "@/utils/chiamateHR";
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
  FileCode2,
  Send,
} from "lucide-react";
import {
  downloadXml,
  generaUniIntermittentiXml,
} from "@/utils/intermittentiXml";
import type {
  ContrattoChiamataPadre,
  OperatoreIntermittente,
} from "./IntermittentiDialog";

interface NuovaChiamataIntermittenteDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  contrattoPadre: ContrattoChiamataPadre | null;
  operatore: OperatoreIntermittente;
  idOperatore: number;
  onSaved?: () => void;
  dataInizioProposta?: string;
  dataFineProposta?: string;
}

const formatData = (value?: string) => {
  if (!value) return "—";
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
};

export const NuovaChiamataIntermittenteDialog = ({
  open,
  setOpen,
  contrattoPadre,
  operatore,
  idOperatore,
  onSaved,
  dataInizioProposta,
  dataFineProposta,
}: NuovaChiamataIntermittenteDialogProps) => {
  const [cfDatore, setCfDatore] = useState(DATORE_DETELDER_DEFAULT.codiceFiscale);
  const [emailDatore, setEmailDatore] = useState(DATORE_DETELDER_DEFAULT.email);
  const [codiceComunicazione, setCodiceComunicazione] = useState("");
  const [dataInizio, setDataInizio] = useState("");
  const [dataFine, setDataFine] = useState("");
  const [annullamento, setAnnullamento] = useState(false);
  const [xmlGenerato, setXmlGenerato] = useState("");
  const [errore, setErrore] = useState("");
  const [salvatoId,setSalvatoId] = useState<number | null>(null);
  const [salvando,setSalvando] = useState(false);
  const [destinatarioPEC,setDestinatarioPEC] = useState("");
  const [datoreSalvato,setDatoreSalvato] = useState(true);
  const [salvandoDatore,setSalvandoDatore] = useState(false);
  const [caricamentoDatore,setCaricamentoDatore] = useState(false);
  const [messaggioDatore,setMessaggioDatore] = useState("");

  useEffect(()=>{
    if(!open)return;
    let active=true;
    setCaricamentoDatore(true);
    setDatoreSalvato(true);
    setCfDatore(DATORE_DETELDER_DEFAULT.codiceFiscale);
    setEmailDatore(DATORE_DETELDER_DEFAULT.email);
    setMessaggioDatore("");
    void leggiDatoreIntermittenti().then(d=>{
      if(!active)return;
      setCfDatore(d.codiceFiscale||DATORE_DETELDER_DEFAULT.codiceFiscale);
      setEmailDatore(d.email||DATORE_DETELDER_DEFAULT.email);
      setDatoreSalvato(true);
    }).catch(e=>{if(active)setMessaggioDatore("Dati DETELDER preimpostati. La configurazione condivisa non è stata letta dal server: "+(e instanceof Error?e.message:"Errore di caricamento"));}).finally(()=>{if(active)setCaricamentoDatore(false);});
    return ()=>{active=false;};
  },[open]);

  const registraDatore=async()=>{
    setSalvandoDatore(true);setMessaggioDatore("");
    try{
      const salvati=await salvaDatoreIntermittenti(cfDatore,emailDatore);
      setCfDatore(salvati.codiceFiscale);
      setEmailDatore(salvati.email);
      setDatoreSalvato(true);
      setMessaggioDatore("Dati datore salvati su Aiven: saranno già compilati nelle chiamate successive.");
    }catch(e){setMessaggioDatore(e instanceof Error?e.message:"Impossibile salvare i dati datore");}
    finally{setSalvandoDatore(false);}
  };

  const periodoPadre = useMemo(() => {
    if (!contrattoPadre) return "";
    return `${formatData(contrattoPadre.dataInizio)} → ${formatData(
      contrattoPadre.dataFine,
    )}`;
  }, [contrattoPadre]);

  useEffect(() => {
    if (open && dataInizioProposta) {
      setDataInizio(dataInizioProposta);
      setDataFine(dataFineProposta || dataInizioProposta);
      setXmlGenerato("");
      setSalvatoId(null);
    }
  }, [open, dataInizioProposta, dataFineProposta]);

  useEffect(() => {
    if (!open) {
      setCodiceComunicazione("");
      setDataInizio("");
      setDataFine("");
      setAnnullamento(false);
      setXmlGenerato("");
      setErrore("");
      setSalvatoId(null);
      setDestinatarioPEC("");
    }
  }, [open]);

  const invalidaXml = () => {
    setSalvatoId(null);
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

    if(!datoreSalvato){
      setErrore("Salva prima il codice fiscale e l’email del datore: verranno riutilizzati nelle chiamate successive.");
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
      setErrore(
        error instanceof Error ? error.message : "Errore nella generazione XML.",
      );
    }
  };


  const salva = async () => {
    if(!contrattoPadre || !xmlGenerato || salvando)return;
    setSalvando(true);setErrore("");
    try{
      const result=await salvaChiamataHR(idOperatore,contrattoPadre.idContratto,dataInizio,dataFine||dataInizio,xmlGenerato);
      setSalvatoId(result.id);onSaved?.();
    }catch(e){setErrore(e instanceof Error?e.message:"Salvataggio non riuscito");}
    finally{setSalvando(false);}
  };
  const preparaPEC = async () => {
    if(!contrattoPadre || !salvatoId || !xmlGenerato)return;
    if(!destinatarioPEC.includes("@")){setErrore("Inserisci l'indirizzo PEC del destinatario, verificato dall'HR.");return;}
    try {
      await aggiornaEsitoChiamataHR(idOperatore,contrattoPadre.idContratto,salvatoId,"PEC_PREPARATA");
      onSaved?.();
      scaricaXml();
      const subject=encodeURIComponent("UNI_Intermittenti - "+operatore.cognome+" "+dataInizio);
      const body=encodeURIComponent("Allego comunicazione UNI_Intermittenti in formato XML. Verificare allegato e destinatario prima dell'invio tramite casella PEC autorizzata.");
      window.location.href="mailto:"+encodeURIComponent(destinatarioPEC)+"?subject="+subject+"&body="+body;
    }catch(e){setErrore(e instanceof Error?e.message:"Preparazione PEC non riuscita");}
  };

  const scaricaXml = () => {
    if (!xmlGenerato) return;
    const safeSurname = operatore.cognome.replace(/[^a-zA-Z0-9_-]/g, "_");
    downloadXml(
      xmlGenerato,
      `UNI_Intermittenti_${safeSurname}_${dataInizio || "bozza"}.xml`,
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[760px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#007a55]">
            Nuova chiamata intermittente
          </DialogTitle>
          <DialogDescription>
            Crea una nuova comunicazione collegata al contratto a chiamata selezionato.
            La chiamata viene salvata su Aiven come bozza. La PEC va inviata dal gestore di posta.
          </DialogDescription>
        </DialogHeader>

        {!contrattoPadre ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Nessun contratto a chiamata padre selezionato.
          </div>
        ) : (
          <div className="space-y-5">
            <section className="rounded-lg border border-[#cfe2dc] bg-[#f5faf8] p-4">
              <div className="text-xs font-semibold uppercase tracking-wide text-[#007a55]">
                Contratto a chiamata · padre
              </div>
              <div className="mt-1 font-semibold text-[#2e2e2e]">
                Contratto #{contrattoPadre.idContratto}
              </div>
              <div className="text-sm text-[#5e5d5d]">
                Periodo valido: {periodoPadre}
              </div>
            </section>

            <section className="rounded-lg border bg-white p-4">
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
                      setDatoreSalvato(false);
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
                      setDatoreSalvato(false);
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
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Button type="button" variant="outline" onClick={()=>void registraDatore()} disabled={salvandoDatore||caricamentoDatore||datoreSalvato}>
                  {caricamentoDatore?"Caricamento dati…":salvandoDatore?"Salvataggio…":datoreSalvato?"Dati datore memorizzati":"Salva dati datore"}
                </Button>
                <span className="text-xs text-gray-600">Configurazione condivisa tra le chiamate e gli operatori.</span>
              </div>
              {messaggioDatore&&<p role="status" className="mt-2 text-sm text-[#315e51]">{messaggioDatore}</p>}

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

            <div className="rounded-md border bg-[#f5faf8] p-3">
              <label className="text-sm font-medium">PEC destinataria da verificare</label>
              <Input className="mt-1" type="email" value={destinatarioPEC} onChange={e=>setDestinatarioPEC(e.target.value)} placeholder="Indirizzo PEC ufficiale" />
              <p className="mt-1 text-xs text-gray-600">Il pulsante scarica l’XML e apre un’email. Devi allegare il file nella tua PEC: il sistema non segna automaticamente la comunicazione come inviata.</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-4">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Chiudi
              </Button>

              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={generaXml}
                  className="bg-[#007a55] text-white hover:bg-[#006449]"
                >
                  <FileCode2 className="mr-2 h-4 w-4" />
                  Genera XML
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={scaricaXml}
                  disabled={!xmlGenerato}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Scarica XML
                </Button>

                <Button type="button" variant="outline" onClick={()=>void salva()} disabled={!xmlGenerato||salvando||!!salvatoId}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />{salvatoId?"Salvata #"+salvatoId:(salvando?"Salvataggio…":"Salva chiamata")}
                </Button>
                <Button type="button" className="bg-[#007a55] text-white hover:bg-[#006449]" onClick={()=>void preparaPEC()} disabled={!salvatoId}>
                  <Send className="mr-2 h-4 w-4" />Prepara email PEC
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
