import React from "react";
import { withRouter, RouteComponentProps } from "react-router-dom";
import fbArenaMatch from "@/components/firebase/arenaMatch";
import fbActions from "@/components/firebase/actions";
import Snackbar from "@mui/material/Snackbar";
import SnackbarContent from '@mui/material/SnackbarContent';
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import { alternativeImg } from "@/components/common";
import { getAltTwitterIcon } from "@/components/rivals";
import { _foregroundNotification } from '@/components/settings';

import {
  QuerySnapshot, DocumentData, Unsubscribe
} from "firebase/firestore";

class ArenaMatchWatcher extends React.Component<RouteComponentProps, {
  list: any[],
  newMessage: any,
  open: boolean,
  loaded: number,
}>{
  unsubscribe: Unsubscribe | null = null;
  unsubscribeMessages: Unsubscribe[] = [];

  state = {
    list: [] as any[],
    newMessage: null as any,
    open: false,
    loaded: 0,
  }

  async componentDidMount() {
    const f = new fbArenaMatch();
    const auth = new fbActions().authInfo();
    if (auth && auth.uid) {
      const myId = auth.uid;
      this.unsubscribe = f.realtime(await f.getSelfMatches(myId), this.watchList);
    }
  }

  watchList = (snapshot: QuerySnapshot<DocumentData>) => {
    const { list } = this.state;
    const self = this;
    let l:any[] = ([] as any[]).concat(list);
    snapshot.docChanges().forEach((change) => {
      const f = new fbArenaMatch();
      if (change.type === "added") {
        const data = change.doc.data({ serverTimestamps: "estimate" });
        l.push(data);
      } else if (change.type === "removed") {
        const removed = change.doc.data();
        l = list.filter((item) => item.matchId !== removed.matchId);
      }
      self.setState({ list: list });
      for (let i = 0; i < list.length; ++i) {
        self.unsubscribeMessages.push(f.realtime(f.getMessages(list[i].matchId), this.watchMessage));
      }
      return;
    });
  }

  watchMessage = (snapshot: QuerySnapshot<DocumentData>) => {
    //初回ロード時はメッセージを通知しない
    const self = this;
    if (self.state.loaded === 0) return self.setState({ loaded: 1 });
    snapshot.docChanges().forEach((change) => {
      if (!_foregroundNotification()) return;
      const m = change.doc.data({ serverTimestamps: "estimate" });
      if (window.location.href.indexOf(m.matchId) > 0) return;
      return self.setState({
        newMessage: m,
        open: true,
      });
    });
    return;
  }

  handleClose = () => this.setState({ open: false, newMessage: null });

  render() {
    const { newMessage, open } = this.state;
    if (newMessage && window.location.href.indexOf(newMessage.matchId) === -1) {
      return (
        <Snackbar
          style={{ width: "100%", bottom: 0, left: 0 }}
          open={open}
          onClick={() => this.props.history.push("/arena/" + newMessage.matchId)}
          onClose={this.handleClose}
        >
          <SnackbarContent
            style={{ borderRadius: 0 }}
            message={(
              <React.Fragment>
                <Grid container>
                  <Grid item xs={2}>
                    <Avatar>
                      <img src={newMessage.photoURL ? newMessage.photoURL : "noimg"} style={{ width: "100%", height: "100%" }}
                        alt={newMessage.displayName}
                        onError={(e) => (e.target as HTMLImageElement).src = getAltTwitterIcon(newMessage, false, "normal") || alternativeImg(newMessage.displayName)} />
                    </Avatar>
                  </Grid>
                  <Grid item xs={10}>
                    <span style={{ opacity: 0.6 }}>{newMessage.displayName}</span><br />
                    {newMessage.body.length > 20 ? newMessage.body.substr(0, 19) + "..." : newMessage.body}
                  </Grid>
                </Grid>
              </React.Fragment>
            )} />
        </Snackbar>
      )
    }
    return (null);
  }

}

export default withRouter(ArenaMatchWatcher);
