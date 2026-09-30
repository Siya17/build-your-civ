import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, initialState, questStatus, submissionGaps, codeTag, isCodeShape, normalizeCode } from '../shared/game.js';
import { locations } from '../shared/world.js';
import { sceneMarkup } from '../public/rpg.js';

const readyPlace=()=>[
  {type:'map',point:'A'},
  {type:'field',key:'placeAnswer',value:'The river helps travel but flooding is difficult.'}
].reduce((state,action)=>applyAction(state,action),initialState());

test('one shared character follows the map point, including existing teams',()=>{
  for(const point of 'ABCDEFGHIJK'){
    const state=applyAction({...readyPlace(),avatar:'maker'},{type:'map',point});
    assert.equal(state.avatar,point);
    assert.throws(()=>applyAction(state,{type:'avatar',id:point==='A'?'B':'A'}),/chosen location/);
  }
  assert.equal(applyAction({...readyPlace(),avatar:'pathfinder'},{type:'stage',stage:2}).avatar,'A');
});

test('prerequisites, seven-choice limit, and dependent removal', () => {
  let state=readyPlace();
  assert.throws(()=>applyAction(state,{type:'pick',tree:'tech',id:'irrigation'}),/earlier/);
  for(const id of ['pottery','sailing','shipbuilding','astrology','navigation','irrigation','writing']) state=applyAction(state,{type:'pick',tree:'tech',id});
  assert.equal(state.tech.length,7);
  assert.throws(()=>applyAction(state,{type:'pick',tree:'tech',id:'currency'}),/seven/);
  state=applyAction(state,{type:'pick',tree:'tech',id:'sailing'});
  assert(!state.tech.includes('shipbuilding'));
  assert(state.tech.includes('navigation'),'alternative prerequisite keeps navigation available');
});

test('four event paths unlock different cards and cleanly reset later choices', () => {
  for(const [first,second,techCard,civicCard] of [
    ['steward','share','preservation','mutual_aid'],
    ['steward','reserve','preservation','resource_council'],
    ['explore','exchange','route_mapping','trade_accord'],
    ['explore','guard','route_mapping','route_stewards']
  ]){
    let state=readyPlace();
    assert.throws(()=>applyAction(state,{type:'pick',tree:'tech',id:techCard}),/event/);
    state=applyAction(state,{type:'event',id:'origin',choice:first});
    state=applyAction(state,{type:'pick',tree:'tech',id:techCard});
    state=applyAction(state,{type:'pick',tree:'tech',id:'pottery'});
    state=applyAction(state,{type:'event',id:'encounter',choice:second});
    state=applyAction(state,{type:'pick',tree:'civic',id:civicCard});
    assert(state.tech.includes(techCard));
    assert(state.civic.includes(civicCard));
    const changed=applyAction(state,{type:'event',id:'origin',choice:first==='steward'?'explore':'steward'});
    assert.equal(changed.events.encounter,'');
    assert(!changed.tech.includes(techCard));
    assert(!changed.civic.includes(civicCard));
    assert.equal(state.events.encounter,second,'previous state is not mutated');
  }
});

test('submission requires short explanations, card paths, both decisions and a character', () => {
  let state=readyPlace();
  assert(submissionGaps(state).includes('techAnswer'));
  state=applyAction(state,{type:'event',id:'origin',choice:'steward'});
  state=applyAction(state,{type:'pick',tree:'tech',id:'pottery'});
  state=applyAction(state,{type:'event',id:'encounter',choice:'share'});
  state=applyAction(state,{type:'pick',tree:'civic',id:'laws'});
  for(const key of ['techAnswer','societyAnswer','beliefAnswer','contactAnswer']) state=applyAction(state,{type:'field',key,value:'Team explanation'});
  assert.deepEqual(submissionGaps(state),[]);
  assert.deepEqual(questStatus(state,true),[true,true,true,true]);
});

test('a branch card does not replace the original flowchart choice',()=>{
  let state=readyPlace();
  state=applyAction(state,{type:'event',id:'origin',choice:'steward'});
  state=applyAction(state,{type:'pick',tree:'tech',id:'preservation'});
  assert(submissionGaps(state).includes('tech'));
  assert.throws(()=>applyAction(state,{type:'event',id:'encounter',choice:'share'}),/technology path/);
});

test('join codes are built from the team name and still accept older codes',()=>{
  assert.equal(codeTag('Team A'),'A');
  assert.equal(codeTag('team k'),'K');
  assert.equal(codeTag('River Makers!'),'RIVERMAKER');
  assert.equal(codeTag('さくら'),'TEAM','a name without Latin letters still gets a tag');
  assert(isCodeShape(normalizeCode('a-427')));
  assert(isCodeShape('RIVERMAKER123'));
  assert(isCodeShape('ABCDEFGH2'),'a nine-character code from before still works');
  assert(!isCodeShape('A42'));
  assert(!isCodeShape('ABC'));
});

test('a fixed homeland cannot be changed',()=>{
  const state={...initialState(),mapPoint:'C',avatar:'C',fixedPoint:'C'};
  assert.throws(()=>applyAction(state,{type:'map',point:'D'}),/homeland/);
  assert.equal(applyAction(state,{type:'map',point:'C'}).mapPoint,'C');
});

test('every map point has distinct sourced bilingual geography notes',()=>{
  assert.deepEqual(Object.keys(locations),'ABCDEFGHIJK'.split(''));
  const scenes=new Set();
  for(const location of Object.values(locations)){
    assert(location.source.startsWith('https://science.nasa.gov/'));
    assert.equal(location.facts.en.length,3);
    assert.equal(location.facts.ja.length,3);
    scenes.add(location.scene);
  }
  assert.equal(scenes.size,11);
  const posters=Object.keys(locations).map(point=>sceneMarkup(point,`Map point ${point}`,false));
  assert.equal(new Set(posters).size,11,'every point has distinct art');
  assert(posters.every(markup=>markup.includes('class="cinematic still"')),'static poster is available');
  assert(sceneMarkup('A','Map point A',true).includes('class="cinematic playing"'));
});
