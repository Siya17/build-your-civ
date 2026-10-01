// Draws a team's homeland as an SVG hex map. Everything is markup with SVG attributes and
// CSS classes: the page's CSP forbids inline styles.
import { hexes, center, generateLand, improvements, terrains, settlementSize, fits, isRevealed, route, neighbourDirection, hazardOf, DIRECTIONS } from '../shared/land.js';
import { iconPath } from './rpg.js';
import { routeById } from '../shared/routes.js';
import { assessLayout, normalizeTrails } from '../shared/layout.js';

const safe=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const S=30,W=Math.sqrt(3)*S;
const at=i=>[+(W*hexes[i].x).toFixed(1),+(1.5*S*hexes[i].r).toFixed(1)];
const corners=size=>[0,1,2,3,4,5].map(k=>{const a=Math.PI/180*(60*k-30);return `${(size*Math.cos(a)).toFixed(1)},${(size*Math.sin(a)).toFixed(1)}`}).join(' ');
const HEX=corners(S-.6),INNER=corners(S-5);
const move=i=>{const [x,y]=at(i);return `translate(${x} ${y})`};

// Small hand-drawn marks per terrain, centred on the hex.
const glyphs={
  plains:'<path class="g-line" d="M-13 4h9M1 -3h11M-6 10h11"/>',
  grass:'<path class="g-line" d="M-11 4l2-7 2 7M3 0l2-7 2 7M-4 11l2-6 2 6"/>',
  forest:'<path class="g-tree" d="M-12 7l5-12 5 12zM-1 3l5-13 5 13zM4 13l4-10 4 10z"/>',
  hills:'<path class="g-line" d="M-15 7q7-13 14 0M-2 9q7-11 15 0"/>',
  mountain:'<path class="g-peak" d="M-15 10L-3-11 3-2 7-7 15 10z"/><path class="g-snow" d="M-3-11-6.5-5-1-5z"/>',
  desert:'<path class="g-line" d="M-15 2q8-7 15-1t14-1M-11 10q7-5 13-1t10-1"/>',
  river:'<path class="g-line" d="M-12-8h7M6 9h7"/>',
  coast:'<path class="g-wave" d="M-15-4q3.5-4 7 0t7 0 7 0M-8 6q3.5-4 7 0t7 0 7 0"/>',
  ice:'<path class="g-line" d="M-12-2l7 3 5-4 8 5M-4 9l6-3 5 2"/>',
  wetland:'<path class="g-wave" d="M-12 8q5-3 10 0t10 0"/><path class="g-line" d="M-6 4v-9M-3 5v-7M6 3v-8M9 4v-5"/>'
};
const fogGlyph='<path class="g-fog" d="M-14 3q4-6 9-2 3-6 9-2 6-3 8 3M-9 10q4-3 8 0 4-3 8 0"/>';
const town=[
  '<path class="g-hut" d="M-14 8v-6l5-5 5 5v6zM-3 4v-7l6-6 6 6v7zM6 11v-5l4-4 4 4v5z"/>',
  '<circle class="g-wall" r="20"/><path class="g-hut" d="M-15 6v-6l5-5 5 5v6zM-4 1v-7l6-6 6 6v7zM6 8v-6l5-5 5 5v6zM-9 15v-5l4-4 4 4v5zM2 15v-4l3-3 3 3v4z"/>',
  '<circle class="g-wall" r="22"/><path class="g-hut" d="M-16 9v-6l5-5 5 5v6zM6 10v-6l5-5 5 5v6zM-9 17v-5l4-4 4 4v5zM2 17v-4l3-3 3 3v4z"/><path class="g-tower" d="M-4 4v-20h8v20zM-8 4v-11h4v11zM4 4v-13h5v13z"/><path class="g-flag" d="M0-16v-7l6 2-6 2"/>'
];

// Water flows through the revealed stretches of the river only, so fog never leaks it.
function riverPaths(land,seen){
  const river=land.river;
  if(river.length<2)return '';
  const [ax,ay]=at(river[0]),[bx,by]=at(river[1]),dx=(bx-ax)/2,dy=(by-ay)/2;
  const runs=[];let run=[];
  for(const i of river){if(seen(i))run.push(i);else if(run.length){runs.push(run);run=[]}}
  if(run.length)runs.push(run);
  return runs.map(tiles=>{
    const pts=tiles.map(at);
    pts.unshift([pts[0][0]-dx,pts[0][1]-dy]);pts.push([pts.at(-1)[0]+dx,pts.at(-1)[1]+dy]);
    // Alternate a small sideways bend so the stream meanders instead of ruling a line.
    let d=`M${pts[0][0]} ${pts[0][1]}`;
    for(let k=1;k<pts.length;k++){
      const [px,py]=pts[k-1],[cx,cy]=pts[k],bend=(k%2?1:-1)*5;
      const len=Math.hypot(cx-px,cy-py)||1;
      d+=` Q${((px+cx)/2-bend*(cy-py)/len).toFixed(1)} ${((py+cy)/2+bend*(cx-px)/len).toFixed(1)} ${cx.toFixed(1)} ${cy.toFixed(1)}`;
    }
    return `<path class="hx-river" d="${d}"/><path class="hx-river-shine" d="${d}"/>`;
  }).join('');
}

const occupantOf=(state,i)=>Object.keys(state.tiles||{}).find(id=>state.tiles[id]===i);

// Story decisions drawn onto the land: the hard season before the first decision, then the
// stores or the mapped route, then the neighbouring camp beyond the edge and whatever the
// team chose to build between them.
const axial=(q,r)=>[+(W*(q+r/2)).toFixed(1),+(1.5*S*r).toFixed(1)];
const hazardIcons={
  flood:'M16 4c-3 6-8 10-8 15a8 8 0 0 0 16 0c0-5-5-9-8-15z',
  drought:'M16 10a6 6 0 1 0 0 12 6 6 0 0 0 0-12M16 3v4m0 18v4M3 16h4m18 0h4M7 7l3 3m12 12 3 3M7 25l3-3M22 10l3-3',
  storm:'M9 19h14a5 5 0 0 0-1.5-9.8A7 7 0 0 0 8 11a4 4 0 0 0 1 8zM17 19l-3 5h5l-3 5',
  frost:'M16 3v26M5 9.5l22 13M5 22.5l22-13M12 5l4 4 4-4M12 27l4-4 4 4'
};
const hazardLand={flood:['river','wetland','plains','grass'],drought:['grass','plains','desert'],storm:['coast','hills','forest'],frost:['ice','hills','grass']};
const line=points=>'M'+points.map(p=>p.join(' ')).join(' L');
function eventLayer(state,land,L){
  const origin=state.events?.origin,encounter=state.events?.encounter,parts=[],path=route(state.mapPoint);
  if(!origin){
    const kind=hazardOf(state.mapPoint),prefer=hazardLand[kind]||[];
    const ring=hexes.map((_,i)=>i).filter(i=>hexes[i].dist===1).sort((a,b)=>(prefer.includes(land.tiles[b])-prefer.includes(land.tiles[a]))||a-b).slice(0,3);
    for(const i of ring)parts.push(`<g class="ev-hazard hz-${kind}" transform="${move(i)}"><polygon class="hz-tint" points="${INNER}"/><path class="hz-icon" transform="translate(-9 -9) scale(.56)" d="${hazardIcons[kind]}"/></g>`);
  }
  if(origin==='steward')parts.push(`<circle class="ev-stores" r="30" transform="${move(center)}"/>`);
  if(origin==='explore'&&path)parts.push(`<path class="ev-route" d="${line([at(center),...path.tiles.map(at)])}"/>`);
  if(origin&&(state.stage>=3||encounter)){
    const [dq,dr]=DIRECTIONS[neighbourDirection(state)],camp=axial(dq*3.9,dr*3.9),road=line([at(center),camp]);
    if(encounter==='exchange'||encounter==='guard')parts.push(`<path class="ev-road" d="${road}"/>`);
    if(encounter==='share')parts.push(`<path class="ev-carts" d="${road}"/>`);
    if(encounter==='guard'){const [x,y]=axial(dq*2,dr*2);parts.push(`<g class="ev-tower" transform="translate(${x+15} ${y-14})"><path d="M-3 8v-13h6v13zM-5.5-5h11l-2-4h-7z"/></g>`)}
    if(encounter==='reserve')parts.push(`<circle class="ev-wall" r="27" transform="${move(center)}"/>`);
    parts.push(`<g class="ev-camp ${encounter?'met':'waiting'}" transform="translate(${camp[0]} ${camp[1]})"><title>${safe(L.gbNeighbours)}</title><circle class="ev-camp-ring" r="17"/><path class="ev-tents" d="M-11 7l6-11 6 11zM1 7l5-9 5 9z"/><path class="ev-flag" d="M-2-6v-10l7 3-7 3"/></g>`);
  }
  const future=routeById(state.route);
  if(future&&future.id!=='local'&&assessLayout(state).routes[future.id]?.operational){
    const [dq,dr]=DIRECTIONS[neighbourDirection(state)],end=axial(dq*3.9,dr*3.9);
    parts.push(`<g class="future-route future-${future.id}"><circle cx="${end[0]}" cy="${end[1]}" r="18"/><text x="${end[0]}" y="${end[1]+5}">${future.icon}</text></g>`);
  }
  return `<g class="hx-events" aria-hidden="true">${parts.join('')}</g>`;
}

// mode 'play' is the interactive banner map; 'mini' is the read-only copy in the chronicle
// and the teacher's review panel.
export function landMarkup(state,lang,L,{mode='play',selected=null,locked=false,coverage=[],path=[]}={}){
  const land=generateLand(state.mapPoint);
  if(!land)return '';
  const seen=i=>isRevealed(state,i),play=mode==='play',tiles=state.tiles||{},assessment=assessLayout(state);
  const focusTile=Number.isInteger(tiles[selected])?tiles[selected]:hexes.map((hex,i)=>({hex,i})).filter(({i})=>i!==center&&seen(i)).sort((a,b)=>a.hex.dist-b.hex.dist||a.i-b.i)[0]?.i;
  const terrainName=i=>terrains[land.tiles[i]][lang];
  const cells=hexes.map((hex,i)=>!seen(i)
    ?`<g class="hx hx-fog" data-hex="${i}" transform="${move(i)}"><polygon class="hx-base" points="${HEX}"/>${fogGlyph}</g>`
    :`<g class="hx hx-${land.tiles[i]}" data-hex="${i}" transform="${move(i)}"><polygon class="hx-base" points="${HEX}"/><polygon class="hx-bevel" points="${INNER}"/>${i===center?'':`<g class="hx-glyph"${i%2?' transform="scale(-1 1)"':''}>${glyphs[land.tiles[i]]}</g>`}</g>`).join('');
  const hits=play?hexes.map((hex,i)=>{
    if(!seen(i)||i===center)return '';
    const other=occupantOf(state,i);
    const target=selected&&(!other||other===selected)&&fits(land,selected,i);
    const cls=selected?(target?'fit':'blocked'):'';
    return `<polygon class="hx-hit ${cls}" data-tile="${i}" points="${HEX}" transform="${move(i)}"${!locked?` role="button" tabindex="${i===focusTile?0:-1}" aria-label="${safe(`${selected?L.placeHere:L.landTitle}: ${terrainName(i)}`)}"`:''}/>`;
  }).join(''):'';
  const buildings=Object.entries(tiles).map(([id,i])=>{
    const name=improvements[id]?.name[lang]||id,label=`${name} · ${terrainName(i)}`;
    const interactive=play&&!locked;
    return `<g class="hx-building ${selected===id?'selected':''} ${assessment.buildings[id]?.connected?'connected':'isolated'}" data-building-at="${id}" transform="${move(i)}"${interactive?` data-building="${id}" role="button" tabindex="0" aria-label="${safe(`${L.moveBuilding}: ${label}`)}" aria-pressed="${selected===id}"`:''}><title>${safe(label)}</title><g class="hx-pin"><circle class="hx-medal" r="12.5"/><path class="hx-icon" transform="translate(-8 -8) scale(.5)" d="${iconPath(id)}"/></g></g>`;
  }).join('');
  const size=settlementSize(state);
  const settlement=`<g class="hx-settlement size-${size}" transform="${move(center)}"><title>${safe(L.settlementStages[size])}</title>${town[size]}</g>`;
  const clouds=play?'<g class="hx-clouds" aria-hidden="true"><ellipse class="hx-cloud c1" cx="-120" cy="-90" rx="60" ry="18"/><ellipse class="hx-cloud c2" cx="40" cy="110" rx="75" ry="20"/></g>':'';
  // Room beyond the edge for the neighbouring camp.
  const box='-218 -192 436 384';
  const paths=`<g class="layout-trails" aria-hidden="true">${normalizeTrails(state).map(([a,b])=>`<path d="${line([at(a),at(b)])}"/>`).join('')}</g>`;
  const overlays=`<g class="layout-coverage" aria-hidden="true">${coverage.filter(i=>seen(i)).map(i=>`<polygon points="${INNER}" transform="${move(i)}"/>`).join('')}</g>${path.length>1?`<path class="layout-preview-path" d="${line(path.map(at))}" aria-hidden="true"/>`:''}<g class="layout-risk" aria-hidden="true">${assessment.season.atRisk.map(id=>`<circle r="18" transform="${move(tiles[id])}"/>`).join('')}</g>`;
  return `<svg class="hexmap ${mode} ${selected?'moving':''}" viewBox="${box}" role="group" aria-label="${safe(`${L.landTitle} · ${L.settlementStages[size]}`)}"><defs><filter id="hx-soft-${mode}"><feGaussianBlur stdDeviation="9"/></filter><clipPath id="hx-clip-${mode}">${hexes.map((_,i)=>`<polygon points="${HEX}" transform="${move(i)}"/>`).join('')}</clipPath><radialGradient id="hx-light-${mode}" cx="38%" cy="28%" r="80%"><stop offset="0" stop-color="#fff6dc" stop-opacity=".2"/><stop offset=".55" stop-color="#fff6dc" stop-opacity="0"/><stop offset="1" stop-color="#050b0e" stop-opacity=".4"/></radialGradient></defs><g class="hx-cells">${cells}</g><g class="hx-water">${riverPaths(land,seen)}</g><rect class="hx-light" x="-220" y="-195" width="440" height="390" fill="url(#hx-light-${mode})" clip-path="url(#hx-clip-${mode})"/><g class="hx-hits">${hits}</g>${eventLayer(state,land,L)}${paths}${overlays}${settlement}<g class="hx-buildings">${buildings}</g>${clouds.replace(/class="hx-cloud/g,`filter="url(#hx-soft-${mode})" class="hx-cloud`)}</svg>`;
}

// What the side panel says about a hex: its land, what stands there, and which of the
// team's buildings would suit it. This is the "why here?" prompt behind every placement.
export function tileInfo(state,lang,L,i){
  const land=generateLand(state.mapPoint);
  if(!land||i==null||!hexes[i])return `<p>${L.landHelp}</p>`;
  if(!isRevealed(state,i))return `<strong>${L.fogged}</strong><p>${L.revealHint}</p>`;
  if(i===center)return `<strong>${L.settlementStages[settlementSize(state)]}</strong><p>${L.settlementNote}</p>`;
  const other=occupantOf(state,i),chosen=[...state.tech,...state.civic];
  const suits=chosen.filter(id=>fits(land,id,i)).map(id=>improvements[id].name[lang]);
  return `<strong>${terrains[land.tiles[i]][lang]}</strong>${other?`<p><b>${safe(improvements[other].name[lang])}</b> — ${safe(improvements[other].why[lang])}</p>`:''}<p>${suits.length?`<b>${L.tileSuits}:</b> ${safe(suits.join(', '))}`:L.nothingFits}</p>`;
}
export function movingInfo(id,lang,L){
  const rule=improvements[id];
  return `<strong>${safe(String(L.placing).replace('%s',rule.name[lang]))}</strong><p>${safe(rule.why[lang])}</p><button class="land-cancel" data-action="cancel-move">${L.cancelMove}</button>`;
}

export function buildingList(state,lang,L,{selected=null,locked=false}={}){
  const chosen=[...state.tech,...state.civic];
  if(!chosen.length)return `<p class="land-empty">${L.noBuildings}</p>`;
  return `<div class="land-chips">${chosen.map(id=>{
    const placed=Number.isInteger(state.tiles?.[id]),name=improvements[id]?.name[lang]||id;
    return `<button class="land-chip ${placed?'':'unplaced'} ${selected===id?'selected':''}" data-building="${id}" aria-pressed="${selected===id}" ${locked||!placed?'disabled':''} title="${safe(placed?L.moveBuilding:L.unplaced)}"><svg viewBox="0 0 32 32" aria-hidden="true"><path d="${iconPath(id)}"/></svg>${safe(name)}${placed?'':`<small>${L.unplaced}</small>`}</button>`;
  }).join('')}</div>`;
}

export function landSummary(state,lang){
  const land=generateLand(state.mapPoint);
  if(!land)return '';
  return Object.entries(state.tiles||{}).map(([id,i])=>`${improvements[id]?.name[lang]||id} (${terrains[land.tiles[i]][lang]})`).join(' · ');
}
