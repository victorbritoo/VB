/* VB 1.371.0 - etapa 2 da tela aberta: as 9 folhas de ENTRADAS/SAIDAS dentro do painel da direita.
   Uso: node teste/fichas_ren.js PASTA [arquivo.html]   -> fotografa cada folha em 373, 469, 867 (computador e dedo) e 1280 na PASTA
        node teste/fichas_ren.js --compara PASTA_A PASTA_B -> diz quais fotos mudaram (pixel a pixel; ate 8 em 255 na cor conta como serrilhado, nao como mudanca)
        node teste/fichas_ren.js --estrutura [arquivo.html] -> confere onde cada folha mora (painel na aberta, corpo na fechada),
        ida e volta do Duo com folha aberta e troca de tela pela barra.
   Dado falso (fake.js), relogio parado em 20/11/2026 12:00. */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const IDS=['ren-ficha-ov','ren-baixa-ov','ren-prev-ov','ren-nota-ov','ren-pro-ov','ren-cp-ov','ren-cpb-ov','ren-cr-ov','ren-pan-ov'];
/* cada caso abre uma folha a partir da lista limpa; k = chave da 1a entrada, c = id da 1a conta */
const CASOS=[
 ['ficha',      'ren-ficha-ov', (k,c)=>REN_ficha(k)],
 ['baixa',      'ren-baixa-ov', (k,c)=>REN_editBaixa(k)],
 ['recebida',   'ren-baixa-ov', (k,c,ks,kb)=>REN_editRec(kb)],
 ['ficha-recebida','ren-ficha-ov', (k,c,ks,kb)=>REN_ficha(kb)],
 ['ficha-socio','ren-ficha-ov', (k,c,ks,kb)=>REN_ficha(ks)],
 ['previa',     'ren-prev-ov',  (k,c,ks,kb)=>REN_prevSheet(ks)],
 ['nota',       'ren-nota-ov',  (k,c)=>REN_notaSheet(k)],
 ['prorrogar',  'ren-pro-ov',   (k,c)=>REN_proSheet(k)],
 ['adiantar',   'ren-baixa-ov', (k,c,ks,kb)=>REN_adiSheet(ks)],
 ['repassar',   'ren-baixa-ov', (k,c,ks,kb)=>REN_repassar(kb)],
 ['conta',      'ren-cp-ov',    (k,c)=>REN_cpFicha(c)],
 ['conta-form', 'ren-cp-ov',    (k,c)=>REN_cpSheet(c)],
 ['conta-nova', 'ren-cp-ov',    (k,c)=>REN_cpSheet()],
 ['conta-baixa','ren-cpb-ov',   (k,c)=>REN_cpBaixaSheet(c)],
 ['manual-nova','ren-cr-ov',    (k,c)=>REN_crSheet()],
 ['panorama',   'ren-pan-ov',   (k,c)=>REN_painel()],
 ['panorama-cp','ren-pan-ov',   (k,c)=>REN_painel('cp')],
 ['ficha+baixa','ren-baixa-ov', (k,c)=>{REN_ficha(k);REN_editBaixa(k);}],
];
async function abre(b,arq,w,toque){const pg=await(await b.newContext({viewport:{width:w,height:669},deviceScaleFactor:1,hasTouch:!!toque})).newPage();
  pg.on('pageerror',e=>{abre.erros++;console.log('ERRO JS',w,String(e).slice(0,200));});
  await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
  await pg.addInitScript(()=>{const D=Date,T0=new D(2026,10,20,12,0,0).getTime();function F(...a){return a.length?new D(...a):new D(T0);}F.prototype=D.prototype;F.now=()=>T0;F.parse=D.parse;F.UTC=D.UTC;window.Date=F;});
  await pg.goto('file://'+arq);await pg.waitForTimeout(2500);
  await pg.addStyleTag({content:'#vbm-medida{display:none!important} *{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  await pg.evaluate(()=>showScreen('ren'));await pg.waitForTimeout(700);
  await pg.evaluate(()=>{const hoje=REN_hojeISO();const itens=[],cp=[];for(let i=0;i<14;i++){itens.push({tab:'cr',opId:i,idx:0,cliente:'CLI '+i,venc:REN_isoMais(hoje,i*3-3),valor:1000+i});cp.push({id:i+1,venc:REN_isoMais(hoje,i*4-4),valor:500+i,descricao:'CONTA '+i,credor:'CRED '+i});}
    const map={};itens.forEach(x=>{map[REN_key(x)]=x;});const k3=REN_key(itens[3]);const bx={};bx[k3]={id:9001,op_tab:'cr',op_id:3,parcela_idx:0,valor_recebido:1003,recebido_em:hoje,nota:'ITAU PJ',repassado_em:null,repasse_nota:null};
    const opInfo={'cr|2':{socio:'SR',fixo:300,lbl:'S\u00d3CIO'},'cr|3':{socio:'SR',fixo:300,lbl:'S\u00d3CIO'}};
    Object.assign(REN_cache,{itens,map,bx,pags:{},opInfo,cp});REN_render();});
  await pg.waitForTimeout(500);return pg;}
abre.erros=0;
const fecha=pg=>pg.evaluate(ids=>{ids.forEach(id=>{const o=document.getElementById(id);if(o)o.style.display='none';});try{REN_cpForm=null;}catch(e){}try{VB_travaFundo(false);}catch(e){}try{if(document.activeElement&&document.activeElement.blur)document.activeElement.blur();}catch(e){}},IDS);
const chaves=pg=>pg.evaluate(()=>{const m=REN_cache.map||{};const k='cr|1|0';return {k,ks:'cr|2|0',kb:'cr|3|0',c:(REN_cache.cp&&REN_cache.cp[1]&&REN_cache.cp[1].id)||null,n:Object.keys(m).length};});
const vis=(pg,id)=>pg.evaluate(id=>{const o=document.getElementById(id);return !!(o&&o.style.display&&o.style.display!=='none');},id);
async function fotos(dir,arq){fs.mkdirSync(dir,{recursive:true});const b=await pw.chromium.launch();const nao=[];
  for(const [w,tq] of [[373,0],[469,0],[867,0],[867,1],[1280,0]]){const pg=await abre(b,arq,w,tq);const ch=await chaves(pg);const W=w+(tq?'dedo':'');
    if(w===867)console.log(W,'modo computador:',await pg.evaluate(()=>document.documentElement.classList.contains('vb-mesa-pc')));
    await pg.screenshot({path:path.join(dir,W+'_00-lista.png')});
    for(const [n,id,f] of CASOS){await fecha(pg);await pg.waitForTimeout(450);
      const e=await pg.evaluate(([f,k,c,ks,kb])=>{try{(0,eval)('('+f+')')(k,c,ks,kb);return null;}catch(x){return String(x).slice(0,120);}},[f.toString(),ch.k,ch.c,ch.ks,ch.kb]);
      await pg.waitForTimeout(700);const ok=await vis(pg,id);if(!ok)nao.push(W+' '+n+(e?' ('+e+')':''));
      await pg.screenshot({path:path.join(dir,W+'_'+n+'.png')});}
    await pg.close();}
  await b.close();console.log('fotos em',dir,'| nao abriram:',nao.length?nao.join(' ; '):'nenhuma','| erros JS:',abre.erros);}
async function compara(a,b){const br=await pw.chromium.launch();const pg=await br.newPage();let dif=0,n=0,lev=0,levMax=0;
  for(const f of fs.readdirSync(a).filter(x=>x.endsWith('.png')).sort()){n++;if(!fs.existsSync(path.join(b,f))){dif++;console.log('FALTA',f);continue;}
    const r=await pg.evaluate(async([x,y])=>{const ld=s=>new Promise(ok=>{const i=new Image();i.onload=()=>ok(i);i.src='data:image/png;base64,'+s;});const A=await ld(x),B=await ld(y);if(A.width!==B.width||A.height!==B.height)return {tam:[A.width,A.height,B.width,B.height]};
      const px=i=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);return g.getImageData(0,0,i.width,i.height).data;};const p=px(A),q=px(B);let d=0,x0=1e9,y0=1e9,x1=-1,y1=-1;
      let leve=0;for(let i=0;i<p.length;i+=4){const m=Math.max(Math.abs(p[i]-q[i]),Math.abs(p[i+1]-q[i+1]),Math.abs(p[i+2]-q[i+2]));if(m>0&&m<=8){leve++;continue;}if(m>8){d++;const X=(i/4)%A.width,Y=Math.floor(i/4/A.width);if(X<x0)x0=X;if(X>x1)x1=X;if(Y<y0)y0=Y;if(Y>y1)y1=Y;}}return {d,leve,caixa:d?[x0,y0,x1,y1]:null};},
      [fs.readFileSync(path.join(a,f)).toString('base64'),fs.readFileSync(path.join(b,f)).toString('base64')]);
    if(r.tam||r.d){dif++;console.log('MUDOU',f,JSON.stringify(r));}else if(r.leve){lev++;levMax=Math.max(levMax,r.leve);}}
  await br.close();console.log(n,'fotos,',dif,'diferentes;',lev,'com diferenca de ate 8 em 255 na cor em pontos soltos (serrilhado de canto), no maximo',levMax,'pontos');process.exit(dif?1:0);}
async function estrutura(arq){const b=await pw.chromium.launch();let falhas=0;const t=(n,ok,det)=>{if(!ok)falhas++;console.log(ok?'ok   ':'FALHA',n,det==null?'':det);};
  const pg=await abre(b,arq,867);const ch=await chaves(pg);
  const onde=id=>pg.evaluate(id=>{const o=document.getElementById(id);if(!o)return null;const r=o.getBoundingClientRect(),d=document.getElementById('vb-mesa-dir').getBoundingClientRect();return {pai:o.parentElement.id||o.parentElement.tagName,pos:getComputedStyle(o).position,igual:Math.abs(r.left-d.left)<=1&&Math.abs(r.top-d.top)<=1&&Math.abs(r.right-d.right)<=1&&Math.abs(r.bottom-d.bottom)<=1,imp:(o.getAttribute('style')||'')};},id);
  for(const [n,id,f] of CASOS){await fecha(pg);await pg.waitForTimeout(450);await pg.evaluate(([f,k,c,ks,kb])=>{try{(0,eval)('('+f+')')(k,c,ks,kb);}catch(x){}},[f.toString(),ch.k,ch.c,ch.ks,ch.kb]);await pg.waitForTimeout(500);
    const o=await onde(id);t('aberta '+n+': dentro do painel, no retangulo dele',!!o&&o.pai==='vb-mesa-col'&&o.pos==='absolute'&&o.igual,o&&JSON.stringify({pai:o.pai,pos:o.pos,igual:o.igual}));
    const topo=await pg.evaluate(id=>{const o=document.getElementById(id),r=o.getBoundingClientRect();const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return !!(e&&o.contains(e));},id);t('aberta '+n+': por cima do resumo',topo);}
  /* fecha o Duo com a ficha e a baixa abertas: voltam para o corpo como folha de baixo; abre de novo: voltam para o painel */
  await fecha(pg);await pg.waitForTimeout(450);await pg.evaluate(k=>{REN_ficha(k);},ch.k);await pg.waitForTimeout(500);await pg.evaluate(k=>{REN_editBaixa(k);},ch.k);await pg.waitForTimeout(500);
  await pg.setViewportSize({width:373,height:669});await pg.waitForTimeout(900);
  let o=await onde('ren-baixa-ov');t('Duo fechado com DAR BAIXA aberta: folha no corpo, presa na tela',!!o&&o.pai==='BODY'&&o.pos==='fixed'&&/align-items:\s*flex-end/.test(o.imp)&&await vis(pg,'ren-baixa-ov'),o&&JSON.stringify({pai:o.pai,pos:o.pos}));
  const cx=await pg.evaluate(()=>{const c=document.getElementById('ren-baixa-ov').firstElementChild,r=c.getBoundingClientRect();return {w:Math.round(r.width),b:Math.round(r.bottom),raio:getComputedStyle(c).borderTopLeftRadius};});t('Duo fechado: folha de baixo com 373 de largura, encostada no pe, canto 18',cx.w===373&&cx.b===669&&cx.raio==='18px',JSON.stringify(cx));
  await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(900);
  o=await onde('ren-baixa-ov');t('Duo aberto de novo: DAR BAIXA volta para o painel, aberta',!!o&&o.pai==='vb-mesa-col'&&o.igual&&await vis(pg,'ren-baixa-ov'),o&&JSON.stringify({pai:o.pai,igual:o.igual}));
  /* toque de verdade: card da esquerda abre a ficha na direita; DAR BAIXA troca; VOLTAR devolve a ficha; o x fecha e o resumo volta */
  await fecha(pg);await pg.waitForTimeout(450);
  await pg.evaluate(()=>{const c=[...document.querySelectorAll('#ren-body [onclick*="REN_ficha("]')][2];c.click();});await pg.waitForTimeout(600);
  t('toque no card abre a ficha na coluna',await vis(pg,'ren-ficha-ov')&&(await onde('ren-ficha-ov')).pai==='vb-mesa-col');
  await pg.evaluate(()=>{[...document.querySelectorAll('#ren-ficha-ov button')].find(b=>b.textContent.trim()==='DAR BAIXA').click();});await pg.waitForTimeout(600);
  t('DAR BAIXA abre por cima da ficha, na coluna',await vis(pg,'ren-baixa-ov')&&(await onde('ren-baixa-ov')).igual&&await pg.evaluate(()=>{const o=document.getElementById('ren-baixa-ov'),r=o.getBoundingClientRect();return o.contains(document.elementFromPoint(r.left+r.width/2,r.top+60));}));
  t('com DAR BAIXA aberta a esquerda fica coberta',await pg.evaluate(()=>getComputedStyle(document.getElementById('vb-mesa-escudo')).display==='block'));
  await pg.evaluate(()=>{[...document.querySelectorAll('#ren-baixa-ov button')].find(b=>b.textContent.trim()==='VOLTAR').click();});await pg.waitForTimeout(700);
  t('VOLTAR devolve a ficha',!(await vis(pg,'ren-baixa-ov'))&&await vis(pg,'ren-ficha-ov'));
  const temX=await pg.evaluate(()=>{const x=document.querySelector('#ren-ficha-ov .vbm-fx button');if(!x)return false;x.click();return true;});await pg.waitForTimeout(600);
  t('o x fecha a ficha e o resumo (SAIDAS) volta a receber o toque',temX&&!(await vis(pg,'ren-ficha-ov'))&&await pg.evaluate(()=>{const d=document.getElementById('vb-mesa-dir'),r=d.getBoundingClientRect();return d.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2));}));
  /* ordem com as folhas que ainda moram no corpo: panorama do cliente (100035) por cima da ficha; dialogo por cima de tudo; NOTA (100025) por cima da ficha do relogio (100015) */
  await pg.evaluate(k=>{REN_ficha(k);},ch.k);await pg.waitForTimeout(500);
  const cimaDe=(a)=>pg.evaluate(a=>{const o=document.getElementById(a),d=document.getElementById('vb-mesa-dir').getBoundingClientRect();const e=document.elementFromPoint(d.left+d.width/2,d.top+d.height/2);return !!(o&&e&&o.contains(e));},a);
  await pg.evaluate(()=>{let c=document.getElementById('clip-overlay');if(!c){c=document.createElement('div');c.id='clip-overlay';c.style.cssText='display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.35);z-index:100035;align-items:flex-end;justify-content:center;';c.innerHTML='<div style="background:var(--bg);width:100%">PANORAMA DO CLIENTE</div>';document.body.appendChild(c);}c.style.display='flex';});await pg.waitForTimeout(300);
  t('panorama do cliente (no corpo) fica por cima da ficha (na coluna)',await cimaDe('clip-overlay'));
  await pg.evaluate(()=>{document.getElementById('clip-overlay').style.display='none';});
  await pg.evaluate(k=>{const m=document.getElementById('mer-view-overlay');m.style.display='flex';REN_notaSheet(k);},ch.k);await pg.waitForTimeout(500);
  t('NOTA (na coluna) fica por cima da ficha do relogio (no corpo)',await cimaDe('ren-nota-ov'));
  await pg.evaluate(()=>{document.getElementById('ren-nota-ov').style.display='none';});await pg.waitForTimeout(200);
  t('fechada a NOTA, a ficha do relogio fica por cima da ficha da parcela',await cimaDe('mer-view-overlay'));
  await pg.evaluate(()=>{document.getElementById('mer-view-overlay').style.display='none';document.getElementById('vb-c2-overlay').style.display='flex';});await pg.waitForTimeout(300);
  t('dialogo fica por cima da ficha',await pg.evaluate(()=>{const o=document.getElementById('vb-c2-overlay'),d=document.getElementById('vb-mesa-dir').getBoundingClientRect();return o.contains(document.elementFromPoint(d.left+d.width/2,d.top+d.height/2));}));
  await pg.evaluate(()=>{document.getElementById('vb-c2-overlay').style.display='none';});
  /* folha criada com o Duo FECHADO entra na coluna quando ele abre */
  { const p2=await abre(b,arq,373);const c2=await chaves(p2);await p2.evaluate(k=>{REN_ficha(k);},c2.k);await p2.waitForTimeout(500);
    const f=await p2.evaluate(()=>{const o=document.getElementById('ren-ficha-ov');return {pai:o.parentElement.tagName,pos:getComputedStyle(o).position,dentro:o.classList.contains('vbm-dentro')};});
    t('Duo fechado: ficha nasce no corpo',f.pai==='BODY'&&f.pos==='fixed'&&!f.dentro,JSON.stringify(f));
    await p2.setViewportSize({width:867,height:669});await p2.waitForTimeout(900);
    const g=await p2.evaluate(()=>{const o=document.getElementById('ren-ficha-ov'),r=o.getBoundingClientRect(),d=document.getElementById('vb-mesa-dir').getBoundingClientRect();return {pai:o.parentElement.id,vis:o.style.display,igual:Math.abs(r.left-d.left)<=1&&Math.abs(r.top-d.top)<=1&&Math.abs(r.right-d.right)<=1&&Math.abs(r.bottom-d.bottom)<=1};});
    t('abriu o Duo: a mesma ficha passa para a coluna, aberta',g.pai==='vb-mesa-col'&&g.vis==='flex'&&g.igual,JSON.stringify(g));await p2.close(); }
  /* folha criada com o Duo fechado e aberta depois */
  await fecha(pg);await pg.waitForTimeout(450);await pg.evaluate(k=>{REN_ficha(k);},ch.k);await pg.waitForTimeout(500);
  await pg.evaluate(()=>MESA_ir('ven'));await pg.waitForTimeout(700);t('trocar de tela pela barra fecha a ficha',!(await vis(pg,'ren-ficha-ov')));
  const z=await pg.evaluate(()=>getComputedStyle(document.getElementById('vb-mesa-col')).zIndex);t('painel sem ficha volta para a camada de baixo',z==='50',z);
  await b.close();console.log(falhas||abre.erros?'FALHOU':'OK');process.exit(falhas||abre.erros?1:0);}
const A=process.argv.slice(2);
if(A[0]==='--compara') compara(A[1],A[2]); else if(A[0]==='--estrutura') estrutura(path.resolve(A[1]||path.join(__dirname,'..','index.html'))); else fotos(A[0]||'/tmp/vb_fichas',path.resolve(A[1]||path.join(__dirname,'..','index.html')));
