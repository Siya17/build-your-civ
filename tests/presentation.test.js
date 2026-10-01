import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, normalizeState, applyAction } from '../shared/game.js';
import { dictionary } from '../shared/i18n.js';
import { glossary } from '../shared/glossary.js';
import { regions } from '../shared/regions.js';
import { studentPage } from '../public/screens.js';
import { teacherPage, posterOverlay } from '../public/teacher.js';
import { posterMarkup } from '../public/poster.js';
import { printablePosters } from '../public/printing.js';
import { plain, rich } from '../public/ui.js';

const base = normalizeState({...initialState(), mapPoint:'G', fixedPoint:'G', tech:['pottery'], civic:['laws']});
const team = (state = base, id = 1) => ({id, name:`Team ${id}`, createdAt:'2026-10-01', submittedAt:null, state});
const context = (step, state = base, lang = 'en') => ({step, team:team(state), lang, L:dictionary[lang], ui:{step,sub:null,selected:''}, seen:new Set(), reveal:false, sync:'saved', compact:false, rolling:null, anim:null});
const button = (html, action) => html.match(new RegExp(`<button[^>]*data-act="${action}"[^>]*>`))?.[0];
const visibleText = html => plain(html.replace(/<(rt|rp)>[\s\S]*?<\/\1>/g,'').replace(/<[^>]*>/g,''));

test('unrolled event has no preview of possible outcomes in either language', () => {
  for (const lang of ['en','ja']) {
    const html = studentPage(context('eventRoll',base,lang));
    assert.match(html,/data-act="rollEvent"/);
    assert.doesNotMatch(html,/event-table/);
    for (let roll=1;roll<=6;roll++) assert(!visibleText(html).includes(plain(dictionary[lang][`event${roll}`])), `leaks outcome ${roll} in ${lang}`);
  }
});

test('actual event stays visible on result and final poster even without card changes', () => {
  const state = applyAction(base,{type:'eventRoll',confirm:{tech:base.tech,civic:base.civic}},{rollDie:()=>1});
  for (const lang of ['en','ja']) {
    for (const html of [studentPage(context('eventResult',state,lang)),posterMarkup(team(state),lang,dictionary[lang])]) {
      assert(visibleText(html).includes(plain(dictionary[lang].event1)));
      assert(visibleText(html).includes(plain(regions.G.events[1][lang])));
      assert(visibleText(html).includes(plain(dictionary[lang].noChange)));
    }
  }
});

test('society choices explain working-card requirements and keep basic beliefs available', () => {
  const government = studentPage(context('government'));
  assert.match(button(government,'chip:government:priests'),/disabled/);
  assert.match(government,/requires-government-priests/);
  assert.match(government,/Mysticism/);
  const beliefs = studentPage(context('beliefs'));
  assert.doesNotMatch(button(beliefs,'chip:beliefs:nature'),/disabled/);
  assert.match(button(beliefs,'chip:beliefs:organized'),/disabled/);
  const ritual = normalizeState({...base,civic:['laws','trade','mysticism']});
  assert.doesNotMatch(button(studentPage(context('beliefs',ritual)),'chip:beliefs:mystics'),/disabled/);
});

test('an economy option invalidated by a card loss can still be removed', () => {
  const state = normalizeState({...base,economy:['crafts']});
  const html = studentPage(context('economy',state));
  assert.match(button(html,'chip:economy:crafts'),/aria-pressed="true"/);
  assert.doesNotMatch(button(html,'chip:economy:crafts'),/disabled/);
  assert.match(button(html,'chip:economy:trade'),/disabled/);
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
  const state = applyAction(base,{type:'eventRoll',confirm:{tech:base.tech,civic:base.civic}},{rollDie:()=>1});
  fields.forEach((key,i)=>state[key]=`Argument ${i} <script>unsafe</script>`);
  const html = printablePosters([team(state,1),team(state,2),team(initialState(),3)],'en',dictionary.en);
  assert.equal((html.match(/class="print-poster"/g)||[]).length,2);
  fields.forEach((key,i)=>assert(html.includes(`Argument ${i} &lt;script&gt;unsafe&lt;/script&gt;`),key));
  assert(html.includes(dictionary.en.event1));
  assert.doesNotMatch(html,/<script>|data-nav=|data-action=/);
});

test('historical comparison includes regional hardships, limits and linked evidence', () => {
  for (const point of Object.keys(regions)) for (const lang of ['en','ja']) {
    const state = normalizeState({...base,mapPoint:point,fixedPoint:point});
    const html = studentPage(context('revealCompare',state,lang));
    assert.match(html,/class="history-context"/);
    assert(visibleText(html).includes(plain(dictionary[lang].historyLimits)));
    for (const line of regions[point].reveal.difficulty[lang]) assert(visibleText(html).includes(plain(line)));
    for (const source of regions[point].reveal.sources) assert(html.includes(source.url));
  }
});
