import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface FormContrattoTempoIndeterminato {
  dataInizio: Date | null;
  dataFine: Date | null;
}

interface ContrattoTempoIndeterminatoProps {
  formContrattoTempoIndeterminato: FormContrattoTempoIndeterminato;
  handleChangeContrattoTempoIndeterminato: <K extends keyof FormContrattoTempoIndeterminato>(
    field: K,
    value: FormContrattoTempoIndeterminato[K]
  ) => void;
}

export const ContrattoTempoIndeterminatoComponent = ({
  formContrattoTempoIndeterminato,
  handleChangeContrattoTempoIndeterminato,
}: ContrattoTempoIndeterminatoProps) => {
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
              {formContrattoTempoIndeterminato.dataInizio
                ? format(formContrattoTempoIndeterminato.dataInizio, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoTempoIndeterminato.dataInizio ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoTempoIndeterminato("dataInizio", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full rounded-none">
              {formContrattoTempoIndeterminato.dataFine
                ? format(formContrattoTempoIndeterminato.dataFine, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoTempoIndeterminato.dataFine ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoTempoIndeterminato("dataFine", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>
      </div>
      
    </div>
  );
};
