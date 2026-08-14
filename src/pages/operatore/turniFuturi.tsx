import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { useEffect, useState } from "react";
import { MapPin, Clock, NotebookPen, CalendarDays } from "lucide-react";

type OrarioTurni = {
    oraInizio: string
    oraFine: string
    notaTurno: string
}

type TurnoEvento = {
    idTurno: number
    titoloEvento: string
    localitaEvento: string
    nomeCognomeReferente: string
    telefonoReferente: string
    tipologiaTurno: string
    tipoMansione: string
    dataTurno: string;
    orarioTurni: OrarioTurni[];
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

    const formatDateShort = (input: string): string => {
        const [day, month, year] = input.split("/");
        if (!day || !month || !year) return "Data non valida";

        // Crea una nuova data in modo sicuro
        const date = new Date(`${year}-${month}-${day}`);
        if (isNaN(date.getTime())) return "Data non valida";

        return date.toLocaleDateString("it-IT", {
            day: "2-digit",
            month: "2-digit",
            year: "2-digit",
        });
    };

    const getWeekdayFromDate = (input: string): string => {
        const [day, month, year] = input.split("/");
        if (!day || !month || !year) return "Data non valida";

        const date = new Date(`${year}-${month}-${day}`);
        if (isNaN(date.getTime())) return "Data non valida";

        return date.toLocaleDateString("it-IT", { weekday: "long" });
    };

    return (
        <section className="m-3">
            <div className="text-[36px] font-extrabold text-[#007a55] pb-2">
                Prossimi turni
            </div>
            {turniFuturi.map((turnoFuturo) => (
                <>
                    <Card className="shadow-lg w-full mx-auto mb-4 pt-0 border-[#72ad97]">
                        <CardHeader style={{ backgroundColor: "#326455" }} className="p-4">
                            <div className="flex gap-4">
                                <CalendarDays className="h-14 w-14 text-[#a5e8cf]" strokeWidth={1} />
                                <div className="text-white leading-none">
                                    <div className="text-[18px]">{getWeekdayFromDate(turnoFuturo.dataTurno)}</div>
                                    <div className="font-extrabold text-[40px]">{formatDateShort(turnoFuturo.dataTurno)}</div>
                                </div>
                            </div>

                        </CardHeader>
                        <CardContent className="space-y-6 p-[15px]">
                            <div>
                                <span className="text-[#007a55] text-[32px] font-extrabold leading-[1.2em]">{turnoFuturo.titoloEvento}</span>
                            </div>

                            <div className="flex items-center gap-2 border-b border-gray-300  pb-4">
                                <MapPin className="h-6 w-6" style={{ color: '#007a55' }} />
                                <span className="text-[22px] font-normal text-[#5e5d5d]">{turnoFuturo.localitaEvento}</span>
                            </div>
                            <div className=" items-center space-x-3  border-b border-gray-300  pb-4">
                                {turnoFuturo.orarioTurni.map((orarioTurno, index) => {
                                    const isEven = index % 2 === 0;
                                    const bgColor = isEven ? "bg-[#ecfff8]" : "bg-[#e2ecf4]"; // cambia i colori come preferisci

                                    return (
                                        <div key={index} className={`w-full space-y-1 p-4 ${bgColor}`}>
                                            <div className="flex items-center w-full gap-2 p-1">
                                                <Clock className="h-5 w-5  stroke-[#007a55]" />
                                                <div className="font-bold text-[#5e5d5d]" style={{ fontSize: '18px' }} >
                                                    Dalle {orarioTurno.oraInizio} alle {orarioTurno.oraFine}
                                                </div>
                                            </div>
                                            <div className="flex items-center w-full gap-2 p-1">
                                                <NotebookPen className="h-5 w-5  stroke-[#007a55]" />
                                                <div className="font-normal text-[#656565]" style={{ fontSize: '16px' }} >
                                                    {orarioTurno.notaTurno}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}


                            </div>
                        </CardContent>
                    </Card>
                </>
            ))}
        </section >

    )
}

export default turniFuturi