// The two development trees, drawn like slide 19: cards in columns, arrows left to right.
// On a narrow screen the same cards are listed in steps, with "needs" lines instead of arrows.
import { trees, cardById } from '../shared/cards.js';
import { priceOf, statusOf, pickBlocker } from '../shared/game.js';
import { esc, fmt, plain, cardName, cardPlain, priceSymbol } from './ui.js';

// Keep in step with .tree-graph in game.css.
export const COLW = 196, ROWH = 64, NODEW = 164, NODEH = 52;

// Why a card can or cannot be added now: '', 'impossible', 'parent', 'budget' or 'locked'.
export const blocker = pickBlocker;

function nodeState(state, tree, id) {
  if (state[tree].includes(id)) return 'chosen';
  const why = blocker(state, tree, id);
  return why === '' ? 'open' : why;
}

function nodeMarkup(state, tree, card, lang, L, flags) {
  // Prediction cards: a tap applies the team's chosen marker (easy, normal or difficult).
  if (flags.mark) {
    const mark = flags.marks?.[card.id] || '', tip = plain(card.summary[lang]);
    return `<button type="button" class="node c${card.col} r${card.row} is-mark${mark ? ` m-${mark}` : ''}" data-act="mark:${card.id}" data-tip="${esc(tip)}" aria-label="${esc(`${cardPlain(card, lang)}. ${mark ? fmt(L.markedAs, L[`mark_${mark}`]) : L.notMarked}`)}" ${flags.locked ? 'disabled' : ''}><span class="node-icon" aria-hidden="true">${card.icon}</span><span class="node-name">${cardName(card, lang)}</span>${mark ? `<span class="node-mark" aria-hidden="true">${esc(L[`mark_${mark}`])}</span>` : ''}</button>`;
  }
  // Preview cards carry a short definition: a floating tip on hover or focus, the full text on click.
  if (flags.preview) { const tip = plain(card.summary[lang]); return `<button type="button" class="node c${card.col} r${card.row} is-preview" data-preview="${tree}:${card.id}" data-tip="${esc(tip)}" aria-label="${esc(`${cardPlain(card, lang)}: ${tip}`)}"><span class="node-icon" aria-hidden="true">${card.icon}</span><span class="node-name">${cardName(card, lang)}</span></button>`; }
  const price = priceOf(state.mapPoint, card.id), kind = nodeState(state, tree, card.id);
  const status = kind === 'chosen' ? statusOf(state, card.id) : '';
  const label = plain(`${cardPlain(card, lang)}. ${L[`price_${price}`]}. ${kind === 'chosen' ? `${L.chosenCard}. ${L[`status_${status}`]}` : kind === 'open' ? L.canChoose : kind === 'parent' ? L.needsFirst : ''}`);
  const cls = ['node', `c${card.col}`, `r${card.row}`, `is-${kind}`, `p-${price}`, status && `s-${status}`, flags.added === card.id && 'pop', flags.unlocked?.includes(card.id) && 'pulse'].filter(Boolean).join(' ');
  return `<button type="button" class="${cls}" data-card="${tree}:${card.id}" aria-label="${esc(label)}">
    <span class="node-icon" aria-hidden="true">${card.icon}</span><span class="node-name">${cardName(card, lang)}</span>
    <span class="node-price" aria-hidden="true">${price === 'normal' ? '' : priceSymbol[price]}</span>${kind === 'chosen' ? `<span class="node-tick" aria-hidden="true">${status === 'partly' ? '½' : '✓'}</span>` : ''}</button>`;
}

function arrows(state, tree) {
  const cards = trees[tree], cols = Math.max(...cards.map(card => card.col)) + 1, rows = Math.max(...cards.map(card => card.row)) + 1;
  const width = (cols - 1) * COLW + NODEW, height = (rows - 1) * ROWH + NODEH;
  const paths = [], taken = new Set(cards.map(card => `${card.col}:${card.row}`));
  for (const card of cards) for (const parentId of card.parents) {
    const parent = cardById[parentId];
    const x1 = parent.col * COLW + NODEW, y1 = parent.row * ROWH + NODEH / 2, x2 = card.col * COLW - 2, y2 = card.row * ROWH + NODEH / 2;
    const mid = (x1 + x2) / 2;
    // An arrow that skips a column runs straight through the empty space; it dips only
    // when a card on the same row is in the way.
    const blocked = y1 === y2 && Array.from({ length:card.col - parent.col - 1 }, (_, i) => `${parent.col + i + 1}:${card.row}`).some(spot => taken.has(spot));
    const dip = blocked ? 44 : 0;
    const lit = state[tree].includes(card.id) && state[tree].includes(parentId);
    paths.push(`<path class="edge${lit ? ' lit' : ''}" d="M${x1},${y1} C${dip ? x1 + 50 : mid},${y1 + dip} ${dip ? x2 - 50 : mid},${y2 + dip} ${x2},${y2}" marker-end="url(#head-${tree}${lit ? '-lit' : ''})"/>`);
  }
  const head = (id, cls) => `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path class="${cls}" d="M0,0 L10,5 L0,10 z"/></marker>`;
  return { width, height, svg:`<svg class="edges" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><defs>${head(`head-${tree}`,'head')}${head(`head-${tree}-lit`,'head lit')}</defs>${paths.join('')}</svg>` };
}

export function treeMarkup(state, tree, lang, L, { compact = false, added = '', unlocked = [], preview = false, mark = false, marks = {}, locked = false } = {}) {
  const flags = { added, unlocked, preview, mark, marks, locked };
  const cards = trees[tree];
  if (compact) {
    const cols = [...new Set(cards.map(card => card.col))].sort((a, b) => a - b);
    return `<div class="tree-list">${cols.map(col => `<section><h3>${lang === 'ja' ? `ステップ${col + 1}` : `Step ${col + 1}`}</h3>${cards.filter(card => card.col === col).sort((a, b) => a.row - b.row).map(card => `<div class="list-row">${nodeMarkup(state, tree, card, lang, L, flags)}${flags.preview ? `<small class="tip-inline">${esc(plain(card.summary[lang]))}</small>` : ''}${card.parents.length ? `<small>← ${card.parents.map(id => cardName(cardById[id], lang)).join(lang === 'ja' ? ' ＋ ' : ' + ')}</small>` : ''}</div>`).join('')}</section>`).join('')}</div>`;
  }
  const { width, height, svg } = arrows(state, tree);
  return `<div class="tree-scroll"><div class="tree-graph tree-${tree}" data-w="${width}" data-h="${height}">${svg}${cards.map(card => nodeMarkup(state, tree, card, lang, L, flags)).join('')}</div></div>`;
}
