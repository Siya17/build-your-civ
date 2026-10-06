import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { lessonStarted, validLessonVersion } from '../shared/lesson.js';
import { applyAction, codeTag, initialState, isCodeShape, isPoint, normalizeCode, normalizeState, points, submissionGaps, reflectionGaps } from '../shared/game.js';

// Every mutation reads and writes a team in a Firestore transaction. A retry must
// revalidate the latest state, especially for the one-time event and submissions.
export function createFirestoreStore(db, {secret, now = Date.now}) {
  const root = db.doc('classrooms/main');
  const teams = root.collection('teams'), sessions = root.collection('sessions');
  const codes = root.collection('codes'), presences = root.collection('presence');
  const lessonRef = root.collection('settings').doc('lesson');
  const lessonData = snap => ({lessonVersion:snap.data()?.lessonVersion === 'short' ? 'short' : 'full'});
  const started = data => data.lessonStarted || lessonStarted({...rowTeam(data),activityCounts:data.activityCounts});
  async function lessonSettings() {
    return {...lessonData(await lessonRef.get()),lessonLocked:(await teams.get()).docs.some(doc => started(doc.data()))};
  }
  async function setLessonVersion(version) {
    if (!validLessonVersion(version)) throw error('Invalid activity version');
    return db.runTransaction(async tx => {
      const current = lessonData(await tx.get(lessonRef));
      const all = await tx.get(teams), lessonLocked = all.docs.some(doc => started(doc.data()));
      if (lessonLocked && version !== current.lessonVersion) throw error('The activity version is locked because team work has started.',409,'lessonLocked');
      const settings = {lessonVersion:version,lessonLocked};
      tx.set(lessonRef,settings);
      return settings;
    });
  }
  const hash = value => createHmac('sha256', secret).update(value).digest('hex');
  const teamRef = id => teams.doc(String(id));
  const stamp = () => new Date(now()).toISOString();
  const rowTeam = data => data && ({id:data.id,name:data.name,code:data.code,state:normalizeState(data.state),version:data.version,submittedAt:data.submittedAt,createdAt:data.createdAt,updatedAt:data.updatedAt});
  const error = (message, status=400, code) => Object.assign(new Error(message), {status,code});
  const cleanName = name => String(name ?? '').trim().slice(0,80);
  const freshCode = name => `${codeTag(name)}-${randomInt(100,1000)}`;
  const makeTeam = (id,name,point,code) => ({id,name,code,codeHash:hash(normalizeCode(code)),state:point?{...initialState(),mapPoint:point,fixedPoint:point}:initialState(),version:0,submittedAt:null,createdAt:stamp(),updatedAt:stamp(),activityCounts:{}});
  const getTeam = async id => rowTeam((await teamRef(id).get()).data());
  const listTeams = async () => (await teams.orderBy('id').get()).docs.map(doc => rowTeam(doc.data()));
  const checkPoint = point => { if (typeof point !== 'string' || (point && !isPoint(point))) throw error('Invalid map point'); };

  async function createTeam(name, point='') {
    const clean=cleanName(name); if (!clean) throw error('Enter a team name'); checkPoint(point);
    return db.runTransaction(async tx => {
      const meta=(await tx.get(root)).data() || {};
      let code, index;
      do { code=freshCode(clean); index=codes.doc(hash(normalizeCode(code))); } while ((await tx.get(index)).exists);
      const id=(meta.nextId || 0)+1, data=makeTeam(id,clean,point,code);
      tx.set(root,{nextId:id},{merge:true}); tx.create(teamRef(id),data); tx.create(index,{teamId:id});
      return rowTeam(data);
    });
  }
  async function letterTeams(seedOnly=false) {
    return db.runTransaction(async tx => {
      const meta=(await tx.get(root)).data() || {};
      if (seedOnly && meta.seeded) return [];
      const existing=await tx.get(teams);
      const taken=new Set(existing.docs.map(doc=>doc.data().state.fixedPoint).filter(Boolean));
      const missing=points.filter(point=>!taken.has(point));
      // Finish all reads before starting the transaction's writes.
      const additions=[];
      let nextId=meta.nextId || 0;
      for (const point of missing) {
        const name=`Team ${point}`; let code,index;
        do {code=freshCode(name);index=codes.doc(hash(normalizeCode(code)));} while ((await tx.get(index)).exists);
        additions.push({index,data:makeTeam(++nextId,name,point,code)});
      }
      for (const {index,data} of additions) {tx.create(teamRef(data.id),data);tx.create(index,{teamId:data.id});}
      tx.set(root,{nextId,seeded:true},{merge:true});
      if (!meta.seeded) tx.set(root.collection('settings').doc('reveal'),{reveal:false});
      return additions.map(({data})=>rowTeam(data));
    });
  }
  async function mutate(id,actor,type,change) {
    const ref=teamRef(id), log=ref.collection('activity').doc();
    return db.runTransaction(async tx => {
      const snap=await tx.get(ref); if (!snap.exists) throw error('Team not found',404);
      const data=snap.data(); data.state=normalizeState(data.state);
      const lesson = await tx.get(lessonRef);
      await change(data,tx,lessonData(lesson).lessonVersion);
      if (!['rename','reopen','reflectionReopen'].includes(type)) data.lessonStarted=true;
      if (started(data) && !lesson.data()?.lessonLocked) tx.set(lessonRef,{...lessonData(lesson),lessonLocked:true});
      data.version++; data.updatedAt=stamp(); data.lastActor=actor;
      data.activityCounts ||= {};
      data.activityCounts={...data.activityCounts,[actor]:(Object.hasOwn(data.activityCounts,actor)?data.activityCounts[actor]:0)+1};
      tx.set(ref,data);tx.create(log,{actor,type,at:stamp()});
      return rowTeam(data);
    });
  }
  async function updateTeam(id,action,actor,rollDie=()=>randomInt(1,7)) {
    // Firestore can rerun the callback. Keep sampled faces stable across retries.
    const rolls=[];let cursor=0;
    return mutate(id,actor,action.type,async(data,tx,version)=>{
      cursor=0;
      if (action.type==='reflectionAnswer') {
        if (version === 'short') throw error('Historical reflection is a class discussion in this version.',400,'reflectionDisabled');
        if (!data.submittedAt) throw error('Submit your civilization before writing the historical reflection.',400,'reflectionNeedsSubmission');
        if (!(await tx.get(root.collection('settings').doc('reveal'))).data()?.reveal) throw error('Your teacher has closed the historical comparison. Your draft is still here.',400,'reflectionClosed');
      } else if (data.submittedAt) throw error('This team has already submitted. Ask the teacher to reopen it.',400,'submitted');
      if (Object.hasOwn(action,'expectedVersion') && action.expectedVersion!==data.version) throw error('The team changed. Review the updated choice before confirming.',409);
      data.state=applyAction(data.state,action,{rollDie:()=>{if(rolls[cursor]===undefined)rolls[cursor]=rollDie();return rolls[cursor++];}});
    });
  }
  async function submitTeam(id,actor) {
    return mutate(id,actor,'submit',(data,tx,version)=>{
      if (data.submittedAt) throw error('Already submitted. Ask the teacher to reopen it.',400,'submitted');
      const gaps=submissionGaps(data.state,version);if(gaps.length)throw Object.assign(error('Complete the required sections before submitting'),{gaps});
      data.submittedAt=stamp();
    });
  }
  async function submitReflection(id,actor,expectedVersion) {
    return mutate(id,actor,'reflectionSubmit',async(data,tx,version)=>{
      if (version === 'short') throw error('Historical reflection is a class discussion in this version.',400,'reflectionDisabled');
      if (!data.submittedAt) throw error('Submit your civilization first.',400,'reflectionNeedsSubmission');
      if (!(await tx.get(root.collection('settings').doc('reveal'))).data()?.reveal) throw error('The historical comparison is closed.',400,'reflectionClosed');
      if(data.state.reflection.submittedAt)throw error('The historical reflection has already been submitted.',409,'reflectionSubmitted');
      if(expectedVersion!==data.version)throw error('Your team changed the reflection. Review it before submitting.',409);
      const gaps=reflectionGaps(data.state);if(gaps.length)throw Object.assign(error('Complete all three historical reflection answers.'),{gaps});
      data.state.reflection.submittedAt=stamp();
    });
  }
  async function deleteTeam(id) {
    // Removing the team immediately denies its students in the API and Rules.
    await db.runTransaction(async tx=>{
      const ref=teamRef(id),snap=await tx.get(ref);if(!snap.exists)throw error('Team not found',404);
      const lesson = await tx.get(lessonRef), all = await tx.get(teams);
      tx.set(lessonRef,{...lessonData(lesson),lessonLocked:all.docs.some(doc => doc.data().id !== id && started(doc.data()))});
      tx.delete(ref);tx.delete(codes.doc(snap.data().codeHash));tx.delete(presences.doc(String(id)));
    });
    // Firestore document deletion does not delete subcollections.
    await db.recursiveDelete(teamRef(id));
  }
  async function regenerateCode(id) {
    return db.runTransaction(async tx=>{
      const ref=teamRef(id),snap=await tx.get(ref);if(!snap.exists)throw error('Team not found',404);
      const data=snap.data();let code,index;
      do{code=freshCode(data.name);index=codes.doc(hash(normalizeCode(code)));}while((await tx.get(index)).exists);
      tx.delete(codes.doc(data.codeHash));tx.create(index,{teamId:id});
      tx.update(ref,{code,codeHash:hash(normalizeCode(code)),updatedAt:stamp()});return code;
    });
  }
  async function getSession(token) {
    if (!token) return null;
    const snap=await sessions.doc(hash(token)).get(),data=snap.data();
    if (!data || data.expiresAt<=now()) return null;
    if(data.role==='student' && !(await teamRef(data.teamId).get()).exists)return null;
    return data;
  }
  async function createSession(role,teamId,name) {
    const token=randomBytes(32).toString('base64url'),expiresAt=now()+12*60*60*1000;
    await sessions.doc(hash(token)).create({role,teamId,name,expiresAt});return {token,expiresAt};
  }
  async function deleteSession(token) {
    if(!token)return;const session=await getSession(token);await sessions.doc(hash(token)).delete();
    if(session?.teamId)await clearPresence(token,session);
  }
  async function setPresence(token,session,field) {
    const ref=presences.doc(String(session.teamId));
    await db.runTransaction(async tx=>{
      const entries=(await tx.get(ref)).data()?.entries || {};
      for(const [uid,entry]of Object.entries(entries))if(entry.seenAt<now()-90_000)delete entries[uid];
      entries[hash(token)]={name:session.name,field,seenAt:now()};tx.set(ref,{entries});
    });
  }
  async function clearPresence(token,session) {
    const ref=presences.doc(String(session.teamId));
    await db.runTransaction(async tx=>{
      const snap=await tx.get(ref);if(!snap.exists)return;
      const entries=snap.data().entries || {};delete entries[hash(token)];tx.set(ref,{entries});
    });
  }
  async function livePresence(id,include) {
    const entries=Object.values((await presences.doc(String(id)).get()).data()?.entries || {}).filter(entry=>entry.seenAt>now()-90_000);
    const roster=[...new Set([...entries.map(entry=>entry.name),...(include?[include]:[])])].sort();
    const fields={};for(const entry of entries)if(entry.field){const names=fields[entry.field] ||= [];if(!names.includes(entry.name))names.push(entry.name);}
    return {roster,fields};
  }
  async function loginAllowed(address,kind) {
    // Shared across Vercel instances; in-memory throttles cannot protect short PINs.
    const refs=[root.collection('attempts').doc(hash(`${kind}:${address}`))];
    if(kind==='teacher')refs.push(root.collection('attempts').doc('teacher-global'));
    return db.runTransaction(async tx=>{
      const snaps=await tx.getAll(...refs),cutoff=now()-600_000;
      const hits=snaps.map(snap=>(snap.data()?.hits || []).filter(time=>time>cutoff));
      if(hits.some((list,index)=>list.length>=(index===1?60:kind==='teacher'?12:300)))return false;
      refs.forEach((ref,index)=>tx.set(ref,{hits:[...hits[index],now()]}));return true;
    });
  }
  return {
    lessonSettings,setLessonVersion,
    createTeam,getTeam,listTeams,updateTeam,submitTeam,submitReflection,deleteTeam,regenerateCode,getSession,createSession,deleteSession,
    seedLetterTeams:()=>letterTeams(true),addLetterTeams:()=>letterTeams(false),
    sessionId:hash,setPresence,clearPresence,loginAllowed,
    liveNames:async(id,include)=>(await livePresence(id,include)).roster,
    presenceFields:async id=>(await livePresence(id)).fields,
    findTeamByCode:async code=>{const normalized=normalizeCode(code);if(!isCodeShape(normalized))return null;const index=(await codes.doc(hash(normalized)).get()).data();return index?getTeam(index.teamId):null;},
    renameTeam:async(id,name)=>{const clean=cleanName(name);if(!clean)throw error('Enter a team name');return mutate(id,'Teacher','rename',data=>{data.name=clean;});},
    reopenTeam:id=>mutate(id,'Teacher','reopen',data=>{data.submittedAt=null;data.state.reflection.submittedAt=null;}),
    reopenReflection:id=>mutate(id,'Teacher','reflectionReopen',data=>{data.state.reflection.submittedAt=null;}),
    revealOpen:async()=>!!(await root.collection('settings').doc('reveal').get()).data()?.reveal,
    setReveal:async reveal=>{await root.collection('settings').doc('reveal').set({reveal});return reveal;},
    joinedNames:async id=>[...new Set((await sessions.where('teamId','==',id).get()).docs.map(doc=>doc.data()).filter(data=>data.expiresAt>now()).map(data=>data.name))],
    teamActivity:async id=>{
      const data=(await teamRef(id).get()).data();
      const recent=(await teamRef(id).collection('activity').orderBy('at','desc').limit(40).get()).docs.map(doc=>doc.data());
      const counts=Object.entries(data?.activityCounts || {}).map(([actor,total])=>({actor,total})).sort((a,b)=>b.total-a.total || a.actor.localeCompare(b.actor));
      return {recent,counts};
    },
    sameHash:(a,b)=>timingSafeEqual(Buffer.from(hash(a)),Buffer.from(hash(b)))
  };
}
