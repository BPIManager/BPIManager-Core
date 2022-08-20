import React from "react";
import { _chartBarColor, _chartColor } from "@/components/settings";
import { Tooltip, ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Bar } from "recharts";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";
import { distBPMI } from "@/components/stats/bpmDist";

const Chart: React.FC<{ groupedByBPM: distBPMI[] }> = ({ groupedByBPM }) => {
  const chartColor = _chartColor();
  const lineColor = _chartBarColor("YOU");
  const linePrev = _chartBarColor("line");
  return (
    <div style={{ padding: "15px", height: 270 }}>
      <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
        <FormattedMessage id="Stats.DistributionByBPM" />
      </Typography>
      <div style={{ width: "95%", height: "100%", margin: "5px auto" }}>
        {groupedByBPM.length > 0 && (
          <ResponsiveContainer width="100%">
            <BarChart
              layout="vertical"
              data={groupedByBPM}
              margin={{
                top: 5,
                right: 30,
                left: -30,
                bottom: 30,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis stroke={chartColor} type="number" />
              <YAxis stroke={chartColor} type="category" dataKey="name" />
              <Tooltip contentStyle={{ color: "#333" }} />
              <Bar dataKey="BPI" fill={lineColor} />
              <Bar type="monotone" dataKey="BPIPrev" fill={linePrev} />
            </BarChart>
          </ResponsiveContainer>
        )}
        {groupedByBPM.length === 0 && <p>No data found.</p>}
      </div>
    </div>
  );
};

export default Chart;
