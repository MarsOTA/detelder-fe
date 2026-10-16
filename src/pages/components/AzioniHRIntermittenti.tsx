import {useEffect,useMemo,useState} from "react";
import {AlertTriangle,CalendarClock,CheckCircle2,FilePlus2,RefreshCw,Send} from "lucide-react";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {listaChiamateHR} from "@/utils/chiamateHR";
import type {ChiamataHR} from "@/utils/chiamateHR";
import type {HRPratica} from "@/utils/hrWorkflow";

export type ProssimaAzioneTurno={idTurno:number;dataTurno:string;oraInizio?:string;oraFine?:string;titoloEvento?:string;nomeEvento?:string};
export type ContrattoPadreAzione={idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null};
const day=(x?:string|null)=>x?String(x).slice(0,10):"";
const fmt=(v:string)=>v?v.slice(8,10)+"/"+v.slice(5,7)+"/"+v.slice(0,4):"";
const dateToday=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const plus=(date:string,days:number)=>{const d=new Date(date+"T12:00:00");d.setDate(d.getDate()+days);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
type Props={idOperatore:number;pratica:HRPratica;contratti:ContrattoPadreAzione[];onCreateContract:()=>void;onCreateCall:(idContratto:number,dataTurno:string)=>void};
export default function AzioniHRIntermittenti({idOperatore,pratica,contratti,onCreateContract,onCreateCall}:Props){
 const [turni,setTurni]=useState<ProssimaAzioneTurno[]>([]);
 const [chiamate,setChiamate]=useState<Record<number,ChiamataHR[]|null>>({});
 const [loading,setLoading]=useState(false);
 const [errore,setErrore]=useState("");
 const refresh=async()=>{
  setLoading(true);setErrore("");
  try{
   const start=dateToday(),end=plus(start,7);
   const resp=await fetch(ezystaffBEUrl+"turni?dataInizio="+start+"&dataFine="+end,{credentials:"include",headers:{Authorization:"Bearer "+(localStorage.getItem("token")||""),Accept:"application/json"}});
   if(!resp.ok)throw new Error("Impossibile verificare i turni imminenti");
   const all=await resp.json() as (ProssimaAzioneTurno&{idOperatore?:number|null})[];
   if(!Array.isArray(all))throw new Error("Dati turni non validi");
   setTurni(all.filter(t=>Number(t.idOperatore)===idOperatore&&day(t.dataTurno)>=start&&day(t.dataTurno)<=end).sort((a,b)=>day(a.dataTurno).localeCompare(day(b.dataTurno))));
   const padri=contratti.filter(c=>c.tipologia==="CHIAMATA");
   const results=await Promise.allSettled(padri.map(c=>listaChiamateHR(idOperatore,c.idContratto)));
   const found:Record<number,ChiamataHR[]|null>={};
   results.forEach((r,i)=>{found[padri[i].idContratto]=r.status==="fulfilled"?r.value:null});
   setChiamate(found);
  }catch(e){setErrore(e instanceof Error?e.message:"Verifica indisponibile");setTurni([])}
  finally{setLoading(false)}
 };
 const ids=contratti.map(c=>c.idContratto).join(",");
 useEffect(()=>{void refresh()},[idOperatore,ids]);
 const contratto=useMemo(()=>contratti.filter(c=>c.tipologia==="CHIAMATA"&&!!c.dataInizio&&(day(c.dataInizio)===day(pratica.dataInizio))).sort((a,b)=>b.idContratto-a.idContratto)[0]||null,[contratti,pratica.dataInizio]);
 const rows=turni.map(t=>{
  const d=day(t.dataTurno);
  const parent=contratti.find(c=>c.tipologia==="CHIAMATA"&&!!c.dataInizio&&day(c.dataInizio)<=d&&(!c.dataFine||day(c.dataFine)>=d));
  const calls=parent?chiamate[parent.idContratto]:[];
  const sending=calls?.find(c=>c.stato==="INVIATA"&&day(c.dataInizio)<=d&&day(c.dataFine)>=d);
  const prepared=calls?.find(c=>c.stato!=="INVIATA"&&day(c.dataInizio)<=d&&day(c.dataFine)>=d);
  const status=parent&&!Array.isArray(calls)?"VERIFICA":sending?"INVIATA":prepared?"DA_INVIARE":parent?"DA_CREARE":"SENZA_CONTRATTO";
  return {turno:t,status,parent,prepared};
 });
 const pending=rows.filter(x=>x.status!=="INVIATA");
 return <section className="space-y-2 rounded-lg border border-[#bfdad0] bg-[#f9fcfb] p-3">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-bold text-[#233f35]">Da fare · prossimi 7 giorni</h3></div>
  <button type="button" onClick={()=>void refresh()} disabled={loading} className="inline-flex items-center gap-1 rounded-md border border-[#b7d7cc] px-3 py-2 text-sm text-[#315e51]"><RefreshCw className="h-4 w-4"/>{loading?"Controllo…":"Aggiorna"}</button></div>
  {errore&&<p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-800">{errore}. Nessun turno viene considerato automaticamente regolare.</p>}
  <div className={`rounded-md border px-3 py-2 ${contratto?"border-emerald-200 bg-emerald-50":"border-amber-300 bg-amber-50"}`}>
   <div className="flex items-center gap-2"><span className="rounded-md bg-white p-1.5">{contratto?<CheckCircle2 className="h-5 w-5 text-emerald-700"/>:<FilePlus2 className="h-5 w-5 text-amber-800"/>}</span><div className="flex-1"><p className="text-[10px] font-semibold uppercase tracking-wide">{contratto?"Prima azione completata":"Azione 1 · Prioritaria"}</p><p className="text-sm font-semibold">{contratto?"Contratto a chiamata registrato":"Crea contratto a chiamata"}</p><p className="text-xs text-gray-600">{contratto?"Contratto #"+contratto.idContratto:"Necessario per predisporre le comunicazioni dei turni"}</p></div>{!contratto&&<button type="button" onClick={onCreateContract} className="rounded-md bg-[#a75d00] px-3 py-2 text-sm font-semibold text-white">Crea contratto</button>}</div>
  </div>
  {loading&&<p className="text-sm text-gray-500">Verifica turni e chiamate in corso…</p>}
  {!loading&&rows.length===0&&!errore&&<div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">Nessun turno assegnato nei prossimi 7 giorni. La prima chiamata sarà necessaria quando sarà programmata la prestazione.</div>}
  {!loading&&rows.map(({turno,status,parent})=>{
   const d=day(turno.dataTurno);
   const good=status==="INVIATA",blocked=status==="SENZA_CONTRATTO",unknown=status==="VERIFICA";
   const color=good?"border-emerald-200 bg-emerald-50":blocked||unknown?"border-red-200 bg-red-50":"border-amber-300 bg-amber-50";
   return <div key={turno.idTurno} className={`rounded-lg border p-4 ${color}`}>
    <div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-white p-2">{good?<CheckCircle2 className="h-5 w-5 text-emerald-700"/>:blocked||unknown?<AlertTriangle className="h-5 w-5 text-red-700"/>:<CalendarClock className="h-5 w-5 text-amber-800"/>}</span>
     <div className="min-w-[180px] flex-1"><div className="text-xs font-semibold uppercase tracking-wide">{good?"Comunicazione inviata":blocked?"Contratto padre necessario":unknown?"Verifica comunicazione indisponibile":status==="DA_INVIARE"?"Comunicazione da inviare":"Azione 2 · Da effettuare"}</div>
      <p className="mt-1 font-semibold">{good?"Chiamata inviata":status==="DA_INVIARE"?"Verifica e invia chiamata":"Crea chiamata per turno "+fmt(d)}</p>
      <p className="text-xs text-gray-600">{turno.nomeEvento||turno.titoloEvento||"Turno #"+turno.idTurno} · {fmt(d)} {turno.oraInizio?"· "+turno.oraInizio.slice(0,5):""}{turno.oraFine?"–"+turno.oraFine.slice(0,5):""}</p>
     </div>
     {!good&&parent&&!unknown&&<button type="button" onClick={()=>onCreateCall(parent.idContratto,d)} className="inline-flex items-center gap-1 rounded-md bg-[#a75d00] px-3 py-2 text-sm font-semibold text-white"><Send className="h-4 w-4"/>{status==="DA_INVIARE"?"Apri comunicazione":"Crea chiamata"}</button>}
     {good&&<span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-800">INVIATA</span>}
    </div>
   </div>
  })}
  {!loading&&pending.length>0&&<p className="rounded-md bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900">{pending.length} turno/i richiedono un'azione o una verifica. Le comunicazioni preparate non sono considerate inviate.</p>}
 </section>;
}
