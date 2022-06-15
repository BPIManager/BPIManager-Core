import { _currentStore } from "../settings";
import bpiCalcuator from ".";
import statMain from "../stats/main";

export default class totalBPI {
  private bpiCalc: bpiCalcuator = new bpiCalcuator();
  private targetLevel: number = 12;
  private statMain: statMain = new statMain(12);

  private _currentVersion: number[] = [];
  private _lastVersion: number[] = [];

  constructor(targetLevel: number = 12) {
    this.targetLevel = targetLevel;
    this.statMain = new statMain(this.targetLevel);
  }

  async load(includeLastVersion: boolean = false) {
    this._currentVersion = (await this.statMain.load()).at();

    if (includeLastVersion) {
      await this.statMain.setLastData(String(Number(_currentStore()) - 1));
      this._lastVersion = this.statMain.at(true);
    }

    return this;
  }

  async currentVersion() {
    return (await this.bpiCalc.setSongs(this._currentVersion, String(this.targetLevel) as "11" | "12")) || -15;
  }

  async lastVersion() {
    return (await this.bpiCalc.setSongs(this._lastVersion, String(this.targetLevel) as "11" | "12")) || -15;
  }

  async specificData(data: any) {
    return (
      (await this.bpiCalc.setSongs(
        data.map((item: any) => item.currentBPI).filter((item: any) => !isNaN(item) && item !== Infinity),
        String(this.targetLevel) as "11" | "12"
      )) || -15
    );
  }
}
