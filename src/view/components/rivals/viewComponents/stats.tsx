import React from "react";
import {
  getRadar,
  Details,
  radarData,
  withRivalData,
} from "@/components/stats/radar";
import { _chartColor, _isSingle } from "@/components/settings";
import Grid from "@mui/material/Grid";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@mui/material/";
import Loader from "@/view/components/common/loader";
import { rivalScoreData } from "@/types/data";
import Radar from "./ui/radar";
import { rivalBgColor } from "@/components/common";
import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import SubHeader from "../../topPage/subHeader";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";

interface S {
  score: any[];
  clear: any[];
  radar: radarData[];
  isLoading: boolean;
  radarDetail: string;
}

interface P {
  full: withRivalData[];
  rivalRawData: rivalScoreData[];
}

class RivalStats extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      isLoading: true,
      score: [],
      clear: [],
      radar: [],
      radarDetail: "",
    };
  }

  async componentDidMount() {
    const { full } = this.props;
    const scoresAbout = [0, 0, 0],
      scoresByLevel11 = [0, 0, 0],
      scoresByLevel12 = [0, 0, 0];
    const clearAbout = [0, 0, 0],
      clearByLevel11 = [0, 0, 0],
      clearByLevel12 = [0, 0, 0];
    for (let i = 0; i < full.length; ++i) {
      const indv = full[i];

      //win:0,draw:1,lose:2
      const ex =
        indv.myEx > indv.rivalEx ? 0 : indv.myEx === indv.rivalEx ? 1 : 2;
      /* ClearState === 7 の場合、 NOPLAY すべてのランプに劣後するため処理上 -999 として取り扱う */
      const myClear = indv.myClearState === 7 ? -999 : indv.myClearState;
      const rivalClear =
        indv.rivalClearState === 7 ? -999 : indv.rivalClearState;
      const clear = myClear > rivalClear ? 0 : myClear === rivalClear ? 1 : 2;

      scoresAbout[ex]++;
      clearAbout[clear]++;

      if (indv.difficultyLevel === "11") {
        scoresByLevel11[ex]++;
        clearByLevel11[clear]++;
      }
      if (indv.difficultyLevel === "12") {
        scoresByLevel12[ex]++;
        clearByLevel12[clear]++;
      }
    }
    return this.setState({
      score: [
        {
          name: "☆11",
          WIN: scoresByLevel11[0],
          DRAW: scoresByLevel11[1],
          LOSE: scoresByLevel11[2],
        },
        {
          name: "☆12",
          WIN: scoresByLevel12[0],
          DRAW: scoresByLevel12[1],
          LOSE: scoresByLevel12[2],
        },
      ],
      clear: [
        {
          name: "☆11",
          WIN: clearByLevel11[0],
          DRAW: clearByLevel11[1],
          LOSE: clearByLevel11[2],
        },
        {
          name: "☆12",
          WIN: clearByLevel12[0],
          DRAW: clearByLevel12[1],
          LOSE: clearByLevel12[2],
        },
      ],
      radar: await getRadar(full),
      isLoading: false,
    });
  }

  toggleRadarDetail = (title: string = "") =>
    this.setState({ radarDetail: title });

  render() {
    const { radar, isLoading, score, clear, radarDetail } = this.state;
    if (isLoading) {
      return <Loader />;
    }
    return (
      <React.Fragment>
        <div className="clearBoth" />
        <SubHeader icon={<ArrowRightIcon />} text={<>スコア勝敗</>} />
        <Graph content={score} />
        <div style={{ margin: "15px 0" }} />
        <SubHeader icon={<ArrowRightIcon />} text={<>クリア勝敗</>} />
        <Graph content={clear} />
        <div style={{ margin: "15px 0" }} />
        {_isSingle() === 1 && radar && radar.length > 0 && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <SubHeader icon={<ArrowRightIcon />} text={<>RADAR</>} />
              <Grid container spacing={0}>
                <Grid item xs={12} md={12} lg={6} style={{ height: "350px" }}>
                  <Radar withOpacity radar={radar} />
                </Grid>
                <Grid item xs={12} md={12} lg={6}>
                  <Table
                    size="small"
                    style={{ minHeight: "350px", opacity: 0.8 }}
                  >
                    <TableHead>
                      <TableRow className="detailModalTableRow">
                        <TableCell component="th">傾向</TableCell>
                        <TableCell align="right">ライバル</TableCell>
                        <TableCell align="right">あなた</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {radar
                        .concat()
                        .sort((a, b) => b.rivalTotalBPI - a.rivalTotalBPI)
                        .map((row) => (
                          <TableRow
                            key={row.title}
                            onClick={() => this.toggleRadarDetail(row.title)}
                          >
                            <TableCell component="th">{row.title}</TableCell>
                            <TableCell align="right">
                              {row.rivalTotalBPI.toFixed(2)}
                            </TableCell>
                            <TableCell align="right">
                              {row.TotalBPI.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
        {radarDetail !== "" && (
          <Details
            closeModal={this.toggleRadarDetail}
            withRival={true}
            data={radar}
            title={radarDetail}
          />
        )}
      </React.Fragment>
    );
  }
}

interface P2 {
  content: any[];
}

class Graph extends React.Component<P2, {}> {
  render() {
    const { content } = this.props;
    const chartColor = _chartColor();
    const valueAccessor = (attribute: any) => (prop: any) => {
      return prop.payload[attribute];
    };
    return (
      <div style={{ width: "100%", height: "100px", margin: "5px auto" }}>
        <ResponsiveContainer>
          <BarChart
            margin={{
              left: -20,
              right: 0,
            }}
            layout="vertical"
            data={content}
            stackOffset="expand"
          >
            <YAxis type="category" dataKey="name" stroke={chartColor + "cc"} />
            <XAxis type="number" hide />
            <Bar
              isAnimationActive={false}
              dataKey="WIN"
              stackId="a"
              fill={rivalBgColor(0) + "80"}
            >
              <LabelList valueAccessor={valueAccessor("WIN")} />
            </Bar>
            <Bar
              isAnimationActive={false}
              dataKey="DRAW"
              stackId="a"
              fill={rivalBgColor(1) + "80"}
            >
              <LabelList valueAccessor={valueAccessor("DRAW")} />
            </Bar>
            <Bar
              isAnimationActive={false}
              dataKey="LOSE"
              stackId="a"
              fill={rivalBgColor(2) + "80"}
            >
              <LabelList valueAccessor={valueAccessor("LOSE")} />
            </Bar>
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default RivalStats;
