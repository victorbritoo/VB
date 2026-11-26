/* VB 1.414.1 - VENDAS > puxar do estoque: a lista mostra o custo com os gastos a cobrar, mesmo sem ter aberto o Estoque antes.
   Uso: node teste/ven_estoque_custo.js. Dado falso (peca 68.000 + gasto cobrar 250 + gasto nao cobrar 100). */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:400,height:800}})).newPage();let e=0;pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>new Promise(res=>{
  __DB.mercadorias=[{id:'M1',descricao:'RELOGIO TESTE',custo:68000,status:'estoque',data_compra:'2026-09-03'}];
  __DB.mercadoria_custos=[{id:'g1',mercadoria_id:'M1',valor:250,cobrar:true,data:'2026-09-05'},{id:'g2',mercadoria_id:'M1',valor:100,cobrar:false,data:'2026-09-06'}];
  MER_gastos={};MER_gastosLoad=false;showScreen('ven');VEN_abrirEstoque();
  setTimeout(()=>{const t=document.getElementById('ven-estoqueLista').innerText;VEN_pegarEstoque('M1');setTimeout(()=>res({lista:t.replace(/\s+/g,' '),campo:document.getElementById('ven-custo').value}),400);},900);}));
console.log(JSON.stringify(r));const ok=/68\.250,00/.test(r.lista)&&r.campo==='68.250,00';
console.log(ok?'tudo ok':'FALHA',e?'ERROS '+e:'sem erro de JS');await b.close();process.exit(ok&&!e?0:1);})();
