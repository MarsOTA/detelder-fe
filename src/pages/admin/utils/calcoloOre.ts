type Turno = {
    dataTurno: Date | undefined
    oraInizio: string;
    oraFine: string;
    tipologiaTurno: string;
    tipoMansione: string;
    orePausa: string;
    operatore: string;
};

type TurnoEvento = {
    idTurno: number
    idOperatore: number | null;
    nomeOperatore: string
    cognomeOperatore: string
    dataTurno: Date | undefined
    oraInizio: string
    oraFine: string
    tipologiaTurno: string
    tipoMansione: string
    orePausa: number | string
    teamLeader: number
    noteTurno: string
    invioNotifica: boolean
    infoEvento: {
        titoloEvento: string
        indirizzoEvento: string
    }
}

export function calcolaTotaleOreTurnoEvento(turni: TurnoEvento[]): string {
    if (!Array.isArray(turni)) return "00:00";

    const totaleMinuti = turni.reduce((somma, turno) => {
        if (!turno.oraInizio || !turno.oraFine) return somma;

        const [hInizio, mInizio] = turno.oraInizio.split(":").map(Number);
        const [hFine, mFine] = turno.oraFine.split(":").map(Number);

        const minutiInizio = hInizio * 60 + mInizio;
        let minutiFine = hFine * 60 + mFine;

        if (minutiFine < minutiInizio) {
            minutiFine += 24 * 60;
        }

        return somma + (minutiFine - minutiInizio);
    }, 0);

    const ore = Math.floor(totaleMinuti / 60);
    const minuti = totaleMinuti % 60;

    return `${String(ore).padStart(2, "0")}:${String(minuti).padStart(2, "0")}`;
}

export function calcolaTotaleOre(turni: Turno[]): string {
    if (!Array.isArray(turni)) return "00:00";

    const totaleMinuti = turni.reduce((somma, turno) => {
        if (!turno.oraInizio || !turno.oraFine) return somma;

        const [hInizio, mInizio] = turno.oraInizio.split(":").map(Number);
        const [hFine, mFine] = turno.oraFine.split(":").map(Number);

        const minutiInizio = hInizio * 60 + mInizio;
        let minutiFine = hFine * 60 + mFine;

        if (minutiFine < minutiInizio) {
            minutiFine += 24 * 60;
        }

        return somma + (minutiFine - minutiInizio);
    }, 0);

    const ore = Math.floor(totaleMinuti / 60);
    const minuti = totaleMinuti % 60;

    return `${String(ore).padStart(2, "0")}:${String(minuti).padStart(2, "0")}`;
}


export function calcolaTotaleOreLavorate(turni: Turno[]): string {
    if (!Array.isArray(turni)) return "00:00";

    const totaleMinuti = turni.reduce((somma, turno) => {
        if (!turno.operatore || !turno.oraInizio || !turno.oraFine) return somma;

        const [hInizio, mInizio] = turno.oraInizio.split(":").map(Number);
        const [hFine, mFine] = turno.oraFine.split(":").map(Number);

        const minutiInizio = hInizio * 60 + mInizio;
        let minutiFine = hFine * 60 + mFine;

        if (minutiFine < minutiInizio) {
            minutiFine += 24 * 60;
        }

        return somma + (minutiFine - minutiInizio);
    }, 0);

    const ore = Math.floor(totaleMinuti / 60);
    const minuti = totaleMinuti % 60;

    return `${String(ore).padStart(2, "0")}:${String(minuti).padStart(2, "0")}`;
}

export function calcolaTotaleOreLavorateTurnoEvento(turni: TurnoEvento[]): string {
    if (!Array.isArray(turni)) return "00:00";

    const totaleMinuti = turni.reduce((somma, turno) => {
        if (!turno.idOperatore || !turno.oraInizio || !turno.oraFine) return somma;

        const [hInizio, mInizio] = turno.oraInizio.split(":").map(Number);
        const [hFine, mFine] = turno.oraFine.split(":").map(Number);

        const minutiInizio = hInizio * 60 + mInizio;
        let minutiFine = hFine * 60 + mFine;

        if (minutiFine < minutiInizio) {
            minutiFine += 24 * 60;
        }

        return somma + (minutiFine - minutiInizio);
    }, 0);

    const ore = Math.floor(totaleMinuti / 60);
    const minuti = totaleMinuti % 60;

    return `${String(ore).padStart(2, "0")}:${String(minuti).padStart(2, "0")}`;
}


export function calcolaOreRimanenti(
    oreAssegnate: string,
    oreTotali: string
): string {

    if (!oreAssegnate || !oreTotali) return "00:00";

    const [hAssegnate, mAssegnate] = oreAssegnate.split(":").map(Number);
    const [hTotali, mTotali] = oreTotali.split(":").map(Number);

    const minutiAssegnati = hAssegnate * 60 + mAssegnate;
    const minutiTotali = hTotali * 60 + mTotali;

    const minutiRimanenti = minutiTotali - minutiAssegnati;

    const ore = Math.floor(minutiRimanenti / 60);
    const minuti = minutiRimanenti % 60;

    return `${String(ore).padStart(2, "0")}:${String(minuti).padStart(2, "0")}`;
}