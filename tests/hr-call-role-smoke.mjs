import assert from "node:assert/strict";
import {chromium} from "playwright";

// Real built UI with intercepted API. Never reaches Aiven, email services or OVH.
const appUrl="http://127.0.0.1:4173";
const apiHost="https://hr-ci-backend.invalid/";
const dateIn=(n)=>{const d=new Date();d.setDate(d.getDate()+n);return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
const start=dateIn(3),shift=dateIn(8),end=dateIn(35);
const operator={
 id:4,ruolo:"OPERATORE",nome:"Luca",cognome:"Fittizio",codiceFiscale:"FZZLCU00A01F205Z",
 dataNascita:"2000-01-01",luogoNascita:"Milano",
 indirizzoResidenza:"Via Esempio",numeroCivicoResidenza:"1",
 comuneResidenza:"Milano",provinciaResidenza:"MI",capResidenza:"20100"
};
const practice={
 id:77,idOperatore:4,nome:"Luca",cognome:"Fittizio",tipologia:"CHIAMATA",
 datore:"DETELDER",dataInizio:start,dataFine:end,stato:"IN_LAVORAZIONE",
 assegnatoDa:1,presoInCaricoDa:null,creatoIl:"2026-11-19T00:00:00",note:null
};
const contract={
 idContratto:88,idOperatore:4,tipologia:"CHIAMATA",
 dataInizio:start,dataFine:end,pathContrattoUnilav:"/test/unilav.pdf",pathContrattoFirmato:"/test/signed.pdf"
};
const cors={
 "access-control-allow-origin":appUrl,"access-control-allow-credentials":"true",
 "access-control-allow-headers":"Authorization,Content-Type,Accept",
 "access-control-allow-methods":"GET,POST,PUT,PATCH,DELETE,OPTIONS",
 "content-type":"application/json"
};
const browser=await chromium.launch({headless:true});
const checks=[];
async function verify(role,shouldManage){
 const context=await browser.newContext({serviceWorkers:"block"});
 const page=await context.newPage();
 const errors=[];
 page.on("pageerror",e=>errors.push(e.message));
 await page.addInitScript(()=>{
  localStorage.setItem("ruolo","ADMIN");
  localStorage.setItem("token","fake-ui-session");
  localStorage.setItem("idOperatore","3");
 });
 await page.route("**/*",async route=>{
  const url=route.request().url();
  if(!url.startsWith(apiHost))return route.continue();
  if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers:cors,body:""});
  const suffix=url.slice(apiHost.length).split("?")[0];
  if(suffix.startsWith("upload/mostraImmagineProfilo/"))return route.fulfill({status:204,headers:cors,body:""});
  let payload;
  if(suffix==="auth/checkAuth")payload={ok:true};
  else if(suffix==="hr-workflow/me")payload={id:3,role};
  else if(suffix==="hr-workflow/pratiche")payload=[practice];
  else if(suffix==="hr-workflow/pratiche/77/codice-comunicazione")payload={codice:"TEST-UNILAV-77"};
  else if(suffix==="operatori/ottieniOperatore/4")payload=operator;
  else if(suffix==="operatori/listaContrattiOperatore/4")payload=[contract];
  else if(suffix==="operatori/allegatiOperatore/4")payload={};
  else if(suffix==="chiamate-hr/config/datore")payload={codiceFiscale:"13066390967",email:"info@detelder.com"};
  else if(suffix==="chiamate-hr/4/88")payload=[];
  else if(suffix==="turni")payload=[{idTurno:88,idOperatore:4,dataTurno:shift,oraInizio:"09:00",oraFine:"17:00",nomeEvento:"Evento fittizio"}];
  else throw new Error("Unexpected endpoint during permission test: "+suffix);
  return route.fulfill({status:200,headers:cors,body:JSON.stringify(payload)});
 });
 try{
  await page.goto(appUrl+"/admin/dettaglio-operatore/4?tab=contratti&pratica=77");
  await page.getByText("Nuova chiamata proposta automaticamente").or(page.getByText("Chiamata da comunicare · avvisa HR")).first().waitFor({timeout:25000});
  const checkbox=page.getByRole("checkbox",{name:/Includi prestazione/}).first();
  await checkbox.waitFor({timeout:12000});
  assert.equal(await checkbox.isEnabled(),shouldManage,role+" call checkbox enabled mismatch");
  const send=page.getByRole("button",{name:/Simula comunicazione/});
  assert.equal(await send.count()>0,shouldManage,role+" call action visibility mismatch");
  const code=page.getByRole("textbox",{name:"Codice comunicazione"});
  assert.equal(await code.isEnabled(),shouldManage,role+" UNILAV code edit mismatch");
  // All three refactored tabs must still mount without React errors.
  if(role==="ADMIN_HR"){
    await page.getByRole("tab",{name:"Anagrafica"}).click();
    await page.getByRole("tab",{name:"Allegati"}).click();
    await page.getByRole("tab",{name:"Contratti"}).click();
    await page.getByRole("checkbox",{name:/Includi prestazione/}).first().waitFor({state:"visible",timeout:10000});
  }
  assert.equal(errors.length,0,"React error: "+errors.join("; "));
  checks.push(role+": "+(shouldManage?"execute & edit call prerequisites":"read-only"));
 }finally{await context.close()}
}
try{
 await verify("ADMIN_HR",true);
 await verify("ADMIN",false);
 console.log("OK: Admin-HR can execute intermittent calls from /admin operator profile");
 console.log("OK: plain Admin stays read-only on same operator page");
}finally{await browser.close()}
