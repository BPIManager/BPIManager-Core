import { scoreData } from "@/types/data";
import { scoreHistoryDB, scoresDB } from "..";
import storageWrapper from "./wrapper";

export default class db extends storageWrapper {
  private historyArray: any = [];
  private scoresArray: scoreData[] = [];
  private shDB = new scoreHistoryDB();
  private _sDB = new scoresDB();
  public get sDB() {
    return this._sDB;
  }
  public set sDB(value) {
    this._sDB = value;
  }

  setHistory = (input: any): this => {
    this.historyArray = input;
    return this;
  };

  setScores = (input: any): this => {
    this.scoresArray = input;
    return this;
  };

  async exec(): Promise<any> {
    const len = this.scoresArray.length;
    if (len > 80) {
      for (let i = 0; i < len; ++i) {
        const currentScore = this.scoresArray[i];
        const currentHist = this.scoresArray[i];
        currentScore.willModified
          ? await this.sDB.setItem(currentScore)
          : await this.sDB.putItem(currentScore);
        this.shDB._add(currentHist, true);
      }
      return;
    }

    return await this.transaction(
      "rw",
      this.scores,
      this.scoreHistory,
      async () => {
        this.historyArray.map((item: any) => {
          return this.shDB._add(item, true);
        });
        return Promise.all([
          this.scoresArray.map((item) => {
            return item.willModified
              ? this.sDB.setItem(item)
              : this.sDB.putItem(item);
          }),
        ]);
      }
    ).catch((e) => {
      console.log(e);
      return null;
    });
  }
}
