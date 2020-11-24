import * as React from 'react';
import { injectIntl } from 'react-intl';
import { _prefixFromNum, _prefixFullNum } from '@/components/songs/filter';
import timeFormatter, { untilDate } from '@/components/common/timeFormatter';
import Button from '@material-ui/core/Button';
import TouchAppIcon from '@material-ui/icons/TouchApp';
import JoinModal from '@/view/components/ranking/modal/join';
import { songsDB } from '@/components/indexedDB';
import { songData } from '@/types/data';
import { functions } from '@/components/firebase';
import Loader from '@/view/components/common/loader';
import ModalUser from '@/view/components/rivals/modal';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { withRouter,RouteComponentProps, Link as RLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import { ShareOnTwitter } from '@/view/components/common/shareButtons';
import { _currentTheme } from '@/components/settings';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import fbActions from '@/components/firebase/actions';
import { config } from '@/config';
import Divider from '@material-ui/core/Divider';

interface S {
  isLoading:boolean,
  onGoing:any,
  onGoingId:string,
  joinModal:boolean,
  song:songData|null,
  loggedIn:boolean,
  rank:any,
  sum:number,
  isModalOpen:boolean,
  currentUserName:string,
  auth:any
}

class InstantWRView extends React.Component<{intl:any}&RouteComponentProps,S> {

  private fbA:fbActions = new fbActions();

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      loggedIn:true,
      onGoing:null,
      onGoingId:"",
      joinModal:false,
      song:null,
      rank:null,
      sum:0,
      isModalOpen:false,
      currentUserName:"",
      auth:null,
    }
  }

  async componentDidMount(){
    const sdb = new songsDB();
    const res = await functions.httpsCallable("viewRanking")({
      cId:null,
      latest:true,
      includeRank:true,
      currentUser:true,
      version:config.latestStore
    });
    if(!res.data.auth){
      return this.setState({isLoading:false,loggedIn:false});
    }
    const song = await sdb.getOneItemIsSingle(res.data.info.wrInfo.title,res.data.info.wrInfo.difficulty);
    const songData = song.length > 0 ? song[0] : null;
    this.setState({onGoing:res.data.info.wrInfo,onGoingId:res.data.info.wrId,isLoading:false,song:songData,rank:res.data,loggedIn:true,auth:res.data.auth});
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
      const p = await functions.httpsCallable("joinRanking")(data);
      if(p.data.error){
        throw new Error(p.data.errorMessage);
      }
      const res = await functions.httpsCallable("viewRanking")({
        cId:onGoingId,
        includeRank:false,
        currentUser:true,
        version:onGoing.version,
      });
      this.setState({rank:res.data})
      return {error:false,errorMessage:""};
    }catch(e){
      console.log(e);
      return {error:true,errorMessage:e.message};
    }
  }

  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag});
  open = (uid:string)=> this.setState({isModalOpen:true,currentUserName:uid})

  render(){
    const {onGoing,isLoading,joinModal,song,rank,isModalOpen,currentUserName,onGoingId,auth} = this.state;
    const borderColor = ():string=>{
      const t = _currentTheme();
      if(t === "light"){
        return "#ddd";
      }
      if(t === "dark"){
        return "#222";
      }
      return "#0095ff";
    }
    const fontColor = ():string=>{
      const t = _currentTheme();
      if(t === "light"){
        return "#222";
      }
      return "#fff";
    }
    if(isLoading){
      return (
        <Alert icon={false} severity="info" variant="outlined" style={{borderLeft:"0",borderRight:"0",borderRadius:"0px",borderBottom:"0",borderTopRightRadius:"10px",borderTopLeftRadius:"10px",backdropFilter:"blur(5px)",borderColor:borderColor()}}>
          <Loader text="ランキングをロード中"/>
        </Alert>
      );
    }
    if(!auth){
      return (
        <Alert icon={false} severity="info" variant="outlined" style={{borderLeft:"0",borderRight:"0",borderRadius:"0px",borderBottom:"0",borderTopRightRadius:"10px",borderTopLeftRadius:"10px",backdropFilter:"blur(5px)",borderColor:borderColor()}}>
          <AlertTitle style={{textAlign:"center"}}>Sign in</AlertTitle>
          <p style={{textAlign:"center"}}>ログインして全機能を開放</p>
          <ButtonGroup fullWidth>
            {[
              {name:"Twitter",func:()=>this.fbA.authWithTwitter()},
              {name:"Google",func:()=>this.fbA.authWithGoogle()}
            ].map((item,i)=>{
              return (
                <Button startIcon={<ArrowRightIcon />} key={i} onClick={item.func}>
                  {item.name}
                </Button>
              )
            })
          }
          </ButtonGroup>
        </Alert>
      )
    }
    if(!song){
      return (null);
    }
    return (
      <div>
        <Alert icon={false} severity="info" variant="outlined" style={{borderLeft:"0",borderRight:"0",borderRadius:"0px",borderBottom:"0",borderTopRightRadius:"10px",borderTopLeftRadius:"10px",backdropFilter:"blur(5px)",borderColor:borderColor(),color:fontColor(),}}>
          {(!isLoading && onGoing) && (
            <div>
              <AlertTitle style={{textAlign:"center"}}><b>ランキング開催中</b><small>(<RLink to="/help/ranking"><Link color="secondary" component="span">ヘルプ</Link></RLink>)</small></AlertTitle>
              <Divider/>
              <p>
                楽曲:<b>{onGoing.title}{_prefixFromNum(onGoing.difficulty,true)}</b><br/>
                ステータス:<b>{rank.info.rank === -1 ? `未参加` : "参加済"}{rank.info.rank !== -1 ? <span>({rank.info.rank}位/{rank.info.users}人中)</span> : <span>({rank.info.users}人が参加中)</span>}</b>
                {rank.info.rank !== -1 && (
                  <ShareOnTwitter
                  text={`BPIMスコアタ#${onGoing.week}に参加中！\n対象楽曲：${onGoing.title}(${_prefixFullNum(onGoing.difficulty)})\n登録スコア：${rank.info.detail.exScore}\n現在の順位：${rank.info.users}人中${rank.info.rank}位\n`}
                  url={`https://bpi.poyashi.me/ranking/id/${onGoingId}`}/>)}
                <br/>
                開催期間:<span style={{color:untilDate(onGoing.until._seconds * 1000) < 7 ? "#ff5151" : "inherit"}}>残り{untilDate(onGoing.until._seconds * 1000)}日</span>(~{timeFormatter(4,onGoing.until._seconds * 1000)})
              </p>
              <ButtonGroup fullWidth>
                  <Button startIcon={<TouchAppIcon/>} size="small" color="secondary" variant="outlined" onClick={this.handleToggle}>
                    参加 / 更新
                  </Button>
                  <Button size="small" color="secondary" variant="outlined" onClick={()=>this.props.history.push("/ranking/ongoing")}>
                    ランキング
                  </Button>
              </ButtonGroup>
            </div>
          )}
        </Alert>
        {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} exact handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
        {joinModal && <JoinModal handleToggle={this.handleToggle} joinExec={this.joinExec} default={rank.info} song={song}/>}
      </div>
    );
  }
}



export default withRouter(injectIntl(InstantWRView));
