/* VB 1.414.2 - varredura do custo cheio (custo + gastos a cobrar): busca do Estoque (EM ESTOQUE e total), ordenar por preco,
   lista de Vendas da tela aberta. Uso: node teste/custo_cheio.js. Dado falso. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
(async()=>{const b=await pw.chromium.launch();let falhas=0,e=0;
const prep=`__DB.mercadorias=[{id:'M1',descricao:'RELOGIO TESTE A',custo:68000,status:'estoque',data_compra:'2026-09-03'},{id:'M2',descricao:'RELOGIO TESTE B',custo:68100,status:'estoque',data_compra:'2026-09-04'}];
__DB.mercadoria_custos=[{id:'g1',mercadoria_id:'M1',valor:250,cobrar:true,data:'2026-09-05'}];MER_gastos={};MER_gastosLoad=false;`;
for(const w of [400,1148]){
const pg=await(await b.newContext({viewport:{width:w,height:807},hasTouch:w>1000})).newPage();pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
await pg.evaluate(prep);
await pg.evaluate(()=>{ if(window.MESA_on) MESA_ir('ven'); else showScreen('ven'); VEN_abrirEstoque(); });await pg.waitForTimeout(1200);
const lista=await pg.evaluate(()=>document.body.innerText.indexOf('68.250,00')>=0);
if(!lista){falhas++;console.log('FALHA',w,'lista de Vendas sem o custo cheio');} else console.log('ok',w,'lista de Vendas');
await pg.evaluate(()=>{ try{VEN_fecharEstoque();}catch(e){} try{MESA_venEstFecha();}catch(e){} if(window.MESA_on) MESA_ir('mer'); else showScreen('mer'); });await pg.waitForTimeout(1500);
const o=await pg.evaluate(()=>{MER_ord='preco_desc';const ord=MER_ordena(MER_rows.filter(r=>r.status==='estoque')).map(r=>r.id).join(',');const inp=document.getElementById('mer-busca');inp.value='TESTE';MER_render();return {ord,txt:document.getElementById('mer-lista').innerText.replace(/\s+/g,' ')};});
const okB=/136\.350,00/.test(o.txt), okO=o.ord==='M2,M1'?false:o.ord==='M1,M2';
console.log(w,o.ord,okB?'ok busca 136.350':'FALHA busca',okO?'ok ordem':'FALHA ordem');if(!okB||!okO)falhas++;
await pg.context().close();}
await b.close();console.log(e?'ERROS '+e:'sem erro de JS',falhas?'FALHAS '+falhas:'tudo ok');process.exit(e||falhas?1:0);})();
