import * as React from 'react';

import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import RivalLists from "./list";
import RecentlyAdded from "./recent";
import { rivalScoreData, rivalStoreData, DBRivalStoreData } from '@/types/data';
import Container from '@mui/material/Container';
import AppBar from '@mui/material/AppBar';

interface S {
  currentTab:number,
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
    }
  }

  handleChange = (_event: React.ChangeEvent<{}>|null, newValue: number) => {
    this.setState({currentTab:newValue});
  };

  render(){
    const {currentTab} = this.state;
    return (
      <React.Fragment>
        <AppBar position="static" className="subAppBar">
          <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="secondary"
          variant="scrollable"
          textColor="secondary"
          scrollButtons centered
          allowScrollButtonsMobile>
            <Tab label="一覧" />
            <Tab label="おすすめ" />
            <Tab label="逆ライバル" />
            <Tab label="探す" />
          </Tabs>
        </AppBar>
        <Container fixed  style={{margin:"20px auto"}}>
          {currentTab === 0 && <RivalLists showEachRival={this.props.showEachRival} changeTab={this.handleChange}/>}
          {/* 再レンダリングするため敢えてコピペしてる */}
          {currentTab === 1 && <RecentlyAdded mode={0} compareUser={this.props.compareUser} last={this.props.last} arenaRank={this.props.arenaRank}/>}
          {currentTab === 2 && <RecentlyAdded mode={1} compareUser={this.props.compareUser} last={this.props.last} arenaRank={this.props.arenaRank}/>}
          {currentTab === 3 && <RecentlyAdded mode={2} compareUser={this.props.compareUser} last={this.props.last} arenaRank={this.props.arenaRank}/>}
        </Container>
      </React.Fragment>
    );
  }
}

export default RivalIndex;
