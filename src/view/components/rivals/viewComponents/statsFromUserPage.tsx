import * as React from 'react';

import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Button from '@material-ui/core/Button';
//import Tabs from '@material-ui/core/Tabs';
//import Tab from '@material-ui/core/Tab';
//import Main from "@/view/components/stats/main";
import { rivalScoreData } from '@/types/data';
import Container from '@material-ui/core/Container/Container';
import RivalStats from './stats';
import { withRivalData } from '@/components/stats/radar';

interface S {
  currentTab:number,
}

interface P {
  backToMainPage:()=>void,
  full:withRivalData[],
  rivalRawData:rivalScoreData[],
  name:string
}

class RivalStatViewFromUserPage extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      currentTab:0,
    }
  }

  handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({currentTab:newValue});
  };

  render(){
    //const {currentTab} = this.state;
    const {backToMainPage,full,rivalRawData,name} = this.props;
    return (
      <Container fixed  className="commonLayout">
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <Button onClick={backToMainPage} style={{minWidth:"auto",padding:"6px 0px"}}><ArrowBackIcon/></Button>
          &nbsp;{name}
        </Typography>
        <RivalStats full={full} rivalRawData={rivalRawData}/>
        {/*
        <Tabs
          value={this.state.currentTab}
          onChange={this.handleChange}
          indicatorColor="primary"
          textColor="secondary"
          style={{margin:"5px 0"}}
        >
          <Tab label="統計" />
          <Tab label="比較" />
        </Tabs>
        {currentTab === 0 && <Main derived={rivalRawData} />}
        {currentTab === 1 && <RivalStats full={full} rivalRawData={rivalRawData}/>}
      */}
      </Container>
    );
  }
}

export default RivalStatViewFromUserPage;
