// Matrice decisionale condivisa: Schema Regolarizzazioni, 23/10/2026.
// La regolarità è distinta dallo stato della pratica HR e dallo stato di una chiamata.
export type CasoHR="SENZA_CONTRATTO"|"CONTRATTO_SCADUTO"|"TURNO_FUORI_COPERTURA"|"CHIAMATA_MANCANTE"|"DOCUMENTI_MANCANTI"|"PRATICA_APERTA"|"REGOLARE";
export type AzioneAdminHR="ASSEGNA_CONTRATTO"|"ASSEGNA_NUOVO_PERIODO"|"VERIFICA_CHIAMATA"|"APRI_PRATICA"|"NESSUNA";
export type DecisioneHR={caso:CasoHR;problema:string;azione:AzioneAdminHR;etichetta:string};
type Contratto={tipologia:string;dataInizio:string|null;dataFine:string|null;pathContrattoUnilav?:string|null};
type Turno={dataTurno?:string;oraInizio?:string;oraFine?:string};
type Pratica={stato:string}|null|undefined;
const iso=(s:string|null|undefined)=>s?String(s).slice(0,10):"";
const laboral=(s:string)=>["CHIAMATA","OCCASIONALE","TEMPO_DETERMINATO","TEMPO_INDETERMINATO","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO"].includes(s);
const copre=(c:Contratto,dal:string,al:string)=>laboral(c.tipologia)&&!!iso(c.dataInizio)&&iso(c.dataInizio)<=dal&&(!c.dataFine||iso(c.dataFine)>=al);
const fine=(t:Turno)=>{const d=iso(t.dataTurno);if(!d)return "";if(t.oraInizio&&t.oraFine&&t.oraFine.slice(0,5)<=t.oraInizio.slice(0,5)){const next=new Date(d+"T12:00:00");next.setDate(next.getDate()+1);return [next.getFullYear(),String(next.getMonth()+1).padStart(2,"0"),String(next.getDate()).padStart(2,"0")].join("-");}return d;};
export function decidiRegolarizzazione(contratti:Contratto[],turni:Turno[],motivi:string[],pratica:Pratica):DecisioneHR{
 const futuri=[...turni].filter(t=>!!iso(t.dataTurno)).sort((a,b)=>iso(a.dataTurno).localeCompare(iso(b.dataTurno)));
 const fuori=futuri.find(t=>!contratti.some(c=>copre(c,iso(t.dataTurno),fine(t))));
 const ultimi=contratti.filter(c=>laboral(c.tipologia)).sort((a,b)=>iso(b.dataFine||b.dataInizio).localeCompare(iso(a.dataFine||a.dataInizio)));
 const aperta=pratica&&pratica.stato!=="COMPLETATO";
 if(fuori){
  if(aperta)return {caso:"PRATICA_APERTA",problema:"Contratto da completare per i turni",azione:"APRI_PRATICA",etichetta:"Apri pratica HR"};
  if(!ultimi.length)return {caso:"SENZA_CONTRATTO",problema:"Nessun contratto per il turno",azione:"ASSEGNA_CONTRATTO",etichetta:"Assegna contratto a HR"};
  const prima=iso(fuori.dataTurno);
  const scaduto=ultimi.every(c=>!!c.dataFine&&iso(c.dataFine)<prima);
  return {caso:scaduto?"CONTRATTO_SCADUTO":"TURNO_FUORI_COPERTURA",problema:scaduto?"Contratto scaduto · turno non coperto":"Turno fuori copertura contrattuale",azione:"ASSEGNA_NUOVO_PERIODO",etichetta:"Assegna nuovo contratto"};
 }
 if(motivi.some(m=>m.startsWith("Chiamata non coperta")||m==="Verifica chiamate non disponibile"))return {caso:"CHIAMATA_MANCANTE",problema:"Chiamata intermittente da verificare",azione:"VERIFICA_CHIAMATA",etichetta:"Verifica chiamata"};
 if(motivi.length||aperta)return {caso:aperta?"PRATICA_APERTA":"DOCUMENTI_MANCANTI",problema:motivi[0]||"Pratica HR in lavorazione",azione:"APRI_PRATICA",etichetta:"Apri pratica HR"};
 return {caso:"REGOLARE",problema:"Nessuna criticità",azione:"NESSUNA",etichetta:"Nessuna azione"};
}
