(() => {
'use strict';
window.FOF_LESSON_UI=function({state,slots,switchState,edit,render,dialog,close,tell,button,esc,box,tokenPic,logView,lastRow}){
 const C=window.FOF_COURSE,G=window.FOF;
 let picked='',hint=false,error='',tab='play';
 const lesson=()=>C.lessons[state().id];
 const step=()=>C.current(state());
 const unit=id=>state().units.find(u=>u.id===id);
 function reset(){picked='';error='';hint=false;tab='play';}
 const groupTitle=id=>id[0]==='P'?'排突擊課程':'連突擊課程';
 function menu(){
  let html='<p class="course-intro">從第一課開始，跟著《野戰手冊 1》實際抽牌、移動算子和結算標記。每一課都可單獨開始或接續。</p>';
  for(const group of ['P','C']){
   html+='<h3>'+groupTitle(group)+'</h3><div class="lesson-list">';
   for(const id of C.ids.filter(v=>v[0]===group)){
    const l=C.lessons[id],saved=slots()[id];
    const label=!saved?'開始':saved.outcome?'已完成':'繼續・'+saved.cursor+' / '+l.steps.length;
    html+='<button class="choice" data-action="courseInfo" data-value="'+id+'"><span class="code">'+id[1]+'</span><span><strong>'+esc(l.title)+'</strong><small>手冊第 '+l.pages+' 頁</small></span><b>'+label+'</b></button>';
   }
   html+='</div>';
  }
  dialog('courseMenu','基礎訓練',html);
 }
 function info(id){
  const l=C.lessons[id],saved=slots()[id];
  let body='<p class="lesson-source">'+groupTitle(id)+'・第 '+id[1]+' 次演練　／　手冊第 '+l.pages+' 頁</p><h3>演練目標</h3><p>'+esc(l.goal)+'</p>';
  if(l.brief)body+='<p>'+esc(l.brief)+'</p>';
  body+='<div class="buttonrow">';
  if(!saved)body+=button('courseStart','開始演練','primary',id);
  else{body+=button('courseResume',saved.outcome?'查看完成棋桌':'繼續上次進度','primary',id);body+=button('courseRestart','重新演練','',id);}
  dialog('courseInfo',l.title,body+'</div>'+button('courses','返回課程目錄','flat tiny'));
 }
 function hero(){
  const s=state();
  return '<div class="mission-name"><small>野戰手冊 1・'+groupTitle(s.id)+' '+s.id[1]+'</small><h1>'+esc(lesson().title)+'</h1></div><div class="hero-acts">'+button('courses','基礎訓練','heroquick')+button('missions','任務選單')+'</div>';
 }
 function turnGuide(){
  const phases=[
   ['友軍上級事件','正式任務從第 2 回合起檢查。基礎演練依各課設置省略事件。'],
   ['友軍指揮','先做啟動，再做主動。營部、連部、排部按層級啟動；未啟動的指揮部有自己的主動時段。最後才抽一般主動點。'],
   ['敵軍活動','依演練指定的欄與算子狀態讀牌。有多張同級候選牌時，照規則決定順序。'],
   ['雙方俘虜與撤退','檢查地圖上符合條件的算子。若本課沒有適用單位，進入下一階段。'],
   ['反戰車戰鬥與車輛移動','本手冊的基礎演練沒有車輛。'],
   ['雙方戰鬥','依序更新火力任務、判定潛在接敵（PC）、恢復壓制、結算戰鬥效果。清理前的戰鬥效果視為同時發生。'],
   ['清理','移除暴露，重設命令標記，推進回合。受壓制與來襲標記各有自己的移除時機。']
  ];
  const html='<p class="lesson-source">野戰手冊第 4–6 頁・第三版規則 §3</p><ol class="turn-reference">'+phases.map(([name,details])=>'<li><strong>'+name+'</strong><p>'+details+'</p></li>').join('')+'</ol>';
  dialog('turnGuide','進攻演練的回合流程',html+button('lessonCardKey','對照行動牌上的欄位','secondary')+' '+button('close','返回演練','primary'));
 }
 function target(c){
  const t=step(),coord=G.nameAt(c);
  return !!t&&(t.kind==='move'&&picked===t.unit&&coord===t.at||hint&&(coord===t.at||t.unit&&G.same(unit(t.unit),c)));
 }
 const numbered=i=>'<span class="lesson-counter">步驟 <b>'+i+'</b> / '+lesson().steps.length+'</span>';
 function pieceCue(u,selectable){
  const info=[G.nameAt(u),u.lessonStatus].filter(Boolean).join('・');
  const attrs=' data-piece-name="'+esc(u.name)+'" data-piece-info="'+esc(info)+'"';
  if(!selectable)return '<span class="cue-companion" tabindex="0"'+attrs+'>'+tokenPic(u)+'</span>';
  return '<button type="button" class="cue-counter'+(picked===u.id?' is-picked':'')+'" data-action="lessonPick" data-value="'+esc(u.id)+'" aria-label="選取'+esc(u.name)+'（'+G.nameAt(u)+'）"'+attrs+'>'+tokenPic(u)+'</button>';
 }
 function instruction(t,drawInstruction){
  let art,caption='',gesture;
  switch(t.kind){
  case 'unit':case 'move':{
   const u=unit(t.unit);
   art=pieceCue(u,true);
   if(t.kind==='move'){
    const companions=Object.keys(t.effects?.move||{}).filter(id=>id!==u.id).map(unit);
    if(companions.length)art+='<div class="cue-companions">'+companions.map(v=>pieceCue(v,false)).join('')+'</div>';
   }
   caption=G.nameAt(u);
   gesture=picked===u.id?'已選取，請點棋桌上的 '+t.at+'。':'點選左圖或棋桌上的算子。';
   break;
  }
  case 'cell':{
   const c=state().map.find(c=>G.nameAt(c)===t.at),terrain=G.terrain(c.t);
   art='<img class="cue-card" src="'+esc(terrain?.face||'assets/terrain-back.webp')+'" alt="'+esc(terrain?.name||'集結區')+'">';
   caption=t.at;
   gesture='點選棋桌上的'+(terrain?'地形牌。':'集結區。');
   break;
  }
  case 'draw':
   art='<img class="cue-card" src="assets/action-back.webp" alt="行動牌背面">';
   gesture=drawInstruction||'點桌上的行動牌組，每點一次翻一張。';
   break;
  case 'choice':
   art='<span class="cue-options" role="img" aria-label="選擇答案">'+t.options.map(()=>'<i></i>').join('')+'</span>';
   gesture='點選下方的判讀結果。';
   break;
  }
  return '<div class="lesson-instruction" data-kind="'+esc(t.kind)+'"><div class="lesson-art">'+art+
   (caption?'<span class="cue-coordinate">'+esc(caption)+'</span>':'')+'</div><div><h2 class="lesson-prompt">'+esc(t.text)+'</h2><p class="lesson-gesture">'+esc(gesture)+'</p></div></div>';
 }
 function play(drawInstruction){
  const s=state(),t=step(),l=lesson();
  if(!t){
   const next=C.ids[C.ids.indexOf(s.id)+1];
   return '<div class="lesson-finished"><small>演練完成</small><h2>'+esc(l.title)+'</h2><p>'+esc(s.log.at(-1)?.text||l.goal)+'</p></div>'+
    (next?button('courseInfo','進入下一課','primary wide',next):button('missions','開啟任務選單','primary wide'))+
    (s.id==='P1'?button(slots().T1?'resume':'start',slots().T1?'繼續已存的自由演練':'用隨機牌序練習移動','secondary wide',slots().T1?'T1':'random'):'')+button('courses','查看六課進度','flat tiny');
  }
  let body='<div class="lesson-position">'+numbered(s.cursor+1)+'<small>手冊第 '+esc(t.page)+' 頁</small></div>'+
   '<div class="progressline"><i style="width:'+100*s.cursor/l.steps.length+'%"></i></div><p class="lesson-phase">第 '+t.turn+' 回合　／　'+esc(t.phase)+'</p>'+
   instruction(t,drawInstruction);
  if(t.kind==='draw')body+=button('focusDraw','前往行動牌組','secondary wide');
  if(t.kind==='choice')body+='<div class="answer-list">'+t.options.map((v,i)=>button('lessonAnswer',v,'',i)).join('')+'</div>';
  if(error)body+='<p role="alert" class="lesson-error">'+esc(error)+'</p>';
  if(hint&&t.kind!=='choice'&&t.kind!=='draw')body+='<p class="lesson-tip">'+(t.unit?'算子位於 '+G.nameAt(unit(t.unit))+'。':'')+(t.at?'請找 '+esc(t.at)+'。':'')+'</p>';
  body+='<div class="lesson-tools">'+button('lessonBack','上一步','flat tiny','',!s.cursor||!!drawInstruction)+(t.kind==='move'||t.kind==='cell'||t.kind==='unit'?button('lessonHint',hint?'收起提示':'指出位置','flat tiny'):'')+'</div>';
  const previous=l.steps[s.cursor-1];
  if(previous?.detail)body+='<div class="lesson-feedback"><small>上一步的結果</small><p>'+esc(previous.detail)+'</p></div>';
  return body;
 }
 function side(drawInstruction=''){
  const s=state(),l=lesson();
  const ledger=Object.entries(s.tracks);
  const showPlay=tab==='play'||!!drawInstruction;
  return '<section class="cardbox"><div class="sidehead"><div class="tabbar">'+button('lessonTab','教學步驟',showPlay?'on':'','play',!!drawInstruction)+button('lessonTab','演練紀錄',showPlay?'':'on','log',!!drawInstruction)+'</div>'+button('lessonTurnGuide','流程表','tiny')+'</div><div class="sidebody">'+(showPlay?play(drawInstruction):logView())+'</div>'+lastRow()+'</section>'+
   (ledger.length?box('演練紀錄值','<dl class="lesson-tracks">'+ledger.map(([label,v])=>'<div><dt>'+esc(label)+'</dt><dd>'+esc(v)+'</dd></div>').join('')+'</dl>'):'')+box('演練目標','<p class="hint">'+esc(l.goal)+'</p>');
 }
 function roster(){
  const s=state();
  return '<section class="cardbox rosterbox"><div class="rosterhead"><h2>棋桌算子</h2><span class="turnpill">'+s.units.length+' 枚</span></div><div class="rostergrid">'+s.units.map(u=>
   '<button class="ubtn '+(picked===u.id?'selected':'')+'" data-action="lessonPick" data-value="'+esc(u.id)+'" data-piece-name="'+esc(u.name)+'" data-piece-info="'+esc([G.nameAt(u),u.lessonStatus].filter(Boolean).join('・'))+'">'+tokenPic(u)+'<span><b>'+esc(u.name)+'</b><small>'+G.nameAt(u)+(u.lessonStatus?'・'+esc(u.lessonStatus):'')+'</small></span></button>').join('')+'</div></section>';
 }
 function fail(message){error=message;render();}
 function success(){close();reset();edit(()=>C.complete(state()));}
 function pick(id){
  const t=step();if(!t||!unit(id))return;
  if((t.kind==='unit'||t.kind==='move')&&id===t.unit){
   if(t.kind==='unit'){success();return;}
   close();picked=id;error='';render();return;
  }
  if(t.kind==='unit'||t.kind==='move')fail('你選到'+unit(id).name+'。這一步請選'+unit(t.unit).name+'。');
  else tell(unit(id).name+' 位於 '+G.nameAt(unit(id))+'。');
 }
 function cell(c){
  const t=step(),coord=G.nameAt(c),s=state();
  if(t?.kind==='cell'){if(C.accepts(s,'cell',coord))success();else fail('你點了 '+coord+'。可以用「指出位置」核對這一步的地形。');return;}
  if(t?.kind==='move'&&picked===t.unit){if(C.accepts(s,'move',coord))success();else fail('目的地是 '+t.at+'，算子仍在 '+G.nameAt(unit(t.unit))+'。');return;}
  const here=G.unitsAt(s,c);
  const marks=c.marks.length?'<p>'+c.marks.map(esc).join('、')+'</p>':'';
  dialog('lessonCell',coord+'・'+(G.terrain(c.t)?.name||'集結區'),marks+'<div class="lesson-cell-units">'+here.map(u=>button('lessonPick',u.name+(u.lessonStatus?'・'+u.lessonStatus:''),'',u.id)).join('')+'</div>'+(c.t?button('inspectStack','查看完整地形牌','tiny',c.x+','+c.y):''));
 }
 function handle(a,v){
  const s=state();
  switch(a){
  case 'lessonTurnGuide':turnGuide();return true;
  case 'lessonCardKey':window.FOF_DRAW_VIEW.show([{why:'牌面示例',ids:[30]}],'判讀行動牌','左上鋼盔內的大數字是啟動命令，右下的小數字是主動命令。左欄按淨修正查 HIT、PIN 或 MISS。若命中，再抽牌查經驗欄。牌底的 RAND 是隨機數。');return true;
  case 'courses':menu();return true;
  case 'courseInfo':info(v);return true;
  case 'courseRestart':dialog('courseRestart','重新演練','<p>要將這一課的進度回到第一步嗎？</p><div class="buttonrow">'+button('courseStart','從頭開始','primary',v)+button('courseInfo','繼續保留進度','',v)+'</div>');return true;
  case 'courseStart':reset();switchState(C.start(v));return true;
  case 'courseResume':reset();switchState(slots()[v]);return true;
  }
  if(!C.has(s.id))return false;
  switch(a){
  case 'lessonTab':tab=v;render();break;
  case 'lessonHint':hint=!hint;render();break;
  case 'lessonBack':if(s.cursor){reset();switchState(C.restore({id:s.id,cursor:s.cursor-1,reading:false}));}break;
  case 'lessonAnswer':if(C.accepts(s,'choice',v))success();else fail('這個選項與本步的規則不符。請再對照提示或查看最近抽牌。');break;
  case 'lessonPick':pick(v);break;
  case 'cell':{const [x,y]=v.split(',').map(Number);const c=G.at(s,{x,y});if(c)cell(c);break;}
  default:return false;
  }
  return true;
 }
 return {menu,hero,side,roster,target,handle,reset,chosen:()=>picked,
  awaitingCell:()=>step()?.kind==='cell'||step()?.kind==='move'&&picked===step().unit};
};
})();
