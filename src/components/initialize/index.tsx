import * as React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import timeFormatter from "../common/timeFormatter";
import storageWrapper,{songsDB} from "../indexedDB";
import {csv} from "../../data/music.js";

export default class Initialize extends React.Component<{},{show:boolean}>{
  storage:any;
  songsDB:any;

  constructor(props:Object){
    super(props);
    this.storage = new storageWrapper();
    this.songsDB = new songsDB();
    this.state = {
      show : true,
    }
  }

  wait = (msec:number = 10)=> {
    return new Promise(resolve=>{
      setTimeout(resolve, msec)
    });
  }

  async componentDidMount(){
    try{
      const songsAvailable:string[] = await this.songsDB.getAll();
      if(songsAvailable.length > 0){
        return this.setState({show:false});
      }
      const now = timeFormatter(0);
      for(let i=0;i < csv.body.length;++i){
        await this.songsDB.setItem(Object.assign(csv["body"][i],{
          isFavorited:false,
          isCreated:false,
          updatedAt:now,
        }));
        this.wait(3);
      }
      localStorage.setItem("isSingle","true");
      localStorage.setItem("lastDefFileVer",csv.version);
      return this.setState({show:false});
    }catch(e){
      console.log(e);
    }
  }

  render(){
    if(!this.state.show){
      return (null);
    }
    return (
      <div id="overlayLayout">
        <div>
          <CircularProgress/>
        </div>
        <div>
          <p>Loading essential components...</p>
        </div>
      </div>
    );
  }

}
