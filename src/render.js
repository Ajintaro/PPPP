import { WORLD } from './config.js';

export function draw(app){
  drawBackground(app);
  drawDrops(app);
  drawEnemies(app);
  drawProjectiles(app);
  drawForceField(app);
  drawShip(app);
  drawDamageTexts(app);
}

export function drawBackground(app){
  const { ctx, canvas, camera } = app;
  // starfield
  ctx.fillStyle = '#070a12'; ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.save(); ctx.translate(-camera.x, -camera.y);
  for(let i=0;i<600;i++){
    const x = (i*733)%WORLD.w, y=(i*997)%WORLD.h; const r = (i%3)+1;
    ctx.fillStyle = i%7===0 ? 'rgba(255,240,160,0.9)' : 'rgba(180,200,255,0.8)';
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
  }
  ctx.strokeStyle='rgba(100,160,255,0.15)'; ctx.strokeRect(0,0,WORLD.w,WORLD.h);
  ctx.restore();
}

export function drawShip(app){
  const { ctx, camera, player } = app;
  ctx.save(); ctx.translate(player.x - camera.x, player.y - camera.y); ctx.rotate(player.facing);
  // shadow
  ctx.globalAlpha=0.25; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(0,10,12,4,0,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;
  // body
  ctx.fillStyle='#b1c7ff'; ctx.strokeStyle='#6b7eb8'; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-10,-10); ctx.lineTo(-6,0); ctx.lineTo(-10,10); ctx.closePath(); ctx.fill(); ctx.stroke();
  // cockpit
  ctx.fillStyle='#2de0ff'; ctx.beginPath(); ctx.arc(2,0,4,0,Math.PI*2); ctx.fill();
  // engine glow
  const t = app.time.elapsed*10; ctx.fillStyle='rgba(255,180,120,0.9)'; ctx.fillRect(-14,-2.5,6+Math.sin(t)*2,5);
  ctx.restore();
}

export function drawProjectiles(app){
  const { ctx, camera, projectiles } = app;
  ctx.save(); ctx.translate(-camera.x, -camera.y);
  projectiles.forEach(p=>{
    if(p.type==='blaster'){ 
      const ang=Math.atan2(p.vy,p.vx); 
      const sc=(p.visScale||1); 
      drawPepper(ctx,p.x,p.y,ang,1.1*sc); 
    } else if(p.type==='gauss'){
      const g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*2);
      g.addColorStop(0,'rgba(120,255,160,1)'); g.addColorStop(1,'rgba(120,255,160,0)');
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,p.r*2,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#b7ffd1'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    } else if(p.type==='orbital'){
      // Draw salami orbital projectile
      drawSalami(ctx,p.x,p.y,p.angle,1.0);
    }
  });
  ctx.restore();
}

export function drawEnemies(app){
  const { ctx, camera, enemies } = app;
  ctx.save(); ctx.translate(-camera.x, -camera.y);
  enemies.forEach(e=>{
    const color = e.miniboss? '#ff2e2e' : (e.type===0? '#ff7b9d' : e.type===1? '#9d7bff' : '#ffcd7b');
    ctx.fillStyle = color; if(e.miniboss){ /* miniboss evil */ ctx.save(); ctx.translate(e.x,e.y); ctx.fillStyle=color; ctx.beginPath(); ctx.arc(0,0,e.r,0,Math.PI*2); ctx.fill(); /* horns */ ctx.beginPath(); ctx.moveTo(-e.r*0.4,-e.r*0.2); ctx.lineTo(-e.r*0.8,-e.r*0.9); ctx.lineTo(-e.r*0.2,-e.r*0.5); ctx.closePath(); ctx.moveTo(e.r*0.4,-e.r*0.2); ctx.lineTo(e.r*0.8,-e.r*0.9); ctx.lineTo(e.r*0.2,-e.r*0.5); ctx.closePath(); ctx.fill(); /* eyes */ ctx.fillStyle='#111'; ctx.beginPath(); ctx.ellipse(-e.r*0.25, -e.r*0.05, e.r*0.18, e.r*0.12, 0.2, 0, Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(e.r*0.25, -e.r*0.05, e.r*0.18, e.r*0.12, -0.2, 0, Math.PI*2); ctx.fill(); ctx.restore(); } else { ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fill(); if(e.hitFlash&&e.hitFlash>0){ ctx.save(); ctx.globalAlpha=Math.min(1,e.hitFlash/0.08); ctx.fillStyle='rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fill(); ctx.restore(); } }
    if(e.miniboss && e.shield2Max){ ctx.strokeStyle='rgba(255,240,120,0.85)'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(e.x,e.y,e.r+6,-Math.PI/2,-Math.PI/2+ (e.shield2/e.shield2Max)*Math.PI*2); ctx.stroke(); }
  if(app.time.elapsed>30){ ctx.strokeStyle='rgba(160,170,190,.7)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(e.x,e.y,e.r+3,-Math.PI/2,-Math.PI/2+(e.hp/e.maxHp)*Math.PI*2); ctx.stroke(); }
  });
  ctx.restore();
}

export function drawDrops(app){
  const { ctx, camera, orbs, pickups, beamArcs } = app;
  ctx.save(); ctx.translate(-camera.x, -camera.y);
  // XP chips
  ctx.fillStyle = '#5bb2ff'; orbs.forEach(o=>{ ctx.beginPath(); ctx.arc(o.x,o.y,o.r,0,Math.PI*2); ctx.fill(); });
  // pickups
  pickups.forEach(p=>{
    if(p.kind==='gold'){ ctx.fillStyle='#ffd86b'; ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill(); }
    else if(p.kind==='pizza'){ drawPizzaSlice(ctx,p.x,p.y,1.1); }
    else if(p.kind==='chest'){ ctx.fillStyle='#7bd7ff'; ctx.fillRect(p.x-10,p.y-8,20,16); ctx.strokeStyle='#dff4ff'; ctx.lineWidth=2; ctx.strokeRect(p.x-10,p.y-8,20,16); }
  });
  // beam arcs
  beamArcs.forEach(a=>{
    const start=a.ang-a.arc/2, end=a.ang+a.arc/2;
    // filled sector
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.arc(a.x,a.y,a.range,start,end); ctx.closePath(); ctx.fillStyle='rgba(255,255,160,0.18)'; ctx.fill();
    // outline
    ctx.strokeStyle='rgba(255,255,160,0.75)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(a.x,a.y,a.range,start,end); ctx.stroke();
  });
  ctx.restore();
}

export function drawPizzaSlice(ctx,x,y,s){
  ctx.save(); ctx.translate(x,y); ctx.scale(s,s); ctx.rotate(-Math.PI/8);
  ctx.globalAlpha=0.25; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(0,10,10,4,0,0,Math.PI*2); ctx.fill(); ctx.globalAlpha=1;
  ctx.fillStyle='#f7ce6a'; ctx.strokeStyle='#c48b3f'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(-8,-2); ctx.lineTo(0,12); ctx.lineTo(8,-2); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.fillStyle='#e95454'; ctx.beginPath(); ctx.arc(-3,-2,2,0,Math.PI*2); ctx.arc(3,-2,2,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

export function drawShipPreview(ctx, variant='mozz', x=60, y=45, scale=1.2){
  ctx.save(); ctx.translate(x,y); ctx.scale(scale, scale);
  // base
  ctx.fillStyle='#b1c7ff'; ctx.strokeStyle='#6b7eb8'; ctx.lineWidth=2;
  if(variant==='anch'){ // slim & fast
    ctx.beginPath(); ctx.moveTo(18,0); ctx.lineTo(-12,-8); ctx.lineTo(-4,0); ctx.lineTo(-12,8); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#2de0ff'; ctx.beginPath(); ctx.arc(4,0,3,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,200,120,0.9)'; ctx.fillRect(-16,-2,7,4);
    ctx.fillRect(-10,-1.5,7,3);
  } else if(variant==='deep'){ // bulky & tanky
    ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(-14,-12); ctx.lineTo(-8,0); ctx.lineTo(-14,12); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#2de0ff'; ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,180,120,0.9)'; ctx.fillRect(-18,-3,8,6);
  } else { // mozz default
    ctx.beginPath(); ctx.moveTo(16,0); ctx.lineTo(-10,-10); ctx.lineTo(-6,0); ctx.lineTo(-10,10); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle='#2de0ff'; ctx.beginPath(); ctx.arc(2,0,4,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,180,120,0.9)'; ctx.fillRect(-14,-2.5,6,5);
  }
  ctx.restore();
}

function drawPepper(ctx, x, y, ang, s){
  ctx.save();
  ctx.translate(x,y); ctx.rotate(ang); ctx.scale(s,s);
  // shadow
  ctx.globalAlpha=0.25; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(2,3,5,2,0,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;
  // body
  ctx.fillStyle='#38d56b'; ctx.strokeStyle='#148a3c'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(-6,-2); ctx.quadraticCurveTo(4,-4,10,0); ctx.quadraticCurveTo(4,4,-6,2); ctx.closePath();
  ctx.fill(); ctx.stroke();
  // stem
  ctx.strokeStyle='#3a9b2f'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-6,0); ctx.lineTo(-9,-2); ctx.stroke();
  ctx.restore();
}

function drawSalami(ctx, x, y, ang, s){
  ctx.save();
  ctx.translate(x,y); ctx.rotate(ang); ctx.scale(s,s);
  // shadow
  ctx.globalAlpha=0.25; ctx.fillStyle='#000'; ctx.beginPath(); ctx.ellipse(2,3,6,2,0,0,Math.PI*2); ctx.fill();
  ctx.globalAlpha=1;
  // body - salami slice
  ctx.fillStyle='#ff8844'; ctx.strokeStyle='#cc6633'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(0,0,6,0,Math.PI*2); ctx.fill(); ctx.stroke();
  // fat marbling
  ctx.fillStyle='#ffaa66'; ctx.beginPath(); ctx.arc(0,0,4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ff8844'; ctx.beginPath(); ctx.arc(0,0,2,0,Math.PI*2); ctx.fill();
  ctx.restore();
}

export function drawDamageTexts(app){
  const { ctx, camera } = app;
  ctx.save(); ctx.translate(-camera.x, -camera.y);
  app.dmgTexts.forEach(d=>{
    const a = Math.max(0, Math.min(1, 1 - (d.t||0)/0.55));
    ctx.globalAlpha = a; ctx.fillStyle='rgba(255,240,120,1)'; ctx.font='14px Arial'; ctx.textAlign='center';
    ctx.fillText(String(d.val), d.x, d.y);
  });
  ctx.restore();
}

export function drawForceField(app){
  // Draw persistent aura if force field weapon is active
  if(app.forceFieldAura && app.forceFieldAura.active) {
    const { ctx, camera, forceFieldAura } = app;
    
    ctx.save();
    ctx.translate(forceFieldAura.x - camera.x, forceFieldAura.y - camera.y);
    
    // Subtle persistent aura
    ctx.globalAlpha = 0.15;
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, forceFieldAura.radius);
    gradient.addColorStop(0, 'rgba(0, 255, 100, 0.3)');
    gradient.addColorStop(0.7, 'rgba(0, 255, 100, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, forceFieldAura.radius, 0, Math.PI * 2);
    ctx.fill();
    
    // Subtle border
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = '#00ff64';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, forceFieldAura.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
  }
  
  // Draw pulse effect
  if(!app.forceFieldPulse) return;
  
  const { ctx, camera, forceFieldPulse } = app;
  const pulse = forceFieldPulse;
  
  ctx.save();
  ctx.translate(pulse.x - camera.x, pulse.y - camera.y);
  
  // Draw force field aura with better visibility
  const alpha = Math.max(0, pulse.life / (pulse.maxLife || 0.3));
  ctx.globalAlpha = alpha * 0.5; // Increased alpha for better visibility
  
  // Outer glow - more intense
  const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulse.radius);
  gradient.addColorStop(0, 'rgba(0, 255, 100, 1.0)'); // Brighter center
  gradient.addColorStop(0.5, 'rgba(0, 255, 100, 0.6)'); // More visible middle
  gradient.addColorStop(0.8, 'rgba(0, 255, 100, 0.3)'); // Visible edge
  gradient.addColorStop(1, 'rgba(0, 255, 100, 0)');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, pulse.radius, 0, Math.PI * 2);
  ctx.fill();
  
  // Inner ring - more visible
  ctx.globalAlpha = alpha * 0.8;
  ctx.strokeStyle = '#00ff64';
  ctx.lineWidth = 4; // Thicker line
  ctx.beginPath();
  ctx.arc(0, 0, pulse.radius * 0.7, 0, Math.PI * 2);
  ctx.stroke();
  
  // Additional inner glow
  ctx.globalAlpha = alpha * 0.4;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, pulse.radius * 0.5, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.restore();
  
  // Update pulse life
  pulse.life -= 0.016; // ~60fps
  if(pulse.life <= 0){
    app.forceFieldPulse = null;
  }
}