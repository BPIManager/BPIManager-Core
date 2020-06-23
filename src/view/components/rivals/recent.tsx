import * as React from 'react';

import Button from '@material-ui/core/Button';
import fbActions from '../../../components/firebase/actions';
import { _currentStore, _isSingle } from '../../../components/settings';
import { rivalListsDB } from '../../../components/indexedDB';
import Grid from '@material-ui/core/Grid';
import ShowSnackBar from '../snackBar';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { rivalStoreData, rivalScoreData } from '../../../types/data';
import {Container, Divider, Input, InputAdornment, IconButton} from '@material-ui/core/';
import {withRouter, RouteComponentProps} from 'react-router-dom';
import Loader from '../common/loader';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import ModalUser from './modal';
import UserCard from './viewComponents/card';
import SearchIcon from "@material-ui/icons/Search";
import moment from 'moment';

interface P {
  compareUser:(rivalMeta:rivalStoreData,rivalBody:rivalScoreData[],last:rivalStoreData,arenaRank:string,currentPage:number)=>void,
  last:rivalStoreData|null,
  arenaRank:string,
  mode:number,
}

interface S {
  input:string,
  uid:string,
  activated:boolean,
  processing:boolean,
  res:rivalStoreData[],
  showSnackBar:boolean,
  variant:"info" | "error" | "success" | "warning",
  message:string,
  rivals:string[],
  arenaRank:string,
  isLoading:boolean,
  displayName:string,
  isModalOpen:boolean,
  currentUserName:string,
  searchInput:string,
  errorMessage:string,
}

class RecentlyAdded extends React.Component<P & RouteComponentProps,S> {

  private fbA:fbActions = new fbActions();
  private fbU:fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();
  timeOut: any;

  constructor(props:P & RouteComponentProps){
    super(props);
    this.fbA.setColName("users");
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
    this.fbU.setColName("users");
    this.state = {
      input:"",
      uid:"",
      activated:false,
      processing:false,
      res:[],
      message:"",
      variant:"info",
      showSnackBar:false,
      rivals:[],
      arenaRank:props.arenaRank || "すべて",
      isLoading:true,
      displayName:"",
      isModalOpen:false,
      currentUserName:"",
      searchInput:"",
      errorMessage:"",
    }
    this.timeOut = 0;
  }

  async componentDidMount(){
    this.search(null,this.props.last);
    let t:any = [];
    this.fbU.auth().onAuthStateChanged(async(user: any)=> {
      t = await new fbActions().setColName("users").setDocName(user ? user.uid : "").load();
      this.fbU.setDocName(user ? user.uid : "");
      this.setState(
        {
          rivals:await this.rivalListsDB.getAllRivalUid(),
          displayName:(t && t.displayName ) ? t.displayName  : ""
        }
      );
    });
  }

  search = async(last:rivalStoreData|null = null,endAt:rivalStoreData|null = null,arenaRank = this.state.arenaRank,willConcat:boolean = true):Promise<void>=>{
    const {mode} = this.props;
    this.setState({processing:true,isLoading:true,});
    let res:rivalStoreData[] = [];
    if(mode === 0){
      res = await this.fbA.recommendedByBPI()
    }else if(mode === 2){
      res = await this.fbA.recentUpdated(last,endAt,arenaRank);
    }else if(mode === 1){
      res = (await this.fbA.addedAsRivals()).filter((item)=> item !== undefined);
    }
    if(!res){
      return this.toggleSnack("該当ページが見つかりませんでした。","warning")
    }
    return this.setState({activated:true,res:willConcat ? this.state.res.concat(res) : res,processing:false,isLoading:false,});
  }

  addUser = async(meta:rivalStoreData):Promise<void>=>{
    this.setState({processing:true});
    const data = await this.fbStores.setDocName(meta.uid).load();
    if(!data){
      return this.toggleSnack("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。","warning");
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
    await this.fbU.syncUploadOne(meta.uid,this.state.displayName);
    if(!putResult){
      return this.toggleSnack("追加に失敗しました","error");
    }
    this.setState({rivals:this.state.rivals.concat(meta.uid)})
    return this.toggleSnack("ライバルを追加しました","success");
  }

  next = ()=>{
    const {res} = this.state;
    return this.search(res ? res[res.length-1] : null,null);
  }

  toggleSnack = (message:string = "ライバルを追加しました",variant:"info" | "error" | "success" | "warning" = "info")=>{
    return this.setState({message:message,showSnackBar:!this.state.showSnackBar,processing:false,variant:variant,isLoading:false});
  }

  incrementalSearch = async (val:string,arenaRank:string):Promise<void>=>{
    const searchExec = async()=>{
      if(!val){
        return await this.search(null,null,arenaRank,false);
      }
      let res = await this.fbA.searchAllRival(val);
      if(arenaRank !== "すべて"){
        res = res.filter(item=>item.data().arenaRank === arenaRank);
      }
      let result:any[] = [];
      if(res){
        res.map((item:any)=>{
          const data = item.data();
          result.push(data);
          return 0;
        });
      }
      return this.setState({activated:true,res:result.filter(function(v1,i1,a1){
        return (a1.findIndex(function(v2){
          return (v1.uid===v2.uid)
        }) === i1);
      }).sort((a,b)=>moment(b.timeStamp).diff(a.timeStamp)) || [],errorMessage:!res ? "条件に合致するユーザーが見つかりませんでした。" : "",processing:false,isLoading:false,});
    }
    if(this.timeOut) clearTimeout(this.timeOut);
    this.timeOut = setTimeout(() => {
      searchExec();
    }, 300);
    this.setState({processing:true,searchInput:val,isLoading:true,res:[],activated:false});
  }

  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag});
  open = (uid:string)=> this.setState({isModalOpen:true,currentUserName:uid})

  render(){
    const {isLoading,isModalOpen,showSnackBar,activated,res,rivals,processing,message,variant,arenaRank,currentUserName,searchInput} = this.state;
    const {mode} = this.props;
    return (
      <div>
      <Container className="commonLayout" fixed>
        {mode === 2 && (
          <form noValidate autoComplete="off">
            <FormControl style={{float:"right",minWidth:"140px"}}>
              <InputLabel>アリーナランク</InputLabel>
              <Select value={arenaRank} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                if(typeof e.target.value !== "string") return;
                this.setState({arenaRank:e.target.value,res:[],activated:false});
                return searchInput ? this.incrementalSearch(searchInput,e.target.value) : this.search(null,null,e.target.value);
              }}>
                {["すべて","A1","A2","A3","A4","A5","B1","B2","B3","B4","B5"].map(item=><MenuItem value={item} key={item}>{item}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel htmlFor="searchForm">ユーザー名・IIDX IDで検索</InputLabel>
              <Input
                id="searchForm"
                value={searchInput}
                onChange={(e)=>this.incrementalSearch(e.target.value,arenaRank)}
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </form>
        )
      }
      {(activated && res.length === 0) && <div>
        <Alert severity="error" style={{margin:"10px 0"}}>
          <AlertTitle style={{marginTop:"0px",fontWeight:"bold"}}>Error</AlertTitle>
          <p>
            条件に合致するユーザーが見つかりませんでした。
          </p>
          {mode === 1 && (
            <p>
              逆ライバルに表示されるユーザーは以下の条件を満たす場合に限られます。<br/>
              ・BPIManager v0.0.4.2以降を使用している<br/>
              ・ライバルデータを同期済み
            </p>
          )}
        </Alert>
      </div>}
      {res.map((item:rivalStoreData,i:number)=>{
        const isAdded = rivals.indexOf(item.uid) > -1;
        return (activated && <div key={item.uid}>
          <UserCard open={this.open} item={item} processing={processing} isAdded={isAdded} addUser={this.addUser}/>
          {i !== res.length - 1 && <Divider variant="middle" component="div" />}
        </div>
      )})}
      {isLoading && <Loader/>}
      {(mode === 2 && searchInput === "") &&
      <Grid container>
        <Grid item xs={12}>
          <Button disabled={processing} onClick={this.next} variant="outlined" color="secondary" fullWidth>
            次の10件を表示
          </Button>
        </Grid>
      </Grid>
      }
      </Container>
      {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      <ShowSnackBar message={message} variant={variant}
          handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </div>
    );
  }
}

export default withRouter(RecentlyAdded);
