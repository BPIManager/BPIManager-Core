import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import fbActions from '@/components/firebase/actions';
import Typography from '@mui/material/Typography';
import { _currentStore, _isSingle, _autoSync } from '@/components/settings';
import ButtonGroup from '@mui/material/ButtonGroup';
import { scoresDB, scoreHistoryDB } from '@/components/indexedDB';
import {Link, CircularProgress, Paper} from '@mui/material/';
import {Link as RefLink} from "react-router-dom";
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import ShowSnackBar from '../snackBar';

class SyncControlScreen extends React.Component<{userData:any},{
  isLoading:boolean,
  scoreData:any,
  sentName:string,
  rivalData:any,
  myName:string,
  myProfile:string,
  nameErrorMessage:string[],
  showNotes:boolean,
  arenaRank:string,
  snack:{
    open:boolean,
    message:string|null
  }
}> {

  private fbA:fbActions = new fbActions();
  private fbLoader:fbActions = new fbActions();

  constructor(props:{userData:any}){
    super(props);
    this.fbLoader.setColName(`${_currentStore()}_${_isSingle()}`).setDocName(props.userData.uid);
    this.fbA.v2SetUserCollection().setDocName(props.userData.uid);
    this.state = {
      isLoading:true,
      scoreData:null,
      rivalData:null,
      myName:"",
      sentName:"",
      myProfile:"",
      arenaRank:"-",
      showNotes:false,
      nameErrorMessage:[],
      snack:{
        open:false,
        message:""
      }
    }
  }

  async componentDidMount(){
    const t = await this.fbA.load();
    this.fbLoader.updateProfileIcon();
    this.setState({
      isLoading:false,
      scoreData: await this.fbLoader.load(),
      rivalData: t,
      sentName: t && t.displayName ? t.displayName : "",
      myName: t && t.displayName ? t.displayName : "",
      myProfile: t && t.profile ? t.profile : "",
      arenaRank: t && t.arenaRank ? t.arenaRank : "-",
      showNotes: t && t.showNotes ? t.showNotes : false,
    })
  }

  upload = async()=>{
    this.setState({isLoading:true});
    const res = await this.fbLoader.save(this.state.myName);
    if(res.error){
      this.toggleErrorSnack(res.reason);
      return this.setState({isLoading:false});
    }
    this.setState({isLoading:false,scoreData:await this.fbLoader.load()});
  }

  download = async()=>{
    this.setState({isLoading:true});
    const res = await this.fbLoader.load();
    if(res === null || res === undefined){
      this.toggleErrorSnack("エラーが発生しました");
      return this.setState({isLoading:false});
    }
    await new scoresDB().setDataWithTransaction(res.scores);
    await new scoreHistoryDB().setDataWithTransaction(res.scoresHistory);
    await new scoresDB().recalculateBPI();
    await new scoreHistoryDB().recalculateBPI();
    this.setState({isLoading:false});
  }

  isOlderVersion = ()=>{
    const current = _currentStore();
    return ["26","27"].indexOf(current) > -1;
  }

  handleShowNotes = (e:React.ChangeEvent<HTMLInputElement>)=>{
    this.setState({showNotes:e.target.checked});
  }

  toggleErrorSnack = (mes?:string|null)=>this.setState({snack:{open:!this.state.snack.open,message:mes || null}});

  render(){
    const {isLoading,scoreData,snack} = this.state;
    return (
      <Paper style={{padding:"15px"}}>
        <Typography component="h5" variant="h5">
          転送
        </Typography>
        <FormattedMessage id="Sync.Control.message1"/><br/>
        <FormattedMessage id="Sync.Autosync0"/>
        <RefLink to={"/settings"} style={{textDecoration:"none"}}>
          <Link color="secondary" component="span">
            <FormattedMessage id="GlobalNav.Settings"/>
          </Link>
        </RefLink>
        <FormattedMessage id="Sync.Autosync"/><br/>
        <Divider style={{margin:"10px 0"}}/>
        <div style={{margin:"15px 0"}}>
          {isLoading && (
            <Alert severity="warning" icon={<CircularProgress color="secondary" />}>
              <FormattedMessage id="Sync.Control.processing"/>
            </Alert>
          )}
          {(!isLoading && scoreData === null) && (
            <Alert severity="error">
              <FormattedMessage id="Sync.Control.nodata"/>
            </Alert>
          )}
          {(!isLoading && scoreData !== null) && (
            <Alert severity="info" icon={false}>
              <FormattedMessage id="Sync.Control.lastupdate"/><br/>
              Date: {scoreData.timeStamp}<br/>
              From: {scoreData.type ? scoreData.type : "undefined"}
            </Alert>
          )}
        </div>
        <ButtonGroup fullWidth color="secondary">
          <Button
            onClick={this.upload}
            disabled={isLoading || this.isOlderVersion()}
          >Upload</Button>
          <Button
            onClick={this.download}
            disabled={isLoading}
            >Download</Button>
        </ButtonGroup>
        {this.isOlderVersion() && (
          <Alert severity="warning" style={{margin:"15px 0"}}>
            <AlertTitle>アップロードできません</AlertTitle>
            <p>現在選択中のIIDXバージョン(IIDX{_currentStore()})は過去のバージョンです。<br/>
            このバージョンのスコアデータはダウンロード専用になり、新たにアップロードすることはできません。</p>
          </Alert>
        )}
        <Divider style={{margin:"10px 0"}}/>
        <Typography component="p" variant="caption" style={{textAlign:"right"}}>
          current configures:[version:{_currentStore()}] [mode:{_isSingle() === 1 ? "Single Play" : "Double Play"}] [autoSync:{_autoSync() ? "enabled" : "disabled"}]<br/>
          userId: {this.props.userData.uid}<br/>
          <Link color="secondary" href="https://docs2.poyashi.me/tos/">免責事項・利用について</Link>
        </Typography>
        <ShowSnackBar message={snack.message} variant="warning"
            handleClose={this.toggleErrorSnack} open={snack.open} autoHideDuration={3000}/>
      </Paper>
    );
  }
}

export default SyncControlScreen;
