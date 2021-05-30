import { songsDB } from "../indexedDB";
import { _isSingle } from "../settings";
import { songData } from "@/types/data";
export interface OCRExScore {error:boolean,ex:number,reason?:string,details?:{pg:number,gr:number}}

export class CameraClass{
  private songTitles:string[];
  private songs:string[][];
  private split:RegExp = /.{5}/g;
  private maxLen:number = 0;
  private sDB = new songsDB();

  private originalText = "";
  private perfect:boolean = false;

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
      const original = this.songTitles[i];
      const song = this.songTitles[i].toLowerCase();
      let p = [];
      if(song && song){
        const splitted = song.match(this.split);
        if(!splitted){
          p = [original,song];
          this.songs.push(p);
        }else{
          p = [original,song,...splitted];
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
    "GO OVER WITH GLARE -ROOTAGE 26-":["go over with"],
    "R∞tage":["rootage"],
    "mosaic":["auridy"],
    "Ganymede":["ganu"],
    "Go Beyond!!":["g0 beyond"],
    "狂イ咲ケ焔ノ華":["狂イ咲ケ","ノprim"],
    "ワルツ第17番 ト短調”大犬のワルツ”":["ワルツ第","犬のワルツ","大大のワルツ"],
    "GuNGNiR":["2081 notes"],
    "BLACK.by X-Cross Fade":["black by","xcross"],
    "魔法のかくれんぼ":["かくれん"],
    "火影":["焱影"],
    "Idola":["dola","feat.gumi"],
    "華麗なる大犬円舞曲":["なる大犬"],
    "ディスコルディア":["スコルデ"],
    "千年ノ理":["年ノ"],
  }

  private suggestions:string[] = [];
  private text:string = "";

  setPerfect = (newState:boolean):boolean=>{
    this.perfect = newState;
    return newState;
  }

  setText(text:string){
    //テキストはすべて小文字対小文字で比較
    this.text = text.toLowerCase().replace(/~/g,"～");
    this.originalText = text;
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
    const exists = this.exists;
    if(exists("弁士") || exists("カンタ")) return ["音楽"];
    if(exists("v2")) return ["V2"];
    if(exists("1.0.1")) return ["CODE:1 [revision1.0.1]"];
    if(exists("five hammer")) return ["fffff"];
    if(exists("amuro vs")) return ["冥"]; //アーティスト
    if(exists("sound holic feat. nana takahashi vs.god phoenix prim")) return ["神謳 -RESONANCE-"]; //アーティスト
    if(exists("alba") && exists("sound holic")) return ["ALBA -黎明-"]; //曲名 OR アーティスト
    if((exists("朱雀") && exists("玄武") ) || exists("VS 玄")) return ["卑弥呼"]; //アーティスト
    if(exists("レイディオ") || exists("夏色ビキニのprim")) return ["†渚の小悪魔ラヴリィ～レイディオ†(IIDX EDIT)"]; //曲名（部分） OR アーティスト
    if(exists("long train")) return ["灼熱 Pt.2 Long Train Running"]; //曲名（部分）
    if(exists("side bunny")) return ["灼熱Beach Side Bunny"];
    if(exists("空トラベ")) return ["時空トラベローグ"];
    if(exists("ダンジョン") && exists("771")) return ["リリーゼと炎龍レーヴァテイン"]; //アーティスト名 & ノート数（部分）
    if(exists("liketit")) return ["Like+it!"];
    if(exists("lapix") && exists("1877")) return ["〆"];
    if(exists("おいわちゃん")) return ["ディッシュウォッシャー◎彡おいわちゃん"];
    if(exists("きの") && exists("2000")) return ["嘆きの樹"];
    if(exists("master vs") || exists("master ve")) return ["刃図羅"];
    if(exists("mund") && exists("gram")) return ["Sigmund"];
    if(exists("moon") && exists("child")) return ["moon_child"];
    if(exists("ヒーレン") && (exists("ダン") || exists("ジョン"))) return ["龍と少女とデコヒーレンス"];
    if((exists("蝶") || exists("風") || exists("雪") || exists("白虎")) && exists("1500")) return ["華蝶風雪"];
    if((exists("バッド") || exists("シンド")) && exists("アリス")) return ["バッドエンド・シンドローム"];
    if(exists("team hu") && exists("pect for") && exists("amu")) return ["∀"];
    if(exists("risen relic")) return ["SOLID STATE SQUAD -RISEN RELIC REMIX-"];
    if(exists("murasame") && exists("1943")) return ["仮想空間の旅人たち"];
    if((exists("丹") || exists("1445")) && exists("naga")) return ["紅牡丹"];
    if(exists("電人") && exists("れる")) return ["電人、暁に斃れる。"];
    if(exists("tiation")) return ["Initiation"];
    if(exists("-65") && exists("amuro")) return ["-65℃"];
    if(exists("#the") && exists("noriken")) return ["#The_Relentless"];
    if(exists("dolon") && exists("Eagle")) return ["3!dolon Forc3"];
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
    let perfect:boolean = this.setPerfect(false);
    const exists = this.exists;
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
        if(exists(songArr[i])){ //suggest
          const title = songArr[0];

          if(title === "Holic" && (!exists("880") || !exists("taq") )){
            //Holic完全一致でない場合（サンホリ曲対策）
            continue;
          }

          if(title === "Broken" && exists("broken sword")){
            //Broken Swordが完全一致する場合は優先
            perfect = this.setPerfect(true);
            add("Broken Sword",false);
            break;
          }
          if(title === "Timepiece phase II" && exists("cn ver")){
            //CN Verが完全一致する場合は優先
            perfect = this.setPerfect(true);
            add("Timepiece phase II (CN Ver.)",false);
            break;
          }
          if(title === "Garuda" && exists("megalara")){
            //Megalara Garudaが完全一致する場合は優先
            perfect = this.setPerfect(true);
            add("Megalara Garuda",false);
            break;
          }
          if(title === "STARLiGHT" && exists("dancehall")){
            //STARLIGHT DANCEHALLが完全一致する場合は優先
            perfect = this.setPerfect(true);
            add("STARLIGHT DANCEHALL",false);
            break;
          }
          if(title === "crew" && (exists("screw") && exists("かめりあ"))){
            //SCREW // owo // SCREWが完全一致する場合は優先
            perfect = this.setPerfect(true);
            add("SCREW // owo // SCREW",false);
            break;
          }
          if(title === "xenon" && (exists("xenon ii") || exists("tomoyuki"))){
            //XENON IIが完全一致する場合は優先
            perfect = this.setPerfect(true);
            add("XENON II ～TOMOYUKIの野望～",false);
            break;
          }
          if(title === "Beyond The Earth" && exists("seven")){
            perfect = this.setPerfect(true);
            add("Beyond The Seven",false);
            break;
          }
          if(title === "ABSOLUTE" && exists("remix")){
            perfect = this.setPerfect(true);
            add("ABSOLUTE (kors k Remix)",false);
            break;
          }
          if(title === "AsiaN distractive" && (exists("かめりあ") || exists("virtual"))){
            perfect = this.setPerfect(true);
            add("ASIAN VIRTUAL REALITIES (MELTING TOGETHER IN DAZZLING DARKNESS)",false);
            break;
          }

          if(i < 2){//完全一致

            if(["A","AA","D","V","F","X"].indexOf(title) === -1){
              perfect = this.setPerfect(true);
              add(title,false);
              break;//施行中止
            }else{ // A,AA,D,V,Fのうちいずれかの楽曲の場合
              if(this.checkSingleTitles(title)){
                add(title,false);
                if(["A","AA","D","V","X","F"].indexOf(title) === -1) break;//施行中止
                if(title === "D" && !exists("1705")) break;
                if(title === "X" && exists("1952")) break;
                if(title === "A" && exists("1260")) break;
                if(title === "AA" && exists("1834")) break;
                if(title === "F" && exists("1813")) break;
              }
            }
          }
          add(title); //原文タイトル
        }else{
          const alter = this.alternatives[songArr[i]]
          if(alter){ //代替文字列が存在する場合
            for(let m = 0; m < alter.length; ++m){
              if(exists(alter[m])) add(songArr[0],false);
            }
          }
        }
      }
    }
    return {perfect:perfect,res:res};
  }

  private exists = (text:string,num:number = -1):boolean=> this.text.indexOf(text) > num;

  swipeOneCharacterTitles(){
    const exists = this.exists;
    this.suggestions = this.suggestions.filter(item=>{
      if(["AA","A","X","F"].indexOf(item) > -1){
        return exists("d.j.") || exists("amuro");
      }
      if(item === "V"){
        return exists("taka");
      }
      if(item === "D"){
        return exists("eagle");
      }
      if(item === "IX"){
        return exists("dj taka");
      }
      return true;
    });
    return this;
  }

  checkSingleTitles(current:string){
    const exists = this.exists;
    if(["AA","A","X"].indexOf(current) > -1){
      return exists("d.j.") || exists("amuro");
    }
    if(current === "V"){
      return exists("taka");
    }
    if(current === "D"){
      return exists("eagle");
    }
  }

  findDifficulty(){
    if(this.exists("anoth")){
      return "ANOTHER";
    }
    if(this.exists("hyper")){
      return "HYPER";
    }
    return "LEGGENDARIA";
  }

  async getExScore():Promise<OCRExScore>{
    //曲名完全一致時には高精度スコア計算を利用する
    const t = await this.getExScorev2();
    if(!t.error && t.ex !== 0){
      return t;
    }

    // JUDGE ~ GOOD部分を読み取り、最初の数字*2(PGREAT) + 次の数字 *1(GREAT) = EX SCOREで計算
    // GREAT,GOOD,BAD,POOR
    let neccessaryText = this.originalText.match(/GREAT((\n|.)*?)GOOD/g);
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

  async getExScorev2():Promise<OCRExScore>{
    const error = {error:true,ex:0,reason:"invalid"};
    let neccessaryText = this.originalText.match(/\n(MAX|AAA|AA|A|B|C|D|E|F)(\+|-)(\+|-| |\d|[a-zA-Z])+\n/g); //MAX-等表記部分の抜き出し
    if(!neccessaryText) return error;

    if(neccessaryText.length > 1){
      //A-CLEAR表記がマッチする可能性があるので、数字を含むものに絞る
      neccessaryText = neccessaryText.filter((item:string)=>/\d/.test(item));
    }

    if(!neccessaryText || neccessaryText.length === 0) return error;

    const targetText:string = neccessaryText[0];
    const targetLevelRegExp = targetText.match(/MAX|AAA|AA|A|B|C|D|E|F+/g);
    const targetStr = targetText.indexOf("+") > -1 ? 1 : -1; //プラス表記なら1、マイナス表記ならマイナス1を結果に掛ける
    const n = targetText.replace(/MAX|AAA|AA|A|B|C|D|E|F+/g,"");
    const targetGapRegExp = n.replace(/(\+|-)/g,"").replace(/O|o/g,"0").replace(/t|l|I|T/g,"1").replace(/S/g,"5").replace(/Z/g,"2").match(/[0-9]+/g);

    if(!targetLevelRegExp) return error;
    if(!targetGapRegExp) return error;

    const targetLevel = targetLevelRegExp[0];
    const targetGap = Number(targetGapRegExp[0]);

    const targetEx = await this.getTargetExScore(targetLevel);
    let proveThis = targetEx + targetGap * targetStr;

    const matcher = ()=>this.originalText.indexOf(String(proveThis)) > -1;
    if(!matcher()){ //存在しない場合
      const newStr = targetStr === 1 ? -1 : 1;
      proveThis = targetEx + targetGap * newStr;
      if(!matcher()){ //それでも存在しない場合
        proveThis = targetEx + targetGap * targetStr; //戻す
      }
    }

    if(targetEx === 0) return error;
    return {error:false,ex: proveThis};
  }

  private targetSongTitle:string = "";
  private targetSongDiff:string = "";

  setTargetSong(title:string,diff:string):this{
    this.targetSongTitle = title;
    this.targetSongDiff = diff.toLowerCase();
    return this;
  }

  getTargetExScore = async(targetLevel:string):Promise<number>=>{
    const sdb = new songsDB();
    let count = 0;
    let song = await sdb.getOneItemIsSingle(this.targetSongTitle,this.targetSongDiff);
    if(!song){
      while(count < 3){
        const newDiff = count === 0 ? "hyper" : count === 1 ? "another" : "leggendaria";
        song = await sdb.getOneItemIsSingle(this.targetSongTitle,newDiff);
        if(song && song.length > 0) break;
        count++;
      }
    }
    if(!song || song.length === 0) return 0;
    const percentile = ():number=>{
      const n = song[0].notes * 2;
      switch(targetLevel){
        case "MAX": return n;
        case "AAA": return n * 8 / 9;
        case "AA": return n * 7 / 9;
        case "A": return n * 2/ 3;
        case "B": return n * 5 / 9;
        case "C": return n * 4 / 9;
        case "D": return n / 3
        case "E": return n * 2 / 9;
        case "F": return n / 9;
        default: return 0;
      }
    }
    return Math.ceil(percentile());
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
