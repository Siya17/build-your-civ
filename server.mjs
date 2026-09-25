import { randomBytes } from 'node:crypto';
import { createAppServer } from './server/http.js';

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
