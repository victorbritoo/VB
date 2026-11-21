/* VB 1.374.0 - etapa 2, 2a familia: ficha do relogio (mer-view-overlay) e folhas de baixo criadas na hora (.vbm-dirsheet)
   dentro da coluna da direita, como folha de baixo (fundo escuro, encostada no pe), iguais a antes.
   Uso: node teste/folhas_baixo.js PASTA [arquivo.html]  -> fotos em 373, 867 (computador e dedo) e 1280
        node teste/folhas_baixo.js --estrutura [arquivo.html]
        comparar pastas: node teste/fichas_ren.js --compara A B */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const SINT=()=>{const ov=document.createElement('div');ov.id='teste-folha';ov.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.35);z-index:10060;display:flex;align-items:flex-end;justify-content:center;';ov.innerHTML='<div style="width:100%;max-width:460px;background:var(--sf);border-radius:18px 18px 0 0;padding:16px;font-family:-apple-system,sans-serif;"><div style="text-align:center;font-size:11px;letter-spacing:2px;margin-bottom:10px;">FOLHA DE TESTE</div><input id="teste-campo" style="width:100%;box-sizing:border-box;padding:9px;border:0.5px solid var(--ln3);border-radius:12px;"><button onclick="document.getElementById(\'teste-folha\').remove()" style="width:100%;padding:9px;margin-top:8px;border:0.5px solid var(--ln3);border-radius:14px;background:var(--sf2);">FECHAR</button></div>';document.body.appendChild(ov);};
const CASOS=[
 ['relogio','mer-view-overlay',()=>{MER_abrir(1);}],
 ['relogio-vendido','mer-view-overlay',()=>{MER_abrir(2);}],
 ['clientes-ordem','vb-cliord',()=>{showScreen('cli');CLI_ordAbrir();}],
 ['gasto','mer-gasto-ov',()=>{MER_abrir(1);MER_gastoSheet(1);}],
 ['sintetica','teste-folha',()=>{window.__SINT();}],
 ['relogio+sintetica','teste-folha',()=>{MER_abrir(1);window.__SINT();}],
];
async function abre(b,arq,w,toque){const pg=await(await b.newContext({viewport:{width:w,height:669},deviceScaleFactor:1,hasTouch:!!toque})).newPage();
  pg.on('pageerror',e=>{abre.erros++;console.log('ERRO JS',w,String(e).slice(0,200));});
  await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
  await pg.addInitScript(()=>{const D=Date,T0=new D(2026,10,20,12,0,0).getTime();function F(...a){return a.length?new D(...a):new D(T0);}F.prototype=D.prototype;F.now=()=>T0;F.parse=D.parse;F.UTC=D.UTC;window.Date=F;});
  await pg.addInitScript('window.__SINT='+SINT.toString());
  await pg.goto('file://'+arq);await pg.waitForTimeout(2500);
  await pg.addStyleTag({content:'#vbm-medida{display:none!important} *{animation:none!important;transition:none!important;caret-color:transparent!important}'});
  await prep(pg);return pg;}
abre.erros=0;
const prep=pg=>pg.evaluate(async()=>{showScreen('mer');await new Promise(r=>setTimeout(r,600));
  MER_rows=[{id:1,marca:'ROLEX',modelo:'DAYTONA MISTO',descricao:'ROLEX DAYTONA MISTO 2006',ano:'2006',referencia:'116523',serial:'Z123',status:'estoque',custo:100000,valor_compra:100000,preco:130000,data_compra:'2026-10-01',created_at:'2026-10-01T12:00:00Z',acompanha:'CAIXA E DOC'},
            {id:2,marca:'AP',modelo:'ROYAL OAK OFFSHORE NAVY',descricao:'AP ROYAL OAK OFFSHORE NAVY 2016',ano:'2016',status:'vendida',custo:90000,valor_compra:90000,valor_venda:120000,data_venda:'2026-11-10',data_compra:'2026-09-01',created_at:'2026-09-01T12:00:00Z'}];
  try{MER_render();}catch(e){}});
const limpa0=pg=>pg.evaluate(async()=>{const t=document.getElementById('teste-folha');if(t)t.remove();['vb-cliord','mer-gasto-ov'].forEach(i=>{const o=document.getElementById(i);if(o){if(i==='vb-cliord')o.remove();else o.style.display='none';}});const m=document.getElementById('mer-view-overlay');if(m)m.style.display='none';try{MER_viewEdit=false;}catch(e){}try{VB_travaFundo(false);}catch(e){}if(VB_telaAtual!=='mer'){showScreen('mer');await new Promise(r=>setTimeout(r,500));}});
const limpa=async pg=>{await limpa0(pg);await prep(pg);};
const vis=(pg,id)=>pg.evaluate(id=>{const o=document.getElementById(id);return !!(o&&o.style.display&&o.style.display!=='none');},id);
async function fotos(dir,arq){fs.mkdirSync(dir,{recursive:true});const b=await pw.chromium.launch();const nao=[];
  for(const [w,tq] of [[373,0],[867,0],[867,1],[1280,0]]){const pg=await abre(b,arq,w,tq);const W=w+(tq?'dedo':'');
    for(const [n,id,f] of CASOS){await limpa(pg);await pg.waitForTimeout(450);
      const e=await pg.evaluate(f=>{try{(0,eval)('('+f+')')();return null;}catch(x){return String(x).slice(0,140);}},f.toString());
      await pg.waitForTimeout(800);if(!(await vis(pg,id)))nao.push(W+' '+n+(e?' ('+e+')':''));
      await pg.screenshot({path:path.join(dir,W+'_'+n+'.png')});}
    await pg.close();}
  await b.close();console.log('fotos em',dir,'| nao abriram:',nao.length?nao.join(' ; '):'nenhuma','| erros JS:',abre.erros);}
const A=process.argv.slice(2);
if(A[0]!=='--estrutura') fotos(A[0]||'/tmp/vb_folhas',path.resolve(A[1]||path.join(__dirname,'..','index.html')));
module.exports={abre,limpa,vis,CASOS,SINT,pw};
async function estrutura(arq){const b=await pw.chromium.launch();let falhas=0;const t=(n,ok,det)=>{if(!ok)falhas++;console.log(ok?'ok   ':'FALHA',n,det==null?'':det);};
  const pg=await abre(b,arq,867,1);
  const onde=id=>pg.evaluate(id=>{const o=document.getElementById(id);if(!o)return null;const r=o.getBoundingClientRect(),d=document.getElementById('vb-mesa-col').getBoundingClientRect(),c=o.firstElementChild.getBoundingClientRect();return {pai:o.parentElement.id||o.parentElement.tagName,pos:getComputedStyle(o).position,z:o.style.zIndex,igual:Math.abs(r.left-d.left)<=1&&Math.abs(r.top-d.top)<=1&&Math.abs(r.right-d.right)<=1&&Math.abs(r.bottom-d.bottom)<=1,pe:Math.round(c.bottom)===Math.round(d.bottom),topo:Math.round(c.top)===Math.round(d.top),fundo:getComputedStyle(o).backgroundColor,sty:o.getAttribute('style')};},id);
  for(const [n,id,f] of CASOS){await limpa(pg);await pg.waitForTimeout(450);await pg.evaluate(f=>{try{(0,eval)('('+f+')')();}catch(x){}},f.toString());await pg.waitForTimeout(600);
    const o=await onde(id);const painel=(id==='mer-view-overlay');   /* 1.377.0: a ficha do relogio ocupa o painel inteiro, sem fundo escuro */
    t('aberta '+n+(painel?': painel inteiro da coluna, sem fundo escuro':': dentro da coluna, no retangulo dela, encostada no pe, fundo escuro'),!!o&&o.pai==='vb-mesa-col'&&o.pos==='absolute'&&o.igual&&o.pe&&(painel?(o.topo&&/rgba\(0, 0, 0, 0\)/.test(o.fundo)):/rgba\(0, 0, 0, 0\.[34]/.test(o.fundo)),o&&JSON.stringify({pai:o.pai,pos:o.pos,z:o.z,igual:o.igual,pe:o.pe,fundo:o.fundo}));}
  /* ordem: sintetica (100016) por cima do relogio (100015) */
  t('folha criada na hora fica por cima da ficha do relogio',await pg.evaluate(()=>{const s=document.getElementById('teste-folha'),r=s.firstElementChild.getBoundingClientRect();return s.contains(document.elementFromPoint(r.left+r.width/2,r.top+20));}));
  /* 1.376.0: visualizador de tela cheia do contrato abre por cima da folha da coluna (camada lida do proprio app) */
  t('visualizador do contrato fica por cima da folha de baixo',await pg.evaluate(()=>{const z=(CTR_viewerPDF.toString().match(/z-index:(\d+)/)||[])[1];const v=document.createElement('div');v.id='teste-visor';v.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);z-index:'+z+';display:flex;flex-direction:column;';document.body.appendChild(v);const d=document.getElementById('vb-mesa-col').getBoundingClientRect();const e=document.elementFromPoint(d.left+d.width/2,d.bottom-40);const ok=(e===v)&&v.parentElement===document.body;v.remove();return ok;}));
  /* fechar a folha criada na hora: sai da coluna, a esquerda destrava */
  const trava=()=>pg.evaluate(()=>document.getElementById('screen-'+VB_telaAtual).style.overflowY||'');
  await pg.evaluate(()=>{document.getElementById('teste-folha').remove();document.getElementById('mer-view-overlay').style.display='none';});await pg.waitForTimeout(300);
  t('fechou tudo: a esquerda solta e a coluna volta para a camada 50',(await trava())===''&&await pg.evaluate(()=>getComputedStyle(document.getElementById('vb-mesa-col')).zIndex)==='50');
  /* folha da lista de folhas (ORDENAR dos clientes): prende a esquerda enquanto aberta e solta ao sair da coluna, como antes */
  await pg.evaluate(()=>{showScreen('cli');});await pg.waitForTimeout(600);await pg.evaluate(()=>{CLI_ordAbrir();});await pg.waitForTimeout(400);
  t('ORDENAR aberta: a esquerda fica presa',(await trava())==='hidden');
  await pg.evaluate(()=>{document.getElementById('vb-cliord').remove();});await pg.waitForTimeout(300);
  t('ORDENAR fechada (saiu da coluna): a esquerda solta',(await trava())==='');
  await limpa(pg);await pg.waitForTimeout(400);
  /* Duo fecha com a ficha do relogio e uma folha criada na hora abertas */
  const viz=await pg.evaluate(()=>{const m=document.getElementById('mer-view-overlay');return m.parentElement.id;});
  await pg.evaluate(()=>{MER_abrir(1);window.__SINT();});await pg.waitForTimeout(500);
  await pg.setViewportSize({width:373,height:669});await pg.waitForTimeout(900);
  let o=await onde('teste-folha');t('Duo fechado: folha criada na hora volta para o corpo, presa na tela, camada de antes (10060)',!!o&&o.pai==='BODY'&&o.pos==='fixed'&&o.z==='10060',o&&JSON.stringify({pai:o.pai,pos:o.pos,z:o.z}));
  o=await onde('mer-view-overlay');const lugar=await pg.evaluate(()=>{const m=document.getElementById('mer-view-overlay');return {antes:m.previousElementSibling&&m.previousElementSibling.id,depois:m.nextElementSibling&&m.nextElementSibling.id};});
  t('Duo fechado: ficha do relogio volta para o MESMO lugar do corpo, camada 100005',!!o&&o.pai==='BODY'&&o.pos==='fixed'&&o.z==='100005'&&await vis(pg,'mer-view-overlay'),JSON.stringify({pai:o&&o.pai,z:o&&o.z,lugar}));
  const orig=await pg.evaluate(()=>{const h=document.documentElement.innerHTML;return /id="mer-ord-overlay"[\s\S]{0,6000}id="mer-view-overlay"/.test(h)||/id="mer-view-overlay"/.test(h);});t('ficha do relogio continua no documento',orig);
  await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(900);
  o=await onde('teste-folha');t('Duo aberto de novo: as duas voltam para a coluna',!!o&&o.pai==='vb-mesa-col'&&o.igual&&(await onde('mer-view-overlay')).pai==='vb-mesa-col');
  /* quem criou a folha poe ela de novo no corpo: volta para a coluna */
  await pg.evaluate(()=>{const s=document.getElementById('teste-folha');document.body.appendChild(s);});await pg.waitForTimeout(200);
  o=await onde('teste-folha');t('folha recolocada no corpo com o Duo aberto volta para a coluna',!!o&&o.pai==='vb-mesa-col'&&o.igual);
  /* folha tirada com o Duo aberto e recolocada com ele fechado: recupera a tela cheia */
  await pg.evaluate(()=>{window.__g=document.getElementById('teste-folha');window.__g.remove();document.getElementById('mer-view-overlay').style.display='none';});
  await pg.setViewportSize({width:373,height:669});await pg.waitForTimeout(800);await pg.evaluate(()=>{document.body.appendChild(window.__g);});await pg.waitForTimeout(200);
  o=await onde('teste-folha');t('folha guardada e recolocada com o Duo fechado: presa na tela de novo',!!o&&o.pai==='BODY'&&o.pos==='fixed'&&o.z==='10060',o&&JSON.stringify({pai:o.pai,pos:o.pos,z:o.z}));
  await pg.evaluate(()=>window.__g.remove());
  /* folha criada com o Duo FECHADO e Duo aberto depois */
  await pg.evaluate(()=>{window.__SINT();});await pg.waitForTimeout(200);await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(900);
  o=await onde('teste-folha');t('folha criada com o Duo fechado entra na coluna quando ele abre',!!o&&o.pai==='vb-mesa-col'&&o.igual&&o.pe);
  /* folhas fixas do HTML que tambem sao folha de baixo */
  const fix=await pg.evaluate(()=>[...document.querySelectorAll('.vbm-dirsheet')].map(e=>e.id+':'+(e.parentElement.id||e.parentElement.tagName)));
  t('toda folha de baixo marcada mora na coluna com o Duo aberto',fix.length>0&&fix.every(x=>/:vb-mesa-col$/.test(x)),fix.length+' folhas'+(fix.filter(x=>!/:vb-mesa-col$/.test(x)).length?' FORA: '+fix.filter(x=>!/:vb-mesa-col$/.test(x)).join(','):''));
  await b.close();console.log(falhas||abre.erros?'FALHOU':'OK');process.exit(falhas||abre.erros?1:0);}
if(A[0]==='--estrutura') estrutura(path.resolve(A[1]||path.join(__dirname,'..','index.html')));
