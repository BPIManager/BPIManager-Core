import * as React from 'react';
import { CameraClass, OCRExScore } from '@/components/camera/songs';
import CameraMode from './camView';
import { CameraSettings } from './settings';
import Backdrop from '@mui/material/Backdrop';
import Loader from '@/view/components/common/loader';
import CameraResult from './camResult';
import { songData, scoreData } from '@/types/data';
import { songsDB, scoresDB, scoreHistoryDB } from '@/components/indexedDB';
import { _isSingle, _currentStore } from '@/components/settings';
import { _prefixFromNum, difficultyDiscriminator } from '@/components/songs/filter';
import CameraLoader from './camLoader';

export default class Camera extends React.Component<{},{
  loading:boolean,
  result:{
    title:string[], //estimated
    difficulty:string,
    ex:number,
  },
  display:number,
  rawCamData:string,
  openSettings:boolean,
  settings:any,
  isLoading:boolean,
  songs:{[key:string]:songData},
  token:string,
  text:string,
  ocrId:number,
}> {

  private cam = new CameraClass();

  constructor(props:{}){
    super(props);
    const current = localStorage.getItem("currentCam");
    this.state = {
      loading:true,
      result:{
        title:[],
        difficulty:"",
        ex:0,
      },
      display:0,
      rawCamData:"",
      openSettings:false,
      settings:current ? JSON.parse(current) : null,
      isLoading:true,
      songs:{},
      token:"",
      text:"",
      ocrId:-1,
    }
  }

  async componentDidMount(){
    const s = await (await this.fetcher("token","")).json();
    const token = s.token;
    this.setState({isLoading:false,token:token});
  }

  setSongs = async()=>{
    const t = (await new songsDB().getAll(_isSingle())).reduce((groups:{[key:string]:songData},item:songData)=>{
      if(!groups) groups = {};
      groups[item["title"] + _prefixFromNum(item.difficulty)] = item;
      return groups;
    },[]);
    return this.setState({songs:t});
  }

  fetcher = async(endpoint:string,data:string)=>{
    const v = window.location.href.indexOf("localhost") > -1  ? "test" : "v2";
    return await fetch("https://proxy.poyashi.me/" + v + "/" + endpoint, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body:JSON.stringify({data:data,token:this.state.token}),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
  }

  find = async(shot:string)=>{
    if(!shot) return;

    await this.setSongs();
    (await this.cam.setSplitLetters(/.{6}/g).loadSongs()).init();

    this.setState({isLoading:true,display:2});
    const t = await this.fetcher("ocr",shot.replace("data:image/jpeg;base64,",""));
    const json = await t.json();
    const fullText = !json.error ? json.res : "";
    if(!fullText || !t.ok){
      this.setState({isLoading:false,display:0});
      return false;
    }
    const title = this.cam.reset().setText(fullText).findSong();
    const currentSong = title.length > 0 ? title[0] : "";
    let diff = this.cam.findDifficulty(); //仮難易度推定
    let exScore = await this.cam.setTargetSong(currentSong,diff).getExScore();
    if(!this.cam.isAccurateDiff()){
      const chk = await this.cam.getAccSong(exScore.ex); //対象難易度が存在するかチェック、存在しない場合は存在する難易度を使用
      if(chk){
        diff = chk.difficulty;
      }
      exScore = await this.cam.setTargetSong(currentSong,diff).getExScore();
    }

    const m = await this.syncOCRData(fullText,title,diff,exScore);

    return this.setState({
      result:{
        title:title,
        difficulty:diff || "ANOTHER",
        ex:this.cam.checkExScoreDigits(exScore)
      },
      isLoading:false,
      display:1,
      text:fullText,
      ocrId:m
    })
  }

  shot = (shot:string)=>{
    const autoSave = localStorage.getItem("autoSaveAfterTook");
    this.find(shot);
    this.setState({rawCamData:shot});
    if(autoSave === "true"){
      this.download(shot);
    }
  }

  upload = async(ex:number,bpi:string|number,song:songData,lastEx:number)=>{
    this.setState({isLoading:true});
    const t = await this.fetcher("tweet/upload",this.state.rawCamData.replace("data:image/jpeg;base64,",""));
    this.setState({isLoading:false});
    if(!t.ok){
      return alert("エラーが発生しました");
    }
    const px = ex - lastEx === 0  ? "タイ" : ex - lastEx > 0 ? "+" + (ex - lastEx) : ex - lastEx;

    const body = await t.json();
    if(!body || !body.extended_entities || !body.extended_entities.media[0] || !body.extended_entities.media[0].display_url){
      alert("画像のアップロードに失敗しました。\n少し経ってからもう一度お試しください。");
    }
    const url = body.extended_entities.media[0].display_url;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `☆${song.difficultyLevel} ${song.title}${_prefixFromNum(song.difficulty,false)}\n` +
      `EXSCORE:${ex}(自己ベスト${px}) BPI:${bpi} ${url}`
    )}&related=BPIManager&hashtags=BPIM`);
  }

  syncOCRData = async (body:string,title:string[],diff:string,exScore:OCRExScore)=>{

    const sendData = localStorage.getItem("sendData") || "true";
    if(sendData !== "true"){
      return -1;
    }
    const p = await this.fetcher("sql/save",JSON.stringify({
      body:body,
      title:title,
      difficulty:diff || "ANOTHER",
      ex:exScore.error ? 0 : exScore.ex
    }));
    const json = await p.json();
    return (json && json.id) ? Number(json.id) : -1;
  }

  download = (data:string)=>{
    var a = document.createElement("a");
    a.href = (data || this.state.rawCamData);
    a.download = new Date().getTime() + ".jpg";
    a.click();
  }

  toggleSettings = ()=>{
    const current = localStorage.getItem("currentCam");
    this.setState({openSettings:!this.state.openSettings,settings:current ? JSON.parse(current) : null});
  }

  private default = (row:songData):scoreData=>{
    const t = {
      difficulty:difficultyDiscriminator(row.difficulty),
      title:row.title,
      currentBPI:NaN,
      exScore:0,
      difficultyLevel:row.difficultyLevel,
      storedAt:_currentStore(),
      isSingle:_isSingle(),
      clearState:7,
      lastScore:-1,
      updatedAt:"-",
    };
    return t;
  }

  save = async(score:scoreData|null,ex:number,bpi:number,song:songData):Promise<boolean>=>{
    this.setState({isLoading:true});
    const scores = new scoresDB(), scoreHist = new scoreHistoryDB();
    scoreHist._add(Object.assign(score || this.default(song), { difficultyLevel: song.difficultyLevel, currentBPI: bpi, exScore: ex }));
    const t = await scores.updateScore(score || this.default(song),{currentBPI:bpi,exScore:ex,clearState:score ? score.clearState : 0,missCount:score ? score.missCount || 0 : 0});
    this.setState({isLoading:false});
    return t;
  }

  render(){
    const {songs,result,display,openSettings,settings,isLoading,rawCamData,token,text,ocrId} = this.state;
    return (
      <React.Fragment>
        <Backdrop open={isLoading} style={{zIndex:999}}>
          <Loader text="しばらくお待ち下さい"/>
        </Backdrop>
        {display === 2 && <CameraLoader rawCamData={rawCamData}/>} { /* Loader */ }
        {display === 1 && <CameraResult id={ocrId} text={text} token={token} result={result} rawCamData={rawCamData} songs={songs} save={this.save} retry={()=>this.setState({display:0})} upload={this.upload}/>}
        {display === 0 && <CameraMode camSettings={settings} shot={this.shot} toggleSettings={this.toggleSettings}/>}
        {openSettings && <CameraSettings toggleSettings={this.toggleSettings}/>}
      </React.Fragment>
    );
  }
}
