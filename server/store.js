import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { applyAction, initialState, submissionGaps } from '../shared/game.js';

const dataDir = resolve(process.env.DATA_DIR || join(process.cwd(), 'data'));
mkdirSync(dataDir, { recursive: true });
const secretPath = join(dataDir, 'secret.key');
if (!existsSync(secretPath)) writeFileSync(secretPath, randomBytes(32), { flag: 'wx', mode: 0o600 });
const secret = readFileSync(secretPath);
const db = new DatabaseSync(join(dataDir, 'classroom.sqlite'));
db.exec(`PRAGMA journal_mode=WAL;
PRAGMA busy_timeout=5000;
PRAGMA foreign_keys=ON;
CREATE TABLE IF NOT EXISTS teams (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code_hash TEXT NOT NULL UNIQUE,
  state_json TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 0,
  submitted_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK(role IN ('teacher','student')),
  team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id INTEGER NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  action_type TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS log_team ON activity_log(team_id,id);`);
db.prepare('DELETE FROM sessions WHERE expires_at < ?').run(Date.now());

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const hash = value => createHmac('sha256', secret).update(value).digest('hex');
const rowTeam = row => row && ({id:row.id,name:row.name,state:JSON.parse(row.state_json),version:row.version,submittedAt:row.submitted_at,createdAt:row.created_at,updatedAt:row.updated_at});
const randomCode = () => Array.from(randomBytes(9), n => alphabet[n % alphabet.length]).join('');

export function createTeam(name) {
  const clean = String(name ?? '').trim().slice(0, 80);
  if (!clean) throw new Error('Enter a team name');
  let code, codeHash;
  do { code = randomCode(); codeHash = hash(code); } while (db.prepare('SELECT 1 FROM teams WHERE code_hash=?').get(codeHash));
  const result = db.prepare('INSERT INTO teams (name,code_hash,state_json) VALUES (?,?,?)').run(clean,codeHash,JSON.stringify(initialState()));
  return {...getTeam(Number(result.lastInsertRowid)),code};
}

export function regenerateCode(id) {
  const team = getTeam(id);
  if (!team) throw new Error('Team not found');
  let code, codeHash;
  do { code = randomCode(); codeHash = hash(code); } while (db.prepare('SELECT 1 FROM teams WHERE code_hash=?').get(codeHash));
  db.prepare('UPDATE teams SET code_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(codeHash,id);
  return code;
}

export function getTeam(id) { return rowTeam(db.prepare('SELECT * FROM teams WHERE id=?').get(id)); }
export function listTeams() { return db.prepare('SELECT * FROM teams ORDER BY id').all().map(rowTeam); }
export function findTeamByCode(code) {
  const normalized = String(code ?? '').trim().toUpperCase();
  if (!/^[A-HJ-NP-Z2-9]{9}$/.test(normalized)) return null;
  return rowTeam(db.prepare('SELECT * FROM teams WHERE code_hash=?').get(hash(normalized)));
}
export function createSession(role, teamId, name) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  db.prepare('INSERT INTO sessions (token_hash,role,team_id,name,expires_at) VALUES (?,?,?,?,?)').run(hash(token),role,teamId,name,expiresAt);
  return {token,expiresAt};
}
export function getSession(token) {
  if (!token) return null;
  const row = db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?').get(hash(token),Date.now());
  return row && {role:row.role,teamId:row.team_id,name:row.name,expiresAt:row.expires_at};
}
export function deleteSession(token) { if (token) db.prepare('DELETE FROM sessions WHERE token_hash=?').run(hash(token)); }
export function updateTeam(id, action, actor) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const row = db.prepare('SELECT * FROM teams WHERE id=?').get(id);
    if (!row) throw new Error('Team not found');
    if (row.submitted_at) throw new Error('This team has already submitted. Ask the teacher to reopen it.');
    const next = applyAction(JSON.parse(row.state_json), action);
    db.prepare('UPDATE teams SET state_json=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(JSON.stringify(next),id);
    db.prepare('INSERT INTO activity_log (team_id,actor,action_type) VALUES (?,?,?)').run(id,actor,action.type);
    db.exec('COMMIT');
    return getTeam(id);
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function submitTeam(id, actor) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const row = db.prepare('SELECT * FROM teams WHERE id=?').get(id);
    if (!row) throw new Error('Team not found');
    if (row.submitted_at) throw new Error('Already submitted');
    const gaps = submissionGaps(JSON.parse(row.state_json));
    if (gaps.length) { const error = new Error('Complete the required sections before submitting'); error.gaps=gaps; throw error; }
    db.prepare('UPDATE teams SET submitted_at=CURRENT_TIMESTAMP,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(id);
    db.prepare('INSERT INTO activity_log (team_id,actor,action_type) VALUES (?,?,?)').run(id,actor,'submit');
    db.exec('COMMIT');
    return getTeam(id);
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function reopenTeam(id) {
  const result=db.prepare('UPDATE teams SET submitted_at=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?').run(id);
  if (!result.changes) throw new Error('Team not found');
  db.prepare('INSERT INTO activity_log (team_id,actor,action_type) VALUES (?,?,?)').run(id,'Teacher','reopen');
  return getTeam(id);
}
export function teamRoster(id) {
  return [...new Set(db.prepare("SELECT name FROM sessions WHERE role='student' AND team_id=? AND expires_at>? ORDER BY name").all(id,Date.now()).map(row=>row.name))];
}
export function sameHash(a,b) {
  const aa=Buffer.from(hash(a)); const bb=Buffer.from(hash(b));
  return timingSafeEqual(aa,bb);
}
export function closeStore() { db.close(); }
