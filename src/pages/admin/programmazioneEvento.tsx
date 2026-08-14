import { useParams } from "react-router-dom";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar, Clock } from "lucide-react";
import type { Evento } from "@/entity";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";


type DettaglioEvento = {
    idDettaglioEvento: number | undefined;
    idEvento: number | undefined;
    giorno: Date
    oraInizo: string
    oraFine: string
    pausaInizio: string
    pausaFine: string
    oreGiornaliere: number
}

const programmazioneEvento = () => {

    const { id } = useParams();
    const [dettagli, setDettagli] = useState<DettaglioEvento[]>([]);
    const [evento, setEvento] = useState<Evento>();
    const [oreTotali, setOreTotali] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        getEvento();
        getDettaglioOperatore();

    }, [])


    const getDettaglioOperatore = async () => {
        const resp = await fetch(ezystaffBEUrl + `eventi/dettaglio/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })

        const responseFromApi: DettaglioEvento[] = await resp.json();

        console.log(dettagli);

        const eventiConOre = responseFromApi.map(evento => {
            const dailyHours = calculateDailyHours(evento.oraInizo, evento.oraFine, evento.pausaInizio, evento.pausaFine);
            return { ...evento, oreGiornaliere: dailyHours, };
        });

        updateTotalHours(eventiConOre);

        setDettagli(eventiConOre);

    }

    const getEvento = async () => {
        const resp = await fetch(ezystaffBEUrl + `eventi/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);

        setEvento(data);

    }


    const handleTimeChange = (index: number, field: keyof DettaglioEvento, value: string) => {

        const aggiornaDettagli = [...dettagli];

        (aggiornaDettagli[index] as any)[field] = value;

        const schedule = aggiornaDettagli[index];
        const dailyHours = calculateDailyHours(
            schedule.oraInizo,
            schedule.oraFine,
            schedule.pausaInizio,
            schedule.pausaFine
        );
        aggiornaDettagli[index].oreGiornaliere = dailyHours;

        updateTotalHours(aggiornaDettagli);
        console.log(aggiornaDettagli);

        setDettagli(aggiornaDettagli);

    };




    const calculateDailyHours = (startTime: string, endTime: string, lunchStart: string, lunchEnd: string): number => {
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const [lunchStartHour, lunchStartMinute] = lunchStart.split(':').map(Number);
        const [lunchEndHour, lunchEndMinute] = lunchEnd.split(':').map(Number);

        const startTimeMinutes = startHour * 60 + startMinute;
        const endTimeMinutes = endHour * 60 + endMinute;
        const lunchStartMinutes = lunchStartHour * 60 + lunchStartMinute;
        const lunchEndMinutes = lunchEndHour * 60 + lunchEndMinute;

        let dailyMinutes = endTimeMinutes - startTimeMinutes;
        if (dailyMinutes < 0) {
            dailyMinutes += 24 * 60; // Add 24 hours in minutes for next day
        }

        // Subtract lunch break duration
        const lunchBreakMinutes = lunchEndMinutes - lunchStartMinutes;
        dailyMinutes = Math.max(0, dailyMinutes - lunchBreakMinutes);

        return Math.max(0, dailyMinutes / 60);
    };

    const updateTotalHours = (schedules: DettaglioEvento[]) => {
        const total = schedules.reduce((sum, schedule) => sum + schedule.oreGiornaliere, 0);
        console.log("ore totali: " + total);
        setOreTotali(total);
    };

    const handleSave = async () => {
        console.log(dettagli);

        const resp = await fetch(ezystaffBEUrl + 'eventi/dettaglio', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "PATCH",
            credentials: 'include',
            body: JSON.stringify(dettagli)
        });
        const data = await resp.json();
        console.log(data);


        navigate("/admin/eventi");
    }



    return (
        <>
            <div className="space-y-6">

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Programmazione evento
                        </CardTitle>
                        <div className="text-sm text-muted-foreground">
                            <p><strong>{evento?.titoloEvento}</strong></p>
                            <p>Cliente: {evento?.ragioneSociale}</p>
                            <p>Durata: {dettagli.length} {dettagli.length === 1 ? 'giorno' : 'giorni'}</p>
                        </div>
                    </CardHeader>
                    <CardContent>

                        <div className="space-y-6">
                            <div className="grid gap-4">
                                {dettagli.map((schedule, index) => (
                                    <Card key={index} className="p-4">
                                        <div className="space-y-4">
                                            <div className="font-medium">
                                                {format(schedule.giorno, "EEEE d MMMM yyyy", { locale: it })}
                                            </div>

                                            <div className="grid md:grid-cols-6 gap-4 items-end">
                                                <div className="space-y-2">
                                                    <Label>Ora inizio</Label>
                                                    <Input
                                                        type="time"
                                                        value={schedule.oraInizo}
                                                        onChange={(e) => handleTimeChange(index, 'oraInizo', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Ora fine</Label>
                                                    <Input
                                                        type="time"
                                                        value={schedule.oraFine}
                                                        onChange={e => handleTimeChange(index, 'oraFine', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label>Pausa pranzo - Inizio</Label>
                                                    <Input
                                                        type="time"
                                                        value={schedule.pausaInizio}
                                                        onChange={e => handleTimeChange(index, 'pausaInizio', e.target.value)}
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <Label htmlFor={`lunch-end-${index}`}>Pausa pranzo - Fine</Label>
                                                    <Input
                                                        id={`lunch-end-${index}`}
                                                        type="time"
                                                        value={schedule.pausaFine}
                                                        onChange={e => handleTimeChange(index, 'pausaFine', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 text-sm font-medium">
                                                    <Clock className="h-4 w-4" />
                                                    {schedule.oreGiornaliere.toFixed(1)} ore

                                                </div>

                                            </div>
                                        </div>
                                    </Card>

                                ))}
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">Monte ore totale:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {oreTotali.toFixed(1)} ore
                                    </span>
                                </div>
                            </div>

                            <div className="border-t pt-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-semibold">Monte ore totale evento:</span>
                                    <span className="text-2xl font-bold text-primary">
                                        {evento?.numeroStaffRichiesto} membri staff richiesti
                                    </span>

                                    <span className="text-2xl font-bold text-primary">
                                        {evento ? (
                                            (oreTotali * evento?.numeroStaffRichiesto).toFixed(1)
                                        ) : (
                                            oreTotali
                                        )} ore
                                    </span>

                                    {/*
                                    <span className="text-2xl font-bold text-primary">
                                        {oreTotaliEvento.toFixed(1)} ore
                                    </span>  
                                    */}
                                </div>
                            </div>


                            <div className="flex gap-2">
                                <Button onClick={handleSave} className="flex-1">
                                    Aggiorna programmazione
                                </Button>
                            </div>


                        </div>

                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default programmazioneEvento