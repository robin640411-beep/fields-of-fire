(() => {
'use strict';
window.FOF_TERRAIN_TABLE=function({catalog,esc,pic,terrain,backFace,backName,objectiveName}){
 const G=window.FOF;
 const markArt=[
  [/^PC\s*([ABC])\b/i,m=>'pc-'+m[1].toLowerCase()], [/^PC\s*\?/, 'pc-hidden'],
  [/^VOF\s+S!|狙擊手火力量/i,'vof-sniper'], [/^VOF\s+([PSAH])\b/i,m=>'vof-'+m[1].toLowerCase()],
  [/^PDF\b|^主要射向/i,'pdf'], [/交叉火力/,'crossfire'], [/集中火力/,'conc'],
  [/散兵坑/,'foxhole'], [/戰壕/,'trench'], [/基本掩蔽/,'cover'], [/主要目標/,'obj1'], [/次要目標/,'obj2']
 ];
 const objectiveArt={primary:'obj1',secondary:'obj2',way1:'route1',way2:'route2',way3:'route3'};
 function symbol(label){
  for(const [pattern,art] of markArt){
   const match=pattern.exec(label);
   if(match)return typeof art==='function'?art(match):art;
  }
 }
 function contents(s,c){
  const markers=[],units=[];
  const add=(label,art,short)=>markers.push({label,art,short:short||label.slice(0,2),quantity:/×\s*(\d+)/.exec(label)?.[1]});
  if(c.pc)add('潛在接敵 '+(c.hidden?'?':c.pc),c.hidden?'pc-hidden':'pc-'+c.pc.toLowerCase(),'PC');
  if(c.pending)add('接敵待配置',null,'接敵');
  if(!window.FOF_COURSE.has(s.id)&&G.isTable(s)&&G.secured(s,c))add('已確保區域','secure');
  if(!window.FOF_COURSE.has(s.id)&&s.id!=='Q1'&&G.isTable(s)&&G.nextPC(s)===c)add('下一枚 PC',null,'次序');
  if(s.id==='T1'&&c.y===3)add('演練目標',null,'目標');
  for(const [key,pos] of Object.entries(s.objectives))if(G.same(c,pos))add(objectiveName(key),objectiveArt[key]);
  for(const label of c.marks)add(label,symbol(label));
  for(const u of G.unitsAt(s,c)){
   const condition=u.lessonStatus||[u.pinned&&'受壓制',u.exposed&&'暴露',u.covered&&'掩蔽',u.casualty&&'傷亡'].filter(Boolean).join('、');
   const item={id:u.id,label:u.name,condition,art:u.art,short:u.abbr||u.name};
   (u.side==='marker'?markers:units).push(item);
  }
  return {markers,units};
 }
 function chit(item,selected,inList=false){
  const label=item.label+(item.condition?'・'+item.condition:'');
  const entry=catalog.get(item.art);
  const face=entry?pic(entry.art,'',''):'<span class="chit-text">'+esc(item.short.slice(0,3))+'</span>';
  const attr=item.id?'data-action="boardPiece" data-value="'+esc(item.id)+'"':'data-action="boardPile"';
  if(inList&&!item.id)return '<li><span class="chit-icon">'+face+'</span><span>'+esc(label)+'</span></li>';
  const btn='<button type="button" '+attr+' class="'+(inList?'pile-choice':'map-chit')+(selected&&selected===item.id?' chosen':'')+'" aria-label="'+esc(label)+'">'+
   (inList?'<span class="chit-icon">'+face+'</span><span>'+esc(label)+'</span>':face+((item.condition||item.quantity)?'<i class="condition-tab">'+esc(item.condition?item.condition.slice(0,2):'×'+item.quantity)+'</i>':''))+'</button>';
  return inList?'<li>'+btn+'</li>':btn;
 }
 function bank(items,name,limit,selected){
  if(!items.length)return '';
  const overflow=items.length>limit,shown=overflow?limit-1:items.length;
  return '<div class="chit-bank '+name+'">'+items.slice(0,shown).map(i=>chit(i,selected)).join('')+
   (overflow?'<button type="button" class="map-chit pile-count" data-action="boardPile" aria-label="展開本牌全部算子與標記">+'+(items.length-shown)+'</button>':'')+'</div>';
 }
 function tile(s,c,dest,focused,selected){
  const t=terrain(c.t),name=t?.name||'集結區',coord=G.nameAt(c),layers=G.hillLayers(c);
  const {units,markers}=contents(s,c),key=c.x+','+c.y;
  const face=t?t.face:backFace(),title=coord+' '+name+(t?' N'+String(t.id).padStart(2,'0'):'');
  const faces=layers.map((id,i)=>'<img class="hill-face" style="--layer:'+i+'" src="'+terrain(id??1).face+'" alt="" draggable="false">').join('');
  return '<div class="card-location'+(dest&&!window.FOF_COURSE.has(s.id)?' move-target':'')+'" data-coord="'+key+'" style="--layers:'+layers.length+'">'+
   '<button type="button" class="tile'+(dest?' can':'')+(focused?' focused':'')+'" data-action="cell" data-value="'+key+'" aria-label="'+esc(title+'，'+units.length+' 枚算子，'+markers.length+' 枚標記'+(dest?'，可移入':''))+'">'+
   '<span class="cell-caption"><span class="cell-ref"><b>'+coord+'</b>'+(t?'<small>N'+String(t.id).padStart(2,'0')+'</small>':'')+'</span><span class="cell-name">'+esc(name)+'</span></span>'+
   '<span class="card-stack">'+faces+'<img class="board-face" src="'+face+'" alt="'+esc(t?name:backName())+'" draggable="false"></span></button>'+
   '<div class="chit-mat">'+bank(markers,'map-markers',6,selected)+bank(units,'map-units',8,selected)+'</div></div>';
 }
 function pile(s,c,selected){
  const {units,markers}=contents(s,c);
  return [[units,'算子'],[markers,'標記']].filter(([items])=>items.length).map(([items,name])=>
   '<h3>'+name+'（'+items.length+'）</h3><ul class="pile-list">'+items.map(i=>chit(i,selected,true)).join('')+'</ul>').join('');
 }
 const board=document.getElementById('board'),preview=document.getElementById('terrainPreview');
 let timer,active,face;
 function dismiss(){clearTimeout(timer);active=null;face=null;preview.hidden=true;}
 function schedule(card,img,chit){
  if(!card||!img){dismiss();return;}
  const badge=preview.querySelector('small');
  badge.textContent=chit?.getAttribute('aria-label')||'';
  badge.hidden=!badge.textContent;
  if(card===active&&img===face){
   if(!preview.hidden)preview.style.top=Math.max(10,Math.min(preview.offsetTop,innerHeight-preview.offsetHeight-10))+'px';
   return;
  }
  dismiss();active=card;face=img;
  timer=setTimeout(()=>{
   if(!card.isConnected||document.querySelector('dialog[open]'))return;
   const hill=img.classList.contains('hill-face');
   preview.querySelector('figcaption').textContent=card.querySelector('.cell-ref b').textContent+'　'+(hill?'下層丘陵　N'+img.getAttribute('src').split('/').pop().split('.')[0]:card.querySelector('.cell-name').textContent+'　'+(card.querySelector('.cell-ref small')?.textContent||''));
   const view=preview.querySelector('img');view.src=img.currentSrc||img.src;
   preview.hidden=false;
   const r=card.getBoundingClientRect(),p=preview.getBoundingClientRect(),margin=10;
   const right=r.right+margin;
   preview.style.left=Math.max(margin,Math.min(innerWidth-p.width-margin,right+p.width+margin<=innerWidth?right:r.left-p.width-margin))+'px';
   preview.style.top=Math.min(innerHeight-p.height-margin,Math.max(margin,(r.top+r.bottom-p.height)/2))+'px';
  },380);
 }
 board.addEventListener('pointermove',e=>{
  if(e.pointerType==='touch'||e.buttons)return;
  const card=e.target.closest('.card-location');
  if(!card){dismiss();return;}
  let img=card.querySelector('.board-face');
  if(e.clientY<img.getBoundingClientRect().top){
   const hills=[...card.querySelectorAll('.hill-face')].reverse();
   img=hills.find(h=>e.clientY>=h.getBoundingClientRect().top)||img;
  }
  schedule(card,img,e.target.closest('.map-chit'));
 });
 board.addEventListener('focusin',e=>{
  const card=e.target.closest('.card-location');
  if(card&&e.target.matches(':focus-visible'))schedule(card,card.querySelector('.board-face'),e.target.closest('.map-chit'));
 });
 board.addEventListener('focusout',dismiss);
 board.addEventListener('pointerleave',dismiss);
 document.addEventListener('keydown',e=>{if(e.key==='Escape')dismiss();});
 document.addEventListener('pointerdown',dismiss,true);
 document.addEventListener('scroll',dismiss,true);
 window.addEventListener('blur',dismiss);window.addEventListener('resize',dismiss);
 return {tile,pile,dismiss};
};
})();
