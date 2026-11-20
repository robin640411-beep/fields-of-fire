// Transcribed from the displayed counter faces. Fields follow series rules 1.2.3, 6.2 and 7.
(() => {
  const faces = Object.create(null);
  const fires = {
    S:'輕兵器火力量，戰鬥修正為 0。',
    A:'自動武器火力量，戰鬥修正為 −1。',
    H:'重武器火力量，戰鬥修正為 −3。',
    'A/S':'依距離切換。與目標同牌時用 A（自動武器，−1），其他射程用 S（輕兵器，0）。',
    'G!':'特殊火力量，可嘗試榴彈攻擊。驚嘆號標示此攻擊使用專屬規則。',
    'S!':'狙擊手火力量。同牌其他單位受輕兵器火力（0），選中的單位受狙擊火力（−3）。'
  };
  const ranges = {
    P:'貼近距離，只能對同張地形牌使用此火力。',
    C:'最遠為近距離，即相鄰地形牌。',
    L:'最遠為遠距離，即距本牌 2 張牌。',
    V:'最遠為極遠距離，即距本牌 3 張牌。',
    'C-L':'最短為相鄰牌，最遠為距本牌 2 張牌。不能對同牌使用此迫擊砲。',
    'C-V':'最短為相鄰牌，最遠為距本牌 3 張牌。不能對同牌使用此迫擊砲。'
  };
  const icon = {
    helmet:'鋼盔上的階級標誌識別指揮人員。使用指揮面時，依職務執行命令或幕僚行動。',
    binoculars:'望遠鏡識別原單位的觀測或空中管制職務。使用觀測面時，可呼叫相應的地圖外支援。',
    division:'盾牌、白星與人像是美軍第 2 步兵師的師徽。',
    lightning:'紅底閃電是美軍第 25「熱帶閃電」步兵師的師徽。',
    rifle:'步槍圖案識別這個步兵單位。',
    automatic:'自動武器圖案識別這個步兵單位。',
    mg:'機槍圖案識別這個單位的武器。',
    mortar:'迫擊砲圖案識別這個單位的武器。',
    launcher:'火箭筒圖案識別這個單位的武器。',
    rcl:'無後座力砲圖案識別這個單位的武器。',
    sniper:'帶瞄準鏡的步槍識別狙擊手。',
    rank:'階級徽章識別敵軍領導者。不同徽章沿用相同的領導者規則。',
    redstar:'紅星識別此部隊的領導者。',
    stretcher:'擔架圖案代表擔架組，屬有限行動小組。',
    arrow:'指向橫線的黃箭頭代表癱瘓組，屬有限行動小組。',
    cross:'紅十字代表傷亡人員，等待後送或被俘。'
  };
  const tripod = ['帶刻線的黃箭頭','火力量上方的箭頭表示三腳架機槍，可使用掠射、超越射擊及最終防護射線（7.2.1）。'];
  const grenade = ['上標 G!','保有左下的基本火力量，另可依規則 7.10 嘗試榴彈攻擊。'];
  const launcherGrenade = ['上標 G!','除基本火力外，班內榴彈發射器可對相鄰牌嘗試榴彈攻擊（7.7）。'];
  const namedFire = ['Fire Team','這一面是原單位的具名火力組，使用本面印的數值與有限行動小組規則。'];
  const koreanFlag = ['太極旗','韓國國旗標示編入美軍的韓籍增援兵（KATUSA）。'];
  function put(id, label, description, symbol, steps, fire, range, extras = []) {
    const rows = [];
    if (label) rows.push([label, description]);
    if (symbol) rows.push(['中央圖示', icon[symbol] || symbol]);
    if (fire) rows.push([fire+' · 左下', fires[fire]]);
    rows.push(['●'.repeat(steps)+' · 下方黃點',`每點代表 1 個兵力階，此面共 ${steps} 階。`]);
    if (range) rows.push([range+' · 右下', ranges[range]]);
    if (!fire && !range && !['cross','stretcher','arrow'].includes(symbol)) {
      rows.push(['下方兩側留白','這一面沒有印列火力量與射程。']);
    }
    faces[id] = rows.concat(extras);
  }
  function team(id, kind, symbol, fire, range, opts = {}) {
    const labels = {assault:'Assault Team',fire:'Fire Team',litter:'Litter Team',paralyzed:'Paralyzed'};
    const descriptions = {
      assault:'突擊組，屬有限行動小組。', fire:'火力組，屬有限行動小組。',
      litter:'擔架組，沒有印列火力量。', paralyzed:'癱瘓組，沒有印列火力量。'
    };
    const label = opts.label === undefined ? labels[kind] : opts.label;
    put(id, label, descriptions[kind], symbol, 1, fire, range, opts.extra);
  }
  function casualty(id, steps) { put(id, '', '', 'cross', steps); }
  for (let platoon=1; platoon<=3; platoon++) {
    const hqId = platoon === 1 ? 'hq' : 'hq'+platoon;
    put(hqId,`${platoon} PLT HQ`,`第 ${platoon} 排指揮部。PLT 是排，HQ 是指揮部。`,'helmet',1);
    for (let squad=1; squad<=3; squad++) {
      const id = platoon === 1 ? 's'+squad : 'p'+platoon+'s'+squad;
      const text = `第 ${platoon} 排第 ${squad} 班。斜線前是班號，後是排號，PLT 表示排。`;
      put(id,`${squad}/${platoon} PLT`,text,'division',3,'S','L');
      put('vn-sq-'+squad+platoon,`${squad}/${platoon} PLT`,text,'lightning',3,'A/S','L',[launcherGrenade]);
    }
  }
  put('vn-hq4','4 PLT HQ','第 4 排指揮部。PLT 是排，HQ 是指揮部。','helmet',1);
  put('co-hq','CO HQ','連指揮部。CO 是連，HQ 是指揮部。','helmet',1);
  put('co-xo','CO XO','連副官。CO 是連，XO 是副官。','helmet',1);
  put('first-sgt','CO 1 SGT','連士官長。CO 是連，1 SGT 是 First Sergeant 的縮寫。','helmet',1);
  put('kr-hmg-hq','HMG PLT HQ','重機槍（HMG）排（PLT）指揮部（HQ）。','helmet',1);
  put('bn','Bn Commander','營長，上級指揮單位。Bn 表示營。','銀色葉形階級章代表營長。',1);
  put('fo','Mtr FO','迫擊砲前進觀測員。Mtr 是迫擊砲，FO 是前進觀測員。','binoculars',1);
  put('arty-fo','ARTY FO','砲兵前進觀測員。ARTY 是砲兵，FO 是前進觀測員。','binoculars',1);
  for (const id of ['kr-fac','vn-fac']) put(id,'FAC','前進空中管制員，負責遊戲中的空中支援任務。','binoculars',1);
  for (let n=1; n<=2; n++) {
    put('runner'+n,n+'/Runner',`第 ${n} 傳令兵，協助連部與排部通信。`,'rifle',1);
    put(n===1?'lmg':'lmg2',n+'/LMG',`第 ${n} 輕機槍組。LMG 表示輕機槍。`,'mg',1,'A','L');
    put('hmg'+n,n+'/1 HMG',`重機槍第 1 分隊第 ${n} 組。HMG 表示重機槍。`,'mg',1,'A','V',[tripod]);
  }
  put('hmg50','.50 cal HMG','點五〇口徑重機槍組。.50 cal 表示口徑，HMG 是重機槍。','mg',1,'H','V',[tripod]);
  for (let n=1; n<=3; n++) {
    put(n===1?'at':'at'+n,n+'/AT',`第 ${n} 反戰車組。AT 表示反戰車。`,'launcher',1,'S','C',[grenade]);
    put('usmtr'+n,n+'/Mtr',`第 ${n} 迫擊砲小組。Mtr 表示迫擊砲。`,'mortar',1,'G!','C-L');
    put('kr-mg-'+n,'1/W/'+n,`第 ${n} 排武器班的第 1 組（機槍）。W 表示武器班。`,'mg',1,'A','L');
    put('kr-baz-'+n,'2/W/'+n,`第 ${n} 排武器班的第 2 組（巴祖卡）。W 表示武器班。`,'launcher',1,'S','C',[grenade]);
    for (const caliber of [57,75]) {
      if (caliber===75 && n===3) continue;
      put('kr-rcl'+caliber+'-'+n,`${n}/${caliber}mm RCL`,`第 ${n} 無後座力砲組。RCL 是無後座力砲，${caliber} mm 是口徑。`,'rcl',1,caliber===57?'G!':'H','V');
    }
  }
  put('vn-mg1','1/W/1','第 1 排武器班第 1 機槍組。W 表示武器班。','mg',1,'A','L');
  put('vn-mg2','2/W/1','第 1 排武器班第 2 機槍組。W 表示武器班。','mg',1,'A','L');
  put('mtr','Mtr Sec','迫擊砲分隊。Mtr 表示迫擊砲，Sec 表示分隊。','mortar',3,'H','C-L');
  put('eng','ENGINEERS','工兵班。','rifle',3,'S','L');
  for (const prefix of ['','de-']) {
    team(prefix+'assault','assault','automatic','A','P',{label:prefix?'Assault Team':'Assault TM'});
    team(prefix+'fire','fire','rifle','S','C');
    team(prefix+'litter','litter','stretcher');
    team(prefix+'paralyzed','paralyzed','arrow');
    casualty(prefix+'casualty',1);
  }
  for(const n of [2,3])casualty('de-casualty-'+n,n);
  put('de-leader','LEADER','德軍領導者。','rank',1);
  put('de-at','1/PZRSCHCK','第 1 反戰車組。PZRSCHCK 是 Panzerschreck 反戰車火箭筒的縮寫。','launcher',1,'S','C',[grenade]);
  put('de-sniper','SNIPER!','德軍狙擊手。','sniper',1,'S!','L');
  put('de-lmg','1/LMG TM','第 1 輕機槍組。LMG 是輕機槍，TM 是小組。','mg',1,'A','L');
  put('de-hmg','1/HMG TM','第 1 重機槍組。HMG 是重機槍，TM 是小組。','mg',1,'A','V',[tripod]);
  put('de-arty','1/Arty Spotter','第 1 砲兵觀測員。Arty 是砲兵，Spotter 是觀測員。','binoculars',1);
  put('de-mtrfo','1/Mtr Spotter','第 1 迫擊砲觀測員。Mtr 是迫擊砲，Spotter 是觀測員。','binoculars',1);
  put('de-mtr','81mm Mtr Sec','81 公釐迫擊砲分隊。81mm 是口徑，Mtr 是迫擊砲，Sec 是分隊。','mortar',3,'H','C-V');
  for (let n=1; n<=4; n++) {
    put('de-gr'+n,n+'/Gp Gr',`德軍第 ${n} 擲彈兵班。Gp 識別班，Gr 識別擲彈兵。`,n===4?'rifle':'mg',3,n===4?'S':'A','L');
    if (n<=2) put('de-fj'+n,n+'/Gp FJ',`德軍第 ${n} 傘兵班。Gp 識別班，FJ 識別傘兵。`,'mg',3,'A','L');
  }
  // Fronts and backs are independent faces. For example an NKPA HMG has a
  // tripod symbol on both sides, while the CCF HMG's fire-team side has none.
  function pair(frontId, backId, label, description, symbol, fire, range, backFire, options = {}) {
    put(frontId,label,description,symbol,1,fire,range,options.front || []);
    put(backId,label,description,options.backIcon || symbol,1,backFire,'C',[namedFire,...(options.back || [])]);
  }
  function target(id, label, name) {
    faces[id] = [[label,name+'的地圖外火力目標標記。'],['黃色準星','準星標明該類火力登錄的地形牌。']];
  }
  for (let n=1; n<=5; n++) {
    for (const kind of ['lmg','hmg']) {
      if (n===5 && kind==='hmg') continue;
      const id = `army-ccf-${n}-${kind}`;
      const heavy = kind==='hmg';
      pair(id,id+'-b',`${n}/${kind.toUpperCase()}`,`第 ${n} ${heavy?'重':'輕'}機槍組。`,'mg','A',heavy?'V':'L','A',{front:heavy?[tripod]:[]});
    }
  }
  for (const [id,symbol,fire,range] of [
    ['assault-squad-rifle','rifle','S','P'],['assault-squad-smg','automatic','A','P'],
    ['sniper-squad','rifle','S','L'],['squad-rifle','rifle','S','C'],
    ['squad-grenade','榴彈圖案識別這個班使用的特殊火力量。','G!','P']
  ]) {
    for (const back of [false,true]) {
      put('army-ccf-'+id+(back?'-b':''),'CCF','韓戰中的中國人民志願軍。',symbol,back?2:3,fire,range);
    }
  }
  for (const [type,symbol,fire] of [['grenade','榴彈圖案識別這個小組的特殊火力量。','G!'],['rifle','rifle','S'],['smg','automatic','A']]) {
    team('army-ccf-assault-team-'+type+'-line','assault',symbol,fire,'P',{label:'Assault TM'});
  }
  team('army-ccf-fire-team-rifle-green','fire','rifle','S','C');
  team('army-ccf-lat-litter-team','litter','stretcher',null,null,{label:''});
  team('army-ccf-lat-paralysed-team','paralyzed','arrow',null,null,{label:''});
  for (let n=1; n<=4; n++) {
    casualty('army-ccf-casualty-'+n,n);
    for (const steps of [2,3]) {
      put('army-katusa-'+n+'-'+steps+'-step',n+'/KATUSA',`第 ${n} 韓籍增援兵班。KATUSA 指編入美軍的韓國士兵。`,null,steps,'S','L',[koreanFlag]);
    }
  }
  const katusaLabel = ['KATUSA','編入美軍的韓籍增援兵。'];
  for (const [key,type,symbol,fire,range] of [
    ['assault-team','assault','automatic','A','P'], ['fireteam-bar','fire','automatic','S','C'],
    ['fireteam','fire','rifle','S','C'], ['litter-team','litter','stretcher'], ['paralyzed','paralyzed','arrow']
  ]) team('army-katusa-'+key,type,symbol,fire,range,{label:type==='assault'?'Assault Tm':undefined,extra:[katusaLabel,koreanFlag]});
  pair('army-ccf-leader-1','army-ccf-leader-1-b','LEADER','中國人民志願軍領導者。','redstar',null,null,'A/S');
  for (let squad=1; squad<=3; squad++) {
    for (let platoon=1; platoon<=3; platoon++) {
      for (let company=1; company<=3; company++) {
        const id = 'army-nkpa-'+squad+platoon+company;
        for (const back of [false,true]) {
          put(id+(back?'b':''),[squad,platoon,company].join('/'),`北韓人民軍第 ${company} 連、第 ${platoon} 排、第 ${squad} 班。`,'rifle',back?2:3,'S','L');
        }
      }
    }
  }
  for (let n=1; n<=3; n++) {
    const mortar = 'army-nkpa-82mm-'+n;
    for (const steps of [2,3]) put(mortar+(steps===2?'-2-step':''),n+'/82mm Mtr',`第 ${n} 迫擊砲單位。82mm 是口徑，Mtr 是迫擊砲。`,'mortar',steps,'H','C-V');
    const leader = 'army-nkpa-leader-'+n;
    pair(leader,leader+'b','LEADER','北韓人民軍領導者。','rank',null,null,'A/S');
    for (const kind of ['arty','mtr']) {
      if (kind==='arty' && n===3) continue;
      const arty = kind==='arty';
      const spotter = 'army-nkpa-'+kind+'-spotter-'+n;
      pair(spotter,spotter+'b',n+(arty?'/Arty Spotter':'/Mtr Spotter'),`第 ${n} ${arty?'砲兵':'迫擊砲'}觀測員。Spotter 表示觀測員。`,'binoculars',null,null,'S');
    }
    for (let group=1; group<=4; group++) {
      const mg = 'army-nkpa-mg-'+group+n;
      pair(mg,mg+'b',`${group}/${n}/HMG`,`北韓人民軍重機槍組。前兩個數字是編制識別碼，HMG 表示重機槍。`,'mg','A','V','A',{front:[tripod],back:[tripod]});
      if (group>2) continue;
      const teamId = 'army-nkpa-mtr-'+group+n;
      pair(teamId+'-1-step',teamId+'b',`${group}/${n} Mtr`,`北韓人民軍迫擊砲組。前兩個數字是編制識別碼，Mtr 表示迫擊砲。`,'mortar','G!','C-V','S',{backIcon:'rifle'});
    }
  }
  pair('army-nkpa-hvy-mtr-spotter','army-nkpa-hvy-mtr-spotter-b','1/Hvy Mtr Spotter','第 1 重迫擊砲觀測員。Hvy 是重型，Mtr 是迫擊砲，Spotter 是觀測員。','binoculars',null,null,'S');
  pair('army-nkpa-sniper','army-nkpa-sniper-b','SNIPER!','北韓人民軍狙擊手。','sniper','S!','L','S');
  team('army-nkpa-lat-assault-team','assault','automatic','A','P',{label:'Assault Tm'});
  team('army-nkpa-lat-fire-team','fire','automatic','S','C');
  team('army-nkpa-lat-litter','litter','stretcher');
  team('army-nkpa-lat-paralyzed','paralyzed','arrow');
  for (const [id,label,name] of [
    ['arty','ARTY TARGET','砲兵'],['hvy-arty','HVY ARTY TARGET','重砲兵'],
    ['mtr','MTR TARGET','迫擊砲'],['hvy-mtr','HVY MTR TARGET','重迫擊砲']
  ]) target('army-nkpa-'+id+'-target',label,name);
  for (const army of ['nva','vc']) {
    const prefix = 'army-'+army+'-';
    const isNva = army==='nva';
    const org = isNva?'北越軍':'越共';
    const tag = army.toUpperCase();
    const faction = [tag,org+'的部隊識別。'];
    for (let n=1; n<=(isNva?11:9); n++) {
      const isShort = isNva && n>=10;
      const rifleGrenade = !isNva && n>=8;
      const fire = isNva && (n<=4 || isShort) ? 'A' : n>=5 && n<=(isNva?6:7) ? 'A/S' : 'S';
      const symbol = rifleGrenade?'步槍及榴彈發射器圖案識別這個班的武器。':fire==='S'?'rifle':fire==='A' && !isShort?'mg':'automatic';
      for (const back of [false,true]) {
        const baseId = isNva?n+'nva':String(n);
        put(prefix+baseId+(back?(isNva?'-b':'b'):''),n+'/'+tag,`${org}第 ${n} 班。`,symbol,back?2:3,fire,isShort?'P':'L',rifleGrenade?[launcherGrenade]:[]);
      }
    }
    if (isNva) {
      for (let a=1; a<=3; a++) for (let b=1; b<=3; b++) for (const back of [false,true]) {
        put(prefix+a+b+(back?'b':''),`${a}/${b}/NVA`,`北越軍第 ${b} 排第 ${a} 班。`,'mg',back?2:3,'A','L');
      }
      for (let n=1; n<=4; n++) {
        const id = prefix+n+'-w-nva';
        pair(id,id+'-b',n+'/W/NVA',`北越軍第 ${n} 武器組。W 是武器組，NVA 是北越軍。`,'mg','A','L','A');
        const rpg = prefix+n+'nva-rpg';
        pair(rpg,rpg+'-b',n+'/NVA RPG',`北越軍第 ${n} 火箭筒小組。RPG 識別火箭筒。`,'launcher','S','C','S',{front:[grenade],backIcon:'rifle'});
      }
      for (let n=1; n<=2; n++) {
        const hmg = prefix+'12-7-'+n;
        pair(hmg,hmg+'b',n+'/12.7mm',`第 ${n} 重機槍組，12.7mm 是口徑。`,'mg','H','V','A/S',{front:[tripod],backIcon:'automatic'});
      }
      pair(prefix+'50-cal',prefix+'50-cal-b','.50 cal HMG','點五〇口徑重機槍。HMG 表示重機槍。','mg','H','V','H');
      for (const [key,type,symbol,fire,range] of [
        ['ac-fire-team','fire','mg','A','C'],['ap-assault-team','assault','automatic','A','P'],
        ['ap-fire-team','fire','automatic','A','P'],['sc-fire-team','fire','rifle','S','C'],
        ['lat-fire-team-ac','fire','mg','A','C'],['lat-fire-team-sc','fire','rifle','S','C'],
        ['lat-fire-team','fire','automatic','A/S','C']
      ]) team(prefix+key,type,symbol,fire,range,{label:type==='assault'?'Assault TM':undefined,extra:[faction]});
    } else {
      for (const [key,symbol,fire] of [
        ['lat-fire-team-as-smg','automatic','A/S'],['lat-fire-team-as','automatic','A/S'],
        ['lat-fire-team-s-bar','automatic','S'],['lat-fire-team-s-rifle','rifle','S'],['lat-fire-team-s','rifle','S']
      ]) team(prefix+key,'fire',symbol,fire,'C',{extra:[faction]});
      target(prefix+'nva-arty-target','ARTY TARGET','砲兵');
      target(prefix+'nva-mtr-target','MTR TARGET','迫擊砲');
    }
    for (let n=1; n<=3; n++) {
      const leader = prefix+'leader-'+n;
      pair(leader,leader+'b','LEADER',org+'領導者。','rank',null,null,'S');
      const spotter = prefix+'spotter-'+n;
      pair(spotter,spotter+'b',n+'/Mtr Spotter',`第 ${n} 迫擊砲觀測員。Mtr 是迫擊砲，Spotter 是觀測員。`,'binoculars',null,null,'A/S');
    }
    for (let n=1; n<=(isNva?5:4); n++) {
      if (n<=4) {
        const mg = prefix+'mg-'+n;
        pair(mg,mg+'b',`${n}/MG/${tag}`,`${org}第 ${n} 機槍組。MG 表示機槍。`,'mg','A','L','A');
      }
      const rpg = prefix+'rpg-'+n;
      pair(rpg,rpg+'b',`${n}/${tag} RPG`,`${org}第 ${n} 火箭筒小組。RPG 識別火箭筒，左下印的是本面基本火力。`,'launcher',isNva?'A/S':'S','C',isNva?'A/S':'S',{backIcon:isNva?'automatic':'rifle'});
    }
    for (const caliber of [60,82]) for (let n=1; n<=2; n++) {
      const mortar = prefix+caliber+'mm-'+n;
      pair(mortar,mortar+'b',`${n}/${caliber}mm Mtr`,`第 ${n} 迫擊砲組。Mtr 是迫擊砲，${caliber} mm 是口徑。`,'mortar','G!',caliber===60?'C-L':'C-V','S',{backIcon:'rifle'});
    }
    for (const model of isNva?[36,56]:[36]) {
      for (let n=1; n<=2; n++) {
        const gun = prefix+'type'+model+'-'+n;
        pair(gun,gun+'b',`${n}/Type ${model} RCL`,`第 ${n} 無後座力砲組。Type ${model} 是型號，RCL 是無後座力砲。`,'rcl',model===36?'G!':'H','V','A/S',{backIcon:'automatic'});
      }
      if (isNva) {
        const gun = prefix+'type'+model+'-rcl';
        pair(gun,gun+'-b',`Type ${model} RCL`,`${model} 式無後座力砲。Type ${model} 是型號，RCL 表示無後座力砲。`,'rcl',model===36?'G!':'H','V','S',{backIcon:'rifle'});
      }
    }
    const sniper = prefix+'sniper';
    pair(sniper,sniper+'-b','SNIPER!',org+'狙擊手。','sniper','S!','L','S');
    team(prefix+'lat-asslt-team','assault','automatic','A','P',{label:'Assault Tm',extra:[faction]});
    team(prefix+'lat-litter-team','litter','stretcher');
    team(prefix+(isNva?'lat-paralyzed':'lat-paralyzed-team'),'paralyzed','arrow');
    for (let n=1; n<=2; n++) casualty(prefix+'casualty-'+n,n);
  }
  for (let n=1; n<=2; n++) casualty('army-nkpa-lat-casualty-'+n,n);
  window.FOF_FOOT_GUIDE = faces;
})();
