import React, { useState, useEffect, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { _prefixFromNum } from "@/components/songs/filter";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import { FormattedMessage } from "react-intl";
import bpiCalcuator, { B } from "@/components/bpi";
import Button from '@mui/material/Button';
import Tooltip from "@mui/material/Tooltip";
import { scoresDB, scoreHistoryDB, songsDB } from "@/components/indexedDB";
import { _currentTheme, _area, _isSingle, _currentStore } from "@/components/settings";
import _djRank from "@/components/common/djRank";
import { scoreData, songData } from "@/types/data";
import EditList from "./detailScreen/editList";
import JumpWeb from "./detailScreen/jumpWeb";
import DetailedScreenBody from "./detailScreen/tabPanel";
import ShowSnackBar from "../snackBar";

interface P {
  isOpen: boolean,
  song: songData | null,
  score: scoreData | null,
  handleOpen: (flag: boolean, row?: any, willDeleteItems?: { title: string, difficulty: string } | null) => void,
  willDelete?: boolean,
  firstView?: number,
}

export interface newDataProps {
  score: number, bpi: number, clear: number, miss: number, memo: string, memoModified: boolean
}

export interface chartData {
  "name": string,
  "EX SCORE": number
}

const DetailedSongInformation: React.FC<P & { intl?: any }> = props => {
  const { isOpen, handleOpen, song, score } = props;
  const [newData, setNewData] = useState<newDataProps>({ score: NaN, bpi: NaN, clear: -1, miss: -1, memo: "", memoModified: false });
  const [errorSnack, setErrorSnack] = useState<{ message: string, visible: boolean }>({ message: "", visible: false });

  const calc = useMemo(() => new bpiCalcuator(), []);

  const modifyData = (target: "score" | "bpi" | "clear" | "miss" | "memo", value: number | string) => {
    if (!song) return;
    setNewData({ ...newData, [target]: value, memoModified: target === "memo" && newData.memo !== song.memo });
  }

  useEffect(() => {
    if (!song || !score) return;
    calc.setData(song.notes * 2, song.avg, song.wr);
    calc.setCoef(song.coef || -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScoreInput = async (e: React.FocusEvent<HTMLInputElement>): Promise<void> => {
    if (!song) {
      return setErrorSnack({ visible: true, message: "楽曲データが不正です。" });
    }
    const newScore: number = Number(e.target.value);
    const newBPI: B = await calc.calc(song.title, song.difficulty, newScore);
    if (newBPI.error) {
      return setErrorSnack({ visible: true, message: newBPI.reason as string });
    }
    return setNewData({ ...newData, score: newScore, bpi: Math.floor(newBPI.bpi * 100) / 100 })
  }

  const isModified = () => {
    const { score, song } = props;
    if (!score || !song) {
      return false;
    }
    return (
      !Number.isNaN(newData.bpi) ||
      !Number.isNaN(newData.score) ||
      (newData.clear !== -1 && newData.clear !== score.clearState) ||
      (newData.miss !== -1 && newData.miss !== score.missCount) ||
      (newData.memoModified && newData.memo !== song.memo)
    );
  }

  const saveAndClose = async () => {
    try {
      const { score, song, willDelete } = props;
      if (!song || !score) { return; }
      const scores = new scoresDB(), scoreHist = new scoreHistoryDB(), songs = new songsDB();
      if (!Number.isNaN(newData.score) || newData.clear !== -1 || newData.miss !== -1) {
        await scores.updateScore(score, { currentBPI: newData.bpi, exScore: newData.score, clearState: newData.clear, missCount: newData.miss });
      }
      if (!Number.isNaN(newData.bpi)) {
        scoreHist._add(Object.assign(score, { difficultyLevel: song.difficultyLevel, currentBPI: newData.bpi, exScore: newData.score }));
      }
      if (newData.memoModified && newData.memo !== song.memo) {
        await songs.updateMemo(song, newData.memo);
        song.memo = newData.memo;
      }
      props.handleOpen(true, song, willDelete ? { title: score.title, difficulty: score.difficulty } : null);
    } catch (e: any) {
      return setErrorSnack({ message: e, visible: true });
    }
  }
  const c = _currentTheme();


  if (!song || !score) {
    return (null);
  }

  return (
    <Dialog
      id="detailedScreen" className={c === "dark" ? "darkDetailedScreen" : c === "light" ? "lightDetailedScreen" : "deepSeaDetailedScreen"}
      fullScreen open={isOpen} onClose={handleOpen} style={{ overflowX: "hidden", width: "100%" }}>
      <AppBar>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => handleOpen(false)}
            aria-label="close"
            size="large">
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" className="be-ellipsis" style={{ flexGrow: 1 }}>
            {song.title + _prefixFromNum(song.difficulty)}
          </Typography>
          {isModified() &&
            <div style={{ position: "relative" }}>
              <Button variant="contained" color="secondary" onClick={saveAndClose}>
                <FormattedMessage id="Details.SaveButton" />
              </Button>
            </div>
          }
        </Toolbar>
      </AppBar>
      <Toolbar />
      <div style={{height: "calc( 100% - 285px )"}}>
        <DetailedTopHeaderDisplay newData={newData} score={score} song={song} />
        <UntilNextBPI newData={newData} score={score} song={song} />
        <Divider />
        <ScoreEditor newData={newData} score={score} song={song} handleScoreInput={handleScoreInput} />
        <DetailedScreenBody song={song} score={score} newData={newData} modifyData={modifyData} />
      </div>
      <ShowSnackBar message={errorSnack.message} variant="warning"
        handleClose={() => setErrorSnack({ message: "", visible: false })} open={errorSnack.visible} autoHideDuration={3000} />
    </Dialog>
  );
}

const DetailedTopHeaderDisplay: React.FC<{
  newData: newDataProps,
  score: scoreData,
  song: songData
}> = ({ newData, score, song }) => {

  const [showBody, setShowBody] = useState(false);

  const calc = new bpiCalcuator();
  const calcRank = () => score ? `${calc.rank(!Number.isNaN(newData.bpi) ? newData.bpi : score.currentBPI)}` : "-";

  const showRank = (isBody: boolean): string => {
    if (!song || !score) { return "-"; }
    const max: number = song.notes * 2;
    const s: number = !Number.isNaN(newData.score) ? newData.score : score.exScore;
    return _djRank(showBody, isBody, max, s);
  }

  return (
    <Grid container spacing={3} justifyContent="space-around" className="detailsScreenTopGrid">
      <Grid
        onClick={() => setShowBody(!showBody)} item xs={4}
        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "10px 0", cursor: "pointer" }}>
        <Tooltip title="プラス/マイナス表記の切り替え">
          <div style={{ textAlign: "center" }}>
            <Typography component="h6" variant="h6" color="textSecondary">
              {score && <span>{showRank(false)}</span>}
            </Typography>
            <Typography component="h4" variant="h4" color="textPrimary">
              {score && <span>{showRank(true)}</span>}
            </Typography>
          </div>
        </Tooltip>
      </Grid>
      <Grid item xs={4} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "10px 0" }}>
        <Typography component="h6" variant="h6" color="textSecondary">
          BPI
        </Typography>
        <Typography component="h4" variant="h4" color="textPrimary">
          {song.wr === -1 && <span>-</span>}
          {song.wr !== -1 && <div>
            {(score && Number.isNaN(newData.bpi) && !Number.isNaN(score.currentBPI)) && score.currentBPI}
            {!Number.isNaN(newData.bpi) && newData.bpi}
            {(Number.isNaN(score.currentBPI) && Number.isNaN(newData.bpi)) && <span>-</span>}
          </div>}
        </Typography>
      </Grid>
      <Grid item xs={4} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "10px 0" }}>
        <Typography component="h6" variant="h6" color="textSecondary">
          RANK
        </Typography>
        <Typography component="h4" variant="h4" color="textPrimary">
          {song.wr === -1 && <span>-</span>}
          {song.wr !== -1 && <div>
            {(!Number.isNaN(score.currentBPI) || !Number.isNaN(newData.bpi)) && <span>{calcRank()}</span>}
            {(Number.isNaN(score.currentBPI) && Number.isNaN(newData.bpi)) && <span>-</span>}
          </div>}
        </Typography>
      </Grid>
    </Grid>
  )
}

const UntilNextBPI: React.FC<{
  newData: newDataProps,
  score: scoreData,
  song: songData
}> = ({ newData, score, song }) => {

  const [nextScore, setNextScore] = useState(0);
  const nextBPI = Math.ceil((!Number.isNaN(newData.bpi) ? newData.bpi : score ? score.currentBPI : -15) / 10) * 10;
  const currentScore = !Number.isNaN(newData.score) ? newData.score : score ? score.exScore : 0;

  const nextBPIBody = (nextBPI: number, currentScore: number) => {
    if (nextBPI < 0) nextBPI = 0;
    return <span>BPI{nextBPI}まであと&nbsp;{nextScore - currentScore}&nbsp;点</span>
  }

  const calc = useMemo(() => new bpiCalcuator(), []);

  useEffect(() => {
    calc.setData(song.notes * 2, song.avg, song.wr);
    calc.setCoef(song.coef || -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNextScore(calc.calcFromBPI(nextBPI, true));
  }, [newData, score]);

  if ((!Number.isNaN(nextBPI) && nextBPI !== Infinity)) {
    return (
      <Typography component="p" variant="caption" style={{ textAlign: "center", position: "relative", bottom: "7px", fontSize: "10px" }}>
        {nextBPIBody(nextBPI, currentScore)}
      </Typography>
    )
  }
  return (null);
}

const ScoreEditor: React.FC<{
  newData: newDataProps,
  score: scoreData,
  song: songData,
  handleScoreInput: (e: React.FocusEvent<HTMLInputElement>) => Promise<void>
}> = ({ newData, score, song, handleScoreInput }) => {

  const currentScore = !Number.isNaN(newData.score) ? newData.score : score ? score.exScore : 0;

  return (
    <Grid container flexWrap="nowrap" >
      <Grid item xs={10}>
        <form noValidate autoComplete="off" style={{ margin: "10px 6px 0" }} className="detailedInputForm">
          <TextField
            type="number"
            size="small"
            style={{ width: "100%" }}
            label={<span style={{ fontSize: "13px !important" }}><FormattedMessage id="Details.typeNewScore" /></span>}
            value={currentScore}
            onChange={handleScoreInput}
            onKeyPress={(e) => { if (e.key === "Enter") e.preventDefault() }}
          />
        </form>
      </Grid>
      <EditList song={song} />
      <JumpWeb song={song} />
    </Grid>
  )
}

export default DetailedSongInformation;
