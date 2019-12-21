import * as React from 'react';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import RivalLists from "./list";
import RecentlyAdded from "./recent";

interface S {
  currentTab:number,
}

interface P{
  showEachRival:(input:string)=>void
  compareUser:(rivalMeta:any,rivalBody:any,last:any,arenaRank:string)=>void,
  backToRecentPage:boolean,
  last:any,
  arenaRank:string,
}

class RivalIndex extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      currentTab:props.backToRecentPage ? 1 : 0,
    }
  }

  handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({currentTab:newValue});
  };

  render(){
    const {currentTab} = this.state;
    return (
      <div>
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="secondary"
          style={{margin:"5px 0"}}
        >
          <Tab label="一覧" />
          <Tab label="探す" />
        </Tabs>
        {currentTab === 0 && <RivalLists showEachRival={this.props.showEachRival}/>}
        {currentTab === 1 && <RecentlyAdded compareUser={this.props.compareUser} last={this.props.last} arenaRank={this.props.arenaRank}/>}
      </div>
    );
  }
}

export default RivalIndex;
