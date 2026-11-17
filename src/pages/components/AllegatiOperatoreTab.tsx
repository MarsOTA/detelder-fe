import type {ChangeEvent} from "react";
import {Button} from "@/components/ui/button";
import {LockKeyhole,LockKeyholeOpen} from "lucide-react";
import {TabsContent} from "@/components/ui/tabs";
import {TypeCardAComponent} from "./TypeCardAComponent";
import {TypeCardBComponent} from "./TypeCardBComponent";
import {TypeCardCComponent} from "./TypeCardCComponent";
import {TypeCardDComponent} from "./TypeCardDComponent";
import type {FormAllegati,Allegati} from "../admin/dettaglioOperatore.types";

// Props only: document mutations remain in the parent page.
type Props={
 editAllegati:boolean;
 formAllegati:FormAllegati;
 allegati?:Allegati;
 editaAllegati:()=>void;
 aggiornaAllegati:()=>void;
 handleChangeFormAllegati:(key:string,value:string|Date|null)=>void;
 caricaDocumento:(event:ChangeEvent<HTMLInputElement>,tipo:string)=>void;
 dowloadAllegato:(tipo:string)=>void;
 eliminaDocumento:(tipo:string)=>void;
};
export default function AllegatiOperatoreTab({
 editAllegati,formAllegati,allegati,editaAllegati,aggiornaAllegati,
 handleChangeFormAllegati,caricaDocumento,dowloadAllegato,eliminaDocumento
}:Props){
 return (<TabsContent value="allegati">
                    <div className="rounded-[9px] shadow-[0_2px_4px_0_rgba(168,166,166,0.5)] p-6 mb-6">
                        {/* ACTION BUTTON */}
                        <div className="flex items-center justify-end">
                            {editAllegati ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={aggiornaAllegati}
                                >
                                    <LockKeyholeOpen className="h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={editaAllegati}
                                >
                                    <LockKeyhole className="h-4 w-4" />
                                </Button>
                            )}
                        </div>



                        <div className="grid grid-cols-2 gap-6">


                            <TypeCardAComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                numdocumentoKey="cartaIdentitaNdocumento"
                                numdocumentoValue={formAllegati?.cartaIdentitaNdocumento ?? ""}
                                numeroDocumento={allegati?.cartaIdentitaNdocumento ?? ""}

                                dataScadenzaKey="cartaIdentitaDataScadenza"
                                dataScadenzaValue={
                                    formAllegati?.cartaIdentitaDataScadenza
                                        ? new Date(formAllegati.cartaIdentitaDataScadenza)
                                        : null
                                }
                                dataScadenza={
                                    allegati?.cartaIdentitaDataScadenza
                                        ? new Date(allegati.cartaIdentitaDataScadenza)
                                        : null
                                }

                                tipoFronte="carta_identita_img_fronte"
                                tipoRetro="carta_identita_img_retro"
                                imgFronte={allegati?.cartaIdentitaImgFronte ?? null}
                                imgRetro={allegati?.cartaIdentitaImgRetro ?? null}

                                titoloDocumento="Carta d'Identità"
                            />


                            <TypeCardAComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                numdocumentoKey="tesseraSanitariaNdocumento"
                                numdocumentoValue={formAllegati?.tesseraSanitariaNdocumento ?? ""}
                                numeroDocumento={allegati?.tesseraSanitariaNdocumento ?? ""}

                                dataScadenzaKey="tesseraSanitariaDataScadenza"
                                dataScadenzaValue={
                                    formAllegati?.tesseraSanitariaDataScadenza
                                        ? new Date(formAllegati.tesseraSanitariaDataScadenza)
                                        : null
                                }
                                dataScadenza={
                                    allegati?.tesseraSanitariaDataScadenza
                                        ? new Date(allegati.tesseraSanitariaDataScadenza)
                                        : null
                                }

                                tipoFronte="tessera_sanitaria_img_fronte"
                                tipoRetro="tessera_sanitaria_img_retro"
                                imgFronte={allegati?.tesseraSanitariaImgFronte ?? null}
                                imgRetro={allegati?.tesseraSanitariaImgRetro ?? null}

                                titoloDocumento="Tessera sanitaria"
                            />

                            <TypeCardAComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                numdocumentoKey="passaportoNdocumento"
                                numdocumentoValue={formAllegati?.passaportoNdocumento ?? ""}
                                numeroDocumento={allegati?.passaportoNdocumento ?? ""}

                                dataScadenzaKey="passaportoDataScadenza"
                                dataScadenzaValue={
                                    formAllegati?.passaportoDataScadenza
                                        ? new Date(formAllegati.passaportoDataScadenza)
                                        : null
                                }
                                dataScadenza={
                                    allegati?.passaportoDataScadenza
                                        ? new Date(allegati.passaportoDataScadenza)
                                        : null
                                }

                                tipoFronte="passaporto_img_fronte"
                                tipoRetro="passaporto_img_retro"
                                imgFronte={allegati?.passaportoImgFronte ?? null}
                                imgRetro={allegati?.passaportoImgRetro ?? null}

                                titoloDocumento="Passaporto"
                            />

                            <TypeCardAComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                numdocumentoKey="permessoSoggiornoNdocumento"
                                numdocumentoValue={formAllegati?.permessoSoggiornoNdocumento ?? ""}
                                numeroDocumento={allegati?.permessoSoggiornoNdocumento ?? ""}

                                dataScadenzaKey="permessoSoggiornoDataScadenza"
                                dataScadenzaValue={
                                    formAllegati?.permessoSoggiornoDataScadenza
                                        ? new Date(formAllegati.permessoSoggiornoDataScadenza)
                                        : null
                                }
                                dataScadenza={
                                    allegati?.permessoSoggiornoDataScadenza
                                        ? new Date(allegati.permessoSoggiornoDataScadenza)
                                        : null
                                }

                                tipoFronte="permesso_soggiorno_img_fronte"
                                tipoRetro="permesso_soggiorno_img_retro"
                                imgFronte={allegati?.permessoSoggiornoImgFronte ?? null}
                                imgRetro={allegati?.permessoSoggiornoImgRetro ?? null}

                                titoloDocumento="Permesso di Soggiorno"
                            />

                            <TypeCardBComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                livelloKey="antincendioLivello"
                                livelloValue={formAllegati?.antincendioLivello ?? ""}
                                livello={allegati?.antincendioLivello ?? ""}
                                items={[
                                    { value: "L.1: 4h. ex risc.basso", label: "L.1: 4h. ex risc.basso" },
                                    { value: "L.2: 8h. ex risc.medio", label: "L.2: 8h. ex risc.medio" },
                                    { value: "L.3: 16h. ex risc.alto", label: "L.3: 16h. ex risc.alto" },
                                    { value: "L.3 + idoneità tecnica", label: "L.3 + idoneità tecnica" },
                                ]}

                                dataConseguimentoKey="antincendioDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.antincendioDataConseguimento
                                        ? new Date(formAllegati.antincendioDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.antincendioDataConseguimento
                                        ? new Date(allegati.antincendioDataConseguimento)
                                        : null
                                }

                                tipoFronte="antincendio_doc_fronte"
                                //   tipoRetro="antincendio_doc_retro"
                                imgFronte={allegati?.antincendioDocFronte ?? null}
                                //   imgRetro={allegati?.antincendioDocRetro ?? null}

                                titoloDocumento="Attestato Antincendio"
                            />

                            <TypeCardDComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}
                                tipoFronte="attestato_indoneita_tecnica_antincendio_fronte"
                                imgFronte={allegati?.attestatoIndoneitaTecnicaAntincendioFronte ?? null}

                                titoloDocumento="Attestato  indoneità tecnica antincendio"
                            />

                            <TypeCardBComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                livelloKey="primoSoccorsoLivello"
                                livelloValue={formAllegati?.primoSoccorsoLivello ?? ""}
                                livello={allegati?.primoSoccorsoLivello ?? ""}
                                items={[
                                    { value: "Gruppo A: 16h.", label: "Gruppo A: 16h." },
                                    { value: "Gruppo B e C: 12h.", label: "Gruppo B e C: 12h." },
                                ]}

                                dataConseguimentoKey="primoSoccorsoDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.primoSoccorsoDataConseguimento
                                        ? new Date(formAllegati.primoSoccorsoDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.primoSoccorsoDataConseguimento
                                        ? new Date(allegati.primoSoccorsoDataConseguimento)
                                        : null
                                }

                                tipoFronte="primo_soccorso_attestato_fronte"
                                //   tipoRetro="primo_soccorso_attestato_retro"
                                imgFronte={allegati?.primoSoccorsoAttestatoFronte ?? null}
                                //   imgRetro={allegati?.primoSoccorsoAttestatoRetro ?? null}

                                titoloDocumento="Attestato primo soccorso"
                            />

                            <TypeCardBComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                livelloKey="formazioneSicurezzaLavoroLivello"
                                livelloValue={formAllegati?.formazioneSicurezzaLavoroLivello ?? ""}
                                livello={allegati?.formazioneSicurezzaLavoroLivello ?? ""}
                                items={[
                                    { value: "Generale 4h.", label: "Generale 4h." },
                                    { value: "Rischio Bas.: Gen.4h.+Risc.spec.4h.", label: "Rischio Bas.: Gen.4h.+Risc.spec.4h." },
                                    { value: "Rischio Med.: Gen.4h.+Risc.spec.8h.", label: "Rischio Med.: Gen.4h.+Risc.spec.8h." },
                                    { value: "Rischio Alto: Gen.4h.+Risc.spec.12h.", label: "Rischio Alto: Gen.4h.+Risc.spec.12h." },
                                ]}

                                dataConseguimentoKey="formazioneSicurezzaLavoroDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.formazioneSicurezzaLavoroDataConseguimento
                                        ? new Date(formAllegati.formazioneSicurezzaLavoroDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.formazioneSicurezzaLavoroDataConseguimento
                                        ? new Date(allegati.formazioneSicurezzaLavoroDataConseguimento)
                                        : null
                                }

                                tipoFronte="formazione_sicurezza_lavoro_attestato_fronte"
                                //   tipoRetro="formazione_sicurezza_lavoro_attestato_retro"
                                imgFronte={allegati?.formazioneSicurezzaLavoroAttestatoFronte ?? null}
                                //   imgRetro={allegati?.formazioneSicurezzaLavoroAttestatoRetro ?? null}

                                titoloDocumento="Attestato formazione sicurezza sul lavoro"
                            />

                            <TypeCardBComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                livelloKey="blsdLivello"
                                livelloValue={formAllegati?.blsdLivello ?? ""}
                                livello={allegati?.blsdLivello ?? ""}
                                items={[
                                    { value: "Base", label: "Base" },
                                    { value: "Aggiornamento", label: "Aggiornamento" },
                                ]}

                                dataConseguimentoKey="blsdDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.blsdDataConseguimento
                                        ? new Date(formAllegati.blsdDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.blsdDataConseguimento
                                        ? new Date(allegati.blsdDataConseguimento)
                                        : null
                                }

                                tipoFronte="blsd_attestato_fronte"
                                //  tipoRetro="blsd_attestato_retro"
                                imgFronte={allegati?.blsdAttestatoFronte ?? null}
                                //  imgRetro={allegati?.blsdAttestatoRetro ?? null}

                                titoloDocumento="Attestato BLSD"
                            />

                            <TypeCardCComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                //livelloKey="attestatoPrepostoLivello"
                                //livelloValue={formAllegati?.attestatoPrepostoLivello ?? ""}
                                //livello={allegati?.attestatoPrepostoLivello ?? ""}

                                // items={[
                                //    { value: "Base", label: "Base" },
                                //    { value: "Aggiornamento", label: "Aggiornamento" },
                                // ]}

                                dataConseguimentoKey="attestatoPrepostoDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.attestatoPrepostoDataConseguimento
                                        ? new Date(formAllegati.attestatoPrepostoDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.attestatoPrepostoDataConseguimento
                                        ? new Date(allegati.attestatoPrepostoDataConseguimento)
                                        : null
                                }

                                tipoFronte="attestato_preposto_fronte"
                                // tipoRetro="attestato_preposto_retro"
                                imgFronte={allegati?.attestatoPrepostoFronte ?? null}
                                // imgRetro={allegati?.attestatoPrepostoRetro ?? null}

                                titoloDocumento="Attestato Preposto"
                            />

                            <TypeCardCComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                dataConseguimentoKey="attestatoSecurityManagerDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.attestatoSecurityManagerDataConseguimento
                                        ? new Date(formAllegati.attestatoSecurityManagerDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.attestatoSecurityManagerDataConseguimento
                                        ? new Date(allegati.attestatoSecurityManagerDataConseguimento)
                                        : null
                                }

                                tipoFronte="attestato_security_manager_fronte"
                                imgFronte={allegati?.attestatoSecurityManagerFronte ?? null}

                                titoloDocumento="Security Manager"
                            />

                            <TypeCardCComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                dataConseguimentoKey="attestatoIdoneitaVisitaMedicaDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.attestatoIdoneitaVisitaMedicaDataConseguimento
                                        ? new Date(formAllegati.attestatoIdoneitaVisitaMedicaDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.attestatoIdoneitaVisitaMedicaDataConseguimento
                                        ? new Date(allegati.attestatoIdoneitaVisitaMedicaDataConseguimento)
                                        : null
                                }
                                tipoFronte="attestato_idoneita_visita_medica_fronte"
                                imgFronte={allegati?.attestatoIdoneitaVisitaMedicaFronte ?? null}

                                titoloDocumento="Avvenuta Idoneità alla mansione/visita medica"
                            />

                            <TypeCardCComponent
                                editAllegati={editAllegati}
                                handleChangeFormAllegati={handleChangeFormAllegati}
                                caricaDocumento={caricaDocumento}
                                dowloadAllegato={dowloadAllegato}
                                eliminaDocumento={eliminaDocumento}

                                dataConseguimentoKey="attestatoAddettoServiziControlloDataConseguimento"
                                dataConseguimentoValue={
                                    formAllegati?.attestatoAddettoServiziControlloDataConseguimento
                                        ? new Date(formAllegati.attestatoAddettoServiziControlloDataConseguimento)
                                        : null
                                }
                                dataConseguimento={
                                    allegati?.attestatoAddettoServiziControlloDataConseguimento
                                        ? new Date(allegati.attestatoAddettoServiziControlloDataConseguimento)
                                        : null
                                }
                                tipoFronte="attestato_addetto_servizi_controllo_fronte"
                                imgFronte={allegati?.attestatoAddettoServiziControlloFronte ?? null}

                                titoloDocumento="Attestato addetto servizi controllo"
                            />

                        </div>

                    </div>


                </TabsContent>);
}
