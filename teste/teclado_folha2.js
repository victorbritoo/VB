/* VB 1.412.2 - folha de baixo presa no alto com teclado (Duo aberto): passo a passo toque/teclado/outro campo/solto. Uso: node teste/teclado_folha2.js */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync('teste/fake.js','utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:1148,height:807},hasTouch:true})).newPage();
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve('index.html'));await pg.waitForTimeout(2500);
await pg.evaluate(()=>{showScreen('mer');MER_toggleForm();});await pg.waitForTimeout(500);
const st=()=>pg.evaluate(()=>{const ov=document.getElementById('mer-form-ov'),ch=ov.firstElementChild,el=document.activeElement;return {kbU:MESA_teclKbUlt,mh:ch.style.maxHeight,top:Math.round(ch.getBoundingClientRect().top),bot:Math.round(ch.getBoundingClientRect().bottom),campo:el&&el.id?Math.round(el.getBoundingClientRect().bottom):null,ai:ov.style.alignItems};});
await pg.evaluate(()=>document.getElementById('mer-custo').focus());console.log('toque',JSON.stringify(await st()));
await pg.evaluate(()=>{const vv=window.visualViewport;Object.defineProperty(vv,'height',{get:()=>innerHeight-282,configurable:true});vv.dispatchEvent(new Event('resize'));});await pg.waitForTimeout(900);console.log('teclado',JSON.stringify(await st()));
await pg.evaluate(()=>document.getElementById('mer-valorSocio').focus());await pg.waitForTimeout(900);console.log('socio',JSON.stringify(await st()));
await pg.screenshot({path:'/tmp/kb3.png'});
await pg.evaluate(()=>{document.activeElement.blur();Object.defineProperty(window.visualViewport,'height',{get:()=>innerHeight,configurable:true});window.visualViewport.dispatchEvent(new Event('resize'));});await pg.waitForTimeout(500);console.log('solto',JSON.stringify(await st()));
await b.close();})();
