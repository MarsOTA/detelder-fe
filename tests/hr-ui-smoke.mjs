import assert from "node:assert/strict";
import {chromium} from "playwright";

// The frontend is a real built Vite application. Every backend response is
// intercepted in the browser: no request is sent to Aiven or OVH.
const appUrl="http://127.0.0.1:4173";
const apiHost="https://hr-ci-backend.invalid/";
const browser=await chromium.launch({headless:true});
const cors={
  "access-control-allow-origin":appUrl,
  "access-control-allow-credentials":"true",
  "access-control-allow-headers":"Authorization,Content-Type,Accept",
  "access-control-allow-methods":"GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "content-type":"application/json"
};
const users=[{
  id:5,nome:"Utente",cognome:"Fittizio",email:"test@example.invalid",
  ruoloPrincipale:"OPERATORE",ruoloHR:"HR"
}];
let writes=[];
const createPage=async(primaryRole,hrRole)=>{
  const context=await browser.newContext({serviceWorkers:"block"});
  const page=await context.newPage();
  await page.addInitScript((role)=>{
    localStorage.setItem("ruolo",role);
    localStorage.setItem("token","fake-ui-session");
    localStorage.setItem("idOperatore","3");
  },primaryRole);
  await page.route("**/*",async route=>{
    const url=route.request().url();
    if(!url.startsWith(apiHost))return route.continue();
    if(route.request().method()==="OPTIONS"){
      return route.fulfill({status:204,headers:cors,body:""});
    }
    const suffix=url.slice(apiHost.length).split("?")[0];
    let payload={ok:true};
    if(suffix==="auth/checkAuth")payload={ok:true};
    else if(suffix==="hr-workflow/me")payload={id:3,role:hrRole};
    else if(suffix==="hr-workflow/utenti")payload=users;
    else if(suffix==="hr-workflow/pratiche")payload=[];
    else if(suffix==="operatori"||suffix==="turni")payload=[];
    else if(suffix.startsWith("operatori/listaContrattiOperatore/"))payload=[];
    else if(suffix.match(/^hr-workflow\/utenti\/\d+\/ruolo$/)&&route.request().method()==="PUT"){
      const body=JSON.parse(route.request().postData()||"{}");
      writes.push({path:suffix,role:body.role});
      users[0].ruoloHR=body.role;
      payload={id:Number(suffix.split("/")[2]),role:body.role};
    }else {
      // Fail visibly if the UI unexpectedly accesses a new backend endpoint.
      throw new Error("Unmocked endpoint: "+route.request().method()+" "+suffix);
    }
    return route.fulfill({status:200,headers:cors,body:JSON.stringify(payload)});
  });
  return {context,page};
};
try{
  const combined=await createPage("ADMIN","ADMIN_HR");
  await combined.page.goto(appUrl+"/admin/modulo-hr");
  await combined.page.getByRole("link",{name:"Lavora HR"}).waitFor({timeout:20000});
  await combined.page.getByRole("link",{name:"Ruoli HR"}).click();
  await combined.page.getByText("Abilitazioni ADMIN / HR").waitFor();
  const select=combined.page.getByRole("combobox",{name:"Ruolo HR Utente Fittizio"});
  await select.selectOption("ADMIN_HR");
  await combined.page.waitForFunction(()=>document.querySelector("select")?.value==="ADMIN_HR",null,{timeout:10000});
  assert.deepEqual(writes,[{path:"hr-workflow/utenti/5/ruolo",role:"ADMIN_HR"}]);
  await combined.page.getByRole("link",{name:"Lavora HR"}).click();
  await combined.page.getByText("Torna ad Admin").waitFor();
  assert.equal(new URL(combined.page.url()).pathname,"/hr");
  await combined.context.close();
  console.log("OK: ADMIN_HR opens Admin, manages HR roles and works in HR queue");

  const hr=await createPage("OPERATORE","HR");
  await hr.page.goto(appUrl+"/hr");
  await hr.page.getByText("DETELDER · HR").waitFor({timeout:20000});
  await hr.page.goto(appUrl+"/admin/modulo-hr");
  await hr.page.getByText("Accesso Negato").waitFor({timeout:20000});
  await hr.context.close();
  console.log("OK: HR user cannot access administrator routes");

  const admin=await createPage("ADMIN","ADMIN");
  await admin.page.goto(appUrl+"/hr");
  await admin.page.getByText("Accesso Negato").waitFor({timeout:20000});
  await admin.context.close();
  console.log("OK: legacy ADMIN does not silently inherit HR privileges");

  const denied=await createPage("OPERATORE",null);
  await denied.page.goto(appUrl+"/hr");
  await denied.page.getByText("Accesso Negato").waitFor({timeout:20000});
  await denied.context.close();
  console.log("OK: operator without HR entitlement cannot enter HR");
}finally{
  await browser.close();
}
