import { Fragment, useEffect, useMemo, useState } from "react";
import TooltipStatoHR from "../components/TooltipStatoHR";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import {contrattoInVigore,messaggioBloccoContratto} from "@/utils/hrContrattoRestrittivo";
import { hrAssegna,hrPratiche,hrAggiornaPeriodo } from "@/utils/hrWorkflow";
import type { HRPratica } from "@/utils/hrWorkflow";
import { listaChiamateHR } from "@/utils/chiamateHR";
import type { ChiamataHR } from "@/utils/chiamateHR";

type Operatore = { id:number;nome:string;cognome:string;ruolo?:string;codiceFiscale?:string;codice_fiscale?:string };
type Contratto = {idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null;pathContrattoUnilav?:string|null;pathContrattoFirmato?:string|null;cfDatore?:string;emailDatore?:string};
type Turno = {idTurno?:number;idOperatore?:number|null;dataTurno?:string;oraInizio?:string;oraFine?:string;nomeEvento?:string;via?:string};
type Stato = "Completo" | "Incompleto" | "Scaduto";
type Livello = "Alta" | "Media" | "Bassa" | "Nessuna";
type Riga = {operatore:Operatore;contratti:Contratto[];turni:Turno[];prossimoTurno:string|null;priorita:number;livello:Livello;stato:Stato;motivi:string[];chiamateDaComunicare:Turno[];chiamateGiaPresenti:Turno[];verificaChiamateNonDisponibile:boolean};
type ArchivioChiamate = Record<number,ChiamataHR[] | null>;
const oggi=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
const iso=(v?:string|null)=>v?String(v).slice(0,10):"";
const formatData=(v?:string|null)=>{const s=iso(v);return s.length===10?s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(2,4):"—";};
const giorniDaOggi=(data:string)=>Math.round((Date.parse(data+"T12:00:00")-Date.parse(oggi()+"T12:00:00"))/86400000);
const fineTurno=(t:Turno)=>{const data=iso(t.dataTurno);if(!data)return "";const da=(t.oraInizio||"").slice(0,5),a=(t.oraFine||"").slice(0,5);if(da&&a&&a<=da){const d=new Date(data+"T12:00:00");d.setDate(d.getDate()+1);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");}return data;};
const tipoLavoro=(t:string)=>["CHIAMATA","OCCASIONALE","TEMPO_DETERMINATO","TEMPO_INDETERMINATO","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO"].includes(t);
const copre=(c:Contratto,data:string)=>tipoLavoro(c.tipologia)&&iso(c.dataInizio)<=data&&!!c.dataInizio&&(!c.dataFine||iso(c.dataFine)>=data);
async function api<T>(path:string):Promise<T>{
 const response=await fetch(ezystaffBEUrl+path,{credentials:"include",headers:{Authorization:`Bearer ${localStorage.getItem("token")||""}`,Accept:"application/json"}});
 if(!response.ok)throw new Error(`Errore API ${response.status}: ${path}`);
 return response.json() as Promise<T>;
}
function valuta(o:Operatore,contratti:Contratto[],turni:Turno[],archivi:ArchivioChiamate):Riga {
 const futuri=turni.filter(t=>iso(t.dataTurno)>=oggi()&&!!t.dataTurno).sort((a,b)=>iso(a.dataTurno).localeCompare(iso(b.dataTurno)));
 const prossimoTurno=futuri.length?iso(futuri[0].dataTurno):null;
 const priorita=prossimoTurno?Math.max(0,Math.round((Date.parse(prossimoTurno+"T12:00:00")-Date.parse(oggi()+"T12:00:00"))/86400000)):999999;
 const riferimento=prossimoTurno||oggi();
 const contrattiUtilizzabili=contratti.filter(c=>!!c.dataInizio&&iso(c.dataInizio)<=oggi());
 const altri=contrattiUtilizzabili.find(c=>copre(c,riferimento));
 const scaduti=contratti.filter(c=>tipoLavoro(c.tipologia)&&!!c.dataFine&&iso(c.dataFine)<riferimento);
 const attivo=contrattoInVigore(contratti);
 const scoperti=futuri.filter(t=>(!!attivo?.dataFine&&iso(t.dataTurno)>iso(attivo.dataFine))||!contrattiUtilizzabili.some(c=>copre(c,iso(t.dataTurno))&&copre(c,fineTurno(t))));
 const primaScopertura=scoperti.length?iso(scoperti[0].dataTurno):null;
 const isScaduto=!!prossimoTurno&&!altri&&scaduti.length>0;
 const cf=o.codiceFiscale||o.codice_fiscale;
 const motivi:string[]=[];
 if(!cf?.trim())motivi.push("Codice fiscale");
 if(!altri&&prossimoTurno)motivi.push(isScaduto?"Contratto scaduto":"Contratto padre / inquadramento");
 if(primaScopertura)motivi.push(attivo?.dataFine&&primaScopertura>iso(attivo.dataFine)?"Turno del "+formatData(primaScopertura)+" oltre scadenza contratto in vigore: sola segnalazione":"Turno del "+formatData(primaScopertura)+" senza copertura contrattuale completa");

 if(altri&&["CHIAMATA","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO","TEMPO_DETERMINATO","TEMPO_INDETERMINATO"].includes(altri.tipologia)&&!altri.pathContrattoUnilav)motivi.push("Documento UNILAV");
 // La chiamata figlia deve coprire la data del turno ed essere dichiarata INVIATA:
 // BOZZA e PEC_PREPARATA non sono conferme dell'invio.
 const verificaChiamateNonDisponibile=contratti.some(c=>c.tipologia==="CHIAMATA"&&archivi[c.idContratto]===null);
 const chiamateMancanti=futuri.filter(t=>{
  const data=iso(t.dataTurno);
  const padreTurno=contrattiUtilizzabili.find(c=>c.tipologia==="CHIAMATA"&&copre(c,data));
  if(!padreTurno||iso(padreTurno.dataInizio)>oggi()||!!padreTurno.dataFine&&iso(padreTurno.dataFine)<oggi())return false;
  const lista=archivi[padreTurno.idContratto];
  if(!lista)return true; // errore API: non dichiarare regolare la posizione
  return !lista.some(ch=>ch.stato==="INVIATA"&&!ch.annullamentoTest&&iso(ch.dataInizio)<=data&&iso(ch.dataFine)>=fineTurno(t));
 });
 const chiamateGiaPresenti=chiamateMancanti.filter(t=>{
   const giorno=iso(t.dataTurno);
   return Object.values(archivi).some(lista=>Array.isArray(lista)&&lista.some(ch=>iso(ch.dataInizio)<=fineTurno(t)&&iso(ch.dataFine)>=giorno));
 });
 if(chiamateMancanti.length)motivi.push(verificaChiamateNonDisponibile?"Verifica chiamate non disponibile":chiamateGiaPresenti.length?"Chiamata già presente per il turno del "+formatData(chiamateGiaPresenti[0].dataTurno)+": completa quella esistente":"Chiamata non coperta per il turno del "+formatData(chiamateMancanti[0].dataTurno));

 // La copertura del contratto padre non conferma l'esistenza di una chiamata figlia valida.
 // In assenza di un'API che colleghi le chiamate ai turni, non certificare la regolarità.
 // In an assigned HR practice, contract status refers to its actual generated contract,
 // not a different future shift. HR task progress remains in the separate action column.
 // La pratica HR può essere elaborata senza che ogni turno sia regolarizzato.
 // Lo stato Admin valuta esclusivamente copertura effettiva e documenti, non
 // la corrispondenza puntuale delle date con una pratica già assegnata.
 const stato:Stato=isScaduto?"Scaduto":motivi.length>0?"Incompleto":"Completo";
 const urgenza=primaScopertura?giorniDaOggi(primaScopertura):null;
 const urgenzaChiamata=chiamateMancanti.length?giorniDaOggi(iso(chiamateMancanti[0].dataTurno)):null;
 const livello:Livello=urgenza!==null?(urgenza<=7?"Alta":"Media"):urgenzaChiamata!==null?(urgenzaChiamata<=7?"Alta":"Media"):motivi.length||stato!=="Completo"?"Bassa":"Nessuna";
 return {operatore:o,contratti,turni:futuri,prossimoTurno,priorita,livello,stato,motivi,chiamateDaComunicare:chiamateMancanti,chiamateGiaPresenti,verificaChiamateNonDisponibile};
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
 const periodoVisualizzato=(x:Riga)=>dateContratto[x.operatore.id]??(praticaCorrente(x)?{inizio:iso(praticaCorrente(x)?.dataInizio),fine:iso(praticaCorrente(x)?.dataFine)}:{inizio:"",fine:""});
 const aggiorna=(id:number,k:"datore"|"tipo",value:string)=>setInlineHR(prev=>({...prev,[id]:{...(prev[id]??{datore:"DETELDER",tipo:""}),[k]:value}}));
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
  const datore=inlineHR[x.operatore.id]?.datore || "DETELDER";
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
  if(assegnate.some(p=>p.idOperatore===x.operatore.id&&p.stato!=="COMPLETATO"&&p.dataInizio&&(!p.dataFine||iso(p.dataFine)>=start))){setErrore("È già presente una pratica aperta che copre il periodo richiesto.");return;}
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
  if(!date.inizio||(corrente.tipologia!=="TEMPO_INDETERMINATO"&&!date.fine)||(date.fine&&date.fine<date.inizio)){setErrore("Inserisci un nuovo periodo valido prima dell'assegnazione.");return;}
  const tipo=corrente.tipologia.replace(/^CONTRATTO_/,"");
  if(x.contratti.some(c=>c.tipologia.replace(/^CONTRATTO_/,"")===tipo&&iso(c.dataInizio)===date.inizio)){setErrore("Esiste già un contratto dello stesso tipo con questa data di inizio.");return;}
  if(assegnate.some(p=>p.idOperatore===x.operatore.id&&p.tipologia===tipo&&iso(p.dataInizio)===date.inizio)){setErrore("Esiste già una pratica per queste date.");return;}
  setAssegnando(x.operatore.id);setErrore("");
  try{
   await hrAssegna({idOperatore:x.operatore.id,tipologia:tipo,datore:corrente.datore,dataInizio:date.inizio,dataFine:tipo==="TEMPO_INDETERMINATO"?null:date.fine});
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
  {righe.some(x=>x.motivi.some(m=>m.startsWith("Chiamata non coperta")||m==="Verifica chiamate non disponibile"))&&<div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
   <div className="mb-2 flex items-center gap-2 font-semibold text-amber-900"><AlertCircle className="h-4 w-4"/>Chiamate intermittenti da verificare</div>
   <p className="mb-3 text-xs text-amber-800">Segnalazione automatica dai turni dei prossimi 90 giorni. L'HR vedrà una proposta per ogni giornata scoperta associata a un contratto a chiamata valido; la comunicazione non parte automaticamente.</p>
   <div className="flex flex-wrap gap-2">{righe.filter(x=>x.motivi.some(m=>m.startsWith("Chiamata non coperta")||m==="Verifica chiamate non disponibile")).map(x=><button type="button" key={x.operatore.id} onClick={()=>navigate(`/admin/dettaglio-operatore/${x.operatore.id}?tab=contratti`)} className="rounded-md border border-amber-200 bg-white px-3 py-2 text-left text-xs font-semibold text-amber-900">{x.operatore.cognome} {x.operatore.nome} · {x.motivi.find(m=>m.startsWith("Chiamata non coperta"))||"Verifica chiamate non disponibile"}</button>)}</div>
  </div>}
  <div className="rounded-xl border bg-white p-4">
   <div className="mb-3 space-y-3"><div className="flex flex-wrap gap-2"><input list="hr-nomi-operatori" aria-label="Cerca operatore" placeholder="Cerca operatore o codice fiscale" value={ricerca} onChange={e=>setRicerca(e.target.value)} className="min-w-[230px] flex-1 rounded-md border px-3 py-2 text-sm"/><datalist id="hr-nomi-operatori">{nomiOperatori.map(n=><option key={n} value={n}/>)}</datalist><input list="hr-nomi-eventi" aria-label="Cerca evento" placeholder="Cerca evento" value={ricercaEvento} onChange={e=>setRicercaEvento(e.target.value)} className="min-w-[230px] flex-1 rounded-md border px-3 py-2 text-sm"/><datalist id="hr-nomi-eventi">{nomiEventi.map(n=><option key={n} value={n}/>)}</datalist></div><div className="flex flex-wrap items-center gap-2">{(["Tutte","Alta","Media","Bassa","Nessuna"] as const).map(v=><button key={v} type="button" aria-pressed={filtroPriorita===v} onClick={()=>setFiltroPriorita(v)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filtroPriorita===v?"border-[#007a55] bg-[#007a55] text-white":"bg-white text-gray-700"}`}>{v} ({v==="Tutte"?irregolari.length:irregolari.filter(r=>r.livello===v).length})</button>)}<button type="button" onClick={()=>{setRicerca("");setRicercaEvento("");setFiltroPriorita("Tutte");}} className="ml-auto text-xs text-[#007a55] underline">Azzera filtri</button></div></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead><tr className="bg-[#ecf3f1] text-left"><th className="p-3">Operatore</th><th className="p-3">Inquadramento</th><th className="p-3">Datore di lavoro</th><th className="p-3">Periodo contratto</th><th className="p-3">Stato</th><th className="p-3">Priorità</th><th className="p-3">Azioni</th></tr></thead><tbody>
    {visibili.map(x=><Fragment key={x.operatore.id}><tr className="border-b">
      <td className="p-3 font-semibold"><button type="button" aria-expanded={espanso===x.operatore.id} aria-label="Dettagli turni" className="mr-2 text-[#007a55]" onClick={()=>setEspanso(v=>v===x.operatore.id?null:x.operatore.id)}>{espanso===x.operatore.id?"▾":"▸"}</button>{x.operatore.cognome} {x.operatore.nome}</td>
      <td className="p-3"><select className="w-full rounded border bg-white p-2" aria-label="Inquadramento" value={inlineHR[x.operatore.id]?.tipo??praticaCorrente(x)?.tipologia??""} disabled={!!praticaCorrente(x)} onChange={e=>aggiorna(x.operatore.id,"tipo",e.target.value)}><option value="">Da assegnare</option><option value="CHIAMATA">Chiamata</option><option value="TEMPO_DETERMINATO">Determinato</option><option value="TEMPO_INDETERMINATO">Indeterminato</option><option value="OCCASIONALE">Occasionale</option><option value="CONSGNA_BENI_FORMAZIONE">Consegna beni e formazione</option><option value="FATTURA">Fattura (senza generatore)</option></select></td>
      <td className="p-3"><select className="w-full rounded border bg-white p-2" aria-label="Datore di lavoro" value={inlineHR[x.operatore.id]?.datore??praticaCorrente(x)?.datore??"DETELDER"} disabled={!!praticaCorrente(x)} onChange={e=>aggiorna(x.operatore.id,"datore",e.target.value)}><option value="DETELDER">DETELDER</option><option value="SOCIETA_APPALTO">Società in appalto</option><option value="AUTONOMO_PIVA">Autonomo - P.IVA</option></select></td>
      <td className="p-3"><div className="flex min-w-[210px] flex-col gap-1">
{praticaCorrente(x)?.tipologia==="CHIAMATA"&&praticaCorrente(x)?.stato==="COMPLETATO"?<>
 <span className="text-[11px] text-gray-500">Contratto concluso: {formatData(praticaCorrente(x)?.dataInizio)} – {formatData(praticaCorrente(x)?.dataFine)}</span>
 <span className="text-[11px] font-semibold text-[#315e51]">Nuovo contratto · periodo</span>
</>:praticaCorrente(x)?.stato==="COMPLETATO"?<>
 <span className="text-[11px] text-gray-500">Precedente: {formatData(praticaCorrente(x)?.dataInizio)} – {formatData(praticaCorrente(x)?.dataFine)}</span>
 <span className="text-[11px] font-semibold text-[#315e51]">Nuovo contratto · periodo</span>
</>:<span className="text-[11px] font-semibold text-[#315e51]">Periodo contratto</span>}
<input type="date" aria-label={"Data inizio contratto di "+x.operatore.cognome} className="rounded border bg-white px-1 py-1 text-xs" disabled={praticaCorrente(x)?.stato==="COMPLETATO"&&!!contrattoInVigore(x.contratti)} value={dateContratto[x.operatore.id]?.inizio??(praticaCorrente(x)?.stato==="COMPLETATO"?"":periodoVisualizzato(x).inizio)} onChange={e=>setDateContratto(p=>({...p,[x.operatore.id]:{inizio:e.target.value,fine:p[x.operatore.id]?.fine??(praticaCorrente(x)?.stato==="COMPLETATO"?"":periodoVisualizzato(x).fine)}}))}/>
{(praticaCorrente(x)?.tipologia??tipoSelezionato(x))!=="TEMPO_INDETERMINATO"&&<input type="date" aria-label={"Data fine contratto di "+x.operatore.cognome} className="rounded border bg-white px-1 py-1 text-xs" disabled={praticaCorrente(x)?.stato==="COMPLETATO"&&!!contrattoInVigore(x.contratti)} min={dateContratto[x.operatore.id]?.inizio||(praticaCorrente(x)?.stato==="COMPLETATO"?undefined:periodoVisualizzato(x).inizio)} value={dateContratto[x.operatore.id]?.fine??(praticaCorrente(x)?.stato==="COMPLETATO"?"":periodoVisualizzato(x).fine)} onChange={e=>setDateContratto(p=>({...p,[x.operatore.id]:{inizio:p[x.operatore.id]?.inizio??(praticaCorrente(x)?.stato==="COMPLETATO"?"":periodoVisualizzato(x).inizio),fine:e.target.value}}))}/>}
{praticaCorrente(x)?.stato!=="COMPLETATO"&&praticaCorrente(x)&&dateContratto[x.operatore.id]&&<button type="button" disabled={assegnando!==null||!!contrattoInVigore(x.contratti)} onClick={()=>void salvaPeriodo(x)} className="rounded border border-[#007a55] px-2 py-1 text-xs font-semibold text-[#007a55]">Salva date</button>}
{praticaCorrente(x)?.stato==="COMPLETATO"&&dateContratto[x.operatore.id]?.inizio&&<button type="button" disabled={assegnando!==null||!!contrattoInVigore(x.contratti)} onClick={()=>void assegnaNuovoPeriodo(x)} className="rounded bg-[#007a55] px-2 py-1 text-xs font-semibold text-white">Assegna nuovo periodo a HR</button>}
<span className="text-[10px] text-gray-500">Prossimo turno: {formatData(x.prossimoTurno)}</span>
{praticaCorrente(x)&&<span className="text-xs text-blue-700">Pratica HR #{praticaCorrente(x)!.id} · {praticaCorrente(x)!.stato.replace(/_/g," ").toLowerCase()}</span>}
{x.contratti.filter(c=>c.tipologia==="CHIAMATA").sort((a,b)=>iso(b.dataInizio).localeCompare(iso(a.dataInizio))).slice(0,1).map(c=><span key={c.idContratto} className="text-xs font-medium text-[#007a55]">Contratto padre #{c.idContratto}: {formatData(c.dataInizio)} – {formatData(c.dataFine)}{iso(c.dataInizio)>oggi()?" · decorrenza futura":""}</span>)}
{contrattoInVigore(x.contratti)&&x.turni.some(t=>contrattoInVigore(x.contratti)?.dataFine&&iso(t.dataTurno)>iso(contrattoInVigore(x.contratti)?.dataFine))&&<span className="text-xs font-semibold text-amber-800">Turno oltre scadenza: sola segnalazione fino alla scadenza del contratto attuale</span>}
</div></td>
      <td className="p-3">{x.stato==="Incompleto"?<TooltipStatoHR motivi={x.motivi}/>:<span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${x.stato==="Scaduto"?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`}>{x.stato==="Completo"?<CheckCircle2 className="h-4 w-4"/>:<AlertCircle className="h-4 w-4"/>}{x.stato}</span>}</td>
      <td className="p-3"><span className={x.livello==="Alta"?"font-semibold text-red-700":x.livello==="Media"?"font-semibold text-amber-700":x.livello==="Bassa"?"font-semibold text-emerald-700":"text-gray-500"}>{x.livello}</span></td>
      <td className="p-3"><div className="flex items-center gap-2">
{praticaCorrente(x)?<>
 <button type="button" onClick={()=>apriSchedaHR(x)} className="whitespace-nowrap rounded-md border border-[#007a55] bg-white px-3 py-2 text-xs font-semibold text-[#007a55]">Visualizza pratica HR</button>
</>:contrattoInVigore(x.contratti)?<span className="text-xs font-semibold text-amber-800">Contratto in vigore · sola segnalazione</span>:<>
 <button type="button" disabled={assegnando!==null} onClick={()=>void inoltra(x)} className="whitespace-nowrap rounded-md bg-[#007a55] px-3 py-2 text-xs font-semibold text-white disabled:opacity-50">{assegnando===x.operatore.id?"Assegnazione…":"Assegna ad HR"}</button>
</>}
<Link title="Vai alla scheda operatore" aria-label={"Vai alla scheda di "+x.operatore.cognome} to={`/admin/dettaglio-operatore/${x.operatore.id}?tab=contratti${praticaCorrente(x)?"&pratica="+praticaCorrente(x)!.id:""}`} className="inline-flex rounded-md bg-[#007a55] p-2 text-white"><Eye className="h-4 w-4"/></Link>
</div></td>
    </tr>{espanso===x.operatore.id&&<tr className="bg-[#f5faf8]"><td colSpan={7} className="p-4"><div className="rounded-lg border bg-white p-4"><h3 className="mb-3 font-semibold text-[#007a55]">Turni assegnati</h3>{x.turni.length?<table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="p-2">Data</th><th className="p-2">Orario</th><th className="p-2">Evento</th><th className="p-2">Luogo</th></tr></thead><tbody>{x.turni.map((t,i)=><tr key={t.idTurno??i} className="border-t"><td className="p-2">{formatData(t.dataTurno)}</td><td className="p-2">{t.oraInizio||"—"} – {t.oraFine||"—"}</td><td className="p-2">{t.nomeEvento||"—"}</td><td className="p-2">{t.via||"Luogo non specificato"}</td></tr>)}</tbody></table>:<p className="text-gray-500">Nessun turno nei prossimi 90 giorni</p>}</div></td></tr>}</Fragment>)}
    {!visibili.length&&<tr><td colSpan={7} className="p-6 text-center text-gray-500">{loading?"Caricamento…":"Nessun operatore corrisponde ai filtri"}</td></tr>}
   </tbody></table></div>
  </div>
  <p className="text-xs text-amber-700">Le scelte inline vengono salvate nella pratica soltanto dopo «Da elaborare → HR». Nessun contratto viene creato automaticamente.</p>
 </main>;
}
