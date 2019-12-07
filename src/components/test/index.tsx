import bpiCalcuator from "../bpi";
import {songsDB} from "../indexedDB";
import { getSongSuffixForIIDXInfo } from "../songs/filter";
export const t = async ()=>{
  const s = (await new songsDB().getAll(1,false)).reduce((groups:any,item:any)=>{
    if(item.difficultyLevel === "12"){
      groups[item.title + getSongSuffixForIIDXInfo(item.title,item.difficulty)] = {
        "avg":item.avg,
        "max":item.notes * 2,
        "wr":item.wr
      };
    }
    return groups;
  },{});
  console.log(JSON.stringify(s));
}
