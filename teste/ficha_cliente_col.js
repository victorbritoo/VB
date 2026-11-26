/* VB 1.415.1 - ficha do cliente na coluna da direita na tela aberta (computador e Duo), inteira; panorama abre por cima; tela fechada igual. Uso: node teste/ficha_cliente_col.js */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync('teste/fake.js','utf8');
(async()=>{const b=await pw.chromium.launch();
for(const [w,h,t] of [[1183,595,false],[867,669,true],[400,800,false]]){const pg=await(await b.newContext({viewport:{width:w,height:h},hasTouch:t})).newPage();pg.on('pageerror',x=>console.log('ERRO',String(x)));
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve('index.html'));await pg.waitForTimeout(2200);
await pg.evaluate(()=>{__DB.clientes=[{id:1,nome:'FULANO DE TAL',cpf:'000.000.000-00',cidade:'FORTALEZA',uf:'CE',ativo:true}];});
await pg.evaluate(()=>{ if(window.MESA_on) MESA_ir('cli'); else showScreen('cli'); });await pg.waitForTimeout(1200);
const r=await pg.evaluate(()=>new Promise(res=>{try{CLI_rows=CLI_rows&&CLI_rows.length?CLI_rows:[{id:1,nome:'FULANO DE TAL',cpf:'000.000.000-00'}];CLI_ficha(0);}catch(e){res('erro '+e);return;}
 setTimeout(()=>{const ov=document.getElementById('vb-clif-sheet');if(!ov){res('sem ficha');return;}const bx=ov.firstElementChild.getBoundingClientRect();res({pai:ov.parentElement.id||ov.parentElement.tagName,x:Math.round(bx.left),w:Math.round(bx.width),t:Math.round(bx.top)});},500);}));
console.log(w,JSON.stringify(r));await pg.screenshot({path:'/tmp/clif_'+w+'.png'});
if(typeof r==='object'){await pg.evaluate(()=>{try{CLIP_abrir('FULANO DE TAL');}catch(e){}});await pg.waitForTimeout(900);console.log(w,'panorama por cima?',await pg.evaluate(()=>{const a=document.getElementById('clip-overlay');if(!a||a.style.display==='none')return 'sem panorama';const r=a.getBoundingClientRect();const el=document.elementFromPoint(r.left+r.width/2,r.top+200);return a.contains(el);}));}
await pg.context().close();}
await b.close();})();
