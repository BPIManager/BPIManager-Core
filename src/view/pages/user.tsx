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
import RivalView, { makeRivalStat } from '@/view/components/rivals/view';
import { rivalScoreData, rivalStoreData } from '@/types/data';
import {Link, Chip, Divider, Grid, GridList, GridListTile, GridListTileBar, ListSubheader, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton} from '@material-ui/core/';
import {Link as RefLink} from "react-router-dom";
import ClearLampView from '@/view/components/table/fromUserPage';
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import {arenaRankColor, alternativeImg, avatarBgColor, avatarFontColor, versionString} from '@/components/common';
import Loader from '@/view/components/common/loader';
import { config } from '@/config';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import CommentIcon from '@material-ui/icons/Comment';
import NotesView from '../components/notes/user';
import { Helmet } from 'react-helmet';
import { getTwitterName, getAltTwitterIcon } from '@/components/rivals';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import { withRivalData, radarData, getRadar } from '@/components/stats/radar';
import RivalStatViewFromUserPage from '../components/rivals/viewComponents/statsFromUserPage';
import SwipeableViews from 'react-swipeable-views';
import Radar from '@/view/components/rivals/viewComponents/ui/radar';
import Alert from '@material-ui/lab/Alert/Alert';
import EventNoteIcon from '@material-ui/icons/EventNote';
import WeeklyList from '@/view/pages/ranking/list';

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
  rivalStat:withRivalData[],
  radar:radarData[],
  index:number
}

class User extends React.Component<{intl:any,currentUserName?:string,limited?:boolean,exact?:boolean,updateName?:(name:string)=>void}&RouteComponentProps,S> {
  private fbA:fbActions = new fbActions();
  private fbStores:fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();

  constructor(props:{intl:any,currentUserName?:string,limited?:boolean,exact?:boolean,updateName?:(name:string)=>void}&RouteComponentProps){
    super(props);
    const search = new URLSearchParams(props.location.search);
    const initialView = search.get("init");
    const params = (props.match.params as any);
    this.fbA.v2SetUserCollection();
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
    this.state ={
      userName:props.currentUserName || params.uid || "",
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
      myId:"",
      rivalStat:[],
      radar:[],
      index:0,
    }
  }

  async componentDidMount(){
    if(!this.state.userName){
      this.fbA.auth().onAuthStateChanged(async (user: any)=> {
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
      this.fbA.auth().onAuthStateChanged(async (user: any)=> {
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
    const exactId = (this.props.match.params as any).exactId || this.props.exact;
    const rivalScores = async(res:any)=>{
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
    const res = (exactId && !forceUserName) ? await this.fbA.searchByExactId(userName) : await this.fbA.searchRival(userName);
    if(res){
      if(res.isPublic === false){
        return this.setState({userName:"",res:null});
      }
      if(exactId){
        userName = res.displayName;
        if(!this.props.exact){
          this.props.history.replace("/u/" + userName);
        }else{
          if(this.props.updateName) this.props.updateName(userName);
        }
      }
      const scores = await rivalScores(res);
      const totalBPI = (res.totalBPIs && res.totalBPIs[_currentStore()]) ? res.totalBPIs[_currentStore()] : "-";
      this.countAsync(res.uid);
      const rivalStat = await makeRivalStat(scores,true);
      return this.setState({
        userName:userName,res:res,uid:res.uid,
        rivalData:scores,
        totalBPI:totalBPI,
        rivalUids:await this.rivalListsDB.getAllRivalUid(),
        rivalStat:rivalStat,
        radar:await getRadar(rivalStat),
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

  addUser = async():Promise<void>=>{
    this.setState({add:true});
    const {res,uid} = this.state;
    const data = await this.fbStores.setDocName(uid).load();
    const rivalLen = await this.rivalListsDB.getRivalLength();
    if(rivalLen >= 5){
      return this.toggleSnack(`ライバル登録数が上限を超えています。`);
    }
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

  handleChangeIndex = (index:number) => {
    this.setState({
      index,
    });
  };

  tabClasses = (num:number)=>{
    if(this.state.index === num){
      return "swipeableContentTab active";
    }
    return "swipeableContentTab";
  }

  render(){
    const {processing,add,myId,userName,res,uid,message,showSnackBar,currentView,rivalData,alternativeId,totalBPI,loadingRecommended,recommendUsers,counts,limited,rivalStat,radar,index} = this.state;
    const url = config.baseUrl + "/u/" + encodeURI(userName);
    const isAdded = this.state.rivalUids.indexOf(uid) > -1;
    if(processing){
      return (<Loader text="ユーザーを読込中"/>);
    }
    if(!userName || !res){
      return <NoUserError match={this.props.match} alternativeId={alternativeId}/>;
    }
    if(currentView === 1){
      return (
        <RivalView toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} showAllScore={true}
          rivalData={uid} rivalMeta={res} descendingRivalData={rivalData} isNotRival={true}/>
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
    if(currentView === 4){
      return (
        <RivalStatViewFromUserPage full={rivalStat} rivalRawData={rivalData} backToMainPage={this.backToMainPage} name={res.displayName}/>
      )
    }
    if(currentView === 5){
      return (
        <Container fixed  className="commonLayout">
          <WeeklyList viewInUser backToMainPage={this.backToMainPage} uid={uid} name={res.displayName}/>
        </Container>
      )
    }
    const buttons = [
      {icon:<ViewListIcon />,primary:"スコアを見る",secondary:(res.displayName) + "さんの登録スコアを表示します",onClick:()=>this.view(1)},
      {icon:<EqualizerIcon />,primary:"統計データを表示",secondary:(res.displayName) + "さんの統計データを表示します",onClick:()=>this.view(4)},
      {icon:<WbIncandescentIcon />,primary:"AAA達成表",secondary:"BPIに基づいたAAA達成難易度表を表示します",onClick:()=>this.view(2)},
      {icon:<EventNoteIcon />,primary:"ランキング",secondary:"ランキング参加履歴を表示します",onClick:()=>this.view(5)},
    ]
    if(res.showNotes){
      buttons.push({icon:<CommentIcon />,primary:"投稿ノート一覧",secondary:(res.displayName) + "さんが投稿した攻略情報一覧",onClick:()=>this.view(3)});
    }
    const themeColor = _currentTheme();
    return (
      <div style={{width:"100%"}}>
        <Helmet>
          <meta name="description"
            content={`${res.displayName}さんのbeatmaniaIIDX スコアデータを閲覧できます。総合BPI:${totalBPI},アリーナランク:${res.arenaRank || "登録なし"}。${res.profile}`}
          />
        </Helmet>
        <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover",width:"100%"}}>
        <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"5vh 0",alignItems:"center",justifyContent:"center",width:"100%"}}>
          <SwipeableViews style={{width:"90%"}} index={index} onChangeIndex={this.handleChangeIndex}>
            <div style={{textAlign:"center",color:themeColor === "light" ? "#222" : "#fff"}}>
              <div>
                <Avatar style={{width:"150px",height:"150px",border:"1px solid #ccc",margin:"15px auto"}}>
                  <img src={res.photoURL ? res.photoURL.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                    alt={res.displayName}
                    onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(res) || alternativeImg(res.displayName)}/>
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
                    最終更新:{res.timeStamp}<br/>
                    バージョン:{versionString(_currentStore())}
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
            <div style={{width:"100%",height:"100%",overflow:"hidden"}}>
              <Radar radar={radar}/>
            </div>
          </SwipeableViews>
        </div>
        <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"5px 0 30px 0",alignItems:"center",justifyContent:"center"}}>
          <span className={this.tabClasses(0)} onClick={()=>this.handleChangeIndex(0)}></span>
          <span className={this.tabClasses(1)} onClick={()=>this.handleChangeIndex(1)}></span>
        </div>
        </div>
        {(!res.totalBPIs || (res.totalBPIs && !res.totalBPIs[_currentStore()])) && (
          <Alert severity="warning">
            このユーザーは現在設定中のバージョン({_currentStore()})でスコアを登録していません。<br/>
            <RefLink to={"/settings"} style={{textDecoration:"none"}}><Link color="secondary" component="span">設定</Link></RefLink>からほかのバージョンを指定の上、再度表示してください。
          </Alert>
        )}
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
        {(this.getIIDXId(res.profile) !== "" || getTwitterName(res.profile) !== "") && <Divider style={{margin:"5px 0 10px 0"}}/>}
        <List>
        {this.getIIDXId(res.profile) !== "" &&
          <form method="post" name="rivalSearch" action={`https://p.eagate.573.jp/game/2dx/${_currentStore()}/rival/rival_search.html#rivalsearch`}>
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
        {getTwitterName(res.profile) !== "" &&
          <ListItem component="a" button disabled={add || processing} href={`https://twitter.com/${getTwitterName(res.profile)}`}>
            <ListItemAvatar>
              <Avatar style={{background:avatarBgColor,color:avatarFontColor}}>
                <TwitterIcon/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={"Twitter"} secondary={`@${getTwitterName(res.profile)}`} />
            <ListItemSecondaryAction>
              <IconButton edge="end">
                <ArrowForwardIosIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        }
        </List>
        <div style={{width:"50%",margin:"10px auto"}}>
          <p style={{textAlign:"center"}}>プロフィールをシェア</p>
          <ShareButtons withTitle={true} url={url} text={res.displayName + " 総合BPI:" + String(Number.isNaN(totalBPI) ? "-" : totalBPI)}/>
        </div>
        <ShowSnackBar message={message} variant={message === "ライバルを追加しました" ? "success" : "error"}
          handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      {loadingRecommended && <Loader/>}
      {!loadingRecommended && (
        <div style={{display:"flex",flexWrap:"wrap",justifyContent:"space-around",overflow:"hidden",margin:"15px auto",width:"90%"}}>
          <GridList  cellHeight={180} style={{height:"400px",width:"100%"}}>
            <GridListTile key="Subheader" cols={2} style={{ height: 'auto' }}>
              <ListSubheader component="div">実力が近いユーザー:</ListSubheader>
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
                  onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(tile) || alternativeImg(tile.displayName)}/>
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
              指定されたユーザーは見つかりませんでした<br/>
              プロフィールが非公開か、表示名が変更された可能性があります。
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
