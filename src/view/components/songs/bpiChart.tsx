import React from "react";

import { scoreData, songData } from "../../../types/data";
import {BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Label} from "recharts";
import { _chartColor } from "../../../components/settings";

interface P{
  song:songData|null,
  score:scoreData|null,
  chartData:any[],
  graphLastUpdated:number,
  newScore:number,
}

class BPIChart extends React.Component<P,{}> {

  render(){
    const chartColor = _chartColor();
    const {chartData,song,score,graphLastUpdated,newScore} = this.props;
    if(!song || !score){
      return (null);
    }
    const max = song.notes ? song.notes * 2 : 0;
    const CustomTooltip = (props:any) => {
      if (props.active && props.payload[0].payload) {
        const p = props.payload[0].payload;
        console.log(p);
        return (
          <div className="custom-tooltip">
          {p.name !== "YOU" && <div>
              <p>BPI{p.name}</p>
              <p>EX:{p["EX SCORE"]}</p>
              <p>GAP:{(!Number.isNaN(newScore) ? newScore : score.exScore) - p["EX SCORE"]}</p>
            </div>
          }
          {p.name === "YOU" && <div>
              <p>YOUR SCORE</p>
              <p>EX:{p["EX SCORE"]}</p>
          </div>}
          </div>
        );
      }
      return (null);
    }
    return (
      <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
        <ResponsiveContainer width="100%">
          <BarChart data={chartData} key={graphLastUpdated}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis stroke={chartColor} dataKey="name" />
            <YAxis stroke={chartColor} domain={[0,max]} ticks={[Math.ceil(max * (6/9)),Math.ceil(max * (7/9)),Math.ceil(max * (8/9)),max]} width={40}>
            </YAxis>
            <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} contentStyle={{color:"#333"}} />
            <Bar dataKey="EX SCORE" isAnimationActive={false}>
              {
                chartData.map((item) => {
                  const color = item.name === "YOU" ? "#e75d00" : "#8884d8";
                  return <Cell key={item.name} fill={color} />;
                })
              }
            </Bar>
            <ReferenceLine y={max * (8/9)} label={<Label position="insideTopRight" style={{fill: chartColor}}>AAA</Label>} stroke={chartColor} isFront={true} />
            <ReferenceLine y={max * (7/9)} label={<Label position="insideTopRight" style={{fill: chartColor}}>AA</Label>} stroke={chartColor} isFront />
            <ReferenceLine y={max * (2/3)} label={<Label position="insideTopRight" style={{fill: chartColor}}>A</Label>} stroke={chartColor} isFront />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default BPIChart;
