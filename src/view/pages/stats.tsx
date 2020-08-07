import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Main from "@/view/components/stats/main";
import Scatter from "@/view/components/stats/scatter";
import MyBest from "@/view/components/stats/mybest";
import Radar from "@/view/components/stats/radar";
import Shift from '@/view/components/stats/shift';

interface S {
  currentTab:number
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      currentTab:2,
    }
  }

  handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({currentTab:newValue});
  };

  render(){
    return (
      <Container className="commonLayout" id="stat" fixed>
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="secondary"
          style={{margin:"5px 0"}}
        >
          <Tab label="基本" />
          <Tab label="レーダー" />
          <Tab label="推移" />
          <Tab label="分布" />
          <Tab label="歴代" />
        </Tabs>
        {this.state.currentTab === 0 && <Main/>}
        {this.state.currentTab === 1 && <Radar/>}
        {this.state.currentTab === 2 && <Shift/>}
        {this.state.currentTab === 3 && <Scatter/>}
        {this.state.currentTab === 4 && <MyBest/>}
      </Container>
    );
  }
}

export default injectIntl(Stats);
