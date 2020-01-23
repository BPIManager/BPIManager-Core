import * as React from 'react';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import { Link } from 'react-router-dom';
import {Link as RefLink, Card, CardContent} from '@material-ui/core/';
import { _lang } from '../../components/settings';
import ShareButtons from '../components/common/shareButtons';
const {LineShareButton,LineIcon,TwitterShareButton,TwitterIcon} = require('react-share');

export default class Index extends React.Component<{},{}> {

  buttonGrid = (data:{[key:string]:string})=>{
    return (
      <Grid item md={6} xs={12} key={data.id}>
        <Link to={data.url} style={{textDecoration:"none"}}>
          <Button fullWidth variant="contained" color="primary">
            <FormattedMessage id={data.id}/>
          </Button>
        </Link>
      </Grid>
    );
  }

  buttons:{[key:string]:string}[] = [
    {"url":"/data","id":"Index.importButton"},
    {"url":"/songs","id":"Index.songsListButton"},
    {"url":"/help","id":"Index.helpButton"},
  ];

  render(){
    return (
      <div className="heroLayout">
        <Container fixed>
          <Typography component="h3" variant="h3" align="center" color="textPrimary" gutterBottom>
            <FormattedMessage id="Top.Title"/>
          </Typography>
          <Typography align="center" color="textSecondary" paragraph variant="caption">
            beta ver0.0.2.9<br/>
            last update: 2020/01/23 JST
          </Typography>
          <AddToHomeScreenTicker/>
          <div>
            <Grid container spacing={2} justify="center">
              {this.buttons.map((item)=>this.buttonGrid(item))}
              <Grid item md={6} xs={12}>
                <RefLink target="_blank" rel="noopener noreferrer" color="secondary" href="https://forms.gle/Q7cJJYBXVjG8FHLFA">
                  <Button fullWidth variant="contained" color="secondary" style={{textDecoration:"none"}}>
                    <FormattedMessage id="Index.enqueteButton"/>
                  </Button>
                </RefLink>
              </Grid>
            </Grid>
          </div>
          <div style={{marginTop:"10px"}}>
            <Typography align="center" color="textSecondary" variant="caption" paragraph>
              気に入ったらシェアお願いします!
            </Typography>
            <ShareButtons withTitle={true}/>
          </div>
          <div style={{marginTop:"15px"}}>
            <Grid container spacing={2} justify="center">
              <Grid item>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
                  <FormattedMessage id="Index.notes1"/>
                </Typography>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
                  <FormattedMessage id="Index.notes2"/>
                </Typography>
                <Typography align="center" color="textSecondary" paragraph variant="caption">
                  {_lang() === "en" &&
                    <span>If you have encountered unintended behaviours or have opinions to make this tool much better, please contact <RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink>.</span>
                  }
                  {_lang() === "ja" &&
                    <span>バグ報告などは<RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink>までお寄せください。<br/>
                  バージョンアップ情報も同アカウントにて発信しています。</span>
                  }
                </Typography>
              </Grid>
            </Grid>
          </div>
        </Container>
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
      <Card style={{margin:"10px 0"}}>
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
            Tips:ホーム画面に追加してより便利に
          </Typography>
          <Typography variant="body2" component="p">
            <img src="https://files.poyashi.me/1a0f22bf.png" alt="Description of adding to home screen" className="addImage"/>
            本ツールはスマートフォンのホーム画面に追加して利用することを想定して作成されています。<br/>
            iPhoneをご利用の方は画像中央のボタンを押下し、「ホーム画面に追加」から追加できます。<br/>
            Androidをご利用中の方は「ホーム画面に BPIM を追加」から追加してください。
          </Typography>
          <Typography variant="body2" component="p">
            このメッセージはスマートフォンのブラウザでご覧になっている方に表示されています。
          </Typography>
        </CardContent>
      </Card>
    )
  }
}
