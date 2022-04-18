import React from "react";
import { _chartBarColor, pieColor } from "@/components/settings";
import {
  Tooltip,
  ResponsiveContainer,
  Pie,
  PieChart,
  Cell,
  Legend,
} from "recharts";
import { groupedArray } from "@/types/stats";
import Typography from "@mui/material/Typography";
import { FormattedMessage } from "react-intl";
import statMain from "@/components/stats/main";

const Chart: React.FC<{
  targetLevel: number;
  data: groupedArray[];
  title: string;
}> = ({ targetLevel, data, title }) => {
  const barColor = _chartBarColor("bar");

  const makePieGraphData = (data: groupedArray[]) => {
    const exec = new statMain(targetLevel);
    return exec.makeGraphSentence(data);
  };

  return (
    <div style={{ padding: "15px", height: 270 }}>
      <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
        <FormattedMessage id={title} />
      </Typography>
      <div style={{ width: "95%", height: "100%", margin: "5px auto" }}>
        {data.length > 0 && (
          <ResponsiveContainer width="100%">
            <PieChart>
              <Pie
                dataKey={"☆" + targetLevel}
                data={makePieGraphData(data)}
                stroke="none"
                innerRadius="0"
                outerRadius="100%"
                fill={barColor}
              >
                {data.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={pieColor(index)} />
                ))}
              </Pie>
              <Tooltip />
              <Legend
                wrapperStyle={{
                  paddingTop: "15px",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
        {data.length === 0 && <p>No data found.</p>}
      </div>
    </div>
  );
};

export default Chart;
