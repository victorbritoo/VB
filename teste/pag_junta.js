/* 1.417.0: ATUALIZAR em PAGAMENTOS rele a folha no banco e junta a linha lancada por fora (Fernandes) antes de gravar;
   linha que ja estava nao duplica. Uso: node teste/pag_junta.js [arquivo.html]. Dado falso. */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
(async()=>{const b=await pw.chromium.launch();const errs=[];
 const pg=await (await b.newContext({viewport:{width:400,height:800}})).newPage();
 pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
 await pg.goto('file://'+ARQ);await pg.waitForTimeout(2200);
 const r=await pg.evaluate(()=>new Promise(res=>{
  const folha={id:'PJ1',nome:'FOLHA TESTE',valor_total:1000,pagamentos:[{desc:'PIX A',valor:'100,00'}],created_at:'2026-11-27T10:00:00Z'};
  __DB.pagamentos=[folha]; HIST_carregarPag(JSON.parse(JSON.stringify(folha)));
  folha.pagamentos=[{desc:'PIX A',valor:'100,00'},{desc:'PIX DE FORA',valor:'200,00'}];   /* o Fernandes lancou no banco */
  PAG_pagamentos.push({id:99,desc:'PIX DO APP',valor:'300,00'});
  let enviado=null; const up=sb.from; sb.from=function(t){ const q=up.call(sb,t); const u=q.update; q.update=function(v){ enviado=v; return u.call(q,v); }; return q; };
  PAG_nomeChecked=true; PAG_confirmarOperacao(null); PAG_nomeChecked=false;
  setTimeout(()=>{ sb.from=up; res({enviado:enviado&&enviado.pagamentos.map(p=>p.desc), tela:PAG_pagamentos.filter(p=>p.desc).map(p=>p.desc)}); },1500); }));
 const ok=r.enviado && r.enviado.join()==='PIX A,PIX DO APP,PIX DE FORA' && r.tela.indexOf('PIX DE FORA')>=0 && !errs.length;
 console.log(JSON.stringify(r), errs.length?errs:'sem erro'); console.log(ok?'OK':'FALHOU'); await b.close(); process.exit(ok?0:1);})();
