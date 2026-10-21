import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {hrPratiche} from "@/utils/hrWorkflow";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import type {HRPratica,HRStato} from "@/utils/hrWorkflow";
import {Eye,RefreshCw,AlertCircle} from "lucide-react";
import {caricaAnagraficaHR,caricaContrattiHR,verificaRegolaritaHR} from "@/utils/hrCompliance";
import type {HRTurno} from "@/utils/hrCompliance";

const labels:Record<HRStato,string>={DA_ELABORARE:"Da elaborare",IN_LAVORAZIONE:"In lavorazione",DOCUMENTI_MANCANTI:"In lavorazione",COMPLETATO:"Elaborato"};
const badge:Record<HRStato,string>={DA_ELABORARE:"bg-amber-100 text-amber-900",IN_LAVORAZIONE:"bg-blue-100 text-blue-800",DOCUMENTI_MANCANTI:"bg-blue-100 text-blue-800",COMPLETATO:"bg-emerald-100 text-emerald-800"};
const date=(value:string|null)=>value?String(value).slice(0,10).split("-").reverse().join("/"):"—";
export default function HRCoda(){
 const [rows,setRows]=useState<HRPratica[]>([]);
 const [busy,setBusy]=useState(false);
 const [pianificati,setPianificati]=useState<Set<number>|null>(null);
 const [criticita,setCriticita]=useState<Record<number,string[]>>({});
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const carica=async()=>{setBusy(true);setError("");try{
  const ora=new Date(),fine=new Date();fine.setDate(fine.getDate()+90);
  const day=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  const [pratiche,turniResp]=await Promise.all([hrPratiche(),fetch(ezystaffBEUrl+"turni?dataInizio="+day(ora)+"&dataFine="+day(fine),{credentials:"include",headers:{Authorization:"Bearer "+(localStorage.getItem("token")||""),Accept:"application/json"}})]);
  if(!turniResp.ok)throw new Error("Impossibile verificare i turni pianificati");
  const turni=await turniResp.json() as HRTurno[];
  if(!Array.isArray(turni))throw new Error("Risposta turni non valida");
  const pianificati=new Set(turni.map(t=>Number(t.idOperatore)).filter(n=>Number.isSafeInteger(n)&&n>0));
  const issues:Record<number,string[]>={};
  const assigned=[...new Set(pratiche.filter(p=>pianificati.has(p.idOperatore)).map(p=>p.idOperatore))];
  // Errors are never interpreted as successful completion.
  for(let i=0;i<assigned.length;i+=5){
   const batch=assigned.slice(i,i+5);
   await Promise.all(batch.map(async id=>{
    try{
     const [anagrafica,contratti]=await Promise.all([caricaAnagraficaHR(id),caricaContrattiHR(id)]);
     issues[id]=await verificaRegolaritaHR(id,turni.filter(t=>Number(t.idOperatore)===id),contratti,anagrafica);
    }catch{issues[id]=["Verifica dati e contratti non disponibile"]}
   }));
  }
  setCriticita(issues);setRows(pratiche);setPianificati(pianificati);
 }catch(e){setError(e instanceof Error?e.message:"Impossibile caricare le pratiche");setPianificati(null)}finally{setBusy(false)}};
 useEffect(()=>{void carica()},[]);
 const livelloPriorita=(p:HRPratica)=>{const issues=criticita[p.idOperatore]||[];if(!issues.length)return "Nessuna";const days=p.dataInizio?Math.ceil((new Date(String(p.dataInizio).slice(0,10)+"T12:00:00").getTime()-new Date().getTime())/86400000):999;return days<=7?"Alta":days<=30?"Media":"Bassa"};
 const visibili=rows.filter(p=>(p.stato!=="COMPLETATO"||(criticita[p.idOperatore]?.length||0)>0)&&pianificati?.has(p.idOperatore)&&(p.nome+" "+p.cognome+" "+p.tipologia).toLowerCase().includes(search.toLowerCase()));
 return <main className="m-6 space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold text-[#007a55]">HR · Pratiche assegnate</h1><p className="text-sm text-gray-500">Stesso riepilogo dell'ADMIN, in sola lettura. Lo stato viene aggiornato automaticamente in base a contratti, documenti e comunicazioni.</p></div>
    <button disabled={busy} onClick={()=>void carica()} className="inline-flex items-center gap-2 rounded-md bg-[#007a55] px-4 py-2 text-sm text-white"><RefreshCw className="h-4 w-4"/>Aggiorna</button></div>
  {error&&<p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  <div className="grid gap-3 sm:grid-cols-4">{(["DA_ELABORARE","IN_LAVORAZIONE","COMPLETATO"] as HRStato[]).map(st=><div key={st} className="rounded-xl border bg-white p-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge[st]}`}>{labels[st]}</span><div className="mt-2 text-2xl font-bold">{rows.filter(p=>pianificati?.has(p.idOperatore)&&(st==="IN_LAVORAZIONE"?["IN_LAVORAZIONE","DOCUMENTI_MANCANTI"].includes(p.stato):st==="COMPLETATO"?p.stato==="COMPLETATO"&&!(criticita[p.idOperatore]?.length):p.stato===st)).length}</div></div>)}</div>
  <section className="rounded-xl border bg-white p-4 shadow-sm">
   <div className="mb-3"><input className="w-full max-w-sm rounded-md border px-3 py-2 text-sm" placeholder="Cerca operatore o contratto" aria-label="Cerca pratiche" value={search} onChange={e=>setSearch(e.target.value)}/></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[950px] text-sm">
    <thead><tr className="bg-[#ecf3f1] text-left text-[#315e51]"><th className="p-3">Operatore</th><th className="p-3">Inquadramento</th><th className="p-3">Datore di lavoro</th><th className="p-3">Periodo</th><th className="p-3">Stato</th><th className="p-3">Priorità</th><th className="p-3">Azioni</th></tr></thead>
    <tbody>{visibili.map(p=><tr key={p.id} className="border-b hover:bg-[#f8fbfa]">
     <td className="p-3 font-semibold">{p.cognome} {p.nome}</td>
     <td className="p-3">{p.tipologia.replace(/_/g," ")}</td>
     <td className="p-3">{p.datore.replace(/_/g," ")}</td>
     <td className="p-3 whitespace-nowrap">{date(p.dataInizio)} – {date(p.dataFine)}</td>
     <td className="p-3"><div className="group relative inline-flex" tabIndex={criticita[p.idOperatore]?.length?0:undefined}><span title={criticita[p.idOperatore]?.join(" · ")||undefined} className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${criticita[p.idOperatore]?.length?"cursor-help bg-amber-100 text-amber-900":badge[p.stato]}`}>{criticita[p.idOperatore]?.length?<><AlertCircle className="h-4 w-4"/>Incompleto</>:p.stato==="COMPLETATO"&&p.simulazioneTest?"Elaborato (test)":labels[p.stato]}</span>{!!criticita[p.idOperatore]?.length&&<div role="tooltip" className="pointer-events-none absolute bottom-full left-0 z-30 mb-2 hidden w-72 rounded-lg border border-amber-200 bg-white p-3 text-xs shadow-lg group-hover:block group-focus-within:block"><strong className="text-amber-800">Cosa manca</strong><ul className="mt-1 list-inside list-disc space-y-1">{criticita[p.idOperatore].map((v,i)=><li key={i}>{v}</li>)}</ul></div>}</div></td>
     <td className="p-3"><span className={`font-semibold ${livelloPriorita(p)==="Alta"?"text-red-700":livelloPriorita(p)==="Media"?"text-amber-700":"text-emerald-700"}`}>{livelloPriorita(p)}</span></td>
     <td className="p-3"><Link title="Visualizza e lavora contratto" aria-label={"Apri contratto di "+p.cognome+" "+p.nome} to={`/hr/operatore/${p.idOperatore}?tab=contratti&pratica=${p.id}`} className="inline-flex rounded-md border border-[#b7d7cc] p-2 text-[#007a55] hover:bg-[#ecf3f1]"><Eye className="h-5 w-5"/></Link></td>
    </tr>)}{!visibili.length&&<tr><td colSpan={7} className="p-6 text-center text-gray-500">{busy?"Caricamento…":"Nessuna pratica trovata"}</td></tr>}</tbody>
   </table></div>
  </section>
 </main>;
}
