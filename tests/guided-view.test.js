import test from 'node:test';
import assert from 'node:assert/strict';
import { renderGuidedView, placementPreview } from '../public/guided-view.js';
import { initialState } from '../shared/game.js';
import { nextTask, taskAvailable } from '../shared/flow.js';
import { dictionary } from '../shared/i18n.js';
import { flowCopy } from '../shared/flow-copy.js';
const state={...initialState(),mapPoint:'E',avatar:'E',placeAnswer:'A river plain.',events:{origin:'steward',encounter:'share'},tech:['pottery'],civic:['laws'],techAnswer:'Store supplies.'};
const team={name:'Team E',state,submittedAt:null};
const ui={task:'hub',seen:new Set()};
const html=(task,lang='en')=>renderGuidedView({team,roster:['One','Two'],lang,L:dictionary[lang],topbar:'',playing:false,ui:{...ui,task}});
test('the hub has one next task and no answer form or simultaneous development trees',()=>{
 const s=html('hub');assert.equal((s.match(/class="btn-primary"/g)||[]).length,1);assert(!s.includes('<textarea'));assert(!s.includes('tree-scroll'));assert(s.includes('data-guided'));
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
