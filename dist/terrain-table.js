(() => {
'use strict';
window.FOF_TERRAIN_TABLE=function({state,catalog,esc,pic,terrain,backFace,backName,objectiveName}){
 const G=window.FOF;
 const markArt=[
  [/^PC\s*([ABC])\b/i,m=>'pc-'+m[1].toLowerCase()], [/^PC\s*\?/, 'pc-hidden'],
  [/^VOF\s+S!|狙擊手火力量/i,'vof-sniper'], [/^VOF\s+([PSAH])\b/i,m=>'vof-'+m[1].toLowerCase()],
  [/^PDF\b|^主要射向/i,'pdf'], [/交叉火力/,'crossfire'], [/集中火力/,'conc'],
  [/散兵坑/,'foxhole'], [/戰壕/,'trench'], [/基本掩蔽/,'cover'], [/主要目標/,'obj1'], [/次要目標/,'obj2']
 ];
 const objectiveArt={primary:'obj1',secondary:'obj2',way1:'route1',way2:'route2',way3:'route3'};
 function symbol(label){
  if(window.FOF_COURSE_MARKS?.[label])return window.FOF_COURSE_MARKS[label];
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
 function chit(item,selected,inList=false,slot=0){
  const label=item.label+(item.condition?'・'+item.condition:'');
  const entry=catalog.get(item.art);
  const info=[entry?.name!==item.label&&entry?.name,item.condition].filter(Boolean).join('　');
  const previewAttrs='data-piece-name="'+esc(item.label)+'" data-piece-info="'+esc(info)+'"';
  const face=entry?pic(entry.art,'',''):'<span class="chit-text">'+esc(item.short.slice(0,3))+'</span>';
  const attr=item.id?'data-action="boardPiece" data-value="'+esc(item.id)+'"':'data-action="boardPile"';
  if(inList&&!item.id)return '<li '+previewAttrs+' tabindex="0"><span class="chit-icon">'+face+'</span><span>'+esc(label)+'</span></li>';
  const statusArt=item.condition&&Object.entries({'受壓制':'pinned','暴露':'exposed','掩蔽':'cover','傷亡':'casualty'}).find(([name])=>item.condition.startsWith(name));
  const statusAttrs=statusArt?' data-piece-name="'+esc(statusArt[0])+'" data-piece-info="'+esc(label)+'" data-piece-art="'+statusArt[1]+'"':'';
  const placement=slot?' style="grid-area:p'+slot+'"':'';
  const btn='<button type="button" '+attr+' '+previewAttrs+placement+' class="'+(inList?'pile-choice':'map-chit')+(selected&&selected===item.id?' chosen':'')+'" aria-label="'+esc(label)+'">'+
   (inList?'<span class="chit-icon">'+face+'</span><span>'+esc(label)+'</span>':face+((item.condition||item.quantity)?'<i class="condition-tab"'+statusAttrs+'>'+esc(item.condition?item.condition.slice(0,2):'×'+item.quantity)+'</i>':''))+'</button>';
  return inList?'<li>'+btn+'</li>':btn;
 }
 const unitLimit=8;
 function bank(items,name,limit,selected,offset=0){
  if(!items.length)return '';
  const overflow=items.length>limit,shown=overflow?limit-1:items.length;
  return '<div class="chit-bank '+name+'">'+items.slice(0,shown).map((item,i)=>chit(item,selected,false,offset+i+1)).join('')+
   (overflow?'<button type="button" class="map-chit pile-count" style="grid-area:p'+(offset+limit)+'" data-action="boardPile" aria-label="展開本牌全部算子與標記">+'+(items.length-shown)+'</button>':'')+'</div>';
 }
 function tile(s,c,dest,focused,selected){
  const t=terrain(c.t),name=c.faceDown?'未揭開地形':t?.name||'集結區',coord=G.nameAt(c),layers=c.faceDown?[]:G.hillLayers(c);
  const {units,markers}=contents(s,c),key=c.x+','+c.y;
  const code=t&&!c.faceDown?G.terrainCode(t):'',face=t&&!c.faceDown?t.face:backFace(!c.y),title=[coord,name,code].filter(Boolean).join(' ');
  const faces=layers.map((id,i)=>'<img class="hill-face" style="--layer:'+i+'" src="'+terrain(id??1).face+'" data-code="'+esc(G.terrainCode(terrain(id??1)))+'" alt="" draggable="false">').join('');
  return '<div class="card-location'+(dest&&!window.FOF_COURSE.has(s.id)?' move-target':'')+'" '+(t?'':'data-staging')+' data-coord="'+key+'" style="--layers:'+layers.length+'">'+
   '<button type="button" class="tile'+(dest?' can':'')+(focused?' focused':'')+'" data-action="cell" data-value="'+key+'" aria-label="'+esc(title+'，'+units.length+' 枚算子，'+markers.length+' 枚標記'+(dest?'，可移入':''))+'">'+
   '<span class="cell-caption"><span class="cell-ref"><b>'+coord+'</b>'+(code?'<small>'+esc(code)+'</small>':'')+'</span><span class="cell-name">'+esc(name)+'</span></span>'+
   '<span class="card-stack">'+faces+'<img class="board-face" src="'+face+'" alt="'+esc(t?name:backName(true))+'" draggable="false"></span></button>'+
   '<div class="chit-mat">'+bank(units,'map-units',unitLimit,selected)+bank(markers,'map-markers',6,selected,Math.min(units.length,unitLimit))+'</div></div>';
 }
 function pile(s,c,selected){
  const {units,markers}=contents(s,c);
  return [[units,'算子'],[markers,'標記']].filter(([items])=>items.length).map(([items,name])=>
   '<h3>'+name+'（'+items.length+'）</h3><ul class="pile-list">'+items.map(i=>chit(i,selected,true)).join('')+'</ul>').join('');
 }
 const preview=document.getElementById('terrainPreview');
 const caption=preview.querySelector('figcaption'),picture=preview.querySelector('img');
 const symbolFace=preview.querySelector('.preview-symbol'),note=preview.querySelector('small');
 const legendPanel=preview.querySelector('.terrain-legend');
 function terrainNotes(card,layer){
  const [x,y]=card.dataset.coord.split(',').map(Number),s=state(),cell=G.at(s,{x,y});
  const id=layer===null?cell.t:G.hillLayers(cell)[layer];
  const t=cell.faceDown?null:terrain(id??1);
  const description=window.FOF_TERRAIN_LEGEND(t,cell,layer);
  const {units,markers}=contents(s,cell);
  const names=items=>items.map(i=>esc(i.label+(i.condition?'（'+i.condition+'）':''))).join('、');
  const row=({glyph,title,meaning})=>'<div class="legend-row">'+(glyph?'<span class="legend-glyph glyph-'+glyph+'" aria-hidden="true"></span>':'')+
   '<dt>'+esc(title)+'</dt><dd>'+esc(meaning)+'</dd></div>';
  const summary=description.summary+(layer!==null&&id==null?'　此層牌號未記錄':'');
  return '<p class="legend-summary">'+esc(summary)+'</p><dl>'+description.rows.map(row).join('')+'</dl>'+
   (units.length?'<p class="legend-pieces"><b>本牌算子</b>　'+names(units)+'</p>':'')+
   (markers.length?'<p class="legend-pieces"><b>本牌標記</b>　'+names(markers)+'</p>':'')+
   (cell.pending&&cell.contactDetail?'<p class="legend-pieces"><b>接敵配置</b>　'+esc(cell.contactDetail)+'</p>':'');
 }

 let timer,active,shownSrc,described,pointerPosition,scrollFrame;
 function dismiss(){
  clearTimeout(timer);active=null;shownSrc=null;preview.hidden=true;
  if(described){described.removeAttribute('aria-describedby');described=null;}
  if(preview.parentElement!==document.body)document.body.append(preview);
 }
 function schedule(anchor,src,name,info='',symbol='',details=null){
  if(anchor===active&&src===shownSrc)return;
  dismiss();active=anchor;shownSrc=src;
  timer=setTimeout(()=>{
   if(!anchor.isConnected)return;
   const modal=anchor.closest('dialog');
   if(modal?!modal.open:document.querySelector('dialog[open]'))return;
   if(modal)modal.append(preview);
   preview.dataset.kind=anchor.hasAttribute('data-piece-name')?'piece':'card';
   preview.toggleAttribute('data-terrain',!!details);
   legendPanel.hidden=!details;
   const r=anchor.getBoundingClientRect(),margin=10;
   const roomRight=innerWidth-r.right-margin,roomLeft=r.left-margin;
   const onRight=roomRight>=710||roomRight>=roomLeft;
   if(details){
    preview.style.setProperty('--preview-room',Math.max(220,onRight?roomRight:roomLeft)+'px');
    legendPanel.style.setProperty('--legend-face','url("'+src+'")');
    legendPanel.innerHTML=details();legendPanel.scrollTop=0;
   }else legendPanel.replaceChildren();
   caption.textContent=name;note.textContent=info;note.hidden=!info;
   picture.hidden=!src;if(src)picture.src=src;else picture.removeAttribute('src');
   symbolFace.hidden=!!src;symbolFace.textContent=symbol;
   preview.hidden=false;
   described=anchor.querySelector('.tile')||anchor;described.setAttribute('aria-describedby',preview.id);
   const p=preview.getBoundingClientRect(),gap=details?0:margin;
   const left=(details?onRight:r.right+p.width+2*margin<=innerWidth)?r.right+gap:r.left-p.width-gap;
   preview.style.left=Math.max(margin,Math.min(innerWidth-p.width-margin,left))+'px';
   preview.style.top=Math.max(margin,Math.min(innerHeight-p.height-margin,(r.top+r.bottom-p.height)/2))+'px';
  },380);
 }
 function pieceAtPointer(surface,event){
  // These markers let clicks pass through to a destination card or a printed command box.
  const pieces=surface.querySelectorAll('[data-piece-name]');
  for(let i=pieces.length-1;i>=0;i--){
   const r=pieces[i].getBoundingClientRect();
   if(event.clientX>=r.left&&event.clientX<r.right&&event.clientY>=r.top&&event.clientY<r.bottom)return pieces[i];
  }
 }
 function inspect(event){
  const pointer=event.type==='pointermove',target=event.target;
  if(preview.contains(target))return;
  const card=target.closest('.card-location');
  let piece=target.closest('[data-piece-name]');
  if(!piece&&pointer){
   const surface=target.closest('#commandPaper')||(card?.matches('.choosing-cell .card-location,.move-target')&&card);
   if(surface)piece=pieceAtPointer(surface,event);
  }
  if(piece){
   const name=piece.dataset.pieceName;
   const src=catalog.get(piece.dataset.pieceArt)?.art||piece.querySelector('img')?.src;
   const symbol=piece.querySelector('.chit-text,.sheet-custom,.piece-icon')?.textContent||name.slice(0,3);
   schedule(piece,src,name,piece.dataset.pieceInfo,symbol);return;
  }
  const discard=target.closest('#discardPile'),front=discard?.querySelector('img');
  if(front&&!front.hidden){schedule(discard,front.src,front.alt);return;}
  if(!card||card.hasAttribute('data-staging')||target.closest('.pile-count')){dismiss();return;}
  let img=card.querySelector('.board-face'),name=card.querySelector('.cell-name').textContent;
  let number=card.querySelector('.cell-ref small')?.textContent||'',layer=null;
  if(pointer&&event.clientY<img.getBoundingClientRect().top){
   const hill=[...card.querySelectorAll('.hill-face')].reverse().find(h=>event.clientY>=h.getBoundingClientRect().top);
   if(hill){img=hill;layer=[...card.querySelectorAll('.hill-face')].indexOf(hill);name='下層丘陵';number=hill.dataset.code;}
  }
  schedule(card,img.src,[card.querySelector('.cell-ref b').textContent,name,number].filter(Boolean).join('　'),'','',()=>terrainNotes(card,layer));
 }
 function stop(){
  pointerPosition=null;cancelAnimationFrame(scrollFrame);dismiss();
 }
 document.addEventListener('pointermove',e=>{
  if(preview.contains(e.target))return;
  if(e.pointerType==='touch'||e.buttons){stop();return;}
  pointerPosition={clientX:e.clientX,clientY:e.clientY};inspect(e);
 });
 document.addEventListener('focusin',e=>{if(e.target.matches(':focus-visible')){stop();inspect(e);}});
 document.addEventListener('focusout',dismiss);
 document.addEventListener('pointerout',e=>{if(!e.relatedTarget)stop();});
 document.addEventListener('close',stop,true);
 document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){stop();return;}
  if(!preview.hidden&&!legendPanel.hidden&&document.activeElement===described){
   const delta={ArrowDown:40,ArrowUp:-40,PageDown:legendPanel.clientHeight,PageUp:-legendPanel.clientHeight}[e.key];
   if(delta&&legendPanel.scrollHeight>legendPanel.clientHeight){e.preventDefault();legendPanel.scrollBy(0,delta);}
  }
 });
 document.addEventListener('pointerdown',e=>{if(!preview.contains(e.target))stop();},true);
 document.addEventListener('scroll',e=>{
  if(preview.contains(e.target))return;
  dismiss();cancelAnimationFrame(scrollFrame);
  scrollFrame=requestAnimationFrame(()=>{
   if(!pointerPosition)return;
   const target=document.elementFromPoint(pointerPosition.clientX,pointerPosition.clientY);
   if(target)inspect({target,type:'pointermove',...pointerPosition});
  });
 },true);
 window.addEventListener('blur',stop);window.addEventListener('resize',stop);
 return {tile,pile,dismiss};
};
})();
