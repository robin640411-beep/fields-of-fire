// Numbered vehicle faces from the 9th Infantry Regiment and German trays in the Fields of Fire module.
// Series rules 1.2.3, 10.7 and 10.8.5–7. A destroyed vehicle is replaced by a wreck marker.
(() => {
 'use strict';
 const pieces=[],faces=Object.create(null),variants=Object.create(null);
 const printed=window.FOF_VEHICLE_FACES;
 const vehicleIds=new Set(['sherman','sherman12','sherman13','sherman14','sherman15','m10','m5-enemy','kr-m4','kr-m26','kr-quad','vn-m48','jeep','truck','army-nkpa-truck']);
 for(const key of Object.keys(printed))if(/^aircraft-\d+$|^army-nkpa-(?:t34-85|su-76m)-\d+$/.test(key))vehicleIds.add(key);
 function register(id,name,rows,{category='friendly',steps=1,vehicle=true}={}){
  pieces.push({id,name,category,steps,art:'assets/unit-vehicles/'+id+'.webp'});
  faces[id]=rows;
  if(vehicle)vehicleIds.add(id);
 }
 const heavy=['左下 H','重武器基本火力量，數值為 −3。'];
 const close=['右下 C','近距離，最遠到相鄰的地形牌。'];
 const veryLong=['右下 V','極遠距離，最遠到距本牌三張牌的位置。'];
 const fireA=['左下 A','自動武器基本火力量，數值為 −1。'];
 const long=['右下 L','遠距離，最遠到距本牌兩張牌的位置。'];
 const limitedAT=['A 旁上標 G!','此車具有有限反戰車能力。結算反戰車射擊時適用規則 10.6.2 的抽牌檢定。'];
 const hqRow=['HQ 與淡色圓圈','這輛車是該排的指揮車。HQ 表示指揮部。'];
 function numbered(prefix,model,name,nums,hq,fireAndRange=[heavy,veryLong]){
  for(const n of nums){
   const command=n===hq;
   const rows=[[model+' 與車形圖',name+'的車型標示。車身的白星是美軍識別徽。'],
    ['車身下方 '+n,'這枚車輛算子的識別編號。']];
   if(command)rows.push(hqRow);
   register(prefix+n,name+' '+n+(command?' 指揮車':''),rows.concat(fireAndRange));
  }
 }
 numbered('m10-','M10 TD','M10 戰車驅逐車',[22,23,24]);
 numbered('m5-','M5','M5 斯圖亞特輕戰車',[31,32,33,34,35],31,[fireA,limitedAT,long]);
 numbered('kr-m4-','M4A3E8','M4A3E8 雪曼戰車',[12,13,14,15]);
 numbered('kr-m26-','M26 Pershing','M26 潘興戰車',[22,23,24,25]);
 numbered('kr-quad-','QUAD 50','四聯裝 .50 口徑機槍半履帶車',[42]);
 numbered('vn-m48-','M48 Patton','M48 巴頓戰車',[31,32,34,35],31);
 register('jeep-arty-scr610','砲兵射擊指揮網吉普車（SCR610）',[
  ['ARTY FD Net JEEP','配屬砲兵射擊指揮網的吉普車。ARTY 是砲兵，FD 是射擊指揮。'],
  ['SCR610 Radio','車上載有砲兵射擊指揮網的 SCR610 無線電。'],
  ['黃色 [1]','這一面的可用運輸容量為 1 階。']
 ]);
 register('aircraft-uh1m','UH-1M 攻擊直升機',[
  ['UH-1M 與直升機圖','此面代表已生效的攻擊直升機。兩枚算子組成一個編隊。'],heavy,close
 ]);
 register('aircraft-uh1m-pending','UH-1M 攻擊直升機（待執行）',[
  ['Pending Attack Helicopters','攻擊直升機已獲呼叫，當前是待執行面。'],
  ['黃色準星與黑色機影','將本面置於目標地形牌；編隊在規則 10.8.5 的時機翻到 UH-1M 面。']
 ]);
 register('aircraft-o2','O-2 前進空中管制機',[
  ['O-2 FAC 與飛機圖','O-2 是機型，FAC 是前進空中管制。'],
  ['左下 WP!','白磷火箭可標示目標並提供遮蔽，這項能力沒有火力量。'],close
 ]);
 register('aircraft-ac47','AC-47 砲艇機',[
  ['AC47 Spooky 與飛機圖','AC-47 是定翼砲艇機，Spooky 是綽號。'],heavy,
  ['右下 C','近距離。本機可依任務指示在同牌或鄰牌分配火力量與照明標記。']
 ]);
 const gunOptions={category:'enemy',vehicle:false};
 const full88=new Map([['de88','de88-reduced'],['de88-2','de88-2-reduced']]);
 const gunFire=(model,num)=>[
  [num+'/'+model,'第 '+num+' 門'+({'75mm AT':'75 公釐反戰車砲。AT 是反戰車。','75mm IG':'75 公釐步兵砲。IG 是德文「步兵砲」的縮寫。','88mm':'88 公釐砲。'}[model])],
  ['Fire Team 與步槍','黃色字表示這是該砲班的具名火力組面。步槍圖代表其火力組身份。'],
  ['下方 ●','一個黃點為 1 個兵力階。'],['左下 S','此面使用輕兵器火力量（0）。'],close
 ];
 function group(ids){for(const id of ids)variants[id]=ids;}
 for(const [prefix,model,family] of [['de-75','75mm AT','75 公釐反戰車砲'],['de-ig','75mm IG','75 公釐步兵砲'],['de88','88mm','88 公釐砲']]){
  for(const n of [1,2]){
   const full=prefix+(n===1?'':'-2'),fire=full+'-fire';
   const reduced=full88.get(full);
   if(n===2){
    const normal=printed[prefix];
    register(full,'德軍第 2 門'+family+(reduced?'（2 階）':''),[['2/'+model+' 與砲圖','第 2 門'+family+'。'+(prefix==='de-75'?'AT 是反戰車。':prefix==='de-ig'?'IG 是德文「步兵砲」的縮寫。':'')],...normal.slice(1)],{...gunOptions,steps:reduced?2:1});
    if(reduced)register(reduced,'德軍第 2 門'+family+'（1 階）',[['2/88mm 與砲圖','第 2 門 88 公釐砲。'],...printed['de88-reduced'].slice(1)],gunOptions);
   }
   register(fire,'德軍第 '+n+' 門'+family+'具名火力組',gunFire(model,n),gunOptions);
   group(reduced?[full,reduced,fire]:[full,fire]);
  }
 }
 group(['aircraft-uh1m-pending','aircraft-uh1m']);
 function byCompany(s,u){
  const key=u.id?.startsWith('company-')?u.id.slice(8):u.rosterId||u.id;
  let n;
  if(/^N[67]$/.test(s.id)&&(n=/^armor([1-5])$/.exec(key))){
   const i=Number(n[1]);
   if(s.id==='N6')return i===1?'sherman':'sherman'+(10+i);
   if(i<=4)return i===1?'m10':'m10-'+(20+i);
  }
  if(/^K\d+$/.test(s.id)){
   if((n=/^tank([1-5])$/.exec(key))){
    const heavy=s.id==='K6',i=Number(n[1]);
    return i===1?(heavy?'kr-m26':'kr-m4'):(heavy?'kr-m26-'+(20+i):'kr-m4-'+(10+i));
   }
   if(key==='quad1'||key==='quad2')return key==='quad1'?'kr-quad':'kr-quad-42';
  }
  if(/^HR[47]$/.test(s.id)){
   if(key==='TankHQ')return 'kr-m4';
   if((n=/^Tank([1-4])$/.exec(key)))return 'kr-m4-'+(11+Number(n[1]));
  }
  if(/^VN\d+/.test(s.id)){
   if(key==='M48 HQ1')return 'vn-m48-31';
   if((n=/^M48([1-4])$/.exec(key))){
    const num=31+Number(n[1]);return num===33?'vn-m48':'vn-m48-'+num;
   }
  }
 }
 function resolve(s,u){
  if(!u||!s)return;
  // Do not reinterpret a destroyed counter, gun crew or an explicitly selected reverse.
  if(u.art==='wreck'||u.art==='burning-wreck'||u.art==='aircraft-uh1m-pending')return u.art;
  const gun=variants[u.art];
  if(gun&&full88.has(gun[0])){
   if(u.steps>=2)return gun[0];
   if(u.steps===1)return u.art===gun[2]?gun[2]:gun[1];
  }
  if(variants[u.art])return u.art;
  return byCompany(s,u)||(vehicleIds.has(u.art)?u.art:undefined);
 }
 // Rules 10.7: these separate pieces replace the vehicle. A PIN, MISS or aborted mission is not a wreck.
 const wrecks={destroyed:'wreck',burned:'burning-wreck',forcedLanding:'wreck',crashed:'burning-wreck'};
 const uhNumbers=[11,12,13,14,21,22,23,24,31,32,33,34];
 function aircraft(m,p){
  if(!m||!p)return;
  const key=String(p.key||'');
  if(p.physicalAircraft&&/^aircraft-(?:[123][1-4]|4[12])$/.test(p.physicalAircraft))return p.physicalAircraft;
  const seat=/^(\d+)-(\d+)$/.exec(key),extra=/^增援-([1-5])$/.exec(key);
  if(extra){
   const n=Number(extra[1]);if(n<5)return 'aircraft-'+(30+n);
   return; // Thirteenth sortie; an initial UH-1 counter must first return.
  }
  if(!seat)return;
  const wave=Number(seat[1]),bay=Number(seat[2]);
  if(p.model==='CH-47'&&wave===4&&bay<=2)return 'aircraft-'+(40+bay);
  if(p.model!=='UH-1')return;
  const index=m.airlift?.waves?4*(wave-1)+bay-1:bay-1;
  if(uhNumbers[index])return 'aircraft-'+uhNumbers[index];
 }
 // Preserve a reused number in saved state so subsequent returns cannot change the assignment.
 function assignAircraft(m,planes,turn){
  for(const p of planes){
   if(p.physicalAircraft)continue;
   const normal=aircraft(m,p);
   if(normal){p.physicalAircraft=normal;continue;}
   if(p.key!=='增援-5'||p.arrival>turn)continue;
   const active=new Set(planes.filter(q=>q!==p&&q.stage!==4).map(q=>aircraft(m,q)).filter(Boolean));
   const released=planes.find(q=>q.stage===4&&q.arrival===1&&q.model==='UH-1'&&!active.has(aircraft(m,q)));
   if(released)p.physicalAircraft=aircraft(m,released);
  }
 }
 window.FOF_VEHICLE_AUDIT={pieces,faces,resolve,variants,vehicleIds,wrecks,aircraft,assignAircraft};
})();

