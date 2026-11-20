const pw=require(require('child_process').execSync('npm root -g').toString().trim()+'/playwright');
(async()=>{const b=await pw.chromium.launch();const errs=[];
for(const w of [373,867]){const p=await b.newPage({viewport:{width:w,height:669},hasTouch:true});
p.on('pageerror',e=>errs.push(w+': '+e.message));
await p.route(/^https?:/,r=>r.abort());
await p.addInitScript(()=>{const q=()=>{const o={};const f=()=>o;['select','eq','in','or','order','limit','range','is','gte','lte','neq','ilike','not','match','single','maybeSingle','insert','update','delete','upsert'].forEach(k=>o[k]=f);o.then=(res)=>Promise.resolve({data:[],error:null}).then(res);return o;};
window.supabase={createClient:()=>({from:q,rpc:q,auth:{getSession:()=>Promise.resolve({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{unsubscribe(){}}}}),getUser:()=>Promise.resolve({data:{user:null}})},storage:{from:()=>({upload:q,download:q,remove:q})}})};});
await p.goto('file://'+require("path").join(__dirname,"..","index.html"));await p.waitForTimeout(1500);
const r=await p.evaluate(()=>{try{
 REN_cache=REN_cache||{}; 
 const ov=document.createElement('div');ov.id='ren-ficha-ov';ov.style.cssText='display:flex;position:fixed;inset:0;z-index:100010';
 ov.innerHTML='<div><div>REPASSE</div><div style="display:grid;grid-template-columns:1fr 1fr"><button>EXCLUIR</button><button onclick="window.__f=1">FECHAR</button></div></div>';
 if(!document.getElementById('ren-ficha-ov')) document.body.appendChild(ov); else return 'existe';
 document.documentElement.classList.contains('vb-mesa') && MESA_xFechar();
 const fb=[...ov.querySelectorAll('button')].find(b=>b.textContent==='FECHAR');
 const x=ov.querySelector('.vbm-fx button');
 const vis=fb.offsetParent!==null; if(x) x.click();
 return {mesa:document.documentElement.classList.contains('vb-mesa'),x:!!x,xvis:x?getComputedStyle(x.parentElement).display:null,fecharVisivel:vis,clicou:window.__f||0,cols:getComputedStyle(fb.parentElement).gridTemplateColumns};
}catch(e){return 'ERR '+e.message}});
console.log(w,JSON.stringify(r));await p.close();}
console.log(errs.slice(0,5));await b.close();})();
