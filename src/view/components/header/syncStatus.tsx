import React from "react";
import fbActions from "@/components/firebase/actions";
import Snackbar from "@mui/material/Snackbar";
import SnackbarContent from "@mui/material/SnackbarContent";
import { _currentStore, _isSingle, _lastSyncDate, _setLastSyncDate } from "@/components/settings";
import { scoresDB } from "@/components/indexedDB";
import { isBeforeSpecificDate } from "@/components/common/timeFormatter";
import { Button } from "@mui/material";
import { RouteComponentProps, withRouter } from "react-router-dom";

class SyncStatus extends React.Component<RouteComponentProps> {
  state = {
    localDate: "",
    remoteDate: "",
    open: false,
  };

  async componentDidMount() {
    if (window.location.pathname.indexOf("sync/settings") > -1) return;
    const f = new fbActions();
    const auth = f.authInfo();
    if (auth && auth.uid) {
      const myId = auth.uid;
      const meta = await f.loadSaveMeta(myId);
      const v = _currentStore() + "_" + _isSingle();
      //リモートデータなし
      if (!meta) return;
      if (!meta[v]) return;

      const s = await new scoresDB().getAll();
      const localDate = _lastSyncDate();
      const remoteDate = meta[v].toDate();
      this.setState({ localDate: localDate, remoteDate: remoteDate });
      if (s.length === 0) {
        return this.setState({ open: true });
      }
      //ローカルデータあり、リモートデータあり
      if (s.length > 0) {
        if (!localDate) {
          return;
        }
        //リモート日付が先
        if (isBeforeSpecificDate(localDate, remoteDate)) {
          return this.setState({ open: true });
        }
      }
      return;
    }
  }

  setLatestDate = () => {
    _setLastSyncDate(this.state.remoteDate);
    this.setState({ open: false });
  };

  check = () => {
    this.props.history.push("/sync/settings");
    this.handleClose();
  };

  handleClose = () => this.setState({ open: false });

  render() {
    const { open } = this.state;
    return (
      <Snackbar className="bottomStickedSnack" style={{ width: "100%", left: 0 }} open={open}>
        <SnackbarContent
          style={{ borderRadius: 0, width: "100%" }}
          message={<React.Fragment>Sync に最新のスコアデータが保管されているようです。端末に同期しますか？</React.Fragment>}
          action={
            <React.Fragment>
              <Button color="secondary" size="small" onClick={this.check}>
                確認
              </Button>
              <Button color="inherit" size="small" onClick={() => this.setLatestDate()}>
                無視
              </Button>
            </React.Fragment>
          }
        />
      </Snackbar>
    );
  }
}

export default withRouter(SyncStatus);
