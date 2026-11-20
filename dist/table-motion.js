/* The game saves once. This layer replays committed actions without touching its state. */
(() => {
'use strict';
const $=id=>document.getElementById(id),create=(name,cls)=>Object.assign(document.createElement(name),{className:cls});
const symbols={fire:'◎',assault:'◎',support:'✹',loss:'−',pin:'↓',rally:'↑',cover:'▰',spot:'⊙',contact:'?',order:'◇',supply:'＋',record:'≡',event:'!',weather:'◒',phase:'◷',objective:'⚑',marker:'◆',status:'◇',map:'▦',check:'✓',flight:'✈',evacuate:'↗',retreat:'↶'};
const sideText={enemy:'敵軍',friendly:'友軍',neutral:'棋桌'};
const moving=e=>!e.inPlace&&(e.kind==='move'||e.kind==='retreat'||e.kind==='evacuate');
function createPlayer(catalog){
 const board=$('board'),port=$('mapViewport'),layer=create('div','motion-layer');
 layer.setAttribute('aria-hidden','true');board.append(layer);
 const hud=create('div','motion-hud');hud.id='motionHUD';hud.setAttribute('popover','manual');
 const actor=create('strong','motion-actor'),label=create('span','motion-label'),skip=create('button','motion-skip');
 label.setAttribute('role','status');skip.type='button';skip.textContent='略過動畫';hud.append(actor,label,skip);document.body.append(hud);
 const masks=document.createElement('style');document.head.append(masks);
 let current=null;
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const clearHidden=()=>{masks.textContent='';};
 function stop(finish=false){
  if(!current)return;
  const run=current;current=null;for(const animation of run.animations)animation.cancel();
  clearHidden();layer.replaceChildren();hud.querySelector('.motion-flight')?.remove();layer.removeAttribute('data-stage');
  board.removeAttribute('aria-busy');
  delete board.dataset.animating;delete hud.dataset.kind;
  if(hud.matches(':popover-open'))hud.hidePopover();
  run.done?.();
  if(finish)for(const callback of run.afterPlayback)callback();
 }
 skip.addEventListener('click',()=>stop(true));
 document.addEventListener('keydown',ev=>{if(current&&ev.key==='Escape'){ev.preventDefault();ev.stopImmediatePropagation();stop(true);}},true);
 // Menus and history controls can interrupt playback. A repeated action cannot spend twice.
 document.addEventListener('click',ev=>{
  if(!current)return;
  const button=ev.target.closest('[data-action]');if(!button)return;
  if(/^(undo|lessonBack|missions|courses|saves|guide|camBook|resume|courseResume|courseStart|close|zoomIn|zoomOut|fitBoard|last|inspectDiscard|lessonTab)$/.test(button.dataset.action)){stop();return;}
  ev.preventDefault();ev.stopImmediatePropagation();
 },true);
 document.addEventListener('submit',ev=>{if(current){ev.preventDefault();ev.stopImmediatePropagation();}},true);
 function capture(){
  const base=board.getBoundingClientRect();
  const rect=el=>{
   if(!el)return null;
   const r=el.getBoundingClientRect();
   return r.width&&r.height?{x:r.left-base.left+r.width/2,y:r.top-base.top+r.height/2,w:r.width,h:r.height}:null;
  };
  const cells=new Map(),units=new Map(),commands=new Map();
  for(const node of board.querySelectorAll('.card-location')){
   const [x,y]=node.dataset.coord.split(',').map(Number),card=node.querySelector('.board-face');
   cells.set(String.fromCharCode(65+x)+y,{pos:rect(card),src:card.getAttribute('src')});
   for(const el of node.querySelectorAll('[data-counter-id]')){
    const p=rect(el);if(p)units.set(el.dataset.counterId,{...p,coord:String.fromCharCode(65+x)+y});
   }
  }
  for(const el of board.querySelectorAll('[data-command-id]'))commands.set(el.dataset.commandId,{pos:rect(el),area:el.dataset.area,points:el.dataset.points,src:el.querySelector('img')?.getAttribute('src'),label:el.getAttribute('aria-label')});
  const discard=$('discardFace');
  const regions={command:rect($('commandPaper')),worksheet:rect(board.querySelector('.reorg-sheet'))||rect($('commandPaper')),discard:rect($('discardPile')),deck:rect($('drawPile'))};
  regions.board={x:port.scrollLeft+port.clientWidth/2,y:port.scrollTop+port.clientHeight/2,w:36,h:36};
  return {cells,units,commands,regions,top:discard.hidden?null:discard.getAttribute('src')};
 }
 function pos(el,p){
  el.style.left=p.x+'px';el.style.top=p.y+'px';
 }
 function mask(run,key,selector,active){
  if(active)run.hidden.set(key,selector);else run.hidden.delete(key);
  masks.textContent=run.hidden.size?[...run.hidden.values()].join(',')+'{visibility:hidden!important}':'';
 }
 function unitMask(run,id,on){const query='[data-counter-id="'+CSS.escape(id)+'"]';mask(run,'u'+id,'#terrainGrid '+query+',#terrainGrid .stack-member:has(> '+query+')',on);}
 function anim(run,el,frames,ms,options={}){
  if(current!==run||!el)return Promise.resolve();
  const a=el.animate(frames,{duration:ms,easing:'ease-out',fill:'forwards',...options});run.animations.add(a);
  return a.finished.catch(()=>{}).finally(()=>{run.animations.delete(a);a.cancel();});
 }
 function photo(src,alt=''){
  const im=document.createElement('img');im.src=src;im.alt=alt;im.draggable=false;return im;
 }
 function token(run,e,p){
  if(!e.piece||!p)return null;
  const id=e.piece.id;
  if(run.tokens.has(id))return run.tokens.get(id);
  const el=create('span','motion-counter');el.dataset.unit=id;el.dataset.side=e.piece.side||'neutral';
  const face=catalog.get(e.piece.art)?.art;
  if(face)el.append(photo(face));else el.textContent=e.piece.name?.slice(0,3)||'◆';
  const size=Math.max(16,Math.min(65,run.before.units.get(id)?.w||run.after.units.get(id)?.w||p.w*.2||23));
  el.style.width=size+'px';pos(el,p);layer.append(el);run.tokens.set(id,el);return el;
 }
 const cell=(s,key)=>s.cells.get(key)?.pos;
 function point(run,e,end){
  const snap=end?run.after:run.before,coord=end?e.to:e.from;
  return (coord&&cell(snap,coord))||snap.units.get(e.piece?.id)||cell(snap,e.to||e.from)||snap.regions[e.region]||snap.regions.board;
 }
 function frameRoute(a,b){
  const pad=28,minX=Math.min(a.x,b.x)-pad,maxX=Math.max(a.x,b.x)+pad,minY=Math.min(a.y,b.y)-pad,maxY=Math.max(a.y,b.y)+pad;
  if(maxX-minX>port.clientWidth||maxY-minY>port.clientHeight){
   port.scrollTo({left:a.x-port.clientWidth/2,top:a.y-port.clientHeight/2,behavior:'instant'});return true;
  }
  if(minX>=port.scrollLeft&&maxX<=port.scrollLeft+port.clientWidth&&minY>=port.scrollTop&&maxY<=port.scrollTop+port.clientHeight)return;
  if(port.scrollWidth>port.clientWidth||port.scrollHeight>port.clientHeight)port.scrollTo({left:(minX+maxX-port.clientWidth)/2,top:(minY+maxY-port.clientHeight)/2,behavior:'instant'});
 }
 const revealArrow=[{clipPath:'inset(-18px 100% -18px -8px)'},{clipPath:'inset(-18px -16px -18px -8px)',offset:.32},{clipPath:'inset(-18px -16px -18px -8px)'}];
 function route(a,b,side){
  const line=create('span','motion-arrow');line.dataset.side=side||'neutral';pos(line,a);
  line.style.width=Math.max(9,Math.hypot(b.x-a.x,b.y-a.y))+'px';
  line.style.setProperty('--angle',Math.atan2(b.y-a.y,b.x-a.x)+'rad');layer.append(line);return line;
 }
 const shift=(a,b)=>'translate('+Number(b.x-a.x)+'px,'+Number(b.y-a.y)+'px)';
 async function move(run,e){
  const id=e.piece?.id;
  let a=run.before.units.get(id)||point(run,e,false),b=run.after.units.get(id)||point(run,e,true);
  if(e.kind!=='move')b={x:a.x,y:a.y+(e.side==='enemy'?-45:45)};
  else if(e.from===e.to){a={...a,x:a.x-15};b={...b,x:b.x+3};}
  const follow=frameRoute(a,b),traveller=token(run,e,a);if(!traveller)return;
  pos(traveller,a);traveller.hidden=false;
  const arrow=route(a,b,e.side);layer.dataset.stage='direction';traveller.dataset.stage='direction';
  await anim(run,arrow,run.quiet?[{opacity:1},{opacity:1}]:revealArrow,1350);
  if(current!==run)return;
  layer.dataset.stage='travel';traveller.dataset.stage='travel';
  if(follow)port.scrollTo({left:b.x-port.clientWidth/2,top:b.y-port.clientHeight/2,behavior:run.quiet?'instant':'smooth'});
  if(run.quiet){pos(traveller,b);await anim(run,traveller,[{opacity:.8},{opacity:1}],1050);}
  else await anim(run,traveller,[{transform:'translate(0,0)'},{transform:shift(a,b),opacity:e.kind==='move'?1:.12}],1050);
  if(current!==run)return;
  pos(traveller,b);await anim(run,arrow,[{opacity:1},{opacity:.7}],400);
  if(current!==run)return;
  arrow.remove();traveller.remove();run.tokens.delete(id);unitMask(run,id,false);
 }
 function firingPath(a,b,side){
  if(Math.hypot(b.x-a.x,b.y-a.y)>=55)return {arrow:route(a,b,side),frames:[{transform:'translate(0,0)'},{transform:shift(a,b)}]};
  // Nearby counters still need a legible route with an arrowhead at the actual target.
  const dir=b.x>=a.x?1:-1,first={x:a.x-18*dir,y:a.y-39},second={x:b.x+18*dir,y:b.y-39};
  const lowX=Math.min(a.x,b.x,first.x,second.x)-7,lowY=Math.min(first.y,second.y)-7;
  const width=Math.max(a.x,b.x,first.x,second.x)-lowX+7,height=Math.max(a.y,b.y)-lowY+7;
  const arrow=create('span','motion-arrow local-shot');pos(arrow,{x:lowX,y:lowY});arrow.dataset.side=side||'neutral';
  arrow.style.width=width+'px';arrow.style.height=height+'px';
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg'),line=document.createElementNS(ns,'path'),head=document.createElementNS(ns,'path');
  const pair=p=>(p.x-lowX)+' '+(p.y-lowY);
  svg.setAttribute('viewBox','0 0 '+width+' '+height);
  line.setAttribute('d','M '+pair(a)+' C '+pair(first)+' '+pair(second)+' '+pair(b));line.setAttribute('class','shot-line');
  head.setAttribute('d','M 0 0 L -12 -6 L -9 0 L -12 6 Z');
  head.setAttribute('transform','translate('+pair(b)+') rotate('+Math.atan2(b.y-second.y,b.x-second.x)*180/Math.PI+')');
  svg.append(line,head);arrow.append(svg);layer.append(arrow);
  const frames=Array.from({length:15},(_,i)=>{const t=i/14,u=1-t;const axis=k=>u**3*a[k]+3*u*u*t*first[k]+3*u*t*t*second[k]+t**3*b[k];return {transform:shift(a,{x:axis('x'),y:axis('y')}),offset:t};});
  return {arrow,frames};
 }
 function counterAt(run,id,coord){
  const ghost=id&&run.tokens.get(id);
  if(ghost&&!ghost.hidden)return {x:parseFloat(ghost.style.left),y:parseFloat(ghost.style.top),w:ghost.offsetWidth};
  const now=run.after.units.get(id),old=run.before.units.get(id);
  return (now&&(!coord||now.coord===coord)?now:null)||old||cell(run.after,coord)||cell(run.before,coord);
 }
 async function shoot(run,e){
  const b=counterAt(run,e.target,e.to);
  if(!b)return;
  const a=(e.from||e.shooter)?counterAt(run,e.shooter,e.from):null;
  const follow=frameRoute(a||b,b);
  let arrow;
  if(a){
   const path=firingPath(a,b,e.side);arrow=path.arrow;arrow.dataset.kind='shot';
   layer.dataset.stage='aim';
   await anim(run,arrow,run.quiet||arrow.classList.contains('local-shot')?[{opacity:.8},{opacity:1}]:revealArrow,1350);
   if(current!==run)return;
   layer.dataset.stage='shot';
   if(follow)port.scrollTo({left:b.x-port.clientWidth/2,top:b.y-port.clientHeight/2,behavior:run.quiet?'instant':'smooth'});
   const trace=create('span','motion-trace');pos(trace,run.quiet?b:a);layer.append(trace);
   await anim(run,trace,run.quiet?[{opacity:.8},{opacity:1}]:path.frames,650);
   trace.remove();
   if(current!==run)return;
  }
  layer.dataset.stage='impact';
  const outcome=e.outcome;
  const text={hit:'HIT!',miss:'MISS!',pin:'PIN!',success:'↶ 撤退'}[outcome];
  const ring=create('span','motion-impact');ring.dataset.outcome=outcome;ring.dataset.target=e.target||'';pos(ring,b);
  ring.style.setProperty('--diameter',Math.max(34,Math.min(75,(e.target?b.w:35)||32)+10)+'px');
  const tag=create('b','impact-tag');tag.textContent=text;ring.append(tag);layer.append(ring);
  const chip=e.target&&(run.tokens.get(e.target)||board.querySelector('.map-chit[data-value="'+CSS.escape(e.target)+'"]'));
  const victim=chip||(!run.before.units.has(e.target)&&e.targetPiece&&token(run,{piece:e.targetPiece},b));
  const steady=[{opacity:1},{opacity:1}],reactions={
   hit:[{transform:'translateX(0)'},{transform:'translateX(-5px) rotate(-6deg)',filter:'brightness(1.55)',offset:.14},{transform:'translateX(4px) rotate(4deg)',offset:.28},{transform:'none',offset:.43},{transform:'none'}],
   miss:[{filter:'brightness(1)'},{filter:'brightness(1.4)',offset:.25},{filter:'brightness(1)'}],
   pin:[{transform:'translateY(0)'},{transform:'translateY(4px) scale(.90)',offset:.25},{transform:'translateY(4px) scale(.90)',offset:.7},{transform:'none'}],
   success:[{transform:'none'},{transform:'translateY(-6px)',offset:.35},{transform:'none'}]
  };
  const animations=[anim(run,ring,run.quiet?steady:[{opacity:.55},{opacity:1,offset:.12},{opacity:1,offset:.92},{opacity:.8}],1550)];
  if(victim)animations.push(anim(run,victim,run.quiet?steady:reactions[outcome],1550));
  await Promise.all(animations);arrow?.remove();ring.remove();
  if(victim&&!chip){victim.remove();run.tokens.delete(e.target);}
 }
 function spark(run,e,p,ms){
  const mark=create('span','motion-signal');mark.dataset.kind=e.kind;mark.dataset.side=e.side||'neutral';
  mark.textContent=symbols[e.kind]||'◆';mark.title=e.label;pos(mark,p);layer.append(mark);
  const drift={
   fire:['scale(.4) rotate(-22deg)','scale(1.45)'],support:['translateY(-24px) scale(.7)','scale(1.5)'],assault:['translateX(-16px)','scale(1.22)'],
   loss:['scale(1.45)','translateY(14px) scale(.6)'],pin:['translateY(-17px)','translateY(3px)'],rally:['translateY(13px)','translateY(-16px)'],
   spot:['scale(1.8)','scale(.76)'],cover:['scaleX(.35)','scaleX(1.2)'],contact:['scale(.5) rotate(-35deg)','scale(1.35)'],
   order:['translateX(-16px)','translateX(10px)'],record:['translateY(-11px) rotate(-8deg)','scale(.9)'],supply:['translateY(-18px)','translateY(2px)'],
   objective:['translateY(-22px)','scale(1.1)'],marker:['scale(1.45)','scale(.85)'],phase:['rotate(-90deg)','rotate(25deg)'],weather:['translateX(16px)','translateX(-13px)']
  }[e.kind]||['scale(.55)','scale(1.2)'];
  const frames=run.quiet?[{opacity:.75},{opacity:1}]:[{opacity:0,transform:drift[0]},{opacity:1,transform:'none',offset:.35},{opacity:1,offset:.7},{opacity:0,transform:drift[1]}];
  return anim(run,mark,frames,ms).then(()=>mark.remove());
 }
 async function flip(run,e,terrain){
  const src=terrain?run.after.cells.get(e.to)?.src:e.id?'assets/action/'+String(e.id).padStart(2,'0')+'.webp':'assets/action-back.webp';
  const back=terrain?run.before.cells.get(e.to)?.src:e.id?'assets/action-back.webp':run.before.top||'assets/action-back.webp';
  const a=terrain?cell(run.after,e.to):run.after.regions[e.kind==='shuffle'?'discard':'deck'];
  const b=terrain?a:run.after.regions[e.kind==='shuffle'?'deck':'discard'];if(!a||!b||!back||!src)return;
  const el=create('span','motion-card');el.dataset.kind=e.kind;el.style.width=a.w+'px';el.style.height=a.h+'px';pos(el,a);
  const front=photo(src),rear=photo(back);rear.className='motion-card-back';front.className='motion-card-front';el.append(rear,front);layer.append(el);
  if(run.quiet){
   pos(el,b);el.style.transform='rotateY(180deg)';await anim(run,el,[{opacity:.4},{opacity:1}],640);
  }else await anim(run,el,[{transform:'translate(0,0) rotateY(0deg)'},{transform:shift(a,b)+' rotateY(180deg)'}],680);
  el.remove();
  if(current===run){if(terrain){mask(run,'terrain'+e.to,'',false);run.oldTerrain.get(e.to)?.remove();}else{mask(run,'discard','',false);run.oldTop?.remove();}}
 }
 async function effect(run,e,ms){
  const p=point(run,e,true);
  if(e.kind==='fire'&&e.outcome)return shoot(run,e);
  if(e.kind==='pin'&&e.piece)return shoot(run,{outcome:'pin',target:e.piece.id,targetPiece:e.piece,to:e.to});
  if(e.kind==='flight'){
   const path=create('span','motion-flight'),aircraft=document.createElement('i');aircraft.textContent='✈';
   path.setAttribute('aria-hidden','true');path.append(aircraft);label.after(path);
   layer.dataset.stage='direction';
   await anim(run,path,[{opacity:.4},{opacity:1}],800);
   if(current!==run)return;layer.dataset.stage='travel';
   await anim(run,aircraft,[{transform:'translateX(0)'},{transform:'translateX(42px)'}],850);
   path.remove();return;
  }
  if(e.kind==='appear'||e.kind==='remove'){
   const id=e.piece.id,where=(e.kind==='appear'?run.after:run.before).units.get(id)||p;
   const ghost=token(run,e,where);ghost.hidden=false;
   const enter=e.kind==='appear',frames=enter?[{opacity:0,transform:'scale(.45)'},{opacity:1,transform:'scale(1)'}]:[{opacity:1},{opacity:0,transform:'scale(.55)'}];
   await anim(run,ghost,frames,ms);
   if(current!==run)return;
   if(!enter||run.after.units.has(id)){ghost.remove();run.tokens.delete(id);unitMask(run,id,false);}
   return;
  }
  if(moving(e)&&e.piece)return move(run,e);
  if(e.kind==='draw'||e.kind==='shuffle'||e.kind==='reveal')return flip(run,e,e.kind==='reveal');
  if(e.kind==='deal'){
   const tile=run.after.cells.get(e.to);if(!tile?.src)return;
   const face=photo(tile.src);face.className='motion-old-card';face.style.width=p.w+'px';face.style.height=p.h+'px';pos(face,p);layer.append(face);
   await anim(run,face,[{opacity:0,transform:'translateY(-20px) scale(.86)'},{opacity:1,transform:'none'}],ms);
   face.remove();if(current===run)mask(run,'terrain'+e.to,'',false);return;
  }
  return spark(run,e,p,ms);
 }
 function placeHud(){
  const dialog=document.querySelector('dialog[open]');
  const r=(dialog||port).getBoundingClientRect();
  hud.style.maxWidth=Math.max(240,r.width-24)+'px';
  hud.style.left=(r.left+r.width/2)+'px';hud.style.top=(Math.min(innerHeight,r.bottom)-10)+'px';
 }
 async function playback(run,beats){
  if(current!==run)return;
  run.after=capture();
  const all=beats.flat();
  for(const e of all){
   const id=e.piece?.id,at=run.before.units.get(id)||point(run,e,false);
   if(id&&(moving(e)||e.kind==='remove'||e.kind==='appear')){
    unitMask(run,id,true);
    if((moving(e)||e.kind==='remove')&&!run.tokens.has(id)&&!all.some(other=>other.kind==='appear'&&other.piece?.id===id))token(run,e,at);
   }
   if(e.kind==='reveal'||e.kind==='deal'){
    const key=window.FOF_CAMPAIGNS.coord(e.to),old=run.before.cells.get(e.to),p=cell(run.after,e.to);
    mask(run,'terrain'+e.to,'.card-location[data-coord="'+key.x+','+key.y+'"] .board-face',true);
    if(e.kind==='reveal'&&old?.src&&p){const im=photo(old.src);im.className='motion-old-card';im.style.width=p.w+'px';im.style.height=p.h+'px';pos(im,p);layer.append(im);run.oldTerrain.set(e.to,im);}
   }
  }
  if(all.some(e=>e.kind==='draw'||e.kind==='shuffle')){
   const p=run.after.regions.discard;mask(run,'discard','#discardFace',true);
   if(run.before.top&&p){const im=photo(run.before.top);im.className='motion-old-card';im.style.width=p.w+'px';im.style.height=p.h+'px';pos(im,p);layer.append(im);run.oldTop=im;}
  }
  // Read positions only after the final synchronous rerender, including reopened sheets.
  const tracks=[];
  for(const [id,b] of run.after.commands){
   const a=run.before.commands.get(id);
   if(!a?.pos||!b.pos||a.area===b.area&&a.points===b.points)continue;
   const ghost=create('span','motion-counter motion-command');ghost.style.width=a.pos.w+'px';
   if(a.src)ghost.append(photo(a.src));else ghost.textContent=a.points;
   pos(ghost,a.pos);layer.append(ghost);
   mask(run,'cmd'+id,'#command-display [data-command-id="'+CSS.escape(id)+'"]',true);
   tracks.push({id,a,b,ghost});
  }
  const last=beats.length-1;
  for(const [i,group] of beats.entries()){
   if(current!==run)return;
   const first=group[0];layer.dataset.stage=first.kind;hud.dataset.kind=first.kind;
   const sides=new Set(group.map(e=>e.side||'neutral'));
   const owner=sides.size===1?first.side||'neutral':'neutral';
   actor.dataset.side=owner;actor.textContent=sideText[owner]||'棋桌';
   label.textContent=group.length===1?first.label:group.map(e=>e.label).join('　／　');
   label.title=label.textContent;placeHud();if(!hud.matches(':popover-open'))hud.showPopover();
   const ms=800;
   const animations=group.map(e=>effect(run,e,ms));
   const sheet=document.querySelector('dialog[open] .modalhead');
   if(sheet)animations.push(anim(run,sheet,[{boxShadow:'inset 0 -3px #d9a84f'},{boxShadow:'inset 0 -3px transparent'}],ms));
   if(i===last)for(const {id,a,b,ghost} of tracks){
    animations.push((async()=>{
     const path=Math.hypot(b.pos.x-a.pos.x,b.pos.y-a.pos.y)>8?route(a.pos,b.pos,'friendly'):null;
     if(path)await anim(run,path,[{opacity:.3},{opacity:1}],650);
     if(current!==run)return;
     await anim(run,ghost,[{transform:'translate(0,0)'},{transform:shift(a.pos,b.pos)}],700);
     if(current===run){path?.remove();ghost.remove();mask(run,'cmd'+id,'',false);}
    })());
   }
   await Promise.all(animations);
  }
 }
 function play(before,beats,done){
  stop();if(!beats.length){done?.();return;}
  const run={before,done,afterPlayback:[],tokens:new Map(),oldTerrain:new Map(),hidden:new Map(),animations:new Set(),quiet:reduced.matches};
  current=run;board.dataset.animating='true';board.setAttribute('aria-busy','true');
  queueMicrotask(()=>playback(run,beats).catch(error=>console.error('棋桌動畫',error)).finally(()=>{if(current===run)stop(true);}));
 }
 function defer(callback){if(!current)return false;current.afterPlayback.push(callback);return true;}
 return {capture,play,stop,defer};
}
window.FOF_TABLE_MOTION={create:createPlayer};
})();
