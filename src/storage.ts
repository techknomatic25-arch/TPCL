import { initialData, type Tournament } from './model';
import { normalize, replay } from './engine';
export const STORAGE_KEY='opcl-2026-v1';
export function validateData(value:unknown):Tournament {
 const d=value as Tournament;
 if(!d||d.version!==1||!Array.isArray(d.teams)||d.teams.length!==4||!Array.isArray(d.matches)||d.matches.length!==7||!d.settings||typeof d.settings.superOver!=='boolean'||!['wins','head-to-head'].includes(d.settings.tiebreak)||!Number.isInteger(d.settings.minBalls)||d.settings.minBalls<1)throw new Error('Not a supported OPCL tournament backup.');
 const ids=new Set<number>();const teams=new Set<string>();
 for(const t of d.teams){if(!['A','B','C','D'].includes(t.id)||teams.has(t.id)||typeof t.name!=='string'||!t.name.trim()||typeof t.short!=='string'||!/^#[0-9a-f]{6}$/i.test(t.color)||!Array.isArray(t.players))throw new Error('Invalid team data.');teams.add(t.id);
 for(const p of t.players){if(!Number.isInteger(p.id)||p.id<1||ids.has(p.id)||typeof p.name!=='string'||!p.name.trim()||typeof p.active!=='boolean'||!['Batter','Bowler','All-rounder','Wicketkeeper'].includes(p.role))throw new Error('Invalid or duplicate player ID.');ids.add(p.id);}
 if(!t.players.some(p=>p.id===t.captain&&p.active))throw new Error('Each team needs an active captain.');}
 const fixtures=new Set<string>();
 for(const [index,m] of d.matches.entries()){
 if(m.id!==index+1||![4,6,8,10].includes(m.overs)||typeof m.date!=='string'||typeof m.venue!=='string'||!Array.isArray(m.innings)||m.abandoned!==undefined&&typeof m.abandoned!=='boolean')throw new Error('Invalid match data.');
 if(m.id<7||m.home||m.away){if(!teams.has(m.home)||!teams.has(m.away)||m.home===m.away)throw new Error('Invalid fixture teams.');}
 if(m.id<7){const key=[m.home,m.away].sort().join('');if(fixtures.has(key))throw new Error('Duplicate league fixture.');fixtures.add(key);}
 for(const [n,i] of m.innings.entries()){
 if(![m.home,m.away].includes(i.batting)||![m.home,m.away].includes(i.bowling)||i.batting===i.bowling||!Array.isArray(i.events)||!Array.isArray(i.battingIds)||!Array.isArray(i.bowlingIds)||i.battingIds.length<2||i.bowlingIds.length<2||new Set(i.battingIds).size!==i.battingIds.length||new Set(i.bowlingIds).size!==i.bowlingIds.length||!i.battingIds.every(id=>d.teams.find(t=>t.id===i.batting)!.players.some(p=>p.id===id))||!i.bowlingIds.every(id=>d.teams.find(t=>t.id===i.bowling)!.players.some(p=>p.id===id))||!Array.isArray(i.openers)||i.openers.length!==2||i.openers[0]===i.openers[1]||!i.openers.every(id=>i.battingIds.includes(id))||i.overs!==(n<2?m.overs:1)||i.maxWickets!==(n<2?i.battingIds.length-1:Math.min(2,i.battingIds.length-1)))throw new Error('Invalid innings setup.');
 if(n%2===1&&i.batting===m.innings[n-1].batting)throw new Error('The chasing team must switch.');
 if(n>0&&!replay(m.innings[n-1],n%2===0?replay(m.innings[n-2]).runs+1:undefined).done)throw new Error('Previous innings is incomplete.');
 if(n>=2&&n%2===0&&replay(m.innings[n-2]).runs!==replay(m.innings[n-1]).runs)throw new Error('Super Over requires a tie.');
 for(const e of i.events){if(typeof e.id!=='string'||!['none','wide','no-ball','bye','leg-bye'].includes(e.extra)||e.wicket&&!['Bowled','Caught','LBW','Run out','Stumped','Hit wicket'].includes(e.wicket.type))throw new Error('Invalid delivery.');}
 replay(i,n%2===1?replay(m.innings[n-1]).runs+1:undefined);
 }
 if(m.potm!==undefined&&!ids.has(m.potm))throw new Error('Invalid player award.');
 }
 if(d.teamNamesRevision!==2){
  d.teams=d.teams.map(t=>t.id==='C'&&['Super Kings','Super King'].includes(t.name)?{...t,name:'Power Hitter',short:'PH'}:t.id==='D'&&t.name==='Power Hitters'?{...t,name:'Super Kind',short:'SK'}:t);
  d.teamNamesRevision=2;
 }
 return normalize(d);
}
export function loadData():{data:Tournament;error:string} { try{const raw=localStorage.getItem(STORAGE_KEY);return {data:raw?validateData(JSON.parse(raw)):initialData(),error:''};}catch{return {data:initialData(),error:'Your saved data could not be loaded. It has not been overwritten. Download a backup or import a valid file before saving new changes.'};} }
export function download(name:string,content:string,type='text/plain'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function csv(rows:(string|number)[][]){return rows.map(r=>r.map(c=>{const value=String(c);return '"'+(/^[=+@-]/.test(value)?"'"+value:value).replaceAll('"','""')+'"';}).join(',')).join('\r\n');}
