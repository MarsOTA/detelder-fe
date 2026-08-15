import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Trash2, View } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ezystaffBEUrl } from "@/utils/baseUrl";
import { ContrattoChiamataComponent } from "./ContrattoChiamataComponent";
import { ContrattoOccasionaleComponent } from "./ContrattoOccasionaleComponent";
import { ConsegnaBeniFormazioneComponent } from "./ConsegnaBeniFormazioneComponent";

type TipoContratto =
    | "CHIAMATA"
    | "OCCASIONALE"
    | "CONSGNA_BENI_FORMAZIONE"
    | "TEMPO_INDETERMINATO"
    | "TEMPO_DETERMINATO";

type TipoContrattoUpload = "contrattoFirmato" | "contrattoUnilav";

interface ContrattoLista {
    idContratto: number;
    tipologia: TipoContratto;
    dataInizio: string | null;
    dataFine: string | null;
    compensoTotaleLordo: number | null;
    pathContrattoFirmato: string | null;
    pathContrattoUnilav: string | null;
}

const LABEL_TIPO: Record<TipoContratto, string> = {
    CHIAMATA: "Contratto a chiamata",
    OCCASIONALE: "Contratto occasionale",
    CONSGNA_BENI_FORMAZIONE: "Consegna beni e formazione",
    TEMPO_INDETERMINATO: "Contratto a tempo indet.",
    TEMPO_DETERMINATO: "Contratto a tempo det.",
};

const isManuale = (tipo: TipoContratto | null) =>
    tipo === "TEMPO_INDETERMINATO" || tipo === "TEMPO_DETERMINATO";

export function ContrattiOperatoreComponent() {
    const { id } = useParams();
    const [contratti, setContratti] = useState<ContrattoLista[]>([]);
    const [tipoContratto, setTipoContratto] = useState<TipoContratto | null>(null);
    const [loading, setLoading] = useState(false);
    const [messaggio, setMessaggio] = useState<string | null>(null);
    const [errore, setErrore] = useState(false);

    const [dataInizioManuale, setDataInizioManuale] = useState("");
    const [dataFineManuale, setDataFineManuale] = useState("");

    const [formContrattoChiamata, setFormContrattoChiamata] = useState<any>({
        dataInizio: null,
        dataFine: null,
        dataFirmaContratto: null,
        cittaPredefinita: "",
        indirizzoPredefinito: "",
        cittaAlternativa: "",
        indirizzoAlternativo: "",
    });

    const [formContrattoOccasionale, setFormContrattoOccasionale] = useState<any>({
        dataInizio: null,
        dataFine: null,
        dataFirmaContratto: null,
    });

    const [formConsegnaBeniFormazione, setFormConsegnaBeniFormazione] = useState<any>({
        elencoContenutiFormazione: "",
        elencoBeniStrumentali: "",
    });

    const headersJson = () => ({
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
        Accept: "application/json",
    });

    const caricaListaContratti = async () => {
        if (!id) return;
        const response = await fetch(`${ezystaffBEUrl}operatori/listaContrattiOperatore/${id}`, {
            headers: headersJson(),
            credentials: "include",
        });
        if (!response.ok) throw new Error("Errore nel caricamento dei contratti.");
        setContratti(await response.json());
    };

    useEffect(() => {
        caricaListaContratti().catch(console.error);
    }, [id]);

    const handleChangeContrattoChiamata = (key: string, value: any) => {
        setFormContrattoChiamata((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleChangeContrattoOccasionale = (key: string, value: Date | null) => {
        setFormContrattoOccasionale((prev: any) => ({ ...prev, [key]: value }));
    };

    const handleChangeConsegnaBeniFormazione = (key: string, value: string | null) => {
        setFormConsegnaBeniFormazione((prev: any) => ({ ...prev, [key]: value }));
    };

    const resetManuale = () => {
        setDataInizioManuale("");
        setDataFineManuale("");
    };

    const creaContrattoManuale = async () => {
        if (!id || !tipoContratto || !isManuale(tipoContratto)) return;

        if (!dataInizioManuale || !dataFineManuale) {
            throw new Error("Compila data inizio e data fine contratto.");
        }

        const response = await fetch(`${ezystaffBEUrl}operatori/creaContrattoManuale`, {
            method: "POST",
            headers: headersJson(),
            credentials: "include",
            body: JSON.stringify({
                idOperatore: Number(id),
                tipologia: tipoContratto,
                dataInizio: dataInizioManuale,
                dataFine: dataFineManuale,
            }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data?.message || "Errore durante la creazione del contratto.");
        resetManuale();
        setMessaggio("Contratto creato. Ora puoi caricare il contratto firmato dalla tabella.");
    };

    const generaContratto = async () => {
        if (!id || !tipoContratto) throw new Error("Seleziona il tipo di contratto.");

        if (isManuale(tipoContratto)) {
            await creaContrattoManuale();
            return;
        }

        if (tipoContratto === "CHIAMATA") {
            const hasCitta = !!formContrattoChiamata.cittaAlternativa?.trim();
            const hasIndirizzo = !!formContrattoChiamata.indirizzoAlternativo?.trim();
            if (hasCitta !== hasIndirizzo) {
                throw new Error("Città alternativa e indirizzo alternativo devono essere entrambi compilati oppure entrambi vuoti.");
            }
        }

        const contrattoBase = {
            idContratto: 0,
            idOperatore: Number(id),
            tipologia: tipoContratto,
        };

        let contrattoFinale: any;

        if (tipoContratto === "CONSGNA_BENI_FORMAZIONE") {
            contrattoFinale = { ...contrattoBase, ...formConsegnaBeniFormazione };
        } else if (tipoContratto === "OCCASIONALE") {
            contrattoFinale = {
                ...contrattoBase,
                dataInizio: formContrattoOccasionale.dataInizio ? format(formContrattoOccasionale.dataInizio, "yyyy-MM-dd") : null,
                dataFine: formContrattoOccasionale.dataFine ? format(formContrattoOccasionale.dataFine, "yyyy-MM-dd") : null,
                dataFirmaContratto: formContrattoOccasionale.dataFirmaContratto ? format(formContrattoOccasionale.dataFirmaContratto, "yyyy-MM-dd") : null,
            };
        } else {
            contrattoFinale = {
                ...contrattoBase,
                ...formContrattoChiamata,
                dataInizio: formContrattoChiamata.dataInizio ? format(formContrattoChiamata.dataInizio, "yyyy-MM-dd") : null,
                dataFine: formContrattoChiamata.dataFine ? format(formContrattoChiamata.dataFine, "yyyy-MM-dd") : null,
                dataFirmaContratto: formContrattoChiamata.dataFirmaContratto ? format(formContrattoChiamata.dataFirmaContratto, "yyyy-MM-dd") : null,
            };
        }

        const response = await fetch(`${ezystaffBEUrl}operatori/creaContratto`, {
            method: "POST",
            headers: headersJson(),
            credentials: "include",
            body: JSON.stringify(contrattoFinale),
        });
        if (!response.ok) throw new Error("Errore durante la generazione del contratto.");
        setMessaggio("Contratto generato correttamente.");
    };

    const submitContratto = async () => {
        setLoading(true);
        setErrore(false);
        setMessaggio(null);
        try {
            await generaContratto();
            await caricaListaContratti();
        } catch (error) {
            setErrore(true);
            setMessaggio(error instanceof Error ? error.message : "Si è verificato un errore.");
        } finally {
            setLoading(false);
        }
    };

    const downloadPdf = async (idContratto: number, tipo: string) => {
        const response = await fetch(`${ezystaffBEUrl}operatori/downloadContratto/${idContratto}?tipoContratto=${tipo}`, {
            method: "GET",
            headers: headersJson(),
            credentials: "include",
        });
        if (!response.ok) throw new Error("Errore download PDF");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `contratto_${idContratto}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
    };

    const caricaContrattoFirmato = async (
        e: React.ChangeEvent<HTMLInputElement>,
        idContratto: number,
        tipoContrattoUpload: TipoContrattoUpload
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("tipoContratto", tipoContrattoUpload);
        formData.append("file", file);

        const response = await fetch(`${ezystaffBEUrl}upload/contrattoFirmato/${idContratto}`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
                Accept: "application/json",
            },
            credentials: "include",
            body: formData,
        });
        if (!response.ok) throw new Error("Errore nel caricamento del PDF.");
        await caricaListaContratti();
    };

    const cancellaSingolo = async (idContratto: number, tipo: TipoContrattoUpload) => {
        const response = await fetch(`${ezystaffBEUrl}operatori/cancellaSingoloContratto/${idContratto}?tipoContratto=${tipo}`, {
            method: "DELETE",
            headers: headersJson(),
            credentials: "include",
        });
        if (!response.ok) throw new Error("Errore nella cancellazione del documento.");
        await caricaListaContratti();
    };

    const cancellaContratto = async (idContratto: number) => {
        const response = await fetch(`${ezystaffBEUrl}operatori/cancellaTuttiContratti/${idContratto}`, {
            method: "DELETE",
            headers: headersJson(),
            credentials: "include",
        });
        if (!response.ok) throw new Error("Errore nella cancellazione del contratto.");
        await caricaListaContratti();
    };

    const dataLabel = (data: string | null) => data ? format(new Date(data), "dd/MM/yyyy") : "—";

    return (
        <>
            <div>
                <Table>
                    <TableHeader>
                        <TableRow className="bg-[#ecf3f1] text-[16px] font-bold text-[#5e5d5d]">
                            <TableHead>Tipo Contratto</TableHead>
                            <TableHead>Data Inizio</TableHead>
                            <TableHead>Data Fine</TableHead>
                            <TableHead>Compenso</TableHead>
                            <TableHead>Contratto firmato</TableHead>
                            <TableHead>Unilav</TableHead>
                            <TableHead>Azioni</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {contratti.map((contratto) => {
                            const manuale = isManuale(contratto.tipologia);
                            return (
                                <TableRow key={contratto.idContratto} className="text-[16px] font-normal text-[#2e2e2e]">
                                    <TableCell>{LABEL_TIPO[contratto.tipologia] ?? contratto.tipologia}</TableCell>
                                    <TableCell>{dataLabel(contratto.dataInizio)}</TableCell>
                                    <TableCell>{dataLabel(contratto.dataFine)}</TableCell>
                                    <TableCell>{contratto.compensoTotaleLordo ?? "—"}</TableCell>
                                    <TableCell>
                                        {contratto.pathContrattoFirmato ? (
                                            <>
                                                <button onClick={() => downloadPdf(contratto.idContratto, "contrattoFirmato")} className="cursor-pointer text-[#007a55]" title="Scarica contratto firmato">
                                                    <View className="mr-2 h-4 w-4" />
                                                </button>
                                                <button onClick={() => cancellaSingolo(contratto.idContratto, "contrattoFirmato")} className="cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                                                Carica
                                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => caricaContrattoFirmato(e, contratto.idContratto, "contrattoFirmato")} />
                                            </label>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {contratto.pathContrattoUnilav ? (
                                            <>
                                                <button onClick={() => downloadPdf(contratto.idContratto, "contrattoUnilav")} className="cursor-pointer text-[#007a55]" title="Scarica unilav">
                                                    <View className="mr-2 h-4 w-4" />
                                                </button>
                                                <button onClick={() => cancellaSingolo(contratto.idContratto, "contrattoUnilav")} className="cursor-pointer">
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer text-[#007a55] font-semibold hover:underline">
                                                Carica
                                                <input type="file" className="hidden" accept=".pdf" onChange={(e) => caricaContrattoFirmato(e, contratto.idContratto, "contrattoUnilav")} />
                                            </label>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {!manuale && (
                                            <button onClick={() => downloadPdf(contratto.idContratto, "downloadContratto")} className="cursor-pointer" title="Scarica contratto generato">
                                                <View className="mr-2 h-4 w-4" />
                                            </button>
                                        )}
                                        <button onClick={() => cancellaContratto(contratto.idContratto)} className="cursor-pointer" title="Elimina contratto">
                                            <Trash2 className="mr-2 h-4 w-4" />
                                        </button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <div className="flex gap-3 items-stretch rounded-[10px] bg-[#ecf3f1] p-4 mt-6">
                <div className="w-full">
                    <div className="text-[26px] font-extrabold font-[800] text-[#007a55] text-center border-b border-[#d8d8d8] pb-2 mb-6">
                        Generatore Contratti
                    </div>

                    <Select
                        value={tipoContratto ?? ""}
                        onValueChange={(value) => {
                            setTipoContratto(value as TipoContratto);
                            setMessaggio(null);
                            setErrore(false);
                        }}
                    >
                        <SelectTrigger className="w-full bg-white">
                            <SelectValue placeholder="Seleziona tipo contratto" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CHIAMATA">Contratto a chiamata</SelectItem>
                            <SelectItem value="OCCASIONALE">Contratto occasionale</SelectItem>
                            <SelectItem value="CONSGNA_BENI_FORMAZIONE">Consegna beni e formazione</SelectItem>
                            <SelectItem value="TEMPO_INDETERMINATO">Contratto a tempo indet.</SelectItem>
                            <SelectItem value="TEMPO_DETERMINATO">Contratto a tempo det.</SelectItem>
                        </SelectContent>
                    </Select>

                    {tipoContratto === "CHIAMATA" && (
                        <ContrattoChiamataComponent
                            formContrattoChiamata={formContrattoChiamata}
                            handleChangeContrattoChiamata={handleChangeContrattoChiamata}
                        />
                    )}

                    {tipoContratto === "OCCASIONALE" && (
                        <ContrattoOccasionaleComponent
                            formContrattoOccasionale={formContrattoOccasionale}
                            handleChangeContrattoChiamata={handleChangeContrattoOccasionale}
                        />
                    )}

                    {tipoContratto === "CONSGNA_BENI_FORMAZIONE" && (
                        <ConsegnaBeniFormazioneComponent
                            formConsegnaBeniFormazione={formConsegnaBeniFormazione}
                            handleChangeConsegnaBeniFormazione={handleChangeConsegnaBeniFormazione}
                        />
                    )}

                    {isManuale(tipoContratto) && (
                        <div className="grid grid-cols-2 gap-4 mt-5">
                            <div>
                                <label className="block text-[14px] font-semibold text-[#5e5d5d] mb-2">Data inizio contratto</label>
                                <input
                                    type="date"
                                    value={dataInizioManuale}
                                    onChange={(e) => setDataInizioManuale(e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                />
                            </div>
                            <div>
                                <label className="block text-[14px] font-semibold text-[#5e5d5d] mb-2">Data fine contratto</label>
                                <input
                                    type="date"
                                    value={dataFineManuale}
                                    min={dataInizioManuale || undefined}
                                    onChange={(e) => setDataFineManuale(e.target.value)}
                                    className="w-full h-10 rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                                />
                            </div>
                        </div>
                    )}

                    {messaggio && (
                        <div className={`mt-4 text-sm font-medium ${errore ? "text-red-600" : "text-[#007a55]"}`}>
                            {messaggio}
                        </div>
                    )}

                    <div className="w-full mt-6">
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={loading || !tipoContratto}
                            onClick={submitContratto}
                            className="w-full bg-[#007a55] text-white hover:bg-[#007a55] hover:text-white cursor-pointer disabled:cursor-not-allowed"
                        >
                            {loading
                                ? (isManuale(tipoContratto) ? "Creazione in corso..." : "Generazione in corso...")
                                : (isManuale(tipoContratto) ? "CREA CONTRATTO" : "GENERA CONTRATTO")}
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}
