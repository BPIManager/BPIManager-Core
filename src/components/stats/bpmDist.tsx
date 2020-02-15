import { songsDB, scoresDB } from "../indexedDB";
import { songData, scoreData } from "../../types/data";
import { difficultyParser } from "../songs/filter";
import { _isSingle } from "../settings";
import bpiCalcuator from "../bpi";

type T = "SOFLAN"|"-139"|"140-159"|"160-179"|"180-199"|"200+"

interface songs{[key:string]:T};
interface scores{[key:string]:scoreData};
export type distBPMI = {"name":T,"value":number}

const bpmFilter = (bpm:string):T=>{
  if(bpm.indexOf("-") > -1){
    return "SOFLAN";
  }
  const bnum = Number(bpm);
  switch(true){
    case bnum < 140:
    return "-139";
    case (bnum >= 140 && bnum < 160):
    return "140-159";
    case (bnum >= 160 && bnum < 180):
    return "160-179";
    case (bnum >= 180 && bnum < 200):
    return "180-199";
    case (bnum >= 200):
    default:
    return "200+";
  }
}

export const bpmDist = async(difficulty:"11"|"12" = "12"):Promise<distBPMI[]>=>{
  let distByBPM:{[key in T]:number[]} = {
    "-139":[],
    "140-159":[],
    "160-179":[],
    "180-199":[],
    "200+":[],
    "SOFLAN":[],
  }
  let numDistByBPM = {
    "-139":0,
    "140-159":0,
    "160-179":0,
    "180-199":0,
    "200+":0,
    "SOFLAN":0,
  }
  let result:{[key in T]:number} = {
    "-139":-15,
    "140-159":-15,
    "160-179":-15,
    "180-199":-15,
    "200+":-15,
    "SOFLAN":-15,
  }
  const isSingle = _isSingle();
  const sdb = new songsDB();
  const scdb = new scoresDB();
  const allSongs:songs = (await sdb.getAll()).filter((item:songData)=>item.difficultyLevel === difficulty).reduce((groups:songs,item:songData)=>{
    const b = bpmFilter(item.bpm);
    groups[item.title + item.difficulty] = b;
    numDistByBPM[b]++;
    return groups;
  },{});
  (await (await scdb.loadStore()).getItemsBySongDifficulty(difficulty)).reduce((groups:scores,item:scoreData)=>{
    distByBPM[allSongs[item.title + difficultyParser(item.difficulty,isSingle)]].push(item.currentBPI);
    return groups;
  },{});
  Object.keys(distByBPM).map((item:string)=>{
    const bpi = new bpiCalcuator();
    result[item as T] = bpi.setSongs(distByBPM[item as T],numDistByBPM[item as T]);
  });
  return Object.keys(result).reduce((groups:distBPMI[],item:string)=>{
    groups.push({
      "name":(item as T),
      "value":result[item as T],
    })
    return groups;
  },[]);
}
