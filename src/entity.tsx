export interface Evento {
    idEvento: number;
    idCliente: number;
    titoloEvento: string;
    ragioneSociale: string;
    numeroStaffRichiesto: number;
    monteOreTotale: number;
    coperturaOre: number;
    percentualeCopertura: number;
    dataIniziale: Date;
    oraIniziale: string;
    dataFinale: Date;
    oraFinale: string;
}

export interface Dipendente {
  id: number;
  nome: string;
  cognome: string;
  username: string;
  matricola: string;
  email: string;
  prefisso: string;
  telefono: string;
  gpg: boolean;
  stato: string;
  turniAttivi: string;
  nickname: string;
  codiceFiscale: string;
  sesso: string;
  dataNascita: string | null;
  luogoNascita: string;
  provinciaNascita: string;
  statoNascita: string;
  cittadinanza: string;
  indirizzoResidenza: string;
  numeroCivicoResidenza: string;
  comuneResidenza: string;  
  provinciaResidenza: string;  
  capResidenza: string;
  residenzaUgualeDomicilio: boolean;
  indirizzoDomicilio: string;
  numeroCivicoDomicilio: string;
  comuneDomicilio: string;
  provinciaDomicilio: string;
  capDomicilio: string;

  altezza: number | null;
  peso: number | null;

  numeroScarpe: number | null;
  tagliaVestiti: string;
  livelloIstruzione: string;
  tesserino: string; 
  listaMansioni: string[];
}