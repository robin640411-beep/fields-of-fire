// The planning sheet in Field Manual 2 p. 38 shows the strength actually loaded.
(() => {
 'use strict';
 const foot=window.FOF_FOOT_GUIDE;
 const faces=Object.create(null);
 const sameFace={2:'hq',3:'vn-mg1',4:'hq2',5:'hq3',15:'vn-hq4',16:'first-sgt',
  19:'vn-sq-23',20:'vn-sq-33',21:'co-xo',22:'fo',23:'vn-fac',24:'arty-fo',
  25:'vn-mg2',26:'vn-sq-11',27:'vn-sq-21',34:'co-hq',assault:'assault'};
 for(const [file,id] of Object.entries(sameFace))faces['plan-'+file]=foot[id];
 for(const [file,squad,platoon] of [[9,1,3],[10,1,4],[17,2,4],[28,3,2],[29,3,1],[30,1,2],[31,2,2]]){
  faces['plan-'+file]=[
   [squad+'/'+platoon+' PLT','第 '+platoon+' 排第 '+squad+' 班。斜線前是班號，後是排號，PLT 是排。'],
   ['中央紅底閃電','美軍第 25 步兵師的師徽。'],
   ['左下 A/S','與目標同牌時用自動武器火力量 A（−1），其他距離用輕兵器火力量 S（0）。'],
   ['上標 G!','班內的榴彈發射器可對相鄰牌嘗試榴彈攻擊。'],
   ['下方 ●●','每點代表 1 階兵力，這枚登機的班共有 2 階。'],
   ['右下 L','遠距離。基本火力量最遠可達距本牌兩張牌的位置。']
  ];
 }
 for(const [file,team,platoon] of [[6,1,3],[8,2,3],[32,2,2],[33,1,2]]){
  faces['plan-'+file]=[
   [team+'/W/'+platoon,'第 '+platoon+' 排武器班第 '+team+' 機槍組。W 是武器班。'],
   ...foot['vn-mg1'].slice(1)
  ];
 }
 faces['plan-11']=[['60mm TM','60 公釐迫擊砲組。60mm 是口徑，TM 是小組。'],...foot.usmtr1.slice(1)];
 window.FOF_AIR_LOAD_GUIDE=faces;
})();
