export const tech = [
  { id:'pottery', en:'Pottery', ja:'陶器', icon:'🏺', tier:0, parents:[], hint:'Store, cook, and carry food or water.' },
  { id:'husbandry', en:'Animal Husbandry', ja:'畜産', icon:'🐑', tier:0, parents:[], hint:'Raise and care for animals.' },
  { id:'mining', en:'Mining', ja:'採鉱', icon:'⛏️', tier:0, parents:[], hint:'Extract useful stone and metal.' },
  { id:'sailing', en:'Sailing', ja:'帆走', icon:'⛵', tier:1, parents:['pottery'], hint:'Travel and trade by water.' },
  { id:'astrology', en:'Astrology', ja:'占星術', icon:'☀️', tier:1, parents:['pottery'], hint:'Observe the sky and seasons.' },
  { id:'irrigation', en:'Irrigation', ja:'灌漑', icon:'💧', tier:1, parents:['pottery'], hint:'Bring water to fields.' },
  { id:'writing', en:'Writing', ja:'筆記', icon:'✍️', tier:1, parents:['pottery'], hint:'Record knowledge and agreements.' },
  { id:'archery', en:'Archery', ja:'弓術', icon:'🏹', tier:1, parents:['husbandry'], hint:'Use bows for hunting or defense.' },
  { id:'bronze', en:'Bronze Working', ja:'青銅器', icon:'⚒️', tier:1, parents:['mining'], hint:'Make metal tools and objects.' },
  { id:'masonry', en:'Masonry', ja:'石工術', icon:'🧱', tier:2, parents:['mining'], hint:'Build with shaped stone.' },
  { id:'wheel', en:'Wheel', ja:'車輪', icon:'🛞', tier:2, parents:['mining'], hint:'Move loads and make mechanisms.' },
  { id:'shipbuilding', en:'Shipbuilding', ja:'造船', icon:'🚢', tier:2, parents:['sailing'], hint:'Construct vessels for longer journeys.' },
  { id:'navigation', en:'Celestial Navigation', ja:'天文航法', icon:'⭐', tier:2, parents:['sailing','astrology'], hint:'Navigate using the stars.' },
  { id:'currency', en:'Currency', ja:'通貨', icon:'🪙', tier:2, parents:['writing'], hint:'Create a shared means of exchange.' },
  { id:'horseback', en:'Horseback Riding', ja:'騎乗', icon:'🐎', tier:2, parents:['archery'], hint:'Travel over land on horseback.' },
  { id:'iron', en:'Iron Working', ja:'鉄器', icon:'🔩', tier:2, parents:['bronze'], hint:'Make stronger metal tools.' },
  { id:'math', en:'Mathematics', ja:'数学', icon:'📐', tier:3, parents:['currency'], hint:'Measure and calculate.' },
  { id:'construction', en:'Construction', ja:'建設', icon:'🏛️', tier:3, parents:['horseback','masonry'], hint:'Organize larger building projects.' },
  { id:'engineering', en:'Engineering', ja:'工学', icon:'⚙️', tier:3, parents:['iron','wheel'], hint:'Design complex structures and systems.' }
];
export const civic = [
  { id:'laws', en:'Code of Laws', ja:'法律の成文化', icon:'⚖️', tier:0, parents:[], hint:'Agree on shared rules.' },
  { id:'craft', en:'Craftsmanship', ja:'手工業', icon:'🧵', tier:1, parents:['laws'], hint:'Develop specialized skills.' },
  { id:'trade', en:'Foreign Trade', ja:'外国貿易', icon:'🤝', tier:1, parents:['laws'], hint:'Exchange with other communities.' },
  { id:'workforce', en:'State Workforce', ja:'官吏組織', icon:'👥', tier:2, parents:['craft'], hint:'Coordinate work for shared projects.' },
  { id:'tradition', en:'Military Tradition', ja:'軍事伝統', icon:'🛡️', tier:2, parents:['craft'], hint:'Develop organized defense practices.' },
  { id:'empire', en:'Early Empire', ja:'初期帝国', icon:'🏙️', tier:2, parents:['trade'], hint:'Govern a wider network of places.' },
  { id:'mysticism', en:'Mysticism', ja:'神秘主義', icon:'✨', tier:2, parents:['trade'], hint:'Explore spiritual ideas and rituals.' },
  { id:'games', en:'Games and Recreation', ja:'娯楽と遊戯', icon:'🎲', tier:3, parents:['workforce'], hint:'Make time and space for play.' },
  { id:'philosophy', en:'Political Philosophy', ja:'政治哲学', icon:'💬', tier:3, parents:['workforce','empire'], hint:'Debate how power should work.' },
  { id:'poetry', en:'Drama and Poetry', ja:'演劇と詩', icon:'🎭', tier:3, parents:['empire'], hint:'Tell stories through performance.' },
  { id:'training', en:'Military Training', ja:'軍事訓練', icon:'🎯', tier:4, parents:['tradition','games'], hint:'Practice organized defense.' },
  { id:'defense', en:'Defensive Tactics', ja:'防御戦術', icon:'🏰', tier:4, parents:['games','philosophy'], hint:'Plan how to protect communities.' },
  { id:'history', en:'Recorded History', ja:'記録された歴史', icon:'📜', tier:4, parents:['philosophy','poetry'], hint:'Preserve accounts of the past.' },
  { id:'theology', en:'Theology', ja:'神学', icon:'🌙', tier:4, parents:['poetry','mysticism'], hint:'Develop ideas about belief.' }
];

export const trees = { tech, civic };
export const textFields = ['location','terrain','resources','challenge','govt','economy','belief','geographyUse','impact','tradeoff','connection'];
export const mapPoints = {A:[16.8,61.5],B:[14.2,39.4],C:[19.2,42.1],D:[26.4,45.8],E:[34.2,52.6],F:[36.6,38.2],G:[15.9,48.8],H:[43.8,71],I:[71.2,46.7],J:[78.8,61.5],K:[85.5,19.9]};

// Join codes: no I, O, 0 or 1, so a code read aloud is hard to mishear.
export const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const codeLength = 9;
// Codes are read aloud in groups, so accept any spacing or punctuation around the characters.
export const normalizeCode = value => String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g,'');
export const isCodeShape = code => code.length === codeLength && [...code].every(character => codeAlphabet.includes(character));

export function initialState() {
  return {stage:1,mapPoint:'',location:'',terrain:'',resources:'',challenge:'',tech:[],civic:[],govt:'',economy:'',belief:'',geographyUse:'',impact:'',tradeoff:'',connection:''};
}

export function applyAction(previous, action) {
  const state = {...previous, tech:[...previous.tech], civic:[...previous.civic]};
  if (action?.type === 'stage') {
    const next = Number(action.stage);
    if (!Number.isInteger(next) || next < 1 || next > 4) throw new Error('Invalid stage');
    state.stage = next;
  } else if (action?.type === 'map') {
    if (!Object.hasOwn(mapPoints, action.point)) throw new Error('Invalid map point');
    state.mapPoint = action.point;
  } else if (action?.type === 'field') {
    if (!textFields.includes(action.key) || typeof action.value !== 'string') throw new Error('Invalid field');
    const max = action.key === 'location' ? 160 : 800;
    if (action.value.length > max) throw new Error(`Answer is too long (max ${max} characters)`);
    state[action.key] = action.value.replace(/\r/g,'');
  } else if (action?.type === 'pick') {
    const items = trees[action.tree];
    if (!items || !Array.isArray(state[action.tree])) throw new Error('Invalid tree');
    const item = items.find(x => x.id === action.id);
    if (!item) throw new Error('Invalid development');
    const selected = new Set(state[action.tree]);
    if (selected.has(item.id)) {
      selected.delete(item.id);
      let changed = true;
      while (changed) {
        changed = false;
        for (const candidate of items) {
          if (selected.has(candidate.id) && candidate.parents.length && !candidate.parents.some(id => selected.has(id))) {
            selected.delete(candidate.id);
            changed = true;
          }
        }
      }
      state[action.tree] = state[action.tree].filter(id => selected.has(id));
    } else {
      if (selected.size >= 7) throw new Error('The seven choice limit is reached');
      if (item.parents.length && !item.parents.some(id => selected.has(id))) throw new Error('Choose a connected earlier development first');
      state[action.tree].push(item.id);
    }
  } else {
    throw new Error('Invalid action');
  }
  return state;
}

export function submissionGaps(state) {
  const needed = ['mapPoint','location','terrain','resources','tech','civic','govt','economy','belief','geographyUse','impact','connection'];
  return needed.filter(key => Array.isArray(state[key]) ? state[key].length === 0 : !String(state[key] ?? '').trim());
}
