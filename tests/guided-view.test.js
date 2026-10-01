import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGuidedView, placementPreview } from '../public/guided-view.js';
import { initialState, applyAction } from '../shared/game.js';
import { nextTask, taskAvailable } from '../shared/flow.js';
import { dictionary } from '../shared/i18n.js';
import { flowCopy } from '../shared/flow-copy.js';
const state={...initialState(),mapPoint:'E',avatar:'E',placeAnswer:'A river plain.',events:{origin:'steward',encounter:'share'},tech:['pottery'],civic:['laws'],techAnswer:'Store supplies.'};
const team={name:'Team E',state,submittedAt:null};
const ui={task:'hub',seen:new Set()};
const html=(task,lang='en')=>renderGuidedView({team,roster:['One','Two'],lang,L:dictionary[lang],topbar:'',playing:false,ui:{...ui,task}});

test('unbuildable plans explain terrain limits and permit keeping knowledge',()=>{
 for(const lang of ['en','ja']){
  const s={...initialState(),mapPoint:'F',avatar:'F',tech:['pottery'],tiles:{},plannedBuildings:['pottery']};
  const view=renderGuidedView({team:{...team,state:s},roster:[],lang,L:dictionary[lang],topbar:'',ui:{...ui,task:'placement',pick:{tree:'tech',id:'irrigation'},building:'irrigation',site:null}});
  assert(view.includes(flowCopy[lang].noTerrain));assert.match(view,/data-flow="keep-plan" >/);assert.match(view,/data-flow="confirm-placement" disabled/);
  const planned=applyAction(s,{type:'pick',tree:'tech',id:'irrigation',tile:null});assert(planned.tech.includes('irrigation'));assert.equal(planned.tiles.irrigation,undefined);
 }
});
test('the hub has one next task and no answer form or simultaneous development trees',()=>{
 const s=html('hub');assert.equal((s.match(/class="btn-primary"/g)||[]).length,1);assert(!s.includes('<textarea'));assert(!s.includes('tree-scroll'));assert(s.includes('data-guided'));
});

test('submission has one primary action with Back kept secondary',()=>{
 const s=html('submission');assert.equal((s.match(/class="btn-primary/g)||[]).length,1);assert(s.includes('data-action="submit"'));assert(!s.includes('data-flow="hub" >Continue'));
});
test('each writing task shows exactly one answer in both languages',()=>{
 for(const lang of ['en','ja'])for(const task of ['placeAnswer','techAnswer','societyAnswer','beliefAnswer','contactAnswer']){
  const s=html(task,lang);assert.equal((s.match(/<textarea /g)||[]).length,1);assert(s.includes(`data-field="${task}"`));assert(!s.includes('undefined'));
 }
});
test('screens are local and earlier tasks gate future navigation without modifying team progress',()=>{
 assert.equal(nextTask(team).id,'services');assert(taskAvailable('techAnswer',team));assert(!taskAvailable('route',team));
 const before=JSON.stringify(team);html('placeAnswer');html('tech');assert.equal(JSON.stringify(team),before);
});
test('placement previews are pure and do not build plans before confirmation',()=>{
 const before=JSON.stringify(team);const p=placementPreview(team,{pick:{tree:'tech',id:'writing'},building:'writing',site:null});
 assert(p.state.tech.includes('writing'));assert.equal(p.state.tiles.writing,undefined);assert.equal(JSON.stringify(team),before);
});
test('new user-facing copy is complete in English and Japanese',()=>{
 assert.deepEqual(Object.keys(flowCopy.en),Object.keys(flowCopy.ja));for(const lang of ['en','ja'])for(const value of Object.values(flowCopy[lang]))assert(value.trim());
});
test('the hub explains the goal and the four chapters without adding a second primary action',()=>{
 for(const lang of ['en','ja']){const s=html('hub',lang);assert(s.includes(flowCopy[lang].howGoal));assert.equal((s.match(/<li class="[^"]*"/g)||[]).filter(x=>x.includes('current')).length,1);assert.equal((s.match(/class="btn-primary"/g)||[]).length,1);assert(!s.includes('undefined'));}
});
test('every guided task has a purpose line in both languages',()=>{
 for(const lang of ['en','ja'])for(const t of ['place','arrival','placeAnswer','origin','tech','prep','techAnswer','encounter','civic','services','societyAnswer','beliefAnswer','route','routeCheck','contactAnswer','submission'])assert(flowCopy[lang][t+'Why'],t);
});
test('decisions name the card they unlock',()=>{
 const s=renderGuidedView({team:{...team,state:{...state,events:{origin:'',encounter:''}}},roster:[],lang:'en',L:dictionary.en,topbar:'',ui:{...ui,task:'origin'}});
 assert(s.includes('Preservation Methods'));assert(s.includes('Route Mapping'));assert(s.includes(flowCopy.en.unlocks));
});
test('staying local is never described as an operating connection',()=>{
 const local={...state,stage:4,route:'local',civic:['laws'],societyAnswer:'x',beliefAnswer:'x'};
 for(const task of ['route','routeCheck','contactAnswer','submission']){const s=renderGuidedView({team:{...team,state:local},roster:[],lang:'en',L:dictionary.en,topbar:'',ui:{...ui,task}});assert(!/operating connection|is working on your map/i.test(s),task);}
 const s=renderGuidedView({team:{...team,state:local},roster:[],lang:'en',L:dictionary.en,topbar:'',ui:{...ui,task:'routeCheck'}});assert(s.includes(flowCopy.en.localReady));
});
test('the three check screens each answer a different question',()=>{
 const views=['prep','services','routeCheck'].map(task=>html(task));
 for(const [i,key] of ['prepQuestion','servicesQuestion','routeQuestion'].entries()){assert(views[i].includes(flowCopy.en[key]));for(const [j,other] of views.entries())if(j!==i)assert(!other.includes(flowCopy.en[key]));}
});
test('a card placed from its tree leads back to the tree or to finishing',()=>{
 const s=renderGuidedView({team,roster:[],lang:'en',L:dictionary.en,topbar:'',ui:{...ui,task:'result',building:'pottery',returnTo:'tech'}});
 assert(s.includes('data-flow="task:tech"'));assert(s.includes(flowCopy.en.chooseAnother));assert(s.includes('data-flow="finish"'));
 const hub=renderGuidedView({team,roster:[],lang:'en',L:dictionary.en,topbar:'',ui:{...ui,task:'result',building:'pottery'}});assert(!hub.includes(flowCopy.en.chooseAnother));
});
