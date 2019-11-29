import {songsDB} from "../indexedDB";
import { songData } from "../../types/data";
import { _isSingle } from "../settings";

export interface B{
  error:boolean,bpi:number,reason?:any,difficultyLevel?:string
}

export default class bpiCalcuator{
  songsDB:any = new songsDB();
  isSingle: number;
  totalKaidens: number;
  propData:songData[]|null = null;

  constructor(){
    this.isSingle = _isSingle();
    this.totalKaidens = this.isSingle ? 2645 : 612;
  }

  setPropData(data:songData,exScore:number,isSingle:number):number{
    this.isSingle = isSingle;
    this.s = exScore;
    this.k = data["avg"];
    this.z = data["wr"];
    this.m = data["notes"] * 2;
    return this.exec();
  }

  setIsSingle(isSingle:number = 1){
    this.isSingle = isSingle;
    return this;
  }

  private m:number = 1;
  private s:number = 0;
  private k:number = 0;
  private z:number = 0;
  private pgf = (j:number):number=> j === this.m ? this.m : 1 + ( j / this.m - 0.5 ) / ( 1 - j / this.m );

  async calc(songTitle:string,difficulty:string,exScore:number):Promise<B>{
    try{
      this.propData = this.isSingle === 1 ?
      await this.songsDB.getOneItemIsSingle(songTitle,difficulty) :
      await this.songsDB.getOneItemIsDouble(songTitle,difficulty);
      if(!this.propData || !this.propData[0]){
        throw new Error("楽曲情報が見つかりませんでした");
      }
      this.s = exScore;
      this.k = this.propData[0]["avg"];
      this.z = this.propData[0]["wr"];
      this.m = this.propData[0]["notes"] * 2;
      return {error:false,bpi:this.exec(),difficultyLevel:this.propData[0]["difficultyLevel"]};

    }catch(e){
      return {error:true,bpi:NaN,reason:e.message || e};
    }
  }

  exec(){
    let res:number = NaN;
    const {k,z,s} = this;
    if( s > this.m ){
      throw new Error("理論値を超えています");
    }
    if( s < 0){
      throw new Error("スコアは自然数で入力してください");
    }
    const _s = this.pgf(s);
    const _k = this.pgf(k);
    const _z = this.pgf(z);

    const _s_ = _s / _k;
    const _z_ = _z / _k;
    if(s >= k){
      res = 100 * ( Math.pow(Math.log(_s_),1.5) / Math.pow(Math.log(_z_),1.5) );
    }else{
      res = -100 * ( Math.pow(-Math.log(_s_),1.5) / Math.pow(Math.log(_z_),1.5) );
    }
    return res < -15 ? -15 : Math.round(res * 100) / 100;
  }

  //使いまわし可能データ
  private avg:number = 0;
  private wr:number = 0;

  setData(max:number,avg:number,wr:number):void{
    this.m = max;
    this.avg = avg;
    this.wr = wr;
  }

  calcFromBPI(bpi:number,ceiled:boolean = false):number{
    const z = this.pgf(this.wr),k = this.pgf(this.avg);

    const i = Math.pow(Math.pow(Math.log(z / k),1.5)  * bpi / 100, 1 / 1.5);

    const N = Math.pow(Math.E,i) * k;
    const res = this.m * ( ( N - 0.5 ) / N );
    return ceiled ? Math.ceil(res) : res;
  }

  // when s(isSingleSong) = false : total rank
  rank(bpi:number,s:boolean = true):number{
    const p = s ? 100 : 95;
    return Math.ceil(Math.pow(this.totalKaidens, (p - bpi ) / p ));
  }

  _allTwelvesLength:number = 0;
  _allTwelvesBPI:number[] = [];

  set allTwelvesLength(val: number){ this._allTwelvesLength = val }
  set allTwelvesBPI(val: number[]){ this._allTwelvesBPI = val }

  totalBPI():number{
    let sum = 0,playedSongs = this._allTwelvesBPI.length;
    if(playedSongs === 0){return -15;}
    let k = Math.log2(this._allTwelvesLength);
    for (let i=0; i < this._allTwelvesLength; ++i){
      if(i < playedSongs){
        const bpi = this._allTwelvesBPI[i]
        if(bpi > 0){
          sum += Math.pow( bpi, k ) / this._allTwelvesLength
        }else{
          sum += -Math.pow( Math.abs(bpi), k ) / this._allTwelvesLength
        }
      }
    }
    const res = Math.round(Math.pow(Math.abs(sum), 1 / k) * 100) / 100;
    return sum > 0 ? res : -res;
  }
}
