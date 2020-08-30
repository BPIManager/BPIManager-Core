import * as React from 'react';

import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import fbActions from '@/components/firebase/actions';
import Loader from '../../common/loader';
import List from '@material-ui/core/List';
import ModalNotes from '../modal';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { EachMemo } from '../../songs/songNotes';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface S {
  notes:any[],
  isLoading:boolean,
  isModalOpen:boolean,
  data:any,
  sort:number
}

interface P{
  backToMainPage:()=>void|null
  name:string,
  uid:string,
}

class NotesView extends React.Component<P,S> {
  private fbA:fbActions = new fbActions();

  constructor(props:P){
    super(props);
    this.state = {
      isLoading:true,
      isModalOpen:false,
      notes:[],
      data:null,
      sort:0
    }
  }

  async componentDidMount(){
    this.changeSort();
  }

  async changeSort(newSort = 0){
    const {uid} = this.props;
    this.setState({isLoading:true});
    const sort = newSort;
    const loaded = sort === 0 ? await this.fbA.loadUserNotes(uid) : await this.fbA.loadUserNotes(uid,1);
    this.setState({
      notes:loaded.docs,
      isLoading:false,
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
    const {isLoading,notes,data,isModalOpen,sort} = this.state;
    const sortDisp = [
      "最近書き込まれた順",
      "いいねが多い順"
    ]
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
          <div>
            <FormControl fullWidth style={{marginTop:"8px"}}>
              <InputLabel>並び替えを変更</InputLabel>
              <Select fullWidth value={sort} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                if(typeof e.target.value !== "number") return;
                this.setState({sort:e.target.value});
                this.changeSort(e.target.value);
                }}
              >
                {[0,1].map(item=><MenuItem value={item} key={item}>{sortDisp[item]}</MenuItem>)}
              </Select>
            </FormControl>
            <List component="nav">
              {notes.map((item:any,i:number)=>{
                return (
                  <EachMemo item={item} listType onClick={this.onClick} key={i}/>
                )
              })}
          </List>
          </div>
        )}
        {(isModalOpen && data) && <ModalNotes derived={data} isOpen={isModalOpen} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </div>
    );
  }
}

export default NotesView;
