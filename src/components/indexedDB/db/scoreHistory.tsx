import { B } from "@/components/bpi";
import timeFormatter, { timeCompare } from "@/components/common/timeFormatter";
import { _currentStore, _isSingle } from "@/components/settings";
import { _pText } from "@/components/settings/updateDef";
import { difficultyDiscriminator, difficultyParser, diffsUpperCase, _prefixFromNum } from "@/components/songs/filter";
import { historyData, scoreData, songData } from "@/types/data";
import storageWrapper from "./wrapper";

export default class db extends storageWrapper {
  isSingle: number = 1;
  currentStore: string = "27";

  constructor() {
    super();
    this.isSingle = _isSingle();
    this.currentStore = _currentStore();
  }

  setStore = (store: string) => {
    this.currentStore = store;
    return this;
  };

  //newer method
  _add(score: scoreData | null, forceUpdateTime: boolean = false): boolean {
    try {
      if (!score) {
        return false;
      }
      this.scoreHistory.add({
        title: score.title,
        exScore: score.exScore,
        difficulty: score.difficulty,
        difficultyLevel: score.difficultyLevel,
        storedAt: score.storedAt,
        BPI: score.currentBPI,
        updatedAt: forceUpdateTime ? score.updatedAt : timeFormatter(3),
        isSingle: score.isSingle,
      });
      return true;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  //legacy
  add(score: scoreData | null, data: { currentBPI: number; exScore: number }, forceUpdateTime: boolean = false): boolean {
    try {
      console.warn("scoreHistoryDB.add is deprecated method. Use scoreHistoryDB._add instead.");
      if (!score) {
        return false;
      }
      this.scoreHistory.add({
        title: score.title,
        exScore: data.exScore,
        difficulty: score.difficulty,
        difficultyLevel: score.difficultyLevel,
        storedAt: score.storedAt,
        BPI: data.currentBPI,
        updatedAt: forceUpdateTime ? score.updatedAt : timeFormatter(3),
        isSingle: score.isSingle,
      });
      return true;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  async removeNaNItems(): Promise<number> {
    return await this.scoreHistory.where({ storedAt: _currentStore(), BPI: NaN }).delete();
  }

  async removeSpecificItemAtAllStores(title: string, diff?: string): Promise<number> {
    if (diff) {
      return await this.scores.where({ title: title, difficulty: difficultyDiscriminator(diff) }).delete();
    }
    return await this.scoreHistory.where({ title: title }).delete();
  }

  async check(item: scoreData): Promise<{ willUpdate: boolean; lastScore: number }> {
    try {
      const t = await this.scoreHistory
        .where("[title+storedAt+difficulty+isSingle]")
        .equals([item["title"], item["storedAt"], item["difficulty"], item["isSingle"]])
        .toArray()
        .then((t) => t.sort((a, b) => timeCompare(b.updatedAt, a.updatedAt)));
      return {
        willUpdate: t.length === 0 ? true : Number(item.exScore) > Number(t[t.length - 1].exScore),
        lastScore: t.length === 0 ? -1 : t[t.length - 1].exScore,
      };
    } catch (e: any) {
      return {
        willUpdate: false,
        lastScore: 0,
      };
    }
  }

  async getAll(diff: string = "12"): Promise<historyData[]> {
    try {
      return await this.scoreHistory
        .where({
          storedAt: this.currentStore,
          isSingle: this.isSingle,
          difficultyLevel: diff,
        })
        .toArray();
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async getAllInSpecificVersion(): Promise<any[]> {
    try {
      return await this.scoreHistory.where({ storedAt: this.currentStore, isSingle: this.isSingle }).toArray();
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async reset(storedAt?: string): Promise<any> {
    try {
      return await this.scoreHistory
        .where({
          storedAt: storedAt ? storedAt : this.currentStore,
          isSingle: this.isSingle,
        })
        .delete();
    } catch (e: any) {
      console.error(e);
      return 0;
    }
  }

  async getWithinVersion(song: songData): Promise<any[]> {
    try {
      if (!song) {
        return [];
      }
      return await this.scoreHistory
        .where({
          storedAt: this.currentStore,
          isSingle: this.isSingle,
          title: song.title,
          difficulty: difficultyDiscriminator(song.difficulty),
        })
        .toArray()
        .then((t) =>
          t.sort((a, b) => {
            return timeCompare(b.updatedAt, a.updatedAt);
          })
        );
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async _getWithinVersion(title: string, diff: string): Promise<any[]> {
    try {
      return await this.scoreHistory
        .where({
          storedAt: this.currentStore,
          isSingle: this.isSingle,
          title: title,
          difficulty: diff,
        })
        .toArray()
        .then((t) =>
          t.sort((a, b) => {
            return timeCompare(b.updatedAt, a.updatedAt);
          })
        );
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async getAcrossVersion(song: songData): Promise<any[]> {
    try {
      if (!song) {
        return [];
      }
      const all = await this.scoreHistory
        .where({
          isSingle: this.isSingle,
          title: song.title,
          difficulty: difficultyDiscriminator(song.difficulty),
        })
        .toArray()
        .then((t) =>
          t.reduce((result: { [key: string]: historyData[] }, current) => {
            if (!result[current.storedAt]) {
              result[current.storedAt] = [];
            }
            result[current.storedAt].push(current);
            return result;
          }, {})
        );
      let res: any[] = [];
      Object.keys(all).map((item: string) => {
        const t = all[item].sort((a: any, b: any) => {
          return b.exScore - a.exScore;
        });
        res.push(t[0]);
        return 0;
      });
      return res.reverse();
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async getRekidaiData(title: string, diff: diffsUpperCase): Promise<any> {
    const d = difficultyDiscriminator(diff);
    const m: songData = {
      title: title,
      difficulty: d,
      difficultyLevel: "12",
      wr: -1,
      avg: -1,
      notes: -1,
      bpm: "0",
      textage: "",
      dpLevel: "0",
      updatedAt: "",
    };
    return await this.getAcrossVersion(m);
  }

  getSpecificSong = (songTitle: string) => this.scoreHistory.where("title").equals(songTitle).toArray();
  modifyBPI = (t: historyData, currentBPI: B) =>
    this.scoreHistory
      .where("[title+storedAt+difficulty+isSingle]")
      .equals([t.title, t.storedAt, t.difficulty, t.isSingle])
      .modify({ BPI: !currentBPI.error ? currentBPI.bpi : -15 });

  async recalculateBPI(updatedSongs: string[] = [], force: boolean = false, ref: React.MutableRefObject<any> | null = null) {
    try {
      const self = this;
      this.setCalcClass();
      const array = await this.scoreHistory.where("title").notEqual("").toArray();
      //modify使って書き直したい
      for (let i = 0; i < array.length; ++i) {
        const t = array[i];
        if (!self.calculator) {
          return;
        }
        if (updatedSongs.length === 0 && force === false) {
          continue;
        }
        if (updatedSongs.length > 0 && updatedSongs.indexOf(t["title"] + difficultyParser(t["difficulty"], Number(t["isSingle"])) + t["isSingle"]) === -1) {
          continue;
        }
        const bpi = await self.calculator.setIsSingle(t.isSingle).calc(t.title, difficultyParser(t.difficulty, t.isSingle), t.exScore);
        _pText(ref, "ScoreHistory:BPI更新中 " + t["title"] + _prefixFromNum(t["difficulty"]));
        this.modifyBPI(t, bpi);
      }
    } catch (e: any) {
      console.log(e);
      console.log("failed recalculate [scoreHistoryDB] - ");
      return;
    }
    _pText(ref, "");
  }

  async setDataWithTransaction(history: any[]) {
    await this.transaction("rw", this.scoreHistory, async () => {
      await this.scoreHistory.where({ storedAt: _currentStore(), isSingle: _isSingle() }).delete();
      this.scoreHistory.bulkPut(history);
    }).catch((e) => {
      console.log(e);
    });
    return;
  }
}
