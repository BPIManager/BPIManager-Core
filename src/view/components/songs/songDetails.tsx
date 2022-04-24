import React from "react";

import { scoreData, songData } from "@/types/data";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableRow from "@mui/material/TableRow";
import TableHead from "@mui/material/TableHead";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { FormattedMessage } from "react-intl";
import { lampCSVArray, _prefixFullNum } from "@/components/songs/filter";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { verNameArr } from "./common";

interface P {
  song: songData | null;
  score: scoreData | null;
  newMemo: string;
  newMissCount: number;
  newClearState: number;
  memoModified: boolean;
  handleMissCount: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearState: (e: SelectChangeEvent<number>) => void;
  handleMemo: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

class SongDetails extends React.Component<P> {
  render() {
    const {
      song,
      score,
      newMemo,
      newMissCount,
      newClearState,
      handleClearState,
      handleMissCount,
      handleMemo,
      memoModified,
    } = this.props;
    if (!song || !score) {
      return null;
    }
    const max = song.notes * 2;
    return (
      <React.Fragment>
        <Paper>
          <Table aria-label="Score Details">
            <TableHead>
              <TableRow>
                <TableCell
                  style={{ minWidth: "130px", maxWidth: "130px" }}
                ></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Memo</TableCell>
                <TableCell>
                  <TextField
                    placeholder="type anything..."
                    multiline
                    fullWidth
                    rows="4"
                    error={newMemo.length > 1000}
                    onChange={handleMemo}
                    value={!memoModified || !newMemo ? song.memo : newMemo}
                    helperText={
                      newMemo.length > 1000 ? "テキストが長すぎます." : ""
                    }
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
        <Paper>
          <Table aria-label="Song Details">
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: "130px", maxWidth: "130px" }}>
                  <FormattedMessage id="SongDetail.SongDetailHead" />
                </TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="SongDetail.Notes" />
                </TableCell>
                <TableCell>{song.notes}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="SongDetail.WorldRecord" />
                </TableCell>
                <TableCell>
                  {song.wr > -1 && (
                    <span>
                      {song.wr}({Math.floor((song.wr / max) * 10000) / 100}%)
                    </span>
                  )}
                  {song.wr === -1 && <span>未登載</span>}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="SongDetail.Average" />
                </TableCell>
                <TableCell>
                  {song.avg > -1 && (
                    <span>
                      {song.avg}({Math.floor((song.avg / max) * 10000) / 100}%)
                    </span>
                  )}
                  {song.avg === -1 && <span>未登載</span>}
                </TableCell>
              </TableRow>
              {!Number.isNaN(score.exScore) && (
                <TableRow>
                  <TableCell>
                    <FormattedMessage id="SongDetail.You" />
                  </TableCell>
                  <TableCell>
                    {score.exScore}(
                    {Math.floor((score.exScore / max) * 10000) / 100}%)
                  </TableCell>
                </TableRow>
              )}
              <TableRow>
                <TableCell>BPM</TableCell>
                <TableCell>{song.bpm}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="SongDetail.Version" />
                </TableCell>
                <TableCell>
                  {verNameArr[Number(song["textage"].replace(/\/.*?$/, ""))]}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
        <Paper>
          <Table aria-label="Score Details">
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: "130px", maxWidth: "130px" }}>
                  <FormattedMessage id="SongDetail.ScoreDetailHead" />
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="SongDetail.ClearState" />
                </TableCell>
                <TableCell>
                  <Select
                    value={
                      newClearState === -1 ? score.clearState : newClearState
                    }
                    onChange={handleClearState}
                    displayEmpty
                  >
                    {lampCSVArray.map((item: string, i: number) => {
                      return (
                        <MenuItem value={i} key={i}>
                          {item}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="SongDetail.MissCount" />
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    onChange={handleMissCount}
                    value={newMissCount === -1 ? score.missCount : newMissCount}
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
        <Paper>
          <Table aria-label="Score Details">
            <TableHead>
              <TableRow>
                <TableCell style={{ minWidth: "130px", maxWidth: "130px" }}>
                  Coefficient
                </TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>
                  <FormattedMessage id="SongDetail.Coef" />
                </TableCell>
                <TableCell>{song.coef || "設定されていません"}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Plot</TableCell>
                <TableCell>
                  <img
                    src={
                      `https://files.poyashi.me/bpim/plots/27_end/` +
                      song.title.replace(/:|"|\*|†$/g, "") +
                      "[" +
                      _prefixFullNum(song.difficulty) +
                      "].jpeg"
                    }
                    alt="plot"
                    style={{ maxWidth: "100%" }}
                    onError={(e) =>
                      ((e.target as HTMLImageElement).src =
                        "https://files.poyashi.me/noimg.png")
                    }
                  />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Paper>
      </React.Fragment>
    );
  }
}

export default SongDetails;
