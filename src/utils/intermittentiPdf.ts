// PDF di consultazione creato a partire dal modulo ministeriale UNI_Intermittenti originale.
// La grafica NON viene ricostruita: si compilano i campi della pagina PDF originale.
// L'allegato XML rimane separato, visualizzabile e scaricabile dall'archivio HR.
type Riga = { cf:string; codice:string; inizio:string; fine:string };
const parseXml=(xml:string)=>{
  const doc=new DOMParser().parseFromString(xml,"application/xml");
  if(doc.getElementsByTagName("parsererror").length||doc.documentElement.tagName!=="moduloIntermittenti")
    throw new Error("XML UNI_Intermittenti non valido.");
  const campo=(n:string)=>doc.getElementsByTagName(n).item(0)?.textContent?.trim()||"";
  const righe:Riga[]=Array.from({length:10},(_,i)=>({
    cf:campo("CFlavoratore"+(i+1)),
    codice:campo("CCcodcomunicazione"+(i+1)),
    inizio:campo("DTdatainizio"+(i+1)),
    fine:campo("DTdatafine"+(i+1))||campo("DTdatainizio"+(i+1)),
  }));
  return {cf:campo("CFdatorelavoro"),email:campo("EMmail"),annulla:campo("ANannullamento")==="1",righe};
};
type FormField={getName:()=>string;setText?:(v:string)=>void;check?:()=>void;uncheck?:()=>void};
let pdfLib:Promise<any>|undefined;
const caricaLibreria=()=>{
  const url="https://esm.sh/pdf-lib@1.17.1?bundle";
  if(!pdfLib)pdfLib=import(/* @vite-ignore */ url).catch(e=>{pdfLib=undefined;throw e;});
  return pdfLib;
};
export const generaPdfIntermittenti=async(xml:string):Promise<Blob>=>{
  const d=parseXml(xml);
  const [res,lib]=await Promise.all([fetch("/api/uni-intermittenti-template"),caricaLibreria()]);
  if(!res.ok)throw new Error("Modello ministeriale originale non disponibile (HTTP "+res.status+").");
  const file=await res.arrayBuffer();
  if(new TextDecoder().decode(file.slice(0,5))!=="%PDF-")throw new Error("File del modello ministeriale non valido.");
  const pdf=await lib.PDFDocument.load(file);
  const form=pdf.getForm();
  const fields:FormField[]=form.getFields();
  const get=(name:string):FormField=>{
    const found=fields.find(f=>f.getName().endsWith("."+name+"[0]"));
    if(!found)throw new Error("Campo non trovato nel modulo originale: "+name);
    return found;
  };
  const scrivi=(name:string,value:string)=>{
    const f=get(name);
    if(typeof f.setText!=="function")throw new Error("Campo non scrivibile: "+name);
    f.setText(value);
  };
  scrivi("CFdatorelavoro",d.cf);
  scrivi("EMmail",d.email);
  for(let i=0;i<10;i++){
    const r=d.righe[i],n=i+1;
    scrivi("CFlavoratore"+n,r.cf);
    scrivi("CCcodcomunicazione"+n,r.codice);
    scrivi("DTdatainizio"+n,r.inizio);
    scrivi("DTdatafine"+n,r.fine);
  }
  const checkbox=get("ANannullamento");
  if(d.annulla){
    if(!checkbox.check)throw new Error("Casella annullamento mancante.");
    checkbox.check();
  }else{checkbox.uncheck?.();}
  // Il PDF di consultazione deve essere leggibile anche fuori da Acrobat Reader.
  // Elimina XFA dal documento di COPIA, genera le apparenze e appiattisce i campi.
  form.deleteXFA();
  const font=await pdf.embedFont(lib.StandardFonts.Helvetica);
  form.updateFieldAppearances(font);
  form.flatten();
  const bytes:Uint8Array=await pdf.save();
  return new Blob([new Uint8Array(bytes)],{type:"application/pdf"});
};
const errore=(e:unknown)=>e instanceof Error?e.message:"Errore PDF non previsto.";
export const visualizzaPdfIntermittenti=async(xml:string)=>{
  const tab=window.open("","_blank");
  try{
    const blob=await generaPdfIntermittenti(xml);
    const url=URL.createObjectURL(blob);
    if(tab){tab.location.href=url;}else{
      const a=document.createElement("a");a.href=url;a.target="_blank";a.rel="noopener";a.click();
    }
    setTimeout(()=>URL.revokeObjectURL(url),120000);
  }catch(e){tab?.close();window.alert("Impossibile visualizzare il PDF ministeriale: "+errore(e));}
};
export const scaricaPdfIntermittenti=async(xml:string,filename:string)=>{
  try{
    const blob=await generaPdfIntermittenti(xml);
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=filename;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),120000);
  }catch(e){window.alert("Impossibile scaricare il PDF ministeriale: "+errore(e));}
};
