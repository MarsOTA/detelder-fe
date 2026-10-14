import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface FormContrattoTempoDeterminato {
  dataInizio: Date | null;
  dataFine: Date | null;
}

interface ContrattoTempoDeterminatoProps {
  formContrattoTempoDeterminato: FormContrattoTempoDeterminato;
  handleChangeContrattoTempoDeterminato: <K extends keyof FormContrattoTempoDeterminato>(
    field: K,
    value: FormContrattoTempoDeterminato[K]
  ) => void;
}

export const ContrattoTempoDeterminatoComponent = ({
  formContrattoTempoDeterminato,
  handleChangeContrattoTempoDeterminato,
}: ContrattoTempoDeterminatoProps) => {
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

      <div className="grid grid-cols-2">
        <span>Data Inizio Contratto</span>
        <span>Data Fine Contratto</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full rounded-none">
              {formContrattoTempoDeterminato.dataInizio
                ? format(formContrattoTempoDeterminato.dataInizio, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoTempoDeterminato.dataInizio ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoTempoDeterminato("dataInizio", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full rounded-none">
              {formContrattoTempoDeterminato.dataFine
                ? format(formContrattoTempoDeterminato.dataFine, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoTempoDeterminato.dataFine ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoTempoDeterminato("dataFine", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>
      </div>
      
    </div>
  );
};
