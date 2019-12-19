import * as React from 'react';
import { injectIntl } from 'react-intl';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { deepOrange, deepPurple,pink,lightGreen,amber } from '@material-ui/core/colors';
import AddIcon from '@material-ui/icons/Add';
import theme from '../../../themes/dark';
import Fab from '@material-ui/core/Fab';
import MoreVertIcon from '@material-ui/icons/MoreVert';

interface S {
  currentTab:number
}

class RivalLists extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
  }

  render(){
    return (
      <div>
        <p>まだライバルがいません。</p>
        <RivalComponent/>
        <RivalComponent/>
        <RivalComponent/>
        <RivalComponent/>
        <Fab color="secondary" aria-label="add" style={{position:"fixed","bottom":"5%","right":"3%"}}>
          <AddIcon />
        </Fab>
      </div>
    );
  }
}

interface CP {

}

class RivalComponent extends React.Component<CP,{}> {

  render(){
    const text = <p>スコア: 100 Win 100 Lose 3 Draw<br/>クリア: 300 Win 300 Lose 100 Draw<br/>最終更新: lastUpdate</p>
    return (
      <div style={{margin:"10px 0 0 0"}}>
        <Paper>
          <ListItem button>
            <ListItemAvatar>
              <Avatar style={{backgroundColor:deepOrange[500],color:theme.palette.getContrastText(deepOrange[500])}}>
                P
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary="PakuPakuUnkoMan" secondary={text} />
          </ListItem>
        </Paper>
      </div>
    );
  }
}

export default injectIntl(RivalLists);
