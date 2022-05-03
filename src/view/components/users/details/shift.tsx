import { _currentTheme } from "@/components/settings";
import React, { useEffect, useState } from "react";
import { makeRivalStat } from "../../rivals/view";
import SubHeader from "../../topPage/subHeader";
import Shift from "../../stats/shift";
import BarChartIcon from "@mui/icons-material/BarChart";

const ShiftDetail: React.FC<{
  backToMainPage: () => void;
  rivalData: any;
  meta: any;
}> = ({ backToMainPage, rivalData, meta }) => {
  const c = _currentTheme();
  const [stat, setStat] = useState<any>(null);
  const makeStat = async () => {
    const mkstat = await makeRivalStat(rivalData);
    return setStat(mkstat);
  };
  useEffect(() => {
    makeStat();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!stat) {
    return null;
  }
  return (
    <>
      <SubHeader icon={<BarChartIcon />} text={<>過去30日間の推移</>} />
      <div style={{ opacity: 0.8 }}>
        <Shift propdata={rivalData} />
      </div>
    </>
  );
};

export default ShiftDetail;
