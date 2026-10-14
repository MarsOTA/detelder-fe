import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { useEffect, useState } from "react";
import { MapPin, Clock } from "lucide-react";

type TurnoEvento = {
    idTurno: number
    titoloEvento: string
    localitaEvento: string
    nomeCognomeReferente: string
    telefonoReferente: string
    tipologiaTurno: string
    tipoMansione: string
    dataTurno: string;
    oraInizio: string
    oraFine: string
    notaTurno: string
    confermato: boolean
}

const turniFuturi = () => {

    const idOperatore = localStorage.getItem('idOperatore');

    console.log('idOperatore: ' + idOperatore);

    const [turniFuturi, setTurniFuturi] = useState<TurnoEvento[]>([]);

    useEffect(() => {
        caricaTurniAssegnati();
    }, [])

    const caricaTurniAssegnati = async () => {
        const resp = await fetch(ezystaffBEUrl + `turni/turniFuturi/${idOperatore}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log("Turni futuri inizio******");
        console.log(data);
        console.log("Turni futuri fine******");
        setTurniFuturi(data);

    }

    const formatMonthShort = (input: string): string => {
        const [day, month, year] = input.split("/");
        if (!day || !month || !year) return "Data non valida";

        const date = new Date(Number(year), Number(month) - 1, Number(day));
        if (isNaN(date.getTime())) return "Data non valida";

        return date
            .toLocaleDateString("it-IT", {
                month: "long",
            })
            .substring(0, 3)
            .toUpperCase();
    };

    const formatDay = (input: string): string => {
        const [day] = input.split("/");

        if (!day) return "Data non valida";

        return day;
    };

    const confermaTurno = async (idTurno: number) => {

        const resp = await fetch(ezystaffBEUrl + `turni/confermaTurno/${idTurno}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include',
        });

        const data = await resp.json();
        console.log("data: ", data);
        caricaTurniAssegnati();
    };

    return (
        <section className="main-section">
            <div className="titolo">
                I tuoi impegni
            </div>
            {turniFuturi.map((turnoFuturo) => (
                <Card
                    className={`turni-futuri-card ${turnoFuturo.confermato
                        ? "turni-futuri-card-confermata"
                        : "turni-futuri-card-da-confermare"
                        }`}
                >
                    <CardContent>
                        <div className="turni-futuri-operativita">
                            <div className="turni-futuri-data-content">
                                <div className="turni-futuri-giorno">{formatDay(turnoFuturo.dataTurno)}</div>
                                <div className="turni-futuri-mese">{formatMonthShort(turnoFuturo.dataTurno)}</div>
                            </div>

                            <div>
                                <div className="turni-futuri-stato-lbl">
                                    {turnoFuturo.confermato ? "CONFERMATO" : "DA CONFERMARE"}
                                </div>
                                <div className="turni-futuri-titolo-evento">{turnoFuturo.titoloEvento}</div>
                                <div className="turni-futuri-tipologia-content">
                                    <span className="turni-futuri-tipologiaTurno">{turnoFuturo.tipologiaTurno}
                                    </span><span className="turni-futuri-tipoMansione">{turnoFuturo.tipoMansione}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" style={{ color: '#c9daff' }} />
                                    <span className="turni-futuri-localita-evento">{turnoFuturo.localitaEvento}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-4 w-4" style={{ color: '#c9daff' }} />
                                    <span className="turni-futuri-Orario">{turnoFuturo.oraInizio} - {turnoFuturo.oraFine}</span>
                                </div>
                            </div>
                        </div>
                        {turnoFuturo.notaTurno && (
                            <div className="turni-futuri-note-operative-content">
                                <div className="note-operative-label">NOTE OPERATIVE</div>
                                <div className="note-operative-value">
                                    {turnoFuturo.notaTurno}
                                </div>
                            </div>
                        )}
                        {!turnoFuturo.confermato && (
                            <Button
                                onClick={() => confermaTurno(turnoFuturo.idTurno)}
                                className="turni-conferma-turno-btn"
                            >
                                Conferma turno
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ))}
        </section >

    )
}

export default turniFuturi