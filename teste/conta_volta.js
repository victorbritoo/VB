/* VB 1.413.1 - ficha da CONTA (leitura) fecha ao voltar pela barra na tela aberta. Uso: node teste/conta_volta.js */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync('teste/fake.js','utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:1148,height:807}})).newPage();pg.on('pageerror',x=>console.log('ERRO',String(x)));
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve('index.html'));await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>new Promise(res=>{MESA_ir('ren');setTimeout(()=>{const c={id:'C1',valor:50000,venc:'2026-11-23',descricao:'X'};window.REN_cpDe=()=>c;window.REN_cpPagsDe=()=>[];REN_cpFicha('C1');const a=MESA_vis('ren-cp-ov');MESA_ir('home');setTimeout(()=>res({antes:a,depois:MESA_vis('ren-cp-ov'),tela:VB_telaAtual}),500);},500);}));
console.log(JSON.stringify(r));await b.close();})();
