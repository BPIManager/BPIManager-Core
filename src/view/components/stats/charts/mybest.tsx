import React, { useState, useEffect } from 'react';
import { _chartBarColor, pieColor } from "@/components/settings";
import { Tooltip, ResponsiveContainer, Pie, PieChart, Cell, Legend } from 'recharts';
import { myBest } from "@/components/stats/myBest";
import Typography from '@mui/material/Typography';

const Chart: React.FC<{ diff: number, withTitle: boolean }> = ({ diff, withTitle }) => {
  const [data, setData] = useState<any[]>([]);
  const barColor = _chartBarColor("bar");

  const load = async () => {
    const res = await myBest(String(diff), 0, false, true);
    setData(res.scoreByVersion);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diff]);
  if (!data) {
    return (null);
  }
  return (
    <div style={{ padding: "15px", height: 270 }}>
      {withTitle && (
        <Typography component="h6" variant="h6" color="textPrimary" gutterBottom>
          自己歴代
        </Typography>
      )}
      <div style={{ width: "95%", height: "100%", margin: "5px auto" }}>
        {data.length > 0 && (
          <ResponsiveContainer width="100%">
            <PieChart>
              <Pie dataKey={"value"} data={data} stroke="none" innerRadius="0" outerRadius="100%" fill={barColor}>
                {
                  data.map((_entry: any, index: any) => <Cell key={`cell-${index}`} fill={pieColor(index)} />)
                }
              </Pie>
              <Tooltip />
              <Legend
                wrapperStyle={{
                  paddingTop: "15px"
                }} />
            </PieChart>
          </ResponsiveContainer>
        )}
        {data.length === 0 && <p>No data found.</p>}
      </div>
    </div>
  )
}

export default Chart;
