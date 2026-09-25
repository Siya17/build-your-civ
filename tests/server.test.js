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
const {createAppServer}=await import('../server/http.js');
const {closeStore}=await import('../server/store.js');

const teacherPassword='test-teacher-password';
const server=createAppServer({teacherPassword});
await new Promise(ready=>server.listen(0,'127.0.0.1',ready));
const base=`http://127.0.0.1:${server.address().port}`;
// A second server on the shared store, standing in for the hosted setup behind a proxy.
const proxied=createAppServer({teacherPassword,trustProxy:true});
await new Promise(ready=>proxied.listen(0,'127.0.0.1',ready));
const proxiedBase=`http://127.0.0.1:${proxied.address().port}`;

const request=async(path,body,cookie,options={})=>{
  const method=options.method||(body===undefined?'GET':'POST');
  const res=await fetch((options.base||base)+path,{
    method,
    headers:{...(body===undefined&&!options.method?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{}),...(options.headers||{})},
    body:body===undefined?undefined:JSON.stringify(body)
  });
  const data=res.headers.get('content-type')?.includes('json')?await res.json():await res.text();
  return {status:res.status,data,cookie:res.headers.get('set-cookie')?.split(';')[0],headers:res.headers};
};
const signInTeacher=async()=>(await request('/api/auth/teacher',{password:teacherPassword})).cookie;
const makeTeam=async(teacher,name)=>(await request('/api/teacher/teams',{name},teacher)).data.team;
const joinTeam=async(code,name)=>await request('/api/auth/team',{name,code});
// Reads one SSE frame at a time from an open stream.
const openStream=async cookie=>{
  const controller=new AbortController();
  const res=await fetch(base+'/api/events',{headers:{Cookie:cookie},signal:controller.signal});
  const reader=res.body.getReader();
  await reader.read(); // the ": connected" comment
  return {res,reader,controller,next:async()=>new TextDecoder().decode((await reader.read()).value)};
};

after(async()=>{
  await new Promise(done=>server.close(done));
  await new Promise(done=>proxied.close(done));
  closeStore();
  const abs=resolve(dataDir),safe=resolve(tmpdir())+sep;
  if(abs.startsWith(safe)) rmSync(abs,{recursive:true,force:true});
});

test('30 students can join, share stages and answers, then submit once',async()=>{
  const teacher=await signInTeacher();
  const made=await makeTeam(teacher,'River Makers');
  const second=await makeTeam(teacher,'Mountain Group');
  const code=made.code;
  const students=await Promise.all(Array.from({length:30},(_,i)=>joinTeam(code,`Student ${i+1}`)));
  assert(students.every(x=>x.status===200));
  assert.equal(students[0].data.team.id,made.id);
  const a=students[0].cookie,b=students[1].cookie;
  const outsider=await joinTeam(second.code,'Other Student');
  assert.equal(outsider.status,200);
  assert.equal((await request(`/api/teacher/teams/${made.id}`,undefined,outsider.cookie)).status,401);

  const live=await Promise.all(students.map(student=>openStream(student.cookie)));
  const update=await request('/api/team/action',{type:'map',point:'A'},a);
  assert.equal(update.status,200);
  const events=await Promise.race([
    Promise.all(live.map(stream=>stream.next())),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('No live team update')),2000))
  ]);
  assert(events.every(frame=>frame.includes('"mapPoint":"A"')),'every teammate sees the change');
  assert(events[1].includes('"by":"Student 1"'),'the payload names who changed it');
  // The live roster counts open streams, so it is complete while all 30 are connected.
  const connected=await request('/api/me',undefined,b);
  assert.equal(connected.data.roster.length,30);

  await Promise.all(live.map(stream=>{stream.controller.abort();return stream.reader.cancel().catch(()=>{})}));
  await new Promise(done=>setTimeout(done,150));
  // Once they disconnect the live roster empties, but attendance still shows all 30.
  const afterClose=await request('/api/me',undefined,b);
  assert.equal(afterClose.data.roster.length,1,'only the caller remains');
  const teacherView=await request(`/api/teacher/teams/${made.id}`,undefined,teacher);
  assert.equal(teacherView.data.joined.length,30,'attendance keeps everyone who signed in');

  await request('/api/team/action',{type:'field',key:'location',value:'River valley'},b);
  await request('/api/team/action',{type:'stage',stage:2},a);
  const seen=await request('/api/me',undefined,b);
  assert.equal(seen.data.team.state.mapPoint,'A');
  assert.equal(seen.data.team.state.location,'River valley');
  assert.equal(seen.data.team.state.stage,2);
  assert.equal((await request('/api/me',undefined,outsider.cookie)).data.team.state.mapPoint,'');

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
  const review=await request(`/api/teacher/teams/${made.id}`,undefined,teacher);
  assert.equal(review.data.team.state.connection,'Exchange pottery');
  assert.equal((await request(`/api/teacher/teams/${made.id}/reopen`,{},teacher)).status,200);
  assert.equal((await request('/api/team/action',{type:'field',key:'impact',value:'Changed'},a)).status,200);
});

test('presence tells teammates which field someone is writing in',async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Presence Team');
  const writer=await joinTeam(team.code,'Kenji');
  const watcher=await joinTeam(team.code,'Mei');
  const watching=await openStream(watcher.cookie);
  await openStream(writer.cookie);
  await watching.next(); // the writer connecting is itself a presence update

  assert.equal((await request('/api/team/presence',{field:'terrain'},writer.cookie)).status,200);
  const frame=await watching.next();
  assert(frame.startsWith('event: presence'),'sent as a presence event, not a state change');
  const payload=JSON.parse(frame.slice(frame.indexOf('data: ')+6));
  assert.deepEqual(payload.fields.terrain,['Kenji']);
  assert(payload.roster.includes('Mei')&&payload.roster.includes('Kenji'));

  await request('/api/team/presence',{field:null},writer.cookie);
  const cleared=JSON.parse((await watching.next()).slice(frame.indexOf('data: ')+6));
  assert.deepEqual(cleared.fields,{},'blur clears it');
  assert.equal((await request('/api/team/presence',{field:'not-a-field'},writer.cookie)).status,400);
});

test('a disconnected stream does not stop delivery to the rest of the team',async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Resilient Team');
  const one=await joinTeam(team.code,'One');
  const two=await joinTeam(team.code,'Two');
  const three=await joinTeam(team.code,'Three');
  const streams=[await openStream(one.cookie),await openStream(two.cookie),await openStream(three.cookie)];
  // Drop the middle stream abruptly, the way a closed laptop lid does.
  streams[1].controller.abort();
  await new Promise(done=>setTimeout(done,150));
  await request('/api/team/action',{type:'map',point:'C'},one.cookie);
  const surviving=await Promise.race([
    Promise.all([streams[0].next(),streams[2].next()]),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('delivery stopped at the dead client')),2000))
  ]);
  assert(surviving.every(frame=>frame.includes('"mapPoint":"C"')));
});

test('teacher can rename and delete a team, and students are signed out',async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Typo Naem');
  const student=await joinTeam(team.code,'Aya');
  const stream=await openStream(student.cookie);

  const renamed=await request(`/api/teacher/teams/${team.id}`,{name:'Delta Builders'},teacher,{method:'PATCH'});
  assert.equal(renamed.status,200);
  assert.equal(renamed.data.team.name,'Delta Builders');
  assert.equal((await request(`/api/teacher/teams/${team.id}`,{name:'   '},teacher,{method:'PATCH'})).status,400);

  const removed=await request(`/api/teacher/teams/${team.id}`,{},teacher,{method:'DELETE'});
  assert.equal(removed.status,200);
  assert(!removed.data.teams.some(x=>x.id===team.id));
  assert((await stream.next()).startsWith('event: revoked'),'the student is told, not left erroring');
  // The session cascaded away with the team, so the cookie no longer authenticates.
  assert.equal((await request('/api/me',undefined,student.cookie)).data.authenticated,false);
  assert.equal((await request('/api/team/action',{type:'map',point:'A'},student.cookie)).status,401);
  assert.equal((await request(`/api/teacher/teams/${team.id}`,undefined,teacher)).status,404);
  assert.equal((await request(`/api/teacher/teams/${team.id}`,{},teacher,{method:'DELETE'})).status,404);
});

test('activity log reports what each student saved',async()=>{
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

test('join codes survive being read aloud, and a wrong shape says so',async()=>{
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
  const wrong=await joinTeam('ZZZZZZZZZ','No Such Team');
  assert.equal(wrong.status,401,'a well-formed code that matches nothing is a different answer');
});

test('sign-in limits use the forwarded address only when the proxy is trusted',async()=>{
  const from=address=>request('/api/auth/teacher',{password:'wrong-password'},undefined,{base:proxiedBase,headers:{'X-Forwarded-For':address}});
  const direct=address=>request('/api/auth/teacher',{password:'wrong-password'},undefined,{headers:{'X-Forwarded-For':address}});
  const first=[];
  for(let i=0;i<12;i++) first.push((await from('203.0.113.7')).status);
  assert(first.every(status=>status===401),'the allowance is per address');
  assert.equal((await from('203.0.113.7')).status,429,'and it does run out');
  assert.equal((await from('203.0.113.8')).status,401,'a different student address has its own bucket');
  // Without trustProxy the header is ignored, so these share the socket bucket and the
  // whole class would be counted as one client.
  assert.equal((await direct('198.51.100.1')).status,401);
});

test('static assets are cached by content and compressed',async()=>{
  const first=await fetch(base+'/app.js');
  assert.equal(first.status,200);
  const etag=first.headers.get('etag');
  assert(etag,'has an ETag to revalidate against');
  assert.equal(first.headers.get('content-encoding'),'gzip','text assets are compressed');
  const second=await fetch(base+'/app.js',{headers:{'If-None-Match':etag}});
  assert.equal(second.status,304,'a reload re-sends nothing');
  const map=await fetch(base+'/map-points.css');
  assert.equal(map.status,200);
  assert.match(await map.text(),/\.map-dot\[data-map="A"\]\{left:16\.8%;top:61\.5%\}/,'generated from shared/game.js');
  const image=await fetch(base+'/assets/world-hero.webp');
  assert.match(image.headers.get('cache-control'),/max-age=86400/);
});
