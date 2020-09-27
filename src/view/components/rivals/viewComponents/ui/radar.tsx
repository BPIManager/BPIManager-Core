import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { _chartColor } from "@/components/settings";
import { radarData } from "@/components/stats/radar";

export default class extends React.Component<{
  radar:radarData[]
},{}>{

  render(){
    const {radar} = this.props;
    const chartColor = _chartColor();
    return (
    <div style={{width:"100%",height:"100%"}}>
      <ResponsiveContainer>
        <RadarChart outerRadius={110} data={radar}>
          <PolarGrid />
          <PolarAngleAxis dataKey="title" stroke={chartColor} />
          <PolarRadiusAxis />
          <Radar name="You" dataKey="TotalBPI" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
          <Radar name="Rival" dataKey="rivalTotalBPI" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          <Legend/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
    );
  }
}
