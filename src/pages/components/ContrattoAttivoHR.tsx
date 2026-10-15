import { useEffect, useState } from "react";
import { LockKeyhole, LockKeyholeOpen, Save, X } from "lucide-react";
import type { HRPratica } from "@/utils/hrWorkflow";

type TipoDatore = "DETELDER" | "SOCIETA_APPALTO" | "AUTONOMO_PIVA";
type Dettagli = { datore: TipoDatore; pagaDiurna: string; pagaNotturna: string; codiceUnilav: string };
export type ContrattoSintesiHR = { idContratto: number; tipologia: string; dataInizio: string | null; dataFine: string | null; pathContrattoUnilav?: string | null };
const DEFAULT: Dettagli = { datore:"DETELDER", pagaDiurna:"", pagaNotturna:"", codiceUnilav:"" };
const labelDatore: Record<TipoDatore,string> = { DETELDER:"DETELDER", SOCIETA_APPALTO:"Società in appalto", AUTONOMO_PIVA:"Autonomo - P.IVA" };
const iso = (v: string | null) => v ? v.slice(0,10) : "";
const fmt = (v: string | null) => {const x=iso(v);return /^\d{4}-\d{2}-\d{2}$/.test(x) ? x.slice(8,10)+"/"+x.slice(5,7)+"/"+x.slice(0,4) : "—";};
const oggi = () => {const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");};
export function ContrattoAttivoHR({ contratti, idOperatore, pratica }: { contratti: ContrattoSintesiHR[]; idOperatore: string | undefined; pratica?: HRPratica | null }) {
  const today = oggi();
  const attivo = [...contratti].filter(c=>c.dataInizio && iso(c.dataInizio)<=today && (!c.dataFine || iso(c.dataFine)>=today)).sort((a,b)=>iso(b.dataInizio).localeCompare(iso(a.dataInizio)))[0];
  const key = attivo ? `detelder-hr-draft:${idOperatore ?? "unknown"}:${attivo.idContratto}` : "";
  const [modifica,setModifica]=useState(false);
  const [dati,setDati]=useState<Dettagli>(DEFAULT);
  const [bozza,setBozza]=useState<Dettagli>(DEFAULT);
  useEffect(()=>{
    let saved=DEFAULT;
    try { const raw=key ? localStorage.getItem(key) : null; if(raw) saved={...DEFAULT,...JSON.parse(raw)}; } catch { /* bozza assente */ }
    setDati(saved);setBozza(saved);setModifica(false);
  },[key]);
  const set = (k:keyof Dettagli,v:string)=>setBozza(p=>({...p,[k]:v}));
  const save = () => {if(!key)return;try {localStorage.setItem(key,JSON.stringify(bozza));setDati(bozza);setModifica(false);}catch{ /* errore di scrittura, lasciare modifica aperta */ }};
  if (!attivo) return <section className="mb-5 rounded-xl border border-[#cfe2dc] bg-[#ecf3f1] p-5">
    <h2 className="text-xl font-bold text-[#007a55]">{pratica?"Contratto richiesto dall’ADMIN":"Contratto attivo"}</h2>
    {pratica?<div className="mt-3 grid gap-3 rounded-lg bg-white p-4 sm:grid-cols-3">
      <div><div className="text-xs text-gray-500">Tipologia assegnata</div><div className="font-semibold">{pratica.tipologia.replace(/_/g," ")}</div></div>
      <div><div className="text-xs text-gray-500">Datore di lavoro</div><div className="font-semibold">{labelDatore[pratica.datore as TipoDatore]||pratica.datore}</div></div>
      <div><div className="text-xs text-gray-500">Periodo richiesto</div><div className="font-semibold">{fmt(pratica.dataInizio)} → {fmt(pratica.dataFine)}</div></div>
      <p className="sm:col-span-3 text-sm text-amber-800">Pratica {pratica.stato.replace(/_/g," ").toLowerCase()}. Il contratto deve ancora essere generato o collegato: l'assegnazione non equivale a un contratto attivo.</p>
    </div>:<p className="mt-2 text-sm">Nessun contratto attivo alla data odierna.</p>}
  </section>;
  const incompleto:string[]=[];
  if(!attivo.pathContrattoUnilav) incompleto.push("Documento UNILAV non caricato");
  if(!dati.codiceUnilav.trim()) incompleto.push("Codice comunicazione UNILAV mancante");
  const input="mt-1 w-full rounded-md border border-[#b7d7cc] bg-white px-3 py-2 text-sm";
  return <section className="mb-5 rounded-xl border border-[#cfe2dc] bg-[#ecf3f1] p-5">
    {pratica&&<div className="mb-3 rounded-md border border-[#b7d7cc] bg-white p-3 text-sm">
      <strong>Assegnazione ADMIN:</strong> {pratica.tipologia.replace(/_/g," ")} · {labelDatore[pratica.datore as TipoDatore]||pratica.datore} · Stato {pratica.stato.replace(/_/g," ").toLowerCase()}
      <p className="mt-1 text-xs text-gray-600">I dati assegnati sono la richiesta HR, non modificano il contratto già registrato.</p>
    </div>}
    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3"><h2 className="text-xl font-bold text-[#007a55]">Contratto attivo</h2><span className={`rounded-full px-3 py-1 text-xs font-semibold ${incompleto.length?"bg-amber-100 text-amber-800":"bg-emerald-100 text-emerald-800"}`}>{incompleto.length?"INCOMPLETO":"In corso"}</span></div>
      <button type="button" className="flex items-center gap-2 rounded-md border border-[#b7d7cc] bg-white px-3 py-2 text-sm text-[#315e51]" onClick={()=>{setBozza(dati);setModifica(v=>!v);}}>{modifica?<LockKeyholeOpen className="h-4 w-4"/>:<LockKeyhole className="h-4 w-4"/>}{modifica?"Modifica aperta":"Sblocca modifica"}</button>
    </div>
    {incompleto.length>0 && <p className="mb-3 text-sm text-amber-800">Motivo: {incompleto.join(" · ")}</p>}
    <div className="grid gap-4 rounded-lg bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm"><span className="text-gray-500">Datore di lavoro</span>{modifica?<select className={input} value={bozza.datore} onChange={e=>set("datore",e.target.value)}><option value="DETELDER">DETELDER</option><option value="SOCIETA_APPALTO">Società in appalto</option><option value="AUTONOMO_PIVA">Autonomo - P.IVA</option></select>:<div className="mt-1 font-semibold">{labelDatore[dati.datore]}</div>}</label>
      <div className="text-sm"><div className="text-gray-500">Tipo contratto</div><div className="mt-1 font-semibold">{attivo.tipologia.replace(/_/g," ")}</div></div>
      {([["pagaDiurna","Paga oraria diurna"],["pagaNotturna","Paga oraria notturna"]] as const).map(([k,label])=><label key={k} className="text-sm"><span className="text-gray-500">{label}</span>{modifica?<input className={input} type="number" min="0" step="0.01" placeholder="€ / h" value={bozza[k]} onChange={e=>set(k,e.target.value)}/>:<div className="mt-1 font-semibold">{dati[k] ? `€ ${dati[k]} / h` : "Da compilare"}</div>}</label>)}
      <label className="text-sm"><span className="text-gray-500">Codice comunicazione UNILAV</span>{modifica?<input className={input} value={bozza.codiceUnilav} onChange={e=>set("codiceUnilav",e.target.value)} placeholder="Codice comunicazione"/>:<div className="mt-1 font-semibold">{dati.codiceUnilav||"Mancante"}</div>}</label>
      <div className="text-sm"><div className="text-gray-500">Validità</div><div className="mt-1 font-semibold">{fmt(attivo.dataInizio)} → {attivo.dataFine?fmt(attivo.dataFine):"Senza scadenza"}</div></div>
    </div>
    {modifica&&<div className="mt-3 flex flex-wrap justify-end gap-2"><button className="flex items-center gap-1 rounded-md border px-3 py-2 text-sm" onClick={()=>{setBozza(dati);setModifica(false);}}><X className="h-4 w-4"/>Annulla</button><button className="flex items-center gap-1 rounded-md bg-[#007a55] px-3 py-2 text-sm text-white" onClick={save}><Save className="h-4 w-4"/>Salva bozza locale</button></div>}
    <p className="mt-2 text-xs text-gray-600">Prototipo: le modifiche ai dati HR vengono salvate solo in questo browser e non nel database Aiven. L'UNILAV resta incompleto finché manca il documento caricato.</p>
  </section>;
}
