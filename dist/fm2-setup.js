/* Field Manual 2, pp. 28–39. Coordinates read from the printed layouts viewed from the player side. */
(() => {
  'use strict';
  const lessons = window.FOF_LESSONS;
  const unit = (id, art, name, at, steps=1) => ({id, art, name, at, steps});
  const figure = (filename, alt) => ({src:'assets/fm2/'+filename+'.webp', alt});
  const terrainId = n => 'K'+String(n).padStart(2,'0');
  const chart29 = figure('korea-attachments','手冊第 29 頁的排屬及一般支援編組');
  const assets29 = figure('korea-assets','手冊第 29 頁的指揮顯示表資產格');
  const setup30 = figure('figure-30','手冊第 30 頁的洛東江地形配置');
  const setup32 = figure('figure-32','手冊第 32 頁的算子部署與電話線');
  const assets36 = figure('vietnam-assets','手冊第 36 頁的越南連隊資產配置');
  const map37 = figure('figure-37','手冊第 37 頁的第一回合地圖');
  const control39 = figure('figure-39','手冊第 39 頁的直升機管制卡');
  function choose(page,phase,text,options,answer,detail,effects,illustration,turn=0){
    return {kind:'choice',page,phase,turn,text,options,answer,detail,effects,figure:illustration};
  }
  function cell(page,phase,at,text,detail,effects,illustration,turn=0){
    return {kind:'cell',page,phase,turn,at,text,detail,effects,figure:illustration};
  }
  // Each checkpoint stores the complete marker stack on the cards it changes.
  function markBuilder(){
    const stacks={};
    return (coords,label)=>{
      const marks={};
      for(const at of coords){
        stacks[at]=[...(stacks[at]||[]),label]; marks[at]=stacks[at];
      }
      return marks;
    };
  }
  const slots = (letters,y)=>Array.from(letters,x=>x+y);
  const km=markBuilder(),defense=[];
  const d=(...args)=>defense.push(choose(...args));
  const k=(...args)=>defense.push(cell(...args));
  d(28,'任務簡報','洛東江任務 4 的硬性勝利條件，要在任務結束時如何計算？',
    ['確保主抵抗線後方 12 張牌中的至少 6 張','確保全圖 24 張牌','每一項經驗點目標都要完成'],0,
    '這是白晝防禦。確保一張牌須有友軍佔據且無敵軍。其他經驗點項目另計。',
    {tracks:{'須確保地形':'6 / 12 張'}});
  d(28,'核對編制','在任務紀錄表上，把三門 60 公釐迫擊砲登記成哪一枚算子？',
    ['三枚一階小組','一枚三階迫擊砲分隊','一枚電話線標記'],1,
    '另列三個步兵排、三組 57 公釐無後座力砲及連部人員。每個步兵排有三個班、一個機槍組及一個巴祖卡組。');
  d(29,'任務配屬','對照編組圖，第 1 排領取哪一組配屬算子？',
    ['三枚重機槍','迫擊砲分隊與三枚 57 公釐組','砲兵觀測員、第 1 組 75 公釐與第 1 組 57 公釐'],2,
    '第 2 排是迫擊砲觀測員及各一枚 75、57 公釐組。第 3 排是迫擊砲分隊及第三枚 57 公釐組。三枚重機槍留在一般支援欄。',
    {tracks:{'一般支援':'3 枚重機槍'}},chart29);
  d(29,'指揮顯示表','依範例分發六部 EE8。除了連部、副連長與三個排部，最後一部放哪裡？',
    ['連士官長資產格','迫擊砲分隊資產格','任務回合軌'],1,
    '兩名傳令兵與營戰術無線電放連部格。連士官長另持有一條備用電話線。',
    {tracks:{'EE8 野戰電話':'6 部'}},assets29);
  d(29,'資產與信號','核對四枚 HC 和四枚白磷煙霧標記，哪一份與範例的指揮顯示表相符？',
    ['HC 給每排第 1 班及連士官長，白磷給每排第 3 班及連士官長','八枚都放連部資產格'],0,
    '連部的紅、綠星降落傘信號記在 FPL、FPF 欄。副連長紅星集束記全體停火，連士官長另有紫煙。',undefined,assets29);
  k(29,'地圖與主抵抗線','D2','找到 D2。點這張牌，標出第 2 與第 3 列之間的主抵抗線。',
    '主抵抗線橫跨六欄，本課把三枚 MLR 記號放在指定牌的上緣位置。突擊組的越線限制及事件移線見第 33 頁。',
    {marks:km(['B2','D2','F2'],'主抵抗線 MLR')},setup30);
  k(29,'傷亡收集點','D0','把傷亡收集點放到第 4 行集結區。','D0 是範例所選的 CCP。這項戰役規則也容許選一張正面朝上的地形牌。',
    {marks:km(['D0'],'傷亡收集點 CCP')},setup30);
  k(31,'工事','A1','點第 1 列左端的 A1，按圖在第 1、2 列完成散兵坑配置。',
    '兩列共十二張地形牌，每牌兩個散兵坑，共二十四個。每堆標示 ×2。',
    {marks:km([...slots('ABCDEF',1),...slots('ABCDEF',2)],'散兵坑 × 2'),tracks:{'已放散兵坑':24}},setup32);
  const squads = ['s1','s2','s3','p2s1','p2s2','p2s3','p3s1','p3s2','p3s3'];
  const squad = (pl,sq,at)=>unit('p'+pl+'s'+sq,squads[(pl-1)*3+sq-1],sq+'/'+pl+' 班',at,3);
  const weapon = (type,pl,at)=>unit(type+pl,'kr-'+type+'-'+pl,(type==='mg'?'1':'2')+'/W/'+pl+(type==='mg'?' 機槍組':' 巴祖卡組'),at);
  const rcl = (cal,group,at)=>unit('r'+cal+'-'+group,'kr-rcl'+cal+'-'+group,group+'/'+cal+' 公釐無後座力砲組',at);
  k(31,'第 1 排配置','B2','對照第 32 頁的藍色框，點放置第 1 排部的 B2。',
    '第 1 排的算子依圖分到 A2、B2 和相鄰的 C2。A1、B1 分別放 2/1、3/1 預備班。',
    {add:[unit('pl1','hq','第 1 排部','B2'),squad(1,1,'A2'),squad(1,2,'A1'),squad(1,3,'B1'),weapon('mg',1,'A2'),weapon('baz',1,'C2'),rcl(57,1,'A2'),rcl(75,1,'B2'),unit('arty','arty-fo','砲兵觀測員','B2')]},setup32);
  k(31,'第 2 排配置','E2','對照紅色框，點放置第 2 排部的 E2。',
    '1/2 班在 E2，迫擊砲觀測員與第 2 組 75 公釐在 F2。2/2、3/2 兩班分別在 E1、F1。',
    {add:[unit('pl2','hq2','第 2 排部','E2'),squad(2,1,'E2'),squad(2,2,'E1'),squad(2,3,'F1'),weapon('mg',2,'F1'),weapon('baz',2,'E2'),rcl(57,2,'E2'),rcl(75,2,'F2'),unit('mfo','fo','迫擊砲觀測員','F2')]},setup32);
  k(31,'第 3 排配置','D2','對照綠色框，點放置第 3 排部的 D2。',
    '1/3 班在 C2，2/3 與 3/3 班在 C1；兩個武器組在 D2，迫擊砲分隊與第 3 組 57 公釐在 D1。',
    {add:[unit('pl3','hq3','第 3 排部','D2'),squad(3,1,'C2'),squad(3,2,'C1'),squad(3,3,'C1'),weapon('mg',3,'D2'),weapon('baz',3,'D2'),rcl(57,3,'D1'),unit('mtr','mtr','60 公釐迫擊砲分隊','D1',3)]},setup32);
  k(31,'一般支援與 FPL','D1','點 D1 的岩地，放置第 32 頁的第一堆一般支援算子與向右 FPL。',
    'D1 有連士官長、.50 重機槍與 1/2 HMG。箭頭標記屬於 .30 重機槍。',
    {marks:km(['D1'],'FPL 右向'),add:[unit('sgt','first-sgt','連士官長','D1'),unit('50','hmg50','.50 重機槍','D1'),unit('hm2','hmg2','1/2 HMG・.30 重機槍','D1')]},setup32);
  k(31,'第二枚 FPL','E1','點 E1，將另一枚 .30 重機槍和向左的 FPL 放在一起。',
    '兩枚 FPL 標記已就位。在遊戲裡它們等待約定信號，使用斜箭頭上的 H 火力量。轉移射擊命令可撤除 FPL。',
    {marks:km(['E1'],'FPL 左向'),add:[unit('hm1','hmg1','1/1 HMG・.30 重機槍','E1')],tracks:{'已放 FPL':2}},setup32);
  k(31,'砲兵 FPF','E3','找到兩層丘陵上的水田 E3，放上 FPF 標記。','第 32 頁的淺藍箭頭指著這枚砲兵 FPF。FPF 與前一步兩枚 FPL 在圖上是不同的標記。',
    {marks:km(['E3'],'砲兵最後防護射擊 FPF')},setup32);
  k(31,'電話線與指揮部','D0','選 D0，把連部和副連長放進有 CCP 的集結區，依圖連好電話線。',
    '三枚電話線標記在 A1、C1、E1；第四條保存在連士官長資產格。圖中的黃色虛線示意連線。',
    {add:[unit('co','co-hq','連部','D0'),unit('xo','co-xo','副連長','D0')],marks:km(['A1','C1','E1'],'電話線'),tracks:{'圖上／備用電話線':'3 / 1'}},setup32);
  d(33,'開始防禦回合','第 1 回合、未接敵。略過雙方上級事件後，先用哪個階段？',
    ['進攻任務的友軍指揮','防禦任務的敵軍活動（3.2）','清理階段'],1,
    '防禦開局圖上沒有敵軍或 PC。先到防禦敵軍活動檢查，從這裡開始按任務時程補 PC。',{tracks:{'活動程度':'未接敵'}},undefined,1);
  k(33,'放置第一回合 PC','A1','按第 1 回合時程，點 A1，把 C 型 PC 放到第 1、2 列的十二張地形牌。','第一、二列各六枚 C 型。防禦任務是在敵軍活動檢查步驟開始時補放 PC。',
    {marks:km([...slots('ABCDEF',1),...slots('ABCDEF',2)],'PC C'),tracks:{'第 1、2 列 PC C':12}},undefined,1);
  k(33,'放置第一回合 PC','E3','點 E3，完成第 3 列的 B 型 PC 配置。','這列有六枚 B 型，但尚無美軍算子。範例容許桌遊玩家暫略這列實物，本課把整列都擺出來以對照時程。',
    {marks:km(slots('ABCDEF',3),'PC B'),tracks:{'第 3 列 PC B':6}},undefined,1);
  d(33,'從設置接到開局','現在地圖上沒有敵軍。第一回合接下來如何處理？',
    ['立刻移除所有 PC','對第 3 列六張牌逐一抽敵軍','略過敵軍單位活動，接友軍指揮；到潛在接敵判定步驟再處理有美軍的牌'],2,
    '未觸發的 PC 到清理階段才移除。你已重建洛東江任務 4 的部署與第一回合開局；手冊的防禦示範到此為止。',undefined,figure('figure-34','手冊第 34 頁的開局 PC 配置'),1);
  lessons.D1={
    title:'洛東江的防禦設置',pages:'28–34',goal:'完成白晝防禦的設置，依第 1 回合時程放好 PC，辨認敵軍活動之後的階段。',
    brief:'牌面依第 30 頁，單位配置依第 32 頁。點選指定牌會擺入該組算子或標記；手冊結束在第一回合開局。',
    layout:{rows:[Array(6).fill(0),...[ [30,16,24,42,29,45],[50,15,48,37,36,53],[23,18,27,28,22,21],[26,41,35,25,20,46] ].map(row=>row.map(terrainId))],hills:{A4:['K07'],B4:['K08'],E3:['K09','K10'],F1:['K11']}},
    backFace:'assets/staging-naktong.webp',backName:'洛東江集結區',units:[],marks:{},tracks:{},steps:defense
  };

  const air=[];
  const a=(...args)=>air.push(choose(...args)),v=(...args)=>air.push(cell(...args));
  a(35,'選擇編制','打開越南任務 1 的編制裝備表。要重現本章範例，應勾選哪種編制？',
    ['81 公釐迫擊砲分隊','第 4 排編制'],1,
    '範例選第 4 排，60 公釐迫擊砲組配給第 4 排。三枚觀測配屬列入同一份連隊紀錄。',{tracks:{'編制':'第 4 排'}});
  a(35,'登錄配屬','按順序填入第 1、2、3 排的觀測配屬。',
    ['前進空中管制員、砲兵觀測員、迫擊砲觀測員','砲兵觀測員、迫擊砲觀測員、前進空中管制員'],0,
    'FAC、Arty FO、Mtr FO 三枚配屬都是一般經驗，各算一階。');
  a(35,'分配經驗','核對可彈性分配的 39 階，以老兵／一般／新兵的順序填哪組？',
    ['7／14／18','18／7／14','7／18／14'],2,
    '例如 1/1 與 1/2 班各分 VVL，查多階單位表為老兵；LLG 為一般，GGG 為新兵。定級後只追蹤整枚算子的等級。',{tracks:{'彈性經驗 V／L／G':'7／18／14'}});
  a(35,'指揮部經驗','查看第 36 頁的指揮顯示表，哪些指揮部在本例放新兵標記？',
    ['連部、第 2 排部、第 3 排部','副連長、第 1 排部、連士官長'],0,
    '副連長與第 1 排部為一般，連士官長為老兵。第 4 排部的編制表結果為一般。',undefined,assets36);
  a(35,'分發連戰術無線電','七部已入指揮部與幕僚格。剩下三部依手冊放到哪些班？',
    ['1/1、1/2、1/3','2/1、2/2、1/3','3/1、3/2、3/3'],1,
    '共十部。HC 給 1/1、1/2、1/4、連士官長。白磷給 2/1、2/2、2/3、2/4。', {tracks:{'已分配連戰術無線電':10}},assets36);
  a(36,'登錄信號資產','連部的紅星降落傘信號與副連長的紅星集束信號，在本例登記哪項一次性命令？',
    ['停火','改變任務回合數'],0,
    '彩色煙霧另外配給連部、排部與幕僚，供需要時在棋桌標示替代 LZ。',undefined,assets36);
  v(36,'確認地形牌','C3','在五乘五棋桌找出中央的 C3，核對牌面右下角的直升機符號。','本例中央是越南灌木叢 V36。若設置時抽到不合格的牌，可與已翻開且合格的牌交換，或棄掉重抽。',undefined,map37);
  v(36,'主要著陸區','C3','點 C3，放上主要著陸區標記。','中央是這個劇本的無敵情著陸區，不放 PC。四個邊界的進攻界限見第 37 頁圖。',{marks:{C3:['主要著陸區 LZ']}},map37);
  const hiddenMarks={};
  for(let y=1;y<=5;y++)for(const x of 'ABCDE'){const at=x+y;if(at!=='C3')hiddenMarks[at]=['PC ?'];}
  a(36,'放置潛在接敵標記','把 A、B、C 型 PC 都翻到問號面並混合。要隨機取幾枚、放在哪裡？',
    ['25 枚，每張一枚','16 枚，只放外圈','24 枚，除中央 LZ 外每張一枚'],2,
    '內圈八張正面地形與外圈十六張背面地形，都各有一枚問號。此章只到設置完成，不翻開這些 PC。',
    {marks:hiddenMarks,tracks:{'圖上 PC ?':24}},map37);
  a(36,'記下清除目標','任務要求清除 12 張牌。結算時怎樣的一張牌可以計入？',
    ['起始有 PC，結束時沒有 PC 也沒有敵軍','結束時只要有一枚友軍','只計中央的 LZ'],0,
    '清除這裡不要求友軍佔據。請把這個條件和防禦課的「確保」分開計數。',{tracks:{'須清除地形':'12 張'}},map37);
  a(38,'打開裝載計畫','先在任務 1 的規劃卡核對兩種機型的每架載量。選出 UH-1／CH-47 的兵力階數。',
    ['4／12','3／12','3／6'],1,
    '三波各四架 UH-1，最後一波兩架 CH-47。十二架 × 3 加兩架 × 12，共六十階運力；全連含觀測配屬是四十八階。',{tracks:{'規劃卡已裝載':'0 / 48 階','總運力':'60 階'}},figure('figure-38','手冊第 38 頁的四波裝載規劃卡'));
  const waves=[
   [
    ['11','第 1 排部、1/W/1、FAC','第 2 排部、1/W/1、FAC'],
    ['12','連部、砲兵觀測員、2/W/1','連部、迫擊砲觀測員、2/W/1'],
    ['13','1/1 班（三階）','1/2 班（三階）'],
    ['14','2/1 班（三階）','2/2 班（三階）']
   ],
   [
    ['21','第 2 排部、3/2 班（二階）','第 1 排部、3/2 班（二階）'],
    ['22','迫擊砲觀測員、3/1 班（二階）','砲兵觀測員、3/1 班（二階）'],
    ['23','1/W/2、1/2 班（二階）','2/W/2、1/2 班（二階）'],
    ['24','2/W/2、2/2 班（二階）','1/W/2、2/2 班（二階）']
   ],
   [
    ['31','第 3 排部、1/W/3、突擊組','第 3 排部、2/W/3、突擊組'],
    ['32','2/W/3、1/3 班（二階）','1/W/3、1/3 班（二階）'],
    ['33','2/3 班（三階）','2/4 班（二階）'],
    ['34','3/3 班（三階）','3/1 班（二階）']
   ],
   [
    ['41','副連長、1/4 班、60 公釐組、兩枚突擊組','連士官長、1/4 班、60 公釐組、兩枚突擊組'],
    ['42','第 4 排部、連士官長、2/4 班、兩枚突擊組','第 4 排部、副連長、2/4 班、兩枚突擊組']
   ]
  ];
  const positions=[[1,0,0,1],[0,1,1,0],[1,0,1,0],[0,1]];
  let loaded=0;
  waves.forEach((slots,index)=>{
    const n=index+1,plane=n===4?'CH-47':'UH-1',perPlane=n===4?6:3;
    const illustration=figure('wave-'+n,'手冊第 38 頁・第 '+n+' 波裝載格');
    slots.forEach(([number,correct,other],i)=>{
      loaded+=perPlane;
      const answer=positions[index][i],options=answer?[other,correct]:[correct,other];
      const detail=plane+' '+number+' 格已放入'+correct+'，共 '+perPlane+' 階。'+(i===slots.length-1?'第 '+n+' 波的格位都已填妥。':'');
      a(38,'裝載規劃卡・第 '+n+' 波','對照圖中的 '+plane+' '+number+' 號格，選入這一架的算子。',options,answer,detail,
        {tracks:{'規劃卡已裝載':loaded+' / 48 階',['第 '+n+' 波已填']:(i+1)+' / '+slots.length+' 格'}},illustration);
      air.at(-1).cueArt='aircraft-'+number;
      air.at(-1).gesture='選取要放進這個機位的算子組合。';
    });
  });
  a(39,'直升機管制卡','準備第 1 回合。把第 1 波的四枚 UH-1 放進管制卡哪一格？',
    ['進場格（Inbound）','盤旋格（Loiter）','離場格（Outbound）'],0,
    '第一波 11、12、13、14 號在進場格等候進圖。地圖中央仍只有 LZ，搭載算子留在裝載規劃卡。',{tracks:{'進場格':'第 1 波・4 枚'}},control39);
  a(39,'直升機管制卡','第 2 波的 21 至 24 號算子現在放哪一格？',
    ['地圖中央 C3','接載區（PZ）','一般集結區'],1,
    '預定波次沿管制卡的格子推進，不花連部命令點。進場後也可按流程改進盤旋格。事件在 PZ 出現的彈藥另依命令和彩煙規則運入。',{tracks:{'接載區':'第 2 波・4 枚'}},control39);
  a(39,'開局前最後核對','按第 39 頁完成最後一項桌面準備，然後停在第一波進圖前。',
    ['把 24 枚 PC 全部翻開','先替第 4 波在地圖放算子','把三種類型的越共班放入隨機抽取杯，核對戰役特殊規則 5'],2,
    '請記下隧道配置的例外與一次性 RPG 算子的識別。任務紀錄、地形、裝載規劃卡和管制卡已就緒，這是手冊空中突擊設置的終點。',
    {tracks:{'準備狀態':'第 1 回合進圖前'}},control39);
  air[0].cueArt='vn-hq4';
  air[1].cueArt='vn-fac';
  const fog='VNback';
  lessons.H1={
    title:'越南空中突擊的任務設置',pages:'35–39',goal:'依範例填完十四個機位、配置二十四枚問號 PC，將前兩波放入正確的管制卡格。',
    brief:'阿拉莫阿納作戰第一部。地圖保留第 37 頁已翻開的九張地形與外圈牌背。各波從第 38 頁裝載格選入算子，完成時停在第一回合進圖前。',
    layout:{noStaging:true,rows:[[],Array(5).fill(fog),[fog,'VN55','VN41','VN42',fog],[fog,'VN30','VN36','VN49',fog],[fog,'VN26','VN31','VN29',fog],Array(5).fill(fog)],hills:{}},
    units:[],marks:{},tracks:{},steps:air
  };
})();
