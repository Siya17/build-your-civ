import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { applyAction, codeAlphabet, initialState, isCodeShape, normalizeCode, submissionGaps } from '../shared/game.js';

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

// Prepared once: the 30-student sign-in burst and every keystroke save runs through these.
const statements = {
  teamById: db.prepare('SELECT * FROM teams WHERE id=?'),
  teamByCodeHash: db.prepare('SELECT * FROM teams WHERE code_hash=?'),
  codeHashTaken: db.prepare('SELECT 1 FROM teams WHERE code_hash=?'),
  allTeams: db.prepare('SELECT * FROM teams ORDER BY id'),
  insertTeam: db.prepare('INSERT INTO teams (name,code_hash,state_json) VALUES (?,?,?)'),
  renameTeam: db.prepare('UPDATE teams SET name=?,updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  deleteTeam: db.prepare('DELETE FROM teams WHERE id=?'),
  setCodeHash: db.prepare('UPDATE teams SET code_hash=?,updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  setState: db.prepare('UPDATE teams SET state_json=?,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  markSubmitted: db.prepare('UPDATE teams SET submitted_at=CURRENT_TIMESTAMP,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  clearSubmitted: db.prepare('UPDATE teams SET submitted_at=NULL,version=version+1,updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  insertSession: db.prepare('INSERT INTO sessions (token_hash,role,team_id,name,expires_at) VALUES (?,?,?,?,?)'),
  liveSession: db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires_at>?'),
  deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash=?'),
  expireSessions: db.prepare('DELETE FROM sessions WHERE expires_at < ?'),
  joinedNames: db.prepare("SELECT name FROM sessions WHERE role='student' AND team_id=? AND expires_at>? ORDER BY name"),
  insertLog: db.prepare('INSERT INTO activity_log (team_id,actor,action_type) VALUES (?,?,?)'),
  recentLog: db.prepare('SELECT actor,action_type,created_at FROM activity_log WHERE team_id=? ORDER BY id DESC LIMIT ?'),
  logCounts: db.prepare('SELECT actor,COUNT(*) AS total FROM activity_log WHERE team_id=? GROUP BY actor ORDER BY total DESC, actor'),
};

statements.expireSessions.run(Date.now());

const hash = value => createHmac('sha256', secret).update(value).digest('hex');
const rowTeam = row => row && ({id:row.id,name:row.name,state:JSON.parse(row.state_json),version:row.version,submittedAt:row.submitted_at,createdAt:row.created_at,updatedAt:row.updated_at});
const randomCode = () => Array.from(randomBytes(9), n => codeAlphabet[n % codeAlphabet.length]).join('');
const cleanName = name => String(name ?? '').trim().slice(0, 80);
function freshCodeHash() {
  let code, codeHash;
  do { code = randomCode(); codeHash = hash(code); } while (statements.codeHashTaken.get(codeHash));
  return { code, codeHash };
}

export function createTeam(name) {
  const clean = cleanName(name);
  if (!clean) throw new Error('Enter a team name');
  const { code, codeHash } = freshCodeHash();
  const result = statements.insertTeam.run(clean,codeHash,JSON.stringify(initialState()));
  return {...getTeam(Number(result.lastInsertRowid)),code};
}

export function renameTeam(id, name) {
  const clean = cleanName(name);
  if (!clean) throw new Error('Enter a team name');
  if (!statements.renameTeam.run(clean,id).changes) throw new Error('Team not found');
  return getTeam(id);
}

// Sessions and activity rows cascade away with the team (see the schema above).
export function deleteTeam(id) {
  if (!statements.deleteTeam.run(id).changes) throw new Error('Team not found');
}

export function regenerateCode(id) {
  if (!getTeam(id)) throw new Error('Team not found');
  const { code, codeHash } = freshCodeHash();
  statements.setCodeHash.run(codeHash,id);
  return code;
}

export function getTeam(id) { return rowTeam(statements.teamById.get(id)); }
export function listTeams() { return statements.allTeams.all().map(rowTeam); }
export function findTeamByCode(code) {
  const normalized = normalizeCode(code);
  if (!isCodeShape(normalized)) return null;
  return rowTeam(statements.teamByCodeHash.get(hash(normalized)));
}
export function createSession(role, teamId, name) {
  const token = randomBytes(32).toString('base64url');
  const expiresAt = Date.now() + 12 * 60 * 60 * 1000;
  statements.insertSession.run(hash(token),role,teamId,name,expiresAt);
  return {token,expiresAt};
}
export function getSession(token) {
  if (!token) return null;
  const row = statements.liveSession.get(hash(token),Date.now());
  return row && {role:row.role,teamId:row.team_id,name:row.name,expiresAt:row.expires_at};
}
export function deleteSession(token) { if (token) statements.deleteSession.run(hash(token)); }
export function pruneSessions() { return statements.expireSessions.run(Date.now()).changes; }

// BEGIN IMMEDIATE .. COMMIT is atomic here only because nothing between them awaits.
// node:sqlite is synchronous, so the whole block runs in one turn of the event loop.
// Introducing an await inside would let another request interleave mid-transaction.
export function updateTeam(id, action, actor) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const row = statements.teamById.get(id);
    if (!row) throw new Error('Team not found');
    if (row.submitted_at) throw new Error('This team has already submitted. Ask the teacher to reopen it.');
    const next = applyAction(JSON.parse(row.state_json), action);
    statements.setState.run(JSON.stringify(next),id);
    statements.insertLog.run(id,actor,action.type);
    db.exec('COMMIT');
    return getTeam(id);
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function submitTeam(id, actor) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const row = statements.teamById.get(id);
    if (!row) throw new Error('Team not found');
    if (row.submitted_at) throw new Error('Already submitted');
    const gaps = submissionGaps(JSON.parse(row.state_json));
    if (gaps.length) { const error = new Error('Complete the required sections before submitting'); error.gaps=gaps; throw error; }
    statements.markSubmitted.run(id);
    statements.insertLog.run(id,actor,'submit');
    db.exec('COMMIT');
    return getTeam(id);
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
export function reopenTeam(id) {
  if (!statements.clearSubmitted.run(id).changes) throw new Error('Team not found');
  statements.insertLog.run(id,'Teacher','reopen');
  return getTeam(id);
}

// Everyone who signed in with this team's code and still holds a valid session.
// This is an attendance list, not a presence list: a student who closed the tab
// stays here until their session expires. Live presence comes from server/http.js.
export function joinedNames(id) {
  return [...new Set(statements.joinedNames.all(id,Date.now()).map(row=>row.name))];
}

export function teamActivity(id, limit = 40) {
  return {
    recent: statements.recentLog.all(id,limit).map(row=>({actor:row.actor,type:row.action_type,at:row.created_at})),
    counts: statements.logCounts.all(id).map(row=>({actor:row.actor,total:row.total})),
  };
}

export function sameHash(a,b) {
  const aa=Buffer.from(hash(a)); const bb=Buffer.from(hash(b));
  return timingSafeEqual(aa,bb);
}

// Fold the WAL back into the database file so a backup that copies only
// classroom.sqlite is complete. Called on shutdown.
export function closeStore() {
  try { db.exec('PRAGMA wal_checkpoint(TRUNCATE)'); } catch {}
  db.close();
}
