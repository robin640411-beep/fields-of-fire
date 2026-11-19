/* Physical aircraft and manifest for the mission's control sheet. */
(() => {
'use strict';
const G=window.FOF,C=window.FOF_CAMPAIGNS;
const stages=['接載區','進場格','著陸區','離場格','已返回'];
function fleet(m){
 const transport=m.airlift;if(!transport)return [];
 const waveList=transport.waves||[['UH-1',transport.count]];
 const planes=waveList.flatMap(([model,n],wave)=>Array.from({length:n},(_,i)=>({
   key:String(wave+1)+'-'+(i+1),model,wave:wave+1,capacity:model==='CH-47'?12:3,
   stage:wave===0?1:0,cargo:[],arrival:1
 })));
 if(transport.additional)for(let i=1;i<=transport.additional.count;i++)planes.push({key:'增援-'+i,model:'UH-1',wave:2,capacity:3,stage:0,cargo:[],arrival:transport.additional.turn});
 return planes;
}
const armored=u=>/M48/.test(u.name);
function proposed(s){
 const m=G.scenario(s.id),planes=fleet(m),active=planes.filter(p=>p.arrival===1);
 const all=[...s.units,...(s.offboard||[])].filter(u=>u.side==='friendly'&&!armored(u));
 const assignment={};
 for(const u of [...all].sort((a,b)=>b.steps-a.steps)){
  const craft=active.find(a=>a.capacity>=u.steps);if(!craft)continue;
  assignment[u.id]=craft.key;craft.capacity-=u.steps;
 }
 return assignment;
}
function commit(s,assignment){
 const m=G.scenario(s.id),planes=fleet(m);
 if(!planes.length||s.phase!=='setup')return false;
 const all=[...s.units,...(s.offboard||[])].filter(u=>u.side==='friendly');
 const load=all.filter(u=>!armored(u)),stowed=[];
 for(const u of load){
  const key=assignment[u.id];if(!key)continue;
  const p=planes.find(p=>p.key===key&&p.arrival===1);if(!p)return false;
  p.cargo.push(u.id);stowed.push(u);
 }
 if(!stowed.length||(!m.airlift.oneLift&&stowed.length!==load.length))return false;
 if(planes.some(p=>p.cargo.reduce((n,id)=>n+all.find(u=>u.id===id).steps,0)>p.capacity))return false;
 s.planes=planes;s.offboard=load;s.units=s.units.filter(u=>u.side!=='friendly').concat(all.filter(armored));
 s.deploymentConfirmed=true;G.note(s,'已登錄機位與場外編組，'+stowed.length+' 枚算子等待登場。');return true;
}
function move(s,key,landing){
 const craft=s.planes?.find(p=>p.key===key);if(!craft||craft.arrival>s.turn||craft.stage>=4||s.phase==='setup'||s.outcome)return false;
 if(craft.stage===1&&!(s.landing||[]).includes(landing))return false;
 craft.stage++;
 if(craft.stage===2){
   craft.landing=landing;const cell=C.coord(landing),ids=new Set(craft.cargo);
   const carried=s.offboard.filter(u=>ids.has(u.id));for(const u of carried)Object.assign(u,cell);
   s.units.push(...carried);s.offboard=s.offboard.filter(u=>!ids.has(u.id));craft.cargo=[];
 }
 G.note(s,craft.model+' '+key+' 移至'+stages[craft.stage]+'。');
 if(craft.stage===2)window.FOF_TERRAIN_VISIBILITY.refresh(s);
 return true;
}
window.FOF_CAMPAIGN_AIR={fleet,proposed,commit,move,stages,armored};
})();
