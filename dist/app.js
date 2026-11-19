(() => {
'use strict';
const G=window.FOF,$=id=>document.getElementById(id);
const Q=window.FOF_QUICK;const quick=()=>s.id==='Q1';
const C=window.FOF_COURSE, draws=window.FOF_DRAW_VIEW, piles=window.FOF_TABLE_DRAW;
const key='fields-of-fire.table.v1', $modal=$('panel');
const catalog=new Map([...window.FOF_PIECES,...(window.FOF_COURSE_PIECES||[]),...window.FOF_CAMPAIGN_PIECES].map(p=>[p.id,p]));
const actLabels=['未接敵','接敵','交戰','激烈交戰'];
const objectiveName=k=>({primary:'主要目標',secondary:'次要目標',position:'攻擊陣地',outpost:'戰鬥前哨'})[k]||'路線點 '+k.slice(3);
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0'), pic=(src,cls='',alt='')=>'<img class="'+cls+'" src="'+esc(src)+'" alt="'+esc(alt)+'">';
const button=(action,label,cl='',value='',dis=false)=>'<button type="button" data-action="'+action+'" data-value="'+esc(value)+'" class="'+cl+'" '+(dis?'disabled':'')+'>'+esc(label)+'</button>';
const box=(title,body)=>'<section class="cardbox sidebox"><h3>'+esc(title)+'</h3>'+body+'</section>';
const title=id=>C.has(id)?C.lessons[id].title:id==='T1'?'啟動與移動':id==='Q1'?'特雷維耶爾快戰':G.scenario(id).title;
const readPos=v=>{const [x,y]=String(v).split(',').map(Number);return {x,y};};
const campaigns=window.FOF_CAMPAIGNS,series=window.FOF_SERIES;
let slots={},s,storageOK=true;
try{const b=JSON.parse(localStorage.getItem(key)||'null');if(b?.slots){for(const [id,st] of Object.entries(b.slots)){if(id===campaigns.key(st)&&G.validSave(st))slots[id]=C.has(id)?C.restore(st):campaigns.restore(st);}s=slots[b.active];}}catch{storageOK=false;}
s=s||C.start('P1');slots[campaigns.key(s)]=s;
let selected=null,focus=null,mode='',group=false,sideTab='play',modal='',modalData=null,toastTimer,origin=null;
const history=[];
const selectedUnit=()=>s.units.find(u=>u.id===selected);
const conf=()=>G.scenario(s.id);
const course=()=>C.has(s.id);
const isTable=()=>!course()&&G.isTable(s);
const lessons=window.FOF_LESSON_UI({state:()=>s,slots:()=>slots,switchState:st=>{s=st;resetView();},edit,render,dialog,close,tell,button,esc,box,tokenPic,logView,lastRow});
const commandDisplay=window.FOF_COMMAND_DISPLAY.create({state:()=>s,esc,button,edit});
const campaignUI=window.FOF_CAMPAIGN_UI({state:()=>s,slots:()=>slots,switchTo:st=>{s=st;resetView();},edit,dialog,button,close,tell,esc,missionChoice,entryBrief,result,render,cellDialog});
function drawGroups(){
 if(s.tableRun){
  const read=piles.frames(s.tableRun).slice(0,s.tableRun.shown).filter(f=>f.id);
  return read.map(f=>({why:f.why,ids:[f.id]}));
 }
 return s.recentDraws?.length?s.recentDraws:s.last.length?[{why:'行動牌',ids:s.last}]:[];}
function visiblePiles(){
 if(s.tableRun){
  const frame=piles.frames(s.tableRun)[s.tableRun.shown-1];
  return {remaining:frame.remaining,top:frame.id};
 }
 return {remaining:s.deck.length,top:s.discard.at(-1)};
}
function drawProgress(){
 const run=s.tableRun,frames=piles.frames(run),next=frames[run.shown];
 if(!next.id)return '已抽足本次張數。點牌組重洗。';
 return next.why+'・點牌背翻下一張';
}
function renderPiles(){
 const {remaining,top}=visiblePiles(),order=s.drawOrder||piles.defaultOrder(s);
 const deck=$('drawPile'),discard=$('discardPile'),img=$('discardFace');
 const label=s.tableRun?drawProgress():piles.label(s,order);
 $('deckRemaining').textContent='剩 '+remaining+' 張';
 deck.disabled=!s.tableRun&&!order;deck.setAttribute('aria-label',label);
 deck.classList.toggle('ready',!deck.disabled);
 $('pilePrompt').textContent=deck.disabled?'':label;
 discard.disabled=!top;img.hidden=!top;
 if(top){
  const title=top===51?'重洗牌':'行動牌 #'+pad(top);
  img.src='assets/action/'+pad(top)+'.webp';img.alt=title+'・完整正面';
  discard.setAttribute('aria-label','棄牌堆頂・'+title);
 }else{img.removeAttribute('src');discard.setAttribute('aria-label','棄牌堆為空');}
}
function focusDraw(){
 const deck=$('drawPile');deck.scrollIntoView({block:'nearest',inline:'nearest'});deck.focus({preventScroll:true});
}
function armDraw(order){
 if(!piles.validForState(s,order))return;
 close();s.drawOrder=order;persist();render();focusDraw();
}
function flipAction(){
 if(draws.isOpen()||$modal.open)return;
 let run=s.tableRun;
 if(!run){
  const order=s.drawOrder||piles.defaultOrder(s);
  if(!order)return;
  run=piles.prepare(s,order);
  if(!run){delete s.drawOrder;persist();render();tell('目前無法執行這項抽牌。');return;}
  delete s.drawOrder;history.push(JSON.stringify(s));if(history.length>35)history.shift();
  s.tableRun=run;
 }
 const frames=piles.frames(run);
 run.shown++;
 if(run.shown>=frames.length){
  const oldPhase=s.phase;
  s=piles.finish(run);
  if(course())lessons.reset();
  if(run.order.type==='advance')afterAdvance(oldPhase);
  if(run.order.type==='contact'||run.order.type==='group')focus=G.at(s,run.order);
  if(!course())tell(s.log.at(-1)?.text||'抽牌完成。');
 }
 persist();render();
}
function showPending(){
 if(!s.pendingDraws?.length||draws.isOpen())return;
 const owner=s,reading=course()&&s.reading;
 const caption=reading?C.current(s).detail:s.pcOrder&&s.pendingDraws.some(g=>g.why.startsWith('同級 PC 順序'))?s.log.at(-1)?.text:s.pendingDraws.some(g=>g.ids.includes(51))?'重洗牌不計張數。抽滿本次所需的行動牌後，整副重新洗混。':'';
 draws.show(s.pendingDraws,'本次抽牌',caption,()=>{
  owner.recentDraws=owner.pendingDraws.splice(0);
  if(reading){C.complete(owner);lessons.reset();}
  persist();render();
 });
}
function tell(v){if($modal.open){let msg=$modal.querySelector('.modalmessage');if(!msg){msg=document.createElement('p');msg.className='modalmessage';msg.setAttribute('role','status');$modal.querySelector('.modalhead').after(msg);}msg.textContent=v;}$('toast').textContent=v;$('toast').classList.add('on');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('on'),2600);}
function persist(){slots[campaigns.key(s)]=s;try{localStorage.setItem(key,JSON.stringify({version:1,active:campaigns.key(s),slots}));storageOK=true;}catch{storageOK=false;} $('savedStatus').textContent=storageOK?'✓ 本機自動存檔':'目前僅保留在此頁　請匯出存檔';}
function edit(fn){const last=JSON.stringify(s);const ok=fn();if(ok===false)return false;history.push(last);if(history.length>35)history.shift();persist();render();return true;}
function campaignAddress(book){
 const url=new URL(location.href);
 if(book)url.searchParams.set('campaign',book);
 else url.searchParams.delete('campaign');
 if(url.href!==location.href)window.history.replaceState(window.history.state,'',url);
}
function close(){if(modal==='campaignIntro')campaignAddress(null);if($modal.open)$modal.close();modal='';modalData=null;}
function dialog(type,heading,html,data=null){
 if(type==='campaignIntro'||modal==='campaignIntro')campaignAddress(type==='campaignIntro'?data:null);
 tabletop.dismiss();modal=type;modalData=data;$modal.dataset.kind=type;$('modalBody').innerHTML='<div class="modalhead"><h2>'+esc(heading)+'</h2>'+button('close','×','','')+'</div><div class="modalcontent">'+html+'</div>';if(!$modal.open)$modal.showModal();$modal.scrollTop=0;}
function resetView(){lessons.reset();selected=null;focus=null;mode='';group=false;sideTab='play';history.length=0;origin=null;close();persist();render();}
function activeProgress(){if(!isTable())return {v:G.atThird(s),n:7,label:'抵達第 3 列'};const gs=G.goals(s);return {v:gs.filter(g=>g.done).length,n:gs.length,label:'達成任務條件'};}
function renderHero(){
 const book=quick()?null:conf()?.book;
 for(const link of document.querySelectorAll('.campaign-nav a')){
  if(link.dataset.value===book)link.setAttribute('aria-current','true');
  else link.removeAttribute('aria-current');
 }
 if(course()){$('hero').innerHTML=lessons.hero();return;}
 const m=conf();
 const section=m?campaigns.labels[m.book]+'戰役・任務 '+pad(m.number):'野戰手冊・演練 01';
 const kind=quick()?'單人快戰':m?(s.series?'連續戰役':'獨立任務'):'基礎演練';
 const light=m?((s.vis?'能見度 +'+s.vis:campaigns.moon(s)?'待抽月光牌':'日間')+(m.mode==='patrol'?'・第 '+s.patrol+' 排巡邏':'')):'日間';
 $('hero').innerHTML='<div class="mission-name"><small>'+esc(section)+'</small><h1>'+esc(title(s.id))+'</h1></div><span class="mission-context">'+esc(kind+' ／ '+light)+'</span><div class="hero-acts">'+(m&&!quick()?button('brief','任務簡報'):'')+button('courses','教學目錄','heroquick')+button('missions','任務選單')+'</div>';
}
function shortAbbr(u){return u.abbr||u.name.split(' · ')[0];}
function tokenPic(u){const t=catalog.get(u.art);return t?pic(t.art,'',u.name):'<b>'+esc(shortAbbr(u).slice(0,3))+'</b>';}
const backFace=()=>C.lessons[s.id]?.backFace||C.lessons[s.id]?.layout?.staging||(conf()?.book==='V'?'assets/fm2/terrain/VNback.webp':['H','K'].includes(conf()?.book)?'assets/staging-naktong.webp':'assets/terrain-back.webp');
const backName=()=>C.lessons[s.id]?.backName||((campaigns.labels[conf()?.book]||'諾曼第')+'地形牌背');
const tabletop=window.FOF_TERRAIN_TABLE({catalog,esc,pic,terrain:G.terrain,backFace,backName,objectiveName});
function destination(c){
 if(course())return lessons.target(c);
 if(isTable()&&!quick()&&mode==='move'&&selectedUnit())return !G.same(selectedUnit(),c)&&campaigns.canMove(s,selectedUnit(),c);
 if(quick())return Q.canMove(s,selectedUnit(),c);
 return !isTable()&&selected&&G.allowedMove(s,selected,c,group);
}
function renderBoard(){
 tabletop.dismiss();
 const sheet=!!C.lessons[s.id]?.worksheet;
 $('board').classList.toggle('worksheet-mode',sheet);
 $('boardTitle').textContent=sheet?'連隊編制':'地形棋桌';
 $('airPlanButton').hidden=s.id!=='H1';
 document.querySelector('.command-record').hidden=sheet;
 $('roster').hidden=course()&&!s.units.length;
 $('terrainTools').hidden=sheet;$('mapKey').hidden=sheet;
 $('board').closest('.board-pane').classList.toggle('worksheet-pane',sheet);
 if(sheet){$('mapSize').textContent='任務間';$('terrainGrid').innerHTML=lessons.worksheet();return;}
 $('mapSize').textContent=s.cols+' × '+s.rows;
 const cells=s.map.slice().sort((a,b)=>b.y-a.y||a.x-b.x);
 const chosen=course()?lessons.chosen():selected;
 $('board').classList.toggle('choosing-cell',course()?lessons.awaitingCell():mode==='move');
 const grid=$('terrainGrid');
 grid.style.setProperty('--cols',s.cols);
 grid.innerHTML=cells.map(c=>tabletop.tile(s,c,destination(c),G.same(focus,c),chosen)).join('');
 sizeBoard();
}
const scaleSteps=[46,60,72,88,104,128,152,180,220,268,325];
let fixedWidth=null,faceWidth=152;
function sizeBoard(){
 if(C.lessons[s.id]?.worksheet)return;
 const port=$('mapViewport');
 if(!port.clientHeight)return;
 const rows=new Set(s.map.map(c=>c.y));
 const extra=Array.from(rows,y=>Math.max(...s.map.filter(c=>c.y===y).map(c=>c.h))).reduce((sum,n)=>sum+n,0);
 const usableWidth=port.clientWidth-24,usableHeight=port.clientHeight-16;
 const sheetControls=$('sheetSelection').offsetHeight;
 // Both 5:7 piles sit above the sheet and scale with it.
 const sheetFit=Math.floor(Math.min(usableWidth*.35,(usableHeight-sheetControls-54)/(792/612+.29*1.4),510));
 const colSpace=(usableWidth-sheetFit-16-12*(s.cols-1))/s.cols;
 const inlineCaption=colSpace>=124;
 const captionHeight=inlineCaption?20:31, gap=6;
 const hFit=(port.clientHeight-16-gap*(rows.size-1)-captionHeight*rows.size)/(rows.size*1.4+extra*.22);
 const fitWidth=Math.max(18,Math.floor(Math.min(290,hFit,colSpace)));
 faceWidth=fixedWidth??fitWidth;
 const board=$('board');
 board.style.setProperty('--sheet-w',Math.round(sheetFit*faceWidth/fitWidth)+'px');
 board.style.setProperty('--face-w',faceWidth+'px');
 board.style.setProperty('--slot-w',Math.max(faceWidth,Math.min(colSpace,inlineCaption?126:83))+'px');
 board.style.setProperty('--caption-h',captionHeight+'px');
 board.classList.toggle('inline-caption',inlineCaption);
 $('boardScale').textContent=Math.round(faceWidth/152*100)+'%';
 $('fitBoard').setAttribute('aria-pressed',String(fixedWidth===null));
 document.querySelector('[data-action="zoomOut"]').disabled=faceWidth<=scaleSteps[0];
 document.querySelector('[data-action="zoomIn"]').disabled=faceWidth>=scaleSteps.at(-1);
}
function boardZoom(direction){
 if(!direction){fixedWidth=null;}
 else if(direction>0){fixedWidth=scaleSteps.find(n=>n>faceWidth)??scaleSteps.at(-1);}
 else{fixedWidth=scaleSteps.slice().reverse().find(n=>n<faceWidth)??scaleSteps[0];}
 sizeBoard();
 if(fixedWidth===null)$('mapViewport').scrollTo(0,0);
 else if(focus)revealCell(focus);
}
function revealCell(c){
 $('board').querySelector('[data-action="cell"][data-value="'+c.x+','+c.y+'"]')?.scrollIntoView({block:'nearest',inline:'nearest'});
}
function inspectStack(c){
 if(!c.t||c.faceDown)return;
 const t=G.terrain(c.t),layers=G.hillLayers(c);
 const surfaces=[{face:t?t.face:backFace(),name:t?[t.name,G.terrainCode(t)].filter(Boolean).join('　'):backName(),desc:layers.length?'上層地形':''}];
 layers.slice().reverse().forEach((id,i)=>surfaces.push({face:G.terrain(id??1).face,name:id?'丘陵　'+G.terrainCode(G.terrain(id)):'丘陵（示意牌）',desc:'下方第 '+(i+1)+' 張'+(id?'':'・舊存檔僅記錄層數')}));
 const figures=surfaces.map(v=>'<figure><figcaption><strong>'+esc(v.name)+'</strong><small>'+esc(v.desc)+'</small></figcaption>'+pic(v.face,'inspected-face',v.name)+'</figure>').join('');
 dialog('faces',G.nameAt(c)+'・'+(t?t.name:'集結區'),'<div class="stack-gallery" data-count="'+surfaces.length+'">'+figures+'</div>'+(course()&&c.marks.length?'<p>'+c.marks.map(esc).join('、')+'</p>':''));
}
function rosterButton(u){
 const t=catalog.get(u.art), st=u.casualty?'傷亡':u.pinned?'壓制':u.exposed?'暴露':G.nameAt(u);
 return '<button class="ubtn '+(selected===u.id?'selected':'')+'" data-action="unit" data-value="'+esc(u.id)+'" data-piece-name="'+esc(u.name)+'" data-piece-info="'+esc(st)+'">'+(t?pic(t.art,u.exposed?'faded':''):'<span class="piece-icon">◇</span>')+'<span><b>'+esc(shortAbbr(u))+'</b><small>'+esc(st)+'</small></span></button>';
}
function renderRoster(){if(course()){$('roster').innerHTML=lessons.roster();return;}const full=isTable(),list=full?s.units.filter(u=>u.side==='friendly'):s.units;
 $('roster').innerHTML='<div class="cardbox rosterbox"><div class="rosterhead"><h2>'+(full?'友軍編組':'第 1 排編組')+'</h2><span class="turnpill">'+list.length+' 枚算子</span></div><div class="rostergrid">'+list.map(rosterButton).join('')+'</div></div>';
}
function goalBox(){
 const p=activeProgress();const goal=isTable()?conf().objective:'讓七枚算子全部抵達第 3 列。三個步兵班可分別練習穿越不同的行。';
 return box('任務目標','<p class="hint">'+esc(goal)+'</p><div class="progressline"><i style="width:'+(p.n?p.v/p.n*100:0)+'%"></i></div><div class="row" style="display:flex;justify-content:space-between"><small>'+p.label+'</small><b class="mono">'+p.v+' / '+p.n+'</b></div>');
}
function logView(){return '<ul class="loglist">'+s.log.slice().reverse().map(e=>'<li><time>R'+pad(e.turn)+'</time>'+esc(e.text)+'</li>').join('')+'</ul>';}
function lastRow(){const last=drawGroups().at(-1)?.ids.at(-1);
 if(course()&&!last)return '<div class="lastcard-button"><span>行動牌組</span><small>尚未抽牌</small></div>';
 return '<button class="lastcard-button" data-action="'+(last?'last':'deck')+'"><span>▧　'+(last?'最近抽牌':'行動牌堆')+' <b>'+(last?'#'+pad(last):s.deck.length)+'</b></span><small>'+(last?'看牌面':'檢視牌組')+'</small></button>';}
function trainingPanel(){
 const stateInfo={ready:['抽取啟動命令牌','抽一張行動牌，讀取鋼盔裡的大數字。'],command:['結束排部命令','選擇一枚與排部同牌的單位，再點選有虛線框的相鄰地形。'],initiative:['結束回合','一般主動點可讓任一未暴露單位移動。結束回合時移除暴露標記。']};
 const [lab,hint]=stateInfo[s.phase];const u=selectedUnit(), remain=s.phase==='command'?Math.min(s.points,6-s.spent):s.points;
 let a='<div class="command-strip"><span>可用命令 <b>'+Math.max(0,remain)+'</b></span><small>保留 '+(s.phase==='command'?Math.min(6,s.points):s.saved)+'</small></div><p class="hint">'+hint+'</p>';
 if(u&&s.phase!=='ready')a+='<div class="selected-info"><b>'+esc(u.name)+'</b>　'+esc(G.nameAt(u))+'<br>'+esc(G.trainingStatus(s,u)||(group?'全排移動，花費 2 點':'單位移動，花費 1 點'))+'</div>';
 if(s.phase==='command'&&u?.id==='hq')a+=button('group',group?'✓ 全排移動（2 點）':'改用全排移動（2 點）','tiny '+(group?'highlight':''),'',!group&&(remain<2||!!G.trainingStatus(s,u)))+' ';
 a+=button('advance',lab,'primary wide')+'<div class="row"><small class="tagline">'+(s.guided?'手冊示範牌序':'隨機牌序')+'</small>'+button('undo','復原上一步','flat tiny','',!history.length)+'</div>';return a;
}
function tablePanel(){
 const setup=s.phase==='setup',next=setup?G.needed(s).find(k=>!s.objectives[k]):null;
 const info={setup:next?'下一個標記為「'+objectiveName(next)+'」。請選擇地圖上的位置。':'目標已就位，可調整起始編組並開始任務。',events:'抽取事件牌，依任務書登記事件。',orders:'以命令軌記錄各指揮部點數，選擇算子和目的牌進行移動。',enemy:'依任務表調整敵方算子與標記。',retreat:'依牌面狀態更新算子與位置。',vehicles:'依任務需要移動車輛算子，完成後推進階段。',combat:'點選有友軍與 PC 的牌進行接敵檢查。使用牌堆工具判讀戰鬥結果。',cleanup:'檢查標記與目標，完成本回合。',patrolresult:'查看巡邏記錄，結算本次結果。'};
 let h='<p class="hint">'+esc(mode==='move'?'請選擇所選算子的目的地。':info[s.phase])+'</p>';
 if(next)h+='<div class="selected-info">'+esc(positionHint(next))+'</div>';
 if(selectedUnit())h+='<div class="selected-info"><b>'+esc(selectedUnit().name)+'</b>　'+G.nameAt(selectedUnit())+' '+button('editUnit','管理','flat tiny',selected)+'</div>';
 if(s.turn>=2&&['events','enemy'].includes(s.phase)&&!s.outcome){
  const detail=s.events?.[s.turn+'-'+(s.phase==='events'?'friendly':'enemy')];
  h+=detail?'<div class="selected-info">'+esc(detail)+'</div>':button('hqEvent','檢查上級事件','secondary wide');
 }
 if(s.phase==='combat'){
  const pending=s.map.find(c=>c.pending),next=G.nextPC(s),eligible=G.pcCandidates(s);
  if(pending)h+=button('cell','完成 '+G.nameAt(pending)+' 的配置與活動程度','secondary wide',pending.x+','+pending.y);
  else if(next)h+=button('cell','判定 '+G.nameAt(next)+'・PC '+next.pc,'secondary wide',next.x+','+next.y);
  else if(eligible.length>1)h+=button('choosePC','抽牌決定同級 PC 順序','secondary wide');
 }
 if(!setup)h+='<div class="table-controls">'+button('tableDraw','行動牌工具')+button('ledger','命令與紀錄')+'</div>';
 h+='<div class="buttonrow">'+button(s.phase==='patrolresult'?'patrolFinish':'advance',setup?'完成設置':s.phase==='patrolresult'?'結算本次巡邏':s.phase==='cleanup'?'結束回合':'完成此階段','primary wide','',!!next)+'</div>';
 return h+campaignUI.setupPanel(s)+'<div class="row">'+button('undo','復原上一步','flat tiny','',!history.length)+'</div>';
}
function positionHint(k){const o=conf().objectives;if(k==='outpost')return '在第 2 列選擇前哨。';if(k.startsWith('way'))return '在第 '+o.waypointRows.join('、')+' 列選擇尚未使用的路線點。';const r=o[k+'Row'];return '在第 '+r+' 列放置'+objectiveName(k)+(k==='position'?'，須鄰接指定目標。':'。');}
function renderSide(){
 if(course()){$('side').innerHTML=lessons.side(s.tableRun?drawProgress():'');return;}
 if(s.tableRun||s.drawOrder){
  const order=s.tableRun?.order||s.drawOrder;
  const progress=s.tableRun?drawProgress():'請點指揮顯示表上方的行動牌背。';
  $('side').innerHTML='<section class="draw-guidance"><h3>'+esc(piles.label(s,order))+'</h3><p>'+esc(progress)+'</p>'+
   (s.tableRun?button('last','檢視已翻的牌','tiny'):button('cancelDraw','取消待抽操作','tiny'))+'</section>';
  return;
 }
 const stages=quick()?['ready','command','initiative','review']:isTable()?['setup','events',...(conf().mode==='defense'?['enemy','orders']:['orders','enemy']),'retreat','vehicles','combat','cleanup']:['ready','command','initiative'];
 let main='<div class="turn-line"><b class="round-num">'+pad(s.turn)+'</b><div><span class="turn-label">回合'+(isTable()?' / '+campaigns.turnLimit(s):'')+'</span><span class="phase-label">'+esc(s.outcome?'已結算':G.phaseNames[s.phase]||'巡邏結算')+'</span></div></div><div class="phase-track">'+stages.map((p,i)=>'<i class="'+(p===s.phase?'on':i<stages.indexOf(s.phase)?'past':'')+'"></i>').join('')+'</div>';
 if(s.outcome)main+='<h3>'+(isTable()&&conf().mode==='patrol'?'三次巡邏已結算':s.outcome==='win'?'任務完成':'任務結束')+'</h3><p class="hint">'+esc(s.log.at(-1)?.text)+'</p>'+button('result','查看結算','primary wide')+' '+button('undo','復原上一步','flat tiny','',!history.length);
 else main+=quick()?quickPanel():isTable()?tablePanel():trainingPanel();
 $('side').innerHTML='<section class="cardbox"><div class="sidehead"><div class="tabbar">'+button('tab','行動面板',sideTab==='play'?'on':'','play')+button('tab','任務日誌',sideTab==='log'?'on':'','log')+'</div><span class="turnpill">R'+pad(s.turn)+'</span></div><div class="sidebody">'+(sideTab==='log'?logView():main)+'</div>'+lastRow()+'</section>'+goalBox();
}
function render(){renderHero();commandDisplay.render();renderBoard();renderPiles();renderSide();renderRoster();queueMicrotask(showPending);}
function missionMenu(){let body='<h3>野戰手冊 1</h3>'+button('courses','基礎訓練・六次逐步演練','primary wide','1')+'<h3>野戰手冊 2</h3>'+button('courses','進階作戰・七堂逐步教學','primary wide','2')+'<h3>自由演練</h3>'+missionChoice('T1','01','啟動與移動','固定地圖・七枚算子・自動判定')+'<h3>單人快戰</h3>'+missionChoice('Q1','Q1','特雷維耶爾快戰','六個班・十回合・接敵與戰鬥自動結算');dialog('missions','任務選單',body);}
function missionChoice(id,code,n,sub){return '<button class="choice" data-action="missionInfo" data-value="'+id+'"><span class="code">'+code+'</span><span><strong>'+esc(n)+'</strong><small>'+esc(sub)+(slots[id]?' ・ 已有進度':'')+'</small></span></button>';}
function entryBrief(id,enter,back,context=''){
 const m=G.scenario(id);
 const heading=campaigns.labels[m.book]+'戰役・'+id+' '+m.title;
 const controls='<div class="buttonrow">'+button('enterMission','進入棋桌','primary')+button('entryBack','上一步')+'</div>';
 dialog('missionEntry','任務簡報', '<h3 class="entry-title">'+esc(heading)+'</h3>'+
  (context?'<p class="hint">'+esc(context)+'</p>':'')+campaignUI.missionBriefing(m)+controls,{enter,back});
}
function dismissPanel(){
 if(modal==='missionEntry')modalData.back();
 else close();
}
function missionInfo(id,atTable=false,formation){
 const m=G.scenario(id);let body=m?campaignUI.missionBriefing(m):'<p>全體七枚算子從 B0 出發。全部抵達第 3 列即完成演練，沒有回合上限。</p><ol><li>抽取命令牌，依大數字取得排部命令。</li><li>點選編組中的單位，再點選相鄰地形。單位移動耗 1 點，同牌全排移動耗 2 點。</li><li>結束排部命令後，讀取下一張牌的小數字，折半捨去，作為一般主動點。</li></ol><p class="tagline">《野戰手冊 1》頁 7–14。手冊牌序重現前五回合，另可選擇隨機開局。</p>';
 if(id==='Q1')body=quickIntro();
 else if(m){
  body+=button('camRef','查看任務書設置圖','secondary',m.id+'|'+m.mapPage);
  if(atTable){
   body+='<div class="buttonrow">'+button('close','返回棋桌','primary')+button('camHistory','閱讀戰役背景','',m.book)+'</div>';
   dialog('missionInfo',title(id),body,id);return;
  }
  if(slots[id])body+='<p class="hint">已存進度・第 '+slots[id].turn+' 回合</p>';
  body+=campaignUI.form(m.book,formation);
 }
 if(slots[id])body+='<div class="buttonrow">'+button('resume',m&&id!=='Q1'?'進入棋桌':id===s.id&&!s.series?'返回棋桌':'繼續已存進度','primary',id)+button('restart','重新設置','',id)+'</div>';
 else body+='<div class="buttonrow">'+button('start',id==='Q1'?'開始快戰':m?'進入棋桌':'使用示範牌序','primary',id)+(m?'':button('start','隨機開局','','random'))+'</div>';
 body+='<div class="buttonrow">'+(m&&id!=='Q1'?button('camMissions','返回'+campaigns.labels[m.book]+'戰役','flat tiny',m.book):button('missions','任務選單','flat tiny'))+'</div>';
 dialog('missionInfo',m&&id!=='Q1'?'任務簡報・'+m.id+' '+title(id):title(id),body,id);
}
function quickIntro(){return '<p>以諾曼第第一項任務的 4 × 3 地圖、十回合時限與原版行動牌，進行可獨立完成的快戰改編。</p><h3>目標</h3><p>十回合結束時，肅清第 1、2 列，並讓友軍留在已肅清的 A3 和 D3。</p><h3>本模式的改編規則</h3><ul><li>六枚班算子各有三階。全連共用鋼盔命令點，每回合最多 6 點，下回合最多保留 3 點；另抽一張讀星形主動點。</li><li>移動一格、嘗試尋找掩蔽或重整各花 1 點。每個班每回合至多移動一次。掩蔽成功給予 +2，移動後失去。</li><li>雙方戰鬥時自動檢查有友軍的 PC，接敵以同格的一階敵方算子表示。每枚未壓制友軍提供 −1 敵方檢定修正，最多 −3。友軍檢定採地形值、掩蔽與暴露（−2）。</li><li>HIT 減一階並壓制，PIN 壓制，MISS 無效果。無敵軍同牌時於整理階段恢復。全體退場或回合用盡時結算。</li></ul><p class="tagline">正式任務的編制、命令鏈、事件、射界與特殊兵種另收在「諾曼第戰役」輔助棋桌。</p>';}
function quickPanel(){
 const u=selectedUnit(),labels={ready:'抽取連隊命令',command:'結束命令，抽主動點',initiative:'結算接敵與戰鬥',review:'開始下一回合'};
 const help={ready:'抽行動牌取得全連共用命令。',command:'選擇友軍，再點虛線目的牌；也可花 1 點尋找掩蔽或重整。',initiative:'星形數字提供主動點。用完後即可結算本回合。',review:'已完成接敵、戰鬥與整理。'};
 let h='<div class="command-strip"><span>可用命令 <b>'+s.points+'</b></span><small>保留 '+s.saved+'</small></div><p class="hint">'+help[s.phase]+'</p>';
 if(s.phase==='review')h+='<p class="mini-check">'+((s.roundReport||[]).slice(-5).map(esc).join('<br>')||'本回合沒有新的接敵或狀態變化。')+'</p>';
 if(u)h+='<div class="selected-info"><b>'+esc(u.name)+'</b>　'+u.steps+' 階　'+(u.pinned?'壓制 ':'')+(u.covered?'掩蔽 ':'')+G.nameAt(u)+'</div><div class="actionpair">'+button('qact','尋找掩蔽','tiny','cover',!Q.canAct(s,u,'cover'))+button('qact','重整','tiny','rally',!Q.canAct(s,u,'rally'))+'</div>';
 return h+'<div class="buttonrow">'+button('advance',labels[s.phase],'primary wide')+'</div><div class="row">'+button('brief','快戰規則','flat tiny')+button('undo','復原上一步','flat tiny','',!history.length)+'</div>';
}
function guide(){dialog('guide','遊戲說明',button('courses','開啟手冊逐步教學','primary wide')+'<h3>第一次遊玩</h3><ol><li>點指揮顯示表上方的行動牌背，抽取啟動命令牌。</li><li>從「第 1 排編組」選擇單位，點選地圖上有金色虛線的目的牌。從集結區出發也可以斜走。</li><li>排部只能命令同牌單位。沒有合適對象時，結束排部命令，把點數留給下一回合。</li><li>使用一般主動點移動分散的單位，再結束回合。</li></ol><h3>牌堆與存檔</h3><p>抽到重洗牌時會先抽滿本次所需張數，再洗混整副牌。每點一次牌背翻一張，放在右側棄牌堆。停留在棄牌上可看完整牌面。可在「最近抽牌」翻閱最近一次操作。每次行動都會存到這個瀏覽器，也可匯出檔案帶往其他裝置。</p><h3>戰役棋桌</h3><p>從棋桌上方選擇戰役名稱，閱讀歷史背景後，可開始連續戰役或選擇該戰役的獨立任務。選地形可檢視整張牌、放置算子或檢查 PC。選算子可移動、登記狀態與兵力。在「行動牌工具」依指定修正值讀牌；「命令與紀錄」可記錄各部命令、彈藥與特殊效果。</p><p class="tagline">依《Fields of Fire Deluxe》第三版規則 §2–6、§8、§12、兩冊《野戰手冊》與四本戰役任務書改編。使用者提供之牌面與算子圖樣，原作 GMT Games。</p>');}
function cellDialog(c){
 const us=G.unitsAt(s,c),t=c.faceDown?null:G.terrain(c.t),over=s.outcome,pc=c.pc||c.pending;
 let b='<div class="tagline">'+esc(G.nameAt(c))+'　'+(c.faceDown?'':c.level?'高度 '+c.level+'　':c.h?'高度 +'+c.h+'　':'')+(c.faceDown?'未揭開地形':t?(t.cover==null?'掩蔽值見牌面':'掩蔽 +'+t.cover):'集結區')+'</div>';
 if(c.faceDown)b+=button('camReveal','依視線翻開地形牌','primary',G.nameAt(c));
 if(t)b+=button('inspectStack',c.h?'查看地形與下方丘陵':'查看完整地形牌','tiny',c.x+','+c.y);
 if(c.marks.length)b+='<p class="hint">'+c.marks.map(esc).join('、')+'</p>';
 if(us.length)b+='<h3>本牌算子</h3><div class="rostergrid">'+us.map(rosterButton).join('')+'</div>';
 if(isTable()&&!quick()&&!over){
  const ref=G.needed(s).find(k=>!s.objectives[k]);
  if(s.phase==='setup'&&ref)b+='<p class="hint">'+esc(positionHint(ref))+'</p>'+button('putObj','放置'+objectiveName(ref),'primary',ref);
  if(s.phase==='setup'&&G.needed(s).length)b+='<div class="formgroup"><label>調整任務標記</label><select id="objKey">'+G.needed(s).map(k=>'<option value="'+k+'">'+esc(objectiveName(k))+'</option>').join('')+'</select>'+button('putChosen','放置於此牌','tiny')+'</div>';
  if(c.pc){
   b+='<p>潛在接敵　<b>'+(c.hidden?'?':c.pc)+'</b></p>';
   if(G.pcCandidates(s).length>1&&!G.nextPC(s))b+=button('choosePC','抽牌決定同級 PC 順序','primary');
   else b+=button('checkPC','判定接敵','primary','',G.nextPC(s)!==c);
  }
  if(c.pending)b+='<p><b>'+esc(c.contactDetail||'接敵已觸發')+'</b>。依任務表配置算子及標記後，更新活動程度，再判定下一枚 PC。</p><label class="formgroup">配置後的活動程度<select id="contactActivity">'+actLabels.map((v,i)=>'<option value="'+i+'" '+(i===s.activity?'selected':'')+'>'+esc(v)+'</option>').join('')+'</select></label><div class="buttonrow">'+button('finishContact','完成配置','primary')+button('rerollContact','本組合無法配置・重抽')+button('emptyContact','全部組合皆無法配置')+'</div>';
  b+='<div class="buttonrow">'+button('library','放置算子')+button('editCell','編輯圖上標記')+'</div>';
 }
 dialog('cell',c.y?(t?.name||'地形'):'集結區',b,c);
}
function unitDialog(id){
 const u=s.units.find(q=>q.id===id);if(!u)return;
 const art=catalog.get(u.art);
 let b='<div class="unitrow" data-piece-name="'+esc(u.name)+'" data-piece-info="'+G.nameAt(u)+'" tabindex="0">'+(art?pic(art.art,'piece-icon','算子'):'')+'　<b>'+esc(shortAbbr(u))+'</b>　'+G.nameAt(u)+'</div>';
 if(u.experience)b+='<p>'+esc(campaigns.gradeNames[u.experience])+(u.ammo!=null?'　彈藥 '+u.ammo:'')+(u.skills?.length?'　技能 '+u.skills.map(esc).join('、'):'')+'</p>';
 if(isTable()&&!quick()&&!s.outcome){
  if(u.skills?.length)b+=u.skills.map((skill,i)=>button('useUnitSkill','使用「'+skill+'」','tiny',String(i))).join('');
  b+='<div class="buttonrow">'+button('moveMode','選擇移動目的地','primary',id)+'</div><div class="formgroup"><label for="steps">兵力階</label><input type="number" id="steps" min="0" max="16" value="'+Number(u.steps)+'"><label><input id="exposed" type="checkbox" '+(u.exposed?'checked':'')+'> 暴露</label><label><input id="pinned" type="checkbox" '+(u.pinned?'checked':'')+'> 受壓制</label><label><input id="casualty" type="checkbox" '+(u.casualty?'checked':'')+'> 傷亡算子（不計佔領）</label><label for="unitNote">算子紀錄</label><textarea id="unitNote" maxlength="2000">'+esc(u.notes)+'</textarea></div><div class="buttonrow">'+button('unitApply','套用變更','primary',id)+button('removeAsk','移出棋桌','',id)+'</div>';
 }
 dialog('unit',u.name,b,id);
}
function library(cat='friendly',q=''){
 const pool=[...catalog.values()].filter(t=>(!t.army||({K:['NKPA','KATUSA'],H:['NKPA','CCF'],V:['VC','NVA']}[conf()?.book]||[]).includes(t.army))&&t.category===cat&&(t.name+' '+t.id).toLowerCase().includes(q.toLowerCase()));
 const list=pool.map(t=>'<button data-action="placePiece" data-value="'+esc(t.id)+'" data-piece-name="'+esc(t.name)+'">'+pic(t.art,'','')+'<span>'+esc(t.name.split(' · ')[0])+'</span></button>').join('');
 if(modal==='library'&&document.getElementById('pieceList')){$('pieceList').innerHTML=list;return;}
 dialog('library','放置算子・'+G.nameAt(focus),'<div class="formgroup"><select id="pieceCat"><option value="friendly">友軍</option><option value="enemy">敵軍</option><option value="marker">遊戲標記</option></select><input id="pieceQuery" type="search" placeholder="搜尋名稱或代號" aria-label="搜尋算子"></div><div id="pieceList" class="gallery">'+list+'</div><p class="tagline">找不到所需算子時，可以名稱建立自訂棋子。</p><div class="buttonrow"><input id="customName" class="control" maxlength="40" placeholder="自訂名稱" aria-label="自訂名稱">'+button('customPiece','放置')+'</div>');
}
function tableDraw(){dialog('draw','行動牌工具','<p>依任務書抽取指定張數。每張牌的原圖都可放大查看。</p><div class="formgroup"><label for="drawN">抽牌張數</label><input id="drawN" type="number" value="1" min="1" max="12"></div>'+button('drawBatch','指定張數，前往牌組','primary')+'<hr class="divider"><h3>戰鬥效果檢定</h3><p class="tagline">輸入依棋桌狀態計出的淨戰鬥修正。命中時再抽一張讀取經驗欄，並將結果套用到該算子。</p><div class="formgroup"><label for="ncm">淨戰鬥修正（NCM）</label><select id="ncm">'+Array.from({length:11},(_,i)=>'<option '+(i===4?'selected':'')+' value="'+(i-4)+'">'+(i-4)+'</option>').join('')+'</select><label for="exp">經驗</label><select id="exp"><option value="line">一般</option><option value="green">新兵</option><option value="veteran">老兵</option></select></div>'+button('combatDraw','準備效果檢定','primary')+'<hr class="divider">'+button('deck','檢視行動牌組','tiny'));}
function ledger(){
 const known=s.units.filter(u=>u.side==='friendly'&&(/HQ|排部|指揮部|副官|士官長/.test(u.name+' '+u.abbr))), names=[...new Set([...known.map(u=>u.id),...Object.keys(s.tracks)])];
 let b='<label class="formgroup">目前活動等級<select id="activity">'+actLabels.map((x,i)=>'<option value="'+i+'" '+(s.activity===i?'selected':'')+'>'+x+'</option>').join('')+'</select></label>'+button('openLedgerSheet','儲存紀錄並前往左側指揮表','secondary wide')+'<h3>命令軌</h3>'+names.map(id=>'<div class="detailrow"><label>'+esc(s.units.find(u=>u.id===id)?.name||id)+'</label><span>'+button('track','−','tiny',id+'|-1')+' <b class="mono">'+Number(s.tracks[id]||0)+'</b> '+button('track','＋','tiny',id+'|1')+'</span></div>').join('')+'<div class="formgroup"><label for="notes">任務紀錄與資源</label><textarea id="notes" maxlength="10000">'+esc(s.notes)+'</textarea></div>'+button('saveLedger','儲存紀錄','primary');
 dialog('ledger','命令與紀錄',b);
}
function recordPatrol(u,from,to){
 if(conf()?.mode!=='patrol'||s.phase==='setup'||u.side!=='friendly'||u.casualty)return;
 if(G.same(s.objectives.primary,to)&&!s.visits.primary){s.visits.primary=true;G.note(s,'巡邏單位走訪主要目標。');}
 if(s.visits.way<4&&G.same(s.objectives['way'+(s.visits.way+1)],to)){s.visits.way++;G.note(s,'依序走訪路線點 '+s.visits.way+'。');}
 if(from.y===(conf().objectives.returnFromRow||2)&&to.y===(conf().objectives.returnToRow||1)&&s.visits.primary&&s.visits.way===4)s.visits.returned=true;
}
function goalLines(){return G.goals(s).map(g=>'<p class="mini-check">'+(g.done?'✓':'□')+'　'+esc(g.name)+'</p>').join('');}
function scoreTable(){
 return series.score(s);
}
function result(){
 const m=conf();let b='<p>完成回合　<b>'+s.turn+'</b>　｜　累計抽牌　<b>'+s.drawCount+'</b></p>';
 if(!m)b+='<p>七枚算子全數到達第 3 列。</p>';
 else if(m.mode==='patrol')b+='<h3>巡邏記錄</h3>'+s.patrolHistory.map((r,i)=>'<p>第 '+(i+1)+' 次　'+(r.ok?'成功':'未完成')+'　'+r.xp+' XP</p>').join('');
 else {const vals={...s.xpCards};for(const [k,v] of Object.entries(scoreTable()))vals[k]=Math.max(vals[k]||0,v);b+=goalLines()+'<p>地圖目標經驗　'+Object.values(vals).reduce((a,v)=>a+v,0)+' XP</p><p class="tagline">其他經驗與整補依任務紀錄結算。</p>';
  if(!quick()&&s.outcome==='loss'&&s.attempt<=m.retries)b+=button('retry','保留棋桌重試','primary');}
 if(s.series)b+=button(s.series.finished?'camStatus':'camSettle',s.series.finished?'查看戰役紀錄':s.settlement?'繼續整補':'戰役結算與整補','primary');
 b+='<div class="buttonrow">'+(m&&!quick()?button('camMissions','返回'+campaigns.labels[m.book]+'戰役','',m.book):button('missions','任務選單'))+button('close','查看棋桌')+'</div>';dialog('result',m?.mode==='patrol'?'巡邏結算':s.outcome==='win'?'任務完成':'任務結束',b);
}
function saveMenu(){dialog('saves','存檔管理','<p>'+esc(storageOK?'每次行動都會自動存檔。切換任務時，各自保留進度。':'瀏覽器目前無法寫入存檔。請使用匯出檔案保存進度。')+'</p><p class="tagline">目前任務　'+esc(title(s.id))+'　／　第 '+s.turn+' 回合</p><div class="buttonrow">'+button('export','匯出全部進度','primary')+button('import','匯入存檔')+'</div>');}
function start(id,guided=true,form=$('campaignForm')?.value){
 s=id==='T1'?G.training(guided):id==='Q1'?Q.start():campaigns.create(id,{form});resetView();
}
function editCell(c){dialog('editcell','地圖標記・'+G.nameAt(c),'<div class="formgroup"><label for="marks">本牌標記（每行一項）</label><textarea id="marks" maxlength="800">'+esc(c.marks.join('\n'))+'</textarea><label for="pcType">潛在接敵</label><select id="pcType">'+['','A','B','C'].map(v=>'<option value="'+v+'" '+(v===(c.pc||'')?'selected':'')+'>'+esc(v||'無')+'</option>').join('')+'</select><label><input id="pcHidden" type="checkbox" '+(c.hidden?'checked':'')+'> 標記背面朝上</label></div>'+button('saveCell','套用地圖標記','primary'));}
function addPiece(type,name,art){
 const isMark=type==='marker',data=catalog.get(art);
 if(art?.startsWith('pc-')){const c=G.at(s,focus);if(art==='pc-hidden'){if(!c.pc){tell('請以「編輯圖上標記」選擇等級。');return false;}c.hidden=true;}else{G.setPC(s,c,art.slice(3).toUpperCase(),false,true);G.note(s,G.nameAt(c)+' 放置標記後為 PC '+c.pc+'。');}return true;}
 const id='u'+(++s.serial);const [cn,ab]=name.split(' · ');
 const u=G.piece(id,cn,ab||cn,1,focus.x,focus.y,type,art||'');if(['casualty','de-casualty'].includes(art))u.casualty=true;
 s.units.push(u);G.note(s,'在 '+G.nameAt(focus)+' 放置'+(isMark?'標記':'算子')+'「'+cn+'」。');return true;
}
function patrolFinish(){
 campaigns.restore(s);
 edit(()=>{const next=series.nextPatrol(s);if(!next)return false;s=next;});selected=null;focus=null;mode='';close();render();if(s.outcome)result();
}
function campaignRetry(){
 edit(()=>{for(const [k,v] of Object.entries(scoreTable()))s.xpCards[k]=Math.max(s.xpCards[k]||0,v);s.attempt++;s.outcome='';s.turn=1;s.phase='setup';s.vis=campaigns.light(s);s.tracks={};s.commandAreas={};s.activity=0;s.events={};s.counterUntil=0;
  for(const u of s.units){u.exposed=false;u.pinned=false;u.moved='';}
  G.note(s,'重試 '+(s.attempt-1)+'：地形、敵軍、尚存 PC 與已計分牌保留。請依規則 §3.9 重新編組及配置。');});
 close();
}
function applyPatrolMove(u,from,p){recordPatrol(u,from,p);u.x=p.x;u.y=p.y;if(u.side==='friendly'&&s.phase!=='setup'){const cell=G.at(s,p);if(cell)cell.faceDown=false;}if(s.phase!=='setup'&&u.side!=='marker'&&(from.y||p.y))u.exposed=true;G.note(s,u.name+' 移至 '+G.nameAt(p)+'。');}
function modalCellClick(v){
 const p=readPos(v),c=G.at(s,p);
 if(!c)return;
 if(quick()&&selected&&Q.canMove(s,selectedUnit(),c)){
  edit(()=>Q.move(s,selectedUnit(),c));focus=c;selected=null;render();tell('單位已移至 '+G.nameAt(c));return;
 }
 if(!isTable()&&selected&&!s.outcome&&G.allowedMove(s,selected,c,group)){
  edit(()=>G.moveTraining(s,selected,c,group));focus=c;selected=null;group=false;render();
  if(s.outcome)result();else tell('單位已移至 '+G.nameAt(c));return;
 }
 if(isTable()&&mode==='move'&&selectedUnit()&&!s.outcome){
  const u=selectedUnit();if(G.same(u,c)){tell('請選擇另一張地形牌。');return;}
  if(!campaigns.canMove(s,u,c)){tell('此任務的地圖移動限制不允許這個目的地。');return;}
  edit(()=>applyPatrolMove(u,{x:u.x,y:u.y},p));focus=c;mode='';selected=null;render();tell('已移至 '+G.nameAt(c));return;
 }
 focus=c;render();cellDialog(c);
}
function pickUnit(id){const u=s.units.find(x=>x.id===id);if(!u)return;close();selected=id;group=false;focus=G.at(s,u);sideTab='play';mode='';render();
 if(quick()){tell(u.casualty?'算子已退場':u.side!=='friendly'?'敵方算子由系統結算':'已選擇 '+u.name);if(u.side==='friendly'&&Q.able(s,u))scrollBoard();return;}
 if(isTable()){unitDialog(id);return;}
 const msg=G.trainingStatus(s,u);if(!msg)scrollBoard();tell(msg||'已選擇 '+u.name+'，點金色虛線格移動。');}
function scrollBoard(){if(focus&&fixedWidth!==null)revealCell(focus);}
function step(){
 if(s.outcome)return;
 if(s.phase==='setup'&&!s.deploymentConfirmed&&(conf()?.airlift||conf()?.detachedSquads)){campaignUI.handle('camDeploy','');return;}
 const next=piles.defaultOrder(s);
 if(next&&['advance','moonlight','event','weather'].includes(next.type)){armDraw(next);return;}
 if(isTable()&&!quick()&&s.phase==='combat'&&s.map.some(c=>c.pending||c.pc&&G.unitsAt(s,c).some(u=>u.side==='friendly'&&!u.casualty))){tell('請先完成地圖上待處理的接敵檢查與配置。');return;}
 const old=s.phase,previousTurn=s.turn;
 edit(()=>{
  const ok=quick()?Q.advance(s):isTable()?G.advanceTable(s):G.advanceTraining(s);
  if(ok&&isTable()&&!quick()&&s.turn!==previousTurn)window.FOF_COMMAND_DISPLAY.newRound(s);
  return ok;
 });
 afterAdvance(old);render();if(s.outcome)result();else if(selected)scrollBoard();
}
function afterAdvance(old){
 selected=null;group=false;mode='';close();
 if(!isTable()&&s.phase==='command'&&old==='ready'){
  const u=s.units.find(q=>q.id==='s1'&&!G.trainingStatus(s,q))||s.units.find(q=>!G.trainingStatus(s,q));selected=u?.id||null;focus=u?G.at(s,u):null;
 }else if(!isTable()&&s.phase==='initiative'){
  const u=s.units.find(q=>q.y<s.rows&&!G.trainingStatus(s,q));selected=u?.id||null;focus=u?G.at(s,u):null;
 }
 if(quick()&&['command','initiative'].includes(s.phase)){selected=s.units.find(u=>Q.able(s,u)&&!u.pinned&&!u.exposed)?.id||null;focus=selected?G.at(s,selectedUnit()):null;}
}
const historyViewer=$('historyViewer'),historyImage=$('historyFullImage');
function fitIllustration(fullSize){
 historyViewer.classList.toggle('full-size',fullSize);
 $('historyZoom').setAttribute('aria-pressed',String(fullSize));
 $('historyZoom').textContent=fullSize?'適合視窗':'原尺寸';
 historyViewer.querySelector('.history-canvas').scrollTo(0,0);
}
$modal.addEventListener('click',ev=>{
 const opener=ev.target.closest('[data-history-figure]');
 if(!opener)return;
 const figure=window.FOF_HISTORY_FIGURES[opener.dataset.historyFigure];
 historyImage.src=figure.src;historyImage.alt=figure.caption;
 $('historyFigureSource').textContent=campaigns.labels[opener.dataset.historyFigure[0]]+'戰役任務書・第 '+figure.page+' 頁・'+figure.kind;
 $('historyFigureCaption').textContent=figure.caption;
 fitIllustration(false);historyViewer.showModal();$('historyDone').focus({preventScroll:true});
});
$('historyZoom').addEventListener('click',()=>fitIllustration(!historyViewer.classList.contains('full-size')));
$('historyDone').addEventListener('click',()=>historyViewer.close());
historyViewer.addEventListener('click',ev=>{
 if(ev.target!==historyViewer)return;
 const bounds=historyViewer.getBoundingClientRect();
 if(ev.clientX<bounds.left||ev.clientX>bounds.right||ev.clientY<bounds.top||ev.clientY>bounds.bottom)historyViewer.close();
});
historyViewer.addEventListener('close',()=>{historyImage.removeAttribute('src');});
document.addEventListener('submit',ev=>{
 if(ev.target.id!=='lessonAmount')return;
 ev.preventDefault();
 if(course()&&C.current(s)?.kind==='amount')lessons.handle('lessonAmount',new FormData(ev.target).get('amount'));
});
document.addEventListener('click',ev=>{
 const el=ev.target.closest('[data-action]');if(!el||el.disabled)return;
 const a=el.dataset.action,v=el.dataset.value||'';
 if(el.matches('.campaign-nav a')){
  if(ev.metaKey||ev.ctrlKey||ev.shiftKey||ev.altKey||ev.button!==0)return;
  ev.preventDefault();
 }
 if(modal==='missionEntry'){
  if(a==='enterMission')modalData.enter();
  else if(a==='entryBack'||a==='close')dismissPanel();
  return;
 }
 if(a==='flipAction'){flipAction();return;}
 if(a==='focusDraw'){focusDraw();return;}
 if(a==='cancelDraw'){delete s.drawOrder;persist();render();return;}
 if(a==='inspectDiscard'){const id=visiblePiles().top;if(id)draws.show([{why:'棄牌堆頂',ids:[id]}],'棄牌堆','');return;}
 if((s.tableRun||s.drawOrder)&&!['zoomIn','zoomOut','fitBoard','last','saves','export','import','acceptImport','close','missions','missionInfo','courses','courseInfo','courseStart','courseRestart','courseResume','resume','start','restart','guide','lessonTurnGuide','lessonCardKey','lessonFigure','deck','camBook','camMissions','camNew','camLaunch','camResume','camRef','camStatus','brief','camHistory'].includes(a)){tell('請先完成桌上的抽牌。');return;}
 if(campaignUI.handle(a,v))return;
 if(commandDisplay.handle(a,v))return;
 if(a==='boardPiece'||a==='boardPile'){
  const key=el.closest('.card-location')?.dataset.coord;
  if(key){
   const c=G.at(s,readPos(key));
   if(course()?lessons.awaitingCell():mode==='move'||destination(c)){
    if(course())lessons.handle('cell',key);else modalCellClick(key);
    return;
   }
   if(a==='boardPile'){
    focus=c;
    dialog('pile',G.nameAt(c)+'・'+(c.faceDown?'未揭開地形':G.terrain(c.t)?.name||'集結區'),tabletop.pile(s,c,course()?lessons.chosen():selected)+
     button('pileCell','查看本牌','secondary',key));
    return;
   }
  }
  if(a==='boardPiece'){
   close();
   if(course())lessons.handle('lessonPick',v);else pickUnit(v);
  }
  return;
 }
 if(a==='pileCell'){
  close();if(course())lessons.handle('cell',v);else modalCellClick(v);return;
 }
 if(lessons.handle(a,v))return;
 switch(a){
 case 'close':close();break;
 case 'zoomOut':boardZoom(-1);break;
 case 'zoomIn':boardZoom(1);break;
 case 'fitBoard':boardZoom(0);break;
 case 'inspectStack':{const c=G.at(s,readPos(v));if(c?.t)inspectStack(c);break;}
 case 'guide':guide();break;
 case 'saves':saveMenu();break;
 case 'missions':missionMenu();break;
 case 'brief':missionInfo(s.id,!!conf()&&!quick());break;
 case 'missionInfo':missionInfo(v);break;
 case 'resume':s=slots[v];resetView();break;
 case 'restart':
  if(G.scenario(v)&&v!=='Q1'){
   const formation=$('campaignForm')?.value;
   entryBrief(v,()=>start(v,true,formation),()=>missionInfo(v,false,formation),'進入棋桌後，將以新任務取代這個獨立任務的進度。');
   break;
  }
  dialog('restart','重新設置任務','<p>將取代「'+esc(title(v))+'」的現有進度。可以先到存檔管理匯出備份。</p><div class="buttonrow">'+button('start',v==='T1'?'使用示範牌序':'建立新棋桌','primary',v)+(v==='T1'?button('start','隨機開局','','random'):'')+button('close','取消')+'</div>');break;
 case 'start':start(v==='random'?'T1':v,v!=='random');break;
 case 'tab':sideTab=v;renderSide();break;
 case 'undo':if(history.length){s=JSON.parse(history.pop());selected=null;focus=null;group=false;mode='';close();persist();render();tell('已復原上一步');}break;
 case 'qact':if(Q.canAct(s,selectedUnit(),v))armDraw({type:v,unit:selected});break;
 case 'group':group=!group;render();break;
 case 'cell':modalCellClick(v);break;
 case 'unit':pickUnit(v);break;
 case 'advance':step();break;
 case 'result':result();break;
 case 'deck':dialog('deck','行動牌組','<p>50 張行動牌，另有 1 張重洗牌。目前牌堆剩 '+s.deck.length+' 張。</p>'+pic('assets/action-back.webp','cardface','行動牌背')+'<p class="tagline">鋼盔顯示啟動命令，星形顯示主動點。卡面同時列出結果、事件圖示與隨機數字。</p>');break;
 case 'last':draws.show(drawGroups(),'最近抽牌','');break;
 case 'backCell':cellDialog(G.at(s,focus));break;
 case 'putObj':case 'putChosen':{
  const k=a==='putChosen'?$('objKey').value:v;
  if(edit(()=>{if(!G.placeObjective(s,k,focus))return false;G.note(s,objectiveName(k)+' 位於 '+G.nameAt(focus)+'。');return true;})){close();tell('已放置'+objectiveName(k));}else tell(positionHint(k)+' 請確認位置符合條件。');
  break;}
 case 'library':library();break;
 case 'placePiece':{const t=catalog.get(v);if(!t)return;if(edit(()=>addPiece(t.category,t.name,t.id))){close();tell('已放置算子');}break;}
 case 'customPiece':{const nm=$('customName').value.trim();if(!nm)return tell('請輸入算子名稱');edit(()=>addPiece($('pieceCat').value,nm,''));close();break;}
 case 'editCell':editCell(G.at(s,focus));break;
 case 'saveCell':{const c=G.at(s,focus);edit(()=>{c.marks=$('marks').value.split('\n').map(x=>x.trim()).filter(Boolean).slice(0,35);if(c.pc!==($('pcType').value||null)||!!c.hidden!==$('pcHidden').checked)G.setPC(s,c,$('pcType').value||null,$('pcHidden').checked);G.note(s,'更新 '+G.nameAt(c)+' 的地圖標記。');});close();break;}
 case 'editUnit':unitDialog(v);break;
 case 'useUnitSkill':{const u=selectedUnit(),i=Number(v);if(u?.skills?.[i]){edit(()=>G.note(s,u.name+' 使用技能「'+u.skills.splice(i,1)[0]+'」。'));unitDialog(u.id);}break;}
 case 'unitApply':{const u=selectedUnit(),n=Number($('steps').value);if(!Number.isInteger(n)||n<0||n>16)return tell('兵力階須介於 0 至 16');edit(()=>{u.steps=n;u.notes=$('unitNote').value;u.exposed=$('exposed').checked;u.pinned=$('pinned').checked;u.casualty=$('casualty').checked;if(s.series&&u.art==='co-hq'&&(u.casualty||!u.steps))s.series.coLost=true;G.note(s,'更新「'+u.name+'」的算子狀態。');});close();break;}
 case 'moveMode':selected=v;mode='move';close();render();tell('點選目的地形牌');break;
 case 'removeAsk':dialog('remove','移出棋桌','<p>移出「'+esc(selectedUnit()?.name)+'」？此步驟可復原。</p>'+button('removeUnit','移出','primary',v)+' '+button('close','取消'));break;
 case 'removeUnit':edit(()=>{const u=s.units.find(q=>q.id===v);if(!u)return false;if(s.series&&u.art==='co-hq')s.series.coLost=true;G.note(s,'移出「'+u.name+'」。');s.units=s.units.filter(q=>q.id!==v);});selected=null;close();render();break;
 case 'hqEvent':armDraw({type:'event'});break;
 case 'choosePC':armDraw({type:'order'});break;
 case 'rerollContact':case 'checkPC':if(focus)armDraw({type:a==='checkPC'?'contact':'group',x:focus.x,y:focus.y});break;
 case 'emptyContact':case 'finishContact':edit(()=>{const c=G.at(s,focus);if(!c?.pending)return false;s.activity=Number($('contactActivity').value);c.pending=false;G.note(s,G.nameAt(c)+(a==='emptyContact'?' 無可用組合，未發生接敵。':' 已完成接敵配置。')+'活動程度為'+actLabels[s.activity]+'。');});close();break;
 case 'tableDraw':tableDraw();break;
 case 'drawBatch':{const n=Number($('drawN').value);if(!Number.isInteger(n)||n<1||n>12)return tell('請輸入 1 至 12');armDraw({type:'batch',n});break;}
 case 'combatDraw':armDraw({type:'combat',n:Number($('ncm').value),exp:$('exp').value});break;
 case 'ledger':ledger();break;
 case 'track':{const [id,delta]=v.split('|');const notes=$('notes').value,activity=Number($('activity').value);edit(()=>{s.notes=notes;s.activity=activity;window.FOF_COMMAND_DISPLAY.adjust(s,id,Number(delta));});ledger();break;}
 case 'openLedgerSheet':case 'saveLedger':edit(()=>{s.activity=Number($('activity').value);s.notes=$('notes').value;G.note(s,'更新命令與任務紀錄。');});close();if(a==='openLedgerSheet'){$('command-display').focus({preventScroll:true});$('command-display').scrollIntoView({block:'nearest',inline:'start'});}break;
 case 'patrolFinish':patrolFinish();break;
 case 'retry':entryBrief(s.id,campaignRetry,result,'第 '+(s.attempt+1)+' 次嘗試');break;
 case 'export':{const obj={version:1,active:campaigns.key(s),slots};const url=URL.createObjectURL(new Blob([JSON.stringify(obj)],{type:'application/json'}));const link=document.createElement('a');link.href=url;link.download='Fields-of-Fire-存檔.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);break;}
 case 'import':$('importFile').click();break;
 case 'acceptImport':{const imported=modalData;slots=Object.assign({},slots,imported.slots);s=slots[imported.active];resetView();tell('存檔已匯入');break;}
 }
});
document.addEventListener('input',e=>{if(e.target.id==='pieceQuery')library($('pieceCat').value,e.target.value);});
document.addEventListener('change',e=>{if(e.target.id==='pieceCat')library(e.target.value,$('pieceQuery').value);});
$('importFile').addEventListener('change',async e=>{
 const f=e.target.files[0];e.target.value='';if(!f)return;
 try{if(f.size>5e6)throw Error();const raw=JSON.parse(await f.text());
  if(raw.version!==1||!raw.slots||!raw.slots[raw.active]||Object.entries(raw.slots).length>6+window.FOF_SCENARIOS.length+C.ids.length||!Object.entries(raw.slots).every(([id,st])=>id===campaigns.key(st)&&G.validSave(st)))throw Error();
  for(const [id,entry] of Object.entries(raw.slots))raw.slots[id]=C.has(id)?C.restore(entry):campaigns.restore(entry);
  dialog('importConfirm','確認匯入','<p>匯入 '+Object.keys(raw.slots).length+' 個任務進度。相同任務會以檔案中的進度取代。</p>'+button('acceptImport','匯入','primary')+' '+button('close','取消'),raw);
 }catch{tell('無法讀取此存檔，原有進度仍保留。');}
});
$modal.addEventListener('click',e=>{if(e.target!==$modal)return;const r=$modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismissPanel();});
$modal.addEventListener('cancel',e=>{e.preventDefault();dismissPanel();});
new ResizeObserver(sizeBoard).observe($('mapViewport'));
render();persist();
const entry=new URL(location.href),manual=entry.searchParams.get('manual');
const campaign=entry.searchParams.get('campaign');
if(Object.hasOwn(campaigns.books,campaign)){
 campaignUI.handle('camBook',campaign);
}else if(entry.searchParams.get('campaigns')==='1'){
 dialog('campaignDirectory','戰役目錄',campaignUI.directory());
 entry.searchParams.delete('campaigns');
 window.history.replaceState(window.history.state,'',entry);
}else if(manual==='1'||manual==='2')lessons.menu(manual);
})();
