import * as React from 'react';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import AddIcon from '@material-ui/icons/Add';
import Fab from '@material-ui/core/Fab';
import RivalAdd from './add';
import ShowSnackBar from '../snackBar';
import { rivalListsDB } from '../../../components/indexedDB';
import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';
import { DBRivalStoreData } from '../../../types/data';

interface S {
  isAddOpen:boolean,
  showSnackBar:boolean,
  isLoading:boolean,
  rivals:DBRivalStoreData[],
  message:string,
}

interface P {
  showEachRival: (input:DBRivalStoreData)=>void
}

class RivalLists extends React.Component<P,S> {
  private rivalListsDB = new rivalListsDB();

  constructor(props:P){
    super(props);
    this.state = {
      isAddOpen:false,
      showSnackBar:false,
      isLoading:true,
      rivals:[],
      message:""
    }
  }

  componentDidMount(){
    this.loadRivals();
  }

  loadRivals = async()=>{
    this.setState({isLoading:true});
    return this.setState({
      isLoading:false,
      rivals:await this.rivalListsDB.getAll()
    });
  }

  handleToggleModal = ()=> this.setState({isAddOpen:!this.state.isAddOpen});
  toggleSnack = (message:string = "ライバルを追加しました")=> this.setState({message:message,showSnackBar:!this.state.showSnackBar});

  render(){
    const {isAddOpen,showSnackBar,rivals,isLoading,message} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>);
    }
    return (
      <div>
        {rivals.length === 0 && <p>まだライバルがいません。</p>}
        {rivals.map(item=>(
          <div key={item.uid} onClick={()=>this.props.showEachRival(item)}><RivalComponent data={item}/></div>)
        )}
        <Fab onClick={this.handleToggleModal} color="secondary" aria-label="add" style={{position:"fixed","bottom":"5%","right":"3%"}}>
          <AddIcon />
        </Fab>
        {isAddOpen && <RivalAdd loadRivals={this.loadRivals} toggleSnack={this.toggleSnack} handleToggle={this.handleToggleModal}/>}
        <ShowSnackBar message={message} variant="success"
            handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000}/>
      </div>
    );
  }
}

interface CP {
  data:DBRivalStoreData
}

class RivalComponent extends React.Component<CP,{}> {

  render(){
    const {data} = this.props;
    const text = <span>{data.profile}<br/>最終更新: {data.updatedAt}</span>
    return (
      <div style={{margin:"10px 0 0 0"}}>
        <Paper>
          <ListItem button>
            <ListItemAvatar>
              <Avatar>
                <img src={data.photoURL ? data.photoURL : "noimage"} style={{width:"100%",height:"100%"}}
                  alt={data.rivalName}
                  onError={(e)=>(e.target as HTMLImageElement).src = 'https://files.poyashi.me/noimg.png'}/>
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={data.rivalName} secondary={text} />
          </ListItem>
        </Paper>
      </div>
    );
  }
}

export default RivalLists;
