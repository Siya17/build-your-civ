import { applyAction, normalizeCode, isCodeShape, cascadeOf, priceOf, writableFields, fieldLimit, reflectionFields } from '../shared/game.js';
import { dictionary } from '../shared/i18n.js';
import { glossary } from '../shared/glossary.js';
import { credits } from '../shared/credits.js';
import { trees } from '../shared/cards.js';
import { worldMap } from '../shared/regions.js';
import { steps, stepById, stepDone, stepAvailable, nextStep, neighbourStep, stepApplies, teamStep, chapterOf } from '../shared/flow.js';
import { studentPage } from './screens.js';
import { teacherPage, teacherList, teacherDetailView, teacherPrint, posterOverlay, revealPanel, missingLetters } from './teacher.js';
import { blocker } from './tree.js';
import { esc, fmt, rich, plain, photo } from './ui.js';
import { printPosters } from './printing.js';
import { ClassroomStream } from './realtime.js';

const app=document.querySelector('#app');
const noticeBox=document.querySelector('#notice');
const skipLink=document.querySelector('#skip-link');
const pop=document.querySelector('#term-pop');
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
const narrow=window.matchMedia('(max-width: 760px)');
let lang=localStorage.getItem('civ_lang')==='ja'?'ja':'en';
let session=null,team=null,roster=[],teams=[],stream=null,authMode='student',notice='',noticeType='info',sync='saved',reveal=false;
let teacherDetail=null,teacherDetailId=null,showPoster=false;
let presenceFields={},presenceSent=null,popOwner=null;
// serverTeam is the last state the server confirmed. team is what the page shows: that state
// with this student's unconfirmed actions on top, so a click answers at once. Dice actions
// are never guessed: the page waits for the server's roll.
let serverTeam=null,pending=[],actionQueue=Promise.resolve();
let sessionEpoch=0;
const answerDrafts=new Map(),saveTimers=new Map(),savingFields=new Map();
// Page-only state: the current step, an open card or roll screen, the option picked in the
// event, a die that is rolling or landing, and cards to highlight after a pick.
const ui={step:'intro1',sub:null,selected:'',rolling:null,anim:null,flash:null};
let seen=new Set();
let navigating=false;
// Older databases may lack a readable code; keep newly issued codes on this device too.
const codeStore={
  read(){try{return new Map(JSON.parse(sessionStorage.getItem('civ_codes')||'[]'))}catch{return new Map()}},
  save(map){try{sessionStorage.setItem('civ_codes',JSON.stringify([...map]))}catch{}}
};
let newCodes=codeStore.read();
const L=()=>dictionary[lang];
const submitted=()=>!!team?.submittedAt;
const wait=ms=>new Promise(done=>setTimeout(done,ms));
function toast(message,type='info'){notice=message;noticeType=type;renderNotice();setTimeout(()=>{if(notice===message){notice='';renderNotice()}},4600)}
function renderNotice(){noticeBox.innerHTML=notice?`<div class="toast ${noticeType}">${rich(notice,lang,{terms:false})}</div>`:''}
// Refusals carry a code; the page shows them in the student's language.
const message=error=>L().errors?.[error.code]??L()[error.code]??error.message??L().error;
async function api(path,body,method){
  const res=await fetch(path,{method:method||(body===undefined?'GET':'POST'),headers:body===undefined&&!method?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin'});
  const data=await res.json();
  if(!res.ok)throw Object.assign(new Error(data.error||L().error),{code:data.code,gaps:data.gaps,status:res.status,team:data.team});
  return data;
}

// ---- Reading screens remembered on this device ---------------------------------------
const seenKey=()=>team?`civ_seen:${team.id}:${team.createdAt}`:'';
function loadSeen(){try{seen=new Set(JSON.parse(localStorage.getItem(seenKey())||'[]'))}catch{seen=new Set()}}
function saveSeen(){try{localStorage.setItem(seenKey(),JSON.stringify([...seen]))}catch{}}
const stepKey=()=>team?`civ_step:${team.id}:${team.createdAt}`:'';
function storeStep(){try{sessionStorage.setItem(stepKey(),ui.step)}catch{}}
function firstStep(){
  let stored='';try{stored=sessionStorage.getItem(stepKey())||''}catch{}
  return stored&&stepById[stored]&&stepApplies(stored,team)&&stepAvailable(stored,team,seen,reveal)?stored:nextStep(team,seen,reveal).id;
}

async function boot(){
  try{const data=await api('/api/me');adopt(data);if(session?.role==='student'){loadSeen();ui.step=firstStep()}render();if(data.authenticated)openStream()}
  catch(error){app.innerHTML=`<div class="fatal">${esc(error.message)}</div>`}
}
function adopt(data){
  clearStudentWork();
  session=data.authenticated?{role:data.role,name:data.name}:null;
  if(data.team){serverTeam=null;pending=[];adoptTeam(data.team)}
  if(data.roster)roster=data.roster;
  if(data.teams)teams=data.teams;
  if(data.presence)presenceFields=data.presence;
  if(typeof data.reveal==='boolean')reveal=data.reveal;
}
function clearStudentWork(){
  sessionEpoch++;
  for(const timer of saveTimers.values())clearTimeout(timer);
  saveTimers.clear();savingFields.clear();answerDrafts.clear();pending=[];actionQueue=Promise.resolve();presenceSent=null;
  ui.sub=null;ui.selected='';ui.rolling=null;ui.anim=null;ui.flash=null;
}
function projected(){
  let state=serverTeam.state;
  for(const payload of pending){try{state=applyAction(state,payload)}catch{}}
  return {...serverTeam,state};
}
function adoptTeam(incoming){
  if(!serverTeam||incoming.version>=serverTeam.version)serverTeam=incoming;
  team=projected();
}

function openStream(){
  stream?.close();stream=new ClassroomStream();
  stream.onopen=()=>{sync='saved';updateSync()};
  stream.onerror=()=>{sync='offline';updateSync()};
  stream.addEventListener('presence',event=>{const data=JSON.parse(event.data);roster=data.roster;presenceFields=data.fields;updatePresence()});
  stream.addEventListener('revoked',event=>{
    const reason=JSON.parse(event.data||'{}').reason;
    stream?.close();stream=null;clearStudentWork();session=null;team=null;serverTeam=null;roster=[];presenceFields={};teacherDetail=null;teacherDetailId=null;showPoster=false;
    render();if(reason!=='logout')toast(L().revoked,'error');
  });
  stream.addEventListener('team',onTeamEvent);
  stream.addEventListener('reveal',event=>{
    const open=JSON.parse(event.data).reveal;if(open===reveal)return;reveal=open;
    if(session?.role==='teacher'){patchTeacher();return}
    if(session?.role==='student'){
      if(!reveal&&chapterOf(ui.step)==='reveal'){
        // Keep unfinished drafts while immediately returning to the teacher gate.
        ui.step='wait';ui.sub=null;storeStep();render();
      } else render();
    }
  });
  stream.addEventListener('teams',event=>{
    teams=JSON.parse(event.data).teams;
    if(session?.role!=='teacher')return;
    if(teacherDetailId){
      const updated=teams.find(x=>x.id===teacherDetailId);
      if(!updated){teacherDetail=null;teacherDetailId=null;showPoster=false}
      else if(teacherDetail&&updated.version>=teacherDetail.version)teacherDetail={...teacherDetail,...updated};
    }
    patchTeacher();
  });
}

// A teammate's change never throws away text this student is still writing.
function onTeamEvent(event){
  const data=JSON.parse(event.data);roster=data.roster??roster;
  if(!(data.team.version>Number(serverTeam?.version??-1)))return;
  const previous=team;adoptTeam(data.team);
  if(previous?.submittedAt&&!team.submittedAt&&chapterOf(ui.step)==='reveal'){
    ui.step=teamStep(team,reveal).id;ui.sub=null;storeStep();
  }
  // A teammate rolled the event while this student watched the roll screen.
  if(!previous?.state.event&&team.state.event&&ui.step==='eventRoll'&&!ui.rolling)landDie('event');
  if(!previous?.state.event&&team.state.event&&['techTree','techReview','civicTree','civicReview'].includes(ui.step)){
    ui.sub=null;ui.selected='';ui.step='eventRoll';storeStep();landDie('event');
  } else if(!stepApplies(ui.step,team)){ui.step=nextStep(team,seen,reveal).id;storeStep()}
  render();
  if(data.by&&data.by!==session?.name&&fingerprint(previous)!==fingerprint(team))toast(L().updated,'warn');
}
const fingerprint=x=>JSON.stringify(x&&[x.state.mapPoint,x.state.tech,x.state.civic,x.state.rolls,x.state.event,x.state.government,x.state.economy,x.state.beliefs,x.submittedAt]);

function updateSync(){for(const el of document.querySelectorAll('#sync')){el.textContent=sync==='offline'?L().reconnecting:sync==='saving'?L().saving:L().save;el.className=`sync ${sync}`}}
function updatePresence(){
  for(const el of document.querySelectorAll('[data-presence]')){
    const names=(presenceFields[el.dataset.presence]||[]).filter(name=>name!==session?.name);
    el.textContent=names.length?fmt(L().writingHere,names.join(', ')):'';
  }
}

// ---- Rendering ------------------------------------------------------------------------
function captureFocus(){
  const el=document.activeElement;
  if(!el||el===document.body||!app.contains(el))return null;
  const key=['field','card','preview','act','nav','select','action','mode','term','sub'].find(name=>el.dataset?.[name]!==undefined);
  if(!key)return el.id?{id:el.id}:null;
  return {key:[`data-${key}`,el.dataset[key]],selection:typeof el.selectionStart==='number'?[el.selectionStart,el.selectionEnd]:null};
}
function restoreFocus(saved){
  if(!saved)return;
  const el=saved.id?document.getElementById(saved.id):document.querySelector(`[${saved.key[0]}="${CSS.escape(saved.key[1])}"]`);
  if(!el||el.disabled)return;
  el.focus({preventScroll:true});
  if(saved.selection&&typeof el.setSelectionRange==='function'){try{el.setSelectionRange(saved.selection[0],saved.selection[1])}catch{}}
}
function collectDrafts(){
  const drafts=new Map(answerDrafts);
  for(const el of document.querySelectorAll('[data-field]'))if(saveTimers.has(el.dataset.field)||document.activeElement===el)drafts.set(el.dataset.field,el.value);
  return drafts;
}
function restoreDrafts(drafts){for(const [key,value] of drafts){const el=document.querySelector(`[data-field="${key}"]`);if(el&&el.value!==value)el.value=value}}
// Replace only what changed. A text box is never replaced (its text belongs to the student),
// and open <details> stay open.
const holdsField=node=>node.nodeType===1&&(node.matches('[data-field]')||!!node.querySelector('[data-field]'));
function morphNode(was,node){
  if(was.isEqualNode(node))return;
  if(was.nodeType===1&&node.nodeType===1&&was.tagName===node.tagName&&(holdsField(was)&&holdsField(node))){
    if(was.matches('[data-field]')){if(was.dataset.field===node.dataset.field){
      was.disabled=node.disabled;
      if(document.activeElement!==was&&!answerDrafts.has(was.dataset.field)&&!saveTimers.has(was.dataset.field))was.value=node.value;
      return;
    }}
    else{
      for(const a of [...was.attributes])if(!node.hasAttribute(a.name))was.removeAttribute(a.name);
      for(const a of [...node.attributes])if(was.getAttribute(a.name)!==a.value)was.setAttribute(a.name,a.value);
      morphChildren(was,[...node.childNodes]);return;
    }
  }
  was.replaceWith(node);
}
function morphChildren(container,fresh){
  const old=[...container.childNodes];
  if(fresh.length!==old.length){container.replaceChildren(...fresh);return}
  fresh.forEach((node,i)=>morphNode(old[i],node));
}
function morph(container,html){
  if(!container)return;
  const next=document.createElement('template');next.innerHTML=html;
  const oldDetails=container.querySelectorAll('details'),newDetails=next.content.querySelectorAll('details');
  if(oldDetails.length===newDetails.length)newDetails.forEach((d,i)=>{d.open=oldDetails[i].open});
  morphChildren(container,[...next.content.childNodes]);
}
const studentContext=()=>({team,lang,L:L(),ui,step:ui.step,seen,reveal,sync,roster,compact:narrow.matches,teamStepId:teamStep(team,reveal).id,rolling:ui.rolling,anim:ui.anim,flash:ui.flash});
const teacherContext=()=>({L:L(),lang,teams,detail:teacherDetail,newCodes,reveal});
function render(){
  closeTerm(false);
  document.documentElement.lang=lang;
  skipLink.textContent=L().skip;skipLink.hidden=!session;
  const focus=captureFocus(),drafts=collectDrafts();
  morph(app,!session?authPage():session.role==='teacher'?teacherPage(teacherContext(),topbar())+(showPoster&&teacherDetail?posterOverlay(teacherContext()):''):studentPage(studentContext()));
  if(session?.role==='student'&&ui.rolling)for(const el of app.querySelectorAll('button,input,textarea,select'))el.disabled=true;
  if(session?.role==='student'&&navigating)for(const el of app.querySelectorAll('[data-nav]'))el.disabled=true;
  restoreDrafts(drafts);updatePresence();restoreFocus(focus);
}
function patchTeacher(){
  if(showPoster){render();return}
  const focus=captureFocus(),ctx=teacherContext();
  const list=document.querySelector('#teacher-list');if(list)morph(list,teacherList(ctx));
  const extra=document.querySelector('.create-panel .letter-teams'),missing=missingLetters(teams);
  if(extra&&!missing)extra.remove();else if(extra)extra.textContent=`${L().addLetterTeams} (${missing})`;
  const right=document.querySelector('#teacher-right');if(right)morph(right,teacherDetail?teacherDetailView(ctx):`<div class="panel teacher-welcome"><p>✦ ${L().studentWork}</p></div>`);
  const panel=document.querySelector('#reveal-panel');if(panel)morph(panel,revealPanel(ctx));
  const printPanel=document.querySelector('#class-print');if(printPanel)morph(printPanel,teacherPrint(ctx));
  restoreFocus(focus);
}
function topbar(){return `<header class="topbar"><div class="brand"><span aria-hidden="true">✦</span> ${L().brand}</div><div class="top-actions"><button type="button" class="lang" data-action="language">${L().language}</button><button type="button" class="text-button" data-action="logout">${L().signout}</button></div></header>`}
function authPage(){
  const t=L();
  return `<div class="auth-page"><img class="auth-map" src="${worldMap.image}" alt="" /><header class="topbar plain"><div class="brand"><span aria-hidden="true">✦</span> ${t.brand}</div><button type="button" class="lang" data-action="language">${t.language}</button></header>
  <section class="auth-hero"><div class="auth-copy"><p class="eyebrow">GAME · ゲーム</p><h1>${rich(t.welcome,lang)}</h1><p class="tagline">${rich(t.tagline,lang)}</p><p>${rich(t.intro,lang)}</p></div>
  <div class="auth-card"><div class="auth-tabs" role="tablist"><button type="button" role="tab" aria-selected="${authMode==='student'}" class="${authMode==='student'?'active':''}" data-mode="student">${t.join}</button><button type="button" role="tab" aria-selected="${authMode==='teacher'}" class="${authMode==='teacher'?'active':''}" data-mode="teacher">${t.teacher}</button></div>
  <form id="auth-form">${authMode==='student'?`<label>${t.code}<input name="code" autocomplete="off" required maxlength="24" placeholder="A-427" class="code-input" /></label><label>${t.name}<input name="name" autocomplete="off" required maxlength="60" /></label>`:`<label>${t.password}<input name="password" type="password" autocomplete="off" required /></label>`}
  ${authMode==='student'?`<p class="typing-note">✎ ${rich(t.typing,lang)}</p>`:''}<button class="btn primary full" type="submit">${authMode==='student'?t.enter:t.teacherEnter} <span aria-hidden="true">→</span></button></form></div></section></div>`;
}

// ---- Moving between screens -----------------------------------------------------------
const canTransition=()=>typeof document.startViewTransition==='function'&&!reducedMotion.matches;
async function transition(direction,change){
  const swap=()=>{change();render();window.scrollTo({top:0})};
  if(canTransition()){
    document.documentElement.dataset.nav=direction;
    try{await document.startViewTransition(swap).finished}catch{}
  } else {
    swap();
    const main=document.querySelector('#main');
    if(main&&!reducedMotion.matches){main.classList.add(`enter-${direction}`);setTimeout(()=>main.classList.remove(`enter-${direction}`),400)}
  }
  document.querySelector('#screen-title')?.focus({preventScroll:true});
}
async function go(step,{direction='forward'}={}){
  try{await actionQueue;await flushAll()}catch{return false}
  if(!team||!stepById[step]||(chapterOf(step)==='reveal'&&!reveal))return false;
  await transition(direction,()=>{ui.step=step;ui.sub=null;ui.selected='';storeStep()});
  // Chapter labels in the page provide orientation without obscuring the reading.
}
async function goNext(){
  try{await actionQueue;await flushAll()}catch{return}
  if(stepById[ui.step].kind==='seen'){seen.add(ui.step);saveSeen()}
  if(!stepDone(ui.step,team,seen,reveal))return;
  const next=neighbourStep(ui.step,team,1);
  if(next)go(next);
}
async function navigate(target){
  if(navigating)return;
  navigating=true;render();
  try{
  if(target==='next')return await goNext();
  if(target==='back'){const prev=neighbourStep(ui.step,team,-1);if(prev)await go(prev,{direction:'back'});return}
  if(target==='team'){
    const goal=teamStep(team,reveal).id,index=steps.findIndex(step=>step.id===goal);
    for(const step of steps.slice(0,index))if(step.kind==='seen')seen.add(step.id);
    saveSeen();await go(goal);return;
  }
  const [kind,id]=target.split(':');
  const goal=kind==='chapter'?steps.find(step=>step.chapter===id&&stepApplies(step.id,team))?.id:id;
  if(!goal||!stepAvailable(goal,team,seen,reveal))return;
  const forward=steps.findIndex(step=>step.id===goal)>steps.findIndex(step=>step.id===ui.step);
  await go(goal,{direction:forward?'forward':'back'});
  }finally{navigating=false;render()}
}
function openSub(sub){transition('forward',()=>{ui.sub=sub})}
function closeSub(){transition('back',()=>{ui.sub=null})}
// Light up the card just added and the cards it opened, for a moment.
function flash(added,before){
  const tree=added.tree;
  const opened=trees[tree].filter(card=>!team.state[tree].includes(card.id)&&blocker(before,tree,card.id)==='parent'&&blocker(team.state,tree,card.id)!=='parent').map(card=>card.id);
  ui.flash={added:added.id,unlocked:opened};
  setTimeout(()=>{if(ui.flash?.added===added.id){ui.flash=null;render()}},1600);
}
function landDie(key){
  if(reducedMotion.matches){ui.anim=null;return}
  ui.anim={key};setTimeout(()=>{if(ui.anim?.key===key){ui.anim=null;render()}},1150);
}

// ---- Team actions ---------------------------------------------------------------------
// Optimistic: the shared rules run here first; requests go out one at a time, in order.
function act(payload){
  if(!team)return actionQueue;
  const epoch=sessionEpoch;
  let next;
  try{next=applyAction(team.state,payload)}catch(error){toast(message(error),'error');return Promise.reject(error)}
  pending.push(payload);team={...team,state:next};render();
  sync='saving';updateSync();
  const operation=actionQueue.then(async()=>{
    if(epoch!==sessionEpoch)return;
    try{
      await flushAll();
      if(epoch!==sessionEpoch)return;
      const data=await api('/api/team/action',payload);
      if(epoch!==sessionEpoch)return;
      pending.splice(pending.indexOf(payload),1);roster=data.roster;
      const shown=team;adoptTeam(data.team);
      if(!pending.length){sync='saved';updateSync()}
      if(JSON.stringify(shown.state)!==JSON.stringify(team.state))render();
    }catch(error){
      if(epoch!==sessionEpoch)return;
      pending.splice(pending.indexOf(payload),1);
      if(error.team)adoptTeam(error.team);
      team=projected();sync='saved';updateSync();render();toast(message(error),'error');
      throw error;
    }
  });
  actionQueue=operation.catch(()=>{});return operation;
}
// Rolls a die on the server. The page checks every rule first, then waits for the roll.
function rollOnServer(payload){
  const epoch=sessionEpoch;
  try{applyAction(team.state,payload)}catch(error){if(!error.needsDie){toast(message(error),'error');return Promise.reject(error)}}
  sync='saving';updateSync();
  const operation=actionQueue.then(async()=>{
    if(epoch!==sessionEpoch)return;
    try{await flushAll();if(epoch!==sessionEpoch)return;const data=await api('/api/team/action',payload);if(epoch!==sessionEpoch)return;roster=data.roster;adoptTeam(data.team)}
    catch(error){
      if(epoch!==sessionEpoch)return;
      if(error.team)adoptTeam(error.team);
      const rolled=payload.type==='eventRoll'?team.state.event:team.state.rolls[payload.id]&&
        (payload.type==='eventGain'?team.state.event?.gained.includes(payload.id):payload.type==='pick'?team.state[payload.tree]?.includes(payload.id):true);
      if(error.status===409&&rolled){toast(L().alreadyRolledByTeammate);return}
      toast(message(error),'error');throw error;
    }
    finally{if(epoch===sessionEpoch){sync='saved';updateSync()}}
  });
  actionQueue=operation.catch(()=>{});return operation;
}
async function withDie(rolling,payload,landKey){
  if(ui.rolling)return false;
  const epoch=sessionEpoch;
  ui.rolling=rolling;render();
  const started=Date.now();
  try{await rollOnServer(payload)}catch{ui.rolling=null;render();return false}
  if(epoch!==sessionEpoch)return false;
  if(!reducedMotion.matches)await wait(Math.max(0,750-(Date.now()-started)));
  if(epoch!==sessionEpoch)return false;
  ui.rolling=null;landDie(landKey);render();return true;
}
async function doAct(value){
  const [kind,a,b]=value.split(':'),state=team.state;
  if(kind==='add'){
    const tree=a,id=b;
    if(priceOf(state.mapPoint,id)==='hard'&&!state.rolls[id]){
      await transition('forward',()=>{ui.sub={kind:'roll',tree,id}});
      await withDie({kind:'card',id},{type:'pick',tree,id},`card:${id}`);
      return;
    }
    const before=state;
    try{const op=act({type:'pick',tree,id});ui.sub=null;flash({tree,id},before);await transition('back',()=>{});await op}catch{}
  } else if(kind==='remove'){
    const cascade=cascadeOf(state,a,b).filter(id=>id!==b);
    try{const op=act({type:'unpick',tree:a,id:b,cascade});await transition('back',()=>{ui.sub=null});await op}catch{}
  } else if(kind==='cardRoll'){
    const tree=state.tech.includes(a)?'tech':'civic';
    await transition('forward',()=>{ui.sub={kind:'roll',tree,id:a}});
    await withDie({kind:'card',id:a},{type:'cardRoll',id:a},`card:${a}`);
  } else if(kind==='rollEvent'){
    await withDie({kind:'event'},{type:'eventRoll',confirm:{tech:[...state.tech],civic:[...state.civic]}},'event');
  } else if(kind==='choice'){
    act({type:'eventChoice',choice:a}).catch(()=>{});
  } else if(kind==='lose'){
    ui.selected='';act({type:'eventLose',tree:a,id:b,index:state.event.lost.length}).catch(()=>{});
  } else if(kind==='gain'){
    ui.selected='';
    const payload={type:'eventGain',tree:a,id:b,index:state.event.gained.length};
    if(priceOf(state.mapPoint,b)==='hard'&&!state.rolls[b])await withDie({kind:'gain',id:b},payload,`gain:${b}`);
    else act(payload).catch(()=>{});
  } else if(kind==='chip'){
    const on=a==='economy'?!state.economy.includes(b):true;
    act({type:'chip',key:a,value:a==='economy'?b:(state[a]===b?'':b),on}).catch(()=>{});
  } else if(kind==='map'){
    act({type:'map',point:a}).catch(()=>{});
  } else if(kind==='submit'){
    try{await actionQueue;await flushAll();const data=await api('/api/team/submit',{});adoptTeam(data.team);roster=data.roster;render();toast(`✓ ${L().submitted}`)}
    catch(error){toast(message(error),'error')}
  } else if(kind==='tool'){
    ui.markTool=a;render();
  } else if(kind==='mark'){
    // Tapping a card again with the same marker clears it; marks are shared with the team.
    const tool=ui.markTool||'easy';
    act({type:'predict',id:a,mark:state.predictions?.[a]===tool?'':tool}).catch(()=>{});
  } else if(kind==='submitReflection'){
    try{await actionQueue;await flushAll();const data=await api('/api/team/reflection/submit',{expectedVersion:team.version});adoptTeam(data.team);roster=data.roster;render();toast(`✓ ${L().reflectionComplete}`)}
    catch(error){if(error.team)adoptTeam(error.team);render();toast(message(error),'error')}
  }
}

// ---- Answers --------------------------------------------------------------------------
function fieldInput(el){
  const key=el.dataset.field;answerDrafts.set(key,el.value);sync='saving';updateSync();
  const count=document.querySelector(`[data-count-for="${key}"]`);if(count)count.textContent=fmt(L().charsLeft,fieldLimit(key)-el.value.length);
  clearTimeout(saveTimers.get(key));saveTimers.set(key,setTimeout(()=>saveField(key,answerDrafts.get(key)).catch(()=>{}),650));
}
function saveField(key,value){
  const epoch=sessionEpoch;
  clearTimeout(saveTimers.get(key));saveTimers.delete(key);
  const request=(savingFields.get(key)||Promise.resolve()).catch(()=>{}).then(async()=>{
    if(epoch!==sessionEpoch)return;
    try{
      const data=await api('/api/team/action',{type:reflectionFields.includes(key)?'reflectionAnswer':'field',key,value});if(epoch!==sessionEpoch)return;adoptTeam(data.team);roster=data.roster;
      if(answerDrafts.get(key)===value)answerDrafts.delete(key);
      sync=answerDrafts.size?'saving':'saved';updateSync();
      // The Next button depends on whether the answer is filled.
      const nextButton=document.querySelector('[data-nav="next"]');if(nextButton)nextButton.disabled=!!ui.rolling||!stepDone(ui.step,team,seen,reveal);
    }catch(error){
      if(epoch!==sessionEpoch)return;
      sync=error.code==='submitted'?'saved':'offline';updateSync();
      const hint=error.code==='submitted'?L().submittedSaveFailed:reflectionFields.includes(key)&&['reflectionClosed','reflectionSubmitted','reflectionNeedsSubmission'].includes(error.code)?L().reflectionSaveFailed:L().saveFailed;
      toast(hint,'error');throw new Error(hint,{cause:error});
    }
  });
  savingFields.set(key,request);
  request.finally(()=>{if(savingFields.get(key)===request)savingFields.delete(key)}).catch(()=>{});
  return request;
}
const blockedReflection=key=>reflectionFields.includes(key)&&(!submitted()||!reveal||!!team.state.reflection?.submittedAt);
async function flushField(key){if(blockedReflection(key))return;if(answerDrafts.has(key))await saveField(key,answerDrafts.get(key));else if(savingFields.has(key))await savingFields.get(key)}
async function flushAll(){
  for(const timer of saveTimers.values())clearTimeout(timer);saveTimers.clear();
  await Promise.all([...savingFields].map(([key,request])=>request.catch(error=>{if(!blockedReflection(key))throw error})));
  // Closed historical drafts stay on this device without trapping the student here.
  for(const [key,value] of [...answerDrafts])if(!blockedReflection(key))await saveField(key,value);
}
async function postPresence(field){if(presenceSent===field)return;presenceSent=field;try{await api('/api/team/presence',{field})}catch{}}

// ---- Glossary popover -----------------------------------------------------------------
function openTerm(button){
  const entry=glossary[button.dataset.term];if(!entry||entry.popup?.[lang]===false)return;
  if(popOwner===button){closeTerm();return}
  closeTerm(false);
  const [term,definition]=entry[lang];
  pop.innerHTML=`<div class="pop-card" role="dialog" aria-labelledby="pop-title"><button type="button" class="pop-close" data-pop-close aria-label="${esc(L().close)}">×</button><h2 id="pop-title">${rich(term,lang,{terms:false})}</h2><p>${rich(definition,lang,{terms:false})}</p>${entry.img&&credits[entry.img]?photo(entry.img,plain(term),{eager:true}):''}</div>`;
  pop.hidden=false;popOwner=button;button.setAttribute('aria-expanded','true');
  if(!narrow.matches){
    const box=button.getBoundingClientRect(),card=pop.firstElementChild,width=Math.min(340,window.innerWidth-32);
    const left=Math.min(Math.max(16,box.left+box.width/2-width/2),window.innerWidth-width-16);
    const below=box.bottom+10+card.offsetHeight<window.innerHeight;
    pop.style.left=`${left}px`;pop.style.width=`${width}px`;
    pop.style.top=below?`${box.bottom+10}px`:`${Math.max(16,box.top-10-card.offsetHeight)}px`;
  } else {pop.style.left='';pop.style.top='';pop.style.width=''}
  pop.querySelector('[data-pop-close]').focus({preventScroll:true});
}
function closeTerm(returnFocus=true){
  if(pop.hidden)return;
  pop.hidden=true;pop.innerHTML='';
  const owner=popOwner;popOwner=null;owner?.setAttribute('aria-expanded','false');
  if(returnFocus){if(owner?.isConnected)owner.focus({preventScroll:true});else document.querySelector('#screen-title')?.focus({preventScroll:true})}
}
pop.addEventListener('click',event=>{if(event.target.closest('[data-pop-close]'))closeTerm()});
document.addEventListener('click',event=>{if(!pop.hidden&&!pop.contains(event.target)&&!event.target.closest('[data-term]'))closeTerm(false)});

// ---- Teacher --------------------------------------------------------------------------
async function teacherAction(id){
  if(id.startsWith('review:')){
    teacherDetailId=Number(id.split(':')[1]);showPoster=false;
    const [detail,activity]=await Promise.all([api(`/api/teacher/teams/${teacherDetailId}`),api(`/api/teacher/teams/${teacherDetailId}/activity`)]);
    teacherDetail={...detail.team,roster:detail.roster,joined:detail.joined,activity};patchTeacher();
    document.querySelector('#teacher-right')?.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'start'});
  } else if(id==='close-detail'){teacherDetail=null;teacherDetailId=null;patchTeacher()}
  else if(id==='poster'){showPoster=true;render();document.querySelector('.poster-overlay [data-action="close-poster"]')?.focus()}
  else if(id==='close-poster'){showPoster=false;if(document.fullscreenElement)document.exitFullscreen().catch(()=>{});render()}
  else if(id.startsWith('reveal:')){const data=await api('/api/teacher/reveal',{reveal:id==='reveal:on'});reveal=data.reveal;patchTeacher()}
  else if(id.startsWith('code:')){
    const teamId=Number(id.split(':')[1]);if(!confirm(L().codeWarning))return;
    const data=await api(`/api/teacher/teams/${teamId}/new-code`,{});
    teams=teams.map(x=>x.id===teamId?{...x,code:data.code}:x);newCodes.delete(teamId);codeStore.save(newCodes);patchTeacher();
  } else if(id==='letter-teams'){const data=await api('/api/teacher/letter-teams',{});teams=data.teams;render();toast(fmt(L().lettersAdded,data.made))}
  else if(id.startsWith('reopen:')){
    const teamId=Number(id.split(':')[1]);if(!confirm(L().reopenWarning))return;
    const data=await api(`/api/teacher/teams/${teamId}/reopen`,{});
    teams=teams.map(x=>x.id===teamId?data.team:x);teacherDetail={...teacherDetail,...data.team};patchTeacher();
  } else if(id.startsWith('reopen-reflection:')){
    const teamId=Number(id.split(':')[1]);if(!confirm(L().reflectionReopenWarning))return;
    const data=await api(`/api/teacher/teams/${teamId}/reopen-reflection`,{});
    teams=teams.map(x=>x.id===teamId?data.team:x);teacherDetail={...teacherDetail,...data.team};patchTeacher();
  } else if(id.startsWith('delete:')){
    const teamId=Number(id.split(':')[1]);if(!confirm(L().deleteWarning))return;
    const data=await api(`/api/teacher/teams/${teamId}`,{},'DELETE');
    teams=data.teams;newCodes.delete(teamId);codeStore.save(newCodes);
    if(teacherDetailId===teamId){teacherDetail=null;teacherDetailId=null;showPoster=false}
    render();toast(L().deleted);
  } else if(id==='print-all'){
    await printPosters(teams.filter(item=>item.submittedAt),lang,L());
  }
}
async function onAction(el){
  const id=el.dataset.action;
  try{
    if(id==='language'){await actionQueue;await flushAll();lang=lang==='en'?'ja':'en';localStorage.setItem('civ_lang',lang);render()}
    else if(id==='logout'){
      await actionQueue;await flushAll();answerDrafts.clear();await api('/api/logout',{});stream?.close();stream=null;
      clearStudentWork();session=null;team=null;serverTeam=null;teacherDetail=null;teacherDetailId=null;showPoster=false;presenceFields={};render();
    }
    else if(id==='fullscreen'){
      const target=document.querySelector('#poster-wrap');
      if(document.fullscreenElement)await document.exitFullscreen();else await target?.requestFullscreen?.();
    }
    else if(id==='print'){
      await actionQueue;await flushAll();
      if(document.fullscreenElement)await document.exitFullscreen();
      await printPosters([session?.role==='teacher'?teacherDetail:team].filter(Boolean),lang,L());
    }
    else await teacherAction(id);
  }catch(error){toast(message(error),'error')}
}
async function authSubmit(event){
  event.preventDefault();const form=new FormData(event.target);
  try{
    let body;
    if(authMode==='student'){
      const code=normalizeCode(form.get('code'));
      if(!isCodeShape(code)){toast(L().codeShape,'error');return}
      body={name:form.get('name'),code};
    } else body={password:form.get('password')};
    const data=await api(authMode==='student'?'/api/auth/team':'/api/auth/teacher',body);
    adopt(data);if(session.role==='student'){loadSeen();ui.step=firstStep()}render();openStream();
    document.querySelector('#screen-title,#main')?.focus({preventScroll:true});
  }catch(error){toast(message(error),'error')}
}
async function createTeamSubmit(event){
  event.preventDefault();const form=event.target,dataFields=new FormData(form);
  try{
    const data=await api('/api/teacher/teams',{name:dataFields.get('teamName'),point:dataFields.get('point')||''});
    newCodes.set(data.team.id,data.team.code);codeStore.save(newCodes);
    teams=teams.filter(x=>x.id!==data.team.id).concat(data.team);
    form.reset();patchTeacher();
  }catch(error){toast(message(error),'error')}
}
async function renameSubmit(event){
  event.preventDefault();const name=new FormData(event.target).get('teamName');
  try{
    const data=await api(`/api/teacher/teams/${teacherDetailId}`,{name},'PATCH');
    teams=teams.map(x=>x.id===data.team.id?{...x,...data.team}:x);
    teacherDetail={...teacherDetail,...data.team};patchTeacher();
  }catch(error){toast(message(error),'error')}
}

// ---- Events (delegated once on the page) ----------------------------------------------
app.addEventListener('click',event=>{
  const el=event.target.closest('[data-term],[data-nav],[data-act],[data-card],[data-preview],[data-sub],[data-select],[data-action],[data-mode]');
  if(!el||el.disabled)return;
  const d=el.dataset;
  if(session?.role==='student'&&ui.rolling)return;
  if(d.term!==undefined){openTerm(el);return}
  if(d.action!==undefined){onAction(el);return}
  if(d.mode!==undefined){authMode=d.mode;render();return}
  if(!team)return;
  if(d.nav!==undefined)navigate(d.nav);
  else if(d.act!==undefined)doAct(d.act);
  else if(d.card!==undefined){const [tree,id]=d.card.split(':');openSub({kind:'card',tree,id})}
  else if(d.preview!==undefined){const [tree,id]=d.preview.split(':');openSub({kind:'preview',tree,id})}
  else if(d.sub==='close')closeSub();
  else if(d.select!==undefined){ui.selected=d.select;render()}
});
// Keep a coloured panel in place of a photo that cannot be loaded.
app.addEventListener('error',event=>{if(event.target.matches?.('img[data-photo]'))event.target.closest('figure')?.classList.add('failed')},true);
app.addEventListener('submit',event=>{
  if(event.target.id==='auth-form')authSubmit(event);
  else if(event.target.id==='create-team')createTeamSubmit(event);
  else if(event.target.id==='rename-team')renameSubmit(event);
});
app.addEventListener('input',event=>{
  const el=event.target;
  if(el.dataset?.field!==undefined)fieldInput(el);
  else if(el.classList?.contains('code-input')){const cleaned=el.value.toUpperCase().replace(/[^A-Z0-9 -]/g,'').slice(0,16);if(el.value!==cleaned)el.value=cleaned}
});
app.addEventListener('focusin',event=>{if([...writableFields,...reflectionFields].includes(event.target.dataset?.field))postPresence(event.target.dataset.field)});
// Short definitions float beside tree cards on hover or keyboard focus; a tap or click opens the
// full explanation. The tip lives outside the scrolling tree so its edges never clip it.
let floatTip=null;
function showTip(el){
  const text=el?.dataset?.tip;if(!text){hideTip();return}
  if(!floatTip){floatTip=document.createElement('div');floatTip.className='float-tip';floatTip.setAttribute('aria-hidden','true');document.body.append(floatTip)}
  floatTip.textContent=text;floatTip.hidden=false;
  const r=el.getBoundingClientRect(),w=floatTip.offsetWidth,h=floatTip.offsetHeight;
  const y=r.top-h-8<8?r.bottom+8:r.top-h-8;
  floatTip.style.left=`${Math.max(8,Math.min(window.innerWidth-w-8,r.left+r.width/2-w/2))}px`;floatTip.style.top=`${y}px`;
}
function hideTip(){if(floatTip)floatTip.hidden=true}
app.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;const el=event.target.closest?.('[data-tip]');if(el)showTip(el)});
app.addEventListener('pointerout',event=>{const el=event.target.closest?.('[data-tip]');if(el&&!el.contains(event.relatedTarget))hideTip()});
app.addEventListener('focusin',event=>{if(event.target.dataset?.tip)showTip(event.target)});
app.addEventListener('focusout',hideTip);
app.addEventListener('click',hideTip);
document.addEventListener('scroll',hideTip,true);
app.addEventListener('focusout',event=>{const key=event.target.dataset?.field;if(key!==undefined){flushField(key).catch(()=>{});postPresence(null)}});
document.addEventListener('keydown',event=>{
  if(event.key!=='Escape')return;
  if(!pop.hidden){closeTerm();return}
  if(showPoster&&!document.fullscreenElement){showPoster=false;render();return}
  if(ui.sub&&!ui.rolling&&session?.role==='student')closeSub();
});
narrow.addEventListener('change',()=>{if(session)render()});
reducedMotion.addEventListener('change',()=>{if(session)render()});

// Paste and drop stay blocked for team answers; copying work out is allowed.
const inField=target=>target instanceof Element&&target.matches('[data-field]');
function blockPaste(event){if(!inField(event.target))return;event.preventDefault();toast(L().pasteBlocked,'warn')}
document.addEventListener('paste',blockPaste,true);
document.addEventListener('drop',blockPaste,true);
document.addEventListener('beforeinput',e=>{if(inField(e.target)&&['insertFromPaste','insertFromDrop','insertFromYank'].includes(e.inputType))blockPaste(e)},true);
document.addEventListener('keydown',e=>{if(inField(e.target)&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='v')e.preventDefault()},true);
boot();
