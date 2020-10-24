import * as React from 'react';
import Container from '@material-ui/core/Container';
import fbActions from '@/components/firebase/actions';
import Loader from '@/view/components/common/loader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { _prefixWithPS } from '@/components/songs/filter';
import { updatedTime } from '@/components/common/timeFormatter';
import ModalNotes from './modal';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Link from '@material-ui/core/Link';
import {Link as RLink} from "react-router-dom";
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import TextField from '@material-ui/core/TextField';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import { _currentStore } from '@/components/settings';
import { scoreData } from '@/types/data';
import { scoresDB } from '@/components/indexedDB';
import firebase from 'firebase/app';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import { StyledBadge } from '../songs/songNotes';
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder';

interface S{
  isLoading:boolean,
  myNotes:any[],
  isModalOpen:boolean,
  data:any,
  modifyModal:boolean,
  currentId:string,
  currentScore:scoreData|null,
  temp:string,
}

class MyNotes extends React.Component<{},S> {
  private fbA:fbActions = new fbActions();
  private buttonPressTimer:number = 0;
  private scoresDB = new scoresDB();

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:true,
      isModalOpen:false,
      myNotes:[],
      data:null,
      modifyModal:false,
      currentId:"",
      temp:"",
      currentScore:null
    }
  }

  async componentDidMount(){
    const myNotes = await this.fbA.loadMyNotes();
    if(!myNotes){
      return this.setState({
        myNotes:[],
        isLoading:false
      })
    }
    const docs = myNotes.docs;
    const res = [];
    for (let i = 0;i < docs.length; ++i){
      res.push(Object.assign(docs[i].data(),{"id":docs[i].id}));
    }
    this.setState({
      myNotes:res,
      isLoading:false,
    })
  }

  scoreFinder = async (title:string,difficulty:string,isSingle:boolean):Promise<scoreData|null>=>{
    const items = await this.scoresDB.getItem(title,difficulty,_currentStore(),isSingle ? 1 : 0);
    if(items.length > 0){
      return items[0];
    }
    return null;
  }


  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag,data:null})

  onClick = (data:any)=>{
    this.setState({
      isModalOpen:true,
      data:data
    })
  }

  handleButtonPress=(current:any,temp:string)=>{
    this.buttonPressTimer = window.setTimeout(async() =>{
      const {songName,songDiff,isSingle} = current;
      return this.setState({
        modifyModal:!this.state.modifyModal,
        currentId:current.id,
        temp:temp,
        currentScore:await this.scoreFinder(songName,songDiff,isSingle)
      });
    }, 600);
  }

  handleButtonRelease=()=>{
    window.clearTimeout(this.buttonPressTimer);
  }
  closeModal = (success:boolean = false)=>{
    if(success){
      return this.setState({
        modifyModal:false,
        currentId:"",
        temp:"",
        currentScore:null,
        myNotes:this.state.myNotes.filter((item:any)=>item.id !== this.state.currentId)
      })
    }
    this.setState({modifyModal:false})
  }

  render(){
    const {isLoading,myNotes,isModalOpen,data,modifyModal,currentId,temp,currentScore} = this.state;
    const auth = this.fbA.authInfo();
    if(isLoading){
      return (<Loader/>);
    }
    if(!auth){
      return (
        <Container fixed>
          <Alert severity="error">
            <AlertTitle>ログインしていません</AlertTitle>
            <p>Myノート機能は、Syncにログインすることでご利用いただけます。<br/>
            <RLink to="/sync"><Link color="secondary">こちら</Link></RLink>からログインしてください。</p>
          </Alert>
        </Container>
      )
    }
    return (
      <Container fixed>
          <Alert variant="outlined" severity="info" style={{margin:"8px 0"}}>
            <AlertTitle>投稿済みノート</AlertTitle>
            <p>あなたが投稿したノートをすべて表示しています。<br/>
            ノートを削除するには対象ノートを長押ししてください。
          </p>
          </Alert>
        <List
          component="nav"
        >
          {myNotes.map((data:any,i:number)=>{
            let note = data.memo;
            return (
              <ListItem button
                onTouchStart={()=>this.handleButtonPress(data,note)}
                onTouchEnd={()=>this.handleButtonRelease()}
                onMouseDown={()=>this.handleButtonPress(data,note)}
                onMouseUp={()=>this.handleButtonRelease()}
                onMouseLeave={()=>this.handleButtonRelease()}
                onClick={()=>this.onClick(data)}
                onContextMenu={e => {
                  e.preventDefault();
                }} key={i}>
                <ListItemText primary={<span>{data.songName + _prefixWithPS(data.songDiff,data.isSingle)}&nbsp;<small>{updatedTime(data.wroteAt.toDate())}</small></span>} secondary={note} />
                <ListItemSecondaryAction>
                  <IconButton aria-label="likeButton" disabled>
                    <StyledBadge badgeContent={data.likeCount || 0} color="secondary">
                      <FavoriteBorderIcon />
                    </StyledBadge>
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )
          })}
          </List>
            {myNotes.length === 0 && (
              <Alert severity="error">
                <AlertTitle>まだノートを投稿していません</AlertTitle>
                <p>あなたの知恵をノートとしてシェアしませんか？<br/>
                <RLink to="/songs"><Link color="secondary">楽曲一覧</Link></RLink>からノートを投稿したい楽曲をタップし、「NOTES」タブを選択して書き込みしてください。</p>
              </Alert>
            )}
        {(isModalOpen && data) && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
        {(modifyModal && currentId !== "") && <WriteDialog closeModal={this.closeModal} currentId={currentId} temp={temp} score={currentScore}/>}
      </Container>
    );
  }
}

interface WP {
  currentId:string,
  temp:string,
  closeModal:(success:boolean)=>void,
  score:scoreData|null,
}

class WriteDialog extends React.Component<WP,{
  text:string,
  isLoading:boolean,
}>{

  constructor(props:WP){
    super(props);
    this.state = {
      text: props.temp,
      isLoading:false,
    }
  }

  changeValue = (e:React.ChangeEvent<HTMLInputElement>)=>{
    if(this.state.isLoading) return;
    this.setState({text:e.target.value});
  }

  exec = async()=>{
    try{
      const {score} = this.props;
      if(!score){return;}
      this.setState({isLoading:true});
      const functions = firebase.functions();
      const func = functions.httpsCallable("updateComment");
      await func({ userBPI:score.currentBPI, memo:this.state.text, id:this.props.currentId });
      this.props.closeModal(true);
    }catch(e){
      console.log(e);
      return this.setState({isLoading:false})
    }
  }

  render(){
    const {score} = this.props;
    const {isLoading} = this.state;
    if(!score) return (null);
    const tooLong = this.state.text.length > 500;
    return (
      <div>
        <Dialog open={true}>
          <DialogTitle>投稿を編集</DialogTitle>
          <DialogContent>
            {isLoading && <Loader/>}
            {!isLoading && <div>
              {Number.isNaN(score.currentBPI) && <span>プレイログがない楽曲に対してコメントを投稿することはできません。</span>}
              {!Number.isNaN(score.currentBPI) && <div>
                <p>以下の投稿を削除しますか？この操作は取り消すことができません。</p>
                <TextField
                  multiline
                  disabled
                  fullWidth
                  rows={4}
                  value={this.state.text}
                  variant="outlined"
                />
              </div>}
            </div>}
          </DialogContent>
          {!isLoading && (
          <DialogActions>
            <Button onClick={()=>this.props.closeModal(false)} color="primary">
              閉じる
            </Button>
            {!Number.isNaN(score.currentBPI) && (
            <Button onClick={this.exec} disabled={tooLong} color="primary">
              削除
            </Button>)
            }
          </DialogActions>)}
        </Dialog>
      </div>
    );
  }
}

export default MyNotes;
