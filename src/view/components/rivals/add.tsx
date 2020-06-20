import * as React from 'react';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import fbActions from '../../../components/firebase/actions';
import { _currentStore, _isSingle } from '../../../components/settings';
import { rivalListsDB } from '../../../components/indexedDB';
import UserCard from './viewComponents/card';
import ModalUser from './modal';
import { DBRivalStoreData, rivalStoreData } from '../../../types/data';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from "@material-ui/icons/Search";
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import InputAdornment from '@material-ui/core/InputAdornment';
import Alert from '@material-ui/lab/Alert';

interface P {
  handleToggle:()=>void,
  toggleSnack:()=>void,
  loadRivals:()=>void
}

interface S {
  input:string,
  activated:boolean,
  processing:boolean,
  rivals:string[],
  res:firebase.firestore.DocumentData|null,
  errorMessage:string,
  isModalOpen:boolean,
  currentUserName:string,
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
      activated:false,
      processing:false,
      rivals:[],
      res:null,
      errorMessage:"",
      isModalOpen:false,
      currentUserName:"",
    }
  }

  async componentDidMount(){
    this.setState({
      rivals:(await this.rivalListsDB.getAll()).reduce((groups:string[],item:DBRivalStoreData)=>{
      groups.push(item.uid);
      return groups;
    },[])});
  }

  search = async():Promise<void>=>{
    const {input} = this.state;
    if(!input) return this.setState({errorMessage:"無効な文字列です。"});
    this.setState({processing:true});
    const res = await this.fbA.searchAllRival(input);
    let result:any[] = [];
    if(res){
      res.map(item=>{
        const data = item.data();
        result.push(data);
        return 0;
      });
    }
    console.log(result);
    return this.setState({activated:true,res:result.filter(function(v1,i1,a1){
      return (a1.findIndex(function(v2){
        return (v1.uid===v2.uid)
      }) === i1);
    }) || [],errorMessage:!res ? "条件に合致するユーザーが見つかりませんでした。" : "",processing:false});
  }

  addUser = async(meta:rivalStoreData):Promise<void>=>{
    this.setState({processing:true});
    const data = await this.fbStores.setDocName(meta.uid).load();
    const {res} = this.state;
    if(!data || !res){
      return this.setState({errorMessage:"該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。",processing:false});
    }
    const putResult = await this.rivalListsDB.addUser({
      rivalName:meta.displayName,
      uid:meta.uid,
      photoURL:meta.photoURL,
      profile:meta.profile,
      updatedAt:meta.timeStamp,
      lastUpdatedAt:meta.timeStamp,
      isSingle:_isSingle(),
      storedAt:_currentStore(),
    },data.scores);
    if(!putResult){
      return this.setState({errorMessage:"追加に失敗しました",processing:false});
    }
    this.setState({rivals:this.state.rivals.concat(meta.uid),processing:false});
    this.props.toggleSnack();
    return;
  }

  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag});
  open = (uid:string)=> this.setState({isModalOpen:true,currentUserName:uid})

  render(){
    const {handleToggle} = this.props;
    const {input,rivals,activated,res,processing,errorMessage,isModalOpen,currentUserName} = this.state;
    return (
      <Dialog open={true}>
        <DialogTitle>ライバルを検索</DialogTitle>
        <DialogContent>
          <DialogContentText variant="caption">
            登録したいライバルの情報を検索します。<br/>
            ライバルIDまたはIIDX IDで検索できます（大文字小文字の区別あり・前方一致）。<br/>
            検索結果のユーザー名をクリックして詳細情報を確認できます。
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel htmlFor="searchForm">検索キーワードを入力</InputLabel>
            <Input
              id="searchForm"
              value={input}
              onChange={(e)=>this.setState({input:e.target.value})}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton onClick={this.search} disabled={processing}>
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          {(activated && res) && res.map((item:any)=>{
            const isAdded = rivals.indexOf(item.uid) > -1;
            return (<div key={item.uid}>
              <UserCard open={this.open} item={item} processing={processing} isAdded={isAdded} addUser={this.addUser}/>
          </div>)})}
          {processing && <div style={{display:"flex",justifyContent:"center"}}><CircularProgress color="secondary" style={{margin:"10px auto"}}/></div>}
          {errorMessage && <Alert style={{margin:"15px 0"}} severity="error">{errorMessage}</Alert>}
          {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggle} disabled={processing} color="primary">
            閉じる
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default RivalAdd;
