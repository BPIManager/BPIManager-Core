
import { songsDB } from "@/components/indexedDB";
import { songData } from "@/types/data";
import { data } from "./data";
import bpiCalcuator from "@/components/bpi";

const _exec = async ()=>{
  const songs = (await new songsDB().getAll()).filter((item:songData)=>item.difficultyLevel === "12");
  const songsObj = songs.reduce((groups:{[key:string]:songData},item:songData)=>{
    groups[item.title + item.difficulty] = item;
    return groups;
  },{});
  const _data = data;
  const calc = new bpiCalcuator();
  let result:any[] = [];
  for(let i = 0;i < _data.length; ++i){
    const d = _data[i];
    const bpi = calc.setPropData(songsObj[d.title + d.difficulty],Number(d.avg),1);
    result.push({
      "title":d.title,
      "difficulty":d.difficulty,
      "bpi":bpi
    });
  }
  console.log(JSON.stringify(result.sort((a,b)=>b.bpi - a.bpi)));
}


export const ___dummy = "";
