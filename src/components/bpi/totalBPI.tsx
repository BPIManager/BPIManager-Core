import { _currentStore } from "../settings";
import bpiCalcuator from ".";
import statMain from "../stats/main";

export default class totalBPI{
  private bpiCalc:bpiCalcuator = new bpiCalcuator();
  private targetLevel:number = 12;
  private statMain:statMain = new statMain(12);

  private _currentVersion:number[] = [];
  private _lastVersion:number[] = [];

  constructor(targetLevel:number = 12){
    this.targetLevel = targetLevel;
    this.statMain = new statMain(this.targetLevel);
  }

  async load(includeLastVersion:boolean = false){
    this._currentVersion = (await this.statMain.load()).at();

    if(includeLastVersion){
      this.statMain.setLastData(String(Number(_currentStore()) - 1))
      this._lastVersion = this.statMain.at(true);
    }

    return this;

  }

  currentVersion(){
    return this.bpiCalc.setSongs(this._currentVersion,this._currentVersion.length) || -15;
  }

  lastVersion(){
    return this.bpiCalc.setSongs(this._lastVersion,this._lastVersion.length) || -15;
  }


}
