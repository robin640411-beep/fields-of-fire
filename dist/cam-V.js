/* Fields of Fire, Vietnam mission book. Printed row 1 is the bottom of the map. */
(() => {
  const books = window.FOF_BOOKS ||= {};
  const ring2 = ['B2','C2','D2','B3','D3','B4','C4','D4'];
  const center8 = ['D1','E1'];
  const ring8 = ['C1','F1','C2','D2','E2','F2'];
  const grades = seq => Array.from(seq, grade => grade === '-' ? null : grade);
  const schedule = (cells, seq) => ({cells, byTurn:grades(seq)});
  const row = (y,cols) => Array.from({length:cols},(_,x) => String.fromCharCode(65+x)+y);
  const patrol = {
    platoons:[1,2,3], freshMap:true, optionalInCampaign:true, awardOnlyParticipants:true,
    reorganizeAfterEach:true, replacementsAfterSeries:true, replacementsEvenIfSkipped:true,
    battalionPhase:false, companyOffMap:true, generalInitiativeDivisor:2,
    radiosPerPlatoon:2, radiosPerStaff:1, mortar60Limit:1, mortar81:false
  };
  const patrolNotes = '第1、2、3排各有一次獨立巡邏。每排重新發地形，分開結算經驗與重建；戰役可跳過個別排。';
  const replacements = {
    beforeReorganization:{removeVeteranSteps:2},
    afterReorganization:{maxGreen:6,returnedVeteransRule:'12.4',replaceOneExperiencedPlatoonHQ:true},
    appliesToSkippedPatrols:true,
    beforeMission4:{campaignOnly:true,fillAllWithGreen:true,rotateExperiencedSteps:10,includeHQIfPossible:true}
  };
  const roster = [
    {id:'CO HQ',name:'連指揮部',steps:1,experience:'green'},
    {id:'CO XO',name:'連副官',steps:1,experience:'line'},
    {id:'CO 1 Sgt',name:'連士官長',steps:1,experience:'veteran'},
    {id:'60mm TM',name:'60公釐迫擊砲小組',steps:1,ammo:4}
  ];
  for (let p=1;p<=3;p++) {
    roster.push({id:p+' PLT HQ',name:'第'+p+'排指揮部',platoon:p,steps:1,experience:p===1?'line':'green'});
    for (let i=1;i<=3;i++) roster.push({id:i+'/'+p,name:'第'+p+'排第'+i+'班',platoon:p,steps:3});
    for (let i=1;i<=2;i++) roster.push({id:i+'/W/'+['1st','2nd','3rd'][p-1],name:'第'+p+'排第'+i+'機槍小組',platoon:p,steps:1,ammo:6});
  }
  const rosterOptions = {
    mortar81:{units:[{id:'81mm Sec',name:'81公釐迫擊砲分隊',steps:3,experience:'line',ammo:4,illumination:2}],pool:{green:13,line:15,veteran:6}},
    fourthPlatoon:{units:[{id:'4 PLT HQ',name:'第4排指揮部',platoon:4,steps:1},{id:'1/4',name:'第4排第1班',platoon:4,steps:2},{id:'2/4',name:'第4排第2班',platoon:4,steps:2}],pool:{green:14,line:18,veteran:7},firstUseAfterMission1:{green:1,line:3,veteran:1}},
    sharedShortages:true,separateExperience:true,mortarMinimumSteps:2
  };
  const arty = {id:'Arty FO',name:'砲兵前進觀測員',steps:1,experience:'line',restoredAfterMission:true,maySpendXP:false};
  const support = {mortar:'迫砲前進觀測員（一般，1階）',fac:'前進空中管制員（一般，1階）',engineer:'工兵班（一般，3階，6點彈藥）',sniper:'狙擊小組（一般，1階）'};
  const limitedLift = count => ({aircraft:'UH-1',count,turn:1,oneLift:true,excludeUntransported:true});
  const basicObjectives = {primaryRow:null,secondaryRow:null,positionRow:null,clearRows:[],waypoints:0};
  const pcRandom = '?';
  const scoreClear = (threshold) => ({type:'clearThreshold',threshold,upTo:1,over:2});
  const scoreMarked = {type:'objectivesAndOriginalPC',primary:5,secondary:4,position:3,otherOriginalA:2,otherOriginalBC:1};
  const hexes8 = [...center8,...ring8];
  const missions = [
    {
      number:1,title:'ALA MOANA 行動，第一部分',page:16,lastPage:19,cols:5,rows:5,mode:'assault',retries:1,
      brief:'以中央著陸區為起點。中央九張地形朝上，其餘在地面算子取得視線時翻開。',
      objective:'肅清至少12張地形牌。', objectives:{clearCount:12},pcRows:Array(5).fill(pcRandom),
      terrainSetup:{centerLanding:'C3',landingCount:1,faceUp:'landingAndNeighbors',revealOnGroundLOS:true},
      pcExceptions:{C3:null},initialLandingCells:['C3'],
      setupNotes:['中央可著陸牌C3放主要LZ，該牌沒有PC；其餘各放一枚混洗的問號PC。','依空中突擊規劃表分波，每波最多4架；首波從進場格開始。'],
      airlift:{waves:[['UH-1',4],['UH-1',4],['UH-1',4],['CH-47',2]],maxPerWave:4},
      attachments:[support.mortar,support.fac],enemy:{side:'VC',tactics:'遲滯防禦',experience:'veteran'},xp:scoreClear(10),
      references:{map:17,fire:18,friendly:18,enemy:18,contact:19,special:19}
    },
    {
      number:2,title:'ALA MOANA 行動，第二部分／Ann Margaret 行動',page:20,lastPage:23,cols:5,rows:5,mode:'defense',
      brief:'在中央與周圍八張牌部署。選兩個步兵班作為場外分遣隊，然後開始月光下的十回合。',
      objective:'第10回合結束時，控制至少6張地形牌。',objectives:{secureCount:6},pcRows:[],
      terrainSetup:{centerLanding:'C3',faceUp:'all'},deploymentCells:['C3',...ring2],movementCells:['C3',...ring2],
      defensePC:[schedule(['C3'],'-CCBBBAAA-'),schedule(ring2,'CCBBBAAA--')],
      visibility:Array(10).fill(2),detachedSquads:2,forts:{foxholesPerRingCard:2,bunkerOnRing:2,bunkerOnCenter:1,claymoreOnOrAdjacentRing:3,artilleryFPF:1},
      setupNotes:['C3須可著陸。友軍僅可部署及移動在C3與其周圍八張環形防線牌。','環形防線每牌最多兩個散兵坑。防線放兩座碉堡，中央放一座。另放三枚闊劍與一枚砲兵FPF。','依第23頁「中央／環形防線」兩列，於敵軍時段配置當回合PC。'],
      attachments:[support.mortar,support.fac,support.engineer],enemy:{side:'VC',tactics:'攻勢輾壓',experience:'line'},
      xp:{type:'zone',securedCells:ring2,securedEach:1,clearCells:['C3'],clearEach:3},
      references:{map:21,fire:22,friendly:22,enemy:22,contact:23,special:23,errata:55}
    },
    {
      number:3,title:'Ho Bo、Bo Loi 林區、古芝',page:24,lastPage:27,cols:3,rows:6,staging:true,mode:'patrol',
      brief:'每個出發的排各領一副新地圖，從出發線後的集結區進場，在自己的十回合內完成巡邏。',
      objective:'肅清第2欄全部6張地形牌（B1至B6）。',objectives:{clearColumns:[2]},pcRows:Array(6).fill(pcRandom),
      patrol:{...patrol}, setupNotes:[patrolNotes,'全部18張地形牌正面朝上，均放問號PC。可在任一牌放1枚校射目標。','略過營HQ時段。連HQ在地圖外，以有效無線電聯絡啟動排HQ與參謀；一般主動權抽卡減半。'],
      attachments:[support.mortar],enemy:{side:'VC',tactics:'遲滯防禦',experience:'line'},
      xp:{type:'patrolColumn',column:2,clearEach:1,success:5},references:{map:26,fire:25,friendly:25,enemy:25,contact:27,special:26}
    },
    {
      number:4,title:'馬蹄形地帶',page:28,lastPage:31,cols:5,rows:4,mode:'assault',
      brief:'從第1排的三張相連著陸牌開始。第4排放兩枚目標標記，第3排放與任一目標相鄰的攻擊位置。',
      objective:'控制第4排主要與次要目標，並肅清第1、2排全部10張牌。',objectives:{primaryRow:4,secondaryRow:4,positionRow:3,clearRows:[1,2]},
      pcRows:['C','B','A','A'],terrainSetup:{exclude:['hill'],landingRows:[1],landingCount:3,landingChoice:'contiguous'},
      airlift:limitedLift(10),attachments:[support.sniper],enemy:{side:'VC',tactics:'遲滯防禦',experience:'veteran'},
      setupNotes:['移除地形1至4號山丘。以五張可著陸牌建立第1排，再混洗剩餘牌建立上方三排。','在第1排選三張連續牌放大型LZ，任一牌放1枚校射目標。未搭上首批10架UH-1的算子本場不參與。','戰役開場先補至滿編，再將10階一般或老兵改為新兵，盡量包含1個HQ。單場遊戲略過。'],
      beforeMission:replacements.beforeMission4,xp:scoreMarked,references:{map:29,fire:30,friendly:30,enemy:30,contact:31,special:31}
    },
    {
      number:5,title:'黃石行動，Bo Tuc－Beauregard 火力支援基地',page:32,lastPage:35,cols:6,rows:4,staging:true,mode:'defense',
      brief:'將主抵抗線放在第2與第3排之間。在其後部署，以月光能見度進行十回合。',
      objective:'第10回合結束時，控制至少6張地形牌。',objectives:{secureCount:6},pcRows:[],visibility:Array(10).fill(2),
      mlrAfterRow:2,deploymentCells:[...row(1,6),...row(2,6)],forts:{foxholesPerRearCard:2,bunkerRear:2,deepBunkerRear:1,claymoreOnRows:[2,3],claymore:3,maxClaymorePerCard:1,artilleryFPF:1,mortarFPF:1},
      defensePC:[schedule(row(1,6),'BAACBAA---'),schedule(row(2,6),'BBAACBAA--'),schedule(row(3,6),'CBBAACBAA-'),{...schedule(row(4,6),'-CBBAACBAA'),requiresMLRAdvance:true}],
      setupNotes:['主抵抗線後每牌最多兩個散兵坑。另放兩座碉堡與一座深層碉堡。','第2、3排放三枚闊劍，每牌最多一枚。砲兵及迫砲FPF各一枚。','第35頁按回合與排別列出PC。主抵抗線因事件前移時，第4排才可能符合。'],
      attachments:[support.mortar,support.fac,support.engineer],enemy:{side:'NVA',tactics:'攻勢突擊',experience:'line'},
      xp:{type:'clearRows',rows:[1,2],clearEach:1},references:{map:33,fire:34,friendly:33,enemy:34,contact:35,special:35}
    },
    {
      number:6,title:'巡邏C戰區，從西寧向北至柬埔寨',page:36,lastPage:39,cols:5,rows:5,mode:'patrol',
      brief:'各排在自己的地圖選出隨機著陸牌與村莊目標。首回合以四架UH-1運入該排。',
      objective:'肅清至少8張地形牌，其中須包括主要目標。',objectives:{clearCount:8,clearPrimary:true},
      pcRows:Array(5).fill(pcRandom),terrainSetup:{randomLanding:true,landingCount:1,randomVillageObjective:true,fallbackObjective:'notAdjacentToLanding'},
      pcSkipLanding:true,airlift:limitedLift(4),patrol:{...patrol,rebuildPlatoonHQByRadio:true},
      setupNotes:[patrolNotes,'隨機一張可著陸牌放主要LZ，該牌不放PC。從村莊牌隨機選主目標；若無村莊，從不與LZ相鄰的其他牌抽選。','每排只使用首批4架運輸機，未搭載的兵力不參與。一般主動權減半，營HQ略過。'],
      attachments:[support.mortar],enemy:{side:'NVA',tactics:'倉促防禦',experience:'line'},xp:{...scoreClear(8),success:5},
      references:{map:37,fire:38,friendly:38,enemy:38,contact:39,special:39}
    },
    {
      number:'7A',title:'TOAN THANG II 行動，Alpha 連',page:40,lastPage:44,cols:5,rows:5,mode:'assault',retries:1,
      brief:'中央牌和兩張隨機相鄰可著陸牌構成三個LZ。翻開這三張與其周圍地形。',
      objective:'肅清至少10張地形牌。',objectives:{clearCount:10},pcRows:Array(5).fill(pcRandom),
      terrainSetup:{exclude:['hill'],centerLanding:'C3',landingCount:3,landingChoice:'randomAdjacentToCenter',swapForLandableIfShort:true,faceUp:'landingAndNeighbors',revealOnGroundLOS:true},
      pcOnLanding:'A',airlift:limitedLift(10),enemy:{side:'NVA',tactics:'倉促防禦',experience:'veteran'},xp:scoreClear(10),
      setupNotes:['戰役第7場選Alpha或Bravo其中一場。第41頁的外側LZ位置是抽選示例，實際每次重新抽。','移除山丘，中央及鄰近兩張可著陸牌放大型LZ。每張LZ放A，其餘放問號PC。','第1回合10架UH-1一次運入；未搭首批者不參與。任一牌可放一枚校射目標。'],
      references:{map:41,fire:42,friendly:42,enemy:42,contact:43,special:44}
    },
    {
      number:'7B',title:'TOAN THANG II 行動，Bravo 連',page:44,lastPage:47,cols:5,rows:5,mode:'assault',
      brief:'第1排著陸，從第4排攻擊位置前往第5排兩個目標。第9回合起改用晨昏能見度。',
      objective:'控制第5排的主要及次要目標。',objectives:{primaryRow:5,secondaryRow:5,positionRow:4},
      pcRows:[null,pcRandom,pcRandom,pcRandom,'A'],pcBags:{2:'ABCCC',3:'ABBCC',4:'ABBBC'},
      terrainSetup:{exclude:['hill','jungle','village','mangrove','gully'],availableAfterExclusions:32,landingRows:[1],landingCount:3,landingChoice:'contiguous'},
      visibility:[0,0,0,0,0,0,0,0,1,1],airlift:{...limitedLift(8),additional:{turn:3,aircraft:'UH-1',count:5,start:'PZ'}},
      vehicles:[{id:'M48',count:4,ammo:6,turn:1},{id:'M48 HQ',count:1,ammo:6,turn:1}],
      setupNotes:['從移除山丘、叢林、村莊、紅樹沼澤及溝谷／水渠後的32張牌建圖。第1排全須可著陸，自選相連三張放LZ。','第2、3、4排各自混洗該排五個PC，不跨排混洗。第5排全放A，第1排留空。','首波8架UH-1，第3回合另有5架進接載區。4輛M48與1輛HQ戰車每輛6點彈藥。'],
      enemy:{side:'NVA',tactics:'遲滯防禦',experience:'veteran'},xp:scoreMarked,contactKey:'row',
      references:{map:45,fire:46,friendly:46,enemy:46,contact:47,special:47}
    },
    {
      number:8,title:'鼴鼠城',page:48,lastPage:53,cols:8,rows:4,mode:'defense',
      brief:'玩家負責底部中央八張牌。依三波回合表放置PC，第9回合從夜間轉為晨昏。',
      objective:'第10回合結束時控制防線六張與中央兩張，共8張指定地形牌。',objectives:{secureCells:hexes8},pcRows:[],
      terrainSetup:{exclude:['hill'],noExpansion:true,innerCells:[...row(1,8).slice(1,7),...row(2,8).slice(1,7),...row(3,8).slice(1,7)],innerDeck:{open:2,ricePaddy:8,elephantGrass:8},outerDeck:{brush:6,rubber:4,bamboo:4}},
      centerCells:center8,perimeterCells:ring8,deploymentCells:hexes8,movementCells:hexes8,
      defensePC:[schedule(center8,'AB--------'),schedule(ring8,'AB-AAAB---')],contactKey:'wave',waveByTurn:[1,1,null,2,2,3,3,null,null,null],
      visibility:[3,3,3,3,3,3,3,3,1,1],excludeFormations:['mortar81','fourthPlatoon'],
      forts:{bunkers:6,deepBunkers:3,trenches:8,claymoresAdjacent:3,registration:2,artilleryFPF:1,wireAroundPerimeter:true,maxFPL:2},mgAmmo:8,platoonHQExtraMGAmmo:4,
      setupNotes:['中央為D1與E1，防線為C1、F1及C2至F2。友軍須留在這八張牌。','內側18張用2開闊地、8稻田、8象草，外側14張用6灌木、4橡膠園、4竹林，各自混洗。地圖不可擴展。','防線或中央共放6碉堡、3深層碉堡、8壕溝。放鐵絲網、3闊劍、2校射目標與1砲兵FPF。','每挺機槍8點彈藥，各排HQ另4點。最多兩挺碉堡內的機槍指定FPL。81公釐分隊及第4排本場不部署。','中央接觸固定組合1；防線按第52頁的第1、2、3波查表。第55頁澄清，FPF成功後逐回合持續至任務結束。'],
      attachments:[support.fac],enemy:{side:'NVA',tactics:'攻勢突擊',experience:'veteran'},xp:{type:'zone',clearCells:hexes8,clearEach:1},
      references:{map:49,fire:50,friendly:51,enemy:51,contact:52,special:53,errata:55}
    }
  ].map(m => ({
    turns:10,staging:false,retries:0,visibility:Array(10).fill(0),attachments:[],
    ...m,id:'VN'+m.number,objectives:{...basicObjectives,...m.objectives}
  }));
  books.V = {
    title:'第9步兵團 · 越南',pages:56,terrain:'VN',missions,
    roster,rosterOptions,commonAttachments:[arty],replacements,
    campaignOrder:[['VN1'],['VN2'],['VN3'],['VN4'],['VN5'],['VN6'],['VN7A','VN7B'],['VN8']],
    rosterNotes:['依第12頁建立連級編制。每次任務選81公釐分隊或第4步槍排，兩者經驗分記，缺員共計。','第1至3排各有1個排HQ、3個三階班及2個一階機槍小組。配屬砲兵觀測員每場自動補回，不能花費經驗點升級。'],
    replacementNotes:['每場結束先移除2階老兵，再重建及升級。之後最多加入6階新兵與規則12.4可返回的老兵。','若有一般或老兵排HQ，須有一個以新兵取代。任務3與6即使全部排跳過，也執行補充。','任務4另有戰役限定補兵與輪調，見第31頁。'],
    commonXP:{uncapturedEnemyCasualty:1,capturedEnemyCasualty:2,successfulCloseGrenade:1,completedStarredHQEvent:1,evacuatedFriendlyCasualty:2},
    rosterPage:12,equipmentPage:13,campaignRulePages:[14,15],errataPage:55
  };
})();

/* Row numbers in the printed R# charts index a single shared event or group. */
(() => {
  const charts = {
    VN1: {
      eventPage: 18,
      enemyPage: 18,
      contactPage: 19,
      friendly: {
        entries: [
          ["戰況報告", "連HQ須花最初3道命令向營部報告。", 1],
          ["通訊故障", "本回合營HQ不啟動連HQ。連HQ須花最初2道命令恢復通訊。", 1],
          ["砲兵轉移陣地", "本回合第11團第7營與第13團第3營砲兵不可用。", 0],
          ["督查", "隨機選1個上級HQ參謀，置於連HQ同一卡，停留2回合。營HQ視為在地圖上（4.1.1）。", 0],
          ["營部要求進展", "本回合須肅清一張新卡。", 1],
          ["營部催促行動", "本回合須肅清兩張新卡。", 1],
          ["戰車支援", "在第1排任意卡放入M48巴頓戰車排（4戰車及1戰車HQ），各6點彈藥。第1戰車HQ命令標記加至命令軌。若已在場，忽略。", 0],
          ["彈藥補給", "可呼叫直升機運來自選單一類型4點彈藥（任務規則2）。", 0],
        ],
        bands: [[2, 4, [0, 0, 0, 1, 1, 2, 4, 4, 5, 5]], [5, 8, [0, 0, 1, 2, 3, 4, 5, 6, 7, 7]], [9, 10, [0, 0, 1, 2, 3, 4, 5, 7, 7, 7]]]
      },
      enemy: {
        entries: [
          ["後送傷亡", "移除地圖上所有無美軍卡牌的傷亡人員。", 0],
          ["迫擊砲轉移", "移除所有無美軍卡牌上的迫擊砲。", 0],
          ["指揮官轉移", "移除所有無美軍卡牌上的指揮官。", 0],
          ["機槍轉移", "移除所有無美軍卡牌上的機槍。", 0],
          ["重整", "地圖上所有受壓制單位嘗試重整，未受壓制的LAT全部升級。", 0],
          ["後撤", "所有未受壓制單位遠離美軍，向最近地圖邊緣移動。", 0],
          ["地道", "所有已肅清／控制卡牌放新PC標記，隨機A／B／C且問號面朝上，中央LZ除外。", 0],
        ],
        bands: [[2, 4, [1, 1, 2, 2, 4, 4, 4, 5, 6, 6]], [5, 8, [0, 1, 2, 3, 4, 4, 5, 5, 6, 6]], [9, 10, [0, 0, 1, 2, 3, 4, 5, 5, 5, 6]]]
      },
      names: ["來襲火力", "狙擊手", "蜘蛛洞", "哨站", "伏擊", "堅固據點", "碉堡群", "指揮碉堡", "機動", "迫擊砲", "詭雷"],
      rolls: {"A": [3, 3, 5, 5, 6, 6, 7, 8, 9, 9], "B": [2, 3, 3, 5, 9, 9, 10, 10, 11, 11], "C": [1, 2, 2, 4, 5, 10, 10, 11, 11, 11]},
    },
    VN2: {
      eventPage: 22,
      enemyPage: 22,
      contactPage: 23,
      friendly: {
        entries: [
          ["戰況報告", "連HQ須花最初3道命令向營部報告。", 1],
          ["通訊故障", "本回合營HQ不啟動連HQ。連HQ須花最初2道命令恢復通訊。", 1],
          ["砲兵通訊問題", "本回合無砲兵。", 0],
          ["彈藥補給", "可呼叫直升機運來自選單一類型4點彈藥（任務規則3）。", 0],
          ["攻擊直升機支援", "可用一個雙機UH-1M武裝直升機分隊（10.8.5）。", 0],
        ],
        bands: [[2, 6, [0, 1, 1, 2, 3, 3, 3, 4, 4, 4]], [7, 10, [0, 0, 0, 1, 1, 1, 2, 2, 4, 4]]]
      },
      enemy: {
        entries: [
          ["後送傷亡", "移除沒有美軍之卡牌上的所有傷亡人員。", 0],
          ["迫砲轉移", "移除沒有美軍之卡牌上的迫擊砲。", 0],
          ["指揮官轉移", "移除沒有美軍之卡牌上的指揮官。", 0],
          ["機槍轉移", "移除沒有美軍之卡牌上的機槍。", 0],
          ["重整", "嘗試重整所有受壓制單位，並升級所有未受壓制LAT。", 0],
          ["後撤", "所有未受壓制單位遠離最近美軍，移向掩蔽與隱蔽值最佳的地形。", 0],
        ],
        bands: [[2, 6, [1, 1, 2, 2, 3, 3, 4, 4, 4, 5]], [7, 10, [0, 0, 1, 1, 2, 3, 3, 4, 5, 5]]]
      },
      names: ["來襲火力", "火力基地", "57公釐無後座力砲", "突擊", "人海衝鋒", "迫擊砲"],
      rolls: {"A": [4, 4, 4, 4, 4, 5, 5, 5, 5, 5], "B": [1, 1, 2, 2, 2, 3, 4, 4, 6, 6], "C": [1, 1, 1, 1, 2, 2, 6, 6, 6, 6]},
    },
    VN3: {
      eventPage: 25,
      enemyPage: 25,
      contactPage: 27,
      friendly: {
        entries: [
          ["戰況報告", "排HQ須花最初3道命令向連部報告。", 1],
          ["通訊故障", "本回合連HQ不啟動HQ或參謀，也不可命令空管。排HQ須花最初2道命令恢復通訊。", 1],
          ["砲兵轉移陣地", "本回合無砲兵。", 0],
          ["迫擊砲另有任務", "本回合無4.2吋迫砲。", 0],
          ["側翼有狀況", "本回合單位不得前進至比最前方美軍更前的新排。", 1],
          ["發現地道", "隨機選一張美軍卡。該卡與全部相鄰卡上的單位，本回合不得離開所在卡，因其調查並炸毀地道入口。", 0],
          ["連指揮部催促行動", "本回合必須將至少一個單位移至新卡牌。", 1],
          ["空中FAC到位", "現在可使用1架FAC O-2。見任務特別規則2。", 0],
          ["戰車支援", "一個M48巴頓戰車排（4輛戰車、1個戰車指揮部）各攜6點戰車彈藥，進入第1橫列任選卡牌。將第1戰車指揮部命令標記放上命令軌；每回合由連指揮部啟動戰車指揮部。", 0],
        ],
        bands: [[2, 5, [1, 2, 2, 3, 3, 4, 5, 6, 6, 7]], [6, 8, [0, 1, 2, 3, 4, 5, 6, 6, 7, 8]], [9, 10, [0, 0, 1, 2, 3, 4, 5, 6, 6, 6]]]
      },
      enemy: {
        entries: [
          ["後送傷亡", "移除地圖上所有無美軍卡牌的傷亡人員。", 0],
          ["迫擊砲轉移", "移除無美軍卡上的迫擊砲。", 0],
          ["指揮官轉移", "移除無美軍卡上的指揮官。", 0],
          ["機槍轉移", "移除無美軍卡上的機槍。", 0],
          ["重整", "地圖上所有受壓制單位嘗試重整，未受壓制的LAT全部升級。", 0],
          ["脫離接觸", "移除無美軍卡上所有未受壓制單位。", 0],
          ["地道", "隨機選三張已肅清但未控制卡，放新PC標記（隨機A／B／C，問號面朝上）。", 0],
        ],
        bands: [[2, 5, [1, 2, 3, 3, 4, 4, 4, 5, 6, 6]], [6, 8, [0, 1, 2, 3, 4, 4, 5, 6, 6, 6]], [9, 10, [0, 0, 1, 2, 3, 4, 5, 5, 5, 6]]]
      },
      names: ["來襲火力", "狙擊手", "蜘蛛洞", "伏擊", "堅固據點", "碉堡群", "指揮碉堡", "機動", "迫擊砲", "詭雷"],
      rolls: {"A": [3, 3, 4, 4, 5, 5, 6, 7, 8, 8], "B": [2, 2, 3, 3, 4, 8, 8, 9, 10, 10], "C": [1, 2, 2, 2, 3, 4, 10, 10, 10, 10]},
    },
    VN4: {
      eventPage: 30,
      enemyPage: 30,
      contactPage: 31,
      friendly: {
        entries: [
          ["戰況報告", "連HQ須花最初3道命令向營部報告。", 1],
          ["通訊故障", "本回合營HQ不啟動連HQ。連HQ須花最初2道命令恢復通訊。", 1],
          ["砲兵轉移陣地", "本回合無砲兵。", 0],
          ["側翼有狀況", "本回合單位不得前進至比最前方美軍更前的新排。", 1],
          ["側翼友軍有困難", "本回合須至少一個單位前進至比最前方美軍更前的新排，減輕友軍壓力。", 1],
          ["營部催促行動", "本回合須至少一個單位移至有PC標記的卡。", 1],
          ["彈藥補給", "可呼叫直升機運來自選單一類型4點彈藥（任務規則3）。", 0],
        ],
        bands: [[2, 6, [0, 1, 1, 2, 3, 4, 5, 6, 6, 6]], [7, 10, [0, 0, 1, 2, 3, 3, 4, 4, 5, 5]]]
      },
      enemy: {
        entries: [
          ["後送傷亡", "移除沒有美軍之卡牌上的所有傷亡人員。", 0],
          ["迫砲轉移", "移除沒有美軍之卡牌上的迫擊砲。", 0],
          ["指揮官轉移", "移除沒有美軍之卡牌上的指揮官。", 0],
          ["機槍轉移", "移除沒有美軍之卡牌上的機槍。", 0],
          ["重整", "嘗試重整所有受壓制單位，並升級所有未受壓制LAT。", 0],
          ["後撤", "所有未受壓制單位直向後方移動一張卡牌。", 0],
          ["地道", "第3、4排全部已肅清／控制卡放新PC標記，隨機A／B／C、問號面朝上。", 0],
        ],
        bands: [[2, 6, [1, 1, 2, 3, 3, 4, 4, 5, 6, 6]], [7, 10, [0, 1, 2, 3, 4, 4, 5, 5, 5, 6]]]
      },
      names: ["狙擊手", "蜘蛛洞", "伏擊", "堅固據點", "碉堡群", "指揮碉堡", "機動", "迫擊砲"],
      rolls: {"A": [2, 2, 2, 3, 4, 4, 4, 5, 5, 6], "B": [1, 2, 2, 2, 3, 3, 4, 7, 8, 8], "C": [1, 1, 1, 1, 2, 2, 3, 4, 8, 8]},
    },
    VN5: {
      eventPage: 33,
      enemyPage: 34,
      contactPage: 35,
      friendly: {
        entries: [
          ["態勢報告", "連指揮部必須先花費3命令點，向營部呈交報告。", 1],
          ["通訊故障", "本回合營部不啟動連指揮部。連指揮部必須先花費2命令點恢復通訊。", 1],
          ["砲兵轉移陣地", "本回合無砲兵。", 0],
          ["迫擊砲另有任務", "本回合無4.2吋迫砲。", 0],
          ["督查", "隨機選1個上級HQ參謀，自動出現在連HQ，停留2回合。營HQ視為在地圖上（4.1.1）。", 0],
          ["攻擊直升機支援", "可用一個雙機UH-1M分隊（10.8.5）。", 0],
          ["彈藥補給", "第1排自選一卡獲任一類型4點彈藥。", 0],
        ],
        bands: [[2, 5, [0, 0, 1, 2, 3, 4, 5, 5, 6, 6]], [6, 10, [0, 1, 2, 3, 4, 5, 5, 6, 6, 6]]]
      },
      enemy: {
        entries: [
          ["後送傷亡", "移除所有無美軍卡上的傷亡人員。", 0],
          ["迫擊砲轉移", "移除無美軍卡上的迫擊砲。", 0],
          ["指揮官轉移", "移除無美軍卡上的指揮官。", 0],
          ["機槍轉移", "移除無美軍卡上的機槍。", 0],
          ["重整", "所有受壓制單位嘗試重整，未受壓制LAT升級。", 0],
          ["後撤", "所有未受壓制單位直向後退一卡。玩家可立即免費執行一次排移動越過MLR，使其前移一排。若MLR因此位於第3、4排間，在第4排上方增加一排。MLR後方不得超過4排。", 0],
        ],
        bands: [[2, 10, [0, 0, 1, 2, 3, 4, 4, 4, 5, 5]]]
      },
      names: ["來襲火力", "火力基地", "無後座力砲小組", "試探", "機動", "人海衝鋒", "迫擊砲"],
      rolls: {"A": [4, 4, 4, 5, 5, 6, 6, 6, 6, 6], "B": [1, 1, 2, 2, 3, 3, 4, 4, 7, 7], "C": [1, 1, 1, 1, 2, 2, 2, 4, 7, 7]},
    },
    VN6: {
      eventPage: 38,
      enemyPage: 38,
      contactPage: 39,
      friendly: {
        entries: [
          ["戰況報告", "排HQ須花最初3道命令向連部報告。", 1],
          ["通訊故障", "連HQ本回合不啟動HQ或參謀，也不可命令空管。排HQ須花最初2道命令恢復通訊。", 1],
          ["砲兵轉移陣地", "本回合無砲兵。", 0],
          ["迫擊砲另有任務", "本回合無4.2吋迫砲。", 0],
          ["督查", "連HQ出現在排HQ同一卡，留在地圖2回合，每回合獲4道命令。", 0],
          ["連部催促行動", "本回合至少一單位須移至新卡。", 1],
          ["空中FAC到位", "現在可使用1架FAC O-2。見任務特別規則2。", 0],
          ["戰車支援", "一個M48巴頓戰車排（4輛戰車、1個戰車指揮部）各攜6點戰車彈藥，進入第1橫列任選卡牌。將第1戰車指揮部命令標記放上命令軌；每回合由連指揮部啟動戰車指揮部。", 0],
        ],
        bands: [[2, 5, [1, 1, 2, 3, 4, 5, 6, 6, 7, 7]], [6, 8, [0, 1, 2, 3, 4, 4, 5, 5, 6, 7]], [9, 10, [0, 1, 1, 2, 2, 3, 4, 5, 5, 5]]]
      },
      enemy: {
        entries: [
          ["後送傷亡人員", "移除地圖上所有無美軍卡牌上的傷亡人員。", 0],
          ["迫擊砲轉移", "移除地圖上所有無美軍卡牌上的迫擊砲。", 0],
          ["指揮官轉移", "移除所有無美軍卡牌上的指揮官。", 0],
          ["機槍轉移", "移除無美軍卡上的機槍。", 0],
          ["重整", "所有受壓制單位嘗試重整，未受壓制LAT升級。", 0],
          ["後撤", "所有未受壓制單位向正後方移動一張卡牌。", 0],
          ["地道", "隨機三張已肅清但未控制卡放新PC標記，隨機A／B／C、問號面朝上。", 0],
        ],
        bands: [[2, 10, [0, 1, 2, 3, 4, 4, 5, 5, 6, 6]]]
      },
      names: ["來襲火力", "狙擊手", "蜘蛛洞", "哨站", "伏擊／據點", "堅固據點", "詭雷", "機動"],
      rolls: {"A": [3, 3, 4, 4, 5, 5, 6, 7, 8, 8], "B": [1, 1, 2, 2, 3, 5, 5, 7, 7, 7], "C": [1, 1, 2, 2, 2, 2, 7, 7, 7, 7]},
    },
    VN7A: {
      eventPage: 42,
      enemyPage: 42,
      contactPage: 43,
      friendly: {
        entries: [
          ["戰況報告", "連HQ須花最初3道命令向營部報告。", 1],
          ["通訊故障", "本回合營HQ不啟動連HQ。連HQ須花最初2道命令恢復通訊。", 1],
          ["督查", "隨機選1個上級HQ參謀，置連HQ同一卡，停留2回合。營HQ視為在地圖上（4.1.1）。", 0],
          ["營部催促行動", "本回合須肅清兩張新卡。", 1],
          ["空管機到站", "可用1架O-2空管機。", 0],
          ["戰車支援", "第1排任意卡進場M48排，4戰車及1戰車HQ，各6點彈藥。第1戰車HQ命令標記加入命令軌。", 0],
          ["彈藥補給", "可呼叫直升機運來自選單一類型4點彈藥（任務規則2）。", 0],
        ],
        bands: [[2, 10, [0, 1, 2, 3, 4, 4, 5, 5, 6, 6]]]
      },
      enemy: {
        entries: [
          ["後送傷亡人員", "移除地圖上所有無美軍卡牌上的傷亡人員。", 0],
          ["迫擊砲轉移", "移除地圖上所有無美軍卡牌上的迫擊砲。", 0],
          ["指揮官轉移", "移除所有無美軍卡牌上的指揮官。", 0],
          ["重機槍轉移", "移除無美軍卡上12.7公釐重機槍。", 0],
          ["重整", "所有受壓制單位嘗試重整，未受壓制LAT升級。", 0],
          ["後撤", "未受壓制單位遠離最近美軍，朝最佳掩蔽與隱蔽地形移動。", 0],
          ["反擊", "在符合以下任一條件的美軍卡放PC A：a）與未揭示PC相鄰；b）與無美軍卡相鄰；c）位於最上排。敵軍戰術改攻勢突擊3回合，含本回合。回合流程不變，PC A使用反擊組合表。", 0],
        ],
        bands: [[2, 10, [0, 1, 2, 3, 4, 4, 5, 5, 6, 6]]]
      },
      names: ["來襲火力", "狙擊手", "蜘蛛洞", "伏擊／據點", "碉堡群", "指揮碉堡", "迫擊砲", "無後座力砲小組", "重機槍小組", "詭雷", "機動", "試探", "火力基地"],
      rolls: {"A": [3, 3, 4, 4, 4, 5, 6, 7, 8, 9], "B": [1, 2, 2, 3, 4, 8, 9, 9, 10, 10], "C": [1, 1, 2, 2, 4, 7, 8, 9, 10, 10], "counterA": [1, 11, 11, 11, 11, 12, 12, 12, 13, 13]},
    },
    VN7B: {
      eventPage: 46,
      enemyPage: 46,
      contactPage: 47,
      friendly: {
        entries: [
          ["戰況報告", "連HQ須花最初3道命令向營部報告。", 1],
          ["通訊故障", "本回合營HQ不啟動連HQ。連HQ須花最初2道命令恢復通訊。", 1],
          ["通訊故障（連戰術網）", "該網不可用，包括啟動排HQ或命令空管。一個排HQ須花2道命令恢復通訊。", 1],
          ["空管機到站", "可用1架O-2（任務規則1）。", 0],
          ["Alpha連呼救", "本回合須至少一單位前進至比最前方美軍更前的新排。", 1],
          ["士官領導", "隨機抽取一項技能，給予隨機選定的一個排。", 0],
          ["砲兵忙於他處", "本回合無砲兵火力任務可用。", 0],
        ],
        bands: [[2, 4, [0, 1, 1, 2, 3, 4, 4, 5, 6, 6]], [5, 7, [0, 1, 2, 3, 3, 4, 4, 5, 6, 6]], [8, 10, [0, 0, 1, 1, 2, 2, 3, 4, 4, 5]]]
      },
      enemy: {
        entries: [
          ["後送傷亡", "移除無美軍卡上的傷亡人員。", 0],
          ["增援", "第3至5排若已移除PC，且卡上並非同時有美軍及VOF，補放PC A。", 0],
          ["重整", "移除敵軍所有受壓制標記。", 0],
          ["重整", "癱瘓或擔架小組全部轉為火力小組。", 0],
          ["機槍彈藥", "在場所有機槍多獲2點彈藥。", 0],
          ["機槍轉移", "移除無美軍卡上的機槍。", 0],
          ["崩潰", "移除所有癱瘓小組，擔架小組全部轉為癱瘓。", 0],
          ["脫離接觸", "移除無美軍卡上所有未受壓制單位。", 0],
        ],
        bands: [[2, 4, [1, 2, 2, 2, 2, 2, 3, 3, 5, 6]], [5, 8, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6]], [9, 10, [0, 0, 1, 1, 2, 3, 4, 5, 6, 7]]]
      },
      names: ["狙擊手", "來襲火力", "詭雷", "RPG／B40小組", "機槍小組", "蜘蛛洞", "機動", "機槍小組", "無後座力砲小組"],
      rolls: {"row2": [1, 1, 1, 1, 2, 2, 2, 3, 7, 8], "row34": [1, 2, 3, 4, 5, 6, 6, 7, 8, 9], "row5": [2, 2, 2, 3, 3, 3, 6, 7, 8, 9]},
    },
    VN8: {
      eventPage: 51,
      enemyPage: 51,
      contactPage: 52,
      friendly: {
        entries: [
          ["戰況報告", "連HQ須花最初3道命令向營部報告。", 1],
          ["通訊故障（營戰術網）", "本回合營HQ不啟動連HQ。連HQ須花最初2道命令恢復通訊。", 1],
          ["通訊故障（連戰術網）", "該網不可用，包括啟動排HQ或命令空管。一個排HQ須花2道命令恢復通訊。", 1],
          ["空管機到站", "可用1架O-2，見任務規則1。", 0],
          ["彈藥補給", "連HQ同一卡放10點機槍彈藥。", 0],
          ["彈藥補給", "每個機槍小組獲得2點彈藥，放在其排指揮部所在卡牌。", 0],
          ["士官領導", "隨機抽取一項技能，給予隨機選定的一個排。", 0],
          ["砲兵忙於另一側", "本回合無砲兵火力任務可用（不適用於最後防護射擊）。", 0],
        ],
        bands: [[2, 4, [0, 1, 1, 2, 3, 3, 4, 5, 6, 7]], [5, 7, [0, 1, 2, 3, 3, 3, 4, 5, 6, 7]], [8, 10, [0, 0, 1, 2, 3, 4, 5, 5, 6, 7]]]
      },
      enemy: {
        entries: [
          ["後送傷亡", "移除無美軍卡上傷亡人員。", 0],
          ["增援", "有秩序良好人海單位的每卡加1班，卡多於可用班時隨機選擇。新單位適用人海規則（8.14）。", 0],
          ["重整", "移除敵軍全部受壓制標記。", 0],
          ["重整", "癱瘓或擔架小組全部轉火力小組。", 0],
          ["機槍彈藥", "在場所有機槍多獲2點彈藥。", 0],
          ["機槍轉移", "移除無美軍卡上的機槍。", 0],
          ["崩潰", "移除所有癱瘓小組，擔架小組全部轉癱瘓。", 0],
          ["脫離接觸", "移除無美軍卡上所有未受壓制單位。", 0],
          ["原表未列此結果", "第51頁的敵軍事件表在第9至10回合沒有列出R10＝9。請依桌上裁定處理並記錄決定。", 0],
        ],
        bands: [[2, 4, [0, 2, 2, 2, 2, 3, 4, 4, 5, 6]], [5, 8, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6]], [9, 10, [1, 1, 2, 3, 4, 5, 6, 6, 8, 7]]]
      },
      names: ["來襲火力", "無後座力砲小組", "重機槍", "RPG／B40小組", "火力基地", "集結", "人海突擊"],
      rolls: {"wave1": [1, 1, 1, 2, 2, 2, 3, 4, 4, 4], "wave2": [4, 5, 5, 6, 6, 6, 7, 7, 7, 7], "wave3": [4, 5, 6, 6, 7, 7, 7, 7, 7, 7]},
    },
  };
  const book = window.FOF_BOOKS.V;
  book.tables = {};
  const expandEvents = data => data.bands.map(([from,to,indices]) => ({
    from,to,rand:10,results:indices.map(index => {
      const [title,text,xp] = data.entries[index];
      return {title,text,xp};
    })
  }));
  for (const [id,chart] of Object.entries(charts)) {
    const contact = {};
    for (const [key,rolls] of Object.entries(chart.rolls)) {
      contact[key] = {rand:10,results:rolls.map(id => ({id,title:chart.names[id-1]}))};
    }
    book.tables[id] = {eventPage:chart.eventPage,enemyPage:chart.enemyPage,contactPage:chart.contactPage,
      friendly:expandEvents(chart.friendly),enemy:expandEvents(chart.enemy),contact};
  }
  book.selectContact = (state,cell,grade) => {
    const data = book.tables[state.id];
    if (!data) return null;
    const {contact} = data;
    if (state.id === 'VN7B') {
      const key = {2:'row2',3:'row34',4:'row34',5:'row5'}[cell.y];
      return contact[key] || null;
    }
    if (state.id === 'VN8') {
      if (cell.y===1 && (cell.x===3 || cell.x===4)) return {fixed:{id:1,title:'來襲火力'}};
      const waves = [0,1,1,0,2,2,3,3,0,0,0];
      return contact['wave'+waves[state.turn]] || null;
    }
    if (grade==='A' && contact.counterA && state.turn<=state.counterUntil) return contact.counterA;
    return contact[grade] || null;
  };
  book.tables.VN8.sourceNotes = [
    '第51頁友軍通訊故障末欄的「410」依同欄其餘數字讀為4/10。',
    '原書與繁中本的第51頁均漏列第9至10回合敵軍事件R10＝9。抽到時顯示此狀況，保留桌上裁定。'
  ];
  book.originalReference = 'https://gmtwebsiteassets.s3.us-west-2.amazonaws.com/FoF_Deluxe/FoF_Deluxe-Vietnam_Campaign.pdf#page=51';
})();

/* Fire-support counters: permitted observers, card draws, mission allowance and VOF.
   null denotes an unavailable table entry. */
(() => {
  const book=window.FOF_BOOKS.V;
  const units={a105:'第11團第7營（105公釐）',a155:'第13團第3營（155公釐／8吋）',m42:'第9團第4營迫砲排（4.2吋）',m81:'合併81公釐迫砲排',air:'空襲',gunship:'攻擊直升機'};
  const artillery=[2,3,2,2,1],mortar=[2,2,3,2,1],air=[3,2,2,2,1];
  const patrolArty=[null,3,2,null,1],patrolMortar=[null,2,3,null,1],patrolAir=[3,2,2,null,1];
  const lightArty=[null,3,null,2,1],lightAir=[3,2,null,2,1],autoFPF=[null,null,null,'auto',null];
  const entry=(asset,ammo,vof,draws,limit)=>({asset:units[asset],ammo,vof,draws,limit});
  const day=(patrol)=>{const a=patrol?patrolArty:artillery,m=patrol?patrolMortar:mortar;
    return [entry('a105','HE',-5,a,5),entry('a105','WP',-4,a,2),entry('a155','HE',-6,a,2),
      entry('m42','HE',-5,m,3),entry('m42','WP',-4,m,2),entry('air','空襲',-7,patrol?patrolAir:air,2)];};
  const night=(extraFPF)=>[entry('a105','HE',-5,artillery,6),entry('a105','照明',null,artillery,6),entry('a105','FPF',-6,autoFPF,'扣該單位HE'),
    entry('a155','HE',-6,artillery,2),entry('m42','HE',-5,mortar,4),entry('m42','照明',null,mortar,6),
    ...(extraFPF?[entry('m42','FPF',-6,autoFPF,'扣該單位HE')]:[]),entry('air','空襲',-7,air,2),entry('gunship','2×H',-3,air,'事件提供')];
  const airAssault=(he,wp,heavy,strike,gunships)=>[
    entry('a105','HE',-5,lightArty,he),entry('a105','WP',-4,lightArty,wp),entry('a155','HE',-6,lightArty,heavy),
    entry('air','空襲',-7,lightAir,strike),...(gunships?[entry('gunship','2×H',-3,lightAir,gunships)]:[])];
  const moleMortar=[null,3,null,3,2];
  const supports={
    VN1:day(false),VN2:night(false),VN3:day(true),VN4:airAssault(5,2,2,2,2),VN5:night(true),VN6:day(true),
    VN7A:airAssault(6,4,6,4,2),VN7B:airAssault(4,1,2,1,0),
    VN8:[entry('a105','HE',-5,lightArty,6),entry('a105','FPF',-5,moleMortar,'不限'),
      entry('a105','照明',null,lightArty,4),entry('a155','HE',-6,lightArty,6),
      entry('m81','HE',-4,moleMortar,6),entry('m81','照明',null,moleMortar,4),
      entry('air','空襲',-7,lightAir,3),entry('gunship','2×H',-3,lightAir,'第2回合起，每回合1次')]
  };
  for(const m of book.missions){
    m.fireSupport={page:m.references.fire,observerOrder:['空管','砲兵觀測員','迫砲觀測員','連HQ','排HQ'],
      battalionFire:!['VN1','VN4','VN5'].includes(m.id),entries:supports[m.id]};
  }
  book.equipment={companyRadio:10,hcSmoke:4,wpSmoke:4,signals:{RSP:1,RSC:1,GSP:1,GSC:1},
    daytimeColorSmoke:{red:2,green:2,yellow:2,purple:2},nightHandFlares:12,nightMortarIllumination:2,nightScopes:4,
    runnerCountAtStart:0,takePrisoners:false,defenseFieldPhoneWire:4};
  book.aircraftCapacity={ 'UH-1':3,'CH-47':12 };
  book.replacements.afterReorganization.casualtiesPerReturningVeteran=4;
  book.replacements.afterReorganization.countAllAttempts=true;
})();
