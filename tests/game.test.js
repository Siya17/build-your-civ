import test from 'node:test';
import assert from 'node:assert/strict';
import { applyAction, initialState, submissionGaps } from '../shared/game.js';

test('prerequisites, seven-choice limit, and dependent removal', () => {
  let state=initialState();
  assert.throws(()=>applyAction(state,{type:'pick',tree:'tech',id:'irrigation'}),/earlier/);
  for(const id of ['pottery','sailing','shipbuilding','astrology','navigation','irrigation','writing']) state=applyAction(state,{type:'pick',tree:'tech',id});
  assert.equal(state.tech.length,7);
  assert.throws(()=>applyAction(state,{type:'pick',tree:'tech',id:'currency'}),/seven/);
  state=applyAction(state,{type:'pick',tree:'tech',id:'sailing'});
  assert(!state.tech.includes('shipbuilding'));
  assert(state.tech.includes('navigation'),'alternative prerequisite keeps navigation available');
});

test('submission checks the explanation, not only card selection', () => {
  let state=initialState();
  state={...state,mapPoint:'A',location:'River valley',terrain:'Warm',resources:'Clay',tech:['pottery'],civic:['laws']};
  assert(submissionGaps(state).includes('impact'));
  for(const key of ['govt','economy','belief','geographyUse','impact','connection']) state[key]='Team explanation';
  assert.deepEqual(submissionGaps(state),[]);
});
