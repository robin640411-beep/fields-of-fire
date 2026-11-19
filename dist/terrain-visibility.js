/* Terrain setup and discovery, series rules 2.2.1, 5.2 and 9.1. */
(() => {
'use strict';
const G=window.FOF;
const usesHiddenMap=m=>!!(m?.revealFromStaging||m?.terrainSetup?.faceUp==='landingAndNeighbors');
const direction=(x,y)=>(y>0?'N':y<0?'S':'')+(x>0?'E':x<0?'W':'');
const distance=(a,b)=>Math.max(Math.abs(a.x-b.x),Math.abs(a.y-b.y));
function setupKnown(s,m,c){
 if(m.revealFromStaging)return false;
 if(m.terrainSetup?.faceUp==='landingAndNeighbors')
  return s.landing.some(k=>distance(c,window.FOF_CAMPAIGNS.coord(k))<=1);
 return true;
}
function turnUp(s,c){
 if(!c.faceDown)return;
 // A hidden hill is just one dealt card. Draw its summit only when revealed.
 while(G.terrain(c.t)?.type==='hill'){
  c.hills.push(c.t);
  c.t=s.terrainReserve.pop();
 }
 c.h=c.hills.length;
 c.faceDown=false;
}
function elevation(c){
 if(c.faceDown)return c.level||1;
 return (c.level||1+c.h)+Number(G.terrain(c.t)?.type==='Embankment');
}
function clearBorders(c,entry,exit){
 return [c.t,...G.hillLayers(c)].every(id=>{
  const edges=G.terrain(id)?.openEdges;
  return edges?.includes(entry)&&edges.includes(exit);
 });
}
const smokeLabel=name=>!/信號|訊號|有色|彩色|[紅黃綠紫藍橙]色?煙|待發|待命|pending|signal|colou?red|(?:red|green|yellow|purple|orange|blue) smoke/i.test(name)
 && /煙霧|煙幕|白磷|燃燒殘骸|來襲|空襲|\b(smoke|incoming|air strike|WP)\b|burning.wreck/i.test(name);
function sightContext(s){
 const blocked=new Set(),lit=new Set(),lights=[];
 function mark(c,name){
  const key=G.nameAt(c);
  if(smokeLabel(name))blocked.add(key);
  if(/照明|illumination|parachute flare/i.test(name)&&!/待發|待命|pending/i.test(name)){
   lit.add(key);
   if(/鄰牌|相鄰|adjacent/i.test(name))lights.push(c);
  }
 }
 for(const c of s.map)for(const name of c.marks)mark(c,name);
 for(const u of s.units)if(u.side==='marker')mark(u,u.name+' '+u.art);
 for(const light of lights)for(const c of s.map)if(G.near(light,c))lit.add(G.nameAt(c));
 return {blocked,lit};
}
function visible(s,from,to,context){
 if(G.same(from,to))return true;
 if(context.blocked.has(G.nameAt(from)))return false;
 const dx=to.x-from.x,dy=to.y-from.y,n=distance(from,to);
 if(n===1)return true;
 if(n>3||(dx&&dy&&Math.abs(dx)!==Math.abs(dy)))return false;
 // K1 attempt 3 has daylight rain +2 for the entire attempt.
 const badWeather=s.raining||(s.id==='K1'&&s.attempt===3);
 if(s.vis>=2&&(badWeather||!context.lit.has(G.nameAt(to))))return false;
 const x=Math.sign(dx),y=Math.sign(dy),entry=direction(-x,-y),exit=direction(x,y);
 const fromLevel=elevation(from),toLevel=elevation(to),low=Math.min(fromLevel,toLevel),high=Math.max(fromLevel,toLevel);
 for(let i=1;i<n;i++){
  const mid=G.at(s,{x:from.x+i*x,y:from.y+i*y});
  if(!mid||mid.faceDown||context.blocked.has(G.nameAt(mid)))return false;
  const level=elevation(mid);
  if(level>high||(low<high&&level===high))return false;
  if(level<high&&level<=low)continue;
  if(!clearBorders(mid,entry,exit))return false;
 }
 return true;
}
function groundObserver(u){
 return u.side==='friendly'&&u.steps>0&&!u.casualty&&!u.embarked&&
  !/^aircraft-|直升機|直昇機|航空器|砲艇機|炮艇機|\b(UH-?1|CH-?47|AC-?47|AH-?1|aircraft|helicopter)\b/i.test(u.art+' '+u.name);
}
function discover(s,observers,log=true){
 if(!observers.length||!s.map.some(c=>c.faceDown))return;
 const context=sightContext(s),turned=[];
 // Resolve the observers' own cards, then nearby cards, before tracing through them.
 const unseen=s.map.filter(c=>c.faceDown).sort((a,b)=>
  Math.min(...observers.map(p=>distance(a,p)))-Math.min(...observers.map(p=>distance(b,p))));
 let changed;
 do{
  changed=false;
  for(const c of unseen)if(c.faceDown&&observers.some(p=>visible(s,p,c,context))){
   turnUp(s,c);turned.push(G.nameAt(c));changed=true;
  }
 }while(changed);
 if(log&&turned.length)G.note(s,'依視線翻開地形：'+turned.join('、')+'。');
}
function refresh(s){
 const m=G.scenario(s.id);
 if(!usesHiddenMap(m)||s.phase==='setup'||s.outcome||!s.map.some(c=>c.faceDown))return;
 const positions=new Set(s.units.filter(groundObserver).map(G.nameAt));
 discover(s,s.map.filter(c=>positions.has(G.nameAt(c))));
}
function setup(s,m){
 if(!usesHiddenMap(m))return;
 for(const c of s.map.filter(c=>c.y)){
  c.faceDown=true;
  if(setupKnown(s,m,c))turnUp(s,c);
 }
 if(m.revealFromStaging)discover(s,s.map.filter(c=>!c.y),false);
}
function restore(s){
 const m=G.scenario(s.id);
 if(!usesHiddenMap(m))return;
 // Older saves already dealt the summit of every hidden hill. Keep those exact stacks.
 for(const c of s.map)if(c.y&&typeof c.faceDown!=='boolean')
  c.faceDown=s.phase==='setup'&&s.attempt===1&&!setupKnown(s,m,c);
 if(!s.terrainReserve&&m.revealFromStaging&&!s.stagingSightRestored){
  // K1 originally began in daylight. Reconstruct its missing setup reveals even
  // after the company has left staging, without moving units or redrawing cards.
  const startMap=s.map.map(c=>({...c,marks:[]}));
  const initial={...s,map:startMap,units:[],attempt:1,vis:0,raining:false};
  discover(initial,startMap.filter(c=>!c.y),false);
  for(let i=0;i<s.map.length;i++)if(!startMap[i].faceDown)s.map[i].faceDown=false;
  s.stagingSightRestored=true;
 }
 refresh(s);
}
function validReserve(s,m){
 const reserve=s.terrainReserve;
 if(!usesHiddenMap(m))return reserve===undefined;
 // Old saves have pre-dealt, resolved stacks and no reserve.
 if(reserve===undefined)return s.map.every(c=>!c.y||G.terrain(c.t)?.type!=='hill');
 if(!Array.isArray(reserve)||reserve.length>55)return false;
 const cards=s.map.filter(c=>c.y);
 if(cards.some(c=>typeof c.faceDown!=='boolean'||(G.terrain(c.t)?.type==='hill'&&!c.faceDown)))return false;
 if(cards.some(c=>!Array.isArray(c.hills)))return false;
 const ids=[...reserve,...cards.flatMap(c=>[c.t,...c.hills])];
 const eligible=window.FOF_CAMPAIGN_TERRAIN.filter(t=>t.id.startsWith(m.book==='V'?'VN':'K')&&
  !m.terrainSetup?.exclude?.includes(t.type));
 return ids.length===eligible.length&&new Set(ids).size===ids.length&&eligible.every(t=>ids.includes(t.id));
}
window.FOF_TERRAIN_VISIBILITY={usesHiddenMap,setup,refresh,restore,validReserve};
})();
