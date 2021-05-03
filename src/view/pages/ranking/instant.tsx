import * as React from 'react';
import { injectIntl } from 'react-intl';
import Button from '@material-ui/core/Button';
import { songsDB } from '@/components/indexedDB';
import { songData } from '@/types/data';
import { functions } from '@/components/firebase';
import Loader from '@/view/components/common/loader';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { withRouter,RouteComponentProps } from 'react-router-dom';
import { _currentTheme } from '@/components/settings';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import fbActions from '@/components/firebase/actions';
import { config } from '@/config';

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
    if(!res.data.info.wrInfo){
      return this.setState({
        onGoing:null,isLoading:false,loggedIn:true,auth:res.data.auth
      });
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
    const {onGoing,isLoading,song,auth} = this.state;
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
    if(!isLoading && !onGoing){
      return (null);
    }
    return (null)
  }
}



export default withRouter(injectIntl(InstantWRView));
