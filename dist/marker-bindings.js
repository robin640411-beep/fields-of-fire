/* Field manual positions after completing each cursor range, inclusive. */
window.FOF_MARKER_BINDINGS = {
  P2: [
    {"kind": "cover", "at": "B3", "mark": "散兵坑", "units": ["g"], "from": 0, "to": 30},
    {"kind": "cover", "at": "B3", "mark": "散兵坑", "units": ["par"], "from": 31, "to": 37}
  ],
  P3: [
    {"kind": "cover", "at": "C2", "mark": "散兵坑", "units": ["enemy"], "from": 13, "to": 35},
    {"kind": "cover", "at": "C2", "mark": "散兵坑", "units": ["deLoss"], "from": 36, "to": 37},
    {"kind": "hidden", "at": "C2", "mark": "未發現", "units": ["enemy"], "from": 13, "to": 23},
    {"from": 24, "to": 28, "at": "A2", "toward": "C2", "kind": "direction", "mark": "PDF 至 C2"},
    {"from": 24, "to": 37, "at": "C1", "toward": "C2", "kind": "direction", "mark": "PDF 至 C2"},
    {"from": 25, "to": 37, "at": "B1", "toward": "C2", "kind": "direction", "mark": "PDF 至 C2"}
  ],
  C1: [
    {"kind": "cover", "at": "B3", "mark": "戰壕", "units": ["west"], "from": 0, "to": 43},
    {"kind": "cover", "at": "B3", "mark": "戰壕", "units": ["west-last", "west-loss"], "from": 44, "to": 47},
    {"kind": "cover", "at": "B3", "mark": "戰壕", "units": ["west-loss"], "from": 48, "to": 49},
    {"kind": "cover", "at": "B3", "mark": "掩體（右下）", "units": ["b3-loss"], "from": 44, "to": 49, "toward":"C2"},
    {"kind": "cover", "at": "B3", "mark": "掩體（右下）", "units": ["bunker-mg"], "from": 0, "to": 43, "toward": "C2"},
    {"kind": "cover", "at": "C3", "mark": "戰壕", "units": ["east"], "from": 0, "to": 45},
    {"kind": "cover", "at": "C3", "mark": "戰壕", "units": ["east-last", "c3-loss"], "from": 46, "to": 47},
    {"kind": "cover", "at": "C3", "mark": "戰壕", "units": ["c3-loss"], "from": 48, "to": 49},
    {"kind": "cover", "at": "C2", "mark": "散兵坑", "units": ["hill-mg"], "from": 0, "to": 32},
    {"kind": "cover", "at": "C2", "mark": "散兵坑", "units": ["de-para"], "from": 33, "to": 38},
    {"kind": "cover", "at": "C2", "mark": "散兵坑", "units": ["c2-loss"], "from": 39, "to": 49},
    {"kind": "hidden", "at": "B3", "mark": "未發現", "units": ["west", "bunker-mg"], "from": 0, "to": 42},
    {"kind": "hidden", "at": "C3", "mark": "未發現", "units": ["east"], "from": 0, "to": 29},
    {"kind": "hidden", "at": "C2", "mark": "未發現", "units": ["hill-mg"], "from": 0, "to": 10},
    {"kind": "carry", "at": "B1", "mark": "搬運傷亡", "units": ["us-loss"], "from": 27, "to": 36, "host": "s1"},
    {"from": 7, "to": 12, "at": "C2", "toward": "B1", "kind": "direction", "mark": "PDF 至 B1"},
    {"from": 11, "to": 20, "at": "D1", "toward": "C2", "kind": "direction", "mark": "PDF 至 C2"},
    {"from": 13, "to": 31, "at": "C2", "toward": "D1", "kind": "direction", "mark": "PDF 至 D1"},
    {"from": 21, "to": 38, "at": "D2", "toward": "C2", "kind": "direction", "mark": "PDF 至 C2"},
    {"from": 21, "to": 47, "at": "C3", "toward": "D2", "kind": "direction", "mark": "PDF 至 D2"},
    {"from": 24, "to": 38, "at": "B1", "toward": "C2", "kind": "direction", "mark": "PDF 至 C2"},
    {"from": 42, "to": 47, "at": "D2", "toward": "C3", "kind": "direction", "mark": "PDF 至 C3"}
  ],
  E1: [
    {"kind": "cover", "at": "A1", "mark": "堅固建築", "units": ["sgt"], "from": 15, "to": 15},
    {"kind": "cover", "at": "A1", "mark": "堅固建築", "units": ["s2"], "from": 17, "to": 22},
    {"kind": "cover", "at": "A1", "mark": "堅固建築", "units": ["s2", "sgt"], "from": 23, "to": 66},
    {"kind": "cover", "at": "B2", "mark": "戰壕", "units": ["g1"], "from": 30, "to": 66},
    {"kind": "cover", "at": "C2", "mark": "掩體", "units": ["g2", "hmg"], "from": 31, "to": 66, "toward": "C1"},
    {"kind": "hidden", "at": "B2", "mark": "未發現", "units": ["g1"], "from": 30, "to": 44},
    {"kind": "hidden", "at": "C2", "mark": "未發現", "units": ["g2", "hmg"], "from": 31, "to": 51}
  ],
  V1: [
    {"kind": "cover", "at": "C2", "mark": "戰壕", "units": ["rocket"], "from": 0, "to": 53},
    {"kind": "cover", "at": "C1", "mark": "堅固建築", "units": ["lmg", "hq"], "from": 14, "to": 39},
    {"kind": "cover", "at": "C1", "mark": "堅固建築", "units": ["lmg"], "from": 40, "to": 68},
    {"kind": "cover", "at": "C1", "mark": "堅固建築", "units": ["lmg"], "from": 13, "to": 13},
    {"kind": "cover", "at": "B1", "mark": "基本掩蔽 +1", "units": ["hq"], "from": 42, "to": 68},
    {"kind": "cover", "at": "A2", "mark": "堅固建築", "units": ["s1"], "from": 49, "to": 68},
    {"kind": "hidden", "at": "C2", "mark": "未發現", "units": ["rocket"], "from": 0, "to": 22},
    {"kind": "carry", "at": "A2", "mark": "殘骸", "units": ["crew", "loss14"], "from": 58, "to": 68, "host": "wreck14"}
  ],
  V2: [
    {"kind": "cover", "at": "C2", "mark": "散兵坑", "units": ["old-litter"], "from": 6, "to": 22},
    {"kind": "target", "at": "C2", "mark": "雪曼 13：VOF A", "units": ["sh13"], "from": 17, "to": 22},
    {"kind": "carry", "at": "B2", "mark": "殘骸", "units": ["m5crew"], "from": 16, "to": 22, "host": "wreck5"}
  ],
  D1: [
    {"kind": "cover", "at": "A1", "mark": "散兵坑 × 2", "units": ["p1s2"], "from": 9, "to": 19, "slot": 1},
    {"kind": "cover", "at": "B1", "mark": "散兵坑 × 2", "units": ["p1s3"], "from": 9, "to": 19, "slot": 2},
    {"kind": "cover", "at": "C1", "mark": "散兵坑 × 2", "units": ["p3s2"], "from": 11, "to": 19, "slot": 1},
    {"kind": "cover", "at": "C1", "mark": "散兵坑 × 2", "units": ["p3s3"], "from": 11, "to": 19, "slot": 2},
    {"kind": "cover", "at": "D1", "mark": "散兵坑 × 2", "units": ["50", "hm2"], "from": 12, "to": 19, "slot": 1},
    {"kind": "cover", "at": "D1", "mark": "散兵坑 × 2", "units": ["r57-3", "mtr"], "from": 11, "to": 11, "slot": 2},
    {"kind": "cover", "at": "D1", "mark": "散兵坑 × 2", "units": ["sgt", "r57-3", "mtr"], "from": 12, "to": 19, "slot": 2},
    {"kind": "cover", "at": "E1", "mark": "散兵坑 × 2", "units": ["p2s2"], "from": 10, "to": 19, "slot": 1},
    {"kind": "cover", "at": "E1", "mark": "散兵坑 × 2", "units": ["hm1"], "from": 13, "to": 19, "slot": 2},
    {"kind": "cover", "at": "F1", "mark": "散兵坑 × 2", "units": ["p2s3"], "from": 10, "to": 19, "slot": 1},
    {"kind": "cover", "at": "F1", "mark": "散兵坑 × 2", "units": ["mg2"], "from": 10, "to": 19, "slot": 2},
    {"kind": "cover", "at": "A2", "mark": "散兵坑 × 2", "units": ["p1s1"], "from": 9, "to": 19, "slot": 1},
    {"kind": "cover", "at": "A2", "mark": "散兵坑 × 2", "units": ["mg1", "r57-1"], "from": 9, "to": 19, "slot": 2},
    {"kind": "cover", "at": "B2", "mark": "散兵坑 × 2", "units": ["pl1", "arty"], "from": 9, "to": 19, "slot": 1},
    {"kind": "cover", "at": "B2", "mark": "散兵坑 × 2", "units": ["r75-1"], "from": 9, "to": 19, "slot": 2},
    {"kind": "cover", "at": "C2", "mark": "散兵坑 × 2", "units": ["baz1"], "from": 9, "to": 19, "slot": 1},
    {"kind": "cover", "at": "C2", "mark": "散兵坑 × 2", "units": ["p3s1"], "from": 11, "to": 19, "slot": 2},
    {"kind": "cover", "at": "D2", "mark": "散兵坑 × 2", "units": ["mg3"], "from": 11, "to": 19, "slot": 1},
    {"kind": "cover", "at": "D2", "mark": "散兵坑 × 2", "units": ["pl3", "baz3"], "from": 11, "to": 19, "slot": 2},
    {"kind": "cover", "at": "E2", "mark": "散兵坑 × 2", "units": ["r57-2", "baz2", "pl2"], "from": 10, "to": 19, "slot": 1},
    {"kind": "cover", "at": "E2", "mark": "散兵坑 × 2", "units": ["p2s1"], "from": 10, "to": 19, "slot": 2},
    {"kind": "cover", "at": "F2", "mark": "散兵坑 × 2", "units": ["mfo"], "from": 10, "to": 19, "slot": 1},
    {"kind": "cover", "at": "F2", "mark": "散兵坑 × 2", "units": ["r75-2"], "from": 10, "to": 19, "slot": 2},
    {"kind": "target", "at": "D1", "mark": "FPL 右向", "units": ["hm2"], "from": 12, "to": 19, "toward": "E1"},
    {"kind": "target", "at": "E1", "mark": "FPL 左向", "units": ["hm1"], "from": 13, "to": 19, "toward": "D1"}
  ]
};
window.FOF_LESSON_FRONTAGE = {
  C1: [
    {from:46,to:47,at:"D2",whole:"P"},
    {from:48,to:49,at:"D2",whole:null}
  ],
  P3: [
    {"from": 31, "to": 37, "at": "C2", "whole": "A", "friendly": null, "enemy": null}
  ],
  C2: [
    {"from": 31, "to": 36, "at": "A2", "whole": null, "friendly": "S", "enemy": "A"}
  ],
  C3: [
    {"from": 43, "to": 48, "at": "A2", "whole": null, "friendly": "S", "enemy": "A"}
  ],
  V2: [
    {"from": 12, "to": 14, "at": "B2", "whole": "S", "friendly": null, "enemy": "A"}
  ]
};
