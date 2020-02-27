import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import Basic from "../components/settings/basic";
import View from "../components/settings/view";
import Advanced from "../components/settings/advanced";

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
      <Container className="commonLayout" id="stat" fixed>
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="secondary"
          style={{margin:"5px 0"}}
        >
          <Tab label="基本" />
          <Tab label="表示" />
          <Tab label="その他" />
        </Tabs>
        {this.state.currentTab === 0 && <Basic global={this.props.global}/>}
        {this.state.currentTab === 1 && <View global={this.props.global}/>}
        {this.state.currentTab === 2 && <Advanced global={this.props.global}/>}
      </Container>
    );
  }
}

export default injectIntl(Stats);
