import { Component } from "react";
import React from "react";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Button from "@mui/material/Button";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Dialog from "@mui/material/Dialog";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";
import fbActions from "@/components/firebase/actions";
import Loader from "@/view/components/common/loader";
import { timeCompare } from "@/components/common/timeFormatter";
import { SnackbarContent } from "@mui/material";

export default class ArenaRankCheck extends Component<{}, { show: boolean; modal: boolean; currentArenaRank: string; uid: string; completed: boolean; castTime: string }> {
  state = {
    show: false,
    modal: false,
    currentArenaRank: "A1",
    uid: "",
    completed: false,
    castTime: "0",
  };

  componentDidMount() {
    new fbActions().auth().onAuthStateChanged(async (user: any) => {
      const meta = await fetch("https://proxy.poyashi.me/bpim/api/v1/meta/");

      if (!user || !meta.ok) return;
      const castTime = (await meta.json()).meta.arenaCast;
      const localTime = localStorage.getItem("localTimeArenaRank") || "1900-01-01";
      if (!localTime || timeCompare(castTime, localTime, "day") !== 0) {
        const uid = user.uid;
        const uData = await new fbActions().searchRivalByUid(uid);
        this.setState({
          currentArenaRank: uData ? uData.arenaRank : "A1",
          show: true,
          uid: uid,
          castTime: castTime,
        });
      }
    });
  }

  handleClose = () => {
    this.setState({ show: false });
  };

  toggleDialog = () => this.setState({ modal: !this.state.modal, show: false });

  complete = () => {
    localStorage.setItem("localTimeArenaRank", this.state.castTime);
    this.setState({ completed: true, show: false, modal: false });
  };

  render() {
    const { show, uid, modal, currentArenaRank, completed } = this.state;

    const action = (
      <React.Fragment>
        <Button color="secondary" size="small" onClick={this.toggleDialog}>
          表示
        </Button>
        <IconButton size="small" aria-label="close" color="inherit" onClick={this.handleClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </React.Fragment>
    );
    return (
      <React.Fragment>
        {modal && <ArenaRanKSelector complete={this.complete} uid={uid} currentArenaRank={currentArenaRank} toggleDialog={this.toggleDialog} />}
        <Snackbar className="bottomStickedSnack" style={{ width: "100%", left: 0 }} open={show}>
          <SnackbarContent style={{ borderRadius: 0, width: "100%" }} message={<React.Fragment>現在のアリーナランクの収集にご協力お願いします。</React.Fragment>} action={action} />
        </Snackbar>
        <Snackbar className="bottomStickedSnack" style={{ width: "100%", left: 0 }} open={completed} autoHideDuration={3000} onClose={() => this.setState({ completed: false })}>
          <SnackbarContent style={{ borderRadius: 0, width: "100%" }} message={<React.Fragment>ご協力ありがとうございます。</React.Fragment>} />
        </Snackbar>
      </React.Fragment>
    );
  }
}

class ArenaRanKSelector extends Component<{ toggleDialog: () => void; currentArenaRank: string; uid: string; complete: () => void }, { selected: string; loading: boolean }> {
  state = {
    selected: this.props.currentArenaRank === "-" ? "A1" : this.props.currentArenaRank,
    loading: false,
  };

  handleClose = () => this.props.toggleDialog();

  handleChange = (event: React.ChangeEvent<HTMLInputElement>) => this.setState({ selected: (event.target as HTMLInputElement).value });

  update = async () => {
    if (this.state.loading || !this.props.uid) return;
    this.setState({ loading: true });

    await new fbActions().updateArenaRank(this.props.uid, this.state.selected);

    this.props.complete();
  };

  render() {
    const { selected, loading } = this.state;
    return (
      <Dialog sx={{ "& .MuiDialog-paper": { width: "80%", maxHeight: 435 } }} maxWidth="xs" open={true}>
        <DialogTitle>現在のアリーナランクを選択</DialogTitle>
        <DialogContent dividers>
          {!loading && (
            <React.Fragment>
              <Typography variant="body1">
                アリーナランク別平均を算出するため、定期的に最新のアリーナランクを集計しています。
                <br />
                現在のアリーナランクを選択の上「Ok」ボタンから送信してください。
              </Typography>
              <RadioGroup name="arenaRank" value={selected} onChange={this.handleChange}>
                {["A1", "A2", "A3", "A4", "A5", "B1", "B2", "B3", "B4", "B5"].map((option) => (
                  <FormControlLabel value={option} key={option} control={<Radio color="secondary" />} label={option} />
                ))}
              </RadioGroup>
            </React.Fragment>
          )}
          {loading && <Loader />}
        </DialogContent>
        <DialogActions>
          <Button disabled={loading} autoFocus onClick={this.handleClose}>
            Cancel
          </Button>
          <Button disabled={loading} onClick={this.update}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
