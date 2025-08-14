// Console Commands for Testing
// Press F12 to open browser console, then type commands like:
// help() - Show all available commands
// spawn('weak', 5) - Spawn 5 weak enemies
// giveWeapon('orbital') - Give orbital weapon
// setLevel(10) - Set player level to 10

let app = null;

export function initConsole(gameApp) {
  app = gameApp;
  
  // Make commands globally available
  window.help = help;
  window.spawn = spawn;
  window.giveWeapon = giveWeapon;
  window.setLevel = setLevel;
  window.addExp = addExp;
  window.setSpawnPaused = setSpawnPaused;
  window.killAll = killAll;
  window.giveGold = giveGold;
  window.setPlayerHp = setPlayerHp;
  window.upgradeWeapon = upgradeWeapon;
  window.spawnBoss = spawnBoss;
  window.setTime = setTime;
  window.givePowerup = givePowerup;
  window.giveShield = giveShield;
  
  console.log('🎮 Console Commands Loaded! Type help() for commands.');
}

function help() {
  console.log(`
🎮 PEW PEW PIZZA PIRATES - CONSOLE COMMANDS

ENEMY COMMANDS:
  spawn(type, count) - Spawn enemies
    Types: 'weak', 'fast', 'tank', 'miniboss'
    Example: spawn('weak', 10)
  
  spawnBoss() - Spawn a mini-boss
  killAll() - Kill all enemies

PLAYER COMMANDS:
  setLevel(level) - Set player level
  addExp(amount) - Add experience points
  giveGold(amount) - Give gold
  setPlayerHp(hp) - Set player HP
  setTime(seconds) - Set remaining time

WEAPON COMMANDS:
  giveWeapon(type) - Give weapon
    Types: 'blaster', 'arcbeam', 'gauss', 'orbital', 'forcefield'
  upgradeWeapon(type, upgrade) - Upgrade weapon
    Upgrades: 'damage', 'fireRate', 'count', 'radius', 'duration'

GAME COMMANDS:
  setSpawnPaused(paused) - Pause/resume enemy spawning
    Example: setSpawnPaused(true) - pause spawning
  givePowerup(type) - Give powerup
    Types: 'speed', 'damage', 'fireRate', 'pierce'
  giveShield(duration) - Give temporary shield

EXAMPLES:
  spawn('weak', 20)     // Spawn 20 weak enemies
  giveWeapon('orbital') // Give orbital weapon
  setLevel(15)          // Set level to 15
  setSpawnPaused(true)  // Pause enemy spawning
  `);
}

function spawn(type, count = 1) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to spawn enemies');
    return;
  }
  
  const types = {
    'weak': { r: 16, hp: 18, speed: 130, touch: 5, type: 0 },
    'fast': { r: 12, hp: 12, speed: 210, touch: 4, type: 1 },
    'tank': { r: 20, hp: 42, speed: 90, touch: 12, type: 2 },
    'miniboss': { r: 30, hp: 420, speed: 100, touch: 26, type: 2, miniboss: true, shield2: 260, shield2Max: 260 }
  };
  
  if (!types[type]) {
    console.log(`❌ Unknown enemy type: ${type}. Available: ${Object.keys(types).join(', ')}`);
    return;
  }
  
  for (let i = 0; i < count; i++) {
    const dist = 300 + Math.random() * 200;
    const ang = Math.random() * Math.PI * 2;
    const x = Math.max(24, Math.min(app.canvas.width - 24, app.player.x + Math.cos(ang) * dist));
    const y = Math.max(24, Math.min(app.canvas.height - 24, app.player.y + Math.sin(ang) * dist));
    
    const enemy = {
      x, y,
      r: types[type].r,
      hp: types[type].hp,
      maxHp: types[type].hp,
      speed: types[type].speed,
      touch: types[type].touch,
      type: types[type].type,
      t: 0,
      id: Date.now() + Math.random()
    };
    
    if (types[type].miniboss) {
      enemy.miniboss = true;
      enemy.shield2 = types[type].shield2;
      enemy.shield2Max = types[type].shield2Max;
    }
    
    app.enemies.push(enemy);
  }
  
  console.log(`✅ Spawned ${count} ${type} enemies`);
}

function giveWeapon(type) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to give weapons');
    return;
  }
  
  const availableWeapons = ['blaster', 'arcbeam', 'gauss', 'orbital', 'forcefield'];
  
  if (!availableWeapons.includes(type)) {
    console.log(`❌ Unknown weapon type: ${type}. Available: ${availableWeapons.join(', ')}`);
    return;
  }
  
  // Import the addWeapon function
  import('./weapons.js').then(module => {
    const result = module.addWeapon(app, type);
    if (result) {
      console.log(`✅ Gave weapon: ${result.name}`);
    } else {
      console.log(`❌ Already have weapon: ${type}`);
    }
  });
}

function setLevel(level) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to set level');
    return;
  }
  
  app.player.level = Math.max(1, level);
  app.player.exp = 0;
  app.player.expToNext = Math.floor(12 * Math.pow(1.22, app.player.level - 1));
  
  console.log(`✅ Set player level to ${level}`);
}

function addExp(amount) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to add exp');
    return;
  }
  
  app.gainExp(amount);
  console.log(`✅ Added ${amount} experience points`);
}

function setSpawnPaused(paused) {
  if (!app) {
    console.log('❌ Game not initialized');
    return;
  }
  
  app.spawnPaused = paused;
  console.log(`✅ Enemy spawning ${paused ? 'paused' : 'resumed'}`);
}

function killAll() {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to kill enemies');
    return;
  }
  
  const count = app.enemies.length;
  app.enemies.length = 0;
  console.log(`✅ Killed ${count} enemies`);
}

function giveGold(amount) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to give gold');
    return;
  }
  
  app.player.gold += amount;
  console.log(`✅ Gave ${amount} gold (total: ${app.player.gold})`);
}

function setPlayerHp(hp) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to set HP');
    return;
  }
  
  app.player.hp = Math.min(hp, app.player.maxHp);
  console.log(`✅ Set player HP to ${app.player.hp}/${app.player.maxHp}`);
}

function upgradeWeapon(type, upgrade) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to upgrade weapons');
    return;
  }
  
  const weapon = app.ownedWeapons.find(w => w.key === type);
  if (!weapon) {
    console.log(`❌ Don't have weapon: ${type}`);
    return;
  }
  
  const upgrades = {
    'damage': () => { weapon.damage += 2; },
    'fireRate': () => { weapon.fireRate *= 1.2; },
    'count': () => { weapon.count = Math.min(weapon.count + 1, 6); },
    'radius': () => { weapon.radius *= 1.2; },
    'duration': () => { weapon.duration *= 1.2; }
  };
  
  if (!upgrades[upgrade]) {
    console.log(`❌ Unknown upgrade: ${upgrade}. Available: ${Object.keys(upgrades).join(', ')}`);
    return;
  }
  
  upgrades[upgrade]();
  console.log(`✅ Upgraded ${weapon.name} ${upgrade}`);
}

function spawnBoss() {
  spawn('miniboss', 1);
}

function setTime(seconds) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to set time');
    return;
  }
  
  app.time.left = Math.max(0, seconds);
  console.log(`✅ Set time to ${seconds} seconds`);
}

function givePowerup(type) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to give powerups');
    return;
  }
  
  const powerups = {
    'speed': () => { app.player.speed *= 1.2; },
    'damage': () => { app.player.dmgMul *= 1.2; },
    'fireRate': () => { 
      app.ownedWeapons.forEach(w => w.fireRate *= 1.2);
    },
    'pierce': () => { app.meta.pen = (app.meta.pen || 0) + 1; }
  };
  
  if (!powerups[type]) {
    console.log(`❌ Unknown powerup: ${type}. Available: ${Object.keys(powerups).join(', ')}`);
    return;
  }
  
  powerups[type]();
  console.log(`✅ Applied powerup: ${type}`);
}

function giveShield(duration = 10) {
  if (!app || app.state !== 'playing') {
    console.log('❌ Game must be running to give shield');
    return;
  }
  
  app.player.shield = {
    active: true,
    duration: duration,
    maxDuration: duration
  };
  
  console.log(`✅ Gave shield for ${duration} seconds`);
}
