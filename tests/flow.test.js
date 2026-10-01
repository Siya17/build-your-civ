import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, normalizeState, applyAction } from '../shared/game.js';
import { steps, nextStep, stepAvailable, stepApplies, stepDone, teamStep, teamMilestones } from '../shared/flow.js';
import { dictionary } from '../shared/i18n.js';
import { studentPage } from '../public/screens.js';
import { posterMarkup } from '../public/poster.js';

const dice = (...values) => () => values.shift();
const start = point => normalizeState({ ...initialState(), mapPoint:point, fixedPoint:point });
const team = state => ({ id:1, name:'Team G', createdAt:'2026-10-01', state, submittedAt:null, version:1 });
const seenAll = new Set(steps.filter(step => step.kind === 'seen').map(step => step.id));
const page = (t, step, { lang = 'en', ui = {}, seen = seenAll, reveal = false } = {}) => studentPage({ team:t, lang, L:dictionary[lang], ui:{ sub:null, selected:'', ...ui }, step, seen, reveal, sync:'saved', roster:[], compact:false, teamStepId:teamStep(t, reveal).id, rolling:null, anim:null, flash:null });
const primaries = html => (html.match(/class="btn primary/g) || []).length;

// A whole run for Team G, from an empty team to a submitted one.
function fullRun() {
  let state = start('G');
  const act = (action, die) => { state = applyAction(state, action, { rollDie:die }); };
  for (const id of ['pottery','irrigation','writing','husbandry','archery']) act({ type:'pick', tree:'tech', id });
  act({ type:'pick', tree:'tech', id:'horseback' }, dice(5));
  for (const id of ['laws','trade','empire']) act({ type:'pick', tree:'civic', id });
  act({ type:'eventRoll', confirm:{ tech:[...state.tech], civic:[...state.civic] } }, dice(4));
  act({ type:'eventLose', tree:'civic', id:'empire', index:0 });
  act({ type:'eventLose', tree:'civic', id:'trade', index:1 });
  for (const key of ['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer']) act({ type:'field', key, value:'Our answer.' });
  act({ type:'chip', key:'government', value:'council' });
  act({ type:'chip', key:'economy', value:'farming', on:true });
  act({ type:'chip', key:'beliefs', value:'nature' });
  return state;
}

test('a new team starts at the welcome screens; a fixed place skips choosing a letter', () => {
  const fresh = team(start('G'));
  assert.equal(nextStep(fresh, new Set(), false).id, 'intro1');
  assert(!stepApplies('choosePlace', fresh));
  assert.equal(nextStep(fresh, seenAll, false).id, 'techTree');
  const free = team(normalizeState(initialState()));
  assert.equal(nextStep(free, seenAll, false).id, 'choosePlace');
  assert(!stepAvailable('techTree', fresh, new Set(), false), 'cannot skip ahead past unread screens');
});

test('the steps open one after another during a full run, and the reveal waits for the teacher', () => {
  const state = fullRun();
  const done = { ...team(state), submittedAt:'2026-10-01 10:00' };
  assert.equal(nextStep(team(state), seenAll, false).id, 'submit');
  assert.equal(nextStep(done, seenAll, false).id, 'wait');
  assert(!stepDone('wait', done, seenAll, false));
  assert(stepAvailable('revealPlace', done, seenAll, true));
  assert(!stepAvailable('revealPlace', done, seenAll, false));
  // An event that needs no decision skips the decision screen.
  let safe = start('G');
  for (const id of ['pottery','irrigation','mining','masonry']) safe = applyAction(safe, { type:'pick', tree:'tech', id });
  safe = applyAction(safe, { type:'pick', tree:'civic', id:'laws' });
  safe = applyAction(safe, { type:'eventRoll', confirm:{ tech:[...safe.tech], civic:['laws'] } }, { rollDie:dice(1) });
  assert(!stepApplies('eventResolve', team(safe)));
  assert.equal(teamStep(team(safe), false).id, 'eventAnswer');
});

test('every screen has one task: exactly one primary button, in both languages', () => {
  const run = fullRun();
  const states = { early:start('G'), building:run, done:run };
  for (const lang of ['en','ja']) {
    for (const step of steps) {
      if (step.id === 'choosePlace') continue;
      const t = step.chapter === 'reveal' || step.id === 'wait' || step.id === 'poster' ? { ...team(states.done), submittedAt:'2026-10-01' } : ['intro1','intro2','intro3','where','land','climate','resources','challenge','prices','techIntro','techTree','techReview','civicIntro','civicTree','civicReview'].includes(step.id) ? team(states.early) : team(states.building);
      const html = page(t, step.id, { lang, reveal:step.chapter === 'reveal' || step.id === 'wait' });
      if (step.id === 'eventRoll' && !t.state.event) continue;
      assert.equal(primaries(html), 1, `${lang} ${step.id} should have one primary button`);
      assert.doesNotMatch(html, /\[\[|\{[^{}]*\|[^{}]*\}|undefined|NaN/, `${lang} ${step.id} shows raw markup or a missing value`);
    }
  }
  const choose = team(normalizeState(initialState()));
  assert.equal(primaries(page(choose, 'choosePlace')), 1);
});

test('the card screen, the roll screen and the event decision each keep one primary button', () => {
  const t = team(start('G'));
  for (const id of ['pottery','horseback','irrigation']) {
    const html = page(t, 'techTree', { ui:{ sub:{ kind:'card', tree:'tech', id } } });
    assert.equal(primaries(html), id === 'pottery' || id === 'irrigation' ? 1 : 1);
  }
  assert(page(t, 'techTree', { ui:{ sub:{ kind:'card', tree:'tech', id:'horseback' } } }).includes(dictionary.en.blockedParent));
  let state = start('G');
  for (const id of ['pottery','writing']) state = applyAction(state, { type:'pick', tree:'tech', id });
  state = applyAction(state, { type:'pick', tree:'civic', id:'laws' });
  state = applyAction(state, { type:'eventRoll', confirm:{ tech:[...state.tech], civic:['laws'] } }, { rollDie:dice(3) });
  const choose = page(team(state), 'eventResolve');
  assert.equal(primaries(choose), 1);
  assert.match(choose, /data-select="choice:trade"/);
  assert.match(choose, /data-select="choice:fight"/);
  assert.match(choose, /data-act="choice:" disabled/, 'the final choice needs a selection first');
  const confirmChoice = page(team(state), 'eventResolve', { ui:{ selected:'choice:trade' } });
  assert.equal(primaries(confirmChoice), 1);
  assert.match(confirmChoice, /data-act="choice:trade"/);
  assert.doesNotMatch(confirmChoice, /data-act="choice:trade" disabled/);
  state = applyAction(state, { type:'eventChoice', choice:'fight' });
  const lose = page(team(state), 'eventResolve', { ui:{ selected:'tech:writing' } });
  assert.match(lose, /data-act="lose:tech:writing"/);
});

test('the poster shows the team’s place, cards, event and answers', () => {
  const state = { ...fullRun(), civName:'River Keepers' };
  const html = posterMarkup(team(state), 'en', dictionary.en);
  for (const text of ['River Keepers','Nile Valley','Irrigation','Epidemic','A council of leaders','Our answer.']) assert(html.includes(text), text);
  assert.match(posterMarkup(team(state), 'ja', dictionary.ja), /<ruby>/);
});

test('a teammate’s event finishes the tree reviews and retains milestones if Society becomes empty', () => {
  let state = start('G');
  state = applyAction(state, { type:'pick', tree:'tech', id:'pottery' });
  state = applyAction(state, { type:'pick', tree:'civic', id:'laws' });
  assert.equal(stepDone('techReview', team(state)), false);
  assert.equal(stepDone('civicReview', team(state)), false);
  state = applyAction(state, { type:'eventRoll', confirm:{ tech:['pottery'], civic:['laws'] } }, { rollDie:dice(4) });
  for (const id of ['techTree','techReview','civicTree','civicReview']) assert.equal(stepDone(id, team(state)), true, id);
  state = applyAction(state, { type:'eventLose', tree:'civic', id:'laws', index:0 });
  const milestones = teamMilestones(team(state));
  assert.equal(milestones.tech, true);
  assert.equal(milestones.civic, true);
  assert.equal(milestones.eventResolved, true);
  assert.deepEqual(teamMilestones({ ...team(state), seen:new Set(['intro1','prices','poster']) }), milestones, 'device reading history does not change team progress');
});

test('government, economy and beliefs each need a choice and an explanation', () => {
  const complete = fullRun();
  for (const [id, field, empty] of [['government','government',''], ['economy','economy',[]], ['beliefs','beliefs','']]) {
    assert.equal(stepDone(id, team(complete)), true);
    const missingChoice = { ...complete, [field]:empty };
    assert.equal(stepDone(id, team(missingChoice)), false);
    assert.equal(teamMilestones(team(missingChoice))[id], false);
  }
  for (const [id, field] of [['government','governmentAnswer'], ['economy','economyAnswer'], ['beliefs','beliefAnswer']]) assert.equal(stepDone(id, team({ ...complete, [field]:'  ' })), false);
});

test('teacher reveal gates all reveal screens even after the device has seen them', () => {
  const done = { ...team(fullRun()), submittedAt:'2026-10-01 10:00' };
  for (const id of ['revealPlace','revealCompare','takeaway']) {
    assert.equal(stepAvailable(id, done, seenAll, false), false, id);
    assert.equal(stepAvailable(id, done, seenAll, true), true, id);
  }
  assert.equal(nextStep(done, seenAll, false).id, 'wait');
});

test('a student joining a submitted team still reads the welcome screens on this device', () => {
  const done = { ...team(fullRun()), submittedAt:'2026-10-01 10:00' };
  const newDevice = new Set();
  assert.equal(nextStep(done, newDevice, false).id, 'intro1');
  assert.equal(stepDone('intro1', done, newDevice, false), false);
  assert.equal(stepDone('submit', done, newDevice, false), true);
  assert.equal(stepAvailable('poster', done, newDevice, false), false);
  newDevice.add('intro1');
  assert.equal(nextStep(done, newDevice, false).id, 'intro2');
});

test('an old submitted team without an event waits for reopening before result screens', () => {
  const old = { ...team(start('G')), submittedAt:'2026-09-30 10:00' };
  assert.equal(nextStep(old, seenAll, false).id, 'eventRoll');
  assert.equal(stepDone('eventRoll', old, seenAll, false), false);
  for (const id of ['eventCard','eventResolve','eventResult']) {
    assert.equal(stepApplies(id, old), false, id);
    assert.equal(stepDone(id, old, seenAll, false), false, id);
    assert.equal(stepAvailable(id, old, seenAll, false), false, id);
  }
  assert.equal(stepAvailable('poster', old, seenAll, false), false);
  assert.equal(nextStep({ ...old, submittedAt:null }, seenAll, false).id, 'techTree', 'reopening restores normal tree readiness');
});

test('a filled explanation cannot finish an institution unsupported by the current cards', () => {
  const complete = fullRun();
  for (const [id,field,value] of [['government','government','assembly'],['beliefs','beliefs','organized'],['economy','economy',['irrigation','markets']]]) {
    const unsupported = { ...complete,[field]:value };
    assert.equal(stepDone(id,team(unsupported)),false,id);
    assert.equal(teamMilestones(team(unsupported))[id],false,id);
  }
  const withoutSociety = { ...complete,civic:[],government:'elders',economy:['fishing'],beliefs:'ancestors' };
  for (const id of ['government','economy','beliefs']) assert.equal(stepDone(id,team(withoutSociety)),true,'ordinary social life remains possible after loss');
});
