/* VB 1.413.2 - computador (sem toque), tela aberta: tocar nos campos de uma folha nao pode mexer na folha (nada de "fecha e abre").
   Uso: node teste/mac_campo.js. Dado falso; usa a NOVA PECA do Estoque. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:1183,height:595}})).newPage();let e=0;pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{showScreen('mer');MER_toggleForm();});await pg.waitForTimeout(500);
const foto=()=>pg.evaluate(()=>{const ov=document.getElementById('mer-form-ov'),ch=ov.firstElementChild;return JSON.stringify({t:Math.round(ch.getBoundingClientRect().top),s:ch.scrollTop,ai:ov.style.alignItems,pb:ch.style.paddingBottom,tecl:document.documentElement.classList.contains('vb-tecl')});});
const antes=await foto();let ok=true;
for(const id of ['mer-custo','mer-ano','mer-socio']){ for(const t of [0,100,400,800]){ if(t===0) await pg.click('#'+id); else await pg.waitForTimeout(t===100?100:300); const f=await foto(); if(f!==antes){ok=false;console.log('MEXEU',id,t,f,'antes',antes);} } }
console.log(ok?'folha parada':'FALHA', e?'ERROS '+e:'sem erro de JS');await b.close();process.exit(ok&&!e?0:1);})();
