/* VB 1.412.3 - folha presa no alto sem depender da altura do teclado (iPhone pode nao encolher a vv): campo vai para ate 140 abaixo do alto da folha. Uso: node teste/teclado_folha3.js */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync('teste/fake.js','utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:1148,height:807},hasTouch:true})).newPage();pg.on('pageerror',x=>console.log('ERRO',String(x)));
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve('index.html'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{showScreen('mer');MER_toggleForm();});await pg.waitForTimeout(500);
/* iPhone mente: vv.height nao encolhe */
for(const id of ['mer-ano','mer-custo','mer-socio','mer-valorSocio']){
 await pg.evaluate((id)=>document.getElementById(id).focus(),id);await pg.waitForTimeout(800);
 console.log(id,await pg.evaluate((id)=>{const el=document.getElementById(id),ch=document.getElementById('mer-form-ov').firstElementChild;return {campoTop:Math.round(el.getBoundingClientRect().top),boxTop:Math.round(ch.getBoundingClientRect().top)};},id));}
await pg.screenshot({path:'/tmp/kb4.png'});
await pg.evaluate(()=>document.activeElement.blur());await pg.waitForTimeout(500);
console.log('solto',await pg.evaluate(()=>{const ov=document.getElementById('mer-form-ov'),ch=ov.firstElementChild;return {ai:ov.style.alignItems,pb:ch.style.paddingBottom,top:Math.round(ch.getBoundingClientRect().top)};}));
await b.close();})();
