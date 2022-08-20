import React, { useState, useEffect } from "react";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import PeopleIcon from "@mui/icons-material/People";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import MenuIcon from "@mui/icons-material/Menu";
import Paper from "@mui/material/Paper";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import SportsEsportsIcon from "@mui/icons-material/SportsEsports";
import FilterNoneIcon from "@mui/icons-material/FilterNone";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import HistoryIcon from "@mui/icons-material/History";
import HelpIcon from "@mui/icons-material/Help";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import { _currentTheme } from "@/components/settings";

interface navBars {
  to: string;
  icon: JSX.Element;
  label: string;
}

const navItems: navBars[] = [
  {
    to: "/data",
    label: "インポート",
    icon: <SaveAltIcon />,
  },
  {
    to: "/songs",
    label: "楽曲一覧",
    icon: <LibraryMusicIcon />,
  },
  {
    to: "/stats",
    label: "統計",
    icon: <TrendingUpIcon />,
  },
  {
    to: "/rivals",
    label: "ライバル",
    icon: <PeopleIcon />,
  },
  {
    to: "#",
    label: "メニュー",
    icon: <MenuIcon />,
  },
];

const _stat: drawerItems[] = [
  {
    icon: <FilterNoneIcon />,
    name: "データ比較",
    href: "/compare",
  },
  {
    href: "/AAATable",
    name: "AAA達成表",
    icon: <WbIncandescentIcon />,
  },
  {
    href: "/history",
    name: "更新ログ",
    icon: <HistoryIcon />,
  },
];

const _social: drawerItems[] = [
  {
    icon: <FilterNoneIcon />,
    name: "データ比較",
    href: "/compare",
  },
  {
    href: "/AAATable",
    name: "AAA達成表",
    icon: <WbIncandescentIcon />,
  },
  {
    href: "/history",
    name: "更新ログ",
    icon: <HistoryIcon />,
  },
];

const _settings: drawerItems[] = [
  {
    href: "/settings",
    name: "設定",
    icon: <SettingsIcon />,
  },
  {
    href: "https://docs2.poyashi.me",
    name: "ヘルプ",
    icon: <HelpIcon />,
  },
];

const MobileBottomNav: React.FC<{ history: any }> = ({ history }) => {
  const theming = "__" + _currentTheme();
  const [value, setValue] = useState<number>(-1);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const toggleDrawer = () => setDrawerOpen(!drawerOpen);
  useEffect(() => {
    const exactNavItem = navItems.find((item) => item.to === window.location.pathname);
    if (exactNavItem) {
      setValue(navItems.findIndex((item) => item.to === exactNavItem.to));
    } else {
      setValue(-1);
    }
  }, [drawerOpen]);
  return (
    <>
      <Paper sx={{ position: "fixed", bottom: 0, left: 0, right: 0 }} elevation={3} style={{ zIndex: 1201 }}>
        <BottomNavigation
          value={value}
          onChange={(_event, newValue) => {
            const next = navItems[newValue];
            if (next.to === "#") {
              return toggleDrawer();
            } else {
              setValue(newValue);
              history.push(next.to);
            }
          }}
        >
          {navItems.map((item, i) => (
            <BottomNavigationAction label={item.label} icon={item.icon} />
          ))}
        </BottomNavigation>
      </Paper>
      <Drawer className={"globalDrawer"} id={theming} anchor="bottom" open={drawerOpen} onClose={toggleDrawer}>
        <GlobalDrawerItems items={_stat} history={history} drawerIcon={<SportsEsportsIcon />} title="実力管理" toggleDrawer={toggleDrawer} />
        <GlobalDrawerItems items={_settings} history={history} drawerIcon={<MenuOpenIcon />} title="その他" toggleDrawer={toggleDrawer} />
      </Drawer>
    </>
  );
};

interface drawerItems {
  icon: JSX.Element;
  href: string;
  name: string;
}

const GlobalDrawerItems: React.FC<{ drawerIcon: JSX.Element; title: string; items: drawerItems[]; history: any; toggleDrawer: () => void }> = ({ drawerIcon, title, items, history, toggleDrawer }) => {
  const clickItem = (item: drawerItems) => {
    toggleDrawer();
    if (item.href.indexOf("http") > -1) {
      window.open(item.href);
      return;
    }
    history.push(item.href);
  };

  return (
    <>
      <div className="TypographywithIconAndLinesContainer">
        <div className="TypographywithIconAndLinesInner">
          <Typography color="textSecondary" gutterBottom className="TypographywithIconAndLines moderate">
            {drawerIcon}
            &nbsp;
            {title}
          </Typography>
        </div>
      </div>
      <div style={{ overflowX: "scroll" }} className="topMenuScrollableWrapper">
        <Grid container direction="row" wrap="nowrap" alignItems="center" style={{ width: "100%", margin: "20px 0 0 0" }} className="topMenuContaienrGridWrapper">
          {items.map((item: any) => {
            return (
              <Grid style={{ width: "25%" }} container direction="column" alignItems="center" onClick={() => clickItem(item)} key={item.name}>
                {item.icon}
                <Typography color="textSecondary" variant="caption">
                  {item.name}
                </Typography>
              </Grid>
            );
          })}
        </Grid>
      </div>
    </>
  );
};

export default MobileBottomNav;
