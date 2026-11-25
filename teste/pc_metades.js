/* VB 1.414.0 - computador: metades iguais ate a borda (coluna da direita de --mx a borda); Duo (toque) igual. Uso: node teste/pc_metades.js */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync('teste/fake.js','utf8');
(async()=>{const b=await pw.chromium.launch();
for(const [w,h,touch] of [[1183,595,false],[1600,900,false],[867,669,true]]){
const pg=await(await b.newContext({viewport:{width:w,height:h},hasTouch:touch,isMobile:false})).newPage();pg.on('pageerror',x=>console.log('ERRO',String(x)));
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve('index.html'));await pg.waitForTimeout(2500);
for(const t of ['ren','mer']){await pg.evaluate(t=>MESA_ir(t),t);await pg.waitForTimeout(600);
const r=await pg.evaluate(()=>{const c=document.getElementById('vb-mesa-col').getBoundingClientRect();return {colL:Math.round(c.left),colR:Math.round(c.right),pc:document.documentElement.classList.contains('vb-mesa-pc')};});
console.log(w,t,JSON.stringify(r));await pg.screenshot({path:'/tmp/pc_'+w+'_'+t+'.png'});}
await pg.context().close();}
await b.close();})();
