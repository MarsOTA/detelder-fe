import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { addDays, format } from "date-fns";
import { it } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import GestioneTurniLegacy from "./getsioneTurni";

const parseLocalDate = (value?: string | null) => {
  if (!value) return undefined;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const toYmd = (date: Date) => format(date, "yyyy-MM-dd");

const getRouteEventId = () => {
  const match = window.location.pathname.match(/\/admin\/gestione-turni\/(\d+)/);
  return match?.[1];
};

const getInitialRange = (): DateRange => {
  const pathMatch = window.location.pathname.match(
    /\/admin\/gestione-turni\/\d+\/([0-9]{4}-[0-9]{2}-[0-9]{2})/
  );
  const params = new URLSearchParams(window.location.search);
  const from = parseLocalDate(pathMatch?.[1]) ?? new Date();
  const to = parseLocalDate(params.get("to"));

  return { from, to };
};

const buildPlanningUrl = (range: DateRange) => {
  const eventId = getRouteEventId();
  if (!eventId || !range.from) return null;

  const base = `/admin/gestione-turni/${eventId}/${toYmd(range.from)}`;
  const params = new URLSearchParams();

  if (range.to && toYmd(range.to) !== toYmd(range.from)) {
    params.set("to", toYmd(range.to));
  }

  const query = params.toString();
  return query ? `${base}?${query}` : base;
};

const filterTableToRange = (range: DateRange) => {
  if (!range.from || !range.to) return;

  const fromKey = toYmd(range.from);
  const toKey = toYmd(range.to);
  const rows = Array.from(
    document.querySelectorAll<HTMLTableRowElement>(".admin-shell tbody tr")
  );

  const isSeparator = (row: HTMLTableRowElement) => {
    const firstCell = row.cells.item(0);
    return !!firstCell && firstCell.colSpan > 1;
  };

  rows.forEach((row) => {
    if (isSeparator(row)) return;

    const firstCellText = row.cells.item(0)?.textContent?.trim() ?? "";
    const match = firstCellText.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (!match) return;

    const [, day, month, year] = match;
    const key = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    row.style.display = key >= fromKey && key <= toKey ? "" : "none";
  });

  rows.forEach((row, index) => {
    if (!isSeparator(row)) return;

    let hasVisibleTurn = false;
    for (let i = index + 1; i < rows.length; i += 1) {
      if (isSeparator(rows[i])) break;
      if (rows[i].style.display !== "none") {
        hasVisibleTurn = true;
        break;
      }
    }

    row.style.display = hasVisibleTurn ? "" : "none";
  });
};

const PlanningDateRangeFilter = () => {
  const [range, setRange] = useState<DateRange>(getInitialRange);
  const [draftRange, setDraftRange] = useState<DateRange>(getInitialRange);
  const [open, setOpen] = useState(false);

  const label = useMemo(() => {
    if (!range.from) return "Seleziona data";
    if (!range.to || toYmd(range.from) === toYmd(range.to)) {
      return format(range.from, "EEE d MMM yyyy", { locale: it });
    }
    return `${format(range.from, "d MMM", { locale: it })} – ${format(
      range.to,
      "d MMM yyyy",
      { locale: it }
    )}`;
  }, [range]);

  const applyRange = (nextRange: DateRange) => {
    if (!nextRange.from) return;
    setRange(nextRange);
    setDraftRange(nextRange);
    setOpen(false);

    const url = buildPlanningUrl(nextRange);
    if (url) window.location.assign(url);
  };

  const shiftRange = (days: number) => {
    if (!range.from) return;
    const shifted: DateRange = {
      from: addDays(range.from, days),
      to: range.to ? addDays(range.to, days) : undefined,
    };
    applyRange(shifted);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-11 rounded-xl"
        onClick={() => shiftRange(-1)}
        aria-label="Periodo precedente"
        title="Periodo precedente"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-[250px] justify-between gap-3 rounded-xl px-4 font-semibold"
          >
            <span className="capitalize">{label}</span>
            <CalendarDays className="h-4 w-4 opacity-70" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto rounded-2xl p-0 shadow-xl" align="start">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-semibold">Seleziona giorno o intervallo</p>
            <p className="text-xs text-muted-foreground">
              Un clic per un giorno, due date per impostare un periodo.
            </p>
          </div>

          <Calendar
            mode="range"
            selected={draftRange}
            onSelect={(value) => setDraftRange(value ?? {})}
            locale={it}
            numberOfMonths={2}
            className="pointer-events-auto"
          />

          <div className="flex items-center justify-between gap-3 border-t px-4 py-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setDraftRange({ from: new Date(), to: undefined })}
            >
              Oggi
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setDraftRange(range);
                  setOpen(false);
                }}
              >
                Annulla
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={!draftRange.from}
                onClick={() => applyRange(draftRange)}
              >
                Applica
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-11 w-11 rounded-xl"
        onClick={() => shiftRange(1)}
        aria-label="Periodo successivo"
        title="Periodo successivo"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

const GestioneTurniRuntime = () => {
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const activeRange = useMemo(getInitialRange, []);

  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    const rangeEnd = activeRange.to ? toYmd(activeRange.to) : undefined;

    if (rangeEnd) {
      window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;

        if (url.includes("turni/turniEvento/") && !url.includes("dataFine=")) {
          const parsed = new URL(url, window.location.origin);
          parsed.searchParams.set("dataFine", rangeEnd);
          const nextInput = typeof input === "string" || input instanceof URL ? parsed.toString() : new Request(parsed.toString(), input);
          return originalFetch(nextInput, init);
        }

        return originalFetch(input, init);
      }) as typeof window.fetch;
    }

    return () => {
      window.fetch = originalFetch;
    };
  }, [activeRange]);

  useEffect(() => {
    const setupToolbar = () => {
      const section = document.querySelector(".admin-shell section.m-6");
      if (!section) return false;

      const filtraButton = Array.from(section.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Filtra"
      ) as HTMLButtonElement | undefined;
      if (!filtraButton) return false;

      const filterWrapper = filtraButton.parentElement as HTMLElement | null;
      const toolbar = filterWrapper?.parentElement as HTMLElement | null;
      const dateWrapper = toolbar?.children.item(0) as HTMLElement | null;
      const copyWrapper = toolbar?.children.item(2) as HTMLElement | null;
      if (!toolbar || !filterWrapper || !dateWrapper) return false;

      toolbar.style.setProperty("background", "transparent", "important");
      toolbar.style.setProperty("border", "0", "important");
      toolbar.style.setProperty("box-shadow", "none", "important");
      toolbar.style.setProperty("padding", "8px 0", "important");
      toolbar.style.setProperty("gap", "0", "important");

      dateWrapper.style.display = "none";
      filterWrapper.style.display = "none";
      copyWrapper?.style.setProperty("margin-left", "24px", "important");

      let target = toolbar.querySelector<HTMLElement>("[data-planning-range-filter-root]");
      if (!target) {
        target = document.createElement("div");
        target.dataset.planningRangeFilterRoot = "true";
        toolbar.prepend(target);
      }

      setPortalTarget(target);
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

  useEffect(() => {
    if (!activeRange.to) return;

    const apply = () => filterTableToRange(activeRange);
    apply();

    const observer = new MutationObserver(apply);
    const section = document.querySelector(".admin-shell section.m-6");
    if (section) observer.observe(section, { childList: true, subtree: true });

    const timeout = window.setTimeout(apply, 350);
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [activeRange]);

  return (
    <>
      <GestioneTurniLegacy />
      {portalTarget ? createPortal(<PlanningDateRangeFilter />, portalTarget) : null}
    </>
  );
};

export default GestioneTurniRuntime;
