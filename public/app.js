import { trees, mapPoints, submissionGaps, textFields, normalizeCode, isCodeShape, codeLength } from '/shared/game.js';
import { dictionary, summaryKeys } from '/shared/i18n.js';

const app=document.querySelector('#app');
const noticeBox=document.querySelector('#notice');
const skipLink=document.querySelector('#skip-link');
let lang=localStorage.getItem('civ_lang')==='ja'?'ja':'en';
let session=null,team=null,roster=[],teams=[],stream=null,authMode='student',notice='',noticeType='info',teacherDetail=null,teacherDetailId=null,sync='saved';
let presenceFields={},presenceSent=null;
let saveTimers=new Map();
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
function adopt(data){session=data.authenticated?{role:data.role,name:data.name}:null;if(data.team)team=data.team;if(data.roster)roster=data.roster;if(data.teams)teams=data.teams;if(data.presence)presenceFields=data.presence}

function openStream(){
  stream?.close();stream=new EventSource('/api/events');
  stream.onopen=()=>{sync='saved';updateSync()};
  stream.onerror=()=>{sync='offline';updateSync()};
  stream.addEventListener('presence',event=>{const data=JSON.parse(event.data);roster=data.roster;presenceFields=data.fields;updateLiveBits();updatePresence()});
  stream.addEventListener('revoked',()=>{stream?.close();stream=null;session=null;team=null;roster=[];presenceFields={};render();toast(L().revoked,'error')});
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
  const incoming=data.team;
  roster=data.roster??roster;
  if(!(incoming.version>Number(team?.version??-1))){updateLiveBits();return}
  const previous=team;
  const stageChanged=previous?.state.stage!==incoming.state.stage;
  if(stageChanged&&saveTimers.size)await flushAll();
  const structural=!previous||stageChanged||previous.submittedAt!==incoming.submittedAt||previous.name!==incoming.name
    ||previous.state.mapPoint!==incoming.state.mapPoint
    ||previous.state.tech.join()!==incoming.state.tech.join()
    ||previous.state.civic.join()!==incoming.state.civic.join();
  const held=[];
  if(!structural){
    for(const key of textFields){
      if(previous.state[key]===incoming.state[key])continue;
      const el=document.querySelector(`[data-field="${key}"]`);
      if(el&&(document.activeElement===el||saveTimers.has(key))&&el.value!==incoming.state[key])held.push(key);
    }
  }
  team=incoming;
  if(structural)render({animate:stageChanged});
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
}

// Every render replaces the page, so remember where the keyboard was and put it back.
function captureFocus(){
  const el=document.activeElement;
  if(!el||el===document.body)return null;
  const data=el.dataset||{};
  const key=data.field?['data-field',data.field]:data.pick?['data-pick',data.pick]:data.map?['data-map',data.map]:data.stage?['data-stage',data.stage]:data.action?['data-action',data.action]:data.mode?['data-mode',data.mode]:null;
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
function render(options={}){
  const focus=captureFocus();
  document.documentElement.lang=lang;
  skipLink.textContent=L().skip;
  skipLink.hidden=!session;
  app.innerHTML=!session?authPage():session.role==='teacher'?teacherPage():studentPage(options.animate);
  updatePresence();restoreFocus(focus);
}
function authPage(){return `<div class="auth-page"><header class="simple-header"><div class="logo"><span>✦</span> BUILD YOUR CIV</div><button class="lang" data-action="language">${L().language}</button></header><section class="auth-hero"><div class="auth-copy"><div class="eyebrow">GAME · ゲーム</div><h1>${L().welcome}</h1><p class="tagline">${L().tagline}</p><p>${L().intro}</p><div class="hero-tags"><span>01 — 04</span><span>TEAM PLAY</span><span>LIVE</span></div></div><div class="auth-card"><div class="auth-tabs"><button class="${authMode==='student'?'active':''}" data-mode="student">${L().join}</button><button class="${authMode==='teacher'?'active':''}" data-mode="teacher">${L().teacher}</button></div><form id="auth-form">${authMode==='student'?`<label>${L().name}<input name="name" autocomplete="off" required maxlength="60" placeholder="${L().name}" /></label><label>${L().code}<input name="code" autocomplete="off" required maxlength="24" placeholder="ABC DEF GHI" class="code-input" /></label>`:`<label>${L().password}<input name="password" type="password" autocomplete="off" required placeholder="••••••••••••" /></label>`}<p class="typing-note">✎ ${L().typing}</p><button class="btn-primary full" type="submit">${authMode==='student'?L().enter:L().teacherEnter} <span>→</span></button></form></div></section><div class="auth-bottom"><div><b>01</b> ${L().steps[0]}</div><div><b>02</b> ${L().steps[1]}</div><div><b>03</b> ${L().steps[2]}</div><div><b>04</b> ${L().steps[3]}</div></div></div>`}
function topbar(teacher=false){return `<header class="topbar"><div class="logo"><span>✦</span> BUILD YOUR CIV</div><div class="top-actions">${teacher?'':`<div class="team-chip"><small>${L().team}</small><strong>${esc(team?.name)}</strong></div><div class="live"><i></i><span id="sync" aria-live="polite">${sync==='offline'?L().reconnecting:sync==='saving'?L().saving:L().save}</span></div>`}<button class="lang" data-action="language">${L().language}</button><button class="text-button light" data-action="logout">${L().signout}</button></div></header>`}
function studentPage(animate){const s=team.state;return `<div class="app-shell">${topbar()}<div class="subbar"><div class="members"><span class="members-label">${L().connected}</span><div id="roster">${roster.map(n=>`<span>${esc(n)}</span>`).join('')}</div></div><div class="shared-note">◎ ${L().sameScreen}</div></div><nav class="chapters" aria-label="Chapters">${L().steps.map((name,i)=>`<button data-stage="${i+1}" class="chapter ${s.stage===i+1?'current':''} ${s.stage>i+1?'complete':''}" ${submitted()?'disabled':''}><span>${s.stage>i+1?'✓':String(i+1).padStart(2,'0')}</span>${name}</button>`).join('')}</nav><main id="main" class="${animate?'main-enter':''}">${s.stage===1?placePage():s.stage===2?treePage('tech'):s.stage===3?treePage('civic'):storyPage()}</main><footer class="app-footer"><span>✦ BUILD YOUR CIV</span><span>${L().score}</span></footer></div>`}
function stageHero(stage,title,description){return `<div class="stage-hero stage-${stage}"><div class="stage-hero-copy"><div class="eyebrow">${L().chapter} 0${stage} ${L().of} 04</div><h1>${title}</h1><p>${description}</p></div></div>`}
function field(key,area=true){const s=team.state;return `<label class="answer-field"><span>${L()[key]}<small class="presence" data-presence="${key}"></small></span>${area?`<textarea data-field="${key}" placeholder="${L()[key+'Ph']}" maxlength="800" ${submitted()?'disabled':''}>${esc(s[key])}</textarea>`:`<input data-field="${key}" value="${esc(s[key])}" placeholder="${L()[key+'Ph']}" maxlength="160" ${submitted()?'disabled':''}/>`}</label>`}
function placePage(){const s=team.state;return `${stageHero(1,L().placeTitle,L().placeDesc)}<div class="page-grid"><section class="panel place-panel"><div class="panel-heading"><span class="eyebrow">01 / ${L().missionPlace}</span><h2>${L().map}</h2><p>${L().mapHelp}</p></div><div class="map-wrap"><img src="/assets/slide8-map.png" alt="World map with marked class locations" />${Object.keys(mapPoints).map(letter=>`<button class="map-dot ${s.mapPoint===letter?'active':''}" data-map="${letter}" aria-label="Map point ${letter}" aria-pressed="${s.mapPoint===letter}" ${submitted()?'disabled':''}>${letter}</button>`).join('')}</div><div class="field-grid">${field('location',false)}${field('terrain')}${field('resources')}${field('challenge')}</div></section><aside class="side-stack"><div class="mission-card"><span>✧ ${L().mission}</span><h3>${L().missionPlace}</h3><p>${L().thinkPlace}</p><p>${L().thinkAssumption}</p></div><div class="landscape-card"><img src="/assets/river-place.webp" alt="Illustrated river settlement" loading="lazy" /><div>${L().think}</div></div></aside></div>${navActions(1)}`}
function treeCard(item,kind){const chosen=team.state[kind].includes(item.id);const available=!item.parents.length||item.parents.some(p=>team.state[kind].includes(p));const full=team.state[kind].length>=7;const disabled=submitted()||(!chosen&&(!available||full));const parentNames=item.parents.map(p=>title(trees[kind].find(x=>x.id===p))).join(' / ');return `<button class="choice-card ${chosen?'chosen':''}" data-pick="${kind}:${item.id}" aria-pressed="${chosen}" ${disabled?'disabled':''}><span class="choice-icon">${item.icon}</span><strong>${title(item)}</strong><span class="choice-status">${chosen?L().chosen:!available?`${L().needs}: ${parentNames}`:full?L().limit:item.parents.length?L().available:L().start}</span><span class="choice-toggle">${chosen?'✓':'+'}</span></button>`}
function treePage(kind){const s=team.state,items=trees[kind],stage=kind==='tech'?2:3;return `${stageHero(stage,kind==='tech'?L().techTitle:L().civicTitle,L().treeDesc)}<div class="page-grid"><section class="panel choice-panel"><div class="panel-heading choice-heading"><div><span class="eyebrow">0${stage} / ${stage===2?L().missionTech:L().missionCivic}</span><h2>${kind==='tech'?L().steps[1]:L().steps[2]}</h2></div><div class="choice-count"><b>${s[kind].length}</b><span>/ 7</span></div></div>${[...new Set(items.map(x=>x.tier))].map(tier=>`<div class="tier-row"><div class="tier-index">0${tier+1}</div><div class="tier-grid">${items.filter(x=>x.tier===tier).map(x=>treeCard(x,kind)).join('')}</div></div>`).join('')}</section><aside class="side-stack"><div class="path-card"><div class="path-title"><span>✦</span><h3>${L().path}</h3><strong>${s[kind].length}/7</strong></div>${s[kind].length?`<ol>${s[kind].map(id=>{const x=items.find(y=>y.id===id);return `<li>${x.icon} ${title(x)}</li>`}).join('')}</ol>`:`<p>${L().emptyPath}</p>`}<div class="path-note">${L().pathNote}</div></div><div class="mission-card compact"><span>✧ ${L().mission}</span><h3>${stage===2?L().missionTech:L().missionCivic}</h3><p>${stage===2?L().geographyUsePh:L().impactPh}</p></div></aside></div>${navActions(stage)}`}
// One definition of the presentation rows, used by the student preview, the teacher
// review panel and the printout.
function summaryRowsFor(state){
  const listed=kind=>state[kind].map(id=>title(trees[kind].find(x=>x.id===id))).join(' → ');
  const values={place:state.mapPoint?`[${state.mapPoint}] ${state.location}`:'',tech:listed('tech'),civic:listed('civic')};
  return summaryKeys.map(key=>{
    const value=key in values?values[key]:state[key];
    return `<div class="summary-row"><dt>${esc(L()[key])}</dt><dd class="${value?'':'empty'}">${esc(value||L().noAnswer)}</dd></div>`;
  }).join('');
}
function submissionBoxBody(){
  if(submitted())return `<strong>✓ ${L().submitted}</strong><p>${L().submittedHint}</p>${button(L().print,'print','btn-outline')}`;
  const gaps=submissionGaps(team.state);
  return `<strong>${gaps.length?`${L().missing}: ${gaps.length}`:L().ready}</strong><p>${L().submitHint}</p>${gaps.length?`<div class="gap-list">${gaps.map(key=>`<span>${esc(L()[key])}</span>`).join('')}</div>`:''}<button class="btn-primary full" data-action="submit" ${gaps.length?'disabled':''}>${L().submit} →</button>`;
}
function storyPage(){return `${stageHero(4,L().storyTitle,L().storyDesc)}<div class="story-grid"><section class="panel story-panel"><div class="panel-heading"><span class="eyebrow">04 / ${L().missionStory}</span><h2>${L().missionStory}</h2></div><div class="story-section"><span>01 / ${L().govt}</span>${field('govt')}${field('economy')}${field('belief')}</div><div class="story-section"><span>02 / ${L().geographyUse}</span>${field('geographyUse')}${field('impact')}${field('tradeoff')}</div><div class="story-section"><span>03 / ${L().connection}</span>${field('connection')}</div></section><aside class="preview-panel"><div class="preview-head"><span>✦ GROUP PRESENTATION</span><h2>${L().preview}</h2><p>${L().previewHelp}</p></div><div class="preview-body"><h3>${esc(team.name)}</h3><p class="preview-roster">${esc(roster.join(' · '))}</p><dl id="summary">${summaryRowsFor(team.state)}</dl></div><div class="submission-box" id="submission">${submissionBoxBody()}</div></aside></div>${navActions(4)}`}
function navActions(stage){return `<div class="page-nav">${stage>1&&!submitted()?button(`← ${L().back}`,'previous','btn-ghost'):'<span></span>'}${stage<4&&!submitted()?button(`${L().next} →`,'next','btn-primary'):''}</div>`}
function teacherPage(){return `<div class="app-shell">${topbar(true)}<main id="main" class="teacher-main"><div class="teacher-intro"><div class="eyebrow">TEACHER STUDIO</div><h1>${L().teacherTitle}</h1><p>${L().teacherDesc}</p></div><div class="teacher-layout"><section class="teacher-left"><div class="panel create-panel"><div class="panel-heading"><h2>${L().createTeam}</h2></div><form id="create-team"><label class="answer-field"><span>${L().teamName}</span><input name="teamName" required maxlength="80" autocomplete="off" /></label><button class="btn-primary" type="submit">${L().create} →</button></form></div><div class="teacher-list" id="teacher-list">${teacherList()}</div></section><aside class="teacher-right" id="teacher-right">${teacherDetail?teacherDetailView():teacherWelcome()}</aside></div></main></div>`}
function teacherList(){return teams.length?teams.map(x=>teacherTeamCard(x)).join(''):`<div class="panel empty-teams">${L().noTeams}</div>`}
function teacherWelcome(){return `<div class="teacher-welcome"><img src="/assets/meeting.webp" alt="Two communities meeting" /><div>✦ ${L().studentWork}</div></div>`}
function teacherTeamCard(x){const code=newCodes.get(x.id);return `<div class="panel team-card"><div class="team-card-top"><div><h3>${esc(x.name)}</h3><span>${L().chapter} 0${x.state.stage} / 04 · ${x.state.tech.length}+${x.state.civic.length} ${L().chosen}</span></div><span class="status ${x.submittedAt?'submitted':''}">${x.submittedAt?L().submitted:L().working}</span></div>${code?`<div class="code-reveal"><small>${L().codeOnce}</small><strong>${esc(code)}</strong></div>`:''}<div class="team-card-actions">${button(L().review,`review:${x.id}`,'btn-outline')}${button(L().newCode,`code:${x.id}`,'btn-ghost')}${button(L().deleteTeam,`delete:${x.id}`,'btn-ghost danger')}</div></div>`}
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
  return `<div class="panel detail-panel"><div class="detail-header"><div><span class="eyebrow">${L().studentWork}</span><h2>${esc(x.name)}</h2><p>${x.submittedAt?`${L().submitted} · ${esc(x.submittedAt)}`:L().working}</p></div><button class="icon-button" data-action="close-detail" aria-label="${L().close}">×</button></div><div class="detail-roster"><div><b>${L().liveNow}:</b> ${esc(live.join(' · ')||'—')}</div><div><b>${L().joined}:</b> ${esc(joined.join(' · ')||'—')}</div></div><form id="rename-team"><label class="answer-field"><span>${L().renamePrompt}</span><input name="teamName" value="${esc(x.name)}" required maxlength="80" autocomplete="off" /></label><button class="btn-ghost" type="submit">${L().renameTeam}</button></form>${activityView()}<dl>${summaryRowsFor(x.state)}</dl><div class="detail-actions">${x.submittedAt?button(L().reopen,`reopen:${x.id}`,'btn-outline'):''}${button(L().print,'print','btn-outline')}${button(L().deleteTeam,`delete:${x.id}`,'btn-ghost danger')}</div></div>`;
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
async function action(payload){
  try{
    await flushAll();sync='saving';updateSync();
    const data=await api('/api/team/action',payload);
    if(!team||data.team.version>=team.version)team=data.team;
    roster=data.roster;sync='saved';render({animate:payload.type==='stage'});
  }catch(error){sync='saved';updateSync();toast(error.message,'error')}
}
function fieldInput(el){const key=el.dataset.field;const value=el.value;sync='saving';updateSync();clearTimeout(saveTimers.get(key));saveTimers.set(key,setTimeout(()=>saveField(key,value),650))}
async function saveField(key,value){
  saveTimers.delete(key);
  try{
    const data=await api('/api/team/action',{type:'field',key,value});
    if(data.team.version>=team.version)team=data.team;
    roster=data.roster;sync='saved';updateSync();updateSummary();
  }catch(error){sync='offline';updateSync();toast(error.message,'error')}
}
async function flushField(key){if(!saveTimers.has(key))return;clearTimeout(saveTimers.get(key));saveTimers.delete(key);const field=document.querySelector(`[data-field="${key}"]`);if(field)await saveField(key,field.value)}
async function flushAll(){for(const key of [...saveTimers.keys()])await flushField(key)}
async function postPresence(field){if(presenceSent===field)return;presenceSent=field;try{await api('/api/team/presence',{field})}catch{}}

async function onAction(el){
  const id=el.dataset.action;
  try{
    if(id==='language'){lang=lang==='en'?'ja':'en';localStorage.setItem('civ_lang',lang);render()}
    else if(id==='logout'){await flushAll();await api('/api/logout',{});stream?.close();stream=null;session=null;team=null;teacherDetail=null;teacherDetailId=null;presenceFields={};presenceSent=null;render()}
    else if(id==='next'||id==='previous'){await action({type:'stage',stage:team.state.stage+(id==='next'?1:-1)})}
    else if(id==='submit'){if(!confirm(L().submitConfirm))return;await flushAll();const data=await api('/api/team/submit',{});team=data.team;roster=data.roster;render();toast(L().submitted)}
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

// Delegated once on the persistent shell, so patching part of the page can never leave a
// stale listener behind or bind the same form twice.
app.addEventListener('click',event=>{
  const el=event.target.closest('[data-action],[data-mode],[data-stage],[data-map],[data-pick]');
  if(!el||el.disabled)return;
  if(el.dataset.action!==undefined)onAction(el);
  else if(el.dataset.mode!==undefined){authMode=el.dataset.mode;render()}
  else if(el.dataset.stage!==undefined)action({type:'stage',stage:Number(el.dataset.stage)});
  else if(el.dataset.map!==undefined)action({type:'map',point:el.dataset.map});
  else if(el.dataset.pick!==undefined){const [tree,id]=el.dataset.pick.split(':');action({type:'pick',tree,id})}
});
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
