// The presentation poster: one screen for the 3-minute talk, also shown to the teacher.
import { regions } from '../shared/regions.js';
import { cardById } from '../shared/cards.js';
import { statusOf, eventPlan } from '../shared/game.js';
import { esc, rich, fmt, cardName, photo, plain, statusBadge } from './ui.js';

const cards = (state, tree, lang, L) => state[tree].length
  ? `<ul class="poster-cards">${state[tree].map(id => { const status = statusOf(state, id); return `<li class="s-${status}"><span aria-hidden="true">${cardById[id].icon}</span>${cardName(cardById[id], lang)}${status === 'partly' ? ` ${statusBadge('partly', L)}` : ''}${state.event?.gained.includes(id) ? ` <em>+</em>` : ''}</li>`; }).join('')}</ul>`
  : `<p class="muted">—</p>`;

export function posterMarkup(team, lang, L) {
  const state = team.state, region = regions[state.mapPoint];
  if (!region) return '';
  const title = state.civName.trim() || fmt(L.unnamed, state.mapPoint);
  const chip = (group, value) => value ? esc(plain(L[`chips_${group}`][value])) : '';
  const event = state.event, plan = event ? eventPlan(state) : null;
  const eventLine = event ? `<p class="poster-event"><b>${event.roll} · ${rich(L[`event${event.roll}`], lang)}</b> — ${rich(region.events[event.roll][lang], lang, { terms:false })}${event.choice ? `<br>${rich(L[event.choice === 'trade' ? 'chooseTrade' : 'chooseFight'], lang, { terms:false })}` : ''}${event.lost.length ? `<br>${L.lostLabel}: ${event.lost.map(id => cardName(cardById[id], lang)).join(lang === 'ja' ? '、' : ', ')}` : ''}${event.gained.length ? `<br>${L.gainedLabel}: ${event.gained.map(id => cardName(cardById[id], lang)).join(lang === 'ja' ? '、' : ', ')}` : ''}${plan?.protectedBy ? `<br>${L.protectedLabel}: ${cardName(cardById[plan.protectedBy], lang)}` : ''}${plan?.resolved && !event.lost.length && !event.gained.length && !plan.protectedBy ? `<br>${rich(L.noChange,lang,{terms:false})}` : ''}</p>` : '';
  const answer = (label, key, extra = '') => state[key].trim() ? `<div class="poster-answer"><h4>${rich(label, lang, { terms:false })}${extra ? ` · <span>${extra}</span>` : ''}</h4><p>${esc(state[key])}</p></div>` : '';
  return `<article class="poster" aria-label="${esc(title)}">
    <header class="poster-head">${photo(`${state.mapPoint}/hero.webp`, plain(region.name[lang]), { cls:'poster-photo', eager:true, lang })}
      <div class="poster-title"><span class="poster-letter">${esc(state.mapPoint)}</span><div><h2>${esc(title)}</h2><p>${rich(region.name[lang], lang, { terms:false })} · ${rich(region.area[lang], lang, { terms:false })}</p></div></div></header>
    <div class="poster-body">
      <section><h3>${L.posterScience}</h3>${cards(state, 'tech', lang, L)}</section>
      <section><h3>${L.posterSociety}</h3>${cards(state, 'civic', lang, L)}</section>
      <section><h3>${L.posterEvent}</h3>${eventLine || `<p class="muted">${L.notRolled}</p>`}${answer(L.posterEventReflection, 'eventAnswer')}</section>
      <section class="poster-wide"><h3>${L.posterTalk}</h3>
        ${answer(L.posterGeography, 'geographyAnswer')}
        ${answer(L.posterGovernment, 'governmentAnswer', chip('government', state.government))}
        ${answer(L.posterEconomy, 'economyAnswer', state.economy.map(value => chip('economy', value)).join(lang === 'ja' ? '、' : ', '))}
        ${answer(L.posterBeliefs, 'beliefAnswer', chip('beliefs', state.beliefs))}
        ${answer(L.posterShape, 'shapeAnswer')}
        ${answer(L.posterTradeoff, 'notChosenAnswer')}
      </section>
    </div>
  </article>`;
}
