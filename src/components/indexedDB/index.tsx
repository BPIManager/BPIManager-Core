import Dexie from "dexie";
import {scoreData,songData} from "../../types/data";

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
      scoreHistory : "title,difficulty,storedAt,exScore,BPI,updatedAt"
    });
    this.scores = this.table("scores");
    this.songs = this.table("songs");
    this.stores = this.table("stores");
  }

}

export const scoresDB = class extends storageWrapper{
  scores: Dexie.Table<any, any>;

  constructor(){
    super();
    this.scores = this.table("scores");
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

  async removeItem(title:string,storedAt:string):Promise<number>{
    return await this.scores.where({title:title,storedAt:storedAt}).delete();
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
      await this.songs.where("dpLevel").equals("0") :
      await this.songs.where("dpLevel").notEqual("0");
    return willCollection ? data : data.toArray();
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
