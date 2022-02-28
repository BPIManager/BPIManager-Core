import * as React from 'react';
import { scoresDB } from '@/components/indexedDB';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { _isSingle, _currentStore, _chartColor, _goalBPI } from "@/components/settings";
import { XAxis, CartesianGrid, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { _prefix } from '@/components/songs/filter';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Loader from '@/view/components/common/loader';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { versionTitles } from '@/components/common/versions';

interface scatterGraph {
  label: string,
  x: number,
  y: number,
  last: number
}

interface S {
  isLoading: boolean,
  scatterGraph: scatterGraph[],
  currentVersion: string,
  targetVersion: string,
  targetLevel: string,
  way: number,
  errors: scatterGraph[],
}

class ScatterGraph extends React.Component<{}, S> {

  constructor(props: {}) {
    super(props);
    this.state = {
      isLoading: true,
      scatterGraph: [],
      currentVersion: _currentStore(),
      targetVersion: String(Number(_currentStore()) - 1),
      targetLevel: "12",
      way: 0,
      errors: []
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount() {
    await this.updateScoreData();
  }

  default = () => {
    return {
      currentVersion: this.state.currentVersion,
      targetVersion: this.state.targetVersion,
      targetLevel: this.state.targetLevel,
      way: this.state.way
    }
  }

  async updateScoreData(newData: { currentVersion: string, targetVersion: string, targetLevel: string, way: number } = this.default()) {
    const isSingle = _isSingle();
    let { currentVersion, targetVersion, targetLevel, way } = newData;
    const goalBPI = _goalBPI();
    const db = await new scoresDB(isSingle, currentVersion).loadStore();
    const currentVer = await db.getItemsBySongDifficulty(targetLevel);
    const lastVer = await db.getItemsBySongDifficultyWithSpecificVersion(targetLevel, targetVersion);
    let scatterGraph: scatterGraph[] = [];
    let errors: scatterGraph[] = [];
    for (let item in currentVer) {
      const current = currentVer[item];
      const last = targetVersion === "OBPI" ? goalBPI : lastVer[current.title + current.difficulty];
      const x = way === 0 && last !== 0 ? Math.ceil(1000 * current.currentBPI / last) / 10 - 100 : (way === 1 || way === 2) ? current.currentBPI - last : last;
      if ((last && !Number.isNaN(last)) && (current.currentBPI && !Number.isNaN(current.currentBPI)) && (x && !Number.isNaN(x))) {
        const p = {
          label: current.title + _prefix(current.difficulty),
          x: x,
          y: current.currentBPI,
          last: last
        };
        if (x > 500 || x < -500) {
          errors.push(p);
        } else {
          scatterGraph.push(p);
        }
      } else {
        errors.push({
          label: current.title + _prefix(current.difficulty),
          x: NaN, y: NaN, last: NaN
        });
      }
    }
    //BPI別集計
    this.setState(Object.assign({
      isLoading: false,
      scatterGraph: scatterGraph,
      errors: errors
    }, newData));
  }

  handleChanger = (target: "currentVersion" | "targetVersion" | "targetLevel" | "way") => async (event: SelectChangeEvent<number | string>): Promise<void> => {
    if (typeof event.target.value !== (target === "way" ? "number" : "string")) return;
    if (event.target.value === this.state[target]) return;
    this.setState({ isLoading: true });
    return this.updateScoreData(Object.assign(this.default(), { [target]: event.target.value }));
  }

  render() {
    const { isLoading, scatterGraph, currentVersion, targetVersion, targetLevel, way, errors } = this.state;
    const CustomTooltip = (props: any) => {
      if (props.active && props.payload[0].payload) {
        const p = props.payload[0].payload;
        return (
          <div className="custom-tooltip">
            <p><b>{p.label}</b></p>
            <p>{way === 0 ? "上昇率" : "差"}:{p.x > 0 && "+"}{p.x.toFixed(2)}{way === 0 && "%"}</p>
            <p>今作:{p.y}</p>
            <p>前作:{p.last}</p>
          </div>
        );
      }
      return (null);
    }
    const chartColor = _chartColor();
    return (
      <Container fixed style={{ padding: 0 }}>
        <Grid container>
          <Grid item xs={12} md={12} lg={12}>
            <Paper style={{ padding: "15px" }} elevation={0}>
              <Grid container spacing={1} style={{ margin: "5px 0" }}>
                <Grid item xs={6} lg={3}>
                  <FormControl style={{ width: "100%" }}>
                    <InputLabel>比較元</InputLabel>
                    <Select value={currentVersion} onChange={this.handleChanger("currentVersion")}>
                      {versionTitles.map((item) => <MenuItem value={item.num}>{item.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} lg={3}>
                  <FormControl component="fieldset" style={{ width: "100%" }}>
                    <InputLabel>比較先</InputLabel>
                    <Select value={targetVersion} onChange={this.handleChanger("targetVersion")}>
                      {versionTitles.map((item) => <MenuItem value={item.num}>{item.title}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} lg={3}>
                  <FormControl component="fieldset" style={{ width: "100%" }}>
                    <InputLabel>レベル</InputLabel>
                    <Select value={targetLevel} onChange={this.handleChanger("targetLevel")}>
                      <MenuItem value={"12"}>☆12</MenuItem>
                      <MenuItem value={"11"}>☆11</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} lg={3}>
                  <FormControl component="fieldset" style={{ width: "100%" }}>
                    <InputLabel>比較方法</InputLabel>
                    <Select value={way} onChange={this.handleChanger("way")}>
                      <MenuItem value={0}>上昇率</MenuItem>
                      <MenuItem value={1}>点数差</MenuItem>
                      <MenuItem value={2}>単純比較</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {isLoading && <Loader />}
              {!isLoading && <div>
                {scatterGraph.length === 0 && <p>表示するデータが見つかりません。</p>}
                {(scatterGraph.length > 0) &&
                  <Grid container spacing={0}>
                    <Grid item xs={12} md={12} lg={12} style={{ height: "500px" }}>
                      <div style={{ width: "100%", height: "100%" }}>
                        <ResponsiveContainer>
                          <ScatterChart margin={{ top: 5, right: 30, left: -30, bottom: 30, }}>
                            <CartesianGrid />
                            <XAxis type="number" dataKey={way === 2 ? "y" : "x"} name="前作比較" unit={way === 0 ? "％" : ""} stroke={chartColor} />
                            <YAxis type="number" dataKey={way === 2 ? "last" : "y"} name="今作BPI" unit={""} stroke={chartColor} />
                            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                            <Scatter data={scatterGraph} fill="#8884d8" />
                          </ScatterChart>
                        </ResponsiveContainer>
                      </div>
                    </Grid>
                  </Grid>
                }
              </div>
              }
            </Paper>
          </Grid>
        </Grid>
        {errors.length > 0 && (
          <Alert severity="error" style={{ margin: "10px 0" }}>
            <AlertTitle style={{ marginTop: "0px", fontWeight: "bold" }}>すべてを表示していません</AlertTitle>
            <p>
              以下のデータについて、グラフ上の表示を省略しています。
          </p>
            <ul>
              {errors.map((item: scatterGraph, i: number) => {
                return <li key={i}>{item.label} / x:{item.x} y:{item.y}</li>
              })}
            </ul>
          </Alert>
        )}
        <Alert severity="info" style={{ margin: "10px 0" }}>
          <AlertTitle style={{ marginTop: "0px", fontWeight: "bold" }}>分布機能について</AlertTitle>
          <p>
            これはバージョン間で楽曲スコアがどれだけ伸びたかを視覚化する機能です。<br />
            前作に比べ、大幅に上達したのか、あまり上達していないのか、はたまた下手になっているのか、といった判断を、他の楽曲の上昇率と比較し相対的に判断することを目的として搭載されています。
          </p>
        </Alert>
      </Container>
    );
  }
}

export default ScatterGraph;
