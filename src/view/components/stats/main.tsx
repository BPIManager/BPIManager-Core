import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { FormattedMessage, injectIntl } from "react-intl";
import Grid from "@mui/material/Grid";
import bpiCalcuator, { showBpiDist } from "@/components/bpi";
import { _currentStore } from "@/components/settings";
import _withOrd from "@/components/common/ord";
import {
  FormControlLabel,
  FormControl,
  RadioGroup,
  Radio,
  FormLabel,
} from "@mui/material/";
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

class Main extends React.Component<
  { intl: any; derived?: rivalScoreData[] } & RouteComponentProps,
  S
> {
  constructor(
    props: { intl: any; derived?: rivalScoreData[] } & RouteComponentProps
  ) {
    super(props);
    this.state = {
      isLoading: true,
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
    };
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount() {
    await this.updateScoreData();
  }

  async updateScoreData(targetLevel = 12) {
    const bpi = new bpiCalcuator();
    let exec = await (
      await new statMain(targetLevel).load(this.props.derived)
    ).setLastData(String(Number(_currentStore()) - 1));
    const t = await new _totalBPI(targetLevel).load(true);
    const totalBPI = await t.currentVersion();
    const lastVerTotalBPI = await t.lastVersion();
    //BPI別集計

    this.setState({
      isLoading: false,
      totalBPI: totalBPI,
      lastVerTotalBPI: lastVerTotalBPI || null,
      totalRank: bpi.rank(totalBPI, false),
      groupedByLevel: await exec.groupedByLevel(),
      groupedByBPM: await exec.bpmDist(String(targetLevel) as "11" | "12"),
      groupedByDJRank: await exec.songsByDJRank(),
      groupedByClearState: await exec.songsByClearState(),
      lastWeek: await exec.eachDaySum(4, dayjs().subtract(1, "week").format()),
      lastMonth: await exec.eachDaySum(
        4,
        dayjs().subtract(1, "month").format()
      ),
    });
  }

  changeLevel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof e.target.value === "string") {
      const targetLevel = Number(e.target.value);
      this.setState({ targetLevel: targetLevel, isLoading: true });
      await this.updateScoreData(targetLevel);
    }
  };

  render() {
    const {
      totalBPI,
      isLoading,
      targetLevel,
      groupedByBPM,
      totalRank,
      groupedByLevel,
      groupedByDJRank,
      groupedByClearState,
      lastWeek,
      lastMonth,
      lastVerTotalBPI,
    } = this.state;

    const compareLastVer = () => {
      if (!lastVerTotalBPI) {
        return "0";
      }
      const upPer = Math.abs(
        Math.round(((totalBPI - lastVerTotalBPI) / lastVerTotalBPI) * 10000) /
          100
      );
      if (totalBPI >= lastVerTotalBPI) {
        return "+" + upPer + "%";
      } else {
        return "-" + upPer + "%";
      }
    };
    if (isLoading) {
      return (
        <Container fixed style={{ padding: 0 }}>
          <ChangeLevel
            isLoading={isLoading}
            targetLevel={targetLevel}
            changeLevel={this.changeLevel}
            isFlexEnd
          />
          <Loader />
        </Container>
      );
    }
    const rankPer =
      Math.round((totalRank / new bpiCalcuator().getTotalKaidens()) * 1000000) /
      10000;
    const social = JSON.parse(localStorage.getItem("social") || "{}");
    const url =
      config.baseUrl +
      (social && social.displayName ? "/u/" + social.displayName : "");
    return (
      <Container fixed style={{ padding: 0 }}>
        <ChangeLevel
          isLoading={isLoading}
          targetLevel={targetLevel}
          changeLevel={this.changeLevel}
          isFlexEnd
        />
        <Grid container>
          <Grid item xs={12} md={3} lg={3}>
            <div style={{ padding: "15px" }} className="responsiveTotalBPI">
              <Typography
                component="h6"
                variant="h6"
                color="textPrimary"
                gutterBottom
              >
                <FormattedMessage id="Stats.TotalBPI" />
              </Typography>
              <Typography component="h2" variant="h2" color="textPrimary">
                {totalBPI}
              </Typography>
              <Typography component="h5" variant="h5" color="textPrimary">
                推定順位 : {_withOrd(totalRank)}
                <ShareOnTwitter
                  text={`★${targetLevel}の総合BPI:${totalBPI}(推定順位:${totalRank}位,皆伝上位${rankPer}%)\n前週比:${showBpiDist(
                    totalBPI,
                    lastWeek
                  )} 前月同日比:${showBpiDist(totalBPI, lastMonth)}`}
                  url={url}
                />
              </Typography>
              <Typography component="p" variant="body1" color="textPrimary">
                皆伝上位{rankPer}%<br />
                {lastVerTotalBPI && (
                  <span>
                    前作総合BPI:{lastVerTotalBPI}(前作比{compareLastVer()})
                  </span>
                )}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} md={9} lg={9}>
            <LineChartPerBPI
              data={groupedByLevel}
              targetLevel={targetLevel}
              totalBPI={totalBPI}
            />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <BPMDistChart groupedByBPM={groupedByBPM} />
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <CommonPie
              data={groupedByDJRank}
              targetLevel={targetLevel}
              title="Stats.DistributionOfDJRank"
            />
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <CommonPie
              data={groupedByClearState}
              targetLevel={targetLevel}
              title="Stats.DistributionOfClearState"
            />
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
    <div
      style={isFlexEnd ? { display: "flex", justifyContent: "flex-end" } : {}}
    >
      <FormControl component="fieldset">
        <FormLabel component="legend" color="primary">
          表示対象
        </FormLabel>
        <RadioGroup
          aria-label="position"
          name="position"
          value={targetLevel}
          onChange={changeLevel}
          row
        >
          <FormControlLabel
            value={11}
            control={<Radio color="secondary" />}
            label="☆11"
            labelPlacement="end"
            disabled={isLoading}
          />
          <FormControlLabel
            value={12}
            control={<Radio color="secondary" />}
            label="☆12"
            labelPlacement="end"
            disabled={isLoading}
          />
        </RadioGroup>
      </FormControl>
    </div>
  );
};
