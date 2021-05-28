import * as React from 'react';
import { CameraClass } from '@/components/camera/songs';
import CameraMode from './camView';
import { CameraSettings } from './settings';
import Backdrop from '@material-ui/core/Backdrop';
import Loader from '@/view/components/common/loader';
import CameraResult from './camResult';
import { songData, scoreData } from '@/types/data';
import { songsDB, scoresDB, scoreHistoryDB } from '@/components/indexedDB';
import { _isSingle, _currentStore } from '@/components/settings';
import { _prefixFromNum, difficultyDiscriminator } from '@/components/songs/filter';

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
  songs:{[key:string]:songData}
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
      songs:{}
    }
  }

  async componentDidMount(){
    (await this.cam.setSplitLetters(/.{6}/g).loadSongs()).init();
    const t = (await new songsDB().getAll(_isSingle())).reduce((groups:{[key:string]:songData},item:songData)=>{
      if(!groups){groups = {}};
      groups[item["title"] + _prefixFromNum(item.difficulty)] = item;
      return groups;
    },[]);
    this.setState({songs:t,isLoading:false});
  }

  find = async(shot:string)=>{
    if(!shot) return;
    this.setState({isLoading:true});
    const t = await fetch("https://proxy.poyashi.me/ocr", {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    body:JSON.stringify({data:shot.replace("data:image/jpeg;base64,","")}),
    headers: {
      'Content-Type': 'application/json'
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    });
    if(!t.ok){
      alert("エラーが発生しました");
    }
    const json = await t.json();
    const fullText = json && json.responses && json.responses[0] && json.responses[0]["fullTextAnnotation"] ? json.responses[0]["fullTextAnnotation"]["text"] : "";
    const title = this.cam.reset().setText(fullText).findSong();
    const diff = this.cam.findDifficulty();

    const exScore = this.cam.getExScore();
    return this.setState({
      result:{
        title:title,
        difficulty:diff || "ANOTHER",
        ex:exScore.error ? 0 : exScore.ex
      },
      isLoading:false,
      display:1
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
    const t = await fetch("https://proxy.poyashi.me/tweet/upload", {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      body:JSON.stringify({data:this.state.rawCamData.replace("data:image/jpeg;base64,","")}),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
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
    )}&related=BPIManager`);

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
    const {songs,result,display,openSettings,settings,isLoading,rawCamData} = this.state;
    return (
      <React.Fragment>
        <Backdrop open={isLoading}>
          <Loader text="しばらくお待ち下さい"/>
        </Backdrop>
        {display === 1 && <CameraResult result={result} rawCamData={rawCamData} songs={songs} save={this.save} retry={()=>this.setState({display:0})} upload={this.upload}/>}
        {display === 0 && <CameraMode camSettings={settings} shot={this.shot} toggleSettings={this.toggleSettings}/>}
        {openSettings && <CameraSettings toggleSettings={this.toggleSettings}/>}
      </React.Fragment>
    );
  }
}
