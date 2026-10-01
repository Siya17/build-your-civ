import { hasCoreChoice, questStatus } from './game.js';
export const taskDefinitions=[['place',1],['arrival',1],['placeAnswer',1],['origin',1],['tech',2],['prep',2],['techAnswer',2],['encounter',3],['civic',3],['services',3],['societyAnswer',3],['beliefAnswer',3],['route',4],['routeCheck',4],['contactAnswer',4],['submission',4]].map(([id,stage])=>({id,stage}));
export function taskDone(id,team,seen=new Set()) {
 const s=team.state,filled=key=>!!s[key]?.trim();
 if(id==='place')return !!s.mapPoint;
 if(id==='arrival')return seen.has('arrival:'+s.mapPoint)||filled('placeAnswer');
 if(id==='origin'||id==='encounter')return !!s.events?.[id];
 if(id==='tech'||id==='civic')return hasCoreChoice(s,id);
 if(id==='prep')return seen.has('prep')||filled('techAnswer');
 if(id==='services')return seen.has('services')||filled('societyAnswer');
 if(id==='route')return !!s.route||filled('contactAnswer');
 if(id==='routeCheck')return seen.has('routeCheck')||filled('contactAnswer');
 if(id==='submission')return !!team.submittedAt;
 return filled(id);
}
export function nextTask(team,seen=new Set()) { return taskDefinitions.find(task=>!taskDone(task.id,team,seen))??taskDefinitions.at(-1); }
export function taskAvailable(id,team,seen=new Set()) {const index=taskDefinitions.findIndex(t=>t.id===id);return index>=0&&taskDefinitions.slice(0,index).every(t=>taskDone(t.id,team,seen));}
export function progressStage(state) {const q=questStatus(state);return q[0]?q[1]?q[2]?4:3:2:1;}
