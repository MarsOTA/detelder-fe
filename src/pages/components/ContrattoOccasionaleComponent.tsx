import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

interface FormContrattoOccasionale {
  dataInizio: Date | null;
  dataFine: Date | null;
  dataFirmaContratto: Date | null;
}

interface ContrattoChiamataProps {
  formContrattoOccasionale: FormContrattoOccasionale;
  handleChangeContrattoChiamata: <K extends keyof FormContrattoOccasionale>(
    field: K,
    value: FormContrattoOccasionale[K]
  ) => void;
}

export const ContrattoOccasionaleComponent = ({
  formContrattoOccasionale,
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

      <div className="grid grid-cols-2">
        <span>Data Inizio Contratto</span>
        <span>Data Fine Contratto</span>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full rounded-none">
              {formContrattoOccasionale.dataInizio
                ? format(formContrattoOccasionale.dataInizio, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoOccasionale.dataInizio ?? undefined}
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
              {formContrattoOccasionale.dataFine
                ? format(formContrattoOccasionale.dataFine, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoOccasionale.dataFine ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoChiamata("dataFine", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2">
        <span>Data Firma Contratto</span>
        <span />

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full rounded-none">
              {formContrattoOccasionale.dataFirmaContratto
                ? format(formContrattoOccasionale.dataFirmaContratto, "dd/MM/yyyy")
                : "Seleziona data"}
              <CalendarIcon className="ml-2 h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={formContrattoOccasionale.dataFirmaContratto ?? undefined}
              onSelect={(date) =>
                handleChangeContrattoChiamata("dataFirmaContratto", date ?? null)
              }
              locale={it}
            />
          </PopoverContent>
        </Popover>
        <span />
      </div>
    </div>
  );
};
