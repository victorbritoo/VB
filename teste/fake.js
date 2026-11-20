(function(){
  window.__DB = window.__DB || {};
  window.__W = [];
  function Q(t){ this.t=t; this.f=[]; this.op='select'; this.opts={}; }
  Q.prototype.select=function(c,o){ if(this.op==='select'){ this.opts=o||{}; } return this; };
  Q.prototype.eq=function(k,v){ this.f.push(function(r){ return String(r[k])===String(v); }); return this; };
  Q.prototype.lte=function(k,v){ this.f.push(function(r){ return r[k]<=v; }); return this; };
  Q.prototype.order=function(k,o){ this.ord=[k,o&&o.ascending===false]; return this; };
  Q.prototype.range=function(a,b){ this.rg=[a,b]; return this; };
  Q.prototype.limit=function(n){ this.lim=n; return this; };
  ['in','is','neq','gte','lt','gt','or','ilike','not','filter','match','contains'].forEach(function(m){ Q.prototype[m]=function(){ return this; }; });
  Q.prototype.maybeSingle=function(){ this._one=true; return this; };
  Q.prototype.single=function(){ this._one=true; return this; };
  Q.prototype.upsert=function(rows){ this.op='upsert'; this.rows=[].concat(rows); return this; };
  Q.prototype.insert=function(rows){ this.op='insert'; this.rows=[].concat(rows); return this; };
  Q.prototype.update=function(v){ this.op='update'; this.val=v; return this; };
  Q.prototype.delete=function(){ this.op='delete'; return this; };
  Q.prototype.then=function(ok,ko){
    var self=this, tb=(__DB[self.t]=__DB[self.t]||[]), res;
    if(self.op==='upsert'||self.op==='insert'){
      __W.push([self.op,self.t,self.rows.length]);
      self.rows.forEach(function(r){ var i=tb.findIndex(function(x){ return r.id!=null && x.id===r.id; }); if(i>=0) tb[i]=r; else tb.push(r); });
      res={data:self.rows,error:null};
    } else if(self.op==='update'||self.op==='delete'){ __W.push([self.op,self.t]); res={data:[],error:null}; }
    else {
      var d=tb.filter(function(r){ return self.f.every(function(fn){ return fn(r); }); });
      if(self.ord){ var k=self.ord[0], desc=self.ord[1]; d=d.slice().sort(function(a,b){ return (a[k]>b[k]?1:-1)*(desc?-1:1); }); }
      if(self.rg) d=d.slice(self.rg[0], self.rg[1]+1);
      if(self.opts.head) res={data:null,count:d.length,error:null};
      else if(self._one) res={data:d[0]||null,error:null};
      else res={data:d,error:null,count:d.length};
    }
    return Promise.resolve(res).then(ok,ko);
  };
  Q.prototype.catch=function(f){ return this.then(null,f); };
  var auth={ getSession:function(){ return Promise.resolve({data:{session:{user:{id:'u'}}}}); },
    onAuthStateChange:function(){ return {data:{subscription:{unsubscribe:function(){}}}}; },
    getUser:function(){ return Promise.resolve({data:{user:{id:'u'}}}); }, signOut:function(){ return Promise.resolve({}); } };
  var storage={ from:function(){ return { download:function(){ return Promise.resolve({data:null,error:null}); }, upload:function(){ return Promise.resolve({error:null}); }, remove:function(){ return Promise.resolve({}); } }; } };
  window.supabase={ createClient:function(){ return { from:function(t){ return new Q(t); }, auth:auth, storage:storage, rpc:function(){ return Promise.resolve({data:null}); }, channel:function(){ return {on:function(){return this;}, subscribe:function(){return this;}}; } }; } };
})();
