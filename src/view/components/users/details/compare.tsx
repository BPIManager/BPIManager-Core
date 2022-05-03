import { _currentTheme } from "@/components/settings";
import { Container } from "@mui/material";
import React, { useEffect, useState } from "react";
import { makeRivalStat } from "../../rivals/view";
import RivalStatViewFromUserPage from "../../rivals/viewComponents/statsFromUserPage";
import GroupIcon from "@mui/icons-material/Group";
import SubHeader from "../../topPage/subHeader";

const CompareDetail: React.FC<{
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
      <Container
        className={
          "commonLayout " +
          (c === "dark"
            ? "darkTheme"
            : c === "light"
            ? "lightTheme"
            : "deepSeaTheme")
        }
      >
        <SubHeader icon={<GroupIcon />} text={<>比較</>} />
      </Container>
      <RivalStatViewFromUserPage
        full={stat}
        rivalRawData={rivalData}
        backToMainPage={backToMainPage}
        name={meta.displayName}
      />
    </>
  );
};

export default CompareDetail;
