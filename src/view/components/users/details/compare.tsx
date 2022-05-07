import React, { useEffect, useState } from "react";
import { makeRivalStat } from "../../rivals/view";
import RivalStatViewFromUserPage from "../../rivals/viewComponents/statsFromUserPage";
import GroupIcon from "@mui/icons-material/Group";
import SubHeader from "../../topPage/subHeader";

const CompareDetail: React.FC<{
  rivalData: any;
}> = ({ rivalData }) => {
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
      <SubHeader icon={<GroupIcon />} text={<>比較</>} />
      <RivalStatViewFromUserPage full={stat} rivalRawData={rivalData} />
    </>
  );
};

export default CompareDetail;
