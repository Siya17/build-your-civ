// Print a snapshot of the requested posters without changing the current activity.
import { regions } from '../shared/regions.js';
import { posterMarkup } from './poster.js';
import { esc } from './ui.js';

export function printablePosters(teams, lang, L) {
  return teams.filter(team => regions[team.state?.mapPoint]).map(team =>
    `<section class="print-poster"><p class="print-team">${esc(team.name)}</p>${posterMarkup(team, lang, L)}</section>`
  ).join('');
}

export async function printPosters(teams, lang, L) {
  const markup = printablePosters(teams, lang, L);
  if (!markup) return;
  document.querySelector('#poster-print')?.remove();
  const host = document.createElement('div');
  host.id = 'poster-print';
  host.innerHTML = markup;
  document.body.append(host);
  // Decode local images before opening the preview, including when a teacher has
  // not opened the posters individually. Failed images must not block printing.
  await Promise.all([...host.querySelectorAll('img')].map(img => img.decode().catch(() => {})));
  if (document.fonts?.ready) await document.fonts.ready;
  const cleanup = () => { document.body.classList.remove('printing-posters'); host.remove(); };
  window.addEventListener('afterprint', cleanup, { once:true });
  document.body.classList.add('printing-posters');
  try { window.print(); } catch (error) { cleanup(); throw error; }
}
