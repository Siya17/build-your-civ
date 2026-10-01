// The teacher dashboard: teams, progress, their work, the poster and the class-wide reveal.
import { regions, points } from '../shared/regions.js';
import { cardById } from '../shared/cards.js';
import { spent, statusOf, eventPlan, textFields } from '../shared/game.js';
import { teamStep, teamMilestones, chapterOf, teamStarted } from '../shared/flow.js';
import { esc, fmt, rich, plain, cardName, statusBadge } from './ui.js';
import { posterMarkup } from './poster.js';

const button = (text, action, cls = 'btn secondary') => `<button type="button" class="${cls}" data-action="${action}">${text}</button>`;
export const missingLetters = teams => points.filter(point => !teams.some(team => team.state.fixedPoint === point)).join(' ');

function revealPanel(ctx) {
  const { L, reveal } = ctx;
  return `<div class="panel reveal-panel ${reveal ? 'open' : ''}"><div><h2>✨ ${L.revealPanel}</h2><p>${reveal ? L.revealOpenTeacher : L.revealClosedNote}</p></div>${button(reveal ? L.closeReveal : L.openReveal, `reveal:${reveal ? 'off' : 'on'}`, reveal ? 'btn secondary' : 'btn primary')}</div>`;
}
export function teamCard(team, ctx) {
  const { L, lang, newCodes, reveal } = ctx, state = team.state, code = team.code || newCodes.get(team.id), point = state.fixedPoint || state.mapPoint;
  const at = teamMilestones(team).submitted ? L.ch_present : teamStarted(team) ? L[`ch_${chapterOf(teamStep(team, reveal).id)}`] : L.notStarted;
  const event = state.event ? `🎲 ${state.event.roll} · ${plain(L[`event${state.event.roll}`])}` : `🎲 ${L.notRolled}`;
  return `<div class="panel team-card"><div class="team-card-top">${point ? `<span class="team-letter">${point}</span>` : ''}<div><h3>${esc(team.name)}</h3>
    <span>${L.nowAt}: <b>${esc(at)}</b> · ${esc(fmt(L.pointsShort, spent(state,'tech')))} + ${esc(fmt(L.pointsShort, spent(state,'civic')))} · ${esc(event)}</span></div>
    <span class="status-pill ${team.submittedAt ? 'submitted' : ''}">${team.submittedAt ? L.submitted : L.working}</span></div>
    ${code ? `<div class="code-reveal"><small>${team.code ? `${L.joinCode} · ${L.codeHint}` : L.codeOnce}</small><strong>${esc(code)}</strong></div>` : ''}
    <div class="team-card-actions">${button(L.review, `review:${team.id}`)}${button(L.newCode, `code:${team.id}`, 'btn ghost')}${button(L.deleteTeam, `delete:${team.id}`, 'btn ghost danger')}</div></div>`;
}
function activityView(detail, L) {
  const activity = detail.activity;
  if (!activity) return '';
  const counts = activity.counts.filter(row => row.actor !== 'Teacher');
  // A bucket class, not an inline style: the page runs under a CSP without unsafe-inline.
  const bar = total => `share-${Math.round(10 * total / counts[0].total) * 10}`;
  return `<div class="activity"><div class="activity-head"><strong>${L.activity}</strong><small>${L.activityHelp}</small></div>${counts.length ? `<div class="activity-bars">${counts.map(row => `<div class="activity-row ${bar(row.total)}"><span>${esc(row.actor)}</span><i></i><b>${row.total} ${L.actionsCount}</b></div>`).join('')}</div>` : `<p class="activity-empty">${L.noActivity}</p>`}</div>`;
}
function summary(team, ctx) {
  const { L, lang } = ctx, state = team.state, region = regions[state.mapPoint];
  if (!region) return `<p class="muted">${L.teacherNoPlace}</p>`;
  const cardList = tree => state[tree].map(id => `<li>${cardById[id].icon} ${cardName(cardById[id], lang)} ${statusOf(state, id) === 'partly' ? statusBadge('partly', L) : ''}</li>`).join('') || '<li class="muted">—</li>';
  const plan = state.event ? eventPlan(state) : null;
  const event = state.event ? `${state.event.roll} · ${rich(L[`event${state.event.roll}`], lang)}${state.event.choice ? ` (${rich(L[state.event.choice === 'trade' ? 'chooseTrade' : 'chooseFight'], lang)})` : ''}${state.event.lost.length ? ` · ${L.lostLabel}: ${state.event.lost.map(id => cardName(cardById[id], lang)).join(', ')}` : ''}${state.event.gained.length ? ` · ${L.gainedLabel}: ${state.event.gained.map(id => cardName(cardById[id], lang)).join(', ')}` : ''}${plan?.protectedBy ? ` · ${L.protectedLabel}: ${cardName(cardById[plan.protectedBy], lang)}` : ''}` : L.notRolled;
  const chips = [state.government && plain(L.chips_government[state.government]), ...state.economy.map(value => plain(L.chips_economy[value])), state.beliefs && plain(L.chips_beliefs[state.beliefs])].filter(Boolean).map(esc).join(' · ');
  const answers = ['civName', ...textFields].map(key => `<div class="summary-row"><dt>${rich(L[key], lang)}</dt><dd>${state[key].trim() ? esc(state[key]) : '<span class="muted">—</span>'}</dd></div>`).join('');
  const legacy = state.legacy ? `<details class="legacy"><summary>${L.legacyTitle}</summary><dl>${Object.entries(state.legacy).map(([key, value]) => `<div class="summary-row"><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl></details>` : '';
  return `<dl class="summary"><div class="summary-row"><dt>${L.region}</dt><dd>${state.mapPoint} · ${rich(region.name[lang], lang, { terms:false })}</dd></div>
    <div class="summary-row"><dt>${L.tree_tech}</dt><dd><ul class="plain">${cardList('tech')}</ul></dd></div><div class="summary-row"><dt>${L.tree_civic}</dt><dd><ul class="plain">${cardList('civic')}</ul></dd></div>
    <div class="summary-row"><dt>${L.eventLabel}</dt><dd>${event}</dd></div>${chips ? `<div class="summary-row"><dt>${L.choicesTitle}</dt><dd>${chips}</dd></div>` : ''}${answers}</dl>${legacy}`;
}
export function teacherDetailView(ctx) {
  const { L, detail } = ctx;
  return `<div class="panel detail-panel"><div class="detail-header"><div><span class="eyebrow">${L.studentWork}</span><h2>${esc(detail.name)}</h2><p>${detail.submittedAt ? `${L.submitted} · ${esc(detail.submittedAt)}` : L.working}</p></div><button type="button" class="icon-button" data-action="close-detail" aria-label="${L.close}">×</button></div>
    <div class="detail-roster"><div><b>${L.liveNow}:</b> ${esc((detail.roster || []).join(' · ') || '—')}</div><div><b>${L.joined}:</b> ${esc((detail.joined || []).join(' · ') || '—')}</div></div>
    <div class="detail-actions">${detail.state.mapPoint ? button(`🖼️ ${L.showPoster}`, 'poster', 'btn primary')+button(L.print, 'print', 'btn ghost') : ''}${detail.submittedAt ? button(L.reopen, `reopen:${detail.id}`) : ''}${button(L.deleteTeam, `delete:${detail.id}`, 'btn ghost danger')}</div>
    <form id="rename-team"><label class="answer-field"><span>${L.renamePrompt}</span><input name="teamName" value="${esc(detail.name)}" required maxlength="80" autocomplete="off" /></label><button class="btn ghost" type="submit">${L.renameTeam}</button></form>
    ${activityView(detail, L)}${summary(detail, ctx)}</div>`;
}
export function teacherList(ctx) {
  const { L, teams } = ctx;
  return teams.length ? teams.map(team => teamCard(team, ctx)).join('') : `<div class="panel empty-teams">${L.noTeams}</div>`;
}
export const teacherPrint = ({teams,L}) => teams.some(team=>team.submittedAt) ? button(`🖨️ ${L.printPosters}`, 'print-all') : '';
export function teacherPage(ctx, topbar) {
  const { L, lang, teams, detail } = ctx, missing = missingLetters(teams);
  return `<div class="shell teacher">${topbar}<main id="main" class="teacher-main" tabindex="-1"><div class="teacher-intro"><p class="eyebrow">TEACHER</p><h1>${L.teacherTitle}</h1><p>${L.teacherDesc}</p></div>
    <div id="reveal-panel">${revealPanel(ctx)}</div>
    <div class="class-print" id="class-print">${teacherPrint(ctx)}</div>
    <div class="teacher-layout"><section class="teacher-left"><div class="panel create-panel"><h2>${L.createTeam}</h2><form id="create-team"><label class="answer-field"><span>${L.teamName}</span><input name="teamName" required maxlength="80" autocomplete="off" /></label><label class="answer-field"><span>${L.optionalRegion}</span><select name="point"><option value="">${L.studentsChooseRegion}</option>${points.map(point => `<option value="${point}">${point} · ${esc(plain(regions[point].name[lang]))}</option>`).join('')}</select></label><button class="btn primary" type="submit">${L.create} →</button></form>${missing ? `<button type="button" class="btn secondary letter-teams" data-action="letter-teams">${L.addLetterTeams} (${missing})</button>` : ''}</div>
    <div class="teacher-list" id="teacher-list">${teacherList(ctx)}</div></section>
    <aside class="teacher-right" id="teacher-right">${detail ? teacherDetailView(ctx) : `<div class="panel teacher-welcome"><p>✦ ${L.studentWork}</p></div>`}</aside></div></main></div>`;
}
export function posterOverlay(ctx) {
  const { L, lang, detail } = ctx;
  return `<div class="poster-overlay" role="dialog" aria-modal="true" aria-label="${esc(L.showPoster)}"><div class="poster-overlay-bar">${button(`🖨️ ${L.print}`, 'print')}${button(`⛶ ${L.fullScreen}`, 'fullscreen')}${button(`× ${L.close}`, 'close-poster', 'btn ghost')}</div><div id="poster-wrap" class="poster-wrap">${posterMarkup(detail, lang, L)}</div></div>`;
}
export { revealPanel };
