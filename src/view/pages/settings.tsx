import * as React from 'react';
import Container from '@mui/material/Container';
import { injectIntl, FormattedMessage } from 'react-intl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Basic from "@/view/components/settings/basic";
import View from "@/view/components/settings/view";
import Advanced from "@/view/components/settings/advanced";
import DebugData from "@/view/components/settings/debug";
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface S {
  currentTab:number
}

class Stats extends React.Component<{intl:any,global:any}&RouteComponentProps,S> {

  constructor(props:{intl:any,global:any}&RouteComponentProps){
    super(props);
    const search = new URLSearchParams(props.location.search);
    const tab = Number(search.get("tab"));
    this.state ={
      currentTab:tab || 0,
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
          style={{margin:"5px 0"}}
        >
          <Tab label={<FormattedMessage id="Settings.Tabs.Common"/>} />
          <Tab label={<FormattedMessage id="Settings.Tabs.View"/>} />
          <Tab label={<FormattedMessage id="Settings.Tabs.Etc"/>} />
          <Tab label={<FormattedMessage id="Settings.Tabs.Debug"/>} />
        </Tabs>
        {this.state.currentTab === 0 && <Basic global={this.props.global}/>}
        {this.state.currentTab === 1 && <View global={this.props.global}/>}
        {this.state.currentTab === 2 && <Advanced global={this.props.global}/>}
        {this.state.currentTab === 3 && <DebugData/>}
      </Container>
    );
  }
}

export default withRouter(injectIntl(Stats));
