// Heartbreak Ridge. All grid rows run from the US staging area toward the limit of advance.
(() => {
  const book = {title:'傷心嶺',pages:48,terrain:'H',prefix:'HR',period:'1951 年 8–10 月',
    sourceTitle:'傷心嶺戰役任務書',sourceFile:'Fields_of_Fire_傷心嶺戰役任務書_繁體中文_勘誤澄清整合.pdf',
    reference:{roster:11,equipment:12,experience:12,campaignRules:13},
    phases:['血嶺','傷心嶺','金日成嶺'],
    rosterNotes:'各獨立任務使用第11頁滿編連隊。戰役沿用上一任務結算後的人員與經驗。兩名常設觀測員在任務間自動補回，不能分配經驗點。開局沒有傳令兵。',
    replacementNotes:'任務1、2各補最多2階，任務3後補至滿編，任務4～7各補最多4階。補充兵依規則12.4編入。', 
    ratingNames:{green:'新兵',line:'一般',veteran:'老兵'},
    roster:[],equipment:{HC:4,WP:4,rifleGrenades:6,RSP:1,RSC:1,GSP:1,GSC:1,redSmoke:1,greenSmoke:1,yellowSmoke:1,purpleSmoke:1},
    experience:{clearNonObjective:2,defensiveCardHeld:1,evacuateCasualty:2,successfulPointBlankGrenade:1,success:5,capturedEnemyCasualtyStep:1,prisonerStep:2,clearPillbox:3,rallyParalyzedOrLitter:1,starredEvent:1},
    rules:['地圖只能往前方最多擴一排。所有單位只能橫移或直移一格。','進攻任務的清理階段，依設置圖替沒有美軍單位的牌補回 PC。','迫砲分隊不得自願拆分，任務中已分離的小組不能重組。因命中分離的小組各保留原分隊的彈藥點數。','敵軍接敵、活動與掩蔽以任務表和戰役規則4、6、7判讀。'],
    terrainDeck:'K',terrainFilters:{allow:['Open','Rocky','Brush','Gully Draw'],ridgeExclude:['Gully Draw'],cardIDs:{ridge:[25,42],all:[25,48]},ridgeColumn:2},
    elevationCards:{1:[],2:Array.from({length:11},(_,i)=>'K'+String(i+1).padStart(2,'0')),3:['HBR1','HBR2','HBR3','HBR4'],4:['HBR5','HBR6','HBR7'],5:['HBR8','HBR9','HBR10'],6:['HBR11']},
    movement:'orthogonal',lateralExpansion:false,maxAdditionalRows:1,missions:[]};
  function unit(id,name,experience,steps,ammo=0,radio='',extra={}){
    return {id,name,experience,steps,ammo,radio,...extra};
  }
  const v='veteran',l='line',g='green';
  book.roster.push(unit('CO','連指揮部',g,1,0,'SCR300、SCR536'),unit('XO','連副官',v,1),unit('1SG','連士官長',v,1),
    unit('60mm','60公釐迫砲分隊',l,3,4,'SCR536'),...([v,l,g].map((e,i)=>unit('RCL'+(i+1),'第'+(i+1)+'無後座力砲小組',e,1,3))),
    unit('50cal','.50 口徑重機槍小組',l,1,5));
  for(let p=1;p<=3;p++){
    const sq=p===2?[l,l,g]:[v,l,g];
    book.roster.push(unit('HQ'+p,'第'+p+'排指揮部',p===1?l:g,1,0,'SCR536',{platoon:p}),
      ...sq.map((e,i)=>unit((i+1)+'/'+p,'第'+p+'排第'+(i+1)+'班',e,3,0,'',{platoon:p})),
      unit('1/W/'+p,'第'+p+'排機槍小組',p===2?l:v,1,5,'',{platoon:p}),
      unit('2/W/'+p,'第'+p+'排巴祖卡小組',p===3?g:l,1,3,'',{platoon:p}));
  }
  book.roster.push(unit('ArtyFO','砲兵前進觀測員',l,1,0,'SCR610',{autoReplace:true,xpEligible:false}),
    unit('MtrFO','迫砲前進觀測員',l,1,0,'SCR300',{autoReplace:true,xpEligible:false}));
  const maps=[
    ['983-940','8月29日至30日','232 121 121 232','232','CCC BAB BAB AAA',1,2],
    ['773','8月31日','121 232 232 343','454','CCC BAB BAB AAA',0,2],
    ['983-940','9月1日至5日','121 121 232 121','121','CCC BAB AAA BAB',3,'full'],
    ['894','9月14日','121 232 343 454','565','CCC BAB BAB AAA',0,4],
    ['1024','9月23日至25日','11 11 11 11','11','CC BB BB AA',1,4],
    ['1024','9月26日至28日','121 232 121 121','','--- --- --- ---',0,4],
    ['867','9月29日','121 121 121 121','121','CCC BAB BAB AAA',0,4],
    ['1040','10月10日','121 121 232 121','121','CCC BAB BAB AAA',0,0]];
  const heights=s=>[...s].map(Number);
  const tactical=['縝密防禦','縝密防禦','縝密防禦','縝密防禦','倉促防禦','突擊','倉促防禦','遲滯防禦'];
  const commonSupport=[
    ['105公釐砲兵','高爆',-5,[3,4,3,2],5],['105公釐砲兵','白磷',-4,[3,4,3,2],2],
    ['155公釐砲兵','高爆',-6,[1,3,2,null],2],['4.2吋迫擊砲','高爆',-4,[3,3,4,2],3],
    ['4.2吋迫擊砲','白磷',-4,[3,3,4,2],2],['81公釐迫擊砲','高爆',-3,[3,3,4,2],4],['81公釐迫擊砲','白磷',-3,[3,3,4,2],2]];
  maps.forEach(([hill,date,heightRows,extraRow,pc,retries,reinforcements],index)=>{
    const n=index+1,def=n===6,tanks=n===4||n===7;
    const page=14+4*index,cols=n===5?2:3,turns=def?12:10;
    const primaryChoices=def?[]:n===5?['A4','B4']:[n===8?'B3':'B4'];
    const primaryRow=def?0:n===8?3:4,phase=book.phases[n<=3?0:n<=6?1:2];
    const pcGrid=pc.split(' ').map(row=>[...row].map(x=>x==='-'?null:x));
    const setupNotes=[
      n===5?'洗混開闊地、岩地、灌木和溝谷／凹地，發兩欄四排。全圖高度1。':'先從開闊地、岩地與灌木抽第2欄，再加入六張溝谷／凹地，洗牌後發其餘兩欄。依設置圖將高度牌放在地形牌下方。',
      def?'第2排為主抵抗線。美軍起始放在第1、2排，放置散兵坑、碉堡和兩枚FPF。':'在集結區部署美軍。選一張地形牌放105公釐校射目標，按設置圖放PC及主要目標。',
      '所有單位直移或橫移。地圖左右邊界固定。'];
    let extraAttachments=[];
    if(tanks){
      extraAttachments=Array.from({length:5},(_,i)=>unit(i===0?'TankHQ':'Tank'+i,i===0?'第1戰車排HQ':'第'+i+'戰車',l,1,5,'',{model:'M4A3E8',setup:'tankStaging'}));
      setupNotes.push('在地圖左側放置谷地戰車集結區及五枚戰車算子，指揮顯示表放第1戰車排命令標記。戰車需當回合啟動，只能對第1欄的已發現目標依煙霧信號放基本VOF。');
    }
    if(n===3){extraAttachments=[unit('FAC','空管',l,1,0,'SCR300 空中管制網')];setupNotes.push('加入空管算子，在火力任務表記錄空襲3次。');}
    if(n===5)setupNotes.push('A、B欄之間有稜線。視線只能同排橫越，越過時掩蔽與隱蔽修正另加1。主要目標由玩家選A4或B4。');
    if(def)setupNotes.push('SCR536改用EE8，另有四條電話線。移除彩色煙霧，配發8枚手持照明。第34頁文字稱有四張高度牌，第35頁設置圖顯示六格高於高度1，桌面採設置圖。');
    if(n===7)setupNotes.push('起始為雨。每回合開始查R4，前一刻有雨則加1。結果1～2晴、3雨、4雨加薄霧、5雨加濃霧。下雨時戰車支援不可用。');
    const objective=def?'第12回合結束時，控制第1、2排六張牌中的至少三張。':'第10回合結束時，控制主要目標'+primaryChoices.join(' 或 ')+'。';
    const support=commonSupport.map(([name,mun,modifier,draws,uses],i)=>({name,mun,modifier,draws:{co:draws[0],artyFO:draws[1],mtrFO:draws[2],plt:draws[3],...(n===3?{fac:i<=2?3:2}:{})},uses}));
    if(n===3)support.push({name:'空襲',mun:'凝固汽油彈',modifier:-8,draws:{co:2,artyFO:2,mtrFO:null,fac:3,plt:null},uses:3});
    if(def)support.push({name:'105公釐砲兵',mun:'照明',modifier:null,draws:{co:3,artyFO:4,mtrFO:3,plt:2},uses:5},{name:'81公釐迫擊砲',mun:'照明',modifier:null,draws:{co:3,artyFO:3,mtrFO:4,plt:2},uses:6});
    const mission={id:'HR'+n,tableKey:'HR'+n,number:n,title:(def?'防禦':'進攻')+hill+'高地',date:'1951年'+date,
      phase,page,lastPage:page+3,cols,rows:4,turns,staging:true,mode:def?'defense':'offensive',
      brief:phase+'，1951年'+date+'。'+(def?'本連接防1024高地，面臨夜間反擊。':'本連在'+hill+'高地展開本次任務。'),objective,
      setupNotes,terrain:'H',terrainDeck:'K',terrainFilters:{...book.terrainFilters,ridgeColumn:n===5?null:2},
      pcGrid,pcRows:pcGrid.map(row=>row[1]),heights:heightRows.split(' ').map(heights),extensionHeights:heights(extraRow),
      primaryChoices,objectives:{primaryRow,secondaryRow:0,positionRow:0,clearRows:[],waypoints:0},
      holdCards:def?['A1','B1','C1','A2','B2','C2']:[],holdCount:def?3:0,
      deployRows:def?[1,2]:[0],setupPage:page+1,tablePage:page+2,contactPage:page+3,rulePage:page+3,
      retries,reinforcements,tactics:tactical[index],enemyExperience:n<7?'line':'green',
      visibility:n===2||n===7?2:def?1:0,visibilityName:n===2?'霧':n===7?'雨':def?'晨昏／夜間':'日間',
      maxAdditionalRows:def?0:1,restorePC:!def,orthogonal:true,extraAttachments,support,
      observerMissions:n>=7?2:3,observerDraws:3,enemyMachineGunAmmo:6,registration:def?null:'105公釐砲兵'};
    if(def)Object.assign(mission,{defensePC:['C','B','A',null,'C','B','A',null,'C','B','A',null],
      visibilityByTurn:[1,4,4,4,4,4,4,4,4,4,4,1],defenseMarkerRows:[1,2,3,4],foxholesPerOccupiedCard:1,
      pillboxes:1,mlrRow:2,fpf:['砲兵','迫擊砲'],equipmentOverride:{coloredSmoke:0,handIllum:8,telephoneLines:4,replaceSCR536:'EE8'}});
    if(n===7)mission.weather={die:4,previousRainModifier:1,initial:'rain',outcomes:[0,0,2,3,4]};
    if(tanks)mission.tanks={stagingSide:'left',targetColumns:['A'],requiresSpotted:true,requiresActivation:true,requiresSmoke:true,rainDisables:n===7};
    if(n===5)mission.ridge={columns:['A','B'],allowDiagonalLOS:false,crossingCover:1};
    book.missions.push(mission);
  });
  window.FOF_BOOKS=window.FOF_BOOKS||{};
  window.FOF_BOOKS.H=book;
  const events=[
    {"title":"機槍彈藥","text":"將4點機槍彈藥投送至集結區，放在你選擇的一張卡牌上。","xp":0},
    {"title":"迫擊砲彈藥","text":"將2點迫擊砲彈藥投送至集結區，放在你選擇的一張卡牌上。","xp":0},
    {"title":"無後座力砲／巴祖卡彈藥","text":"將2點無後座力砲及2點火箭彈藥投送至集結區，放在任意選定卡牌上。","xp":0},
    {"title":"熱咖啡","text":"集結區內任意2或3階有限行動小組（LAT）重組成步兵班，前提是有可用步兵班棋子。","xp":0},
    {"title":"戰況報告","text":"連HQ必須花費最初3道命令向營部報告。","xp":1},
    {"title":"勤務隊","text":"從本連抽調2階非癱瘓單位，於本任務剩餘時間置於指揮顯示表上。任務結束後，可依原經驗等級用於重建。","xp":0},
    {"title":"迫擊砲優先支援轉移至其他營","text":"本回合無4.2吋迫擊砲火力任務。","xp":0},
    {"title":"通訊中斷","text":"本回合營HQ不啟動連HQ，連HQ須依主動權行動，並花費最初3道命令恢復通訊。","xp":1},
    {"title":"繼續推進","text":"推進界線向前移一排，沿相同高度擴展地圖，新排放置PC A標記。在第2欄增加次要目標，控制後獲5經驗點。若本事件已發生，重新抽取。","xp":0},
    {"title":"反砲兵射擊","text":"移除所有北韓砲兵與重迫擊砲觀測員。","xp":0},
    {"title":"後送傷亡","text":"移除所有未被美軍占用卡牌上的傷亡人員。","xp":0},
    {"title":"重整","text":"所有非秩序良好的北韓單位嘗試重整。","xp":0},
    {"title":"增援","text":"每張與美軍相鄰且有北韓單位的卡牌增加一個步兵班。若有壕溝，放入壕溝且不暴露。否則在增援卡牌上嘗試滲透（戰役規則6）。","xp":0},
    {"title":"反攻","text":"敵軍戰術改為突擊，持續3回合（含本回合）。所有與北韓單位相鄰且有美軍的卡牌放置PC A標記。反擊期間，所有PC A標記均使用反擊組合表判定接觸。","xp":0},
    {"title":"衝鋒","text":"所有與美軍卡牌相鄰的北韓步兵班及突擊小組，沿所在欄直向移入美軍卡牌，並標示暴露。","xp":0},
    {"title":"通訊中斷","text":"移除所有觀測員。","xp":0},
    {"title":"彈藥補給","text":"所有重機槍獲4點彈藥。","xp":0},
    {"title":"狙擊手","text":"隨機選一張有美軍的卡牌，在能向該卡開火的最遠距離（含貼身距離）放置未發現狙擊手。置於最佳可用掩蔽下。若無掩蔽，置於基本+1掩蔽下。","xp":0},
    {"title":"120公釐迫擊砲（-4 VOF）","text":"在第2欄最前方美軍卡牌放置待執行火力任務。於最大視線距離的基本+1掩蔽下，放置未發現的重迫砲觀測員（有2次火力任務），並放置重迫擊砲目標標記。第2次火力任務抽2張卡。 第2欄最前方友軍在第5排時免放觀測員與目標標記。","xp":0},
    {"title":"122公釐砲兵（-6 VOF）","text":"在第2欄最前方美軍卡牌放置待執行火力任務。於最大視線距離的基本+1掩蔽下，放置未發現砲兵觀測員（有2次火力任務），並放置重砲目標標記。第2次火力任務抽2張卡。 第2欄最前方友軍在第5排時免放觀測員與目標標記。","xp":0},
    {"title":"繼續推進","text":"推進界線向前移一排，沿相同高度擴展地圖，新排放置PC A標記。第5排卡牌觸發的近距離接觸改置於貼身距離。若本事件已發生，重新抽取。","xp":0},
    {"title":"增援","text":"每張與美軍相鄰且有北韓單位的卡牌增加一個步兵班。有壕溝則放入且不暴露。否則在該卡嘗試滲透（戰役規則6）。","xp":0},
    {"title":"狙擊手","text":"隨機選一張有美軍的卡牌，在能向該卡開火的最遠距離（含貼身距離）放置未發現狙擊手。放在最佳可用掩蔽下。若無，置於基本+1掩蔽下。","xp":0},
    {"title":"120公釐迫擊砲（-4 VOF）","text":"在第2欄最前方美軍卡牌放置待執行火力任務。於最大視線距離的基本+1掩蔽下，放置未發現重迫砲觀測員（有2次火力任務），以及重迫擊砲目標標記。第2次火力任務抽2張卡。","xp":0},
    {"title":"122公釐砲兵（-6 VOF）","text":"在第2欄最前方美軍卡牌放置待執行火力任務。於最大視線距離的基本+1掩蔽下，放置未發現砲兵觀測員（有2次火力任務），以及重砲目標標記。第2次火力任務抽2張卡。","xp":0},
    {"title":"無後座力砲／巴祖卡彈藥","text":"將2點無後座力砲及2點火箭彈藥投送至集結區，放在你選擇的一張卡牌上。","xp":0},
    {"title":"砲兵優先支援轉移至第23步兵團","text":"本回合無105或155公釐砲兵火力任務。","xp":0},
    {"title":"清理道路","text":"本回合無戰車支援。","xp":0},
    {"title":"通訊中斷","text":"本回合營HQ不啟動連HQ，連HQ須依主動權行動，並花費接下來3道命令恢復通訊。","xp":1},
    {"title":"後撤","text":"美軍所在卡牌及其相鄰卡牌上的所有非癱瘓單位，直向後退一張卡牌。若從壕溝移至另一壕溝，不標示暴露（5.1.2）。","xp":0},
    {"title":"熱咖啡","text":"集結區內任意2或3階LAT重組成步兵班，前提是有可用步兵班棋子。","xp":0},
    {"title":"繼續推進","text":"推進界線向前移一排，沿相同高度擴展地圖，新排放置PC A標記。在隨機一欄增加次要目標，控制後獲5經驗點。若本事件已發生，重新抽取。","xp":0},
    {"title":"120公釐迫擊砲（-4 VOF）","text":"在最前方美軍卡牌放置待執行火力任務。兩欄最前方單位在同排時隨機選擇。於最大視線距離的基本+1掩蔽下，放置未發現重迫砲觀測員（2次火力任務）及重迫擊砲目標標記。第2次任務抽2張卡。","xp":0},
    {"title":"122公釐砲兵（-6 VOF）","text":"在最前方美軍卡牌放置待執行火力任務。兩欄最前方單位在同排時隨機選擇。於最大視線距離的基本+1掩蔽下，放置未發現砲兵觀測員（2次火力任務）及重砲目標標記。第2次任務抽2張卡。","xp":0},
    {"title":"機槍彈藥","text":"將4點機槍彈藥投送至集結區，放在自選一卡上。","xp":0},
    {"title":"迫擊砲彈藥","text":"將2點迫擊砲彈藥投送至集結區，放在自選一卡上。","xp":0},
    {"title":"無後座力砲／巴祖卡彈藥","text":"將2點無後座力砲及2點火箭彈藥投送至集結區自選卡牌。","xp":0},
    {"title":"後撤","text":"美軍所在卡牌及其相鄰卡牌上的所有非癱瘓單位，直向後退一卡。若從壕溝移至另一壕溝，不標示暴露（5.1.2）。","xp":0},
    {"title":"彈藥補給","text":"所有重機槍獲2點彈藥。","xp":0},
    {"title":"120公釐迫擊砲（-4 VOF）","text":"在隨機一張美軍卡牌放置待執行火力任務。只執行1次，不放觀測員或目標標記。","xp":0},
    {"title":"122公釐砲兵（-6 VOF）","text":"在隨機一張美軍卡牌放置待執行火力任務。只執行1次，不放觀測員或目標標記。","xp":0},
    {"title":"反砲兵射擊","text":"移除所有北韓砲兵觀測員。","xp":0},
    {"title":"120公釐迫擊砲（-4 VOF）","text":"在第2欄最前方美軍卡牌放置待執行火力任務。只執行1次，不放觀測員或目標標記。","xp":0},
    {"title":"122公釐砲兵（-6 VOF）","text":"在第2欄最前方美軍卡牌放置待執行火力任務。只執行1次，不放觀測員或目標標記。","xp":0},
    {"title":"勤務隊","text":"從本連抽調2階非癱瘓單位，於本任務剩餘時間置於指揮顯示表。任務結束後，可依原經驗等級用於重建。","xp":0},
  ];
  const missionTables=[
    {"friendly":[[0,1,2,3,4,5,5,6,7,9],[1,3,3,4,6,6,7,8,8,9]],"enemy":[[10,11,12,13,14,15,16,17,18,19],[10,11,12,13,13,14,14,16,18,19]],"contact":{"A":[1,1,1,1,2,2,3,4,5,7],"B":[1,1,1,2,3,4,5,6,7,7],"C":[1,1,3,4,4,5,5,6,8,8],"counterA":[5,6,9,9,10,10,11,11,11,11],"row5A":[1,1,1,3,3,5,5,5,7,10]},"names":{"1":"壕溝步兵班","2":"堅固據點","3":"壕溝步兵班與狙擊手","4":"機槍","5":"82公釐迫擊砲火","6":"76公釐野戰砲","7":"壕溝突擊小組","8":"詭雷","9":"人海衝鋒","10":"突擊","11":"滲透"}},
    {"friendly":[[0,1,2,3,4,5,5,6,7,9],[1,3,3,4,6,6,7,20,20,9]],"enemy":[[10,11,21,13,14,15,16,22,23,24],[10,11,21,13,13,14,14,16,23,24]],"contact":{"A":[1,1,1,1,2,2,3,4,5,7],"B":[1,1,1,2,3,4,5,6,7,7],"C":[1,1,3,4,4,5,5,6,8,8],"counterA":[5,6,9,9,10,10,11,11,11,11],"row5A":[1,1,1,3,3,5,5,5,7,10]},"names":{"1":"壕溝步兵班","2":"堅固據點","3":"壕溝步兵班與狙擊手","4":"機槍","5":"82公釐迫擊砲火","6":"76公釐野戰砲","7":"壕溝突擊小組","8":"詭雷","9":"人海衝鋒","10":"突擊","11":"滲透"}},
    {"friendly":[[0,1,2,3,4,5,5,6,7,9],[1,3,3,4,6,6,7,8,8,9]],"enemy":[[10,11,21,13,14,15,16,22,23,24],[10,11,21,13,13,14,14,16,23,24]],"contact":{"A":[1,1,1,1,2,2,3,4,5,7],"B":[1,1,1,2,3,4,5,6,7,7],"C":[1,1,3,4,4,5,5,6,8,8],"counterA":[5,6,9,9,10,10,11,11,11,11],"row5A":[1,1,1,3,3,5,5,5,7,10]},"names":{"1":"壕溝步兵班","2":"堅固據點","3":"壕溝步兵班與狙擊手","4":"機槍","5":"82公釐迫擊砲火","6":"76公釐野戰砲","7":"壕溝突擊小組","8":"詭雷","9":"人海衝鋒","10":"突擊","11":"滲透"}},
    {"friendly":[[0,1,25,3,4,26,27,28,8,9],[1,3,3,4,26,27,27,28,8,9]],"enemy":[[10,11,21,29,13,14,15,16,23,24],[11,21,29,29,13,13,14,14,23,24]],"contact":{"A":[1,1,1,1,2,2,3,4,5,7],"B":[1,1,1,2,3,4,5,6,7,7],"C":[1,1,3,4,4,5,5,6,8,8],"counterA":[9,9,9,9,9,10,10,10,10,10],"row5A":[1,1,1,3,3,5,5,5,7,9]},"names":{"1":"壕溝步兵班","2":"堅固據點","3":"壕溝步兵班與狙擊手","4":"機槍","5":"82公釐迫擊砲火","6":"76公釐野戰砲","7":"壕溝突擊小組","8":"詭雷","9":"突擊","10":"滲透"}},
    {"friendly":[[0,1,30,30,4,5,26,6,7,9],[1,30,4,26,26,6,7,7,31,9]],"enemy":[[10,11,21,29,13,15,16,22,32,33],[11,21,21,29,13,15,16,22,32,33]],"contact":{"A":[1,1,1,1,2,2,3,4,5,7],"B":[1,1,1,2,3,4,5,6,7,7],"C":[1,1,3,4,4,5,5,6,8,8],"counterA":[5,9,10,10,10,10,11,11,11,11],"row5A":[1,1,1,3,3,5,5,5,7,10]},"names":{"1":"壕溝步兵班","2":"堅固據點","3":"壕溝步兵班與狙擊手","4":"機槍","5":"82公釐迫擊砲火","6":"76公釐野戰砲","7":"壕溝突擊小組","8":"詭雷","9":"人海衝鋒","10":"突擊","11":"滲透"}},
    {"friendly":[[34,35,36,36,30,30,4,4,7,7],[34,34,35,35,36,30,30,4,7,7],[34,35,36,30,30,30,4,4,7,7]],"enemy":[[11,21,37,37,14,14,15,38,39,40],[11,11,21,21,37,14,14,38,39,40],[11,21,37,37,14,14,15,38,39,40]],"contact":{"A":[2,2,2,2,2,2,2,2,2,2],"B":[3,3,3,3,3,4,4,4,4,4],"C":[1,1,1,1,1,5,5,5,5,5]},"names":{"1":"82公釐迫擊砲火","2":"人海衝鋒","3":"突擊","4":"滲透","5":"火力基地"}},
    {"friendly":[[34,35,2,30,4,26,6,27,7,41],[34,30,4,4,26,6,27,27,7,41]],"enemy":[[10,11,37,14,15,15,38,22,42,43],[10,11,37,37,14,14,15,38,42,43]],"contact":{"A":[1,1,1,1,2,2,3,4,5,7],"B":[1,1,1,2,3,4,5,6,7,7],"C":[3,4,4,5,5,6,8,8,9,9]},"names":{"1":"壕溝步兵班","2":"堅固據點","3":"壕溝步兵班與狙擊手","4":"機槍","5":"82公釐迫擊砲火","6":"76公釐野戰砲","7":"壕溝突擊小組","8":"詭雷","9":"掘壕步兵班"}},
    {"friendly":[[34,35,2,4,44,26,26,6,7,41],[34,35,4,26,6,7,7,8,8,41]],"enemy":[[10,11,37,37,14,15,15,16,42,43],[10,11,37,37,14,14,15,16,42,43]],"contact":{"A":[1,2,3,3,3,4,5,6,6,7],"B":[1,1,1,2,4,4,5,6,7,8],"C":[3,3,3,3,3,5,5,7,7,8],"row5A":[1,2,3,3,3,4,4,7,7,9]},"names":{"1":"壕溝步兵班與指揮官","2":"壕溝步兵班與狙擊手","3":"掘壕步兵班","4":"掘壕突擊小組","5":"機槍","6":"堅固據點","7":"82公釐迫擊砲火","8":"76公釐野戰砲","9":"突擊"}},
  ];
  window.FOF_TABLES=window.FOF_TABLES||{};
  missionTables.forEach((table,i)=>{
    const m=book.missions[i];
    const spans=m.number===6?[[2,4],[5,8],[9,12]]:[[2,6],[7,10]];
    const bands=side=>table[side].map((row,j)=>({from:spans[j][0],to:spans[j][1],rand:10,results:row.map(k=>events[k])}));
    const contact=Object.fromEntries(Object.entries(table.contact).map(([kind,row])=>[kind,{
      rand:10,automatic:m.number===6&&kind==='A',
      results:row.map(id=>({id,title:table.names[id]}))}]));
    window.FOF_TABLES[m.id]={friendly:bands('friendly'),enemy:bands('enemy'),contact,eventPage:m.tablePage,contactPage:m.contactPage};
  });
})();
