import {TabsContent} from "@/components/ui/tabs";
import {DatiAnagraficiComponent} from "@/pages/components/DatiAnagraficiComponent";
import {DatiGeneraliComponent} from "@/pages/components/DatiGeneraliComponent";
import {NascitaResidenzaComponent} from "@/pages/components/NascitaResidenzaComponent";
import type {OperatoreController} from "@/hooks/dettaglioOperatore/useDettaglioOperatoreController";

export default function OperatoreAnagraficaTab({model}:{model:OperatoreController}){
 const {aggiornaDatiAnagrafici,aggiornaDatiGenerici,aggiornaNascitaResidenza,dipendente,disabilitaDatiAnagrafici,disabilitaDatiGenerali,disabilitaNascitaResidenza,editDatiAnagrafici,editDatiGenerali,editNascitaResidenza,editaDatiAnagrafici,editaDatiGenerali,editaNascitaResidenza,formDatiAnagrafici,formDatiGenerali,formDatiNascitaResidenza,handleChangeDatiAnagrafici,handleChangeDatiGenerali,handleChangeDatiNascitaResidenza}=model;
 return (
<TabsContent value="anagrafica">
                    <div className="flex justify-between items-start">
                        <div className="flex-[0_0_49%]">

                            <DatiAnagraficiComponent
                                editDatiAnagrafici={editDatiAnagrafici}
                                disabilitaDatiAnagrafici={disabilitaDatiAnagrafici}
                                formDatiAnagrafici={formDatiAnagrafici}
                                dipendente={dipendente}
                                editaDatiAnagrafici={editaDatiAnagrafici}
                                aggiornaDatiAnagrafici={aggiornaDatiAnagrafici}
                                handleChangeDatiAnagrafici={handleChangeDatiAnagrafici}
                            />
                            <div className="mt-6">
                                <DatiGeneraliComponent
                                    editDatiGenerali={editDatiGenerali}
                                    disabilitaDatiGenerali={disabilitaDatiGenerali}
                                    formDatiGenerali={formDatiGenerali}
                                    dipendente={dipendente}
                                    editaDatiGenerali={editaDatiGenerali}
                                    aggiornaDatiGenerici={aggiornaDatiGenerici}
                                    handleChangeDatiGenerali={handleChangeDatiGenerali}
                                />
                            </div>
                        </div>

                        <div className="flex-[0_0_49%] flex">
                            <NascitaResidenzaComponent
                                editNascitaResidenza={editNascitaResidenza}
                                disabilitaNascitaResidenza={disabilitaNascitaResidenza}
                                formDatiNascitaResidenza={formDatiNascitaResidenza}
                                dipendente={dipendente}
                                editaNascitaReidenza={editaNascitaResidenza}
                                aggiornaNascitaResidenza={aggiornaNascitaResidenza}
                                handleChangeDatiNascitaResidenza={handleChangeDatiNascitaResidenza}
                            />
                        </div>
                    </div>
                </TabsContent>
 );
}
