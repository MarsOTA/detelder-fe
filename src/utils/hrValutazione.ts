import {contrattoInVigore} from "@/utils/hrContrattoRestrittivo";
import {fineTurnoHR as fineTurno} from "@/utils/hrDateRules";
import {coprePeriodoChiamata,intersecaPeriodoChiamata} from "@/utils/intermittentiPrestazioni";
import type {ChiamataHR} from "@/utils/chiamateHR";

// Single source for the Admin HR table's calculated status and priority.
// UI components consume Riga rather than independently deciding HR cases.
export type Operatore = { id:number;nome:string;cognome:string;ruolo?:string;codiceFiscale?:string;codice_fiscale?:string };
export type Contratto = {idContratto:number;tipologia:string;dataInizio:string|null;dataFine:string|null;pathContrattoUnilav?:string|null;pathContrattoFirmato?:string|null;cfDatore?:string;emailDatore?:string};
export type Turno = {idTurno?:number;idOperatore?:number|null;dataTurno?:string;oraInizio?:string;oraFine?:string;nomeEvento?:string;via?:string};
export type Stato = "Completo" | "Incompleto" | "Scaduto";
export type Livello = "Alta" | "Media" | "Bassa" | "Nessuna";
export type Riga = {operatore:Operatore;contratti:Contratto[];turni:Turno[];prossimoTurno:string|null;priorita:number;livello:Livello;stato:Stato;motivi:string[];chiamateDaComunicare:Turno[];chiamateGiaPresenti:Turno[];verificaChiamateNonDisponibile:boolean};
export type ArchivioChiamate = Record<number,ChiamataHR[] | null>;
export const oggi=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
export const iso=(v?:string|null)=>v?String(v).slice(0,10):"";
export const formatData=(v?:string|null)=>{const s=iso(v);return s.length===10?s.slice(8,10)+"/"+s.slice(5,7)+"/"+s.slice(2,4):"—";};
const giorniDaOggi=(data:string)=>Math.round((Date.parse(data+"T12:00:00")-Date.parse(oggi()+"T12:00:00"))/86400000);
const tipoLavoro=(t:string)=>["CHIAMATA","OCCASIONALE","TEMPO_DETERMINATO","TEMPO_INDETERMINATO","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO"].includes(t);
const copre=(c:Contratto,data:string)=>tipoLavoro(c.tipologia)&&iso(c.dataInizio)<=data&&!!c.dataInizio&&(!c.dataFine||iso(c.dataFine)>=data);

export function valuta(o:Operatore,contratti:Contratto[],turni:Turno[],archivi:ArchivioChiamate):Riga {
 const futuri=turni.filter(t=>iso(t.dataTurno)>=oggi()&&!!t.dataTurno).sort((a,b)=>iso(a.dataTurno).localeCompare(iso(b.dataTurno)));
 const prossimoTurno=futuri.length?iso(futuri[0].dataTurno):null;
 const priorita=prossimoTurno?Math.max(0,Math.round((Date.parse(prossimoTurno+"T12:00:00")-Date.parse(oggi()+"T12:00:00"))/86400000)):999999;
 const riferimento=prossimoTurno||oggi();
 // Un padre già generato con decorrenza futura copre i turni futuri nel suo periodo.
 // Non equivale a un contratto attualmente in vigore.
 const contrattiUtilizzabili=contratti.filter(c=>!!c.dataInizio&&(!contrattoInVigore(contratti)||iso(c.dataInizio)<=oggi()));
 const altri=contrattiUtilizzabili.find(c=>copre(c,riferimento));
 const scaduti=contratti.filter(c=>tipoLavoro(c.tipologia)&&!!c.dataFine&&iso(c.dataFine)<riferimento);
 const attivo=contrattoInVigore(contratti);
 const scoperti=futuri.filter(t=>(!!attivo?.dataFine&&iso(t.dataTurno)>iso(attivo.dataFine))||!contrattiUtilizzabili.some(c=>copre(c,iso(t.dataTurno))&&copre(c,fineTurno(t))));
 const primaScopertura=scoperti.length?iso(scoperti[0].dataTurno):null;
 const isScaduto=!!prossimoTurno&&!altri&&scaduti.length>0;
 const cf=o.codiceFiscale||o.codice_fiscale;
 const motivi:string[]=[];
 if(!cf?.trim())motivi.push("Codice fiscale");
 if(!altri&&prossimoTurno)motivi.push(isScaduto?"Contratto scaduto":"Contratto padre / inquadramento");
 if(primaScopertura)motivi.push(attivo?.dataFine&&primaScopertura>iso(attivo.dataFine)?"Turno del "+formatData(primaScopertura)+" oltre scadenza contratto in vigore: sola segnalazione":"Turno del "+formatData(primaScopertura)+" senza copertura contrattuale completa");

 if(altri&&["CHIAMATA","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO","TEMPO_DETERMINATO","TEMPO_INDETERMINATO"].includes(altri.tipologia)&&!altri.pathContrattoUnilav)motivi.push("Documento UNILAV");
 // La chiamata figlia deve coprire la data del turno ed essere dichiarata INVIATA:
 // BOZZA e PEC_PREPARATA non sono conferme dell'invio.
 const verificaChiamateNonDisponibile=contrattiUtilizzabili.some(c=>c.tipologia==="CHIAMATA"&&archivi[c.idContratto]===null);
 const chiamateMancanti=futuri.filter(t=>{
  const data=iso(t.dataTurno);
  const padreTurno=contrattiUtilizzabili.find(c=>c.tipologia==="CHIAMATA"&&copre(c,data));
  if(!padreTurno)return false;
  const lista=archivi[padreTurno.idContratto];
  if(!lista)return true; // errore API: non dichiarare regolare la posizione
  return !lista.some(ch=>ch.stato==="INVIATA"&&!ch.annullamentoTest&&coprePeriodoChiamata(ch,data,fineTurno(t)));
 });
 const chiamateGiaPresenti=chiamateMancanti.filter(t=>{
   const giorno=iso(t.dataTurno);
   return Object.values(archivi).some(lista=>Array.isArray(lista)&&lista.some(ch=>intersecaPeriodoChiamata(ch,giorno,fineTurno(t))));
 });
 if(chiamateMancanti.length)motivi.push(verificaChiamateNonDisponibile?"Verifica chiamate non disponibile":chiamateGiaPresenti.length?"Chiamata già presente per il turno del "+formatData(chiamateGiaPresenti[0].dataTurno)+": completa quella esistente":"Chiamata non coperta per il turno del "+formatData(chiamateMancanti[0].dataTurno));

 // La copertura del contratto padre non conferma l'esistenza di una chiamata figlia valida.
 // In assenza di un'API che colleghi le chiamate ai turni, non certificare la regolarità.
 // In an assigned HR practice, contract status refers to its actual generated contract,
 // not a different future shift. HR task progress remains in the separate action column.
 // La pratica HR può essere elaborata senza che ogni turno sia regolarizzato.
 // Lo stato Admin valuta esclusivamente copertura effettiva e documenti, non
 // la corrispondenza puntuale delle date con una pratica già assegnata.
 const stato:Stato=isScaduto?"Scaduto":motivi.length>0?"Incompleto":"Completo";
 const urgenza=primaScopertura?giorniDaOggi(primaScopertura):null;
 const urgenzaChiamata=chiamateMancanti.length?giorniDaOggi(iso(chiamateMancanti[0].dataTurno)):null;
 const livello:Livello=urgenza!==null?(urgenza<=7?"Alta":"Media"):urgenzaChiamata!==null?(urgenzaChiamata<=7?"Alta":"Media"):motivi.length||stato!=="Completo"?"Bassa":"Nessuna";
 return {operatore:o,contratti,turni:futuri,prossimoTurno,priorita,livello,stato,motivi,chiamateDaComunicare:chiamateMancanti,chiamateGiaPresenti,verificaChiamateNonDisponibile};
}

