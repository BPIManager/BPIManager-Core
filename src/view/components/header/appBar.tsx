import React from "react";
import { Link } from "react-router-dom";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import useScrollTrigger from "@material-ui/core/useScrollTrigger";

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

import { FormattedMessage,injectIntl } from "react-intl";

import Slide from "@material-ui/core/Slide";

class GlobalHeader extends React.Component<{intl:any},{isOpen:boolean}>{

  constructor(props:{intl:any}){
    super(props);
    this.state = {
      isOpen: false,
    }
  }

  toggleNav = ()=> this.setState({isOpen:!this.state.isOpen});

  render(){
    const {isOpen} = this.state;
    const { formatMessage } = this.props.intl;

    return (
      <div>
        <HideOnScroll>
          <AppBar position="static">
            <Toolbar>
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={this.toggleNav}>
                <MenuIcon />
              </IconButton>
              <Typography variant="h6">
                <FormattedMessage id="Top.Title"/>
              </Typography>
            </Toolbar>
          </AppBar>
        </HideOnScroll>
        <Drawer open={isOpen} onClose={this.toggleNav}>
          <List style={{width:"230px"}}>
            <Link to="/" className="forceTextColorBlack" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><HomeIcon /></ListItemIcon>
                <ListItemText primary={formatMessage({id:"GlobalNav.Home"})} />
              </ListItem>
            </Link>
            <Link to="/data" className="forceTextColorBlack" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><StorageIcon /></ListItemIcon>
                <ListItemText primary={formatMessage({id:"GlobalNav.Data"})} />
              </ListItem>
            </Link>
            <Link to="/songs" className="forceTextColorBlack" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><LibraryMusicIcon /></ListItemIcon>
                <ListItemText primary={formatMessage({id:"GlobalNav.SongList"})} />
              </ListItem>
            </Link>
            <Link to="/stats" className="forceTextColorBlack" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><TrendingUpIcon /></ListItemIcon>
                <ListItemText primary={formatMessage({id:"GlobalNav.Statistics"})} />
              </ListItem>
            </Link>
            <Link to="/settings" className="forceTextColorBlack" onClick={this.toggleNav}>
              <ListItem button>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary={formatMessage({id:"GlobalNav.Settings"})} />
              </ListItem>
            </Link>
          </List>
          <Divider />
        </Drawer>
      </div>
    );
  }

}

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
  children: JSX.Element,
  window?: ()=>Node | Window | undefined,
};

export default injectIntl(GlobalHeader);
