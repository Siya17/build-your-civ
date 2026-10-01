import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, writeFileSync, existsSync, copyFileSync, constants } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHmac, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';
import { applyAction, codeTag, initialState, isCodeShape, isPoint, normalizeCode, normalizeState, points, submissionGaps } from '../shared/game.js';

const dataDir = resolve(process.env.DATA_DIR || join(process.cwd(), 'data'));
mkdirSync(dataDir, { recursive: true });
const secretPath = join(dataDir, 'secret.key');
if (!existsSync(secretPath)) writeFileSync(secretPath, randomBytes(32), { flag: 'wx', mode: 0o600 });
const secret = readFileSync(secretPath);
const databasePath = join(dataDir, 'classroom.sqlite');
const db = new DatabaseSync(databasePath);
db.exec('PRAGMA busy_timeout=5000');

// Before replacing an old saved shape, preserve a complete database and its join-code
// secret. Checkpoint outside the transaction, then let SQLite make a consistent copy;
// even a separate server writing just after the checkpoint cannot produce a torn backup.
const upgradesBackedUp = new Set();
function backupBeforeUpgrade(kind = 'pre-v2') {
  if (upgradesBackedUp.has(kind)) return;
  const checkpoint = db.prepare('PRAGMA wal_checkpoint(TRUNCATE)').get();
  if (checkpoint.busy) throw Object.assign(new Error('The classroom database is busy. Try again before upgrading saved teams.'), {status:503});
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const folder = join(dataDir, 'backups', `${kind}-${stamp}-${randomBytes(3).toString('hex')}`);
  mkdirSync(folder, {recursive:true, mode:0o700});
  db.prepare('VACUUM INTO ?').run(join(folder, 'classroom.sqlite'));
  copyFileSync(secretPath, join(folder, 'secret.key'), constants.COPYFILE_EXCL);
  upgradesBackedUp.add(kind);
}
const existingTables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all().map(row => row.name));
const oldState = raw => !raw || typeof raw !== 'object' || raw.v !== 2;
const savedState = row => JSON.parse(row.state_json);
// Stricter prerequisites can invalidate a card picked under the former OR rule.
// Preserve the raw v2 save before any later answer/action persists that cleanup.
const rulesChanged = raw => {
  if (oldState(raw)) return false;
  const clean = normalizeState(raw);
  return ['tech','civic'].some(tree => JSON.stringify(raw[tree] || []) !== JSON.stringify(clean[tree]));
};
if (existingTables.has('worlds') || existingTables.has('world_access') ||
    (existingTables.has('teams') && db.prepare('SELECT state_json FROM teams').all().some(row => oldState(savedState(row))))) {
  backupBeforeUpgrade();
} else if (existingTables.has('teams') && db.prepare('SELECT state_json FROM teams').all().some(row => rulesChanged(savedState(row)))) {
  backupBeforeUpgrade('pre-rules');
}

db.exec(`PRAGMA journal_mode=WAL;
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
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS sessions_expiry ON sessions(expires_at);
CREATE INDEX IF NOT EXISTS log_team ON activity_log(team_id,id);`);

// The readable join code is kept so the teacher can read it out at any time. Databases made
// before that only have the hash; their codes still work, the teacher just issues new ones.
if (!db.prepare('PRAGMA table_info(teams)').all().some(column => column.name === 'code')) db.exec('ALTER TABLE teams ADD COLUMN code TEXT');

// Prepared once: the 30-student sign-in burst and every keystroke save runs through these.
const statements = {
  teamById: db.prepare('SELECT * FROM teams WHERE id=?'),
  teamByCodeHash: db.prepare('SELECT * FROM teams WHERE code_hash=?'),
  codeHashTaken: db.prepare('SELECT 1 FROM teams WHERE code_hash=?'),
  allTeams: db.prepare('SELECT * FROM teams ORDER BY id'),
  insertTeam: db.prepare('INSERT INTO teams (name,code_hash,code,state_json) VALUES (?,?,?,?)'),
  renameTeam: db.prepare('UPDATE teams SET name=?,updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  deleteTeam: db.prepare('DELETE FROM teams WHERE id=?'),
  setCodeHash: db.prepare('UPDATE teams SET code_hash=?,code=?,updated_at=CURRENT_TIMESTAMP WHERE id=?'),
  getSetting: db.prepare('SELECT value FROM settings WHERE key=?'),
  putSetting: db.prepare('INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value'),
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

// Saves from the older hex-map version are brought up to date as they are read.
const rowTeam = row => {
  if(!row)return null;
  const state=normalizeState(savedState(row));
  return {id:row.id,name:row.name,code:row.code||null,state,version:row.version,submittedAt:row.submitted_at,createdAt:row.created_at,updatedAt:row.updated_at};
};
const cleanName = name => String(name ?? '').trim().slice(0, 80);
// The team's tag and a fresh three-digit PIN. The hash, which sign-in looks up, is unique.
function freshCode(name) {
  const tag = codeTag(name);
  let code, codeHash;
  do { code = `${tag}-${randomInt(100, 1000)}`; codeHash = hash(normalizeCode(code)); } while (statements.codeHashTaken.get(codeHash));
  return { code, codeHash };
}

// A team made for a map point starts there, and keeps that homeland for the whole game.
export function createTeam(name, point = '') {
  const clean = cleanName(name);
  if (!clean) throw new Error('Enter a team name');
  if (typeof point !== 'string' || (point && !isPoint(point))) throw new Error('Invalid map point');
  const state = point ? {...initialState(), mapPoint:point, fixedPoint:point} : initialState();
  const { code, codeHash } = freshCode(clean);
  const result = statements.insertTeam.run(clean,codeHash,code,JSON.stringify(state));
  return getTeam(Number(result.lastInsertRowid));
}

// One team per map point, "Team A" to "Team K". Adds only the letters no team holds, so the
// teacher can delete a team and bring it back later without duplicating the others.
export function addLetterTeams() {
  const taken = new Set(listTeams().map(team => team.state.fixedPoint).filter(Boolean));
  return points.filter(point => !taken.has(point)).map(point => createTeam(`Team ${point}`, point));
}
// The first time a classroom database opens, the A–K teams are already waiting.
export function seedLetterTeams() {
  if (statements.getSetting.get('letter_teams_seeded')) return [];
  const made = addLetterTeams();
  statements.putSetting.run('letter_teams_seeded', new Date().toISOString());
  return made;
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

// A new code follows the team's current name, so a renamed team can get a matching code.
export function regenerateCode(id) {
  const team = getTeam(id);
  if (!team) throw new Error('Team not found');
  const { code, codeHash } = freshCode(team.name);
  statements.setCodeHash.run(codeHash,code,id);
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
// The server rolls every die (rollDie), inside the transaction, so a roll is final.
export function updateTeam(id, action, actor, rollDie = () => randomInt(1, 7)) {
  const existing = statements.teamById.get(id);
  if (existing) {
    const raw = savedState(existing);
    if (oldState(raw)) backupBeforeUpgrade();
    else if (rulesChanged(raw)) backupBeforeUpgrade('pre-rules');
  }
  db.exec('BEGIN IMMEDIATE');
  try {
    const row = statements.teamById.get(id);
    if (!row) throw new Error('Team not found');
    if (row.submitted_at) throw Object.assign(new Error('This team has already submitted. Ask the teacher to reopen it.'), {code:'submitted'});
    if(Object.hasOwn(action,'expectedVersion')&&action.expectedVersion!==row.version){const error=new Error('The team changed. Review the updated choice before confirming.');error.status=409;throw error;}
    const next = applyAction(normalizeState(savedState(row)), action, {rollDie});
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
    if (row.submitted_at) throw Object.assign(new Error('Already submitted. Ask the teacher to reopen it.'), {code:'submitted'});
    const gaps = submissionGaps(normalizeState(savedState(row)));
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

// The teacher opens "what really happened" for the whole class at once.
export function revealOpen() { return statements.getSetting.get('reveal')?.value === '1'; }
export function setReveal(open) { statements.putSetting.run('reveal', open ? '1' : '0'); return revealOpen(); }

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
