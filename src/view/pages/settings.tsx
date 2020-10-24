import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl, FormattedMessage } from 'react-intl';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Basic from "@/view/components/settings/basic";
import View from "@/view/components/settings/view";
import Advanced from "@/view/components/settings/advanced";
import DebugData from "@/view/components/settings/debug";

interface S {
  currentTab:number
}

class Stats extends React.Component<{intl:any,global:any},S> {

  constructor(props:{intl:any,global:any}){
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

export default injectIntl(Stats);
