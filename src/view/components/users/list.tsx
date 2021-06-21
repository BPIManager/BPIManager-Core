import * as React from 'react';
import { functions } from '@/components/firebase';
import { _currentStore } from '@/components/settings';
import ModalUser from '../rivals/modal';
import Slide from '@material-ui/core/Slide';
import Dialog from '@material-ui/core/Dialog';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import { TransitionProps } from '@material-ui/core/transitions';
import Typography from '@material-ui/core/Typography';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Loader from '../common/loader';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import { getAltTwitterIcon } from '@/components/rivals';
import { alternativeImg } from '@/components/common';
import Alert from '@material-ui/lab/Alert/Alert';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import Button from '@material-ui/core/Button';

interface P{
  ids:string[],
  text:string
  handleClose:()=>void,
  userName:string
}

interface S{
  notLoaded:string[],
  users:any[],
  isModalOpen:boolean,
  currentUserName:string,
  loading:boolean
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children?: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class FolloweeList extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state = {
      notLoaded:props.ids,
      users:[],
      isModalOpen:false,
      currentUserName:"",
      loading:false,
    }
  }

  componentDidMount(){
    this.loadMore();
    window.history.pushState(null,"UserList",null);
    window.addEventListener("popstate",this.overridePopstate,false);
  }

  componentWillUnmount(){
    window.removeEventListener("popstate",this.overridePopstate,false);
  }

  overridePopstate = ()=>this.props.handleClose();

  handleModalOpen = (flag:boolean)=> {
    if(flag === false){
      window.history.pushState(null,"UserList",null);
      window.addEventListener("popstate",this.overridePopstate,false);
    }
    this.setState({isModalOpen:flag});
  }

  async loadMore(forceArray:string[]|null = null){
    console.log("a");
    if(this.state.loading === true) return;
    this.setState({loading:true});
    const targetArray = forceArray !== null ? forceArray : this.state.notLoaded;
    if(targetArray.length === 0){
      return this.setState({loading:false});
    }
    const res = await functions.httpsCallable("getFolloweeDetails")({
      userIds:targetArray.slice(0,10),
      version:_currentStore()
    });
    return this.setState({
      notLoaded:targetArray.slice(10,targetArray.length),
      users:(res.data && res.data.body) ? this.state.users.concat(res.data.body) : this.state.users,
      loading:false
    })
  }

  openModal = (item:any)=>{
    window.removeEventListener("popstate",this.overridePopstate,false);
    this.setState({
      isModalOpen:true,
      currentUserName:item.displayName
    })
  }

  render(){
    const {handleClose,userName,text} = this.props;
    const {notLoaded,users,isModalOpen,currentUserName,loading} = this.state;
    return (
      <React.Fragment>
      <Dialog fullScreen open={true} onClose={handleClose} TransitionComponent={Transition}>
        <AppBar style={{ position: 'relative' }}>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={handleClose} aria-label="close">
              <ArrowBackIosIcon />
            </IconButton>
            <Typography variant="h6">
              {userName}さんの{text}
            </Typography>
          </Toolbar>
        </AppBar>
        {users && (
          <List>
            {users.map((item)=>{
              return (
                <ListItem button onClick={()=>this.openModal(item)}>
                  <ListItemIcon>
                    <Avatar>
                      <img src={item.photoURL ? item.photoURL : "noimg"} style={{width:"100%",height:"100%"}}
                        alt={item.displayName}
                        onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(item,false,"normal") || alternativeImg(item.displayName)}/>
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText primary={item.displayName} secondary={(item.arenaRank || "-") + " / 総合BPI:" + (item.totalBPI || "- ")} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" aria-label="delete">
                      <ChevronRightIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              )
            })}
          </List>
        )}
        {(!loading && users.length === 0) && (
          <Alert severity="warning">
            ライバルが見つかりませんでした。<br/>
            （プロフィールを非公開にしているライバルはリストに表示されません）
          </Alert>
        )}
        {loading && <Loader text="ライバルを読み込んでいます"/>}
        {notLoaded.length > 0 && (
        <Button disabled={loading} onClick={()=>this.loadMore()} fullWidth>
          更に読み込む
        </Button>
        )}
      </Dialog>
      {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} handleOpen={(flag:boolean)=>this.handleModalOpen(flag)}/>}
      </React.Fragment>
    );
  }
}

export default FolloweeList;
