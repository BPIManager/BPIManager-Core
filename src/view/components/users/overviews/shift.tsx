import { _chartBarColor, _chartColor } from "@/components/settings";
import statMain from "@/components/stats/main";
import BarChartIcon from "@mui/icons-material/BarChart";
import React, { useEffect, useState } from "react";
import {
  Bar,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import SubHeader from "../../topPage/subHeader";

const ShiftOverView: React.FC<{ rivalData: any }> = ({ rivalData }) => {
  const [stat, setStat] = useState<any>(null);
  const makeStat = async () => {
    const func = new statMain(12).setPropData(rivalData);
    const eachDaySum = await func.eachDaySum(4, undefined, rivalData, 30);
    setStat(eachDaySum);
  };
  useEffect(() => {
    makeStat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!stat) {
    return null;
  }
  const chartColor = _chartColor() + "cc";
  const barColor = _chartBarColor("bar") + "80";
  const lineColor = _chartBarColor("line");
  return (
    <>
      <SubHeader icon={<BarChartIcon />} text={<>過去30日間の推移</>} />
      <div style={{ width: "95%", height: "250px", margin: "5px auto" }}>
        <ResponsiveContainer width="100%">
          <ComposedChart
            data={stat}
            margin={{
              right: -10,
              left: -30,
            }}
          >
            <XAxis dataKey="name" hide />
            <YAxis
              yAxisId={1}
              orientation="left"
              tickLine={false}
              axisLine={false}
              stroke={chartColor}
            />
            <YAxis
              yAxisId={2}
              orientation="right"
              domain={["dataMin * 0.8", "dataMax * 1.2"]}
              tickCount={6}
              stroke={chartColor}
            />
            <Bar
              isAnimationActive={false}
              yAxisId={1}
              dataKey="sum"
              name={"合計更新数(左軸)"}
              fill={barColor}
            />
            <Line
              isAnimationActive={false}
              yAxisId={2}
              dataKey={"shiftedBPI"}
              key={"shiftedBPI"}
              dot={false}
              name={"総合BPI(右軸)"}
              stroke={lineColor}
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default ShiftOverView;
