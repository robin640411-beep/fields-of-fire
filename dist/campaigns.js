/* Mission books share a physical table. Coordinates count upward from the player's edge. */
(() => {
'use strict';
const G=window.FOF, books=window.FOF_BOOKS, fog=window.FOF_TERRAIN_VISIBILITY;
Object.assign(window.FOF_TABLES,books.V.tables);
const clone=structuredClone, cells=(s,fn)=>s.map.filter(c=>c.y&&fn(c));
const coord=k=>({x:k.charCodeAt(0)-65,y:Number(k.slice(1))});
const gradeNames={green:'新兵',line:'一般',veteran:'老兵'};
const rules={standard:'標準',survivor:'生存者',hardcore:'硬派'};
const unit=(id,name,steps=1,experience='line',more={})=>({id,art:id,name,steps,experience,...more});
const range=n=>Array.from({length:n},(_,i)=>i+1);
const normandy=[unit('co-hq','連指揮部',1,'green'),unit('co-xo','連副官',1,'green'),unit('first-sgt','連士官長',1,'veteran'),unit('mtr','60 公釐迫砲分隊',3,'line',{ammo:4}),
  ...['hmg50','lmg','lmg2','at','at2','at3'].map(id=>unit(id,window.FOF_PIECES.find(p=>p.id===id).name.split(' · ')[0])),
  ...range(3).flatMap(p=>[unit(p===1?'hq':'hq'+p,'第'+p+'排部',1,'green',{platoon:p}),...range(3).map(j=>unit((p===1?'':'p'+p)+'s'+j,'第'+p+'排第'+j+'班',3,'line',{platoon:p}))])];
books.N={title:'諾曼第',roster:normandy,missions:window.FOF_SCENARIOS.slice(),commonAttachments:[unit('jeep','無乘員吉普車')],pages:48};
const labels={N:'諾曼第',K:'洛東江',H:'傷心嶺',V:'越南'};
const starts={N:12,K:11,H:11,V:11},omit={H:[46],V:[54]};
for(const [k,book] of Object.entries(books)){
  book.label=labels[k];book.refPages=range(book.pages).filter(p=>p>=starts[k]&&!omit[k]?.includes(p));
  book.order=book.campaignOrder||book.missions.map(m=>[m.id]);
  for(const m of book.missions){
    m.book=k;m.campaign=book.label;m.mapPage=m.references?.map||m.setupPage||m.mapPage||m.page+1;
    if(m.waypointRows)Object.assign(m.objectives,{waypointRows:m.waypointRows,returnFromRow:3,returnToRow:2});
    if(k!=='N')window.FOF_SCENARIOS.push(m);
  }
}
const catalog=new Map([...window.FOF_PIECES,...window.FOF_COURSE_PIECES,...window.FOF_CAMPAIGN_PIECES].map(a=>[a.id,a]));
for(const i of range(11))window.FOF_CAMPAIGN_TERRAIN.push({id:'HBR'+i,code:'HBR'+i,name:'傷心嶺高度牌',type:'hill',face:'assets/campaign/HBR'+i+'.webp'});
const terrain=window.FOF_CAMPAIGN_TERRAIN;
const key=s=>s.series?'campaign-'+s.series.book:s.id;
const turnLimit=s=>{const m=G.scenario(s.id);return m?.attemptTurns?.[s.attempt-1]||m?.turns;};
const moon=s=>G.scenario(s.id)?.book==='N'&&G.scenario(s.id)?.mode==='patrol';
function light(s){
  const m=G.scenario(s.id);
  if(moon(s))return s.vis;
  return m.attemptVisibility?.[s.attempt-1]?.[s.turn-1]??m.visibilityByTurn?.[s.turn-1]??(Array.isArray(m.visibility)?m.visibility[s.turn-1]:m.visibility)??0;
}
function composite(grades){
 const n=grades.length,v=grades.filter(x=>x==='veteran').length,l=grades.filter(x=>x==='line').length;
 if(!n)return 'green';
 if(n===1||v===n||l===n)return grades[0];
 if(n===2)return v?'line':'green';
 if(n===3)return v===2&&l===1?'veteran':v||l>=2?'line':'green';
 return v>=3?'veteran':v>=2||l>=3||v===1&&l===2?'line':'green';
}
function artFor(u){
 if(catalog.has(u.art))return u.art;
 const id=u.id,n=u.name,p=u.platoon||1,j=/第(\d+)班/.exec(n)?.[1]||1;
 if(/班/.test(n)&&u.platoon)return p===4?'s'+j:(p===1?'':'p'+p)+'s'+j;
 if(/排部|排指揮部/.test(n))return p===4?'vn-hq4':p===1?'hq':'hq'+p;
 const pairs=[[/連指揮部/,'co-hq'],[/副官/,'co-xo'],[/士官長/,'first-sgt'],[/\.50/,'hmg50'],[/巴祖卡/,'at'],[/機槍/,'lmg'],[/砲兵前進|砲兵觀測/,'arty-fo'],[/觀測/,'fo'],[/無後座/,'at'],[/迫.*(分隊|小組)/,'mtr'],[/戰車|M48/,'sherman'],[/空管|空中管制/,'vn-fac'],[/工兵/,'eng'],[/狙擊/,'fire']];
 return pairs.find(([pat])=>pat.test(n))?.[1]||u.art||id;
}
function roster(bookId,option='mortar81'){
 const book=books[bookId],list=clone(book.roster).filter(u=>!u.autoReplace);
 if(bookId==='V'){
   const form=book.rosterOptions[option];list.push(...clone(form.units));
   const grades=G.shuffle(Object.entries(form.pool).flatMap(([g,n])=>Array(n).fill(g)));
   for(const u of list)if(!u.experience){u.initialGrades=grades.splice(0,u.steps);u.experience=composite(u.initialGrades);}
 }
 return list.map(u=>({...u,art:bookId==='V'&&catalog.has('vn-sq-'+u.id.replace('/',''))?'vn-sq-'+u.id.replace('/',''):artFor(u),max:u.steps,experience:u.experience||'line'}));
}
function attachments(m){
 const book=books[m.book];let extra=[];
 if(m.book==='N'){
   const ids=['arty-fo',...(m.number>=2?['fo']:[]),...(m.number>=3&&m.number<=5?['hmg1','hmg2']:[]),...(m.number>=6?['eng']:[])];
   extra=[...book.commonAttachments,...ids.map(id=>unit(id,catalog.get(id).name.split(' · ')[0],id==='eng'?3:1)),
     ...range(m.number===6?5:m.number===7?4:0).map(i=>unit('armor'+i,(m.number===6?'雪曼戰車':'M10')+' '+i,1,'line',{art:m.number===6?'sherman':'m10'}))];
 }else if(m.book==='K')extra=m.attachments;
 else if(m.book==='H')extra=[...book.roster.filter(u=>u.autoReplace),...m.extraAttachments];
 else extra=[...book.commonAttachments,...m.attachments.map((name,i)=>({id:'mission'+i,name,steps:name.includes('3階')?3:1})),...(m.vehicles||[]).flatMap(model=>range(model.count).map(i=>unit(model.id+i,model.id+' '+i,1,'line',{ammo:model.ammo})))];
 return extra.map(u=>({...u,art:/M48/.test(u.id)?'vn-m48':artFor(u),attachment:true}));
}
function createMap(s,m,previous){
 const book=books[m.book],prefix=m.book==='V'?'VN':'K';
 let cards=G.shuffle(terrain.filter(t=>t.id.startsWith(prefix)));
 const kind=t=>t.type, terrainRules=m.terrainSetup||{}, excluded=terrainRules.exclude||[];
 const hiddenMap=fog.usesHiddenMap(m);
 cards=cards.filter(t=>!excluded.some(v=>kind(t).toLowerCase().startsWith(v)));
 const drawCard=predicate=>{const i=cards.findIndex(predicate);if(i<0)throw Error('地形牌不足 '+m.id);return cards.splice(i,1)[0];};
 const land=t=>{const n=Number(t.id.slice(2));return n>=9&&n<=24||n>=31&&n<=36||n>=41&&n<=48;};
 const prepared=new Map(), hillPool=G.shuffle(terrain.filter(t=>/^K\d+$/.test(t.id)&&t.type==='hill').map(t=>t.id));
 if(m.book==='H'){
   const usable=t=>['Open','Rocky','Brush','Gully Draw'].includes(t.type);
   const cellOrder=range(m.rows).flatMap(y=>range(m.cols).map(i=>({x:i-1,y}))).sort((a,b)=>Number(b.x===1)-Number(a.x===1));
   const elevs=Object.fromEntries(Object.entries(book.elevationCards).map(([level,ids])=>[level,G.shuffle(ids)]));
   for(const p of cellOrder){const t=drawCard(t=>usable(t)&&(m.number===5||p.x!==1||t.type!=='Gully Draw'));
     const z=m.heights[p.y-1][p.x];prepared.set(G.nameAt(p),{t:t.id,hills:z>1?[elevs[z].pop()]:[],level:z});}
 }else{
   const forced=new Map();
   if(terrainRules.innerDeck){
    const inner=new Set(terrainRules.innerCells);
    const types={open:'Open',ricePaddy:'Rice Paddy',elephantGrass:'Elephant Grass',brush:'Brush',rubber:'Rubber Plantation',bamboo:'Bamboo'};
    for(const [inZone,deck] of [[true,terrainRules.innerDeck],[false,terrainRules.outerDeck]]){
      const faces=G.shuffle(Object.entries(deck).flatMap(([k,count])=>range(count).map(()=>drawCard(t=>t.type===types[k]))));
      for(let y=1;y<=m.rows;y++)for(let x=0;x<m.cols;x++){const k=G.nameAt({x,y});if(inner.has(k)===inZone)forced.set(k,faces.pop());}
    }
   }
   if(terrainRules.centerLanding)forced.set(terrainRules.centerLanding,drawCard(land));
   if(terrainRules.landingRows)for(const y of terrainRules.landingRows)for(let x=0;x<m.cols;x++)forced.set(G.nameAt({x,y}),drawCard(land));
   if(terrainRules.landingChoice==='randomAdjacentToCenter'){
     const p=coord(terrainRules.centerLanding);
     const neighbors=range(3).flatMap(i=>range(3).map(j=>({x:p.x+i-2,y:p.y+j-2}))).filter(q=>!G.same(q,p)).map(G.nameAt);
     for(const k of neighbors)forced.set(k,drawCard(()=>true));
     const candidates=G.shuffle(neighbors.filter(k=>land(forced.get(k))));
     const replacements=G.shuffle(neighbors.filter(k=>!land(forced.get(k))));
     while(candidates.length<2){
       const k=replacements.pop(),old=forced.get(k);
       forced.set(k,drawCard(land));cards.push(old);candidates.push(k);
     }
     s.landing=[terrainRules.centerLanding,...candidates.slice(0,2)];
     cards=G.shuffle(cards);
   }
   const mandatory=new Map();for(const y of m.hillRows||[])for(let x=0;x<m.cols;x++)mandatory.set(G.nameAt({x,y}),drawCard(t=>t.type==='hill').id);
   for(let y=1;y<=m.rows;y++)for(let x=0;x<m.cols;x++){
     const p={x,y},k=G.nameAt(p),old=previous&&G.at(previous,p);
     if(old){prepared.set(k,{t:old.t,hills:[...(old.hills||[])],marks:(old.marks||[]).filter(a=>/掩蔽|散兵坑|雷區/.test(a)&&!(m.carryMap?.dropDiscoveredCoverRows?.includes(y)&&/掩蔽/.test(a)))});continue;}
     let hills=mandatory.has(k)?[mandatory.get(k)]:[],t=forced.get(k)||drawCard(()=>true);
     while(!hiddenMap&&t.type==='hill'){hills.push(t.id);t=drawCard(()=>true);}
     prepared.set(k,{t:t.id,hills});
   }
 }
 const bags={};for(const [row,str] of Object.entries(m.pcBags||{}))bags[row]=G.shuffle([...str]);
 const unknown=G.shuffle([...('A'.repeat(16)+'B'.repeat(16)+'C'.repeat(16))]);
 for(let y=m.staging?0:1;y<=m.rows;y++)for(let x=0;x<m.cols;x++){
   const p={x,y},k=G.nameAt(p),face=prepared.get(k)||{t:0,hills:[]};
   let raw=y?(m.pcGrid?.[y-1]?.[x]??m.pcRows?.[y-1]):null;
   if(Object.hasOwn(m.pcExceptions||{},k))raw=m.pcExceptions[k];
   const hidden=raw?.startsWith('?')||false;
   const pc=bags[y]?.[x]||(raw==='?'?unknown.pop():raw?G.shuffle(raw.replace('?','').split('/'))[0]:null);
   s.map.push({...p,...face,h:face.hills.length,pc,originalPC:pc,hadPC:!!pc,pending:false,hidden,marks:face.marks||[]});
 }
 if(terrainRules.landingCount&&!s.landing){
   if(terrainRules.centerLanding)s.landing=[terrainRules.centerLanding];
   else if(terrainRules.randomLanding){let eligible=cells(s,c=>land(G.terrain(c.t)));if(!eligible.length){const c=G.shuffle(cells(s,()=>true))[0];c.t=drawCard(land).id;eligible=[c];}s.landing=[G.nameAt(G.shuffle(eligible)[0])];}
   else {const i=Math.floor(Math.random()*(m.cols-2));s.landing=range(3).map(j=>G.nameAt({x:i+j-1,y:1}));}
 }else if(terrainRules.centerLanding&&!s.landing)s.landing=[terrainRules.centerLanding];
 for(const k of s.landing||[]){const c=G.at(s,coord(k));c.marks.push('著陸區 LZ');if(m.pcSkipLanding||m.pcOnLanding){c.pc=m.pcOnLanding||null;c.originalPC=c.pc;c.hadPC=!!c.pc;c.hidden=false;}}
 if(terrainRules.randomVillageObjective){const villages=cells(s,c=>terrain.find(t=>t.id===c.t)?.type==='Village'&&!s.landing.includes(G.nameAt(c)));const options=villages.length?villages:cells(s,c=>!s.landing.some(k=>G.same(c,coord(k))||G.near(c,coord(k))));const c=G.shuffle(options)[0];s.objectives.primary={x:c.x,y:c.y};}
 if(hiddenMap){
   s.terrainReserve=cards.map(t=>t.id).reverse();
   fog.setup(s,m);
 }
 for(const [k,v] of Object.entries(m.fixedObjectives||{}))s.objectives[k]=typeof v==='string'?coord(v):clone(v);
 if(m.primaryChoices?.length===1)s.objectives.primary=coord(m.primaryChoices[0]);
 if(previous)for(const u of previous.units.filter(u=>u.side==='marker'&&['cover','mines','foxhole','trench','bunker','pillbox'].includes(u.art)&&!(u.art==='cover'&&m.carryMap?.dropDiscoveredCoverRows?.includes(u.y))))s.units.push({...u,id:'u'+(++s.serial)});
}
function deploy(s,m,manifest,patrol=1){
 const eligible=manifest.filter(u=>u.steps>0&&(u.id!=='81mm Sec'||u.steps>=2)&&(!m.excludeFormations?.length||!(u.platoon===4||u.id==='81mm Sec')));
 const list=m.mode==='patrol'?eligible.filter(u=>u.platoon===patrol):eligible;
 const choices=m.deploymentCells||s.landing||[],y=m.patrolStartRow??(m.mode==='patrol'&&m.book==='N'?1:m.mode==='defense'?1:m.staging?0:1);
 for(const [i,u] of [...list,...attachments(m).filter(()=>m.mode!=='patrol')].entries()){
   const p=choices.length?coord(choices[i%choices.length]):{x:i%m.cols,y};
   s.units.push({...G.piece('company-'+u.id,u.name,u.id,u.steps,p.x,p.y,'friendly',u.art),rosterId:u.attachment?null:u.id,experience:u.experience||'line',max:u.max??u.steps,ammo:u.ammo,skills:clone(u.skills||[]),attached:!!u.attachment});
 }
 s.company=clone(manifest);
}
function init(s,m,previous,options={}){
 s.patrol=options.patrol||1;s.vis=light(s);s.startingForm=options.form||'mortar81';
 if(m.book!=='N')createMap(s,m,previous);
 else s.units=s.units.filter(u=>u.side==='marker');
 const manifest=options.company?clone(options.company):roster(m.book,s.startingForm);
 if(!options.company&&m.katusa?.standalone)for(const [i,exp] of m.katusa.standalone.entries()){
   const u=manifest.filter(u=>u.rifle)[i*3];u.name+='（韓籍班）';u.katusa=true;u.experience=exp;u.art=katusaArt(exp);
 }
 deploy(s,m,manifest,s.patrol);if(options.series)s.series=options.series;if(m.weather){s.raining=true;s.weatherDue=true;}
}
function switchFormation(s,form){
 const m=G.scenario(s.id),old=s.startingForm;
 if(m.book!=='V'||s.phase!=='setup'||s.deploymentConfirmed||s.attempt!==1||m.id==='VN8'||old===form||!Object.hasOwn(books.V.rosterOptions,form))return false;
 const store=s.series||s;
 const separate=u=>u.id==='81mm Sec'||u.platoon===4;
 const current=s.company.filter(separate),missing=current.reduce((n,u)=>n+u.max-u.steps,0);
 (store.forms||={})[old]=clone(current);
 const initial=s.series?.index>0;
 let next=clone(store.forms[form]||roster('V',form).filter(separate));
 if(!store.forms[form]&&form==='fourthPlatoon'&&initial){
  const bag=G.shuffle(['green','line','line','line','veteran']);for(const u of next){u.initialGrades=bag.splice(0,u.max);u.experience=composite(u.initialGrades);}
 }
 let debt=missing;for(const u of next){const lost=Math.min(debt,u.max);u.steps=u.max-lost;debt-=lost;}
 const personnel=s.company.filter(u=>!separate(u));
 if(!initial){
   const fresh=roster('V',form);for(const u of personnel){const f=fresh.find(x=>x.id===u.id);if(f?.initialGrades){u.initialGrades=f.initialGrades;u.experience=f.experience;}}
   if(form==='fourthPlatoon')next=fresh.filter(separate);
 }
 s.startingForm=form;if(s.series)s.series.form=form;s.units=s.units.filter(u=>u.side!=='friendly');s.offboard=[];deploy(s,m,[...personnel,...next],s.patrol);return true;
}
function katusaArt(exp){return window.FOF_CAMPAIGN_PIECES.find(p=>p.army==='KATUSA'&&/3-step/.test(p.id)&&!p.id.endsWith('-b'))?.id||'s1';}
function create(id,options={}){
 const m=G.scenario(id),s=G.tabletop(id,options.previous||null,true,options);
 if(options.series)s.series=options.series;return s;
}
function restore(s){
 if(s){fog.restore(s);if(s.tableRun?.after)fog.restore(s.tableRun.after);}
 if(s?.settlement)window.FOF_SERIES.syncRotation(s);
 if(!s||s.id==='Q1'||s.id==='T1'||s.company||G.scenario(s.id)?.book!=='N')return s;
 const m=G.scenario(s.id);s.company=roster('N');s.startingForm='mortar81';
 const active=s.company.filter(u=>m.mode!=='patrol'||u.platoon===s.patrol),assigned=new Set();
 for(const u of s.units.filter(u=>u.side==='friendly')){
   const meta=active.find(x=>x.art===u.art&&!assigned.has(x.id));if(!meta)continue;
   u.rosterId=meta.id;u.experience=meta.experience;u.max=meta.max;assigned.add(meta.id);
 }
 return s;
}
function launch(k,rule,form){
 if(!Object.hasOwn(rules,rule))throw Error('未知戰役規則');
 return create(books[k].order[0][0],{form,series:{book:k,rule,index:0,history:[],form:form||'mortar81'}});
}
function goals(s){
 const m=G.scenario(s.id),o=m.objectives,out=[];
 const count=(name,list,n,test)=>{const actual=list.filter(c=>test(s,c)).length;out.push({name:name+'　'+actual+' / '+n,done:actual>=n});};
 if(m.id==='K6'){
   for(const k of ['primary','secondary']){const p=s.objectives[k],c=p&&G.at(s,p);out.push({name:k==='primary'?'控制主要目標':'控制次要目標',done:!!c&&G.unitsAt(s,c).some(u=>u.side==='friendly'&&!u.casualty)&&!c.pc&&!c.pending&&!G.unitsAt(s,c).some(u=>u.side==='enemy'&&!u.casualty)});}
   for(const y of o.clearRows)count('肅清第 '+y+' 列',cells(s,c=>c.y===y),s.cols,G.isClear);
   return out;
 }
 if(m.holdCount||m.defense){const zone=m.holdCards?.map(k=>G.at(s,coord(k)))||cells(s,c=>c.y<=(s.mlr??m.defense.mlr));count('防線內已確保',zone,m.holdCount||m.defense.required,G.secured);return out;}
 if(o.secureCells){const zone=o.secureCells.map(k=>G.at(s,coord(k)));count('指定防區已確保',zone,zone.length,G.secured);}
 if(o.secureCount)count('已確保牌',cells(s,()=>true),o.secureCount,G.secured);
 if(o.clearCount)count('已肅清牌',cells(s,()=>true),o.clearCount,G.isClear);
 if(o.clearPrimary)out.push({name:'肅清主要目標',done:G.isClear(s,G.at(s,s.objectives.primary))});
 for(const col of o.clearColumns||[])count('肅清 '+String.fromCharCode(64+col)+' 欄',cells(s,c=>c.x===col-1),s.rows,G.isClear);
 if(out.length)return out;
 if(m.mode==='patrol'&&m.patrolStartRow)return [{name:'走訪主要目標',done:s.visits.primary},{name:'依序走訪四個路線點　'+s.visits.way+' / 4',done:s.visits.way===4},{name:'由第3列返回第2列',done:s.visits.returned}];
 return null;
}
function scheduled(s,c){
 const m=G.scenario(s.id),t=s.turn-1;
 if(m.defense)return m.defense.pcSchedule[c.y-(s.mlr??m.defense.mlr)+m.defense.mlr]?.[t];
 if(m.book==='H')return m.defensePC?.[t];
 return m.defensePC?.find(rule=>rule.cells.includes(G.nameAt(c))&&(!rule.requiresMLRAdvance||s.mlr>2))?.byTurn[t];
}
function defense(s){
 for(const c of cells(s,()=>true)){const grade=scheduled(s,c);if(!grade)continue;
   c.hadPC=true;c.pc=c.pc?[grade,c.pc].sort()[0]:grade;c.hidden=false;c.originalPC||=grade;}
 G.note(s,'已按本回合的任務時程放置 PC。');
}
function afterPhase(s,old){
 const m=G.scenario(s.id);
 if(s.outcome||s.phase==='patrolresult')return;
 if(m.scheduledEvents?.some(e=>e.attempt===s.attempt&&e.turn===s.turn&&e.side==='enemy')&&s.phase==='enemy'){
   s.counterUntil=s.turn+2;(s.events||={})[s.turn+'-enemy']='本次嘗試的預定反擊，持續三回合。';G.note(s,'任務時程啟動反擊。');
 }
 if(m.weather&&s.turn>=1&&old==='cleanup')s.weatherDue=true;
 if(m.mode==='defense'){
  if(old==='setup'||old==='events'){s.phase='enemy';defense(s);}
  else if(old==='enemy')s.phase='orders';
  else if(old==='orders')s.phase='retreat';
  if(old==='cleanup')for(const c of s.map)c.pc=null;
 }
 if(old==='cleanup'&&m.restorePC)for(const c of cells(s,c=>!G.unitsAt(s,c).some(u=>u.side==='friendly'&&!u.casualty))){c.pc=c.originalPC;c.hidden=false;}
 if(!moon(s)&&!m.weather)s.vis=light(s);
 fog.refresh(s);
}
function adjustMap(s,request){
 const m=G.scenario(s.id),mlr=s.mlr??2;
 if(!m||s.outcome)return false;
 if(request.startsWith('mlr')){
   const next=mlr+(request==='mlr+'?1:-1);if(next<1||next>m.rows-1)return false;
   if(s.id==='VN5'&&next===3&&s.rows===m.rows&&!adjustMap(s,'vnrow'))return false;
   s.mlr=next;G.note(s,'主抵抗線移至第 '+next+' 列前方。');return true;
 }
 const row=request==='row'||request==='vnrow',left=request==='left';
 if(row?!(s.rows===m.rows&&(m.maxAdditionalRows||request==='vnrow'&&s.id==='VN5')):!['left','right'].includes(request)||s.cols>=m.cols+2)return false;
 const used=new Set(s.map.flatMap(c=>[c.t,...G.hillLayers(c)])),faces=m.book==='N'?window.FOF_TERRAIN:terrain.filter(t=>t.id.startsWith(m.book==='V'?'VN':'K'));
 let pool=G.shuffle(faces.filter(t=>!used.has(t.id)));
 const planned=[];
 for(let i=row?0:(m.staging?0:1);i<(row?s.cols:s.rows+1);i++){
   const x=row?i:left?0:s.cols,y=row?s.rows+1:i,stage=y===0;
   let hills=[],face;
   if(!stage){
     if(m.book==='H'){
       const idx=pool.findIndex(t=>['Open','Rocky','Brush','Gully Draw'].includes(t.type)&&(m.number===5||x!==1||t.type!=='Gully Draw'));
       if(idx===-1)return false;face=pool.splice(idx,1)[0];
       const level=m.extensionHeights[x];if(level>1){const hid=Cbook(m).elevationCards[level].find(id=>!used.has(id));if(!hid)return false;used.add(hid);hills=[hid];}
     }else {face=pool.pop();while(face?.type==='hill'){hills.push(face.id);face=pool.pop();}if(!face)return false;}
   }
   const raw=row?(m.book==='H'?'A':null):m.pcRows[y-1];
   const pc=raw?G.shuffle(raw.replace('?','').split('/'))[0]:null;
   planned.push({x,y,t:face?.id||0,h:hills.length,hills,pc,originalPC:pc,hadPC:!!pc,pending:false,hidden:!!raw?.startsWith('?'),marks:[],level:m.book==='H'?m.extensionHeights[x]:null});
 }
 if(left){
   for(const p of [...s.map,...s.units,...(s.offboard||[]),...Object.values(s.objectives)])p.x++;
   for(const marker of s.units){if(marker.side==='marker'&&/^[A-Z]\d+$/.test(marker.toward||'')){const p=coord(marker.toward);p.x++;marker.toward=G.nameAt(p);}}
   const shifted={};for(const [k,v] of Object.entries(s.xpCards)){if(/^[A-Z]\d+$/.test(k)){const p=coord(k);p.x++;shifted[G.nameAt(p)]=v;}else shifted[k]=v;}s.xpCards=shifted;
 }
 if(row)s.rows++;else s.cols++;
 s.map.push(...planned);G.note(s,row?'依任務效果增加一列地形。':'依任務效果增加一欄地形。');return true;
}
function Cbook(m){return books[m.book];}
function canMove(s,u,c){
 const m=G.scenario(s.id);
 if(u?.art==='ccp'&&m?.book==='K'&&s.phase==='setup'&&c.faceDown)return false;
 if(!m||!u||u.side==='marker')return true;
 if(u.side==='friendly'&&m.movementCells&&!m.movementCells.includes(G.nameAt(c)))return false;
 if(s.phase==='setup'||u.side==='enemy')return true;
 if(m.orthogonal)return Math.abs(c.x-u.x)+Math.abs(c.y-u.y)===1;
 return true;
}
function selectTab(s,c,tabs){
 const m=G.scenario(s.id),grade=c.contactGrade||c.originalPC;
 if(m.book==='H'&&c.y===5&&grade==='A'&&tabs.row5A)return tabs.row5A;
 if(m.contactKey==='row'){const tab=tabs[c.y===2?'row2':c.y===5?'row5':'row34'];if(tab)return tab[grade]||tab;}
 if(m.contactKey==='wave'){const tab=tabs['wave'+(m.waveByTurn[s.turn-1]||1)];if(tab)return tab[grade]||tab;}
 return grade==='A'&&s.counterUntil>=s.turn&&tabs.counterA?tabs.counterA:tabs[grade];
}
function canPlace(m,k,p){return (!m.fixedObjectives?.[k]||G.same(typeof m.fixedObjectives[k]==='string'?coord(m.fixedObjectives[k]):m.fixedObjectives[k],p))&&(k!=='primary'||!m.primaryChoices?.length||m.primaryChoices.includes(G.nameAt(p)));}
window.FOF_CAMPAIGNS={books,labels,rules,gradeNames,coord,key,turnLimit,moon,light,composite,roster,attachments,init,create,launch,goals,afterPhase,canMove,canPlace,selectTab,katusaArt,adjustMap,switchFormation,restore};
})();
