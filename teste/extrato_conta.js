/* VB 1.415.4 - EXTRATO da conta (SAIDAS): tabela das parcelas da compra (mesma foto das ENTRADAS) + frase "Saldo: R$ X.". Botao sempre visivel.
   Uso: node teste/extrato_conta.js [PASTA]. Dado falso; conta e pagamentos injetados. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');const PASTA=process.argv[2]||null;
(async()=>{const b=await pw.chromium.launch();let falhas=0,erros=0;
for(const w of [400,1148]){
const pg=await(await b.newContext({viewport:{width:w,height:807}})).newPage();pg.on('pageerror',x=>{erros++;console.log('ERRO',String(x).slice(0,200))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>new Promise(res=>{showScreen('ren');
  const g=[{id:'C0',valor:20000,venc:'2026-08-24',pago_em:'2026-08-31',descricao:'RELOGIO TESTE',credor:'FORNECEDOR'},
    {id:'C1',valor:50000,venc:'2026-11-23',descricao:'RELOGIO TESTE',credor:'FORNECEDOR'},
    {id:'C2',valor:10000,venc:'2027-01-23',descricao:'RELOGIO TESTE',credor:'FORNECEDOR'}];
  const c=g[1];
  window.REN_cpDe=(i)=>g.find(x=>x.id===i); window.REN_cpIrmas=()=>g; window.REN_cpPagsDe=()=>[];
  window.REN_cpPagoTot=(y)=>y.id==='C1'?44447:0;
  PAG_pagamentos=[{id:1,desc:'NAO MEXER',valor:'1,00'}];PAG_counter=1;
  let copiado='';try{navigator.clipboard.writeText=t=>{copiado=t;return Promise.resolve();};}catch(e){}
  REN_cpFicha('C1');
  const temBtn=[...document.querySelectorAll('#ren-cp-ov button')].some(x=>x.textContent.trim()==='EXTRATO');
  REN_cpFoto('C1');
  setTimeout(()=>{const ov=document.getElementById('vb-foto-overlay');res({temBtn,vis:ov&&ov.style.display,src:(document.getElementById('vb-foto-img').src||'').slice(0,15),frase:VB_fotoFrase,copiado,pag:PAG_pagamentos[0].desc});},700);}));
console.log(w,JSON.stringify(r));
if(!(r.temBtn&&r.vis==='block'&&r.src.indexOf('data:image')===0&&r.frase==='Saldo: R$ 15.553,00.'&&r.pag==='NAO MEXER')){falhas++;console.log('FALHA',w);}
if(PASTA){fs.mkdirSync(PASTA,{recursive:true});await pg.screenshot({path:path.join(PASTA,'extrato_'+w+'.png')});const s=await pg.evaluate(()=>document.getElementById('vb-foto-img').src);fs.writeFileSync(path.join(PASTA,'extrato_foto.jpg'),Buffer.from(s.split(',')[1],'base64'));}
await pg.context().close();}
await b.close();console.log(erros?'ERROS '+erros:'sem erro de JS',falhas?'FALHAS '+falhas:'tudo ok');process.exit(erros||falhas?1:0);})();
