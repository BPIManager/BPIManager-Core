import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import WarningIcon from '@material-ui/icons/Warning';
import { _currentStore, _isSingle } from '../../components/settings';
import fbActions from '../../components/firebase/actions';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ViewListIcon from '@material-ui/icons/ViewList';
import TwitterIcon from '@material-ui/icons/Twitter';
import ShareButtons from '../components/common/shareButtons';
import { rivalListsDB } from '../../components/indexedDB';
import ShowSnackBar from '../components/snackBar';
import RivalView from '../components/rivals/view';
import { rivalScoreData, scoreData } from '../../types/data';
import {Link, Chip, Divider, Grid} from '@material-ui/core/';
import {Link as RefLink} from "react-router-dom";
import ClearLampView from '../components/table/fromUserPage';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import bpiCalcuator from '../../components/bpi';
import {arenaRankColor, alternativeImg} from '../../components/common';
import Loader from '../components/common/loader';

interface S {
  userName:string,
  processing:boolean,
  add:boolean,
  currentView:number,
  message:string,
  showSnackBar:boolean,
  res:any,
  uid:string,
  alternativeId:string,
  rivalData:rivalScoreData[],
  totalBPI:number,
}

class User extends React.Component<{intl:any}&RouteComponentProps,S> {
  private fbA:fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.fbA.setColName("users");
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
    this.state ={
      userName:(props.match.params as any).uid || "",
      processing:true,
      add:false,
      currentView:0,
      message:"",
      alternativeId:"",
      showSnackBar:false,
      res:null,
      uid:"",
      rivalData:[],
      totalBPI:NaN,
    }
  }

  componentDidMount(){
    if(!this.state.userName){
      new fbActions().auth().onAuthStateChanged(async (user: any)=> {
        if(user){
          const t = await this.fbA.setDocName(user.uid).load();
          console.log(t);
          this.setState({
            alternativeId:(t && t.displayName) ? t.displayName : "",
            processing:false,
          });
        }else{
          this.setState({
            processing:false,
          })
        }
      });
    }else{
      this.search();
    }
  }

  backToMainPage = ()=> this.setState({currentView:0});
  toggleSnack = (message:string = "ライバルを追加しました")=> this.setState({add:false,message:message,showSnackBar:!this.state.showSnackBar});

  search = async():Promise<void>=>{
    const {userName} = this.state;
    this.setState({processing:true});
    const res = await this.fbA.searchRival(userName);
    if(res){
      const data = await this.fbStores.setDocName(res.uid).load();
      if(!data){
        return this.setState({userName:userName,res:res,uid:res.uid,rivalData:[],processing:false});
      }
      const totalBPI = ():number=>{
        const s = data.scores.filter((item:any)=>item.difficultyLevel === "12");
        const b = new bpiCalcuator();
        return b.setSongs(s.reduce((sum:number[],item:scoreData)=>{
          sum.push(item.currentBPI);
          return sum;
        },[]));
      }
      return this.setState({userName:userName,res:res,uid:res.uid,rivalData:data.scores || [],totalBPI:data.totalBPI || totalBPI(),processing:false});
    }else{
      return this.setState({userName:"", res:null,uid:"",processing:false});
    }
  }

  getIIDXId = (input:string)=>{
    const match = input.match(/\d{4}(-|)\d{4}/);
    return match ? match[0].replace(/[^\d]/g,"") : "";
  }

  getTwitterName = (input:string)=>{
    const match = input.match(/@[a-zA-Z0-9_]+/);
    return match ? match[0].replace(/@/g,"") : "";
  }

  addUser = async():Promise<void>=>{
    this.setState({add:true});
    const {res,rivalData} = this.state;
    if(rivalData.length === 0 || !res){
      this.toggleSnack("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。");
      return this.setState({add:false});
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
    },rivalData);
    if(!putResult){
      return this.setState({message:"追加に失敗しました",add:false});
    }
    this.toggleSnack();
    return;
  }

  view = async(v:number):Promise<void>=>{
    if(this.state.rivalData.length === 0){
      return this.toggleSnack("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。");
    }
    this.setState({
      currentView:v,
    })
  }

  color = (rank:string)=>{
    return arenaRankColor(rank);
  }

  render(){
    const {processing,add,userName,res,uid,message,showSnackBar,currentView,rivalData,alternativeId,totalBPI} = this.state;
    const url = "https://bpi.poyashi.me/u/" + encodeURI(userName);
    if(processing){
      return (<Loader/>);
    }
    if(!userName){
      return (
        <Container className="commonLayout" fixed>
          <Paper>
            <div style={{textAlign:"center",padding:"15px"}}>
              <WarningIcon style={{color:"#555",fontSize:"45px"}}/>
              <Typography variant="h4" gutterBottom>
                Error!
              </Typography>
              <Typography variant="body2" gutterBottom>
                指定されたユーザーは見つかりませんでした
              </Typography>
              {(!(this.props.match.params as any).uid && alternativeId) &&
              <Typography variant="body2" gutterBottom>
                あなたのプロフィールは<br/>
                <RefLink to={"/u/" + alternativeId} style={{textDecoration:"none"}}><Link color="secondary" component="span">https://bpi.poyashi.me/u/{alternativeId}</Link></RefLink><br/>
                から閲覧できます
              </Typography>
              }
            </div>
          </Paper>
        </Container>
      );
    }
    if(currentView === 1){
      return (
        <Container className="commonLayout" fixed>
          <RivalView toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} showAllScore={true}
            rivalData={uid} rivalMeta={res} descendingRivalData={rivalData} isNotRival={true}/>
        </Container>
      )
    }
    if(currentView === 2){
      return (
        <Container className="commonLayout" fixed>
          <ClearLampView backToMainPage={this.backToMainPage}
            name={res.displayName} data={rivalData}/>
        </Container>
      )
    }
    return (
      <Container className="commonLayout" id="users" fixed>
        <Paper>
          <div style={{textAlign:"center",padding:"15px"}}>
            <Avatar style={{width:"150px",height:"150px",border:"1px solid #ccc",margin:"15px auto"}}>
              <img src={res.photoURL ? res.photoURL.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                alt={res.displayName}
                onError={(e)=>(e.target as HTMLImageElement).src = alternativeImg(res.displayName)}/>
            </Avatar>
            <Typography variant="h4">
              {res.displayName}
            </Typography>
            <Chip size="small" style={{backgroundColor:this.color(res.arenaRank),color:"#fff",margin:"5px 0"}} label={res.arenaRank || "-"} />
            <Chip size="small" style={{backgroundColor:"green",color:"#fff",margin:"0 0 0 5px"}} label={"総合BPI:" + String(Number.isNaN(totalBPI) ? "-" : totalBPI)} />
            <Typography variant="caption" component="p" gutterBottom style={{color:"#aaa",marginBottom:"10px"}}>
              最終更新:{res.timeStamp}
            </Typography>
            <Typography variant="body1" gutterBottom>
              {res.profile}
            </Typography>
          </div>
        </Paper>
        <Grid container spacing={1} style={{marginTop:"4px",marginBottom:"4px"}}>
          <Grid item xs={12} md={4}>
            <Button onClick={()=>this.view(1)} disabled={add || processing} startIcon={<ViewListIcon/>} variant="outlined" color="secondary" fullWidth>
              スコアを見る
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button onClick={()=>this.view(2)} disabled={add || processing} startIcon={<WbIncandescentIcon/>} variant="outlined" color="secondary" fullWidth>
              AAA達成表
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button onClick={this.addUser} disabled={add || processing} startIcon={<GroupAddIcon/>} variant="outlined" color="secondary" fullWidth>
              ライバルに追加
            </Button>
          </Grid>
        </Grid>
        {(this.getIIDXId(res.profile) !== "" || this.getTwitterName(res.profile) !== "") && <Divider style={{margin:"5px 0 10px 0"}}/>}
        {this.getIIDXId(res.profile) !== "" &&
          <form method="post" name="rivalSearch" action="https://p.eagate.573.jp/game/2dx/27/rival/rival_search.html#rivalsearch">
            <input type="hidden" name="iidxid" value={this.getIIDXId(res.profile)}/>
            <input type="hidden" name="mode" value="1"/>
            <Button startIcon={<ExitToAppIcon/>} variant="outlined" color="secondary" fullWidth type="submit" style={{margin:"0 0 5px 0"}}>
              eAMUSEMENT
            </Button>
          </form>
        }
        {this.getTwitterName(res.profile) !== "" &&
          <Button startIcon={<TwitterIcon/>} variant="outlined" color="secondary" fullWidth type="submit" href={`https://twitter.com/${this.getTwitterName(res.profile)}`}>
            Twitter
          </Button>
        }
        <img src={`https://chart.apis.google.com/chart?cht=qr&chs=150x150&chl=${url}`} alt="ライバルに追加" style={{margin:"10px auto",display:"block",border:"1px solid #ccc"}}/>
        <ShareButtons withTitle={false} url={url}/>
        <ShowSnackBar message={message} variant={message === "ライバルを追加しました" ? "success" : "error"}
            handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </Container>
    );
  }
}

export default injectIntl(withRouter(User));
