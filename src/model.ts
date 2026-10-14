export type Role = 'Batter' | 'Bowler' | 'All-rounder' | 'Wicketkeeper';
export type Player = { id: number; name: string; role: Role; active: boolean };
export type Team = { id: string; name: string; short: string; color: string; captain: number; players: Player[] };
export type Extra = 'none' | 'wide' | 'no-ball' | 'bye' | 'leg-bye';
export type Dismissal = 'Bowled' | 'Caught' | 'LBW' | 'Run out' | 'Stumped' | 'Hit wicket';
export type Delivery = { id: string; bowler: number; runs: number; extra: Extra; extraRuns: number; noBallExtras?: { kind: 'bye' | 'leg-bye'; runs: number }; wicket?: { type: Dismissal; player: number; next?: number; fielder?: number } };
export type Innings = { batting: string; bowling: string; battingIds: number[]; bowlingIds: number[]; openers: [number, number]; overs: number; maxWickets: number; events: Delivery[] };
export type Match = { id: number; home: string; away: string; date: string; venue: string; overs: number; innings: Innings[]; abandoned?: boolean; potm?: number };
export type Tournament = { version: 1; teamNamesRevision?: number; teams: Team[]; matches: Match[]; settings: { superOver: boolean; tiebreak: 'wins' | 'head-to-head'; minBalls: number }; champion?: string };
const roster: [string,string,string,string,[number,string][]][] = [
 ['A','Thunder Strikers','TS','#00e5a8',[[3,'Prem Sagar'],[9,'Yashodeep'],[14,'Samrudhi'],[18,'Sudhanshu'],[22,'Kunj'],[25,'Aniket Mule'],[29,'Pavan Patil'],[32,'Khushi'],[36,'Vardhaman'],[39,'Samruddhi'],[44,'Satyam']]],
 ['B','Royal Challengers','RC','#9f89ff',[[2,'Sushant'],[6,'Swapnil Kadnar'],[11,'Anushka'],[15,'Vivek'],[19,'Sujay'],[24,'Sakshi'],[27,'Krishna'],[30,'Rhucha'],[35,'Ashutosh'],[40,'Prem Costm'],[42,'DHANANJAY NALAVDE']]],
 ['C','Power Hitter','PH','#ffc857',[[1,'Prem Komti'],[7,'Jayesh'],[12,'Gokul'],[16,'Shubham'],[20,'Rutuja'],[23,'Mukund'],[28,'Vaibhav Pawar'],[33,'Sarish'],[37,'prathamesh'],[41,'Shrushti'],[43,'Shreyash']]],
 ['D','Super Kind','SK','#00c8ff',[[4,'Pranoti'],[5,'Trishala'],[8,'Dhananjay T'],[10,'Pratik'],[13,'Omkar Pawar'],[17,'Dhananjay Nalawade'],[21,'Sumit'],[26,'Vedant'],[31,'Virendra'],[34,'Skhitij'],[38,'Ravina']]]
];
export function initialData(): Tournament { return {version:1, teamNamesRevision:2, teams:roster.map(([id,name,short,color,players])=>({id,name,short,color,captain:players[0][0],players:players.map(([id,name])=>({id,name,role:'All-rounder',active:true}))})),matches:[['A','B'],['C','D'],['A','C'],['B','D'],['A','D'],['B','C'],['','']].map(([home,away],i)=>({id:i+1,home,away,date:'',venue:'Office Cricket Ground',overs:6,innings:[]})),settings:{superOver:true,tiebreak:'wins',minBalls:6}}; }
export const playerName = (data:Tournament,id:number) => data.teams.flatMap(t=>t.players).find(p=>p.id===id)?.name ?? `Player #${id}`;
export const teamName = (data:Tournament,id:string) => data.teams.find(t=>t.id===id)?.name ?? 'To be decided';
