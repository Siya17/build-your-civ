import test, {before,after,beforeEach} from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { initializeApp,deleteApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeTestEnvironment,assertFails,assertSucceeds } from '@firebase/rules-unit-testing';
import { doc,collection,getDoc,getDocs,setDoc,onSnapshot } from 'firebase/firestore';
import { createFirestoreStore } from '../server/firestore-store.js';
import { createAppHandler } from '../server/http.js';

if(!process.env.FIRESTORE_EMULATOR_HOST)throw new Error('Run npm run test:firebase; these checks must never use a live project');
const projectId='demo-build-your-civ',secret='a-test-secret-that-is-long-enough-for-all-sessions';
let env,admin,db,store;
before(async()=>{
  const [host,port]=process.env.FIRESTORE_EMULATOR_HOST.split(':');
  env=await initializeTestEnvironment({projectId,firestore:{host,port:Number(port),rules:readFileSync(new URL('../firestore.rules',import.meta.url),'utf8')}});
  admin=initializeApp({projectId},'firestore-integration');db=getFirestore(admin);
});
beforeEach(async()=>{await env.clearFirestore();store=createFirestoreStore(db,{secret});await store.seedLetterTeams();});
after(async()=>{await env?.cleanup();if(admin)await deleteApp(admin);});
const asStudent=async(team,name='Student')=>{
  const session=await store.createSession('student',team.id,name);
  return {...session,db:env.authenticatedContext(store.sessionId(session.token),{role:'student',teamId:team.id}).firestore()};
};
const ref=(client,path)=>doc(client,'classrooms/main/'+path);
const complete=async team=>{
  await store.updateTeam(team.id,{type:'pick',tree:'tech',id:'pottery'},'Student');
  await store.updateTeam(team.id,{type:'pick',tree:'civic',id:'laws'},'Student');
  await store.updateTeam(team.id,{type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']}},'Student',()=>1);
  for(const key of ['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer','civName'])await store.updateTeam(team.id,{type:'field',key,value:'An original classroom answer.'},'Student');
  for(const [key,value]of [['government','council'],['economy','farming'],['beliefs','river']])await store.updateTeam(team.id,{type:'chip',key,value,on:true},'Student');
};

test('seeding and join codes survive a fresh server instance',async()=>{
  const second=createFirestoreStore(db,{secret});
  assert.deepEqual(await second.seedLetterTeams(),[]);
  const teams=await second.listTeams();assert.equal(teams.length,11);
  assert.deepEqual(teams.map(team=>team.state.fixedPoint),'ABCDEFGHIJK'.split(''));
  for(const team of teams)assert.equal((await second.findTeamByCode(team.code.toLowerCase().replace('-',' '))).id,team.id);
  await store.updateTeam(teams[0].id,{type:'field',key:'geographyAnswer',value:'Saved before redeploy.'},'Writer');
  assert.equal((await second.getTeam(teams[0].id)).state.geographyAnswer,'Saved before redeploy.');
});

test('Rules protect other teams, secrets, teacher views, and all browser writes',async()=>{
  const [one,two]=await store.listTeams(),student=await asStudent(one);
  await assertSucceeds(getDoc(ref(student.db,'teams/'+one.id)));
  await assertFails(getDoc(ref(student.db,'teams/'+two.id)));
  await assertFails(getDocs(collection(student.db,'classrooms/main/teams')));
  await assertFails(getDoc(ref(student.db,'codes/'+store.sessionId(one.code))));
  await assertFails(getDoc(ref(student.db,'attempts/teacher-global')));
  await assertFails(setDoc(ref(student.db,'teams/'+one.id),{state:{event:{id:6}}}));
  await assertFails(setDoc(ref(student.db,'settings/reveal'),{reveal:true}));
  await assertFails(getDoc(ref(env.unauthenticatedContext().firestore(),'teams/'+one.id)));
  const teacher=await store.createSession('teacher',null,'Teacher');
  const teacherDb=env.authenticatedContext(store.sessionId(teacher.token),{role:'teacher'}).firestore();
  assert.equal((await assertSucceeds(getDocs(collection(teacherDb,'classrooms/main/teams')))).size,11);
  await assertFails(setDoc(ref(teacherDb,'settings/reveal'),{reveal:true}));
  // A forged custom claim alone cannot turn a real student session into a teacher.
  const forged=env.authenticatedContext(store.sessionId(student.token),{role:'teacher'}).firestore();
  await assertFails(getDoc(ref(forged,'teams/'+two.id)));
});

test('live listeners receive committed work and revoke access on logout/deletion',async()=>{
  const team=(await store.listTeams())[6],student=await asStudent(team,'Reader');
  let stop;
  const seen=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(new Error('No live update arrived')),8000);
    stop=onSnapshot(ref(student.db,'teams/'+team.id),snap=>{if(snap.data()?.state.geographyAnswer==='Live classroom answer'){clearTimeout(timer);resolve();}},reject);
  });
  await store.updateTeam(team.id,{type:'field',key:'geographyAnswer',value:'Live classroom answer'},'Writer');
  await seen;stop();
  await store.deleteSession(student.token);
  await assertFails(getDoc(ref(student.db,'teams/'+team.id)));
  const replacement=await asStudent(team,'Later');
  await store.deleteTeam(team.id);
  assert.equal(await store.getSession(replacement.token),null);
  await assertFails(getDoc(ref(replacement.db,'settings/reveal'))); // rules also deny deleted-team students
});

test('30 students share a team and concurrent changes retain all saved answers',async()=>{
  const team=(await store.listTeams())[6];
  const sessions=await Promise.all(Array.from({length:30},(_,index)=>store.createSession('student',team.id,`Student ${index+1}`)));
  assert.equal(new Set(sessions.map(session=>session.token)).size,30);
  const fields=['geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer'];
  await Promise.all(fields.map((key,index)=>store.updateTeam(team.id,{type:'field',key,value:'Student answer '+index},'Student '+index)));
  const saved=await store.getTeam(team.id);fields.forEach((key,index)=>assert.equal(saved.state[key],'Student answer '+index));
  assert.equal(saved.version,fields.length);assert.equal((await store.joinedNames(team.id)).length,30);
});

test('racing event rolls commit exactly once; rejected actions leave no activity',async()=>{
  const team=(await store.listTeams())[6];
  await store.updateTeam(team.id,{type:'pick',tree:'tech',id:'pottery'},'One');
  await store.updateTeam(team.id,{type:'pick',tree:'civic',id:'laws'},'One');
  const action={type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']}};
  const results=await Promise.allSettled([store.updateTeam(team.id,action,'One',()=>1),store.updateTeam(team.id,action,'Two',()=>6)]);
  assert.equal(results.filter(result=>result.status==='fulfilled').length,1);
  const saved=await store.getTeam(team.id),activity=await store.teamActivity(team.id);
  assert.equal(saved.version,3);assert.equal(activity.recent.filter(row=>row.type==='eventRoll').length,1);
  await assert.rejects(store.updateTeam(team.id,action,'One',()=>3));
  assert.equal((await store.getTeam(team.id)).version,3);
});

test('concurrent writers to one answer cannot silently replace each other',async()=>{
  const team=(await store.listTeams())[0];
  const results=await Promise.allSettled(['First answer','Second answer'].map(value=>store.updateTeam(team.id,{type:'field',key:'geographyAnswer',value,baseValue:''},value)));
  assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
  assert.equal(results.find(r=>r.status==='rejected').reason.code,'fieldConflict');
  const saved=await store.getTeam(team.id);assert.equal(saved.version,1);
  assert.equal((await store.teamActivity(team.id)).recent.length,1);
  await store.updateTeam(team.id,{type:'field',key:'economyAnswer',value:'Different field',baseValue:''},'Other');
  assert.equal((await store.getTeam(team.id)).state.geographyAnswer,saved.state.geographyAnswer);
});

test('invalid second dice face rolls back both dice and the activity entry',async()=>{
  const team=(await store.listTeams())[6];
  await store.updateTeam(team.id,{type:'pick',tree:'tech',id:'pottery'},'One');
  await store.updateTeam(team.id,{type:'pick',tree:'civic',id:'laws'},'One');
  const before=await store.getTeam(team.id),faces=[2,0];
  await assert.rejects(store.updateTeam(team.id,{type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']}},'One',()=>faces.shift()));
  assert.deepEqual(await store.getTeam(team.id),before);assert.equal((await store.teamActivity(team.id)).recent.length,2);
});

test('submissions, reveal gating, separate historical reflection and reopening persist',async()=>{
  const team=(await store.listTeams())[6];await complete(team);
  await store.submitTeam(team.id,'Student');
  await assert.rejects(store.updateTeam(team.id,{type:'field',key:'civName',value:'Locked'},'Student'),{code:'submitted'});
  await assert.rejects(store.updateTeam(team.id,{type:'reflectionAnswer',key:'historyWorkAnswer',value:'A comparison'},'Student'),{code:'reflectionClosed'});
  await store.setReveal(true);
  for(const key of ['historyDifferenceAnswer','historyWorkAnswer','historyOmissionAnswer'])await store.updateTeam(team.id,{type:'reflectionAnswer',key,value:'My historical reflection.'},'Student');
  const before=await store.getTeam(team.id);await store.submitReflection(team.id,'Student',before.version);
  assert((await store.getTeam(team.id)).state.reflection.submittedAt);
  await store.reopenReflection(team.id);assert((await store.getTeam(team.id)).submittedAt);
  await store.reopenTeam(team.id);const reopened=await store.getTeam(team.id);
  assert.equal(reopened.submittedAt,null);assert.equal(reopened.state.reflection.submittedAt,null);
  assert.equal(reopened.state.reflection.historyWorkAnswer,'My historical reflection.');
});

test('short-code throttles and presence are shared across server instances',async()=>{
  const other=createFirestoreStore(db,{secret}),team=(await store.listTeams())[0],student=await asStudent(team,'Writer');
  for(let index=0;index<12;index++)assert.equal(await(index%2?other:store).loginAllowed('203.0.113.1','teacher'),true);
  assert.equal(await other.loginAllowed('203.0.113.1','teacher'),false);
  assert.equal(await other.loginAllowed('203.0.113.2','teacher'),true);
  await store.setPresence(student.token,{teamId:team.id,name:'Writer'},'geographyAnswer');
  assert.deepEqual(await other.liveNames(team.id),['Writer']);assert.deepEqual(await other.presenceFields(team.id),{geographyAnswer:['Writer']});
  await other.clearPresence(student.token,{teamId:team.id});assert.deepEqual(await store.liveNames(team.id),[]);
});

test('Vercel-style parsed request bodies exercise the shared HTTP API without SQLite',async()=>{
  store.realtimeToken=async()=>({mode:'firebase'});
  const handler=createAppHandler({teacherPassword:'teacher-password-for-tests',store,staticAssets:false});
  const server=createServer(async(req,res)=>{
    // Like Vercel, consume and parse bodies before invoking the handler.
    const chunks=[];for await(const chunk of req)chunks.push(chunk);
    if(chunks.length)req.body=JSON.parse(Buffer.concat(chunks).toString());
    await handler(req,res);
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const base=`http://127.0.0.1:${server.address().port}`;
  const request=async(path,body,cookie)=>{
    const res=await fetch(base+path,{method:body===undefined?'GET':'POST',headers:{...(body!==undefined?{'Content-Type':'application/json'}:{}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
    return {status:res.status,data:await res.json(),cookie:res.headers.get('set-cookie')?.split(';')[0]};
  };
  try {
    const teacher=await request('/api/auth/teacher',{password:'teacher-password-for-tests'});assert.equal(teacher.status,200);
    const team=teacher.data.teams[6],student=await request('/api/auth/team',{code:team.code,name:'Vercel Student'});assert.equal(student.status,200);
    const saved=await request('/api/team/action',{type:'field',key:'geographyAnswer',value:'Saved through Vercel API'},student.cookie);
    assert.equal(saved.status,200);assert.equal(saved.data.team.state.geographyAnswer,'Saved through Vercel API');
    assert.equal((await request('/api/realtime',undefined,student.cookie)).data.mode,'firebase');
    assert.equal((await request('/api/events',undefined,student.cookie)).status,404);
    assert.equal((await request('/api/teacher/reveal',{reveal:true},student.cookie)).status,401);
    assert.equal((await request('/api/team/presence',{field:'geographyAnswer'},student.cookie)).status,200);
    assert.equal((await request('/api/teacher/teams/'+team.id+'/activity',undefined,teacher.cookie)).status,200);
    const rotated=await request('/api/teacher/teams/'+team.id+'/new-code',{},teacher.cookie);assert.equal(rotated.status,200);
    assert.equal((await request('/api/auth/team',{code:team.code,name:'Old Code'})).status,401);
    assert.equal((await request('/api/auth/team',{code:rotated.data.code,name:'New Code'})).status,200);
    assert.equal((await request('/api/logout',{},student.cookie)).status,200);
    assert.equal((await request('/api/me',undefined,student.cookie)).data.authenticated,false);
  } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});


test('lesson selection persists, locks transactionally, and Short submits without written reflections',async()=>{
  assert.deepEqual(await store.lessonSettings(),{lessonVersion:'full',lessonLocked:false});
  await store.setLessonVersion('short');
  const second=createFirestoreStore(db,{secret});assert.equal((await second.lessonSettings()).lessonVersion,'short');
  const t=(await store.listTeams()).find(t=>t.state.fixedPoint==='G');
  const client=await asStudent(t),teacher=await store.createSession('teacher',null,'Teacher');
  await assertSucceeds(getDoc(ref(client.db,'settings/lesson')));
  await assertFails(setDoc(ref(client.db,'settings/lesson'),{lessonVersion:'full'}));
  await assertFails(getDoc(ref(env.unauthenticatedContext().firestore(),'settings/lesson')));
  await assert.rejects(store.setLessonVersion('invalid'),/Invalid activity/);
  await store.updateTeam(t.id,{type:'chip',key:'beliefs',value:'river'},'Student');
  await store.updateTeam(t.id,{type:'chip',key:'beliefs',value:'river',on:false},'Student');
  assert.equal((await store.lessonSettings()).lessonLocked,true);
  await store.updateTeam(t.id,{type:'chip',key:'beliefs',value:'river'},'Student');
  await assert.rejects(store.setLessonVersion('full'),e=>e.status===409 && e.code==='lessonLocked');
  await store.updateTeam(t.id,{type:'pick',tree:'tech',id:'pottery'},'Student');
  await store.updateTeam(t.id,{type:'pick',tree:'civic',id:'laws'},'Student');
  await store.updateTeam(t.id,{type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']}},'Student',()=>1);
  await assert.rejects(store.submitTeam(t.id,'Student'),e=>e.gaps.includes('geographyAnswer'));
  for(const key of ['civName','eventAnswer','geographyAnswer','governmentAnswer','economyAnswer'])await store.updateTeam(t.id,{type:'field',key,value:'Specific evidence.'},'Student');
  for(const [key,value]of [['government','council'],['economy','farming']])await store.updateTeam(t.id,{type:'chip',key,value,on:true},'Student');
  const done=await store.submitTeam(t.id,'Student');assert(done.submittedAt);assert.equal(done.state.beliefAnswer,'');
  await store.setReveal(true);
  await assert.rejects(store.updateTeam(t.id,{type:'reflectionAnswer',key:'historyDifferenceAnswer',value:'Not needed.'},'Student'),e=>e.code==='reflectionDisabled');
  await assert.rejects(store.submitReflection(t.id,'Student',done.version),e=>e.code==='reflectionDisabled');
  await store.deleteTeam(t.id);assert.equal((await store.lessonSettings()).lessonLocked,false);
  await store.setLessonVersion('full');
});

test('a race between version selection and the first choice cannot change an active lesson',async()=>{
  const t=(await store.listTeams())[0];
  const result=await Promise.allSettled([store.setLessonVersion('short'),store.updateTeam(t.id,{type:'chip',key:'beliefs',value:'river'},'Student')]);
  assert.equal(result[1].status,'fulfilled');
  const settings=await store.lessonSettings();assert(settings.lessonLocked);
  if(result[0].status==='fulfilled')assert.equal(settings.lessonVersion,'short');
  else {assert.equal(result[0].reason.code,'lessonLocked');assert.equal(settings.lessonVersion,'full');}
  await assert.rejects(store.setLessonVersion(settings.lessonVersion==='full'?'short':'full'),e=>e.code==='lessonLocked');
});
