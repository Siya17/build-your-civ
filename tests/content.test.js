import test from 'node:test';
import assert from 'node:assert/strict';
import { regions, points } from '../shared/regions.js';
import { trees } from '../shared/cards.js';
import { regionalGeography } from '../public/regional-geography.js';
import { regionalMap } from '../public/regional-map.js';
import { plain } from '../public/ui.js';

const wordCount = text => plain(text).trim().split(/\s+/).filter(Boolean).length;
const japanese = text => typeof text === 'string' && /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u.test(text);

test('all eleven introductory regional readings have undergraduate depth in both languages', () => {
  assert.equal(points.length,11);
  for(const point of points) {
    const context=regions[point].context;
    assert(context && Array.isArray(context.en) && Array.isArray(context.ja),`${point}: bilingual geographical reading`);
    assert(context.en.length>=3 && context.ja.length>=3,`${point}: several connected paragraphs`);
    const words=wordCount(context.en.join(' '));
    assert(words>=250 && words<=350,`${point}: ${words} words, expected 250–350`);
    assert(context.ja.every(japanese),`${point}: every Japanese paragraph must contain Japanese text`);
  }
});

test('every historical reading contains supported facts across 400–600 English words', () => {
  for(const point of points) {
    const reveal=regions[point].reveal;
    assert(Array.isArray(reveal.reading) && reveal.reading.length>=3,`${point}: expanded historical reading`);
    const words=wordCount(reveal.reading.map(paragraph=>paragraph.text.en).join(' '));
    assert(words>=400 && words<=600,`${point}: ${words} words, expected 400–600`);
    assert(Array.isArray(reveal.sources) && reveal.sources.length>0,`${point}: historical sources`);
    for(const [index,paragraph]of reveal.reading.entries()) {
      assert(paragraph.text.en.trim(),`${point}/${index}: English paragraph`);
      assert(japanese(paragraph.text.ja),`${point}/${index}: Japanese paragraph`);
      assert(Array.isArray(paragraph.sources) && paragraph.sources.length>0,`${point}/${index}: paragraph-level support`);
      for(const sourceIndex of paragraph.sources) {
        assert(Number.isInteger(sourceIndex) && sourceIndex>=0 && sourceIndex<reveal.sources.length,`${point}/${index}: valid citation ${sourceIndex}`);
        const source=reveal.sources[sourceIndex];
        assert.match(source.url,/^https:\/\//,`${point}/${index}: linked source`);
        assert(source.title.en.trim() && japanese(source.title.ja),`${point}/${index}: bilingual citation title`);
      }
    }
  }
});

test('all 33 developments explain their mechanism and have concise bilingual summaries', () => {
  const developments=Object.values(trees).flat();
  assert.equal(developments.length,33);
  for(const development of developments) {
    const words=wordCount(development.what.en);
    assert(words>=70 && words<=100,`${development.id}: ${words} words, expected 70–100`);
    assert(japanese(development.what.ja),`${development.id}: Japanese explanation`);
    assert(development.summary?.en?.trim() && japanese(development.summary?.ja),`${development.id}: concise bilingual summary`);
    assert(wordCount(development.summary.en)<words,`${development.id}: summary is shorter than explanation`);
  }
});

test('regional maps cover every starting site and render accessible credited physical layers', () => {
  for(const point of points) {
    const region=regions[point],data=regionalGeography[region.mapKey];
    assert(data,`${point}: bundled physical data for ${region.mapKey}`);
    assert.equal(region.mapBounds.length,4);
    assert(region.mapBounds.every(Number.isFinite));
    const [west,south,east,north]=region.mapBounds,[lat,lon]=region.site;
    assert(west<east && south<north,`${point}: ordered bounds`);
    assert(lon>=west && lon<=east && lat>=south && lat<=north,`${point}: starting site lies within regional bounds`);
    assert(data.land.length>0,`${point}: visible land geometry`);
    for(const layer of ['land','rivers','lakes','highlands','deserts','wetlands','ice'])assert(Array.isArray(data[layer]),`${point}: ${layer} layer`);
    assert(region.mapLabels.length>=3,`${point}: physical features are labelled`);
    for(const lang of ['en','ja']) {
      const html=regionalMap(region,lang);
      assert.match(html,/<svg[^>]*role="img"[^>]*aria-label="[^"]+"[^>]*viewBox="0 0 \d+ \d+"/);
      assert.match(html,/<title>[^<]+<\/title>/);
      assert.match(html,/<path d="M/);
      assert.match(html,/<figcaption[^>]*>.*Natural Earth/s);
      assert(html.includes('https://www.naturalearthdata.com/about/terms-of-use/'));
      assert.doesNotMatch(html,/\sstyle=|NaN|undefined|Infinity/);
      for(const label of region.mapLabels)assert(html.includes(plain(label.label[lang])),`${point}/${lang}: ${label.label[lang]}`);
    }
  }
});
