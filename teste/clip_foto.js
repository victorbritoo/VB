/* VB 1.403.0 - etapa 2, ultima familia: panorama do cliente (clip-overlay) e foto (vb-foto-overlay) dentro da coluna da direita.
   Copia do hist_fecha.js com os casos trocados.
   Uso: node teste/clip_foto.js PASTA [arquivo.html]   -> fotos em 373, 469, 867 (computador e dedo) e 1280
        node teste/clip_foto.js --estrutura [arquivo.html]
        comparar pastas: node teste/fichas_ren.js --compara A B */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const SINT=()=>{const ov=document.createElement('div');ov.id='teste-folha';ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.35);z-index:10060;display:flex;align-items:flex-end;justify-content:center;';ov.innerHTML='<div style="width:100%;max-width:460px;background:var(--sf);border-radius:18px 18px 0 0;padding:16px;font-family:-apple-system,sans-serif;"><div style="text-align:center;font-size:11px;letter-spacing:2px;margin-bottom:10px;">FOLHA DE TESTE</div><button onclick="document.getElementById(\'teste-folha\').remove()" style="width:100%;padding:9px;margin-top:8px;border:0.5px solid var(--ln3);border-radius:14px;background:var(--sf2);">FECHAR</button></div>';document.body.appendChild(ov);};
const DB=()=>{window.__DB={
  antecipacoes:[{id:1,cliente:'JOAO TESTE',valor_bruto:50000,valor_liquido:46000,valor_face:50000,taxa:3,data_operacao:'2026-11-10',created_at:'2026-11-10T12:00:00Z',titulos:[{valor:25000,vencimento:'10/12/2026'},{valor:25000,vencimento:'10/01/2027'}]}],
  vendas:[{id:1,cliente:'MARIA TESTE',descricao:'ROLEX DAYTONA 2020',valor_total:150000,custo:120000,data_venda:'2026-11-05',created_at:'2026-11-05T12:00:00Z',parcelas:[{valor:75000,vencimento:'05/12/2026'},{valor:75000,vencimento:'05/01/2027'}]}]};};
const REN='async()=>{if(VB_telaAtual!=="ren"){showScreen("ren");await new Promise(r=>setTimeout(r,700));}const hoje=REN_hojeISO();const itens=[];for(let i=0;i<6;i++){itens.push({tab:"cr",opId:i,idx:0,cliente:"CLI "+i,venc:REN_isoMais(hoje,i*3-3),valor:1000+i});}const map={};itens.forEach(x=>{map[REN_key(x)]=x;});Object.assign(REN_cache,{itens,map,bx:{},pags:{},opInfo:{},cp:[]});REN_render();await new Promise(r=>setTimeout(r,400));}';
const CLIP='async()=>{await ('+REN+')();CLIP_abrir("CLI 1");}';
const FOTO='async()=>{const c=document.createElement("canvas");c.width=390;c.height=300;const x=c.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,390,300);x.fillStyle="#111";x.font="20px sans-serif";x.fillText("FOTO DE TESTE",100,150);VB_fotoPreview(c,"teste.jpg",true);}';
const CASOS=[   /* nome, folha, abre, so tela aberta */
 ['panorama','clip-overlay',CLIP,0],
 ['foto','vb-foto-overlay',FOTO,0],
 ['panorama+folha','teste-folha','async()=>{await ('+CLIP+')();await new Promise(r=>setTimeout(r,400));window.__SINT();}',1],
 ['foto+aviso','vb-foto-overlay','async()=>{await ('+FOTO+')();VB_toast("Frase copiada \u2014 \u00e9 s\u00f3 colar.");}',0],
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
const limpa=pg=>pg.evaluate(async()=>{const t=document.getElementById('teste-folha');if(t)t.remove();['clip-overlay','vb-foto-overlay'].forEach(i=>{const o=document.getElementById(i);if(o)o.style.display='none';});try{MESA_sel=null;MESA_marca();}catch(e){}
  window.__dt=(window.__dt||0)+1000;   /* a guarda de toque duplo da troca de tela */
  if(VB_telaAtual!=='ren'){showScreen('ren');await new Promise(r=>setTimeout(r,700));}window.__dt+=1000;});
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
  for(const [n,id,f] of CASOS.slice(0,2)){await limpa(pg);await pg.waitForTimeout(450);await roda(pg,f);await pg.waitForTimeout(900);
    const o=await onde(id);t('aberta '+n+': mora na coluna, no retangulo inteiro dela, por cima do resumo',!!o&&o.pai==='vb-mesa-col'&&o.pos==='absolute'&&o.igual&&!o.imp&&await noTopo(id),o&&JSON.stringify(o));}
  t('foto: rola sozinha, fundo e folga da tela cheia',await pg.evaluate(()=>{const f=document.getElementById('vb-foto-overlay'),c=getComputedStyle(f);return c.overflowY==='auto'&&c.paddingTop==='32px'&&c.backgroundColor!=='rgba(0, 0, 0, 0)';}));
  t('foto: camada 100050 na coluna',(await colZ())==='100050');
  await limpa(pg);await pg.waitForTimeout(450);await roda(pg,CASOS[2][2]);await pg.waitForTimeout(800);
  t('folha de baixo com o panorama aberto: as duas na coluna, o panorama por cima (100035 > 100016, como antes)',(await onde('teste-folha')).pai==='vb-mesa-col'&&(await onde('clip-overlay')).pai==='vb-mesa-col'&&await noTopo('clip-overlay'));
  t('a camada da coluna segue a mais alta (panorama 100035)',(await colZ())==='100035');
  await pg.evaluate(()=>{document.getElementById('teste-folha').remove();document.getElementById('clip-overlay').style.display='none';});await pg.waitForTimeout(400);
  t('fechou tudo: resumo a mostra e coluna na camada 50',(await colZ())==='50'&&await pg.evaluate(()=>getComputedStyle(document.getElementById('vb-mesa-dir')).visibility)==='visible');
  /* Duo fecha com a foto aberta: volta para o corpo no mesmo lugar, tela cheia */
  await limpa(pg);await pg.waitForTimeout(450);await roda(pg,CASOS[1][2]);await pg.waitForTimeout(600);
  await pg.setViewportSize({width:373,height:669});await pg.waitForTimeout(900);
  let o=await onde('vb-foto-overlay');const lugar=await pg.evaluate(()=>{const m=document.getElementById('vb-foto-overlay');return (m.nextElementSibling&&m.nextElementSibling.id);});
  t('Duo fechado: foto volta para o corpo no mesmo lugar, tela cheia, camada 100050',!!o&&o.pai==='BODY'&&o.pos==='fixed'&&o.z==='100050'&&await vis(pg,'vb-foto-overlay')&&lugar==='fm-overlay'&&await pg.evaluate(()=>{const r=document.getElementById('vb-foto-overlay').getBoundingClientRect();return r.left===0&&r.top===0&&r.width===innerWidth;}),JSON.stringify({o,lugar}));
  await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(900);
  o=await onde('vb-foto-overlay');t('Duo aberto de novo: foto volta para a coluna',!!o&&o.pai==='vb-mesa-col'&&o.igual);
  /* panorama aberto, Duo fecha: folha de baixo de tela cheia no corpo */
  await limpa(pg);await pg.waitForTimeout(450);await roda(pg,CASOS[0][2]);await pg.waitForTimeout(900);
  await pg.setViewportSize({width:373,height:669});await pg.waitForTimeout(900);
  o=await onde('clip-overlay');t('Duo fechado com o panorama: ele no corpo, preso na tela, 100035, encostado no pe',!!o&&o.pai==='BODY'&&o.pos==='fixed'&&o.z==='100035'&&await pg.evaluate(()=>Math.round(document.getElementById('clip-overlay').firstElementChild.getBoundingClientRect().bottom)===innerHeight),JSON.stringify(o));
  await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(900);
  await b.close();console.log(falhas||abre.erros?'FALHOU':'OK');process.exit(falhas||abre.erros?1:0);}
const A=process.argv.slice(2);
if(A[0]==='--estrutura') estrutura(path.resolve(A[1]||path.join(__dirname,'..','index.html')));
else fotos(A[0]||'/tmp/vb_hist',path.resolve(A[1]||path.join(__dirname,'..','index.html')));
