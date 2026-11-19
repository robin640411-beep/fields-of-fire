/* Card-table state and rules. No network or DOM dependency. */
(() => {
"use strict";
const E = window.FOF = {};
const card = id => window.FOF_CARDS.find(c => c.id === id);
const terrain = id => window.FOF_TERRAIN.find(c => c.id === id);
const scenario = id => window.FOF_SCENARIOS.find(s => s.id === (id==='Q1'?'N1':id));
const nameAt = p => String.fromCharCode(65 + p.x) + p.y;
const same = (a,b) => a && b && a.x === b.x && a.y === b.y;
const near = (a,b) => Math.max(Math.abs(a.x-b.x), Math.abs(a.y-b.y)) === 1;
const shuffle = arr => {
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];}
  return a;
};
function note(s,msg){ s.log.push({turn:s.turn,text:msg}); if(s.log.length>500)s.log.shift(); }
function newDeck(guided){
  const pack = shuffle([...window.FOF_CARDS.map(c=>c.id),51]);
  if(!guided)return pack;
  const demo = [30,25,24,27,11,16,23,13,3,18];
  return [...demo,...pack.filter(id=>!demo.includes(id))];
}
function recordDraw(s,ids,why){
 (s.pendingDraws??=[]).push({why,ids:ids.slice()});
 s.last=ids.filter(id=>id!==51);
 s.drawCount+=s.last.length;
 note(s,why+'　'+ids.map(id=>id===51?'重洗牌':'#'+String(id).padStart(2,'0')).join('、'));
}
function draw(s,n,why){
  if(!Number.isInteger(n)||n<1||n>12)throw Error('抽牌數量超出範圍');
  let reshuffle=false, out=[], seen=[];
  while(out.length<n){
    if(!s.deck.length){
      const used=s.discard.filter(id=>!out.includes(id));
      s.deck=shuffle(used.length?used:window.FOF_CARDS.map(c=>c.id).filter(id=>!out.includes(id)));
      s.discard=s.discard.filter(id=>!s.deck.includes(id)); reshuffle=true;
    }
    const id=s.deck.shift();
    seen.push(id);
    if(id===51){reshuffle=true;continue;}
    out.push(id);s.discard.push(id);
  }
  recordDraw(s,seen,why);
  if(reshuffle){s.deck=newDeck(false);s.discard=[];note(s,'重洗牌生效，完成本次抽牌後重新洗混全副牌。');}
  return out.map(card);
}
const templates=[
  ['hq','第 1 排部','HQ',1],['s1','第 1 班','1/1',3],['s2','第 2 班','2/1',3],['s3','第 3 班','3/1',3],
  ['lmg','輕機槍組','1/LMG',1],['at','巴祖卡組','1/AT',1],['fo','前進觀測員','Mtr FO',1]
];
const piece = (id,name,abbr,steps,x,y,side='friendly',art=id) => ({id,name,abbr,steps,x,y,side,art,exposed:false,moved:'',pinned:false,notes:''});
function hillLayers(cell){
  // Older saves recorded elevation but did not store the individual hill IDs.
  return cell.hills || Array(cell.h).fill(null);
}
const blank = (x,y,t,hills) => ({x,y,t,h:hills.length,hills,pc:null,hadPC:false,pending:false,marks:[]});
function base(id,cols,rows,guided){
  return {version:1,id,cols,rows,guided,turn:1,phase:'ready',points:0,saved:0,spent:0,
    last:[],deck:newDeck(guided),discard:[],drawCount:0,units:[],map:[],log:[],
    outcome:'',serial:0,activity:0,tracks:{},patrol:1,notes:'',objectives:{},lastPatrol:false};
}
function training(guided=true){
  const s=base('T1',3,3,guided);
  const rows=[[0,0,0],[41,42,43],[9,44,10],[17,18,19]];
  rows.forEach((r,y)=>r.forEach((t,x)=>s.map.push(blank(x,y,t,y===3&&x===1?[1]:[]))));
  s.units=templates.map(([id,n,a,steps])=>piece(id,n,a,steps,1,0));
  note(s,'七枚算子已放在 B0 集結區。'+(guided?'使用手冊前五回合的示範牌序。':'行動牌已洗混。'));
  return s;
}
function isTable(s){return s.id!=='T1';}
function at(s,p){return s.map.find(c=>same(c,p));}
function unitsAt(s,p){return s.units.filter(u=>same(u,p));}
function isClear(s,c){return !!c?.hadPC && !c.pc && !c.pending && !unitsAt(s,c).some(u=>u.side==='enemy'&&!u.casualty);}
function secured(s,c){return isClear(s,c)&&unitsAt(s,c).some(u=>u.side==='friendly'&&!u.casualty);}
function atThird(s){return s.units.filter(u=>u.y===3).length;}
function validPos(s,p){return p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&p.x>=0&&p.x<s.cols&&p.y>=0&&p.y<=s.rows&&!!at(s,p);}
function trainingStatus(s,u){
 if(!u)return '請選擇單位';
 if(!['command','initiative'].includes(s.phase))return '請先抽取命令牌';
 if(u.exposed||u.moved===s.phase)return '本時段已移動';
 if(s.phase==='command'&&!same(u,s.units.find(q=>q.id==='hq')))return '未與排部同牌';
 if(s.points<1||s.phase==='command'&&s.spent>=6)return '可用命令已用盡';
 return '';
}
function movers(s,uid,group){
 const u=s.units.find(q=>q.id===uid);
 if(trainingStatus(s,u))return [];
 if(!group)return [u];
 if(u.id!=='hq'||s.phase!=='command'||s.points<2||s.spent+2>6)return [];
 return unitsAt(s,u).filter(q=>!trainingStatus(s,q));
}
function allowedMove(s,uid,p,group=false){
 if(s.outcome||!validPos(s,p))return false;
 const u=s.units.find(q=>q.id===uid);
 if(!u||!near(u,p))return false;
 const moving=movers(s,uid,group);
 return moving.length>0&&(p.y===0||unitsAt(s,p).concat(moving).reduce((sum,v)=>sum+v.steps,0)<=16);
}
function moveTraining(s,uid,p,group=false){
 if(!allowedMove(s,uid,p,group))return false;
 const us=movers(s,uid,group),cost=group?2:1;
 for(const u of us){if(p.y!==0||u.y!==0)u.exposed=true;u.x=p.x;u.y=p.y;u.moved=s.phase;}
 s.points-=cost;s.spent+=cost;
 note(s,(group?'全排移動（'+us.length+' 枚）':us[0].name)+'移至 '+nameAt(p)+'，花費 '+cost+' 點。');
 if(atThird(s)===7){s.outcome='win';note(s,'七枚算子全數抵達第三列，演練完成。');}
 return true;
}
function advanceTraining(s){
 if(s.outcome)return false;
 if(s.phase==='ready'){
  const c=draw(s,1,'排部啟動')[0];s.phase='command';s.spent=0;s.points=s.saved+c.command;s.saved=0;
  note(s,'啟動命令 '+c.command+' 點，本時段最多花費 6 點。');
 }else if(s.phase==='command'){
  s.saved=Math.min(6,s.points);const c=draw(s,1,'一般主動行動')[0];s.phase='initiative';s.spent=0;
  s.points=Math.floor(c.initiative/2);note(s,'排部保留 '+s.saved+' 點。主動值 '+c.initiative+'，單排折半後可用 '+s.points+' 點。');
 }else if(s.phase==='initiative'){
  for(const u of s.units){u.exposed=false;u.moved='';}
  note(s,'整理完成，移除暴露標記。');s.turn++;s.phase='ready';s.points=0;s.spent=0;
 }else return false;
 return true;
}
const phases=['events','orders','enemy','retreat','vehicles','combat','cleanup'];
const phaseNames={review:'回合報告',setup:'任務設置',ready:'等待啟動',command:'排部命令',initiative:'一般主動',events:'上級事件',orders:'友軍命令',enemy:'敵軍活動',retreat:'俘虜與撤退',vehicles:'車輛階段',combat:'雙方戰鬥',cleanup:'整理階段'};
function pcFor(raw){if(!raw)return null;const values=String(raw).replace('?','').split('/');return values[Math.floor(Math.random()*values.length)];}
function tabletop(id,previous=null){
 const m=scenario(id);if(!m)throw Error('未知任務');
 const s=base(id,m.cols,m.rows,false);s.phase='setup';
 s.vis=m.mode==='patrol'?1+draw(s,1,'月光能見度')[0].rand[4]:0;
 s.patrolHistory=[];s.visits={way:0,primary:false,returned:false};s.xpCards={};s.attempt=1;
 const retained=new Set((previous?.map||[]).filter(c=>c.x<m.cols&&c.y<=m.rows&&c.y>0).flatMap(c=>[c.t,...hillLayers(c).map(id=>id??1)]));
 let pool=shuffle(window.FOF_TERRAIN.map(t=>t.id).filter(id=>!retained.has(id)));
 for(let y=0;y<=m.rows;y++)for(let x=0;x<m.cols;x++){
  if(!y&&!m.staging)continue;
  let t=0,hills=[];
  if(y>0){
   const old=previous&&at(previous,{x,y});
   if(old?.t){t=old.t;hills=hillLayers(old).slice();}else{
    t=pool.pop();while(terrain(t)?.type==='hill'&&pool.length){hills.push(t);t=pool.pop();}
   }
  }
  const c=blank(x,y,t,hills);
  if(y>0){const raw=m.pcRows[y-1];c.pc=pcFor(raw);c.hidden=String(raw||'').startsWith('?');c.hadPC=!!c.pc;}
  if(m.foxholes?.row===y)c.marks.push('散兵坑 ×2');
  if(previous){const prior=at(previous,c);if(prior)c.marks=[...new Set([...c.marks,...prior.marks.filter(v=>/掩蔽|雷區|散兵坑/.test(v))])];}
  s.map.push(c);
 }
 for(const raw of new Set(m.pcRows.filter(r=>String(r).startsWith('?')))){
  const cells=s.map.filter(c=>c.y&&m.pcRows[c.y-1]===raw);
  const bag=shuffle(raw.slice(1).split('/').flatMap(ch=>Array(Math.min(16,cells.length)).fill(ch)));
  cells.forEach((c,i)=>{c.pc=bag[i];});
 }
 for(const c of s.map)c.originalPC=c.pc;
 const initialY=m.mode==='patrol'?1:m.staging?0:1;
 if(m.mode!=='patrol'){
  s.units.push(piece('co','連指揮部','CO HQ',1,1,initialY,'friendly','co-hq'));
  for(let i=1;i<=3;i++){
   const x=Math.min(i-1,m.cols-1);
   s.units.push(piece('hq'+i,'第 '+i+' 排部',i+' HQ',1,x,initialY,'friendly',i===1?'hq':'hq'+i));
   for(let j=1;j<=3;j++)s.units.push(piece('s'+i+j,j+'/'+i+' 班',j+'/'+i,3,x,initialY,'friendly',i===1?'s'+j:'p'+i+'s'+j));
  }
  for(const [i,k] of ['co-xo','first-sgt','mtr','hmg50','lmg','lmg2','at','at2','at3',...(id==='N1'?['arty-fo']:[])].entries()){
    const q=window.FOF_PIECES.find(a=>a.id===k);if(q)s.units.push(piece('base-'+k,q.name.split(' · ')[0],q.name.split(' · ')[1]||q.name,k==='mtr'?3:1,i%m.cols,initialY,'friendly',k));
  }
 }else{s.units=templates.slice(0,4).map(([key,n,a,hp])=>piece(key,n,a,hp,0,initialY));}
 if(previous){for(const u of previous.units.filter(u=>u.side==='marker'&&['cover','mines','foxhole','trench','bunker','pillbox'].includes(u.art))){s.units.push({...u,id:'u'+(++s.serial)});}}
 note(s,previous?'沿用前次任務的重疊地形。':'已設置地形。');
 note(s,'依任務書確認編組、配屬與起點，再放置目標。');return s;
}
function placeObjective(s,key,p){
 const m=scenario(s.id);if(!m||s.phase!=='setup'||!validPos(s,p)||p.y<1)return false;
 const obj=m.objectives;
 const wanted={primary:obj.primaryRow,secondary:obj.secondaryRow,position:obj.positionRow};
 if(key==='outpost'){if(!m.outpost||p.y!==m.outpost.row)return false;}
 else if(key.startsWith('way')){if(!obj.waypointRows?.includes(p.y)||!/^way[1-4]$/.test(key)||Number(key.slice(3))>obj.waypoints)return false;}
 else if(!(key in wanted)||wanted[key]==null||p.y!==wanted[key])return false;
 if(Object.entries(s.objectives).some(([k,v])=>k!==key&&same(v,p)&&(m.mode!=='patrol'||(key.startsWith('way')&&k.startsWith('way')))))return false;
 if(key==='outpost'){const old=at(s,s.objectives.outpost);if(old){old.pc=old.originalPC;old.hadPC=!!old.pc;}const now=at(s,p);now.pc=null;now.hadPC=false;}
 if(key==='position'){
  const targets=obj.positionAdjacentTo==='secondary'?[s.objectives.secondary]:[s.objectives.primary,s.objectives.secondary];
  if(!targets.some(v=>v&&near(v,p)))return false;
 }
 s.objectives[key]={x:p.x,y:p.y};
 if(key==='primary'||key==='secondary'){
  const pos=s.objectives.position;
  if(pos&&!(obj.positionAdjacentTo==='secondary'?[s.objectives.secondary]:[s.objectives.primary,s.objectives.secondary]).some(v=>v&&near(v,pos)))delete s.objectives.position;
 }
 return true;
}
function needed(s){
 const o=scenario(s.id).objectives;
 const a=[];if(scenario(s.id).outpost)a.push('outpost');if(o.primaryRow)a.push('primary');if(o.secondaryRow)a.push('secondary');if(o.positionRow)a.push('position');
 for(let i=1;i<=o.waypoints;i++)a.push('way'+i);
 return a;
}
function goals(s){
 const m=scenario(s.id),o=m.objectives, result=[];
 if(m.mode==='patrol')return [{name:'走訪主要目標',done:s.visits.primary},{name:'路線點 '+s.visits.way+' / 4',done:s.visits.way===4},{name:'由第二列返回第一列',done:s.visits.returned}];
 for(const k of ['primary','secondary'])if(o[k+'Row']){const p=s.objectives[k];result.push({name:k==='primary'?'確保主要目標':'確保次要目標',done:!!p&&secured(s,at(s,p))});}
 for(const y of o.clearRows||[]){const row=s.map.filter(c=>c.y===y);result.push({name:'肅清第 '+y+' 列',done:row.every(c=>isClear(s,c))});}
 return result;
}
function advanceTable(s){
 const m=scenario(s.id);
 if(s.outcome)return false;
 if(s.phase==='setup'){
  if(needed(s).some(k=>!s.objectives[k]))return false;
  s.phase='orders';note(s,'設置完成，開始第一回合。');return true;
 }
 if(s.phase==='cleanup'){
  if(s.turn>=m.turns){
   if(m.mode==='patrol'){s.phase='patrolresult';note(s,'請依任務書登錄本次巡邏結果。');return true;}
   const gs=goals(s);s.outcome=gs.length&&gs.every(g=>g.done)?'win':'loss';note(s,s.outcome==='win'?'任務目標全部達成。':'回合用盡，尚有未達成的目標。');return true;
  }
  for(const u of s.units){u.exposed=false;u.moved='';}
  s.turn++;s.phase='events';note(s,'開始新回合，已移除暴露標記。');return true;
 }
 const idx=phases.indexOf(s.phase);if(idx<0)return false;
 s.phase=phases[idx+1];if(s.phase==='combat')revealPCs(s);
 note(s,'進入'+phaseNames[s.phase]+'。');return true;
}
function eligiblePCs(s){
 return s.map.filter(c=>c.pc&&unitsAt(s,c).some(u=>u.side==='friendly'&&!u.casualty));
}
function setPC(s,c,grade,hidden,adding=false){
 if(!c||grade!==null&&!['A','B','C'].includes(grade))return false;
 if(adding&&c.pc&&grade){grade=[grade,c.pc].sort()[0];hidden=false;}
 c.pc=grade;c.hidden=!!grade&&hidden;
 if(s.phase==='setup'){c.originalPC=grade;c.hadPC=!!grade;}
 s.pcOrder=null;
 return true;
}
function revealPCs(s){for(const c of eligiblePCs(s))c.hidden=false;}
function pcCandidates(s){
 if(s.phase!=='combat'||s.map.some(c=>c.pending))return [];
 const list=eligiblePCs(s).sort((a,b)=>a.pc.localeCompare(b.pc)||a.y-b.y||a.x-b.x);
 const grade=list[0]?.pc;
 return list.filter(c=>c.pc===grade);
}
function nextPC(s){
 const list=pcCandidates(s);
 return list.find(c=>nameAt(c)===s.pcOrder)||(list.length===1?list[0]:null);
}
function choosePC(s){
 const list=pcCandidates(s);if(nextPC(s)||list.length<2)return false;
 revealPCs(s);
 // With more than twelve tied cards, use two printed columns and redraw unused slots.
 let index;
 if(list.length<=12)index=draw(s,1,'同級 PC 順序・R'+list.length)[0].rand[list.length]-1;
 else{const groups=Math.ceil(list.length/12);
   do{const row=draw(s,1,'同級 PC 順序・分組')[0].rand[groups]-1;
      index=row*12+draw(s,1,'同級 PC 順序・組內')[0].rand[12]-1;
   }while(index>=list.length);
 }
 s.pcOrder=nameAt(list[index]);note(s,'同級候選依序為 '+list.map(nameAt).join('、')+'。下一枚 PC 為 '+s.pcOrder+'。');return true;
}
function contactGroup(s,c){
 const tabs=window.FOF_TABLES?.[s.id]?.contact;
 const grade=c.contactGrade||c.originalPC;
 if(!c.pending||!tabs?.[grade])return false;
 const chosen=grade==='A'&&s.counterUntil>=s.turn&&tabs.counterA?tabs.counterA:tabs[grade];
 const r=draw(s,1,'接敵組合 '+nameAt(c))[0].rand[chosen.rand], item=chosen.results[r-1];
 c.contactDetail='組合 '+item.id+'・'+item.title+'（R'+chosen.rand+'＝'+r+'）';
 note(s,nameAt(c)+' '+c.contactDetail);return true;
}
function pcCheck(s,c){
 if(!isTable(s)||!c||nextPC(s)!==c)return false;
 revealPCs(s);s.pcOrder=null;
 const n=({A:[0,7,5,3],B:[0,5,3,2],C:[4,3,2,1]})[c.pc]?.[s.activity];if(n===undefined)return false;
 const grade=c.pc;const cs=n?draw(s,n,'潛在接敵 '+nameAt(c)):[];
 c.pending=n===0||cs.some(a=>a.contact);c.hidden=false;c.pc=null;
 c.contactGrade=grade;c.contactDetail='';if(c.pending)contactGroup(s,c);
 note(s,nameAt(c)+(c.pending?' 觸發接敵，待依任務表放置算子。':' 未發生接敵，移除 PC。'));return true;
}
function hqEvent(s){
 const side=s.phase==='events'?'friendly':s.phase==='enemy'?'enemy':null;
 if(!side||s.turn<2||s.outcome||!window.FOF_TABLES?.[s.id])return false;
 const k=s.turn+'-'+side;if(s.events?.[k])return false;s.events=s.events||{};
 const first=draw(s,1,side==='friendly'?'友軍 HQ 檢查':'敵軍 HQ 檢查')[0];
 let detail='未出現 HQ 圖示，本階段沒有事件。';
 if(first.hq){const tab=window.FOF_TABLES[s.id][side].find(t=>t.from<=s.turn&&t.to>=s.turn);const n=draw(s,1,'上級事件表')[0].rand[tab.rand],e=tab.results[n-1];
  detail=e.title+'（R'+tab.rand+'＝'+n+'）。'+e.text+(e.xp?' 達成後可另記 '+e.xp+' XP。':'');if(e.title==='反攻')s.counterUntil=s.turn+2;
 }s.events[k]=detail;note(s,detail);return detail;
}
function validSave(s){
 if(!s||![s.pendingDraws,s.recentDraws].every(b=>b===undefined||(Array.isArray(b)&&b.length<=2000&&b.every(g=>g&&typeof g.why==='string'&&Array.isArray(g.ids)&&g.ids.length>0&&g.ids.length<=60&&g.ids.every(id=>Number.isInteger(id)&&id>=1&&id<=51)))))return false;
 if(window.FOF_COURSE?.has(s.id))return window.FOF_COURSE.validSave(s);
 if(!s||s.version!==1||!(s.id==='T1'||scenario(s.id))||!Array.isArray(s.map)||!Array.isArray(s.units)||!Array.isArray(s.log)||!Array.isArray(s.deck)||!Array.isArray(s.discard)||!Array.isArray(s.last)||typeof s.objectives!=='object'||!s.objectives||!s.tracks||!Number.isInteger(s.turn)||s.turn<1)return false;
 const m=scenario(s.id),cols=m?m.cols:3, rows=m?m.rows:3;
 if(s.cols!==cols||s.rows!==rows||s.map.length!==(rows+(m&&!m.staging?0:1))*cols||s.units.length>900||s.log.length>500)return false;
 if(!(s.id==='T1'?['ready','command','initiative']:s.id==='Q1'?['ready','command','initiative','review']:['setup','patrolresult',...phases]).includes(s.phase)||!['','win','loss'].includes(s.outcome))return false;
 if(!s.deck.concat(s.discard,s.last).every(n=>Number.isInteger(n)&&n>=1&&n<=51)||!s.last.every(n=>n!==51))return false;
 if(!s.map.every(c=>c&&validPos(s,c)&&(!c.y||terrain(c.t))&&Array.isArray(c.marks)&&(!c.pc||['A','B','C'].includes(c.pc))))return false;
 if(!s.map.every(c=>Number.isInteger(c.h)&&c.h>=0&&c.h<=6&&
     (c.hills===undefined||(Array.isArray(c.hills)&&c.hills.length===c.h&&
       c.hills.every(id=>id===null||terrain(id)?.type==='hill')))))return false;
 if(new Set(s.map.map(nameAt)).size!==s.map.length)return false;
 if(!s.units.every(u=>u&&validPos(s,u)&&typeof u.name==='string'&&typeof u.id==='string'&&['friendly','enemy','marker'].includes(u.side)))return false;
 if(!s.log.every(e=>e&&typeof e.text==='string')||!Object.values(s.objectives).every(p=>validPos(s,p)))return false;
 if(new Set(s.units.map(u=>u.id)).size!==s.units.length||s.units.some(u=>!Number.isInteger(u.steps)||u.steps<0||u.steps>16||typeof u.abbr!=='string'))return false;
 if(s.id!=='T1'){
  if(!Number.isInteger(s.vis)||s.vis<0||s.vis>5||!Number.isInteger(s.patrol)||s.patrol<1||s.patrol>3||!s.visits||!Number.isInteger(s.visits.way)||s.visits.way<0||s.visits.way>4||!Array.isArray(s.patrolHistory)||s.patrolHistory.length>3||!s.xpCards||typeof s.xpCards!=='object'||!Number.isInteger(s.attempt))return false;
  if(!s.patrolHistory.every(p=>p&&typeof p.ok==='boolean'&&Number.isInteger(p.xp))||!Object.values(s.xpCards).every(Number.isFinite))return false;
  if(s.id==='Q1'&&(!Array.isArray(s.roundReport)||s.roundReport.some(v=>typeof v!=='string')))return false;
 }
 if(s.id==='T1'&&(s.units.length!==7||!templates.every(t=>s.units.some(u=>u.id===t[0]))))return false;
 return ['points','saved','spent','serial','drawCount','activity'].every(k=>Number.isInteger(s[k])&&s[k]>=0)&&s.activity<=3;
}
Object.assign(E,{hillLayers,hqEvent,card,terrain,scenario,nameAt,same,near,at,unitsAt,shuffle,note,draw,recordDraw,training,tabletop,isTable,trainingStatus,atThird,movers,allowedMove,moveTraining,advanceTraining,advanceTable,placeObjective,needed,goals,pcCheck,pcCandidates,nextPC,choosePC,contactGroup,setPC,secured,isClear,phaseNames,validSave,piece});
})();
