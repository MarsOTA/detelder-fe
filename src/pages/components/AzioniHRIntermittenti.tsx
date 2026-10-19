import {useEffect,useMemo,useState} from "react";
import {CheckCircle2,FilePlus2,RefreshCw,Send,Info,Archive,AlertCircle} from "lucide-react";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {aggiornaEsitoChiamataHR,leggiDatoreIntermittenti,listaChiamateHR,salvaChiamataHR,simulaInvioChiamataHR} from "@/utils/chiamateHR";
import type {ChiamataHR,DatoreIntermittenti} from "@/utils/chiamateHR";
import {downloadXml,generaUniIntermittentiXml} from "@/utils/intermittentiXml";
import {hrLeggiCodiceComunicazione} from "@/utils/hrWorkflow";
import type {HRPratica} from "@/utils/hrWorkflow";

export type ProssimaAzioneTurno={idTurno:number;dataTurno:string;oraInizio?:string;oraFine?:string;titoloEvento?:string;nomeEvento?:string};
export type ContrattoPadreAzione={idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null;pathContrattoUnilav?:string|null};
const day=(x?:string|null)=>x?String(x).slice(0,10):"";
const fmt=(v:string)=>v?v.slice(8,10)+"/"+v.slice(5,7)+"/"+v.slice(0,4):"";
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const plus=(date:string,days:number)=>{const d=new Date(date+"T12:00:00");d.setDate(d.getDate()+days);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
type Props={idOperatore:number;pratica:HRPratica;contratti:ContrattoPadreAzione[];codiceFiscale:string;onCreateContract:()=>void;onProgressUpdated?:()=>void;mode?:"tasks"|"archive";readOnly?:boolean};
export default function AzioniHRIntermittenti({idOperatore,pratica,contratti,codiceFiscale,onCreateContract,onProgressUpdated,mode="tasks",readOnly=false}:Props){
 const [turni,setTurni]=useState<ProssimaAzioneTurno[]>([]);
 const [chiamate,setChiamate]=useState<Record<number,ChiamataHR[]|null>>({});
 const [datore,setDatore]=useState<DatoreIntermittenti|null>(null);
 const [loading,setLoading]=useState(true);
 const [working,setWorking]=useState<string|null>(null);
 const [errore,setErrore]=useState("");
 const [avviso,setAvviso]=useState("");
 const [showTurni,setShowTurni]=useState(false);
 const [periodo,setPeriodo]=useState<{da:string;a:string}>({da:"",a:""});
 const refresh=async()=>{
  setLoading(true);setErrore("");
  try{
   const start=today(),end=plus(start,7);
   const resp=await fetch(ezystaffBEUrl+"turni?dataInizio="+start+"&dataFine="+end,{credentials:"include",headers:{Authorization:"Bearer "+(localStorage.getItem("token")||""),Accept:"application/json"}});
   if(!resp.ok)throw new Error("Impossibile verificare i turni imminenti");
   const all=await resp.json() as (ProssimaAzioneTurno&{idOperatore?:number|null})[];
   if(!Array.isArray(all))throw new Error("Risposta turni non valida");
   setTurni(all.filter(t=>Number(t.idOperatore)===idOperatore&&day(t.dataTurno)>=start&&day(t.dataTurno)<=end).sort((a,b)=>day(a.dataTurno).localeCompare(day(b.dataTurno))));
   const padri=contratti.filter(c=>c.tipologia==="CHIAMATA");
   const results=await Promise.allSettled(padri.map(c=>listaChiamateHR(idOperatore,c.idContratto)));
   const archive:Record<number,ChiamataHR[]|null>={};
   results.forEach((v,i)=>{archive[padri[i].idContratto]=v.status==="fulfilled"?v.value:null});
   setChiamate(archive);
  }catch(e){setErrore(e instanceof Error?e.message:"Verifica turni indisponibile");setTurni([])}
  finally{setLoading(false)}
 };
 const ids=contratti.map(c=>c.idContratto).join(",");
 useEffect(()=>{void refresh()},[idOperatore,ids]);
 useEffect(()=>{let active=true;void leggiDatoreIntermittenti().then(v=>{if(active)setDatore(v)}).catch(e=>{if(active)setErrore(e instanceof Error?e.message:"Configurazione datore non disponibile")});return()=>{active=false}},[pratica.id]);
 const padre=useMemo(()=>contratti.filter(c=>c.tipologia==="CHIAMATA"&&day(c.dataInizio)===day(pratica.dataInizio)).sort((a,b)=>b.idContratto-a.idContratto)[0]||null,[contratti,pratica.dataInizio]);
 // Group multiple shift rows on the same day; one communication covers that calendar day.
 const giorni=useMemo(()=>{
  const map=new Map<string,ProssimaAzioneTurno[]>();
  turni.forEach(t=>{const d=day(t.dataTurno);map.set(d,[...(map.get(d)||[]),t])});
  return [...map].map(([data,items])=>{
   const parent=contratti.find(c=>c.tipologia==="CHIAMATA"&&day(c.dataInizio)<=data&&(!c.dataFine||day(c.dataFine)>=data));
   const archives=parent?chiamate[parent.idContratto]:[];
   const submitted=archives?.find(c=>c.stato==="INVIATA"&&day(c.dataInizio)<=data&&day(c.dataFine)>=data);
   const draft=archives?.find(c=>c.stato!=="INVIATA"&&day(c.dataInizio)<=data&&day(c.dataFine)>=data);
   return {data,items,parent,submitted,draft,unknown:!!parent&&!Array.isArray(archives)};
  });
 },[turni,contratti,chiamate]);
 const archivi=padre?(chiamate[padre.idContratto]||[]):[];
 const pending=giorni.filter(g=>!g.submitted);
 const copertiDaTest=giorni.some(g=>!!g.submitted?.esitoInvio?.startsWith("SIMULAZIONE TEST"));
 const chiamateCompletate=giorni.length>0&&giorni.every(g=>!!g.submitted)&&!giorni.some(g=>g.unknown);
 const from=periodo.da||pending[0]?.data||"";
 const to=periodo.a||pending[pending.length-1]?.data||from;
 const valido=!!padre&&!!from&&!!to&&from<=to&&from>=day(padre.dataInizio)&&(!padre.dataFine||to<=day(padre.dataFine));
 const coperturaEsistente=archivi.some(c=>c.stato==="INVIATA"&&day(c.dataInizio)<=from&&day(c.dataFine)>=to);
 const prepara=async(data:string,parent:ContrattoPadreAzione,draft?:ChiamataHR)=>{
  setWorking(data);setErrore("");setAvviso("");
  try{
   if(archivi.some(c=>c.stato==="INVIATA"&&day(c.dataInizio)<=data&&day(c.dataFine)>=to))throw new Error("Chiamata già inviata o simulata per questo periodo: consulta l’archivio.");
   if(!codiceFiscale?.trim())throw new Error("Codice fiscale del lavoratore mancante nell'anagrafica");
   if(pratica.datore!=="DETELDER")throw new Error("CF datore configurato soltanto per DETELDER. Per il datore selezionato occorre configurare i dati prima di preparare la PEC.");
   const employer=datore||await leggiDatoreIntermittenti();
   if(!employer.codiceFiscale||!employer.email)throw new Error("Dati del datore non configurati");
   const {codice}=await hrLeggiCodiceComunicazione(pratica.id);
   const xml=draft?.xmlArchiviato||generaUniIntermittentiXml({cfDatore:employer.codiceFiscale,emailDatore:employer.email,lavoratori:[{cfLavoratore:codiceFiscale,codiceComunicazione:codice.trim(),dataInizio:data,dataFine:to}]});
   const callId=draft?.id||(await salvaChiamataHR(idOperatore,parent.idContratto,data,to,xml)).id;
   await aggiornaEsitoChiamataHR(idOperatore,parent.idContratto,callId,"PEC_PREPARATA");
   const sim=await simulaInvioChiamataHR(idOperatore,parent.idContratto,callId);
   downloadXml(xml,"UNI_Intermittenti_"+data+".xml");
   setAvviso(sim.simulata?"SIMULAZIONE TEST: stato INVIATA nell’archivio, nessuna email realmente spedita. Task completato nella simulazione; XML e prova disponibili nell’archivio.":"Simulazione non disponibile");
   await refresh();onProgressUpdated?.();
  }catch(e){setErrore(e instanceof Error?e.message:"Impossibile preparare la PEC")}
  finally{setWorking(null)}
 };
 if(mode==="archive")return <section className="rounded-lg border border-[#cfe2dc] bg-white p-3">
 <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-lg font-bold text-[#007a55]"><Archive className="h-5 w-5"/>Archivio chiamate del contratto</h3><span className="rounded-full bg-[#ecf3f1] px-2 py-1 text-xs font-semibold text-[#007a55]">{archivi.length} chiamate</span></div>
 {loading?<p className="mt-2 text-xs text-gray-500">Caricamento…</p>:archivi.length?<div className="mt-2 divide-y">{archivi.map(c=><div key={c.id} className="flex items-center justify-between gap-2 py-2 text-xs"><div><strong>{fmt(day(c.dataInizio))} – {fmt(day(c.dataFine))}</strong><p className="text-gray-500">UNI-Intermittenti · #{c.id}</p></div><span className={c.stato==="INVIATA"?"rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-800":c.esitoInvio?.startsWith("SIMULAZIONE TEST")?"rounded-full bg-indigo-100 px-2 py-1 font-semibold text-indigo-800":c.stato==="PEC_PREPARATA"?"rounded-full bg-blue-100 px-2 py-1 font-semibold text-blue-800":"rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800"}>{c.esitoInvio?.startsWith("SIMULAZIONE TEST")?"Invio simulato":c.stato==="INVIATA"?"Invio registrato":c.stato==="PEC_PREPARATA"?"Preparata":"Bozza"}</span></div>)}<p className="mt-1 text-xs text-gray-500">{archivi.filter(c=>c.esitoInvio?.startsWith("SIMULAZIONE TEST")).length} prove di test disponibili; non sono ricevute di consegna reali.</p></div>:<p className="mt-2 text-xs text-gray-500">Nessuna comunicazione archiviata.</p>}
 {archivi.some(c=>c.esitoInvio?.startsWith("SIMULAZIONE TEST"))&&<p className="mt-2 text-xs font-semibold text-indigo-700">Solo test: nessuna email spedita, nessuna ricevuta reale.</p>}
 {archivi.length>0&&<div className="mt-2 flex flex-wrap gap-2">{archivi.filter(c=>c.xmlArchiviato||c.esitoInvio?.startsWith("SIMULAZIONE TEST")).map(c=><div key={c.id} className="flex gap-1 text-xs">{c.xmlArchiviato&&<button title={"XML chiamata "+c.id} type="button" className="rounded border px-2 py-1 text-[#007a55]" onClick={()=>downloadXml(c.xmlArchiviato||"","UNI_Intermittenti_"+c.id+".xml")}>XML #{c.id}</button>}{c.esitoInvio?.startsWith("SIMULAZIONE TEST")&&<button type="button" title="Mostra prova simulata" className="rounded border border-indigo-200 px-2 py-1 text-indigo-700" onClick={()=>window.alert(c.esitoInvio||"")}>Prova TEST #{c.id}</button>}</div>)}</div>}
 <p className="mt-2 text-[11px] text-gray-500">Le ricevute PEC certificate saranno disponibili dopo l'attivazione dell'integrazione con il gestore.</p>
 </section>;
 return <section className="contents">
  <div className="absolute right-0 top-0 flex items-center gap-2"><p className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-600">{Number(!padre)+Number(!padre?.pathContrattoUnilav)+Number(giorni.length>0&&(!chiamateCompletate))} DA COMPLETARE</p>
   <button type="button" onClick={()=>void refresh()} disabled={loading} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"><RefreshCw className="h-3.5 w-3.5"/>Aggiorna</button>
  </div>
  {!padre?<div className="order-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4"><div><span className="inline-flex items-center gap-2 text-sm font-semibold"><FilePlus2 className="h-4 w-4"/>Crea contratto a chiamata</span><p className="mt-1 text-xs text-amber-800">Requisiti: contratto assegnato, CF lavoratore {codiceFiscale?"✓":"mancante"}, periodo valido</p></div><button type="button" className="rounded bg-[#a75d00] px-3 py-1.5 text-xs font-semibold text-white" disabled={readOnly} onClick={onCreateContract}>Crea contratto</button></div>:
  <div className="order-1 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4"><div className="flex items-center gap-2 text-sm font-bold text-[#102e4d]"><CheckCircle2 className="h-5 w-5 text-emerald-700"/>Contratto a chiamata generato<span className="ml-auto rounded-full bg-emerald-200 px-3 py-1 text-xs font-semibold text-emerald-800">COMPLETATO</span></div><p className="mt-2 border-t border-emerald-100 pt-2 text-xs text-gray-600">Requisiti: CF lavoratore ✓ · Datore di lavoro ✓ · Periodo valido ✓</p></div>}
  {errore&&<p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-800">{errore}</p>}
  {avviso&&<p role="status" className="rounded bg-emerald-50 p-2 text-xs text-emerald-800">{avviso}</p>}
  <div className={`order-3 rounded-xl border px-4 py-4 ${chiamateCompletate?"border-emerald-200 bg-emerald-50":"border-amber-200 bg-amber-50/60"}`}>
   <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-bold text-[#102e4d]"><AlertCircle className="h-5 w-5 text-amber-600"/>Prepara e invia chiamate intermittenti</h4><span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">{chiamateCompletate?(copertiDaTest?"SIMULAZIONE COMPLETATA":"COMPLETATO"):"DA INVIARE"}</span></div><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-[#007a55]">Turni in programma · prossimi 7 giorni</h4><button type="button" title="Dettaglio turni" aria-label="Espandi dettaglio turni" aria-expanded={showTurni} onClick={()=>setShowTurni(v=>!v)} className="rounded-full border p-1.5 text-[#007a55]"><Info className="h-4 w-4"/></button></div>
   {loading?<p className="mt-2 text-xs text-gray-500">Caricamento turni…</p>:giorni.length===0?<p className="mt-2 text-xs text-gray-500">Nessun turno nei prossimi sette giorni.</p>:
    <div className="mt-2 flex flex-wrap gap-1.5">{giorni.map(g=><div key={g.data} className={`rounded-md border px-3 py-2 text-xs ${g.submitted?"border-emerald-200 bg-emerald-50":"border-amber-200 bg-amber-50"}`}><strong>{fmt(g.data)} · {g.items.length} turno/i {g.submitted?"✓":""}</strong>{showTurni&&<div className="mt-1 space-y-0.5 text-gray-700">{g.items.map(t=><div key={t.idTurno}>{t.nomeEvento||t.titoloEvento||"Turno #"+t.idTurno}{t.oraInizio?" · "+String(t.oraInizio).slice(0,5):""}{t.oraFine?"–"+String(t.oraFine).slice(0,5):""}</div>)}</div>}</div>)}</div>}
   <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
    <label className="text-xs text-gray-600">Chiamata dal<input type="date" disabled={readOnly} value={from} onChange={e=>setPeriodo(p=>({...p,da:e.target.value}))} className="mt-1 w-full rounded border px-2 py-2"/></label>
    <label className="text-xs text-gray-600">Al<input type="date" disabled={readOnly} min={from||undefined} value={to} onChange={e=>setPeriodo(p=>({...p,a:e.target.value}))} className="mt-1 w-full rounded border px-2 py-2"/></label>
    <button type="button" disabled={readOnly||!valido||working!==null||!datore||coperturaEsistente} onClick={()=>void prepara(from,padre!)} className="rounded-md bg-[#007a55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send className="mr-1 inline h-4 w-4"/>Simula invio email</button>
   </div>
   <p className="mt-2 text-xs text-gray-600">Requisiti: contratto a chiamata attivo, CF lavoratore e datore configurati, intervallo valido e codice UNILAV se disponibile. La PEC va inviata dal gestore autorizzato.</p>
   {coperturaEsistente&&<p className="mt-2 text-xs font-semibold text-emerald-700">Periodo già comunicato in test: puoi consultarlo nell’archivio.</p>}
   {!valido&&<p className="mt-2 text-xs text-amber-700">Seleziona un periodo valido all'interno del contratto padre. Le date possono raggruppare più turni.</p>}
  </div>
  <p className="text-[11px] text-gray-500">Le chiamate sono raggruppate per giornata. Test: genera XML e registra un esito simulato senza inviare email. L’invio reale da info@detelder.com richiederà l’integrazione con il provider.</p>
 </section>;
}
