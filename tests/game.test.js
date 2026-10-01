import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, needsDie, initialState, normalizeState, submissionGaps, codeTag, isCodeShape, normalizeCode, priceOf, costOf, spent, statusOf, eventPlan, before, removable, gainable, tradeLine, treeIssues, previewChoice, BUDGET, points, parentsMet, missingParents, prerequisiteIds, minimumCost, pickBlocker, choiceStatus, choiceOptions, availableChoiceValues, choicesValid, works } from '../shared/game.js';
import { trees, cardById } from '../shared/cards.js';
import { regions } from '../shared/regions.js';

// A die that returns the given numbers in order and counts how often it was used.
const dice = (...values) => { const die = () => { die.used++; if (!values.length) throw new Error('die used too often'); return values.shift(); }; die.used = 0; return die; };
const start = (point = 'G') => normalizeState({ ...initialState(), mapPoint:point, fixedPoint:point });
const run = (state, actions, die = dice()) => actions.reduce((current, action) => applyAction(current, action, { rollDie:die }), state);
const pick = (tree, ...ids) => ids.map(id => ({ type:'pick', tree, id }));
const confirm = state => ({ type:'eventRoll', confirm:{ tech:[...state.tech], civic:[...state.civic] } });
const throwsCode = (fn, code, status) => assert.throws(fn, error => error.code === code && (status === undefined || error.status === status));
// A team in G (Nile) with Masonry, Construction and Archery, ready to roll.
function readyTeam(point = 'G', techIds = ['pottery','irrigation','mining','masonry'], civicIds = ['laws','trade']) {
  const state = run(start(point), [...pick('tech', ...techIds), ...pick('civic', ...civicIds)]);
  return state;
}

test('region prices follow the slide: G Nile has ★ Irrigation, ★ Sailing and △ Horseback only', () => {
  assert.deepEqual(Object.fromEntries(Object.entries(regions.G.prices).map(([id,[price]]) => [id,price])), { irrigation:'free', sailing:'free', horseback:'hard' });
  assert.equal(costOf('G','irrigation'), 0);
  assert.equal(costOf('G','horseback'), 2);
  assert.equal(costOf('G','writing'), 1);
  assert.equal(costOf('H','husbandry'), null);
});

test('every region price names a real card, and every region can start both trees', () => {
  assert.deepEqual(points, 'ABCDEFGHIJK'.split(''));
  for (const [point, region] of Object.entries(regions)) {
    for (const [id, [price, reason]] of Object.entries(region.prices)) {
      assert(cardById[id], `${point}: ${id} is not a card`);
      assert(['free','hard','impossible'].includes(price), `${point}.${id}`);
      assert(reason.en && reason.ja, `${point}.${id} needs a reason in both languages`);
    }
    assert.notEqual(priceOf(point,'laws'), 'impossible', `${point} must allow Code of Laws`);
    assert(trees.tech.some(card => !card.parents.length && priceOf(point, card.id) !== 'impossible'), `${point} needs a starting science card`);
    assert.equal(region.climate.temp.length, 12); assert.equal(region.climate.rain.length, 12);
    assert.equal(Object.keys(region.events).length, 6);
    for (const id of region.reveal.had) assert(cardById[id], `${point} reveal: ${id}`);
  }
});

test('each tree has 7 points: normal cards cost 1, ★ cards are free, △ cards cost 2', () => {
  let state = run(start('G'), pick('tech','pottery','writing','currency','math','astrology','mining','masonry'));
  assert.equal(spent(state,'tech'), 7);
  throwsCode(() => applyAction(state, { type:'pick', tree:'tech', id:'wheel' }), 'overBudget');
  // ★ Irrigation and ★ Sailing are free, so they still fit.
  state = run(state, pick('tech','irrigation','sailing'));
  assert.equal(spent(state,'tech'), BUDGET);
  assert.equal(state.tech.length, 9);
});

test('arrows: a card needs every chosen parent, and ★ cards still need their arrows', () => {
  const state = start('G');
  throwsCode(() => applyAction(state, { type:'pick', tree:'tech', id:'irrigation' }), 'needsParent');
  const viaAstrology = run(state, pick('tech','pottery','astrology'));
  throwsCode(() => applyAction(viaAstrology, { type:'pick', tree:'tech', id:'navigation' }), 'needsParent');
  const navigators = run(viaAstrology, pick('tech','sailing','navigation'));
  assert(navigators.tech.includes('navigation'), 'Celestial Navigation requires Sailing and Astrology');
  throwsCode(() => applyAction(start('H'), { type:'pick', tree:'tech', id:'husbandry' }), 'impossible');
  throwsCode(() => applyAction(viaAstrology, { type:'pick', tree:'tech', id:'pottery' }), 'alreadyChosen', 409);
});

test('a △ card is rolled once on the server and never re-rolled', () => {
  const ready = run(start('G'), pick('tech','pottery'), dice());
  const base = run(ready, [{ type:'pick', tree:'civic', id:'laws' }]);
  // Horseback (△ in G) needs Animal Husbandry and Archery first.
  const withArchery = run(base, pick('tech','husbandry','archery'));
  assert.throws(() => applyAction(withArchery, { type:'pick', tree:'tech', id:'horseback' }), error => error.needsDie === true, 'the page cannot roll');
  throwsCode(() => applyAction(base, { type:'pick', tree:'tech', id:'horseback' }), 'needsParent');
  const die = dice(2);
  const rolled = run(withArchery, pick('tech','horseback'), die);
  assert.equal(die.used, 1);
  assert.equal(rolled.rolls.horseback, 2);
  assert.equal(statusOf(rolled,'horseback'), 'partly');
  assert.equal(spent(rolled,'tech'), 1 + 1 + 1 + 2);
  const again = run(rolled, [{ type:'unpick', tree:'tech', id:'horseback', cascade:[] }, { type:'pick', tree:'tech', id:'horseback' }], dice());
  assert.equal(again.rolls.horseback, 2, 'removing and adding again keeps the first roll');
  assert.throws(() => run(withArchery, pick('tech','horseback'), () => 7), error => error.code === 'badDie');
  assert.equal(statusOf(rolled,'pottery'), 'works');
  assert.equal(statusOf(run(rolled, pick('tech','irrigation')),'irrigation'), 'thrives');
});

test('removing a card must name every card that goes with it', () => {
  const state = run(start('G'), pick('tech','pottery','sailing','astrology','navigation','shipbuilding'));
  throwsCode(() => applyAction(state, { type:'unpick', tree:'tech', id:'sailing', cascade:[] }), 'cascadeChanged', 409);
  const noSailing = applyAction(state, { type:'unpick', tree:'tech', id:'sailing', cascade:['navigation','shipbuilding'] });
  assert.deepEqual(noSailing.tech, ['pottery','astrology'], 'Navigation also goes: Sailing is required alongside Astrology');
  throwsCode(() => applyAction(noSailing, { type:'unpick', tree:'tech', id:'sailing', cascade:[] }), 'notChosen', 409);
});

test('the event roll needs both trees, the cards the team saw, and locks the trees', () => {
  const techOnly = run(start('G'), pick('tech','pottery'));
  throwsCode(() => applyAction(techOnly, confirm(techOnly), { rollDie:dice(6) }), 'needsBothTrees');
  const state = readyTeam();
  throwsCode(() => applyAction(state, { type:'eventRoll', confirm:{ tech:['pottery'], civic:['laws','trade'] } }, { rollDie:dice(6) }), 'treesChanged', 409);
  const rolled = applyAction(state, confirm(state), { rollDie:dice(6) });
  assert.equal(rolled.event.roll, 6);
  throwsCode(() => applyAction(rolled, { type:'pick', tree:'tech', id:'writing' }), 'locked', 409);
  throwsCode(() => applyAction(rolled, { type:'unpick', tree:'tech', id:'masonry', cascade:[] }), 'locked', 409);
  throwsCode(() => applyAction(rolled, confirm(rolled), { rollDie:dice(6) }), 'alreadyRolled', 409);
});

test('1 Drought: Irrigation is lost unless working Masonry built reservoirs', () => {
  const protectedTeam = readyTeam('G');
  const safe = applyAction(protectedTeam, confirm(protectedTeam), { rollDie:dice(1) });
  assert(safe.tech.includes('irrigation'));
  assert.equal(eventPlan(safe).protectedBy, 'masonry');
  const bare = readyTeam('G', ['pottery','irrigation'], ['laws']);
  const dry = applyAction(bare, confirm(bare), { rollDie:dice(1) });
  assert(!dry.tech.includes('irrigation'));
  assert.deepEqual(dry.event.lost, ['irrigation']);
  assert(eventPlan(dry).resolved);
  // In C (Mesopotamia) Masonry is △: a roll of 2 means it only partly works and gives no protection.
  const partly = run(start('C'), [...pick('tech','pottery','irrigation','mining'), ...pick('civic','laws')], dice(5));
  const withMasonry = run(partly, pick('tech','masonry'), dice(2));
  const flooded = applyAction(withMasonry, confirm(withMasonry), { rollDie:dice(1) });
  assert(!flooded.tech.includes('irrigation'), 'partly-working Masonry does not protect');
  const noIrrigation = readyTeam('G', ['pottery','writing'], ['laws']);
  assert(eventPlan(applyAction(noIrrigation, confirm(noIrrigation), { rollDie:dice(1) })).resolved);
});

test('2 Great flood: lose one science card at the end of a branch, unless Construction works', () => {
  const state = readyTeam('G', ['pottery','writing','currency','irrigation'], ['laws']);
  const flood = applyAction(state, confirm(state), { rollDie:dice(2) });
  const plan = eventPlan(flood);
  assert.equal(plan.kind, 'lose'); assert.equal(plan.remaining, 1);
  assert.deepEqual(plan.options.map(option => option.id).sort(), ['currency','irrigation']);
  throwsCode(() => applyAction(flood, { type:'eventLose', tree:'tech', id:'pottery', index:0 }), 'cannotLose');
  throwsCode(() => applyAction(flood, { type:'eventLose', tree:'tech', id:'currency', index:1 }), 'eventChanged', 409);
  const after = applyAction(flood, { type:'eventLose', tree:'tech', id:'currency', index:0 });
  assert(eventPlan(after).resolved);
  throwsCode(() => applyAction(after, { type:'eventLose', tree:'tech', id:'irrigation', index:1 }), 'stepDone', 409);
  assert.deepEqual(before(after,'tech').sort(), state.tech.slice().sort());
  const builders = readyTeam('G', ['pottery','mining','masonry','wheel','construction'], ['laws']);
  assert.equal(eventPlan(applyAction(builders, confirm(builders), { rollDie:dice(2) })).protectedBy, 'construction');
});

test('3 Newcomers: trade adds a free Foreign Trade line card; fight needs working Archery', () => {
  const state = readyTeam('G', ['pottery','husbandry','archery'], ['laws','craft','workforce']);
  const met = applyAction(state, confirm(state), { rollDie:dice(3) });
  assert.equal(eventPlan(met).kind, 'choose');
  assert.deepEqual(previewChoice(met,'trade').options.map(option => option.id), ['trade']);
  assert.equal(previewChoice(met,'fight').protectedBy, 'archery');
  throwsCode(() => applyAction(met, { type:'eventChoice', choice:'party' }), 'wrongChoice');
  const traded = applyAction(met, { type:'eventChoice', choice:'trade' });
  throwsCode(() => applyAction(traded, { type:'eventChoice', choice:'fight' }), 'choiceMade', 409);
  const gained = applyAction(traded, { type:'eventGain', tree:'civic', id:'trade', index:0 });
  assert(gained.civic.includes('trade'));
  assert.equal(spent(gained,'civic'), spent(state,'civic'), 'a gained card is free');
  assert(eventPlan(gained).resolved);
  // Political Philosophy grows from State Workforce here, not from the trade line.
  const traders = readyTeam('G', ['pottery'], ['laws','trade','craft','workforce']);
  const line = applyAction(applyAction(traders, confirm(traders), { rollDie:dice(3) }), { type:'eventChoice', choice:'trade' });
  assert.deepEqual(eventPlan(line).options.map(option => option.id).sort(), ['empire','mysticism']);
  assert(tradeLine.includes('theology') && !tradeLine.includes('training'));
  const fighters = readyTeam('G', ['pottery','writing'], ['laws']);
  const fight = applyAction(applyAction(fighters, confirm(fighters), { rollDie:dice(3) }), { type:'eventChoice', choice:'fight' });
  const plan = eventPlan(fight);
  assert.equal(plan.kind, 'lose');
  assert.deepEqual(plan.trees, ['tech','civic']);
});

test('4 Epidemic: lose one society card, two if the team had Foreign Trade', () => {
  const state = readyTeam('G', ['pottery'], ['laws','trade','craft']);
  const sick = applyAction(state, confirm(state), { rollDie:dice(4) });
  assert.equal(eventPlan(sick).count, 2);
  const first = applyAction(sick, { type:'eventLose', tree:'civic', id:'trade', index:0 });
  assert.equal(eventPlan(first).remaining, 1, 'losing Foreign Trade first still costs a second card');
  const second = applyAction(first, { type:'eventLose', tree:'civic', id:'craft', index:1 });
  assert(eventPlan(second).resolved);
  // The last card can go: a team may end with an empty society tree.
  const small = readyTeam('G', ['pottery'], ['laws']);
  const emptied = applyAction(applyAction(small, confirm(small), { rollDie:dice(4) }), { type:'eventLose', tree:'civic', id:'laws', index:0 });
  assert.deepEqual(emptied.civic, []);
  assert(!submissionGaps({ ...emptied, government:'council', economy:['farming'], beliefs:'nature', ...Object.fromEntries(['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer'].map(key => [key,'x'])) }).length);
});

test('5 Worn-out soil: working Foreign Trade imports food; partly working does not', () => {
  const traders = readyTeam('G', ['pottery','writing'], ['laws','trade']);
  assert.equal(eventPlan(applyAction(traders, confirm(traders), { rollDie:dice(5) })).protectedBy, 'trade');
  // In K (Greenland) Pottery and Foreign Trade are △. Trade rolled 1: it only partly works.
  const kTeam = run(start('K'), [...pick('tech','pottery','sailing'), ...pick('civic','laws','trade')], dice(4, 1));
  assert.equal(statusOf(kTeam,'trade'), 'partly');
  assert.equal(eventPlan(applyAction(kTeam, confirm(kTeam), { rollDie:dice(5) })).kind, 'lose');
});

test('6 Good years: one free card from either tree, even with a full budget; △ gains are rolled', () => {
  const full = run(start('G'), [...pick('tech','pottery','writing','currency','math','astrology','mining','husbandry'), ...pick('civic','laws')]);
  assert.equal(spent(full,'tech'), 7);
  const good = applyAction(full, confirm(full), { rollDie:dice(6) });
  assert(eventPlan(good).options.some(option => option.id === 'archery'));
  assert(!gainable(good,'any').some(option => option.id === 'horseback'), 'Horseback still needs Archery');
  const gained = applyAction(good, { type:'eventGain', tree:'tech', id:'archery', index:0 });
  assert.equal(spent(gained,'tech'), 7);
  throwsCode(() => applyAction(gained, { type:'eventGain', tree:'tech', id:'wheel', index:1 }), 'stepDone', 409);
  const australia = run(start('H'), [...pick('tech','pottery'), ...pick('civic','laws')]);
  const lucky = applyAction(australia, confirm(australia), { rollDie:dice(6) });
  assert(!eventPlan(lucky).options.some(option => option.id === 'husbandry'), '✗ cards cannot be gained');
  // In K, Animal Husbandry is △: gaining it needs its own success roll.
  const k = run(start('K'), [...pick('tech','mining'), ...pick('civic','laws')], dice(3));
  const kGood = applyAction(k, confirm(k), { rollDie:dice(6) });
  const die = dice(2);
  const herd = applyAction(kGood, { type:'eventGain', tree:'tech', id:'husbandry', index:0 }, { rollDie:die });
  assert.equal(die.used, 1);
  assert.equal(statusOf(herd,'husbandry'), 'partly');
});

test('trees with problems cannot roll the event', () => {
  // An old save may be over budget or hold a △ card without a roll.
  const old = normalizeState({ v:2, mapPoint:'G', tech:['pottery','husbandry','archery','horseback'], civic:['laws'] });
  assert.deepEqual(treeIssues(old).map(issue => issue.code), ['unrolled']);
  throwsCode(() => applyAction(old, confirm(old), { rollDie:dice(6) }), 'fixTrees');
  const fixed = applyAction(old, { type:'cardRoll', id:'horseback' }, { rollDie:dice(5) });
  assert.equal(fixed.rolls.horseback, 5);
  assert.deepEqual(treeIssues(fixed), []);
  throwsCode(() => applyAction(fixed, { type:'cardRoll', id:'horseback' }, { rollDie:dice(5) }), 'noRoll', 409);
});

test('fields, chips and the place', () => {
  let state = start('G');
  state = applyAction(state, { type:'field', key:'civName', value:'x'.repeat(40) });
  state = applyAction(state, { type:'field', key:'geographyAnswer', value:'x'.repeat(600) });
  assert.equal(state.geographyAnswer.length, 600);
  throwsCode(() => applyAction(state, { type:'field', key:'civName', value:'x'.repeat(41) }), 'tooLong');
  throwsCode(() => applyAction(state, { type:'field', key:'geographyAnswer', value:'x'.repeat(601) }), 'tooLong');
  throwsCode(() => applyAction(state, { type:'field', key:'placeAnswer', value:'old' }), 'badField');
  state = run(state, pick('civic','laws','trade','craft'));
  state = run(state, [{ type:'chip', key:'government', value:'council' }, { type:'chip', key:'economy', value:'farming' }, { type:'chip', key:'economy', value:'trade' }, { type:'chip', key:'economy', value:'crafts' }]);
  throwsCode(() => applyAction(state, { type:'chip', key:'economy', value:'fishing' }), 'tooMany');
  state = applyAction(state, { type:'chip', key:'economy', value:'trade', on:false });
  assert.deepEqual(state.economy, ['farming','crafts']);
  throwsCode(() => applyAction(state, { type:'chip', key:'beliefs', value:'aliens' }), 'badChip');
  throwsCode(() => applyAction(state, { type:'map', point:'A' }), 'fixedPlace');
  const free = normalizeState(initialState());
  const chosen = applyAction(free, { type:'map', point:'B' });
  assert.equal(chosen.mapPoint, 'B');
  throwsCode(() => applyAction(run(chosen, pick('tech','pottery')), { type:'map', point:'C' }), 'placeLocked');
});

test('submission needs the place, the event, every answer and the three choices; the name is optional', () => {
  assert.deepEqual(submissionGaps(initialState()), ['region','tech','civic','event','eventAnswer','geographyAnswer','government','governmentAnswer','economy','economyAnswer','beliefs','beliefAnswer','shapeAnswer','notChosenAnswer']);
  const state = readyTeam('G', ['pottery','writing'], ['laws']);
  const flood = applyAction(state, confirm(state), { rollDie:dice(2) });
  assert(submissionGaps(flood).includes('eventResolved'));
});

test('submission requires choices even when all explanations are complete', () => {
  const ready = readyTeam('G', ['pottery','writing'], ['laws']);
  const rolled = applyAction(ready, confirm(ready), { rollDie:dice(1) });
  const answers = Object.fromEntries(['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer'].map(key => [key,'Our answer.']));
  assert.deepEqual(submissionGaps({ ...rolled, ...answers }), ['government','economy','beliefs']);
  assert.deepEqual(submissionGaps({ ...rolled, ...answers, government:'council', economy:['farming'], beliefs:'nature' }), []);
});

test('old hex-map saves keep their place, valid cards and answers, and drop the rest', () => {
  const old = { stage:3, mapPoint:'H', avatar:'H', fixedPoint:'H', route:'water', placeAnswer:'Rivers help us', techAnswer:'', societyAnswer:'We share', beliefAnswer:'Spirits of the land', contactAnswer:'', tech:['pottery','husbandry','archery','preservation'], civic:['laws','mutual_aid'], events:{ origin:'steward', encounter:'share' }, tiles:{ pottery:3 }, trails:[[1,2]], plannedBuildings:[] };
  const state = normalizeState(old);
  assert.equal(state.v, 2);
  assert.equal(state.mapPoint, 'H'); assert.equal(state.fixedPoint, 'H');
  assert.deepEqual(state.tech, ['pottery'], 'Animal Husbandry is ✗ in H, so Archery loses its arrow too');
  assert.deepEqual(state.civic, ['laws']);
  assert.equal(state.beliefAnswer, 'Spirits of the land');
  assert.deepEqual(state.legacy, { placeAnswer:'Rivers help us', societyAnswer:'We share', route:'water', origin:'steward', encounter:'share' });
  for (const key of ['tiles','trails','route','avatar','stage','events','plannedBuildings']) assert(!(key in state), key);
  assert.deepEqual(normalizeState(state), state, 'normalising twice changes nothing');
  assert.deepEqual(normalizeState({ v:2, tech:'nope', rolls:{ pottery:9, horseback:3 }, economy:['farming','x'], government:'king' }).rolls, { horseback:3 });
});

test('applyAction never changes the state it was given', () => {
  const state = Object.freeze(readyTeam());
  const next = applyAction(state, { type:'pick', tree:'tech', id:'writing' });
  assert(!state.tech.includes('writing'));
  assert(next.tech.includes('writing'));
  assert.deepEqual(removable(next,'tech').sort(), ['irrigation','masonry','writing']);
});

test('join codes are built from the team name and still accept older codes', () => {
  assert.equal(codeTag('Team A'),'A');
  assert.equal(codeTag('team k'),'K');
  assert.equal(codeTag('River Makers!'),'RIVERMAKER');
  assert.equal(codeTag('さくら'),'TEAM','a name without Latin letters still gets a tag');
  assert(isCodeShape(normalizeCode('a-427')));
  assert(isCodeShape('RIVERMAKER123'));
  assert(isCodeShape('ABCDEFGH2'),'a nine-character code from before still works');
  assert(!isCodeShape('A42'));
  assert(!isCodeShape('ABC'));
});

test('dice actions validate every rule before requesting a roll', () => {
  const ready = run(start('G'), [...pick('tech','husbandry','archery'), ...pick('civic','laws')]);
  const hard = { type:'pick', tree:'tech', id:'horseback', roll:6 };
  assert.equal(needsDie(ready, hard), true);
  assert.equal(needsDie(ready, { type:'pick', tree:'tech', id:'pottery' }), false);
  throwsCode(() => needsDie(start('G'), hard), 'needsParent');
  const die = dice(1);
  const picked = applyAction(ready, hard, { rollDie:die });
  assert.equal(picked.rolls.horseback, 1, 'the client roll is ignored');
  assert.equal(die.used, 1);
  const removed = applyAction(picked, { type:'unpick', tree:'tech', id:'horseback', cascade:[] });
  assert.equal(needsDie(removed, hard), false, 'a stored roll is reused');
  assert.equal(needsDie(ready, confirm(ready)), true);
  const missingRoll = normalizeState({ ...ready, tech:[...ready.tech,'horseback'] });
  assert.equal(needsDie(missingRoll, { type:'cardRoll', id:'horseback' }), true);
  for (const value of [0,7,2.5]) {
    throwsCode(() => applyAction(ready, hard, { rollDie:() => value }), 'badDie', 500);
    assert.deepEqual(ready.rolls, {}, 'a failed die must not change the previous state');
  }
});

test('changing an empty unfixed team’s region keeps earlier card rolls', () => {
  let state = normalizeState({ ...initialState(), mapPoint:'G' });
  state = run(state, pick('tech','husbandry','archery','horseback'), dice(2));
  state = applyAction(state, { type:'unpick', tree:'tech', id:'husbandry', cascade:['archery','horseback'] });
  assert.deepEqual(state.tech, []);
  state = applyAction(state, { type:'map', point:'B' });
  assert.equal(state.rolls.horseback, 2);
  state = applyAction(state, { type:'map', point:'G' });
  const noMoreDice = dice();
  state = run(state, pick('tech','husbandry','archery','horseback'), noMoreDice);
  assert.equal(noMoreDice.used, 0);
  assert.equal(state.rolls.horseback, 2);
});

test('chip actions only accept known groups and idempotent economy membership', () => {
  const empty = start('G');
  for (const key of ['constructor','toString','__proto__']) throwsCode(() => applyAction(empty, { type:'chip', key, value:'x' }), 'badChip');
  for (const on of [0,1,'false',null]) throwsCode(() => applyAction(empty, { type:'chip', key:'economy', value:'trade', on }), 'badChip');
  let state = run(empty, ['farming','fishing','hunting'].map(value => ({ type:'chip', key:'economy', value, on:true })));
  state = applyAction(state, { type:'chip', key:'economy', value:'fishing', on:true });
  assert.deepEqual(state.economy, ['farming','fishing','hunting']);
  state = run(state, Array.from({ length:2 }, () => ({ type:'chip', key:'economy', value:'fishing', on:false })));
  assert.deepEqual(state.economy, ['farming','hunting']);
});

test('normalization is idempotent for legacy stories and dirty v2 input', () => {
  const old = normalizeState({ mapPoint:'G', events:{ origin:'x'.repeat(601), encounter:' '.repeat(4) } });
  assert.equal(old.legacy.origin.length, 600);
  assert(!('encounter' in old.legacy));
  assert.deepEqual(normalizeState(old), old);
  const dirty = normalizeState({ v:2, mapPoint:'H', fixedPoint:'bad', tech:['pottery','husbandry','archery','pottery',42,'preservation'], civic:['laws','trade'], rolls:{ horseback:6, pottery:0, laws:2.5 }, event:{ roll:7 }, civName:'a\rb', geographyAnswer:'x'.repeat(601), economy:['farming','farming','unknown','trade','crafts','hunting'], government:'bad', legacy:{ placeAnswer:'x'.repeat(601), junk:'x' } });
  assert.deepEqual(dirty.tech, ['pottery','husbandry','archery'], 'v2 impossible cards remain for the team to repair');
  assert(treeIssues(dirty).some(issue => issue.code === 'impossible' && issue.id === 'husbandry'));
  assert.equal(dirty.event, null);
  assert.equal(dirty.civName, 'ab');
  assert.equal(dirty.geographyAnswer.length, 600);
  assert.deepEqual(dirty.economy, ['farming','trade','crafts']);
  assert.deepEqual(dirty.rolls, { horseback:6 });
  assert.deepEqual(normalizeState(dirty), dirty);
});

test('event reconstruction preserves the original chosen cards through all six rolls', () => {
  const original = readyTeam('G', ['pottery','writing','currency','irrigation'], ['laws','trade','craft','workforce']);
  const snapshot = structuredClone(original);
  const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
  freeze(original);
  const sameBefore = state => {
    for (const tree of ['tech','civic']) assert.deepEqual(before(state, tree).sort(), [...snapshot[tree]].sort());
  };
  for (const roll of [1,2,3,4,5,6]) for (const choice of roll === 3 ? ['trade','fight'] : ['']) {
    let state = applyAction(original, confirm(original), { rollDie:dice(roll) });
    sameBefore(state);
    if (choice) { state = applyAction(state, { type:'eventChoice', choice }); sameBefore(state); }
    let plan = eventPlan(state), actions = 0;
    while (!plan.resolved) {
      assert(actions++ < 3, 'an event must finish after its prescribed count');
      const option = plan.options[0];
      state = applyAction(state, { type:plan.kind === 'lose' ? 'eventLose' : 'eventGain', ...option, index:plan.kind === 'lose' ? state.event.lost.length : state.event.gained.length }, { rollDie:dice(4) });
      sameBefore(state);
      plan = eventPlan(state);
    }
  }
  assert.deepEqual(original, snapshot, 'even nested frozen input is never changed');
});

test('partly working Foreign Trade still causes two Epidemic losses', () => {
  const original = run(start('K'), [...pick('tech','pottery'), ...pick('civic','laws','trade')], dice(4,2));
  let state = applyAction(original, confirm(original), { rollDie:dice(4) });
  assert.equal(eventPlan(state).count, 2);
  state = applyAction(state, { type:'eventLose', tree:'civic', id:'trade', index:0 });
  assert.equal(eventPlan(state).remaining, 1);
  state = applyAction(state, { type:'eventLose', tree:'civic', id:'laws', index:1 });
  assert(eventPlan(state).resolved);
  assert.deepEqual(state.civic, []);
  assert.deepEqual(before(state,'civic').sort(), ['laws','trade']);
});

test('event losses accept the design’s unique card id and still validate a supplied tree', () => {
  const original = readyTeam('G', ['pottery','writing'], ['laws']);
  const flood = applyAction(original, confirm(original), { rollDie:dice(2) });
  throwsCode(() => applyAction(flood, { type:'eventLose', tree:'civic', id:'writing', index:0 }), 'cannotLose');
  const lost = applyAction(flood, { type:'eventLose', id:'writing', index:0 });
  assert.deepEqual(lost.tech, ['pottery']);
  assert.deepEqual(lost.event.lost, ['writing']);
  assert(eventPlan(lost).resolved);
});

test('event readiness blocks migration problems without consuming dice', () => {
  const overBudget = normalizeState({ v:2, mapPoint:'G', tech:['pottery','writing','currency','math','astrology','mining','masonry','wheel'], civic:['laws'] });
  const impossible = normalizeState({ v:2, mapPoint:'H', tech:['pottery','husbandry','archery'], civic:['laws'] });
  const unrolled = normalizeState({ v:2, mapPoint:'G', tech:['husbandry','archery','horseback'], civic:['laws'] });
  for (const [state, code] of [[initialState(),'noPlace'], [start('G'),'needsBothTrees'], [overBudget,'fixTrees'], [impossible,'fixTrees'], [unrolled,'fixTrees']]) {
    const die = dice(6);
    throwsCode(() => applyAction(state, confirm(state), { rollDie:die }), code);
    assert.equal(die.used, 0, code);
  }
});

test('a hard event gain reuses a roll stored before the event', () => {
  const original = normalizeState({ v:2, mapPoint:'K', tech:['mining'], civic:['laws'], rolls:{ mining:4, husbandry:2 } });
  const rolled = applyAction(original, confirm(original), { rollDie:dice(6) });
  const gain = { type:'eventGain', tree:'tech', id:'husbandry', index:0 };
  assert.equal(needsDie(rolled, gain), false);
  const noMoreDice = dice();
  const gained = applyAction(rolled, gain, { rollDie:noMoreDice });
  assert.equal(noMoreDice.used, 0);
  assert.equal(gained.rolls.husbandry, 2);
  assert.equal(statusOf(gained,'husbandry'), 'partly');
  assert.equal(spent(gained,'tech'), spent(original,'tech'));
});

test('Political Philosophy cannot bypass either development branch', () => {
  const craftOnly = readyTeam('G',['pottery'],['laws','craft','workforce']);
  const empireOnly = readyTeam('G',['pottery'],['laws','trade','empire']);
  for (const state of [craftOnly,empireOnly]) {
    throwsCode(() => applyAction(state,{ type:'pick',tree:'civic',id:'philosophy' }), 'needsParent');
    assert.equal(pickBlocker(state,'civic','philosophy'),'parent');
    assert(!gainable(state,'any').some(option => option.id === 'philosophy'));
    assert(!gainable(state,'trade').some(option => option.id === 'philosophy'));
  }
  const both = run(craftOnly,pick('civic','trade','empire','philosophy'));
  assert.equal(parentsMet(both.civic,'philosophy'),true);
  assert.deepEqual(missingParents(craftOnly.civic,'philosophy'),['empire']);
  assert(both.civic.includes('craft') && both.civic.includes('workforce') && both.civic.includes('empire'));
  throwsCode(() => applyAction(both,{ type:'unpick',tree:'civic',id:'craft',cascade:['workforce'] }), 'cascadeChanged',409);
  const removed = applyAction(both,{ type:'unpick',tree:'civic',id:'craft',cascade:['workforce','philosophy'] });
  assert.deepEqual(removed.civic,['laws','trade','empire']);
  const imported = normalizeState({ ...craftOnly,civic:[...craftOnly.civic,'philosophy','history'] });
  assert.deepEqual(imported.civic,craftOnly.civic, 'normalization also removes bypassed descendants');
});

test('event gains enforce all arrow parents and event losses cannot break them', () => {
  let state = readyTeam('G',['pottery'],['laws','craft','workforce','trade']);
  state = applyAction(state,confirm(state),{ rollDie:dice(6) });
  throwsCode(() => applyAction(state,{ type:'eventGain',tree:'civic',id:'philosophy',index:0 }), 'cannotGain');
  const ready = readyTeam('G',['pottery'],['laws','craft','workforce','trade','empire']);
  const good = applyAction(ready,confirm(ready),{ rollDie:dice(6) });
  const gained = applyAction(good,{ type:'eventGain',tree:'civic',id:'philosophy',index:0 });
  assert(gained.civic.includes('philosophy'));
  const sick = applyAction({ ...gained,event:null },confirm({ ...gained,event:null }),{ rollDie:dice(4) });
  assert(!eventPlan(sick).options.some(option => ['workforce','empire','craft'].includes(option.id)));
  throwsCode(() => applyAction(sick,{ type:'eventLose',tree:'civic',id:'empire',index:0 }), 'cannotLose');
});

test('Construction uses stonework and transport, while advanced branches respect seven points', () => {
  assert.deepEqual(cardById.construction.parents,['masonry','wheel']);
  const stonework = run(start('H'),pick('tech','mining','masonry'));
  throwsCode(() => applyAction(stonework,{ type:'pick',tree:'tech',id:'construction' }), 'needsParent');
  const built = run(stonework,pick('tech','wheel','construction'));
  assert(built.tech.includes('construction'),'construction remains possible where horses are absent');
  assert.equal(minimumCost('G','defense'),8);
  assert.equal(minimumCost('G','history'),8);
  assert.equal(minimumCost('G','philosophy'),6);
  assert.equal(minimumCost('H','horseback'),null);
  assert(prerequisiteIds('history').includes('craft'));
  const full = readyTeam('G',['pottery'],['laws','craft','workforce','trade','empire','philosophy','games']);
  assert.equal(spent(full,'civic'),7);
  throwsCode(() => applyAction(full,{ type:'pick',tree:'civic',id:'defense' }), 'overBudget');
  const good = applyAction(full,confirm(full),{ rollDie:dice(6) });
  const stretched = applyAction(good,{ type:'eventGain',tree:'civic',id:'defense',index:0 });
  assert.equal(spent(stretched,'civic'),7,'an event gain makes this advanced path attainable without raising the budget');
});

test('basic leadership, belief and subsistence remain available without development cards', () => {
  const empty = start('G');
  assert.deepEqual(availableChoiceValues(empty,'government'),['elders','council']);
  assert.deepEqual(availableChoiceValues(empty,'economy'),['farming','fishing','hunting']);
  assert.deepEqual(availableChoiceValues(empty,'beliefs'),['nature','ancestors','gods','sky','one']);
  for (const [key,value] of [['government','elders'],['government','council'],['beliefs','ancestors'],['beliefs','one'],['economy','fishing']]) assert.doesNotThrow(() => applyAction(empty,{ type:'chip',key,value,on:true }));
  for (const [key,value] of [['government','ruler'],['government','priests'],['government','assembly'],['beliefs','mystics'],['beliefs','organized'],['economy','herding'],['economy','crafts'],['economy','irrigation'],['economy','markets'],['economy','trade']]) throwsCode(() => applyAction(empty,{ type:'chip',key,value,on:true }), 'needsCapabilities');
  assert.deepEqual(choiceStatus(empty,'government','ruler'),{ available:false,requires:['empire','workforce'],missing:['empire','workforce'] });
  assert(choiceOptions(empty,'beliefs').find(option => option.value === 'organized').missing.includes('theology'));
});

test('developed working cards unlock institutions and specialists, with server-side enforcement', () => {
  const empire = readyTeam('G',['pottery'],['laws','trade','empire']);
  assert.equal(choiceStatus(empire,'government','ruler').available,false);
  const civic = run(empire,pick('civic','craft','workforce','philosophy'));
  for (const value of ['ruler','assembly']) {
    assert.equal(choiceStatus(civic,'government',value).available,true);
    assert.doesNotThrow(() => applyAction(civic,{ type:'chip',key:'government',value }));
  }
  const holy = readyTeam('G',['pottery'],['laws','trade','empire','poetry','mysticism','theology']);
  for (const [key,value] of [['government','priests'],['beliefs','mystics'],['beliefs','organized']]) assert.doesNotThrow(() => applyAction(holy,{ type:'chip',key,value }));
  const tech = readyTeam('G',['pottery','writing','currency','irrigation'],['laws','craft','trade']);
  for (const value of ['markets','irrigation','crafts','trade']) assert.doesNotThrow(() => applyAction(tech,{ type:'chip',key:'economy',value,on:true }));
  const partialHerd = run(start('K'),pick('tech','husbandry'),dice(2));
  assert.equal(works(partialHerd,'husbandry'),false);
  assert.equal(choiceStatus(partialHerd,'economy','herding').available,false);
  throwsCode(() => applyAction(partialHerd,{ type:'chip',key:'economy',value:'herding',on:true }), 'needsCapabilities');
});

test('event losses invalidate dependent institutions while preserving ordinary beliefs and answers', () => {
  let state = readyTeam('G',['pottery'],['laws','trade','empire','poetry','mysticism','theology']);
  state = applyAction(state,{ type:'chip',key:'beliefs',value:'organized' });
  state = applyAction(state,{ type:'field',key:'beliefAnswer',value:'Our rites connect several settlements.' });
  state = applyAction(state,confirm(state),{ rollDie:dice(4) });
  state = applyAction(state,{ type:'eventLose',id:'theology',index:0 });
  assert.equal(choicesValid(state,'beliefs'),false);
  assert(submissionGaps(state).includes('beliefs'));
  assert.equal(state.beliefAnswer,'Our rites connect several settlements.');
  state = applyAction(state,{ type:'chip',key:'beliefs',value:'ancestors' });
  assert.equal(choicesValid(state,'beliefs'),true);
  let economy = readyTeam('G',['pottery'],['laws','trade']);
  economy = applyAction(economy,{ type:'chip',key:'economy',value:'trade',on:true });
  economy = applyAction(economy,confirm(economy),{ rollDie:dice(4) });
  economy = applyAction(economy,{ type:'eventLose',id:'trade',index:0 });
  assert.equal(choicesValid(economy,'economy'),false);
  economy = applyAction(economy,{ type:'chip',key:'economy',value:'trade',on:false });
  economy = applyAction(economy,{ type:'chip',key:'economy',value:'fishing',on:true });
  assert.equal(choicesValid(economy,'economy'),true);
});
