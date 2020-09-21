import * as React from 'react';
import Container from '@material-ui/core/Container';
import {_chartColor, _chartBarColor} from "@/components/settings";
import { XAxis, CartesianGrid, YAxis, Tooltip, Bar, ResponsiveContainer, Line, ComposedChart, Legend, LineChart} from 'recharts';
import {FormControlLabel, FormControl, FormLabel, Checkbox, FormGroup, Divider, Typography} from '@material-ui/core/';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Loader from '../common/loader';
import { ShiftType } from '@/types/stats';
import { statMain } from '@/components/stats/main';
import Alert from '@material-ui/lab/Alert/Alert';
import { ChangeLevel } from './main';
import { injectIntl } from 'react-intl';
import AdsCard from '@/components/ad';

class Shift extends React.Component<{intl:any}&RouteComponentProps,ShiftType> {

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      perDate:[],
      targetLevel:12,
      currentPeriod:4,
      displayData:[0,1],
      showDisplayDataConfig:false,
      graphLastUpdated:new Date().getTime(),
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(newState?:ShiftType){
    const {currentPeriod,targetLevel} = newState || this.state;
    const exec = await new statMain(targetLevel).load();
    //BPI別集計
    this.setState({
      isLoading:false,
      perDate:await exec.eachDaySum(currentPeriod),
    });
  }

  onClickByLevel = (data:any,_index:any)=>{
    if(!data || !data.activeLabel){
      return;
    }
    this.props.history.push("/songs?initialBPIRange=" + data.activeLabel);
  }

  changeLevel = async (e:React.ChangeEvent<HTMLInputElement>,)=>{
    if(typeof e.target.value === "string"){
      let newState = this.cloneState();
      newState.targetLevel = e.target.value;
      const targetLevel = Number(e.target.value);
      this.setState({targetLevel:targetLevel,isLoading:true});
      await this.updateScoreData(newState);
    }
  }

  hasItems = (name:number)=> this.state.displayData.indexOf(name) > -1;
  currentPeriod = (name:number)=> this.state.currentPeriod === name;
  /*
  0:更新楽曲数
  1:平均
  2:最高
  3:最低
  4:中央
   */

  handleItems = (name:number)=>{
    const {displayData} = this.state;
    if(this.hasItems(name)){
      return this.setState({displayData:displayData.filter((item:number)=>item !== name)});
    }else{
      displayData.push(name);
      return this.setState({displayData:displayData});
    }
  }

  handlePeriod = async(name:number)=>{
    let newState = this.cloneState();
    newState.currentPeriod = name;
    this.setState({currentPeriod:name});
    return this.updateScoreData(newState);
  }

  cloneState = ()=> JSON.parse(JSON.stringify(this.state));

  render(){
    const {isLoading,perDate,targetLevel,graphLastUpdated} = this.state;
    const {formatMessage} = this.props.intl;
    const config = [
      {value:0,label:"更新楽曲数"},
      {value:1,label:"平均値"},
      {value:2,label:"最高値"},
      {value:3,label:"最低値"},
      {value:4,label:"中央値"}
    ];
    const period = [
      {value:4,label:"日次"},
      {value:5,label:"週次"},
      {value:6,label:"月次"}
    ];
    const chartColor = _chartColor();
    const barColor = _chartBarColor("bar");
    const lineColor = _chartBarColor("line");
    if(isLoading){
      return (
        <Container fixed  style={{padding:0}}>
          <ChangeLevel isLoading={isLoading} targetLevel={targetLevel} changeLevel={this.changeLevel}/>
          <Loader/>
        </Container>
      );
    }

    return (
      <Container fixed  style={{padding:0}}>
        <ChangeLevel isLoading={isLoading} targetLevel={targetLevel} changeLevel={this.changeLevel}/>
        <CheckBoxes title="プライマリグラフの表示項目" hasData={this.hasItems} handleNewData={this.handleItems} config={config}/>
        <CheckBoxes title="表示期間" hasData={this.currentPeriod} handleNewData={this.handlePeriod} config={period}/>
        <Divider style={{margin:"10px 0"}}/>
        {perDate.length > 0 &&
          <div style={{width:"95%",height:"450px",margin:"5px auto"}}>
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
                {this.hasItems(0) && <Bar dataKey="sum" name={formatMessage({id:"Stats.UpdatedSum"})} fill={barColor} />}
                {[
                  {key:"avg",name:"Stats.Average",fillColor:lineColor,value:1},
                  {key:"max",name:"Stats.Max",fillColor:_chartBarColor("line2"),value:2},
                  {key:"min",name:"Stats.Min",fillColor:_chartBarColor("line3"),value:3},
                  {key:"med",name:"Stats.Median",fillColor:_chartBarColor("line4"),value:4},
                ].map((item:any)=>{
                  if(this.hasItems(item.value)){
                    return <Line dataKey={item.key} key={item.name} dot={false} name={formatMessage({id:item.name})} stroke={item.fillColor} />
                  }
                  return (null);
                })}
                <Legend/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        }
        {perDate.length > 0 &&
          <div style={{width:"95%",height:"450px",margin:"5px auto 30px auto"}}>
            <Divider style={{margin:"15px 0"}}/>
            <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
              総合BPI推移
            </Typography>
            <ResponsiveContainer width="100%">
              <LineChart
                key={graphLastUpdated}
                data={perDate}
                margin={{
                  top: 5, right: 30, left: -30, bottom: 25,
                }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke={chartColor} />
                <YAxis orientation="left" domain={['dataMin - 0.2', 'dataMax + 0.2']} tickLine={false} axisLine={false} stroke={chartColor}/>
                <Tooltip contentStyle={{color:"#333"}}/>
                <Line dataKey="shiftedBPI" name={formatMessage({id:"Stats.TotalBPI"})} stroke={lineColor} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        }
        {perDate.length === 0 && (
        <Alert severity="warning" style={{margin:"10px 0"}}>
          <p>
            表示できる内容がありません。<br/>
            楽曲データを1曲以上登録することで、日次・週次・月次データを確認できます。
          </p>
        </Alert>
        )}
        <AdsCard/>
      </Container>
    );
  }
}

export default withRouter(injectIntl(Shift));

class CheckBoxes extends React.Component<{
  config:any[],
  hasData:(name:number)=>boolean,
  handleNewData:(name:number)=>void,
  title:string
},{}>{

  render(){
    const {config,hasData,handleNewData,title} = this.props;
    return (
      <FormGroup>
        <FormControl component="fieldset">
          <FormLabel component="legend">{title}</FormLabel>
          <FormGroup row>
            {config.map((item:{value:number,label:string})=>(
              <FormControlLabel
                key={item.value}
                control={
                  <Checkbox
                    checked={hasData(item.value)}
                    onChange={()=>handleNewData(item.value)}
                    value={item.value}
                    color="primary"
                  />
                }
                label={item.label}
              />
            ))}
          </FormGroup>
        </FormControl>
      </FormGroup>
    );
  }
}
