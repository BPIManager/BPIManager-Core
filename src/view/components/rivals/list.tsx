import * as React from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
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
import Alert from '@material-ui/lab/Alert/Alert';
import Grid from '@material-ui/core/Grid';
import RecentActorsIcon from '@material-ui/icons/RecentActors';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import IconButton from '@material-ui/core/IconButton';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import SyncIcon from '@material-ui/icons/Sync';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import SettingsIcon from '@material-ui/icons/Settings';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface S {
  isAddOpen:boolean,
  showSnackBar:boolean,
  isLoading:boolean,
  rivals:DBRivalStoreData[],
  message:string,
  bulkUpdate:boolean,
  openMenu:boolean,
}

interface P {
  showEachRival: (input:DBRivalStoreData)=>void,
  changeTab: (_ev:any,input:number)=>void
}

const updateMinuteError = "一括更新機能は1分あたり1回までご利用いただけます。";

class RivalLists extends React.Component<P&RouteComponentProps,S> {
  private rivalListsDB = new rivalListsDB();

  constructor(props:P&RouteComponentProps){
    super(props);
    this.state = {
      isAddOpen:false,
      bulkUpdate:false,
      showSnackBar:false,
      isLoading:true,
      rivals:[],
      message:"",
      openMenu:false,
    }
  }

  async componentDidMount(){
    this.loadRivals();
  }

  toggleMenu = (willOpen:boolean = false)=>{
    this.setState({openMenu: willOpen });
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
    this.toggleMenu(false);
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
    const {isAddOpen,showSnackBar,rivals,isLoading,message,bulkUpdate,openMenu,} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <div>
        <div style={{display:"flex",justifyContent:"flex-end"}}>
          <div style={{margin:"10px 6px 0"}}>
            <IconButton
              aria-haspopup="true"
              onClick={()=>this.toggleMenu(true)}>
                <SettingsIcon />
            </IconButton>
              <SwipeableDrawer
                anchor="bottom"
                open={openMenu}
                onClose={()=>this.toggleMenu(false)}
                onOpen={()=>this.toggleMenu(true)}
                >
                  <List
                    subheader={
                      <ListSubheader component="div" id="nested-list-subheader">
                        ライバル管理
                      </ListSubheader>
                  }>
                    <ListItem button onClick={()=>this.props.history.push("/sync?init=1")}>
                      <ListItemIcon><CloudUploadIcon/></ListItemIcon>
                      <ListItemText primary={"ライバルリストを同期"} secondary={"現在登録済みのライバルをアカウントに同期します。"}/>
                    </ListItem>
                    <ListItem button onClick={this.update}>
                      <ListItemIcon><SyncIcon/></ListItemIcon>
                      <ListItemText primary={"ライバルスコアの一括更新"} secondary={"現在登録済みのライバルの登録スコアを一括で最新状態にアップデートします。"}/>
                    </ListItem>
                  </List>
              </SwipeableDrawer>
          </div>
          <Backdrop open={bulkUpdate}>
            <CircularProgress color="inherit" />
          </Backdrop>
        </div>
        {rivals.length === 0 && (
          <Alert severity="warning">
            まだライバルがいません。
          </Alert>
        )}
        <List>
          {rivals.sort((a,b)=>moment(b.updatedAt).diff(a.updatedAt)).map((item,i)=>(
            <div key={item.uid} onClick={()=>this.props.showEachRival(item)}>
              <RivalComponent data={item}/>
              {i !== rivals.length - 1 && <Divider variant="inset" component="li" />}
            </div>)
          )}
        </List>
        <Grid container spacing={1} style={{marginTop:"4px",marginBottom:"4px"}}>
          <Grid item xs={12} sm={6} style={{paddingTop:"8px"}}>
            <Button color="secondary" variant="outlined" fullWidth onClick={()=>this.props.changeTab(null,1)}>
              <PersonAddIcon/>
              おすすめユーザーを見る
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} style={{paddingTop:"8px"}}>
            <Button color="secondary" variant="outlined" fullWidth onClick={()=>this.props.changeTab(null,3)}>
              <RecentActorsIcon/>
              最近更新したユーザー
            </Button>
          </Grid>
        </Grid>
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
    const text = <span>{data.profile || <i>-</i>}<br/>最終更新: {data.updatedAt}</span>
    return (
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
    );
  }
}

export default withRouter(RivalLists);
