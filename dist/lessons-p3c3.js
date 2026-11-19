(() => {
  'use strict';
  const lessons = window.FOF_LESSONS || (window.FOF_LESSONS = {});
  const unit = (id, art, name, at, steps = 1) => ({id, art, name, at, steps});
  const step = (turn, phase, page, kind, text, data, detail, effects) => ({
    turn, phase, page, kind, text, ...data, detail, ...(effects ? {effects} : {})
  });
  const draw = (t, phase, p, cards, text, detail, effects) =>
    step(t, phase, p, 'draw', text, {cards}, detail, effects);
  const move = (t, phase, p, id, at, text, detail, effects) =>
    step(t, phase, p, 'move', text, {unit:id, at}, detail, effects);
  const cell = (t, phase, p, at, text, detail, effects) =>
    step(t, phase, p, 'cell', text, {at}, detail, effects);
  const select = (t, phase, p, id, text, detail, effects) =>
    step(t, phase, p, 'unit', text, {unit:id}, detail, effects);
  const choose = (t, phase, p, text, options, answer, detail, effects) =>
    step(t, phase, p, 'choice', text, {options, answer}, detail, effects);
  const available = '排部可用命令', bank = '排部儲存命令', general = '一般主動命令', activity = '活動程度';
  const pUnits = [
    ['hq','第 1 排部'], ['s1','1/1 班'], ['s2','2/1 班'], ['s3','3/1 班'],
    ['lmg','1/LMG'], ['at','1/AT'], ['fo','迫擊砲觀測員']
  ].map(([id,name])=>unit(id,id,name,'B0', /^s[123]$/.test(id) ? 3 : 1));
  const pMarks = {A1:['PC A'],B1:['PC A'],C1:['PC A'],A2:['PC B'],B2:['PC B'],C2:['PC B'],B3:['樹林丘陵目標']};

  lessons.P3 = {
    title:'潛在接敵', group:'排', pages:'26–33',
    goal:'清除六枚 PC，結算敵軍算子，讓一枚友軍留在沒有敵軍的 B3 樹林丘陵。教材建議約六回合完成；示例使用固定牌結果。',
    units:pUnits, marks:pMarks, steps:[
      select(1,'啟動',28,'hq','點選 B0 的第 1 排部，接受地圖外連部啟動。','七枚友軍起於 B0；第一列三枚 PC A、第二列三枚 PC B。',{tracks:{[activity]:'無接敵','迫擊砲任務':2,[bank]:0}}),
      draw(1,'排部命令',28,[1],'抽已啟動排部的命令牌。','鋼盔為 6，無接敵再加 1。本回合最多花 6 點。',{tracks:{[available]:7}}),
      move(1,'排部命令',28,'s1','A1','將 1/1 從集結區移至 A1。','花 1 點；1/1 暴露。',{status:{s1:'暴露'},tracks:{[available]:6}}),
      move(1,'排部命令',28,'s2','B1','將 2/1 移至 B1。','花 1 點；2/1 暴露。',{status:{s2:'暴露'},tracks:{[available]:5}}),
      move(1,'排部命令',28,'s3','C1','將 3/1 移至 C1。','花 1 點；3/1 暴露。其餘 4 點儲存。',{status:{s3:'暴露'},tracks:{[available]:0,[bank]:4}}),
      draw(1,'一般主動行動',28,[31],'抽一般主動行動命令。','星形為 2；單排演練減半，得到 1 點。',{tracks:{[general]:1}}),
      draw(1,'尋找掩蔽',28,[48,2],'花一般主動命令，為 B1 的 2/1 抽兩張掩蔽嘗試牌。','開闊田野的基本抽牌數是 2。兩張都沒有 Cover，沒有新增掩蔽。',{tracks:{[general]:0}}),
      draw(1,'PC 順序',28,[25],'三張第一列牌都有友軍。抽牌決定先檢查哪一格。','RAND 3 為 2，先檢查中央 B1。'),
      choose(1,'PC A 判定',29,'無接敵時，B1 的 PC A 怎麼判定？',['自動接敵，直接抽組合','抽七張尋找 Contact','延後到下回合'],0,'無接敵欄的 A、B 都是自動。'),
      draw(1,'接敵組合',29,[6],'抽 B1 的 PC A 組合牌，查 RAND 4。','結果 1，放置組合 1 的生效標記，移除 B1 的 PC A。一張有人佔據的牌受影響，活動升至接敵。',{marks:{B1:['來襲 −3（生效）']},tracks:{[activity]:'接敵'}}),
      draw(1,'PC 順序',29,[50],'在 A1 與 C1 之間抽出第二個處理位置。','RAND 2 為 2，選右方的 C1。活動程度已改變，PC A 這次抽 7 張。'),
      draw(1,'PC A 判定',29,[7,8,9,10,11,12,13],'抽滿 C1 的七張牌。教材只指定有 Contact，本組牌號是網頁示例。','第 11 號有 Contact。即使提早出現，也要抽足七張。'),
      draw(1,'接敵組合',29,[30,38],'按順序抽選組合與放置位置。','第 30 號 RAND 4 是 3，選組合 2。B2、C2 符合條件，第 38 號 RAND 2 是 2，將未發現算子放 C2。',{add:[unit('enemy','de-lmg','德軍輕機槍組','C2')],status:{enemy:'未發現'},marks:{C1:['A 火力量'],C2:['PC B','散兵坑','主要射向 C1']},tracks:{[activity]:'交戰'}}),
      draw(1,'PC A 判定',29,[14,16,51,18,19,21],'為 A1 抽五張有效牌，遇到第 51 號繼續翻。教材指定五張都沒有 Contact，此批牌號與重洗位置為網頁示例。','第 51 號不占張數。抽足五張後才把棄牌與牌庫一併重洗，再移除 A1 的 PC；下次抽牌起重新使用整副牌。',{marks:{A1:[]}}),
      draw(1,'B1 戰鬥效果',30,[36,47],'為 B1 的 2/1 依序抽效果與命中結果。','−3 加暴露 −2，查表最低 −4。第 36 號為 HIT，第 47 號的一般經驗欄為 F。拆為兩階班與一階火力組，兩枚都受壓制。',{remove:['s2'],add:[unit('s2','s2','2/1 班（2 階）','B1',2),unit('fire2','fire','2/1 火力組（1 階）','B1')],status:{s2:'2 階・受壓制・暴露',fire2:'受壓制・暴露'}}),
      draw(1,'C1 戰鬥效果',30,[24,23],'為 C1 的 3/1 查 −3，再讀一般經驗欄。','第 24 號為 HIT，第 23 號為 PL。三階拆成癱瘓組、擔架組與剩餘的火力組，全數受壓制。',{remove:['s3'],add:[unit('par3','paralyzed','3/1 癱瘓組','C1'),unit('lit3','litter','3/1 擔架組','C1'),unit('fire3','fire','3/1 火力組','C1')],status:{par3:'受壓制・暴露',lit3:'受壓制・暴露',fire3:'受壓制・暴露'}}),
      cell(1,'清理',30,'B1','在第一回合清理時，點選必須保留來襲標記的格子。','清除暴露，保留壓制。來襲標記到下回合雙方戰鬥階段的火力任務更新才移除。',{status:{s1:'',s2:'2 階・受壓制',fire2:'受壓制',par3:'受壓制',lit3:'受壓制',fire3:'受壓制'}}),
      draw(2,'排部命令',31,[28],'地圖外連部再次啟動排部。抽命令牌，取回儲存命令。','鋼盔 3 加上前回合的 4 點，共 7 點。',{tracks:{[available]:7,[bank]:0}}),
      draw(2,'移動嘗試',31,[50,26],'花 1 點為 1/LMG 抽兩張滲透嘗試牌。','第 26 號有三人圖示。這次移動成功，算子不用加暴露。',{tracks:{[available]:6}}),
      move(2,'移動',31,'lmg','B1','將 1/LMG 放到 B1。','B1 的來襲標記仍在，先保留它。'),
      move(2,'全排移動',31,'hq','A1','以第 1 排部為首，把 B0 的同行單位移至 A1。','全排移動花 2 點；排部、1/AT 和觀測員一起移動並暴露。',{move:{at:'A1',fo:'A1'},status:{hq:'暴露',at:'暴露',fo:'暴露'},tracks:{[available]:4}}),
      move(2,'排部命令',31,'s1','A2','將同在 A1 的 1/1 移至 A2。','花 1 點，儲存餘下 3 點。A2 的 PC B 留到雙方戰鬥階段。',{status:{s1:'暴露'},tracks:{[available]:0,[bank]:3}}),
      draw(2,'一般主動行動',32,[15],'抽一般主動行動命令。','小數字 3 減半、捨去小數，得 1 點。',{tracks:{[general]:1}}),
      draw(2,'發現嘗試',32,[5,20],'用 1 點做發現嘗試，抽兩張尋找準星。','第 5 號有準星。翻開 C2 未發現標記；保留尚未觸發的 PC B，並在 C2 加入交叉火力。',{status:{enemy:''},marks:{C2:['PC B','散兵坑','主要射向 C1','S 火力量','交叉火力']},tracks:{[general]:0}}),
      cell(2,'續玩示例 · 任務更新',33,'B1','教材的指定牌序到此結束。點 B1 結算下一個火力任務更新。','以下使用一組示例牌結果。移除已生效的來襲標記；B1 回復通視。',{marks:{B1:[],C2:['PC B','散兵坑','主要射向 C1','A 火力量','交叉火力']}}),
      draw(2,'續玩示例 · PC B',33,[39,44,46],'A2 現有 1/1 與 PC B。活動為交戰，抽三張。','三張都沒有 Contact。移除 A2 的 PC B。',{marks:{A2:[]}}),
      draw(2,'續玩示例 · 戰鬥效果',33,[3,4,6,1],'按順序為 C1 三枚受壓制單位與 C2 的敵軍算子結算。','C1 的 A −1 與受壓制 +1 抵銷，三張均為 MISS，解除壓制。C2 抽到第 1 號也為 MISS。B1 沒有火力量，在壓制恢復時已解除壓制。',{status:{s2:'2 階',fire2:'',par3:'',lit3:'',fire3:'',hq:'',at:'',fo:'',s1:''}}),
      draw(3,'續玩示例 · 排部命令',33,[22],'啟動排部並讀鋼盔。','得到 4 點，連同儲存的 3 點共 7 點。',{tracks:{[available]:7,[bank]:0}}),
      move(3,'續玩示例 · 排部命令',33,'at','B2','點選 1/AT，再點 B2，保留該格的 PC B。','算子由同格排部下令；花 1 點並標記暴露。',{status:{at:'暴露'},tracks:{[available]:6}}),
      draw(3,'續玩示例 · 一般主動',33,[2],'其餘排部命令儲存至一般經驗的日間上限，再抽一般主動牌。','第 2 號星形 4，單排取得 2 點。',{tracks:{[available]:0,[bank]:6,[general]:2}}),
      move(3,'續玩示例 · 一般主動',33,'s2','C2','用 1 點一般主動，將已解除壓制的兩階 2/1 從 B1 移至 C2。','C2 現在敵我同牌。原本指向 C1 的算子改為同牌結算，C1 解除火力量。',{status:{s2:'2 階・暴露'},marks:{C1:[],C2:['PC B','散兵坑','同牌交戰','交叉火力']},tracks:{[general]:1}}),
      move(3,'續玩示例 · 一般主動',33,'s1','B3','花最後 1 點，將 1/1 由 A2 放到目標 B3。','B3 已有友軍，還要把 B2、C2 的 PC 判定完畢。',{status:{s1:'暴露'},tracks:{[general]:0}}),
      draw(3,'續玩示例 · PC 順序',33,[34],'抽 RAND 2，決定 B2 與 C2 的先後。','結果 2，先檢查 C2。目前由同牌中的雙方結算，只有 C2 這一張有人佔據的牌有火力量，活動降為接敵。',{tracks:{[activity]:'接敵'}}),
      draw(3,'續玩示例 · PC B',33,[7,9,12,13,14],'接敵時 PC B 抽五張，先處理 C2。','沒有 Contact。移除 C2 的 PC B，散兵坑與同牌狀態保留。',{marks:{C2:['散兵坑','同牌交戰','交叉火力']}}),
      draw(3,'續玩示例 · PC B',33,[16,18,19,21,25],'再為 B2 抽五張。','沒有 Contact。六枚初始 PC 全數判定。',{marks:{B2:[]}}),
      draw(3,'續玩示例 · 戰鬥效果',33,[8,49,33],'為同牌雙方分開讀結果。示例依序結算 2/1、敵軍與敵軍的命中效果。','2/1 的結果為 PIN，仍保留兩階。第 49 號使散兵坑組命中；第 33 號一般經驗欄為 C，將該單階算子翻為傷亡。',{remove:['enemy'],add:[unit('deLoss','de-casualty','敵軍傷亡','C2')],status:{s2:'2 階・受壓制',s1:'',at:''},marks:{C2:['散兵坑']}}),
      cell(3,'驗收',33,'B3','點選同時符合「有友軍、無敵軍」的樹林丘陵。','1/1 在 B3，敵軍有效算子已移除，六枚 PC 均已判定。')
    ]
  };

  lessons.P3.brief = '前兩回合依手冊第 28–32 頁操作。第 29 頁兩批抽牌只指定結果，網頁另選符合的牌面，並示範第 51 號重洗時機。第 33 頁起由玩家續玩，本課提供固定抽牌的示例分支；未列出的敵軍活動採用維持現狀的結果。';

  const base = lessons.C2;
  if (!base) throw new Error('連級第三課需先載入第二課。');
  const radioNet = '連戰術網', battalionNet = '營戰術網';
  const communication = [
    select(1,'配置通訊設備',50,'co-hq','在 C0 點選連部，配置兩枚不同網路的無線電。','SCR300 用於地圖外營部與連部。連部還持有 SCR536，可與連戰術網上的算子通訊。',{tracks:{[battalionNet]:'連部：SCR300',[radioNet]:'連部：SCR536'}}),
    select(1,'配置通訊設備',50,'hq','在 B0 點選第 1 排部，配發連戰術網裝備。','第 1 排部取得 SCR536。',{tracks:{'第 1 排部裝備':'SCR536'}}),
    select(1,'配置通訊設備',50,'hq2','在 D0 點選第 2 排部，配發相同網路的裝備。','第 2 排部也取得 SCR536。',{tracks:{'第 2 排部裝備':'SCR536'}}),
    select(1,'配置通訊設備',50,'mtr','點選 C0 的迫擊砲分隊，完成第四部 SCR536 的分配。','本課一般步兵班沒有這項裝備。分隊與連部此時同牌同區，也可用目視／口令。',{tracks:{'分隊裝備':'SCR536'}}),
    cell(1,'通訊圖例',50,'D3','對照手冊的地形圖例。D1 與同一欄哪張第三列丘陵牌之間畫有通訊線？','圖示為 D1 與 D3 對通。高度可使兩部 SCR536 在超過相鄰牌的距離保持視線；這項圖例不移動任務算子。'),
    choose(1,'通訊圖例',50,'同一圖例中的 A3 與 D3 都是丘陵。若其中一端的算子在掩蔽標記下，還能使用 SCR536 嗎？',['可以，兩端都在丘陵','不能，任一端位於掩蔽標記下就無法使用','可以，多花一點命令即可'],1,'丘陵影響視線；掩蔽標記另有獨立限制。地形本身的掩蔽值不等於「位於掩蔽標記下」。'),
    choose(1,'啟動檢查',50,'安排第一回合的啟動。地圖外營部如何聯絡 C0 的連部？',['使用連部的 SCR300','使用 B0 的 SCR536','由 C0 算子相互口令轉達'],0,'營戰術網成立，連部可以被營部啟動。'),
    select(1,'連戰術網檢查',50,'hq','檢查 C0 連部與持有 SCR536 的 B0 排部。點選接收端。','兩者位於不同集結牌；主要集結區各牌互有通訊視線，且算子均未在掩蔽標記下。'),
    select(1,'連戰術網檢查',50,'hq2','點選能以相同連戰術網接收連部命令的另一個排部。','D0 排部的 SCR536 可以接通。通訊允許下令，啟動仍須照常花費命令點。'),
    select(1,'同格通訊',50,'mtr','如果 C0 連部與一個單位同區，哪枚分隊算子也可直接用目視／口令聯絡？','迫擊砲分隊與連部都在 C0 同區。兩者使用此方式時，無須檢查兩張牌間的視線。')
  ];
  const secondTurnCheck = [
    choose(2,'再次檢查營網',50,'第 2 回合開始。連部仍在 C0 並持有 SCR300，地圖外營部能否啟動它？',['能，重新確認營網後進入連部時段','不能，SCR300 只能使用一回合'],0,'這是持續性的裝備。實際局面若失去這部電台，須重新檢查連部能否受到啟動。'),
    choose(2,'再次檢查連網',50,'連部將支付兩點分別啟動 B0 與 D0。哪一種連線符合現在的布局？',['兩排部各以 SCR536 接通 C0，雙方都不在掩蔽標記下','連部直接與每一個離開集結區的步兵班用口令通信','兩排部都與 C0 同格'],0,'兩個排部都通過本回合的通訊檢查。其後四枚步兵班使用一般主動點時，另依一般主動規則處理。')
  ];
  const c3Steps = [...communication];
  let inserted = false;
  for (const original of base.steps) {
    if (!inserted && original.turn >= 2) {
      c3Steps.push(...secondTurnCheck);
      inserted = true;
    }
    if (original === base.steps.at(-1)) {
      c3Steps.push(choose(original.turn,'課程核對',51,'核對連級第三次演練的盤面。八枚 PC 都已移除，唯一在場的敵軍算子已成為傷亡；本次是否達標？',
        ['已達標，兩個排的啟動均已確認通訊，地圖也已清除','必須等十回合用完','必須清空敵軍備用池'],0,'第三次演練完成。本次兩種通訊網均有效，八枚 PC 與全部在場敵軍皆已結算。'));
    } else {
      c3Steps.push({...original});
    }
  }
  if (!inserted) c3Steps.push(...secondTurnCheck);
  lessons.C3 = {
    title:'加入通訊', group:'連', pages:'48–51',
    brief:'依第 50 頁配置無線電並檢查通訊。地形、PC、十回合上限與第 2 次演練相同。手冊未指定第 3 次演練的牌序，後續使用與第 2 次相同的示例牌，可比較加入通訊後的差異。',
    goal:'在通訊成立時啟動所屬單位，於十回合內移除全部敵軍並清除八枚 PC。',
    tracks:{...base.tracks}, units:base.units.map(u=>({...u})),
    marks:Object.fromEntries(Object.entries(base.marks).map(([at,marks])=>[at,[...marks]])),
    steps:c3Steps
  };
})();
