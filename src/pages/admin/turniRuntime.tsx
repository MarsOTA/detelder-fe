import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { addDays, format } from "date-fns";
import type { DateRange } from "react-day-picker";

import DetelderDateRangePicker from "@/components/filters/DateRangePicker";
import TurniLegacy from "./turni";

const createDefaultRange = (): DateRange => {
  const from = new Date();
  return {
    from,
    to: new Date(new Date().setMonth(from.getMonth() + 1)),
  };
};

let activeRange: DateRange = createDefaultRange();
let originalFetch: typeof window.fetch | null = null;

const toYmd = (date: Date) => format(date, "yyyy-MM-dd");

/**
 * Adapter temporaneo per la pagina Planning legacy.
 * Il picker date e' ora un componente condiviso; qui resta solo il collegamento
 * con la fetch esistente finche' turni.tsx non ricevera' direttamente il range.
 */
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
        parsed.searchParams.set("dataFine", toYmd(activeRange.to ?? activeRange.from));

        const nextInput =
          typeof input === "string" || input instanceof URL
            ? parsed.toString()
            : new Request(parsed.toString(), input);

        return currentFetch(nextInput, init);
      }
    } catch {
      // Se la URL non e' parsabile, usa la fetch originale.
    }

    return currentFetch(input, init);
  }) as typeof window.fetch;
};

const restoreFetch = () => {
  if (!originalFetch) return;
  window.fetch = originalFetch;
  originalFetch = null;
};

const TurniRuntime = () => {
  installPlanningFetchOverride();

  const [range, setRange] = useState<DateRange>({ ...activeRange });
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

      let target = toolbar.querySelector<HTMLElement>("[data-planning-modern-range]");
      if (!target) {
        target = document.createElement("div");
        target.dataset.planningModernRange = "true";
        filtra.parentElement?.insertBefore(target, filtra);
      }

      const mobile = window.matchMedia("(max-width: 767px)").matches;
      target.style.setProperty("width", mobile ? "100%" : "auto", "important");
      target.style.setProperty("min-width", "0", "important");
      target.style.setProperty("flex-basis", mobile ? "100%" : "auto", "important");

      filtra.style.setProperty("margin-left", mobile ? "0" : "20px", "important");
      filtra.style.setProperty("border-radius", "8px", "important");
      filtra.style.setProperty("height", "40px", "important");
      filtra.style.setProperty("padding-left", "20px", "important");
      filtra.style.setProperty("padding-right", "20px", "important");

      toolbar.style.setProperty("column-gap", "12px", "important");
      toolbar.style.setProperty("row-gap", mobile ? "14px" : "12px", "important");

      setPortalTarget(target);
      setFilterButton(filtra);

      const quickButtons = Array.from(toolbar.querySelectorAll("button")).filter(
        (button) => {
          const text = button.textContent?.trim();
          return text === "Oggi" || text === "Domani";
        }
      );

      quickButtons.forEach((button) => {
        const element = button as HTMLElement;
        if (element.dataset.rangeCaptureBound === "true") return;
        element.dataset.rangeCaptureBound = "true";

        button.addEventListener(
          "click",
          () => {
            const offset = button.textContent?.trim() === "Domani" ? 1 : 0;
            const day = addDays(new Date(), offset);
            const nextRange = { from: day, to: day };
            activeRange = nextRange;
            setRange(nextRange);
          },
          { capture: true }
        );
      });

      return true;
    };

    const syncLayout = () => setupToolbar();

    if (!setupToolbar()) {
      const observer = new MutationObserver(() => {
        if (setupToolbar()) observer.disconnect();
      });
      observer.observe(document.body, { childList: true, subtree: true });
      window.addEventListener("resize", syncLayout);

      return () => {
        observer.disconnect();
        window.removeEventListener("resize", syncLayout);
      };
    }

    window.addEventListener("resize", syncLayout);
    return () => window.removeEventListener("resize", syncLayout);
  }, []);

  useEffect(() => () => restoreFetch(), []);

  const applyRange = (nextRange: DateRange) => {
    if (!nextRange.from) return;
    const normalized = {
      from: nextRange.from,
      to: nextRange.to ?? nextRange.from,
    };

    activeRange = normalized;
    setRange(normalized);
    filterButton?.click();
  };

  return (
    <>
      <TurniLegacy />
      {portalTarget
        ? createPortal(
            <DetelderDateRangePicker value={range} onApply={applyRange} />,
            portalTarget
          )
        : null}
    </>
  );
};

export default TurniRuntime;
