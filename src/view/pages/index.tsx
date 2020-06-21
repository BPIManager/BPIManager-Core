import * as React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {Link as RefLink, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction, IconButton, List} from '@material-ui/core/';
import { _lang, _currentVersion, _currentTheme } from '../../components/settings';
import GetAppIcon from '@material-ui/icons/GetApp';
import LanguageIcon from '@material-ui/icons/Language';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import PhonelinkSetupIcon from '@material-ui/icons/PhonelinkSetup';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic';
import HelpIcon from '@material-ui/icons/Help';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import Alert from '@material-ui/lab/Alert/Alert';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';

class Index extends React.Component<RouteComponentProps,{}> {

  render(){
    return (
      <div>
        <IfNotOnTheHomeScreen history={this.props.history}/>
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
  history:any
},{
  show:boolean,
  showUpdate:boolean,
  latestVersion:string,
  updateInfo:string,
}>{

  constructor(props:{history:any}){
    super(props);
    const isStandAloneIn_iOS = () =>("standalone" in window.navigator) && (window.navigator["standalone"]);
    const isStandAloneInAndroid = ()=>window.matchMedia('(display-mode: standalone)').matches;
    const isPC = ()=> navigator.userAgent.indexOf('iPhone') === -1 && navigator.userAgent.indexOf('iPod') === -1 && navigator.userAgent.indexOf('Android') === -1;

    const regEx = (ua:RegExp)=> ua.test(window.navigator.userAgent.toLowerCase());

    this.state = {
      show:isPC() ? true : (regEx(/iphone|ipad|ipod/) && !isStandAloneIn_iOS()) ? true : (regEx(/android/) && !isStandAloneInAndroid()) ? true : false,
      showUpdate:false,
      latestVersion:"",
      updateInfo:"",
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

  render(){
    const {show,showUpdate,latestVersion,updateInfo} = this.state;
    const navBar = [
      {
        to:"/help",
        id:"Top.Help",
        icon:<HelpIcon />
      },
      {
        to:"/data",
        id:"GlobalNav.Data",
        icon:<SaveAltIcon />
      },
      {
        to:"/songs",
        id:"GlobalNav.SongList",
        icon:<LibraryMusicIcon />
      }
    ]
    const themeColor = _currentTheme();
    const avatarBgColor = themeColor === "light" ? "#efefef" : "rgba(255, 255, 255, 0.05)";
    const avatarFontColor = themeColor === "light" ? "#222" : "#efefef";
    return (
      <div className="heroLayout">
        <Container className="heroTitle">
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
                <Typography color="textSecondary" paragraph variant="caption">
                  {_lang() === "en" &&
                  <span>Check out <RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink> for update information.</span>
                  }
                  {_lang() === "ja" &&
                    <span>最新情報を<RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink>にて発信中</span>
                  }<br/>
                </Typography>
              </div>
            </Grid>
          </Grid>
          {showUpdate && (
            <Alert variant="outlined" severity="info"
              action={
                <Button color="inherit" size="small" onClick={()=>window.open(updateInfo)}>
                  詳細
                </Button>
              }>
              最新の楽曲データを利用可能です({latestVersion})。<br/>設定からアップデートしてください。
            </Alert>
          )}
        </Container>
        {show && <div>
        <Container fixed>
          <AddToHomeScreenTicker/>
          <div style={{marginTop:"25px"}}>
            <Grid container justify="space-between">
              <Grid xs={12} sm={4} item className="indexGridsContainer">
                <div className="indexGrids">
                  <GetAppIcon className="indexGridsIcon"/>
                  <Typography component="h5" variant="h5" color="textPrimary" paragraph>
                    簡単操作
                  </Typography>
                </div>
                <Typography component="p" variant="body1" color="textPrimary" paragraph>
                  データのインポートは一瞬で完了します。<br/>
                </Typography>
                <Link to="/data">
                  <Button variant="outlined" color="secondary">
                    インポート
                  </Button>
                </Link>
              </Grid>
              <Grid xs={12} sm={4} item className="indexGridsContainer">
                <div className="indexGrids">
                  <LanguageIcon className="indexGridsIcon"/>
                  <Typography component="h5" variant="h5" color="textPrimary" paragraph>
                    充実の機能
                  </Typography>
                </div>
                <Typography component="p" variant="body1" color="textPrimary" paragraph>
                  「ライバル」機能など、モチベーションを高める機能を多数搭載。<br/>
                  昨日までの自分と、新たなライバルに打ち勝とう。
                </Typography>
                <Link to="/rivals">
                  <Button variant="outlined" color="secondary">
                    ライバル
                  </Button>
                </Link>
              </Grid>
              <Grid xs={12} sm={4} item className="indexGridsContainer">
                <div className="indexGrids">
                  <VerifiedUserIcon className="indexGridsIcon"/>
                  <Typography component="h5" variant="h5" color="textPrimary" paragraph>
                    データ保護
                  </Typography>
                </div>
                <Typography component="p" variant="body1" color="textPrimary" paragraph>
                  お持ちのSNSアカウントと連携して、スコアを保管しましょう。<br/>
                  たとえ公式サイトがクローズしても、いつでもスコアを確認できます。
                </Typography>
                <Link to="/sync">
                  <Button variant="outlined" color="secondary">
                    Sync
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </div>
        </Container>
      </div>}
      <List>
        {navBar.map((item,i)=>(
          <ListItem button key={i} onClick={()=>this.props.history.push(item.to)}>
            <ListItemAvatar>
              <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                {item.icon}
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={<FormattedMessage id={item.id}/>} secondary={""} />
            <ListItemSecondaryAction>
              <IconButton edge="end">
                <ArrowForwardIosIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
        <ListItem button
          onClick={()=>window.open("https://docs.google.com/forms/d/e/1FAIpQLSfhJkZZp5K1ChbE5RH-f0hOIkGvGX-7tYCZMxzVlsHVAtZ6eg/viewform?usp=sf_link")}>
          <ListItemAvatar>
            <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
              <QuestionAnswerIcon/>
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary={"アンケートにご協力ください！"} secondary={"機能改善のため簡単なアンケートにご協力お願いします。"} />
          <ListItemSecondaryAction>
            <IconButton edge="end">
              <ArrowForwardIosIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      </List>
      <Container>
        <div style={{marginTop:"20px"}}>
          <Grid container justify="center">
            <Grid item>
              <Typography align="center" color="textSecondary" paragraph variant="caption">
                <FormattedMessage id="Index.notes1"/>
              </Typography>
              <Typography align="center" color="textSecondary" paragraph variant="caption">
                <FormattedMessage id="Index.notes2"/>
              </Typography>
              <Typography align="center" color="textSecondary" paragraph variant="caption">
                English ver. is now available! Go to settings and there you can change the language used in this app.
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
