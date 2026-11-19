/* Ten-turn card-game variant. Official scenario goals and cards, shared command pool. */
(() => {
'use strict';
const G=window.FOF, Q=window.FOF_QUICK={};
function start(){
 const s=G.tabletop('N1');s.id='Q1';s.phase='ready';s.units=[];s.log=[];s.roundReport=[];
 s.objectives={primary:{x:0,y:3},secondary:{x:3,y:3},position:{x:1,y:2}};
 for(let platoon=1;platoon<=3;platoon++)for(let team=1;team<=2;team++){
  const art=platoon===1?'s'+team:'p'+platoon+'s'+team;
  s.units.push(G.piece('q'+platoon+team,'第 '+platoon+' 排第 '+team+' 班',team+'/'+platoon,3,platoon-1,0,'friendly',art));
 }
 G.note(s,'快戰編組六枚步兵班。主要目標 A3、次要目標 D3，第 1、2 列須全部肅清。');
 return s;
}
const able=(s,u)=>!!u&&!s.outcome&&['command','initiative'].includes(s.phase)&&s.points>0&&u.side==='friendly'&&!u.casualty;
function canMove(s,u,c){return able(s,u)&&!u.exposed&&!u.pinned&&G.near(u,c)&&G.unitsAt(s,c).filter(v=>v.side==='friendly'&&!v.casualty).reduce((n,v)=>n+v.steps,0)+u.steps<=16;}
function move(s,u,c){if(!canMove(s,u,c))return false;u.x=c.x;u.y=c.y;u.exposed=true;u.covered=false;s.points--;G.note(s,u.name+' 移至 '+G.nameAt(c)+'（1 點）。');return true;}
function canAct(s,u,kind){
 if(!able(s,u))return false;
 if(kind==='rally')return u.pinned;
 if(kind==='cover'){const t=G.terrain(G.at(s,u).t);return u.y>0&&!u.pinned&&!u.covered&&(t?.coverDraws||0)>0;}
 return false;
}
function special(s,u,kind){
 if(!canAct(s,u,kind))return false;s.points--;
 if(kind==='rally'){const cs=G.draw(s,2,'重整檢定');if(cs.some(c=>c.rally)){u.pinned=false;G.note(s,u.name+' 重整成功。');}else G.note(s,u.name+' 未抽到重整圖示。');}
 else{const t=G.terrain(G.at(s,u).t),cs=G.draw(s,Math.min(12,t.coverDraws),'尋找掩蔽');u.covered=cs.some(c=>c.cover);G.note(s,u.name+(u.covered?' 得到掩蔽。':' 未找到掩蔽。'));}
 return true;
}
function resolve(s){
 const report=[];const emit=msg=>{G.note(s,msg);report.push(msg);};
 let occupied=s.map.filter(c=>G.unitsAt(s,c).some(v=>v.side==='friendly'&&!v.casualty));
 for(const c of occupied.filter(c=>c.pc)){
  const enemies=s.units.filter(u=>u.side==='enemy'&&!u.casualty).length; s.activity=Math.min(3,enemies);
  const n=({A:[0,7,5,3],B:[0,5,3,2],C:[4,3,2,1]})[c.pc][s.activity];
  const encounter=!n||G.draw(s,n,'快戰 PC '+G.nameAt(c)).some(a=>a.contact);
  c.pc=null;c.hidden=false;
  if(encounter){const u=G.piece('e'+(++s.serial),'接敵算子','接敵',1,c.x,c.y,'enemy','de-gr1');s.units.push(u);emit(G.nameAt(c)+' 出現一枚接敵算子。');}
  else emit(G.nameAt(c)+' 完成接敵檢查，移除 PC。');
 }
 for(const c of occupied){
  const all=G.unitsAt(s,c).filter(u=>!u.casualty),friends=all.filter(u=>u.side==='friendly'),e=all.find(u=>u.side==='enemy');if(!e)continue;
  const live=friends.filter(u=>!u.pinned),wasPinned=e.pinned;
  let defeat=false,stun=false;
  if(live.length){const check=G.draw(s,1,'接敵算子效果')[0].results[4-Math.min(3,live.length)];
   defeat=check==='HIT';stun=check==='PIN';}
  if(!wasPinned){
   for(const u of friends){
    const ncm=Math.max(-4,Math.min(6,(G.terrain(c.t)?.cover||0)+(u.covered?2:0)-(u.exposed?2:0)));
    const r=G.draw(s,1,'友軍效果 '+u.abbr)[0].results[ncm+4];
    if(r==='HIT'){u.steps--;u.pinned=true;if(u.steps<=0){u.casualty=true;emit(u.name+' 已退場。');}else emit(u.name+' 減少一階，受壓制。');}
    else if(r==='PIN'){u.pinned=true;emit(u.name+' 受壓制。');}
   }
  }
  if(defeat){s.units=s.units.filter(v=>v!==e);emit(G.nameAt(c)+' 的接敵算子移除。');}else e.pinned=stun;
 }
 for(const u of s.units){u.exposed=false;if(u.side==='friendly'&&!s.units.some(e=>e.side==='enemy'&&G.same(e,u)))u.pinned=false;}
 s.roundReport=report;s.phase='review';
 if(!s.units.some(u=>u.side==='friendly'&&!u.casualty)){s.outcome='loss';emit('友軍已全部退場。');}
 else if(s.turn===10){s.outcome=G.goals(s).every(g=>g.done)?'win':'loss';emit(s.outcome==='win'?'第十回合結束，全部目標達成。':'第十回合結束，仍有未達成的目標。');}
}
function advance(s){
 if(s.outcome)return false;
 if(s.phase==='ready'){const c=G.draw(s,1,'快戰命令')[0];s.phase='command';s.points=Math.min(6,s.saved+c.command);s.saved=0;G.note(s,'連隊共用命令 '+s.points+' 點。');}
 else if(s.phase==='command'){s.saved=Math.min(3,s.points);const c=G.draw(s,1,'一般主動')[0];s.phase='initiative';s.points=c.initiative;G.note(s,'主動點 '+s.points+'，已保留 '+s.saved+' 命令點。');}
 else if(s.phase==='initiative'){s.points=0;resolve(s);}
 else if(s.phase==='review'){s.turn++;s.phase='ready';G.note(s,'開始新回合。');}
 else return false;return true;
}
Object.assign(Q,{start,able,canMove,move,canAct,special,advance});
})();
