import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dictionary, gapKeys } from '../shared/i18n.js';
import { submissionGaps, initialState, textFields, writableFields, chipOptions, errorText } from '../shared/game.js';
import { regions } from '../shared/regions.js';
import { tech, civic } from '../shared/cards.js';
import { glossary } from '../shared/glossary.js';
import { credits } from '../shared/credits.js';

const root = fileURLToPath(new URL('../', import.meta.url));
// Every {en, ja} pair, with where it came from.
function* pairs(value, path = '') {
  if (!value || typeof value !== 'object') return;
  if ('en' in value && 'ja' in value) { yield [path, value.en, value.ja]; return; }
  for (const [key, inner] of Object.entries(value)) yield* pairs(inner, `${path}.${key}`);
}
const allPairs = [...pairs(regions,'regions'), ...pairs(Object.fromEntries([...tech, ...civic].map(card => [card.id, { name:{ en:card.en, ja:card.ja }, what:card.what }])),'cards'), ...Object.entries(glossary).map(([id, entry]) => [`glossary.${id}`, entry.en, entry.ja])];
const strings = value => typeof value === 'string' ? [value] : Array.isArray(value) ? value.flatMap(strings) : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

test('both languages carry the same keys, and nothing is empty', () => {
  const shape = value => Array.isArray(value) ? `array:${value.length}` : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, inner]) => [key, shape(inner)])) : typeof value;
  assert.deepEqual(shape(dictionary.ja), shape(dictionary.en));
  for (const text of [...strings(dictionary.en), ...strings(dictionary.ja)]) assert(text.trim(), 'empty string');
  assert.deepEqual(Object.keys(dictionary.en.errors).sort(), Object.keys(errorText).sort(), 'every refusal can be translated');
});

test('regions, cards and glossary are complete in both languages', () => {
  for (const [path, en, ja] of allPairs) {
    assert.equal(Array.isArray(en), Array.isArray(ja), path);
    if (Array.isArray(en)) assert.equal(en.length, ja.length, `${path}: the same number of sentences`);
    for (const text of [...strings(en), ...strings(ja)]) assert(text.trim(), `${path} is empty`);
  }
});

test('every gap, answer and chip has a label', () => {
  for (const lang of ['en','ja']) {
    for (const key of [...gapKeys, ...writableFields]) assert(dictionary[lang][key], `${lang}: ${key}`);
    for (const [group, values] of Object.entries(chipOptions)) for (const value of values) assert(dictionary[lang][`chips_${group}`][value], `${lang}: ${group}.${value}`);
  }
  assert.deepEqual(submissionGaps(initialState()).filter(gap => !gapKeys.includes(gap)), []);
  for (const key of textFields) assert(gapKeys.includes(key));
  for (const key of Object.keys(chipOptions)) assert(gapKeys.includes(key), `${key}: the required selection needs a gap label`);
});

test('every glossary word in the text exists, and both languages mark the same words', () => {
  const marked = text => [...String(text).matchAll(/\[\[([a-z]+)/g)].map(match => match[1]);
  for (const [path, en, ja] of allPairs) {
    const a = strings(en).flatMap(marked), b = strings(ja).flatMap(marked);
    for (const id of [...a, ...b]) assert(glossary[id], `${path} uses an unknown word "${id}"`);
    assert.deepEqual([...a].sort(), [...b].sort(), `${path}: the same words are explained in both languages`);
  }
});

test('furigana markup is well formed', () => {
  for (const text of [...strings(dictionary.ja), ...allPairs.flatMap(([, , ja]) => strings(ja))]) {
    const open = (text.match(/\{/g) || []).length, close = (text.match(/\}/g) || []).length;
    assert.equal(open, close, `unbalanced furigana in: ${text}`);
    for (const match of text.matchAll(/\{([^{}]*)\}/g)) assert.match(match[1], /^[^|]+\|[^|]+$/, `bad furigana: ${match[0]}`);
  }
});

test('English sentences stay short (B1–B2)', () => {
  const long = [];
  for (const text of [...strings(dictionary.en), ...allPairs.flatMap(([, en]) => strings(en))]) {
    const clean = text.replace(/\[\[[a-z]+\|([^\]]+)\]\]/g,'$1').replace(/\[\[([a-z]+)\]\]/g,'$1');
    for (const sentence of clean.split(/(?<=[.!?:])\s+/)) if (sentence.split(/\s+/).length > 22) long.push(sentence);
  }
  assert.deepEqual(long, []);
});

test('every photo a screen uses exists and has a credit', () => {
  const used = ['world-map'];
  for (const [point, region] of Object.entries(regions)) {
    for (const name of ['hero','land','challenge','reveal-1','reveal-2', ...region.resources.map(item => item.id)]) used.push(`${point}/${name}.webp`);
  }
  for (const entry of Object.values(glossary)) if (entry.img) used.push(entry.img);
  const missing = used.filter(path => path !== 'world-map' && !existsSync(`${root}public/assets/regions/${path}`));
  assert.deepEqual(missing, [], 'missing image files');
  for (const path of used) {
    const credit = credits[path];
    assert(credit && credit.author && credit.license && credit.source, `${path} needs a credit`);
    assert.doesNotMatch(credit.license, /NC|ND/, `${path} must allow reuse`);
  }
  assert(existsSync(`${root}public/assets/world-map.webp`));
});

test('the browser credit export matches the editable attribution manifest', () => {
  assert.deepEqual(credits, JSON.parse(readFileSync(new URL('../shared/credits.json', import.meta.url), 'utf8')));
});
