import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import UpdateIcon from '@material-ui/icons/Update';
import fbActions from '../../../../components/firebase/actions';
import { _isSingle, _currentStore } from '../../../../components/settings';
import { rivalListsDB } from '../../../../components/indexedDB';
import Divider from '@material-ui/core/Divider';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

interface S {
  isLoading1:boolean,
  isLoading2:boolean,
  updateErrorMessage:string,
  deleteErrorMessage:string,
}

interface P {
  rivalData:any,
  toggleSnack:()=>void,
  backToMainPage:()=>void,
}

class RivalSettings extends React.Component<P,S> {

  private fbA:fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();

  constructor(props:P){
    super(props);
    this.fbA.setColName("users");
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
    this.state = {
      isLoading1:false,
      isLoading2:false,
      updateErrorMessage:"",
      deleteErrorMessage:""
    }
  }

  update = async()=>{
    try{
      this.setState({isLoading1:true});
      const {rivalData} = this.props;
      const res = await this.fbA.searchRivalByUid(rivalData.uid);
      if(!res){
        throw new Error("対象ユーザーが見つかりませんでした");
      }
      if(res.displayName === ""){
        throw new Error("対象ユーザーはデータを非公開に設定しています");
      }
      if(res.timeStamp === rivalData.updatedAt){
        throw new Error("すでに最新です");
      }
      const data = await this.fbStores.setDocName(rivalData.uid).load();
      if(!data){
        throw new Error("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。");
      }
      const putResult = await this.rivalListsDB.addUser({
        rivalName:res.displayName,
        uid:res.uid,
        photoURL:res.photoURL,
        profile:res.profile,
        updatedAt:res.timeStamp,
        lastUpdatedAt:rivalData.updatedAt,
        isSingle:_isSingle(),
        storedAt:_currentStore(),
      },data.scores);
      if(!putResult){
        throw new Error("追加に失敗しました");
      }
    }catch(e){
      return this.setState({updateErrorMessage:e.message,isLoading1:false,});
    }
    this.setState({updateErrorMessage:"更新が完了しました",isLoading1:false,});
  }

  delete = async()=>{
    try{
      const res = await this.rivalListsDB.removeUser(this.props.rivalData);
      if(!res){
        throw new Error("削除に失敗しました");
      }
      this.props.toggleSnack();
      this.props.backToMainPage();
    }catch(e){
      return this.setState({deleteErrorMessage:e.message,isLoading2:false,});
    }
  }

  render(){
    const {isLoading1,isLoading2,updateErrorMessage} = this.state;
    const {rivalData} = this.props;
    return (
      <Paper style={{padding:"15px"}}>
        <FormControl>
          <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
            ライバルデータの更新
          </Typography>
          <div style={{position:"relative"}}>
            <Button
              variant="contained"
              color="secondary"
              disabled={isLoading1 || isLoading2}
              onClick={this.update}
              startIcon={<UpdateIcon />}>
              更新
            </Button>
            {isLoading1 && <CircularProgress size={24} style={{color:"#777",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />}
          </div>
          <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
            {updateErrorMessage && <span>{updateErrorMessage}<br/></span>}
            最終更新: {rivalData.updatedAt}
          </Typography>
        </FormControl>
        <Divider style={{margin:"10px 0"}}/>
        <FormControl>
          <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
            ライバルデータの削除
          </Typography>
          <div style={{position:"relative"}}>
            <Button
              variant="contained"
              color="secondary"
              style={{background:"#dc004e"}}
              disabled={isLoading1 || isLoading2}
              onClick={this.delete}
              startIcon={<DeleteForeverIcon />}>
              削除
            </Button>
            {isLoading2 && <CircularProgress size={24} style={{color:"#777",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />}
          </div>
        </FormControl>
      </Paper>
    );
  }
}

export default RivalSettings;
