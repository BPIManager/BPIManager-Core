import * as React from 'react';
import Container from '@material-ui/core/Container';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SyncControlScreen from './control';
import SyncRivalScreen from './rival';
import { RouteComponentProps, withRouter } from 'react-router-dom';

interface P {
  userData:any
}

class ControlTab extends React.Component<P&RouteComponentProps,{currentTab:number}> {

  constructor(props:P&RouteComponentProps){
    super(props);
    const search = new URLSearchParams(props.location.search);
    this.state ={
      currentTab:search.get("init") ? 1 : 0,
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
          <Tab label="ライバル" />
        </Tabs>
        {this.state.currentTab === 0 && <SyncControlScreen userData={this.props.userData}/>}
        {this.state.currentTab === 1 && <SyncRivalScreen/>}
      </Container>
    );
  }
}

export default withRouter(ControlTab);
