import React, { useState, useEffect, useMemo } from "react";
import Button from "@mui/material/Button";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import fbActions from "@/components/firebase/actions";
import { _currentStore, _isSingle } from "@/components/settings";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { Switch, FormControlLabel, Card, CardContent, Theme, Grid, Link, Typography, ButtonGroup } from "@mui/material/";
import withStyles from "@mui/styles/withStyles";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Loader from "../common/loader";
import { getAltTwitterIcon, getTwitterName } from "@/components/rivals";
import SaveIcon from "@mui/icons-material/Save";
import { red } from "@mui/material/colors";
import AlertTitle from "@mui/material/AlertTitle";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import SyncControlScreen from "../sync/control";
import Divider from "@mui/material/Divider";
import { areaSelect } from "@/config";
import { UserIcon } from "../common/icon";
import * as H from "history";

const defaultData = (photoURL: string) => ({
  isPublic: false,
  iidxId: "",
  twitter: "",
  displayName: "",
  profile: "",
  photoURL: photoURL,
  arenaRank: "-",
  totalBPIs: {
    [_currentStore()]: -15,
  },
});

export const SyncMainScreen: React.FC<{ userData: any } & RouteComponentProps> = ({ userData, history }) => {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [scoreData, setScoreData] = useState<any | null>(null);
  const [nextData, setNextData] = useState<any>(defaultData(""));
  const [authData, setAuthData] = useState<any>(null);
  const [userInfoModal, setUserInfoModal] = useState(false);
  const [nameErrorMessage, setNameErrorMessage] = useState<string[]>([]);
  const toggleUserDetail = () => setUserInfoModal(!userInfoModal);
  const handlePublic = () => setNextData({ ...nextData, isPublic: !nextData.isPublic });
  const editProfile = (target: string, newState: any) => setNextData({ ...nextData, [target]: newState });

  const fbA: fbActions = useMemo(() => new fbActions(), []);
  const fbLoader: fbActions = useMemo(() => new fbActions(), []);

  const load = async () => {
    fbLoader.setColName(`${_currentStore()}_${_isSingle()}`).setDocName(userData.uid);
    fbA.v2SetUserCollection().setDocName(userData.uid);
    return fbA.auth().onAuthStateChanged(async (user: any) => {
      const t = await fbA.load();
      let tw = t && t.twitter ? t.twitter : "";
      if (!tw && t && t.profile) {
        tw = getTwitterName(t.profile) || "";
      }
      fbLoader.updateProfileIcon();
      setScoreData(await fbLoader.load());
      setAuthData(user);
      setNextData(t && t.displayName ? { ...t, twitter: tw } : defaultData(user.photoURL));
      setLoading(false);
    });
  };

  const sendName = async () => {
    setSending(true);
    setNameErrorMessage([]);
    try {
      if (nextData.displayName && scoreData === null) {
        setNameErrorMessage(["エラーが発生しました。次のような理由が挙げられます:"]);
        setSending(false);
        return;
      }
      const res = await fbA.saveUserData(nextData);
      if (res.error) {
        setNameErrorMessage(["エラーが発生しました。次のような理由が挙げられます:", "名前に使用できない文字列が含まれている、すでに使用されている名前である、アクセス権限がない"]);
        setSending(false);
        return;
      }
    } catch (e: any) {
      alert("エラーが発生しました。:" + e);
      return;
    }
    setSending(false);
    setNameErrorMessage(["設定を反映しました"]);
    setNextData(await fbA.load());
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!nextData) {
    return null;
  }

  const nameError: boolean = nextData.displayName.length !== 0 && (!/^[a-zA-Z0-9]+$/g.test(nextData.displayName) || nextData.displayName.length > 16);
  const profError: boolean = nextData.profile.length > 140;

  return (
    <React.Fragment>
      <Grid container alignItems="center">
        <Grid item xs={3}>
          <UserIcon size={64} disableZoom defaultURL={nextData.photoURL ? nextData.photoURL.replace("_normal", "") : ""} text={nextData.displayName || "Private-mode User"} altURL={getAltTwitterIcon(nextData)} />
        </Grid>
        <Grid item xs={9} style={{ justifyContent: "start", display: "flex" }}>
          <p>
            Welcome back, {nextData.displayName || ""}
            <br />
            Signed in via {authData.providerData[0].providerId || "Unknown Provider"}
          </p>
        </Grid>
      </Grid>
      <Divider style={{ margin: "15px 0" }} />
      <Grid container>
        <Grid item xs={10}>
          <Typography variant="body1">ユーザー情報</Typography>
        </Grid>
        <Grid item xs={2} style={{ justifyContent: "flex-end", display: "flex" }}>
          <FormControl component="fieldset" variant="standard">
            <Button onClick={toggleUserDetail}>確認</Button>
          </FormControl>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={10}>
          <Typography variant="body1">一般公開</Typography>
        </Grid>
        <Grid item xs={2} style={{ justifyContent: "flex-end", display: "flex" }}>
          <FormControl component="fieldset" variant="standard">
            <FormControlLabel control={<Switch size="small" checked={nextData.isPublic} onChange={handlePublic} name="isPublic" />} label="" className="syncPublicSwitch" />
          </FormControl>
        </Grid>
      </Grid>
      {!nextData.isPublic && (
        <Alert variant="outlined" severity="warning" style={{ borderColor: "#663c0045", margin: "8px 0" }}>
          <AlertTitle>アカウントが非公開です</AlertTitle>
          <p>
            スコアデータを公開してライバルを増やしましょう。
            <br />
            アカウントの公開およびライバル機能に関する詳細は
            <Link href="https://docs2.poyashi.me/docs/social/rivals/" color="secondary" target="_blank">
              こちら
            </Link>
            をご確認ください。
          </p>
        </Alert>
      )}
      {nextData.isPublic && (
        <Card
          style={{
            border: "1px solid #663c0045",
            background: "transparent",
            margin: "8px 0",
          }}
        >
          <CardContent style={{ padding: "16px" }}>
            <TextField
              label="表示名を入力(最大16文字)"
              InputLabelProps={{
                shrink: true,
              }}
              error={nameError}
              helperText={nameError && "使用できない文字が含まれているか、長すぎます"}
              value={nextData.displayName}
              onChange={(e) => editProfile("displayName", e.target.value)}
              style={{ width: "100%", margin: "0px 0px 8px 0" }}
            />
            <Grid container>
              <Grid item xs={6}>
                <FormControl fullWidth style={{ margin: "8px 0" }}>
                  <InputLabel>アリーナランク</InputLabel>
                  <Select
                    fullWidth
                    value={nextData.arenaRank}
                    onChange={(e: SelectChangeEvent<string>) => {
                      if (typeof e.target.value !== "string") return;
                      setNextData({ ...nextData, arenaRank: e.target.value });
                    }}
                  >
                    {["-", "A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"].map((item) => (
                      <MenuItem value={item} key={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth style={{ margin: "8px 0" }}>
                  <InputLabel>所属エリア</InputLabel>
                  <Select
                    fullWidth
                    value={nextData.area || "-"}
                    onChange={(e: SelectChangeEvent<string>) => {
                      if (typeof e.target.value !== "string") return;
                      setNextData({ ...nextData, area: e.target.value });
                    }}
                  >
                    {areaSelect.map((item) => (
                      <MenuItem value={item} key={item}>
                        {item}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              label="自己紹介を入力(最大140文字)"
              InputLabelProps={{
                shrink: true,
              }}
              value={nextData.profile}
              error={profError}
              helperText={profError && "自己紹介が長すぎます"}
              onChange={(e) => editProfile("profile", e.target.value)}
              style={{ width: "100%", margin: "8px 0px 8px 0" }}
            />
            <TextField
              label="IIDX ID"
              InputLabelProps={{
                shrink: true,
              }}
              type="number"
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              value={nextData.iidxId || ""}
              onChange={(e) => {
                if (e.target.value.length > 8) return;
                editProfile("iidxId", e.target.value);
              }}
              style={{ width: "100%", margin: "0px 0px 8px 0" }}
            />
            <TextField
              label="Twitter"
              InputLabelProps={{
                shrink: true,
              }}
              value={nextData.twitter}
              onChange={(e) => {
                if (e.target.value && !e.target.value.match(/^[a-zA-Z_0-9]+$/g)) return;
                editProfile("twitter", e.target.value);
              }}
              style={{ width: "100%", margin: "0px 0px 8px 0" }}
            />
          </CardContent>
        </Card>
      )}
      <SyncControlScreen toggleSending={() => setSending(!sending)} userData={userData} />
      {(nameErrorMessage.length > 0 || (scoreData === null && nextData.displayName)) && (
        <Alert style={{ borderColor: "#4fc3f745", margin: "8px 0" }} severity="warning">
          {nameErrorMessage.map((item: string) => (
            <span key={item}>
              {item}
              <br />
            </span>
          ))}
          {scoreData === null && nextData.displayName && <span style={{ color: "#ff0000" }}>スコアデータが送信されていません。スコアデータを送信してください。</span>}
        </Alert>
      )}
      <ButtonGroup variant="contained" fullWidth style={{ marginTop: "8px" }}>
        <Button fullWidth variant="outlined" color="secondary" onClick={sendName} startIcon={<SaveIcon />} disabled={sending}>
          変更を保存
        </Button>
        <ColorButton color="secondary" disabled={sending} fullWidth onClick={() => fbA.logout()} startIcon={<MeetingRoomIcon />}>
          サインアウト
        </ColorButton>
      </ButtonGroup>
      {userInfoModal && <UserDetail rawUserData={userData} userInfo={nextData} handleClose={toggleUserDetail} history={history} />}
    </React.Fragment>
  );
};

export default withRouter(SyncMainScreen);

const ColorButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(red[700]),
    backgroundColor: red[700],
    "&:hover": {
      backgroundColor: red[700],
    },
  },
}))(Button);

class UserDetail extends React.Component<
  {
    handleClose: () => void;
    userInfo: any;
    rawUserData: any;
    history: H.History;
  },
  {}
> {
  render() {
    const { userInfo, rawUserData } = this.props;
    return (
      <Dialog open={true} onClose={this.props.handleClose} style={{ margin: "0 8px" }}>
        <DialogContent style={{ paddingBottom: 0 }}>
          <List>
            {[
              {
                primary: rawUserData.uid,
                secondary: "ユニークユーザー ID",
              },
              {
                primary: rawUserData.metadata.creationTime,
                secondary: "アカウント作成日",
              },
              {
                primary: rawUserData.metadata.lastSignInTime,
                secondary: "最終サインイン",
              },
              {
                primary: userInfo.verified ? "認証済み" : "認証されていません",
                secondary: "アカウントの認証状態",
              },
              {
                primary: rawUserData.providerData.length > 0 ? rawUserData.providerData[0].providerId : "unknown",
                secondary: "アカウント プロバイダ",
              },
            ].map((item) => (
              <ListItem style={{ padding: "0 16px" }} key={item.primary}>
                <ListItemText primary={item.primary} secondary={item.secondary} />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.props.handleClose} autoFocus>
            完了
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
