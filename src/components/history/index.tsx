import { scoreHistoryDB } from "../indexedDB";
import { historyData } from "@/types/data";
import timeFormatter, { toUnixTime, isSameDay } from "../common/timeFormatter";
import { historyDataWithLastScore } from "@/types/history";
import { IDays } from "@/view/pages/history";
interface daysGrp {[key:string]:number};

class historyExec {
  private data:historyData[] = [];

  private classified:Map<String,historyData[]> = new Map();
  private result:historyDataWithLastScore[] = [];

  async load(propdata:historyData[]|null = null){
    this.data = propdata || await new scoreHistoryDB().getAllInSpecificVersion();
    return this;
  }

  getResult = ()=> this.result;

  generate():historyDataWithLastScore[]{
    if(!this.data) return [];
    this.classifyBySongs().addLastScore();
    this.result = this.sort(this.result).reverse() as historyDataWithLastScore[];
    return this.result;
  }

  sort(obj:historyData[]|historyDataWithLastScore[]){
    return obj.sort((a:historyData|historyDataWithLastScore,b:historyData|historyDataWithLastScore)=> toUnixTime(a.updatedAt) - toUnixTime(b.updatedAt))
  }

  classifyBySongs(){
    this.sort(this.data).map((item:historyData)=>{
      let target = item["title"] + item["difficulty"];
      let m = this.classified.get(target);
      if(!m || m.length === 0){
        m = [];
      }
      m.push(item);
      this.classified.set(target,m);
      return 0;
    });
    return this;
  }

  addLastScore():this{
    this.classified.forEach((group)=>{
      group.map((item:historyData,i:number)=>{
        const getCont = (target:"exScore"|"BPI"):number=>{
          if(i === 0){
            if(target === "exScore") return 0;
            if(target === "BPI") return -15;
          }
          return group[i-1][target];
        }
        const lastScore = getCont("exScore");
        const lastBPI = getCont("BPI");
        const cont = Object.assign(item,{
          lastScore:lastScore,
          lastBPI:lastBPI
        });
        this.result.push(cont);
        return 0;
      })
    });
    return this;
  }

  getUpdateDays():IDays[]{
    // {key:2021-01-01,number:1}
    const d = this.days();
    return Object.keys(d).reduce((result:IDays[],item:string)=>{
      result.push({key:item,num:d[item]});
      return result;
    },[]).sort((a:IDays,b:IDays)=>{
      return toUnixTime(b.key) - toUnixTime(a.key)
    })
  }

  days = ()=> this.result.reduce((groups:daysGrp,item:historyDataWithLastScore)=>{
    const day = timeFormatter(7,item["updatedAt"])
    if(!groups[day]) groups[day] = 0;
    groups[day]++;
    return groups;
  },{})

  // 新規スコア以外を表示
  showExceptForNewRecords = (f:historyDataWithLastScore)=>{
    return f.lastScore !== 0;
  }

}

export default class HistoryDataReceiver extends historyExec{

  date:string|null = null;

  public setDate(date:string):this{
    if(date === "すべて"){
      this.date = null;
    }else{
      this.date = date;
    }
    return this;
  }

  public getData():historyDataWithLastScore[]{
    return this.getResult().filter((item)=>{
      return (this.date ? isSameDay(item.updatedAt,this.date) : true)
    });
  }
}
