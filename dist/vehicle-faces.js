// Printed faces. Rulebook §§1.2.3E, 6.2.2, 10.1–10.2, 10.6.2, 11.1;
// Vehicle and AT Weapons Chart p. 1; Field Manual 2 pp. 17, 26, 38–39.
(() => {
  'use strict';
  const faces = Object.create(null);
  const heavy = ['左下 H', '重武器基本火力量，對步兵的火力量值為 −3。'];
  const small = ['左下 S', '輕兵器基本火力量，對步兵的火力量值為 +0。'];
  const veryLong = ['右下 V', '極遠距離。從所在牌起算，這項火力最遠可達三張牌。'];
  const close = ['右下 C', '近距離。這項火力最遠可達相鄰的地形牌。'];
  const immobile = ['紅叉與白箭頭', '砲班在這一面不能移動，包括牌內移動、移往別牌和尋找掩蔽。'];
  const capacity = n => ['黃色 [' + n + ']', '運輸容量為 ' + n + ' 階兵力，也可搭載相當運量的物品。'];
  function tank(id, model, type, number, hq = false) {
    const rows = [
      [model + ' 與車身圖', type + '。每枚代表一輛。'],
      ['車身下方 ' + number, '這輛車的識別編號，可用來對照任務編組與紀錄。'],
    ];
    if (!id.startsWith('army-nkpa-')) rows[0][1] += '車身白星是美軍識別徽。';
    if (hq) rows.push(['HQ 與淡色圓徽', '這輛是車輛排的指揮車，可向本排車輛下令，也能以本身的火力量參戰。']);
    faces[id] = [...rows, heavy, veryLong];
  }
  tank('sherman', 'M4 Sherman', '美軍 M4 雪曼戰車', 11, true);
  for (const n of [12, 13, 14, 15]) tank('sherman' + n, 'M4 Sherman', '美軍 M4 雪曼戰車', n);
  tank('m10', 'M10 TD', '美軍 M10 戰車驅逐車，TD 是 Tank Destroyer 的縮寫', 21, true);
  tank('kr-m4', 'M4A3E8', '韓戰美軍 M4A3E8 雪曼戰車', 11, true);
  tank('kr-m26', 'M26 Pershing', '韓戰美軍 M26 潘興戰車', 21, true);
  tank('kr-quad', 'QUAD 50', '搭載四聯裝 .50 口徑機槍的美軍半履帶車', 41);
  tank('vn-m48', 'M48 Patton', '越戰美軍 M48 巴頓戰車', 33);
  for (const n of [201, 202, 203, 204]) tank('army-nkpa-su-76m-' + n, 'SU-76M', '北韓人民軍 SU-76M 自走砲', n);
  for (const n of [101, 102, 103, 111, 112, 113, 121, 122]) tank('army-nkpa-t34-85-' + n, 'T-34/85', '北韓人民軍 T-34/85 戰車', n);
  faces['m5-enemy'] = [
    ['M5 與車身圖', 'M5 輕戰車，車身白星是美軍識別徽。野戰手冊的這場演習用它代表敵車。'],
    ['車身下方 32', '本車的識別編號。'],
    ['左下 A', '自動武器基本火力量，對步兵的火力量值為 −1。'],
    ['A 旁的上標 G!', '有限反戰車能力。在棋桌上先成功抽出榴彈圖示，才能繼續結算反戰車射擊。'],
    ['右下 L', '遠距離。基本火力量最遠可達距所在牌兩張牌的位置。']
  ];
  faces.jeep = [
    ['JEEP 與車身圖', '吉普車。依規則屬無自帶車組的裝備。'], capacity(2)
  ];
  for (const [id, side] of [['truck', '美軍'], ['army-nkpa-truck', '北韓人民軍']]) {
    faces[id] = [['TRUCK 與車身圖', side + '運輸卡車，每枚代表一輛。'], capacity(10)];
  }
  const oneStep = ['下方一個黃點 ●', '此面有 1 階砲班兵力。'];
  faces['de-75'] = [
    ['1/75mm AT 與砲圖', '第 1 號 75 公釐反戰車砲。AT 是 Anti-Tank 的縮寫。'],
    immobile, oneStep,
    ['左下 S', '砲班的自衛火力屬輕兵器（+0）。主砲對車輛的數值另查反戰車武器表。'], close
  ];
  faces['de-ig'] = [
    ['1/75mm IG 與砲圖', '第 1 號 75 公釐步兵砲。IG 為德文步兵砲的縮寫。'],
    immobile, oneStep,
    ['左下 S', '砲班自衛時施加輕兵器火力量（+0），最遠到相鄰牌。'],
    ['上標 G! 與右下 V', '主砲可執行遠距榴彈攻擊，最遠到極遠距離（三張牌）。']
  ];
  for (const [id, steps] of [['de88', 2], ['de88-reduced', 1]]) {
    faces[id] = [
      ['1/88mm 與砲圖', '第 1 號 88 公釐高射砲。'], immobile,
      steps === 1 ? oneStep : ['下方兩個黃點 ●●', '此面有 2 階砲班兵力。'],
      heavy, veryLong
    ];
  }
  for (const n of [11, 12, 13, 14, 21, 22, 23, 24, 31, 32, 33, 34, 41, 42]) {
    const large = n >= 40;
    faces['aircraft-' + n] = [
      [large ? 'CH-47 與雙旋翼機圖' : 'UH-1 與直升機圖', large ? '一架 CH-47 契努克重型運輸直升機。' : '一架 UH-1 休伊運輸直升機。'],
      ['機身下方 ' + n, '機號。在裝載規劃卡與直升機管制卡上，用這個號碼對照機位與所載單位。'],
      capacity(large ? 12 : 3), small, close
    ];
  }
  // Crops on the Field Manual 2 control card show the same eight UH-1 faces.
  for (const [i, n] of [11, 21, 12, 22, 13, 23, 14, 24].entries()) {
    faces['control-' + (i + 2)] = faces['aircraft-' + n];
  }
  window.FOF_VEHICLE_FACES = faces;
})();
