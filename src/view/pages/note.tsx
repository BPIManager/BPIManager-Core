import React, { useState } from "react";
import Container from "@mui/material/Container";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import NotesRecent from "../components/notes/recent";
import NotesLiked from "../components/notes/liked";
import MyNotes from "../components/notes/mynotes";
import WriteNotes from "../components/notes/writeNotes";
import AppBar from "@mui/material/AppBar";

const Notes: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<number>(0);

  return (
    <React.Fragment>
      <AppBar position="static" className="subAppBar">
        <Tabs value={currentTab} onChange={(_event: React.ChangeEvent<{}>, newValue: number) => setCurrentTab(newValue)} indicatorColor="secondary" variant="scrollable" scrollButtons textColor="secondary" allowScrollButtonsMobile>
          <Tab label="最新の投稿" />
          <Tab label="書き込む・探す" />
          <Tab label="いいねした投稿" />
          <Tab label="Myノート" />
        </Tabs>
      </AppBar>
      <Container fixed className="commonLayout" id="stat">
        {currentTab === 0 && <NotesRecent />}
        {currentTab === 1 && <WriteNotes />}
        {currentTab === 2 && <NotesLiked />}
        {currentTab === 3 && <MyNotes />}
      </Container>
    </React.Fragment>
  );
};

export default Notes;
