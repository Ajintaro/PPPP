import { SFX } from './audio.js';

export const WeaponDefs = {
  blaster: {
    key:'blaster', name:'Pepperoni Blaster',
    fireRate:2.0, damage:6, speed:620, life:1.2, count:1, spread:0.28, pierce:0,
    update(w,dt,app){ w.cooldown-=dt; if(w.cooldown<=0){ fireBlaster(app,w); w.cooldown += 1/(w.fireRate * (app.chosenShip?.fireRateMul||1)); } },
    upgradePool:[
      { name:'+20% Feuerrate', apply:w=> w.fireRate*=1.2 },
      { name:'+1 Projektil (max 5)', cond:w=>w.count<5, apply:w=> w.count++ },
      { name:'+25% Projektilspeed', apply:w=> w.speed*=1.25 },
      { name:'+2 Schaden', apply:w=> w.damage+=2 },
      { name:'+30% Lebensdauer', apply:w=> w.life*=1.3 },
      { name:'+1 Durchschlag', apply:w=> w.pierce++ },
    ],
  },
  arcbeam: {
    key:'arcbeam', name:'Cheese Beam',
    fireRate:1.1, damage:12, arc:Math.PI/2, range:140,
    update(w,dt,app){ w.cooldown-=dt; if(w.cooldown<=0){ swingBeam(app,w); w.cooldown += 1/(w.fireRate * (app.chosenShip?.fireRateMul||1)); } },
    upgradePool:[
      { name:'+20% Feuerrate', apply:w=> w.fireRate*=1.2 },
      { name:'+20% Reichweite', apply:w=> w.range*=1.2 },
      { name:'+20% Bogen', apply:w=> w.arc*=1.2 },
      { name:'+3 Schaden', apply:w=> w.damage+=3 },
    ],
  },
  gauss: {
    key:'gauss', name:'Gauss Olive Cannon',
    fireRate:1.0, damage:15, speed:360, life:1.4, radius:12, pierce:0,
    update(w,dt,app){ w.cooldown-=dt; if(w.cooldown<=0){ fireGauss(app,w); w.cooldown += 1/(w.fireRate * (app.chosenShip?.fireRateMul||1)); } },
    upgradePool:[
      { name:'+20% Feuerrate', apply:w=> w.fireRate*=1.2 },
      { name:'+25% Radius', apply:w=> w.radius*=1.25 },
      { name:'+25% Projektilspeed', apply:w=> w.speed*=1.25 },
      { name:'+4 Schaden', apply:w=> w.damage+=4 },
      { name:'+30% Lebensdauer', apply:w=> w.life*=1.3 },
      { name:'+1 Durchschlag', apply:w=> w.pierce++ },
    ],
  },
  orbital: {
    key:'orbital', name:'Salami Orbit',
    fireRate:1.2, damage:8, radius:80, count:1, duration:5.0,
    update(w,dt,app){ 
      // Initialize orbital system if not done yet
      if(!w.orbitalsInitialized) {
        spawnOrbitalSet(app, w);
        w.orbitalsInitialized = true;
      }
      
      // Update existing orbital positions
      updateOrbitals(app, w, dt);
      
      // Ensure we have the right number of orbitals (in case some were lost)
      const currentOrbitals = app.projectiles.filter(p => p.type === 'orbital' && p.weaponKey === w.key).length;
      if(currentOrbitals !== w.count) {
        spawnOrbitalSet(app, w);
      }
    },
    upgradePool:[
      { name:'+20% Feuerrate', apply:w=> w.fireRate*=1.2 },
      { name:'+20% Radius', apply:w=> w.radius*=1.2 },
      { name:'+20% Dauer', apply:w=> w.duration*=1.2 },
      { name:'+1 Orbit', cond:w=>w.count<6, apply:w=> { w.count++; w.orbitalsInitialized = false; } },
      { name:'+2 Schaden', apply:w=> w.damage+=2 },
    ],
  },
  forcefield: {
    key:'forcefield', name:'Cheese Force Field',
    fireRate:1.0, damage:8, radius:80, tickInterval:0.6,
    update(w,dt,app){ 
      w.tickTimer = (w.tickTimer || 0) + dt;
      if(w.tickTimer >= w.tickInterval){
        w.tickTimer = 0;
        applyForceFieldDamage(app, w, dt);
      }
      
      // Keep persistent aura visible
      if(!app.forceFieldAura) {
        app.forceFieldAura = {
          x: app.player.x,
          y: app.player.y,
          radius: w.radius,
          active: true
        };
      } else {
        app.forceFieldAura.x = app.player.x;
        app.forceFieldAura.y = app.player.y;
        app.forceFieldAura.radius = w.radius;
      }
    },
    upgradePool:[
      { name:'+20% Radius', apply:w=> w.radius*=1.2 },
      { name:'-15% Tick-Intervall', apply:w=> w.tickInterval*=0.85 },
      { name:'+3 Schaden pro Tick', apply:w=> w.damage+=3 },
      { name:'+25% Radius', apply:w=> w.radius*=1.25 },
      { name:'-20% Tick-Intervall', apply:w=> w.tickInterval*=0.8 },
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
  const inst = { 
    key:def.key, 
    name:def.name, 
    fireRate:def.fireRate, 
    damage:def.damage, 
    speed:def.speed, 
    life:def.life,
    count:def.count, 
    spread:def.spread, 
    arc:def.arc, 
    range:def.range, 
    radius:def.radius,
    pierce:def.pierce || 0,
    tickInterval:def.tickInterval,
    update:def.update, 
    upgradePool:def.upgradePool, 
    cooldown:0, 
    level:1 
  };
  app.ownedWeapons.push(inst); return inst;
}

export function removeWeaponOrbitals(app, weaponKey) {
  // Remove all orbital projectiles belonging to a specific weapon
  app.projectiles = app.projectiles.filter(p => !(p.type === 'orbital' && p.weaponKey === weaponKey));
}
const dmg = (app, base)=> Math.round(base * app.player.dmgMul);
export function fireBlaster(app,w){
  for(let i=0;i<w.count;i++){
    // Improved V-shaped spread calculation
    let spreadAngle = 0;
    if(w.count > 1) {
      // Calculate spread angle based on projectile count
      const totalSpread = w.spread || 0.28; // Default ~16 degrees
      const angleStep = totalSpread / (w.count - 1);
      spreadAngle = (i - (w.count - 1) / 2) * angleStep;
    }
    
    const finalAngle = app.player.facing + spreadAngle;
    
    app.projectiles.push({ 
      type:'blaster', 
      r:Math.max(2, Math.round(3*(1+ (app.meta.size||0)*0.05))), 
      damage:dmg(app,w.damage), 
      life:w.life,
      pierceRem: (w.pierce || 0) + (app.meta.pen || 0),
      lastHitId: undefined,
      x: app.player.x + Math.cos(app.player.facing)*app.player.r*0.8,
      y: app.player.y + Math.sin(app.player.facing)*app.player.r*0.8,
      vx: Math.cos(finalAngle)*w.speed, 
      vy: Math.sin(finalAngle)*w.speed 
    });
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
  app.projectiles.push({ 
    type:'gauss', 
    r:Math.round(w.radius*(1+ (app.meta.size||0)*0.05)), 
    damage:dmg(app,w.damage), 
    life:w.life,
    pierceRem: (w.pierce || 0) + (app.meta.pen || 0),
    lastHitId: undefined,
    x: app.player.x + Math.cos(app.player.facing)*app.player.r*0.8,
    y: app.player.y + Math.sin(app.player.facing)*app.player.r*0.8,
    vx: Math.cos(app.player.facing)*w.speed, 
    vy: Math.sin(app.player.facing)*w.speed 
  });
  SFX.gauss(app);
}

export function spawnOrbitalSet(app,w){
  // Clear existing orbital projectiles for this weapon
  app.projectiles = app.projectiles.filter(p => p.weaponKey !== w.key);
  
  // Spawn new orbital set
  for(let i = 0; i < w.count; i++) {
    const angle = (i / w.count) * Math.PI * 2;
    const radius = w.radius;
    
    app.projectiles.push({ 
      type:'orbital', 
      weaponKey: w.key, // Track which weapon owns this orbital
      r:Math.round(8*(1+ (app.meta.size||0)*0.05)), 
      damage:dmg(app,w.damage), 
      life:999999, // Orbitals don't expire, they're managed by the weapon
      angle: angle,
      radius: radius,
      speed: 2.0, // Rotation speed
      x: app.player.x + Math.cos(angle) * radius,
      y: app.player.y + Math.sin(angle) * radius,
      vx: 0, 
      vy: 0 
    });
  }
  SFX.orbital(app);
}

export function updateOrbitals(app, w, dt){
  // Update positions of existing orbital projectiles for this weapon
  app.projectiles.forEach(p => {
    if(p.type === 'orbital' && p.weaponKey === w.key) {
      // Update rotation angle
      p.angle += p.speed * dt;
      
      // Update radius based on current weapon radius
      p.radius = w.radius;
      
      // Update position around player
      p.x = app.player.x + Math.cos(p.angle) * p.radius;
      p.y = app.player.y + Math.sin(p.angle) * p.radius;
      
      // Update damage based on current weapon damage
      p.damage = dmg(app, w.damage);
    }
  });
}

// Keep the old function for backward compatibility if needed
export function spawnOrbital(app,w){
  spawnOrbitalSet(app, w);
}

export function applyForceFieldDamage(app, w, dt){
  const radius = w.radius;
  const damage = dmg(app, w.damage);
  
  app.enemies.forEach(e => {
    const dx = e.x - app.player.x;
    const dy = e.y - app.player.y;
    const distance = Math.sqrt(dx*dx + dy*dy);
    
    if(distance <= radius + e.r){
      // Check if enemy has hit cooldown
      if(!e.forceFieldHitTimer || e.forceFieldHitTimer <= 0){
        e.hp -= damage;
        e.forceFieldHitTimer = w.tickInterval; // Set cooldown
        
        // Visual feedback
        app.dmgTexts.push({
          x: e.x, 
          y: e.y - e.r, 
          val: Math.round(damage), 
          t: 0
        });
        
        // Add to stats
        app.stats.damageDealt += damage;
        
        // Push effect
        const pushForce = 20;
        const angle = Math.atan2(dy, dx);
        e.x += Math.cos(angle) * pushForce;
        e.y += Math.sin(angle) * pushForce;
      }
    }
  });
  
  // Update hit timers - use delta time instead of tickInterval
  app.enemies.forEach(e => {
    if(e.forceFieldHitTimer > 0){
      e.forceFieldHitTimer -= dt; // Use actual delta time
    }
  });
  
  // Visual effect - create a more visible pulse
  app.forceFieldPulse = {
    x: app.player.x,
    y: app.player.y,
    radius: radius,
    life: 0.3,
    maxLife: 0.3
  };
  
  SFX.forcefield(app);
}
