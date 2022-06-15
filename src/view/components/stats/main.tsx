import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { FormattedMessage, injectIntl } from "react-intl";
import Grid from "@mui/material/Grid";
import bpiCalcuator, { showBpiDist } from "@/components/bpi";
import { _currentStore } from "@/components/settings";
import _withOrd from "@/components/common/ord";
import { FormControlLabel, FormControl, RadioGroup, Radio, FormLabel, SelectChangeEvent, InputLabel, Select, MenuItem } from "@mui/material/";
import { withRouter, RouteComponentProps } from "react-router-dom";
import Loader from "../common/loader";
import { S } from "@/types/stats";
import statMain from "@/components/stats/main";
import { rivalScoreData } from "@/types/data";
import { ShareOnTwitter } from "../common/shareButtons";
import { config } from "@/config";
import _totalBPI from "@/components/bpi/totalBPI";
import dayjs from "dayjs";
import MyRekidaiChart from "./charts/mybest";
import BPMDistChart from "./charts/bpm";
import LineChartPerBPI from "./charts/perBPI";
import CommonPie from "./charts/commonPie";
import { IDays } from "@/view/pages/history";
import HistoryDataReceiver from "@/components/history";
import timeFormatter from "@/components/common/timeFormatter";
import { distBPMI } from "@/components/stats/bpmDist";

class Main extends React.Component<{ intl: any; derived?: rivalScoreData[] } & RouteComponentProps, S> {
  constructor(props: { intl: any; derived?: rivalScoreData[] } & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      compareDate: "前作",
      totalBPI: 0,
      lastVerTotalBPI: null,
      totalRank: 0,
      groupedByLevel: [],
      groupedByDiff: [],
      groupedByBPM: [],
      groupedByDJRank: [],
      groupedByClearState: [],
      targetLevel: 12,
      lastWeek: null,
      lastMonth: null,
      compareDateList: ["前作"],
    };
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount() {
    this.setCompareDates("12");
    await this.updateScoreData();
  }

  setCompareDates = async (newLevel: string) => {
    const hist = await new HistoryDataReceiver().load();
    hist.generate();
    const days = hist.getUpdateDays(newLevel);

    this.setState({
      compareDateList: days.reduce((group: string[], item: IDays) => {
        if (!group) group = [];
        group.push(timeFormatter(4, item.key));
        return group;
      }, []),
    });
  };

  changeDate = async (input: SelectChangeEvent<string>) => {
    const date = input.target.value as string;
    this.setState({ compareDate: date });
    return this.updateScoreData(this.state.targetLevel, date);
  };

  getSpecificData = async (statMain: statMain, targetLevel: number = 12, date: string = "前作") => {
    const all = await statMain.eachDaySumRawData(4, undefined, null, 9999);
    return all[date] || null;
  };

  async updateScoreData(targetLevel = 12, newDate = this.state.compareDate) {
    const bpi = new bpiCalcuator();
    const sMain = await new statMain(targetLevel).load(this.props.derived);
    let exec = await sMain.setLastData(String(Number(_currentStore()) - 1));
    const t = await new _totalBPI(targetLevel).load(true);
    const totalBPI = await t.currentVersion();
    //BPI別集計
    let compareData;
    let lastVerTotalBPI = -15;
    let prev: distBPMI[] = [];

    if (newDate === "前作") {
      compareData = targetLevel === 12 ? sMain.getTwelvesLast() : sMain.getElevensLast();
      lastVerTotalBPI = await t.lastVersion();
      prev = await exec.bpmDist(String(targetLevel) as "11" | "12", compareData);
    } else {
      compareData = await this.getSpecificData(sMain, targetLevel, newDate);
      lastVerTotalBPI = await t.specificData(compareData.filter((item) => item.difficultyLevel === String(targetLevel)));
      prev = await exec.bpmDist(String(targetLevel) as "11" | "12", compareData);
    }
    this.setState({
      isLoading: false,
      totalBPI: totalBPI,
      lastVerTotalBPI: lastVerTotalBPI || null,
      totalRank: bpi.rank(totalBPI, false),
      groupedByLevel: await exec.groupedByLevel(compareData),
      groupedByBPM: (await exec.bpmDist(String(targetLevel) as "11" | "12")).reduce((group: distBPMI[], item: distBPMI) => {
        if (!group) group = [];
        const pv = prev.find((_item) => item.name === _item.name);
        group.push({
          name: item.name,
          BPI: item.BPI,
          BPIPrev: pv ? pv.BPI : null,
        });
        return group;
      }, []),
      groupedByDJRank: await exec.songsByDJRank(),
      groupedByClearState: await exec.songsByClearState(),
      lastWeek: await exec.eachDaySum(4, dayjs().subtract(1, "week").format()),
      lastMonth: await exec.eachDaySum(4, dayjs().subtract(1, "month").format()),
    });
  }

  changeLevel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof e.target.value === "string") {
      const targetLevel = Number(e.target.value);
      this.setState({ targetLevel: targetLevel, isLoading: true, compareDate: "前作" });
      await this.setCompareDates(e.target.value);
      await this.updateScoreData(targetLevel);
    }
  };

  render() {
    const { totalBPI, isLoading, targetLevel, groupedByBPM, totalRank, groupedByLevel, groupedByDJRank, groupedByClearState, lastWeek, lastMonth, lastVerTotalBPI, compareDateList, compareDate } = this.state;
    const compareLastVer = () => {
      if (!lastVerTotalBPI) {
        return "0";
      }
      const upPer = Math.abs(Math.round(((totalBPI - lastVerTotalBPI) / lastVerTotalBPI) * 10000) / 100);
      if (totalBPI >= lastVerTotalBPI) {
        return "+" + upPer + "%";
      } else {
        return "-" + upPer + "%";
      }
    };
    const Selectors = (
      <Grid container alignItems={"center"}>
        <Grid item xs={6}>
          <DateSelector isLoading={isLoading} days={compareDateList} currentDate={compareDate} handleChange={this.changeDate} />
        </Grid>
        <Grid item xs={6}>
          <ChangeLevel isLoading={isLoading} targetLevel={targetLevel} changeLevel={this.changeLevel} isFlexEnd />
        </Grid>
      </Grid>
    );
    if (isLoading) {
      return (
        <Container fixed style={{ padding: 0 }}>
          {Selectors}
          <Loader />
        </Container>
      );
    }
    const rankPer = Math.round((totalRank / new bpiCalcuator().getTotalKaidens()) * 1000000) / 10000;
    const social = JSON.parse(localStorage.getItem("social") || "{}");
    const url = config.baseUrl + (social && social.displayName ? "/u/" + social.displayName : "");
    return (
      <Container fixed style={{ padding: 0 }}>
        {Selectors}
        <Grid container>
          <Grid item xs={12} md={3} lg={3}>
            <div style={{ padding: "15px" }} className="responsiveTotalBPI">
              <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                <FormattedMessage id="Stats.TotalBPI" />
              </Typography>
              <Typography component="h2" variant="h2" color="textPrimary">
                {totalBPI}
              </Typography>
              <Typography component="h5" variant="h5" color="textPrimary">
                推定順位 : {_withOrd(totalRank)}
                <ShareOnTwitter text={`★${targetLevel}の総合BPI:${totalBPI}(推定順位:${totalRank}位,皆伝上位${rankPer}%)\n前週比:${showBpiDist(totalBPI, lastWeek)} 前月同日比:${showBpiDist(totalBPI, lastMonth)}`} url={url} />
              </Typography>
              <Typography component="p" variant="body1" color="textPrimary">
                皆伝上位{rankPer}%<br />
                {lastVerTotalBPI && (
                  <span>
                    {compareDate}の総合BPI:{lastVerTotalBPI}({compareLastVer()})
                  </span>
                )}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} md={9} lg={9}>
            <LineChartPerBPI data={groupedByLevel} targetLevel={targetLevel} totalBPI={totalBPI} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <BPMDistChart groupedByBPM={groupedByBPM} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <CommonPie data={groupedByDJRank} targetLevel={targetLevel} title="Stats.DistributionOfDJRank" />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <CommonPie data={groupedByClearState} targetLevel={targetLevel} title="Stats.DistributionOfClearState" />
          </Grid>
        </Grid>
        <Grid container style={{ marginTop: "20px" }}>
          <Grid item xs={12} md={6} lg={6}>
            <MyRekidaiChart withTitle diff={targetLevel} />
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default withRouter(injectIntl(Main));

export const ChangeLevel: React.FC<{
  targetLevel: number;
  changeLevel: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isLoading: boolean;
  isFlexEnd?: boolean;
}> = ({ targetLevel, changeLevel, isLoading, isFlexEnd }) => {
  return (
    <div style={isFlexEnd ? { display: "flex", justifyContent: "flex-end" } : {}}>
      <FormControl component="fieldset">
        <FormLabel component="legend" color="primary">
          表示対象
        </FormLabel>
        <RadioGroup value={targetLevel} onChange={changeLevel} row>
          <FormControlLabel value={11} control={<Radio color="secondary" />} label="☆11" labelPlacement="end" disabled={isLoading} />
          <FormControlLabel value={12} control={<Radio color="secondary" />} label="☆12" labelPlacement="end" disabled={isLoading} />
        </RadioGroup>
      </FormControl>
    </div>
  );
};

const DateSelector: React.FC<{
  days: string[];
  currentDate: string;
  handleChange: (input: SelectChangeEvent<string>) => void;
  isFlexEnd?: boolean;
  isLoading: boolean;
}> = (props) => {
  return (
    <div style={props.isFlexEnd ? { display: "flex", justifyContent: "flex-end" } : {}}>
      <FormControl component="fieldset" fullWidth>
        <InputLabel>比較対象</InputLabel>
        <Select value={props.currentDate} onChange={props.handleChange} displayEmpty disabled={props.isLoading}>
          <MenuItem value={"前作"}>前作</MenuItem>
          {props.days.map((item) => (
            <MenuItem value={item} key={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};
