import type {ChiamataHR} from "@/utils/chiamateHR";
import type {IntermittentePrestazione} from "@/utils/intermittentiXml";
export type IntervalloChiamata={inizio:string;fine:string};
const iso=(s:string)=>{
  if(/^\d{4}-\d{2}-\d{2}$/.test(s))return s;
  const m=s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m?m[3]+"-"+m[2]+"-"+m[1]:"";
};
const nextDay=(d:string)=>{
  const dt=new Date(d+"T12:00:00Z");dt.setUTCDate(dt.getUTCDate()+1);
  return dt.toISOString().slice(0,10);
};
// Raggruppa SOLO le giornate consecutive: un giorno senza turno interrompe l'intervallo.
export const raggruppaGiornate=(date:string[]):IntervalloChiamata[]=>{
  const ordered=[...new Set(date.filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x)))].sort();
  const result:IntervalloChiamata[]=[];
  for(const date of ordered){
    const last=result[result.length-1];
    if(last&&nextDay(last.fine)===date)last.fine=date;
    else result.push({inizio:date,fine:date});
  }
  return result;
};
export const estraiPrestazioniXml=(xml:string):IntermittentePrestazione[]=>{
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.getElementsByTagName("parsererror").length||doc.documentElement.tagName!=="moduloIntermittenti")
    throw new Error("XML UNI_Intermittenti non valido");
  const val=(key:string)=>doc.getElementsByTagName(key)[0]?.textContent?.trim()||"";
  const list:IntermittentePrestazione[]=[];
  for(let i=1;i<=10;i++){
    const start=iso(val("DTdatainizio"+i));
    if(!start)continue;
    list.push({
      cfLavoratore:val("CFlavoratore"+i),
      codiceComunicazione:val("CCcodcomunicazione"+i),
      dataInizio:start,
      dataFine:iso(val("DTdatafine"+i))||undefined
    });
  }
  return list;
};
// Retrocompatibile con l'archivio esistente Aiven a periodo singolo.
export const periodiChiamata=(ch:ChiamataHR):IntervalloChiamata[]=>{
  try{
    if(ch.xmlArchiviato){
      const lines=estraiPrestazioniXml(ch.xmlArchiviato);
      if(lines.length)return lines.map(x=>({inizio:x.dataInizio,fine:x.dataFine||x.dataInizio}));
    }
  }catch{}
  return [{inizio:String(ch.dataInizio).slice(0,10),fine:String(ch.dataFine).slice(0,10)}];
};
export const coprePeriodoChiamata=(ch:ChiamataHR,inizio:string,fine:string)=>
  periodiChiamata(ch).some(p=>p.inizio<=inizio&&p.fine>=fine);
export const intersecaPeriodoChiamata=(ch:ChiamataHR,inizio:string,fine:string)=>
  periodiChiamata(ch).some(p=>p.inizio<=fine&&p.fine>=inizio);
export const testoPeriodiChiamata=(ch:ChiamataHR)=>{
  const fmt=(d:string)=>d.slice(8,10)+"/"+d.slice(5,7)+"/"+d.slice(0,4);
  return periodiChiamata(ch).map(p=>p.inizio===p.fine?fmt(p.inizio):fmt(p.inizio)+" – "+fmt(p.fine)).join(" · ");
};
