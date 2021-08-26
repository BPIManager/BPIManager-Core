import * as React from 'react';
import timeFormatter from "../common/timeFormatter";
import {songsDB, scoresDB, favsDB, scoreHistoryDB, rivalListsDB} from "../indexedDB";
import WarningIcon from '@material-ui/icons/Warning';
import Backdrop from "@material-ui/core/Backdrop";
import { _currentDefinitionURL } from '../settings';
import fbActions from '../firebase/actions';
import Loader from '@/view/components/common/loader';

export default class Initialize extends React.Component<{global:any},{show:boolean,error:boolean,errorMessage:string,consoleMes:string,p:number}>{
  private songsDB = new songsDB();
  private scoresDB = new scoresDB();
  private scoreHistoryDB = new scoreHistoryDB();
  private rivalListsDB = new rivalListsDB();
  private fbA:fbActions = new fbActions();

  constructor(props:{global:any}){
    super(props);
    this.state = {
      show : true,
      error:false,
      consoleMes:"初期化中",
      errorMessage:"",
      p:0,
    }
  }

  wait = (msec:number = 10)=> {
    return new Promise(resolve=>{
      setTimeout(resolve, msec)
    });
  }

  async componentDidMount(){
    try{
      //new fbActions().dBatch();
      new fbActions().auth().onAuthStateChanged(async(user: any)=> {
        if(user && user.providerData.length > 0 && user.providerData[0]["providerId"] === "twitter.com"){
          //const time = isSameDay(localStorage.getItem("lastTwitterSynced") || "1970/01/01 00:00:00",new Date());
          if(!localStorage.getItem("lastTwitterSynced")){
            console.log("** Twitter Sync Start **");
            localStorage.setItem("lastTwitterSynced",new Date().toString());
            const ax = await (await fetch("https://asia-northeast1-bpimv2.cloudfunctions.net/getTwitterInfo?targetId=" + user.providerData[0]["uid"])).json();
            const p = JSON.parse(ax.raw.body);
            const u = new fbActions().v2SetUserCollection().setDocName(user.uid);
            u.setTwitterId(p.screen_name);
            console.log("** Twitter Sync Completed **");
          }else{
            console.log("** Last Twitter Sync Date : "+ localStorage.getItem("lastTwitterSynced") + " **");
          }
        }
        if(!localStorage.getItem("isUploadedRivalData")){
          const t = await this.rivalListsDB.getAll();
          if(t.length > 0 && user){
            if((await this.fbA.syncLoadRival()).length === 0){
              const u = await new fbActions().v2SetUserCollection().setDocName(user.uid).load();
              this.fbA.setDocName(user.uid);
              this.fbA.syncUploadRival(t,true,u ? u.displayName : "");
            }
            localStorage.setItem("isUploadedRivalData","true");
          }
        }
      });
      if(!localStorage.getItem("showLatestSongs")){
        localStorage.setItem("showLatestSongs","true");
      }
      this.sinusIridum();
      this.removeDeletedSongs();
      const songsAvailable:string[] = await this.songsDB.getAll();
      await this.scoresDB.removeNaNItems();
      await this.scoreHistoryDB.removeNaNItems();

      if(songsAvailable.length > 0){
        return this.setState({show:false});
      }

      const now = timeFormatter(0);
      const csv = await fetch(_currentDefinitionURL()).then(t=>t.json());
      let p = [];
      for(let i=0;i < csv.body.length;++i){
        if(csv["body"][i]["removed"]){
          continue;
        }
        p.push(Object.assign(csv["body"][i],{
          updatedAt:now,
        }));
      }
      new favsDB().addList("お気に入り","デフォルトのリスト");
      await this.songsDB.bulkAdd(p);
      localStorage.setItem("isSingle","1");
      localStorage.setItem("lastDefFileVer",csv.version);
      return this.setState({show:false});
    }catch(e){
      console.log(e);
      return this.setState({error:true,errorMessage:e.message || "不明なエラーが発生したため続行できません。"})
    }
  }

  removeDeletedSongs = async()=>{
    const ax = await (await fetch("https://proxy.poyashi.me/?type=bpi_metadata")).json();
    if(ax.removed){
      for (let i = 0; i < ax.removed.length; ++i){
        const t = ax.removed[i];
        await this.songsDB._removeItemByDifficulty(t["title"],String(t["difficulty"]));
        await this.scoresDB.removeSpecificItemAtAllStores(t["title"],t["difficulty"]);
        await this.scoreHistoryDB.removeSpecificItemAtAllStores(t["title"],t["difficulty"]);
      }
    }
  }

  sinusIridum = async()=>{
    if(localStorage.getItem("sinusIridum")) return;
    await this.songsDB._removeItemByDifficulty("Sinus Iridum","4");
    await this.songsDB.bulkAdd(
    {
       "title":"Sinus Iridum",
       "wr":"-1",
       "avg":"-1",
       "difficulty":"4",
       "notes":"1803",
       "bpm":"128-256",
       "textage":"28/sinusiri.html?1AC00",
       "difficultyLevel":"12",
       "dpLevel":"0",
       "coef":-1
    });
    localStorage.setItem("sinusIridum","1");
    return;
  }

  render(){
    if(this.state.error){
      return (<Backdrop open>
        <div>
          <WarningIcon/>
        </div>
        <div>
          <p>{this.state.errorMessage}</p>
        </div>
      </Backdrop>);
    }

    return (
      <Backdrop open={this.state.show} style={{flexDirection:"column"}}>
        <div>
          <Loader/>
        </div>
        <div>
          <p style={{textAlign:"center"}}>{this.state.consoleMes}<br/>Initializing...</p>
        </div>
      </Backdrop>
    );
  }

}

/*

const s = Math.round((i / csv.body.length) * 100);
const {p} = this.state;
if(s === (p + 5)){
  this.setState({p:s});
}
*/
