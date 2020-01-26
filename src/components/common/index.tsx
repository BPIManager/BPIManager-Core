import bpiCalcuator from "../bpi";
import {scoresDB} from "../indexedDB";
import {scoreData} from "../../types/data";
import {_isSingle,_currentStore} from "../settings";

export const commonFunc = class{

  private s:any;

  set = (s:any):this=>{
    this.s = s;
    return this;
  }

  clone = () => JSON.parse(JSON.stringify(this.s));
}

export const arenaRankColor = (rank:string)=>{
  switch(rank){
    case "A1":
    return "rgb(255, 89, 89)";
    case "A2":
    case "A3":
    return "rgb(255, 141, 23)"
    case "A4":
    case "A5":
    return "rgb(166, 23, 255)"
    case "B1":
    case "B2":
    return "rgb(89, 117, 255)"
    case "B3":
    case "B4":
    return "rgb(87, 94, 127)"
    case "B5":
    return "rgb(27, 28, 31)"
  }
}


export const getTotalBPI = async():Promise<number>=>{
  const bpi = new bpiCalcuator();
  bpi.setTraditionalMode(0);
  const db = await new scoresDB(_isSingle(),_currentStore()).loadStore();
  const twelves = await db.getItemsBySongDifficulty("12");
  const bpiMapper = (t:scoreData[])=>t.map((item:scoreData)=>item.currentBPI);

  bpi.allTwelvesBPI = bpiMapper(twelves);
  bpi.allTwelvesLength = twelves.length;

  return bpi.totalBPI();
}

export const noimg = "https://files.poyashi.me/noimg.png"
