import { SFX } from './audio.js';

export const WeaponDefs = {
  blaster: {
    key:'blaster', name:'Pepperoni Blaster',
    fireRate:1.8, damage:8, speed:620, life:1.2, count:1, spread:0.10,
    update(w,dt,app){ w.cooldown-=dt; if(w.cooldown<=0){ fireBlaster(app,w); w.cooldown += 1/(w.fireRate * (app.chosenShip?.fireRateMul||1)); } },
    upgradePool:[
      { name:'+20% Feuerrate', apply:w=> w.fireRate*=1.2 },
      { name:'+1 Projektil (max 5)', cond:w=>w.count<5, apply:w=> w.count++ },
      { name:'+25% Projektilspeed', apply:w=> w.speed*=1.25 },
      { name:'+3 Schaden', apply:w=> w.damage+=3 },
      { name:'+30% Lebensdauer', apply:w=> w.life*=1.3 },
    ],
  },
  arcbeam: {
    key:'arcbeam', name:'Cheese Beam',
    fireRate:1.0, damage:14, arc:Math.PI/2, range:130,
    update(w,dt,app){ w.cooldown-=dt; if(w.cooldown<=0){ swingBeam(app,w); w.cooldown += 1/(w.fireRate * (app.chosenShip?.fireRateMul||1)); } },
    upgradePool:[
      { name:'+20% Feuerrate', apply:w=> w.fireRate*=1.2 },
      { name:'+20% Reichweite', apply:w=> w.range*=1.2 },
      { name:'+20% Bogen', apply:w=> w.arc*=1.2 },
      { name:'+4 Schaden', apply:w=> w.damage+=4 },
    ],
  },
  gauss: {
    key:'gauss', name:'Gauss Olive Cannon',
    fireRate:0.7, damage:20, speed:360, life:1.4, radius:12,
    update(w,dt,app){ w.cooldown-=dt; if(w.cooldown<=0){ fireGauss(app,w); w.cooldown += 1/(w.fireRate * (app.chosenShip?.fireRateMul||1)); } },
    upgradePool:[
      { name:'+20% Feuerrate', apply:w=> w.fireRate*=1.2 },
      { name:'+25% Radius', apply:w=> w.radius*=1.25 },
      { name:'+25% Projektilspeed', apply:w=> w.speed*=1.25 },
      { name:'+5 Schaden', apply:w=> w.damage+=5 },
      { name:'+30% Lebensdauer', apply:w=> w.life*=1.3 },
    ],
  }
};

export function snapshotFactory(app){
  app.factoryWeaponSnapshot={};
  const keys=['fireRate','damage','speed','life','count','spread','arc','range','radius'];
  Object.keys(WeaponDefs).forEach(k=>{
    app.factoryWeaponSnapshot[k]={}; keys.forEach(p=>{ if(typeof WeaponDefs[k][p]==='number') app.factoryWeaponSnapshot[k][p]=WeaponDefs[k][p]; });
  });
}
export function applyAdminConfigToDefs(cfg){ if(!cfg) return; Object.keys(cfg).forEach(k=>{ const def=WeaponDefs[k]; if(!def) return; Object.keys(cfg[k]).forEach(p=>{ if(p in def && typeof cfg[k][p]==='number') def[p]=cfg[k][p]; }); }); }

export function addWeapon(app, key){
  if(app.ownedWeapons.find(w=>w.key===key)) return null;
  const def = WeaponDefs[key]; if(!def) return null;
  const inst = { key:def.key, name:def.name, fireRate:def.fireRate, damage:def.damage, speed:def.speed, life:def.life,
    count:def.count, spread:def.spread, arc:def.arc, range:def.range, radius:def.radius,
    update:def.update, upgradePool:def.upgradePool, cooldown:0, level:1 };
  app.ownedWeapons.push(inst); return inst;
}
const dmg = (app, base)=> Math.round(base * app.player.dmgMul);
export function fireBlaster(app,w){
  for(let i=0;i<w.count;i++){
    const s = (w.count>1? (i-(w.count-1)/2)*w.spread : 0);
    app.projectiles.push({ type:'blaster', r:Math.max(2, Math.round(3*(1+ (app.meta.size||0)*0.05))), damage:dmg(app,w.damage), life:w.life,
      x: app.player.x + Math.cos(app.player.facing)*app.player.r*0.8,
      y: app.player.y + Math.sin(app.player.facing)*app.player.r*0.8,
      vx: Math.cos(app.player.facing+s)*w.speed, vy: Math.sin(app.player.facing+s)*w.speed });
  } SFX.blaster(app);
}
export function swingBeam(app,w){
  const ang=app.player.facing, half=w.arc/2;
  app.enemies.forEach(e=>{ const dx=e.x-app.player.x, dy=e.y-app.player.y; const d=Math.hypot(dx,dy);
    if(d < w.range + app.player.r){ const a=Math.atan2(dy,dx); const delta=Math.atan2(Math.sin(a-ang), Math.cos(a-ang));
      if(Math.abs(delta) <= half){ e.hp-=dmg(app,w.damage); const push=10; e.x+=Math.cos(ang)*push; e.y+=Math.sin(ang)*push; } } });
  app.beamArcs.push({x:app.player.x,y:app.player.y,ang,arc:w.arc,range:w.range,life:0.10}); SFX.beam(app);
}
export function fireGauss(app,w){
  app.projectiles.push({ type:'gauss', r:Math.round(w.radius*(1+ (app.meta.size||0)*0.05)), damage:dmg(app,w.damage), life:w.life,
    x: app.player.x + Math.cos(app.player.facing)*app.player.r*0.8,
    y: app.player.y + Math.sin(app.player.facing)*app.player.r*0.8,
    vx: Math.cos(app.player.facing)*w.speed, vy: Math.sin(app.player.facing)*w.speed });
  SFX.gauss(app);
}
