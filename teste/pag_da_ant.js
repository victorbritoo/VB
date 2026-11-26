/* VB 1.415.0 - PAGAMENTO da antecipacao: abre PAGAMENTOS com NOME = operacao e VALOR TOTAL = liquido; pergunta se PAGAMENTOS ja tem algo.
   Uso: node teste/pag_da_ant.js [PASTA]. Dado falso. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');const PASTA=process.argv[2]||null;
(async()=>{const b=await pw.chromium.launch();let falhas=0,e=0;
for(const w of [400,1183]){
const pg=await(await b.newContext({viewport:{width:w,height:700}})).newPage();pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>new Promise(res=>{
  const op={id:'A1',nome:'OPERACAO TESTE',cliente:'FULANO',valor_bruto:150000,valor_liquido:132050.85,data_operacao:'2026-11-26',created_at:'2026-11-26T10:55:00Z'};
  HIST_rowsCache=[op]; HIST_tabAtual='ant';
  const html=HIST_buildRow?'' :'';
  VB_pagDeAnt(op);
  setTimeout(()=>{const t1={tela:VB_telaAtual,total:document.getElementById('pag-total').value,nome:document.getElementById('pag-nome').value};
    const ov0=document.querySelector('#vb-c2-overlay');
    VB_pagDeAnt(Object.assign({},op,{valor_liquido:1000}));
    setTimeout(()=>{const ov=document.getElementById('vb-c2-overlay');res({t1,pergunta:!!(ov&&ov.style.display!=='none'&&ov.innerText.indexOf('SUBSTITUIR')>=0),total2:document.getElementById('pag-total').value});},400);},500);}));
console.log(w,JSON.stringify(r));
if(!(r.t1.tela==='pag'&&r.t1.total==='132.050,85'&&r.t1.nome==='OPERACAO TESTE'&&r.pergunta&&r.total2==='132.050,85')){falhas++;console.log('FALHA',w);}
if(PASTA){fs.mkdirSync(PASTA,{recursive:true});await pg.screenshot({path:path.join(PASTA,'pag_'+w+'.png')});}
await pg.context().close();}
await b.close();console.log(e?'ERROS '+e:'sem erro de JS',falhas?'FALHAS '+falhas:'tudo ok');process.exit(e||falhas?1:0);})();
