
export interface importData{
  difficulty:string,
  version:string,
  title:string,
  exScore:number,
  Pgreat:number,
  great:number,
  missCount:number,
  clearState:string,
  DJLevel:string,
  lastPlayed:string,
}

export default class importCSV {

  rawData:string = "";
  result:importData[] = [];

  constructor(raw:string){
    this.rawData = raw;
  }

  getResult():importData[]{
    return this.result;
  }

  execute():Promise<number>{
    const self = this;
    return new Promise(function(resolve, reject) {
      try{
        const splittedByBreak:string[] = self.rawData.split(/\r\n|\n/);
        const lengthSum:number = splittedByBreak.length;
        let result = [];
        for(let i = 0; i < lengthSum; ++i){
          let eachObjNum:number[] = [];
          let t:string = "";
          const p = splittedByBreak[i].split(/,/);
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
          if(!p[eachObjNum[1]]){
            continue;
          }
          result.push({
            title:p[eachObjNum[1]],
            version:p[eachObjNum[0]],
            difficulty:t,
            exScore:Number(p[eachObjNum[2]]),
            Pgreat:Number(p[eachObjNum[3]]),
            great:Number(p[eachObjNum[4]]),
            missCount:Number(p[eachObjNum[5]]),
            clearState:p[eachObjNum[6]],
            DJLevel:p[eachObjNum[7]],
            lastPlayed:p[eachObjNum[8]],
          });
        }
        self.result = result;
        return resolve(result.length);
      }catch(e){
        return reject(e);
      }
    });
  }
}
