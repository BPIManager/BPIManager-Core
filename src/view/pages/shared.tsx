import * as React from 'react';
import Container from '@material-ui/core/Container';
import { scoreData, rivalStoreData, songData } from '@/types/data';
import fbActions from '@/components/firebase/actions';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import BPIChart from '@/view/components/songs/bpiChart';
import { chartData } from '@/view/components/songs/detailsScreen';
import bpiCalcuator from '@/components/bpi';
import { songsDB, scoresDB } from '@/components/indexedDB';
import { difficultyParser, _prefixFull, _prefixFromNum } from '@/components/songs/filter';
import Paper from '@material-ui/core/Paper';
import { _isSingle, _currentStore } from '@/components/settings';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import _djRank from '@/components/common/djRank';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import { CardContent, Avatar, Button } from '@material-ui/core';
import { alternativeImg } from '@/components/common';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import WarningIcon from "@material-ui/icons/Warning";
import ShareButtons from '@/view/components/common/shareButtons';
import Loader from '@/view/components/common/loader';
import { getAltTwitterIcon } from '@/components/rivals';

interface S {
  score:scoreData&{uid:string}|null,
  you:scoreData|null,
  userData:rivalStoreData|null,
  song:songData|null,
  isLoading:boolean,
}

class Shared extends React.Component<RouteComponentProps,S> {

  constructor(props:RouteComponentProps){
    super(props);
    this.state ={
      score:null,
      you:null,
      userData:null,
      song:null,
      isLoading:true,
    }
  }

  componentDidMount(){
    this.load();
  }

  load = async()=>{
    const fba = new fbActions();
    const scoreData = await fba.setColName("shared").setDocName((this.props.match.params as any).id).load();
    if(!scoreData){
      return;
    }
    const songData = await new songsDB().getOneItemIsSingle(scoreData.title,difficultyParser(scoreData.difficulty,_isSingle()));
    const myScore = await new scoresDB().getItem(scoreData.title,scoreData.difficulty,_currentStore(),_isSingle());
    this.setState({
      userData: (await fba.setColName("users").setDocName(scoreData.uid).load() as rivalStoreData),
      score: (scoreData as scoreData&{uid:string}),
      song: songData[0] || null,
      you: myScore[0] || null,
      isLoading:false,
    })
  }

  componentWillUnmount(){
    window.document.title = "BPI Manager";
  }

  private calc:bpiCalcuator = new bpiCalcuator();

  makeGraph = (newScore?:number):chartData[]=>{
    let data:chartData[] = [],lastExScore = 0;
    const {song,score} = this.state;
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
    for(let i = 0;i < bpiBasis.length; ++i){
      const exScoreFromBPI:number = this.calc.calcFromBPI(bpiBasis[i],true);
      if(lastExScore < mybest && mybest <= exScoreFromBPI){
        dataInserter(mybest,"RIVAL");
        lastExScore = mybest;
      }
      lastExScore = exScoreFromBPI;
      dataInserter(exScoreFromBPI,String(bpiBasis[i]));
    }
    if(lastExScore < mybest){
      dataInserter(mybest,"RIVAL");
    }
    return data;
  }

  showRank = (isBody:boolean):string=>{
    const {song,score} = this.state;
    if(!song || !score){return "-";}
    const max:number = song.notes * 2;
    return _djRank(false,isBody,max,score.exScore);
  }

  percentage = ():string=>{
    const {song,score} = this.state;
    if(!song || !score){return "-";}
    const max:number = song.notes * 2;
    return Number(score.exScore / max * 100).toFixed(2) + "%";
  }

  userName = ():string=>{
    const {userData} = this.state;
    if(userData && userData.displayName){
      return userData.displayName
    }
    return "ライバル";
  }

  shareText = ():string=>{
    const {score,song} = this.state;
    if(!score || !song){
      return "";
    }
    const exscore = score.exScore;
    const bpi = score.currentBPI;
    const diff = score.lastScore !== -1 ? exscore - score.lastScore : score;
    return `[${diff > 0 ? "+" + diff : diff}] ${song.title}${_prefixFromNum(song.difficulty,true)} [EX:${exscore}(${this.showRank(false)}${this.showRank(true)})][BPI:${bpi}]`;
  }

  calcRank = ()=> this.state.score ? `${this.calc.rank(this.state.score.currentBPI)}` : "-";

  render(){
    const {isLoading,score,userData,song,you} = this.state;
    if(isLoading){
      return <Loader/>
    }
    if(!score || !song){
      return (
        <Container fixed  className="commonLayout">
          <Paper>
            <div style={{textAlign:"center",padding:"15px"}}>
              <WarningIcon style={{color:"#555",fontSize:"45px"}}/>
              <Typography variant="h4" gutterBottom>
                Error!
              </Typography>
              <Typography variant="body2" gutterBottom>
                指定された投稿が見つかりませんでした
              </Typography>
            </div>
          </Paper>
        </Container>
      );
    }
    window.document.title = `${song.title}(${_isSingle() ? "SP" : "DP"}${_prefixFull(score.difficulty)})のスコアデータ - BPIManager`;
    return (
      <Container fixed  className="commonLayout">
        <Typography variant="h4" align="center">
          {song.title}({_isSingle() ? "SP" : "DP"}{_prefixFull(score.difficulty)})
        </Typography>
        <Typography component="p" variant="caption" align="center">
          {score.updatedAt}にシェア
        </Typography>
        <Divider style={{margin:"15px 0"}}/>
        <Grid container style={{marginBottom:"15px"}}>
          <Grid item xs={6} style={{textAlign:"center"}}>
            <div style={{textAlign:"center"}}>
              <Typography component="h6" variant="h6" color="textSecondary">
                {this.userName()}
              </Typography>
              <Typography component="h4" variant="h4" color="textPrimary">
                {score.exScore}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={6} style={{textAlign:"center"}}>
            <Typography component="h6" variant="h6" color="textSecondary">
              あなた
            </Typography>
            <div style={{position:"relative"}}>
              <Typography component="h4" variant="h4" color="textPrimary">
                {you ? you.exScore : "NOPLAY"}
              </Typography>
              {(you && you.exScore) && <span className="plusOverlayScore">{you.exScore - score.exScore > 0 ? "+" : "-"}{Math.abs(you.exScore - score.exScore)}</span>}
            </div>
          </Grid>
        </Grid>
        <Grid container style={{marginBottom:"15px"}}>
          <Grid item xs={4} style={{textAlign:"center"}}>
            <div style={{textAlign:"center"}}>
              <Typography component="h6" variant="h6" color="textSecondary">
                {score && <span>{this.showRank(false)}</span>}
              </Typography>
              <Typography component="h4" variant="h4" color="textPrimary">
                {score && <span>{this.showRank(true)}</span>}
              </Typography>
              <Typography component="p" variant="caption" color="textPrimary">
                スコアレート {score && <span>{this.percentage()}</span>}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={4} style={{textAlign:"center"}}>
            <Typography component="h6" variant="h6" color="textSecondary">
              BPI
            </Typography>
            <Typography component="h4" variant="h4" color="textPrimary">
              {score.currentBPI}
            </Typography>
            <Typography component="p" variant="caption" color="textPrimary">
              WR{Number(score.exScore - song.wr) > 0 ? "+" : "-" }{Math.abs(Number(score.exScore - song.wr))}
            </Typography>
          </Grid>
          <Grid item xs={4} style={{textAlign:"center"}}>
            <Typography component="h6" variant="h6" color="textSecondary">
              RANK
            </Typography>
            <Typography component="h4" variant="h4" color="textPrimary">
              <span>{this.calcRank()}</span>
            </Typography>
            <Typography component="p" variant="caption" color="textPrimary">
              上位 {Number(this.calc.rank(score.currentBPI) / this.calc.getTotalKaidens() * 100).toFixed(2)}%
            </Typography>
          </Grid>
        </Grid>
        <Paper style={{height:"510px",paddingTop:"10px"}}>
          <BPIChart song={song} newScore={score.exScore} score={score} chartData={this.makeGraph().reverse()} graphLastUpdated={new Date().getTime()}/>
        </Paper>
        <div style={{marginTop:"15px"}}>
          <ShareButtons withTitle={true} text={this.shareText()}/>
        </div>
        {(userData && userData.displayName !== "") &&
          <div>
            <Divider style={{margin:"15px 0"}}/>
            <Card>
              <CardHeader style={{padding:"5px 16px"}}
                avatar={
                  <Avatar style={{width:"40px",height:"40px",border:"1px solid #ccc",margin:"15px auto"}}>
                    <img src={userData.photoURL ? userData.photoURL.replace("_normal","") : "noimage"} style={{width:"100%",height:"100%"}}
                      alt={userData.displayName}
                      onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(userData) || alternativeImg(userData.displayName)}/>
                  </Avatar>
                } title={userData.displayName} subheader="シェアした人"/>
              <CardContent style={{paddingTop:"5px",paddingBottom:"16px"}}>
                <Typography variant="body2" color="textSecondary" component="p">
                  {userData.profile}
                </Typography>
                <Button onClick={()=>this.props.history.push("/u/" + userData.displayName)} style={{marginTop:"5px"}} fullWidth variant="outlined" color="secondary">
                  <AccountCircleIcon/>
                  ユーザーページ
                </Button>
              </CardContent>
            </Card>
          </div>
        }
      </Container>
    );
  }
}

export default withRouter(Shared);
