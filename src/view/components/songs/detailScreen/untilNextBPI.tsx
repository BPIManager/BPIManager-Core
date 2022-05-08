import React, { useState, useEffect, useMemo } from "react";
import { scoreData, songData } from "@/types/data";
import { newDataProps } from "../detailsScreen";
import bpiCalcuator from "@/components/bpi";
import Typography from "@mui/material/Typography";

const UntilNextBPI: React.FC<{
  newData: newDataProps;
  score: scoreData;
  song: songData;
}> = ({ newData, score, song }) => {
  const [nextScore, setNextScore] = useState(0);
  const nextBPI =
    Math.ceil(
      (!Number.isNaN(newData.bpi)
        ? newData.bpi
        : score
        ? score.currentBPI
        : -15) / 10
    ) * 10;
  const currentScore = !Number.isNaN(newData.score)
    ? newData.score
    : score
    ? score.exScore
    : 0;
  const nextBPIBody = (nextBPI: number, currentScore: number) => {
    if (nextBPI < 0) nextBPI = 0;
    return (
      <span>
        BPI{nextBPI}まであと&nbsp;{nextScore - currentScore}&nbsp;点
      </span>
    );
  };

  const calc = useMemo(() => new bpiCalcuator(), []);

  useEffect(() => {
    calc.setData(song.notes * 2, song.avg, song.wr);
    calc.setCoef(song.coef || -1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setNextScore(calc.calcFromBPI(nextBPI < 0 ? 0 : nextBPI, true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newData, score]);

  if (!Number.isNaN(nextBPI) && nextBPI !== Infinity) {
    return (
      <Typography
        component="p"
        variant="caption"
        style={{
          textAlign: "center",
          position: "relative",
          bottom: "7px",
          fontSize: "10px",
        }}
      >
        {nextBPIBody(nextBPI, currentScore)}
      </Typography>
    );
  }
  return null;
};

export default UntilNextBPI;
