import {useEffect,useState} from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from "@/components/ui/dialog";
import {CheckCircle2,Download,FileCode2} from "lucide-react";
import {leggiDatoreIntermittenti} from "@/utils/chiamateHR";
import type {DatoreIntermittenti} from "@/utils/chiamateHR";
import {salvaChiamataHR,listaChiamateHR} from "@/utils/chiamateHR";
import {hrPratiche,hrLeggiCodiceComunicazione} from "@/utils/hrWorkflow";
import {puoPreparareChiamata} from "@/utils/hrContrattoRestrittivo";
import {downloadXml,generaUniIntermittentiXml} from "@/utils/intermittentiXml";
import type {ContrattoChiamataPadre,OperatoreIntermittente} from "./IntermittentiDialog";

interface Props{
 open:boolean;setOpen:(open:boolean)=>void;contrattoPadre:ContrattoChiamataPadre|null;
 operatore:OperatoreIntermittente;idOperatore:number;onSaved?:()=>void;
 dataInizioProposta?:string;dataFineProposta?:string;
}
const fmt=(v?:string)=>v?.match(/^\d{4}-\d{2}-\d{2}$/)?v.split("-").reverse().join("/"):(v||"—");
export const NuovaChiamataIntermittenteDialog=({open,setOpen,contrattoPadre,operatore,idOperatore,onSaved,dataInizioProposta,dataFineProposta}:Props)=>{
 const [inizio,setInizio]=useState("");
 const [fine,setFine]=useState("");
 const [datore,setDatore]=useState<DatoreIntermittenti|null>(null);
 const [codice,setCodice]=useState("");
 const [loaded,setLoaded]=useState(false);
 const [errore,setErrore]=useState("");
 const [xml,setXml]=useState("");
 const [salvato,setSalvato]=useState<number|null>(null);
 const [saving,setSaving]=useState(false);
 const [duplicates,setDuplicates]=useState(false);
 useEffect(()=>{
  if(!open)return;
  let active=true;
  setInizio(dataInizioProposta||"");
  setFine(dataFineProposta||dataInizioProposta||"");
  setErrore("");setXml("");setSalvato(null);setDuplicates(false);setDatore(null);setCodice("");setLoaded(false);
  void (async()=>{
   try{
    const cfg=await leggiDatoreIntermittenti();
    const practices=await hrPratiche();
    const matching=practices.filter(p=>p.idOperatore===idOperatore&&p.tipologia==="CHIAMATA"&&!!contrattoPadre&&String(p.dataInizio||"").slice(0,10)===contrattoPadre.dataInizio).sort((a,b)=>b.id-a.id)[0];
    const unilav=matching?await hrLeggiCodiceComunicazione(matching.id):{codice:""};
    if(active){setDatore(cfg);setCodice(unilav.codice||"");}
   }catch(e){if(active)setErrore("Impossibile leggere i dati per la comunicazione: "+(e instanceof Error?e.message:"errore di caricamento"));}
   finally{if(active)setLoaded(true);}
  })();
  return ()=>{active=false};
 },[open,idOperatore,contrattoPadre?.idContratto,dataInizioProposta,dataFineProposta]);
 const changed=(start:string,end:string)=>{setInizio(start);setFine(end);setXml("");setSalvato(null);setDuplicates(false);setErrore("")};
 useEffect(()=>{
  if(!open||!contrattoPadre||!inizio||!fine)return;
  let active=true;
  void listaChiamataHRCheck().then(exists=>{if(active)setDuplicates(exists)}).catch(e=>{if(active){setDuplicates(true);setErrore("Verifica delle chiamate esistenti non disponibile: "+(e instanceof Error?e.message:"errore"))}});
  async function listaChiamataHRCheck(){
   const existing=await listaChiamateHR(idOperatore,contrattoPadre!.idContratto);
   return existing.some(ch=>ch.dataInizio<=fine&&ch.dataFine>=inizio);
  }
  return ()=>{active=false};
 },[open,contrattoPadre?.idContratto,idOperatore,inizio,fine]);
 const valido=puoPreparareChiamata(contrattoPadre,inizio,fine);
 const generate=()=>{
  setErrore("");
  if(!valido){setErrore("Il contratto padre deve essere in vigore e il turno entro la scadenza.");return}
  if(duplicates){setErrore("Esiste già una chiamata per almeno uno dei giorni selezionati. Consulta l’archivio.");return}
  if(!datore||!loaded){setErrore("Dati della comunicazione non disponibili. Riapri la scheda o verifica la configurazione.");return}
  try{setXml(generaUniIntermittentiXml({cfDatore:datore.codiceFiscale,emailDatore:datore.email,lavoratori:[{cfLavoratore:operatore.codiceFiscale,codiceComunicazione:codice,dataInizio:inizio,dataFine:fine}]}));}
  catch(e){setErrore(e instanceof Error?e.message:"Impossibile generare XML")}
 };
 const save=async()=>{
  if(!contrattoPadre||!xml||salvato||saving)return;
  if(!puoPreparareChiamata(contrattoPadre,inizio,fine)){setErrore("Contratto padre non in vigore o turno oltre scadenza: la chiamata non può essere salvata.");return;}
  if(duplicates){setErrore("Chiamata già presente: non puoi crearne un’altra per lo stesso giorno.");return;}
  setSaving(true);setErrore("");
  try{const calls=await listaChiamateHR(idOperatore,contrattoPadre.idContratto);if(calls.some(ch=>ch.dataInizio<=fine&&ch.dataFine>=inizio))throw new Error("Chiamata già presente nel periodo selezionato. Non verrà creata una seconda chiamata.");}catch(e){setSaving(false);setErrore(e instanceof Error?e.message:"Impossibile verificare chiamate già esistenti");return;}
  try{const result=await salvaChiamataHR(idOperatore,contrattoPadre.idContratto,inizio,fine,xml);setSalvato(result.id);onSaved?.();}
  catch(e){setErrore(e instanceof Error?e.message:"Impossibile salvare la bozza")}
  finally{setSaving(false)}
 };
 const download=()=>{if(xml)downloadXml(xml,`UNI_Intermittenti_${operatore.cognome.replace(/[^a-zA-Z0-9_-]/g,"_")}_${inizio}.xml`)};
 return <Dialog open={open} onOpenChange={setOpen}>
  <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
   <DialogHeader><DialogTitle className="text-xl text-[#007a55]">Gestione chiamata intermittente</DialogTitle>
    <DialogDescription>{operatore.nome} {operatore.cognome} · Prepara la comunicazione associata al contratto padre, senza reinserire i dati anagrafici.</DialogDescription>
   </DialogHeader>
   {!contrattoPadre?<p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm">Contratto padre non selezionato.</p>:<>
    <div className="rounded-lg border border-[#cfe2dc] bg-[#f5faf8] px-4 py-3"><p className="text-sm font-semibold text-[#007a55]">Contratto padre #{contrattoPadre.idContratto}</p><p className="text-xs text-gray-600">{fmt(contrattoPadre.dataInizio)} – {fmt(contrattoPadre.dataFine)}</p></div>
    <div className="grid grid-cols-2 gap-3"><label className="text-sm">Chiamata dal<Input className="mt-1" type="date" min={contrattoPadre.dataInizio} max={contrattoPadre.dataFine} value={inizio} onChange={e=>changed(e.target.value,fine)}/></label>
     <label className="text-sm">Al<Input className="mt-1" type="date" min={inizio||contrattoPadre.dataInizio} max={contrattoPadre.dataFine} value={fine} onChange={e=>changed(inizio,e.target.value)}/></label></div>
    {duplicates&&<p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Chiamata già presente per questo giorno: consulta l’archivio.</p>}
    {errore&&<p role="alert" className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{errore}</p>}
    {salvato&&<p role="status" className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">Bozza chiamata #{salvato} registrata. Non è stata inviata alcuna comunicazione.</p>}
    <div className="flex flex-wrap justify-end gap-2 border-t pt-4">
     <Button variant="outline" type="button" onClick={()=>setOpen(false)}>Chiudi</Button>
     <Button type="button" onClick={generate} disabled={!valido||!loaded||!datore||!!salvato||duplicates}><FileCode2 className="mr-2 h-4 w-4"/>Genera XML</Button>
     {xml&&<><Button variant="outline" type="button" onClick={download}><Download className="mr-2 h-4 w-4"/>Scarica XML</Button>
      <Button type="button" disabled={saving||!!salvato} onClick={()=>void save()}><CheckCircle2 className="mr-2 h-4 w-4"/>{saving?"Salvataggio…":salvato?"Bozza salvata":"Salva bozza"}</Button></>}
    </div>
    <p className="text-xs text-gray-500">La comunicazione non viene inviata automaticamente. L'approvazione Admin e l'esito di invio sono passaggi distinti da registrare nel workflow HR.</p>
   </>}
  </DialogContent>
 </Dialog>;
};
