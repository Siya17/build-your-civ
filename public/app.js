import { trees, textFields, normalizeCode, isCodeShape, questStatus, applyAction, mapPoints } from '/shared/game.js';
import { dictionary } from '/shared/i18n.js';
import { hexes, isRevealed, improvements, terrains, generateLand } from '/shared/land.js';
import { renderStudentView, renderSummaryRows, renderSubmissionBox, renderQuestLog, eraTrackMarkup, councilMarkup, toolbarMarkup, stageMarkup, overlayMarkup, footMarkup, sideMarkup, drawerMarkup, cardStatus, pendingEvent } from '/student-view.js';
import { landMarkup, tileInfo } from '/hexmap.js';
import { councilPrompt, fill } from '/prompts.js';
import { renderGuidedView, suggestedSite } from '/guided-view.js';
import { nextTask, taskAvailable, progressStage } from '/shared/flow.js';
import { f } from '/shared/flow-copy.js';
import { suggestTrail, assessLayout, trailError } from '/shared/layout.js';
import { fitTiles } from '/shared/land.js';

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
// Page-only state for the board: the building being moved, the hex being read, the card
// shown over the map (arrival scene, atlas or an event), whether an event card is showing
// its result, the open tree drawer, and which one-time cards this student has already seen.
const ui={selected:null,hover:null,overlay:null,result:null,drawer:null,seen:new Set(),task:'hub',building:null,pick:null,site:null,path:[],trailMode:'add',busy:false,eventResult:null};
const answerDrafts=new Map(),savingFields=new Map();
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
async function api(path,body,method){const res=await fetch(path,{method:method||(body===undefined?'GET':'POST'),headers:body===undefined&&!method?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin'});const data=await res.json();if(!res.ok)throw Object.assign(new Error(data.error||L().error),{gaps:data.gaps,status:res.status,team:data.team});return data}
// A team that starts with its homeland (A–K) meets it on the first screen of era I.
function firstArrival(){ui.task='hub';ui.seen=new Set();ui.pick=null;ui.building=null;answerDrafts.clear();}
async function boot(){try{const data=await api('/api/me');adopt(data);firstArrival();render();if(data.authenticated)openStream()}catch(error){app.innerHTML=`<div class="fatal">${esc(error.message)}</div>`}}
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
  const data=JSON.parse(event.data);roster=data.roster??roster;
  if(!(data.team.version>Number(serverTeam?.version??-1))){updateLiveBits();return;}
  const previous=team;adoptTeam(data.team);
  if(ui.task==='placement'||ui.task==='trail')ui.reviewVersion=null;
  // Local reading and drafts survive every shared chapter/layout change.
  const writing=textFields.includes(ui.task);
  const layoutChanged=JSON.stringify([previous?.state.mapPoint,previous?.state.tech,previous?.state.civic,previous?.state.tiles,previous?.state.trails,previous?.submittedAt])!==JSON.stringify([team.state.mapPoint,team.state.tech,team.state.civic,team.state.tiles,team.state.trails,team.submittedAt]);
  if(writing&&!layoutChanged){patchFields([...answerDrafts.keys()]);updateLiveBits();updatePresence();}
  else render({full:true,prev:previous?.state});
  if(data.by&&data.by!==session?.name&&JSON.stringify(previous?.state)!==JSON.stringify(team.state))toast(f(lang,'updated'),'warn');
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
  if(document.querySelector('[data-guided]')){render({full:true});return;}

  const summary=document.querySelector('#summary');if(summary)summary.innerHTML=summaryRowsFor(team.state);
  const box=document.querySelector('#submission');if(box)box.innerHTML=submissionBoxBody();
  const quests=document.querySelector('#quest-log');if(quests)quests.outerHTML=renderQuestLog(team,L());
  morph(document.querySelector('#era-track'),eraTrackMarkup(team,L()));
  const council=document.createElement('div');council.innerHTML=councilMarkup(team,lang,L());
  for(const selector of ['.objectives','.era-nav'])morph(document.querySelector(selector),council.querySelector(selector)?.innerHTML||'');
}

// Every render replaces the page, so remember where the keyboard was and put it back.
function captureFocus(){
  const el=document.activeElement;
  if(!el||el===document.body)return null;
  const data=el.dataset||{};
  const key=data.field?['data-field',data.field]:data.route?['data-route',data.route]:data.pick?['data-pick',data.pick]:data.map?['data-map',data.map]:data.avatar?['data-avatar',data.avatar]:data.event?['data-event',data.event]:data.goal?['data-goal',data.goal]:data.building?['data-building',data.building]:data.tile?['data-tile',data.tile]:data.stage?['data-stage',data.stage]:data.action?['data-action',data.action]:data.mode?['data-mode',data.mode]:null;
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
  const drafts=new Map(answerDrafts);
  for(const el of document.querySelectorAll('[data-field]'))if(saveTimers.has(el.dataset.field)||document.activeElement===el)drafts.set(el.dataset.field,el.value);
  return drafts;
}
function restoreDrafts(drafts){for(const [key,value] of drafts){const el=document.querySelector(`[data-field="${key}"]`);if(el&&el.value!==value)el.value=value}}
// Bring a region up to date by replacing only what changed. An answer box and its textarea
// are never replaced (patchFields owns their text), but the question around them is
// updated in place, and open <details> stay open.
const holdsField=node=>node.nodeType===1&&(node.matches('[data-field]')||!!node.querySelector('[data-field]'));
function morphNode(was,node){
  if(was.isEqualNode(node))return;
  if(was.nodeType===1&&node.nodeType===1&&was.tagName===node.tagName&&((holdsField(was)&&holdsField(node))||was.tagName==='BUTTON')){
    if(was.matches('[data-field]')){if(was.dataset.field===node.dataset.field){was.disabled=node.disabled;return}}
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
const viewKey=()=>session?.role==='student'&&team?[team.state.stage,team.state.mapPoint,lang,!!team.submittedAt,team.name].join('|'):'';
const canViewTransition=()=>typeof document.startViewTransition==='function'&&!reducedMotion.matches;
function render(options={}){
  if(ui.selected&&!Number.isInteger(team?.state.tiles?.[ui.selected]))ui.selected=null;
  if(shownKey&&shownKey===viewKey()&&!options.full&&document.querySelector('#council')){patchStudent();celebrate(options.prev);return}
  const swap=()=>{
    const focus=captureFocus(),drafts=collectDrafts();
    document.documentElement.lang=lang;
    skipLink.textContent=L().skip;
    skipLink.hidden=!session;
    app.innerHTML=!session?authPage():session.role==='teacher'?teacherPage():renderGuidedView({team,roster,lang,L:L(),topbar:topbar(),sync,playing:scenePlaying,animate:options.stageChange&&!canViewTransition(),ui});
    shownKey=viewKey();
    restoreDrafts(drafts);updatePresence();restoreFocus(focus);
    document.body.classList.remove('drawer-open');
    if(session?.role==='student'){for(const b of app.querySelectorAll('button'))if(ui.busy)b.disabled=true;app.setAttribute('aria-busy',String(ui.busy));}
    if(options.stageChange){const main=document.querySelector('#main');if(main&&main.getBoundingClientRect().top<0)main.scrollIntoView({block:'start'})}
    celebrate(options.prev);
  };
  if(options.stageChange&&canViewTransition())document.startViewTransition(swap);
  else swap();
}
function patchStudent(){
  const focus=captureFocus(),drafts=collectDrafts(),dict=L();
  morph(document.querySelector('#era-track'),eraTrackMarkup(team,dict));
  morph(document.querySelector('#council'),councilMarkup(team,lang,dict));
  morph(document.querySelector('#board-toolbar'),toolbarMarkup(team,lang,dict));
  morph(document.querySelector('#board-side'),sideMarkup(team,lang,dict));
  patchBoard();patchOverlay();patchDrawer();
  restoreDrafts(drafts);updatePresence();restoreFocus(focus);
}
function patchBoard(){
  const dict=L();
  morph(document.querySelector('#board-stage'),stageMarkup(team,lang,dict,ui));
  morph(document.querySelector('#board-foot'),footMarkup(team,lang,dict,ui));
}
function patchOverlay(){morph(document.querySelector('#board-overlay'),overlayMarkup(team,lang,L(),ui,scenePlaying))}
function patchDrawer(){
  morph(document.querySelector('#drawer'),drawerMarkup(team,lang,L(),ui));
  document.body.classList.toggle('drawer-open',!!ui.drawer);
}
function openOverlay(name){ui.overlay=name;ui.result=null;ui.selected=null;patchOverlay();patchBoard();document.querySelector('#board-overlay [data-event]:not(:disabled),#board-overlay button')?.focus({preventScroll:true})}
function closeOverlay(){ui.overlay=null;ui.result=null;patchOverlay()}
function openDrawer(kind){ui.drawer=kind;patchDrawer();document.querySelector('.drawer-tabs [aria-selected="true"]')?.focus({preventScroll:true})}
// Cards that open by themselves, once per student: arriving somewhere new, and meeting the
// neighbours when the team reaches the society era with the meeting still undecided.
function autoOverlays(prev){
  if(session?.role==='student')return;

  const next=team.state;
  if(next.mapPoint&&prev?.mapPoint!==next.mapPoint&&!ui.seen.has('arrival:'+next.mapPoint)){ui.seen.add('arrival:'+next.mapPoint);ui.overlay='arrival';ui.result=null;return}
  if(next.stage===3&&pendingEvent(next)==='encounter'&&!ui.seen.has('encounter')){ui.seen.add('encounter');ui.overlay='event:encounter';ui.result=null}
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
  for(const el of document.querySelectorAll('[data-hex]')){const i=Number(el.dataset.hex);if(isRevealed(next,i)&&!isRevealed(prev,i))el.classList.add('just-revealed')}
  // A new building is announced in the open drawer, where the student cannot see the map.
  const land=generateLand(next.mapPoint),raised=Object.keys(next.tiles||{}).find(id=>!(id in (prev.tiles||{})));
  const note=document.querySelector('#drawer-note');
  if(note&&land&&raised){note.textContent=fill(L().gbRaised,{building:improvements[raised].name[lang],terrain:lang==='en'?terrains[land.tiles[next.tiles[raised]]].en.toLowerCase():terrains[land.tiles[next.tiles[raised]]].ja});note.classList.remove('flash');void note.offsetWidth;note.classList.add('flash')}
  // A council question rewritten by this change glows, so students notice it now fits them.
  for(const el of document.querySelectorAll('[data-answer]')){
    const key=el.dataset.answer;
    if(councilPrompt(key,prev,lang,L()).q!==councilPrompt(key,next,lang,L()).q){el.classList.remove('q-new');void el.offsetWidth;el.classList.add('q-new')}
  }
}
const preloaded=new Set();
function preload(point){
  for(const src of [`/assets/lands/${point}.webp`,`/assets/portraits/${point}.webp`]){
    if(preloaded.has(src))continue;
    preloaded.add(src);const img=new Image();img.decoding='async';img.src=src;
  }
}
function authPage(){return `<div class="auth-page"><header class="simple-header"><div class="logo"><span>✦</span> BUILD YOUR CIV</div><button class="lang" data-action="language">${L().language}</button></header><section class="auth-hero"><div class="auth-copy"><div class="eyebrow">GAME · ゲーム</div><h1>${L().welcome}</h1><p class="tagline">${L().tagline}</p><p>${L().intro}</p><div class="hero-tags"><span>01 — 04</span><span>TEAM PLAY</span><span>LIVE</span></div></div><div class="auth-card"><div class="auth-tabs"><button class="${authMode==='student'?'active':''}" data-mode="student">${L().join}</button><button class="${authMode==='teacher'?'active':''}" data-mode="teacher">${L().teacher}</button></div><form id="auth-form">${authMode==='student'?`<label>${L().name}<input name="name" autocomplete="off" required maxlength="60" placeholder="${L().name}" /></label><label>${L().code}<input name="code" autocomplete="off" required maxlength="24" placeholder="A-427" class="code-input" /></label>`:`<label>${L().password}<input name="password" type="password" autocomplete="off" required placeholder="••••••••••••" /></label>`}<p class="typing-note">✎ ${L().typing}</p><button class="btn-primary full" type="submit">${authMode==='student'?L().enter:L().teacherEnter} <span>→</span></button></form></div></section><div class="auth-bottom"><div><b>01</b> ${L().steps[0]}</div><div><b>02</b> ${L().steps[1]}</div><div><b>03</b> ${L().steps[2]}</div><div><b>04</b> ${L().steps[3]}</div></div></div>`}
function topbar(teacher=false){return `<header class="topbar"><div class="logo"><span>✦</span> BUILD YOUR CIV</div><div class="top-actions">${teacher?'':`<div class="team-chip"><small>${L().team}</small><strong>${esc(team?.name)}</strong></div><div class="live"><i></i><span id="sync" aria-live="polite">${sync==='offline'?L().reconnecting:sync==='saving'?L().saving:L().save}</span></div>`}<button class="lang" data-action="language">${L().language}</button><button class="text-button light" data-action="logout">${L().signout}</button></div></header>`}
// One definition of the presentation rows, used by the student preview, the teacher
// review panel and the printout.
function summaryRowsFor(state){
  return renderSummaryRows(state,lang,L());
}
function submissionBoxBody(){
  return renderSubmissionBox(team,L());
}
function teacherPage(){return `<div class="app-shell">${topbar(true)}<main id="main" class="teacher-main"><div class="teacher-intro"><div class="eyebrow">TEACHER STUDIO</div><h1>${L().teacherTitle}</h1><p>${L().teacherDesc}</p></div><div class="teacher-layout"><section class="teacher-left"><div class="panel create-panel"><div class="panel-heading"><h2>${L().createTeam}</h2></div><form id="create-team"><label class="answer-field"><span>${L().teamName}</span><input name="teamName" required maxlength="80" autocomplete="off" /></label><button class="btn-primary" type="submit">${L().create} →</button></form>${missingLetters()?`<button class="btn-outline letter-teams" data-action="letter-teams">${L().addLetterTeams} (${missingLetters()})</button>`:''}</div><div class="teacher-list" id="teacher-list">${teacherList()}</div></section><aside class="teacher-right" id="teacher-right">${teacherDetail?teacherDetailView():teacherWelcome()}</aside></div></main></div>`}
// Map points no team is fixed to, so the teacher can bring back a deleted A–K team.
const missingLetters=()=>Object.keys(mapPoints).filter(point=>!teams.some(x=>x.state.fixedPoint===point)).join(' ');
function teacherList(){return teams.length?teams.map(x=>teacherTeamCard(x)).join(''):`<div class="panel empty-teams">${L().noTeams}</div>`}
function teacherWelcome(){return `<div class="teacher-welcome"><img src="/assets/meeting.webp" alt="Two communities meeting" /><div>✦ ${L().studentWork}</div></div>`}
function teacherTeamCard(x){const code=x.code||newCodes.get(x.id),quests=questStatus(x.state,!!x.submittedAt).filter(Boolean).length,point=x.state.fixedPoint;return `<div class="panel team-card"><div class="team-card-top">${point?`<span class="team-letter" title="${esc(L().homelandFixed)} ${point}">${point}</span>`:''}<div><h3>${esc(x.name)}</h3><span>${L().questLog} ${quests}/4 · ${x.state.tech.length}+${x.state.civic.length} ${L().chosen}</span></div><span class="status ${x.submittedAt?'submitted':''}">${x.submittedAt?L().submitted:L().working}</span></div>${code?`<div class="code-reveal"><small>${x.code?`${L().joinCode} · ${L().codeHint}`:L().codeOnce}</small><strong>${esc(code)}</strong></div>`:''}<div class="team-card-actions">${button(L().review,`review:${x.id}`,'btn-outline')}${button(L().newCode,`code:${x.id}`,'btn-ghost')}${button(L().deleteTeam,`delete:${x.id}`,'btn-ghost danger')}</div></div>`}
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
  const extra=document.querySelector('.create-panel .letter-teams'),missing=missingLetters();
  if(extra&&!missing)extra.remove();else if(extra)extra.textContent=`${L().addLetterTeams} (${missing})`;
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
    adopt(data);firstArrival();render();openStream();
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
  const request=['pick','place','trail','event','route','map'].includes(payload.type)?{...payload,expectedVersion:team.version}:payload;
  try{next=applyAction(team.state,payload)}catch(error){toast(error.message,'error');return Promise.reject(error)}
  const before=team.state,quests=questStatus(before,submitted());
  if(payload.type==='map')preload(payload.point);
  pending.push(payload);
  team={...team,state:next};
  if(payload.type==='event'){ui.eventResult=payload.id;}
  else if(payload.type==='map'&&ui.overlay==='atlas')ui.overlay=null;
  if(payload.type==='stage')ui.drawer=null;
  autoOverlays(before);
  render({prev:before,stageChange:before.stage!==next.stage});
  if(questStatus(next,submitted()).some((done,i)=>done&&!quests[i]))toast(`✦ ${L().completeQuest}`,'quest');
  sync='saving';updateSync();
  actionQueue=actionQueue.then(async()=>{
    try{
      await flushAll();
      const data=await api('/api/team/action',request);
      pending.splice(pending.indexOf(payload),1);
      roster=data.roster;
      const shown=team;adoptTeam(data.team);
      if(!pending.length){sync='saved';updateSync()}
      if(JSON.stringify(shown.state)!==JSON.stringify(team.state))render({prev:shown.state,stageChange:team.state.stage!==shown.state.stage});
    }catch(error){
      pending.splice(pending.indexOf(payload),1);
      if(error.team){adoptTeam(error.team);ui.reviewVersion=null;}
      const shown=team;team=projected();
      sync='saved';updateSync();toast(error.message,'error');
      if(JSON.stringify(shown.state)!==JSON.stringify(team.state))render({stageChange:team.state.stage!==shown.state.stage});
      throw error;
    }
  });
  const operation=actionQueue;actionQueue=operation.catch(()=>{});return operation;
}
function fieldInput(el){const key=el.dataset.field;answerDrafts.set(key,el.value);sync='saving';updateSync();clearTimeout(saveTimers.get(key));saveTimers.set(key,setTimeout(()=>saveField(key,answerDrafts.get(key)).catch(()=>{}),650));}
function saveField(key,value){
  clearTimeout(saveTimers.get(key));saveTimers.delete(key);
  const request=(savingFields.get(key)||Promise.resolve()).catch(()=>{}).then(async()=>{
    try{
      const data=await api('/api/team/action',{type:'field',key,value});adoptTeam(data.team);roster=data.roster;
      if(answerDrafts.get(key)===value)answerDrafts.delete(key);
      sync=answerDrafts.size?'saving':'saved';updateSync();
      if(!ui.busy&&ui.task==='hub')render({full:true});
    }catch(error){sync='offline';updateSync();toast(f(lang,'saveFailed'),'error');throw error;}
  });
  savingFields.set(key,request);
  request.finally(()=>{if(savingFields.get(key)===request)savingFields.delete(key);}).catch(()=>{});
  return request;
}
async function flushField(key){if(answerDrafts.has(key))await saveField(key,answerDrafts.get(key));else if(savingFields.has(key))await savingFields.get(key);}
async function flushAll(){
  for(const timer of saveTimers.values())clearTimeout(timer);saveTimers.clear();
  await Promise.all([...savingFields.values()]);
  for(const [key,value] of [...answerDrafts])await saveField(key,value);
}

async function postPresence(field){if(presenceSent===field)return;presenceSent=field;try{await api('/api/team/presence',{field})}catch{}}

async function onAction(el){
  const id=el.dataset.action;
  try{
    if(id==='language'){await flushAll();lang=lang==='en'?'ja':'en';localStorage.setItem('civ_lang',lang);render()}
    else if(id==='scene-replay'){scenePlaying=true;const scene=document.querySelector('.cinematic');if(scene){scene.classList.remove('playing','still');void scene.offsetWidth;scene.classList.add('playing')}const toggle=document.querySelector('[data-action="scene-skip"]');if(toggle)toggle.textContent=L().skipScene}
    else if(id==='scene-skip'){scenePlaying=!scenePlaying;const scene=document.querySelector('.cinematic');if(scene){scene.classList.toggle('playing',scenePlaying);scene.classList.toggle('still',!scenePlaying)}el.textContent=scenePlaying?L().skipScene:L().play}
    else if(id==='cancel-move'){ui.selected=null;patchBoard()}
    else if(id.startsWith('drawer:')){openDrawer(id.slice(7))}
    else if(id==='close-drawer'){ui.drawer=null;patchDrawer()}
    else if(id.startsWith('open-event:')){openOverlay('event:'+id.slice(11))}
    else if(id==='open-scene'){openOverlay('arrival')}
    else if(id==='open-atlas'){openOverlay('atlas')}
    else if(id==='close-overlay'){closeOverlay()}
    else if(id==='logout'){await flushAll();ui.task='hub';answerDrafts.clear();await api('/api/logout',{});stream?.close();stream=null;session=null;team=null;serverTeam=null;pending=[];ui.drawer=null;ui.overlay=null;document.body.classList.remove('drawer-open');teacherDetail=null;teacherDetailId=null;presenceFields={};presenceSent=null;render()}
    else if(id==='next'||id==='previous'){await action({type:'stage',stage:team.state.stage+(id==='next'?1:-1)})}
    else if(id==='submit'){await actionQueue;await flushAll();const data=await api('/api/team/submit',{});adoptTeam(data.team);roster=data.roster;render();toast(L().submitted)}
    else if(id==='print'){const review=document.querySelector('.route-review'),wasOpen=review?.open;if(review)review.open=true;try{window.print()}finally{if(review)review.open=wasOpen}}
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
      teams=teams.map(x=>x.id===teamId?{...x,code:data.code}:x);newCodes.delete(teamId);codeStore.save(newCodes);patchTeacher();
    }
    else if(id==='letter-teams'){const data=await api('/api/teacher/letter-teams',{});teams=data.teams;render();toast(fmt(L().lettersAdded,data.made))}
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

// Objectives lead to the place where each one is done.
function goTo(goal){
  if(goal==='atlas'){if(team.state.fixedPoint)openOverlay('arrival');else if(team.state.mapPoint)openOverlay('atlas');else document.querySelector('.board-atlas')?.scrollIntoView({behavior:'smooth',block:'center'});return}
  if(goal.startsWith('event:')){openOverlay(goal);return}
  if(goal.startsWith('drawer:')){openDrawer(goal.slice(7));return}
  const target=goal==='submit'?document.querySelector('[data-action="submit"]'):document.querySelector(`[data-field="${goal.slice(6)}"]`);
  if(target){target.scrollIntoView({behavior:reducedMotion.matches?'auto':'smooth',block:'center'});target.focus({preventScroll:true})}
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

async function navigateTask(task){
  await flushAll();ui.task=task;ui.eventResult=null;ui.selected=null;ui.overlay=null;ui.drawer=null;
  render({full:true,stageChange:true});document.querySelector('#task-title')?.focus({preventScroll:true});
}
async function advanceChapter(){const stage=progressStage(team.state);if(stage>team.state.stage)await action({type:'stage',stage});}
function beginPlacement(id,pick=null){
  ui.building=id;ui.pick=pick;let preview=team.state;
  if(pick)preview=applyAction(preview,{type:'pick',tree:pick.tree,id,tile:null});
  ui.site=Number.isInteger(preview.tiles?.[id])?preview.tiles[id]:suggestedSite(preview,id);
  ui.task='placement';ui.reviewVersion=team.version;
}
function guidedClick(el){
  const d=el.dataset;
  if(!d.flow&&!d.pick&&!d.building&&!d.tile&&!d.event&&!d.route&&!d.map)return false;
  if(ui.busy)return true;
  ui.busy=true;
  (async()=>{
    try{
      if(d.tile!==undefined){
        const tile=Number(d.tile);
        if(ui.task==='placement'){ui.site=tile;ui.reviewVersion=team.version;}
        else if(ui.task==='trail'){ui.path=suggestTrail(team.state,tile)||[];ui.trailMode='add';ui.reviewVersion=team.version;}
        else{ui.hover=tile;await navigateTask('assessment');}
      }else if(d.building){
        if(team.submittedAt)return;
        if(ui.task==='trail'){ui.path=suggestTrail(team.state,team.state.tiles[d.building])||[];ui.reviewVersion=team.version;}
        else beginPlacement(d.building);
      }else if(d.pick){
        await flushAll();const [tree,id]=d.pick.split(':');beginPlacement(id,team.state[tree].includes(id)?null:{tree,id});
      }else if(d.map){
        ui.busy=true;await flushAll();await action({type:'map',point:d.map});ui.task='arrival';
      }else if(d.event){
        ui.busy=true;await flushAll();const [id,choice]=d.event.split(':');
        const before=team.state.events?.[id];
        if(before&&before!==choice&&!confirm(L().noReset))return;
        await action({type:'event',id,choice});ui.task='result';ui.eventResult=id;await advanceChapter();
      }else if(d.route){
        ui.busy=true;await flushAll();await advanceChapter();await action({type:'route',id:d.route});ui.task='routeCheck';
      }else{
        const cmd=d.flow;
        if(cmd==='hub')await navigateTask('hub');
        else if(cmd.startsWith('task:')){
          const id=cmd.slice(5);if(!['facts','review','manage'].includes(id)&&!taskAvailable(id,team,ui.seen))throw new Error(f(lang,'needsEarlier'));
          await navigateTask(id);
        }else if(cmd==='finish'){
          ui.busy=true;await flushAll();const task=ui.task;
          if(['placeAnswer','techAnswer','societyAnswer','beliefAnswer','contactAnswer'].includes(task)&&!team.state[task]?.trim())throw new Error(L().noAnswer);
          if(task==='place'&&!team.state.mapPoint)throw new Error(f(lang,'place'));
          if(task==='arrival')ui.seen.add('arrival:'+team.state.mapPoint);
          if(['prep','services','routeCheck'].includes(task))ui.seen.add(task);
          if(task==='route'&&!team.state.route)throw new Error(f(lang,'route'));
          await advanceChapter();ui.task='hub';
        }else if(cmd==='placement-back')await navigateTask(ui.pick?.tree||'manage');
        else if(cmd==='confirm-placement'||cmd==='keep-plan'){
          if(ui.reviewVersion!==team.version&&cmd==='confirm-placement'){ui.reviewVersion=team.version;throw new Error(f(lang,'updated'));}
          ui.busy=true;await flushAll();
          const payload=ui.pick?{type:'pick',...ui.pick,tile:cmd==='keep-plan'?null:ui.site}:{type:'place',id:ui.building,tile:ui.site};
          await action(payload);ui.task='result';ui.eventResult=null;ui.pick=null;
        }else if(cmd==='remove-development'){
          ui.busy=true;await flushAll();const tree=team.state.tech.includes(ui.building)?'tech':'civic';
          await action({type:'pick',tree,id:ui.building});ui.task=tree;ui.pick=null;
        }else if(cmd.startsWith('move:')){await flushAll();beginPlacement(cmd.slice(5));}
        else if(cmd==='manage')await navigateTask('manage');
        else if(cmd==='trails'||cmd.startsWith('connect:')){
          await flushAll();ui.task='trail';ui.trailMode='add';ui.path=cmd.startsWith('connect:')?suggestTrail(team.state,team.state.tiles[cmd.slice(8)])||[]:[];ui.reviewVersion=team.version;
        }else if(cmd.startsWith('remove-edge:')){ui.path=cmd.slice(12).split(':').map(Number);ui.trailMode='remove';ui.reviewVersion=team.version;}
        else if(cmd==='confirm-trail'){
          if(ui.reviewVersion!==team.version){ui.reviewVersion=team.version;throw new Error(f(lang,'updated'));}
          const error=trailError(team.state,ui.path,ui.trailMode==='remove');if(error)throw new Error(error);
          ui.busy=true;await flushAll();await action({type:'trail',path:ui.path,mode:ui.trailMode});ui.task='result';ui.eventResult=null;
        }
      }
    }catch(error){toast(error.message,'error');}
    finally{ui.busy=false;render({full:true});if(!d.tile)document.querySelector('#task-title')?.focus({preventScroll:true});}
  })();return true;
}

// Delegated once on the persistent shell, so patching part of the page can never leave a
// stale listener behind or bind the same form twice.
app.addEventListener('click',event=>{
  const el=event.target.closest('[data-flow],[data-action],[data-mode],[data-stage],[data-map],[data-pick],[data-avatar],[data-event],[data-building],[data-tile],[data-goal],[data-route]');
  if(!el||el.disabled)return;
  if(session?.role==='student'&&document.querySelector('[data-guided]')&&guidedClick(el))return;
  if(el.dataset.building!==undefined){if(!submitted()){ui.selected=ui.selected===el.dataset.building?null:el.dataset.building;patchBoard()}return}
  if(el.dataset.tile!==undefined){
    const tile=Number(el.dataset.tile);
    if(ui.selected){const id=ui.selected;ui.selected=null;if(team.state.tiles?.[id]===tile)patchBoard();else action({type:'place',id,tile})}
    else{ui.hover=tile;patchBoard()}
    return;
  }
  if(el.dataset.goal!==undefined){goTo(el.dataset.goal);return}
  if(el.dataset.action!==undefined)onAction(el);
  else if(el.dataset.mode!==undefined){authMode=el.dataset.mode;render()}
  else if(el.dataset.stage!==undefined)action({type:'stage',stage:Number(el.dataset.stage)});
  else if(el.dataset.route!==undefined)action({type:'route',id:el.dataset.route});
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
  else if(el.classList?.contains('code-input')){const cleaned=el.value.toUpperCase().replace(/[^A-Z0-9 -]/g,'').slice(0,16);if(el.value!==cleaned)el.value=cleaned}
});
app.addEventListener('focusin',event=>{if(event.target.dataset?.field!==undefined)postPresence(event.target.dataset.field)});
// Reading the land: pointing at a hex explains it, and hovering a map pin fetches its art early.
app.addEventListener('mouseover',event=>{
  const pin=event.target.closest?.('[data-map]');
  if(pin){preload(pin.dataset.map);return}
  const hex=event.target.closest?.('[data-tile]');
  if(hex&&!ui.selected&&ui.hover!==Number(hex.dataset.tile)){ui.hover=Number(hex.dataset.tile);morph(document.querySelector('#land-info'),tileInfo(team.state,lang,L(),ui.hover))}
});
// SVG hexes and buildings are not <button>s, so give them the keys a button has.
app.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&session?.role==='student'&&document.querySelector('[data-guided]')){if(!ui.busy)navigateTask('hub').catch(()=>{});return;}
  if(event.key==='Escape'){
    if(ui.selected){ui.selected=null;patchBoard();return}
    if(ui.overlay){closeOverlay();return}
    if(ui.drawer){ui.drawer=null;patchDrawer();return}
  }
  const el=event.target;
  if((event.key==='Enter'||event.key===' ')&&el instanceof SVGElement&&(el.dataset.tile!==undefined||el.dataset.building!==undefined)){event.preventDefault();el.dispatchEvent(new MouseEvent('click',{bubbles:true}))}
});
app.addEventListener('focusout',event=>{const key=event.target.dataset?.field;if(key!==undefined){flushField(key).catch(()=>{});postPresence(null)}});

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
