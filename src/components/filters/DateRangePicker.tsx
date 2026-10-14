import { useEffect, useMemo, useState } from "react";
import { addDays, differenceInCalendarDays, format, startOfDay } from "date-fns";
import { it } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type DateRangePickerProps = {
  value: DateRange;
  onApply: (range: DateRange) => void;
  label?: string;
  showNavigation?: boolean;
  disabled?: boolean;
  className?: string;
  buttonClassName?: string;
};

const toInputValue = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : "");

const fromInputValue = (value: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

/**
 * Wrapper applicativo del Calendar shadcn/react-day-picker già presente nel progetto.
 * Centralizza la selezione del range senza modificare il componente UI di base,
 * così la stessa logica può essere riutilizzata anche in Payroll/Presenze.
 */
export const DetelderDateRangePicker = ({
  value,
  onApply,
  label = "Data / periodo",
  showNavigation = true,
  disabled = false,
  className,
  buttonClassName,
}: DateRangePickerProps) => {
  // Il draft permette di modificare il range nel popover senza applicarlo subito.
  const [draft, setDraft] = useState<DateRange>(value);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setDraft(value);
  }, [value.from?.getTime(), value.to?.getTime()]);

  const displayLabel = useMemo(() => {
    if (!value.from) return "Seleziona una data";
    const to = value.to ?? value.from;

    if (format(value.from, "yyyy-MM-dd") === format(to, "yyyy-MM-dd")) {
      return format(value.from, "d MMM yyyy", { locale: it });
    }

    return `${format(value.from, "d MMM", { locale: it })} – ${format(to, "d MMM yyyy", { locale: it })}`;
  }, [value.from, value.to]);

  const invalidRange = Boolean(
    draft.from && draft.to && startOfDay(draft.to).getTime() < startOfDay(draft.from).getTime()
  );

  const applyRange = () => {
    if (!draft.from || invalidRange) return;

    const normalized: DateRange = {
      from: draft.from,
      to: draft.to ?? draft.from,
    };

    onApply(normalized);
    setDraft(normalized);
    setOpen(false);
  };

  // Le frecce spostano l'intero intervallo di un giorno mantenendone la durata.
  const shiftRange = (direction: -1 | 1) => {
    if (!value.from) return;

    const to = value.to ?? value.from;
    const duration = Math.max(0, differenceInCalendarDays(to, value.from));
    const nextFrom = addDays(value.from, direction);

    onApply({
      from: nextFrom,
      to: addDays(nextFrom, duration),
    });
  };

  const navButtonClass =
    "h-10 w-10 shrink-0 rounded-md border-[#d8dfdc] bg-white text-[#007a55] hover:bg-[#f3f7f5] hover:text-[#006b4a]";

  return (
    <div className={cn("flex items-end gap-2", className)}>
      {showNavigation && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={navButtonClass}
          onClick={() => shiftRange(-1)}
          disabled={disabled || !value.from}
          aria-label="Periodo precedente"
          title="Periodo precedente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      )}

      <div className="w-[300px]">
        {label && (
          <label className="mb-1.5 block text-[12px] font-bold text-[#6d6d6d]">
            {label}
          </label>
        )}

        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (nextOpen) setDraft(value);
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "h-10 w-full justify-start rounded-md border-[#d8dfdc] bg-white px-3 text-left font-normal text-[#4f4f4f] hover:bg-[#f7f9f8]",
                buttonClassName
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-[#007a55]" />
              <span className="truncate capitalize">{displayLabel}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto max-w-[calc(100vw-24px)] overflow-hidden rounded-xl border-[#dde5e1] bg-white p-0 shadow-xl"
            align="start"
            sideOffset={8}
          >
            <div className="border-b border-[#e1e7e4] bg-[#fbfcfb]">
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                <label className="grid gap-1 text-[12px] font-bold text-[#66716c]">
                  Dal
                  <Input
                    type="date"
                    value={toInputValue(draft.from)}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        from: fromInputValue(event.target.value),
                      }))
                    }
                    className="h-9 bg-white text-[13px] font-medium"
                  />
                </label>

                <label className="grid gap-1 text-[12px] font-bold text-[#66716c]">
                  Al
                  <Input
                    type="date"
                    value={toInputValue(draft.to)}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        to: fromInputValue(event.target.value),
                      }))
                    }
                    className="h-9 bg-white text-[13px] font-medium"
                  />
                </label>

                {invalidRange && (
                  <p className="text-[12px] font-semibold text-red-600 sm:col-span-2">
                    La data finale non può precedere la data iniziale.
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-[#e1e7e4] px-3 py-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDraft(value);
                    setOpen(false);
                  }}
                >
                  Annulla
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#007a55] text-white hover:bg-[#006a4a]"
                  disabled={!draft.from || invalidRange}
                  onClick={applyRange}
                >
                  Applica
                </Button>
              </div>
            </div>

            <Calendar
              mode="range"
              selected={draft}
              onSelect={(next) => setDraft(next ?? { from: undefined, to: undefined })}
              locale={it}
              numberOfMonths={2}
              className="pointer-events-auto bg-white text-[#303532] [&_[data-range-start=true]]:!bg-[#007a55] [&_[data-range-start=true]]:!text-white [&_[data-range-end=true]]:!bg-[#007a55] [&_[data-range-end=true]]:!text-white [&_[data-range-middle=true]]:!bg-[#dff1eb] [&_[data-range-middle=true]]:!text-[#174f3d]"
            />
          </PopoverContent>
        </Popover>
      </div>

      {showNavigation && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={navButtonClass}
          onClick={() => shiftRange(1)}
          disabled={disabled || !value.from}
          aria-label="Periodo successivo"
          title="Periodo successivo"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default DetelderDateRangePicker;
