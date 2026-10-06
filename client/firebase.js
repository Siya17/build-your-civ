import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, inMemoryPersistence, setPersistence, signInWithCustomToken, signOut } from 'firebase/auth';
import { getFirestore, collection, doc, onSnapshot, query, orderBy, terminate } from 'firebase/firestore';

const rowTeam=data=>({id:data.id,name:data.name,code:data.code,state:data.state,version:data.version,submittedAt:data.submittedAt,createdAt:data.createdAt,updatedAt:data.updatedAt});
export async function connectFirebase(stream,setup) {
  // Separate app instances isolate a sign-out/sign-in race and multiple browser tabs.
  const app=initializeApp(setup.config,'classroom-'+crypto.randomUUID());
  const auth=getAuth(app),db=getFirestore(app);
  let stopped=false,heartbeat,expiryTimer,roster=[],presenceEntries={};
  const unsubscribes=[];
  stream.cleanups.push(()=>{
    stopped=true;clearInterval(heartbeat);clearTimeout(expiryTimer);
    for(const stop of unsubscribes)stop();
    signOut(auth).catch(()=>{}).finally(()=>terminate(db).catch(()=>{}).finally(()=>deleteApp(app).catch(()=>{})));
  });
  try {
    await setPersistence(auth,inMemoryPersistence);await signInWithCustomToken(auth,setup.token);
    if(stopped || stream.closed)return;
    const base='classrooms/main';
    const failed=async error=>{
      if(stopped)return;
      stream.onerror?.(error);
      if(error.code==='permission-denied' || error.code==='unauthenticated'){
        try{const res=await fetch('/api/me');const data=await res.json();if(!data.authenticated){stream.emit('revoked',{});return;}}catch{}
      }
      stream.reconnect(error);
    };
    const listen=(ref,update)=>unsubscribes.push(onSnapshot(ref,{includeMetadataChanges:true},snap=>{
      if(stopped)return;
      if(snap.metadata.fromCache)stream.onerror?.();else stream.onopen?.();
      update(snap);
    },failed));
    const publishPresence=()=>{
      const entries=Object.values(presenceEntries).filter(entry=>entry.seenAt>Date.now()-90_000);
      roster=[...new Set(entries.map(entry=>entry.name))].sort();
      const fields={};for(const entry of entries)if(entry.field){const names=fields[entry.field] ||= [];if(!names.includes(entry.name))names.push(entry.name);}
      stream.emit('presence',{roster,fields});
    };
    listen(doc(db,base+'/sessions/'+setup.uid),snap=>{
      if(!snap.exists()){stream.emit('revoked',{reason:'logout'});return;}
      clearTimeout(expiryTimer);expiryTimer=setTimeout(()=>stream.emit('revoked',{}),Math.max(0,snap.data().expiresAt-Date.now()));
    });
    listen(doc(db,base+'/settings/reveal'),snap=>stream.emit('reveal',{reveal:!!snap.data()?.reveal}));
    if(setup.role==='teacher')listen(query(collection(db,base+'/teams'),orderBy('id')),snap=>stream.emit('teams',{teams:snap.docs.map(doc=>rowTeam(doc.data()))}));
    else {
      listen(doc(db,base+'/teams/'+setup.teamId),snap=>{
        if(!snap.exists()){stream.emit('revoked',{});return;}
        stream.emit('team',{team:rowTeam(snap.data()),roster,by:snap.data().lastActor});
      });
      listen(doc(db,base+'/presence/'+setup.teamId),snap=>{presenceEntries=snap.data()?.entries || {};publishPresence();});
      const beat=async()=>{
        if(stopped)return;
        const field=document.activeElement?.dataset?.field || null;
        try {
          const res=await fetch('/api/team/presence',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({field}),credentials:'same-origin'});
          if(res.status===401)stream.emit('revoked',{});else if(!res.ok)stream.onerror?.();
        } catch(error){stream.onerror?.(error);}
        publishPresence();
      };
      await beat();if(stopped)return;heartbeat=setInterval(beat,45_000);
    }
  } catch(error) {
    throw error;
  }
}
