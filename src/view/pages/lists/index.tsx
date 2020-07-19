import React from 'react';
import { favsDB } from '@/components/indexedDB';
import Loader from '@/view/components/common/loader';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import ListItemText from '@material-ui/core/ListItemText';
import { DBLists } from '@/types/lists';
import { alternativeImg } from '@/components/common';
import Container from '@material-ui/core/Container';
import SettingsIcon from '@material-ui/icons/Settings';
import Button from '@material-ui/core/Button';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import * as H from 'history';
import ListAdd from "./add";
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';

interface S {
  isLoading:boolean,
  lists:any[],
  addList:boolean,
  currentTarget:number,
  message:string,
  showSnackBar:boolean,
}

class FavLists extends React.Component<{}&RouteComponentProps,S> {

  constructor(props:{}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      lists:[],
      addList:false,
      currentTarget:-1,
      message:"",
      showSnackBar:false,
    }
    this.updateData = this.updateData.bind(this);
  }

  async componentDidMount(){
    await this.updateData();
  }

  async updateData(){
    try{
      const db = new favsDB();
      const res = await db.getAllLists();
      this.setState({isLoading:false,lists:res});
    }catch(e){
      console.log(e);
    }
  }

  toggleAddListScreen = (reload:boolean = false)=> {
    if(reload){
      this.updateData();
    }
    this.setState({addList:!this.state.addList,currentTarget:-1});
  }

  toggleEditListScreen = (target:number)=> {
    this.setState({addList:!this.state.addList,currentTarget:target});
  }
  toggleSnack = (message:string = "リストを追加しました")=> this.setState({message:message,showSnackBar:!this.state.showSnackBar});

  render(){
    const {isLoading,lists,addList,currentTarget} = this.state;

    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Container className="commonLayout" fixed>
        <List>
          {lists.map((item,i)=>{
            return (
              <div key={i}>
                <ListComponent key={i} data={item} history={this.props.history} toggleEditListScreen={this.toggleEditListScreen}/>
                {i !== lists.length - 1 && <Divider variant="inset" component="li" />}
              </div>
          )})}
        </List>
        <Button color="secondary" variant="outlined" fullWidth style={{marginTop:"10px"}} onClick={()=>this.toggleAddListScreen()}>
          新しいリストを作成
        </Button>

        <Alert severity="info" style={{margin:"10px 0"}}>
          <AlertTitle style={{marginTop:"0px",fontWeight:"bold"}}>Tips</AlertTitle>
          <p>リスト右側に表示されているギアアイコンをクリックして、リスト情報を編集したり、リストを削除できます。<br/>リストを作成できる数に上限はありません。</p>
        </Alert>
        {addList && <ListAdd isCreating={currentTarget === -1} target={currentTarget} toggleSnack={this.toggleSnack} handleToggle={this.toggleAddListScreen}/>}
      </Container>
    );
  }
}

interface CP {
  data:DBLists,
  toggleEditListScreen:(target:number)=>void,
  history:H.History
}

class ListComponent extends React.Component<CP,{}> {

  render(){
    const {data} = this.props;
    const text = <span>{data.description || "No description"}<br/>最終更新: {data.updatedAt}</span>
    return (
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <img src={alternativeImg(data.title)} style={{width:"100%",height:"100%"}}
              alt={data.title}/>
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={`${data.title}(${data.length})`} secondary={text} onClick={()=>this.props.history.push("/lists/" + data.num)} />
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="comments" onClick={()=>this.props.toggleEditListScreen(data.num)}>
            <SettingsIcon/>
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}


export default withRouter(FavLists);
