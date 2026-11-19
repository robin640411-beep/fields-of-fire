(() => {
'use strict';
const C=window.FOF_CAMPAIGNS,G=window.FOF;
const grades=Object.keys(C.gradeNames),skills={'一般主動行動':2,'癱瘓組轉為突擊組':2,'癱瘓組轉為火力組':1,'產生小組':1,'額外抽卡':1,'自動發現':1,'自動掩蔽':1,'自動集中射擊':1,'自動滲透':1,'自動榴彈':1};
const sum=o=>Object.values(o).reduce((a,b)=>a+b,0);
function score(s){
 const m=G.scenario(s.id),o=m.xp||{},paid={};let clears=0;
 for(const c of s.map){if(!G.isClear(s,c))continue;
  const k=G.nameAt(c),secured=G.secured(s,c),obj=Object.entries(s.objectives).find(([,p])=>G.same(c,p))?.[0];
  let value=0;
  if(m.book==='H')value=m.mode==='defense'?+secured:obj?0:2;
  else if(o.type==='zone')value=(o.clearCells?.includes(k)?o.clearEach:0)+(secured&&o.securedCells?.includes(k)?o.securedEach:0);
  else if(o.type==='clearThreshold')value=++clears<=o.threshold?o.upTo:o.over;
  else if(o.type==='clearRows')value=o.rows.includes(c.y)?o.clearEach:0;
  else if(o.type==='patrolColumn')value=c.x===o.column-1?o.clearEach:0;
  else if(o.type==='defense')value=+secured+Number(o.clearedRows.includes(c.y));
  else if(m.mode==='patrol')value=obj==='primary'?(o.clearPrimary||4):o.otherRows?.includes(c.y)?1:0;
  else if(obj)value=secured?({primary:5,secondary:4,position:3}[obj]||0):0;
  else value=c.originalPC==='A'?2:c.originalPC?1:0;
  if(value)paid[k]=value;
 }
 if(m.book==='H'&&s.outcome==='win')paid.success=5;
 return paid;
}
function total(s){if(G.scenario(s.id).mode==='patrol')return s.patrolHistory.reduce((a,v)=>a+v.xp,0);
 const vals={...s.xpCards};for(const [k,v] of Object.entries(score(s)))vals[k]=Math.max(vals[k]||0,v);return sum(vals);}
function survivors(s){
 const m=G.scenario(s.id);
 return (s.company||[]).map(meta=>{
  if(m.mode==='patrol'&&meta.platoon!==s.patrol&&!s.patrolAttached?.includes(meta.id)||m.excludeFormations?.length&&(meta.platoon===4||meta.id==='81mm Sec'))return structuredClone(meta);
  const u=[...s.units,...(s.offboard||[])].find(u=>u.rosterId===meta.id);
  return {...meta,steps:u&&!u.casualty?Math.min(meta.max,u.steps):0,experience:u?.experience||meta.experience,skills:[]};
 });
}
function stopReason(s){
 const m=G.scenario(s.id),series=s.series,leader=survivors(s).find(u=>u.art==='co-hq');
 if(series.rule!=='standard'&&(!leader?.steps||series.coLost))return '連指揮部已成為傷亡，戰役結束。';
 if(series.rule!=='survivor'&&s.outcome==='loss'&&m.mode!=='patrol')return '本任務已用完允許的嘗試次數，戰役結束。';
 return '';
}
function maxRecruits(s,loss){
 const m=G.scenario(s.id);
 if(s.outcome!=='win'&&m.mode!=='patrol')return 0;
 if(m.book==='V'||m.book==='N')return 6;
 if(m.book==='K')return m.replacements||0;
 return m.reinforcements==='full'?loss:(m.reinforcements||0);
}
function eligibleNext(s){return C.books[s.series.book].order[s.series.index+1]||[];}
function openSettlement(s){
 if(!s.series||!s.outcome||s.series.finished||s.settlement)return false;
 const m=G.scenario(s.id);
 if(s.outcome==='loss'&&m.mode!=='patrol'&&s.attempt<=m.retries&&!(s.series.rule!=='standard'&&s.series.coLost))return false;
 const list=survivors(s),lat=s.units.filter(u=>u.side==='friendly'&&!u.casualty&&!u.rosterId&&['fire','assault','litter','paralyzed'].includes(u.art)).reduce((n,u)=>n+u.steps,0);
 const loss=list.reduce((n,u)=>n+u.max-u.steps,0),start=s.company.reduce((n,u)=>n+u.steps,0);
 const lost=Math.max(0,start-list.reduce((n,u)=>n+u.steps,0)-lat)+(s.patrolLosses||0);
 const rows=list.map(u=>({...u,ranks:Array.from({length:u.steps},()=>({grade:u.experience})),skills:[]}));
 const record={id:s.id,outcome:s.outcome,attempt:s.attempt,xp:total(s),patrols:structuredClone(s.patrolHistory)};
 const reason=stopReason(s);
 if(reason||!eligibleNext(s).length){
  s.series.history.push(record);s.series.finished=reason||'已完成全部任務。';s.series.won=!reason;return true;
 }
 s.settlement={phase:'report',rows,record,xp:record.xp,extra:0,lat,captured:0,lost,loss,
   green:0,veteran:0,spent:0,perPlatoon:{},spentBy:{},returned:0,rotation:0,transfers:[]};
 if(m.mode==='patrol')s.patrolHistory.forEach((r,i)=>s.settlement.perPlatoon[i+1]=r.xp);
 return true;
}
function ledger(s,action,value){
 const t=s.settlement;if(!t)return false;
 const m=G.scenario(s.id),r=t.rows.find(row=>row.id===value?.id),p=value?.platoon||r?.platoon;
 const reserve=(price)=>{
  if(m.mode==='patrol'){
    if(!p||(t.perPlatoon[p]||0)-(t.spentBy[p]||0)<price||t.xp+t.extra-t.spent<price)return false;
    t.spentBy[p]=(t.spentBy[p]||0)+price;
  }
  if(t.xp+t.extra-t.spent<price)return false;
  t.spent+=price;return true;
 };
 if(action==='report'&&t.phase==='report'){
  const {extra,captured,lost,lat,patrolExtra}=value;
  if(![extra,captured,lost,lat].every(n=>Number.isInteger(n)&&n>=0&&n<=500)||captured>lost||lat>t.loss)return false;
  if(m.mode==='patrol'){
   if(!Array.isArray(patrolExtra)||patrolExtra.length!==3||patrolExtra.some(n=>!Number.isInteger(n)||n<0||n>500))return false;
   patrolExtra.forEach((n,i)=>t.perPlatoon[i+1]+=n);
   t.extra=patrolExtra.reduce((a,b)=>a+b,0);
  }else t.extra=extra;
  t.captured=captured;t.lost=lost;t.lat=lat;t.veteran=Math.floor((lost-captured)/4);t.green=maxRecruits(s,t.loss);
  t.rotation=m.book==='V'?Math.min(2,t.rows.reduce((n,r)=>n+r.ranks.filter(z=>z.grade==='veteran').length,0)):0;
  t.phase='rebuild';return true;
 }
 if(action==='rotate'&&t.phase==='rebuild'&&t.rotation&&r){
  const i=r.ranks.findIndex(z=>z.grade==='veteran');if(i<0)return false;r.ranks.splice(i,1);t.rotation--;return true;
 }
 if(t.phase==='rebuild'&&!t.rotation&&r){
   const leader=/HQ|指揮部|排部|副官|士官長/.test(r.name+' '+r.id);
   if(action==='detach'&&r.ranks.length){const rank=r.ranks.pop();t.transfers.push(rank);return true;}
   if(action==='rebuild'&&r.ranks.length<r.max&&(t.lat||t.transfers.length)){
    let rank;if(t.transfers.length)rank=t.transfers.pop();else{rank={grade:'green'};t.lat--;}
    if(!r.ranks.length&&leader){rank.grade='green';rank.locked=true;}
    r.ranks.push(rank);return true;
   }
   if(action==='promote'){
    const rank=r.ranks[value.index];if(!rank||rank.locked||rank.grade==='veteran'||(r.katusa&&rank.grade==='line')||(s.outcome==='loss'&&r.art==='co-hq'))return false;
    const cost=rank.grade==='green'?1:3;if(!reserve(cost))return false;
    rank.grade=grades[grades.indexOf(rank.grade)+1];rank.locked=true;return true;
   }
 }
 if(action==='finishRebuild'&&t.phase==='rebuild'&&!t.rotation){t.phase='replace';t.katusa=eligibleNext(s).includes('K6')?12:0;return true;}
 if(action==='fill'&&t.phase==='replace'&&r&&r.ranks.length<r.max&&['green','veteran','katusa'].includes(value.grade)){
   const g=value.grade;
   if(g==='katusa'){if(!r.rifle||r.ranks.length&&!r.katusa||!(t.katusa>0))return false;t.katusa--;r.katusa=true;r.art=C.katusaArt('green');}
   else {if(!t[g]||r.katusa&&g==='veteran')return false;t[g]--;}
   const isHQ=/指揮部|排部|副官|士官長/.test(r.name);
   r.ranks.push({grade:isHQ&&!r.ranks.length||g==='katusa'?'green':g,locked:true});return true;
 }
 if(action==='finishReplace'&&t.phase==='replace'){
   const next=eligibleNext(s);
   if(next.includes('VN4')){
     for(const u of t.rows)while(u.ranks.length<u.max)u.ranks.push({grade:'green',locked:true});
   }
   if(m.book==='V'){
    t.hqRotation=t.rows.some(r=>r.platoon&&/指揮部|排部/.test(r.name)&&r.ranks.some(z=>z.grade!=='green'));
    t.tour=next.includes('VN4')?Math.min(10,t.rows.flatMap(r=>r.ranks).filter(z=>z.grade!=='green').length):0;
   }
   t.phase='skills';return true;
 }
 if(action==='rotateHQ'&&t.phase==='skills'&&t.hqRotation&&r&&r.platoon&&/排部|指揮部/.test(r.name)&&r.ranks[0]?.grade!=='green'&&r.ranks.length){r.ranks[0].grade='green';t.hqRotation=false;return true;}
 if(action==='tour'&&t.phase==='skills'&&t.tour&&r){const rank=r.ranks.find(z=>z.grade!=='green');if(!rank)return false;rank.grade='green';t.tour--;return true;}
 if(action==='skill'&&t.phase==='skills'&&r&&r.ranks.length&&/指揮部|排部|士官長|副官/.test(r.name)&&r.skills.length<3&&Object.hasOwn(skills,value.skill)&&reserve(skills[value.skill])){
   r.skills.push(value.skill);return true;
 }
 return false;
}
function advance(s,next){
 const t=s.settlement;
 if(t?.phase!=='skills'||t.hqRotation||t.tour||!eligibleNext(s).includes(next))return null;
 const company=t.rows.map(r=>{const {ranks,...u}=r;return {...u,steps:ranks.length,experience:C.composite(ranks.map(z=>z.grade))};});
 const series=structuredClone(s.series);series.history.push({...t.record,xp:t.xp+t.extra,spent:t.spent});series.index++;
 const m=G.scenario(next);return C.create(next,{company,series,form:series.form,previous:m.carryMapFrom===G.scenario(s.id).number?s:null});
}
function nextPatrol(s,skipped=false){
 const m=G.scenario(s.id);if(m.mode!=='patrol'||skipped&&(!s.series||!m.patrol?.optionalInCampaign||s.phase!=='setup')||!skipped&&s.phase!=='patrolresult')return null;
 const ok=!skipped&&G.goals(s).every(g=>g.done),xp=skipped?0:sum(score(s))+(m.book==='N'?s.visits.way:0)+(ok?5:0);
 const history=[...s.patrolHistory,{ok,xp,skipped}];
 if(s.patrol===3){s.patrolHistory=history;s.outcome=history.every(r=>r.ok)?'win':'loss';G.note(s,'三個排的巡邏已結算。');return s;}
 const company=skipped?s.company:survivors(s);
 const newLoss=Math.max(0,s.company.reduce((n,u)=>n+u.steps,0)-company.reduce((n,u)=>n+u.steps,0));
 const fresh=C.create(s.id,{company,series:s.series,form:s.startingForm,patrol:s.patrol+1,previous:m.patrol?.freshMap?null:s});
 if(!m.patrol?.freshMap){
  for(const c of fresh.map){const old=G.at(s,c);c.marks=[...old.marks];if(old.pc){c.pc=old.pc;c.hidden=old.hidden;}}
  if(s.objectives.outpost)G.placeObjective(fresh,'outpost',s.objectives.outpost);
 }
 fresh.patrolLosses=(s.patrolLosses||0)+newLoss;fresh.patrolHistory=history;fresh.notes=s.notes;fresh.log=[...s.log,...fresh.log].slice(-499);G.note(fresh,'第 '+fresh.patrol+' 排開始巡邏設置。');return fresh;
}
function valid(s){
 const f=s.series,b=C.books[f?.book];
 if(!b||!Object.hasOwn(C.rules,f.rule)||!Number.isInteger(f.index)||!b.order[f.index]?.includes(s.id)||!Array.isArray(f.history)||f.history.length>b.order.length)return false;
 if(!Array.isArray(s.company)||s.company.length>100||!s.company.every(u=>typeof u.id==='string'&&typeof u.name==='string'&&Number.isInteger(u.max)&&u.max>0&&u.max<=16&&Number.isInteger(u.steps)&&u.steps>=0&&u.steps<=u.max&&grades.includes(u.experience)))return false;
 if(!f.history.every((r,i)=>b.order[i]?.includes(r.id)&&['win','loss'].includes(r.outcome)&&Number.isInteger(r.xp)))return false;
 if(f.history.length!==f.index+Number(!!f.finished)||f.finished!==undefined&&typeof f.finished!=='string')return false;
 if(s.settlement){const t=s.settlement;if(!t.record||t.record.id!==s.id||!Array.isArray(t.transfers)||!t.spentBy||!t.perPlatoon||!['xp','extra','lat','lost','spent','green','veteran','rotation'].every(k=>Number.isInteger(t[k])&&t[k]>=0)||!s.outcome||!['report','rebuild','replace','skills'].includes(t.phase)||!Array.isArray(t.rows)||t.rows.length!==s.company.length||!t.rows.every((r,i)=>r.id===s.company[i].id&&Array.isArray(r.ranks)&&r.ranks.length<=r.max&&r.ranks.every(z=>grades.includes(z.grade))&&Array.isArray(r.skills)&&r.skills.every(x=>Object.hasOwn(skills,x))))return false;}
 return true;
}
window.FOF_SERIES={score,total,survivors,openSettlement,ledger,advance,nextPatrol,eligibleNext,valid,skills};
})();
