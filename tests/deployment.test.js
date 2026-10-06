import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import api from '../api/index.js';

const appSource = readFileSync(new URL('../public/app.js', import.meta.url), 'utf8');
const apiSource = appSource.slice(appSource.indexOf('async function api('), appSource.indexOf('// ---- Reading screens'));
const request = (body, status, lang='en') => {
  const context = vm.createContext({
    lang, L:()=>({error:'Request failed'}),
    fetch:async()=>new Response(body,{status})
  });
  vm.runInContext(`${apiSource}\nglobalThis.request=api`,context);
  return context.request('/api/me');
};

test('hosting text and HTML errors produce useful errors instead of JSON syntax errors', async()=>{
  for(const [body,status] of [['A server error has occurred',500],['<html>Unavailable</html>',502],['',503],['not-json',200],['null',200]]) {
    await assert.rejects(request(body,status),error=>{
      assert.equal(error.status,status);
      assert.equal(error.code,'SERVER_RESPONSE_INVALID');
      assert.match(error.message,/deployment settings and server logs/);
      assert.doesNotMatch(error.message,/Unexpected token|<html>/);
      return true;
    });
  }
  await assert.rejects(request('A server error',500,'ja'),/サーバー/);
});

test('valid API responses and structured validation errors retain their information',async()=>{
  assert.equal((await request('{"authenticated":false}',200)).authenticated,false);
  await assert.rejects(request('{"error":"Choose a card","code":"PICK_REQUIRED","gaps":["tree"]}',400),error=>{
    assert.equal(error.message,'Choose a card');
    assert.equal(error.code,'PICK_REQUIRED');
    assert.equal(error.gaps[0],'tree');
    return true;
  });
});

test('serverless startup without credentials returns a JSON 503',async()=>{
  const previous=process.env.TEACHER_PASSWORD;
  const originalLog=console.error;
  const logs=[];
  delete process.env.TEACHER_PASSWORD;
  console.error=(...args)=>logs.push(args.join(' '));
  try {
    let status,headers,body;
    await api({url:'/api/health'}, {
      headersSent:false,
      writeHead(code,values){status=code;headers=values;},
      end(value){body=value;}
    });
    assert.equal(status,503);
    assert.equal(headers['Content-Type'],'application/json');
    assert.match(JSON.parse(body).error,/setup is incomplete/);
    assert.match(logs.join(' '),/TEACHER_PASSWORD/);
    assert.doesNotMatch(body,/TEACHER_PASSWORD/);
  } finally {
    console.error=originalLog;
    if(previous===undefined)delete process.env.TEACHER_PASSWORD;
    else process.env.TEACHER_PASSWORD=previous;
  }
});
