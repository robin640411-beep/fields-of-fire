// 依諾曼第任務書每場任務的事件表和接敵組合表查閱。陣列索引為抽出的 R# 減一。
(() => {
  const event = (title, text, xp = 0) => ({title, text, xp});
  const events = {
    report: event('態勢報告', '本回合連 HQ 先支付 3 命令點完成報告。', 1),
    radio: event('通訊故障', '營部本回合無法啟動連 HQ。連 HQ 必須先支付 2 命令點才能恢復通訊。', 1),
    artillery: event('砲兵轉移', '第 15 野戰砲兵營的支援本回合不可用。'),
    inspector: event('督導', '將隨機一枚上級幕僚算子放到連 HQ 的牌上，停留兩回合。期間營部視為在地圖上。'),
    holdLine: event('側翼出狀況', '直到本回合結束，友軍不得進入比目前最前方友軍更遠的橫列。'),
    supply: event('彈藥補給', '在第 1 列選一張牌，選一種彈藥，增加 4 點。'),
    regiment: event('團屬支援轉移', '團屬步兵砲連的支援本回合不可用。'),
    mortar: event('迫擊砲排轉移', '營屬迫擊砲排的支援本回合不可用。'),
    tanks: event('戰車支援', '從第 1 列自選牌加入 M5 戰車排。使用四輛戰車及一輛指揮車算子，每枚 5 彈藥。'),
    lost: event('黑暗中迷路', '隨機選一枚巡邏單位，向隨機方向移動一張牌並標為暴露。若越界，增設地形牌及該列的 PC；第 5 列使用 A。'),
    wait: event('稍候！', '本回合友軍不能移入沒有單位佔據的牌。'),
    rain: event('下雨', '本回合放置雨天標記，能見度修正增加 2 並套用 §9.1。回合結束時移除。'),
    waypoint: event('連部催促行動', '至少一枚巡邏單位須朝下一枚路線點前進。四枚路線點均已走訪時忽略。', 1),
    evacuate: event('後送傷亡人員', '逐張檢查沒有美軍的牌，移除其中全部傷亡人員算子。'),
    removeMortars: event('迫擊砲轉移', '移除所有位於無美軍牌上的德軍迫擊砲算子。'),
    removeLeaders: event('指揮官轉移', '移除所有位於無美軍牌上的德軍指揮官算子。'),
    removeMG: event('重機槍轉移', '移除所有位於無美軍牌上的德軍重機槍算子。'),
    rally: event('重整', '所有受壓制的德軍單位各嘗試重整；未受壓制的德軍有限行動小組各嘗試升級。'),
    retreat: event('後撤', '所有未受壓制的德軍算子各往其正後方移動一張牌。'),
    shift: event('防線移動', '替換第 4 列仍未結算的全部 PC。從 A、B、C 混合抽取相同數量，以問號面放回。'),
    counterAll: event('反攻', '在每張有友軍的牌上，從剩餘 PC 各隨機抽放一枚，問號面朝上。從本回合起連續三回合使用反攻的 A 表，敵軍模式改為「進攻突擊」。'),
    counterNear: event('反攻', '在有友軍且符合下列任一條件的牌上放置 A 級 PC：位於最後一列，或鄰接尚未揭露的 PC。本回合起連續三回合改用反攻 A 表及「進攻突擊」模式。')
  };
  const advance = (lastRow, needsPC) => {
    const condition = needsPC ? '，且進入有 PC 的牌' : '';
    const skip = needsPC ? '，或無法抵達任何 PC' : '';
    return event(needsPC ? '營部催促進攻' : '鄰連領先',
      '本回合至少一枚友軍單位須進入比目前最前方友軍更遠的橫列'+condition+
      '。友軍已到第 '+lastRow+' 列'+skip+'時忽略。', 1);
  };
  const band = (from, to, outcomes) => ({from,to,rand:outcomes.length,results:outcomes});
  const eventOutcomes = (keys, custom = {}) =>
    keys.split(' ').map(key => custom[key] || events[key]);
  const friendly = (mission, lastRow) => {
    let early, late;
    if (mission === 3 || mission === 5) {
      early = 'radio radio lost lost wait wait rain mortar waypoint waypoint';
      late = 'radio radio radio lost wait wait rain mortar mortar waypoint';
    } else if (mission === 1 || mission === 2) {
      early = 'report radio artillery inspector holdLine advance pc pc supply supply';
      late = 'report radio artillery inspector holdLine advance pc supply supply supply';
    } else {
      const fourth = mission === 4 ? 'artillery' : 'tanks';
      const ninth = mission === 7 ? 'artillery' : 'regiment';
      early = 'report report radio '+fourth+' inspector holdLine advance pc '+ninth+' mortar';
      late = 'report radio '+fourth+' inspector holdLine advance pc '+ninth+' mortar supply';
    }
    const custom = {advance:advance(lastRow,false), pc:advance(lastRow,true)};
    return [band(2,6,eventOutcomes(early,custom)), band(7,10,eventOutcomes(late,custom))];
  };
  const enemy = (mission) => {
    const last = mission === 3 || mission === 5 ? 'shift' : mission === 1 || mission === 2 ? 'counterAll' : 'counterNear';
    const common = 'evacuate removeMortars removeLeaders removeMG rally rally retreat retreat ';
    const early = common + last+' '+last;
    if (mission === 1) return [band(2,10,eventOutcomes(early))];
    if (mission === 7) {
      return [band(2,6,eventOutcomes(common+'retreat retreat')),
        band(7,10,eventOutcomes('evacuate evacuate removeLeaders removeMG rally rally retreat retreat retreat retreat'))];
    }
    if (mission === 4) {
      return [band(2,5,eventOutcomes(early)),
        band(6,10,eventOutcomes('evacuate evacuate removeLeaders removeMG rally rally retreat retreat '+last+' '+last))];
    }
    const late = 'evacuate evacuate removeMortars removeLeaders removeMG rally rally retreat retreat '+last;
    return [band(2,6,eventOutcomes(early)), band(7,10,eventOutcomes(late))];
  };
  const contactData = [
    {
      eventPage: 18, contactPage: 19, lastRow: 3,
      names: '地雷 來襲砲火 狙擊手 地雷與重機槍巢 機槍巢 堅固據點 防禦陣地 碉堡 迫擊砲小組 FLAK-36高射砲 巡邏 火力基地'.split(' '),
      rolls: {
        A: [3, 5, 5, 6, 7, 7, 8, 10, 11, 11],
        B: [2, 2, 4, 5, 5, 5, 6, 6, 9, 10],
        C: [1, 1, 2, 2, 2, 2, 3, 4, 5, 5],
        counterA: [2, 2, 11, 12],
      }
    },
    {
      eventPage: 22, contactPage: 23, lastRow: 5,
      names: '來襲砲火 狙擊手 機槍巢 防禦陣地 堅固據點 強化防禦陣地 指揮所 迫擊砲陣地 機動 碉堡 火力基地'.split(' '),
      rolls: {
        A: [3, 3, 3, 4, 5, 6, 7, 8, 9, 10],
        B: [1, 1, 1, 2, 3, 3, 3, 3, 9, 9],
        C: [1, 1, 1, 2, 2, 3, 3, 3, 9, 9],
        counterA: [1, 1, 1, 9, 9, 9, 9, 11, 11, 11],
      }
    },
    {
      eventPage: 26, contactPage: 27, lastRow: 4,
      names: '地雷 來襲砲火 輕機槍巢 重機槍巢 巡邏 照明與輕機槍 照明與巡邏 防禦陣地 堅固據點 碉堡 機動 迫擊砲陣地'.split(' '),
      rolls: {
        A: [3, 4, 4, 5, 8, 8, 9, 10, 11, 12],
        B: [1, 1, 2, 2, 2, 3, 5, 6, 6, 7],
        C: [1, 1, 2, 2, 2, 3, 5, 5, 6, 7],
      }
    },
    {
      eventPage: 30, contactPage: 31, lastRow: 4,
      names: '地雷 來襲砲火 狙擊手 機槍巢 機動 反戰車武器 防禦陣地 堅固據點 指揮所 重武器 迫擊砲陣地 火力基地'.split(' '),
      rolls: {
        A: [4, 6, 6, 7, 7, 8, 9, 10, 10, 11],
        B: [1, 1, 1, 2, 2, 2, 4, 4, 6, 6],
        C: [1, 1, 1, 2, 2, 3, 4, 4, 4, 5],
        counterA: [2, 2, 2, 5, 5, 5, 5, 12, 12, 12],
      }
    },
    {
      eventPage: 34, contactPage: 35, lastRow: 4,
      names: '地雷 來襲砲火 輕機槍巢 重機槍巢 巡邏 照明與輕機槍 照明與巡邏 防禦陣地 堅固據點 指揮所 機動 迫擊砲陣地'.split(' '),
      rolls: {
        A: [3, 4, 4, 5, 8, 8, 9, 10, 11, 12],
        B: [1, 1, 2, 2, 2, 5, 6, 6, 7, 7],
        C: [1, 1, 2, 2, 2, 3, 5, 5, 6, 7],
      }
    },
    {
      eventPage: 39, contactPage: 40, lastRow: 5,
      names: '地雷 來襲砲火 狙擊手 輕機槍巢 重機槍巢 巡邏 迫擊砲小組 反戰車武器 防禦陣地 機動 重武器 火力基地'.split(' '),
      rolls: {
        A: [4, 4, 5, 7, 8, 9, 9, 10, 11, 11],
        B: [1, 2, 2, 3, 3, 4, 4, 7, 8, 8],
        C: [1, 1, 1, 2, 2, 3, 4, 4, 4, 6],
        counterA: [2, 2, 2, 10, 10, 10, 10, 12, 12, 12],
      }
    },
    {
      eventPage: 45, contactPage: 46, lastRow: 6,
      names: '地雷 來襲砲火 狙擊手 輕機槍巢 重機槍巢 巡邏 迫擊砲小組 反戰車武器 防禦陣地 機動 步兵砲'.split(' '),
      rolls: {
        A: [4, 5, 6, 7, 8, 8, 9, 9, 10, 11],
        B: [1, 2, 2, 3, 4, 4, 4, 7, 8, 8],
        C: [1, 1, 2, 2, 3, 3, 4, 4, 6, 6],
      }
    },
  ];
  window.FOF_TABLES = {};
  contactData.forEach((data, index) => {
    const mission = index + 1;
    const contact = {};
    for (const [key, ids] of Object.entries(data.rolls)) {
      contact[key] = {rand:ids.length, results:ids.map(id => ({id,title:data.names[id-1]}))};
    }
    window.FOF_TABLES['N'+mission] = {eventPage:data.eventPage,contactPage:data.contactPage,
      friendly:friendly(mission,data.lastRow), enemy:enemy(mission), contact};
  });
})();
