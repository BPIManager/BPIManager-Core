import React from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import { FormattedMessage } from "react-intl";
import { scoreData, songData } from "@/types/data";
import { newDataProps } from "../detailsScreen";
import EditList from "./editList";
import JumpWeb from "./jumpWeb";

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

export default ScoreEditor;
