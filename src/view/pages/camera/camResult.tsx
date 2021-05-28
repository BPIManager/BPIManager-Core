import * as React from 'react';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import Container from '@material-ui/core/Container';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import ReplayIcon from '@material-ui/icons/Replay';
import bpiCalcuator, { B } from '@/components/bpi';
import { difficultyParser, _prefixFromLetters, difficultyDiscriminator } from '@/components/songs/filter';
import { _isSingle } from '@/components/settings';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import { songData, scoreData } from '@/types/data';
import _djRank from '@/components/common/djRank';
import CheckIcon from '@material-ui/icons/Check';
import { scoresDB } from '@/components/indexedDB';
import Alert from '@material-ui/lab/Alert/Alert';
import { Link } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import {ReactComponent as TwitterIcon} from "@/assets/twitter.svg";
import SongSearchDialog from '../ranking/crud/songSearch';

interface Props{
  result:any,
  rawCamData:string,
  retry:()=>void,
  songs:{[key:string]:songData},
  save:(score:scoreData|null,ex:number,bpi:number,song:songData)=>Promise<boolean>,
  upload:(ex:number,bpi:string|number,song:songData,lastEx:number)=>void
}

export default class CameraResult extends React.Component<Props,{
  defaultResult:any,
  currentSongTitle:string,
  currentDifficulty:string,
  exScore:number,
  saved:boolean,
  score:scoreData|null,
  bpi:B,
  isDialogOpen:boolean
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
      isDialogOpen:false
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
    const f1 = await this.updateBPI(null,null,null);
    const score = await this.getScore();
    if(f1 && f1.error){
      const f2 = await this.updateBPI(null,"ANOTHER",null);
      return this.setState({bpi:f2,currentDifficulty:"ANOTHER",score:score});
    }else{
      return this.setState({bpi:f1,score:score});
    }
  }

  dialogToggle = ()=> this.setState({isDialogOpen:!this.state.isDialogOpen});
  decide = (input:songData)=> {
    const diff = difficultyDiscriminator(input.difficulty).toUpperCase();
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

  getScore = async(title:string = this.state.currentSongTitle, diff:string = this.state.currentDifficulty)=>{
    if(!this.song()) return null;
    const scores = await new scoresDB().getSpecificVersionAll();
    const score = scores.find((item:scoreData)=>item.title === title && item.difficulty === diff.toLowerCase());
    return score || null;
  }

  checkNewSongMax = (title:string|null = null,diff:string|null = null,ex:number|null = null)=>{
    const t = title ? title : this.state.currentSongTitle;
    const d = diff ? diff : this.state.currentDifficulty;
    const e = ex ? ex : this.state.exScore;
    const newSong = this.song(t,d);
    if(newSong && e > newSong.notes * 2){
      const newEx = newSong.notes * 2;
      this.setState({exScore:newEx});
      this.updateBPI(t,d,newEx);
      return true;
    }
    return false;
  }

  changeSongTitle = (e:React.ChangeEvent<any>)=>{
    this.setState({currentSongTitle:e.target.value,saved:false});
    this.checkNewSongMax(e.target.value,null,null);
    return this.updateBPI(e.target.value,null,null);
  }

  changeSongDifficulty = (e:React.ChangeEvent<any>)=>{
    this.setState({currentDifficulty:e.target.value,saved:false});
    this.checkNewSongMax(null,e.target.value,null);
    return this.updateBPI(null,e.target.value,null);
  }

  changeExScore = (event:React.ChangeEvent<HTMLInputElement>)=>{
    const num = Number(event.target.value);
    if(num < 0 || num > this.song().notes * 2) return;
    this.checkNewSongMax(null,null,num);
    this.setState({exScore:num,saved:false});
    return this.updateBPI(null,null,num);
  }

  async updateBPI(newTitle:string|null = null,newDiff:string|null = null,newScore:number|null){
    const {currentSongTitle,currentDifficulty,exScore} = this.state;
    if((!newTitle && !currentSongTitle) || (!newDiff && !currentDifficulty)) return {error:true,bpi:-15,reason:"楽曲または難易度が指定されていません"};
    const newBPI:B = await (this.calc.calc(newTitle || currentSongTitle,difficultyParser((newDiff || currentDifficulty).toLowerCase(),_isSingle()),newScore || exScore));
    if(newTitle || newDiff){
      const score = await this.getScore(newTitle || currentSongTitle,newDiff || currentDifficulty);
      this.setState({score:score,saved:false});
    }
    this.setState({bpi:newBPI,saved:false});
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
    const {rawCamData} = this.props;
    const {defaultResult,currentSongTitle,currentDifficulty,exScore,bpi,score,saved,isDialogOpen} = this.state;
    return (
      <React.Fragment>
        <img src={rawCamData} alt="撮影された画像" style={{display:"block",margin:"10px auto",maxWidth:"100%"}}/>
        <Container fixed>
          {this.song() && (
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
                  {score && <small style={{textAlign:"center"}}>スコアレート<br/>{(exScore / (this.song().notes * 2) * 100).toFixed(2)}%</small>}
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
                  {score && <small style={{textAlign:"center"}}>自己ベスト<br/>{exScore - score.exScore > 0 && "+"}{exScore - score.exScore}</small>}
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
                  {score && <small style={{textAlign:"center"}}>皆伝上位<br/>{((this.calc.rank(bpi.bpi) / this.calc.getTotalKaidens()) * 100).toFixed(1)}%</small>}
                </Grid>
              </Grid>
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
        </Container>
        {isDialogOpen && <SongSearchDialog isDialogOpen={isDialogOpen} close={this.dialogToggle} decide={this.decide}/>}
      </React.Fragment>
    );
  }
}