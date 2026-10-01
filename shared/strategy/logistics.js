import { adjacentTiles, hexDistance } from './hex.js';
import { resources, resourceTotal } from './resources.js';

export const INFRASTRUCTURE = Object.freeze({
  road: { cost: { materials: 1 }, capacity: 4, terrains: ['plains', 'hills'] },
  bridge: { cost: { materials: 2 }, capacity: 4, terrains: ['river', 'wetland'] },
  canal: { cost: { materials: 3 }, capacity: 6, terrains: ['river', 'wetland'] }
});
export const edgeKey = (a, b) => [a, b].sort().join('|');
const capacity = tile => INFRASTRUCTURE[tile.infrastructure]?.capacity ?? (tile.structure === 'settlement' ? 6 : 0);

export function routeCapacity(board,path,usage={}) {
  return path.slice(1).map((to,i)=>{
    const from=path[i],limit=Math.min(capacity(board[from]),capacity(board[to]));
    return {from,to,limit,remaining:Math.max(0,limit-(usage[edgeKey(from,to)]??0))};
  });
}

// Explicit paths let players commit scarce carrying capacity to a chosen route.
// Capacity is shared in BOTH directions and resets only at the next round.
export function reserveRoute(board, usage, path, from, to, cargo, actorId, round) {
  const amount = resourceTotal(resources(cargo));
  if (!amount) throw new Error('Cargo must be positive');
  if (!Array.isArray(path) || path.length < 2 || path[0] !== from || path.at(-1) !== to || new Set(path).size !== path.length) throw new Error('Invalid route endpoints or loop');
  const next = { ...usage };
  for (let i = 0; i < path.length; i++) {
    const tile = board[path[i]];
    if (!tile || !tile.exploredBy.includes(actorId)) throw new Error('Route must be explored');
    if (!capacity(tile) || tile.disabledUntil >= round) throw new Error('Route needs working roads, bridges or canals');
    if (!i) continue;
    const previous = board[path[i - 1]];
    if (hexDistance(tile, previous) !== 1) throw new Error('Route must follow adjacent hexes');
    const key = edgeKey(previous.id, tile.id), limit = Math.min(capacity(previous), capacity(tile));
    if ((next[key] ?? 0) + amount > limit) throw new Error('Route capacity exhausted this round');
    next[key] = (next[key] ?? 0) + amount;
  }
  return next;
}

// Preview helper. The reducer still validates the supplied route authoritatively.
export function findRoute(board, from, to, actorId, round, usage = {}, cargoSize = 1) {
  if (!Number.isSafeInteger(cargoSize) || cargoSize < 1) throw new Error('Invalid cargo size');
  const usable = tile => tile && tile.exploredBy?.includes(actorId) && capacity(tile) >= cargoSize && tile.disabledUntil < round;
  if (!usable(board[from]) || !usable(board[to])) return null;
  const queue = [[from]], visited = new Set([from]);
  for (let i = 0; i < queue.length; i++) {
    const path = queue[i], tile = board[path.at(-1)];
    if (tile.id === to) return path;
    for (const next of adjacentTiles(board, tile.id)) {
      const limit = Math.min(capacity(tile), capacity(next));
      if (visited.has(next.id) || !usable(next) || (usage[edgeKey(tile.id, next.id)] ?? 0) + cargoSize > limit) continue;
      visited.add(next.id); queue.push([...path, next.id]);
    }
  }
  return null;
}
