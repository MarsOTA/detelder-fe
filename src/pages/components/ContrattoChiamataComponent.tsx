import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface ContrattoChiamataForm {
  // listaMansioni: string[];
  dataInizio: Date | null;
  dataFine: Date | null;
  dataFirmaContratto: Date | null;
  cittaPredefinita: string;
  indirizzoPredefinito: string;
  cittaAlternativa: string;
  indirizzoAlternativo: string;
  // compensoTotaleLordo: number;
  // livelloInquadramento: string;
  //  giorniPeriodoProva: number;
}

interface ContrattoChiamataProps {
  formContrattoChiamata: ContrattoChiamataForm;
  // listaMansioni: string[];
  // tipoQualifica: string[];
  // livelloInquadramento: string[];
  handleChangeContrattoChiamata: <
    K extends keyof ContrattoChiamataForm
  >(
    field: K,
    value: ContrattoChiamataForm[K]
  ) => void;
}

export const ContrattoChiamataComponent = ({
  formContrattoChiamata,
  // listaMansioni,
  // tipoQualifica,
  // livelloInquadramento,
  handleChangeContrattoChiamata,
}: ContrattoChiamataProps) => {
  return (
    <div
      className="flex-1 space-y-4"
      style={{
        color: "#5e5d5d",
        backgroundColor: "#eaeff4",
        borderRadius: 9,
        padding: 14,
        fontSize: 16,
      }}
    >
      {/* LISTA MANSIONI 
      <div className="grid grid-cols-1">
        <span>Lista Mansioni</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-white">
              {formContrattoChiamata.listaMansioni.length > 0
                ? formContrattoChiamata.listaMansioni.join(", ")
                : "Seleziona mansioni"}
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-full p-0">
            <Command>
              <CommandEmpty>Nessuna mansione</CommandEmpty>

              <CommandGroup>
                {listaMansioni.map((mansione) => {
                  const selected =
                    formContrattoChiamata.listaMansioni.includes(mansione);

                  return (
                    <CommandItem
                      key={mansione}
                      onSelect={() => {
                        const newValue = selected
                          ? formContrattoChiamata.listaMansioni.filter(
                              (m) => m !== mansione
                            )
                          : [
                              ...formContrattoChiamata.listaMansioni,
                              mansione,
                            ];

                        handleChangeContrattoChiamata(
                          "listaMansioni",
                          newValue
                        );
                      }}
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          selected ? "opacity-100" : "opacity-0"
                        }`}
                      />
                      {mansione}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      */}

      {/* DATE CONTRATTO */}
      <div className="grid grid-cols-2">
        <span>Data Inizio Contratto</span>
        <span>Data Fine Contratto</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full rounded-none">
              {formContrattoChiamata.dataInizio
                ? format(formContrattoChiamata.dataInizio, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoChiamata.dataInizio ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoChiamata("dataInizio", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full rounded-none">
              {formContrattoChiamata.dataFine
                ? format(formContrattoChiamata.dataFine, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoChiamata.dataFine ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoChiamata("dataFine", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2">
        <span>Citta predefinita</span>
        <span>Indirizzo predefinito</span>
        <Input
          type="text"
          value={formContrattoChiamata.cittaPredefinita}
          onChange={(e) =>
            handleChangeContrattoChiamata(
              "cittaPredefinita",
              e.target.value
            )
          }
          placeholder="MILANO"
          className="bg-white"
        />

        <Input
          type="text"
          value={formContrattoChiamata.indirizzoPredefinito}
          onChange={(e) =>
            handleChangeContrattoChiamata(
              "indirizzoPredefinito",
              e.target.value
            )
          }
          placeholder="VIA A. RIZZOLI 4"
          className="bg-white"
        />
      </div>

      <div className="grid grid-cols-2">
        <span>Citta alternativa</span>
        <span>Indirizzo alternativo</span>
        <Input
          type="text"
          value={formContrattoChiamata.cittaAlternativa}
          onChange={(e) =>
            handleChangeContrattoChiamata(
              "cittaAlternativa",
              e.target.value
            )
          }
          className="bg-white"
        />

        <Input
          type="text"
          value={formContrattoChiamata.indirizzoAlternativo}
          onChange={(e) =>
            handleChangeContrattoChiamata(
              "indirizzoAlternativo",
              e.target.value
            )
          }
          className="bg-white"
        />
      </div>

      {/* DATE FIRMA CONTRATTO */}
      <div className="grid grid-cols-2">
        <span>Data Firma Contratto</span>
        <span />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full rounded-none">
              {formContrattoChiamata.dataFirmaContratto
                ? format(formContrattoChiamata.dataFirmaContratto, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoChiamata.dataFirmaContratto ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoChiamata("dataFirmaContratto", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>
        <span />

      </div>




      {/* QUALIFICA E COMPENSO 
      <div className="grid grid-cols-2">
        <span>Qualifica Contrattuale</span>
        <span>Compenso Totale Lordo (€)</span>

        <Select
          value={formContrattoChiamata.qualifica}
          onValueChange={(value) =>
            handleChangeContrattoChiamata("qualifica", value)
          }
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Seleziona qualifica" />
          </SelectTrigger>

          <SelectContent>
            {tipoQualifica.map((qualifica) => (
              <SelectItem key={qualifica} value={qualifica}>
                {qualifica}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={0}
          step="0.01"
          value={formContrattoChiamata.compensoTotaleLordo}
          onChange={(e) =>
            handleChangeContrattoChiamata(
              "compensoTotaleLordo",
              Number(e.target.value)
            )
          }
          className="bg-white"
        />
      </div>
      */}

      {/* INQUADRAMENTO 
      <div className="grid grid-cols-2">
        <span>Livello Inquadramento</span>
        <span>Periodo Prova (gg)</span>

        <Select
          value={formContrattoChiamata.livelloInquadramento}
          onValueChange={(value) =>
            handleChangeContrattoChiamata(
              "livelloInquadramento",
              value
            )
          }
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Seleziona livello inquadramento" />
          </SelectTrigger>

        <SelectContent>
            {livelloInquadramento.map((livello) => (
              <SelectItem key={livello} value={livello}>
                {livello}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={0}
          step="1"
          value={formContrattoChiamata.giorniPeriodoProva}
          onChange={(e) =>
            handleChangeContrattoChiamata(
              "giorniPeriodoProva",
              Number(e.target.value)
            )
          }
          className="bg-white"
        />
      </div>
      */}



    </div>
  );
};
