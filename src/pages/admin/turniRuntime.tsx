import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { addDays, differenceInCalendarDays, format } from "date-fns";
import { it } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import TurniLegacy from "./turni";

const todayRange = (): DateRange => {
  const from = new Date();
  return {
    from,
    to: new Date(new Date().setMonth(from.getMonth() + 1)),
  };
};

let activeRange: DateRange = todayRange();
let originalFetch: typeof window.fetch | null = null;

const toYmd = (date: Date) => format(date, "yyyy-MM-dd");

const notifyRangeChange = () => {
  window.dispatchEvent(
    new CustomEvent<DateRange>("detelder-planning-range-change", {
      detail: { ...activeRange },
    })
  );
};

const installPlanningFetchOverride = () => {
  if (originalFetch) return;

  originalFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const currentFetch = originalFetch!;
    const rawUrl =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;

    try {
      const parsed = new URL(rawUrl, window.location.origin);
      const isPlanningTurniRequest = parsed.pathname.endsWith("/turni");

      if (isPlanningTurniRequest && activeRange.from) {
        parsed.searchParams.set("dataInizio", toYmd(activeRange.from));
        parsed.searchParams.set(
          "dataFine",
          toYmd(activeRange.to ?? activeRange.from)
        );

        const nextInput =
          typeof input === "string" || input instanceof URL
            ? parsed.toString()
            : new Request(parsed.toString(), input);

        return currentFetch(nextInput, init);
      }
    } catch {
      // Se la URL non è parsabile, usa la fetch originale.
    }

    return currentFetch(input, init);
  }) as typeof window.fetch;
};

const restoreFetch = () => {
  if (!originalFetch) return;
  window.fetch = originalFetch;
  originalFetch = null;
};

const PlanningRangePicker = ({ onApply }: { onApply: () => void }) => {
  const [range, setRange] = useState<DateRange>({ ...activeRange });
  const [draft, setDraft] = useState<DateRange>({ ...activeRange });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<DateRange>).detail;
      setRange({ ...detail });
      setDraft({ ...detail });
    };

    window.addEventListener("detelder-planning-range-change", sync);
    return () => window.removeEventListener("detelder-planning-range-change", sync);
  }, []);

  const label = (() => {
    if (!range.from) return "Seleziona una data";
    const to = range.to ?? range.from;
    if (toYmd(range.from) === toYmd(to)) {
      return format(range.from, "d MMM yyyy", { locale: it });
    }
    return `${format(range.from, "d MMM", { locale: it })} – ${format(to, "d MMM yyyy", { locale: it })}`;
  })();

  const applyRange = (next: DateRange) => {
    if (!next.from) return;
    const normalized = { from: next.from, to: next.to ?? next.from };
    activeRange = normalized;
    setRange(normalized);
    setDraft(normalized);
    setOpen(false);
    onApply();
  };

  const shift = (direction: -1 | 1) => {
    if (!range.from) return;
    const to = range.to ?? range.from;
    const duration = Math.max(0, differenceInCalendarDays(to, range.from));
    const nextFrom = addDays(range.from, direction);
    applyRange({
      from: nextFrom,
      to: addDays(nextFrom, duration),
    });
  };

  const navButtonClass =
    "h-10 w-10 shrink-0 rounded-md border-[#d8dfdc] bg-white text-[#007a55] hover:bg-[#f3f7f5] hover:text-[#006b4a] dark:border-[#343b38] dark:bg-[#171a19] dark:text-[#55d6ad] dark:hover:bg-[#222725] dark:hover:text-[#79e7c2]";

  return (
    <div className="flex items-end gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={navButtonClass}
        onClick={() => shift(-1)}
        aria-label="Periodo precedente"
        title="Periodo precedente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="w-[280px]">
        <label className="mb-1.5 block text-[12px] font-bold text-[#6d6d6d] dark:text-[#a4afaa]">
          Data / periodo
        </label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-10 w-full justify-start rounded-md border-[#d8dfdc] bg-white px-3 text-left font-normal text-[#4f4f4f] hover:bg-[#f7f9f8] hover:text-[#303532] dark:border-[#343b38] dark:bg-[#171a19] dark:text-[#e6ece9] dark:hover:bg-[#222725] dark:hover:text-white"
            >
              <CalendarIcon className="mr-2 h-4 w-4 shrink-0 text-[#007a55] dark:text-[#55d6ad]" />
              <span className="truncate capitalize">{label}</span>
            </Button>
          </PopoverTrigger>

          <PopoverContent
            className="w-auto overflow-hidden border-[#dde5e1] bg-white p-0 text-[#303532] shadow-xl dark:border-[#343b38] dark:bg-[#151817] dark:text-[#eef3f1]"
            align="start"
          >
            <Calendar
              mode="range"
              selected={draft}
              onSelect={(value) =>
                setDraft(value ?? { from: undefined, to: undefined })
              }
              locale={it}
              numberOfMonths={2}
              className="pointer-events-auto bg-white text-[#303532] dark:bg-[#151817] dark:text-[#eef3f1] [&_[data-range-start=true]]:bg-[#007a55] [&_[data-range-start=true]]:text-white [&_[data-range-end=true]]:bg-[#007a55] [&_[data-range-end=true]]:text-white [&_[data-range-middle=true]]:bg-[#e4f3ed] [&_[data-range-middle=true]]:text-[#174f3d] dark:[&_[data-range-start=true]]:bg-[#0b8d68] dark:[&_[data-range-start=true]]:text-white dark:[&_[data-range-end=true]]:bg-[#0b8d68] dark:[&_[data-range-end=true]]:text-white dark:[&_[data-range-middle=true]]:bg-[#173b31] dark:[&_[data-range-middle=true]]:text-[#c8f4e5] dark:[&_[data-today=true]]:bg-[#252b28]"
              classNames={{
                caption_label:
                  "select-none text-sm font-semibold text-[#303532] dark:text-[#eef3f1]",
                weekday:
                  "flex-1 select-none rounded-md text-[0.8rem] font-normal text-[#7c8782] dark:text-[#89948f]",
                outside:
                  "text-[#a5ada9] aria-selected:text-[#8c9691] dark:text-[#555e5a] dark:aria-selected:text-[#707a75]",
                today:
                  "rounded-md bg-[#eef4f1] text-[#225544] data-[selected=true]:rounded-none dark:bg-[#252b28] dark:text-[#dfe9e5]",
              }}
            />

            <div className="flex items-center justify-between border-t border-[#e1e7e4] bg-[#fbfcfb] p-3 dark:border-[#303633] dark:bg-[#181b1a]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[#007a55] hover:bg-[#edf6f2] hover:text-[#006548] dark:text-[#55d6ad] dark:hover:bg-[#24302c] dark:hover:text-[#7be7c4]"
                onClick={() => setDraft({ from: new Date(), to: new Date() })}
              >
                Oggi
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-[#d8dfdc] bg-white text-[#4f4f4f] hover:bg-[#f3f7f5] dark:border-[#3a423e] dark:bg-[#1c201e] dark:text-[#dfe6e3] dark:hover:bg-[#282e2b] dark:hover:text-white"
                  onClick={() => {
                    setDraft(range);
                    setOpen(false);
                  }}
                >
                  Annulla
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-[#007a55] text-white hover:bg-[#006a4a] dark:bg-[#0b8d68] dark:text-white dark:hover:bg-[#0a7d5e]"
                  disabled={!draft.from}
                  onClick={() => applyRange(draft)}
                >
                  Applica
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className={navButtonClass}
        onClick={() => shift(1)}
        aria-label="Periodo successivo"
        title="Periodo successivo"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const TurniRuntime = () => {
  installPlanningFetchOverride();
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [filterButton, setFilterButton] = useState<HTMLButtonElement | null>(null);

  useEffect(() => {
    const setupToolbar = () => {
      const heading = Array.from(document.querySelectorAll("h1")).find(
        (item) => item.textContent?.trim() === "Planning turni"
      );
      const section = heading?.closest("section");
      const toolbar = section?.querySelector(
        "div.mb-2.flex.flex-wrap.items-end"
      ) as HTMLElement | null;
      if (!toolbar) return false;

      const children = Array.from(toolbar.children) as HTMLElement[];
      const dalWrapper = children.find((child) =>
        Array.from(child.querySelectorAll("label")).some(
          (label) => label.textContent?.trim() === "Dal"
        )
      );
      const alWrapper = children.find((child) =>
        Array.from(child.querySelectorAll("label")).some(
          (label) => label.textContent?.trim() === "Al"
        )
      );
      const filtra = Array.from(toolbar.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Filtra"
      ) as HTMLButtonElement | undefined;

      if (!dalWrapper || !alWrapper || !filtra) return false;

      dalWrapper.style.display = "none";
      alWrapper.style.display = "none";

      let target = toolbar.querySelector<HTMLElement>(
        "[data-planning-modern-range]"
      );
      if (!target) {
        target = document.createElement("div");
        target.dataset.planningModernRange = "true";
        filtra.parentElement?.insertBefore(target, filtra);
      }

      filtra.style.setProperty("margin-left", "20px", "important");
      filtra.style.setProperty("border-radius", "6px", "important");
      filtra.style.setProperty("height", "40px", "important");
      filtra.style.setProperty("padding-left", "20px", "important");
      filtra.style.setProperty("padding-right", "20px", "important");

      setPortalTarget(target);
      setFilterButton(filtra);

      const quickButtons = Array.from(toolbar.querySelectorAll("button")).filter(
        (button) => {
          const text = button.textContent?.trim();
          return text === "Oggi" || text === "Domani";
        }
      );

      quickButtons.forEach((button) => {
        if ((button as HTMLElement).dataset.rangeCaptureBound === "true") return;
        (button as HTMLElement).dataset.rangeCaptureBound = "true";
        button.addEventListener(
          "click",
          () => {
            const offset = button.textContent?.trim() === "Domani" ? 1 : 0;
            const day = addDays(new Date(), offset);
            activeRange = { from: day, to: day };
            notifyRangeChange();
          },
          { capture: true }
        );
      });

      return true;
    };

    if (!setupToolbar()) {
      const observer = new MutationObserver(() => {
        if (setupToolbar()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  useEffect(() => () => restoreFetch(), []);

  return (
    <>
      <TurniLegacy />
      {portalTarget && filterButton
        ? createPortal(
            <PlanningRangePicker onApply={() => filterButton.click()} />,
            portalTarget
          )
        : null}
    </>
  );
};

export default TurniRuntime;
