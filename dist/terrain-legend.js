/* Printed fields of the Korea, Vietnam and Heartbreak Ridge terrain decks. */
(() => {
'use strict';
// Each entry supplies the printed fields through the indicated card number.
const printed={
 K:[
  [11,{cover:0,height:1}],
  [16,{cover:2,coverDraws:3,coverLimit:3,vehicle:"slow",building:true}],
  [24,{cover:0,coverDraws:3,coverLimit:1,landing:true,vehicle:"slow"}],
  [30,{cover:2,coverDraws:3,coverLimit:2,vehicle:"slow"}],
  [36,{cover:0,coverDraws:2,coverLimit:1,landing:true}],
  [42,{cover:1,coverDraws:2,coverLimit:2,landing:true,vehicle:"slow"}],
  [48,{cover:3,lowCover:1,coverDraws:3,coverLimit:1,vehicle:"no"}],
  [54,{cover:2,lowCover:0,coverDraws:3,coverLimit:2,height:1}],
  [55,{cover:2,coverDraws:3,coverLimit:1,vehicle:"slow"}],
 ],
 VN:[
  [4,{cover:0,height:1}],
  [8,{cover:2,coverDraws:2,coverLimit:2,incoming:-1,vehicle:"slow"}],
  [16,{cover:1,coverDraws:3,coverLimit:2,landing:true}],
  [24,{cover:0,coverDraws:3,coverLimit:1,landing:true,vehicle:"slow"}],
  [30,{cover:3,coverDraws:4,coverLimit:3,incoming:-1,vehicle:"no"}],
  [32,{cover:2,coverDraws:3,coverLimit:2,landing:true,vehicle:"slow"}],
  [33,{cover:2,coverDraws:4,coverLimit:3,landing:true,vehicle:"slow"}],
  [34,{cover:2,coverDraws:5,coverLimit:3,landing:true,vehicle:"slow"}],
  [36,{cover:2,coverDraws:4,coverLimit:3,landing:true,vehicle:"slow"}],
  [40,{cover:3,coverDraws:4,coverLimit:3,vehicle:"slow"}],
  [42,{cover:0,coverDraws:2,coverLimit:1,landing:true}],
  [48,{cover:2,coverDraws:3,coverLimit:3,landing:true,vehicle:"slow",building:true}],
  [52,{cover:3,lowCover:1,coverDraws:3,coverLimit:1,vehicle:"no"}],
  [55,{cover:3,coverDraws:4,coverLimit:3,vehicle:"no"}],
 ],
 HBR:[
  [4,{cover:0,height:2}],
  [7,{cover:0,height:3}],
  [10,{cover:0,height:4}],
  [11,{cover:0,height:5}],
 ],
};
for(const t of [...window.FOF_CAMPAIGN_TERRAIN,...window.FOF_COURSE_TERRAIN]){
 const id=/^(K|VN|HBR)([0-9]+)$/.exec(t.id);
 if(!id)continue;
 const group=printed[id[1]].find(([last])=>Number(id[2])<=last);
 if(group)Object.assign(t,group[1]);
}
const compass={N:'上',NE:'右上',E:'右',SE:'右下',S:'下',SW:'左下',W:'左',NW:'左上'};
const signed=n=>n<0?'−'+Math.abs(n):'+'+n;
function legend(t,cell,layer){
 const rows=[];
 const add=(glyph,title,meaning)=>rows.push({glyph,title,meaning});
 if(!t||cell.faceDown||t.type==='unrevealed')return {summary:'未揭開地形',rows:[{title:'牌背',meaning:cell.faceDown?'友軍地面單位對此牌建立視線時會自動翻開。牌上的算子與標記仍可操作。':'教學設置中的未翻開地形。'}]};
 const hill=t.type==='hill',stack=window.FOF.hillLayers(cell);
 const elevation=cell.level||1+cell.h+Number(window.FOF.terrain(cell.t)?.type==='Embankment');
 const summary='棋桌高度 '+elevation+(layer!==null?'　下層地形':stack.length?'　疊有 '+stack.length+' 張高度牌':'');
 const dual=t.lowCover!=null&&t.lowCover!==t.cover;
 add('shield','掩蔽與隱蔽　'+signed(t.cover)+(dual?'／'+signed(t.lowCover):''),
  dual?'火力穿過任一深色邊時用大字。全部穿過白邊、同牌射擊、來襲砲火或迫擊砲間接射擊時用小字。':hill?'丘陵提供高度。掩蔽與隱蔽取上方的地形牌。':'這是本牌的基本淨戰鬥修正值。');
 if(t.vehicle==='slow')add('vehicle','SLOW　車輛慢行','地面車輛進入這張牌就必須結束本次移動。');
 if(t.vehicle==='no')add('vehicle','NO　車輛禁入','地面車輛不能進入這張牌。');
 if(t.incoming)add('burst','來襲修正　'+signed(t.incoming),'受來襲砲火影響時，在本牌的掩蔽與隱蔽值上再加此修正。');
 if(t.height)add('height','地形高度　+'+t.height,'在基準高度上增加 '+t.height+' 層。'+(hill?'下層丘陵的深色視線邊優先。':''));
 if(t.multiStory)add('special','Multi-Story　多層建築','找到建築掩蔽時，同時取得地面與上層掩蔽。上層比地面高一層。');
 if(t.op)add('special','OP　教堂塔樓','找到建築掩蔽時可以放置塔樓。塔樓為上層掩蔽，容量 1 階。');
 if(t.coverLimit){
  let kind='灌木表示基本掩蔽，每處另加 +1。';
  if(t.building){
   if(typeof t.id==='number')kind='房屋表示依諾曼第任務書第 15 頁的 R8 表決定掩蔽類型。';
   else if(t.id.startsWith('VN'))kind='越南村莊抽 R5。1 為堅固建築，2–5 為輕型建築。';
   else kind='洛東江村莊抽 R5。1–2 為堅固建築，3–4 為輕型建築，5 為基本掩蔽。';
  }
  add('cover','掩蔽潛力　'+t.coverLimit+' 處','本牌最多可搜索出 '+t.coverLimit+' 處掩蔽。'+kind);
 }
 if(t.coverDraws)add('draw','尋找掩蔽　'+t.coverDraws+' 張','牌疊數字是嘗試尋找掩蔽時，修正前抽取的行動牌張數。');
 if(t.landing)add('landing','直升機　可著陸','這張地形適合降落。任務指定的著陸區另以 LZ 標記標示。');
 const white=t.openEdges||[];
 const borders=white.length===8?'八個方向都是白邊。':white.length?'白邊位於'+white.map(edge=>compass[edge]).join('、')+'，其餘為深色。':'八個方向都是深色邊。';
 add('border','視線邊界',borders+(stack.length&&layer===null?'下方丘陵的深色邊優先。':'')+'牌邊不阻擋看向鄰牌。同高時，視線穿過中間牌須從白邊進出。');
 return {summary,rows};
}
window.FOF_TERRAIN_LEGEND=legend;
})();
