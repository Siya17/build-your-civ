import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import * as game from '../shared/game.js';
import * as flow from '../shared/flow.js';
import { dictionary } from '../shared/i18n.js';
import { trees } from '../shared/cards.js';
import { worldMap } from '../shared/regions.js';
import { studentPage } from '../public/screens.js';

// Exercise the real browser action/save functions without a browser dependency. Only
// rendering, transitions and the network boundary are replaced; rules stay shared.
const source = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8')
  .replace(/^import .*;\r?\n/gm, '').replace(/^boot\(\);\s*$/m, '');
const plain = value => JSON.parse(JSON.stringify(value));
const storage = () => { const values = new Map(); return { getItem:key => values.get(key) ?? null, setItem:(key,value) => values.set(key,String(value)) }; };
const deferred = () => { let resolve, reject; const promise = new Promise((yes,no) => { resolve=yes; reject=no; }); return { promise,resolve,reject }; };
const makeTeam = (state = game.normalizeState({ ...game.initialState(), mapPoint:'G', fixedPoint:'G' }), id = 1) => ({ id, name:`Team ${id}`, createdAt:`2026-10-01:${id}`, submittedAt:null, version:1, state });
const picked = (...ids) => ids.reduce((state,id) => game.applyAction(state, { type:'pick', tree:id === 'laws' ? 'civic' : 'tech', id }), makeTeam().state);

function client(api = async () => { throw new Error('unexpected request'); }, initial = makeTeam(), { reducedMotion = true } = {}) {
  const notices = [], timers = new Map(); let timerId = 0;
  const element = () => ({ hidden:true, addEventListener() {} });
  const elements = new Map(['#app','#notice','#skip-link','#term-pop'].map(id => [id,element()]));
  const context = vm.createContext({
    ...game, ...flow, dictionary, trees, worldMap,
    document:{ querySelector:key => elements.get(key) ?? null, querySelectorAll:() => [], addEventListener() {} },
    window:{ matchMedia:query => ({ matches:query.includes('reduced-motion') && reducedMotion, addEventListener() {} }) },
    localStorage:storage(), sessionStorage:storage(), Element:class {},
    setTimeout:(callback,delay) => { timers.set(++timerId,{ callback,delay }); return timerId; },
    clearTimeout:id => timers.delete(id), request:api, noticeSink:(message,type) => notices.push({ message,type }),
    EventSource:class { constructor(){this.listeners=new Map()} addEventListener(name,listener){this.listeners.set(name,listener)} close(){} }
  });
  vm.runInContext(`${source}\n
    render=()=>{}; updateSync=()=>{};
    transition=async(direction,change)=>change();
    toast=(message,type)=>noticeSink(message,type); api=request;
    globalThis.client={adopt,act,go,goNext,saveField,fieldInput,flushAll,withDie,doAct,openStream,
      streamEvent(name,data){stream.listeners.get(name)({data:JSON.stringify(data)})},
      setStep(step){ui.step=step},
      snapshot(){return {team,pending,drafts:[...answerDrafts],saving:[...savingFields.keys()],ui,seen:[...seen],sync}},
      idle(){return actionQueue}
    };`, context, { filename:'public/app.js' });
  const app = context.client;
  app.adopt({ authenticated:true, role:'student', name:'Alice', team:initial, roster:[], reveal:false });
  return { app, notices, timers, snapshot:() => plain(app.snapshot()) };
}
const typeAnswer = (h,key,value) => h.app.fieldInput({ dataset:{ field:key }, value });

test('rapid queued picks save drafts first and send no stale expectedVersion', async () => {
  let server = makeTeam(); const requests = [];
  const h = client(async (path,body) => {
    requests.push({ path,body:plain(body) });
    assert.equal(path, '/api/team/action');
    assert.equal(Object.hasOwn(body,'expectedVersion'), false);
    server = { ...server, version:server.version+1, state:game.applyAction(server.state,body) };
    return { team:server, roster:[] };
  });
  typeAnswer(h,'geographyAnswer','The river helps our farms.');
  const first = h.app.act({ type:'pick', tree:'tech', id:'pottery' });
  const second = h.app.act({ type:'pick', tree:'tech', id:'writing' });
  assert.deepEqual(h.snapshot().team.state.tech,['pottery','writing'], 'both picks project immediately');
  await Promise.all([first,second]);
  assert.deepEqual(requests.map(request => request.body.type),['field','pick','pick']);
  assert.equal(h.snapshot().team.version,4);
  assert.deepEqual(h.snapshot().pending,[]);
  assert.deepEqual(h.snapshot().drafts,[]);
});

test('signing out clears local work without claiming the teacher deleted the team', () => {
  for (const logout of [true,false]) {
    const h=client();typeAnswer(h,'geographyAnswer','My local draft');h.app.openStream();
    h.app.streamEvent('revoked',logout?{reason:'logout'}:{});
    assert.equal(h.snapshot().team,null);
    assert.deepEqual(h.snapshot().drafts,[]);
    assert.equal(h.notices.length,logout?0:1);
    if(!logout)assert.equal(h.notices[0].message,dictionary.en.revoked);
  }
});

test('navigation and Next retain the current screen and unread status when a save fails', async () => {
  for (const next of [false,true]) {
    const h = client(async () => { throw new Error('network unavailable'); });
    h.app.setStep('intro1'); typeAnswer(h,'geographyAnswer','Keep this draft.');
    if (next) await h.app.goNext(); else assert.equal(await h.app.go('intro2'),false);
    assert.equal(h.snapshot().ui.step,'intro1');
    assert.deepEqual(h.snapshot().seen,[]);
    assert.deepEqual(h.snapshot().drafts,[['geographyAnswer','Keep this draft.']]);
  }
});

test('a submission lock keeps unsaved text and explains that the teacher must reopen', async () => {
  const h = client(async () => { throw Object.assign(new Error('already submitted'),{ code:'submitted', status:400 }); });
  typeAnswer(h,'governmentAnswer','We choose a council.');
  await assert.rejects(h.app.saveField('governmentAnswer','We choose a council.'), error => error.message === dictionary.en.submittedSaveFailed && error.cause.code === 'submitted');
  assert.deepEqual(h.snapshot().drafts,[['governmentAnswer','We choose a council.']]);
  assert.equal(h.snapshot().team.state.governmentAnswer,'');
  assert.equal(h.notices.at(-1).message,dictionary.en.submittedSaveFailed);
});

test('a field response cannot erase a newer draft for the same answer', async () => {
  const response = deferred(), requested = deferred(); const original = makeTeam();
  const h = client(async () => { requested.resolve(); return response.promise; },original);
  typeAnswer(h,'geographyAnswer','First draft');
  const save = h.app.saveField('geographyAnswer','First draft');
  await requested.promise;
  typeAnswer(h,'geographyAnswer','Newer draft');
  response.resolve({ team:{ ...original, version:2, state:{ ...original.state, geographyAnswer:'First draft' } }, roster:[] });
  await save;
  assert.deepEqual(h.snapshot().drafts,[['geographyAnswer','Newer draft']]);
  assert.equal(h.snapshot().sync,'saving');
});

test('late field responses cannot contaminate a newly signed-in team', async () => {
  for (const fail of [false,true]) {
    const response = deferred(), requested = deferred(); const original = makeTeam();
    const h = client(async () => { requested.resolve(); return response.promise; },original);
    typeAnswer(h,'geographyAnswer','Old team draft');
    const save = h.app.saveField('geographyAnswer','Old team draft'); await requested.promise;
    h.app.adopt({ authenticated:true, role:'student', name:'Bob', team:makeTeam(undefined,2), roster:[] });
    typeAnswer(h,'geographyAnswer','New team draft');
    if (fail) response.reject(new Error('old request failed'));
    else response.resolve({ team:{ ...original, version:2, state:{ ...original.state, geographyAnswer:'Old team draft' } }, roster:[] });
    await save;
    assert.equal(h.snapshot().team.id,2);
    assert.equal(h.snapshot().team.state.geographyAnswer,'');
    assert.deepEqual(h.snapshot().drafts,[['geographyAnswer','New team draft']]);
    assert.deepEqual(h.notices,[]);
  }
});

test('an old action response and queued old actions are discarded after a new login', async () => {
  const response = deferred(), requested = deferred(); let calls = 0; const original = makeTeam();
  const h = client(async () => { calls++; requested.resolve(); return response.promise; },original);
  const first = h.app.act({ type:'pick', tree:'tech', id:'pottery' });
  const queued = h.app.act({ type:'pick', tree:'tech', id:'writing' });
  await requested.promise;
  h.app.adopt({ authenticated:true, role:'student', name:'Bob', team:makeTeam(undefined,2), roster:[] });
  response.resolve({ team:{ ...original, version:2, state:game.applyAction(original.state,{ type:'pick', tree:'tech', id:'pottery' }) }, roster:[] });
  await Promise.all([first,queued]);
  assert.equal(calls,1,'the queued action from the previous login is never sent');
  assert.equal(h.snapshot().team.id,2);
  assert.deepEqual(h.snapshot().team.state.tech,[]);
  assert.deepEqual(h.snapshot().pending,[]);
});

test('409 dice responses adopt a teammate’s existing card or event roll as success', async () => {
  for (const event of [false,true]) {
    const original = makeTeam(picked('husbandry','archery','laws'));
    const payload = event ? { type:'eventRoll', confirm:{ tech:[...original.state.tech], civic:['laws'] } } : { type:'pick', tree:'tech', id:'horseback' };
    const rolled = { ...original, version:2, state:game.applyAction(original.state,payload,{ rollDie:() => event ? 6 : 2 }) };
    const h = client(async () => { throw Object.assign(new Error('already rolled'),{ status:409, team:rolled }); },original);
    assert.equal(await h.app.withDie({ kind:event ? 'event' : 'card' },payload,event ? 'event' : 'card:horseback'),true);
    assert.deepEqual(h.snapshot().team,rolled);
    assert.equal(h.snapshot().ui.rolling,null);
    assert.deepEqual(h.snapshot().pending,[], 'dice actions are never optimistic');
    assert.equal(h.notices.at(-1).message,dictionary.en.alreadyRolledByTeammate);
  }
});

test('a failed card roll offers an enabled return to the tree instead of endless spinning', async () => {
  const h = client(async () => { throw new Error('network unavailable'); },makeTeam(picked('husbandry','archery','laws')));
  h.app.setStep('techTree');
  await h.app.doAct('add:tech:horseback');
  const state = h.snapshot();
  assert.equal(state.ui.rolling,null);
  assert.equal(state.team.state.rolls.horseback,undefined);
  const html = studentPage({ team:state.team, lang:'en', L:dictionary.en, ui:state.ui, step:state.ui.step, seen:new Set(state.seen), reveal:false, sync:state.sync, roster:[], compact:false, teamStepId:flow.teamStep(state.team,false).id, rolling:null, anim:null, flash:null });
  assert(html.includes(dictionary.en.rollFailed));
  const back = html.match(/<button[^>]*data-sub="close"[^>]*>/)?.[0];
  assert(back,'the failed roll must offer a return button');
  assert.doesNotMatch(back,/disabled/);
  assert.doesNotMatch(html,/class="die spin"/);
});

test('a dice animation from an old login cannot clear a new team’s active roll', async () => {
  const original = makeTeam(picked('husbandry','archery','laws'));
  const card = { type:'pick', tree:'tech', id:'horseback' };
  const other = makeTeam(original.state,2), newResponse = deferred(), newRequested = deferred(); let calls = 0;
  const h = client(async () => {
    if (++calls === 1) return { team:{ ...original, version:2, state:game.applyAction(original.state,card,{ rollDie:() => 4 }) }, roster:[] };
    newRequested.resolve(); return newResponse.promise;
  },original,{ reducedMotion:false });
  const oldRoll = h.app.withDie({ kind:'card', id:'horseback' },card,'card:horseback');
  await h.app.idle();
  const oldAnimation = [...h.timers.entries()].find(([,timer]) => timer.delay <= 750);
  assert(oldAnimation,'the old roll waits briefly before landing');
  h.app.adopt({ authenticated:true, role:'student', name:'Bob', team:other, roster:[] });
  const event = { type:'eventRoll', confirm:{ tech:[...other.state.tech], civic:['laws'] } };
  const newRoll = h.app.withDie({ kind:'event' },event,'event');
  await newRequested.promise;
  h.timers.delete(oldAnimation[0]); oldAnimation[1].callback();
  assert.equal(await oldRoll,false);
  assert.deepEqual(h.snapshot().ui.rolling,{ kind:'event' });
  newResponse.resolve({ team:{ ...other, version:2, state:game.applyAction(other.state,event,{ rollDie:() => 6 }) }, roster:[] });
  await h.app.idle();
  const newAnimation = [...h.timers.entries()].find(([,timer]) => timer.delay <= 750);
  assert(newAnimation); newAnimation[1].callback();
  assert.equal(await newRoll,true);
});

test('unsupported institutions are rejected locally without an optimistic change or request', async () => {
  let requests = 0;
  const h = client(async () => { requests++; throw new Error('should not send'); });
  await assert.rejects(h.app.act({ type:'chip',key:'government',value:'priests' }), error => error.code === 'needsCapabilities');
  assert.equal(requests,0);
  assert.equal(h.snapshot().team.state.government,'');
  assert.deepEqual(h.snapshot().pending,[]);
});
