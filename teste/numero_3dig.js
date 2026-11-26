/* VB 1.414.4 - numero de parcela/titulo com 3 digitos (WET SUB 105X): "04 DE 105", "100 DE 105", titulo 100; ate 99 igual ("02 DE 05").
   Tambem a linha PARCELAS da ficha da peca com ano quando nao e o corrente. Uso: node teste/numero_3dig.js. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:400,height:800}})).newPage();let e=0;pg.on('pageerror',x=>{e++;console.log('ERRO',String(x))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve(__dirname,'..','index.html'));await pg.waitForTimeout(2500);
const r=await pg.evaluate(()=>({
 a:REN_nm({tab:'ant',idx:3,tot:105}), b:REN_nm({tab:'ant',idx:99,tot:105}), c:REN_nm({tab:'ant',idx:104,tot:105}), d:REN_nm({tab:'ant',idx:1,tot:5}),
 np:NP_dd2(100)+'/'+NP_dd2(105)+' '+NP_dd2(7), dt:NP_fmtDt({d:5,m:3,y:2027}) }));
console.log(JSON.stringify(r));
const ok=r.a==='04 de 105'&&r.b==='100 de 105'&&r.c==='105 de 105'&&r.d==='02 de 05'&&r.np==='100/105 07'&&r.dt==='05/03/2027';
console.log(ok?'tudo ok':'FALHA',e?'ERROS '+e:'sem erro de JS');await b.close();process.exit(ok&&!e?0:1);})();
