import * as React from 'react';
import { songsDB } from '@/components/indexedDB';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import bpiCalcuator from '@/components/bpi';
import {_chartColor, _chartBarColor} from "@/components/settings";
import { XAxis, CartesianGrid, YAxis, Tooltip, Bar, ResponsiveContainer, Line, ComposedChart, LineChart, BarChart, ReferenceLine, Legend} from 'recharts';
import _withOrd from '@/components/common/ord';
import {FormControlLabel, FormControl, RadioGroup, Radio, FormLabel, IconButton, Dialog, DialogTitle, DialogContent, Checkbox, DialogActions, Button, FormGroup} from '@material-ui/core/';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Loader from '../common/loader';
import { bpmDist } from '@/components/stats/bpmDist';
import { S } from '@/types/stats';
import { BPITicker, statMain } from '@/components/stats/main';
import SettingsIcon from '@material-ui/icons/Settings';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle/AlertTitle';

class Main extends React.Component<{intl:any}&RouteComponentProps,S> {

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      totalBPI:0,
      totalRank:0,
      perDate:[],
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

    const songsNum = await new songsDB().getSongsNum(String(targetLevel));

    const totalBPI = bpi.setSongs(exec.at(),songsNum);
    //BPI別集計
    this.setState({
      isLoading:false,
      totalBPI:totalBPI,
      totalRank:bpi.rank(totalBPI,false),
      perDate:await exec.eachDaySum(),
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
    const {totalBPI,isLoading,perDate,targetLevel,groupedByBPM,totalRank,groupedByLevel,groupedByDJRank,groupedByClearState,showDisplayDataConfig,displayData,graphLastUpdated} = this.state;
    const {formatMessage} = this.props.intl;
    const chartColor = _chartColor();
    const barColor = _chartBarColor("bar");
    const lineColor = _chartBarColor("line");
    if(isLoading){
      return (
        <Container fixed style={{padding:0}}>
          <ChangeLevel isLoading={isLoading} targetLevel={targetLevel} changeLevel={this.changeLevel}/>
          <Loader/>
        </Container>
      );
    }

    return (
      <Container fixed style={{padding:0}}>
        <ChangeLevel isLoading={isLoading} targetLevel={targetLevel} changeLevel={this.changeLevel}/>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} lg={3}>
            <Paper style={{padding:"15px"}} className="responsiveTotalBPI">
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
            <Paper style={{padding:"15px",height:240}}>
              <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                <FormattedMessage id="Stats.EachDay"/>
                <IconButton edge="end" style={{float:"right"}} size="small" aria-haspopup="true"
                  onClick={this.showDisplayDataConfig}>
                    <SettingsIcon />
                </IconButton>
              </Typography>
              {perDate.length > 0 &&
                <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
                  <ResponsiveContainer width="100%">
                    <ComposedChart
                      key={graphLastUpdated}
                      data={perDate}
                      margin={{
                        top: 5, right: 30, left: -30, bottom: 25,
                      }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke={chartColor} />
                      <YAxis orientation="left" tickLine={false} axisLine={false} stroke={chartColor}/>
                      <Tooltip contentStyle={{color:"#333"}}/>
                      {this.hasData(0) && <Bar dataKey="sum" name={formatMessage({id:"Stats.UpdatedSum"})} fill={barColor} />}
                      {[
                        {key:"avg",name:"Stats.Average",fillColor:lineColor,value:1},
                        {key:"max",name:"Stats.Max",fillColor:_chartBarColor("line2"),value:2},
                        {key:"min",name:"Stats.Min",fillColor:_chartBarColor("line3"),value:3},
                        {key:"med",name:"Stats.Median",fillColor:_chartBarColor("line4"),value:4},
                      ].map((item:any)=>{
                        if(this.hasData(item.value)){
                          return <Line dataKey={item.key} dot={false} name={formatMessage({id:item.name})} stroke={item.fillColor} />
                        }
                        return (null);
                      })}
                      <Legend/>
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              }
              {perDate.length === 0 && <p>No data found.</p>}
            </Paper>
          </Grid>
        </Grid>
        {showDisplayDataConfig && <ChangeDisplayData currentData={displayData} applyAndClose={this.applyDisplayConfig} />}
        <Grid container spacing={3}>
          <Grid item xs={12} md={12} lg={12}>
            <Paper style={{padding:"15px",height:270}}>
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
            <Paper style={{padding:"15px",height:270}}>
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
            <Paper style={{padding:"15px",height:270}}>
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
            <Paper style={{padding:"15px",height:270}}>
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

class ChangeLevel extends React.Component<{targetLevel:number,changeLevel:(e:React.ChangeEvent<HTMLInputElement>)=>void,isLoading:boolean},{}>{

  render(){
    const {targetLevel,changeLevel,isLoading} = this.props;
    return (
      <div style={{display:"flex",justifyContent:"flex-end"}}>
      <FormControl component="fieldset">
        <FormLabel component="legend">表示対象</FormLabel>
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

interface PDisplayData {currentData:number[],applyAndClose:(data:any)=>void};
class ChangeDisplayData extends React.Component<PDisplayData,{
  newData:number[]
}>{


  constructor(props:PDisplayData){
    super(props);
    this.state = {
      newData:this.props.currentData || []
    }
  }

  hasData = (name:number)=> this.state.newData.indexOf(name) > -1;
  /*
  0:更新楽曲数
  1:平均
  2:最高
  3:最低
  4:中央
   */

  handleNewData = (name:number)=>{
    const {newData} = this.state;
    if(this.hasData(name)){
      return this.setState({newData:newData.filter((item:number)=>item !== name)});
    }else{
      newData.push(name);
      return this.setState({newData:newData});
    }
  }
  render(){
    const {applyAndClose} = this.props;
    const {newData} = this.state;
    const config = [
      {value:0,label:"更新楽曲数"},
      {value:1,label:"平均値"},
      {value:2,label:"最高値"},
      {value:3,label:"最低値"},
      {value:4,label:"中央値"}
    ]
    return (
      <Dialog open={true} onClose={()=>applyAndClose(newData)}>
        <DialogTitle>表示内容のカスタマイズ</DialogTitle>
        <DialogContent>
          <FormGroup>
            {config.map((item:{value:number,label:string})=>(
            <FormControlLabel
              control={
                <Checkbox
                  key={item.value}
                  checked={this.hasData(item.value)}
                  onChange={()=>this.handleNewData(item.value)}
                  value={item.value}
                  color="primary"
                />
              }
              label={item.label}
            />
          ))}
          </FormGroup>
          <Alert severity="info" style={{margin:"10px 0"}}>
            <AlertTitle style={{marginTop:"0px",fontWeight:"bold"}}>この画面について</AlertTitle>
            <p>
              日別情報に表示する内容をこの画面からカスタマイズすることができます。<br/>
              この機能は後日、別の形で再実装する可能性があります。
            </p>
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={()=>applyAndClose(newData)} color="primary">
            適用
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
