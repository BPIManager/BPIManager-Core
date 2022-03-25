import * as React from 'react';
import Button from '@mui/material/Button';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Link as RefLink, Divider, Avatar, Grid, Typography, Container, CircularProgress, ListItem, ListItemAvatar, ListItemText, List } from '@mui/material/';
import { _currentVersion, _currentTheme, _currentQuickAccessComponents } from '@/components/settings';
import UpdateIcon from '@mui/icons-material/Update';
import Loader from '@/view/components/common/loader';
import { updateDefFile } from '@/components/settings/updateDef';
import CheckIcon from '@mui/icons-material/Check';
import WarningIcon from '@mui/icons-material/Warning';
import { Helmet } from 'react-helmet';
import { getAltTwitterIcon } from '@/components/rivals';
import { alternativeImg, getUA, blurredBackGround } from '@/components/common';
import TimelineIcon from '@mui/icons-material/Timeline';
import LibraryMusicIcon from '@mui/icons-material/LibraryMusic';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import Alert from '@mui/material/Alert/Alert';
import AlertTitle from '@mui/material/AlertTitle/AlertTitle';
import { FormattedMessage } from 'react-intl';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import { named, getTable, CLBody } from '@/components/aaaDiff/data';
import fbActions from '@/components/firebase/actions';
import { scoresDB } from '@/components/indexedDB';
import { scoreData } from '@/types/data';
import { isSameWeek, updatedTime } from '@/components/common/timeFormatter';
import { quickAccessTable } from '@/components/common/quickAccess';
import PeopleIcon from '@mui/icons-material/People';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import ModalUser from '../components/rivals/modal';
import AppsIcon from '@mui/icons-material/Apps';
import GetAppIcon from '@mui/icons-material/GetApp';
import { BeforeInstallPromptEvent } from '@/components/context/global';
import totalBPI from "@/components/bpi/totalBPI";
import { _apiFetch } from "@/components/common/rankApi";
import fbArenaMatch from "@/components/firebase/arenaMatch";
import AccessTimeIcon from '@mui/icons-material/AccessTime';

class Index extends React.Component<{ global: any } & RouteComponentProps, {
  user: any,
  totalBPI: number,
  lastWeekUpdates: number,
  remains: number,
  auth: any,
  isLoading: boolean,
  userLoading: boolean,
}>{

  constructor(props: { global: any } & RouteComponentProps) {
    super(props);
    this.state = {
      auth: null,
      user: localStorage.getItem("social") ? JSON.parse(localStorage.getItem("social") || "[]") : null,
      totalBPI: -15,
      lastWeekUpdates: 0,
      remains: 0,
      isLoading: true,
      userLoading: true,
    }
  }

  async componentDidMount() {
    const total = await (await new totalBPI().load()).currentVersion();
    let shift = await new scoresDB().getAll();
    shift = shift.filter((data: scoreData) => isSameWeek(data.updatedAt, new Date()));
    const _named = await named(12);
    const remains = await getTable(12, _named);
    const concatted = Object.keys(remains).reduce((group: any, item: string) => {
      if (!group) group = [];
      group = group.concat(remains[item]);
      return group;
    }, []);
    new fbActions().auth().onAuthStateChanged((user: any) => {
      this.setState({ auth: user, userLoading: false });
    });
    this.setState({
      totalBPI: total,
      lastWeekUpdates: shift.length || 0,
      remains: concatted.filter((item: CLBody) => item.bpi > (Number.isNaN(item.currentBPI) ? -999 : item.currentBPI)).length,
      isLoading: false
    });
    return;
  }

  QAindexOf = (needle: string) => {
    const str = _currentQuickAccessComponents();
    return str.indexOf(needle) > -1;
  }

  render() {
    const themeColor = _currentTheme();
    const { user, auth, isLoading, userLoading } = this.state;
    const xs = 12, sm = 12, md = 3, lg = 3;

    const ListItem = (icon: any, text: string, data: string | number, target: string, targetText: string) => (
      <Grid item xs={xs} sm={sm} md={md} lg={lg}>
        <div className="TypographywithIconAndLinesContainer">
          <div className="TypographywithIconAndLinesInner">
            <Typography color="textSecondary" gutterBottom className="TypographywithIconAndLines">
              {icon}&nbsp;<FormattedMessage id={text} />
            </Typography>
          </div>
        </div>
        {isLoading && <Loader />}
        {!isLoading && (
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography color="textSecondary" variant="h4">
                {data}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button size="small" onClick={() => this.props.history.push(target)}><FormattedMessage id={targetText} /></Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    )

    return (
      <div>
        <Helmet>
          <meta name="description"
            content="beatmania IIDXのスコアをBPIという指標を用いて管理したり、ライバルとスコアを競ったりできるツールです。"
          />
        </Helmet>
        <div style={{ background: `url("/images/background/${themeColor}.svg")`, backgroundSize: "cover" }}>
          <div style={{ background: themeColor === "light" ? "transparent" : "rgba(0,0,0,0)", display: "flex", padding: ".5vh 0", width: "100%", height: "100%" }}>
            {userLoading && (
              <Container className="topMenuContainer">
                <Grid container alignContent="space-between" alignItems="center" style={{ padding: "20px" }}>
                  <Grid item xs={3} lg={3} style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                    <Container fixed className={"loaderCenteredOnly"} style={{ maxWidth: "100%" }}>
                      <CircularProgress color="secondary" size={64} />
                    </Container>
                  </Grid>
                  <Grid item xs={9} lg={9}>
                    <Typography variant="body1">
                      &nbsp;
                </Typography>
                    <Typography variant="body1">
                      &nbsp;
                </Typography>
                  </Grid>
                </Grid>
              </Container>
            )}
            {(!userLoading && (auth && user)) && (
              <Container className="topMenuContainer">
                <Grid container justifyContent="space-between" alignItems="center" style={{ padding: "20px" }}>
                  <Grid item xs={3} lg={3} style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                    <Avatar style={{ border: "1px solid #222", margin: "15px auto" }} className="toppageIcon">
                      <img src={user.photoURL ? user.photoURL.replace("_normal", "") : "noimage"} style={{ width: "100%", height: "100%" }}
                        alt={user.displayName}
                        onClick={() => this.props.history.push("/u/" + user.displayName)}
                        onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(user) || alternativeImg(user.displayName)} />
                    </Avatar>
                  </Grid>
                  <Grid item xs={8} lg={8} style={{ paddingLeft: "30px" }}>
                    <Typography variant="body1">
                      {user.displayName}
                    </Typography>
                    <Typography variant="body1">
                      <Link to={"/sync/settings"}><RefLink color="secondary" component="span"><FormattedMessage id="Index.EditProfile" /></RefLink></Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Container>
            )}
            {(!userLoading && (!auth || !user)) && (
              <Container className="topMenuContainer">
                <Grid container justifyContent="space-between" alignItems="center" style={{ padding: "20px" }}>
                  <Grid item xs={3} lg={3} style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                    <Avatar style={{ border: "1px solid #222", margin: "15px auto" }} className="toppageIcon">
                    </Avatar>
                  </Grid>
                  <Grid item xs={8} lg={8} style={{ paddingLeft: "15px" }}>
                    <Typography variant="body1">
                      <FormattedMessage id="Index.NotLoggedIn" />
                    </Typography>
                    <Typography variant="body1">
                      <Link to="/sync/settings"><RefLink color="secondary" component="span"><FormattedMessage id="Index.SignIn" /></RefLink></Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Container>
            )}
          </div>
        </div>
        <Container className="topMenuContainer">
          {(!userLoading && (!auth || !user)) && <BeginnerAlert />}
          <InstallAlert global={this.props.global} />
          <UpdateDef />
        </Container>
        <Container style={{ paddingTop: 15 }} className="topMenuContainer">
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <div className="TypographywithIconAndLinesContainer">
              <div className="TypographywithIconAndLinesInner">
                <Typography color="textSecondary" gutterBottom className="TypographywithIconAndLines">
                  <MenuOpenIcon />&nbsp;<FormattedMessage id="Index.QuickAccess" />
                </Typography>
              </div>
            </div>
            <div style={{ overflowX: "scroll" }} className="topMenuScrollableWrapper">
              <Grid container direction="row" wrap="nowrap" alignItems="center" style={{ width: "100%", margin: "20px 0 0 0" }} className="topMenuContaienrGridWrapper">
                {quickAccessTable.map((item: any) => {
                  if (!this.QAindexOf(item.com)) return (null);
                  return (
                    <Grid container direction="column" alignItems="center" onClick={() => this.props.history.push(item.href)} key={item.name}>
                      {item.icon}
                      <Typography color="textSecondary" variant="caption">{item.name}</Typography>
                    </Grid>
                  )
                })
                }
                <Grid container direction="column" alignItems="center" onClick={() => this.props.history.push("/settings?tab=1")}>
                  <AppsIcon />
                  <Typography color="textSecondary" variant="caption">
                    <FormattedMessage id="Index.EditQA" />
                  </Typography>
                </Grid>
              </Grid>
            </div>
          </Grid>
          <Grid container direction="row" justifyContent="space-between" spacing={3} className="narrowCards">
            {ListItem(<TimelineIcon />, "Stats.TotalBPI", this.state.totalBPI, "/stats", "Index.ShowTotalBPI")}
            {ListItem(<LibraryMusicIcon />, "Index.UpdatedInWeek", this.state.lastWeekUpdates, "/songs", "Index.ShowSongs")}
            {ListItem(<WbIncandescentIcon />, "Index.AAARemain", this.state.remains, "/AAATable", "Index.ShowAAA")}
          </Grid>
        </Container>
        <ArenaMatch history={this.props.history} />
        <RecentUsers history={this.props.history} />
        <Container>
          <small className="footer">
            <FormattedMessage id="Index.notes1" /><br />
            <FormattedMessage id="Index.notes2" /><br />
            <FormattedMessage id="Index.notes3" /><br /><br />
            Made with &hearts; by poyashi.me<br />
            Author : <RefLink href="https://twitter.com/210120090722O19" target="_blank" color="secondary">@210120090722O19</RefLink>
          </small>
        </Container>
      </div>
    )
  }
}

export default withRouter(Index);

class UpdateDef extends React.Component<{}, {
  showUpdate: boolean,
  latestVersion: string,
  updateInfo: string,
  progress: number,
  res: string,
}>{

  constructor(props: {}) {
    super(props);
    this.state = {
      showUpdate: false,
      latestVersion: "",
      updateInfo: "",
      progress: 0,
      res: ""
    }
  }

  async componentDidMount() {
    try {
      const versions = await fetch("https://proxy.poyashi.me/?type=bpiVersion");
      const data = await versions.json();
      const currentVersion = _currentVersion();
      if (data.version !== currentVersion) {
        this.setState({
          showUpdate: true,
          latestVersion: data.version,
          updateInfo: data.updateInfo,
        });
      }
    } catch (e: any) {
      console.log(e);
    }
  }

  updateButton = async () => {
    this.setState({ progress: 1 });
    const p = await updateDefFile();
    this.setState({ progress: 2, res: p.message });
  }

  handleToggle = () => this.setState({ showUpdate: false });

  render() {
    const { showUpdate, latestVersion, updateInfo, progress, res } = this.state;
    if (!showUpdate) {
      return (null);
    }
    return (
      <Alert variant="outlined" className="MuiPaper-root updateDefAlert" style={{ border: 0, background: "transparent" }} icon={false} severity="info">
        <AlertTitle>定義データを更新</AlertTitle>
        <div>
          {progress === 0 && <div>
            最新の楽曲データ(ver{latestVersion})が利用可能です。<br />
            「更新」ボタンをクリックして今すぐ更新できます。<br />
            <RefLink href={updateInfo} target="_blank" color="secondary">ここをクリック</RefLink>して、最新の楽曲データにおける変更点を確認できます。
            <Divider style={{ margin: "8px 0" }} />
            <Button
              fullWidth
              variant="outlined"
              color="secondary"
              size="large"
              onClick={this.updateButton}
              startIcon={<UpdateIcon />}>
              今すぐ更新
            </Button>
          </div>}
          {progress === 1 && <div>
            <Loader />
            <p style={{ textAlign: "center" }}>更新しています<br /><span id="_progressText" /></p>
          </div>}
          {progress === 2 && <div>
            <div style={{ display: "flex", alignItems: "center", margin: "20px 0", flexDirection: "column" }}>
              {(res === "定義データはすでに最新です" || res === "更新完了") && <CheckIcon style={{ fontSize: 60 }} />}
              {(res !== "定義データはすでに最新です" && res !== "更新完了") && <WarningIcon style={{ fontSize: 60 }} />}
              <span>{res}</span>
              {(res !== "定義データはすでに最新です" && res !== "更新完了") && <span><RefLink href="https://gist.github.com/potakusan/11b5322c732bfca4d41fc378dab9b992" color="secondary" target="_blank">トラブルシューティングを表示</RefLink></span>}
            </div>
            <Button onClick={this.handleToggle} color="secondary" fullWidth style={{ marginTop: "8px" }}>
              閉じる
            </Button>
          </div>}
        </div>
      </Alert>
    );
  }
}

class BeginnerAlert extends React.Component<{}, {}>{

  render() {
    return (
      <Alert variant="outlined" className="MuiPaper-root updateDefAlert" severity="info" style={{ marginBottom: "25px" }}>
        <AlertTitle>はじめての方へ</AlertTitle>
        <p>
          「BPIとはなにか？何を表す数字なのか？」などのよくあるご質問にお答えするページがございます。<br />
          <RefLink href="https://docs2.poyashi.me" target="_blank" color="secondary">こちらのページを御覧ください。</RefLink>
        </p>
      </Alert>
    );
  }
}

class InstallAlert extends React.Component<{ global: any }, { hide: boolean }>{

  constructor(props: { global: any }) {
    super(props);
    this.state = {
      hide: false
    }
  }
  private available = (('standalone' in window.navigator) && ((window.navigator as any)['standalone']));

  installApp = () => {
    const { global } = this.props;
    if (global && global.prompt) {
      const p = global.prompt as BeforeInstallPromptEvent;
      p.prompt();
    } else {
      alert("インストールダイアログの呼び出しに失敗しました。\nChromeのメニューより「ホーム画面に追加」をタップし、手動で追加してください。");
    }
  }

  hideMessage = () => { localStorage.setItem("hideAddToHomeScreen", "true"); this.setState({ hide: true }); }

  render() {
    const ua = getUA();
    const bg = blurredBackGround();
    if (localStorage.getItem("hideAddToHomeScreen") || this.state.hide) return (null);
    if (ua === "ios" && this.available) return (null); // iOS PWA動作時
    if (ua === "chrome" && window.matchMedia('(display-mode: standalone)').matches) return (null); // Chronium PWA動作時
    if (ua === "chrome") {
      return (
        <Alert className="MuiPaper-root" severity="info" style={bg}>
          <AlertTitle>ご存知ですか？</AlertTitle>
          <p>
            「インストール」ボタンをタップして、ホーム画面から通常のアプリのようにBPIManagerをお使いいただけます。
          </p>
          <Button startIcon={<GetAppIcon />} fullWidth color="secondary" variant="outlined" onClick={this.installApp}>インストール</Button>
        </Alert>
      );
    }
    if (ua === "ios") {
      return (
        <Alert className="MuiPaper-root" severity="info" style={bg}>
          <AlertTitle>お試しください</AlertTitle>
          <p>
            ホーム画面に追加して、通常のアプリのようにBPIManagerをお使いいただけます。
          </p>
          <img src="/images/how_to_add_ios.webp" style={{ width: "100%", maxWidth: "460px", display: "block", margin: "3px auto" }} alt="ホーム画面への追加手順" />
          <Button fullWidth style={{ marginTop: "8px", display: "block", textAlign: "right" }} onClick={this.hideMessage}>次から表示しない</Button>
        </Alert>
      )
    }
    return (null);
  }

}

class RecentUsers extends React.Component<{ history: any }, { loading: boolean, list: any[], open: boolean, username: string, maintenance: boolean }>{

  state = {
    loading: true,
    maintenance: false,
    list: [],
    open: false,
    username: ""
  }

  componentDidMount() {
    this.getRecentUsers();
  }

  handleModalOpen = (flag: boolean) => this.setState({ open: flag });
  open = (uid: string) => this.setState({ open: true, username: uid });

  getRecentUsers = async () => {
    const fbA = new fbActions();
    fbA.auth().onAuthStateChanged(async (user: any) => {
      const total = await (await new totalBPI().load()).currentVersion();
      const gt = total > 60 ? 50 : total - 2;
      const lt = total > 50 ? 100 : total + 5;
      const res = (await _apiFetch("users/getRecommend", { gt: gt, lt: lt }));
      if (res.error || res.maintenance) {
        return this.setState({ maintenance: res.maintenance, loading: false, list: [] })
      }
      return this.setState({
        maintenance: res.maintenance, loading: false, list: res.body.filter((item: any) => {
          if (user) {
            return user.uid !== item.uid;
          }
          return true;
        }).sort((a: any, b: any) => {
          return Math.abs(total - (Number(a.totalBPI) || -15)) - Math.abs(total - (Number(b.totalBPI) || -15))
        }).slice(0, 5)
      });
    });
  }

  render() {
    const { loading, list, open, username, maintenance } = this.state;
    const { history } = this.props;
    return (
      <React.Fragment>
        <Container style={{ marginTop: 24 }}>
          <div className="TypographywithIconAndLinesContainer">
            <div className="TypographywithIconAndLinesInner">
              <Typography color="textSecondary" gutterBottom className="TypographywithIconAndLines">
                <PeopleIcon />&nbsp;あなたに実力が近いユーザー
              </Typography>
            </div>
          </div>
          {loading && <div style={{ marginTop: 8 }}><Loader /></div>}
          {(!loading && maintenance) && (
            <Typography variant="caption" color="textSecondary">
              現在この機能はメンテナンス中のためご利用いただけません。<br />
              (毎日午前3時~午前5時は一部機能がご利用いただけなくなります。)
            </Typography>
          )}
          {(!loading && !maintenance) && (
            <React.Fragment>
              <List>
                {list.map((item: any) => (
                  <ListItem key={item.uid} button onClick={() => this.open(item.displayName)} style={{ padding: "5px 0" }}>
                    <ListItemAvatar>
                      <Avatar>
                        <img src={item.photoURL ? item.photoURL.replace("_normal", "") : "noimage"} style={{ width: "100%", height: "100%" }}
                          alt={item.displayName}
                          onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(item) || alternativeImg(item.displayName)} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={item.displayName} secondary={item.arenaRank + " / 総合BPI:" + item.totalBPI} />
                  </ListItem>
                ))}
              </List>
              <Button startIcon={<ArrowRightIcon />} fullWidth size="small" onClick={() => history.push("/rivals?tab=1")}>
                <FormattedMessage id="ShowMore" />
              </Button>
            </React.Fragment>
          )}
        </Container>
        {open && <ModalUser isOpen={open} currentUserName={username} handleOpen={(flag: boolean) => this.handleModalOpen(flag)} />}
      </React.Fragment>
    );
  }
}


class ArenaMatch extends React.Component<{ history: any }, { list: any[] }>{

  state = {
    list: [],
  }

  componentDidMount() {
    this.getRoomList();
  }

  getRoomList = async () => {
    const fbArena = new fbArenaMatch();
    fbArena.realtime(await fbArena.list(), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        let matchList = ([] as any[]).concat(this.state.list);
        if (change.type === "added") {
          matchList.push(change.doc.data());
        }
        if (change.type === "modified") {
          const newData = change.doc.data();
          matchList.forEach((item, index) => {
            if (item.matchId === newData.matchId) {
              matchList[index] = newData;
            }
          });
        }
        if (change.type === "removed") {
          const removed = change.doc.data();
          console.log(change.doc.data());
          matchList = matchList.filter((item) => item.matchId !== removed.matchId);
        }
        return this.setState({
          list: matchList.slice(0, 5)
        });
      });
    });
  }

  render() {
    const { list } = this.state;
    const { history } = this.props;
    return (
      <React.Fragment>
        <Container style={{ marginTop: 24 }}>
          <div className="TypographywithIconAndLinesContainer">
            <div className="TypographywithIconAndLinesInner">
              <Typography color="textSecondary" gutterBottom className="TypographywithIconAndLines">
                <AccessTimeIcon />&nbsp;ArenaMatch で待機中
              </Typography>
            </div>
          </div>
          {list.length === 0 && <div style={{ marginTop: 8 }}></div>}
          {(list.length > 0) && (
            <React.Fragment>
              <List>
                {list.map((item: any) => (
                  <ListItem key={item.uid} button onClick={() => history.push("/arena/" + item.matchId)} style={{ padding: "5px 0" }}>
                    <ListItemAvatar>
                      <Avatar>
                        <img src={item.admin.photoURL ? item.admin.photoURL.replace("_normal", "") : "noimage"} style={{ width: "100%", height: "100%" }}
                          alt={item.admin.displayName}
                          onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(item.admin) || alternativeImg(item.admin.displayName)} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={item.admin.displayName} secondary={item.arenaRank + " / 総合BPI:" + item.admin.totalBPI + " / " + updatedTime(item.updatedAt.toDate())} />
                  </ListItem>
                ))}
              </List>
            </React.Fragment>
          )}
          <Button startIcon={<ArrowRightIcon />} fullWidth size="small" onClick={() => history.push("/arena")}>
            <FormattedMessage id="ShowMore" /> / ルーム作成
          </Button>
        </Container>
      </React.Fragment>
    );
  }
}
