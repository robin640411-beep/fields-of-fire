/* The lesson cursor is the checkpoint. Replaying confirmed instructions rebuilds the board. */
(() => {
'use strict';
const G=window.FOF, lessons=window.FOF_LESSONS=Object.create(null);
const basic=['P1','P2','P3','C1','C2','C3'];
const advanced=['I1','E1','V1','V2','D1','H1','R1'];
const ids=[...basic,...advanced];
const layouts={
 排:{rows:[[0,0,0],[41,42,43],[9,44,10],[17,18,19]],hills:{B3:1}},
 連:{rows:[[0,0,0,0],[41,8,21,43],[47,15,42,45],[18,16,20,23]],hills:{C2:1,A3:2,D3:3}}
};
const position=v=>({x:v.charCodeAt(0)-65,y:Number(v.slice(1))});
const unitBy=(s,id)=>s.units.find(u=>u.id===id);
const has=id=>Object.hasOwn(lessons,id);
const current=s=>lessons[s.id].steps[s.cursor];
const arts=new Map([...window.FOF_PIECES,...window.FOF_COURSE_PIECES||[]].map(p=>[p.id,p]));
const fullDeck=()=>[...window.FOF_CARDS.map(c=>c.id),51];
function addUnit(s,v){
 const p=position(v.at), art=arts.get(v.art);
 const squad=/^(s[123]|p[23]s[123]|de-gr[123]|mtr)$/.test(v.art);
 const u=G.piece(v.id,v.name,v.name,v.steps??(squad?3:1),p.x,p.y,v.side||art?.category||'friendly',v.art);
 u.casualty=['casualty','de-casualty'].includes(v.art);
 u.lessonStatus=v.status||'';s.units.push(u);
}
function start(id){
 const lesson=lessons[id],layout=lesson.layout||layouts[lesson.group];
 const s={version:1,id,cols:Math.max(...layout.rows.map(row=>row.length)),rows:layout.rows.length-1,map:[],units:[],log:[],tracks:{...lesson.tracks},objectives:{},
  cursor:0,turn:lesson.steps[0].turn,outcome:'',deck:fullDeck(),discard:[],last:[],recentDraws:[],pendingDraws:[],drawCount:0,reading:false};
 layout.rows.forEach((row,y)=>row.forEach((t,x)=>{
  const key=G.nameAt({x,y}),h=layout.hills?.[key],hills=Array.isArray(h)?h.slice():h?[h]:[];
  s.map.push({x,y,t,h:hills.length,hills,marks:(lesson.marks?.[key]||[]).slice()});
 }));
 lesson.units.forEach(u=>addUnit(s,u));
 return s;
}
function apply(s,step){
 const e=step.effects||{};
 if(step.kind==='move')Object.assign(unitBy(s,step.unit),position(step.at));
 for(const [id,at] of Object.entries(e.move||{}))Object.assign(unitBy(s,id),position(at));
 if(e.remove)s.units=s.units.filter(u=>!e.remove.includes(u.id));
 if(e.add)e.add.forEach(u=>addUnit(s,u));
 if(e.resetStatus)for(const u of s.units)u.lessonStatus='';
 for(const [id,status] of Object.entries(e.status||{})){
  const u=unitBy(s,id);if(!u)continue;
  u.lessonStatus=status;
  const strength=/(\d+)\s*階/.exec(status);if(strength)u.steps=Number(strength[1]);
 }
 for(const [at,marks] of Object.entries(e.marks||{}))G.at(s,position(at)).marks=marks.slice();
 Object.assign(s.tracks,e.tracks);
 if(e.entries)Object.assign(s.entries??={},e.entries);
}
function beginDraw(s){
 const step=current(s);
 if(!step||step.kind!=='draw'||s.reading)return false;
 const remaining=[];
 for(const id of step.cards){
  const index=s.deck.indexOf(id);
  if(index<0)throw Error('教學牌序與牌堆不符：'+id);
  s.deck.splice(index,1);s.discard.push(id);remaining.push(s.deck.length);
 }
 const reshuffle=step.cards.includes(51);
 G.recordDraw(s,step.cards,step.phase,remaining,reshuffle);
 if(reshuffle){s.deck=fullDeck();s.discard=[];}
 s.reading=true;return true;
}
function complete(s){
 const step=current(s);if(!step||step.kind==='draw'&&!s.reading)return false;
 apply(s,step);s.reading=false;
 G.note(s,step.detail||step.text);
 s.cursor++;
 const next=current(s);
 if(next)s.turn=next.turn;else s.outcome='win';
 return true;
}
function accepts(s,kind,value){
 const step=current(s);
 if(s.reading||!step||step.kind!==kind)return false;
 switch(kind){
 case 'choice':return Number(value)===step.answer;
 case 'amount':return /^\d+$/.test(String(value).trim())&&Number(value)===step.answer;
 case 'cell':case 'move':return value===step.at;
 case 'unit':return value===step.unit;
 default:return false;
 }
}
function restore(saved){
 const s=start(saved.id);
 while(s.cursor<saved.cursor){
  if(current(s).kind==='draw'){
   beginDraw(s);s.recentDraws=s.pendingDraws.splice(0);
  }
  complete(s);
 }
 if(saved.reading)beginDraw(s);
 if(saved.tableRun){
  const after=restore({id:s.id,cursor:s.cursor,reading:true});
  s.tableRun={order:{type:'lesson'},shown:saved.tableRun.shown,after};
 }
 return s;
}
function validSave(s){
 const step=lessons[s.id]?.steps[s.cursor];
 return s.version===1&&Number.isInteger(s.cursor)&&s.cursor>=0&&s.cursor<=lessons[s.id].steps.length
  &&typeof s.reading==='boolean'&&(!s.reading||step?.kind==='draw');
}
window.FOF_COURSE={ids,basic,advanced,art:id=>arts.get(id),lessons,has,current,start,beginDraw,complete,accepts,restore,validSave};
})();
