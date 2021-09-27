import {scoreData, historyData} from "../../types/data";
import timeFormatter from "../common/timeFormatter";
import importCommon from "./common";

export default class importJSON {

  rawData:any[] = [];
  common:importCommon = new importCommon();

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
    return this.common.getResult();
  }

  getResultHistory():historyData[]{
    return this.common.getResultHistory();
  }

  execute():Promise<number>{
    const self = this;
    return new Promise(function(resolve, reject) {
      try{
        const lengthSum = self.rawData.length;
        for(let i = 1; i < lengthSum; ++i){
          const p = self.rawData[i];
          const name = self.common.nameEscape(p["title"],true);
          if(Number(p.score === 0)) continue;
          self.common.setResult({
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

          self.common.setResultHistory({
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
        return resolve(1);
      }catch(e:any){
        console.log(e);
        return reject(e);
      }
    });
  }
}
