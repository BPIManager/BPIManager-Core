import * as React from 'react';
import Button from '@mui/material/Button';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import fbActions from '@/components/firebase/actions';
import { _currentStore, _isSingle, _autoSync, _setAutoSync } from '@/components/settings';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import { Switch, FormControlLabel, Avatar, Card, CardContent, Theme, Grid, Link, Typography, ButtonGroup } from '@mui/material/';
import withStyles from '@mui/styles/withStyles';
import { withRouter, RouteComponentProps } from "react-router-dom";
import Alert from '@mui/material/Alert';
import Loader from '../common/loader';
import { alternativeImg } from '@/components/common';
import { getAltTwitterIcon, getTwitterName } from '@/components/rivals';
import SaveIcon from '@mui/icons-material/Save';
import { red } from '@mui/material/colors';
import AlertTitle from '@mui/material/AlertTitle';
import CheckIcon from '@mui/icons-material/Check';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

class SyncControlScreen extends React.Component<{ userData: any } & RouteComponentProps, {
  isLoading: boolean,
  scoreData: any,
  sentName: string,
  rivalData: any,
  myName: string,
  myProfile: string,
  nameErrorMessage: string[],
  showNotes: boolean,
  arenaRank: string,
  rawUserData: any,
  hideAlert: boolean,
  isPublic: boolean,
  iidxId: string,
  twitterId: string,
  isSending: boolean,
  showUserInfo: boolean
}> {

  private fbA: fbActions = new fbActions();
  private fbLoader: fbActions = new fbActions();

  constructor(props: { userData: any } & RouteComponentProps) {
    super(props);
    this.fbLoader.setColName(`${_currentStore()}_${_isSingle()}`).setDocName(props.userData.uid);
    this.fbA.v2SetUserCollection().setDocName(props.userData.uid);
    this.state = {
      isLoading: true,
      isSending: false,
      scoreData: null,
      rivalData: null,
      myName: "",
      sentName: "",
      myProfile: "",
      arenaRank: "-",
      showNotes: false,
      nameErrorMessage: [],
      rawUserData: null,
      hideAlert: false,
      isPublic: false,
      iidxId: "",
      twitterId: "",
      showUserInfo: false,
    }
  }

  async componentDidMount() {
    return this.fbA.auth().onAuthStateChanged(async (user: any) => {
      const t = await this.fbA.load();
      let tw = t && t.twitter ? t.twitter : "";
      if (!tw && t) {
        tw = getTwitterName(t.profile) || "";
      }
      this.fbLoader.updateProfileIcon();
      this.setState({
        isLoading: false,
        rawUserData: user,
        scoreData: await this.fbLoader.load(),
        rivalData: t,
        sentName: t && t.displayName ? t.displayName : "",
        myName: t && t.displayName ? t.displayName : "",
        myProfile: t && t.profile ? t.profile : "",
        arenaRank: t && t.arenaRank ? t.arenaRank : "-",
        showNotes: t && t.showNotes ? t.showNotes : false,
        isPublic: t && t.isPublic ? t.isPublic : false,
        iidxId: t && t.iidxId ? t.iidxId : "",
        twitterId: tw,
      });
    });
  }

  toggleUserDetail = () => this.setState({ showUserInfo: !this.state.showUserInfo })

  sendName = async () => {
    this.setState({ isSending: true, nameErrorMessage: [] });
    try {
      if (this.state.myName && this.state.scoreData === null) {
        return this.setState({ nameErrorMessage: ["エラーが発生しました。次のような理由が挙げられます:"], isSending: false });
      }
      const res = await this.fbA.saveName(this.state.myName, this.state.myProfile, this.props.userData.photoURL, this.state.arenaRank, this.state.showNotes, this.state.isPublic, this.state.iidxId, this.state.twitterId || "");
      if (res.error) {
        return this.setState({ nameErrorMessage: ["エラーが発生しました。次のような理由が挙げられます:", "名前に使用できない文字列が含まれている、すでに使用されている名前である、アクセス権限がない"], isSending: false });
      }
    } catch (e: any) {
      alert("エラーが発生しました。:" + e);
    }
    this.setState({ nameErrorMessage: ["設定を反映しました"], isSending: false, sentName: this.state.myName, rivalData: await this.fbA.load() });
  }

  handleShowNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ showNotes: e.target.checked });
  }

  handlePublic = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ isPublic: e.target.checked });
  }

  render() {
    const { isLoading, isSending, rivalData, scoreData, rawUserData, nameErrorMessage, myName, myProfile, arenaRank, iidxId, twitterId, hideAlert, isPublic, showUserInfo } = this.state;
    const nameError: boolean = myName.length !== 0 && (!/^[a-zA-Z0-9]+$/g.test(myName) || myName.length > 16);
    const profError: boolean = myProfile.length > 140;
    if (isLoading) return <Loader text="プロファイルを取得中" />
    return (
      <React.Fragment>
        {(!_autoSync() && !hideAlert) && (
          <Alert severity="warning" style={{ margin: "10px 0" }}>
            <AlertTitle>Auto-syncが無効です</AlertTitle>
            <p>サーバー上のスコアデータを最新のまま維持するために、Auto-syncを有効にしてください。</p>
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              onClick={() => {
                _setAutoSync(true);
                this.setState({ hideAlert: true });
              }}
              startIcon={<CheckIcon />}
              disabled={isLoading}>
              オンにする
            </Button>
          </Alert>
        )}
        {(hideAlert) && (
          <Alert severity="success" style={{ margin: "10px 0" }}>
            <AlertTitle>Auto-syncを有効にしました</AlertTitle>
            <p>設定→Auto-syncより、いつでもこの機能を無効にできます。</p>
          </Alert>
        )}
        <div style={{ textAlign: "center" }}>
          <Avatar style={{ width: "50%", maxWidth: "128px", height: "auto", margin: "25px auto 8px auto" }}>
            <img src={rawUserData.photoURL ? rawUserData.photoURL.replace("_normal", "") : "noimage"} style={{ width: "100%", height: "100%" }}
              alt={rivalData ? rivalData.displayName : rawUserData.displayName || "Unpublished User"}
              onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(rivalData) || alternativeImg(rawUserData.displayName)} />
          </Avatar>
          <p>
            Welcome back, {rawUserData.displayName || ""}<br />
            Signed in via {rawUserData.providerData[0].providerId || "Unknown Provider"}
          </p>
        </div>
        <Grid container>
          <Grid item xs={10}>
            <Typography variant="body1">ユーザー情報</Typography>
          </Grid>
          <Grid item xs={2} style={{ justifyContent: "flex-end", display: "flex" }}>
            <FormControl component="fieldset" variant="standard">
              <Button onClick={this.toggleUserDetail}>確認</Button>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={10}>
            <Typography variant="body1">一般公開</Typography>
          </Grid>
          <Grid item xs={2} style={{ justifyContent: "flex-end", display: "flex" }}>
            <FormControl component="fieldset" variant="standard">
              <FormControlLabel
                control={<Switch size="small" checked={isPublic} onChange={this.handlePublic} name="isPublic" />}
                label=""
                style={{ margin: "0 4px" }}
              />
            </FormControl>
          </Grid>
        </Grid>
        {!isPublic && (
          <Alert severity="warning" style={{ margin: "16px 0" }}>
            <AlertTitle>アカウントが非公開です</AlertTitle>
            <p>
              スコアデータを公開してライバルを増やしましょう。<br />
              アカウントの公開およびライバル機能に関する詳細は<Link href="https://docs2.poyashi.me/docs/social/rivals/" color="secondary" target="_blank">こちら</Link>をご確認ください。
            </p>
          </Alert>
        )}
        {isPublic && (
          <Card style={{ marginTop: "16px" }}>
            <CardContent style={{ padding: "16px" }}>
              <TextField label="表示名を入力(最大16文字)"
                InputLabelProps={{
                  shrink: true,
                }}
                error={nameError}
                helperText={nameError && "使用できない文字が含まれているか、長すぎます"}
                value={myName}
                onChange={(e) => this.setState({ myName: e.target.value })}
                style={{ width: "100%", margin: "0px 0px 8px 0" }} />
              <FormControl fullWidth style={{ margin: "8px 0" }}>
                <InputLabel>アリーナランク</InputLabel>
                <Select fullWidth value={arenaRank} onChange={(e: SelectChangeEvent<string>, ) => {
                  if (typeof e.target.value !== "string") return;
                  this.setState({ arenaRank: e.target.value });
                }}>
                  {["-", "A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"].map(item => <MenuItem value={item} key={item}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField label="自己紹介を入力(最大140文字)"
                InputLabelProps={{
                  shrink: true,
                }}
                value={myProfile}
                error={profError}
                helperText={profError && "自己紹介が長すぎます"}
                onChange={(e) => this.setState({ myProfile: e.target.value })}
                style={{ width: "100%", margin: "8px 0px 8px 0" }} />
              <TextField label="IIDX ID"
                InputLabelProps={{
                  shrink: true,
                }}
                type="number"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
                value={iidxId}
                onChange={(e) => this.setState({ iidxId: e.target.value })}
                style={{ width: "100%", margin: "0px 0px 8px 0" }} />
              <TextField label="Twitter"
                InputLabelProps={{
                  shrink: true,
                }}
                value={twitterId}
                onChange={(e) => {
                  if (!e.target.value.match(/^[a-zA-Z_0-9]+$/g)) return;
                  this.setState({ twitterId: e.target.value })
                }}
                style={{ width: "100%", margin: "0px 0px 8px 0" }} />
            </CardContent>
          </Card>
        )}
        {(nameErrorMessage.length > 0 || (scoreData === null && myName)) &&
          <Alert severity="error" style={{ margin: "8px 0" }}>
            {nameErrorMessage.map((item: string) => <span key={item}>{item}<br /></span>)}
            {(scoreData === null && myName) && <span style={{ color: "#ff0000" }}>スコアデータが送信されていません。「データ」→「アップロード」よりスコアデータを送信してください。</span>}
          </Alert>
        }
        <ButtonGroup variant="contained" fullWidth style={{ marginTop: "8px" }}>
          <Button
            fullWidth
            variant="outlined"
            color="secondary"
            onClick={this.sendName}
            startIcon={<SaveIcon />}
            disabled={isSending}>
            変更を保存
          </Button>
          <ColorButton
            color="secondary"
            disabled={isSending}
            fullWidth
            onClick={() => this.fbA.logout()}
            startIcon={<MeetingRoomIcon />}>
            サインアウト
          </ColorButton>
        </ButtonGroup>
        {showUserInfo && <UserDetail rawUserData={rawUserData} userInfo={rivalData} handleClose={this.toggleUserDetail} />}
      </React.Fragment>
    );
  }
}

export default withRouter(SyncControlScreen);

const ColorButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(red[700]),
    backgroundColor: red[700],
    '&:hover': {
      backgroundColor: red[700],
    },
  },
}))(Button);

class UserDetail extends React.Component<{
  handleClose: () => void,
  userInfo: any,
  rawUserData: any
}, {}>{
  render() {
    const { userInfo, rawUserData } = this.props;
    console.log(userInfo, rawUserData);
    return (

      <Dialog
        open={true}
        onClose={this.props.handleClose}
        style={{margin:"0 8px"}}
      >
        <DialogContent>
          <List>
            {
              [
                {
                  primary: rawUserData.uid,
                  secondary: "ユニークユーザー ID"
                },
                {
                  primary: rawUserData.metadata.creationTime,
                  secondary: "アカウント作成日"
                },
                {
                  primary: rawUserData.metadata.lastSignInTime,
                  secondary: "最終サインイン"
                },
                {
                  primary: userInfo.verified ? "認証済み" : "認証されていません",
                  secondary: "アカウントの認証状態"
                },
                {
                  primary: rawUserData.providerData.length > 0 ? rawUserData.providerData[0].providerId : "unknown",
                  secondary: "アカウント プロバイダ"
                }
              ].map((item) => (
                <ListItem style={{padding:"0 16px"}}>
                  <ListItemText primary={item.primary} secondary={item.secondary} />
                </ListItem>
              ))
            }
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleClose} autoFocus>
            完了
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
}
