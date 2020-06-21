import * as React from 'react';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RivalLists from "./list";
import RecentlyAdded from "./recent";
import { rivalScoreData, rivalStoreData, DBRivalStoreData } from '../../../types/data';
import fbActions from '../../../components/firebase/actions';
import Loader from '../common/loader';
import SyncLoginScreen from '../sync/login';

interface S {
  currentTab:number,
  isLoading:boolean,
  userData:any
}

interface P{
  showEachRival:(rivalMeta:DBRivalStoreData)=>void
  compareUser:(rivalMeta:rivalStoreData,rivalBody:rivalScoreData[],last:rivalStoreData,arenaRank:string,currentPage:number)=>void,
  backToRecentPage:number,
  last:rivalStoreData|null,
  arenaRank:string,
}

class RivalIndex extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      currentTab:props.backToRecentPage,
      isLoading:true,
      userData:null,
    }
  }

  async componentDidMount(){
    new fbActions().auth().onAuthStateChanged((user: any)=> {
      this.setState({userData:user,isLoading:false})
    });
  }

  handleChange = (_event: React.ChangeEvent<{}>|null, newValue: number) => {
    this.setState({currentTab:newValue});
  };

  render(){
    const {currentTab,isLoading,userData} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    if(!userData){
      return (<SyncLoginScreen mode={1}/>)
    }
    return (
      <div>
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="primary"
          variant="scrollable"
          scrollButtons="on"
          textColor="secondary"
          style={{margin:"5px 0"}}
        >
          <Tab label="一覧" />
          <Tab label="おすすめ" />
          <Tab label="逆ライバル" />
          <Tab label="最近更新" />
        </Tabs>
        {currentTab === 0 && <RivalLists showEachRival={this.props.showEachRival} changeTab={this.handleChange}/>}
        {/* 再レンダリングするため敢えてコピペしてる */}
        {currentTab === 1 && <RecentlyAdded mode={0} compareUser={this.props.compareUser} last={this.props.last} arenaRank={this.props.arenaRank}/>}
        {currentTab === 2 && <RecentlyAdded mode={1} compareUser={this.props.compareUser} last={this.props.last} arenaRank={this.props.arenaRank}/>}
        {currentTab === 3 && <RecentlyAdded mode={2} compareUser={this.props.compareUser} last={this.props.last} arenaRank={this.props.arenaRank}/>}
      </div>
    );
  }
}

export default RivalIndex;
