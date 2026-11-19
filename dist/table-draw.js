/* Resolve a rules operation once. Only commit its results after its physical cards are revealed. */
(() => {
'use strict';
const G=window.FOF,C=window.FOF_COURSE,Q=window.FOF_QUICK;
const names={lesson:'教學抽牌',advance:'回合抽牌',moonlight:'月光能見度',event:'上級事件',order:'同級 PC 順序',contact:'接敵檢查',group:'接敵組合',batch:'手動抽牌',combat:'戰鬥效果',cover:'尋找掩蔽',rally:'重整'};
function validOrder(o){
 if(!o||!Object.hasOwn(names,o.type))return false;
 switch(o.type){
 case 'batch':return Number.isInteger(o.n)&&o.n>=1&&o.n<=12;
 case 'combat':return Number.isInteger(o.n)&&o.n>=-4&&o.n<=6&&['line','green','veteran'].includes(o.exp);
 case 'contact':case 'group':return Number.isInteger(o.x)&&Number.isInteger(o.y);
 case 'rally':case 'cover':return typeof o.unit==='string';
 default:return true;
 }
}
function validForState(s,o){
 if(!validOrder(o))return false;
 if(C.has(s.id))return o.type==='lesson'&&C.current(s)?.kind==='draw';
 if(s.id==='T1')return o.type==='advance';
 if(s.id==='Q1')return ['advance','cover','rally'].includes(o.type);
 return !['lesson','advance','cover','rally'].includes(o.type);
}
function defaultOrder(s){
 if(s.outcome)return null;
 if(C.has(s.id))return C.current(s)?.kind==='draw'?{type:'lesson'}:null;
 if(s.id==='T1'||s.id==='Q1')return ['ready','command'].includes(s.phase)||(s.id==='Q1'&&s.phase==='initiative')?{type:'advance'}:null;
 if(G.scenario(s.id).mode==='patrol'&&!s.vis&&s.phase==='setup')return {type:'moonlight'};
 if(s.turn>=2&&['events','enemy'].includes(s.phase)&&!s.events?.[s.turn+'-'+(s.phase==='events'?'friendly':'enemy')])return {type:'event'};
 if(s.phase==='combat'&&!s.map.some(c=>c.pending)){
  const cell=G.nextPC(s);
  if(cell)return {type:'contact',x:cell.x,y:cell.y};
  if(G.pcCandidates(s).length>1)return {type:'order'};
 }
 return {type:'batch',n:1};
}
function label(s,o){
 if(!o)return '目前無須抽牌';
 if(o.type==='lesson')return '抽 '+C.current(s).cards.filter(id=>id!==51).length+' 張行動牌';
 if(o.type==='advance')return s.phase==='ready'?'抽取啟動命令':s.phase==='command'?'結束命令，抽主動牌':'結算本回合';
 if(o.type==='batch')return '抽 '+o.n+' 張行動牌';
 if(o.type==='contact'||o.type==='group')return G.nameAt(o)+'・'+names[o.type];
 return names[o.type];
}
function resolve(s,o){
 if(!validForState(s,o)||s.outcome)return false;
 if(C.has(s.id))return o.type==='lesson'&&C.beginDraw(s);
 switch(o.type){
 case 'advance':return s.id==='Q1'?Q.advance(s):s.id==='T1'&&G.advanceTraining(s);
 case 'moonlight':if(G.scenario(s.id)?.mode!=='patrol'||s.vis)return false;
  s.vis=1+G.draw(s,1,'月光能見度')[0].rand[4];return true;
 case 'event':return G.hqEvent(s);
 case 'order':return G.choosePC(s);
 case 'contact':case 'group':{const c=G.at(s,o);return !!c&&(o.type==='group'?G.contactGroup(s,c):G.pcCheck(s,c));}
 case 'rally':case 'cover':return s.id==='Q1'&&Q.special(s,s.units.find(u=>u.id===o.unit),o.type);
 case 'batch':G.draw(s,o.n,'手動抽牌');return true;
 case 'combat':{
  const c=G.draw(s,1,'效果檢定')[0],result=c.results[o.n+4],ids=[c.id];
  let text='NCM '+o.n+'　'+({HIT:'命中',PIN:'壓制',MISS:'未命中'})[result];
  if(result==='HIT'){const effect=G.draw(s,1,'命中效果')[0];ids.push(effect.id);text+='　／　'+effect.hitEffect[o.exp];}
  s.last=ids;G.note(s,text);return true;
 }
 }
 return false;
}
function frames(run){
 return run.after.pendingDraws.flatMap(g=>{
  const list=g.ids.map((id,i)=>({id,remaining:g.remaining[i],why:g.why}));
  if(g.reshuffle)list.push({id:null,remaining:51,why:'重洗整副牌'});
  return list;
 });
}
function prepare(s,order){
 const after=structuredClone(s);delete after.drawOrder;
 if(!resolve(after,order))return null;
 return {after,order,shown:0};
}
function finish(run){
 const s=run.after;
 s.recentDraws=s.pendingDraws.splice(0).map(({ids,why})=>({ids,why}));
 if(C.has(s.id)&&s.reading)C.complete(s);
 return s;
}
window.FOF_TABLE_DRAW={validForState,defaultOrder,label,frames,prepare,finish};
})();
