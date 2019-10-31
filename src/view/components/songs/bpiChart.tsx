import React from "react";

import { scoreData, songData } from "../../../types/data";
import {BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Label} from "recharts";

interface P{
  song:songData|null,
  score:scoreData|null,
  chartData:any[],
  graphLastUpdated:number
}

class BPIChart extends React.Component<P,{}> {

  render(){
    const {chartData,song,score,graphLastUpdated} = this.props;
    if(!song || !score){
      return (null);
    }
    const max = song.notes ? song.notes * 2 : 0;
    return (
      <div style={{width:"95%",height:"100%",margin:"5px auto"}}>
        <ResponsiveContainer width="100%">
          <BarChart data={chartData} key={graphLastUpdated}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0,max]} ticks={[Math.ceil(max * (6/9)),Math.ceil(max * (7/9)),Math.ceil(max * (8/9)),max]} width={40}>
            </YAxis>
            <Tooltip />
            <Bar dataKey="EX SCORE" isAnimationActive={false}>
              {
                chartData.map((item) => {
                  const color = item.name === "YOU" ? "#e75d00" : "#8884d8";
                  return <Cell key={item.name} fill={color} />;
                })
              }
            </Bar>
            <ReferenceLine y={max * (8/9)} label={<Label position="insideTopRight">AAA</Label>} stroke="#004018" isFront={true} />
            <ReferenceLine y={max * (7/9)} label={<Label position="insideTopRight">AA</Label>} stroke="#004018" isFront />
            <ReferenceLine y={max * (2/3)} label={<Label position="insideTopRight">A</Label>} stroke="#004018" isFront />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}

export default BPIChart;
