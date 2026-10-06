// One render function per student screen. Each screen has one task and one primary button.
// The page (app.js) owns state and navigation; everything here only turns state into HTML.
import { regions, worldMap } from '../shared/regions.js';
import { trees, cardById, childrenOf } from '../shared/cards.js';
import { priceOf, reasonOf, costOf, spent, statusOf, eventPlan, previewChoice, treeIssues, submissionGaps, fieldLimit, choiceOptions, cascadeOf, minimumCost, economyMax, BUDGET, points, eventId, reflectionFields, reflectionGaps, predictionMarks } from '../shared/game.js';
import { chapters, steps, stepById, stepDone, stepAvailable, neighbourStep, stepApplies, stepField, chapterOf, teamStarted } from '../shared/flow.js';
import { gapKeys } from '../shared/i18n.js';
import { esc, fmt, loc, rich, plain, cardName, cardPlain, btn, priceBadge, statusBadge, priceSymbol, photo, heroPath, dieMarkup, climateCharts, eventDiceText } from './ui.js';
import { treeMarkup, blocker } from './tree.js';
import { posterMarkup } from './poster.js';
import { starters, usefulWords, eventPromptKind } from './prompts.js';
import { regionalMap } from './regional-map.js';

const icon = id => cardById[id]?.icon ?? '';
const chip = (id, lang) => `<span class="card-chip"><span aria-hidden="true">${icon(id)}</span>${cardName(cardById[id], lang)}</span>`;
const sep = lang => lang === 'ja' ? '、' : ', ';
const lines = (list, lang) => list.map(text => `<p>${rich(text, lang)}</p>`).join('');
const next = (L, disabled = false, label = L.next) => btn(`${label} <span aria-hidden="true">→</span>`, { nav:'next' }, { disabled });

// ---- Frame ----------------------------------------------------------------------------
function topbar(ctx) {
  const { L, team, sync } = ctx;
  return `<header class="topbar"><div class="brand"><span aria-hidden="true">✦</span> ${L.brand}</div>
    <div class="top-actions"><div class="team-chip"><small>${L.team}</small><strong>${esc(team.name)}</strong></div>
    <span class="sync ${sync}" id="sync" aria-live="polite">${sync === 'offline' ? L.reconnecting : sync === 'saving' ? L.saving : L.save}</span>
    <button type="button" class="lang" data-action="language" lang="${ctx.lang === 'en' ? 'ja' : 'en'}">${L.language}</button>
    <button type="button" class="text-button" data-action="logout">${L.signout}</button></div></header>`;
}
function progress(ctx) {
  const { L, team, seen, reveal, step } = ctx, current = chapterOf(step);
  const items = chapters.map((chapter, i) => {
    const first = steps.find(item => item.chapter === chapter && stepApplies(item.id, team));
    const reachable = first && stepAvailable(first.id, team, seen, reveal);
    const done = steps.filter(item => item.chapter === chapter && stepApplies(item.id, team)).every(item => stepDone(item.id, team, seen, reveal));
    const state = chapter === current ? 'current' : done && reachable ? 'done' : reachable ? 'open' : 'locked';
    return `<li class="ch-${state}"><button type="button" data-nav="chapter:${chapter}" ${reachable && chapter !== current ? '' : 'disabled'} ${chapter === current ? 'aria-current="step"' : ''}><b>${state === 'done' ? '✓' : i + 1}</b><span>${L[`ch_${chapter}`]}</span></button></li>`;
  }).join('');
  return `<nav class="chapters" aria-label="${esc(L.progressLabel)}"><ol>${items}</ol></nav>`;
}
function frame(ctx, screen) {
  const { L, step, team, seen, reveal } = ctx;
  const chapter = chapterOf(step), inChapter = steps.filter(item => item.chapter === chapter && stepApplies(item.id, team));
  const index = inChapter.findIndex(item => item.id === step) + 1;
  const backTarget = screen.back === undefined ? (neighbourStep(step, team, -1) ? btn(`<span aria-hidden="true">←</span> ${L.back}`, { nav:'back' }, { kind:'ghost' }) : '') : screen.back;
  const ahead = ctx.teamStepId && teamStarted(team) && chapters.indexOf(chapterOf(ctx.teamStepId)) > chapters.indexOf(chapter) && stepById[step].kind === 'seen' && !team.submittedAt
    ? `<div class="team-ahead" role="note"><span>${fmt(L.teamAhead, `${L[`ch_${chapterOf(ctx.teamStepId)}`]}`)}</span>${btn(L.jumpToTeam, { nav:'team' }, { kind:'small' })}</div>` : '';
  return `<div class="shell" data-student>${topbar(ctx)}${progress(ctx)}${ahead}
    <main id="main" class="screen ${screen.wide || screen.side ? 'wide' : ''} ${screen.cls ?? ''}" tabindex="-1">
      <div class="screen-inner">
        <p class="eyebrow">${fmt(L.chapterWord, chapters.indexOf(chapter) + 1)} · ${L[`ch_${chapter}`]}${index && !screen.sub ? ` <span class="step-count">${fmt(L.step, index, inChapter.length)}</span>` : ''}</p>
        <h1 id="screen-title" tabindex="-1">${screen.title}</h1>
        ${screen.lead ? `<p class="lead">${screen.lead}</p>` : ''}
        ${screen.side ? `<div class="has-side"><div>${screen.body}</div>${screen.side}</div>` : screen.body}
      </div>
      <footer class="screen-nav">${backTarget}<span class="spacer"></span>${screen.secondary ?? ''}${screen.primary ?? ''}</footer>
    </main></div>`;
}

// ---- Shared pieces --------------------------------------------------------------------
function worldMapMarkup(ctx, { pick = false, zoom = '' } = {}) {
  const { L, team, lang } = ctx, current = team.state.mapPoint;
  const dots = points.map(letter => {
    const label = `${letter} · ${plain(regions[letter].name[lang])}`;
    return pick ? `<button type="button" class="map-dot ${current === letter ? 'active' : ''}" data-map="${letter}" data-act="map:${letter}" aria-pressed="${current === letter}" aria-label="${esc(label)}">${letter}</button>`
      : `<span class="map-dot ${current === letter ? 'active' : ''}" data-map="${letter}" aria-hidden="true">${letter}</span>`;
  }).join('');
  return `<div class="world-map ${zoom ? `zoom-${zoom}` : ''}"><img src="${worldMap.image}" alt="${esc(L.mapAlt)}" decoding="async" />${dots}</div>`;
}
const priceList = (ctx, price) => {
  const { team, lang, L } = ctx, point = team.state.mapPoint;
  const ids = [...trees.tech, ...trees.civic].map(card => card.id).filter(id => priceOf(point, id) === price);
  return `<section class="price-group p-${price}"><h2>${priceBadge(price, L)}</h2>${ids.length ? `<ul>${ids.map(id => `<li>${chip(id, lang)}${markResult(ctx, id)}<p>${rich(reasonOf(point, id)[lang], lang)}</p></li>`).join('')}</ul>` : `<p class="muted">${L.pricesNone}</p>`}</section>`;
};
const pointsMeter = (state, tree, L) => {
  const used = spent(state, tree);
  return `<div class="points" role="img" aria-label="${esc(fmt(L.pointsUsed, used))}"><div class="pips">${Array.from({ length:BUDGET }, (_, i) => `<i class="${i < used ? 'used' : ''}"></i>`).join('')}${used > BUDGET ? `<i class="over"></i>`.repeat(used - BUDGET) : ''}</div><span>${fmt(L.pointsUsed, used)}</span></div>`;
};
// Short, optional team answers to the "Think with your team" prompts. They save like other answers.
function notes(ctx, items) {
  const { team, lang, L } = ctx, state = team.state, locked = !!team.submittedAt;
  return `<aside class="think"><h2>💭 ${rich(L.thinkTitle, lang)}</h2>${items.map(([key, question]) => `<div class="answer short-note"><label for="field-${key}" class="answer-label">${rich(question, lang)}</label><small class="presence" data-presence="${key}"></small><textarea id="field-${key}" data-field="${key}" maxlength="${fieldLimit(key)}" rows="2" placeholder="${esc(plain(L.notePh))}" ${locked ? 'disabled' : ''}>${esc(state[key])}</textarea><small class="count" data-count-for="${key}">${fmt(L.charsLeft, fieldLimit(key) - state[key].length)}</small></div>`).join('')}</aside>`;
}
// What a regional price means as a prediction: ★ easy, unlisted normal, △ or ✗ difficult.
const expectedMark = price => price === 'free' ? 'easy' : price === 'normal' ? 'normal' : 'hard';
function markResult(ctx, id) {
  const { team, L } = ctx, mark = team.state.predictions?.[id] || 'normal';
  const ok = mark === expectedMark(priceOf(team.state.mapPoint, id));
  return `<span class="mark-result m-${mark} ${ok ? 'ok' : 'differs'}">${esc(fmt(L.yourMark, L[`mark_${mark}`]))} · ${ok ? `✓ ${esc(L.markMatch)}` : `≠ ${esc(L.markDiffers)}`}</span>`;
}
const legend = L =>`<div class="legend" aria-label="${esc(L.legend)}">${['free','normal','hard','impossible'].map(price => priceBadge(price, L)).join('')}</div>`;
function historicalReading(reveal, lang, L) {
  const sources = reveal.sources ?? [];
  const paragraphs = reveal.reading ?? reveal.facts[lang].map(text=>({text:{[lang]:text},sources:[]}));
  return `<div class="prose historical-reading">${paragraphs.map(paragraph=>`<p>${rich(paragraph.text[lang],lang)}</p>${paragraph.sources?.length ? `<p class="paragraph-sources">${paragraph.sources.map(index=>sources[index]).filter(Boolean).map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener">${rich(source.title[lang],lang,{terms:false})}</a>`).join(' · ')}</p>` : ''}`).join('')}</div><p class="small history-sources"><strong>${L.historySources}:</strong> ${sources.map(source=>`<a href="${esc(source.url)}" target="_blank" rel="noopener">${rich(source.title[lang],lang,{terms:false})}</a>`).join(' · ')}</p>`;
}
function historyWriting(ctx,key) {
  const {L,lang,team}=ctx, reveal=regions[team.state.mapPoint].reveal;
  return {title:rich(L[`writingTitle_${key}`],lang),body:writing(ctx,key,{extra:`<details class="history-evidence"><summary>${rich(L.historySources,lang)}</summary>${historicalReading(reveal,lang,L)}</details>`}),primary:next(L,!stepDone(key,team))};
}

// A writing task: the question, one answer box, then ideas to start with.
function writing(ctx, key, { extra = '', chips = '', hideLabel = false } = {}) {
  const { team, lang, L } = ctx, state = team.state, reflection = reflectionFields.includes(key);
  const locked = reflection ? !ctx.reveal || !team.submittedAt || !!state.reflection?.submittedAt : !!team.submittedAt;
  const value = reflection ? state.reflection?.[key] ?? '' : state[key];
  const question = key === 'eventAnswer' ? L[`eventAnswer_${eventPromptKind(state)}`] : L[key];
  const ideas = starters(key, state, lang), words = usefulWords(key, lang), left = fieldLimit(key) - value.length;
  return `${chips}${extra}<div class="answer">
      <label for="field-${key}" class="answer-label${hideLabel ? ' sr-only' : ''}">${rich(question, lang)}</label><small class="presence" data-presence="${key}"></small>
      <textarea id="field-${key}" data-field="${key}" maxlength="${fieldLimit(key)}" rows="7" placeholder="${esc(plain(reflection?L.historyAnswerPh:L.answerPh))}" ${locked ? 'disabled' : ''}>${esc(value)}</textarea>
      <small class="count" data-count-for="${key}">${fmt(L.charsLeft, left)}</small></div>
    ${ideas.length ? `<aside class="ideas"><h2>${L.startersTitle}</h2><ul>${ideas.map(text => `<li>${esc(text)}</li>`).join('')}</ul>${words.length ? `<h3>${L.wordsTitle}</h3><p class="words">${words.map(word => `<span>${rich(word, lang)}</span>`).join('')}</p>` : ''}</aside>` : ''}`;
}
function chipGroup(ctx, group) {
  const { team, lang, L } = ctx, state = team.state, multi = group === 'economy', locked = !!team.submittedAt;
  return `<p class="context-strip">${rich(L[`choiceScope_${group}`] ?? L.choiceScope, lang)}</p><div class="chips" role="group" aria-label="${esc(L[`${group === 'beliefs' ? 'beliefs' : group}Title`])}">${choiceOptions(state, group).map(option => {
    const { value, available, requires } = option;
    const on = multi ? state.economy.includes(value) : state[group] === value;
    const full = multi && !on && state.economy.length >= economyMax;
    const reasonId = `requires-${group}-${value}`;
    const reason = requires.length ? fmt(L.choiceRequires, requires.map(id=>cardPlain(cardById[id],lang)).join(sep(lang))) : '';
    return `<div class="chip-choice ${!available ? 'unavailable' : ''}"><button type="button" class="chip-option ${on ? 'on' : ''}" data-act="chip:${group}:${value}" aria-pressed="${on}" ${reason ? `aria-describedby="${reasonId}"` : ''} ${locked || full || (!available && !(multi && on)) ? 'disabled' : ''}>${rich(L[`chips_${group}`][value], lang, { terms:false })}${!available ? ' 🔒' : ''}</button>${reason ? `<small id="${reasonId}">${esc(plain(reason))}</small>` : ''}</div>`;
  }).join('')}</div>`;
}

// ---- Screens --------------------------------------------------------------------------
const screens = {
  intro1(ctx) { const { L, lang } = ctx; return { title:rich(L.intro1Title, lang), body:`<div class="prose big">${lines(L.intro1Lines, lang)}</div><div class="hero-map small">${worldMapMarkup(ctx)}</div>`, primary:next(L, false, L.start), wide:true }; },
  intro2(ctx) {
    const { L, lang } = ctx, icons = ['🗺️','🃏','🎲','🎤'];
    return { title:rich(L.intro2Title, lang), body:`<ol class="four-steps">${L.intro2Steps.map((text, i) => `<li><span class="step-icon" aria-hidden="true">${icons[i]}</span><span class="num">${i + 1}</span><p>${rich(text, lang)}</p></li>`).join('')}</ol>`, primary:next(L) };
  },
  intro3(ctx) {
    const { L, lang } = ctx;
    return { title:rich(L.intro3Title, lang), lead:rich(L.intro3Lead, lang), body:`<ul class="price-rules">${['free','normal','hard','impossible'].map(price => `<li class="p-${price}"><span class="symbol" aria-hidden="true">${priceSymbol[price]}</span><div><strong>${rich(L[`price_${price}`], lang)}</strong><p>${rich(L[`priceRule_${price}`], lang)}</p></div>${price === 'hard' ? dieMarkup(5, 'still') : ''}</li>`).join('')}</ul>
      <div class="arrow-demo"><span class="mini-node">${chip('pottery', lang)}</span><span class="mini-arrow" aria-hidden="true">→</span><span class="mini-node">${chip('irrigation', lang)}</span><p>${rich(L.intro3Arrows, lang)}</p></div>`, primary:next(L) };
  },
  choosePlace(ctx) {
    const { L, lang, team } = ctx, point = team.state.mapPoint;
    return { title:rich(L.choosePlaceTitle, lang), lead:rich(L.choosePlaceLead, lang), wide:true,
      body:`<div class="hero-map pick">${worldMapMarkup(ctx, { pick:true })}</div><p class="choice-line">${point ? `${L.yourLetter}: <strong>${point} · ${rich(regions[point].name[lang], lang, { terms:false })}</strong>` : ''}</p><p class="muted">${rich(L.choosePlaceChange, lang)}</p>`,
      primary:next(L, !point) };
  },
  where(ctx) {
    const { L, lang, team } = ctx, point = team.state.mapPoint, region = regions[point];
    return { title:`<span class="letter-badge">${point}</span> ${rich(region.name[lang], lang, { terms:false })}`, lead:rich(region.tagline[lang], lang), wide:true,
      body:`<p class="area">📍 ${rich(region.area[lang], lang, { terms:false })}</p>${regionalMap(region, lang)}<div class="where-stage still">${worldMapMarkup(ctx)}${photo(`${point}/hero.webp`, plain(region.name[lang]), { cls:'where-photo', eager:true, lang })}</div>`,
      primary:next(L) };
  },
  land(ctx) {
    const { L, lang, team } = ctx, point = team.state.mapPoint, region = regions[point];
    return { title:rich(L.landTitle, lang), wide:true, body:`<div class="split">${photo(`${point}/land.webp`, plain(region.name[lang]), { eager:true })}<div class="prose">${lines(region.context?.[lang] ?? region.land[lang], lang)}<p class="hint">💬 ${rich(L.tapWords, lang)}</p></div></div>`, primary:next(L) };
  },
  climate(ctx) {
    const { L, lang, team } = ctx, region = regions[team.state.mapPoint];
    return { title:rich(L.climateTitle, lang), lead:rich(region.climate.summary[lang], lang), wide:true,
      body:`${climateCharts(region.climate, L, lang)}<p class="muted small">${esc(fmt(L.climateNote, region.climate.station))} · ${esc(region.climate.source)}</p>`, primary:next(L) };
  },
  resources(ctx) {
    const { L, lang, team } = ctx, point = team.state.mapPoint, region = regions[point];
    return { title:rich(L.resourcesTitle, lang), lead:rich(L.resourcesLead, lang), wide:true,
      body:`<ul class="resource-grid">${region.resources.map(item => `<li>${photo(`${point}/${item.id}.webp`, plain(item[lang]))}<h2>${rich(item[lang], lang, { terms:false })}</h2><p>${rich(item.text[lang], lang)}</p></li>`).join('')}</ul>`, primary:next(L) };
  },
  developmentPreview(ctx) {
    const { L, lang, team, ui, compact } = ctx;
    if (ui.sub?.kind === 'preview') {
      const card = cardById[ui.sub.id];
      return { sub:true, title:cardName(card,lang), lead:rich(card.summary[lang],lang), body:`<section class="prose"><p>${rich(card.what[lang],lang)}</p></section>`, back:'', primary:btn(L.backToTree,{sub:'close'}) };
    }
    const neutral = {...team.state,tech:[],civic:[]};
    return {title:rich(L.previewTitle,lang),lead:rich(L.previewLead,lang),wide:true,
      body:['tech','civic'].map(tree=>`<section class="preview-tree"><h2>${rich(L[tree==='tech'?'previewTechTitle':'previewCivicTitle'],lang)}</h2>${treeMarkup(neutral,tree,lang,L,{compact,preview:true})}</section>`).join(''), primary:next(L)};
  },
  challenge(ctx) {
    const { L, lang, team } = ctx, point = team.state.mapPoint, region = regions[point];
    const { ui, compact } = ctx, tool = ui.markTool || 'easy', locked = !!team.submittedAt, neutral = { ...team.state, tech:[], civic:[] };
    const tools = `<div class="mark-tools" role="group" aria-label="${esc(L.markTools)}">${predictionMarks.map(mark => `<button type="button" class="mark-tool m-${mark}" data-act="tool:${mark}" aria-pressed="${tool === mark}" ${locked ? 'disabled' : ''}>${esc(L[`mark_${mark}`])}</button>`).join('')}</div><p class="muted small">${rich(L.markHint, lang)}</p>`;
    const markTrees = ['tech','civic'].map(tree => `<section class="preview-tree"><h3>${rich(L[tree === 'tech' ? 'previewTechTitle' : 'previewCivicTitle'], lang)}</h3>${treeMarkup(neutral, tree, lang, L, { compact, mark:true, marks:team.state.predictions, locked })}</section>`).join('');
    return { title:rich(L.challengeTitle, lang), wide:true, body:`<div class="split">${photo(`${point}/challenge.webp`, plain(region.challenge[lang][0]), { eager:true })}<ul class="challenge-list">${region.challenge[lang].map(text => `<li>${rich(text, lang)}</li>`).join('')}</ul></div><section class="mark-panel"><h2>🏷️ ${rich(L.markTitle, lang)}</h2><p>${rich(L.markLead, lang)}</p>${tools}${markTrees}</section>${notes(ctx, [['predictEasyNote', L.predictEasy], ['predictHardNote', L.predictHard]])}`, primary:next(L) };
  },
  prices(ctx) {
    const { L, lang, team } = ctx, predictions = team.state.predictions || {}, all = [...trees.tech, ...trees.civic];
    const matched = all.filter(card => (predictions[card.id] || 'normal') === expectedMark(priceOf(team.state.mapPoint, card.id))).length;
    return { title:rich(L.pricesTitle, lang), lead:rich(L.pricesLead, lang), wide:true,
      body:`<p class="marks-result">${esc(fmt(L.marksResult, Object.keys(predictions).length, matched, all.length))}</p><div class="price-groups">${priceList(ctx,'free')}${priceList(ctx,'hard')}${priceList(ctx,'impossible')}</div>${notes(ctx, [['surpriseNote', L.thinkSurprise], ['riskNote', L.thinkRisk]])}`, primary:next(L) };
  },
  techIntro: ctx => treeIntro(ctx, 'tech'),
  civicIntro: ctx => treeIntro(ctx, 'civic'),
  techTree: ctx => treeScreen(ctx, 'tech'),
  civicTree: ctx => treeScreen(ctx, 'civic'),
  techReview: ctx => review(ctx, 'tech'),
  civicReview: ctx => review(ctx, 'civic'),
  eventRoll(ctx) {
    const { L, lang, team, rolling, anim } = ctx, state = team.state;
    if (rolling?.kind === 'event' || state.event) {
      const value = eventId(state.event), mode = !value ? 'spin' : anim?.key === 'event' ? 'land' : 'still';
      const dice = state.event?.dice ?? [1,1];
      return { title:rich(L.eventRollTitle, lang), body:`<div class="roll-stage"><div class="event-dice">${dice.map(face=>dieMarkup(face,mode)).join('')}</div><p class="roll-result" aria-live="polite">${value && mode !== 'land' ? `${eventDiceText(state.event)} <strong>${rich(L[`event${value}`], lang)}</strong>` : L.rollWaiting}</p></div>`,
        primary:next(L, !value || mode === 'land', L.seeEvent) };
    }
    const issues = treeIssues(state), missing = !state.tech.length || !state.civic.length;
    const problem = missing ? L.eventNeedsTrees : issues.length ? fmt(L.eventFixTrees, issues.map(issue => issue.id ? cardPlain(cardById[issue.id], lang) : L[`tree_${issue.tree}`]).join(sep(lang))) : '';
    return { title:rich(L.eventRollTitle, lang), lead:rich(L.eventRollLead, lang),
      body:`<div class="unknown-event"><span aria-hidden="true">🎲</span><p>${rich(L.eventUnknown, lang)}</p></div><div class="two-col"><section><h2>${L.tree_tech}</h2><p>${state.tech.map(id=>chip(id,lang)).join(' ')}</p></section><section><h2>${L.tree_civic}</h2><p>${state.civic.map(id=>chip(id,lang)).join(' ')}</p></section></div><p class="warning">🔒 ${rich(L.eventRollLock, lang)}</p>${team.submittedAt ? `<p class="error-note">${rich(L.submittedSaveFailed, lang)}</p>` : ''}${problem ? `<p class="error-note">${esc(plain(problem))}</p>` : ''}`,
      primary:btn(`🎲 ${L.rollEvent}`, { act:'rollEvent' }, { disabled:!!problem || !!team.submittedAt }) };
  },
  eventCard(ctx) {
    const { L, lang, team } = ctx, state = team.state, roll = eventId(state.event), region = regions[state.mapPoint], plan = eventPlan(state);
    return { title:rich(L.eventCardTitle, lang), cls:'flip-in',
      body:`<article class="event-card e${roll}"><div class="event-num">${roll}</div><h2>${rich(L[`event${roll}`], lang)}</h2><p class="flavour">${rich(region.events[roll][lang], lang)}</p>
        <div class="rule"><h3>${L.ruleLabel}</h3><p>${rich(L[`eventRule${roll}`], lang)}</p></div>
        <div class="for-you"><h3>${L.forYou}</h3><p>${consequence(ctx, plan, true)}</p></div></article>`, primary:next(L) };
  },
  eventResolve(ctx) {
    const { L, lang, team, ui, rolling, anim } = ctx, state = team.state, plan = eventPlan(state);
    if (plan.kind === 'choose') {
      const trade = previewChoice(state, 'trade'), fight = previewChoice(state, 'fight');
      const choice = ui.selected === 'choice:trade' ? 'trade' : ui.selected === 'choice:fight' ? 'fight' : '';
      const tradeText = trade.options.length ? fmt(L.tradeGives, trade.options.map(option => cardPlain(cardById[option.id], lang)).join(sep(lang))) : L.tradeNothing;
      const fightText = fight.protectedBy ? L.fightSafe : L.fightLose;
      return { title:rich(L.resolveTitle, lang), lead:rich(L.youMustChoose, lang),
        body:`<div class="choice-cards"><div class="choice ${choice === 'trade' ? 'selected' : ''}"><h2>🤝 ${rich(L.chooseTrade, lang)}</h2><p>${esc(plain(tradeText))}</p>${btn(rich(L.chooseTrade, lang), { select:'choice:trade' }, { kind:'secondary', disabled:!!team.submittedAt })}</div>
          <div class="choice ${choice === 'fight' ? 'selected' : ''}"><h2>🏹 ${rich(L.chooseFight, lang)}</h2><p>${rich(fightText, lang)}</p>${btn(rich(L.chooseFight, lang), { select:'choice:fight' }, { kind:'secondary', disabled:!!team.submittedAt })}</div></div><p class="warning">${rich(L.choiceFinal, lang)}</p>`,
        primary:btn(`${L.confirmChoice}${choice ? `: ${choice === 'trade' ? L.chooseTrade : L.chooseFight}` : ''}`, { act:`choice:${choice}` }, { disabled:!choice || !!team.submittedAt }) };
    }
    const gainedId = state.event.gained.at(-1);
    const dieBlock = (rolling?.kind === 'gain' || (gainedId && priceOf(state.mapPoint, gainedId) === 'hard' && anim?.key === `gain:${gainedId}`))
      ? `<div class="roll-stage small">${dieMarkup(state.rolls[gainedId] || 1, rolling ? 'spin' : 'land')}</div>` : '';
    if (plan.resolved) return { title:rich(L.resolveTitle, lang), body:`${dieBlock}<p class="done-note">✓ ${rich(L.resolvedNote, lang)}</p>${changes(ctx)}`, primary:next(L, rolling || anim?.key?.startsWith('gain')) };
    const losing = plan.kind === 'lose', selected = ui.selected;
    const options = plan.options.map(option => `<button type="button" class="pick-option ${selected === `${option.tree}:${option.id}` ? 'on' : ''}" data-select="${option.tree}:${option.id}" aria-pressed="${selected === `${option.tree}:${option.id}`}"><span aria-hidden="true">${icon(option.id)}</span>${cardName(cardById[option.id], lang)}<small>${L[`tree_${option.tree}`]} · ${priceBadge(priceOf(state.mapPoint, option.id), L)}</small></button>`).join('');
    const [tree, id] = (selected || ':').split(':'), valid = plan.options.some(option => option.tree === tree && option.id === id);
    const label = valid ? fmt(losing ? L.loseThis : L.gainThis, cardPlain(cardById[id], lang)) : (losing ? L.loseThis : L.gainThis).replace('%s', '…');
    return { title:rich(L.resolveTitle, lang), lead:losing ? esc(fmt(L.pickToLose, plan.remaining)) : rich(L.pickToGain, lang),
      body:`${dieBlock}<div class="pick-options">${options}</div>${losing ? `<p class="muted">${rich(L.loseHint, lang)}</p>` : ''}`,
      primary:btn(esc(label), { act:`${losing ? 'lose' : 'gain'}:${valid ? `${tree}:${id}` : ''}` }, { disabled:!valid || !!team.submittedAt || !!rolling }) };
  },
  eventResult(ctx) { const { L, lang, team } = ctx, event = team.state.event; return { title:rich(L.resultTitle, lang), body:`<div class="event-recap"><strong>🎲 ${eventDiceText(event)} · ${rich(L[`event${eventId(event)}`], lang)}</strong><p>${rich(regions[team.state.mapPoint].events[eventId(event)][lang], lang)}</p></div>${changes(ctx)}`, primary:next(L) }; },
  eventAnswer(ctx) { const { L, lang, team } = ctx; return { title:rich(L.writingTitle_eventAnswer, lang), body:writing(ctx, 'eventAnswer'), primary:next(L, !stepDone('eventAnswer', team)) }; },
  civName(ctx) {
    const { L, lang, team } = ctx;
    return { title:rich(L.civNameTitle, lang), lead:rich(L.civNameLead, lang),
      body:`<div class="answer short"><label for="field-civName" class="answer-label">${rich(L.civName, lang)}</label><small class="presence" data-presence="civName"></small><input id="field-civName" data-field="civName" maxlength="40" autocomplete="off" placeholder="${esc(plain(L.civNamePh))}" value="${esc(team.state.civName)}" ${team.submittedAt ? 'disabled' : ''} /></div>`,
      primary:next(L, !stepDone('civName',team)) };
  },
  geographyAnswer(ctx) {
    const { L, lang, team } = ctx, state = team.state, region = regions[state.mapPoint];
    const free = [...state.tech, ...state.civic].filter(id => priceOf(state.mapPoint, id) === 'free');
    return { title:rich(L.writingTitle_geographyAnswer, lang), body:writing(ctx, 'geographyAnswer', { extra:`<div class="context-strip"><strong>${state.mapPoint} · ${rich(region.name[lang], lang, { terms:false })}</strong> · ${region.resources.map(item => rich(item[lang], lang, { terms:false })).join(sep(lang))}${free.length ? `<br>★ ${free.map(id => cardName(cardById[id], lang)).join(sep(lang))}` : ''}</div>` }), primary:next(L, !stepDone('geographyAnswer', team)) };
  },
  government(ctx) { const { L, lang, team } = ctx; return { title:rich(L.governmentTitle, lang), lead:rich(L.governmentLead, lang), body:writing(ctx, 'governmentAnswer', { chips:chipGroup(ctx, 'government') }), primary:next(L, !stepDone('government', team)) }; },
  economy(ctx) { const { L, lang, team } = ctx; return { title:rich(L.economyTitle, lang), lead:rich(L.economyLead, lang), body:writing(ctx, 'economyAnswer', { chips:chipGroup(ctx, 'economy') }), primary:next(L, !stepDone('economy', team)) }; },
  beliefs(ctx) { const { L, lang, team } = ctx; return { title:rich(L.beliefsTitle, lang), lead:rich(L.beliefsLead, lang), body:writing(ctx, 'beliefAnswer', { chips:chipGroup(ctx, 'beliefs') }), primary:next(L, !stepDone('beliefs', team)) }; },
  shapeAnswer(ctx) { const { L, lang, team } = ctx; return { title:rich(L.writingTitle_shapeAnswer, lang), body:writing(ctx, 'shapeAnswer'), primary:next(L, !stepDone('shapeAnswer', team)) }; },
  notChosenAnswer(ctx) {
    const { L, lang, team } = ctx, state = team.state, all = [...trees.tech, ...trees.civic].map(card => card.id).filter(id => !state.tech.includes(id) && !state.civic.includes(id));
    const feasible = all.filter(id=>{const cost=minimumCost(state.mapPoint,id);return Number.isFinite(cost)&&cost<=BUDGET});
    return { title:rich(L.writingTitle_notChosenAnswer, lang), body:writing(ctx, 'notChosenAnswer', { extra:`<div class="context-strip"><p>${rich(L.notChosenHelp, lang)}</p><p>${feasible.map(id=>cardName(cardById[id],lang)).join(sep(lang))}</p></div>` }), primary:next(L, !stepDone('notChosenAnswer', team)) };
  },
  check(ctx) {
    const { L, lang, team } = ctx, state = team.state;
    const row = (label, value, target) => `<div class="check-row"><dt>${label}</dt><dd>${value || '<span class="muted">—</span>'}</dd><dd class="edit">${team.submittedAt ? '' : btn(L.edit, { nav:`step:${target}` }, { kind:'small' })}</dd></div>`;
    const text = key => state[key].trim() ? esc(state[key]) : '';
    const chipText = (group, values) => [].concat(values).filter(Boolean).map(value => esc(plain(L[`chips_${group}`][value]))).join(sep(lang));
    return { title:rich(L.checkTitle, lang), lead:rich(L.checkLead, lang), wide:true,
      body:`<dl class="check">${row(rich(L.civName, lang), esc(state.civName), 'civName')}
        ${row(L.tree_tech, state.tech.map(id => chip(id, lang)).join(' '), 'techReview')}${row(L.tree_civic, state.civic.map(id => chip(id, lang)).join(' '), 'civicReview')}
        ${row(rich(L.writingTitle_eventAnswer, lang), text('eventAnswer'), 'eventAnswer')}${row(rich(L.writingTitle_geographyAnswer, lang), text('geographyAnswer'), 'geographyAnswer')}
        ${row(rich(L.governmentTitle, lang), [chipText('government', state.government), text('governmentAnswer')].filter(Boolean).join('<br>'), 'government')}
        ${row(rich(L.economyTitle, lang), [chipText('economy', state.economy), text('economyAnswer')].filter(Boolean).join('<br>'), 'economy')}
        ${row(rich(L.beliefsTitle, lang), [chipText('beliefs', state.beliefs), text('beliefAnswer')].filter(Boolean).join('<br>'), 'beliefs')}
        ${row(rich(L.writingTitle_shapeAnswer, lang), text('shapeAnswer'), 'shapeAnswer')}${row(rich(L.writingTitle_notChosenAnswer, lang), text('notChosenAnswer'), 'notChosenAnswer')}</dl>`, primary:next(L) };
  },
  submit(ctx) {
    const { L, lang, team } = ctx;
    if (team.submittedAt) return { title:`✓ ${rich(L.submitted, lang)}`, body:`<p class="done-note">${rich(L.submittedNote, lang)}</p>`, primary:next(L) };
    const gaps = submissionGaps(team.state);
    const targets = { region:'choosePlace', tech:'techTree', civic:'civicTree', event:'eventRoll', eventResolved:'eventResolve', government:'government', economy:'economy', beliefs:'beliefs', ...Object.fromEntries(Object.entries(stepField).map(([step, field]) => [field, step])) };
    return { title:rich(L.submitTitle, lang), lead:rich(L.submitLead, lang),
      body:gaps.length ? `<div class="gaps"><h2>${rich(L.gapsTitle, lang)}</h2><ul>${gaps.filter(gap => gapKeys.includes(gap)).map(gap => `<li>${btn(rich(L[gap], lang), { nav:`step:${targets[gap]}` }, { kind:'small' })}</li>`).join('')}</ul></div>` : `<p class="ready">🏛️</p>`,
      primary:btn(`${rich(L.submitButton, lang)} <span aria-hidden="true">→</span>`, { act:'submit' }, { disabled:gaps.length > 0 }) };
  },
  poster(ctx) {
    const { L, lang, team } = ctx;
    return { title:rich(L.posterTitle, lang), lead:rich(L.posterLead, lang), wide:true, cls:'poster-screen',
      body:`<div id="poster-wrap" class="poster-wrap">${posterMarkup(team, lang, L)}</div>`, secondary:`<div class="poster-tools">${btn(`🖨️ ${L.print}`, { action:'print' }, { kind:'secondary' })}${btn(`⛶ ${L.fullScreen}`, { action:'fullscreen' }, { kind:'secondary' })}</div>`, primary:next(L) };
  },
  wait(ctx) {
    const { L, lang, reveal } = ctx;
    return { title:rich(L.waitTitle, lang), body:`<div class="prose big">${L.waitLines.map(text => `<p>🎤 ${rich(text, lang)}</p>`).join('')}</div><p class="waiting ${reveal ? 'open' : ''}" aria-live="polite">${reveal ? `✨ ${rich(L.revealOpenNote, lang)}` : `<span class="dots" aria-hidden="true"></span> ${rich(L.waitNote, lang)}`}</p>`,
      primary:next(L, !reveal) };
  },
  revealPlace(ctx) {
    const { L, lang, team } = ctx, point = team.state.mapPoint, reveal = regions[point].reveal;
    return { title:rich(L.revealTitle, lang), wide:true, cls:'reveal-in',
      body:`<div class="reveal-head"><span class="letter-badge">${point}</span><div><h2>${rich(reveal.name[lang], lang, { terms:false })}</h2><p class="muted">${rich(reveal.when[lang], lang, { terms:false })}</p></div></div>
        <div class="reveal-photos">${photo(`${point}/reveal-1.webp`, plain(reveal.name[lang]), { eager:true })}${photo(`${point}/reveal-2.webp`, plain(reveal.name[lang]))}</div>
        ${historicalReading(reveal,lang,L)}`, primary:next(L) };
  },
  revealCompare(ctx) {
    const { L, lang, team } = ctx, state = team.state, reveal = regions[state.mapPoint].reveal, mine = [...state.tech, ...state.civic];
    const col = (label, ids, cls) => `<section class="compare-col ${cls}"><h2>${label}</h2>${ids.length ? `<ul>${ids.map(id => `<li>${chip(id, lang)}</li>`).join('')}</ul>` : `<p class="muted">—</p>`}</section>`;
    return { title:rich(L.compareTitle, lang), lead:rich(L.compareLead, lang), wide:true,
      body:(reveal.examples ?? [reveal]).map(example=>`<section class="historical-example"><h2>${rich(example.name[lang],lang,{terms:false})}</h2><p class="muted">${rich(example.when[lang],lang,{terms:false})}</p><div class="compare">${col(rich(L.bothLabel,lang),example.had.filter(id=>mine.includes(id)),'both')}${col(rich(L.onlyYou,lang),mine.filter(id=>!example.had.includes(id)),'you')}${col(rich(L.onlyHistory,lang),example.had.filter(id=>!mine.includes(id)),'history')}</div></section>`).join(''), primary:next(L) };
  },
  historyDifferenceAnswer:ctx=>historyWriting(ctx,'historyDifferenceAnswer'),
  historyWorkAnswer:ctx=>historyWriting(ctx,'historyWorkAnswer'),
  historyOmissionAnswer:ctx=>historyWriting(ctx,'historyOmissionAnswer'),
  reflectionReview(ctx) {
    const {L,lang,team}=ctx;
    return {title:rich(L.reflectionReviewTitle,lang),lead:rich(L.reflectionReviewLead,lang),body:`<dl class="check">${reflectionFields.map(key=>`<div class="check-row"><dt>${rich(L[`writingTitle_${key}`],lang)}</dt><dd>${esc(team.state.reflection?.[key]??'')}</dd><dd class="edit">${team.state.reflection?.submittedAt?'':btn(L.edit,{nav:`step:${key}`},{kind:'small'})}</dd></div>`).join('')}</dl>`,primary:next(L)};
  },
  reflectionSubmit(ctx) {
    const {L,lang,team}=ctx;
    if(team.state.reflection?.submittedAt)return {title:`✓ ${rich(L.reflectionComplete,lang)}`,body:`<p>${rich(L.reflectionCompleteNote,lang)}</p>`,primary:next(L)};
    const gaps=reflectionGaps(team.state);
    return {title:rich(L.reflectionSubmit,lang),lead:rich(L.reflectionSubmitLead,lang),body:gaps.length?`<div class="gaps"><h2>${rich(L.reflectionStillMissing,lang)}</h2>${gaps.map(key=>btn(L[`writingTitle_${key}`],{nav:`step:${key}`},{kind:'small'})).join('')}</div>`:'',primary:btn(L.reflectionSubmit,{act:'submitReflection'},{disabled:!!gaps.length})};
  },
  takeaway(ctx) {
    const { L, lang } = ctx;
    return { title:rich(L.takeawayTitle, lang), cls:'takeaway',
      body:`<p class="statement">${rich(L.takeawayMain, lang)}</p><div class="prose">${lines(L.takeawayParagraphs??L.takeawayPoints,lang)}</div><p class="muted">➡️ ${rich(L.takeawayNext, lang)}</p>`,
      primary:btn(rich(L.posterTitle, lang), { nav:'step:poster' }) };
  }
};

function treeIntro(ctx, tree) {
  const { L, lang } = ctx;
  return { title:rich(L[`${tree}IntroTitle`], lang), lead:tree === 'civic' ? rich(L.civicIntroLead, lang) : '',
    body:`<ul class="steps-list">${L.treeIntroLines.map(text => `<li>${rich(text, lang)}</li>`).join('')}</ul>${legend(L)}`, primary:next(L) };
}
function treeScreen(ctx, tree) {
  const { L, lang, team, ui, compact } = ctx, state = team.state;
  if (ui.sub?.tree === tree && ui.sub.kind === 'card') return cardDetail(ctx, tree, ui.sub.id);
  if (ui.sub?.tree === tree && ui.sub.kind === 'roll') return rollScreen(ctx, tree, ui.sub.id);
  const done = stepDone(`${tree}Tree`, team), over = spent(state, tree) > BUDGET;
  return { title:rich(L[`tree_${tree}`], lang), wide:true, cls:'tree-screen',
    body:`<div class="tree-head">${pointsMeter(state, tree, L)}${legend(L)}</div>${state.event ? `<p class="warning">🔒 ${rich(L.locked, lang)}</p>` : ''}${over ? `<p class="error-note">${rich(L.overBudget, lang)}</p>` : ''}
      ${treeMarkup(state, tree, lang, L, { compact, added:ctx.flash?.added, unlocked:ctx.flash?.unlocked })}${!state[tree].length ? `<p class="muted">${rich(L.needOneCard, lang)}</p>` : ''}`,
    primary:next(L, !done, L.doneTree) };
}
function cardDetail(ctx, tree, id) {
  const { L, lang, team } = ctx, state = team.state, card = cardById[id], point = state.mapPoint;
  const price = priceOf(point, id), chosen = state[tree].includes(id), status = chosen ? statusOf(state, id) : '';
  const reason = reasonOf(point, id);
  const parents = card.parents.length ? `<ul class="link-list">${card.parents.map(parent => `<li class="${state[tree].includes(parent) ? 'have' : ''}">${state[tree].includes(parent) ? '✓' : '○'} ${chip(parent, lang)}</li>`).join('')}</ul>` : `<p>${rich(L.cardNeedsNone, lang)}</p>`;
  const kids = childrenOf(id);
  const opens = kids.length ? `<p>${kids.map(child => chip(child.id, lang)).join(' ')}</p>` : `<p class="muted">${rich(L.cardOpensNone, lang)}</p>`;
  const roll = chosen && price === 'hard' && state.rolls[id] ? `<p>🎲 ${fmt(status === 'partly' ? L.rollPartly : L.rollWorks, state.rolls[id])}</p>` : '';
  let primary, note = '';
  if (chosen) {
    if (status === 'rolling') primary = btn(`🎲 ${L.rollNow}`, { act:`cardRoll:${id}` }, { disabled:!!state.event });
    else {
      const extra = cascadeOf(state, tree, id).filter(other=>other!==id).map(other=>cardPlain(cardById[other],lang)).join(sep(lang));
      note = extra ? `<p class="warning">${esc(fmt(L.alsoRemoves, extra))}</p>` : '';
      primary = btn(L.removeCard, { act:`remove:${tree}:${id}` }, { kind:'danger', disabled:!!state.event || !!team.submittedAt });
    }
  } else {
    const why = blocker(state, tree, id), cost = costOf(point, id);
    const costLabel = cost === 0 ? L.costFree : cost === 1 ? L.costPoint : fmt(L.costPoints, cost);
    note = why === 'impossible' ? `<p class="error-note">${rich(L.blockedImpossible, lang)}</p>` : why === 'parent' ? `<p class="error-note">${rich(L.blockedParent, lang)}</p>` : why === 'budget' ? `<p class="error-note">${esc(fmt(L.blockedBudget, cost, BUDGET - spent(state, tree)))}</p>` : why === 'locked' ? `<p class="warning">🔒 ${rich(L.blockedLocked, lang)}</p>` : '';
    primary = price === 'impossible' ? '' : btn(price === 'hard' ? `🎲 ${L.addCardRoll}` : esc(fmt(L.addCard, costLabel)), { act:`add:${tree}:${id}` }, { disabled:!!why || !!team.submittedAt });
  }
  const minimum = minimumCost(point, id);
  const reachability = minimum > BUDGET && Number.isFinite(minimum) ? `<p class="warning">${esc(fmt(L.advancedStretch, minimum, BUDGET))}</p>` : !Number.isFinite(minimum) && price !== 'impossible' ? `<p class="warning">${rich(L.blockedAncestry, lang)}</p>` : '';
  return { sub:true, title:`<span class="title-icon" aria-hidden="true">${card.icon}</span> ${cardName(card, lang, { terms:true })}`, cls:'card-detail',
    body:`<div class="card-badges">${priceBadge(price, L)}${chosen ? statusBadge(status, L) : ''}<span class="muted">${esc(fmt(L.pointsLeft, BUDGET - spent(state, tree)))}</span></div>
      <section><h2>${L.cardWhat}</h2><p>${rich(card.what[lang], lang)}</p></section>
      <section class="here p-${price}"><h2>${L.cardHere}</h2><p>${reason ? rich(reason[lang], lang) : rich(L.normalHere, lang)}</p>${roll}${status === 'partly' ? `<p class="muted">${rich(L.rollPartlyNote, lang)}</p>` : ''}</section>
      <div class="two-col"><section><h2>${L.cardNeeds}</h2>${parents}</section><section><h2>${L.cardOpens}</h2>${opens}</section></div>${reachability}${note}`,
    back:btn(`<span aria-hidden="true">←</span> ${L.backToTree}`, { sub:'close' }, { kind:'ghost' }), primary };
}
function rollScreen(ctx, tree, id) {
  const { L, lang, team, rolling, anim } = ctx, state = team.state, value = state.rolls[id];
  const mode = rolling ? 'spin' : anim?.key === `card:${id}` ? 'land' : 'still';
  const result = !value && !rolling ? `<p class="error-note" role="alert">${L.rollFailed}</p>` : value && mode === 'still' ? `<p class="roll-result ${value <= 2 ? 'partly' : 'works'}">${esc(fmt(value <= 2 ? L.rollPartly : L.rollWorks, value))}</p><p>${rich(value <= 2 ? L.rollPartlyNote : L.rollWorksNote, lang)}</p>` : `<p class="roll-result" aria-live="polite">${L.rollWaiting}</p>`;
  return { sub:true, title:rich(L.rollTitle, lang), lead:esc(fmt(L.rollLead, cardPlain(cardById[id], lang))),
    body:`<div class="roll-stage">${chip(id, lang)}${dieMarkup(value || 1, mode)}${result}</div>`,
    back:'', primary:btn(`${L.backToTree} <span aria-hidden="true">→</span>`, { sub:'close' }, { disabled:mode !== 'still' }) };
}
function review(ctx, tree) {
  const { L, lang, team } = ctx, state = team.state, point = state.mapPoint;
  const rows = state[tree].map(id => {
    const price = priceOf(point, id), status = statusOf(state, id), reason = reasonOf(point, id);
    return `<li class="s-${status}"><span class="big" aria-hidden="true">${icon(id)}</span><div><strong>${cardName(cardById[id], lang)}</strong> ${statusBadge(status, L)}<p>${reason ? `${priceBadge(price, L)} ${rich(reason[lang], lang)}` : rich(L.normalHere, lang)}${price === 'hard' && state.rolls[id] ? ` 🎲 ${state.rolls[id]}` : ''}</p></div></li>`;
  }).join('');
  return { title:rich(L[`reviewTitle_${tree}`], lang), lead:rich(L.reviewLead, lang),
    body:`${pointsMeter(state, tree, L)}<ul class="review-list">${rows}</ul>`,
    secondary:state.event || team.submittedAt ? '' : btn(rich(L.changeCards, lang), { nav:`step:${tree}Tree` }, { kind:'secondary' }), primary:next(L) };
}
function consequence(ctx, plan, full) {
  const { L, lang, team } = ctx, state = team.state;
  if (plan.protectedBy) return rich(fmt(L.youAreSafe, cardPlain(cardById[plan.protectedBy], lang)), lang);
  if (eventId(state.event) === 1) return rich(state.event.lost.includes('irrigation') ? L.youLostIrrigation : L.nothingToLose, lang);
  if (plan.kind === 'choose') return rich(L.youMustChoose, lang);
  if (full && plan.kind === 'lose') return plan.options.length ? esc(fmt(L.youMustLose, plan.count)) : rich(L.nothingFits, lang);
  if (full && plan.kind === 'gain') return plan.options.length ? rich(L.youMayGain, lang) : rich(L.nothingFits, lang);
  return changes(ctx, true);
}
function changes(ctx, inline = false) {
  const { L, lang, team } = ctx, state = team.state, event = state.event, plan = eventPlan(state);
  const parts = [];
  if (event.lost.length) parts.push(`<div class="change lost"><h3>${L.lostLabel}</h3><p>${event.lost.map(id => chip(id, lang)).join(' ')}</p></div>`);
  if (event.gained.length) parts.push(`<div class="change gained"><h3>${L.gainedLabel}</h3><p>${event.gained.map(id => `${chip(id, lang)} ${statusBadge(statusOf(state, id), L)}`).join(' ')}</p></div>`);
  if (plan.protectedBy) parts.push(`<div class="change safe"><h3>${L.protectedLabel}</h3><p>${chip(plan.protectedBy, lang)}</p></div>`);
  if (!parts.length) return inline ? rich(L.noChange, lang) : `<p class="muted">${rich(L.noChange, lang)}</p>`;
  return `<div class="changes">${parts.join('')}</div>`;
}

// While writing, the team's cards, event and society choices stay in view as evidence.
const withChoices = new Set(['eventAnswer','geographyAnswer','government','economy','beliefs','shapeAnswer','notChosenAnswer',...reflectionFields]);
function choicesPanel(ctx) {
  const { L, lang, team } = ctx, state = team.state, event = state.event;
  const cards = tree => state[tree].length ? state[tree].map(id => `${chip(id, lang)}${statusOf(state, id) === 'partly' ? statusBadge('partly', L) : ''}`).join(' ') : '<span class="muted">—</span>';
  const choice = (group, values) => [].concat(values).filter(Boolean).map(value => esc(plain(L[`chips_${group}`][value]))).join(sep(lang));
  const society = [['governmentTitle', choice('government', state.government)], ['economyTitle', choice('economy', state.economy)], ['beliefsTitle', choice('beliefs', state.beliefs)]]
    .filter(([, text]) => text).map(([key, text]) => `<p><strong>${rich(L[key], lang, { terms:false })}:</strong> ${text}</p>`).join('');
  const eventPart = event ? `<section><h3>${rich(L.posterEvent, lang, { terms:false })}</h3><p>🎲 ${eventDiceText(event)} · ${rich(L[`event${eventId(event)}`], lang, { terms:false })}</p>${event.lost.length ? `<p class="lost">${L.lostLabel}: ${event.lost.map(id => chip(id, lang)).join(' ')}</p>` : ''}${event.gained.length ? `<p>${L.gainedLabel}: ${event.gained.map(id => chip(id, lang)).join(' ')}</p>` : ''}</section>` : '';
  return `<aside class="side-panel" aria-label="${esc(L.yourChoices)}"><h2>${L.yourChoices}</h2>
    <section><h3>${L.tree_tech}</h3><p>${cards('tech')}</p></section><section><h3>${L.tree_civic}</h3><p>${cards('civic')}</p>${society}</section>${eventPart}</aside>`;
}

export function studentPage(ctx) {
  const render = screens[ctx.step] ?? screens.intro1, screen = render(ctx);
  if (withChoices.has(ctx.step) && ctx.team.state.mapPoint) screen.side = choicesPanel(ctx);
  return frame(ctx, screen);
}
export function chapterCard(chapter, ctx) {
  const { L, lang, team } = ctx, point = team.state.mapPoint;
  const image = point && ['place','tech','civic','event','reveal'].includes(chapter) ? `/assets/regions/${chapter === 'reveal' ? `${point}/reveal-1.webp` : heroPath(point)}` : worldMap.image;
  return `<div class="chapter-card" role="presentation" data-chapter-card><img src="${image}" alt="" /><div class="chapter-card-text"><span>${fmt(L.chapterWord, chapters.indexOf(chapter) + 1)}</span><strong>${rich(L[`chapterTitle_${chapter}`], lang, { terms:false })}</strong></div></div>`;
}
