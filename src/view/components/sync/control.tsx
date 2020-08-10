import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Divider from '@material-ui/core/Divider';
import fbActions from '@/components/firebase/actions';
import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle, _autoSync } from '@/components/settings';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { scoresDB, scoreHistoryDB } from '@/components/indexedDB';
import TextField from '@material-ui/core/TextField';
import {Link, CircularProgress, Paper} from '@material-ui/core/';
import {Link as RefLink} from "react-router-dom";
import Alert from '@material-ui/lab/Alert';
import { config } from '@/config';
import AlertTitle from '@material-ui/lab/AlertTitle';

class SyncControlScreen extends React.Component<{userData:any},{
  isLoading:boolean,
  scoreData:any,
  sentName:string,
  rivalData:any,
  myName:string,
  myProfile:string,
  nameErrorMessage:string[],
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

  sendName = async()=>{
    this.setState({isLoading:true,nameErrorMessage:[]});
    try{
      if(this.state.myName && this.state.scoreData === null){
        return this.setState({nameErrorMessage:["エラーが発生しました。次のような理由が挙げられます:"],isLoading:false});
      }
      const res = await this.fbA.saveName(this.state.myName,this.state.myProfile,this.props.userData.photoURL,this.state.arenaRank);
      if(res.error){
        return this.setState({nameErrorMessage:["エラーが発生しました。次のような理由が挙げられます:","名前に使用できない文字列が含まれている、すでに使用されている名前である、アクセス権限がない"],isLoading:false});
      }
    }catch(e){
      alert("エラーが発生しました。:" + e);
    }
    this.setState({nameErrorMessage:["設定を反映しました"],isLoading:false,sentName:this.state.myName});
  }

  isOlderVersion = ()=>{
    const current = _currentStore();
    return current === "26";
  }

  render(){
    const {isLoading,scoreData,nameErrorMessage,myName,myProfile,arenaRank,sentName} = this.state;
    const nameError:boolean = myName.length !== 0 && (!/^[a-zA-Z0-9]+$/g.test(myName) || myName.length > 16);
    const profError:boolean = myProfile.length > 140;
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
        <p>
        <FormattedMessage id="Sync.Public0"/>
        </p>
        <TextField label="表示名を入力(最大16文字)"
          InputLabelProps={{
            shrink: true,
          }}
          error={nameError}
          helperText={nameError && "使用できない文字が含まれているか、長すぎます"}
          value={myName}
          onChange={(e)=>this.setState({myName:e.target.value})}
          style={{width:"100%",margin:"0px 0px 8px 0"}}/>
        <FormControl fullWidth>
          <InputLabel>最高アリーナランク</InputLabel>
          <Select fullWidth value={arenaRank} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
            if(typeof e.target.value !== "string") return;
            this.setState({arenaRank:e.target.value});
          }}>
            {["-","A1","A2","A3","A4","A5","B1","B2","B3","B4","B5"].map(item=><MenuItem value={item} key={item}>{item}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField label="自己紹介を入力(最大140文字)"
          InputLabelProps={{
            shrink: true,
          }}
          value={myProfile}
          error={profError}
          helperText={profError && "自己紹介が長すぎます"}
          onChange={(e)=>this.setState({myProfile:e.target.value})}
          style={{width:"100%",margin:"8px 0"}}/>
        <Button
          variant="outlined"
          color="secondary"
          onClick={this.sendName}
          disabled={isLoading}>
          送信
        </Button>
        {(nameErrorMessage.length > 0 || (scoreData === null && myName)) &&
          <Alert severity="error" style={{margin:"8px 0"}}>
            {nameErrorMessage.map((item:string)=><span key={item}>{item}<br/></span>)}
            {(scoreData === null && myName) && <span style={{color:"#ff0000"}}>スコアデータが送信されていません。「転送」→「アップロード」よりスコアデータを送信してください。</span>}
          </Alert>
        }
        {(!isLoading && sentName) &&
          <p>
            あなたのプロフィールURL:<br/>
            <RefLink to={"/u/" + sentName} style={{textDecoration:"none"}}><Link color="secondary" component="span">{config.baseUrl}/u/{sentName}</Link></RefLink><br/>
            このリンクをシェアすると、他の人があなたのプロフィールやスコアを確認できます。
          </p>
        }
        <Divider style={{margin:"10px 0"}}/>
        <Button
          variant="outlined"
          color="secondary"
          disabled={isLoading}
          onClick={()=>this.fbA.logout()}
          startIcon={<MeetingRoomIcon />}>
          Log out
        </Button>
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
