/* 1.418.1: + REPETIR / + ADICIONAR so valem no soltar sem arrastar; encostar para rolar nao acrescenta linha.
   Uso: node teste/toque_firme.js [arquivo.html] */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
(async()=>{const b=await pw.chromium.launch();const errs=[];const pg=await (await b.newContext({viewport:{width:400,height:800},hasTouch:true})).newPage();
 pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
 await pg.goto('file://'+ARQ);await pg.waitForTimeout(2000);
 const r=await pg.evaluate(()=>new Promise(res=>{ showScreen('ven'); VEN_parcelas=[{id:1,valor:'4.000,00',data:'20/12/2026',obs:''}]; VEN_parcelaCounter=1; try{VEN_renderParcelas();VEN_mostrarLista(true);}catch(e){}
  const bt=[...document.querySelectorAll('[onpointerup*="VEN_repetirParcela"]')][0]; if(!bt) return res({erro:'sem botao'});
  const ev=(t,x,y)=>bt.dispatchEvent(new PointerEvent(t,{bubbles:true,cancelable:true,clientX:x,clientY:y,pointerType:'touch'}));
  const n0=VEN_parcelas.length;
  ev('pointerdown',50,50); document.dispatchEvent(new PointerEvent('pointercancel',{bubbles:true})); ev('pointerup',50,50); const nRola=VEN_parcelas.length;
  ev('pointerdown',50,50); ev('pointerup',50,90); const nArrasta=VEN_parcelas.length;
  ev('pointerdown',50,50); ev('pointerup',52,51); const nToque=VEN_parcelas.length;
  res({n0,nRola,nArrasta,nToque}); }));
 const ok=r.n0===1&&r.nRola===1&&r.nArrasta===1&&r.nToque===2&&!errs.length;
 console.log(JSON.stringify(r),errs.length?errs:'sem erro'); console.log(ok?'OK':'FALHOU'); await b.close(); process.exit(ok?0:1);})();
