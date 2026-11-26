/* VB 1.415.6 - PAGAMENTO nao aparece em antecipacao SIMULACAO (Historico e direita da Antecipacao). Dado falso. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
(async()=>{const b=await pw.chromium.launch();let e=0;
const pg=await(await b.newContext({viewport:{width:1183,height:700}})).newPage();pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>{const o={};
  HIST_rowsCache=[{id:'A',simulacao:true},{id:'B',simulacao:false}];
  o.sim=HIST_buildRow('ant',0,'T','V','01/01/2026','',null,[{l:'Bruto',v:'1'}],null,'',false,false).indexOf('HIST_pagDaAnt')>=0;
  o.real=HIST_buildRow('ant',1,'T','V','01/01/2026','',null,[{l:'Bruto',v:'1'}],null,'',false,false).indexOf('HIST_pagDaAnt')>=0;
  const el=document.createElement('div');
  try{ MESA_antOp(el,{id:'A',simulacao:true,valor_liquido:10,valor_bruto:12,nome:'X'}); o.mSim=el.innerHTML.indexOf('VB_pagDeAnt')>=0;
       MESA_antOp(el,{id:'B',valor_liquido:10,valor_bruto:12,nome:'X'}); o.mReal=el.innerHTML.indexOf('VB_pagDeAnt')>=0; }catch(x){ o.erro=String(x); }
  return o;});
console.log(JSON.stringify(r));const ok=!r.sim&&r.real&&!r.mSim&&r.mReal;
await b.close();console.log(e?'ERROS '+e:'sem erro de JS',ok?'tudo ok':'FALHAS');process.exit(e||!ok?1:0);})();
