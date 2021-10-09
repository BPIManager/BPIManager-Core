import * as React from 'react';
import Container from '@mui/material/Container';
import { injectIntl } from 'react-intl';
import weeklyStore from '@/components/firebase/ranking';
import Typography from '@mui/material/Typography';
import { _prefixFullNum, difficultyDiscriminator } from '@/components/songs/filter';
import { _currentTheme } from '@/components/settings';
import timeFormatter, { untilDate, _isBetween, isBeforeSpecificDate } from '@/components/common/timeFormatter';
import Button from '@mui/material/Button';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import JoinModal from '@/view/components/ranking/modal/join';
import { scoresDB } from '@/components/indexedDB';
import { songData, scoreData } from '@/types/data';
import { httpsCallable } from '@/components/firebase';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select/Select';
import MenuItem from '@mui/material/MenuItem';
import Loader from '@/view/components/common/loader';
import { ShareOnTwitter } from '@/view/components/common/shareButtons';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import { getAltTwitterIcon } from '@/components/rivals';
import bpiCalcuator from '@/components/bpi';
import ModalUser from '@/view/components/rivals/modal';
import Divider from '@mui/material/Divider';
import ButtonGroup from '@mui/material/ButtonGroup';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Badge from '@mui/material/Badge';
import DeleteModal from '@/view/components/ranking/modal/delete';
import { borderColor } from '@/components/common';
import EditIcon from '@mui/icons-material/Edit';
import EditModal from './crud/update';
import fbActions from '@/components/firebase/actions';
import InfoIcon from '@mui/icons-material/Info';
import { Details } from './rankingInfo';

interface S {
  isLoading:boolean,
  onGoing:any,
  onGoingId:string,
  joinModal:boolean,
  song:songData|null,
  score:scoreData|null,
  page:number,
  rank:any,
  contentLoading:boolean,
  isModalOpen:boolean,
  isDeleteModalOpen:boolean,
  currentUserName:string,
  uid:string,
  isOpenEditModal:boolean,
  authorData:any,
  isOpenDetail:boolean
}

class WeeklyOnGoing extends React.Component<{intl:any,rankingId?:string}&RouteComponentProps,S> {

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      onGoing:null,
      onGoingId:"",
      joinModal:false,
      song:null,
      score:null,
      page:0,
      rank:null,
      contentLoading:false,
      isModalOpen:false,
      isDeleteModalOpen:false,
      currentUserName:"",
      uid:"",
      isOpenEditModal:false,
      authorData:null,
      isOpenDetail:false
    }
  }

  componentDidMount(){
    this.load(true);
  }

  async load(getUserData:boolean = false){
    const fb = new weeklyStore();
    const fba = new fbActions();
    const scdb = new scoresDB();
    let authorData = null;

    const urlId = this.props.rankingId || (this.props.match.params as any).id;
    const current = urlId ? await fb.getRanking(urlId) : await fb.currentRanking();
    if(!current){
      this.setState({isLoading:false});
    }else{
      const d = current.data();
      if(!d){return this.setState({isLoading:false});}
      const score = await scdb.getItem(d.title,difficultyDiscriminator(d.difficulty),d.version,1);
      const songData = d.song;
      const res = await httpsCallable(`ranking`,`viewRanking`,{
        cId:current.id,
        includeRank:true,
        currentUser:true,
        page:0,
        version:d.version,
      });
      if(res.data.error){return;}
      if(getUserData && d.authorId){
        authorData = await fba.searchByExactId(d.authorId);
      }
      this.setState({
        onGoing:d,
        onGoingId:current.id,
        isLoading:false,
        song:songData,
        score:score.length > 0 ? score[0] : null,
        page:0,
        rank:this.calcBPI(res.data,songData),
        uid:res.data.auth ? res.data.auth.uid : "",
        authorData: getUserData ? authorData : this.state.authorData
      });
    }
  }

  handleOpenEditModal = async(isUpdating:boolean = false,reload?:boolean)=>{
    if(isUpdating && !reload) return;
    if(reload){
      await this.load();
    }
    this.setState({
      isOpenEditModal:!this.state.isOpenEditModal,
    })
  }

  handleToggle = ()=>this.setState({joinModal:!this.state.joinModal});

  joinExec = async (score:number):Promise<{error:boolean,errorMessage:string}>=>{
    const {onGoingId,song,onGoing} = this.state;
    if(!song){return {error:true,errorMessage:"楽曲データが見つかりません"};}
    try{
      const data = {
        cId:onGoingId,
        title:song.title,
        difficulty:song.difficulty,
        score:score,
        version:onGoing.version,
      };
      const p = await httpsCallable(`ranking`,`joinRanking`,data);
      if(p.data.error){
        throw new Error(p.data.errorMessage);
      }
      this.pageLoad();
      return {error:false,errorMessage:""};
    }catch(e:any){
      console.log(e);
      return {error:true,errorMessage:e.message};
    }
  }

  deleteExec = async():Promise<{error:boolean,errorMessage:string}>=>{
    const {onGoingId,song,onGoing} = this.state;
    if(!song){return {error:true,errorMessage:"楽曲データが見つかりません"};}
    try{
      const data = {
        cId:onGoingId,
        version:onGoing.version,
      };
      const p = await httpsCallable(`ranking`,`deleteFromRanking`,data);
      if(p.data.error){
        throw new Error(p.data.errorMessage);
      }
      this.pageLoad();
      return {error:false,errorMessage:""};
    }catch(e:any){
      console.log(e);
      return {error:true,errorMessage:e.message};
    }

  }

  pageLoad = async(page:number = 0)=>{
    this.setState({contentLoading:true});
    const res = await httpsCallable(`ranking`,`viewRanking`,{
      cId:this.state.onGoingId,
      includeRank:true,
      currentUser:true,
      page:page,
      version:this.state.onGoing.version,
    });
    if(res.data.error){return;}
    this.setState({contentLoading:false,page:page,rank:this.calcBPI(res.data)});
  }

  pageChange = (_e:SelectChangeEvent<number>)=>{
    if(typeof _e.target.value !== "number") return;
    return this.pageLoad(_e.target.value);
  }

  calcBPI = (data:any,forceSongData?:songData|null)=>{
    const song = this.state.song || forceSongData;
    const calc = new bpiCalcuator();
    if(!song){return [];}
    data.info.rankBody = data.info.rankBody.reduce((groups:any[],item:any)=>{
      item["BPI"] = calc.setPropData(song,item.exScore,1);
      item["PER"] = Math.round(item.exScore / (song.notes * 2) * 10000) / 100;
      groups.push(item);
      return groups;
    },[])
    return data;
  }

  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag});
  deleteScore = (flag:boolean)=>this.setState({isDeleteModalOpen:flag});
  open = (uid:string)=> this.setState({isModalOpen:true,currentUserName:uid});

  toggleDetail = ()=>this.setState({isOpenDetail:!this.state.isOpenDetail});

  render(){
    const {onGoing,isLoading,onGoingId,joinModal,song,score,page,rank,contentLoading,isModalOpen,currentUserName,isDeleteModalOpen,uid,isOpenEditModal,authorData,isOpenDetail} = this.state;
    const themeColor = _currentTheme();
    const isModal = !!this.props.rankingId;
    const pager = ()=>{
      const p = [];
      for(let i =0; i < rank.info.fullPageNum; ++i){
        p.push(i);
      }
      return p;
    }
    if(isLoading){
      return (<div style={{marginTop:"50px"}}><Loader text="ランキングを読込中"/></div>);
    }
    if(!song){
      return (<p>ランキング情報が見つかりませんでした。<br/>しばらく待ってから再度お試しください。</p>);
    }

    const isBetween = _isBetween(new Date().toString(),onGoing.since.toDate(),onGoing.until.toDate());
    const isBefore = isBeforeSpecificDate(new Date(),onGoing.since.toDate());
    const paging = (
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <FormControl variant="standard">
          <InputLabel>ページ</InputLabel>
          <Select value={page} onChange={this.pageChange}>
          {
            pager().map((item:number)=>{
              return (<MenuItem key={item} value={item}>{item + 1}ページ</MenuItem>);
            })
          }
          </Select>
        </FormControl>
      </div>);
    const remainTime = ()=>{
        if(isBetween) return `終了まで残り${untilDate(onGoing.until.toDate())}日`;
        if(!isBetween && !isBefore) return `終了済みのランキング`;
        if(!isBetween && isBefore) return `開催まであと${untilDate(onGoing.until.toDate())}日`;
    }
    return (
      <div>
        <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
          <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"5vh 0",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center"}}>
            <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
              {onGoing.rankName || "無題のランキング"}
            </Typography>
            <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
              {song && <span>☆{song["difficultyLevel"]}</span>}
            </Typography>
            <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
              {onGoing.title}({_prefixFullNum(onGoing.difficulty)})
            </Typography>
            <Typography component="small" variant="caption" color="textPrimary" gutterBottom>
              <Link
                color="secondary"
                component="span"
                onClick={()=>this.open(authorData.uid)}
                underline="hover">{authorData.displayName}</Link>さんが開催<br/><br/>
              開催期間:{timeFormatter(4,onGoing.since.toDate())}~{timeFormatter(4,onGoing.until.toDate())}<br/>
              {remainTime()} / {rank.info.users}人参加中
            </Typography>
            <ButtonGroup>
              {onGoing.authorId === uid && (
                <Button startIcon={<EditIcon/>} color="secondary" variant="outlined" onClick={()=>this.handleOpenEditModal()}>
                  ランキングを編集
                </Button>
              )}
              <Button startIcon={<InfoIcon/>} color="secondary" variant="outlined" onClick={this.toggleDetail}>
                ランキング詳細
              </Button>
            </ButtonGroup>
          </div>
        </div>
        <ButtonGroup style={{marginBottom:"5px"}} fullWidth>
          {isBetween && (
            <Button startIcon={<TouchAppIcon/>} color="secondary" style={{padding:"12px 0",borderRadius:"0",border:"0px",borderBottom:"1px solid " + borderColor() + "60",borderRight:"1px solid " + borderColor() + "60",borderTop:"1px solid " + borderColor() + "60"}} onClick={this.handleToggle}>
              参加 / 更新
            </Button>
          )}
          {!isModal &&
            <Button color="secondary" style={{padding:"12px 0",borderRadius:"0",border:"0px",borderBottom:"1px solid " + borderColor() + "60",borderTop:"1px solid " + borderColor() + "60"}} onClick={()=>this.props.history.push("/ranking/")}>
              ランキング一覧
            </Button>
          }
        </ButtonGroup>
        <Container fixed  className="commonLayout">
          {rank.error && (
            <p>エラーが発生しました。再読込してください。</p>
          )}
          {!rank.error && (
            <div>
              {(rank.info.rank && rank.info.rank !== -1 && rank.info.detail) && (
              <Typography component="h5" variant="h5" color="textPrimary" gutterBottom style={{textAlign:"center"}}>
                <span>{rank.info.rank}位 / {rank.info.users}人中</span>
                <ShareOnTwitter
                  text={`「${onGoing.rankName}」に参加中！(${remainTime()})\n対象楽曲：${onGoing.title}(${_prefixFullNum(onGoing.difficulty)})\n登録スコア：${rank.info.detail.exScore}\n現在の順位：${rank.info.users}人中${rank.info.rank}位\n`}
                  url={`https://bpi.poyashi.me/ranking/id/${onGoingId}`}/>
              </Typography>
              )}
              {(rank.info.rank === -1 || !rank.info.rank) && (
                <div>
                  <Typography component="h5" variant="h5" color="textPrimary" gutterBottom style={{textAlign:"center"}}>
                    <span>未参加</span>
                  </Typography>
                  <Typography component="p" variant="caption" color="textPrimary" gutterBottom style={{textAlign:"center"}}>
                        {(isBetween) && `「参加 / 更新」ボタンからスコアを登録！`}
                        {(!isBetween && !isBefore) && `終了済みのランキングです`}
                        {(!isBetween && isBefore) && `開催まであと${untilDate(onGoing.until.toDate())}日お待ち下さい`}
                    <br/><br/>
                    <ShareOnTwitter
                      text={`「${onGoing.rankName}」\n対象楽曲：${onGoing.title}(${_prefixFullNum(onGoing.difficulty)})\n集計期間：${remainTime()}`}
                      url={`https://bpi.poyashi.me/ranking/id/${onGoingId}`}/>
                  </Typography>
                </div>
              )}
              {(rank.info.rank && rank.info.rank !== -1 && isBetween) && (
                <div style={{textAlign:"center"}}>
                  <Divider style={{margin:"10px 0"}}/>
                  <Link
                    color="secondary"
                    component="span"
                    onClick={()=>this.deleteScore(true)}
                    underline="hover">登録済みのスコアを削除</Link>
                </div>
              )}
              <Divider style={{margin:"15px 0"}}/>
              {contentLoading && <Loader/>}
              {(!contentLoading && rank.info.users > 0) && (
                <div>
                {paging}
                <List>
                  {rank.info.rankBody.map((item:any,_i:number)=>{
                    const badgeContent = ()=>{
                      if(_i === rank.info.rankBody.length || !rank.info.rankBody[_i + 1]) return null;
                      const next = rank.info.rankBody[_i + 1];
                      const gap = item.exScore - next.exScore;
                      if(gap > 99){
                        return ">99";
                      }
                      return "+" + gap;
                    }
                    return (
                      <ListItem key={item.name} button onClick={()=>this.open(item.uid)}>
                        <ListItemAvatar>
                          <Badge
                            color="secondary"
                            anchorOrigin={{
                              vertical: 'bottom',
                              horizontal: 'right',
                            }} badgeContent={badgeContent()}>
                          <Badge
                            anchorOrigin={{
                              vertical: 'top',
                              horizontal: 'left',
                            }} badgeContent={item.rank + "位"} color="primary">
                            <Avatar>
                              <img src={item.icon ? item.icon.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                                alt={item.name}
                                onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(item)}/>
                            </Avatar>
                          </Badge>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText primary={item.name} secondary={`EXSCORE:${item.exScore}(${item.PER}%) / BPI:${item.BPI !== Infinity ? item.BPI : " - "}`} />
                      </ListItem>
                    )
                  })}
                </List>
                {paging}
                </div>
              )}
              {(!contentLoading && rank.info.users === 0) && (
                <Alert severity="info">
                  <AlertTitle>参加者がいません</AlertTitle>
                  <p>
                    ランキングに参加しましょう！<br/>
                    「参加 / 更新」ボタンからスコアを登録してください。<br/>
                    <Link
                      color="secondary"
                      href="https://docs2.poyashi.me/docs/social/ranking/"
                      underline="hover">ランキング機能のヘルプはこちらから確認できます。</Link>
                  </p>
                </Alert>
              )}
            </div>
          )}
        </Container>
        {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} exact handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
        {joinModal && <JoinModal handleToggle={this.handleToggle} joinExec={this.joinExec} song={song} score={score}/>}
        {isDeleteModalOpen && <DeleteModal handleToggle={()=>this.deleteScore(!isDeleteModalOpen)} exec={this.deleteExec}/>}
        {isOpenEditModal &&
          <EditModal isOpen={isOpenEditModal} handleOpen={this.handleOpenEditModal} onGoing={onGoing} onGoingId={onGoingId}/>
        }
        {isOpenDetail && <Details onGoingId={onGoingId} closeModal={this.toggleDetail} onGoing={onGoing} authorData={authorData}/>}
      </div>
    );
  }
}



export default withRouter(injectIntl(WeeklyOnGoing));
