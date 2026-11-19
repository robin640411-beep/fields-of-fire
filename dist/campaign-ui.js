(() => {
'use strict';
const C=window.FOF_CAMPAIGNS,S=window.FOF_SERIES,G=window.FOF,A=window.FOF_CAMPAIGN_AIR;
window.FOF_CAMPAIGN_UI=({state,slots,switchTo,edit,dialog,button,close,tell,esc,missionChoice,entryBrief,result,render,cellDialog})=>{
 const h=v=>esc(v), b=button,$=id=>document.getElementById(id);
 const opt=(v,label,selected=false)=>'<option value="'+h(v)+'"'+(selected?' selected':'')+'>'+h(label)+'</option>';
 const opts=(o,selected)=>Object.entries(o).map(([k,v])=>opt(k,v,k===selected)).join('');
 const labels={patrol:'三排巡邏',offensive:'進攻',assault:'進攻',defense:'防禦'};
 const action=(a,label,v,cls='tiny')=>b('cam'+a,label,cls,v);
 function directory(){return '<div class="book-list">'+['N','K','H','V'].map(k=>{const book=C.books[k],save=slots()['campaign-'+k];return '<button class="choice" data-action="camBook" data-value="'+k+'"><span class="code">'+k+'</span><span><strong>'+book.label+'</strong><small>'+book.missions.length+' 個獨立任務・'+book.order.length+' 場連續戰役'+(save?'・已存至任務 '+G.scenario(save.id).number:'')+'</small></span></button>';}).join('')+'</div>';}
 function historyArticle(bookKey, missionId){
  const book=window.FOF_HISTORY[bookKey];
  const article=missionId ? book.missions[missionId] : book;
  const heading=missionId ? '任務背景' : article.headline;
  const date=missionId ? article.date : article.period;
  const paragraphs=article.paragraphs.map(p=>'<p>'+h(p)+'</p>').join('');
  const table=missionId ? '<div class="history-table"><strong>本場棋局</strong><p>'+h(article.table)+'</p></div>' : '';
  return '<article class="history-article" data-history="'+h(missionId||bookKey)+'"><header><span class="history-date">'+h(date)+'</span><h3>'+h(heading)+'</h3></header>'+
    paragraphs+table+'<footer>依《'+h(C.books[bookKey].label)+'戰役任務書》第 '+h(article.pages)+' 頁整理。'+(article.sourceNote?' '+h(article.sourceNote):'')+'</footer></article>';
 }
 function campaignIntro(k){
  const book=C.books[k];
  dialog('campaignIntro',book.label+'戰役歷史背景',historyArticle(k)+
   '<div class="buttonrow">'+action('Missions','選擇遊玩方式',k,'primary')+b('close','返回棋桌')+'</div>',k);
 }
 function missionBriefing(m){
  return historyArticle(m.book,m.id)+'<h3>勝利條件</h3><p>'+h(m.objective)+'</p><h3>設置</h3><ul>'+
   m.setupNotes.map(note=>'<li>'+h(note)+'</li>').join('')+'</ul><p class="tagline">'+h(C.books[m.book].label)+
   '任務書，第 '+h(m.page)+'–'+h(m.lastPage)+' 頁。特殊配屬、敵軍組合與額外效果請依任務書處理。</p>';
 }
 function bookPage(k){
  const book=C.books[k];if(!book)return;
  const save=slots()['campaign-'+k];
  let html='<h3>連續戰役</h3>';
  if(save)html+='<p>'+h(C.rules[save.series.rule])+'　'+h(G.scenario(save.id).title)+'　'+h(save.series.finished||('第 '+save.turn+' 回合'))+'</p>'+action('Resume','繼續戰役',k,'primary')+' '+action('New','重新開始戰役',k);
  else html+=action('New','建立戰役',k,'primary');
  html+='<h3>獨立任務</h3>'+book.missions.map(m=>missionChoice(m.id,m.id,m.title,labels[m.mode]+'・'+m.cols+' × '+m.rows+'・'+m.turns+' 回合')).join('');
  dialog('campaignBook',book.label+'戰役',html+action('Book','回顧戰役背景',k)+' '+b('close','返回棋桌','tiny'));
 }
 function newSeries(k,rule,formation){
  const book=C.books[k],save=slots()['campaign-'+k];
  const html='<p>'+book.order.length+' 場任務依序進行。每場結算後，連隊剩餘兵力、經驗與技能會帶入下一場。'+(k==='V'?'第七場選 Alpha 或 Bravo 連其中一路。':'')+'</p>'+
  '<label class="formgroup">戰役勝負<select id="campaignRule">'+opts(C.rules,rule)+'</select></label><p class="hint">標準模式要求完成每場非巡邏任務。生存者模式追蹤連指揮部是否生還。硬派模式同時檢查兩項條件。</p>'+form(k,formation)+
  (save?'<p>開始後會取代這本任務書的戰役進度。</p>':'')+action('Launch','閱讀第一場任務簡報',k,'primary')+' '+action('Missions','返回',k);
  dialog('seriesSetup',book.label+'戰役設置',html);
 }
 function form(k,formation){return k==='V'?'<label class="formgroup">連隊編制<select id="campaignForm">'+opt('mortar81','81 公釐迫砲分隊')+opt('fourthPlatoon','第 4 步槍排',formation==='fourthPlatoon')+'</select></label>':'';}
 function reader(id,page){
  const m=G.scenario(id);if(!m)return;
  const book=C.books[m.book],pages=book.refPages;
  page=pages.includes(Number(page))?Number(page):m.mapPage;
  const ref=m.references||{},choices={'編制':m.book==='H'||m.book==='K'?11:12,'任務':m.page,'設置圖':m.mapPage,'事件表':ref.friendly||m.tablePage||Math.min(m.page+2,m.lastPage),'接敵表':ref.contact||m.contactPage||m.lastPage,'勘誤':book.refPages.at(-1)};
  const refButton=(name,p,cl)=>action('Ref',name,id+'|'+p,cl);
  const pos=pages.indexOf(page),nav='<div class="ref-navigation">'+b('camRef','上一頁','tiny',id+'|'+pages[pos-1],!pos)+'<label>第 <select id="bookPage" data-id="'+id+'">'+pages.map(p=>opt(p,p,p===page)).join('')+'</select> 頁</label>'+b('camRef','下一頁','tiny',id+'|'+pages[pos+1],pos===pages.length-1)+'</div>';
  dialog('bookReader',book.label+'任務書　'+m.id,'<div class="ref-tabs">'+Object.entries(choices).map(([n,p])=>refButton(n,p,'tiny')).join('')+'</div>'+nav+
   '<img class="book-page" alt="'+book.label+'任務書第 '+page+' 頁" src="assets/campaign/'+m.book+'/'+page+'.webp">'+nav.replace('id="bookPage"','class="secondary-page"')+b('close','返回棋桌','secondary'));
 }
 document.addEventListener('change',e=>{if(e.target.matches('#bookPage,.secondary-page'))reader(e.target.dataset.id,e.target.value);});
 function status(s){
   const f=s.series,book=C.books[f.book],m=G.scenario(s.id);
   let html='<p>'+book.label+'　'+C.rules[f.rule]+'　'+(f.index+1)+' / '+book.order.length+' 場</p>';
   if(f.history.length)html+='<ol>'+f.history.map(v=>'<li>'+h(G.scenario(v.id).title)+'　'+(v.outcome==='win'?'成功':'未完成')+'　'+v.xp+' XP</li>').join('')+'</ol>';
   if(f.finished)html+='<p><strong>'+h(f.finished)+'</strong></p>';
   else if(s.outcome)html+=action('Settle',s.settlement?'繼續整補':'結算本場戰役','', 'primary');
   else html+='<p>目前任務　'+h(m.title)+'</p>';
   dialog('seriesStatus','戰役紀錄',html+action('Missions','任務書目錄',f.book));
 }
 const input=(id,name,value,max=500)=>'<label>'+h(name)+' <input type="number" id="'+id+'" min="0" max="'+max+'" value="'+Number(value||0)+'"></label>';
 function settle(){
  const s=state(),m=G.scenario(s.id);
  if(!s.settlement&&!s.series.finished){
    if(!edit(()=>S.openSettlement(s))){tell('本次任務仍可重試，請先完成允許的嘗試。');return;}
  }
  if(s.series.finished){status(s);return;}
  const t=s.settlement,stages={report:'任務記錄',rebuild:'重組與提升經驗',replace:'分配補充兵',skills:'技能與下一場'};
  let html='<p class="series-steps">'+Object.entries(stages).map(([k,n])=>k===t.phase?'<strong>'+n+'</strong>':n).join('　›　')+'</p>';
  if(t.phase==='report'){
   html+='<p>棋桌已結算 '+t.xp+' XP。依任務書登記事件、後送等額外得分，並核對傷亡及俘虜。</p><div class="series-inputs">'+
    (m.mode==='patrol'?[1,2,3].map(p=>input('extra'+p,'第 '+p+' 排額外 XP',0)).join(''):input('extra','額外 XP',0))+
    input('lost','本場累計損失階數（含俘虜及重試）',t.lost)+input('captured','其中被俘階數',0)+input('lat','可重組的有限行動小組階數',t.lat,t.loss)+'</div>'+
    action('Report','確認記錄，開始重組','','primary');
  }else{
   html+='<div class="series-metrics"><b>剩餘 '+(t.xp+t.extra-t.spent)+' XP</b><span>小組 '+(t.lat+t.transfers.length)+'</span><span>新兵 '+t.green+'　歸隊老兵 '+t.veteran+(t.katusa?'　韓籍補充 '+t.katusa:'')+'</span></div>';
   if(m.mode==='patrol')html+='<p>'+[1,2,3].map(p=>'第'+p+'排 '+((t.perPlatoon[p]||0)-(t.spentBy[p]||0))+' XP').join('　')+'</p>';
   if(t.rotation||t.hqRotation||t.tour)html+='<p>輪調　'+(t.rotation?'先移除 '+t.rotation+' 階老兵。':'')+(t.hqRotation?'選一個有經驗的排部換為新兵。':'')+(t.tour?'任務 4 前另有 '+t.tour+' 階須換為新兵。'+(t.tourNeedsHQ&&!t.hqRotation?'若仍有符合條件的指揮部，至少選一個。':''):'')+'</p>';
   if(t.phase==='rebuild')html+='<p>點兵力階提升一次經驗。新兵升一般花 1 XP，一般升老兵花 3 XP。可拆出兵力階，或用剩餘小組重新編組。</p>';
   if(t.phase==='skills')html+='<label class="formgroup">要購買的技能<select id="seriesSkill">'+Object.entries(S.skills).map(([k,c])=>opt(k,k+'　'+c+' XP')).join('')+'</select></label>';
   html+='<table class="series-table"><thead><tr><th>連隊單位</th><th>兵力階</th><th>整補</th></tr></thead><tbody>'+t.rows.map((r,i)=>{
    const ctrl=(ac,label,idx='')=>action('Ledger',label,ac+'|'+i+'|'+idx);
    let controls='';
    if(t.phase==='rebuild'){
     if(t.rotation){if(r.ranks.some(z=>z.grade==='veteran'))controls=ctrl('rotate','輪調老兵');}
     else controls=(r.ranks.length?ctrl('detach','分遣'):'')+(r.ranks.length<r.max&&(t.lat||t.transfers.length)?ctrl('rebuild','編入'):'');
    }else if(t.phase==='replace'&&r.ranks.length<r.max)controls=(t.green?ctrl('fill','＋新兵','green'):'')+(t.veteran?ctrl('fill','＋老兵','veteran'):'')+(t.katusa&&r.rifle?ctrl('fill','＋韓籍','katusa'):'');
    else if(t.phase==='skills'){
     if(t.hqRotation&&r.platoon&&/排部|指揮部/.test(r.name)&&r.ranks[0]?.grade!=='green'&&r.ranks.length)controls+=ctrl('rotateHQ','排部換防');
     if(S.canTour(t,r))controls+=ctrl('tour','換為新兵');
     if(/排部|指揮部|副官|士官長/.test(r.name)&&r.ranks.length)controls+=ctrl('skill','購買技能');
    }
    const marks=r.ranks.map((z,j)=>t.phase==='rebuild'&&!t.rotation&&!z.locked&&z.grade!=='veteran'?ctrl('promote',C.gradeNames[z.grade]+' ↑',j):h(C.gradeNames[z.grade]));
    return '<tr><th>'+h(r.name)+(r.skills.length?'<small>'+r.skills.map(h).join('、')+'</small>':'')+'</th><td>'+marks.join(' ')+' <small>'+r.ranks.length+'/'+r.max+'</small></td><td>'+controls+'</td></tr>';
   }).join('')+'</tbody></table>';
   if(t.phase==='skills')html+=S.eligibleNext(s).map(id=>action('Next','進入 '+id+' '+G.scenario(id).title,id,'primary')).join(' ');
   else html+=action('Ledger',t.phase==='rebuild'?'完成重組，分配補充兵':'完成補充，分配技能',(t.phase==='rebuild'?'finishRebuild':'finishReplace')+'||','primary');
  }
  dialog('campaignSettlement',m.id+' 任務間整補',html);
 }
 function setupPanel(s){const m=G.scenario(s.id);if(!m||s.id==='Q1')return '';
  let controls=action('Ref','翻閱任務書',s.id+'|'+m.mapPage);
  if(s.series)controls+=action('Status','戰役紀錄','');
  if(s.phase==='setup'&&m.katusa?.standalone&&!s.series)controls+=action('Katusa','選擇韓籍班','');
  if(s.phase==='setup'&&m.book==='V'&&!s.deploymentConfirmed&&s.attempt===1&&s.id!=='VN8')controls+=action('Form','連隊編制','');
  if(m.mode==='patrol'&&s.phase==='setup'&&!s.deploymentConfirmed&&s.company?.length)controls+=action('Attach','巡邏配屬','');
  if(s.planes?.length&&s.phase!=='setup')controls+=action('Flight','飛行管制卡','');
  if(s.phase==='setup'&&m.book==='V')controls+=action('Deploy','編組與登場','');
  if(s.series&&m.patrol?.optionalInCampaign&&s.phase==='setup')controls+=action('Skip','略過本排巡邏','');
  if(m.book==='H'&&m.maxAdditionalRows||['K3','K4','VN5'].includes(s.id)||['N6','N7','K6','K7'].includes(s.id))controls+=action('MapTools','任務地圖調整','');
  return '<div class="campaign-tools">'+controls+'</div>';
 }
 function deployment(s){
  const m=G.scenario(s.id),all=s.units.filter(u=>u.side==='friendly'),cap=m.airlift?.oneLift?m.airlift.count*3:null;
  const ids=s.offboard||[],detached=m.detachedSquads;
  let html='<p>'+h(detached?'勾選兩個留置的步兵班。':cap?'本場首波運量 '+cap+' 階。':m.airlift?'依任務書安排四波機位。':'勾選本場登場的單位。其餘人員留在連隊名冊。')+'</p>';
  if(s.landing?.length===3&&m.terrainSetup.landingChoice==='contiguous')html+='<label>大型 LZ <select id="landingStart">'+Array.from({length:s.cols-2},(_,x)=>opt(x,G.nameAt({x,y:1})+' 至 '+G.nameAt({x:x+2,y:1}),x===C.coord(s.landing[0]).x)).join('')+'</select></label>';
  if(m.airlift){
    const planes=A.fleet(m).filter(p=>p.arrival===1),plan=s.planes?Object.fromEntries(s.planes.flatMap(p=>p.cargo.map(id=>[id,p.key]))):A.proposed(s);
    html+='<p>每枚算子選擇機位。UH-1 每架 3 階，CH-47 每架 12 階。機位表按兵力階預排，可自行調整。</p><div class="formation-grid">'+[...all,...ids].filter(u=>!A.armored(u)).map(u=>'<label>'+h(u.name)+'（'+u.steps+'）<select class="flight-seat" data-unit="'+h(u.id)+'">'+opt('','留置',!plan[u.id])+planes.map(p=>opt(p.key,p.model+' '+p.key,plan[u.id]===p.key)).join('')+'</select></label>').join('')+'</div>';
  }else html+='<div class="formation-grid">'+[...all,...ids].filter(u=>!detached||/步兵班|第\d+班/.test(u.name)).map(u=>'<label><input class="deploy-check" type="checkbox" value="'+h(u.id)+'" '+((detached?ids:all).some(q=>q.id===u.id)?'checked':'')+'> '+h(u.name)+' · '+u.steps+'階</label>').join('')+'</div>';html+=action('ApplyDeploy','確認編組','','primary');
  dialog('campaignDeployment',m.id+' 編組與登場',html);
 }
 function flight(s){
  const items=s.planes.map(p=>'<tr><th>'+h(p.model)+' '+h(p.key)+'</th><td>'+h(p.arrival>s.turn?'第 '+p.arrival+' 回合到場':A.stages[p.stage])+'</td><td>'+p.cargo.map(id=>h(s.offboard.find(u=>u.id===id)?.name)).join('、')+'</td><td>'+(p.arrival<=s.turn&&p.stage<4?action('FlightMove',A.stages[p.stage+1],p.key):'')+'</td></tr>').join('');
  dialog('campaignFlight','飛行管制卡','<p>完成本階段所需的啟動後，將機位往下一格移動。移入著陸區時，該機位的算子會放到選定的地形牌上。</p><label>著陸區 <select id="flightLanding">'+s.landing.map(k=>opt(k,k)).join('')+'</select></label><table class="series-table"><thead><tr><th>機位</th><th>位置</th><th>搭載算子</th><th>移至</th></tr></thead><tbody>'+items+'</tbody></table>');
 }
 function handle(a,v){
  if(!a.startsWith('cam'))return false;const s=state(),m=G.scenario(s.id);
  switch(a){
   case 'camBook':campaignIntro(v);break;
   case 'camMissions':bookPage(v);break;
   case 'camHistory':dialog('campaignHistory',C.books[v].label+'戰役背景',historyArticle(v)+b('brief','返回本場簡報','secondary'));break;
   case 'camNew':newSeries(v);break;
   case 'camLaunch':{
    const rule=$('campaignRule').value,formation=$('campaignForm')?.value;
    entryBrief(C.books[v].order[0][0],()=>switchTo(C.launch(v,rule,formation)),()=>newSeries(v,rule,formation));
    break;
   }
   case 'camResume':{
    const saved=slots()['campaign-'+v];
    if(!saved)break;
    if(saved.settlement||saved.outcome){switchTo(saved);if(saved.settlement)settle();}
    else entryBrief(saved.id,()=>switchTo(saved),()=>bookPage(v),'繼續戰役・第 '+saved.turn+' 回合');
    break;
   }
   case 'camRef':{const [id,page]=v.split('|');reader(id,page);break;}
   case 'camStatus':status(s);break;
   case 'camForm':{
    const eligible=s.company.filter(u=>u.initialGrades?.length),fresh=!(s.series?.index>0)&&s.patrol===1;
    let html='<p>本場編制　'+h(s.startingForm==='mortar81'?'81 公釐迫砲分隊':'第 4 步槍排')+'</p>'+action('SwapForm',s.startingForm==='mortar81'?'改用第 4 步槍排':'改用 81 公釐分隊',s.startingForm==='mortar81'?'fourthPlatoon':'mortar81');
    if(fresh)html+='<p>初始經驗依任務書階數池預先分配。可調換各兵力階，並依規則 12.6 合併為單位經驗。</p><div class="formation-grid">'+eligible.map(u=>'<label>'+h(u.name)+' '+u.initialGrades.map((gr,i)=>'<select class="initial-rank" data-id="'+h(u.id)+'" data-i="'+i+'">'+Object.entries(C.gradeNames).map(([k,n])=>opt(k,n,k===gr)).join('')+'</select>').join('')+'</label>').join('')+'</div>'+action('ApplyRanks','套用經驗分配','','primary');
    dialog('companyForm','越南連隊編制',html);break;
   }
   case 'camSwapForm':if(edit(()=>C.switchFormation(s,v)))handle('camForm','');break;
   case 'camApplyRanks':{
    const inputs=[...document.querySelectorAll('.initial-rank')],pool=C.books.V.rosterOptions[s.startingForm].pool;
    if(Object.entries(pool).some(([g,n])=>inputs.filter(el=>el.value===g).length!==n)){tell('每種經驗的階數須符合編制表：'+Object.entries(pool).map(([g,n])=>C.gradeNames[g]+n).join('、'));break;}
    edit(()=>{for(const el of inputs){s.company.find(u=>u.id===el.dataset.id).initialGrades[Number(el.dataset.i)]=el.value;}
      for(const u of s.company.filter(u=>u.initialGrades)){u.experience=C.composite(u.initialGrades);const piece=s.units.find(p=>p.rosterId===u.id);if(piece)piece.experience=u.experience;}});close();break;
   }
   case 'camKatusa':{const available=s.company.filter(u=>u.rifle);
    dialog('katusa','韓籍班編組','<p>選兩個不同步兵班。任務書指定的經驗會隨選擇套用。</p>'+m.katusa.standalone.map((g,i)=>'<label class="formgroup">'+C.gradeNames[g]+' <select id="katusa'+i+'">'+available.map((u,j)=>opt(u.id,u.name,j===i*3)).join('')+'</select></label>').join('')+action('ApplyKatusa','套用韓籍編組','','primary'));break;}
   case 'camApplyKatusa':{
    const picks=[$('katusa0').value,$('katusa1').value];if(picks[0]===picks[1]){tell('請選兩個不同的班。');break;}
    edit(()=>{const base=C.books.K.roster;for(const u of s.company.filter(u=>u.rifle)){const i=picks.indexOf(u.id),meta=base.find(q=>q.id===u.id);u.katusa=i>=0;u.art=i>=0?C.katusaArt(m.katusa.standalone[i]):meta.art;u.name=meta.name+(i>=0?'（韓籍班）':'');u.experience=i>=0?m.katusa.standalone[i]:meta.experience;const p=s.units.find(z=>z.rosterId===u.id);if(p)Object.assign(p,{name:u.name,art:u.art,experience:u.experience});}});close();break;}
   case 'camAttach':{
    const choices=[...s.company.filter(u=>!u.platoon&&u.art!=='co-hq'&&u.id!=='81mm Sec'&&u.steps>0),...C.attachments(m).filter(u=>!u.vehicle)];
    dialog('patrolAttachment','第 '+s.patrol+' 排巡邏配屬','<p>依本場編組表選擇參與本次巡邏的連屬單位與配屬算子。</p><div class="formation-grid">'+choices.map((u,i)=>'<label><input type="checkbox" class="patrol-extra" value="'+i+'" '+(s.units.some(p=>p.id==='company-'+u.id)?'checked':'')+'> '+h(u.name)+'</label>').join('')+'</div>'+action('ApplyAttach','確認巡邏編組','','primary'));break;}
   case 'camApplyAttach':{
    const choices=[...s.company.filter(u=>!u.platoon&&u.art!=='co-hq'&&u.id!=='81mm Sec'&&u.steps>0),...C.attachments(m).filter(u=>!u.vehicle)];
    const selected=[...document.querySelectorAll('.patrol-extra:checked')].map(el=>choices[Number(el.value)]);
    edit(()=>{s.patrolAttached=selected.map(u=>u.id);s.units=s.units.filter(u=>!choices.some(z=>u.id==='company-'+z.id));
     const pos=s.units.find(u=>u.side==='friendly')||s.map[0];for(const u of selected)s.units.push({...G.piece('company-'+u.id,u.name,u.id,u.steps,pos.x,pos.y,'friendly',u.art),rosterId:u.attachment?null:u.id,experience:u.experience,skills:[]});});close();break;
   }
   case 'camSettle':settle();break;
   case 'camDeploy':deployment(s);break;
   case 'camFlight':flight(s);break;
   case 'camFlightMove':{if(edit(()=>A.move(s,v,$('flightLanding').value)))flight(s);break;}
   case 'camApplyDeploy':{
    if(m.airlift){
     const assignments=Object.fromEntries([...document.querySelectorAll('.flight-seat')].map(e=>[e.dataset.unit,e.value])),start=$('landingStart')?Number($('landingStart').value):null;
     if(!edit(()=>{if(!A.commit(s,assignments))return false;if(start!==null){s.map.forEach(c=>c.marks=c.marks.filter(z=>z!=='著陸區 LZ'));s.landing=[0,1,2].map(i=>G.nameAt({x:start+i,y:1}));s.landing.forEach(k=>G.at(s,C.coord(k)).marks.push('著陸區 LZ'));}return true;}))tell('請核對每個機位容量。分波任務須替每枚登場算子指定機位。');else close();break;
    }
    const picked=new Set([...document.querySelectorAll('.deploy-check:checked')].map(e=>e.value));
    const pool=[...s.units.filter(u=>u.side==='friendly'),...(s.offboard||[])];
    const deployed=pool.filter(u=>m.detachedSquads?!picked.has(u.id):picked.has(u.id));
    if(m.detachedSquads&&picked.size!==m.detachedSquads){tell('請選擇兩個步兵班。');break;}
    if(!deployed.length||m.airlift?.oneLift&&deployed.reduce((n,u)=>n+u.steps,0)>m.airlift.count*3){tell('請選擇符合運量的登場兵力。');break;}
    const start=$('landingStart')?Number($('landingStart').value):null;
    edit(()=>{
      if(start!==null){s.map.forEach(c=>c.marks=c.marks.filter(z=>z!=='著陸區 LZ'));s.landing=[0,1,2].map(i=>G.nameAt({x:start+i,y:1}));s.landing.forEach(k=>G.at(s,C.coord(k)).marks.push('著陸區 LZ'));deployed.forEach((u,i)=>Object.assign(u,C.coord(s.landing[i%3])));}
      s.offboard=pool.filter(u=>!deployed.includes(u));s.units=[...s.units.filter(u=>u.side!=='friendly'),...deployed];s.deploymentConfirmed=true;
    });close();break;
   }
   case 'camReveal':{const c=G.at(s,C.coord(v));if(c?.faceDown)edit(()=>{c.faceDown=false;G.note(s,'翻開 '+v+' 地形牌。');});close();break;}
   case 'camSkip':dialog('skipPatrol','略過第 '+s.patrol+' 排巡邏','<p>本排將記錄為未出發，取得 0 XP。</p>'+action('SkipYes','確認略過','','primary')+' '+b('close','返回'));break;
   case 'camSkipYes':{const next=S.nextPatrol(s,true);if(next){switchTo(next);if(next.outcome)result();}break;}
   case 'camReport':{
    const n=id=>Number($(id)?.value||0);
    const ok=edit(()=>S.ledger(s,'report',{extra:n('extra'),captured:n('captured'),lost:n('lost'),lat:n('lat'),patrolExtra:[1,2,3].map(i=>n('extra'+i))}));
    if(ok)settle();else tell('請核對人數及經驗數字。');break;}
   case 'camLedger':{const [command,index,idx]=v.split('|'),row=s.settlement?.rows[Number(index)],skill=$('seriesSkill')?.value;
    if(edit(()=>S.ledger(s,command,{id:row?.id,index:Number(idx),grade:idx,skill})))settle();else tell('可用兵力、經驗或輪調條件尚未符合。');break;}
   case 'camNext':{
    if(S.canAdvance(s,v))entryBrief(v,()=>switchTo(S.advance(s,v)),settle);
    else tell('請先完成任務間輪調。');
    break;
   }
   case 'camMapTools':mapTools(s);break;
   case 'camMapApply':{if(edit(()=>C.adjustMap(s,v))){close();}else tell('此地圖已達範圍上限。');break;}
   default:return false;
  }return true;
 }
 function mapTools(s){const m=G.scenario(s.id);
   let html='<p>依任務事件或任務書授權的擴圖條件調整。</p>';
   if(m.maxAdditionalRows&&s.rows===m.rows)html+=action('MapApply','新增前方一列','row');
   if(['K3','K4','VN5'].includes(s.id))html+='<p>主抵抗線在第 '+(s.mlr||2)+' 列上方。</p>'+action('MapApply','前移主抵抗線','mlr+')+action('MapApply','後移主抵抗線','mlr-');
   if(['K6','K7','N6','N7'].includes(s.id))html+=action('MapApply','新增左側縱欄','left')+action('MapApply','新增右側縱欄','right');
   dialog('mapTools','任務地圖',html);
 }
 return {directory,missionBriefing,reader,setupPanel,status,handle,form};
};
})();
