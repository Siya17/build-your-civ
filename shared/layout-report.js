import { assessLayout } from './layout.js';
import { improvements } from './land.js';
import { routeById } from './routes.js';
import { f, ff } from './flow-copy.js';
// One plain-language paragraph about the homeland map, shared by the student review, the
// teacher's panel and the printout.
export function layoutReport(state,lang='en') {
 const a=assessLayout(state),route=routeById(state.route||'local'),name=id=>improvements[id]?.name[lang]||id,list=ids=>ids.map(name).join(', ')||f(lang,'none');
 const stop=lang==='ja'?'。':'. ',n=a.services.venues.length,c=a.services.covered.length;
 const reach=a.services.venues.map(id=>`${name(id)} → ${Object.entries(a.buildings).filter(([,b])=>a.buildings[id].coverage.includes(b.tile)).map(([target])=>name(target)).join(', ')}`).join('; ');
 const routeLine=route.id==='local'?route[lang]:`${route[lang]}: ${f(lang,a.routes[route.id]?.operational?'operational':'routePlanned')}${a.routes[route.id]?.missing.length?` (${f(lang,'needs')}: ${a.routes[route.id].missing.map(key=>f(lang,key)).join(', ')})`:''}`;
 return [
  `${f(lang,'food')}: ${f(lang,a.food.status)}`,
  `${f(lang,'season')}${a.season.hazard?` (${f(lang,a.season.hazard).split(/[:：]/)[0]})`:''}: ${f(lang,a.season.status)}`,
  `${f(lang,'exposed')}: ${list(a.season.atRisk)}`,
  `${f(lang,'working')}: ${list(Object.keys(a.buildings).filter(id=>a.buildings[id].connected))}`,
  `${f(lang,'isolated')}: ${list(Object.keys(a.buildings).filter(id=>!a.buildings[id].connected))}`,
  `${f(lang,'planned')}: ${list([...state.tech,...state.civic].filter(id=>!a.buildings[id]))}`,
  `${f(lang,'service')}: ${n?`${ff(lang,n===1?'communityOne':'communityCount',{n,c})} (${reach})`:f(lang,'communityNone')}`,
  `${f(lang,'futureRoute')}: ${routeLine}`
 ].join(stop).trim()+(lang==='ja'?'。':'.');
}
