import React from 'react';
import Loader from '@/view/components/common/loader';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import fbArenaMatch from "@/components/firebase/arenaMatch";
import fbActions from "@/components/firebase/actions";
import {
  DocumentData, Unsubscribe
} from "firebase/firestore";
import { _currentStore, _currentTheme } from '@/components/settings';
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import { alternativeImg } from "@/components/common";
import { getAltTwitterIcon } from "@/components/rivals";
import Chat from "@/view/components/arenaMatch/chat";
import Settings from "@/view/components/arenaMatch/settings";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Alert from "@mui/material/Alert";
import { isBeforeSpecificDate } from "@/components/common/timeFormatter";
import ModalUser from '@/view/components/rivals/modal';

interface S {
  isLoading: boolean,
  detail: any,
  uid: string,
  tab: number,
  user: any,
  isModalOpen: boolean,
  currentUserName: string,
}

class Index extends React.Component<{} & RouteComponentProps, S> {

  unsubscribe: Unsubscribe | null = null;

  constructor(props: {} & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      detail: null,
      uid: "",
      tab: 0,
      isModalOpen: false,
      currentUserName: "",
      user: null
    }
  }

  async componentDidMount() {

    const fbA = new fbActions();
    const user = fbA.authInfo();
    if (!user || !user.uid) {
      this.setState({ isLoading: false, uid: "", user: null });
    } else {

      const userData = await fbA.setDocName(user.uid).getSelfUserData()
      if (userData.exists()) {
        this.setState({
          isLoading: false,
          user: userData.data(),
          uid: user ? user.uid : "",
        });
      }

    }

    const f = new fbArenaMatch();
    this.unsubscribe = f.listenDetail(
      (this.props.match.params as any).docId || "",
      this.watch
    );
  }

  watch = (snapshot: DocumentData) => {
    return this.setState({ detail: snapshot.data() });
  }


  handleChangeTab = (_event: React.SyntheticEvent, newValue: number) => {
    this.setState({ tab: newValue });
  };

  handleModalOpen = (flag: boolean) => this.setState({ isModalOpen: flag });
  open = (uid: string) => {
    this.setState({ isModalOpen: true, currentUserName: uid })
  }

  render() {
    const { isLoading, detail, tab, uid, user, isModalOpen, currentUserName } = this.state;
    const themeColor = _currentTheme();
    if (isLoading || !detail) {
      return (<Loader />);
    }
    return (
      <React.Fragment>
        <div style={{ background: `url("/images/background/${themeColor}.svg")`, backgroundSize: "cover" }} id="mxHeaderBox">
          <div style={{ background: themeColor === "light" ? "transparent" : "rgba(0,0,0,0)", display: "flex", padding: "2vh 0", width: "100%", height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <Typography variant="h5">
              {detail.title}
            </Typography>
            {detail.description && <span style={{ margin: "8px 0", display: "block" }}> {detail.description}</span>}
            <div style={{ display: "flex", alignItems: "center", marginTop: 0 }} onClick={() => this.open(detail.admin.displayName)}>
              <Chip
                avatar={(
                  <Avatar>
                    <img src={detail.admin.photoURL ? detail.admin.photoURL : "noimg"} style={{ width: "100%", height: "100%" }}
                      alt={detail.admin.displayName}
                      onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(detail.admin, false, "normal") || alternativeImg(detail.admin.displayName)} />
                  </Avatar>
                )}
                component="span"
                label={detail.admin.displayName}
                style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0, borderRight: 0 }}
              />
              <Chip
                component="span" style={{ borderRadius: 0, margin: "5px 0" }}
                label={"アリーナ" + (detail.admin.arenaRank || "-")} />
              {(!isNaN(detail.admin.totalBPI)) && (
                <Chip
                  component="span"
                  label={"総合BPI: " + (detail.admin.totalBPIs ? detail.admin.totalBPIs[_currentStore()] : detail.admin.totalBPI)}
                  style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                />
              )}
            </div>
          </div>
        </div>
        {detail.startAt && <Timer timer={detail.startAt} />}
        <Tabs value={tab} onChange={this.handleChangeTab} variant="fullWidth"
          id="mxTabBox"
          indicatorColor="secondary"
          textColor="secondary">
          <Tab label="チャット" />
          <Tab label="ルーム設定" disabled={detail.admin.uid !== uid} />
        </Tabs>
        <div style={{ display: tab === 0 ? "block" : "none" }}>
          <Chat user={user} detail={detail} id={detail.matchId} />
        </div>
        {tab === 1 && <Settings user={user} meta={detail} />}
        {isModalOpen && <ModalUser isOpen={isModalOpen} currentUserName={currentUserName} handleOpen={(flag: boolean) => this.handleModalOpen(flag)} />}
      </React.Fragment>
    );
  }
}

class Timer extends React.Component<{ timer: any }, {
  latency: number
}>{

  state = { latency: 0 }

  intv: any = null;

  timerCount = () => {
    const { latency } = this.state;
    const p = window.document.getElementById("timerCount");
    const full = this.props.timer.toMillis() - new Date().getTime() - latency;
    const seconds = Math.round(full * 100) / 100;
    if (!p) return;
    if (seconds < 0) {
      p.innerHTML = "あと0.00秒 - アリーナモードに参加して下さい";
      clearInterval(this.intv);
      return;
    }
    p.innerHTML = `あと${(seconds / 1000).toFixed(2)}秒でアリーナモードに参加します`;
  }

  componentWillUnmount() {
    clearInterval(this.intv);
  }

  componentDidMount() {
    const isBefore = isBeforeSpecificDate(new Date(), this.props.timer.toDate());
    this.setLatency();
    if (isBefore) {
      this.intv = setInterval(this.timerCount, 10);
    } else {
      const p = window.document.getElementById("timerCount");
      if (!p) return;
      p.innerHTML = "あと0.00秒 - 参加して下さい";
    }
  }

  setLatency = async () => {
    const sendTime = new Date().getTime();
    const f = await fetch("http://worldtimeapi.org/api/timezone/Asia/Tokyo");
    const timeobj = await f.json();
    const endTime = new Date().getTime();
    const fixedTime = parseInt(String(timeobj.unixtime * 1000 + (endTime - sendTime) / 2), 10);
    const localTime = new Date().getTime()
    const offset = fixedTime - localTime;
    this.setState({ latency: offset });
  }

  UNSAFE_componentWillUpdate(props: any) {
    clearInterval(this.intv);
    const isBefore = isBeforeSpecificDate(new Date(), props.timer.toDate())
    if (isBefore) {
      this.intv = setInterval(this.timerCount, 10);
    } else {
      clearInterval(this.intv);
    }
  }

  render() {
    if (!this.props.timer || !this.props.timer.toDate) return;
    return (
      <Alert severity="warning" icon={false}>
        <p style={{ margin: 0, fontWeight: "bold", textAlign: "center" }} id="timerCount"></p>
      </Alert>
    );

  }
}

export default withRouter(Index);
