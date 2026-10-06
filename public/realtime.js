// The UI consumes the same event names locally (SSE) and online (Firestore).
export class ClassroomStream {
  constructor() {
    this.listeners=new Map();this.closed=false;this.cleanups=[];
    this.connect();
  }
  addEventListener(name,listener){this.listeners.set(name,listener);}
  emit(name,data){if(!this.closed)this.listeners.get(name)?.({data:JSON.stringify(data)});}
  async connect() {
    try {await this.start();}
    catch(error) {this.reconnect(error);}
  }
  reconnect(error) {
    if(this.closed || this.retry)return;
    for(const stop of this.cleanups.splice(0))stop();
    this.onerror?.(error);
    this.retry=setTimeout(()=>{this.retry=null;this.connect();},5000);
  }
  async start() {
    const res=await fetch('/api/realtime',{credentials:'same-origin'});
    if(this.closed)return;
    if(res.status===401){this.emit('revoked',{});return;}
    if(!res.ok)throw new Error('Live updates are unavailable');
    const setup=await res.json();if(this.closed)return;
    if(setup.mode==='sse') {
      const source=new EventSource('/api/events');this.cleanups.push(()=>source.close());
      source.onopen=()=>this.onopen?.();source.onerror=event=>this.onerror?.(event);
      for(const name of ['team','teams','presence','reveal','lesson','revoked'])source.addEventListener(name,event=>{if(!this.closed)this.listeners.get(name)?.(event);});
    } else {
      const {connectFirebase}=await import('/firebase-client.js');if(this.closed)return;
      await connectFirebase(this,setup);
    }
  }
  close(){this.closed=true;clearTimeout(this.retry);for(const stop of this.cleanups.splice(0))stop();}
}
