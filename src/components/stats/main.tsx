import { groupedArray, perDate } from "../../types/stats";
import { songsDB, scoresDB, scoreHistoryDB } from "../indexedDB";
import { songData, scoreData, historyData, rivalScoreData } from "../../types/data";
import { _isSingle, _currentStore } from "../settings";
import { _DiscriminateRanksByNumber } from "../common/djRank";
import { difficultyDiscriminator } from "../songs/filter";
import bpiCalcuator from "../bpi";
import timeFormatter, { timeCompare } from "../common/timeFormatter";
import dayjs from "dayjs";
const isSingle = _isSingle();
const currentStore = _currentStore();
export const BPITicker = [-20,-10,0,10,20,30,40,50,60,70,80,90,100];
interface shiftType {title:string,bpi:number};

export const statMain = class {

  private db = new scoresDB(isSingle,currentStore);

  private twelves:scoreData[] = [];
  private elevens:scoreData[] = [];
  private songs:songData[] = [];

  private targetLevel:number = 12;

  constructor(targetLevel:number){
    this.targetLevel = targetLevel;
  }

  async load(_derived?:rivalScoreData[]):Promise<this>{
    await this.db.loadStore();
    this.songs = await new songsDB().getAll(isSingle);
    this.twelves = await this.db.getItemsBySongDifficulty("12");
    this.elevens = await this.db.getItemsBySongDifficulty("11");
    return this;
  }

  async songsByClearState(){
    const songsByClearState:groupedArray[] = [
      {name:"FAILED","☆11":0,"☆12":0},
      {name:"ASSISTED","☆11":0,"☆12":0},
      {name:"EASY","☆11":0,"☆12":0},
      {name:"CLEAR","☆11":0,"☆12":0},
      {name:"HARD","☆11":0,"☆12":0},
      {name:"EXHARD","☆11":0,"☆12":0},
      {name:"FC","☆11":0,"☆12":0},
    ];

    this.songs.reduce((groups:groupedArray[],item:songData) =>{
      const score = this.songFinder(item["difficultyLevel"],item["title"],item["difficulty"]);
      if(score){
        const lev = "☆"+item["difficultyLevel"] as "☆11"|"☆12";
        if(score.clearState > 0){
          score.clearState < 7 && songsByClearState[score.clearState][lev]++;
        }
      }
      return groups;
    },[]);

    return songsByClearState.reverse();
  }

  makeGraphSentence(data:groupedArray[]){
    let res = [];
    for(let i:number = 0;i < data.length; ++i){
      const d = data[i];
      const lev = "☆"+ String(this.targetLevel) as "☆11"|"☆12";
      if(d[lev] !== 0){
        res.push({"name":d["name"],[lev]:d[lev]})
      }
    }
    return res;
  }

  async songsByDJRank(){

    const songsByDJRank:groupedArray[] = [
      {name:"F","☆11":0,"☆12":0},
      {name:"E","☆11":0,"☆12":0},
      {name:"D","☆11":0,"☆12":0},
      {name:"C","☆11":0,"☆12":0},
      {name:"B","☆11":0,"☆12":0},
      {name:"A","☆11":0,"☆12":0},
      {name:"AA","☆11":0,"☆12":0},
      {name:"AAA","☆11":0,"☆12":0},
    ]

    this.songs.reduce((groups:groupedArray[],item:songData) =>{
      const score = this.songFinder(item["difficultyLevel"],item["title"],item["difficulty"]);
      if(score){
        const p = score.exScore / (item["notes"] * 2);
        const lev = "☆"+item["difficultyLevel"] as "☆11"|"☆12";
        songsByDJRank[_DiscriminateRanksByNumber(p)][lev]++;
      }
      return groups;
    },[])

    return songsByDJRank.reverse();

  }

  async groupedByLevel(){
    let bpis = BPITicker;
    let groupedByLevel = [];
    const allSongsTwelvesBPI = this.groupBy(this.bpiMapper(this.twelves));
    const allSongsElevensBPI = this.groupBy(this.bpiMapper(this.elevens));
    for(let i = 0; i < bpis.length; ++i){
      let obj:{"name":number,"☆11":number,"☆12":number} = {"name":bpis[i],"☆11":0,"☆12":0};
      obj["☆11"] = allSongsElevensBPI[bpis[i]] ? allSongsElevensBPI[bpis[i]] : 0;
      obj["☆12"] = allSongsTwelvesBPI[bpis[i]] ? allSongsTwelvesBPI[bpis[i]] : 0;
      groupedByLevel.push(obj);
    }
    return groupedByLevel;
  }

  async eachDaySum(period:number,last?:string|Date):Promise<perDate[]>{
    let eachDaySum:perDate[] = [];
    let eachDayShift:{[key:string]:shiftType[]} = {};
    /*
    {
      day:[{songTitle:string,difficulty(another,etc.):string,bpi:number}],...
    }
     */
    const sortByDate = (data:historyData[]):{[key:string]:historyData[]}=>{
      return data.reduce((groups:{[key:string]:historyData[]}, item:historyData) => {
        const date = timeFormatter(period,item.updatedAt);
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {});
    }
    const allDiffs = this.objectSort(sortByDate(await new scoreHistoryDB().getAll(String(this.targetLevel))));
    const _bpi = new bpiCalcuator();
    const total = (item:historyData[]):number=>{
      let t = item.reduce((sum:number,item:historyData)=>{
        sum += item.BPI;
        return sum;
      },0);
      return t;
    }
    const getBPIArray = (item:historyData[]):number[]=>{
      let t = item.reduce((array:number[],item:historyData)=>{
        array.push(item.BPI);
        return array;
      },[]);
      return t;
    }
    let lastDay:string;
    Object.keys(allDiffs).map((item)=>{
      if(!last || dayjs(item).isBefore(last)){
        eachDayShift[item] = lastDay ? eachDayShift[lastDay].concat() : [];
        const p = allDiffs[item].reduce((a:number[],val:historyData)=>{
          eachDayShift[item] = eachDayShift[item].filter((elm)=>{
            return (elm.title !== String(val.title + val.difficulty));
          }); //重複削除
          eachDayShift[item].push({title:val.title + val.difficulty,bpi:val.BPI}); //改めて追加
          if(val.BPI){
            a.push(val.BPI);
          }
          lastDay = item;
          return a;
        },[]);
        _bpi.allTwelvesLength = p.length;
        _bpi.allTwelvesBPI = p;
        const avg = _bpi.totalBPI();
        const shift = this.getBPIShifts(eachDayShift[item]);
        _bpi.allTwelvesLength = shift.length;
        _bpi.allTwelvesBPI = shift;
        const shiftBPI = _bpi.totalBPI();
        const BPIsArray = getBPIArray(allDiffs[item]);
        eachDaySum.push({
          name : item,
          sum : allDiffs[item].length,
          shiftedBPI:shiftBPI,
          max:Math.max(...BPIsArray),
          min:Math.min(...BPIsArray),
          med:this.getMedian(BPIsArray),
          avg : avg ? avg : Math.round(total(allDiffs[item]) / allDiffs[item].length * 100) / 100
        });
        return 0;
        }
    });
    return eachDaySum.sort((a,b)=> timeCompare(a.name,b.name)).slice(-10);
  }

  getBPIShifts = (array:shiftType[])=>{
    return array.reduce((groups:number[],val:shiftType)=>{
      groups.push(val.bpi);
      return groups;
    },[])
  }

  getMedian = (array:number[]) => {
    const mid = Math.floor(array.length / 2),
    nums = [...array].sort((a, b) => a - b);
    return Math.round((array.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2) * 100) / 100;
  };

  at = ()=> this.bpiMapper(this.targetLevel === 12 ? this.twelves : this.elevens);
  songFinder = (level:string,title:string,difficulty:string)=>(
    level === "12" ? this.twelves : this.elevens
  ).find((elm:scoreData)=>( elm.title === title && elm.difficulty === difficultyDiscriminator(difficulty) ) )

  bpiMapper = (t:scoreData[])=>t.map((item:scoreData)=>item.currentBPI).filter(item=>!isNaN(item));

  groupBy = (array:number[])=>{
    return array.reduce((groups:{[key:number]:number}, item:number) => {
      let _ = Math.floor(item / 10) * 10;
      if(_ > 100) _ = 100
      if (!groups[_]) {
        groups[_] = 1;
      }else{
        groups[_]++;
      }
      return groups;
    }, {});
  }

  objectSort = (object:any)=> {
    var sorted:any = {};
    var array:string[] = [];
    for (const key in object) {
        if (object.hasOwnProperty(key)) {
            array.push(key);
        }
    }
    array.sort();
    for (var i = 0; i < array.length; i++) {
        sorted[array[i]] = object[array[i]];
    }
    return sorted;
  }

}
