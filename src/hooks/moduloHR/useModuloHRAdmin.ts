import {useState,useEffect,useMemo} from "react";
import {useNavigate,useSearchParams} from "react-router-dom";
import {valuta,oggi,iso} from "@/utils/hrValutazione";
import type {Operatore,Contratto,Turno,Riga,Livello,ArchivioChiamate} from "@/utils/hrValutazione";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {contrattoInVigore,messaggioBloccoContratto} from "@/utils/hrContrattoRestrittivo";
import {hrAssegna,hrPratiche,hrAggiornaPeriodo} from "@/utils/hrWorkflow";
import type {HRPratica} from "@/utils/hrWorkflow";
import {listaChiamateHR} from "@/utils/chiamateHR";

async function api<T>(path:string):Promise<T>{
 const response=await fetch(ezystaffBEUrl+path,{credentials:"include",headers:{Authorization:`Bearer ${localStorage.getItem("token")||""}`,Accept:"application/json"}});
 if(!response.ok)throw new Error(`Errore API ${response.status}: ${path}`);
 return response.json() as Promise<T>;
}
export function useModuloHRAdmin(){
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
 return {aggiorna,apriSchedaHR,assegnaNuovoPeriodo,assegnando,cambiaTipologia,carica,dateContratto,errore,espanso,filtroPriorita,inlineHR,inoltra,irregolari,loading,nomiEventi,nomiOperatori,periodoVisualizzato,praticaCorrente,progress,ricerca,ricercaEvento,salvaPeriodo,setDateContratto,setEspanso,setFiltroPriorita,setRicerca,setRicercaEvento,tipoSelezionato,visibili};
}
