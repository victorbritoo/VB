/* VB 1.371.1 - tela descida: a cura age na hora em que o tamanho muda / o teclado some, e a MEDIDA conta quem disparou.
   Uso: node teste/tela_descida.js. O Chromium nao reproduz o defeito do iPhone (a area encolher sozinha): aqui a altura e
   encolhida de proposito (867x587) com o app fingindo ser o atalho (navigator.standalone). Confere: cura dispara sem esperar,
   nao dispara com campo em foco (conta em R), nao entra em rajada sem fim, guarda a rolagem das caixas, MEDIDA mostra ULT e R. */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
let falhas=0;const t=(n,ok,det)=>{if(!ok)falhas++;console.log(ok?'ok   ':'FALHA',n,det==null?'':det);};
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:867,height:669},hasTouch:true})).newPage();
pg.on('pageerror',e=>{falhas++;console.log('ERRO JS',String(e).slice(0,200));});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.addInitScript(()=>{Object.defineProperty(navigator,'standalone',{get:()=>true});});
await pg.goto('file://'+ARQ);await pg.waitForTimeout(2500);
await pg.evaluate(()=>showScreen('ren'));await pg.waitForTimeout(700);
await pg.evaluate(()=>{const hoje=REN_hojeISO();const itens=[],cp=[];for(let i=0;i<80;i++){itens.push({tab:'cr',opId:i,idx:0,cliente:'CLI '+i,venc:REN_isoMais(hoje,3+i*3),valor:1000+i});cp.push({id:i+1,venc:REN_isoMais(hoje,3+i*4),valor:500+i,descricao:'CONTA '+i,credor:'CRED '+i});}
  const map={};itens.forEach(x=>map[REN_key(x)]=x);Object.assign(REN_cache,{itens,map,bx:{},pags:{},opInfo:{},cp});REN_render();VB_rolaPara(400);document.getElementById('vb-mesa-dir').scrollTop=300;});
await pg.waitForTimeout(400);
const est=()=>pg.evaluate(()=>({c:VB_vpCuras,r:VB_vpRec,ult:VB_vpUlt,tent:VB_vpTent,esq:Math.round(VB_sy()),dir:Math.round(document.getElementById('vb-mesa-dir').scrollTop),med:(document.getElementById('vbm-medida')||{}).textContent||''}));
let a=await est();t('altura certa (669): nenhuma cura',a.c===0,JSON.stringify({c:a.c}));
await pg.setViewportSize({width:867,height:587});await pg.waitForTimeout(90);
let c=await est();t('altura caiu para 587: cura em menos de 0,1 s, pelo aviso de tamanho',c.c===1&&/^TAM 587>/.test(c.ult),JSON.stringify({c:c.c,ult:c.ult}));
t('a cura guarda a rolagem das duas caixas',c.esq===a.esq&&c.dir===a.dir,JSON.stringify({esq:[a.esq,c.esq],dir:[a.dir,c.dir]}));
/* rajada de avisos de tamanho com a altura ainda encolhida (abrir o Duo): nao pode curar a cada aviso */
for(let i=0;i<12;i++){await pg.evaluate(()=>window.dispatchEvent(new Event('resize')));await pg.waitForTimeout(100);}
let r=await est();t('12 avisos de tamanho seguidos: no maximo 2 curas na hora e 1 da reserva depois de 1 s (eram 13)',r.c<=3,JSON.stringify({c:r.c}));
await pg.waitForTimeout(22000);c=await est();
t('altura que nao volta: para depois de poucas tentativas (sem piscar para sempre)',c.c<=5&&c.tent>=6,JSON.stringify({c:c.c,tent:c.tent}));
t('MEDIDA mostra R e ULT',/ · R \d+ · ULT TAM/.test(c.med)||/ULT /.test(c.med),c.med.slice(-60));
/* 1.380.0: voltar para o app com a altura baixa -- a cura insiste nos primeiros 2,2 s em vez de esperar a ronda de 3 s */
const v0=await est();await pg.evaluate(()=>{window.__tr=[];const m=document.querySelector('meta[name=viewport]');new MutationObserver(()=>window.__tr.push(Date.now())).observe(m,{attributes:true});window.__t0=Date.now();document.dispatchEvent(new Event('visibilitychange'));});await pg.waitForTimeout(450);const vA=await pg.evaluate(()=>({n:window.__tr.length,ms:window.__tr[0]-window.__t0,ult:VB_vpUlt}));await pg.waitForTimeout(2200);const v1=await est();
/* 1.390.0: na volta a TROCA do viewport-fit vem primeiro (video de 21/11: so ela devolve a altura) e alterna com a cura */
t('volta ao app com a tela baixa: troca do viewport-fit antes de 0,45 s',vA.n>=1&&vA.ms<450&&/VOLTA-T/.test(vA.ult),JSON.stringify(vA));
t('volta ao app com a tela baixa: 2 a 4 curas em 2,6 s',v1.c-v0.c>=2&&v1.c-v0.c<=4,JSON.stringify({curas:v1.c-v0.c,ult:v1.ult}));
await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(300);const v2=await est();await pg.evaluate(()=>document.dispatchEvent(new Event('visibilitychange')));await pg.waitForTimeout(2600);const v3=await est();
t('volta ao app com a altura certa: nenhuma cura',v3.c===v2.c,JSON.stringify({c:[v2.c,v3.c]}));
/* com campo em foco a cura nao age e conta em R */
await pg.setViewportSize({width:867,height:669});await pg.waitForTimeout(500);
await pg.evaluate(()=>{REN_crSheet();});await pg.waitForTimeout(600);
await pg.evaluate(()=>{const i=document.querySelector('#ren-cr-ov input');i.focus();});
const c0=await est();await pg.setViewportSize({width:867,height:587});await pg.waitForTimeout(600);const c1=await est();
t('campo em foco: nao cura, conta em R',c1.c===c0.c&&c1.r>c0.r,JSON.stringify({c:[c0.c,c1.c],r:[c0.r,c1.r]}));
await b.close();console.log(falhas?'FALHOU':'OK');process.exit(falhas?1:0);})();
