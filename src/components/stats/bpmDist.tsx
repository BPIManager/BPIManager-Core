import { songsDB, scoresDB } from "../indexedDB";
import { songData, scoreData } from "../../types/data";
import { difficultyParser } from "../songs/filter";
import { _isSingle } from "../settings";
import bpiCalcuator from "../bpi";

type T = "SOF"|"~139"|"~159"|"~179"|"~199"|"200~"

interface songs{[key:string]:T};
interface scores{[key:string]:scoreData};
export type distBPMI = {"name":T,"BPI":number}

const bpmFilter = (bpm:string):T=>{
  if(bpm.indexOf("-") > -1){
    return "SOF";
  }
  const bnum = Number(bpm);
  switch(true){
    case bnum < 140:
    return "~139";
    case (bnum >= 140 && bnum < 160):
    return "~159";
    case (bnum >= 160 && bnum < 180):
    return "~179";
    case (bnum >= 180 && bnum < 200):
    return "~199";
    case (bnum >= 200):
    default:
    return "200~";
  }
}

export const bpmDist = async(difficulty:"11"|"12" = "12"):Promise<distBPMI[]>=>{
  let distByBPM:{[key in T]:number[]} = {
    "~139":[],
    "~159":[],
    "~179":[],
    "~199":[],
    "200~":[],
    "SOF":[],
  }
  let numDistByBPM = {
    "~139":0,
    "~159":0,
    "~179":0,
    "~199":0,
    "200~":0,
    "SOF":0,
  }
  let result:{[key in T]:number} = {
    "~139":-15,
    "~159":-15,
    "~179":-15,
    "~199":-15,
    "200~":-15,
    "SOF":-15,
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
    if(!isNaN(item.currentBPI)){
      distByBPM[allSongs[item.title + difficultyParser(item.difficulty,isSingle)]].push(item.currentBPI);
    }
    return groups;
  },{});
  Object.keys(distByBPM).map((item:string)=>{
    const bpi = new bpiCalcuator();
    result[item as T] = bpi.setSongs(distByBPM[item as T],numDistByBPM[item as T]);
    return 0;
  });
  return Object.keys(result).reduce((groups:distBPMI[],item:string)=>{
    groups.push({
      "name":(item as T),
      "BPI":result[item as T],
    })
    return groups;
  },[]);
}
