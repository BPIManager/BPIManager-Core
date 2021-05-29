import { songsDB } from "../indexedDB";
import { _isSingle } from "../settings";
import { songData } from "@/types/data";
export interface OCRExSore {error:boolean,ex:number,reason?:string,details?:{pg:number,gr:number}}

export class CameraClass{
  private songTitles:string[];
  private songs:string[][];
  private split:RegExp = /.{5}/g;
  private maxLen:number = 0;
  private sDB = new songsDB();

  constructor(){
    this.songs = [];
    this.songTitles = [];
  }

  setSplitLetters(regex:RegExp){
    this.split = regex;
    return this;
  }

  reset(){
    this.suggestions = [];
    return this;
  }

  async loadSongs(){
    const db = this.sDB;
    const songs = await db.getAll(_isSingle());
    this.songTitles = songs.map((item:songData)=>{
      return item["title"];
    });
    return this;
  }

  init(){
    for(let i = 0; i < this.songTitles.length; ++i){
      const song = this.songTitles[i];
      let p = [];
      if(song && song){
        const splitted = song.match(this.split);
        if(!splitted){
          p = [song];
          this.songs.push(p);
        }else{
          p = [song,...splitted];
          this.songs.push(p);
        }
      }
      if(p.length > this.maxLen){
        this.maxLen = p.length;
      }
    }

    return this;
  }

  getMaxLen(){
    return this.maxLen;
  }

  private alternatives:{[key:string]:string[]} = {
    "R∞tage":["Rootage"],
    "mosaic":["Mosaic","Auridy"],
    "Ganymede":["Ganu"],
    "Go Beyond!!":["GO Beyond","G0 Beyond"],
    "狂イ咲ケ焔ノ華":["狂イ咲ケ","ノPrim"],
    "ワルツ第17番 ト短調”大犬のワルツ”":["ワルツ第","犬のワルツ","大大のワルツ"],
    "GuNGNiR":["GUNGNIR","2081 NOTES"],
    "BLACK.by X-Cross Fade":["BLACK by","XCross"],
    "魔法のかくれんぼ":["かくれん"],
    "火影":["焱影"]
  }

  private suggestions:string[] = [];
  private text:string = "";

  setText(text:string){
    this.text = text;
    return this;
  }

  findSong(){

    const swifts = this.swiftDiffcultTitles(); //優先完全一致検索
    if(swifts.length > 0){
      this.suggestions = swifts;
      return swifts;
    }

    const res = this.exec(); //ざっくり探索
    this.suggestions = res.res;
    this.swipeOneCharacterTitles(); //1~2文字楽曲の選別
    if(res.perfect){ //もう完全一致楽曲が見つかっているなら終了
      return this.suggestions;
    }

    return this.suggestions;
  }

  withoutJapanese(){
    this.split = /A-Za-z0-9/g;
    this.init();
    this.exec();
  }

  swiftDiffcultTitles(){
    //難読漢字など、OCRでの読み取りが難しい楽曲については、他の情報を参照して直接楽曲指定する
    //alternativesのほうは単一条件、こちらは複数条件を指定
    const indexOf = this.indexOf;
    if(indexOf("弁士") > -1 || indexOf("カンタ") > -1) return ["音楽"];
    if(indexOf("v2") > -1) return ["V2"];
    if(indexOf("1.0.1") > -1) return ["CODE:1 [revision1.0.1]"];
    if(indexOf("Flve Hammer") > -1 || indexOf("Five Hammer") > -1) return ["fffff"];
    if(indexOf("Amuro vs Killer") > -1) return ["冥"]; //アーティスト
    if(indexOf("SOUND HOLIC feat. Nana Takahashi Vs.GOD PHOENIX Prim") > -1) return ["神謳 -RESONANCE-"]; //アーティスト
    if(indexOf("ALBA") > -1 && indexOf("SOUND HOLIC") > -1) return ["ALBA -黎明-"]; //曲名 OR アーティスト
    if((indexOf("朱雀") > -1 && indexOf("玄武") > -1 ) || indexOf("VS 玄") > -1) return ["卑弥呼"]; //アーティスト
    if(indexOf("レイディオ") > -1 || indexOf("夏色ビキニのPrim") > -1) return ["†渚の小悪魔ラヴリィ～レイディオ†(IIDX EDIT)"]; //曲名（部分） OR アーティスト
    if(indexOf("Long Train") > -1) return ["灼熱 Pt.2 Long Train Running"]; //曲名（部分）
    if(indexOf("ダンジョン") > -1 && indexOf("771") > -1) return ["リリーゼと炎龍レーヴァテイン"]; //アーティスト名 & ノート数（部分）
    if(indexOf("Liketit") > -1) return ["Like+it!"];
    if(indexOf("lapix") > -1 && indexOf("1877") > -1) return ["〆"];
    if(indexOf("おいわちゃん") > -1) return ["ディッシュウォッシャー◎彡おいわちゃん"];
    if(indexOf("きの") > -1 && indexOf("2000")) return ["嘆きの樹"];
    if(indexOf("Master vs") > -1 || indexOf("Master ve") > -1) return ["刃図羅"];
    if(indexOf("mund") > -1 && indexOf("Gram") > -1) return ["Sigmund"];
    return [];
  }

  levenshtein(currentDiff:string):any[]{
    const minimumText = this.text.slice(this.text.length / 3 * -1).replace(/SLOW.[\s\S]*?\\n$/g,"");
    let distances:any[] = [];
    for(let i = 0;i < this.songs.length; ++i){
      const song = this.songs[i];
      let maxDistance = 0;
      for(let j = 0; j < song.length; ++j){
        const latest = this.wordDistance(minimumText,song[j]);
        if(latest > maxDistance){
          maxDistance = latest;
        }
      }
      distances.push([song[0],maxDistance]);
    }
    distances = distances.sort((a:any,b:any)=>b[1] - a[1]).reduce((groups:any,item:any)=>{
      if(!groups) groups = [];
      if(groups.find((s:any)=>item[0] === s.title)){ return groups;};
      groups.push({
        title:item[0],
        difficulty:currentDiff,
        distance:item[1]
      });
      return groups;
    },[]);
    return distances;
  }

  exec():{perfect:boolean,res:string[]}{
    let res:string[] = [];
    let perfect:boolean = false;
    const add = (title:string,isPush:boolean = true)=>{
      if(res.indexOf(title) === -1){
        if(isPush){
          res.push(title);
        }else{
          res.unshift(title);
        }
      }
    }

    for(let i = 0;i < this.maxLen; ++i){ //最大で最長配列ぶん繰り返す
      for(let j = 0;j < this.songs.length; ++j){ //それぞれの楽曲名配列ごとに施行

        const songArr = this.songs[j];
        if(!songArr[i]){
          continue;
        }
        if(this.text.indexOf(songArr[i]) > -1){ //suggest
          const title = songArr[0];

          if(title === "Broken" && this.text.indexOf("Broken Sword") > -1){
            //Broken Swordが完全一致する場合は優先
            perfect = true;
            add("Broken Sword",false);
            break;
          }
            if(title === "Timepiece phase II" && this.text.indexOf("CN Ver") > -1){
            //CN Verが完全一致する場合は優先
            perfect = true;
            add("Timepiece phase II (CN Ver.)",false);
            break;
          }
            if(title === "Garuda" && this.text.indexOf("Megalara") > -1){
            //Megalara Garudaが完全一致する場合は優先
            perfect = true;
            add("Megalara Garuda",false);
            break;
          }

          if(i === 0){//完全一致

            if(["A","AA","D","V","F","X"].indexOf(title) === -1){
              perfect = true;
              add(title,false);
              break;//施行中止
            }else{ // A,AA,D,V,Fのうちいずれかの楽曲の場合
              if(this.checkSingleTitles(title)){
                add(title,false);
                if(["A","AA","D","V","X","F"].indexOf(title) === -1) break;//施行中止
                if(title === "D" && this.text.indexOf("1705") === -1) break;
                if(title === "X" && this.text.indexOf("1952") > -1) break;
                if(title === "A" && this.text.indexOf("1260") > -1) break;
                if(title === "AA" && this.text.indexOf("1834") > -1) break;
                if(title === "F" && this.text.indexOf("1813") > -1) break;
              }
            }
          }
          add(title); //原文タイトル
        }else{
          const alter = this.alternatives[songArr[i]]
          if(alter){ //代替文字列が存在する場合
            for(let m = 0; m < alter.length; ++m){
              if(this.text.indexOf(alter[m]) > -1) add(songArr[0],false);
            }
          }
        }
      }
    }
    return {perfect:perfect,res:res};
  }

  private indexOf = (text:string)=> this.text.indexOf(text);

  swipeOneCharacterTitles(){
    const indexOf = this.indexOf;
    this.suggestions = this.suggestions.filter(item=>{
      if(["AA","A","X","F"].indexOf(item) > -1){
        return indexOf("D.J.") > -1 || indexOf("Amuro") > -1;
      }
      if(item === "V"){
        return indexOf("TAKA") > -1;
      }
      if(item === "D"){
        return indexOf("Eagle") > -1;
      }
      if(item === "IX"){
        return indexOf("dj TAKA") > -1;
      }
      return true;
    });
    return this;
  }

  checkSingleTitles(current:string){
    const indexOf = this.indexOf;
    if(["AA","A","X"].indexOf(current) > -1){
      return indexOf("D.J.") > -1 || indexOf("Amuro") > -1;
    }
    if(current === "V"){
      return indexOf("TAKA") > -1;
    }
    if(current === "D"){
      return indexOf("Eagle") > -1;
    }
  }

  findDifficulty(){
    if(this.text.indexOf("ANOTH") > -1){
      return "ANOTHER";
    }
    if(this.text.indexOf("HYPER") > -1){
      return "HYPER";
    }
    return "LEGGENDARIA";
  }

  getExScore():OCRExSore{

    // JUDGE ~ GOOD部分を読み取り、最初の数字*2(PGREAT) + 次の数字 *1(GREAT) = EX SCOREで計算
    // GREAT,GOOD,BAD,POOR
    let neccessaryText = this.text.match(/GREAT((\n|.)*?)GOOD/g);
    if(neccessaryText && neccessaryText.length > 0){
      let e = neccessaryText[0];
      e = e.replace("GOOD","").replace(/[ |　]/g,"").replace(/[o|O]/g,"0").replace(/[l|i|I]/g,"1").replace(/LH/g,"4").replace(/E6/g,"6").replace(/S/g,"5").replace(/EB/g,"8");
      const numbers = e.match(/\d+/g);
      if(numbers){
        let pg = Number(numbers[0]), gr = Number(numbers[1]);
        pg = Number.isNaN(pg) ? 0 : pg;
        gr = Number.isNaN(gr) ? 0 : gr;
        return {error:false,ex:pg * 2 + gr * 1,details:{pg:pg,gr:gr}};
      }else{
        return {error:true,ex:0,reason:"EXスコアを読み取れませんでした"};
      }
    }
    return {error:true,ex:0,reason:"不明なエラーです"};
  }

  private snake =(k:number, y:number, str1:string, str2:string)=>{
    let x = y - k;
    while (x < str1.length && y < str2.length && str1.charCodeAt(x) === str2.charCodeAt(y)) {
      x++;
      y++;
    }
    return y;
  }

  private editDistanceONP =(str1:string, str2:string)=>{
    let s1, s2;
    if (str1.length < str2.length) {
      s1 = str1;
      s2 = str2;
    } else {
      s1 = str2;
      s2 = str1;
    }
    let kk, k, p,
    v0, v1,
    len1 = s1.length,
    len2 = s2.length,
    delta = len2 - len1,
    offset = len1 + 1,
    dd = delta + offset,
    dc = dd - 1,
    de = dd + 1,
    max =len1 + len2 + 3,
    fp = [];

    for (p=0; p<max; p++) {
      fp.push(-1);
    }
    for (p=0; fp[dd]!==len2; p++) {
      for (k=-p; k<delta; k++) {
        kk = k + offset;
        v0 = fp[kk-1] + 1;
        v1 = fp[kk+1];
        fp[kk] = this.snake(k, (v0 > v1 ? v0: v1), s1, s2);
      }
      for (k=delta+p; k>delta; k--) {
        kk = k + offset;
        v0 = fp[kk-1] + 1;
        v1 = fp[kk+1];
        fp[kk] = this.snake(k, (v0 > v1 ? v0: v1), s1, s2);
      }
      v0 = fp[dc] + 1;
      v1 = fp[de];
      fp[dd] = this.snake(delta, (v0 > v1 ? v0: v1), s1, s2);
    }
    return delta + (p - 1) * 2;
  }

  wordDistance =(str1:string, str2:string):number=>{
    let m = Math.max(str1.length, str2.length);
    let d = this.editDistanceONP(str1, str2);
    return 1 - (d / m);
  }

}
