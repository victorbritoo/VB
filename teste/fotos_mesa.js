/* 1.418.0: fotos da tela aberta (867, 1183x595, 1280) em todas as telas e fichas da direita, para FOTO IGUAL entre duas versoes.
   Uso: node teste/fotos_mesa.js arquivo.html PASTA  (duas vezes) e compare as pastas com: node teste/fichas_ren.js --compara A B */
const fs=require('fs');const pw=require('/opt/node-tools/node_modules/playwright-core');
const FAKE=fs.readFileSync(require('path').join(__dirname,'fake.js'),'utf8');const ARQ=process.argv[2], OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const PARTES={rep:{cpf:'0',rg:'0',end:'R'},fact:{cnpj:'0',end:'A',pix:'0',np_end:'A'},com:{cnpj:'1',end:'A',pix:'1',np_end:'A'}};
(async()=>{const b=await pw.chromium.launch();const errs=[];
for(const [w,h] of [[867,669],[1183,595],[1280,800]]){
 const pg=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
 pg.on('pageerror',e=>errs.push(w+' '+e.message));
 await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
 await pg.addInitScript(p=>{ Date.now=(()=>{const t=Date.parse('2026-11-27T15:00:00Z');let k=0;return()=>t+(k+=1);})(); const ops=[]; for(let i=0;i<5;i++) ops.push({id:'A'+i,nome:'OPERACAO '+i,cliente:'CLIENTE',valor_bruto:10000,valor_liquido:9000,taxa:3.5,data_operacao:'2026-11-1'+i,created_at:'2026-11-1'+i+'T10:00:00Z',titulos:[]}); window.__DB={antecipacoes:ops,vb_meta:[{chave:'ctr_partes',valor:JSON.stringify(p)}]}; },PARTES);
 await pg.goto('file://'+ARQ);await pg.waitForTimeout(2500);
 const est=[['home',()=>showScreen('home')],['fin',()=>showScreen('fin')],['ant',()=>showScreen('ant')],['pag',()=>showScreen('pag')],['ven',()=>showScreen('ven')],['mer',()=>showScreen('mer')],['ges',()=>showScreen('ges')],['cli',()=>showScreen('cli')],['con',()=>showScreen('con')],['soc',()=>showScreen('soc')],
  ['hist',()=>{showScreen('hist');HIST_loadTab('ant');}],['histop',()=>MESA_histOp(0)],['histfm',()=>{try{MESA_fechaLeitura()}catch(e){};var o=document.getElementById('vbm-hist-op');if(o)o.style.display='none';FM_abrir();}],
  ['cliclip',()=>{FM_fechar();showScreen('cli');CLIP_abrir('CLIENTE TESTE',null);}],['finclip',()=>{showScreen('fin');CLIP_abrir('CLIENTE TESTE',null);}],
  ['ren',()=>{var c=document.getElementById('clip-overlay');if(c)c.style.display='none';showScreen('ren');}],['rencpp',()=>MESA_renDirIr('cpp')],['renbusca',()=>{MESA_renDirIr('cp');REN_toggleBusca();}]];
 for(const [n,f] of est){ await pg.evaluate(f).catch(e=>errs.push(n+' '+e.message)); await pg.waitForTimeout(1300); await pg.evaluate(()=>{document.querySelectorAll('#vbm-medida,#vb-toast').forEach(e=>e.style.visibility='hidden');}); await pg.screenshot({path:OUT+'/'+w+'_'+n+'.png'}); }
 await pg.close();}
await b.close(); console.log(errs.length?errs:'sem erro');})();
