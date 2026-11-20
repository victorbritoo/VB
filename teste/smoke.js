/* VB - teste de fumaca. Uso: node teste/smoke.js  (na raiz do repositorio)
   Abre o index.html com um Supabase falso (fake.js) em 373 (tela de fora), 469 (repartida) e 867 (aberta),
   passa pelas telas e acusa erro de JavaScript. Dados falsos: serve para desenho e erro, nunca para conferir conta.
   Para comparar com outra versao: node teste/smoke.js /caminho/outra.html */
const path=require('path'), fs=require('fs');
let pw; try{ pw=require('playwright-core'); }catch(e){ pw=require('/opt/node-tools/node_modules/playwright-core'); }
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const PARTES={rep:{cpf:'000.000.000-00',rg:'0000000',end:'Rua Teste, 1'},
  fact:{cnpj:'00.000.000/0001-00',end:'Av. Teste, 1',pix:'00000000000100',np_end:'Av. Teste, 1'},
  com:{cnpj:'11.111.111/0001-11',end:'Av. Teste, 2',pix:'11.111.111/0001-11',np_end:'Av. Teste, 2'}};
const TELAS=['fin','ant','pag','ven','ren','mer','hist','ges','home'];
(async()=>{
  const b=await pw.chromium.launch(); let falhas=0;
  for(const w of [373,469,867]){
    const pg=await (await b.newContext({viewport:{width:w,height:669}})).newPage(); const errs=[];
    pg.on('pageerror',e=>errs.push(String(e).slice(0,160)));
    await pg.route('**/*', r=>{ const u=r.request().url();
      if(u.includes('supabase-js')) return r.fulfill({body:FAKE,contentType:'text/javascript'});
      if(u.startsWith('file:')) return r.continue(); return r.abort(); });
    await pg.addInitScript(p=>{ window.__DB={vb_meta:[{chave:'ctr_partes',valor:JSON.stringify(p)}]}; }, PARTES);
    await pg.goto('file://'+ARQ); await pg.waitForTimeout(2500);
    for(const t of TELAS){ await pg.evaluate(t=>{ try{ showScreen(t); }catch(e){ throw new Error('showScreen '+t+': '+e.message); } }, t).catch(e=>errs.push(String(e).slice(0,160))); await pg.waitForTimeout(500); }
    const info=await pg.evaluate(()=>({v:document.title, partes:!!window.VB_PARTES, medida:!!document.getElementById('vbm-medida'), rolaLado:document.documentElement.scrollWidth>innerWidth+1}));
    if(errs.length||!info.partes||info.rolaLado) falhas++;
    console.log(w, JSON.stringify(info), errs.length?errs:'sem erro');
  }
  await b.close(); console.log(falhas?'FALHOU':'OK'); process.exit(falhas?1:0);
})();
