import * as React from 'react';

import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import UpdateIcon from '@material-ui/icons/Update';
import fbActions from '@/components/firebase/actions';
import { _isSingle, _currentStore } from '@/components/settings';
import { rivalListsDB } from '@/components/indexedDB';
import Divider from '@material-ui/core/Divider';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import { DBRivalStoreData } from '@/types/data';
import { updateRivalScore } from "@/components/rivals";
import Loader from '@/view/components/common/loader';

interface S {
  isLoading1:boolean,
  isLoading2:boolean,
  updateErrorMessage:string,
  deleteErrorMessage:string,
}

interface P {
  rivalMeta:DBRivalStoreData,
  toggleSnack:()=>void,
  backToMainPage:()=>void,
}

class RivalSettings extends React.Component<P,S> {

  private fbA:fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();

  constructor(props:P){
    super(props);
    this.fbA.v2SetUserCollection();
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
      const {rivalMeta} = this.props;
      const t = await updateRivalScore(rivalMeta);
      if(t !== ""){
        throw new Error(t);
      }
    }catch(e){
      return this.setState({updateErrorMessage:e.message,isLoading1:false,});
    }
    this.setState({updateErrorMessage:"更新が完了しました",isLoading1:false,});
  }

  delete = async()=>{
    try{
      new fbActions().auth().onAuthStateChanged(async(user: any)=> {
        new fbActions().setDocName(user.uid).syncDeleteOne(this.props.rivalMeta.uid);
      });
      const res = await this.rivalListsDB.removeUser(this.props.rivalMeta);
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
    const {rivalMeta} = this.props;
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
            {isLoading1 && <Loader/>}
          </div>
          <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
            {updateErrorMessage && <span>{updateErrorMessage}<br/></span>}
            最終更新: {rivalMeta.updatedAt}
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
            {isLoading2 && <Loader/>}
          </div>
        </FormControl>
      </Paper>
    );
  }
}

export default RivalSettings;
