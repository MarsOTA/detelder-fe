import { ezystaffBEUrl } from "@/utils/baseUrl";
export type HRRole="ADMIN"|"HR";
export type HRStato="DA_ELABORARE"|"IN_LAVORAZIONE"|"DOCUMENTI_MANCANTI"|"COMPLETATO";
export type HRPratica={id:number;idOperatore:number;nome:string;cognome:string;tipologia:string;datore:string;dataInizio:string|null;dataFine:string|null;stato:HRStato;note:string|null;assegnatoDa:number;presoInCaricoDa:number|null;assegnatoDaNome?:string|null;assegnatoDaCognome?:string|null;presoInCaricoDaNome?:string|null;presoInCaricoDaCognome?:string|null;aggiornatoIl?:string;creatoIl:string};
export type HRUtente={id:number;nome:string;cognome:string;email?:string;ruoloPrincipale:string;ruoloHR:HRRole|null};
export async function hrRequest<T>(path:string,init?:RequestInit):Promise<T>{
 const response=await fetch(ezystaffBEUrl+"hr-workflow/"+path,{...init,credentials:"include",headers:{Authorization:"Bearer "+(localStorage.getItem("token")||""),Accept:"application/json",...(init?.body?{"Content-Type":"application/json"}:{}),...init?.headers}});
 const data=await response.json().catch(()=>null);
 if(!response.ok)throw new Error(data?.message||"Errore API HR ("+response.status+")");
 return data as T;
}
export const hrMe=()=>hrRequest<{id:number;role:HRRole}>("me");
export const hrPratiche=()=>hrRequest<HRPratica[]>("pratiche");
export const hrAssegna=(payload:{idOperatore:number;tipologia:string;datore:string;dataInizio?:string|null;dataFine?:string|null})=>hrRequest<{id:number;stato:HRStato}>("pratiche",{method:"POST",body:JSON.stringify(payload)});
export const hrCambiaStato=(id:number,stato:HRStato,note:string)=>hrRequest<{id:number;stato:HRStato}>("pratiche/"+id+"/stato",{method:"PATCH",body:JSON.stringify({stato,note})});
export const hrUtenti=()=>hrRequest<HRUtente[]>("utenti");
export const hrAssegnaRuolo=(id:number,role:HRRole|null)=>hrRequest("utenti/"+id+"/ruolo",{method:"PUT",body:JSON.stringify({role})});

export const hrAggiornaPeriodo=(id:number,dataInizio:string,dataFine:string|null)=>hrRequest<{id:number;dataInizio:string;dataFine:string|null}>("pratiche/"+id+"/periodo",{method:"PATCH",body:JSON.stringify({dataInizio,dataFine})});

export type HRPraticaLog={id:number;praticaId:number;attoreId:number;attoreNome:string|null;attoreCognome:string|null;statoPrima:HRStato|null;statoDopo:HRStato;dettaglio:string|null;creatoIl:string};
export const hrLog=(id:number)=>hrRequest<HRPraticaLog[]>("pratiche/"+id+"/log");

export const hrRegistraAttivita=(praticaId:number,azione:"CONTRATTO_CREATO"|"CONTRATTO_FIRMATO_CARICATO"|"UNILAV_CARICATO",contrattoId:number)=>hrRequest<{registrato:boolean}>("pratiche/"+praticaId+"/attivita",{method:"POST",body:JSON.stringify({azione,contrattoId})});

export const hrLeggiCodiceComunicazione=(praticaId:number)=>hrRequest<{codice:string}>("pratiche/"+praticaId+"/codice-comunicazione");
export const hrSalvaCodiceComunicazione=(praticaId:number,codice:string)=>hrRequest<{codice:string}>("pratiche/"+praticaId+"/codice-comunicazione",{method:"PUT",body:JSON.stringify({codice})});
