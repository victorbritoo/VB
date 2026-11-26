/* VB 1.414.3 - Fechamento: capital VB parado no estoque = compra + gastos a cobrar (gasto que nao cobra fica fora).
   Uso: node teste/fm_estcap.js. Dado falso. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:400,height:800}})).newPage();let e=0;pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>new Promise(res=>{
 __DB.mercadorias=[{id:'M1',descricao:'A',custo:68000,status:'estoque',data_compra:'2026-09-03'},{id:'M2',descricao:'B',custo:100000,status:'estoque',socio:'FULANO',valor_socio:50000,data_compra:'2026-10-03'}];
 __DB.mercadoria_custos=[{id:'g1',mercadoria_id:'M1',valor:250,cobrar:true},{id:'g2',mercadoria_id:'M1',valor:100,cobrar:false},{id:'g3',mercadoria_id:'M2',valor:1000,cobrar:true}];
 FM_fetchRes().then(rs=>{const out=FM_calcMes('2026-11',rs,{});res(out&&out.rendDet?out.rendDet.estCap:JSON.stringify(Object.keys(out||{})));}).catch(x=>res('erro '+x));}));
console.log('estCap',r);const ok=Math.abs(r-(68250+51000))<0.01;
console.log(ok?'tudo ok':'FALHA',e?'ERROS '+e:'sem erro de JS');await b.close();process.exit(ok&&!e?0:1);})();
