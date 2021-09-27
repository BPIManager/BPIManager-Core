import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Hidden from '@mui/material/Hidden';
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import {Link as RefLink, Collapse, Avatar, Chip} from '@mui/material/';
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SettingsIcon from "@mui/icons-material/Settings";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import BorderColorIcon from '@mui/icons-material/BorderColor';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import FilterNoneIcon from '@mui/icons-material/FilterNone';
import HelpIcon from '@mui/icons-material/Help';
import { FormattedMessage } from "react-intl";
import PeopleIcon from '@mui/icons-material/People';
import ShowSnackBar from "../snackBar";
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import withStyles from '@mui/styles/withStyles';
import { config } from "@/config";
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import LanguageIcon from '@mui/icons-material/Language';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import SpeakerNotesIcon from '@mui/icons-material/SpeakerNotes';
import { getAltTwitterIcon } from "@/components/rivals";
import { alternativeImg } from "@/components/common";
import fbActions from "@/components/firebase/actions";
import {ReactComponent as Logo} from "@/assets/aix2f-q5h7x.svg";
import LockOpenIcon from '@mui/icons-material/LockOpen';
import EventNoteIcon from '@mui/icons-material/EventNote';
import { _currentVersion, _traditionalMode } from "@/components/settings";
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import HistoryIcon from '@mui/icons-material/History';

interface navBars {
  to:string,
  id:string,
  icon:JSX.Element
}

const drawerWidth = 231;
const styles = (theme:any) => ({
  root: {
    display: 'flex',
  },
  menuButton: {
    marginRight: 20,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    marginLeft: drawerWidth,
    [theme.breakpoints.up('sm')]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  drawerPaper: {
    width: drawerWidth,
    overflowX:"hidden" as "hidden",
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing(7),
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

interface HideOnScrollProps {
  children?: React.ReactElement,
  window?: () => Window,
};

class GlobalHeader extends React.Component<{global:any,classes:any,theme:any,children:any} & HideOnScrollProps&RouteComponentProps,{
  isOpen:boolean,
  isOpenSongs:boolean,
  isOpenMyStat:boolean,
  isOpenSocial:boolean,
  errorSnack:boolean,
  user:any,
}>{

  constructor(props:{global:any,classes:any,theme:any,children:any} & HideOnScrollProps&RouteComponentProps){
    super(props);
    this.state = {
      isOpen:false,
      isOpenSongs:true,
      isOpenMyStat: false,
      isOpenSocial: false,
      errorSnack:false,
      user:null,
    }
  }

  async componentDidMount(){
    this.userData();
  }

  componentDidUpdate(prevProps:any) {
    if (
      this.props.location.pathname !== prevProps.location.pathname
    ) {
      window.scrollTo(0, 0);
    }
  }

  userData = async ()=>{
    if(localStorage.getItem("social")){
      try{
        return this.setState({user:JSON.parse(localStorage.getItem("social") || "[]")});
      }catch(e){
        return this.setState({user:null});
      }
    }else{
        return new fbActions().auth().onAuthStateChanged(async(user: any)=> {
          if(!user){return this.setState({user:null})}
          const u = await new fbActions().setDocName(user.uid).getSelfUserData();
          if(u.exists){
            localStorage.setItem("social",JSON.stringify(u.data()))
          }
          return this.setState({user:u.data()});
        });
    }
  }

  toggleNav = ()=> this.setState({isOpen:!this.state.isOpen});
  handleClickStats = ()=> this.setState({isOpenMyStat:!this.state.isOpenMyStat});
  handleClickSongs = ()=>this.setState({isOpenSongs:!this.state.isOpenSongs});
  handleClickSocial = ()=>this.setState({isOpenSocial:!this.state.isOpenSocial});
  toggleErrorSnack = ()=> this.setState({errorSnack:!this.state.errorSnack});

  render(){
    const {isOpen,isOpenSongs,isOpenMyStat,isOpenSocial,user} = this.state;
    const page = this.props.location.pathname.split("/");
    const currentPage = ()=>{
      switch(page[1]){
        default:
        return "Top.Title";
        case "data":
        return "GlobalNav.Data";
        case "lists":
        return "GlobalNav.FavoriteSongs";
        case "songs":
        return "GlobalNav.SongList";
        case "notPlayed":
        return "GlobalNav.unregisteredSongs";
        case "compare":
        return "GlobalNav.compare";
        case "stats":
        return "GlobalNav.Statistics";
        case "rivals":
        return "GlobalNav.Rivals";
        case "rivalCompare":
        return "GlobalNav.RivalCompare";
        case "sync":
        return "GlobalNav.Sync";
        case "history":
        return "GlobalNav.History";
        case "AAATable":
        return "GlobalNav.AAATable";
        case "tools":
        return "GlobalNav.Tools";
        case "settings":
        return "GlobalNav.Settings";
        case "help":
        return "GlobalNav.Help";
        case "notes":
        return "GlobalNav.Notes";
        case "ranking":
        return "GlobalNav.Weekly";
        case "u":
        return page[2];
        case "share":
        return "BPIManager"
      }
    }
    const songs:navBars[] = [
      {
        to:"/lists",
        id:"GlobalNav.FavoriteSongs",
        icon:<BookmarkIcon />
      },
      {
        to:"/songs",
        id:"GlobalNav.SongList",
        icon:<LibraryMusicIcon />
      },
      {
        to:"/notPlayed",
        id:"GlobalNav.unregisteredSongs",
        icon:<BorderColorIcon />
      },
    ];
    const myStat:navBars[] = [
      {
        to:"/compare",
        id:"GlobalNav.compare",
        icon:<FilterNoneIcon />
      },
      {
        to:"/stats",
        id:"GlobalNav.Statistics",
        icon:<TrendingUpIcon />
      },
      {
        to:"/AAATable",
        id:"GlobalNav.AAATable",
        icon:<WbIncandescentIcon />
      }
    ]
    const social:navBars[] = [
      {
        to:"/rivals",
        id:"GlobalNav.Rivals",
        icon:<PeopleIcon />
      },
      {
        to:"/rivalCompare",
        id:"GlobalNav.RivalCompare",
        icon:<ThumbsUpDownIcon />
      },
      {
        to:"/notes",
        id:"GlobalNav.Notes",
        icon:<SpeakerNotesIcon />
      },
      {
        to:"/ranking/",
        id:"GlobalNav.Weekly",
        icon:<EventNoteIcon />
      }
    ]
    const navBarTop:navBars[] = [
      {
        to:"/camera",
        id:"GlobalNav.Camera",
        icon:<CameraAltIcon/>
      },
      {
        to:"/data",
        id:"GlobalNav.Data",
        icon:<SaveAltIcon />
      },
    ]
    const navBarBottom:navBars[] = [
      {
        to:"/history",
        id:"GlobalNav.History",
        icon:<HistoryIcon />
      },
      {
        to:"/settings",
        id:"GlobalNav.Settings",
        icon:<SettingsIcon />
      },
      {
        to:"https://docs2.poyashi.me",
        id:"GlobalNav.Help",
        icon:<HelpIcon />
      }
    ]
    const { classes,history } = this.props;
    const drawer = (isPerment:boolean)=>(
      <React.Fragment>
        <div style={{margin:"8px 0",padding:"0 8px"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <Logo onClick={()=>{history.push("/");if(!isPerment){this.toggleNav()}}} style={{width:"44px",height:"44px"}}/>
          </div>
        </div>
        <Divider />
        {navBarTop.map(item=>(
          <ListItem key={item.id} onClick={()=>{history.push(item.to);if(!isPerment){this.toggleNav()}}} button>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={<FormattedMessage id={item.id}/>} />
          </ListItem>
        ))}
        <InnerList child={songs} handleClick={this.handleClickSongs} classes={classes} history={history} toggleNav={this.toggleNav} isPerment={isPerment}
          parent={{id:"GlobalNav.Parent.Songs",icon:<QueueMusicIcon />}} isOpen={isOpenSongs}/>
        <InnerList child={myStat} handleClick={this.handleClickStats} classes={classes} history={history} toggleNav={this.toggleNav} isPerment={isPerment}
          parent={{id:"GlobalNav.Parent.Stats",icon:<SportsEsportsIcon />}} isOpen={isOpenMyStat}/>
        <InnerList child={social} handleClick={this.handleClickSocial} classes={classes} history={history} toggleNav={this.toggleNav} isPerment={isPerment}
          parent={{id:"GlobalNav.Parent.Social",icon:<LanguageIcon />}} isOpen={isOpenSocial}/>
        <Divider />
        {navBarBottom.map(item=>(
          <ListItem key={item.id} onClick={()=>{
            if(item.to.indexOf("https") > -1){
              window.open(item.to);
              return;
            }
            history.push(item.to);if(!isPerment){this.toggleNav()}}
          } button>
            <ListItemIcon>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={<FormattedMessage id={item.id}/>} />
          </ListItem>
        ))}
        <Divider />
        <Typography align="center" variant="caption" style={{margin:"8px 0",width:"100%",display:"block",paddingBottom:"15px"}}>
          {config.versionString}&nbsp;
          {config.lastUpdate}<br/>
          <RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink><br/>
          <RefLink color="secondary" href="https://forms.gle/yVCa8sP2ndEQNaxg8">アンケートにご協力下さい </RefLink>
        </Typography>
      </React.Fragment>
    );

    return (
      <div className={classes.root}>
        <AppBar className={window.location.href.split('/').pop() === "" ? "appBarIndex " + classes.appBar : classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              className={classes.menuButton}
              onClick={()=>{
                  if(!this.props.global.state.cannotMove){
                    return this.toggleNav();
                  }else{
                    return this.toggleErrorSnack();
                  }
                  }}
              size="large">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" style={{flexGrow:1}}>
              {(page.length === 2 || page[1] === "lists" || page[1] === "notes" || page[1] === "songs" || page[1] === "sync" || page[1] === "ranking" || page[1] === "history") && <FormattedMessage id={currentPage()}/>}
              {(page.length > 2 && page[1] !== "lists" && page[1] !== "notes" && page[1] !== "songs" && page[1] !== "sync" && page[1] !== "ranking" && page[1] !== "history") && currentPage()}
            </Typography>
            {user && (
              <IconButton
                onClick={(_e)=>{history.push("/sync/settings");}}
                color="inherit"
                size="large">
                <img src={user.photoURL ? user.photoURL.replace("_normal","") : "noimage"} style={{width:"32px",height:"32px",borderRadius:"100%"}}
                  alt={user.displayName || "Private-mode User"}
                  onError={(e)=>(e.target as HTMLImageElement).src = getAltTwitterIcon(user) || alternativeImg(user.displayName)}/>
              </IconButton>
            )}
            {!user && (
              <Chip
                avatar={(
                  <Avatar style={{width:"32px",height:"32px"}}>
                    <LockOpenIcon/>
                  </Avatar>
                )}
                onClick={()=>history.push("/sync/settings")}
                label={"ログイン"}
                clickable
                color="primary"
              />
            )}
          </Toolbar>
        </AppBar>
        <nav className={classes.drawer}>
          <Hidden smUp implementation="css">
            <Drawer open={isOpen} onClose={this.toggleNav}
              classes={{
                paper: classes.drawerPaper,
            }}>
            {drawer(false)}
            </Drawer>
          </Hidden>
          <Hidden smDown implementation="css">
            <Drawer
              classes={{
                paper: classes.drawerPaper,
              }}
              variant="permanent"
              open
            >
              {drawer(true)}
            </Drawer>
          </Hidden>
        </nav>
        <main className={classes.content} style={{width:"100%",marginBottom:"15px"}}>
          {this.props.children}
        </main>
        <div style={{position:"fixed",bottom:"0",zIndex:1000,textAlign:"center",padding:"5px 0",background:"rgba(0,0,0,.8)",backdropFilter:"blur(4px)",color:"#fff",width:"100%",fontSize:"9px"}}>
          {user && user.displayName}&nbsp;
          {(user && user.twitter) && <span>(@{user.twitter})</span>}&nbsp;
          def:v{_currentVersion()}&nbsp;
          {_traditionalMode() === 1 && <span>LEGACY</span>}&nbsp;
        </div>
        <ShowSnackBar message={"実行中の処理があるため続行できません"} variant="warning"
            handleClose={this.toggleErrorSnack} open={this.state.errorSnack} autoHideDuration={3000}/>
      </div>
    );
  }

}

export default withRouter(withStyles(styles, { withTheme: true })(GlobalHeader));

class InnerList extends React.Component<{
  parent:{
    id:string,
    icon:JSX.Element
  },
  child:navBars[],
  handleClick:()=>void,
  isOpen:boolean,
  history:any,
  classes:any,
  toggleNav:()=>void,
  isPerment:boolean,
},{}>{

  render(){
    const {child,handleClick,isOpen,history,classes,parent,toggleNav,isPerment} = this.props;
    return (
      <List style={{width:"230px"}} disablePadding key={parent.id}>
        <ListItem button onClick={handleClick}>
          <ListItemIcon>
            {parent.icon}
          </ListItemIcon>
          <ListItemText primary={<FormattedMessage id={parent.id}/>} />
          {isOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {child.map(item=>(
              <ListItem onClick={()=>{history.push(item.to);if(!isPerment){toggleNav()}}} key={item.id} button className={classes.nested}>
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={<FormattedMessage id={item.id}/>} />
              </ListItem>
            ))}
          </List>
        </Collapse>
      </List>
    );
  }
}
