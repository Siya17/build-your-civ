import { randomBytes } from 'node:crypto';
import { closeStreams, createAppServer } from './server/http.js';
import { closeStore } from './server/store.js';

const production = process.env.NODE_ENV === 'production';
let teacherPassword = process.env.TEACHER_PASSWORD;
if (production && (!teacherPassword || teacherPassword.length < 12)) {
  throw new Error('Production requires TEACHER_PASSWORD with at least 12 characters');
}
if (!teacherPassword) {
  teacherPassword = randomBytes(12).toString('base64url');
  console.log(`Development teacher password: ${teacherPassword}`);
}
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || 5173);
const server = createAppServer({teacherPassword,secureCookie:production || process.env.COOKIE_SECURE==='1'});
server.listen(port,host,()=>console.log(`Build Your Civ: http://${host}:${port}`));

// A host redeploy arrives as SIGTERM. Without this the process dies holding open event
// streams and an open database, leaving an unmerged WAL: a backup that copies only
// classroom.sqlite would then be missing the most recent classroom work.
let closed = false;
const finish = code => { if (!closed) { closed = true; closeStore(); } process.exit(code); };
let shuttingDown = false;
function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`${signal} received: closing event streams and database`);
  closeStreams();
  server.close(()=>finish(0));
  // Keep-alive sockets can outlive server.close(); do not wait for them indefinitely.
  setTimeout(()=>finish(0),5000).unref();
}
for (const signal of ['SIGTERM','SIGINT']) process.on(signal,()=>shutdown(signal));
