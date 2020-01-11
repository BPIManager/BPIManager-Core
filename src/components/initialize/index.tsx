import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import timeFormatter from "../common/timeFormatter";
import {songsDB, scoresDB} from "../indexedDB";
import WarningIcon from '@material-ui/icons/Warning';
import { _currentDefinitionURL } from '../settings';

export default class Initialize extends React.Component<{},{show:boolean,error:boolean,errorMessage:string,consoleMes:string}>{
  private songsDB = new songsDB();
  private scoresDB = new scoresDB();

  constructor(props:Object){
    super(props);
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
      const csv = await fetch(_currentDefinitionURL()).then(t=>t.json());
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
          <p style={{textAlign:"center"}}>{this.state.consoleMes}<br/>Please wait...</p>
        </div>
      </div>
    );
  }

}
