import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import timeFormatter from "../common/timeFormatter";
import storageWrapper,{songsDB, scoresDB} from "../indexedDB";
import WarningIcon from '@material-ui/icons/Warning';
import { _currentBPIDefinition } from '../settings';

export default class Initialize extends React.Component<{},{show:boolean,error:boolean,errorMessage:string,consoleMes:string}>{
  storage:any;
  songsDB:any;
  scoresDB:any;

  constructor(props:Object){
    super(props);
    this.storage = new storageWrapper();
    this.songsDB = new songsDB();
    this.scoresDB = new scoresDB();
    this.state = {
      show : true,
      error:false,
      consoleMes:"Loading essential components...",
      errorMessage:""
    }
  }

  wait = (msec:number = 10)=> {
    return new Promise(resolve=>{
      setTimeout(resolve, msec)
    });
  }

  async componentDidMount(){
    try{

      // Close the world bug fix 2019/11/11 & 2019/12/08
        this.songsDB.removeItem("Close the World feat. a☆ru");
        this.scoresDB.removeSpecificItemAtAllStores("Close the World feat. a☆ru");
      //
      const songsAvailable:string[] = await this.songsDB.getAll();
      if(songsAvailable.length > 0){
        return this.setState({show:false});
      }
      const now = timeFormatter(0);
      const csv = await fetch("https://files.poyashi.me/json/songsWithDP.json?t=initialized").then(t=>t.json());
      for(let i=0;i < csv.body.length;++i){
        await this.songsDB.setItem(Object.assign(csv["body"][i],{
          isFavorited:false,
          isCreated:false,
          updatedAt:now,
        }));
        this.wait(3);
      }
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
      return (<div id="overlayLayout">
        <div>
          <WarningIcon/>
        </div>
        <div>
          <p>{this.state.errorMessage}</p>
        </div>
      </div>);
    }
    return (
      <div id="overlayLayout">
        <div>
          <CircularProgress/>
        </div>
        <div>
          <p style={{textAlign:"center"}}>{this.state.consoleMes}</p>
          <p style={{textAlign:"center"}}>画面を閉じないでください</p>
        </div>
      </div>
    );
  }

}
