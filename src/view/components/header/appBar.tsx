import React from "react";
import { Link as RouterLink, LinkProps as RouterLinkProps } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";
import Link from '@material-ui/core/Link';

import Drawer from "@material-ui/core/Drawer";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import HomeIcon from "@material-ui/icons/Home";
import LibraryMusicIcon from "@material-ui/icons/LibraryMusic";
import TrendingUpIcon from "@material-ui/icons/TrendingUp";
import SettingsIcon from "@material-ui/icons/Settings";
import StorageIcon from "@material-ui/icons/Storage";
import BorderColorIcon from '@material-ui/icons/BorderColor';
import StarIcon from '@material-ui/icons/Star';
import FilterNoneIcon from '@material-ui/icons/FilterNone';
import HelpIcon from '@material-ui/icons/Help';

import { FormattedMessage } from "react-intl";

import Slide from "@material-ui/core/Slide";
import ShowSnackBar from "../snackBar";

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

class GlobalHeader extends React.Component<{global:any} & HideOnScrollProps,{isOpen:boolean,errorSnack:boolean}>{

  constructor(props:{global:any} & HideOnScrollProps){
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

    return (
      <React.Fragment>
        <HideOnScroll {...this.props}>
          <AppBar>
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={()=>{
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
        <Toolbar />
        <Drawer open={isOpen} onClose={this.toggleNav}>
          <List style={{width:"230px"}}>
            <Link component={RLink} to="/" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.Home"/>} />
              </ListItem>
            </Link>
            <Link component={RLink} to="/data" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><StorageIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.Data"/>} />
              </ListItem>
            </Link>
            <Link component={RLink} to="/favorite" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><StarIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.FavoriteSongs"/>} />
              </ListItem>
            </Link>
            <Link component={RLink} to="/songs" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><LibraryMusicIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.SongList"/>} />
              </ListItem>
            </Link>
            <Link component={RLink} to="/notPlayed" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><BorderColorIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.unregisteredSongs"/>} />
              </ListItem>
            </Link>
            <Link component={RLink} to="/compare" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><FilterNoneIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.compare"/>} />
              </ListItem>
            </Link>
            <Link component={RLink} to="/stats" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.Statistics"/>} />
              </ListItem>
            </Link>
            <Link component={RLink} to="/settings" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.Settings"/>} />
              </ListItem>
            </Link>
            <Link component={RLink} to="/help" underline="none" color="textPrimary" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><HelpIcon /></ListItemIcon>
                <ListItemText primary={<FormattedMessage id="GlobalNav.Help"/>} />
              </ListItem>
            </Link>
          </List>
          <Divider />
        </Drawer>
        <ShowSnackBar message={"実行中の処理があるため続行できません"} variant="warning"
            handleClose={this.toggleErrorSnack} open={this.state.errorSnack} autoHideDuration={3000}/>
      </React.Fragment>
    );
  }

}

export default GlobalHeader;
