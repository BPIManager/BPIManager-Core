import * as React from 'react';
import { injectIntl } from 'react-intl';

import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle } from '../../../components/settings';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SongsUI from './viewComponents/ui';
import Settings from './viewComponents/settings';
import { scoresDB, rivalListsDB } from '../../../components/indexedDB';
import RivalStats from './viewComponents/stats';

interface S {
  isLoading:boolean,
  currentTab:number,
  full:any[],
}

interface P {
  intl:any,
  rivalData:any,
  backToMainPage:()=>void
  toggleSnack:()=>void,
  isNotRival?:boolean,
  rivalMeta?:any,
  descendingRivalData?:any,
}

class RivalLists extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      currentTab:0,
      full:[]
    }
  }

  async componentDidMount(){
    this.loadRivalData();
  }

  loadRivalData = async()=>{
    this.setState({isLoading:true});
    const {rivalData} = this.props;
    const allScores = (await new scoresDB().getAll()).reduce((groups:any,item)=>{
      groups[item.title + item.difficulty] = item;
      return groups;
    },{});
    const allRivalScores = (this.props.descendingRivalData || await new rivalListsDB().getAllScores(rivalData.uid)).reduce((groups:any,item:any)=>{
      groups[item.title + item.difficulty] = item;
      return groups;
    },{});
    return this.setState({
      isLoading:false,
      full:Object.keys(allRivalScores).reduce((groups:any,key:any)=>{
        if(allScores[key]){
          const mine = allScores[key];
          const rival = allRivalScores[key];
          groups.push({
            title:mine.title,
            difficulty:mine.difficulty,
            difficultyLevel:mine.difficultyLevel,
            myEx:mine.exScore,
            rivalEx:rival.exScore,
            myMissCount:mine.missCount,
            rivalMissCount:rival.missCount,
            myClearState:mine.clearState,
            rivalClearState:rival.clearState,
          });
        }
        return groups;
      },[])
    });
  }

  handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({currentTab:newValue});
  };

  render(){
    const {isLoading,currentTab,full} = this.state;
    const {rivalData,backToMainPage,isNotRival,rivalMeta} = this.props;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>);
    }
    return (
      <div>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <Button onClick={backToMainPage} style={{minWidth:"auto",padding:"6px 0px"}}><ArrowBackIcon/></Button>
          &nbsp;{rivalMeta ? rivalMeta.displayName : rivalData.rivalName}
        </Typography>
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="secondary"
          style={{margin:"5px 0"}}
        >
          <Tab label="比較" />
          <Tab label="統計" />
          {!isNotRival && <Tab label="設定" />}
        </Tabs>
        {currentTab === 0 && <SongsUI type={0} full={full} rivalData={rivalData}/>}
        {currentTab === 1 && <RivalStats full={full} rivalData={rivalData}/>}
        {(!isNotRival && currentTab === 2) && <Settings backToMainPage={this.props.backToMainPage} toggleSnack={this.props.toggleSnack} rivalData={rivalData}/>}
      </div>
    );
  }
}

export default injectIntl(RivalLists);
