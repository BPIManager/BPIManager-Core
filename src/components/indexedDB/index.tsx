import Dexie from "dexie";

const storageWrapper = class extends Dexie{
  target: string = "scores";
  //あとで書いとく
  scores:Dexie.Table<any, any>;
  songs:Dexie.Table<any, any>;
  stores: Dexie.Table<any, any>;

  constructor(){
    super("ScoreCoach");
    this.version(1).stores({
      scores : "title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,Pgreat,great,missCount,clearState,DJLevel,lastPlayed,storedAt,isImported,updatedAt",
      songs : "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
      stores : "&name,updatedAt"
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

  // Load all pinned-items
  async getAll():Promise<string[]>{
    const currentData = await this.scores.toArray();
    return currentData;
  }

  async deleteAll():Promise<void>{
    return await this.scores.clear();
  }

  getItem(title:string):Promise<string[]>{
    return this.scores.where({title:title}).toArray();
  }

  async resetItems(storedAt:string):Promise<number>{
    return await this.scores.where({storedAt:storedAt}).delete();
  }

  async resetImportedItems():Promise<number>{
    return await this.scores.where({isImported:"true"}).delete();
  }

  async setItem(item:any,isImported = true):Promise<any>{
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
      isImported:isImported,
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

  // Load all pinned-items
  async getAll():Promise<string[]>{
    const currentData = await this.songs.toArray();
    return currentData;
  }

  async deleteAll():Promise<void>{
    return await this.songs.clear();
  }

  getItem(title:string):Promise<string[]>{
    return this.songs.where({title:title}).toArray();
  }

  getOneItemIsSingle(title:string,difficulty:string):Promise<string[]>{
    const diffs = ():string=>{
      switch(difficulty){
        case "hyper":return "3";
        default:
        case "another":return "4";
        case "leggendaria":return "10";
      }
    };
    return this.songs.where("[title+difficulty]").equals([title,diffs()]).toArray();
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

  async removeItem(title:string):Promise<number>{
    return await this.songs.where({title:title}).delete();
  }

}

export default storageWrapper;
