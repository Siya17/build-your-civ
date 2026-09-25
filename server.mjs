import { randomBytes } from 'node:crypto';
import { closeStreams, createAppServer } from './server/http.js';
import { closeStore } from './server/store.js';

const production = process.env.NODE_ENV === 'production';
let teacherPassword = process.env.TEACHER_PASSWORD;
let temporaryPassword = false;
if (production && (!teacherPassword || teacherPassword.length < 12)) {
  throw new Error('Production requires TEACHER_PASSWORD with at least 12 characters');
}
if (!teacherPassword) {
  teacherPassword = randomBytes(12).toString('base64url');
  temporaryPassword = true;
}
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT ?? 5173);
if (!Number.isInteger(port) || port < 0 || port > 65535) {
  throw new Error('PORT must be an integer between 0 and 65535');
}
const server = createAppServer({teacherPassword,secureCookie:production || process.env.COOKIE_SECURE==='1'});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? `Port ${port} is already in use at ${host}. Stop the older server before restarting this one.`
    : `Could not start the server: ${error.message}`);
  closeStore();
  process.exitCode = 1;
});
server.on('listening',()=>{
  console.log(`Build Your Civ: http://${host}:${server.address().port}`);
  if (temporaryPassword) console.log(`Development teacher password: ${teacherPassword}`);
});
server.listen(port,host);

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
