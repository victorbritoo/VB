/* 1.416.1: a escolha PDF/WORD do COMPARTILHAR do contrato abre POR CIMA do visualizador (vb-ctr-view, 100020),
   na tela fechada e na aberta, e fica no corpo (nao vira folha da coluna). Uso: node teste/ctr_share.js [arquivo.html] */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
(async()=>{const b=await pw.chromium.launch();let falhas=0;
 for(const w of [373,867,1280]){const pg=await (await b.newContext({viewport:{width:w,height:669}})).newPage();const errs=[];
  pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));
  await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
  await pg.goto('file://'+ARQ);await pg.waitForTimeout(2000);
  await pg.evaluate(()=>{showScreen('hist');const v=document.createElement('div');v.id='vb-ctr-view';v.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:#000;z-index:100020;';document.body.appendChild(v);
   CTR_shareEscolha(new Blob(['x'],{type:'application/octet-stream'}),'TESTE.docx','RELOGIO TESTE');});
  await pg.waitForTimeout(600);
  const r=await pg.evaluate(()=>{const p=document.getElementById('ctrsh-pdf'),d=document.getElementById('ctrsh-doc'),ov=document.getElementById('vb-ctr-sh');
   const hit=e=>{const q=e.getBoundingClientRect();const x=document.elementFromPoint(q.left+q.width/2,q.top+q.height/2);return x===e;};
   return {pdf:hit(p),word:hit(d),pai:ov.parentNode.id||ov.parentNode.tagName};});
  const ok=r.pdf&&r.word&&r.pai==='BODY'&&!errs.length; if(!ok) falhas++;
  console.log(w,JSON.stringify(r),errs.length?errs:'sem erro');await pg.close();}
 await b.close();console.log(falhas?'FALHOU':'OK');process.exit(falhas?1:0);})();
