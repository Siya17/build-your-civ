// DATA_DIR must be set before server/store.js is imported anywhere, because the store opens
// its database at module load. These tests run under --test-isolation=none, so every test
// file shares one process: any file that imports the store earlier would write to the real
// data/ directory. Keep the dynamic imports below.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const dataDir=mkdtempSync(join(tmpdir(),'civ-test-'));
process.env.DATA_DIR=dataDir;
const {createAppServer,closeStreams}=await import('../server/http.js');
const {closeStore}=await import('../server/store.js');

const teacherPassword='test-teacher-password';
const server=createAppServer({teacherPassword});
await new Promise(ready=>server.listen(0,'127.0.0.1',ready));
const base=`http://127.0.0.1:${server.address().port}`;
// A second server on the shared store, standing in for the hosted setup behind a proxy.
const proxied=createAppServer({teacherPassword,trustProxy:true});
await new Promise(ready=>proxied.listen(0,'127.0.0.1',ready));
const proxiedBase=`http://127.0.0.1:${proxied.address().port}`;
const limit={timeout:25_000};

const request=async(path,body,cookie,options={})=>{
  const res=await fetch((options.base||base)+path,{
    method:options.method||(body===undefined?'GET':'POST'),
    headers:{...(body===undefined&&!options.method?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...(options.headers||{})},
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const data=res.headers.get('content-type')?.includes('json')?await res.json():await res.text();
  return {status:res.status,data,cookie:res.headers.get('set-cookie')?.split(';')[0],headers:res.headers};
};
const signInTeacher=async()=>(await request('/api/auth/teacher',{password:teacherPassword})).cookie;
const makeTeam=async(teacher,name)=>(await request('/api/teacher/teams',{name},teacher)).data.team;
const joinTeam=async(code,name)=>await request('/api/auth/team',{name,code});

// Event-stream reader. Frames arrive coalesced or split depending on timing, so they are
// parsed into a queue and matched by predicate rather than by position.
const streams=[];
async function openStream(cookie) {
  const controller=new AbortController();
  const res=await fetch(base+'/api/events',{headers:{Cookie:cookie},signal:controller.signal});
  assert.equal(res.status,200);
  const reader=res.body.getReader();
  const frames=[];
  const decoder=new TextDecoder();
  (async()=>{
    let buffer='';
    try {
      for(;;){
        const {value,done}=await reader.read();
        if(done)break;
        buffer+=decoder.decode(value,{stream:true});
        const parts=buffer.split('\n\n');
        buffer=parts.pop();
        for(const part of parts) if(part.trim()) frames.push(part.trim());
      }
    } catch {/* aborted */}
  })();
  const stream={
    controller,frames,
    async waitFor(predicate,label='a matching event'){
      for(let waited=0;waited<5000;waited+=25){
        const index=frames.findIndex(predicate);
        if(index>=0) return frames.splice(index,1)[0];
        await new Promise(done=>setTimeout(done,25));
      }
      throw new Error(`timed out waiting for ${label}; saw ${frames.length?frames.join(' || '):'nothing'}`);
    },
    async quiet(ms=250){ await new Promise(done=>setTimeout(done,ms)); }
  };
  streams.push(stream);
  return stream;
}
const dataOf=frame=>JSON.parse(frame.slice(frame.indexOf('data: ')+6));

after(async()=>{
  // End the streams from both sides: an open event stream would otherwise keep
  // server.close() waiting forever, which is exactly what this suite is exercising.
  closeStreams();
  for(const stream of streams){try{stream.controller.abort()}catch{}}
  for(const instance of [server,proxied]){instance.closeIdleConnections?.();instance.closeAllConnections?.()}
  await Promise.all([server,proxied].map(instance=>new Promise(done=>instance.close(done))));
  closeStore();
  const abs=resolve(dataDir),safe=resolve(tmpdir())+sep;
  if(abs.startsWith(safe)) rmSync(abs,{recursive:true,force:true});
});

test('30 students can join, share stages and answers, then submit once',limit,async()=>{
  const teacher=await signInTeacher();
  const made=await makeTeam(teacher,'River Makers');
  const second=await makeTeam(teacher,'Mountain Group');
  const students=await Promise.all(Array.from({length:30},(_,i)=>joinTeam(made.code,`Student ${i+1}`)));
  assert(students.every(x=>x.status===200));
  assert.equal(students[0].data.team.id,made.id);
  const a=students[0].cookie,b=students[1].cookie;
  const outsider=await joinTeam(second.code,'Other Student');
  assert.equal(outsider.status,200);
  assert.equal((await request(`/api/teacher/teams/${made.id}`,undefined,outsider.cookie)).status,401);

  const live=await Promise.all(students.map(student=>openStream(student.cookie)));
  assert.equal((await request('/api/team/action',{type:'map',point:'A'},a)).status,200);
  const frames=await Promise.all(live.map(stream=>stream.waitFor(frame=>frame.includes('"mapPoint":"A"'),'the shared map choice')));
  assert(frames.every(frame=>frame.startsWith('event: team')));
  assert(frames.every(frame=>dataOf(frame).by==='Student 1'),'the payload names who changed it');
  // The live roster counts open streams, so it is complete while all 30 are connected.
  assert.equal((await request('/api/me',undefined,b)).data.roster.length,30);

  for(const stream of live) stream.controller.abort();
  await new Promise(done=>setTimeout(done,250));
  // Once they disconnect the live roster empties, but attendance still shows all 30.
  assert.equal((await request('/api/me',undefined,b)).data.roster.length,1,'only the caller remains');
  assert.equal((await request(`/api/teacher/teams/${made.id}`,undefined,teacher)).data.joined.length,30,'attendance keeps everyone');

  await request('/api/team/action',{type:'field',key:'location',value:'River valley'},b);
  await request('/api/team/action',{type:'stage',stage:2},a);
  const seen=await request('/api/me',undefined,b);
  assert.equal(seen.data.team.state.mapPoint,'A');
  assert.equal(seen.data.team.state.location,'River valley');
  assert.equal(seen.data.team.state.stage,2);
  assert.equal((await request('/api/me',undefined,outsider.cookie)).data.team.state.mapPoint,'','the other team is untouched');

  const early=await request('/api/team/submit',{},b);
  assert.equal(early.status,400);
  assert(early.data.gaps.includes('tech'));
  for(const [key,value] of Object.entries({terrain:'Warm',resources:'Clay',govt:'Council',economy:'Trade',belief:'Shared rituals',geographyUse:'Use river',impact:'Boats connect people',connection:'Exchange pottery'})) {
    assert.equal((await request('/api/team/action',{type:'field',key,value},a)).status,200);
  }
  for(const [tree,id] of [['tech','pottery'],['civic','laws']]) assert.equal((await request('/api/team/action',{type:'pick',tree,id},a)).status,200);
  const submitted=await request('/api/team/submit',{},b);
  assert.equal(submitted.status,200);
  assert(submitted.data.team.submittedAt);
  assert.equal((await request('/api/team/action',{type:'field',key:'impact',value:'Changed'},a)).status,400);
  assert.equal((await request(`/api/teacher/teams/${made.id}`,undefined,teacher)).data.team.state.connection,'Exchange pottery');
  assert.equal((await request(`/api/teacher/teams/${made.id}/reopen`,{},teacher)).status,200);
  assert.equal((await request('/api/team/action',{type:'field',key:'impact',value:'Changed'},a)).status,200);
});

test('presence tells teammates which field someone is writing in',limit,async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Presence Team');
  const writer=await joinTeam(team.code,'Kenji');
  const watcher=await joinTeam(team.code,'Mei');
  const watching=await openStream(watcher.cookie);
  await openStream(writer.cookie);

  assert.equal((await request('/api/team/presence',{field:'terrain'},writer.cookie)).status,200);
  const frame=await watching.waitFor(f=>f.startsWith('event: presence')&&f.includes('"terrain"'),'a presence event for terrain');
  const payload=dataOf(frame);
  assert.deepEqual(payload.fields.terrain,['Kenji']);
  assert(payload.roster.includes('Mei')&&payload.roster.includes('Kenji'),'and carries the live roster');
  assert(!watching.frames.some(f=>f.startsWith('event: team')),'presence never re-sends team state');

  await request('/api/team/presence',{field:null},writer.cookie);
  const cleared=await watching.waitFor(f=>f.includes('"fields":{}'),'presence being cleared on blur');
  assert.deepEqual(dataOf(cleared).fields,{});
  assert.equal((await request('/api/team/presence',{field:'not-a-field'},writer.cookie)).status,400);
  assert.equal((await request('/api/team/presence',{field:'terrain'},teacher)).status,401,'teachers have no presence');
});

test('a disconnected stream does not stop delivery to the rest of the team',limit,async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Resilient Team');
  const one=await joinTeam(team.code,'One');
  const two=await joinTeam(team.code,'Two');
  const three=await joinTeam(team.code,'Three');
  const first=await openStream(one.cookie);
  const middle=await openStream(two.cookie);
  const last=await openStream(three.cookie);
  // Drop the middle stream abruptly, the way a closed laptop lid does.
  middle.controller.abort();
  await new Promise(done=>setTimeout(done,200));
  await request('/api/team/action',{type:'map',point:'C'},one.cookie);
  for(const stream of [first,last]) {
    const frame=await stream.waitFor(f=>f.includes('"mapPoint":"C"'),'delivery past the dead client');
    assert(frame.startsWith('event: team'));
  }
});

test('teacher can rename and delete a team, and students are signed out',limit,async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Typo Naem');
  const student=await joinTeam(team.code,'Aya');
  const stream=await openStream(student.cookie);

  const renamed=await request(`/api/teacher/teams/${team.id}`,{name:'Delta Builders'},teacher,{method:'PATCH'});
  assert.equal(renamed.status,200);
  assert.equal(renamed.data.team.name,'Delta Builders');
  assert.equal((await request(`/api/teacher/teams/${team.id}`,{name:'   '},teacher,{method:'PATCH'})).status,400,'a blank name is refused');
  assert.equal((await request(`/api/teacher/teams/${team.id}`,{name:'Nope'},student.cookie,{method:'PATCH'})).status,401,'students cannot rename');

  const removed=await request(`/api/teacher/teams/${team.id}`,{},teacher,{method:'DELETE'});
  assert.equal(removed.status,200);
  assert(!removed.data.teams.some(x=>x.id===team.id));
  await stream.waitFor(f=>f.startsWith('event: revoked'),'the student being told, not left erroring');
  // The session cascaded away with the team, so the cookie no longer authenticates.
  assert.equal((await request('/api/me',undefined,student.cookie)).data.authenticated,false);
  assert.equal((await request('/api/team/action',{type:'map',point:'A'},student.cookie)).status,401);
  assert.equal((await request(`/api/teacher/teams/${team.id}`,undefined,teacher)).status,404);
  assert.equal((await request(`/api/teacher/teams/${team.id}`,{},teacher,{method:'DELETE'})).status,404);
});

test('activity log reports what each student saved',limit,async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Busy Team');
  const busy=await joinTeam(team.code,'Hana');
  const quiet=await joinTeam(team.code,'Ren');
  for(const value of ['One','Two','Three']) await request('/api/team/action',{type:'field',key:'terrain',value},busy.cookie);
  await request('/api/team/action',{type:'field',key:'resources',value:'Clay'},quiet.cookie);

  const activity=await request(`/api/teacher/teams/${team.id}/activity`,undefined,teacher);
  assert.equal(activity.status,200);
  const counts=Object.fromEntries(activity.data.counts.map(row=>[row.actor,row.total]));
  assert.equal(counts.Hana,3);
  assert.equal(counts.Ren,1);
  assert.equal(activity.data.recent[0].actor,'Ren','most recent first');
  assert.equal(activity.data.recent[0].type,'field');
  assert.equal((await request(`/api/teacher/teams/${team.id}/activity`,undefined,busy.cookie)).status,401);
});

test('join codes survive being read aloud, and a wrong shape says so',limit,async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Spaced Out');
  const spaced=`${team.code.slice(0,3)} ${team.code.slice(3,6)}-${team.code.slice(6)}`;
  const joined=await joinTeam(spaced,'Spacey');
  assert.equal(joined.status,200,'spacing and punctuation are ignored');
  assert.equal(joined.data.team.id,team.id);
  assert.equal((await joinTeam(team.code.toLowerCase(),'Lower')).status,200,'case is ignored');

  const short=await joinTeam('ABC','Too Short');
  assert.equal(short.status,400);
  assert.match(short.data.error,/9 letters and numbers/);
  assert.equal((await joinTeam('ZZZZZZZZZ','No Such Team')).status,401,'a well-formed code matching nothing is a different answer');
  assert.equal((await joinTeam(team.code,'X')).status,400,'a name still has to be a name');
});

test('sign-in limits use the forwarded address only when the proxy is trusted',limit,async()=>{
  const from=address=>request('/api/auth/teacher',{password:'wrong-password'},undefined,{base:proxiedBase,headers:{'X-Forwarded-For':address}});
  const direct=address=>request('/api/auth/teacher',{password:'wrong-password'},undefined,{headers:{'X-Forwarded-For':address}});
  for(let i=0;i<12;i++) assert.equal((await from('203.0.113.7')).status,401,`attempt ${i+1} is allowed`);
  assert.equal((await from('203.0.113.7')).status,429,'the per-address allowance does run out');
  assert.equal((await from('203.0.113.8')).status,401,'a different address has its own bucket');
  // Without trustProxy the header is ignored, so a spoofed value cannot pick a new bucket
  // and the class is counted by the socket address instead.
  assert.equal((await direct('198.51.100.1')).status,401);
});

test('static assets are cached by content and compressed',limit,async()=>{
  for (const path of ['/bootstrap.js','/app.js','/shared/game.js','/shared/i18n.js']) {
    const asset=await fetch(base+path);
    assert.equal(asset.status,200,`${path} loads for the browser`);
    assert.match(asset.headers.get('content-type'),/javascript/,`${path} is served as JavaScript`);
    await asset.text();
  }
  const first=await fetch(base+'/app.js');
  assert.equal(first.status,200);
  const etag=first.headers.get('etag');
  assert(etag,'has an ETag to revalidate against');
  assert.equal(first.headers.get('content-encoding'),'gzip','text assets are compressed');
  await first.text();
  const second=await fetch(base+'/app.js',{headers:{'If-None-Match':etag}});
  assert.equal(second.status,304,'a reload re-sends nothing');
  await second.text();
  const map=await fetch(base+'/map-points.css');
  assert.equal(map.status,200);
  assert.match(await map.text(),/\.map-dot\[data-map="A"\]\{left:16\.8%;top:61\.5%\}/,'generated from shared/game.js');
  const image=await fetch(base+'/assets/world-hero.webp');
  assert.match(image.headers.get('cache-control'),/max-age=86400/);
  await image.arrayBuffer();
  const missing=await fetch(base+'/assets/nope.webp');
  assert.equal(missing.status,404);
  await missing.text();
});
