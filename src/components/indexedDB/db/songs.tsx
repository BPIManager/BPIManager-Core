import timeFormatter from "@/components/common/timeFormatter";
import { _isSingle } from "@/components/settings";
import { difficultyDiscriminator } from "@/components/songs/filter";
import { songData } from "@/types/data";
import storageWrapper from "./wrapper";

export default class db extends storageWrapper {
  getDBInfo = async () => {
    const db = await this.open();
    return db;
  };

  constructor() {
    super();
    this.songs = this.table("songs");
  }

  async getAll(isSingle: number = 1, willCollection: boolean = false): Promise<any> {
    try {
      const data = isSingle === 1 ? this.songs.where("dpLevel").equals("0") : this.songs.where("dpLevel").notEqual("0");
      return willCollection ? data : await data.toArray();
    } catch (e: any) {
      return [];
    }
  }

  async getSongsNum(level = "12") {
    try {
      return this.getAll(_isSingle()).then((result) => {
        const m = result.filter((item: songData) => {
          if (_isSingle()) {
            return item.difficultyLevel === level && item.wr !== -1 && !item.removed && item.dpLevel === "0";
          } else {
            return item.difficultyLevel === level && item.wr !== -1 && !item.removed && item.dpLevel !== "0";
          }
        });
        return m.length;
      });
    } catch (e: any) {
      return 1;
    }
  }

  async getAllWithAllPlayModes(): Promise<any> {
    try {
      return await this.songs.toCollection().toArray();
    } catch (e: any) {
      return [];
    }
  }

  async deleteAll(): Promise<void> {
    return await this.songs.clear();
  }

  async getItem(title: string): Promise<any[]> {
    try {
      return await this.songs.where({ title: title }).toArray();
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async getOneItemIsSingle(title: string, difficulty: string, forcePlayMode: number = -1): Promise<songData[]> {
    const diffs = (): string => {
      const s = forcePlayMode !== -1 ? forcePlayMode : _isSingle();
      switch (difficulty) {
        case "hyper":
          return s ? "3" : "8";
        case "another":
          return s ? "4" : "9";
        case "leggendaria":
          return s ? "10" : "11";
        default:
          return difficulty;
      }
    };
    try {
      return await this.songs.where("[title+difficulty]").equals([title, diffs()]).toArray();
    } catch (e: any) {
      return [];
    }
  }

  //統合済み
  async getOneItemIsDouble(title: string, difficulty: string): Promise<songData[]> {
    return this.getOneItemIsSingle(title, difficulty);
  }

  async updateMemo(song: songData, newMemo: string): Promise<boolean> {
    try {
      await this.songs
        .where({
          title: song.title,
          difficulty: song.difficulty,
        })
        .modify({
          memo: newMemo,
        });
      return true;
    } catch (e: any) {
      return false;
    }
  }

  async setItem(item: any): Promise<any> {
    try {
      return await this.songs.put({
        title: item["title"],
        difficulty: item["difficulty"],
        wr: Number(item["wr"]),
        avg: Number(item["avg"]),
        notes: Number(item["notes"]),
        bpm: item["bpm"],
        textage: item["textage"],
        difficultyLevel: item["difficultyLevel"],
        dpLevel: item["dpLevel"],
        coef: item["coef"] ? this.validateCoef(Number(item["coef"])) : -1,
        updatedAt: item["updatedAt"] || timeFormatter(0),
      });
    } catch (e: any) {
      console.error(e);
      return 1;
    }
  }

  validateCoef = (coef = -1): number => {
    return coef;
  };

  async updateItem(item: any): Promise<any> {
    try {
      return await this.songs
        .where({
          title: item["title"],
          difficulty: item["difficulty"],
        })
        .modify({
          notes: Number(item["notes"]),
          wr: Number(item["wr"]),
          avg: Number(item["avg"]),
          difficulty: item["difficulty"],
          difficultyLevel: item["difficultyLevel"],
          coef: Number(this.validateCoef(item["coef"] || -1)),
          updatedAt: timeFormatter(0),
        });
    } catch (e: any) {
      console.error(e);
      return 1;
    }
  }

  async diffChange(title: string, difficulty: string, newDifficultyLevel: string): Promise<any> {
    try {
      await this.songs.where("[title+difficulty]").equals([title, difficulty]).modify({
        difficultyLevel: newDifficultyLevel,
      });
      const difficultyStr = difficultyDiscriminator(difficulty);
      const s = _isSingle();
      // Compound Index 検討
      await this.rivals.where({ title: title, difficulty: difficultyStr, isSingle: s }).modify({
        difficultyLevel: newDifficultyLevel,
      });
      await this.scoreHistory.where({ title: title, difficulty: difficultyStr, isSingle: s }).modify({
        difficultyLevel: newDifficultyLevel,
      });
      await this.scores.where({ title: title, difficulty: difficultyStr, isSingle: s }).modify({
        difficultyLevel: newDifficultyLevel,
      });
      return 0;
    } catch (e: any) {
      console.error(e);
      return 1;
    }
  }

  async removeItemByDifficulty(title: string, diff: string): Promise<number> {
    return await this.songs.where({ title: title, difficultyLevel: diff }).delete();
  }

  async _removeItemByDifficulty(title: string, diff: string): Promise<number> {
    return await this.songs.where({ title: title, difficulty: diff }).delete();
  }

  async removeItem(title: string): Promise<number> {
    try {
      return await this.songs.where({ title: title }).delete();
    } catch (e: any) {
      console.error(e);
      return 1;
    }
  }

  async bulkAdd(obj: any[]): Promise<any> {
    return await this.transaction("rw", this.songs, async () => {
      return Promise.all(obj.map((item: any) => this.setItem(item)));
    }).catch((e) => {
      console.log(e);
      return null;
    });
  }
}
