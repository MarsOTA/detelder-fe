import {useEffect,useMemo,useState} from "react";
import type {ReactNode} from "react";
import {FilePlus2,RefreshCw,Send,Info,Archive,AlertCircle,Ban,Trash2,FileDown,FileCode2,FileText,Eye} from "lucide-react";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {puoPreparareChiamata} from "@/utils/hrContrattoRestrittivo";
import {aggiornaEsitoChiamataHR,leggiDatoreIntermittenti,listaChiamateHR,salvaChiamataHR,simulaInvioChiamataHR,simulaAnnullamentoChiamataHR,resetSimulazioniChiamataHR,eliminaVecchieChiamate18Ottobre} from "@/utils/chiamateHR";
import type {ChiamataHR,DatoreIntermittenti} from "@/utils/chiamateHR";
import {downloadXml,generaUniIntermittentiXml} from "@/utils/intermittentiXml";
import {scaricaPdfIntermittenti,visualizzaPdfIntermittenti} from "@/utils/intermittentiPdf";
import {hrLeggiCodiceComunicazione} from "@/utils/hrWorkflow";
import {raggruppaGiornate,coprePeriodoChiamata,intersecaPeriodoChiamata,estraiPrestazioniXml,testoPeriodiChiamata} from "@/utils/intermittentiPrestazioni";
import type {IntervalloChiamata} from "@/utils/intermittentiPrestazioni";
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
  "Prestazioni: "+testoPeriodiChiamata(c),
  "Data/ora registrata: "+(c.dataOraInvio||"non disponibile"),
  "Esito tecnico simulato: "+(tipo==="annullamento"?c.esitoAnnullamento||"simulazione annullamento":c.esitoInvio||"simulazione invio"),
  "Nessuna email realmente inviata. Nessuna conferma di consegna acquisita."
 ];
 saveText(testo.join("\\n"),"EMAIL_DEMO_"+tipo+"_"+c.id+".txt");
};
const plus=(date:string,days:number)=>{const d=new Date(date+"T12:00:00");d.setDate(d.getDate()+days);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
type Props={idOperatore:number;pratica:HRPratica;contratti:ContrattoPadreAzione[];codiceFiscale:string;onCreateContract:()=>void;createFields?:ReactNode;missingPrerequisites?:boolean;onProgressUpdated?:()=>void;mode?:"tasks"|"archive";readOnly?:boolean};
export default function AzioniHRIntermittenti({idOperatore,pratica,contratti,codiceFiscale,onCreateContract,createFields,missingPrerequisites=false,onProgressUpdated,mode="tasks",readOnly=false}:Props){
 const [turni,setTurni]=useState<ProssimaAzioneTurno[]>([]);
 const [chiamate,setChiamate]=useState<Record<number,ChiamataHR[]|null>>({});
 const [datore,setDatore]=useState<DatoreIntermittenti|null>(null);
 const [loading,setLoading]=useState(true);
 const [working,setWorking]=useState<string|null>(null);
 const [errore,setErrore]=useState("");
 const [avviso,setAvviso]=useState("");
 const [showTurni,setShowTurni]=useState(false);
 const [selezione,setSelezione]=useState<string[]>([]);
 const refresh=async()=>{
  setLoading(true);setErrore("");
  try{
   const start=today(),end=plus(start,90);
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
   const submitted=archives?.find(c=>c.stato==="INVIATA"&&!c.annullamentoTest&&coprePeriodoChiamata(c,data,data));
   const draft=archives?.find(c=>c.stato!=="INVIATA"&&coprePeriodoChiamata(c,data,data));
   return {data,items,parent,submitted,draft,unknown:!!parent&&!Array.isArray(archives)};
  });
 },[turni,contratti,chiamate]);
 const archivi=padre?(chiamate[padre.idContratto]||[]):[];
 const pending=giorni.filter(g=>!!padre&&g.parent?.idContratto===padre.idContratto&&puoPreparareChiamata(padre,g.data,g.data)&&!g.submitted&&!g.draft&&!g.unknown);
 const gruppiProposti=raggruppaGiornate(pending.map(x=>x.data));
 const firmaGruppi=gruppiProposti.map(p=>p.inizio+":"+p.fine).join("|");
 useEffect(()=>{setSelezione(gruppiProposti.slice(0,10).map(p=>p.inizio));},[firmaGruppi]);
 const selezionati=gruppiProposti.filter(p=>selezione.includes(p.inizio));
 const valido=!!padre&&!!padre.pathContrattoUnilav&&selezionati.length>0&&selezionati.length<=10&&selezionati.every(p=>puoPreparareChiamata(padre,p.inizio,p.fine));
 const coperturaEsistente=archivi.some(c=>!c.annullamentoTest&&selezionati.some(p=>intersecaPeriodoChiamata(c,p.inizio,p.fine)));
 const prepara=async(periodi:IntervalloChiamata[],parent:ContrattoPadreAzione)=>{
  setWorking("multipla");setErrore("");setAvviso("");
  try{
   if(!periodi.length||periodi.length>10)throw new Error("Seleziona da 1 a 10 prestazioni.");
   if(periodi.some(p=>!puoPreparareChiamata(parent,p.inizio,p.fine)))throw new Error("Le prestazioni devono essere future e comprese nel contratto a chiamata.");
   const current=await listaChiamateHR(idOperatore,parent.idContratto);
   if(periodi.some(p=>current.some(c=>!c.annullamentoTest&&intersecaPeriodoChiamata(c,p.inizio,p.fine))))
    throw new Error("Almeno una prestazione è già presente in archivio. Aggiorna prima di riprovare.");
   if(!codiceFiscale?.trim())throw new Error("Codice fiscale del lavoratore mancante nell'anagrafica.");
   if(pratica.datore!=="DETELDER")throw new Error("CF datore configurato soltanto per DETELDER.");
   const employer=datore||await leggiDatoreIntermittenti();
   if(!employer.codiceFiscale||!employer.email)throw new Error("Dati del datore non configurati.");
   if(!parent.pathContrattoUnilav)throw new Error("Carica prima l'UNILAV del contratto padre.");
   const {codice}=await hrLeggiCodiceComunicazione(pratica.id);
   if(!codice.trim())throw new Error("Inserisci prima il codice comunicazione UNILAV.");
   const xml=generaUniIntermittentiXml({
    cfDatore:employer.codiceFiscale,emailDatore:employer.email,
    lavoratori:periodi.map(p=>({
     cfLavoratore:codiceFiscale,codiceComunicazione:codice.trim(),
     dataInizio:p.inizio,dataFine:p.fine
    }))
   });
   const first=periodi[0].inizio,last=periodi[periodi.length-1].fine;
   // Gli estremi Aiven servono per l'ordinamento; la copertura è nelle righe XML.
   const callId=(await salvaChiamataHR(idOperatore,parent.idContratto,first,last,xml)).id;
   await aggiornaEsitoChiamataHR(idOperatore,parent.idContratto,callId,"PEC_PREPARATA");
   const sim=await simulaInvioChiamataHR(idOperatore,parent.idContratto,callId);
   downloadXml(xml,"UNI_Intermittenti_"+first+".xml");
   setAvviso(sim.simulata?"SIMULAZIONE TEST: "+periodi.length+" prestazioni in un XML, nessuna email realmente inviata. XML e PDF disponibili nell'archivio.":"Simulazione non disponibile.");
   await refresh();onProgressUpdated?.();
  }catch(e){setErrore(e instanceof Error?e.message:"Impossibile preparare la comunicazione.")}
  finally{setWorking(null);}
 };
 const annullaTest=async(c:ChiamataHR)=>{
  if(!padre||!c.esitoInvio?.startsWith("SIMULAZIONE TEST")||c.annullamentoTest)return;
  if(!window.confirm("Simulare l’annullamento di TUTTE le prestazioni della comunicazione #"+c.id+"? Non verrà inviata alcuna email reale."))return;
  setWorking("annulla-"+c.id);setErrore("");
  try{
   const employer=datore||await leggiDatoreIntermittenti();
   const {codice}=await hrLeggiCodiceComunicazione(pratica.id);
   const prestazioni=c.xmlArchiviato?estraiPrestazioniXml(c.xmlArchiviato):[{cfLavoratore:codiceFiscale,codiceComunicazione:codice.trim(),dataInizio:day(c.dataInizio),dataFine:day(c.dataFine)}];
   if(!prestazioni.length)throw new Error("Nessuna prestazione da annullare.");
   const xml=generaUniIntermittentiXml({cfDatore:employer.codiceFiscale,emailDatore:employer.email,annullamento:true,lavoratori:prestazioni});
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
 <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-lg font-bold text-[#007a55]"><Archive className="h-5 w-5"/>Archivio chiamate del contratto</h3><span className="rounded-full bg-[#ecf3f1] px-2 py-1 text-xs font-semibold text-[#007a55]">{archivi.length} comunicazioni</span></div>
 {loading?<p className="mt-2 text-xs text-gray-500">Caricamento…</p>:archivi.length?<div className="mt-3 overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead><tr className="border-b bg-[#ecf3f1] text-[#315e51]"><th className="p-3">Chiamata</th><th className="p-3">Periodo</th><th className="p-3">Stato</th><th className="p-3">Ricevuta / rapporto</th><th className="p-3">XML</th><th className="p-3">PDF compilato</th><th className="p-3">Azioni</th></tr></thead><tbody>{archivi.map(c=><tr key={c.id} className="border-b"><td className="p-3 font-semibold">#{c.id}</td><td className="p-3 whitespace-nowrap">{testoPeriodiChiamata(c)}</td><td className="p-3">{c.annullamentoTest?"Annullata (test)":c.esitoInvio?.startsWith("SIMULAZIONE TEST")?"Invio simulato":c.stato==="INVIATA"?"Invio registrato":c.stato==="PEC_PREPARATA"?"Preparata":"Bozza"}</td><td className="p-3">{c.esitoInvio?.startsWith("SIMULAZIONE TEST")?<button type="button" className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-100" title="Rapporto simulato" onClick={()=>ricevutaDemo(c,"invio")}><FileDown className="h-4 w-4"/>Rapporto</button>:<span className="text-xs text-gray-500">Non disponibile</span>}{c.annullamentoTest&&<button className="ml-2 rounded border px-2 py-1" onClick={()=>ricevutaDemo(c,"annullamento")}>Annullamento DEMO</button>}</td><td className="p-3">{c.xmlArchiviato?<button className="inline-flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-[#007a55] hover:bg-emerald-100" onClick={()=>downloadXml(c.xmlArchiviato||"","UNI_Intermittenti_"+c.id+".xml")}><FileCode2 className="h-4 w-4"/>XML</button>:"—"}</td><td className="p-3">{c.xmlArchiviato?<div className="flex flex-wrap gap-1"><button type="button" title="Visualizza PDF compilato" onClick={()=>visualizzaPdfIntermittenti(c.xmlArchiviato||"")} className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs"><Eye className="h-4 w-4"/>Apri</button><button type="button" title="Scarica PDF compilato" onClick={()=>scaricaPdfIntermittenti(c.xmlArchiviato||"","UNI_Intermittenti_"+c.id+".pdf")} className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs"><FileText className="h-4 w-4"/>PDF</button></div>:"—"}</td><td className="p-3">{!readOnly&&c.esitoInvio?.startsWith("SIMULAZIONE TEST")&&!c.annullamentoTest&&<button type="button" disabled={working!==null} onClick={()=>void annullaTest(c)} aria-label={"Annulla tutte le prestazioni della comunicazione "+c.id} className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-100"><Ban className="h-4 w-4"/>Annulla chiamata</button>}</td></tr>)}</tbody></table></div>:<p className="mt-2 text-xs text-gray-500">Nessuna comunicazione archiviata.</p>}
 {!readOnly&&archivi.filter(c=>day(c.dataInizio)==="2026-10-18"&&c.stato==="PEC_PREPARATA"&&!c.esitoInvio).length===2&&<button type="button" disabled={working!==null} onClick={()=>void pulisciVecchie18()} className="mt-3 mr-2 inline-flex items-center gap-2 rounded border border-amber-200 px-3 py-2 text-xs font-semibold text-amber-800 disabled:opacity-40"><Trash2 className="h-4 w-4"/>Elimina 2 vecchie chiamate del 18/10</button>}
 {!readOnly&&archivi.some(c=>c.esitoInvio?.startsWith("SIMULAZIONE TEST"))&&<button type="button" disabled={working!==null} onClick={()=>void pulisciTest()} className="mt-3 inline-flex items-center gap-2 rounded border border-red-200 px-3 py-2 text-xs font-semibold text-red-700 disabled:opacity-40"><Trash2 className="h-4 w-4"/>Pulisci simulazioni di questo contratto</button>}
 {errore&&<p role="alert" className="mt-2 text-xs text-red-700">{errore}</p>}
 {avviso&&<p role="status" className="mt-2 text-xs text-emerald-700">{avviso}</p>}
 </section>;
 return <section className="contents">
  <div className="absolute right-0 top-0 z-10 flex items-center gap-2">
   {!missingPrerequisites&&(Number(!padre)+Number(!padre?.pathContrattoUnilav)+Number(pending.length>0)>0)&&<span className="whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">{Number(!padre)+Number(!padre?.pathContrattoUnilav)+Number(pending.length>0)} da completare</span>}
   <button type="button" title="Aggiorna attività HR" aria-label="Aggiorna attività HR" onClick={()=>void refresh()} disabled={loading} className="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-[#edf5f1] hover:text-[#007a55] disabled:opacity-40"><RefreshCw className={`h-4 w-4 ${loading?"animate-spin":""}`}/></button>
  </div>
  {!missingPrerequisites&&!padre?<div className="order-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4"><div><span className="inline-flex items-center gap-2 text-sm font-semibold"><FilePlus2 className="h-4 w-4"/>Crea contratto a chiamata</span><p className="mt-1 text-xs text-amber-800">Requisiti: contratto assegnato, CF lavoratore {codiceFiscale?"✓":"mancante"}, periodo valido</p></div>{createFields||<button type="button" className="rounded bg-[#a75d00] px-3 py-1.5 text-xs font-semibold text-white" disabled={readOnly} onClick={onCreateContract}>Crea contratto</button>}</div>:
  null}
  {errore&&<p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-800">{errore}</p>}
  {avviso&&<p role="status" className="rounded bg-emerald-50 p-2 text-xs text-emerald-800">{avviso}</p>}
  {!missingPrerequisites&&!!padre&&pending.length>0&&<div className="order-3 rounded-xl border border-red-200 bg-red-50/50 px-4 py-4">
   <div className="mb-3 flex items-center justify-between"><h4 className="flex items-center gap-2 text-sm font-bold text-red-900"><AlertCircle className="h-5 w-5 text-red-600"/>{readOnly?"Chiamata da comunicare · avvisa HR":"Nuova chiamata proposta automaticamente"}</h4><span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">{readOnly?"DA COMUNICARE · HR":"DA PREPARARE · TEST"}</span></div><div className="flex items-center justify-between"><h4 className="text-xs font-semibold text-[#007a55]">Turni pianificati senza comunicazione · prossimi 90 giorni</h4><button type="button" title="Dettaglio turni" aria-label="Espandi dettaglio turni" aria-expanded={showTurni} onClick={()=>setShowTurni(v=>!v)} className="rounded-full border p-1.5 text-[#007a55]"><Info className="h-4 w-4"/></button></div>
   {loading?<p className="mt-2 text-xs text-gray-500">Caricamento…</p>:gruppiProposti.length===0?<p className="mt-2 text-xs text-gray-500">Nessun turno da comunicare.</p>:
    <div className="mt-3 overflow-x-auto rounded-lg border border-[#d5e7df] bg-white">
     <table className="w-full min-w-[530px] text-left text-xs">
      <thead className="bg-[#edf5f1] text-[#315e51]"><tr>
       <th className="p-2">Includi</th><th className="p-2">Prestazione</th><th className="p-2">Dal</th><th className="p-2">Al</th><th className="p-2">Giorni</th>
      </tr></thead>
      <tbody>{gruppiProposti.map((p,i)=>{
       const days=pending.filter(g=>g.data>=p.inizio&&g.data<=p.fine);
       const checked=selezione.includes(p.inizio);
       return <tr key={p.inizio} className="border-t align-top">
        <td className="p-2"><input type="checkbox" aria-label={"Includi prestazione "+fmt(p.inizio)} checked={checked} disabled={readOnly||working!==null||(!checked&&selezione.length>=10)} onChange={e=>setSelezione(current=>e.target.checked?[...current,p.inizio]:current.filter(k=>k!==p.inizio))}/></td>
        <td className="p-2 font-semibold text-[#315e51]">{i+1}</td>
        <td className="p-2">{fmt(p.inizio)}</td>
        <td className="p-2">{fmt(p.fine)}</td>
        <td className="p-2">{days.length} {days.length===1?"giorno":"giorni"}
         {showTurni&&<div className="mt-2 space-y-1 text-gray-600">{days.flatMap(g=>g.items.map(t=><div key={g.data+":"+t.idTurno}>{fmt(g.data)} · {t.nomeEvento||t.titoloEvento||"Turno #"+t.idTurno}</div>))}</div>}
        </td>
       </tr>;
      })}</tbody>
     </table>
    </div>}
   {!readOnly&&<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
    <span className="text-xs text-gray-600">{selezionati.length} prestazioni selezionate · un XML fino a 10 righe{gruppiProposti.length>10?" · le rimanenti richiedono un'altra comunicazione":""}</span>
    <button type="button" disabled={!valido||working!==null||!datore||coperturaEsistente} onClick={()=>void prepara(selezionati,padre!)} className="rounded-md bg-[#007a55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><Send className="mr-1 inline h-4 w-4"/>Simula comunicazione ({selezionati.length})</button>
   </div>}
   <p className="mt-2 text-xs text-gray-600">Requisiti: contratto a chiamata valido, UNILAV caricata, codice comunicazione UNILAV presente, CF lavoratore e datore configurati. L'invio reale tramite email ordinaria richiede l'integrazione del servizio email.</p>
   {!valido&&<p className="mt-2 text-xs text-amber-700">{!padre?.pathContrattoUnilav?"Carica prima l’UNILAV del contratto padre.":"Seleziona un periodo valido all’interno del contratto padre."}</p>}
  </div>}
 </section>;
}
