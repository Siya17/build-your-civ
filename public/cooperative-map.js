import { adjacentTiles } from '../shared/strategy/hex.js';
import { label, safe } from './cooperative-copy.js';

const SIZE = 43, WIDTH = Math.sqrt(3) * SIZE;
export const position = tile => [WIDTH * (tile.q + tile.r / 2), SIZE * 1.5 * tile.r];
const polygon = size => Array.from({length:6},(_,i)=>{const a=(60*i-30)*Math.PI/180;return `${(size*Math.cos(a)).toFixed(1)},${(size*Math.sin(a)).toFixed(1)}`}).join(' ');
const HEX=polygon(SIZE-0.8), INNER=polygon(SIZE-5);
const tree = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse class="tree-shadow" cx="3" cy="9" rx="10" ry="4"/><path class="tree-trunk" d="M-1 3v9h3V3z"/><path class="tree-back" d="M0-20-12 3h24z"/><path class="tree-front" d="M0-20-7-4H7z"/><path class="tree-light" d="M0-20-7-4H0z"/></g>`;
const hill = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="hill-shadow" d="M-20 12Q-8-19 5-7l17 19z"/><path class="hill-top" d="M-20 12Q-8-19 5-7l6 19z"/><path class="hill-light" d="M-20 12Q-8-19-1-10L-7 12z"/></g>`;
const grass = '<path class="grass-mark" d="M-19 7l2-4 2 4m4-10 2-4 2 4m12 13 2-4 2 4M4 1l2-4 2 4"/>';
const fog = '<path class="fog-mark" d="M-22 7q5-9 13-4 5-10 15-5 8-5 15 5M-16 15q7-5 13 0 7-5 14 0"/>';
function terrainArt(tile) {
  if(tile.fogged)return fog;
  if(tile.terrain==='forest')return tree(-16,2,.8)+tree(7,-5,1.1)+tree(17,14,.65);
  if(tile.terrain==='hills')return hill(-10,0,.8)+hill(12,6,.7);
  if(tile.terrain==='wetland')return '<path class="wetland-mark" d="M-23 9q5-5 11 0t11 0 11 0 11 0M-17-1v-10m4 13V-7M10 1v-11m4 12V-6"/>';
  if(tile.terrain==='river')return grass+'<path class="water-mark" d="M-21 6q7-4 14 0t14 0"/>';
  return grass;
}

const hut = (x,y,s=1) => `<g transform="translate(${x} ${y}) scale(${s})"><path class="building-side" d="M0-4l12 6v14L0 10z"/><path class="building-wall" d="M-13 2 0-4v14l-13 6z"/><path class="building-roof" d="M-17 3-4-12l19 10-3 4L0-4-13 5z"/><path class="building-door" d="M-8 8l4-2v7l-4 2z"/></g>`;
function buildingArt(tile,work) {
  if(tile.id===work.site)return `<g class="sanctuary stage-${work.stage} ${work.complete?'finished':''}"><ellipse class="building-shadow" rx="26" ry="11" cy="16"/><path class="sanctuary-base" d="M-27 12 0-2l27 14v7L0 32l-27-13z"/><path class="sanctuary-wall" d="M-21 9V-9L0-20 21-9V9L0 20z"/><path class="sanctuary-roof" d="M-26-9 0-27l26 18L0 5z"/><path class="sanctuary-door" d="M-6 5V-5l6-3 6 3V5L0 9z"/><path class="sanctuary-spire" d="M0-27v-12l13 5-13 5"/></g>`;
  if(!tile.structure)return '';
  const faction=tile.owner==='highland'?'highland':'river';
  let art=hut(0,0);
  if(tile.structure==='settlement')art=hut(-13,1,.8)+hut(10,-5,1.1)+hut(5,14,.7)+`<path class="city-flag ${faction}" d="M-3-18v-22l18 5-18 5"/>`;
  if(tile.structure==='farm')art='<path class="farm-row" d="M-26 5-5-6 24 9M-26 11-5 0 24 15M-26 17-5 6 24 21"/>'+hut(8,-3,.65);
  if(tile.structure==='mine')art=hill(0,-3,1.1)+'<path class="mine-door" d="M-6 10V0q7-10 14 0v10z"/><path class="mine-track" d="M-4 9-15 23M5 10l-10 18m-7-7 10 3"/>';
  if(tile.structure==='archive')art='<path class="building-wall" d="M-20-4 0-14 20-4v21L0 27l-20-10z"/><path class="building-roof" d="M-25-4 0-21 25-4 0 10z"/><path class="archive-pillars" d="M-14 4v12m7-8v12m14-12v12m7-16v12"/>';
  if(tile.structure==='shrine')art=tree(-12,-4,.8)+tree(15,-3,.9)+'<path class="shrine-stone" d="M-6 19V0L0-10 7 0v19L0 23z"/>';
  if(tile.structure==='workshop')art=hut(-7,3,1)+'<path class="chimney" d="M8-4v-21l7-3v28z"/><path class="smoke" d="M11-32q-6-4 0-9t0-9"/>';
  return `<g class="map-building ${faction}"><ellipse class="building-shadow" rx="26" ry="9" cy="19"/>${art}</g>`;
}

export function mapMarkup(state, lang, {selected=null, valid=new Set(), path=[], bottlenecks=[], miniature=false}={}) {
  const tiles=Object.values(state.board), seen=tile=>tile&&!tile.fogged;
  const at=id=>position(state.board[id]).map(v=>v.toFixed(1));
  const cells=tiles.map(tile=>{
    const [x,y]=position(tile),cls=tile.fogged?'fog':tile.terrain;
    const target=valid.has(tile.id);
    const name=tile.fogged?label(lang,'unexplored'):label(lang,tile.terrain==='river'?'riverTerrain':tile.terrain);
    return `<g class="map-cell terrain-${cls} ${tile.owner?'owner-'+tile.owner:''} ${selected===tile.id?'selected':''} ${target?'valid':''} ${tile.disabledUntil>=state.clock.round?'flooded':''}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" ${miniature?'':`data-map-tile="${safe(tile.id)}" role="button" tabindex="${selected===tile.id?0:-1}" aria-label="${safe(name+' · '+tile.id)}" aria-pressed="${selected===tile.id}"`}><polygon class="tile-depth" points="${HEX}" transform="translate(0 6)"/><polygon class="tile-top" points="${HEX}"/><polygon class="tile-edge" points="${INNER}"/>${terrainArt(tile)}${tile.node?.kind==='natural-wonder'?'<path class="wonder-mark" d="M-14 12-5-11 0-5 7-20 19 12z"/>':''}${target?'<circle class="placement-dot" r="6"/>':''}</g>`;
  }).join('');
  const riverTiles=tiles.filter(tile=>seen(tile)&&tile.terrain==='river').sort((a,b)=>a.r-b.r);
  const water=riverTiles.map(tile=>{
    const [x,y]=position(tile);
    return `<path d="M${(x-19).toFixed(1)} ${(y-34).toFixed(1)} Q${(x+11).toFixed(1)} ${(y-7).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)} T${(x+19).toFixed(1)} ${(y+34).toFixed(1)}"/>`;
  }).join('');
  const routes=[];
  for(const tile of tiles){
    if(!seen(tile)||!(tile.infrastructure||tile.structure==='settlement'))continue;
    for(const other of adjacentTiles(state.board,tile.id)){
      if(tile.id>=other.id||!seen(other)||!(other.infrastructure||other.structure==='settlement'))continue;
      routes.push(`<path d="M${at(tile.id).join(' ')}L${at(other.id).join(' ')}"/>`);
    }
  }
  const buildings=tiles.filter(seen).map(tile=>{
    const [x,y]=position(tile),art=buildingArt(tile,state.work);
    const infrastructure=tile.infrastructure==='bridge'?'<path class="bridge-planks" d="M-18 1 18 1M-18 8 18 8M-15-5v18m10-18v18m10-18v18m10-18v18"/>':'';
    return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${infrastructure}${art}</g>`;
  }).join('');
  const labels=Object.values(state.players).map(player=>{
    const [x,y]=position(state.board[player.settlement]);
    return `<g class="settlement-label ${player.id}" transform="translate(${x.toFixed(1)} ${(y+50).toFixed(1)})"><rect x="-72" y="-12" width="144" height="25" rx="3"/><text text-anchor="middle" y="5">${safe(label(lang,player.civilization))}</text></g>`;
  }).join('');
  const workTile=state.board[state.work.site],workLabel=seen(workTile)?`<g class="work-label" transform="translate(${position(workTile)[0].toFixed(1)} ${(position(workTile)[1]-60).toFixed(1)})"><text text-anchor="middle">${safe(label(lang,'work'))}</text></g>`:'';
  const travel=path.length?`<path class="delivery-path" d="M${path.map(id=>at(id).join(' ')).join('L')}"/>`:'';
  const blocked=bottlenecks.map(({from,to})=>`<path class="delivery-bottleneck" d="M${at(from).join(' ')}L${at(to).join(' ')}"/>`).join('');
  return `<svg class="world-svg ${miniature?'miniature':''}" ${miniature?'':'id="world-map" tabindex="-1"'} viewBox="-390 -327 780 654" role="group" aria-label="${safe(label(lang,'era'))}"><defs><radialGradient id="world-glow"><stop offset="0" stop-color="#679183" stop-opacity=".16"/><stop offset="1" stop-color="#102b33" stop-opacity="0"/></radialGradient></defs><ellipse class="map-glow" fill="url(#world-glow)" rx="380" ry="290" cy="15"/><g class="map-terrain">${cells}</g><g class="map-water">${water}</g><g class="map-roads">${routes.join('')}</g><g class="map-art" aria-hidden="true">${buildings}</g>${travel}${blocked}<g class="map-labels" aria-hidden="true">${labels}${workLabel}</g><g class="compass" transform="translate(316 -254)" aria-hidden="true"><circle r="26"/><path d="M0-19 5 0 0 19-5 0zM-19 0 0-5 19 0 0 5z"/><text y="-35" text-anchor="middle">N</text></g></svg>`;
}
