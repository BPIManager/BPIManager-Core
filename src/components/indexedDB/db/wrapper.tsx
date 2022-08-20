import bpiCalculator from "@/components/bpi";
import { alternativeImg } from "@/components/common";
import timeFormatter from "@/components/common/timeFormatter";
import { DBRivalStoreData, historyData, rivalScoreData, scoreData, songData } from "@/types/data";
import Dexie from "dexie";

const storageWrapper = class extends Dexie {
  target: string = "scores";
  //あとで書いとく
  protected scores: Dexie.Table<scoreData, string | number | (string | number)[]>;
  protected songs: Dexie.Table<songData, number>;
  protected scoreHistory: Dexie.Table<historyData, number>;
  protected rivals: Dexie.Table<rivalScoreData, string | number | (string | number)[]>;
  protected rivalLists: Dexie.Table<DBRivalStoreData, string>;
  protected favLists: Dexie.Table<any, string>;
  protected favSongs: Dexie.Table<any, string>;
  protected calculator: bpiCalculator | null = null;

  constructor() {
    super("ScoreCoach");
    this.close();
    this.version(1).stores({
      scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,Pgreat,great,missCount,clearState,lastPlayed,storedAt,isSingle,isImported,updatedAt,lastScore",
      songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
      stores: "&name,updatedAt",
      scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
    });
    this.version(2).stores({
      scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,Pgreat,great,missCount,clearState,lastPlayed,storedAt,isSingle,isImported,updatedAt,lastScore",
      songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,coef,[title+difficulty]",
      scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
    });
    this.version(3)
      .stores({
        scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,missCount,clearState,lastPlayed,storedAt,isSingle,isImported,updatedAt,lastScore",
        songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
        rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
        rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile",
        scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
      })
      .upgrade((_tx) => {
        return this.scores.toCollection().modify((item: any) => {
          delete item.Pgreat;
          delete item.great;
        });
      });
    this.version(4)
      .stores({
        scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,*version,currentBPI,exScore,missCount,clearState,lastPlayed,storedAt,isSingle,updatedAt,lastScore",
        songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
        rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
        rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile",
        scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
      })
      .upgrade((_tx) => {
        return this.scores.toCollection().modify((item: any) => {
          delete item.isImported;
        });
      });
    this.version(5)
      .stores({
        scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,currentBPI,exScore,missCount,clearState,lastPlayed,storedAt,isSingle,updatedAt,lastScore",
        songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
        rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
        rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile",
        scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
      })
      .upgrade((_tx) => {
        return this.scores.toCollection().modify((item: any) => {
          delete item.version;
        });
      });
    this.version(6)
      .stores({
        scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,currentBPI,exScore,missCount,clearState,storedAt,isSingle,updatedAt,lastScore",
        songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,isCreated,isFavorited,[title+difficulty]",
        rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
        rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile",
        scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
      })
      .upgrade((_tx) => {
        return this.scores.toCollection().modify((item: any) => {
          delete item.lastPlayed;
        });
      });
    this.version(8)
      .stores({
        scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,currentBPI,exScore,missCount,clearState,storedAt,isSingle,updatedAt,lastScore",
        songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,[title+difficulty]",
        rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
        rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile",
        scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
        favLists: "&num,title,length,description,updatedAt",
        favSongs: "&[title+difficulty+listedOn],[title+difficulty],listedOn",
      })
      .upgrade(async (_tx) => {
        const songs = (await this.songs.toArray()).filter((item) => item.isFavorited === true);
        this.favLists.add({
          title: "お気に入り",
          description: "デフォルトのリスト",
          length: songs.length,
          num: 0,
          updatedAt: timeFormatter(3),
        });
        for (let i = 0; i < songs.length; ++i) {
          const song = songs[i];
          this.favSongs.add({
            title: song.title,
            difficulty: song.difficulty,
            listedOn: 0,
          });
        }
        this.songs.toCollection().modify((item: any) => {
          delete item.isCreated;
          delete item.isFavorited;
        });
      });
    this.version(9).stores({
      scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,currentBPI,exScore,missCount,clearState,storedAt,isSingle,updatedAt,lastScore",
      songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,memo,[title+difficulty]",
      rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
      rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile",
      scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
      favLists: "&num,title,length,description,updatedAt",
      favSongs: "&[title+difficulty+listedOn],[title+difficulty],listedOn",
    });
    this.version(10)
      .stores({
        scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,currentBPI,exScore,missCount,clearState,storedAt,isSingle,updatedAt,lastScore",
        songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,memo,[title+difficulty]",
        rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
        rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile",
        scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
        favLists: "&num,title,length,description,icon,updatedAt",
        favSongs: "&[title+difficulty+listedOn],[title+difficulty],listedOn",
      })
      .upgrade(async (_tx) => {
        this.favLists.toCollection().modify((item: any) => {
          item.icon = alternativeImg(item.title);
        });
      });
    this.version(11).stores({
      scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,currentBPI,exScore,missCount,clearState,storedAt,isSingle,updatedAt,lastScore",
      songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,memo,[title+difficulty]",
      rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
      rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile,socialId",
      scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
      favLists: "&num,title,length,description,icon,updatedAt",
      favSongs: "&[title+difficulty+listedOn],[title+difficulty],listedOn",
    });
    // dummy update
    this.version(20).stores({
      scores: "[title+difficulty+storedAt+isSingle],title,*difficulty,*difficultyLevel,currentBPI,exScore,missCount,clearState,storedAt,isSingle,updatedAt,lastScore",
      songs: "&++num,title,*difficulty,*difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,memo,[title+difficulty]",
      rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,*difficulty,*difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
      rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile,socialId",
      scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
      favLists: "&num,title,length,description,icon,updatedAt",
      favSongs: "&[title+difficulty+listedOn],[title+difficulty],listedOn",
    });
    this.version(22).stores({
      scores: "[title+difficulty+storedAt+isSingle],title,difficulty,difficultyLevel,currentBPI,exScore,missCount,clearState,storedAt,isSingle,updatedAt,lastScore",
      songs: "&++num,title,difficulty,difficultyLevel,wr,avg,notes,bpm,textage,dpLevel,memo,[title+difficulty]",
      rivals: "&[title+difficulty+storedAt+isSingle+rivalName],rivalName,title,difficulty,difficultyLevel,exScore,missCount,clearState,storedAt,isSingle,updatedAt",
      rivalLists: "&uid,rivalName,lastUpdatedAt,updatedAt,[isSingle+storedAt],photoURL,profile,socialId",
      scoreHistory: "&++num,[title+storedAt+difficulty+isSingle],[title+storedAt+difficulty+isSingle+updatedAt],title,difficulty,difficultyLevel,storedAt,exScore,BPI,isSingle,updatedAt",
      favLists: "&num,title,length,description,icon,updatedAt",
      favSongs: "&[title+difficulty+listedOn],[title+difficulty],listedOn",
    });
    this.scores = this.table("scores");
    this.scoreHistory = this.table("scoreHistory");
    this.songs = this.table("songs");
    this.rivals = this.table("rivals");
    this.rivalLists = this.table("rivalLists");
    this.favLists = this.table("favLists");
    this.favSongs = this.table("favSongs");
    this.open();
  }

  protected newSongs: { [key: string]: songData } = {};

  setNewSongsDBRawData(reduced: { [key: string]: songData }): this {
    this.newSongs = reduced;
    return this;
  }

  protected setCalcClass() {
    this.calculator = new bpiCalculator();
    return this;
  }

  protected apply(t: songData, s: number, i: number = 1): number {
    if (!this.calculator) {
      return 0;
    }
    return this.calculator.setPropData(t, s, i);
  }
};

export default storageWrapper;
