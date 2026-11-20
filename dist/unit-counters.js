/* Resolve the printed counter independently of its roster identity, which survives a flip. */
(() => {
 'use strict';
 const us=window.FOF_US_FACES,enemy=window.FOF_ENEMY_AUDIT,vehicles=window.FOF_VEHICLE_AUDIT;
 const groups=[us,enemy,vehicles].filter(Boolean);
 const rows={...FOF_FOOT_GUIDE,...FOF_VEHICLE_FACES,...FOF_AIR_LOAD_GUIDE};
 for(const group of groups)Object.assign(rows,group.faces);
 const pieces=new Map([...FOF_PIECES,...FOF_COURSE_PIECES,...FOF_CAMPAIGN_PIECES].map(p=>[p.id,p]));
 for(const group of groups)for(const def of group.pieces){
  if(pieces.has(def.id))Object.assign(pieces.get(def.id),def);
  else{pieces.set(def.id,def);FOF_CAMPAIGN_PIECES.push(def);}
 }
 for(const p of pieces.values()){
  if(!p.army||!p.id.endsWith('-target'))continue;
  p.category='marker';
  const label=rows[p.id]?.[0];
  if(label)p.name=label[1].replace(/的地圖外火力目標標記。$/,'目標')+' · '+label[0];
 }
 function strength(id){
  const label=rows[id]?.find(([mark])=>mark.includes('●'))?.[0];
  return label?.match(/●+/)?.[0].length??pieces.get(id)?.steps;
 }
 function resolved(s,u){
  if(u.side==='marker'||!u.art)return u.art;
  const v=vehicles?.resolve(s,u);
  if(v)return v;
  const group=u.side==='enemy'?enemy:us;
  return group?.resolve(s,u)||u.art;
 }
 function art(s,u){
  const face=resolved(s,u);
  if(u.casualty){
   if(vehicles.vehicleIds.has(face))return u.vehicleLoss==='burned'?'burning-wreck':'wreck';
   return (u.side==='enemy'?enemy:us).resolve(s,u)||face;
  }
  if(s.id==='Q1'&&u.art==='de-gr1'&&u.abbr==='接敵'&&u.steps===1)return 'de-fire';
  if(u.faceChoice&&!u.casualty){
   const allowed=choices(s,u,face);
   if(allowed.includes(u.faceChoice))return u.faceChoice;
  }
  return face;
 }
 function choices(s,u,normal=resolved(s,u)){
  if(u.side==='marker'||!normal||u.casualty)return [];
  const group=u.side==='enemy'?enemy:us;
  const ids=new Set([normal]);
  for(const alternate of vehicles.variants[normal]||[])if(strength(alternate)===strength(normal))ids.add(alternate);
  for(const alternate of group.options(s,u,normal))ids.add(alternate);
  return [...ids].filter(id=>pieces.has(id));
 }
 function book(s){
  return FOF.scenario(s.id)?.book||({D1:'K',H1:'V',R1:'V'}[s.id]||'N');
 }
 function permitted(s,t){
  const theater=book(s);
  if(t.category==='marker')return !t.army||({K:['NKPA','KATUSA'],H:['NKPA'],V:['NVA','VC']}[theater]||[]).includes(t.army);
  if(t.books&&!t.books.includes(book(s)))return false;
  if(t.category==='enemy'&&enemy?.permitted)return enemy.permitted(s,t);
  if(vehicles.vehicleIds.has(t.id)){
   if(/^aircraft-|^vn-m48/.test(t.id))return theater==='V';
   if(/^kr-/.test(t.id))return theater==='K'||theater==='H';
   if(/^sherman|^m10|^m5-/.test(t.id))return theater==='N';
   if(t.id==='jeep'||t.id==='truck'||t.id==='jeep-arty-scr610')return theater!=='V';
  }
  if(t.category==='friendly'&&us?.permitted&&!us.permitted(s,t))return false;
  return !t.army||t.army!=='KATUSA'||book(s)==='K';
 }
 function title(id){
  const p=pieces.get(id);
  if(!p)return '';
  if(p.category==='marker')return p.name;
  const legend=rows[id]||[],first=legend[0],parts=p.name.split(' · ');
  if(first&&p.army&&p.name.startsWith(p.army+' ')){
   parts[0]=first[1].split(/[。，]/)[0];
   parts[1]=first[0];
  }
  if(p.source)parts[0]=parts[0].split(/[。，]/)[0];
  const count=strength(id);
  if(legend.some(([label])=>/Fire Team/i.test(label))&&!/火力組/.test(parts[0]))parts[0]+='・具名火力組';
  if(count>1&&!parts[0].includes(count+' 階'))parts[0]+='（'+count+' 階）';
  return parts.join(' · ');
 }
 const isVehicle=(s,u)=>!!vehicles?.vehicleIds.has(resolved(s,u));
 function lossFaces(s,u,first){
  const result=[first],limit=strength(first);
  if(!u.casualty||!limit||!first?.includes('casualty')||u.steps<=limit)return result;
  for(let left=u.steps-limit;left>0;left-=limit)
   result.push(art(s,{...u,steps:Math.min(left,limit)}));
  return result;
 }
 function picture(s,u,pic,esc,cls='',alt=''){
  const id=art(s,u),def=pieces.get(id);
  if(!def)return '';
  const parts=lossFaces(s,u,id);
  if(parts.length===1)return pic(def.art,cls,alt);
  const info=esc('此疊共 '+u.steps+' 階傷亡');
  return '<span class="loss-faces">'+parts.map((face,i)=>
   '<span tabindex="0" data-piece-art="'+esc(face)+'" data-piece-name="'+esc(u.name+'・傷亡 '+strength(face)+' 階')+'" data-piece-info="'+info+'">'+
    pic(pieces.get(face).art,cls,'第 '+(i+1)+' 枚傷亡算子')+'</span>').join('')+'</span>';
 }
 window.FOF_COUNTERS={art,choices,permitted,strength,title,rows,isVehicle,picture,lossFaces,get:id=>pieces.get(id),book};
})();
