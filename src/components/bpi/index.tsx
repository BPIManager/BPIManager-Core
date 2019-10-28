import {songsDB} from "../indexedDB";

export default class bpiCalcuator{
  songsDB:any;
  isSingle: boolean;

  constructor(){
    this.isSingle = true;
    this.songsDB = new songsDB();
  }

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
      const m:number = songData[0]["notes"] * 2;

      if( s > m ){
        throw new Error("理論値を超えています");
      }

      const pgf = (j:number)=> 1 + ( j / m - 0.5 ) / ( 1 - j / m );
      const _s = pgf(s);
      const _k = pgf(k);
      const _z = pgf(z);

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




}
