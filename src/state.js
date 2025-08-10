import { RUN_SECONDS } from './config.js';
export const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
export const rand = (a,b)=>Math.random()*(b-a)+a;
export const randInt = (a,b)=>Math.floor(rand(a,b));
export function createState(){
  const baseShip = { r:18, baseSpeed:270, baseMaxHp:100 };
  return {
    state:'menu',
    canvas:null, ctx:null, camera:{x:0,y:0},
    keys:new Set(),
    time:{ elapsed:0, left: RUN_SECONDS, paused:false },
    player:{ x:2100,y:2100,r:18, speed:baseShip.baseSpeed, hp:baseShip.baseMaxHp, maxHp:baseShip.baseMaxHp, facing:0, gold:0, level:1, exp:0, expToNext:12, alive:true, invuln:0, dmgMul:1.0, base:baseShip },
    chosenShip:null,
    meta:{ hp:0, spd:0, dmg:0 },
    sfxVolume:1, audioCtx:null,
    enemies:[], projectiles:[], orbs:[], pickups:[], beamArcs:[],
    ownedWeapons:[],
    factoryWeaponSnapshot:null,
    adminOverrides:{},
  };
}
