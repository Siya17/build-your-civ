// Small building blocks shared by every screen. All text is escaped here.
import { glossary } from '../shared/glossary.js';
import { credits } from '../shared/credits.js';

export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
export const fmt = (template, ...values) => values.reduce((text, value) => text.replace('%s', value), String(template));
// {en,ja} objects pick the language; anything else is returned as it is.
export const loc = (value, lang) => value && typeof value === 'object' && !Array.isArray(value) ? (value[lang] ?? value.en) : value;
// {漢字|かな} → furigana. Runs on text that is already escaped.
export const ruby = html => html.replace(/\{([^{}|]+)\|([^{}]+)\}/g, '<ruby>$1<rp>(</rp><rt>$2</rt><rp>)</rp></ruby>');
// [[id|shown]] → a button that opens the glossary popover.
export function rich(text, lang, { terms = true } = {}) {
  const html = esc(text).replace(/\[\[([a-z]+)(?:\|([^\]]+))?\]\]/g, (match, id, shown) => {
    const entry = glossary[id];
    const label = shown ?? (entry ? entry[lang][0] : id);
    return terms && entry && entry.popup?.[lang] !== false ? `<button type="button" class="term" data-term="${id}" aria-haspopup="dialog">${ruby(label)}</button>` : ruby(label);
  });
  return ruby(html);
}
// The same text without markup: for alt text, titles and labels.
export const plain = text => String(text ?? '').replace(/\[\[[a-z]+\|([^\]]+)\]\]/g,'$1').replace(/\[\[([a-z]+)\]\]/g,'$1').replace(/\{([^{}|]+)\|[^{}]+\}/g,'$1');
export const cardName = (card, lang, { terms = false } = {}) => {
  const entry = glossary[card.id];
  return terms && entry ? rich(`[[${card.id}|${card[lang]}]]`, lang) : rich(card[lang], lang, { terms:false });
};
export const cardPlain = (card, lang) => plain(card[lang]);

// A primary or secondary button. `data` is a map of data-* attributes.
export function btn(label, data, { kind = 'primary', disabled = false, extra = '' } = {}) {
  const attrs = Object.entries(data).map(([key, value]) => `data-${key}="${esc(value)}"`).join(' ');
  return `<button type="button" class="btn ${kind}" ${attrs} ${disabled ? 'disabled' : ''} ${extra}>${label}</button>`;
}

export const priceSymbol = { free:'★', normal:'●', hard:'△', impossible:'✗' };
export const label = text => ruby(esc(text));
export const priceBadge = (price, L) => `<span class="price price-${price}"><b aria-hidden="true">${priceSymbol[price]}</b> ${label(L[`price_${price}`])}</span>`;
export const statusBadge = (status, L) => `<span class="status status-${status}">${label(L[`status_${status}`])}</span>`;
export const eventDiceText = event => (event?.dice?.length > 1 ? `${event.dice.join(' / ')} → ` : '') + (event?.id ?? event?.roll ?? '');
export const heroPath = point => credits[`${point}/atmosphere.webp`] ? `${point}/atmosphere.webp` : `${point}/hero.webp`;

// A photo with its credit line (required by the licences). Missing photos fall back to a
// coloured panel, so the page still works while images load or if one is absent.
export function photo(path, alt, { cls = '', eager = false, lang = 'en' } = {}) {
  // Heroes are illustrative scenes; the land/resources/history screens retain
  // documentary photographs. The manifest is also the availability check.
  if (/^[A-K]\/hero\.webp$/.test(path)) path = heroPath(path[0]);
  const credit = credits[path];
  const origin = credit?.kind === 'generated' ? (lang === 'ja' ? '想像による景観イラスト（AI生成）' : 'Imagined landscape · AI-generated illustration') : '';
  const caption = credit ? `<figcaption class="credit">${origin || `${credit.source ? `<a href="${esc(credit.source)}" target="_blank" rel="noopener">${esc(credit.author)}</a>` : esc(credit.author)}${credit.license ? ` · ${esc(credit.license)}` : ''}`}</figcaption>` : '';
  return `<figure class="photo ${cls}"><img src="/assets/regions/${esc(path)}" alt="${esc(origin ? `${alt} — ${origin}` : alt)}" ${eager ? '' : 'loading="lazy"'} decoding="async" data-photo />${caption}</figure>`;
}

// A 3D die. mode: 'spin' (waiting for the server), 'land' (animate onto the value) or 'still'.
const pips = { 1:[5], 2:[1,9], 3:[1,5,9], 4:[1,3,7,9], 5:[1,3,5,7,9], 6:[1,3,4,6,7,9] };
const face = n => `<div class="face f${n}">${Array.from({ length:9 }, (_, i) => `<i class="${pips[n].includes(i + 1) ? 'pip' : ''}"></i>`).join('')}</div>`;
export function dieMarkup(value, mode) {
  const state = mode === 'spin' ? 'spin' : `${mode === 'land' ? 'land' : 'show'}-${value}`;
  return `<div class="die-scene" aria-hidden="true"><div class="die ${state}">${[1,2,3,4,5,6].map(face).join('')}</div></div>`;
}

// Two small charts, one measure each (never two scales on one axis), plus a table view.
export function climateCharts(climate, L, lang) {
  const months = L.months, W = 600, H = 170, left = 40, right = 590, top = 12, bottom = 138;
  const x = i => left + (i + 0.5) * (right - left) / 12;
  const step = (right - left) / 12;
  const monthLabels = months.map((m, i) => `<text class="tick" x="${x(i).toFixed(1)}" y="${H - 12}" text-anchor="middle">${esc(lang === 'ja' ? String(i + 1) : m.slice(0,1))}</text>`).join('');
  // An optional estimate for about 2000 BCE is drawn as dashed marks over today's values.
  const past = climate.past ? { rain:climate.rain.map(v => Math.round(v * climate.past.rainFactor)), temp:climate.temp.map(v => Math.round((v + climate.past.tempShift) * 10) / 10) } : null;
  // Rain: bars from a zero baseline.
  const rainMax = Math.max(50, Math.ceil(Math.max(...climate.rain, ...(past?.rain ?? [])) / 50) * 50);
  const ry = v => bottom - v / rainMax * (bottom - top);
  const rainGrid = [0, rainMax / 2, rainMax].map(v => `<line class="grid" x1="${left}" x2="${right}" y1="${ry(v)}" y2="${ry(v)}"/><text class="tick" x="${left - 6}" y="${ry(v) + 4}" text-anchor="end">${v}</text>`).join('');
  const peak = climate.rain.indexOf(Math.max(...climate.rain));
  const bars = climate.rain.map((v, i) => {
    const h = Math.max(v / rainMax * (bottom - top), v > 0 ? 2 : 0), w = step * 0.62, bx = x(i) - w / 2, by = bottom - h;
    const r = Math.min(4, h / 2, w / 2);
    const path = h ? `M${bx},${bottom}V${by + r}Q${bx},${by} ${bx + r},${by}H${bx + w - r}Q${bx + w},${by} ${bx + w},${by + r}V${bottom}Z` : '';
    return `<g class="mark"><rect class="hit" x="${(x(i) - step / 2).toFixed(1)}" y="${top}" width="${step.toFixed(1)}" height="${bottom - top}"/>${path ? `<path class="bar" d="${path}"/>` : ''}<title>${esc(months[i])}: ${v} mm</title></g>`;
  }).join('');
  const pastBars = past && climate.past.rainFactor !== 1 ? past.rain.map((v, i) => { const w = step * 0.62, h = v / rainMax * (bottom - top); return h ? `<rect class="bar-past" x="${(x(i) - w / 2).toFixed(1)}" y="${(bottom - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}"><title>${esc(months[i])}: ~${v} mm (${esc(L.climatePastLabel)})</title></rect>` : ''; }).join('') : '';
  const peakLabel = `<text class="value" x="${x(peak).toFixed(1)}" y="${(ry(climate.rain[peak]) - 6).toFixed(1)}" text-anchor="middle">${climate.rain[peak]}</text>`;
  // Temperature: one line with markers; the highest and lowest months are labelled.
  const allTemps = [...climate.temp, ...(past?.temp ?? [])];
  const tMin = Math.min(0, Math.floor((Math.min(...allTemps) - 3) / 5) * 5), tMax = Math.ceil((Math.max(...allTemps) + 3) / 5) * 5;
  const ty = v => bottom - (v - tMin) / (tMax - tMin) * (bottom - top);
  const ticks = [tMin, Math.round((tMin + tMax) / 2), tMax];
  const tempGrid = ticks.map(v => `<line class="grid${v === 0 ? ' zero' : ''}" x1="${left}" x2="${right}" y1="${ty(v)}" y2="${ty(v)}"/><text class="tick" x="${left - 6}" y="${ty(v) + 4}" text-anchor="end">${v}</text>`).join('')
    + (tMin < 0 && !ticks.includes(0) ? `<line class="grid zero" x1="${left}" x2="${right}" y1="${ty(0)}" y2="${ty(0)}"/>` : '');
  const line = climate.temp.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${ty(v).toFixed(1)}`).join('');
  const pastLine = past && climate.past.tempShift ? `<path class="line-past" d="${past.temp.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${ty(v).toFixed(1)}`).join('')}"><title>${esc(L.climatePastLabel)}</title></path>` : '';
  const hi = climate.temp.indexOf(Math.max(...climate.temp)), lo = climate.temp.indexOf(Math.min(...climate.temp));
  const dots = climate.temp.map((v, i) => `<g class="mark"><rect class="hit" x="${(x(i) - step / 2).toFixed(1)}" y="${top}" width="${step.toFixed(1)}" height="${bottom - top}"/><circle class="dot" cx="${x(i).toFixed(1)}" cy="${ty(v).toFixed(1)}" r="4.5"/><title>${esc(months[i])}: ${v} °C</title></g>`).join('');
  const tempLabels = [...new Set([hi, lo])].map(i => `<text class="value" x="${x(i).toFixed(1)}" y="${(ty(climate.temp[i]) + (i === hi ? -10 : 18)).toFixed(1)}" text-anchor="middle">${climate.temp[i]}°</text>`).join('');
  const table = `<details class="numbers"><summary>${L.climateTable}</summary><div class="table-scroll"><table><thead><tr><th scope="col">${L.month}</th>${months.map(m => `<th scope="col">${esc(m)}</th>`).join('')}</tr></thead><tbody><tr><th scope="row">mm</th>${climate.rain.map(v => `<td>${v}</td>`).join('')}</tr><tr><th scope="row">°C</th>${climate.temp.map(v => `<td>${v}</td>`).join('')}</tr>${past ? `<tr><th scope="row">~mm ${esc(L.climatePastShort)}</th>${past.rain.map(v => `<td>${v}</td>`).join('')}</tr><tr><th scope="row">~°C ${esc(L.climatePastShort)}</th>${past.temp.map(v => `<td>${v}</td>`).join('')}</tr>` : ''}</tbody></table></div></details>`;
  return `<div class="charts">
    <figure class="chart rain"><figcaption>${L.rainTitle}</figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(L.rainTitle)}">${rainGrid}${bars}${pastBars}${peakLabel}${monthLabels}</svg></figure>
    <figure class="chart temp"><figcaption>${L.tempTitle}</figcaption><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(L.tempTitle)}">${tempGrid}${pastLine}<path class="line" d="${line}"/>${dots}${tempLabels}${monthLabels}</svg></figure>
  </div>${past ? `<p class="climate-legend"><span class="key-today"></span>${esc(L.climateTodayLabel)} <span class="key-past"></span>${esc(L.climatePastLabel)}</p><aside class="climate-past"><h2>${esc(L.climatePastTitle)}</h2><p>${esc(climate.past.note[lang])}</p><p class="small muted">${esc(L.climatePastCaveat)} <a href="${esc(climate.past.source.url)}" target="_blank" rel="noopener">${esc(climate.past.source.title[lang])}</a></p></aside>` : ''}${table}`;
}
