import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Circle, Download } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { it } from "date-fns/locale";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type FiltriRicerca = {
  ricercaKeyword: string;
  dataInizio: Date | undefined;
  dataFine: Date | undefined;
};

type TurnoCompleto = {
  idTurno: number;
  idEvento: number;
  idCheckInCheckOut: number | null;
  dataTurno: Date | undefined;
  oraInizio: string;
  oraFine: string;
  nomeEvento: string;
  nomeBrand: string;
  ragioneSociale: string;
  tipologiaTurno: string;
  tipoMansione: string;
  operatore: string;
  orePausa: string;
  via: string;
};

type StatoContratto = "REGOLARE" | "SCADUTO" | "ASSENTE";

type OperatoreLookup = {
  id: number;
  nome: string;
  cognome: string;
  nickname?: string | null;
};

type StatoContrattoResponse = {
  idOperatore: number;
  statoContratto: StatoContratto;
};

const Turni = () => {
  const [filtriRicerca, setFiltriRicerca] = useState<FiltriRicerca>();
  const [turni, setTurni] = useState<TurnoCompleto[]>([]);
  const [statoContrattoByOperatore, setStatoContrattoByOperatore] = useState<Record<string, StatoContratto>>({});

  useEffect(() => {
    const filtri: FiltriRicerca = {
      ricercaKeyword: "",
      dataInizio: new Date(),
      dataFine: new Date(new Date().setMonth(new Date().getMonth() + 1)),
    };
    setFiltriRicerca(filtri);
    caricaTurni(filtri);
    caricaStatiContratto();
  }, []);

  const caricaStatiContratto = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        accept: "application/json",
      };

      const [operatoriResp, statiResp] = await Promise.all([
        fetch(`${ezystaffBEUrl}operatori`, { headers, credentials: "include" }),
        fetch(`${ezystaffBEUrl}operatori/statoContratti`, { headers, credentials: "include" }),
      ]);

      if (!operatoriResp.ok || !statiResp.ok) return;

      const operatori: OperatoreLookup[] = await operatoriResp.json();
      const stati: StatoContrattoResponse[] = await statiResp.json();
      const statoById = new Map(stati.map((item) => [Number(item.idOperatore), item.statoContratto]));
      const lookup: Record<string, StatoContratto> = {};

      operatori.forEach((operatore) => {
        const stato = statoById.get(Number(operatore.id)) ?? "ASSENTE";
        const nomeCompleto = `${operatore.nome ?? ""} ${operatore.cognome ?? ""}`.trim().toLowerCase();
        const nickname = operatore.nickname?.trim().toLowerCase();
        if (nomeCompleto) lookup[nomeCompleto] = stato;
        if (nickname) lookup[nickname] = stato;
      });

      setStatoContrattoByOperatore(lookup);
    } catch (error) {
      console.error("Errore caricamento stato contratti nel planning:", error);
    }
  };

  const handleGiornoClick = (offsetGiorni: number) => {
    const now = new Date();
    now.setDate(now.getDate() + offsetGiorni);
    const filtri: FiltriRicerca = {
      ricercaKeyword: "",
      dataInizio: new Date(now),
      dataFine: new Date(now),
    };
    setFiltriRicerca(filtri);
    caricaTurni(filtri);
  };

  const setRicercaKeyword = (value: string) =>
    setFiltriRicerca((prev) => (prev ? { ...prev, ricercaKeyword: value } : undefined));

  const setDataInizio = (date: Date | undefined) =>
    setFiltriRicerca((prev) => (prev ? { ...prev, dataInizio: date } : undefined));

  const setDataFine = (date: Date | undefined) =>
    setFiltriRicerca((prev) => (prev ? { ...prev, dataFine: date } : undefined));

  const formatDateToYYYYMMDD = (date: Date | undefined): string | undefined => {
    if (!date) return undefined;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  const caricaTurni = async (filtri: FiltriRicerca) => {
    const queryParams = new URLSearchParams();
    const dataInizioStr = formatDateToYYYYMMDD(filtri.dataInizio);
    const dataFineStr = formatDateToYYYYMMDD(filtri.dataFine);
    const ricercaKeyword = filtri.ricercaKeyword?.trim();

    if (dataInizioStr) queryParams.append("dataInizio", dataInizioStr);
    if (dataFineStr) queryParams.append("dataFine", dataFineStr);
    if (ricercaKeyword) queryParams.append("keyword", ricercaKeyword);

    const resp = await fetch(`${ezystaffBEUrl}turni?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        accept: "application/json",
      },
      credentials: "include",
    });

    if (resp.ok) setTurni(await resp.json());
  };

  const getStatoContratto = (operatore: string): StatoContratto | null => {
    const key = operatore?.trim().toLowerCase();
    if (!key) return null;
    return statoContrattoByOperatore[key] ?? "ASSENTE";
  };

  const renderBadgeContratto = (operatore: string) => {
    const stato = getStatoContratto(operatore);
    if (!stato) return <span className="text-[#9a9a9a]">—</span>;

    const config = {
      REGOLARE: { label: "In regola", className: "border-[#b9e5d5] bg-[#e9f7f1] text-[#007a55]" },
      SCADUTO: { label: "Non in regola", className: "border-[#f0c48a] bg-[#fff4e5] text-[#a45b00]" },
      ASSENTE: { label: "Assente", className: "border-[#efb8b8] bg-[#fff0f0] text-[#b84242]" },
    }[stato];

    return (
      <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-extrabold ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleExportToExcel = () => {
    const dataToExport = turni.map((turno) => ({
      DataTurno: turno.dataTurno ? format(new Date(turno.dataTurno), "dd/MM/yyyy") : "",
      NomeEvento: turno.nomeEvento,
      OraInizio: turno.oraInizio,
      OraFine: turno.oraFine,
      Operatore: turno.operatore,
      Contratto: getStatoContratto(turno.operatore) ?? "",
      Mansione: turno.tipoMansione,
      TipologiaAttività: turno.tipologiaTurno,
      OrePausa: turno.orePausa,
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "TurniCompleti");
    XLSX.writeFile(workbook, "tutti_i_turni.xlsx");
  };

  const navigaSuSingoloEvento = (idEvento: number, dataTurno?: Date) => {
    if (!dataTurno) return;
    window.open(`/admin/gestione-turni/${idEvento}/${format(new Date(dataTurno), "yyyy-MM-dd")}`, "_blank", "noopener,noreferrer");
  };

  const navigaAlDettaglioEvento = (idEvento: number) => {
    window.location.href = `/admin/gestione-turni/${idEvento}`;
  };

  const isMancataTimbratura = (dataTurno: Date | undefined, oraInizio: string): boolean => {
    if (!dataTurno || !oraInizio) return false;
    const turnoDate = new Date(dataTurno);
    const [oreStr, minutiStr] = oraInizio.split(":");
    turnoDate.setHours(parseInt(oreStr, 10), parseInt(minutiStr, 10), 0, 0);
    return turnoDate < new Date();
  };

  const titoloEvento = (turno: TurnoCompleto) =>
    (turno.nomeEvento?.trim() ? turno.nomeEvento : `${turno.nomeBrand ?? ""} - ${turno.ragioneSociale ?? ""}`).toUpperCase();

  return (
    <section className="m-6" style={{ fontFamily: "'Mulish', sans-serif" }}>
      <div className="mb-5 flex items-center justify-between gap-6 border-b border-[#e4ebe8] pb-5">
        <div>
          <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#007a55]">Planning turni</h1>
          <p className="mt-1 text-[14px] font-medium text-[#7a7a7a]">Consulta la pianificazione dei turni, filtra per periodo e apri rapidamente il dettaglio dell’evento.</p>
        </div>
      </div>

      <div className="mb-2 flex flex-wrap items-end gap-3 rounded-xl border border-[#e4ebe8] bg-[#f7f9f8] p-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
        <div className="w-[230px]">
          <label className="mb-1.5 block text-[12px] font-bold text-[#6d6d6d]">Ricerca</label>
          <Input type="text" placeholder="Keyword, evento, operatore..." value={filtriRicerca?.ricercaKeyword ?? ""} onChange={(e) => setRicercaKeyword(e.target.value)} className="h-10 rounded-lg border-[#d8dfdc] bg-white text-[14px]" />
        </div>

        <div className="w-[170px]">
          <label className="mb-1.5 block text-[12px] font-bold text-[#6d6d6d]">Dal</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 w-full justify-between rounded-lg border-[#d8dfdc] bg-white px-3 text-[14px] font-medium text-[#4f4f4f]">
                {filtriRicerca?.dataInizio ? filtriRicerca.dataInizio.toLocaleDateString("it-IT") : "Seleziona data"}
                <CalendarIcon className="h-4 w-4 text-[#007a55]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filtriRicerca?.dataInizio} onSelect={setDataInizio} locale={it} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <div className="w-[170px]">
          <label className="mb-1.5 block text-[12px] font-bold text-[#6d6d6d]">Al</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 w-full justify-between rounded-lg border-[#d8dfdc] bg-white px-3 text-[14px] font-medium text-[#4f4f4f]">
                {filtriRicerca?.dataFine ? filtriRicerca.dataFine.toLocaleDateString("it-IT") : "Seleziona data"}
                <CalendarIcon className="h-4 w-4 text-[#007a55]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={filtriRicerca?.dataFine} onSelect={setDataFine} locale={it} className="pointer-events-auto" />
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={() => filtriRicerca && caricaTurni(filtriRicerca)} className="h-10 rounded-lg bg-[#007a55] px-5 text-[14px] font-extrabold text-white hover:bg-[#006f4d]">Filtra</Button>
        <div className="mx-1 h-8 w-px self-end bg-[#d8dfdc]" />
        <Button variant="outline" onClick={() => handleGiornoClick(0)} className="h-10 rounded-full border-[#007a55] bg-white px-5 text-[14px] font-bold text-[#007a55] hover:bg-white hover:text-[#005f43]">Oggi</Button>
        <Button variant="outline" onClick={() => handleGiornoClick(1)} className="h-10 rounded-full border-[#007a55] bg-white px-5 text-[14px] font-bold text-[#007a55] hover:bg-white hover:text-[#005f43]">Domani</Button>
        <Button onClick={handleExportToExcel} className="ml-auto h-10 rounded-xl border border-[#c8d8d2] bg-white px-5 text-[14px] font-bold text-[#007a55] shadow-none transition-colors duration-200 hover:border-[#007a55] hover:bg-[#007a55] hover:text-white">
          <Download className="h-4 w-4" />
          Scarica CSV
        </Button>
      </div>

      <div className="overflow-x-auto rounded-md border bg-gray-50 p-4">
        <Table className="table-fixed min-w-[1180px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[11%]">Ora inizio</TableHead>
              <TableHead className="w-[11%]">Ora fine</TableHead>
              <TableHead className="w-[22%]">Operatore</TableHead>
              <TableHead className="w-[15%]">Contratto</TableHead>
              <TableHead className="w-[20%]">Mansione</TableHead>
              <TableHead className="w-[14%]">Tipo turno</TableHead>
              <TableHead className="w-[7%] whitespace-nowrap">Pausa h.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {turni.map((turno, index) => {
              const prevTurno = turni[index - 1];
              const isNewDate = index === 0 || (prevTurno?.dataTurno && turno.dataTurno && format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") !== format(new Date(turno.dataTurno), "yyyy-MM-dd"));
              const isNewEvento = prevTurno && turno.dataTurno && prevTurno.dataTurno && format(new Date(prevTurno.dataTurno), "yyyy-MM-dd") === format(new Date(turno.dataTurno), "yyyy-MM-dd") && prevTurno.nomeEvento !== turno.nomeEvento;

              return (
                <React.Fragment key={`${turno.idTurno}-${index}`}>
                  {isNewDate && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-[#007a55] text-white">
                        <div className="flex justify-between gap-4">
                          <span className="w-[10%] font-bold">{turno.dataTurno ? format(new Date(turno.dataTurno), "dd/MM/yyyy") : ""}</span>
                          <button type="button" onClick={() => navigaAlDettaglioEvento(turno.idEvento)} className="w-[45%] text-left uppercase font-bold underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm" title="Apri dettaglio evento">
                            {titoloEvento(turno)}
                          </button>
                          <span className="w-[45%] text-right">{turno.via}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  {!isNewDate && isNewEvento && (
                    <TableRow>
                      <TableCell colSpan={7} className="bg-[#8f8f8f] text-white">
                        <div className="flex justify-between gap-4">
                          <span className="w-[10%] font-bold">{turno.dataTurno ? format(new Date(turno.dataTurno), "dd/MM/yyyy") : ""}</span>
                          <button type="button" onClick={() => navigaAlDettaglioEvento(turno.idEvento)} className="w-[45%] text-left uppercase font-bold underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm" title="Apri dettaglio evento">
                            {titoloEvento(turno)}
                          </button>
                          <span className="w-[45%] text-right">{turno.via}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}

                  <TableRow onClick={() => navigaSuSingoloEvento(turno.idEvento, turno.dataTurno)} className="cursor-pointer">
                    <TableCell>{turno.oraInizio}</TableCell>
                    <TableCell>{turno.oraFine}</TableCell>
                    <TableCell>
                      <div className="flex min-w-0 items-center gap-2">
                        <Circle
                          className="shrink-0"
                          size={10}
                          strokeWidth={0}
                          fill={turno.idCheckInCheckOut !== null ? "#00D68E" : isMancataTimbratura(turno.dataTurno, turno.oraInizio) ? "red" : "#B8B8B8"}
                          color={turno.idCheckInCheckOut !== null ? "#00D68E" : isMancataTimbratura(turno.dataTurno, turno.oraInizio) ? "#EA6B62" : "#B8B8B8"}
                        />
                        <span className="truncate">{turno.operatore || "—"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{renderBadgeContratto(turno.operatore)}</TableCell>
                    <TableCell className="truncate">{turno.tipoMansione}</TableCell>
                    <TableCell className="truncate">{turno.tipologiaTurno}</TableCell>
                    <TableCell>{turno.orePausa}</TableCell>
                  </TableRow>
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </section>
  );
};

export default Turni;
