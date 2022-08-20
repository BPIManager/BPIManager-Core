import React, { useState, useEffect } from "react";

import { rivalScoreData } from "@/types/data";
import { CLBody, named, getTable } from "@/components/aaaDiff/data";
import Grid from "@mui/material/Grid";
import Divider from "@mui/material/Divider";
import Loader from "@/view/components/common/loader";
import AdsCard from "@/components/ad";
import SpeedDialIcon from "@mui/lab/SpeedDialIcon";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialAction from "@mui/lab/SpeedDialAction";
import FilterListIcon from "@mui/icons-material/FilterList";
import HelpIcon from "@mui/icons-material/Help";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { AAATableExampleModal } from "../AAATable/example";
import { AAATableFilterModal } from "../AAATable/filter";
import { _prefix } from "@/components/songs/filter";
import { _currentTheme } from "@/components/settings";
import bpiCalcuator from "@/components/bpi";

interface P {
  data?: rivalScoreData[];
}

const defaultChecks: number[] = [50, 40, 30, 20, 10, 0, -10, -20];
const defaultPM: number[] = [0, 1, 2]; //0:+ 1:-, 2:noplay

const AAATable: React.FC<P> = ({ data }) => {
  const [targetLevel, setTargetLevel] = useState(12);
  const [targetGoal, setTargetGoal] = useState(0);
  const [result, setResult] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<number[]>(defaultChecks);
  const [pm, setPM] = useState<number[]>(defaultPM);
  const [openExampleModal, setOpenExampleModal] = useState(false);
  const [openFilterModal, setOpenFitlerModal] = useState(false);
  const [dialOpen, setDialOpen] = useState(false);

  const changeTarget = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof e.target.value === "string") {
      const target = Number(e.target.value);
      const _named = await named(targetLevel, data);
      setLoading(true);
      setTargetGoal(target);
      setResult(await getTable(targetLevel, _named, target));
      setLoading(false);
    }
  };

  const changeLevel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof e.target.value === "string") {
      const targetLevel = Number(e.target.value);
      const _named = await named(targetLevel, data);
      setLoading(true);
      setTargetLevel(targetLevel);
      setResult(await getTable(targetLevel, _named, targetGoal));
      setLoading(false);
    }
  };

  const isChecked = (input: number, target: number): boolean => (target === 0 ? checks : pm).indexOf(input) > -1;

  const handleChange = (input: number, target: number): void => {
    let newValue = new Array().concat(target === 0 ? checks : pm);
    if (isChecked(input, target)) {
      newValue = newValue.filter((val) => val !== input);
    } else {
      newValue.push(input);
    }
    if (target === 0) {
      setChecks(newValue);
    } else if (target === 1) {
      setPM(newValue);
    }
  };

  const toggle = (): void => setChecks(defaultChecks.filter((item) => checks.indexOf(item) === -1));
  const handleFilterModal = () => setOpenFitlerModal(!openFilterModal);
  const handleExampleModal = () => setOpenExampleModal(!openExampleModal);
  const handleDial = () => setDialOpen(!dialOpen);

  const load = async () => {
    const _named = await named(12, data);
    setResult(await getTable(12, _named));
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const actions = [
    { icon: <FilterListIcon />, name: "フィルタ", onClick: handleFilterModal },
    { icon: <HelpIcon />, name: "AAA達成表とは?", onClick: handleExampleModal },
  ];

  return (
    <React.Fragment>
      {loading && <Loader />}
      <AdsCard />

      {!loading &&
        checks
          .sort((a, b) => b - a)
          .map((key: number) => {
            if (!result[key] || result[key].length === 0) {
              return null;
            }
            return (
              <div key={key}>
                <div style={{ width: "100%", textAlign: "center", background: "#eaeaea", color: "#000", padding: "5px 0", margin: "15px 0 5px 0", fontWeight: "bold" }}>
                  BPI{key}~{key === 50 ? "" : key + 10}&nbsp; ({new bpiCalcuator().rank(key)}位以上)
                </div>
                <Grid container>
                  {result[key].map((item: CLBody) => (
                    <GridItem key={item.title + item.difficulty} data={item} pm={pm} />
                  ))}
                </Grid>
              </div>
            );
          })}
      <Divider style={{ margin: "15px 0" }} />
      <SpeedDial ariaLabel="menu" style={{ position: "fixed", bottom: "8%", right: "8%" }} icon={<SpeedDialIcon icon={<MenuIcon />} openIcon={<CloseIcon />} />} onClose={handleDial} onOpen={handleDial} open={dialOpen} direction={"up"}>
        {actions.map((action) => (
          <SpeedDialAction key={action.name} icon={action.icon} title={action.name} onClick={action.onClick} />
        ))}
      </SpeedDial>
      {openExampleModal && <AAATableExampleModal closeModal={handleExampleModal} />}
      {openFilterModal && (
        <AAATableFilterModal
          target={targetGoal}
          changeTarget={changeTarget}
          closeModal={handleFilterModal}
          isChecked={isChecked}
          targetLevel={targetLevel}
          changeLevel={changeLevel}
          toggle={toggle}
          defaultPM={defaultPM}
          _default={defaultChecks}
          result={result}
          handleChange={handleChange}
        />
      )}
    </React.Fragment>
  );
};

export default AAATable;

const GridItem: React.FC<{ data: CLBody; pm: number[] }> = ({ data, pm }) => {
  const current = Number.isNaN(data.currentBPI) ? -15 : data.currentBPI;
  const gap = current - data.bpi;
  if (pm.indexOf(2) === -1 && Number.isNaN(data.currentBPI)) {
    return null;
  }
  if ((pm.indexOf(0) === -1 && gap >= 0) || (pm.indexOf(1) === -1 && gap < 0 && !Number.isNaN(data.currentBPI))) {
    return null;
  }
  return (
    <Grid
      className="AAATableGridItems"
      item
      xs={6}
      sm={4}
      md={4}
      lg={4}
      style={{
        textAlign: "center",
        padding: "15px 0",
        background: !Number.isNaN(data.currentBPI) ? AAATableBgColor(gap) : "#fff",
        textShadow: current >= 100 ? "0px 0px 4px #fff" : "0px 0px 0px",
        color: current >= 100 ? "#fff" : "#000",
        border: "1px solid " + (_currentTheme() === "light" ? "#fff" : "#222"),
      }}
    >
      <Grid item xs={12} sm={12} md={12} lg={12}>
        {data.title}
        {_prefix(data.difficulty)}
      </Grid>
      <Grid container>
        <Grid item xs={6} sm={6} md={6} lg={6}>
          {data.bpi}
        </Grid>
        <Grid item xs={6} sm={6} md={6} lg={6}>
          {current}
        </Grid>
      </Grid>
    </Grid>
  );
};

export const AAATableBgColor = (gap: number) => {
  if (gap < -20) {
    return "rgb(255, 49, 49)";
  }
  if (-15 > gap && gap >= -20) {
    return "rgb(255, 78, 78)";
  }
  if (-10 > gap && gap >= -15) {
    return "rgb(255, 140, 140)";
  }
  if (-5 > gap && gap >= -10) {
    return "rgb(255, 180, 180)";
  }
  if (0 > gap && gap >= -5) {
    return "rgb(255, 233, 153)";
  }
  if (0 <= gap && gap <= 5) {
    return "#EAEFF9";
  }
  if (5 < gap && gap <= 10) {
    return "#6C9BD2";
  }
  if (10 < gap && gap <= 15) {
    return "#187FC4";
  }
  if (15 < gap && gap <= 20) {
    return "#0068B7";
  }
  if (20 < gap && gap <= 30) {
    return "#0062AC";
  }
  if (30 < gap && gap <= 40) {
    return "#005293";
  }
  if (40 < gap && gap <= 50) {
    return "#004077";
  }
  if (gap > 50) {
    return "#003567";
  }
  return "rgb(255,255,255)";
};
