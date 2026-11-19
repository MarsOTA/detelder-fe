import {IntermittentiDialog} from "./dialog/IntermittentiDialog";
import {NuovaChiamataIntermittenteDialog} from "./dialog/NuovaChiamataIntermittenteDialog";
import {Tabs,TabsList,TabsTrigger} from "@/components/ui/tabs";
import {FileText,UserRound,Paperclip} from "lucide-react";
import {HeaderDipendenteComponent} from "@/pages/components/HeaderDipendenteComponent";
import AllegatiOperatoreTab from "@/pages/components/AllegatiOperatoreTab";
import OperatoreAnagraficaTab from "@/pages/components/OperatoreAnagraficaTab";
import OperatoreContrattiTab from "@/pages/components/OperatoreContrattiTab";
import {useDettaglioOperatoreController} from "@/hooks/dettaglioOperatore/useDettaglioOperatoreController";
export type {TipoContratto} from "./dettaglioOperatore.types";

const DettaglioOperatore = () => {
 const model=useDettaglioOperatoreController();
 const {aggiornaAllegati,aggiornaChiamate,aggiornaDatiAnagrafici,aggiornaDatiGenerici,aggiornaHeader,aggiornaNascitaResidenza,aggiornamentoAzioniHR,allegati,archivioChiamateOpen,caricaContrattoFirmato,caricaDocumento,caricaImmagine,caricaListaContratti,contratti,contrattiPrecedenti,contrattoPadre,dateProposta,datiMancantiHR,dipendente,disabilitaDatiAnagrafici,disabilitaDatiGenerali,disabilitaHeader,disabilitaNascitaResidenza,dowloadAllegato,dowloadPdf,editAllegati,editDatiAnagrafici,editDatiGenerali,editHeader,editNascitaResidenza,editaAllegati,editaDatiAnagrafici,editaDatiGenerali,editaHeader,editaNascitaResidenza,eliminaDocumento,formAllegati,formConsegnaBeniFormazione,formContrattoChiamata,formContrattoOccasionale,formContrattoOpen,formContrattoTempoDeterminato,formContrattoTempoIndeterminato,formDatiAnagrafici,formDatiGenerali,formDatiNascitaResidenza,formHeader,generaContrattoChiamata,generaContrattoConsegnaBeniFormazione,generaContrattoOccasionale,generaContrattoTempoDeterminato,generaContrattoTempoIndeterminato,getsioneCancellazioneSingoloContratto,getsioneCancellazioneTuttiContratti,handleChangeConsegnaBeniFormazione,handleChangeContrattoChiamata,handleChangeContrattoOccasionale,handleChangeContrattoTempoDeterminato,handleChangeContrattoTempoIndeterminato,handleChangeDatiAnagrafici,handleChangeDatiGenerali,handleChangeDatiNascitaResidenza,handleChangeFormAllegati,handleChangeFormHeader,id,imgFiguraIntera,imgMezzoBusto,imgPrimoPiano,listaMansioniHeader,loading,nuovaChiamataOpen,praticaHR,puoEseguireChiamate,searchParams,setAggiornamentoAzioniHR,setArchivioChiamateOpen,setFormContrattoChiamata,setFormContrattoOccasionale,setFormContrattoOpen,setFormContrattoTempoDeterminato,setFormContrattoTempoIndeterminato,setNuovaChiamataOpen,setPraticaHR}=model;
    return (
        <section className="m-6">

            <HeaderDipendenteComponent
                editHeader={editHeader}
                disabilitaHeader={disabilitaHeader}
                dipendente={dipendente}
                imgPrimoPiano={imgPrimoPiano}
                imgFiguraIntera={imgFiguraIntera}
                imgMezzoBusto={imgMezzoBusto}
                listaMansioniHeader={listaMansioniHeader}
                formHeader={formHeader}
                editaHeader={editaHeader}
                aggiornaHeader={aggiornaHeader}
                handleChangeFormHeader={handleChangeFormHeader}
                caricaImmagine={caricaImmagine}
            />

            <Tabs key={searchParams.get("tab")||"contratti"} defaultValue={searchParams.get("tab")||"contratti"}>
                <TabsList className="mb-6 flex h-auto w-full flex-wrap justify-start gap-2 rounded-xl border border-[#cfe2dc] bg-white p-2 shadow-sm">
                    <TabsTrigger value="contratti" className="inline-flex flex-none items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-gray-600 data-[state=active]:bg-[#007a55] data-[state=active]:text-white data-[state=active]:shadow-sm"><FileText className="h-4 w-4"/>Contratti</TabsTrigger>
                    <TabsTrigger value="anagrafica" className="inline-flex flex-none items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-gray-600 data-[state=active]:bg-[#007a55] data-[state=active]:text-white data-[state=active]:shadow-sm"><UserRound className="h-4 w-4"/>Anagrafica</TabsTrigger>
                    <TabsTrigger value="allegati" className="inline-flex flex-none items-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold text-gray-600 data-[state=active]:bg-[#007a55] data-[state=active]:text-white data-[state=active]:shadow-sm"><Paperclip className="h-4 w-4"/>Allegati</TabsTrigger>
                </TabsList>
                <OperatoreAnagraficaTab model={model}/>
                <OperatoreContrattiTab model={model}/>

                

                
                <AllegatiOperatoreTab editAllegati={editAllegati} formAllegati={formAllegati} allegati={allegati} editaAllegati={editaAllegati} aggiornaAllegati={aggiornaAllegati} handleChangeFormAllegati={handleChangeFormAllegati} caricaDocumento={caricaDocumento} dowloadAllegato={dowloadAllegato} eliminaDocumento={eliminaDocumento}/>
            </Tabs>
            <IntermittentiDialog open={archivioChiamateOpen} setOpen={setArchivioChiamateOpen} contrattoPadre={contrattoPadre} operatore={{nome:dipendente?.nome||"",cognome:dipendente?.cognome||"",codiceFiscale:dipendente?.codiceFiscale||""}} idOperatore={Number(id)} onUpdated={()=>void aggiornaChiamate()} />
            <NuovaChiamataIntermittenteDialog open={nuovaChiamataOpen} setOpen={setNuovaChiamataOpen} contrattoPadre={contrattoPadre} operatore={{nome:dipendente?.nome||"",cognome:dipendente?.cognome||"",codiceFiscale:dipendente?.codiceFiscale||""}} idOperatore={Number(id)} onSaved={()=>{void aggiornaChiamate();setAggiornamentoAzioniHR(x=>x+1)}} dataInizioProposta={dateProposta?.inizio} dataFineProposta={dateProposta?.fine} />
        </section>
    )
}

export default DettaglioOperatore;
