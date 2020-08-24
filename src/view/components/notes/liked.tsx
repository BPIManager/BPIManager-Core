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
import AlertTitle from '@material-ui/lab/AlertTitle/AlertTitle';

interface S{
  isLoading:boolean,
  likedNotes:any[],
  isModalOpen:boolean,
  data:any
}

class NotesLiked extends React.Component<{},S> {
  private fbA:fbActions = new fbActions();

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:true,
      isModalOpen:false,
      likedNotes:[],
      data:null,
    }
  }

  async componentDidMount(){
    const likedNotes = await this.fbA.loadLikedNotes();
    if(!likedNotes){
      return this.setState({
        likedNotes:[],
        isLoading:false,
      })
    }
    const docs = likedNotes.docs;
    const res = [];
    for(let i = 0;i < docs.length; ++i){
      const data = docs[i].data();
      const ref = data.target ? await data.target.get() : null;
      if(ref){
        res.push(ref);
      }
    }
    return this.setState({
      likedNotes:res,
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
    const {isLoading,likedNotes,isModalOpen,data} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Container fixed>
        {likedNotes.length === 0 && (
          <Alert severity="error">
            <AlertTitle>いいねをした投稿がありません</AlertTitle>
            <p>投稿に「いいね」をつけると、この画面で一括確認することができます。<br/>
            役に立ちそうな投稿にはどんどん「いいね」を付けていきましょう！</p>
          </Alert>
        )}
        <List
          component="nav"
        >
          {likedNotes.map((item:any,i:number)=>{
            let data = item.data();
            if(!data) return (null);
            let note = data.memo;
            return (
              <ListItem button onClick={()=>this.onClick(data)} key={i}>
                <ListItemText primary={<span>{data.songName + _prefixWithPS(data.songDiff,data.isSingle)}&nbsp;<small>{updatedTime(data.wroteAt.toDate())}</small></span>} secondary={note} />
              </ListItem>
            )
          })}
        </List>
        {(isModalOpen && data) && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </Container>
    );
  }
}

export default NotesLiked;
