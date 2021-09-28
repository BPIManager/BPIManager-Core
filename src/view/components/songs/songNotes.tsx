import React from "react";

import { scoreData, songData } from "@/types/data";
import Container from "@mui/material/Container";
import Loader from "../common/loader";
import fbActions from "@/components/firebase/actions";
import Alert from "@mui/material/Alert/Alert";
import AlertTitle from "@mui/material/AlertTitle/AlertTitle";
import Fab from "@mui/material/Fab";
import EditIcon from '@mui/icons-material/Edit';
import { Link } from "react-router-dom";
import {
  Link as RLink,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
  Button,
  Divider,
  InputLabel,
  FormControl,
  Select,
  MenuItem,
  Grid,
  IconButton,
  Theme,
  Badge,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  SelectChangeEvent,
} from "@mui/material/";
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import timeFormatter, { updatedTime } from "@/components/common/timeFormatter";
import ReCAPTCHA from "react-google-recaptcha";
import { difficultyDiscriminator, _prefixWithPS } from "@/components/songs/filter";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LinkIcon from '@mui/icons-material/Link';

interface P{
  song:songData|null,
  score:scoreData|null,
  isIndv?:boolean
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

  handleChange = (event: SelectChangeEvent<number>)=> {
    if(typeof event.target.value !== "number"){return;}
    this.setState({currentSort:event.target.value,isLoading:true});
    this.load(true,event.target.value);
  }

  async load(forceReload:boolean = false,newSort = -1){
    const {song} = this.props;
    if(!song){return this.setState({isLoading:false,notes:[]})}
    const notes = await this.fbActions.loadNotes(song,forceReload ? null : this.state.lastLoaded,newSort === -1 ? this.state.currentSort : newSort);
    return this.setState(notes.docs.length > 0 ? {notes:notes.docs,lastLoaded:notes.docs[notes.docs.length - 1],isLoading:false} : {notes:[],lastLoaded:null,isLoading:false})
  }

  render(){
    const {isLoading,notes,isOpen,currentSort} = this.state;
    const {isIndv,song} = this.props;
    if(!song){return (null);}
    return (
      <div style={{margin:"15px 0"}}>
        <Container fixed>
          {!isIndv && (
            <div style={{marginBottom:"8px"}}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                startIcon={<LinkIcon />}
                onClick={()=>window.open(`/notes/${song.title}/${difficultyDiscriminator(song.difficulty)}/${song.dpLevel === "0" ? "sp" : "dp"}`)}
                >
                新しいタブで開く
              </Button>
            </div>
          )}
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
                <MenuItem value={2}>いいねが多い順</MenuItem>
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
        <RLink color="secondary" href="https://docs2.poyashi.me/tos/" component="a">免責事項・ご利用に関する注意</RLink><br/>
        <RLink color="secondary" href="https://docs2.poyashi.me/docs/social/notes/">この機能について</RLink>
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
      const response = await fetch("https://asia-northeast1-bpimv2.cloudfunctions.net/writeComment",{
        method:"POST",
        body:JSON.stringify({
          songTitle:this.props.song.title,
          songDiff:difficultyDiscriminator(this.props.song.difficulty),
          memo:this.state.text,
          userBPI:this.props.score ? this.props.score.currentBPI : -15,
          userScore:this.props.score ? this.props.score.exScore : 0,
          uid:authInfo ? authInfo.uid : null,
          isSingle:this.props.song.dpLevel === "0",
          token:token,
        })
      });
      if(response.status === 200 && ((await response.json()) || {"error":true})["error"] === false){
        this.props.saveAndReload();
        this.props.close();
      }
    }else{
      alert("No ReCaptcha Signature! Please reload this page and try again.");
    }
  }

  ref = React.createRef<ReCAPTCHA>();

  render(){
    const {score} = this.props;
    const {isLoading} = this.state;
    const tooLong = this.state.text.length > 500;
    return (
      <React.Fragment>
        <Dialog open={true}>
          <DialogTitle>投稿を作成</DialogTitle>
          <DialogContent>
            {isLoading && <Loader/>}
            {!isLoading && <div>
              {(!score || (score && Number.isNaN(score.currentBPI))) && (
                <span>プレイログがない楽曲に対してコメントを投稿することはできません。<br/>
                  BPIManagerをはじめて使う場合、まずは<Link to="/data" style={{textDecoration:"none"}}><RLink color="secondary" component="span">データ取り込み</RLink></Link>からプレイデータをインポートしてください。
                </span>)}
              {(score && !Number.isNaN(score.currentBPI)) && <div>
                <TextField
                  multiline
                  fullWidth
                  rows={4}
                  error={tooLong}
                  helperText={tooLong ? "500文字を超えています！" : ""}
                  placeholder={"一度に500文字まで入力できます"}
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
                  <small><RLink href="https://docs2.poyashi.me/tos/" color="secondary">免責事項・ご利用に関する注意</RLink> | <RLink color="secondary" target="_blank" href="https://docs2.poyashi.me/docs/social/notes/">この機能について</RLink><br/>
                  Protected by reCAPTCHA | 記録されるBPI:{score.currentBPI}</small>
                </DialogContentText>
              </div>}
            </div>}
          </DialogContent>
          {!isLoading && (
          <DialogActions>
            <Button onClick={this.props.close} color="primary">
              閉じる
            </Button>
            {(score && !Number.isNaN(score.currentBPI)) && (
            <Button onClick={this.exec} disabled={tooLong} color="primary">
              投稿
            </Button>)
            }
          </DialogActions>)}
        </Dialog>
      </React.Fragment>
    );
  }
}

class NotesList extends React.Component<{
  list:any[]
},{}>{

  render(){
    return (
      this.props.list.map((data:any)=>{
        return (<EachMemo item={data} key={data.id}/>);
      })
    );
  }
}

export class EachMemo extends React.Component<{
  item:any,
  listType?:boolean,
  noEllipsis?:boolean,
  onClick?:(val:any)=>void
},{
  memo:string,
  likeCount:number,
  wroteAt:any,
  userBPI:number,
}>{

  constructor(props:{item:any}){
    super(props);
    const item = props.item.data();
    this.state = {
      memo:item.memo,
      likeCount:item.likeCount || 0,
      wroteAt:item.wroteAt,
      userBPI:item.userBPI
    }
  }

  favButton = async ()=>{
    const fbA = new fbActions();
    if(!this.props.item.id){
      return;
    }
    const res = await fbA.likeNotes(this.props.item.id);
    if(!res){
      alert("いいねに失敗しました。\nSyncでログインしていない可能性があります。");
      return;
    }else{
      return this.setState({
        likeCount:this.state.likeCount + res
      })
    }
  }

  render(){
    const {memo,likeCount,wroteAt,userBPI} = this.state;
    if(this.props.listType){
      const {onClick,noEllipsis} = this.props;
      if(!onClick){ return (null); }
      let note = memo;
      const it = this.props.item.data();
      if(note.length > 40 && !noEllipsis){
        note = note.substr(0,40) + "...";
      }
      return (
        <ListItem button onClick={()=>onClick(it)}>
          <ListItemText primary={<span>{it.songName + _prefixWithPS(it.songDiff,it.isSingle)}&nbsp;<small>{updatedTime(wroteAt.toDate())}</small></span>} secondary={note} />
          <ListItemSecondaryAction>
            <IconButton aria-label="likeButton" onClick={this.favButton} size="large">
              <StyledBadge badgeContent={likeCount || 0} color="secondary">
                <FavoriteBorderIcon />
              </StyledBadge>
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      );
    }
    return (
      <React.Fragment>
        <p>{memo}</p>
        <Grid container justifyContent="space-around" alignItems="center">
          <Grid item>
            <IconButton aria-label="likeButton" onClick={this.favButton} size="large">
              <StyledBadge badgeContent={likeCount || 0} color="secondary">
                <FavoriteBorderIcon />
              </StyledBadge>
            </IconButton>
          </Grid>
          <Grid item>
            <small style={{display:"flex",justifyContent:"flex-end"}}>投稿者の単曲BPI:{userBPI}<br/>投稿日:{wroteAt ? timeFormatter(3,wroteAt.toDate()) : "たった今"}</small>
          </Grid>
        </Grid>
        <Divider style={{margin:"10px 0"}}/>
      </React.Fragment>
    );
  }
}

export const StyledBadge = withStyles((theme: Theme) =>
  createStyles({
    badge: {
      right: -3,
      top: 13,
      border: `2px solid ${theme.palette.background.paper}`,
      padding: '0 4px',
    },
  }),
)(Badge);
