import {songsDB} from "../indexedDB";
import { songData } from "../../types/data";
import { _traditionalMode,_isSingle } from "../settings";

export interface B{
  error:boolean,bpi:number,reason?:string,difficultyLevel?:string
}

export default class bpiCalcuator{
  private songsDB = new songsDB();
  private isSingle: number;
  private totalKaidens: number;
  private propData:songData[]|null = null;

  private m:number = 1;
  private s:number = 0;
  private k:number = 0;
  private z:number = 0;
  private traditionalMode = _traditionalMode();
  private powCoef:number = this.traditionalMode === 1 ? 1.5 : 1.175;
  private pgf = (j:number):number=> j === this.m ? this.m * 0.8 : 1 + ( j / this.m - 0.5 ) / ( 1 - j / this.m );

  private _allTwelvesLength:number = 0;
  private _allTwelvesBPI:number[] = [];

  constructor(){
    this.isSingle = _isSingle();
    this.totalKaidens = this.isSingle ? 2645 : 612;
  }

  setTraditionalMode(s:number){
    this.traditionalMode = s;
    this.powCoef = this.traditionalMode === 1 ? 1.5 : 1.175;
    return;
  }

  setCoef(coef:number = 1.175){
    if(this.traditionalMode === 1){
      this.powCoef = 1.5;
      return;
    }
    if(coef !== -1) this.powCoef = coef;
    return;
  }

  getTotalKaidens(){
    return this.totalKaidens;
  }

  setPropData(data:songData,exScore:number,isSingle:number):number{
    try{
      this.isSingle = isSingle;
      this.s = exScore;
      this.k = data["avg"];
      this.z = data["wr"];
      this.m = data["notes"] * 2;
      (data["coef"] && data["coef"] > 0 && data["difficultyLevel"] === "12" && data["dpLevel"] === "0") && this.setCoef(data["coef"]);
      return this.exec();
    }catch(e){
      return -15;
    }
  }

  setManual(wr:number,avg:number,notes:number,ex:number,coef:number):number{
    try{
      this.s = ex;
      this.k = avg;
      this.z = wr;
      this.m = notes * 2;
      this.powCoef = coef;
      return this.exec();
    }catch(e){
      return -15;
    }
  }

  setIsSingle(isSingle:number = 1){
    this.isSingle = isSingle;
    return this;
  }

  async calc(songTitle:string,difficulty:string,exScore:number):Promise<B>{
    try{
      this.propData = await this.songsDB.getOneItemIsSingle(songTitle,difficulty);
      if(!this.propData || !this.propData[0]){
        throw new Error("未対応楽曲です");
      }
      this.s = exScore;
      this.k = this.propData[0]["avg"];
      this.z = this.propData[0]["wr"];
      this.m = this.propData[0]["notes"] * 2;
      if(this.propData[0]["coef"] && this.propData[0]["coef"] > 0 && this.propData[0]["difficultyLevel"] === "12"
      && this.propData[0]["dpLevel"] === "0"){
        this.setCoef(this.propData[0]["coef"]);
      }else{
        this.setCoef();
      }
      return {error:false,bpi:this.exec(),difficultyLevel:this.propData[0]["difficultyLevel"]};

    }catch(e){
      return {error:true,bpi:NaN,reason:e.message || e};
    }
  }

  exec(){
    const {k,z,s} = this;
    if( s > this.m ){
      throw new Error("理論値を超えています");
    }
    if( s < 0 ){
      throw new Error("スコアは自然数で入力してください");
    }
    const _s = this.pgf(s),_k = this.pgf(k),_z = this.pgf(z);
    const _s_ = _s / _k, _z_ = _z / _k;
    const p = s >= k;
    return Math.max(-15,Math.round((p ? 100 : -100 ) * ( Math.pow( (p ? Math.log(_s_) : -Math.log(_s_)) / Math.log(_z_),this.powCoef) ) * 100) / 100);
  }

  setData(max:number,avg:number,wr:number):void{
    this.m = max;
    this.k = avg;
    this.z = wr;
  }

  calcFromBPI(bpi:number,ceiled:boolean = false):number{
    const k = this.pgf(this.k);
    const N = Math.pow(Math.E,Math.pow(Math.pow(Math.log(this.pgf(this.z) / k),this.powCoef)  * bpi / 100, 1 / this.powCoef)) * k;
    const res = this.m * ( ( N - 0.5 ) / N );
    return ceiled ? Math.ceil(res) : res;
  }

  rank(bpi:number,s:boolean = true):number{
    const p = s ? 100 : 95;
    return Math.ceil(Math.pow(this.totalKaidens, (p - bpi ) / p ));
  }

  set allTwelvesLength(val: number){ this._allTwelvesLength = val }
  set allTwelvesBPI(val: number[]){ this._allTwelvesBPI = val }

  totalBPI():number{
    const playedSongs = this._allTwelvesBPI.length;
    if(playedSongs === 0) return -15;
    let sum = 0,k = Math.log2(this._allTwelvesLength);

    for (let i=0; i < this._allTwelvesLength; ++i){
      if(i < playedSongs){
        const bpi = this._allTwelvesBPI[i],m = Math.pow( Math.abs(bpi) , k ) / this._allTwelvesLength;
        sum += bpi > 0 ? m : -m;
      }
    }
    const res = Math.round(Math.pow(Math.abs(sum), 1 / k) * 100) / 100;

    return sum > 0 ? res : -res;
  }

  setSongs(s:any,sum:number = NaN):number{
    this.allTwelvesBPI = s;
    this.allTwelvesLength = !Number.isNaN(sum) ? sum : s.length;
    return this.totalBPI();
  }
}
