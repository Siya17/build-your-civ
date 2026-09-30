import { resources, addResources, spendResources } from './resources.js';
import { adjacentTiles, createBoard, hexDistance, STRUCTURES, CIVILIZATIONS, calculatePlayerYield } from './hex.js';
import { INFRASTRUCTURE, reserveRoute } from './logistics.js';
import { createGreatWork, contributeGreatWork, greatWorkMissedDeadline, greatWorkContributors } from './great-work.js';

export const SEASONS = Object.freeze(['spring', 'summer', 'autumn', 'winter']);
export const SESSION_RULES = Object.freeze({ rounds: 12, roundsPerSeason: 3, actions: 2, minimumBalance: 30 });
export const ASSEMBLY_POLICIES = Object.freeze({
  conserve: { balance: 8, actions: 1 },
  mobilize: { balance: -6, actions: 3 }
});

export function seasonClock(round) {
  if (!Number.isInteger(round) || round < 1 || round > SESSION_RULES.rounds) throw new Error('Invalid round');
  return { round, season: SEASONS[Math.floor((round - 1) / SESSION_RULES.roundsPerSeason)], step: (round - 1) % SESSION_RULES.roundsPerSeason + 1 };
}

function reveal(board, tileId, playerId) {
  const discovered = [];
  for (const tile of [board[tileId], ...adjacentTiles(board, tileId)]) {
    if (!tile.exploredBy.includes(playerId)) { tile.exploredBy.push(playerId); discovered.push(tile); }
  }
  return discovered;
}

// This first scenario supports 2–3 civilizations. Every device in a civilization
// shares its single action budget and ready flag; there is one clock for the session.
export function createSession(roster = [{ id: 'highland', civilization: 'highland' }, { id: 'river', civilization: 'river' }]) {
  if (!Array.isArray(roster) || roster.length < 2 || roster.length > 3) throw new Error('The refuge scenario needs 2–3 civilizations');
  const ids = new Set(), civilizations = new Set();
  for (const player of roster) {
    if (!player || typeof player.id !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(player.id) || ids.has(player.id)) throw new Error('Invalid or duplicate civilization ID');
    if (!Object.hasOwn(CIVILIZATIONS, player.civilization) || civilizations.has(player.civilization)) throw new Error('Choose distinct civilizations');
    ids.add(player.id); civilizations.add(player.civilization);
  }
  if (!civilizations.has('highland') || !civilizations.has('river')) throw new Error('Include the Highland Keepers and River Gardeners');
  const board = createBoard(), homes = { highland: '-2,0', river: '2,0', woodland: '0,3' };
  const starters = { highland: ['-2,1', 'mine'], river: ['2,-1', 'farm'], woodland: ['0,2', 'shrine'] };
  const players = Object.fromEntries(roster.map(({ id, civilization }) => [id, {
    id, civilization, settlement: homes[civilization], stock: resources({ food: 8, materials: 8 }), health: 3, actionsLeft: SESSION_RULES.actions, ready: false
  }]));
  for (const player of Object.values(players)) {
    const home = board[player.settlement];
    home.owner = player.id; home.structure = 'settlement';
    for (const tile of adjacentTiles(board, home.id)) if (!tile.owner && tile.id !== '0,0') tile.owner = player.id;
    const [id, structure] = starters[player.civilization];
    board[id].owner = player.id; board[id].structure = structure;
    reveal(board, home.id, player.id);
  }
  // Diplomatic starting locations are public; the surrounding terrain still needs scouting.
  for (const player of Object.values(players)) {
    for (const partner of Object.values(players)) {
      const home = board[partner.settlement];
      if (!home.exploredBy.includes(player.id)) home.exploredBy.push(player.id);
    }
  }
  return { schemaVersion: 1, revision: 0, era: 'age-of-rivers', phase: 'planning', clock: seasonClock(1), players, board, ecosystem: 72, work: createGreatWork(), logistics: { edgeUsage: {}, deliveries: [] }, assembly: null, outcome: null, log: [] };
}

function log(state, type, detail) { state.log.push({ round: state.clock.round, type, ...detail }); }
function end(state, status, reason) {
  state.phase = 'ended'; state.outcome = { status, reason, round: state.clock.round };
  log(state, 'outcome', state.outcome);
}

function beginNextRound(state, actionBudget = SESSION_RULES.actions) {
  state.clock = seasonClock(state.clock.round + 1);
  state.phase = 'planning'; state.assembly = null;
  state.logistics = { edgeUsage: {}, deliveries: [] };
  for (const player of Object.values(state.players)) { player.actionsLeft = actionBudget; player.ready = false; }
}

// Resolution order is fixed: yields -> upkeep -> ecological impact -> forecast
// crisis -> survival/deadlines -> final shared victory -> assembly/next round.
function resolveRound(state) {
  state.phase = 'resolution';
  const { round, season } = state.clock;
  for (const player of Object.values(state.players)) {
    const result = calculatePlayerYield(state.board, player, round), amount = result.yield;
    if (season === 'winter') amount.food = Math.floor(amount.food / 2);
    if (season === 'autumn' && !Object.values(state.board).some(tile => tile.owner === player.id && tile.structure === 'storehouse')) amount.food = Math.max(0, amount.food - 1);
    player.stock = addResources(player.stock, amount);
    const upkeep = season === 'winter' ? 2 : 1;
    if (player.stock.food < upkeep) { player.health -= 1; player.stock.food = 0; }
    else player.stock.food -= upkeep;
    state.ecosystem -= result.impact;
    log(state, 'harvest', { playerId: player.id, yield: amount, upkeep, health: player.health });
  }
  // Untouched forests remain a public good, including forests hosting shrines.
  const forests = Object.values(state.board).filter(tile => tile.terrain === 'forest').length;
  state.ecosystem = Math.min(100, Math.max(0, state.ecosystem + Math.min(2, Math.floor(forests / 3))));
  if (season === 'spring' && state.ecosystem < 40) {
    const affected = Object.values(state.board).filter(tile => ['river', 'wetland'].includes(tile.terrain));
    for (const tile of affected) {
      tile.disabledUntil = round + 1;
      if (tile.owner) state.players[tile.owner].stock.materials = Math.max(0, state.players[tile.owner].stock.materials - 1);
    }
    log(state, 'crisis', { kind: 'flood', tiles: affected.map(tile => tile.id), warning: 'Floodplain infrastructure closes through the following round.' });
  }
  if (season === 'summer' && state.ecosystem < 25) {
    for (const player of Object.values(state.players)) {
      const exposed = Object.values(state.board).some(tile => tile.owner === player.id && tile.structure === 'farm' && tile.terrain === 'plains');
      if (exposed) player.stock.food = Math.max(0, player.stock.food - 2);
    }
    log(state, 'crisis', { kind: 'drought', warning: 'Exposed plains farms lose two stored food.' });
  }
  if (Object.values(state.players).some(player => player.health <= 0)) return end(state, 'lost', 'A community could not survive');
  if (state.ecosystem <= 0) return end(state, 'lost', 'The ecosystem collapsed');
  if (greatWorkMissedDeadline(state.work, round)) return end(state, 'lost', 'A Great Work milestone missed its deadline');
  if (round === SESSION_RULES.rounds) {
    const contributors = greatWorkContributors(state.work);
    const won = state.work.complete && state.ecosystem >= SESSION_RULES.minimumBalance && Object.keys(state.players).every(id => contributors.includes(id));
    return end(state, won ? 'won' : 'lost', won ? 'Every community can enter the next era together' : 'The refuge or ecological recovery is incomplete');
  }
  if (round % SESSION_RULES.roundsPerSeason === 0) {
    state.phase = 'assembly'; state.assembly = { afterRound: round, votes: {} };
  } else beginNextRound(state);
}

function accessibleTile(state, action, player) {
  const tile = Object.hasOwn(state.board, action.tileId) && state.board[action.tileId];
  if (!tile || !tile.exploredBy.includes(player.id)) throw new Error('Tile must be explored');
  if (tile.owner && tile.owner !== player.id) throw new Error('Build on your land or neutral land');
  if (tile.disabledUntil >= state.clock.round) throw new Error('Tile is closed by a crisis');
  // Construction crews operate within two hexes, or extend their committed land.
  if (hexDistance(tile, state.board[player.settlement]) > 2 && !adjacentTiles(state.board, tile.id).some(other => other.owner === player.id)) throw new Error('Construction must extend your settlement or land');
  return tile;
}

/** Pure authoritative reducer. expectedRevision prevents double spends and stale
 * readiness across devices. The HTTP adapter must derive actorId from authentication.
 * A rejected action never changes previous, including nested tiles and cargo usage.
 * @param {import('./types.js').SessionState} previous
 * @param {import('./types.js').SessionAction} action
 * @returns {import('./types.js').SessionState}
 */
export function applySessionAction(previous, action) {
  if (!action || action.expectedRevision !== previous.revision) throw new Error('Stale session revision; refresh and retry');
  if (typeof action.actorId !== 'string' || !Object.hasOwn(previous.players, action.actorId)) throw new Error('Unknown civilization');
  if (previous.phase === 'ended') throw new Error('The session has ended');
  const state = structuredClone(previous), player = state.players[action.actorId];
  // Record the originating round before readiness or agreement advances the clock.
  log(state, 'action', { playerId: player.id, action: action.type });
  if (state.phase === 'assembly') {
    if (action.type !== 'vote' || !Object.hasOwn(ASSEMBLY_POLICIES, action.policy)) throw new Error('Choose an Assembly policy');
    state.assembly.votes[player.id] = action.policy;
    const votes = Object.values(state.assembly.votes);
    if (votes.length === Object.keys(state.players).length && new Set(votes).size === 1) {
      const policy = ASSEMBLY_POLICIES[action.policy];
      state.ecosystem = Math.min(100, Math.max(0, state.ecosystem + policy.balance));
      log(state, 'assembly', { policy: action.policy });
      if (!state.ecosystem) end(state, 'lost', 'The ecosystem collapsed');
      else beginNextRound(state, policy.actions);
    }
  } else {
    if (state.phase !== 'planning') throw new Error('Wait for planning');
    if (player.ready) throw new Error('Your civilization already committed this round');
    if (action.type === 'ready') {
      player.ready = true;
      if (Object.values(state.players).every(member => member.ready)) resolveRound(state);
    } else {
      if (player.actionsLeft <= 0) throw new Error('No actions left this round');
      if (action.type === 'scout') {
        const tile = Object.hasOwn(state.board, action.tileId) && state.board[action.tileId];
        if (!tile || tile.exploredBy.includes(player.id) || !adjacentTiles(state.board, tile.id).some(other => other.exploredBy.includes(player.id))) throw new Error('Scout an unexplored frontier hex');
        for (const discovered of reveal(state.board, tile.id, player.id)) {
          if (!discovered.node || discovered.node.claimedBy) continue;
          player.stock = addResources(player.stock, resources(discovered.node.reward)); discovered.node.claimedBy = player.id;
          log(state, 'discovery', { playerId: player.id, tileId: discovered.id, kind: discovered.node.kind });
        }
      } else if (action.type === 'build') {
        const tile = accessibleTile(state, action, player), rule = STRUCTURES[action.structure];
        if (!Object.hasOwn(STRUCTURES, action.structure) || tile.structure || tile.id === state.work.site || !rule.terrains.includes(tile.terrain)) throw new Error('Structure does not fit this free tile');
        player.stock = spendResources(player.stock, resources(rule.cost));
        tile.structure = action.structure; tile.owner = player.id;
      } else if (action.type === 'infrastructure') {
        const tile = accessibleTile(state, action, player), rule = INFRASTRUCTURE[action.infrastructure];
        if (!Object.hasOwn(INFRASTRUCTURE, action.infrastructure) || tile.infrastructure || !rule.terrains.includes(tile.terrain)) throw new Error('Infrastructure does not fit this tile');
        player.stock = spendResources(player.stock, resources(rule.cost)); tile.infrastructure = action.infrastructure;
        // A neutral transport corridor stays neutral and is usable by every partner.
      } else if (action.type === 'clear') {
        const tile = accessibleTile(state, action, player);
        if (tile.terrain !== 'forest' || tile.structure || tile.node?.kind === 'natural-wonder') throw new Error('Clear an unoccupied forest');
        tile.terrain = 'plains'; tile.cleared = true; tile.owner = player.id;
        player.stock = addResources(player.stock, resources({ materials: 3 })); state.ecosystem = Math.max(0, state.ecosystem - 5);
        if (!state.ecosystem) end(state, 'lost', 'The ecosystem collapsed');
      } else if (action.type === 'ship' || action.type === 'contribute') {
        const recipient = action.type === 'ship' && state.players[action.toPlayerId];
        if (action.type === 'ship' && (!Object.hasOwn(state.players, action.toPlayerId) || recipient.id === player.id)) throw new Error('Choose another community');
        const amount = resources(action.cargo), destination = recipient ? recipient.settlement : state.work.site;
        state.logistics.edgeUsage = reserveRoute(state.board, state.logistics.edgeUsage, action.path, player.settlement, destination, amount, player.id, state.clock.round);
        player.stock = spendResources(player.stock, amount);
        if (recipient) recipient.stock = addResources(recipient.stock, amount);
        else state.work = contributeGreatWork(state.work, player.id, amount, state.clock.round);
        state.logistics.deliveries.push({ from: player.id, to: recipient ? recipient.id : state.work.id, cargo: amount, path: [...action.path] });
      } else throw new Error('Invalid session action');
      player.actionsLeft -= 1;
    }
  }
  state.revision += 1;
  return state;
}

// Use only when projecting a view for a civilization. Raw authoritative state
// contains hidden terrain; sending it to clients would leak the exploration puzzle.
/** @returns {import('./types.js').SessionView} */
export function sessionView(state, playerId) {
  if (!Object.hasOwn(state.players, playerId)) throw new Error('Unknown civilization');
  const view = structuredClone(state);
  view.board = Object.fromEntries(Object.values(view.board).map(tile => [tile.id,
    tile.exploredBy.includes(playerId) ? tile : { id: tile.id, q: tile.q, r: tile.r, fogged: true }
  ]));
  // Public crisis warnings keep the kind, but do not expose unrevealed affected hexes.
  view.log = view.log.filter(entry => entry.type !== 'discovery' || entry.playerId === playerId)
    .map(entry => entry.type === 'crisis' ? { ...entry, tiles: entry.tiles?.filter(id => state.board[id].exploredBy.includes(playerId)) } : entry);
  view.logistics.deliveries = view.logistics.deliveries.filter(delivery => delivery.from === playerId || delivery.to === playerId);
  view.logistics.edgeUsage = Object.fromEntries(Object.entries(view.logistics.edgeUsage).filter(([edge]) => edge.split('|').every(id => state.board[id].exploredBy.includes(playerId))));
  return view;
}
