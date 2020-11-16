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
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import AdsCard from '@/components/ad';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import { listNobi11, listNobi12 } from '@/components/lists';

interface S {
  isLoading:boolean,
  lists:any[],
  addList:boolean,
  currentTarget:number,
  message:string,
  showSnackBar:boolean,
  checked:boolean,
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
      checked:localStorage.getItem("hideDefaultLists") === "true",
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
      this.setState({isLoading:false,lists:this.state.checked ? res : [
        listNobi11,listNobi12
      ].concat(res)});
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

  handleChange = (_e:React.ChangeEvent,checked:boolean)=>{
    localStorage.setItem("hideDefaultLists",String(checked));
    this.setState({checked:checked});
    this.updateData();
  }

  render(){
    const {isLoading,lists,addList,currentTarget} = this.state;

    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Container fixed  className="commonLayout">
        <div style={{display:"flex",justifyContent:"flex-end"}}>
        <FormControl component="fieldset">
          <FormControlLabel
            control={
              <Switch
                checked={this.state.checked}
                onChange={this.handleChange}
                name="デフォルトリストを非表示"
                color="primary"
              />
            }
            label="デフォルトリストを非表示"
          />
        </FormControl>
      </div>
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
        <AdsCard/>
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
    const text = <span>{data.description || "No description"}{data.updatedAt !== "-1" && <span><br/>最終更新: {data.updatedAt}</span>}</span>
    return (
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <img src={data.icon || alternativeImg(data.title)}
              style={{width:"100%",height:"100%",objectFit:"cover"}}
              onError={(e)=>(e.target as HTMLImageElement).src = alternativeImg(data.title)}
              alt={data.title}/>
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={`${data.title}` + (data.length !== -1 ? `(${data.length})` : "")} secondary={text} onClick={()=>this.props.history.push("/lists/" + data.num)} />
        {data.length !== -1 &&
        <ListItemSecondaryAction>
          <IconButton edge="end" aria-label="comments" onClick={()=>this.props.toggleEditListScreen(data.num)}>
            <SettingsIcon/>
          </IconButton>
        </ListItemSecondaryAction>
        }
      </ListItem>
    );
  }
}


export default withRouter(FavLists);
