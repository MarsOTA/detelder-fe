import {listaChiamateHR} from "@/utils/chiamateHR";
import {ezystaffBEUrl} from "@/utils/baseUrl";

export type HRAnagrafica={
 codiceFiscale?:string|null;codice_fiscale?:string|null;nome?:string|null;cognome?:string|null;
 dataNascita?:string|null;luogoNascita?:string|null;statoNascita?:string|null;
 indirizzoResidenza?:string|null;numeroCivicoResidenza?:string|null;comuneResidenza?:string|null;
 provinciaResidenza?:string|null;capResidenza?:string|null
};
export type HRContratto={idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null;pathContrattoUnilav?:string|null};
export type HRTurno={idOperatore?:number|null;dataTurno?:string|null;oraInizio?:string|null;oraFine?:string|null};
export const dataHR=(x?:string|null)=>x?String(x).slice(0,10):"";
const valido=(v?:string|null)=>!!String(v||"").trim();
export function datiContrattoMancanti(a:HRAnagrafica|null|undefined):string[]{
 if(!a)return ["Dati anagrafici non disponibili"];
 const missing:[string,unknown][]=[
  ["Codice fiscale",a.codiceFiscale||a.codice_fiscale],
  ["Nome",a.nome],["Cognome",a.cognome],
  ["Data di nascita",a.dataNascita],["Luogo di nascita",a.luogoNascita],
  ["Indirizzo di residenza",a.indirizzoResidenza],
  ["Numero civico di residenza",a.numeroCivicoResidenza],
  ["Comune di residenza",a.comuneResidenza],
  ["Provincia di residenza",a.provinciaResidenza],
  ["CAP di residenza",a.capResidenza]
 ];
 return missing.filter(([,v])=>!valido(v as string|null|undefined)).map(([label])=>label);
}
const copre=(c:HRContratto,inizio:string,fine:string)=>!!dataHR(c.dataInizio)&&dataHR(c.dataInizio)<=inizio&&(!c.dataFine||dataHR(c.dataFine)>=fine);
const fineTurno=(t:HRTurno)=>{const d=dataHR(t.dataTurno);if(!d)return d;const a=String(t.oraInizio||"").slice(0,5),b=String(t.oraFine||"").slice(0,5);if(a&&b&&b<=a){const v=new Date(d+"T12:00:00");v.setDate(v.getDate()+1);return [v.getFullYear(),String(v.getMonth()+1).padStart(2,"0"),String(v.getDate()).padStart(2,"0")].join("-")}return d};
const fmt=(s:string)=>s? s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4):"";
export async function verificaRegolaritaHR(id:number,turni:HRTurno[],contratti:HRContratto[],dati:HRAnagrafica|null):Promise<string[]>{
 const mancanti=datiContrattoMancanti(dati);
 const tutti=[...mancanti];
 const ord=turni.filter(t=>!!t.dataTurno).sort((a,b)=>dataHR(a.dataTurno).localeCompare(dataHR(b.dataTurno)));
 if(!ord.length)return tutti;
 const senza=ord.filter(t=>!contratti.some(c=>copre(c,dataHR(t.dataTurno),fineTurno(t))));
 if(senza.length)tutti.push("Contratto non valido per il turno del "+fmt(dataHR(senza[0].dataTurno)));
 const validi=contratti.filter(c=>c.tipologia==="CHIAMATA");
 const esiti=await Promise.allSettled(validi.map(c=>listaChiamateHR(id,c.idContratto)));
 const chiamate:Record<number,Awaited<ReturnType<typeof listaChiamateHR>>|null>={};
 validi.forEach((c,i)=>chiamate[c.idContratto]=esiti[i].status==="fulfilled"?esiti[i].value:null);
 for(const t of ord){
  const da=dataHR(t.dataTurno),al=fineTurno(t);
  const contratto=contratti.find(c=>c.tipologia==="CHIAMATA"&&copre(c,da,al));
  if(!contratto)continue;
  if(!contratto.pathContrattoUnilav&&!tutti.includes("Documento UNILAV mancante"))tutti.push("Documento UNILAV mancante");
  const lista=chiamate[contratto.idContratto];
  if(lista===null){if(!tutti.includes("Verifica chiamate non disponibile"))tutti.push("Verifica chiamate non disponibile");continue}
  if(!lista.some(c=>c.stato==="INVIATA"&&!c.annullamentoTest&&dataHR(c.dataInizio)<=da&&dataHR(c.dataFine)>=al)){
   const motivo="Chiamata non coperta per il turno del "+fmt(da);
   if(!tutti.includes(motivo))tutti.push(motivo);
  }
 }
 return [...new Set(tutti)];
}
export async function caricaAnagraficaHR(id:number):Promise<HRAnagrafica>{
 const r=await fetch(ezystaffBEUrl+"operatori/ottieniOperatore/"+id,{credentials:"include",headers:{Authorization:"Bearer "+(localStorage.getItem("token")||""),Accept:"application/json"}});
 if(!r.ok)throw new Error("Anagrafica non disponibile ("+r.status+")");
 return r.json() as Promise<HRAnagrafica>;
}
export async function caricaContrattiHR(id:number):Promise<HRContratto[]>{
 const r=await fetch(ezystaffBEUrl+"operatori/listaContrattiOperatore/"+id,{credentials:"include",headers:{Authorization:"Bearer "+(localStorage.getItem("token")||""),Accept:"application/json"}});
 if(!r.ok)throw new Error("Contratti non disponibili ("+r.status+")");
 return r.json() as Promise<HRContratto[]>;
}
