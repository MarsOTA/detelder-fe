import {TabsContent} from "@/components/ui/tabs";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import {format} from "date-fns";
import {hrAggiornaPeriodo} from "@/utils/hrWorkflow";
import {ContrattoAttivoHR} from "@/pages/components/ContrattoAttivoHR";
import ArchivioContrattiHR from "@/pages/components/ArchivioContrattiHR";
import AzioniHRIntermittenti from "@/pages/components/AzioniHRIntermittenti";
import {ContrattoChiamataComponent} from "@/pages/components/ContrattoChiamataComponent";
import {ContrattoOccasionaleComponent} from "@/pages/components/ContrattoOccasionaleComponent";
import {ConsegnaBeniFormazioneComponent} from "@/pages/components/ConsegnaBeniFormazioneComponent";
import {ContrattoTempoIndeterminatoComponent} from "@/pages/components/ContrattoTempoIndeterminatoComponent";
import {ContrattoTempoDeterminatoComponent} from "@/pages/components/ContrattoTempoDeterminatoComponent";
import type {OperatoreController} from "@/hooks/dettaglioOperatore/useDettaglioOperatoreController";

export default function OperatoreContrattiTab({model}:{model:OperatoreController}){
 const {aggiornamentoAzioniHR,caricaContrattoFirmato,caricaListaContratti,contratti,contrattiPrecedenti,datiMancantiHR,dipendente,dowloadPdf,formConsegnaBeniFormazione,formContrattoChiamata,formContrattoOccasionale,formContrattoOpen,formContrattoTempoDeterminato,formContrattoTempoIndeterminato,generaContrattoChiamata,generaContrattoConsegnaBeniFormazione,generaContrattoOccasionale,generaContrattoTempoDeterminato,generaContrattoTempoIndeterminato,getsioneCancellazioneSingoloContratto,getsioneCancellazioneTuttiContratti,handleChangeConsegnaBeniFormazione,handleChangeContrattoChiamata,handleChangeContrattoOccasionale,handleChangeContrattoTempoDeterminato,handleChangeContrattoTempoIndeterminato,id,loading,praticaHR,puoEseguireChiamate,setAggiornamentoAzioniHR,setFormContrattoChiamata,setFormContrattoOccasionale,setFormContrattoOpen,setFormContrattoTempoDeterminato,setFormContrattoTempoIndeterminato,setPraticaHR,tipoContratto}=model;
 return (
<TabsContent value="contratti" className="space-y-5">
                  <ContrattoAttivoHR
                    contratti={contratti}
                    idOperatore={id}
                    pratica={praticaHR}
                    codiceFiscale={dipendente?.codiceFiscale}
                    datiMancanti={datiMancantiHR}
                    isHR={puoEseguireChiamate}
                    azioni={praticaHR?.tipologia==="CHIAMATA"&&id?(
                      <AzioniHRIntermittenti
                        key={aggiornamentoAzioniHR}
                        idOperatore={Number(id)}
                        readOnly={!puoEseguireChiamate}
                        pratica={praticaHR}
                        contratti={contratti}
                        codiceFiscale={dipendente?.codiceFiscale||""}
                        onCreateContract={()=>setFormContrattoOpen(true)}
                        missingPrerequisites={datiMancantiHR.length>0}
                        createFields={puoEseguireChiamate?<div className="w-full space-y-3 rounded-lg border bg-white p-3">
                          <p className="text-xs text-gray-600">Periodo definito dall'ADMIN: {praticaHR.dataInizio?.slice(0,10)||"—"} – {praticaHR.dataFine?.slice(0,10)||"—"}</p>
                          <label className="block text-xs">Data firma contratto<input type="date" className="mt-1 block w-full rounded border bg-white p-2" value={formContrattoChiamata.dataFirmaContratto?format(formContrattoChiamata.dataFirmaContratto,"yyyy-MM-dd"):""} onChange={e=>setFormContrattoChiamata(v=>({...v,dataFirmaContratto:e.target.value?new Date(e.target.value+"T12:00:00"):null}))}/></label>
                          <div className="grid gap-2 md:grid-cols-2">{(["cittaPredefinita","indirizzoPredefinito","cittaAlternativa","indirizzoAlternativo"] as const).map(k=><label key={k} className="block text-xs">{({cittaPredefinita:"Città sede",indirizzoPredefinito:"Indirizzo sede",cittaAlternativa:"Città alternativa",indirizzoAlternativo:"Indirizzo alternativo"})[k]}<input className="mt-1 block w-full rounded border bg-white p-2" value={formContrattoChiamata[k]} onChange={e=>setFormContrattoChiamata(v=>({...v,[k]:e.target.value}))}/></label>)}</div>
                          <button type="button" disabled={loading||datiMancantiHR.length>0||!praticaHR.dataInizio||!praticaHR.dataFine} onClick={()=>void generaContrattoChiamata()} className="rounded bg-[#007a55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading?"Generazione…":"Genera contratto a chiamata"}</button>
                        </div>:null}
                        onProgressUpdated={()=>setAggiornamentoAzioniHR(x=>x+1)}
                      />
                    ):praticaHR?(
                      contratti.some(c=>c.tipologia.replace(/^CONTRATTO_/,"")===praticaHR.tipologia&&!!praticaHR.dataInizio&&c.dataInizio?.slice(0,10)===praticaHR.dataInizio.slice(0,10))
                      ?null
                      :<div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                        <p className="text-sm font-semibold text-[#273b35]">Crea {praticaHR.tipologia.replace(/_/g," ").toLowerCase()}</p>
                        {praticaHR.tipologia!=="FATTURA"&&window.location.pathname.startsWith("/hr/")&&<div className="w-full space-y-3 rounded-lg border bg-white p-4">
                          <p className="text-xs text-gray-500">Periodo definito dall'ADMIN: {praticaHR.dataInizio?.slice(0,10)||"—"} – {praticaHR.dataFine?.slice(0,10)||"senza scadenza"}</p>
                          {tipoContratto==="OCCASIONALE"&&<label className="block text-sm">Data firma contratto<input type="date" className="mt-1 block w-full rounded border bg-white p-2" value={formContrattoOccasionale.dataFirmaContratto?format(formContrattoOccasionale.dataFirmaContratto,"yyyy-MM-dd"):""} onChange={e=>setFormContrattoOccasionale(v=>({...v,dataFirmaContratto:e.target.value?new Date(e.target.value+"T12:00:00"):null}))}/></label>}
                          {tipoContratto==="CONSGNA_BENI_FORMAZIONE"&&<ConsegnaBeniFormazioneComponent formConsegnaBeniFormazione={formConsegnaBeniFormazione} handleChangeConsegnaBeniFormazione={handleChangeConsegnaBeniFormazione}/>}
                          <button type="button" disabled={loading||datiMancantiHR.length>0||!praticaHR.dataInizio} onClick={()=>void (tipoContratto==="OCCASIONALE"?generaContrattoOccasionale():tipoContratto==="CONTRATTO_TEMPO_DETERMINATO"?generaContrattoTempoDeterminato():tipoContratto==="CONTRATTO_TEMPO_INDETERMINATO"?generaContrattoTempoIndeterminato():tipoContratto==="CONSGNA_BENI_FORMAZIONE"?generaContrattoConsegnaBeniFormazione():Promise.resolve())} className="rounded-md bg-[#007a55] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading?"Generazione…":"Genera contratto"}</button>
                        </div>}
                      </div>
                    ):null}
                    archivioChiamate={praticaHR?.tipologia==="CHIAMATA"&&id?(
                      <AzioniHRIntermittenti
                        key={"archivio-"+aggiornamentoAzioniHR}
                        mode="archive"
                        readOnly={!puoEseguireChiamate}
                        idOperatore={Number(id)}
                        pratica={praticaHR}
                        contratti={contratti}
                        codiceFiscale={dipendente?.codiceFiscale||""}
                        onCreateContract={()=>setFormContrattoOpen(true)}
                      />
                    ):null}
                    onCreate={()=>setFormContrattoOpen(true)}
                    onPeriodSave={async (dataInizio,dataFine)=>{
                      if(!praticaHR)return;
                      await hrAggiornaPeriodo(praticaHR.id,dataInizio,dataFine);
                      setPraticaHR({...praticaHR,dataInizio,dataFine});
                      const date=(value:string|null)=>value?new Date(value+"T12:00:00"):null;
                      setFormContrattoChiamata(old=>({...old,dataInizio:date(dataInizio),dataFine:date(dataFine)}));
                      setFormContrattoOccasionale(old=>({...old,dataInizio:date(dataInizio),dataFine:date(dataFine)}));
                      setFormContrattoTempoDeterminato(old=>({...old,dataInizio:date(dataInizio),dataFine:date(dataFine)}));
                      setFormContrattoTempoIndeterminato(old=>({...old,dataInizio:date(dataInizio),dataFine:date(dataFine)}));
                    }}
                    onDownload={(contractId,kind)=>{void dowloadPdf(contractId,kind)}}
                    onUpload={(event,contractId,kind)=>{void caricaContrattoFirmato(event,contractId,kind)}}
                    onDelete={async(contractId,kind)=>{
                      if(kind==="contratto")await getsioneCancellazioneTuttiContratti(contractId);
                      else await getsioneCancellazioneSingoloContratto(contractId,kind);
                      await caricaListaContratti();
                      setAggiornamentoAzioniHR(x=>x+1);
                    }}

                  />
                  <ArchivioContrattiHR contratti={contrattiPrecedenti} idOperatore={Number(id)} codiceFiscale={dipendente?.codiceFiscale||""} onDownload={(contractId,kind)=>{void dowloadPdf(contractId,kind)}}/>
                  <Dialog open={formContrattoOpen} onOpenChange={setFormContrattoOpen}>
                    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-[780px]">
                      <DialogHeader>
                        <DialogTitle className="text-xl text-[#007a55]">Crea {tipoContratto?tipoContratto.replace(/_/g," ").toLowerCase():"contratto"}</DialogTitle>
                        <DialogDescription>Completa i campi richiesti e genera il documento. Il form riprende tutte le sezioni originali del generatore.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-5">
                        <div className="w-full"> {/* Left side - Event details (40%) */}
                            <div className="text-[26px] font-extrabold font-[800] text-[#007a55] text-center border-b border-[#d8d8d8] pb-2 mb-6">
                                Compila i dati del contratto
                            </div>

                            <div className="mb-4 rounded-lg border border-[#cfe2dc] bg-white p-4">
                                <div className="text-xs font-semibold text-gray-500">Tipologia assegnata dall'ADMIN</div>
                                <div className="mt-1 font-bold text-[#007a55]">{praticaHR?.tipologia?.replace(/_/g," ") || "Nessuna pratica selezionata"}</div>
                                <div className="mt-1 text-sm text-gray-500">Il tipo di contratto non è modificabile dall'HR: per cambiarlo occorre una nuova assegnazione ADMIN.</div>
                            </div>
                            {!praticaHR && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">Apri una pratica dalla coda HR per compilare il contratto assegnato.</p>}
                            {praticaHR && !tipoContratto && <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">La tipologia richiesta non dispone ancora di un form di generazione: chiedere all'ADMIN una tipologia supportata.</p>}


                            {tipoContratto === "CHIAMATA" && (
                                <>
                                    <ContrattoChiamataComponent
                                        formContrattoChiamata={formContrattoChiamata}
                                        handleChangeContrattoChiamata={handleChangeContrattoChiamata}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoChiamata}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading ? "Generazione in corso..." : "GENERA CONTRATTO CHIAMATA"}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {tipoContratto === "OCCASIONALE" && (
                                <>
                                    <ContrattoOccasionaleComponent
                                        formContrattoOccasionale={formContrattoOccasionale}
                                        handleChangeContrattoChiamata={handleChangeContrattoOccasionale}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoOccasionale}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading ? "Generazione in corso..." : "GENERA CONTRATTO OCCASIONALE"}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {tipoContratto === "CONSGNA_BENI_FORMAZIONE" && (
                                <>
                                    <ConsegnaBeniFormazioneComponent
                                        formConsegnaBeniFormazione={formConsegnaBeniFormazione}
                                        handleChangeConsegnaBeniFormazione={handleChangeConsegnaBeniFormazione}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoConsegnaBeniFormazione}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading
                                                ? "Generazione in corso..."
                                                : "GENERA CONTRATTO CONSEGNA BENI"}
                                        </Button>
                                    </div>
                                </>
                            )}

                            {tipoContratto === "CONTRATTO_TEMPO_INDETERMINATO" && (
                                <>
                                    <ContrattoTempoIndeterminatoComponent
                                        formContrattoTempoIndeterminato={formContrattoTempoIndeterminato}
                                        handleChangeContrattoTempoIndeterminato={handleChangeContrattoTempoIndeterminato}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoTempoIndeterminato}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading ? "Generazione in corso..." : "GENERA CONTRATTO TEMPO INDETERMINATO"}
                                        </Button>
                                    </div>
                                </>
                            )}
                            {tipoContratto === "CONTRATTO_TEMPO_DETERMINATO" && (
                                <>
                                    <ContrattoTempoDeterminatoComponent
                                        formContrattoTempoDeterminato={formContrattoTempoDeterminato}
                                        handleChangeContrattoTempoDeterminato={handleChangeContrattoTempoDeterminato}
                                    />

                                    <div className="w-full mt-6">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={generaContrattoTempoDeterminato}
                                            disabled={loading}
                                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                        >
                                            {loading ? "Generazione in corso..." : "GENERA CONTRATTO TEMPO DETERMINATO"}
                                        </Button>
                                    </div>
                                </>
                            )}
                            {/*
                            {tipoContratto === "CHIAMATA" && (
                                <ContrattoChiamataComponent
                                    formContrattoChiamata={formContrattoChiamata}
                                    handleChangeContrattoChiamata={handleChangeContrattoChiamata}
                                />
                            )}

                            {tipoContratto === "OCCASIONALE" && (
                                <ContrattoOccasionaleComponent
                                    formContrattoOccasionale={formContrattoOccasionale}
                                    handleChangeContrattoChiamata={handleChangeContrattoOccasionale}
                                />
                            )}
                            {tipoContratto === "CONSGNA_BENI_FORMAZIONE" && (
                                <ConsegnaBeniFormazioneComponent
                                    formConsegnaBeniFormazione={formConsegnaBeniFormazione}
                                    handleChangeConsegnaBeniFormazione={handleChangeConsegnaBeniFormazione}
                                />
                            )}
                            <div className="w-full mt-6">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => generaContratto()}
                                    className="w-full bg-[#007a55] text-white hover:bg-[#007a55] cursor-pointer"
                                >
                                    {loading ? "Generazione in corso..." : "GENERA CONTRATTO"}
                                </Button>
                            </div>
                            */}
                        </div>

                      </div>
                    </DialogContent>
                  </Dialog>
                </TabsContent>
 );
}
