import * as React from 'react';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import fbActions from '@/components/firebase/actions';
import Loader from '../../common/loader';
import List from '@material-ui/core/List';
import ListItemText from '@material-ui/core/ListItemText';
import ListItem from '@material-ui/core/ListItem';
import {  _prefixWithPS } from '@/components/songs/filter';
import { updatedTime } from '@/components/common/timeFormatter';
import ModalNotes from '../modal';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';

interface S {
  notes:any[],
  isLoading:boolean,
  isModalOpen:boolean,
  data:any
}

interface P{
  backToMainPage:()=>void|null
  name:string,
  uid:string,
}

class NotesView extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      isModalOpen:false,
      notes:[],
      data:null
    }
  }

  async componentDidMount(){
    const fbA = new fbActions();
    const notes = await fbA.loadUserNotes(this.props.uid);
    this.setState({
      isLoading:false,
      isModalOpen:false,
      notes:notes.docs,
      data:null,
    })
  }

  onClick = (data:any)=>{
    this.setState({
      isModalOpen:true,
      data:data
    })
  }

  handleModalOpen = (flag:boolean)=> this.setState({isModalOpen:flag,data:null})

  render(){
    const {backToMainPage,name} = this.props;
    const {isLoading,notes,data,isModalOpen} = this.state;
    return (
      <div>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <Button onClick={backToMainPage} style={{minWidth:"auto",padding:"6px 0px"}}><ArrowBackIcon/></Button>
          &nbsp;{name}さんのノート
        </Typography>
        {isLoading && <Loader/>}
        {(!isLoading && notes.length === 0) && (
          <Alert severity="warning">
            <AlertTitle>まだノートがありません</AlertTitle>
            <p>{name}さんはまだノートを投稿していません。</p>
          </Alert>
        )}
        {!isLoading && (
          <List component="nav">
          {notes.map((item:any,i:number)=>{
            let data = item.data();
            let note = data.memo;
            return (
              <ListItem button onClick={()=>this.onClick(data)} key={i}>
                <ListItemText primary={<span>{data.songName + _prefixWithPS(data.songDiff,data.isSingle)}&nbsp;<small>{updatedTime(data.wroteAt.toDate())}</small></span>} secondary={note} />
              </ListItem>
            )
          })}
          </List>
        )}
        {(isModalOpen && data) && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </div>
    );
  }
}

export default NotesView;
