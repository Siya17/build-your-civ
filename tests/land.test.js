import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, initialState, trees } from '../shared/game.js';
import { generateLand, hexes, center, improvements, terrains, revealRadius, fits, settleTiles } from '../shared/land.js';

const start=point=>[
  {type:'map',point},
  {type:'field',key:'placeAnswer',value:'The land shapes what we can build.'}
].reduce((state,action)=>applyAction(state,action),initialState());
const pick=(state,tree,id)=>applyAction(state,{type:'pick',tree,id});

test('every map point has its own fixed homeland with a settlement at the centre',()=>{
  const seen=new Set();
  for(const point of 'ABCDEFGHIJK'){
    const land=generateLand(point);
    assert.equal(land.tiles.length,37);
    assert.equal(hexes[center].dist,0);
    assert(land.tiles.every(t=>Object.hasOwn(terrains,t)),`${point} uses known terrain`);
    assert.notEqual(land.tiles[center],'coast',`${point} settlement stands on land`);
    assert.deepEqual(generateLand(point).tiles,land.tiles,'the same point always gives the same land');
    seen.add(land.tiles.join());
  }
  assert.equal(seen.size,11,'each place looks different');
  assert.equal(generateLand(''),null);
});

test('every development card raises exactly one kind of building',()=>{
  const cards=[...trees.tech,...trees.civic].map(item=>item.id).sort();
  assert.deepEqual(Object.keys(improvements).sort(),cards);
  for(const rule of Object.values(improvements)){
    assert(rule.name.en&&rule.name.ja&&rule.why.en&&rule.why.ja);
    assert(rule.terrains.every(t=>Object.hasOwn(terrains,t)));
  }
});

test('picking a card places its building on the nearest fitting explored hex',()=>{
  let state=pick(start('A'),'tech','pottery');
  const tile=state.tiles.pottery;
  assert(Number.isInteger(tile));
  assert.equal(hexes[tile].dist,1,'a granary stands next to the settlement');
  assert(fits(generateLand('A'),'pottery',tile));
});

test('placement is checked: explored, fitting, free and chosen',()=>{
  let state=pick(start('A'),'tech','pottery');
  const land=generateLand('A'),radius=revealRadius(state);
  const hidden=hexes.findIndex(h=>h.dist>radius);
  assert.throws(()=>applyAction(state,{type:'place',id:'pottery',tile:hidden}),/not explored/);
  assert.throws(()=>applyAction(state,{type:'place',id:'mining',tile:state.tiles.pottery}),/Choose this development/);
  assert.throws(()=>applyAction(state,{type:'place',id:'pottery',tile:center}),/settlement/);
  assert.throws(()=>applyAction(state,{type:'place',id:'pottery',tile:'2'}),/Invalid tile/);
  state=pick(state,'civic','laws');
  assert.throws(()=>applyAction(state,{type:'place',id:'laws',tile:state.tiles.pottery}),/already stands/);
  // A granary must stay beside the settlement, so an explored hex two steps out is refused.
  const far=hexes.findIndex((h,i)=>h.dist===2&&h.dist<=revealRadius(state)&&land.tiles[i]!=='coast');
  assert.throws(()=>applyAction(state,{type:'place',id:'pottery',tile:far}),/does not suit/);
  const free=hexes.findIndex((h,i)=>h.dist===1&&!Object.values(state.tiles).includes(i)&&fits(land,'pottery',i));
  const moved=applyAction(state,{type:'place',id:'pottery',tile:free});
  assert.equal(moved.tiles.pottery,free);
  assert.equal(state.tiles.pottery===free,false,'previous state is not mutated');
});

test('removing a card or changing a decision frees its hex; a new place clears the layout',()=>{
  let state=applyAction(start('E'),{type:'event',id:'origin',choice:'steward'});
  state=pick(state,'tech','preservation');
  state=pick(state,'tech','pottery');
  assert(Number.isInteger(state.tiles.preservation));
  const unpicked=pick(state,'tech','pottery');
  assert(!('pottery' in unpicked.tiles));
  const changed=applyAction(state,{type:'event',id:'origin',choice:'explore'});
  assert(!('preservation' in changed.tiles),'the gated card and its building are gone');
  assert('pottery' in changed.tiles);
  const moved=applyAction(state,{type:'map',point:'K'});
  assert.deepEqual(Object.keys(moved.tiles).sort(),['pottery','preservation']);
  assert(Object.entries(moved.tiles).every(([id,i])=>fits(generateLand('K'),id,i)),'buildings are laid out again on the new land');
});

test('exploring outward and travel technology reveal the far edge',()=>{
  const home=start('B');
  assert.equal(revealRadius(home),1);
  let steward=applyAction(home,{type:'event',id:'origin',choice:'steward'});
  assert.equal(revealRadius(steward),2);
  let explore=applyAction(home,{type:'event',id:'origin',choice:'explore'});
  for(const id of ['pottery','writing','astrology'])explore=pick(explore,'tech',id);
  assert.equal(revealRadius(explore),3);
  steward=pick(steward,'tech','pottery');
  steward=pick(steward,'tech','sailing');
  assert.equal(revealRadius(steward),3,'sailing reaches the far coast');
  assert(Number.isInteger(steward.tiles.sailing),'the harbor finds the sea');
  assert.equal(generateLand('B').tiles[steward.tiles.sailing],'coast');
});

test('a team saved before the map existed gets a layout without losing work',()=>{
  const old={...start('G'),tech:['pottery','husbandry'],civic:['laws']};
  delete old.tiles;
  assert.deepEqual(Object.keys(settleTiles(old)).sort(),['husbandry','laws','pottery']);
  const next=applyAction(old,{type:'field',key:'techAnswer',value:'Animals and storage.'});
  assert.deepEqual(next.tech,['pottery','husbandry']);
  assert.equal(Object.keys(next.tiles).length,3);
});
