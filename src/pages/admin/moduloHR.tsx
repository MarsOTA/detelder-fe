import { Fragment, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { ezystaffBEUrl } from "@/utils/baseUrl";

type Operatore = { id: number; nome: string; cognome: string; ruolo?: string; stato?: string };
type Contratto = { idContratto: number; tipologia: string; dataInizio: string | null; dataFine: string | null; pathContrattoFirmato?: string | null; pathContrattoUnilav?: string | null };
type Turno = { idTurno?: number; idOperatore?: number | null; dataTurno?: string; oraInizio?: string; oraFine?: string; statoTurno?: string; nomeEvento?: string; operatore?: string };
type Riga = { operatore: Operatore; contratti: Contratto[]; turni: Turno[]; prossimoTurno: string | null; criticita: string; priorita: number };
type Scelta = { tipologia: string; inizio: string; fine: string };
const today = () => { const d = new Date(); return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-"); };
const iso = (value?: string | null) => value ? String(value).slice(0,10) : "";
const isIndeterminato = (tipo: string) => tipo === "TEMPO_INDETERMINATO" || tipo === "CONTRATTO_TEMPO_INDETERMINATO";
const isLavoro = (tipo: string) => ["CHIAMATA","OCCASIONALE","TEMPO_DETERMINATO","TEMPO_INDETERMINATO","CONTRATTO_TEMPO_DETERMINATO","CONTRATTO_TEMPO_INDETERMINATO"].includes(tipo);
const copre = (c: Contratto, data: string) => isLavoro(c.tipologia) && !!iso(c.dataInizio) && iso(c.dataInizio) <= data && (isIndeterminato(c.tipologia) ? !iso(c.dataFine) || iso(c.dataFine) >= data : !!iso(c.dataFine) && iso(c.dataFine) >= data);
async function api<T>(path: string): Promise<T> {
  const response = await fetch(ezystaffBEUrl + path, { credentials: "include", headers: { Authorization: `Bearer ${localStorage.getItem("token") || ""}`, Accept: "application/json" } });
  if (!response.ok) throw new Error(`Errore API ${response.status}: ${path}`);
  return response.json() as Promise<T>;
}
function valuta(o: Operatore, contratti: Contratto[], turni: Turno[]): Riga {
  const futuri = turni.filter(t => !!t.dataTurno && iso(t.dataTurno) >= today()).sort((a,b) => iso(a.dataTurno).localeCompare(iso(b.dataTurno)));
  const scoperti = futuri.filter(t => !contratti.some(c => copre(c,iso(t.dataTurno))));
  const validiOggi = contratti.some(c => copre(c,today()));
  const mancante = !contratti.some(c => isLavoro(c.tipologia));
  const criticita = mancante ? "Contratto assente" : scoperti.length ? "Turno senza copertura" : !validiOggi ? "Nessun contratto attivo oggi" : "Copertura verificata sui dati disponibili";
  const prossimoTurno = futuri[0]?.dataTurno ? iso(futuri[0].dataTurno) : null;
  const primaScopertura = scoperti[0]?.dataTurno ? iso(scoperti[0].dataTurno) : null;
  const priorita = primaScopertura ? Math.max(0, Math.floor((Date.parse(primaScopertura+"T12:00:00")-Date.parse(today()+"T12:00:00"))/86400000)) : 999999;
  return { operatore:o,contratti,turni,prossimoTurno,criticita,priorita };
}
export default function ModuloHR() {
  const [righe,setRighe] = useState<Riga[]>([]);
  const [loading,setLoading] = useState(false);
  const [errore,setErrore] = useState("");
  const [ricerca,setRicerca] = useState("");
  const [soloAnomalie,setSoloAnomalie] = useState(false);
  const [selezionato,setSelezionato] = useState<number|null>(null);
  const [espanso,setEspanso] = useState<number|null>(null);
  const [scelte,setScelte] = useState<Record<number,Scelta>>({});
  const [progress,setProgress] = useState("");
  const [turniSenzaOperatore,setTurniSenzaOperatore] = useState(0);
  const [inlineHR,setInlineHR] = useState<Record<number,{datore:string;tipo:string}>>({});
  const modificaHR = (id:number,chiave:"datore"|"tipo",value:string)=>setInlineHR(v=>({...v,[id]:{datore:"DETELDER",tipo:"",...v[id],[chiave]:value}}));
  const formatData = (date:string|null)=>date ? `${date.slice(8,10)}/${date.slice(5,7)}/${date.slice(2,4)}` : "—";
  const carica = async () => {
    setLoading(true); setErrore(""); setProgress("Caricamento operatori e turni…");
    try {
      const inizio = today();
      const fine = new Date(); fine.setDate(fine.getDate()+90);
      const dataFine = [fine.getFullYear(),String(fine.getMonth()+1).padStart(2,"0"),String(fine.getDate()).padStart(2,"0")].join("-");
      const [operatori,turni] = await Promise.all([
        api<Operatore[]>("operatori"),
        api<Turno[]>(`turni?dataInizio=${inizio}&dataFine=${dataFine}`)
      ]);
      if (!Array.isArray(operatori) || !Array.isArray(turni)) throw new Error("Formato dati inatteso: verifica gli endpoint operatori e turni.");
      setTurniSenzaOperatore(turni.filter(t => t.idOperatore === null || t.idOperatore === undefined).length);
      const persone = operatori.filter(o => o.ruolo === "OPERATORE" || !o.ruolo);
      // Il caricamento limitato a quattro richieste contemporanee evita un picco di chiamate sul backend.
      const dati: Riga[] = [];
      for (let i=0;i<persone.length;i+=4) {
        const lotto = persone.slice(i,i+4);
        const contratti = await Promise.all(lotto.map(o => api<Contratto[]>(`operatori/listaContrattiOperatore/${o.id}`)));
        lotto.forEach((o,j)=>dati.push(valuta(o,Array.isArray(contratti[j])?contratti[j]:[],turni.filter(t=>Number(t.idOperatore)===Number(o.id)))));
        setProgress(`Analizzati ${Math.min(i+4,persone.length)} / ${persone.length} operatori`);
      }
      setRighe(dati);
    } catch (e) { setErrore(e instanceof Error ? e.message : "Errore nel caricamento"); }
    finally { setLoading(false); setProgress(""); }
  };
  useEffect(()=>{void carica();},[]);
  const visibili=useMemo(()=>righe.filter(r=>(!soloAnomalie||r.criticita!=="Copertura verificata sui dati disponibili") && (`${r.operatore.nome} ${r.operatore.cognome}`.toLowerCase().includes(ricerca.toLowerCase()))).sort((a,b)=>a.priorita-b.priorita || a.operatore.cognome.localeCompare(b.operatore.cognome)),[righe,soloAnomalie,ricerca]);
  const scelto = selezionato===null?null:scelte[selezionato]||{tipologia:"CHIAMATA",inizio:today(),fine:""};
  const aggiornaScelta = (patch:Partial<Scelta>) => { if(selezionato===null)return; setScelte(old=>({...old,[selezionato]:{...(old[selezionato] ?? {tipologia:"CHIAMATA",inizio:today(),fine:""}),...patch}})); };
  return <main className="m-6 space-y-6">
    <div className="flex flex-wrap justify-between gap-3 items-center"><div><h1 className="text-[30px] font-extrabold text-[#007a55]">HR · Regolarizzazione contratti</h1><p className="text-sm text-gray-500">Prototipo in sola lettura · Nessun contratto o invio viene creato</p></div><button onClick={()=>void carica()} disabled={loading} className="rounded-md bg-[#007a55] px-4 py-2 text-white disabled:opacity-50">{loading?"Analisi in corso…":"Aggiorna dati"}</button></div>
    {errore&&<div role="alert" className="rounded-md border border-red-300 bg-red-50 p-4 text-red-800">{errore}</div>}
    {progress&&<p role="status" className="text-sm text-gray-600">{progress}</p>}
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {[["Operatori analizzati",righe.length],["Turni assegnati (prossimi 90 giorni)",righe.reduce((sum,r)=>sum+r.turni.length,0)],["Turni senza operatore",turniSenzaOperatore],["Da verificare",righe.filter(r=>r.criticita!=="Copertura verificata sui dati disponibili").length]].map(([titolo,valore])=><div key={String(titolo)} className="rounded-lg border bg-white p-4"><div className="text-2xl font-bold">{valore}</div><div className="text-sm text-gray-500">{titolo}</div></div>)}
    </div>
    <div className="rounded-lg border bg-white p-4"><div className="mb-3 flex flex-wrap gap-3 items-center justify-between"><input className="rounded border px-3 py-2" placeholder="Cerca operatore" value={ricerca} onChange={e=>setRicerca(e.target.value)}/><label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={soloAnomalie} onChange={e=>setSoloAnomalie(e.target.checked)}/> Solo posizioni da verificare</label></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[1020px] text-sm"><thead><tr className="bg-gray-100 text-left"><th className="p-3">Operatore</th><th className="p-3">Inquadramento</th><th className="p-3">Datore di lavoro</th><th className="p-3">Prossimo turno</th><th className="p-3">Esito controllo</th><th className="p-3">Priorità</th><th className="p-3">Azioni</th></tr></thead><tbody>
    {visibili.map(r=><Fragment key={r.operatore.id}>
      <tr className="border-b">
        <td className="p-3 font-semibold"><button className="mr-2 text-[#007a55]" aria-label={espanso===r.operatore.id?"Chiudi dettagli operatore":"Apri dettagli operatore"} aria-expanded={espanso===r.operatore.id} onClick={()=>setEspanso(v=>v===r.operatore.id?null:r.operatore.id)}>{espanso===r.operatore.id?"▾":"▸"}</button>{r.operatore.cognome} {r.operatore.nome}</td>
        <td className="p-3"><select aria-label={`Inquadramento ${r.operatore.nome} ${r.operatore.cognome}`} value={inlineHR[r.operatore.id]?.tipo ?? r.contratti.find(c=>copre(c,today()))?.tipologia ?? ""} onChange={e=>modificaHR(r.operatore.id,"tipo",e.target.value)} className="w-full min-w-[125px] rounded border bg-white p-2 text-sm"><option value="">Da assegnare</option><option value="CHIAMATA">Chiamata</option><option value="TEMPO_DETERMINATO">Determinato</option><option value="TEMPO_INDETERMINATO">Indeterminato</option><option value="OCCASIONALE">Occasionale</option><option value="FATTURA">Fattura</option></select></td>
        <td className="p-3"><select aria-label={`Datore ${r.operatore.nome} ${r.operatore.cognome}`} value={inlineHR[r.operatore.id]?.datore ?? "DETELDER"} onChange={e=>modificaHR(r.operatore.id,"datore",e.target.value)} className="w-full min-w-[125px] rounded border bg-white p-2 text-sm"><option value="DETELDER">DETELDER</option><option value="SOCIETA_APPALTO">Società in appalto</option><option value="AUTONOMO_PIVA">Autonomo - P.IVA</option></select></td>
        <td className="p-3">{formatData(r.prossimoTurno)}</td>
        <td className="p-3">{r.criticita}</td>
        <td className="p-3">{r.priorita===999999?"Da verificare":r.priorita===0?"Oggi":`Tra ${r.priorita} giorni`}</td>
        <td className="p-3"><div className="flex flex-wrap gap-3"><Link to={`/admin/dettaglio-operatore/${r.operatore.id}?tab=contratti`} className="rounded-md bg-[#007a55] px-3 py-2 text-sm text-white hover:bg-[#006449]">Vai ai contratti</Link><button onClick={()=>setSelezionato(r.operatore.id)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#b7d7cc] bg-[#f5faf8] text-[#007a55]" aria-label="Proponi contratto con AI" title="Proponi contratto (simulazione)"><Sparkles className="h-5 w-5"/></button></div></td>
      </tr>
      {espanso===r.operatore.id&&<tr className="bg-[#f5faf8]"><td colSpan={7} className="p-4"><div className="rounded-lg border bg-white p-4"><h3 className="mb-3 font-semibold text-[#007a55]">Turni assegnati nei prossimi 90 giorni</h3>{r.turni.length?<div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-left text-gray-500"><th className="p-2">Data</th><th className="p-2">Orario</th><th className="p-2">Evento</th></tr></thead><tbody>{[...r.turni].sort((a,b)=>iso(a.dataTurno).localeCompare(iso(b.dataTurno))).map((t,i)=><tr key={t.idTurno??i} className="border-t"><td className="p-2">{formatData(iso(t.dataTurno))}</td><td className="p-2">{t.oraInizio||"—"} – {t.oraFine||"—"}</td><td className="p-2">{t.nomeEvento||"—"}</td></tr>)}</tbody></table></div>:<p className="text-sm text-gray-500">Nessun turno assegnato nel periodo.</p>}</div></td></tr>}
    </Fragment>)}
    {!visibili.length&&<tr><td className="p-4 text-gray-500" colSpan={6}>Nessun risultato.</td></tr>}
    </tbody></table></div></div>
    {selezionato!==null&&scelto&&<div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={()=>setSelezionato(null)}><section role="dialog" aria-modal="true" aria-label="Assegna contratto" onClick={e=>e.stopPropagation()} className="w-full max-w-lg space-y-4 rounded-xl bg-white p-6 shadow-xl">
      <div className="flex justify-between"><h2 className="text-xl font-bold">Proposta incarico HR</h2><button onClick={()=>setSelezionato(null)} aria-label="Chiudi">✕</button></div><p className="text-sm text-gray-500">Simulazione: questa maschera non scrive dati nel database.</p>
      <div className="rounded-md border p-3 text-sm"><div className="font-semibold mb-2">Turni assegnati nei prossimi 90 giorni</div>{righe.find(r=>r.operatore.id===selezionato)?.turni.length ? <ul className="max-h-36 overflow-auto space-y-1">{righe.find(r=>r.operatore.id===selezionato)?.turni.map((t,i)=><li key={t.idTurno??i}>{iso(t.dataTurno)} · {t.oraInizio||"—"}–{t.oraFine||"—"} {t.nomeEvento ? `· ${t.nomeEvento}` : ""}</li>)}</ul> : <p>Nessun turno assegnato nel periodo</p>}</div>
      <label className="block text-sm">Tipologia<select className="mt-1 block w-full rounded border p-2" value={scelto.tipologia} onChange={e=>aggiornaScelta({tipologia:e.target.value})}><option value="CHIAMATA">A chiamata</option><option value="TEMPO_DETERMINATO">Tempo determinato</option><option value="TEMPO_INDETERMINATO">Tempo indeterminato</option></select></label>
      <div className="grid grid-cols-2 gap-3"><label className="text-sm">Inizio<input type="date" className="mt-1 block w-full rounded border p-2" value={scelto.inizio} onChange={e=>aggiornaScelta({inizio:e.target.value})}/></label><label className="text-sm">Fine<input type="date" className="mt-1 block w-full rounded border p-2" disabled={scelto.tipologia==="TEMPO_INDETERMINATO"} value={scelto.tipologia==="TEMPO_INDETERMINATO"?"":scelto.fine} onChange={e=>aggiornaScelta({fine:e.target.value})}/></label></div>
      <div className="rounded bg-amber-50 p-3 text-sm">Generazione contratto padre e chiamata figlia disabilitate fino al collaudo del workflow e delle autorizzazioni.</div>
      <div className="flex justify-between gap-3"><Link className="rounded border px-3 py-2 text-sm" to={`/admin/dettaglio-operatore/${selezionato}`}>Apri scheda operatore</Link><button className="rounded bg-gray-200 px-3 py-2" onClick={()=>setSelezionato(null)}>Chiudi</button></div>
    </section></div>}
    <p className="text-xs text-amber-700">I menu inline sono selezioni temporanee del prototipo: non vengono ancora salvate su Aiven né modificano i contratti esistenti.</p><p className="text-xs text-gray-500">Nota: i risultati dipendono dalle date e dagli ID operatore restituiti dalle API. Non rappresentano una certificazione legale della regolarità dei rapporti.</p>
  </main>;
}
