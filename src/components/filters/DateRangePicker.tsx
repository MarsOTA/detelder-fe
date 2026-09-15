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

type DetelderDateRangePickerProps = {
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

const useMobileLayout = () => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : false
  );

  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return isMobile;
};

export const DetelderDateRangePicker = ({
  value,
  onApply,
  label = "Data / periodo",
  showNavigation = true,
  disabled = false,
  className,
  buttonClassName,
}: DetelderDateRangePickerProps) => {
  const [draft, setDraft] = useState<DateRange>({ ...value });
  const [open, setOpen] = useState(false);
  const isMobile = useMobileLayout();

  useEffect(() => {
    setDraft({ ...value });
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
    draft.from &&
      draft.to &&
      startOfDay(draft.to).getTime() < startOfDay(draft.from).getTime()
  );

  const applyRange = (next: DateRange) => {
    if (!next.from || invalidRange) return;
    const normalized = {
      from: next.from,
      to: next.to ?? next.from,
    };
    onApply(normalized);
    setDraft(normalized);
    setOpen(false);
  };

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
    "h-10 w-10 shrink-0 rounded-md border-[#d8dfdc] bg-white text-[#007a55] hover:bg-[#f3f7f5] hover:text-[#006b4a] dark:border-[#35505a] dark:bg-[#0d2530] dark:text-[#24dec0] dark:hover:bg-[#14323d] dark:hover:text-[#58ecd5]";

  return (
    <div className={cn("flex w-full items-end gap-2 sm:w-auto", className)}>
      {showNavigation ? (
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
      ) : null}

      <div className="min-w-0 flex-1 sm:w-[300px] sm:flex-none">
        {label ? (
          <label className="mb-1.5 block text-[12px] font-bold text-[#6d6d6d] dark:text-[#91a2a8]">
            {label}
          </label>
        ) : null}

        <Popover
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (nextOpen) setDraft({ ...value });
          }}
        >
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              disabled={disabled}
              className={cn(
                "h-10 w-full min-w-0 justify-start rounded-md border-[#d8dfdc] bg-white px-3 text-left font-normal text-[#4f4f4f] hover:bg-[#f7f9f8] hover:text-[#303532] dark:border-[#35505a] dark:bg-[#0d2530] dark:text-[#d8e6e9] dark:hover:bg-[#14323d] dark:hover:text-white",
                buttonClassName
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-[#007a55] dark:text-[#24dec0]" />
              <span className="min-w-0 truncate capitalize">{displayLabel}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="max-h-[calc(100vh-24px)] w-auto max-w-[calc(100vw-24px)] overflow-y-auto rounded-xl border-[#dde5e1] bg-white p-0 text-[#303532] shadow-xl dark:border-[#35505a] dark:bg-[#0b202a] dark:text-[#eef7f7]"
            align={isMobile ? "center" : "start"}
            sideOffset={8}
          >
            <div className="sticky top-0 z-20 border-b border-[#e1e7e4] bg-[#fbfcfb] dark:border-[#28434c] dark:bg-[#0d2530]">
              <div className="grid gap-3 p-3 sm:grid-cols-2">
                <label className="grid gap-1 text-[12px] font-bold text-[#66716c] dark:text-[#9db0b5]">
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
                    className="h-9 bg-white text-[13px] font-medium dark:border-[#35505a] dark:bg-[#102a34] dark:text-[#eef7f7]"
                  />
                </label>

                <label className="grid gap-1 text-[12px] font-bold text-[#66716c] dark:text-[#9db0b5]">
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
                    className="h-9 bg-white text-[13px] font-medium dark:border-[#35505a] dark:bg-[#102a34] dark:text-[#eef7f7]"
                  />
                </label>

                {invalidRange ? (
                  <p className="text-[12px] font-semibold text-red-600 sm:col-span-2 dark:text-red-400">
                    La data finale non può precedere la data iniziale.
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e1e7e4] px-3 py-2.5 dark:border-[#28434c]">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-[#007a55] hover:bg-[#edf6f2] hover:text-[#006548] dark:text-[#24dec0] dark:hover:bg-[#16343d] dark:hover:text-[#58ecd5]"
                  onClick={() => {
                    const today = new Date();
                    setDraft({ from: today, to: today });
                  }}
                >
                  Oggi
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-[#d8dfdc] bg-white text-[#4f4f4f] hover:bg-[#f3f7f5] dark:border-[#35505a] dark:bg-[#102a34] dark:text-[#dce9eb] dark:hover:bg-[#17343e] dark:hover:text-white"
                    onClick={() => {
                      setDraft({ ...value });
                      setOpen(false);
                    }}
                  >
                    Annulla
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-[#007a55] text-white hover:bg-[#006a4a] dark:bg-[#008a68] dark:text-white dark:hover:bg-[#00a17a]"
                    disabled={!draft.from || invalidRange}
                    onClick={() => applyRange(draft)}
                  >
                    Applica
                  </Button>
                </div>
              </div>
            </div>

            <Calendar
              mode="range"
              selected={draft}
              onSelect={(next) => setDraft(next ?? { from: undefined, to: undefined })}
              locale={it}
              numberOfMonths={isMobile ? 1 : 2}
              className="pointer-events-auto bg-white text-[#303532] dark:bg-[#0b202a] dark:text-[#eef7f7] [&_[data-range-start=true]]:!bg-[#007a55] [&_[data-range-start=true]]:!text-white [&_[data-range-end=true]]:!bg-[#007a55] [&_[data-range-end=true]]:!text-white [&_[data-range-middle=true]]:!bg-[#dff1eb] [&_[data-range-middle=true]]:!text-[#174f3d] dark:[&_[data-range-start=true]]:!bg-[#008a68] dark:[&_[data-range-start=true]]:!text-white dark:[&_[data-range-end=true]]:!bg-[#008a68] dark:[&_[data-range-end=true]]:!text-white dark:[&_[data-range-middle=true]]:!bg-[#123d38] dark:[&_[data-range-middle=true]]:!text-[#d6fff6] dark:[&_[data-range-middle=true]]:!opacity-100"
              classNames={{
                months: "flex flex-col gap-4 md:flex-row relative",
                month: "flex w-full flex-col gap-4",
                caption_label:
                  "select-none text-sm font-semibold text-[#303532] dark:text-[#eef7f7]",
                weekday:
                  "flex-1 select-none rounded-md text-[0.8rem] font-normal text-[#7c8782] dark:text-[#8ba0a5]",
                outside:
                  "text-[#a5ada9] aria-selected:text-[#8c9691] dark:text-[#526a72] dark:aria-selected:text-[#70858b]",
                today:
                  "rounded-md bg-[#eef4f1] text-[#225544] data-[selected=true]:rounded-none dark:bg-[#15323c] dark:text-[#e0f0f2]",
                range_start: "rounded-l-md !bg-transparent",
                range_middle: "rounded-none !bg-transparent",
                range_end: "rounded-r-md !bg-transparent",
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {showNavigation ? (
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
      ) : null}
    </div>
  );
};

export default DetelderDateRangePicker;
