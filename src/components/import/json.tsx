import {scoreData, historyData} from "../../types/data";
import timeFormatter from "../common/timeFormatter";

export default class importJSON {

  rawData:any[] = [];
  result:scoreData[] = [];
  resultHistory:historyData[] = [];

  isSingle:number = 1;
  currentStore:string = "";
  updateTime:string = "";

  constructor(raw:string,isSingle:number = 1,currentStore?:string){
    this.rawData = JSON.parse(raw);
    this.isSingle = isSingle;
    this.updateTime = timeFormatter(3);
    if(currentStore)this.currentStore = currentStore;
  }

  getResult():scoreData[]{
    return this.result;
  }

  getResultHistory():historyData[]{
    return this.resultHistory;
  }

  execute():Promise<number>{
    const self = this;
    let mode = 0;
    return new Promise(function(resolve, reject) {
      try{
        let result = [],resultHistory = [];
        const lengthSum = self.rawData.length;
        for(let i = 1; i < lengthSum; ++i){
          const p = self.rawData[i];
          let name = p["title"].replace(/ +$/g,"");
          if(mode === 1 && name === "炎影") name = "火影";
          if(name === "Rave*it!! Rave*it!!") name = "Rave*it!! Rave*it!! ";
          if(name === "Close the World feat. a☆ru") name = "Close the World feat.a☆ru";
          if(Number(p.score === 0)) continue;
          result.push({
            title:name,
            difficulty:p.difficulty,
            currentBPI:0,
            difficultyLevel:"-",
            exScore:Number(p.score),
            missCount:NaN,
            clearState:p.clear,
            lastScore:-1,
            storedAt:self.currentStore,
            isSingle:self.isSingle,
            updatedAt:self.updateTime
          });
          resultHistory.push({
            title:name,
            exScore:p.score,
            difficulty:p.difficulty,
            difficultyLevel:"-",
            storedAt:self.currentStore,
            isSingle:self.isSingle,
            BPI:0,
            updatedAt:self.updateTime,
          });
        }
        self.result = result;
        self.resultHistory = resultHistory;
        return resolve(result.length);
      }catch(e){
        console.log(e);
        return reject(e);
      }
    });
  }
}
