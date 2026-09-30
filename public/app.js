import { trees, textFields, normalizeCode, isCodeShape, codeLength, questStatus, applyAction } from '/shared/game.js';
import { dictionary } from '/shared/i18n.js';
import { hexes, revealRadius } from '/shared/land.js';
import { renderStudentView, renderSummaryRows, renderSubmissionBox, renderQuestLog, chaptersMarkup, contentMarkup, sidebarMarkup, bannerMarkup, landStageMarkup, landInfoMarkup, landBuildingsMarkup, showsLand, cardStatus } from '/student-view.js';
import { landMarkup } from '/hexmap.js';

const app=document.querySelector('#app');
const noticeBox=document.querySelector('#notice');
const skipLink=document.querySelector('#skip-link');
let lang=localStorage.getItem('civ_lang')==='ja'?'ja':'en';
let session=null,team=null,roster=[],teams=[],stream=null,authMode='student',notice='',noticeType='info',teacherDetail=null,teacherDetailId=null,sync='saved';
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
let presenceFields={},presenceSent=null,scenePlaying=!reducedMotion.matches;
let saveTimers=new Map();
// serverTeam is the last state the server confirmed. team is what the page shows: that
// state with this student's unconfirmed actions applied on top, so a click answers at once.
let serverTeam=null,pending=[],actionQueue=Promise.resolve();
// Page-only state for the homeland map: which view the banner shows, the building being
// moved, and the hex being read.
const ui={banner:'land',selected:null,hover:null};
let shownKey='';
// A revealed join code exists nowhere else: the server keeps only its hash. Losing it to a
// page refresh would force a new code and cut off students who already have the old one.
const codeStore={
  read(){try{return new Map(JSON.parse(sessionStorage.getItem('civ_codes')||'[]'))}catch{return new Map()}},
  save(map){try{sessionStorage.setItem('civ_codes',JSON.stringify([...map]))}catch{}}
};
let newCodes=codeStore.read();
const L=()=>dictionary[lang];
const fmt=(template,value)=>String(template).replace('%s',value);
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const title=item=>lang==='ja'?item.ja:item.en;
const button=(text,action,cls='btn-primary')=>`<button class="${cls}" data-action="${action}">${text}</button>`;
const submitted=()=>!!team?.submittedAt;
function toast(message,type='info'){notice=message;noticeType=type;renderNotice();setTimeout(()=>{if(notice===message){notice='';renderNotice()}},4400)}
function renderNotice(){noticeBox.innerHTML=notice?`<div class="toast ${noticeType}">${esc(notice)}</div>`:''}
async function api(path,body,method){const res=await fetch(path,{method:method||(body===undefined?'GET':'POST'),headers:body===undefined&&!method?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin'});const data=await res.json();if(!res.ok)throw Object.assign(new Error(data.error||L().error),{gaps:data.gaps});return data}
async function boot(){try{const data=await api('/api/me');adopt(data);render();if(data.authenticated)openStream()}catch(error){app.innerHTML=`<div class="fatal">${esc(error.message)}</div>`}}
function adopt(data){session=data.authenticated?{role:data.role,name:data.name}:null;if(data.team){serverTeam=null;pending=[];adoptTeam(data.team)}if(data.roster)roster=data.roster;if(data.teams)teams=data.teams;if(data.presence)presenceFields=data.presence}
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
  stream?.close();stream=new EventSource('/api/events');
  stream.onopen=()=>{sync='saved';updateSync()};
  stream.onerror=()=>{sync='offline';updateSync()};
  stream.addEventListener('presence',event=>{const data=JSON.parse(event.data);roster=data.roster;presenceFields=data.fields;updateLiveBits();updatePresence()});
  stream.addEventListener('revoked',()=>{stream?.close();stream=null;session=null;team=null;serverTeam=null;pending=[];roster=[];presenceFields={};render();toast(L().revoked,'error')});
  stream.addEventListener('team',onTeamEvent);
  stream.addEventListener('teams',event=>{
    teams=JSON.parse(event.data).teams;
    if(session?.role!=='teacher')return;
    if(teacherDetailId){
      const updated=teams.find(x=>x.id===teacherDetailId);
      if(!updated){teacherDetail=null;teacherDetailId=null}
      else if(teacherDetail&&updated.version>=teacherDetail.version)teacherDetail={...teacherDetail,...updated};
    }
    patchTeacher();
  });
}

// A teammate's change must not throw away text the student is still writing, and must not
// blow away the whole page either. Structural changes re-render; a plain text edit is
// patched into the fields nobody is holding, and reported if it lands on one that is.
async function onTeamEvent(event){
  const data=JSON.parse(event.data);
  let incoming=data.team;
  roster=data.roster??roster;
  if(!(incoming.version>Number(serverTeam?.version??-1))){updateLiveBits();return}
  if(incoming.state.stage!==team?.state.stage&&saveTimers.size)await flushAll();
  const previous=team;
  adoptTeam(incoming);
  incoming=team;
  const stageChanged=previous?.state.stage!==incoming.state.stage;
  const structural=!previous||stageChanged||previous.submittedAt!==incoming.submittedAt||previous.name!==incoming.name
    ||previous.state.mapPoint!==incoming.state.mapPoint
    ||previous.state.tech.join()!==incoming.state.tech.join()
    ||previous.state.civic.join()!==incoming.state.civic.join()
    ||previous.state.avatar!==incoming.state.avatar
    ||!!previous.state.placeAnswer?.trim()!==!!incoming.state.placeAnswer?.trim()
    ||JSON.stringify(previous.state.events)!==JSON.stringify(incoming.state.events)
    ||JSON.stringify(previous.state.tiles)!==JSON.stringify(incoming.state.tiles);
  const held=[];
  if(!structural){
    for(const key of textFields){
      if(previous.state[key]===incoming.state[key])continue;
      const el=document.querySelector(`[data-field="${key}"]`);
      if(el&&(document.activeElement===el||saveTimers.has(key))&&el.value!==incoming.state[key])held.push(key);
    }
  }
  if(structural){render({prev:previous?.state,stageChange:stageChanged});patchFields([])}
  else{patchFields(held);updateLiveBits();updateSummary()}
  if(held.length&&data.by&&data.by!==session?.name)toast(fmt(L().changedField,data.by),'warn');
}
function patchFields(held){
  for(const el of document.querySelectorAll('[data-field]')){
    const key=el.dataset.field;
    el.disabled=submitted();
    if(held.includes(key)||saveTimers.has(key)||document.activeElement===el)continue;
    const next=team.state[key]??'';
    if(el.value!==next)el.value=next;
  }
}
function updateSync(){const el=document.querySelector('#sync');if(el)el.textContent=sync==='offline'?L().reconnecting:sync==='saving'?L().saving:L().save}
function updateLiveBits(){const el=document.querySelector('#roster');if(el)el.innerHTML=roster.map(n=>`<span>${esc(n)}</span>`).join('');updateSync()}
function updatePresence(){
  for(const el of document.querySelectorAll('[data-presence]')){
    const names=(presenceFields[el.dataset.presence]||[]).filter(name=>name!==session?.name);
    el.textContent=names.length?fmt(L().writingHere,names.join(', ')):'';
  }
}
function updateSummary(){
  const summary=document.querySelector('#summary');if(summary)summary.innerHTML=summaryRowsFor(team.state);
  const box=document.querySelector('#submission');if(box)box.innerHTML=submissionBoxBody();
  const quests=document.querySelector('#quest-log');if(quests)quests.outerHTML=renderQuestLog(team,L());
}

// Every render replaces the page, so remember where the keyboard was and put it back.
function captureFocus(){
  const el=document.activeElement;
  if(!el||el===document.body)return null;
  const data=el.dataset||{};
  const key=data.field?['data-field',data.field]:data.pick?['data-pick',data.pick]:data.map?['data-map',data.map]:data.avatar?['data-avatar',data.avatar]:data.event?['data-event',data.event]:data.building?['data-building',data.building]:data.tile?['data-tile',data.tile]:data.stage?['data-stage',data.stage]:data.action?['data-action',data.action]:data.mode?['data-mode',data.mode]:null;
  if(!key)return null;
  return {key,selection:typeof el.selectionStart==='number'?[el.selectionStart,el.selectionEnd]:null};
}
function restoreFocus(saved){
  if(!saved)return;
  const el=document.querySelector(`[${saved.key[0]}="${CSS.escape(saved.key[1])}"]`);
  if(!el||el.disabled)return;
  el.focus({preventScroll:true});
  if(saved.selection&&typeof el.setSelectionRange==='function'){try{el.setSelectionRange(saved.selection[0],saved.selection[1])}catch{}}
}
// Text a student has typed but not yet saved lives only in the textarea. Carry it across
// any re-render so a teammate's click can never wipe it.
function collectDrafts(){
  const drafts=new Map();
  for(const el of document.querySelectorAll('[data-field]'))if(saveTimers.has(el.dataset.field)||document.activeElement===el)drafts.set(el.dataset.field,el.value);
  return drafts;
}
function restoreDrafts(drafts){for(const [key,value] of drafts){const el=document.querySelector(`[data-field="${key}"]`);if(el&&el.value!==value)el.value=value}}
// Replace only the top-level blocks that changed. Answer boxes are never replaced (their
// text is patched by patchFields) and open <details> stay open.
function morph(container,html){
  if(!container)return;
  const next=document.createElement('template');next.innerHTML=html;
  const oldDetails=container.querySelectorAll('details'),newDetails=next.content.querySelectorAll('details');
  if(oldDetails.length===newDetails.length)newDetails.forEach((d,i)=>{d.open=oldDetails[i].open});
  const fresh=[...next.content.childNodes],old=[...container.childNodes];
  if(fresh.length!==old.length){container.replaceChildren(...fresh);return}
  fresh.forEach((node,i)=>{
    const was=old[i];
    if(was.isEqualNode(node))return;
    const field=node.querySelector?.('[data-field]'),kept=was.querySelector?.('[data-field]');
    if(field&&kept&&field.dataset.field===kept.dataset.field&&was.className===node.className){kept.disabled=field.disabled;return}
    was.replaceWith(node);
  });
}
const viewKey=()=>session?.role==='student'&&team?[team.state.stage,team.state.mapPoint,lang,showsLand(team.state,ui),!!team.submittedAt,team.name].join('|'):'';
const canViewTransition=()=>typeof document.startViewTransition==='function'&&!reducedMotion.matches;
function render(options={}){
  if(ui.selected&&!Number.isInteger(team?.state.tiles?.[ui.selected]))ui.selected=null;
  if(shownKey&&shownKey===viewKey()&&!options.full&&document.querySelector('#campaign-content')){patchStudent();celebrate(options.prev);return}
  const swap=()=>{
    const focus=captureFocus(),drafts=collectDrafts();
    document.documentElement.lang=lang;
    skipLink.textContent=L().skip;
    skipLink.hidden=!session;
    app.innerHTML=!session?authPage():session.role==='teacher'?teacherPage():renderStudentView({team,roster,lang,L:L(),topbar:topbar(),sync,playing:scenePlaying,animate:options.stageChange&&!canViewTransition(),ui});
    shownKey=viewKey();
    restoreDrafts(drafts);updatePresence();restoreFocus(focus);
    if(options.stageChange){const main=document.querySelector('#main');if(main&&main.getBoundingClientRect().top<0)main.scrollIntoView({block:'start'})}
    celebrate(options.prev);
  };
  if(options.stageChange&&canViewTransition())document.startViewTransition(swap);
  else swap();
}
function patchStudent(){
  const focus=captureFocus(),drafts=collectDrafts(),dict=L();
  morph(document.querySelector('#chapters'),chaptersMarkup(team,dict));
  morph(document.querySelector('#campaign-content'),contentMarkup(team,lang,dict));
  morph(document.querySelector('#campaign-sidebar'),sidebarMarkup(team,lang,dict));
  patchLand();
  restoreDrafts(drafts);updatePresence();restoreFocus(focus);
}
function patchLand(){
  if(!document.querySelector('#land-stage'))return;
  const dict=L();
  morph(document.querySelector('#land-stage'),landStageMarkup(team,lang,dict,ui));
  morph(document.querySelector('#land-info'),landInfoMarkup(team,lang,dict,ui));
  morph(document.querySelector('#land-buildings'),landBuildingsMarkup(team,lang,dict,ui));
}
function patchBanner(){
  const banner=document.querySelector('#world-banner');
  if(!banner)return;
  banner.innerHTML=bannerMarkup(team,lang,L(),{playing:scenePlaying,ui});
  banner.classList.toggle('land',showsLand(team.state,ui));
  shownKey=viewKey();
}
// Newly chosen cards flip in, cards that just became reachable pulse, a moved building
// drops onto its hex and freshly explored land clears its fog.
function celebrate(prev){
  if(!prev||!team||session?.role!=='student')return;
  const next=team.state,mark=(selector,cls)=>document.querySelector(selector)?.classList.add(cls);
  for(const kind of ['tech','civic'])for(const item of trees[kind]){
    const was=cardStatus(item,kind,prev),now=cardStatus(item,kind,next);
    if(now.chosen&&!was.chosen)mark(`[data-pick="${kind}:${item.id}"]`,'just-picked');
    else if(now.open&&!was.chosen&&!(was.gate&&was.available))mark(`[data-pick="${kind}:${item.id}"]`,'just-unlocked');
  }
  if(prev.mapPoint!==next.mapPoint)return;
  for(const [id,tile] of Object.entries(next.tiles||{}))if(prev.tiles?.[id]!==tile)mark(`[data-building-at="${id}"]`,'just-placed');
  const was=revealRadius(prev),now=revealRadius(next);
  if(now>was)for(const el of document.querySelectorAll('[data-hex]')){const d=hexes[Number(el.dataset.hex)].dist;if(d>was&&d<=now)el.classList.add('just-revealed')}
}
const preloaded=new Set();
function preload(point){
  for(const src of [`/assets/lands/${point}.webp`,`/assets/portraits/${point}.webp`]){
    if(preloaded.has(src))continue;
    preloaded.add(src);const img=new Image();img.decoding='async';img.src=src;
  }
}
function authPage(){return `<div class="auth-page"><header class="simple-header"><div class="logo"><span>✦</span> BUILD YOUR CIV</div><button class="lang" data-action="language">${L().language}</button></header><section class="auth-hero"><div class="auth-copy"><div class="eyebrow">GAME · ゲーム</div><h1>${L().welcome}</h1><p class="tagline">${L().tagline}</p><p>${L().intro}</p><div class="hero-tags"><span>01 — 04</span><span>TEAM PLAY</span><span>LIVE</span></div></div><div class="auth-card"><div class="auth-tabs"><button class="${authMode==='student'?'active':''}" data-mode="student">${L().join}</button><button class="${authMode==='teacher'?'active':''}" data-mode="teacher">${L().teacher}</button></div><form id="auth-form">${authMode==='student'?`<label>${L().name}<input name="name" autocomplete="off" required maxlength="60" placeholder="${L().name}" /></label><label>${L().code}<input name="code" autocomplete="off" required maxlength="24" placeholder="ABC DEF GHI" class="code-input" /></label>`:`<label>${L().password}<input name="password" type="password" autocomplete="off" required placeholder="••••••••••••" /></label>`}<p class="typing-note">✎ ${L().typing}</p><button class="btn-primary full" type="submit">${authMode==='student'?L().enter:L().teacherEnter} <span>→</span></button></form></div></section><div class="auth-bottom"><div><b>01</b> ${L().steps[0]}</div><div><b>02</b> ${L().steps[1]}</div><div><b>03</b> ${L().steps[2]}</div><div><b>04</b> ${L().steps[3]}</div></div></div>`}
function topbar(teacher=false){return `<header class="topbar"><div class="logo"><span>✦</span> BUILD YOUR CIV</div><div class="top-actions">${teacher?'':`<div class="team-chip"><small>${L().team}</small><strong>${esc(team?.name)}</strong></div><div class="live"><i></i><span id="sync" aria-live="polite">${sync==='offline'?L().reconnecting:sync==='saving'?L().saving:L().save}</span></div>`}<button class="lang" data-action="language">${L().language}</button><button class="text-button light" data-action="logout">${L().signout}</button></div></header>`}
// One definition of the presentation rows, used by the student preview, the teacher
// review panel and the printout.
function summaryRowsFor(state){
  return renderSummaryRows(state,lang,L());
}
function submissionBoxBody(){
  return renderSubmissionBox(team,L());
}
function teacherPage(){return `<div class="app-shell">${topbar(true)}<main id="main" class="teacher-main"><div class="teacher-intro"><div class="eyebrow">TEACHER STUDIO</div><h1>${L().teacherTitle}</h1><p>${L().teacherDesc}</p></div><div class="teacher-layout"><section class="teacher-left"><div class="panel create-panel"><div class="panel-heading"><h2>${L().createTeam}</h2></div><form id="create-team"><label class="answer-field"><span>${L().teamName}</span><input name="teamName" required maxlength="80" autocomplete="off" /></label><button class="btn-primary" type="submit">${L().create} →</button></form></div><div class="teacher-list" id="teacher-list">${teacherList()}</div></section><aside class="teacher-right" id="teacher-right">${teacherDetail?teacherDetailView():teacherWelcome()}</aside></div></main></div>`}
function teacherList(){return teams.length?teams.map(x=>teacherTeamCard(x)).join(''):`<div class="panel empty-teams">${L().noTeams}</div>`}
function teacherWelcome(){return `<div class="teacher-welcome"><img src="/assets/meeting.webp" alt="Two communities meeting" /><div>✦ ${L().studentWork}</div></div>`}
function teacherTeamCard(x){const code=newCodes.get(x.id),quests=questStatus(x.state,!!x.submittedAt).filter(Boolean).length;return `<div class="panel team-card"><div class="team-card-top"><div><h3>${esc(x.name)}</h3><span>${L().questLog} ${quests}/4 · ${x.state.tech.length}+${x.state.civic.length} ${L().chosen}</span></div><span class="status ${x.submittedAt?'submitted':''}">${x.submittedAt?L().submitted:L().working}</span></div>${code?`<div class="code-reveal"><small>${L().codeOnce}</small><strong>${esc(code)}</strong></div>`:''}<div class="team-card-actions">${button(L().review,`review:${x.id}`,'btn-outline')}${button(L().newCode,`code:${x.id}`,'btn-ghost')}${button(L().deleteTeam,`delete:${x.id}`,'btn-ghost danger')}</div></div>`}
function activityView(){
  const activity=teacherDetail.activity;
  if(!activity)return '';
  const counts=activity.counts.filter(row=>row.actor!=='Teacher');
  // Share is a bucket class, not an inline style: the page runs under a CSP without unsafe-inline.
  const bar=total=>`share-${Math.round(10*total/counts[0].total)*10}`;
  return `<div class="activity"><div class="activity-head"><strong>${L().activity}</strong><small>${L().activityHelp}</small></div>${counts.length?`<div class="activity-bars">${counts.map(row=>`<div class="activity-row ${bar(row.total)}"><span>${esc(row.actor)}</span><i></i><b>${row.total} ${L().actionsCount}</b></div>`).join('')}</div>`:`<p class="activity-empty">${L().noActivity}</p>`}</div>`;
}
function teacherDetailView(){
  const x=teacherDetail;
  const live=(x.roster||[]),joined=(x.joined||[]);
  return `<div class="panel detail-panel"><div class="detail-header"><div><span class="eyebrow">${L().studentWork}</span><h2>${esc(x.name)}</h2><p>${x.submittedAt?`${L().submitted} · ${esc(x.submittedAt)}`:L().working}</p></div><button class="icon-button" data-action="close-detail" aria-label="${L().close}">×</button></div><div class="detail-roster"><div><b>${L().liveNow}:</b> ${esc(live.join(' · ')||'—')}</div><div><b>${L().joined}:</b> ${esc(joined.join(' · ')||'—')}</div></div><form id="rename-team"><label class="answer-field"><span>${L().renamePrompt}</span><input name="teamName" value="${esc(x.name)}" required maxlength="80" autocomplete="off" /></label><button class="btn-ghost" type="submit">${L().renameTeam}</button></form>${activityView()}${x.state.mapPoint?`<div class="chronicle-land teacher-land">${landMarkup(x.state,lang,L(),{mode:'mini'})}</div>`:''}<dl>${summaryRowsFor(x.state)}</dl><div class="detail-actions">${x.submittedAt?button(L().reopen,`reopen:${x.id}`,'btn-outline'):''}${button(L().print,'print','btn-outline')}${button(L().deleteTeam,`delete:${x.id}`,'btn-ghost danger')}</div></div>`;
}
function patchTeacher(){
  const focus=captureFocus();
  const list=document.querySelector('#teacher-list');if(list)list.innerHTML=teacherList();
  const right=document.querySelector('#teacher-right');if(right)right.innerHTML=teacherDetail?teacherDetailView():teacherWelcome();
  restoreFocus(focus);
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
    adopt(data);render();openStream();
  }catch(error){toast(error.message,'error')}
}
async function createTeamSubmit(event){
  event.preventDefault();const form=event.target;const name=new FormData(form).get('teamName');
  try{
    const data=await api('/api/teacher/teams',{name});
    newCodes.set(data.team.id,data.team.code);codeStore.save(newCodes);
    teams=teams.filter(x=>x.id!==data.team.id).concat(data.team);
    form.reset();patchTeacher();
  }catch(error){toast(error.message,'error')}
}
async function renameSubmit(event){
  event.preventDefault();const name=new FormData(event.target).get('teamName');
  try{
    const data=await api(`/api/teacher/teams/${teacherDetailId}`,{name},'PATCH');
    teams=teams.map(x=>x.id===data.team.id?{...x,...data.team}:x);
    teacherDetail={...teacherDetail,...data.team};patchTeacher();
  }catch(error){toast(error.message,'error')}
}
// The shared rules run here first, so the page changes on the click itself. Requests then
// go out one at a time, in order; the server's answer replaces the guess, and a refusal
// rolls it back.
function action(payload){
  if(!team)return actionQueue;
  let next;
  try{next=applyAction(team.state,payload)}catch(error){toast(error.message,'error');return actionQueue}
  const before=team.state,quests=questStatus(before,submitted());
  if(payload.type==='map')preload(payload.point);
  pending.push(payload);
  team={...team,state:next};
  render({prev:before,stageChange:before.stage!==next.stage});
  if(questStatus(next,submitted()).some((done,i)=>done&&!quests[i]))toast(`✦ ${L().completeQuest}`,'quest');
  sync='saving';updateSync();
  actionQueue=actionQueue.then(async()=>{
    try{
      await flushAll();
      const data=await api('/api/team/action',payload);
      pending.splice(pending.indexOf(payload),1);
      roster=data.roster;
      const shown=team;adoptTeam(data.team);
      if(!pending.length){sync='saved';updateSync()}
      if(JSON.stringify(shown.state)!==JSON.stringify(team.state))render({prev:shown.state,stageChange:team.state.stage!==shown.state.stage});
    }catch(error){
      pending.splice(pending.indexOf(payload),1);
      const shown=team;team=projected();
      sync='saved';updateSync();toast(error.message,'error');
      if(JSON.stringify(shown.state)!==JSON.stringify(team.state))render({stageChange:team.state.stage!==shown.state.stage});
    }
  });
  return actionQueue;
}
function fieldInput(el){const key=el.dataset.field;const value=el.value;sync='saving';updateSync();clearTimeout(saveTimers.get(key));saveTimers.set(key,setTimeout(()=>saveField(key,value),650))}
async function saveField(key,value){
  saveTimers.delete(key);
  try{
    const hadPlace=!!team?.state?.placeAnswer?.trim();
    const data=await api('/api/team/action',{type:'field',key,value});
    adoptTeam(data.team);
    roster=data.roster;if(!pending.length)sync='saved';updateSync();
    if(key==='placeAnswer'&&hadPlace!==!!team.state.placeAnswer.trim())render();
    else updateSummary();
  }catch(error){sync='offline';updateSync();toast(error.message,'error')}
}
async function flushField(key){if(!saveTimers.has(key))return;clearTimeout(saveTimers.get(key));saveTimers.delete(key);const field=document.querySelector(`[data-field="${key}"]`);if(field)await saveField(key,field.value)}
async function flushAll(){for(const key of [...saveTimers.keys()])await flushField(key)}
async function postPresence(field){if(presenceSent===field)return;presenceSent=field;try{await api('/api/team/presence',{field})}catch{}}

async function onAction(el){
  const id=el.dataset.action;
  try{
    if(id==='language'){await flushAll();lang=lang==='en'?'ja':'en';localStorage.setItem('civ_lang',lang);render()}
    else if(id==='scene-replay'){scenePlaying=true;const scene=document.querySelector('.cinematic');if(scene){scene.classList.remove('playing','still');void scene.offsetWidth;scene.classList.add('playing')}const toggle=document.querySelector('[data-action="scene-skip"]');if(toggle)toggle.textContent=L().skipScene}
    else if(id==='scene-skip'){scenePlaying=!scenePlaying;const scene=document.querySelector('.cinematic');if(scene){scene.classList.toggle('playing',scenePlaying);scene.classList.toggle('still',!scenePlaying)}el.textContent=scenePlaying?L().skipScene:L().play}
    else if(id==='banner-land'||id==='banner-scene'){ui.banner=id==='banner-land'?'land':'scene';ui.selected=null;patchBanner()}
    else if(id==='cancel-move'){ui.selected=null;patchLand()}
    else if(id==='logout'){await flushAll();await api('/api/logout',{});stream?.close();stream=null;session=null;team=null;serverTeam=null;pending=[];teacherDetail=null;teacherDetailId=null;presenceFields={};presenceSent=null;render()}
    else if(id==='next'||id==='previous'){await action({type:'stage',stage:team.state.stage+(id==='next'?1:-1)})}
    else if(id==='submit'){if(!confirm(L().submitConfirm))return;await actionQueue;await flushAll();const data=await api('/api/team/submit',{});adoptTeam(data.team);roster=data.roster;render();toast(L().submitted)}
    else if(id==='print'){window.print()}
    else if(id==='close-detail'){teacherDetail=null;teacherDetailId=null;patchTeacher()}
    else if(id.startsWith('review:')){
      teacherDetailId=Number(id.split(':')[1]);
      const [detail,activity]=await Promise.all([api(`/api/teacher/teams/${teacherDetailId}`),api(`/api/teacher/teams/${teacherDetailId}/activity`)]);
      teacherDetail={...detail.team,roster:detail.roster,joined:detail.joined,activity};patchTeacher();
    }
    else if(id.startsWith('code:')){
      const teamId=Number(id.split(':')[1]);
      if(!confirm(L().codeWarning))return;
      const data=await api(`/api/teacher/teams/${teamId}/new-code`,{});
      newCodes.set(teamId,data.code);codeStore.save(newCodes);patchTeacher();
    }
    else if(id.startsWith('reopen:')){
      const teamId=Number(id.split(':')[1]);
      if(!confirm(L().reopenWarning))return;
      const data=await api(`/api/teacher/teams/${teamId}/reopen`,{});
      teams=teams.map(x=>x.id===teamId?data.team:x);
      teacherDetail={...teacherDetail,...data.team};patchTeacher();
    }
    else if(id.startsWith('delete:')){
      const teamId=Number(id.split(':')[1]);
      if(!confirm(L().deleteWarning))return;
      const data=await api(`/api/teacher/teams/${teamId}`,{},'DELETE');
      teams=data.teams;newCodes.delete(teamId);codeStore.save(newCodes);
      if(teacherDetailId===teamId){teacherDetail=null;teacherDetailId=null}
      patchTeacher();toast(L().deleted);
    }
  }catch(error){toast(error.message,'error')}
}

function chooseEvent(id,choice){
  const current=team.state.events?.[id];
  if(current&&current!==choice){
    const lost=[...trees.tech,...trees.civic].filter(item=>item.gate&&
      (team.state.tech.includes(item.id)||team.state.civic.includes(item.id))&&
      (id==='origin'||item.gate[0]==='encounter')).map(item=>title(item));
    const message=lost.length?fmt(id==='origin'?L().changeWarning:L().encounterChangeWarning,lost.join(', ')):id==='origin'&&team.state.events?.encounter?L().noReset:null;
    if(message&&!confirm(message))return;
  }
  action({type:'event',id,choice});
}

// Delegated once on the persistent shell, so patching part of the page can never leave a
// stale listener behind or bind the same form twice.
app.addEventListener('click',event=>{
  const el=event.target.closest('[data-action],[data-mode],[data-stage],[data-map],[data-pick],[data-avatar],[data-event],[data-building],[data-tile]');
  if(!el||el.disabled)return;
  if(el.dataset.building!==undefined){if(!submitted()){ui.selected=ui.selected===el.dataset.building?null:el.dataset.building;patchLand()}return}
  if(el.dataset.tile!==undefined){
    const tile=Number(el.dataset.tile);
    if(ui.selected){const id=ui.selected;ui.selected=null;if(team.state.tiles?.[id]===tile)patchLand();else action({type:'place',id,tile})}
    else{ui.hover=tile;patchLand()}
    return;
  }
  if(el.dataset.action!==undefined)onAction(el);
  else if(el.dataset.mode!==undefined){authMode=el.dataset.mode;render()}
  else if(el.dataset.stage!==undefined)action({type:'stage',stage:Number(el.dataset.stage)});
  else if(el.dataset.map!==undefined)action({type:'map',point:el.dataset.map});
  else if(el.dataset.pick!==undefined){const [tree,id]=el.dataset.pick.split(':');action({type:'pick',tree,id})}
  else if(el.dataset.event!==undefined){const [id,choice]=el.dataset.event.split(':');chooseEvent(id,choice)}
});
// Keep the landscape fallback visible if an image cannot be fetched.
app.addEventListener('error',event=>{
  if(event.target.matches?.('[data-scene-image]')){
    event.target.classList.add('failed');
    event.target.parentElement.setAttribute('role','img');
    event.target.parentElement.setAttribute('aria-label',event.target.alt);
  }
},true);
app.addEventListener('submit',event=>{
  if(event.target.id==='auth-form')authSubmit(event);
  else if(event.target.id==='create-team')createTeamSubmit(event);
  else if(event.target.id==='rename-team')renameSubmit(event);
});
app.addEventListener('input',event=>{
  const el=event.target;
  if(el.dataset?.field!==undefined)fieldInput(el);
  else if(el.classList?.contains('code-input')){const cleaned=normalizeCode(el.value).slice(0,codeLength);if(el.value!==cleaned)el.value=cleaned}
});
app.addEventListener('focusin',event=>{if(event.target.dataset?.field!==undefined)postPresence(event.target.dataset.field)});
// Reading the land: pointing at a hex explains it, and hovering a map pin fetches its art early.
app.addEventListener('mouseover',event=>{
  const pin=event.target.closest?.('[data-map]');
  if(pin){preload(pin.dataset.map);return}
  const hex=event.target.closest?.('[data-tile]');
  if(hex&&!ui.selected&&ui.hover!==Number(hex.dataset.tile)){ui.hover=Number(hex.dataset.tile);morph(document.querySelector('#land-info'),landInfoMarkup(team,lang,L(),ui))}
});
// SVG hexes and buildings are not <button>s, so give them the keys a button has.
app.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&ui.selected){ui.selected=null;patchLand();return}
  const el=event.target;
  if((event.key==='Enter'||event.key===' ')&&el instanceof SVGElement&&(el.dataset.tile!==undefined||el.dataset.building!==undefined)){event.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}))}
});
app.addEventListener('focusout',event=>{const key=event.target.dataset?.field;if(key!==undefined){flushField(key);postPresence(null)}});

// Paste and drop stay blocked for team answers; copying work out is allowed.
// Sign-in credentials and join codes can be pasted. The classroom writing rule only
// applies to the team's answers, which are marked with data-field.
const inField=target=>target instanceof Element&&target.matches('[data-field]');
function blockPaste(event){if(!inField(event.target))return;event.preventDefault();toast(L().pasteBlocked,'warn')}
document.addEventListener('paste',blockPaste,true);
document.addEventListener('drop',blockPaste,true);
document.addEventListener('beforeinput',e=>{if(inField(e.target)&&['insertFromPaste','insertFromDrop','insertFromYank'].includes(e.inputType))blockPaste(e)},true);
document.addEventListener('keydown',e=>{if(inField(e.target)&&(e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='v')e.preventDefault()},true);
boot();
