import React from "react";

import { scoreData, songData } from "@/types/data";
import { _prefix, genTitle } from "@/components/songs/filter";
import DetailedSongInformation from "../../detailsScreen";
import { diffColor } from "../../common";
import _djRank from "@/components/common/djRank";
import { _currentStore, _currentViewComponents } from "@/components/settings";
import bpiCalcuator from "@/components/bpi";
import { scoresDB } from "@/components/indexedDB";
import Grid from "@mui/material/Grid";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Box, Divider, LinearProgress, LinearProgressProps, Pagination, Paper, SelectChangeEvent } from "@mui/material";
import timeFormatter, { updatedTime } from "@/components/common/timeFormatter";
import { loader } from "@/components/rivals/letters";
import Loader from "@/view/components/common/loader";
import ViewRowsSelector from "@/view/components/common/viewSelector";
import { defaultBackground } from "@/themes/ifColor";

interface P {
  data: scoreData[];
  mode: number;
  allSongsData: Map<String, songData>;
  updateScoreData: (row: songData) => void;
  page: number;
  handleChangePage: (_e: any, newPage: number) => void;
}

interface S {
  rowsPerPage: number;
  isOpen: boolean;
  FV: number;
  currentSongData: songData | null;
  currentScoreData: scoreData | null;
  components: string[];
  isLoading: boolean;
  winlose: any;
}

export default class SongsRichTable extends React.Component<Readonly<P>, S> {
  constructor(props: Readonly<P>) {
    super(props);
    this.state = {
      rowsPerPage: 10,
      isOpen: false,
      FV: 0,
      currentSongData: null,
      currentScoreData: null,
      components: _currentViewComponents().split(","),
      isLoading: true,
      winlose: null,
    };
  }

  async componentDidMount() {
    const l = await loader();
    this.setState({
      winlose: l,
      isLoading: false,
    });
  }

  handleOpen = (updateFlag: boolean, row: songData | scoreData): void => {
    if (updateFlag) {
      this.props.updateScoreData(row as songData);
    }
    return this.setState({
      isOpen: !this.state.isOpen,
      FV: 0,
      currentSongData: (row ? this.props.allSongsData.get(genTitle(row.title, row.difficulty)) : null) as songData,
      currentScoreData: (row ? row : null) as scoreData,
    });
  };

  handleChangeRowsPerPage = (event: SelectChangeEvent<number>, _m: any): void => {
    this.props.handleChangePage(null, 0);
    this.setState({ rowsPerPage: Number(event.target.value) });
  };

  change = (_e: any, page: number) => {
    if (this.props.page + 1 === page || !page) return;
    this.props.handleChangePage(_e, page - 1);
  };

  render() {
    const { rowsPerPage, isOpen, currentSongData, currentScoreData, FV, winlose, isLoading } = this.state;
    const { page, data } = this.props;
    const bgColor = defaultBackground();
    if (isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <Pagination count={Math.ceil(data.length / rowsPerPage)} page={page + 1} color="secondary" onChange={this.change} />
        <div id="screenCaptureTarget" style={{ backgroundColor: bgColor }}>
          <Grid container spacing={2} style={{ marginTop: "15px" }}>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row: scoreData, _i: number) => {
              const prefix = _prefix(row.difficulty);
              const f = this.props.allSongsData.get(row.title + prefix);
              const m = winlose ? winlose.find((item: any) => item.title === row.title && item.difficulty === row.difficulty) : null;
              if (!f) return null;
              return <Item row={row} winlose={m || null} song={f} key={row.title + row.difficulty} handleOpen={this.handleOpen} />;
            })}
          </Grid>
          {isOpen && <DetailedSongInformation isOpen={isOpen} song={currentSongData} score={currentScoreData} handleOpen={this.handleOpen} firstView={FV} />}
        </div>
        <Pagination count={Math.ceil(data.length / rowsPerPage)} page={page + 1} color="secondary" onChange={this.change} />
        <ViewRowsSelector rowsPerPage={rowsPerPage} handleChangeRowsPerPage={this.handleChangeRowsPerPage} />
      </React.Fragment>
    );
  }
}

const fontSize = "10px";

interface IP {
  row: scoreData;
  song: songData;
  winlose: any;
  handleOpen: (flag: boolean, row: scoreData) => void;
}

class Item extends React.Component<IP, {}> {
  bpi = new bpiCalcuator();

  nextBPI = (nextBPI: number) => {
    if (this.props.row.currentBPI === Infinity) return "-";
    if (nextBPI < 0) nextBPI = 0;
    const { song } = this.props;
    const currentScore = this.props.row.exScore || 0;
    this.bpi.setData(song.notes * 2, song.avg, song.wr);
    this.bpi.setCoef(song.coef || -1);
    return currentScore - this.bpi.calcFromBPI(nextBPI, true);
  };

  render() {
    const { row, song, winlose } = this.props;
    const max = song["notes"] * 2;
    const barColor = diffColor(0, row.clearState);
    const per = (row.exScore / max) * 100;
    let nextBPI = Math.ceil((this.props.row ? this.props.row.currentBPI : -15) / 10) * 10;
    return (
      <Grid item xs={12} sm={12} md={12} lg={6} className="gridWithPad">
        <CardContent style={{ padding: 0, cursor: "pointer" }} onClick={() => this.props.handleOpen(false, row)}>
          <Typography component="div" className="spaceBetween" sx={{ fontSize: 14, alignItems: "center" }} color="text.secondary" gutterBottom>
            <p
              className="withClearLamp"
              style={{
                padding: "4px 0 4px 5px",
                margin: 0,
                borderLeft: "3px solid " + barColor,
                wordBreak: "break-all",
              }}
            >
              <span style={{ fontSize: "12px" }}>☆{song.difficultyLevel}</span>
              <br />
              <span className="listHighlighted">
                {row.title}
                {_prefix(row.difficulty)}
              </span>
            </p>
            <div style={{ textAlign: "right", padding: "0 0 0 3px", margin: 0 }}>
              {row.currentBPI !== Infinity && (
                <React.Fragment>
                  <span style={{ fontSize: "12px" }}>{this.bpi.rank(row.currentBPI)}位</span>
                  <br />
                  <span className="listHighlighted">BPI&nbsp;{row.currentBPI.toFixed(2)}</span>
                </React.Fragment>
              )}
              {row.currentBPI === Infinity && (
                <React.Fragment>
                  <span style={{ fontSize: "12px" }}>-</span>
                  <br />
                  BPI&nbsp; -
                </React.Fragment>
              )}
            </div>
          </Typography>
          <LinearProgressWithLabel per={per} />
          <Paper style={{ fontSize: fontSize, padding: "12px", marginTop: "4px" }} square variant="outlined" elevation={0}>
            <Grid container justifyContent="space-between" style={{ margin: "5px 0" }}>
              <Grid item xs={5} sm={5}>
                <div className="spaceBetween">
                  <Typography color="text.secondary">EX SCORE</Typography>
                  <span>{row.exScore}</span>
                </div>
                <div className="spaceBetween">
                  <Typography color="text.secondary">TARGET</Typography>
                  <span>
                    {_djRank(false, false, max, row.exScore)}
                    {_djRank(false, true, max, row.exScore)}
                  </span>
                </div>
                <div className="spaceBetween">
                  <Typography color="text.secondary">MISS COUNT</Typography>
                  <span>{row.missCount || 0}</span>
                </div>
                <div className="spaceBetween">
                  <Typography color="text.secondary">WIN/LOSE</Typography>
                  <span>{winlose ? winlose.win + " / " + winlose.lose : "0 / 0"}</span>
                </div>
              </Grid>
              <Grid item xs={5} sm={5}>
                <ScoreCompares row={row} />
                {nextBPI !== Infinity && (
                  <div className="spaceBetween">
                    <Typography color="text.secondary">BPI{nextBPI}</Typography>
                    <span>{this.nextBPI(nextBPI)}点</span>
                  </div>
                )}
              </Grid>
            </Grid>
            <Typography style={{ textAlign: "right", fontSize: fontSize }} color="text.secondary">
              最終更新日&nbsp;{timeFormatter(0, row.updatedAt)}&nbsp;(
              {updatedTime(row.updatedAt)})
            </Typography>
          </Paper>
        </CardContent>
        <Divider style={{ margin: "10px 0" }} />
      </Grid>
    );
  }
}

class LinearProgressWithLabel extends React.Component<LinearProgressProps & { per: number }, {}> {
  render() {
    return (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box sx={{ width: "100%", mr: 1 }}>
          <LinearProgress style={{ height: "2px" }} variant="determinate" value={this.props.per} color="secondary" />
        </Box>
        <Box sx={{ minWidth: 35 }}>
          <Typography style={{ fontSize: fontSize }} color="text.secondary">{`${this.props.per.toFixed(2)}%`}</Typography>
        </Box>
      </Box>
    );
  }
}

class ScoreCompares extends React.Component<
  { row: scoreData },
  {
    lastVer: number;
    bestData: number;
    show: boolean;
    loading: boolean;
  }
> {
  state = {
    show: true,
    lastVer: 0,
    bestData: 0,
    loading: true,
  };

  async componentDidMount() {
    const { row } = this.props;
    const sdb = new scoresDB();
    const t = await sdb._getSpecificSong(row.title, row.difficulty, row.isSingle);
    const res = [0, 0]; // 0:lastVer,1:bestScore
    if (t) {
      const lastVer = t.find((item) => item.storedAt === String(Number(_currentStore()) - 1));
      res[0] = lastVer ? lastVer["exScore"] : 0;
      res[1] = t.reduce((best, item) => {
        if (item["exScore"] > best) {
          best = item["exScore"];
        }
        return best;
      }, 0);
    }
    return this.setState({
      show: true,
      lastVer: res[0],
      bestData: res[1],
      loading: false,
    });
  }

  render() {
    const { lastVer, bestData, loading } = this.state;
    const { row } = this.props;
    if (loading) {
      return (
        <React.Fragment>
          <div className="spaceBetween">
            <Typography color="text.secondary">前回</Typography>
            <span>…</span>
          </div>
          <div className="spaceBetween">
            <Typography color="text.secondary">前作</Typography>
            <span>…</span>
          </div>
          <div className="spaceBetween">
            <Typography color="text.secondary">自己歴代</Typography>
            <span>…</span>
          </div>
        </React.Fragment>
      );
    }
    const bf = (cp: number) => row.exScore - cp >= 0;
    const compare = (cp: number) => {
      return (
        <span>
          {cp}&nbsp;
          <span style={{ color: bf(cp) ? "#ff0000" : "#4fa6ff" }}>
            ({bf(cp) && <span>+</span>}
            {Number(row.exScore - cp)})
          </span>
        </span>
      );
    };
    return (
      <React.Fragment>
        <div className="spaceBetween">
          <Typography color="text.secondary">前回</Typography>
          {compare(row.lastScore)}
        </div>
        <div className="spaceBetween">
          <Typography color="text.secondary">前作</Typography>
          {compare(lastVer)}
        </div>
        <div className="spaceBetween">
          <Typography color="text.secondary">自己歴代</Typography>
          {compare(bestData)}
        </div>
      </React.Fragment>
    );
  }
}
