import AppBar from "@mui/material/AppBar";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import React, { useState } from "react";
import Lists from "../lists";
import Songs from "../songs";
import NotPlayed from "../notPlayed";

const SongsIndex: React.FC<{ history: any; def: number }> = ({ def, history }) => {
  const [currentTab, setCurrentTab] = useState<number>(def || 0);
  const changeTab = (newValue: number) => {
    setCurrentTab(newValue);
    history.replace(newValue === 0 ? "/songs" : newValue === 1 ? "/notPlayed" : "/lists");
  };
  return (
    <>
      <AppBar position="static" className="subAppBar">
        <Tabs value={currentTab} onChange={(_event: React.ChangeEvent<{}>, newValue: number) => changeTab(newValue)} indicatorColor="secondary" variant="scrollable" scrollButtons textColor="secondary" allowScrollButtonsMobile>
          <Tab label="プレイ済み" />
          <Tab label="未プレイ" />
          <Tab label="リスト" />
        </Tabs>
      </AppBar>
      {currentTab === 0 && <Songs />}
      {currentTab === 1 && <NotPlayed />}
      {currentTab === 2 && <Lists />}
    </>
  );
};
export default SongsIndex;
