import type { Delivery, Innings, Match, Tournament } from './model';
export const oversText = (balls:number) => `${Math.floor(balls/6)}.${balls%6}`;
export type Bat = { id:number; runs:number; balls:number; fours:number; sixes:number; dismissal:string };
export type Bowl = { id:number; balls:number; runs:number; wickets:number };
export function replay(inn:Innings,target?:number) {
 let runs=0, wickets=0, balls=0, striker=inn.openers[0], nonStriker=inn.openers[1], freeHit=false, partnership=0;
 const bat:Record<number,Bat>={}, bowl:Record<number,Bowl>={}, extras={wide:0,'no-ball':0,bye:0,'leg-bye':0};
 const fow:{score:number;wicket:number;balls:number;player:number}[]=[];
 const timeline:{label:string;score:number;balls:number;event:Delivery;striker:number}[]=[];
 const ensure=(id:number)=>bat[id] ?? (bat[id]={id,runs:0,balls:0,fours:0,sixes:0,dismissal:'not out'});
 ensure(striker); ensure(nonStriker);
 for(const e of inn.events){
  if(wickets>=inn.maxWickets || balls>=inn.overs*6 || (target!==undefined && runs>=target)) throw new Error('This innings is already complete.');
  if(!inn.bowlingIds.includes(e.bowler)) throw new Error('Select a bowler from the bowling team.');
  if(!Number.isInteger(e.runs)||e.runs<0||e.runs>6||!Number.isInteger(e.extraRuns)||e.extraRuns<0||e.extraRuns>6) throw new Error('Runs must be whole numbers from 0 to 6.');
  if(e.extra==='none'&&e.extraRuns!==0 || ['wide','bye','leg-bye'].includes(e.extra)&&e.runs!==0) throw new Error('Invalid batting runs and extras combination.');
  if(e.extra!=='none'&&e.extraRuns<1) throw new Error('An extra requires at least one extra run.');
  const legal=e.extra!=='wide'&&e.extra!=='no-ball';
  // Deliveries in an over all belong to one bowler; consecutive overs use different bowlers.
  const previous=timeline.at(-1);
  if(previous && balls%6!==0 && previous.event.bowler!==e.bowler) throw new Error('Change bowlers only at the end of an over.');
  if(previous && balls%6===0){
   const previousWasLegal=previous.event.extra!=='wide'&&previous.event.extra!=='no-ball';
   if(previousWasLegal&&previous.event.bowler===e.bowler) throw new Error('Choose a different bowler for the new over.');
   if(!previousWasLegal&&previous.event.bowler!==e.bowler) throw new Error('The over has already started with this bowler.');
  }

  const b=ensure(striker); const bow=bowl[e.bowler]??(bowl[e.bowler]={id:e.bowler,balls:0,runs:0,wickets:0});
  const dismissed=e.wicket;
  if(dismissed){
   if(![striker,nonStriker].includes(dismissed.player)) throw new Error('Only a current batter can be dismissed.');
   if(dismissed.type!=='Run out'&&dismissed.player!==striker) throw new Error('Only a run out can dismiss the non-striker.');
   if((freeHit||e.extra==='no-ball')&&dismissed.type!=='Run out') throw new Error('Only a run out is supported on a no-ball or free hit.');
   if(e.extra==='wide'&&!['Run out','Stumped','Hit wicket'].includes(dismissed.type)) throw new Error('This dismissal is not valid on a wide.');
   if(dismissed.type!=='Run out'&&(e.runs>0||['bye','leg-bye'].includes(e.extra))) throw new Error('Completed runs with this dismissal are not supported.');
   if(['Caught','Stumped'].includes(dismissed.type)&&!dismissed.fielder) throw new Error('Select the fielder or wicketkeeper.');
   if(dismissed.fielder&&!inn.bowlingIds.includes(dismissed.fielder)) throw new Error('Fielder must belong to the fielding team.');
   if(dismissed.next && (!inn.battingIds.includes(dismissed.next)||bat[dismissed.next])) throw new Error('Select a batter who has not batted.');
  }
  if(e.extra==='no-ball'&&e.extraRuns!==1)throw new Error('A no-ball carries exactly one penalty run.');
  if(e.noBallExtras&&(e.extra!=='no-ball'||e.runs!==0||!['bye','leg-bye'].includes(e.noBallExtras.kind)||!Number.isInteger(e.noBallExtras.runs)||e.noBallExtras.runs<0||e.noBallExtras.runs>6))throw new Error('Invalid additional no-ball byes.');
  const added=e.runs+e.extraRuns+(e.noBallExtras?.runs??0);
  // A chase reached before a run-out ends immediately; do not record a subsequent wicket.
  if(dismissed && target!==undefined && runs+added>=target) throw new Error('The target is reached: record the winning runs without a wicket.');
  b.runs+=e.runs; if(e.extra!=='wide')b.balls++;
  if(e.runs===4)b.fours++; if(e.runs===6)b.sixes++;
  if(e.extra!=='none')extras[e.extra]+=e.extraRuns;
  if(e.noBallExtras)extras[e.noBallExtras.kind]+=e.noBallExtras.runs;
  runs+=added; partnership+=added;
  if(legal){balls++;bow.balls++;}
  bow.runs+=e.runs+(['wide','no-ball'].includes(e.extra)?e.extraRuns:0);
  if(dismissed){
   wickets++; ensure(dismissed.player).dismissal=dismissed.type;
   if(dismissed.type!=='Run out')bow.wickets++;
   fow.push({score:runs,wicket:wickets,balls,player:dismissed.player}); partnership=0;
  }
  const running=e.runs+(['bye','leg-bye'].includes(e.extra)?e.extraRuns:e.extra==='wide'?e.extraRuns-1:0)+(e.noBallExtras?.runs??0);
  if(running%2===1)[striker,nonStriker]=[nonStriker,striker];
  const ended=wickets>=inn.maxWickets||balls>=inn.overs*6||(target!==undefined&&runs>=target);
  if(dismissed&&!ended){
   if(!dismissed.next)throw new Error('Select the next batter.');
   if(striker===dismissed.player)striker=dismissed.next; else nonStriker=dismissed.next;
   ensure(dismissed.next);
  }
  if(legal&&balls%6===0)[striker,nonStriker]=[nonStriker,striker];
  timeline.push({label: dismissed?'W':e.extra==='none'?String(e.runs):`${added}${{wide:'wd','no-ball':'nb',bye:'b','leg-bye':'lb'}[e.extra]}`,score:runs,balls,event:e,striker:b.id});
  if(e.extra==='no-ball') freeHit=true; else if(legal)freeHit=false;
 }
 return {runs,wickets,balls,striker,nonStriker,bat,bowl,extras,fow,timeline,freeHit,partnership,done:wickets>=inn.maxWickets||balls>=inn.overs*6||(target!==undefined&&runs>=target),runRate:balls?runs*6/balls:0};
}
export function matchResult(m:Match){
 if(m.abandoned)return {status:'complete' as const,winner:'',tie:false,nr:true,text:'No result'};
 if(m.innings.length<2)return {status:m.innings.length?'live' as const:'upcoming' as const,winner:'',tie:false,nr:false,text:m.innings.length?'In progress':'Upcoming'};
 const pair=Math.floor((m.innings.length-1)/2)*2;
 if(!m.innings[pair+1])return {status:'live' as const,winner:'',tie:false,nr:false,text:'Super Over in progress'};
 const first=replay(m.innings[pair]),second=replay(m.innings[pair+1],first.runs+1);
 if(!second.done)return {status:'live' as const,winner:'',tie:false,nr:false,text:'In progress'};
 const tie=first.runs===second.runs; const chase=second.runs>first.runs;
 return {status:'complete' as const,winner:tie?'':m.innings[pair+(chase?1:0)].batting,tie,nr:false,text:tie?'Match tied':chase?`Won by ${m.innings[pair+1].maxWickets-second.wickets} wickets`:`Won by ${first.runs-second.runs} runs`};
}
export function standings(d:Tournament){
 const rows=d.teams.map(t=>({team:t.id,played:0,won:0,lost:0,tied:0,nr:0,points:0,forRuns:0,forBalls:0,againstRuns:0,againstBalls:0,nrr:0}));
 for(const m of d.matches.filter(m=>m.id<7)){
  const result=matchResult(m);if(result.status!=='complete')continue;
  for(const id of [m.home,m.away]){
   const row=rows.find(r=>r.team===id)!;row.played++;
   if(result.nr){row.nr++;row.points++;continue;}
   if(result.tie){row.tied++;row.points++;}else if(result.winner===id){row.won++;row.points+=2;}else row.lost++;
   for(const inn of m.innings.slice(0,2)){const s=replay(inn);const nrrBalls=s.wickets>=inn.maxWickets?inn.overs*6:s.balls;
    if(inn.batting===id){row.forRuns+=s.runs;row.forBalls+=nrrBalls;}else{row.againstRuns+=s.runs;row.againstBalls+=nrrBalls;}}
  }
 }
 for(const row of rows)row.nrr=(row.forBalls?row.forRuns*6/row.forBalls:0)-(row.againstBalls?row.againstRuns*6/row.againstBalls:0);
 return rows.sort((a,b)=>b.points-a.points||b.nrr-a.nrr||(d.settings.tiebreak==='wins'?b.won-a.won:headToHead(d,b.team,a.team))||a.team.localeCompare(b.team));
}
function headToHead(d:Tournament,a:string,b:string){return d.matches.filter(m=>m.id<7&&[m.home,m.away].includes(a)&&[m.home,m.away].includes(b)).reduce((n,m)=>n+(matchResult(m).winner===a?1:matchResult(m).winner===b?-1:0),0);}
export function qualifiers(d:Tournament){return d.matches.filter(m=>m.id<7).every(m=>matchResult(m).status==='complete')?standings(d).slice(0,2).map(r=>r.team):[];}
export function normalize(d:Tournament){const q=qualifiers(d);return {...d,matches:d.matches.map(m=>m.id===7&&!m.innings.length&&!m.abandoned?{...m,home:q[0]??'',away:q[1]??''}:m)};}
export function stats(d:Tournament){
 const rows=d.teams.flatMap(t=>t.players.map(p=>({id:p.id,name:p.name,team:t.id,runs:0,balls:0,fours:0,sixes:0,highest:0,wickets:0,bowlBalls:0,conceded:0,catches:0,bestW:0,bestR:0,innings:0})));
 for(const m of d.matches)for(const inn of m.innings.slice(0,2)){const s=replay(inn);
  for(const b of Object.values(s.bat)){const r=rows.find(r=>r.id===b.id)!;r.runs+=b.runs;r.balls+=b.balls;r.fours+=b.fours;r.sixes+=b.sixes;r.highest=Math.max(r.highest,b.runs);r.innings++;}
  for(const b of Object.values(s.bowl)){const r=rows.find(r=>r.id===b.id)!;const firstSpell=r.bowlBalls===0&&r.conceded===0&&r.wickets===0;r.wickets+=b.wickets;r.bowlBalls+=b.balls;r.conceded+=b.runs;if(firstSpell||b.wickets>r.bestW||(b.wickets===r.bestW&&b.runs<r.bestR)){r.bestW=b.wickets;r.bestR=b.runs;}}
  for(const e of inn.events)if(e.wicket?.type==='Caught'&&e.wicket.fielder){rows.find(r=>r.id===e.wicket!.fielder)!.catches++;}
 }
 return rows;
}
