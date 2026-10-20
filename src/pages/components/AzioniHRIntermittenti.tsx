import {useEffect,useMemo,useState} from "react";
import type {ReactNode} from "react";
import {CheckCircle2,FilePlus2,RefreshCw,Send,Info,Archive,AlertCircle,Ban,Trash2} from "lucide-react";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {aggiornaEsitoChiamataHR,leggiDatoreIntermittenti,listaChiamateHR,salvaChiamataHR,simulaInvioChiamataHR,simulaAnnullamentoChiamataHR,resetSimulazioniChiamataHR,eliminaVecchieChiamate18Ottobre} from "@/utils/chiamateHR";
import type {ChiamataHR,DatoreIntermittenti} from "@/utils/chiamateHR";
import {downloadXml,generaUniIntermittentiXml} from "@/utils/intermittentiXml";
import {hrLeggiCodiceComunicazione} from "@/utils/hrWorkflow";
import type {HRPratica} from "@/utils/hrWorkflow";

export type ProssimaAzioneTurno={idTurno:number;dataTurno:string;oraInizio?:string;oraFine?:string;titoloEvento?:string;nomeEvento?:string};
export type ContrattoPadreAzione={idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null;pathContrattoUnilav?:string|null};
const day=(x?:string|null)=>x?String(x).slice(0,10):"";
const fmt=(v:string)=>v?v.slice(8,10)+"/"+v.slice(5,7)+"/"+v.slice(0,4):"";
const today=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const saveText=(content:string,name:string)=>{const url=URL.createObjectURL(new Blob([content],{type:"text/plain;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)};
const ricevutaDemo=(c:ChiamataHR, tipo:"invio"|"annullamento")=>{
 const testo=[
  "DETELDER - EVIDENZA SIMULATA DI EMAIL ORDINARIA",
  "DOCUMENTO DIMOSTRATIVO - NON COSTITUISCE PROVA DI INVIO O CONSEGNA",
  "Comunicazione: "+(tipo==="annullamento"?"annullamento":"invio")+" chiamata intermittente",
  "Identificativo chiamata: "+c.id,
  "Periodo: "+fmt(day(c.dataInizio))+" - "+fmt(day(c.dataFine)),
  "Data/ora registrata: "+(c.dataOraInvio||"non disponibile"),
  "Esito tecnico simulato: "+(tipo==="annullamento"?c.esitoAnnullamento||"simulazione annullamento":c.esitoInvio||"simulazione invio"),
  "Nessuna email realmente inviata. Nessuna conferma di consegna acquisita."
 ];
 saveText(testo.join("\\n"),"EMAIL_DEMO_"+tipo+"_"+c.id+".txt");
};
const plus=(date:string,days:number)=>{const d=new Date(date+"T12:00:00");d.setDate(d.getDate()+days);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
type Props={idOperatore:number;pratica:HRPratica;contratti:ContrattoPadreAzione[];codiceFiscale:string;onCreateContract:()=>void;createFields?:ReactNode;onProgressUpdated?:()=>void;mode?:"tasks"|"archive";readOnly?:boolean};
export default function AzioniHRIntermittenti({idOperatore,pratica,contratti,codiceFiscale,onCreateContract,createFields,onProgressUpdated,mode="tasks",readOnly=false}:Props){
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
   const submitted=archives?.find(c=>c.stato==="INVIATA"&&!c.annullamentoTest&&day(c.dataInizio)<=data&&day(c.dataFine)>=data);
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
 const coperturaEsistente=archivi.some(c=>c.stato==="INVIATA"&&!c.annullamentoTest&&day(c.dataInizio)<=from&&day(c.dataFine)>=to);
 const prepara=async(data:string,parent:ContrattoPadreAzione,draft?:ChiamataHR)=>{
  setWorking(data);setErrore("");setAvviso("");
  try{
   if(archivi.some(c=>c.stato==="INVIATA"&&!c.annullamentoTest&&day(c.dataInizio)<=data&&day(c.dataFine)>=to))throw new Error("Chiamata già inviata o simulata per questo periodo: consulta l’archivio.");
   if(!codiceFiscale?.trim())throw new Error("Codice fiscale del lavoratore mancante nell'anagrafica");
   if(pratica.datore!=="DETELDER")throw new Error("CF datore configurato soltanto per DETELDER. Per il datore selezionato occorre configurare i dati prima di preparare l'email.");
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
  }catch(e){setErrore(e instanceof Error?e.message:"Impossibile preparare l'email")}
  finally{setWorking(null)}
 };
 const annullaTest=async(c:ChiamataHR)=>{
  if(!padre||!c.esitoInvio?.startsWith("SIMULAZIONE TEST")||c.annullamentoTest)return;
  if(!window.confirm("Simulare l’annullamento della chiamata #"+c.id+"? Non verrà inviata alcuna email reale."))return;
  setWorking("annulla-"+c.id);setErrore("");
  try{
   const employer=datore||await leggiDatoreIntermittenti();
   const {codice}=await hrLeggiCodiceComunicazione(pratica.id);
   const xml=generaUniIntermittentiXml({cfDatore:employer.codiceFiscale,emailDatore:employer.email,annullamento:true,lavoratori:[{cfLavoratore:codiceFiscale,codiceComunicazione:codice.trim(),dataInizio:day(c.dataInizio),dataFine:day(c.dataFine)}]});
   await simulaAnnullamentoChiamataHR(idOperatore,padre.idContratto,c.id,xml);
   downloadXml(xml,"ANNULLAMENTO_TEST_Intermittenti_"+c.id+".xml");
   await refresh();onProgressUpdated?.();
  }catch(e){setErrore(e instanceof Error?e.message:"Annullamento test non riuscito")}
  finally{setWorking(null)}
 };
 const pulisciVecchie18=async()=>{
  if(!padre||readOnly)return;
  if(!window.confirm("Eliminare SOLO le 2 vecchie chiamate del 18/10/2026 in stato Preparata di questo contratto? Il server bloccherà l’operazione se non corrispondono esattamente due record."))return;
  setWorking("legacy18");setErrore("");setAvviso("");
  try{
   const result=await eliminaVecchieChiamate18Ottobre(idOperatore,padre.idContratto);
   setAvviso(result.eliminate+" vecchie chiamate preparate del 18/10 eliminate dal database di test.");
   await refresh();onProgressUpdated?.();
  }catch(e){setErrore(e instanceof Error?e.message:"Impossibile eliminare i vecchi record")}
  finally{setWorking(null)}
 };
 const pulisciTest=async()=>{
  if(!padre||readOnly)return;
  if(!window.confirm("Eliminare tutte le comunicazioni SIMULATE di questo contratto dal database di test? Non saranno cancellate chiamate reali o contratti."))return;
  setWorking("reset");setErrore("");
  try{const result=await resetSimulazioniChiamataHR(idOperatore,padre.idContratto);setAvviso(result.eliminate+" comunicazioni simulate eliminate dal test.");await refresh();onProgressUpdated?.()}
  catch(e){setErrore(e instanceof Error?e.message:"Pulizia chiamate test non riuscita")}
  finally{setWorking(null)}
 };
 if(mode==="archive")return <section className="rounded-lg border border-[#cfe2dc] bg-white p-3">
 <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-lg font-bold text-[#007a55]"><Archive className="h-5 w-5"/>Archivio chiamate del contratto</h3><span className="rounded-full bg-[#ecf3f1] px-2 py-1 text-xs font-semibold text-[#007a55]">{archivi.length} chiamate</span></div>
 {loading?<p className="mt-2 text-xs text-gray-500">Caricamento…</p>:archivi.length?<div className="mt-3 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b bg-[#ecf3f1] text-[#315e51]"><th className="p-3">Chiamata</th><th className="p-3">Periodo</th><th className="p-3">Stato</th><th className="p-3">Ricevuta / rapporto</th><th className="p-3">XML</th><th className="p-3">Azioni</th></tr></thead><tbody>{archivi.map(c=><tr key={c.id} className="border-b"><td className="p-3 font-semibold">#{c.id}</td><td className="p-3 whitespace-nowrap">{fmt(day(c.dataInizio))} – {fmt(day(c.dataFine))}</td><td className="p-3">{c.annullamentoTest?"Annullata (test)":c.esitoInvio?.startsWith("SIMULAZIONE TEST")?"Invio simulato":c.stato==="INVIATA"?"Invio registrato":c.stato==="PEC_PREPARATA"?"Preparata":"Bozza"}</td><td className="p-3">{c.esitoInvio?.startsWith("SIMULAZIONE TEST")?<button type="button" className="rounded border border-indigo-200 px-3 py-1.5 text-indigo-700" onClick={()=>ricevutaDemo(c,"invio")}>Rapporto DEMO</button>:<span className="text-xs text-gray-500">Non disponibile</span>}{c.annullamentoTest&&<button className="ml-2 rounded border px-2 py-1" onClick={()=>ricevutaDemo(c,"annullamento")}>Annullamento DEMO</button>}</td><td className="p-3">{c.xmlArchiviato?<button className="rounded border px-3 py-1.5 text-[#007a55]" onClick={()=>downloadXml(c.xmlArchiviato||"","UNI_Intermittenti_"+c.id+".xml")}>Scarica XML</button>:"—"}</td><td className="p-3">{!readOnly&&c.esitoInvio?.startsWith("SIMULAZIONE TEST")&&!c.annullamentoTest&&<button type="button" disabled={working!==null} onClick={()=>void annullaTest(c)} aria-label={"Simula annullamento chiamata "+c.id} className="rounded border border-amber-200 p-2 text-amber-700"><Ban className="h-4 w-4"/></button>}</td></tr>)}</tbody></table><p className="mt-2 text-xs text-gray-500">Le ricevute demo non certificano l'effettiva consegna dell'email.</p></div>:<p className="mt-2 text-xs text-gray-500">Nessuna comunicazione archiviata.</p>}
 {!readOnly&&archivi.filter(c=>day(c.dataInizio)==="2026-10-18"&&c.stato==="PEC_PREPARATA"&&!c.esitoInvio).length===2&&<button type="button" disabled={working!==null} onClick={()=>void pulisciVecchie18()} className="mt-3 mr-2 inline-flex items-center gap-2 rounded border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 disabled:opacity-40"><Trash2 className="h-4 w-4"/>Elimina 2 vecchie chiamate del 18/10</button>}
 {!readOnly&&archivi.some(c=>c.esitoInvio?.startsWith("SIMULAZIONE TEST"))&&<button type="button" disabled={working!==null} onClick={()=>void pulisciTest()} className="mt-3 inline-flex items-center gap-2 rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"><Trash2 className="h-4 w-4"/>Pulisci simulazioni di questo contratto</button>}
 {errore&&<p role="alert" className="mt-2 text-xs text-red-700">{errore}</p>}
 {avviso&&<p role="status" className="mt-2 text-xs text-emerald-700">{avviso}</p>}
 {archivi.some(c=>c.esitoInvio?.startsWith("SIMULAZIONE TEST"))&&<p className="mt-2 text-xs font-semibold text-indigo-700">Solo test: nessuna email spedita, nessuna ricevuta reale.</p>}
 {archivi.length>0&&<div className="mt-2 flex flex-wrap gap-2">{archivi.filter(c=>c.xmlArchiviato||c.esitoInvio?.startsWith("SIMULAZIONE TEST")).map(c=><div key={c.id} className="flex gap-1 text-xs">{c.xmlAnnullamento&&<button title={"XML annullamento test "+c.id} type="button" className="rounded border border-amber-200 px-2 py-1 text-amber-700" onClick={()=>downloadXml(c.xmlAnnullamento||"","ANNULLAMENTO_TEST_"+c.id+".xml")}>Annullamento #{c.id}</button>}{c.xmlArchiviato&&<button title={"XML chiamata "+c.id} type="button" className="rounded border px-2 py-1 text-[#007a55]" onClick={()=>downloadXml(c.xmlArchiviato||"","UNI_Intermittenti_"+c.id+".xml")}>XML #{c.id}</button>}{c.esitoInvio?.startsWith("SIMULAZIONE TEST")&&<button type="button" title="Mostra prova simulata" className="rounded border border-indigo-200 px-2 py-1 text-indigo-700" onClick={()=>saveText(["EVIDENZA SIMULATA - NON VALIDA COME PROVA DI INVIO","Chiamata #"+c.id,"Periodo: "+fmt(day(c.dataInizio))+" - "+fmt(day(c.dataFine)),"Esito: "+(c.esitoInvio||""),"ATTENZIONE: nessuna email è stata realmente spedita. Nessuna ricevuta del Ministero è stata acquisita."].join("\n"),"EVIDENZA_SOLO_TEST_"+c.id+".txt")}>Prova TEST #{c.id}</button>}</div>)}</div>}
 <p className="mt-2 text-[11px] text-gray-500">Con posta ordinaria non sono previste ricevute PEC certificate: quando sarà attivo l'invio SMTP conserveremo email originale inviata, XML allegato e riferimenti tecnici del server di posta. Le prove TEST non attestano alcun invio.</p>
 </section>;
 return <section className="contents">
  <div className="absolute right-0 top-0 flex items-center gap-2">{Number(!padre)+Number(!padre?.pathContrattoUnilav)+Number(giorni.length>0&&!chiamateCompletate)>0&&<p className="rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-600">{Number(!padre)+Number(!padre?.pathContrattoUnilav)+Number(giorni.length>0&&!chiamateCompletate)} DA COMPLETARE</p>}
   <button type="button" onClick={()=>void refresh()} disabled={loading} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"><RefreshCw className="h-3.5 w-3.5"/>Aggiorna</button>
  </div>
  {!padre?<div className="order-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4"><div><span className="inline-flex items-center gap-2 text-sm font-semibold"><FilePlus2 className="h-4 w-4"/>Crea contratto a chiamata</span><p className="mt-1 text-xs text-amber-800">Requisiti: contratto assegnato, CF lavoratore {codiceFiscale?"✓":"mancante"}, periodo valido</p></div>{createFields||<button type="button" className="rounded bg-[#a75d00] px-3 py-1.5 text-xs font-semibold text-white" disabled={readOnly} onClick={onCreateContract}>Crea contratto</button>}</div>:
  null}
  {errore&&<p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-800">{errore}</p>}
  {avviso&&<p role="status" className="rounded bg-emerald-50 p-2 text-xs text-emerald-800">{avviso}</p>}
  {!!padre&&giorni.length>0&&!chiamateCompletate&&<div className={`order-3 rounded-xl border px-4 py-4 ${chiamateCompletate?"border-emerald-200 bg-emerald-50":"border-amber-200 bg-amber-50/60"}`}>
   <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-bold text-[#102e4d]">{chiamateCompletate?<CheckCircle2 className="h-5 w-5 text-emerald-700"/>:<AlertCircle className="h-5 w-5 text-amber-600"/>}Prepara e invia chiamate intermittenti</h4><span className={`rounded-full px-3 py-1 text-xs font-semibold ${chiamateCompletate?"bg-emerald-200 text-emerald-800":"bg-amber-100 text-amber-700"}`}>{chiamateCompletate?(copertiDaTest?"SIMULAZIONE COMPLETATA":"COMPLETATO"):"DA INVIARE"}</span></div><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-[#007a55]">Turni in programma · prossimi 7 giorni</h4><button type="button" title="Dettaglio turni" aria-label="Espandi dettaglio turni" aria-expanded={showTurni} onClick={()=>setShowTurni(v=>!v)} className="rounded-full border p-1.5 text-[#007a55]"><Info className="h-4 w-4"/></button></div>
   {loading?<p className="mt-2 text-xs text-gray-500">Caricamento turni…</p>:giorni.length===0?<p className="mt-2 text-xs text-gray-500">Nessun turno nei prossimi sette giorni.</p>:
    <div className="mt-2 flex flex-wrap gap-1.5">{giorni.map(g=><div key={g.data} className={`rounded-md border px-3 py-2 text-xs ${g.submitted?"border-emerald-200 bg-white":"border-amber-200 bg-white"}`}><strong>{fmt(g.data)} · {g.items.length} turno/i {g.submitted?"✓":""}</strong>{showTurni&&<div className="mt-1 space-y-0.5 text-gray-700">{g.items.map(t=><div key={t.idTurno}>{t.nomeEvento||t.titoloEvento||"Turno #"+t.idTurno}{t.oraInizio?" · "+String(t.oraInizio).slice(0,5):""}{t.oraFine?"–"+String(t.oraFine).slice(0,5):""}</div>)}</div>}</div>)}</div>}
   <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
    <label className="text-xs text-gray-600">Chiamata dal<input type="date" disabled={readOnly} value={from} onChange={e=>setPeriodo(p=>({...p,da:e.target.value}))} className="mt-1 w-full rounded border bg-white px-2 py-2"/></label>
    <label className="text-xs text-gray-600">Al<input type="date" disabled={readOnly} min={from||undefined} value={to} onChange={e=>setPeriodo(p=>({...p,a:e.target.value}))} className="mt-1 w-full rounded border bg-white px-2 py-2"/></label>
    <button type="button" disabled={readOnly||!valido||working!==null||!datore||coperturaEsistente} onClick={()=>void prepara(from,padre!)} className="rounded-md bg-[#007a55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send className="mr-1 inline h-4 w-4"/>Simula invio email</button>
   </div>
   <p className="mt-2 text-xs text-gray-600">Requisiti: contratto a chiamata attivo, CF lavoratore e datore configurati, intervallo valido e codice UNILAV se disponibile. L'invio reale tramite email ordinaria richiede l'integrazione del servizio email.</p>
   {coperturaEsistente&&<p className="mt-2 text-xs font-semibold text-emerald-700">Periodo già comunicato in test: puoi consultarlo nell’archivio.</p>}
   {!valido&&<p className="mt-2 text-xs text-amber-700">Seleziona un periodo valido all'interno del contratto padre. Le date possono raggruppare più turni.</p>}
  </div>}
  <p className="text-[11px] text-gray-500">Le chiamate sono raggruppate per giornata. Test: genera XML e registra un esito simulato senza inviare email. L’invio reale da info@detelder.com richiederà l’integrazione con il provider.</p>
 </section>;
}
