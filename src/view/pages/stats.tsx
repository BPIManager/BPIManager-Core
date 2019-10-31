import * as React from 'react';
import { scoresDB, songsDB, scoreHistoryDB } from '../../components/indexedDB';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import bpiCalcuator from '../../components/bpi';
import moment from 'moment';

interface S {
  isLoading:boolean,
  totalBPI:number,
}

export default class Songs extends React.Component<{},S> {

  constructor(props:Object){
    super(props);
    this.state ={
      isLoading:true,
      totalBPI:0,
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(){
    const db = new scoresDB();
    const bpi = new bpiCalcuator();
    const currentStore = "27";
    const isSingle = 1;
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
    console.log(allDiffs)
/*
.sort((a:any,b:any):number=>{
      if(typeof a.updatedAt !== "string" || typeof b.updatedAt !== "string"){return -1;}
      return moment(a.updatedAt).diff(moment(b.updatedAt));
    });
 */
    this.setState({
      isLoading:false,
      totalBPI:bpi.totalBPI()
    });
  }

  render(){
    const {totalBPI,isLoading} = this.state;
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
                <FormattedMessage id="Stats.BPIOfEachDay"/>
              </Typography>

            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper style={{padding:"15px 5px"}}>
              <Typography component="h6" variant="h6" color="primary" gutterBottom style={{padding:"0 10px"}}>
                <FormattedMessage id="Stats.UpdatedSongs"/>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    );
  }
}
