import { ezystaffBEUrl } from "@/utils/baseUrl";
export type ChiamataHR = {
 id:number; dataInizio:string; dataFine:string; stato:"BOZZA"|"PEC_PREPARATA"|"INVIATA";
 xmlArchiviato?:string; dataOraInvio?:string; esitoInvio?:string; annullamentoTest?:boolean; xmlAnnullamento?:string|null; esitoAnnullamento?:string|null;
};
async function request<T>(path:string,init?:RequestInit):Promise<T>{
 const response=await fetch(ezystaffBEUrl+path,{
   ...init, credentials:"include",
   headers:{Authorization:`Bearer ${localStorage.getItem("token")||""}`,Accept:"application/json",...(init?.body?{"Content-Type":"application/json"}:{}),...init?.headers}
 });
 const body=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(body?.message||`Errore archivio chiamate (HTTP ${response.status})`);
 return body as T;
}
const base=(idOperatore:number,idContratto:number)=>`chiamate-hr/${idOperatore}/${idContratto}`;
export const listaChiamateHR=(op:number,contratto:number)=>request<ChiamataHR[]>(base(op,contratto));
export const salvaChiamataHR=(op:number,contratto:number,dataInizio:string,dataFine:string,xml:string)=>request<{id:number;message:string}>(base(op,contratto),{method:"POST",body:JSON.stringify({dataInizio,dataFine,xml})});
export const aggiornaEsitoChiamataHR=(op:number,contratto:number,id:number,stato:"PEC_PREPARATA"|"INVIATA",esitoInvio?:string)=>request<{ok:boolean}>(base(op,contratto)+"/"+id,{method:"PATCH",body:JSON.stringify({stato,esitoInvio})});

export type DatoreIntermittenti = {codiceFiscale:string;email:string};
// Valori DETELDER confermati dall'amministratore; modificabili tramite API.
export const DATORE_DETELDER_DEFAULT: DatoreIntermittenti = {codiceFiscale:"13066390967",email:"info@detelder.com"};
export const leggiDatoreIntermittenti=()=>request<DatoreIntermittenti>("chiamate-hr/config/datore");
export const salvaDatoreIntermittenti=(codiceFiscale:string,email:string)=>request<DatoreIntermittenti>("chiamate-hr/config/datore",{method:"PUT",body:JSON.stringify({codiceFiscale,email})});

export const simulaInvioChiamataHR=(op:number,contratto:number,id:number)=>request<{ok:boolean;simulata:boolean;ricevuta:string}>(base(op,contratto)+"/"+id+"/simula-invio",{method:"POST"});

export const simulaAnnullamentoChiamataHR=(op:number,contratto:number,id:number,xml:string)=>request<{ok:boolean;simulata:boolean;esito:string}>(base(op,contratto)+"/"+id+"/simula-annullamento",{method:"POST",body:JSON.stringify({xml})});
export const resetSimulazioniChiamataHR=(op:number,contratto:number)=>request<{ok:boolean;eliminate:number}>(base(op,contratto)+"/simulazioni",{method:"DELETE"});
