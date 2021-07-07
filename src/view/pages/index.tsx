import * as React from 'react';
import Button from '@material-ui/core/Button';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {Link as RefLink, Divider, Avatar, Grid, Typography, CardActions, Card, CardContent, Container} from '@material-ui/core/';
import { _currentVersion, _currentTheme } from '@/components/settings';
import UpdateIcon from '@material-ui/icons/Update';
import Loader from '@/view/components/common/loader';
import { updateDefFile } from '@/components/settings/updateDef';
import CheckIcon from '@material-ui/icons/Check';
import WarningIcon from '@material-ui/icons/Warning';
import { Helmet } from 'react-helmet';
import { getAltTwitterIcon } from '@/components/rivals';
import { alternativeImg } from '@/components/common';
import bpiCalcuator from '@/components/bpi';
import statMain from '@/components/stats/main';

import TimelineIcon from '@material-ui/icons/Timeline';
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic';
import MenuOpenIcon from '@material-ui/icons/MenuOpen';
import CameraAltIcon from '@material-ui/icons/CameraAlt';
import QueueMusicIcon from '@material-ui/icons/QueueMusic';
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import PeopleIcon from '@material-ui/icons/People';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle/AlertTitle';
import { FormattedMessage } from 'react-intl';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import { named, getTable, CLBody } from '@/components/aaaDiff/data';
import fbActions from '@/components/firebase/actions';

class Index extends React.Component<{toggleNav:()=>void}&RouteComponentProps,{
  user:any,
  totalBPI:number,
  lastWeekUpdates:number,
  remains:number,
  auth:any,
  isLoading:boolean
}>{

  constructor(props:{toggleNav:()=>void}&RouteComponentProps){
    super(props);
    this.state = {
      auth:null,
      user:localStorage.getItem("social") ? JSON.parse(localStorage.getItem("social") || "[]") : null,
      totalBPI:-15,
      lastWeekUpdates:0,
      remains:0,
      isLoading:true
    }
  }

  async componentDidMount(){
    const bpi = new bpiCalcuator();
    let exec = await new statMain(12).load();
    const totalBPI = bpi.setSongs(exec.at(),exec.at().length) || -15;
    const shift = await exec.eachDaySum(5);
    const _named = await named(12);
    const remains = await getTable(12,_named);
    const concatted = Object.keys(remains).reduce((group:any,item:string)=>{
      if(!group) group = [];
      group = group.concat(remains[item]);
      return group;
    },[]);
    new fbActions().auth().onAuthStateChanged((user: any)=> {
      this.setState({auth:user});
    });
    this.setState({
      totalBPI:totalBPI,
      lastWeekUpdates:(shift && shift[shift.length-1]) ? shift[shift.length - 1].sum : 0,
      remains:concatted.filter((item:CLBody)=>item.bpi > (Number.isNaN(item.currentBPI) ? -999 : item.currentBPI)).length,
      isLoading:false
    })
  }

  render(){
    const themeColor = _currentTheme();
    const {user,auth} = this.state;
    const xs = 12,sm = 6, md = 4,lg = 4;
    return (
      <div>
        <Helmet>
          <meta name="description"
            content="beatmania IIDXのスコアをBPIという指標を用いて管理したり、ライバルとスコアを競ったりできるツールです。"
          />
        </Helmet>
        <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
          <div style={{background:themeColor === "light" ? "transparent" : "rgba(0,0,0,.5)",display:"flex",padding:"1vh 0",width:"100%",height:"100%",paddingBottom:"60px"}}>
            {(auth && user) && (
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
                    <Link to={"/u/" + user.displayName}><RefLink color="secondary" component="span">プロフィールを確認</RefLink></Link>
                  </Typography>
              </Grid>
            </Grid>
            )}
            {(!auth || !user) && (
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
        <Container style={{marginTop:"-60px"}} className="topMenuContainer">
          <UpdateDef/>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom className="TypographywithIcon">
                <MenuOpenIcon/>&nbsp;クイックアクセス
              </Typography>
              <div style={{overflowX:"scroll"}} className="topMenuScrollableWrapper">
              <Grid container direction="row" wrap="nowrap" alignItems="center" style={{width:"100%",margin:"20px 0 0 0"}} className="topMenuContaienrGridWrapper">
                <Grid item direction="column" alignItems="center" onClick={()=>this.props.history.push("/camera")}>
                  <CameraAltIcon/>
                  <Typography color="textSecondary" variant="caption">BPIカメラ</Typography>
                </Grid>
                <Grid item direction="column" alignItems="center" onClick={()=>this.props.history.push("/data")}>
                  <SaveAltIcon/>
                  <Typography color="textSecondary" variant="caption">インポート</Typography>
                </Grid>
                <Grid item direction="column" alignItems="center" onClick={()=>this.props.history.push("/songs")}>
                  <QueueMusicIcon/>
                  <Typography color="textSecondary" variant="caption">楽曲一覧</Typography>
                </Grid>
                <Grid item direction="column" alignItems="center" onClick={()=>this.props.history.push("/rivals")}>
                  <PeopleIcon/>
                  <Typography color="textSecondary" variant="caption">ライバル</Typography>
                </Grid>
                <Grid item direction="column" alignItems="center" onClick={()=>this.props.history.push("/sync/settings")}>
                  <SyncProblemIcon/>
                  <Typography color="textSecondary" variant="caption">Sync</Typography>
                </Grid>
              </Grid>
              </div>
            </CardContent>
          </Card>
        </Container>
        <Divider style={{margin:"25px 0"}}/>
        {this.state.isLoading && <Loader/>}
        {!this.state.isLoading && (
        <Container>
          <Grid container direction="row" justify="space-between" spacing={3} className="narrowCards">
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
            <Grid item xs={xs} sm={sm} md={md} lg={lg}>
            </Grid>
          </Grid>
        </Container>
      )}
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
    }catch(e){
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
