import { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, AlertCircle, CheckCircle2, CalendarClock, X } from "lucide-react";
import { ezystaffBEUrl } from "@/utils/baseUrl";

type Operatore = { id:number;nome:string;cognome:string;ruolo?:string;codiceFiscale?:string;codice_fiscale?:string };
type Contratto = {idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null;pathContrattoUnilav?:string|null;cfDatore?:string;emailDatore?:string};
type Turno = {idTurno?:number;idOperatore?:number|null;dataTurno?:string;oraInizio?:string;oraFine?:string;nomeEvento?:string;via?:string};
type Stato = "Regolare" | "Incompleto" | "Scaduto";
type Riga = {operatore:Operatore;contratti:Contratto[];turni:Turno[];prossimoTurno:string|null;priorita:number;stato:Stato;motivi:string[]};
const oggi=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
const iso=(v?:string|null)=>v?String(v).slice(0,10):"";
const formatData=(v?:string|null)=>{const s=iso(v);return s.length===10?s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(2,4):"—";};
const tipoLavoro=(t:string)=>["CHIAMATA","OCCASIONALE","TEMPO_DETERMINATO","TEMPO_INDETERMINATO","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO"].includes(t);
const copre=(c:Contratto,data:string)=>tipoLavoro(c.tipologia)&&iso(c.dataInizio)<=data&&!!c.dataInizio&&(!c.dataFine||iso(c.dataFine)>=data);
async function api<T>(path:string):Promise<T>{
 const response=await fetch(ezystaffBEUrl+path,{credentials:"include",headers:{Authorization:`Bearer ${localStorage.getItem("token")||""}`,Accept:"application/json"}});
 if(!response.ok)throw new Error(`Errore API ${response.status}: ${path}`);
 return response.json() as Promise<T>;
}
function valuta(o:Operatore,contratti:Contratto[],turni:Turno[]):Riga {
 const futuri=turni.filter(t=>iso(t.dataTurno)>=oggi()&&!!t.dataTurno).sort((a,b)=>iso(a.dataTurno).localeCompare(iso(b.dataTurno)));
 const prossimoTurno=futuri.length?iso(futuri[0].dataTurno):null;
 const priorita=prossimoTurno?Math.max(0,Math.round((Date.parse(prossimoTurno+"T12:00:00")-Date.parse(oggi()+"T12:00:00"))/86400000)):999999;
 const riferimento=prossimoTurno||oggi();
 const padre=contratti.find(c=>c.tipologia==="CHIAMATA"&&copre(c,riferimento));
 const altri=contratti.find(c=>copre(c,riferimento));
 const scaduti=contratti.filter(c=>tipoLavoro(c.tipologia)&&!!c.dataFine&&iso(c.dataFine)<riferimento);
 const isScaduto=!!prossimoTurno&&!altri&&scaduti.length>0;
 const cf=o.codiceFiscale||o.codice_fiscale;
 const motivi:string[]=[];
 if(!cf?.trim())motivi.push("Codice fiscale");
 if(!altri)motivi.push(isScaduto?"Contratto scaduto":"Contratto padre / inquadramento");
 if(altri&&!altri.pathContrattoUnilav)motivi.push("Documento UNILAV");
 // La copertura del contratto padre non conferma l'esistenza di una chiamata figlia valida.
 // In assenza di un'API che colleghi le chiamate ai turni, non certificare la regolarità.
 const stato:Stato=isScaduto?"Scaduto":motivi.length?"Incompleto":"Regolare";
 return {operatore:o,contratti,turni:futuri,prossimoTurno,priorita,stato,motivi};
}
export default function ModuloHR(){
 const navigate=useNavigate();
 const [righe,setRighe]=useState<Riga[]>([]);
 const [loading,setLoading]=useState(false);
 const [errore,setErrore]=useState("");
 const [ricerca,setRicerca]=useState("");
 const [espanso,setEspanso]=useState<number|null>(null);
 const [selezionato,setSelezionato]=useState<number|null>(null);
 const [progress,setProgress]=useState("");
 const [inlineHR,setInlineHR]=useState<Record<number,{datore:string;tipo:string}>>({});
 const aggiorna=(id:number,k:"datore"|"tipo",value:string)=>setInlineHR(prev=>({...prev,[id]:{...(prev[id]??{datore:"DETELDER",tipo:""}),[k]:value}}));
 const carica=async()=>{
  setLoading(true);setErrore("");setProgress("Caricamento operatori e turni…");
  try{
   const inizio=oggi(),fine=new Date();fine.setDate(fine.getDate()+90);
   const dataFine=[fine.getFullYear(),String(fine.getMonth()+1).padStart(2,"0"),String(fine.getDate()).padStart(2,"0")].join("-");
   const [operatori,turni]=await Promise.all([api<Operatore[]>("operatori"),api<Turno[]>(`turni?dataInizio=${inizio}&dataFine=${dataFine}`)]);
   if(!Array.isArray(operatori)||!Array.isArray(turni))throw new Error("Risposta API non valida");
   const persone=operatori.filter(o=>!o.ruolo||o.ruolo==="OPERATORE"),dati:Riga[]=[];
   for(let i=0;i<persone.length;i+=4){
    const batch=persone.slice(i,i+4);
    const contratti=await Promise.all(batch.map(o=>api<Contratto[]>(`operatori/listaContrattiOperatore/${o.id}`)));
    batch.forEach((o,j)=>dati.push(valuta(o,Array.isArray(contratti[j])?contratti[j]:[],turni.filter(t=>Number(t.idOperatore)===Number(o.id)))));
    setProgress(`Operatori analizzati ${Math.min(i+4,persone.length)}/${persone.length}`);
   }
   setRighe(dati);
  }catch(e){setErrore(e instanceof Error?e.message:"Errore caricamento HR");}
  finally{setLoading(false);setProgress("");}
 };
 useEffect(()=>{void carica();},[]);
 const irregolari=useMemo(()=>righe.filter(r=>r.stato!=="Regolare"),[righe]);
 const visibili=useMemo(()=>irregolari.filter(r=>[r.operatore.nome,r.operatore.cognome,r.operatore.codiceFiscale||r.operatore.codice_fiscale].join(" ").toLowerCase().includes(ricerca.toLowerCase())).sort((a,b)=>a.priorita-b.priorita||a.operatore.cognome.localeCompare(b.operatore.cognome)),[irregolari,ricerca]);
 const r=selezionato===null?null:righe.find(x=>x.operatore.id===selezionato)||null;
 const periodo=r?.turni.length?{inizio:iso(r.turni[0].dataTurno),fine:iso(r.turni[r.turni.length-1].dataTurno)}:null;
 const padre=r?.contratti.find(c=>c.tipologia==="CHIAMATA"&&periodo&&copre(c,periodo.inizio));
 const richiedePadre=!padre;
 const requisiti=r?[
  ...(!(r.operatore.codiceFiscale||r.operatore.codice_fiscale)?.trim()?["Codice fiscale"]:[]),
  ...(richiedePadre?["Contratto a chiamata padre valido"]:[]),
  ...(padre&&!padre.pathContrattoUnilav?["Documento UNILAV"]:[]),
  ...(padre&&!padre.cfDatore?["Codice fiscale datore di lavoro"]:[]),
  ...(padre&&!padre.emailDatore?["Email datore di lavoro"]:[]),
  ...(!periodo?["Turni futuri da programmare"]:[])
 ]:[];
 const pronti=!!r&&!richiedePadre&&requisiti.length===0;
 const vaiContratti=(id:number,prepara=false)=>{
  const p=new URLSearchParams({tab:"contratti"});
  if(prepara&&padre&&periodo){p.set("azione","chiamata");p.set("contratto",String(padre.idContratto));p.set("inizio",periodo.inizio);p.set("fine",periodo.fine);}
  navigate(`/admin/dettaglio-operatore/${id}?${p.toString()}`);
 };
 return <main className="m-6 space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-extrabold text-[#007a55]">HR · Operatori da regolarizzare</h1><p className="text-sm text-gray-500">Operatori con criticità, ordinati in base al prossimo turno</p></div><button className="rounded-md bg-[#007a55] px-4 py-2 text-white disabled:opacity-50" onClick={()=>void carica()} disabled={loading}>{loading?"Caricamento…":"Aggiorna dati"}</button></div>
  {errore&&<div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{errore}</div>}
  {progress&&<p className="text-sm text-gray-500">{progress}</p>}
  <div className="grid gap-4 sm:grid-cols-2">
   <div className="rounded-xl border border-[#cfe2dc] bg-white p-5"><div className="text-sm font-semibold">Operatori da regolarizzare</div><div className="mt-2 text-3xl font-bold text-[#007a55]">{irregolari.length}</div></div>
   <div className="rounded-xl border border-red-200 bg-red-50/50 p-5"><div className="text-sm font-semibold text-red-800">Urgenti da regolarizzare</div><div className="mt-2 text-3xl font-bold text-red-700">{irregolari.filter(x=>x.prossimoTurno!==null&&x.priorita<=3).length}</div></div>
  </div>
  <div className="rounded-xl border bg-white p-4">
   <div className="mb-3 flex justify-between gap-2"><input aria-label="Cerca operatore" placeholder="Cerca operatore o codice fiscale" value={ricerca} onChange={e=>setRicerca(e.target.value)} className="w-full max-w-sm rounded-md border px-3 py-2 text-sm"/><span className="self-center text-xs text-gray-500">Ordine: priorità turno</span></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead><tr className="bg-[#ecf3f1] text-left"><th className="p-3">Operatore</th><th className="p-3">Inquadramento</th><th className="p-3">Datore di lavoro</th><th className="p-3">Prossimo turno</th><th className="p-3">Stato</th><th className="p-3">Priorità</th><th className="p-3">Azioni</th></tr></thead><tbody>
    {visibili.map(x=><Fragment key={x.operatore.id}><tr className="border-b">
      <td className="p-3 font-semibold"><button type="button" aria-expanded={espanso===x.operatore.id} aria-label="Dettagli turni" className="mr-2 text-[#007a55]" onClick={()=>setEspanso(v=>v===x.operatore.id?null:x.operatore.id)}>{espanso===x.operatore.id?"▾":"▸"}</button>{x.operatore.cognome} {x.operatore.nome}</td>
      <td className="p-3"><select className="w-full rounded border bg-white p-2" aria-label="Inquadramento" value={inlineHR[x.operatore.id]?.tipo??x.contratti.find(c=>copre(c,x.prossimoTurno||oggi()))?.tipologia??""} onChange={e=>aggiorna(x.operatore.id,"tipo",e.target.value)}><option value="">Da assegnare</option><option value="CHIAMATA">Chiamata</option><option value="TEMPO_DETERMINATO">Determinato</option><option value="TEMPO_INDETERMINATO">Indeterminato</option><option value="OCCASIONALE">Occasionale</option><option value="FATTURA">Fattura</option></select></td>
      <td className="p-3"><select className="w-full rounded border bg-white p-2" aria-label="Datore di lavoro" value={inlineHR[x.operatore.id]?.datore??"DETELDER"} onChange={e=>aggiorna(x.operatore.id,"datore",e.target.value)}><option value="DETELDER">DETELDER</option><option value="SOCIETA_APPALTO">Società in appalto</option><option value="AUTONOMO_PIVA">Autonomo - P.IVA</option></select></td>
      <td className="p-3">{formatData(x.prossimoTurno)}</td>
      <td className="p-3"><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${x.stato==="Scaduto"?"bg-red-50 text-red-700":x.stato==="Incompleto"?"bg-amber-50 text-amber-800":"bg-emerald-50 text-emerald-700"}`}>{x.stato==="Regolare"?<CheckCircle2 className="h-4 w-4"/>:<AlertCircle className="h-4 w-4"/>}{x.stato}</span></td>
      <td className="p-3">{x.prossimoTurno&&x.priorita<=3?<span className="font-semibold text-red-700">Alta</span>:x.prossimoTurno&&x.priorita<=14?<span className="font-semibold text-amber-700">Media</span>:<span className="text-gray-500">Bassa</span>}</td>
      <td className="p-3"><div className="flex items-center gap-2"><Link to={`/admin/dettaglio-operatore/${x.operatore.id}?tab=contratti`} className="rounded-md bg-[#007a55] px-3 py-2 text-xs text-white">Vai ai contratti</Link><button onClick={()=>setSelezionato(x.operatore.id)} title="Azione proposta" aria-label="Visualizza azione proposta" className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#b7d7cc] text-[#007a55]"><Sparkles className="h-5 w-5"/></button></div></td>
    </tr>{espanso===x.operatore.id&&<tr className="bg-[#f5faf8]"><td colSpan={7} className="p-4"><div className="rounded-lg border bg-white p-4"><h3 className="mb-3 font-semibold text-[#007a55]">Turni assegnati</h3>{x.turni.length?<table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="p-2">Data</th><th className="p-2">Orario</th><th className="p-2">Evento</th><th className="p-2">Luogo</th></tr></thead><tbody>{x.turni.map((t,i)=><tr key={t.idTurno??i} className="border-t"><td className="p-2">{formatData(t.dataTurno)}</td><td className="p-2">{t.oraInizio||"—"} – {t.oraFine||"—"}</td><td className="p-2">{t.nomeEvento||"—"}</td><td className="p-2">{t.via||"Luogo non specificato"}</td></tr>)}</tbody></table>:<p className="text-gray-500">Nessun turno nei prossimi 90 giorni</p>}</div></td></tr>}</Fragment>)}
    {!visibili.length&&<tr><td colSpan={7} className="p-6 text-center text-gray-500">{loading?"Caricamento…":"Nessun operatore da regolarizzare"}</td></tr>}
   </tbody></table></div>
  </div>
  {r&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={()=>setSelezionato(null)}><section role="dialog" aria-modal="true" aria-label="Azione proposta" className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl" onClick={e=>e.stopPropagation()}>
   <div className="flex items-center justify-between"><div><h2 className="text-xl font-bold">Azione proposta</h2><p className="text-sm text-gray-500">{r.operatore.nome} {r.operatore.cognome}</p></div><button aria-label="Chiudi" onClick={()=>setSelezionato(null)}><X className="h-5 w-5"/></button></div>
   <div className="rounded-lg border border-[#cfe2dc] bg-[#f5faf8] p-4"><div className="flex items-center gap-2 font-semibold text-[#007a55]"><Sparkles className="h-5 w-5"/>{richiedePadre?"Crea contratto a chiamata padre":"Crea chiamata intermittente"}</div><p className="mt-1 text-sm text-gray-600">{richiedePadre?"Occorre creare o aggiornare il contratto padre prima di comunicare una chiamata.":"Contratto padre individuato. La chiamata va verificata, generata e inviata tramite PEC."}</p></div>
   <div><div className="mb-2 text-sm font-semibold">Requisiti: {pronti?"soddisfatti":"incompleti"}</div>{requisiti.length?<div className="flex flex-wrap gap-2">{requisiti.map(x=><span key={x} className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">{x}</span>)}</div>:<span className="inline-flex items-center gap-1 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4"/>Dati necessari presenti</span>}</div>
   {periodo&&<div className="grid grid-cols-2 gap-3 rounded-lg border p-3 text-sm"><div><span className="text-gray-500">Data inizio proposta</span><div className="font-semibold">{formatData(periodo.inizio)}</div></div><div><span className="text-gray-500">Data fine proposta</span><div className="font-semibold">{formatData(periodo.fine)}</div></div></div>}
   {pronti?<button className="w-full rounded-md bg-[#007a55] px-4 py-3 font-semibold text-white" onClick={()=>vaiContratti(r.operatore.id,true)}>INVIA PEC</button>:<button className="w-full rounded-md bg-[#007a55] px-4 py-3 font-semibold text-white" onClick={()=>vaiContratti(r.operatore.id,false)}>REGOLARIZZA DOCUMENTAZIONE</button>}
   <p className="text-xs text-gray-500">INVIA PEC apre il flusso di preparazione e verifica nella tab Contratti; non effettua l'invio automaticamente. Le date sono proposte sulla base dei turni, da verificare prima della comunicazione.</p>
  </section></div>}
  <p className="text-xs text-amber-700">Le selezioni inline sono provvisorie e non vengono ancora salvate su Aiven. La presenza del contratto padre non certifica l'avvenuto invio delle chiamate.</p>
 </main>;
}
