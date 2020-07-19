import * as React from 'react';
import { FormattedMessage } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import fbActions from '@/components/firebase/actions';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import ListSubheader from '@material-ui/core/ListSubheader';
import LockIcon from '@material-ui/icons/Lock';
import Avatar from '@material-ui/core/Avatar';
import { avatarFontColor, avatarBgColor } from '@/components/common';

class SyncLoginScreen extends React.Component<{
  mode:number
},{}> {

  private fbA:fbActions = new fbActions();

  render(){
    const {mode} = this.props;
    return (
      <Paper style={{padding:"15px"}}>
        <Avatar style={{background:avatarBgColor,color:avatarFontColor,margin:"10px auto",padding:"35px",fontSize:"25px"}}>
          <LockIcon fontSize="large"/>
        </Avatar>
        <Typography component="h6" variant="h6" color="textPrimary" style={{textAlign:"center"}}>
          <FormattedMessage id="Sync.Login.needLogin"/>
        </Typography>
        <List
          subheader={
            <ListSubheader component="div" disableSticky>
              連携サービスを選択
            </ListSubheader>
          }>
          {[
            {name:"Twitter",func:()=>this.fbA.authWithTwitter(),desc:""},
            {name:"Google",func:()=>this.fbA.authWithGoogle(),desc:""}
          ].map((item,i)=>{
            return (
              <ListItem key={i} button onClick={item.func}>
                <ListItemText primary={item.name} secondary={item.desc} />
                <ListItemSecondaryAction onClick={item.func}>
                  <IconButton edge="end">
                    <ArrowForwardIosIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )
          })
        }
        </List>
        {mode === 0 && <div>
          <Divider style={{margin:"10px 0"}}/>
          <Typography component="p" variant="caption" gutterBottom>
            デバイス内に蓄積されたスコアデータやスコアの更新履歴をWeb上に保管します。<br/>
            アップロードされたデータは、いつ・どの端末からでもダウンロードし使用することが可能です。<br/>
            その他、ライバル機能やプッシュ通知などの追加機能が開放され、より便利に本サービスをお使いいただけます。
          </Typography>
          <Typography component="p" variant="caption" gutterBottom>
            <FormattedMessage id="Sync.Login.description"/>
          </Typography>
        </div>}
        {mode === 1 && <div>
          <Divider style={{margin:"10px 0"}}/>
          <Typography component="p" variant="caption" gutterBottom>
            ライバル機能をご利用いただくためには、SNSとの連携が必要です。
          </Typography>
          <Typography component="p" variant="caption" gutterBottom>
            <FormattedMessage id="Sync.Login.description"/>
          </Typography>
        </div>}
      </Paper>
    );
  }
}

export default SyncLoginScreen;
