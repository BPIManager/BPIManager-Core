import * as React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import {Link as RefLink, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, IconButton, List, ButtonGroup, Dialog, DialogTitle, DialogContent, Divider} from '@material-ui/core/';
import { _currentVersion } from '@/components/settings';
import PhonelinkSetupIcon from '@material-ui/icons/PhonelinkSetup';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic';
import HelpIcon from '@material-ui/icons/Help';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import Alert from '@material-ui/lab/Alert/Alert';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import { avatarFontColor, avatarBgColor } from '@/components/common';
import AlertTitle from '@material-ui/lab/AlertTitle';
import {Helmet} from "react-helmet";
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import FavoriteIcon from '@material-ui/icons/Favorite';
import UpdateIcon from '@material-ui/icons/Update';
import Loader from '../components/common/loader';
import { updateDefFile } from '@/components/settings/updateDef';
import CheckIcon from '@material-ui/icons/Check';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import SpeakerNotesIcon from '@material-ui/icons/SpeakerNotes';
import TwitterIcon from '@material-ui/icons/Twitter';

class Index extends React.Component<RouteComponentProps&{global:any},{}> {

  render(){
    return (
      <div>
        <Helmet>
          <meta name="description"
            content="beatmania IIDXのスコアをBPIという指標を用いて管理したり、ライバルとスコアを競ったりできるツールです。"
          />
        </Helmet>
        <IfNotOnTheHomeScreen history={this.props.history} global={this.props.global}/>
      </div>
    );
  }
}

class AddToHomeScreenTicker extends React.Component<{},{show:boolean}>{

  constructor(props:{}){
    super(props);
    const isStandAloneIn_iOS = () =>("standalone" in window.navigator) && (window.navigator["standalone"]);
    const isStandAloneInAndroid = ()=>window.matchMedia('(display-mode: standalone)').matches;
    const regEx = (ua:RegExp)=> ua.test(window.navigator.userAgent.toLowerCase());

    this.state = {
      show:(regEx(/iphone|ipad|ipod/) && !isStandAloneIn_iOS()) ? true : (regEx(/android/) && !isStandAloneInAndroid()) ? true : false
    }
  }

  render(){
    return (
      <Grid container justify="space-between">
        <Grid xs={12} item className="indexGridsContainer fullWidth">
        <div className="indexGrids">
          <PhonelinkSetupIcon className="indexGridsIcon"/>
          <Typography component="h5" variant="h5" color="textPrimary" paragraph>
            ホーム画面に追加
          </Typography>
        </div>
        <Typography component="p" variant="body1" color="textPrimary" paragraph>
          スマートフォンのホーム画面に追加することで、アプリとして便利にお使いいただけます。
        </Typography>
        <img src="https://files.poyashi.me/1a0f22bf.png" alt="Description of adding to home screen" className="addImage"/>
        </Grid>
      </Grid>
    )
  }
}

class IfNotOnTheHomeScreen extends React.Component<{
  history:any,
  global:any,
},{
  show:boolean,
  hide:boolean
}>{

  constructor(props:{history:any,global:any}){
    super(props);
    const isStandAloneIn_iOS = () =>("standalone" in window.navigator) && (window.navigator["standalone"]);
    const isStandAloneInAndroid = ()=>window.matchMedia('(display-mode: standalone)').matches;
    const isPC = ()=> navigator.userAgent.indexOf('iPhone') === -1 && navigator.userAgent.indexOf('iPod') === -1 && navigator.userAgent.indexOf('Android') === -1;

    const regEx = (ua:RegExp)=> ua.test(window.navigator.userAgent.toLowerCase());

    this.state = {
      show:isPC() ? true : (regEx(/iphone|ipad|ipod/) && !isStandAloneIn_iOS()) ? true : (regEx(/android/) && !isStandAloneInAndroid()) ? true : false,
      hide:!!localStorage.getItem("hide20200829"),
    }
  }

  render(){
    const {show,hide} = this.state;
    const navBar = [
      {
        to:"/help/start",
        id:"Top.Help",
        desc:"仕様や使い方などはこちらを御覧ください",
        icon:<HelpIcon />
      },
      {
        to:"/data",
        id:"GlobalNav.Data",
        desc:"CSVなどからスコアを一括登録",
        icon:<SaveAltIcon />
      },
      {
        to:"/songs",
        id:"GlobalNav.SongList",
        desc:"登録済みのスコアとBPIを確認",
        icon:<LibraryMusicIcon />
      },
      {
        to:"/rivals?tab=3",
        id:"GlobalNav.AddRivals",
        desc:"総合BPIから新たなライバルを見つける",
        icon:<GroupAddIcon />
      },
      {
        to:"/notes",
        id:"GlobalNav.WriteNote",
        desc:"他のユーザーと攻略情報を交換！",
        icon:<SpeakerNotesIcon />
      }
    ]
    return (
      <div className="heroLayout">
        <Container fixed  className="heroTitle">
          <Grid container style={{justifyContent:"center",alignItems:"center"}}>
            <Grid item xs={12} sm={3}>
              <img src="https://files.poyashi.me/bpim/icon.png" style={{margin:"0 auto",display:"block",borderRadius:"8%",maxWidth:"120px"}} alt="BPIManager"/>
            </Grid>
            <Grid item xs={12} sm={4}>
              <div className="mdCentered">
                <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
                  <FormattedMessage id="Top.Title"/>
                </Typography>
                <Typography component="h6" variant="body1" color="textPrimary" gutterBottom>
                  Score management tool for IIDX
                </Typography>
              </div>
            </Grid>
          </Grid>
          {!hide && !localStorage.getItem("hide20200829") &&
            <Alert variant="outlined" severity="info" style={{margin:"10px 0"}}>
              <AlertTitle>新機能のご紹介</AlertTitle>
              <p>楽曲の攻略情報をシェアできる<b>「Notes」</b>をリリースしました。</p>
              <ButtonGroup color="secondary" style={{margin:"8px 0"}} variant="outlined">
              <Button startIcon={<FavoriteIcon />}><Link to="/help/notes" style={{textDecoration:"none",color:"inherit"}}>詳細</Link></Button>
              <Button startIcon={<VisibilityOffIcon />} onClick={()=>{
                localStorage.setItem("hide20200829","true");
                this.setState({hide:true});
              }}>再度表示しない</Button>
              </ButtonGroup>
            </Alert>
          }
        </Container>
        <UpdateDef/>
        <Grid container>
        <Grid item xs={12} sm={12} md={6}>
        {show && <AddToHomeScreenTicker/>}
        </Grid>
        <Grid item xs={12} sm={12} md={6}>
        <List>
        {navBar.map((item,i)=>(
          <ListItem button key={i} onClick={()=>this.props.history.push(item.to)}>
            <ListItemAvatar>
              <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                {item.icon}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<FormattedMessage id={item.id}/>} secondary={item.desc} />
            <ListItemSecondaryAction>
              <IconButton edge="end">
                <ArrowForwardIosIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        <Divider/>
        <ListItem button
          onClick={()=>window.open("https://docs.google.com/forms/d/e/1FAIpQLSfhJkZZp5K1ChbE5RH-f0hOIkGvGX-7tYCZMxzVlsHVAtZ6eg/viewform?usp=sf_link")}>
          <ListItemAvatar>
            <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
              <QuestionAnswerIcon/>
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={<FormattedMessage id="Top.Survey"/>} secondary={<FormattedMessage id="Top.SurveyMes"/>} />
          <ListItemSecondaryAction>
            <IconButton edge="end">
              <ArrowForwardIosIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <ListItem button
          onClick={()=>window.open("https://twitter.com/BPIManager")}>
          <ListItemAvatar>
            <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
              <TwitterIcon/>
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={"Twitterで最新情報を発信中"} secondary={"@BPIManagerをフォロー"} />
          <ListItemSecondaryAction>
            <IconButton edge="end">
              <ArrowForwardIosIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        </List>
        </Grid>
        </Grid>
        <Container fixed >
          <div style={{marginTop:"20px"}}>
            <Grid container justify="center">
              <Grid item>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
                  <FormattedMessage id="Index.notes1"/><br/>
                  <FormattedMessage id="Index.notes2"/>
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Container>
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
    this.setState({progress:2,res:p.message});
  }

  handleToggle = ()=> this.setState({showUpdate:false});

  render(){
    const {showUpdate,latestVersion,updateInfo,progress,res} = this.state;
    if(!showUpdate){
      return (null);
    }
    return (
      <Dialog open={true}>
        <DialogTitle>定義データを更新</DialogTitle>
        <DialogContent>
          {progress === 0 && <div>
            最新の楽曲データ(ver{latestVersion})が利用可能です。<br/>
            「更新」ボタンをクリックして更新するか、「閉じる」ボタンをクリックして後で更新できます。<br/>
            <RefLink href={updateInfo} target="_blank" color="secondary">ここをクリック</RefLink>して、最新の楽曲データにおける変更点を確認できます。
            <Divider style={{margin:"8px 0"}}/>
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              onClick={this.updateButton}
              startIcon={<UpdateIcon/>}>
              今すぐ更新
            </Button>
            <Button onClick={this.handleToggle} color="secondary" fullWidth style={{marginTop:"8px"}}>
              閉じる
            </Button>
          </div>}
          {progress === 1 && <div>
            <Loader text={"更新しています"}/>
          </div>}
          {progress === 2 && <div>
            <div style={{display:"flex",alignItems:"center",margin:"20px 0",flexDirection:"column"}}>
              <CheckIcon style={{ fontSize: 60 }}/>
              <span>{res}</span>
            </div>
            <Button onClick={this.handleToggle} color="secondary" fullWidth style={{marginTop:"8px"}}>
              閉じる
            </Button>
          </div>}
        </DialogContent>
      </Dialog>
    );
  }
}
