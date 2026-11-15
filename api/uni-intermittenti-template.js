// Proxy per scaricare la copia non compilata del vero modello ministeriale XFA 2015.
// I dati dell'operatore NON sono inviati qui; il riempimento avviene nel browser.
const SOURCES=[
  "https://www.lavorointermittente.com/wp-content/uploads/2022/06/UNI_Intermittenti_giugno2015.pdf",
  "https://regione.lazio.it/sites/default/files/2021-03/LAV_MOD_UNI_Intermittenti_giugno_2015_1.pdf",
  "https://assets-eu-01.kc-usercontent.com/a0e24cdf-7b6b-010e-94fe-bdbecae481ee/4ef41600-6f1e-453d-9c8c-1ebde5ddc422/UNI_Intermittenti.pdf"
];
export default async function handler(req,res){
  if(req.method!=="GET"){res.setHeader("Allow","GET");return res.status(405).end();}
  for(const source of SOURCES){
    try{
      const response=await fetch(source,{signal:AbortSignal.timeout(10000),headers:{Accept:"application/pdf"}});
      if(!response.ok)continue;
      const bytes=Buffer.from(await response.arrayBuffer());
      if(bytes.length<20000||bytes.subarray(0,5).toString("latin1")!=="%PDF-")continue;
      res.setHeader("Content-Type","application/pdf");
      res.setHeader("Content-Length",bytes.length);
      res.setHeader("Cache-Control","public, max-age=3600, s-maxage=86400");
      return res.status(200).send(bytes);
    }catch{}
  }
  return res.status(502).json({message:"Modello originale UNI_Intermittenti non raggiungibile."});
}
