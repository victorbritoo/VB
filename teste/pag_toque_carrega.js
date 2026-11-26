/* VB 1.415.5 - PAGAMENTOS na tela aberta: tocar num pagamento em aberto da direita carrega a folha da esquerda;
   o que estava na esquerda com valor e mudanca e salvo antes (sem pergunta); a direita vira RESUMO (sem ENCERRAR desde a 1.415.8: so no Historico).
   (o banco falso devolve update sem linhas: confere que o update foi mandado; a troca so acontece no banco de verdade.)
   Uso: node teste/pag_toque_carrega.js [PASTA]. Dado falso. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');const PASTA=process.argv[2]||null;
(async()=>{const b=await pw.chromium.launch();let falhas=0,e=0;
for(const w of [1183]){
const pg=await(await b.newContext({viewport:{width:w,height:700}})).newPage();pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>new Promise(res=>{
  showScreen('pag');
  const doc={id:'P9',nome:'DOC TESTE',valor_total:1000,pagamentos:[{desc:'PIX TESTE',valor:'400,00'}],created_at:'2026-11-20T10:00:00Z',encerrado_em:null};
  setTimeout(()=>{
    __DB.pagamentos=[JSON.parse(JSON.stringify(doc))]; MESA_pagUlt=[doc]; MESA_pagUltTs=Date.now(); MESA_pagSig=null; MESA_pagPinta(true);
    const lista=document.getElementById('vb-mesa-dir').textContent.indexOf('DOC TESTE')>=0;
    MESA_pagToque(0);
    setTimeout(()=>{
      const d=document.getElementById('vb-mesa-dir'), t1={tela:VB_telaAtual,total:document.getElementById('pag-total').value,nome:document.getElementById('pag-nome').value,op:PAG_currentOperationId,resumo:d.textContent.indexOf('RESUMO')>=0,encerrar:[...d.querySelectorAll('button')].some(x=>x.textContent.trim()==='ENCERRAR')};
      /* muda a folha aberta e toca noutro: salva antes */
      PAG_pagamentos[0].valor='500,00'; PAG_update();
      MESA_pagUlt=[{id:'P8',nome:'OUTRO',valor_total:200,pagamentos:[],created_at:'2026-11-21T10:00:00Z'}];
      MESA_pagToque(0);
      setTimeout(()=>{const ov=document.getElementById('vb-c2-overlay');res({lista,t1,pergunta:!!(ov&&ov.style.display!=='none'&&ov.style.display!==''),nome2:document.getElementById('pag-nome').value,upd:(window.__W||[]).filter(x=>x[0]==='update'&&x[1]==='pagamentos').length});},1800);
    },700);
  },400);}));
console.log(w,JSON.stringify(r));
if(!(r.lista&&r.t1.tela==='pag'&&r.t1.total==='1.000,00'&&r.t1.nome==='DOC TESTE'&&r.t1.op==='P9'&&r.t1.resumo&&!r.t1.encerrar&&r.upd>=1&&!r.pergunta)){falhas++;console.log('FALHA',w);}
if(PASTA){fs.mkdirSync(PASTA,{recursive:true});await pg.screenshot({path:path.join(PASTA,'pagtoque_'+w+'.png')});}
await pg.context().close();}
await b.close();console.log(e?'ERROS '+e:'sem erro de JS',falhas?'FALHAS '+falhas:'tudo ok');process.exit(e||falhas?1:0);})();
