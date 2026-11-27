/* 1.417.0: PAGAMENTO de antecipacao e financiamento (venda nao tem) SALVA a folha na hora, ligada a operacao
   (origem_tab/origem_id, created_at do carimbo), abre carregada; 2o toque abre a mesma (nao cria outra);
   simulacao nao cria. Uso: node teste/pag_origem.js [arquivo.html]. Dado falso (o banco falso nao filtra is/ilike). */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
(async()=>{const b=await pw.chromium.launch();let falhas=0,errs=[];
 const nova=async()=>{ const pg=await (await b.newContext({viewport:{width:400,height:800}})).newPage();
 pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
 await pg.goto('file://'+ARQ);await pg.waitForTimeout(2200); return pg; };
 let pg;
 const casos=[['ant',{id:'A1',nome:'OP ANT',valor_liquido:1000}],['fin',{id:'F1',nome:'OP FIN',valor_financiado:2000}]];
 for(const [tab,op] of casos){ pg=await nova();
  const r=await pg.evaluate(([tab,op])=>new Promise(res=>{ __DB.pagamentos=[]; PAG_limpar();
    VB_pagDeOp(tab,op);
    setTimeout(()=>{ const rows=(__DB.pagamentos||[]).filter(x=>x.origem_id===op.id);
      rows.forEach((x,i)=>{ if(!x.id) x.id='P-'+op.id+i; });   /* o banco falso nao gera id */
      const t1={tela:VB_telaAtual,total:document.getElementById('pag-total').value,nome:document.getElementById('pag-nome').value,n:rows.length,row:rows[0]};
      VB_pagDeOp(tab,op);
      setTimeout(()=>{ res({t1,n2:(__DB.pagamentos||[]).filter(x=>x.origem_id===op.id).length,tela2:VB_telaAtual}); },700);
    },900); }),[tab,op]);
  const row=r.t1.row||{};
  const esp={ant:['antecipacoes','1.000,00'],fin:['financiamentos_hist','2.000,00']}[tab];
  const ok=r.t1.tela==='pag'&&r.t1.n===1&&r.n2===1&&row.origem_tab===esp[0]&&row.origem_id===op.id&&/Z$/.test(row.created_at||'')&&r.t1.total===esp[1]&&r.t1.nome===op.nome&&r.tela2==='pag';
  if(!ok) falhas++; console.log(tab,ok?'ok':'FALHOU',JSON.stringify({tela:r.t1.tela,n:r.t1.n,n2:r.n2,tab:row.origem_tab,ca:row.created_at,total:r.t1.total,nome:r.t1.nome}));
 }
 const ven=await pg.evaluate(()=>new Promise(res=>{ __DB.pagamentos=[]; VB_pagDeOp('ven',{id:'V1',nome:'OP VEN',valor_total:3000}); setTimeout(()=>res((__DB.pagamentos||[]).length),600); }));
 if(ven!==0) falhas++; console.log('venda cria',ven);
 const sim=await pg.evaluate(()=>new Promise(res=>{ const n0=(__DB.pagamentos||[]).length; VB_pagDeOp('ant',{id:'S1',nome:'SIM',valor_liquido:5,simulacao:true}); setTimeout(()=>res((__DB.pagamentos||[]).length-n0),600); }));
 if(sim!==0) falhas++; console.log('simulacao cria',sim);
 await b.close(); console.log(errs.length?errs:'sem erro', falhas?'FALHOU':'OK'); process.exit(falhas||errs.length?1:0);})();
