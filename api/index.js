let handler;
export default async function api(req,res) {
  try {
    const password=process.env.TEACHER_PASSWORD;
    if(!password || password.length<12)throw new Error('Set TEACHER_PASSWORD to at least 12 characters');
    // Load dependencies inside the error boundary so startup failures return JSON too.
    if(!handler) {
      const [{createAppHandler},{firebaseStore}]=await Promise.all([
        import('../server/http.js'),import('../server/firebase.js')
      ]);
      const store=await firebaseStore();
      handler ||= createAppHandler({teacherPassword:password,secureCookie:true,trustProxy:true,store,staticAssets:false});
    }
    // Explicit rewrite metadata avoids depending on the platform's rewritten URL.
    const url=new URL(req.url,'https://localhost');
    const route=req.query?.route ?? url.searchParams.get('route');
    if(route)req.url='/api/'+(Array.isArray(route)?route.join('/'):route);
    await handler(req,res);
  } catch(error) {
    // Details stay in the Vercel logs; never send credentials to a browser.
    console.error('Classroom initialization failed:',error.message);
    if(!res.headersSent)res.writeHead(503,{'Content-Type':'application/json','Cache-Control':'no-store'});
    res.end(JSON.stringify({error:'Classroom setup is incomplete. Ask the teacher to check the Vercel environment variables.'}));
  }
}
