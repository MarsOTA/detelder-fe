import type { ChangeEvent } from "react";

interface FormContrattoOccasionale {
  dataInizio: Date | null;
  dataFine: Date | null;
  dataFirmaContratto: Date | null;
}
interface Props {
  formContrattoOccasionale: FormContrattoOccasionale;
  handleChangeContrattoChiamata: <K extends keyof FormContrattoOccasionale>(
    field: K,
    value: FormContrattoOccasionale[K]
  ) => void;
}
const iso=(value:Date|null)=>value?[
 value.getFullYear(),String(value.getMonth()+1).padStart(2,"0"),String(value.getDate()).padStart(2,"0")
].join("-"):"";
const asDate=(event:ChangeEvent<HTMLInputElement>)=>event.target.value?new Date(event.target.value+"T12:00:00"):null;

export const ContrattoOccasionaleComponent=({formContrattoOccasionale,handleChangeContrattoChiamata}:Props)=>{
 const inizio=iso(formContrattoOccasionale.dataInizio);
 const fine=iso(formContrattoOccasionale.dataFine);
 return <div className="rounded-lg border border-[#d4e4dd] bg-[#f5faf8] p-4">
  <p className="mb-3 text-sm text-gray-600">Periodo proposto dall'ADMIN, modificabile prima di generare il contratto.</p>
  <div className="grid gap-3 sm:grid-cols-2">
   <label className="text-sm font-semibold text-[#315e51]">Data inizio contratto
     <input className="mt-1 block w-full rounded-md border border-[#bfd5cb] bg-white p-2 text-sm" type="date" required value={inizio} max={fine||undefined} onChange={e=>handleChangeContrattoChiamata("dataInizio",asDate(e))}/>
   </label>
   <label className="text-sm font-semibold text-[#315e51]">Data fine contratto
     <input className="mt-1 block w-full rounded-md border border-[#bfd5cb] bg-white p-2 text-sm" type="date" required value={fine} min={inizio||undefined} onChange={e=>handleChangeContrattoChiamata("dataFine",asDate(e))}/>
   </label>
   <label className="text-sm font-semibold text-[#315e51]">Data firma contratto
     <input className="mt-1 block w-full rounded-md border border-[#bfd5cb] bg-white p-2 text-sm" type="date" value={iso(formContrattoOccasionale.dataFirmaContratto)} onChange={e=>handleChangeContrattoChiamata("dataFirmaContratto",asDate(e))}/>
   </label>
  </div>
  {inizio&&fine&&fine<inizio&&<p role="alert" className="mt-2 text-xs text-red-700">La data di fine non può precedere quella di inizio.</p>}
 </div>;
};
