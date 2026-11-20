// Fields of Fire Deluxe. Source filenames identify the original VASSAL counter faces.
// Breakdown charts: Normandy 47, Naktong 44, Heartbreak Ridge 48, Vietnam 56.
(() => {
  'use strict';
  const pieces = [], faces = {}, sources = {}, printed = {}, allowed = {}, namedFire = {}, reverseOf = {}, strength = {};
  const common = 'NKHV', early = 'NKH', korea = 'KH';
  const symbols = {
    division:'白星、盾牌與人像是美軍第 2 步兵師的師徽。',
    lightning:'紅底黃閃電是美軍第 25 步兵師的師徽。',
    helmet:'鋼盔上的階級章識別指揮人員。', camo:'迷彩鋼盔上的階級章識別越南戰役的指揮人員。',
    binoculars:'望遠鏡識別原單位的觀測或管制職務。', leaf:'銀色橡葉代表營長的階級。',
    mg:'機槍圖案識別本組武器。', rifle:'步槍圖案代表這枚步兵算子。', bar:'白朗寧自動步槍（BAR）識別本班保留的自動步槍手。',
    m79:'榴彈發射器識別本班保留的榴彈兵。', mortar:'迫擊砲圖案識別本組武器。', launcher:'巴祖卡火箭筒圖案識別反戰車組。',
    rcl:'無後座力砲圖案識別本組武器。', sniper:'附瞄準鏡的步槍識別狙擊手。',
    cross:'紅十字表示需後送的傷亡人員。', stretcher:'擔架表示擔架組。', paralyzed:'指向橫線的黃色箭頭表示癱瘓組。'
  };
  const fires = {S:'輕兵器火力量（0）。',A:'自動武器火力量（−1）。',H:'重武器火力量（−3）。','A/S':'同牌射擊用 A（−1），其餘射程用 S（0）。','G!':'榴彈類型的特殊火力量。依遊戲的榴彈攻擊程序判定。','S!':'狙擊手的特殊火力量，所選單位受狙擊火力（−3），同牌其他單位受輕兵器火力（0）。'};
  const ranges = {P:'貼近距離，只能對同張地形牌使用此火力。',C:'近距離，最遠為相鄰牌。',L:'遠距離，最遠可達距本牌 2 張牌的位置。',V:'極遠距離，最遠可達距本牌 3 張牌的位置。','C-L':'最近相鄰一張，最遠相距兩張。','C-V':'最近相鄰一張，最遠相距三張。'};
  const grenade = ['上標 G!','除了左下的 S 火力量，這枚反戰車組可以使用火箭彈藥對鄰牌嘗試榴彈攻擊（7.10、7.18.1D）。'];
  const launcher = ['上標 G!','除了基本火力量，還可用榴彈發射器對鄰牌嘗試榴彈攻擊（7.7）。'];
  const tripod = ['帶刻線的黃箭頭','識別三腳架機槍，可使用遊戲中的掠射、超越射擊與最終防護射線（7.2.1）。'];
  const named = ['Fire Team','原單位的具名火力組。依本面印的火力量與射程遊玩。'];
  function register(id,source,books,steps,label,desc,icon,fire,range,extras=[],existing=false) {
    const rows=[];
    if(label) rows.push([label,desc]);
    if(icon) rows.push(['中央圖示',symbols[icon] || icon]);
    if(fire) rows.push([fire+' · 左下',fires[fire]]);
    rows.push(['●'.repeat(steps)+' · 下方黃點','每點代表 1 個兵力階，此面共 '+steps+' 階。']);
    if(range) rows.push([range+' · 右下',ranges[range]]);
    if(!range&&!fire&&!['stretcher','cross','paralyzed'].includes(icon)) rows.push(['下方兩側留白','本面沒有印列火力量與射程。']);
    faces[id]=rows.concat(extras);
    sources[id]=source; printed[id]=steps; allowed[id]=books;
    if(!existing) pieces.push({id,source,...(icon==='cross'?{casualty:true}:{}),name:(desc || '傷亡人員').split(/[。，]/)[0]+' · '+(label || steps+' 階'),category:'friendly',steps,books,art:'assets/unit-faces/'+id+'.webp'});
    return id;
  }
  function pair(id,file,books,label,desc,icon,fire,range,backFire,backIcon,options={}) {
    register(id,file,books,1,label,desc,icon,fire,range,options.front || [],options.existing);
    const back=id+'-fire';
    const backfile=options.backFile || file.replace('.png','b.png');
    register(back,backfile,books,1,label,desc,backIcon || icon,backFire,'C',[named,...(options.back || [])]);
    pieces[pieces.length-1].name=desc.split(/[。，]/)[0]+' · '+label+'・具名火力組';
    namedFire[id]=back; reverseOf[back]=id;
    return id;
  }
  const sqWW=(p,q)=>p===1?'s'+q:'p'+p+'s'+q;
  const sqVN=(p,q)=>'vn-sq-'+q+p;
  const mgVN=(p,t)=>p===1?'vn-mg'+t:'us-vn-mg-'+t+'-'+p;
  const hq=(p)=>p===1?'hq':'hq'+p;
  const vhq=(p)=>p===4?'vn-hq4':'us-vn-hq'+p;
  function ranks(ids) {const list=ids.filter(Boolean); for(const id of list) strength[id]=ids;}
  for(let p=1;p<=4;p++) for(let q=1;q<=(p===4?2:3);q++){
    const desc='第 '+p+' 排第 '+q+' 班。斜線前是班號，後是排號，PLT 表示排。';
    const tag=q+'/'+p+' PLT', v=sqVN(p,q), w=sqWW(p,q);
    if(p<4){
      register(w,'2nd_'+q+'-'+p+'.png',early,3,tag,desc,'division','S','L',[],true);
      register(w+'-2','2nd_'+p+'-'+q+'b.png',early,2,tag,desc,'division','S','L');
      ranks([null,'us-bar-fire',w+'-2',w]);
      register(v,'Vietnam '+q+p+' 3step.png','V',3,tag,desc,'lightning','A/S','L',[launcher],true);
    }
    register(v+'-2','Vietnam '+q+p+' 2step.png','V',2,tag,desc,'lightning','A/S','L',[launcher]);
    ranks([null,'us-vn-grenadier',v+'-2',p<4?v:null]);
  }
  // A generic team's own face must not inherit its former squad's strength lookup.
  delete strength['us-bar-fire'];delete strength['us-vn-grenadier'];
  const staff=[
    ['co-hq','CO HQ','連指揮部。CO 是連，HQ 是指揮部。','04-CO','CO HQ'],
    ['co-xo','CO XO','連副官。CO 是連，XO 是副官。','05-XO','CO XO'],
    ['first-sgt','CO 1 SGT','連士官長（First Sergeant）。','06-1SGT','CO 1SGT'],
    ...[1,2,3,4].map(p=>[hq(p),p+' PLT HQ','第 '+p+' 排指揮部。PLT 是排，HQ 是指揮部。',('0'+(6+p)).slice(-2)+'-'+p+'PLT',p+' PLT'])
  ];
  const vietnamese = {};
  for(const [id,label,desc,ww,vn] of staff){
    const p=/^hq(\d)?$/.test(id), n=p?(Number(id.slice(2))||1):0;
    const rank=id==='co-hq'?['盔上的雙銀槓','雙銀槓是上尉階級章，這枚算子代表連指揮部。']:
      id==='co-xo'?['盔上的單銀槓','單銀槓是中尉階級章，這枚算子代表連副官。']:
      id==='first-sgt'?['盔上的士官階級章','上下條紋之間的菱形識別連士官長。']:['盔上的單金槓','單金槓是少尉階級章，這枚算子代表排指揮部。'];
    if(n!==4)pair(id,'HQ_'+ww+'.png',early,label,desc,'helmet',null,null,'S',null,{existing:true,front:[rank],back:[rank]});
    const vid=p?vhq(n):'us-vn-'+id;
    pair(vid,'HQ '+vn+'.png','V',label,desc,'camo',null,null,'A/S',null,{existing:n===4,backFile:'HQ '+vn+' b.png',front:[rank],back:[rank]});
    vietnamese[id]=vid;
  }
  pair('bn','HQ_02-Bn.png',common,'Bn Commander','營長。Bn 表示營。','leaf',null,null,'S',null,{existing:true});
  pair('kr-hmg-hq','HMG PLT HQ.png',korea,'HMG PLT HQ','重機槍排指揮部。HMG 是重機槍，PLT 是排，HQ 是指揮部。','helmet',null,null,'S',null,{existing:true});
  for(const [id,file,label,desc,books] of [
    ['fo','Mortar FO','Mtr FO','迫擊砲前進觀測員。Mtr 是迫擊砲，FO 是前進觀測員。',common],
    ['arty-fo','Arty FO','ARTY FO','砲兵前進觀測員。ARTY 是砲兵，FO 是前進觀測員。',common],
    ['kr-fac','FAC','FAC','前進空中管制員（FAC）。',korea],['vn-fac','FAC','FAC','前進空中管制員（FAC）。','V']
  ]) pair(id,'Observer_'+file+'.png',books,label,desc,'binoculars',null,null,'S',null,{existing:true});
  for(let n=1;n<=2;n++){
    const tag=n+'/Runner',desc='第 '+n+' 傳令兵。',id='runner'+n;
    pair(id,n+'_Runner-N-K.png',early,tag,desc,'rifle',null,null,'S',null,{existing:true});
    pair('us-vn-'+id,n+'_Runner-V.png','V',tag,desc,'rifle',null,null,'A/S');
    vietnamese[id]='us-vn-'+id;
    pair(n===1?'lmg':'lmg2','Weapon_LMG-'+n+'.png','N',n+'/LMG','第 '+n+' 輕機槍組。LMG 表示輕機槍。','mg','A','L','A',null,{existing:true});
  }
  for(let p=1;p<=3;p++){
    const at=p===1?'at':'at'+p;
    pair(at,'Weapon_AT-'+p+'.png','N',p+'/AT','第 '+p+' 反戰車組。AT 表示反戰車。','launcher','S','C','S','rifle',{existing:true,front:[grenade]});
    pair('usmtr'+p,p+'_Mtr 60mm.png',early,p+'/Mtr','第 '+p+' 迫擊砲小組。Mtr 是迫擊砲。','mortar','G!','C-L','S','rifle',{existing:true,backFile:'Weapon_Mtr-'+p+'b.png'});
    for(const t of [1,2]){
      const tag=t+'/W/'+p, desc='第 '+p+' 排武器班第 '+t+' 組，W 表示武器班。';
      pair(mgVN(p,t),'Weapon_'+p+'-W-'+t+'V.png','V',tag,desc+'圖中裝備是機槍。','mg','A','L','A',null,{existing:p===1});
      const baz=t===2, kid='kr-'+(baz?'baz':'mg')+'-'+p;
      pair(kid,'Weapon_'+p+'-W-'+(baz?'2Baz':'1')+'.png',korea,tag,desc+(baz?'圖中裝備是巴祖卡。':'圖中裝備是機槍。'),baz?'launcher':'mg',baz?'S':'A',baz?'C':'L',baz?'S':'A',baz?'rifle':'mg',{existing:true,front:baz?[grenade]:[]});
    }
    for(const cal of [57,75]) if(p<=2||cal===57){
      const id='kr-rcl'+cal+'-'+p;
      pair(id,'Weapon_RCL'+cal+'-'+p+'.png',korea,p+'/'+cal+'mm RCL','第 '+p+' 無後座力砲組。'+cal+' mm 是口徑，RCL 是無後座力砲。','rcl',cal===57?'G!':'H','V','S','rifle',{existing:true});
    }
  }
  const hmgFront={'11':'hmg1','21':'hmg2','12':'us-hmg-12','22':'us-hmg-22'};
  for(const [code,id] of Object.entries(hmgFront)){
    const [t,p]=code, label=t+'/'+p+' HMG', desc='第 '+p+' 重機槍分隊第 '+t+' 組。HMG 是重機槍。';
    pair(id,'US HMG '+code+'.png',p==='1'?early:korea,label,desc,'mg','A','V','A',null,{existing:p==='1',front:[tripod],back:[tripod]});
  }
  pair('hmg50','US HMG 50cal.png',early,'.50 cal HMG','點五〇口徑重機槍組。.50 cal 是口徑，HMG 是重機槍。','mg','H','V','H',null,{existing:true,front:[tripod],back:[tripod],backFile:'Weapon_HMG50-1b.png'});
  register('mtr','Weapon_Mtr Sec.png',early,3,'Mtr Sec','迫擊砲分隊。Mtr 是迫擊砲，Sec 是分隊。','mortar','H','C-L',[],true);
  register('mtr-2','Weapon_Mtr Secb.png',early,2,'Mtr Sec','迫擊砲分隊。Mtr 是迫擊砲，Sec 是分隊。','mortar','H','C-L');
  ranks([null,'usmtr3','mtr-2','mtr']);delete strength.usmtr3;
  register('us-vn-81sec','Weapon_81mmMtr SEC.png','V',3,'81mm Sec','81 公釐迫擊砲分隊，Sec 表示分隊。','mortar','H','C-V');
  register('us-vn-81sec-2','Weapon_81mmMtr SECb.png','V',2,'81mm Sec','81 公釐迫擊砲分隊，Sec 表示分隊。','mortar','H','C-V');
  ranks([null,'us-vn-81tm-2','us-vn-81sec-2','us-vn-81sec']);delete strength['us-vn-81tm-2'];
  for(const n of [1,2]) pair('us-vn-81tm-'+n,'Weapon_81mmMtr TM-'+n+'.png','V',n+'/81mm TM','第 '+n+' 個 81 公釐迫擊砲小組，TM 是小組。','mortar','G!','C-V','A/S','rifle');
  pair('us-vn-60tm','60mm C-L.png','V','60mm TM','60 公釐迫擊砲小組，TM 是小組。','mortar','G!','C-L','A/S','rifle',{backFile:'Weapon_60mmMtr TMb.png'});
  for(const [id,file,books,icon,fire,last] of [['eng','2nd_Engineers',early,'rifle','S','fire'],['us-vn-eng','25th_Engineers','V','mg','A','us-vn-eng-mg']]){
    const extra=books==='V'?[launcher]:[];
    register(id,file+'.png',books,3,'ENGINEERS','工兵班。',icon,fire,'L',extra,id==='eng');
    register(id+'-2',file+'b.png',books,2,'ENGINEERS','工兵班。',icon,fire,'L',extra);
    ranks([null,last,id+'-2',id]);delete strength[last];
  }
  for(const [id,file,books,label,icon,vof,range,ex,existing] of [
    ['fire','LAT_Fire Team-W.png',early,'Fire Team','rifle','S','C',[],true],
    ['assault','LAT_Assault Team-W.png','N','Assault TM','湯普森衝鋒槍識別二戰美軍的通用突擊組。','A','P',[],true],
    ['us-bar-fire','LAT_Fire Team-K.png',early,'Fire Team','bar','S','C'],
    ['us-kr-assault','LAT_Assault Team-K.png',korea,'Assault TM','卡賓槍圖案識別韓戰美軍的通用突擊組。','A','P'],
    ['us-vn-fire','LAT_Fire Team-V2.png','V','Fire Team','rifle','A/S','C'],
    ['us-vn-grenadier','LAT_Fire Team-V1.png','V','Fire Team','m79','A/S','C',[launcher]],
    ['us-vn-assault','LAT_Assault Team-V.png','V','Assault TM','M16 步槍圖案識別越戰美軍的通用突擊組。','A','P'],
    ['us-vn-eng-mg','25th_Engineers Fireteam AC.png','V','Fire Team','mg','A','C'],
    ['us-vn-eng-fire','25th_Engineers Vietnam Fire Team AS C.png','V','Fire Team','rifle','A/S','C'],
    ['us-vn-eng-assault','25th_Engineers Vietnam Assault Team A P.png','V','Assault TM','rifle','A','P'],
    ['litter','LAT_Litter Team.png',common,'Litter Team','stretcher',null,null,[],true],
    ['paralyzed','LAT_Paralyzed_new.png',common,'Paralyzed','paralyzed',null,null,[],true]
  ]) {
    const lab=label==='Fire Team'?'火力組':label==='Assault TM'?'突擊組':label==='Litter Team'?'擔架組':'癱瘓組';
    const desc=(id.startsWith('us-vn-eng')?'越南工兵':'')+lab+'，屬有限行動小組。';
    const engineer=id.startsWith('us-vn-eng');
    const tag=engineer?'ENGINEERS':label;
    const extra=engineer?[[label,label==='Assault TM'?'黃色字樣表示這一面是工兵突擊組。':'黃色字樣表示這一面是工兵火力組。']]:[];
    register(id,file,books,1,tag,desc,icon,vof,range,[...extra,...(ex||[])],existing);
  }
  register('casualty','LAT_Casualties.jpg',common,1,null,'傷亡人員','cross',null,null,[],true);
  for(const n of [2,3])register('us-casualty-'+n,'Green casualty - '+n+' step.png',common,n,null,'傷亡人員','cross');
  pair('us-vn-sniper','Weapon_Sniper.png','V','SNIPER!','狙擊小組。','sniper','S!','L','A/S');
  for(let n=1;n<=4;n++)for(const v of [2,3]){
    const id='army-katusa-'+n+'-'+v+'-step';register(id,'KATUSA '+n+' '+v+'-step.png','K',v,n+'/KATUSA','第 '+n+' 韓籍增援兵班。',null,'S','L',[['太極旗','韓國國旗標示編入美軍的韓籍增援兵（KATUSA）。']],true);
  }
  for(const [key,file,label,desc,icon,fire,range] of [
    ['assault-team','Assault Team','Assault Tm','突擊組','rifle','A','P'],
    ['fireteam','Fireteam','Fire Team','步槍火力組','rifle','S','C'],
    ['fireteam-bar','Fireteam BAR','Fire Team','自動步槍火力組','bar','S','C'],
    ['litter-team','Litter Team','Litter Team','擔架組','stretcher'],
    ['paralyzed','Paralyzed','PARALYZED','癱瘓組','paralyzed']
  ]) {
    register('army-katusa-'+key,'KATUSA '+file+'.png','K',1,'KATUSA','編入美軍的韓籍增援兵。',icon,fire,range,[
      [label,desc+'，屬有限行動小組。'],['中央太極旗','韓國國旗標示該小組的所屬部隊。']
    ],true);
  }
  const air = Object.fromEntries(Object.entries({
    2:vhq(1),3:mgVN(1,1),4:vhq(2),5:vhq(3),6:mgVN(3,1),8:mgVN(3,2),9:'vn-sq-13-2',10:'vn-sq-14-2',11:'us-vn-60tm',
    15:vhq(4),16:'us-vn-first-sgt',17:'vn-sq-24-2',19:'vn-sq-23',20:'vn-sq-33',21:'us-vn-co-xo',22:'fo',23:'vn-fac',
    24:'arty-fo',25:mgVN(1,2),26:'vn-sq-11',27:'vn-sq-21',28:'vn-sq-32-2',29:'vn-sq-31-2',30:'vn-sq-12-2',31:'vn-sq-22-2',
    32:mgVN(2,2),33:mgVN(2,1),34:'us-vn-co-hq',assault:'us-vn-assault'
  }).map(([key,id])=>['plan-'+key,id]));
  for(const [plan,id] of Object.entries(air)) faces[plan]=faces[id];
  function book(s) {
    if(typeof s==='string')s=s.length===1?{book:s}:{id:s};
    if(s?.book || s?.series?.book)return s.book || s.series.book;
    const id=s?.id || '';
    if(id==='H1'||id==='R1'||/^VN\d/.test(id))return 'V';
    if(id==='D1'||/^K\d/.test(id))return 'K';
    if(/^HR\d/.test(id))return 'H';
    return window.FOF?.scenario?.(id)?.book || 'N';
  }
  const directH={CO:'co-hq',XO:'co-xo','1SG':'first-sgt','60mm':'mtr','50cal':'hmg50',ArtyFO:'arty-fo',MtrFO:'fo',FAC:'kr-fac'};
  const directV={'CO HQ':'us-vn-co-hq','CO XO':'us-vn-co-xo','CO 1 Sgt':'us-vn-first-sgt','60mm TM':'us-vn-60tm','81mm Sec':'us-vn-81sec','Arty FO':'arty-fo'};
  function rosterFace(b,id,name){
    let m;
    if(b==='V'){
      if(directV[id])return directV[id];
      if((m=/^([1-4]) PLT HQ$/.exec(id)))return vhq(+m[1]);
      if((m=/^([12])\/W\/([123])(?:st|nd|rd)?$/.exec(id)))return mgVN(+m[2],+m[1]);
      if((m=/^([123])\/([1234])$/.exec(id)))return sqVN(+m[2],+m[1])+(m[2]==='4'?'-2':'');
      if(/^mission\d+$/.test(id)){
        if(/迫.*觀測/.test(name))return 'fo';
        if(/空中管制/.test(name))return 'vn-fac';
        if(/工兵/.test(name))return 'us-vn-eng';
        if(/狙擊/.test(name))return 'us-vn-sniper';
      }
    }
    if(b==='H'){
      if(directH[id])return directH[id];
      if((m=/^HQ([1-3])$/.exec(id)))return hq(+m[1]);
      if((m=/^RCL([1-3])$/.exec(id)))return 'kr-rcl57-'+m[1];
      if((m=/^([12])\/W\/([123])$/.exec(id)))return 'kr-'+(m[1]==='2'?'baz':'mg')+'-'+m[2];
      if((m=/^([123])\/([123])$/.exec(id)))return sqWW(+m[2],+m[1]);
    }
    if(b==='K' && (m=/^hmg([1-4])$/.exec(id)))return ['','hmg1','us-hmg-12','hmg2','us-hmg-22'][+m[1]];
  }
  function resolve(s,u) {
    if(!u || (u.side && u.side!=='friendly'))return;
    const b=book(s), id=u.id||'', art=u.art, name=u.name||'';
    if(!art || (art.startsWith('army-')&&!art.startsWith('army-katusa-')))return;
    const n=Number(u.steps), k=/^army-katusa-([1-4])-([23])-step$/.exec(art);
    const key=u.rosterId || (/^company-/.test(id)?id.slice(8):id);
    if(u.casualty||/^us-casualty-[23]$/.test(art)||art==='casualty')return n>1?'us-casualty-'+Math.min(3,n):(!u.steps&&printed[art]?art:'casualty');
    if(k || u.katusa){
      const slot=(s?.company||[]).filter(v=>v.katusa);
      const pos=slot.findIndex(v=>v.id===key);
      let num=k?+k[1]:1;
      // Older saves assigned both attached KATUSA squads the same first counter.
      if(pos>=0 && (!k || slot.slice(0,pos).some(v=>/^army-katusa-([1-4])-/.exec(v.art||'')?.[1]===k[1]))){
        const assigned=new Set();
        for(const v of slot.slice(0,pos+1)){
          if(v.steps===1)continue;
          const recorded=Number(/^army-katusa-([1-4])-/.exec(v.art||'')?.[1]);
          const chosen=recorded&&!assigned.has(recorded)?recorded:[1,2,3,4].find(n=>!assigned.has(n))||recorded||1;
          assigned.add(chosen);
          if(v.id===key)num=chosen;
        }
      }
      if(n===1)return 'army-katusa-fireteam-bar';
      return 'army-katusa-'+num+'-'+(n===2?2:n===3?3:k?.[2]||3)+'-step';
    }
    if(air[art])return air[art];
    if(s?.id==='P3'&&id==='fire3'&&art==='fire')return 'us-bar-fire';
    if(s?.id==='D1'&&id==='hm2')return 'us-hmg-12';
    if(s?.id==='R1'&&art==='fire'){
      const step=window.FOF_LESSONS?.R1?.steps?.[s.cursor];
      if(/1\/4/.test((step?.detail||'')+JSON.stringify(step?.effects||'')))return 'us-vn-grenadier';
    }
    // A manually chosen generic LAT or named weapon back remains its own counter.
    if(reverseOf[art])return art;
    const siteKey=!!(u.rosterId || /^company-/.test(id) || (!u.side&&id===key));
    let face=siteKey?rosterFace(b,key,name):undefined;
    if(!face&&u.abbr&&u.abbr!==key)face=rosterFace(b,u.abbr,name);
    if(!face && b==='V') {
      if(vietnamese[art]) face=vietnamese[art];
      else if(art==='fire'||art==='assault'||art==='eng')face='us-vn-'+art;
    }
    if(!face && (b==='K'||b==='H') && art==='assault')face='us-kr-assault';
    face=face||art;
    const chain=strength[face];
    if(chain&&n>0&&chain[n])face=chain[n];
    const emptyFlips=/^(at[23]?|usmtr[123]|kr-baz-[123]|kr-rcl(?:57|75)-[123]|us-vn-(60tm|81tm-[12]))$/;
    if(u.ammo===0&&emptyFlips.test(face))face=namedFire[face];
    return sources[face]?face:undefined;
  }
  function options(s,u,normal) {
    const face=normal||resolve(s,u);
    return namedFire[face]?[namedFire[face]]:reverseOf[face]?[reverseOf[face]]:[];
  }
  function permitted(s,entry){
    const books=allowed[typeof entry==='string'?entry:entry.id];
    return !books||books.includes(book(s));
  }
  window.FOF_US_FACES={pieces,faces,sources,printed,allowed,air,namedFire,reverseOf,strength,book,resolve,options,permitted};
})();
