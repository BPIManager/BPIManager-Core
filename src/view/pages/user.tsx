import * as React from 'react';
import Container from '@mui/material/Container';
import { injectIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import WarningIcon from '@mui/icons-material/Warning';
import { _currentStore, _isSingle, _currentTheme } from '@/components/settings';
import fbActions from '@/components/firebase/actions';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ViewListIcon from '@mui/icons-material/ViewList';
import TwitterIcon from '@mui/icons-material/Twitter';
import { rivalListsDB } from '@/components/indexedDB';
import ShowSnackBar from '@/view/components/snackBar';
import RivalView, { makeRivalStat } from '@/view/components/rivals/view';
import { rivalScoreData, rivalStoreData } from '@/types/data';
import { Link, Divider, Grid, ImageList, ImageListItem, ImageListItemBar, List, ListItem, ListItemAvatar, ListItemText, ListItemSecondaryAction, IconButton, Button, Fab, Tabs, Tab, TextField } from '@mui/material/';
import { Link as RefLink } from "react-router-dom";
import ClearLampView from '@/view/components/table/fromUserPage';
import WbIncandescentIcon from '@mui/icons-material/WbIncandescent';
import { arenaRankColor, alternativeImg, avatarBgColor, avatarFontColor, bgColorByBPI } from '@/components/common';
import Loader from '@/view/components/common/loader';
import { config } from '@/config';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import CommentIcon from '@mui/icons-material/Comment';
import NotesView from '../components/notes/user';
import { Helmet } from 'react-helmet';
import { getTwitterName, getAltTwitterIcon } from '@/components/rivals';
import { withRivalData, radarData, getRadar } from '@/components/stats/radar';
import RivalStatViewFromUserPage from '../components/rivals/viewComponents/statsFromUserPage';
import Alert from '@mui/material/Alert/Alert';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WeeklyList from '@/view/pages/ranking/list';
import getUserData from '@/components/user';
import FolloweeCounter from '../components/users/count';
import { makeHeatmap, colorClassifier } from '@/components/user/heatmap';
import CalendarHeatmap from 'react-calendar-heatmap';
import { toDate, subtract } from '@/components/common/timeFormatter';
import 'react-calendar-heatmap/dist/styles.css';
import ReactTooltip from "react-tooltip";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import CheckIcon from '@mui/icons-material/Check';
import Shift from '@/view/components/stats/shift';
import { ShareList } from '../components/common/shareButtons';
import bpiCalcuator from '@/components/bpi';
import { httpsCfGet } from '@/components/firebase';
import ThumbsUpDownIcon from '@mui/icons-material/ThumbsUpDown';
import StarHalfIcon from '@mui/icons-material/StarHalf';

interface S {
  userName: string,
  processing: boolean,
  add: boolean,
  currentView: number,
  message: string,
  showSnackBar: boolean,
  res: any,
  uid: string,
  alternativeId: string,
  myDisplayName: string,
  rivalData: rivalScoreData[],
  rivalUids: string[],
  loadingRecommended: boolean,
  recommendUsers: rivalStoreData[],
  totalBPI: number,
  counts: {
    loading: boolean,
    followers: string[],
    followings: string[],
  },
  limited: boolean,
  myId: string,
  rivalStat: withRivalData[],
  radar: radarData[],
  index: number,
  heatmap: any[],
  currentTab: number
}

class User extends React.Component<{ intl: any, currentUserName?: string, limited?: boolean, exact?: boolean, updateName?: (name: string) => void, initialView?: number } & RouteComponentProps, S> {
  private fbA: fbActions = new fbActions();
  private fbStores: fbActions = new fbActions();
  private rivalListsDB = new rivalListsDB();

  private userStore = new getUserData();

  constructor(props: { intl: any, currentUserName?: string, limited?: boolean, exact?: boolean, updateName?: (name: string) => void, initialView?: number } & RouteComponentProps) {
    super(props);
    const search = new URLSearchParams(props.location.search);
    const initialView = search.get("init");
    const params = (props.match.params as any);
    this.fbA.v2SetUserCollection();
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
    this.state = {
      userName: props.currentUserName || params.uid || "",
      processing: true,
      add: false,
      currentView: props.initialView ? props.initialView : initialView ? 1 : 0,
      message: "",
      alternativeId: "",
      myDisplayName: "",
      showSnackBar: false,
      res: null,
      uid: "",
      rivalData: [],
      rivalUids: [],
      loadingRecommended: true,
      recommendUsers: [],
      totalBPI: NaN,
      counts: {
        loading: true,
        followers: [],
        followings: [],
      },
      limited: props.limited || false,
      myId: "",
      rivalStat: [],
      radar: [],
      heatmap: [],
      index: 0,
      currentTab: 0,
    }
  }

  handleChangeTab = (_e: any, newTab: number) => {
    return this.setState({ currentTab: newTab })
  }

  async componentDidMount() {
    if (!this.state.userName) {
      this.fbA.auth().onAuthStateChanged(async (user: any) => {
        if (user) {
          const t = await this.fbA.setDocName(user.uid).load();
          this.setState({
            alternativeId: (t && t.displayName) ? t.displayName : "",
            myDisplayName: (t && t.displayName) ? t.displayName : "",
            processing: false,
          });
        } else {
          this.setState({
            processing: false,
          })
        }
      });
    } else {
      this.fbA.auth().onAuthStateChanged(async (user: any) => {
        if (user) {
          const t = await this.fbA.setDocName(user.uid).load();
          this.setState({
            myDisplayName: (t && t.displayName) ? t.displayName : "",
            myId: user ? user.uid : ""
          });
        }
      });
      await this.search();
      this.recommended();
    }
  }

  backToMainPage = () => this.setState({ currentView: 0 });
  toggleSnack = async (message: string = "ライバルを追加しました") => this.setState({
    add: false,
    message: message,
    showSnackBar: !this.state.showSnackBar,
    rivalUids: await this.rivalListsDB.getAllRivalUid()
  });

  search = async (forceUserName?: string): Promise<void> => {

    let { userName } = this.state;
    const exactId = (this.props.match.params as any).exactId || this.props.exact;

    if (forceUserName) {
      userName = forceUserName;
    }

    this.setState({ processing: true });
    const res = (exactId && userName === "_") ? await this.fbA.searchByExactId(exactId) : (exactId && !forceUserName) ? await this.fbA.searchByExactId(userName) : await this.fbA.searchRival(userName);
    if (res) {

      if (exactId) {
        userName = res.displayName;
        if (!this.props.exact) {
          this.props.history.replace("/u/" + userName);
        } else {
          if (this.props.updateName) this.props.updateName(userName);
        }

      }

      if (res.isPublic === false) {
        return this.setState({ userName: "", res: null });
      }

      const scores = await this.userStore.rivalScores(res);
      const totalBPI = (res.totalBPIs && res.totalBPIs[_currentStore()]) ? res.totalBPIs[_currentStore()] : "-";
      const rivalStat = await makeRivalStat(scores, true);

      this.countAsync(res.uid);
      return this.setState({
        userName: userName, res: res, uid: res.uid,
        rivalData: scores,
        totalBPI: totalBPI,
        rivalUids: await this.rivalListsDB.getAllRivalUid(),
        rivalStat: rivalStat,
        heatmap: makeHeatmap(this.userStore.scoreHistory()),
        radar: await getRadar(rivalStat),
      });
    } else {
      return this.setState({ userName: "", res: null, uid: "" });
    }
  }

  countAsync = async (uid: string) => {
    const er = await this.counts(0, uid);
    const ing = await this.counts(1, uid);
    const ids = (p: any): string[] => {
      try {
        return p.reduce((groups: string[], item: any) => {
          if (!groups) groups = [];
          const id = item["_path"]["segments"][1] || null;
          if (id) {
            groups.push(id);
          }
          return groups;
        }, []);
      } catch (e: any) {
        return [];
      }
    }
    if (!er || !ing) { return this.setState({ counts: { loading: false, followers: [], followings: [] } }); }
    return this.setState({
      counts: {
        loading: false,
        followers: ids(er.body),
        followings: ids(ing.body),
      },
    });
  }

  counts = async (type: number = 0, id: string): Promise<any> => {
    try {
      return (await httpsCfGet(type === 0 ? `getFollowersCnt` : `getFollowingsCnt`,
        `targetId=${id}&version=${_currentStore()}`
      ))
    } catch (e: any) {
      console.log(e);
      return (null);
    }
  }

  recommended = async (): Promise<void> => {
    try {
      const { totalBPI, res } = this.state;
      const recommend: rivalStoreData[] = (await this.fbA.recommendedByBPI(totalBPI)).filter((item:rivalStoreData) => item.displayName !== res.displayName);
      return this.setState({ loadingRecommended: false, recommendUsers: recommend, processing: false });
    } catch (e: any) {
      console.log(e);
      return this.setState({ loadingRecommended: false, recommendUsers: [], processing: false });
    }
  }

  getIIDXId = (input: string) => {
    const match = input.match(/\d{4}(-|)\d{4}/);
    return match ? match[0].replace(/[^\d]/g, "") : "";
  }

  addUser = async (): Promise<void> => {
    this.setState({ add: true });
    const { res, uid } = this.state;
    const data = await this.fbStores.setDocName(uid).load();
    const rivalLen = await this.rivalListsDB.getRivalLength();
    if (rivalLen >= 10) {
      return this.toggleSnack(`ライバル登録数が上限を超えています。`);
    }
    if (!data || data.length === 0) {
      this.toggleSnack("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。");
      return this.setState({ add: false });
    }
    const putResult = await this.rivalListsDB.addUser({
      rivalName: res.displayName,
      uid: res.uid,
      photoURL: res.photoURL,
      profile: res.profile,
      updatedAt: res.timeStamp,
      lastUpdatedAt: res.timeStamp,
      isSingle: _isSingle(),
      storedAt: _currentStore(),
    }, data.scores);
    await this.fbA.syncUploadOne(res.uid, this.state.myDisplayName);
    if (!putResult) {
      return this.setState({
        message: "追加に失敗しました",
        add: false
      });
    }
    this.toggleSnack();
    return;
  }

  view = async (v: number): Promise<void> => {
    const data = this.userStore.score();
    if (!data || data.length === 0) {
      return this.toggleSnack("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。");
    }
    this.setState({
      currentView: v,
      rivalData: data
    })
  }

  color = (rank: string) => {
    return arenaRankColor(rank);
  }

  handleChangeIndex = (index: number) => {
    this.setState({
      index,
    });
  };

  tabClasses = (num: number) => {
    if (this.state.index === num) {
      return "swipeableContentTab active";
    }
    return "swipeableContentTab";
  }

  showBPIMRanks = () => {
    if (this.state.uid) {
      window.open("https://rank.poyashi.me/user/" + this.state.uid + "/" + _currentStore());
    } else {
      return alert("UserID cannot be determined");
    }
  }

  render() {
    const { processing, add, myId, userName, res, uid, message, showSnackBar, currentView, rivalData, alternativeId, totalBPI, loadingRecommended, recommendUsers, counts, limited, rivalStat, heatmap, currentTab } = this.state;
    const isAdded = this.state.rivalUids.indexOf(uid) > -1;
    const c = _currentTheme();

    if (processing) {
      return (<Loader text="ユーザーを読込中" isFull />);
    }
    if (!userName || !res) {
      return <NoUserError match={this.props.match} alternativeId={alternativeId} />;
    }

    if (currentView === 1) {
      //スコア一覧
      return (
        <RivalView toggleSnack={this.toggleSnack} backToMainPage={this.backToMainPage} showAllScore={true}
          rivalData={uid} rivalMeta={res} descendingRivalData={rivalData} isNotRival={true} />
      )
    }
    if (currentView === 2) {
      //AAA達成表
      return (
        <Container fixed className="commonLayout">
          <ClearLampView backToMainPage={this.backToMainPage}
            name={res.displayName} data={rivalData} />
        </Container>
      )
    }
    if (currentView === 3) {
      //ノート一覧
      return (
        <Container fixed className="commonLayout">
          <NotesView backToMainPage={this.backToMainPage}
            name={res.displayName} uid={uid} />
        </Container>
      )
    }
    if (currentView === 5) {
      //IR参加履歴
      return (
        <WeeklyList viewInUser backToMainPage={this.backToMainPage} uid={uid} name={res.displayName} />
      )
    }

    const buttons = [
      { icon: <ViewListIcon />, primary: "スコア比較", secondary: (res.displayName) + "さんと自分のスコアを比較します", onClick: () => this.view(1) },
      { icon: <WbIncandescentIcon />, primary: "AAA達成表", secondary: "BPIに基づいたAAA達成難易度表を表示します", onClick: () => this.view(2) },
      { icon: <StarHalfIcon />, primary: "BPIMRanks (外部サイト)", secondary: "BPIManager ユーザー内での順位を表示します", onClick: () => this.showBPIMRanks() },
      { icon: <EventNoteIcon />, primary: "ランキング", secondary: "ランキング参加履歴を表示します", onClick: () => this.view(5) },
    ]
    buttons.push({ icon: <CommentIcon />, primary: "投稿ノート一覧", secondary: (res.displayName) + "さんが投稿した攻略情報一覧", onClick: () => this.view(3) });

    const themeColor = _currentTheme();
    const url = config.baseUrl + "/u/" + encodeURI(userName);
    const totalRank = new bpiCalcuator().rank(totalBPI, false);
    const rankPer = Math.round(totalRank / new bpiCalcuator().getTotalKaidens() * 1000000) / 10000;

    return (
      <React.Fragment>
        <Helmet>
          <meta name="description"
            content={`${res.displayName}さんのbeatmaniaIIDX スコアデータを閲覧できます。総合BPI:${totalBPI},アリーナランク:${res.arenaRank || "登録なし"}。${res.profile}`}
          />
        </Helmet>
        <div style={{ background: `url("/images/background/${themeColor}.svg")`, backgroundSize: "cover", width: "100%" }}>
          <div style={{ background: themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)", display: "flex", padding: "5vh 0", alignItems: "center", justifyContent: "center", width: "100%" }}>
            <div style={{ color: themeColor === "light" ? "#222" : "#fff", width: "90%" }}>
              <div>
                <Grid container alignItems="center">
                  <Grid item xs={4} lg={4} style={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                    <Avatar style={{ border: "1px solid #222", margin: "15px auto" }} className="userpageIcon">
                      <img src={res.photoURL ? res.photoURL.replace("_normal", "") : "noimage"} style={{ width: "100%", height: "100%" }}
                        alt={res.displayName}
                        onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(res) || alternativeImg(res.displayName)} />
                    </Avatar>
                  </Grid>
                  <Grid item xs={8} lg={8} style={{ paddingLeft: "15px" }}>
                    <Typography variant="h4" style={{ overflow: "hidden" }}>
                      {res.displayName}
                    </Typography>
                    <div style={{ display: "flex" }}>
                      {(res.iidxId || this.getIIDXId(res.profile) !== "") &&
                        <form method="post" name="rivalSearch" action={`https://p.eagate.573.jp/game/2dx/${_currentStore()}/rival/rival_search.html#rivalsearch`}>
                          <input type="hidden" name="iidxid" value={this.getIIDXId(res.profile)} />
                          <input type="hidden" name="mode" value="1" />
                          <Button color="secondary" size="small" type="submit" startIcon={<ExitToAppIcon />}>
                            IIDX公式
                        </Button>
                        </form>
                      }
                      {(res.twitter || getTwitterName(res.profile) !== "") &&
                        <Button color="secondary" size="small" onClick={() => window.open(`https://twitter.com/${res.twitter || getTwitterName(res.profile)}`)} startIcon={<TwitterIcon />}>
                          Twitter
                      </Button>
                      }
                    </div>
                    {counts.loading && (
                      <Typography component="span" variant="caption" color="textSecondary" style={{ fontWeight: "bold" }}>
                        Rivals Loading...
                    </Typography>
                    )}
                    {!counts.loading && (
                      <React.Fragment>
                        <FolloweeCounter ids={counts.followings} text="ライバル" userName={res.displayName} />&nbsp;
                      <FolloweeCounter ids={counts.followers} text="逆ライバル" userName={res.displayName} />
                      </React.Fragment>
                    )}
                  </Grid>
                </Grid>
                <Divider style={{ margin: "1px 0" }} />
                <div style={{ margin: "10px 8px 15px" }}>
                  <Typography variant="caption" gutterBottom>
                    {res.profile}
                  </Typography>
                  <Typography variant="caption" component="p" gutterBottom style={{ color: themeColor === "light" ? "#888" : "#aaa" }}>
                    最終更新:{res.timeStamp}
                  </Typography>
                </div>
                <Grid container style={{ fontWeight: "bold", textAlign: "center" }}>
                  <Grid item xs={6} style={{ borderBottom: "2px solid " + this.color(res.arenaRank), color: themeColor === "light" ? "#000 " : "#fff", padding: "4px 0" }}>
                    <span style={{ fontSize: "6px" }}>アリーナランク</span><br />
                    {res.arenaRank || "-"}
                  </Grid>
                  <Grid item xs={6} style={{ borderBottom: "2px solid " + bgColorByBPI(totalBPI), color: themeColor === "light" ? "#000 " : "#fff", padding: "4px 0" }}>
                    <span style={{ fontSize: "6px" }}>総合BPI</span><br />
                    {String(Number.isNaN(totalBPI) ? "-" : totalBPI)}
                  </Grid>
                </Grid>
                {!isAdded && (
                  <Fab size="small" color="secondary" variant="extended" onClick={() => this.addUser()} disabled={myId === res.uid || add || processing} style={{ marginTop: "15px", width: "100%", fontWeight: "bold", fontSize: "12px" }}>
                    <GroupAddIcon style={{ fontSize: "20px" }} />
                    <span>ライバルとして追加</span>
                  </Fab>
                )}
                {isAdded && (
                  <Fab size="small" color="secondary" variant="extended" disabled={true} style={{ marginTop: "15px", width: "100%", fontWeight: "bold", fontSize: "12px" }}>
                    <CheckIcon style={{ fontSize: "20px" }} />
                    <span>ライバルです!</span>
                  </Fab>
                )}
              </div>
            </div>
          </div>
        </div>
        {(!res.totalBPIs || (res.totalBPIs && !res.totalBPIs[_currentStore()])) && (
          <Alert severity="warning">
            このユーザーは現在設定中のバージョン({_currentStore()})でスコアを登録していません。<br />
            <RefLink to={"/settings"} style={{ textDecoration: "none" }}><Link color="secondary" component="span">設定</Link></RefLink>からほかのバージョンを指定の上、再度表示してください。
          </Alert>
        )}
        <div className={"userTabs " + themeColor}>
          <Tabs
            value={currentTab}
            onChange={this.handleChangeTab}
            indicatorColor="secondary"
            textColor="secondary"
            variant="fullWidth"
            centered
          >
            <Tab icon={<ClearAllIcon />} />
            <Tab icon={<ThumbsUpDownIcon />} />
            <Tab icon={<TrendingUpIcon />} />
            <Tab icon={<RecentActorsIcon />} />
          </Tabs>
        </div>
        <section className={"keeperTriangle " + themeColor}></section>
        {currentTab === 0 && (
          <React.Fragment>
            <List>
              {buttons.map((item, i) => {
                return (
                  <DefListCard key={i} onAction={item.onClick} disabled={add || processing} icon={item.icon}
                    primaryText={item.primary} secondaryText={item.secondary} />
                )
              })
              }
            </List>
            <ShareList withTitle={true} url={url} text={res.displayName + " 総合BPI:" + String(Number.isNaN(totalBPI) ? "-" : totalBPI) + `(推定順位:${totalRank}位,皆伝上位${rankPer}%)`} />
            <TextField
              label="プロフィールURL"
              size="small"
              style={{ width: "95%", margin: "0 auto 20px auto", display: "flex" }}
              defaultValue={url}
              variant="standard"
              fullWidth
              InputProps={{
                readOnly: true,
              }}
            />
          </React.Fragment>
        )}
        {currentTab === 1 && (
          <div>
            <Container className={"commonLayout " + (c === "dark" ? "darkTheme" : c === "light" ? "lightTheme" : "deepSeaTheme")}>
              <Typography component="h5" variant="h5" color="textPrimary" className="typographTitle">ライバルとの比較</Typography>
              <Alert severity="info" style={{ margin: "20px 0" }}>
                「スコア勝敗」「クリア勝敗」は、グラフ左から順に、「ライバルの勝利数」「引き分け」「あなたの勝利数」を表しています。
              </Alert>
            </Container>
            <RivalStatViewFromUserPage full={rivalStat} rivalRawData={rivalData} backToMainPage={this.backToMainPage} name={res.displayName} />
          </div>
        )}
        {currentTab === 2 && (
          <div>
            <Container className={"commonLayout " + (c === "dark" ? "darkTheme" : c === "light" ? "lightTheme" : "deepSeaTheme")}>
              <Typography component="h5" variant="h5" color="textPrimary" className="typographTitle">ライバルの統計</Typography>
              <Typography component="h6" variant="h6" color="textPrimary">
                スコア更新ヒートマップ
              </Typography>
            </Container>
            <Container style={{ display: "flex", justifyContent: "center" }} className={"commonLayout " + (c === "dark" ? "darkTheme" : c === "light" ? "lightTheme" : "deepSeaTheme")}>
              <CalendarHeatmap
                startDate={toDate(subtract(6, "month"))}
                endDate={new Date()}
                values={heatmap}
                showWeekdayLabels
                classForValue={(value) => colorClassifier(value)}
                onClick={value => console.log(value)}
                tooltipDataAttrs={(value: any) => {
                  if (!value || !value.date) {
                    return null;
                  }
                  return {
                    "data-tip": `${value.date}:${value.count}件`,
                  };
                }}
              />
              <ReactTooltip />
            </Container>
            <Container className={"commonLayout"}>
              <Alert severity="info" style={{ margin: "0 0 20px 0" }}>
                日ごとのスコア/クリアランプ更新件数の合計をカレンダー形式で表示します。色が明るいほど、更新件数が多いことを示しています。
              </Alert>
              <Typography component="h6" variant="h6" color="textPrimary">推移グラフ</Typography>
            </Container>
            <Shift propdata={this.userStore.scoreHistory()} />
          </div>
        )}
        {(currentTab === 3 && loadingRecommended) && <Loader />}
        {(currentTab === 3 && !loadingRecommended) && (
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-around", margin: "0 auto 15px auto", width: "100%" }}>
            <Container className={"commonLayout " + (c === "dark" ? "darkTheme" : c === "light" ? "lightTheme" : "deepSeaTheme")}>
              <Typography component="h5" variant="h5" color="textPrimary" className="typographTitle">実力が近いユーザー</Typography>
            </Container>
            <ImageList style={{ height: "400px", width: "100%" }}>
              {recommendUsers.map((tile: rivalStoreData) => (
                <ImageListItem key={tile.displayName} onClick={async () => {
                  if (!limited) {
                    this.props.history.replace("/u/" + tile.displayName);
                  } else {
                    if (this.props.updateName) {
                      this.props.updateName(tile.displayName);
                    }
                  }
                  this.setState({ userName: tile.displayName, processing: true, loadingRecommended: true, currentTab: 0 });
                  await this.search(tile.displayName);
                  this.recommended();
                }}>
                  <img src={tile.photoURL.replace("_normal", "")} alt={tile.displayName}
                    onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(tile) || alternativeImg(tile.displayName)} />
                  <ImageListItemBar
                    title={tile.displayName}
                    subtitle={"総合BPI " + String(tile.totalBPI || "-")}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </div>
        )}
        <ShowSnackBar message={message} variant={message === "ライバルを追加しました" ? "success" : "error"}
          handleClose={this.toggleSnack} open={showSnackBar} autoHideDuration={3000} />
      </React.Fragment>
    );
  }
}

export default injectIntl(withRouter(User));

class NoUserError extends React.Component<{ match: any, alternativeId: string }, {}>{
  render() {
    const { match, alternativeId } = this.props;
    return (
      <Container fixed className="commonLayout">
        <Paper>
          <div style={{ textAlign: "center", padding: "15px" }}>
            <WarningIcon style={{ color: "#555", fontSize: "45px" }} />
            <Typography variant="h4" gutterBottom>
              Error!
            </Typography>
            <Typography variant="body2" gutterBottom>
              指定されたユーザーは見つかりませんでした<br />
              プロフィールが非公開か、表示名が変更された可能性があります。<br /><br />
              自分のデータを閲覧しようとしてこのページが表示されている場合、Syncからプロフィールを公開に設定する必要があります。<br />
              <RefLink to={"/sync/settings"} style={{ textDecoration: "none" }}><Link color="secondary" component="span">こちらのページ</Link></RefLink>から「プロフィールを一般公開」にチェックを入れてください。
            </Typography>
            {(!(match.params as any).uid && alternativeId) &&
              <Typography variant="body2" gutterBottom>
                あなたのプロフィールは<br />
                <RefLink to={"/u/" + alternativeId} style={{ textDecoration: "none" }}><Link color="secondary" component="span">{config.baseUrl}/u/{alternativeId}</Link></RefLink><br />
                から閲覧できます
            </Typography>
            }
          </div>
        </Paper>
      </Container>
    );
  }
}

export class DefListCard extends React.Component<{
  onAction: () => any,
  disabled: boolean,
  primaryText: string,
  secondaryText: string,
  icon: JSX.Element,
}, {}>{

  render() {
    const { icon, onAction, disabled, primaryText, secondaryText } = this.props;
    return (
      <ListItem button onClick={onAction} disabled={disabled}>
        <ListItemAvatar>
          <Avatar style={{ background: avatarBgColor, color: avatarFontColor }}>
            {icon}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={primaryText} secondary={secondaryText} />
        <ListItemSecondaryAction onClick={onAction}>
          <IconButton edge="end" size="large">
            <ArrowForwardIosIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}
