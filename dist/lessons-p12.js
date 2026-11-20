(() => {
  const lessons = window.FOF_LESSONS ||= {};
  const unit = (id, art, name, at) => ({id, art, name, at});
  const platoon = () => [
    unit('hq','hq','第 1 排部','B0'), unit('s1','s1','1/1 班','B0'),
    unit('s2','s2','2/1 班','B0'), unit('s3','s3','3/1 班','B0'),
    unit('lmg','lmg','1/LMG 組','B0'), unit('at','at','1/AT 組','B0'),
    unit('fo','fo','迫擊砲前進觀測員','B0')
  ];
  const labels = Object.fromEntries(platoon().map(u => [u.id,u.name]));
  const cmd = '排部命令', ini = '一般主動', bank = '保留命令';
  const command = (turn,page,card,total,line) => ({
    turn, page, phase:cmd, kind:'draw', cards:[card],
    text:'連部啟動第 1 排部。抽牌，讀鋼盔的大數字。',
    detail:line, effects:{tracks:{[cmd]:total,[bank]:0,[ini]:0}}
  });
  const initiative = (turn,page,card,total,small,saved) => ({
    turn, page, phase:ini, kind:'draw', cards:[card],
    text:'排部結束下令。抽另一張牌，讀牌面左上、鋼盔下方的小數字。',
    detail:'左上角的小數字是 '+small+'。單排一般主動減半，小數捨去，這個時段可用 '+total+' 點。'+(saved?'排部另存 '+saved+' 點。':''),
    effects:{tracks:{[cmd]:0,[bank]:saved,[ini]:total}}
  });
  const move = (turn,page,phase,id,at,left,line,extra={}) => ({
    turn,page,phase,kind:'move',unit:id,at,
    text:'將'+labels[id]+'移到 '+at+'。', detail:line,
    effects:{...extra,status:{[id]:'暴露',...extra.status},tracks:{[phase]:left,...extra.tracks}}
  });
  const cleanup = (turn,page,answerText,line,clear={resetStatus:true}) => ({
    turn,page,phase:'清理',kind:'choice',text:'回合結束，應如何整理標記？',
    options:[answerText,'讓所有單位再各移動一張牌'],answer:0,detail:line,
    effects:{...clear,tracks:{[ini]:0,[cmd]:0,...clear.tracks}}
  });
  const checkpoint = (turn,page,phase,kind,target,text,detail,effects) => ({
    turn,page,phase,kind,...(kind==='unit'?{unit:target}:{at:target}),text,detail,...(effects?{effects}:{})
  });
  const draw = (turn,page,phase,cards,text,detail,effects) => ({
    turn,page,phase,kind:'draw',cards,text,detail,...(effects?{effects}:{})
  });
  lessons.P1 = {
    title:'啟動與移動', group:'排', pages:'7–14',
    goal:'讓七枚友軍算子全部抵達第 3 列，三個步兵班各走一欄。這次演練使用固定的示篋牌序，沒有敵軍或回合上限。',
    units:platoon(), marks:{}, steps:[
      checkpoint(1,8,'設置','cell','B0','點選七枚友軍所在的集結區。','中央集結區是 B0。最遠的第 3 列由三張樹林組成，B3 的樹林位於丘陵上。'),
      command(1,9,30,3,'第 30 號牌的鋼盔是 3，排部取得 3 點命令。'),
      move(1,10,cmd,'s1','A1',2,'本次跨牌花 1 點，1/1 班標記暴露。'),
      move(1,10,cmd,'s2','B1',1,'2/1 班離開 B0；之後排部只能在自己的牌上以目視／口令下令。'),
      move(1,10,cmd,'s3','C1',0,'三個班都已移動，命令軌歸零。'),
      initiative(1,10,25,1,2,0),
      move(1,10,ini,'at','A1',0,'一般主動點可讓單位自行行動，不必由排部傳令。'),
      cleanup(1,11,'移除暴露，進入第 2 回合','本課沒有事件、敵軍、車輛或戰鬥，清理後可重新移動。'),
      command(2,11,24,4,'第 24 號牌提供 4 點。'),
      move(2,11,cmd,'lmg','C1',3,'1/LMG 與 3/1 班同牌。'),
      move(2,11,cmd,'fo','B1',2,'觀測員與 2/1 班同牌。'),
      move(2,11,cmd,'hq','B1',1,'排部也可以花自己的命令點移動。'),
      move(2,11,cmd,'s2','B2',0,'排部進入 B1 後，可立即向同牌的 2/1 班下令。'),
      initiative(2,11,27,1,2,0),
      move(2,11,ini,'s1','A2',0,'1/1 班使用一般主動點，無須排部在 A1。'),
      cleanup(2,11,'移除暴露，重設命令標記','第 2 回合結束，排部沒有保留命令。'),
      command(3,12,11,4,'第 11 號牌提供 4 點。'),
      move(3,12,cmd,'fo','B2',3,'觀測員離開與排部共用的 B1。'),
      move(3,12,cmd,'hq','C1',2,'排部抵達 C1，可指揮本牌上的友軍。'),
      move(3,12,cmd,'s3','C2',1,'3/1 班跨牌後標記暴露。'),
      move(3,12,cmd,'lmg','C2',0,'1/LMG 也在 C2，這個時段的 4 點都已花完。'),
      initiative(3,12,16,1,3,0),
      move(3,12,ini,'at','A2',0,'一般主動可指揮與排部分開的 1/AT。'),
      cleanup(3,12,'移除這一回合的暴露標記','各單位在下一回合恢復跨牌移動資格。'),
      command(4,13,23,4,'第 23 號牌提供 4 點。'),
      move(4,13,cmd,'hq','B2',3,'斜向也算相鄰，移動費用相同。'),
      move(4,13,cmd,'fo','B3',2,'觀測員抵達第三列。'),
      move(4,13,cmd,'s2','B3',1,'2/1 班抵達中央樹林。剩下 1 點可留下回合使用。'),
      initiative(4,13,13,1,3,1),
      move(4,13,ini,'s1','A3',0,'1/1 班抵達左側樹林。'),
      cleanup(4,13,'移除暴露，保留排部的 1 點','一般主動點不能儲存。日間、一般經驗排部可保留至多 6 點。'),
      command(5,13,3,6,'第 3 號牌給 5 點，加上前回合的 1 點，共有 6 點。'),
      move(5,13,cmd,'hq','C2',5,'排部移入右側果園。'),
      move(5,13,cmd,'s3','C3',4,'3/1 班進入右側樹林，三個班已各自抵達不同欄位。'),
      move(5,13,cmd,'lmg','C3',3,'1/LMG 也抵達第三列。排部留下 3 點。'),
      initiative(5,14,18,1,2,3),
      move(5,14,ini,'at','A3',0,'目前六枚到達；只有排部仍在第 2 列。'),
      cleanup(5,14,'移除暴露，保留排部的 3 點','排部解除暴露，下回合可以再跨牌。'),
      draw(6,14,cmd,[47],'手冊沒有指定第 6 回合的牌號。抽本課選用的第 47 號示例牌。','鋼盔 1 加上已保留的 3 點，共 4 點。手冊指定的最後一步是讓排部進入第 3 列。',{tracks:{[cmd]:4,[ini]:0,[bank]:0}}),
      move(6,14,cmd,'hq','C3',3,'七枚友軍都到達第 3 列，三個班分別在 A3、B3、C3。完成演練。')
    ]
  };

  const woods='散兵坑';
  const g='g', lt='lt', par='par', ft='ft';
  const clear=(...ids)=>Object.fromEntries(ids.map(id=>[id,'']));
  lessons.P2 = {
    title:'攻擊敵軍陣地',group:'排',pages:'15–25',
    goal:'完成手冊的已知陣地演練，清除第三列中央樹林中的敵軍，再以友軍占據該牌。前四回合重現書中牌序，第五回合提供教學續局。',
    units:[...platoon(),unit(g,'de-lmg','德軍輕機槍組','B3')],marks:{B3:[woods]},steps:[
      checkpoint(1,15,'設置','cell','B3','點選手冊標示為已發現敵軍的地形牌。','德軍算子位於 B3 的散兵坑。本課沒有潛在接敵標記，不檢查彈藥。',{tracks:{'可用支援':2}}),
      command(1,17,35,3,'第 35 號牌給 3 點。第 1 排部與三枚接受命令的算子現在都在 B0。'),
      move(1,17,cmd,'s1','C1',2,'1/1 班移至右側田野，標記暴露。'),
      move(1,17,cmd,'at','C1',1,'1/AT 與 1/1 班同牌。'),
      move(1,17,cmd,'lmg','A1',0,'排部 3 點花完。'),
      initiative(1,17,18,1,2,0),
      move(1,17,ini,'s3','A1',0,'3/1 班抵達左側田野。'),
      {turn:1,page:17,phase:'敵軍活動',kind:'choice',text:'本課的特殊規則如何處理「移除敵軍、放置 PC」？',options:['改為不採取行動','放置一枚 PC A'],answer:0,detail:'德軍留在 B3，這回合沒有戰鬥效果需要抽牌。'},
      cleanup(1,18,'移除本回合的暴露','四枚移動過的友軍解除暴露。'),
      command(2,18,21,4,'第 21 號牌給 4 點。'),
      move(2,18,cmd,'hq','C1',3,'排部現在與 1/1 班同牌。'),
      move(2,18,cmd,'s1','C2',2,'依手冊局面放置雙向主要射向（PDF）及兩枚火力量（VOF）標記。射擊標記立即更新，單位結果稍後才抽牌。',{marks:{C2:['PDF 至 B3','VOF A −1'],B3:[woods,'PDF 至 C2','VOF S 0']}}),
      initiative(2,18,29,1,2,2),
      move(2,18,ini,'lmg','A2',0,'依兩張來源牌更新 B3。只放較強的基本 VOF，另放交叉火力修正。',{marks:{A2:['PDF 至 B3'],B3:[woods,'PDF 至 C2','VOF A −1','交叉火力 −1']}}),
      draw(2,19,'敵軍活動',[32],'抽牌讀 R#4，查本回合手冊指定的敵軍活動列。','第 32 號牌的 R#4 是 3。依表將原在 C2 的 A 標記轉移到 A2。',{marks:{C2:['PDF 至 B3'],A2:['PDF 至 B3','VOF A −1'],B3:[woods,'PDF 至 A2','VOF A −1','交叉火力 −1']}}),
      draw(2,20,'戰鬥效果',[20],'B3 的淨戰鬥修正值為 +1。抽牌查 +1 欄。','樹林 +2、散兵坑 +1、A −1、交叉火力 −1，合計 +1。第 20 號牌結果為 PIN，暫時保留其他標記。',{status:{[g]:'受壓制'}}),
      draw(2,20,'戰鬥效果',[49],'A2 的淨戰鬥修正值為 −2。抽牌查 −2 欄。','果園 +1、A −1、暴露 −2，合計 −2。第 49 號牌結果為 HIT，還要抽一張判定兵力階效果。'),
      draw(2,20,'命中效果',[14],'抽一張牌，查看「一般」經驗欄。','第 14 號牌為 LC。單階算子只讀第一個字母 L，以擔架組取代 1/LMG 並保留壓制。',{remove:['lmg'],add:[unit(lt,'litter','美軍擔架組','A2')],status:{[lt]:'受壓制、暴露'}}),
      cleanup(2,20,'移除暴露，保留兩枚受壓制狀態','所有單位結算完畢才更新 VOF。排部存 2 點，B3 現為 S，A2 現為全部受壓制火力量。',{status:{...clear('hq','s1'),[lt]:'受壓制',[g]:'受壓制'},marks:{A2:['VOF P +2'],B3:[woods,'PDF 至 A2','VOF S 0']}}),
      command(3,21,45,4,'第 45 號牌給 2 點，加上前回合保留的 2 點，合計 4 點。'),
      move(3,21,cmd,'at','C2',3,'1/AT 與 1/1 班同牌。'),
      move(3,21,cmd,'hq','B0',2,'排部回到中央集結區。'),
      move(3,21,cmd,'fo','B1',1,'觀測員在中央田野。'),
      move(3,21,cmd,'s2','B1',0,'2/1 班移入 B1。依手冊補上 PDF 與 B3 的交叉火力修正。',{marks:{B1:['PDF 至 B3'],B3:[woods,'PDF 至 A2','VOF S 0','交叉火力 −1']}}),
      initiative(3,21,17,1,2,0),
      draw(3,22,'支援檢定',[4,41],'本次檢定須抽兩張。翻開整組行動牌，檢查爆炸符號。','第 4 號有爆炸，第 41 號沒有短彈。即使第一張已成功，仍須抽足兩張。B3 加上 −3 待發標記。',{tracks:{[ini]:0,'可用支援':1},marks:{B3:[woods,'PDF 至 A2','VOF S 0','交叉火力 −1','集中目標','待發 −3']}}),
      draw(3,22,'敵軍活動',[25],'抽牌讀 R#4，查受壓制單位的活動表。','第 25 號牌的 R#4 是 2。本例結果為不採取行動。'),
      checkpoint(3,22,'火力任務更新','cell','B3','點選有待發標記的地形牌，將標記翻面。','−3 標記轉為來襲。依本例移除 B3 指向 A2 的 PDF 和 A2 的 VOF。',{marks:{B3:[woods,'交叉火力 −1','集中目標','來襲 −3'],A2:[]}}),
      checkpoint(3,23,'壓制恢復','unit',lt,'選擇已沒有 VOF 的擔架組，移除壓制。','壓制恢復發生在戰鬥效果之前。B3 仍有 VOF，德軍算子繼續受壓制。',{status:{[lt]:''}}),
      draw(3,23,'戰鬥效果',[31],'本例 B3 的淨戰鬥修正值為 −1。抽牌查 −1 欄。','手冊列示的修正為 +2、−1、+1、+1、−3、−1，合計 −1。第 31 號牌為 HIT。'),
      draw(3,23,'命中效果',[40],'抽牌讀一般經驗欄，更新德軍算子。','第 40 號牌的 P 表示癱瘓。以受壓制的癱瘓組替換德軍輕機槍。',{remove:[g],add:[unit(par,'de-paralyzed','德軍癱瘓組','B3')],status:{[par]:'受壓制'}}),
      cleanup(3,23,'移除暴露，保留來襲標記','來襲標記持續到下回合的火力任務更新步驟。',{status:clear('at','s2','hq','fo')}),
      command(4,24,36,3,'第 36 號牌給 3 點。'),
      move(4,24,cmd,'hq','B1',2,'排部進入 B1。'),
      move(4,24,cmd,'s2','A2',1,'2/1 班從 B1 改到 A2，B1 的 PDF 移除。排部保留 1 點。',{marks:{B1:[],A2:['PDF 至 B3']}}),
      initiative(4,24,27,1,2,1),
      checkpoint(4,24,ini,'unit',lt,'選取 A2 的擔架組執行重整。','該牌沒有 VOF，重整自動成功。擔架組換成火力組；原先的 1/LMG 不會回到地圖。',{tracks:{[ini]:0},remove:[lt],add:[unit(ft,'fire','美軍火力組','A2')]}),
      draw(4,24,'敵軍活動',[48],'抽牌讀 R#4，查德軍癱瘓組的活動結果。','第 48 號牌的 R#4 是 4，結果為後退。B3 位於地圖頂端，移出癱瘓組。B3 上的其他標記依時序處理。',{remove:[par]}),
      checkpoint(4,24,'火力任務更新','cell','B3','點選 B3，取下上回合留下的來襲標記。','地圖上已無敵軍。友軍的既有 PDF 及相應 VOF 仍在，手冊於此結束逐步示範。',{marks:{B3:[woods,'VOF S 0','交叉火力 −1','集中目標']}}),
      cleanup(4,25,'移除本回合的暴露','第 25 頁讓玩家自行繼續。下一回合的牌號和走法為本網頁教學續局。'),
      draw(5,25,cmd,[12],'教學續局：抽選用的第 12 號牌，計算排部可用命令。','第 12 號牌的鋼盔為 4，加上保留 1 點，共 5 點。',{tracks:{[cmd]:5,[bank]:0,[ini]:0}}),
      move(5,25,cmd,'hq','C2',4,'排部抵達 C2，與 1/1 班同牌。'),
      checkpoint(5,25,cmd,'unit','s1','選取 1/1 班，結算 C2 的停火命令。','花 1 點移除 C2 的 PDF，B3 少一個來向，取下交叉火力修正。',{tracks:{[cmd]:3},marks:{C2:[],B3:[woods,'VOF S 0','集中目標']}}),
      draw(5,25,ini,[2],'教學續局：抽選用的第 2 號牌，計算一般主動點。','左上角的小數字為 4，單排減半後得 2。另將排部剩餘 3 點保留。',{tracks:{[cmd]:0,[bank]:3,[ini]:2}}),
      checkpoint(5,25,ini,'unit','s2','選取 2/1 班，結算 A2 的停火命令。','一個停火命令傳給同牌全部單位。A2 的 PDF 與 B3 剩下的基本 VOF 都可移除。',{tracks:{[ini]:1},marks:{A2:[],B3:[woods,'集中目標']}}),
      move(5,25,ini,'s1','B3',0,'1/1 班占據已無敵軍的中央樹林，完成本課。',{marks:{B3:[woods,'集中目標','已確保']}})
    ]
  };
})();
