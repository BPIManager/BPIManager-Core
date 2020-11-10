import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import weeklyStore from '@/components/firebase/ranking';
import Typography from '@material-ui/core/Typography';
import { _prefixFullNum, difficultyDiscriminator } from '@/components/songs/filter';
import { _currentTheme, _currentStore } from '@/components/settings';
import timeFormatter, { untilDate, _isBetween } from '@/components/common/timeFormatter';
import Button from '@material-ui/core/Button';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import JoinModal from '@/view/components/ranking/modal/join';
import { scoresDB, songsDB } from '@/components/indexedDB';
import { songData, scoreData } from '@/types/data';
import { functions } from '@/components/firebase';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Loader from '@/view/components/common/loader';
import { ShareOnTwitter } from '@/view/components/common/shareButtons';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import { getAltTwitterIcon } from '@/components/rivals';
import bpiCalcuator from '@/components/bpi';
import ModalUser from '@/view/components/rivals/modal';
import Divider from '@material-ui/core/Divider';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import { RouteComponentProps, withRouter, Link as RLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Badge from '@material-ui/core/Badge';
import { verNameArr } from '@/view/components/songs/common';

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
  currentUserName:string,
}

class WeeklyOnGoing extends React.Component<{intl:any}&RouteComponentProps,S> {

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
      currentUserName:"",
    }
  }

  async componentDidMount(){
    const fb = new weeklyStore();
    const sdb = new songsDB();
    const scdb = new scoresDB();

    const urlId = (this.props.match.params as any).id;
    const current = urlId ? await fb.getRanking(urlId) : await fb.currentRanking();
    if(!current){
      this.setState({isLoading:false});
    }else{
      const d = current.data();
      if(!d){return this.setState({isLoading:false});}
      const score = await scdb.getItem(d.title,difficultyDiscriminator(d.difficulty),d.version,1);
      const song = await sdb.getOneItemIsSingle(d.title,d.difficulty);
      const songData = song.length > 0 ? song[0] : null;
      const res = await functions.httpsCallable("viewRanking")({
        cId:current.id,
        includeRank:true,
        currentUser:true,
        page:0,
        version:_currentStore(),
      });
      this.setState({onGoing:d,onGoingId:current.id,isLoading:false,song:songData,score:score.length > 0 ? score[0] : null,page:0,rank:this.calcBPI(res.data,songData)});
    }
  }

  handleToggle = ()=>this.setState({joinModal:!this.state.joinModal});

  joinExec = async (score:number):Promise<{error:boolean,errorMessage:string}>=>{
    const {onGoingId,song} = this.state;
    if(!song){return {error:true,errorMessage:"楽曲データが見つかりません"};}
    try{
      const data = {
        cId:onGoingId,
        title:song.title,
        difficulty:song.difficulty,
        score:score,
        version:_currentStore(),
      };
      const p = await functions.httpsCallable("joinRanking")(data);
      if(p.data.error){
        throw new Error(p.data.errorMessage);
      }
      this.pageLoad();
      return {error:false,errorMessage:""};
    }catch(e){
      console.log(e);
      return {error:true,errorMessage:e.message};
    }
  }

  pageLoad = async(page:number = 0)=>{
    this.setState({contentLoading:true});
    const res = await functions.httpsCallable("viewRanking")({
      cId:this.state.onGoingId,
      includeRank:true,
      currentUser:true,
      page:page,
    });
    this.setState({contentLoading:false,page:page,rank:this.calcBPI(res.data)});
  }

  pageChange = (_e:React.ChangeEvent<{ value: unknown }>)=>{
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
  open = (uid:string)=> this.setState({isModalOpen:true,currentUserName:uid})

  render(){
    const {onGoing,isLoading,onGoingId,joinModal,song,score,page,rank,contentLoading,isModalOpen,currentUserName} = this.state;
    const themeColor = _currentTheme();
    const pager = ()=>{
      const p = [];
      for(let i =0; i < rank.info.fullPageNum; ++i){
        p.push(i);
      }
      return p;
    }
    if(isLoading){
      return (<Loader/>);
    }
    if(!song){
      return (<p>ランキング情報が見つかりませんでした。<br/>しばらく待ってから再度お試しください。</p>);
    }

    const isBetween = _isBetween(new Date().toString(),onGoing.since.toDate(),onGoing.until.toDate());
    const paging = (
      <div style={{display:"flex",justifyContent:"flex-end"}}>
        <FormControl>
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

    return (
      <div>
        <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
          <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"5vh 0",alignItems:"center",justifyContent:"center",flexDirection:"column",textAlign:"center"}}>
            <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
              現在開催中のランキング
            </Typography>
            <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
              {onGoing.title}({_prefixFullNum(onGoing.difficulty)})
            </Typography>
            <Typography component="small" variant="caption" color="textPrimary" gutterBottom>
              {song && <span>VERSION:{verNameArr[Number(song["textage"].replace(/\/.*?$/,""))]},☆{song["difficultyLevel"]}</span>}<br/>
              開催期間:{timeFormatter(4,onGoing.since.toDate())}~{timeFormatter(4,onGoing.until.toDate())}<br/>
              {isBetween && <span>終了まで残り{untilDate(onGoing.until.toDate())}日</span>}
              {!isBetween && <span>終了済みのランキングです</span>} / {rank.info.users}人参加中
            </Typography>
            <ButtonGroup style={{marginBottom:"5px"}}>
              {isBetween && (
                <Button startIcon={<TouchAppIcon/>} size="large" color="secondary" variant="outlined" onClick={this.handleToggle}>
                  参加 / 更新
                </Button>
              )}
                <Button size="large" color="secondary" variant="outlined" onClick={()=>this.props.history.push("/ranking/list")}>
                  過去のランキング
                </Button>
            </ButtonGroup>
            <RLink to="/help/ranking"><Link color="secondary" component="span">ランキングについて</Link></RLink>
          </div>
        </div>
        <Container fixed  className="commonLayout">
          {rank.error && (
            <p>エラーが発生しました。再読込してください。</p>
          )}
          {!rank.error && (
            <div>
              {(rank.info.rank !== -1 && rank.info.rank && rank.info.detail) && (
              <Typography component="h5" variant="h5" color="textPrimary" gutterBottom style={{textAlign:"center"}}>
                <span>{rank.info.rank}位 / {rank.info.users}人中</span>
                <ShareOnTwitter
                  text={`BPIMスコアタに参加中！\n対象楽曲：${onGoing.title}(${_prefixFullNum(onGoing.difficulty)})\n登録スコア：${rank.info.detail.exScore}\n現在の順位：${rank.info.users}人中${rank.info.rank}位\n`}
                  url={`https://bpi.poyashi.me/ranking/id/${onGoingId}`}/>
              </Typography>
              )}
              {(rank.info.rank === -1 || !rank.info.rank) && (
              <Typography component="h5" variant="h5" color="textPrimary" gutterBottom style={{textAlign:"center"}}>
                <span>未参加</span>
              </Typography>
              )}
              <Divider style={{margin:"15px 0"}}/>
              {contentLoading && <Loader/>}
              {(!contentLoading && rank.info.users > 0) && (
                <div>
                {paging}
                <List>
                  {rank.info.rankBody.map((item:any,i:number)=>{
                    return (
                      <ListItem key={item.name} button onClick={()=>this.open(item.uid)}>
                        <ListItemAvatar>
                          <Badge badgeContent={(i + 1) + (page * 50) + "位"} color="secondary">
                            <Avatar>
                              <img src={item.icon ? item.icon.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                                alt={item.name}
                                onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(item)}/>
                            </Avatar>
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText primary={item.name} secondary={`EXSCORE:${item.exScore}(${item.PER}%) / BPI:${item.BPI}`} />
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
                    「参加 / 更新」ボタンからスコアを登録してください。
                  </p>
                </Alert>
              )}
            </div>
          )}
        </Container>
        {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} exact handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
        {joinModal && <JoinModal handleToggle={this.handleToggle} joinExec={this.joinExec} song={song} score={score}/>}
      </div>
    );
  }
}



export default withRouter(injectIntl(WeeklyOnGoing));
