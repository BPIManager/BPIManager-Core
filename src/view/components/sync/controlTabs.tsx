import * as React from 'react';
import Container from '@material-ui/core/Container';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SyncControlScreen from './control';
import SyncRivalScreen from './rival';
import PushSettings from "./pushNotifications";
import { RouteComponentProps, withRouter } from 'react-router-dom';
import ControlTab from '../syncSettings/control';

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
      <Container fixed  className="commonLayout" id="stat">
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="secondary"
          variant="scrollable"
          scrollButtons="on"
          style={{margin:"5px 0"}}
        >
          <Tab label="プロフィール" />
          <Tab label="データ" />
          <Tab label="ライバル" />
          <Tab label="プッシュ通知" />
        </Tabs>
        {this.state.currentTab === 0 && <ControlTab userData={this.props.userData}/>}
        {this.state.currentTab === 1 && <SyncControlScreen userData={this.props.userData}/>}
        {this.state.currentTab === 2 && <SyncRivalScreen/>}
        {this.state.currentTab === 3 && <PushSettings/>}
      </Container>
    );
  }
}

export default withRouter(SyncControlTab);
