import {Fragment} from "react";
import TooltipStatoHR from "@/pages/components/TooltipStatoHR";
import TurniAssegnatiHR from "@/pages/components/TurniAssegnatiHR";
import {formatData,iso,oggi} from "@/utils/hrValutazione";
import {contrattoInVigore} from "@/utils/hrContrattoRestrittivo";
import {AlertCircle,CheckCircle2,ClipboardList,UserRoundCheck} from "lucide-react";
import {useModuloHRAdmin} from "@/hooks/moduloHR/useModuloHRAdmin";

export default function ModuloHR(){
 const {aggiorna,apriSchedaHR,assegnaNuovoPeriodo,assegnando,cambiaTipologia,carica,dateContratto,errore,espanso,filtroPriorita,inlineHR,inoltra,irregolari,loading,nomiEventi,nomiOperatori,periodoVisualizzato,praticaCorrente,progress,ricerca,ricercaEvento,salvaPeriodo,setDateContratto,setEspanso,setFiltroPriorita,setRicerca,setRicercaEvento,tipoSelezionato,visibili}=useModuloHRAdmin();
 return <main className="m-6 space-y-5">
  <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-3xl font-extrabold text-[#007a55]">ADMIN · Assegnazione contratti</h1><p className="text-sm text-gray-500">Scegli tipologia e datore, poi assegna la pratica alla coda HR.</p></div><button className="rounded-md bg-[#007a55] px-4 py-2 text-white disabled:opacity-50" onClick={()=>void carica()} disabled={loading}>{loading?"Caricamento…":"Aggiorna dati"}</button></div>
  {errore&&<div role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-800">{errore}</div>}
  {progress&&<p className="text-sm text-gray-500">{progress}</p>}
  <div className="grid gap-4 sm:grid-cols-2">
   <div className="rounded-xl border border-[#cfe2dc] bg-white p-5"><div className="text-sm font-semibold">Operatori da regolarizzare</div><div className="mt-2 text-3xl font-bold text-[#007a55]">{irregolari.length}</div></div>
   <div className="rounded-xl border border-red-200 bg-red-50/50 p-5"><div className="text-sm font-semibold text-red-800">Urgenti da regolarizzare</div><div className="mt-2 text-3xl font-bold text-red-700">{irregolari.filter(x=>x.livello==="Alta").length}</div></div>
  </div>
    <div className="rounded-xl border bg-white p-4">
   <div className="mb-3 space-y-3"><div className="flex flex-wrap gap-2"><input list="hr-nomi-operatori" aria-label="Cerca operatore" placeholder="Cerca operatore o codice fiscale" value={ricerca} onChange={e=>setRicerca(e.target.value)} className="min-w-[230px] flex-1 rounded-md border px-3 py-2 text-sm"/><datalist id="hr-nomi-operatori">{nomiOperatori.map(n=><option key={n} value={n}/>)}</datalist><input list="hr-nomi-eventi" aria-label="Cerca evento" placeholder="Cerca evento" value={ricercaEvento} onChange={e=>setRicercaEvento(e.target.value)} className="min-w-[230px] flex-1 rounded-md border px-3 py-2 text-sm"/><datalist id="hr-nomi-eventi">{nomiEventi.map(n=><option key={n} value={n}/>)}</datalist></div><div className="flex flex-wrap items-center gap-2">{(["Tutte","Alta","Media","Bassa","Nessuna"] as const).map(v=><button key={v} type="button" aria-pressed={filtroPriorita===v} onClick={()=>setFiltroPriorita(v)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${filtroPriorita===v?"border-[#007a55] bg-[#007a55] text-white":"bg-white text-gray-700"}`}>{v} ({v==="Tutte"?irregolari.length:irregolari.filter(r=>r.livello===v).length})</button>)}<button type="button" onClick={()=>{setRicerca("");setRicercaEvento("");setFiltroPriorita("Tutte");}} className="ml-auto text-xs text-[#007a55] underline">Azzera filtri</button></div></div>
   <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-sm"><thead><tr className="bg-[#ecf3f1] text-left"><th className="p-3">Operatore</th><th className="p-3">Inquadramento</th><th className="p-3">Datore di lavoro</th><th className="p-3">Periodo contratto</th><th className="p-3">Stato</th><th className="p-3">Priorità</th><th className="p-3">Azioni</th></tr></thead><tbody>
    {visibili.map(x=><Fragment key={x.operatore.id}><tr
 className="cursor-pointer border-b transition-colors hover:bg-[#f1f8f5] focus-within:bg-[#f1f8f5]"
 tabIndex={0}
 aria-label={"Apri pratica HR di "+x.operatore.cognome+" "+x.operatore.nome}
 onClick={e=>{if((e.target as HTMLElement).closest("button,input,select,a,textarea,[role=button]"))return;apriSchedaHR(x)}}
 onKeyDown={e=>{if((e.target as HTMLElement)!==e.currentTarget)return;if(e.key==="Enter"||e.key===" "){e.preventDefault();apriSchedaHR(x)}}}
>
      <td className="p-3 font-semibold"><button type="button" aria-expanded={espanso===x.operatore.id} aria-label="Dettagli turni" className="mr-2 text-[#007a55]" onClick={()=>setEspanso(v=>v===x.operatore.id?null:x.operatore.id)}>{espanso===x.operatore.id?"▾":"▸"}</button>{x.operatore.cognome} {x.operatore.nome}</td>
      <td className="p-3"><select className="w-full rounded border bg-white p-2" aria-label="Inquadramento" value={inlineHR[x.operatore.id]?.tipo??praticaCorrente(x)?.tipologia??""} disabled={!!contrattoInVigore(x.contratti)} onChange={e=>aggiorna(x.operatore.id,"tipo",e.target.value)}><option value="">Da assegnare</option><option value="CHIAMATA">Chiamata</option><option value="TEMPO_DETERMINATO">Determinato</option><option value="TEMPO_INDETERMINATO">Indeterminato</option><option value="OCCASIONALE">Occasionale</option><option value="CONSGNA_BENI_FORMAZIONE">Consegna beni e formazione</option><option value="FATTURA">Fattura (senza generatore)</option></select></td>
      <td className="p-3"><select className="w-full rounded border bg-white p-2" aria-label="Datore di lavoro" value={inlineHR[x.operatore.id]?.datore??praticaCorrente(x)?.datore??"DETELDER"} disabled={!!contrattoInVigore(x.contratti)} onChange={e=>aggiorna(x.operatore.id,"datore",e.target.value)}><option value="DETELDER">DETELDER</option><option value="SOCIETA_APPALTO">Società in appalto</option><option value="AUTONOMO_PIVA">Autonomo - P.IVA</option></select></td>
      <td className="p-3"><div className="flex min-w-[210px] flex-col gap-1">
{praticaCorrente(x)?.tipologia==="CHIAMATA"&&praticaCorrente(x)?.stato==="COMPLETATO"?<>
 <span className="text-[11px] text-gray-500">Contratto concluso: {formatData(praticaCorrente(x)?.dataInizio)} – {formatData(praticaCorrente(x)?.dataFine)}</span>
 <span className="text-[11px] font-semibold text-[#315e51]">Nuovo contratto · periodo</span>
</>:praticaCorrente(x)?.stato==="COMPLETATO"?<>
 <span className="text-[11px] text-gray-500">Precedente: {formatData(praticaCorrente(x)?.dataInizio)} – {formatData(praticaCorrente(x)?.dataFine)}</span>
 <span className="text-[11px] font-semibold text-[#315e51]">Nuovo contratto · periodo</span>
</>:<span className="text-[11px] font-semibold text-[#315e51]">Periodo contratto</span>}
<input type="date" aria-label={"Data inizio contratto di "+x.operatore.cognome} className="rounded border bg-white px-1 py-1 text-xs" disabled={praticaCorrente(x)?.stato==="COMPLETATO"&&!!contrattoInVigore(x.contratti)} value={dateContratto[x.operatore.id]?.inizio??(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?"":periodoVisualizzato(x).inizio)} onChange={e=>setDateContratto(p=>({...p,[x.operatore.id]:{inizio:e.target.value,fine:p[x.operatore.id]?.fine??(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?"":periodoVisualizzato(x).fine)}}))}/>
{(tipoSelezionato(x)||praticaCorrente(x)?.tipologia)!=="TEMPO_INDETERMINATO"&&<input type="date" aria-label={"Data fine contratto di "+x.operatore.cognome} className="rounded border bg-white px-1 py-1 text-xs" disabled={praticaCorrente(x)?.stato==="COMPLETATO"&&!!contrattoInVigore(x.contratti)} min={dateContratto[x.operatore.id]?.inizio||(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?undefined:periodoVisualizzato(x).inizio)} value={dateContratto[x.operatore.id]?.fine??(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?"":periodoVisualizzato(x).fine)} onChange={e=>setDateContratto(p=>({...p,[x.operatore.id]:{inizio:p[x.operatore.id]?.inizio??(praticaCorrente(x)?.stato==="COMPLETATO"||cambiaTipologia(x)?"":periodoVisualizzato(x).inizio),fine:e.target.value}}))}/>}
{!cambiaTipologia(x)&&praticaCorrente(x)?.stato!=="COMPLETATO"&&praticaCorrente(x)&&dateContratto[x.operatore.id]&&<button type="button" disabled={assegnando!==null||!!contrattoInVigore(x.contratti)} onClick={()=>void salvaPeriodo(x)} className="rounded border border-[#007a55] px-2 py-1 text-xs font-semibold text-[#007a55]">Salva date</button>}
{!cambiaTipologia(x)&&praticaCorrente(x)?.stato==="COMPLETATO"&&dateContratto[x.operatore.id]?.inizio&&<button type="button" disabled={assegnando!==null||!!contrattoInVigore(x.contratti)} onClick={()=>void assegnaNuovoPeriodo(x)} className="rounded bg-[#007a55] px-2 py-1 text-xs font-semibold text-white">Assegna nuovo periodo a HR</button>}
<span className="text-[10px] text-gray-500">Prossimo turno: {formatData(x.prossimoTurno)}</span>

{x.contratti.filter(c=>c.tipologia==="CHIAMATA").sort((a,b)=>iso(b.dataInizio).localeCompare(iso(a.dataInizio))).slice(0,1).map(c=><span key={c.idContratto} className="text-xs font-medium text-[#007a55]">Contratto padre #{c.idContratto}: {formatData(c.dataInizio)} – {formatData(c.dataFine)}{iso(c.dataInizio)>oggi()?" · decorrenza futura":""}</span>)}
{contrattoInVigore(x.contratti)&&x.turni.some(t=>contrattoInVigore(x.contratti)?.dataFine&&iso(t.dataTurno)>iso(contrattoInVigore(x.contratti)?.dataFine))&&<span className="text-xs font-semibold text-amber-800">Turno oltre scadenza: sola segnalazione fino alla scadenza del contratto attuale</span>}
</div></td>
      <td className="p-3">{x.stato==="Incompleto"?<TooltipStatoHR motivi={x.motivi}/>:<span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${x.stato==="Scaduto"?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`}>{x.stato==="Completo"?<CheckCircle2 className="h-4 w-4"/>:<AlertCircle className="h-4 w-4"/>}{x.stato}</span>}</td>
      <td className="p-3"><span className={x.livello==="Alta"?"font-semibold text-red-700":x.livello==="Media"?"font-semibold text-amber-700":x.livello==="Bassa"?"font-semibold text-emerald-700":"text-gray-500"}>{x.livello}</span></td>
      <td className="p-3"><div className="flex items-center gap-2">
{praticaCorrente(x)&&(praticaCorrente(x)?.stato!=="COMPLETATO"||!!contrattoInVigore(x.contratti))?<>
 <button type="button" onClick={()=>apriSchedaHR(x)} title="Pratica già assegnata all'HR: apri i dettagli" className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#007a55] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#006647] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007a55]"><ClipboardList className="h-4 w-4"/>Apri pratica HR</button>
</>:contrattoInVigore(x.contratti)?<span className="text-xs font-semibold text-amber-800">Contratto in vigore · sola segnalazione</span>:<>
 <button type="button" disabled={assegnando!==null} onClick={()=>void inoltra(x)} className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-[#007a55] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#006647] hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007a55] disabled:opacity-50"><UserRoundCheck className="h-4 w-4"/>{assegnando===x.operatore.id?"Assegnazione…":praticaCorrente(x)?"Assegna nuovo contratto":"Assegna ad HR"}</button>
</>}

</div></td>
    </tr>{espanso===x.operatore.id&&<tr className="bg-[#f5faf8]"><td colSpan={7} className="p-4"><TurniAssegnatiHR turni={x.turni} formatData={formatData}/></td></tr>}</Fragment>)}
    {!visibili.length&&<tr><td colSpan={7} className="p-6 text-center text-gray-500">{loading?"Caricamento…":"Nessun operatore corrisponde ai filtri"}</td></tr>}
   </tbody></table></div>
  </div>
  <p className="text-xs text-amber-700">Le scelte inline vengono salvate nella pratica soltanto dopo «Da elaborare → HR». Nessun contratto viene creato automaticamente.</p>
 </main>;
}
