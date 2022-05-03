import { rivalBgColor } from "@/components/common";
import { _chartColor } from "@/components/settings";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { makeRivalStat } from "../../rivals/view";
import SubHeader from "../../topPage/subHeader";
import GroupIcon from "@mui/icons-material/Group";

const valueAccessor = (attribute: any) => (prop: any) => {
  return prop.payload[attribute];
};

const CompareOverView: React.FC<{ rivalData: any }> = ({ rivalData }) => {
  const [stat, setStat] = useState<any>(null);
  const makeStat = async () => {
    const mkstat = await makeRivalStat(rivalData);
    const scoresByLevel11 = [0, 0, 0],
      scoresByLevel12 = [0, 0, 0];
    for (let i = 0; i < mkstat.length; ++i) {
      const indv = mkstat[i];

      //win:0,draw:1,lose:2
      const ex =
        indv.myEx > indv.rivalEx ? 0 : indv.myEx === indv.rivalEx ? 1 : 2;

      if (indv.difficultyLevel === "11") {
        scoresByLevel11[ex]++;
      }
      if (indv.difficultyLevel === "12") {
        scoresByLevel12[ex]++;
      }
    }
    return setStat([
      {
        name: "☆11",
        WIN: scoresByLevel11[0],
        DRAW: scoresByLevel11[1],
        LOSE: scoresByLevel11[2],
      },
      {
        name: "☆12",
        WIN: scoresByLevel12[0],
        DRAW: scoresByLevel12[1],
        LOSE: scoresByLevel12[2],
      },
    ]);
  };
  useEffect(() => {
    makeStat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!stat) {
    return null;
  }
  const chartColor = _chartColor();
  return (
    <>
      <SubHeader icon={<GroupIcon />} text={<>比較</>} />
      <div style={{ width: "100%", height: "100px", margin: "5px auto" }}>
        <ResponsiveContainer>
          <BarChart
            margin={{
              left: -20,
              right: 0,
            }}
            layout="vertical"
            data={stat}
            stackOffset="expand"
          >
            <YAxis type="category" dataKey="name" stroke={chartColor + "cc"} />
            <XAxis type="number" hide />
            <Bar
              isAnimationActive={false}
              dataKey="WIN"
              stackId="a"
              fill={rivalBgColor(0) + "80"}
            >
              <LabelList valueAccessor={valueAccessor("WIN")} />
            </Bar>
            <Bar
              isAnimationActive={false}
              dataKey="DRAW"
              stackId="a"
              fill={rivalBgColor(1) + "80"}
            >
              <LabelList valueAccessor={valueAccessor("DRAW")} />
            </Bar>
            <Bar
              isAnimationActive={false}
              dataKey="LOSE"
              stackId="a"
              fill={rivalBgColor(2) + "80"}
            >
              <LabelList valueAccessor={valueAccessor("LOSE")} />
            </Bar>
            <Legend />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default CompareOverView;
