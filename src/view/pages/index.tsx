import * as React from 'react';
import Button from '@mui/material/Button';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {Link as RefLink, Divider, Avatar, Grid, Typography, CardActions, Card, CardContent, Container, CircularProgress, ListItem, ListItemAvatar, ListItemText, List} from '@mui/material/';
import { _currentVersion, _currentTheme, _currentQuickAccessComponents } from '@/components/settings';
import UpdateIcon from '@mui/icons-material/Update';
import Loader from '@/view/components/common/loader';
import { updateDefFile } from '@/components/settings/updateDef';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import { Helmet } from 'react-helmet';
import { getAltTwitterIcon } from '@/components/rivals';
import { alternativeImg, getUA, blurredBackGround } from '@/components/common';
import bpiCalcuator from '@/components/bpi';
import statMain from '@/components/stats/main';

import TimelineIcon from '@mui/icons-material/Timeline';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Alert from '@mui/lab/Alert/Alert';
import AlertTitle from '@mui/lab/AlertTitle/AlertTitle';
import { FormattedMessage } from 'react-intl';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import { named, getTable, CLBody } from '@/components/aaaDiff/data';
import fbActions from '@/components/firebase/actions';
import { scoresDB } from '@/components/indexedDB';
import { scoreData, rivalStoreData } from '@/types/data';
import { isSameWeek, updatedTime } from '@/components/common/timeFormatter';
import { quickAccessTable } from '@/components/common/quickAccess';
import PeopleIcon from '@mui/icons-material/People';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ModalUser from '../components/rivals/modal';
import AppsIcon from '@mui/icons-material/Apps';
import GetAppIcon from '@mui/icons-material/GetApp';
import { BeforeInstallPromptEvent } from '@/components/context/global';


class Index extends React.Component<{global:any}&RouteComponentProps,{
  user:any,
  totalBPI:number,
  lastWeekUpdates:number,
  remains:number,
  auth:any,
  isLoading:boolean,
  userLoading:boolean,
  latestUsersLoading:boolean,
  recentUsers:rivalStoreData[],
  isModalOpen:boolean,
  currentUserName:string,
}>{

  constructor(props:{global:any}&RouteComponentProps){
    super(props);
    this.state = {
      auth:null,
      user:localStorage.getItem("social") ? JSON.parse(localStorage.getItem("social") || "[]") : null,
      totalBPI:-15,
      lastWeekUpdates:0,
      remains:0,
      isLoading:true,
      userLoading:true,
      latestUsersLoading:true,
      recentUsers:[],
      isModalOpen:false,
      currentUserName:""
    }
  }

  async componentDidMount(){
    const bpi = new bpiCalcuator();
    let exec = await new statMain(12).load();
    const totalBPI = bpi.setSongs(exec.at(),exec.at().length) || -15;
    let shift = await new scoresDB().getAll();
    shift = shift.filter((data:scoreData)=>isSameWeek(data.updatedAt,new Date()));
    const _named = await named(12);
    const remains = await getTable(12,_named);
    const concatted = Object.keys(remains).reduce((group:any,item:string)=>{
      if(!group) group = [];
      group = group.concat(remains[item]);
      return group;
    },[]);
    new fbActions().auth().onAuthStateChanged((user: any)=> {
      this.setState({auth:user,userLoading:false});
    });
    this.setState({
      totalBPI:totalBPI,
      lastWeekUpdates:shift.length || 0,
      remains:concatted.filter((item:CLBody)=>item.bpi > (Number.isNaN(item.currentBPI) ? -999 : item.currentBPI)).length,
      isLoading:false
    });
    return this.getRecentUsers();
  }

  getRecentUsers = async()=>{
    const res = await new fbActions().recentUpdated(null,null,"すべて");
    return this.setState({latestUsersLoading:false,recentUsers:res.slice(0,5)});
  }

  QAindexOf = (needle:string)=>{
    const str = _currentQuickAccessComponents();
    return str.indexOf(needle) > -1;
  }

  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag});
  open = (uid:string)=> this.setState({isModalOpen:true,currentUserName:uid});

  render(){
    const themeColor = _currentTheme();
    const bg = blurredBackGround();
    const {user,auth,isLoading,userLoading,latestUsersLoading,recentUsers,isModalOpen,currentUserName} = this.state;
    const xs = 12,sm = 6, md = 4,lg = 4;
    return (
      <div>
        <Helmet>
          <meta name="description"
            content="beatmania IIDXのスコアをBPIという指標を用いて管理したり、ライバルとスコアを競ったりできるツールです。"
          />
        </Helmet>
        <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
          <div style={{background:themeColor === "light" ? "transparent" : "rgba(0,0,0,0)",display:"flex",padding:"1vh 0",width:"100%",height:"100%",paddingBottom:"90px"}}>
            {userLoading && (
            <Grid container alignContent="space-between" alignItems="center" style={{padding:"20px"}}>
              <Grid item xs={3} lg={3} style={{display:"flex",justifyContent:"center",flexDirection:"column"}}>
                <Container fixed  className={"loaderCenteredOnly"} style={{maxWidth:"100%"}}>
                  <CircularProgress color="secondary" size={64} />
                </Container>
              </Grid>
              <Grid item xs={9} lg={9} style={{paddingLeft:"15px"}}>
                <Typography variant="body1">
                  &nbsp;
                </Typography>
                <Typography variant="body1">
                  &nbsp;
                </Typography>
              </Grid>
            </Grid>
            )}
            {(!userLoading && (auth && user)) && (
            <Grid container alignContent="space-between" alignItems="center" style={{padding:"20px"}}>
              <Grid item xs={3} lg={3} style={{display:"flex",justifyContent:"center",flexDirection:"column"}}>
                <Avatar style={{border:"1px solid #222",margin:"15px auto"}} className="toppageIcon">
                  <img src={user.photoURL ? user.photoURL.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                    alt={user.displayName}
                    onClick={()=>this.props.history.push("/u/" + user.displayName)}
                    onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(user) || alternativeImg(user.displayName)}/>
                </Avatar>
              </Grid>
              <Grid item xs={9} lg={9} style={{paddingLeft:"15px"}}>
                <Typography variant="body1">
                  {user.displayName}
                </Typography>
                  <Typography variant="body1">
                    <Link to={"/sync/settings"}><RefLink color="secondary" component="span">プロフィールを編集</RefLink></Link>
                  </Typography>
              </Grid>
            </Grid>
            )}
            {(!userLoading && (!auth || !user)) && (
            <Grid container alignContent="space-between" alignItems="center" style={{padding:"20px"}}>
              <Grid item xs={3} lg={3} style={{display:"flex",justifyContent:"center",flexDirection:"column"}}>
                <Avatar style={{border:"1px solid #222",margin:"15px auto"}} className="toppageIcon">
                </Avatar>
              </Grid>
              <Grid item xs={9} lg={9} style={{paddingLeft:"15px"}}>
                <Typography variant="body1">
                  ログインしていません
                </Typography>
                <Typography variant="body1">
                  <Link to="/sync/settings"><RefLink color="secondary" component="span">ログインして全機能を開放</RefLink></Link>
                </Typography>
              </Grid>
            </Grid>
            )}
          </div>
        </div>
        <Container style={{marginTop:"-90px"}} className="topMenuContainer">
          {(!userLoading && (!auth || !user)) && <BeginnerAlert/>}
          <InstallAlert global={this.props.global}/>
          <UpdateDef/>
          <Card style={bg}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom className="TypographywithIcon">
                <MenuOpenIcon/>&nbsp;クイックアクセス
              </Typography>
              <div style={{overflowX:"scroll"}} className="topMenuScrollableWrapper">
              <Grid container direction="row" wrap="nowrap" alignItems="center" style={{width:"100%",margin:"20px 0 0 0"}} className="topMenuContaienrGridWrapper">
                {quickAccessTable.map((item:any)=>{
                  if(!this.QAindexOf(item.com)) return (null);
                  return (
                    <Grid container direction="column" alignItems="center" onClick={()=>this.props.history.push(item.href)} key={item.name}>
                      {item.icon}
                      <Typography color="textSecondary" variant="caption">{item.name}</Typography>
                    </Grid>
                  )
                })
                }
                <Grid container direction="column" alignItems="center" onClick={()=>this.props.history.push("/settings?tab=1")}>
                  <AppsIcon/>
                  <Typography color="textSecondary" variant="caption">表示項目を編集</Typography>
                </Grid>
              </Grid>
              </div>
            </CardContent>
          </Card>
          <Divider style={{margin:"25px 0"}}/>
        </Container>
        {isLoading && <Loader/>}
        {!isLoading && (
        <Container>
          <Grid container direction="row" justifyContent="space-between" spacing={3} className="narrowCards">
            <Grid item xs={xs} sm={sm} md={md} lg={lg}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom className="TypographywithIcon">
                    <TimelineIcon/>&nbsp;総合BPI(☆12)
                  </Typography>
                  <Typography color="textSecondary" variant="h2">
                    {this.state.totalBPI}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={()=>this.props.history.push("/stats")}>統計をすべて表示</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={xs} sm={sm} md={md} lg={lg}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom className="TypographywithIcon">
                    <LibraryMusicIcon/>&nbsp;今週更新した楽曲数
                  </Typography>
                  <Typography color="textSecondary" variant="h2">
                    {this.state.lastWeekUpdates}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={()=>this.props.history.push("/songs")}>楽曲一覧を表示</Button>
                </CardActions>
              </Card>
            </Grid>
            <Grid item xs={xs} sm={sm} md={md} lg={lg}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom className="TypographywithIcon">
                    <WbIncandescentIcon/>&nbsp;残り未AAA楽曲数(☆12)
                  </Typography>
                  <Typography color="textSecondary" variant="h2">
                    {this.state.remains}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={()=>this.props.history.push("/AAATable")}>AAA達成表を表示</Button>
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        </Container>
        )}
        <Container>
          <Divider style={{margin:"25px 0"}}/>
          <Card>
          <CardContent>
          <Typography color="textSecondary" gutterBottom className="TypographywithIcon">
            <PeopleIcon/>&nbsp;最近スコアを更新したユーザー
          </Typography>
          {latestUsersLoading && <Loader/>}
          {!latestUsersLoading && (
          <List>
            {recentUsers.map((item:rivalStoreData)=>{
              return (
                <ListItem key={item.uid} button onClick={()=>this.open(item.displayName)}>
                  <ListItemAvatar>
                    <Avatar>
                      <img src={item.photoURL ? item.photoURL.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                        alt={item.displayName}
                        onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(item) || alternativeImg(item.displayName)}/>
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={item.displayName} secondary={"総合BPI:"+ item.totalBPI +" / " + updatedTime((item.serverTime as any).toDate())}/>
                </ListItem>
              )
            })}
          </List>
          )}
          <Button startIcon={<ArrowRightIcon/>} fullWidth size="small" onClick={()=>this.props.history.push("/rivals?tab=3")}>もっと見る</Button>
          </CardContent>
          </Card>
        </Container>
        {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
        <small style={{marginTop:"25px",fontSize:"8px",textAlign:"center",display:"block",padding:"15px"}}>
          <FormattedMessage id="Index.notes1"/><br/>
          <FormattedMessage id="Index.notes2"/><br/>
          <FormattedMessage id="Index.notes3"/>
        </small>
      </div>
    )
  }
}

export default withRouter(Index);

class UpdateDef extends React.Component<{},{
  showUpdate:boolean,
  latestVersion:string,
  updateInfo:string,
  progress:number,
  res:string,
}>{

  constructor(props:{}){
    super(props);
    this.state = {
      showUpdate:false,
      latestVersion:"",
      updateInfo:"",
      progress:0,
      res:""
    }
  }

  async componentDidMount(){
    try{
      const versions = await fetch("https://proxy.poyashi.me/?type=bpiVersion");
      const data = await versions.json();
      const currentVersion = _currentVersion();
      if(data.version !== currentVersion){
        this.setState({
          showUpdate:true,
          latestVersion:data.version,
          updateInfo:data.updateInfo,
        });
      }
    }catch(e:any){
      console.log(e);
    }
  }

  updateButton = async()=>{
    this.setState({progress:1});
    const p = await updateDefFile();
    console.log(p);
    this.setState({progress:2,res:p.message});
  }

  handleToggle = ()=> this.setState({showUpdate:false});

  render(){
    const {showUpdate,latestVersion,updateInfo,progress,res} = this.state;
    if(!showUpdate){
      return (null);
    }
    return (
      <Alert variant="outlined" className="MuiPaper-root updateDefAlert" severity="info" style={{marginBottom:"25px"}}>
        <AlertTitle>定義データを更新</AlertTitle>
        <div>
          {progress === 0 && <div>
            最新の楽曲データ(ver{latestVersion})が利用可能です。<br/>
            「更新」ボタンをクリックして今すぐ更新できます。<br/>
            <RefLink href={updateInfo} target="_blank" color="secondary">ここをクリック</RefLink>して、最新の楽曲データにおける変更点を確認できます。
            <Divider style={{margin:"8px 0"}}/>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              size="large"
              onClick={this.updateButton}
              startIcon={<UpdateIcon/>}>
              今すぐ更新
            </Button>
          </div>}
          {progress === 1 && <div>
            <Loader text={"更新しています"}/>
          </div>}
          {progress === 2 && <div>
            <div style={{display:"flex",alignItems:"center",margin:"20px 0",flexDirection:"column"}}>
              {(res === "定義データはすでに最新です" || res === "更新完了") && <CheckIcon style={{ fontSize: 60 }}/>}
              {(res !== "定義データはすでに最新です" && res !== "更新完了") && <WarningIcon style={{ fontSize: 60 }}/>}
              <span>{res}</span>
              {(res !== "定義データはすでに最新です" && res !== "更新完了") && <span><RefLink href="https://gist.github.com/potakusan/11b5322c732bfca4d41fc378dab9b992" color="secondary" target="_blank">トラブルシューティングを表示</RefLink></span>}
            </div>
            <Button onClick={this.handleToggle} color="secondary" fullWidth style={{marginTop:"8px"}}>
              閉じる
            </Button>
          </div>}
        </div>
      </Alert>
    );
  }
}

class BeginnerAlert extends React.Component<{},{}>{

  render(){
    return (
      <Alert variant="outlined" className="MuiPaper-root updateDefAlert" severity="info" style={{marginBottom:"25px"}}>
        <AlertTitle>はじめての方へ</AlertTitle>
        <p>
          「BPIとはなにか？何を表す数字なのか？」などのよくあるご質問にお答えするページがございます。<br/>
          <RefLink href="https://docs2.poyashi.me" target="_blank" color="secondary">こちらのページを御覧ください。</RefLink>
        </p>
      </Alert>
    );
  }
}

class InstallAlert extends React.Component<{global:any},{hide:boolean}>{

  constructor(props:{global:any}){
    super(props);
    this.state = {
      hide:false
    }
  }
  private available = (('standalone' in window.navigator) && ((window.navigator as any)['standalone']));

  installApp = ()=>{
    const { global } = this.props;
    if(global && global.prompt){
      const p = global.prompt as BeforeInstallPromptEvent;
      p.prompt();
    }else{
      alert("インストールダイアログの呼び出しに失敗しました。\nChromeのメニューより「ホーム画面に追加」をタップし、手動で追加してください。");
    }
  }

  hideMessage = ()=>{ localStorage.setItem("hideAddToHomeScreen","true"); this.setState({hide:true}); }

  render(){
    const ua = getUA();
    const bg = blurredBackGround();
    if(localStorage.getItem("hideAddToHomeScreen") || this.state.hide) return (null);
    if(ua === "ios" &&  this.available) return (null); // iOS PWA動作時
    if(ua === "chrome" && window.matchMedia('(display-mode: standalone)').matches) return (null); // Chronium PWA動作時
    if(ua === "chrome"){
      return (
        <Alert className="MuiPaper-root" severity="info" style={bg}>
          <AlertTitle>ご存知ですか？</AlertTitle>
          <p>
            「インストール」ボタンをタップして、ホーム画面から通常のアプリのようにBPIManagerをお使いいただけます。
          </p>
          <Button startIcon={<GetAppIcon/>} fullWidth color="secondary" variant="outlined" onClick={this.installApp}>インストール</Button>
        </Alert>
      );
    }
    if(ua === "ios"){
      return (
        <Alert className="MuiPaper-root" severity="info" style={bg}>
          <AlertTitle>お試しください</AlertTitle>
          <p>
            ホーム画面に追加して、通常のアプリのようにBPIManagerをお使いいただけます。
          </p>
          <img src="/images/how_to_add_ios.webp" style={{width:"100%",maxWidth:"460px",display:"block",margin:"3px auto"}} alt="ホーム画面への追加手順"/>
          <Button fullWidth style={{marginTop:"8px",display:"block",textAlign:"right"}} onClick={this.hideMessage}>次から表示しない</Button>
      </Alert>
      )
    }
    return (null);
  }

}
