import * as React from 'react';
import timeFormatter from "../common/timeFormatter";
import { songsDB, scoresDB, favsDB, scoreHistoryDB, rivalListsDB } from "../indexedDB";
import WarningIcon from '@mui/icons-material/Warning';
import Backdrop from "@mui/material/Backdrop";
import { _currentDefinitionURL } from '../settings';
import fbActions from '../firebase/actions';
import Loader from '@/view/components/common/loader';

export default class Initialize extends React.Component<{ global: any }, { show: boolean, error: boolean, errorMessage: string, consoleMes: string, p: number }>{
  private songsDB = new songsDB();
  private scoresDB = new scoresDB();
  private scoreHistoryDB = new scoreHistoryDB();
  private rivalListsDB = new rivalListsDB();
  private fbA: fbActions = new fbActions();

  constructor(props: { global: any }) {
    super(props);
    this.state = {
      show: true,
      error: false,
      consoleMes: "初期化中",
      errorMessage: "",
      p: 0,
    }
  }

  wait = (msec: number = 10) => {
    return new Promise(resolve => {
      setTimeout(resolve, msec)
    });
  }

  async componentDidMount() {
    try {
      //new fbActions().dBatch();
      new fbActions().auth().onAuthStateChanged(async (user: any) => {
        if (user && user.providerData.length > 0 && user.providerData[0]["providerId"] === "twitter.com") {
          //const time = isSameDay(localStorage.getItem("lastTwitterSynced") || "1970/01/01 00:00:00",new Date());
          if (!localStorage.getItem("lastTwitterSynced")) {
            console.log("** Twitter Sync Start **");
            localStorage.setItem("lastTwitterSynced", new Date().toString());
            const ax = await (await fetch("https://asia-northeast1-bpimv2.cloudfunctions.net/getTwitterInfo?targetId=" + user.providerData[0]["uid"])).json();
            const p = JSON.parse(ax.raw.body);
            const u = new fbActions().v2SetUserCollection().setDocName(user.uid);
            u.setTwitterId(p.screen_name);
            console.log("** Twitter Sync Completed **");
          } else {
            console.log("** Last Twitter Sync Date : " + localStorage.getItem("lastTwitterSynced") + " **");
          }
        }
        if (!localStorage.getItem("isUploadedRivalData")) {
          const t = await this.rivalListsDB.getAll();
          if (t.length > 0 && user) {
            if ((await this.fbA.syncLoadRival()).length === 0) {
              const u = await new fbActions().v2SetUserCollection().setDocName(user.uid).load();
              this.fbA.setDocName(user.uid);
              this.fbA.syncUploadRival(t, true, u ? u.displayName : "");
            }
            localStorage.setItem("isUploadedRivalData", "true");
          }
        }
      });
      if (!localStorage.getItem("showLatestSongs")) {
        localStorage.setItem("showLatestSongs", "true");
      }
      if (!localStorage.getItem("foregroundNotification")) {
        localStorage.setItem("foregroundNotification", "true");
      }
      //this.sinusIridum();
      this.removeDeletedSongs();
      const songsAvailable: string[] = await this.songsDB.getAll();
      this.scoresDB.removeNaNItems();
      this.scoreHistoryDB.removeNaNItems();

      if (songsAvailable.length > 0) {
        return this.setState({ show: false });
      }

      const now = timeFormatter(0);
      const csv = await fetch(_currentDefinitionURL()).then(t => t.json());
      let p = [];
      for (let i = 0; i < csv.body.length; ++i) {
        if (csv["body"][i]["removed"]) {
          continue;
        }
        p.push(Object.assign(csv["body"][i], {
          updatedAt: now,
        }));
      }
      new favsDB().addList("お気に入り", "デフォルトのリスト");
      await this.songsDB.bulkAdd(p);
      localStorage.setItem("isSingle", "1");
      localStorage.setItem("lastDefFileVer", csv.version);
      return this.setState({ show: false });
    } catch (e: any) {
      console.log(e);
      return this.setState({ error: true, errorMessage: "エラーが発生したため続行できません。" })
    }
  }

  removeDeletedSongs = async () => {
    const ax = await (await fetch("https://proxy.poyashi.me/?type=bpi_metadata")).json();
    if (ax.removed) {
      for (let i = 0; i < ax.removed.length; ++i) {
        const t = ax.removed[i];
        await this.songsDB._removeItemByDifficulty(t["title"], String(t["difficulty"]));
        await this.scoresDB.removeSpecificItemAtAllStores(t["title"]);
        await this.scoreHistoryDB.removeSpecificItemAtAllStores(t["title"]);
      }
    }
  }
  /*
    sinusIridum = async()=>{
      const another:songData = {
        "title": "Ergosphere",
        "wr": -1,
        "avg": -1,
        "difficulty": "4",
        "notes": 1391,
        "bpm": "170",
        "textage": "29/ergosphr.html?1AB00",
        "difficultyLevel": "11",
        "dpLevel": "0",
        "coef": -1,
        "updatedAt":timeFormatter(0)
      };
      const bpi = new bpiCalcuator();
      const modify = async(type:0|1)=>{
        try{
          const array = type === 0 ? await this.scoresDB.getSpecificSong(another.title) : await this.scoreHistoryDB.getSpecificSong(another.title);
          for(let i =0; i < array.length; ++i){
            const t = array[i];
            const newBPI = await bpi.setIsSingle(t.isSingle).calc(t.title,difficultyParser(t.difficulty,t.isSingle),t.exScore);
            type === 0 ? this.scoresDB.modifyBPI(t,newBPI) : this.scoreHistoryDB.modifyBPI(t,newBPI);
          }
        }catch(e:any){
          console.log(e);
        }
      }
      await this.songsDB.removeItem("Ergosphere");
      await this.songsDB.bulkAdd([another]);
      modify(0);
      modify(1);
      return;
    }
  */
  render() {
    if (this.state.error) {
      return (<Backdrop open>
        <div>
          <WarningIcon />
        </div>
        <div>
          <p>{this.state.errorMessage}</p>
        </div>
      </Backdrop>);
    }

    return (
      <Backdrop open={this.state.show} style={{ flexDirection: "column" }}>
        <div>
          <Loader />
        </div>
        <div>
          <p style={{ textAlign: "center" }}>{this.state.consoleMes}<br />Initializing...</p>
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
