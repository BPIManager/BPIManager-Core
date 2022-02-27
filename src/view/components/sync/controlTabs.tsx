import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import SyncControlScreen from './control';
import SyncRivalScreen from './rival';
import PushSettings from "./pushNotifications";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ControlTab from '../syncSettings/control';
import { AppBar, Container } from '@mui/material';

interface P {
  userData:any
}

class SyncControlTab extends React.Component<P&RouteComponentProps,{currentTab:number}> {

  constructor(props:P&RouteComponentProps){
    super(props);
    const search = new URLSearchParams(props.location.search);
    this.state ={
      currentTab:Number(search.get("init")) || 0,
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
          scrollButtons
          textColor="secondary"
          allowScrollButtonsMobile>
            <Tab label="プロフィール" />
            <Tab label="データ" />
            <Tab label="ライバル" />
            <Tab label="プッシュ通知" />
          </Tabs>
        </AppBar>
        <Container fixed  className="commonLayout" id="stat">
          {this.state.currentTab === 0 && <ControlTab userData={this.props.userData}/>}
          {this.state.currentTab === 1 && <SyncControlScreen userData={this.props.userData}/>}
          {this.state.currentTab === 2 && <SyncRivalScreen/>}
          {this.state.currentTab === 3 && <PushSettings/>}
        </Container>
      </React.Fragment>
    );
  }
}

export default withRouter(SyncControlTab);
