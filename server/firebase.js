import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { createFirestoreStore } from './firestore-store.js';

let ready;
const jsonEnv=key=>{
  try {return JSON.parse(process.env[key] || 'null');}
  catch {throw new Error(`${key} must contain valid JSON`);}
};
export function firebaseStore() {
  return ready ||= initialize().catch(error => { ready = null; throw error; });
}
async function initialize() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Set SESSION_SECRET to at least 32 characters');
  const account = jsonEnv('FIREBASE_SERVICE_ACCOUNT');
  const config = jsonEnv('FIREBASE_WEB_CONFIG');
  if (!account?.project_id || !account.private_key || !account.client_email) throw new Error('Set FIREBASE_SERVICE_ACCOUNT to the service-account JSON');
  if (!config?.apiKey || !config.projectId || !config.appId || config.projectId !== account.project_id) throw new Error('Set FIREBASE_WEB_CONFIG for the same Firebase project');
  const admin = getApps().find(app => app.name === 'classroom') || initializeApp({ credential:cert(account), projectId:account.project_id }, 'classroom');
  const store = createFirestoreStore(getFirestore(admin), {secret});
  store.realtimeToken = async (session, token) => ({
    mode:'firebase', config, teamId:session.teamId, role:session.role, uid:store.sessionId(token),
    token:await getAuth(admin).createCustomToken(store.sessionId(token), {role:session.role, teamId:session.teamId || 0})
  });
  await store.seedLetterTeams();
  return store;
}
