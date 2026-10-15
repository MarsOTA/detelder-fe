import { useEffect,useState } from "react";
import { Link } from "react-router-dom";
import { hrCambiaStato,hrPratiche } from "@/utils/hrWorkflow";
import type { HRPratica,HRStato } from "@/utils/hrWorkflow";
import { FileCheck2, RefreshCw } from "lucide-react";
const label:Record<HRStato,string>={DA_ELABORARE:"Da elaborare",IN_LAVORAZIONE:"In lavorazione",DOCUMENTI_MANCANTI:"Documenti mancanti",COMPLETATO:"Completato"};
const next:Record<HRStato,HRStato[]>={DA_ELABORARE:["IN_LAVORAZIONE","DOCUMENTI_MANCANTI"],IN_LAVORAZIONE:["DOCUMENTI_MANCANTI","COMPLETATO"],DOCUMENTI_MANCANTI:["IN_LAVORAZIONE"],COMPLETATO:[]};
export default function HRCoda(){
 const [pratiche,setPratiche]=useState<HRPratica[]>([]);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [note,setNote]=useState<Record<number,string>>({});
 const carica=async()=>{setBusy(true);setError("");try{setPratiche(await hrPratiche());}catch(e){setError(e instanceof Error?e.message:"Errore caricamento");}finally{setBusy(false)}};
 useEffect(()=>{void carica()},[]);
 const aggiorna=async(id:number,stato:HRStato)=>{setBusy(true);setError("");try{await hrCambiaStato(id,stato,note[id]||"");await carica()}catch(e){setError(e instanceof Error?e.message:"Operazione non riuscita")}finally{setBusy(false)}};
 const aperte=pratiche.filter(p=>p.stato!=="COMPLETATO");
 return <main className="m-6 space-y-5">
  <div className="flex flex-wrap justify-between gap-3"><div><h1 className="text-3xl font-bold text-[#007a55]">HR · Pratiche da elaborare</h1><p className="text-sm text-gray-600">Pratiche assegnate dall’Admin. Modifica contratti e documenti nel profilo dell’operatore.</p></div><button className="rounded bg-[#007a55] px-4 py-2 text-white" disabled={busy} onClick={()=>void carica()}><RefreshCw className="mr-2 inline h-4 w-4"/>Aggiorna</button></div>
  {error&&<div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>}
  <div className="grid gap-3 sm:grid-cols-3">{[["Da elaborare",pratiche.filter(x=>x.stato==="DA_ELABORARE").length],["In lavorazione",pratiche.filter(x=>x.stato==="IN_LAVORAZIONE").length],["Documenti mancanti",pratiche.filter(x=>x.stato==="DOCUMENTI_MANCANTI").length]].map(([title,n])=><div key={title} className="rounded-xl border bg-white p-4"><div className="text-sm text-gray-500">{title}</div><div className="mt-1 text-3xl font-semibold">{n}</div></div>)}</div>
  <div className="space-y-3">{aperte.map(p=><section key={p.id} className="rounded-lg border bg-white p-4">
   <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-bold">{p.cognome} {p.nome}</h2><p className="text-sm text-gray-600">{p.tipologia.replace(/_/g," ")} · {p.datore.replace(/_/g," ")} · Pratica #{p.id}</p><span className="mt-2 inline-block rounded-full bg-[#ecf3f1] px-3 py-1 text-xs font-semibold text-[#007a55]">{label[p.stato]}</span></div><Link className="rounded bg-[#007a55] px-4 py-2 text-sm text-white" to={`/hr/operatore/${p.idOperatore}?tab=contratti&pratica=${p.id}`}><FileCheck2 className="mr-2 inline h-4 w-4"/>Lavora contratto</Link></div>
   <div className="mt-3 flex flex-wrap items-center gap-2"><input className="min-w-[180px] flex-1 rounded border px-3 py-2 text-sm" aria-label="Note pratica" placeholder="Note o documenti richiesti" value={note[p.id]??p.note??""} onChange={e=>setNote(v=>({...v,[p.id]:e.target.value}))}/>{next[p.stato].map(st=><button key={st} disabled={busy} className="rounded-md border border-[#b7d7cc] px-3 py-2 text-sm text-[#007a55] disabled:opacity-50" onClick={()=>void aggiorna(p.id,st)}>{label[st]}</button>)}</div>
  </section>)}{!aperte.length&&<p className="rounded border p-5 text-gray-600">{busy?"Caricamento…":"Nessuna pratica da elaborare."}</p>}</div>
  {pratiche.some(p=>p.stato==="COMPLETATO")&&<details className="rounded border p-4"><summary className="cursor-pointer font-medium">Pratiche completate ({pratiche.filter(p=>p.stato==="COMPLETATO").length})</summary><div className="mt-2 space-y-2">{pratiche.filter(p=>p.stato==="COMPLETATO").map(p=><div className="text-sm" key={p.id}>{p.cognome} {p.nome} · {p.tipologia} · #{p.id}</div>)}</div></details>}
 </main>
}
