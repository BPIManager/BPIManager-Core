import {scoreData} from "../../types/data";
import { convertClearState } from "../songs/filter";
import timeFormatter from "../common/timeFormatter";

export default class importCSV {

  rawData:string = "";
  result:scoreData[] = [];
  resultHistory:any[] = [];

  isSingle:number = 1;
  currentStore:string = "";

  constructor(raw:string,isSingle?:number,currentStore?:string){
    this.rawData = raw;
    if(isSingle)this.isSingle = isSingle;
    if(currentStore)this.currentStore = currentStore;
  }

  getResult():scoreData[]{
    return this.result;
  }

  getResultHistory():any[]{
    return this.resultHistory;
  }

  execute():Promise<number>{
    const self = this;
    let mode = 0;
    return new Promise(function(resolve, reject) {
      try{
        const splittedByBreak:string[] = self.rawData.split(/\r\n|\n/);
        const lengthSum:number = splittedByBreak.length;
        let result = [],resultHistory = [];
        for(let i = 0; i < lengthSum; ++i){
          let eachObjNum:number[] = [];
          let t:string = "";
          const p = splittedByBreak[i].split(/,/);
          if(i===0 && p[5] === "NORMAL 難易度"){
            //Rootage以前のCSV判別
            mode = 1;
          }
          console.log(p[5]);
          if(mode === 0){
            //HYPER
            if(Number(p[19]) > 10 && Number(p[20]) > 0){
              t = "hyper";
              eachObjNum = [0,1,20,21,22,23,24,25,40];
            }
            //ANOTHER
            if(Number(p[26]) > 10 && Number(p[27]) > 0){
              t = "another";
              eachObjNum = [0,1,27,28,29,30,31,32,40];
            }
            //LEGGENDARIA
            if(Number(p[33]) > 10 && Number(p[34]) > 0){
              t = "leggendaria";
              eachObjNum = [0,1,34,35,36,37,38,39,40];
            }
          }else{
            //HYPER
            if(Number(p[12]) > 10 && Number(p[13]) > 0){
              t = "hyper";
              eachObjNum = [0,1,13,14,15,16,17,18,26];
            }
            //ANOTHER
            if(Number(p[19]) > 10 && Number(p[20]) > 0){
              t = "another";
              eachObjNum = [0,1,20,21,22,23,24,25,26];
            }
          }
          if(!p[eachObjNum[1]]){
            continue;
          }

          const clearState:string|number = convertClearState(p[eachObjNum[6]],0);
          if(typeof clearState !== "number"){throw new Error();}

          result.push({
            title:p[eachObjNum[1]],
            version:p[eachObjNum[0]],
            difficulty:t,
            currentBPI:0,
            difficultyLevel:"-",
            exScore:Number(p[eachObjNum[2]]),
            Pgreat:Number(p[eachObjNum[3]]),
            great:Number(p[eachObjNum[4]]),
            missCount:Number(p[eachObjNum[5]]),
            clearState:clearState,
            DJLevel:p[eachObjNum[7]],
            lastPlayed:p[eachObjNum[8]],
            storedAt:self.currentStore,
            isSingle:self.isSingle,
            isImported:true,
            updatedAt:timeFormatter(0)
          });
          resultHistory.push({
            title:p[eachObjNum[1]],
            exScore:Number(p[eachObjNum[2]]),
            difficulty:t,
            difficultyLevel:"-",
            storedAt:self.currentStore,
            isSingle:self.isSingle,
            BPI:0,
            updatedAt:p[eachObjNum[8]],
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
