import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import Divider from '@material-ui/core/Divider';
import fbActions from '../../../components/firebase/actions';
import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle } from '../../../components/settings';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import timeFormatter from '../../../components/common/timeFormatter';
import { scoresDB, scoreHistoryDB } from '../../../components/indexedDB';
import TextField from '@material-ui/core/TextField';
import {Link as RefLink} from '@material-ui/core/';

class SyncControlScreen extends React.Component<{userData:any},{
  isLoading:boolean,
  scoreData:any,
  rivalData:any,
  myName:string,
  myProfile:string,
  nameErrorMessage:string[],
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
      myProfile:"",
      nameErrorMessage:[]
    }
  }

  async componentDidMount(){
    const t = await this.fbA.load();
    this.setState({
      isLoading:false,
      scoreData: await this.fbLoader.load(),
      rivalData: t,
      myName: t && t.displayName ? t.displayName : "",
      myProfile: t && t.profile ? t.profile : "",
    })
  }

  upload = async()=>{
    this.setState({isLoading:true});
    const res = await this.fbLoader.save();
    if(res.error){
      alert("エラーが発生しました");
      return this.setState({isLoading:false});;
    }
    this.setState({isLoading:false,scoreData:{timeStamp:timeFormatter(3),type:this.fbA.type()}});
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
      const res = await this.fbA.saveName(this.state.myName,this.state.myProfile,this.props.userData.photoURL);
      if(res.error){
        return this.setState({nameErrorMessage:["エラーが発生しました。次のような理由が挙げられます:","名前に使用できない文字列が含まれている、すでに使用されている名前である、アクセス権限がない"],isLoading:false});
      }
    }catch(e){
      alert("エラーが発生しました。:" + e);
    }
    this.setState({nameErrorMessage:["設定を反映しました"],isLoading:false});
  }

  render(){
    const {isLoading,scoreData,nameErrorMessage,myName,myProfile} = this.state;
    const nameError = myName.length !== 0 && !/[a-zA-Z0-9]+$/g.test(myName) || myName.length > 16;
    const profError = myProfile.length > 140;
    return (
      <div>
        <Typography component="h5" variant="h5">
          バックアップ
        </Typography>
        <FormattedMessage id="Sync.Control.message1"/><br/>
        <FormattedMessage id="Sync.Control.message2"/>
        <Divider style={{margin:"10px 0"}}/>
        {isLoading && <p><FormattedMessage id="Sync.Control.processing"/></p>}
        {(!isLoading && scoreData === null) && <p><FormattedMessage id="Sync.Control.nodata"/></p>}
        {(!isLoading && scoreData !== null) && <p><FormattedMessage id="Sync.Control.lastupdate"/>:{scoreData.timeStamp} {scoreData.type ? scoreData.type : "undefined"}から</p>}
        <ButtonGroup fullWidth color="secondary">
          <Button
            onClick={this.upload}
            disabled={isLoading}
          >Upload</Button>
          <Button
            onClick={this.download}
            disabled={isLoading}
            >Download</Button>
        </ButtonGroup>
        <Divider style={{margin:"10px 0"}}/>
        <Typography component="h5" variant="h5">
          ライバル
        </Typography>
        <p>
        下のフォームに名前を入力して送信することで、他の人にあなたのスコアデータを公開できます。<br/>
        他の人と同じ名前は使用できません。名前を変更しても、すでにあなたをライバルとして追加済みのユーザーはあなたを追跡できます。<br/>
        データを非公開にしたい場合は表示名を空欄にしたまま「送信」ボタンをクリックしてください。<br/>
        ユーザー情報として、下記に記載した情報および、連携アカウントに設定されたプロフィール画像が使用されます。<br/>
        <RefLink color="secondary" href="https://gist.github.com/potakusan/08c5528d6c6a51d10aec6b6556723a80"  target="_blank" rel="noopener noreferrer">ライバル機能の詳細はこちらを見てください</RefLink>
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
        <TextField label="自己紹介を入力(最大140文字)"
          InputLabelProps={{
            shrink: true,
          }}
          value={myProfile}
          error={profError}
          helperText={profError && "自己紹介が長すぎます"}
          onChange={(e)=>this.setState({myProfile:e.target.value})}
          style={{width:"100%",margin:"0px 0px 8px 0"}}/>
        <Button
          variant="outlined"
          color="secondary"
          onClick={this.sendName}
          disabled={isLoading}>
          送信
        </Button>
        <p>
          {nameErrorMessage.map((item:string)=><span>{item}<br/></span>)}
        </p>
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
          current configures:[version:{_currentStore()}] [mode:{_isSingle() === 1 ? "Single Play" : "Double Play"}]
        </Typography>
      </div>
    );
  }
}

export default SyncControlScreen;
