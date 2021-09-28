import * as React from 'react';
import { functions } from '@/components/firebase';
import { _currentStore } from '@/components/settings';
import ModalUser from '../rivals/modal';
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import { TransitionProps } from '@mui/material/transitions';
import Typography from '@mui/material/Typography';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Loader from '../common/loader';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { getAltTwitterIcon } from '@/components/rivals';
import { alternativeImg } from '@/components/common';
import Alert from '@mui/material/Alert/Alert';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import Button from '@mui/material/Button';

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
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              size="large">
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
                    <IconButton edge="end" aria-label="delete" size="large">
                      <ChevronRightIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
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
