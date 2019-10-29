import {songsDB} from "../indexedDB";

export default class bpiCalcuator{
  songsDB:any;
  isSingle: boolean;

  constructor(){
    this.isSingle = true;
    this.songsDB = new songsDB();
  }

  private m:number = 1;
  private pgf = (j:number):number=> 1 + ( j / this.m - 0.5 ) / ( 1 - j / this.m );

  async calc(songTitle:string,difficulty:string,exScore:number):Promise<{error:boolean,bpi:number,reason?:any,difficultyLevel?:number}>{
    try{
      const songData = this.isSingle ?
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
      return {error:true,bpi:Math.round(res * 100) / 100,difficultyLevel:songData[0]["difficultyLevel"]};

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


}
