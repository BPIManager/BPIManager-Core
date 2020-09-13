import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import fbActions from '@/components/firebase/actions';
import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle, _autoSync } from '@/components/settings';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { scoresDB, scoreHistoryDB } from '@/components/indexedDB';
import {Link, CircularProgress, Paper} from '@material-ui/core/';
import {Link as RefLink} from "react-router-dom";
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

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
}> {

  private fbA:fbActions = new fbActions();
  private fbLoader:fbActions = new fbActions();

  constructor(props:{userData:any}){
    super(props);
    this.fbLoader.setColName(`${_currentStore()}_${_isSingle()}`).setDocName(props.userData.uid);
    this.fbA.setColName("users").setDocName(props.userData.uid);
    this.state = {
      isLoading:true,
      scoreData:null,
      rivalData:null,
      myName:"",
      sentName:"",
      myProfile:"",
      arenaRank:"-",
      showNotes:false,
      nameErrorMessage:[]
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
      alert("エラーが発生しました");
      return this.setState({isLoading:false});;
    }
    this.setState({isLoading:false,scoreData:await this.fbLoader.load()});
  }

  download = async()=>{
    this.setState({isLoading:true});
    const res = await this.fbLoader.load();
    if(res === null || res === undefined){
      console.log(res);
      alert("エラーが発生しました");
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
    return current === "26";
  }

  handleShowNotes = (e:React.ChangeEvent<HTMLInputElement>)=>{
    this.setState({showNotes:e.target.checked});
  }

  render(){
    const {isLoading,scoreData} = this.state;
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
        <Typography component="h5" variant="h5">
          公開設定
        </Typography>
        <p><RefLink to="/sync/settings" style={{textDecoration:"none"}}><Link color="secondary" component="span">公開プロフィールを設定する場合、こちらから変更してください。</Link></RefLink></p>
        <Divider style={{margin:"10px 0"}}/>
        <Typography component="p" variant="caption" style={{textAlign:"right"}}>
          current configures:[version:{_currentStore()}] [mode:{_isSingle() === 1 ? "Single Play" : "Double Play"}] [autoSync:{_autoSync() ? "enabled" : "disabled"}]<br/>
          userId: {this.props.userData.uid}<br/>
          <RefLink to="/help" style={{textDecoration:"none"}}><Link color="secondary" component="span">免責事項・利用について</Link></RefLink>
        </Typography>
      </Paper>
    );
  }
}

export default SyncControlScreen;
