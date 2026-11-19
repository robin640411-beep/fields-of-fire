/* Each position is a percentage of the original planning or control card, from FM2 pp. 38–39. */
(() => {
  'use strict';
  const plan={
    11:[["第 1 排部","plan-2",14.36,15.26,6.484],["1/W/1","plan-3",22.2,15.26,6.484],["前進空中管制員","plan-23",18.35,21.76,6.484]],
    12:[["砲兵觀測員","plan-24",40.92,15.26,6.484],["2/W/1","plan-25",37.34,21.76,6.484],["連部","plan-34",33.49,15.26,6.484]],
    13:[["1/1 班・3 階","plan-26",52.61,15.18,6.484]],
    14:[["2/1 班・3 階","plan-27",71.74,15.14,6.484]],
    21:[["第 2 排部","plan-4",14.22,36.69,6.484],["3/2 班・2 階","plan-28",21.93,36.69,6.484]],
    22:[["迫擊砲觀測員","plan-22",33.49,36.81,6.484],["3/1 班・2 階","plan-29",41.06,36.81,6.484]],
    23:[["1/2 班・2 階","plan-30",60.18,36.69,6.484],["1/W/2","plan-33",52.48,36.81,6.484]],
    24:[["2/2 班・2 階","plan-31",79.59,36.93,6.484],["2/W/2","plan-32",71.9,36.81,6.484]],
    31:[["第 3 排部","plan-5",14.22,58.23,6.484],["1/W/3","plan-6",22.01,58.4,6.484],["突擊組","assault",18.07,65.14,6.484]],
    32:[["2/W/3","plan-8",33.35,58.4,6.484],["1/3 班・2 階","plan-9",41.06,58.4,6.484]],
    33:[["2/3 班・3 階","plan-19",52.48,58.4,6.484]],
    34:[["3/3 班・3 階","plan-20",71.8,58.4,6.484]],
    41:[["1/4 班・2 階","plan-10",23.91,85.7,6.484],["60 公釐迫擊砲組","plan-11",31.7,85.7,6.484],["突擊組","assault",16.23,92.35,6.484],["突擊組","assault",23.99,92.35,6.484],["副連長","plan-21",16.15,85.8,6.484]],
    42:[["突擊組","assault",54.54,92.35,6.484],["第 4 排部","plan-15",54.54,85.8,6.484],["連士官長","plan-16",62.25,85.8,6.484],["2/4 班・2 階","plan-17",69.9,85.68,6.484],["突擊組","assault",62.23,92.4,6.484]],
  };
  const control={
    1:[["UH-1 11","control-2",40.93,22.59,6.477],["UH-1 12","control-4",52.47,22.77,6.477],["UH-1 13","control-6",42.71,33.59,6.477],["UH-1 14","control-8",51.72,33.95,6.477]],
    2:[["UH-1 21","control-3",73.64,47.89,6.477],["UH-1 22","control-5",82.85,48.35,6.477],["UH-1 23","control-7",74.61,59.44,6.477],["UH-1 24","control-9",84.64,59.44,6.477]],
  };
  const folder='assets/fm2/air/';
  function counters(layout,visible,caption){
    let html='';
    for(const [key,items] of Object.entries(layout)){
      if(!visible(Number(key)))continue;
      for(const [name,file,x,y,w] of items){
        html+='<span tabindex="0" data-piece-name="'+name+'" data-piece-info="'+caption(key)+'" style="position:absolute;left:'+x+'%;top:'+y+'%;width:'+w+'%;line-height:0">'+
          '<img src="'+folder+file+'.webp" alt="'+name+'" draggable="false" style="width:100%;height:auto;display:block"></span>';
      }
    }
    return html;
  }
  function chart(kind,title,description,pieces){
    return '<figure style="min-width:0;margin:0"><figcaption><strong>'+title+'</strong><p>'+description+'</p></figcaption>'+
      '<div style="position:relative"><img src="'+folder+kind+'.webp" alt="'+title+'空白底圖" draggable="false" style="width:100%;height:auto;display:block">'+pieces+'</div></figure>';
  }
  window.FOF_AIR_AID=function(s){
    if(s.id!=='H1')return '';
    const t=s.tracks;
    const placed=number=>{
      const wave=Math.floor(number/10),bay=number%10;
      const count=parseInt(t['第 '+wave+' 波已填'],10)||0;
      return bay<=count;
    };
    const aircraft=key=>(Number(key)>=40?'CH-47 ':'UH-1 ')+key+' 號裝載格';
    const fills=counters(plan,placed,aircraft);
    const loaded=Object.keys(plan).map(Number).filter(placed);
    const total=loaded.reduce((steps,id)=>steps+(id>=40?6:3),0);
    const helicopters=counters(control,wave=>wave===1?!!t['進場格']:!!t['接載區'],k=>k==='1'?'第一波・進場格':'第二波・接載區');
    const zones='進場格 '+(t['進場格']?4:0)+' 枚，接載區 '+(t['接載區']?4:0)+' 枚。管制卡左側印有水田示意圖，本局的 LZ 為棋桌 C3 灌木叢。';
    return '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:16px;align-items:start">'+
      chart('plan','裝載規劃卡',loaded.length+' / 14 個機位已填，共 '+total+' / 48 階。',fills)+
      chart('control','直升機管制卡',zones,helicopters)+'</div>';
  };
})();
