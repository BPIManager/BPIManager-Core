import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import bpiCalcuator from '@/components/bpi';
import {_chartColor, _chartBarColor} from "@/components/settings";
import { XAxis, CartesianGrid, YAxis, Tooltip, Bar, ResponsiveContainer, Line, LineChart, BarChart, ReferenceLine} from 'recharts';
import _withOrd from '@/components/common/ord';
import {FormControlLabel, FormControl, RadioGroup, Radio, FormLabel} from '@material-ui/core/';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Loader from '../common/loader';
import { bpmDist } from '@/components/stats/bpmDist';
import { S } from '@/types/stats';
import { BPITicker, statMain } from '@/components/stats/main';

class Main extends React.Component<{intl:any}&RouteComponentProps,S> {

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      totalBPI:0,
      totalRank:0,
      groupedByLevel:[],
      groupedByDiff:[],
      groupedByBPM:[],
      groupedByDJRank:[],
      groupedByClearState:[],
      targetLevel:12,
      displayData:[0,1],
      showDisplayDataConfig:false,
      graphLastUpdated:new Date().getTime(),
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(targetLevel = 12){
    const bpi = new bpiCalcuator();
    const exec = await new statMain(targetLevel).load();
    const totalBPI = bpi.setSongs(exec.at(),exec.at().length);
    //BPI別集計
    this.setState({
      isLoading:false,
      totalBPI:totalBPI,
      totalRank:bpi.rank(totalBPI,false),
      groupedByLevel:await exec.groupedByLevel(),
      groupedByBPM:await bpmDist(String(targetLevel) as "11"|"12"),
      groupedByDJRank:await exec.songsByDJRank(),
      groupedByClearState:await exec.songsByClearState(),
    });
  }

  onClickByLevel = (data:any,_index:any)=>{
    if(!data || !data.activeLabel){
      return;
    }
    this.props.history.push("/songs?initialBPIRange=" + data.activeLabel);
  }

  xAxisTicker = ():number[]=> [...BPITicker,this.state.totalBPI].sort((a,b)=>a-b);

  changeLevel = async (e:React.ChangeEvent<HTMLInputElement>,)=>{
    if(typeof e.target.value === "string"){
      const targetLevel = Number(e.target.value);
      this.setState({targetLevel:targetLevel,isLoading:true});
      await this.updateScoreData(targetLevel);
    }
  }

  applyDisplayConfig = (newData:number[])=> this.setState({displayData:newData,showDisplayDataConfig:false,graphLastUpdated:new Date().getTime()});
  showDisplayDataConfig = ()=> this.setState({showDisplayDataConfig:true});
  hasData = (name:number)=> this.state.displayData.indexOf(name) > -1;

  render(){
    const {totalBPI,isLoading,targetLevel,groupedByBPM,totalRank,groupedByLevel,groupedByDJRank,groupedByClearState} = this.state;
    const chartColor = _chartColor();
    const barColor = _chartBarColor("bar");
    const lineColor = _chartBarColor("line");
    if(isLoading){
      return (
        <Container fixed style={{padding:0}}>
          <ChangeLevel isLoading={isLoading} targetLevel={targetLevel} changeLevel={this.changeLevel} isFlexEnd/>
          <Loader/>
        </Container>
      );
    }

    return (
      <Container fixed style={{padding:0}}>
        <ChangeLevel isLoading={isLoading} targetLevel={targetLevel} changeLevel={this.changeLevel} isFlexEnd/>
        <Grid container>
          <Grid item xs={12} md={3} lg={3}>
            <Paper style={{padding:"15px"}} className="responsiveTotalBPI" elevation={0}>
              <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                <FormattedMessage id="Stats.TotalBPI"/>
              </Typography>
              <Typography component="h2" variant="h2" color="textPrimary">
                {totalBPI}
              </Typography>
              <Typography component="h5" variant="h5" color="textPrimary">
                Est. Rank : {_withOrd(totalRank)}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9} lg={9}>
            <Paper style={{padding:"15px",height:270}} elevation={0}>
              <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                <FormattedMessage id="Stats.Distribution"/>
              </Typography>
              {(groupedByLevel.length > 0) &&
                <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
                  <ResponsiveContainer width="100%">
                    <LineChart
                      data={groupedByLevel}
                      onClick={this.onClickByLevel}
                      margin={{
                        top: 5, right: 30, left: -30, bottom: 30,
                      }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type={"number"} dataKey="name" stroke={chartColor} ticks={this.xAxisTicker()} domain={[-20,100]}/>
                        <YAxis stroke={chartColor}/>
                        <Tooltip contentStyle={{color:"#333"}}/>
                        <ReferenceLine x={totalBPI} stroke={barColor} isFront={true} />
                        <Line type="monotone" dataKey={"☆" + targetLevel} stroke={lineColor} activeDot={{ r: 8 }} />
                      </LineChart>
                  </ResponsiveContainer>
                </div>
              }
              {groupedByLevel.length === 0 && <p>No data found.</p>}
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper style={{padding:"15px",height:270}} elevation={0}>
              <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                <FormattedMessage id="Stats.DistributionByBPM"/>
              </Typography>
              {(groupedByBPM.length > 0) &&
                <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
                  <ResponsiveContainer width="100%">
                    <BarChart
                      layout="vertical"
                      data={groupedByBPM}
                      margin={{
                      top: 5, right: 30, left: -30, bottom: 30,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis stroke={chartColor} type="number" />
                      <YAxis stroke={chartColor} type="category" dataKey="name" />
                      <Tooltip contentStyle={{color:"#333"}}/>
                      <Bar dataKey="BPI" fill={barColor} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              }
              {groupedByLevel.length === 0 && <p>No data found.</p>}
            </Paper>
          </Grid>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={6}>
            <Paper style={{padding:"15px",height:270}} elevation={0}>
              <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                <FormattedMessage id="Stats.DistributionOfDJRank"/>
              </Typography>
              {(groupedByDJRank.length > 0) &&
                <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
                  <ResponsiveContainer width="100%">
                    <BarChart
                      data={groupedByDJRank}
                      margin={{
                        top: 5, right: 30, left: -30, bottom: 30,
                      }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke={chartColor} />
                        <YAxis stroke={chartColor} />
                        <Tooltip contentStyle={{color:"#333"}} />
                        <Bar dataKey={"☆" + targetLevel} fill={barColor} />
                      </BarChart>
                  </ResponsiveContainer>
                </div>
              }
              {groupedByDJRank.length === 0 && <p>No data found.</p>}
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={6}>
            <Paper style={{padding:"15px",height:270}} elevation={0}>
              <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                <FormattedMessage id="Stats.DistributionOfClearState"/>
              </Typography>
              {(groupedByClearState.length > 0) &&
                <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
                  <ResponsiveContainer width="100%">
                    <BarChart
                      data={groupedByClearState}
                      margin={{
                        top: 5, right: 30, left: -30, bottom: 30,
                      }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke={chartColor} />
                        <YAxis stroke={chartColor}/>
                        <Tooltip contentStyle={{color:"#333"}}/>
                        <Bar dataKey={"☆" + targetLevel} fill={barColor} />
                      </BarChart>
                  </ResponsiveContainer>
                </div>
              }
              {groupedByClearState.length === 0 && <p>No data found.</p>}
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }
}

export default withRouter(injectIntl(Main));

export class ChangeLevel extends React.Component<{targetLevel:number,changeLevel:(e:React.ChangeEvent<HTMLInputElement>)=>void,isLoading:boolean,isFlexEnd?:boolean},{}>{

  render(){
    const {targetLevel,changeLevel,isLoading,isFlexEnd} = this.props;
    return (
      <div style={isFlexEnd ? {display:"flex",justifyContent:"flex-end"} :  {}}>
      <FormControl component="fieldset">
        <FormLabel component="legend" color="primary">表示対象</FormLabel>
        <RadioGroup aria-label="position" name="position" value={targetLevel} onChange={changeLevel} row>
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
    )
  }
}
