import * as React from 'react';

import Typography from '@material-ui/core/Typography';
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
import { scoreData, rivalScoreData, rivalStoreData, DBRivalStoreData } from '../../../types/data';
import { withRivalData } from '../common/radar';

interface S {
  isLoading:boolean,
  currentTab:number,
  full:withRivalData[],
}

interface P {
  rivalData:string,
  backToMainPage:()=>void
  toggleSnack:()=>void,
  isNotRival?:boolean,
  rivalMeta:rivalStoreData|DBRivalStoreData|null,
  descendingRivalData?:rivalScoreData[],
  showAllScore:boolean,
}

class RivalView extends React.Component<P,S> {

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
    const {rivalData,showAllScore} = this.props;
    const allScores = (await new scoresDB().getAll()).reduce((groups:{[key:string]:scoreData},item:scoreData)=>{
      groups[item.title + item.difficulty] = item;
      return groups;
    },{});
    const allRivalScores = (this.props.descendingRivalData || await new rivalListsDB().getAllScores(rivalData)).reduce((groups:{[key:string]:rivalScoreData},item:rivalScoreData)=>{
      groups[item.title + item.difficulty] = item;
      return groups;
    },{});
    return this.setState({
      isLoading:false,
      full:Object.keys(allRivalScores).reduce((groups:withRivalData[],key:string)=>{
        const mine = allScores[key] || {
          exScore:0,
          missCount:NaN,
          clearState:7,
          updatedAt:"-",
        };
        if(showAllScore || mine.exScore !== 0){
          const rival = allRivalScores[key];
          groups.push({
            title:rival.title,
            difficulty:rival.difficulty,
            difficultyLevel:rival.difficultyLevel,
            myEx:mine.exScore,
            rivalEx:rival.exScore,
            myMissCount:mine.missCount,
            rivalMissCount:rival.missCount,
            myClearState:mine.clearState,
            rivalClearState:rival.clearState,
            myLastUpdate:mine.updatedAt,
            rivalLastUpdate:rival.updatedAt,
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
    const {backToMainPage,isNotRival,rivalMeta,showAllScore} = this.props;
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
          &nbsp;{rivalMeta && (isNotRival ? (rivalMeta as rivalStoreData).displayName : (rivalMeta as DBRivalStoreData).rivalName)}
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
        {currentTab === 0 && <SongsUI showAllScore={showAllScore} type={0} full={full}/>}
        {currentTab === 1 && <RivalStats full={full}/>}
        {(rivalMeta && !isNotRival && currentTab === 2) && <Settings backToMainPage={this.props.backToMainPage} toggleSnack={this.props.toggleSnack} rivalMeta={rivalMeta as DBRivalStoreData}/>}
      </div>
    );
  }
}

export default RivalView;
