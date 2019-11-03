import * as React from 'react';
import { scoresDB, songsDB, scoreHistoryDB } from '../../components/indexedDB';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import bpiCalcuator from '../../components/bpi';
import {_isSingle,_currentStore} from "../../components/settings";
import moment from 'moment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { XAxis, CartesianGrid, YAxis, Tooltip, Bar, ResponsiveContainer, Line, ComposedChart } from 'recharts';

interface S {
  isLoading:boolean,
  totalBPI:number,
  perDate:{name:string,sum:string,avg:number}[]
}

class Stats extends React.Component<{intl:any},S> {

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      isLoading:true,
      totalBPI:0,
      perDate:[],
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(){
    const db = new scoresDB();
    const bpi = new bpiCalcuator();
    const currentStore = _currentStore();
    const isSingle = _isSingle();
    bpi.allTwelvesLength = await new songsDB().getAllTwelvesLength(isSingle);
    bpi.allTwelvesBPI = await db.getAllTwelvesBPI(isSingle,currentStore,"12");

    //compare by date
    const allDiffs = (await new scoreHistoryDB().getAll(isSingle,currentStore,"12")).reduce((groups, item) => {
      const date = moment(item.updatedAt).format("YYYY/MM/DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(item);
      return groups;
    }, {});
    let eachDaySum:{name:string,sum:string,avg:number,}[] = [];
    Object.keys(allDiffs).map((item,i)=>{
      if(i > 10){
        return 0;
      }
      const avg:{BPI:number} = allDiffs[item].reduce((a:any,c:any)=>{return {BPI:a.BPI + c.BPI}});
      eachDaySum.push({
        name : item,
        sum : allDiffs[item].length,
        avg : Math.round(avg.BPI / allDiffs[item].length * 100) / 100
      });
      return 0;
    });
    this.setState({
      isLoading:false,
      totalBPI:bpi.totalBPI(),
      perDate:eachDaySum.sort((a,b)=> moment(a.name).diff(b.name))
    });
  }

  render(){
    const {totalBPI,isLoading,perDate} = this.state;
    const {formatMessage} = this.props.intl;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Container className="commonLayout" fixed>
        <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
          <FormattedMessage id="Stats.title"/>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} lg={3}>
            <Paper style={{padding:"15px"}} className="responsiveTotalBPI">
              <Typography component="h6" variant="h6" color="primary" gutterBottom>
                <FormattedMessage id="Stats.TotalBPI"/>
              </Typography>
              <Typography component="h2" variant="h2" color="primary">
                {totalBPI}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={9} lg={9}>
            <Paper style={{padding:"15px",height:240}}>
              <Typography component="h6" variant="h6" color="primary" gutterBottom>
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
                      <XAxis dataKey="name" />
                      <YAxis tick={{dx:-5}}/>
                      <Tooltip />
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
      </Container>
    );
  }
}

export default injectIntl(Stats);
