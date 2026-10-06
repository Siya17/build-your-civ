import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../public/realtime.js',import.meta.url),'utf8').replace('export class','class')+'\nglobalThis.Stream=ClassroomStream;';
const settle=async()=>{for(let index=0;index<8;index++)await Promise.resolve();};
function harness(fetcher) {
  const timers=new Map(),sources=[];let next=0;
  class EventSource {
    constructor(url){this.url=url;this.listeners=new Map();sources.push(this);}
    addEventListener(name,listener){this.listeners.set(name,listener);}
    close(){this.closed=true;}
  }
  const ctx=vm.createContext({fetch:fetcher,EventSource,setTimeout:callback=>{timers.set(++next,callback);return next;},clearTimeout:id=>timers.delete(id)});
  vm.runInContext(source,ctx);return {stream:new ctx.Stream(),sources,timers};
}
test('local live updates forward events and close their SSE connection',async()=>{
  const h=harness(async()=>({ok:true,status:200,json:async()=>({mode:'sse'})}));
  const seen=[];h.stream.addEventListener('team',event=>seen.push(event.data));await settle();
  assert.equal(h.sources[0].url,'/api/events');h.sources[0].listeners.get('team')({data:'{"version":2}'});
  assert.deepEqual(seen,['{"version":2}']);h.stream.close();assert.equal(h.sources[0].closed,true);
  h.sources[0].listeners.get('team')({data:'late'});assert.equal(seen.length,1);
});
test('a failed initial connection retries until the server becomes available',async()=>{
  let attempts=0;const h=harness(async()=>{if(++attempts<3)throw new Error('offline');return {ok:true,status:200,json:async()=>({mode:'sse'})};});
  let errors=0;h.stream.onerror=()=>errors++;await settle();
  for(let attempt=0;attempt<2;attempt++) {const [id,retry]=h.timers.entries().next().value;h.timers.delete(id);retry();await settle();}
  assert.equal(attempts,3);assert.equal(errors,2);assert.equal(h.sources.length,1);h.stream.close();
});
test('closing during setup prevents an old connection from reopening',async()=>{
  let resolve;const h=harness(()=>new Promise(done=>resolve=done));h.stream.close();
  resolve({ok:true,status:200,json:async()=>({mode:'sse'})});await settle();assert.equal(h.sources.length,0);assert.equal(h.timers.size,0);
});
test('an expired API session sends the UI a revocation instead of retrying',async()=>{
  const h=harness(async()=>({ok:false,status:401}));let revoked=false;
  h.stream.addEventListener('revoked',()=>revoked=true);await settle();assert.equal(revoked,true);assert.equal(h.timers.size,0);h.stream.close();
});
