import { trees, applyAction, hasCoreChoice } from '../shared/game.js';
import { taskDefinitions, nextTask, taskAvailable, taskDone } from '../shared/flow.js';
import { f, ff } from '../shared/flow-copy.js';
import { assessLayout, layoutChallenge, buildingRole, FOOD } from '../shared/layout.js';
import { generateLand, improvements, terrains, fitTiles, fits, hexes, isRevealed } from '../shared/land.js';
import { locations } from '../shared/world.js';
import { civilizationRoutes, routeEligibility } from '../shared/routes.js';
import { landMarkup, tileInfo } from './hexmap.js';
import { portraitMarkup, sceneMarkup } from './rpg.js';
import { field, treeMarkup, atlasMarkup, eventCard, renderSummaryRows, renderSubmissionBox, card, roleTag } from './student-view.js';
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(text,cmd,primary=false,disabled=false)=>`<button class="${primary?'btn-primary':'btn-outline'}" data-flow="${cmd}" ${disabled?'disabled':''}>${text}</button>`;
const cap=word=>word[0].toUpperCase()+word.slice(1);
const writingTasks=['placeAnswer','techAnswer','societyAnswer','beliefAnswer','contactAnswer'];
export function placementPreview(team,ui) {
 let state=team.state,error='';
 try {
  if(ui.pick)state=applyAction(state,{type:'pick',tree:ui.pick.tree,id:ui.pick.id,tile:null});
  if(Number.isInteger(ui.site))state=applyAction(state,{type:'place',id:ui.building,tile:ui.site});
 }catch(e){error=e.message;}
 return {state,error,sites:fitTiles(ui.pick?applyPlan(team.state,ui.pick):team.state,ui.building)};
}
function applyPlan(state,pick){try{return applyAction(state,{type:'pick',tree:pick.tree,id:pick.id,tile:null});}catch{return state;}}
export function suggestedSite(state,id) {
 return fitTiles(state,id).sort((a,b)=>{
  const score=i=>{const next={...state,tiles:{...state.tiles,[id]:i}},x=assessLayout(next).buildings[id];return (x?.connected?100:0)+(x?.buffered?10:0)-(x?.exposed?20:0)-hexes[i].dist;};
  return score(b)-score(a)||a-b;
 })[0]??null;
}
// The three headline facts about a homeland layout, in plain words.
function statusRows(state,lang) {
 const a=assessLayout(state),n=a.services.venues.length,c=a.services.covered.length;
 return [
  {label:f(lang,'food'),value:f(lang,a.food.status)},
  {label:f(lang,'season'),value:f(lang,a.season.status),warn:a.season.atRisk.length>0},
  {label:f(lang,'service'),value:n?ff(lang,n===1?'communityOne':'communityCount',{n,c}):f(lang,'communityNone')}
 ];
}
// One building's situation: what it is for, whether it works, and how it fares.
function buildingLine(state,lang,id) {
 const entry=assessLayout(state).buildings[id];
 if(!entry)return '';
 const detail=entry.role==='food'?f(lang,!entry.exposed?'foodSafe':entry.buffered?'protected':'exposed'):f(lang,entry.served?'served':'unserved');
 return `<p class="site-effect"><b>${safe(improvements[id]?.name[lang]||id)}</b>${roleTag(id,lang)}<br>${f(lang,entry.connected?'connected':'isolated')} · ${detail}</p>`;
}
export function layoutPanel(state,lang,{building=null}={}) {
 return `<div class="layout-status">${statusRows(state,lang).map(row=>`<div><span>${row.label}</span><strong class="${row.warn?'warn':''}">${safe(row.value)}</strong></div>`).join('')}</div>${building?buildingLine(state,lang,building):''}`;
}
// Only what a confirmation would change, so a preview reads as cause and effect.
function changesPanel(before,after,lang,building=null) {
 const was=statusRows(before,lang),now=statusRows(after,lang);
 const rows=now.map((row,i)=>row.value===was[i].value?'':`<li><span>${row.label}</span>${safe(was[i].value)} → <strong class="${row.warn?'warn':''}">${safe(row.value)}</strong></li>`).join('');
 return `<section class="change-list"><h3>${f(lang,'changes')}</h3>${building?buildingLine(after,lang,building):''}${rows?`<ul>${rows}</ul>`:`<p>${f(lang,'noChange')}</p>`}</section>`;
}
function rolesHelp(lang) {
 return `<details class="roles-help"><summary>${f(lang,'rolesTitle')}</summary><ul><li>${roleTag('irrigation',lang)} ${f(lang,'roleFoodHelp')}</li><li>${roleTag('pottery',lang)} ${f(lang,'roleStorageHelp')}</li><li>${roleTag('laws',lang)} ${f(lang,'roleServiceHelp')}</li><li>${f(lang,'roleLinkHelp')}</li></ul></details>`;
}
// The single most useful fix on a check screen, named by what it would do.
function challengeBox(state,lang,kinds,locked) {
 const challenge=layoutChallenge(state),name=id=>safe(improvements[id]?.name[lang]||id);
 if(!kinds.includes(challenge.kind))return `<section class="single-challenge done"><p>✓ ${f(lang,'allGood')}</p></section>`;
 const label=challenge.kind==='connect'?ff(lang,'fixConnect',{b:name(challenge.id)}):ff(lang,challenge.kind==='protect'?'fixProtect':'fixServe',{s:name(challenge.id),t:name(challenge.target)});
 const cmd=challenge.kind==='connect'?`connect:${challenge.id}`:`move:${challenge.id}`;
 return `<section class="single-challenge"><span class="eyebrow">${f(lang,'challenge')}</span><p>${f(lang,'checkHint')}</p>${btn(label,cmd,false,locked)}</section>`;
}
function prepCheck(s,lang,L,locked) {
 const a=assessLayout(s),food=FOOD.filter(id=>a.buildings[id]);
 const list=food.length?`<ul class="check-list">${food.map(id=>{const b=a.buildings[id],risky=b.exposed&&!b.buffered;return `<li class="${risky?'warn':''}"><span>${risky?'!':'✓'}</span><b>${safe(improvements[id].name[lang])}</b> · ${f(lang,!b.connected?'isolated':!b.exposed?'foodSafe':b.buffered?'protected':'exposed')}</li>`;}).join('')}</ul>`:`<p class="check-empty">${f(lang,'noFoodYet')}</p>`;
 return `<h2 class="check-question">${f(lang,'prepQuestion')}</h2>${a.season.hazard?`<p class="hazard-note"><b>${f(lang,'hardSeasonHere')}</b> · ${f(lang,a.season.hazard).replace(/[:：]\s*/,' — ')}</p>`:''}<div class="guided-map">${landMarkup(s,lang,L,{locked:true})}</div>${list}<p class="check-help">${f(lang,'riskReason')}</p>${challengeBox(s,lang,['connect','protect'],locked)}`;
}
function servicesCheck(s,lang,L,locked) {
 const a=assessLayout(s),name=id=>safe(improvements[id]?.name[lang]||id),entries=Object.entries(a.buildings);
 const reach=a.services.venues.map(id=>`<li><b>${name(id)}</b> → ${entries.filter(([,b])=>a.buildings[id].coverage.includes(b.tile)).map(([target])=>name(target)).join(', ')}</li>`).join('');
 const unserved=entries.filter(([,b])=>!b.served).map(([id])=>name(id));
 const body=a.services.venues.length?`<h3>${f(lang,'serviceReach')}</h3><ul class="check-list">${reach}</ul><p><b>${f(lang,'unservedList')}:</b> ${unserved.join(', ')||f(lang,'none')}</p>`:`<p class="check-empty">${f(lang,'noVenues')}</p>`;
 return `<h2 class="check-question">${f(lang,'servicesQuestion')}</h2><div class="guided-map">${landMarkup(s,lang,L,{locked:true,coverage:a.services.covered})}</div>${body}<p class="check-help">${f(lang,'coverage')}</p>${challengeBox(s,lang,['connect','serve'],locked)}`;
}
function routeCheck(s,lang,L,locked) {
 const id=s.route||'local',route=civilizationRoutes.find(r=>r.id===id),r=assessLayout(s).routes[id];
 const keys=id==='local'?[]:['discoveries','technologySite','civicSite',id==='water'?'waterEdge':'landEdge'];
 const list=keys.map(key=>{const met=!r?.missing.includes(key);return `<li class="${met?'':'warn'}"><span>${met?'✓':'○'}</span>${f(lang,key)}</li>`;}).join('');
 const body=id==='local'?`<p>${f(lang,'localReady')}</p>`:`<p><b>${safe(route[lang])}</b> · ${f(lang,r?.operational?'operational':'routePlanned')}</p><h3>${f(lang,'routeNeeds')}</h3><ul class="check-list">${list}</ul>${r?.operational?'':`<p class="check-help">${f(lang,'routeStillPlan')}</p>${btn(f(lang,'connect'),'trails',false,locked)}`}`;
 return `<h2 class="check-question">${f(lang,'routeQuestion')}</h2><div class="guided-map">${landMarkup(s,lang,L,{locked:true})}</div>${body}`;
}
const doneControls=(lang,cmd='finish')=>`<div class="task-nav">${btn('← '+f(lang,'hub'),'hub')}${btn(f(lang,'continue')+' →',cmd,true)}</div>`;
function routeCards(team,lang) {
 return `<div class="route-options">${civilizationRoutes.map(route=>{
  const eligibility=routeEligibility(team.state,route),a=assessLayout(team.state).routes[route.id],chosen=team.state.route===route.id;
  const required=['tech','civic'].filter(kind=>route[kind].length).map(kind=>`<span class="route-requirement ${eligibility[kind]?'met':''}"><b>${eligibility[kind]?'✓':'○'} ${f(lang,kind==='tech'?'technologyCard':'societyCard')} · ${f(lang,'oneOf')}</b>${route[kind].map(id=>safe(trees[kind].find(x=>x.id===id)?.[lang]||id)).join(' / ')}</span>`).join('');
  const status=route.id==='local'?f(lang,'routeAlways'):f(lang,eligibility.unlocked?'routeOpen':'routeClosed');
  return `<button class="route-card ${chosen?'selected':''} ${eligibility.unlocked?'':'locked'}" data-route="${route.id}" aria-pressed="${chosen}" ${team.submittedAt||!eligibility.unlocked?'disabled':''}><span class="route-card-top"><span class="route-symbol">${route.icon}</span><span class="route-status">${status}</span></span><strong>${safe(route[lang])}</strong><p>${safe(route.description[lang])}</p>${required?`<div class="route-requirements">${required}</div>`:''}${chosen&&route.id!=='local'?`<span class="route-map-state">${f(lang,a?.operational?'operational':'routePlanned')}</span>`:''}<small>${safe(route.tradeoff[lang])}</small></button>`;
 }).join('')}</div>`;
}
// The map legend only names what is actually drawn on this team's map right now.
function mapLegend(state,lang) {
 const a=assessLayout(state),origin=state.events?.origin;
 const items=['legendSettlement',
  !origin&&'legendHazard',origin==='steward'&&'legendStores',origin==='explore'&&'legendMapped',
  Object.keys(state.tiles||{}).length&&'legendBuildings',a.season.atRisk.length&&'legendRisk',(state.trails||[]).length&&'legendPath',
  origin&&(state.stage>=3||state.events?.encounter)&&'legendNeighbors',hexes.some((_,i)=>!isRevealed(state,i))&&'legendFog'].filter(Boolean);
 return `<p class="map-legend">${items.map(key=>f(lang,key)).join(' ')}</p>`;
}
function howItWorks(lang,open) {
 return `<details class="how-it-works" ${open?'open':''}><summary>${f(lang,'howTitle')}</summary><p>${f(lang,'howGoal')}</p><p>${f(lang,'howNoScore')}</p><p>${f(lang,'howEnd')}</p></details>`;
}
function chapterStrip(L,stage) {
 return `<ol class="chapter-strip">${L.steps.map((name,i)=>`<li class="${i+1===stage?'current':i+1<stage?'done':''}"${i+1===stage?' aria-current="step"':''}><span>${i+1<stage?'✓':i+1}</span>${safe(name)}</li>`).join('')}</ol>`;
}
function taskContent(team,lang,L,ui,playing) {
 const s=team.state,task=ui.task,locked=!!team.submittedAt,name=id=>safe(improvements[id]?.name[lang]||id);
 if(task==='place')return atlasMarkup(s,lang,L,locked)+doneControls(lang);
 if(task==='arrival'||task==='facts') {
  const location=locations[s.mapPoint];if(!location)return atlasMarkup(s,lang,L,locked);
  return `<div class="guided-landscape">${sceneMarkup(s.mapPoint,location.region[lang],playing)}</div><h2>${safe(location.region[lang])}</h2><ul class="place-facts">${location.facts[lang].map(x=>`<li>${safe(x)}</li>`).join('')}</ul><details><summary>${L.aboutLocation}</summary><p>${L.factScope}</p><p>${L.portraitNote}</p><a href="${location.source}" target="_blank" rel="noopener noreferrer">${L.source} ↗</a></details>${doneControls(lang)}`;
 }
 if(writingTasks.includes(task))return field(task,s,lang,L,locked)+doneControls(lang);
 if(task==='origin'||task==='encounter')return eventCard(task,team,lang,L,{...ui,result:null}).replace(/<button class="event-later"[\s\S]*?<\/button>/,'')+`<div class="task-nav">${btn('← '+f(lang,'hub'),'hub')}</div>`;
 if(task==='tech'||task==='civic') {
  const special=trees[task].filter(x=>x.gate&&s.events?.[x.gate[0]]===x.gate[1]);
  return `<p>${L.cardHint} · <b>${s[task].length}/7</b></p>${special.length?`<div class="guided-special"><span class="special-label">${f(lang,'decisionCard')}</span>${special.map(x=>card(x,task,s,lang,L,locked)).join('')}</div>`:''}${treeMarkup(task,s,lang,L,locked)}<p>${f(lang,'learned')}</p>${rolesHelp(lang)}<div class="task-nav">${btn('← '+f(lang,'hub'),'hub')}${btn(f(lang,'finishChoices')+' →','finish',true,!hasCoreChoice(s,task))}</div>`;
 }
 if(task==='placement') {
  const preview=placementPreview(team,ui),land=generateLand(s.mapPoint),entry=assessLayout(preview.state).buildings[ui.building];
  const any=land&&hexes.some((_,i)=>fits(land,ui.building,i)),picked=Number.isInteger(ui.site);
  const where=preview.sites.length?`<p>${picked?`<b>${safe(terrains[land.tiles[ui.site]][lang])}</b> · ${f(lang,'suggestion')}`:f(lang,'draftChoice')}</p>`:`<p class="site-warning">${f(lang,any?'noSpace':'noTerrain')}</p>`;
  return `<p class="placement-building"><b>${name(ui.building)}</b>${roleTag(ui.building,lang)}<br>${safe(improvements[ui.building]?.why[lang]||'')}</p><div class="guided-map">${landMarkup(preview.state,lang,L,{selected:ui.building,path:[],coverage:entry?.coverage||[]})}</div>${where}${picked?changesPanel(s,preview.state,lang,ui.building):''}${preview.error?`<p role="alert">${safe(preview.error)}</p>`:''}<div class="task-nav">${btn('← '+f(lang,'back'),'placement-back')}${btn(f(lang,'plan'),'keep-plan',false,locked)}${btn(f(lang,'confirm'),'confirm-placement',true,locked||!picked||!!preview.error)}</div>${!ui.pick?`<p>${btn(f(lang,'removeDevelopment'),'remove-development',false,locked)}</p>`:''}`;
 }
 if(task==='prep')return prepCheck(s,lang,L,locked)+doneControls(lang);
 if(task==='services')return servicesCheck(s,lang,L,locked)+doneControls(lang);
 if(task==='routeCheck')return routeCheck(s,lang,L,locked)+doneControls(lang);
 if(task==='assessment')return `${tileInfo(s,lang,L,ui.hover)}<div class="guided-map">${landMarkup(s,lang,L,{locked:true})}</div>${layoutPanel(s,lang)}${doneControls(lang,'hub')}`;
 if(task==='trail') {
  const path=ui.path||[],chosen=ui.pathTarget!=null||path.length>1,preview=path.length>1?trailPreview(s,path,ui.trailMode):s;
  const line=!chosen?f(lang,'trailPick'):path.length>1?path.map(i=>safe(terrains[generateLand(s.mapPoint).tiles[i]][lang])).join(' → '):f(lang,'noPath');
  return `<p>${f(lang,'trailHint')}</p><div class="guided-map">${landMarkup(s,lang,L,{path})}</div><p class="${chosen&&path.length<2?'site-warning':''}">${line}</p>${path.length>1?changesPanel(s,preview,lang):''}<div class="task-nav">${btn('← '+f(lang,'hub'),'hub')}${btn(f(lang,ui.trailMode==='remove'?'removeTrail':'addTrail'),'confirm-trail',true,path.length<2||locked)}</div>${(s.trails||[]).length?`<details><summary>${f(lang,'trails')}</summary><div class="trail-edges">${s.trails.map(([a,b])=>btn(`${a} ↔ ${b} · ${f(lang,'removeTrail')}`,`remove-edge:${a}:${b}`,false,locked)).join('')}</div></details>`:''}`;
 }
 if(task==='manage')return `<div class="manage-list">${[...s.tech,...s.civic].map(id=>`<button data-flow="move:${id}" class="building-option" ${locked?'disabled':''}><strong>${name(id)}${roleTag(id,lang)}</strong><span>${Number.isInteger(s.tiles?.[id])?f(lang,assessLayout(s).buildings[id]?.connected?'connected':'isolated'):f(lang,'planned')}</span></button>`).join('')}</div>${rolesHelp(lang)}`+doneControls(lang,'hub');
 if(task==='route')return routeCards(team,lang)+doneControls(lang);
 if(task==='submission'||task==='review')return `<dl id="summary">${renderSummaryRows(s,lang,L)}</dl>${task==='submission'?`<div id="submission">${renderSubmissionBox(team,L)}</div>`:`<nav class="review-tasks">${taskDefinitions.filter(t=>t.id!=='submission').map(t=>btn(f(lang,t.id),`task:${t.id}`,false,!taskAvailable(t.id,team,ui.seen))).join('')}</nav>`}${task==='submission'?'<div class="task-nav">'+btn('← '+f(lang,'hub'),'hub')+'</div>':doneControls(lang,'hub')}`;
 if(task==='result') {
  if(ui.eventResult)return eventCard(ui.eventResult,team,lang,L,{...ui,result:ui.eventResult}).replace('data-action="close-overlay"','data-flow="hub"');
  // After a card is placed from its tree, the natural next step is another card or finishing.
  const tree=ui.returnTo&&hasCoreChoice(s,ui.returnTo)?ui.returnTo:null;
  const nav=tree?`<div class="task-nav">${btn('← '+f(lang,'chooseAnother'),'task:'+tree)}${btn(f(lang,'finishChoices')+' →','finish',true)}</div>`:doneControls(lang,'hub');
  return `<p>${f(lang,'result')}</p><div class="guided-map">${landMarkup(s,lang,L,{locked:true})}</div>${layoutPanel(s,lang,{building:ui.building})}${nav}`;
 }
 return '';
}
function trailPreview(state,path,mode){try{return applyAction(state,{type:'trail',path,mode:mode||'add'});}catch{return state;}}
const titles={hub:null,placement:'placement',trail:'trails',result:'outcome'};
export function renderGuidedView({team,roster,lang,L,topbar,playing,ui,sync="saved"}) {
 const next=nextTask(team,ui.seen),task=ui.task||'hub',current=taskDefinitions.find(x=>x.id===task),stage=current?.stage||next.stage;
 const title=task==='hub'?f(lang,next.id):f(lang,titles[task]||task);
 const why=task==='hub'?'':f(lang,task+'Why');
 const progress=taskDefinitions.filter(t=>taskDone(t.id,team,ui.seen)).length;
 const hasBuildings=Object.keys(team.state.tiles||{}).length>0,locked=!!team.submittedAt;
 const hub=`${chapterStrip(L,stage)}${howItWorks(lang,stage===1)}<section class="hub-map">${team.state.mapPoint?landMarkup(team.state,lang,L,{locked}):`<p>${f(lang,'place')}</p>`}</section>${team.state.mapPoint?mapLegend(team.state,lang):''}<section class="next-task"><span>${f(lang,'nextTask')}</span><h2>${f(lang,next.id)}</h2><p>${f(lang,next.id+'Why')}</p>${btn(f(lang,'openTask')+' →',`task:${next.id}`,true)}</section><nav class="hub-links">${btn(f(lang,'facts'),'task:facts')}${hasBuildings?btn(f(lang,'manage'),'task:manage')+btn(f(lang,'connect'),'trails',false,locked):''}${btn(f(lang,'review'),'task:review')}</nav>`;
 return `<div class="app-shell rpg-shell guided-shell">${topbar}<div class="subbar"><div class="members"><span class="members-label">${L.connected}</span><div id="roster">${roster.map(n=>`<span>${safe(n)}</span>`).join('')}</div></div><span>${f(lang,'independent')}</span></div><main id="main" class="guided-main" data-guided><header class="guided-heading"><div>${portraitMarkup(team.state.mapPoint,'')}<div><span class="eyebrow">${safe(team.name)} · ${ff(lang,'chapter',{n:stage,name:L.steps[stage-1]})}</span><h1 id="task-title" tabindex="-1">${title}</h1>${why&&!why.endsWith('Why')?`<p class="task-why">${why}</p>`:''}</div></div><span class="guided-progress">${ff(lang,'tasksDone',{n:progress,total:taskDefinitions.length})}<small data-sync>${sync==='offline'?L.reconnecting:sync==='saving'?L.saving:L.save}</small></span></header>${task==='hub'?hub:`<section class="focused-task task-enter" data-task="${safe(task)}">${taskContent(team,lang,L,{...ui,task},playing)}</section>`}</main><footer class="app-footer"><span>BUILD YOUR CIV</span><span>${L.score}</span></footer></div>`;
}
