import * as React from 'react';
import Container from '@mui/material/Container';
import { injectIntl } from 'react-intl';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import NotesRecent from '../components/notes/recent';
import NotesLiked from '../components/notes/liked';
import MyNotes from '../components/notes/mynotes';
import WriteNotes from '../components/notes/writeNotes';
import { AppBar } from '@mui/material';

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
      <React.Fragment>
        <AppBar position="static" className="subAppBar">
          <Tabs
            value={this.state.currentTab}
            onChange={this.handleChange}
            indicatorColor="secondary"
            variant="scrollable"
            scrollButtons
            textColor="secondary"
            allowScrollButtonsMobile>
            <Tab label="最新の投稿" />
            <Tab label="書き込む・探す" />
            <Tab label="いいねした投稿" />
            <Tab label="Myノート" />
          </Tabs>
        </AppBar>
        <Container fixed  className="commonLayout" id="stat">
          {this.state.currentTab === 0 && <NotesRecent/>}
          {this.state.currentTab === 1 && <WriteNotes/>}
          {this.state.currentTab === 2 && <NotesLiked/>}
          {this.state.currentTab === 3 && <MyNotes/>}
          </Container>
      </React.Fragment>
    );
  }
}

export default injectIntl(Tools);
