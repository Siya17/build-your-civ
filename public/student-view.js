import { trees, mapPoints, gateOpen, hasCoreChoice, questStatus, submissionGaps } from '/shared/game.js';
import { locations, characters, outcomes } from '/shared/world.js';
import { summaryKeys } from '/shared/i18n.js';
import { sceneMarkup, portraitMarkup, cardIcon } from '/rpg.js';
import { landMarkup, tileInfo, movingInfo, buildingList, landSummary } from '/hexmap.js';

const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const localized=(value,lang)=>value?.[lang]??'';
const cardName=(kind,id,lang)=>{const item=trees[kind].find(x=>x.id===id);return item?localized(item,lang):id};
const choiceName=(id,L)=>L[id+'Choice']||id;

export function renderSummaryRows(state,lang,L){
  const values={
    place:state.mapPoint?`[${state.mapPoint}] ${localized(locations[state.mapPoint]?.region,lang)}`:'',
    avatar:localized(characters[state.mapPoint],lang),
    tech:state.tech.map(id=>cardName('tech',id,lang)).join(' → '),
    civic:state.civic.map(id=>cardName('civic',id,lang)).join(' → '),
    land:landSummary(state,lang),
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
const field=(key,state,L,locked)=>`<section class="answer-section"><label class="answer-field rpg-field"><span>${L[key]}<small class="presence" data-presence="${key}"></small></span><textarea data-field="${key}" placeholder="${L.answerHint}" maxlength="600" ${locked?'disabled':''}>${safe(state[key])}</textarea></label><details class="sentence-starter"><summary>${L.sentenceStarter}</summary><p>${L[key+'Ph']}</p></details></section>`;
const nav=(stage,L,locked)=>`<div class="page-nav">${stage>1&&!locked?`<button class="btn-ghost" data-action="previous">← ${L.back}</button>`:'<span></span>'}${stage<4&&!locked?`<button class="btn-primary" data-action="next">${L.next} →</button>`:''}</div>`;
const eventPanel=(id,state,lang,L,locked)=>{
  const first=id==='origin',current=state.events?.[id],eligible=first?!!(state.mapPoint&&state.placeAnswer.trim()):!!(state.events?.origin&&hasCoreChoice(state,'tech'));
  const options=first?['steward','explore']:state.events?.origin==='steward'?['share','reserve']:['exchange','guard'];
  const prompt=first?L.originPrompt:state.events?.origin==='steward'?L.encounterStewardPrompt:L.encounterExplorePrompt;
  const unlocked=current?trees[first?'tech':'civic'].find(x=>x.gate?.[1]===current):null;
  return `<section class="event-panel"><div class="event-heading"><span class="eyebrow">${first?L.origin:L.encounter}</span><h2>${prompt}</h2>${!eligible?`<p class="event-help">${first?L.firstAnswer:L.firstTechnology}</p>`:''}</div><div class="event-options">${options.map(choice=>`<button class="event-option ${current===choice?'selected':''}" data-event="${id}:${choice}" aria-pressed="${current===choice}" ${!eligible||locked?'disabled':''}><span class="event-option-title">${L[choice+'Choice']}<b aria-hidden="true">${current===choice?'✓':'↗'}</b></span><span class="decision-detail"><b>${L.benefit}</b>${localized(outcomes[choice].benefit,lang)}</span><span class="decision-detail"><b>${L.tradeoffLabel}</b>${localized(outcomes[choice].tradeoff,lang)}</span></button>`).join('')}</div>${unlocked?`<div class="event-unlock"><span>✓</span> ${L.unlocked}: <strong>${localized(unlocked,lang)}</strong></div>`:''}</section>`;
};
function atlas(state,lang,L,locked){
  const location=locations[state.mapPoint];
  const map=`<div class="atlas-content"><p>${L.mapHelp}</p><div class="map-wrap"><img src="/assets/slide8-map.png" alt="${L.mapAlt}"/>${Object.keys(mapPoints).map(letter=>`<button class="map-dot ${state.mapPoint===letter?'active':''}" data-map="${letter}" aria-label="${letter} · ${safe(localized(locations[letter].region,lang))}" aria-pressed="${state.mapPoint===letter}" ${locked?'disabled':''}>${letter}</button>`).join('')}</div></div>`;
  return location?`<details class="atlas-panel"><summary><span class="location-marker">${state.mapPoint}</span><span>${localized(location.region,lang)}</span><span class="atlas-change">${L.changeLocation} ↓</span></summary>${map}</details>`:`<section class="atlas-panel"><div class="section-heading"><span class="eyebrow">${L.beginHere}</span><h2>${L.chooseHomeland}</h2></div>${map}</section>`;
}
function placePage(state,lang,L,locked){
  return `${atlas(state,lang,L,locked)}${state.mapPoint?`${field('placeAnswer',state,L,locked)}${eventPanel('origin',state,lang,L,locked)}`:`<p class="map-invitation">${L.chooseLocationHint}</p>`}${nav(1,L,locked)}`;
}

// One definition of what a card can do right now, shared with the reveal animations in app.js.
export function cardStatus(item,kind,state){
  const chosen=state[kind].includes(item.id),gate=gateOpen(item,state),available=!item.parents.length||item.parents.some(id=>state[kind].includes(id)),full=state[kind].length>=7;
  return {chosen,gate,available,full,open:!chosen&&gate&&available&&!full};
}
function card(item,kind,state,lang,L,locked,position=''){
  const {chosen,gate,available,full}=cardStatus(item,kind,state),disabled=locked||(!chosen&&(!gate||!available||full));
  const parentNames=item.parents.map(id=>cardName(kind,id,lang)).join(' / ');
  return `<button class="choice-card ${chosen?'chosen':''} ${item.gate?'branch-card':''} ${position}" data-pick="${kind}:${item.id}" aria-pressed="${chosen}" ${disabled?'disabled':''}><span class="choice-icon">${cardIcon(item.id)}</span><strong>${localized(item,lang)}</strong><span class="choice-status">${chosen?L.chosen:!gate?L.lockedEvent:!available?`${L.needs}: ${parentNames}`:full?L.limit:item.gate?L.unlocked:L.available}</span><span class="choice-toggle">${chosen?'✓':'+'}</span></button>`;
}

// The flowchart laid out as a Civ-style tree: one column per tier, each card placed near the
// cards it grows from, with SVG links behind. Positions are grid classes, not inline styles,
// and the link coordinates use the same fixed track sizes as rpg.css (.tree).
const COL=172,GAP=36,ROW=84,RGAP=12;
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
function treeMarkup(kind,state,lang,L,locked){
  const {items,row,col,cols,width,height}=treeLayout(kind);
  const x=c=>c*(COL+GAP),y=r=>r*(ROW+RGAP)+ROW/2;
  const links=items.flatMap(item=>item.parents.map(parent=>{
    const x1=x(col[parent])+COL,y1=y(row[parent]),x2=x(col[item.id]),y2=y(row[item.id]),m=(x1+x2)/2;
    const from=state[kind].includes(parent),to=state[kind].includes(item.id);
    return `<path class="tree-link ${from&&to?'walked':from?'open':''}" d="M${x1} ${y1}C${m} ${y1} ${m} ${y2} ${x2} ${y2}"/>`;
  })).join('');
  return `<div class="tree-scroll"><div class="tree cols-${cols}"><svg class="tree-links" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true">${links}</svg>${items.map(item=>card(item,kind,state,lang,L,locked,`tc-${col[item.id]} tr-${row[item.id]}`)).join('')}</div></div>`;
}
function treePage(kind,state,lang,L,locked){
  const stage=kind==='tech'?2:3,special=trees[kind].filter(x=>x.gate&&gateOpen(x,state));
  return `${kind==='civic'?eventPanel('encounter',state,lang,L,locked):''}<section class="choice-panel"><div class="section-heading choice-heading"><div><span class="eyebrow">${L.choosePath}</span><h2>${kind==='tech'?L.tech:L.civic}</h2><p>${L.cardHint}</p></div><div class="choice-count"><b>${state[kind].length}</b><span>/ 7</span></div></div>${special.length?`<div class="special-cards"><span class="special-label">${L.fromDecision}</span>${special.map(x=>card(x,kind,state,lang,L,locked)).join('')}</div>`:''}${treeMarkup(kind,state,lang,L,locked)}</section>${field(kind==='tech'?'techAnswer':'societyAnswer',state,L,locked)}${kind==='civic'?field('beliefAnswer',state,L,locked):''}${nav(stage,L,locked)}`;
}
function storyPage(team,lang,L,locked){
  const land=team.state.mapPoint?`<div class="chronicle-land">${landMarkup(team.state,lang,L,{mode:'mini'})}</div>`:'';
  return `${field('contactAnswer',team.state,L,locked)}<section class="preview-panel chronicle-panel"><div class="preview-head"><span>${L.chronicle}</span><h2>${safe(team.name)}</h2></div>${land}<div class="preview-body"><dl id="summary">${renderSummaryRows(team.state,lang,L)}</dl></div><div class="submission-box" id="submission">${renderSubmissionBox(team,L)}</div></section>${nav(4,L,locked)}`;
}
function regionNotes(state,lang,L){
  const location=locations[state.mapPoint];
  if(!location)return '';
  return `<section class="field-notes"><span class="eyebrow">${L.factTitle}</span><h2>${localized(location.region,lang)}</h2><ul>${location.facts[lang].map(fact=>`<li>${safe(fact)}</li>`).join('')}</ul><details><summary>${L.aboutLocation}</summary><p>${L.factScope}</p><p>${L.portraitNote}</p><a href="${location.source}" target="_blank" rel="noopener noreferrer">${L.source} ↗</a></details></section>`;
}

// The page is built from regions with ids, so app.js can replace just the parts that
// changed and leave the artwork, its animation and the scroll position alone.
export const showsLand=(state,ui)=>state.stage>=2&&!!locations[state.mapPoint]&&ui?.banner!=='scene';
export function chaptersMarkup(team,L){
  const state=team.state,locked=!!team.submittedAt,done=questStatus(state,locked);
  return L.steps.map((name,i)=>`<button data-stage="${i+1}" class="chapter ${state.stage===i+1?'current':''} ${done[i]?'complete':''}" ${locked?'disabled':''}><span>${done[i]?'✓':String(i+1).padStart(2,'0')}</span>${name}</button>`).join('');
}
export function contentMarkup(team,lang,L){
  const state=team.state,locked=!!team.submittedAt;
  return state.stage===1?placePage(state,lang,L,locked):state.stage===2?treePage('tech',state,lang,L,locked):state.stage===3?treePage('civic',state,lang,L,locked):storyPage(team,lang,L,locked);
}
export function sidebarMarkup(team,lang,L){
  const state=team.state;
  return `<section class="council-note"><span class="eyebrow">${L.council}</span><p>${[L.guidePlace,L.guideTech,L.guideCivic,L.guideStory][state.stage-1]}</p></section>${regionNotes(state,lang,L)}${renderQuestLog(team,L)}`;
}
export const landStageMarkup=(team,lang,L,ui)=>landMarkup(team.state,lang,L,{selected:ui.selected,locked:!!team.submittedAt});
export const landInfoMarkup=(team,lang,L,ui)=>ui.selected?movingInfo(ui.selected,lang,L):tileInfo(team.state,lang,L,ui.hover??null);
export const landBuildingsMarkup=(team,lang,L,ui)=>`<span class="land-label">${L.buildingsTitle}</span>${buildingList(team.state,lang,L,{selected:ui.selected,locked:!!team.submittedAt})}`;
function heroEyebrow(state,lang,L){
  return `${L.chapter} ${String(state.stage).padStart(2,'0')} / 04${locations[state.mapPoint]?` <span class="hero-separator">/</span> ${state.mapPoint} · ${localized(characters[state.mapPoint],lang)}`:''}`;
}
export function bannerMarkup(team,lang,L,{playing,ui}){
  const state=team.state,location=locations[state.mapPoint],land=showsLand(state,ui),title=[L.placeTitle,L.techTitle,L.civicTitle,L.chronicle][state.stage-1];
  const toggle=state.stage>=2&&location?`<button data-action="banner-land" aria-pressed="${land}" class="${land?'on':''}">${L.landView}</button><button data-action="banner-scene" aria-pressed="${!land}" class="${land?'':'on'}">${L.sceneView}</button>`:'';
  const hero=land
    ?`<section class="chapter-hero land-hero"><div class="land-copy"><span class="eyebrow">${heroEyebrow(state,lang,L)}</span><h1 class="chapter-title">${title}</h1><div class="land-info" id="land-info" aria-live="polite">${landInfoMarkup(team,lang,L,ui)}</div><div class="land-buildings" id="land-buildings">${landBuildingsMarkup(team,lang,L,ui)}</div></div><div class="land-stage" id="land-stage">${landStageMarkup(team,lang,L,ui)}</div><div class="scene-controls">${toggle}</div></section>`
    :`<section class="chapter-hero">${sceneMarkup(state.mapPoint,location?`${localized(location.region,lang)} · ${L.artDescription}`:L.worldArt,playing)}<div class="hero-copy"><span class="eyebrow">${heroEyebrow(state,lang,L)}</span><h1 class="chapter-title">${title}</h1><p>${L.chapterIntros[state.stage-1]}</p></div>${location?`<div class="scene-controls">${toggle}<button data-action="scene-replay" aria-label="${L.replay}">↻ ${L.replay}</button><button data-action="scene-skip">${playing?L.skipScene:L.play}</button></div>`:''}</section>`;
  return `${hero}<section class="team-portrait">${location?portraitMarkup(state.mapPoint,`${L.avatar} · ${localized(characters[state.mapPoint],lang)}`):`<div class="empty-portrait">${cardIcon('navigation')}<p>${L.chooseLocationHint}</p></div>`}<div class="team-portrait-caption"><span>${L.oneCommunity}</span><h2>${safe(team.name)}</h2>${location?`<p>${localized(characters[state.mapPoint],lang)}</p>`:''}</div></section>`;
}
export function renderStudentView({team,roster,lang,L,topbar,playing,animate,ui}){
  const land=showsLand(team.state,ui);
  return `<div class="app-shell rpg-shell">${topbar}<div class="subbar"><div class="members"><span class="members-label">${L.connected}</span><div id="roster">${roster.map(safe).map(name=>`<span>${name}</span>`).join('')}</div></div><div class="shared-note">${L.sameScreen}</div></div><nav class="chapters" id="chapters" aria-label="${L.journey}">${chaptersMarkup(team,L)}</nav>
  <main id="main" class="campaign ${animate?'main-enter':''}"><div class="world-banner ${land?'land':''}" id="world-banner">${bannerMarkup(team,lang,L,{playing,ui})}</div>
  <div class="campaign-layout"><div class="campaign-content" id="campaign-content">${contentMarkup(team,lang,L)}</div><aside class="campaign-sidebar" id="campaign-sidebar">${sidebarMarkup(team,lang,L)}</aside></div></main><footer class="app-footer"><span>BUILD YOUR CIV</span><span>${L.score}</span></footer></div>`;
}
