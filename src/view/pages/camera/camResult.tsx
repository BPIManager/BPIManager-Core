import * as React from 'react';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormHelperText from '@mui/material/FormHelperText';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import ReplayIcon from '@mui/icons-material/Replay';
import bpiCalcuator, { B } from '@/components/bpi';
import { difficultyParser, _prefixFromLetters, difficultyDiscriminator, diffsUpperCase } from '@/components/songs/filter';
import { _isSingle } from '@/components/settings';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { songData, scoreData } from '@/types/data';
import _djRank from '@/components/common/djRank';
import CheckIcon from '@mui/icons-material/Check';
import { scoresDB, scoreHistoryDB } from '@/components/indexedDB';
import Alert from '@mui/lab/Alert/Alert';
import { Link, ButtonGroup } from '@mui/material';
import {ReactComponent as TwitterIcon} from "@/assets/twitter.svg";
import SongSearchDialog from './songSearch';
import { CameraClass } from '@/components/camera/songs';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import Loader from '@/view/components/common/loader';
import { untilDate } from '@/components/common/timeFormatter';

interface Props{
  result:any,
  rawCamData:string,
  retry:()=>void,
  songs:{[key:string]:songData},
  save:(score:scoreData|null,ex:number,bpi:number,song:songData)=>Promise<boolean>,
  upload:(ex:number,bpi:string|number,song:songData,lastEx:number)=>void,
  text:string,
  id:number,
  token:string,
}

export default class CameraResult extends React.Component<Props,{
  defaultResult:any,
  currentSongTitle:string,
  currentDifficulty:"ANOTHER"|"HYPER"|"LEGGENDARIA",
  exScore:number,
  saved:boolean,
  score:scoreData|null,
  bpi:B,
  isDialogOpen:boolean,
  rekidai:scoreData|null,
}> {

  constructor(props:Props){
    super(props);
    this.state = {
      defaultResult:props.result,
      currentSongTitle:props.result.title[0],
      currentDifficulty:props.result.difficulty,
      exScore:props.result.ex || 0,
      saved:false,
      bpi:{error:false,bpi:-15},
      score:null,
      isDialogOpen:false,
      rekidai:null,
    }
  }

  save = async()=>{
    const {exScore,score,bpi} = this.state;
    const song = this.song();
    if(bpi.error){
      return;
    }
    if(!song || exScore > song.notes * 2){
      return;
    }
    const res = await this.props.save(score,exScore,bpi.bpi,song);
    if(res){
      //success
      this.setState({saved:true});
    }else{
      alert("スコアデータの更新中にエラーが発生しました。");
      this.setState({saved:false});
    }
  }

  async componentDidMount(){
    window.history.pushState(null,"Camera Result",null);
    window.addEventListener("popstate",this.overridePopstate,false);
    const f1 = await this.updateBPI(null,null,null);
    const score = await this.getScore();
    let rekidai = await this.getRekidaiScore(this.props.result.title[0],this.props.result.difficulty);
    if(!rekidai || rekidai.length === 0){
      rekidai = null;
    }else{
      rekidai = rekidai[0];
    }
    if(f1 && f1.error){
      const f2 = await this.updateBPI(null,"ANOTHER",null);
      return this.setState({bpi:f2,currentDifficulty:"ANOTHER",score:score,rekidai:rekidai});
    }else{
      return this.setState({bpi:f1,score:score,rekidai:rekidai});
    }
  }

  componentWillUnmount(){
    window.removeEventListener("popstate",this.overridePopstate,false);
  }

  overridePopstate = ()=>this.props.retry();

  dialogToggle = ()=> this.setState({isDialogOpen:!this.state.isDialogOpen});
  decide = (input:songData)=> {
    const diff = (difficultyDiscriminator(input.difficulty,true) as diffsUpperCase);
    let newEx = this.state.exScore;
    this.setState({
      defaultResult:{
        title:this.state.defaultResult.title.concat(input.title),
        difficulty:diff,
      },
      currentSongTitle:input.title,
      currentDifficulty:diff,
      exScore:newEx,
      isDialogOpen:false
    });

    const v = this.checkNewSongMax(input.title,diff,newEx);
    if(!v){
      return this.updateBPI(input.title,diff,newEx);
    }
  }

  private calc:bpiCalcuator = new bpiCalcuator();
  private song = (title:string|null = null,diff:string|null = null):songData=>{
    if(title && diff){
      return this.props.songs[title + _prefixFromLetters(diff)];
    }
    return this.props.songs[this.state.currentSongTitle + _prefixFromLetters(this.state.currentDifficulty)];
  }

  getScore = async(title:string = this.state.currentSongTitle, diff:diffsUpperCase = this.state.currentDifficulty)=>{
    if(!this.song()) return null;
    const scores = await new scoresDB().getSpecificVersionAll();
    const score = scores.find((item:scoreData)=>item.title === title && item.difficulty === diff.toLowerCase());
    return score || null;
  }

  getRekidaiScore = async(title:string = this.state.currentSongTitle, diff:diffsUpperCase = this.state.currentDifficulty)=>{
    const scdb = await new scoreHistoryDB().getRekidaiData(title,diff);
    console.log(scdb);
    return scdb;
  }

  checkNewSongMax = async(title:string|null = null,diff:diffsUpperCase|null = null,ex:number|null = null)=>{
    const t = title ? title : this.state.currentSongTitle;
    const d = diff ? diff : this.state.currentDifficulty;
    const e = ex ? ex : this.state.exScore;
    const newSong = this.song(t,d);
    if(title || diff){
      const cam = new CameraClass();
      cam.reset().setText(this.props.text);
      const exScore = await cam.setTargetSong(t,d).getExScore();
      this.setState({exScore:exScore.error ? 0 : exScore.ex});
      this.updateBPI(t,d,exScore.ex);
      return false;
    }
    if(newSong && e > newSong.notes * 2){
      const newEx = newSong.notes * 2;
      this.setState({exScore:newEx});
      this.updateBPI(t,d,newEx);
      return true;
    }
    this.updateBPI(t,d,e);
    return false;
  }

  changeSongTitle = (e:SelectChangeEvent<string>)=>{
    this.setState({currentSongTitle:e.target.value,saved:false});
    return this.checkNewSongMax(e.target.value,null,null);
  }

  changeSongDifficulty = (e:SelectChangeEvent<diffsUpperCase>)=>{
    const diff = e.target.value as diffsUpperCase;
    this.setState({currentDifficulty:diff,saved:false});
    return this.checkNewSongMax(null,diff,null);
  }

  changeExScore = (event:React.ChangeEvent<HTMLInputElement>)=>{
    const num = Number(event.target.value);
    if(num < 0 || num > this.song().notes * 2) return;
    return this.checkNewSongMax(null,null,num);
  }

  async updateBPI(newTitle:string|null = null,newDiff:diffsUpperCase|null = null,newScore:number|null){
    const {currentSongTitle,currentDifficulty,exScore} = this.state;
    if((!newTitle && !currentSongTitle) || (!newDiff && !currentDifficulty)) return {error:true,bpi:-15,reason:"楽曲または難易度が指定されていません"};
    const newBPI:B = await (this.calc.calc(newTitle || currentSongTitle,difficultyParser((newDiff || currentDifficulty).toLowerCase(),_isSingle()),newScore || exScore));
    if(newTitle || newDiff){
      const score = await this.getScore(newTitle || currentSongTitle,newDiff || currentDifficulty);
      this.setState({score:score,saved:false});
    }
    this.setState({bpi:newBPI,exScore:newScore || this.state.exScore,saved:false});
    return newBPI;
  }

  showRank = (isBody:boolean):string=>{
    const exScore = this.state.exScore;
    if(!this.song() || !exScore){return "-";}
    const max:number = this.song().notes * 2;
    const s:number = exScore;
    return _djRank(false,isBody,max,s);
  }

  render(){
    const {rawCamData,text,id,token} = this.props;
    const {defaultResult,currentSongTitle,currentDifficulty,exScore,bpi,score,saved,isDialogOpen,rekidai} = this.state;
    const nextBPI = Math.ceil(bpi.bpi / 10) * 10;
    return (
      <React.Fragment>
        <img src={rawCamData} alt="撮影された画像" style={{display:"block",margin:"10px auto",maxWidth:"100%"}}/>
        <Container fixed>
          {this.song() && (
            <React.Fragment>
              <Grid container spacing={3}>
                <Grid item xs={6} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0"}}>
                  <div style={{textAlign:"center"}}>
                    <Typography component="h6" variant="h6" color="textSecondary">
                      今作BEST
                    </Typography>
                    <Typography component="h4" variant="h4" color="textPrimary">
                      {score && <span>{exScore - score.exScore > 0 && "+"}{exScore - score.exScore}</span>}
                      {!score && <span>+{exScore}</span>}
                    </Typography>
                    {score && <small style={{textAlign:"center"}}>{untilDate(score.updatedAt)}日前<br/>EX:{score.exScore}</small>}
                    {!score && <small style={{textAlign:"center"}}>登録スコアなし<br/>&nbsp;</small>}
                  </div>
                </Grid>
                <Grid item xs={6} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0"}}>
                  <div style={{textAlign:"center"}}>
                    <Typography component="h6" variant="h6" color="textSecondary">
                      自己歴代
                    </Typography>
                    <Typography component="h4" variant="h4" color="textPrimary">
                      {rekidai && <span>{exScore - rekidai.exScore > 0 && "+"}{exScore - rekidai.exScore}</span>}
                      {!rekidai && <span>+{exScore}</span>}
                    </Typography>
                    {rekidai && <small style={{textAlign:"center"}}>IIDX{rekidai.storedAt}で{untilDate(rekidai.updatedAt)}日前<br/>自己歴代スコア:{rekidai.exScore}</small>}
                    {!rekidai && <small style={{textAlign:"center"}}>登録スコアなし<br/>&nbsp;</small>}
                  </div>
                </Grid>
              </Grid>
              <Grid container spacing={3}>
                <Grid item xs={4} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0"}}>
                    <div style={{textAlign:"center"}}>
                      <Typography component="h6" variant="h6" color="textSecondary">
                        {<span>{this.showRank(false)}</span>}
                      </Typography>
                      <Typography component="h4" variant="h4" color="textPrimary">
                        {<span>{this.showRank(true)}</span>}
                      </Typography>
                    </div>
                    <small style={{textAlign:"center"}}>スコアレート<br/>{(exScore / (this.song().notes * 2) * 100).toFixed(2)}%</small>
                  </Grid>
                  <Grid item xs={4} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0"}}>
                    <Typography component="h6" variant="h6" color="textSecondary">
                      BPI
                    </Typography>
                    <Typography component="h4" variant="h4" color="textPrimary">
                      {this.song().wr === -1 && <span>-</span>}
                      {this.song().wr !== -1 && <div>
                        {(!bpi.error) && bpi.bpi}
                        {(bpi.error) && <span>-</span>}
                      </div>}
                    </Typography>
                    <small style={{textAlign:"center"}}>BPI{nextBPI}まで<br/>あと{this.calc.calcFromBPI(nextBPI,true) - exScore}点</small>
                  </Grid>
                  <Grid item xs={4} style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"10px 0"}}>
                    <Typography component="h6" variant="h6" color="textSecondary">
                      RANK
                    </Typography>
                    <Typography component="h4" variant="h4" color="textPrimary">
                      {this.song().wr === -1 && <span>-</span>}
                      {this.song().wr !== -1 && <div>
                        {this.calc.rank(bpi.bpi)}
                      </div>}
                    </Typography>
                    <small style={{textAlign:"center"}}>皆伝上位<br/>{((this.calc.rank(bpi.bpi) / this.calc.getTotalKaidens()) * 100).toFixed(1)}%</small>
                  </Grid>
                </Grid>
              </React.Fragment>
            )}
          <Divider style={{margin:"10px 0"}}/>
          {(defaultResult.title.length > 0 && !this.song()) && (
            <Alert severity="warning">
              楽曲情報を取得できませんでした。<br/>
              対象外または存在しない難易度を設定している可能性があります。
            </Alert>
          )}
          {defaultResult.title.length === 0 && (
            <Alert severity="warning">
              楽曲名を取得できませんでした。<br/>
              <Link onClick={this.dialogToggle} color="secondary">ここをクリックして手動で楽曲を選択</Link>するか、<Link onClick={this.props.retry} color="secondary">再度リザルト画面を撮影</Link>してください。
            </Alert>
          )}
          {defaultResult.title.length > 0 && (
          <FormControl style={{width:"100%",marginTop:"10px"}}>
            <InputLabel>楽曲名</InputLabel>
            <Select
              fullWidth
              value={currentSongTitle}
              onChange={this.changeSongTitle}
            >
              {defaultResult.title.map((item:string)=>{
                return <MenuItem key={item} value={item}>{item}</MenuItem>
              })}
            </Select>
            <FormHelperText>{defaultResult.title.length}件の候補があります / <Link onClick={this.dialogToggle} color="secondary">楽曲を手動選択</Link></FormHelperText>
          </FormControl>
          )}
          <FormControl style={{width:"100%",marginTop:"10px"}}>
            <InputLabel>難易度</InputLabel>
            <Select
              fullWidth
              value={currentDifficulty}
              onChange={this.changeSongDifficulty}
            >
              {["HYPER","ANOTHER","LEGGENDARIA"].map((item:string)=>{
                return <MenuItem key={item} value={item}>{item}</MenuItem>
              })}
            </Select>
          </FormControl>
          <FormControl style={{width:"100%",marginTop:"10px"}}>
            <TextField
              value={exScore}
              onChange={this.changeExScore}
              label="EXスコア"
              type="number"
              InputLabelProps={{
                shrink: true,
              }}
            />
          </FormControl>
          <Divider style={{margin:"10px 0"}}/>
          <Button startIcon={<TwitterIcon style={{width:"20px",height:"20px",display:"inline-block"}} />} fullWidth onClick={()=>this.props.upload(exScore,bpi.error ? "-" : bpi.bpi,this.song(),score ? score.exScore : 0)} style={{marginBottom:"10px"}}>Twitterでシェア</Button>
          {!saved && <Button startIcon={<CheckIcon/>} fullWidth onClick={this.save} color="secondary" variant="contained">スコアを保存</Button>}
          {saved && <Button startIcon={<ThumbUpIcon/>} fullWidth disabled color="secondary" variant="contained">スコアを保存しました</Button>}
          <Button startIcon={<ReplayIcon/>} fullWidth onClick={this.props.retry} style={{margin:"10px 0 20px 0"}}>もう一度撮影</Button>
          {id !== -1 && (
            <VoteButton id={id} token={token}/>
          )}
        </Container>
        {isDialogOpen && <SongSearchDialog diff={currentDifficulty} text={text} isDialogOpen={isDialogOpen} close={this.dialogToggle} decide={this.decide}/>}
      </React.Fragment>
    );
  }
}


class VoteButton extends React.Component<{id:number,token:string},{
  progress:number
}>{

  constructor(props:{id:number,token:string}){
    super(props);
    this.state = {
      progress:0
    }
  }

  fetcher = async(type:number)=>{
    const v = window.location.href.indexOf("localhost") > -1  ? "test" : "v2";
    return await fetch("https://proxy.poyashi.me/" + v + "/sql/vote", {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body:JSON.stringify({data:JSON.stringify({type:type,id:this.props.id}),token:this.props.token}),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
  }

  vote = async(type:number)=>{
    this.setState({progress:1});
    await this.fetcher(type);
    this.setState({progress:2});
  }

  render(){
    return (
      <React.Fragment>
        <div style={{display:"flex",justifyContent:"center",flexDirection:"column",textAlign:"center",marginBottom:"30px"}}>
          <Alert  icon={false} variant="outlined" severity="info">
            <Typography variant="body1" display="block" gutterBottom>
              読み取りは正確ですか？
            </Typography>
            {
              this.state.progress === 2 && (
                <p>ご協力ありがとうございました</p>
              )
            }
            {
              this.state.progress === 1 && (
                <Loader/>
              )
            }
            {
              this.state.progress === 0 && (
                <ButtonGroup fullWidth>
                  <Button onClick={()=>this.vote(1)} startIcon={<ThumbUpIcon/>}>正確</Button>
                  <Button onClick={()=>this.vote(0)} startIcon={<ThumbDownIcon/>}>不正確</Button>
                </ButtonGroup>
              )
            }
          </Alert>
        </div>
      </React.Fragment>
    )
  }
}
