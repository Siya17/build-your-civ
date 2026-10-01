import { assessLayout } from './layout.js';
import { improvements } from './land.js';
import { routeById } from './routes.js';
import { f } from './flow-copy.js';
export function layoutReport(state,lang='en') {
 const a=assessLayout(state),route=state.route||'local',name=id=>improvements[id]?.name[lang]||id;
 return [`${f(lang,'food')}: ${f(lang,a.food.status)}`,`${f(lang,'season')}: ${f(lang,a.season.status)} (${f(lang,a.season.hazard||'noSource')})`,`${f(lang,'exposed')}: ${a.season.atRisk.map(name).join(', ')||'—'}`,`${f(lang,'working')}: ${Object.entries(a.buildings).filter(([,b])=>b.connected).map(([id])=>name(id)).join(', ')||'—'}`,`${f(lang,'isolated')}: ${Object.entries(a.buildings).filter(([,b])=>!b.connected).map(([id])=>name(id)).join(', ')||'—'}`,`${f(lang,'planned')}: ${(state.plannedBuildings||[]).map(name).join(', ')||'—'}`,`${f(lang,'service')}: ${a.services.venues.map(id=>`${name(id)} → ${Object.entries(a.buildings).filter(([,b])=>a.buildings[id].coverage.includes(b.tile)).map(([target])=>name(target)).join(', ')}`).join('; ')||'—'}`,`${routeById(route)?.[lang]||''}: ${f(lang,a.routes[route]?.operational?'operational':'routePlanned')}${a.routes[route]?.missing.length?' ('+a.routes[route].missing.map(key=>f(lang,key)).join(', ')+')':''}`].join(' · ');
}
