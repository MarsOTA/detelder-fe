import {useState} from "react";
import {createPortal} from "react-dom";
import {AlertCircle} from "lucide-react";

const dettagliAnagrafici=/^(?:Nome|Cognome|Data di nascita|Luogo di nascita|Stato di nascita|Indirizzo di residenza|Numero civico di residenza|Comune di residenza|Provincia di residenza|CAP di residenza|Dati anagrafici non disponibili)$/i;
export function riepilogoCriticitaHR(motivi:string[]):string[]{
 const raccolti:string[]=[];
 for(const motivo of motivi){
  const pulito=motivo.trim();
  if(!pulito)continue;
  const testo=/^codice fiscale(?: mancante)?$/i.test(pulito)?"Codice fiscale mancante":
   dettagliAnagrafici.test(pulito)?"Dati anagrafici mancanti":pulito;
  if(!raccolti.includes(testo))raccolti.push(testo);
 }
 return raccolti;
}
type Props={motivi:string[];stato?:string};
export default function TooltipStatoHR({motivi,stato="Incompleto"}:Props){
 const [ancora,setAncora]=useState<{top:number;left:number}|null>(null);
 const mostra=(el:HTMLElement)=>{
  const r=el.getBoundingClientRect();
  // Render via portal, outside the table overflow container and above adjacent rows.
  const width=280;
  setAncora({top:Math.min(window.innerHeight-16,r.bottom+10),left:Math.min(Math.max(12,r.left),Math.max(12,window.innerWidth-width-12))});
 };
 const items=riepilogoCriticitaHR(motivi);
 return <>
  <span tabIndex={0} role="button" aria-label={stato+": "+items.join("; ")}
   onMouseEnter={e=>mostra(e.currentTarget)} onMouseLeave={()=>setAncora(null)}
   onFocus={e=>mostra(e.currentTarget)} onBlur={()=>setAncora(null)}
   className="inline-flex cursor-help items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
   <AlertCircle className="h-4 w-4"/>{stato}
  </span>
  {ancora&&createPortal(<div role="tooltip" style={{position:"fixed",top:ancora.top,left:ancora.left,width:280,maxWidth:"calc(100vw - 24px)",maxHeight:"min(240px, 45vh)",overflowY:"auto",zIndex:99999,pointerEvents:"none"}}
   className="rounded-xl border border-amber-200 bg-white p-3 text-left text-xs text-slate-700 shadow-xl">
   <p className="mb-2 font-semibold text-amber-800">Cosa manca</p>
   <ul className="list-inside list-disc space-y-1">{(items.length?items:["Verificare i requisiti dell’operatore"]).map(v=><li key={v}>{v}</li>)}</ul>
  </div>,document.body)}
 </>;
}
