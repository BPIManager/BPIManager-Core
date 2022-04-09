import React from 'react';

import Button from '@mui/material/Button';
import { _currentStore, _isSingle } from '@/components/settings';
import { rivalListsDB } from '@/components/indexedDB';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import List from '@mui/material/List';
import fbActions from '@/components/firebase/actions';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import DeleteIcon from '@mui/icons-material/Delete';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import timeFormatter from '@/components/common/timeFormatter';
import { alternativeImg } from '@/components/common';
import Divider from '@mui/material/Divider';
import AddBoxIcon from '@mui/icons-material/AddBox';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ListSubheader from '@mui/material/ListSubheader';
import ButtonGroup from '@mui/material/ButtonGroup';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import Paper from '@mui/material/Paper';
import ShowSnackBar from '../snackBar';
import Loader from '@/view/components/common/loader';
import { getAltTwitterIcon } from '@/components/rivals';

interface P {
}

interface S {
  processing: boolean,
  errorMessage: string,
  syncData: {
    from: any,
    to: any,
    updatedAt: any,
    version: any
  }[],
  notUploaded: any[],
  onServer: boolean,
  onLocal: boolean,
  variant: "info" | "error" | "success" | "warning",
  message: string,
  showSnackBar: boolean,
  userData: any
}

class SyncRivalScreen extends React.Component<P, S> {
  refServer: React.RefObject<HTMLButtonElement>;
  refLocal: React.RefObject<HTMLButtonElement>;
  private rivalListsDB = new rivalListsDB();
  private fbActions = new fbActions();
  private fbStores: fbActions = new fbActions();

  constructor(props: P) {
    super(props);
    this.state = {
      processing: true,
      errorMessage: "",
      syncData: [],
      notUploaded: [],
      onServer: false,
      onLocal: false,
      message: "",
      variant: "info",
      showSnackBar: false,
      userData: null,
    }
    this.refServer = React.createRef();
    this.refLocal = React.createRef();
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
  }

  async componentDidMount() {
    this.refreshData();
  }

  loadList = async (): Promise<void> => {
    this.setState({ processing: true });
    return;
  }

  handleToggle = (i: number) => {
    if (i === 0) {
      this.setState({ onServer: !this.state.onServer });
    } else {
      this.setState({ onLocal: !this.state.onLocal });
    }
  }

  uid = () => {
    return this.state.userData ? this.state.userData.uid : ""
  }

  uploadExec = async (willAdd = true) => {
    if (this.state.processing) { return; }
    await this.fbActions.syncUploadRival(await this.rivalListsDB.getAll(), willAdd, this.uid());
    this.refreshData();
  }

  uploadOne = async (uid: string) => {
    if (this.state.processing) { return; }
    await this.fbActions.syncUploadOne(uid, this.uid());
    this.refreshData();
  }

  deleteOne = async (uid: string) => {
    if (this.state.processing) { return; }
    await this.fbActions.syncDeleteOne(uid);
    this.refreshData();
  }

  refreshData = () => {
    this.setState({ processing: true });
    return this.fbActions.auth().onAuthStateChanged(async (user: any) => {
      if (!user) return;
      this.fbActions.setDocName(user.uid);
      const p = user.uid ? (await this.fbActions.syncLoadRival(true)) as any : [];
      const uidList = p.reduce((groups: string[], item: any) => {
        if (!groups) groups = [];
        if (item.to) {
          groups.push(item.to.uid);
        }
        return groups;
      }, []);
      this.setState({
        processing: false,
        userData: this.state.userData || (await new fbActions().v2SetUserCollection().setDocName(user.uid).load()),
        syncData: p,
        notUploaded: (await this.rivalListsDB.getAll()).filter(item => uidList.indexOf(item.uid) === -1)
      })
    });
  }

  handleMenuItemClickOnServer = (i: number) => {
    switch (i) {
      case 0:
        return this.uploadExec();
      case 1:
        return this.uploadExec(false);
    }
  }

  addUser = async (): Promise<void> => {
    const { syncData } = this.state;
    let count = 0;
    this.setState({ processing: true });
    for (let i = 0; i < syncData.length; ++i) {
      const data = await this.fbStores.setDocName(syncData[i].to.uid).load();
      if (data) {
        const putResult = await this.rivalListsDB.addUser({
          rivalName: syncData[i].to.displayName,
          uid: syncData[i].to.uid,
          photoURL: syncData[i].to.photoURL,
          profile: syncData[i].to.profile,
          updatedAt: syncData[i].to.timeStamp,
          lastUpdatedAt: syncData[i].to.timeStamp,
          isSingle: _isSingle(),
          storedAt: _currentStore(),
        }, data.scores);
        if (putResult) {
          count++;
        }
      }
    }
    return this.toggleSnack(count + "件ライバルを追加しました", "success");
  }

  toggleSnack = (message: string = "ライバルを追加しました", variant: "info" | "error" | "success" | "warning" = "info") => {
    return this.setState({ message: message, showSnackBar: !this.state.showSnackBar, processing: false, variant: variant });
  }

  render() {
    const { processing, errorMessage, syncData, notUploaded, onServer, onLocal, message, variant, showSnackBar } = this.state;
    return (
      <React.Fragment>
        <Paper style={{ padding: "15px" }}>
          <ButtonGroup fullWidth variant="contained" color="secondary">
            <Button ref={this.refServer} disabled={processing} onClick={() => this.handleToggle(0)} endIcon={<ArrowDropDownIcon />}>アカウント</Button>
            <Button ref={this.refLocal} disabled={processing} onClick={() => this.handleToggle(1)} endIcon={<ArrowDropDownIcon />}>この端末</Button>
          </ButtonGroup>
          <Menu
            anchorEl={this.refServer.current}
            open={onServer}
            onClick={() => this.handleToggle(0)}
          >
            <MenuItem onClick={() => this.uploadExec()}>この端末上のデータに置き換え</MenuItem>
            <MenuItem onClick={() => this.uploadExec(false)}>サーバー上のデータを削除</MenuItem>
          </Menu>
          <Menu
            anchorEl={this.refLocal.current}
            open={onLocal}
            onClick={() => this.handleToggle(1)}
          >
            <MenuItem onClick={() => this.addUser()}>端末に同期</MenuItem>
          </Menu>
          <List
            subheader={
              <ListSubheader component="div" disableSticky>
                アップロード済み
              </ListSubheader>
            }>
            {(syncData.length === 0 && notUploaded.length !== 0) &&
              <Button onClick={() => this.uploadExec()} fullWidth color="secondary" variant="outlined">サーバーへアップロード</Button>
            }
            {syncData.map(item => {
              if (!item.to) return (null);
              return (
                <ListItem key={item.to.displayName}>
                  <ListItemAvatar>
                    <Avatar>
                      <img src={item.to.photoURL ? item.to.photoURL : "noimage"} style={{ width: "100%", height: "100%" }}
                        alt={item.to.displayName}
                        onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(item.to) || alternativeImg(item.to.displayName)} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.to.displayName}
                    secondary={timeFormatter(3, item.updatedAt ? item.updatedAt.toDate() : new Date())}
                  />
                  <ListItemSecondaryAction onClick={() => this.deleteOne(item.to.uid)}>
                    <IconButton edge="end" aria-label="delete" size="large">
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          <Divider />
          <List
            subheader={
              <ListSubheader component="div" disableSticky>
                アップロード未完了
              </ListSubheader>
            }>
            {notUploaded.map(item => (
              <ListItem key={item.rivalName}>
                <ListItemAvatar>
                  <Avatar>
                    <img src={item.photoURL ? item.photoURL : "noimage"} style={{ width: "100%", height: "100%" }}
                      alt={item.displayName}
                      onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(item, true) || alternativeImg(item.rivalName)} />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={item.rivalName}
                  secondary={timeFormatter(3, item.lastUpdatedAt)}
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="add"
                    onClick={() => this.uploadOne(item.uid)}
                    size="large">
                    <AddBoxIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {processing && <Loader />}
          <p style={{ color: "#ff0000", textAlign: "center" }}>{errorMessage}</p>
        </Paper>

        <Alert severity="info" style={{ margin: "10px 0" }}>
          <AlertTitle style={{ marginTop: "0px", fontWeight: "bold" }}>この機能について</AlertTitle>
          <p>
            この機能を用いてアップロードしたライバル情報は、「逆ライバル」として共有されます。
          </p>
          <p>
            注意点：<br />
            ・サーバー上からライバルを削除しても、端末内にライバルのデータは残ります。<br />
            ・端末からライバルを削除すると、サーバー上のライバルデータも削除されます。<br />
            ・v0.0.4.2以降のバージョンでは、ライバルを追加すると同時に自動でサーバーに同期されます。<br />
          </p>
        </Alert>
        <ShowSnackBar message={message} variant={variant}
          handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000} />
      </React.Fragment>
    );
  }
}

export default SyncRivalScreen;
