import * as React from 'react';
import { scoresDB, songsDB, scoreHistoryDB } from '../../components/indexedDB';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import bpiCalcuator from '../../components/bpi';
import {_isSingle,_currentStore, _chartColor, _goalBPI} from "../../components/settings";
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { XAxis, CartesianGrid, YAxis, Tooltip, Bar, ResponsiveContainer, Line, ComposedChart, LineChart, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, BarChart, ScatterChart, Scatter } from 'recharts';
import _withOrd from '../../components/common/ord';
import {Link as RefLink, Table, TableRow, TableCell, TableBody} from '@material-ui/core/';
import { difficultyDiscriminator, _prefix } from '../../components/songs/filter';
import { songData, scoreData } from '../../types/data';
import { _DiscriminateRanksByNumber } from '../../components/common/djRank';

interface S {
  isLoading:boolean,
  totalBPI:number,
  totalRank:number,
  perDate:{name:string,sum:string,avg:number}[],
  groupedByLevel:any[],
  groupedByDiff:any[],
  radar:any[]|null,
  groupedByDJRank:any[],
  groupedByClearState:any[],
  scatterGraph:any[]
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
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
      scatterGraph:[]
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(){
    const isSingle = _isSingle();
    const currentStore = _currentStore();
    const lastStore = String(Number(currentStore) - 1);
    const db = await new scoresDB(isSingle,currentStore).loadStore();
    const bpi = new bpiCalcuator();
    const twelves = await db.getItemsBySongDifficulty("12");
    const elevens = await db.getItemsBySongDifficulty("11");
    const lastVerTwelves = await db.getItemsBySongDifficultyWithSpecificVersion("12",lastStore);
    const bpiMapper = (t:scoreData[])=>t.map((item:scoreData)=>item.currentBPI);
    const allSongsTwelvesBPI = this.groupBy(bpiMapper(twelves));
    const allSongsElevensBPI = this.groupBy(bpiMapper(elevens));
    const songFinder = (level:string,title:string,difficulty:string)=>(
      level === "12" ? twelves : elevens
    ).find(elm=>( elm.title === title && elm.difficulty === difficultyDiscriminator(difficulty) ) )
    //[AAA,AA,A,B,C,D,E,F];
    const songsByDJRank:any[] = [
      {name:"F","☆11":0,"☆12":0},
      {name:"E","☆11":0,"☆12":0},
      {name:"D","☆11":0,"☆12":0},
      {name:"C","☆11":0,"☆12":0},
      {name:"B","☆11":0,"☆12":0},
      {name:"A","☆11":0,"☆12":0},
      {name:"AA","☆11":0,"☆12":0},
      {name:"AAA","☆11":0,"☆12":0},
    ]
    //[FAILED,ASSISTED,EASY,CLEAR,HARD,EXHARD,FC]
    const songsByClearState:any[] = [
      {name:"FAILED","☆11":0,"☆12":0},
      {name:"ASSIST","☆11":0,"☆12":0},
      {name:"EASY","☆11":0,"☆12":0},
      {name:"CLEAR","☆11":0,"☆12":0},
      {name:"HARD","☆11":0,"☆12":0},
      {name:"EXHARD","☆11":0,"☆12":0},
      {name:"FULLCOMBO","☆11":0,"☆12":0},
    ];
    let scatterGraph:{label:string,x:number,y:number,last:number}[]  = [];
    for(let item in twelves){
      const current = twelves[item];
      const last = lastVerTwelves[current.title + current.difficulty];
      if(last){
        scatterGraph.push({label:current.title + _prefix(current.difficulty) ,x:Math.ceil( 1000 * current.currentBPI / last )  / 10  - 100 ,y:current.currentBPI,last:last})
      }
    }

    await new songsDB().getAll(isSingle).then(t=>t.reduce((groups:any,item:songData) =>{
      const score = songFinder(item["difficultyLevel"],item["title"],item["difficulty"]);
      if(score){
        const p = score.exScore / (item["notes"] * 2);
        songsByDJRank[_DiscriminateRanksByNumber(p)]["☆" + item["difficultyLevel"]]++;
        score.clearState < 7 && songsByClearState[score.clearState]["☆" + item["difficultyLevel"]]++;
      }
      return groups;
    },[]));

    bpi.allTwelvesBPI = bpiMapper(twelves);
    bpi.allTwelvesLength = await new songsDB().getAllTwelvesLength(isSingle);
    //compare by date
    const allDiffs = (await new scoreHistoryDB().getAll("12")).reduce((groups, item) => {
      const date = moment(item.updatedAt).format("YYYY/MM/DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});
    let eachDaySum:{name:string,sum:string,avg:number,}[] = [];
    const _bpi = new bpiCalcuator();
    Object.keys(allDiffs).map((item)=>{
      _bpi.allTwelvesLength = allDiffs[item].length;
      _bpi.allTwelvesBPI = allDiffs[item].reduce((a:number[],val:any)=>{
        if(val.BPI){
          a.push(val.BPI);
        }
        return a;
      },[]);
      const avg = _bpi.totalBPI();
      eachDaySum.push({
        name : item,
        sum : allDiffs[item].length,
        avg : avg ? avg : Math.round(allDiffs[item].reduce((a:any,c:any)=>{return {BPI:a.BPI + c.BPI}}).BPI / allDiffs[item].length * 100) / 100
      });
      return 0;
    });

    let bpis = [-20,-10,0,10,20,30,40,50,60,70,80,90,100];
    let groupedByLevel = [];
    for(let i = 0; i < bpis.length; ++i){
      let obj:{"name":number,"☆11":number,"☆12":number} = {"name":bpis[i],"☆11":0,"☆12":0};
      obj["☆11"] = allSongsElevensBPI[bpis[i]] ? allSongsElevensBPI[bpis[i]] : 0;
      obj["☆12"] = allSongsTwelvesBPI[bpis[i]] ? allSongsTwelvesBPI[bpis[i]] : 0;
      groupedByLevel.push(obj);
    }

    const totalBPI = bpi.totalBPI();
    //BPI別集計
    this.setState({
      isLoading:false,
      totalBPI:totalBPI,
      totalRank:bpi.rank(totalBPI,false),
      perDate:eachDaySum.sort((a,b)=> moment(a.name).diff(b.name)).slice(-10),
      groupedByLevel:groupedByLevel,
      radar: isSingle ? await this.getRadar() : null,
      groupedByDJRank:songsByDJRank.reverse(),
      groupedByClearState:songsByClearState.reverse(),
      scatterGraph:scatterGraph,
    });
  }

  getRadar = async():Promise<any>=>{

    const songs:{[key:string]:[string,string][]} = {
      "NOTES":[
        ["Verflucht","leggendaria"],
        ["Elemental Creation","another"],
        ["perditus†paradisus","another"],
        ["Sigmund","leggendaria"],
        ["B4U(BEMANI FOR YOU MIX)","leggendaria"],
        ["Chrono Diver -PENDULUMs-","another"],
      ],
      "CHARGE":[
        ["TOGAKUSHI","another"],
        ["DIAMOND CROSSING","another"],
        ["ECHIDNA","another"],
        ["Timepiece phase II (CN Ver.)","another"],
        ["Snakey Kung-fu","another"]
      ],
      "PEAK":[
        ["X-DEN","another"],
        ["卑弥呼","another"],
        ["疾風迅雷","leggendaria"],
        ["KAMAITACHI","leggendaria"],
        ["天空の夜明け","another"],
      ],
      "CHORD":[
        ["Rave*it!! Rave*it!! ","another"],
        ["waxing and wanding","leggendaria"],
        ["Little Little Princess","leggendaria"],
        ["mosaic","another"],
        ["Despair of ELFERIA","another"],
        ["Beat Radiance","leggendaria"]
      ],
      "GACHIOSHI":[
        ["255","another"],
        ["BITTER CHOCOLATE STRIKER","another"],
        ["童話回廊","another"],
        ["VANESSA","leggendaria"],
        ["GRID KNIGHT","leggendaria"]
      ],
      "SCRATCH":[
        ["灼熱 Pt.2 Long Train Running","another"],
        ["灼熱Beach Side Bunny","another"],
        ["BLACK.by X-Cross Fade","another"],
        ["Red. by Jack Trance","another"],
        ["Level One","another"],
        ["火影","another"]
      ],
      "SOFLAN":[
        ["冥","another"],
        ["ICARUS","leggendaria"],
        ["Fascination MAXX","another"],
        ["JOMANDA","another"],
        ["PARANOiA ～HADES～","another"],
        ["音楽","another"],
        ["DAY DREAM","another"],
      ],
      "DELAY":[
        ["Mare Nectaris","another"],
        ["quell～the seventh slave～","another"],
        ["子供の落書き帳","another"],
        ["DIAVOLO","another"],
        ["Thor's Hammer","another"]
      ],
      "RENDA":[
        ["ピアノ協奏曲第１番”蠍火”","another"],
        ["Scripted Connection⇒ A mix","another"],
        ["Innocent Walls","hyper"],
        ["IMPLANTATION","another"],
        ["Sense 2007","another"],
        ["ワルツ第17番 ト短調”大犬のワルツ”","4"]
      ]
    }
    const objective = _goalBPI(),isSingle = _isSingle(),currentStore = _currentStore();
    const db = new scoresDB(isSingle, currentStore);
    return await Object.keys(songs).reduce(async (obj:Promise<any>,title:string)=>{
      const collection = await obj;
      const len = songs[title].length;
      let pusher:number[] = [];

      for(let i = 0; i < len; ++i){
        const ind = await db.getItem(songs[title][i][0],songs[title][i][1],currentStore,isSingle);
        ind.length > 0 && pusher.push(ind[0]["currentBPI"]);
      }
      if(pusher.length < len){
        for(let j =0; j < len - pusher.length;++j){
          pusher.push(-15);
        }
      }

      const bpi = new bpiCalcuator();
      bpi.allTwelvesBPI = pusher;
      bpi.allTwelvesLength = len;
      const total = bpi.totalBPI()
      collection.push({
        title: title,
        TotalBPI: total,
        ObjectiveBPI: objective,
        rank:bpi.rank(total,false) / bpi.getTotalKaidens() * 100,
        fullMark: 100
      });
      return Promise.resolve(obj);
    },Promise.resolve([]));
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

  render(){
    const {totalBPI,isLoading,perDate,totalRank,groupedByLevel,radar,groupedByDJRank,groupedByClearState,scatterGraph} = this.state;
    const {formatMessage} = this.props.intl;
    const chartColor = _chartColor();
    const CustomTooltip = (props:any) => {
      if (props.active && props.payload[0].payload) {
        const p = props.payload[0].payload;
        return (
          <div className="custom-tooltip">
            <p><b>{p.label}</b></p>
            <p>上昇率:{p.x > 0 && "+"}{p.x.toFixed(1)}%</p>
            <p>今作:{p.y}</p>
            <p>前作:{p.last}</p>
          </div>
        );
      }
      return (null);
    }
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Container className="commonLayout" id="stat" fixed>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <FormattedMessage id="Stats.title"/>
        </Typography>
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
                      margin={{
                        top: 5, right: 30, left: -30, bottom: 30,
                      }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" stroke={chartColor} />
                        <YAxis stroke={chartColor}/>
                        <Tooltip contentStyle={{color:"#333"}}/>
                        <Legend />
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
                          <TableRow key={row.title}>
                            <TableCell component="th">
                              {row.title}
                            </TableCell>
                            <TableCell align="right">{row.TotalBPI}<span style={{fontSize:"7px"}}>(上位{Math.floor(row.rank)}%)</span></TableCell>
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
                        <YAxis stroke={chartColor}/>
                        <Tooltip contentStyle={{color:"#333"}}/>
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
        {(scatterGraph.length > 0) &&
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
              <Paper style={{padding:"15px"}}>
                <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
                  前作比BPI相関図(☆12)
                </Typography>
                <Grid container spacing={0}>
                  <Grid item xs={12} md={12} lg={12} style={{height:"450px"}}>
                    <div style={{width:"100%",height:"100%"}}>
                      <ResponsiveContainer>
                        <ScatterChart margin={{top: 5, right: 30, left: -30, bottom: 30,}}>
                          <CartesianGrid />
                          <XAxis type="number" dataKey="x" name="前作からのBPI上昇率" unit="％" stroke={chartColor} />
                          <YAxis type="number" dataKey="y" name="今作BPI" unit="" stroke={chartColor} />
                          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                          <Scatter name="A school" data={scatterGraph} fill="#8884d8" />
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        }
      </Container>
    );
  }
}

export default injectIntl(Stats);
