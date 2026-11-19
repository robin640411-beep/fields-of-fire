/* Positions use the printed US Army WWII/Korea sheet as their coordinate system. */
(() => {
'use strict';
const imageRoot='assets/command/', boardImage=imageRoot+'us-wwii-korea.webp';
const readyOrder=['co','pl1','pl2','pl3','xo','sgt','hmg','tank1','tank2'];
const artSlots={'co-hq':'co',hq:'pl1',hq2:'pl2',hq3:'pl3','co-xo':'xo','first-sgt':'sgt'};
const areas={ready:'待用',available:'命令記錄區',saved:'保留命令點區',done:'啟動已完成'};
const phases={friendly:0,orders:2,enemy:3,retreat:4,vehicles:5,combat:6,cleanup:7};
const phaseLabels=['友軍上級事件','敵軍活動（防禦任務）','友軍命令','敵軍活動','雙方俘虜與撤退','反戰車戰鬥與車輛移動','雙方戰鬥','整理'];
const areaCodes=new Set([...Object.keys(areas),'carried']);
const number=n=>Math.max(0,Math.min(99,Math.trunc(Number(n)||0)));
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function printedSlot(unit){
 if(!unit)return null;
 if(artSlots[unit.art])return artSlots[unit.art];
 const name=(unit.name+' '+unit.abbr).replace(/\s/g,'');
 if(/重機槍排部|HMGPLT(?:HQ)?/i.test(name))return 'hmg';
 if(/第[1一]戰車排部|1(?:st)?TANKPLT/i.test(name))return 'tank1';
 if(/第[2二]戰車排部|2(?:nd)?TANKPLT/i.test(name))return 'tank2';
 return null;
}
function campaignMarkers(s){
 const eligible=s.units.filter(u=>u.side==='friendly'&&(printedSlot(u)||/HQ|排部|指揮部|副官|士官長/.test(u.name+' '+u.abbr)));
 const ids=new Set([...eligible.map(u=>u.id),...Object.keys(s.tracks)]);
 return Array.from(ids,id=>{
  const u=eligible.find(v=>v.id===id),points=number(s.tracks[id]);
  const stored=s.commandAreas?.[id];
  let area=areaCodes.has(stored)?stored:points?'available':'ready';
  const face=area==='available'?'commands':'complete';
  if(area==='carried')area='available';
  return {id,label:u?.name||id,slot:printedSlot(u),points,area,face};
 });
}
function assign(s,id,area,points){
 if(!areaCodes.has(area)||!campaignMarkers(s).some(m=>m.id===id))return false;
 points=number(points);
 if(area==='ready'||area==='done')points=0;
 else if(!points)area='done';
 (s.commandAreas??={})[id]=area;s.tracks[id]=points;
 return true;
}
function adjust(s,id,delta){
 const marker=campaignMarkers(s).find(m=>m.id===id);
 if(!marker)return false;
 const points=number(marker.points+delta);
 return assign(s,id,marker.area==='saved'?'saved':'available',points);
}
function newRound(s){
 for(const [id,area] of Object.entries(s.commandAreas||{})){
  if(area==='saved')assign(s,id,'carried',s.tracks[id]);
  if(area==='done')assign(s,id,'ready',0);
 }
}
function snapshot(s){
 if(window.FOF_COURSE.has(s.id))return window.FOF_LESSON_COMMANDS(s.id,s.cursor,s.reading);
 if(s.id==='T1'||s.id==='Q1'){
  const shared=s.id==='Q1',active=s.phase==='command',between=s.phase==='ready';
  const points=active?s.points:s.saved;
  const area=active?(points?'available':'done'):between?(points?'available':'ready'):(points?'saved':'done');
  const markers=[{id:shared?'shared':'pl1',slot:shared?null:'pl1',label:shared?'連隊共用命令':'第 1 排部',area,face:active&&points?'commands':'complete',points}];
  if(s.phase==='initiative')markers.push({id:'general',label:'一般主動',points:s.points});
  return {markers,phase:s.phase==='review'?'cleanup':'orders'};
 }
 return {markers:campaignMarkers(s),phase:s.phase==='events'?'friendly':s.phase};
}
function bounds(marker){
 const {id,slot=id,area,points}=marker;
 if(area==='ready'){
  const i=readyOrder.indexOf(slot);
  return i<0?null:{x:31+i*60.4,y:59,w:55,h:55};
 }
 if(area==='done')return {x:578,y:36,w:121,h:76};
 if(area!=='available'&&area!=='saved')return null;
 const x=104+(clamp(points,1,10)-1)*59.8;
 return area==='saved'?{x,y:245,w:58,h:68}:{x,y:143,w:58,h:89};
}
function arrange(markers){
 const groups=new Map(),out=[];
 for(const m of markers){
  if(m.id==='general')continue;
  const b=bounds(m);if(!b)continue;
  const key=b.x+','+b.y;if(!groups.has(key))groups.set(key,{b,items:[]});groups.get(key).items.push(m);
 }
 for(const {b,items} of groups.values()){
  let cols=1,side=0;
  for(let k=1;k<=items.length;k++){
   const fit=Math.min(44,(b.w-3)/k,(b.h-3)/Math.ceil(items.length/k));
   if(fit>side){cols=k;side=fit;}
  }
  const rows=Math.ceil(items.length/cols);
  items.forEach((m,i)=>{
   const row=Math.floor(i/cols),n=Math.min(cols,items.length-row*cols);
   out.push({m,x:b.x+b.w/2+(i%cols-(n-1)/2)*side,y:b.y+b.h/2+(row-(rows-1)/2)*side,side:side*.93});
  });
 }
 return out;
}
function create({state,esc,button,edit,dialog}){
 const by=id=>document.getElementById(id);
 let selected='';
 const manual=s=>!window.FOF_COURSE.has(s.id)&&s.id!=='T1'&&s.id!=='Q1';
 function textFor(m){return m.id==='general'?m.label+' '+m.points+' 點':m.label+'・'+areas[m.area]+(['available','saved'].includes(m.area)?' '+m.points+' 點':'');}
 const percent=(v,total)=>(100*v/total).toFixed(4)+'%';
 function position(x,y,w){return 'left:'+percent(x,734)+';top:'+percent(y,950)+';width:'+percent(w,734);}
 function chit(x,y,w,src,label,cls='',extra='',text=''){
  return '<span class="sheet-chit '+cls+'" style="'+position(x,y,w)+'" title="'+esc(label)+'" '+extra+'>'+
   (src?'<img src="'+imageRoot+src+'.webp" alt="'+esc(label)+'" draggable="false">':'<span class="sheet-custom">'+esc(label.split('・')[0])+'</span>')+(text?'<b>'+esc(text)+'</b>':'')+'</span>';
 }
 function hotspot(x,y,w,h,area,points,label){
  return '<button type="button" class="sheet-target" data-action="sheetPlace" data-value="'+area+'|'+points+'" aria-label="'+esc(label)+'" title="'+esc(label)+'" style="left:'+percent(x,734)+';top:'+percent(y,950)+';width:'+percent(w,734)+';height:'+percent(h,950)+'"></button>';
 }
 function paper(s,data,interactive){
  let marks='';
  if(interactive){
   for(let i=1;i<=10;i++){
    const x=103+(i-1)*59.9;
    marks+=hotspot(x,122,59.9,112,'available',i,'可用 '+i+' 點')+hotspot(x,234,59.9,82,'saved',i,'保留 '+i+' 點');
   }
   const target=data.markers.find(m=>m.id===selected);
   const rb=target&&bounds({...target,area:'ready'});
   if(rb)marks+=hotspot(rb.x,rb.y,rb.w,rb.h,'ready',0,'回到待用格');
   marks+=hotspot(577,32,125,83,'done',0,'移至啟動完成（零點）');
  }
  for(const {m,x,y,side} of arrange(data.markers)){
   const slot=m.slot===undefined?m.id:m.slot;
   const src=readyOrder.includes(slot)?slot+'-'+(m.face||(m.area==='available'?'commands':'complete')):null;
   marks+=chit(x,y,side,src,textFor(m),'command-token'+(interactive&&m.id===selected?' chosen':''),'data-command-id="'+esc(m.id)+'" data-area="'+esc(m.area)+'" data-points="'+number(m.points)+'"',m.points>10?String(m.points):'');
  }
  if(s.id==='C3'){
   const gear=[['營戰術網','bn-radio',100,452],['連戰術網','co-radio',164,452],['第 1 排部裝備','co-radio',166,563],['第 2 排部裝備','co-radio',364,563],['分隊裝備','co-radio',169,773]];
   for(const [key,asset,x,y] of gear)if(s.tracks[key])
    marks+=chit(x,y,38,asset,key+'・'+s.tracks[key],'equipment-token');
  }
  const turn=Math.max(1,s.turn);
  marks+=chit(81+54*clamp(turn-1,0,11),350,34,'turn','第 '+turn+' 回合','timing-token','',turn>12?String(turn):'');
  const phase=phases[data.phase];if(phase!==undefined)marks+=chit(674,441+phase*63.7,29,'phase',phaseLabels[phase],'timing-token');
  return '<span class="sheet-paper"><img class="printed-sheet" width="1836" height="2376" src="'+boardImage+'" alt="美國陸軍二戰與韓戰指揮顯示表，第 1 頁全表" draggable="false">'+marks+'</span>';
 }
 function editor(s,markers){
  const current=markers.find(m=>m.id===selected);if(!current)return '';
  return '<div class="sheet-edit"><label for="commandUnit">登記指揮部</label><select id="commandUnit">'+markers.map(m=>'<option value="'+esc(m.id)+'" '+(m.id===selected?'selected':'')+'>'+esc(m.label)+'</option>').join('')+'</select>'+
   '<p>點選表上方的點數格，即可放置這枚命令標記。</p><div class="sheet-adjust">'+button('sheetDelta','−','',-1,current.points<=0)+'<output>'+current.points+' 點</output>'+button('sheetDelta','＋','',1,current.points>=99)+'</div>'+
   '<div class="sheet-area-actions">'+button('sheetArea','待用','', 'ready')+button('sheetArea','可用','', 'available',!current.points)+button('sheetArea','保留','', 'saved',!current.points)+button('sheetArea','完成（0）','','done')+'</div></div>';
 }
 function render(){
  const s=state(),data=snapshot(s),markers=data.markers;
  if(!markers.some(m=>m.id===selected))selected=markers.find(m=>m.id!=='general')?.id||'';
  const cmds=markers.filter(m=>m.id!=='general');
  const sheet=paper(s,data,manual(s)&&!s.outcome);
  by('commandPaper').innerHTML=sheet;
  const expanded=document.querySelector('#panel[open][data-kind="sheet"] .modalcontent');
  if(expanded)expanded.innerHTML=sheet;
  const info=by('commandState');
  const rows=markers.map(m=>{
   const points=m.id==='general'?m.points+' 點':areas[m.area]+(['available','saved'].includes(m.area)?'・'+m.points+' 點':'');
   const face=m.id==='general'||m.id==='shared'?'':m.face==='commands'?'可用命令面':'啟動完成面';
   return '<li><strong>'+esc(m.label)+'</strong><span>'+esc(points)+'</span>'+(face?'<small>'+face+'</small>':'')+'</li>';
  }).join('');
  info.innerHTML=((manual(s)&&!s.outcome)?editor(s,cmds):'')+'<h3>命令標記</h3><ul class="sheet-ledger">'+rows+'</ul>'+(data.note?'<p>'+esc(data.note)+'</p>':'')+
    (cmds.some(m=>m.points>10)?'<p>超過 10 點的標記放在最右格，角標顯示實際點數。</p>':'');
 }
 function handle(action,value){
  const s=state();
  if(action==='readSheet'){
   dialog('sheet','指揮顯示表',paper(s,snapshot(s),manual(s)&&!s.outcome));
   return true;
  }
  if(!manual(s)||s.outcome)return false;
  if(action==='sheetPlace'||action==='sheetArea'||action==='sheetDelta'){
   edit(()=>{
    if(action==='sheetDelta')return adjust(s,selected,Number(value));
    const [area,points]=value.split('|');
    return assign(s,selected,area,points===undefined?s.tracks[selected]:points);
   });
   return true;
  }
  return false;
 }
 by('commandState').addEventListener('change',event=>{if(event.target.id==='commandUnit'){selected=event.target.value;render();by('commandUnit')?.focus();}});
 return {render,handle};
}
window.FOF_COMMAND_DISPLAY={create,adjust,newRound};
})();
