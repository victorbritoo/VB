/* VB 1.365.0 - tela aberta: SAIDAS (direita) alinhadas com as ENTRADAS (esquerda) em qualquer estado.
   Uso: node teste/alinha_saidas.js. Casos: entrar, busca, PAGAS -> SAIDAS com a esquerda descida,
   primeira medida com a esquerda descida, e com folha aberta (body fixo). Diferenca aceita: 1 px. */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
(async()=>{const b=await pw.chromium.launch();const pg=await(await b.newContext({viewport:{width:867,height:669}})).newPage();let falhas=0;
pg.on('pageerror',e=>{falhas++;console.log('ERRO JS',String(e).slice(0,150));});
await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
await pg.goto('file://'+ARQ);await pg.waitForTimeout(2500);
await pg.evaluate(()=>{document.body.style.minHeight='3000px';document.querySelector('#screen-ren>.card').style.minHeight='3000px';});
const med=()=>pg.evaluate(()=>{const el=document.getElementById('vb-mesa-dir'),body=document.getElementById('ren-body');
 const off=VB_sy();const t=e=>e?e.getBoundingClientRect().top+off:null;const r=e=>e?e.getBoundingClientRect().top+el.scrollTop:null;
 const pre=root=>[...root.querySelectorAll('div')].find(d=>/var\(--acc\)/.test(d.getAttribute('style')||'')&&d.offsetHeight>40);
 const d=(a,b)=>(a==null||b==null)?0:Math.round(a-b);
 return {tit:d(t(document.querySelector('#screen-ren .simulacao-label')),r(el.querySelector('.vbm-rtit'))),card:d(t(pre(body)),r(pre(el)))};});
const rolou=async(n)=>{const y=await pg.evaluate(()=>VB_sy());if(y<250){falhas++;console.log('FALHA a esquerda nao rolou em',n,y);}};
const caso=async(n,f)=>{await pg.evaluate(f);await pg.waitForTimeout(600);const m=await med();const ok=Math.abs(m.tit)<=1&&Math.abs(m.card)<=1;if(!ok)falhas++;console.log(ok?'ok   ':'FALHA',n,JSON.stringify(m));};
await caso('1a medida com a esquerda descida',()=>{showScreen('ren');});
await caso('sem medida guardada, esquerda descida (print 20/11 17:16)',()=>{MESA_alinhaCache={};VB_rolaPara(300);MESA_renSaidas(document.getElementById('vb-mesa-dir'));});await rolou('descida');
await caso('topo',()=>{VB_rolaPara(0);MESA_renSaidas(document.getElementById('vb-mesa-dir'));});
await caso('busca ligada',()=>REN_toggleBusca());
await caso('busca desligada descida',()=>{VB_rolaPara(300);REN_toggleBusca();});
await caso('PAGAS no topo',()=>{VB_rolaPara(0);MESA_renDirIr('cpp');});
await caso('volta SAIDAS descida',()=>{VB_rolaPara(300);MESA_renDirIr('cp');});
await caso('folha aberta (body fixo)',()=>{VB_travaFundo(true);MESA_renSaidas(document.getElementById('vb-mesa-dir'));});
await pg.evaluate(()=>VB_travaFundo(false));
await b.close();console.log(falhas?'FALHOU':'OK');process.exit(falhas?1:0);})();
