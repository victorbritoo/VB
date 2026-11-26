/* VB 1.415.3 - Historico > PAGAMENTOS na tela aberta: a operacao da direita tem ABRIR PAGAMENTO e ele abre a tela PAGAMENTOS com o lancamento.
   Uso: node teste/hist_pag_abrir.js. Dado falso. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:1183,height:595}})).newPage();let e=0;pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2200);
await pg.evaluate(()=>{__DB.pagamentos=[{id:'P1',nome:'PAGAMENTO TESTE',valor_total:1000,pagamentos:[{desc:'PIX',valor:'400,00'}],created_at:'2026-11-26T11:37:00Z'}];MESA_ir('hist');});await pg.waitForTimeout(800);
await pg.evaluate(()=>{HIST_loadTab('pag');});await pg.waitForTimeout(1200);
await pg.evaluate(()=>{const el=[...document.querySelectorAll('#hist-lista [data-idx]')][0];VB_screenTs=0;if(el) HIST_clickItem(el);});await pg.waitForTimeout(700);
const r=await pg.evaluate(()=>{const bt=[...document.querySelectorAll('#vbm-hist-op button')].find(x=>x.textContent.trim()==='ABRIR PAGAMENTO');if(!bt) return {bt:false};bt.click();return new Promise(res=>setTimeout(()=>res({bt:true,tela:VB_telaAtual,total:document.getElementById('pag-total').value,nome:document.getElementById('pag-nome').value}),600));});
console.log(JSON.stringify(r));const ok=r.bt&&r.tela==='pag'&&r.total==='1.000,00'&&r.nome==='PAGAMENTO TESTE';
console.log(ok?'tudo ok':'FALHA',e?'ERROS '+e:'sem erro de JS');await b.close();process.exit(ok&&!e?0:1);})();
