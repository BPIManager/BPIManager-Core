import { statMain } from "../stats/main";
import bpiCalcuator from "../bpi";
import { scoresDB } from "../indexedDB";
import { scoreData } from "@/types/data";

export const listNobi11 = {"description":"単曲BPIが総合BPIよりもだいぶ低い楽曲(☆11)","icon":"https://files.poyashi.me/bpim/grow11.jpg","length":-1,"num":-11,"title":"伸びるかも(☆11)","updatedAt":"-1"};
export const listNobi12 = {"description":"単曲BPIが総合BPIよりもだいぶ低い楽曲(☆12)","icon":"https://files.poyashi.me/bpim/grow.jpg","length":-1,"num":-12,"title":"伸びるかも(☆12)","updatedAt":"-1"};

export const defaultLists = (id:number)=>{
  switch(id){
    case -11:
    return listNobi11;
    case -12:
    default:
    return listNobi12;
  }
}

export const getListsForNobi = async(targetLevel = 12)=>{
  const exec = await new statMain(targetLevel).load();
  const songs = await new scoresDB().getAll();
  const bpi = new bpiCalcuator();
  const totalBPI = bpi.setSongs(exec.at(),exec.at().length);
  return songs.filter((item:scoreData)=>item.difficultyLevel === String(targetLevel) && (item.currentBPI < Math.pow(totalBPI,0.9)));
}
