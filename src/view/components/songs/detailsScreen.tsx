import React from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import TwitterIcon from '@mui/icons-material/Twitter';
import { _prefixFromNum, difficultyDiscriminator } from "@/components/songs/filter";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { FormattedMessage } from "react-intl";
import Paper from "@mui/material/Paper";
import bpiCalcuator, { B } from "@/components/bpi";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import YouTubeIcon from '@mui/icons-material/YouTube';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ShowSnackBar from "../snackBar";
import {Button, Tooltip, List, ListItem, SwipeableDrawer, ListItemIcon, ListItemText, ListSubheader, Backdrop, SelectChangeEvent} from '@mui/material';
import BPIChart from "./bpiChart";
import SongDetails from "./songDetails";
import SongDiffs from "./songDiffs";
import TabPanel from "./common/tabPanel";
import {scoresDB,scoreHistoryDB, songsDB} from "@/components/indexedDB";
import { _currentTheme, _area, _isSingle, _currentStore } from "@/components/settings";
import _djRank from "@/components/common/djRank";
import {rivalListsDB} from "@/components/indexedDB";
import fbActions from "@/components/firebase/actions";
import SongRivals from "./songRivals";
import Loader from "../common/loader";
import favLists from "./common/lists";
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import Filter1Icon from '@mui/icons-material/Filter1';
import { config } from "@/config";

import { DBLists } from "@/types/lists";
import { scoreData, songData } from "@/types/data";
import SongNotes from "./songNotes";

import BarChartIcon from '@mui/icons-material/BarChart';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import HistoryIcon from '@mui/icons-material/History';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import RateReviewIcon from '@mui/icons-material/RateReview';

interface P{
  isOpen:boolean,
  song:songData|null,
  score:scoreData|null,
  handleOpen:(flag:boolean,row?:any,willDeleteItems?:{title:string,difficulty:string}|null)=>void,
  willDelete?:boolean,
  firstView?:number,
}

interface ListItemBody{title:string,num:number,description:string,length:number}

interface S{
  isError:boolean,
  newScore:number,
  newBPI:number,
  newClearState:number,
  newMissCount:number,
  newMemo:string,
  showCharts:boolean,
  chartData:chartData[],
  currentTab:number,
  openShareMenu:boolean,
  openListsMenu:boolean,
  justFavorited:boolean,
  justSelectedList:string,
  successSnack:boolean,
  errorSnack:boolean,
  errorSnackMessage:any,
  graphLastUpdated:number,
  isSaving:boolean,
  showBody:boolean,
  hasRival:boolean,
  isLoading:boolean,
  allLists:ListItemBody[],
  allSavedLists:number[],
  isPreparing:boolean,
  hasModifiedMemo:boolean,
}

export interface chartData{
  "name":string,
  "EX SCORE":number
}

class DetailedSongInformation extends React.Component<P & {intl?:any},S> {

  private calc:bpiCalcuator = new bpiCalcuator();

  constructor(props:P & {intl?:any}){
    super(props);
    this.state = {
      isError:false,
      isLoading:true,
      newScore: NaN,
      newBPI:NaN,
      newClearState:-1,
      newMissCount:-1,
      newMemo:"",
      showCharts : true,
      chartData:this.makeGraph().reverse(),
      justFavorited:false,
      justSelectedList:"",
      currentTab:0,
      openShareMenu:false,
      openListsMenu:false,
      successSnack:false,
      errorSnack:false,
      errorSnackMessage:"",
      graphLastUpdated:new Date().getTime(),
      isSaving:false,
      showBody:false,
      hasRival:false,
      allLists:[],
      allSavedLists:[],
      isPreparing:false,
      hasModifiedMemo:false,
    }
  }

  async componentDidMount(){
    const r = new rivalListsDB();
    const hasRivals = await r.getAll();
    this.setState({
      hasRival:hasRivals.length > 0,
      isLoading:false,
      currentTab:this.props.firstView || 0
    });
    window.history.pushState(null,"Detail",null);
    window.addEventListener("popstate",this.overridePopstate,false);
  }

  componentWillUnmount(){
    window.removeEventListener("popstate",this.overridePopstate,false);
  }

  overridePopstate = ()=>this.props.handleOpen(false);

  toggleShowBPI = ():void=>{
    return this.setState({showBody:!this.state.showBody});
  }

  makeGraph = (newScore?:number):chartData[]=>{
    let data:chartData[] = [],lastExScore = 0;
    const {song,score} = this.props;
    const dataInserter = (exScore:number,label:string):number=>{
      return data.push({
        "name" : label,
        "EX SCORE" : exScore
      });
    }
    if(!song || !score){ return []; }
    this.calc.setData(song.notes * 2, song.avg, song.wr);
    this.calc.setCoef(song.coef || -1);
    const bpiBasis = [0,10,20,30,40,50,60,70,80,90,100];
    const mybest = newScore ? newScore : score.exScore;
    if(song.wr === -1){
      dataInserter(0,"");
      dataInserter(0,"");
      dataInserter(mybest,"YOU");
      return data;
    }
    for(let i = 0;i < bpiBasis.length; ++i){
      const exScoreFromBPI:number = this.calc.calcFromBPI(bpiBasis[i],true);
      if(lastExScore < mybest && mybest <= exScoreFromBPI){
        dataInserter(mybest,"YOU");
        lastExScore = mybest;
      }
      lastExScore = exScoreFromBPI;
      dataInserter(exScoreFromBPI,String(bpiBasis[i]));
    }
    if(lastExScore < mybest){
      dataInserter(mybest,"YOU");
    }
    return data;
  }

  handleScoreInput = async(e:React.FocusEvent<HTMLInputElement>):Promise<void>=>{
    const {song} = this.props;
    if(this.state.isSaving){
      return this.setState({errorSnack:true,errorSnackMessage:"保存中です"});
    }
    if(!song){
      return this.setState({errorSnack:true,errorSnackMessage:"楽曲データが不正です。"});
    }
    const newScore:number = Number(e.target.value);
    const newBPI:B = await this.calc.calc(song.title,song.difficulty,newScore);
    if(newBPI.error){
      return this.setState({errorSnack:true,errorSnackMessage:newBPI.reason});
    }
    return this.setState({
      newScore:newScore,
      newBPI:Math.floor(newBPI.bpi * 100) / 100,
      chartData:this.makeGraph(newScore).reverse(),
      graphLastUpdated:new Date().getTime()
    })
  }

  handleTabChange = (_e:React.ChangeEvent<{}>, newValue:number)=>{
    this.setState({currentTab:newValue});
  }

  toggleMenu = (willOpen:boolean = false)=>{
    this.setState({openShareMenu: willOpen });
  }

  toggleListsMenu = async(willOpen:boolean = false)=>{
    if(willOpen){
      const f = new favLists();
      const title = this.props.song ? this.props.song.title : "";
      const difficulty = this.props.song ? this.props.song.difficulty : "";
      const p = await f.loadLists();
      const q = await f.loadSavedLists(title,difficulty);
      this.setState({
        allLists:p.reduce((groups:ListItemBody[],item:DBLists)=>{
          groups.push({title:item.title,num:item.num,description:item.description,length:item.length});
          return groups;
        },[]),
        allSavedLists:q.reduce((groups:number[],item:any)=>{
          groups.push(item.listedOn);
          return groups;
        },[]),
        isLoading:false,
      });
    }
    this.setState({openListsMenu: willOpen });
  }

  toggleFavLists = async (target:{title:string,num:number},willAdd:boolean)=>{
    try{
      const {allSavedLists} = this.state;
      const title = this.props.song ? this.props.song.title : "";
      const difficulty = this.props.song ? this.props.song.difficulty : "";
      const res = await new favLists().toggleLists(title,difficulty,target.num,willAdd);
      if(res){
        this.toggleListsMenu(false);
        this.toggleSuccessSnack();
        return this.setState({
          justFavorited:willAdd,
          justSelectedList:target.title,
          allSavedLists:willAdd ? allSavedLists.concat(target.num) : allSavedLists.filter((item:number)=> item !== target.num)
        });
      }
    }catch(e:any){
      console.log(e);
      alert("追加に失敗しました");
    }
  }

  jumpWeb = async(type:number):Promise<void> =>{
    if(!this.props.song){return;}
    switch(type){
      case 0:
        window.open("http://textage.cc/score/" + this.props.song.textage);
      break;
      case 1:
        window.open("https://www.youtube.com/results?search_query=" + this.props.song.title.replace(/-/g,"") + "+IIDX");
      break;
      case 2:
        window.open(
          `https://rank.poyashi.me/songDetail/${this.props.song.title}/${difficultyDiscriminator(this.props.song.difficulty)}/${_currentStore()}`
        );
      break;
      case 3:
        if(!this.props.score) return;
        this.setState({isPreparing:true});
        const score = this.state.newScore ? this.state.newScore : this.props.score.exScore;
        const bpi = this.state.newBPI ? this.state.newBPI : this.props.score.currentBPI;
        const diff = this.props.score.lastScore !== -1 ? score - this.props.score.lastScore : score;
        const text = encodeURIComponent(`[${diff > 0 ? "+" + diff : diff}] ${this.props.song.title}${_prefixFromNum(this.props.song.difficulty,true)} [EX:${score}(${this.showRank(false)}${this.showRank(true)})][BPI:${bpi}]`);
        new fbActions().auth().onAuthStateChanged(async (user: any)=> {
          if(user){
            const res = await new fbActions().createShare(Object.assign(this.props.score,{
              exScore:score,
              currentBPI:bpi
            }),user.uid);
            window.open(`https://twitter.com/intent/tweet?&url=${config.baseUrl}/share/${res.id}&text=${text}`);
          }else{
            window.open(`https://twitter.com/intent/tweet?&text=${text}`);
          }
        });
        this.setState({isPreparing:false});
      break;
    }
    return this.toggleMenu();
  }

  toggleSuccessSnack = ()=>this.setState({successSnack:!this.state.successSnack});
  toggleErrorSnack = ()=>this.setState({errorSnack:!this.state.errorSnack});

  calcRank = ()=> this.props.score ? `${this.calc.rank(!Number.isNaN(this.state.newBPI) ? this.state.newBPI : this.props.score.currentBPI)}` : "-";

  saveAndClose = async()=>{
    try{
      const {newBPI,newScore,newMemo,newClearState,newMissCount,hasModifiedMemo} = this.state;
      const {score,song,willDelete} = this.props;
      if(!song || !score){return;}
      this.setState({isPreparing:true});
      const scores = new scoresDB(), scoreHist = new scoreHistoryDB(), songs = new songsDB();
      if(!Number.isNaN(newScore) || newClearState !== -1 || newMissCount !== -1) await scores.updateScore(score,{currentBPI:newBPI,exScore:newScore,clearState:newClearState,missCount:newMissCount});
      if(!Number.isNaN(newBPI)) scoreHist._add(Object.assign(score, { difficultyLevel: song.difficultyLevel, currentBPI: newBPI, exScore: newScore }));
      if(hasModifiedMemo && newMemo !== song.memo){
        await songs.updateMemo(song,newMemo);
        song.memo = newMemo;
      }
      this.props.handleOpen(true,song,willDelete ? {title:score.title,difficulty:score.difficulty} : null);
    }catch(e:any){
      return this.setState({errorSnack:true,errorSnackMessage:e});
    }
  }

  showRank = (isBody:boolean):string=>{
    const {song,score} = this.props;
    const {showBody,newScore} = this.state;
    if(!song || !score){return "-";}
    const max:number = song.notes * 2;
    const s:number = !Number.isNaN(newScore) ? newScore : score.exScore;
    return _djRank(showBody,isBody,max,s);
  }

  isModified = ()=>{
    const {newBPI,newScore,newClearState,newMemo,newMissCount,hasModifiedMemo} = this.state;
    const {score,song} = this.props;
    if(!score || !song){
      return false;
    }
    return (
      !Number.isNaN(newBPI) ||
      !Number.isNaN(newScore) ||
      (newClearState !== -1 && newClearState !== score.clearState) ||
      (newMissCount !== -1 && newMissCount !== score.missCount) ||
      (hasModifiedMemo && newMemo !== song.memo)
    );
  }

  handleClearState = (e:SelectChangeEvent<number>)=> this.setState({newClearState:Number(e.target.value) < 0 ? 0 : Number(e.target.value)});
  handleMissCount = (e:React.ChangeEvent<HTMLInputElement>)=> this.setState({newMissCount:Number(e.target.value) < 0 ? 0 : Number(e.target.value)});
  handleMemo = (e:React.ChangeEvent<HTMLInputElement>)=> this.setState({hasModifiedMemo:true,newMemo:e.target.value || ""});

  nextBPI = (nextBPI:number,currentScore:number)=>{
    if(nextBPI < 0) nextBPI = 0;
    return <span>BPI{nextBPI}まであと&nbsp;{this.calc.calcFromBPI(nextBPI,true) - currentScore}&nbsp;点</span>
  }

  render(){
    const {isOpen,handleOpen,song,score} = this.props;
    const {
      isSaving,isLoading,isPreparing,newScore,newMemo,newBPI,newClearState,newMissCount,showCharts,chartData,
      currentTab,justSelectedList,openListsMenu,openShareMenu,justFavorited,allLists,allSavedLists,successSnack,errorSnack,errorSnackMessage,
      hasModifiedMemo} = this.state;
    const nextBPI = Math.ceil((!Number.isNaN(newBPI) ? newBPI : score ? score.currentBPI : -15) / 10) * 10;
    const currentScore = !Number.isNaN(newScore) ? newScore : score ? score.exScore : 0;
    if(!song || !score){
      return (null);
    }
    if(isLoading){
      return (null);
    }
    const c = _currentTheme();
    return (
      <Dialog id="detailedScreen" className={c === "dark" ? "darkDetailedScreen" : c === "light" ? "lightDetailedScreen" : "deepSeaDetailedScreen"} fullScreen open={isOpen} onClose={handleOpen} style={{overflowX:"hidden",width:"100%"}}>
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={()=>handleOpen(false)}
              aria-label="close"
              size="large">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{flexGrow:1}}>
              {song.title + _prefixFromNum(song.difficulty)}
            </Typography>
            {this.isModified() &&
              <div style={{position:"relative"}}>
                <Button variant="contained" color="secondary" onClick={this.saveAndClose} disabled={isSaving}>
                  <FormattedMessage id="Details.SaveButton"/>
                </Button>
                {isSaving && <Loader isInner/>}
              </div>
            }
          </Toolbar>
        </AppBar>
        {isPreparing &&
          <Backdrop open={true} className="absolutelyTop">
            <Loader/>
          </Backdrop>
        }
        <Toolbar/>
        <Paper>
          <Grid container spacing={3} justifyContent="space-around" className="detailsScreenTopGrid">
            <Grid onClick={this.toggleShowBPI} item xs={4} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0",cursor:"pointer"}}>
              <Tooltip title="プラス/マイナス表記の切り替え">
                <div style={{textAlign:"center"}}>
                  <Typography component="h6" variant="h6" color="textSecondary">
                    {score && <span>{this.showRank(false)}</span>}
                  </Typography>
                  <Typography component="h4" variant="h4" color="textPrimary">
                    {score && <span>{this.showRank(true)}</span>}
                  </Typography>
                </div>
              </Tooltip>
            </Grid>
            <Grid item xs={4} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0"}}>
              <Typography component="h6" variant="h6" color="textSecondary">
                BPI
              </Typography>
              <Typography component="h4" variant="h4" color="textPrimary">
                {song.wr === -1 && <span>-</span>}
                {song.wr !== -1 && <div>
                  {(score && Number.isNaN(newBPI) && !Number.isNaN(score.currentBPI)) && score.currentBPI}
                  {!Number.isNaN(newBPI) && newBPI}
                  {(Number.isNaN(score.currentBPI) && Number.isNaN(newBPI)) && <span>-</span>}
                </div>}
              </Typography>
            </Grid>
            <Grid item xs={4} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0"}}>
              <Typography component="h6" variant="h6" color="textSecondary">
                RANK
              </Typography>
              <Typography component="h4" variant="h4" color="textPrimary">
                {song.wr === -1 && <span>-</span>}
                {song.wr !== -1 && <div>
                  {(!Number.isNaN(score.currentBPI) || !Number.isNaN(newBPI)) && <span>{this.calcRank()}</span>}
                  {(Number.isNaN(score.currentBPI) && Number.isNaN(newBPI)) && <span>-</span>}
                </div>}
              </Typography>
            </Grid>
          </Grid>
          {(!Number.isNaN(nextBPI) && nextBPI !== Infinity) && (
            <Typography component="p" variant="caption" style={{textAlign:"center",position:"relative",bottom:"7px",fontSize:"10px"}}>
              {this.nextBPI(nextBPI,currentScore)}
            </Typography>
          )}
          <Divider/>
          <Grid container flexWrap="nowrap" >
            <Grid item xs={10}>
              <form noValidate autoComplete="off" style={{margin:"10px 6px 0"}} className="detailedInputForm">
                <TextField
                  type="number"
                  size="small"
                  style={{width:"100%"}}
                  label={<span style={{fontSize:"13px !important"}}><FormattedMessage id="Details.typeNewScore"/></span>}
                  value={currentScore}
                  onChange={this.handleScoreInput}
                  onKeyPress={(e)=>{if(e.key === "Enter") e.preventDefault()}}
                />
              </form>
            </Grid>
            <Grid item xs={1} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
              <div style={{margin:"10px 6px 0"}}>
                <Tooltip title="楽曲をリストに追加/削除">
                  <IconButton
                    style={{margin:"0 6px 0"}}
                    aria-haspopup="true"
                    onClick={()=>this.toggleListsMenu(true)}
                    size="large">
                      <PlaylistAddCheckIcon/>
                    </IconButton>
                  </Tooltip>
                  <SwipeableDrawer
                    anchor="bottom"
                    className="overlayDrawer"
                    open={openListsMenu}
                    onClose={()=>this.toggleListsMenu(false)}
                    onOpen={()=>this.toggleListsMenu(true)}
                    >
                      <List
                        subheader={
                          <ListSubheader component="div" id="nested-list-subheader">
                            楽曲のリスト管理
                          </ListSubheader>
                      }>
                        {allLists.map((item:ListItemBody)=>{
                          const alreadyExists = allSavedLists.indexOf(item.num) > -1;
                          return (
                          <ListItem button onClick={()=>this.toggleFavLists(item,!alreadyExists)} key={item.num}>
                            <ListItemIcon>{alreadyExists ? <CheckBoxIcon/> : <CheckBoxOutlineBlankIcon/>}</ListItemIcon>
                            <ListItemText primary={`${item.title}(${item.length})`} secondary={item.description}/>
                          </ListItem>
                        )})}
                      </List>
                  </SwipeableDrawer>
              </div>
              <ShowSnackBar
                message={
                  <span>{(justFavorited ? <FormattedMessage id="Details.FavButtonAdded"/> : <FormattedMessage id="Details.FavButtonRemoved"/>)}:{justSelectedList}</span>
                }
                variant="success" handleClose={this.toggleSuccessSnack} open={successSnack} autoHideDuration={3000}/>
            </Grid>
            <Grid item xs={1} style={{display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
              <Tooltip title="外部サイト連携">
                <IconButton
                  style={{margin:"0 6px 0",position:"relative",top:"5px"}}
                  aria-haspopup="true"
                  onClick={()=>this.toggleMenu(true)}
                  size="large">
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <SwipeableDrawer
                anchor="bottom"
                className="overlayDrawer"
                open={openShareMenu}
                onClose={()=>this.toggleMenu(false)}
                onOpen={()=>this.toggleMenu(true)}
                >
                  <List>
                    <ListItem button onClick={()=>this.jumpWeb(0)}>
                      <ListItemIcon><FormatListBulletedIcon/></ListItemIcon>
                      <ListItemText primary="TexTage" secondary="TexTageでこの楽曲の譜面を確認します"/>
                    </ListItem>
                    <ListItem button onClick={()=>this.jumpWeb(1)}>
                      <ListItemIcon><YouTubeIcon/></ListItemIcon>
                      <ListItemText primary="YouTube" secondary="YouTubeでこの楽曲の動画を検索します"/>
                    </ListItem>
                    <ListItem button onClick={()=>this.jumpWeb(2)}>
                      <ListItemIcon><StarHalfIcon/></ListItemIcon>
                      <ListItemText primary="BPIMRanks" secondary="この楽曲のランキングをBPIMRanksで確認します"/>
                    </ListItem>
                    <form method="post" name="rivalSearch" action={"https://p.eagate.573.jp/game/2dx/" + _currentStore() +"/ranking/topranker.html#musiclist"}>
                      <input type="hidden" name="pref_id" value={_area()}/>
                      <input type="hidden" name="play_style" value={_isSingle() === 1 ? "0" : "1"}/>
                      <input type="hidden" name="series_id" value={Number(song["textage"].replace(/\/.*?$/,"")) - 1}/>
                      <input type="hidden" name="s" value="1"/>
                      <input type="hidden" name="rival" value=""/>
                      <Button type="submit" fullWidth disableRipple style={{padding:0}}>
                        <ListItem button>
                          <ListItemIcon><Filter1Icon/></ListItemIcon>
                          <ListItemText primary="TOP RANKER" secondary="所属地域のTOP RANKERページのうち、この楽曲が含まれるシリーズを表示します"/>
                        </ListItem>
                      </Button>
                    </form>
                    <Divider style={{margin:"10px 0"}}/>
                    <ListItem button onClick={()=>this.jumpWeb(3)}>
                      <ListItemIcon><TwitterIcon/></ListItemIcon>
                      <ListItemText primary="この楽曲をツイート" secondary="スコアの伸びや現在のBPIなどをツイートします"/>
                    </ListItem>
                  </List>
              </SwipeableDrawer>
            </Grid>
          </Grid>
        </Paper>
        <Tabs
          value={currentTab}
          indicatorColor="primary"
          textColor="primary"
          onChange={this.handleTabChange}
          className={"scrollableSpacebetween sc3Items"}>
          <Tooltip title="BPI分布グラフ">
            <Tab icon={<BarChartIcon/>} />
          </Tooltip>
          <Tooltip title="楽曲情報">
            <Tab icon={<QueueMusicIcon/>} />
          </Tooltip>
          <Tooltip title="過去のプレイ履歴">
            <Tab icon={<HistoryIcon/>} />
          </Tooltip>
          <Tooltip title="ライバルスコア">
            <Tab icon={<SupervisorAccountIcon/>} />
          </Tooltip>
          <Tooltip title="攻略コメント">
            <Tab icon={<RateReviewIcon/>} />
          </Tooltip>
        </Tabs>
        <TabPanel value={currentTab} index={0}>
          {showCharts &&
            <BPIChart song={song} newScore={newScore} score={score} chartData={chartData} graphLastUpdated={this.state.graphLastUpdated}/>
          }
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          <SongDetails song={song} score={score} newMemo={newMemo} newMissCount={newMissCount} newClearState={newClearState}
            handleClearState={this.handleClearState} handleMissCount={this.handleMissCount} handleMemo={this.handleMemo} memoModified={hasModifiedMemo}/>
        </TabPanel>
        <TabPanel value={currentTab} index={2}>
          <SongDiffs song={song} score={score}/>
        </TabPanel>
        <TabPanel value={currentTab} index={3}>
          <SongRivals song={song} score={score}/>
        </TabPanel>
        <TabPanel value={currentTab} index={4}>
          <SongNotes song={song} score={score}/>
        </TabPanel>
        <ShowSnackBar message={errorSnackMessage} variant="warning"
            handleClose={this.toggleErrorSnack} open={errorSnack} autoHideDuration={3000}/>
      </Dialog>
    );
  }
}

export default DetailedSongInformation;
