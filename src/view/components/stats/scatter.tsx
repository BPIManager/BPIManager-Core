import * as React from 'react';
import { scoresDB } from '../../../components/indexedDB';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {_isSingle,_currentStore, _chartColor, _goalBPI} from "../../../components/settings";
import CircularProgress from '@material-ui/core/CircularProgress';
import { XAxis, CartesianGrid, YAxis, Tooltip, ResponsiveContainer, ScatterChart, Scatter } from 'recharts';
import { _prefix } from '../../../components/songs/filter';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

interface S {
  isLoading:boolean,
  scatterGraph:any[],
  currentVersion:string,
  targetVersion:string,
  targetLevel:string,
  way:number,
}

class ScatterGraph extends React.Component<{},S> {

  constructor(props:{}){
    super(props);
    this.state ={
      isLoading:true,
      scatterGraph:[],
      currentVersion:_currentStore(),
      targetVersion:String(Number(_currentStore()) - 1),
      targetLevel:"12",
      way:0,
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(newData:{currentVersion:string,targetVersion:string,targetLevel:string,way:number} = {
    currentVersion:this.state.currentVersion,
    targetVersion:this.state.targetVersion,
    targetLevel:this.state.targetLevel,
    way:this.state.way
  }){
    const isSingle = _isSingle();
    let {currentVersion,targetVersion,targetLevel,way} = newData;
    const goalBPI = _goalBPI();
    const db = await new scoresDB(isSingle,currentVersion).loadStore();
    const currentVer = await db.getItemsBySongDifficulty(targetLevel);
    const lastVer = await db.getItemsBySongDifficultyWithSpecificVersion(targetLevel,targetVersion);
    let scatterGraph:{label:string,x:number,y:number,last:number}[]  = [];
    for(let item in currentVer){
      const current = currentVer[item];
      const last = targetVersion === "OBPI" ? goalBPI : lastVer[current.title + current.difficulty];
      if(!Number.isNaN(last)){
        const m = way === 0 && last !== 0 ? Math.ceil( 1000 * current.currentBPI / last )  / 10  - 100 : way === 1 ? current.currentBPI - last : last;
        scatterGraph.push({label:current.title + _prefix(current.difficulty) ,x:m ,y:current.currentBPI,last:last})
      }
    }
    //BPI別集計
    this.setState(Object.assign({
      isLoading:false,
      scatterGraph:scatterGraph,
    },newData));
  }

  handleFromChange = async(event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    if (typeof event.target.value !== "string") return;
    if(event.target.value === this.state.targetVersion) return;
    this.setState({isLoading:true});
    return this.updateScoreData({currentVersion:event.target.value,targetVersion:this.state.targetVersion,targetLevel:this.state.targetLevel,way:this.state.way});
  }

  handleToChange = async(event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    if (typeof event.target.value !== "string") { return; }
    if(event.target.value === this.state.currentVersion) return;
    this.setState({isLoading:true});
    return this.updateScoreData({currentVersion:this.state.currentVersion,targetVersion:event.target.value,targetLevel:this.state.targetLevel,way:this.state.way});
  }

  handleLevelChange = async(event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    if (typeof event.target.value !== "string") { return; }
    this.setState({isLoading:true});
    return this.updateScoreData({currentVersion:this.state.currentVersion,targetVersion:this.state.targetVersion,targetLevel:event.target.value,way:this.state.way});
  }

  handleWayChange = async(event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    if (typeof event.target.value !== "number") { return; }
    this.setState({isLoading:true});
    return this.updateScoreData({currentVersion:this.state.currentVersion,targetVersion:this.state.targetVersion,targetLevel:this.state.targetLevel,way:event.target.value});
  }


  render(){
    const {isLoading,scatterGraph,currentVersion,targetVersion,targetLevel,way} = this.state;
    const CustomTooltip = (props:any) => {
      if (props.active && props.payload[0].payload) {
        const p = props.payload[0].payload;
        return (
          <div className="custom-tooltip">
            <p><b>{p.label}</b></p>
            <p>{way === 0 ? "上昇率" : "差"}:{p.x > 0 && "+"}{p.x.toFixed(1)}{way === 0 && "%"}</p>
            <p>今作:{p.y}</p>
            <p>前作:{p.last}</p>
          </div>
        );
      }
      return (null);
    }
    const chartColor = _chartColor();
    return (
      <Container style={{padding:0}} fixed>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper style={{padding:"15px"}}>
              <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                BPI相関
              </Typography>
              <Grid container spacing={1} style={{margin:"5px 0"}}>
                <Grid item xs={6} lg={3}>
                  <FormControl style={{width:"100%"}}>
                    <InputLabel>比較元</InputLabel>
                    <Select value={currentVersion} onChange={this.handleFromChange}>
                      <MenuItem value={"27"}>27 HEROIC VERSE</MenuItem>
                      <MenuItem value={"26"}>26 Rootage</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} lg={3}>
                  <FormControl component="fieldset" style={{width:"100%"}}>
                    <InputLabel>比較先</InputLabel>
                    <Select value={targetVersion} onChange={this.handleToChange}>
                      <MenuItem value={"27"}>27 HEROIC VERSE</MenuItem>
                      <MenuItem value={"26"}>26 Rootage</MenuItem>
                      <MenuItem value={"OBPI"}>目標BPI</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} lg={3}>
                  <FormControl component="fieldset" style={{width:"100%"}}>
                    <InputLabel>レベル</InputLabel>
                    <Select value={targetLevel} onChange={this.handleLevelChange}>
                      <MenuItem value={"12"}>☆12</MenuItem>
                      <MenuItem value={"11"}>☆11</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6} lg={3}>
                  <FormControl component="fieldset" style={{width:"100%"}}>
                    <InputLabel>比較方法</InputLabel>
                    <Select value={way} onChange={this.handleWayChange}>
                      <MenuItem value={0}>上昇率</MenuItem>
                      <MenuItem value={1}>点数差</MenuItem>
                      <MenuItem value={2}>単純比較</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {isLoading &&
                <Container className="loaderCentered">
                  <CircularProgress />
                </Container>
              }
              {!isLoading && <div>
                {scatterGraph.length === 0 && <p>表示するデータが見つかりません。</p>}
                {(scatterGraph.length > 0) &&
                  <Grid container spacing={0}>
                  <Grid item xs={12} md={12} lg={12} style={{height:"500px"}}>
                    <div style={{width:"100%",height:"100%"}}>
                      <ResponsiveContainer>
                        <ScatterChart margin={{top: 5, right: 30, left: -30, bottom: 30,}}>
                          <CartesianGrid />
                          <XAxis type="number" dataKey="x" name="前作比較" unit={way === 0 ? "％" : ""} stroke={chartColor} />
                          <YAxis type="number" dataKey="y" name="今作BPI" unit="" stroke={chartColor} />
                          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="A school" data={scatterGraph} fill="#8884d8" />
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
      </Container>
    );
  }
}

export default ScatterGraph;
