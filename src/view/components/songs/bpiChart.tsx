import React, { useState } from "react";

import { scoreData, songData } from "@/types/data";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Label,
} from "recharts";
import { _chartColor, _chartBarColor } from "@/components/settings";
import { chartData } from "./detailsScreen";
import InfoIcon from "@mui/icons-material/Info";
import Link from "@mui/material/Link";

interface P {
  song: songData | null;
  score: scoreData | null;
  chartData: chartData[];
  graphLastUpdated: number;
  newScore: number;
}

const BPIChart: React.FC<P> = ({
  song,
  score,
  chartData,
  graphLastUpdated,
  newScore,
}) => {
  const [closeAlert, setCloseAlert] = useState(false);
  const chartColor = _chartColor();

  if (!song || !score) {
    return null;
  }

  const max = song.notes ? song.notes * 2 : 0;
  const CustomTooltip = (props: any) => {
    if (props.active && props.payload[0].payload) {
      const p = props.payload[0].payload;
      const per = Math.round((p["EX SCORE"] / (song.notes * 2)) * 10000) / 100;
      const gap =
        (!Number.isNaN(newScore) ? newScore : score.exScore) - p["EX SCORE"];
      return (
        <div className="custom-tooltip">
          {p.name !== "YOU" ? (
            <div>
              <p>
                <b>BPI{p.name}</b>
              </p>
              <p>EX:{p["EX SCORE"]}</p>
              <p>PER:{per}%</p>
              <p>GAP:{gap}</p>
            </div>
          ) : (
            <div>
              <p>
                <b>YOUR SCORE</b>
              </p>
              <p>EX:{p["EX SCORE"]}</p>
              <p>PER:{per}%</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        width: "95%",
        height: "100%",
        margin: "5px auto",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {(song.avg === -1 || song.wr === -1) && !closeAlert && (
        <div className="noBPIAlert">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <InfoIcon style={{ fontSize: 40 }} />
            <p>BPI非対応楽曲です</p>
          </div>
          <div>
            <p style={{ textAlign: "center", fontSize: 8 }}>
              この楽曲はスコアログの保存のみ対応しています。
              <br />
              設定画面「表示」タブより表示の有無を切り替えできます。
              <br />
              <br />
              <Link
                href="https://gist.github.com/potakusan/b5768f3ec6c50556beec50dd14ebaf23"
                target="_blank"
                color="secondary"
              >
                詳細はこちら
              </Link>
              &nbsp;|&nbsp;
              <Link color="secondary">
                <span onClick={() => setCloseAlert(true)}>閉じる</span>
              </Link>
            </p>
          </div>
        </div>
      )}
      <ResponsiveContainer width="100%">
        <BarChart data={chartData} key={graphLastUpdated}>
          <XAxis stroke={chartColor} dataKey="name" />
          <YAxis
            stroke={chartColor}
            domain={[0, max]}
            ticks={[
              Math.ceil(max * (6 / 9)),
              Math.ceil(max * (7 / 9)),
              Math.ceil(max * (8 / 9)),
              max,
            ]}
            width={40}
          />
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ strokeDasharray: "3 3" }}
            contentStyle={{ color: "#333" }}
            position={{ y: 155 }}
          />
          <Bar dataKey="EX SCORE" isAnimationActive={false}>
            {chartData.map((item) => (
              <Cell key={item.name} fill={_chartBarColor(item.name)} />
            ))}
          </Bar>
          {[
            { y: max * (8 / 9), label: "AAA" },
            { y: max * (7 / 9), label: "AA" },
            { y: max * (2 / 3), label: "A" },
          ].map((item) => (
            <ReferenceLine
              key={item.label}
              y={item.y}
              label={
                <Label position="insideTopRight" style={{ fill: chartColor }}>
                  {item.label}
                </Label>
              }
              stroke={chartColor}
              isFront
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BPIChart;
