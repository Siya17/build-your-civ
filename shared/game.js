// The classroom rules from the Week 2 slides, shared by the browser and the server.
// Prices (slide 18): ★ free = 0 points, normal = 1, △ hard = 2 points and a success roll,
// ✗ impossible. Each tree has 7 points. Every arrow parent is required to unlock a card.
// The event (slide 22) is one die roll per team; after it the trees are locked.
// Dice are never rolled here unless the caller passes `rollDie` (the server does).
import { tech, civic, trees, treeIds, cardById, treeOf, childrenOf, parentsMet, missingParents, prerequisiteIds } from './cards.js';
import { regions, points } from './regions.js';

export { trees, treeIds, cardById, treeOf, points, parentsMet, missingParents, prerequisiteIds };
export const BUDGET = 7;
export const isPoint = point => typeof point === 'string' && Object.hasOwn(regions, point);
export const textFields = ['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer'];
export const writableFields = [...textFields, 'civName'];
export const fieldLimit = key => key === 'civName' ? 40 : 600;
// Each answer about government, economy and beliefs also needs a choice from its list.
export const chipOptions = {
  government:['elders','council','ruler','priests','assembly'],
  economy:['farming','herding','fishing','hunting','trade','crafts','irrigation','markets'],
  beliefs:['nature','ancestors','gods','sky','one','mystics','organized']
};
export const economyMax = 3;
// Ordinary subsistence, local leadership and spirituality are possible without a
// state or organised religion. Cards enable specialist institutions and practices.
export const optionRequirements = {
  government:{ elders:[], council:[], ruler:['empire','workforce'], priests:['mysticism'], assembly:['philosophy'] },
  economy:{ farming:[], herding:['husbandry'], fishing:[], hunting:[], trade:['trade'], crafts:['craft'], irrigation:['irrigation'], markets:['currency'] },
  beliefs:{ nature:[], ancestors:[], gods:[], sky:[], one:[], mystics:['mysticism'], organized:['theology'] }
};

// Join codes are the team's short name and a three-digit PIN, read aloud as "A-427".
// Teams created before this keep their nine-character codes from the older alphabet.
export const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const codeLength = 13;
// Codes are read aloud in groups, so accept any spacing or punctuation around the characters.
export const normalizeCode = value => String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g,'');
const legacyCode = code => code.length === 9 && [...code].every(character => codeAlphabet.includes(character));
export const isCodeShape = code => /^[A-Z0-9]{1,10}[0-9]{3}$/.test(code) || legacyCode(code);
// "Team A" is tagged A; any other name uses its letters and digits, e.g. "River Makers" → RIVERMAKER.
export function codeTag(name) {
  const upper = String(name ?? '').normalize('NFKD').toUpperCase().trim();
  const tag = (upper.match(/^TEAM\s+([A-Z0-9]+)$/)?.[1] ?? upper).replace(/[^A-Z0-9]/g,'').slice(0,10);
  return tag || 'TEAM';
}

// ---- Prices -------------------------------------------------------------------------
export const priceOf = (point, id) => regions[point]?.prices?.[id]?.[0] ?? 'normal';
export const reasonOf = (point, id) => regions[point]?.prices?.[id]?.[1] ?? null;
const points4 = { free:0, normal:1, hard:2, impossible:null };
export const costOf = (point, id) => points4[priceOf(point, id)];

// ---- Errors -------------------------------------------------------------------------
// Each refusal has a code the page can translate, and a plain English message for the API.
export const errorText = {
  locked:'Your cards are locked after the event roll.',
  noPlace:'Choose your place first.',
  unknownCard:'This card does not exist.',
  alreadyChosen:'Your team already has this card.',
  impossible:'This card is impossible in your place.',
  needsParent:'First choose every card with an arrow to this one.',
  overBudget:'There are not enough points left in this tree.',
  notChosen:'Your team does not have this card.',
  cascadeChanged:'Your team changed the tree. Look again before you remove this card.',
  needsBothTrees:'Choose at least one card in each tree first.',
  fixTrees:'Fix your trees before the event.',
  treesChanged:'Your team changed the cards. Look again before you roll.',
  alreadyRolled:'Your team has already rolled the die.',
  noEvent:'Roll the die for the event first.',
  choiceMade:'Your team has already made this choice.',
  wrongChoice:'Choose trade or fight.',
  stepDone:'Your team has already done this step.',
  eventChanged:'Your team has already done this step. Look at the new result.',
  cannotLose:'You can only lose a card at the end of a branch.',
  cannotGain:'You cannot add this card now.',
  badField:'This answer cannot be saved.',
  tooLong:'This answer is too long.',
  badChip:'This choice is not on the list.',
  needsCapabilities:'This option needs working developments your team does not currently have.',
  tooMany:'Choose up to three.',
  fixedPlace:'Your teacher has set your place.',
  placeLocked:'Your team has already started building here.',
  badAction:'This action is not possible.',
  noRoll:'This card does not need a roll.',
  badDie:'The die gave an invalid number.'
};
function fail(code, status = 400) { return Object.assign(new Error(errorText[code] || code), { code, status }); }

// ---- State --------------------------------------------------------------------------
export function initialState() {
  return { v:2, mapPoint:'', tech:[], civic:[], rolls:{}, event:null, civName:'', government:'', economy:[], beliefs:'', ...Object.fromEntries(textFields.map(key => [key,''])) };
}
const cardIn = (tree, id) => trees[tree].some(card => card.id === id);
// Remove cards missing any required parent, until nothing changes.
export function pruned(list) {
  const kept = [...list];
  let changed = true;
  while (changed) {
    changed = false;
    for (const id of [...kept]) if (!parentsMet(kept, id)) { kept.splice(kept.indexOf(id), 1); changed = true; }
  }
  return kept;
}
const legacyKeys = ['placeAnswer','techAnswer','societyAnswer','contactAnswer','route'];

// Every saved state passes through here: the server on read and write, and the page before
// it applies a click. Old saves from the hex-map version keep their place, their valid
// cards and their answers (in `legacy`); tiles, trails, routes and story events are dropped.
export function normalizeState(raw) {
  const src = raw && typeof raw === 'object' ? raw : {};
  const state = initialState();
  const old = src.v !== 2;
  if (isPoint(src.fixedPoint)) state.fixedPoint = src.fixedPoint;
  state.mapPoint = isPoint(src.mapPoint) ? src.mapPoint : (state.fixedPoint || '');
  for (const tree of treeIds) {
    let list = [...new Set((Array.isArray(src[tree]) ? src[tree] : []).filter(id => typeof id === 'string' && cardIn(tree, id)))];
    if (old) list = list.filter(id => priceOf(state.mapPoint, id) !== 'impossible');
    state[tree] = pruned(list);
  }
  for (const [id, value] of Object.entries(src.rolls && typeof src.rolls === 'object' ? src.rolls : {})) {
    if (Object.hasOwn(cardById, id) && Number.isInteger(value) && value >= 1 && value <= 6) state.rolls[id] = value;
  }
  const event = src.event;
  if (!old && event && typeof event === 'object' && Number.isInteger(event.roll) && event.roll >= 1 && event.roll <= 6) {
    const ids = list => [...new Set((Array.isArray(list) ? list : []).filter(id => typeof id === 'string' && Object.hasOwn(cardById, id)))];
    state.event = { roll:event.roll, choice:['trade','fight'].includes(event.choice) ? event.choice : '', lost:ids(event.lost), gained:ids(event.gained).filter(id => state[treeOf(id)].includes(id)) };
  }
  for (const key of writableFields) if (typeof src[key] === 'string') state[key] = src[key].replace(/\r/g,'').slice(0, fieldLimit(key));
  if (chipOptions.government.includes(src.government)) state.government = src.government;
  if (chipOptions.beliefs.includes(src.beliefs)) state.beliefs = src.beliefs;
  if (Array.isArray(src.economy)) state.economy = [...new Set(src.economy.filter(value => chipOptions.economy.includes(value)))].slice(0, economyMax);
  const legacy = {};
  if (old) {
    for (const key of legacyKeys) if (typeof src[key] === 'string' && src[key].trim()) legacy[key] = src[key].slice(0, 600);
    for (const key of ['origin','encounter']) if (typeof src.events?.[key] === 'string' && src.events[key].trim()) legacy[key] = src.events[key].slice(0, 600);
  } else if (src.legacy && typeof src.legacy === 'object') {
    for (const [key, value] of Object.entries(src.legacy)) if ([...legacyKeys,'origin','encounter'].includes(key) && typeof value === 'string') legacy[key] = value.slice(0, 600);
  }
  if (Object.keys(legacy).length) state.legacy = legacy;
  return state;
}

// ---- Reading a state ----------------------------------------------------------------
export const has = (state, id) => state.tech.includes(id) || state.civic.includes(id);
// Points spent in one tree. Cards gained in the event are free.
export const spent = (state, tree) => state[tree].filter(id => !state.event?.gained.includes(id)).reduce((sum, id) => sum + (costOf(state.mapPoint, id) ?? 0), 0);
// thrives (★), works, partly (△ rolled 1–2), rolling (△ not rolled yet).
export function statusOf(state, id) {
  const price = priceOf(state.mapPoint, id);
  if (price === 'free') return 'thrives';
  if (price !== 'hard') return 'works';
  const roll = state.rolls[id];
  return !roll ? 'rolling' : roll <= 2 ? 'partly' : 'works';
}
const working = (state, list, id) => list.includes(id) && priceOf(state.mapPoint,id) !== 'impossible' && ['thrives','works'].includes(statusOf(state, id));
export const works = (state, id) => has(state,id) && priceOf(state.mapPoint,id) !== 'impossible' && ['thrives','works'].includes(statusOf(state,id));
export function choiceStatus(state, key, value) {
  const known = Object.hasOwn(optionRequirements,key) && Object.hasOwn(optionRequirements[key],value);
  const requires = known ? [...optionRequirements[key][value]] : [];
  const missing = requires.filter(id => !works(state,id));
  return { available:known && missing.length === 0, requires, missing };
}
export const choiceOptions = (state, key) => (Object.hasOwn(chipOptions,key) ? chipOptions[key] : []).map(value => ({ value,...choiceStatus(state,key,value) }));
export const availableChoiceValues = (state, key) => choiceOptions(state,key).filter(option => option.available).map(option => option.value);
export const choicesValid = (state, key) => key === 'economy' ? state.economy.length > 0 && state.economy.every(value => choiceStatus(state,key,value).available) : choiceStatus(state,key,state[key]).available;
// Minimum paid points from a fresh tree. Impossible ancestry stays impossible; paths
// above 7 are advanced stretches. A free event gain can make some fit this round.
export function minimumCost(point, id) {
  if (!isPoint(point) || !Object.hasOwn(cardById,id)) return null;
  const costs = [...prerequisiteIds(id),id].map(card => costOf(point,card));
  return costs.includes(null) ? null : costs.reduce((sum,cost) => sum + cost,0);
}
export function pickBlocker(state, tree, id) {
  if (state.event) return 'locked';
  if (!state.mapPoint) return 'place';
  if (!treeIds.includes(tree) || !cardIn(tree,id)) return 'unknown';
  if (priceOf(state.mapPoint,id) === 'impossible') return 'impossible';
  if (!parentsMet(state[tree],id)) return 'parent';
  if (spent(state,tree) + costOf(state.mapPoint,id) > BUDGET) return 'budget';
  return '';
}
// The trees as they were just before the event. The trees lock at the roll, so this is exact.
export function before(state, tree) {
  if (!state.event) return [...state[tree]];
  const lost = state.event.lost.filter(id => treeOf(id) === tree);
  return [...state[tree].filter(id => !state.event.gained.includes(id)), ...lost];
}
// Cards removed together with `id`: the card and everything missing a required parent.
export function cascadeOf(state, tree, id) {
  const rest = pruned(state[tree].filter(other => other !== id));
  return state[tree].filter(other => !rest.includes(other));
}
// Cards at the end of a branch: removing them leaves every other card connected.
export const removable = (state, tree) => state[tree].filter(id => cascadeOf(state, tree, id).length === 1);
// Foreign Trade and every civic card that grows from it (slide 22, "Foreign Trade line").
export const tradeLine = (() => { const line = ['trade']; for (let i = 0; i < line.length; i++) for (const child of childrenOf(line[i])) if (!line.includes(child.id)) line.push(child.id); return line; })();
// Cards the event may add: not chosen, possible here, and with all prerequisites chosen.
// On the trade line, at least one required arrow comes from that line itself.
export function gainable(state, line) {
  const options = [];
  for (const tree of treeIds) for (const card of trees[tree]) {
    if (has(state, card.id) || priceOf(state.mapPoint, card.id) === 'impossible' || !parentsMet(state[tree],card.id)) continue;
    if (line === 'trade') {
      if (!tradeLine.includes(card.id)) continue;
      const ok = card.id === 'trade' ? state.civic.includes('laws') : card.parents.some(parent => tradeLine.includes(parent) && state.civic.includes(parent));
      if (ok) options.push({ tree, id:card.id });
    } else options.push({ tree, id:card.id });
  }
  return options;
}
// Problems that block the event roll: over budget, a ✗ card, or a △ card without its roll.
export function treeIssues(state) {
  const issues = [];
  for (const tree of treeIds) {
    if (spent(state, tree) > BUDGET) issues.push({ code:'overBudget', tree });
    for (const id of state[tree]) {
      if (priceOf(state.mapPoint, id) === 'impossible') issues.push({ code:'impossible', tree, id });
      else if (statusOf(state, id) === 'rolling') issues.push({ code:'unrolled', tree, id });
    }
  }
  return issues;
}

// What the event asks of the team now. `protectedBy` names the working card that stopped it.
export function eventPlan(state) {
  const event = state.event;
  if (!event) return { kind:'roll', resolved:false };
  const pre = { tech:before(state,'tech'), civic:before(state,'civic') };
  const hadCard = id => pre.tech.includes(id) || pre.civic.includes(id);
  const works = id => working(state, [...pre.tech, ...pre.civic], id);
  const base = { roll:event.roll, protectedBy:'', count:0, remaining:0, options:[] };
  let need = null;
  switch (event.roll) {
    case 1: if (hadCard('irrigation') && works('masonry')) base.protectedBy = 'masonry'; break;
    case 2: if (works('construction')) base.protectedBy = 'construction'; else need = { kind:'lose', trees:['tech'], count:1 }; break;
    case 3:
      if (!event.choice) return { ...base, kind:'choose', resolved:false };
      if (event.choice === 'trade') need = { kind:'gain', line:'trade', count:1 };
      else if (works('archery')) base.protectedBy = 'archery';
      else need = { kind:'lose', trees:['tech','civic'], count:1 };
      break;
    case 4: need = { kind:'lose', trees:['civic'], count:hadCard('trade') ? 2 : 1 }; break;
    case 5: if (works('trade')) base.protectedBy = 'trade'; else need = { kind:'lose', trees:['tech'], count:1 }; break;
    case 6: need = { kind:'gain', line:'any', count:1 }; break;
  }
  if (!need) return { ...base, kind:'none', resolved:true };
  if (need.kind === 'lose') {
    const options = need.trees.flatMap(tree => removable(state, tree).map(id => ({ tree, id })));
    const remaining = options.length ? Math.max(0, need.count - event.lost.length) : 0;
    return { ...base, kind:'lose', trees:need.trees, count:need.count, remaining, options, resolved:remaining === 0 };
  }
  const options = gainable(state, need.line);
  const remaining = options.length ? Math.max(0, need.count - event.gained.length) : 0;
  return { ...base, kind:'gain', line:need.line, count:need.count, remaining, options, resolved:remaining === 0 };
}
// What each Newcomers choice would do, shown before the team decides.
export function previewChoice(state, choice) {
  return eventPlan({ ...state, event:{ ...state.event, choice } });
}

// ---- Actions ------------------------------------------------------------------------
// `rollDie` is only given by the server. Every check runs before the die is rolled, so the
// page can test an action without it: a missing die throws an error marked `needsDie`.
export function applyAction(previous, action, { rollDie } = {}) {
  const state = normalizeState(previous);
  const die = () => {
    if (!rollDie) throw Object.assign(new Error('This needs a die roll from the server.'), { needsDie:true });
    const value = rollDie();
    if (!Number.isInteger(value) || value < 1 || value > 6) throw Object.assign(fail('badDie'), { status:500 });
    return value;
  };
  const type = action?.type;
  const cardFor = tree => {
    if (!treeIds.includes(tree) || !cardIn(tree, action.id)) throw fail('unknownCard');
    return cardById[action.id];
  };
  if (type === 'pick') {
    if (state.event) throw fail('locked', 409);
    if (!state.mapPoint) throw fail('noPlace');
    const card = cardFor(action.tree);
    if (has(state, card.id)) throw fail('alreadyChosen', 409);
    const blocked = pickBlocker(state,action.tree,card.id);
    if (blocked === 'impossible') throw fail('impossible');
    if (blocked === 'parent') throw fail('needsParent');
    if (blocked === 'budget') throw fail('overBudget');
    if (priceOf(state.mapPoint, card.id) === 'hard' && !state.rolls[card.id]) state.rolls[card.id] = die();
    state[action.tree].push(card.id);
  } else if (type === 'unpick') {
    if (state.event) throw fail('locked', 409);
    const card = cardFor(action.tree);
    if (!state[action.tree].includes(card.id)) throw fail('notChosen', 409);
    const removed = cascadeOf(state, action.tree, card.id).filter(id => id !== card.id);
    const expected = Array.isArray(action.cascade) ? action.cascade : [];
    if (removed.length !== expected.length || removed.some(id => !expected.includes(id))) throw fail('cascadeChanged', 409);
    state[action.tree] = state[action.tree].filter(id => id !== card.id && !removed.includes(id));
  } else if (type === 'cardRoll') {
    if (state.event) throw fail('locked', 409);
    const tree = treeOf(action.id);
    if (!tree || !state[tree].includes(action.id)) throw fail('notChosen', 409);
    if (statusOf(state, action.id) !== 'rolling') throw fail('noRoll', 409);
    state.rolls[action.id] = die();
  } else if (type === 'eventRoll') {
    if (state.event) throw fail('alreadyRolled', 409);
    if (!state.mapPoint) throw fail('noPlace');
    if (!state.tech.length || !state.civic.length) throw fail('needsBothTrees');
    if (treeIssues(state).length) throw fail('fixTrees');
    const sameSet = (a, b) => Array.isArray(a) && a.length === b.length && b.every(id => a.includes(id));
    if (!sameSet(action.confirm?.tech, state.tech) || !sameSet(action.confirm?.civic, state.civic)) throw fail('treesChanged', 409);
    state.event = { roll:die(), choice:'', lost:[], gained:[] };
    // Drought: Irrigation is lost at once, unless working Masonry built reservoirs.
    if (state.event.roll === 1 && state.tech.includes('irrigation') && !working(state, state.tech, 'masonry')) {
      const gone = cascadeOf(state, 'tech', 'irrigation');
      state.tech = state.tech.filter(id => !gone.includes(id));
      state.event.lost.push(...gone);
    }
  } else if (type === 'eventChoice') {
    if (!state.event) throw fail('noEvent');
    if (state.event.roll !== 3) throw fail('badAction');
    if (!['trade','fight'].includes(action.choice)) throw fail('wrongChoice');
    if (state.event.choice) throw fail('choiceMade', 409);
    state.event.choice = action.choice;
  } else if (type === 'eventLose' || type === 'eventGain') {
    if (!state.event) throw fail('noEvent');
    const plan = eventPlan(state), losing = type === 'eventLose';
    if (plan.kind !== (losing ? 'lose' : 'gain') || !plan.remaining) throw fail('stepDone', 409);
    if (action.index !== (losing ? state.event.lost : state.event.gained).length) throw fail('eventChanged', 409);
    // Losses need only a card id: ids are unique across the two trees. Accept a tree
    // supplied by the UI too, and reject it if it contradicts the allowed option.
    const option = plan.options.find(option => option.id === action.id && (option.tree === action.tree || (losing && action.tree === undefined)));
    if (!option) throw fail(losing ? 'cannotLose' : 'cannotGain');
    if (losing) {
      state[option.tree] = state[option.tree].filter(id => id !== action.id);
      state.event.lost.push(action.id);
      state.event.gained = state.event.gained.filter(id => id !== action.id);
    } else {
      if (priceOf(state.mapPoint, action.id) === 'hard' && !state.rolls[action.id]) state.rolls[action.id] = die();
      state[action.tree].push(action.id);
      state.event.gained.push(action.id);
    }
  } else if (type === 'field') {
    if (!writableFields.includes(action.key) || typeof action.value !== 'string') throw fail('badField');
    if (action.value.length > fieldLimit(action.key)) throw fail('tooLong');
    state[action.key] = action.value.replace(/\r/g,'');
  } else if (type === 'chip') {
    if (!Object.hasOwn(chipOptions, action.key)) throw fail('badChip');
    const options = chipOptions[action.key];
    if (action.key === 'economy') {
      if (!options.includes(action.value)) throw fail('badChip');
      if (action.on !== undefined && typeof action.on !== 'boolean') throw fail('badChip');
      const on = action.on !== false;
      if (on && !choiceStatus(state,action.key,action.value).available) throw fail('needsCapabilities');
      if (on && !state.economy.includes(action.value)) {
        if (state.economy.length >= economyMax) throw fail('tooMany');
        state.economy.push(action.value);
      } else if (!on) state.economy = state.economy.filter(value => value !== action.value);
    } else {
      if (action.value !== '' && !options.includes(action.value)) throw fail('badChip');
      if (action.value && !choiceStatus(state,action.key,action.value).available) throw fail('needsCapabilities');
      state[action.key] = action.value;
    }
  } else if (type === 'map') {
    if (!isPoint(action.point)) throw fail('badAction');
    if (state.fixedPoint && action.point !== state.fixedPoint) throw fail('fixedPlace');
    if (state.tech.length || state.civic.length || state.event) throw fail('placeLocked');
    state.mapPoint = action.point;
  } else {
    throw fail('badAction');
  }
  return state;
}

// Check whether a valid action needs an authoritative roll. Validation errors still
// throw so callers cannot mistake an invalid card or stale event for a dice action.
export function needsDie(state, action) {
  try { applyAction(state, action); }
  catch (error) { if (error.needsDie) return true; throw error; }
  return false;
}

// Required before the team can submit. The civilization name is optional.
export function submissionGaps(raw) {
  const state = normalizeState(raw);
  const gaps = [];
  if (!state.mapPoint) gaps.push('region');
  if (!state.event) {
    if (!state.tech.length) gaps.push('tech');
    if (!state.civic.length) gaps.push('civic');
    gaps.push('event');
  } else if (!eventPlan(state).resolved) gaps.push('eventResolved');
  for (const key of textFields) {
    if (key === 'governmentAnswer' && !choicesValid(state,'government')) gaps.push('government');
    if (key === 'economyAnswer' && !choicesValid(state,'economy')) gaps.push('economy');
    if (key === 'beliefAnswer' && !choicesValid(state,'beliefs')) gaps.push('beliefs');
    if (!state[key].trim()) gaps.push(key);
  }
  return gaps;
}
