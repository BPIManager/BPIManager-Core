import * as React from 'react';

import Button from '@material-ui/core/Button';
import { _currentStore, _isSingle } from '../../../components/settings';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import List from '@material-ui/core/List';
import fbActions from '../../../components/firebase/actions';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import { alternativeImg } from '../../../components/common';
import ListSubheader from '@material-ui/core/ListSubheader';
import Paper from '@material-ui/core/Paper';
import Switch from '@material-ui/core/Switch';
import { messanger } from '../../../components/firebase/message';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import firebase from 'firebase/app';
import 'firebase/messaging';

interface P {
}

interface S {
  processing:boolean,
  errorMessage:string,
  syncData:{
    from:any,
    to:any,
    updatedAt:any,
    version:any,
    notify:boolean,
  }[],
  userData:any,
  permission:boolean,
}

class PushSettings extends React.Component<P,S> {
  private fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private messanger = new messanger();

  constructor(props:P){
    super(props);
    this.state = {
      processing:true,
      errorMessage:"",
      syncData:[],
      userData:null,
      permission:false,
    }
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
  }

  async componentDidMount(){
    this.refreshData();
    this.setState({permission:this.messanger.checkPermission()});
  }

  handleToggle = (event:React.ChangeEvent<HTMLInputElement>)=>{
    this.setState({processing:true});
    const {value,checked} = event.target;
    let newSyncData = this.state.syncData;
    newSyncData[Number(value)]["notify"] = checked;
    this.fbActions.syncNotificationItem(newSyncData[Number(value)]);
    return this.setState({syncData:newSyncData,processing:false});
  }

  uid = ()=>{
    return this.state.userData ? this.state.userData.uid : ""
  }

  refreshData = ()=>{
    this.setState({processing:true});
    return this.fbActions.auth().onAuthStateChanged(async(user: any)=> {
      this.fbActions.setDocName(user.uid);
      const p = user.uid ? (await this.fbActions.syncLoadRival(true)) as any : [];
      this.setState({
        processing:false,
        userData:this.state.userData || await new fbActions().setColName("users").setDocName(user.uid).load(),
        syncData:p,
      });
    });
  }

  requestNotify = async()=>{
    if(firebase.messaging.isSupported()){
      await this.messanger.requestPermission();
      return this.setState({permission:true});
    }
  }

  render(){
    const {syncData,permission,processing} = this.state;
    if(!permission){
      return (
        <div>
          <Paper style={{padding:"15px"}}>
            <Typography component="h6" variant="h6" color="textPrimary">
              ライバルの更新を通知
            </Typography>
            <Typography component="p" variant="caption" style={{margin:"10px 0"}}>
              ライバルが新たにスコアを更新したとき、プッシュ通知で更新をお知らせする機能です。<br/>
              通知をタップすることで、ライバルの最新スコアを直ぐに確認できます。<br/>
              通知のオンオフはライバルごとに設定できます。
            </Typography>
            <Button variant="outlined" fullWidth onClick={this.requestNotify}>通知を許可</Button>
            <Typography component="p" variant="caption" style={{margin:"10px 0"}}>
              本機能の利用にはプッシュ通知を許可する必要があります。<br/>
              下のボタンをクリックし、通知を許可してください。<br/>
              通知許可はブラウザの設定画面から何時でも取り消すことが可能です。<br/>
              iOSには対応していません。
            </Typography>
          </Paper>
        </div>);
    }
    return (
      <div>
        <Paper style={{padding:"15px"}}>
          <List
            subheader={
              <ListSubheader component="div" disableSticky>
                通知を管理
              </ListSubheader>
            }>
            {processing && <div style={{display:"flex",justifyContent:"center"}}><CircularProgress color="secondary" style={{margin:"10px auto"}}/></div>}
            {(syncData.length === 0 && !processing) && <div>
              <Typography component="p" variant="caption" style={{margin:"10px 0"}}>
                通知を許可できるユーザーがいません。<br/>
                「ライバル」タブで通知対象にしたいユーザーが「アップロード済み」欄に存在することを確認のうえ、再度お試しください。
              </Typography>
            </div>}
            {syncData.map((item,i)=>{
              if(!item.to) return (null);
              return (
              <ListItem key={item.to.displayName}>
                <ListItemAvatar>
                  <Avatar>
                    <img src={item.to.photoURL ? item.to.photoURL : "noimage"} style={{width:"100%",height:"100%"}}
                      alt={item.to.displayName}
                      onError={(e)=>(e.target as HTMLImageElement).src = alternativeImg(item.to.displayName)}/>
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.to.displayName}
                  secondary={"通知 : " + ((syncData[i]["notify"] || false) === true ? "許可" : "不許可")}
                />
                <ListItemSecondaryAction>
                  <Switch color="secondary" onChange={this.handleToggle} checked={syncData[i]["notify"] || false} value={i} />
                </ListItemSecondaryAction>
              </ListItem>
            )})}
          </List>
        </Paper>

        <Alert severity="info" style={{margin:"10px 0"}}>
          <AlertTitle style={{marginTop:"0px",fontWeight:"bold"}}>ライバルのスコア更新を通知</AlertTitle>
          <p>
            この画面で通知を許可したユーザーが新規スコアを登録したとき、プッシュ通知でお知らせします。
          </p>
          <p>仕様:<br/>
          ・最短通知間隔は30分です<br/>
          ・通知をクリックするとユーザーのスコア更新を確認できます<br/>
          ・スコアデータを非公開にしているユーザーの更新は通知されません<br/>
          ・お試し実装なので今後機能の改廃を行う可能性が大です<br/>
          ・問題が発生した場合は@BPIManagerまで教えていただけると助かります<br/>
          ・通知を許可できる対象は「ライバル」タブよりサーバーにデータを送信済みのライバルのみです<br/>
          ・iOSには対応していません
          </p>
        </Alert>
      </div>
    );
  }
}

export default PushSettings;
