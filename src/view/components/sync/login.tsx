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
        <a href="#" onClick={()=>this.fbA.authWithTwitter()} style={{textDecoration:"none"}}>
          <Button
            variant="outlined"
            color="secondary"
            style={{width:"100%"}}
            startIcon={<TwitterIcon />}>
            SIGN IN
          </Button>
        </a>
        <Divider style={{margin:"10px 0"}}/>
        <Typography component="p" variant="caption" style={{textAlign:"center"}} gutterBottom>
          これはデバイス内に蓄積されたスコアデータやスコアの更新履歴をWeb上に保管するための機能です。<br/>
          アップロードされたデータは、いつ・どの端末からでもダウンロードし使用することが可能です。
        </Typography>
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
