import { clamp, rand, randInt } from './state.js';
import { draw } from './render.js';
import { getDifficultyStage, spawnEnemy, dropAfterKill } from './spawn.js';
import { SFX, ensureAudio } from './audio.js';
import { addWeapon, WeaponDefs, applyAdminConfigToDefs, snapshotFactory } from './weapons.js';
import { WORLD } from './config.js';

export function attachInput(app){
  addEventListener('keydown', e=>{
    if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)) e.preventDefault();
    app.keys.add(e.key.toLowerCase()); if(e.key==='p' || e.key==='P') app.time.paused=!app.time.paused; ensureAudio(app);
  });
  addEventListener('keyup', e=> app.keys.delete(e.key.toLowerCase()));
  addEventListener('mousedown', ()=>ensureAudio(app));
  addEventListener('touchstart', ()=>ensureAudio(app), {passive:true});
}

function spawnMiniBoss(app){
  const x = Math.max(60, Math.min(app.player.x + (Math.random()<0.5?-1:1)*520, 4140));
  const y = Math.max(60, Math.min(app.player.y + (Math.random()<0.5?-1:1)*520, 4140));
  const e = { x, y, r:30, hp:420, maxHp:420, speed:100, touch:26, type:2, t:0, miniboss:true, shield2:260, shield2Max:260 };
  app.enemies.push(e);
  try{ SFX.boss(app);}catch{}
}
export function startLoop(app){ app.dmgTexts = []; app.stats = { damageDealt: 0 }; app.dmgTexts = []; app.stats = app.stats || { damageDealt: 0 };
  function resize(){ app.canvas.width=innerWidth; app.canvas.height=innerHeight; app.ctx.imageSmoothingEnabled=false; }
  addEventListener('resize', resize); resize();

  snapshotFactory(app);
  applyAdminConfigToDefs(app.adminOverrides||{});

  let last=performance.now(); app._bossNext = 120;
  function loop(now){
    const dt=Math.min(0.05,(now-last)/1000); last=now;
    update(app,dt);
    draw(app);
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

function update(app, dt){
  if(app.state!=='playing') return;
  app.time.elapsed+=dt; app.time.left = clamp(app.time.left-dt,0,5*60);
  if(app.time.left<=0 && app.player.alive){ app.endRun(true); }

  let dx=0,dy=0; if(app.keys.has('w')||app.keys.has('arrowup')) dy-=1; if(app.keys.has('s')||app.keys.has('arrowdown')) dy+=1; if(app.keys.has('a')||app.keys.has('arrowleft')) dx-=1; if(app.keys.has('d')||app.keys.has('arrowright')) dx+=1;
  const len=Math.hypot(dx,dy)||1; dx/=len; dy/=len;
  app.player.x += dx*app.player.speed*dt; app.player.y += dy*app.player.speed*dt;
  app.player.x = clamp(app.player.x, app.player.r, WORLD.w-app.player.r); app.player.y = clamp(app.player.y, app.player.r, WORLD.h-app.player.r);
  if(dx||dy) app.player.facing=Math.atan2(dy,dx);
  app.player.invuln=Math.max(0, app.player.invuln - dt);

  app.camera.x = clamp(app.player.x - app.canvas.width/2, 0, WORLD.w - app.canvas.width);
  app.camera.y = clamp(app.player.y - app.canvas.height/2, 0, WORLD.h - app.canvas.height);

  app.ownedWeapons.forEach(w=>{ if(w && typeof w.update==='function') w.update(w, dt, app); });

  for(let i=app.projectiles.length-1;i>=0;i--){ const p=app.projectiles[i]; p.x+=p.vx*dt; p.y+=p.vy*dt; p.life-=dt; if(p.x<0||p.y<0||p.x>WORLD.w||p.y>WORLD.h||p.life<=0){ app.projectiles.splice(i,1); continue; } }

  const stage=getDifficultyStage(app); app._spawnAccum=(app._spawnAccum||0)+dt*(1+app.time.elapsed/150)*(1+stage*0.25); while(app._spawnAccum>1){ spawnEnemy(app); app._spawnAccum-=1; }
  if(app.time.elapsed>=app._bossNext){ const aliveBoss = app.enemies.some(e=>e.miniboss); if(!aliveBoss){ spawnMiniBoss(app); app._bossNext += 120; } }

  app.enemies.forEach(e=>{ e.t=(e.t||0)+dt; const dx=app.player.x-e.x, dy=app.player.y-e.y; const d=Math.hypot(dx,dy)||1; e.x+=(dx/d)*e.speed*dt; e.y+=(dy/d)*e.speed*dt; });

  for(let i=app.projectiles.length-1;i>=0;i--){ const p=app.projectiles[i]; let hit=false; for(let j=app.enemies.length-1;j>=0;j--){ const e=app.enemies[j]; const dx=p.x-e.x, dy=p.y-e.y; if(dx*dx+dy*dy<(p.r+e.r)*(p.r+e.r)){ let dmg=p.damage; let shown=0; /* boss shields */ if(e.miniboss && e.shield2 && e.shield2>0){ const take=Math.min(dmg, e.shield2); e.shield2-=take; dmg-=take; shown+=take; } if(dmg>0){ e.hp-=dmg; shown+=dmg; } app.stats.damageDealt += shown; hit=true; app.dmgTexts.push({x:e.x, y:e.y - e.r, val: Math.round(shown), t:0}); if((e.hp>0)||(e.shield2&&e.shield2>0)){ e.hitFlash=0.08; } p._pen = (p._pen ?? (app.meta.pen||0)); if(p._pen>0){ p._pen--; continue; } else { app.projectiles.splice(i,1); i--; } break; } } if(p.type==='gauss' && hit){ /* gauss obeys same pen already handled */ } }

  for(let j=app.enemies.length-1;j>=0;j--){ const e=app.enemies[j]; if(e.hp<=0){ const isBoss=!!e.miniboss; app.enemies.splice(j,1); dropAfterKill(app,e.x,e.y,e.type, isBoss); } }

  app.enemies.forEach(e=>{ const dx=app.player.x-e.x, dy=app.player.y-e.y; if(dx*dx+dy*dy<(app.player.r+e.r)*(app.player.r+e.r)){ if(app.player.invuln<=0){ const hullFactor = app.chosenShip.hpMul * (1 + app.meta.hp*0.02); const touch = Math.max(1, Math.round(e.touch * 1.3 / hullFactor)); app.player.hp-=touch; app.player.invuln=0.6; SFX.hit(app); if(app.player.hp<=0){ app.player.alive=false; app.endRun(false); } } const d=Math.hypot(dx,dy)||1; e.x-=(dx/d)*12; e.y-=(dy/d)*12; } });
  // update damage texts
  for(let i=app.dmgTexts.length-1;i>=0;i--){ const d=app.dmgTexts[i]; d.t+=dt; d.y -= 18*dt; if(d.t>0.55) app.dmgTexts.splice(i,1); }


  app.orbs.forEach(o=>{ const dx=app.player.x-o.x, dy=app.player.y-o.y; const d=Math.hypot(dx,dy)||1; const mag=140+app.player.level*2; if(d<mag){ o.vx+=(dx/d)*220*dt; o.vy+=(dy/d)*220*dt; } o.x+=o.vx*dt; o.y+=o.vy*dt; o.vx*=0.92; o.vy*=0.92; if(d<app.player.r+o.r+4){ app.gainExp(o.exp); o._c=true; SFX.exp(app); } }); for(let i=app.orbs.length-1;i>=0;i--) if(app.orbs[i]._c) app.orbs.splice(i,1);

  app._pickupAccum=(app._pickupAccum||0)+dt; if(app._pickupAccum>5){ app._pickupAccum=0; if(Math.random()<0.3){ app.pickups.push({x:rand(64,WORLD.w-64),y:rand(64,WORLD.h-64),r:8,kind:'gold',amount: randInt(4,11)}); } if(Math.random()<0.15){ app.pickups.push({x:rand(64,WORLD.w-64),y:rand(64,WORLD.h-64),r:10,kind:'pizza',heal:24}); } }
  for(let i=app.pickups.length-1;i>=0;i--){ const p=app.pickups[i]; const dx=app.player.x-p.x, dy=app.player.y-p.y; if(dx*dx+dy*dy<(app.player.r+p.r)*(app.player.r+p.r)){ if(p.kind==='gold'){ app.player.gold+=p.amount; SFX.gold(app);} else if(p.kind==='pizza'){ app.player.hp=Math.min(app.player.maxHp, app.player.hp+p.heal); SFX.food(app);} else if(p.kind==='chest'){ SFX.level(app); app.ui.levelUpTitle.textContent='Beutegut!'; if(app.showLevelUp) app.showLevelUp(); else if(app.ui && app.ui.showLevelUp) app.ui.showLevelUp(); } app.pickups.splice(i,1); } }

  for(let i=app.beamArcs.length-1;i>=0;i--){ app.beamArcs[i].life-=dt; if(app.beamArcs[i].life<=0) app.beamArcs.splice(i,1); }

  app.updateHUD();
}
