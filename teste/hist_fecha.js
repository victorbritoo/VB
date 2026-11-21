/* VB 1.401.0 - etapa 2, 3a familia: operacao do Historico (vbm-hist-op) e Fechamento (fm-overlay) dentro da coluna da direita.
   Uso: node teste/hist_fecha.js PASTA [arquivo.html]   -> fotos em 373, 469, 867 (computador e dedo) e 1280
        node teste/hist_fecha.js --estrutura [arquivo.html]
        comparar pastas: node teste/fichas_ren.js --compara A B */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const SINT=()=>{const ov=document.createElement('div');ov.id='teste-folha';ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.35);z-index:10060;display:flex;align-items:flex-end;justify-content:center;';ov.innerHTML='<div style="width:100%;max-width:460px;background:var(--sf);border-radius:18px 18px 0 0;padding:16px;font-family:-apple-system,sans-serif;"><div style="text-align:center;font-size:11px;letter-spacing:2px;margin-bottom:10px;">FOLHA DE TESTE</div><button onclick="document.getElementById(\'teste-folha\').remove()" style="width:100%;padding:9px;margin-top:8px;border:0.5px solid var(--ln3);border-radius:14px;background:var(--sf2);">FECHAR</button></div>';document.body.appendChild(ov);};
const DB=()=>{window.__DB={
  antecipacoes:[{id:1,cliente:'JOAO TESTE',valor_bruto:50000,valor_liquido:46000,valor_face:50000,taxa:3,data_operacao:'2026-11-10',created_at:'2026-11-10T12:00:00Z',titulos:[{valor:25000,vencimento:'10/12/2026'},{valor:25000,vencimento:'10/01/2027'}]}],
  vendas:[{id:1,cliente:'MARIA TESTE',descricao:'ROLEX DAYTONA 2020',valor_total:150000,custo:120000,data_venda:'2026-11-05',created_at:'2026-11-05T12:00:00Z',parcelas:[{valor:75000,vencimento:'05/12/2026'},{valor:75000,vencimento:'05/01/2027'}]}]};};
const OP=tab=>'async()=>{HIST_loadTab("'+tab+'");await new Promise(r=>setTimeout(r,900));HIST_clickItem(document.querySelector("#hist-lista [data-idx]"));}';
const CASOS=[   /* nome, folha, abre, so tela aberta */
 ['op-ant','vbm-hist-op',OP('ant'),1],
 ['op-ven','vbm-hist-op',OP('ven'),1],
 ['fechamento','fm-overlay',()=>{FM_abrir();},0],
 ['op+folha','teste-folha','async()=>{await ('+OP('ant')+')();await new Promise(r=>setTimeout(r,400));window.__SINT();}',1],
 ['fechamento+folha','teste-folha',async()=>{FM_abrir();await new Promise(r=>setTimeout(r,400));window.__SINT();},0],
];
async function abre(b,arq,w,toque){const pg=await(await b.newContext({viewport:{width:w,height:669},deviceScaleFactor:1,hasTouch:!!toque})).newPage();
  pg.on('pageerror',e=>{abre.erros++;console.log('ERRO JS',w,String(e).slice(0,200));});
  await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
  await pg.addInitScript(()=>{const D=Date,T0=new D(2026,10,20,12,0,0).getTime();function F(...a){return a.length?new D(...a):new D(T0);}F.prototype=D.prototype;F.now=()=>T0+(window.__dt||0);F.parse=D.parse;F.UTC=D.UTC;window.Date=F;});
  await pg.addInitScript(DB);await pg.addInitScript('window.__SINT='+SINT.toString());
  await pg.goto('file://'+arq);await pg.waitForTimeout(2500);
  await pg.addStyleTag({content:'#vbm-medida{display:none!important} *{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  return pg;}
abre.erros=0;
const limpa=pg=>pg.evaluate(async()=>{const t=document.getElementById('teste-folha');if(t)t.remove();['vbm-hist-op','fm-overlay'].forEach(i=>{const o=document.getElementById(i);if(o)o.style.display='none';});try{MESA_sel=null;MESA_marca();}catch(e){}
  window.__dt=(window.__dt||0)+1000;   /* a guarda de toque duplo da troca de tela */
  if(VB_telaAtual!=='hist'){showScreen('hist');await new Promise(r=>setTimeout(r,700));}window.__dt+=1000;});
const vis=(pg,id)=>pg.evaluate(id=>{const o=document.getElementById(id);return !!(o&&o.style.display&&o.style.display!=='none');},id);
const roda=(pg,f)=>pg.evaluate(async f=>{try{await (0,eval)('('+f+')')();return null;}catch(x){return String(x).slice(0,140);}},f.toString());
async function fotos(dir,arq){fs.mkdirSync(dir,{recursive:true});const b=await pw.chromium.launch();const nao=[];
  for(const [w,tq] of [[373,0],[469,0],[867,0],[867,1],[1280,0]]){const pg=await abre(b,arq,w,tq);const W=w+(tq?'dedo':'');
    for(const [n,id,f,so] of CASOS){if(so&&w<840)continue;await limpa(pg);await pg.waitForTimeout(450);
      const e=await roda(pg,f);await pg.waitForTimeout(900);if(!(await vis(pg,id)))nao.push(W+' '+n+(e?' ('+e+')':''));
      await pg.screenshot({path:path.join(dir,W+'_'+n+'.png')});}
    await pg.close();}
  await b.close();console.log('fotos em',dir,'| nao abriram:',nao.length?nao.join(' ; '):'nenhuma','| erros JS:',abre.erros);}
async function estrutura(arq){const b=await pw.chromium.launch();let falhas=0;const t=(n,ok,det)=>{if(!ok)falhas++;console.log(ok?'ok   ':'FALHA',n,det==null?'':det);};
  const pg=await abre(b,arq,867,1);
  const onde=id=>pg.evaluate(id=>{const o=document.getElementById(id);if(!o)return null;const r=o.getBoundingClientRect(),d=document.getElementById('vb-mesa-col').getBoundingClientRect();return {pai:o.parentElement.id||o.parentElement.tagName,pos:getComputedStyle(o).position,z:getComputedStyle(o).zIndex,igual:Math.abs(r.left-d.left)<=1&&Math.abs(r.top-d.top)<=1&&Math.abs(r.right-d.right)<=1&&Math.abs(r.bottom-d.bottom)<=1,imp:/!important/.test(o.getAttribute('style')||'')};},id);
  const noTopo=id=>pg.evaluate(id=>{const d=document.getElementById('vb-mesa-col').getBoundingClientRect();const e=document.elementFromPoint(d.left+d.width/2,d.top+60);return !!e&&document.getElementById(id).contains(e);},id);
  const colZ=()=>pg.evaluate(()=>getComputedStyle(document.getElementById('vb-mesa-col')).zIndex);
  for(const [n,id,f] of CASOS.filter(c=>c[1]!=='teste-folha')){await limpa(pg);await pg.waitForTimeout(450);await roda(pg,f);await pg.waitForTimeout(800);
    const o=await onde(id);t('aberta '+n+': mora na coluna, no retangulo inteiro dela, por cima do resumo',!!o&&o.pai==='vb-mesa-col'&&o.pos==='absolute'&&o.igual&&await noTopo(id),o&&JSON.stringify(o));}
  /* folha de baixo (DOCUMENTOS etc.) por cima da operacao: as duas na coluna, a folha por cima, a operacao a mostra em cima dela */
  await limpa(pg);await pg.waitForTimeout(450);await roda(pg,CASOS[3][2]);await pg.waitForTimeout(800);
  t('folha de baixo por cima da operacao: as duas na coluna',(await onde('teste-folha')).pai==='vb-mesa-col'&&(await onde('vbm-hist-op')).pai==='vb-mesa-col');
  t('folha de baixo fica por cima da operacao',await pg.evaluate(()=>{const s=document.getElementById('teste-folha'),r=s.firstElementChild.getBoundingClientRect();return s.contains(document.elementFromPoint(r.left+r.width/2,r.top+20));}));
  t('a operacao aparece atras do fundo escuro (o resumo nao cobre)',await pg.evaluate(()=>{const d=document.getElementById('vb-mesa-col').getBoundingClientRect();const s=document.getElementById('teste-folha');s.style.pointerEvents='none';s.firstElementChild.style.pointerEvents='none';const e=document.elementFromPoint(d.left+d.width/2,d.top+60);s.style.pointerEvents='';s.firstElementChild.style.pointerEvents='';return !!e&&document.getElementById('vbm-hist-op').contains(e);}));
  await pg.evaluate(()=>{document.getElementById('teste-folha').remove();document.getElementById('vbm-hist-op').style.display='none';});await pg.waitForTimeout(400);
  t('fechou tudo: resumo a mostra e coluna na camada 50',(await colZ())==='50'&&await pg.evaluate(()=>getComputedStyle(document.getElementById('vb-mesa-dir')).visibility)==='visible'&&await noTopo('vb-mesa-dir'));
  /* Fechamento: botao FECHAMENTO do Historico */
  await limpa(pg);await pg.waitForTimeout(450);await roda(pg,CASOS[2][2]);await pg.waitForTimeout(800);
  t('Fechamento aberto: coluna na camada dele (100004)',(await colZ())==='100004');
  /* abrir o Fechamento com a operacao aberta: a operacao sai (regra 1.357.4) */
  await limpa(pg);await pg.waitForTimeout(450);await roda(pg,CASOS[0][2]);await pg.waitForTimeout(700);await pg.evaluate(()=>FM_abrir());await pg.waitForTimeout(500);
  t('Fechamento aberto com a operacao na direita: a operacao sai, o Fechamento fica por cima',!(await vis(pg,'vbm-hist-op'))&&await noTopo('fm-overlay'));
  /* Duo fecha com o Fechamento aberto: volta para o corpo, no mesmo lugar, folha de baixo de tela cheia */
  await pg.setViewportSize({width:373,height:669});await pg.waitForTimeout(900);
  let o=await onde('fm-overlay');const lugar=await pg.evaluate(()=>{const m=document.getElementById('fm-overlay');return (m.previousElementSibling&&m.previousElementSibling.id)+'|'+(m.nextElementSibling&&m.nextElementSibling.id);});
  t('Duo fechado: Fechamento volta para o corpo no mesmo lugar, preso na tela, camada 100004, sem !important',!!o&&o.pai==='BODY'&&o.pos==='fixed'&&o.z==='100004'&&!o.imp&&await vis(pg,'fm-overlay')&&lugar==='vb-foto-overlay|mer-form-ov',JSON.stringify({o,lugar}));
  t('Duo fechado: Fechamento encostado no pe com fundo escuro',await pg.evaluate(()=>{const m=document.getElementById('fm-overlay'),c=m.firstElementChild.getBoundingClientRect();return Math.round(c.bottom)===innerHeight&&/rgba\(0, 0, 0, 0\.4/.test(getComputedStyle(m).backgroundColor)&&getComputedStyle(m.firstElementChild).borderTopLeftRadius==='18px';}));
  await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(900);
  o=await onde('fm-overlay');t('Duo aberto de novo: Fechamento volta para a coluna',!!o&&o.pai==='vb-mesa-col'&&o.igual);
  /* Duo fecha com a operacao aberta: ela some da direita e o card abre expandido na lista (regra 1.349.2) */
  await limpa(pg);await pg.waitForTimeout(450);await roda(pg,CASOS[0][2]);await pg.waitForTimeout(700);
  await pg.setViewportSize({width:373,height:669});await pg.waitForTimeout(1000);
  o=await onde('vbm-hist-op');t('Duo fechado com a operacao aberta: ela sai da coluna e some; o card abre na lista',!!o&&o.pai==='BODY'&&!(await vis(pg,'vbm-hist-op'))&&await pg.evaluate(()=>{const d=document.querySelector('[id^="hist-exp-"]');return !!d&&getComputedStyle(d).display!=='none';}),JSON.stringify(o));
  await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(900);
  await b.close();console.log(falhas||abre.erros?'FALHOU':'OK');process.exit(falhas||abre.erros?1:0);}
const A=process.argv.slice(2);
if(A[0]==='--estrutura') estrutura(path.resolve(A[1]||path.join(__dirname,'..','index.html')));
else fotos(A[0]||'/tmp/vb_hist',path.resolve(A[1]||path.join(__dirname,'..','index.html')));
