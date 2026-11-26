/* VB 1.414.5 - tela aberta: a barra da busca das ENTRADAS some ao ir para outra tela e a busca fecha (ao voltar as ENTRADAS abrem sem busca, como sempre); teto da busca 300.
   Uso: node teste/busca_ren_tela.js. Dado falso. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:1183,height:595}})).newPage();let e=0;pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>MESA_ir('ren'));await pg.waitForTimeout(600);
await pg.evaluate(()=>{REN_toggleBusca();});await pg.waitForTimeout(300);
await pg.evaluate(()=>{const i=document.getElementById('ren-busca-inp');i.value='WET';REN_buscaInput(i);});await pg.waitForTimeout(300);
const st=()=>pg.evaluate(()=>{const b=document.getElementById('vbm-busca');return {bar:b?b.style.display:'-',cls:document.documentElement.classList.contains('vbm-buscando'),val:(document.getElementById('ren-busca-inp')||{}).value};});
const a=await st();await pg.evaluate(()=>MESA_ir('mer'));await pg.waitForTimeout(600);const m=await st();await pg.evaluate(()=>MESA_ir('ren'));await pg.waitForTimeout(600);const v=await st();
console.log(JSON.stringify({a,m,v}));const ok=a.bar==='flex'&&a.cls&&m.bar==='none'&&!m.cls&&v.bar==='none';
console.log(ok?'tudo ok':'FALHA',e?'ERROS '+e:'sem erro de JS');await b.close();process.exit(ok&&!e?0:1);})();
