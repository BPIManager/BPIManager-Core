import * as React from 'react';
import Container from '@material-ui/core/Container';
import { injectIntl } from 'react-intl';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {_isSingle, _chartColor} from "../../../components/settings";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar} from 'recharts';
import {Table, TableRow, TableCell, TableBody} from '@material-ui/core/';
import { getRadar, Details, radarData } from '../../../components/stats/radar';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Loader from '../common/loader';
import { Alert, AlertTitle } from '@material-ui/lab';

class Main extends React.Component<{intl:any}&RouteComponentProps,{
  isLoading:boolean,
  radar:radarData[],
  radarDetail:string
}> {

  constructor(props:{intl:any}&RouteComponentProps){
    super(props);
    this.state ={
      isLoading:true,
      radar:[],
      radarDetail:""
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount(){
    await this.updateScoreData();
  }

  async updateScoreData(){
    const isSingle = _isSingle();
    this.setState({
      isLoading:false,
      radar: isSingle ? await getRadar() : [],
    });
  }

  toggleRadarDetail = (title:string = "")=> this.setState({radarDetail:title});

  render(){
    const {isLoading,radar,radarDetail} = this.state;
    const chartColor = _chartColor();
    if(isLoading){
      return (
        <Container fixed style={{padding:0}}>
          <Loader/>
        </Container>
      );
    }

    return (
      <Container fixed style={{padding:0}}>
        {(_isSingle() === 1 && radar && radar.length > 0) &&
          <Grid container spacing={3}>
            <Grid item xs={12} md={12} lg={12}>
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
                  <Paper style={{padding:"5px"}}>
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
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        }
        <Alert severity="info" style={{margin:"10px 0"}}>
          <AlertTitle style={{marginTop:"0px",fontWeight:"bold"}}>レーダーとは？</AlertTitle>
          <p>
            譜面傾向ごとにいくつかの楽曲をピックアップし、それらのBPIを指標にあなたの実力を可視化する機能です。<br/>
            各カテゴリの対象になっている楽曲一覧およびそれらの楽曲に紐付いたスコアおよびBPIはテーブルの項目をクリックすることで確認可能です。<br/><br/>
            対象楽曲については、ユーザーの皆様にいただいた声や楽曲の追加・無条件解禁状況を踏まえ、不定期に変更する場合があります。
          </p>
        </Alert>
        {radarDetail !== "" && <Details closeModal={this.toggleRadarDetail} withRival={false} data={radar} title={radarDetail}/>}
      </Container>
    );
  }
}

export default withRouter(injectIntl(Main));
