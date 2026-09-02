import { useEffect } from "react";
import GestioneTurniLegacy from "./getsioneTurni";

const GestioneTurniRuntime = () => {
  useEffect(() => {
    const applyToolbarFix = () => {
      const section = document.querySelector(".admin-shell section.m-6");
      if (!section) return;

      const filtraButton = Array.from(section.querySelectorAll("button")).find(
        (button) => button.textContent?.trim() === "Filtra"
      ) as HTMLButtonElement | undefined;

      if (!filtraButton) return;

      const filterWrapper = filtraButton.parentElement as HTMLElement | null;
      const toolbar = filterWrapper?.parentElement as HTMLElement | null;
      const dateWrapper = toolbar?.children.item(0) as HTMLElement | null;
      const copyWrapper = toolbar?.children.item(2) as HTMLElement | null;
      const dateButton = dateWrapper?.querySelector("button") as HTMLButtonElement | null;

      if (!toolbar || !filterWrapper || !dateButton) return;

      toolbar.style.setProperty("background", "transparent", "important");
      toolbar.style.setProperty("background-color", "transparent", "important");
      toolbar.style.setProperty("background-image", "none", "important");
      toolbar.style.setProperty("border", "0", "important");
      toolbar.style.setProperty("box-shadow", "none", "important");
      toolbar.style.setProperty("gap", "0", "important");

      dateWrapper?.style.setProperty("margin", "0", "important");
      dateWrapper?.style.setProperty("padding", "0", "important");
      filterWrapper.style.setProperty("margin", "0", "important");
      filterWrapper.style.setProperty("padding", "0", "important");

      dateButton.style.setProperty("min-height", "44px", "important");
      dateButton.style.setProperty("margin", "0", "important");
      dateButton.style.setProperty("border-radius", "12px 0 0 12px", "important");
      dateButton.style.setProperty("border-right", "0", "important");

      filtraButton.style.setProperty("min-height", "44px", "important");
      filtraButton.style.setProperty("margin-left", "-1px", "important");
      filtraButton.style.setProperty("border-left", "0", "important");
      filtraButton.style.setProperty("border-radius", "0 12px 12px 0", "important");

      copyWrapper?.style.setProperty("margin-left", "24px", "important");
    };

    applyToolbarFix();
    const frame = requestAnimationFrame(applyToolbarFix);
    const timeout = window.setTimeout(applyToolbarFix, 250);

    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, []);

  return <GestioneTurniLegacy />;
};

export default GestioneTurniRuntime;
