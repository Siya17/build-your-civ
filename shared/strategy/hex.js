import { resources, addResources } from './resources.js';

export const HEX_DIRECTIONS = Object.freeze([[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]].map(Object.freeze));
export const hexKey = (q, r) => `${q},${r}`;
export const hexDistance = (a, b) => Math.max(Math.abs(a.q - b.q), Math.abs(a.r - b.r), Math.abs(a.q + a.r - b.q - b.r));

export function adjacentTiles(board, tileId) {
  const tile = board[tileId];
  if (!tile) throw new Error('Unknown tile');
  return HEX_DIRECTIONS.map(([q, r]) => board[hexKey(tile.q + q, tile.r + r)]).filter(Boolean);
}

// Cost, terrain and adjacency are content data rather than branching UI logic.
export const STRUCTURES = Object.freeze({
  farm: { cost: { materials: 2 }, terrains: ['plains', 'river', 'wetland'], yield: { food: 4 }, terrainBonus: ['river', 'wetland'], partnerBonus: ['storehouse'], impact: 0 },
  mine: { cost: { materials: 2 }, terrains: ['hills'], yield: { materials: 3 }, terrainBonus: ['hills'], partnerBonus: ['workshop'], impact: 2 },
  workshop: { cost: { materials: 4 }, terrains: ['plains', 'hills'], yield: { materials: 2, knowledge: 1 }, terrainBonus: ['hills'], partnerBonus: ['mine'], impact: 3 },
  archive: { cost: { materials: 3 }, terrains: ['plains', 'hills'], yield: { knowledge: 2 }, terrainBonus: ['forest'], partnerBonus: ['shrine'], impact: 0 },
  shrine: { cost: { materials: 3 }, terrains: ['forest', 'hills', 'wetland'], yield: { culture: 2 }, terrainBonus: ['forest', 'wetland'], partnerBonus: ['archive'], impact: 0 },
  storehouse: { cost: { materials: 3 }, terrains: ['plains', 'hills'], yield: { food: 1 }, terrainBonus: [], partnerBonus: ['farm'], impact: 0 }
});

export const CIVILIZATIONS = Object.freeze({
  highland: { name: 'Highland Keepers', multipliers: { food: 0, materials: 2, knowledge: 1, culture: 1 }, biome: 'hills' },
  river: { name: 'River Gardeners', multipliers: { food: 2, materials: 0, knowledge: 1, culture: 1 }, biome: 'river' },
  woodland: { name: 'Woodland Custodians', multipliers: { food: 1, materials: 1, knowledge: 1, culture: 2 }, biome: 'forest' }
});

export const RESEARCH = Object.freeze({
  masonry: { cost: { knowledge: 3 }, unlocks: 'workshop' },
  preservation: { cost: { knowledge: 2 }, unlocks: 'storehouse' },
  waterways: { cost: { knowledge: 3 }, unlocks: 'canal' }
});

// Multiplicative bonus is capped: three matches give x1.75, not runaway scaling.
// A foreign archive/shrine also gives BOTH owners +1 knowledge and +1 culture.
export function calculateTileYield(board, tileId, civilization, round = 1) {
  const tile = board[tileId], rule = STRUCTURES[tile?.structure];
  if (!rule || tile.disabledUntil >= round) return { yield: resources(), multiplier: 1, crossroads: [], impact: 0 };
  const profile = CIVILIZATIONS[civilization];
  if (!profile) throw new Error('Unknown civilization');
  const neighbors = adjacentTiles(board, tileId);
  const matches = neighbors.filter(other => rule.terrainBonus.includes(other.terrain) || rule.partnerBonus.includes(other.structure)).length;
  const multiplier = 1 + Math.min(3, matches) * 0.25;
  const amount = resources();
  for (const key of Object.keys(rule.yield)) {
    // Strengths apply on the home biome (river farmers also favor watered plains).
    const affinity = tile.terrain === profile.biome || (civilization === 'river' && tile.structure === 'farm' && neighbors.some(t => t.terrain === 'river'));
    const factor = profile.multipliers[key] === 0 ? 0 : affinity ? profile.multipliers[key] : 1;
    amount[key] = Math.floor(rule.yield[key] * multiplier * factor);
  }
  const cultural = ['archive', 'shrine'];
  const crossroads = cultural.includes(tile.structure)
    ? neighbors.filter(other => cultural.includes(other.structure) && other.owner && other.owner !== tile.owner).map(other => other.id)
    : [];
  if (crossroads.length) { amount.knowledge += 1; amount.culture += 1; }
  return { yield: amount, multiplier, crossroads, impact: rule.impact };
}

export function calculatePlayerYield(board, player, round) {
  let amount = resources(), impact = 0;
  for (const tile of Object.values(board)) {
    if (tile.owner !== player.id) continue;
    const result = calculateTileYield(board, tile.id, player.civilization, round);
    amount = addResources(amount, result.yield);
    impact += result.impact;
  }
  return { yield: amount, impact };
}

// The same seasonal harvest forecast is used by resolution and placement previews.
export function harvestForecast(board,player,round,season) {
  const result=calculatePlayerYield(board,player,round);
  if(season==='winter')result.yield.food=Math.floor(result.yield.food/2);
  if(season==='autumn'&&!Object.values(board).some(tile=>tile.owner===player.id&&tile.structure==='storehouse'))result.yield.food=Math.max(0,result.yield.food-1);
  return {...result,upkeep:season==='winter'?2:1};
}

export function createBoard(radius = 4) {
  if (!Number.isInteger(radius) || radius < 3 || radius > 12) throw new Error('Board radius must be 3–12');
  const board = {}, biomes = ['plains', 'forest', 'hills', 'plains', 'wetland'];
  for (let q = -radius; q <= radius; q++) {
    for (let r = Math.max(-radius, -q - radius); r <= Math.min(radius, -q + radius); r++) {
      const id = hexKey(q, r);
      board[id] = { id, q, r, terrain: q === 1 ? 'river' : biomes[((q * 7 + r * 11) % biomes.length + biomes.length) % biomes.length], owner: null, structure: null, infrastructure: null, cleared: false, exploredBy: [], node: null, disabledUntil: 0 };
    }
  }
  // Stable starter tiles and an explicit neutral corridor; a river requires a bridge.
  for (const [id, terrain] of Object.entries({ '-2,0': 'hills', '-2,1': 'hills', '-1,0': 'plains', '0,0': 'plains', '2,0': 'plains', '2,-1': 'plains', '0,3': 'forest', '0,2': 'forest', '-1,-2': 'forest' })) board[id].terrain = terrain;
  board['-1,-2'].node = { kind: 'natural-wonder', reward: { knowledge: 2, culture: 2 }, claimedBy: null };
  board['-3,2'].node = { kind: 'materials', reward: { materials: 3 }, claimedBy: null };
  return board;
}
