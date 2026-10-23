import {useState} from "react";
import {Archive,ChevronDown,Eye,FileText} from "lucide-react";
import AzioniHRIntermittenti from "./AzioniHRIntermittenti";
import type {HRPratica} from "@/utils/hrWorkflow";

export type ContrattoArchivio={
 idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null;
 pathContrattoFirmato?:string|null;pathContrattoUnilav?:string|null;
};
type Props={contratti:ContrattoArchivio[];idOperatore:number;codiceFiscale:string;onDownload:(id:number,kind:string)=>void};
const iso=(v:string|null)=>v?String(v).slice(0,10):"";
const data=(v:string|null)=>iso(v)?iso(v).split("-").reverse().join("/"):"—";
const nomi:Record<string,string>={CHIAMATA:"Contratto a chiamata",OCCASIONALE:"Contratto occasionale",TEMPO_DETERMINATO:"Tempo determinato",TEMPO_INDETERMINATO:"Tempo indeterminato",CONSGNA_BENI_FORMAZIONE:"Consegna beni e formazione"};
export default function ArchivioContrattiHR({contratti,idOperatore,codiceFiscale,onDownload}:Props){
 const [aperto,setAperto]=useState<number|null>(null);
 if(!contratti.length)return null;
 const ordinati=[...contratti].sort((a,b)=>iso(b.dataInizio).localeCompare(iso(a.dataInizio))||b.idContratto-a.idContratto);
 return <section className="overflow-hidden rounded-xl border border-[#cfe2dc] bg-white shadow-sm" aria-label="Archivio contratti">
  <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-[#f5faf8] px-5 py-4">
   <h3 className="flex items-center gap-2 text-base font-bold text-[#007a55]"><Archive className="h-4 w-4"/>Archivio contratti</h3>
   <span className="rounded-full bg-white px-3 py-1 text-xs text-gray-600">{ordinati.length} {ordinati.length===1?"contratto":"contratti"} nello storico</span>
  </div>
  <div className="divide-y divide-[#e5eeeb]">
   {ordinati.map(c=>{
    const selected=aperto===c.idContratto;
    const tipologia=c.tipologia.replace(/^CONTRATTO_/,"");
    const scaduto=!!iso(c.dataFine)&&iso(c.dataFine)<new Date().toISOString().slice(0,10);
    const praticaArchivio:HRPratica={id:0,idOperatore,nome:"",cognome:"",tipologia,datore:"DETELDER",dataInizio:c.dataInizio,dataFine:c.dataFine,stato:"COMPLETATO",note:null,assegnatoDa:0,presoInCaricoDa:null,creatoIl:""};
    return <div key={c.idContratto}>
     <button type="button" aria-expanded={selected} onClick={()=>setAperto(selected?null:c.idContratto)}
      className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-3 text-left hover:bg-[#f8fbfa]">
      <div className="flex min-w-[180px] flex-1 items-center gap-3"><FileText className="h-4 w-4 shrink-0 text-[#007a55]"/><div><p className="text-sm font-semibold text-[#173d30]">{nomi[tipologia]||tipologia.replace(/_/g," ")}</p><p className="text-xs text-gray-500">Dal {data(c.dataInizio)} al {c.dataFine?data(c.dataFine):"senza scadenza"}</p></div></div>
      <div className="flex items-center gap-2"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">{scaduto?"Scaduto":"Storico"}</span><ChevronDown className={`h-4 w-4 text-[#007a55] transition-transform ${selected?"rotate-180":""}`}/></div>
     </button>
     {selected&&<div className="space-y-3 border-t bg-[#fbfdfc] px-5 py-4">
      <p className="text-xs text-gray-500">Documenti e comunicazioni archiviati · sola consultazione. Nessuna attività HR da completare per questa scheda.</p>
      <div className="flex flex-wrap gap-2">
       <button type="button" onClick={()=>onDownload(c.idContratto,"downloadContratto")} className="inline-flex items-center gap-2 rounded-md border border-[#cfe2dc] bg-white px-3 py-2 text-xs font-medium text-[#007a55]"><Eye className="h-4 w-4"/>Contratto generato</button>
       {c.pathContrattoFirmato&&<button type="button" onClick={()=>onDownload(c.idContratto,"contrattoFirmato")} className="inline-flex items-center gap-2 rounded-md border border-[#cfe2dc] bg-white px-3 py-2 text-xs font-medium text-[#007a55]"><Eye className="h-4 w-4"/>Contratto firmato</button>}
       {c.pathContrattoUnilav&&<button type="button" onClick={()=>onDownload(c.idContratto,"contrattoUnilav")} className="inline-flex items-center gap-2 rounded-md border border-[#cfe2dc] bg-white px-3 py-2 text-xs font-medium text-[#007a55]"><Eye className="h-4 w-4"/>UNILAV</button>}
      </div>
      <p className="text-xs text-gray-500">Contratto firmato: {c.pathContrattoFirmato?"disponibile":"non caricato"} · UNILAV: {c.pathContrattoUnilav?"disponibile":"non caricato"}</p>
      {tipologia==="CHIAMATA"&&<AzioniHRIntermittenti mode="archive" readOnly idOperatore={idOperatore} pratica={praticaArchivio} contratti={[c]} codiceFiscale={codiceFiscale} onCreateContract={()=>{}}/>}
     </div>}
    </div>;
   })}
  </div>
 </section>;
}
