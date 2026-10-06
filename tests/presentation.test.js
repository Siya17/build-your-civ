import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, normalizeState, applyAction, reflectionFields } from '../shared/game.js';
import { trees } from '../shared/cards.js';
import { dictionary } from '../shared/i18n.js';
import { glossary } from '../shared/glossary.js';
import { regions } from '../shared/regions.js';
import { studentPage } from '../public/screens.js';
import { teacherPage, teacherDetailView, posterOverlay } from '../public/teacher.js';
import { posterMarkup } from '../public/poster.js';
import { printablePosters } from '../public/printing.js';
import { plain, rich } from '../public/ui.js';
import { eventPromptKind } from '../public/prompts.js';

const base = normalizeState({...initialState(), mapPoint:'G', fixedPoint:'G', tech:['pottery'], civic:['laws']});
const team = (state = base, id = 1) => ({id, name:`Team ${id}`, createdAt:'2026-10-01', submittedAt:null, state});
const context = (step, state = base, lang = 'en') => ({step, team:team(state), lang, L:dictionary[lang], ui:{step,sub:null,selected:''}, seen:new Set(), reveal:false, sync:'saved', compact:false, rolling:null, anim:null});
const button = (html, action) => html.match(new RegExp(`<button[^>]*data-act="${action}"[^>]*>`))?.[0];
const visibleText = html => plain(html.replace(/<(rt|rp)>[\s\S]*?<\/\1>/g,'').replace(/<[^>]*>/g,''));
const scriptedDice = (...faces) => () => faces.shift();

test('unrolled event has no preview of possible outcomes in either language', () => {
  for (const lang of ['en','ja']) {
    const html = studentPage(context('eventRoll',base,lang));
    assert.match(html,/data-act="rollEvent"/);
    assert.doesNotMatch(html,/event-table/);
    for (let roll=1;roll<=6;roll++) assert(!visibleText(html).includes(plain(dictionary[lang][`event${roll}`])), `leaks outcome ${roll} in ${lang}`);
  }
});

test('actual event stays visible on result and final poster even without card changes', () => {
  const state = applyAction(base,{type:'eventRoll',confirm:{tech:base.tech,civic:base.civic}},{rollDie:scriptedDice(1,1)});
  for (const lang of ['en','ja']) {
    for (const html of [studentPage(context('eventResult',state,lang)),posterMarkup(team(state),lang,dictionary[lang])]) {
      assert(visibleText(html).includes(plain(dictionary[lang].event1)));
      assert(visibleText(html).includes(plain(regions.G.events[1][lang])));
      assert(visibleText(html).includes(plain(dictionary[lang].noChange)));
    }
  }
});

test('government requirements remain visible while beliefs describe ideas available to every community', () => {
  const government = studentPage(context('government'));
  assert.match(button(government,'chip:government:priests'),/disabled/);
  assert.match(government,/requires-government-priests/);
  assert.match(government,/Mysticism/);
  const beliefs = studentPage(context('beliefs'));
  for(const value of ['ancestors','animals','river','sea','mountains','sky','gods','one','other']) {
    assert(button(beliefs,`chip:beliefs:${value}`));
    assert.doesNotMatch(button(beliefs,`chip:beliefs:${value}`),/disabled/);
  }
  assert.equal(button(beliefs,'chip:beliefs:organized'),undefined);
  assert.equal(button(beliefs,'chip:beliefs:mystics'),undefined);
  assert.equal(button(beliefs,'chip:beliefs:nature'),undefined,'the vague nature option was retired');
});

test('an economy option invalidated by a card loss can still be removed', () => {
  const state = normalizeState({...base,economy:['crafts']});
  const html = studentPage(context('economy',state));
  assert.match(button(html,'chip:economy:crafts'),/aria-pressed="true"/);
  assert.doesNotMatch(button(html,'chip:economy:crafts'),/disabled/);
  assert.match(button(html,'chip:economy:trade'),/disabled/);
});

test('students see both development trees before making suitability predictions', () => {
  for (const lang of ['en','ja']) {
    const L = dictionary[lang];
    const preview=studentPage(context('developmentPreview',base,lang));
    assert.equal((preview.match(/data-preview="/g)||[]).length,trees.tech.length+trees.civic.length);
    assert.equal((preview.match(/class="preview-tree"/g)||[]).length,2);
    for(const [treeId,tree] of Object.entries(trees))for(const development of tree) {
      assert(visibleText(preview).includes(plain(development[lang])),development.id);
      // The short definition floats on the tree; the full explanation opens on click.
      assert(preview.includes(`data-tip="${plain(development.summary[lang]).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}"`),development.id);
      assert(!visibleText(preview).includes(plain(development.what[lang])),`${development.id}: long text waits for a click`);
      const opened=studentPage({...context('developmentPreview',base,lang),ui:{step:'developmentPreview',sub:{kind:'preview',tree:treeId,id:development.id},selected:''}});
      assert(visibleText(opened).includes(plain(development.what[lang])),`${development.id}: full explanation`);
    }
    const phone=studentPage({...context('developmentPreview',base,lang),compact:true});
    for(const development of trees.tech) assert(visibleText(phone).includes(plain(development.summary[lang])),`${development.id}: inline definition on phones`);
    assert.doesNotMatch(preview,/data-act="add:|data-card=|node-price|price-groups|class="points"/);
    assert(visibleText(studentPage(context('challenge',base,lang))).includes(plain(L.predictEasy)));
    const prices = visibleText(studentPage(context('prices',base,lang)));
    assert(prices.includes(plain(L.thinkSurprise)) && prices.includes(plain(L.thinkRisk)));
    assert(!prices.includes(plain(L.predictEasy)));
  }
});

test('writing screens keep the team cards, event and society choices in view', () => {
  const state = applyAction(normalizeState({...base,government:'council'}),{type:'eventRoll',confirm:{tech:base.tech,civic:base.civic}},{rollDie:scriptedDice(6,1)});
  for (const step of ['eventAnswer','geographyAnswer','government','economy','beliefs','shapeAnswer','notChosenAnswer']) {
    const html = studentPage(context(step,state));
    const panel = html.match(/<aside class="side-panel"[\s\S]*?<\/aside>/)?.[0] ?? '';
    for (const name of ['Pottery','Code of Laws','A council of leaders',plain(dictionary.en.event6)]) assert(visibleText(panel).includes(name), `${step}: ${name}`);
  }
  for (const step of ['intro1','prices','check','poster']) assert.doesNotMatch(studentPage(context(step,state)),/side-panel/, step);
});

test('glossary honors language-specific advanced-word eligibility', () => {
  for (const [id,entry] of Object.entries(glossary)) for (const lang of ['en','ja']) {
    const html = rich(`[[${id}|${entry[lang][0]}]]`,lang);
    assert.equal(html.includes('data-term='),entry.popup?.[lang] !== false,`${id}/${lang}`);
    assert.doesNotMatch(html,/\[\[/);
  }
});

test('both roles can print a poster and teacher can print submitted posters together', () => {
  const submitted = {...team(),submittedAt:'2026-10-01'};
  const ctx = {...context('poster'),team:submitted,teams:[submitted],detail:submitted,newCodes:new Map()};
  assert.match(studentPage(ctx),/data-action="print"/);
  assert.match(posterOverlay(ctx),/data-action="print"/);
  assert.match(teacherPage(ctx,''),/data-action="print-all"/);
  assert.doesNotMatch(teacherPage({...ctx,teams:[team()]},''),/data-action="print-all"/);
});

test('printing includes all team arguments and event while keeping pages separate and escaped', () => {
  const fields = ['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','beliefAnswer','shapeAnswer','notChosenAnswer'];
  const state = applyAction(base,{type:'eventRoll',confirm:{tech:base.tech,civic:base.civic}},{rollDie:scriptedDice(1,1)});
  fields.forEach((key,i)=>state[key]=`Argument ${i} <script>unsafe</script>`);
  const html = printablePosters([team(state,1),team(state,2),team(initialState(),3)],'en',dictionary.en);
  assert.equal((html.match(/class="print-poster"/g)||[]).length,2);
  fields.forEach((key,i)=>assert(html.includes(`Argument ${i} &lt;script&gt;unsafe&lt;/script&gt;`),key));
  assert(html.includes(dictionary.en.event1));
  assert.doesNotMatch(html,/<script>|data-nav=|data-action=/);
});

test('historical readings have paragraph citations and comparisons leave the critique to students', () => {
  for (const point of Object.keys(regions)) for (const lang of ['en','ja']) {
    const state = normalizeState({...base,mapPoint:point,fixedPoint:point});
    const html = studentPage(context('revealCompare',state,lang));
    assert.doesNotMatch(html,/history-context|historyLimits|One Irrigation card|A card compresses generations/);
    const reveal=regions[point].reveal;
    for(const example of reveal.examples??[reveal]) {
      assert(visibleText(html).includes(plain(example.name[lang])));
      assert(visibleText(html).includes(plain(example.when[lang])));
    }
    const reading=studentPage(context('revealPlace',state,lang));
    assert.match(reading,/class="prose historical-reading"/);
    assert(reveal.reading.length>=3,`${point} requires a substantial factual reading`);
    for(const paragraph of reveal.reading) {
      assert(visibleText(reading).includes(plain(paragraph.text[lang])));
      assert(paragraph.sources.length>0,`${point}: each historical paragraph needs support`);
      for(const index of paragraph.sources) {
        assert(reveal.sources[index],`${point}: citation ${index} must exist`);
        assert(reading.includes(reveal.sources[index].url));
      }
    }
  }
});

test('historical reflection has three typed answers and a separate final submission', () => {
  const state=normalizeState({...base,civName:'River Keepers'});
  for(const lang of ['en','ja']) {
    for(const key of reflectionFields) {
      const before=studentPage(context(key,state,lang));
      assert.match(before,new RegExp(`<textarea[^>]*data-field="${key}"[^>]*disabled`));
      const ctx={...context(key,state,lang),team:{...team(state),submittedAt:'2026-10-02T09:00:00Z'},reveal:true};
      const enabled=studentPage(ctx);
      assert.match(enabled,new RegExp(`<textarea[^>]*data-field="${key}"[^>]*maxlength="1200"`));
      assert.doesNotMatch(enabled,new RegExp(`<textarea[^>]*data-field="${key}"[^>]*disabled`));
      assert.match(enabled,/history-evidence/);
      assert.doesNotMatch(enabled,/history-context|A card compresses generations|One Irrigation card/);
      const finalized={...state,reflection:{...state.reflection,submittedAt:'2026-10-02T09:30:00Z'}};
      assert.match(studentPage({...ctx,team:{...ctx.team,state:finalized}}),new RegExp(`<textarea[^>]*data-field="${key}"[^>]*disabled`));
    }
    const ctx={...context('reflectionSubmit',state,lang),team:{...team(state),submittedAt:'2026-10-02T09:00:00Z'},reveal:true};
    assert.match(button(studentPage(ctx),'submitReflection'),/disabled/);
    const complete={...state,reflection:{...state.reflection,...Object.fromEntries(reflectionFields.map(key=>[key,'Our typed historical evidence.']))}};
    assert.doesNotMatch(button(studentPage({...ctx,team:{...ctx.team,state:complete}}),'submitReflection'),/disabled/);
  }
});

test('the opportunity question fits positive events and all dice faces stay within one to six', () => {
  const faces=[6,4];
  const state=applyAction(base,{type:'eventRoll',confirm:{tech:base.tech,civic:base.civic}},{rollDie:()=>faces.shift()});
  assert.equal(eventPromptKind(state),'opportunity');
  for(const lang of ['en','ja']) {
    const roll=studentPage(context('eventRoll',state,lang));
    assert.equal((roll.match(/class="die-scene"/g)||[]).length,2);
    assert.match(roll,/class="die show-6"/);assert.match(roll,/class="die show-4"/);
    assert.doesNotMatch(roll,/class="die (?:show|land)-12"/);
    assert(visibleText(roll).includes(plain(dictionary[lang].event12)));
    const answer=studentPage(context('eventAnswer',state,lang));
    const question=answer.match(/<label[^>]*class="answer-label[^>]*>([\s\S]*?)<\/label>/)?.[1];
    assert(question);
    assert.equal(visibleText(question),plain(dictionary[lang].eventAnswer_opportunity));
    assert.doesNotMatch(visibleText(question),/made society more resilient|your team’s cards|チームのカード2枚/);
  }
  const legacy=normalizeState({...base,event:{roll:1,lost:[],gained:[],choice:''}});
  assert.equal((studentPage(context('eventRoll',legacy)).match(/class="die-scene"/g)||[]).length,1,'a saved old roll has no invented second face');
});

test('typed historical work is visible and escaped in teacher review, poster and print', () => {
  const state=normalizeState({...base,civName:'River Keepers',reflection:{...Object.fromEntries(reflectionFields.map((key,index)=>[key,`Historical argument ${index} <script>unsafe</script>`])),submittedAt:'2026-10-02T09:30:00Z'}});
  const submitted={...team(state),submittedAt:'2026-10-02T09:00:00Z'};
  for(const lang of ['en','ja']) {
    const ctx={...context('reflectionReview',state,lang),team:submitted,detail:submitted,reveal:true,newCodes:new Map()};
    const teacher=teacherDetailView(ctx);
    assert.match(teacher,/data-action="reopen-reflection:1"/);
    assert.match(teacher,/2026-10-02T09:30:00Z/);
    for(const html of [teacher,studentPage(ctx),posterMarkup(submitted,lang,dictionary[lang]),printablePosters([submitted],lang,dictionary[lang])]) {
      for(const [index,key]of reflectionFields.entries()) {
        assert(html.includes(`Historical argument ${index} &lt;script&gt;unsafe&lt;/script&gt;`),key);
        assert(visibleText(html).includes(plain(dictionary[lang][`writingTitle_${key}`])),key);
      }
      assert.doesNotMatch(html,/<script>/);
    }
  }
});

test('teams mark every development before the ratings, then compare their marks with them', () => {
  for (const lang of ['en','ja']) {
    const L = dictionary[lang];
    let state = applyAction(base, { type:'predict', id:'irrigation', mark:'easy' });
    state = applyAction(state, { type:'predict', id:'horseback', mark:'easy' });
    const challenge = studentPage(context('challenge', state, lang));
    assert.equal((challenge.match(/data-act="mark:/g)||[]).length, trees.tech.length + trees.civic.length);
    for (const mark of ['easy','normal','hard']) assert(button(challenge, `tool:${mark}`), mark);
    assert.match(button(challenge, 'mark:irrigation'), /m-easy/);
    for (const key of ['predictEasyNote','predictHardNote']) assert.match(challenge, new RegExp(`data-field="${key}"[^>]*maxlength="300"`));
    const prices = studentPage(context('prices', state, lang));
    for (const key of ['surpriseNote','riskNote']) assert.match(prices, new RegExp(`data-field="${key}"`));
    // Nile: Irrigation is ★ (a match); Horseback is △ (differs from "easy").
    assert(visibleText(prices).includes(plain(L.marksResult.replace('%s','2').replace('%s','1'))));
    assert.match(prices, /mark-result m-easy ok/);
    assert.match(prices, /mark-result m-easy differs/);
  }
});
