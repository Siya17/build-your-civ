import test from 'node:test';
import assert from 'node:assert/strict';
import { initialState, normalizeState, applyAction, submissionGaps } from '../shared/game.js';
import { lessonStarted, shortSchedule } from '../shared/lesson.js';
import { steps, stepApplies, stepDone, stepAvailable, nextStep, neighbourStep } from '../shared/flow.js';
import { dictionary } from '../shared/i18n.js';
import { studentPage } from '../public/screens.js';
import { teacherPage, teacherDetailView } from '../public/teacher.js';
import { printablePosters } from '../public/printing.js';

function completed() {
  let state=normalizeState({...initialState(),mapPoint:'G',fixedPoint:'G'});
  for(const action of [{type:'pick',tree:'tech',id:'pottery'},{type:'pick',tree:'civic',id:'laws'},
    {type:'eventRoll',confirm:{tech:['pottery'],civic:['laws']}},
    ...['civName','eventAnswer','geographyAnswer','governmentAnswer','economyAnswer'].map(key=>({type:'field',key,value:'Evidence and reasoning.'})),
    ...[['government','council'],['economy','farming'],['beliefs','river']].map(([key,value])=>({type:'chip',key,value,on:true}))])state=applyAction(state,action,{rollDie:()=>1});
  return {id:1,name:'Team G',lessonVersion:'short',state,version:1,submittedAt:null};
}
const seen=new Set(steps.filter(s=>s.kind==='seen').map(s=>s.id));
function page(team,step,lang='en',extras={}) {
  return studentPage({team,step,lang,L:dictionary[lang],ui:{sub:null},seen,reveal:true,sync:'saved',roster:[],compact:false,...extras});
}

test('short validation keeps game and selection gates but needs only four explanations',()=>{
  const t=completed();assert.deepEqual(submissionGaps(t.state,'short'),[]);
  assert.deepEqual(submissionGaps(t.state),['beliefAnswer','shapeAnswer','notChosenAnswer']);
  for(const key of ['eventAnswer','geographyAnswer','governmentAnswer','economyAnswer','civName'])assert(submissionGaps({...t.state,[key]:''},'short').includes(key));
  for(const [key,value] of [['government',''],['economy',[]],['beliefs','']])assert(submissionGaps({...t.state,[key]:value},'short').includes(key));
  assert(submissionGaps({...t.state,event:null},'short').includes('event'));
  assert(submissionGaps({...t.state,government:'ruler'},'short').includes('government'));
  assert(submissionGaps({...t.state,beliefs:'other'},'short').includes('beliefAnswer'));
  assert.deepEqual(submissionGaps({...t.state,beliefs:'other',beliefAnswer:'Sacred forest.'},'short'),[]);
});

test('short path ends at presentations and class discussion without historical reveal gates',()=>{
  const t=completed();
  for(const id of ['land','climate','resources','shapeAnswer','notChosenAnswer','revealPlace','revealCompare','historyDifferenceAnswer','historyWorkAnswer','historyOmissionAnswer','reflectionReview','reflectionSubmit','takeaway'])assert.equal(stepApplies(id,t),false,id);
  for(const id of ['where','developmentPreview','challenge','prices','techTree','civicTree','beliefs','shortComplete'])assert.equal(stepApplies(id,t),true,id);
  assert(stepDone('beliefs',t));assert(!stepDone('beliefs',{...t,state:{...t.state,beliefs:'other'}}));
  assert.equal(nextStep(t,seen,false).id,'submit');
  const done={...t,submittedAt:'2026-10-06'};
  assert(stepAvailable('shortComplete',done,seen,false));assert.equal(neighbourStep('wait',done,1),'shortComplete');assert.equal(neighbourStep('shortComplete',done,1),null);
  assert(!stepAvailable('revealPlace',done,seen,true));
  assert.equal(neighbourStep('where',t,1),'developmentPreview');assert.equal(neighbourStep('developmentPreview',t,1),'challenge');assert.equal(neighbourStep('challenge',t,1),'prices');assert.equal(shortSchedule.reduce((a,b)=>a+b),90);
});

test('both language short screens, teacher views, and printed posters omit excluded requirements',()=>{
  const t={...completed(),submittedAt:'2026-10-06'};
  for(const lang of ['en','ja']) {
    const L=dictionary[lang];
    for(const step of steps.filter(step=>stepApplies(step.id,t))) {
      const html=page(t,step.id,lang);
      assert.doesNotMatch(html,/undefined|NaN|\[\[/,`${lang} ${step.id}`);
      assert.equal((html.match(/class="btn primary/g)||[]).length,1,`${lang} ${step.id}`);
    }
    assert.match(page(t,'where',lang),/lesson-details/);
    assert.doesNotMatch(page(t,'beliefs',lang),/data-field="beliefAnswer"/);
    assert.match(page({...t,state:{...t.state,beliefs:'other'}},'beliefs',lang),/data-field="beliefAnswer"/);
    assert.doesNotMatch(page(t,'shortComplete',lang),/data-field=|data-act="submitReflection"/);
    assert.doesNotMatch(page(t,'check',lang),/step:shapeAnswer|step:notChosenAnswer/);
    const ctx={L,lang,teams:[t],detail:t,newCodes:new Map(),reveal:true,lessonVersion:'short'};
    assert.doesNotMatch(teacherPage(ctx,''),/reflection-status/);assert(!teacherPage(ctx,'').includes(L.revealPanel));
    assert(!page(t,'wait',lang).includes(L.waitNote));assert(!page(t,'wait',lang).includes(L.revealOpenNote));
    assert(!page(t,'shortComplete',lang).includes(L.ch_reveal));
    assert(!teacherDetailView(ctx).includes(L.reflectionReviewTitle));
    const print=printablePosters([t],lang,L);assert(print.includes(L.posterBeliefs));assert.doesNotMatch(print,/poster-reflection/);
    assert(!print.includes(L.posterShape));assert(!print.includes(L.posterTradeoff));
  }
});

test('version lock counts every shared student choice and ignores pristine fixed-region teams',()=>{
  const state=normalizeState({...initialState(),mapPoint:'G',fixedPoint:'G'}),t={state};
  assert(!lessonStarted(t));
  for(const change of [{beliefs:'river'},{government:'council'},{economy:['farming']},{predictions:{pottery:'easy'}},{civName:'River People'},{predictEasyNote:'Irrigation.'},{tech:['pottery']},{reflection:{historyDifferenceAnswer:'Saved.'}}])assert(lessonStarted({state:{...state,...change}}),JSON.stringify(change));
  assert(lessonStarted({state:{...state,fixedPoint:'',mapPoint:'G'}}));
  assert(!stepApplies('shortComplete',{...completed(),lessonVersion:'full'}));
});
