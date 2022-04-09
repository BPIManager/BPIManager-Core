import React, { useState, useEffect, useMemo } from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SongNotes from "../songNotes";
import BarChartIcon from '@mui/icons-material/BarChart';
import QueueMusicIcon from '@mui/icons-material/QueueMusic';
import HistoryIcon from '@mui/icons-material/History';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import RateReviewIcon from '@mui/icons-material/RateReview';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import Tooltip from "@mui/material/Tooltip";
import SongRelations from "../songRelations";
import BPIChart from "../bpiChart";
import SongDetails from "../songDetails";
import SongDiffs from "../songDiffs";
import TabPanel from "../common/tabPanel";
import SongRivals from "../songRivals";
import { scoreData, songData } from "@/types/data";
import { newDataProps, chartData } from "../detailsScreen";
import { SelectChangeEvent } from "@mui/material"
import bpiCalcuator from "@/components/bpi";

const DetailedScreenBody: React.FC<{
  song: songData,
  score: scoreData,
  newData: newDataProps,
  modifyData: (t: "score" | "bpi" | "clear" | "miss" | "memo", body: string | number) => void
}> = ({ song, score, newData, modifyData }) => {

  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_e: React.ChangeEvent<{}>, newValue: number) => setCurrentTab(newValue);

  const handleClearState = (e: SelectChangeEvent<number>) => modifyData("clear", Number(e.target.value) < 0 ? 0 : Number(e.target.value));
  const handleMissCount = (e: React.ChangeEvent<HTMLInputElement>) => modifyData("miss", Number(e.target.value) < 0 ? 0 : Number(e.target.value));
  const handleMemo = (e: React.ChangeEvent<HTMLInputElement>) => modifyData("memo", e.target.value || "");

  const [currentChart, setCurrentChart] = useState<chartData[]>([]);
  const [chartUpdated, setChartUpdated] = useState<number>(-1);

  const calc = useMemo(() => new bpiCalcuator(), []);

  const makeGraph = (newScore?: number): chartData[] => {
    let data: chartData[] = [], lastExScore = 0;
    const dataInserter = (exScore: number, label: string): number => {
      return data.push({
        "name": label,
        "EX SCORE": exScore
      });
    }
    if (!song || !score) { return []; }
    calc.setData(song.notes * 2, song.avg, song.wr);
    calc.setCoef(song.coef || -1);
    const bpiBasis = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const mybest = newScore ? newScore : score.exScore;
    if (song.wr === -1) {
      dataInserter(0, "");
      dataInserter(0, "");
      dataInserter(mybest, "YOU");
      return data;
    }
    for (let i = 0; i < bpiBasis.length; ++i) {
      const exScoreFromBPI: number = calc.calcFromBPI(bpiBasis[i], true);
      if (lastExScore < mybest && mybest <= exScoreFromBPI) {
        dataInserter(mybest, "YOU");
        lastExScore = mybest;
      }
      lastExScore = exScoreFromBPI;
      dataInserter(exScoreFromBPI, String(bpiBasis[i]));
    }
    if (lastExScore < mybest) {
      dataInserter(mybest, "YOU");
    }
    return data;
  }

  useEffect(() => {
    setCurrentChart(makeGraph(newData.score).reverse());
    setChartUpdated(new Date().getTime());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newData])

  return (
    <>
      <Tabs
        value={currentTab}
        textColor="secondary"
        indicatorColor="secondary"
        onChange={handleTabChange}
        className={"scrollableSpacebetween sc3Items"}>
        <Tooltip title="BPI分布グラフ">
          <Tab icon={<BarChartIcon />} />
        </Tooltip>
        <Tooltip title="楽曲情報">
          <Tab icon={<QueueMusicIcon />} />
        </Tooltip>
        <Tooltip title="過去のプレイ履歴">
          <Tab icon={<HistoryIcon />} />
        </Tooltip>
        <Tooltip title="ライバルスコア">
          <Tab icon={<SupervisorAccountIcon />} />
        </Tooltip>
        <Tooltip title="リコメンド">
          <Tab icon={<LightbulbIcon />} />
        </Tooltip>
        <Tooltip title="攻略コメント">
          <Tab icon={<RateReviewIcon />} />
        </Tooltip>
      </Tabs>
      <TabPanel value={currentTab} index={0}>
        <BPIChart song={song} newScore={newData.score} score={score} chartData={currentChart} graphLastUpdated={chartUpdated} />
      </TabPanel>
      <TabPanel value={currentTab} index={1}>
        <SongDetails song={song} score={score} newMemo={newData.memo} newMissCount={newData.miss} newClearState={newData.clear}
          handleClearState={handleClearState} handleMissCount={handleMissCount} handleMemo={handleMemo} memoModified={newData.memoModified} />
      </TabPanel>
      <TabPanel value={currentTab} index={2}>
        <SongDiffs song={song} score={score} />
      </TabPanel>
      <TabPanel value={currentTab} index={3}>
        <SongRivals song={song} score={score} />
      </TabPanel>
      <TabPanel value={currentTab} index={4}>
        <SongRelations song={song} score={score} />
      </TabPanel>
      <TabPanel value={currentTab} index={5}>
        <SongNotes song={song} score={score} />
      </TabPanel>
    </>
  )
}

export default DetailedScreenBody;
