import { createServer } from 'node:http';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { createHash, randomInt } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join, sep } from 'node:path';
import { normalizeCode, isCodeShape, writableFields, reflectionFields } from '../shared/game.js';
import { regions, worldMap } from '../shared/regions.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const js = 'text/javascript; charset=utf-8', css = 'text/css; charset=utf-8';
const sourceFiles = {
  '/':['public/index.html','text/html; charset=utf-8'],
  '/classroom':['public/index.html','text/html; charset=utf-8'],
  '/app.css':['public/app.css',css],
  '/game.css':['public/game.css',css]
};
for (const module of ['bootstrap','app','screens','ui','tree','poster','printing','prompts','teacher','regional-map','regional-geography','realtime']) sourceFiles[`/${module}.js`]=[`public/${module}.js`,js];
for (const module of ['lesson','game','cards','regions','glossary','flow','i18n','credits']) sourceFiles[`/shared/${module}.js`]=[`shared/${module}.js`,js];
// Every image under public/assets is served at its own path.
const imageTypes = {'.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml'};
function addAssets(folder) {
  for (const name of readdirSync(join(root,folder))) {
    const path = join(folder,name);
    if (statSync(join(root,path)).isDirectory()) { addAssets(path); continue; }
    const type = imageTypes[name.slice(name.lastIndexOf('.')).toLowerCase()];
    if (type) sourceFiles['/'+path.split(sep).join('/').replace(/^public\//,'')] = [path,type];
  }
}
// The strict CSP forbids inline styles, so the map pins are CSS generated from each
// region's real latitude and longitude on the Pacific-centred world map.
const pinX = lon => ((((lon - worldMap.left) % 360) + 360) % 360) / 360 * 100;
const pinY = lat => (worldMap.top - lat) / (worldMap.top - worldMap.bottom) * 100;
const mapPointCss = Object.entries(regions).map(([letter,{site:[lat,lon]}])=>{
  const x=pinX(lon).toFixed(2), y=pinY(lat).toFixed(2);
  return `.map-dot[data-map="${letter}"]{left:${x}%;top:${y}%}.zoom-${letter}{transform-origin:${x}% ${y}%}`;
}).join('');

function buildStatic() {
  addAssets('public/assets');
  const table = new Map();
  const put = (route,body,type,immutable) => {
    const compressible = /^(text\/|application\/json|image\/svg)/.test(type);
    table.set(route,{
      body,type,
      etag:`"${createHash('sha1').update(body).digest('base64url')}"`,
      cacheControl: immutable ? 'public,max-age=86400' : 'no-cache',
      gzip: compressible && body.length > 1024 ? gzipSync(body) : null
    });
  };
  for (const [route,[path,type]] of Object.entries(sourceFiles)) {
    put(route,readFileSync(join(root,path)),type,/^image\//.test(type));
  }
  put('/map-points.css',Buffer.from(mapPointCss),css,false);
  return table;
}
let staticFiles;

let localStore;
const clients = new Set();
const attempts = new Map();
const teacherAttempts = [];
// Which text field each connected student is focused on. In memory only: presence is
// ephemeral, and the SSE close handler is what clears it. Keyed by session token.
const presence = new Map();

const send = (res,status,data,headers={}) => { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}); res.end(JSON.stringify(data)); };
const cookie = req => (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('civ_session='))?.slice(12);

// Every write to a stream goes through here. An unguarded write to a socket the browser
// has already dropped throws, and because the acting student's response has been sent
// the error is swallowed by the route's catch, leaving the rest of the team unupdated.
function writeChunk(client,chunk) {
  if (client.res.writableEnded || client.res.destroyed) { dropClient(client); return false; }
  try { client.res.write(chunk); return true; }
  catch { dropClient(client); return false; }
}
const writeEvent = (client,event,payload) => writeChunk(client,`event: ${event}\ndata: ${payload}\n\n`);
function dropClient(client) {
  clients.delete(client);
  if (client.token && ![...clients].some(other => other.token===client.token)) presence.delete(client.token);
  clearInterval(client.keepalive);
}
// Names of students currently holding an open event stream for this team. Unlike the
// session list in the store, this empties when a student closes their tab.
function localLiveNames(teamId,alsoInclude) {
  const names = new Set();
  for (const client of clients) if (client.role==='student' && client.teamId===teamId && client.name) names.add(client.name);
  if (alsoInclude) names.add(alsoInclude);
  return [...names].sort();
}
function localPresenceFields(teamId) {
  const fields = {};
  for (const entry of presence.values()) {
    if (entry.teamId!==teamId || !entry.field) continue;
    const names = fields[entry.field] ||= [];
    if (!names.includes(entry.name)) names.push(entry.name);
  }
  return fields;
}
async function broadcastStore(store,teamId,actor) {
  const team = await store.getTeam(teamId);
  const teamPayload = JSON.stringify({team,roster:localLiveNames(teamId),by:actor});
  let teamsPayload = null;
  for (const client of [...clients]) {
    if (client.role==='teacher') writeEvent(client,'teams',teamsPayload ??= JSON.stringify({teams:await store.listTeams()}));
    else if (client.teamId===teamId) writeEvent(client,'team',teamPayload);
  }
  await broadcastRevealStore(store);
}
function broadcastPresence(teamId) {
  const payload = JSON.stringify({roster:localLiveNames(teamId),fields:localPresenceFields(teamId)});
  for (const client of [...clients]) if (client.role==='student' && client.teamId===teamId) writeEvent(client,'presence',payload);
}
async function broadcastRevealStore(store) {
  const payload = JSON.stringify({reveal:await store.revealOpen(),...await store.lessonSettings()});
  for (const client of [...clients]) writeEvent(client,'reveal',payload);
}
function revokeTeam(teamId) {
  for (const client of [...clients]) {
    if (client.role!=='student' || client.teamId!==teamId) continue;
    writeEvent(client,'revoked','{}');
    dropClient(client);
    try { client.res.end(); } catch {}
  }
}
export function closeStreams() {
  for (const client of [...clients]) { dropClient(client); try { client.res.end(); } catch {} }
}

const readJson = async req => {
  // Vercel parses the request body before calling a Node function.
  if (req.body !== undefined) {
    let value=req.body;
    if (Buffer.byteLength(typeof value==='string'?value:JSON.stringify(value),'utf8')>12000) throw Object.assign(new Error('Request too large'),{status:413});
    if (typeof value==='string') {try {value=JSON.parse(value);}catch {throw new Error('Invalid JSON');}}
    if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Send a JSON object');
    return value;
  }
  const chunks=[];
  let length=0;
  for await (const chunk of req.iterator({destroyOnReturn:false})) {
    length+=chunk.length;
    if (length>12000) {req.resume();throw Object.assign(new Error('Request too large'), {status:413});}
    chunks.push(chunk);
  }
  let value;
  try { value=length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {}; }
  catch { throw new Error('Invalid JSON'); }
  if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Send a JSON object');
  return value;
};
// With trustProxy a single reverse proxy sits in front, and the last X-Forwarded-For entry
// is the address that proxy actually saw. A client-supplied header lands earlier in the
// list, so it cannot be used to pick a different bucket.
function clientAddress(req,trustProxy) {
  if (trustProxy) {
    const forwarded = (req.headers['x-forwarded-for']||'').split(',').map(s=>s.trim()).filter(Boolean);
    if (forwarded.length) return forwarded[forwarded.length-1];
  }
  return req.socket.remoteAddress || 'unknown';
}
const attemptWindow = 10*60_000;
// A whole class often shares one NAT address, so the student allowance is generous;
// a wrong code typed by 30 students must not lock the room out. Teacher sign-in stays
// tight, with a global backstop in case the per-address key is being varied.
const ceilings = {teacher:12,student:300};
function loginAllowed(req,kind,trustProxy) {
  const now=Date.now();
  if (kind==='teacher') {
    while (teacherAttempts.length && teacherAttempts[0]<=now-attemptWindow) teacherAttempts.shift();
    if (teacherAttempts.length>=60) return false;
    teacherAttempts.push(now);
  }
  const key=`${clientAddress(req,trustProxy)}:${kind}`;
  const hits=(attempts.get(key)||[]).filter(time=>time>now-attemptWindow);
  if (hits.length>=ceilings[kind]) { attempts.set(key,hits); return false; }
  hits.push(now); attempts.set(key,hits); return true;
}
// Without this the attempts map only ever sheds entries for addresses that come back.
const sweep = setInterval(()=>{
  const cutoff=Date.now()-attemptWindow;
  for (const [key,hits] of attempts) {
    const live=hits.filter(time=>time>cutoff);
    if (live.length) attempts.set(key,live); else attempts.delete(key);
  }
  localStore?.pruneSessions();
},5*60_000);
sweep.unref();

function checkOrigin(req) {
  if (!['POST','PUT','PATCH','DELETE'].includes(req.method)) return;
  const origin=req.headers.origin;
  const host=req.headers.host;
  if (origin) {
    let allowed=false;
    try { const parsed=new URL(origin);allowed=['http:','https:'].includes(parsed.protocol)&&parsed.host===host; } catch {}
    if (!allowed) {const e=new Error('Origin not allowed');e.status=403;throw e;}
  }
  if (req.headers['content-type']?.split(';')[0]!=='application/json') {const e=new Error('JSON required');e.status=415;throw e;}
}
function serveStatic(req,res,entry) {
  if (req.headers['if-none-match']===entry.etag) { res.writeHead(304,{'ETag':entry.etag,'Cache-Control':entry.cacheControl,'Vary':'Accept-Encoding'}); res.end(); return; }
  const useGzip = entry.gzip && (req.headers['accept-encoding']||'').includes('gzip');
  const body = useGzip ? entry.gzip : entry.body;
  res.writeHead(200,{'Content-Type':entry.type,'Cache-Control':entry.cacheControl,'ETag':entry.etag,'Content-Length':body.length,'Vary':'Accept-Encoding',...(useGzip?{'Content-Encoding':'gzip'}:{})});
  res.end(body);
}
// rollDie can be replaced in tests; in class every die is rolled here, never in the browser.
export function createAppHandler({teacherPassword,secureCookie=false,trustProxy=process.env.TRUST_PROXY==='1',rollDie=()=>randomInt(1,7),store:providedStore,staticAssets=true}) {
  const ready=providedStore?Promise.resolve(providedStore):import('./store.js').then(store=>localStore=store);
  const files=staticAssets?(staticFiles ||= buildStatic()):new Map();
  return async (req,res)=>{
    let store;
    try { store=await ready; } catch { send(res,503,{error:'Classroom storage is unavailable'});return; }
    const {getSession,createSession,deleteSession,getTeam,listTeams,findTeamByCode,sameHash,updateTeam,submitTeam,submitReflection,setReveal,revealOpen,createTeam,addLetterTeams,deleteTeam,renameTeam,joinedNames,teamActivity,regenerateCode,reopenTeam,reopenReflection}=store;
    const liveNames=store.liveNames || localLiveNames;
    const presenceFields=store.presenceFields || localPresenceFields;
    const broadcast=(id,actor)=>store.realtimeToken?Promise.resolve():broadcastStore(store,id,actor);
    const broadcastReveal=()=>store.realtimeToken?Promise.resolve():broadcastRevealStore(store);
    const auth=async(req,role)=>{const session=await getSession(cookie(req));if(!session || (role&&session.role!==role))throw Object.assign(new Error('Sign in required'),{status:401});return session;};
    const allowLogin=(kind)=>store.loginAllowed?store.loginAllowed(clientAddress(req,trustProxy),kind):loginAllowed(req,kind,trustProxy);
    const setCookie=token=>`civ_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=43200${secureCookie?'; Secure':''}`;

    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','same-origin');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    if (secureCookie) res.setHeader('Strict-Transport-Security','max-age=15552000');
    try { const url=new URL(req.url,'http://localhost'), pathname=url.pathname; checkOrigin(req);
      if (req.method==='GET' && files.has(pathname)) { serveStatic(req,res,files.get(pathname)); return; }
      if (pathname==='/api/realtime' && req.method==='GET') {
        const session=await auth(req);send(res,200,store.realtimeToken?await store.realtimeToken(session,cookie(req)):{mode:'sse'});return;
      }
      if (pathname==='/api/health' && req.method==='GET') {send(res,200,{ok:true});return;}
      if (pathname==='/api/me' && req.method==='GET') {
        const session=await getSession(cookie(req));
        if (!session) {send(res,200,{authenticated:false});return;}
        if (session.role==='teacher') send(res,200,{authenticated:true,role:'teacher',name:'Teacher',teams:await listTeams(),reveal:await revealOpen(),...await store.lessonSettings()});
        else {const team=await getTeam(session.teamId); if (!team) {send(res,200,{authenticated:false});return;} send(res,200,{authenticated:true,role:'student',name:session.name,team,roster:await liveNames(team.id,session.name),presence:await presenceFields(team.id),reveal:await revealOpen(),...await store.lessonSettings()});}
        return;
      }
      if (pathname==='/api/auth/teacher' && req.method==='POST') {
        if (!await allowLogin('teacher')) {send(res,429,{error:'Too many sign-in attempts. Try again in a few minutes.'});return;}
        const body=await readJson(req);
        if (typeof body.password!=='string' || !sameHash(body.password,teacherPassword)) {send(res,401,{error:'Incorrect teacher password'});return;}
        const {token}=await createSession('teacher',null,'Teacher');
        send(res,200,{authenticated:true,role:'teacher',teams:await listTeams(),reveal:await revealOpen(),...await store.lessonSettings()},{'Set-Cookie':setCookie(token)});return;
      }
      if (pathname==='/api/auth/team' && req.method==='POST') {
        if (!await allowLogin('student')) {send(res,429,{error:'Too many sign-in attempts from this network. Ask your teacher for help.'});return;}
        const body=await readJson(req);const name=String(body.name||'').trim();
        if (name.length<2 || name.length>60) {send(res,400,{error:'Enter your name (2–60 characters)'});return;}
        const normalized=normalizeCode(body.code);
        if (!isCodeShape(normalized)) {send(res,400,{error:'Enter your team code, like A-427.'});return;}
        const team=await findTeamByCode(normalized);
        if (!team) {send(res,401,{error:'Team code not found'});return;}
        const {token}=await createSession('student',team.id,name);
        send(res,200,{authenticated:true,role:'student',name,team,roster:await liveNames(team.id,name),presence:await presenceFields(team.id),reveal:await revealOpen(),...await store.lessonSettings()},{'Set-Cookie':setCookie(token)});
        broadcastPresence(team.id);return;
      }
      if (pathname==='/api/logout' && req.method==='POST') {
        const token=cookie(req);const session=await getSession(token);
        await deleteSession(token);presence.delete(token);
        send(res,200,{ok:true},{'Set-Cookie':'civ_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0'});
        for (const client of [...clients]) if (client.token===token) {
          writeEvent(client,'revoked',JSON.stringify({reason:'logout'}));dropClient(client);try {client.res.end();}catch {}
        }
        if (session?.teamId) broadcastPresence(session.teamId);return;
      }
      if (pathname==='/api/events' && req.method==='GET') {
        if(store.realtimeToken){send(res,404,{error:'Use Firebase realtime updates'});return;}
        const session=await auth(req);
        res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
        res.write(': connected\n\n');
        const client={res,role:session.role,teamId:session.teamId,name:session.name,token:cookie(req)};
        client.keepalive=setInterval(()=>writeEvent(client,'ping','{}'),20_000);
        clients.add(client);
        // Reconnecting browsers may have missed both a teammate's action and a reveal.
        writeEvent(client,'reveal',JSON.stringify({reveal:await revealOpen(),...await store.lessonSettings()}));
        if (session.role==='student') writeEvent(client,'team',JSON.stringify({team:await getTeam(session.teamId),roster:await liveNames(session.teamId)}));
        else writeEvent(client,'teams',JSON.stringify({teams:await listTeams()}));
        req.on('close',()=>{const teamId=client.teamId;dropClient(client);if (client.role==='student') broadcastPresence(teamId)});
        if (session.role==='student') broadcastPresence(session.teamId);
        return;
      }
      if (pathname==='/api/team/presence' && req.method==='POST') {
        const session=await auth(req,'student');const body=await readJson(req);
        const field=body.field==null?null:String(body.field);
        if (field!==null && ![...writableFields,...reflectionFields].includes(field)) {send(res,400,{error:'Unknown field'});return;}
        const token=cookie(req);
        if (store.setPresence) await store.setPresence(token,session,field);
        else if (field) presence.set(token,{teamId:session.teamId,name:session.name,field});
        else presence.delete(token);
        send(res,200,{ok:true});broadcastPresence(session.teamId);return;
      }
      if (pathname==='/api/team/action' && req.method==='POST') {
        const session=await auth(req,'student');const action=await readJson(req);
        let team;
        try{team=await updateTeam(session.teamId,action,session.name,rollDie);}
        catch(error){if(error.status===409){send(res,409,{error:error.message,code:error.code,team:await getTeam(session.teamId),roster:await liveNames(session.teamId,session.name)});return;}throw error;}
        send(res,200,{team,roster:await liveNames(team.id,session.name),by:session.name});await broadcast(team.id,session.name);return;
      }
      if (pathname==='/api/team/submit' && req.method==='POST') {
        const session=await auth(req,'student');await readJson(req);
        const team=await submitTeam(session.teamId,session.name);
        send(res,200,{team,roster:await liveNames(team.id,session.name)});await broadcast(team.id,session.name);return;
      }
      if (pathname==='/api/team/reflection/submit' && req.method==='POST') {
        const session=await auth(req,'student');const body=await readJson(req);
        let team;
        try {team=await submitReflection(session.teamId,session.name,body.expectedVersion);}
        catch(error){if(error.status===409){send(res,409,{error:error.message,code:error.code,team:await getTeam(session.teamId)});return;}throw error;}
        send(res,200,{team,roster:await liveNames(team.id,session.name)});await broadcast(team.id,session.name);return;
      }
      if (pathname==='/api/teacher/lesson' && req.method==='POST') {
        await auth(req,'teacher'); const body=await readJson(req);
        const settings=await store.setLessonVersion(body.lessonVersion);
        send(res,200,settings); await broadcastReveal(); return;
      }
      if (pathname==='/api/teacher/reveal' && req.method==='POST') {
        await auth(req,'teacher');const body=await readJson(req);
        if (typeof body.reveal!=='boolean') {send(res,400,{error:'Send reveal: true or false'});return;}
        send(res,200,{reveal:await setReveal(body.reveal)});await broadcastReveal();return;
      }
      if (pathname==='/api/teacher/teams' && req.method==='POST') {
        await auth(req,'teacher');const body=await readJson(req);
        const team=await createTeam(body.name,body.point);send(res,201,{team});await broadcast(team.id);return;
      }
      if (pathname==='/api/teacher/letter-teams' && req.method==='POST') {
        await auth(req,'teacher');await readJson(req);
        const made=await addLetterTeams();const teams=await listTeams();
        send(res,200,{made:made.length,teams});
        const payload=JSON.stringify({teams});
        for (const client of [...clients]) if (client.role==='teacher') writeEvent(client,'teams',payload);
        await broadcastReveal();
        return;
      }
      if (pathname==='/api/teacher/teams/delete' && req.method==='POST') {
        await auth(req,'teacher');const body=await readJson(req);
        const ids=Array.isArray(body.ids)?[...new Set(body.ids)]:[];
        if (!ids.length || ids.length>500 || !ids.every(id=>Number.isSafeInteger(id)&&id>0)) {send(res,400,{error:'Send ids: a list of team numbers'});return;}
        let deleted=0;
        // Teams already gone (another tab, a second click) are skipped rather than failing the rest.
        for (const id of ids) {
          if (!await getTeam(id)) continue;
          await deleteTeam(id);revokeTeam(id);deleted++;
        }
        const remaining=await listTeams();
        send(res,200,{ok:true,deleted,teams:remaining});
        const payload=JSON.stringify({teams:remaining});
        for (const client of [...clients]) if (client.role==='teacher') writeEvent(client,'teams',payload);
        await broadcastReveal();
        return;
      }
      const detail=pathname.match(/^\/api\/teacher\/teams\/(\d+)$/);
      if (detail && req.method==='GET') {
        await auth(req,'teacher');const id=Number(detail[1]);const team=await getTeam(id);
        if (!team) {send(res,404,{error:'Team not found'});return;}
        send(res,200,{team,roster:await liveNames(id),joined:await joinedNames(id)});return;
      }
      if (detail && req.method==='PATCH') {
        await auth(req,'teacher');const body=await readJson(req);
        const team=await renameTeam(Number(detail[1]),body.name);
        send(res,200,{team});await broadcast(team.id);return;
      }
      if (detail && req.method==='DELETE') {
        await auth(req,'teacher');await readJson(req);const id=Number(detail[1]);
        if (!await getTeam(id)) {send(res,404,{error:'Team not found'});return;}
        await deleteTeam(id);revokeTeam(id);
        const remaining=await listTeams();
        send(res,200,{ok:true,teams:remaining});
        const payload=JSON.stringify({teams:remaining});
        for (const client of [...clients]) if (client.role==='teacher') writeEvent(client,'teams',payload);
        await broadcastReveal();
        return;
      }
      const activityRoute=pathname.match(/^\/api\/teacher\/teams\/(\d+)\/activity$/);
      if (activityRoute && req.method==='GET') {
        await auth(req,'teacher');const id=Number(activityRoute[1]);
        if (!await getTeam(id)) {send(res,404,{error:'Team not found'});return;}
        send(res,200,await teamActivity(id));return;
      }
      const codeRoute=pathname.match(/^\/api\/teacher\/teams\/(\d+)\/new-code$/);
      if (codeRoute && req.method==='POST') {await auth(req,'teacher');await readJson(req);const code=await regenerateCode(Number(codeRoute[1]));send(res,200,{code});return;}
      const reopenRoute=pathname.match(/^\/api\/teacher\/teams\/(\d+)\/reopen$/);
      if (reopenRoute && req.method==='POST') {await auth(req,'teacher');await readJson(req);const team=await reopenTeam(Number(reopenRoute[1]));send(res,200,{team});await broadcast(team.id);return;}
      const reflectionReopen=pathname.match(/^\/api\/teacher\/teams\/(\d+)\/reopen-reflection$/);
      if (reflectionReopen && req.method==='POST') {await auth(req,'teacher');await readJson(req);const team=await reopenReflection(Number(reflectionReopen[1]));send(res,200,{team});await broadcast(team.id);return;}
      send(res,404,{error:'Not found'});
    } catch(error) {
      if (res.headersSent) {res.end();return;}
      const status=error.status || (error.code==='ENOENT'?404:400);
      send(res,status,{error:status>=500?'Server error':error.message,code:status>=500?undefined:error.code,gaps:error.gaps});
    }
  };
}

export function createAppServer(options) { return createServer(createAppHandler(options)); }
