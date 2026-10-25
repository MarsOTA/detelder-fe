import {useEffect,useMemo,useState} from "react";
import {TriangleAlert, CircleHelp} from "lucide-react";
import {useNavigate} from "react-router-dom";
import {Tooltip,TooltipContent,TooltipProvider,TooltipTrigger} from "@/components/ui/tooltip";
import {ezystaffBEUrl} from "@/utils/baseUrl";
import {listaChiamateHR} from "@/utils/chiamateHR";
import type {ChiamataHR} from "@/utils/chiamateHR";

export type TurnoHRInput={idOperatore?:number|null;dataTurno?:Date|string|null;oraInizio?:string|null;oraFine?:string|null};
type Contratto={idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null;pathContrattoUnilav?:string|null};
type StatoHR={reason:string|null;unknown?:boolean};
const day=(value:Date|string|null|undefined)=>{
 if(!value)return "";
 if(value instanceof Date)return [value.getFullYear(),String(value.getMonth()+1).padStart(2,"0"),String(value.getDate()).padStart(2,"0")].join("-");
 return String(value).slice(0,10);
};
const finalDay=(t:TurnoHRInput)=>{
 const start=day(t.dataTurno);if(!start)return "";
 const begin=String(t.oraInizio||"").slice(0,5),end=String(t.oraFine||"").slice(0,5);
 if(begin&&end&&end<=begin){const d=new Date(start+"T12:00:00");d.setDate(d.getDate()+1);return day(d)}
 return start;
};
const covering=(c:Contratto,start:string,end:string)=>!!c.dataInizio&&day(c.dataInizio)<=start&&(!c.dataFine||day(c.dataFine)>=end);
async function contractsFor(id:number):Promise<Contratto[]>{
 const response=await fetch(ezystaffBEUrl+"operatori/listaContrattiOperatore/"+id,{credentials:"include",headers:{Authorization:"Bearer "+(localStorage.getItem("token")||""),Accept:"application/json"}});
 if(!response.ok)throw Error("Verifica contratti non disponibile");
 const data:unknown=await response.json();
 if(!Array.isArray(data))throw Error("Risposta contratti non valida");
 return data as Contratto[];
}
function evaluate(t:TurnoHRInput,contracts:Contratto[],calls:Record<number,ChiamataHR[]|null>):StatoHR{
 const start=day(t.dataTurno),end=finalDay(t);
 if(!start||!end)return {reason:"Data turno non disponibile",unknown:true};
 const covered=contracts.filter(c=>covering(c,start,end));
 if(!covered.length)return {reason:"Turno senza copertura contrattuale"};
 const c=covered.find(v=>v.tipologia==="CHIAMATA")||covered[0];
 if(["CHIAMATA","TEMPO_DETERMINATO","TEMPO_INDETERMINATO","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO"].includes(c.tipologia)&&!c.pathContrattoUnilav)return {reason:"Documento UNILAV del contratto mancante"};
 if(c.tipologia!=="CHIAMATA")return {reason:null};
 const existing=calls[c.idContratto];
 if(!existing)return {reason:"Verifica chiamata intermittente non disponibile",unknown:true};
 const sent=existing.some(ch=>ch.stato==="INVIATA"&&!ch.annullamentoTest&&day(ch.dataInizio)<=start&&day(ch.dataFine)>=end);
 if(sent)return {reason:null};
 const draft=existing.some(ch=>day(ch.dataInizio)<=end&&day(ch.dataFine)>=start);
 return {reason:draft?"Chiamata presente ma non ancora comunicata":"Chiamata intermittente mancante per questo turno"};
}
export function useTurniHRWarnings(turni:TurnoHRInput[]){
 const [results,setResults]=useState<Record<string,StatoHR>>({});
 const ids=useMemo(()=>[...new Set(turni.map(t=>t.idOperatore).filter((v):v is number=>typeof v==="number"&&v>0))].sort((a,b)=>a-b),[turni]);
 const key=ids.join(",");
 const [snapshot,setSnapshot]=useState<Record<number,{contratti:Contratto[];calls:Record<number,ChiamataHR[]|null>}|null>>({});
 useEffect(()=>{
  let alive=true;
  setSnapshot({});
  void (async()=>{
   const next:typeof snapshot={};
   // Carica una volta per operatore (non a ogni riga), con concorrenza limitata.
   for(let i=0;i<ids.length;i+=5){
    const batch=await Promise.all(ids.slice(i,i+5).map(async id=>{
     try{
      const contratti=await contractsFor(id);
      const pairs=await Promise.all(contratti.filter(c=>c.tipologia==="CHIAMATA").map(async c=>{
       try{return [c.idContratto,await listaChiamateHR(id,c.idContratto)] as const}
       catch{return [c.idContratto,null] as const}
      }));
      return [id,{contratti,calls:Object.fromEntries(pairs)}] as const;
     }catch{return [id,null] as const}
    }));
    batch.forEach(([id,value])=>{next[id]=value});
    if(!alive)return;
   }
   if(alive)setSnapshot(next);
  })();
  return ()=>{alive=false};
 },[key]);
 useEffect(()=>{
  const next:Record<string,StatoHR>={};
  for(const t of turni){
   if(!t.idOperatore)continue;
   const d=day(t.dataTurno),k=t.idOperatore+":"+d+":"+finalDay(t);
   const record=snapshot[t.idOperatore];
   if(record===undefined){next[k]={reason:"Verifica HR in corso",unknown:true};continue;}
   if(record===null){next[k]={reason:"Impossibile verificare lo stato HR",unknown:true};continue;}
   next[k]=evaluate(t,record.contratti,record.calls);
  }
  setResults(next);
 },[turni,snapshot]);
 return (t:TurnoHRInput):StatoHR|undefined=>t.idOperatore?results[t.idOperatore+":"+day(t.dataTurno)+":"+finalDay(t)]:undefined;
}
export function TurnoHRWarning({turno,stato}:{turno:TurnoHRInput;stato?:StatoHR}){
 const navigate=useNavigate();
 if(!turno.idOperatore||!stato?.reason)return <span className="text-gray-300" aria-label="Nessuna anomalia HR rilevata">—</span>;
 const date=day(turno.dataTurno),diff=date?Math.round((Date.parse(date+"T12:00:00")-Date.now())/86400000):99;
 const urgent=!stato.unknown&&diff<=2;
 const color=stato.unknown?"text-slate-500":urgent?"text-red-600":"text-amber-600";
 return <TooltipProvider delayDuration={150}><Tooltip>
  <TooltipTrigger asChild><button type="button" aria-label={"Apri HR operatore: "+stato.reason} className={"inline-flex items-center justify-center rounded-md p-1 hover:bg-gray-100 "+color} onClick={e=>{e.stopPropagation();navigate("/admin/dettaglio-operatore/"+turno.idOperatore+"?tab=contratti")}}>
   {stato.unknown?<CircleHelp size={18}/>:<TriangleAlert size={18} strokeWidth={2.2}/>}
  </button></TooltipTrigger>
  <TooltipContent className="max-w-[270px]"><p className="font-semibold">Regolarizzazione HR {stato.unknown?"da verificare":"necessaria"}</p><p>{stato.reason}</p><p className="mt-1 text-xs opacity-80">Apri la scheda HR dell'operatore</p></TooltipContent>
 </Tooltip></TooltipProvider>;
}
