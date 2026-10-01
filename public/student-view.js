import { trees, mapPoints, gateOpen, hasCoreChoice, questStatus, submissionGaps } from '../shared/game.js';
import { civilizationRoutes, routeById, routeEligibility } from '../shared/routes.js';
import { locations, characters, outcomes } from '../shared/world.js';
import { summaryKeys } from '../shared/i18n.js';
import { improvements, terrains, generateLand, fitTiles } from '../shared/land.js';
import { sceneMarkup, portraitMarkup, cardIcon } from './rpg.js';
import { landMarkup, tileInfo, movingInfo, buildingList, landSummary } from './hexmap.js';
import { councilPrompt, seasonText, fill } from './prompts.js';
import { layoutReport } from '../shared/layout-report.js';

const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localized=(value,lang)=>value?.[lang]??'';
const cardName=(kind,id,lang)=>{const item=trees[kind].find(x=>x.id===id);return item?localized(item,lang):id};
const choiceName=(id,L)=>L[id+'Choice']||id;
const cap=word=>word[0].toUpperCase()+word.slice(1);
const ROMAN=['I','II','III','IV'];

export function renderSummaryRows(state,lang,L){
  const values={mapEffects:layoutReport(state,lang),
    place:state.mapPoint?`[${state.mapPoint}] ${localized(locations[state.mapPoint]?.region,lang)}`:'',
    avatar:localized(characters[state.mapPoint],lang),
    tech:state.tech.map(id=>cardName('tech',id,lang)).join(' → '),
    civic:state.civic.map(id=>cardName('civic',id,lang)).join(' → '),
    land:landSummary(state,lang),
    route:routeById(state.route||'local')?.[lang],
    origin:state.events?.origin?`${choiceName(state.events.origin,L)} — ${localized(outcomes[state.events.origin]?.benefit,lang)} ${localized(outcomes[state.events.origin]?.tradeoff,lang)}`:'',
    encounter:state.events?.encounter?`${choiceName(state.events.encounter,L)} — ${localized(outcomes[state.events.encounter]?.benefit,lang)} ${localized(outcomes[state.events.encounter]?.tradeoff,lang)}`:''
  };
  return summaryKeys.map(key=>{const value=key in values?values[key]:state[key];return `<div class="summary-row"><dt>${safe(L[key])}</dt><dd class="${value?'':'empty'}">${safe(value||L.noAnswer)}</dd></div>`}).join('');
}
export function renderSubmissionBox(team,L){
  if(team.submittedAt)return `<strong>✓ ${L.submitted}</strong><p>${L.submittedHint}</p><button class="btn-outline" data-action="print">${L.print}</button>`;
  const gaps=submissionGaps(team.state);
  return `<strong>${gaps.length?`${L.missing}: ${gaps.length}`:L.ready}</strong><p>${L.submitHint}</p>${gaps.length?`<div class="gap-list">${gaps.map(key=>`<span>${safe(L[key])}</span>`).join('')}</div>`:''}<button class="btn-primary full" data-action="submit" ${gaps.length?'disabled':''}>${L.submit} →</button>`;
}
export function renderQuestLog(team,L){
  const done=questStatus(team.state,!!team.submittedAt);
  return `<section class="quest-log" id="quest-log" aria-label="${L.questLog}"><div class="quest-head"><h2>${L.questLog}</h2><span>${done.filter(Boolean).length} / 4</span></div><ol>${L.questNames.map((name,i)=>`<li class="${done[i]?'earned':team.state.stage===i+1?'active':''}"><span class="quest-seal">${done[i]?'✓':String(i+1).padStart(2,'0')}</span><div><strong>${name}</strong><small>${done[i]?L.earned:L.questDescriptions[i]}</small></div></li>`).join('')}</ol></section>`;
}

// What each era asks of the team. Every objective names where to go to do it, so the
// checklist doubles as navigation: the map, an event card, a tree, or a council question.
export function objectives(team){
  const s=team.state,filled=key=>!!String(s[key]??'').trim();
  return [
    [{id:'place',done:!!s.mapPoint,goal:'atlas'},{id:'placeAnswer',done:filled('placeAnswer'),goal:'field:placeAnswer'},{id:'origin',done:!!s.events?.origin,goal:'event:origin'}],
    [{id:'tech',done:hasCoreChoice(s,'tech'),goal:'drawer:tech'},{id:'techAnswer',done:filled('techAnswer'),goal:'field:techAnswer'}],
    [{id:'encounter',done:!!s.events?.encounter,goal:'event:encounter'},{id:'civic',done:hasCoreChoice(s,'civic'),goal:'drawer:civic'},{id:'societyAnswer',done:filled('societyAnswer'),goal:'field:societyAnswer'},{id:'beliefAnswer',done:filled('beliefAnswer'),goal:'field:beliefAnswer'}],
    [{id:'contact',done:filled('contactAnswer'),goal:'field:contactAnswer'},{id:'submit',done:!!team.submittedAt,goal:'submit'}]
  ];
}
const eraFields=[['placeAnswer'],['techAnswer'],['societyAnswer','beliefAnswer'],['contactAnswer']];
// An event can be opened once its conditions are met; it waits until the team decides.
export function eventReady(id,state){
  return id==='origin'?!!(state.mapPoint&&state.placeAnswer.trim()):!!(state.events?.origin&&hasCoreChoice(state,'tech'));
}
export const pendingEvent=state=>!state.events?.origin&&eventReady('origin',state)?'origin':state.stage>=3&&!state.events?.encounter&&eventReady('encounter',state)?'encounter':null;

export function eraTrackMarkup(team,L){
  const state=team.state,locked=!!team.submittedAt,goals=objectives(team);
  return L.steps.map((name,i)=>{
    const list=goals[i],done=list.filter(g=>g.done).length;
    return `<button data-stage="${i+1}" class="era ${state.stage===i+1?'current':''} ${done===list.length?'complete':''}" ${locked||i+1>state.stage&&!goals.slice(0,i).every(step=>step.every(g=>g.done))?'disabled':''} aria-current="${state.stage===i+1?'step':'false'}"><span class="era-num">${L.gbEra} ${ROMAN[i]}</span><span class="era-name">${name}</span><span class="era-pips" aria-label="${done} / ${list.length}">${list.map(g=>`<i class="${g.done?'on':''}"></i>`).join('')}</span></button>`;
  }).join('');
}

export const field=(key,state,lang,L,locked)=>{
  const {q,starter}=councilPrompt(key,state,lang,L);
  return `<section class="answer-section council-question" data-answer="${key}"><span class="eyebrow">${L.gbCouncilAsks}</span><label class="answer-field rpg-field"><span class="council-q">${safe(q)}<small class="presence" data-presence="${key}"></small></span><textarea data-field="${key}" placeholder="${L.answerHint}" maxlength="600" ${locked?'disabled':''}>${safe(state[key])}</textarea></label><details class="sentence-starter"><summary>${L.sentenceStarter}</summary><p>${safe(starter)}</p></details></section>`;
};
export function councilMarkup(team,lang,L){
  const state=team.state,locked=!!team.submittedAt,stage=state.stage,location=locations[state.mapPoint];
  const goals=objectives(team)[stage-1];
  const head=`<div class="council-head">${location?portraitMarkup(state.mapPoint,`${L.avatar} · ${localized(characters[state.mapPoint],lang)}`):`<div class="empty-portrait">${cardIcon('navigation')}</div>`}<div><span class="eyebrow">${L.oneCommunity}</span><h2>${safe(team.name)}</h2>${location?`<p>${localized(characters[state.mapPoint],lang)}</p>`:''}</div></div>`;
  const guide=`<p class="council-guide">${[L.guidePlace,L.guideTech,L.guideCivic,L.guideStory][stage-1]}</p>`;
  const list=`<section class="objectives"><h3>${L.gbObjectives}</h3><ol>${goals.map(g=>`<li class="${g.done?'done':''}"><button data-goal="${g.goal}"><span class="obj-mark" aria-hidden="true">${g.done?'✓':''}</span>${L['obj'+cap(g.id)]}</button></li>`).join('')}</ol></section>`;
  const questions=stage===1&&!state.mapPoint?'':eraFields[stage-1].map(key=>field(key,state,lang,L,locked)).join('');
  const submit=stage===4?`<div class="submission-box" id="submission">${renderSubmissionBox(team,L)}</div>`:'';
  const nav=`<div class="era-nav">${stage>1&&!locked?`<button class="btn-ghost" data-action="previous">← ${L.gbPrevEra}</button>`:'<span></span>'}${stage<4&&!locked?`<button class="btn-primary ${goals.every(g=>g.done)?'ready':''}" data-action="next" ${goals.every(g=>g.done)?'':'disabled'}>${L.gbNextEra} →</button>`:''}</div>`;
  return `${head}${guide}${list}${questions}${submit}${nav}`;
}

// One definition of what a card can do right now, shared with the reveal animations in app.js.
export function cardStatus(item,kind,state){
  const chosen=state[kind].includes(item.id),gate=gateOpen(item,state),available=!item.parents.length||item.parents.some(id=>state[kind].includes(id)),full=state[kind].length>=7;
  return {chosen,gate,available,full,open:!chosen&&gate&&available&&!full};
}
// Every card says what it would build and whether the explored land has room for it.
function buildLine(item,state,lang,L){
  const rule=improvements[item.id];
  if(!rule||!generateLand(state.mapPoint))return '';
  const tile=state.tiles?.[item.id];
  if(state.tech.includes(item.id)||state.civic.includes(item.id)){
    return `<span class="choice-build placed">${safe(rule.name[lang])} · ${Number.isInteger(tile)?safe(terrains[generateLand(state.mapPoint).tiles[tile]][lang]):L.unplaced}</span>`;
  }
  const n=fitTiles(state,item.id).length;
  return `<span class="choice-build ${n?'':'none'}">${safe(rule.name[lang])} · ${n?(n===1?L.gbFitOne:fill(L.gbFitCount,{n})):L.gbFitNone}</span>`;
}
function card(item,kind,state,lang,L,locked,position=''){
  const {chosen,gate,available,full}=cardStatus(item,kind,state),disabled=locked||(!chosen&&(!gate||!available||full));
  const parentNames=item.parents.map(id=>cardName(kind,id,lang)).join(' / ');
  return `<button class="choice-card ${chosen?'chosen':''} ${item.gate?'branch-card':''} ${position}" data-pick="${kind}:${item.id}" aria-pressed="${chosen}" ${disabled?'disabled':''}><span class="choice-icon">${cardIcon(item.id)}</span><strong>${localized(item,lang)}</strong>${buildLine(item,state,lang,L)}<span class="choice-status">${chosen?L.chosen:!gate?L.lockedEvent:!available?`${L.needs}: ${parentNames}`:full?L.limit:item.gate?L.unlocked:L.available}</span><span class="choice-toggle">${chosen?'✓':'+'}</span></button>`;
}

// The flowchart laid out as a Civ-style tree: one column per tier, each card placed near the
// cards it grows from, with SVG links behind. Positions are grid classes, not inline styles,
// and the link coordinates use the same fixed track sizes as rpg.css (.tree).
const COL=180,GAP=36,ROW=96,RGAP=12;
const layouts={};
function treeLayout(kind){
  if(layouts[kind])return layouts[kind];
  const items=trees[kind].filter(x=>!x.gate);
  const groups=[...new Set(items.map(x=>x.tier))].sort((a,b)=>a-b).map(tier=>items.filter(x=>x.tier===tier));
  const row={},col={};
  const mean=list=>list.reduce((a,b)=>a+b,0)/list.length;
  const assign=(group,want)=>{let prev=-1;for(const x of [...group].sort((a,b)=>want(a)-want(b)||group.indexOf(a)-group.indexOf(b))){row[x.id]=Math.max(Math.round(want(x)),prev+1);prev=row[x.id]}};
  groups.forEach((group,c)=>{for(const x of group)col[x.id]=c;assign(group,x=>x.parents.length?mean(x.parents.map(p=>row[p])):group.indexOf(x))});
  // Centre the starting cards on the cards they lead to, then close any gap at the top.
  assign(groups[0],x=>{const kids=items.filter(y=>y.parents.includes(x.id));return kids.length?mean(kids.map(y=>row[y.id])):row[x.id]});
  const top=Math.min(...Object.values(row));for(const id in row)row[id]-=top;
  const rows=Math.max(...Object.values(row))+1,cols=groups.length;
  return layouts[kind]={items,row,col,rows,cols,width:cols*COL+(cols-1)*GAP,height:rows*ROW+(rows-1)*RGAP};
}
export function treeMarkup(kind,state,lang,L,locked){
  const {items,row,col,cols,width,height}=treeLayout(kind);
  const x=c=>c*(COL+GAP),y=r=>r*(ROW+RGAP)+ROW/2;
  const links=items.flatMap(item=>item.parents.map(parent=>{
    const x1=x(col[parent])+COL,y1=y(row[parent]),x2=x(col[item.id]),y2=y(row[item.id]),m=(x1+x2)/2;
    const from=state[kind].includes(parent),to=state[kind].includes(item.id);
    return `<path class="tree-link ${from&&to?'walked':from?'open':''}" d="M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2} ${y2}"/>`;
  })).join('');
  return `<div class="tree-scroll"><div class="tree cols-${cols}"><svg class="tree-links" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">${links}</svg>${items.map(item=>card(item,kind,state,lang,L,locked,`tc-${col[item.id]} tr-${row[item.id]}`)).join('')}</div></div>`;
}
// The trees open over the board, with a small live map so each new building is seen landing.
export function drawerMarkup(team,lang,L,ui){
  if(!ui.drawer)return '';
  const state=team.state,locked=!!team.submittedAt,kind=ui.drawer,special=trees[kind].filter(x=>x.gate&&gateOpen(x,state));
  return `<div class="drawer-scrim" data-action="close-drawer"></div><section class="drawer-panel" role="dialog" aria-label="${kind==='tech'?L.gbScience:L.gbSociety}"><header class="drawer-head"><div class="drawer-tabs" role="tablist">${['tech','civic'].map(k=>`<button role="tab" data-action="drawer:${k}" aria-selected="${k===kind}" class="${k===kind?'on':''}">${k==='tech'?L.gbScience:L.gbSociety}<b>${state[k].length}/7</b></button>`).join('')}</div><div class="drawer-mini">${landMarkup(state,lang,L,{mode:'mini'})}</div><p class="drawer-note" id="drawer-note" aria-live="polite">${L.cardHint}</p><button class="drawer-close" data-action="close-drawer">${L.gbBackToMap} ✕</button></header><div class="drawer-body">${special.length?`<div class="special-cards"><span class="special-label">${L.fromDecision}</span>${special.map(x=>card(x,kind,state,lang,L,locked)).join('')}</div>`:''}${treeMarkup(kind,state,lang,L,locked)}</div></section>`;
}

export function atlasMarkup(state,lang,L,locked){
  return `<div class="atlas"><p>${L.mapHelp}</p><div class="map-wrap"><img src="/assets/slide8-map.png" alt="${L.mapAlt}"/>${Object.keys(mapPoints).map(letter=>`<button class="map-dot ${state.mapPoint===letter?'active':''}" data-map="${letter}" aria-label="${letter} · ${safe(localized(locations[letter].region,lang))}" aria-pressed="${state.mapPoint===letter}" ${locked?'disabled':''}>${letter}</button>`).join('')}</div></div>`;
}
function eraEyebrow(state,lang,L){
  return `${L.gbEra} ${ROMAN[state.stage-1]} / IV${locations[state.mapPoint]?` · ${state.mapPoint} · ${localized(characters[state.mapPoint],lang)}`:''}`;
}
export function toolbarMarkup(team,lang,L){
  const state=team.state,locked=!!team.submittedAt,has=!!locations[state.mapPoint],waiting=pendingEvent(state);
  const title=[L.placeTitle,L.techTitle,L.civicTitle,L.routeTitle][state.stage-1];
  const tools=has?[
    waiting?`<button class="tool tool-event" data-action="open-event:${waiting}"><span aria-hidden="true">!</span>${L.gbEventWaiting}</button>`:'',
    `<button class="tool ${state.stage===2?'suggested':''}" data-action="drawer:tech">${cardIcon('writing')}${L.gbScience}<b>${state.tech.length}/7</b></button>`,
    `<button class="tool ${state.stage===3?'suggested':''}" data-action="drawer:civic">${cardIcon('laws')}${L.gbSociety}<b>${state.civic.length}/7</b></button>`,
    state.stage<4?`<button class="tool" data-action="open-scene">${cardIcon('navigation')}${L.gbScene}</button>`:'',
    state.stage===1&&!locked&&!state.fixedPoint?`<button class="tool" data-action="open-atlas">${L.gbChangePlace}</button>`:''
  ].join(''):'';
  return `<div class="board-title"><span class="eyebrow">${eraEyebrow(state,lang,L)}</span><h1 class="chapter-title">${title}</h1></div><div class="board-tools">${tools}</div>`;
}
export function stageMarkup(team,lang,L,ui){
  const state=team.state,locked=!!team.submittedAt;
  if(state.stage===4)return routeCapstone(team,lang,L);
  if(!state.mapPoint)return `<div class="board-atlas"><h2>${L.chooseHomeland}</h2><p class="atlas-lead">${L.gbChooseFirst}</p>${atlasMarkup(state,lang,L,locked)}</div>`;
  return landMarkup(state,lang,L,{selected:ui.selected,locked});
}

export function routeCapstone(team,lang,L){
  const state=team.state,ready=questStatus(state).slice(0,3).every(Boolean);
  const selected=routeById(state.route||'local');
  const requirement=(route,kind,met)=>route[kind].length?`<span class="route-requirement ${met?'met':''}"><b>${met?'✓':'○'} ${kind==='tech'?L.tech:L.civic}</b>${safe(route[kind].map(id=>cardName(kind,id,lang)).join(` ${L.routeOr} `))}</span>`:'';
  const cards=civilizationRoutes.map(route=>{
    const eligibility=routeEligibility(state,route),chosen=selected?.id===route.id;
    return `<button class="route-card ${chosen?'selected':''} ${eligibility.unlocked?'unlocked':'locked'}" data-route="${route.id}" aria-pressed="${chosen}" ${team.submittedAt||!ready||!eligibility.unlocked?'disabled':''}><span class="route-card-top"><span class="route-symbol" aria-hidden="true">${route.icon}</span><span class="route-status">${chosen?L.chosen:eligibility.unlocked?L.routeAvailable:L.routeLocked}</span></span><strong>${safe(route[lang])}</strong><p>${safe(route.description[lang])}</p><div class="route-requirements">${requirement(route,'tech',eligibility.tech)}${requirement(route,'civic',eligibility.civic)}</div><small>${safe(route.tradeoff[lang])}</small></button>`;
  }).join('');
  return `<section class="route-capstone"><header><span class="eyebrow">${L.routeFinalAct}</span><h2>${L.routeChooseTitle}</h2><p>${L.routeIntro}</p>${!ready?`<p class="route-help">${L.routeFinishSteps}</p>`:''}</header><div class="route-options">${cards}</div><div class="route-outcome" aria-live="polite"><div class="route-map">${state.mapPoint?landMarkup(state,lang,L,{mode:'mini'}):''}</div><div><span class="eyebrow">${L.routeYourFuture}</span><h3>${safe(selected?.[lang]||'')}</h3><p>${safe(selected?.description[lang]||'')}</p><p>${L.routeNoPressure}</p></div></div><details class="route-review"><summary>${L.routeReview}</summary><dl id="summary">${renderSummaryRows(state,lang,L)}</dl></details></section>`;
}
export function footMarkup(team,lang,L,ui){
  const state=team.state;
  if(state.stage===4||!state.mapPoint)return '';
  return `<div class="land-info" id="land-info" aria-live="polite">${ui.selected?movingInfo(ui.selected,lang,L):tileInfo(state,lang,L,ui.hover??null)}</div><div class="land-buildings" id="land-buildings"><span class="land-label">${L.buildingsTitle}</span>${buildingList(state,lang,L,{selected:ui.selected,locked:!!team.submittedAt})}</div>`;
}

// Event cards arrive over the map. After a decision the card turns over to show what it
// changed on the land and the development it opened, which can be taken straight away.
export function eventCard(id,team,lang,L,ui){
  const state=team.state,locked=!!team.submittedAt,first=id==='origin',current=state.events?.[id],eligible=eventReady(id,state);
  const kind=first?'tech':'civic',unlocked=current?trees[kind].find(x=>x.gate?.[1]===current):null;
  if(ui.result===id&&current){
    return `<div class="event-card result" role="dialog" aria-labelledby="event-title"><span class="eyebrow">${first?L.origin:L.encounter}</span><h2 id="event-title">${L[current+'Choice']}</h2><p class="event-effect">${L['effect'+cap(current)]}</p>${unlocked?`<div class="event-reward"><strong>${localized(unlocked,lang)}</strong></div>`:''}<p class="event-cost"><b>${L.tradeoffLabel}</b> ${localized(outcomes[current].tradeoff,lang)}</p><button class="btn-primary" data-action="close-overlay">${L.gbContinue} →</button></div>`;
  }
  const options=first?['steward','explore']:state.events?.origin==='steward'?['share','reserve']:['exchange','guard'];
  const heading=first?(seasonText(state,L)||L.originPrompt):state.events?.origin==='steward'?L.encounterStewardPrompt:L.encounterExplorePrompt;
  return `<div class="event-card" role="dialog" aria-labelledby="event-title"><span class="eyebrow">${first?L.origin:L.encounter}</span><h2 id="event-title">${heading}</h2>${first?`<p class="event-sub">${L.originPrompt}</p>`:''}${!eligible?`<p class="event-help">${first?L.firstAnswer:L.firstTechnology}</p>`:''}<div class="event-options">${options.map(choice=>`<button class="event-option ${current===choice?'selected':''}" data-event="${id}:${choice}" aria-pressed="${current===choice}" ${!eligible||locked?'disabled':''}><span class="event-option-title">${L[choice+'Choice']}<b aria-hidden="true">${current===choice?'✓':'↗'}</b></span><span class="decision-detail"><b>${L.benefit}</b>${localized(outcomes[choice].benefit,lang)}</span><span class="decision-detail"><b>${L.tradeoffLabel}</b>${localized(outcomes[choice].tradeoff,lang)}</span></button>`).join('')}</div><button class="event-later" data-action="close-overlay">${current?L.gbContinue:L.gbLater}</button></div>`;
}
export function overlayMarkup(team,lang,L,ui,playing){
  const state=team.state,location=locations[state.mapPoint];
  if(ui.overlay==='atlas')return `<div class="overlay-card atlas-card"><div class="overlay-head"><h2>${L.chooseHomeland}</h2><button class="drawer-close" data-action="close-overlay">✕</button></div>${atlasMarkup(state,lang,L,!!team.submittedAt)}</div>`;
  if(ui.overlay==='arrival'&&location)return `<div class="overlay-card arrival-card"><div class="arrival-art">${sceneMarkup(state.mapPoint,`${localized(location.region,lang)} · ${L.artDescription}`,playing)}</div><div class="arrival-copy"><span class="eyebrow">${L.factTitle}</span><h2>${safe(fill(L.gbArrive,{place:localized(location.region,lang)}))}</h2><ul>${location.facts[lang].map(fact=>`<li>${safe(fact)}</li>`).join('')}</ul><button class="btn-primary" data-action="close-overlay">${L.gbExplore} →</button></div></div>`;
  if(ui.overlay?.startsWith('event:'))return eventCard(ui.overlay.slice(6),team,lang,L,ui);
  return '';
}
function regionNotes(state,lang,L){
  const location=locations[state.mapPoint];
  if(!location)return '';
  return `<section class="field-notes"><span class="eyebrow">${L.factTitle}</span><h2>${localized(location.region,lang)}</h2><ul>${location.facts[lang].map(fact=>`<li>${safe(fact)}</li>`).join('')}</ul><details><summary>${L.aboutLocation}</summary><p>${L.factScope}</p><p>${L.portraitNote}</p><a href="${location.source}" target="_blank" rel="noopener noreferrer">${L.source} ↗</a></details></section>`;
}
export const sideMarkup=(team,lang,L)=>`${regionNotes(team.state,lang,L)}${renderQuestLog(team,L)}`;

export function renderStudentView({team,roster,lang,L,topbar,playing,animate,ui}){
  return `<div class="app-shell rpg-shell board-shell">${topbar}<div class="subbar"><div class="members"><span class="members-label">${L.connected}</span><div id="roster">${roster.map(safe).map(name=>`<span>${name}</span>`).join('')}</div></div><div class="shared-note">${L.sameScreen}</div></div><nav class="era-track" id="era-track" aria-label="${L.journey}">${eraTrackMarkup(team,L)}</nav>
  <main id="main" class="board ${animate?'main-enter':''}"><aside class="council" id="council">${councilMarkup(team,lang,L)}</aside><section class="board-center"><div class="board-toolbar" id="board-toolbar">${toolbarMarkup(team,lang,L)}</div><div class="board-stage-wrap"><div class="board-stage" id="board-stage">${stageMarkup(team,lang,L,ui)}</div><div class="board-overlay" id="board-overlay">${overlayMarkup(team,lang,L,ui,playing)}</div></div><div class="board-foot" id="board-foot">${footMarkup(team,lang,L,ui)}</div></section><aside class="board-side" id="board-side">${sideMarkup(team,lang,L)}</aside></main>
  <div class="drawer" id="drawer">${drawerMarkup(team,lang,L,ui)}</div><footer class="app-footer"><span>BUILD YOUR CIV</span><span>${L.score}</span></footer></div>`;
}
