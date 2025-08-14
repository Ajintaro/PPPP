
# Pew Pew Pizza Pirates - Game Design Dokument (GDD)

## 1) Elevator Pitch & Vision
Arcadiger "Vampire Survivors"-Klon im Weltraum - aber albern & kulinarisch: **Peperoni-Blaster, Oliven-Gauss, K�se-Beam, Salami-Orbit**. 5-Minuten-Runs, stetige Wellen, **max. 3 Waffen gleichzeitig**, Level-Ups, Meta-Progress via **Pilot-Skills/Shop**. Zielplattform: **Steam (Windows, sp�ter macOS)**.

**USP:** charmant-absurde Food-Thematik, schnelle Runs, laute, lesbare Effekte, viele kleine "Aha"-Momente/Easter Eggs.

## 2) Zielgruppe & Platformen
- **Zielgruppe:** Fans von Survivors-Likes, Snack-Sessions (5-15 Min), Humor.
- **Plattformen:** Windows (Steam via Electron) prim�r, macOS sekund�r.
- **Eingaben:** Keyboard (WASD/Arrows, 1-3 Auswahl, ESC Pause), Maus f�r Men�s/Level-Up.

## 3) Core Gameplay Loop
1. Run starten  Schiff w�hlen (Startwaffe & Stats).  
2. K�mpfen & Ausweichen  Gegnerwellen eskalieren, XP-Orbs aufsammeln.  
3. **Level-Up**  3 zuf�llige Optionen (Upgrade/Neue Waffe, **per Waffe**).  
4. Drops  XP, Credits, Heal, **Truhe** (Mini-Boss garantiert).  
5. **Timer 5:00**  Win (Bonus-Credits) oder Ableben (teile Credits behalten).  
6. **Meta**  Pilot-Skills im Shop steigern (global), neue Schiffe/Erfolge.

## 4) Spielsysteme

### 4.1 Schiffe (Klassen)
- **Balanced**: 100% Speed, 100% DMG, 100% Hull, Rate 100%.
- **Swift**: 110% Speed, 90% DMG, 90% Hull.
- **Brute**: 80% Speed, 110% DMG, 110% Hull, Rate 90%.
- Sp�ter: weitere Schiffe/Perks (z. B. +1 Projektil f�r Pepperoni).

### 4.2 Waffen (gleichzeitig max. 3)
- **Pepperoni Blaster (Projectile)**  
  Geradeaus-Projektile; **Pierce** startet 0; Upgrades: DMG/Size/Rate/**+Projectiles**/**+Pierce**.  
  **Default-Rate:** **2 Schuss/s**. **V-Streuung** bei Multishot.
- **Cheese Beam (Beam/Kegel)**  
  Sehr kurzer **"Zap"** (<<0,5 s), **kein Pierce** (nie anbieten). Upgrades: DMG, Arc-Breite, Cooldown.
- **Olive Gauss (Projectile, slow, big)**  
  Langsamer dicker Schuss, **1 Schuss/s**, optional sp�ter Splash.
- **Salami Orbit (Orbital, sp�ter)**  
  1-6 rotierende Scheiben, Dauer 5 s (+20%/Lvl bis 5�), Radius upgradebar. **Kein Pierce**.

**Designregel:** **Pierce nur f�r Projectile** (Pepperoni, Gauss). Beam/Orbitals ausgeschlossen.

### 4.3 Upgrades & Level-Ups
- Bei Level-Up 3 Optionen aus Pool, u. a.:  
  **Per Waffe**  +20% Damage, +20% Fire Rate, +20% Projectile Size, **+1 Pierce (nur Projectile)**, **+1 Projectile (Multishot/V-Spread)**.  
  **Neue Waffe**, falls < 3 ausger�stet.
- **Waffen-Fokus:** Upgrade wirkt **nur** auf die angezeigte Waffe (UI zeigt Waffennamen).
- **XP-Kurve (Start):** Lvl _n_: `XP = 10 + 6�n + 2�n^2` (tunen).

### 4.4 Gegner & Wellen
- **Typen:** weak (viele, fragil), fast (schnell), tank (langsam, viel HP).
- **Schilde:** ab ~30 s grauer Ring; **Miniboss** mit gelbem Overshield + grauem Schild.
- **Miniboss:** alle **2:00** (Warn-SFX), droppt **Truhe** (Extra-Level-Up).
- **Skalierung:** Spawnrate, HP, DMG steigen �ber Zeit (Kurven pro Typ).

### 4.5 Schaden/Feedback
- **Hit-Flash**, **Schadenszahlen**.
- **Touch-Damage** skaliert gegen Hull (mehr Hull  weniger Schaden).
- **Pierce (Projectile):**  
  `pierceRem = (weapon.pierce || 0) + pilot.globalPenetration`  
  Bei **neuem** Trefferziel: `pierceRem -= 1`; Projektil bleibt, solange `pierceRem >= 0`; Remove bei `< 0`. `lastHitId` setzen, damit pro Frame nicht doppelt.

### 4.6 Drops
- XP-Orbs (zuverl�ssig), Credits, Food (Heal), Truhen (vom Miniboss garantiert).

### 4.7 Meta-Progress (Pilot & Shop)
- **Pilot-Skills (global):**  
  HP +10/Stufe (10�), Speed +2 %/Stufe (10�), Damage +2 %/Stufe (10�),  
  **Global Penetration** 0-3 (additiv), Projectile Size +5 %/Stufe (10�).  
- **Preise:** exponentiell steigend (~20 %/Stufe).  
- **Shop-UX:** Credits, Avatar, Hover-Outline, **Cash-SFX**, **Denied-SFX**.

### 4.8 Timer & Win/Fail
- Fix **5:00**  Win (Bonus-Credits); Aufgeben  -50 % Run-Credits.

## 5) UI/UX

### 5.1 Hauptmen�
**Spielen**, **Shop**, **Einstellungen**, **Beenden**; Version/Build unten rechts.

### 5.2 HUD (In-Run)
- Oben links: HP/Shield, XP-Leiste + Level.  
- Oben rechts: **Pause-Button** (+ ESC Pause).  
- Waffen-Panel (Slots 1-3): Name, Rate, DMG, Size, Pierce, Projectiles; Upgrades gr�n.

### 5.3 Level-Up-Dialog
- 3 **klickbare** Karten + **Hotkeys 1-3**.  
- Zeigt **Ziel-Waffe** + Upgrade klar an.  
- Kein Freeze; Maus-Hover Highlight; Klick w�hlt.

### 5.4 Pause-Men� (ESC)
Fortsetzen / Aufgeben / Einstellungen / **Beenden**; Musik-Mute/Volume.

## 6) Audio & SFX
WebAudio: shoot, beam zap, hit, exp, gold, food, level-up arpeggio, cash, denied, boss warning, win/lose.  
Musik (loop) mit Mute-Option; getrennte Slider (SFX/Music).

## 7) Assets & Pipeline
**Struktur:**
```
assets/
  sprites/ships/*.png
  sprites/enemies/*.png
  sprites/projectiles/*.png
  ui/*.png
  audio/sfx/*.mp3
  audio/music/*.mp3
  meta/assets.json        # Mapping & Metadaten
```
**assets.json (Beispiel):**
```json
{
  "projectiles": {
    "pepperoni": { "sprite": "sprites/projectiles/pepperoni.png", "radius": 4 }
  },
  "weapons": {
    "pepperoni": { "sfx": "audio/sfx/pepperoni_shoot.mp3" }
  }
}
```
**Lizenz:** nur Packs mit kommerzieller Nutzung; **CREDITS.md** pflegen.

## 8) Technik & Architektur (Monorepo)
```
PPPP-next/
  apps/
    game-web/            # Vite Frontend (auch f�r Electron UI)
  packages/
    core/                # Game-Logik (ECS-lite, TS)
    renderer-pixi/       # PixiJS-Renderer-Adapter
  assets/
  tools/
```
**World/ECS (Kern):**
```ts
interface World {
  time:number; paused:boolean;
  player: number | null;
  input: { up:boolean; down:boolean; left:boolean; right:boolean; fire:boolean; };
  pos: Map<number,{x:number,y:number}>;
  vel: Map<number,{x:number,y:number}>;
  circle: Map<number,{r:number}>;
  proj: Map<number,{owner:number,damage:number,pierceRem:number,lastHitId?:number}>;
  enemies: Set<number>;
  weapons: Map<number, Weapon[]>;
  xp:number; level:number; xpToNext:number;
  upgrades: { pending:boolean; options: UpgradeOption[] };
  debug: {
    spawnLine(n:number):void; spawnStaticRows(cfg:any):void;
    stopSpawn():void; startSpawn():void; setSpawnInterval(s:number):void;
    clearEnemies():void; givePierce(n:number):void; givePierceAll(n:number):void;
    fireOnce():void; listWeapons():void; toggleAutoFire():void;
    equipPepperoni():void; equipGauss():void; equipCheese():void;
  };
  update(dt:number): void;
}
```
**Weapon (Kern):**
```ts
interface Weapon {
  name:string;
  type:"projectile"|"beam"|"orbital";
  rate?:number; shots?:number; spread?:number;
  bulletDamage?:number; bulletRadius?:number; bulletSpeed?:number;
  pierce?:number;
  lastDir?:{x:number,y:number};
  auto?:boolean; autoFire?:boolean;
}
```
Renderer: PixiJS; Electron l�dt index.html; electron-builder (NSIS x64, Icon, optional Auto-Update).

Persistenz: LocalStorage (sp�ter optional Supabase Cloud Saves).

## 9) Balancing (Startwerte)
**Pepperoni:** rate **2/s**, damage 5, radius 4, speed 220, pierce 0, shots 1, spread 0.28 rad (~16�).  
**Gauss:** rate **1/s**, damage 15, radius 8, speed 140.  
**Cheese:** aktiv ca. **0.12 s**, cooldown ~0.9 s.

Gegner (Richtwerte):  
weak HP 8 / DMG 5 / Speed 60; fast HP 10 / DMG 7 / Speed 90; tank HP 30 / DMG 12 / Speed 40; miniboss HP 400 + Schilde.

## 10) QA, Debug & Tools
Konsole (Browser/Electron):
```js
world.debug.stopSpawn(); world.debug.clearEnemies();
world.debug.spawnStaticRows({ rows:[2,3,4,5], startX:260, startY:120, gapX:80, gapY:70 });
world.debug.givePierce(1); world.debug.listWeapons();
world.debug.toggleAutoFire(); world.debug.fireOnce();
```
**Pierce-Akzeptanztest:** Linie spawnen, Pierce +1  Projektil trifft **2 Ziele**, verschwindet nach dem 2. Treffer.

## 11) Achievements & Telemetrie (Steamworks)
Counters: `pepperoni_shots`, `kills_by_type`, `miniboss_kills`, `run_wins`, `time_played`.  
Beispiele: "Peperoni-Pate" (10 000 Sch�sse), "K�se-Schock" (1000 Beam-Treffer).  
Freischaltungen: neue Schiffe/Skins an Milestones.

## 12) Roadmap (kurz)
1. Stabilisieren (Pierce final, Level-Up-Klick, ESC-Pause/Beenden)  
2. HUD v2 (Waffenpanel, per-Waffe-Upgrades)  
3. Assets v1 (Sprites/SFX/Musik mit Lizenz)  
4. Achievements/Stats  Steamworks  
5. Admin/Studio (dev-only)  
6. Build/Release (electron-builder, Steam Depot)

## 13) Risiken & Leitplanken
- Lizenz: nur kommerziell nutzbare Packs; **CREDITS.md** pflegen.  
- Performanz: Pooling/OffscreenCanvas, Pixi-Batches.  
- Balancing: Debug-Spawns/Short-Runs 90-120 s.

## 14) Copilot-Hinweise (Do/Don't, Marker)
**Do:** Pierce nur f�r Projectile; Upgrades **per Waffe**; 1-3 Hotkeys & Klick.  
**Don't:** Pierce f�r Beam/Orbitals; keine globalen Upgrades (au�er Pilot-Shop).

**Markers:**
```ts
// TODO[COPILOT]: implement per-weapon upgrade application (rate, damage, size, pierce, multishot)
// TODO[COPILOT]: ensure Pepperoni multishot uses V-shaped spread (shots, spread radians)
// TODO[COPILOT]: block "pierce" option for non-projectile weapons in rollUpgrades()
```
## 15) Beispiel-Pseudocode (Pierce)
```ts
// Spawn (Projectile):
proj.set(p, {
  owner: player,
  damage: W.bulletDamage,
  pierceRem: (W.pierce ?? 0) + pilot.globalPenetration,
  lastHitId: undefined
});
// OnCollision:
if (enemy.id !== proj.lastHitId) {
  applyDamage(enemy, proj.damage);
  proj.pierceRem -= 1;
  proj.lastHitId = enemy.id;
  if (proj.pierceRem < 0) destroy(p);
}
```
