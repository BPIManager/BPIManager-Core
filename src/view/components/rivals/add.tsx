import * as React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import fbActions from '../../../components/firebase/actions';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle } from '../../../components/settings';
import { rivalListsDB } from '../../../components/indexedDB';
import LinearProgress from '@material-ui/core/LinearProgress';

interface P {
  handleToggle:()=>void,
  toggleSnack:()=>void,
  loadRivals:()=>void
}

interface S {
  input:string,
  uid:string,
  activated:boolean,
  processing:boolean,
  res:any,
  errorMessage:string,
}

class RivalAdd extends React.Component<P,S> {

  private fbA:fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();

  constructor(props:P){
    super(props);
    this.fbA.setColName("users");
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
    this.state = {
      input:"",
      uid:"",
      activated:false,
      processing:false,
      res:null,
      errorMessage:""
    }
  }

  search = async():Promise<void>=>{
    const {input} = this.state;
    if(!input) return this.setState({errorMessage:"無効な文字列です。"});
    this.setState({processing:true});
    const res = await this.fbA.searchRival(input);
    return this.setState({activated:true,res:res,uid:res ? res.uid : "",errorMessage:!res ? "該当IDのユーザーは見つかりませんでした。" : "",processing:false});
  }

  addUser = async():Promise<void>=>{
    this.setState({processing:true});
    const data = await this.fbStores.setDocName(this.state.uid).load();
    const {res} = this.state;
    if(!data){
      return this.setState({errorMessage:"該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。",processing:false});
    }
    const putResult = await this.rivalListsDB.addUser({
      rivalName:res.displayName,
      uid:res.uid,
      photoURL:res.photoURL,
      profile:res.profile,
      updatedAt:res.timeStamp,
      lastUpdatedAt:res.timeStamp,
      isSingle:_isSingle(),
      storedAt:_currentStore(),
    },data.scores);
    if(!putResult){
      return this.setState({errorMessage:"追加に失敗しました",processing:false});
    }
    this.props.toggleSnack();
    this.props.loadRivals();
    this.props.handleToggle();
    return;
  }

  render(){
    const {handleToggle} = this.props;
    const {input,activated,res,processing,errorMessage} = this.state;
    return (
      <Dialog open={true}>
        <DialogTitle>IDからライバルを検索</DialogTitle>
        <DialogContent>
          <DialogContentText>
            登録したいライバルのIDを入力してください。
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="ライバルID"
            fullWidth
            value={input}
            onChange={(e)=>this.setState({input:e.target.value})}
          />
          {(activated && res) && <div>
            <Card>
              <CardHeader
                avatar={
                  <Avatar>
                    <img src={res.photoURL ? res.photoURL : "noimage"} style={{width:"100%",height:"100%"}}
                      onError={(e)=>(e.target as HTMLImageElement).src = 'https://files.poyashi.me/noimg.png'}/>
                  </Avatar>
                }
                title={res.displayName}
                subheader={"最終更新:" + res.timeStamp}
              />
              <CardContent>
                <Typography variant="body2" color="textSecondary" component="p">
                  {res.profile}
                </Typography>
                <Button disabled={processing} onClick={this.addUser} variant="outlined" color="secondary" style={{float:"right"}}>
                  追加
                </Button>
                <div className="clearBoth"/>
              </CardContent>
            </Card>
          </div>}
          {processing && <LinearProgress style={{margin:"10px 0"}}/>}
          <p>{errorMessage}</p>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggle} disabled={processing} color="primary">
            閉じる
          </Button>
          <Button onClick={this.search} disabled={processing} color="primary">
            検索
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default RivalAdd;
