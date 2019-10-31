import Dexie from "dexie";
import {scoreData,songData} from "../../types/data";
import timeFormatter from "../common/timeFormatter";

const storageWrapper = class extends Dexie{
  target: string = "scores";
  //あとで書いとく
  scores:Dexie.Table<any, any>;
  songs:Dexie.Table<any, any>;
  stores: Dexie.Table<any, any>;

  constructor(){
    super("ScoreCoach");
    this.version(1).stores({
      scores : "title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,Pgreat,great,missCount,clearState,DJLevel,lastPlayed,storedAt,isSingle,isImported,updatedAt,[title+difficulty+storedAt+isSingle]",
      songs : "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
      stores : "&name,updatedAt",
      scoreHistory : "&[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt"
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
    const currentData = await this.scores.toArray();
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
    data = data.filter(item=>item.difficultyLevel === diff);
    return data.map((item:scoreData)=>item.currentBPI);
  }

  async resetItems(storedAt:string):Promise<number>{
    return await this.scores.where({storedAt:storedAt}).delete();
  }

  async resetImportedItems():Promise<number>{
    return await this.scores.where({isImported:"true"}).delete();
  }

  async setItem(item:any):Promise<any>{
    return await this.scores.put({
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
      DJLevel:item["DJLevel"],
      lastPlayed:item["lastPlayed"],
      storedAt:item["storedAt"],
      isSingle:item["isSingle"],
      isImported:true,
      updatedAt : item["updatedAt"]
    })
  }

  async updateScore(score:scoreData|null,data:{currentBPI:number,exScore:number}):Promise<boolean>{
    try{
      if(!score){return false;}
      score.updatedAt = timeFormatter(0);
      if(score.updatedAt === "-"){
        //put
        let newScoreData:scoreData = score;
        newScoreData.currentBPI = data.currentBPI;
        newScoreData.exScore = data.exScore;
        await this.scores.add(newScoreData);
      }else{
        //update
        await this.scores.where("[title+difficulty+storedAt+isSingle]").equals([score.title,score.difficulty,score.storedAt,score.isSingle]).modify(data);
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

  constructor(){
    super();
    this.scoreHistory = this.table("scoreHistory");
  }

  async add(score:scoreData|null,data:{currentBPI:number,exScore:number},forceUpdateTime:boolean = false):Promise<boolean>{
    try{
      if(!score){return false;}
      await this.scoreHistory.add({
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

  async getAll(isSingle:number,storedAt:string,diff:string = "12"):Promise<any[]>{
    try{
      return await this.scoreHistory.where(
        {storedAt:storedAt,isSingle:isSingle,difficultyLevel:diff}
      ).toArray();
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
