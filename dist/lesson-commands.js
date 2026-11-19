/* Physical command-display positions for the six scripted Field Manual 1 courses.
   cursor counts confirmed steps. reading is true while the current draw is open.
   Section 4.1 and FM1 pp. 8, 10–14, 38–43 distinguish pool, upper track,
   saved lower track and completed zero-command box. */
(() => {
  'use strict';
  const labels = {co:'連部',pl1:'第 1 排',pl2:'第 2 排',general:'一般主動'};
  const trackKeys = {
    co:['連部命令'], pl1:['排部命令','排部可用命令','第 1 排命令'],
    pl2:['第 2 排命令'], general:['一般主動','一般主動命令']
  };
  // Each window records the actual draw total, including carried points and modifiers,
  // independently of an acknowledgement that also spends/discards points.
  // On the last confirmed step, carry is put on the lower track (0 = completed box).
  // null denotes immediate mission end while a headquarters still has points available.
  const windowOf = (id,first,last,drawn,carry=0) => ({id,first,last,drawn,carry});
  const pl = (i,j,n,s=0) => windowOf('pl1',i,j,n,s);
  const general = (i,j,n) => windowOf('general',i,j,n);
  const co = (i,j,n,s=0) => windowOf('co',i,j,n,s);
  const pl2 = (i,j,n,s=0) => windowOf('pl2',i,j,n,s);
  const courseWindows = {
    P1: [
      pl(1,4,3),general(5,6,1), pl(8,12,4),general(13,14,1),
      pl(16,20,4),general(21,22,1), pl(24,27,4,1),general(28,29,1),
      pl(31,34,6,3),general(35,36,1), pl(38,39,4,null)
    ],
    P2: [
      pl(1,4,3),general(5,6,1), pl(9,11,4,2),general(12,13,1),
      pl(19,23,4),general(24,25,1), pl(32,34,3,1),general(35,36,1),
      pl(40,42,5,3),general(43,45,2)
    ],
    P3: [
      pl(1,4,7,4),general(5,6,1), pl(17,21,7,3),general(22,23,1),
      pl(27,28,7,6),general(29,31,2)
    ],
    C1: [
      co(2,3,1),pl(4,6,3,1),pl2(7,8,1),general(9,10,1),
      co(14,15,3),pl2(16,21,4),pl(22,26,4),general(27,29,2),
      general(35,37,4),general(44,44,2)
    ],
    C2: [
      co(2,2,4),pl(3,5,4),pl2(6,8,5),general(9,9,1),
      co(20,20,2),pl(21,21,3),pl2(22,22,3),general(23,27,4)
    ]
  };

  // Payment for activation flips subordinate markers BEFORE their own draws.
  const activated = {
    P3:{0:['pl1']}, C1:{3:['pl1'],14:['pl1','pl2']},
    C2:{2:['pl1','pl2'],20:['pl1','pl2']}
  };
  // A command spent on an attempt is spent when the attempt is made.
  // Only use this for paid draws, never for unrelated combat/check draws.
  const attemptRead = {
    P2:{25:['general',0]}, P3:{6:['general',0],18:['pl1',6],23:['general',0]},
    C1:{10:['general',0],21:['pl2',0],29:['general',0],37:['general',2]}
  };
  // The map marks the phase of the current, unconfirmed activity. A skipped phase
  // has no step of its own. Checks of PC/VOF belong to Combat, never Enemy Activity.
  const phaseStarts = {
    P1:{0:null,1:'orders',7:'cleanup',8:'orders',15:'cleanup',16:'orders',23:'cleanup',24:'orders',30:'cleanup',31:'orders',37:'cleanup',38:'orders'},
    P2:{0:null,1:'orders',7:'enemy',8:'cleanup',9:'orders',14:'enemy',15:'combat',18:'cleanup',19:'orders',26:'enemy',27:'combat',31:'cleanup',32:'orders',37:'enemy',38:'combat',39:'cleanup',40:'orders'},
    P3:{0:'orders',7:'combat',16:'cleanup',17:'orders',24:'combat',27:'orders',32:'combat',36:null},
    C1:{0:null,2:'orders',11:'enemy',12:'combat',13:'cleanup',14:'orders',30:'enemy',31:'combat',34:'cleanup',35:'orders',38:'combat',39:'cleanup',40:'orders',43:'combat',44:'orders',45:'combat',46:'orders',47:'combat',48:null},
    C2:{0:null,2:'orders',10:'combat',19:'orders',28:'combat',37:null}
  };

  function phaseAt(id,index) {
    let phase = null;
    for (const [first,value] of Object.entries(phaseStarts[id])) {
      if (Number(first)>index) break;
      phase=value;
    }
    return phase;
  }
  const marker = (id,area,points,face) => ({id,label:labels[id],area,points,face});

  function resetForNextTurn(markers) {
    for (const id of ['co','pl1','pl2']) {
      const m=markers[id];
      if (!m) continue;
      if (m.area==='saved') markers[id]=marker(id,'available',m.points,'complete');
      else if (m.area==='done') markers[id]=marker(id,'ready',0,'complete');
    }
    delete markers.general;
  }
  function amountOnTrack(step,id) {
    const tracks=step.effects?.tracks;
    if (!tracks) return undefined;
    for (const key of trackKeys[id]) if (key in tracks) return tracks[key];
    return undefined;
  }
  function showBalance(markers,id,n) {
    // General initiative never uses one of the physical HQ marker spaces.
    if (id==='general' && !n) delete markers.general;
    else markers[id]=marker(id,'available',n,'commands');
  }
  function finishWindow(markers,w) {
    if (w.id==='general') delete markers.general;
    else if (w.carry!==null)
      markers[w.id]=marker(w.id,w.carry?'saved':'done',w.carry,'complete');
  }
  function applyCheckpoint(markers,id,steps,index,revealedOnly) {
    const step=steps[index];
    const w=courseWindows[id].find(period=>index>=period.first && index<=period.last);
    if (w && index===w.first) showBalance(markers,w.id,w.drawn);
    if (revealedOnly) {
      const cost=attemptRead[id]?.[index];
      if (cost) {
        if (w && index===w.last && cost[1]===0) finishWindow(markers,w);
        else showBalance(markers,cost[0],cost[1]);
      }
      return;
    }
    if (w) {
      const remaining=amountOnTrack(step,w.id);
      if (remaining!==undefined) showBalance(markers,w.id,remaining);
      if (index===w.last) finishWindow(markers,w);
    }
    for (const actor of activated[id]?.[index]||[]) markers[actor].face='commands';
    if (step.phase.endsWith('清理') || (steps[index+1] && steps[index+1].turn>step.turn))
      resetForNextTurn(markers);
  }

  function snapshot(id,cursor,reading=false) {
    const lessons=window.FOF_LESSONS;
    const lesson=lessons?.[id];
    if (!lesson || !Number.isInteger(cursor) || cursor<0 || cursor>lesson.steps.length)
      return {markers:[],phase:null};
    let source=id;
    let local=cursor;
    let phaseOverride;
    // C3 is C2 with ten communication exercises before step 0 and another two
    // before round two. Communicating equipment or checking a link spends no points.
    if (id==='C3') {
      source='C2';
      if (cursor<10) {
        local=0; phaseOverride=cursor<6?null:'orders';
      } else if (cursor<29) local=cursor-10;
      else if (cursor<31) {local=19;phaseOverride='orders';}
      else local=cursor-12;
    }
    if (!courseWindows[source]) return {markers:[],phase:null};
    const steps=lessons[source].steps;
    const markers={};
    const company=source.startsWith('C');
    for (const actor of company?['co','pl1','pl2']:['pl1'])
      markers[actor]=marker(actor,'ready',0,'complete');
    for (let index=0;index<local;index++) applyCheckpoint(markers,source,steps,index,false);
    // The unactivated 2nd platoon flips at the start of its own initiative impulse.
    if (source==='C1' && local===7) markers.pl2.face='commands';
    if (reading && steps[local]?.kind==='draw' && lesson.steps[cursor]?.kind==='draw')
      applyCheckpoint(markers,source,steps,local,true);
    const result={markers:Object.values(markers),phase:cursor===lesson.steps.length?null:
      phaseOverride!==undefined?phaseOverride:phaseAt(source,local)};
    // C1's late example only records selected actions. Keeping old HQ positions
    // here would claim the numbers or outcomes of command draws that were omitted.
    if (source==='C1' && (local>35 || local===35&&reading)) {
      result.markers=result.markers.filter(m=>m.id==='general');
      result.note='本段只記錄指定的行動，一般主動點依示例牌顯示；三個指揮部的命令數未載。';
    }
    return result;
  }
  window.FOF_LESSON_COMMANDS=snapshot;
})();
