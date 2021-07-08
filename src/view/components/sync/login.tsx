import * as React from 'react';
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
import Alert from '@material-ui/lab/Alert/Alert';

class SyncLoginScreen extends React.Component<{
  mode:number
},{}> {

  private fbA:fbActions = new fbActions();

  render(){
    return (
    <React.Fragment>
      <Paper style={{padding:"15px"}}>
        <Avatar style={{background:avatarBgColor,color:avatarFontColor,margin:"10px auto",padding:"35px",fontSize:"25px"}}>
          <LockIcon fontSize="large"/>
        </Avatar>
        <Typography component="h5" variant="h5" style={{textAlign:"center",marginTop:"10px"}}>
          ログイン
        </Typography>
        <Divider style={{margin:"10px 0"}}/>
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
                <ListItemText primary={<span>{item.name}でログイン</span>} secondary={item.desc} />
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
        <Divider style={{margin:"10px 0"}}/>
        <Typography component="p" variant="caption" gutterBottom>
          <b>ログインでできること</b>
        </Typography>
          <ul className="MuiTypography-caption">
            <li>スコアデータのクラウドへの永久保存</li>
            <li>BPIやアリーナランクに基づき、実力の近いライバルを探す</li>
            <li>Notesやウィークリーランキングへの参加を通した他ユーザーとの交流、モチベーション管理</li>
          </ul>
        <Alert severity="info">
        <Typography component="p" variant="caption" gutterBottom>
          TwitterまたはGoogleを通したOAuthログインに対応しています。連携したSNSアカウントのデータはユーザー識別に用いられ、連携先アカウントにおいて自動的に投稿を作成したり、プロフィールを編集する権限はありません。<br/>
          BPIManagerアカウントの作成に際し、利用規約およびプライバシーポリシーへの同意があったものとみなします。<br/>
          利用規約等の確認事項は「ヘルプ」よりご確認いただけます。
        </Typography>
        </Alert>
      </Paper>
      </React.Fragment>
    );
  }
}

export default SyncLoginScreen;
