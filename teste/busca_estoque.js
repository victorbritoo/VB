/* VB 1.411.0 - busca do Estoque por palavra. Uso: node teste/busca_estoque.js (na pasta do repositorio). Dado falso. */
const path=require('path'),fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync('teste/fake.js','utf8');
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:1280,height:800}})).newPage();let e=0;pg.on('pageerror',x=>{e++;console.log('ERRO',String(x).slice(0,200))});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+path.resolve('index.html'));await pg.waitForTimeout(2500);
const out=await pg.evaluate(()=>{showScreen('mer');MER_rows=[{id:1,descricao:'ROLEX SKY-DWELLER JUBILEE “GREEN”. 2025',status:'vendida'},{id:2,descricao:'ROLEX SKY-DWELLER OYSTER “BLUE” 2022',status:'estoque',custo:1},{id:3,descricao:'SUBMARINO RELÓGIO',status:'estoque',custo:1}];
 const r={};const inp=document.getElementById('mer-busca');for(const t of ['SKY JU','ju sky','green','relogio','sky xyz','']){inp.value=t;MER_render();r[t]=document.getElementById('mer-lista')?document.getElementById('mer-lista').innerText.replace(/\s+/g,' ').slice(0,160):'?';}return r;});
console.log(JSON.stringify(out,null,1),e);await b.close();})();
