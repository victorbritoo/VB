/* 1.417.1: Historico > card aberto > PAGAMENTO > VB volta para o Historico com o card aberto e na mesma altura.
   Uso: node teste/pag_volta_hist.js [arquivo.html]. Dado falso. */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
(async()=>{const b=await pw.chromium.launch();let falhas=0;const errs=[];
 for(const w of [400,1183]){
 const pg=await (await b.newContext({viewport:{width:w,height:700}})).newPage();
 pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
 await pg.addInitScript(()=>{ const ops=[]; for(let i=0;i<14;i++) ops.push({id:'A'+i,nome:'OPERACAO '+i,cliente:'CLIENTE',valor_bruto:10000+i,valor_liquido:9000+i,taxa:3.5,data_operacao:'2026-11-'+String(10+i).padStart(2,'0'),created_at:'2026-11-'+String(10+i).padStart(2,'0')+'T10:00:00Z',titulos:[]});
   window.__DB={antecipacoes:ops,pagamentos:[]}; });
 await pg.goto('file://'+ARQ);await pg.waitForTimeout(2200);
 await pg.evaluate(()=>{ showScreen('hist'); HIST_loadTab('ant'); });await pg.waitForTimeout(1500);
 const antes=await pg.evaluate(()=>{ const rows=[...document.querySelectorAll('#hist-lista [data-idx]')]; const alvo=rows[8]; if(!alvo) return null;
   const idx=alvo.getAttribute('data-idx'); VB_screenTs=0; HIST_toggleExp(idx,{stopPropagation(){}});
   VB_rolaPara(Math.max(0, alvo.getBoundingClientRect().top+VB_sy()-120)); return {idx, id:HIST_rowsCache[idx].id, y:VB_sy()}; });
 if(!antes){ console.log(w,'sem lista'); falhas++; continue; }
 await pg.waitForTimeout(500);
 const y0=await pg.evaluate(()=>VB_sy());
 await pg.evaluate(i=>HIST_pagDaAnt(+i,'ant'), antes.idx);await pg.waitForTimeout(1500);
 const tela=await pg.evaluate(()=>VB_telaAtual);
 await pg.evaluate(()=>VB_voltarDeTela());await pg.waitForTimeout(1800);
 const depois=await pg.evaluate(id=>{ const i=HIST_rowsCache.findIndex(r=>r.id===id); const d=document.getElementById('hist-exp-'+i); return {tela:VB_telaAtual, aberto:!!(d&&d.style.display==='block'), y:VB_sy()}; }, antes.id);
 const ok=tela==='pag'&&depois.tela==='hist'&&depois.aberto&&Math.abs(depois.y-y0)<=2;
 if(!ok) falhas++; console.log(w,ok?'ok':'FALHOU',JSON.stringify({tela,y0,depois}));
 await pg.close(); }
 await b.close(); console.log(errs.length?errs:'sem erro', falhas?'FALHOU':'OK'); process.exit(falhas||errs.length?1:0);})();
