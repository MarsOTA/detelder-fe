// Regola gestionale Detelder: non preparare contratti/chiamate futuri se
// un contratto padre è ancora in vigore. Non è una regola normativa generale.
export type PeriodoContratto={tipologia:string;dataInizio:string|null;dataFine:string|null};
export const giornoISO=(value:string|null|undefined)=>value?String(value).slice(0,10):"";
export const oggiISO=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
const tipoValido=(c:PeriodoContratto)=>["CHIAMATA","TEMPO_DETERMINATO","TEMPO_INDETERMINATO","OCCASIONALE","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO"].includes(c.tipologia);
export const contrattoInVigore=<T extends PeriodoContratto>(contratti:T[],oggi=oggiISO()):T|null=>contratti.filter(c=>tipoValido(c)&&!!giornoISO(c.dataInizio)&&giornoISO(c.dataInizio)<=oggi&&(!c.dataFine||giornoISO(c.dataFine)>=oggi)).sort((a,b)=>giornoISO(b.dataInizio).localeCompare(giornoISO(a.dataInizio)))[0]||null;
export const padreInVigore=<T extends PeriodoContratto>(contratti:T[],oggi=oggiISO()):T|null=>contratti.filter(c=>c.tipologia==="CHIAMATA"&&!!giornoISO(c.dataInizio)&&giornoISO(c.dataInizio)<=oggi&&(!c.dataFine||giornoISO(c.dataFine)>=oggi)).sort((a,b)=>giornoISO(b.dataInizio).localeCompare(giornoISO(a.dataInizio)))[0]||null;
export const messaggioBloccoContratto=(contratti:PeriodoContratto[],oggi=oggiISO())=>{
 const attivo=contrattoInVigore(contratti,oggi);
 return attivo?"Contratto in vigore fino al "+(attivo.dataFine?giornoISO(attivo.dataFine).split("-").reverse().join("/"):"tempo indeterminato")+". I turni successivi alla scadenza sono soltanto segnalati. Potrai assegnare un nuovo contratto dopo la scadenza del precedente.":null;
};
// La chiamata futura può essere preparata su un padre già creato (anche con decorrenza futura),
// purché la prestazione ricada interamente nel contratto e non sia nel passato.
export const puoPreparareChiamata=(padre:PeriodoContratto|null|undefined,inizio:string,fine:string,oggi=oggiISO())=>!!padre&&padre.tipologia==="CHIAMATA"&&!!giornoISO(padre.dataInizio)&&!!inizio&&!!fine&&inizio>=oggi&&inizio>=giornoISO(padre.dataInizio)&&fine>=inizio&&(!padre.dataFine||fine<=giornoISO(padre.dataFine));
