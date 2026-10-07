// Explicit opt-in: creates disposable QA teams on the specified deployment.
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { eventPlan, availableChoiceValues } from '../shared/game.js';
const base=process.env.STRESS_BASE;
if(!base || !process.env.TEACHER_PASSWORD)throw new Error('Set STRESS_BASE and TEACHER_PASSWORD explicitly');
const timings=[],failures=[],created=[],sessions=[];
let teacher;
async function request(path,body,cookie,method){
  const start=performance.now();
  const res=await fetch(base+path,{method:method||(body===undefined?'GET':'POST'),headers:{Origin:base,...(body===undefined?{}:{'Content-Type':'application/json'}),...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body),signal:AbortSignal.timeout(45000)});
  const data=await res.json();timings.push({path,status:res.status,ms:Math.round(performance.now()-start)});
  if(!res.ok){failures.push({path,status:res.status,error:data.error});throw new Error(`${path}: ${res.status} ${data.error}`);}
  return {...data,cookie:res.headers.get('set-cookie')?.split(';')[0]};
}
const action=(cookie,body)=>request('/api/team/action',body,cookie);
let original,verified=0;
try {
  const login=await request('/api/auth/teacher',{password:process.env.TEACHER_PASSWORD});teacher=login.cookie;original=login.teams;
  for(let i=0;i<6;i++){
    const {team}=await request('/api/teacher/teams',{name:`QA Stress ${Date.now()} ${i}`,point:'G'},teacher);created.push(team);
  }
  console.log('Created six isolated QA teams');
  // Separate cookies represent 30 independent devices, five students per team.
  for(const team of created){
    const group=await Promise.all(Array.from({length:5},(_,i)=>request('/api/auth/team',{code:team.code,name:`QA Student ${i}`}).then(x=>x.cookie)));
    sessions.push(...group);team.students=group;
  }
  const fields=['geographyAnswer','governmentAnswer','economyAnswer','eventAnswer','civName'];
  for(let round=0;round<3;round++){
    await Promise.all(created.flatMap((team,t)=>team.students.map((cookie,i)=>action(cookie,{type:'field',key:fields[i],value:`QA team ${t} student ${i} round ${round} 日本語`})))) ;
    console.log(`30 simultaneous saves: round ${round+1} complete`);
  }
  for(const [t,team] of created.entries()){
    const fresh=await request(`/api/teacher/teams/${team.id}`,undefined,teacher);
    fields.forEach((key,i)=>assert.equal(fresh.team.state[key],`QA team ${t} student ${i} round 2 日本語`));
  }
  await Promise.all(created.map(async team=>{
    const cookie=team.students[0];
    await action(cookie,{type:'pick',tree:'tech',id:'pottery'});await action(cookie,{type:'pick',tree:'civic',id:'laws'});
    let result=await action(cookie,{type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']}});
    for(let i=0;i<5&&!eventPlan(result.team.state).resolved;i++){
      const plan=eventPlan(result.team.state);
      result=await action(cookie,plan.kind==='choose'?{type:'eventChoice',choice:'fight'}:{type:plan.kind==='lose'?'eventLose':'eventGain',...plan.options[0],index:plan.kind==='lose'?result.team.state.event.lost.length:result.team.state.event.gained.length});
    }
    for(const key of ['government','economy','beliefs'])result=await action(cookie,{type:'chip',key,value:availableChoiceValues(result.team.state,key)[0],on:true});
    // Also supports full-mode classrooms without altering the chosen lesson.
    for(const key of ['beliefAnswer','shapeAnswer','notChosenAnswer'])await action(cookie,{type:'field',key,value:'QA stress test explanation.'});
    const submitted=await request('/api/team/submit',{},cookie);assert(submitted.team.submittedAt);
    const read=await request(`/api/teacher/teams/${team.id}`,undefined,teacher);assert.deepEqual(read.team,submitted.team);
    const reconnect=await request('/api/auth/team',{code:team.code,name:'QA Reconnect'});sessions.push(reconnect.cookie);assert.deepEqual(reconnect.team,submitted.team);
    verified++;
  }));
  console.log(`Verified ${verified} submissions in teacher reads and fresh student logins`);
} finally {
  for(const cookie of sessions)await request('/api/logout',{},cookie).catch(()=>{});
  for(const team of created)await request(`/api/teacher/teams/${team.id}`,{},teacher,'DELETE');
  if(teacher){const final=await request('/api/me',undefined,teacher);assert.deepEqual(final.teams.filter(t=>original.some(o=>o.id===t.id)),original,'Original classroom teams must be unchanged');await request('/api/logout',{},teacher);}
  const sorted=timings.map(x=>x.ms).sort((a,b)=>a-b);
  const report={at:new Date().toISOString(),base,students:30,teams:created.length,verifiedSubmissions:verified,requests:timings.length,failures,latencyMs:{p50:sorted[Math.floor(sorted.length*.5)],p95:sorted[Math.floor(sorted.length*.95)],max:sorted.at(-1)},originalTeamsUnchanged:true,timings};
  writeFileSync(new URL('../artifacts/stress-live-results.json',import.meta.url),JSON.stringify(report,null,2));
  console.log(JSON.stringify({...report,timings:undefined}));
}
