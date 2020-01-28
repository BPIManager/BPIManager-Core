import * as React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import {Link as RefLink} from '@material-ui/core/';
import { _lang, _currentDefaultPage } from '../../components/settings';
import GetAppIcon from '@material-ui/icons/GetApp';
import LanguageIcon from '@material-ui/icons/Language';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import PhonelinkSetupIcon from '@material-ui/icons/PhonelinkSetup';

class Index extends React.Component<RouteComponentProps,{}> {

  componentDidMount(){
    const def = _currentDefaultPage();
    if(def !== "home"){
        this.props.history.replace(def);
    }
  }

  render(){
    return (
      <div>
        <IfNotOnTheHomeScreen/>
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
    if(!this.state.show) return null;
    return (
      <Grid xs={12} sm={12} item className="indexGridsContainer fullWidth" style={{marginBottom:"30px"}}>
        <div className="indexGrids">
          <PhonelinkSetupIcon className="indexGridsIcon"/>
          <Typography component="h5" variant="h5" color="textPrimary" paragraph>
            ホーム画面に追加
          </Typography>
        </div>
        <Typography component="p" variant="body1" color="textPrimary" paragraph>
          スマートフォンのホーム画面に追加することで、より便利にお使いいただけます。
        </Typography>
        <img src="https://files.poyashi.me/1a0f22bf.png" alt="Description of adding to home screen" className="addImage"/>
      </Grid>
    )
  }
}

class IfNotOnTheHomeScreen extends React.Component<{},{show:boolean}>{

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
    //if(this.state.show) return null;
    return (
      <div className="heroLayout">
        <Container className="heroTitle">
          <Grid container spacing={4} style={{justifyContent:"center",alignItems:"center"}}>
            <Grid item xs={12} sm={3}>
              <img src="https://bpi.poyashi.me/images/icons/icon-192x192.png" style={{margin:"0 auto",display:"block",borderRadius:"8%",maxWidth:"120px"}} alt="BPIManager"/>
            </Grid>
            <Grid item xs={12} sm={4} md={5}>
              <div className="mdCentered">
                <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
                  <FormattedMessage id="Top.Title"/>
                </Typography>
                <Typography color="textSecondary" paragraph variant="caption">
                  {_lang() === "en" &&
                  <span>Check out <RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink> for update information.</span>
                  }
                  {_lang() === "ja" &&
                    <span>最新情報を<RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink>にて発信中</span>
                  }
                </Typography>
              </div>
            </Grid>
          </Grid>
        </Container>
        <AddToHomeScreenTicker/>
        <Container fixed>
          <div style={{marginTop:"15px"}}>
            <Grid container spacing={4} justify="space-between">
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
        <Container>
          <div style={{marginTop:"20px"}}>
            <Grid container spacing={2} justify="center">
              <Grid item>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
                  <FormattedMessage id="Index.notes1"/>
                </Typography>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
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
