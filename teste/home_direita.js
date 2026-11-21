/* VB 1.366.0 - Home na tela aberta: metade direita (NOVEMBRO, DIAS/SEMANAS, CARTEIRA, 5 MAIORES).
   Uso: node teste/home_direita.js [foto.png]. Dado falso injetado no REN_cache: confere desenho
   (cabe em 669 sem rolar, HOJE na altura do VB, nada vaza para o lado) e a regra das barras
   (vencido nao entra; sabado e domingo entram na segunda; mesma conta em DIAS e SEMANAS). */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.join(__dirname,'..','index.html'), FOTO=process.argv[2];
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:867,height:669},deviceScaleFactor:2})).newPage();let falhas=0;
pg.on('pageerror',e=>{falhas++;console.log('ERRO JS',String(e).slice(0,160));});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
/* 1.381.0: relogio fixo numa sexta (20/11/2026 12h): as contas de DIAS mudam no fim de semana e o teste falhava no sabado */
try{ await pg.clock.setFixedTime(new Date('2026-11-20T15:00:00Z')); }catch(e){}
await pg.goto('file://'+ARQ);await pg.waitForTimeout(2500);
await pg.evaluate(()=>showScreen('home'));await pg.waitForTimeout(900);
const r=await pg.evaluate(()=>{
  const hoje=REN_hojeISO(), mais=n=>REN_isoMais(hoje,n), ym=hoje.slice(0,7);
  const util=REN_diaUtil(hoje);                       /* 1a coluna */
  let sab=hoje; while(new Date(sab+'T12:00:00Z').getUTCDay()!==6) sab=REN_isoMais(sab,1);   /* proximo sabado */
  const seg=REN_isoMais(sab,2);
  const it=(i,tab,cli,venc,valor)=>({tab,opId:i,idx:0,cliente:cli,venc,valor});
  const itens=[it(1,'fin','ALFA TESTE',util,110300),it(2,'ven','BETA TESTE',sab,40000),it(3,'ant','GAMA TESTE',seg,24800),
    it(4,'fin','ALFA TESTE',mais(-9),5100),it(5,'cr','DELTA TESTE',mais(40),300000),it(6,'fin','EPSILON TESTE',mais(70),2000000),it(7,'ven','ZETA TESTE',mais(75),900000)];
  REN_cache={itens,bx:{},pags:{},opInfo:{},cp:[{id:1,venc:seg,valor:25000},{id:2,venc:mais(-20),valor:28000}]};
  MESA_ver=true; MESA_homeG='d'; MESA_resumo();
  const d=document.getElementById('vb-mesa-dir'); const txt=()=>d.innerText.replace(/\s+/g,' ');
  const dias=txt(); MESA_homeGset('s'); const sem=txt(); MESA_homeGset('d');
  const cartEl=[...d.querySelectorAll('span')].find(e=>e.textContent==='CARTEIRA').parentElement.parentElement, maiEl=[...d.querySelectorAll('span')].find(e=>e.textContent==='5 MAIORES').parentElement.parentElement;
  const cart=!cartEl.getAttribute('onclick')&&!/›/.test(cartEl.firstElementChild.textContent)&&/MESA_homeVai\('cli'\)/.test(maiEl.getAttribute('onclick')||'');
  const cabeMes=[...d.querySelectorAll('span')].filter(e=>/^RECEBIDO /.test(e.textContent)).every(e=>e.parentElement.scrollWidth<=e.parentElement.clientWidth+1);
  MESA_homeTopo();
  const cab=document.getElementById('vbm-hoje-cab'), lg=[...document.querySelectorAll('#screen-home>.card>div')].filter(e=>e.offsetParent&&!e.children.length&&e.textContent==='VB')[0];
  const rg=document.createRange(); rg.selectNodeContents(lg);
  const ult=d.lastElementChild.getBoundingClientRect();
  const dCab=Math.round(cab.getBoundingClientRect().top-rg.getBoundingClientRect().top);
  MESA_ver=false; MESA_resumo(); const oculto=txt(); MESA_ver=true; MESA_resumo(); MESA_homeTopo();
  return {cart,cabeMes,dias,sem,oculto,segEhOutraSemana:REN_segunda(seg)!==REN_segunda(hoje),dCab,fundo:Math.round(ult.bottom),rola:d.scrollHeight>d.clientHeight+1,lado:d.scrollWidth>d.clientWidth+1};
});
const t=(n,ok,det)=>{if(!ok)falhas++;console.log(ok?'ok   ':'FALHA',n,det||'');};
t('segunda soma sabado (40K+24,8K=64,8K)',/64,8K/.test(r.dias));
/* 1.375.0: a 1a coluna soma o que ja venceu dos dois lados (antes ficava so nos quadros) */
t('a pagar da segunda 25K; a pagar vencido 28K sai na 1a coluna',/25K/.test(r.dias)&&/\b28K\b/.test(r.dias.split('CARTEIRA')[0].split('DIAS SEMANAS')[1]||''));
t('1a coluna entra 115K (110,3K de hoje + 5,1K atrasado); total 180K entra e 53K sai',/\b115K\b/.test((r.dias.split('DIAS SEMANAS')[1]||'').split('CARTEIRA')[0])&&/↑ 180K · ↓ 53K/.test(r.dias));
t('MES: so RECEBIDO, MES e FALTA (sem VENCIDO, sem VENCEU ATE ONTEM, sem traco)',!/VENCEU|VENCIDO/.test(r.dias)&&/RECEBIDO [\d,.KM]+ MÊS/.test(r.dias)&&/FALTA/.test(r.dias),'');
t('CARTEIRA sem seta e sem toque; 5 MAIORES leva a CLIENTES',r.cart===true,'');
t('semanas: total que entra igual ao dos dias',(r.dias.match(/↑ ([\d,.KM]+)/)||[])[1]===(r.sem.match(/↑ ([\d,.KM]+)/)||[])[1]||r.segEhOutraSemana===false, (r.dias.match(/↑ [^›]+/)||[''])[0]+' | '+(r.sem.match(/↑ [^›]+/)||[''])[0]);
t('carteira e 5 maiores',/CARTEIRA 3,38M/.test(r.dias)&&/5 MAIORES/.test(r.dias)&&/EPSILON/.test(r.dias), '');
t('olhinho esconde valores e nomes',!/EPSILON|ALFA|3,38M|64,8K/.test(r.oculto)&&/CLIENTE 1/.test(r.oculto));
t('HOJE na altura do VB',Math.abs(r.dCab-6)<=1,'dif '+r.dCab);
t('cabe em 669 sem rolar',r.fundo<=669&&!r.rola,'fundo '+r.fundo);
t('sem rolagem lateral',!r.lado);
t('linha do MES cabe sem estourar',r.cabeMes===true);
/* 1.381.0: parte do VB entre parenteses no RECEBIDO e no MES (parcela menos o repasse devido) */
const vbm=await pg.evaluate(()=>{const hoje=REN_hojeISO(),ym=hoje.slice(0,7);const it=(i,venc,valor)=>({tab:'ven',opId:i,idx:0,cliente:'C'+i,venc,valor});
  const itens=[it(1,ym+'-05',715000),it(2,ym+'-27',317000)];const bx={},prev={};bx[REN_key(itens[0])]=1;prev[REN_key(itens[0])]=243000;prev[REN_key(itens[1])]=108000;
  REN_cache={itens,bx,pags:{},opInfo:{},cp:[],prev};MESA_resumo();
  const d=document.getElementById('vb-mesa-dir');const sp=[...d.querySelectorAll('span')].find(e=>/^RECEBIDO /.test(e.textContent)&&e.parentElement.children.length===2);
  const t1=d.innerText.replace(/\s+/g,' ');REN_cache.prev={};MESA_resumo();const t2=d.innerText.replace(/\s+/g,' ');
  return {com:sp.parentElement.innerText.replace(/\s+/g,' '),cabe:sp.parentElement.scrollWidth<=sp.parentElement.clientWidth+1,sem:/\(VB /.test(t2)};});
t('MES com socio: RECEBIDO 715K (VB 472K) e MES 1,03M (VB 681K); sem socio, sem parenteses',/RECEBIDO 715K \(VB 472K\)/.test(vbm.com)&&/MÊS 1,03M \(VB 681K\)/.test(vbm.com)&&vbm.cabe&&!vbm.sem,JSON.stringify(vbm));
if(FOTO) await pg.screenshot({path:FOTO});
await b.close();console.log(falhas?'FALHOU':'OK');process.exit(falhas?1:0);})();
