// DATA_DIR must be set before server/store.js is imported anywhere, because the store opens
// its database at module load. These tests run under --test-isolation=none, so every test
// file shares one process: any file that imports the store earlier would write to the real
// data/ directory. Keep the dynamic imports below.
import { after, afterEach, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dataDir=mkdtempSync(join(tmpdir(),'civ-test-'));
process.env.DATA_DIR=dataDir;
const {createAppServer,closeStreams}=await import('../server/http.js');
const {closeStore}=await import('../server/store.js');

// Every die in these tests is scripted. A test that needs a die it did not queue fails.
const dice=[];
let diceUsed=0;
const rollDie=()=>{diceUsed++;if(!dice.length)throw new Error('unexpected die roll');return dice.shift()};
const teacherPassword='test-teacher-password';
const server=createAppServer({teacherPassword,rollDie});
await new Promise(ready=>server.listen(0,'127.0.0.1',ready));
const base=`http://127.0.0.1:${server.address().port}`;
// A second server on the shared store, standing in for the hosted setup behind a proxy.
const proxied=createAppServer({teacherPassword,trustProxy:true,rollDie});
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
let teacherCookie;
const signInTeacher=async()=>{
  if (teacherCookie) return teacherCookie;
  const response=await request('/api/auth/teacher',{password:teacherPassword});
  assert.equal(response.status,200);
  return teacherCookie=response.cookie;
};
const makeTeam=async(teacher,name)=>(await request('/api/teacher/teams',{name},teacher)).data.team;
const joinTeam=async(code,name)=>await request('/api/auth/team',{name,code});
const answers=['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer'];
const reflectionAnswers=['historyDifferenceAnswer','historyWorkAnswer','historyOmissionAnswer'];
async function submittedTeam(teacher,name) {
  const made=await makeTeam(teacher,name);
  const student=await joinTeam(made.code,'Historical Reader');
  const act=async action=>{
    const response=await request('/api/team/action',action,student.cookie);
    assert.equal(response.status,200,JSON.stringify(response.data));
    return response.data.team;
  };
  await act({type:'map',point:'G'});
  await act({type:'pick',tree:'tech',id:'pottery'});
  await act({type:'pick',tree:'civic',id:'laws'});
  dice.push(1,1);
  await act({type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']}});
  for(const key of answers)await act({type:'field',key,value:'Original classroom argument.'});
  await act({type:'field',key:'civName',value:name});
  for(const [key,value]of [['government','council'],['economy','farming'],['beliefs','river']])await act({type:'chip',key,value,on:true});
  const response=await request('/api/team/submit',{},student.cookie);
  assert.equal(response.status,200,JSON.stringify(response.data));
  return {team:response.data.team,cookie:student.cookie};
}

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
    }
  };
  streams.push(stream);
  return stream;
}
const dataOf=frame=>JSON.parse(frame.slice(frame.indexOf('data: ')+6));

afterEach(()=>{
  try {assert.equal(dice.length,0,'every scripted die must be consumed by its test');}
  finally {dice.length=0;}
});

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

test('30 students can join, share choices and answers, roll the event and submit once',limit,async()=>{
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
  assert.equal((await request('/api/team/action',{type:'map',point:'G'},a)).status,200);
  const frames=await Promise.all(live.map(stream=>stream.waitFor(frame=>frame.startsWith('event: team')&&frame.includes('"mapPoint":"G"'),'the shared place')));
  assert(frames.every(frame=>dataOf(frame).by==='Student 1'),'the payload names who changed it');
  assert.equal((await request('/api/me',undefined,b)).data.roster.length,30);
  for(const stream of live) stream.controller.abort();
  await new Promise(done=>setTimeout(done,250));
  assert.equal((await request('/api/me',undefined,b)).data.roster.length,1,'only the caller remains');
  assert.equal((await request(`/api/teacher/teams/${made.id}`,undefined,teacher)).data.joined.length,30,'attendance keeps everyone');

  const act=async(action,cookie=a)=>{const response=await request('/api/team/action',action,cookie);assert.equal(response.status,200,JSON.stringify(response.data));return response.data.team;};
  await act({type:'field',key:'geographyAnswer',value:'The Nile floods on time.'},b);
  for(const id of ['pottery','irrigation','sailing','writing'])await act({type:'pick',tree:'tech',id});
  for(const id of ['laws','craft'])await act({type:'pick',tree:'civic',id},b);
  const seen=(await request('/api/me',undefined,b)).data.team;
  assert.deepEqual(seen.state.tech,['pottery','irrigation','sailing','writing']);
  assert.equal(seen.state.geographyAnswer,'The Nile floods on time.');
  assert.equal((await request('/api/me',undefined,outsider.cookie)).data.team.state.mapPoint,'','the other team is untouched');

  const early=await request('/api/team/submit',{},b);
  assert.equal(early.status,400);
  assert(early.data.gaps.includes('event')&&early.data.gaps.includes('shapeAnswer'));
  dice.push(6,1);
  let team=await act({type:'eventRoll',confirm:{tech:seen.state.tech,civic:seen.state.civic}});
  assert.equal(team.state.event.id,6);
  assert.deepEqual(team.state.event.dice,[6,1]);
  team=await act({type:'eventGain',tree:'tech',id:'currency',index:0},b);
  assert(team.state.tech.includes('currency'));
  for(const key of answers)await act({type:'field',key,value:'Our team explanation'});
  await act({type:'chip',key:'government',value:'council'});
  await act({type:'chip',key:'economy',value:'farming',on:true});
  await act({type:'chip',key:'beliefs',value:'river'});
  const missingName=await request('/api/team/submit',{},b);
  assert.equal(missingName.status,400);
  assert.deepEqual(missingName.data.gaps,['civName']);
  await act({type:'field',key:'civName',value:'River Makers'});
  const submitted=await request('/api/team/submit',{},b);
  assert.equal(submitted.status,200);
  assert(submitted.data.team.submittedAt);
  const locked=await request('/api/team/action',{type:'field',key:'shapeAnswer',value:'Changed'},a);
  assert.equal(locked.status,400);
  assert.equal(locked.data.code,'submitted');
  assert.equal((await request('/api/team/submit',{},a)).data.code,'submitted');
  assert.equal((await request(`/api/teacher/teams/${made.id}`,undefined,teacher)).data.team.state.shapeAnswer,'Our team explanation');
  assert.equal((await request(`/api/teacher/teams/${made.id}/reopen`,{},teacher)).status,200);
  assert.equal((await request('/api/team/action',{type:'field',key:'shapeAnswer',value:'Changed'},a)).status,200);
});

test('every die is rolled on the server, once, and a roll from the browser is ignored',limit,async()=>{
  const teacher=await signInTeacher();
  const made=await makeTeam(teacher,'Dice Team');
  const a=(await joinTeam(made.code,'Rin')).cookie,b=(await joinTeam(made.code,'Kai')).cookie;
  const act=(action,cookie=a)=>request('/api/team/action',action,cookie);
  await act({type:'map',point:'G'});
  for(const id of ['husbandry','archery'])assert.equal((await act({type:'pick',tree:'tech',id})).status,200);
  dice.push(2);
  const horse=await act({type:'pick',tree:'tech',id:'horseback',roll:6});
  assert.equal(horse.status,200);
  assert.equal(horse.data.team.state.rolls.horseback,2,'the scripted server die decides, not the request');
  assert.equal((await act({type:'unpick',tree:'tech',id:'horseback',cascade:[]})).status,200);
  const used=diceUsed;
  assert.equal((await act({type:'pick',tree:'tech',id:'horseback'})).data.team.state.rolls.horseback,2);
  assert.equal(diceUsed,used,'adding the card again does not roll again');
  assert.equal((await act({type:'pick',tree:'tech',id:'horseback'})).status,409,'a card already chosen');
  assert.equal((await act({type:'unpick',tree:'tech',id:'archery',cascade:[]})).status,409,'the removal must name Horseback too');
  assert.equal((await act({type:'pick',tree:'civic',id:'laws'})).status,200);
  // Two students press "Roll" at the same moment: one roll wins, the other sees it.
  const state=(await request('/api/me',undefined,a)).data.team.state;
  dice.push(2,1);
  const eventDiceBefore=diceUsed;
  const confirm={tech:state.tech,civic:state.civic};
  const [first,second]=await Promise.all([act({type:'eventRoll',confirm},a),act({type:'eventRoll',confirm},b)]);
  assert.deepEqual([first.status,second.status].sort(),[200,409]);
  const loser=first.status===409?first:second;
  assert.equal(loser.data.code,'alreadyRolled');
  assert.equal(loser.data.team.state.event.id,2,'the refusal carries the roll that happened');
  assert.deepEqual(loser.data.team.state.event.dice,[2,1]);
  assert.deepEqual(first.data.team.state.event,second.data.team.state.event);
  assert.equal(diceUsed-eventDiceBefore,2,'the winning event consumes exactly two server faces');
  assert.equal(dice.length,0,'the other request consumes no extra dice');
  assert.equal((await act({type:'eventLose',tree:'tech',id:'horseback',index:1})).status,409,'a stale index');
  assert.equal((await act({type:'eventLose',tree:'tech',id:'husbandry',index:0})).status,400,'not at the end of a branch');
  assert.equal((await act({type:'eventLose',tree:'tech',id:'horseback',index:0})).status,200);
  assert.equal((await act({type:'pick',tree:'tech',id:'pottery'})).status,409,'the trees are locked after the event');
});

test('invalid server dice roll back the complete action and its activity entry',limit,async()=>{
  const teacher=await signInTeacher();
  const made=await makeTeam(teacher,'Rollback Dice');
  const student=await joinTeam(made.code,'Akira');
  const act=action=>request('/api/team/action',action,student.cookie);
  await act({type:'map',point:'G'});
  await act({type:'pick',tree:'tech',id:'husbandry'});
  await act({type:'pick',tree:'tech',id:'archery'});
  const before=(await request('/api/me',undefined,student.cookie)).data.team;
  const logBefore=(await request(`/api/teacher/teams/${made.id}/activity`,undefined,teacher)).data;
  for(const invalid of [0,7,2.5]) {
    dice.push(invalid);
    const response=await act({type:'pick',tree:'tech',id:'horseback'});
    assert.equal(response.status,500);
    assert.equal(response.data.error,'Server error');
    const current=(await request('/api/me',undefined,student.cookie)).data.team;
    assert.equal(current.version,before.version);
    assert.deepEqual(current.state,before.state);
    assert.deepEqual((await request(`/api/teacher/teams/${made.id}/activity`,undefined,teacher)).data,logBefore);
  }
  dice.push(4);
  assert.equal((await act({type:'pick',tree:'tech',id:'horseback'})).data.team.state.rolls.horseback,4,'a valid retry succeeds after rollback');
});

test('an invalid second event face rolls back both dice, state, version and activity',limit,async()=>{
  const teacher=await signInTeacher(),made=await makeTeam(teacher,'Event Pair Rollback');
  const student=await joinTeam(made.code,'Nao');
  const act=action=>request('/api/team/action',action,student.cookie);
  await act({type:'map',point:'G'});
  await act({type:'pick',tree:'tech',id:'pottery'});
  await act({type:'pick',tree:'civic',id:'laws'});
  const before=(await request('/api/me',undefined,student.cookie)).data.team;
  const activity=(await request(`/api/teacher/teams/${made.id}/activity`,undefined,teacher)).data;
  const action={type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']},id:12,dice:[6,6]};
  for(const invalid of [0,7,2.5]) {
    const used=diceUsed;dice.push(1,invalid);
    const refused=await act(action);
    assert.equal(refused.status,500);
    assert.equal(diceUsed-used,2);
    assert.deepEqual((await request('/api/me',undefined,student.cookie)).data.team,before);
    assert.deepEqual((await request(`/api/teacher/teams/${made.id}/activity`,undefined,teacher)).data,activity);
  }
  dice.push(1,4);
  const retry=await act(action);
  assert.equal(retry.status,200);
  assert.equal(retry.data.team.state.event.id,7,'the server pair decides the event');
  assert.deepEqual(retry.data.team.state.event.dice,[1,4]);
});

test('historical reflection requires submission and an open teacher reveal',limit,async()=>{
  const teacher=await signInTeacher();
  await request('/api/teacher/reveal',{reveal:true},teacher);
  const fresh=await makeTeam(teacher,'Not Yet Submitted');
  const student=await joinTeam(fresh.code,'Early Reader');
  const answer={type:'reflectionAnswer',key:reflectionAnswers[0],value:'Too early'};
  assert.equal((await request('/api/team/action',answer,student.cookie)).data.code,'reflectionNeedsSubmission');
  assert.equal((await request('/api/team/reflection/submit',{expectedVersion:fresh.version},student.cookie)).data.code,'reflectionNeedsSubmission');
  const submitted=await submittedTeam(teacher,'Closed Reflection');
  await request('/api/teacher/reveal',{reveal:false},teacher);
  assert.equal((await request('/api/team/action',answer,submitted.cookie)).data.code,'reflectionClosed');
  assert.equal((await request('/api/team/reflection/submit',{expectedVersion:submitted.team.version},submitted.cookie)).data.code,'reflectionClosed');
  assert.deepEqual((await request('/api/me',undefined,submitted.cookie)).data.team,submitted.team);
});

test('typed historical reflections synchronize, submit separately and reopen independently',limit,async()=>{
  const teacher=await signInTeacher();
  await request('/api/teacher/reveal',{reveal:true},teacher);
  const original=await submittedTeam(teacher,'Historical Team');
  const teammate=await joinTeam(original.team.code,'Second Reader');
  const live=await openStream(teammate.cookie);
  await live.waitFor(frame=>frame.startsWith('event: team'));
  const act=(action,cookie=original.cookie)=>request('/api/team/action',action,cookie);
  const early=await request('/api/team/reflection/submit',{expectedVersion:original.team.version},original.cookie);
  assert.equal(early.status,400);assert.deepEqual(early.data.gaps,reflectionAnswers);
  let latest=original.team;
  for(const [index,key]of reflectionAnswers.entries()) {
    const value=`Historical evidence ${index}: water, labour and cooperation.`;
    const response=await act({type:'reflectionAnswer',key,value},index===1?teammate.cookie:original.cookie);
    assert.equal(response.status,200);latest=response.data.team;
    const frame=await live.waitFor(frame=>frame.startsWith('event: team')&&frame.includes(value),'a shared historical answer');
    assert.equal(dataOf(frame).team.state.reflection[key],value);
  }
  assert.equal(latest.submittedAt,original.team.submittedAt);
  assert.deepEqual({...latest.state,reflection:original.team.state.reflection},original.team.state,'historical answers preserve the original civilization');
  live.controller.abort();
  const reconnect=await joinTeam(original.team.code,'Reconnected Reader');
  assert.deepEqual(reconnect.data.team.state.reflection,latest.state.reflection);
  assert.equal((await act({type:'field',key:'geographyAnswer',value:'Changed after submission'})).data.code,'submitted');
  const stale=await request('/api/team/reflection/submit',{expectedVersion:original.team.version},original.cookie);
  assert.equal(stale.status,409);assert.equal(stale.data.team.version,latest.version);
  assert.equal(stale.data.team.state.reflection.submittedAt,null);
  const submitted=await request('/api/team/reflection/submit',{expectedVersion:latest.version},teammate.cookie);
  assert.equal(submitted.status,200);
  assert(submitted.data.team.state.reflection.submittedAt);
  assert.equal(submitted.data.team.submittedAt,original.team.submittedAt);
  const final=submitted.data.team;
  assert.equal((await act({type:'reflectionAnswer',key:reflectionAnswers[0],value:'Changed'})).status,409);
  assert.equal((await request('/api/team/reflection/submit',{expectedVersion:final.version},original.cookie)).status,409);
  assert.equal((await request(`/api/teacher/teams/${final.id}/reopen-reflection`,{},teammate.cookie)).status,401);
  const reopened=await request(`/api/teacher/teams/${final.id}/reopen-reflection`,{},teacher);
  assert.equal(reopened.status,200);
  assert.equal(reopened.data.team.state.reflection.submittedAt,null);
  assert.equal(reopened.data.team.submittedAt,original.team.submittedAt);
  for(const key of reflectionAnswers)assert.equal(reopened.data.team.state.reflection[key],final.state.reflection[key]);
  const revision=await act({type:'reflectionAnswer',key:reflectionAnswers[0],value:'Revised historical comparison.'});
  assert.equal(revision.status,200);
  await request('/api/teacher/reveal',{reveal:false},teacher);
  const gated=await act({type:'reflectionAnswer',key:reflectionAnswers[1],value:'Blocked while closed'});
  assert.equal(gated.status,400);assert.equal(gated.data.code,'reflectionClosed');
  assert.deepEqual((await request('/api/me',undefined,original.cookie)).data.team,revision.data.team,'closing reveal preserves saved drafts');
  await request('/api/teacher/reveal',{reveal:true},teacher);
  const resubmitted=await request('/api/team/reflection/submit',{expectedVersion:revision.data.team.version},original.cookie);
  assert.equal(resubmitted.status,200);
  const allReopened=await request(`/api/teacher/teams/${final.id}/reopen`,{},teacher);
  assert.equal(allReopened.status,200);
  assert.equal(allReopened.data.team.submittedAt,null);
  assert.equal(allReopened.data.team.state.reflection.submittedAt,null);
  for(const key of reflectionAnswers)assert.equal(allReopened.data.team.state.reflection[key],resubmitted.data.team.state.reflection[key]);
  assert.equal((await act({type:'field',key:'geographyAnswer',value:'Now editable again'})).status,200);
  await request('/api/teacher/reveal',{reveal:false},teacher);
});

test('HTTP picks and free event gains cannot bypass a missing Philosophy branch',limit,async()=>{
  const teacher=await signInTeacher(),made=await makeTeam(teacher,'Required Branches');
  const student=await joinTeam(made.code,'Akio');
  const act=action=>request('/api/team/action',action,student.cookie);
  assert.equal((await act({type:'map',point:'G'})).status,200);
  assert.equal((await act({type:'pick',tree:'tech',id:'pottery'})).status,200);
  for(const id of ['laws','craft','workforce','trade'])assert.equal((await act({type:'pick',tree:'civic',id})).status,200);
  const before=(await request('/api/me',undefined,student.cookie)).data.team;
  const bypass=await act({type:'pick',tree:'civic',id:'philosophy'});
  assert.equal(bypass.status,400);assert.equal(bypass.data.code,'needsParent');
  assert.equal((await request('/api/me',undefined,student.cookie)).data.team.version,before.version,'a refusal writes nothing');
  dice.push(6,1);
  assert.equal((await act({type:'eventRoll',confirm:{tech:before.state.tech,civic:before.state.civic}})).status,200);
  const gain=await act({type:'eventGain',tree:'civic',id:'philosophy',index:0});
  assert.equal(gain.status,400);assert.equal(gain.data.code,'cannotGain');
  assert.equal((await act({type:'eventGain',tree:'civic',id:'empire',index:0})).status,200);
  assert.equal((await act({type:'chip',key:'government',value:'ruler'})).status,200,'working Empire and Workforce now support centralized governance');
  assert.equal((await act({type:'chip',key:'government',value:'assembly'})).data.code,'needsCapabilities','an Empire gain does not also grant Philosophy');
});

test('HTTP institution choices require their working developments',limit,async()=>{
  const teacher=await signInTeacher(),made=await makeTeam(teacher,'Institution Builders');
  const student=await joinTeam(made.code,'Maki');
  const act=action=>request('/api/team/action',action,student.cookie);
  await act({type:'map',point:'G'});
  for(const id of ['laws','trade','empire','poetry'])assert.equal((await act({type:'pick',tree:'civic',id})).status,200);
  for(const [key,value]of [['government','priests']]) {
    const refused=await act({type:'chip',key,value});
    assert.equal(refused.status,400);assert.equal(refused.data.code,'needsCapabilities');
  }
  for(const value of ['mystics','organized']) {
    const refused=await act({type:'chip',key:'beliefs',value});
    assert.equal(refused.status,400);assert.equal(refused.data.code,'badChip');
  }
  assert.equal((await act({type:'chip',key:'beliefs',value:'ancestors'})).status,200,'ordinary spirituality is not gated behind institutions');
  assert.equal((await act({type:'pick',tree:'civic',id:'mysticism'})).status,200);
  assert.equal((await act({type:'chip',key:'government',value:'priests'})).status,200);
  assert.equal((await act({type:'chip',key:'beliefs',value:'other'})).status,200);
  assert.equal((await act({type:'pick',tree:'civic',id:'theology'})).status,200);
  for(const value of ['ancestors','animals','river','sea','mountains','sky','gods','one','other']) assert.equal((await act({type:'chip',key:'beliefs',value})).status,200);
});

test('ordinary leadership, subsistence and belief can complete a team after Society is lost',limit,async()=>{
  const teacher=await signInTeacher(),made=await makeTeam(teacher,'Life After Loss');
  const student=await joinTeam(made.code,'Emi');
  const act=action=>request('/api/team/action',action,student.cookie);
  await act({type:'map',point:'G'});
  await act({type:'pick',tree:'tech',id:'pottery'});
  await act({type:'pick',tree:'civic',id:'laws'});
  dice.push(4,1);
  assert.equal((await act({type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']}})).status,200);
  const empty=await act({type:'eventLose',id:'laws',index:0});
  assert.equal(empty.status,200);assert.deepEqual(empty.data.team.state.civic,[]);
  assert.equal((await act({type:'chip',key:'government',value:'priests'})).data.code,'needsCapabilities');
  assert.equal((await act({type:'chip',key:'government',value:'council'})).status,200);
  for(const value of ['farming','fishing','hunting'])assert.equal((await act({type:'chip',key:'economy',value,on:true})).status,200);
  assert.equal((await act({type:'chip',key:'beliefs',value:'one'})).status,200);
  for(const key of answers)assert.equal((await act({type:'field',key,value:'Our revised explanation.'})).status,200);
  assert.equal((await act({type:'field',key:'civName',value:'Life After Loss'})).status,200);
  assert.equal((await request('/api/team/submit',{},student.cookie)).status,200,'an emptied Society tree does not force impossible institutions');
});

test('the teacher opens the reveal for everyone, and a new stream learns it at once',limit,async()=>{
  const teacher=await signInTeacher();
  const made=await makeTeam(teacher,'Reveal Team');
  const student=await joinTeam(made.code,'Mio');
  assert.equal(student.data.reveal,false);
  const live=await openStream(student.cookie);
  assert.equal(dataOf(await live.waitFor(frame=>frame.startsWith('event: reveal'),'the first reveal frame')).reveal,false);
  assert.equal((await request('/api/teacher/reveal',{reveal:true},student.cookie)).status,401,'students cannot open it');
  assert.equal((await request('/api/teacher/reveal',{reveal:'yes'},teacher)).status,400);
  const opened=await request('/api/teacher/reveal',{reveal:true},teacher);
  assert.equal(opened.data.reveal,true);
  assert.equal(dataOf(await live.waitFor(frame=>frame.startsWith('event: reveal')&&frame.includes('true'),'the reveal opening')).reveal,true);
  assert.equal((await request('/api/me',undefined,student.cookie)).data.reveal,true);
  assert.equal((await request('/api/me',undefined,teacher)).data.reveal,true);
  const late=await openStream(student.cookie);
  assert.equal(dataOf(await late.waitFor(frame=>frame.startsWith('event: reveal'),'the state on connect')).reveal,true);
  assert.equal((await request('/api/teacher/reveal',{reveal:false},teacher)).data.reveal,false);
  live.controller.abort();late.controller.abort();
});

test('a teacher can assign a custom team a fixed region, and a reconnect receives current state',limit,async()=>{
  const teacher=await signInTeacher();
  const created=await request('/api/teacher/teams',{name:'Fixed Nile',point:'G'},teacher);
  assert.equal(created.status,201);
  assert.equal(created.data.team.state.fixedPoint,'G');
  assert.equal(created.data.team.state.mapPoint,'G');
  for(const point of ['Z',false,0,null]) assert.equal((await request('/api/teacher/teams',{name:'Invalid region',point},teacher)).status,400);
  const student=await joinTeam(created.data.team.code,'Nori');
  const first=await openStream(student.cookie);
  assert.equal(dataOf(await first.waitFor(frame=>frame.startsWith('event: team'))).team.state.mapPoint,'G');
  first.controller.abort();
  assert.equal((await request('/api/team/action',{type:'field',key:'geographyAnswer',value:'Saved while disconnected'},student.cookie)).status,200);
  const reconnected=await openStream(student.cookie);
  const current=dataOf(await reconnected.waitFor(frame=>frame.startsWith('event: team')));
  assert.equal(current.team.state.geographyAnswer,'Saved while disconnected');
  assert(current.roster.includes('Nori'));
  const teachers=await openStream(teacher);
  assert(dataOf(await teachers.waitFor(frame=>frame.startsWith('event: teams'))).teams.some(team=>team.id===created.data.team.id));
  reconnected.controller.abort();teachers.controller.abort();
});

test('logout revokes the session and its existing stream',limit,async()=>{
  const teacher=await signInTeacher();
  const made=await makeTeam(teacher,'Sign Out');
  const student=await joinTeam(made.code,'Sora');
  const live=await openStream(student.cookie);
  await live.waitFor(frame=>frame.startsWith('event: team'));
  assert.equal((await request('/api/logout',{},student.cookie)).status,200);
  assert.equal(dataOf(await live.waitFor(frame=>frame.startsWith('event: revoked'))).reason,'logout');
  assert.equal((await request('/api/me',undefined,student.cookie)).data.authenticated,false);
  assert.equal((await request('/api/team/action',{type:'field',key:'civName',value:'Cannot save'},student.cookie)).status,401);
});

test('writes require same-origin JSON objects and bounded request bodies',limit,async()=>{
  const teacher=await signInTeacher();
  for(const body of [null,[],false,'name']) assert.equal((await request('/api/teacher/teams',body,teacher)).status,400);
  for(const origin of ['https://elsewhere.example','null','file://'+new URL(base).host]) {
    assert.equal((await request('/api/teacher/teams',{name:'No access'},teacher,{headers:{Origin:origin}})).status,403);
  }
  assert.equal((await request('/api/teacher/teams',{name:'Wrong content type'},teacher,{headers:{'Content-Type':'text/plain'}})).status,415);
  assert.equal((await request('/api/teacher/teams',{name:'あ'.repeat(5000)},teacher)).status,413,'the body limit counts UTF-8 bytes');
});

test('a team saved by the old hex-map version opens in the new shape',limit,async()=>{
  const teacher=await signInTeacher();
  const made=await makeTeam(teacher,'Old Save');
  const old={stage:3,mapPoint:'H',avatar:'H',route:'water',placeAnswer:'Rivers help',beliefAnswer:'The land is alive',tech:['pottery','husbandry','archery'],civic:['laws','mutual_aid'],events:{origin:'steward',encounter:'share'},tiles:{pottery:4},trails:[[1,2]],plannedBuildings:[]};
  const db=new DatabaseSync(join(dataDir,'classroom.sqlite'));
  db.prepare('UPDATE teams SET state_json=? WHERE id=?').run(JSON.stringify(old),made.id);
  db.close();
  const student=await joinTeam(made.code,'Ryo');
  const state=student.data.team.state;
  assert.equal(state.v,2);
  assert.deepEqual(state.tech,['pottery'],'Animal Husbandry is impossible in H');
  assert.deepEqual(state.civic,['laws']);
  assert.equal(state.beliefAnswer,'The land is alive');
  assert.equal(state.legacy.placeAnswer,'Rivers help');
  assert(!('tiles' in state)&&!('route' in state));
  const saved=await request('/api/team/action',{type:'field',key:'civName',value:'Eel Keepers'},student.cookie);
  assert.equal(saved.status,200);
  const check=new DatabaseSync(join(dataDir,'classroom.sqlite'));
  const row=JSON.parse(check.prepare('SELECT state_json FROM teams WHERE id=?').get(made.id).state_json);
  check.close();
  assert.equal(row.v,2,'the next save stores the new shape');
  assert(!('tiles' in row));
  const gaps=(await request('/api/team/submit',{},student.cookie)).data.gaps;
  assert(gaps.includes('event'));
  const backups=readdirSync(join(dataDir,'backups'));
  assert.equal(backups.length,1,'the first migrated write preserves the old database');
  const backup=new DatabaseSync(join(dataDir,'backups',backups[0],'classroom.sqlite'),{readOnly:true});
  assert.deepEqual(JSON.parse(backup.prepare('SELECT state_json FROM teams WHERE id=?').get(made.id).state_json),old);
  backup.close();
});

test('a strict dependency upgrade preserves raw v2 cards and answers before saving a pruned tree',limit,async()=>{
  const teacher=await signInTeacher(),made=await makeTeam(teacher,'OR Rules Save');
  const original={v:2,mapPoint:'G',tech:['pottery'],civic:['laws','craft','workforce','philosophy'],rolls:{},event:null,government:'assembly',governmentAnswer:'Keep our earlier explanation of decision-making.'};
  const db=new DatabaseSync(join(dataDir,'classroom.sqlite'));
  try {db.prepare('UPDATE teams SET state_json=? WHERE id=?').run(JSON.stringify(original),made.id);}
  finally {db.close();}
  const student=await joinTeam(made.code,'Kei');
  assert.deepEqual(student.data.team.state.civic,['laws','craft','workforce'],'the missing Empire branch is not silently treated as optional');
  const saved=await request('/api/team/action',{type:'field',key:'civName',value:'Revised Institutions'},student.cookie);
  assert.equal(saved.status,200);
  assert.equal(saved.data.team.state.governmentAnswer,original.governmentAnswer);
  const backups=readdirSync(join(dataDir,'backups')).filter(name=>name.startsWith('pre-rules-'));
  assert.equal(backups.length,1,'a rules revision gets its own backup independently of a pre-v2 migration');
  const folder=join(dataDir,'backups',backups[0]);
  assert.deepEqual(readFileSync(join(folder,'secret.key')),readFileSync(join(dataDir,'secret.key')));
  const backup=new DatabaseSync(join(folder,'classroom.sqlite'),{readOnly:true});
  try {
    assert.deepEqual(JSON.parse(backup.prepare('SELECT state_json FROM teams WHERE id=?').get(made.id).state_json),original);
    assert.equal(backup.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  } finally {backup.close();}
});

test('an upgrade checkpoints and backs up existing data before v2 writes, without dropping old worlds',limit,async()=>{
  const folder=join(dataDir,'upgrade-fixture');
  mkdirSync(folder);
  const secret=Buffer.alloc(32,42);
  writeFileSync(join(folder,'secret.key'),secret);
  const original={mapPoint:'G',tech:['pottery'],civic:['laws'],placeAnswer:'Keep this answer',events:{origin:'share'}};
  const source=new DatabaseSync(join(folder,'classroom.sqlite'));
  source.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE teams (id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,code_hash TEXT NOT NULL UNIQUE,state_json TEXT NOT NULL,version INTEGER NOT NULL DEFAULT 0,submitted_at TEXT,created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
    CREATE TABLE worlds (id INTEGER PRIMARY KEY, state_json TEXT);
    CREATE TABLE world_access (world_id INTEGER, token TEXT);`);
  source.prepare('INSERT INTO teams (name,code_hash,state_json,version) VALUES (?,?,?,?)').run('Legacy team','old-hash',JSON.stringify(original),7);
  source.prepare('INSERT INTO worlds VALUES (?,?)').run(9,'old world still belongs to the teacher');
  source.prepare('INSERT INTO world_access VALUES (?,?)').run(9,'saved access');
  // Leave the source connection open: recent writes are in the WAL at process startup.
  const moduleUrl=new URL('../server/store.js',import.meta.url).href;
  try {
    const previousDataDir=process.env.DATA_DIR;
    let upgraded;
    try {process.env.DATA_DIR=folder;upgraded=await import(moduleUrl+'?upgrade-fixture');}
    finally {process.env.DATA_DIR=previousDataDir;}
    try {upgraded.updateTeam(1,{type:'field',key:'civName',value:'Migrated'},'Test');}
    finally {upgraded.closeStore();}
    const backups=readdirSync(join(folder,'backups'));
    assert.equal(backups.length,1);
    const backupPath=join(folder,'backups',backups[0]);
    assert.deepEqual(readFileSync(join(backupPath,'secret.key')),secret);
    const backup=new DatabaseSync(join(backupPath,'classroom.sqlite'),{readOnly:true});
    try {
      assert.deepEqual(JSON.parse(backup.prepare('SELECT state_json FROM teams WHERE id=1').get().state_json),original);
      assert.equal(backup.prepare('SELECT version FROM teams WHERE id=1').get().version,7);
      assert(!backup.prepare('PRAGMA table_info(teams)').all().some(column=>column.name==='code'),'the copy precedes even schema changes');
      assert.equal(backup.prepare('SELECT token FROM world_access WHERE world_id=9').get().token,'saved access');
      assert.equal(backup.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
    } finally {backup.close();}
    assert.equal(JSON.parse(source.prepare('SELECT state_json FROM teams WHERE id=1').get().state_json).v,2);
    assert.equal(source.prepare('SELECT state_json FROM worlds WHERE id=9').get().state_json,'old world still belongs to the teacher');
    assert.equal(source.prepare('SELECT token FROM world_access WHERE world_id=9').get().token,'saved access');
  } finally {source.close();}
});

test('presence tells teammates which field someone is writing in',limit,async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'Presence Team');
  const writer=await joinTeam(team.code,'Kenji');
  const watcher=await joinTeam(team.code,'Mei');
  const watching=await openStream(watcher.cookie);
  await watching.waitFor(frame=>frame.startsWith('event: team'),'the initial team frame');
  await openStream(writer.cookie);

  assert.equal((await request('/api/team/presence',{field:'geographyAnswer'},writer.cookie)).status,200);
  const frame=await watching.waitFor(f=>f.startsWith('event: presence')&&f.includes('"geographyAnswer"'),'a presence event');
  const payload=dataOf(frame);
  assert.deepEqual(payload.fields.geographyAnswer,['Kenji']);
  assert(payload.roster.includes('Mei')&&payload.roster.includes('Kenji'),'and carries the live roster');
  assert(!watching.frames.some(f=>f.startsWith('event: team')),'presence never re-sends team state');
  await request('/api/team/presence',{field:null},writer.cookie);
  const cleared=await watching.waitFor(f=>f.includes('"fields":{}'),'presence being cleared on blur');
  assert.deepEqual(dataOf(cleared).fields,{});
  assert.equal((await request('/api/team/presence',{field:'placeAnswer'},writer.cookie)).status,400,'old fields are gone');
  assert.equal((await request('/api/team/presence',{field:'civName'},teacher)).status,401,'teachers have no presence');
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
    const frame=await stream.waitFor(f=>f.startsWith('event: team')&&f.includes('"mapPoint":"C"'),'delivery past the dead client');
    assert(frame);
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
  for(const value of ['One','Two','Three']) await request('/api/team/action',{type:'field',key:'geographyAnswer',value},busy.cookie);
  await request('/api/team/action',{type:'field',key:'shapeAnswer',value:'Clay'},quiet.cookie);
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
  assert.match(short.data.error,/like A-427/);
  assert.equal((await joinTeam('ZZZZZZZZZ','No Such Team')).status,401,'a well-formed code matching nothing is a different answer');
  assert.equal((await joinTeam(team.code,'X')).status,400,'a name still has to be a name');
});

test('join codes are the team name and a PIN, and the teacher can always read them',limit,async()=>{
  const teacher=await signInTeacher();
  const team=await makeTeam(teacher,'River Makers');
  assert.match(team.code,/^RIVERMAKER-\d{3}$/);
  assert.equal((await joinTeam(team.code.replace('-',' '),'Kai')).status,200);
  const listed=(await request('/api/me',undefined,teacher)).data.teams.find(x=>x.id===team.id);
  assert.equal(listed.code,team.code,'the code is still readable later');
  const fresh=await request(`/api/teacher/teams/${team.id}/new-code`,{},teacher);
  assert.match(fresh.data.code,/^RIVERMAKER-\d{3}$/);
  assert.equal((await joinTeam(team.code,'Late')).status,401,'the old code stops working');
  assert.equal((await joinTeam(fresh.data.code,'Late')).status,200);
});

test('teams A to K start at their own place and can be restored after deletion',limit,async()=>{
  const teacher=await signInTeacher();
  const added=await request('/api/teacher/letter-teams',{},teacher);
  assert.equal(added.status,200);
  const letters=added.data.teams.filter(x=>x.state.fixedPoint);
  assert.deepEqual(letters.map(x=>x.state.fixedPoint).sort(),'ABCDEFGHIJK'.split(''));
  const teamC=letters.find(x=>x.state.fixedPoint==='C');
  assert.equal(teamC.name,'Team C');
  assert.match(teamC.code,/^C-\d{3}$/);
  assert.equal(teamC.state.mapPoint,'C');
  const student=await joinTeam(teamC.code,'Nao');
  assert.equal(student.data.team.state.mapPoint,'C','the team arrives already at its place');
  assert.equal((await request('/api/team/action',{type:'map',point:'D'},student.cookie)).status,400,'the place is fixed');
  assert.equal((await request('/api/teacher/letter-teams',{},teacher)).data.made,0,'nothing is duplicated');
  await request(`/api/teacher/teams/${teamC.id}`,{},teacher,{method:'DELETE'});
  const restored=await request('/api/teacher/letter-teams',{},teacher);
  assert.equal(restored.data.made,1);
  assert(restored.data.teams.some(x=>x.state.fixedPoint==='C'&&x.id!==teamC.id));
  assert.equal((await request('/api/teacher/letter-teams',{},student.cookie)).status,401,'students cannot add teams');
});

test('sign-in limits use the forwarded address only when the proxy is trusted',limit,async()=>{
  const from=address=>request('/api/auth/teacher',{password:'wrong-password'},undefined,{base:proxiedBase,headers:{'X-Forwarded-For':address}});
  const direct=address=>request('/api/auth/teacher',{password:'wrong-password'},undefined,{headers:{'X-Forwarded-For':address}});
  for(let i=0;i<12;i++) assert.equal((await from('203.0.113.7')).status,401,`attempt ${i+1} is allowed`);
  assert.equal((await from('203.0.113.7')).status,429,'the per-address allowance does run out');
  assert.equal((await from('203.0.113.8')).status,401,'a different address has its own bucket');
  assert.equal((await direct('198.51.100.1')).status,401);
});

test('static assets are cached by content and compressed; the old pages are gone',limit,async()=>{
  for (const path of ['/bootstrap.js','/app.js','/screens.js','/ui.js','/tree.js','/poster.js','/prompts.js','/teacher.js',...['game','cards','regions','glossary','flow','i18n','credits'].map(id=>`/shared/${id}.js`)]) {
    const asset=await fetch(base+path);
    assert.equal(asset.status,200,`${path} loads for the browser`);
    assert.match(asset.headers.get('content-type'),/javascript/,`${path} is served as JavaScript`);
    await asset.text();
  }
  const first=await fetch(base+'/app.js');
  const etag=first.headers.get('etag');
  assert(etag,'has an ETag to revalidate against');
  assert.equal(first.headers.get('content-encoding'),'gzip','text assets are compressed');
  await first.text();
  const second=await fetch(base+'/app.js',{headers:{'If-None-Match':etag}});
  assert.equal(second.status,304,'a reload re-sends nothing');
  await second.text();
  const map=await fetch(base+'/map-points.css');
  assert.match(await map.text(),/\.map-dot\[data-map="A"\]\{left:13\.45%;top:73\.73%\}/,'pins come from latitude and longitude');
  const image=await fetch(base+'/assets/world-map.webp');
  assert.equal(image.status,200);
  assert.match(image.headers.get('cache-control'),/max-age=86400/);
  await image.arrayBuffer();
  for (const path of ['/play','/cooperative.js','/hexmap.js','/rpg.css','/shared/land.js','/shared/world.js','/shared/strategy/hex.js','/api/world/me','/assets/nope.webp']) {
    const gone=await fetch(base+path);
    assert.equal(gone.status,404,path);
    await gone.text();
  }
  const home=await fetch(base+'/');
  assert.match(await home.text(),/app\.js/);
});
