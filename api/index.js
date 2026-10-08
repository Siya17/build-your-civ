async function loadHandler(password) {
  const [{createAppHandler},{firebaseStore}]=await Promise.all([
    import('../server/http.js'),import('../server/firebase.js')
  ]);
  const store=await firebaseStore();
  return createAppHandler({teacherPassword:password,secureCookie:true,trustProxy:true,store,staticAssets:false});
}

// Bound initialization, not writes: a timed-out write could still commit and must
// never be presented as safe to repeat. Keep one initialization shared by callers.
export function createApi({initialize=loadHandler,startupTimeoutMs=12000}={}) {
  let ready;
  return async function api(req,res) {
    let timer;
    try {
      const password=process.env.TEACHER_PASSWORD;
      if(!password || password.length<12)throw new Error('Set TEACHER_PASSWORD to at least 12 characters');
      // Load dependencies inside the error boundary so startup failures return JSON too.
      ready ||= Promise.resolve().then(()=>initialize(password)).catch(error=>{ready=undefined;throw error;});
      const handler=await Promise.race([ready,new Promise((_,reject)=>{
        timer=setTimeout(()=>reject(Object.assign(new Error('Classroom database initialization timed out'),{code:'STARTUP_TIMEOUT'})),startupTimeoutMs);
      })]);
      clearTimeout(timer);
      // Explicit rewrite metadata avoids depending on the platform's rewritten URL.
      const url=new URL(req.url,'https://localhost');
      const route=req.query?.route ?? url.searchParams.get('route');
      if(route)req.url='/api/'+(Array.isArray(route)?route.join('/'):route);
      await handler(req,res);
    } catch(error) {
      // Details stay in the Vercel logs; never send credentials to a browser.
      console.error('Classroom initialization failed:',error.code || 'STARTUP_ERROR',error.message);
      if(!res.headersSent)res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});
      const unavailable=error.code==='STARTUP_TIMEOUT'||[4,8,14].includes(error.code);
      res.end(JSON.stringify({error:unavailable
        ? 'The classroom database is temporarily unavailable. Please try again shortly. The teacher should check Firebase availability and quotas if this continues.'
        : 'Classroom setup is incomplete. Ask the teacher to check the Vercel environment variables.',code:unavailable?'CLASSROOM_UNAVAILABLE':'CLASSROOM_SETUP'}));
    } finally {
      clearTimeout(timer);
    }
  };
}

export default createApi();
