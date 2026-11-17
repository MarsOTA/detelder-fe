// Tipi dei form, contratti e documenti dell'operatore.
export interface FormDatiAnagrafici {
    nickname: string;
    nome: string;
    cognome: string;
    matricola: string;
    email: string;
    prefisso: string;
    telefono: string;
    codiceFiscale: string;
    sesso: string;
    dataNascita: Date | null;
    luogoNascita: string;
    provinciaNascita: string;
    statoNascita: string;
    cittadinanza: string;
}

export interface FormNascitaResidenza {
    indirizzoResidenza: string;
    numeroCivicoResidenza: string;
    comuneResidenza: string;
    provinciaResidenza: string;
    capResidenza: string;
    residenzaUgualeDomicilio: boolean
    indirizzoDomicilio: string;
    numeroCivicoDomicilio: string;
    comuneDomicilio: string;
    provinciaDomicilio: string;
    capDomicilio: string;
}

export interface FormDatiGenerali {
    altezza: number | null;
    peso: number | null;
    numeroScarpe: number | null;
    tagliaVestiti: string;
    livelloIstruzione: string;
    tesserino: string;
}

export interface FormContratto {
    //  qualifica: string;
    dataInizio: Date | null;
    dataFine: Date | null;
    dataFirmaContratto: Date | null;
    //  listaMansioni: string[];
    //  compensoTotaleLordo: number;
    cittaPredefinita: string;
    indirizzoPredefinito: string;
    cittaAlternativa: string;
    indirizzoAlternativo: string;
    //  giorniPeriodoProva: number;
}

export interface FormContrattoOccasionale {
    dataInizio: Date | null;
    dataFine: Date | null;
    dataFirmaContratto: Date | null;
}

export interface FormContrattoTempoIndeterminato {
    dataInizio: Date | null;
    dataFine: Date | null;
}

export interface FormContrattoTempoDeterminato {
    dataInizio: Date | null;
    dataFine: Date | null;
}

export interface FormHeader {
    listaMansioni: string[];
}

export interface FormAllegati {
    cartaIdentitaNdocumento: string;
    cartaIdentitaDataScadenza: Date | null;
    tesseraSanitariaNdocumento: string;
    tesseraSanitariaDataScadenza: Date | null;
    permessoSoggiornoNdocumento: string;
    permessoSoggiornoDataScadenza: Date | null;
    antincendioLivello: string;
    antincendioDataConseguimento: Date | null;
    primoSoccorsoLivello: string;
    primoSoccorsoDataConseguimento: Date | null;
    passaportoNdocumento: string;
    passaportoDataScadenza: Date | null;
    formazioneSicurezzaLavoroLivello: string;
    formazioneSicurezzaLavoroDataConseguimento: Date | null;
    blsdLivello: string;
    blsdDataConseguimento: Date | null;
    attestatoPrepostoLivello: string;
    attestatoPrepostoDataConseguimento: Date | null;
    attestatoSecurityManagerDataConseguimento: Date | null;
    attestatoIdoneitaVisitaMedicaDataConseguimento: Date | null;
    attestatoAddettoServiziControlloDataConseguimento: Date | null;
}

export interface FormConsegnaBeniFormazione {
    elencoContenutiFormazione: string;
    elencoBeniStrumentali: string;
}

export type TipoContratto = "CHIAMATA" | "OCCASIONALE" | "CONSGNA_BENI_FORMAZIONE" | "CONTRATTO_TEMPO_INDETERMINATO" | "CONTRATTO_TEMPO_DETERMINATO";

export interface ContrattoBase {
    idContratto: number;
    idOperatore: number;
    tipologia: TipoContratto;
}

export interface Contratto extends ContrattoBase {
    dataInizio: string | null;
    dataFine: string | null;
    dataFirmaContratto: string | null;
    listaMansioni: string[];
    compensoTotaleLordo: number;
    pathContrattoFirmato: string;
    pathContrattoUnilav: string;
    cittaAlternativa: string;
    indirizzoAlternativo: string;
    cittaPredefinita: string;
    indirizzoPredefinito: string;
}

export interface Allegati {
    cartaIdentitaNdocumento: string;
    cartaIdentitaDataScadenza: string;
    cartaIdentitaImgFronte: string;
    cartaIdentitaImgRetro: string;
    tesseraSanitariaNdocumento: string;
    tesseraSanitariaDataScadenza: string;
    tesseraSanitariaImgFronte: string;
    tesseraSanitariaImgRetro: string;
    permessoSoggiornoNdocumento: string;
    permessoSoggiornoDataScadenza: string;
    permessoSoggiornoImgFronte: string;
    permessoSoggiornoImgRetro: string;
    antincendioLivello: string;
    antincendioDataConseguimento: string;
    antincendioDocFronte: string;
    antincendioDocRetro: string;
    primoSoccorsoLivello: string;
    primoSoccorsoDataConseguimento: string;
    primoSoccorsoAttestatoFronte: string;
    primoSoccorsoAttestatoRetro: string;
    passaportoNdocumento: string;
    passaportoDataScadenza: string;
    passaportoImgFronte: string;
    passaportoImgRetro: string;
    formazioneSicurezzaLavoroLivello: string;
    formazioneSicurezzaLavoroDataConseguimento: string;
    formazioneSicurezzaLavoroAttestatoFronte: string;
    formazioneSicurezzaLavoroAttestatoRetro: string;
    blsdLivello: string;
    blsdDataConseguimento: string;
    blsdAttestatoFronte: string;
    blsdAttestatoRetro: string;
    attestatoPrepostoLivello: string;
    attestatoPrepostoDataConseguimento: string;
    attestatoPrepostoFronte: string;
    attestatoPrepostoRetro: string;
    attestatoSecurityManagerDataConseguimento: string;
    attestatoSecurityManagerFronte: string;
    attestatoIdoneitaVisitaMedicaDataConseguimento: string;
    attestatoIdoneitaVisitaMedicaFronte: string
    attestatoAddettoServiziControlloDataConseguimento: string
    attestatoAddettoServiziControlloFronte: string
    attestatoIndoneitaTecnicaAntincendioFronte: string
}


export interface ContrattoConsegnaBeniFormazione extends ContrattoBase { }


export type ContrattoPayload =
    | Contratto
    | ContrattoConsegnaBeniFormazione;

export interface ImageData {
    url: string | null;
    extension: string | null;
}

