import { trees, applyAction, hasCoreChoice, questStatus } from '../shared/game.js';
import { taskDefinitions, nextTask, taskAvailable, taskDone } from '../shared/flow.js';
import { f } from '../shared/flow-copy.js';
import { assessLayout, layoutChallenge, suggestTrail } from '../shared/layout.js';
import { generateLand, improvements, terrains, fitTiles, fits, hexes } from '../shared/land.js';
import { locations } from '../shared/world.js';
import { civilizationRoutes, routeEligibility } from '../shared/routes.js';
import { landMarkup } from './hexmap.js';
import { portraitMarkup, sceneMarkup } from './rpg.js';
import { field, treeMarkup, atlasMarkup, eventCard, renderSummaryRows, renderSubmissionBox } from './student-view.js';
const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const btn=(text,cmd,primary=false,disabled=false)=>`<button class="${primary?'btn-primary':'btn-outline'}" data-flow="${cmd}" ${disabled?'disabled':''}>${text}</button>`;
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
export function layoutPanel(state,lang,{building=null}={}) {
 const a=assessLayout(state),entry=a.buildings[building],name=id=>safe(improvements[id]?.name[lang]||id);
 const service=a.services.venues.length?'<details><summary>'+f(lang,'serviceReach')+'</summary>'+a.services.venues.map(id=>'<p><b>'+name(id)+'</b> → '+Object.entries(a.buildings).filter(([,b])=>a.buildings[id].coverage.includes(b.tile)).map(([target])=>name(target)).join(', ')+'</p>').join('')+'<p>'+f(lang,'unserved')+': '+Object.entries(a.buildings).filter(([,b])=>!b.served).map(([id])=>name(id)).join(', ')+'</p></details>':'';
 return `<div class="layout-status"><div><span>${f(lang,'food')}</span><strong>${f(lang,a.food.status)}</strong></div><div><span>${f(lang,'season')}</span><strong class="${a.season.atRisk.length?'warn':''}">${f(lang,a.season.status)}</strong></div><div><span>${f(lang,'service')}</span><strong>${a.services.venues.length} · ${a.services.covered.length} ${lang==='ja'?'マス':'hexes'}</strong></div></div>${entry?`<p class="site-effect"><b>${name(building)}</b> · ${f(lang,entry.connected?'connected':'isolated')}<br>${entry.role==='food'&&entry.exposed?f(lang,entry.buffered?'protected':'exposed'):f(lang,entry.served?'served':'unserved')}</p>`:''}`;
}
const doneControls=(lang,cmd='finish')=>`<div class="task-nav">${btn('← '+f(lang,'hub'),'hub')}${btn(f(lang,'continue')+' →',cmd,true)}</div>`;
function routeCards(team,lang) {
 return `<div class="route-options">${civilizationRoutes.map(route=>{
  const eligibility=routeEligibility(team.state,route),a=assessLayout(team.state).routes[route.id];
  const required=['tech','civic'].flatMap(kind=>route[kind].map(id=>trees[kind].find(x=>x.id===id)?.[lang]||id)).join(' / ');
  return `<button class="route-card ${team.state.route===route.id?'selected':''} ${eligibility.unlocked?'':'locked'}" data-route="${route.id}" ${team.submittedAt||!eligibility.unlocked?'disabled':''}><span class="route-symbol">${route.icon}</span><strong>${safe(route[lang])}</strong><p>${safe(route.description[lang])}</p><small>${safe(route.tradeoff[lang])}</small><span>${f(lang,a?.operational?'operational':'routePlanned')}</span>${required?`<small>${f(lang,'needs')}: ${safe(required)}</small>`:''}</button>`;
 }).join('')}</div>`;
}
function taskContent(team,lang,L,ui,playing) {
 const s=team.state,task=ui.task,locked=!!team.submittedAt,name=id=>safe(improvements[id]?.name[lang]||id);
 if(task==='place')return atlasMarkup(s,lang,L,locked)+doneControls(lang);
 if(task==='arrival'||task==='facts') {
  const location=locations[s.mapPoint];if(!location)return atlasMarkup(s,lang,L,locked);
  return `<div class="guided-landscape">${sceneMarkup(s.mapPoint,location.region[lang],playing)}</div><h2>${safe(location.region[lang])}</h2><ul class="place-facts">${location.facts[lang].map(x=>`<li>${safe(x)}</li>`).join('')}</ul><details><summary>${L.aboutLocation}</summary><p>${L.factScope}</p><p>${L.portraitNote}</p><a href="${location.source}" target="_blank" rel="noopener noreferrer">${L.source} ↗</a></details>${doneControls(lang)}`;
 }
 if(['placeAnswer','techAnswer','societyAnswer','beliefAnswer','contactAnswer'].includes(task))return field(task,s,lang,L,locked)+doneControls(lang);
 if(task==='origin'||task==='encounter')return eventCard(task,team,lang,L,{...ui,result:null}).replace(/<button class="event-later"[\s\S]*?<\/button>/,'')+`<div class="task-nav">${btn('← '+f(lang,'hub'),'hub')}</div>`;
 if(task==='tech'||task==='civic') {
  const special=trees[task].filter(x=>x.gate&&(!x.gate||s.events?.[x.gate[0]]===x.gate[1]));
  return `<p>${L.cardHint} · ${s[task].length}/7</p>${special.length?`<div class="guided-special">${special.map(x=>`<button class="btn-outline" data-pick="${task}:${x.id}" ${locked?'disabled':''}>${safe(x[lang])}</button>`).join('')}</div>`:''}${treeMarkup(task,s,lang,L,locked)}<p>${f(lang,'learned')}</p><div class="task-nav">${btn('← '+f(lang,'hub'),'hub')}${btn(f(lang,'finishChoices')+' →','finish',true,!hasCoreChoice(s,task))}</div>`;
 }
 if(task==='placement') {
  const preview=placementPreview(team,ui),a=assessLayout(preview.state),entry=a.buildings[ui.building];
  const land=generateLand(s.mapPoint),any=land&&hexes.some((_,i)=>fits(land,ui.building,i));
  return `<p>${f(lang,'suggestion')}</p><p>${safe(improvements[ui.building]?.why[lang]||'')}</p><div class="guided-map">${landMarkup(preview.state,lang,L,{selected:ui.building,path:[],coverage:entry?.coverage||[]})}</div>${preview.sites.length?`<p>${Number.isInteger(ui.site)?safe(terrains[generateLand(s.mapPoint).tiles[ui.site]][lang]):f(lang,'draftChoice')}</p>`:`<p class="site-warning">${f(lang,any?'noSpace':'noTerrain')}</p>`}<div class="comparison"><section><span>${f(lang,'before')}</span>${layoutPanel(s,lang,{building:ui.building})}</section><section><span>${f(lang,'after')}</span>${layoutPanel(preview.state,lang,{building:ui.building})}</section></div>${preview.error?`<p role="alert">${safe(preview.error)}</p>`:''}<div class="task-nav">${btn('← '+f(lang,'back'),'placement-back')}${btn(f(lang,'plan'),'keep-plan',false,locked||!ui.pick)}${btn(f(lang,'confirm'),'confirm-placement',true,locked||!Number.isInteger(ui.site)||!!preview.error)}</div>${!ui.pick?`<p>${btn(f(lang,'removeDevelopment'),'remove-development',false,locked)}</p>`:''}`;
 }
 if(['prep','services','routeCheck','assessment'].includes(task)) {
  const a=assessLayout(s),challenge=layoutChallenge(s),coverage=task==='services'?a.services.covered:[];
  const r=a.routes[s.route||'local'];
  const cmd=challenge.kind==='connect'?`connect:${challenge.id}`:['protect','serve'].includes(challenge.kind)?`move:${challenge.id}`:'manage';
  const line=f(lang,challenge.kind==='connect'?'connectChallenge':challenge.kind==='protect'?'protectChallenge':challenge.kind==='serve'?'serveChallenge':'layoutReady');
  return `<div class="guided-map">${landMarkup(s,lang,L,{locked:true,coverage})}</div>${layoutPanel(s,lang)}<p>${f(lang,'checkHint')}</p>${task==='routeCheck'?`<section class="single-challenge"><h2>${f(lang,r?.operational?'operational':'routePlanned')}</h2>${r?.missing.length?`<p>${f(lang,'needs')}: ${r.missing.map(x=>f(lang,x)).join(' · ')}</p>`:''}${btn(f(lang,'connect'),'trails',false,locked)}</section>`:`<section class="single-challenge"><span class="eyebrow">${f(lang,'challenge')}</span><p>${line} ${challenge.id?name(challenge.id):''}</p>${btn(f(lang,'challenge'),cmd,false,locked)}</section>`}<details><summary>${f(lang,'season')}</summary><p>${f(lang,a.season.hazard)}</p><p>${f(lang,'riskReason')}</p>${a.season.atRisk.map(id=>`<p>${name(id)} · ${f(lang,'exposed')}</p>`).join('')}</details>${doneControls(lang)}`;
 }
 if(task==='trail') {
  const path=ui.path||[],preview=path.length>1?trailPreview(s,path,ui.trailMode):s;
  return `<p>${f(lang,'trailHint')}</p><div class="guided-map">${landMarkup(s,lang,L,{path})}</div><p>${path.length>1?path.map(i=>safe(terrains[generateLand(s.mapPoint).tiles[i]][lang])).join(' → '):f(lang,'noPath')}</p><div class="comparison"><section><span>${f(lang,'before')}</span>${layoutPanel(s,lang)}</section><section><span>${f(lang,'after')}</span>${layoutPanel(preview,lang)}</section></div><div class="task-nav">${btn('← '+f(lang,'hub'),'hub')}${btn(f(lang,ui.trailMode==='remove'?'removeTrail':'addTrail'),'confirm-trail',true,path.length<2||locked)}</div><details><summary>${f(lang,'trails')}</summary><div class="trail-edges">${(s.trails||[]).map(([a,b])=>btn(`${a} ↔ ${b} · ${f(lang,'removeTrail')}`,`remove-edge:${a}:${b}`,false,locked)).join('')}</div></details>`;
 }
 if(task==='manage')return `<div class="manage-list">${[...s.tech,...s.civic].map(id=>`<button data-flow="move:${id}" class="building-option" ${locked?'disabled':''}><strong>${name(id)}</strong><span>${Number.isInteger(s.tiles?.[id])?f(lang,assessLayout(s).buildings[id]?.connected?'connected':'isolated'):f(lang,'planned')}</span></button>`).join('')}</div>`+doneControls(lang);
 if(task==='route')return routeCards(team,lang)+doneControls(lang);
 if(task==='submission'||task==='review')return `<dl id="summary">${renderSummaryRows(s,lang,L)}</dl>${task==='submission'?`<div id="submission">${renderSubmissionBox(team,L)}</div>`:`<nav class="review-tasks">${taskDefinitions.filter(t=>t.id!=='submission').map(t=>btn(f(lang,t.id),`task:${t.id}`,false,!taskAvailable(t.id,team,ui.seen))).join('')}</nav>`}${doneControls(lang,'hub')}`;
 if(task==='result')return `${ui.eventResult?eventCard(ui.eventResult,team,lang,L,{...ui,result:ui.eventResult}).replace('data-action="close-overlay"','data-flow="hub"'):`<p>${f(lang,'result')}</p><div class="guided-map">${landMarkup(s,lang,L,{locked:true})}</div>${layoutPanel(s,lang,{building:ui.building})}${doneControls(lang,'hub')}`}`;
 return '';
}
function trailPreview(state,path,mode){try{return applyAction(state,{type:'trail',path,mode:mode||'add'});}catch{return state;}}
export function renderGuidedView({team,roster,lang,L,topbar,playing,ui}) {
 const next=nextTask(team,ui.seen),task=ui.task||'hub',current=taskDefinitions.find(x=>x.id===task),stage=current?.stage||next.stage;
 const title=task==='hub'?f(lang,next.id):task==='placement'?f(lang,'placement'):task==='trail'?f(lang,'trails'):task==='result'?f(lang,'outcome'):f(lang,task);
 const progress=taskDefinitions.filter(t=>taskDone(t.id,team,ui.seen)).length;
 return `<div class="app-shell rpg-shell guided-shell">${topbar}<div class="subbar"><div class="members"><span class="members-label">${L.connected}</span><div id="roster">${roster.map(n=>`<span>${safe(n)}</span>`).join('')}</div></div><span>${f(lang,'independent')}</span></div><main id="main" class="guided-main" data-guided><header class="guided-heading"><div>${portraitMarkup(team.state.mapPoint,'')}<div><span class="eyebrow">${safe(team.name)} · ${L.steps[stage-1]}</span><h1 id="task-title" tabindex="-1">${title}</h1></div></div><span class="guided-progress">${progress}/${taskDefinitions.length}</span></header>${task==='hub'?`<section class="hub-map">${team.state.mapPoint?landMarkup(team.state,lang,L,{locked:!!team.submittedAt}):`<p>${f(lang,'place')}</p>`}</section><section class="next-task"><span>${f(lang,'nextTask')}</span><h2>${f(lang,next.id)}</h2>${btn(f(lang,'openTask')+' →',`task:${next.id}`,true)}</section><nav class="hub-links">${btn(f(lang,'facts'),'task:facts')}${btn(f(lang,'manage'),'task:manage',false,!team.state.mapPoint)}${btn(f(lang,'connect'),'trails',false,!team.state.mapPoint||!!team.submittedAt)}${btn(f(lang,'review'),'task:review')}</nav>`:`<section class="focused-task task-enter" data-task="${safe(task)}">${taskContent(team,lang,L,{...ui,task},playing)}</section>`}</main><footer class="app-footer"><span>BUILD YOUR CIV</span><span>${L.score}</span></footer></div>`;
}
