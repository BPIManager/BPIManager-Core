import React from "react";

import { verArr, verNameArr, clearArr } from "./";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { buttonTextColor } from "@/components/settings";
import { lampCSVArray } from "@/components/songs/filter";

interface P {
  handleToggle: () => void;
  applyFilter: (state: {
    bpm: B;
    versions: number[];
    memo: boolean | null;
    showLatestOnly: boolean | null;
    clearType: number[];
  }) => void;
  bpm: B;
  bpi?: BPIR;
  memo?: boolean;
  versions: number[];
  showLatestOnly?: boolean;
  clearType?: number[];
}

interface S {
  bpm: B;
  bpi: BPIR | null;
  versions: number[];
  memo: boolean | null;
  showLatestOnly: boolean | null;
  clearType: number[];
}

export interface B {
  noSoflan: boolean;
  min: number | "";
  max: number | "";
  soflan: boolean;
}

export interface BPIR {
  min: number | "";
  max: number | "";
}

class SongsFilter extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      memo: typeof props.memo !== "boolean" ? null : props.memo,
      showLatestOnly:
        typeof props.showLatestOnly !== "boolean" ? null : props.showLatestOnly,
      bpm: props.bpm,
      versions: props.versions,
      clearType: props.clearType || [],
      bpi: props.bpi || null,
    };
  }

  componentDidMount() {
    window.history.pushState(null, "Filter", null);
    window.addEventListener("popstate", this.overridePopstate, false);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.overridePopstate, false);
  }

  overridePopstate = () => this.props.handleToggle();

  applyAndClose = () => {
    this.props.applyFilter(this.state);
    return this.props.handleToggle();
  };

  cloneState = (target: "bpm" | "bpi" = "bpm") => {
    return this.state[target];
  };

  handleChkBox =
    (name: "soflan" | "noSoflan" = "soflan") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let bpm: B = this.cloneState() as B;
      if (!bpm) {
        return;
      }
      bpm[name] = event.target.checked;
      return this.setState({
        bpm: bpm,
      });
    };

  handleMemoChkBox = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.setState({
      memo: event.target.checked,
    });
  };

  handleLatestChkBox = () => (event: React.ChangeEvent<HTMLInputElement>) => {
    return this.setState({
      showLatestOnly: event.target.checked,
    });
  };

  handleVerChkBox =
    (ver: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let { versions } = this.state;
      versions = versions.filter((v) => v !== ver);
      if (event.target.checked) {
        versions.push(ver);
      }
      return this.setState({
        versions: versions,
      });
    };

  handleClearTypeChkBox =
    (type: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
      let { clearType } = this.state;
      clearType = clearType.filter((v) => v !== type);
      if (event.target.checked) {
        clearType.push(type);
      }
      return this.setState({
        clearType: clearType,
      });
    };

  handleInput =
    (name: "min" | "max" = "min") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let bpm: B = this.cloneState() as B;
      if (!bpm) {
        return;
      }
      const val = Number(event.target.value);
      bpm[name] = val <= 0 ? "" : val;
      return this.setState({
        bpm: bpm,
      });
    };

  handleBPIInput =
    (name: "min" | "max" = "min") =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      let bpi: BPIR = this.cloneState("bpi") as BPIR;
      if (!bpi) {
        return;
      }
      const val = Number(event.target.value);
      bpi[name] = val;
      return this.setState({
        bpi: bpi,
      });
    };

  allSelect = () => this.setState({ versions: verArr() });
  allUnselect = () => this.setState({ versions: [] });

  allClearTypeSelect = () => this.setState({ clearType: clearArr() });
  allClearTypeUnselect = () => this.setState({ clearType: [] });

  render() {
    const { handleToggle } = this.props;
    const { bpm, versions, bpi, memo, showLatestOnly, clearType } = this.state;
    return (
      <Dialog open={true} onClose={handleToggle}>
        <DialogTitle>詳細フィルタ</DialogTitle>
        <DialogContent>
          {memo !== null && (
            <div>
              <Typography
                component="h6"
                variant="h6"
                style={{ marginTop: "5px" }}
              >
                メモ
              </Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={memo}
                    onChange={this.handleMemoChkBox()}
                    value={1.5}
                    color="primary"
                  />
                }
                label="メモが記入済みの楽曲のみ表示"
              />
            </div>
          )}
          <Typography component="h6" variant="h6">
            BPM
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={bpm.noSoflan}
                onChange={this.handleChkBox("noSoflan")}
                value="noSoflan"
                color="primary"
              />
            }
            label="ソフランなし"
          />
          <Grid container>
            <Grid item xs={6}>
              <form
                noValidate
                autoComplete="off"
                style={{ margin: "10px 6px 0" }}
              >
                <TextField
                  type="number"
                  style={{ width: "100%" }}
                  label="BPM下限"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={!bpm.noSoflan}
                  value={bpm.min}
                  onChange={this.handleInput("min")}
                />
              </form>
            </Grid>
            <Grid item xs={6}>
              <form
                noValidate
                autoComplete="off"
                style={{ margin: "10px 6px 0" }}
              >
                <TextField
                  type="number"
                  style={{ width: "100%" }}
                  label="BPM上限"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  disabled={!bpm.noSoflan}
                  value={bpm.max}
                  onChange={this.handleInput("max")}
                />
              </form>
            </Grid>
          </Grid>
          <FormControlLabel
            control={
              <Checkbox
                checked={bpm.soflan}
                onChange={this.handleChkBox("soflan")}
                value="soflan"
                color="primary"
              />
            }
            label="ソフランあり"
          />
          {bpi && (
            <div>
              <Typography
                component="h6"
                variant="h6"
                style={{ marginTop: "5px" }}
              >
                BPI
              </Typography>
              {showLatestOnly !== null && (
                <div>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showLatestOnly}
                        onChange={this.handleLatestChkBox()}
                        color="primary"
                      />
                    }
                    label="BPI表記非対応の楽曲のみを表示"
                  />
                </div>
              )}
              <Grid container>
                <Grid item xs={6}>
                  <form
                    noValidate
                    autoComplete="off"
                    style={{ margin: "10px 6px 0" }}
                  >
                    <TextField
                      type="number"
                      style={{ width: "100%" }}
                      label="BPI下限"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={bpi.min}
                      onChange={this.handleBPIInput("min")}
                    />
                  </form>
                </Grid>
                <Grid item xs={6}>
                  <form
                    noValidate
                    autoComplete="off"
                    style={{ margin: "10px 6px 0" }}
                  >
                    <TextField
                      type="number"
                      style={{ width: "100%" }}
                      label="BPI上限"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      value={bpi.max}
                      onChange={this.handleBPIInput("max")}
                    />
                  </form>
                </Grid>
              </Grid>
            </div>
          )}
          <Typography component="h6" variant="h6" style={{ marginTop: "5px" }}>
            Versions
          </Typography>
          <Button
            onClick={this.allUnselect}
            color="primary"
            style={{ color: buttonTextColor() }}
          >
            すべて選択解除
          </Button>
          <Button
            onClick={this.allSelect}
            color="primary"
            style={{ color: buttonTextColor() }}
          >
            すべて選択
          </Button>
          <Divider />
          <FormControlLabel
            control={
              <Checkbox
                checked={versions.indexOf(1.5) > -1}
                onChange={this.handleVerChkBox(1.5)}
                value={1.5}
                color="primary"
              />
            }
            label="substream"
          />
          {verArr(false).map((item) => {
            return (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={versions.indexOf(item) > -1}
                    onChange={this.handleVerChkBox(item)}
                    value={item}
                    color="primary"
                  />
                }
                key={item}
                label={verNameArr[item]}
              />
            );
          })}
          {this.props.clearType && (
            <React.Fragment>
              <Typography
                component="h6"
                variant="h6"
                style={{ marginTop: "5px" }}
              >
                クリアタイプ
              </Typography>
              <Button
                onClick={this.allClearTypeUnselect}
                color="primary"
                style={{ color: buttonTextColor() }}
              >
                すべて選択解除
              </Button>
              <Button
                onClick={this.allClearTypeSelect}
                color="primary"
                style={{ color: buttonTextColor() }}
              >
                すべて選択
              </Button>
              <Divider />
              {clearArr().map((item) => {
                if (!this.props.clearType) return <React.Fragment />;
                return (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={clearType.indexOf(item) > -1}
                        onChange={this.handleClearTypeChkBox(item)}
                        value={item}
                        color="primary"
                      />
                    }
                    key={item}
                    label={lampCSVArray[item]}
                  />
                );
              })}
            </React.Fragment>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleToggle} color="primary">
            閉じる
          </Button>
          <Button onClick={this.applyAndClose} color="primary">
            適用
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default SongsFilter;
