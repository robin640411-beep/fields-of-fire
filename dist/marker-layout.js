/* Interpret physical counters independently of the text used in old saved games. */
(() => {
'use strict';
const covers=new Set(['cover','foxhole','trench','bunker','pillbox','lightbuilding','strongbuilding','tower']);
const personal=new Set(['exposed','pinned','unspotted','conc','grenade','mine-blast','vof-sniper','green','vet','activated','moved-fired','rifle-grenade','scr610','kr-fpl-l','kr-fpl-r']);
const strength={'vof-p':2,'vof-s':0,'vof-a':-1,'vof-h':-3,'incoming-3':-3,'incoming-4':-4,'incoming-5':-5};
function role(art){
 if(covers.has(art))return 'cover';
 if(art==='pdf')return 'direction';
 if(Object.hasOwn(strength,art))return 'vof';
 if(personal.has(art))return 'target';
 return 'area';
}
function symbol(label){
 if(window.FOF_COURSE_MARKS?.[label])return FOF_COURSE_MARKS[label];
 for(const [re,art] of [
  [/^PC\s*([ABC])/i,m=>'pc-'+m[1].toLowerCase()],[/^PC\s*\?/,'pc-hidden'],
  [/VOF\s+S!/i,'vof-sniper'],[/VOF\s+([PSAH])\b|^([PSAH]) 火力量/i,m=>'vof-'+(m[1]||m[2]).toLowerCase()],
  [/^(待發|來襲).*?([345])/,m=>(m[1]==='待發'?'pending':'incoming')+'-'+m[2]],
  [/^PDF\b|^主要射向/i,'pdf'],[/^雷區/,'mines'],[/^暴露$/,'exposed'],[/^受壓制$/,'pinned'],[/交叉火力/,'crossfire'],[/集中火力/,'conc'],[/榴彈未命中/,'grenade-miss'],
  [/散兵坑/,'foxhole'],[/戰壕/,'trench'],[/^掩體/,'bunker'],[/堅固建築/,'strongbuilding'],[/塔樓/,'tower'],[/基本掩蔽/,'cover'],
  [/未(?:被)?發現/,'unspotted'],[/主要目標/,'obj1'],[/次要目標/,'obj2'],[/已確保/,'secure'],[/傷亡收集點/,'ccp']
 ]){
  const m=re.exec(label);if(m)return typeof art==='function'?art(m):art;
 }
}
function direction(origin,to){
 if(!/^[A-Z]\d+$/.test(to||''))return null;
 const dx=to.charCodeAt(0)-origin.charCodeAt(0),dy=Number(to.slice(1))-Number(origin.slice(1));
 if(!(dx||dy))return null;
 const angle=(Math.round(Math.atan2(dx,dy)*4/Math.PI)*45+360)%360;
 return {angle,x:Math.sign(dx),y:-Math.sign(dy)};
}
const statusDefs=[['受壓制','pinned'],['乘員暴露','crew-exposed'],['暴露','exposed'],['未被發現','unspotted'],['未發現','unspotted'],['已移動／射擊','moved-fired'],['已啟動','activated'],['SCR610','scr610'],['槍榴彈 1 枚','rifle-grenade']];
function shelters(s,c){
 const result=[];
 for(const label of c.marks){
  const art=symbol(label);if(role(art)!=='cover')continue;
  const count=Math.min(16,Number(/×\s*(\d+)/.exec(label)?.[1]||1));
  for(let i=1;i<=count;i++)result.push({key:label+'|'+i,art,label:count>1?label.replace(/\s*×.*/,'')+' '+i:label});
 }
 for(const m of FOF.unitsAt(s,c))if(m.side==='marker'&&role(m.art)==='cover')result.push({key:m.id,art:m.art,label:m.name+'（'+m.id+'）'});
 return result;
}
function occupancyError(art,units){
  if(new Set(units.map(u=>u.side)).size>1)return '同一處掩蔽只能容納同一方的單位。';
  const limit={bunker:4,pillbox:2,tower:1}[art];
  return limit&&units.reduce((n,u)=>n+(u.steps||0),0)>limit?'這處掩蔽的上限是 '+limit+' 階。':'';
}
function leave(s,u){
 const cell=FOF.at(s,u);
 const doomed=new Set();
 for(const m of FOF.unitsAt(s,u)){
  if(m.side!=='marker'||!['grenade','conc'].includes(m.art))continue;
  if(!(m.members?.includes(u.id)||m.coverId&&m.coverId===u.shelter))continue;
  if(m.art==='grenade'&&!cell.marks.some(v=>symbol(v)==='grenade-miss')&&!FOF.unitsAt(s,u).some(v=>v.art==='grenade-miss'))cell.marks.push('榴彈未命中');
  doomed.add(m.id);
 }
 if(doomed.size)s.units=s.units.filter(m=>!doomed.has(m.id));
 delete u.shelter;u.covered=false;
}
function cleanup(s){
 const temporary=new Set(['conc','grenade','grenade-miss','exposed','mine-blast','moved-fired','activated']);
 for(const m of s.units){
  if(m.side!=='marker'||m.art!=='mine-blast')continue;
  const c=FOF.at(s,m);
  if(!c.marks.some(v=>symbol(v)==='mines')&&!FOF.unitsAt(s,c).some(v=>v.art==='mines'))c.marks.push('雷區');
 }
 for(const c of s.map)c.marks=c.marks.filter(m=>!temporary.has(symbol(m)));
 s.units=s.units.filter(m=>m.side!=='marker'||!temporary.has(m.art));
}
function onMove(s,u,p){
 leave(s,u);
 for(const m of FOF.unitsAt(s,u)){
  if(m.side!=='marker'||!m.members?.includes(u.id))continue;
  if(['unspotted','exposed','pinned','green','vet','scr610','rifle-grenade','activated','moved-fired','kr-fpl-l','kr-fpl-r'].includes(m.art)){m.x=p.x;m.y=p.y;}
  else delete m.members;
 }
}
function layout(s,c,units,raw){
 const here=FOF.nameAt(c);
 const rules=(window.FOF_MARKER_BINDINGS?.[s.id]||[]).filter(r=>r.at===here&&r.from<=s.cursor&&s.cursor<=r.to);
 const fixes=(window.FOF_LESSON_FRONTAGE?.[s.id]||[]).filter(r=>r.at===here&&r.from<=s.cursor&&s.cursor<=r.to);
 const input=fixes.length?raw.filter(m=>m.label!=='同牌交戰'&&(!m.art?.startsWith('vof-')||m.scope==='unit')):raw.slice();
 for(const r of fixes)for(const key of ['whole','friendly','enemy'])if(r[key])input.push({label:'VOF '+r[key],art:'vof-'+r[key].toLowerCase(),scope:key==='whole'?'top':key});
 const center=[],top=[],edges=[],corners={},per=new Map(units.map(u=>[u.id,[]])),groups=[],assigned=new Set(),locations=[];
 const get=id=>units.find(u=>u.id===id);
 const memberNames=ids=>ids.map(id=>get(id)?.label).filter(Boolean).join('、');
 const addUnit=(id,m)=>{
  const ls=per.get(id);if(!ls)return;
  if(m.art!=='conc'&&m.art&&!m.id&&ls.some(i=>i.art===m.art))return;
  ls.push({...m,info:[m.info,'所屬算子：'+get(id).label].filter(Boolean).join('　')});
 };
 const visible=(ids)=>Array.isArray(ids)?ids.filter(id=>get(id)):[];
 const hiddenRule=rules.find(r=>r.kind==='hidden');
 const enemies=units.filter(u=>u.side==='enemy'&&!u.casualty);
 const commonHidden=!!hiddenRule&&enemies.length>0;
 const vofs={top:[],friendly:[],enemy:[]};
 for(const r of rules)if(['cover','target','direction'].includes(r.kind)&&!input.some(m=>m.label===r.mark)&&r.mark)input.push({label:r.mark,short:r.mark.slice(0,2),art:symbol(r.mark),toward:r.toward});
 for(const m of input.sort((a,b)=>Number(role(b.art)==='cover')-Number(role(a.art)==='cover'))){
  const match=rules.filter(r=>r.mark===m.label);
  const r=match[0],placement=role(m.art),bound=r?.kind==='target'||m.scope==='unit';
  if(placement==='cover'){
   const count=Math.min(16,Number(/×\s*(\d+)/.exec(m.label)?.[1]||1));
   for(let i=1;i<=count;i++){
    const rule=match.find(v=>v.kind==='cover'&&(v.slot||1)===i);
    const key=m.id||m.label+'|'+i;
    const ids=visible(rule?.units||units.filter(u=>u.shelter===key).map(u=>u.id)).filter(id=>!assigned.has(id));
    const info=ids.length?'掩蔽內：'+memberNames(ids):'此掩蔽目前無人';
    const facing=m.facing??direction(here,rule?.toward)?.angle;
    const cover={...m,facing,label:count>1?m.label.replace(/\s*×.*/,'')+' '+i:m.label,short:m.art==='tower'?'塔樓':m.short,info:[info,rule?.toward&&'朝向 '+rule.toward].filter(Boolean).join('　')};
    groups.push({members:ids,cover,key});ids.forEach(id=>assigned.add(id));
    locations.push(cover);
   }
  }else if(m.art==='pdf'){
   const to=m.toward||r?.toward||/([A-Z]\d+)\s*$/.exec(m.label)?.[1],bearing=direction(here,to);
   const entry={...m,label:to?'主要射向 → '+to:m.label,info:to?here+' 射向 '+to:'選擇此標記可指定射向',bearing};
   if(bearing&&!edges.some(v=>v.bearing.angle===bearing.angle))edges.push(entry);else if(!bearing)center.push(entry);
   locations.push(entry);
  }else if(bound||placement==='target'){
   if(m.art==='unspotted'&&commonHidden){if(!top.some(v=>v.art===m.art)){const entry={...m,info:'本牌全部敵軍：'+memberNames(hiddenRule.units)};top.push(entry);locations.push(entry);}continue;}
   if(m.art==='unspotted'&&m.id){if(!top.some(mark=>mark.art===m.art)){const entry={...m,info:'本牌全部敵軍'};top.push(entry);locations.push(entry);}continue;}
   const ids=m.scope==='stack'?units.filter(u=>u.shelter===m.coverId).map(u=>u.id):visible(m.members||r?.units||hiddenRule&&m.art==='unspotted'&&hiddenRule.units);
   if(ids.length){
    const entry={...m,info:memberNames(ids)};locations.push(entry);
    if(m.scope==='stack'&&m.coverId){
     const group=groups.find(g=>g.key===m.coverId);
     if(group){(group.conditions||=[]).push(entry);continue;}
    }
    ids.forEach(id=>addUnit(id,m));
   }else{const entry={...m,info:'尚未指定所屬算子'};center.push(entry);locations.push(entry);}
  }else if(placement==='vof'){
   (vofs[m.scope]||vofs.top).push(m);
  }else{
   const entry={...m,short:m.short||m.label.slice(0,2)};
   if(['crossfire','grenade-miss'].includes(m.art)&&top.some(v=>v.art===m.art))continue;
   (['crossfire','grenade-miss'].includes(m.art)?top:center).push(entry);locations.push(entry);
  }
 }
 const best=items=>items.sort((a,b)=>strength[a.art]-strength[b.art]||Number(b.art.startsWith('incoming'))-Number(a.art.startsWith('incoming')))[0];
 const external=best(vofs.top);if(external)top.unshift(external);
 for(const key of ['friendly','enemy']){
  const v=best(vofs[key]);
  if(v&&(!external||strength[v.art]<strength[external.art]))corners[key]=v;
 }
 for(const [scope,items] of Object.entries(vofs))for(const m of items)locations.push({...m,info:({top:'牌外射入，影響全牌',friendly:'同牌友軍射出',enemy:'同牌敵軍射出'})[scope]});
 if(commonHidden&&!top.some(m=>m.art==='unspotted')){const m={label:'未發現',art:'unspotted',info:'本牌全部敵軍：'+memberNames(hiddenRule.units)};top.push(m);locations.push(m);}
 for(const u of units){
  if(u.casualty&&!/casualty|loss/i.test(u.art||''))addUnit(u.id,{label:'傷亡',art:u.side==='enemy'?'de-casualty':'casualty'});
  const tokens=(u.condition||'').split(/\s*[、・·]\s*/);
  for(const [name,art] of statusDefs){
   if(!tokens.includes(name)||art==='unspotted'&&commonHidden)continue;
   if(art==='unspotted'&&per.get(u.id).some(m=>m.art===art))continue;
   addUnit(u.id,{label:name,short:name.slice(0,2),art});
  }
  if(u.covered&&!assigned.has(u.id)){
   const m={label:'基本掩蔽',art:'cover',info:'掩蔽內：'+u.label};groups.push({members:[u.id],cover:m});locations.push(m);assigned.add(u.id);
  }
 }
 for(const r of rules.filter(r=>r.kind==='carry')){
  if(!get(r.host))continue;
  const members=visible(r.units);
  let g=groups.find(g=>g.members.includes(r.host));
  if(!g){g={members:[r.host]};groups.push(g);assigned.add(r.host);}
  g.members=[...members.filter(id=>!assigned.has(id)),...g.members];g.host=r.host;members.forEach(id=>assigned.add(id));
 }
 for(const u of units)if(!assigned.has(u.id))groups.push({members:[u.id]});
 return {groups,per,top,corners,edges,center,locations};
}
window.FOF_MARKERS={role,symbol,direction,layout,shelters,leave,onMove,cleanup,occupancyError};
})();