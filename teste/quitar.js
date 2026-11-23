/* VB 1.410.0 - QUITAR com parcela vencida e nas entradas manuais que sao financiamento.
   Uso: node teste/quitar.js [arquivo.html] [PASTA]  -> confere as contas; com PASTA fotografa a tela e a foto.
   Dado falso (fake.js), relogio parado em 20/11/2026 12:00. Lote falso entra em REN_CR_FIN so no teste. */
const path=require('path'),fs=require('fs');let pw;try{pw=require('playwright-core')}catch(e){pw=require('/opt/node-tools/node_modules/playwright-core')}
const FAKE=fs.readFileSync(path.join(__dirname,'fake.js'),'utf8');
const ARQ=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html')), PASTA=process.argv[3]||null;
(async()=>{const b=await pw.chromium.launch();let erros=0,falhas=0;
 const ok=(c,m)=>{if(!c){falhas++;console.log('FALHA',m);}else console.log('ok',m);};
 for(const w of [373,1280]){
  const pg=await(await b.newContext({viewport:{width:w,height:800},deviceScaleFactor:1})).newPage();
  pg.on('pageerror',e=>{erros++;console.log('ERRO JS',w,String(e).slice(0,200));});
  await pg.route('**/*',r=>{const u=r.request().url();if(u.includes('supabase-js'))return r.fulfill({body:FAKE,contentType:'text/javascript'});if(u.startsWith('file:'))return r.continue();return r.abort();});
  await pg.addInitScript(()=>{const D=Date,T0=new D(2026,10,20,12,0,0).getTime();function F(...a){return a.length?new D(...a):new D(T0);}F.prototype=D.prototype;F.now=()=>T0;F.parse=D.parse;F.UTC=D.UTC;window.Date=F;});
  await pg.goto('file://'+ARQ);await pg.waitForTimeout(2500);
  await pg.addStyleTag({content:'#vbm-medida{display:none!important} *{animation:none!important;transition:none!important}'});
  await pg.evaluate(()=>showScreen('ren'));await pg.waitForTimeout(500);
  /* lote LT: 10 parcelas de 1000, vencimentos 10/09 a 10/06/27; 10/09 paga; 10/10 e 10/11 vencidas; 7 a vencer a partir de 10/12 */
  const res=await pg.evaluate(()=>{
    REN_CR_FIN.push('LT');
    const itens=[];for(let i=0;i<10;i++){const d=new Date(2026,8+i,10);itens.push({tab:'cr',opId:'LT',idx:i,cliente:'CLIENTE TESTE',rot:'ENTRADA MANUAL',venc:d.getFullYear()+'-'+('0'+(d.getMonth()+1)).slice(-2)+'-10',valor:1000,tot:10,dnum:i+1});}
    itens.push({tab:'cr',opId:'OUTRO',idx:0,cliente:'OUTRO',rot:'ENTRADA MANUAL',venc:'2026-12-01',valor:500});
    const map={};itens.forEach(x=>{map[REN_key(x)]=x;});const bx={};bx[REN_key(itens[0])]={valor_recebido:1000,recebido_em:'2026-09-10'};
    REN_cache={itens:itens,bx:bx,map:map,semTabela:false,opInfo:{},prev:{},pags:{},notas:{},cp:[],cpPag:{},pro:{},cr:[],exVenda:{},exNomes:{},adi:{}};
    const out={};
    REN_ficha(REN_key(itens[5]));
    out.botaoLT=[...document.querySelectorAll('#ren-ficha-ov button')].some(x=>x.textContent.trim()==='QUITAR');
    REN_ficha(REN_key(itens[10]));
    out.botaoOutro=[...document.querySelectorAll('#ren-ficha-ov button')].some(x=>x.textContent.trim()==='QUITAR');
    REN_quitar('LT',REN_key(itens[5]));
    const g=id=>document.getElementById(id);
    out.tela=VB_telaAtual; out.prox=g('quit-dataProx').value; out.qtd=g('quit-qtd').value; out.pmt=g('quit-parcela').value; out.taxa=g('quit-taxa').value;
    const r=QUIT_calcAt(); out.r=r&&{quit:r.quit,atraso:r.atraso,n:r.atrasoN,pagar:r.pagar};
    /* vencidas: 10/10 = 41 dias (8,2%), 10/11 = 10 dias (2%) */
    out.atrEsperado=1000*(1+0.002*41)+1000*(1+0.002*10);
    out.linha=g('quit-atraso-row').style.display; out.msg=g('quit-msgWpp').textContent;
    return out;});
  ok(res.botaoLT,w+' QUITAR na ficha da entrada manual financiamento');
  ok(!res.botaoOutro,w+' sem QUITAR na entrada manual comum');
  ok(res.tela==='fin'&&res.prox==='10/12/2026'&&res.qtd==='7'&&res.pmt==='1.000,00'&&res.taxa==='2,00',w+' preenche a vencer: '+[res.prox,res.qtd,res.pmt,res.taxa].join(' '));
  ok(res.r&&res.r.n===2&&Math.abs(res.r.atraso-res.atrEsperado)<0.01,w+' atrasado corrigido '+(res.r&&res.r.atraso)+' = '+res.atrEsperado);
  ok(res.r&&Math.abs(res.r.pagar-(res.r.quit+res.r.atraso))<0.001&&res.linha==='grid',w+' total = quitacao + atrasado, linha a vista');
  ok(res.msg.indexOf(QUIT_fmt(res.r.pagar))>=0,w+' mensagem com o total: '+res.msg);
  if(PASTA){fs.mkdirSync(PASTA,{recursive:true});await pg.waitForTimeout(400);await pg.screenshot({path:path.join(PASTA,'quitar_'+w+'.png'),fullPage:true});
    const src=await pg.evaluate(()=>{VB_silentGen=true;QUIT_compartilhar();VB_silentGen=false;return document.getElementById('quit-tabelaImagem').src;});
    fs.writeFileSync(path.join(PASTA,'quitar_foto_'+w+'.png'),Buffer.from(src.split(',')[1],'base64'));}
  /* so vencidas: qtd 0 */
  const r2=await pg.evaluate(()=>{const it=REN_cache.itens.filter(x=>x.opId==='LT');it.slice(3,10).forEach(x=>{REN_cache.bx[REN_key(x)]={valor_recebido:1000};});
    REN_quitar('LT',REN_key(it[1]));const r=QUIT_calcAt();return {qtd:document.getElementById('quit-qtd').value,r:r&&{quit:r.quit,pagar:r.pagar},vis:document.getElementById('quit-result').style.display};});
  ok(r2.qtd==='0'&&r2.r&&r2.r.quit===0&&r2.r.pagar>2000&&r2.vis==='block',w+' so vencidas: total '+(r2.r&&r2.r.pagar));
  const r3=await pg.evaluate(()=>{QUIT_limpar();return {at:QUIT_atraso,lin:document.getElementById('quit-atraso-row').style.display};});
  ok(r3.at===null,w+' LIMPAR zera o atrasado');
  await pg.context().close();
 }
 await b.close();console.log(erros?'ERROS JS: '+erros:'sem erro de JS',falhas?'FALHAS: '+falhas:'tudo ok');process.exit(erros||falhas?1:0);})();
function QUIT_fmt(n){return n.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});}
