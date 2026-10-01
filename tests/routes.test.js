import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, initialState, textFields, submissionGaps } from '../shared/game.js';
import { civilizationRoutes, routeUnlocked, routeEligibility } from '../shared/routes.js';

function completeTeam(technology=['pottery','writing','sailing','mining','wheel'],civics=['laws','trade','empire','philosophy']) {
  const actions=[{type:'map',point:'A'},...textFields.map(key=>({type:'field',key,value:'Our team explanation'})),
    {type:'event',id:'origin',choice:'explore'},...technology.map(id=>({type:'pick',tree:'tech',id})),
    {type:'event',id:'encounter',choice:'exchange'},...civics.map(id=>({type:'pick',tree:'civic',id})),{type:'stage',stage:4}];
  return actions.reduce(applyAction,initialState());
}

test('outward routes need both a technology and a civic; local development needs neither',()=>{
  const state={...initialState(),mapPoint:'A',tech:['wheel','sailing','writing']};
  assert(routeUnlocked(state,'local'));
  for(const id of ['land','water','knowledge'])assert(!routeUnlocked(state,id));
  state.civic=['trade'];
  assert(routeUnlocked(state,'land'));assert(routeUnlocked(state,'water'));
  assert(!routeUnlocked(state,'knowledge'));
  state.civic=['philosophy'];assert(routeUnlocked(state,'knowledge'));
  state.tech=[];assert(!routeUnlocked(state,'knowledge'));
  assert(!routeUnlocked(state,'invented'));
});

test('each route has a legal discovery path within the classroom card limits',()=>{
  const state=completeTeam();
  for(const route of civilizationRoutes){
    assert(routeEligibility(state,route).unlocked,route.id);
    const next=applyAction(state,{type:'route',id:route.id});
    assert.equal(next.route,route.id);assert.equal(state.route,'','immutable reducer');
  }
});

test('final route is a capstone: early, incomplete and forged selections are rejected',()=>{
  const state=completeTeam();
  assert.throws(()=>applyAction({...state,stage:2},{type:'route',id:'land'}),/first three steps/);
  assert.throws(()=>applyAction({...state,beliefAnswer:''},{type:'route',id:'land'}),/first three steps/);
  assert.throws(()=>applyAction(state,{type:'route',id:'anything'}),/required technology/);
  assert.throws(()=>applyAction(completeTeam(['pottery'],['laws']),{type:'route',id:'land'}),/required technology/);
});

test('removing prerequisites or changing homeland clears an invalid final route',()=>{
  const state=applyAction(completeTeam(),{type:'route',id:'knowledge'});
  assert.equal(applyAction(state,{type:'pick',tree:'tech',id:'pottery'}).route,'');
  assert.equal(applyAction(state,{type:'pick',tree:'civic',id:'trade'}).route,'');
  assert.equal(applyAction(state,{type:'map',point:'B'}).route,'');
  assert.equal(applyAction(state,{type:'stage',stage:2}).route,'knowledge');
});

test('teams without outward discoveries and old saved teams can still submit',()=>{
  const state=completeTeam(['pottery'],['laws']);
  assert.deepEqual(submissionGaps(state),[]);
  assert.equal(applyAction(state,{type:'route',id:'local'}).route,'local');
  delete state.route;
  assert.deepEqual(submissionGaps(state),[]);
  assert.doesNotThrow(()=>applyAction(state,{type:'stage',stage:4}));
});
