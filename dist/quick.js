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
function move(s,u,c){if(!canMove(s,u,c))return false;if(u.covered&&!u.shelter){const old=G.at(s,u);if(!old.marks.includes('基本掩蔽 +1'))old.marks.push('基本掩蔽 +1');}delete u.shelter;u.x=c.x;u.y=c.y;u.exposed=true;u.covered=false;s.points--;G.note(s,u.name+' 移至 '+G.nameAt(c)+'（1 點）。');return true;}
function canAct(s,u,kind){
 if(!able(s,u))return false;
 if(kind==='rally')return u.pinned;
 if(kind==='cover'){const t=G.terrain(G.at(s,u).t);return u.y>0&&!u.pinned&&!u.covered&&(t?.coverDraws||0)>0;}
 return false;
}
function special(s,u,kind){
 if(!canAct(s,u,kind))return false;s.points--;
 if(kind==='rally'){const cs=G.draw(s,2,'重整檢定 '+u.name);if(cs.some(c=>c.rally)){u.pinned=false;G.note(s,u.name+' 依規則 §8 抽到重整圖示，解除壓制。');}else G.note(s,u.name+' 依規則 §8 抽 2 張未出現重整圖示，仍維持壓制。');}
 else{const t=G.terrain(G.at(s,u).t),n=Math.min(12,t.coverDraws),cs=G.draw(s,n,'尋找掩蔽 '+u.name);u.covered=cs.some(c=>c.cover);if(u.covered){
  const here=G.at(s,u),free=window.FOF_MARKERS.shelters(s,here).find(m=>!G.unitsAt(s,u).some(v=>v.shelter===m.key));
  if(free)u.shelter=free.key;else{const marker=G.piece('u'+(++s.serial),'基本掩蔽 +1','掩蔽',1,u.x,u.y,'marker','cover');s.units.push(marker);u.shelter=marker.id;}
 }G.note(s,u.name+(u.covered?' 依規則 §8 抽到掩蔽圖示，成功找到基本掩蔽（+1）。':' 依規則 §8 抽 '+n+' 張未出現掩蔽圖示，未能找到掩蔽。'));}
 return true;
}
function nextPcCell(s){
 return s.map.find(c=>c.pc&&G.unitsAt(s,c).some(v=>v.side==='friendly'&&!v.casualty));
}
function nextCombatCell(s){
 const done=new Set(s.qFought||[]);
 return s.map.find(c=>!done.has(G.nameAt(c))&&G.unitsAt(s,c).some(v=>v.side==='friendly'&&!v.casualty)&&G.unitsAt(s,c).some(v=>v.side==='enemy'&&!v.casualty));
}
function nextActionLabel(s){
 if(s.phase==='ready')return '抽取連隊命令（§3.3）';
 if(s.phase==='command')return '結束命令，抽主動點（§3.3.2d）';
 if(s.phase==='initiative')return '進入雙方戰鬥階段（§3.7）';
 if(s.phase==='combat'){
  const pc=nextPcCell(s);
  if(pc){
   const enemies=s.units.filter(u=>u.side==='enemy'&&!u.casualty).length;
   const act=Math.min(3,enemies);
   const n=({A:[0,7,5,3],B:[0,5,3,2],C:[4,3,2,1]})[pc.pc][act];
   return '判定 '+G.nameAt(pc)+' 潛在接敵（PC '+pc.pc+(n?'・抽 '+n+' 張':'・自動接敵')+'・§3.7.2）';
  }
  const cb=nextCombatCell(s);
  if(cb)return '結算 '+G.nameAt(cb)+' 雙方戰鬥（§3.7.4）';
  return '完成整理階段（§3.8）';
 }
 return '開始下一回合（§3.1）';
}
function resolveOneStep(s,events,draw=G.draw){
 s.roundReport=s.roundReport||[];
 const emit=msg=>{G.note(s,msg);s.roundReport.push(msg);};
 const cue=(kind,u,label,actor,result)=>events?.push({kind,label,...(result?{shooter:actor.id,target:u.id,outcome:result.toLowerCase()}:{}),side:(actor||u).side,
  from:G.nameAt(actor||u),to:G.nameAt(u),piece:{id:u.id,name:u.name,art:FOF_COUNTERS.art(s,u),side:u.side}});
 const pc=nextPcCell(s);
 if(pc){
  const enemies=s.units.filter(u=>u.side==='enemy'&&!u.casualty).length; s.activity=Math.min(3,enemies);
  const grade=pc.pc;
  const n=({A:[0,7,5,3],B:[0,5,3,2],C:[4,3,2,1]})[grade][s.activity];
  const encounter=!n||draw(s,n,'潛在接敵檢查 '+G.nameAt(pc)+'（PC '+grade+'）').some(a=>a.contact);
  pc.pc=null;pc.hidden=false;
  if(encounter){const u=G.piece('e'+(++s.serial),'接敵算子','接敵',1,pc.x,pc.y,'enemy','de-fire');s.units.push(u);s.activity=Math.min(3,s.units.filter(x=>x.side==='enemy'&&!x.casualty).length);emit(G.nameAt(pc)+' 依規則 §3.7.2 抽牌'+(n?'出現接敵圖示':'自動接敵')+'，發現敵軍並配置接敵算子！');cue('appear',u,'發生接敵・敵軍登場');}
  else {emit(G.nameAt(pc)+' 依規則 §3.7.2 抽 '+n+' 張牌未出現接敵圖示，安全無事，移除 PC '+grade+'。');events?.push({kind:'contact',to:G.nameAt(pc),label:'未發生接敵'});}
  return;
 }
 const c=nextCombatCell(s);
 if(c){
  s.qFought=[...(s.qFought||[]),G.nameAt(c)];
  const all=G.unitsAt(s,c).filter(u=>!u.casualty),friends=all.filter(u=>u.side==='friendly'),e=all.find(u=>u.side==='enemy');
  const live=friends.filter(u=>!u.pinned),wasPinned=e.pinned;
  let defeat=false,stun=false;
  if(live.length){const check=draw(s,1,'友軍射擊檢定 '+G.nameAt(c))[0].results[4-Math.min(3,live.length)];
   defeat=check==='HIT';stun=check==='PIN';cue('fire',e,'友軍火力・'+({HIT:'命中',PIN:'壓制',MISS:'未命中'}[check]),live[0],check);
   if(check==='MISS')emit(G.nameAt(c)+' 友軍射擊檢定（§3.7.4）：未命中（MISS），敵軍無事。');
   else if(check==='PIN')emit(G.nameAt(c)+' 友軍射擊檢定（§3.7.4）：壓制（PIN）敵軍。');
  }
  if(!wasPinned){
   for(const u of friends){
    const ncm=Math.max(-4,Math.min(6,(G.terrain(c.t)?.cover||0)+(u.covered?2:0)-(u.exposed?2:0)));
    const r=draw(s,1,'敵軍射擊檢定 '+u.abbr)[0].results[ncm+4];
    cue('fire',u,'敵軍火力・'+u.name+' '+({HIT:'命中',PIN:'壓制',MISS:'未命中'}[r]),e,r);
    if(r==='HIT'){u.steps--;u.pinned=true;if(u.steps<=0){u.casualty=true;emit(u.name+' 承受敵軍射擊（§3.7.4）命中（HIT），兵力歸零已退場。');}else emit(u.name+' 承受敵軍射擊（§3.7.4）命中（HIT），減少一階並受壓制。');}
    else if(r==='PIN'){u.pinned=true;emit(u.name+' 承受敵軍射擊（§3.7.4）受壓制（PIN）。');}
    else emit(u.name+' 承受敵軍射擊（§3.7.4，修正 '+(ncm>=0?'+':'')+ncm+'）：未命中（MISS），安全無事。');
    if(r==='HIT'||r==='PIN')cue(r==='HIT'?'loss':'pin',u,u.casualty?'算子退場':r==='HIT'?'減少一階、受壓制':'受壓制');
   }
  }
  if(defeat){s.units=s.units.filter(v=>v!==e);emit(G.nameAt(c)+' 友軍射擊命中（§3.7.4），接敵算子已殲滅移除！');cue('remove',e,'接敵算子退場');}
  else {e.pinned=stun;if(wasPinned!==stun)cue(stun?'pin':'rally',e,stun?'敵軍受壓制':'敵軍解除壓制');}
  return;
 }
 // §3.8 Cleanup
 for(const u of s.units){
  if(u.exposed)cue('status',u,'清理・解除暴露');
  u.exposed=false;
  if(u.side==='friendly'&&!s.units.some(e=>e.side==='enemy'&&G.same(e,u))){
   if(u.pinned)cue('rally',u,'清理・解除壓制');u.pinned=false;
  }
 }
 s.qFought=[];s.phase='review';
 emit('依規則 §3.8 整理階段完成：已移除暴露標記，無敵軍同牌之受壓制友軍已恢復。');
 if(!s.units.some(u=>u.side==='friendly'&&!u.casualty)){s.outcome='loss';emit('友軍已全部退場。');}
 else if(s.turn===10){s.outcome=G.goals(s).every(g=>g.done)?'win':'loss';emit(s.outcome==='win'?'第十回合結束，全部目標達成。':'第十回合結束，仍有未達成的目標。');}
}
function advance(s,events){
 if(s.outcome)return false;
 if(s.phase==='ready'){const c=G.draw(s,1,'快戰命令')[0];s.phase='command';s.points=Math.min(6,s.saved+c.command);s.saved=0;G.note(s,'依規則 §3.3 連隊共用命令 '+s.points+' 點。');}
 else if(s.phase==='command'){s.saved=Math.min(3,s.points);const c=G.draw(s,1,'一般主動')[0];s.phase='initiative';s.points=c.initiative;G.note(s,'依規則 §3.3.2d 主動點 '+s.points+'，已保留 '+s.saved+' 命令點。');}
 else if(s.phase==='initiative'){s.points=0;s.roundReport=[];s.qFought=[];s.phase='combat';G.note(s,'進入雙方戰鬥階段（§3.7），將逐一結算潛在接敵與戰鬥。');}
 else if(s.phase==='combat'){resolveOneStep(s,events);}
 else if(s.phase==='review'){s.turn++;s.phase='ready';G.note(s,'依規則 §3.1 開始第 '+s.turn+' 回合。');}
 else return false;return true;
}
// Pending draws saved before animations existed still contain the exact cards for every check.
function recordedBattle(s,groups){
 const replay=structuredClone({...s,tableRun:undefined}),events=[];
 let index=0;
 function read(_state,n,why){
  const group=groups[index++],cards=group?.ids.filter(id=>id!==51).map(G.card);
  if(group?.why!==why||cards?.length!==n)throw Error('牌組紀錄不符');
  return cards;
 }
 try{resolveOneStep(replay,events,read);return index===groups.length?events:[];}catch{return [];}
}
Object.assign(Q,{start,able,canMove,move,canAct,special,advance,recordedBattle,nextActionLabel});
})();
