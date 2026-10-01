import test from 'node:test';
import assert from 'node:assert/strict';
import { createSession, sessionView, applySessionAction } from '../shared/strategy/turn-manager.js';
import { gameMarkup, placementError, deliveryPreview, placementProduction } from '../public/cooperative-view.js';
import { copy } from '../public/cooperative-copy.js';
import { resources } from '../shared/strategy/resources.js';
import { harvestForecast } from '../shared/strategy/hex.js';
import { reserveRoute } from '../shared/strategy/logistics.js';

const ui={lang:'en',selected:'-2,0',arm:null,cargo:resources(),modal:null,busy:false,connection:'saved'};
test('the cooperative UI has complete English and Japanese copy',()=>{
  assert.deepEqual(Object.keys(copy.en),Object.keys(copy.ja));
  for(const values of Object.values(copy))for(const value of Object.values(values))assert(value.trim());
});
test('the map-first screen renders both languages, commitment controls and scoped fog',()=>{
  const state=createSession(),world={code:'ABCDE12345',role:'host',playerId:'highland',state:sessionView(state,'highland')};
  for(const lang of ['en','ja']){
    const html=gameMarkup(world,{...ui,lang});
    assert.match(html,/id="world-map"/);assert.match(html,/data-cmd="ready"/);
    assert.match(html,/data-map-tile="-1,-2"[^>]*aria-label="[^"]+"/);
    assert(!html.includes('undefined'));assert(!html.includes('NaN'));
  }
});
test('placement previews match the authoritative action rules on projected tiles',()=>{
  const state=createSession(),view=sessionView(state,'highland');
  assert.equal(placementError(view,'highland','0,0','scout'),'');
  assert.equal(placementError(view,'highland','-2,-1','build:archive'),'');
  assert(placementError(view,'highland','2,0','build:archive').includes('partner'));
  assert(placementError(view,'highland','-2,0','build:archive').includes('already'));
  assert(placementError(view,'highland','-2,-1','build:workshop').includes('Learn'));
  assert.doesNotThrow(()=>applySessionAction(state,{actorId:'highland',expectedRevision:0,type:'build',structure:'archive',tileId:'-2,-1'}));
});
test('an unexplored or disconnected route gives a useful preview rather than throwing',()=>{
  const world={role:'host',playerId:'highland',state:sessionView(createSession(),'highland')};
  const result=deliveryPreview(world,{...ui,modal:'deliver',cargo:resources({materials:4})},'en');
  assert.match(result.error,/continuous road/);assert.equal(result.path,null);
  assert.match(deliveryPreview(world,{...ui,modal:'deliver'},'en').error,/at least/);
});

test('cooperative screens separate cargo, route review, research confirmation and outcomes',()=>{
 const state=createSession(),world={code:'ABCDE12345',role:'host',playerId:'highland',state:sessionView(state,'highland')};
 for(const lang of ['en','ja']){
  const render=extra=>gameMarkup(world,{...ui,lang,...extra});
  const hub=render({});assert(!hub.includes('class="project-card'));assert(!hub.includes('class="cargo-list'));assert(!hub.includes('class="discovery-tree'));
  const cargo=render({modal:'deliver',deliveryStep:'cargo',cargo:resources({materials:1})});assert(cargo.includes('class="cargo-list'));assert(!cargo.includes('data-cmd="send"'));
  const route=render({modal:'deliver',deliveryStep:'review',cargo:resources({materials:1})});assert(!route.includes('class="cargo-list'));assert(route.includes('data-cmd="send"'));
  const research=render({modal:'research-confirm',discovery:'masonry'});assert(research.includes('data-cmd="confirm-research"'));assert(!research.includes('class="discovery-tree'));
  for(const modal of ['result','season','handover']){const s=render({modal,handover:'river'});assert(!s.includes('class="modal-close'));assert(s.includes('aria-modal="true"'));}
 }
});

test('placement harvest previews include neighboring production and agree with authoritative resolution',()=>{
 let state=createSession();state.board['-2,-1']={...state.board['-2,-1'],terrain:'hills'};
 state.players.highland.research=['masonry'];state.players.highland.stock.materials=20;
 for(const season of ['spring','autumn','winter']){
  const current={...state,clock:{...state.clock,season}},preview=placementProduction(sessionView(current,'highland'),'highland','-2,-1','build:workshop');
  const built=applySessionAction(current,{type:'build',actorId:'highland',expectedRevision:current.revision,tileId:'-2,-1',structure:'workshop'});
  assert.deepEqual(preview.after,harvestForecast(built.board,built.players.highland,built.clock.round,season));
  assert(preview.after.yield.materials>preview.before.yield.materials);
  assert.equal(preview.after.impact-preview.before.impact,3);
 }
});

test('delivery preview identifies exhausted physical route segments',()=>{
 const state=createSession(),path=['-2,0','-1,0','0,0','1,0','2,0'];
 for(const id of path){state.board[id].exploredBy=['highland','river'];if(state.board[id].structure!=='settlement')state.board[id].infrastructure=state.board[id].terrain==='river'?'bridge':'road';}
 state.logistics.edgeUsage={'-1,0|0,0':4};
 const world={role:'host',playerId:'highland',state:sessionView(state,'highland')},preview=deliveryPreview(world,{modal:'trade',cargo:resources({materials:2})},'en');
 assert(preview.error);assert.deepEqual(preview.path,path);assert.equal(preview.bottlenecks[0].remaining,0);
 assert.throws(()=>reserveRoute(state.board,state.logistics.edgeUsage,path,path[0],path.at(-1),{materials:2},'highland',1),/capacity/);
 const html=gameMarkup(world,{...ui,modal:'trade',deliveryStep:'review',cargo:resources({materials:2})});assert(html.includes('delivery-bottleneck'));assert.match(html,/data-cmd="send" disabled/);
});
