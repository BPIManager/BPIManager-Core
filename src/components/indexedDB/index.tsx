import Dexie from "dexie";
import {scoreData,songData} from "../../types/data";
import timeFormatter from "../common/timeFormatter";
import {_currentStore,_isSingle} from "../settings";
import moment from "moment";

const storageWrapper = class extends Dexie{
  target: string = "scores";
  //あとで書いとく
  scores:Dexie.Table<any, any>;
  songs:Dexie.Table<any, any>;
  stores: Dexie.Table<any, any>;

  constructor(){
    super("ScoreCoach");
    this.version(1).stores({
      scores : "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,Pgreat,great,missCount,clearState,lastPlayed,storedAt,isSingle,isImported,updatedAt,lastScore",
      songs : "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
      stores : "&name,updatedAt",
      scoreHistory : "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt"
    });
    this.scores = this.table("scores");
    this.songs = this.table("songs");
    this.stores = this.table("stores");
  }

}

export const scoresDB = class extends storageWrapper{
  scores: Dexie.Table<any, any>;
  storedAt:string = "";

  constructor(storedAt?:string){
    super();
    this.scores = this.table("scores");
    if(storedAt) this.storedAt = storedAt;
  }

  async getAll():Promise<scoreData[]>{
    const currentData = await this.scores.where({
      storedAt:_currentStore(),
      isSingle:_isSingle(),
    }).toArray();
    return currentData;
  }

  async deleteAll():Promise<void>{
    return await this.scores.clear();
  }

  getItem(title:string,difficulty:string,storedAt:string,isSingle:number):Promise<scoreData[]>{
    return this.scores.where("[title+difficulty+storedAt+isSingle]").equals([title,difficulty,storedAt,isSingle]).toArray();
  }

  //for statistics
  async getAllTwelvesBPI(isSingle:number,storedAt:string,diff:string = "12"):Promise<number[]>{
    let data:scoreData[] = await this.scores.where({
      storedAt:storedAt,isSingle:isSingle,
    }).toArray();
    data = data.filter(item=>item.difficultyLevel === diff) ;
    return data.map((item:scoreData)=>item.currentBPI);
  }

  async resetItems(storedAt:string):Promise<number>{
    return await this.scores.where({storedAt:storedAt}).delete();
  }

  async resetImportedItems():Promise<number>{
    return await this.scores.where({isImported:"true"}).delete();
  }

  setItem(item:any):any{
    try{
      return this.scores.put({
        title:item["title"],
        version:item["version"],
        difficulty:item["difficulty"],
        difficultyLevel:item["difficultyLevel"],
        currentBPI:item["currentBPI"],
        exScore:Number(item["exScore"]),
        Pgreat:Number(item["Pgreat"]),
        great:Number(item["great"]),
        missCount:Number(item["missCount"]),
        clearState:item["clearState"],
        lastPlayed:item["lastPlayed"],
        lastScore:item["lastScore"],
        storedAt:item["storedAt"],
        isSingle:item["isSingle"],
        isImported:true,
        updatedAt : item["updatedAt"]
      })
    }catch(e){
      console.log(e);
    }
  }

  async updateScore(score:scoreData|null,data:{currentBPI:number,exScore:number}):Promise<boolean>{
    try{
      if(!score){return false;}
      if(score.updatedAt === "-"){
        //put
        let newScoreData:scoreData = score;
        newScoreData.currentBPI = data.currentBPI;
        newScoreData.exScore = data.exScore;
        newScoreData.updatedAt = timeFormatter(0);
        await this.scores.add(newScoreData);
      }else{
        //update
        await this.scores.where("[title+difficulty+storedAt+isSingle]").equals([score.title,score.difficulty,score.storedAt,score.isSingle]).modify(
        Object.assign(data,{
          updatedAt : timeFormatter(0),
          lastScore: score.exScore,
        })
        );
      }
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }

  async removeItem(title:string,storedAt:string):Promise<number>{
    return await this.scores.where({title:title,storedAt:storedAt}).delete();
  }

}


export const scoreHistoryDB = class extends storageWrapper{
  scoreHistory: Dexie.Table<any, any>;
  isSingle:number = 1;
  currentStore:string = "27";

  constructor(){
    super();
    this.scoreHistory = this.table("scoreHistory");
    this.isSingle = _isSingle();
    this.currentStore = _currentStore();
  }

  add(score:scoreData|null,data:{currentBPI:number,exScore:number},forceUpdateTime:boolean = false):boolean{
    try{
      if(!score){return false;}
      this.scoreHistory.add({
        title:score.title,
        exScore:data.exScore,
        difficulty:score.difficulty,
        difficultyLevel:score.difficultyLevel,
        storedAt:score.storedAt,
        BPI:data.currentBPI,
        updatedAt:forceUpdateTime ? score.updatedAt : timeFormatter(3),
        isSingle:score.isSingle,
      });
      return true;
    }catch(e){
      console.log(e);
      return false;
    }
  }

  async check(item:scoreData):Promise<{willUpdate:boolean,lastScore:number}>{
    try{
      const t = await this.scoreHistory.where("[title+storedAt+difficulty+isSingle]").equals(
        [item["title"],item["storedAt"],item["difficulty"],item["isSingle"]]
      ).toArray();
      return {
        willUpdate:t.length === 0 ? true : Number(item.exScore) >= Number(t[t.length - 1].exScore),
        lastScore:t.length === 0 ? -1 : t[t.length-1].exScore
      };
    }catch(e){
      return {
        willUpdate:false,
        lastScore:0,
      };
    }
  }
  //リファクタ済み
  async getAll(_isSingle:number,_storedAt:string,diff:string = "12"):Promise<any[]>{
    try{
      return await this.scoreHistory.where(
        {storedAt:this.currentStore,isSingle:this.isSingle,difficultyLevel:diff}
      ).toArray();
    }catch(e){
      console.log(e);
      return [];
    }
  }

  async reset(_isSingle:number,_storedAt:string):Promise<any>{
    try{
      return await this.scoreHistory.where(
        {storedAt:this.currentStore,isSingle:this.isSingle}
      ).delete();
    }catch(e){
      console.log(e);
      return 0;
    }
  }

  async getWithinVersion(song:songData):Promise<any[]>{
    try{
      if(!song){return [];}
      return await this.scoreHistory.where(
        {storedAt:this.currentStore,isSingle:this.isSingle,title:song.title}
      ).toArray().then(t=>t.sort((a,b)=>{
        return moment(b.updatedAt).diff(moment(a.updatedAt))
      }));
    }catch(e){
      console.log(e);
      return [];
    }
  }

  async getAcrossVersion(song:songData):Promise<any[]>{
    try{
      if(!song){return [];}
      const all = await this.scoreHistory.where(
        {isSingle:this.isSingle,title:song.title}
      ).toArray().then(t=>t.reduce((result, current) => {
        if(!result[current.storedAt]){
          result[current.storedAt] = [];
        }
        result[current.storedAt].push(current);
        return result;
      }, {}));
      let res:any[] = [];
      Object.keys(all).map((item:string)=>{
        const t = all[item].sort((a:any,b:any)=>{
          return b.exScore - a.exScore
        });
        res.push(t[0]);
      });
      return res.reverse();
    }catch(e){
      console.log(e);
      return [];
    }
  }

}

export const songsDB = class extends storageWrapper{
  songs: Dexie.Table<any, any>;

  constructor(){
    super();
    this.songs = this.table("songs");
  }

  async getAll(isSingle:number = 1,willCollection:boolean = false):Promise<any>{
    const data = isSingle === 1 ?
      this.songs.where("dpLevel").equals("0") :
      this.songs.where("dpLevel").notEqual("0");
    return willCollection ? data : await data.toArray();
  }

  async getAllTwelvesLength(isSingle:number = 1):Promise<number>{
    const data = isSingle === 1 ?
      await this.songs.where("dpLevel").equals("0").toArray() :
      await this.songs.where("dpLevel").notEqual("0").toArray();
    let matched = 0;
    for(let i = 0; i < data.length; ++i){
      if(data[i]["difficultyLevel"] === "12"){
        matched++;
      }
    }
    return matched;
  }

  async getAllFavoritedItems(isSingle:number = 1):Promise<any[]>{
    const data = await this.getAll(isSingle,true);
    return data.and((item:songData)=>item.isFavorited === true).toArray();
  }

  async deleteAll():Promise<void>{
    return await this.songs.clear();
  }

  getItem(title:string):Promise<string[]>{
    return this.songs.where({title:title}).toArray();
  }

  async getOneItemIsSingle(title:string,difficulty:string):Promise<songData[]>{
    const diffs = ():string=>{
      switch(difficulty){
        case "hyper":return "3";
        case "another":return "4";
        case "leggendaria":return "10";
        default:
        return difficulty;
      }
    };
    return await this.songs.where("[title+difficulty]").equals([title,diffs()]).toArray();
  }

  async resetItems(storedAt:string):Promise<number>{
    return await this.songs.where({storedAt:storedAt}).delete();
  }

  async setItem(item:any):Promise<any>{
    return await this.songs.put({
      title:item["title"],
      difficulty:item["difficulty"],
      wr:Number(item["wr"]),
      avg:Number(item["avg"]),
      notes:Number(item["notes"]),
      bpm:item["bpm"],
      textage:item["textage"],
      difficultyLevel:item["difficultyLevel"],
      dpLevel:item["dpLevel"],
      isFavorited:item["isFavorited"],
      isCreated: item["isCreated"],
      updatedAt: item["updatedAt"],
    })
  }

  async toggleFavorite(title:string,difficulty:string,newState:boolean):Promise<any>{
    return await this.songs.where({title:title,difficulty:difficulty}).modify({
      isFavorited:newState
    });
  }

  async removeItem(title:string):Promise<number>{
    return await this.songs.where({title:title}).delete();
  }

}

export default storageWrapper;
