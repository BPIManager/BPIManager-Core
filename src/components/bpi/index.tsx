import {songsDB} from "../indexedDB";

export interface B{
  error:boolean,bpi:number,reason?:any,difficultyLevel?:number
}

export default class bpiCalcuator{
  songsDB:any;
  isSingle: number;

  constructor(){
    this.isSingle = 1;
    this.songsDB = new songsDB();
  }

  private m:number = 1;
  private pgf = (j:number):number=> 1 + ( j / this.m - 0.5 ) / ( 1 - j / this.m );

  async calc(songTitle:string,difficulty:string,exScore:number):Promise<B>{
    try{
      const songData = this.isSingle === 1 ?
        await this.songsDB.getOneItemIsSingle(songTitle,difficulty) :
        await this.songsDB.getOneItemIsDouble(songTitle,difficulty);

      if(!songData[0]){
        throw new Error("楽曲情報が見つかりませんでした");
      }
      let res:number = NaN;
      const s:number = exScore;
      const k:number = songData[0]["avg"];
      const z:number = songData[0]["wr"];
      this.m = songData[0]["notes"] * 2;

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
      if(res < -15){
        return {error:false,bpi:-15,difficultyLevel:songData[0]["difficultyLevel"]};
      }
      return {error:false,bpi:Math.round(res * 100) / 100,difficultyLevel:songData[0]["difficultyLevel"]};

    }catch(e){
      return {error:true,bpi:NaN,reason:e.message || e};
    }
  }

  //使いまわし可能データ
  private avg:number = 0;
  private wr:number = 0;

  setData(max:number,avg:number,wr:number):void{
    this.m = max;
    this.avg = avg;
    this.wr = wr;
  }

  calcFromBPI(bpi:number):number{
    const z = this.pgf(this.wr);
    const k = this.pgf(this.avg);

    const i = Math.pow(Math.pow(Math.log(z / k),1.5)  * bpi / 100, 1 / 1.5);

    const N = Math.pow(Math.E,i) * k;

    return this.m * ( ( N - 0.5 ) / N );
  }

  rank(bpi:number):number{
    return Math.ceil(Math.pow(2616, (100 - bpi ) / 100 ));
  }

  _allTwelvesLength:number = 0;
  _allTwelvesBPI:number[] = [];

  set allTwelvesLength(val: number){ this._allTwelvesLength = val }
  set allTwelvesBPI(val: number[]){ this._allTwelvesBPI = val }

  totalBPI():number{
    let sum = 0,playedSongs = this._allTwelvesBPI.length;
    if(playedSongs === 0){return -15;}
    const k = Math.log2(this._allTwelvesLength);
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
    return Math.round(Math.pow(sum, 1 / k) * 100) / 100;
  }
}
