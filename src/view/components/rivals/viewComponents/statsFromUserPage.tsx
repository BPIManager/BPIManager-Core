import React from "react";

//import Tabs from '@mui/material/Tabs';
//import Tab from '@mui/material/Tab';
//import Main from "@/view/components/stats/main";
import { rivalScoreData } from "@/types/data";
import Container from "@mui/material/Container/Container";
import RivalStats from "./stats";
import { withRivalData } from "@/components/stats/radar";

interface S {
  currentTab: number;
}

interface P {
  full: withRivalData[];
  rivalRawData: rivalScoreData[];
}

class RivalStatViewFromUserPage extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      currentTab: 0,
    };
  }

  handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({ currentTab: newValue });
  };

  render() {
    //const {currentTab} = this.state;
    const { full, rivalRawData } = this.props;
    return (
      <Container className="commonLayout">
        <RivalStats full={full} rivalRawData={rivalRawData} />
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
