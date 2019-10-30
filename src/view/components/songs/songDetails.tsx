import React from "react";

import { scoreData, songData } from "../../../types/data";
import Paper from "@material-ui/core/Paper";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableHead from "@material-ui/core/TableHead";
import TableCell from "@material-ui/core/TableCell";
import TableBody from "@material-ui/core/TableBody";
import { FormattedMessage } from "react-intl";
import { convertClearState } from "../../../components/songs/filter";

interface P{
  song:songData|null,
  score:scoreData|null,
}

class SongDetails extends React.Component<P,{}> {

  render(){
    const {song,score} = this.props;
    if(!song || !score){
      return (null);
    }
    const max = song.notes * 2;
    return (
      <div>
        <Paper>
          <Table aria-label="Song Details">
            <TableHead>
              <TableRow>
                <TableCell style={{minWidth:"130px",maxWidth:"130px"}}><FormattedMessage id="SongDetail.SongDetailHead"/></TableCell>
                <TableCell>&nbsp;</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell><FormattedMessage id="SongDetail.Notes"/></TableCell>
                <TableCell>{song.notes}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><FormattedMessage id="SongDetail.WorldRecord"/></TableCell>
                <TableCell>{song.wr}({Math.floor(song.wr / max * 10000) / 100}%)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><FormattedMessage id="SongDetail.Average"/></TableCell>
                <TableCell>{song.avg}({Math.floor(song.avg / max * 10000)  / 100}%)</TableCell>
              </TableRow>
              { score.exScore &&
                <TableRow>
                  <TableCell><FormattedMessage id="SongDetail.You"/></TableCell>
                  <TableCell>{score.exScore}({Math.floor(score.exScore / max * 10000) / 100}%)</TableCell>
                </TableRow>
              }
              <TableRow>
                <TableCell>BPM</TableCell>
                <TableCell>{song.bpm}</TableCell>
              </TableRow>
              { score.version &&
                <TableRow>
                  <TableCell><FormattedMessage id="SongDetail.Version"/></TableCell>
                  <TableCell>{score.version}</TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </Paper>
        { (score.missCount || score.lastPlayed) &&
        <Paper>
          <Table aria-label="Score Details">
            <TableHead>
              <TableRow>
                <TableCell style={{minWidth:"130px",maxWidth:"130px"}}><FormattedMessage id="SongDetail.ScoreDetailHead"/></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              { score.lastPlayed &&
                <TableRow>
                  <TableCell><FormattedMessage id="SongDetail.ClearState"/></TableCell>
                  <TableCell>{convertClearState(score.clearState,1)}</TableCell>
                </TableRow>
              }
              { score.missCount &&
                <TableRow>
                  <TableCell><FormattedMessage id="SongDetail.MissCount"/></TableCell>
                  <TableCell>{score.missCount}</TableCell>
                </TableRow>
              }
              { score.lastPlayed &&
                <TableRow>
                  <TableCell><FormattedMessage id="SongDetail.LastPlayed"/></TableCell>
                  <TableCell>{score.lastPlayed}</TableCell>
                </TableRow>
              }
              { (score.Pgreat && score.great) &&
                <TableRow>
                  <TableCell><FormattedMessage id="SongDetail.ScoreDetails"/></TableCell>
                  <TableCell>PG:{score.Pgreat} G:{score.great}</TableCell>
                </TableRow>
              }
            </TableBody>
          </Table>
        </Paper>
        }
      </div>
    );
  }
}

export default SongDetails;
