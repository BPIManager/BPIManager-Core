import React, { useState, useEffect } from "react";
import Container from "@mui/material/Container";
import { injectIntl } from "react-intl";
import { _currentStore } from "@/components/settings";
import fbActions from "@/components/firebase/actions";
import { RouteComponentProps, withRouter } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import ViewListIcon from "@mui/icons-material/ViewList";
import RivalView from "@/view/components/rivals/view";
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Grid,
  Button,
  Typography,
} from "@mui/material/";
import ClearLampView from "@/view/components/table/fromUserPage";
import WbIncandescentIcon from "@mui/icons-material/WbIncandescent";
import { avatarBgColor, avatarFontColor } from "@/components/common";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import getUserData from "@/components/user";
import "react-calendar-heatmap/dist/styles.css";
import StarHalfIcon from "@mui/icons-material/StarHalf";
import UserHeader, { LoadingHeader } from "../components/users/header";
import { FollowList } from "../components/users/count";
import CompareOverView from "../components/users/overviews/compare";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ShiftOverView from "../components/users/overviews/shift";
import MenuIcon from "@mui/icons-material/Menu";
import SubHeader from "../components/topPage/subHeader";
import CompareDetail from "../components/users/details/compare";
import ShiftDetail from "../components/users/details/shift";
import { ShareList } from "../components/common/shareButtons";
import { config } from "@/config";
import bpiCalculator from "@/components/bpi";
import ShareIcon from "@mui/icons-material/Share";

const User: React.FC<
  {
    intl: any;
    currentUserName?: string;
    limited?: boolean;
    exact?: boolean;
    updateName?: (name: string) => void;
    initialView?: number;
  } & RouteComponentProps
> = ({
  match,
  history,
  currentUserName,
  limited,
  exact,
  updateName,
  initialView,
}) => {
  const fbA = new fbActions();
  const [userName, setUserName] = useState<string>(
    currentUserName || (match.params as any).uid || ""
  );
  const [myDisplayName, setMyDisplayName] = useState<string>("");
  const [myId, setMyId] = useState<string>("");
  const [metaData, setMetaData] = useState<any>(null);
  const [processing, setProcessing] = useState<boolean>(true);
  const [rivalData, setRivalData] = useState<any>([]);
  const [scoreHistory, setScoreHistory] = useState<any>([]);

  const [currentView, setCurrentView] = useState<number>(0);
  const [compareDetail, setCompareDetail] = useState<boolean>(false);
  const [shiftDetail, setShiftDetail] = useState<boolean>(false);

  useEffect(() => {
    if (!userName) {
      fbA.auth().onAuthStateChanged(async (user: any) => {
        if (user) {
          const t = await fbA.setDocName(user.uid).load();
          setMyDisplayName(t && t.displayName ? t.displayName : "");
        }
        setProcessing(false);
      });
    } else {
      fbA.auth().onAuthStateChanged(async (user: any) => {
        if (user) {
          const t = await fbA.setDocName(user.uid).load();
          setMyDisplayName(t && t.displayName ? t.displayName : "");
          setMyId(user ? user.uid : "");
        }
      });
    }
    search();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const changeUser = (userName: string) => {
    search(userName);
  };

  const search = async (forceUserName?: string): Promise<void> => {
    const exactId = (match.params as any).exactId || exact;
    const targetName = forceUserName ? forceUserName : userName;
    setProcessing(true);
    const res =
      exactId && userName === "_"
        ? await fbA.searchByExactId(exactId)
        : exactId && !forceUserName
        ? await fbA.searchByExactId(targetName)
        : await fbA.searchRival(targetName);
    if (res) {
      if (forceUserName) {
        history.replace("/u/" + targetName);
      }
      if (exactId) {
        setUserName(res.displayName);
        if (!exact) {
          history.replace("/u/" + targetName);
        } else {
          if (updateName) updateName(targetName);
        }
      }
      const userData = new getUserData();
      const scores = await userData.rivalScores(res);
      setScoreHistory(userData.scoreHistory());

      if (res.isPublic === false) {
        setMetaData(null);
        setUserName("");
        return;
      }
      setRivalData(scores);
      setMetaData(res);
    } else {
      setMetaData(null);
      setUserName("");
    }
    setProcessing(false);
  };

  const backToMainPage = (): void => {
    setCurrentView(0);
  };
  const changePage = (newPage: number): void => {
    setCurrentView(newPage);
  };

  if (processing) {
    return <LoadingHeader />;
  }

  if (!metaData) {
    return <NotFound />;
  }

  if (currentView === 1) {
    //スコア一覧
    return (
      <RivalView
        toggleSnack={() => null}
        backToMainPage={backToMainPage}
        showAllScore={true}
        rivalData={metaData.uid}
        rivalMeta={metaData}
        descendingRivalData={rivalData}
        isNotRival={true}
      />
    );
  }
  if (currentView === 2) {
    //AAA達成表
    return (
      <Container fixed className="commonLayout">
        <ClearLampView
          backToMainPage={backToMainPage}
          name={userName}
          data={rivalData}
        />
      </Container>
    );
  }

  return (
    <>
      <UserHeader meta={metaData} myId={myId} myDisplayName={myDisplayName} />
      <Container>
        <FollowList changeUser={changeUser} meta={metaData} />
        <div style={{ margin: "35px 0" }} />
        {shiftDetail && (
          <ShiftDetail
            backToMainPage={backToMainPage}
            meta={metaData}
            rivalData={scoreHistory}
          />
        )}
        {!shiftDetail && (
          <>
            <ShiftOverView rivalData={scoreHistory} />
            <ShowMoreButton
              text="さらに表示"
              action={() => setShiftDetail(true)}
            />
          </>
        )}
        {compareDetail && (
          <CompareDetail
            backToMainPage={backToMainPage}
            meta={metaData}
            rivalData={rivalData}
          />
        )}
        {!compareDetail && (
          <>
            <CompareOverView rivalData={rivalData} />
            <ShowMoreButton
              text="さらに表示"
              action={() => setCompareDetail(true)}
            />
          </>
        )}
        {compareDetail && (
          <CompareDetail
            backToMainPage={backToMainPage}
            meta={metaData}
            rivalData={rivalData}
          />
        )}
        <Menu open={changePage} uid={metaData.uid} />
        <Share userName={userName} metaData={metaData} />
      </Container>
    </>
  );
};

const Menu: React.FC<{ open: (key: number) => void; uid: string }> = ({
  open,
  uid,
}) => {
  const showBPIMRanks = () => {
    if (uid) {
      window.open(
        "https://rank.poyashi.me/user/" + uid + "/" + _currentStore()
      );
    } else {
      return alert("UserID cannot be determined");
    }
  };
  return (
    <>
      <SubHeader icon={<MenuIcon />} text={<>メニュー</>} />
      <List dense sx={{ opacity: 0.8 }}>
        {[
          {
            icon: <ViewListIcon />,
            primary: "スコア一覧",
            secondary: "登録済みのスコアを表示します",
            onClick: () => open(1),
          },
          {
            icon: <WbIncandescentIcon />,
            primary: "AAA達成表",
            secondary: "BPIに基づいたAAA達成難易度表を表示します",
            onClick: () => open(2),
          },
          {
            icon: <StarHalfIcon />,
            primary: "BPIMRanks (外部サイト)",
            secondary: "BPIManager ユーザー内での順位を表示します",
            onClick: () => showBPIMRanks(),
          },
        ].map((item, i) => {
          return (
            <DefListCard
              key={i}
              onAction={item.onClick}
              disabled={false}
              icon={item.icon}
              primaryText={item.primary}
              secondaryText={item.secondary}
            />
          );
        })}
      </List>
    </>
  );
};

const ShowMoreButton: React.FC<{ text: string; action: () => void }> = ({
  text,
  action,
}) => (
  <Grid container alignItems="center">
    <Grid item xs={6}></Grid>
    <Grid item xs={6} style={{ display: "flex", justifyContent: "flex-end" }}>
      <Button startIcon={<ArrowRightIcon />} onClick={() => action()}>
        {text}
      </Button>
    </Grid>
  </Grid>
);

const Share: React.FC<{ userName: string; metaData: any }> = ({
  userName,
  metaData,
}) => {
  const url = config.baseUrl + "/u/" + encodeURI(userName);

  const totalBPI =
    metaData.totalBPIs && metaData.totalBPIs[_currentStore()]
      ? metaData.totalBPIs[_currentStore()]
      : "-";
  const totalRank = new bpiCalculator().rank(totalBPI, false);
  const rankPer =
    Math.round((totalRank / new bpiCalculator().getTotalKaidens()) * 1000000) /
    10000;

  return (
    <>
      <SubHeader icon={<ShareIcon />} text={<>共有</>} />
      <div style={{ filter: "grayscale(100%)", opacity: 0.8 }}>
        <ShareList
          disableSubHeader
          withTitle={true}
          dense
          url={url}
          text={
            metaData.displayName +
            " 総合BPI:" +
            String(Number.isNaN(totalBPI) ? "-" : totalBPI) +
            `(推定順位:${totalRank}位,皆伝上位${rankPer}%)`
          }
        />
      </div>
    </>
  );
};

export default injectIntl(withRouter(User));

export class DefListCard extends React.Component<
  {
    onAction: () => any;
    disabled: boolean;
    primaryText: string;
    secondaryText: string;
    icon: JSX.Element;
  },
  {}
> {
  render() {
    const { icon, onAction, disabled, primaryText, secondaryText } = this.props;
    return (
      <ListItem button onClick={onAction} disabled={disabled}>
        <ListItemAvatar>
          <Avatar style={{ background: avatarBgColor, color: avatarFontColor }}>
            {icon}
          </Avatar>
        </ListItemAvatar>
        <ListItemText primary={primaryText} secondary={secondaryText} />
        <ListItemSecondaryAction onClick={onAction}>
          <IconButton edge="end" size="large">
            <ArrowForwardIosIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}

const NotFound: React.FC = () => (
  <Container style={{ marginTop: "25px" }}>
    <Typography variant="h5">User not found</Typography>
    <Typography variant="body1">ユーザーが見つかりませんでした</Typography>
    <Typography variant="body1">
      表示名が変更されたか、プロフィールが非公開にされている可能性があります。
    </Typography>
  </Container>
);
