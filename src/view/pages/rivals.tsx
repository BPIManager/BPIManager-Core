import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl, FormattedMessage } from 'react-intl';
import RivalView from "../components/rivals/view";
import ShowSnackBar from '../components/snackBar';
import RivalIndex from '../components/rivals';
import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle } from '../../components/settings';
import {Link as RefLink} from '@material-ui/core/';

interface S {
  currentView:number
  currentUser:any,
  message:string,
  showSnackBar:boolean,
  rivalMeta?:any,
  descendingRivalData?:any,
  lastVisible:any,
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      currentView:0,
      currentUser:null,
      message:"",
      showSnackBar:false,
      lastVisible:null,
    }
  }

  showEachRival = (rivalData:string)=> this.setState({currentView:1,currentUser:rivalData,rivalMeta:null,descendingRivalData:null,});
  compareUser = (rivalMeta:any,rivalBody:any,last:number,)=> this.setState({lastVisible:last,currentView:2,rivalMeta:rivalMeta,descendingRivalData:rivalBody});
  backToMainPage = ()=> this.setState({currentView:0,currentUser:null});
  toggleSnack = (message:string = "ライバルを削除しました")=> this.setState({message:message,showSnackBar:!this.state.showSnackBar});

  render(){
    const {currentView,currentUser,message,showSnackBar,rivalMeta,descendingRivalData,lastVisible} = this.state;
    return (
      <Container className="commonLayout" id="stat" fixed>
        {currentView === 0 &&
        <div>
          <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
            <FormattedMessage id="GlobalNav.Rivals"/>
          </Typography>
          <Typography component="p" variant="body2">
            <RefLink color="secondary" href="https://gist.github.com/potakusan/08c5528d6c6a51d10aec6b6556723a80"  target="_blank" rel="noopener noreferrer">ライバル機能の詳細はこちら</RefLink>。<br/>
            現在の設定:[version:{_currentStore()}] [mode:{_isSingle() === 1 ? "SP" : "DP"}]
          </Typography>
        </div>
        }
        {currentView === 0 && <RivalIndex showEachRival={this.showEachRival} compareUser={this.compareUser} backToRecentPage={!!this.state.rivalMeta} last={lastVisible}/>}
        {currentView === 1 && <RivalView toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} rivalData={currentUser}/>}
        {currentView === 2 && <RivalView toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} rivalData={rivalMeta.uid} rivalMeta={rivalMeta} descendingRivalData={descendingRivalData} isNotRival={true}/>}
        <ShowSnackBar message={message} variant="success"
            handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </Container>
    );
  }
}

export default injectIntl(Stats);
