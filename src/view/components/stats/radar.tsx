import React from 'react';
import Container from '@mui/material/Container';
import { injectIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { _isSingle, _chartColor, _chartBarColor } from "@/components/settings";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Table, TableRow, TableCell, TableBody } from '@mui/material/';
import { getRadar, Details, radarData } from '@/components/stats/radar';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Loader from '@/view/components/common/loader';
import AdsCard from '@/components/ad';

class Main extends React.Component<{ intl: any } & RouteComponentProps, {
  isLoading: boolean,
  radar: radarData[],
  radarDetail: string
}> {

  constructor(props: { intl: any } & RouteComponentProps) {
    super(props);
    this.state = {
      isLoading: true,
      radar: [],
      radarDetail: ""
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  async componentDidMount() {
    await this.updateScoreData();
  }

  async updateScoreData() {
    const isSingle = _isSingle();
    this.setState({
      isLoading: false,
      radar: isSingle ? await getRadar() : [],
    });
  }

  toggleRadarDetail = (title: string = "") => this.setState({ radarDetail: title });

  render() {
    const { isLoading, radar, radarDetail } = this.state;
    const chartColor = _chartColor();
    const barColor = _chartBarColor("bar");
    if (isLoading) {
      return (
        <Container fixed style={{ padding: 0 }}>
          <Loader />
        </Container>
      );
    }

    return (
      <Container fixed style={{ padding: 0 }}>
        {(_isSingle() === 1 && radar && radar.length > 0) &&
          <Grid container spacing={0}>
            <Grid item xs={12} md={12} lg={6} style={{ height: "350px" }}>
              <div style={{ width: "100%", height: "100%" }}>
                <ResponsiveContainer>
                  <RadarChart outerRadius={110} data={radar}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="title" stroke={chartColor} />
                    <PolarRadiusAxis />
                    <Radar name="TotalBPI" dataKey="TotalBPI" fill={barColor} fillOpacity={0.6} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </Grid>
            <Grid item xs={12} md={12} lg={6}>
              <Paper style={{ padding: "5px" }}>
                <Table size="small" style={{ minHeight: "350px" }}>
                  <TableBody>
                    {radar.concat().sort((a, b) => b.TotalBPI - a.TotalBPI).map(row => (
                      <TableRow key={row.title} onClick={() => this.toggleRadarDetail(row.title)}>
                        <TableCell component="th">
                          {row.title}
                        </TableCell>
                        <TableCell align="right">{row.TotalBPI.toFixed(2)}<span style={{ fontSize: "7px" }}>(上位{Math.floor(row.rank * 100) / 100}%)</span></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
          </Grid>
        }
        <AdsCard />
        {radarDetail !== "" && <Details closeModal={this.toggleRadarDetail} withRival={false} data={radar} title={radarDetail} />}
      </Container>
    );
  }
}

export default withRouter(injectIntl(Main));
