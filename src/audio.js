export function ensureAudio(app){
  if(!app.audioCtx){ try{ app.audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){ console.warn('AudioContext not available', e);} }
}
export function beep(app, {freq=440,dur=0.06,type='square',gain=0.08,attack=0.005,decay=0.04}){
  if(!app.audioCtx) return;
  const o=app.audioCtx.createOscillator(), g=app.audioCtx.createGain();
  o.type=type; o.frequency.value=freq; g.gain.value=0; o.connect(g); g.connect(app.audioCtx.destination);
  const t=app.audioCtx.currentTime; const peak=gain*app.sfxVolume;
  g.gain.linearRampToValueAtTime(peak,t+attack); g.gain.exponentialRampToValueAtTime(0.0001,t+attack+decay);
  o.start(); o.stop(t+attack+decay+0.02);
}
export const SFX = {
  cash: (app)=> beep(app,{freq:1200,type:'square',gain:0.06,attack:0.001,decay:0.10}),
  denied: (app)=> beep(app,{freq:200,type:'sine',gain:0.05,attack:0.002,decay:0.15}),
  boss: (app)=> { beep(app,{freq:200,type:'sawtooth',gain:0.08,attack:0.01,decay:1.2}); setTimeout(()=>beep(app,{freq:140,type:'sine',gain:0.06,attack:0.005,decay:0.8}), 180); },
  uiHover: (app)=> beep(app,{freq:1400,type:'triangle',gain:0.03,attack:0.001,decay:0.04}),
  blaster: (app)=> beep(app,{freq:980,type:'triangle',gain:0.05,attack:0.001,decay:0.05}),
  beam:    (app)=> { if(!app.audioCtx) return; const t=app.audioCtx.currentTime; const o=app.audioCtx.createOscillator(); const g=app.audioCtx.createGain(); o.type='sawtooth'; o.connect(g); g.connect(app.audioCtx.destination); g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(0.06*app.sfxVolume,t+0.01); g.gain.exponentialRampToValueAtTime(0.0001,t+0.12); o.frequency.setValueAtTime(260,t); o.frequency.exponentialRampToValueAtTime(1800,t+0.09); o.start(t); o.stop(t+0.14); },
  gauss:   (app)=> beep(app,{freq:220,type:'square',gain:0.08,attack:0.004,decay:0.2}),
  hit:     (app)=> beep(app,{freq:140,type:'square',gain:0.08,attack:0.002,decay:0.12}),
  exp:     (app)=> beep(app,{freq:1200,type:'sine',gain:0.03,attack:0.001,decay:0.05}),
  gold:    (app)=> beep(app,{freq:1000,type:'triangle',gain:0.05,attack:0.001,decay:0.09}),
  food:    (app)=> beep(app,{freq:600,type:'sine',gain:0.05,attack:0.002,decay:0.1}),
  level:   (app)=> { if(!app.audioCtx) return; const t=app.audioCtx.currentTime; const notes=[660,880,1320,1760]; notes.forEach((f,i)=>{ const o=app.audioCtx.createOscillator(); const g=app.audioCtx.createGain(); o.type='square'; o.frequency.value=f; o.connect(g); g.connect(app.audioCtx.destination); const tt=t+i*0.06; g.gain.setValueAtTime(0,tt); g.gain.linearRampToValueAtTime(0.07*app.sfxVolume,tt+0.015); g.gain.exponentialRampToValueAtTime(0.0001,tt+0.18); o.start(tt); o.stop(tt+0.22); }); },
  win:     (app)=> beep(app,{freq:880,type:'sine',gain:0.06,attack:0.002,decay:0.25}),
  lose:    (app)=> beep(app,{freq:100,type:'square',gain:0.08,attack:0.002,decay:0.4})
};
