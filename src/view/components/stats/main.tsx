import * as React from 'react';
import { scoresDB, songsDB, scoreHistoryDB } from '../../../components/indexedDB';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import bpiCalcuator from '../../../components/bpi';
import {_isSingle,_currentStore, _chartColor} from "../../../components/settings";
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { XAxis, CartesianGrid, YAxis, Tooltip, Bar, ResponsiveContainer, Line, ComposedChart, LineChart, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, ReferenceLine} from 'recharts';
import _withOrd from '../../../components/common/ord';
import {Link as RefLink, Table, TableRow, TableCell, TableBody, FormControlLabel, FormControl, RadioGroup, Radio, Divider, FormLabel} from '@material-ui/core/';
import { difficultyDiscriminator } from '../../../components/songs/filter';
import { songData, scoreData, historyData } from '../../../types/data';
import { _DiscriminateRanksByNumber } from '../../../components/common/djRank';
import { getRadar, Details, radarData } from '../common/radar';
import { withRouter, RouteComponentProps } from 'react-router-dom';

const ticker = [-20,-10,0,10,20,30,40,50,60,70,80,90,100];

interface groupedArray {
  "name":string|number,
  "☆11":number,
  "☆12":number,
}

interface groupedByLevel extends groupedArray {
  "name":number
}

interface perDate {
  name:string,
  sum:number,
  avg:number
}

interface S {
  isLoading:boolean,
  totalBPI:number,
  totalRank:number,
  perDate:perDate[],
  groupedByLevel:groupedByLevel[],
  groupedByDiff:groupedArray[],
  radar:radarData[],
  groupedByDJRank:groupedArray[],
  groupedByClearState:groupedArray[],
  radarDetail:string,
  targetLevel:number,
}

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
      radar:[],
      groupedByDJRank:[],
      groupedByClearState:[],
      radarDetail:"",
      targetLevel:12,
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(targetLevel = 12){
    const isSingle = _isSingle();
    const currentStore = _currentStore();
    const db = await new scoresDB(isSingle,currentStore).loadStore();
    const bpi = new bpiCalcuator();
    const twelves = await db.getItemsBySongDifficulty("12");
    const elevens = await db.getItemsBySongDifficulty("11");
    const bpiMapper = (t:scoreData[])=>t.map((item:scoreData)=>item.currentBPI);
    const allSongsTwelvesBPI = this.groupBy(bpiMapper(twelves));
    const allSongsElevensBPI = this.groupBy(bpiMapper(elevens));
    const songFinder = (level:string,title:string,difficulty:string)=>(
      level === "12" ? twelves : elevens
    ).find(elm=>( elm.title === title && elm.difficulty === difficultyDiscriminator(difficulty) ) )
    const songsByDJRank:groupedArray[] = [
      {name:"F","☆11":0,"☆12":0},
      {name:"E","☆11":0,"☆12":0},
      {name:"D","☆11":0,"☆12":0},
      {name:"C","☆11":0,"☆12":0},
      {name:"B","☆11":0,"☆12":0},
      {name:"A","☆11":0,"☆12":0},
      {name:"AA","☆11":0,"☆12":0},
      {name:"AAA","☆11":0,"☆12":0},
    ]
    const songsByClearState:groupedArray[] = [
      {name:"FAILED","☆11":0,"☆12":0},
      {name:"ASSISTED","☆11":0,"☆12":0},
      {name:"EASY","☆11":0,"☆12":0},
      {name:"CLEAR","☆11":0,"☆12":0},
      {name:"HARD","☆11":0,"☆12":0},
      {name:"EXHARD","☆11":0,"☆12":0},
      {name:"FC","☆11":0,"☆12":0},
    ];

    await new songsDB().getAll(isSingle).then(t=>t.reduce((groups:groupedArray,item:songData) =>{
      const score = songFinder(item["difficultyLevel"],item["title"],item["difficulty"]);
      if(score){
        const p = score.exScore / (item["notes"] * 2);
        const lev = "☆"+item["difficultyLevel"] as "☆11"|"☆12";
        songsByDJRank[_DiscriminateRanksByNumber(p)][lev]++;
        score.clearState < 7 && songsByClearState[score.clearState][lev]++;
      }
      return groups;
    },[]));
    const at = bpiMapper(targetLevel === 12 ? twelves : elevens);
    //compare by date
    const sortByDate = (data:historyData[]):{[key:string]:historyData[]}=>{
      return data.reduce((groups:{[key:string]:historyData[]}, item:historyData) => {
        const date = moment(item.updatedAt).format("YYYY/MM/DD");
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {});
    }
    const allDiffs = sortByDate(await new scoreHistoryDB().getAll(String(targetLevel)))
    let eachDaySum:{name:string,sum:number,avg:number,}[] = [];
    const _bpi = new bpiCalcuator();
    const total = (item:historyData[]):number=>{
      let t = 0;
      item.map(item=>{
        t += item.BPI;
      });
      return t;
    }
    Object.keys(allDiffs).map((item)=>{
      const p = allDiffs[item].reduce((a:number[],val:historyData)=>{
        if(val.BPI){
          a.push(val.BPI);
        }
        return a;
      },[]);
      _bpi.allTwelvesLength = p.length;
      _bpi.allTwelvesBPI = p;
      const avg = _bpi.totalBPI();
      eachDaySum.push({
        name : item,
        sum : allDiffs[item].length,
        avg : avg ? avg : Math.round(total(allDiffs[item]) / allDiffs[item].length * 100) / 100
      });
      return 0;
    });

    let bpis = ticker;
    let groupedByLevel = [];
    for(let i = 0; i < bpis.length; ++i){
      let obj:{"name":number,"☆11":number,"☆12":number} = {"name":bpis[i],"☆11":0,"☆12":0};
      obj["☆11"] = allSongsElevensBPI[bpis[i]] ? allSongsElevensBPI[bpis[i]] : 0;
      obj["☆12"] = allSongsTwelvesBPI[bpis[i]] ? allSongsTwelvesBPI[bpis[i]] : 0;
      groupedByLevel.push(obj);
    }

    const totalBPI = bpi.setSongs(at);
    //BPI別集計
    this.setState({
      isLoading:false,
      totalBPI:totalBPI,
      totalRank:bpi.rank(totalBPI,false),
      perDate:eachDaySum.sort((a,b)=> moment(a.name).diff(b.name)).slice(-10),
      groupedByLevel:groupedByLevel,
      radar: isSingle ? await getRadar() : [],
      groupedByDJRank:songsByDJRank.reverse(),
      groupedByClearState:songsByClearState.reverse(),
    });
  }

  groupBy = (array:number[])=>{
    return array.reduce((groups:{[key:number]:number}, item:number) => {
      let _ = Math.floor(item / 10) * 10;
      if(_ > 100) _ = 100
      if (!groups[_]) {
        groups[_] = 1;
      }else{
        groups[_]++;
      }
      return groups;
    }, {});
  }

  onClickByLevel = (data:any,_index:any)=>{
    if(!data || !data.activeLabel){
      return;
    }
    this.props.history.push("/songs?initialBPIRange=" + data.activeLabel);
  }

  toggleRadarDetail = (title:string = "")=> this.setState({radarDetail:title});

  xAxisTicker = ():number[]=> [...ticker,this.state.totalBPI].sort((a,b)=>a-b);

  changeLevel = async (e:React.ChangeEvent<HTMLInputElement>,)=>{
    if(typeof e.target.value === "string"){
      const targetLevel = Number(e.target.value);
      this.setState({targetLevel:targetLevel,isLoading:true});
      await this.updateScoreData(targetLevel);
    }
  }

  render(){
    const {totalBPI,isLoading,perDate,targetLevel,totalRank,groupedByLevel,radar,groupedByDJRank,groupedByClearState,radarDetail} = this.state;
    const {formatMessage} = this.props.intl;
    const chartColor = _chartColor();
    if(isLoading){
      return (
        <Container fixed style={{padding:0}}>
          <ChangeLevel isLoading={isLoading} targetLevel={targetLevel} changeLevel={this.changeLevel}/>
          <Container className="loaderCentered">
            <CircularProgress />
          </Container>
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
              </Typography>
              {perDate.length > 0 &&
                <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
                  <ResponsiveContainer width="100%">
                    <ComposedChart
                      data={perDate}
                      margin={{
                        top: 5, right: 30, left: -30, bottom: 25,
                      }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" stroke={chartColor} />
                      <YAxis orientation="left" tickLine={false} axisLine={false} stroke={chartColor}/>
                      <Tooltip contentStyle={{color:"#333"}}/>
                      <Bar dataKey="sum" name={formatMessage({id:"Stats.UpdatedSum"})} fill="#82ca9d" />
                      <Line dataKey="avg" name={formatMessage({id:"Stats.Average"})} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              }
              {perDate.length === 0 && <p>No data found.</p>}
            </Paper>
          </Grid>
        </Grid>
        <Divider style={{margin:"30px 0"}}/>
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
                        <Legend />
                        <ReferenceLine x={totalBPI} stroke="#ffa0a0" isFront={true} />
                        <Line type="monotone" dataKey="☆11" stroke="#8884d8" activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="☆12" stroke="#82ca9d" />
                      </LineChart>
                  </ResponsiveContainer>
                </div>
              }
              {groupedByLevel.length === 0 && <p>No data found.</p>}
            </Paper>
          </Grid>
        </Grid>
        {(_isSingle() === 1 && radar && radar.length > 0) &&
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <Paper style={{padding:"15px"}}>
                <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                  RADAR(<RefLink color="secondary" target="_blank" rel="noopener noreferrer" href="https://gist.github.com/potakusan/6c570528a42b3583a807c88fd3627092">?</RefLink>)
                </Typography>
                <Grid container spacing={0}>
                  <Grid item xs={12} md={12} lg={6} style={{height:"350px"}}>
                    <div style={{width:"100%",height:"100%"}}>
                      <ResponsiveContainer>
                        <RadarChart outerRadius={110} data={radar}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="title" stroke={chartColor} />
                          <PolarRadiusAxis />
                          <Radar name="TotalBPI" dataKey="TotalBPI" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </Grid>
                  <Grid item xs={12} md={12} lg={6}>
                    <Table size="small" style={{minHeight:"350px"}}>
                      <TableBody>
                        {radar.concat().sort((a,b)=>b.TotalBPI - a.TotalBPI).map(row => (
                          <TableRow key={row.title} onClick={()=>this.toggleRadarDetail(row.title)}>
                            <TableCell component="th">
                              {row.title}
                            </TableCell>
                            <TableCell align="right">{row.TotalBPI.toFixed(2)}<span style={{fontSize:"7px"}}>(上位{Math.floor(row.rank * 100) / 100}%)</span></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        }
        {radarDetail !== "" && <Details closeModal={this.toggleRadarDetail} withRival={false} data={radar} title={radarDetail}/>}
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
                        <Legend />
                        <Bar dataKey="☆12" fill="#82ca9d" />
                        <Bar dataKey="☆11" fill="#8884d8" />
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
                        <Legend />
                        <Bar dataKey="☆12" fill="#82ca9d" />
                        <Bar dataKey="☆11" fill="#8884d8" />
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
            control={<Radio color="primary" />}
            label="☆11"
            labelPlacement="end"
            disabled={isLoading}
          />
          <FormControlLabel
            value={12}
            control={<Radio color="primary" />}
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
