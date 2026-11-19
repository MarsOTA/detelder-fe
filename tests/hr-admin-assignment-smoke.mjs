import assert from "node:assert/strict";
import {chromium} from "playwright";

// End-to-end UI regression using a real Vite build and intercepted fake API.
// No requests go to Aiven, Vercel backend or OVH.
const app="http://127.0.0.1:4173";
const api="https://hr-ci-backend.invalid/";
const date=(days)=>{
  const d=new Date();d.setDate(d.getDate()+days);
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-");
};
const start=date(3),end=date(20);
const worker={id:4,ruolo:"OPERATORE",nome:"Luca",cognome:"Fittizio",codiceFiscale:"FZZLCU00A01F205Z"};
const shift={idTurno:44,idOperatore:4,dataTurno:date(8),oraInizio:"09:00",oraFine:"17:00",nomeEvento:"Evento test HR"};
let practices=[],postCount=0;
const headers={
  "access-control-allow-origin":app,
  "access-control-allow-credentials":"true",
  "access-control-allow-headers":"Authorization,Content-Type,Accept",
  "access-control-allow-methods":"GET,POST,PATCH,PUT,DELETE,OPTIONS",
  "content-type":"application/json"
};
const browser=await chromium.launch({headless:true});
try{
 const ctx=await browser.newContext({serviceWorkers:"block"});
 const page=await ctx.newPage();
 await page.addInitScript(()=>{
   localStorage.setItem("ruolo","ADMIN");
   localStorage.setItem("token","ci-admin-session");
   localStorage.setItem("idOperatore","1");
 });
 await page.route("**/*",async route=>{
   const url=route.request().url();
   if(!url.startsWith(api))return route.continue();
   if(route.request().method()==="OPTIONS")return route.fulfill({status:204,headers,body:""});
   const path=url.slice(api.length).split("?")[0];
   let payload,status=200;
   if(path==="auth/checkAuth")payload={ok:true};
   else if(path==="hr-workflow/me")payload={id:1,role:"ADMIN"};
   else if(path==="operatori")payload=[worker];
   else if(path==="turni")payload=[shift];
   else if(path==="operatori/listaContrattiOperatore/4")payload=[];
   else if(path==="hr-workflow/pratiche"&&route.request().method()==="GET")payload=practices;
   else if(path==="hr-workflow/pratiche"&&route.request().method()==="POST"){
     postCount++;
     const body=JSON.parse(route.request().postData()||"{}");
     practices=[{
       id:77,idOperatore:4,nome:"Luca",cognome:"Fittizio",
       tipologia:body.tipologia,datore:body.datore,
       dataInizio:body.dataInizio,dataFine:body.dataFine,
       stato:"DA_ELABORARE",note:null,assegnatoDa:1,
       presoInCaricoDa:null,creatoIl:"2026-11-19T00:00:00Z"
     }];
     payload={id:77,stato:"DA_ELABORARE"};status=201;
   }else throw new Error("Unmocked API: "+route.request().method()+" "+path);
   return route.fulfill({status,headers,body:JSON.stringify(payload)});
 });
 await page.goto(app+"/admin/modulo-hr");
 const row=page.getByRole("row",{name:/Apri pratica HR di Fittizio Luca/});
 await row.waitFor({timeout:25000});
 await row.getByRole("combobox",{name:"Inquadramento"}).selectOption("CHIAMATA");
 await row.getByLabel("Data inizio contratto di Fittizio").fill(start);
 await row.getByLabel("Data fine contratto di Fittizio").fill(end);
 await row.getByRole("button",{name:"Assegna ad HR"}).click();
 await row.getByRole("button",{name:"Apri pratica HR"}).waitFor({timeout:12000});
 assert.equal(postCount,1,"Admin must assign exactly one practice");
 assert.equal(await row.getByRole("button",{name:"Assegna nuovo contratto"}).count(),0,
   "New worker must not be prompted to assign another contract while HR practice is open");
 assert.equal(await row.getByRole("button",{name:"Assegna ad HR"}).count(),0,
   "Assigned practice cannot be assigned twice from the same row");
 console.log("OK: new operator assignment switches to Apri pratica HR, not Assegna nuovo contratto");
 console.log("OK: only one HR assignment was posted to the backend");
 await ctx.close();
}finally{await browser.close();}
