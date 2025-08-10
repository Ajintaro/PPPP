import { clamp, rand, randInt } from './state.js';
import { WORLD } from './config.js';

export function getDifficultyStage(app){ return Math.floor(app.time.elapsed/120); }
export function spawnEnemy(app){
  const stage=getDifficultyStage(app); const weakBias = Math.max(0.4, 0.7 - stage*0.05);
  let type=0;
  if(app.time.elapsed>30){ const roll=Math.random(); if(roll>weakBias) type = (Math.random()<0.6?1:2); }
  const dist=rand(420,760), ang=rand(0,Math.PI*2);
  const x= clamp(app.player.x + Math.cos(ang)*dist, 32, WORLD.w-32);
  const y= clamp(app.player.y + Math.sin(ang)*dist, 32, WORLD.h-32);
  let e; if(type===0){ e={x,y,r:16,hp:18,speed:130,touch:5,type:0,t:0}; } else if(type===1){ e={x,y,r:12,hp:12,speed:210,touch:4,type:1,t:0}; } else { e={x,y,r:20,hp:42,speed:90,touch:12,type:2,t:0}; }
  const stageHp=Math.pow(1.18,stage), stageSpd=Math.pow(1.06,stage);
  e.maxHp=Math.round(e.hp*stageHp); e.hp=e.maxHp; e.speed=Math.round(e.speed*stageSpd); e.touch=Math.round(e.touch*Math.pow(1.18,stage));
  if(app.time.elapsed<=30){ e.hp = e.maxHp = 8; }
  app.enemies.push(e);
}
export function dropAfterKill(app, ex, ey, type, isBoss=false){
  const exp = type===2? 8 : type===1? 5 : 4;
  app.orbs.push({x:ex,y:ey,r:6,exp, vx:0, vy:0});
  if(Math.random()<0.18) app.pickups.push({x:ex+(Math.random()*16-8), y:ey+(Math.random()*16-8), r:8, kind:'gold', amount: Math.floor(Math.random()*6)+4});
  if(Math.random()<0.06) app.pickups.push({x:ex+(Math.random()*16-8), y:ey+(Math.random()*16-8), r:10, kind:'pizza', heal: 22});
  if(isBoss) app.pickups.push({x:ex, y:ey, r:12, kind:'chest'});
}
