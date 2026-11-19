/* Display complete card fronts in draw order. Each group retains the lookup it belongs to. */
(() => {
'use strict';
const dialog=document.getElementById('drawViewer'), pictures=document.getElementById('drawFaces');
const count=document.getElementById('drawCount'), finish=document.getElementById('drawFinish');
const back=document.getElementById('drawPrev'), forward=document.getElementById('drawNext');
let entries=[],offset=0,enlarged=null,onClose=null;
const spreadSize=12;
const pad=id=>String(id).padStart(2,'0');
function render(){
 const zoom=enlarged!==null;
 const list=zoom?[entries[enlarged]]:entries.slice(offset,offset+spreadSize);
 const cols=list.length<=4?list.length:Math.ceil(list.length/2);
 const rows=Math.ceil(list.length/cols);
 pictures.style.setProperty('--draw-cols',cols);
 const availableW=(innerWidth*.94-42-(cols-1)*12)/cols;
 const availableH=(innerHeight*.94-180)/rows-42;
 let width=Math.floor(Math.max(65,Math.min(750,availableW,availableH*5/7)));
 pictures.style.setProperty('--draw-width',width+'px');
 pictures.replaceChildren();
 for(const [i,entry] of list.entries()){
  const figure=document.createElement('figure'),caption=document.createElement('figcaption');
  const order=document.createElement('span'),title=document.createElement('strong');
  order.textContent=entry.why;order.title=entry.why;title.textContent=entry.id===51?'重洗牌':('行動牌 #'+pad(entry.id));
  caption.append(order,title);
  const btn=document.createElement('button'),img=document.createElement('img');
  btn.type='button';btn.className='draw-face';btn.disabled=entries.length===1;
  btn.title=zoom?'返回並排檢視':'單張檢視';btn.setAttribute('aria-label',title.textContent+'・'+btn.title);
  img.width=750;img.height=1050;img.src='assets/action/'+pad(entry.id)+'.webp';img.alt=title.textContent+' 完整正面';img.draggable=false;
  btn.append(img);btn.onclick=()=>{enlarged=zoom?null:offset+i;render();};figure.append(caption,btn);pictures.append(figure);
 }
 const index=zoom?enlarged:offset,last=zoom?index:Math.min(entries.length-1,index+spreadSize-1);
 count.textContent=(index+1)+(last===index?'':'–'+(last+1))+' / '+entries.length+' 張';
 back.disabled=index===0;forward.disabled=last===entries.length-1;
 finish.textContent=onClose&&last<entries.length-1?'繼續看牌':onClose?'讀畢，繼續':'返回棋桌';
 // The interpretation can wrap to several lines. Keep both it and the footer in view.
 for(let i=0;i<3&&dialog.scrollHeight>dialog.clientHeight+1;i++){
  width=Math.max(65,width-Math.ceil((dialog.scrollHeight-dialog.clientHeight+3)*5/(7*rows)));
  pictures.style.setProperty('--draw-width',width+'px');
 }
 dialog.scrollTop=0;
}
function change(d){
 if(enlarged!==null){enlarged=Math.max(0,Math.min(entries.length-1,enlarged+d));offset=Math.floor(enlarged/spreadSize)*spreadSize;}
 else offset=Math.max(0,Math.min(Math.floor((entries.length-1)/spreadSize)*spreadSize,offset+d*spreadSize));
 render();
}
function dismiss(){
 const done=onClose;onClose=null;dialog.close();entries=[];if(done)done();
}
function show(groups,heading,description,done){
 if(dialog.open)return;
 entries=groups.flatMap(group=>group.ids.map(id=>({id,why:group.why})));
 if(!entries.length)return;
 offset=0;enlarged=null;onClose=done||null;
 document.getElementById('drawHeading').textContent=heading;
 const hint=document.getElementById('drawHint');hint.textContent=description||'';hint.hidden=!description;
 dialog.showModal();render();finish.focus({preventScroll:true});
}
finish.onclick=()=>{if(onClose&&!forward.disabled)change(1);else dismiss();};
back.onclick=()=>change(-1);forward.onclick=()=>change(1);
window.addEventListener('resize',()=>{if(dialog.open)render();});
dialog.addEventListener('cancel',e=>{e.preventDefault();if(enlarged!==null){enlarged=null;render();}else dismiss();});
dialog.addEventListener('keydown',e=>{
 if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();change(e.key==='ArrowLeft'?-1:1);}
});
window.FOF_DRAW_VIEW={show,isOpen:()=>dialog.open};
})();
