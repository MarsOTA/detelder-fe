import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {hrPratiche} from "@/utils/hrWorkflow";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import type {HRPratica,HRStato} from "@/utils/hrWorkflow";
import {Eye,RefreshCw} from "lucide-react";

const labels:Record<HRStato,string>={DA_ELABORARE:"Da elaborare",IN_LAVORAZIONE:"In lavorazione",DOCUMENTI_MANCANTI:"In lavorazione",COMPLETATO:"Elaborato"};
const badge:Record<HRStato,string>={DA_ELABORARE:"bg-amber-100 text-amber-900",IN_LAVORAZIONE:"bg-blue-100 text-blue-800",DOCUMENTI_MANCANTI:"bg-blue-100 text-blue-800",COMPLETATO:"bg-emerald-100 text-emerald-800"};
const date=(value:string|null)=>value?String(value).slice(0,10).split("-").reverse().join("/"):"—";
export default function HRCoda(){
 const [rows,setRows]=useState<HRPratica[]>([]);
 const [busy,setBusy]=useState(false);
 const [pianificati,setPianificati]=useState<Set<number>|null>(null);
 const [error,setError]=useState("");
 const [search,setSearch]=useState("");
 const carica=async()=>{setBusy(true);setError("");try{
  const ora=new Date(),fine=new Date();fine.setDate(fine.getDate()+90);
  const day=(d:Date)=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  const [pratiche,turniResp]=await Promise.all([hrPratiche(),fetch(ezystaffBEUrl+"turni?dataInizio="+day(ora)+"&dataFine="+day(fine),{credentials:"include",headers:{Authorization:"Bearer "+(localStorage.getItem("token")||""),Accept:"application/json"}})]);
  if(!turniResp.ok)throw new Error("Impossibile verificare i turni pianificati");
  const turni=await turniResp.json() as {idOperatore?:number|null}[];
  if(!Array.isArray(turni))throw new Error("Risposta turni non valida");
  setRows(pratiche);setPianificati(new Set(turni.map(t=>Number(t.idOperatore)).filter(n=>Number.isSafeInteger(n)&&n>0)));
 }catch(e){setError(e instanceof Error?e.message:"Impossibile caricare le pratiche");setPianificati(null)}finally{setBusy(false)}};
 useEffect(()=>{void carica()},[]);
 const visibili=rows.filter(p=>p.stato!=="COMPLETATO"&&pianificati?.has(p.idOperatore)&&(p.nome+" "+p.cognome+" "+p.tipologia).toLowerCase().includes(search.toLowerCase()));
 return <main className="m-6 space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-bold text-[#007a55]">HR · Pratiche assegnate</h1><p className="text-sm text-gray-500">Stesso riepilogo dell'ADMIN, in sola lettura. Lo stato viene aggiornato automaticamente in base a contratti, documenti e comunicazioni.</p></div>
    <button disabled={busy} onClick={()=>void carica()} className="inline-flex items-center gap-2 rounded-md bg-[#007a55] px-4 py-2 text-sm text-white"><RefreshCw className="h-4 w-4"/>Aggiorna</button></div>
  {error&&<p role="alert" className="rounded bg-red-50 p-3 text-sm text-red-800">{error}</p>}
  <div className="grid gap-3 sm:grid-cols-4">{(["DA_ELABORARE","IN_LAVORAZIONE","COMPLETATO"] as HRStato[]).map(st=><div key={st} className="rounded-xl border bg-white p-4"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge[st]}`}>{labels[st]}</span><div className="mt-2 text-2xl font-bold">{rows.filter(p=>pianificati?.has(p.idOperatore)&&(st==="IN_LAVORAZIONE"?["IN_LAVORAZIONE","DOCUMENTI_MANCANTI"].includes(p.stato):p.stato===st)).length}</div></div>)}</div>
  <section className="rounded-xl border bg-white p-4 shadow-sm">
   <div className="mb-3"><input className="w-full max-w-sm rounded-md border px-3 py-2 text-sm" placeholder="Cerca operatore o contratto" aria-label="Cerca pratiche" value={search} onChange={e=>setSearch(e.target.value)}/></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-sm">
    <thead><tr className="bg-[#ecf3f1] text-left text-[#315e51]"><th className="p-3">Operatore</th><th className="p-3">Inquadramento</th><th className="p-3">Datore di lavoro</th><th className="p-3">Periodo</th><th className="p-3">Stato</th><th className="p-3">Azioni</th></tr></thead>
    <tbody>{visibili.map(p=><tr key={p.id} className="border-b hover:bg-[#f8fbfa]">
     <td className="p-3 font-semibold">{p.cognome} {p.nome}</td>
     <td className="p-3">{p.tipologia.replace(/_/g," ")}</td>
     <td className="p-3">{p.datore.replace(/_/g," ")}</td>
     <td className="p-3 whitespace-nowrap">{date(p.dataInizio)} – {date(p.dataFine)}</td>
     <td className="p-3"><span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge[p.stato]}`}>{p.stato==="COMPLETATO"&&p.simulazioneTest?"Elaborato (test)":labels[p.stato]}</span></td>
     <td className="p-3"><Link title="Visualizza e lavora contratto" aria-label={"Apri contratto di "+p.cognome+" "+p.nome} to={`/hr/operatore/${p.idOperatore}?tab=contratti&pratica=${p.id}`} className="inline-flex rounded-md border border-[#b7d7cc] p-2 text-[#007a55] hover:bg-[#ecf3f1]"><Eye className="h-5 w-5"/></Link></td>
    </tr>)}{!visibili.length&&<tr><td colSpan={6} className="p-6 text-center text-gray-500">{busy?"Caricamento…":"Nessuna pratica trovata"}</td></tr>}</tbody>
   </table></div>
  </section>
 </main>;
}
