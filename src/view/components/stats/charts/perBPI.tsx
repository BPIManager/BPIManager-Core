import React from "react";
import { _chartBarColor, _chartColor } from "@/components/settings";
import { Tooltip, ResponsiveContainer, CartesianGrid, XAxis, YAxis, ReferenceLine, Line, LineChart } from "recharts";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";
import { groupedByLevel } from "@/types/stats";
import { BPITicker } from "@/components/stats/main";

const Chart: React.FC<{
  data: groupedByLevel[];
  totalBPI: number;
  targetLevel: number;
}> = ({ data, totalBPI, targetLevel }) => {
  const chartColor = _chartColor();
  const lineColor = _chartBarColor("line");
  const barColor = _chartBarColor("bar");
  const linePrev = _chartBarColor("YOU");

  const xAxisTicker = (): number[] => [...BPITicker, totalBPI].sort((a, b) => a - b);

  return (
    <div style={{ padding: "15px", height: 270 }}>
      <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
        <FormattedMessage id="Stats.Distribution" />
      </Typography>
      <div style={{ width: "95%", height: "100%", margin: "5px auto" }} className="bpilinechart">
        {data.length > 0 && (
          <ResponsiveContainer width="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: -30,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type={"number"} dataKey="name" stroke={chartColor} ticks={xAxisTicker()} domain={[-20, 100]} />
              <YAxis stroke={chartColor} />
              <Tooltip contentStyle={{ color: "#333" }} />
              <ReferenceLine x={totalBPI} stroke={barColor} isFront={true} />
              <Line type="monotone" dataKey={"☆" + targetLevel} stroke={lineColor} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey={"☆" + targetLevel + "(比較対象)"} stroke={linePrev} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
        {data.length === 0 && <p>No data found.</p>}
      </div>
    </div>
  );
};

export default Chart;
