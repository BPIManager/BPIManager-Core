import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import fbActions from '../../../components/firebase/actions';

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
        <p style={{textAlign:"center"}}>-&nbsp;連携方法を選択&nbsp;-</p>
        <div style={{display:"block"}}>
        <a href="#twitter" onClick={()=>this.fbA.authWithTwitter()} style={{textDecoration:"none",display:"block",width:"100%"}}>
          <Button
            variant="outlined"
            color="secondary"
            style={{width:"100%"}}>
            Twitter
          </Button>
        </a>
        <a href="#google" onClick={()=>this.fbA.authWithGoogle()} style={{textDecoration:"none",display:"block",width:"100%",margin:"5px 0"}}>
          <Button
            variant="outlined"
            color="secondary"
            style={{width:"100%"}}>
            Google
          </Button>
        </a>
        </div>
        <Divider style={{margin:"10px 0"}}/>
        <Typography component="p" variant="caption" style={{textAlign:"center"}} gutterBottom>
          これはデバイス内に蓄積されたスコアデータやスコアの更新履歴をWeb上に保管するための機能です。<br/>
          アップロードされたデータは、いつ・どの端末からでもダウンロードし使用することが可能です。
        </Typography>
        <Divider style={{margin:"10px 0"}}/>
      </div>
    );
  }
}

export default SyncLoginScreen;
