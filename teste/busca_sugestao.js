/* 1.416.0: campo com sugestao casa por palavra, em qualquer ordem, sem acento.
   Uso: node teste/busca_sugestao.js [arquivo.html] */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
(async()=>{const b=await pw.chromium.launch();const pg=await (await b.newContext({viewport:{width:400,height:800}})).newPage();const errs=[];
 pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
 await pg.goto('file://'+ARQ);await pg.waitForTimeout(2000);
 const r=await pg.evaluate(()=>({
  a:VB_casaPal('FULANO DE TAL SOBRENOME','FUL SOB'), b:VB_casaPal('FULANO DE TAL SOBRENOME','SOB FUL'), c:VB_casaPal('JOÃO CÉSAR','joao ces'),
  d:VB_casaPal('FULANO DE TAL','FUL XYZ'), e:VB_casaPal('DATEJUST 41MM JUB BLUE DIA','DATE BLUE'), f:MER_marcasSug('AUD').length>=0 }));
 const ok=r.a&&r.b&&r.c&&!r.d&&r.e&&!errs.length;
 console.log(JSON.stringify(r),errs.length?errs:'sem erro');console.log(ok?'OK':'FALHOU');await b.close();process.exit(ok?0:1);})();
