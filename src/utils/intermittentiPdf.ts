// Copia PDF di consultazione del modello UNI_Intermittenti, ricostruita dall'XML archiviato.
// Non contiene pulsanti di invio e non sostituisce il documento XML trasmesso.
type Riga = { cf: string; codice: string; inizio: string; fine: string };
const readModel = (xml: string) => {
  const parsed = new DOMParser().parseFromString(xml, "application/xml");
  if (parsed.getElementsByTagName("parsererror").length || parsed.documentElement.tagName !== "moduloIntermittenti")
    throw new Error("XML UNI_Intermittenti non valido: impossibile creare il PDF.");
  const campo = (name: string) => parsed.getElementsByTagName(name).item(0)?.textContent?.trim() || "";
  const righe: Riga[] = Array.from({ length: 10 }, (_, i) => ({
    cf: campo("CFlavoratore" + (i + 1)),
    codice: campo("CCcodcomunicazione" + (i + 1)),
    inizio: campo("DTdatainizio" + (i + 1)),
    fine: campo("DTdatafine" + (i + 1)),
  }));
  return { cfDatore: campo("CFdatorelavoro"), email: campo("EMmail"), annullamento: campo("ANannullamento") === "1", righe };
};
const pdfEscape = (value: string) =>
  value.replace(/[^\x20-\x7E]/g, "?").replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
const t = (value: string, x: number, y: number, size = 11, bold = false) =>
  "BT /" + (bold ? "F2" : "F1") + " " + size + " Tf 1 0 0 1 " + x + " " + y + " Tm (" +
  pdfEscape(value) + ") Tj ET\n";
const rect = (x: number, y: number, w: number, h: number, fill = false) =>
  (fill ? "0.55 0.77 0.92 rg " : "") + x + " " + y + " " + w + " " + h + " re " + (fill ? "B" : "S") + "\n";
const rule = (x1: number, y1: number, x2: number, y2: number) =>
  x1 + " " + y1 + " m " + x2 + " " + y2 + " l S\n";

// PDF statico, stampabile e scaricabile. Nessuna dipendenza o chiamata a server terzi.
export const generaPdfIntermittenti = (xml: string): Blob => {
  const data = readModel(xml);
  let stream = "0 G 0.7 w\n";
  stream += t("Comunicazione Obbligatoria", 178, 756, 17, true);
  stream += t("Intermittenti", 250, 730, 17, true);
  stream += rect(10, 615, 592, 44, true);
  stream += "0 G\n" + t("Datore di Lavoro", 249, 632, 15, true);
  stream += t("codice fiscale *", 11, 586, 10) + rect(108, 576, 145, 25);
  stream += t(data.cfDatore.slice(0, 18), 114, 585, 11);
  stream += t("e-mail *", 266, 586, 10) + rect(326, 576, 276, 25);
  stream += t(data.email.slice(0, 43), 333, 585, 10);
  stream += rect(10, 516, 592, 45, true);
  stream += "0 G\n" + t("Elenco lavoratori - prestazioni lavorative", 159, 533, 13, true);
  const colX = [10, 160, 308, 455, 602];
  const labels = ["Codice Fiscale lavoratore", "Codice comunicazione", "Data inizio", "Data fine"];
  stream += rect(10, 475, 592, 36);
  for (let j = 1; j < 4; j++) stream += rule(colX[j], 475, colX[j], 511);
  for (let j = 0; j < 4; j++) stream += t(labels[j], colX[j] + 4, 488, j === 0 ? 9 : 10, true);
  for (let i = 0; i < 10; i++) {
    const y = 475 - (i + 1) * 36;
    const r = data.righe[i];
    stream += rect(10, y, 592, 36);
    for (let j = 1; j < 4; j++) stream += rule(colX[j], y, colX[j], y + 36);
    stream += t(r.cf.slice(0, 20), 15, y + 13, 9);
    stream += t(r.codice.slice(0, 23), 165, y + 13, 9);
    stream += t(r.inizio.slice(0, 15), 314, y + 13, 10);
    stream += t(r.fine.slice(0, 15), 461, y + 13, 10);
  }
  stream += t("Annullamento", 11, 74, 10, true) + rect(93, 67, 13, 13);
  if (data.annullamento) stream += t("X", 95, 69, 11, true);
  stream += t("Selezionare la casella per effettuare l'ANNULLAMENTO delle prestazioni sopraindicate.", 114, 72, 9);
  stream += t("I campi contrassegnati con * sono obbligatori.", 11, 39, 9);
  stream += t("Copia PDF di consultazione - dati ricavati dall'XML archiviato", 11, 20, 8);
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>",
    "<< /Length " + stream.length + " >>\nstream\n" + stream + "endstream",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
  ];
  let result = "%PDF-1.4\n";
  const offsets = [0];
  for (let i = 0; i < objects.length; i++) {
    offsets.push(result.length);
    result += (i + 1) + " 0 obj\n" + objects[i] + "\nendobj\n";
  }
  const xref = result.length;
  result += "xref\n0 " + (objects.length + 1) + "\n0000000000 65535 f \n";
  for (const offset of offsets.slice(1)) result += String(offset).padStart(10, "0") + " 00000 n \n";
  result += "trailer\n<< /Size " + (objects.length + 1) + " /Root 1 0 R >>\nstartxref\n" + xref + "\n%%EOF\n";
  return new Blob([new Uint8Array(Array.from(result, ch => ch.charCodeAt(0)))], { type: "application/pdf" });
};
export const visualizzaPdfIntermittenti = (xml: string) => {
  const url = URL.createObjectURL(generaPdfIntermittenti(xml));
  const opened = window.open(url, "_blank");
  if (!opened) {
    const a = document.createElement("a");
    a.href = url; a.target = "_blank"; a.rel = "noopener"; a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
};
export const scaricaPdfIntermittenti = (xml: string, fileName: string) => {
  const url = URL.createObjectURL(generaPdfIntermittenti(xml));
  const anchor = document.createElement("a");
  anchor.href = url; anchor.download = fileName;
  document.body.appendChild(anchor); anchor.click(); anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
};
