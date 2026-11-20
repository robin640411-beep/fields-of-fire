/* Every accepted rules operation produces one sequence of simultaneous or ordered beats. */
(() => {
'use strict';
const G=window.FOF,C=window.FOF_COURSE;
const different=(a,b)=>JSON.stringify(a)!==JSON.stringify(b);
const spot=u=>u&&G.nameAt(u);
const side=u=>u?.side==='enemy'?'enemy':u?.side==='friendly'?'friendly':'neutral';
const piece=(s,u)=>({id:u.id,name:u.name,art:FOF_COUNTERS.art(s,u),side:side(u)});
const pinned=u=>!!u.pinned||/(?:^|[、・·])\s*受壓制\s*(?:$|[、・·])/.test(u.lessonStatus||'');
const verbs=[
 ['evacuate',/後送|疏散/],['retreat',/撤退|後退/],['rally',/重整|解除壓制|恢復壓制/],
 ['cover',/尋找掩蔽|尋找建築|找掩蔽|進入掩蔽/],['spot',/發現嘗試|嘗試發現|觀察|偵察/],
 ['support',/待發|來襲|火力任務/],['fire',/射向|火力量|射擊|戰鬥效果|命中|榴彈|戰鬥結算/],
 ['contact',/接敵|PC|遭遇/],['order',/命令|指揮|啟動|通訊|一般主動/],
 ['supply',/彈藥|裝載|經驗|編制|補充|登記|輪調|重組/],['phase',/階段|清理|回合|時段/]
];
const kindFor=text=>verbs.find(([,match])=>match.test(text))?.[0]||'check';
const drawKinds={event:['event','上級事件'],weather:['weather','天候判定'],moonlight:['weather','月光判定'],order:['contact','同級 PC 順序'],contact:['contact','接敵判定'],group:['contact','抽取接敵組合'],combat:['fire','戰鬥效果'],cover:['cover','尋找掩蔽'],rally:['rally','重整']};
const actionLabels={camApplyDeploy:'確認部署',camApplyRanks:'登記經驗分配',camApplyKatusa:'登記韓籍編組',camApplyAttach:'確認巡邏配屬',camSwapForm:'變更連隊編制',camReport:'登記任務成果',camLedger:'更新戰役紀錄',camSettle:'任務間重組',camMapApply:'調整地圖',patrolFinish:'結算巡邏',saveLedger:'登記命令與紀錄',openLedgerSheet:'登記命令與紀錄',useUnitSkill:'使用技能',unitApply:'更新算子',saveCell:'更新地形標記',emptyContact:'結束接敵判定',finishContact:'完成接敵配置'};
function plan(before,after,ctx={}){
 const beats=[];
 const pinFromShot=new Set();
 const add=(...events)=>{
  const visible=events.filter(e=>{
   if(e.kind==='fire'&&e.outcome==='pin')pinFromShot.add(e.target);
   if(e.kind==='rally')pinFromShot.delete(e.piece?.id);
   return e.kind!=='pin'||!pinFromShot.delete(e.piece?.id);
  });
  if(visible.length)beats.push(visible);
 };
 if(ctx.frame){
  const {id,why}=ctx.frame;
  add({kind:id?'draw':'shuffle',id,side:before.phase==='enemy'?'enemy':'neutral',label:id?(id===51?'抽到重洗牌':'行動牌 #'+String(id).padStart(2,'0'))+'・'+why:'重洗行動牌組'});
  if(ctx.partial)return beats;
 }
 if(!after)return beats;
 const oldUnits=new Map(before.units.map(u=>[u.id,u]));
 const newUnits=new Map(after.units.map(u=>[u.id,u]));
 const t=C.has(before.id)&&before.cursor!==after.cursor?C.current(before):null;
 const specific=t&&window.FOF_LESSON_MOTION?.[before.id]?.[before.cursor];
 const shots=t&&window.FOF_LESSON_ATTACKS?.[before.id]?.[before.cursor];
 const worksheet=C.lessons[before.id]?.worksheet;
 const anchor=worksheet?'worksheet':'board';
 const currentUnit=oldUnits.get(ctx.order?.unit||t?.unit||ctx.selected);
 const order=ctx.order?.type;
 const regions={sheetPlace:'command',sheetDelta:'command',sheetArea:'command',track:'command',camLedger:'worksheet',camReport:'worksheet'};
 const noRoute=before.cols!==after.cols||before.rows!==after.rows||before.patrol!==after.patrol||before.id!==after.id||before.attempt!==after.attempt||(before.id==='V2'&&before.cursor===5&&!!t);
 const moves=[],placement=[],changes=[],lands=[],markers=[],accounts=[];
 if(noRoute){
  add({kind:'map',region:'board',label:before.patrol!==after.patrol?'巡邏交接':before.id==='V2'&&t?'切換至手冊中盤局面':ctx.action==='camMapApply'?'展開地形棋桌':'重新配置棋桌'});
  if(ctx.action==='camMapApply'){
   const column=ctx.value==='left'?0:after.cols-1;
   const added=after.map.filter(c=>(after.cols>before.cols&&c.x===column)||(after.rows>before.rows&&c.y>before.rows));
   add(...added.map(c=>({kind:'deal',to:spot(c),label:spot(c)+'・放置地形牌'})));
  }
 }
 if(ctx.events?.length){
  for(const e of ctx.events)add(e);
 }
 if(shots)for(const shot of shots)add({...shot,kind:'fire',targetPiece:oldUnits.has(shot.target)?piece(before,oldUnits.get(shot.target)):undefined});
 if(!shots&&specific&&!['move','retreat','evacuate'].includes(specific.kind)){
  const redirect=specific.kind==='fire'&&specific.from&&specific.to&&/轉移/.test(specific.label);
  add({...specific,kind:specific.kind==='fire'&&!redirect?'check':specific.kind,shooter:redirect?specific.unit:undefined,region:anchor,piece:specific.unit&&oldUnits.has(specific.unit)?piece(before,oldUnits.get(specific.unit)):undefined});
 }
 if(order==='combat'&&ctx.order.target){
  const target=oldUnits.get(ctx.order.target),shooter=oldUnits.get(ctx.order.shooter);
  const first=after.recentDraws?.find(g=>g.why==='效果檢定')?.ids.find(id=>id!==51);
  const result=first&&G.card(first).results[ctx.order.n+4];
  if(target&&result)add({kind:'fire',target:target.id,to:spot(target),shooter:shooter?.id,from:spot(shooter),side:side(shooter),outcome:result.toLowerCase(),label:target.name+'・'+after.log.at(-1).text});
 }else if(order&&drawKinds[order]){
  const [kind,name]=drawKinds[order];
  const log=after.log.at(-1)?.text;
  add({kind,region:'discard',to:ctx.order.x!=null?spot(ctx.order):spot(currentUnit),
   side:order==='event'?before.phase==='enemy'?'enemy':'friendly':side(currentUnit),label:log&&!/#[0-9]/.test(log)?name+'・'+log:name});
 }
 // A quick battle may create and remove the same counter before the table is committed.
 // Its ordered combat events carry these temporary pieces and even unsuccessful checks.
 if(!noRoute&&!ctx.events?.length){
  for(const u of before.units){
   const v=newUnits.get(u.id);
   const item={side:side(u),piece:piece(before,u),from:spot(u)};
   if(!v){
    const exit=specific?.unit===u.id&&['retreat','evacuate'].includes(specific.kind);
    placement.push({...item,kind:exit?specific.kind:'remove',label:exit?specific.label:u.name+' 離開牌面'});
    continue;
   }
   if(u.x!==v.x||u.y!==v.y||specific?.unit===u.id&&specific.kind==='move'){
    moves.push({...item,kind:'move',to:spot(v),label:specific?.kind==='move'&&specific.unit===u.id?specific.label:u.name+'　'+spot(u)+' → '+spot(v)});
   }
   const labels=[];
   if(u.steps!==v.steps)labels.push(u.steps+' → '+v.steps+' 階');
   for(const [key,on,off] of [['pinned','受壓制','解除壓制'],['exposed','暴露','解除暴露'],['covered','取得掩蔽','離開掩蔽'],['casualty','傷亡','恢復編制']]){
    if(!!u[key]!==!!v[key])labels.push(v[key]?on:off);
   }
   if(u.lessonStatus!==v.lessonStatus)labels.push(v.lessonStatus||'移除'+u.lessonStatus);
   if(u.experience!==v.experience||u.art!==v.art||different(u.skills,v.skills)||u.notes!==v.notes)labels.push('更新算子資料');
   if(labels.length){
    const label=labels.join('、'),kind=v.casualty&&!u.casualty||v.steps<u.steps?'loss':pinned(u)!==pinned(v)?(pinned(v)?'pin':'rally'):/解除壓制|重整/.test(label)?'rally':/掩蔽/.test(label)?'cover':'status';
    changes.push({kind,label:u.name+'・'+label,side:side(v),piece:piece(after,v),to:spot(v)});
   }
  }
  for(const v of after.units)if(!oldUnits.has(v.id))placement.push({kind:'appear',label:v.name+' 登場',piece:piece(after,v),side:side(v),to:spot(v)});
 }
 if(specific&&['retreat','evacuate'].includes(specific.kind)&&!placement.some(e=>e.kind===specific.kind))add({...specific,inPlace:true,to:specific.to||specific.from});
 const oldMap=new Map(before.map.map(c=>[spot(c),c]));
 for(const c of after.map){
  const to=spot(c),old=oldMap.get(to);
  if(noRoute||!old)continue;
  if(!!old.faceDown!==!!c.faceDown||old.t!==c.t)lands.push({kind:'reveal',to,label:to+(c.faceDown?' 地形翻為牌背':' 揭開地形')});
  if(old.pc!==c.pc||old.hidden!==c.hidden||old.pending!==c.pending||old.contactDetail!==c.contactDetail){
   markers.push({kind:'contact',to,label:to+'・'+(c.pending?'待配置接敵':c.pc?'PC '+(c.hidden?'？':c.pc):'移除 PC')});
  }
  for(const [items,other,placing] of [[old.marks,c.marks,false],[c.marks,old.marks,true]]){
   const rest=[...other];
   for(const name of items){
    const index=rest.indexOf(name);if(index>=0){rest.splice(index,1);continue;}
    markers.push({kind:'marker',to,label:to+'・'+(placing?'放置':'移除')+name});
   }
  }
 }
 for(const [key,value] of Object.entries(after.objectives||{})){
  if(value&&different(before.objectives?.[key],value)&&!noRoute)markers.push({kind:'objective',to:spot(value),label:spot(value)+'・部署'+({primary:'主要目標',secondary:'次要目標',position:'攻擊陣地',outpost:'前哨'}[key]||'路線點')});
 }
 if(t&&!specific&&!shots&&!moves.length){
  const written=t.phase||'',kind=kindFor(written)==='check'?kindFor(t.text):kindFor(written);
  const owner=/敵軍活動/.test(written)?'enemy':side(currentUnit);
  add({kind:kind==='fire'?'check':kind,label:t.phase+'・'+(t.kind==='choice'?t.options[t.answer]:t.kind==='amount'?t.label+' '+t.answer:t.text),
   side:owner,to:t.at||spot(currentUnit),region:worksheet?'worksheet':kind==='order'?'command':anchor});
 }
 for(const craft of after.planes||[]){
  const old=before.planes?.find(p=>p.key===craft.key);
  if(old&&old.stage!==craft.stage)add({kind:'flight',side:'friendly',fromStage:old.stage,toStage:craft.stage,to:craft.stage===2?craft.landing:undefined,region:'flight',label:craft.model+' '+craft.key+'　'+window.FOF_CAMPAIGN_AIR.stages[old.stage]+' → '+window.FOF_CAMPAIGN_AIR.stages[craft.stage]});
 }
 add(...moves);add(...lands);add(...placement);add(...markers);add(...changes);
 const keys=new Set([...Object.keys(before.tracks||{}),...Object.keys(after.tracks||{})]);
 for(const k of keys)if(before.tracks?.[k]!==after.tracks?.[k])accounts.push({kind:'record',region:worksheet?'worksheet':'command',label:k+'　'+(after.tracks?.[k]??0)});
 if(before.points!==after.points)accounts.push({kind:'order',region:'command',label:'可用命令　'+after.points+' 點'});
 if(before.activity!==after.activity)accounts.push({kind:'contact',region:'command',label:'活動程度・'+(['未接敵','接敵','交戰','激烈交戰'][after.activity]||'更新')});
 if(before.vis!==after.vis&&order!=='weather'&&order!=='moonlight')accounts.push({kind:'weather',region:'board',label:'能見度　'+after.vis});
 if(different(before.entries,after.entries)||different(before.settlement,after.settlement)||different(before.company,after.company)||different(before.commandAreas,after.commandAreas))
  accounts.push({kind:'record',region:regions[ctx.action]||'worksheet',label:actionLabels[ctx.action]||'更新紀錄'});
 add(...accounts);
 if(before.phase!==after.phase||before.turn!==after.turn||before.outcome!==after.outcome)
  add({kind:'phase',side:after.phase==='enemy'?'enemy':'neutral',region:'command',label:after.outcome?'本次演練或任務結束':'第 '+after.turn+' 回合・'+(G.phaseNames[after.phase]||(C.has(after.id)&&C.current(after)?.phase)||'回合開始')});
 if(!beats.length){
  const label=actionLabels[ctx.action]||ctx.label||after.log.at(-1)?.text||'完成行動';
  add({kind:kindFor(label),side:side(currentUnit),region:regions[ctx.action]||anchor,to:ctx.at||spot(currentUnit),label});
 }
 return beats;
}
window.FOF_MOTION_EVENTS={plan};
})();
