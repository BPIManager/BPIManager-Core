import * as React from 'react';

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import fbActions from '../../../components/firebase/actions';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { _currentStore, _isSingle } from '../../../components/settings';
import { rivalListsDB } from '../../../components/indexedDB';
import Grid from '@material-ui/core/Grid';
import ShowSnackBar from '../snackBar';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { rivalStoreData, rivalScoreData, DBRivalStoreData } from '../../../types/data';
import {Chip, CardActions, ButtonGroup} from '@material-ui/core/';
import {arenaRankColor, alternativeImg} from '../../../components/common';
import {Link} from 'react-router-dom';
import Loader from '../common/loader';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

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
}

class RecentlyAdded extends React.Component<P,S> {

  private fbA:fbActions = new fbActions();
  private fbU:fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();

  constructor(props:P){
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
    }
  }

  async componentDidMount(){
    this.search(null,this.props.last);
    let t:any = [];
    this.fbU.auth().onAuthStateChanged(async(user: any)=> {
      t = await new fbActions().setColName("users").setDocName(user ? user.uid : "").load();
      this.fbU.setDocName(user ? user.uid : "");
      this.setState({rivals:(await this.rivalListsDB.getAll()).reduce((groups:string[],item:DBRivalStoreData)=>{
        groups.push(item.uid);
        return groups;
      },[]),displayName:(t && t.displayName ) ? t.displayName  : ""});
    });
  }

  search = async(last:rivalStoreData|null = null,endAt:rivalStoreData|null = null,arenaRank = this.state.arenaRank):Promise<void>=>{
    const {mode} = this.props;
    this.setState({processing:true,isLoading:true,});
    let res:rivalStoreData[] = [];
    if(mode === 0){
      res = await this.fbA.recommendedByBPI()
    }else if(mode === 1){
      res = await this.fbA.recentUpdated(last,endAt,arenaRank);
    }else if(mode === 2){
      res = (await this.fbA.addedAsRivals()).filter((item)=> item !== undefined);
    }
    if(!res){
      return this.toggleSnack("該当ページが見つかりませんでした。","warning")
    }
    return this.setState({activated:true,res:this.state.res.concat(res),processing:false,isLoading:false,});
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

  compareButton = async (meta:rivalStoreData)=>{
    const {res,arenaRank} = this.state;
    const {mode} = this.props;
    const data = await this.fbStores.setDocName(meta.uid).load();
    if(!data){
      return this.toggleSnack("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。","warning");
    }
    this.props.compareUser(meta,data.scores,res[res.length-1],arenaRank,mode + 2);
  }

  next = ()=>{
    const {res} = this.state;
    return this.search(res ? res[res.length-1] : null,null);
  }

  toggleSnack = (message:string = "ライバルを追加しました",variant:"info" | "error" | "success" | "warning" = "info")=>{
    return this.setState({message:message,showSnackBar:!this.state.showSnackBar,processing:false,variant:variant,isLoading:false});
  }

  render(){
    const {isLoading,showSnackBar,activated,res,rivals,processing,message,variant,arenaRank} = this.state;
    const {mode} = this.props;
    return (
      <div>
      {mode === 1 &&
      <FormControl style={{minWidth:"150px",float:"right"}}>
        <InputLabel>最高アリーナランク</InputLabel>
        <Select value={arenaRank} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
          if(typeof e.target.value !== "string") return;
          this.setState({arenaRank:e.target.value,res:[],activated:false});
          return this.search(null,null,e.target.value);
        }}>
          {["すべて","A1","A2","A3","A4","A5","B1","B2","B3","B4","B5"].map(item=><MenuItem value={item} key={item}>{item}</MenuItem>)}
        </Select>
      </FormControl>
      }
      <div className="clearBoth" style={{marginTop:"5px"}}/>
      {(activated && res.length === 0) && <div>
        <Alert severity="error" style={{margin:"10px 0"}}>
          <AlertTitle style={{marginTop:"0px",fontWeight:"bold"}}>Error</AlertTitle>
          <p>
            条件に合致するユーザーが見つかりませんでした。
          </p>
        </Alert>
      </div>}
      {res.map((item:rivalStoreData)=>
        (activated && <div key={item.uid}>
        <Card style={{margin:"10px 0"}}>
          <CardHeader
            avatar={
              <Link to={"/u/" + item.displayName}>
                <Avatar>
                  <img src={item.photoURL ? item.photoURL : "noimage"} style={{width:"100%",height:"100%"}}
                    alt={item.displayName}
                    onError={(e)=>(e.target as HTMLImageElement).src = alternativeImg(item.displayName)}/>
                </Avatar>
              </Link>
            }
            title={item.displayName}
            subheader={<span>
            <Chip size="small" style={{backgroundColor:arenaRankColor(item.arenaRank),color:"#fff",margin:"5px 0"}} label={item.arenaRank || "-"} />
            {item.totalBPI && <Chip size="small" style={{backgroundColor:"green",color:"#fff",margin:"0 0 0 5px"}} label={"総合BPI:" + item.totalBPI} />}
            </span>}
          />
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
              {item.profile}
            </Typography>
          </CardContent>
          <CardActions className="bottomedActionButtons">
            <ButtonGroup color="secondary" variant="outlined" fullWidth>
              {rivals.indexOf(item.uid) === -1 &&
                <Button disabled={processing} onClick={()=>this.addUser(item)}>
                  <AddIcon/>
                  追加
                </Button>
              }
              {rivals.indexOf(item.uid) > -1 &&
                <Button disabled={true}>
                  <CheckIcon/>
                  ライバルです
                </Button>
              }
              <Button disabled={processing} onClick={()=>this.compareButton(item)}>
                <VisibilityIcon/>
                比較
              </Button>
            </ButtonGroup>
          </CardActions>
        </Card>
      </div>
      ))}
      {isLoading && <Loader/>}
      {mode === 1 &&
      <Grid container>
        <Grid item xs={12}>
          <Button disabled={processing} onClick={this.next} variant="contained" color="secondary" fullWidth>
            次の10件を表示
          </Button>
        </Grid>
      </Grid>
      }
      <ShowSnackBar message={message} variant={variant}
          handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </div>
    );
  }
}

export default RecentlyAdded;
