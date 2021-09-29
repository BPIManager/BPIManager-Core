import * as React from 'react';
import Container from '@mui/material/Container';
import { injectIntl } from 'react-intl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Main from "@/view/components/stats/main";
import Scatter from "@/view/components/stats/scatter";
import MyBest from "@/view/components/stats/mybest";
import Radar from "@/view/components/stats/radar";
import Shift from '@/view/components/stats/shift';
import { AppBar } from '@mui/material';

interface S {
  currentTab:number
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      currentTab:0,
    }
  }

  handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({currentTab:newValue});
  };

  render(){
    return (
      <React.Fragment>
        <AppBar position="static" className="subAppBar">
          <Tabs
            value={this.state.currentTab}
            onChange={this.handleChange}
            indicatorColor="secondary"
            variant="scrollable"
            scrollButtons centered
            textColor="secondary"
            allowScrollButtonsMobile>
            <Tab label="基本" />
            <Tab label="レーダー" />
            <Tab label="推移" />
            <Tab label="分布" />
            <Tab label="自己歴代" />
          </Tabs>
        </AppBar>
        <Container fixed  className="commonLayout" id="stat">
          {this.state.currentTab === 0 && <Main/>}
          {this.state.currentTab === 1 && <Radar/>}
          {this.state.currentTab === 2 && <Shift/>}
          {this.state.currentTab === 3 && <Scatter/>}
          {this.state.currentTab === 4 && <MyBest/>}
        </Container>
      </React.Fragment>
    );
  }
}

export default injectIntl(Stats);
