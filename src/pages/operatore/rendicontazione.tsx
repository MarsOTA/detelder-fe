import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { ContestazioneTimbraturaDialog } from "./dialog/contestazioneTimbraturaDialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type TurnoOperatore = {
    idPayroll: number
    idTurno: number
    stato: string
    dataTurno: string
    oraInizioDefinitivo: string
    oraFineDefinitivo: string
    orePausaDefinitivo: number | undefined
    ragioneSociale: string
    nomeBrand: string
    indirizzoEvento: string
    approvato: boolean
}

type RendicontzioneMensile = {
    meseAnno: string
    numeroTurni: number
    totaleMinuti: number
    mese: number
    anno: number
}


const Rendicontazione = () => {
    const idOperatore = localStorage.getItem('idOperatore');

    const [listaTurniMensili, setListaTurniMensili] = useState<TurnoOperatore[]>([]);
    const [contestazioneDialogOpen, setContestazioneDialogOpen] = useState(false);
    const [rendicontzioneMensile, setRendicontzioneMensile] = useState<RendicontzioneMensile[]>([]);
    const [tabAttivo, setTabAttivo] = useState("approvare");

    const [turnoSelezionato, setTurnoSelezionato] = useState<{
        idPayroll: number;
        idTurno: number;
    } | null>(null);

    useEffect(() => {
        if (tabAttivo === "approvare") {
            caricaRendicontazione();
        } else if (tabAttivo === "archivio") {
            caricaStoricoRendicontazione();
        }
    }, [tabAttivo]);

    const oggi = new Date();

    const capitalize = (text: string) =>
        text.charAt(0).toUpperCase() + text.slice(1);

    const getDataMeseCorrente = (): Date => {
        const oggi = new Date();

        return oggi.getDate() >= 6
            ? new Date(oggi.getFullYear(), oggi.getMonth() + 1, 1)
            : new Date(oggi.getFullYear(), oggi.getMonth(), 1);
    };

    const getDataMesePrecedente = (): Date => {
        const data = getDataMeseCorrente();

        return new Date(data.getFullYear(), data.getMonth() - 1, 1);
    };

    const meseCorrente = (): string => {
        return capitalize(
            new Intl.DateTimeFormat("it-IT", {
                month: "long",
            }).format(getDataMeseCorrente())
        );
    };

    const mesePrecedente = (): string => {
        return capitalize(
            new Intl.DateTimeFormat("it-IT", {
                month: "long",
            }).format(getDataMesePrecedente())
        );
    };


    const caricaRendicontazione = async () => {
        const resp = await fetch(ezystaffBEUrl + `payroll/rendicontazione/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log("Turni giornalieri inizio******");
        console.log(data);
        console.log("Turni giornalieri fine******");
        setListaTurniMensili(data);

    }

    const caricaRendicontazionePerMese = async (
        mese: number,
        anno: number
    ) => {
        const resp = await fetch(
            ezystaffBEUrl + `payroll/rendicontazionePerMese/${idOperatore}?mese=${mese}&anno=${anno}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                },
                credentials: 'include',
            }
        );

        const data = await resp.json();

        console.log("Turni giornalieri inizio******");
        console.log(data);
        console.log("Turni giornalieri fine******");

        setListaTurniMensili(data);
    };


    const caricaStoricoRendicontazione = async () => {
        const resp = await fetch(ezystaffBEUrl + `payroll/storicoRendicontazione/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log("Rendicontazione mensile inizio******");
        console.log(data);
        console.log("Rendicontazione mensile fine******");
        setRendicontzioneMensile(data);

    }

    const approvaTurno = async (
        idPayroll: number
    ) => {
        const resp = await fetch(
            ezystaffBEUrl + `payroll/approvaTurnoPayroll/${idPayroll}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                },
                method: "PATCH",
                credentials: 'include',
            }
        );

        await resp.json();

        caricaRendicontazione();
    };

    const handleAggiornaRendicontazione = async (
        e: React.FormEvent,
        motivazione: string,
        idPayroll?: number,
        idTurno?: number,
        stato?: string
    ) => {
        e.preventDefault();

        console.log("motivazione: " + motivazione);
        console.log("idPayroll: " + idPayroll);
        console.log("idTurno: " + idTurno);
        console.log("stato: " + stato);

        const body = {
            motivazione,
            idTurno,
            stato
        };

        const resp = await fetch(
            ezystaffBEUrl + `payroll/aggiornaRendicontazione/${idPayroll}`,
            {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                    accept: 'application/json'
                },
                method: "PATCH",
                credentials: 'include',
                body: JSON.stringify(body)
            }
        );

        await resp.json();

        setContestazioneDialogOpen(false);
        caricaRendicontazione();
    };



    const richiestaModificaTimbratura = (turno: TurnoOperatore) => {

        setTurnoSelezionato({
            idPayroll: turno.idPayroll,
            idTurno: turno.idTurno,
        });

        setContestazioneDialogOpen(true);
    }

    const calcolaTotaleOreTurni = (turni: TurnoOperatore[]): string => {
        let totaleMinuti = 0;

        turni.forEach((turno) => {
            const { oraInizioDefinitivo, oraFineDefinitivo, orePausaDefinitivo } = turno;

            if (!oraInizioDefinitivo || !oraFineDefinitivo) {
                return;
            }

            const [h1, m1] = oraInizioDefinitivo.split(":").map(Number);
            const [h2, m2] = oraFineDefinitivo.split(":").map(Number);

            const inizio = h1 * 60 + m1;
            let fine = h2 * 60 + m2;

            // Turno che termina il giorno successivo
            if (fine < inizio) {
                fine += 24 * 60;
            }

            // Sottraggo la pausa
            const minutiLavorati = fine - inizio - ((orePausaDefinitivo ?? 0) * 60);

            totaleMinuti += minutiLavorati;
        });

        const ore = Math.floor(totaleMinuti / 60);
        const minuti = totaleMinuti % 60;

        return [
            String(ore).padStart(2, "0"),
            String(minuti).padStart(2, "0")
        ].join(":");
    };

    const mostraMessaggioRendicontazione = (): boolean => {
        const oggi = new Date();

        const giorno = oggi.getDate();
        const ultimoGiornoMese = new Date(
            oggi.getFullYear(),
            oggi.getMonth() + 1,
            0
        ).getDate();

        // Ultimo giorno del mese
        if (giorno === ultimoGiornoMese) {
            return true;
        }

        // Dal 1 al 5 del mese
        if (giorno >= 1 && giorno <= 5) {
            return true;
        }

        return false;
    };


    return (
        <section className="main-section">
            <div className="titolo">
                Rendicontazione
            </div>

            <Tabs
                value={tabAttivo}
                onValueChange={setTabAttivo}
                className="w-full"
            >
                <TabsList className="tabs-list">
                    <TabsTrigger
                        value="approvare"
                        className="flex-1 tab-button"
                    >
                        Da approvare
                    </TabsTrigger>

                    <TabsTrigger
                        value="archivio"
                        className="flex-1 tab-button"
                    >
                        Archivio
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="approvare">
                    <div className="sintesi-rendicontazione-content">
                        {/* Sinistra */}
                        <div className="flex flex-col">
                            <span className="totale-ore-label">
                                Totale ore
                            </span>

                            <div className="flex items-baseline gap-1">
                                <span className="totale-ore-value">
                                    {calcolaTotaleOreTurni(listaTurniMensili)}
                                </span>

                                <span className="totale-ore-unita">
                                    h
                                </span>
                            </div>
                        </div>

                        {/* Destra */}
                        <div className="flex flex-col items-end">
                            <span className="totale-giorni-label">
                                Giorni lavorati
                            </span>

                            <div className="flex items-baseline gap-1">
                                <span className="totale-giorni-value">
                                    {listaTurniMensili.length}
                                </span>

                                <span className="totale-giorni-unita">
                                    Giorni
                                </span>
                            </div>
                        </div>
                    </div>

                    {mostraMessaggioRendicontazione() && (
                        <div className="rendicontazione-info">
                            <div className="rendicontazione-info-title">
                                Periodo di Approvazione
                            </div>
                            <div className="rendicontazione-info-testo">
                                Hai tempo fino al 5 {meseCorrente()} {oggi.getFullYear()} per
                                approvare o contestare i turni di {mesePrecedente()}.
                                Dopo tale data, i turni verranno approvati automaticamente.
                            </div>
                        </div>
                    )}
                    {listaTurniMensili.map((turno, index) => {

                        return (
                            <React.Fragment key={index}>
                                <div className="rendicontazione-turno-content">
                                    <div className="flex justify-between items-center">
                                        <span className="rendicontazione-data-turno">
                                            {turno.dataTurno}
                                        </span>
                                        <span className="rendicontazione-orario-turno">
                                            {turno.oraInizioDefinitivo} - {turno.oraFineDefinitivo}
                                        </span>
                                    </div>
                                    <div className="rendicontazione-pausa-turno">
                                        Pausa {turno.orePausaDefinitivo} h
                                    </div>
                                    <div className="rendicontazione-titolo-turno">
                                        {turno.ragioneSociale} - {turno.nomeBrand}
                                    </div>
                                    <div className="rendicontazione-indirizzo-turno">
                                        {turno.indirizzoEvento}
                                    </div>
                                    <div className="mt-2 flex w-full items-center justify-end">
                                        {turno.approvato ? (
                                            <span className="flex w-full justify-center rounded-[8px] border border-[#00ffb8] bg-[#11413f] py-2 text-[12px] font-medium text-[#00ffb8]">
                                                APPROVATO
                                            </span>
                                        ) : turno.stato === "CONTESTATO" ? (
                                            <span className="flex w-full justify-center rounded-[8px] border border-[#c4c7c5] py-2 text-[12px] font-medium text-[#444746]">
                                                MODIFICATO
                                            </span>
                                        ) : (
                                            <div className="flex w-full items-center justify-between">
                                                {/* APPROVA */}
                                                <Button
                                                    onClick={() => approvaTurno(turno.idPayroll)}
                                                    className="w-[45%] rounded-[8px] border border-[#00ffb8] bg-[#00ffb8] text-[12px] font-medium text-[#11413f]"
                                                >
                                                    <span>APPROVA</span>
                                                </Button>

                                                {/* MODIFICA */}
                                                <Button
                                                    onClick={() => richiestaModificaTimbratura(turno)}
                                                    className="rendicontazione-bottone-modifica"
                                                >
                                                    <span>MODIFICA</span>
                                                </Button>
                                            </div>
                                        )}
                                    </div>


                                </div>
                            </React.Fragment>
                        );
                    })}
                </TabsContent>

                <TabsContent value="archivio">
                    <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                    >
                        {rendicontzioneMensile.map((rendicontazione) => {
                            const ore = Math.floor(rendicontazione.totaleMinuti / 60);
                            const minuti = rendicontazione.totaleMinuti % 60;

                            return (
                                <AccordionItem
                                    key={rendicontazione.meseAnno}
                                    value={rendicontazione.meseAnno}
                                    className="archivio-mensile-trigger"
                                    onClick={() => {
                                        caricaRendicontazionePerMese(
                                            rendicontazione.mese,
                                            rendicontazione.anno
                                        );
                                    }}
                                >
                                    <AccordionTrigger className="[&>svg]:text-white">
                                        <div className="flex w-full items-center justify-between">

                                            {/* Mese */}
                                            <span className="archivio-mese-anno">
                                                {rendicontazione.meseAnno}
                                            </span>
                                            <div className="archivio-giorni-mensili">
                                                {/* Totale ore */}
                                                <span>
                                                    {String(ore).padStart(2, "0")}:
                                                    {String(minuti).padStart(2, "0")} h
                                                </span>

                                                <span className="mx-2">•</span>

                                                {/* Numero turni */}
                                                <span>
                                                    {rendicontazione.numeroTurni}
                                                    {rendicontazione.numeroTurni === 1 ? " turno" : " turni"}
                                                </span>
                                            </div>

                                        </div>
                                    </AccordionTrigger>

                                    <AccordionContent>
                                        {listaTurniMensili.map((turno, index) => {

                                            return (
                                                <React.Fragment key={index}>
                                                    <div className="turno-archiviato-content">
                                                        <div className="flex justify-between items-center">
                                                            <span className="data-turno-archiviato">
                                                                {turno.dataTurno}
                                                            </span>
                                                            <span className="ora-turno-archiviato">
                                                                {turno.oraInizioDefinitivo} - {turno.oraFineDefinitivo}
                                                            </span>
                                                        </div>
                                                        <div className="pausa-turno-archiviato">
                                                            Pausa {turno.orePausaDefinitivo} h
                                                        </div>
                                                        <div className="nome-turno-archiviato">
                                                            {turno.ragioneSociale} - {turno.nomeBrand}
                                                        </div>
                                                        <div className="indirizzo-turno-archiviato">
                                                            {turno.indirizzoEvento}
                                                        </div>
                                                    </div>
                                                </React.Fragment>
                                            );
                                        })}
                                    </AccordionContent>
                                </AccordionItem>
                            );
                        })}
                    </Accordion>

                </TabsContent>
            </Tabs>

            <ContestazioneTimbraturaDialog
                open={contestazioneDialogOpen}
                setOpen={setContestazioneDialogOpen}
                onSubmit={handleAggiornaRendicontazione}
                idPayroll={turnoSelezionato?.idPayroll}
                idTurno={turnoSelezionato?.idTurno}
            />

        </section>
    );
};

export default Rendicontazione;