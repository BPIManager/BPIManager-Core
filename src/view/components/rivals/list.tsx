import React from "react";

import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import ListItemText from "@mui/material/ListItemText";
import ShowSnackBar from "../snackBar";
import { rivalListsDB } from "@/components/indexedDB";
import { DBRivalStoreData } from "@/types/data";
import { updateRivalScore, getAltTwitterIcon } from "@/components/rivals";
import Backdrop from "@mui/material/Backdrop";
import timeFormatter, { timeCompare } from "@/components/common/timeFormatter";
import Loader from "@/view/components/common/loader";
import { avatarBgColor, avatarFontColor } from "@/components/common";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListSubheader from "@mui/material/ListSubheader";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import SyncIcon from "@mui/icons-material/Sync";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SettingsIcon from "@mui/icons-material/Settings";
import { RouteComponentProps, withRouter } from "react-router-dom";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import SearchIcon from "@mui/icons-material/Search";
import AdsCard from "@/components/ad";
import Link from "@mui/material/Link";
import AlertTitle from "@mui/material/AlertTitle";
import { UserIcon } from "../common/icon";
interface S {
  isAddOpen: boolean;
  showSnackBar: boolean;
  isLoading: boolean;
  rivals: DBRivalStoreData[];
  message: string;
  bulkUpdate: boolean;
  openMenu: boolean;
}

interface P {
  showEachRival: (input: DBRivalStoreData) => void;
  changeTab: (_ev: any, input: number) => void;
}

const updateMinuteError = "?????????????????????1????????????1???????????????????????????????????????";

class RivalLists extends React.Component<P & RouteComponentProps, S> {
  private rivalListsDB = new rivalListsDB();

  constructor(props: P & RouteComponentProps) {
    super(props);
    this.state = {
      isAddOpen: false,
      bulkUpdate: false,
      showSnackBar: false,
      isLoading: true,
      rivals: [],
      message: "",
      openMenu: false,
    };
  }

  async componentDidMount() {
    this.loadRivals();
  }

  toggleMenu = (willOpen: boolean = false) => {
    this.setState({ openMenu: willOpen });
  };

  loadRivals = async () => {
    this.setState({ isLoading: true });
    return this.setState({
      isLoading: false,
      bulkUpdate: false,
      rivals: await this.rivalListsDB.getAll(),
    });
  };

  update = async () => {
    this.toggleMenu(false);
    const { rivals } = this.state;
    let updated = 0;
    let lastUpdateTime = localStorage.getItem("lastBatchRivalUpdate") || "1970-01-01 00:00";
    const timeDiff = timeCompare(new Date(), lastUpdateTime);
    if (timeDiff < 60) {
      return this.toggleSnack(updateMinuteError);
    }
    this.setState({ bulkUpdate: true });
    for (let i = 0; i < rivals.length; ++i) {
      const t = await updateRivalScore(rivals[i]);
      if (t === "") updated++;
    }
    await this.loadRivals();
    localStorage.setItem("lastBatchRivalUpdate", timeFormatter(3));
    return this.toggleSnack(`${updated}?????????????????????`);
  };
  toggleSnack = (message: string = "?????????????????????????????????") => this.setState({ message: message, showSnackBar: !this.state.showSnackBar });

  render() {
    const { showSnackBar, rivals, isLoading, message, bulkUpdate, openMenu } = this.state;
    if (isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div style={{ margin: "10px 6px 0" }}>
            <SwipeableDrawer anchor="bottom" open={openMenu} onClose={() => this.toggleMenu(false)} onOpen={() => this.toggleMenu(true)}>
              <List subheader={<ListSubheader component="div">??????????????????</ListSubheader>}>
                <ListItem button onClick={() => this.props.history.push("/sync/settings?init=1")}>
                  <ListItemIcon>
                    <CloudUploadIcon />
                  </ListItemIcon>
                  <ListItemText primary={"??????????????????????????????"} secondary={"????????????????????????????????????????????????????????????????????????"} />
                </ListItem>
                <ListItem button onClick={this.update}>
                  <ListItemIcon>
                    <SyncIcon />
                  </ListItemIcon>
                  <ListItemText primary={"????????????????????????????????????"} secondary={"????????????????????????????????????????????????????????????????????????????????????????????????????????????"} />
                </ListItem>
                <ListItem button onClick={() => this.props.history.push("/sync/settings?init=2")}>
                  <ListItemIcon>
                    <NotificationsActiveIcon />
                  </ListItemIcon>
                  <ListItemText primary={"????????????????????????"} secondary={"???????????????????????????????????????????????????????????????????????????"} />
                </ListItem>
              </List>
            </SwipeableDrawer>
          </div>
          <Backdrop open={bulkUpdate}>
            <Loader />
          </Backdrop>
        </div>
        <List
          subheader={
            <ListSubheader component="div" disableSticky>
              ??????????????????
              <IconButton edge="end" style={{ float: "right" }} aria-haspopup="true" onClick={() => this.toggleMenu(true)} size="large">
                <SettingsIcon />
              </IconButton>
            </ListSubheader>
          }
        >
          {rivals
            .sort((a, b) => timeCompare(b.updatedAt, a.updatedAt))
            .map((item, i) => (
              <div key={item.uid} onClick={() => this.props.showEachRival(item)}>
                <RivalComponent data={item} />
                {i !== rivals.length - 1 && <Divider variant="middle" component="li" />}
              </div>
            ))}
        </List>
        {rivals.length === 0 && (
          <Alert severity="warning">
            <AlertTitle>?????????????????????</AlertTitle>
            ????????????????????????????????????????????????????????????????????????????????????????????????????????????
            <br />
            ?????????
            <b>
              ???
              <Link color="secondary" onClick={() => this.props.changeTab(null, 1)}>
                ????????????????????????
              </Link>
              ?????????????????????????????????????????????
            </b>
            ????????????????????????
          </Alert>
        )}
        <List
          subheader={
            <ListSubheader component="div" disableSticky>
              ?????????????????????
            </ListSubheader>
          }
        >
          {[
            {
              name: "????????????????????????",
              func: () => this.props.changeTab(null, 1),
              desc: "?????????????????????????????????????????????",
              icon: <ThumbUpIcon />,
            },
            {
              name: "??????",
              func: () => this.props.changeTab(null, 3),
              desc: "???????????????????????????????????????????????????",
              icon: <SearchIcon />,
            },
          ].map((item, i) => {
            return (
              <ListItem key={i} button onClick={item.func}>
                <ListItemAvatar>
                  <Avatar
                    style={{
                      background: avatarBgColor,
                      color: avatarFontColor,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText primary={item.name} secondary={item.desc} />
                <ListItemSecondaryAction onClick={item.func}>
                  <IconButton edge="end" size="large">
                    <ArrowForwardIosIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            );
          })}
        </List>
        <AdsCard />
        <ShowSnackBar message={message} variant={message === updateMinuteError ? "warning" : "success"} handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000} />
      </React.Fragment>
    );
  }
}

interface CP {
  data: DBRivalStoreData;
}

class RivalComponent extends React.Component<CP, {}> {
  render() {
    const { data } = this.props;
    const text = (
      <span>
        {data.profile || <i>-</i>}
        <br />
        ????????????: {data.updatedAt}
      </span>
    );
    return (
      <ListItem button>
        <ListItemAvatar>
          <UserIcon _legacy disableZoom defaultURL={data.photoURL} text={data.rivalName} altURL={getAltTwitterIcon(data, true)} />
        </ListItemAvatar>
        <ListItemText primary={data.rivalName} secondary={text} />
      </ListItem>
    );
  }
}

export default withRouter(RivalLists);
