import { placeError, settleTiles } from './land.js';
import { routeUnlocked } from './routes.js';
import { trailError, normalizeTrails, edgeKey } from './layout.js';

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
  { id:'engineering', en:'Engineering', ja:'工学', icon:'⚙️', tier:3, parents:['iron','wheel'], hint:'Design complex structures and systems.' },
  { id:'preservation', en:'Preservation Methods', ja:'保存技術', icon:'🫙', tier:1, parents:[], gate:['origin','steward'], hint:'Protect food and materials for uncertain seasons.' },
  { id:'route_mapping', en:'Route Mapping', ja:'道の地図作り', icon:'🧭', tier:1, parents:[], gate:['origin','explore'], hint:'Record paths between places.' }
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
  { id:'theology', en:'Theology', ja:'神学', icon:'🌙', tier:4, parents:['poetry','mysticism'], hint:'Develop ideas about belief.' },
  { id:'mutual_aid', en:'Mutual Aid Pact', ja:'相互扶助の約束', icon:'🤲', tier:2, parents:[], gate:['encounter','share'], hint:'Agree to share supplies with neighbors.' },
  { id:'resource_council', en:'Resource Council', ja:'資源評議会', icon:'🪵', tier:2, parents:[], gate:['encounter','reserve'], hint:'Plan how local supplies are protected and used.' },
  { id:'trade_accord', en:'Trade Accord', ja:'交易協定', icon:'📦', tier:2, parents:[], gate:['encounter','exchange'], hint:'Agree on fair exchange across a new route.' },
  { id:'route_stewards', en:'Route Stewards', ja:'道の管理者', icon:'🗺️', tier:2, parents:[], gate:['encounter','guard'], hint:'Set rules for safe travel and access.' }
];

export const trees = { tech, civic };
export const textFields = ['placeAnswer','techAnswer','societyAnswer','beliefAnswer','contactAnswer'];
export const avatars = 'ABCDEFGHIJK'.split('');
export const eventChoices = {origin:['steward','explore'],steward:['share','reserve'],explore:['exchange','guard']};
export const mapPoints = {A:[16.8,61.5],B:[14.2,39.4],C:[19.2,42.1],D:[26.4,45.8],E:[34.2,52.6],F:[36.6,38.2],G:[15.9,48.8],H:[43.8,71],I:[71.2,46.7],J:[78.8,61.5],K:[85.5,19.9]};

// Join codes are the team's short name and a three-digit PIN, read aloud as "A-427".
// Teams created before this keep their nine-character codes from the older alphabet.
export const codeAlphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
export const codeLength = 13;
// Codes are read aloud in groups, so accept any spacing or punctuation around the characters.
export const normalizeCode = value => String(value ?? '').toUpperCase().replace(/[^A-Z0-9]/g,'');
const legacyCode = code => code.length === 9 && [...code].every(character => codeAlphabet.includes(character));
export const isCodeShape = code => /^[A-Z0-9]{1,10}[0-9]{3}$/.test(code) || legacyCode(code);
// "Team A" is tagged A; any other name uses its letters and digits, e.g. "River Makers" → RIVERMAKER.
export function codeTag(name) {
  const upper = String(name ?? '').normalize('NFKD').toUpperCase().trim();
  const tag = (upper.match(/^TEAM\s+([A-Z0-9]+)$/)?.[1] ?? upper).replace(/[^A-Z0-9]/g,'').slice(0,10);
  return tag || 'TEAM';
}

export function initialState() {
  return {stage:1,mapPoint:'',avatar:'',route:'',placeAnswer:'',techAnswer:'',societyAnswer:'',beliefAnswer:'',contactAnswer:'',tech:[],civic:[],events:{origin:'',encounter:''},tiles:{},trails:[],plannedBuildings:[]};
}

export const gateOpen = (item,state) => !item.gate || state.events?.[item.gate[0]]===item.gate[1];
export const hasCoreChoice = (state,kind) => state[kind].some(id=>trees[kind].some(item=>item.id===id&&!item.gate));
const chosenValid = (items, selected, state) => {
  const retained = new Set(selected.filter(id => {const item=items.find(x=>x.id===id);return item&&gateOpen(item,state)}));
  let changed=true;
  while(changed){
    changed=false;
    for(const item of items) if(retained.has(item.id)&&item.parents.length&&!item.parents.some(id=>retained.has(id))){retained.delete(item.id);changed=true}
  }
  return selected.filter(id=>retained.has(id));
};

export function questStatus(state,submitted=false){
  const filled=key=>!!String(state[key]??'').trim();
  return [
    !!(Object.hasOwn(mapPoints,state.mapPoint)&&filled('placeAnswer')&&state.events?.origin),
    !!(hasCoreChoice(state,'tech')&&filled('techAnswer')),
    !!(hasCoreChoice(state,'civic')&&filled('societyAnswer')&&filled('beliefAnswer')&&state.events?.encounter),
    !!(submitted&&filled('contactAnswer'))
  ];
}

export function applyAction(previous, action) {
  const state = {...previous, avatar:Object.hasOwn(mapPoints,previous.mapPoint)?previous.mapPoint:'', tech:[...previous.tech], civic:[...previous.civic], events:{...previous.events}, tiles:{...previous.tiles},trails:(previous.trails||[]).map(edge=>[...edge]),plannedBuildings:[...(previous.plannedBuildings||[])]};
  if (action?.type === 'stage') {
    const next = Number(action.stage);
    if (!Number.isInteger(next) || next < 1 || next > 4) throw new Error('Invalid stage');
    state.stage = next;
  } else if (action?.type === 'map') {
    if (!Object.hasOwn(mapPoints, action.point)) throw new Error('Invalid map point');
    if (state.fixedPoint && action.point !== state.fixedPoint) throw new Error('Your teacher has set your homeland');
    if (state.mapPoint !== action.point) {state.tiles = {};state.route = '';state.trails=[];}
    state.mapPoint = action.point;
    state.avatar = action.point;
  } else if (action?.type === 'avatar') {
    if (!avatars.includes(action.id) || action.id !== state.mapPoint) throw new Error('Your team character belongs to your chosen location');
    state.avatar = action.id;
  } else if (action?.type === 'field') {
    if (!textFields.includes(action.key) || typeof action.value !== 'string') throw new Error('Invalid field');
    const max = 600;
    if (action.value.length > max) throw new Error(`Answer is too long (max ${max} characters)`);
    state[action.key] = action.value.replace(/\r/g,'');
  } else if (action?.type === 'event') {
    const events=state.events ||= {origin:'',encounter:''};
    if(action.id==='origin'){
      if(!state.mapPoint||!state.placeAnswer.trim()) throw new Error('Describe your place before this decision');
      if(!eventChoices.origin.includes(action.choice)) throw new Error('Invalid event choice');
      if(events.origin!==action.choice){
        events.origin=action.choice;events.encounter='';
        state.tech=chosenValid(tech,state.tech,state);
        state.civic=chosenValid(civic,state.civic,state);
      }
    } else if(action.id==='encounter'){
      if(!events.origin||!hasCoreChoice(state,'tech')) throw new Error('Choose a technology path first');
      if(!eventChoices[events.origin].includes(action.choice)) throw new Error('Invalid event choice');
      if(events.encounter!==action.choice){
        events.encounter=action.choice;
        state.civic=chosenValid(civic,state.civic,state);
      }
    } else throw new Error('Invalid event');
  } else if (action?.type === 'pick') {
    const items = trees[action.tree];
    if (!items || !Array.isArray(state[action.tree])) throw new Error('Invalid tree');
    const item = items.find(x => x.id === action.id);
    if (!item) throw new Error('Invalid development');
    const selected = new Set(state[action.tree]);
    if(selected.has(item.id)&&Object.hasOwn(action,'tile')){
      if(action.tile===null){delete state.tiles[item.id];state.plannedBuildings.push(item.id);}
      else{const error=placeError(state,item.id,action.tile);if(error)throw new Error(error);state.tiles[item.id]=action.tile;state.plannedBuildings=state.plannedBuildings.filter(id=>id!==item.id);}
    } else if (selected.has(item.id)) {
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
      if (!gateOpen(item,state)) throw new Error('Resolve the matching event to unlock this development');
      if (item.parents.length && !item.parents.some(id => selected.has(id))) throw new Error('Choose a connected earlier development first');
      state[action.tree].push(item.id);
      if(Object.hasOwn(action,'tile')) {
        if(action.tile===null)state.plannedBuildings.push(item.id);
        else {
          const error=placeError(state,item.id,action.tile);
          if(error)throw new Error(error);
          state.tiles[item.id]=action.tile;
        }
      }
    }
  } else if (action?.type === 'route') {
    if (state.stage !== 4 || !questStatus(state).slice(0,3).every(Boolean)) throw new Error('Complete the first three steps before choosing a route');
    if (!routeUnlocked(state, action.id)) throw new Error('Discover the required technology and civic before choosing this route');
    state.route = action.id;
  } else if (action?.type === 'place') {
    const error = placeError(state, action.id, action.tile);
    if (error) throw new Error(error);
    state.tiles[action.id] = action.tile;
    state.plannedBuildings=state.plannedBuildings.filter(id=>id!==action.id);
  } else if (action?.type === 'trail') {
    if(!['add','remove'].includes(action.mode))throw new Error('Choose whether to add or remove a trail');
    const error=trailError(state,action.path,action.mode==='remove');
    if(error)throw new Error(error);
    const edges=new Map(normalizeTrails(state).map(([a,b])=>[edgeKey(a,b),[a,b]]));
    for(let n=1;n<action.path.length;n++) {
      const a=action.path[n-1],b=action.path[n],key=edgeKey(a,b);
      if(action.mode==='add')edges.set(key,[Math.min(a,b),Math.max(a,b)]);else edges.delete(key);
    }
    state.trails=[...edges.values()];
  } else {
    throw new Error('Invalid action');
  }
  if (state.route && !routeUnlocked(state, state.route)) state.route = '';
  state.plannedBuildings=[...new Set(state.plannedBuildings)].filter(id=>state.tech.includes(id)||state.civic.includes(id));
  state.tiles = settleTiles(state);
  state.trails=normalizeTrails(state);
  return state;
}

export function submissionGaps(state) {
  const needed = ['mapPoint','avatar','placeAnswer','tech','techAnswer','civic','societyAnswer','beliefAnswer','contactAnswer','origin','encounter'];
  return needed.filter(key => key==='avatar' ? !Object.hasOwn(mapPoints,state.mapPoint) : key==='origin'||key==='encounter' ? !state.events?.[key] : key==='tech'||key==='civic' ? !hasCoreChoice(state,key) : !String(state[key] ?? '').trim());
}
