import { useEffect } from "react";
import Operatori from "./operatori";

const applyCsvButtonStyle = () => {
  const button = Array.from(document.querySelectorAll<HTMLButtonElement>("button"))
    .find((item) => item.textContent?.trim() === "Scarica .csv");

  if (!button) return;

  const isDark = document.documentElement.classList.contains("admin-dark");
  const styles: Record<string, string> = {
    height: "40px",
    minHeight: "40px",
    paddingLeft: "24px",
    paddingRight: "24px",
    marginLeft: "12px",
    borderRadius: "12px",
    borderTopLeftRadius: "12px",
    borderTopRightRadius: "12px",
    borderBottomLeftRadius: "12px",
    borderBottomRightRadius: "12px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: isDark ? "#365362" : "#b8d2c8",
    background: isDark ? "#102934" : "#ffffff",
    backgroundColor: isDark ? "#102934" : "#ffffff",
    color: isDark ? "#16f0c4" : "#007a55",
    WebkitTextFillColor: isDark ? "#16f0c4" : "#007a55",
    boxShadow: "none",
    boxSizing: "border-box",
    flexShrink: "0",
  };

  Object.entries(styles).forEach(([property, value]) => {
    const cssProperty = property.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
    button.style.setProperty(cssProperty, value, "important");
  });
};

const OperatoriRuntime = () => {
  useEffect(() => {
    applyCsvButtonStyle();

    const domObserver = new MutationObserver(() => applyCsvButtonStyle());
    domObserver.observe(document.body, { childList: true, subtree: true });

    const themeObserver = new MutationObserver(() => applyCsvButtonStyle());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "data-admin-theme"] });

    return () => {
      domObserver.disconnect();
      themeObserver.disconnect();
    };
  }, []);

  return <Operatori />;
};

export default OperatoriRuntime;
