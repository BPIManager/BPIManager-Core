import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import fbActions from '@/components/firebase/actions';
import Typography from '@mui/material/Typography';
import { _currentStore, _isSingle, _autoSync, _setAutoSync } from '@/components/settings';
import ButtonGroup from '@mui/material/ButtonGroup';
import { scoresDB, scoreHistoryDB } from '@/components/indexedDB';
import { CircularProgress } from '@mui/material/';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Divider from "@mui/material/Divider";
import ShowSnackBar from '../snackBar';
import { _pText } from '@/components/settings/updateDef';
import { Grid } from '@mui/material/';
import CheckIcon from '@mui/icons-material/Check';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

class SyncControlScreen extends React.Component<{ userData: any, toggleSending: () => void }, {
  isLoading: boolean,
  scoreData: any,
  sentName: string,
  rivalData: any,
  myName: string,
  myProfile: string,
  nameErrorMessage: string[],
  showNotes: boolean,
  arenaRank: string,
  snack: {
    open: boolean,
    message: string | null
  },
  hideAlert: boolean,
  uploadConfirm: boolean,
  downloadConfirm: boolean
}> {

  ref: React.MutableRefObject<any> | null = null;

  private fbA: fbActions = new fbActions();
  private fbLoader: fbActions = new fbActions();

  constructor(props: { userData: any, toggleSending: () => void }) {
    super(props);
    this.fbLoader.setColName(`${_currentStore()}_${_isSingle()}`).setDocName(props.userData.uid);
    this.fbA.v2SetUserCollection().setDocName(props.userData.uid);
    this.state = {
      isLoading: true,
      scoreData: null,
      rivalData: null,
      myName: "",
      sentName: "",
      myProfile: "",
      arenaRank: "-",
      showNotes: false,
      nameErrorMessage: [],
      snack: {
        open: false,
        message: ""
      },
      hideAlert: false,
      uploadConfirm: false,
      downloadConfirm: false,
    }
  }

  async componentDidMount() {
    const t = await this.fbA.load();
    this.fbLoader.updateProfileIcon();
    this.setState({
      isLoading: false,
      scoreData: await this.fbLoader.load(),
      rivalData: t,
      sentName: t && t.displayName ? t.displayName : "",
      myName: t && t.displayName ? t.displayName : "",
      myProfile: t && t.profile ? t.profile : "",
      arenaRank: t && t.arenaRank ? t.arenaRank : "-",
      showNotes: t && t.showNotes ? t.showNotes : false,
    })
  }

  upload = async () => {
    this.setState({ isLoading: true });
    this.props.toggleSending();
    const res = await this.fbLoader.save(this.state.myName);
    this.props.toggleSending();
    if (res.error) {
      this.toggleErrorSnack(res.reason);
      return this.setState({ isLoading: false });
    }
    this.setState({ isLoading: false, scoreData: await this.fbLoader.load() });
  }

  download = async () => {
    this.setState({ isLoading: true });
    this.props.toggleSending();
    _pText(this.ref, "通信中");
    const res = await this.fbLoader.load();
    if (res === null || res === undefined) {
      this.toggleErrorSnack("エラーが発生しました");
      this.props.toggleSending();
      return this.setState({ isLoading: false });
    }
    await new scoresDB().setDataWithTransaction(res.scores,this.ref);
    await new scoreHistoryDB().setDataWithTransaction(res.scoresHistory);
    await new scoresDB().recalculateBPI([], true,this.ref);
    await new scoreHistoryDB().recalculateBPI([], true,this.ref);
    this.props.toggleSending();
    this.setState({ isLoading: false });
  }

  isOlderVersion = () => {
    const current = _currentStore();
    return ["26", "27", "28"].indexOf(current) > -1;
  }

  handleShowNotes = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ showNotes: e.target.checked });
  }

  toggleErrorSnack = (mes?: string | null) => this.setState({ snack: { open: !this.state.snack.open, message: mes || null } });
  cancelDialog = () => this.setState({ uploadConfirm: false, downloadConfirm: false })

  render() {
    const { isLoading, scoreData, snack, uploadConfirm, downloadConfirm } = this.state;
    const isOlderVersionNotification = () => {
      if (!this.isOlderVersion()) return (null);
      return (
        <React.Fragment>
          <Divider style={{ marginTop: 15 }} />
          <Alert severity="warning" style={{ background: "transparent", border: "none", margin: 0, padding: 0 }}>
            <AlertTitle>アップロードできません</AlertTitle>
            <p>現在選択中のIIDXバージョン({_currentStore()})は過去のバージョンです。<br />
              このバージョンはアーカイブのダウンロードのみ実行可能です。</p>
          </Alert>
        </React.Fragment>
      )
    }
    const isEnableAutoSync = () => {
      const { hideAlert } = this.state;
      if (!_autoSync() && !hideAlert) {
        return (
          <React.Fragment>
            <Divider style={{ marginTop: 15 }} />
            <Alert severity="warning" style={{ background: "transparent", border: "none", margin: 0, padding: 0 }}>
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
          </React.Fragment>
        )
      } else if (hideAlert) {
        return (
          <React.Fragment>
            <Divider style={{ marginTop: 15 }} />
            <Alert severity="success" variant="outlined" style={{ border: "none", margin: 0, padding: 0 }}>
              <AlertTitle>Auto-syncを有効にしました</AlertTitle>
              <p>設定→Auto-syncより、いつでもこの機能を無効にできます。</p>
            </Alert>
          </React.Fragment>
        )
      }
      return (null);
    }
    return (
      <React.Fragment>
        <Grid container alignItems={"center"} style={{ margin: "15px 0" }}>
          <Grid item xs={6}>
            <Typography variant="body1">スコアデータ</Typography>
          </Grid>
          <Grid item xs={6}>
            <ButtonGroup fullWidth color="secondary">
              <Button
                onClick={() => this.setState({ uploadConfirm: true })}
                disabled={isLoading || this.isOlderVersion()}
              >Upload</Button>
              <Button
                onClick={() => this.setState({ downloadConfirm: true })}
                disabled={isLoading}
              >Download</Button>
            </ButtonGroup>
          </Grid>
        </Grid>
        <div style={{ margin: "15px 0" }}>
          {isLoading && (
            <Alert variant="outlined" severity="warning" style={{ borderColor: "#663c0045" }} icon={<CircularProgress color="secondary" />}>
              <FormattedMessage id="Sync.Control.processing" /><br />
              <span ref={this.ref} id="_progressText" />
            </Alert>
          )}
          {(!isLoading && scoreData === null) && (
            <Alert variant="outlined" severity="warning" style={{ borderColor: "#663c0045" }}>
              <FormattedMessage id="Sync.Control.nodata" />
            </Alert>
          )}
          {(!isLoading && scoreData !== null) && (
            <Alert variant="outlined" severity="warning" style={{ borderColor: "#663c0045" }} icon={false}>
              <span id="_progressText" style={{ display: "none" }} />
              最終同期 : {scoreData.timeStamp}<br />
              同期端末 : {scoreData.type ? scoreData.type : "undefined"}
              {isOlderVersionNotification()}
              {isEnableAutoSync()}
            </Alert>
          )}
        </div>
        <ShowSnackBar message={snack.message} variant="warning"
          handleClose={this.toggleErrorSnack} open={snack.open} autoHideDuration={3000} />
        {downloadConfirm && <ConfirmDialog next={this.download} cancel={this.cancelDialog} />}
        {uploadConfirm && <ConfirmDialog next={this.upload} cancel={this.cancelDialog} />}
      </React.Fragment>
    );
  }
}

export default SyncControlScreen;

class ConfirmDialog extends React.Component<{
  next: () => void,
  cancel: () => void,
}, {}> {
  render() {
    const { next, cancel } = this.props;
    return (
      <Dialog
        open={true}
        onClose={cancel}
      >
        <DialogTitle>
          確認
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            データがすでに存在する場合は上書きされます。<br />
            操作は取り消しできません。続行してもよろしいですか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancel}>キャンセル</Button>
          <Button onClick={() => {
            next();
            cancel();
          }} autoFocus>
            続行
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
