import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle2, FileCheck2, FilePlus2, FileText, UploadCloud, Eye, CalendarDays } from "lucide-react";
import type { ChangeEvent } from "react";
import type { HRPratica } from "@/utils/hrWorkflow";

export type ContrattoSintesiHR = {
 idContratto:number; tipologia:string; dataInizio:string|null; dataFine:string|null;
 pathContrattoFirmato?:string|null; pathContrattoUnilav?:string|null
};
type DocKind="contrattoFirmato"|"contrattoUnilav";
type Props={
 contratti:ContrattoSintesiHR[];idOperatore:string|undefined;pratica?:HRPratica|null;
 codiceFiscale?:string|null;isHR?:boolean;onCreate?:()=>void;onPeriodSave?:(inizio:string,fine:string|null)=>Promise<void>;
 onDownload?:(contractId:number,kind:string)=>void;
 onUpload?:(event:ChangeEvent<HTMLInputElement>,contractId:number,kind:DocKind)=>void;
};
const nice:Record<string,string>={CHIAMATA:"Contratto a chiamata",OCCASIONALE:"Contratto occasionale",TEMPO_DETERMINATO:"Contratto a tempo determinato",CONTRATTO_TEMPO_DETERMINATO:"Contratto a tempo determinato",TEMPO_INDETERMINATO:"Contratto a tempo indeterminato",CONTRATTO_TEMPO_INDETERMINATO:"Contratto a tempo indeterminato",CONSGNA_BENI_FORMAZIONE:"Consegna beni e formazione",FATTURA:"Collaborazione con fattura"};
const employers:Record<string,string>={DETELDER:"DETELDER",SOCIETA_APPALTO:"Società in appalto",AUTONOMO_PIVA:"Autonomo · P.IVA"};
const iso=(v:string|null|undefined)=>v?String(v).slice(0,10):"";
const isValid=(v:string)=>/^\d{4}-\d{2}-\d{2}$/.test(v)&&!Number.isNaN(Date.parse(v+"T12:00:00Z"));
const canonical=(v:string)=>v.replace(/^CONTRATTO_/,"");
export function ContrattoAttivoHR({contratti,pratica,codiceFiscale,isHR=false,onCreate,onPeriodSave,onDownload,onUpload}:Props){
 const [inizio,setInizio]=useState("");
 const [fine,setFine]=useState("");
 const [saving,setSaving]=useState(false);
 const [error,setError]=useState("");
 const [saved,setSaved]=useState(false);
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
   <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
    <div><p className="text-xs font-semibold uppercase tracking-wider text-[#007a55]">Pratica contrattuale #{pratica.id}</p><h2 className="mt-1 text-xl font-bold text-[#273b35]">Contratto assegnato</h2><p className="mt-1 text-sm text-gray-500">Richiesta dell'ADMIN · il contratto non è attivo finché non è effettivamente formalizzato.</p></div>
    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800">{pratica.stato.replace(/_/g," ")}</span>
   </div>
   <div className="grid gap-3 sm:grid-cols-2">
    <div className="rounded-lg bg-[#f5faf8] p-4"><p className="text-xs text-gray-500">Tipologia assegnata</p><p className="mt-1 font-semibold text-[#163d30]">{nice[pratica.tipologia]||pratica.tipologia}</p></div>
    <div className="rounded-lg bg-[#f5faf8] p-4"><p className="text-xs text-gray-500">Datore di lavoro</p><p className="mt-1 font-semibold text-[#163d30]">{employers[pratica.datore]||pratica.datore}</p></div>
   </div>
   <div className="mt-5 rounded-lg border p-4">
    <div className="mb-3 flex items-center gap-2 font-semibold text-[#315e51]"><CalendarDays className="h-4 w-4"/>Periodo contrattuale</div>
    <div className="grid gap-3 sm:grid-cols-2">
     <label className="text-sm"><span className="text-gray-600">Dal</span><input type="date" className="mt-1 block w-full rounded-md border bg-white px-3 py-2" value={inizio} disabled={!isHR||pratica.stato==="COMPLETATO"} onChange={e=>{setInizio(e.target.value);setSaved(false)}}/></label>
     <label className="text-sm"><span className="text-gray-600">Al (se previsto)</span><input type="date" className="mt-1 block w-full rounded-md border bg-white px-3 py-2" value={fine} min={inizio||undefined} disabled={!isHR||pratica.stato==="COMPLETATO"} onChange={e=>{setFine(e.target.value);setSaved(false)}}/></label>
    </div>
    {isHR&&changed&&<button type="button" disabled={!ready||saving} onClick={()=>void save()} className="mt-3 rounded-md border border-[#007a55] px-4 py-2 text-sm font-semibold text-[#007a55] disabled:opacity-50">{saving?"Salvataggio…":"Salva periodo"}</button>}
    {saved&&<p role="status" className="mt-2 text-sm text-emerald-700">Periodo salvato sulla pratica.</p>}
    {error&&<p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
   </div>
   <div className="mt-5"><h3 className="font-semibold">Requisiti per la preparazione</h3><div className="mt-3 flex flex-wrap gap-2">
    {req.map(x=><span key={x.label} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${x.ok?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-amber-200 bg-amber-50 text-amber-800"}`}>{x.ok?<CheckCircle2 className="h-3.5 w-3.5"/>:<AlertCircle className="h-3.5 w-3.5"/>}{x.label}</span>)}
   </div></div>
   {isHR&&<div className="mt-5">
    <button type="button" disabled={!ready||changed||!onCreate||pratica.stato==="COMPLETATO"||pratica.tipologia==="FATTURA"} onClick={onCreate} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#007a55] px-5 py-3.5 font-semibold text-white hover:bg-[#006449] disabled:cursor-not-allowed disabled:opacity-50"><FilePlus2 className="h-5 w-5"/>Crea {nice[pratica.tipologia]||pratica.tipologia}</button>
    {changed&&<p className="mt-2 text-xs text-amber-700">Salva il periodo modificato prima di aprire il form.</p>}
    {pratica.tipologia==="FATTURA"&&<p className="mt-2 text-xs text-gray-600">Per la fattura non esiste un generatore di contratto: gestire l'incarico e i documenti secondo la procedura amministrativa.</p>}
   </div>}
  </section>
  <section className="rounded-xl border border-[#cfe2dc] bg-white p-5 shadow-sm">
   <div className="mb-4 flex items-center justify-between gap-3"><h3 className="text-lg font-bold text-[#273b35]">Documenti della pratica</h3><span className="text-xs text-gray-500">{[!!creato,!!creato?.pathContrattoFirmato,...(hasUnilav?[!!creato?.pathContrattoUnilav]:[])].filter(Boolean).length} / {hasUnilav?3:2} disponibili</span></div>
   {[
    {title:"Contratto generato",ok:!!creato,kind:"downloadContratto",upload:null},
    {title:"Contratto firmato",ok:!!creato?.pathContrattoFirmato,kind:"contrattoFirmato",upload:"contrattoFirmato"},
    ...(hasUnilav?[{title:"UNILAV di assunzione",ok:!!creato?.pathContrattoUnilav,kind:"contrattoUnilav",upload:"contrattoUnilav"}]:[])
   ].map(doc=><div key={doc.title} className="flex flex-wrap items-center gap-3 border-t py-3 first:border-0">
    <span className="rounded-lg bg-[#f5faf8] p-2 text-[#315e51]">{doc.ok?<FileCheck2 className="h-5 w-5"/>:<FileText className="h-5 w-5"/>}</span>
    <div className="min-w-[150px] flex-1"><div className="text-sm font-semibold">{doc.title}</div><div className="text-xs text-gray-500">{doc.ok?"Disponibile":doc.upload?"Da caricare":"Da generare"}</div></div>
    {statusBadge(doc.ok)}
    {doc.ok&&creato&&onDownload&&<button type="button" className="inline-flex items-center gap-1 rounded border px-3 py-2 text-xs text-[#315e51]" onClick={()=>onDownload(creato.idContratto,doc.kind)}><Eye className="h-4 w-4"/>Apri</button>}
    {doc.upload&&creato&&isHR&&onUpload&&<label className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#b7d7cc] px-3 py-2 text-xs font-medium text-[#007a55]"><UploadCloud className="h-4 w-4"/>Carica<input type="file" className="sr-only" onChange={e=>onUpload(e,creato.idContratto,doc.upload as DocKind)}/></label>}
   </div>)}
   <p className="mt-3 text-xs text-gray-500">I documenti vengono associati al contratto effettivamente registrato. L'UNILAV è distinta dalle comunicazioni delle singole chiamate intermittenti.</p>
  </section>
 </div>;
}
