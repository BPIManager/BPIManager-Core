import React, { useState, useEffect } from 'react';
import Container from '@mui/material/Container';
import { injectIntl, FormattedMessage } from 'react-intl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import Basic from "@/view/components/settings/basic";
import View from "@/view/components/settings/view";
import Advanced from "@/view/components/settings/advanced";
import DebugData from "@/view/components/settings/debug";
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { AppBar } from '@mui/material';

const Settings: React.FC<{ intl: any, global: any } & RouteComponentProps> = (props) => {
  const [currentTab, setCurrentTab] = useState(0);
  const handleChangeTab = (_event: React.ChangeEvent<{}>, newValue: number) => {
    setCurrentTab(newValue);
  }

  useEffect(() => {

    const search = new URLSearchParams(props.location.search);
    const tab = Number(search.get("tab"));
    setCurrentTab(tab || 0);
  }, []);

  return (
    <React.Fragment>
      <AppBar position="static" className="subAppBar">
        <Tabs
          value={currentTab}
          onChange={handleChangeTab}
          indicatorColor="secondary"
          variant="scrollable"
          scrollButtons
          textColor="secondary"
          allowScrollButtonsMobile>
          <Tab label={<FormattedMessage id="Settings.Tabs.Common" />} />
          <Tab label={<FormattedMessage id="Settings.Tabs.View" />} />
          <Tab label={<FormattedMessage id="Settings.Tabs.Etc" />} />
          <Tab label={<FormattedMessage id="Settings.Tabs.Debug" />} />
        </Tabs>
      </AppBar>
      <Container fixed className="commonLayout" id="stat">
        {currentTab === 0 && <Basic global={props.global} />}
        {currentTab === 1 && <View global={props.global} />}
        {currentTab === 2 && <Advanced global={props.global} />}
        {currentTab === 3 && <DebugData />}
      </Container>
    </React.Fragment>
  );

}

export default withRouter(injectIntl(Settings));
