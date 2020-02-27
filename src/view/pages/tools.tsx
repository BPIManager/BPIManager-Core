import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';

import SUDPlus from "../components/tools/sudplus";
import BPICalc from "../components/tools/bpi";

interface S {
  currentTab:number
}

class Tools extends React.Component<{intl:any},S> {

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
      <Container className="commonLayout" id="stat" fixed>
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="secondary"
          style={{margin:"5px 0"}}
        >
          <Tab label="緑数字計算機" />
          <Tab label="BPI計算機" />
        </Tabs>
        {this.state.currentTab === 0 && <SUDPlus/>}
        {this.state.currentTab === 1 && <BPICalc/>}
      </Container>
    );
  }
}

export default injectIntl(Tools);
