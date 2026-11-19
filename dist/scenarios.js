// 諾曼第戰役任務書的七個任務。列由玩家一側開始，自 1 起算。
(() => {
  const mission = (number, title, date, page, lastPage, cols, rows, settings) => ({
    id: 'N' + number, number, title, date, campaign: '諾曼第',
    page, mapPage: page + 1, lastPage, cols, rows, turns: 10,
    terrain: 'random', mode: 'offensive', visibility: [0, 0],
    staging: true, retries: 1, patrols: 0, carryMapFrom: null,
    ...settings
  });
  const goals = (primaryRow, secondaryRow, positionRow, clearRows, positionAdjacentTo = 'either') => ({
    primaryRow, secondaryRow, positionRow, positionAdjacentTo, clearRows, waypoints: 0
  });
  const patrol = () => ({
    mode: 'patrol', retries: null, patrols: 3, visibility: [2, 5],
    pcRows: [null, '?B/C', '?B/C', 'A'],
    objectives: {
      primaryRow: 4, secondaryRow: null, positionRow: null, positionAdjacentTo: null,
      clearRows: [], waypoints: 4, waypointRows: [2, 3, 4], returnFromRow: 2, returnToRow: 1
    },
    outpost: {row: 2, removePC: true, maxFoxholes: 2},
    foxholes: {row: 1, each: 2},
    objective: '依序通過四個路線點，走訪第 4 列的主要目標，並從第 2 列返回第 1 列。',
    setupNotes: [
      '三個排各進行一次十回合巡邏，共用同一張地圖。每次另抽月光能見度。',
      '第 1 列各放兩枚散兵坑，第 2 列自選一張設戰鬥前哨並移除該處的潛在接敵標記。',
      '每次巡邏在第 2 至 4 列的四張不同牌上設置路線點 1 至 4，可與主要目標重疊。主要目標和每個路線點都須有巡邏單位到過。'
    ]
  });
  window.FOF_SCENARIOS = [
    mission(1, '特雷維耶爾進攻', '1944 年 6 月 8 至 10 日', 16, 19, 4, 3, {
      pcRows: ['C', 'A', 'B'], objectives: goals(3, 3, 2, [1, 2]),
      brief: '諾曼第戰役首場任務。十二張隨機地形牌構成地圖，連隊自集結區開始。',
      objective: '第 10 回合結束時，控制第 3 列的主要與次要目標，並肅清第 1、2 列。',
      setupNotes: ['在第 3 列自選兩張不同的牌，分別放置主要與次要目標。', '第 2 列選一張與任一目標相鄰的牌，放置攻擊陣地。']
    }),
    mission(2, '瑟里西進攻', '1944 年 6 月 11 至 19 日', 20, 23, 4, 5, {
      pcRows: ['C', 'C', 'B', 'B', 'A'], objectives: goals(5, 5, 4, [1, 2, 3, 4]),
      brief: '地圖加深為五列，主要與次要目標都在最遠的一列。',
      objective: '控制第 5 列的兩個目標，並肅清第 1 至 4 列。',
      setupNotes: ['第 5 列自選兩張目標牌。第 4 列的攻擊陣地須與至少一個目標相鄰。']
    }),
    mission(3, '聖喬治代勒至勒帕克防禦', '1944 年 6 月 20 日至 7 月 10 日', 24, 27, 5, 4, {
      ...patrol(), staging: false,
      brief: '月光下的三次巡邏。若接續戰役，下一任務沿用這張地圖。'
    }),
    mission(4, '192 高地進攻', '1944 年 7 月 11 至 12 日', 28, 31, 5, 4, {
      staging: false, carryMapFrom: 3, pcRows: ['C', 'B', 'A', 'A'],
      objectives: goals(4, 4, 3, [2, 3]), foxholes: {row: 1, each: 2},
      brief: '接續第 3 任務時，沿用地形、掩蔽與雷區；單獨遊玩時設置新的地圖。',
      objective: '控制第 4 列的主要與次要目標，並肅清第 2、3 列。',
      setupNotes: ['第 1 列每張牌放置兩枚散兵坑。可自選第 2 列一張牌放兩枚散兵坑，並在此部署一個排的部分單位。', '其餘單位由第 1 列開始。已被友軍佔據的牌仍須依該列配置潛在接敵標記。']
    }),
    mission(5, '聖日耳曼代勒至紅十字路口至勒蘇萊爾防禦', '1944 年 7 月 13 至 25 日', 32, 35, 6, 4, {
      ...patrol(), brief: '六行寬的月光巡邏地圖。三次巡邏分別記錄各排到達的路線點。'
    }),
    mission(6, '維爾進攻', '1944 年 7 月 26 日至 8 月 7 日', 36, 40, 4, 5, {
      pcRows: ['C', 'C', 'B', '?A/B', '?A/B'], objectives: goals(5, 5, 4, [1, 2, 3]),
      brief: '前方兩列的潛在接敵等級隱藏，兩個目標都在第 5 列。',
      objective: '控制第 5 列的主要與次要目標，並肅清第 1 至 3 列。',
      setupNotes: ['第 4、5 列由 A、B 標記混合抽取，以問號朝上放置。攻擊陣地設在第 4 列，須與至少一個目標相鄰。']
    }),
    mission(7, '坦什布賴進攻', '1944 年 8 月 8 至 16 日', 42, 46, 4, 6, {
      retries: 2, pcRows: ['C', 'C', 'B', 'B', 'A', 'A'],
      objectives: goals(6, 5, 4, [1, 2, 3, 4, 5], 'secondary'),
      brief: '戰役最後一張地圖有六列。兩個目標分設於第 5、6 列，本任務最多可重試兩次。',
      objective: '控制主要與次要目標，並肅清第 1 至 5 列。',
      setupNotes: ['第 6 列選主要目標，第 5 列選次要目標。第 4 列的攻擊陣地須與次要目標相鄰。']
    })
  ];
})();
