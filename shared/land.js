// Each team's homeland: a small hex map built from its map point. The terrain is derived,
// never stored, so every teammate and the server draw the same land from the letter alone.
// Only where each building stands (state.tiles) is shared state.
import { locations } from './world.js';

export const RADIUS = 3;
const DIRS = [[1,0],[1,-1],[0,-1],[-1,0],[-1,1],[0,1]];
export const hexes = [];
for (let q = -RADIUS; q <= RADIUS; q++) {
  for (let r = Math.max(-RADIUS, -q - RADIUS); r <= Math.min(RADIUS, -q + RADIUS); r++) {
    hexes.push({q, r, s:-q - r, x:q + r / 2, dist:Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r))});
  }
}
const indexOf = new Map(hexes.map((h, i) => [`${h.q},${h.r}`, i]));
export const center = indexOf.get('0,0');
export const neighbours = hexes.map(h => DIRS.map(([dq, dr]) => indexOf.get(`${h.q + dq},${h.r + dr}`)).filter(i => i !== undefined));
// Auto-placement looks outward from the settlement, so buildings cluster like a real town.
const byDistance = hexes.map((_, i) => i).sort((a, b) => hexes[a].dist - hexes[b].dist || a - b);

export const terrains = {
  plains:{en:'Plains',ja:'平原'},
  grass:{en:'Grassland',ja:'草原'},
  forest:{en:'Forest',ja:'森'},
  hills:{en:'Hills',ja:'丘陵'},
  mountain:{en:'Mountains',ja:'山地'},
  desert:{en:'Desert',ja:'砂漠'},
  river:{en:'River valley',ja:'川沿いの谷'},
  coast:{en:'Coast and sea',ja:'海岸と海'},
  ice:{en:'Ice and snow',ja:'氷と雪'},
  wetland:{en:'Wetland',ja:'湿地'}
};
const WATER = new Set(['river','coast','wetland']);

// Terrain profiles follow each place's field notes. A rule [axis, min, max] matches a hex
// whose q, r or s coordinate (or x, its west–east position) lies in that range; "sea" hexes become open water, "zones"
// swap in different weights (a rain shadow, a drier interior), "ridge" is a mountain chain
// and "river" is the line of hexes one step from the settlement along that axis.
const profiles = {
  forest:{center:'plains',weights:{forest:6,wetland:2,hills:1,grass:1},river:'r'},
  coast:{center:'plains',weights:{hills:3,plains:2,grass:2,mountain:1,forest:1},sea:['r',-3,-2],zones:[{when:['r',2,3],weights:{desert:3,hills:2,plains:1}}]},
  plateau:{center:'plains',weights:{hills:4,grass:3,mountain:2,plains:1},sea:['x',2.5,3]},
  dunes:{center:'desert',weights:{desert:8,hills:1,plains:1},river:'s',sea:['x',-3,-2.5]},
  plain:{center:'plains',weights:{plains:5,grass:3,wetland:2,forest:1},river:'q'},
  steppe:{center:'grass',weights:{grass:6,desert:2,hills:2,mountain:1},zones:[{when:['r',2,3],weights:{desert:5,grass:1}}]},
  savanna:{center:'grass',weights:{grass:5,plains:3,desert:1,forest:1},river:'q',zones:[{when:['r',-3,-2],weights:{desert:5,grass:1}},{when:['r',2,3],weights:{forest:3,grass:2}}]},
  outback:{center:'plains',weights:{plains:3,desert:2,grass:2,wetland:1},sea:['r',-3,-2],zones:[{when:['r',2,3],weights:{desert:5,plains:1}}]},
  cascades:{center:'plains',weights:{grass:3,forest:2,hills:2},sea:['x',-3,-2],ridge:['x',-1,-0.5],zones:[{when:['x',-1.5,-1.5],weights:{forest:5,hills:1}},{when:['x',1,3],weights:{desert:3,plains:2,grass:1}}]},
  andes:{center:'plains',weights:{hills:2,desert:2,plains:1},sea:['x',-3,-2.5],ridge:['x',1,1.5],river:'r',zones:[{when:['x',-2,-1],weights:{desert:5}},{when:['x',2,3],weights:{hills:3,grass:2,mountain:2}}]},
  ice:{center:'hills',weights:{ice:6,hills:2,mountain:1},sea:['x',-3,-2],zones:[{when:['x',-1.5,-1],weights:{hills:3,grass:1,ice:1}}]}
};
const inRule = (hex, [axis, min, max]) => hex[axis] >= min && hex[axis] <= (max ?? min);
// A small seeded generator: the same letter must always give the same land.
function random(seed) {
  return () => {
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const pick = (weights, roll) => {
  const entries = Object.entries(weights);
  let n = roll * entries.reduce((sum, [, w]) => sum + w, 0);
  for (const [terrain, w] of entries) if ((n -= w) < 0) return terrain;
  return entries[0][0];
};

const cache = new Map();
export function generateLand(point) {
  if (!Object.hasOwn(locations, point)) return null;
  if (cache.has(point)) return cache.get(point);
  const profile = profiles[locations[point].scene];
  const roll = random(point.charCodeAt(0) * 7919);
  const tiles = hexes.map((hex, i) => {
    const rolled = pick((profile.zones || []).find(zone => inRule(hex, zone.when))?.weights || profile.weights, roll());
    if (i === center) return profile.center;
    if (profile.sea && inRule(hex, profile.sea)) return 'coast';
    if (profile.river && hex[profile.river] === 1) return 'river';
    if (profile.ridge && inRule(hex, profile.ridge)) return 'mountain';
    return rolled;
  });
  // The river runs in order along its line so the map can draw it as one stream.
  const along = {r:'q', q:'r', s:'q'}[profile.river];
  const river = profile.river ? tiles.map((t, i) => i).filter(i => tiles[i] === 'river').sort((a, b) => hexes[a][along] - hexes[b][along]) : [];
  const land = {point, tiles, river};
  cache.set(point, land);
  return land;
}

// Every development raises one building. Terrain lists and distance rules are chosen to
// spark "why here?" talk, not to model history precisely.
const LAND = ['plains','grass','forest','hills','mountain','desert','river','ice','wetland'];
const b = (en, ja, terrain, whyEn, whyJa, rules = {}) => ({name:{en, ja}, terrains:terrain, why:{en:whyEn, ja:whyJa}, ...rules});
export const improvements = {
  pottery:b('Granary','穀物倉',LAND,'Harvests are stored close to home.','収穫を家の近くに蓄える。',{near:1}),
  husbandry:b('Pasture','牧草地',['grass','plains','hills','desert'],'Animals need open land to graze.','動物には草を食べる開けた土地が必要。'),
  mining:b('Mine','鉱山',['hills','mountain','desert'],'Stone and ore lie in rough ground.','石や鉱石は起伏のある土地にある。'),
  sailing:b('Harbor','港',['coast','river'],'Boats need open water.','船には水辺が必要。'),
  astrology:b('Sky watch','星見の場',['hills','mountain','desert','plains','grass','ice'],'Open skies make it easier to follow the seasons.','開けた空は季節を読み取りやすい。'),
  irrigation:b('Farms','畑',['plains','grass','desert','river','wetland'],'Fields need water close by.','畑の近くには水が必要。',{water:true}),
  writing:b('Record house','記録の家',LAND,'Records are kept near the heart of the settlement.','記録は集落の中心近くで守られる。',{near:2}),
  archery:b('Hunting camp','狩りの野営地',['forest','grass','hills','plains','ice'],'Hunters follow animals into wild land.','狩人は動物を追って野へ出る。'),
  bronze:b('Workshop','工房',['plains','grass','hills','desert','river'],'Metalworkers need fuel, ore and people nearby.','金属加工には燃料・鉱石・人手が近くに必要。',{near:2}),
  masonry:b('Quarry','石切り場',['hills','mountain','desert'],'Good stone is cut from rocky ground.','良い石は岩の多い土地から切り出す。'),
  wheel:b('Cart road','荷車の道',['plains','grass','desert','river'],'Wheels roll best on flat, open ground.','車輪は平らで開けた土地で進みやすい。'),
  shipbuilding:b('Shipyard','造船所',['coast','river'],'Ships are built at the water’s edge.','船は水辺で造られる。'),
  navigation:b('Wayfinder post','道しるべの見張り所',['coast','desert','ice'],'Star guides help people cross open sea, sand or ice.','星の目印は海・砂・氷を渡る助けになる。'),
  currency:b('Market','市場',LAND,'Trade gathers where people live.','交易は人が暮らす場所に集まる。',{near:1}),
  horseback:b('Stables','馬屋',['grass','plains','desert'],'Horses need wide grazing land.','馬には広い草地が必要。'),
  iron:b('Ironworks','製鉄所',['hills','forest','mountain'],'Iron needs ore and wood for fuel.','鉄には鉱石と燃料の木が必要。'),
  math:b('Survey office','測量所',LAND,'Measuring the land starts from the settlement.','土地の測量は集落から始まる。',{near:2}),
  construction:b('Great works','大建造物',['plains','grass','hills','desert','river'],'Large projects need space close to home.','大きな工事には家の近くに広い場所が必要。',{near:2}),
  engineering:b('Bridges and dams','橋とダム',['river','wetland','hills'],'Engineers work with water and rough ground.','技術者は水や起伏のある土地に取り組む。'),
  preservation:b('Storehouse','貯蔵庫',LAND,'Cool, dry stores keep food safe.','涼しく乾いた倉は食料を守る。',{near:2}),
  route_mapping:b('Waystation','中継所',LAND,'Waystations mark the edge of known land.','中継所は知られた土地の端に立つ。',{far:2}),
  laws:b('Council hall','集会所',LAND,'Shared rules are made where people meet.','共通のルールは人が集まる場所で決まる。',{near:1}),
  craft:b('Craft quarter','職人街',LAND,'Crafts grow next to homes and markets.','手仕事は家や市場の近くで育つ。',{near:2}),
  trade:b('Trading post','交易所',['coast','river','plains','grass','desert'],'Traders meet at the edges of your land.','商人は土地の端で出会う。',{far:2}),
  workforce:b('Work camp','労働者の宿営地',LAND,'Shared projects need workers close by.','共同の工事には近くに働き手が必要。',{near:2}),
  tradition:b('Fort','砦',['hills','mountain'],'High ground helps people watch and defend.','高い土地は見張りと守りに役立つ。'),
  empire:b('Road network','道路網',['plains','grass','desert','hills','river'],'Roads reach out to distant places.','道は遠くの場所へ伸びる。',{far:2}),
  mysticism:b('Shrine','聖地',['mountain','hills','forest','river','ice','wetland'],'Striking natural places often feel sacred.','印象的な自然の場所は神聖に感じられることが多い。'),
  games:b('Festival ground','祭りの広場',['plains','grass','river','desert'],'Open ground near homes brings people together.','家の近くの開けた土地は人を集める。',{near:2}),
  philosophy:b('Forum','議論の広場',LAND,'Debate happens in the heart of the settlement.','議論は集落の中心で行われる。',{near:1}),
  poetry:b('Theater','劇場',['hills','plains','grass'],'Slopes make natural seats for an audience.','斜面は観客の自然な座席になる。',{near:2}),
  training:b('Training ground','訓練場',['plains','grass','desert'],'Drills need flat, open space.','訓練には平らで開けた場所が必要。'),
  defense:b('Walls','城壁',LAND,'Walls protect the settlement itself.','城壁は集落そのものを守る。',{near:1}),
  history:b('Monument','記念碑',LAND,'Memories are kept where everyone can see them.','記憶は皆が見える場所に残される。',{near:2}),
  theology:b('Temple','神殿',['hills','mountain','river','forest','plains'],'Temples rise on meaningful ground.','神殿は意味のある土地に建てられる。'),
  mutual_aid:b('Shared storehouse','共同倉庫',LAND,'Shared supplies stay easy to reach.','共同の蓄えは取りに行きやすい場所に置く。',{near:1}),
  resource_council:b('Council grove','評議の森',['forest','wetland','river','hills'],'The council meets beside the resources it protects.','評議会は守る資源のそばで集まる。'),
  trade_accord:b('Caravan house','隊商宿',['coast','river','plains','grass','desert'],'Exchange happens where routes meet other lands.','交換は道が他の土地と出会う場所で行われる。',{far:2}),
  route_stewards:b('Watchtower','見張り塔',['hills','mountain','desert','plains'],'Watchtowers guard routes at the edge.','見張り塔は端の道を守る。',{far:2})
};

// The hard season each place faces, from its field notes. It is drawn on the map before the
// first decision and names the danger in the council's questions.
const hazardByScene = {forest:'flood',plain:'flood',outback:'flood',savanna:'drought',dunes:'drought',steppe:'drought',coast:'storm',cascades:'storm',andes:'storm',ice:'frost',plateau:'frost'};
export const hazardOf = point => hazardByScene[locations[point]?.scene] || '';

// The path an outward first decision maps: a straight line from the settlement to the edge,
// on land. The neighbouring community later appears beyond its end; a team that stayed
// home meets its neighbours from the opposite side instead.
export const DIRECTIONS = DIRS;
const routes = new Map();
export function route(point) {
  const land = generateLand(point);
  if (!land) return null;
  if (routes.has(point)) return routes.get(point);
  const line = d => [1,2,3].map(n => indexOf.get(`${DIRS[d][0] * n},${DIRS[d][1] * n}`));
  const first = point.charCodeAt(0) % 6;
  let dir = first;
  for (let k = 0; k < 6; k++) { const d = (first + k) % 6; if (line(d).every(i => land.tiles[i] !== 'coast')) { dir = d; break; } }
  const found = {dir, tiles:line(dir)};
  routes.set(point, found);
  return found;
}
export const neighbourDirection = state => {
  const r = route(state.mapPoint);
  return r ? (state.events?.origin === 'steward' ? (r.dir + 3) % 6 : r.dir) : 0;
};

// Travel technologies and an outward first decision reveal the far edge of the map.
const travel = ['sailing','shipbuilding','navigation','horseback','wheel','route_mapping'];
export function revealRadius(state) {
  if (!generateLand(state.mapPoint)) return 0;
  const count = state.tech.length + state.civic.length;
  if ((state.events?.origin === 'explore' && count >= 3) || count >= 8 || state.tech.some(id => travel.includes(id))) return 3;
  if (state.events?.origin || count >= 1) return 2;
  return 1;
}
export const settlementSize = state => {
  const count = state.tech.length + state.civic.length;
  return count >= 9 ? 2 : count >= 4 ? 1 : 0;
};

// A hex is explored when it lies inside the revealed radius, or on the route the team mapped.
export function isRevealed(state, i) {
  if (!hexes[i]) return false;
  if (hexes[i].dist <= revealRadius(state)) return true;
  return state.events?.origin === 'explore' && !!route(state.mapPoint)?.tiles.includes(i);
}

export function fits(land, id, i) {
  const rule = improvements[id], hex = hexes[i];
  if (!rule || !hex || i === center || !rule.terrains.includes(land.tiles[i])) return false;
  if (rule.near && hex.dist > rule.near) return false;
  if (rule.far && hex.dist < rule.far) return false;
  if (rule.water && !WATER.has(land.tiles[i]) && !neighbours[i].some(n => WATER.has(land.tiles[n]))) return false;
  return true;
}
const chosenCards = state => [...state.tech, ...state.civic];

// Why a placement is refused, or '' when it is allowed. The same check runs in the browser
// (to light up valid hexes) and on the server (to reject a modified client).
export function placeError(state, id, i) {
  const land = generateLand(state.mapPoint);
  if (!land) return 'Choose a place on the map first';
  if (!chosenCards(state).includes(id)) return 'Choose this development before placing it';
  if (!Number.isInteger(i) || !hexes[i]) return 'Invalid tile';
  if (i === center) return 'Your settlement stands there';
  if (!isRevealed(state, i)) return 'That land is not explored yet';
  if (Object.entries(state.tiles || {}).some(([other, tile]) => tile === i && other !== id)) return 'Another building already stands there';
  if (!fits(land, id, i)) return 'This building does not suit that land';
  return '';
}

// The one place layout is decided: keep every valid placement, drop what no longer fits
// (a removed card, a different map point, land hidden again), then give each unplaced
// building the nearest fitting hex. Deterministic, so client and server always agree.
export function settleTiles(state) {
  const land = generateLand(state.mapPoint);
  if (!land) return {};
  const tiles = {}, used = new Set([center]);
  const open = (id, i) => Number.isInteger(i) && hexes[i] && !used.has(i) && isRevealed(state, i) && fits(land, id, i);
  for (const id of chosenCards(state)) {
    const i = state.tiles?.[id];
    if (open(id, i)) { tiles[id] = i; used.add(i); }
  }
  for (const id of chosenCards(state)) {
    if (id in tiles) continue;
    const i = byDistance.find(n => open(id, n));
    if (i !== undefined) { tiles[id] = i; used.add(i); }
  }
  return tiles;
}

// Explored, free hexes where a card's building could stand: the land's answer to "does this
// development suit us?", shown on every card in the trees.
export function fitTiles(state, id) {
  const land = generateLand(state.mapPoint);
  if (!land || !improvements[id]) return [];
  const taken = new Set(Object.entries(state.tiles || {}).filter(([other]) => other !== id).map(([, i]) => i));
  return hexes.map((_, i) => i).filter(i => !taken.has(i) && isRevealed(state, i) && fits(land, id, i));
}
