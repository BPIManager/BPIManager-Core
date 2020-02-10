import * as React from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import Button from '@material-ui/core/Button';
import RivalAdd from './add';
import ShowSnackBar from '../snackBar';
import { rivalListsDB } from '../../../components/indexedDB';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DBRivalStoreData } from '../../../types/data';
import { updateRivalScore } from "../../../components/rivals";
import Backdrop from "@material-ui/core/Backdrop";
import moment from "moment";
import timeFormatter,{timeCompare} from "../../../components/common/timeFormatter";
import Loader from '../common/loader';
import { alternativeImg } from '../../../components/common';

interface S {
  isAddOpen:boolean,
  showSnackBar:boolean,
  isLoading:boolean,
  rivals:DBRivalStoreData[],
  message:string,
  bulkUpdate:boolean,
}

interface P {
  showEachRival: (input:DBRivalStoreData)=>void
}

const updateMinuteError = "一括更新機能は1分あたり1回までご利用いただけます。";

class RivalLists extends React.Component<P,S> {
  private rivalListsDB = new rivalListsDB();

  constructor(props:P){
    super(props);
    this.state = {
      isAddOpen:false,
      bulkUpdate:false,
      showSnackBar:false,
      isLoading:true,
      rivals:[],
      message:""
    }
  }

  componentDidMount(){
    this.loadRivals();
  }

  loadRivals = async()=>{
    this.setState({isLoading:true});
    return this.setState({
      isLoading:false,
      bulkUpdate:false,
      rivals:await this.rivalListsDB.getAll()
    });
  }

  update = async ()=>{
    const {rivals} = this.state;
    let updated = 0;
    let lastUpdateTime = localStorage.getItem("lastBatchRivalUpdate") || "1970-01-01 00:00";
    const timeDiff = (timeCompare(moment(),moment(lastUpdateTime)));
    if(timeDiff < 60){
      return this.toggleSnack(updateMinuteError);
    }
    this.setState({bulkUpdate:true});
    for(let i = 0; i < rivals.length; ++i){
      const t = await updateRivalScore(rivals[i]);
      if(t === "") updated++;
    }
    await this.loadRivals();
    localStorage.setItem("lastBatchRivalUpdate",timeFormatter(3));
    return this.toggleSnack(`${updated}件更新しました`);
  }

  handleToggleModal = ()=> this.setState({isAddOpen:!this.state.isAddOpen});
  toggleSnack = (message:string = "ライバルを追加しました")=> this.setState({message:message,showSnackBar:!this.state.showSnackBar});

  render(){
    const {isAddOpen,showSnackBar,rivals,isLoading,message,bulkUpdate} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <div>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <Button color="secondary" variant="outlined" onClick={this.update}>一括更新</Button>
          <Backdrop open={bulkUpdate}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </div>
        {rivals.length === 0 && <p>まだライバルがいません。</p>}
        {rivals.map(item=>(
          <div key={item.uid} onClick={()=>this.props.showEachRival(item)}><RivalComponent data={item}/></div>)
        )}
        <Fab onClick={this.handleToggleModal} color="secondary" aria-label="add" style={{position:"fixed","bottom":"5%","right":"3%"}}>
          <AddIcon />
        </Fab>
        {isAddOpen && <RivalAdd loadRivals={this.loadRivals} toggleSnack={this.toggleSnack} handleToggle={this.handleToggleModal}/>}
        <ShowSnackBar message={message} variant={message === updateMinuteError ? "warning" : "success"}
            handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </div>
    );
  }
}

interface CP {
  data:DBRivalStoreData
}

class RivalComponent extends React.Component<CP,{}> {

  render(){
    const {data} = this.props;
    const text = <span>{data.profile}<br/>最終更新: {data.updatedAt}</span>
    return (
      <div style={{margin:"10px 0 0 0"}}>
        <Paper>
          <ListItem button>
            <ListItemAvatar>
              <Avatar>
                <img src={data.photoURL ? data.photoURL : "noimage"} style={{width:"100%",height:"100%"}}
                  alt={data.rivalName}
                  onError={(e)=>(e.target as HTMLImageElement).src = alternativeImg(data.rivalName)}/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={data.rivalName} secondary={text} />
          </ListItem>
        </Paper>
      </div>
    );
  }
}

export default RivalLists;
