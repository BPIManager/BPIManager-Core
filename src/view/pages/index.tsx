import React from "react";
import Button from "@mui/material/Button";
import { withRouter, RouteComponentProps, Link } from "react-router-dom";
import { Link as RefLink, Avatar, Grid, Typography, Container, CircularProgress } from "@mui/material/";
import { _currentTheme, _currentQuickAccessComponents } from "@/components/settings";
import Loader from "@/view/components/common/loader";
import { Helmet } from "react-helmet";
import { getAltTwitterIcon } from "@/components/rivals";
import TimelineIcon from "@mui/icons-material/Timeline";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { FormattedMessage } from "react-intl";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import { named, getTable, CLBody } from "@/components/aaaDiff/data";
import fbActions from "@/components/firebase/actions";
import { scoresDB } from "@/components/indexedDB";
import { scoreData } from "@/types/data";
import { isSameWeek } from "@/components/common/timeFormatter";
import { quickAccessTable } from "@/components/common/quickAccess";
import AppsIcon from "@mui/icons-material/Apps";
import totalBPI from "@/components/bpi/totalBPI";
import SubHeader from "@/view/components/topPage/subHeader";
import ArenaMatch from "@/view/components/topPage/arenaMatch";
import RecentUsers from "../components/topPage/recentUsers";
import { BeginnerAlert, InstallAlert } from "../components/topPage/alerts";
import UpdateDef from "../components/topPage/updateDef";
import { UserIcon } from "../components/common/icon";

class Index extends React.Component<
  { global: any } & RouteComponentProps,
  {
    user: any;
    totalBPI: number;
    lastWeekUpdates: number;
    remains: number;
    auth: any;
    isLoading: boolean;
    userLoading: boolean;
  }
> {
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
    };
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
      isLoading: false,
    });
    return;
  }

  QAindexOf = (needle: string) => {
    const str = _currentQuickAccessComponents();
    return str.indexOf(needle) > -1;
  };

  render() {
    const themeColor = _currentTheme();
    const { user, auth, isLoading, userLoading } = this.state;
    const xs = 12,
      sm = 12,
      md = 3,
      lg = 3;

    const ListItem = (icon: any, text: string, data: string | number, target: string, targetText: string) => (
      <Grid item xs={xs} sm={sm} md={md} lg={lg}>
        <SubHeader icon={icon} text={<FormattedMessage id={text} />} />
        {isLoading && <Loader />}
        {!isLoading && (
          <Grid container alignItems="center">
            <Grid item xs={6}>
              <Typography color="textSecondary" variant="h4">
                {data}
              </Typography>
            </Grid>
            <Grid item xs={6} style={{ display: "flex", justifyContent: "flex-end" }}>
              <Button size="small" onClick={() => this.props.history.push(target)}>
                <FormattedMessage id={targetText} />
              </Button>
            </Grid>
          </Grid>
        )}
      </Grid>
    );

    return (
      <div>
        <Helmet>
          <meta name="description" content="beatmania IIDXのスコアをBPIという指標を用いて管理したり、ライバルとスコアを競ったりできるツールです。" />
        </Helmet>
        <div
          style={{
            background: `url("/images/background/${themeColor}.svg")`,
            backgroundSize: "cover",
          }}
        >
          <div
            style={{
              background: themeColor === "light" ? "transparent" : "rgba(0,0,0,0)",
              display: "flex",
              padding: ".5vh 0",
              width: "100%",
              height: "100%",
            }}
          >
            {userLoading && (
              <Container className="topMenuContainer">
                <Grid container alignContent="space-between" alignItems="center" style={{ padding: "20px" }}>
                  <Grid
                    item
                    xs={3}
                    lg={3}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Container fixed className={"loaderCenteredOnly"} style={{ maxWidth: "100%" }}>
                      <CircularProgress color="secondary" size={64} />
                    </Container>
                  </Grid>
                  <Grid item xs={9} lg={9}>
                    <Typography variant="body1">&nbsp;</Typography>
                    <Typography variant="body1">&nbsp;</Typography>
                  </Grid>
                </Grid>
              </Container>
            )}
            {!userLoading && auth && user && (
              <Container className="topMenuContainer">
                <Grid container justifyContent="space-between" alignItems="center" style={{ padding: "20px" }}>
                  <Grid
                    item
                    xs={3}
                    lg={3}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                    onClick={() => this.props.history.push("/u/" + user.displayName)}
                  >
                    <UserIcon _legacy disableZoom className="toppageIcon" defaultURL={user.photoURL.replace("_normal", "")} text={user.displayName} altURL={getAltTwitterIcon(user, false, "normal")} />
                  </Grid>
                  <Grid item xs={8} lg={8} style={{ paddingLeft: "30px" }}>
                    <Typography variant="body1">{user.displayName}</Typography>
                    <Typography variant="body1">
                      <Link to={"/sync/settings"}>
                        <RefLink color="secondary" component="span">
                          <FormattedMessage id="Index.EditProfile" />
                        </RefLink>
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Container>
            )}
            {!userLoading && (!auth || !user) && (
              <Container className="topMenuContainer">
                <Grid container justifyContent="space-between" alignItems="center" style={{ padding: "20px" }}>
                  <Grid
                    item
                    xs={3}
                    lg={3}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      flexDirection: "column",
                    }}
                  >
                    <Avatar style={{ border: "1px solid #222", margin: "15px auto" }} className="toppageIcon"></Avatar>
                  </Grid>
                  <Grid item xs={8} lg={8} style={{ paddingLeft: "15px" }}>
                    <Typography variant="body1">
                      <FormattedMessage id="Index.NotLoggedIn" />
                    </Typography>
                    <Typography variant="body1">
                      <Link to="/sync/settings">
                        <RefLink color="secondary" component="span">
                          <FormattedMessage id="Index.SignIn" />
                        </RefLink>
                      </Link>
                    </Typography>
                  </Grid>
                </Grid>
              </Container>
            )}
          </div>
        </div>
        <Container className="topMenuContainer">
          {!userLoading && (!auth || !user) && <BeginnerAlert />}
          <InstallAlert global={this.props.global} />
          <UpdateDef />
        </Container>
        <Container style={{ paddingTop: 15 }} className="topMenuContainer">
          <Grid item xs={12} sm={12} md={12} lg={12}>
            <div className="TypographywithIconAndLinesContainer">
              <div className="TypographywithIconAndLinesInner">
                <Typography color="textSecondary" gutterBottom className="TypographywithIconAndLines">
                  <MenuOpenIcon />
                  &nbsp;
                  <FormattedMessage id="Index.QuickAccess" />
                </Typography>
              </div>
            </div>
            <div style={{ overflowX: "scroll" }} className="topMenuScrollableWrapper">
              <Grid container direction="row" wrap="nowrap" alignItems="center" style={{ width: "100%", margin: "20px 0 0 0" }} className="topMenuContaienrGridWrapper">
                {quickAccessTable.map((item: any) => {
                  if (!this.QAindexOf(item.com)) return null;
                  return (
                    <Grid container direction="column" alignItems="center" onClick={() => this.props.history.push(item.href)} key={item.name}>
                      {item.icon}
                      <Typography color="textSecondary" variant="caption">
                        {item.name}
                      </Typography>
                    </Grid>
                  );
                })}
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
            <FormattedMessage id="Index.notes1" />
            <br />
            <FormattedMessage id="Index.notes2" />
            <br />
            <FormattedMessage id="Index.notes3" />
            <br />
            <br />
            Made with &hearts; by poyashi.me
            <br />
            Author :{" "}
            <RefLink href="https://twitter.com/210120090722O19" target="_blank" color="secondary">
              @210120090722O19
            </RefLink>
          </small>
        </Container>
      </div>
    );
  }
}

export default withRouter(Index);
