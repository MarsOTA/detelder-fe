export interface IntermittentePrestazione {
  cfLavoratore: string;
  codiceComunicazione?: string;
  dataInizio: string;
  dataFine?: string;
}

export interface IntermittenteXmlData {
  cfDatore: string;
  emailDatore: string;
  annullamento?: boolean;
  lavoratori: IntermittentePrestazione[];
}

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export const formatMinisteroDate = (value?: string) => {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return value;
  return `${match[3]}/${match[2]}/${match[1]}`;
};

export const generaUniIntermittentiXml = (data: IntermittenteXmlData) => {
  const cfDatore = data.cfDatore.trim().toUpperCase();
  const emailDatore = data.emailDatore.trim();
  const lavoratori = data.lavoratori.slice(0, 10);

  if (!cfDatore) {
    throw new Error("Il codice fiscale del datore di lavoro è obbligatorio.");
  }

  if (!emailDatore) {
    throw new Error("L'email del datore di lavoro è obbligatoria.");
  }

  if (lavoratori.length === 0) {
    throw new Error("Inserire almeno una chiamata intermittente.");
  }

  lavoratori.forEach((prestazione, index) => {
    if (!prestazione.cfLavoratore.trim()) {
      throw new Error(`Il codice fiscale del lavoratore ${index + 1} è obbligatorio.`);
    }
    if (!prestazione.dataInizio) {
      throw new Error(`La data di inizio della chiamata ${index + 1} è obbligatoria.`);
    }
  });

  const rows = Array.from({ length: 10 }, (_, index) => {
    const prestazione = lavoratori[index];
    const n = index + 1;

    return [
      `    <CFlavoratore${n}>${prestazione ? escapeXml(prestazione.cfLavoratore.trim().toUpperCase()) : ""}</CFlavoratore${n}>`,
      `    <CCcodcomunicazione${n}>${prestazione ? escapeXml((prestazione.codiceComunicazione ?? "").trim()) : ""}</CCcodcomunicazione${n}>`,
      `    <DTdatainizio${n}>${prestazione ? escapeXml(formatMinisteroDate(prestazione.dataInizio)) : ""}</DTdatainizio${n}>`,
      `    <DTdatafine${n}>${prestazione ? escapeXml(formatMinisteroDate(prestazione.dataFine)) : ""}</DTdatafine${n}>`,
    ].join("\n");
  }).join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<moduloIntermittenti>\n  <Campi>\n    <CFdatorelavoro>${escapeXml(cfDatore)}</CFdatorelavoro>\n    <BCbarcodeModello01>ML-15-01</BCbarcodeModello01>\n    <BCbarcodeModello01>ML-15-01</BCbarcodeModello01>\n    <EMmail>${escapeXml(emailDatore)}</EMmail>\n    <ANannullamento>${data.annullamento ? "1" : "0"}</ANannullamento>\n${rows}\n  </Campi>\n</moduloIntermittenti>`;
};

export const downloadXml = (xml: string, fileName: string) => {
  const blob = new Blob([xml], { type: "application/xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};
