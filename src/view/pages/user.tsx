import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Typography from '@material-ui/core/Typography';
import WarningIcon from '@material-ui/icons/Warning';
import { _currentStore, _isSingle, _currentTheme } from '@/components/settings';
import fbActions from '@/components/firebase/actions';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Avatar from '@material-ui/core/Avatar';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ViewListIcon from '@material-ui/icons/ViewList';
import TwitterIcon from '@material-ui/icons/Twitter';
import ShareButtons from '@/view/components/common/shareButtons';
import { rivalListsDB } from '@/components/indexedDB';
import ShowSnackBar from '@/view/components/snackBar';
import RivalView from '@/view/components/rivals/view';
import { rivalScoreData, rivalStoreData } from '@/types/data';
import {Link, Chip, Divider, Grid, GridList, GridListTile, GridListTileBar, ListSubheader, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton} from '@material-ui/core/';
import {Link as RefLink} from "react-router-dom";
import ClearLampView from '@/view/components/table/fromUserPage';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import {arenaRankColor, alternativeImg, avatarBgColor, avatarFontColor} from '@/components/common';
import Loader from '@/view/components/common/loader';
import { config } from '@/config';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import AdsCard from '@/components/ad';
import CommentIcon from '@material-ui/icons/Comment';
import NotesView from '../components/notes/user';

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
  myDisplayName:string,
  rivalData:rivalScoreData[],
  rivalUids:string[],
  loadingRecommended:boolean,
  recommendUsers:rivalStoreData[],
  totalBPI:number,
  counts:{
    loading:boolean,
    followers:number,
    followings:number,
  },
  limited:boolean,
  myId:string,
}

class User extends React.Component<{intl:any,currentUserName?:string,limited?:boolean,updateName?:(name:string)=>void}&RouteComponentProps,S> {
  private fbA:fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();

  constructor(props:{intl:any,currentUserName?:string,limited?:boolean,updateName?:(name:string)=>void}&RouteComponentProps){
    super(props);
    this.fbA.setColName("users");
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
    const search = new URLSearchParams(props.location.search);
    const initialView = search.get("init");
    this.state ={
      userName:props.currentUserName || (props.match.params as any).uid || "",
      processing:true,
      add:false,
      currentView:initialView ? 1 : 0,
      message:"",
      alternativeId:"",
      myDisplayName:"",
      showSnackBar:false,
      res:null,
      uid:"",
      rivalData:[],
      rivalUids:[],
      loadingRecommended:true,
      recommendUsers:[],
      totalBPI:NaN,
      counts:{
        loading:true,
        followers:0,
        followings:0,
      },
      limited:props.limited || false,
      myId:""
    }
  }

  async componentDidMount(){
    if(!this.state.userName){
      new fbActions().auth().onAuthStateChanged(async (user: any)=> {
        if(user){
          const t = await this.fbA.setDocName(user.uid).load();
          this.setState({
            alternativeId:(t && t.displayName) ? t.displayName : "",
            myDisplayName:(t && t.displayName) ? t.displayName : "",
            processing:false,
          });
        }else{
          this.setState({
            processing:false,
          })
        }
      });
    }else{
      new fbActions().auth().onAuthStateChanged(async (user: any)=> {
        if(user){
          const t = await this.fbA.setDocName(user.uid).load();
          this.setState({
            myDisplayName:(t && t.displayName) ? t.displayName : "",
            myId:user ? user.uid : ""
          });
        }
      });
      await this.search();
      this.recommended();
    }
  }

  backToMainPage = ()=> this.setState({currentView:0});
  toggleSnack = async(message:string = "ライバルを追加しました")=> this.setState({
    add:false,
    message:message,
    showSnackBar:!this.state.showSnackBar,
    rivalUids:await this.rivalListsDB.getAllRivalUid()
  });

  search = async(forceUserName?:string):Promise<void>=>{
    let {userName} = this.state;
    const rivalScores = async(res:any)=>{
      if(this.state.currentView !== 1) return [];
      try{
        const store = await this.fbStores.setDocName(res.uid).load();
        if(!store){
          return [];
        }
        return store.scores;
      }catch(e){
        console.log(e);
        return [];
      }
    }
    if(forceUserName){
      userName = forceUserName;
    }
    this.setState({processing:true});
    const res = await this.fbA.searchRival(userName);
    if(res){
      const totalBPI = res.totalBPI || "-";
      this.countAsync(res.uid);
      return this.setState({
        userName:userName,res:res,uid:res.uid,
        rivalData:await rivalScores(res),
        totalBPI:totalBPI,
        rivalUids:await this.rivalListsDB.getAllRivalUid(),
      });
    }else{
      return this.setState({userName:"", res:null,uid:""});
    }
  }

  countAsync = async (uid:string)=>{
    return this.setState({
      counts:{
        loading:false,
        followers:await this.counts(0,uid),
        followings:await this.counts(1,uid)
      }
    });
  }

  counts = async(type:number = 0, id:string):Promise<number>=>{
    return (await fetch(`https://us-central1-bpim-d5971.cloudfunctions.net/${type === 0 ? "getFollowersCnt" : "getFollowingsCnt"}?targetId=${id}&version=${_currentStore()}`)).json().then(t=>{
      return t.length || 0;
    }).catch(e=>{
      console.log(e);
      return 0;
    });
  }

  recommended = async():Promise<void>=>{
    try{
      const {totalBPI,res} = this.state;
      const recommend:rivalStoreData[] = (await this.fbA.recommendedByBPI(totalBPI)).filter(item=>item.displayName !== res.displayName);
      return this.setState({loadingRecommended:false,recommendUsers:recommend,processing:false});
    }catch(e){
      console.log(e);
      return this.setState({loadingRecommended:false,recommendUsers:[],processing:false});
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
    const {res,uid} = this.state;
    const data = await this.fbStores.setDocName(uid).load();
    if(!data || data.length === 0){
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
    },data.scores);
    await this.fbA.syncUploadOne(res.uid,this.state.myDisplayName);
    if(!putResult){
      return this.setState({
        message:"追加に失敗しました",
        add:false
      });
    }
    this.toggleSnack();
    return;
  }

  view = async(v:number):Promise<void>=>{
    const {uid} = this.state;
    const data = await this.fbStores.setDocName(uid).load();
    if(!data || data.length === 0){
      return this.toggleSnack("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。");
    }
    this.setState({
      currentView:v,
      rivalData:data.scores
    })
  }

  color = (rank:string)=>{
    return arenaRankColor(rank);
  }

  render(){
    const {processing,add,myId,userName,res,uid,message,showSnackBar,currentView,rivalData,alternativeId,totalBPI,loadingRecommended,recommendUsers,counts,limited} = this.state;
    const url = config.baseUrl + "/u/" + encodeURI(userName);
    const isAdded = this.state.rivalUids.indexOf(uid) > -1;
    if(processing){
      return (<Loader/>);
    }
    if(!userName || !res){
      return <NoUserError match={this.props.match} alternativeId={alternativeId}/>;
    }
    if(currentView === 1){
      return (
        <Container fixed  className="commonLayout">
          <RivalView toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} showAllScore={true}
            rivalData={uid} rivalMeta={res} descendingRivalData={rivalData} isNotRival={true}/>
        </Container>
      )
    }
    if(currentView === 2){
      return (
        <Container fixed  className="commonLayout">
          <ClearLampView backToMainPage={this.backToMainPage}
            name={res.displayName} data={rivalData}/>
        </Container>
      )
    }
    if(currentView === 3){
      return (
        <Container fixed  className="commonLayout">
          <NotesView backToMainPage={this.backToMainPage}
            name={res.displayName} uid={uid}/>
        </Container>
      )
    }
    const buttons = [
      {icon:<ViewListIcon />,primary:"スコアを見る",secondary:(res.displayName) + "さんの登録スコアを表示します",onClick:()=>this.view(1)},
      {icon:<WbIncandescentIcon />,primary:"AAA達成表",secondary:"BPIに基づいたAAA達成難易度表を表示します",onClick:()=>this.view(2)},
    ]
    if(res.showNotes){
      buttons.push({icon:<CommentIcon />,primary:"投稿ノート一覧",secondary:(res.displayName) + "さんが投稿した攻略情報一覧",onClick:()=>this.view(3)});
    }
    const themeColor = _currentTheme();
    return (
      <div>
        <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
        <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"5vh 0",alignItems:"center",justifyContent:"center"}}>
          <div style={{textAlign:"center",color:themeColor === "light" ? "#222" : "#fff",width:"75%"}}>
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
              <div style={{textAlign:"center",margin:"0 0 15px 0",padding: "20px"}}>
                <Typography variant="body1" gutterBottom>
                  {res.profile}
                </Typography>
                <Typography variant="caption" component="p" gutterBottom style={{color:themeColor === "light" ? "#888" : "#aaa"}}>
                  最終更新:{res.timeStamp}
                </Typography>
              </div>
              {counts.loading && (
              <Loader text="ライバル情報を読み込み中"/>
              )}
              {!counts.loading && (
              <Grid container style={{marginTop:"15px",textAlign:"center"}}>
                <Grid item xs={6} lg={6}>
                  <Typography component="h6" variant="h6" color="textSecondary">
                    ライバル
                  </Typography>
                  <Typography component="h4" variant="h4" color="textPrimary">
                    {counts.followings}
                  </Typography>
                </Grid>
                <Grid item xs={6} lg={6}>
                  <Typography component="h6" variant="h6" color="textSecondary">
                    逆ライバル
                  </Typography>
                  <Typography component="h4" variant="h4" color="textPrimary">
                    {counts.followers}
                  </Typography>
                </Grid>
              </Grid>
              )}
              <Divider style={{margin:"15px 0"}}/>
          </div>
        </div>
        </div>
        <div>
          <List>
            {buttons.map((item,i)=>{
              return (
                <DefListCard key={i} onAction={item.onClick} disabled={add || processing} icon={item.icon}
                  primaryText={item.primary} secondaryText={item.secondary}/>
              )
            })
          }
          </List>
          <Divider style={{margin:"5px 0 10px 0"}}/>
          <List>
            <DefListCard onAction={()=>this.addUser()} disabled={myId === res.uid || add || processing || isAdded} icon={<GroupAddIcon/>}
              primaryText={"追加"} secondaryText={myId === res.uid ? ("自分を追加することはできません") : res.displayName + (isAdded ? "さんはすでにライバルです" : "さんをライバルに追加します")}/>
          </List>
        {(this.getIIDXId(res.profile) !== "" || this.getTwitterName(res.profile) !== "") && <Divider style={{margin:"5px 0 10px 0"}}/>}
        <List>
        {this.getIIDXId(res.profile) !== "" &&
          <form method="post" name="rivalSearch" action="https://p.eagate.573.jp/game/2dx/27/rival/rival_search.html#rivalsearch">
            <input type="hidden" name="iidxid" value={this.getIIDXId(res.profile)}/>
            <input type="hidden" name="mode" value="1"/>
            <ListItem component="button" type="submit" button disabled={add || processing}>
              <ListItemAvatar>
                <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                  <ExitToAppIcon/>
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={"eAMUSEMENT"} secondary="IIDX公式サイトでユーザー情報を表示します" />
              <ListItemSecondaryAction>
                <IconButton edge="end">
                  <ArrowForwardIosIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </form>
        }
        {this.getTwitterName(res.profile) !== "" &&
          <ListItem component="a" button disabled={add || processing} href={`https://twitter.com/${this.getTwitterName(res.profile)}`}>
            <ListItemAvatar>
              <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                <TwitterIcon/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={"Twitter"} secondary={`@${this.getTwitterName(res.profile)}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end">
                <ArrowForwardIosIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        }
        </List>
        <div style={{width:"50%",margin:"10px auto"}}>
          <ShareButtons withTitle={true} url={url} text={res.displayName + " 総合BPI:" + String(Number.isNaN(totalBPI) ? "-" : totalBPI)}/>
        </div>
        <AdsCard/>
        <ShowSnackBar message={message} variant={message === "ライバルを追加しました" ? "success" : "error"}
          handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      {loadingRecommended && <Loader/>}
      {!loadingRecommended && (
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-around",overflow:"hidden",margin:"15px auto",width:"90%"}}>
          <GridList  cellHeight={180} style={{height:"400px",width:"100%"}}>
            <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
              <ListSubheader component="div">このユーザーもおすすめです:</ListSubheader>
            </GridListTile>
            {recommendUsers.map((tile:rivalStoreData) => (
              <GridListTile key={tile.displayName} onClick={async()=>{
                if(!limited){
                  this.props.history.replace("/u/" + tile.displayName);
                }else{
                  if(this.props.updateName){
                    this.props.updateName(tile.displayName);
                  }
                }
                this.setState({userName:tile.displayName,processing:true,loadingRecommended:true});
                await this.search(tile.displayName);
                this.recommended();
              }}>
                <img src={tile.photoURL.replace("_normal","")} alt={tile.displayName}
                  onError={(e)=>(e.target as HTMLImageElement).src = alternativeImg(tile.displayName)}/>
                <GridListTileBar
                  title={tile.displayName}
                  subtitle={"総合BPI " + String(tile.totalBPI || "-")}
                />
              </GridListTile>
            ))}
          </GridList>
        </div>
      )}
      </div>
      </div>
    );
  }
}

export default injectIntl(withRouter(User));

class NoUserError extends React.Component<{match:any,alternativeId:string},{}>{
  render(){
    const {match,alternativeId} = this.props;
    return (
      <Container fixed  className="commonLayout">
        <Paper>
          <div style={{textAlign:"center",padding:"15px"}}>
            <WarningIcon style={{color:"#555",fontSize:"45px"}}/>
            <Typography variant="h4" gutterBottom>
              Error!
            </Typography>
            <Typography variant="body2" gutterBottom>
              指定されたユーザーは見つかりませんでした
            </Typography>
            {(!(match.params as any).uid && alternativeId) &&
            <Typography variant="body2" gutterBottom>
              あなたのプロフィールは<br/>
              <RefLink to={"/u/" + alternativeId} style={{textDecoration:"none"}}><Link color="secondary" component="span">{config.baseUrl}/u/{alternativeId}</Link></RefLink><br/>
              から閲覧できます
            </Typography>
            }
          </div>
        </Paper>
      </Container>
    );
  }
}

class DefListCard extends React.Component<{
  onAction:()=>any,
  disabled:boolean,
  primaryText:string,
  secondaryText:string,
  icon:JSX.Element,
},{}>{

  render(){
    const {icon,onAction,disabled,primaryText,secondaryText} = this.props;
    return (
      <ListItem button onClick={onAction} disabled={disabled}>
        <ListItemAvatar>
          <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
            {icon}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={primaryText} secondary={secondaryText} />
        <ListItemSecondaryAction onClick={onAction}>
          <IconButton edge="end">
            <ArrowForwardIosIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    )
  }
}
