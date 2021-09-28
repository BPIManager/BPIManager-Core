import * as React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import fbActions from '@/components/firebase/actions';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ListSubheader from '@mui/material/ListSubheader';
import LockIcon from '@mui/icons-material/Lock';
import Avatar from '@mui/material/Avatar';
import { avatarFontColor, avatarBgColor } from '@/components/common';
import Alert from '@mui/material/Alert/Alert';
import Link from '@mui/material/Link';

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
                    <IconButton edge="end" size="large">
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })
          }
          </List>
          <Divider style={{margin:"10px 0"}}/>
          <Typography component="p" variant="caption" gutterBottom>
            <b>ログインでできること</b>
          </Typography>
            <ul className="MuiTypography-caption">
              <li>スコアデータのクラウドへの永久保存</li>
              <li>自分のスコアを他人と共有する</li>
              <li>BPIやアリーナランクに基づき、実力の近いライバルを探す</li>
              <li>Notesやウィークリーランキングへの参加を通した他ユーザーとの交流、モチベーション管理</li>
            </ul>
          <Alert severity="info">
          <Typography component="p" variant="caption" gutterBottom>
            TwitterまたはGoogleを通したOAuthログインに対応しています。連携したSNSアカウントのデータはユーザー識別に用いられ、連携先アカウントにおいて自動的に投稿を作成したり、プロフィールを編集する権限はありません。<br/>
            BPIManagerアカウントの作成に際し、利用規約およびプライバシーポリシーへの同意があったものとみなします。<br/>
            <Link color="secondary" href="https://docs2.poyashi.me/tos/">利用規約及びプライバシーポリシーはこちらからご確認ください。</Link>
          </Typography>
          </Alert>
        </Paper>
        </React.Fragment>
    );
  }
}

export default SyncLoginScreen;
