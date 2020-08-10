import { songsDB } from "../indexedDB";
import { CLOrigInt, CLOrigin } from "./data";
import { songData } from "@/types/data";
import bpiCalcuator from "../bpi";
import { difficultyDiscriminator } from "../songs/filter";

export default class aaaDiffCalc{
  private songsDB = new songsDB();

  async exec():Promise<CLOrigInt>{
    const songs:songData[] = (await this.songsDB.getAll()).filter((item:songData)=>item.difficultyLevel === "12");
    let results:CLOrigInt = {
      "50":[],
      "40":[],
      "30":[],
      "20":[],
      "10":[],
      "0":[],
      "-10":[],
      "-20":[]
    }
    const t = new bpiCalcuator()
    for(let i = 0; i < songs.length; ++i){
      const s = songs[i];
      const res  = t.setManual(s.wr,s.avg,s.notes,Math.ceil((s.notes * 2) * 0.889),s.coef || -1);
      const temp:CLOrigin = {
        "title":s.title,
        "difficulty":difficultyDiscriminator(s.difficulty),
        "bpi":res
      }
      if(res > 50){
        results["50"].push(temp);
      }else{
        results[Math.floor(res / 10) * 10].push(temp);
      }
    }
    return this.rangeSort(results);
  }

  rangeSort(results:CLOrigInt){
    Object.keys(results).map((item)=>{
      results[item] = results[item].sort((a:CLOrigin,b:CLOrigin)=>b.bpi - a.bpi);
      return 0;
    });
    return results;
  }
}
