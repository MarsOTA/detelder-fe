import {useEffect,useMemo,useState} from "react";
import {AlertTriangle,CheckCircle2,FilePlus2,RefreshCw,Send} from "lucide-react";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {aggiornaEsitoChiamataHR,leggiDatoreIntermittenti,listaChiamateHR,salvaChiamataHR} from "@/utils/chiamateHR";
import type {ChiamataHR,DatoreIntermittenti} from "@/utils/chiamateHR";
import {DATORE_DETELDER_DEFAULT} from "@/utils/chiamateHR";
import {downloadXml,generaUniIntermittentiXml} from "@/utils/intermittentiXml";
import {hrLeggiCodiceComunicazione,hrSalvaCodiceComunicazione} from "@/utils/hrWorkflow";
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
 const [codice,setCodice]=useState("");
 const [codiceSalvato,setCodiceSalvato]=useState("");
 const [loading,setLoading]=useState(true);
 const [working,setWorking]=useState<string|null>(null);
 const [errore,setErrore]=useState("");
 const [avviso,setAvviso]=useState("");
 const [esito,setEsito]=useState<Record<string,string>>({});
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
 useEffect(()=>{let active=true;void Promise.all([hrLeggiCodiceComunicazione(pratica.id),leggiDatoreIntermittenti()]).then(([saved,employer])=>{
  if(!active)return;setCodice(saved.codice||"");setCodiceSalvato(saved.codice||"");setDatore(employer);
 }).catch(e=>{if(active)setErrore(e instanceof Error?e.message:"Configurazione PEC non disponibile")});
 return ()=>{active=false};
 },[pratica.id]);
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
 const saveCode=async()=>{
  if(codice.trim()===codiceSalvato)return;
  const v=await hrSalvaCodiceComunicazione(pratica.id,codice.trim());
  setCodice(v.codice);setCodiceSalvato(v.codice);
 };
 const prepara=async(data:string,parent:ContrattoPadreAzione,draft?:ChiamataHR)=>{
  setWorking(data);setErrore("");setAvviso("");
  try{
   if(!codiceFiscale?.trim())throw new Error("Codice fiscale del lavoratore mancante nell'anagrafica");
   const employer=datore||await leggiDatoreIntermittenti();
   if(!employer.codiceFiscale||!employer.email)throw new Error("Dati del datore non configurati");
   await saveCode();
   const xml=draft?.xmlArchiviato||generaUniIntermittentiXml({cfDatore:employer.codiceFiscale,emailDatore:employer.email,lavoratori:[{cfLavoratore:codiceFiscale,codiceComunicazione:codice.trim(),dataInizio:data,dataFine:data}]});
   const callId=draft?.id||(await salvaChiamataHR(idOperatore,parent.idContratto,data,data,xml)).id;
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
  <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold text-[#233f35]">Da fare · contratto e chiamate dei prossimi 7 giorni</h3>
   <button type="button" onClick={()=>void refresh()} disabled={loading} className="inline-flex items-center gap-1 rounded border px-2 py-1 text-xs"><RefreshCw className="h-3.5 w-3.5"/>Aggiorna</button>
  </div>
  {!padre?<div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2"><span className="inline-flex items-center gap-2 text-sm font-semibold"><FilePlus2 className="h-4 w-4"/>Crea contratto a chiamata</span><button type="button" className="rounded bg-[#a75d00] px-3 py-1.5 text-xs font-semibold text-white" onClick={onCreateContract}>Crea contratto</button></div>:
  <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800"><CheckCircle2 className="h-4 w-4"/>Contratto a chiamata registrato</div>}
  <div className="flex flex-wrap items-center gap-3 rounded-md border bg-white px-3 py-2">
   <label className="min-w-[230px] flex-1 text-xs font-medium text-gray-600">Codice comunicazione UNILAV (comune alle chiamate)<input className="mt-1 block w-full rounded border px-3 py-1.5 text-sm text-[#273b35]" value={codice} onChange={e=>setCodice(e.target.value)} onBlur={()=>void saveCode().catch(e=>setErrore(e instanceof Error?e.message:"Salvataggio codice fallito"))} placeholder="Se disponibile, inserisci una sola volta"/></label>
   <span className="text-xs text-gray-500">{codice===codiceSalvato?"Salvato nella pratica":"Da salvare"}</span>
  </div>
  {errore&&<p role="alert" className="rounded bg-red-50 p-2 text-xs text-red-800">{errore}</p>}
  {avviso&&<p role="status" className="rounded bg-emerald-50 p-2 text-xs text-emerald-800">{avviso}</p>}
  {loading?<p className="text-xs text-gray-500">Verifica chiamate in corso…</p>:giorni.length===0?<p className="rounded border bg-white p-3 text-xs text-gray-600">Nessun turno nei prossimi 7 giorni: nessuna chiamata da predisporre.</p>:
   <div className="space-y-1.5">{giorni.map(g=>{
    const ok=!!g.submitted,problem=!g.parent||g.unknown;
    return <div key={g.data} className={`rounded-md border px-3 py-2 ${ok?"border-emerald-200 bg-emerald-50":problem?"border-red-200 bg-red-50":"border-amber-200 bg-amber-50"}`}>
     <div className="flex flex-wrap items-center gap-2"><span>{ok?<CheckCircle2 className="h-4 w-4 text-emerald-700"/>:problem?<AlertTriangle className="h-4 w-4 text-red-700"/>:<Send className="h-4 w-4 text-amber-800"/>}</span>
      <div className="flex-1 text-sm"><strong>{fmt(g.data)}</strong> · {g.items.length} turno/i <span className="text-xs text-gray-600">{g.items.map(x=>x.nomeEvento||x.titoloEvento||"Turno "+x.idTurno).join(" · ")}</span></div>
      {ok?<span className="text-xs font-semibold text-emerald-800">PEC inviata</span>:g.parent&&!g.unknown?<button type="button" disabled={working!==null||!datore} onClick={()=>void prepara(g.data,g.parent!,g.draft)} className="rounded bg-[#a75d00] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">{working===g.data?"Preparazione…":g.draft?"Riprendi PEC":"Prepara PEC"}</button>:<span className="text-xs text-red-800">{g.unknown?"Verifica archivio indisponibile":"Contratto padre mancante"}</span>}
     </div>
     {!ok&&g.draft&&g.parent&&<div className="mt-2 flex flex-wrap items-center gap-2 border-t border-amber-200 pt-2"><span className="text-xs text-amber-900">PEC preparata, invio da confermare</span><input className="min-w-[200px] flex-1 rounded border bg-white px-2 py-1 text-xs" placeholder="Riferimento ricevuta PEC" value={esito[g.data]||""} onChange={e=>setEsito(p=>({...p,[g.data]:e.target.value}))}/><button type="button" disabled={working!==null} onClick={()=>void conferma(g.data,g.parent!,g.draft!)} className="rounded bg-[#007a55] px-3 py-1 text-xs font-semibold text-white">Conferma invio</button></div>}
    </div>
   })}</div>
  }
  <p className="text-[11px] text-gray-500">Le chiamate sono raggruppate per giornata. “Prepara PEC” genera e scarica l'XML e apre l'email; l'invio effettivo avviene dal gestore PEC e richiede la conferma della ricevuta.</p>
 </section>;
}
