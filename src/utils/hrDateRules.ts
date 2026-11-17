// Funzioni pure condivise dalle analisi ADMIN e HR.
// I turni che terminano allo stesso orario (o prima) di quello iniziale
// coprono anche il giorno successivo: la regola evita esiti discordanti.
export type TurnoConPeriodoHR={
  dataTurno?:string|null;
  oraInizio?:string|null;
  oraFine?:string|null;
};
export const dataGiornoHR=(value?:string|null)=>value?String(value).slice(0,10):"";
export const fineTurnoHR=(turno:TurnoConPeriodoHR):string=>{
  const giorno=dataGiornoHR(turno.dataTurno);
  if(!giorno)return "";
  const inizio=String(turno.oraInizio||"").slice(0,5);
  const fine=String(turno.oraFine||"").slice(0,5);
  if(inizio&&fine&&fine<=inizio){
    const d=new Date(giorno+"T12:00:00");
    d.setDate(d.getDate()+1);
    return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
  }
  return giorno;
};
