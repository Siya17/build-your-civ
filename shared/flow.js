// The student path: one task per screen, in this order. "seen" steps are reading screens
// remembered on this device; "team" steps are done when the shared team state says so.
import { eventPlan, textFields, treeIssues, writableFields, choicesValid, reflectionFields } from './game.js';

import { lessonProfile, shortLesson, beliefExplanationRequired } from './lesson.js';

export const chapters = ['start','place','tech','civic','event','talk','present','reveal'];
export const steps = [
  ['intro1','start','seen'], ['intro2','start','seen'],
  ['choosePlace','place','team'], ['where','place','seen'], ['land','place','seen'], ['climate','place','seen'],
  ['resources','place','seen'], ['developmentPreview','place','seen'], ['challenge','place','seen'], ['prices','place','seen'], ['intro3','place','seen'],
  ['techIntro','tech','seen'], ['techTree','tech','team'], ['techReview','tech','seen'],
  ['civicIntro','civic','seen'], ['civicTree','civic','team'], ['civicReview','civic','seen'],
  ['eventRoll','event','team'], ['eventCard','event','seen'], ['eventResolve','event','team'], ['eventResult','event','seen'], ['eventAnswer','event','team'],
  ['civName','talk','team'], ['geographyAnswer','talk','team'], ['government','talk','team'], ['economy','talk','team'], ['beliefs','talk','team'],
  ['shapeAnswer','talk','team'], ['notChosenAnswer','talk','team'], ['check','talk','seen'], ['submit','talk','team'],
  ['poster','present','seen'], ['wait','present','team'], ['shortComplete','present','seen'],
  ['revealPlace','reveal','seen'], ['revealCompare','reveal','seen'], ['historyDifferenceAnswer','reveal','team'], ['historyWorkAnswer','reveal','team'], ['historyOmissionAnswer','reveal','team'], ['reflectionReview','reveal','seen'], ['reflectionSubmit','reveal','team'], ['takeaway','reveal','seen']
].map(([id, chapter, kind]) => ({ id, chapter, kind }));
export const stepById = Object.fromEntries(steps.map(step => [step.id, step]));
// The writing step for each answer field (government, economy and beliefs carry chips too).
export const fieldStep = { eventAnswer:'eventAnswer', geographyAnswer:'geographyAnswer', governmentAnswer:'government', economyAnswer:'economy', beliefAnswer:'beliefs', shapeAnswer:'shapeAnswer', notChosenAnswer:'notChosenAnswer', civName:'civName' };
export const stepField = Object.fromEntries(Object.entries(fieldStep).map(([field, step]) => [step, field]));
const talkIndex = steps.findIndex(step => step.id === 'submit');

const filled = (state, key) => !!String(state[key] ?? '').trim();
// Shared milestones never depend on what one student's device has read. An event may
// empty a tree, so the roll also records that both trees were ready beforehand.
export function teamMilestones(team) {
  const state = team.state;
  const issues = treeIssues(state);
  return {
    region:!!state.mapPoint,
    tech:!!state.event || (state.tech.length > 0 && !issues.some(issue => issue.tree === 'tech')),
    civic:!!state.event || (state.civic.length > 0 && !issues.some(issue => issue.tree === 'civic')),
    event:!!state.event,
    eventResolved:!!state.event && eventPlan(state).resolved,
    eventAnswer:filled(state, 'eventAnswer'),
    civName:filled(state, 'civName'),
    geographyAnswer:filled(state, 'geographyAnswer'),
    government:choicesValid(state,'government') && filled(state, 'governmentAnswer'),
    economy:choicesValid(state,'economy') && filled(state, 'economyAnswer'),
    beliefs:choicesValid(state,'beliefs') && (!beliefExplanationRequired(state,team.lessonVersion) || filled(state, 'beliefAnswer')),
    shapeAnswer:filled(state, 'shapeAnswer'),
    notChosenAnswer:filled(state, 'notChosenAnswer'),
    submitted:!!team.submittedAt,
    reflection:!!state.reflection?.submittedAt
  };
}
// Steps that do not apply to this team are skipped entirely.
export function stepApplies(id, team) {
  const state = team.state;
  if (lessonProfile(team.lessonVersion).omittedSteps.includes(id)) return false;
  if (id === 'shortComplete') return shortLesson(team);
  if (id === 'choosePlace') return !state.fixedPoint;
  if (['eventCard','eventResult','eventResolve'].includes(id) && !state.event) return false;
  if (id === 'eventResolve') {
    const plan = eventPlan(state);
    // Keep the decision screen in the path after its last gain/loss, so Next
    // still reaches the result rather than jumping to the beginning.
    return plan.kind !== 'none' || !!state.event.choice;
  }
  return true;
}
export function stepDone(id, team, seen = new Set(), reveal = false) {
  const state = team.state, index = steps.findIndex(step => step.id === id);
  if (id === 'choosePlace') return !!state.mapPoint;
  // Old submitted saves have no event in the new rules. They must wait here for the
  // teacher to reopen them rather than unlock screens that need an event result.
  if (['eventRoll','eventCard','eventResolve','eventResult'].includes(id) && !state.event) return false;
  // Submission finishes shared work. Reading screens still belong to this device,
  // including the welcome screens for a student who joins a submitted team late.
  if (team.submittedAt && index >= 0 && index <= talkIndex && stepById[id].kind === 'team') return true;
  switch (id) {
    case 'choosePlace': return !!state.mapPoint;
    case 'techTree': case 'civicTree': {
      const tree = id === 'techTree' ? 'tech' : 'civic';
      return !!state.event || (state[tree].length > 0 && !treeIssues(state).some(issue => issue.tree === tree));
    }
    case 'techReview': case 'civicReview': return !!state.event || seen.has(id);
    case 'eventRoll': return !!state.event;
    case 'eventResolve': return !!state.event && eventPlan(state).resolved;
    case 'eventResult': return seen.has(id) || filled(state, 'eventAnswer');
    case 'civName': return filled(state, 'civName');
    case 'government': return choicesValid(state,'government') && filled(state, 'governmentAnswer');
    case 'economy': return choicesValid(state,'economy') && filled(state, 'economyAnswer');
    case 'beliefs': return choicesValid(state,'beliefs') && (!beliefExplanationRequired(state,team.lessonVersion) || filled(state, 'beliefAnswer'));
    case 'submit': return !!team.submittedAt;
    case 'wait': return shortLesson(team) ? !!team.submittedAt : !!reveal;
    case 'reflectionSubmit': return !!state.reflection?.submittedAt;
  }
  if (reflectionFields.includes(id)) return !!state.reflection?.[id]?.trim();
  if (textFields.includes(id)) return filled(state, id);
  return seen.has(id);
}
const applicable = team => steps.filter(step => stepApplies(step.id, team));
// The first step on this device that is not finished yet.
export function nextStep(team, seen, reveal) {
  return applicable(team).find(step => !stepDone(step.id, team, seen, reveal)) ?? applicable(team).at(-1);
}
// A step can be opened when every applicable step before it is finished.
export function stepAvailable(id, team, seen, reveal) {
  const list = applicable(team), index = list.findIndex(step => step.id === id);
  return index >= 0 && list.slice(0, index).every(step => stepDone(step.id, team, seen, reveal));
}
export const neighbourStep = (id, team, offset) => {
  const list = applicable(team), index = list.findIndex(step => step.id === id);
  return list[index + offset]?.id ?? null;
};
// The furthest step the TEAM has reached (ignores this device's reading screens).
// Used to offer "jump to your team" and by the teacher dashboard.
export function teamStep(team, reveal) {
  const everything = new Set(steps.filter(step => step.kind === 'seen').map(step => step.id));
  return nextStep(team, everything, reveal);
}
// True once the team has done something real: a card, the event or an answer.
export const teamStarted = team => { const state = team.state; return !!(state.tech.length || state.civic.length || state.event || writableFields.some(key => state[key].trim())); };
export function chapterOf(id) { return stepById[id]?.chapter ?? 'start'; }
