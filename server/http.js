import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createTeam, createSession, deleteSession, findTeamByCode, getSession, getTeam, listTeams, regenerateCode, reopenTeam, sameHash, submitTeam, teamRoster, updateTeam } from './store.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const staticFiles = {
  '/':['public/index.html','text/html; charset=utf-8'],
  '/app.js':['public/app.js','text/javascript; charset=utf-8'],
  '/app.css':['public/app.css','text/css; charset=utf-8'],
  '/shared/game.js':['shared/game.js','text/javascript; charset=utf-8'],
  '/assets/slide8-map.png':['public/assets/slide8-map.png','image/png'],
  '/assets/world-hero.webp':['public/assets/world-hero.webp','image/webp'],
  '/assets/river-place.webp':['public/assets/river-place.webp','image/webp'],
  '/assets/meeting.webp':['public/assets/meeting.webp','image/webp']
};
const clients = new Set();
const attempts = new Map();
const send = (res,status,data,headers={}) => { res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',...headers}); res.end(JSON.stringify(data)); };
const cookie = req => (req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('civ_session='))?.slice(12);
const broadcast = teamId => {
  const team=getTeam(teamId);
  const payload=JSON.stringify({team,roster:teamRoster(teamId)});
  for (const client of clients) {
    if (client.role==='teacher') client.res.write(`event: teams\ndata: ${JSON.stringify({teams:listTeams()})}\n\n`);
    else if (client.teamId===teamId) client.res.write(`event: team\ndata: ${payload}\n\n`);
  }
};
const readJson = async req => {
  let body='';
  for await (const chunk of req) { body += chunk; if (body.length>12000) throw new Error('Request too large'); }
  try { return body ? JSON.parse(body) : {}; } catch { throw new Error('Invalid JSON'); }
};
function loginAllowed(req,kind) {
  const key=`${req.socket.remoteAddress||'unknown'}:${kind}`; const now=Date.now();
  const hits=(attempts.get(key)||[]).filter(time=>time>now-10*60_000);
  if (hits.length>=(kind==='teacher'?12:100)) return false;
  hits.push(now); attempts.set(key,hits); return true;
}
function auth(req,role) {
  const session=getSession(cookie(req));
  if (!session || (role && session.role!==role)) {const e=new Error('Sign in required');e.status=401;throw e;}
  return session;
}
function checkOrigin(req) {
  if (!['POST','PUT','PATCH','DELETE'].includes(req.method)) return;
  const origin=req.headers.origin;
  const host=req.headers.host;
  if (origin && new URL(origin).host!==host) {const e=new Error('Origin not allowed');e.status=403;throw e;}
  if (req.headers['content-type']?.split(';')[0]!=='application/json') {const e=new Error('JSON required');e.status=415;throw e;}
}
export function createAppServer({teacherPassword,secureCookie=false}) {
  const setCookie=token=>`civ_session=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=43200${secureCookie?'; Secure':''}`;
  return createServer(async (req,res)=>{
    res.setHeader('X-Content-Type-Options','nosniff');
    res.setHeader('Referrer-Policy','same-origin');
    res.setHeader('X-Frame-Options','DENY');
    res.setHeader('Content-Security-Policy',"default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
    try { const pathname=new URL(req.url,'http://localhost').pathname; checkOrigin(req);
      if (req.method==='GET' && staticFiles[pathname]) {
        const [path,type]=staticFiles[pathname];
        const data=await readFile(join(root,path));
        res.writeHead(200,{'Content-Type':type,'Cache-Control':path.endsWith('.webp')?'public,max-age=86400':'no-cache'});res.end(data);return;
      }
      if (pathname==='/api/health' && req.method==='GET') {send(res,200,{ok:true});return;}
      if (pathname==='/api/me' && req.method==='GET') {
        const session=getSession(cookie(req));
        if (!session) {send(res,200,{authenticated:false});return;}
        if (session.role==='teacher') send(res,200,{authenticated:true,role:'teacher',name:'Teacher',teams:listTeams()});
        else {const team=getTeam(session.teamId); if (!team) {send(res,200,{authenticated:false});return;} send(res,200,{authenticated:true,role:'student',name:session.name,team,roster:teamRoster(team.id)});}
        return;
      }
      if (pathname==='/api/auth/teacher' && req.method==='POST') {
        if (!loginAllowed(req,'teacher')) {send(res,429,{error:'Too many sign-in attempts. Try again later.'});return;}
        const body=await readJson(req);
        if (typeof body.password!=='string' || !sameHash(body.password,teacherPassword)) {send(res,401,{error:'Incorrect teacher password'});return;}
        const {token}=createSession('teacher',null,'Teacher');
        send(res,200,{authenticated:true,role:'teacher',teams:listTeams()},{'Set-Cookie':setCookie(token)});return;
      }
      if (pathname==='/api/auth/team' && req.method==='POST') {
        if (!loginAllowed(req,'student')) {send(res,429,{error:'Too many sign-in attempts. Try again later.'});return;}
        const body=await readJson(req);const name=String(body.name||'').trim();
        if (name.length<2 || name.length>60) {send(res,400,{error:'Enter your name (2–60 characters)'});return;}
        const team=findTeamByCode(body.code);
        if (!team) {send(res,401,{error:'Team code not found'});return;}
        const {token}=createSession('student',team.id,name);
        send(res,200,{authenticated:true,role:'student',name,team,roster:teamRoster(team.id)},{'Set-Cookie':setCookie(token)});
        broadcast(team.id);return;
      }
      if (pathname==='/api/logout' && req.method==='POST') {
        deleteSession(cookie(req));send(res,200,{ok:true},{'Set-Cookie':'civ_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0'});return;
      }
      if (pathname==='/api/events' && req.method==='GET') {
        const session=auth(req);
        res.writeHead(200,{'Content-Type':'text/event-stream','Cache-Control':'no-cache, no-transform','Connection':'keep-alive','X-Accel-Buffering':'no'});
        res.write(': connected\n\n');
        const client={res,role:session.role,teamId:session.teamId};clients.add(client);
        const keepalive=setInterval(()=>res.write(': ping\n\n'),20_000);
        req.on('close',()=>{clearInterval(keepalive);clients.delete(client)});return;
      }
      if (pathname==='/api/team/action' && req.method==='POST') {
        const session=auth(req,'student');const action=await readJson(req);
        const team=updateTeam(session.teamId,action,session.name);
        send(res,200,{team,roster:teamRoster(team.id)});broadcast(team.id);return;
      }
      if (pathname==='/api/team/submit' && req.method==='POST') {
        const session=auth(req,'student');await readJson(req);
        const team=submitTeam(session.teamId,session.name);
        send(res,200,{team,roster:teamRoster(team.id)});broadcast(team.id);return;
      }
      if (pathname==='/api/teacher/teams' && req.method==='POST') {
        auth(req,'teacher');const body=await readJson(req);
        const team=createTeam(body.name);send(res,201,{team});broadcast(team.id);return;
      }
      const detail=pathname.match(/^\/api\/teacher\/teams\/(\d+)$/);
      if (detail && req.method==='GET') {
        auth(req,'teacher');const team=getTeam(Number(detail[1]));
        if (!team) {send(res,404,{error:'Team not found'});return;}
        send(res,200,{team,roster:teamRoster(team.id)});return;
      }
      const codeRoute=pathname.match(/^\/api\/teacher\/teams\/(\d+)\/new-code$/);
      if (codeRoute && req.method==='POST') {auth(req,'teacher');await readJson(req);const code=regenerateCode(Number(codeRoute[1]));send(res,200,{code});return;}
      const reopenRoute=pathname.match(/^\/api\/teacher\/teams\/(\d+)\/reopen$/);
      if (reopenRoute && req.method==='POST') {auth(req,'teacher');await readJson(req);const team=reopenTeam(Number(reopenRoute[1]));send(res,200,{team});broadcast(team.id);return;}
      send(res,404,{error:'Not found'});
    } catch(error) {
      if (res.headersSent) {res.end();return;}
      const status=error.status || (error.code==='ENOENT'?404:400);
      send(res,status,{error:status>=500?'Server error':error.message,gaps:error.gaps});
    }
  });
}
