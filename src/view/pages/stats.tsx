import * as React from 'react';
import { scoresDB, songsDB, scoreHistoryDB } from '../../components/indexedDB';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import bpiCalcuator from '../../components/bpi';
import {_isSingle,_currentStore, _chartColor} from "../../components/settings";
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { XAxis, CartesianGrid, YAxis, Tooltip, Bar, ResponsiveContainer, Line, ComposedChart, LineChart, Legend } from 'recharts';

interface S {
  isLoading:boolean,
  totalBPI:number,
  perDate:{name:string,sum:string,avg:number}[],
  groupedByLevel:any[],
  groupedByDiff:any[],
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      isLoading:true,
      totalBPI:0,
      perDate:[],
      groupedByLevel:[],
      groupedByDiff:[],
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(){
    const isSingle = _isSingle();
    const currentStore = _currentStore();
    const db = await new scoresDB(isSingle,currentStore).loadStore();
    const bpi = new bpiCalcuator();
    const allSongsTwelvesBPI = this.groupByBPI(await db.getItemsBySongDifficulty("12"));
    const allSongsElevensBPI = this.groupByBPI(await db.getItemsBySongDifficulty("11"));
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
    Object.keys(allDiffs).map((item)=>{
      const avg:{BPI:number} = allDiffs[item].reduce((a:any,c:any)=>{return {BPI:a.BPI + c.BPI}});
      eachDaySum.push({
        name : item,
        sum : allDiffs[item].length,
        avg : Math.round(avg.BPI / allDiffs[item].length * 100) / 100
      });
      return 0;
    });

    let bpis = [-20,-10,0,10,20,30,40,50,60,70,80,90,100];
    let groupedByLevel = [], groupedByDiff = [];
    for(let i = 0; i < bpis.length; ++i){
      let obj:{"name":number,"☆11":number,"☆12":number} = {"name":bpis[i],"☆11":0,"☆12":0};
      obj["☆11"] = allSongsElevensBPI[bpis[i]] ? allSongsElevensBPI[bpis[i]] : 0;
      obj["☆12"] = allSongsTwelvesBPI[bpis[i]] ? allSongsTwelvesBPI[bpis[i]] : 0;
      groupedByLevel.push(obj);
    }

    /*
    const allSongsHyperBPI = this.groupByBPI(await db.getItemsBySongDifficultyName("hyper"));
    const allSongsAnotherBPI = this.groupByBPI(await db.getItemsBySongDifficultyName("another"));
    const allSongsLeggendariaBPI = this.groupByBPI(await db.getItemsBySongDifficultyName("leggendaria"));
    for(let i = 0; i < bpis.length; ++i){
      let obj:{"name":number,"HYPER":number,"ANOTHER":number,"LEGGENDARIA":number} = {"name":bpis[i],"HYPER":0,"ANOTHER":0,"LEGGENDARIA":0};
      obj["HYPER"] = allSongsHyperBPI[bpis[i]] ? allSongsHyperBPI[bpis[i]] : 0;
      obj["ANOTHER"] = allSongsAnotherBPI[bpis[i]] ? allSongsAnotherBPI[bpis[i]] : 0;
      obj["LEGGENDARIA"] = allSongsLeggendariaBPI[bpis[i]] ? allSongsLeggendariaBPI[bpis[i]] : 0;
      groupedByDiff.push(obj);
    }
    */

    //BPI別集計
    this.setState({
      isLoading:false,
      totalBPI:bpi.totalBPI(),
      perDate:eachDaySum.sort((a,b)=> moment(a.name).diff(b.name)).slice(-10),
      groupedByLevel:groupedByLevel,
    });
  }

  groupByBPI = (array:number[])=>{
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
    const {totalBPI,isLoading,perDate,groupedByLevel,groupedByDiff} = this.state;
    const {formatMessage} = this.props.intl;
    const chartColor = _chartColor();
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Container className="commonLayout" fixed>
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

      </Container>
    );
  }
}

export default injectIntl(Stats);
