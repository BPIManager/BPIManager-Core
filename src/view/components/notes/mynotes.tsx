import * as React from 'react';
import Container from '@material-ui/core/Container';
import fbActions from '@/components/firebase/actions';
import Loader from '@/view/components/common/loader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import { _prefix } from '@/components/songs/filter';
import { updatedTime } from '@/components/common/timeFormatter';
import ModalNotes from './modal';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Link from '@material-ui/core/Link';
import {Link as RLink} from "react-router-dom";

interface S{
  isLoading:boolean,
  myNotes:any[],
  isModalOpen:boolean,
  data:any
}

class MyNotes extends React.Component<{},S> {
  private fbA:fbActions = new fbActions();

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:true,
      isModalOpen:false,
      myNotes:[],
      data:null,
    }
  }

  async componentDidMount(){
    const myNotes = await this.fbA.loadMyNotes();
    this.setState({
      myNotes:myNotes ? myNotes.docs : [],
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

  render(){
    const {isLoading,myNotes,isModalOpen,data} = this.state;
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
        {myNotes.length === 0 && (
          <Alert severity="error">
            <AlertTitle>まだノートを投稿していません</AlertTitle>
            <p>あなたの知恵をノートとしてシェアしませんか？<br/>
            <RLink to="/songs"><Link color="secondary">楽曲一覧</Link></RLink>からノートを投稿したい楽曲をタップし、「NOTES」タブを選択して書き込みしてください。</p>
          </Alert>
        )}
        <List
          component="nav"
        >
          {myNotes.map((item:any,i:number)=>{
            let data = item.data();
            let note = data.memo;
            return (
              <ListItem button onClick={()=>this.onClick(data)} key={i}>
                <ListItemText primary={<span>{!data.isSingle && "(DP)"}{data.songName + _prefix(data.songDiff)}&nbsp;<small>{updatedTime(data.wroteAt.toDate())}</small></span>} secondary={note} />
              </ListItem>
            )
          })}
          </List>
        {(isModalOpen && data) && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </Container>
    );
  }
}

export default MyNotes;
