import { hexes, neighbours, center, generateLand, isRevealed, improvements, hazardOf } from './land.js';
import { civilizationRoutes, routeEligibility } from './routes.js';

export const FOOD = ['husbandry','irrigation','archery'];
export const STORAGE = ['pottery','preservation','mutual_aid'];
export const VENUES = ['laws','craft','workforce','philosophy','games','history','poetry','mysticism','theology','resource_council'];
// What a building does on the map: feeds people, protects food, serves neighbors, or none of these.
export const buildingRole = id => FOOD.includes(id)?'food':STORAGE.includes(id)?'storage':VENUES.includes(id)?'service':'facility';
const water = new Set(['river','wetland','coast']);
export const edgeKey = (a,b) => a<b?`${a}:${b}`:`${b}:${a}`;
const dock = (state,i) => ['sailing','shipbuilding'].some(id=>state.tiles?.[id]===i);
const landTile = (state,i) => !!hexes[i] && isRevealed(state,i) && generateLand(state.mapPoint)?.tiles[i]!=='coast';

export function trailError(state,path,removing=false) {
  if(!Array.isArray(path)||path.length<2||path.length>hexes.length||new Set(path).size!==path.length)return 'Choose a continuous trail of at least two different hexes';
  if(path.some(i=>!Number.isInteger(i)||!hexes[i]))return 'Trails must stay on explored hexes';
  if(removing&&path.slice(1).every((b,n)=>normalizeTrails(state).some(([a,c])=>edgeKey(a,c)===edgeKey(path[n],b))))return '';
  for(let n=0;n<path.length;n++) {
    const i=path[n];
    if(!Number.isInteger(i)||!hexes[i]||!isRevealed(state,i))return 'Trails must stay on explored hexes';
    if(!landTile(state,i)&&!(n===path.length-1&&dock(state,i)&&landTile(state,path[n-1])))return 'A walking trail cannot cross the sea; end at a dock beside land';
    if(n&&!neighbours[path[n-1]].includes(i))return 'Each trail segment must join neighboring hexes';
  }
  return '';
}
export function normalizeTrails(state) {
  const result=new Map();
  const land=generateLand(state.mapPoint);
  for(const edge of state.trails||[]) {
    if(!Array.isArray(edge)||edge.length!==2)continue;
    const [a,b]=edge;
    // A confirmed shore segment survives relocation of its dock. It becomes dormant
    // until a dock returns; knowledge changes must not erase established paths.
    if(Number.isInteger(a)&&Number.isInteger(b)&&hexes[a]&&hexes[b]&&neighbours[a].includes(b)&&land&&!(land.tiles[a]==='coast'&&land.tiles[b]==='coast'))result.set(edgeKey(a,b),[Math.min(a,b),Math.max(a,b)]);
  }
  return [...result.values()].sort((a,b)=>a[0]-b[0]||a[1]-b[1]);
}
export function suggestTrail(state,target) {
  if(!hexes[target]||!isRevealed(state,target))return null;
  const queue=[[center]],seen=new Set([center]);
  while(queue.length) {
    const path=queue.shift(),last=path.at(-1);
    if(last===target)return path.length>1?path:null;
    for(const i of neighbours[last])if(!seen.has(i)&&(landTile(state,i)||(i===target&&dock(state,i)&&landTile(state,last)))) {
      seen.add(i);queue.push([...path,i]);
    }
  }
  return null;
}
export function connectedTiles(state) {
  const graph=new Map(),join=(a,b)=>{if(!graph.has(a))graph.set(a,new Set());if(!graph.has(b))graph.set(b,new Set());graph.get(a).add(b);graph.get(b).add(a);};
  const occupied=new Set([center,...Object.values(state.tiles||{})]);
  for(const a of occupied)for(const b of neighbours[a]||[])if(occupied.has(b)&&((landTile(state,a)&&landTile(state,b))||(landTile(state,a)&&dock(state,b))||(dock(state,a)&&landTile(state,b))))join(a,b);
  for(const [a,b] of normalizeTrails(state))if(!trailError(state,[a,b])||!trailError(state,[b,a]))join(a,b);
  const reached=new Set([center]),queue=[center];
  while(queue.length)for(const i of graph.get(queue.shift())||[])if(!reached.has(i)){reached.add(i);queue.push(i);}
  return reached;
}
export function assessLayout(state) {
  const land=generateLand(state.mapPoint),reachable=connectedTiles(state),buildings={};
  if(!land)return {buildings,reachable:[],food:{status:'missing',sources:[],stores:[]},season:{hazard:'',status:'noSource',atRisk:[]},services:{venues:[],covered:[]},routes:{}};
  const hazard=hazardOf(state.mapPoint);
  for(const [id,tile] of Object.entries(state.tiles||{})) {
    if(!improvements[id]||!hexes[tile])continue;
    const connected=reachable.has(tile),coverage=connected&&(STORAGE.includes(id)||VENUES.includes(id))?[tile,...neighbours[tile]]:[];
    const around=[land.tiles[tile],...neighbours[tile].map(i=>land.tiles[i])];
    const exposed=FOOD.includes(id)&&(hazard==='flood'?['river','wetland'].includes(land.tiles[tile]):hazard==='drought'?!around.some(t=>['river','wetland'].includes(t)):hazard==='storm'?around.includes('coast'):hazard==='frost'?['mountain','ice'].includes(land.tiles[tile])||around.includes('ice'):false);
    buildings[id]={tile,connected,coverage,exposed,buffered:false,served:false,role:buildingRole(id)};
  }
  const sources=FOOD.filter(id=>buildings[id]?.connected),stores=STORAGE.filter(id=>buildings[id]?.connected),venues=VENUES.filter(id=>buildings[id]?.connected);
  const covered=new Set(venues.flatMap(id=>buildings[id].coverage));
  for(const entry of Object.values(buildings)){entry.buffered=stores.some(id=>buildings[id].coverage.includes(entry.tile));entry.served=covered.has(entry.tile);}
  const atRisk=sources.filter(id=>buildings[id].exposed&&!buildings[id].buffered);
  const routes={};
  for(const route of civilizationRoutes) {
    const missing=[];
    if(!routeEligibility(state,route).unlocked)missing.push('discoveries');
    if(route.id!=='local') {
      if(!route.tech.some(id=>buildings[id]?.connected))missing.push('technologySite');
      if(!route.civic.some(id=>buildings[id]?.connected))missing.push('civicSite');
      if(route.id==='water') {
        const start=buildings.sailing?.connected?buildings.sailing.tile:null,seen=new Set(),queue=start===null?[]:[start];
        while(queue.length){const i=queue.shift();if(seen.has(i)||!isRevealed(state,i)||!water.has(land.tiles[i]))continue;seen.add(i);queue.push(...neighbours[i]);}
        if(![...seen].some(i=>hexes[i].dist===3))missing.push('waterEdge');
      } else if(!normalizeTrails(state).some(([a,b])=>(!trailError(state,[a,b])||!trailError(state,[b,a]))&&[a,b].some(i=>reachable.has(i)&&hexes[i].dist===3&&landTile(state,i))))missing.push('landEdge');
    }
    routes[route.id]={operational:missing.length===0,missing};
  }
  return {buildings,reachable:[...reachable].sort((a,b)=>a-b),food:{status:sources.length?'local':stores.length?'reserves':'missing',sources,stores},season:{hazard,status:!sources.length?'noSource':!atRisk.length?'steady':atRisk.length===sources.length?'fragile':'mixed',atRisk},services:{venues,covered:[...covered].sort((a,b)=>a-b)},routes};
}

export function layoutChallenge(state) {
  const assessment=assessLayout(state);
  const isolated=Object.keys(assessment.buildings).find(id=>!assessment.buildings[id].connected);
  if(isolated)return {kind:'connect',id:isolated,tile:assessment.buildings[isolated].tile};
  if(assessment.season.atRisk.length&&assessment.food.stores.length)return {kind:'protect',id:assessment.food.stores[0],target:assessment.season.atRisk[0]};
  const remote=Object.keys(assessment.buildings).find(id=>!assessment.buildings[id].served&&assessment.services.venues.length);
  if(remote)return {kind:'serve',id:assessment.services.venues[0],target:remote};
  return {kind:'review'};
}
