import { STRUCTURES, CIVILIZATIONS, RESEARCH, adjacentTiles, hexDistance, calculateTileYield, harvestForecast } from '../shared/strategy/hex.js';
import { INFRASTRUCTURE, findRoute, routeCapacity } from '../shared/strategy/logistics.js';
import { GREAT_WORK_STAGES } from '../shared/strategy/great-work.js';
import { resources, resourceTotal, RESOURCES } from '../shared/strategy/resources.js';
import { mapMarkup } from './cooperative-map.js';
import { label, icon, safe } from './cooperative-copy.js';
import { f } from '../shared/flow-copy.js';

export function placementError(state, playerId, tileId, arm, lang='en') {
  const t=key=>label(lang,key),player=state.players[playerId],tile=state.board[tileId];
  if(!arm)return '';
  if(state.phase!=='planning'||player.ready)return t('waiting');
  if(!player.actionsLeft)return t('noActions');
  if(!tile)return t('noFit');
  if(arm==='scout')return tile.fogged&&adjacentTiles(state.board,tileId).some(other=>!other.fogged)?'':t('hidden');
  if(tile.fogged)return t('hidden');
  if(tile.owner&&tile.owner!==playerId)return t('foreign');
  if(tile.disabledUntil>=state.clock.round)return t('closed');
  if(hexDistance(tile,state.board[player.settlement])>2&&!adjacentTiles(state.board,tileId).some(other=>other.owner===playerId))return t('outOfReach');
  if(arm==='clear')return tile.terrain==='forest'&&!tile.structure&&tile.node?.kind!=='natural-wonder'?'':t('noFit');
  const [type,id]=arm.split(':'),rule=type==='build'?STRUCTURES[id]:INFRASTRUCTURE[id];
  if(!rule||!rule.terrains.includes(tile.terrain))return t('noFit');
  if(type==='build'&&(tile.structure||tile.id===state.work.site))return t('occupied');
  if(type==='infrastructure'&&(tile.infrastructure||tile.structure==='settlement'))return t('occupied');
  const tech=Object.keys(RESEARCH).find(key=>RESEARCH[key].unlocks===id);
  if(tech&&!player.research?.includes(tech))return t('locked');
  if(Object.entries(rule.cost).some(([key,n])=>player.stock[key]<n))return t('poor');
  return '';
}

export function deliveryPreview(world, ui, lang) {
  const t=key=>label(lang,key),state=world.state,player=state.players[world.playerId];
  const cargo=resources(ui.cargo),total=resourceTotal(cargo),recipient=Object.values(state.players).find(p=>p.id!==player.id);
  const destination=ui.modal==='trade'?recipient.settlement:state.work.site;
  if(state.phase!=='planning'||player.ready)return {error:t('waiting'),path:null};
  if(!player.actionsLeft)return {error:t('noActions'),path:null};
  if(!total)return {error:t('noCargo'),path:null};
  if(RESOURCES.some(key=>cargo[key]>player.stock[key]))return {error:t('poor'),path:null};
  if(ui.modal==='deliver') {
    if(state.work.complete)return {error:t('complete'),path:null};
    const cost=resources(GREAT_WORK_STAGES[state.work.stage].cost);
    if(RESOURCES.some(key=>cargo[key]>cost[key]-state.work.delivered[key]))return {error:t('overfill'),path:null};
    const paid=RESOURCES.every(key=>state.work.delivered[key]+cargo[key]===cost[key]);
    const donors=new Set([...Object.keys(state.work.contributors),player.id]);
    if(paid&&donors.size<2)return {error:t('needDonor'),path:null};
  }
  const path=findRoute(state.board,player.settlement,destination,player.id,state.clock.round,state.logistics.edgeUsage,total);
  if(!path){
    const structural=findRoute(state.board,player.settlement,destination,player.id,state.clock.round,{},1);
    return {error:t(structural?'routeFull':'noRoute'),path:structural,bottlenecks:structural?routeCapacity(state.board,structural,state.logistics.edgeUsage).filter(edge=>edge.remaining<total):[]};
  }
  return {error:'',path,bottlenecks:[],capacity:Math.min(...routeCapacity(state.board,path,state.logistics.edgeUsage).map(edge=>edge.remaining))};
}

export function placementProduction(state,playerId,tileId,arm) {
  const player=state.players[playerId],before=harvestForecast(state.board,player,state.clock.round,state.clock.season);
  const [type,id]=(arm||'').split(':'),tile=state.board[tileId];
  let after=before;
  if(!placementError(state,playerId,tileId,arm)&&['build','clear'].includes(type)){
    const next={...tile,owner:playerId,...(type==='build'?{structure:id}:{terrain:'plains',cleared:true})};
    after=harvestForecast({...state.board,[tileId]:next},player,state.clock.round,state.clock.season);
  }
  return {before,after};
}

const costs=(values,t)=>Object.entries(values).filter(([,n])=>n).map(([key,n])=>`<span class="mini-resource ${key}">${icon(key)}${n}<span class="sr-only"> ${t(key)}</span></span>`).join('');
const portrait=id=>`<img src="/assets/portraits/${id==='highland'?'C':'E'}.webp" alt="" />`;
function projectCard(state,player,id,type,ui,t){
  const rule=type==='build'?STRUCTURES[id]:INFRASTRUCTURE[id],tech=Object.keys(RESEARCH).find(key=>RESEARCH[key].unlocks===id);
  const locked=tech&&!player.research?.includes(tech),poor=Object.entries(rule.cost).some(([k,n])=>player.stock[k]<n);
  const profile=CIVILIZATIONS[player.civilization];
  const base=type==='build'?Object.fromEntries(Object.entries(rule.yield).map(([key,n])=>[key,profile.multipliers[key]===0?0:n])):null;
  const deficit=base&&Object.values(base).every(n=>n===0);
  const arm=`${type}:${id}`;
  return `<button class="project-card ${ui.arm===arm?'active':''} ${locked?'locked':''}" data-arm="${arm}" aria-pressed="${ui.arm===arm}" ${state.phase!=='planning'||player.ready||!player.actionsLeft||locked||poor||deficit?'disabled':''} title="${safe(t(id+'Help'))}"><span class="project-icon">${icon(id)}</span><span class="project-name">${t(id)}<small>${deficit?t(player.civilization==='highland'?'needsFood':'needsMaterials'):locked?`${t('unlocks')}: ${t(tech)}`:type==='build'?costs(base,t):t('capacity')+' '+rule.capacity}</small></span><span class="project-cost">${costs(rule.cost,t)}</span></button>`;
}

function workPanel(state,t){
  const work=state.work,stage=GREAT_WORK_STAGES[Math.min(work.stage,2)],cost=resources(stage.cost);
  const donated=work.complete?cost:work.delivered;
  return `<section class="work-panel"><div class="section-kicker">${t('sharedGoal')}</div><div class="work-heading">${icon('crown')}<h2>${t('work')}</h2><span>${work.history.length}/3</span></div><ol class="milestone-track">${GREAT_WORK_STAGES.map((s,i)=>`<li class="${work.stage>i?'done':work.stage===i?'current':''}" title="${t(s.id)}"><span>${work.stage>i?'✓':i+1}</span><small>${t(s.id)}</small></li>`).join('')}</ol><div class="current-milestone"><span>${t(stage.id)}</span><b>${work.complete?t('complete'):t('due')+' '+stage.deadline}</b></div><div class="work-resources">${Object.entries(stage.cost).map(([key,n])=>`<div><span>${icon(key)}${t(key)}</span><b>${donated[key]}/${n}</b><progress max="${n}" value="${donated[key]}" aria-label="${t(key)}">${donated[key]}/${n}</progress></div>`).join('')}</div><div class="donor-row">${Object.values(state.players).map(p=>`<span class="donor ${work.complete||Object.hasOwn(work.contributors,p.id)?'supplied':''}" title="${t(p.civilization)}">${portrait(p.id)}${work.complete||Object.hasOwn(work.contributors,p.id)?'✓':'·'}</span>`).join('')}<small>${t('donors')}</small></div><button class="gold-button full" data-cmd="deliver" ${work.complete?'disabled':''}>${icon('trade')}${t('deliver')}${icon('arrow')}</button></section>`;
}

function selectedPanel(world,ui,t){
  const state=world.state,player=state.players[world.playerId],tile=state.board[ui.selected];
  if(!tile)return `<section class="inspector"><div class="section-kicker">${t('selected')}</div><p>${t('inspect')}</p></section>`;
  const title=tile.fogged?t('unexplored'):tile.structure?t(tile.structure):t(tile.terrain==='river'?'riverTerrain':tile.terrain);
  const [type,id]=(ui.arm||'').split(':'),error=placementError(state,player.id,tile.id,ui.arm,ui.lang);
  const preview=type==='build'&&!error?calculateTileYield({...state.board,[tile.id]:{...tile,structure:id,owner:player.id}},tile.id,player.civilization,state.clock.round):!tile.fogged?calculateTileYield(state.board,tile.id,player.civilization,state.clock.round):null;
  const rule=type==='build'?STRUCTURES[id]:type==='infrastructure'?INFRASTRUCTURE[id]:null;
  const production=ui.arm&&!error&&['build','clear'].includes(type)?placementProduction(state,player.id,tile.id,ui.arm):null;
  const forecast=production?'<div class="comparison"><section><span>'+f(ui.lang,'before')+'</span><p>'+costs(production.before.yield,t)+'</p></section><section><span>'+f(ui.lang,'after')+'</span><p>'+costs(production.after.yield,t)+'</p></section></div><p>'+f(ui.lang,'harvestForecast')+' · '+t(state.clock.season)+' · '+production.after.upkeep+' '+t('upkeep')+'</p><p>'+f(ui.lang,'impact')+': '+production.before.impact+' → '+production.after.impact+'</p>':type==='infrastructure'?'<p>'+t('capacity')+': '+rule.capacity+'</p>':'';
  return forecast+`<section class="inspector"><div class="section-kicker">${t('selected')}<span>${safe(tile.id)}</span></div><h3>${title}</h3><p class="land-owner">${tile.owner?t(state.players[tile.owner].civilization):t('neutral')}${tile.infrastructure?' · '+t(tile.infrastructure):''}</p>${preview&&resourceTotal(preview.yield)?`<div class="yield-preview">${costs(preview.yield,t)}<small>${f(ui.lang,'baseYield')}</small><b>×${preview.multiplier.toFixed(2)} ${t('adjacency')}</b></div><p>${f(ui.lang,'impact')}: ${preview.impact}</p>${preview.crossroads.length?`<p class="crossroads">✦ ${t('crossroads')}</p>`:''}`:''}${ui.arm?`<div class="placement-summary"><strong>${icon(id||ui.arm)}${t(id||ui.arm)}</strong><p>${t((id||ui.arm)+'Help')}</p>${rule?`<div class="placement-cost">${costs(rule.cost,t)}<span>+ 1 ${t('action')}</span></div>`:''}<button class="gold-button full" data-cmd="place" ${error?'disabled':''}>${icon(ui.arm==='scout'?'scout':'check')}${t(ui.arm==='scout'?'exploreHere':ui.arm==='clear'?'clearHere':'construct')}</button><small class="placement-reason">${error||((ui.arm==='scout')?t('scoutHelp'):t('permanent'))}</small></div>`:''}</section>`;
}

function advisor(world,t){
  const state=world.state,player=state.players[world.playerId];
  let help='workHint',cmd='deliver',button='deliver';
  if(state.work.complete){help='winterHint';cmd='trade';button='trade';}
  else if(state.board[state.work.site].fogged){help='firstHint';cmd='arm-scout';button='scout';}
  else if(!findRoute(state.board,player.settlement,state.work.site,player.id,state.clock.round,{},1)){help='routeHint';cmd=player.id==='river'?'arm-bridge':'arm-road';button=player.id==='river'?'bridge':'road';}
  if(player.stock.food<=3&&player.civilization==='highland'){help='foodHint';cmd=world.role==='host'?'ally':'help';button=world.role==='host'?'river':'rules';}
  return `<section class="advisor"><div class="section-kicker">${icon('research')}${t('advisor')}</div><p>${t(help)}</p><button class="text-button" data-cmd="${cmd}">${t(button)} ${icon('arrow')}</button></section>`;
}

function chronicle(state,t){
  const events=state.log.filter(entry=>entry.type==='action'&&['build','scout','infrastructure','ship','contribute','research','clear'].includes(entry.action)||['crisis','assembly','outcome'].includes(entry.type)).slice(-3).reverse();
  const names={build:'built',scout:'discovered',infrastructure:'routeBuilt',ship:'delivered',contribute:'delivered',research:'researchDone',clear:'cleared'};
  return `<section class="chronicle"><div class="section-kicker">${t('chronicle')}</div>${events.length?events.map(e=>`<div class="chronicle-entry"><span>${String(e.round).padStart(2,'0')}</span><p>${e.type==='action'?t(names[e.action]):e.type==='crisis'?t(e.kind):e.type==='assembly'?t('assembly'):t(e.status==='won'?'won':'lost')}</p></div>`).join(''):`<p>${t('noEvents')}</p>`}</section>`;
}

export function recommendedMove(world,lang='en') {
 const state=world.state,player=state.players[world.playerId],t=key=>label(lang,key);
 if(player.ready)return {cmd:'partner',text:t('waiting'),button:f(lang,'partner')};
 if(!player.actionsLeft)return {cmd:'ready',text:t('noActions'),button:t('endTurn')};
 if(player.stock.food<=3)return {cmd:'partner',text:t('foodHint'),button:f(lang,'partner')};
 const legal=arm=>Object.keys(state.board).some(id=>!placementError(state,player.id,id,arm,lang));
 if(state.board[state.work.site].fogged&&legal('scout'))return {cmd:'arm-scout',text:t('firstHint'),button:t('scout')};
 if(!findRoute(state.board,player.settlement,state.work.site,player.id,state.clock.round,{},1)) {
   for(const id of ['bridge','road','canal'])if(legal('infrastructure:'+id))return {cmd:'arm-'+id,text:t('routeHint'),button:t(id)};
 }
 if(!state.work.complete){const cargo=resources();for(const key of RESOURCES){const remaining=GREAT_WORK_STAGES[state.work.stage].cost[key]-(state.work.delivered[key]||0);if(remaining>0&&player.stock[key]>0){cargo[key]=1;break;}}if(!deliveryPreview(world,{modal:'deliver',cargo},lang).error)return {cmd:'deliver',text:t('workHint'),button:t('deliver')};}
 return {cmd:'moves',text:t(state.work.complete?'winterHint':'objective'),button:f(lang,'startMove')};
}
export function gameMarkup(world,ui){
 const t=key=>label(ui.lang,key),g=key=>f(ui.lang,key),state=world.state,player=state.players[world.playerId],rec=recommendedMove(world,ui.lang);
 const valid=new Set(ui.arm?Object.keys(state.board).filter(id=>!placementError(state,player.id,id,ui.arm,ui.lang)):[]);
 const delivery=['trade','deliver'].includes(ui.modal)?deliveryPreview(world,ui,ui.lang):null;
 return `<div class="game-shell guided-coop season-${state.clock.season}"><header class="game-header"><a class="brand" href="/">${icon('culture')}<span>BUILD YOUR CIV<small>${t('cooperative')}</small></span></a><div class="civilization-tabs">${Object.values(state.players).map(p=>`<button class="civilization-tab ${p.id===player.id?'selected':''}" data-player="${p.id}" ${world.role!=='host'&&world.role!=='preview'&&p.id!==player.id?'disabled':''}>${portrait(p.id)}<span>${t(p.civilization)}<small>${p.ready?t('committed'):p.actionsLeft+' '+t('actions')}</small></span></button>`).join('')}</div><div class="header-tools"><button class="world-code" data-cmd="share">${t('share')}</button><button class="language-button" data-cmd="language">${ui.lang==='en'?'日本語':'EN'}</button></div></header>
 <main class="coop-guided-main"><header class="coop-task-heading"><div><span class="section-kicker">${t(player.civilization)} · ${t('turn')} ${state.clock.round}/12 · ${player.actionsLeft} ${t('actions')}</span><h1 id="coop-task-title" tabindex="-1">${ui.arm?t(ui.arm.split(':').at(-1)):t(state.clock.season)}</h1></div><span>${player.health}/3 ${icon('heart')} · ${state.ecosystem}/100 ${icon('balance')}</span></header><section class="map-stage"><div class="map-canvas">${mapMarkup(state,ui.lang,{selected:ui.selected,valid,path:delivery?.path??[]})}</div><div class="map-controls"><span>${t('panHint')}</span><div><button class="icon-button" data-cmd="zoom-out" aria-label="${t('zoomOut')}">${icon('minus')}</button><button class="icon-button" data-cmd="recenter" aria-label="${t('resetMap')}">${icon('globe')}</button><button class="icon-button" data-cmd="zoom-in" aria-label="${t('zoomIn')}">${icon('plus')}</button></div></div></section>
 ${ui.arm?`<section class="coop-placement"><p>${g('placementHint')}</p>${selectedPanel(world,ui,t)}<button class="outline-button" data-cmd="cancel-arm">← ${g('back')}</button></section>`:`<section class="coop-next"><span class="section-kicker">${g('nextTask')}</span><p>${rec.text}</p><button class="gold-button large" data-cmd="${rec.cmd}" ${world.role==='preview'?'':state.phase!=='planning'?'disabled':''}>${rec.button}${icon('arrow')}</button></section><nav class="coop-secondary"><button data-cmd="moves" ${player.ready||!player.actionsLeft||state.phase!=='planning'?'disabled':''}>${g('chooseMove')}</button><button data-cmd="stocks">${g('stocks')}</button><button data-cmd="goal">${g('goal')}</button><button data-cmd="partner">${g('partner')}</button><button data-cmd="history">${g('history')}</button><button data-cmd="help">${t('rules')}</button></nav>`}</main><footer class="game-footer"><span class="save-state">● ${t(ui.busy?'saving':ui.connection==='offline'?'offline':'saved')}</span><div class="footer-links"><button data-cmd="new">${t('newWorld')}</button><a href="/classroom">${t('classroom')} ↗</a></div><button class="outline-button" data-cmd="ready" ${world.role==='preview'||player.ready||state.phase!=='planning'||ui.busy?'disabled':''}>${t(player.ready?'waiting':'endTurn')}</button></footer>${modalMarkup(world,ui,t)}</div>`;
}

function modalMarkup(world,ui,t){
  const state=world.state,player=state.players[world.playerId];
  const mode=state.phase==='ended'?'outcome':ui.modal==='handover'?'handover':state.phase==='assembly'?'assembly':ui.modal;
  if(!mode)return '';
  let content='',wide=false;
  const g=key=>f(ui.lang,key);

  if(mode==='moves')content=`<h2 id="modal-title">${g('chooseMove')}</h2><div class="move-categories">${['explore','build','routes','research','supplies'].map(id=>`<button class="outline-button" data-cmd="category-${id}">${g(id)}${icon('arrow')}</button>`).join('')}</div>`;
  if(['explore','build','routes'].includes(mode))content=`<h2 id="modal-title">${g(mode)}</h2><div class="focused-projects">${mode==='explore'?['scout','clear'].map(id=>`<button class="outline-button" data-arm="${id}" ${!player.actionsLeft||player.ready?'disabled':''}>${icon(id)}${t(id)}<small>${t(id+'Help')}</small></button>`).join(''):(mode==='build'?['farm','mine','archive','shrine','storehouse','workshop']:['road','bridge','canal']).map(id=>projectCard(state,player,id,mode==='build'?'build':'infrastructure',ui,t)).join('')}</div><button class="text-button" data-cmd="moves">← ${g('back')}</button>`;
  if(mode==='supplies')content=`<h2 id="modal-title">${g('supplies')}</h2><div class="move-categories"><button class="outline-button" data-cmd="trade">${g('partner')}</button><button class="outline-button" data-cmd="deliver" ${state.work.complete?'disabled':''}>${g('goal')}</button></div>`;
  if(mode==='stocks'){const forecast=harvestForecast(state.board,player,state.clock.round,state.clock.season),amount=forecast.yield;content=`<h2 id="modal-title">${g('stocks')}</h2><div class="forecast-list">${RESOURCES.map(key=>`<p>${t(key)}: <b>${player.stock[key]}</b> · +${amount[key]} ${t('perTurn')}</p>`).join('')}</div><p>${g('impact')}: ${forecast.impact} · ${forecast.upkeep} ${t('upkeep')}</p><p>${t(state.clock.season+'Forecast')}</p>`;}
  if(mode==='goal')content=`<h2 id="modal-title">${g('goal')}</h2>${workPanel(state,t)}`;
  if(mode==='history')content=`<h2 id="modal-title">${g('history')}</h2>${chronicle(state,t)}`;
  if(mode==='partner'){const ally=Object.values(state.players).find(p=>p.id!==player.id);content=`<h2 id="modal-title">${t(ally.civilization)}</h2><p>${t(ally.civilization==='highland'?'needsFood':'needsMaterials')}</p><div class="partner-portrait">${portrait(ally.id)}</div>${costs(ally.stock,t)}<p>${ally.ready?t('waiting'):ally.actionsLeft+' '+t('actions')}</p>${world.role==='host'?`<button class="outline-button" data-player="${ally.id}">${g('handover')}</button>`:''}<button class="gold-button full" data-cmd="trade" ${player.ready||!player.actionsLeft?'disabled':''}>${t('trade')}</button>`;}
  if(mode==='inspect')content=`<h2 id="modal-title">${t('selected')}</h2>${selectedPanel(world,ui,t)}`;
  if(mode==='research-confirm'){const rule=RESEARCH[ui.discovery];content=rule?`<h2 id="modal-title">${t(ui.discovery)}</h2><p>${t('unlocks')}: ${t(rule.unlocks)}</p><p>${t(rule.unlocks+'Help')}</p>${costs(rule.cost,t)}<p>1 ${t('action')}</p><button class="gold-button full" data-cmd="confirm-research" ${player.ready||!player.actionsLeft||player.stock.knowledge<rule.cost.knowledge?'disabled':''}>${g('confirmResearch')}</button><button class="text-button" data-cmd="research">← ${g('back')}</button>`:'';}
  if(mode==='result')content=`<h2 id="modal-title">${g('outcome')}</h2><p class="modal-lead">${safe(ui.resultMessage||'')}</p><button class="gold-button full" data-cmd="result-next">${g('continue')}${icon('arrow')}</button>`;
  if(mode==='season'){const harvests=state.log.filter(e=>e.type==='harvest').slice(-Object.keys(state.players).length);content=`<h2 id="modal-title">${g('seasonResult')}</h2><p class="modal-lead">${t(state.clock.season)} · ${t('turn')} ${state.clock.round}</p>${harvests.map(e=>`<p>${t(state.players[e.playerId]?.civilization)}: ${costs(e.yield,t)} · ${e.upkeep} ${t('upkeep')}</p>`).join('')}<p>${t(state.clock.season+'Forecast')}</p><button class="gold-button full" data-cmd="season-next">${g('returnTurn')}</button>`;}
  if(mode==='handover')content=`<h2 id="modal-title">${g('handover')}</h2><p class="modal-lead">${t(state.players[ui.handover]?.civilization||player.civilization)}</p><button class="gold-button full" data-cmd="handover-next">${g('continue')}</button>`;

  if(mode==='welcome')content=`<div class="welcome-symbol">${icon('crown')}</div><div class="section-kicker">${t('era')} · ${t('passPlay')}</div><h2 id="modal-title">${t('welcomeTitle')}</h2><p class="modal-lead">${t('welcomeText')}</p><div class="welcome-steps"><span>${icon('scout')}${t('scout')}</span><i>→</i><span>${icon('farm')}${t('districts')}</span><i>→</i><span>${icon('crown')}${t('work')}</span></div><button class="gold-button full large" data-cmd="start">${t('start')}${icon('arrow')}</button><p class="modal-note">${t('hostHelp')}</p><button class="text-button" data-cmd="join">${t('join')} →</button>`;
  if(mode==='join')content=`<div class="section-kicker">${t('cooperative')}</div><h2 id="modal-title">${t('join')}</h2><form id="join-world"><label class="code-label">${t('code')}<input name="code" placeholder="ABCDE-12345" maxlength="20" autocomplete="off" required /></label><div class="join-roles">${['highland','river'].map(id=>`<label><input type="radio" name="playerId" value="${id}" ${id==='river'?'checked':''} />${portrait(id)}<span>${t(id)}</span></label>`).join('')}</div><button class="gold-button full large" type="submit">${t('join')}${icon('arrow')}</button></form>`;
  if(mode==='share')content=`<div class="section-kicker">${t('cooperative')}</div><h2 id="modal-title">${t('share')}</h2><p>${t('joinHelp')}</p><div class="share-code">${safe(world.code.slice(0,5)+'-'+world.code.slice(5))}</div><button class="gold-button full" data-cmd="copy">${t('copy')}</button><button class="text-button" data-cmd="join">${t('join')} →</button>`;
  if(mode==='help')content=`<div class="section-kicker">${t('era')}</div><h2 id="modal-title">${t('rules')}</h2><p class="modal-lead">${t('rulesText')}</p><div class="rules-victory">${icon('crown')}<p>${t('objective')}</p></div><p>${t('hostHelp')}</p><button class="gold-button full" data-cmd="close">${t('close')}</button>`;
  if(mode==='new')content=`<h2 id="modal-title">${t('newWorld')}</h2><p>${t('newWarning')}</p><button class="gold-button full" data-cmd="start">${t('start')}${icon('arrow')}</button>`;
  if(mode==='ready')content=`<div class="section-kicker">${t('turn')} ${state.clock.round}</div><h2 id="modal-title">${t('commitTitle')}</h2><p>${player.actionsLeft} ${t('actions')} · ${t('commitHelp')}</p><button class="gold-button full" data-cmd="commit">${t('endTurn')}${icon('arrow')}</button><button class="text-button" data-cmd="close">${t('keepPlanning')}</button>`;
  if(mode==='research'){
    wide=true;
    content=`<div class="section-kicker">${t('era')}</div><h2 id="modal-title">${t('research')}</h2><p>${t('knowledge')}: ${player.stock.knowledge} · 1 ${t('action')}</p><div class="discovery-tree"><div class="discovery-root">${icon('research')}<span>${t('settlement')}</span></div><div class="discoveries">${Object.entries(RESEARCH).map(([id,rule])=>{const learned=player.research?.includes(id);return `<article class="discovery-card ${learned?'learned':''}">${icon(rule.unlocks)}<h3>${t(id)}</h3><p>${t('unlocks')} ${t(rule.unlocks)}</p><small>${t(rule.unlocks+'Help')}</small><button class="${learned?'outline-button':'gold-button'}" data-research="${id}" ${learned||player.ready||!player.actionsLeft||player.stock.knowledge<rule.cost.knowledge?'disabled':''}>${learned?'✓ '+t('learned'):costs(rule.cost,t)+' '+t('learn')}</button></article>`}).join('')}</div></div>`;
  }
  if(mode==='trade'||mode==='deliver'){
    const preview=deliveryPreview(world,ui,ui.lang),stage=GREAT_WORK_STAGES[Math.min(state.work.stage,2)];
    content=`<div class="section-kicker">${mode==='trade'?t('partner'):t('sharedGoal')}</div><h2 id="modal-title">${g(ui.deliveryStep==='review'?'routeReview':'cargo')}</h2><p>${mode==='deliver'?t(stage.id)+' · '+t('due')+' '+stage.deadline:t('cargo')}</p>${ui.deliveryStep==='review'?`<div class="route-preview ${preview.error?'invalid':''}">${icon('road')}<span>${preview.error||preview.path.join(' → ')}${preview.bottlenecks?.map(edge=>'<br>'+safe(edge.from)+' ↔ '+safe(edge.to)+': '+edge.remaining+'/'+edge.limit+' '+t('capacity')).join('')||''}${!preview.error?'<br>'+t('capacity')+': '+preview.capacity:''}</span></div><p>${costs(ui.cargo,t)} · 1 ${t('action')}</p><p>${g('confirmation')}</p><button class="gold-button full" data-cmd="send" ${preview.error?'disabled':''}>${t('confirmDelivery')}${icon('arrow')}</button><button class="text-button" data-cmd="cargo-back">← ${g('back')}</button>`:`<div class="cargo-list">${RESOURCES.map(key=>`<div class="cargo-row"><span>${icon(key)}${t(key)}<small>${player.stock[key]}</small></span><button class="icon-button" data-cargo="${key}:-1" aria-label="${t('zoomOut')} ${t(key)}" ${!ui.cargo[key]?'disabled':''}>${icon('minus')}</button><output>${ui.cargo[key]??0}</output><button class="icon-button" data-cargo="${key}:1" aria-label="${t('zoomIn')} ${t(key)}" ${ui.cargo[key]>=player.stock[key]?'disabled':''}>${icon('plus')}</button></div>`).join('')}</div><button class="gold-button full" data-cmd="delivery-review" ${!resourceTotal(ui.cargo)?'disabled':''}>${g('reviewDelivery')}${icon('arrow')}</button>`}`;
  }

  if(mode==='assembly'){
    wide=true;
    content=`<div class="section-kicker">${t(state.clock.season)} · ${t('turn')} ${state.clock.round}</div><h2 id="modal-title">${t('assembly')}</h2><p>${t('assemblyHelp')}</p><div class="assembly-votes">${Object.values(state.players).map(p=>`<div>${portrait(p.id)}<span>${t(p.civilization)}<small>${state.assembly.votes[p.id]?t(state.assembly.votes[p.id]):t('noVote')}</small></span>${world.role==='host'?`<button class="text-button" data-player="${p.id}">${p.id===world.playerId?'●':'↗'}</button>`:''}</div>`).join('')}</div><div class="policy-options">${['conserve','mobilize'].map(policy=>`<button class="policy-card ${state.assembly.votes[player.id]===policy?'selected':''}" data-vote="${policy}">${icon(policy==='conserve'?'balance':'workshop')}<h3>${t(policy)}</h3><p>${t(policy+'Help')}</p><span>${t('vote')} ${icon('arrow')}</span></button>`).join('')}</div>`;
  }
  if(mode==='outcome'){
    const won=state.outcome.status==='won',reason=state.outcome.reason;
    const message=reason.includes('survive')?'deficit':reason.includes('deadline')?'deadline':reason.includes('collapsed')?'collapse':'recovery';
    content=`<div class="welcome-symbol ${won?'':'lost'}">${icon(won?'crown':'snow')}</div><div class="section-kicker">${t('turn')} ${state.clock.round} · ${t('era')}</div><h2 id="modal-title">${t(won?'won':'lost')}</h2><p class="modal-lead">${t(won?'wonText':message)}</p><div class="ending-checks"><span class="${state.work.complete?'passed':''}">${icon('crown')}${t('workLabel')} ${state.work.history.length}/3</span><span class="${state.ecosystem>=30?'passed':''}">${icon('balance')}${t('balanceLabel')} · ${state.ecosystem}</span><span class="${Object.values(state.players).every(p=>p.health>0)?'passed':''}">${icon('heart')}${t('healthLabel')}</span></div><button class="gold-button full large" data-cmd="start">${t('advance')}${icon('arrow')}</button>`;
  }
  const dismissible=!['welcome','assembly','outcome','result','season','handover'].includes(mode);
  return `<div class="modal-shell"><section class="game-modal ${wide?'wide':''} ${mode==='welcome'?'welcome':''}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">${dismissible?`<button class="modal-close icon-button" data-cmd="close" aria-label="${t('close')}">${icon('x')}</button>`:''}${content}</section></div>`;
}
