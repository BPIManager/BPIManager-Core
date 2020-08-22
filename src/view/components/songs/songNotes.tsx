import React from "react";

import { scoreData, songData } from "@/types/data";
import Container from "@material-ui/core/Container";
import Loader from "../common/loader";
import fbActions from "@/components/firebase/actions";
import Alert from "@material-ui/lab/Alert/Alert";
import AlertTitle from "@material-ui/lab/AlertTitle/AlertTitle";
import Fab from "@material-ui/core/Fab";
import EditIcon from '@material-ui/icons/Edit';
import { Link } from "react-router-dom";
import { Link as RLink, Dialog, DialogTitle, DialogContent, DialogContentText, TextField, DialogActions, Button, Divider, InputLabel, FormControl, Select, MenuItem } from "@material-ui/core/";
import timeFormatter from "@/components/common/timeFormatter";
import ReCAPTCHA from "react-google-recaptcha";
import { difficultyDiscriminator } from "@/components/songs/filter";

interface P{
  song:songData|null,
  score:scoreData|null,
}

interface S{
  isLoading:boolean,
  lastLoaded:any,
  isOpen:boolean,
  notes:any[],
  currentSort:number,
}

class SongNotes extends React.Component<P,S> {
  private fbActions = new fbActions();

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      isOpen:false,
      lastLoaded:null,
      currentSort:0,
      notes:[],
    }
  }

  componentDidMount(){
    this.load();
  }

  saveAndReload =()=> this.load(true);

  handleToggle = ()=> this.setState({isOpen:!this.state.isOpen});

  handleChange = (event: React.ChangeEvent<{ value: unknown }>)=> {
    if(typeof event.target.value !== "number"){return;}
    this.setState({currentSort:event.target.value,isLoading:true});
    this.load(true);
  }

  async load(forceReload:boolean = false){
    const {song} = this.props;
    if(!song){return this.setState({isLoading:false,notes:[]})}
    const notes = await this.fbActions.loadNotes(song,forceReload ? null : this.state.lastLoaded,0);
    console.log(notes.docs);
    return this.setState(notes.docs.length > 0 ? {notes:notes.docs,lastLoaded:notes.docs[notes.docs.length - 1],isLoading:false} : {notes:[],lastLoaded:null,isLoading:false})
  }

  render(){
    const {isLoading,notes,isOpen,currentSort} = this.state;
    return (
      <div style={{margin:"15px 0"}}>
        <Container fixed>
          <FormControl style={{width:"100%"}}>
          <InputLabel shrink>
              並べ替え
            </InputLabel>
            <Select
              value={currentSort}
              onChange={this.handleChange}
              displayEmpty>
                <MenuItem value={0}>書き込み日時が新しい順</MenuItem>
                <MenuItem value={1}>書き込み者の単曲BPIが高い順</MenuItem>
              </Select>
          </FormControl>
          {(!isLoading && notes.length === 0) && <NoNotes song={this.props.song}/>}
          {(!isLoading && notes.length > 0) && <NotesList list={notes}/>}
          {isLoading && <Loader/>}
          <Fab color="secondary" onClick={this.handleToggle} aria-label="edit" style={{position:"fixed",bottom:"15px",right:"15px"}}>
            <EditIcon />
          </Fab>
          {isOpen && <WriteDialog saveAndReload={this.saveAndReload} close={this.handleToggle} score={this.props.score} song={this.props.song}/>}
        </Container>
      </div>
    );
  }
}

export default SongNotes;

class NoNotes extends React.Component<{song:songData|null},{}>{
  render(){
    const song = this.props.song;
    if(!song) return (null);
    return (
      <Alert severity="info" style={{margin:"10px 0"}}>
        <AlertTitle>投稿がありません</AlertTitle>
        <p>一番乗りで投稿しましょう！<br/>
        右下のボタンをタップして、{song.title}に関する情報（例：譜面傾向、練習に向いている曲、ギアチェンや当たり判別の方法）などを自由に書き込んでください。<br/>
        <Link to="/help" style={{textDecoration:"none"}}><RLink color="secondary" component="span">免責事項・ご利用に関する注意</RLink></Link><br/>
        <RLink color="secondary" href="https://gist.github.com/potakusan/7281da1405d4381dc55e19ff8a43926f">この機能について</RLink>
      </p>
      </Alert>
    );
  }
}

interface WP {
  close:()=>void,
  saveAndReload:()=>void,
  score:scoreData|null,
  song:songData|null
}

class WriteDialog extends React.Component<WP,{
  text:string,
  isLoading:boolean,
}>{

  constructor(props:WP){
    super(props);
    this.state = {
      text: "",
      isLoading:false,
    }
  }

  changeValue = (e:React.ChangeEvent<HTMLInputElement>)=>{
    if(this.state.isLoading) return;
    this.setState({text:e.target.value});
  }

  exec = async()=>{
    if(this.ref.current){
      const token = await this.ref.current.executeAsync();
      if(!this.state.text || this.state.isLoading || !this.props.song) return;
      this.setState({isLoading:true});
      const authInfo = new fbActions().authInfo();
      const response = await fetch("https://us-central1-bpim-d5971.cloudfunctions.net/writeComment",{
        method:"POST",
        body:JSON.stringify({
          songTitle:this.props.song.title,
          songDiff:difficultyDiscriminator(this.props.song.difficulty),
          memo:this.state.text,
          userBPI:this.props.score ? this.props.score.currentBPI : -15,
          uid:authInfo ? authInfo.uid : null,
          token:token,
        })
      });
      if(response.status === 200 && (await response.json() || {"error":true})["error"] === false){
        this.props.saveAndReload();
        this.props.close();
      }
    }else{
      alert("No ReCaptcha Signature");
    }
  }

  ref = React.createRef<ReCAPTCHA>();

  render(){
    const {score} = this.props;
    const {isLoading} = this.state;
    if(!score) return (null);
    const tooLong = this.state.text.length > 200;
    return (
      <div>
        <Dialog open={true}>
          <DialogTitle>投稿を作成</DialogTitle>
          <DialogContent>
            {isLoading && <Loader/>}
            {!isLoading && <div>
              {Number.isNaN(score.currentBPI) && <span>プレイログがない楽曲に対してコメントを投稿することはできません。</span>}
              {!Number.isNaN(score.currentBPI) && <div>
                <TextField
                  multiline
                  fullWidth
                  rows={4}
                  error={tooLong}
                  helperText={tooLong ? "200文字を超えています！" : ""}
                  placeholder={"一度に200文字まで入力できます"}
                  onChange={this.changeValue}
                  value={this.state.text}
                  variant="outlined"
                />
                <ReCAPTCHA
                  ref={this.ref}
                  sitekey="6LeGJsIZAAAAAJFm0m2bM-EPBe-Zfg7R2MniB1B8"
                  size="invisible"
                />
                <DialogContentText>
                  <small><Link to="/help" style={{textDecoration:"none"}}><RLink color="secondary" component="span">免責事項・ご利用に関する注意</RLink></Link> | <RLink color="secondary" target="_blank" href="https://gist.github.com/potakusan/7281da1405d4381dc55e19ff8a43926f">この機能について</RLink><br/>
                  Protected by reCAPTCHA</small>
                </DialogContentText>
              </div>}
            </div>}
          </DialogContent>
          {!isLoading && (
          <DialogActions>
            <Button onClick={this.props.close} color="primary">
              閉じる
            </Button>
            {!Number.isNaN(score.currentBPI) && (
            <Button onClick={this.exec} disabled={tooLong} color="primary">
              投稿
            </Button>)
            }
          </DialogActions>)}
        </Dialog>
      </div>
    );
  }
}

class NotesList extends React.Component<{
  list:any[]
},{}>{
  render(){
    return (
      this.props.list.map((data:any)=>{
        const item = data.data();
        return (
          <div>
            <p>{item.memo}</p>
            <small style={{display:"flex",justifyContent:"flex-end"}}>投稿者の単曲BPI:{item.userBPI}<br/>投稿日:{item.wroteAt ? timeFormatter(3,item.wroteAt.toDate()) : "たった今"}</small>
            <Divider style={{margin:"10px 0"}}/>
          </div>
        )
      })
    );
  }
}
