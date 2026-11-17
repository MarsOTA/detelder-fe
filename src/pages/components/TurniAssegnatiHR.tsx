// Vista condivisa dei turni nella tabella Admin e nella coda HR.
// Presentazione soltanto: nessuna API, stato HR o regola contrattuale.
export type TurnoTabellaHR={
  idTurno?:number;
  dataTurno?:string|null;
  oraInizio?:string|null;
  oraFine?:string|null;
  nomeEvento?:string|null;
  titoloEvento?:string|null;
  via?:string|null;
};
type Props={
  turni:readonly TurnoTabellaHR[];
  formatData:(date?:string|null)=>string;
};
export default function TurniAssegnatiHR({turni,formatData}:Props){
  return <div className="rounded-lg border bg-white p-4">
    <h3 className="mb-3 font-semibold text-[#007a55]">Turni assegnati</h3>
    {turni.length?<table className="w-full text-sm">
      <thead><tr className="text-left text-gray-500"><th className="p-2">Data</th><th className="p-2">Orario</th><th className="p-2">Evento</th><th className="p-2">Luogo</th></tr></thead>
      <tbody>{turni.map((t,i)=><tr key={t.idTurno??i} className="border-t">
        <td className="p-2">{formatData(t.dataTurno)}</td>
        <td className="p-2">{t.oraInizio||"—"} – {t.oraFine||"—"}</td>
        <td className="p-2">{t.nomeEvento||t.titoloEvento||"—"}</td>
        <td className="p-2">{t.via||"Luogo non specificato"}</td>
      </tr>)}</tbody>
    </table>:<p className="text-gray-500">Nessun turno nei prossimi 90 giorni</p>}
  </div>;
}
