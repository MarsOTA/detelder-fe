import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Pencil,
  ArrowUp,
  ArrowDown,
  KeyRound,
  ListChecks,
  Flame,
  BriefcaseMedical,
  ShieldUser,
  HeartPlus,
  Columns3,
  ChevronDown,
  ChevronRight,
  ChevronsDown,
  ChevronsUp,
  CheckCircle2,
  AlertTriangle,
  MinusCircle,
  Paperclip,
  RotateCcw,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import type { Dipendente } from "@/entity";
import { prefissi } from "@/pages/admin/utils/prefissi";

type StatoContratto = "REGOLARE" | "SCADUTO" | "ASSENTE";
type ColonnaSelezionabile = "nickname" | "email" | "telefono" | "attestati";
type StatoAllegatoFiltro = "MANCANTE" | "SCADUTO";
type ModalitaAllegatiFiltro = "ALMENO_UNO" | "TUTTI";

type StatoContrattoResponse = {
  idOperatore: number;
  statoContratto: StatoContratto;
};

type AttestatiOperatore = {
  idOperatore: number;
  antincendioPresente: number;
  antincendioDataScadenza: string | null;
  primoSoccorsoPresente: number;
  primoSoccorsoDataScadenza: string | null;
  sicurezzaLavoroPresente: number;
  sicurezzaLavoroDataScadenza: string | null;
  blsdPresente: number;
  blsdDataScadenza: string | null;
};

type AllegatiOperatore = {
  cartaIdentitaImgFronte?: string | null;
  cartaIdentitaImgRetro?: string | null;
  tesseraSanitariaImgFronte?: string | null;
  tesseraSanitariaImgRetro?: string | null;
  permessoSoggiornoImgFronte?: string | null;
  permessoSoggiornoImgRetro?: string | null;
  passaportoImgFronte?: string | null;
  passaportoImgRetro?: string | null;
  antincendioDocFronte?: string | null;
  antincendioDocRetro?: string | null;
  primoSoccorsoAttestatoFronte?: string | null;
  primoSoccorsoAttestatoRetro?: string | null;
  formazioneSicurezzaLavoroAttestatoFronte?: string | null;
  formazioneSicurezzaLavoroAttestatoRetro?: string | null;
  blsdAttestatoFronte?: string | null;
  blsdAttestatoRetro?: string | null;
  attestatoPrepostoFronte?: string | null;
  attestatoPrepostoRetro?: string | null;
  attestatoSecurityManagerFronte?: string | null;
};

type DipendenteConAllegati = Dipendente & AllegatiOperatore;

type DocumentoStatus = {
  key: string;
  label: string;
  presente: boolean;
  dataScadenza?: string | null;
  mostraScadenza?: boolean;
};

type DocumentoFiltroOption = {
  key: string;
  label: string;
  gruppo: "IDENTITA" | "ATTESTATI";
};

const statoContrattoOptions: { value: StatoContratto; label: string }[] = [
  { value: "REGOLARE", label: "In regola" },
  { value: "SCADUTO", label: "Non in regola" },
  { value: "ASSENTE", label: "Assente" },
];

const colonneOptions: { value: ColonnaSelezionabile; label: string }[] = [
  { value: "nickname", label: "Nickname" },
  { value: "email", label: "Email" },
  { value: "telefono", label: "Telefono" },
  { value: "attestati", label: "Attestati" },
];

const documentiFiltroOptions: DocumentoFiltroOption[] = [
  { key: "carta-identita", label: "Carta d'identità", gruppo: "IDENTITA" },
  { key: "tessera-sanitaria", label: "Tessera sanitaria", gruppo: "IDENTITA" },
  { key: "permesso-soggiorno", label: "Permesso soggiorno", gruppo: "IDENTITA" },
  { key: "passaporto", label: "Passaporto", gruppo: "IDENTITA" },
  { key: "antincendio", label: "Antincendio", gruppo: "ATTESTATI" },
  { key: "primo-soccorso", label: "Primo soccorso", gruppo: "ATTESTATI" },
  { key: "sicurezza-lavoro", label: "Sicurezza lavoro", gruppo: "ATTESTATI" },
  { key: "blsd", label: "BLSD", gruppo: "ATTESTATI" },
  { key: "preposto", label: "Preposto", gruppo: "ATTESTATI" },
  { key: "security-manager", label: "Security Manager", gruppo: "ATTESTATI" },
];

const Operatori = () => {
  const [formData, setFormData] = useState({ nome: "", cognome: "", email: "", prefisso: "", telefono: "", gpg: false });
  const navigate = useNavigate();
  const [dipendenti, setDipendenti] = useState<Dipendente[]>([]);
  const [statiContratto, setStatiContratto] = useState<Record<number, StatoContratto>>({});
  const [attestatiOperatori, setAttestatiOperatori] = useState<Record<number, AttestatiOperatore>>({});
  const [allegatiOperatori, setAllegatiOperatori] = useState<Record<number, AllegatiOperatore>>({});
  const [expandedOperatori, setExpandedOperatori] = useState<Set<number>>(new Set());
  const [loadingAllegati, setLoadingAllegati] = useState<Set<number>>(new Set());
  const [colonneVisibili, setColonneVisibili] = useState<Record<ColonnaSelezionabile, boolean>>({ nickname: false, email: true, telefono: true, attestati: true });
  const [statiSelezionati, setStatiSelezionati] = useState<StatoContratto[]>(["REGOLARE", "SCADUTO", "ASSENTE"]);
  const [statiAllegatiSelezionati, setStatiAllegatiSelezionati] = useState<StatoAllegatoFiltro[]>(["MANCANTE"]);
  const [documentiAllegatiSelezionati, setDocumentiAllegatiSelezionati] = useState<string[]>([]);
  const [modalitaAllegatiFiltro, setModalitaAllegatiFiltro] = useState<ModalitaAllegatiFiltro>("ALMENO_UNO");
  const [qualsiasiAllegatoMancante, setQualsiasiAllegatoMancante] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  type SortDirection = "asc" | "desc";
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [ricercaKeyword, setRicercaKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    caricaOperatoriEContratti();
  }, []);

  const handleEdit = (dipendente: Dipendente) => navigate(`/admin/dettaglio-operatore/${dipendente.id}`);
  const mostraPresenze = (dipendente: Dipendente) => navigate(`/admin/timbrature-operatore/${dipendente.id}`);

  const reinviaPassword = async (dipendente: Dipendente) => {
    const conferma = window.confirm(`Vuoi inviare nuovamente la password a ${dipendente.nome} ${dipendente.cognome}?`);
    if (!conferma) return;
    setIsLoading(true);
    try {
      const resp = await fetch(`${ezystaffBEUrl}operatori/reinviaPassword/${dipendente.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", Accept: "application/json" },
        credentials: "include",
      });
      if (!resp.ok) throw new Error(`Errore nella richiesta: ${resp.status}`);
      const data = await resp.json();
      alert(data.message);
      return data;
    } catch (error) {
      console.error("Errore durante l'invio della password:", error);
      alert(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewOperator = () => {
    setFormData({ nome: "", cognome: "", email: "", prefisso: "+39", telefono: "", gpg: false });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const resp = await fetch(ezystaffBEUrl + "operatori", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", accept: "application/json" },
      method: "POST",
      credentials: "include",
      body: JSON.stringify(formData),
    });
    const data = await resp.json();
    setIsDialogOpen(false);
    await caricaOperatoriEContratti();
    if (!data.success) alert(`Errore: ${data.message}\nDettagli: ${data.error || "Nessun dettaglio disponibile"}`);
  };

  const fetchOperatori = async () => {
    const resp = await fetch(ezystaffBEUrl + "operatori", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", accept: "application/json" },
      credentials: "include",
    });
    if (!resp.ok) throw new Error(`Errore caricamento operatori: ${resp.status}`);
    setDipendenti(await resp.json());
  };

  const fetchStatiContratto = async () => {
    const resp = await fetch(ezystaffBEUrl + "operatori/statoContratti", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", accept: "application/json" },
      credentials: "include",
    });
    if (!resp.ok) throw new Error(`Errore caricamento contratti: ${resp.status}`);
    const data: StatoContrattoResponse[] = await resp.json();
    setStatiContratto(data.reduce<Record<number, StatoContratto>>((acc, item) => {
      acc[item.idOperatore] = item.statoContratto;
      return acc;
    }, {}));
  };

  const fetchAttestatiOperatori = async () => {
    const resp = await fetch(ezystaffBEUrl + "operatori/attestati", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", accept: "application/json" },
      credentials: "include",
    });
    if (!resp.ok) throw new Error(`Errore caricamento attestati: ${resp.status}`);
    const data: AttestatiOperatore[] = await resp.json();
    setAttestatiOperatori(data.reduce<Record<number, AttestatiOperatore>>((acc, item) => {
      acc[item.idOperatore] = item;
      return acc;
    }, {}));
  };

  const fetchAllegatiOperatore = async (idOperatore: number) => {
    if (allegatiOperatori[idOperatore] || loadingAllegati.has(idOperatore)) return;
    setLoadingAllegati((prev) => new Set(prev).add(idOperatore));
    try {
      const resp = await fetch(`${ezystaffBEUrl}operatori/allegatiOperatore/${idOperatore}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json", accept: "application/json" },
        credentials: "include",
      });
      if (!resp.ok) throw new Error(`Errore caricamento stato allegati: ${resp.status}`);
      const data: AllegatiOperatore = await resp.json();
      setAllegatiOperatori((prev) => ({ ...prev, [idOperatore]: data || {} }));
    } catch (error) {
      console.error(`Errore caricamento stato allegati operatore ${idOperatore}:`, error);
      setAllegatiOperatori((prev) => ({ ...prev, [idOperatore]: {} }));
    } finally {
      setLoadingAllegati((prev) => {
        const next = new Set(prev);
        next.delete(idOperatore);
        return next;
      });
    }
  };

  const caricaOperatoriEContratti = async () => {
    try {
      await Promise.all([fetchOperatori(), fetchStatiContratto(), fetchAttestatiOperatori()]);
    } catch (error) {
      console.error("Errore caricamento lista operatori:", error);
    }
  };

  const handleGpgChange = (gpg: boolean) => setFormData((prev) => ({ ...prev, gpg }));
  const toggleStatoContratto = (stato: StatoContratto) => setStatiSelezionati((prev) => prev.includes(stato) ? prev.filter((item) => item !== stato) : [...prev, stato]);
  const toggleColonna = (colonna: ColonnaSelezionabile) => setColonneVisibili((prev) => ({ ...prev, [colonna]: !prev[colonna] }));
  const toggleStatoAllegato = (stato: StatoAllegatoFiltro) => setStatiAllegatiSelezionati((prev) => prev.includes(stato) ? prev.filter((item) => item !== stato) : [...prev, stato]);
  const toggleDocumentoAllegato = (key: string) => {
    setQualsiasiAllegatoMancante(false);
    setDocumentiAllegatiSelezionati((prev) => prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]);
  };
  const resetFiltroAllegati = () => {
    setStatiAllegatiSelezionati(["MANCANTE"]);
    setDocumentiAllegatiSelezionati([]);
    setModalitaAllegatiFiltro("ALMENO_UNO");
    setQualsiasiAllegatoMancante(false);
  };

  const getStatoContrattoLabel = (stato?: StatoContratto) => {
    if (stato === "REGOLARE") return "In regola";
    if (stato === "SCADUTO") return "Non in regola";
    return "Assente";
  };

  const renderStatoContratto = (stato?: StatoContratto) => {
    if (stato === "REGOLARE") return <span className="inline-flex min-w-[94px] items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[12px] font-extrabold text-emerald-700">In regola</span>;
    if (stato === "SCADUTO") return <span className="inline-flex min-w-[110px] items-center justify-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[12px] font-extrabold text-orange-700">Non in regola</span>;
    return <span className="inline-flex min-w-[84px] items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[12px] font-extrabold text-red-600">Assente</span>;
  };

  const isAttestatoScaduto = (dataScadenza?: string | null) => {
    if (!dataScadenza) return false;
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    const scadenza = new Date(dataScadenza);
    scadenza.setHours(0, 0, 0, 0);
    return scadenza < oggi;
  };

  const formatData = (data?: string | null) => {
    if (!data) return "";
    const parsed = new Date(data);
    if (Number.isNaN(parsed.getTime())) return data;
    return parsed.toLocaleDateString("it-IT");
  };

  const renderAttestati = (idOperatore: number) => {
    const attestati = attestatiOperatori[idOperatore];
    if (!attestati) return null;
    const icone = [
      { key: "antincendio", presente: Boolean(attestati.antincendioPresente), dataScadenza: attestati.antincendioDataScadenza, label: "Antincendio", Icon: Flame },
      { key: "primoSoccorso", presente: Boolean(attestati.primoSoccorsoPresente), dataScadenza: attestati.primoSoccorsoDataScadenza, label: "Primo soccorso", Icon: BriefcaseMedical },
      { key: "sicurezzaLavoro", presente: Boolean(attestati.sicurezzaLavoroPresente), dataScadenza: attestati.sicurezzaLavoroDataScadenza, label: "Sicurezza sul lavoro", Icon: ShieldUser },
      { key: "blsd", presente: Boolean(attestati.blsdPresente), dataScadenza: attestati.blsdDataScadenza, label: "BLSD", Icon: HeartPlus },
    ].filter((item) => item.presente);
    if (icone.length === 0) return null;
    return (
      <div className="flex items-center gap-2">
        {icone.map(({ key, dataScadenza, label, Icon }) => {
          const scaduto = isAttestatoScaduto(dataScadenza);
          const title = `${label}${scaduto ? " - scaduto" : ""}${dataScadenza ? ` (${dataScadenza})` : ""}`;
          return <span key={key} title={title} aria-label={title}><Icon className={`h-5 w-5 ${scaduto ? "text-orange-500" : "text-[#8a8a8a]"}`} strokeWidth={1.8} /></span>;
        })}
      </div>
    );
  };

  const getDocumentiIdentitaDaAllegati = (a: AllegatiOperatore): DocumentoStatus[] => [
    { key: "carta-identita", label: "Carta d'identità", presente: Boolean(a.cartaIdentitaImgFronte || a.cartaIdentitaImgRetro) },
    { key: "tessera-sanitaria", label: "Tessera sanitaria", presente: Boolean(a.tesseraSanitariaImgFronte || a.tesseraSanitariaImgRetro) },
    { key: "permesso-soggiorno", label: "Permesso soggiorno", presente: Boolean(a.permessoSoggiornoImgFronte || a.permessoSoggiornoImgRetro) },
    { key: "passaporto", label: "Passaporto", presente: Boolean(a.passaportoImgFronte || a.passaportoImgRetro) },
  ];

  const getAttestatiDaAllegati = (a: AllegatiOperatore, stato?: AttestatiOperatore): DocumentoStatus[] => [
    { key: "antincendio", label: "Antincendio", presente: Boolean(a.antincendioDocFronte || a.antincendioDocRetro || stato?.antincendioPresente), dataScadenza: stato?.antincendioDataScadenza, mostraScadenza: true },
    { key: "primo-soccorso", label: "Primo soccorso", presente: Boolean(a.primoSoccorsoAttestatoFronte || a.primoSoccorsoAttestatoRetro || stato?.primoSoccorsoPresente), dataScadenza: stato?.primoSoccorsoDataScadenza, mostraScadenza: true },
    { key: "sicurezza-lavoro", label: "Sicurezza lavoro", presente: Boolean(a.formazioneSicurezzaLavoroAttestatoFronte || a.formazioneSicurezzaLavoroAttestatoRetro || stato?.sicurezzaLavoroPresente), dataScadenza: stato?.sicurezzaLavoroDataScadenza, mostraScadenza: true },
    { key: "blsd", label: "BLSD", presente: Boolean(a.blsdAttestatoFronte || a.blsdAttestatoRetro || stato?.blsdPresente), dataScadenza: stato?.blsdDataScadenza, mostraScadenza: true },
    { key: "preposto", label: "Preposto", presente: Boolean(a.attestatoPrepostoFronte || a.attestatoPrepostoRetro) },
    { key: "security-manager", label: "Security Manager", presente: Boolean(a.attestatoSecurityManagerFronte) },
  ];

  const getDocumentiIdentita = (idOperatore: number): DocumentoStatus[] => getDocumentiIdentitaDaAllegati(allegatiOperatori[idOperatore] || {});

  const getAttestatiDettaglio = (idOperatore: number): DocumentoStatus[] => getAttestatiDaAllegati(allegatiOperatori[idOperatore] || {}, attestatiOperatori[idOperatore]);

  const getDocumentiPerFiltro = (dipendente: Dipendente): DocumentoStatus[] => {
    const allegatiDallaLista = dipendente as DipendenteConAllegati;
    return [
      ...getDocumentiIdentitaDaAllegati(allegatiDallaLista),
      ...getAttestatiDaAllegati(allegatiDallaLista, attestatiOperatori[dipendente.id]),
    ];
  };

  const documentoRispettaStatiFiltro = (documento: DocumentoStatus) => {
    if (statiAllegatiSelezionati.length === 0) return true;
    return statiAllegatiSelezionati.some((stato) => {
      if (stato === "MANCANTE") return !documento.presente;
      if (stato === "SCADUTO") return documento.presente && Boolean(documento.mostraScadenza) && isAttestatoScaduto(documento.dataScadenza);
      return false;
    });
  };

  const matchesFiltroAllegati = (dipendente: Dipendente) => {
    const documenti = getDocumentiPerFiltro(dipendente);

    if (qualsiasiAllegatoMancante) {
      return documenti.some((documento) => !documento.presente);
    }

    if (documentiAllegatiSelezionati.length === 0) return true;

    const selezionati = documentiAllegatiSelezionati
      .map((key) => documenti.find((documento) => documento.key === key))
      .filter((documento): documento is DocumentoStatus => Boolean(documento));

    if (selezionati.length === 0) return true;

    return modalitaAllegatiFiltro === "TUTTI"
      ? selezionati.every(documentoRispettaStatiFiltro)
      : selezionati.some(documentoRispettaStatiFiltro);
  };

  const renderDocumentoStatus = (documento: DocumentoStatus) => {
    const scaduto = documento.presente && documento.mostraScadenza && isAttestatoScaduto(documento.dataScadenza);
    const title = !documento.presente
      ? `${documento.label} - Non caricato`
      : scaduto
        ? `${documento.label} - Scaduto${documento.dataScadenza ? ` ${formatData(documento.dataScadenza)}` : ""}`
        : `${documento.label} - Caricato${documento.mostraScadenza && documento.dataScadenza ? ` - Scade ${formatData(documento.dataScadenza)}` : ""}`;

    return (
      <span
        key={documento.key}
        title={title}
        className={`inline-flex h-7 items-center gap-1.5 rounded-full border px-2.5 text-[12px] font-bold whitespace-nowrap ${
          !documento.presente
            ? "border-[#d9dfdc] bg-[#f5f7f6] text-[#7c8580]"
            : scaduto
              ? "border-orange-200 bg-orange-50 text-orange-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        {!documento.presente ? (
          <MinusCircle className="h-3.5 w-3.5 shrink-0" />
        ) : scaduto ? (
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        ) : (
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        )}
        <span>{documento.label}</span>
        {scaduto && <span className="font-extrabold">· Scaduto</span>}
        {documento.presente && !scaduto && documento.mostraScadenza && documento.dataScadenza && (
          <span className="font-semibold opacity-80">· {formatData(documento.dataScadenza)}</span>
        )}
      </span>
    );
  };

  const toggleOperatore = async (idOperatore: number) => {
    const isExpanded = expandedOperatori.has(idOperatore);
    setExpandedOperatori((prev) => {
      const next = new Set(prev);
      if (isExpanded) next.delete(idOperatore);
      else next.add(idOperatore);
      return next;
    });
    if (!isExpanded) await fetchAllegatiOperatore(idOperatore);
  };

  const handleExportToExcel = () => {
    const dataToExport = dipendenti.map((d) => ({ Cognome: d.cognome, Nome: d.nome, Email: d.email, Telefono: `${d.prefisso}/${d.telefono}`, Contratto: getStatoContrattoLabel(statiContratto[d.id]) }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Operatori");
    XLSX.writeFile(workbook, "operatori.xlsx");
  };

  const filteredAndSortedDipendenti = useMemo(() => {
    const keyword = ricercaKeyword.toLowerCase();
    return [...dipendenti]
      .filter((dipendente) => {
        const matchesKeyword = dipendente.cognome.toLowerCase().includes(keyword) || dipendente.nome.toLowerCase().includes(keyword) || (dipendente.nickname ?? "").toLowerCase().includes(keyword) || dipendente.email.toLowerCase().includes(keyword) || dipendente.telefono.toLowerCase().includes(keyword);
        const stato = statiContratto[dipendente.id] ?? "ASSENTE";
        return matchesKeyword && statiSelezionati.includes(stato) && matchesFiltroAllegati(dipendente);
      })
      .sort((a, b) => {
        const cognomeA = a.cognome.toLowerCase();
        const cognomeB = b.cognome.toLowerCase();
        if (cognomeA < cognomeB) return sortDirection === "asc" ? -1 : 1;
        if (cognomeA > cognomeB) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
  }, [dipendenti, ricercaKeyword, sortDirection, statiContratto, statiSelezionati, attestatiOperatori, statiAllegatiSelezionati, documentiAllegatiSelezionati, modalitaAllegatiFiltro, qualsiasiAllegatoMancante]);

  const espandiTutto = async () => {
    const ids = filteredAndSortedDipendenti.map((d) => d.id);
    setExpandedOperatori(new Set(ids));
    await Promise.all(ids.map((id) => fetchAllegatiOperatore(id)));
  };

  const comprimiTutto = () => setExpandedOperatori(new Set());
  const numeroColonneOpzionaliVisibili = Object.values(colonneVisibili).filter(Boolean).length;
  const numeroColonneTotali = 4 + numeroColonneOpzionaliVisibili;
  const filtroAllegatiAttivo = qualsiasiAllegatoMancante || documentiAllegatiSelezionati.length > 0;
  const numeroFiltriAllegati = qualsiasiAllegatoMancante ? 1 : documentiAllegatiSelezionati.length;

  return (
    <section className="m-6" style={{ fontFamily: "'Mulish', sans-serif" }}>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-6 border-b border-[#e4ebe8] pb-5">
          <div>
            <h1 className="text-[38px] font-extrabold leading-[1.05] tracking-[-0.035em] text-[#007a55]">Lista operatori</h1>
            <p className="mt-1 text-[14px] font-medium text-[#7a7a7a]">Consulta gli operatori, gestisci i profili e accedi rapidamente a presenze e credenziali.</p>
          </div>
          <Button onClick={handleNewOperator} className="h-10 rounded-xl bg-[#007a55] px-5 text-[14px] font-extrabold text-white shadow-[0_5px_14px_rgba(0,122,85,0.15)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#006f4d]">Crea nuovo operatore</Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#ecf3f1] px-6 py-4">
          <div className="flex flex-wrap items-center gap-3">
            <Input type="text" placeholder="Ricerca per keyword" value={ricercaKeyword} onChange={(e) => setRicercaKeyword(e.target.value)} className="w-[280px] rounded-xl border border-gray-300 bg-white px-3 py-2" />

            <Popover>
              <PopoverTrigger asChild><Button variant="outline" className="h-10 min-w-[180px] justify-between rounded-xl border border-[#b8d2c8] bg-white px-4 font-bold text-[#007a55] hover:bg-[#f7fbf9] hover:text-[#006f4d]">Contratto ({statiSelezionati.length})</Button></PopoverTrigger>
              <PopoverContent align="start" className="w-[220px] p-3">
                <div className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#656565]">Stato contratto</div>
                <div className="space-y-2">
                  {statoContrattoOptions.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[14px] font-semibold text-[#3f4942] hover:bg-[#f3f8f6]">
                      <input type="checkbox" checked={statiSelezionati.includes(option.value)} onChange={() => toggleStatoContratto(option.value)} className="h-4 w-4 accent-[#007a55]" />
                      {option.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={`h-10 min-w-[165px] justify-between rounded-xl border px-4 font-bold ${filtroAllegatiAttivo ? "border-[#007a55] bg-[#e6f4ef] text-[#006f4d]" : "border-[#b8d2c8] bg-white text-[#007a55]"} hover:bg-[#f7fbf9] hover:text-[#006f4d]`}>
                  <span className="flex items-center gap-2"><Paperclip className="h-4 w-4" />Allegati{filtroAllegatiAttivo ? ` (${numeroFiltriAllegati})` : ""}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[390px] p-0">
                <div className="border-b border-[#e3ebe7] px-4 py-3">
                  <div className="text-[14px] font-extrabold text-[#26342e]">Filtra per stato allegati</div>
                  <div className="mt-0.5 text-[12px] text-[#7a837e]">Trova rapidamente gli operatori con documenti mancanti o attestati scaduti.</div>
                </div>

                <div className="max-h-[520px] overflow-y-auto p-4">
                  <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-xl border border-[#cfe2da] bg-[#f3f8f6] p-3">
                    <input type="checkbox" checked={qualsiasiAllegatoMancante} onChange={(e) => { setQualsiasiAllegatoMancante(e.target.checked); if (e.target.checked) setDocumentiAllegatiSelezionati([]); }} className="mt-0.5 h-4 w-4 accent-[#007a55]" />
                    <span>
                      <span className="block text-[13px] font-extrabold text-[#007a55]">Qualsiasi allegato mancante</span>
                      <span className="block text-[11px] leading-4 text-[#728079]">Mostra tutti gli operatori che hanno almeno un documento o attestato non caricato.</span>
                    </span>
                  </label>

                  <div className="mb-4">
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#6a756f]">Stato</div>
                    <div className="flex gap-2">
                      <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[#dbe5e1] px-3 py-2 text-[12px] font-bold text-[#3f4942]">
                        <input type="checkbox" checked={statiAllegatiSelezionati.includes("MANCANTE")} onChange={() => toggleStatoAllegato("MANCANTE")} className="h-4 w-4 accent-[#007a55]" />Non caricato
                      </label>
                      <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-lg border border-[#f0d7bf] px-3 py-2 text-[12px] font-bold text-[#8d5a21]">
                        <input type="checkbox" checked={statiAllegatiSelezionati.includes("SCADUTO")} onChange={() => toggleStatoAllegato("SCADUTO")} className="h-4 w-4 accent-[#d97706]" />Scaduto
                      </label>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#007a55]">Documenti d'identità</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {documentiFiltroOptions.filter((option) => option.gruppo === "IDENTITA").map((option) => (
                        <label key={option.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[12px] font-semibold text-[#39433e] hover:bg-[#f3f8f6]">
                          <input type="checkbox" checked={documentiAllegatiSelezionati.includes(option.key)} onChange={() => toggleDocumentoAllegato(option.key)} className="h-4 w-4 accent-[#007a55]" />{option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#007a55]">Attestati</div>
                    <div className="grid grid-cols-2 gap-1.5">
                      {documentiFiltroOptions.filter((option) => option.gruppo === "ATTESTATI").map((option) => (
                        <label key={option.key} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-[12px] font-semibold text-[#39433e] hover:bg-[#f3f8f6]">
                          <input type="checkbox" checked={documentiAllegatiSelezionati.includes(option.key)} onChange={() => toggleDocumentoAllegato(option.key)} className="h-4 w-4 accent-[#007a55]" />{option.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl border border-[#e2e8e5] bg-[#fafbfa] p-3">
                    <div className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#6a756f]">Quando selezioni più allegati</div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className={`cursor-pointer rounded-lg border p-2.5 ${modalitaAllegatiFiltro === "ALMENO_UNO" ? "border-[#8bc7b1] bg-[#edf7f3]" : "border-[#dfe6e3] bg-white"}`}>
                        <input type="radio" name="modalita-allegati" checked={modalitaAllegatiFiltro === "ALMENO_UNO"} onChange={() => setModalitaAllegatiFiltro("ALMENO_UNO")} className="mr-2 accent-[#007a55]" />
                        <span className="text-[12px] font-extrabold text-[#34423c]">Almeno uno</span>
                      </label>
                      <label className={`cursor-pointer rounded-lg border p-2.5 ${modalitaAllegatiFiltro === "TUTTI" ? "border-[#8bc7b1] bg-[#edf7f3]" : "border-[#dfe6e3] bg-white"}`}>
                        <input type="radio" name="modalita-allegati" checked={modalitaAllegatiFiltro === "TUTTI"} onChange={() => setModalitaAllegatiFiltro("TUTTI")} className="mr-2 accent-[#007a55]" />
                        <span className="text-[12px] font-extrabold text-[#34423c]">Tutti</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#e3ebe7] px-4 py-3">
                  <Button variant="ghost" onClick={resetFiltroAllegati} className="h-9 gap-2 px-2 text-[12px] font-bold text-[#68736d] hover:bg-[#f2f5f4]"><RotateCcw className="h-3.5 w-3.5" />Azzera</Button>
                  <div className="text-[12px] font-bold text-[#007a55]">{filteredAndSortedDipendenti.length} operatori trovati</div>
                </div>
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild><Button variant="outline" className="h-10 min-w-[150px] justify-between rounded-xl border border-[#b8d2c8] bg-white px-4 font-bold text-[#007a55] hover:bg-[#f7fbf9] hover:text-[#006f4d]"><span className="flex items-center gap-2"><Columns3 className="h-4 w-4" />Colonne ({numeroColonneOpzionaliVisibili})</span></Button></PopoverTrigger>
              <PopoverContent align="start" className="w-[220px] p-3">
                <div className="mb-2 text-[12px] font-extrabold uppercase tracking-wide text-[#656565]">Colonne visibili</div>
                <div className="space-y-2">
                  {colonneOptions.map((option) => (
                    <label key={option.value} className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 text-[14px] font-semibold text-[#3f4942] hover:bg-[#f3f8f6]">
                      <input type="checkbox" checked={colonneVisibili[option.value]} onChange={() => toggleColonna(option.value)} className="h-4 w-4 accent-[#007a55]" />
                      {option.label}
                    </label>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-2 border-l border-[#cbd8d3] pl-3">
              <Button variant="outline" onClick={espandiTutto} className="h-10 gap-2 rounded-xl border border-[#b8d2c8] bg-white px-3 font-bold text-[#007a55] hover:bg-[#f7fbf9] hover:text-[#006f4d]"><ChevronsDown className="h-4 w-4" />Espandi tutto</Button>
              <Button variant="outline" onClick={comprimiTutto} className="h-10 gap-2 rounded-xl border border-[#b8d2c8] bg-white px-3 font-bold text-[#007a55] hover:bg-[#f7fbf9] hover:text-[#006f4d]"><ChevronsUp className="h-4 w-4" />Comprimi tutto</Button>
            </div>
          </div>
          <Button className="rounded-xl border border-[#b8d2c8] bg-white px-6 font-bold text-[#007a55] shadow-sm hover:bg-[#f7fbf9] hover:text-[#006f4d]" onClick={handleExportToExcel}>Scarica .csv</Button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#e7e7e7] bg-white">
          <Table className="w-full table-fixed">
            <TableHeader className="bg-[#ebebeb]">
              <TableRow className="text-[15px] font-bold">
                <TableHead className="w-[4%] text-[#656565]" />
                <TableHead className="w-[14%] cursor-pointer whitespace-nowrap text-[#656565]" onClick={() => setSortDirection((prev) => prev === "asc" ? "desc" : "asc")}>Cognome {sortDirection === "asc" ? <ArrowUp className="ml-1 inline h-4 w-4" /> : <ArrowDown className="ml-1 inline h-4 w-4" />}</TableHead>
                <TableHead className="w-[12%] whitespace-nowrap text-[#656565]">Nome</TableHead>
                {colonneVisibili.nickname && <TableHead className="w-[15%] whitespace-nowrap text-[#656565]">Nickname</TableHead>}
                {colonneVisibili.email && <TableHead className="w-[22%] text-[#656565]">Email</TableHead>}
                {colonneVisibili.telefono && <TableHead className="w-[14%] whitespace-nowrap text-[#656565]">Telefono</TableHead>}
                <TableHead className="w-[13%] whitespace-nowrap text-[#656565]">Contratto</TableHead>
                {colonneVisibili.attestati && <TableHead className="w-[13%] whitespace-nowrap text-[#656565]">Attestati</TableHead>}
                <TableHead className="w-[9%] whitespace-nowrap text-left text-[#656565]">Azioni</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredAndSortedDipendenti.map((dipendente) => {
                const expanded = expandedOperatori.has(dipendente.id);
                const loading = loadingAllegati.has(dipendente.id);
                return (
                  <Fragment key={dipendente.id}>
                    <TableRow className={`text-[15px] text-[#2e2e2e] ${expanded ? "bg-[#fbfdfc]" : ""}`}>
                      <TableCell className="px-2">
                        <button type="button" onClick={() => toggleOperatore(dipendente.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-[#007a55] transition-colors hover:bg-[#e7f1ed]" title={expanded ? "Comprimi documenti" : "Espandi documenti"} aria-label={expanded ? "Comprimi documenti" : "Espandi documenti"}>{expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}</button>
                      </TableCell>
                      <TableCell className="font-bold">{dipendente.cognome}</TableCell>
                      <TableCell className="font-bold">{dipendente.nome}</TableCell>
                      {colonneVisibili.nickname && <TableCell className="truncate" title={dipendente.nickname}>{dipendente.nickname || "-"}</TableCell>}
                      {colonneVisibili.email && <TableCell className="truncate" title={dipendente.email}>{dipendente.email}</TableCell>}
                      {colonneVisibili.telefono && <TableCell className="whitespace-nowrap">{dipendente.prefisso}/{dipendente.telefono}</TableCell>}
                      <TableCell>{renderStatoContratto(statiContratto[dipendente.id])}</TableCell>
                      {colonneVisibili.attestati && <TableCell>{renderAttestati(dipendente.id)}</TableCell>}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5 whitespace-nowrap">
                          <Button variant="outline" size="icon" onClick={() => handleEdit(dipendente)} title="Modifica operatore" aria-label="Modifica operatore" className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-[#007a55] bg-white text-[#007a55] transition-colors hover:bg-[#007a55] hover:text-white"><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="outline" size="icon" onClick={() => mostraPresenze(dipendente)} title="Presenze operatore" aria-label="Presenze operatore" className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-[#007a55] bg-white text-[#007a55] transition-colors hover:bg-[#007a55] hover:text-white"><ListChecks className="h-3.5 w-3.5" /></Button>
                          <Button variant="outline" size="icon" onClick={() => reinviaPassword(dipendente)} title="Reinvia password" aria-label="Reinvia password" className="h-8 w-8 shrink-0 cursor-pointer rounded-md border border-[#007a55] bg-white text-[#007a55] transition-colors hover:bg-[#007a55] hover:text-white"><KeyRound className="h-3.5 w-3.5" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expanded && (
                      <TableRow className="border-b border-[#dfe8e4] bg-[#f7faf9] hover:bg-[#f7faf9]">
                        <TableCell colSpan={numeroColonneTotali + 1} className="p-0">
                          <div className="px-12 py-3">
                            {loading ? (
                              <div className="py-2 text-[13px] font-semibold text-[#7a837e]">Verifica stato documenti...</div>
                            ) : (
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="mr-1 text-[11px] font-extrabold uppercase tracking-[0.07em] text-[#007a55]">Documenti d'identità</span>
                                  {getDocumentiIdentita(dipendente.id).map(renderDocumentoStatus)}
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="mr-1 text-[11px] font-extrabold uppercase tracking-[0.07em] text-[#007a55]">Attestati</span>
                                  {getAttestatiDettaglio(dipendente.id).map(renderDocumentoStatus)}
                                </div>
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="flex flex-col items-center gap-4 rounded-xl bg-white px-8 py-6 shadow-lg">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#007a55] border-t-transparent" />
            <span className="text-lg font-semibold text-[#007a55]">Invio in corso...</span>
          </div>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuovo Operatore</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4"><Label>Nome</Label><Input id="nome" value={formData.nome} onChange={(e) => setFormData({ ...formData, nome: e.target.value })} className="col-span-3" required /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label>Cognome</Label><Input id="cognome" value={formData.cognome} onChange={(e) => setFormData({ ...formData, cognome: e.target.value })} className="col-span-3" required /></div>
              <div className="grid grid-cols-4 items-center gap-4"><Label>Email</Label><Input id="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="col-span-3" required /></div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label>Telefono</Label>
                <div className="col-span-3 flex gap-2">
                  <Select value={formData.prefisso} onValueChange={(value) => setFormData({ ...formData, prefisso: value })}>
                    <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{prefissi.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Input id="telefono" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="flex-1" required />
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4"><Label>G.P.G.</Label><Switch checked={formData.gpg} onCheckedChange={handleGpgChange} /></div>
            </div>
            <DialogFooter><Button type="submit">Aggiungi</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Operatori;
