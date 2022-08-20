import React, { useState, useEffect } from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Hidden from "@mui/material/Hidden";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Link as RefLink, Collapse, Avatar, Chip } from "@mui/material/";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import BorderColorIcon from "@mui/icons-material/BorderColor";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import HelpIcon from "@mui/icons-material/Help";
import SettingsIcon from "@mui/icons-material/Settings";
import { FormattedMessage } from "react-intl";
import PeopleIcon from "@mui/icons-material/People";
import ShowSnackBar from "../snackBar";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import withStyles from "@mui/styles/withStyles";
import { config } from "@/config";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import QueueMusicIcon from "@mui/icons-material/QueueMusic";
import LanguageIcon from "@mui/icons-material/Language";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import ThumbsUpDownIcon from "@mui/icons-material/ThumbsUpDown";
import SpeakerNotesIcon from "@mui/icons-material/SpeakerNotes";
import { getAltTwitterIcon } from "@/components/rivals";
import fbActions from "@/components/firebase/actions";
import { Logo } from "@/assets/aix2f-q5h7x";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import EventNoteIcon from "@mui/icons-material/EventNote";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import HistoryIcon from "@mui/icons-material/History";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import ArenaRankCheck from "../arenaRankCheck";
import GitHubIcon from "@mui/icons-material/GitHub";
import Button from "@mui/material/Button";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import { getMessaging, onMessage } from "firebase/messaging";
import fb from "@/components/firebase";
import ArenaMatchWatcher from "@/view/components/arenaMatch/watchDog";
import { UserIcon } from "../common/icon";
import SyncStatus from "./syncStatus";
import MobileBottomNav from "./mobileNav";

export interface navBars {
  to: string;
  id: string;
  icon: JSX.Element;
}

const drawerWidth = 260;
const styles = (theme: any) => ({
  root: {
    display: "flex",
  },
  menuButton: {
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  drawer: {
    [theme.breakpoints.up("sm")]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  appBar: {
    zIndex: 5,
    backdropFilter: "blur(3px)",
    marginLeft: drawerWidth,
    [theme.breakpoints.up("sm")]: {
      width: `calc(100% - ${drawerWidth}px)`,
    },
  },
  drawerPaper: {
    width: drawerWidth,
    overflowX: "hidden" as "hidden",
  },
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing(7),
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
});

const songs: navBars[] = [
  {
    to: "/lists",
    id: "GlobalNav.FavoriteSongs",
    icon: <BookmarkIcon />,
  },
  {
    to: "/songs",
    id: "GlobalNav.SongList",
    icon: <LibraryMusicIcon />,
  },
  {
    to: "/notPlayed",
    id: "GlobalNav.unregisteredSongs",
    icon: <BorderColorIcon />,
  },
];
const myStat: navBars[] = [
  {
    to: "/compare",
    id: "GlobalNav.compare",
    icon: <FilterNoneIcon />,
  },
  {
    to: "/stats",
    id: "GlobalNav.Statistics",
    icon: <TrendingUpIcon />,
  },
  {
    to: "/AAATable",
    id: "GlobalNav.AAATable",
    icon: <WbIncandescentIcon />,
  },
];
const social: navBars[] = [
  {
    to: "/rivals",
    id: "GlobalNav.Rivals",
    icon: <PeopleIcon />,
  },
  {
    to: "/rivalCompare",
    id: "GlobalNav.RivalCompare",
    icon: <ThumbsUpDownIcon />,
  },
  {
    to: "/notes",
    id: "GlobalNav.Notes",
    icon: <SpeakerNotesIcon />,
  },
  {
    to: "https://rank.poyashi.me",
    id: "GlobalNav.BPIMRanks",
    icon: <StarHalfIcon />,
  },
  {
    to: "/arena",
    id: "GlobalNav.ArenaMatch",
    icon: <EventNoteIcon />,
  },
];
const navBarTop: navBars[] = [
  {
    to: "/camera",
    id: "GlobalNav.Camera",
    icon: <CameraAltIcon />,
  },
  {
    to: "/data",
    id: "GlobalNav.Data",
    icon: <SaveAltIcon />,
  },
];
const navBarBottom: navBars[] = [
  {
    to: "/history",
    id: "GlobalNav.History",
    icon: <HistoryIcon />,
  },
  {
    to: "/settings",
    id: "GlobalNav.Settings",
    icon: <SettingsIcon />,
  },
  {
    to: "https://docs2.poyashi.me",
    id: "GlobalNav.Help",
    icon: <HelpIcon />,
  },
];

interface HideOnScrollProps {
  children?: React.ReactElement;
  window?: () => Window;
}

const GlobalHeader: React.FC<{ global: any; classes: any; theme: any; children: any } & HideOnScrollProps & RouteComponentProps> = (props) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isOpenSongs, setIsOpenSongs] = useState<boolean>(true);
  const [isOpenMyStat, setIsOpenMyStat] = useState<boolean>(false);
  const [isOpenSocial, setIsOpenSocial] = useState<boolean>(false);
  const [errorSnack, setErrorSnack] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const page = props.location.pathname.split("/");
  const currentPage = () => {
    switch (page[1]) {
      default:
        return "Top.Title";
      case "data":
        return "GlobalNav.Data";
      case "lists":
        return "GlobalNav.SongList";
      case "songs":
        return "GlobalNav.SongList";
      case "notPlayed":
        return "GlobalNav.SongList";
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
      case "arena":
        return "GlobalNav.ArenaMatch";
      case "u":
        return page[2];
      case "share":
        return "BPIManager";
    }
  };
  const { classes, history } = props;

  const getUserData = async () => {
    return new fbActions().auth().onAuthStateChanged(async (user: any) => {
      if (!user) {
        return setUser(null);
      }
      const u = await new fbActions().setDocName(user.uid).getSelfUserData();
      if (u && u.exists()) {
        localStorage.setItem("social", JSON.stringify(u.data()));
      } else {
        setUser({
          photoURL: user.photoURL,
          displayName: "",
        });
        return;
      }
      return setUser(u.data());
    });
  };

  useEffect(() => {
    getUserData();
    const messaging = getMessaging(fb);
    onMessage(messaging, (payload) => {
      if (payload.data && !window.location.href.match(payload.data?.matchId)) {
        console.log("Message received. ", payload);
      }
    });
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  });

  const toggleNav = () => setIsOpen(!isOpen);

  const drawer = (isPerment: boolean) => (
    <React.Fragment>
      <div style={{ margin: "8px 0", padding: "0 8px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            onClick={() => {
              history.push("/");
              if (!isPerment) {
                toggleNav();
              }
            }}
            style={{ width: "44px", height: "44px" }}
          >
            <Logo />
          </div>
        </div>
      </div>
      <Divider />
      {navBarTop.map((item) => (
        <ListItem
          key={item.id}
          onClick={() => {
            history.push(item.to);
            if (!isPerment) {
              toggleNav();
            }
          }}
          button
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={<FormattedMessage id={item.id} />} />
        </ListItem>
      ))}
      <InnerList
        child={songs}
        handleClick={() => setIsOpenSongs(!isOpenSongs)}
        classes={classes}
        history={history}
        toggleNav={toggleNav}
        isPerment={isPerment}
        parent={{ id: "GlobalNav.Parent.Songs", icon: <QueueMusicIcon /> }}
        isOpen={isOpenSongs}
      />
      <InnerList
        child={myStat}
        handleClick={() => setIsOpenMyStat(!isOpenMyStat)}
        classes={classes}
        history={history}
        toggleNav={toggleNav}
        isPerment={isPerment}
        parent={{ id: "GlobalNav.Parent.Stats", icon: <SportsEsportsIcon /> }}
        isOpen={isOpenMyStat}
      />
      <InnerList
        child={social}
        handleClick={() => setIsOpenSocial(!isOpenSocial)}
        classes={classes}
        history={history}
        toggleNav={toggleNav}
        isPerment={isPerment}
        parent={{ id: "GlobalNav.Parent.Social", icon: <LanguageIcon /> }}
        isOpen={isOpenSocial}
      />
      <Divider />
      {navBarBottom.map((item) => (
        <ListItem
          key={item.id}
          onClick={() => {
            if (item.to.indexOf("https") > -1) {
              window.open(item.to);
              return;
            }
            history.push(item.to);
            if (!isPerment) {
              toggleNav();
            }
          }}
          button
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={<FormattedMessage id={item.id} />} />
        </ListItem>
      ))}
      <Divider />
      <Typography
        align="center"
        variant="caption"
        style={{
          margin: "8px 0",
          width: "100%",
          display: "block",
          paddingBottom: "15px",
        }}
      >
        <Version />
        &nbsp;
        {config.lastUpdate}
        <br />
        <RefLink color="secondary" href="https://twitter.com/BPIManager">
          @BPIManagerから最新情報を受け取る
        </RefLink>
        <div style={{ marginTop: 10 }} />
        <Button color="secondary" size="small" target="_blank" href="https://github.com/BPIManager" variant="outlined" startIcon={<GitHubIcon />}>
          Available on GitHub
        </Button>
      </Typography>
    </React.Fragment>
  );

  return (
    <div className={classes.root}>
      <ArenaRankCheck />
      <AppBar position="absolute" className={window.location.href.split("/").pop() === "" ? "appBarIndex " + classes.appBar + " apbar" : classes.appBar + " apbar"}>
        <Toolbar>
          <Typography variant="h6" style={{ flexGrow: 1 }}>
            {(page.length === 2 || page[1] === "lists" || page[1] === "notes" || page[1] === "songs" || page[1] === "sync" || page[1] === "arena" || page[1] === "history" || page[1] === "data") && <FormattedMessage id={currentPage()} />}
            {page.length > 2 && page[1] !== "lists" && page[1] !== "notes" && page[1] !== "songs" && page[1] !== "sync" && page[1] !== "arena" && page[1] !== "history" && page[1] !== "data" && currentPage()}
          </Typography>
          {user && (
            <IconButton
              onClick={() => {
                history.push("/sync/settings");
              }}
              color="inherit"
              size="large"
            >
              <UserIcon size={32} disableZoom defaultURL={user.photoURL ? user.photoURL.replace("_normal", "") : ""} text={user.displayName || "Private-mode User"} altURL={getAltTwitterIcon(user)} />
            </IconButton>
          )}
          {!user && (
            <Chip
              avatar={
                <Avatar style={{ width: "32px", height: "32px" }}>
                  <LockOpenIcon />
                </Avatar>
              }
              onClick={() => history.push("/sync/settings")}
              label={<FormattedMessage id={"SignIn"} />}
              clickable
              color="primary"
            />
          )}
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer}>
        <Hidden smUp implementation="css">
          <SwipeableDrawer
            open={isOpen}
            onClose={toggleNav}
            onOpen={toggleNav}
            anchor="right"
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            {drawer(false)}
          </SwipeableDrawer>
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
      <main className={classes.content + (window.location.href.match("arena/") ? " arenaDetail" : "")} style={{ width: "100%", marginBottom: "65px" }}>
        {props.children}
      </main>
      <Hidden smUp implementation="css">
        <MobileBottomNav history={history} />
      </Hidden>
      <SyncStatus />
      <ArenaMatchWatcher />
      <ShowSnackBar message={"実行中の処理があるため続行できません"} variant="warning" handleClose={() => setErrorSnack(!errorSnack)} open={errorSnack} autoHideDuration={3000} />
    </div>
  );
};

export default withRouter(withStyles(styles, { withTheme: true })(GlobalHeader));

const InnerList: React.FC<{
  parent: {
    id: string;
    icon: JSX.Element;
  };
  child: navBars[];
  handleClick: () => void;
  isOpen: boolean;
  history: any;
  classes: any;
  toggleNav: () => void;
  isPerment: boolean;
}> = (props) => {
  const { child, handleClick, isOpen, history, classes, parent, toggleNav, isPerment } = props;
  return (
    <List style={{ width: Number(drawerWidth - 1) + "px" }} disablePadding key={parent.id}>
      <ListItem button onClick={handleClick}>
        <ListItemIcon>{parent.icon}</ListItemIcon>
        <ListItemText primary={<FormattedMessage id={parent.id} />} />
        {isOpen ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {child.map((item) => (
            <ListItem
              onClick={() => {
                if (item.to.indexOf("https") > -1) {
                  window.open(item.to);
                  return;
                }

                history.push(item.to);
                if (!isPerment) {
                  toggleNav();
                }
              }}
              key={item.id}
              button
              className={classes.nested}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={<FormattedMessage id={item.id} />} />
            </ListItem>
          ))}
        </List>
      </Collapse>
    </List>
  );
};

const Version: React.FC<{}> = () => {
  const [text, setText] = useState<string>("");

  const loadVersion = async () => {
    fetch("/assets/version.txt")
      .then((response) => response.text())
      .then((textContent) => {
        setText(textContent.replace(/\s/g, ""));
      });
  };

  useEffect(() => {
    loadVersion();
  }, []);

  if (text)
    return (
      <>
        v-{text}-d{config.versionNumber}
      </>
    );
  return null;
};
