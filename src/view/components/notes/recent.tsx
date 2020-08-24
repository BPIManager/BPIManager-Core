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
import Button from '@material-ui/core/Button';
import {Link as RLink} from "react-router-dom";

interface S{
  isLoading:boolean,
  recentNotes:any[],
  isModalOpen:boolean,
  lastReached:boolean,
  data:any
}

class NotesRecent extends React.Component<{},S> {
  private fbA:fbActions = new fbActions();

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:true,
      isModalOpen:false,
      lastReached:false,
      recentNotes:[],
      data:null,
    }
  }

  async componentDidMount(){
    const recentNotes = await this.fbA.loadRecentNotes();
    this.setState({
      recentNotes:recentNotes.docs,
      isLoading:false,
    })
  }

  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag,data:null})

  onClick = (data:any)=>{
    this.setState({
      isModalOpen:true,
      data:data
    })
  }

  next = async()=>{
    const{recentNotes} = this.state;
    const last = recentNotes[recentNotes.length - 1];
    const next = await this.fbA.loadRecentNotes(last);
    if(next.docs.length === 0){
      this.setState({lastReached:true});
    }else{
      this.setState({recentNotes:recentNotes.concat(next.docs)})
    }
  }

  render(){
    const {isLoading,recentNotes,isModalOpen,data,lastReached} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Container fixed>
        <Alert variant="outlined" severity="info" style={{margin:"8px 0"}}>
          <AlertTitle>Notesとは？</AlertTitle>
          <p>Notesとは、各楽曲について攻略に役立つノートを投稿することができる機能です。
          (<Link href="https://gist.github.com/potakusan/7281da1405d4381dc55e19ff8a43926f" color="secondary">仕様の詳細</Link>)<br/>
          <b>ノートを投稿するには、<RLink to="/songs"><Link color="secondary" component="span">楽曲一覧</Link></RLink>からノートを投稿したい楽曲を長押しして書き込みしてください。</b><br/>
          「MYノート」から投稿済みノートを削除することができます。
        </p>
        </Alert>
        <List
          component="nav"
        >
          {recentNotes.map((item:any,i:number)=>{
            let data = item.data();
            let note = data.memo;
            if(note.length > 40){
              note = note.substr(0,40) + "...";
            }
            return (
              <ListItem button onClick={()=>this.onClick(data)} key={i}>
                <ListItemText primary={<span>{data.songName + _prefixWithPS(data.songDiff,data.isSingle)}&nbsp;<small>{updatedTime(data.wroteAt.toDate())}</small></span>} secondary={note} />
              </ListItem>
            )
          })}
          </List>
          {!lastReached && <Button fullWidth variant="outlined" onClick={this.next}>次の20件を表示</Button>}
          {lastReached && <Button fullWidth disabled>すべて読み込みました</Button>}
          {(isModalOpen && data) && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </Container>
    );
  }
}

export default NotesRecent;
