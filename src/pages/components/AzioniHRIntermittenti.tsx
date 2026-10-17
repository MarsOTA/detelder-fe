import {useEffect,useMemo,useState} from "react";
import {CheckCircle2,FilePlus2,RefreshCw,Send} from "lucide-react";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {aggiornaEsitoChiamataHR,leggiDatoreIntermittenti,listaChiamateHR,salvaChiamataHR} from "@/utils/chiamateHR";
import type {ChiamataHR,DatoreIntermittenti} from "@/utils/chiamateHR";
import {downloadXml,generaUniIntermittentiXml} from "@/utils/intermittentiXml";
import {hrLeggiCodiceComunicazione} from "@/utils/hrWorkflow";
import type {HRPratica} from "@/utils/hrWorkflow";

export type ProssimaAzioneTurno={idTurno:number;dataTurno:string;oraInizio?:string;oraFine?:string;titoloEvento?:string;nomeEvento?:string};
export type ContrattoPadreAzione={idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null};
const day=(x?:string|null)=>x?String(x).slice(0,10):"";
const fmt=(v:string)=>v?v.slice(8,10)+"/"+v.slice(5,7)+"/"+v.slice(0,4):"";
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const plus=(date:string,days:number)=>{const d=new Date(date+"T12:00:00");d.setDate(d.getDate()+days);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
type Props={idOperatore:number;pratica:HRPratica;contratti:ContrattoPadreAzione[];codiceFiscale:string;onCreateContract:()=>void};
export default function AzioniHRIntermittenti({idOperatore,pratica,contratti,codiceFiscale,onCreateContract}:Props){
 const [turni,setTurni]=useState<ProssimaAzioneTurno[]>([]);
 const [chiamate,setChiamate]=useState<Record<number,ChiamataHR[]|null>>({});
 const [datore,setDatore]=useState<DatoreIntermittenti|null>(null);
 const [loading,setLoading]=useState(true);
 const [working,setWorking]=useState<string|null>(null);
 const [errore,setErrore]=useState("");
 const [avviso,setAvviso]=useState("");
 const [esito,setEsito]=useState<Record<string,string>>({});
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
 const from=periodo.da||pending[0]?.data||"";
 const to=periodo.a||pending[pending.length-1]?.data||from;
 const valido=!!padre&&!!from&&!!to&&from<=to&&from>=day(padre.dataInizio)&&(!padre.dataFine||to<=day(padre.dataFine));
 const prepara=async(data:string,parent:ContrattoPadreAzione,draft?:ChiamataHR)=>{
  setWorking(data);setErrore("");setAvviso("");
  try{
   if(!codiceFiscale?.trim())throw new Error("Codice fiscale del lavoratore mancante nell'anagrafica");
   if(pratica.datore!=="DETELDER")throw new Error("CF datore configurato soltanto per DETELDER. Per il datore selezionato occorre configurare i dati prima di preparare la PEC.");
   const employer=datore||await leggiDatoreIntermittenti();
   if(!employer.codiceFiscale||!employer.email)throw new Error("Dati del datore non configurati");
   const {codice}=await hrLeggiCodiceComunicazione(pratica.id);
   const xml=draft?.xmlArchiviato||generaUniIntermittentiXml({cfDatore:employer.codiceFiscale,emailDatore:employer.email,lavoratori:[{cfLavoratore:codiceFiscale,codiceComunicazione:codice.trim(),dataInizio:data,dataFine:to}]});
   const callId=draft?.id||(await salvaChiamataHR(idOperatore,parent.idContratto,data,to,xml)).id;
   await aggiornaEsitoChiamataHR(idOperatore,parent.idContratto,callId,"PEC_PREPARATA");
   downloadXml(xml,"UNI_Intermittenti_"+data+".xml");
   const subject=encodeURIComponent("UNI_Intermittenti - "+data);
   const body=encodeURIComponent("Allego la comunicazione UNI_Intermittenti in formato XML. Verificare destinatario, allegato ed esito dell'invio PEC.");
   window.location.href="mailto:?subject="+subject+"&body="+body;
   setAvviso("XML scaricato e bozza email aperta. Allega il file alla PEC e inviala dal gestore autorizzato; successivamente registra la ricevuta.");
   await refresh();
  }catch(e){setErrore(e instanceof Error?e.message:"Impossibile preparare la PEC")}
  finally{setWorking(null)}
 };
 const conferma=async(data:string,parent:ContrattoPadreAzione,draft:ChiamataHR)=>{
  const value=(esito[data]||"").trim();
  if(value.length<5){setErrore("Inserisci gli estremi verificabili della ricevuta PEC.");return}
  setWorking(data);setErrore("");
  try{await aggiornaEsitoChiamataHR(idOperatore,parent.idContratto,draft.id,"INVIATA",value);await refresh();setAvviso("Comunicazione registrata come inviata con riferimento PEC.");}
  catch(e){setErrore(e instanceof Error?e.message:"Conferma invio non riuscita")}
  finally{setWorking(null)}
 };
 return <section className="space-y-2 rounded-lg border border-[#bfdad0] bg-[#f9fcfb] p-3">
  <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-semibold text-[#315e51]">Contratto e chiamate · prossimi 7 giorni</h4>
   <button type="button" onClick={()=>void refresh()} disabled={loading} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"><RefreshCw className="h-3.5 w-3.5"/>Aggiorna</button>
  </div>
  {!padre?<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2"><div><span className="inline-flex items-center gap-2 text-sm font-semibold"><FilePlus2 className="h-4 w-4"/>Crea contratto a chiamata</span><p className="mt-1 text-xs text-amber-800">Requisiti: contratto assegnato, CF lavoratore {codiceFiscale?"✓":"mancante"}, periodo valido</p></div><button type="button" className="rounded bg-[#a75d00] px-3 py-1.5 text-xs font-semibold text-white" onClick={onCreateContract}>Crea contratto</button></div>:
  <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><CheckCircle2 className="h-4 w-4"/>Contratto a chiamata registrato · requisiti soddisfatti</div>}
  {errore&&<p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-800">{errore}</p>}
  {avviso&&<p role="status" className="rounded bg-emerald-50 p-2 text-xs text-emerald-800">{avviso}</p>}
  <div className="rounded-md border bg-white px-3 py-3">
   <h4 className="text-sm font-semibold text-[#315e51]">Turni in programma</h4>
   {loading?<p className="mt-2 text-xs text-gray-500">Caricamento turni…</p>:giorni.length===0?<p className="mt-2 text-xs text-gray-500">Nessun turno nei prossimi sette giorni.</p>:
    <div className="mt-2 space-y-1.5">{giorni.map(g=><div key={g.data} className={`rounded-md border px-3 py-2 text-xs ${g.submitted?"border-emerald-200 bg-emerald-50":"border-amber-200 bg-amber-50"}`}><strong>{fmt(g.data)} · {g.items.length} turno/i {g.submitted?"✓":""}</strong><div className="mt-1 space-y-0.5 text-gray-700">{g.items.map(t=><div key={t.idTurno}>{t.nomeEvento||t.titoloEvento||"Turno #"+t.idTurno}{t.oraInizio?" · "+String(t.oraInizio).slice(0,5):""}{t.oraFine?"–"+String(t.oraFine).slice(0,5):""}</div>)}</div></div>)}</div>}
   <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
    <label className="text-xs text-gray-600">Chiamata dal<input type="date" value={from} onChange={e=>setPeriodo(p=>({...p,da:e.target.value}))} className="mt-1 w-full rounded border px-2 py-2"/></label>
    <label className="text-xs text-gray-600">Al<input type="date" min={from||undefined} value={to} onChange={e=>setPeriodo(p=>({...p,a:e.target.value}))} className="mt-1 w-full rounded border px-2 py-2"/></label>
    <button type="button" disabled={!valido||working!==null||!datore} onClick={()=>void prepara(from,padre!)} className="rounded-md bg-[#007a55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send className="mr-1 inline h-4 w-4"/>Prepara PEC</button>
   </div>
   <p className="mt-2 text-xs text-gray-600">Requisiti: contratto a chiamata attivo, CF lavoratore e datore configurati, intervallo valido e codice UNILAV se disponibile. La PEC va inviata dal gestore autorizzato.</p>
   {!valido&&<p className="mt-2 text-xs text-amber-700">Seleziona un periodo valido all'interno del contratto padre. Le date possono raggruppare più turni.</p>}
  </div>
  <details className="rounded-md border bg-white px-3 py-2">
   <summary className="cursor-pointer text-sm font-semibold text-[#007a55]">Archivio chiamate del contratto ({archivi.length})</summary>
   {archivi.length?<div className="mt-2 space-y-2">{archivi.map(c=><div key={c.id} className="rounded-md border bg-[#f8fbfa] p-2 text-xs">
    <div className="flex flex-wrap justify-between gap-2"><strong>{fmt(day(c.dataInizio))} – {fmt(day(c.dataFine))}</strong><span className={c.stato==="INVIATA"?"font-semibold text-emerald-700":"font-semibold text-amber-800"}>{c.stato.replace(/_/g," ")}</span></div>
    {c.esitoInvio&&<p className="mt-1 text-gray-600">Ricevuta: {c.esitoInvio}</p>}
    {c.stato!=="INVIATA"&&padre&&<div className="mt-2 flex flex-wrap items-center gap-2">
      <input className="min-w-[175px] flex-1 rounded border px-2 py-1" placeholder="Riferimento ricevuta PEC" value={esito[String(c.id)]||""} onChange={e=>setEsito(p=>({...p,[c.id]:e.target.value}))}/>
      <button type="button" disabled={working!==null} onClick={()=>void conferma(String(c.id),padre,c)} className="rounded bg-[#007a55] px-3 py-1 font-semibold text-white">Conferma invio</button>
    </div>}
   </div>)}</div>:<p className="mt-2 text-xs text-gray-500">Nessuna chiamata registrata.</p>}
  </details>
  <p className="text-[11px] text-gray-500">Le chiamate sono raggruppate per giornata. “Prepara PEC” genera e scarica l'XML e apre l'email; l'invio effettivo avviene dal gestore PEC e richiede la conferma della ricevuta.</p>
 </section>;
}
