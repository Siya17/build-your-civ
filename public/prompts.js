// The council's questions, written from the team's own land, buildings and decisions. The
// five answers the teacher receives stay the same; only the wording meets the team where it is.
import { trees } from '../shared/game.js';
import { locations } from '../shared/world.js';
import { generateLand, improvements, terrains, hazardOf, center } from '../shared/land.js';

export const fill=(template,values)=>String(template).replace(/\{(\w+)\}/g,(_,key)=>values[key]??'');
const hazardKeys={flood:'Flood',drought:'Drought',storm:'Storm',frost:'Frost'};
export const hazardPhrase=(state,L)=>L['hz'+hazardKeys[hazardOf(state.mapPoint)]]||'';
export const seasonText=(state,L)=>L['season'+hazardKeys[hazardOf(state.mapPoint)]]||'';
// English names sit mid-sentence, so they are lower-cased there; Japanese has no case.
const inline=(text,lang)=>lang==='en'?text.toLowerCase():text;
const terrainWord=(terrain,lang)=>inline(terrains[terrain][lang],lang);
const cardTitle=(id,lang)=>[...trees.tech,...trees.civic].find(item=>item.id===id)?.[lang]||id;
function placed(state,id,lang){
  const land=generateLand(state.mapPoint),tile=state.tiles?.[id];
  return land&&Number.isInteger(tile)?{building:inline(improvements[id].name[lang],lang),terrain:terrainWord(land.tiles[tile],lang)}:null;
}
function landWords(state,lang){
  const land=generateLand(state.mapPoint);
  if(!land)return null;
  const counts={};
  land.tiles.forEach((terrain,i)=>{if(i!==center)counts[terrain]=(counts[terrain]||0)+1});
  const [a,b]=Object.entries(counts).sort((x,y)=>y[1]-x[1]).map(([terrain])=>terrainWord(terrain,lang));
  return {a,b:b||a};
}
const belief=['mysticism','theology','poetry','history','games','tradition'];

// Returns the question and a sentence starter for one answer field.
export function councilPrompt(key,state,lang,L){
  const fallback={q:L[key],starter:L[key+'Ph']};
  const place=locations[state.mapPoint]?.region[lang],hazard=hazardPhrase(state,L);
  if(key==='placeAnswer'){
    const words=landWords(state,lang);
    if(!words)return fallback;
    return {q:fill(L.prPlace,{place,land:fill(L.prLandMostly,words),hazard}),starter:fill(L.stPlace,{a:words.a,hazard})};
  }
  if(key==='techAnswer'){
    const core=state.tech.filter(id=>!trees.tech.find(item=>item.id===id)?.gate);
    const id=[...core].reverse().find(card=>placed(state,card,lang))||core.at(-1);
    if(!id)return fallback;
    const where=placed(state,id,lang),card=cardTitle(id,lang);
    return where?{q:fill(L.prTech,{card,...where}),starter:fill(L.stTech,where)}:{q:fill(L.prTechPlain,{card}),starter:L.techAnswerPh};
  }
  if(key==='societyAnswer'){
    if(!state.civic.length)return fallback;
    const names=state.civic.slice(-3).map(id=>cardTitle(id,lang));
    return {q:fill(L.prSociety,{cards:names.join(lang==='ja'?'、':', ')}),starter:fill(L.stSociety,{card:names.at(-1)})};
  }
  if(key==='beliefAnswer'){
    const id=[...state.civic].reverse().find(card=>belief.includes(card)&&placed(state,card,lang));
    if(id){const where=placed(state,id,lang);return {q:fill(L.prBelief,where),starter:fill(L.stBelief,where)}}
    return hazard?{q:fill(L.prBeliefPlain,{hazard}),starter:fill(L.stBeliefPlain,{hazard})}:fallback;
  }
  if(key==='contactAnswer'){
    const choice=state.events?.encounter;
    if(!choice)return fallback;
    const name=L[choice+'Choice'];
    return {q:fill(L.prContact,{choice:name}),starter:fill(L.stContact,{choice:name})};
  }
  return fallback;
}
