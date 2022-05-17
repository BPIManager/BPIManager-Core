import { B } from "@/components/bpi";
import timeFormatter from "@/components/common/timeFormatter";
import { _currentStore, _isSingle } from "@/components/settings";
import { _pText } from "@/components/settings/updateDef";
import { difficultyDiscriminator, difficultyParser, _prefixFromNum } from "@/components/songs/filter";
import { scoreData } from "@/types/data";
import storageWrapper from "./wrapper";

export default class db extends storageWrapper {
  storedAt: string = "";
  isSingle: number = 1;
  currentData: scoreData[] = [];

  constructor(isSingle: number = 1, storedAt?: string) {
    super();
    this.scores = this.table("scores");
    this.isSingle = isSingle;
    if (storedAt) {
      this.storedAt = storedAt;
    } else {
      this.storedAt = _currentStore();
    }
  }

  setIsSingle(isSingle: number): this {
    this.isSingle = isSingle;
    return this;
  }

  setStoredAt(storedAt: string): this {
    this.storedAt = storedAt;
    return this;
  }

  async getAll(): Promise<scoreData[]> {
    try {
      const currentData = await this.scores
        .where({
          storedAt: _currentStore(),
          isSingle: _isSingle(),
        })
        .toArray();
      return currentData;
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async getAllVersions(): Promise<scoreData[]> {
    try {
      const currentData = await this.scores
        .where({
          isSingle: _isSingle(),
        })
        .toArray();
      return currentData;
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async loadStore(): Promise<this> {
    try {
      this.currentData = await this.scores
        .where({
          storedAt: this.storedAt,
          isSingle: _isSingle(),
        })
        .toArray();
      return this;
    } catch (e: any) {
      console.error(e);
      return this;
    }
  }

  async getSpecificVersionAll(): Promise<scoreData[]> {
    try {
      const currentData = await this.scores
        .where({
          storedAt: this.storedAt,
          isSingle: this.isSingle,
        })
        .toArray();
      return currentData;
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async deleteAll(): Promise<void> {
    return await this.scores.clear();
  }

  getItem(title: string, difficulty: string, storedAt: string, isSingle: number): Promise<scoreData[]> {
    return this.scores.where("[title+difficulty+storedAt+isSingle]").equals([title, difficulty, storedAt, isSingle]).toArray();
  }

  //for statistics
  async getItemsBySongDifficulty(diff: string = "12"): Promise<scoreData[]> {
    try {
      if (!this.currentData) {
        await this.loadStore();
      }
      return this.currentData.filter((item) => item.difficultyLevel === diff);
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async getItemsBySongDifficultyWithSpecificVersion(diff: string = "12", store: string): Promise<any> {
    try {
      return await this.scores
        .where({
          storedAt: store,
          isSingle: _isSingle(),
        })
        .toArray()
        .then((t) =>
          t
            .filter((item) => item.difficultyLevel === diff)
            .reduce((group: any, item) => {
              group[item.title + item.difficulty] = item.currentBPI;
              return group;
            }, {})
        );
    } catch (e: any) {
      console.error(e);
      return [];
    }
  }

  async resetItems(storedAt: string): Promise<number> {
    return await this.scores.where({ storedAt: storedAt }).delete();
  }

  async removeNaNItems(): Promise<number> {
    return await this.scores.where({ storedAt: _currentStore(), currentBPI: NaN }).delete();
  }

  async setItem(item: any): Promise<any> {
    try {
      return await this.scores
        .where("[title+difficulty+storedAt+isSingle]")
        .equals([item["title"], item["difficulty"], this.storedAt, this.isSingle])
        .modify({
          title: item["title"],
          difficulty: item["difficulty"],
          difficultyLevel: item["difficultyLevel"],
          currentBPI: item["currentBPI"],
          exScore: Number(item["exScore"]),
          missCount: Number(item["missCount"]),
          clearState: item["clearState"],
          lastScore: item["lastScore"],
          storedAt: item["storedAt"],
          isSingle: item["isSingle"],
          updatedAt: item["updatedAt"],
        });
    } catch (e: any) {
      console.error(e);
      return;
    }
  }

  putItem(item: any): any {
    try {
      return this.scores.put({
        title: item["title"],
        difficulty: item["difficulty"],
        difficultyLevel: item["difficultyLevel"],
        currentBPI: item["currentBPI"],
        exScore: Number(item["exScore"]),
        missCount: Number(item["missCount"]),
        clearState: item["clearState"],
        lastScore: item["lastScore"],
        storedAt: item["storedAt"],
        isSingle: item["isSingle"],
        updatedAt: item["updatedAt"],
      });
    } catch (e: any) {
      console.error(e);
    }
  }

  async updateScore(
    score: scoreData | null,
    data: {
      currentBPI?: number;
      exScore?: number;
      clearState?: number;
      missCount?: number;
    }
  ): Promise<boolean> {
    try {
      if (!score) {
        return false;
      }
      if (score.updatedAt === "-") {
        //put
        let newScoreData: scoreData = score;
        newScoreData.currentBPI = data.currentBPI || -15;
        newScoreData.exScore = data.exScore || 0;
        newScoreData.updatedAt = timeFormatter(0);
        await this.scores.add(newScoreData);
      } else {
        //update
        if (Number.isNaN(data.currentBPI)) delete data.currentBPI;
        if (Number.isNaN(data.exScore)) delete data.exScore;
        if (data.clearState === -1 || data.clearState === score.clearState) delete data.clearState;
        if (data.missCount === -1 || data.missCount === score.missCount) delete data.missCount;

        const newData = Object.assign(data, {
          updatedAt: timeFormatter(0),
          lastScore: score.exScore,
        });

        await this.scores.where("[title+difficulty+storedAt+isSingle]").equals([score.title, score.difficulty, score.storedAt, score.isSingle]).modify(newData);
      }
      return true;
    } catch (e: any) {
      console.error(e);
      return false;
    }
  }

  async removeItem(title: string, storedAt: string): Promise<number> {
    return await this.scores.where({ title: title, storedAt: storedAt }).delete();
  }

  async removeSpecificItemAtAllStores(title: string, diff?: string): Promise<number> {
    if (diff) {
      return await this.scores.where({ title: title, difficulty: difficultyDiscriminator(diff) }).delete();
    }
    return await this.scores.where({ title: title }).delete();
  }

  getSpecificSong = (songTitle: string) => this.scores.where("title").equals(songTitle).toArray();

  _getSpecificSong = async (songTitle: string, diff: string, isSingle: number) => (await this.scores.where({ title: songTitle, isSingle: isSingle }).toArray()).filter((item) => item.difficulty === diff);

  modifyBPI = (t: scoreData, currentBPI: B) =>
    this.scores
      .where("[title+difficulty+storedAt+isSingle]")
      .equals([t.title, t.difficulty, t.storedAt, t.isSingle])
      .modify({ currentBPI: !currentBPI.error ? currentBPI.bpi : -15 });

  async recalculateBPI(updatedSongs: string[] = [], force: boolean = false, ref: React.MutableRefObject<any> | null = null) {
    try {
      const self = this;
      this.setCalcClass();
      const array = await this.scores.where("title").notEqual("").toArray();
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
        _pText(ref, "Scores:BPI更新中 " + t["title"] + _prefixFromNum(t["difficulty"]));
        this.modifyBPI(t, bpi);
      }
    } catch (e: any) {
      console.log(e);
    }
    _pText(ref, "");
  }

  //置き換え予定
  async setDataWithTransaction(scores: scoreData[], ref: React.MutableRefObject<any> | null = null) {
    await this.transaction("rw", this.scores, async () => {
      await this.scores.where({ storedAt: _currentStore(), isSingle: _isSingle() }).delete();
      return Promise.all(
        scores.map((item) => {
          _pText(ref, "Saving : " + item["title"]);
          this.putItem(item);
          return 0;
        })
      );
    }).catch((e) => {
      console.log(e);
    });
    return null;
  }
}
