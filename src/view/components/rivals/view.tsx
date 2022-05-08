import React from "react";

import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import SongsUI from "./viewComponents/ui";
import Settings from "./viewComponents/settings";
import { scoresDB, rivalListsDB } from "@/components/indexedDB";
import RivalStats from "./viewComponents/stats";
import {
  scoreData,
  rivalScoreData,
  rivalStoreData,
  DBRivalStoreData,
} from "@/types/data";
import { withRivalData } from "@/components/stats/radar";
import Loader from "../common/loader";
import Container from "@mui/material/Container/Container";

interface S {
  isLoading: boolean;
  currentTab: number;
  full: withRivalData[];
  rivalRawData: rivalScoreData[];
}

interface P {
  rivalData: string;
  backToMainPage: () => void;
  toggleSnack: () => void;
  isNotRival?: boolean;
  rivalMeta: rivalStoreData | DBRivalStoreData | null;
  descendingRivalData?: rivalScoreData[];
  showAllScore: boolean;
}

class RivalView extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      isLoading: true,
      currentTab: 0,
      full: [],
      rivalRawData: [],
    };
  }

  async componentDidMount() {
    this.loadRivalData();
  }

  loadRivalData = async () => {
    this.setState({ isLoading: true });
    const { rivalData, showAllScore, descendingRivalData } = this.props;
    const raw = await fullData(descendingRivalData, rivalData);
    return this.setState({
      isLoading: false,
      rivalRawData: raw,
      full: await makeRivalStat(raw, showAllScore),
    });
  };

  handleChange = (_event: React.ChangeEvent<{}>, newValue: number) => {
    this.setState({ currentTab: newValue });
  };

  rivalName = () =>
    this.props.isNotRival
      ? (this.props.rivalMeta as rivalStoreData).displayName
      : (this.props.rivalMeta as DBRivalStoreData).rivalName;

  render() {
    const { isLoading, currentTab, full, rivalRawData } = this.state;
    const { backToMainPage, isNotRival, rivalMeta, showAllScore } = this.props;
    if (isLoading) {
      return <Loader />;
    }
    return (
      <Container fixed className="commonLayout">
        <Typography
          component="h5"
          variant="h5"
          color="textPrimary"
          gutterBottom
        >
          <Button
            onClick={backToMainPage}
            style={{ minWidth: "auto", padding: "6px 0px" }}
          >
            <ArrowBackIcon />
          </Button>
          &nbsp;{rivalMeta && this.rivalName()}
        </Typography>
        {(!rivalMeta || isNotRival) && (
          <SongsUI
            rivalName={this.rivalName}
            showAllScore={showAllScore}
            type={0}
            full={full}
          />
        )}
        {rivalMeta && !isNotRival && (
          <div>
            <Tabs
              value={this.state.currentTab}
              onChange={this.handleChange}
              indicatorColor="primary"
              textColor="secondary"
              style={{ margin: "5px 0" }}
            >
              <Tab label="比較" />
              <Tab label="統計" />
              {!isNotRival && <Tab label="設定" />}
            </Tabs>
            {currentTab === 0 && (
              <SongsUI
                rivalName={this.rivalName}
                showAllScore={showAllScore}
                type={0}
                full={full}
              />
            )}
            {currentTab === 1 && (
              <RivalStats full={full} rivalRawData={rivalRawData} />
            )}
            {currentTab === 2 && (
              <Settings
                backToMainPage={this.props.backToMainPage}
                toggleSnack={this.props.toggleSnack}
                rivalMeta={rivalMeta as DBRivalStoreData}
              />
            )}
          </div>
        )}
      </Container>
    );
  }
}

export default RivalView;

export const makeRivalStat = async (
  full: rivalScoreData[],
  _showAllScore: boolean = false
) => {
  const allScores = (await new scoresDB().getAll()).reduce(
    (groups: { [key: string]: scoreData }, item: scoreData) => {
      groups[item.title + item.difficulty] = item;
      return groups;
    },
    {}
  );
  const rivalRawData = full;
  const allRivalScores = rivalRawData.reduce(
    (groups: { [key: string]: rivalScoreData }, item: rivalScoreData) => {
      groups[item.title + item.difficulty] = item;
      return groups;
    },
    {}
  );
  return Object.keys(allRivalScores).reduce(
    (groups: withRivalData[], key: string) => {
      const mine = allScores[key] || {
        exScore: 0,
        missCount: NaN,
        clearState: 7,
        updatedAt: "-",
      };
      const rival = allRivalScores[key];
      groups.push({
        title: rival.title,
        difficulty: rival.difficulty,
        difficultyLevel: rival.difficultyLevel,
        myEx: mine.exScore || 0,
        rivalEx: rival.exScore,
        myMissCount: mine.missCount || 0,
        rivalMissCount: rival.missCount,
        myClearState: mine.clearState || 7,
        rivalClearState: rival.clearState,
        myLastUpdate: mine.updatedAt,
        rivalLastUpdate: rival.updatedAt,
      });
      return groups;
    },
    []
  );
};

export const fullData = async (
  descendingRivalData: rivalScoreData[] | undefined,
  rivalData: string = ""
): Promise<rivalScoreData[]> => {
  if (descendingRivalData) {
    return descendingRivalData;
  }
  return await new rivalListsDB().getAllScores(rivalData);
};
