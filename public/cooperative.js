import { createSession, sessionView } from '../shared/strategy/turn-manager.js';
import { calculatePlayerYield, adjacentTiles } from '../shared/strategy/hex.js';
import { GREAT_WORK_STAGES } from '../shared/strategy/great-work.js';
import { resources } from '../shared/strategy/resources.js';
import { gameMarkup, deliveryPreview, placementError } from './cooperative-view.js';
import { label } from './cooperative-copy.js';
import { f } from '../shared/flow-copy.js';

const root=document.querySelector('#game'),announcer=document.querySelector('#announcer'),toastBox=document.querySelector('#toast');
const initial=createSession();
let world={code:'',role:'preview',playerId:'highland',state:sessionView(initial,'highland'),forecasts:Object.fromEntries(Object.values(initial.players).map(p=>[p.id,calculatePlayerYield(initial.board,p,1).yield]))};
function savedPreference(key,fallback){try{return localStorage.getItem(key)||fallback;}catch{return fallback;}}
function preference(key,value){try{localStorage.setItem(key,value);}catch{}}
const ui={lang:savedPreference('civ_lang','en')==='ja'?'ja':'en',modal:null,selected:'-2,0',arm:null,cargo:resources(),busy:false,connection:'saved',deliveryStep:'cargo',discovery:null,reviewRevision:null,handover:null,seasonPending:false,resultMessage:''};
let stream=null,toastTimer=null,drag=null,ignoreClick=false;
let camera={x:-390,y:-327,width:780,height:654};
const t=key=>label(ui.lang,key);

function toast(message){toastBox.textContent=message;toastBox.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toastBox.classList.remove('visible'),4500);announcer.textContent=message;}
function render(){
  const active=document.activeElement,focusKey=active?.dataset&&Object.entries(active.dataset).find(([key])=>['cmd','arm','player','mapTile','cargo','research','vote'].includes(key));
  const inputFocus=active?.name,selection=typeof active?.selectionStart==='number'?[active.selectionStart,active.selectionEnd]:null;
  const oldInput=root.querySelector('input[name="code"]')?.value;
  const oldRole=root.querySelector('input[name="playerId"]:checked')?.value;
  const panelScrolls=['.production-panel','.council-panel'].map(selector=>[selector,root.querySelector(selector)?.scrollTop??0]);
  document.documentElement.lang=ui.lang;document.querySelector('.skip').textContent=f(ui.lang,'skipMap');
  root.innerHTML=gameMarkup(world,ui);
  root.setAttribute('aria-busy',String(ui.busy));
  if(ui.busy)for(const button of root.querySelectorAll('button'))button.disabled=true;
  for(const [selector,scrollTop] of panelScrolls){const panel=root.querySelector(selector);if(panel)panel.scrollTop=scrollTop;}
  if(root.querySelector('.modal-shell'))for(const child of root.querySelectorAll('.game-shell > :not(.modal-shell)'))child.setAttribute('inert','');
  applyCamera();
  if(oldInput&&root.querySelector('input[name="code"]'))root.querySelector('input[name="code"]').value=oldInput;
  if(oldRole&&root.querySelector(`input[name="playerId"][value="${CSS.escape(oldRole)}"]`))root.querySelector(`input[name="playerId"][value="${CSS.escape(oldRole)}"]`).checked=true;
  let target;
  if(focusKey){const attribute='data-'+focusKey[0].replace(/[A-Z]/g,c=>'-'+c.toLowerCase());target=root.querySelector(`[${attribute}="${CSS.escape(focusKey[1])}"]`);}
  else if(inputFocus)target=root.querySelector(`[name="${CSS.escape(inputFocus)}"]`);
  if(target&&!target.disabled){target.focus({preventScroll:true});if(selection&&target.setSelectionRange)target.setSelectionRange(...selection);}
  if(root.querySelector('.game-modal')&&!root.querySelector('.game-modal').contains(document.activeElement))focusModal();
}
function focusModal(){const modal=root.querySelector('.game-modal');(modal?.querySelector('input,button:not(:disabled)')??modal)?.focus({preventScroll:true});}
function openModal(name){ui.modal=name;ui.arm=null;render();focusModal();}
async function api(path,body){
  const response=await fetch(path,{method:body===undefined?'GET':'POST',headers:body===undefined?{}:{'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body),credentials:'same-origin'});
  const data=await response.json();
  if(!response.ok){if(response.status===409&&data.state)adopt(data);throw Object.assign(new Error(data.error||'Could not save the world'),{status:response.status});}
  return data;
}
function adopt(data){
  if(!data.state)return;
  if(data.code===world.code&&data.playerId===world.playerId&&data.state.revision<world.state.revision)return;
  const previous=world;
  if(data.code===world.code&&data.state.revision!==world.state.revision){
    if(ui.arm||['research-confirm','trade','deliver'].includes(ui.modal))ui.reviewRevision=null;
    const player=data.state.players[data.playerId];
    if((data.state.phase!=='planning'||player.ready||!player.actionsLeft)&&ui.arm){ui.arm=null;toast(f(ui.lang,'expired'));}
    if(data.state.phase!=='planning'||player.ready||!player.actionsLeft){if(['moves','explore','build','routes','research','research-confirm','trade','deliver','supplies'].includes(ui.modal)){ui.modal=null;toast(f(ui.lang,'expired'));}}
    if(data.state.log.filter(e=>e.type==='harvest').length>previous.state.log.filter(e=>e.type==='harvest').length)ui.seasonPending=true;
  }
  world=data;
  if(ui.modal==='waiting'&&(!world.state.players[world.playerId].ready||world.state.phase!=='planning'))ui.modal=null;
  if(!world.state.board[ui.selected]||ui.selected===null)ui.selected=world.state.players[world.playerId].settlement;
  preference('civ_active',world.playerId);
}

function openStream(){
  stream?.close();
  const code=world.code,playerId=world.playerId;
  stream=new EventSource('/api/world/events?player='+encodeURIComponent(playerId));
  stream.onopen=()=>{ui.connection='saved';render();};
  stream.onerror=()=>{ui.connection='offline';render();};
  stream.addEventListener('world',event=>{
    const data=JSON.parse(event.data);
    if(code!==world.code||playerId!==world.playerId||data.state.revision<=world.state.revision)return;
    const previousRound=world.state.clock.round;
    adopt(data);if(ui.seasonPending&&world.state.phase==='planning'&&!ui.modal){ui.modal='season';ui.seasonPending=false;}render();
    if(previousRound!==world.state.clock.round)toast(t('resolved')+' · '+t(world.state.clock.season));
  });
}
async function switchPlayer(playerId){
  if(world.role==='preview'){world={...world,playerId,state:sessionView(initial,playerId)};ui.selected=world.state.players[playerId].settlement;render();return;}
  if(world.role!=='host'||playerId===world.playerId)return;
  adopt(await api('/api/world/me?player='+encodeURIComponent(playerId)));
  ui.arm=null;ui.selected=world.state.players[playerId].settlement;render();openStream();
}
async function send(action){
  if(world.role==='preview'){openModal('welcome');return;}
  const round=world.state.clock.round,actor=world.playerId;
  const data=await api('/api/world/action',{playerId:actor,action:{...action,expectedRevision:world.state.revision}});
  adopt(data);ui.arm=null;
  const messages={scout:'discovered',build:'built',infrastructure:'routeBuilt',clear:'cleared',ship:'delivered',contribute:'delivered',research:'researchDone',ready:'committed',vote:'assembly'};
  ui.resultMessage=t(messages[action.type]||'saved');ui.modal='result';
  if(action.type==='ready'&&world.role==='host'&&world.state.phase!=='ended'){
    ui.handover=world.state.clock.round!==round?'highland':Object.keys(world.state.players).find(id=>id!==actor);
  }
  if(action.type==='vote'&&world.role==='host'&&world.state.phase==='assembly')ui.handover=Object.keys(world.state.players).find(id=>!world.state.assembly.votes[id])||null;
  if(ui.handover===actor)ui.handover=null;
  render();focusModal();
}
function confirmRevision(){
 if(ui.reviewRevision===world.state.revision)return true;
 ui.reviewRevision=world.state.revision;toast(f(ui.lang,'changed'));render();return false;
}
function armAction(arm){ui.arm=arm;ui.modal=null;ui.reviewRevision=world.state.revision;render();root.querySelector('#coop-task-title')?.focus({preventScroll:true});}

function openDelivery(mode){
  if(world.role==='preview'){openModal('welcome');return;}
  ui.modal=mode;ui.arm=null;ui.cargo=resources();ui.deliveryStep='cargo';ui.reviewRevision=world.state.revision;
  const player=world.state.players[world.playerId];
  let available=4;
  const required=mode==='deliver'?resources(GREAT_WORK_STAGES[Math.min(world.state.work.stage,2)].cost):null;
  const order=player.civilization==='highland'?['materials','knowledge','culture','food']:['food','culture','knowledge','materials'];
  for(const key of order){
    const remaining=required?Math.max(0,required[key]-world.state.work.delivered[key]):Infinity;
    const n=Math.min(available,player.stock[key],remaining);
    ui.cargo[key]=n;available-=n;
  }
  render();focusModal();
}
async function begin(){
  stream?.close();adopt(await api('/api/world/create',{}));
  ui.modal=null;ui.selected=world.state.players[world.playerId].settlement;ui.arm=null;
  camera={x:-390,y:-327,width:780,height:654};render();openStream();toast(t('firstHint'));
}

root.addEventListener('click',async event=>{
  if(ignoreClick){ignoreClick=false;return;}
  const tile=event.target.closest('[data-map-tile]');
  if(tile){ui.selected=tile.dataset.mapTile;ui.reviewRevision=world.state.revision;if(!ui.arm)ui.modal='inspect';render();return;}
  const control=event.target.closest('button,[data-player]');
  if(!control||control.disabled||ui.busy)return;
  try{
    if(control.dataset.arm){armAction(control.dataset.arm);return;}
    if(control.dataset.cargo){const [key,delta]=control.dataset.cargo.split(':');ui.cargo[key]=Math.max(0,Math.min(world.state.players[world.playerId].stock[key],ui.cargo[key]+Number(delta)));render();return;}
    if(control.dataset.player){ui.handover=control.dataset.player;openModal('handover');return;}
    if(control.dataset.research){ui.discovery=control.dataset.research;ui.reviewRevision=world.state.revision;openModal('research-confirm');return;}
    if(control.dataset.vote){ui.busy=true;render();await send({type:'vote',policy:control.dataset.vote});return;}
    const cmd=control.dataset.cmd;
    if(cmd==='start'){ui.busy=true;render();ui.handover=null;ui.seasonPending=false;await begin();}
    else if(cmd==='language'){ui.lang=ui.lang==='en'?'ja':'en';preference('civ_lang',ui.lang);render();}
    else if(cmd==='close'){ui.modal=world.role==='preview'?'welcome':null;render();}
    else if(['help','research','join','new','share'].includes(cmd)){openModal(world.role==='preview'&&cmd==='share'?'welcome':cmd);}
    else if(cmd==='copy'){await navigator.clipboard.writeText(world.code);toast(t('copied'));}
    else if(cmd==='cancel-arm'){ui.arm=null;openModal('moves');}
    else if(cmd==='deliver'||cmd==='trade')openDelivery(cmd);
    else if(cmd==='ally')openModal('partner');
    else if(cmd?.startsWith('arm-'))armAction(cmd==='arm-scout'?'scout':'infrastructure:'+cmd.slice(4));
    else if(cmd==='ready'){ui.reviewRevision=world.state.revision;openModal('ready');}
    else if(cmd==='commit'){if(!confirmRevision())return;ui.busy=true;render();await send({type:'ready'});}
    else if(cmd==='place'){
      if(!confirmRevision())return;const error=placementError(world.state,world.playerId,ui.selected,ui.arm,ui.lang);if(error)throw new Error(error);
      const [type,id]=ui.arm.split(':'),action={type,tileId:ui.selected};
      if(type==='build')action.structure=id;if(type==='infrastructure')action.infrastructure=id;
      ui.busy=true;render();await send(action);
    }
    else if(cmd==='send'){
      if(!confirmRevision())return;
      const result=deliveryPreview(world,ui,ui.lang);if(result.error){toast(result.error);return;}
      const ally=Object.keys(world.state.players).find(id=>id!==world.playerId);
      ui.busy=true;render();await send({type:ui.modal==='trade'?'ship':'contribute',cargo:ui.cargo,path:result.path,...(ui.modal==='trade'?{toPlayerId:ally}:{})});
    }
    else if(cmd==='moves'||['stocks','goal','partner','history'].includes(cmd))openModal(cmd);
    else if(cmd?.startsWith('category-'))openModal(cmd.slice(9));
    else if(cmd==='confirm-research'){if(!confirmRevision())return;ui.busy=true;render();await send({type:'research',researchId:ui.discovery});}
    else if(cmd==='delivery-review'){ui.deliveryStep='review';ui.reviewRevision=world.state.revision;render();focusModal();}
    else if(cmd==='cargo-back'){ui.deliveryStep='cargo';render();}
    else if(cmd==='result-next'){ui.modal=ui.handover?'handover':ui.seasonPending?'season':world.state.players[world.playerId].ready&&world.state.phase==='planning'?'waiting':null;if(ui.modal==='season')ui.seasonPending=false;render();}
    else if(cmd==='handover-next'){const next=ui.handover;ui.handover=null;if(next){ui.busy=true;await switchPlayer(next);}ui.modal=ui.seasonPending?'season':null;ui.seasonPending=false;render();}
    else if(cmd==='season-next'){ui.modal=null;render();}
    else if(cmd==='zoom-in')zoom(.82);
    else if(cmd==='zoom-out')zoom(1.22);
    else if(cmd==='recenter'){camera={x:-390,y:-327,width:780,height:654};applyCamera();}
  }catch(error){toast(error.message);}
  finally{ui.busy=false;render();}
});
root.addEventListener('submit',async event=>{
  if(event.target.id!=='join-world')return;
  event.preventDefault();if(ui.busy)return;
  const form=new FormData(event.target);
  try{ui.busy=true;render();stream?.close();adopt(await api('/api/world/join',{code:form.get('code'),playerId:form.get('playerId')}));ui.modal=null;ui.arm=null;ui.selected=world.state.players[world.playerId].settlement;openStream();}
  catch(error){toast(error.message);}finally{ui.busy=false;render();}
});
root.addEventListener('keydown',event=>{
  const modal=root.querySelector('.game-modal');
  if(event.key==='Escape'&&modal&&world.state.phase==='planning'&&!['welcome','result','season','handover'].includes(ui.modal)){ui.modal=world.role==='preview'?'welcome':null;render();return;}
  if(event.key==='Escape'&&!modal){ui.arm=null;render();return;}
  if(modal&&event.key==='Tab'){
    const controls=[...modal.querySelectorAll('button:not(:disabled),input,a[href]')];
    if(!controls.length){event.preventDefault();return;}
    const first=controls[0],last=controls.at(-1);
    if(event.shiftKey&&(document.activeElement===first||!modal.contains(document.activeElement))){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&(document.activeElement===last||!modal.contains(document.activeElement))){event.preventDefault();first.focus();}
  }
  const tile=event.target.closest('[data-map-tile]');
  if(tile&&['Enter',' '].includes(event.key)){event.preventDefault();tile.dispatchEvent(new MouseEvent('click',{bubbles:true}));}
  if(tile&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){
    event.preventDefault();
    const here=world.state.board[tile.dataset.mapTile],directions={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]};
    const [q,r]=directions[event.key],next=adjacentTiles(world.state.board,here.id).find(other=>other.q===here.q+q&&other.r===here.r+r);
    const target=next&&root.querySelector(`[data-map-tile="${CSS.escape(next.id)}"]`);if(target){tile.setAttribute('tabindex','-1');target.setAttribute('tabindex','0');target.focus();}
  }
});

function applyCamera(){root.querySelector('#world-map')?.setAttribute('viewBox',`${camera.x} ${camera.y} ${camera.width} ${camera.height}`);}
function zoom(factor){
  const width=Math.max(420,Math.min(1100,camera.width*factor)),height=width*654/780;
  camera={x:camera.x+(camera.width-width)/2,y:camera.y+(camera.height-height)/2,width,height};applyCamera();
}
root.addEventListener('wheel',event=>{if(!event.target.closest('#world-map')||root.querySelector('.modal-shell'))return;event.preventDefault();zoom(event.deltaY>0?1.08:.92);},{passive:false});
root.addEventListener('pointerdown',event=>{if(event.button!==0||!event.target.closest('#world-map'))return;drag={x:event.clientX,y:event.clientY,camera:{...camera},moved:false};ignoreClick=false;});
root.addEventListener('pointermove',event=>{
  if(!drag)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y,svg=root.querySelector('#world-map');
  if(Math.hypot(dx,dy)<5&&!drag.moved)return;
  drag.moved=true;ignoreClick=true;svg.setPointerCapture(event.pointerId);
  const rect=svg.getBoundingClientRect();
  camera={...drag.camera,x:drag.camera.x-dx*drag.camera.width/rect.width,y:drag.camera.y-dy*drag.camera.height/rect.height};applyCamera();
});
root.addEventListener('pointerup',()=>{drag=null;});root.addEventListener('pointercancel',()=>{drag=null;ignoreClick=false;});

async function boot(){
  render();
  try{adopt(await api('/api/world/me?player='+encodeURIComponent(savedPreference('civ_active','highland'))));ui.modal=null;ui.selected=world.state.players[world.playerId].settlement;render();openStream();}
  catch(error){ui.modal='welcome';if(error.status!==401)toast(error.message);render();focusModal();}
}
boot();
