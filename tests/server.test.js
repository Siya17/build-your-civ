import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';

const dataDir=mkdtempSync(join(tmpdir(),'civ-test-'));
process.env.DATA_DIR=dataDir;
const {createAppServer}=await import('../server/http.js');
const {closeStore}=await import('../server/store.js');
const server=createAppServer({teacherPassword:'test-teacher-password'});
await new Promise(resolveListen=>server.listen(0,'127.0.0.1',resolveListen));
const base=`http://127.0.0.1:${server.address().port}`;
const request=async(path,body,cookie)=>{
  const res=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{...(body===undefined?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
  const data=await res.json();return {status:res.status,data,cookie:res.headers.get('set-cookie')?.split(';')[0]};
};

test('30 students can join, share stages and answers, then submit once',async t=>{
  t.after(async()=>{
    await new Promise(done=>server.close(done));
    closeStore();
    const abs=resolve(dataDir),safe=resolve(tmpdir())+sep;
    if(abs.startsWith(safe)) rmSync(abs,{recursive:true,force:true});
  });
  const teacher=await request('/api/auth/teacher',{password:'test-teacher-password'});
  assert.equal(teacher.status,200);
  const made=await request('/api/teacher/teams',{name:'River Makers'},teacher.cookie);
  assert.equal(made.status,201);
  const code=made.data.team.code;
  const students=await Promise.all(Array.from({length:30},(_,i)=>request('/api/auth/team',{name:`Student ${i+1}`,code})));
  assert(students.every(x=>x.status===200));
  assert.equal(students[0].data.team.id,made.data.team.id);
  const a=students[0].cookie,b=students[1].cookie;
  const live=await Promise.all(students.map(student=>fetch(base+'/api/events',{headers:{Cookie:student.cookie}})));
  assert(live.every(response=>response.status===200));
  const readers=live.map(response=>response.body.getReader());
  await Promise.all(readers.map(reader=>reader.read())); // initial connection comments
  const update=await request('/api/team/action',{type:'map',point:'A'},a);
  assert.equal(update.status,200);
  const events=await Promise.race([Promise.all(readers.map(reader=>reader.read())),new Promise((_,reject)=>setTimeout(()=>reject(new Error('No live team update')),2000))]);
  assert(events.every(event=>new TextDecoder().decode(event.value).includes('"mapPoint":"A"')));
  await Promise.all(readers.map(reader=>reader.cancel()));
  await request('/api/team/action',{type:'field',key:'location',value:'River valley'},b);
  await request('/api/team/action',{type:'stage',stage:2},a);
  const seen=await request('/api/me',undefined,b);
  assert.equal(seen.data.team.state.mapPoint,'A');
  assert.equal(seen.data.team.state.location,'River valley');
  assert.equal(seen.data.team.state.stage,2);
  assert.equal(seen.data.roster.length,30);
  const early=await request('/api/team/submit',{},b);
  assert.equal(early.status,400);
  assert(early.data.gaps.includes('tech'));
  for(const [key,value] of Object.entries({terrain:'Warm',resources:'Clay',govt:'Council',economy:'Trade',belief:'Shared rituals',geographyUse:'Use river',impact:'Boats connect people',connection:'Exchange pottery'})) {
    const x=await request('/api/team/action',{type:'field',key,value},a);assert.equal(x.status,200);
  }
  for(const [tree,id] of [['tech','pottery'],['civic','laws']]) assert.equal((await request('/api/team/action',{type:'pick',tree,id},a)).status,200);
  const submitted=await request('/api/team/submit',{},b);
  assert.equal(submitted.status,200);
  assert(submitted.data.team.submittedAt);
  assert.equal((await request('/api/team/action',{type:'field',key:'impact',value:'Changed'},a)).status,400);
  const teacherView=await request(`/api/teacher/teams/${made.data.team.id}`,undefined,teacher.cookie);
  assert.equal(teacherView.data.team.state.connection,'Exchange pottery');
  assert.equal(teacherView.data.roster.length,30);
  assert.equal((await request(`/api/teacher/teams/${made.data.team.id}/reopen`,{},teacher.cookie)).status,200);
  assert.equal((await request('/api/team/action',{type:'field',key:'impact',value:'Changed'},a)).status,200);
});
