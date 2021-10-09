import * as React from 'react';
import { _currentTheme, _currentStore } from '@/components/settings';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from "@mui/icons-material/Close";
import Container from '@mui/material/Container';
import Alert from '@mui/lab/Alert/Alert';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import {Link as RLink} from "react-router-dom";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MobileDateTimePicker from '@mui/lab/MobileDateTimePicker';
import timeFormatter, { toMomentHHMM, d_add, isBeforeSpecificDate, toDate } from '@/components/common/timeFormatter';
import Button from '@mui/material/Button';
import { songData } from '@/types/data';
import SongSearchDialog from './songSearch';
import { difficultyDiscriminator, diffsUpperCase, _prefixFromNum } from '@/components/songs/filter';
import CreateIcon from '@mui/icons-material/Create';
import UpdateIcon from '@mui/icons-material/Update';
import Loader from '@/view/components/common/loader';
import { httpsCallable } from '@/components/firebase';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AlertTitle from '@mui/material/AlertTitle';
import { config } from '@/config';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select/Select';
import MenuItem from '@mui/material/MenuItem';

const defaultSong:songData = {
  title:"",
  difficulty:"3",
  wr:0,
  avg:0,
  notes:0,
  bpm:"100",
  textage:"/",
  difficultyLevel:"12",
  dpLevel:"0",
  updatedAt:timeFormatter(3),
  coef:-1,
}

export default class CreateModal extends React.Component<{
  isOpen:boolean,
  handleOpen:(isCreating:boolean)=>void,
},{
  rankingName:string,
  startDate:string,
  endDate:string,
  info:string,
  song:songData|null,
  isDialogOpen:boolean,

  display:number,
  isCreating:boolean,
  result:any,
  rankId:string,
  customSong:boolean
}>{

  constructor(props:any){
    super(props);
    this.state = {
      rankingName:"",
      startDate:toDate(new Date()),
      endDate:toDate(d_add(7,"day")),
      song:null,
      info:"",
      isDialogOpen:false,
      display:0,
      isCreating:false,
      result:null,
      rankId:"",
      customSong:false
    }
  }

  handleStartDateInput = (date:any) => {
    this.setState({startDate:toDate(toMomentHHMM(date || new Date()))});
  };

  handleEndDateInput = (date:any) => {
    console.log(date);
    this.setState({endDate:toDate(toMomentHHMM(date || new Date()))});
  };

  dialogToggle = ()=> this.setState({isDialogOpen:!this.state.isDialogOpen});
  decide = (input:songData)=> {
    this.setState({
      song:input,
      isDialogOpen:false
    });
  }

  changeView = (newState:number)=>{
    window.scrollTo(0, 0);
    this.setState({
      display: newState
    })
  }

  create = async()=>{
    const {startDate,endDate,rankingName,song,info} = this.state;
    this.setState({isCreating:true,display:2});
    let data = {
      start:toDate(startDate),
      end:toDate(endDate),
      title:rankingName,
      song:song,
      info:info,
      version:_currentStore(),
    };
    const p = await httpsCallable(`ranking`,`createRanking`,data);
    if(p.data.error){
      alert(p.data.errorMessage);
    }
    this.setState({isCreating:false,display:3,result:p,rankId:p.data.rankId || ""})
  }

  changeSongInfo = (target:string,value:any)=>{
    if(target === "wr" || target === "avg" || target === "notes"){
      value = Number(value) as number;
    }else{
      value = String(value) as string;
    }
    this.setState({song:Object.assign(defaultSong,{
      [target]:value
    })});
  }

  render(){
    const c = _currentTheme();
    const {isOpen,handleOpen} = this.props;
    const {startDate,endDate,rankingName,song,info,isDialogOpen,display,isCreating,customSong} = this.state;
    console.log(song);
    const isDisabled = ()=>{
      if(!rankingName){
        return true;
      }
      if(!song){
        return true;
      }
      if(isBeforeSpecificDate(endDate,startDate)){
        return true;
      }
      if(isBeforeSpecificDate(endDate,new Date())){
        return true;
      }
      if(customSong){
        if(!song.title) return true;
        if(!song.notes) return true;
      }
      return false;
    }

    const titleError = rankingName.length > 16;
    console.log(startDate);
    const form = (readOnly:boolean = false)=>{
      return (
      <form noValidate autoComplete="off">
      <TextField
        required
        error={titleError}
        label="ランキングの名称"
        fullWidth
        value={rankingName}
        onChange={(e)=>readOnly ? ()=>null : this.setState({rankingName:e.target.value})}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          readOnly: readOnly,
        }}
        disabled={readOnly}
        helperText={titleError ? "タイトルが長すぎます" : ""}
      />
      <div style={{margin:"20px 0"}}/>
      {!customSong && (
      <TextField
        fullWidth
        required
        label="対象楽曲"
        onClick={readOnly ? ()=>null : this.dialogToggle}
        value={song ? song.title + _prefixFromNum(song.difficulty) + ` / ☆${song.difficultyLevel}` : ""}
        placeholder="タップして選択"
        disabled={readOnly}
        InputProps={{
          readOnly: true,
        }}
        InputLabelProps={{
          shrink: true,
        }}
      />
      )}
      {customSong && <CustomSong change={this.changeSongInfo} song={song}/>}
      <Button onClick={()=>this.setState({customSong:!customSong,song:null})}>
      {customSong && <span>リストから楽曲を選ぶ</span>}
      {!customSong && <span>手動で楽曲を設定する</span>}
      </Button>
      <div style={{margin:"20px 0"}}/>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <MobileDateTimePicker
          label="開始日付"
          value={startDate}
          renderInput={(props) => (
            <TextField {...props} fullWidth/>
          )}
          disabled={readOnly}
          onChange={readOnly ? ()=>null : this.handleStartDateInput}
        />
        <div style={{margin:"20px 0"}}/>
        <MobileDateTimePicker
          label="終了日付"
          disablePast
          renderInput={(props) => (
            <TextField {...props} fullWidth/>
          )}
          value={endDate}
          disabled={readOnly}
          onChange={readOnly ? ()=>null : this.handleEndDateInput}
        />
      </LocalizationProvider>
      <div style={{margin:"20px 0"}}/>
      <TextField
        fullWidth
        multiline
        rows={4}
        label="ランキングの概要(オプション)"
        placeholder=""
        value={info}
        disabled={readOnly}
        onChange={(e)=>readOnly ? ()=>null : this.setState({info:e.target.value})}
        InputLabelProps={{
          shrink: true,
        }}
        InputProps={{
          readOnly: readOnly,
        }}
      />
      </form>
      )
    }
    const errors = ()=>{
      const res = [];
      if(isBeforeSpecificDate(endDate,startDate)){
        res.push("開始日より前の日付が終了日として指定されています");
      }
      if(isBeforeSpecificDate(endDate,new Date())){
        res.push("終了日は本日の日付より未来である必要があります");
      }
      return res;
    }

    return (
      <Dialog
        id="detailedScreen"
        className={c === "dark" ? "darkDetailedScreen" : c === "light" ? "lightDetailedScreen" : "deepSeaDetailedScreen"}
        fullScreen open={isOpen} onClose={()=>handleOpen(isCreating)} style={{overflowX:"hidden",width:"100%"}}>
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={()=>handleOpen(isCreating)}
              aria-label="close"
              size="large">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{flexGrow:1}}>
              ランキングを作成
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar/>
        <Container className="commonLayout">

          {display === 3 && (
            <div>
              <Alert severity="success" icon={<AssignmentTurnedInIcon/>}>
                <AlertTitle>ランキングが作成されました</AlertTitle>
                <p><RLink to={"/ranking/id/" + this.state.rankId} style={{textDecoration:"none"}}><Link color="secondary" component="span">こちらをクリックしてランキングを表示します</Link></RLink>。または以下のボタンをクリックし、作成したランキングを友達に共有することができます。</p>
              </Alert>
              <Button color="secondary" fullWidth variant="outlined" size="large"
                onClick={()=>window.open(`http://twitter.com/share?url=${config.baseUrl}/ranking/id/${this.state.rankId}&hashtags=BPIM&related=BPIManager`)}>
                Twitterで共有
              </Button>
            </div>
          )}

          {display === 2 && (
            <Loader text="ランキングを作成しています"/>
          )}

          {display === 1 && (
            <div>
            <Alert icon={false} severity="success">
              以下の設定でランキングを作成します。<br/>
              よろしい場合は「作成」ボタンを、修正がある場合は「戻る」ボタンをタップしてください。
            </Alert>
            <Divider style={{margin:"20px 0"}}/>
            {form(true)}
            <Divider style={{margin:"20px 0"}}/>
            <Button
              startIcon={<UpdateIcon/>} color="secondary" fullWidth variant="outlined" size="large" onClick={()=>this.changeView(0)}>
              戻る
            </Button>
            <Button style={{margin:"10px 0"}}
              startIcon={<CreateIcon />} color="secondary" fullWidth variant="contained" size="large" onClick={this.create}>
              作成
            </Button>

            </div>
          )}

          {display === 0 && (
          <div>
          <Alert icon={false} severity="success">
            新しくランキングを作成します。<br/>
            対象楽曲・開始日時は作成後変更することはできません。
          </Alert>
          {(_currentStore() !== config.latestStore ) && (
            <Alert severity="error" style={{margin:"10px 0"}}>
              <AlertTitle>スコア保存先をご確認ください</AlertTitle>
              <p>
                スコアデータの保存先が最新のアーケード版IIDXバージョンではありません。<br/>
                このまま続行すると、最新バージョンを利用中のユーザーにランキングが表示されません。<br/>
                <RLink to="/settings" style={{textDecoration:"none"}}><Link color="secondary" component="span">設定画面からスコアの保存先を変更する</Link></RLink>。
              </p>
            </Alert>
          )}
          <Divider style={{margin:"20px 0"}}/>
          {form()}
          <Divider style={{margin:"20px 0"}}/>
          <Button color="secondary" fullWidth variant="outlined" size="large" disabled={isDisabled()} onClick={()=>this.changeView(1)}>
            確認画面へ
          </Button>
            {errors().length > 0 && (
              <Alert icon={false} severity="error" style={{margin:"15px 0"}}>
                {errors().map((item)=><span>{item}<br/></span>)}
              </Alert>
            )}
          </div>
          )}
        </Container>
        {isDialogOpen && <SongSearchDialog isDialogOpen={isDialogOpen} close={this.dialogToggle} decide={this.decide}/>}
      </Dialog>
    );
  }

}

class CustomSong extends React.Component<{change:(target:string,value:any)=>void,song:songData|null},{}>{

  updateDiff = (e:SelectChangeEvent<"HYPER"|"ANOTHER"|"LEGGENDARIA">)=>{
    const v = e.target.value;
    const value = v === "HYPER" ? "3" : v === "ANOTHER" ? "4" : "10";
    this.props.change("difficulty",value);
  }

  render(){
    const song = this.props.song || defaultSong;
    return (
      <React.Fragment>
        <TextField
          fullWidth
          required
          label="対象楽曲名"
          onChange={(e)=>this.props.change("title",e.target.value)}
          value={song.title}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <FormControl variant="standard" fullWidth>
          <InputLabel>難易度(表記)</InputLabel>
          <Select value={difficultyDiscriminator(song.difficulty,true) as diffsUpperCase} onChange={this.updateDiff} fullWidth>
          {
            ["HYPER","ANOTHER","LEGGENDARIA"].map((item:string)=>{
              return (<MenuItem key={item} value={item}>{item}</MenuItem>);
            })
          }
          </Select>
        </FormControl>
        <FormControl variant="standard" fullWidth>
          <InputLabel>難易度(12段階)</InputLabel>
          <Select value={song.difficultyLevel} onChange={(e)=>this.props.change("difficultyLevel",e.target.value)} fullWidth>
          {
            [...Array(12)].map((_, i) => i + 1).map((item:number)=>{
              return (<MenuItem key={item} value={String(item)}>☆{item}</MenuItem>);
            })
          }
          </Select>
        </FormControl>
        <TextField
          fullWidth
          required
          label="ノート数"
          type="number"
          onChange={(e)=>this.props.change("notes",e.target.value)}
          value={song.notes}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          fullWidth
          label="全国1位(オプション)"
          type="number"
          onChange={(e)=>this.props.change("wr",e.target.value)}
          value={song.wr}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          fullWidth
          label="皆伝平均(オプション)"
          type="number"
          onChange={(e)=>this.props.change("avg",e.target.value)}
          value={song.avg}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <TextField
          fullWidth
          label="譜面係数(オプション)"
          type="number"
          onChange={(e)=>this.props.change("coef",e.target.value)}
          value={song.coef}
          InputLabelProps={{
            shrink: true,
          }}
        />
      </React.Fragment>
    )
  }
}
