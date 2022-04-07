import React, { useState } from 'react';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Main from "@/view/components/stats/main";
import MyBest from "@/view/components/stats/mybest";
import Radar from "@/view/components/stats/radar";
import Shift from '@/view/components/stats/shift';
import { AppBar } from '@mui/material';

const Stats: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);
  return (
    <React.Fragment>
      <AppBar position="static" className="subAppBar">
        <Tabs
          value={currentTab}
          onChange={(_event: React.ChangeEvent<{}>, newValue: number) => setCurrentTab(newValue)}
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons
          textColor="secondary"
          allowScrollButtonsMobile>
          <Tab label="基本" />
          <Tab label="レーダー" />
          <Tab label="推移" />
          <Tab label="自己歴代" />
        </Tabs>
      </AppBar>
      <Container fixed className="commonLayout" id="stat">
        {currentTab === 0 && <Main />}
        {currentTab === 1 && <Radar />}
        {currentTab === 2 && <Shift />}
        {currentTab === 3 && <MyBest />}
      </Container>
    </React.Fragment >
  );

}

export default Stats;
