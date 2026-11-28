(() => {
'use strict';

const RULES = {
  '2': {
    title: '§2 遊戲配件與地形卡',
    body: '說明地形卡、行動牌組、單位算子與各類標記的基本讀法。地形卡標示基本掩蔽與隱蔽修正、來襲修正、掩蔽潛力、尋找掩蔽張數以及八個方向的視線（LOS）邊界。'
  },
  '2–6': {
    title: '§2–§6 核心規則總覽',
    body: '涵蓋《Fields of Fire Deluxe》第三版核心流程：§2 配件與地形卡、§3 回合順序、§4 指揮與命令點（移動、通訊、煙霧與掩蔽）、§5 潛在接敵（PC）與敵軍配置、§6 射擊、火力量（VOF）與戰鬥結算。'
  },
  '3': {
    title: '§3 回合順序（Sequence of Play）',
    body: '每回合依序進行：1. 友軍上級事件 → 2. 友軍命令階段（啟動各級指揮部、執行命令與一般主動點）→ 3. 敵軍活動（防禦任務則先於友軍命令）→ 4. 雙方俘虜與撤退 → 5. 反戰車戰鬥與車輛移動 → 6. 雙方戰鬥（接敵檢查與火力結算）→ 7. 整理階段（移除暴露標記、結算任務條件）。'
  },
  '3.1': {
    title: '§3.1 友軍上級指揮部事件階段（自第 2 回合起）',
    body: '抽 1 張行動卡；若有指揮部（HQ）圖示，查友軍上級指揮部事件表決定本回合事件。'
  },
  '3.3': {
    title: '§3.3 友軍指揮階段',
    body: '依序進行啟動步驟（營部 → 連部 → 排部／連幕僚）與主動行動步驟（未啟動之指揮部與一般主動行動）。發令者與受令單位須在指揮鏈內且保持通訊。'
  },
  '3.3.2d': {
    title: '§3.3.2d 一般主動行動時段',
    body: '抽 1 張行動卡，對任何單位使用等於卡上未修正主動行動命令點數的命令點。若為單排任務，先將數量減半（無條件捨去）。一般主動行動命令點不得保留。'
  },
  '3.7': {
    title: '§3.7 雙方戰鬥階段',
    body: '依序執行：3.7.1 火力任務更新 → 3.7.2 潛在接敵判定（逐枚 PC 結算並立即放置敵軍與更新活動等級）→ 3.7.3 壓制恢復 → 3.7.4 戰鬥效果步驟。'
  },
  '3.7.2': {
    title: '§3.7.2 潛在接敵判定步驟',
    body: '每張同時有 PC 標記與友軍單位的卡牌，依 PC 級別與目前活動等級在 PC 抽卡表查應抽行動卡張數。若抽到「Contact」即發生敵軍接觸，立即配置敵軍與火力量／主要射向標記並更新目前活動等級，再處理下一枚 PC 標記。'
  },
  '3.7.4': {
    title: '§3.7.4 戰鬥效果步驟',
    body: '對有火力量標記卡牌上的每個步兵單位：決定淨戰鬥修正值（NCM）→ 抽 1 張行動卡判斷火力是否有效（HIT／PIN／MISS）→ 若命中，再抽 1 張行動卡依單位經驗判斷命中效果。'
  },
  '3.8': {
    title: '§3.8 整理階段',
    body: '移除信號煙火、煙霧、照明、暴露、已移動／射擊等標記；後送傷亡人員；防禦任務移除尚未結算的 PC 標記；並依結果調整火力量、主要射向與活動等級。'
  },
  '3.9': {
    title: '§3.9 任務重試與重新編組',
    body: '當任務中斷或失敗並選擇重試時，保留既有地圖地形、尚存的敵軍與未結算的潛在接敵（PC）以及已計分牌面；友軍依規則重新編組、補充兵力並自起始位置再次展開進攻。'
  },
  '4': {
    title: '§4 指揮、命令點與行動',
    body: '各級指揮部於友軍命令階段抽取行動牌，讀取鋼盔內數字作為可用命令點，用來下達移動、尋找掩蔽、重整、轉移射擊、施放煙霧等行動；未用完的排部／連部命令點可依經驗等級上限保留至下一回合。'
  },
  '4.2.2a': {
    title: '§4.2.2a 移至相鄰牌（Move to Adjacent Card）',
    body: '花費 1 點命令可令單一未受壓制單位移至相鄰（含斜角，視集結區與規則而定）的地形卡。抵達新牌後該單位標記為「暴露（Exposed）」，並失去原本的掩蔽狀態；排部亦可花費 2 點執行全排同步移動。'
  },
  '4.2.2e': {
    title: '§4.2.2e 嘗試尋找掩蔽（成本 1 點）',
    body: '消耗 1 點命令。由未受壓制且不在掩蔽下的正常狀態單位執行，依所在地形卡的掩蔽抽卡數（老兵 +1、新兵 −1）抽行動卡找「Cover」圖示；成功則放置掩蔽標記並標為暴露，失敗無事發生。'
  },
  '4.2.3a': {
    title: '§4.2.3a 嘗試移除受壓制標記（成本 1 點）',
    body: '消耗 1 點命令。若單位所在卡牌無火力量標記則自動成功移除受壓制；若有火力量標記，則抽 2（± 經驗修正）張行動卡找「Rally」圖示，抽到即成功移除受壓制，否則無事發生。'
  },
  '4.3.1': {
    title: '§4.3.1 目視與口令指揮（Visual / Voice Command）',
    body: '沒有無線電或電話的單位須仰賴目視／口令受令。一般情況下，發令的指揮部與受令單位必須雙方都未受壓制，且位於同一張地形卡的同一區域（同在掩蔽內或同在掩蔽外），方可傳達命令。'
  },
  '4.3.4': {
    title: '§4.3.4 電話線與通訊檢查',
    body: '集結區牌之間預設具電話連線，並可延伸至第 1 列已架設電話線的地形卡。若因事件或砲火導致線路中斷，受影響的指揮部無法透過電話傳令，須重新檢查無線電、傳令兵或目視通訊鏈。'
  },
  '4.4.3': {
    title: '§4.4.3 白磷煙霧（WP Smoke）與遮蔽效果',
    body: '白磷煙霧同時具備殺傷與煙幕雙重效果：先依 §7.17 對承受特殊火力的目標結算 −4 攻擊修正，隨後於該牌留下煙霧標記，對穿過或位於該牌的視線與射擊套用 +1 煙霧保護修正。'
  },
  '5': {
    title: '§5 潛在接敵（PC）與敵軍配置',
    body: '當友軍進入或接近含有潛在接敵標記（PC A/B/C）的地形卡，於雙方戰鬥階段依目前敵軍活動程度抽取對應張數的行動牌。若出現接敵圖示，則依任務書的敵軍配置表抽出組合並部署敵軍與標記。'
  },
  '6': {
    title: '§6 射擊與雙方戰鬥',
    body: '所有具視線且符合開火條件的單位會建立主要射向（PDF）並對目標牌施加火力量（VOF：S 輕兵器、A 自動武器、H 重武器）。雙方戰鬥階段依序抽行動牌並套用地形掩蔽、暴露（−2）與壓制修正，結算 HIT、PIN 或 MISS。'
  },
  '6.1': {
    title: '§6.1 自動開火與更新射向',
    body: '當單位發現敵軍且符合射擊條件時會自動開火，不需花費命令點。系統直接為其標記主要射向（PDF）並對目標牌施加對應火力量（VOF），於戰鬥階段自動結算。'
  },
  '7.2.4': {
    title: '§7.2.4 最後防護線（FPL）',
    body: '火力量上方印有箭頭的機槍算子可配置「最後防護線（FPL）」標記。配置後會等待連部發出信號，啟動時沿斜箭頭方向施加 H（重武器）火力量。若改下「轉移射擊」命令，則移除 FPL 並恢復一般主要射向處理。'
  },
  '7.9.2': {
    title: '§7.9.2 闊劍地雷（Claymore Mine）',
    body: '闊劍地雷平時留在任務指定的地形卡上；當指定同牌敵軍引爆時，對該目標單位直接施加 −4 火力量攻擊，並於整理階段移除該地雷標記。'
  },
  '7.16.2': {
    title: '§7.16.2 白磷火力任務（Incoming WP）',
    body: '白磷砲擊／迫擊砲來襲生效時，依標記上所印的火力量修正（−3 或 −4）對該牌單位進行特殊火力攻擊，並於攻擊後在該牌留下對應的煙霧效果。'
  },
  '7.17': {
    title: '§7.17 白磷特殊火力結算',
    body: '白磷彈藥對無頂蓋掩蔽或暴露目標具高度殺傷力，結算時區分承受特殊火力攻擊的目標與僅受煙霧遮蔽保護的單位。'
  },
  '8': {
    title: '§8 掩蔽、傷亡與重整',
    body: '說明單位尋找掩蔽（依地形卡「尋找掩蔽」張數抽牌）、受壓制後嘗試重整恢復、以及傷亡人員（Casualty）的紀錄、擔架組後送與兵力階數扣減規則。'
  },
  '9.1': {
    title: '§9.1 天候與雨天能見度修正',
    body: '下雨時放置雨天標記，全場能見度修正增加 +2，縮短視線距離並影響遠距離射擊與觀測；除非任務另有規定，雨天標記於回合結束的整理階段移除。'
  },
  '9.2': {
    title: '§9.2 照明彈（Illumination）',
    body: '夜間作戰中，迫擊砲、砲兵、手持或空投照明彈放置於目標牌後，依標記所印的照明範圍與數值降低夜間能見度懲罰，使雙方更容易發現並射擊受照亮區域的單位。'
  },
  '12': {
    title: '§12 戰役與任務結算',
    body: '說明連續戰役的回合時限、勝利條件判定、經驗值（XP）累計、部隊損耗繼承與任務間的連隊重新編組流程。'
  }
};

function lookupRule(ref) {
  const clean = ref.replace(/^§+/, '').trim();
  if (RULES[clean]) return RULES[clean];
  // Try stripping trailing letter (e.g. 4.2.2a -> 4.2.2) or falling back to parent section
  const parts = clean.split('.');
  while (parts.length > 0) {
    const key = parts.join('.');
    if (RULES[key]) return RULES[key];
    const noLetter = key.replace(/[a-zA-Z]+$/, '');
    if (RULES[noLetter]) return RULES[noLetter];
    parts.pop();
  }
  return {
    title: '規則 §' + clean,
    body: '請參考《Fields of Fire Deluxe》第三版規則書第 §' + clean + ' 節。'
  };
}

let dlg;
function showRule(ref) {
  if (!dlg) {
    dlg = document.createElement('dialog');
    dlg.id = 'ruleDialog';
    dlg.innerHTML = '<div class="modalhead"><h2 id="ruleDialogTitle"></h2><button type="button" id="ruleDialogClose" aria-label="關閉">×</button></div><div class="modalcontent"><p id="ruleDialogBody"></p><div class="buttonrow"><button type="button" class="primary" id="ruleDialogOk">知道了</button></div></div>';
    document.body.append(dlg);
    dlg.querySelector('#ruleDialogClose').addEventListener('click', () => dlg.close());
    dlg.querySelector('#ruleDialogOk').addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', e => { if (e.target === dlg) dlg.close(); });
  }
  const info = lookupRule(ref);
  dlg.querySelector('#ruleDialogTitle').textContent = info.title.replace(/§/g, '');
  dlg.querySelector('#ruleDialogBody').textContent = info.body.replace(/§(\d+(?:\.\d+)*[a-zA-Z]?(?:[–-]\d+(?:\.\d+)*)?)/g, '($1)');
  if (!dlg.open) dlg.showModal();
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);
const RULE_RE = /§\d+(?:\.\d+)*[a-zA-Z]?(?:[–-]\d+(?:\.\d+)*)?/g;

function linkifyNode(root) {
  if (!root || (root.nodeType === 1 && (SKIP_TAGS.has(root.tagName) || root.id === 'ruleDialog'))) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !node.nodeValue.includes('§')) return NodeFilter.FILTER_REJECT;
      const p = node.parentElement;
      if (!p || SKIP_TAGS.has(p.tagName) || p.closest('#ruleDialog,.rule-ref')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) nodes.push(n);
  for (const textNode of nodes) {
    const text = textNode.nodeValue;
    RULE_RE.lastIndex = 0;
    let last = 0, match;
    const frag = document.createDocumentFragment();
    while ((match = RULE_RE.exec(text))) {
      if (match.index > last) frag.append(text.slice(last, match.index));
      const num = match[0].replace(/^§+/, '');
      const prevChar = text[match.index - 1] || '';
      const nextChar = text[match.index + match[0].length] || '';
      const inParens = (prevChar === '(' || prevChar === '（') && (nextChar === ')' || nextChar === '）');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'rule-ref';
      btn.dataset.rule = num;
      btn.textContent = inParens ? num : '(' + num + ')';
      frag.append(btn);
      last = match.index + match[0].length;
    }
    if (last === 0) continue;
    if (last < text.length) frag.append(text.slice(last));
    textNode.replaceWith(frag);
  }
}

document.addEventListener('click', e => {
  const btn = e.target.closest('.rule-ref');
  if (!btn) return;
  e.preventDefault();
  e.stopPropagation();
  showRule(btn.dataset.rule);
}, true);

const observer = new MutationObserver(mutations => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeType === 1 || node.nodeType === 3) linkifyNode(node.nodeType === 3 ? node.parentElement : node);
    }
  }
});

window.addEventListener('DOMContentLoaded', () => {
  const stripBtnSection = root => {
    if (!root || root.nodeType !== 1) return;
    for (const b of root.querySelectorAll('button:not(.rule-ref)')) {
      if (b.textContent && b.textContent.includes('§')) {
        b.textContent = b.textContent.replace(/§(\d+(?:\.\d+)*[a-zA-Z]?)/g, '$1');
      }
    }
  };
  linkifyNode(document.body);
  stripBtnSection(document.body);
  const fullObserver = new MutationObserver(mutations => {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType === 1) { linkifyNode(node); stripBtnSection(node); }
        else if (node.nodeType === 3) linkifyNode(node.parentElement);
      }
    }
  });
  fullObserver.observe(document.body, { childList: true, subtree: true });
});
})();
