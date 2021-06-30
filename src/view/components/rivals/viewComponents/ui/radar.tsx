import React from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";
import { _chartColor } from "@/components/settings";
import { radarData } from "@/components/stats/radar";
import { rivalBgColor } from "@/components/common";

class RadarBox extends React.Component<{
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
          <Radar name="You" dataKey="TotalBPI" stroke={rivalBgColor(3)} fill={rivalBgColor(3)} fillOpacity={0.6} />
          <Radar name="Rival" dataKey="rivalTotalBPI" stroke={rivalBgColor(0)} fill={rivalBgColor(0)} fillOpacity={0.6} />
          <Legend/>
        </RadarChart>
      </ResponsiveContainer>
    </div>
    );
  }
}

export default RadarBox;
