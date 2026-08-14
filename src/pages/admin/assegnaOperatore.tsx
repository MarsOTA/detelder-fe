import { useEffect, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import type { Evento, Dipendente } from "@/entity";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";


type TurnoEvento = {
    idTurno: number
    titoloEvento: string
    dataTurno: Date
    oraInizo: string
    oraFine: string
    teamLeader: boolean
}


type NuovoTurno = {
    idEvento: number | undefined;
    idOperatore: number | undefined;
    dataTurno: Date | undefined
    oraInizo: string
    oraFine: string
    teamLeader: boolean
}

type TurnoForm = {
    dataTurno: Date | undefined
    oraInizo: string | undefined
    oraFine: string
    teamLeader: boolean
}

const assegnaOperatore = () => {

    const { id } = useParams();
    const [eventi, setEventi] = useState<Evento[]>([]);
    const [dipendente, setDipendente] = useState<Dipendente>();
    const [eventoSelezionato, setEventoSelezionato] = useState<Evento>();
    const [nuovoTurno, setNuovoTurno] = useState<NuovoTurno>();
    const [turnoForm, setTurnoForm] = useState<TurnoForm>();
    const [turni, setTurni] = useState<TurnoEvento[]>([]);

    useEffect(() => {
        cercaListaEventi();
        getOperatore();
        caricaTurniAssegnati();
    }, [])

    const cercaListaEventi = async () => {
        const resp = await fetch(ezystaffBEUrl + 'eventi', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setEventi(data);

        console.log(eventi);
    }

    const getOperatore = async () => {
        const resp = await fetch(ezystaffBEUrl + `operatori/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setDipendente(data);
        console.log(dipendente);
    }


    const combineDateAndTime = (date: Date, time: string): Date => {
        const [hours, minutes] = time.split(":").map(Number);
        const combined = new Date(date);
        combined.setHours(hours);
        combined.setMinutes(minutes);
        combined.setSeconds(0);
        combined.setMilliseconds(0);
        return combined;
    };

    const formatDateRange = (dateStart: Date, timeStart: string, dateEnd: Date, timeEnd: string) => {
        const start = combineDateAndTime(dateStart, timeStart);
        const end = combineDateAndTime(dateEnd, timeEnd);

        const sameDay =
            start.getDate() === end.getDate() &&
            start.getMonth() === end.getMonth() &&
            start.getFullYear() === end.getFullYear();

        const startDateStr = format(start, "d MMMM yyyy", { locale: it });
        const endDateStr = format(end, "d MMMM yyyy", { locale: it });
        const startTimeStr = format(start, "HH:mm");
        const endTimeStr = format(end, "HH:mm");

        if (sameDay) {
            return `${startDateStr}, ${startTimeStr} - ${endTimeStr}`;
        } else {
            return `Dal ${startDateStr}, ${startTimeStr} al ${endDateStr}, ${endTimeStr}`;
        }
    };



    const eventoOnValueChange = (value: string) => {

        const evento = eventi.find((evento: any) => evento.idEvento === Number(value));
        setEventoSelezionato(evento);
        if (evento) {
            const start = new Date(evento.dataIniziale);
            const startTimeStr = evento.oraIniziale;
            const endTimeStr = evento.oraFinale;

            const creaNuovoTurno: NuovoTurno = {
                idEvento: evento.idEvento,
                teamLeader: false,
                oraInizo: startTimeStr,
                oraFine: endTimeStr,
                dataTurno: start,
                idOperatore: Number(id)
            }

            setNuovoTurno(creaNuovoTurno);

            const turno: TurnoForm = {
                dataTurno: start,
                oraInizo: startTimeStr,
                oraFine: endTimeStr,
                teamLeader: false
            }
            setTurnoForm(turno);

        }

    }

    const setDataEvento = (value: Date | undefined) => {
        console.log('valore della data prima**********: ' + value);
        console.log('valore della data dopo**********: ' + getLocalMidnightDate(value));
        if (nuovoTurno) {
            nuovoTurno.dataTurno = value;
        }
        if (turnoForm) {
            const turno: TurnoForm = {
                dataTurno: value,
                oraInizo: turnoForm.oraInizo,
                oraFine: turnoForm.oraFine,
                teamLeader: turnoForm.teamLeader
            }
            setTurnoForm(turno);
        }
        console.log(JSON.stringify(nuovoTurno));
    }

    const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
        if (!date) return undefined;

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // mesi 0-based
        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    };


    const getLocalMidnightDate = (date: Date | undefined): Date | undefined => {
        if (!date) return undefined;

        const year = date.getFullYear();
        const month = date.getMonth(); // 0-based
        const day = date.getDate();

        // Crea una nuova data a mezzanotte locale
        return new Date(Date.UTC(year, month, day, 0, 0, 0));
    };

    const setOraInizo = (value: string) => {
        console.log(value);
        if (nuovoTurno) {
            nuovoTurno.oraInizo = value;
        }
        if (turnoForm) {
            const turno: TurnoForm = {
                dataTurno: turnoForm.dataTurno,
                oraInizo: value,
                oraFine: turnoForm.oraFine,
                teamLeader: turnoForm.teamLeader
            }
            setTurnoForm(turno);
        }
        console.log(JSON.stringify(nuovoTurno));
    }

    const setOraFine = (value: string) => {
        console.log(value);
        if (nuovoTurno) {
            nuovoTurno.oraFine = value;
        }
        if (turnoForm) {
            const turno: TurnoForm = {
                dataTurno: turnoForm.dataTurno,
                oraInizo: turnoForm.oraInizo,
                oraFine: value,
                teamLeader: turnoForm.teamLeader
            }
            setTurnoForm(turno);
        }
        console.log(JSON.stringify(nuovoTurno));
    }

    const aggiungiTurno = async () => {
        console.log(JSON.stringify(nuovoTurno));

        const turnoDaInviare = {
            ...nuovoTurno!,
            dataTurno: formatDateToYYYYMMDD(nuovoTurno!.dataTurno)
        };


        const resp = await fetch(ezystaffBEUrl + '', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "POST",
            credentials: 'include',
            body: JSON.stringify(turnoDaInviare)
        });
        const data = await resp.json();
        console.log(data);
        alert(JSON.stringify(data));
        caricaTurniAssegnati();

    }

    const caricaTurniAssegnati = async () => {
        const resp = await fetch(ezystaffBEUrl + `turni/turniOperatore/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            credentials: 'include',
        })
        const data = await resp.json();
        console.log(data);
        setTurni(data);
    }

    const cancellaTurno = async (idTurno: number) => {
        const resp = await fetch(ezystaffBEUrl + `turni/${idTurno}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
                accept: 'application/json'
            },
            method: "DELETE",
            credentials: 'include',
        });
        const data = await resp.json();
        console.log(data);
        caricaTurniAssegnati();
    }

    const handleTeamLeaderChange = (isTeamLeader: boolean) => {

        console.log("isTeamLeader: " + isTeamLeader)
        if (nuovoTurno) {
            nuovoTurno.teamLeader = isTeamLeader;
        }
        if (turnoForm) {
            const turno: TurnoForm = {
                dataTurno: turnoForm.dataTurno,
                oraInizo: turnoForm.oraInizo,
                oraFine: turnoForm.oraFine,
                teamLeader: isTeamLeader
            }
            setTurnoForm(turno);
        }
        console.log(JSON.stringify(nuovoTurno));

    }

    return (

        <>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Seleziona l'evento a cui vuoi assegnare {dipendente?.nome} {dipendente?.cognome}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Select onValueChange={(value) => eventoOnValueChange(value)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Seleziona un evento" />
                            </SelectTrigger>
                            <SelectContent>
                                {eventi.length > 0 ? (
                                    eventi.map((event) => (
                                        <SelectItem key={event.idEvento} value={String(event.idEvento)}>
                                            {event.titoloEvento} - {event.ragioneSociale}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="no-events" disabled>
                                        Nessun evento disponibile
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-6">
                        <CardTitle>Lista Turni</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Evento</TableHead>
                                    <TableHead>Data turno</TableHead>
                                    <TableHead>Ora inizio</TableHead>
                                    <TableHead>Ora fine</TableHead>
                                    <TableHead>Team Leader</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {turni.map((turno) => (
                                    <TableRow>
                                        <TableCell>{turno.titoloEvento}</TableCell>
                                        <TableCell>{format(turno.dataTurno, "d MMMM yyyy", { locale: it })}</TableCell>
                                        <TableCell>{turno.oraInizo}</TableCell>
                                        <TableCell>{turno.oraFine}</TableCell>
                                        <TableCell>{turno.teamLeader ? "Si" : "No"}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">

                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={() => cancellaTurno(turno.idTurno)}
                                                    title={"Cancella Turno"}
                                                >

                                                    <Trash2 className="h-4 w-4" />

                                                </Button>
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Imposta i turni</CardTitle>
                        {eventoSelezionato && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    I turni devono essere compresi nel periodo dell'evento:  {formatDateRange(eventoSelezionato.dataIniziale, eventoSelezionato.oraIniziale, eventoSelezionato.dataFinale, eventoSelezionato.oraFinale)}
                                </AlertDescription>
                            </Alert>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">

                        {eventoSelezionato ? (
                            <>
                                {/* Add New Shift */}
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-md">
                                    <div className="space-y-2">
                                        <Label>Data turno</Label>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                /*
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !shiftDate && "text-muted-foreground"
                                                )}
                                                    */
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {turnoForm?.dataTurno ? format(turnoForm?.dataTurno, "d MMMM yyyy", { locale: it }) : "Seleziona data"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={turnoForm?.dataTurno}
                                                    onSelect={(e) => setDataEvento(e)}
                                                    locale={it}
                                                    className="pointer-events-auto"
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ora inizio</Label>
                                        <Input
                                            type="time"
                                            value={turnoForm?.oraInizo}
                                            onChange={(e) => setOraInizo(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Ora fine</Label>
                                        <Input
                                            type="time"
                                            value={turnoForm?.oraFine}
                                            onChange={(e) => setOraFine(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Team leader</Label>
                                        <Switch
                                            checked={turnoForm?.teamLeader}
                                            onCheckedChange={handleTeamLeaderChange}
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={aggiungiTurno}>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Aggiungi turno
                                        </Button>
                                    </div>

                                </div>
                            </>
                        ) : (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Seleziona prima un evento per impostare i turni
                                </AlertDescription>
                            </Alert>
                        )}

                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default assegnaOperatore