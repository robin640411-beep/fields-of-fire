/* 洛東江戰役任務書。橫列依版面由本方往對面編號。 */
(() => {
  const book = {title:'洛東江', pages:44, terrain:'K', terrainDeck:'K', period:'1950 年 8–9 月',
    sourceTitle:'洛東江戰役任務書',sourceFile:'Fields_of_Fire_洛東江戰役任務書_繁體中文_勘誤澄清整合.pdf',
    reference:{roster:11,equipment:12,experience:12,campaignRules:13}, missions:[]};
  (window.FOF_BOOKS ||= {}).K = book;
  const unit = (id, art, name, steps=1, experience='line', extras={}) => ({id, art, name, steps, experience, ...extras});
  const many = (n, make) => Array.from({length:n}, (_,i)=>make(i+1));
  const gun = (id, art, name, ammo) => unit(id,art,name,1,'line',{ammo});
  const hmg = (n,ammo) => many(n,i=>gun('hmg'+i, i%2?'hmg1':'hmg2','第'+i+'個 .30 重機槍小組',ammo));
  const heavy = () => [...hmg(2,8),gun('hmg50','hmg50','.50 重機槍小組',8)];
  const tanks = (model) => many(5,i=>unit('tank'+i,model==='M26'?'kr-m26':'kr-m4',model+' '+(i===1?'戰車排 HQ':'第'+i+'車'),1,'line',{ammo:6,vehicle:true,command:i===1}));
  const fac = unit('fac','kr-fac','前進空中管制員 FAC');
  const engineer = unit('eng','eng','工兵班',3);
  const trucks = many(10,i=>unit('truck'+i,'truck','第'+i+'輛卡車',1,'line',{vehicle:true}));
  const common = [
    unit('arty-fo','arty-fo','砲兵前進觀測員'),
    unit('fo','fo','迫砲前進觀測員'),
    ...many(2,i=>gun('rcl75-'+i,'kr-rcl75-'+i,'第'+i+'個 75 公釐無後座力砲小組',3)),
    unit('jeep','jeep','無乘員吉普車',1,'line',{vehicle:true,uncrewed:true})];
  book.commonAttachments=common;
  book.roster = [
    unit('co-hq','co-hq','連指揮部'),unit('co-xo','co-xo','連副官'),unit('first-sgt','first-sgt','連士官長',1,'veteran'),
    ...many(2,i=>unit('runner'+i,'runner'+i,'第'+i+'傳令兵',1,'line',{reserve:true})),
    ...many(3,i=>gun('rcl57-'+i,'kr-rcl57-'+i,'第'+i+'個 57 公釐無後座力砲小組',3)),
    unit('mtr','mtr','60 公釐迫砲分隊',3,'line',{ammo:4}),
    ...many(3,p=>[
      unit(p===1?'hq':'hq'+p,p===1?'hq':'hq'+p,'第'+p+'排指揮部',1,'green',{platoon:p}),
      ...many(3,s=>{const id=(p===1?'':'p'+p)+'s'+s;return unit(id,id,'第'+p+'排第'+s+'班',3,'line',{platoon:p,rifle:true});}),
      unit('mg-'+p,'kr-mg-'+p,'第'+p+'排機槍小組',1,'line',{platoon:p,ammo:4}),
      unit('baz-'+p,'kr-baz-'+p,'第'+p+'排巴祖卡小組',1,'line',{platoon:p,ammo:3})]).flat()];
  book.rosterNotes=['第11–12頁｜三個步槍排各有新兵排部、三個一般步兵班及兩個武器小組。每次任務開始可把連屬迫砲及無後座力砲配給步槍排。傳令兵起始在連部裝備格。','第12頁｜常設配屬的兩名觀測員、兩個75公釐小組不分配經驗，任務間補回損失。吉普車起始無乘員。'];
  book.replacementNotes=['第13、19頁｜任務1結束後最多補8階美軍。','第36、39–40頁｜任務6前可獲最多12階韓籍增援兵，存活者沿用至任務7結束。各排步兵班總計上限9階，全連上限27階。韓籍小組只能重組韓籍班，不能重組排部或晉升老兵。'];
  book.equipmentNotes=['第12–13頁｜6部 SCR536、HC與白磷煙各4、各排一枚可用兩次的槍榴彈、紅綠星光傘與星光簇各1。','第12–13頁｜紅、綠、黃、紫煙各1，整場夜間不得使用。有低能見度回合時手持照明8。進攻及防禦任務可將連戰術網換為 EE8 電話並取4條線，連部另可選用營戰術網電話。'];
  book.experienceNotes=['第12頁｜進攻：控制主要5、次要4、攻擊陣地3。肅清其他原有 A 級 PC 牌各2、B 或 C 級各1。','第12、23頁｜巡邏：肅清主要目標5；第3、4列其他已肅清牌每張1；完成巡邏5。經驗歸本次巡邏排。','第12頁｜防禦：最終控制的每張牌1，再加第1、2列每張肅清牌1。擊毀或燒毀敵卡車每輛2。','第12頁｜各型任務：擊毀或燒毀敵戰車／突擊砲4，俘虜每階2，俘虜敵傷員每階1，同卡榴彈判定成功1，當回合完成星號事件1，成功後送友軍傷員每名1。'];
  book.rules=['第13頁｜反擊事件維持3回合，當回合算第一回合。美軍所在牌若在頂列、相鄰未翻開PC，或相鄰無美軍的牌，依8.2.3換上PC A。其間A級用反擊表。','第13頁｜遇班滲透組合時，以經驗修正基礎2張行動卡。成功把算子放在指定牌上最好的空掩蔽內，失敗放在掩蔽外並標暴露。','第13頁｜60公釐分隊不可在任務中自願拆編或合併。損失造成拆編時，各小組保留原分隊的彈藥數值。','第13–14頁｜基準高度1，每層高地及堤岸各加1。村莊掩蔽抽R5：1–2堅固建築+3，3–4輕型建築+2，5基本+1。指定在掩蔽外的接敵組合跳過建築判定。','第14頁｜深層碉堡依碉堡處理，內部算子不能產生VOF、觀測、放信號或執行榴彈行動；內外位置不改變視線。'];
  const offensive = (clearRows,secondaryRow=5,positionRow=4) => ({primaryRow:5,secondaryRow,positionRow,clearRows,waypoints:0});
  const patrol = {primaryRow:4,secondaryRow:null,positionRow:null,clearRows:[],waypoints:4,waypointRows:[3,4],returnFromRow:3,returnToRow:2};
  const noObjectives = () => ({primaryRow:0,secondaryRow:0,positionRow:0,clearRows:[],waypoints:0});
  const mission = (number,title,page,lastPage,cols,rows,turns,mode,extra) => {
    const dates=['8 月 8 至 18 日','8 月 27 至 30 日','8 月 31 日至 9 月 1 日','9 月 1 至 2 日','9 月 3 日','9 月 16 至 19 日','9 月 21 至 27 日'];
    const m={id:'K'+number,number,title,page,mapPage:page+1,lastPage,cols,rows,turns,staging:true,mode,terrain:'K',date:'1950 年 '+dates[number-1],campaign:'洛東江',retries:0,visibility:0,...extra};
    m.enemy={side:'NKPA',tactics:['倉促防禦','倉促防禦','進攻蹂躪','進攻蹂躪','倉促防禦','周密防禦','遲滯防禦'][number-1],experience:number===1?'veteran':number===7?'green':'line'};
    m.visibilityByTurn=m.attemptVisibility?.[0]||Array(turns).fill(m.visibility);
    m.attachments=[...common, ...(extra.attachments||[])].map(o=>({...o,autoReplace:true,xpEligible:false}));
    book.missions.push(m);
  };
  const bothGoals='控制第5列兩張不同的目標牌。攻擊陣地放第4列，須與其中一張目標相鄰。';
  mission(1,'三葉草高地之戰',15,19,5,5,6,'offensive',{
    brief:'8月8日至18日。四次嘗試各有自己的回合表及能見度。',
    objective:'控制 C5 主要目標、C4 次要目標，並肅清第1至3列。C3 為攻擊陣地。',
    objectives:offensive([1,2,3],4,3),fixedObjectives:{primary:'C5',secondary:'C4',position:'C3'},pcRows:['C','B','B','A','A'],
    retries:3,attemptTurns:[6,10,10,10],attemptVisibility:[[0,0,0,0,1,4],[0,0,0,0,0,0,0,1,4,4],Array(10).fill(2),[0,0,0,0,0,0,0,1,5,5]],
    attemptExperience:['veteran','veteran','line','green'],replacements:8,revealFromStaging:true,
    scheduledEvents:[{attempt:2,turn:7,side:'enemy',event:'counter'}],
    attachments:[unit('hmg-hq','kr-hmg-hq','重機槍排 HQ',1,'green',{ammo:6,command:true}),...hmg(4,6)],
    setupNotes:['第15–16頁｜地形背面朝上，翻開集結區可見的牌。牌桌正中由近至遠依序為 C3 攻擊陣地、C4 次要目標、C5 主要目標。','第15頁｜重試時在兩張不同已控制牌上分配工事：一張新增兩個散兵坑（若可用），另一張新增一座深層碉堡。','第15、18–19頁｜第二次嘗試第7回合的敵軍HQ階段直接發生反擊，接著兩回合仍照反擊狀態結算。第三次全程日間降雨。','第17–19頁｜重機槍排HQ也能命令已配屬其他排的重機槍。友軍事件加入的.50小組只歸重機槍排HQ，本次嘗試結束即歸還。']});
  mission(2,'固守洛東江防線',20,23,8,4,8,'patrol',{
    brief:'8月27日至30日。三個排依序使用同一張月光地圖巡邏。',
    objective:'每排各巡邏一次。由第2列出發，造訪第4列主要目標，依序走過四個路線點，最後從第3列跨回第2列。',
    objectives:patrol,pcRows:[null,null,'?B/C','?A/B'],visibility:2,patrols:3,patrolStartRow:2,waypointRows:[3,4],mlr:2,generalInitiativeDivisor:2,attachments:heavy(),
    setupNotes:['第20–21頁｜第2列每牌可置至多兩個散兵坑。主要目標放第4列，四個路線點分置第3、4列不同牌，可有一點與主要目標重疊。另選一張牌放砲兵校射目標（7.16.5）。','第23頁｜未巡邏單位可留第1列接令，但不能主動移動或晉升。一般主動權張數結果除以2、無條件捨去。','第23頁｜每次巡邏後依3.9整理地圖、補回PC並登記該排XP。下次巡邏保留技能。戰役巡邏失敗不另罰；生存者模式仍須檢查連HQ。','第23、27頁｜第三次巡邏後把同一地圖交給任務3；移除第4列巡邏時找到的掩蔽，保留其他掩蔽及全部散兵坑。']});
  const schedule = rows => Object.fromEntries(rows.map((line,i)=>[i+1,line.split(' ').map(v=>v==='-'?null:v)]));
  mission(3,'北韓人民軍渡江攻勢，第一階段',24,27,8,4,12,'defense',{
    brief:'8月31日至9月1日。回到任務2地圖，在月光下防守12回合。',objective:'結束時控制主抵抗線後方16張牌中的至少6張。',
    objectives:noObjectives(),pcRows:[null,null,null,null],visibility:2,carryMapFrom:2,carryMap:{from:2,keep:'terrain,foxholes,cover',dropDiscoveredCoverRows:[4]},attachments:heavy(),
    defense:{mlr:2,required:6,foxholes:26,pcSchedule:schedule(['C C B B A A C C B B A A','C B B A A C C B B A A -','B B A A C C B B A A - -','- A A C C B B A A - - -'])},
    setupNotes:['第24–25、27頁｜戰役沿用任務2地形及散兵坑。獨立任務另抽地形。主抵抗線在2、3列間，第1、2列分配26個散兵坑，每牌至多2個。','第24、26頁｜在觀測員或連部視線內的未占據牌放砲兵及迫砲FPF各一。使用FPF扣對應HE任務。','第26–27頁｜PC在敵軍攻擊階段按回合時程表放置；主抵抗線隨事件移動，使用相對橫列。']});
  mission(4,'北韓人民軍攻勢，第二階段',28,31,6,4,10,'defense',{
    brief:'9月1日至2日。另抽六欄的新地圖，在日間維持主抵抗線。',objective:'結束時控制主抵抗線後方12張牌中的至少6張。',
    objectives:noObjectives(),pcRows:[null,null,null,null],attachments:heavy(),
    defense:{mlr:2,required:6,pcSchedule:schedule(['C C B B A A C B A A','C B B A A C B A A -','B B A A C B A A - -','- A A C B A A - - -'])},
    setupNotes:['第28–29頁｜主抵抗線在2、3列間。第1、2列每牌可置至多2個散兵坑。在觀測員或連部可見的空牌放砲兵FPF一枚。','第30–31頁｜使用任務4的攻擊時程；每次接敵以觸發牌所在直欄查R5方向表。卡車乘員依10.8.1放標記，在敵軍活動檢查或事件階段留車上，卡車被擊毀才下車。']});
  mission(5,'布萊德利特遣隊反擊',32,35,5,5,10,'offensive',{
    brief:'9月3日。雪曼戰車排加入本連，只有一次進攻機會。',
    objective:bothGoals+'肅清第1至4列。',objectives:offensive([1,2,3,4]),pcRows:['C','B','B','A','A'],
    attachments:[...tanks('M4A3E8'),...hmg(2,8)],
    setupNotes:['第32–33頁｜選主要、次要目標及相鄰的攻擊陣地，另可選一張牌放砲兵校射目標。將戰車排HQ命令標記放在指揮顯示表。','第34–35頁｜本場可使用營級砲兵任務。反擊事件出現時使用本任務的反擊A級表。']});
  mission(6,'201高地之戰',36,39,4,5,10,'offensive',{
    brief:'9月16日至19日。第四橫列全部是高地，上面各疊一張地形。',
    objective:bothGoals+'肅清第1、2列。',objectives:offensive([1,2]),pcRows:['C','B','A','A',null],retries:2,hillRows:[4],katusa:{replacementMax:12,standalone:['green','green']},
    attachments:[fac,...tanks('M26'),engineer,...hmg(2,6)],
    setupNotes:['第36–37頁｜第四列四個位置都先鋪高地、再疊隨機地形。第五列起始沒有PC。可加砲兵校射目標，另在指揮表放戰車排HQ標記。','第36、39頁｜獨立任務任選兩班改為新兵韓籍增援兵。戰役以新兵補缺最多12階，每排步兵上限9階。可組成2或3階韓籍班、火力或突擊小組。','第38–39頁｜新增側翼地形事件也擴大第1、2列的肅清範圍。本場若抽到指定的接敵組合，敵方算子放置在戰壕內。韓籍部隊的編制與晉升限制持續至任務7。']});
  mission(7,'渡過洛東江突圍',40,43,5,5,10,'offensive',{
    brief:'9月21日至27日。此役沿用韓籍增援兵，有工程、車輛及空中支援。',
    objective:bothGoals+'肅清第1、2列。',objectives:offensive([1,2]),pcRows:['C','C','B','B','A'],retries:2,katusa:{carryFrom:6,standalone:['green','line']},
    attachments:[fac,...tanks('M4A3E8'),engineer,...trucks,...many(2,i=>unit('quad'+i,'kr-quad','第'+i+'輛四聯裝 .50 半履帶車',1,'line',{ammo:6,vehicle:true})),...hmg(2,8)],
    setupNotes:['第40–41頁｜獨立任務任選兩個步兵班換為韓籍班，一班新兵、一班一般。戰役沿用任務6剩餘的韓籍棋子及其經驗。','第40、42–43頁｜指揮表加戰車排HQ標記。查任務7專用接敵表，敵軍為新兵，使用遲滯防禦。側翼事件新抽的地形也計入第1、2列目標。']});
  const event = (title,text,xp=0) => ({title,text,xp});
  const events = {
    report:event('戰況報告','連部本回合先花3道命令交報告。',1),
    radio:event('通訊故障','營部本回合不能啟動連部；連部可靠主動權行動，先花2道命令恢復通訊。',1),
    hmg:event('.50 重機槍抵達','把一般.50小組和6點彈藥放集結區，只受重機槍排部指揮，本次嘗試結束後移除。'),
    inspector:event('督查','隨機選上級HQ算子與連部同牌，保留2回合；期間視同營部在場。'),
    artillery:event('砲兵暫停','本回合不能使用第15野戰砲兵營的支援。'),
    mortar:event('迫砲排暫停','本回合不能使用營屬81公釐迫砲支援。'),
    advancePC:event('營部催促行動','使至少一個算子進入比現有最前列更前、帶PC的橫列。若已在第5列或無可到達的PC，忽略。',1),
    advance4:event('營部催促行動','使至少一個算子進入比現有最前列更前、帶PC的橫列。若已在第4列或無可到達的PC，忽略。',1),
    heat:event('酷熱','降雨時忽略。否則直到下一回合結束，每次算子受暴露標記時抽R4，結果1將一階改為傷亡。'),
    supply:event('彈藥補給','第1橫列自選一牌，增加同一種類的4點彈藥。'),
    lost:event('黑暗中迷路','隨機選巡邏隊一個算子，往隨機方向移一格並加暴露。若超界則抽地形並按橫列補PC；第5列在A與B中隨機選。'),
    waypoint:event('連部催促巡邏','令至少一個算子往下一個未到的路線點移動。若四點皆已到，忽略。',1),
    rain:event('降雨','本回合能見度加2，視為低能見度。清理時移除降雨標記。'),
    evac:event('後送傷員','移除沒有美軍算子之牌上的全部傷亡算子。'),
    removeMortar:event('迫擊砲轉移','移除沒有美軍算子之牌上的敵軍迫砲。'),
    removeLeader:event('指揮官轉移','移除沒有美軍算子之牌上的敵軍指揮官。'),
    removeMG:event('重機槍轉移','移除沒有美軍算子之牌上的敵軍重機槍。'),
    removeTank:event('戰車轉移','移除全部敵軍戰車算子。'),
    rally:event('重整','為敵軍每一個受壓制算子檢查重整，未受壓制的有限行動小組升級。'),
    retreat:event('後撤','未受壓制的敵軍步兵算子往正後方移一張牌。'),
    patrolRetreat:event('後撤','未受壓制的敵軍算子往正後方移一張牌。'),
    counter:event('反攻','換置PC A並從本回合起使用反擊組合表3回合，放標記提醒結束回合。見第13頁。'),
    shift:event('防線變動','第4列未結算的PC重新從A、B、C隨機抽取，以問號面朝上放回。'),
    pullMLR:event('側翼空虛','MLR向本方退一列。若到第1、2列之間，在第1列下新增一列。未壓制友軍後退一列，受壓制者一有機會即移回線後。'),
    pushMLR:event('後撤與主抵抗線','未壓制敵步兵直退一格。玩家可立即免費做一次越線的排移動並將MLR往前一列；若到第3、4列間，在第4列上新增一列。線後最多四列。'),
    holdLine:event('側翼有狀況','本回合友軍不能進入比目前最前方更前的新橫列。'),
    front:event('側翼友連領先','本回合讓一個算子進入比目前最前方更前的新橫列。',1),
    front5:event('側翼友連領先','本回合讓一個算子進入比目前最前方更前的新橫列。已到第5列則忽略。',1),
    addColumn:event('側翼友連受壓制','隨機選左右一側，新增整個地形直欄並移動邊界。逐列按原配置補PC；新增牌也計入第1、2列肅清目標。')
  };
  const band=(from,to,keys)=>({from,to,rand:10,results:keys.split(' ').map(key=>({...events[key],key}))});
  const friendly = [
    [band(2,3,'report radio hmg inspector artillery mortar advancePC heat heat supply'),band(4,6,'report radio inspector artillery mortar advancePC heat heat heat supply'),band(7,10,'report radio artillery mortar advancePC heat heat heat supply supply')],
    [band(2,8,'lost lost radio radio artillery artillery waypoint mortar mortar rain')],
    [band(2,12,'report report radio radio artillery artillery inspector pullMLR mortar mortar')],
    [band(2,10,'report radio artillery artillery mortar inspector pullMLR pullMLR supply supply')],
    [band(2,6,'report radio artillery artillery mortar inspector holdLine front advancePC supply'),band(7,10,'report radio artillery mortar inspector holdLine front advancePC supply supply')],
    [band(2,6,'report report radio artillery addColumn holdLine front5 advance4 advance4 supply'),band(7,10,'report radio artillery addColumn inspector holdLine front5 advance4 supply supply')],
    [band(2,5,'report radio artillery addColumn inspector holdLine front5 advancePC advancePC supply'),band(6,10,'report radio artillery addColumn inspector holdLine front5 advancePC supply supply')]
  ];
  const enemyDefense = n => [band(2,6,'evac removeMortar removeLeader removeLeader removeMG rally rally rally pushMLR pushMLR'),band(7,n,'evac evac removeMortar removeLeader removeMG rally rally rally pushMLR pushMLR')];
  const enemyOffense = end => [band(2,10,'evac removeMortar removeLeader removeMG rally rally retreat retreat '+end)];
  const enemy = [
    [band(2,10,'evac removeMortar removeLeader removeMG removeTank rally rally retreat counter counter')],
    [band(2,8,'evac removeMortar removeLeader removeMG rally rally patrolRetreat patrolRetreat shift shift')],
    enemyDefense(12),enemyDefense(10),enemyOffense('counter counter'),enemyOffense('counter counter'),enemyOffense('retreat retreat')
  ];
  const table = [
    [[1,2,2,2,2,2,3,3,4,11],[1,1,2,2,2,3,4,5,6,11],[1,1,1,2,2,2,5,5,8,11]],
    [[2,2,2,2,2,3,3,4,4,5],[1,1,1,2,2,3,3,4,4,6],[1,1,1,2,2,2,4,4,6,6]],
    [[2,2,3,3,3,3,4,4,4,4],[1,1,1,1,2,2,5,5,5,6],[1,1,1,1,1,1,1,2,2,6]],
    [[3,3,4,4,6,6,6,7,8,8],[1,1,1,2,2,5,5,5,9,10],[1,1,1,1,2,2,2,9,10,10]],
    [[2,2,2,2,2,2,3,3,10,10],[1,1,2,2,4,4,5,5,8,10],[1,1,1,2,2,4,5,5,5,11]],
    [[2,2,2,2,2,3,3,3,10,11],[1,1,2,2,2,4,5,8,10,12],[1,1,1,2,2,4,5,8,10,12]],
    [[2,2,2,2,2,3,3,4,9,10],[1,2,2,4,5,6,7,7,8,11],[1,1,1,2,2,5,5,6,7,11]]
  ];
  const incoming='來襲火力', heavyFire='重迫砲來襲（單次−5）', infantry='一至三個步兵班', strong='堅固據點（兩組步兵，其中一組含重機槍）';
  const infil='步兵班滲透（依第13頁抽圖示）', mg='重機槍小組（基本掩蔽+1）', patrolGroup='巡邏班（掩蔽外、暴露）', wave='三班人海衝鋒（8.14）', probe='試探班（掩蔽外、暴露）', tankPair='一至兩輛T-34/85（各4點彈藥）', tankPlt='三輛T-34/85同牌（各4點彈藥）';
  const groupNames=[
    [incoming+'（R10：1–4砲兵−4，5–10迫砲−3，附觀測員）',infantry,strong,'一階迫砲小組','狙擊手',infil,mg,patrolGroup,wave,'一輛T-34/85（4點彈藥）',heavyFire],
    [incoming+'（迫砲−3，B級另抽R10：1–3改砲兵−4）',infantry,strong,patrolGroup,'指揮所（一班及一名指揮官）',heavyFire],
    [incoming+'（R10：1–4迫砲−3，5–10砲兵−4，附觀測員）',probe,infil,wave,mg,'三階迫砲分隊（4點彈藥、基本掩蔽+1）'],
    [incoming+'（R10：1–4迫砲−3，5–10砲兵−4，附觀測員）',probe,infil,wave,mg,tankPair,tankPlt,'一輛卡車載一班','三階迫砲分隊（4點彈藥、掩蔽外）',heavyFire],
    [incoming+'（R10：1–3砲兵−4，4–10迫砲−3，附觀測員）',infantry,strong,'三階迫砲分隊（4點彈藥）','狙擊手',infil,mg,patrolGroup,wave,tankPair,heavyFire],
    [incoming+'（R10：1–3砲兵−4，4–10迫砲−3，附觀測員）',infantry,strong,'戰壕內三階迫砲分隊（4點彈藥）','戰壕內狙擊手',infil,mg,patrolGroup,wave,tankPair,tankPlt,heavyFire],
    [incoming+'（R3：1砲兵−4，2–3迫砲−3，單次）',infantry,strong,'迫砲（PC A三階分隊，PC B一階小組，4點彈藥）','狙擊手',patrolGroup,'地雷標記（8.7.1）','一輛T-34/85（4點彈藥）','兩輛T-34/85（不同牌，各4點彈藥）','兩輛SU-76M（不同牌，各4點彈藥）',heavyFire]
  ];
  const directions = [
    {rand:7,results:['前','前','前','左前','左前','右前','右前']},
    {rand:10,results:['前','前','前','前','左前','左前','左前','右前','右前','右前']},
    {rand:5,byColumn:[['前','前','右前','右前','前'],['左前','前','前','右前','右前'],['左前','前','前','右前','右前'],['右前','前','前','左前','左前'],['右前','前','前','左前','左前'],['前','前','左前','左前','前']]}
  ];
  const supportRow=(source, type, modifier, count, draws, pool)=>({source,type,modifier,count,draws,...(pool?{pool}: {})});
  function makeSupport(n){
    // Draws list observers named in the printed column headers; absent roles cannot request that support.
    const a=n===1?{arty:4,mortar:3,co:3,plt:2}:{arty:3,mortar:2,co:2};
    const b=n===1?{arty:3,mortar:4,co:3,plt:2}:{arty:2,mortar:3,co:2};
    const arty=(t,mod,num,d=a,pool)=>supportRow('第15野戰砲兵營',t,mod,num,d,pool);
    const mortar=(t,mod,num,d=b,pool)=>supportRow('營屬迫砲排',t,mod,num,d,pool);
    const he=[3,2,4,3,4,5,5], mhe=[4,2,3,3,4,4,4];
    const rows=[arty('HE',-5,he[n-1]),mortar('HE',-3,mhe[n-1])];
    if(n!==2&&n!==3) rows.push(arty('WP',-4,1),mortar('WP',-3,1));
    if(n<=3) rows.push(arty('照明',null,n===1?1:4),mortar('照明',null,n===1?1:4));
    if(n===3||n===4) rows.push(arty('FPF',-6,null,n===3?{co:'自動'}:a,'HE'));
    if(n===3) rows.push(mortar('FPF',-4,null,{co:'自動'},'HE'));
    if(n>=6) rows.push(arty('TOT',-7,1,{arty:3,mortar:2,co:1}),supportRow('空中支援','空襲',-7,2,{fac:3,arty:2,mortar:1,co:1}));
    return {page:[17,22,26,30,34,38,42][n-1],battalion:[2,5,6,7].includes(n),rows};
  }
  window.FOF_TABLES ||= {};
  book.missions.forEach((m,i)=>{
    const n=i+1;
    const eventPage=[17,22,26,30,34,38,42][i],contactPage=[19,23,27,31,35,39,43][i];
    const contactSet = ids => ({rand:10,results:ids.map(id=>({id,title:groupNames[i][id-1]}))});
    const contact=Object.fromEntries(['A','B','C'].map((grade,j)=>[grade,contactSet(table[i][j])]));
    if([1,5,6].includes(n)) contact.counterA=contactSet([1,1,6,7,8,9,9,10,10,n===6?12:11]);
    const tables={eventPage,enemyEventPage:n===1?18:eventPage,contactPage,contact,friendly:friendly[i],enemy:enemy[i],directions:directions[n<3?0:n===4?2:1]};
    m.support=makeSupport(n);m.tables=tables;
    m.references={map:m.page+1,fire:eventPage,friendly:eventPage,enemy:n===1?18:eventPage,contact:contactPage,special:contactPage};
    m.xp=m.mode==='patrol'?{type:'patrol',clearPrimary:5,otherRows:[3,4],clearOther:1,completed:5}:m.mode==='defense'?{type:'defense',secure:1,clearedRows:[1,2],clear:1,enemyTruck:2}:{type:'objectivesAndOriginalPC',primary:5,secondary:4,position:3,otherOriginalA:2,otherOriginalBC:1};
    m.setupNotes.push('第'+(n===1?'18–19':contactPage)+'頁｜接敵結果依編號使用該頁的放置與發現欄。棋子不足以放整組時重抽。');
    window.FOF_TABLES[m.id]=tables;
  });
})();
