import { SHIPS, PARAM_KEYS } from './config.js';
import { drawShipPreview } from './render.js';
import { addWeapon, applyAdminConfigToDefs, WeaponDefs } from './weapons.js';
import { clamp } from './state.js';
import { SFX } from './audio.js';

export function hookUI(app){
  const qs = id => document.getElementById(id);

  // HUD
  const hpfill=qs('hpfill'), hptext=qs('hptext'), expfill=qs('expfill'), lvlEl=qs('lvl'), goldEl=qs('gold'), timerEl=qs('timer');

  // Menus / overlays
  const mainMenu=qs('mainmenu'), btnStart=qs('btnStart'), btnShop=qs('btnShop'), btnSettings=qs('btnSettings'), btnAdmin=qs('btnAdmin'), btnTesting=qs('btnTesting');
  const heroSelect=qs('heroselect'), heroCards=qs('heroCards'), cancelHero=qs('cancelHero');
  const shop=qs('shop'), buyHp=qs('buyHp'), buySpd=qs('buySpd'), buyDmg=qs('buyDmg'), closeShop=qs('closeShop'), costHp=qs('costHp'), costSpd=qs('costSpd'), costDmg=qs('costDmg');
  const settings=qs('settings'), closeSettings=qs('closeSettings'), volume=qs('volume'), volLabel=qs('volLabel');
  const admin=qs('admin'), adminWeapons=qs('adminWeapons'), applyNowCb=qs('applyNow'), saveAdminBtn=qs('saveAdmin'), resetAdminBtn=qs('resetAdmin'), closeAdminBtn=qs('closeAdmin'); const testing=qs('testing'), testEnemyType=qs('testEnemyType'), testCount=qs('testCount'), testSpeed=qs('testSpeed'), testHp=qs('testHp'), testTouch=qs('testTouch'), testShield2=qs('testShield2'), btnSpawn=qs('btnSpawn'), closeTesting=qs('closeTesting');

  const levelUpOverlay=qs('levelup'), choicesEl=qs('choices'), levelUpTitle=qs('levelupTitle'), skipBtn=qs('skip');
  const gameOverOverlay=qs('gameover'), gameOverTitle=qs('gameoverTitle'), summaryEl=qs('summary'), restartBtn=qs('restart'), backToMenuBtn=qs('backToMenu');

  // Pause + stats
  const pauseOverlay=qs('pause'), btnResume=qs('btnResume'), btnGiveUp=qs('btnGiveUp');
  const tblPilot=qs('tblPilot'), tblShip=qs('tblShip'), tblWeapons=qs('tblWeapons'), tblRun=qs('tblRun');

  // Shop extras
  const pilotAvatar=qs('pilotAvatar'), creditsShopEl=qs('creditsShop');
  const buyPen=qs('buyPen'), buySize=qs('buySize'), costPen=qs('costPen'), costSize=qs('costSize');
  const btnTierHp=qs('btnTierHp'), btnTierSpd=qs('btnTierSpd'), btnTierDmg=qs('btnTierDmg'), btnTierPen=qs('btnTierPen'), btnTierSize=qs('btnTierSize');

  const show = el=> el && (el.style.display='flex');
  const hide = el=> el && (el.style.display='none');

  function updateHUD(){
    hpfill.style.width = `${(app.player.hp/app.player.maxHp)*100}%`;
    hptext.textContent = `${Math.max(0,Math.floor(app.player.hp))}/${app.player.maxHp}`;
    const pct = clamp(app.player.exp/app.player.expToNext,0,1); expfill.style.width = `${pct*100}%`;
    lvlEl.textContent = app.player.level; goldEl.textContent = app.player.gold;
    const m=Math.floor(app.time.left/60), s=Math.floor(app.time.left%60); timerEl.textContent=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  app.updateHUD=updateHUD;

  function expNeededFor(level){ return Math.floor(12 * Math.pow(1.22, level-1)); }
  function gainExp(amount){
    app.player.exp+=amount;
    while(app.player.exp>=app.player.expToNext){
      app.player.exp-=app.player.expToNext;
      app.player.level++;
      app.player.expToNext=expNeededFor(app.player.level);
      SFX.level(app);
      showLevelUp();
    }
  }
  app.gainExp=gainExp;

  function endRun(won){
    app.time.paused=true; app.state='gameover';
    gameOverTitle.textContent=won?'Gewonnen!':'Game Over';
    const bonus=won?50:10; app.player.gold+=bonus;
    summaryEl.innerHTML=`Zeit: ${(5*60 - Math.floor(app.time.left))}s · Level ${app.player.level} · Credits +${bonus}`;
    show(gameOverOverlay); if(won) SFX.win(app); else SFX.lose(app);
  }
  app.endRun=endRun;

  function newRun(){
    app.enemies.length=0; app.orbs.length=0; app.pickups.length=0; app.projectiles.length=0; app.beamArcs.length=0;
    app.time.elapsed=0; app.time.left=5*60; app.time.paused=false; app.state='playing';
    app.player.level=1; app.player.exp=0; app.player.expToNext=12; app.player.alive=true; app.player.invuln=0; app.player.facing=0;
    app._runStartGold = app.player.gold; app.stats = { damageDealt: 0 };
    app.runMods = { speedMult: 1.0 };

    // compute with pilot skills (2% per tier)
    app.meta.hp=app.meta.hp||0; app.meta.spd=app.meta.spd||0; app.meta.dmg=app.meta.dmg||0; app.meta.pen=app.meta.pen||0; app.meta.size=app.meta.size||0;

    const maxHp = Math.round(app.player.base.baseMaxHp * app.chosenShip.hpMul * (1 + app.meta.hp*0.02));
    const speed = app.player.base.baseSpeed * app.chosenShip.speedMul * (1 + app.meta.spd*0.02);
    app.player.maxHp=maxHp; app.player.hp=maxHp; app.player.speed=speed;
    app.player.dmgMul=app.chosenShip.dmgMul * (1 + app.meta.dmg*0.02);

    app.ownedWeapons.length=0; addWeapon(app,'blaster');

    hide(mainMenu); hide(heroSelect); hide(shop); hide(settings); levelUpOverlay.style.display='none'; hide(admin); hide(gameOverOverlay); hide(pauseOverlay);
    updateHUD(); refreshShop();
  }
  app.newRun=newRun;

  // Main menu
  btnStart.addEventListener('click', ()=>{ app.state='hero'; buildHeroCards(); show(heroSelect); hide(mainMenu); });
  btnShop.addEventListener('click', ()=>{ app.state='menu'; refreshShop(); show(shop); hide(mainMenu); });
  btnSettings.addEventListener('click', ()=>{ app.state='menu'; show(settings); hide(mainMenu); });
  btnAdmin.addEventListener('click', ()=>{ app.state='menu'; buildAdminUI(); show(admin); hide(mainMenu); });
    btnTesting.addEventListener('click', ()=>{ app.state='menu'; show(testing); hide(mainMenu); });
  closeShop.addEventListener('click', ()=>{ hide(shop); show(mainMenu); });
  closeSettings.addEventListener('click', ()=>{ hide(settings); show(mainMenu); });
  closeAdminBtn.addEventListener('click', ()=>{ hide(admin); show(mainMenu); });

  if(restartBtn) restartBtn.addEventListener('click', ()=>{ newRun(); });
  if(backToMenuBtn) backToMenuBtn.addEventListener('click', ()=>{ hide(gameOverOverlay); show(mainMenu); app.state='menu'; });

  function buildHeroCards(){
    heroCards.innerHTML='';
    SHIPS.forEach(h=>{
      const c=document.createElement('div'); c.className='card';
      const id = 'prev_'+h.key;
      c.innerHTML = `<div class="h2">${h.name}</div>
        <canvas id="${id}" width="160" height="100" style="background:#0b1224;border-radius:8px;margin:6px 0;"></canvas>
        <div class="muted">${h.desc}</div>
        <div class="muted">Hull x${h.hpMul} · Schub x${h.speedMul} · Damage x${h.dmgMul}${h.fireRateMul? ' · ROF x'+h.fireRateMul : ''}</div>
        <div style="margin-top:8px;"><button class="btn">Wählen</button></div>`;
      c.querySelector('button').addEventListener('click', ()=>{ app.chosenShip=h; hide(heroSelect); newRun(); });
      heroCards.appendChild(c);
      const cv = c.querySelector('#'+id); const cx = cv.getContext('2d');
      cx.fillStyle='#0b1224'; cx.fillRect(0,0,cv.width,cv.height);
      drawShipPreview(cx, h.key, cv.width/2, cv.height/2, 1.4);
    });
  }
  cancelHero.addEventListener('click', ()=>{ hide(heroSelect); show(mainMenu); app.state='menu'; });

  // Shop
  function drawPilotAvatar(){
    if(!pilotAvatar) return; const c=pilotAvatar.getContext('2d'); const w=pilotAvatar.width, h=pilotAvatar.height;
    c.clearRect(0,0,w,h); c.fillStyle='#0b1224'; c.fillRect(0,0,w,h);
    // helmet
    c.fillStyle='#b1c7ff'; c.beginPath(); c.arc(w/2, h/2, 30, 0, Math.PI*2); c.fill();
    c.fillStyle='#2de0ff'; c.beginPath(); c.arc(w/2+6, h/2, 14, 0, Math.PI*2); c.fill();
    c.fillStyle='#6b7eb8'; c.fillRect(w/2-30, h/2+18, 60, 10);
  }
  const clamp10=(x)=> Math.max(0, Math.min(10, x));
  const clamp3=(x)=> Math.max(0, Math.min(3, x));
  function refreshShop(){
    app.meta.hp=app.meta.hp||0; app.meta.spd=app.meta.spd||0; app.meta.dmg=app.meta.dmg||0; app.meta.pen=app.meta.pen||0; app.meta.size=app.meta.size||0;
    const cost=(b,l,f)=> Math.round(b*Math.pow(f,l));
    // steeper +20%
    costHp.textContent = app.meta.hp>=10 ? '—' : cost(144, app.meta.hp, 1.35);
    costSpd.textContent = app.meta.spd>=10 ? '—' : cost(180, app.meta.spd, 1.35);
    costDmg.textContent = app.meta.dmg>=10 ? '—' : cost(216, app.meta.dmg, 1.35);
    if(costPen) costPen.textContent = app.meta.pen>=3 ? '—' : cost(264, app.meta.pen, 1.6);
    if(costSize) costSize.textContent = app.meta.size>=10 ? '—' : cost(168, app.meta.size, 1.3);
    if(btnTierHp) btnTierHp.textContent = `${clamp10(app.meta.hp)}/10`;
    if(btnTierSpd) btnTierSpd.textContent = `${clamp10(app.meta.spd)}/10`;
    if(btnTierDmg) btnTierDmg.textContent = `${clamp10(app.meta.dmg)}/10`;
    if(btnTierPen) btnTierPen.textContent = `${clamp3(app.meta.pen)}/3`;
    if(btnTierSize) btnTierSize.textContent = `${clamp10(app.meta.size)}/10`;
    if(creditsShopEl) creditsShopEl.textContent = app.player.gold;
    drawPilotAvatar();
  }
  app.refreshShop = refreshShop;

  buyHp.addEventListener('click', ()=>{
    if(app.meta.hp>=10){ SFX.denied(app); return; }
    const costVal = Math.round(144*Math.pow(1.35, app.meta.hp));
    if(app.player.gold>=costVal){ app.player.gold-=costVal; app.meta.hp++; SFX.cash(app); refreshShop(); app.updateHUD(); } else SFX.denied(app);
  });
  buySpd.addEventListener('click', ()=>{
    if(app.meta.spd>=10){ SFX.denied(app); return; }
    const costVal = Math.round(180*Math.pow(1.35, app.meta.spd));
    if(app.player.gold>=costVal){ app.player.gold-=costVal; app.meta.spd++; SFX.cash(app); refreshShop(); app.updateHUD(); } else SFX.denied(app);
  });
  buyDmg.addEventListener('click', ()=>{
    if(app.meta.dmg>=10){ SFX.denied(app); return; }
    const costVal = Math.round(216*Math.pow(1.35, app.meta.dmg));
    if(app.player.gold>=costVal){ app.player.gold-=costVal; app.meta.dmg++; SFX.cash(app); refreshShop(); app.updateHUD(); } else SFX.denied(app);
  });
  if(buyPen) buyPen.addEventListener('click', ()=>{
    if(app.meta.pen>=3){ SFX.denied(app); return; }
    const costVal = Math.round(264*Math.pow(1.6, app.meta.pen));
    if(app.player.gold>=costVal){ app.player.gold-=costVal; app.meta.pen++; SFX.cash(app); refreshShop(); app.updateHUD(); } else SFX.denied(app);
  });
  if(buySize) buySize.addEventListener('click', ()=>{
    if(app.meta.size>=10){ SFX.denied(app); return; }
    const costVal = Math.round(168*Math.pow(1.3, app.meta.size));
    if(app.player.gold>=costVal){ app.player.gold-=costVal; app.meta.size++; SFX.cash(app); refreshShop(); app.updateHUD(); } else SFX.denied(app);
  });

  // Settings
  volume.addEventListener('input', ()=>{ app.sfxVolume=parseFloat(volume.value)||0; volLabel.textContent=`${Math.round(app.sfxVolume*100)}%`; });

  // Level up
  skipBtn.addEventListener('click', ()=>{ levelUpOverlay.style.display='none'; app.time.paused=false; app.state='playing'; });

  function weaponUpgradeChoices(){
    const choices=[];
    // random new weapon until 3
    if(app.ownedWeapons.length<3){
      const avail=Object.keys(WeaponDefs).filter(k=> !app.ownedWeapons.find(w=>w.key===k));
      if(avail.length){ const pick=avail[Math.floor(Math.random()*avail.length)]; choices.push({kind:'newWeapon', key:pick, label:`Neue Waffe: ${WeaponDefs[pick].name}`}); }
    }
    // upgrades for owned
    app.ownedWeapons.forEach(w=>{
      const pool=w.upgradePool && w.upgradePool.filter(u=>!u.cond || u.cond(w));
      if(pool && pool.length){
        const u=pool[Math.floor(Math.random()*pool.length)];
        choices.push({kind:'upgradeWeapon', target:w.key, label:`${w.name}: ${u.name}`, apply:()=>u.apply(w)});
      }
    });
    // per-weapon penetration (cap 3)
    app.ownedWeapons.forEach(w=>{
      w.penBonus = w.penBonus||0;
      if(w.penBonus<3){
        choices.push({kind:'upgradeWeapon', target:w.key, label:`Durchschlag (+1) – ${w.name}`, apply:()=>{ w.penBonus++; }});
      }
    });
    // run speed boost
    choices.push({kind:'meta', label:'Triebwerke boosten (+10% Speed)', apply:()=> { app.player.speed*=1.1; app.runMods.speedMult = (app.runMods.speedMult||1)*1.1; }});
    // small heal
    choices.push({kind:'meta', label:'Nanorepair (+20 HP)', apply:()=> app.player.hp=Math.min(app.player.maxHp, app.player.hp+20)});
    // shuffle & take 3
    return choices.sort(()=>Math.random()-0.5).slice(0,3);
  }

  function showLevelUp(){
    app.time.paused=true; app.state='paused'; levelUpOverlay.style.display='flex'; choicesEl.innerHTML='';
    const opts=weaponUpgradeChoices();
    opts.forEach(opt=>{
      const b=document.createElement('button'); b.className='choice'; b.innerHTML=`<b>${opt.label}</b>`;
      b.addEventListener('click', ()=>{
        if(opt.kind==='newWeapon'){ addWeapon(app,opt.key); }
        else if(opt.kind==='upgradeWeapon'){ opt.apply(); const w=app.ownedWeapons.find(x=>x.key===opt.target); if(w){ w.level=(w.level||1)+1; } }
        else { opt.apply(); }
        levelUpOverlay.style.display='none'; app.time.paused=false; app.state='playing';
      });
      choicesEl.appendChild(b);
    });
  }
  app.showLevelUp=showLevelUp;
  app.ui = { show, hide, mainMenu, levelUpTitle, showLevelUp };

  // Admin
  function buildAdminUI(){
    adminWeapons.innerHTML='';
    Object.keys(WeaponDefs).forEach(key=>{
      const def=WeaponDefs[key]; const card=document.createElement('div'); card.className='card';
      const title = `<div class="h2">${def.name}</div>`;
      const fields = PARAM_KEYS.map(p=>{ const val = typeof def[p]==='number'? def[p] : ''; return `<label class="muted" style="display:block;margin:6px 0;">${p}: <input data-weap="${key}" data-prop="${p}" type="number" step="0.01" value="${val}" style="width:120px;"/></label>`; }).join('');
      card.innerHTML=title+fields; adminWeapons.appendChild(card);
    });
  }
  resetAdminBtn.addEventListener('click', ()=>{
    Object.keys(app.factoryWeaponSnapshot||{}).forEach(k=>{ Object.keys(app.factoryWeaponSnapshot[k]).forEach(p=>{ WeaponDefs[k][p]=app.factoryWeaponSnapshot[k][p]; }); });
    buildAdminUI();
  });
  saveAdminBtn.addEventListener('click', ()=>{
    const cfg={}; adminWeapons.querySelectorAll('input[data-weap][data-prop]').forEach(inp=>{ const w=inp.getAttribute('data-weap'); const p=inp.getAttribute('data-prop'); const v=parseFloat(inp.value); if(!cfg[w]) cfg[w]={}; if(!isNaN(v)) cfg[w][p]=v; });
    applyAdminConfigToDefs(cfg);
    if(applyNowCb.checked){
      app.ownedWeapons.forEach(w=>{ const def=WeaponDefs[w.key]; if(!def) return; PARAM_KEYS.forEach(p=>{ if(typeof def[p]==='number') w[p]=def[p]; }); });
    }
    buildAdminUI();
  });
  app.buildAdminUI=buildAdminUI;

  // Pause controls
  window.addEventListener('keydown', (e)=>{
    if(e.key==='Escape'){
      if(app.state==='playing'){ app.state='paused'; show(pauseOverlay); renderPauseStats(); }
      else if(app.state==='paused'){ app.state='playing'; hide(pauseOverlay); }
    }
  });
  if(btnResume) btnResume.addEventListener('click', ()=>{ app.state='playing'; hide(pauseOverlay); });
  if(btnGiveUp) btnGiveUp.addEventListener('click', ()=>{
    const earned = Math.max(0, app.player.gold - (app._runStartGold||0));
    const loss = Math.floor(earned * 0.5);
    app.player.gold -= loss;
    hide(pauseOverlay); app.state='menu'; show(mainMenu); SFX.lose(app);
  });

  // Hover tick sound
  document.body.addEventListener('mouseover', (e)=>{
    const t=e.target;
    if(t.classList && (t.classList.contains('btn')||t.classList.contains('choice'))){
      try{ SFX.uiHover(app);}catch{}
    }
  }, true);

  // ===== Pause stats =====
  function pct(x){ return `${Math.round(x*100)}%`; }
  function renderPauseStats(){
    try{
      if(!tblPilot||!tblShip||!tblWeapons) return;
      // Pilot table (Pen NUR Shop/meta.pen)
      const hpTier = app.meta.hp||0, spdTier=app.meta.spd||0, dmgTier=app.meta.dmg||0, penTier=app.meta.pen||0, sizeTier=app.meta.size||0;
      tblPilot.innerHTML = `<table class="stats"><tr><th>Skill</th><th>Stufe</th><th>Bonus</th></tr>
        <tr><td>Hull</td><td>${hpTier}/10</td><td><span class="plusBonus">+${hpTier*2}%</span></td></tr>
        <tr><td>Speed</td><td>${spdTier}/10</td><td><span class="plusBonus">+${spdTier*2}%</span></td></tr>
        <tr><td>Damage</td><td>${dmgTier}/10</td><td><span class="plusBonus">+${dmgTier*2}%</span></td></tr>
        <tr><td>Durchschlag (Pilot)</td><td>${penTier}/3</td><td><span class="plusBonus">+${penTier}</span></td></tr>
        <tr><td>Projektilgröße</td><td>${sizeTier}/10</td><td><span class="plusBonus">+${sizeTier*5}%</span></td></tr>
      </table>`;

      // Ship table
      const base = app.player.base; const ship = app.chosenShip;
      const pilotHp = (hpTier*0.02), pilotSpd=(spdTier*0.02), pilotDmg=(dmgTier*0.02);
      const runSpd = (app.runMods?.speedMult||1) - 1;
      const baseHpPts = base.baseMaxHp * ship.hpMul;
      const baseSpdPts = Math.round(base.baseSpeed * ship.speedMul);
      const baseDmgMul = ship.dmgMul;
      const effHp = Math.round(base.baseMaxHp * ship.hpMul * (1+pilotHp));
      const effSpd = Math.round(base.baseSpeed * ship.speedMul * (1+pilotSpd) * (1+runSpd));
      const effDmgMul = +(ship.dmgMul * (1+pilotDmg)).toFixed(2);
      tblShip.innerHTML = `<table class="stats">
        <tr><th>Attribut</th><th>Base</th><th>Pilot-Bonus</th><th>Run-Bonus</th><th>Effektiv</th></tr>
        <tr><td>Hull (HP)</td><td>${Math.round(baseHpPts)}</td><td><span class="plusBonus">+${Math.round(baseHpPts*pilotHp)}</span></td><td>—</td><td>${effHp}</td></tr>
        <tr><td>Speed</td><td>${baseSpdPts}</td><td><span class="plusBonus">+${Math.round(baseSpdPts*pilotSpd)}</span></td><td><span class="plusBonus">${runSpd>0? '+'+Math.round(baseSpdPts*(runSpd)):'—'}</span></td><td>${effSpd}</td></tr>
        <tr><td>Damage-Mult</td><td>${baseDmgMul}×</td><td><span class="plusBonus">+${(baseDmgMul*pilotDmg).toFixed(2)}</span></td><td>—</td><td>${effDmgMul}×</td></tr>
        <tr><td>ROF (Ship)</td><td>${ship.fireRateMul? ship.fireRateMul.toFixed(2)+'×':'1.00×'}</td><td>—</td><td>—</td><td>${ship.fireRateMul? ship.fireRateMul.toFixed(2)+'×':'1.00×'}</td></tr>
      </table>`;

      // Weapons table (base + green bonus + Pen total)
      const pauseWeaponSnap = app.factoryWeaponSnapshot || {};
      const rows = [];
      app.ownedWeapons.forEach(w=>{
        const def = pauseWeaponSnap[w.key] || {};
        const lvlBonus = (w.level||1) - 1;
        const baseDmg = def.damage ?? w.damage;
        const bonusDmg = Math.max(0, Math.round(w.damage - baseDmg));
        const penTotal = (app.meta.pen||0) + (w.penBonus||0);
        rows.push(`<tr>
          <td>${w.name} Lv ${w.level||1} ${lvlBonus>0? `<span class="plusBonus">(+${lvlBonus})</span>`:''}</td>
          <td>${w.fireRate?.toFixed(2)||'—'}</td>
          <td>${baseDmg} ${bonusDmg>0? `<span class="plusBonus">(+${bonusDmg})</span>`:''}</td>
          <td>${w.count||1}</td>
          <td>${penTotal}</td>
        </tr>`);
      });
      tblWeapons.innerHTML = `<table class="stats">
        <tr><th>Waffe</th><th>Feuerrate (base)</th><th>DMG (base)</th><th>Projectiles</th><th>Pen</th></tr>
        ${rows.join('')}
      </table>`;

      // Run stats card
      if(tblRun){
        const dmg = app.stats?.damageDealt||0;
        const seconds = Math.floor(app.time.elapsed);
        tblRun.innerHTML = `<table class="stats">
          <tr><th>Gesamtschaden (Run)</th><td>${dmg}</td></tr>
          <tr><th>Spielzeit</th><td>${seconds}s</td></tr>
        </table>`;
      }
    }catch(e){ console.warn('renderPauseStats failed', e); }
  }
  // expose for external refresh if needed
  app.renderPauseStats = renderPauseStats;

  // Initial
  refreshShop();
}

    if(closeTesting) closeTesting.addEventListener('click', ()=>{ hide(testing); show(mainMenu); });
    if(btnSpawn) btnSpawn.addEventListener('click', ()=>{
      const type = testEnemyType.value;
      const n = Math.max(1, Math.min(300, parseInt(testCount.value||'1')));
      const speed = parseFloat(testSpeed.value||'120');
      const hp = parseFloat(testHp.value||'20');
      const touch = parseFloat(testTouch.value||'6');
      const shield2 = parseFloat(testShield2.value||'0');
      for(let i=0;i<n;i++){
        const ang = Math.random()*Math.PI*2;
        const dist = 300 + Math.random()*200;
        const x = Math.max(24, Math.min(app.world.w-24, app.player.x + Math.cos(ang)*dist));
        const y = Math.max(24, Math.min(app.world.h-24, app.player.y + Math.sin(ang)*dist));
        let e;
        if(type==='weak'){ e = {x,y,r:16,hp:hp, maxHp:hp, speed:speed, touch:touch, type:0, t:0}; }
        else if(type==='fast'){ e = {x,y,r:12,hp:hp, maxHp:hp, speed:speed, touch:touch, type:1, t:0}; }
        else if(type==='tank'){ e = {x,y,r:20,hp:hp, maxHp:hp, speed:speed, touch:touch, type:2, t:0}; }
        else if(type==='miniboss'){ e = {x,y,r:30,hp:hp, maxHp:hp, speed:speed, touch:touch, type:2, t:0, miniboss:true, shield2:shield2, shield2Max:shield2}; }
        else { e = {x,y,r:18,hp:hp, maxHp:hp, speed:speed, touch:touch, type:0, t:0, shield2:shield2, shield2Max:shield2}; }
        app.enemies.push(e);
      }
    });
    