import { useEffect,useMemo,useState } from "react";
import { hrAssegnaRuolo,hrUtenti } from "@/utils/hrWorkflow";
import type { HRRole,HRUtente } from "@/utils/hrWorkflow";
export default function HRRuoli(){
 const [utenti,setUtenti]=useState<HRUtente[]>([]);
 const [ricerca,setRicerca]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 const [busy,setBusy]=useState<number|null>(null);
 const carica=async()=>{setLoading(true);setError("");try{setUtenti(await hrUtenti())}catch(e){setError(e instanceof Error?e.message:"Errore") }finally{setLoading(false)}};
 useEffect(()=>{void carica()},[]);
 const lista=useMemo(()=>utenti.filter(u=>(u.nome+" "+u.cognome+" "+(u.email||"")).toLowerCase().includes(ricerca.toLowerCase())),[utenti,ricerca]);
 const aggiorna=async(id:number,role:HRRole|null)=>{setBusy(id);setError("");try{await hrAssegnaRuolo(id,role);await carica();}catch(e){setError(e instanceof Error?e.message:"Errore assegnazione")}finally{setBusy(null)}};
 return <main className="m-6 space-y-5"><div><h1 className="text-3xl font-bold text-[#007a55]">Abilitazioni ADMIN / HR</h1><p className="mt-2 text-sm text-gray-600">Assegna ruoli applicativi agli account esistenti. L'accesso alle API è verificato nel backend, non tramite il ruolo nel browser.</p></div>
 {error&&<p role="alert" className="rounded bg-red-50 p-3 text-red-700">{error}</p>}
 <div className="rounded-lg border bg-white p-4"><input className="w-full max-w-lg rounded border px-3 py-2" placeholder="Cerca nome o email" value={ricerca} onChange={e=>setRicerca(e.target.value)}/>
 <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-sm"><thead><tr className="bg-[#ecf3f1] text-left"><th className="p-3">Utente</th><th className="p-3">Ruolo attuale</th><th className="p-3">Ruolo modulo HR</th></tr></thead><tbody>{lista.map(u=><tr className="border-t" key={u.id}><td className="p-3">{u.cognome} {u.nome}<div className="text-xs text-gray-500">{u.email}</div></td><td className="p-3">{u.ruoloPrincipale}</td><td className="p-3"><select className="rounded border bg-white p-2" disabled={busy!==null} aria-label={"Ruolo HR "+u.nome+" "+u.cognome} value={u.ruoloHR||""} onChange={e=>void aggiorna(u.id,(e.target.value||null) as HRRole|null)}><option value="">Nessun accesso HR</option><option value="ADMIN">ADMIN</option><option value="HR">HR</option></select></td></tr>)}{loading&&<tr><td colSpan={3} className="p-3">Caricamento…</td></tr>}</tbody></table></div></div>
 </main>;
}
