/* VB 1.369.0 - MOLDURA da tela aberta: a pagina nao rola; esquerda e direita rolam cada uma na sua caixa.
   Uso: node teste/moldura.js [outra.html para comparar a tela fechada pixel a pixel]
   Confere: pagina sem rolagem em todas as telas; roda do mouse em um lado nao mexe no outro; travas de mes
   na mesma altura; folha que cobre a esquerda para so a caixa (corpo nunca fica fixo); abrir/fechar o Duo
   leva a posicao; tela fechada (373 e 469) identica a versao de comparacao. */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=process.env.VB_ARQ||path.join(__dirname,'..','index.html'), OUTRA=process.argv[2];
const TELAS=['fin','ant','pag','ven','ren','mer','hist','ges','home'];
let falhas=0; const t=(n,ok,det)=>{if(!ok)falhas++;console.log(ok?'ok   ':'FALHA',n,det==null?'':det);};
async function abre(b,arq,w){const pg=await(await b.newContext({viewport:{width:w,height:669}})).newPage();
  pg.on('pageerror',e=>{falhas++;console.log('ERRO JS',w,String(e).slice(0,160));});
  await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
  await pg.addInitScript(()=>{const D=Date,T0=new D(2026,10,20,12,0,0).getTime(),R0=D.now();function F(...a){return a.length?new D(...a):new D(T0+(D.now()-R0));}F.prototype=D.prototype;F.now=()=>T0+(D.now()-R0);F.parse=D.parse;F.UTC=D.UTC;window.Date=F;});
  await pg.goto('file://'+arq);await pg.waitForTimeout(2500);return pg;}
const enche=pg=>pg.evaluate(()=>{const hoje=REN_hojeISO();const itens=[],cp=[];for(let i=0;i<120;i++){itens.push({tab:'cr',opId:i,idx:0,cliente:'CLI '+i,venc:REN_isoMais(hoje,3+i*3),valor:1000+i});cp.push({id:i+1,venc:REN_isoMais(hoje,3+i*4),valor:500+i,descricao:'CONTA '+i,credor:'CRED '+i});}
  Object.assign(REN_cache,{itens,bx:{},pags:{},opInfo:{},cp});REN_render();});
(async()=>{const b=await pw.chromium.launch();
  if(!process.env.VB_SO_FECHADA){
  const pg=await abre(b,ARQ,867);
  for(const s of TELAS){await pg.evaluate(s=>showScreen(s),s);await pg.waitForTimeout(450);
    const r=await pg.evaluate(()=>{const e=document.getElementById('screen-'+VB_telaAtual),cs=getComputedStyle(e),se=document.scrollingElement,fy=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--fy'))||0;
      return {pos:cs.position,top:Math.round(e.getBoundingClientRect().top),fy,pag:se.scrollHeight-innerHeight,w:Math.round(e.getBoundingClientRect().width),dirL:Math.round(document.getElementById('vb-mesa-dir').getBoundingClientRect().left)};});
    t('tela '+s+': caixa presa, pagina sem rolagem',r.pos==='fixed'&&r.top===r.fy&&r.pag<=1&&Math.abs(r.w-r.dirL)<=1,JSON.stringify(r));}
  await pg.evaluate(()=>showScreen('ren'));await pg.waitForTimeout(700);await enche(pg);await pg.waitForTimeout(500);
  const est=()=>pg.evaluate(()=>{const d=document.getElementById('vb-mesa-dir'),fy=document.getElementById('vb-mesa-rail').getBoundingClientRect().bottom;
    const tr=(root,pre)=>{let v=null;[...root.querySelectorAll('[id^="'+pre+'"]')].forEach(h=>{const r=h.getBoundingClientRect();if(r.top<fy+40&&r.top>=fy-2)v=Math.round(r.top-fy);});return v;};
    return {esq:Math.round(VB_sy()),dir:Math.round(d.scrollTop),pag:Math.round(scrollY),tE:tr(document.getElementById('ren-body'),'renmes-'),tD:tr(d,'cpmes-'),corpo:document.body.style.position||'',ov:document.getElementById('screen-ren').style.overflowY||''};});
  let a=await est(); await pg.mouse.move(200,400); for(let i=0;i<5;i++){await pg.mouse.wheel(0,300);await pg.waitForTimeout(60);} await pg.waitForTimeout(300); let c=await est();
  t('roda na esquerda: so a esquerda anda',c.esq>a.esq+500&&c.dir===a.dir&&c.pag===0,JSON.stringify(c));
  a=c; await pg.mouse.move(650,400); for(let i=0;i<5;i++){await pg.mouse.wheel(0,300);await pg.waitForTimeout(60);} await pg.waitForTimeout(300); c=await est();
  t('roda na direita: so a direita anda',c.dir>a.dir+500&&c.esq===a.esq&&c.pag===0,JSON.stringify(c));
  t('travas de mes na mesma altura',c.tE===0&&c.tD===0,'esq '+c.tE+' dir '+c.tD);
  await pg.evaluate(()=>{const d=document.getElementById('vb-mesa-dir');d.scrollTop=d.scrollHeight;});a=await est();for(let i=0;i<5;i++){await pg.mouse.wheel(0,400);await pg.waitForTimeout(60);}await pg.waitForTimeout(300);c=await est();
  t('direita no fim nao puxa a esquerda',c.esq===a.esq&&c.pag===0);
  await pg.evaluate(()=>{VB_travaFundo(true);});c=await est();
  t('folha na esquerda: para a caixa, corpo nao fica fixo',c.ov==='hidden'&&c.corpo!=='fixed',JSON.stringify({ov:c.ov,corpo:c.corpo}));
  await pg.evaluate(()=>{VB_travaFundo(false);});c=await est();t('folha fechada: caixa solta, posicao mantida',c.ov===''&&c.esq===a.esq);
  const ym=await pg.evaluate(()=>{const hs=[...document.querySelectorAll('[id^="renmes-"]')];return hs[Math.min(8,hs.length-1)].id.slice(7);});
  await pg.evaluate(ym=>{VB_rolaPara(0);REN_irMes(ym);},ym);await pg.waitForTimeout(1200);
  const im=await pg.evaluate(ym=>{const h=document.getElementById('renmes-'+ym),fy=document.getElementById('vb-mesa-rail').getBoundingClientRect().bottom;return Math.round(h.getBoundingClientRect().top-fy);},ym);
  t('ir ate o mes leva a esquerda',im>=0&&im<=12,'mes a '+im+' pt do topo');
  const yA=(await est()).esq; await pg.setViewportSize({width:469,height:669});await pg.waitForTimeout(900);
  const f=await pg.evaluate(()=>({rol2:document.documentElement.classList.contains('vb-rol2'),pos:getComputedStyle(document.getElementById('screen-ren')).position,y:Math.round(scrollY),ov:document.getElementById('screen-ren').style.overflowY||''}));
  t('fechou o Duo: volta a rolar a pagina, na mesma posicao',!f.rol2&&f.pos!=='fixed'&&Math.abs(f.y-yA)<160&&f.ov==='',JSON.stringify(f)+' antes '+yA);
  await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(900);c=await est();
  t('abriu de novo: caixa na mesma posicao',c.pag===0&&Math.abs(c.esq-f.y)<160,JSON.stringify(c));
  await pg.close();
  }
  if(OUTRA){ for(const w of [373,469]){ const p1=await abre(b,ARQ,w), p2=await abre(b,path.resolve(OUTRA),w); let dif=[]; for(const p of [p1,p2]) await p.addStyleTag({content:'#vbm-medida,#vb-versao-badge{visibility:hidden!important}'});
      for(const s of TELAS){ for(const p of [p1,p2]){await p.evaluate(s=>showScreen(s),s);} await p1.waitForTimeout(700);
        const [x,y]=await Promise.all([p1,p2].map(p=>p.evaluate(()=>{['vb-versao-badge','vbm-medida'].forEach(i=>{const v=document.getElementById(i);if(v)v.style.visibility='hidden';});}).then(()=>p.screenshot({fullPage:true}))));
        if(!x.equals(y)) dif.push(s); }
      t('tela fechada '+w+' identica a versao de comparacao',dif.length===0,dif.join(' ')); await p1.close(); await p2.close(); } }
  await b.close();console.log(falhas?'FALHOU':'OK');process.exit(falhas?1:0);})();
