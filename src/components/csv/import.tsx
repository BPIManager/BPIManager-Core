import {scoreData, historyData} from "../../types/data";
import { convertClearState,convertLeggendariaStates } from "../songs/filter";

export default class importCSV {

  rawData:string = "";
  result:scoreData[] = [];
  resultHistory:historyData[] = [];

  isSingle:number = 1;
  currentStore:string = "";

  constructor(raw:string,isSingle:number = 1,currentStore?:string){
    this.rawData = raw;
    this.isSingle = isSingle;
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
        const splittedByBreak:string[] = self.rawData.split(/\r\n|\n/);
        const lengthSum:number = splittedByBreak.length;
        let result = [],resultHistory = [];
        if(splittedByBreak[0].split(/,/)[5] === "NORMAL 難易度"){
          //Rootage以前のCSV判別
          mode = 1;
        }
        for(let i = 1; i < lengthSum; ++i){
          for(let j = 0; j < 3; ++j){
            let eachObjNum:number[] = [];
            let t:string = "";
            const p = splittedByBreak[i].split(/,/);
            if(mode === 0){
              //HYPER
              if(j === 0){
                if(Number(p[19]) <= 10 || Number(p[20]) === 0){
                  continue;
                }
                t = "hyper";
                eachObjNum = [0,1,20,21,22,23,24,25,40];
              }
              //ANOTHER
              if(j === 1){
                if(Number(p[26]) <= 10 || Number(p[27]) === 0){
                  continue;
                }
                t = "another";
                eachObjNum = [0,1,27,28,29,30,31,32,40];
              }
              //LEGGENDARIA
              if(j === 2){
                if(Number(p[33]) <= 10 || Number(p[34]) === 0){
                  continue;
                }
                t = "leggendaria";
                eachObjNum = [0,1,34,35,36,37,38,39,40];
              }
            }else{
              //HYPER
              if(j === 0){
                if(Number(p[12]) <= 10 || Number(p[13]) === 0){
                  continue;
                }
                t = "hyper";
                eachObjNum = [0,1,13,14,15,16,17,18,26];
              }
              //ANOTHER
              if(j === 1){
                if(Number(p[19]) <= 10 || Number(p[20]) === 0){
                  continue;
                }
                t = "another";
                eachObjNum = [0,1,20,21,22,23,24,25,26];
              }
              if(j === 2) continue;
            }
            if(!p[eachObjNum[1]]){
              continue;
            }

            let {name,difficulty} = mode === 1 ? convertLeggendariaStates(p[eachObjNum[1]],t) : {name:p[eachObjNum[1]],difficulty:t};
            const clearState:string|number = convertClearState(p[eachObjNum[6]],0);
            if(typeof clearState !== "number") throw new Error();
            name = name.replace(/ +$/g,"");
            if(mode === 1 && name === "炎影") name = "火影";
            if(name === "Rave*it!! Rave*it!!") name = "Rave*it!! Rave*it!! ";
            if(name === "Close the World feat. a☆ru") name = "Close the World feat.a☆ru";
            if(Number(p[eachObjNum[2]]) === 0) continue;
            result.push({
              title:name,
              version:p[eachObjNum[0]],
              difficulty:difficulty,
              currentBPI:0,
              difficultyLevel:"-",
              exScore:Number(p[eachObjNum[2]]),
              missCount:Number(p[eachObjNum[5]]),
              clearState:clearState,
              lastPlayed:p[eachObjNum[8]],
              lastScore:-1,
              storedAt:self.currentStore,
              isSingle:self.isSingle,
              updatedAt:p[eachObjNum[8]]
            });
            resultHistory.push({
              title:name,
              exScore:Number(p[eachObjNum[2]]),
              difficulty:difficulty,
              difficultyLevel:"-",
              storedAt:self.currentStore,
              isSingle:self.isSingle,
              BPI:0,
              updatedAt:p[eachObjNum[8]],
            });
          }
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
