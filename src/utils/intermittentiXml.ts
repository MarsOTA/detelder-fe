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
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export const formatMinisteroDate = (value?: string) => {
  if (!value) return "";
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return match ? match[3] + "/" + match[2] + "/" + match[1] : value;
};

// Riproduce la serializzazione XFA XML osservata nell'allegato generato da Acrobat.
// Ogni campo vuoto usa <nomeCampo\n/> e mantiene tutti i 10 slot ministeriali.
export const generaUniIntermittentiXml = (data: IntermittenteXmlData) => {
  const cfDatore = data.cfDatore.trim().toUpperCase();
  const emailDatore = data.emailDatore.trim();
  if (!/^[A-Z0-9]{11,16}$/.test(cfDatore)) throw new Error("Codice fiscale/P.IVA del datore non valido.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailDatore)) throw new Error("Email del datore di lavoro non valida.");
  if (!data.lavoratori.length || data.lavoratori.length > 10) throw new Error("Il modello ammette da 1 a 10 prestazioni.");
  data.lavoratori.forEach((p, i) => {
    if (!/^[A-Z0-9]{16}$/.test(p.cfLavoratore.trim().toUpperCase()))
      throw new Error("Codice fiscale lavoratore " + (i + 1) + " non valido.");
    if (!p.dataInizio) throw new Error("Data di inizio della chiamata " + (i + 1) + " mancante.");
  });
  const field = (name: string, raw: string) =>
    raw ? "<" + name + "\n>" + escapeXml(raw) + "</" + name + "\n>" : "<" + name + "\n/>";
  const parts = [
    field("CFdatorelavoro", cfDatore),
    field("BCbarcodeModello01", "ML-15-01"),
    field("BCbarcodeModello01", "ML-15-01"),
    field("EMmail", emailDatore),
    field("ANannullamento", data.annullamento ? "1" : "0"),
  ];
  for (let i = 0; i < 10; i++) {
    const p = data.lavoratori[i];
    const n = i + 1;
    parts.push(field("CFlavoratore" + n, p ? p.cfLavoratore.trim().toUpperCase() : ""));
    parts.push(field("CCcodcomunicazione" + n, p ? (p.codiceComunicazione || "").trim() : ""));
    parts.push(field("DTdatainizio" + n, p ? formatMinisteroDate(p.dataInizio) : ""));
    parts.push(field("DTdatafine" + n, p ? formatMinisteroDate(p.dataFine) : ""));
  }
  return '<?xml version="1.0" encoding="UTF-8"?>\n<moduloIntermittenti\n><Campi\n>' +
    parts.join("") + "</Campi\n></moduloIntermittenti\n>";
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
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
