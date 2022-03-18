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

interface S {
  isLoading: boolean,
  detail: any,
  uid: string,
  tab: number
}

class Index extends React.Component<{} & RouteComponentProps, S> {

  unsubscribe: Unsubscribe | null = null;

  constructor(props: {} & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      detail: null,
      uid: "",
      tab: 0
    }
  }

  async componentDidMount() {
    const authInfo = new fbActions().authInfo();
    this.setState({ isLoading: false, uid: authInfo ? authInfo.uid : "" });
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

  render() {
    const { isLoading, detail, tab, uid } = this.state;
    const themeColor = _currentTheme();

    if (isLoading || !detail) {
      return (<Loader />);
    }
    return (
      <React.Fragment>
        <div style={{ background: `url("/images/background/${themeColor}.svg")`, backgroundSize: "cover" }}>
          <div style={{ background: themeColor === "light" ? "transparent" : "rgba(0,0,0,0)", display: "flex", padding: "2vh 0", width: "100%", height: "100%", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <Typography variant="h5">
              {detail.title}
            </Typography>
            <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
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
            {detail.description && <span style={{ margin: "0", display: "block" }}> {detail.description}</span>}
          </div>
        </div>
        <Tabs value={tab} onChange={this.handleChangeTab} variant="fullWidth"
          indicatorColor="secondary"
          textColor="secondary">
          <Tab label="チャット" />
          <Tab label="ルーム設定" disabled={detail.admin.uid !== uid} />
        </Tabs>
        <div style={{display:tab === 0 ? "block" : "none"}}>
          <Chat id={detail.matchId} />
        </div>
        {tab === 1 && <Settings meta={detail}/>}
      </React.Fragment>
    );
  }
}

export default withRouter(Index);
