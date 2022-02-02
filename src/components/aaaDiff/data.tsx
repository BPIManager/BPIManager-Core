import aaaDiffCalc from "./exec";
import { rivalScoreData, scoreData } from "@/types/data";
import { scoresDB } from "../indexedDB";
import { _isSingle, _currentStore } from "../settings";

export interface CLOrigin {"title":string,"difficulty":string,"bpi":number};
export interface CLBody extends CLOrigin{"currentBPI":number,"exScore":number};
export interface CLInt {[key:string]:CLBody[]};
export interface CLOrigInt {[key:string]:CLOrigin[]};

export const AAADifficulty = async(diff = 12,target = 0)=> await new aaaDiffCalc().exec(diff,target);

export const getTable = async(targetLevel:number = 12,named:any,target:number = 0)=>{
  const table = await AAADifficulty(targetLevel,target);
  let result:CLInt = {};
  Object.keys(table).map((diffs:string)=>{
    result[diffs] = [];
    for(let i=0; i <table[diffs].length; ++i){
      const p = table[diffs][i];
      const diff = p["difficulty"];
      named[p["title"] + diff] && result[diffs].push({
        bpi:p["bpi"],
        title:p["title"],
        difficulty:diff,
        currentBPI:named[p["title"] + diff]["currentBPI"],
        exScore:named[p["title"] + diff]["exScore"]
      });
      !named[p["title"] + diff] && result[diffs].push({
        title:p["title"],
        difficulty:diff,
        bpi:p["bpi"],
        currentBPI:NaN,
        exScore:NaN
      });
    }
    return 0;
  });
  return result;
}

export const named = async (targetLevel:number = 12,data?:rivalScoreData[]|scoreData[])=>{
  const fil = (t:any)=>t.filter((item:rivalScoreData|scoreData)=>item.difficultyLevel === String(targetLevel)).reduce((groups:{[key:string]:any},item:any)=>{
    groups[item.title + item.difficulty] = item;
    return groups;
  },{});
  if(data){
    return fil(data);
  }
  const db = await new scoresDB(_isSingle(),_currentStore()).loadStore();
  const full:scoreData[] = await db.getItemsBySongDifficulty(String(targetLevel));
  return fil(full);
}
