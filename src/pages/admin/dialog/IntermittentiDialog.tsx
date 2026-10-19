import { useEffect,useState } from "react";
import { Archive, Download, FileCode2, CheckCircle2 } from "lucide-react";
import { Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { listaChiamateHR } from "@/utils/chiamateHR";
import type { ChiamataHR } from "@/utils/chiamateHR";
export interface ContrattoChiamataPadre { idContratto:number;tipologia:"CHIAMATA";dataInizio:string;dataFine:string; }
export interface OperatoreIntermittente {nome:string;cognome:string;codiceFiscale:string;}
interface Props {open:boolean;setOpen:(x:boolean)=>void;contrattoPadre:ContrattoChiamataPadre|null;operatore:OperatoreIntermittente;idOperatore:number;onUpdated?:()=>void;}
const fmt=(s?:string)=>s?s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(0,4):"—";
function download(text:string,name:string){const url=URL.createObjectURL(new Blob([text],{type:"application/xml;charset=utf-8"}));const a=document.createElement("a");a.href=url;a.download=name;a.click();URL.revokeObjectURL(url);}
export const IntermittentiDialog=({open,setOpen,contrattoPadre,idOperatore,}:Props)=>{
 const [righe,setRighe]=useState<ChiamataHR[]>([]);
 const [errore,setErrore]=useState("");
 const [loading,setLoading]=useState(false);
 const reload=async()=>{if(!contrattoPadre)return;setLoading(true);setErrore("");try{setRighe(await listaChiamateHR(idOperatore,contrattoPadre.idContratto));}catch(e){setErrore(e instanceof Error?e.message:"Impossibile leggere archivio");}finally{setLoading(false);}};
 useEffect(()=>{if(open)void reload();},[open,contrattoPadre?.idContratto,idOperatore]);
 return <Dialog open={open} onOpenChange={setOpen}><DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[920px]"><DialogHeader><DialogTitle className="flex items-center gap-2 text-[#007a55]"><Archive className="h-5 w-5"/>Archivio chiamate intermittenti</DialogTitle><DialogDescription>Chiamate archiviate su Aiven. Archivio delle comunicazioni del contratto. Le simulazioni di test non sono invii reali.</DialogDescription></DialogHeader>
  {contrattoPadre&&<div className="rounded-lg bg-[#f5faf8] p-3 text-sm">Contratto #{contrattoPadre.idContratto} · {fmt(contrattoPadre.dataInizio)} → {fmt(contrattoPadre.dataFine)} · {righe.length} chiamate</div>}
  {errore&&<p role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">{errore}</p>}
  {loading?<p>Caricamento archivio…</p>:righe.length===0?<p className="text-sm text-gray-500">Nessuna chiamata salvata per questo contratto.</p>:<div className="space-y-3">{righe.map(ch=><section key={ch.id} className="rounded-lg border p-4">
   <div className="flex flex-wrap items-center gap-3"><div className="font-semibold">Chiamata #{ch.id}</div><div className="text-sm">{fmt(ch.dataInizio)} → {fmt(ch.dataFine)}</div><span className="rounded-full bg-[#e8f4ef] px-2 py-1 text-xs font-semibold text-[#007a55]">{ch.stato==="BOZZA"?"Bozza":ch.stato==="PEC_PREPARATA"?"PEC preparata":ch.esitoInvio?.startsWith("SIMULAZIONE TEST")?"INVIATA · SIMULAZIONE TEST":"Inviata"}</span><div className="ml-auto flex gap-2">{ch.xmlArchiviato&&<Button variant="outline" size="sm" onClick={()=>download(ch.xmlArchiviato||"","UNI_Intermittenti_"+ch.id+".xml")}><Download className="mr-1 h-4 w-4"/>XML</Button>}</div></div>
   {ch.xmlArchiviato&&<details className="mt-2 text-sm"><summary className="flex cursor-pointer items-center gap-1 text-[#007a55]"><FileCode2 className="h-4 w-4"/>Visualizza XML</summary><pre className="mt-2 max-h-40 overflow-auto whitespace-pre-wrap break-all rounded bg-gray-50 p-3 text-xs">{ch.xmlArchiviato}</pre></details>}
   {ch.stato==="INVIATA"?<p className="mt-2 text-sm text-emerald-700"><CheckCircle2 className="mr-1 inline h-4 w-4"/>Esito: {ch.esitoInvio||"Registrata manualmente"} · {ch.dataOraInvio||""}</p>:<p className="mt-2 text-xs text-amber-700">Comunicazione non ancora inviata.</p>}
  </section>)}</div>}
 </DialogContent></Dialog>;
};
