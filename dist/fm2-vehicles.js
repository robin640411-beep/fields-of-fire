/* FM2, pp. 17–27. Card IDs form a reproducible web example for the printed
   results. Figures in the manual show terrain faces rather than card IDs. */
(() => {
  'use strict';
  const lessons=window.FOF_LESSONS;
  const piece=(id,art,name,at,steps=1,status='',side)=>({id,art,name,at,steps,status,side});
  const co='連部命令', bankCo='連部保留', pl='第 1 排命令', bankPl='第 1 排保留';
  const tank='戰車指揮部命令', bankTank='戰車指揮部保留', ini='一般主動';
  const ammo88='88 公釐彈藥', ammo75='75 公釐反戰車砲彈藥', ammoIg='75 公釐步兵砲彈藥';
  const rockets='火箭筒彈藥', belt='1/LMG 彈藥', a12='雪曼 12 彈藥', a14='雪曼 14 彈藥', a11='雪曼指揮部彈藥';
  const trench='戰壕',house='堅固建築',cross='交叉火力',fox='散兵坑';
  const vp={turn:1,page:17,phase:'設置'}, steps=[];
  const scene=(turn,page,phase)=>Object.assign(vp,{turn,page,phase});
  const step=(kind,text,detail,props={},effects)=>steps.push({...vp,kind,text,detail,...props,...(effects?{effects}:{})});
  const select=(unit,text,detail,e)=>step('unit',text,detail,{unit},e);
  const move=(unit,at,text,detail,e)=>step('move',text,detail,{unit,at},e);
  const cell=(at,text,detail,e)=>step('cell',text,detail,{at},e);
  const draw=(cards,text,detail,e)=>step('draw',text,detail,{cards},e);
  const choose=(text,options,answer,detail,e)=>step('choice',text,detail,{options,answer},e);
  const tx=(tracks)=>({tracks});
  const sh=(n,at,status='')=>piece('sh'+n,n===11?'sherman':'sherman'+n,n===11?'雪曼 11 戰車指揮部':'M4 雪曼 '+n,at,1,status);
  const gun88=(at)=>piece('g88','de88','德軍 88 公釐砲',at,2);
  const gun75=(at)=>piece('g75','de-75','德軍 75 公釐反戰車砲',at);
  const ig=(at)=>piece('ig','de-ig','德軍 75 公釐步兵砲',at);
  const units=[piece('co','co-hq','連部','B0'),piece('hq','hq','第 1 排部','B0'),
    piece('s1','s1','1/1 班','B0',3),piece('lmg','lmg','1/LMG','B0'),
    sh(11,'A0'),sh(12,'A0'),sh(13,'A0'),sh(14,'C0'),sh(15,'C0'),
    gun75('A3'),gun88('B3'),ig('C3'),piece('rocket','de-at','德軍火箭筒組','C2',1,'未被發現')];

  cell('B3','依第 18 頁設置圖，點選五回合內要確保的目標地形牌。','目標是第三列中央的樹林 B3。圖中已有被發現的敵軍，活動程度從接敵開始。');
  select('rocket','在棋桌上找出放在戰壕內、尚未被發現的算子。','火箭筒組在 C2 的丘陵樹林。三門砲各占一張第三列牌。');
  select('sh11','點選集結區的戰車指揮部，核對第 17 頁的編組。','11 號是指揮車，另外四輛是 12 至 15 號。每輛各有 3 點彈藥，三門德軍砲各有 6 點，火箭筒組 3 點，1/LMG 6 點。');
  choose('本任務要怎麼處理事件與一般主動點？',['雙方照常抽事件，一般主動不調整','雙方跳過事件；一般主動的小數字減半、捨去小數'],1,'兩回合均使用這組任務特例。圖上三個指揮部的命令標記開局都在啟動完成面。');

  scene(1,18,'指揮・啟動');
  select('co','營部啟動哪一枚指揮部？','連部命令標記翻至可用面。');
  draw([9],'為已啟動的連部翻一張牌，讀鋼盔的大數字。','大數字為 5。',tx({[co]:5}));
  select('hq','花 1 點，啟動同在 B0 的第 1 排部。','同牌的連部與排部以目視／口令聯絡。',tx({[co]:4}));
  select('sh11','再花 1 點，啟動 A0 的戰車指揮部。','連部用 SCR300 經營戰術網啟動指揮車。連部剩下 3 點轉入保留。',tx({[co]:0,[bankCo]:3}));
  draw([2],'為第 1 排部抽取可用命令。','排部取得 6 點。',tx({[pl]:6}));
  scene(1,19,'指揮・排部');
  move('lmg','C1','花 1 點，把 1/LMG 移到 C1 村莊。','1/LMG 暴露；C2 至 C1 放單向 PDF，C1 放輕兵器 VOF。',{tracks:{[pl]:5},status:{lmg:'暴露'},marks:{C1:['VOF S'],C2:[trench,'PDF 至 C1']}});
  draw([3,18],'花 1 點，為排部的滲透嘗試翻兩張牌。','牌組中出現滲透圖示，此次跨牌不放暴露。',tx({[pl]:4}));
  move('hq','C1','把剛通過滲透檢定的第 1 排部移至 C1。','排部到達村莊，與 1/LMG 再次同牌。');
  draw([8,6,5,23],'花 1 點，由 1/LMG 連抽四張找 Cover。','這組牌找到掩蔽。依本演練的都市特例，1/LMG 放入堅固建築。',{tracks:{[pl]:3},status:{lmg:'堅固建築、暴露'},marks:{C1:['VOF S',house]}});
  select('hq','花 1 點，把同牌的排部移入剛找到的掩蔽。','排部在村莊內移入堅固建築，標記暴露。',{tracks:{[pl]:2},status:{hq:'堅固建築、暴露'}});
  draw([14],'花 1 點，為 1/LMG 的發現嘗試抽一張找準星。','兩張基本抽牌因目標在掩蔽下減一張。本張沒有準星。',tx({[pl]:1}));
  draw([12],'花最後 1 點鼓舞 1/LMG，再翻一張。','仍未發現 C2 的算子，排部命令用完。',tx({[pl]:0}));
  scene(1,19,'指揮・戰車指揮部');
  draw([10],'為戰車指揮部抽取命令。','鋼盔給 5 點。現在只做啟動，稍後才移動車輛算子。',tx({[tank]:5}));
  for(const n of [12,13,14,15]){
    select('sh'+n,'花 1 點，啟動雪曼 '+n+'。',n===15?'四輛車均已啟動，剩餘 1 點保留。':'放置已啟動標記，車輛留在原牌。',
      {status:{['sh'+n]:'已啟動'},tracks:n===15?{[tank]:0,[bankTank]:1}:{[tank]:16-n}});
  }
  scene(1,19,'指揮・一般主動');
  draw([4],'三個指揮部都已啟動，直接抽一般主動牌。','小數字 4 減半，取得 2 點。',tx({[ini]:2}));
  draw([17],'花 1 點，為 1/LMG 再作一次發現檢定。','抽得準星，移除火箭筒組的未被發現狀態；C1 與 C2 改為雙向 PDF，活動程度為交戰。',{tracks:{[ini]:1,'活動程度':'交戰'},status:{rocket:''},marks:{C1:['VOF S',house,'PDF 至 C2'],C2:[trench,'VOF A','PDF 至 C1']}});
  move('s1','B1','用最後 1 點把 1/1 班移到 B1 果園。','1/1 暴露。第二張來源牌也指向 C2，因此 C2 加上交叉火力。',{tracks:{[ini]:0},status:{s1:'暴露'},marks:{B1:['PDF 至 C2'],C2:[trench,'VOF A','PDF 至 C1',cross]}});
  scene(1,19,'敵軍活動');
  draw([7],'依書例查火箭筒組活動表的隨機值。','本例結果為 1，活動表給「不行動」。依本任務特例，四枚未受壓制的德軍反戰車算子仍啟動。',{status:{rocket:'已啟動',g88:'已啟動',g75:'已啟動',ig:'已啟動'}});
  choose('依本頁澄清，已啟動的敵步兵輪到行動且可進行反戰車射擊時，怎麼處理？',['只保留反應機會','執行反戰車射擊'],1,'活動表和車輛階段是兩個檢查時機。這次無俘虜與撤退，進入車輛階段。');
  scene(1,20,'車輛階段');
  move('sh15','C1','先選雪曼 15，把它移進 C1 村莊。','車輛進入 SLOW 格即停。先結算本牌 VOF，再檢查反應。',{status:{sh15:'已啟動、乘員暴露'},marks:{C2:[trench,'VOF H','PDF 至 C1',cross]}});
  draw([15],'翻牌讀反戰車數字，加到本例牌面的基本修正 +7。','牌值 +7，合計 +14，雪曼 15 未受影響。');
  draw([1,19],'依火箭筒算子的 G!，翻兩張牌找榴彈圖示。','出現圖示，繼續翻一張結算本次反應。');
  draw([46],'本次淨修正 +2，翻牌判讀雪曼 15 的結果。','牌值 0，合計 +2 為撤退。把 15 號移出棋桌；火箭筒彈藥剩 2，放已移動／射擊。',{remove:['sh15'],tracks:{[rockets]:2},status:{rocket:'已移動／射擊'},marks:{C2:[trench,'VOF A','PDF 至 C1',cross]}});
  move('sh14','C1','其餘德軍目前無適用行動，讓雪曼 14 移至村莊。','火箭筒已有已移動／射擊標記。12、13 號在此階段不行動。',{status:{sh14:'已移動／射擊、乘員暴露'},marks:{C2:[trench,'VOF H','PDF 至 C1',cross]}});
  scene(1,20,'雙方戰鬥');
  draw([13,31,51,11],'依序為火箭筒組（0）、1/LMG（+4）、排部（+4）各判讀一次。','結果依序為 PIN、PIN、MISS。網頁示例牌序在此插入重洗牌，抽足三張效果牌後才洗牌。1/LMG 和雪曼 14 各耗一點彈藥。',{status:{rocket:'受壓制、已移動／射擊',lmg:'堅固建築、受壓制、暴露'},tracks:{[belt]:5,[a14]:2}});
  scene(1,21,'清理');
  cell('C1','點 C1 清理本回合標記，核對村莊上的 VOF。','移除暴露、已啟動及已移動／射擊。火箭筒組受壓制，村莊改放全員受壓制 VOF。',{resetStatus:true,status:{rocket:'受壓制',hq:'堅固建築',lmg:'堅固建築、受壓制'},marks:{C1:[house,'VOF P','PDF 至 C2']}});

  scene(2,21,'指揮・啟動');
  draw([17],'跳過事件，啟動連部並抽牌，把新點數加上保留。','新取 4 點，加上 3 點保留，連部可用 7 點。',tx({[co]:7,[bankCo]:0}));
  select('hq','用連部的 EE8 啟動村莊內的第 1 排部。','線路完整；花 1 點，連部剩 6 點。',tx({[co]:6}));
  select('sh11','再以 SCR300 啟動戰車指揮部。','花 1 點，連部將剩下的 5 點保留。',tx({[co]:0,[bankCo]:5}));
  draw([1],'為第 1 排部抽本回合命令。','取得 6 點。',tx({[pl]:6}));
  draw([20,19],'花 1 點為 1/LMG 抽兩張重整牌。','均未出現 Rally，保留受壓制標記。',tx({[pl]:5}));
  draw([16],'花 1 點鼓舞，補抽一張。','再次失敗。',tx({[pl]:4}));
  move('hq','B1','花 1 點，把排部從村莊移到 B1 果園。','排部離開堅固建築，標記暴露。',{status:{hq:'暴露'},tracks:{[pl]:3}});
  move('s1','A2','花 1 點，把 1/1 班由果園移到 A2 農場。','A3 與 B3 各放 PDF 指向 A2。農場放 H、交叉火力；1/1 的 S 指向 B3。',{status:{s1:'暴露'},tracks:{[pl]:2},marks:{A2:['VOF H',cross,'PDF 至 B3'],A3:['PDF 至 A2'],B3:['VOF S','PDF 至 A2'],B1:[],C2:[trench,'VOF H','PDF 至 C1']}});
  scene(2,22,'指揮・排部');
  draw([8,6,28],'花 1 點為果園的排部找掩蔽，翻三張牌。','找到基本掩蔽 +1。排部保留最後 1 點。',{status:{hq:'基本掩蔽、暴露'},tracks:{[pl]:0,[bankPl]:1},marks:{B1:['基本掩蔽 +1']}});
  scene(2,22,'指揮・戰車指揮部');
  draw([18],'抽戰車指揮部命令，加上上回合保留的 1 點。','新取 4 點，共有 5 點。',tx({[tank]:5,[bankTank]:0}));
  for(const [i,n] of [12,13,14,11].entries()){
    select('sh'+n,n===11?'花第 4 點，啟動戰車指揮部自身。':'花 1 點啟動雪曼 '+n+'。',
      n===11?'四枚車輛均已啟動，保留剩餘 1 點。':'放置已啟動標記。',{status:{['sh'+n]:'已啟動'},tracks:n===11?{[tank]:0,[bankTank]:1}:{[tank]:4-i}});
  }
  scene(2,22,'指揮・一般主動');
  draw([4],'抽一般主動牌，依單排規模換算。','4 減半為 2 點。',tx({[ini]:2}));
  draw([3,2,23],'花 1 點為農場的 1/1 班連抽三張找掩蔽。','抽到 Cover，依範例把 1/1 放入堅固建築。',{tracks:{[ini]:1},status:{s1:'堅固建築、暴露'},marks:{A2:['VOF H',cross,'PDF 至 B3',house]}});
  draw([15,14],'花 1 點為 1/1 抽兩張集中射擊檢定。','沒有準星，維持原本的 VOF。',tx({[ini]:0}));
  scene(2,22,'敵軍活動');
  draw([12,11],'依圖先為 88 公釐算子的集中射擊檢定翻兩張牌。','沒有準星，未新增集中射擊。');
  draw([7,10],'再為 A3 的 75 公釐算子翻兩張。','也沒有準星。C3 步兵砲此次沒有可執行的活動表行動。');
  draw([38],'為受壓制的 C2 火箭筒組讀活動表隨機值。','本次讀得 4，結果為後退。');
  move('rocket','C3','依活動表結果將火箭筒組往後移到 C3。','火箭筒組仍受壓制且暴露。撤掉村莊的 P 和 C2 指向村莊的 PDF；村莊算子的箭頭仍指向 C2。',{status:{rocket:'受壓制、暴露'},marks:{C1:[house,'PDF 至 C2'],C2:[trench,'VOF H']}});
  scene(2,22,'車輛階段');
  move('sh14','B1','先把村莊的雪曼 14 移到 B1 果園。','果園在本例未觸發檢定，這次移動可以繼續。',{status:{sh14:'乘員暴露'},marks:{C2:[trench,'VOF P']}});
  move('sh14','A2','延續同一次行動，從果園移進 A2 農場。','農場為 SLOW，移動到此停下。B3 改放 H；依書例，兩門砲的反應順序抽定為 88 公釐先。',{marks:{B3:['VOF H','PDF 至 A2']}});
  scene(2,23,'車輛階段');
  draw([36],'本次淨修正 −2，抽取 88 公釐的反應結果。','牌值 +2，總和 0 為擊毀。14 號換成殘骸，88 公釐彈藥降至 5；結果 0 保有快速射擊資格。',{remove:['sh14'],add:[piece('wreck14','wreck','雪曼 14 殘骸','A2')],tracks:{[ammo88]:5},marks:{B3:['VOF S','PDF 至 A2']}});
  draw([45,9],'14 號車組有兩階，各抽一張，在新兵欄讀第一個字母。','依序為 L、C。在殘骸牌放受壓制擔架組和一階傷亡。',{add:[piece('crew','litter','雪曼 14 車組擔架組','A2',1,'受壓制'),piece('loss14','casualty','雪曼 14 車組傷亡','A2')]});
  move('sh12','B1','接著把雪曼 12 從集結區移入果園。','嵌入本次移動的反應在每張新牌上檢查，本牌沒有反應。',{status:{sh12:'乘員暴露'}});
  move('sh12','A2','讓雪曼 12 繼續進入 A2 農場。','B3 又放上 H。依書例，本次先結算 75 公釐，再結算 88 公釐。',{marks:{B3:['VOF H','PDF 至 A2']}});
  draw([13,5],'依序為兩次反應各翻一張，核對反戰車牌值。','牌值依序 +7、+9，皆未命中。兩砲均放已移動／射擊；75 公釐剩 5，88 公釐剩 4。',{tracks:{[ammo75]:5,[ammo88]:4},status:{g75:'已移動／射擊',g88:'已移動／射擊'}});
  move('sh13','B1','將雪曼 13 移進第一列果園。','13 號結束本次移動。',{status:{sh13:'乘員暴露'}});
  move('sh11','B1','最後將戰車指揮部也移入果園。','車輛階段結束。',{status:{sh11:'乘員暴露'}});
  scene(2,23,'戰鬥・壓制恢復');
  select('lmg','點選現在已沒有 VOF 的 C1 輕機槍組。','解除壓制。C2 的 P 更新為 A。',{status:{lmg:'堅固建築'},marks:{C2:[trench,'VOF A']}});
  select('rocket','點選 C3 也已脫離 VOF 的火箭筒組。','移除它的受壓制標記。',{status:{rocket:'暴露'}});
  scene(2,24,'戰鬥・效果');
  draw([49],'書例的 88 公釐砲已得 HIT。翻命中效果牌，讀一般欄。','第一個字母是 A。原砲剩一階且受壓制，同牌加一枚受壓制的突擊組；88 公釐本回合的 VOF 再耗 1 點彈藥。',{remove:['g88'],add:[piece('g88','de88-reduced','德軍 88 公釐砲（剩一階）','B3',1,'受壓制'),piece('assault','de-assault','德軍突擊組','B3',1,'受壓制')],tracks:{[ammo88]:3}});
  select('s1','按第 24 頁的其餘戰鬥效果，點選這次被壓制的步兵班。','擔架組結果為 MISS，1/1 放 PIN。雪曼 12 及 1/LMG 各耗 1 點彈藥。',{status:{s1:'堅固建築、受壓制、暴露'},tracks:{[a12]:2,[belt]:4}});
  scene(2,24,'清理');
  cell('A2','點 A2 農場，完成第二回合清理並核對任務目標。','移除暴露、已啟動與已移動／射擊；農場基本 VOF 降為 S。書中從此讓玩家自行續玩，B3 尚未確保，第三至五回合沒有指定結果。',{resetStatus:true,status:{hq:'基本掩蔽',lmg:'堅固建築',s1:'堅固建築、受壓制',g88:'受壓制',assault:'受壓制',crew:'受壓制'},marks:{A2:[house,'VOF S',cross,'PDF 至 B3']}});
  lessons.V1={title:'車輛任務一・兩回合範例',pages:'17–24',goal:'完成手冊的兩回合，核對 A2 的算子與彈藥，分辨「完成範例」和「五回合內確保 B3」兩個目標。',
    brief:'依第 18 頁配置。手冊給出抽牌點數、圖示與結果；這裡選用符合的實體牌面，牌號與重洗位置為網頁示例。第三至五回合由原書留給玩家自行決定。',
    backFace:'assets/staging-naktong.webp',backName:'洛東江集結區',layout:{rows:[[0,0,0],[18,11,38],[52,29,24],[19,21,47]],hills:{C2:1}},units,marks:{C2:[trench]},
    tracks:{[co]:0,[bankCo]:0,[pl]:0,[bankPl]:0,[tank]:0,[bankTank]:0,[ini]:0,'活動程度':'接敵',[ammo88]:6,[ammo75]:6,[ammoIg]:6,[rockets]:3,[belt]:6,[a11]:3,[a12]:3,'雪曼 13 彈藥':3,[a14]:3,'雪曼 15 彈藥':3},steps:steps.splice(0)};
  lessons.V1.steps[0].figure={src:'assets/fm2/figure-18.webp',alt:'第 18 頁的車輛任務一初始棋桌'};
  lessons.V1.steps.at(-1).figure={src:'assets/fm2/figure-24.webp',alt:'第 24 頁第二回合清理後的棋桌'};

  const secondUnits=[
    piece('co','co-hq','連部','B1'),piece('hq','hq','第 1 排部','C1'),piece('lmg','lmg','1/LMG','C1'),
    piece('s1','s1','1/1 班','B2',2,'受壓制'),piece('par','paralyzed','美軍癱瘓組','B2',1,'受壓制'),
    sh(11,'B1','已啟動'),sh(12,'A2','已啟動、受壓制'),sh(13,'B1','已啟動'),
    gun75('A3'),gun88('B3'),ig('C3'),piece('old-litter','de-litter','德軍擔架組','C2'),
    piece('m5','m5-enemy','敵方 M5 戰車','C3',1,'已啟動','enemy')
  ];
  const secondMarks={A1:[],B1:['PDF 至 C2'],C1:['PDF 至 C2'],A2:['VOF S'],B2:['VOF H',cross,'PDF 至 B3'],C2:[fox,'VOF H',cross],A3:['PDF 至 A2'],B3:['VOF P',cross,'PDF 至 B2'],C3:['PDF 至 B2']};
  scene(1,25,'初始規則');
  vp.roundLabel='任務設置';
  for(const at of ['A1','B1','C1']){
    cell(at,'點選 '+at+'，在第一列這張地形牌放一枚 PC A。',
      at==='C1'?'任務開局三張第一列牌各有一枚 PC A。':'第一列每張牌各放一枚 A 型潛在接敵標記。',{marks:{[at]:['PC A']}});
  }
  choose('這一任務的 PC 產生接敵時，應取出哪種算子？',['未被發現的火箭筒組','已被發現、帶 5 點彈藥的敵方 M5'],1,'每次接敵在第三列隨機放置一枚敵方 M5。若抽到的第三列牌對車輛為 NO，依手冊改放第二列最左或最右的牌。');
  choose('依任務二的行動組別，哪一組先完成車輛階段？',['雙方的車輛','所有具反戰車能力的步兵'],0,'雙方車輛組完成後才輪到反戰車步兵組。車輛移動途中仍會觸發反應。敵 M5 每回合啟動，不查敵軍活動表。');
  cell('C3','對照第 25 頁，點 C3 載入手冊「幾回合後」的範例局面。','跳至手冊圖示時點。M5 在右上，先前的火箭筒組已成擔架組。這一局面與任務一的第二回合各自獨立。',{add:secondUnits,marks:secondMarks,tracks:{[ammo75]:5,[ammo88]:2,[ammoIg]:1,[a11]:3,'敵 M5 彈藥':5},status:{g75:'已啟動',g88:'已啟動',ig:'已啟動'}});
  steps.at(-1).figure={src:'assets/fm2/figure-25.webp',alt:'第 25 頁的戰車對戰車中盤局面'};

  scene(1,26,'車輛組・雪曼 12');
  vp.roundLabel='手冊中盤';
  select('sh12','選取 A2 有受壓制標記的雪曼 12，宣告移動。','進攻方先行。車輛受壓制仍可採取移動行動。先讀起始牌的 VOF。');
  draw([16],'起始牌對 12 號的淨修正為 +2。翻牌讀反戰車數字。','牌值 +6，合計 +8，未命中。12 號可以離開原牌。');
  move('sh12','B3','將 12 號移到 B3 村莊。','本牌的全員受壓制 VOF 對雪曼無效果。依手冊示例，本次先結算 A3 的 75 公釐砲反應。',{status:{sh12:'乘員暴露、受壓制'}});
  draw([41],'本次反應的淨修正為 −4。翻一張判讀結果。','牌值 +1，合計 −3 為爆燃。12 號換成燃燒殘骸，放兩階傷亡。75 公釐砲耗 1 點彈藥；更新 B2 的 VOF 並移除該牌交叉火力。',{remove:['sh12'],add:[piece('wreck12','burning-wreck','雪曼 12 燃燒殘骸','B3'),piece('loss12a','casualty','12 號車組傷亡（第一階）','B3'),piece('loss12b','casualty','12 號車組傷亡（第二階）','B3')],marks:{B3:[],B2:['VOF S'],C3:['PDF 至 B2']},status:{g75:'已移動／射擊'},tracks:{[ammo75]:4}});
  scene(1,26,'車輛組・敵 M5');
  select('m5','輪到敵方，選取本組唯一可行動的敵方車輛。','依優先序先檢查視線內的美軍戰車；原圖此刻沒有適用對象，改查指揮部所在牌。多條路徑同等時以隨機數決定。');
  move('m5','B2','按手冊的隨機結果，把 M5 由 C3 移入 B2 果園。','先結算新牌上的基本火力量，再檢查美軍反應。',{status:{m5:'乘員暴露'}});
  draw([31],'為進入果園的 M5 結算本牌 VOF，淨修正 +4。','牌值 +3，合計 +7，未命中。');
  select('sh11','點選 B1 的戰車指揮部，登記本次反應。','本例淨修正 +1。');
  draw([46],'為戰車指揮部翻一張，判定 M5 的結果。','牌值 0，合計 +1 為擊毀。M5 換成殘骸，指揮部彈藥降至 2，放置已移動／射擊。',{remove:['m5'],add:[piece('wreck5','wreck','敵 M5 殘骸','B2')],tracks:{[a11]:2},status:{sh11:'已移動／射擊'}});
  draw([15],'為 M5 車組抽一張命中效果牌。','本次車組結果為 L，在果園的殘骸下放受壓制的德軍擔架組。',{add:[piece('m5crew','de-litter','敵 M5 車組擔架組','B2',1,'受壓制')]});
  scene(1,26,'車輛組・雪曼 13');
  move('sh13','C2','把雪曼 13 從墓園移到 C2 教堂。','這枚車輛也要檢查己方算子的基本 VOF。本例合計至少 +6，沒有影響。',{status:{sh13:'乘員暴露'},marks:{C2:[fox,'VOF H',cross,'雪曼 13：VOF A']}});
  draw([2,1,3],'依本例的 G! 反應，為 C3 的步兵砲抽三張找榴彈圖示。','三張內出現榴彈圖示，進入反戰車牌值檢定。');
  draw([6],'淨修正為 0，為此次反應翻牌。','牌值 +8，未命中。步兵砲用掉最後 1 點彈藥，翻為火力組，依規則在下回合後退。',{remove:['ig'],add:[piece('empty-ig','de-fire','耗盡彈藥的德軍火力組','C3',1,'已移動／射擊')],tracks:{[ammoIg]:0}});
  choose('依第 26 頁勘誤，哪一枚算子退至我方視線外時要放未被發現標記？',['只有缺彈標記的正常狀態單位','耗盡彈藥而翻面的火力組'],1,'這項勘誤適用於已翻成火力組的算子。此時火力組仍在 C3，尚未執行下回合的後退。');
  scene(1,27,'車輛階段結束');
  cell('B3','點選雪曼 12 的燃燒殘骸，核對此階段最後一枚砲的狀態。','B3 的燃燒殘骸使 88 公釐算子失去對牌外的視線，無法執行這次射擊；燃燒效果持續至任務結束。');
  choose('車輛階段已結束。書例交代的後續檢查是哪兩項？',['立刻洗牌並開新任務','戰鬥效果步驟結算德軍擔架組，清理時更新 75 公釐反戰車砲的射向'],1,'手冊在此結束示範，沒有提供後續擔架組的抽牌結果或任務勝負。');
  lessons.V2={title:'車輛任務二・戰車對戰車',pages:'25–27',goal:'先設置第一列 PC，再重現第 25 頁中盤到第 27 頁車輛階段結束的棋局。',
    brief:'本課先操作任務設置，再切到獨立的中盤盤例。手冊以「幾回合後」描述時點，未指定回合號。網頁選用符合書中圖示與判定值的固定牌面。',
    backFace:'assets/staging-naktong.webp',backName:'洛東江集結區',layout:{rows:[[0,0,0],[50,55,25],[44,11,54],[53,39,31]],hills:{A2:1,C3:2}},units:[],marks:{},tracks:{},steps:steps.splice(0)};
})();
