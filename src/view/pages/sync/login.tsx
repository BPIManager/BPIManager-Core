import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import fbActions from '../../../components/firebase/actions';
import TwitterIcon from '@material-ui/icons/Twitter';

class SyncLoginScreen extends React.Component<{},{}> {

  private fbA:fbActions = new fbActions();

  render(){
    return (
      <div>
        <Typography component="h6" variant="h6" color="textPrimary" style={{textAlign:"center"}}>
          <FormattedMessage id="Sync.Login.needLogin"/>
        </Typography>
        <Typography component="p" variant="caption" style={{textAlign:"center"}} gutterBottom>
          <FormattedMessage id="Sync.Login.description"/>
        </Typography>
        <Divider style={{margin:"10px 0"}}/>
        <Button
          variant="outlined"
          color="secondary"
          style={{width:"100%"}}
          onClick={()=>this.fbA.authWithTwitter()}
          startIcon={<TwitterIcon />}>
          SIGN IN
        </Button>
        <Divider style={{margin:"10px 0"}}/>
        <Typography component="p" variant="caption" style={{textAlign:"center"}} gutterBottom>
          <FormattedMessage id="Sync.Login.note1"/><br/>
          <FormattedMessage id="Sync.Login.note2"/>
        </Typography>
      </div>
    );
  }
}

export default SyncLoginScreen;
