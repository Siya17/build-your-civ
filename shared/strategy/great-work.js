import { resources, addResources, resourceTotal, RESOURCES } from './resources.js';

export const GREAT_WORK_STAGES = Object.freeze([
  { id: 'foundations', name: 'Raise the shared refuge', cost: { materials: 10 }, deadline: 5 },
  { id: 'memory', name: 'Preserve a living archive', cost: { knowledge: 6, culture: 4 }, deadline: 9 },
  { id: 'reserves', name: 'Stock the winter sanctuary', cost: { food: 10, materials: 4 }, deadline: 12 }
]);

export function createGreatWork(site = '0,0') {
  return { id: 'winter-sanctuary', site, stage: 0, delivered: resources(), contributors: {}, history: [], complete: false };
}

export function contributeGreatWork(previous, playerId, cargo, round) {
  if (typeof playerId !== 'string' || !/^[A-Za-z][A-Za-z0-9_-]{0,39}$/.test(playerId) || !Number.isInteger(round) || round < 1 || round > GREAT_WORK_STAGES.at(-1).deadline) throw new Error('Invalid contributor or round');
  if (previous.complete) throw new Error('Great Work is already complete');
  const stage = GREAT_WORK_STAGES[previous.stage], amount = resources(cargo), cost = resources(stage.cost);
  if (round > stage.deadline) throw new Error('Great Work deadline has passed');
  if (!resourceTotal(amount)) throw new Error('Contribution must be positive');
  if (RESOURCES.some(key => amount[key] > cost[key] - previous.delivered[key])) throw new Error('Contribution exceeds the current milestone');
  const next = structuredClone(previous);
  next.delivered = addResources(next.delivered, amount);
  const priorContribution = Object.hasOwn(next.contributors, playerId) ? next.contributors[playerId] : resources();
  next.contributors[playerId] = addResources(priorContribution, amount);
  const paid = RESOURCES.every(key => next.delivered[key] === cost[key]);
  // Do not allow a sole donor to fill a stage and permanently lock out a partner.
  if (paid && Object.keys(next.contributors).length < 2) throw new Error('Leave part of this milestone for a partner');
  if (paid && Object.keys(next.contributors).length >= 2) {
    next.history.push({ id: stage.id, round, delivered: next.delivered, contributors: next.contributors });
    next.stage += 1;
    next.complete = next.stage === GREAT_WORK_STAGES.length;
    next.delivered = resources(); next.contributors = {};
  }
  return next;
}

export const greatWorkMissedDeadline = (work, round) => !work.complete && round >= GREAT_WORK_STAGES[work.stage].deadline;

export function greatWorkContributors(work) {
  return [...new Set(work.history.flatMap(stage => Object.keys(stage.contributors)))];
}
