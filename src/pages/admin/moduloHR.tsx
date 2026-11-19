import { Fragment, useEffect, useMemo, useState } from "react";
import TooltipStatoHR from "../components/TooltipStatoHR";
import TurniAssegnatiHR from "../components/TurniAssegnatiHR";
import {valuta,oggi,iso,formatData} from "@/utils/hrValutazione";
import type {Operatore,Contratto,Turno,Riga,Livello,ArchivioChiamate} from "@/utils/hrValutazione";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, ClipboardList, UserRoundCheck } from "lucide-react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import {contrattoInVigore,messaggioBloccoContratto} from "@/utils/hrContrattoRestrittivo";
import { hrAssegna,hrPratiche,hrAggiornaPeriodo } from "@/utils/hrWorkflow";
import type { HRPratica } from "@/utils/hrWorkflow";
import { listaChiamateHR } from "@/utils/chiamateHR";



async function api<T>(path:string):Promise<T>{
 const response=await fetch(ezystaffBEUrl+path,{credentials:"include",headers:{Authorization:`Bearer ${localStorage.getItem("token")||""}`,Accept:"application/json"}});
 if(!response.ok)throw new Error(`Errore API ${response.status}: ${path}`);
 return response.json() as Promise<T>;
}
export default function ModuloHR(){
 const navigate=useNavigate();
 const [searchParams,setSearchParams]=useSearchParams();
 const [righe,setRighe]=useState<Riga[]>([]);
 const [assegnate,setAssegnate]=useState<HRPratica[]>([]);
 const [assegnando,setAssegnando]=useState<number|null>(null);
 const [loading,setLoading]=useState(false);
 const [errore,setErrore]=useState("");
 const [ricerca,setRicerca]=useState("");
 const [ricercaEvento,setRicercaEvento]=useState("");
 const [filtroPriorita,setFiltroPriorita]=useState<Livello|"Tutte">("Tutte");
 const [espanso,setEspanso]=useState<number|null>(null);
 const [progress,setProgress]=useState("");
 const [inlineHR,setInlineHR]=useState<Record<number,{datore:string;tipo:string}>>({});
 const [dateContratto,setDateContratto]=useState<Record<number,{inizio:string;fine:string}>>({});
 const tipoSelezionato=(x:Riga)=>inlineHR[x.operatore.id]?.tipo||"";
 const praticaCorrente=(x:Riga)=>assegnate.filter(p=>p.idOperatore===x.operatore.id).sort((a,b)=>b.id-a.id)[0];
 const cambiaTipologia=(x:Riga)=>!!inlineHR[x.operatore.id]?.tipo&&inlineHR[x.operatore.id].tipo.replace(/^CONTRATTO_/,"")!==praticaCorrente(x)?.tipologia.replace(/^CONTRATTO_/,"");
 const periodoVisualizzato=(x:Riga)=>dateContratto[x.operatore.id]??(cambiaTipologia(x)?{inizio:"",fine:""}:praticaCorrente(x)?{inizio:iso(praticaCorrente(x)?.dataInizio),fine:iso(praticaCorrente(x)?.dataFine)}:{inizio:"",fine:""});
 const aggiorna=(id:number,k:"datore"|"tipo",value:string)=>{if(k==="tipo")setDateContratto(prev=>{const next={...prev};delete next[id];return next});setInlineHR(prev=>{
   const precedente=assegnate.filter(p=>p.idOperatore===id).sort((a,b)=>b.id-a.id)[0];
   return {...prev,[id]:{datore:prev[id]?.datore??precedente?.datore??"DETELDER",tipo:prev[id]?.tipo??precedente?.tipologia??"",[k]:value}};
  });};
 const carica=async()=>{
  setLoading(true);setErrore("");setProgress("Caricamento operatori e turni…");
  try{
   const inizio=oggi(),fine=new Date();fine.setDate(fine.getDate()+90);
   const dataFine=[fine.getFullYear(),String(fine.getMonth()+1).padStart(2,"0"),String(fine.getDate()).padStart(2,"0")].join("-");
   const [operatori,turni,pratiche]=await Promise.all([api<Operatore[]>("operatori"),api<Turno[]>(`turni?dataInizio=${inizio}&dataFine=${dataFine}`),hrPratiche()]);
   if(!Array.isArray(operatori)||!Array.isArray(turni))throw new Error("Risposta API non valida");
   const persone=operatori.filter(o=>!o.ruolo||o.ruolo==="OPERATORE"),dati:Riga[]=[];
   for(let i=0;i<persone.length;i+=4){
    const batch=persone.slice(i,i+4);
    const contratti=await Promise.all(batch.map(o=>api<Contratto[]>(`operatori/listaContrattiOperatore/${o.id}`)));
    const archivi=await Promise.all(batch.map(async(o,j)=>{
      const perOperatore:ArchivioChiamate={};
      const padri=Array.isArray(contratti[j])?contratti[j].filter(c=>c.tipologia==="CHIAMATA"):[];
      const risultati=await Promise.allSettled(padri.map(c=>listaChiamateHR(o.id,c.idContratto)));
      risultati.forEach((ris,k)=>{perOperatore[padri[k].idContratto]=ris.status==="fulfilled"?ris.value:null;});
      return perOperatore;
    }));
    batch.forEach((o,j)=>dati.push(valuta(o,Array.isArray(contratti[j])?contratti[j]:[],turni.filter(t=>Number(t.idOperatore)===Number(o.id)),archivi[j])));
    setProgress(`Operatori analizzati ${Math.min(i+4,persone.length)}/${persone.length}`);
   }
   setRighe(dati);
   setAssegnate(pratiche);
  }catch(e){setErrore(e instanceof Error?e.message:"Errore caricamento HR");}
  finally{setLoading(false);setProgress("");}
 };
 useEffect(()=>{void carica();},[]);
 const irregolari=useMemo(()=>righe.filter(r=>r.turni.length>0&&r.stato!=="Completo"),[righe]);
 const visibili=useMemo(()=>righe.filter(r=>r.turni.length>0&&r.stato!=="Completo"&&[r.operatore.nome,r.operatore.cognome,r.operatore.codiceFiscale||r.operatore.codice_fiscale].join(" ").toLowerCase().includes(ricerca.toLowerCase())&&(filtroPriorita==="Tutte"||r.livello===filtroPriorita)&&(!ricercaEvento||r.turni.some(t=>(t.nomeEvento||"").toLowerCase().includes(ricercaEvento.toLowerCase())))).sort((a,b)=>({Alta:0,Media:1,Bassa:2,Nessuna:3}[a.livello]-{Alta:0,Media:1,Bassa:2,Nessuna:3}[b.livello])||a.priorita-b.priorita||a.operatore.cognome.localeCompare(b.operatore.cognome)),[righe,ricerca,ricercaEvento,filtroPriorita]);
 const nomiOperatori=useMemo(()=>righe.map(r=>r.operatore.cognome+" "+r.operatore.nome),[righe]);
 const nomiEventi=useMemo(()=>[...new Set(righe.flatMap(r=>r.turni.map(t=>t.nomeEvento||"").filter(Boolean)))].sort(),[righe]);
 const inoltra=async(x:Riga)=>{
  const tipoOrigine=inlineHR[x.operatore.id]?.tipo || "";
  const tipo=tipoOrigine==="CONTRATTO_TEMPO_DETERMINATO"?"TEMPO_DETERMINATO":tipoOrigine==="CONTRATTO_TEMPO_INDETERMINATO"?"TEMPO_INDETERMINATO":tipoOrigine;
  const datore=inlineHR[x.operatore.id]?.datore || praticaCorrente(x)?.datore || "DETELDER";
  const blocco=messaggioBloccoContratto(x.contratti);
  if(blocco){setErrore(x.operatore.cognome+": "+blocco);return;}
  if(!tipo){setErrore("Seleziona l'inquadramento per "+x.operatore.cognome);return;}
  const selected=dateContratto[x.operatore.id];
  const start=selected?.inizio||"";
  const finish=tipo==="TEMPO_INDETERMINATO"?null:selected?.fine||null;
  if(!start||(tipo!=="TEMPO_INDETERMINATO"&&!finish)){setErrore("Inserisci data inizio e fine prima di assegnare il contratto");return;}
  if(finish&&finish<start){setErrore("La data fine non può precedere quella di inizio");return;}
  if(x.contratti.some(c=>c.tipologia.replace(/^CONTRATTO_/,"")===tipo&&iso(c.dataInizio)===start)){setErrore("Esiste già un contratto di questo tipo con la stessa data di inizio");return;}
  if(assegnate.some(p=>p.idOperatore===x.operatore.id&&p.tipologia===tipo&&iso(p.dataInizio)===start)){setErrore("Esiste già una pratica per questa data e tipologia");return;}
  if(assegnate.some(p=>p.idOperatore===x.operatore.id&&p.tipologia.replace(/^CONTRATTO_/,"")===tipo&&p.stato!=="COMPLETATO"&&p.dataInizio&&iso(p.dataInizio)<=(finish||start)&&(!p.dataFine||iso(p.dataFine)>=start))){setErrore("Esiste già una pratica aperta dello stesso tipo nel periodo selezionato.");return;}
  setAssegnando(x.operatore.id);setErrore("");
  try{
    await hrAssegna({idOperatore:x.operatore.id,tipologia:tipo,datore,
       dataInizio:start,
       dataFine:finish});
    setAssegnate(await hrPratiche());
    setDateContratto(v=>{const next={...v};delete next[x.operatore.id];return next});
  }catch(e){setErrore(e instanceof Error?e.message:"Assegnazione fallita");}
  finally{setAssegnando(null);}
 };
 const salvaPeriodo=async(x:Riga)=>{
  if(contrattoInVigore(x.contratti)){setErrore("Non è possibile modificare o predisporre un nuovo periodo mentre il contratto attuale è in vigore.");return;}
  const p=praticaCorrente(x);
  if(!p||p.stato==="COMPLETATO"){setErrore("Per un contratto già elaborato occorre una nuova assegnazione, non modificare il documento precedente.");return;}
  const date=periodoVisualizzato(x);
  if(!date.inizio||(p.tipologia!=="TEMPO_INDETERMINATO"&&!date.fine)||!!date.fine&&date.fine<date.inizio){setErrore("Controlla le date di inizio e fine del contratto.");return;}
  setAssegnando(x.operatore.id);setErrore("");
  try{
   await hrAggiornaPeriodo(p.id,date.inizio,p.tipologia==="TEMPO_INDETERMINATO"?null:date.fine);
   setAssegnate(await hrPratiche());
   setDateContratto(old=>{const n={...old};delete n[x.operatore.id];return n});
  }catch(e){setErrore(e instanceof Error?e.message:"Impossibile salvare il nuovo periodo.");}
  finally{setAssegnando(null)}
 };
 const assegnaNuovoPeriodo=async(x:Riga)=>{
  const blocco=messaggioBloccoContratto(x.contratti);
  if(blocco){setErrore(x.operatore.cognome+": "+blocco);return;}
  const corrente=praticaCorrente(x);
  if(!corrente||corrente.stato!=="COMPLETATO")return;
  const date=periodoVisualizzato(x);
  const tipo=(inlineHR[x.operatore.id]?.tipo||corrente.tipologia).replace(/^CONTRATTO_/,"");
  const datore=inlineHR[x.operatore.id]?.datore||corrente.datore;
  if(!date.inizio||(tipo!=="TEMPO_INDETERMINATO"&&!date.fine)||(date.fine&&date.fine<date.inizio)){setErrore("Inserisci un nuovo periodo valido prima dell'assegnazione.");return;}
  if(x.contratti.some(c=>c.tipologia.replace(/^CONTRATTO_/,"")===tipo&&iso(c.dataInizio)===date.inizio)){setErrore("Esiste già un contratto dello stesso tipo con questa data di inizio.");return;}
  if(assegnate.some(p=>p.idOperatore===x.operatore.id&&p.tipologia===tipo&&iso(p.dataInizio)===date.inizio)){setErrore("Esiste già una pratica per queste date.");return;}
  setAssegnando(x.operatore.id);setErrore("");
  try{
   await hrAssegna({idOperatore:x.operatore.id,tipologia:tipo,datore,dataInizio:date.inizio,dataFine:tipo==="TEMPO_INDETERMINATO"?null:date.fine});
   await carica();
   setDateContratto(old=>{const n={...old};delete n[x.operatore.id];return n});
  }catch(e){setErrore(e instanceof Error?e.message:"Impossibile assegnare il nuovo contratto.");}
  finally{setAssegnando(null)}
 };
 useEffect(()=>{
  const target=Number(searchParams.get("operatore"));
  if(!Number.isSafeInteger(target)||target<=0||loading||!righe.length)return;
  const found=righe.find(x=>x.operatore.id===target);
  if(found)setRicerca(found.operatore.cognome);
  setSearchParams({}, {replace:true});
 },[searchParams,righe,loading,setSearchParams]);
 const apriSchedaHR=(x:Riga)=>navigate(`/admin/dettaglio-operatore/${x.operatore.id}?tab=contratti${praticaCorrente(x)?"&pratica="+praticaCorrente(x)!.id:""}`);
 return <main className="m-6 space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-extrabold text-[#007a55]">ADMIN · Assegnazione contratti</h1><p className="text-sm text-gray-500">Scegli tipologia e datore, poi assegna la pratica alla coda HR.</p></div><button className="rounded-md bg-[#007a55] px-4 py-2 text-white disabled:opacity-50" onClick={()=>void carica()} disabled={loading}>{loading?"Caricamento…":"Aggiorna dati"}</button></div>
  {errore&&<div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{errore}</div>}
  {progress&&<p className="text-sm text-gray-500">{progress}</p>}
  <div className="grid gap-4 sm:grid-cols-2">
   <div className="rounded-xl border border-[#cfe2dc] bg-white p-5"><div className="text-sm font-semibold">Operatori da regolarizzare</div><div className="mt-2 text-3xl font-bold text-[#007a55]">{irregolari.length}</div></div>
   <div className="rounded-xl border border-red-200 bg-red-50/50 p-5"><div className="text-sm font-semibold text-red-800">Urgenti da regolarizzare</div><div className="mt-2 text-3xl font-bold text-red-700">{irregolari.filter(x=>x.livello==="Alta").length}</div></div>
  </div>
    <div className="rounded-xl border bg-white p-4">
   <div className="mb-3 space-y-3"><div className="flex flex-wrap gap-2"><input list="hr-nomi-operatori" aria-label="Cerca operatore" placeholder="Cerca operatore o codice fiscale" value={ricerca} onChange={e=>setRicerca(e.target.value)} className="min-w-[230px] flex-1 rounded-md border px-3 py-2 text-sm"/><datalist id="hr-nomi-operatori">{nomiOperatori.map(n=><option key={n} value={n}/>)}</datalist><input list="hr-nomi-eventi" aria-label="Cerca evento" placeholder="Cerca evento" value={ricercaEvento} onChange={e=>setRicercaEvento(e.target.value)} className="min-w-[230px] flex-1 rounded-md border px-3 py-2 text-sm"/><datalist id="hr-nomi-eventi">{nomiEventi.map(n=><option key={n} value={n}/>)}</datalist></div><div className="flex flex-wrap items-center gap-2">{(["Tutte","Alta","Media","Bassa","Nessuna"] as const).map(v=><button key={v} type="button" aria-pressed={filtroPriorita===v} onClick={()=>setFiltroPriorita(v)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filtroPriorita===v?"border-[#007a55] bg-[#007a55] text-white":"bg-white text-gray-700"}`}>{v} ({v==="Tutte"?irregolari.length:irregolari.filter(r=>r.livello===v).length})</button>)}<button type="button" onClick={()=>{setRicerca("");setRicercaEvento("");setFiltroPriorita("Tutte");}} className="ml-auto text-xs text-[#007a55] underline">Azzera filtri</button></div></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead><tr className="bg-[#ecf3f1] text-left"><th className="p-3">Operatore</th><th className="p-3">Inquadramento</th><th className="p-3">Datore di lavoro</th><th className="p-3">Periodo contratto</th><th className="p-3">Stato</th><th className="p-3">Priorità</th><th className="p-3">Azioni</th></tr></thead><tbody>
    {visibili.map(x=><Fragment key={x.operatore.id}><tr
 className="cursor-pointer border-b transition-colors hover:bg-[#f1f8f5] focus-within:bg-[#f1f8f5]"
 tabIndex={0}
 aria-label={"Apri pratica HR di "+x.operatore.cognome+" "+x.operatore.nome}
 onClick={e=>{if((e.target as HTMLElement).closest("button,input,select,a,textarea,[role=button]"))return;apriSchedaHR(x)}}
 onKeyDown={e=>{if((e.target as HTMLElement)!==e.currentTarget)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();apriSchedaHR(x)}}}
>
      <td className="p-3 font-semibold"><button type="button" aria-expanded={espanso===x.operatore.id} aria-label="Dettagli turni" className="mr-2 text-[#007a55]" onClick={()=>setEspanso(v=>v===x.operatore.id?null:x.operatore.id)}>{espanso===x.operatore.id?"▾":"▸"}</button>{x.operatore.cognome} {x.operatore.nome}</td>
      <td className="p-3"><select className="w-full rounded border bg-white p-2" aria-label="Inquadramento" value={inlineHR[x.operatore.id]?.tipo??praticaCorrente(x)?.tipologia??""} disabled={!!contrattoInVigore(x.contratti)} onChange={e=>aggiorna(x.operatore.id,"tipo",e.target.value)}><option value="">Da assegnare</option><option value="CHIAMATA">Chiamata</option><option value="TEMPO_DETERMINATO">Determinato</option><option value="TEMPO_INDETERMINATO">Indeterminato</option><option value="OCCASIONALE">Occasionale</option><option value="CONSGNA_BENI_FORMAZIONE">Consegna beni e formazione</option><option value="FATTURA">Fattura (senza generatore)</option></select></td>
      <td className="p-3"><select className="w-full rounded border bg-white p-2" aria-label="Datore di lavoro" value={inlineHR[x.operatore.id]?.datore??praticaCorrente(x)?.datore??"DETELDER"} disabled={!!contrattoInVigore(x.contratti)} onChange={e=>aggiorna(x.operatore.id,"datore",e.target.value)}><option value="DETELDER">DETELDER</option><option value="SOCIETA_APPALTO">Società in appalto</option><option value="AUTONOMO_PIVA">Autonomo - P.IVA</option></select></td>
      <td className="p-3"><div className="flex min-w-[210px] flex-col gap-1">
{praticaCorrente(x)?.tipologia==="CHIAMATA"&&praticaCorrente(x)?.stato==="COMPLETATO"?<>
 <span className="text-[11px] text-gray-500">Contratto concluso: {formatData(praticaCorrente(x)?.dataInizio)} – {formatData(praticaCorrente(x)?.dataFine)}</span>
 <span className="text-[11px] font-semibold text-[#315e51]">Nuovo contratto · periodo</span>
</>:praticaCorrente(x)?.stato==="COMPLETATO"?<>
 <span className="text-[11px] text-gray-500">Precedente: {formatData(praticaCorrente(x)?.dataInizio)} – {formatData(praticaCorrente(x)?.dataFine)}</span>
 <span className="text-[11px] font-semibold text-[#315e51]">Nuovo contratto · periodo</span>
</>:<span className="text-[11px] font-semibold text-[#315e51]">Periodo contratto</span>}
<input type="date" aria-label={"Data inizio contratto di "+x.operatore.cognome} className="rounded border bg-white px-1 py-1 text-xs" disabled={praticaCorrente(x)?.stato==="COMPLETATO"&&!!contrattoInVigore(x.contratti)} value={dateContratto[x.operatore.id]?.inizio??(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?"":periodoVisualizzato(x).inizio)} onChange={e=>setDateContratto(p=>({...p,[x.operatore.id]:{inizio:e.target.value,fine:p[x.operatore.id]?.fine??(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?"":periodoVisualizzato(x).fine)}}))}/>
{(tipoSelezionato(x)||praticaCorrente(x)?.tipologia)!=="TEMPO_INDETERMINATO"&&<input type="date" aria-label={"Data fine contratto di "+x.operatore.cognome} className="rounded border bg-white px-1 py-1 text-xs" disabled={praticaCorrente(x)?.stato==="COMPLETATO"&&!!contrattoInVigore(x.contratti)} min={dateContratto[x.operatore.id]?.inizio||(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?undefined:periodoVisualizzato(x).inizio)} value={dateContratto[x.operatore.id]?.fine??(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?"":periodoVisualizzato(x).fine)} onChange={e=>setDateContratto(p=>({...p,[x.operatore.id]:{inizio:p[x.operatore.id]?.inizio??(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?"":periodoVisualizzato(x).inizio),fine:e.target.value}}))}/>}
{!cambiaTipologia(x)&&praticaCorrente(x)?.stato!=="COMPLETATO"&&praticaCorrente(x)&&dateContratto[x.operatore.id]&&<button type="button" disabled={assegnando!==null||!!contrattoInVigore(x.contratti)} onClick={()=>void salvaPeriodo(x)} className="rounded border border-[#007a55] px-2 py-1 text-xs font-semibold text-[#007a55]">Salva date</button>}
{!cambiaTipologia(x)&&praticaCorrente(x)?.stato==="COMPLETATO"&&dateContratto[x.operatore.id]?.inizio&&<button type="button" disabled={assegnando!==null||!!contrattoInVigore(x.contratti)} onClick={()=>void assegnaNuovoPeriodo(x)} className="rounded bg-[#007a55] px-2 py-1 text-xs font-semibold text-white">Assegna nuovo periodo a HR</button>}
<span className="text-[10px] text-gray-500">Prossimo turno: {formatData(x.prossimoTurno)}</span>

{x.contratti.filter(c=>c.tipologia==="CHIAMATA").sort((a,b)=>iso(b.dataInizio).localeCompare(iso(a.dataInizio))).slice(0,1).map(c=><span key={c.idContratto} className="text-xs font-medium text-[#007a55]">Contratto padre #{c.idContratto}: {formatData(c.dataInizio)} – {formatData(c.dataFine)}{iso(c.dataInizio)>oggi()?" · decorrenza futura":""}</span>)}
{contrattoInVigore(x.contratti)&&x.turni.some(t=>contrattoInVigore(x.contratti)?.dataFine&&iso(t.dataTurno)>iso(contrattoInVigore(x.contratti)?.dataFine))&&<span className="text-xs font-semibold text-amber-800">Turno oltre scadenza: sola segnalazione fino alla scadenza del contratto attuale</span>}
</div></td>
      <td className="p-3">{x.stato==="Incompleto"?<TooltipStatoHR motivi={x.motivi}/>:<span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${x.stato==="Scaduto"?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`}>{x.stato==="Completo"?<CheckCircle2 className="h-4 w-4"/>:<AlertCircle className="h-4 w-4"/>}{x.stato}</span>}</td>
      <td className="p-3"><span className={x.livello==="Alta"?"font-semibold text-red-700":x.livello==="Media"?"font-semibold text-amber-700":x.livello==="Bassa"?"font-semibold text-emerald-700":"text-gray-500"}>{x.livello}</span></td>
      <td className="p-3"><div className="flex items-center gap-2">
{praticaCorrente(x)&&(praticaCorrente(x)?.stato!=="COMPLETATO"||!!contrattoInVigore(x.contratti))?<>
 <button type="button" onClick={()=>apriSchedaHR(x)} title="Pratica già assegnata all'HR: apri i dettagli" className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#007a55] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#006647] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007a55]"><ClipboardList className="h-4 w-4"/>Apri pratica HR</button>
</>:contrattoInVigore(x.contratti)?<span className="text-xs font-semibold text-amber-800">Contratto in vigore · sola segnalazione</span>:<>
 <button type="button" disabled={assegnando!==null} onClick={()=>void inoltra(x)} className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#007a55] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#006647] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007a55] disabled:opacity-50"><UserRoundCheck className="h-4 w-4"/>{assegnando===x.operatore.id?"Assegnazione…":praticaCorrente(x)?"Assegna nuovo contratto":"Assegna ad HR"}</button>
</>}

</div></td>
    </tr>{espanso===x.operatore.id&&<tr className="bg-[#f5faf8]"><td colSpan={7} className="p-4"><TurniAssegnatiHR turni={x.turni} formatData={formatData}/></td></tr>}</Fragment>)}
    {!visibili.length&&<tr><td colSpan={7} className="p-6 text-center text-gray-500">{loading?"Caricamento…":"Nessun operatore corrisponde ai filtri"}</td></tr>}
   </tbody></table></div>
  </div>
  <p className="text-xs text-amber-700">Le scelte inline vengono salvate nella pratica soltanto dopo «Da elaborare → HR». Nessun contratto viene creato automaticamente.</p>
 </main>;
}
