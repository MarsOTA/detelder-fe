import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileCheck2, FileText, UploadCloud, Eye, Trash2, ClipboardList } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import type { HRPratica } from "@/utils/hrWorkflow";
import {hrLeggiCodiceComunicazione,hrSalvaCodiceComunicazione} from "@/utils/hrWorkflow";

export type ContrattoSintesiHR = {
 idContratto:number; tipologia:string; dataInizio:string|null; dataFine:string|null;
 pathContrattoFirmato?:string|null; pathContrattoUnilav?:string|null
};
type DocKind="contrattoFirmato"|"contrattoUnilav";
type Props={
 contratti:ContrattoSintesiHR[];idOperatore:string|undefined;pratica?:HRPratica|null;
 codiceFiscale?:string|null;isHR?:boolean;azioni?:ReactNode;archivioChiamate?:ReactNode;onCreate?:()=>void;onPeriodSave?:(inizio:string,fine:string|null)=>Promise<void>;
 onDownload?:(contractId:number,kind:string)=>void;
 onUpload?:(event:ChangeEvent<HTMLInputElement>,contractId:number,kind:DocKind)=>void;
 onDelete?:(contractId:number,kind:"contratto"|"contrattoFirmato"|"contrattoUnilav")=>Promise<void>;
};
const nice:Record<string,string>={CHIAMATA:"Contratto a chiamata",OCCASIONALE:"Contratto occasionale",TEMPO_DETERMINATO:"Contratto a tempo determinato",CONTRATTO_TEMPO_DETERMINATO:"Contratto a tempo determinato",TEMPO_INDETERMINATO:"Contratto a tempo indeterminato",CONTRATTO_TEMPO_INDETERMINATO:"Contratto a tempo indeterminato",CONSGNA_BENI_FORMAZIONE:"Consegna beni e formazione",FATTURA:"Collaborazione con fattura"};
const employers:Record<string,string>={DETELDER:"DETELDER",SOCIETA_APPALTO:"Società in appalto",AUTONOMO_PIVA:"Autonomo · P.IVA"};
const iso=(v:string|null|undefined)=>v?String(v).slice(0,10):"";
const isValid=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T12:00:00Z"));
const canonical=(v:string)=>v.replace(/^CONTRATTO_/,"");
export function ContrattoAttivoHR({contratti,pratica,codiceFiscale,isHR=false,azioni,archivioChiamate,onCreate,onPeriodSave,onDownload,onUpload,onDelete}:Props){
 const [inizio,setInizio]=useState("");
 const [fine,setFine]=useState("");
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [saved,setSaved]=useState(false);
 const [codice,setCodice]=useState("");
 const [codiceSalvato,setCodiceSalvato]=useState("");
 const [codiceBusy,setCodiceBusy]=useState(false);
 useEffect(()=>{if(!pratica)return;let active=true;void hrLeggiCodiceComunicazione(pratica.id).then(v=>{if(active){setCodice(v.codice);setCodiceSalvato(v.codice)}}).catch(()=>{});return ()=>{active=false}},[pratica?.id]);
 useEffect(()=>{setInizio(iso(pratica?.dataInizio));setFine(iso(pratica?.dataFine));setError("");setSaved(false)},[pratica?.id,pratica?.dataInizio,pratica?.dataFine]);
 const matches=pratica?contratti.filter(c=>canonical(c.tipologia)===canonical(pratica.tipologia)).sort((a,b)=>iso(b.dataInizio).localeCompare(iso(a.dataInizio))):[];
 // A document created before this assignment must not be shown as generated for the current case.
 const creato=matches.find(c=>!!c.dataInizio&&!!pratica?.dataInizio&&iso(c.dataInizio)===iso(pratica.dataInizio))||null;
 const req=[
  {label:"Codice fiscale lavoratore",ok:!!codiceFiscale?.trim()},
  {label:"Tipologia assegnata",ok:!!pratica?.tipologia},
  {label:"Datore di lavoro",ok:!!pratica?.datore},
  {label:"Data inizio",ok:isValid(inizio)},
  {label:"Periodo valido",ok:isValid(inizio)&&(!fine||(isValid(fine)&&fine>=inizio))}
 ];
 const ready=req.every(x=>x.ok);
 const hasUnilav=!!pratica&&["CHIAMATA","TEMPO_DETERMINATO","TEMPO_INDETERMINATO"].includes(canonical(pratica.tipologia));
 const save=async()=>{if(!onPeriodSave||!ready)return;setSaving(true);setError("");setSaved(false);
  try{await onPeriodSave(inizio,fine||null);setSaved(true)}catch(e){setError(e instanceof Error?e.message:"Salvataggio non riuscito")}finally{setSaving(false)}
 };
 const changed=!!pratica&&(inizio!==iso(pratica.dataInizio)||fine!==iso(pratica.dataFine));
 const statusBadge=(ok:boolean)=> <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${ok?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-amber-200 bg-amber-50 text-amber-800"}`}>{ok?<CheckCircle2 className="h-3.5 w-3.5"/>:<AlertCircle className="h-3.5 w-3.5"/>}{ok?"Soddisfatto":"Mancante"}</span>;
 if(!pratica)return <section className="rounded-xl border border-[#cfe2dc] bg-white p-5">
  <h2 className="text-xl font-bold text-[#007a55]">Contratti</h2>
  <p className="mt-2 text-sm text-gray-600">Nessuna pratica HR selezionata. Apri una pratica assegnata per vedere il contratto richiesto e i relativi documenti.</p>
 </section>;
 return <div className="space-y-5">
  <section className="rounded-xl border border-[#cfe2dc] bg-white p-5 shadow-sm">
   <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-[#007a55]">Contratto assegnato</p><h2 className="mt-1 text-2xl font-bold text-[#273b35]">{nice[pratica.tipologia]||pratica.tipologia}</h2></div>
    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${pratica.stato==="COMPLETATO"?"bg-emerald-100 text-emerald-800":pratica.stato==="IN_LAVORAZIONE"?"bg-blue-100 text-blue-800":"bg-amber-100 text-amber-800"}`}>{pratica.stato==="COMPLETATO"?"Elaborato":pratica.stato==="IN_LAVORAZIONE"?"In lavorazione":"Da elaborare"}</span>
   </div>
   <div className="grid gap-3 rounded-lg border border-[#e2ebe7] bg-[#f8fbfa] p-3 md:grid-cols-[minmax(120px,1fr)_minmax(190px,1.2fr)_minmax(155px,1fr)_minmax(155px,1fr)]">
     <div className="min-w-0"><p className="mb-1 text-xs text-gray-500">Datore di lavoro</p><p className="text-sm font-semibold text-[#163d30]">{employers[pratica.datore]||pratica.datore}</p></div>
     {hasUnilav&&<div className="min-w-0"><label className="text-xs text-gray-500">Codice comunicazione UNILAV<input value={codice} disabled={!isHR||codiceBusy} onChange={e=>setCodice(e.target.value)} className="mt-1 block w-full rounded-md border bg-white px-2 py-1.5 text-sm text-[#273b35]" placeholder="Codice UNILAV"/></label>{isHR&&codice!==codiceSalvato&&<button type="button" disabled={codiceBusy} className="mt-1 text-xs font-semibold text-[#007a55]" onClick={()=>void (async()=>{setCodiceBusy(true);try{const v=await hrSalvaCodiceComunicazione(pratica.id,codice);setCodice(v.codice);setCodiceSalvato(v.codice)}catch(e){setError(e instanceof Error?e.message:"Errore salvataggio codice")}finally{setCodiceBusy(false)}})()}>Salva codice</button>}</div>}
     <label className="min-w-0 text-xs text-gray-500">Dal<input type="date" className="mt-1 block w-full rounded-md border bg-white px-2 py-1.5 text-sm text-[#273b35]" value={inizio} disabled={!isHR||pratica.stato==="COMPLETATO"} onChange={e=>{setInizio(e.target.value);setSaved(false)}}/></label>
     <label className="min-w-0 text-xs text-gray-500">Al (se previsto)<input type="date" className="mt-1 block w-full rounded-md border bg-white px-2 py-1.5 text-sm text-[#273b35]" value={fine} min={inizio||undefined} disabled={!isHR||pratica.stato==="COMPLETATO"} onChange={e=>{setFine(e.target.value);setSaved(false)}}/></label>
   </div>
   {isHR&&changed&&<button type="button" disabled={!ready||saving} onClick={()=>void save()} className="mt-2 rounded-md border border-[#007a55] px-3 py-1.5 text-sm font-semibold text-[#007a55] disabled:opacity-50">{saving?"Salvataggio…":"Salva periodo"}</button>}
   {saved&&<p role="status" className="mt-2 text-sm text-emerald-700">Periodo salvato sulla pratica.</p>}
   {error&&<p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
   <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,1fr)]"><div className="min-w-0"><h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-[#007a55]"><ClipboardList className="h-5 w-5"/>Da fare</h3>
   {azioni||<div className={`rounded-lg border px-3 py-3 ${creato?"border-emerald-200 bg-emerald-50":"border-amber-200 bg-amber-50"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{creato?"Contratto generato":"Crea "+(nice[pratica.tipologia]||pratica.tipologia)}</p>{isHR&&!creato&&pratica.tipologia!=="FATTURA"&&<button type="button" onClick={onCreate} disabled={!ready||changed} className="rounded-md bg-[#007a55] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">Crea contratto</button>}</div>
      <p className="mt-1 text-xs text-gray-600">Requisiti: {req.filter(x=>!x.ok).map(x=>x.label).join(" · ")||"Soddisfatti"}</p>
   </div>}
   {hasUnilav&&<div className="mt-2 rounded-lg border border-[#e2ebe7] bg-white px-3 py-2"><p className="text-sm font-semibold">{creato?.pathContrattoUnilav?"UNILAV caricata":"Carica UNILAV di assunzione"}</p><p className="mt-1 text-xs text-gray-600">Requisiti: {creato?"contratto generato disponibile":"genera prima il contratto"} · documento UNILAV {creato?.pathContrattoUnilav?"presente":"da caricare nella sezione Documenti e comunicazioni"}</p></div>}
   </div>
  <div className="min-w-0 space-y-3"><div className="rounded-xl border border-[#cfe2dc] bg-white p-4">
   <div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-lg font-bold text-[#007a55]">Documenti e comunicazioni</h3><span className="text-xs text-gray-500">{[!!creato,...(hasUnilav?[!!creato?.pathContrattoUnilav]:[])].filter(Boolean).length} / {hasUnilav?2:1} obbligatori disponibili</span></div>
   {[
    {title:"Contratto generato",ok:!!creato,kind:"downloadContratto",upload:null},
    {title:"Contratto firmato",ok:!!creato?.pathContrattoFirmato,kind:"contrattoFirmato",upload:"contrattoFirmato"},
    ...(hasUnilav?[{title:"UNILAV di assunzione",ok:!!creato?.pathContrattoUnilav,kind:"contrattoUnilav",upload:"contrattoUnilav"}]:[])
   ].map(doc=><div key={doc.title} className="flex flex-wrap items-center gap-3 border-t py-3 first:border-0">
    <span className="rounded-lg bg-[#f5faf8] p-2 text-[#315e51]">{doc.ok?<FileCheck2 className="h-5 w-5"/>:<FileText className="h-5 w-5"/>}</span>
    <div className="min-w-[150px] flex-1"><div className="text-sm font-semibold">{doc.title}</div><div className="text-xs text-gray-500">{doc.ok?"Disponibile":doc.kind==="contrattoFirmato"?"Facoltativo · non caricato":doc.upload?"Da caricare":"Da generare"}</div></div>
    {doc.kind==="contrattoFirmato"&&!doc.ok?<span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">Facoltativo</span>:statusBadge(doc.ok)}
    {doc.ok&&creato&&onDownload&&<button type="button" className="inline-flex items-center gap-1 rounded border px-3 py-2 text-xs text-[#315e51]" onClick={()=>onDownload(creato.idContratto,doc.kind)}><Eye className="h-4 w-4"/>Apri</button>}
    {doc.ok&&creato&&isHR&&onDelete&&<button type="button" title={"Elimina "+doc.title} className="inline-flex items-center gap-1 rounded border border-red-200 px-3 py-2 text-xs text-red-700" onClick={()=>{if(window.confirm("Eliminare "+doc.title+"? L'operazione è irreversibile."))void onDelete(creato.idContratto,doc.kind==="downloadContratto"?"contratto":doc.kind as DocKind).catch(e=>setError(e instanceof Error?e.message:"Cancellazione fallita"))}}><Trash2 className="h-4 w-4"/>Elimina</button>}
    {doc.upload&&creato&&isHR&&onUpload&&<label className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#b7d7cc] px-3 py-2 text-xs font-medium text-[#007a55]"><UploadCloud className="h-4 w-4"/>Carica<input type="file" className="sr-only" onChange={e=>onUpload(e,creato.idContratto,doc.upload as DocKind)}/></label>}
   </div>)}
   <p className="mt-3 text-xs text-gray-500">I documenti vengono associati al contratto effettivamente registrato. L'UNILAV è distinta dalle comunicazioni delle singole chiamate intermittenti.</p>
  </div>{archivioChiamate}</div></div>
  </section>
 </div>;
}
