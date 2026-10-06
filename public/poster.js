// The presentation poster: one screen for the 3-minute talk, also shown to the teacher.
import { shortLesson, lessonProfile } from '../shared/lesson.js';
import { regions } from '../shared/regions.js';
import { cardById } from '../shared/cards.js';
import { statusOf, eventPlan, eventId, reflectionFields } from '../shared/game.js';
import { esc, rich, fmt, cardName, photo, plain, statusBadge, eventDiceText } from './ui.js';

const cards = (state, tree, lang, L) => state[tree].length
  ? `<ul class="poster-cards">${state[tree].map(id => { const status = statusOf(state, id); return `<li class="s-${status}"><span aria-hidden="true">${cardById[id].icon}</span>${cardName(cardById[id], lang)}${status === 'partly' ? ` ${statusBadge('partly', L)}` : ''}${state.event?.gained.includes(id) ? ` <em>+</em>` : ''}</li>`; }).join('')}</ul>`
  : `<p class="muted">—</p>`;

export function posterMarkup(team, lang, L) {
  const state = team.state, region = regions[state.mapPoint];
  if (!region) return '';
  const title = state.civName.trim() || fmt(L.unnamed, state.mapPoint);
  const chip = (group, value) => value ? esc(plain(L[`chips_${group}`][value])) : group==='beliefs' && state.legacy?.beliefs ? esc(plain(L.chips_beliefs[state.legacy.beliefs])) : '';
  const event = state.event, plan = event ? eventPlan(state) : null;
  const eventLine = event ? `<p class="poster-event"><b>${eventDiceText(event)} · ${rich(L[`event${eventId(event)}`], lang)}</b> — ${rich(region.events[eventId(event)][lang], lang, { terms:false })}${event.choice ? `<br>${rich(L[event.choice === 'trade' ? 'chooseTrade' : 'chooseFight'], lang, { terms:false })}` : ''}${event.lost.length ? `<br>${L.lostLabel}: ${event.lost.map(id => cardName(cardById[id], lang)).join(lang === 'ja' ? '、' : ', ')}` : ''}${event.gained.length ? `<br>${L.gainedLabel}: ${event.gained.map(id => cardName(cardById[id], lang)).join(lang === 'ja' ? '、' : ', ')}` : ''}${plan?.protectedBy ? `<br>${L.protectedLabel}: ${cardName(cardById[plan.protectedBy], lang)}` : ''}${plan?.resolved && !event.lost.length && !event.gained.length && !plan.protectedBy ? `<br>${rich(L.noChange,lang,{terms:false})}` : ''}</p>` : '';
  const answer = (label, key, extra = '') => (lessonProfile(team.lessonVersion).answers.includes(key) || key === 'beliefAnswer') && (state[key].trim() || (shortLesson(team) && extra)) ? `<div class="poster-answer"><h4>${rich(label, lang, { terms:false })}${extra ? ` · <span>${extra}</span>` : ''}</h4>${state[key].trim() && (!shortLesson(team) || key !== 'beliefAnswer' || state.beliefs === 'other') ? `<p>${esc(state[key])}</p>` : ''}</div>` : '';
  return `<article class="poster" aria-label="${esc(title)}">
    <header class="poster-head">${photo(`${state.mapPoint}/hero.webp`, plain(region.name[lang]), { cls:'poster-photo', eager:true, lang })}
      <div class="poster-title"><span class="poster-letter">${esc(state.mapPoint)}</span><div><h2>${esc(title)}</h2><p>${rich(region.name[lang], lang, { terms:false })} · ${rich(region.area[lang], lang, { terms:false })}</p></div></div></header>
    <div class="poster-body">
      <section class="poster-sci"><h3>${L.posterScience}</h3>${cards(state, 'tech', lang, L)}</section>
      <section class="poster-soc"><h3>${L.posterSociety}</h3>${cards(state, 'civic', lang, L)}</section>
      <section class="poster-ev"><h3>${L.posterEvent}</h3>${eventLine || `<p class="muted">${L.notRolled}</p>`}</section>
      <section class="poster-wide"><h3>${L.posterTalk}</h3>
        ${answer(L.posterEventReflection, 'eventAnswer')}
        ${answer(L.posterGeography, 'geographyAnswer')}
        ${answer(L.posterGovernment, 'governmentAnswer', chip('government', state.government))}
        ${answer(L.posterEconomy, 'economyAnswer', state.economy.map(value => chip('economy', value)).join(lang === 'ja' ? '、' : ', '))}
        ${answer(L.posterBeliefs, 'beliefAnswer', chip('beliefs', state.beliefs))}
        ${answer(L.posterShape, 'shapeAnswer')}
        ${answer(L.posterTradeoff, 'notChosenAnswer')}
      </section>
      ${!shortLesson(team) && reflectionFields.some(key=>state.reflection?.[key]?.trim()) ? `<section class="poster-wide poster-reflection"><h3>${rich(L.reflectionReviewTitle,lang)}</h3>${reflectionFields.map(key=>state.reflection?.[key]?.trim()?`<div class="poster-answer"><h4>${rich(L[`writingTitle_${key}`],lang)}</h4><p>${esc(state.reflection[key])}</p></div>`:'').join('')}</section>` : ''}
    </div>
  </article>`;
}
