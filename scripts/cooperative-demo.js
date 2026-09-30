import { pathToFileURL } from 'node:url';
import { createSession, applySessionAction } from '../shared/strategy/turn-manager.js';
import { findRoute } from '../shared/strategy/logistics.js';
import { resources, resourceTotal } from '../shared/strategy/resources.js';

// A legal cooperative playthrough, using only public reducer actions. It doubles
// as a balance smoke test; no stocks, readiness flags or deadlines are edited.
export function runCooperativeDemo() {
  let state = createSession();
  const act = (actorId, action) => {
    if (action.type === 'ship' || action.type === 'contribute') {
      const to = action.type === 'ship' ? state.players[action.toPlayerId].settlement : state.work.site;
      action = { ...action, path: findRoute(state.board, state.players[actorId].settlement, to, actorId, state.clock.round, state.logistics.edgeUsage, resourceTotal(resources(action.cargo))) };
    }
    state = applySessionAction(state, { ...action, actorId, expectedRevision: state.revision });
  };
  const plan = {
    1: [['highland', { type: 'scout', tileId: '0,0' }], ['highland', { type: 'infrastructure', tileId: '-1,0', infrastructure: 'road' }], ['river', { type: 'scout', tileId: '0,0' }], ['river', { type: 'infrastructure', tileId: '1,0', infrastructure: 'bridge' }]],
    2: [['highland', { type: 'infrastructure', tileId: '0,0', infrastructure: 'road' }], ['highland', { type: 'contribute', cargo: { materials: 4 } }], ['river', { type: 'build', tileId: '2,1', structure: 'archive' }], ['river', { type: 'build', tileId: '3,0', structure: 'shrine' }]],
    3: [['highland', { type: 'ship', toPlayerId: 'river', cargo: { materials: 4 } }], ['highland', { type: 'build', tileId: '-2,-1', structure: 'archive' }]],
    4: [['highland', { type: 'contribute', cargo: { materials: 2 } }], ['river', { type: 'contribute', cargo: { materials: 4 } }]],
    5: [['highland', { type: 'build', tileId: '-3,0', structure: 'shrine' }], ['highland', { type: 'contribute', cargo: { knowledge: 2 } }], ['river', { type: 'contribute', cargo: { knowledge: 2, culture: 2 } }]],
    6: [['highland', { type: 'contribute', cargo: { knowledge: 2, culture: 2 } }]],
    7: [['highland', { type: 'contribute', cargo: { materials: 4 } }], ['river', { type: 'contribute', cargo: { food: 4 } }]],
    8: [['river', { type: 'contribute', cargo: { food: 4 } }]],
    9: [['river', { type: 'contribute', cargo: { food: 2 } }], ['river', { type: 'ship', toPlayerId: 'highland', cargo: { food: 2 } }]],
    10: [['river', { type: 'ship', toPlayerId: 'highland', cargo: { food: 4 } }]],
    11: [['river', { type: 'ship', toPlayerId: 'highland', cargo: { food: 2 } }]]
  };
  const rounds = [];
  while (state.phase !== 'ended') {
    const clock = { ...state.clock };
    for (const [actorId, action] of plan[clock.round] ?? []) act(actorId, action);
    for (const id of Object.keys(state.players)) act(id, { type: 'ready' });
    rounds.push({ round: clock.round, season: clock.season, balance: state.ecosystem, milestones: state.work.history.length, highlandFood: state.players.highland.stock.food });
    if (state.phase === 'assembly') for (const id of Object.keys(state.players)) act(id, { type: 'vote', policy: 'conserve' });
  }
  return { state, rounds };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { state, rounds } = runCooperativeDemo();
  console.table(rounds);
  console.log(`${state.outcome.status.toUpperCase()}: ${state.outcome.reason}.`);
  if (state.outcome.status !== 'won') process.exitCode = 1;
}
