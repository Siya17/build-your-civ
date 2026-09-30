import test from 'node:test';
import assert from 'node:assert/strict';
import { resources } from '../shared/strategy/resources.js';
import { createBoard, adjacentTiles, calculateTileYield, hexDistance, calculatePlayerYield } from '../shared/strategy/hex.js';
import { reserveRoute, findRoute } from '../shared/strategy/logistics.js';
import { createGreatWork, contributeGreatWork } from '../shared/strategy/great-work.js';
import { createSession, applySessionAction, seasonClock, sessionView } from '../shared/strategy/turn-manager.js';
import { runCooperativeDemo } from '../scripts/cooperative-demo.js';

const act = (state, actorId, payload) => applySessionAction(state, { ...payload, actorId, expectedRevision: state.revision });
const readyAll = state => Object.keys(state.players).reduce((next, id) => act(next, id, { type: 'ready' }), state);
const openedCorridor = () => {
  let state = createSession();
  for (const id of ['highland', 'river']) state = act(state, id, { type: 'scout', tileId: '0,0' });
  state = act(state, 'highland', { type: 'infrastructure', tileId: '-1,0', infrastructure: 'road' });
  state = act(state, 'river', { type: 'infrastructure', tileId: '1,0', infrastructure: 'bridge' });
  state = readyAll(state);
  return act(state, 'highland', { type: 'infrastructure', tileId: '0,0', infrastructure: 'road' });
};

test('axial adjacency has six neighbors, symmetric edges and bounded borders', () => {
  const board = createBoard();
  assert.equal(Object.keys(board).length, 61);
  assert.equal(adjacentTiles(board, '0,0').length, 6);
  assert.equal(adjacentTiles(board, '4,0').length, 3);
  for (const tile of Object.values(board)) for (const other of adjacentTiles(board, tile.id)) {
    assert.equal(hexDistance(tile, other), 1);
    assert(adjacentTiles(board, other.id).some(t => t.id === tile.id));
  }
});

test('adjacency multiplies biome strengths, while civilization deficits stay zero', () => {
  const board = createBoard();
  board['0,0'].terrain = 'hills'; board['0,0'].structure = 'mine'; board['0,0'].owner = 'a';
  for (const tile of adjacentTiles(board, '0,0')) tile.terrain = 'hills';
  const strong = calculateTileYield(board, '0,0', 'highland');
  assert.equal(strong.multiplier, 1.75);
  assert.equal(strong.yield.materials, 10);
  assert.equal(calculateTileYield(board, '0,0', 'river').yield.materials, 0);
  board['0,0'].structure = 'farm';
  assert.equal(calculateTileYield(board, '0,0', 'highland').yield.food, 0);
});

test('a Cultural Crossroads gives the bonus to both owners and never for self adjacency', () => {
  const board = createBoard();
  Object.assign(board['0,0'], { owner: 'a', structure: 'archive' });
  Object.assign(board['1,0'], { owner: 'b', structure: 'shrine' });
  const left = calculateTileYield(board, '0,0', 'highland'), right = calculateTileYield(board, '1,0', 'river');
  assert.deepEqual(left.crossroads, ['1,0']); assert.deepEqual(right.crossroads, ['0,0']);
  assert(left.yield.culture >= 1); assert(right.yield.knowledge >= 1);
  board['1,0'].owner = 'a';
  assert.deepEqual(calculateTileYield(board, '0,0', 'highland').crossroads, []);
  board['0,0'].disabledUntil = 2;
  assert.deepEqual(calculateTileYield(board, '0,0', 'highland', 2).yield, resources());
});

test('season clock stays in one era and has exactly twelve valid rounds', () => {
  assert.deepEqual(seasonClock(1), { round: 1, season: 'spring', step: 1 });
  assert.deepEqual(seasonClock(4), { round: 4, season: 'summer', step: 1 });
  assert.deepEqual(seasonClock(9), { round: 9, season: 'autumn', step: 3 });
  assert.deepEqual(seasonClock(12), { round: 12, season: 'winter', step: 3 });
  assert.throws(() => seasonClock(13), /Invalid round/);
});

test('all civilizations must commit; committing and stale devices cannot act twice', () => {
  const original = createSession(), before = structuredClone(original);
  const committed = act(original, 'highland', { type: 'ready' });
  assert.equal(committed.clock.round, 1);
  assert.throws(() => act(committed, 'highland', { type: 'clear', tileId: '-1,-1' }), /committed/);
  assert.throws(() => applySessionAction(committed, { type: 'ready', actorId: 'river', expectedRevision: 0 }), /Stale/);
  const next = act(committed, 'river', { type: 'ready' });
  assert.equal(next.clock.round, 2); assert.equal(next.revision, 2);
  assert.deepEqual(next.log.filter(entry => entry.type === 'action').map(entry => entry.round), [1, 1]);
  assert(Object.values(next.players).every(player => !player.ready && player.actionsLeft === 2));
  assert.deepEqual(original, before);
});

test('one civilization action budget is shared by devices and rejects overspending', () => {
  let state = createSession();
  state = act(state, 'highland', { type: 'build', tileId: '-2,-1', structure: 'archive' });
  state = act(state, 'highland', { type: 'build', tileId: '-3,0', structure: 'shrine' });
  assert.throws(() => act(state, 'highland', { type: 'scout', tileId: '0,0' }), /No actions/);
});

test('placements are permanent, cost resources, and cannot appropriate a partner tile', () => {
  const original = createSession();
  const state = act(original, 'highland', { type: 'build', tileId: '-2,-1', structure: 'archive' });
  assert.equal(state.players.highland.stock.materials, 5);
  assert.equal(original.board['-2,-1'].structure, null);
  assert.throws(() => act(state, 'highland', { type: 'build', tileId: '-2,-1', structure: 'archive' }), /free tile/);
  assert.throws(() => act(state, 'highland', { type: 'build', tileId: '2,0', structure: 'farm' }), /your land/);
  assert.throws(() => act(state, 'highland', { type: 'move' }), /Invalid session action/);
});

test('clearing a forest buys materials at a permanent land and ecological cost', () => {
  const original = createSession();
  const forest = Object.values(original.board).find(tile => tile.terrain === 'forest' && tile.exploredBy.includes('river') && tile.owner === 'river' && !tile.structure);
  assert(forest);
  const next = act(original, 'river', { type: 'clear', tileId: forest.id });
  assert.equal(next.board[forest.id].terrain, 'plains'); assert.equal(next.board[forest.id].cleared, true);
  assert.equal(next.players.river.stock.materials, 11); assert.equal(next.ecosystem, 67);
  assert.equal(original.board[forest.id].terrain, 'forest');
  assert.throws(() => act(next, 'river', { type: 'clear', tileId: forest.id }), /forest/);
});

test('scouting reveals a frontier, discovers nodes once, and does not spend a resource twice', () => {
  let state = createSession();
  assert.equal(state.board['-3,2'].node.claimedBy, null);
  state = act(state, 'highland', { type: 'scout', tileId: '-3,2' });
  assert.equal(state.board['-3,2'].node.claimedBy, 'highland');
  assert.equal(state.players.highland.stock.materials, 11);
  assert.throws(() => act(state, 'highland', { type: 'scout', tileId: '-3,2' }), /frontier/);
  assert.throws(() => act(state, 'river', { type: 'scout', tileId: '-4,0' }), /frontier/);
});

test('fog projection redacts terrain, wonders, crisis locations and hidden route usage', () => {
  const state = createSession();
  state.log.push({ type: 'crisis', kind: 'flood', round: 1, warning: 'Flood', tiles: ['-2,0', '-1,-2'] });
  state.log.push({ type: 'discovery', playerId: 'river', round: 1, tileId: '-1,-2', kind: 'natural-wonder' });
  state.logistics.edgeUsage['-1,-2|0,-2'] = 4;
  const view = sessionView(state, 'highland');
  assert.deepEqual(view.board['-1,-2'], { id: '-1,-2', q: -1, r: -2, fogged: true });
  assert.equal(view.log.some(entry => entry.type === 'discovery'), false);
  assert.deepEqual(view.log.find(entry => entry.type === 'crisis').tiles, ['-2,0']);
  assert.deepEqual(view.logistics.edgeUsage, {});
  assert.equal(state.board['-1,-2'].terrain, 'forest');
});

test('logistics requires continuous infrastructure, valid endpoints and explored neighbors', () => {
  const empty = createSession();
  assert.equal(findRoute(empty.board, '-2,0', '2,0', 'highland', 1), null);
  const state = openedCorridor(), path = ['-2,0', '-1,0', '0,0', '1,0', '2,0'];
  assert.deepEqual(findRoute(state.board, '-2,0', '2,0', 'highland', 2), path);
  assert.throws(() => reserveRoute(state.board, {}, ['-2,0', '0,0', '2,0'], '-2,0', '2,0', { food: 1 }, 'highland', 2), /adjacent/);
  assert.throws(() => reserveRoute(state.board, {}, [...path, '1,0', '2,0'], '-2,0', '2,0', { food: 1 }, 'highland', 2), /loop/);
  assert.throws(() => reserveRoute(state.board, {}, path, '2,0', '-2,0', { food: 1 }, 'highland', 2), /endpoints/);
  const broken = structuredClone(state); broken.board['1,0'].infrastructure = null;
  assert.throws(() => reserveRoute(broken.board, {}, path, '-2,0', '2,0', { food: 1 }, 'highland', 2), /working roads/);
});

test('route capacity is shared across directions; failed shipments roll back everything', () => {
  const state = openedCorridor(), path = ['-2,0', '-1,0', '0,0', '1,0', '2,0'];
  const next = act(state, 'highland', { type: 'ship', toPlayerId: 'river', cargo: { materials: 4 }, path });
  assert.equal(next.players.river.stock.materials, state.players.river.stock.materials + 4);
  const before = structuredClone(next);
  assert.throws(() => act(next, 'river', { type: 'ship', toPlayerId: 'highland', cargo: { food: 1 }, path: [...path].reverse() }), /capacity/);
  assert.deepEqual(next, before);
  assert.equal(findRoute(next.board, '2,0', '-2,0', 'river', 2, next.logistics.edgeUsage), null);
  const reset = readyAll(next);
  assert.deepEqual(reset.logistics.edgeUsage, {});
});

test('negative, fractional, unknown or empty cargo cannot manufacture resources', () => {
  const state = openedCorridor(), path = ['-2,0', '-1,0', '0,0'];
  for (const cargo of [{ materials: -1 }, { food: 1.5 }, { gold: 1 }, { food: NaN }, { food: Infinity }, {}]) {
    assert.throws(() => act(state, 'highland', { type: 'contribute', cargo, path }));
  }
  assert.throws(() => act(state, 'highland', { type: 'ship', toPlayerId: 'missing', cargo: { food: 1 }, path }), /community/);
});

test('Great Work needs distinct donors and exact current-stage costs without spilling forward', () => {
  const work = createGreatWork();
  assert.throws(() => contributeGreatWork(work, 'a', { materials: 10 }, 1), /partner/);
  assert.throws(() => contributeGreatWork(work, 'a', { materials: 11 }, 1), /exceeds/);
  assert.throws(() => contributeGreatWork(work, 'a', { food: 1 }, 1), /exceeds/);
  const part = contributeGreatWork(work, 'a', { materials: 6 }, 2);
  const done = contributeGreatWork(part, 'b', { materials: 4 }, 5);
  assert.equal(done.stage, 1); assert.deepEqual(done.delivered, resources());
  assert.deepEqual(done.history[0].contributors.a, resources({ materials: 6 }));
  assert.deepEqual(work.delivered, resources());
  assert.throws(() => contributeGreatWork(work, 'a', { materials: 1 }, 6), /deadline/);
  assert.throws(() => contributeGreatWork(work, 'a', { materials: 1 }, 0), /round/);
  assert.throws(() => contributeGreatWork(work, undefined, { materials: 1 }, 1), /contributor/);
  assert.equal(contributeGreatWork(work, 'constructor', { materials: 1 }, 1).contributors.constructor.materials, 1);
});

test('a routed Great Work contribution consumes inventory and carrying capacity', () => {
  const state = openedCorridor();
  const next = act(state, 'highland', { type: 'contribute', cargo: { materials: 4 }, path: ['-2,0', '-1,0', '0,0'] });
  assert.equal(next.work.delivered.materials, 4);
  assert.equal(next.players.highland.stock.materials, state.players.highland.stock.materials - 4);
  assert.equal(next.logistics.edgeUsage['-1,0|0,0'], 4);
  assert.deepEqual(state.work.delivered, resources());
});

test('Assembly requires consensus; changing a vote settles deadlock with a real tradeoff', () => {
  let state = createSession();
  for (let round = 1; round <= 3; round++) state = readyAll(state);
  assert.equal(state.phase, 'assembly'); assert.equal(state.clock.round, 3);
  assert.throws(() => act(state, 'river', { type: 'build', tileId: '2,1', structure: 'archive' }), /Assembly/);
  state = act(state, 'highland', { type: 'vote', policy: 'conserve' });
  state = act(state, 'river', { type: 'vote', policy: 'mobilize' });
  assert.equal(state.phase, 'assembly');
  const balance = state.ecosystem;
  state = act(state, 'highland', { type: 'vote', policy: 'mobilize' });
  assert.equal(state.clock.round, 4); assert.equal(state.clock.season, 'summer');
  assert.equal(state.ecosystem, balance - 6);
  assert(Object.values(state.players).every(player => player.actionsLeft === 3));
});

test('a deadline is checked after the whole round, and idling loses at round five', () => {
  let state = createSession();
  while (state.phase !== 'ended') {
    if (state.phase === 'assembly') for (const id of Object.keys(state.players)) state = act(state, id, { type: 'vote', policy: 'conserve' });
    else state = readyAll(state);
  }
  assert.equal(state.clock.round, 5); assert.equal(state.outcome.status, 'lost');
  assert.match(state.outcome.reason, /deadline/);
  assert.throws(() => act(state, 'river', { type: 'ready' }), /ended/);
});

test('starvation is a shared loss; nobody gets left behind', () => {
  const state = createSession();
  state.players.highland.stock.food = 0; state.players.highland.health = 1;
  const next = readyAll(state);
  assert.equal(next.outcome.status, 'lost'); assert.match(next.outcome.reason, /survive/);
});

test('industrial pressure triggers a flood that closes the river route next round', () => {
  const state = openedCorridor(); state.ecosystem = 35;
  const next = readyAll(state);
  assert(next.log.some(entry => entry.type === 'crisis' && entry.kind === 'flood'));
  assert.equal(next.board['1,0'].disabledUntil, 3);
  assert.equal(findRoute(next.board, '-2,0', '2,0', 'highland', 3), null);
});

test('summer drought affects exposed farming communities and winter reduces harvests', () => {
  const summer = createSession(); summer.clock = seasonClock(4); summer.ecosystem = 20;
  const before = summer.players.river.stock.food, production = calculatePlayerYield(summer.board, summer.players.river, 4).yield.food;
  const resolved = readyAll(summer);
  assert.equal(resolved.players.river.stock.food, before + production - 1 - 2);
  assert(resolved.log.some(entry => entry.kind === 'drought'));
  const winter = createSession(); winter.clock = seasonClock(10); winter.work.complete = true;
  const frozen = readyAll(winter);
  assert.equal(frozen.players.river.stock.food, before + Math.floor(production / 2) - 2);
});

test('the legal twelve-round demo completes every milestone and keeps every community alive', () => {
  const { state, rounds } = runCooperativeDemo();
  assert.equal(rounds.length, 12); assert.equal(state.clock.round, 12);
  assert.equal(state.era, 'age-of-rivers'); assert.equal(state.outcome.status, 'won');
  assert.deepEqual(state.work.history.map(stage => stage.round), [4, 6, 9]);
  assert(state.work.history.every(stage => Object.keys(stage.contributors).length >= 2));
  assert(Object.values(state.players).every(player => player.health === 3));
  assert.equal(state.ecosystem, 96);
  assert.throws(() => contributeGreatWork(state.work, 'highland', { food: 1 }, 12), /complete/);
});

test('finishing the work does not bypass winter survival, balance or universal participation', () => {
  const { state } = runCooperativeDemo();
  for (const failure of ['balance', 'participation']) {
    const altered = structuredClone(state);
    altered.phase = 'planning'; altered.outcome = null; altered.clock = seasonClock(12);
    for (const player of Object.values(altered.players)) player.ready = false;
    if (failure === 'balance') altered.ecosystem = 20;
    else altered.players.extra = { ...altered.players.river, id: 'extra', ready: false };
    assert.equal(readyAll(altered).outcome.status, 'lost');
  }
});

test('roster validation and serialization preserve one shared session', () => {
  assert.throws(() => createSession([{ id: 'a', civilization: 'highland' }]), /2–3/);
  assert.throws(() => createSession([{ id: 'a', civilization: 'highland' }, { id: 'a', civilization: 'river' }]), /duplicate/);
  assert.throws(() => createSession([{ id: true, civilization: 'highland' }, { id: 'b', civilization: 'river' }]), /Invalid/);
  assert.throws(() => createSession([{ id: 'a', civilization: 'river' }, { id: 'b', civilization: 'woodland' }]), /Include/);
  const state = createSession([{ id: 'a', civilization: 'highland' }, { id: 'b', civilization: 'river' }, { id: 'c', civilization: 'woodland' }]);
  assert.deepEqual(JSON.parse(JSON.stringify(state)), state);
  assert.throws(() => applySessionAction(state, { actorId: 'unknown', expectedRevision: 0, type: 'ready' }), /Unknown/);
});
