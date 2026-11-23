/* VB 1.412.0 - folha de baixo (NOVA PECA) com teclado no Duo aberto: sobe no toque e fica acima do teclado + barra flutuante (60); tela fechada igual. Uso: node teste/teclado_folha.js (na pasta do repositorio). Teclado simulado de 282. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync('teste/fake.js','utf8');
(async()=>{const b=await pw.chromium.launch();
for(const [w,h] of [[1148,807],[400,800]]){
const pg=await(await b.newContext({viewport:{width:w,height:h},hasTouch:true})).newPage();pg.on('pageerror',x=>console.log('ERRO',String(x).slice(0,200)));
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve('index.html'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{showScreen('mer');});await pg.waitForTimeout(300);
await pg.evaluate(()=>{MER_toggleForm();});await pg.waitForTimeout(500);
for(const id of ['mer-custo','mer-socio']){
/* toque: sem teclado ainda */
const a=await pg.evaluate((id)=>{const el=document.getElementById(id);el.focus();const ov=document.getElementById('mer-form-ov');return {pad:ov.style.paddingBottom,campo:Math.round(el.getBoundingClientRect().bottom)};},id);
/* teclado chega: 282 */
const r=await pg.evaluate((id)=>new Promise(res=>{const vv=window.visualViewport;Object.defineProperty(vv,'height',{get:()=>innerHeight-282,configurable:true});vv.dispatchEvent(new Event('resize'));setTimeout(()=>{const el=document.getElementById(id);const ov=document.getElementById('mer-form-ov');res({pad:ov.style.paddingBottom,campo:Math.round(el.getBoundingClientRect().bottom),limite:innerHeight-282-60,boxTop:Math.round(ov.firstElementChild.getBoundingClientRect().top)});},900);}),id);
console.log(w,id,'toque',JSON.stringify(a),'teclado',JSON.stringify(r));
await pg.evaluate(()=>{document.activeElement.blur();Object.defineProperty(window.visualViewport,'height',{get:()=>innerHeight,configurable:true});window.visualViewport.dispatchEvent(new Event('resize'));});await pg.waitForTimeout(400);
const z=await pg.evaluate(()=>document.getElementById('mer-form-ov').style.paddingBottom);console.log(w,'solto',JSON.stringify(z));
}
if(w===1148){await pg.evaluate(()=>{const el=document.getElementById('mer-custo');el.focus();Object.defineProperty(window.visualViewport,'height',{get:()=>innerHeight-282,configurable:true});window.visualViewport.dispatchEvent(new Event('resize'));});await pg.waitForTimeout(900);await pg.screenshot({path:'/tmp/kb2.png'});}
await pg.context().close();}
await b.close();})();
