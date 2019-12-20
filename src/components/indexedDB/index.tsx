import Dexie from "dexie";
import {scoreData,songData} from "../../types/data";
import timeFormatter from "../common/timeFormatter";
import {_currentStore,_isSingle} from "../settings";
import moment from "moment";
import {difficultyDiscriminator, difficultyParser} from "../songs/filter";
import bpiCalcuator from "../bpi";

const storageWrapper = class extends Dexie{
  target: string = "scores";
  //あとで書いとく
  scores:Dexie.Table<any, any>;
  songs:Dexie.Table<any, any>;
  stores: Dexie.Table<any, any>;
  protected rivals:Dexie.Table<any, any>;
  protected rivalLists: Dexie.Table<any, any>;
  protected calculator:bpiCalcuator|null = null;

  constructor(){
    super("ScoreCoach");
    this.version(1).stores({
      scores : "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,Pgreat,great,missCount,clearState,lastPlayed,storedAt,isSingle,isImported,updatedAt,lastScore",
      songs : "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
      stores : "&name,updatedAt",
      scoreHistory : "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt"
    });
    this.version(2).stores({
      scores : "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,Pgreat,great,missCount,clearState,lastPlayed,storedAt,isSingle,isImported,updatedAt,lastScore",
      songs : "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,coef,[title+difficulty]",
      scoreHistory : "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt"
    });
    this.version(3).stores({
      scores : "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,missCount,clearState,lastPlayed,storedAt,isSingle,isImported,updatedAt,lastScore",
      songs : "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
      rivals : "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
      rivalLists : "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile",
      scoreHistory : "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt"
    }).upgrade(_tx => {
      return this.scores.toCollection().modify((item:any)=>{
        delete item.Pgreat;
        delete item.great;
      });
    });
    this.scores = this.table("scores");
    this.songs = this.table("songs");
    this.stores = this.table("stores");
    this.rivals = this.table("rivals");
    this.rivalLists = this.table("rivalLists");
  }

  protected newSongs:{[key:string]:songData} = {};

  setNewSongsDBRawData(reduced:{[key:string]:songData}):this{
    this.newSongs = reduced;
    return this;
  }

  protected setCalcClass(){
    this.calculator = new bpiCalcuator();
    return this;
  }

  protected apply(t:songData,s:number,i:number = 1):number{
    if(!this.calculator){
      return 0;
    }
    return this.calculator.setPropData(t,s,i);
  }

}

export const scoresDB = class extends storageWrapper{
  scores: Dexie.Table<any, any>;
  storedAt:string = "";
  isSingle:number = 1;
  currentData:scoreData[] = [];

  constructor(isSingle:number = 1,storedAt?:string){
    super();
    this.scores = this.table("scores");
    this.isSingle = isSingle;
    if(storedAt) this.storedAt = storedAt;
  }

  setIsSingle(isSingle:number):this{
    this.isSingle = isSingle;
    return this;
  }

  setStoredAt(storedAt:string):this{
    this.storedAt = storedAt;
    return this;
  }

  async getAll():Promise<scoreData[]>{
    try{
      const currentData = await this.scores.where({
        storedAt:_currentStore(),
        isSingle:_isSingle(),
      }).toArray();
      return currentData;
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async getAllVersions():Promise<scoreData[]>{
    try{
      const currentData = await this.scores.where({
        isSingle:_isSingle(),
      }).toArray();
      return currentData;
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async loadStore():Promise<this>{
    try{
      this.currentData = await this.scores.where({
        storedAt:_currentStore(),
        isSingle:_isSingle(),
      }).toArray();
      return this;
    }catch(e){
      console.error(e);
      return this;
    }
  }

  async getSpecificVersionAll():Promise<scoreData[]>{
    try{
      const currentData = await this.scores.where({
        storedAt:this.storedAt,
        isSingle:this.isSingle,
      }).toArray();
      return currentData;
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async deleteAll():Promise<void>{
    return await this.scores.clear();
  }

  getItem(title:string,difficulty:string,storedAt:string,isSingle:number):Promise<scoreData[]>{
    return this.scores.where("[title+difficulty+storedAt+isSingle]").equals([title,difficulty,storedAt,isSingle]).toArray();
  }

  //for statistics
  async getItemsBySongDifficulty(diff:string = "12"):Promise<scoreData[]>{
    try{
      if(!this.currentData){await this.loadStore();}
      return this.currentData.filter(item=>item.difficultyLevel === diff);
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async getItemsBySongDifficultyWithSpecificVersion(diff:string = "12",store:string):Promise<any>{
    try{
      return await this.scores.where({
        storedAt:store,
        isSingle:_isSingle(),
      }).toArray().then(t=>t.filter(item=>item.difficultyLevel === diff).reduce((group,item)=>{
        group[item.title + item.difficulty] = item.currentBPI;
        return group;
      },{}));
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async resetItems(storedAt:string):Promise<number>{
    return await this.scores.where({storedAt:storedAt}).delete();
  }

  async resetImportedItems():Promise<number>{
    return await this.scores.where({isImported:"true"}).delete();
  }

  async setItem(item:any):Promise<any>{
    try{
      return await this.scores.where("[title+difficulty+storedAt+isSingle]").equals(
        [item["title"],item["difficulty"],this.storedAt,this.isSingle]
      ).modify({
        title:item["title"],
        version:item["version"],
        difficulty:item["difficulty"],
        difficultyLevel:item["difficultyLevel"],
        currentBPI:item["currentBPI"],
        exScore:Number(item["exScore"]),
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
      console.error(e);
      return;
    }
  }

  putItem(item:any):any{
    try{
      return this.scores.put({
        title:item["title"],
        version:item["version"],
        difficulty:item["difficulty"],
        difficultyLevel:item["difficultyLevel"],
        currentBPI:item["currentBPI"],
        exScore:Number(item["exScore"]),
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
      console.error(e);
    }
  }

  async updateScore(score:scoreData|null,data:{currentBPI:number,exScore:number,clearState:number,missCount:number}):Promise<boolean>{
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
        if(Number.isNaN(data.currentBPI)) delete data.currentBPI;
        if(Number.isNaN(data.exScore)) delete data.exScore;
        if(data.clearState === -1 || data.clearState === score.clearState) delete data.clearState;
        if(data.missCount === -1 || data.missCount === score.missCount) delete data.missCount;
        await this.scores.where("[title+difficulty+storedAt+isSingle]").equals([score.title,score.difficulty,score.storedAt,score.isSingle]).modify(
        Object.assign(data,{
          updatedAt : timeFormatter(0),
          lastScore: score.exScore,
        })
        );
      }
      return true;
    }catch(e){
      console.error(e);
      return false;
    }
  }

  async removeItem(title:string,storedAt:string):Promise<number>{
    return await this.scores.where({title:title,storedAt:storedAt}).delete();
  }

  async removeSpecificItemAtAllStores(title:string):Promise<number>{
    return await this.scores.where({title:title}).delete();
  }

  async recalculateBPI(){
    try{
      const self = this;
      this.setCalcClass();
      const array = await this.scores.where("title").notEqual("").toArray();
      //modify使って書き直したい
      for(let i =0; i < array.length; ++i){
        const t = array[i];
        if(!self.calculator){return;}
        const bpi = await self.calculator.setIsSingle(t.isSingle).calc(t.title,difficultyParser(t.difficulty,t.isSingle),t.exScore);
        this.scores.where("[title+difficulty+storedAt+isSingle]").equals([t.title,t.difficulty,t.storedAt,t.isSingle]).modify(
          {currentBPI:!bpi.error ? bpi.bpi : -15}
        );
      }
    }catch(e){
      console.log(e);
    }
  }

  async setDataWithTransaction(scores:scoreData[]){
    await this.transaction("rw",this.scores,async()=>{
      await this.scores.where({storedAt:_currentStore(),isSingle:_isSingle()}).delete();
      return Promise.all(scores.map(item=>this.putItem(item)));
    }).catch(e=>{
      console.log(e)
    });
    return null;
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
        updatedAt: forceUpdateTime ? score.updatedAt : timeFormatter(3),
        isSingle:score.isSingle,
      });
      return true;
    }catch(e){
      console.error(e);
      return false;
    }
  }

  async check(item:scoreData):Promise<{willUpdate:boolean,lastScore:number}>{
    try{
      const t = await this.scoreHistory.where("[title+storedAt+difficulty+isSingle]").equals(
        [item["title"],item["storedAt"],item["difficulty"],item["isSingle"]]
      ).toArray().then((t)=>t.sort((a,b)=>moment(b.updatedAt).diff(moment(a.updatedAt))));
      return {
        willUpdate:t.length === 0 ? true : Number(item.exScore) > Number(t[t.length - 1].exScore),
        lastScore:t.length === 0 ? -1 : t[t.length-1].exScore
      };
    }catch(e){
      return {
        willUpdate:false,
        lastScore:0,
      };
    }
  }

  async getAll(diff:string = "12"):Promise<any[]>{
    try{
      return await this.scoreHistory.where(
        {storedAt:this.currentStore,isSingle:this.isSingle,difficultyLevel:diff}
      ).toArray();
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async getAllInSpecificVersion():Promise<any[]>{
    try{
      return await this.scoreHistory.where(
        {storedAt:this.currentStore,isSingle:this.isSingle}
      ).toArray();
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async reset(storedAt?:string):Promise<any>{
    try{
      return await this.scoreHistory.where(
        {storedAt:storedAt ? storedAt : this.currentStore,isSingle:this.isSingle}
      ).delete();
    }catch(e){
      console.error(e);
      return 0;
    }
  }

  async getWithinVersion(song:songData):Promise<any[]>{
    try{
      if(!song){return [];}
      return await this.scoreHistory.where(
        {storedAt:this.currentStore,isSingle:this.isSingle,title:song.title,difficulty:difficultyDiscriminator(song.difficulty)}
      ).toArray().then(t=>t.sort((a,b)=>{
        return moment(b.updatedAt).diff(moment(a.updatedAt))
      }));
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async getAcrossVersion(song:songData):Promise<any[]>{
    try{
      if(!song){return [];}
      const all = await this.scoreHistory.where(
        {isSingle:this.isSingle,title:song.title,difficulty:difficultyDiscriminator(song.difficulty)}
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
        return 0;
      });
      return res.reverse();
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async recalculateBPI(){
    try{
      const self = this;
      this.setCalcClass();
      const array = await this.scoreHistory.where("title").notEqual("").toArray();
      //modify使って書き直したい
      for(let i =0; i < array.length; ++i){
        const t = array[i];
        if(!self.calculator){return;}
        const bpi = await self.calculator.setIsSingle(t.isSingle).calc(t.title,difficultyParser(t.difficulty,t.isSingle),t.exScore);
        this.scoreHistory.where("num").equals(t.num).modify(
          {BPI:!bpi.error ? bpi.bpi : -15}
        );
      }
    }catch(e){
      console.log(e);
      console.log("failed recalculate [scoreHistoryDB] - ");
      return;
    }
  }

  async setDataWithTransaction(history:any[]){
    await this.transaction("rw",this.scoreHistory,async()=>{
      await this.scoreHistory.where({storedAt:_currentStore(),isSingle:_isSingle()}).delete();
      this.scoreHistory.bulkPut(history);
    }).catch(e=>{
      console.log(e)
    });
    return;
  }

}

export const songsDB = class extends storageWrapper{
  songs: Dexie.Table<any, any>;

  constructor(){
    super();
    this.songs = this.table("songs");
  }

  async getAll(isSingle:number = 1,willCollection:boolean = false):Promise<any>{
    try{
      const data = isSingle === 1 ?
        this.songs.where("dpLevel").equals("0") :
        this.songs.where("dpLevel").notEqual("0");
      return willCollection ? data : await data.toArray();
    }catch(e){
      return [];
    }
  }

  async getAllWithAllPlayModes():Promise<any>{
    try{
      return await this.songs.toCollection().toArray();
    }catch(e){
      return [];
    }
  }

  async getAllTwelvesLength(isSingle:number = 1):Promise<number>{
    try{
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
    }catch(e){
      console.error(e);
      return 0;
    }
  }

  async getAllFavoritedItems(isSingle:number = 1):Promise<any[]>{
    try{
      return await this.getAll(isSingle,true).then(t=>t.and((item:songData)=>item.isFavorited === true).toArray());
    }catch(e){
      console.error(e);
      return [];
    }
  }

  async deleteAll():Promise<void>{
    return await this.songs.clear();
  }

  async getItem(title:string):Promise<any[]>{
    try{
      return await this.songs.where({title:title}).toArray();
    }catch(e){
      console.error(e);
      return [];
    }
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
    try{
      return await this.songs.where("[title+difficulty]").equals([title,diffs()]).toArray();
    }catch(e){
      return [];
    }
  }

  async getOneItemIsDouble(title:string,difficulty:string):Promise<songData[]>{
    const diffs = ():string=>{
      switch(difficulty){
        case "hyper":return "8";
        case "another":return "9";
        case "leggendaria":return "11";
        default:
        return difficulty;
      }
    };
    try{
      return await this.songs.where("[title+difficulty]").equals([title,diffs()]).toArray();
    }catch(e){
      return [];
    }
  }

  async setItem(item:any):Promise<any>{
    try{
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
        isFavorited:item["isFavorited"] || false,
        isCreated: item["isCreated"] || false,
        coef:Number(this.validateCoef(item["coef"] || -1)),
        updatedAt: item["updatedAt"] || timeFormatter(0),
      })
    }catch(e){
      console.error(e);
      return 1;
    }
  }

  validateCoef = (coef = -1):number=>{
    if(coef < 0.8 && coef !== -1){
      return 0.88;
    }
    return coef;
  }

  async updateItem(item:any):Promise<any>{
    try{
      return await this.songs.where({
        "title":item["title"],"difficulty":item["difficulty"]
      }).modify({
        notes:Number(item["notes"]),
        wr:Number(item["wr"]),
        avg:Number(item["avg"]),
        coef:Number(this.validateCoef(item["coef"] || -1)),
        updatedAt: timeFormatter(0),
      })
    }catch(e){
      console.error(e);
      return 1;
    }
  }

  async toggleFavorite(title:string,difficulty:string,newState:boolean):Promise<any>{
    try{
      return await this.songs.where({title:title,difficulty:difficulty}).modify({
        isFavorited:newState
      });
    }catch(e){
      console.error(e);
      return 1;
    }
  }

  async removeItem(title:string):Promise<number>{
    try{
      return await this.songs.where({title:title}).delete();
    }catch(e){
      console.error(e);
      return 1;
    }
  }

}

export const rivalListsDB = class extends storageWrapper{

  constructor(){
    super();
  }

  async getAll():Promise<any>{
    try{
      return this.rivalLists.where("[isSingle+storedAt]").equals([_isSingle(),_currentStore()]).toArray();
    }catch(e){
      return [];
    }
  }

  async getAllScores(rivalName:string):Promise<any>{
    try{
      return this.rivals.where({rivalName:rivalName,isSingle:_isSingle(),storedAt:_currentStore()}).toArray();
    }catch(e){
      return [];
    }
  }

  async addUser(meta:any,body:any[]):Promise<any>{
    return await this.transaction('rw', this.rivals, this.rivalLists , async () => {
      this.rivalLists.put(meta);
      return Promise.all(body.map(item => this.rivals.put({
          rivalName:meta.uid,
          title:item.title,
          difficulty:item.difficulty,
          difficultyLevel:item.difficultyLevel,
          exScore:item.exScore,
          missCount:item.missCount,
          clearState:item.clearState,
          storedAt:item.storedAt,
          isSingle:item.isSingle,
          updatedAt:item.updatedAt
        })));
    }).catch((e)=>{
      console.log(e);
      return null;
    });
  }

  async removeUser(meta:any):Promise<any>{
    return await this.transaction('rw', this.rivals, this.rivalLists , async () => {
      this.rivalLists.delete(meta.uid);
      return Promise.all((await (this.rivals.where("rivalName").equals(meta.uid).toArray())).map(item => this.rivals.delete([
          item.title,
          item.difficulty,
          item.storedAt,
          item.isSingle,
          item.rivalName
        ])));
    }).catch((e)=>{
      console.log(e);
      return null;
    });
  }

}

export default storageWrapper;
