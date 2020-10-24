import * as React from 'react';
import Button from '@material-ui/core/Button';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import fbActions from '@/components/firebase/actions';
import { _currentStore, _isSingle, _autoSync, _setAutoSync } from '@/components/settings';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import {Link, Switch, FormControlLabel, Avatar, CardHeader, Card, CardActions, CardContent, withStyles, Theme, Divider, List, ListItem, ListItemAvatar, ListItemText, Typography} from '@material-ui/core/';
import {Link as RefLink, withRouter, RouteComponentProps} from "react-router-dom";
import Alert from '@material-ui/lab/Alert';
import { config } from '@/config';
import Loader from '../common/loader';
import { alternativeImg, avatarBgColor, avatarFontColor } from '@/components/common';
import { getAltTwitterIcon } from '@/components/rivals';
import SaveIcon from '@material-ui/icons/Save';
import { red } from '@material-ui/core/colors';
import AlertTitle from '@material-ui/lab/AlertTitle';
import CheckIcon from '@material-ui/icons/Check';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import BackupIcon from '@material-ui/icons/Backup';

class SyncControlScreen extends React.Component<{userData:any}&RouteComponentProps,{
  isLoading:boolean,
  scoreData:any,
  sentName:string,
  rivalData:any,
  myName:string,
  myProfile:string,
  nameErrorMessage:string[],
  showNotes:boolean,
  arenaRank:string,
  rawUserData:any,
  hideAlert:boolean,
  isPublic:boolean,
}> {

  private fbA:fbActions = new fbActions();
  private fbLoader:fbActions = new fbActions();

  constructor(props:{userData:any}&RouteComponentProps){
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
      rawUserData:null,
      hideAlert:false,
      isPublic:false,
    }
  }

  async componentDidMount(){
    return this.fbA.auth().onAuthStateChanged(async(user: any)=> {
      const t = await this.fbA.load();
      this.fbLoader.updateProfileIcon();
      this.setState({
        isLoading:false,
        rawUserData:user,
        scoreData: await this.fbLoader.load(),
        rivalData: t,
        sentName: t && t.displayName ? t.displayName : "",
        myName: t && t.displayName ? t.displayName : "",
        myProfile: t && t.profile ? t.profile : "",
        arenaRank: t && t.arenaRank ? t.arenaRank : "-",
        showNotes: t && t.showNotes ? t.showNotes : false,
        isPublic: t && t.isPublic ? t.isPublic : false,
      });
    });
  }

  sendName = async()=>{
    this.setState({isLoading:true,nameErrorMessage:[]});
    try{
      if(this.state.myName && this.state.scoreData === null){
        return this.setState({nameErrorMessage:["エラーが発生しました。次のような理由が挙げられます:"],isLoading:false});
      }
      const res = await this.fbA.saveName(this.state.myName,this.state.myProfile,this.props.userData.photoURL,this.state.arenaRank,this.state.showNotes,this.state.isPublic);
      if(res.error){
        return this.setState({nameErrorMessage:["エラーが発生しました。次のような理由が挙げられます:","名前に使用できない文字列が含まれている、すでに使用されている名前である、アクセス権限がない"],isLoading:false});
      }
    }catch(e){
      alert("エラーが発生しました。:" + e);
    }
    this.setState({nameErrorMessage:["設定を反映しました"],isLoading:false,sentName:this.state.myName,rivalData:await this.fbA.load()});
  }

  handleShowNotes = (e:React.ChangeEvent<HTMLInputElement>)=>{
    this.setState({showNotes:e.target.checked});
  }

  handlePublic = (e:React.ChangeEvent<HTMLInputElement>)=>{
    this.setState({isPublic:e.target.checked});
  }

  render(){
    const {isLoading,rivalData,scoreData,rawUserData,nameErrorMessage,myName,myProfile,arenaRank,sentName,showNotes,hideAlert,isPublic} = this.state;
    const nameError:boolean = myName.length !== 0 && (!/^[a-zA-Z0-9]+$/g.test(myName) || myName.length > 16);
    const profError:boolean = myProfile.length > 140;
    if(isLoading) return <Loader/>
    const profileAvailable = ()=>{
      if(!isLoading && sentName){
        return (
          <span>
            <RefLink to={"/u/" + sentName} style={{textDecoration:"none"}}><Link color="secondary" component="span">プロフィールを表示</Link></RefLink>
            <br/>
            <Link color="secondary" href={`http://twitter.com/share?url=${config.baseUrl}${"/u/" + sentName}&text=${rivalData.displayName} 総合BPI:${String(Number.isNaN(rivalData.totalBPI) ? "-" : rivalData.totalBPI)}`}>Twitterでプロフィールを共有</Link>
          </span>);
      }else{
        return ("プロフィールは非公開です");
      }
    }
    return (
      <div>
        {(!_autoSync() && !hideAlert) && (
          <Alert severity="warning" style={{margin:"10px 0"}}>
            <AlertTitle>Auto-syncが無効です</AlertTitle>
            <p>サーバー上のスコアデータを最新のまま維持するために、Auto-syncを有効にしてください。</p>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={()=>{
                _setAutoSync(true);
                this.setState({hideAlert:true});
              }}
              startIcon={<CheckIcon/>}
              disabled={isLoading}>
              オンにする
            </Button>
          </Alert>
        )}
        {(hideAlert) && (
          <Alert severity="success" style={{margin:"10px 0"}}>
            <AlertTitle>Auto-syncを有効にしました</AlertTitle>
            <p>設定→Auto-syncより、いつでもこの機能を無効にできます。</p>
          </Alert>
        )}
        <Card>
          <CardHeader
            avatar={
            <Avatar style={{width:"64px",height:"64px"}}>
              <img src={rawUserData.photoURL ? rawUserData.photoURL.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                alt={rivalData ? rivalData.displayName : rawUserData.displayName || "Unpublished User"}
                onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(rivalData) || alternativeImg(rawUserData.displayName)}/>
            </Avatar>
            }
            title={rawUserData.displayName + `(${rawUserData.providerData[0].providerId || "Unknown Provider"})`}
            subheader={profileAvailable()}
          />
          <CardContent>
            <TextField label="表示名を入力(最大16文字)"
              InputLabelProps={{
              shrink: true,
              }}
              error={nameError}
              helperText={nameError && "使用できない文字が含まれているか、長すぎます"}
              value={myName}
              onChange={(e)=>this.setState({myName:e.target.value})}
              style={{width:"100%",margin:"0px 0px 8px 0"}}/>
            <FormControl fullWidth style={{margin:"8px 0"}}>
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
              style={{width:"100%",margin:"8px 0px 8px 0"}}/>
              <small>*Twitter ID(@~)またはIIDX ID(8ケタの数字)を記入することでプロフィールページにリンクが表示されます</small>
            <FormControl fullWidth style={{margin:"8px"}}>
              <FormControlLabel
                control={<Switch size="small" checked={showNotes} onChange={this.handleShowNotes} name="showNotes" />}
                label="投稿ノート一覧を公開"
              />
            </FormControl>
            <FormControl fullWidth style={{margin:"8px"}}>
              <FormControlLabel
                control={<Switch size="small" checked={isPublic} onChange={this.handlePublic} name="showNotes" />}
                label="プロフィールを一般公開"
              />
              <small>プロフィールを非公開にすると、他の人はあなたのスコアデータを閲覧できなくなります。<br/>あなたをライバル登録している人も、非公開の間はあなたのスコアを追跡できなくなります。</small>
            </FormControl>
          </CardContent>
          <CardActions>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={this.sendName}
              startIcon={<SaveIcon/>}
              disabled={isLoading}>
              変更を保存
            </Button>
            <ColorButton
              color="secondary"
              disabled={isLoading}
              fullWidth
              onClick={()=>this.fbA.logout()}
              startIcon={<MeetingRoomIcon />}>
              サインアウト
            </ColorButton>
          </CardActions>
        </Card>
        {(nameErrorMessage.length > 0 || (scoreData === null && myName)) &&
          <Alert severity="error" style={{margin:"8px 0"}}>
            {nameErrorMessage.map((item:string)=><span key={item}>{item}<br/></span>)}
            {(scoreData === null && myName) && <span style={{color:"#ff0000"}}>スコアデータが送信されていません。「転送」→「アップロード」よりスコアデータを送信してください。</span>}
          </Alert>
        }
        <Divider style={{margin:"8px 0"}}/>
        <li style={{listStyleType:"none"}}>
          <Typography
            style={{padding:"4px 8px"}}
            color="textSecondary"
            display="block"
            variant="caption"
          >
            プロフィールを公開したら...
          </Typography>
        </li>
        <List>
          <ListItem button onClick={()=>this.props.history.push("/rivals?tab=3")}>
            <ListItemAvatar>
              <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                <GroupAddIcon/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={"ライバルを探す"} secondary={"実力が近いユーザーをライバル登録して、スコアを競えます"} />
          </ListItem>
          <ListItem button onClick={()=>this.props.history.push("/notes")}>
            <ListItemAvatar>
              <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                <SpeakerNotesIcon/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={"ノートを投稿"} secondary={"楽曲の攻略情報をシェアしよう"} />
          </ListItem>
          <ListItem button onClick={()=>this.props.history.push("/sync")}>
            <ListItemAvatar>
              <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                <BackupIcon/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={"スコアを送信"} secondary={"常に最新のスコアをアップロードすることをおすすめします"} />
          </ListItem>
        </List>
        {/*
        <Divider style={{margin:"8px 0"}}/>
        <li style={{listStyleType:"none"}}>
          <Typography
            style={{padding:"4px 8px"}}
            color="textSecondary"
            display="block"
            variant="caption"
          >
            高度な設定
          </Typography>
          <Button fullWidth color="secondary" variant="outlined" size="large" style={{margin:"10px 0"}}>再認証して表示</Button>
          <small>アカウント削除などを実行するには、ソーシャルアカウントで再連携し、本人であることを確認する必要があります。</small>
        </li>
        */}
      </div>
    );
  }
}

export default withRouter(SyncControlScreen);

const ColorButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(red[700]),
    backgroundColor: red[700],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
}))(Button);
