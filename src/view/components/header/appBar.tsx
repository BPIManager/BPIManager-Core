import React from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Hidden from '@material-ui/core/Hidden';
import BallotIcon from '@material-ui/icons/Ballot';
import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import {Link as RefLink} from '@material-ui/core/';
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import SettingsIcon from "@material-ui/icons/Settings";
import SaveAltIcon from "@material-ui/icons/SaveAlt";
import BorderColorIcon from '@material-ui/icons/BorderColor';
import StarIcon from '@material-ui/icons/Star';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import HelpIcon from '@material-ui/icons/Help';
import SwapVerticalCircleIcon from '@material-ui/icons/SwapVerticalCircle';
import { FormattedMessage } from "react-intl";
import PeopleIcon from '@material-ui/icons/People';
import Slide from "@material-ui/core/Slide";
import ShowSnackBar from "../snackBar";
import WbIncandescentIcon from '@material-ui/icons/WbIncandescent';
import { withStyles } from '@material-ui/core/styles';
import { config } from "../../../config";

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
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing.unit * 7,
  },
});


function HideOnScroll(props:HideOnScrollProps) {
  const { children, window } = props;
  const trigger = useScrollTrigger({ target: window ? window() : undefined });

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

interface HideOnScrollProps {
  children?: React.ReactElement,
  window?: () => Window,
};

const RLink = React.forwardRef<HTMLAnchorElement, RouterLinkProps>((props, ref) => (
  <RouterLink innerRef={ref} {...props} />
));

class GlobalHeader extends React.Component<{global:any,classes:any,theme:any,children:any} & HideOnScrollProps,{isOpen:boolean,errorSnack:boolean}>{

  constructor(props:{global:any,classes:any,theme:any,children:any} & HideOnScrollProps){
    super(props);
    this.state = {
      isOpen: false,
      errorSnack:false
    }
  }

  toggleNav = ()=> this.setState({isOpen:!this.state.isOpen});
  toggleErrorSnack = ()=> this.setState({errorSnack:!this.state.errorSnack});

  render(){
    const {isOpen} = this.state;
    const navBar = [
      {
        to:"/data",
        id:"GlobalNav.Data",
        icon:<SaveAltIcon />
      },
      {
        to:"/favorite",
        id:"GlobalNav.FavoriteSongs",
        icon:<StarIcon />
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
        to:"/rivals",
        id:"GlobalNav.Rivals",
        icon:<PeopleIcon />
      },
      {
        to:"/sync",
        id:"GlobalNav.Sync",
        icon:<SwapVerticalCircleIcon />
      },
      {
        to:"/AAATable",
        id:"GlobalNav.AAATable",
        icon:<WbIncandescentIcon />
      },
      {
        to:"/tools",
        id:"GlobalNav.Tools",
        icon:<BallotIcon />
      },
      {
        to:"/settings",
        id:"GlobalNav.Settings",
        icon:<SettingsIcon />
      },
      {
        to:"/help",
        id:"GlobalNav.Help",
        icon:<HelpIcon />
      }
    ]
    const { classes } = this.props;
    const drawer = (isPerment:boolean)=>(
      <div>
        <List style={{width:"230px"}}>
          {navBar.map(item=>{
            return (
              <RefLink key={item.id} component={RLink} to={item.to} underline="none" color="textPrimary" onClick={!isPerment ? this.toggleNav : ()=>null}>
                <ListItem button>
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={<FormattedMessage id={item.id}/>} />
                </ListItem>
              </RefLink>
            )
          })}
        </List>
        <Divider />
        <Typography align="center" variant="caption" style={{margin:"8px 0",width:"100%",display:"block"}}>
          {config.versionString}<br/>
          {config.lastUpdate}<br/>
          <RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink><br/>
          <RefLink color="secondary" href="https://forms.gle/yVCa8sP2ndEQNaxg8">アンケートにご協力下さい </RefLink><br/>
          <RefLink underline="none" color="textPrimary" to="/" component={RLink} onClick={!isPerment ? this.toggleNav : ()=>null}>
            Home
          </RefLink>
        </Typography>
      </div>
    );
    return (
      <div className={classes.root}>
        <HideOnScroll {...this.props}>
          <AppBar className={window.location.href.split('/').pop() === "" ? "appBarIndex " + classes.appBar : classes.appBar}>
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu"
                className={classes.menuButton} onClick={()=>{
                if(!this.props.global.state.cannotMove){
                  return this.toggleNav();
                }else{
                  return this.toggleErrorSnack();
                }
              }}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6">
                <FormattedMessage id="Top.Title"/>
              </Typography>
            </Toolbar>
          </AppBar>
        </HideOnScroll>
        <nav className={classes.drawer}>
          <Hidden smUp implementation="css">
            <Drawer open={isOpen} onClose={this.toggleNav}
              classes={{
                paper: classes.drawerPaper,
            }}>
            {drawer(false)}
            </Drawer>
          </Hidden>
          <Hidden xsDown implementation="css">
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
        <main className={classes.content}>
          {this.props.children}
        </main>
        <ShowSnackBar message={"実行中の処理があるため続行できません"} variant="warning"
            handleClose={this.toggleErrorSnack} open={this.state.errorSnack} autoHideDuration={3000}/>
      </div>
    );
  }

}

export default withStyles(styles, { withTheme: true })(GlobalHeader);
