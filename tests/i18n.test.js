import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionary, summaryKeys } from '../shared/i18n.js';
import { submissionGaps, textFields, initialState } from '../shared/game.js';

// The presentation preview, the teacher review panel and the printout all label their rows
// by looking a key up in this dictionary. A missing key used to fall back silently to an
// unrelated string, so the Science and Society rows both read "Choose your assigned map
// point". Absent keys must be a test failure, not a quiet mislabel.
test('both locales carry the same keys', () => {
  const en=Object.keys(dictionary.en).sort();
  const ja=Object.keys(dictionary.ja).sort();
  assert.deepEqual(en.filter(key=>!ja.includes(key)),[],'keys missing from Japanese');
  assert.deepEqual(ja.filter(key=>!en.includes(key)),[],'keys missing from English');
});

test('every locale value is present and non-empty', () => {
  for (const [locale,strings] of Object.entries(dictionary)) {
    for (const [key,value] of Object.entries(strings)) {
      if (Array.isArray(value)) { assert(value.length&&value.every(Boolean),`${locale}.${key} array`); continue; }
      assert.equal(typeof value,'string',`${locale}.${key} should be a string`);
      assert(value.trim().length,`${locale}.${key} should not be empty`);
    }
  }
});

test('every presentation row has its own label', () => {
  for (const locale of Object.keys(dictionary)) {
    for (const key of summaryKeys) {
      assert(dictionary[locale][key],`${locale} is missing a label for the "${key}" row`);
    }
  }
  // The rows must not share a label, which is how the original defect showed up.
  for (const locale of Object.keys(dictionary)) {
    const labels=summaryKeys.map(key=>dictionary[locale][key]);
    assert.equal(new Set(labels).size,labels.length,`${locale} reuses a row label`);
  }
});

test('every submission gap can be named to students', () => {
  const gaps=submissionGaps(initialState());
  assert(gaps.length,'a blank team should report gaps');
  for (const locale of Object.keys(dictionary)) {
    for (const key of gaps) assert(dictionary[locale][key],`${locale} is missing a label for the "${key}" gap`);
  }
});

test('every editable field has a label and a placeholder', () => {
  for (const locale of Object.keys(dictionary)) {
    for (const key of textFields) {
      assert(dictionary[locale][key],`${locale} is missing the ${key} label`);
      assert(dictionary[locale][key+'Ph'],`${locale} is missing the ${key} placeholder`);
    }
  }
});

test('templated strings keep their placeholder', () => {
  for (const locale of Object.keys(dictionary)) {
    for (const key of ['writingHere','changedField']) {
      assert(dictionary[locale][key].includes('%s'),`${locale}.${key} lost its %s placeholder`);
    }
  }
});
