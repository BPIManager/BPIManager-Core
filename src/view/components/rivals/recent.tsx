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
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';

interface P {
  compareUser:(rivalMeta:any,rivalBody:any,last:any,arenaRank:string)=>void,
  last:any,
  arenaRank:string,
}

interface S {
  input:string,
  uid:string,
  activated:boolean,
  processing:boolean,
  res:any,
  showSnackBar:boolean,
  variant:"info" | "error" | "success" | "warning",
  message:string,
  rivals:string[],
  arenaRank:string,
  isLoading:boolean,
}

class RecentlyAdded extends React.Component<P,S> {

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
      res:[],
      message:"",
      variant:"info",
      showSnackBar:false,
      rivals:[],
      arenaRank:props.arenaRank || "すべて",
      isLoading:true,
    }
  }

  async componentDidMount(){
    this.search(null,this.props.last);
    this.setState({rivals:(await this.rivalListsDB.getAll()).reduce((groups:string[],item:any)=>{
      groups.push(item.uid);
      return groups;
    },[])})
  }

  search = async(last = null,endAt = null,arenaRank = this.state.arenaRank):Promise<void>=>{
    this.setState({processing:true,isLoading:true,});
    const res = await this.fbA.recentUpdated(last,endAt,arenaRank);
    if(!res){
      return this.toggleSnack("該当ページが見つかりませんでした。","warning")
    }
    return this.setState({activated:true,res:this.state.res.concat(res),processing:false,isLoading:false,});
  }

  addUser = async(meta:any):Promise<void>=>{
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
    if(!putResult){
      return this.toggleSnack("追加に失敗しました","error");
    }
    this.setState({rivals:this.state.rivals.concat(meta.uid)})
    return this.toggleSnack("ライバルを追加しました","success");
  }

  compareButton = async (meta:any)=>{
    const {res,arenaRank} = this.state;
    const data = await this.fbStores.setDocName(meta.uid).load();
    if(!data){
      return this.toggleSnack("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。","warning");
    }
    this.props.compareUser(meta,data.scores,res ? res[res.length-1] : null,arenaRank);
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
    return (
      <div>
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
      <div className="clearBoth" style={{marginTop:"5px"}}/>
      {(activated && res.length === 0) && <div>
        <p>
        条件に該当するユーザーが見つかりませんでした。
        </p>
      </div>}
      {res.map((item:any)=>
        (activated && <div key={item.uid}>
        <Card style={{margin:"10px 0"}}>
          <CardHeader
            avatar={
              <Avatar>
                <img src={item.photoURL ? item.photoURL : "noimage"} style={{width:"100%",height:"100%"}}
                  alt={item.displayName}
                  onError={(e)=>(e.target as HTMLImageElement).src = 'https://files.poyashi.me/noimg.png'}/>
              </Avatar>
            }
            title={item.displayName}
            subheader={"最終更新:" + item.timeStamp + " / " + (item.arenaRank || "-")}
          />
          <CardContent>
            <Typography variant="body2" color="textSecondary" component="p">
              {item.profile}
            </Typography>
            {rivals.indexOf(item.uid) === -1 &&
              <Button disabled={processing} onClick={()=>this.addUser(item)} variant="outlined" color="secondary" style={{float:"right"}}>
                <AddIcon/>
                追加
              </Button>
            }
            {rivals.indexOf(item.uid) > -1 &&
              <Button disabled={processing} variant="outlined" style={{float:"right",border:"1px solid rgba(255, 0, 0, 0.35)",color:"#ff4d4d"}}>
                <CheckIcon/>
                ライバルです
              </Button>
            }
            <Button disabled={processing} onClick={()=>this.compareButton(item)} variant="outlined" color="secondary" style={{float:"right",margin:"0px 5px"}}>
              <VisibilityIcon/>
              比較
            </Button>
            <div className="clearBoth"/>
          </CardContent>
        </Card>
      </div>
      ))}
      {isLoading && <div>
        <Container className="loaderCentered" style={{height:"66px"}}>
          <CircularProgress />
        </Container>
      </div>}
      <Grid container>
        <Grid item xs={12}>
          <Button disabled={processing} onClick={this.next} variant="contained" color="secondary" fullWidth>
            次の10件を表示
          </Button>
        </Grid>
      </Grid>
      <ShowSnackBar message={message} variant={variant}
          handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </div>
    );
  }
}

export default RecentlyAdded;
