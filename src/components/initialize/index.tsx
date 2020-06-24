import * as React from 'react';
import timeFormatter from "../common/timeFormatter";
import {songsDB, scoresDB, favsDB, scoreHistoryDB, rivalListsDB} from "../indexedDB";
import WarningIcon from '@material-ui/icons/Warning';
import Backdrop from "@material-ui/core/Backdrop";
import { _currentDefinitionURL } from '../settings';
import fbActions from '../firebase/actions';
import Loader from '../../view/components/common/loader';

export default class Initialize extends React.Component<{},{show:boolean,error:boolean,errorMessage:string,consoleMes:string,p:number}>{
  private songsDB = new songsDB();
  private scoresDB = new scoresDB();
  private scoreHistoryDB = new scoreHistoryDB();
  private rivalListsDB = new rivalListsDB();
  private fbA:fbActions = new fbActions();

  constructor(props:Object){
    super(props);
    this.state = {
      show : true,
      error:false,
      consoleMes:"必須情報を読み込んでいます",
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

      if(!localStorage.getItem("isUploadedRivalData")){
        new fbActions().auth().onAuthStateChanged(async(user: any)=> {
          const t = await this.rivalListsDB.getAll();
          if(t.length > 0 && user){
            if((await this.fbA.syncLoadRival()).length === 0){
              const u = await new fbActions().setColName("users").setDocName(user.uid).load();
              this.fbA.setDocName(user.uid);
              this.fbA.syncUploadRival(t,true,u ? u.displayName : "");
            }
            localStorage.setItem("isUploadedRivalData","true");
          }
        });
      }

      // Close the world bug fix 2019/11/11 & 2019/12/08
        this.songsDB.removeItem("Close the World feat. a☆ru");
        this.scoresDB.removeSpecificItemAtAllStores("Close the World feat. a☆ru");
      //

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
        p.push(Object.assign(csv["body"][i],{
          isFavorited:false,
          isCreated:false,
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

  render(){
    if(!this.state.show){
      return (null);
    }
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
      <Backdrop open style={{flexDirection:"column"}}>
        <div>
          <Loader/>
        </div>
        <div>
          <p style={{textAlign:"center"}}>{this.state.consoleMes}<br/>Please wait.</p>
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
