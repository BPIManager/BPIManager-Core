import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl, FormattedMessage } from 'react-intl';
import RivalView from "../components/rivals/view";
import ShowSnackBar from '../components/snackBar';
import RivalIndex from '../components/rivals';
import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle } from '../../components/settings';
import {Link as RefLink} from '@material-ui/core/';
import { rivalScoreData, rivalStoreData, DBRivalStoreData } from '../../types/data';

interface S {
  currentView:number
  currentUser:string,
  message:string,
  showSnackBar:boolean,
  rivalMeta:DBRivalStoreData|rivalStoreData|null,
  descendingRivalData?:rivalScoreData[],
  lastVisible:rivalStoreData|null,
  arenaRank:string,
  recentView:number,
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      currentView:0,
      currentUser:"",
      message:"",
      showSnackBar:false,
      lastVisible:null,
      arenaRank:"すべて",
      recentView:0,
      rivalMeta:null,
    }
  }

  showEachRival = (rivalMeta:DBRivalStoreData)=> this.setState({recentView:0,currentView:1,currentUser:rivalMeta.uid,rivalMeta:rivalMeta,descendingRivalData:[],});
  compareUser = (rivalMeta:rivalStoreData,rivalBody:rivalScoreData[],last:rivalStoreData,arenaRank:string)=> {
    return this.setState({recentView:1,lastVisible:last,currentView:2,rivalMeta:rivalMeta,descendingRivalData:rivalBody,arenaRank:arenaRank});
  }
  backToMainPage = ()=> this.setState({currentView:0,currentUser:""});
  toggleSnack = (message:string = "ライバルを削除しました")=> this.setState({message:message,showSnackBar:!this.state.showSnackBar});

  render(){
    const {currentView,currentUser,message,showSnackBar,rivalMeta,descendingRivalData,lastVisible,arenaRank,recentView} = this.state;
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
        {currentView === 0 && <RivalIndex showEachRival={this.showEachRival} compareUser={this.compareUser} backToRecentPage={recentView} last={lastVisible} arenaRank={arenaRank}/>}
        {(rivalMeta && currentView === 1) && <RivalView showAllScore={false} toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} rivalData={currentUser} rivalMeta={rivalMeta}/>}
        {(rivalMeta && currentView === 2) && <RivalView showAllScore={false} toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} rivalData={rivalMeta.uid} rivalMeta={rivalMeta} descendingRivalData={descendingRivalData} isNotRival={true}/>}
        <ShowSnackBar message={message} variant="success"
            handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </Container>
    );
  }
}

export default injectIntl(Stats);
