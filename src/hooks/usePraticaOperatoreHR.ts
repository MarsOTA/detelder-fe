import {useEffect,useState} from "react";
import {hrPratiche,hrPrendiInCarico} from "@/utils/hrWorkflow";
import type {HRPratica} from "@/utils/hrWorkflow";

// Keeps HR practice selection, take-in-charge and status refresh outside
// the operator's anagrafica/document view. The existing endpoints are unchanged.
type Params={
  id?:string;
  praticaId:string|null;
  isHR:boolean;
  contratti:readonly unknown[];
  aggiornamentoAzioniHR:number;
};
export function usePraticaOperatoreHR({id,praticaId,isHR,contratti,aggiornamentoAzioniHR}:Params){
 const [praticaHR,setPraticaHR]=useState<HRPratica|null>(null);
 useEffect(()=>{
  if(!id)return;
  const selectedId=Number(praticaId);
  let active=true;
  void (async()=>{
   const rows=await hrPratiche();
   const all=rows.filter(p=>p.idOperatore===Number(id)).sort((a,b)=>b.id-a.id);
   const selected=selectedId?all.find(p=>p.id===selectedId):all[0];
   if(!selected){if(active)setPraticaHR(null);return;}
   if(isHR&&selected.stato!=="COMPLETATO")await hrPrendiInCarico(selected.id);
   if(active)setPraticaHR(selected);
  })().catch(()=>{if(active)setPraticaHR(null)});
  return()=>{active=false};
 },[id,praticaId,isHR]);
 useEffect(()=>{
  if(!praticaHR?.id)return;
  let active=true;
  void hrPratiche().then(rows=>{
   const latest=rows.find(p=>p.id===praticaHR.id);
   if(active&&latest&&(latest.stato!==praticaHR.stato||latest.note!==praticaHR.note))setPraticaHR(latest);
  }).catch(()=>{});
  return()=>{active=false};
 },[contratti,aggiornamentoAzioniHR,praticaHR?.id]);
 return {praticaHR,setPraticaHR};
}
