import React, { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { ContestazioneTimbraturaDialog } from "./dialog/contestazioneTimbraturaDialog";

type TurnoOperatore = {
    idPayroll: number
    idTurno: number
    stato: string
    dataTurno: string
    oraInizioDefinitivo: string
    oraFineDefinitivo: string
    orePausaDefinitivo: string
    ragioneSociale: string
    nomeBrand: string
    indirizzoEvento: string
}


const Rendicontazione = () => {
    const idOperatore = localStorage.getItem('idOperatore');

    const [listaTurniMensili, setListaTurniMensili] = useState<TurnoOperatore[]>([]);
    const [contestazioneDialogOpen, setContestazioneDialogOpen] = useState(false);

    const [turnoSelezionato, setTurnoSelezionato] = useState<{
        idPayroll: number;
        idTurno: number;
    } | null>(null);

    useEffect(() => {
        caricaRendicontazione();
    }, [])

    const oggi = new Date();

    const capitalize = (text: string) =>
        text.charAt(0).toUpperCase() + text.slice(1);

    const meseCorrente = capitalize(
        new Intl.DateTimeFormat("it-IT", { month: "long" }).format(oggi)
    );

    const mesePrecedente = capitalize(
        new Intl.DateTimeFormat("it-IT", {
            month: "long",
        }).format(new Date(oggi.getFullYear(), oggi.getMonth() - 1, 1))
    );

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

    const handleSubmitContestazione = async (
        e: React.FormEvent, 
        motivazione: string,
        idPayroll?: number,
        idTurno?: number
    ) => {
        e.preventDefault();
        console.log("motivazione: " + motivazione);
        console.log("idPayroll:" + idPayroll);
        console.log("idTurno: " + idTurno);

        const body = {
            motivazione,
            idTurno
        };


        const resp = await fetch(ezystaffBEUrl + `payroll/aggiornaRendicontazione/${idPayroll}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include',
            body: JSON.stringify(body)
        });
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

    return (
        <section className="p-3">
            <div className="pb-2 text-[24px] font-black text-[#006b44]">
                Rendicontazione
            </div>

            <Tabs defaultValue="approvare" className="w-full">
                <div className="px-1">
                    <TabsList className="flex w-full">
                        <TabsTrigger
                            value="approvare"
                            className="flex-1"
                        >
                            Da approvare
                        </TabsTrigger>

                        <TabsTrigger
                            value="archivio"
                            className="flex-1"
                        >
                            Archivio
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="approvare">
                    <div className="rounded-[12px] border border-[rgba(0,107,68,0.2)] bg-[rgba(0,107,68,0.05)] p-3 text-[14px] font-normal text-[#444746]">
                        Hai tempo fino al 5 {meseCorrente} {oggi.getFullYear()} per
                        approvare o contestare i turni di {mesePrecedente}.
                        Dopo tale data, i turni verranno approvati automaticamente.
                    </div>
                    {listaTurniMensili.map((turno, index) => {

                        return (
                            <React.Fragment key={index}>
                                <div className="mt-2 rounded-xl border border-[#e1e2e4] bg-white shadow-sm p-3">
                                    <div className="flex justify-between items-center">
                                        <span className="ml-2 rounded-lg border border-[rgba(0,107,68,0.2)] bg-[rgba(0,107,68,0.1)] px-2 py-1 text-[12px] font-medium text-[#006b44]">
                                            {turno.dataTurno}
                                        </span>
                                        <span className="mr-2 text-[16px] font-normal text-[#006b44]">
                                            {turno.oraInizioDefinitivo} - {turno.oraFineDefinitivo}
                                        </span>
                                    </div>
                                    <div className="mr-2 text-right text-xs font-medium text-[#444746]">
                                        Pausa {turno.orePausaDefinitivo} h
                                    </div>
                                    <div className="ml-2 text-[18px] font-normal text-[#191c1d]">
                                        {turno.ragioneSociale} - {turno.nomeBrand}
                                    </div>
                                    <div className="ml-2 text-[14px] font-normal text-[#444746]">
                                        {turno.indirizzoEvento}
                                    </div>
                                    <div className="mt-2 w-full flex items-center">
                                        {turno.stato === "CONTESTATO" ? (
                                            <span className="flex w-full justify-center rounded-[8px] border border-[#c4c7c5] py-2 text-[12px] font-medium text-[#444746]">
                                                MODIFICATO
                                            </span>
                                        ) : (
                                            <Button
                                                onClick={() => richiestaModificaTimbratura(turno)}
                                                className="w-full rounded-[8px] border border-[#b3261e] bg-white text-[12px] font-medium text-[#b3261e]"
                                            >
                                                <span>MODIFICA</span>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </TabsContent>

                <TabsContent value="archivio">
                    <div>Elenco delle rendicontazioni archiviate.</div>
                </TabsContent>
            </Tabs>

            <ContestazioneTimbraturaDialog
                open={contestazioneDialogOpen}
                setOpen={setContestazioneDialogOpen}
                onSubmit={handleSubmitContestazione}
                idPayroll={turnoSelezionato?.idPayroll}
                idTurno={turnoSelezionato?.idTurno}
            />

        </section>
    );
};

export default Rendicontazione;