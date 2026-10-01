import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, applyAction, submissionGaps } from '../shared/game.js';
import { hexes, neighbours, center, generateLand, fits, settleTiles, fitTiles } from '../shared/land.js';
import { assessLayout, suggestTrail, trailError, layoutChallenge, normalizeTrails, edgeKey } from '../shared/layout.js';
const base=(point='E')=>({...initialState(),mapPoint:point,avatar:point,stage:4,tech:['pottery','irrigation','sailing'],civic:['laws'],events:{origin:'steward',encounter:'share'},plannedBuildings:['pottery','irrigation','sailing','laws']});
const link=(state,tile)=>applyAction(state,{type:'trail',mode:'add',path:suggestTrail(state,tile)});

test('explicit learned plans stay unbuilt after unrelated actions and legacy choices still auto-place',()=>{
 const start={...initialState(),mapPoint:'E',avatar:'E'};
 const plan=applyAction(start,{type:'pick',tree:'tech',id:'mining',tile:null});
 assert.deepEqual(plan.plannedBuildings,['mining']);assert.equal(plan.tiles.mining,undefined);
 const next=applyAction(plan,{type:'field',key:'placeAnswer',value:'Flat land.'});assert.equal(next.tiles.mining,undefined);
 const pottery=applyAction(start,{type:'pick',tree:'tech',id:'pottery'});assert(Number.isInteger(pottery.tiles.pottery));
 assert.deepEqual(start.tech,[]);assert.throws(()=>applyAction(start,{type:'pick',tree:'tech',id:'pottery',tile:center}),/settlement/);
});

test('explicit selection is idempotent and returning a building to a plan preserves dependent knowledge',()=>{
 const start={...initialState(),mapPoint:'E',avatar:'E'};
 let s=applyAction(start,{type:'pick',tree:'tech',id:'pottery'});s=applyAction(s,{type:'pick',tree:'tech',id:'writing',tile:null});
 const tile=s.tiles.pottery,plan=applyAction(s,{type:'pick',tree:'tech',id:'pottery',tile:null});
 assert.deepEqual(plan.tech,['pottery','writing']);assert.equal(plan.tiles.pottery,undefined);assert(plan.plannedBuildings.includes('pottery'));
 const placed=applyAction(plan,{type:'pick',tree:'tech',id:'pottery',tile});
 assert.deepEqual(placed.tech,plan.tech);assert.equal(placed.tiles.pottery,tile);assert(!placed.plannedBuildings.includes('pottery'));
 assert.deepEqual(applyAction(placed,{type:'pick',tree:'tech',id:'pottery'}).tech,[],'legacy toggles still remove dependent choices');
});
test('storage movement changes food protection and hard-season outcome',()=>{
 let s=base(),land=generateLand(s.mapPoint);
 const food=hexes.findIndex((h,i)=>h.dist===2&&land.tiles[i]==='river');
 const near=neighbours[food].find(i=>fits(land,'pottery',i));
 const away=hexes.findIndex((h,i)=>fits(land,'pottery',i)&&!neighbours[food].includes(i));
 assert(near!==undefined&&away>=0);
 s={...s,tiles:{irrigation:food,pottery:near},plannedBuildings:['sailing','laws']};s=link(s,food);
 assert.equal(assessLayout(s).season.status,'steady');assert(assessLayout(s).buildings.irrigation.buffered);
 const moved=applyAction(s,{type:'place',id:'pottery',tile:away});
 assert.equal(assessLayout(moved).season.status,'fragile');assert.equal(assessLayout(moved).buildings.irrigation.buffered,false);
 assert.equal(s.tiles.pottery,near);
});
test('confirmed trails activate isolated buildings and removal deactivates them atomically',()=>{
 let s=base();const tile=fitTiles(s,'irrigation').find(i=>hexes[i].dist===3);
 s={...s,tiles:{irrigation:tile}};assert.equal(assessLayout(s).food.status,'missing');
 assert.equal(layoutChallenge(s).kind,'connect');
 const path=suggestTrail(s,tile);s=applyAction(s,{type:'trail',path,mode:'add'});
 assert.equal(assessLayout(s).food.status,'local');
 const removed=applyAction(s,{type:'trail',path,mode:'remove'});assert.equal(assessLayout(removed).food.status,'missing');
 assert(s.trails.length);assert.equal(removed.trails.length,0);
 assert.throws(()=>applyAction(s,{type:'trail',path:[center,tile],mode:'add'}),/neighbor/);
 assert.throws(()=>applyAction(s,{type:'trail',path:[center,center],mode:'add'}),/different/);
});
test('moving community venues changes which buildings receive service',()=>{
 const land=generateLand('E'),s=base();const food=hexes.findIndex((h,i)=>h.dist===2&&land.tiles[i]==='river');
 const near=neighbours[food].find(i=>fits(land,'laws',i));const away=hexes.findIndex((h,i)=>fits(land,'laws',i)&&!neighbours[food].includes(i));
 let a={...s,tiles:{irrigation:food,laws:near}};a=link(a,food);
 assert(assessLayout(a).buildings.irrigation.served);
 const b=applyAction(a,{type:'place',id:'laws',tile:away});assert.equal(assessLayout(b).buildings.irrigation.served,false);
});
test('walking paths reject sea crossings but can end at a shore dock',()=>{
 let s=base('B'),land=generateLand('B');const sea=hexes.findIndex((_,i)=>land.tiles[i]==='coast'&&neighbours[i].some(n=>land.tiles[n]!=='coast'));
 s={...s,tiles:{sailing:sea}};const path=suggestTrail(s,sea);assert(path&&path.length>1);assert.equal(trailError(s,path),'');
 const further=neighbours[sea].find(i=>land.tiles[i]==='coast'&&!path.includes(i));assert(further!==undefined);
 assert(trailError(s,[...path,further]));assert.equal(suggestTrail({...s,tiles:{}},sea),null);
});

test('confirmed shore paths survive dock relocation and dormant segments can be removed in either direction',()=>{
 let s=base('B'),land=generateLand('B');
 const sites=fitTiles(s,'sailing').filter(i=>land.tiles[i]==='coast'&&suggestTrail({...s,tiles:{sailing:i}},i));
 const first=sites[0],second=sites.find(i=>i!==first);assert(second!==undefined);
 s={...s,tiles:{sailing:first}};s=link(s,first);const saved=structuredClone(s.trails);
 const moved=applyAction(s,{type:'place',id:'sailing',tile:second});assert.deepEqual(moved.trails,saved);
 const edge=saved.find(([a,b])=>a===first||b===first);assert(edge);
 const removed=applyAction(moved,{type:'trail',mode:'remove',path:[...edge].reverse()});
 assert(!removed.trails.some(([a,b])=>edgeKey(a,b)===edgeKey(...edge)));assert.deepEqual(normalizeTrails(moved),saved);
});

test('food exposure follows all four seasonal hazards on actual terrain',()=>{
 for(const [point,hazard] of [['E','flood'],['G','drought'],['B','storm'],['K','frost']]){
  const s={...base(point),tech:['pottery','irrigation','husbandry','archery','sailing'],plannedBuildings:['pottery','irrigation','husbandry','archery','sailing','laws']},land=generateLand(point);
  let exposed=0;
  for(const id of ['husbandry','archery','irrigation'])for(const tile of fitTiles(s,id)){
   const a=assessLayout({...s,tiles:{[id]:tile}}),around=[land.tiles[tile],...neighbours[tile].map(i=>land.tiles[i])];
   const expected=hazard==='flood'?['river','wetland'].includes(land.tiles[tile]):hazard==='drought'?!around.some(t=>['river','wetland'].includes(t)):hazard==='storm'?around.includes('coast'):['mountain','ice'].includes(land.tiles[tile])||around.includes('ice');
   assert.equal(a.season.hazard,hazard);assert.equal(a.buildings[id].exposed,expected,`${point}:${id}:${tile}`);if(expected)exposed++;
  }
  assert(exposed>0,point);
 }
});
test('route operation depends on actual connections without changing route selection',()=>{
 let s={...base('F'),tech:['mining','wheel'],civic:['laws','trade'],route:'land',plannedBuildings:['mining','wheel','laws','trade']};
 const wheel=fitTiles(s,'wheel').find(i=>hexes[i].dist===1),trade=fitTiles(s,'trade').find(i=>hexes[i].dist===3&&i!==wheel);
 s={...s,tiles:{wheel,trade}};assert.equal(assessLayout(s).routes.land.operational,false);
 s=link(s,trade);assert.equal(assessLayout(s).routes.land.operational,true);
 const path=suggestTrail(s,trade),b=applyAction(s,{type:'trail',path,mode:'remove'});
 assert.equal(b.route,'land');assert.equal(assessLayout(b).routes.land.operational,false);
});

test('water routes need a connected harbor and revealed water to the edge',()=>{
 let s={...base('B'),tech:['pottery','sailing'],civic:['laws','trade'],route:'water',plannedBuildings:['pottery','sailing','laws','trade']},land=generateLand('B');
 const harbor=fitTiles(s,'sailing').find(i=>land.tiles[i]==='coast'&&neighbours[i].some(n=>land.tiles[n]!=='coast'));
 const trade=fitTiles(s,'trade').find(i=>i!==harbor);
 s={...s,tiles:{sailing:harbor,trade}};assert.equal(assessLayout(s).routes.water.operational,false);
 s=link(link(s,harbor),trade);assert.equal(assessLayout(s).routes.water.operational,true);
 const unbuilt={...s,tiles:{trade}};assert.equal(assessLayout(unbuilt).routes.water.operational,false);assert.equal(unbuilt.route,'water');
});

test('automatic building connections still need a confirmed outward trail for a land route',()=>{
 let s={...base('F'),tech:['mining','wheel'],civic:['laws','trade'],route:'land',plannedBuildings:['mining','wheel','laws','trade']},land=generateLand('F');
 const paths=fitTiles(s,'trade').filter(i=>hexes[i].dist===3).map(i=>suggestTrail(s,i));
 const path=paths.find(p=>p?.length===4&&fits(land,'laws',p[1])&&fits(land,'wheel',p[2]));assert(path);
 s={...s,tiles:{laws:path[1],wheel:path[2],trade:path[3]}};
 assert(assessLayout(s).buildings.trade.connected);assert(assessLayout(s).routes.land.missing.includes('landEdge'));
 assert.equal(assessLayout(link(s,path[3])).routes.land.operational,true);
});
test('all A–K knowledge paths can submit with unbuilt or crowded plans and legacy layouts survive',()=>{
 for(const point of 'ABCDEFGHIJK'){
  let s={...initialState(),mapPoint:point,avatar:point,events:{origin:'explore',encounter:'exchange'}};
  s=applyAction(s,{type:'pick',tree:'tech',id:'mining',tile:null});s=applyAction(s,{type:'pick',tree:'civic',id:'laws',tile:null});
  for(const key of ['placeAnswer','techAnswer','societyAnswer','beliefAnswer','contactAnswer'])s=applyAction(s,{type:'field',key,value:'We accept these tradeoffs.'});
  assert.deepEqual(submissionGaps(s),[],point);assert.deepEqual(settleTiles(s),{},point);
  const old={...s,plannedBuildings:undefined,tiles:undefined};const legacy=settleTiles(old);assert(Number.isInteger(legacy.laws));
  assert.deepEqual(assessLayout(s),assessLayout(s));
 }
});
