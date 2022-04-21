import { _goalBPI, _isSingle, _currentStore } from "../settings";
import { scoresDB } from "../indexedDB";
import bpiCalcuator from "../bpi";
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import { _prefix } from "../songs/filter";
import { radarSongs } from "@/config/radar";

export interface withRivalData {
  title: string;
  difficulty: string;
  difficultyLevel: string;
  myEx: number;
  rivalEx: number;
  myMissCount: number | undefined;
  rivalMissCount: number | undefined;
  myClearState: number;
  rivalClearState: number;
  myLastUpdate: string;
  rivalLastUpdate: string;
}

interface D {
  title: string;
  difficulty: string;
  exScore: number;
  currentBPI: number;
}

export interface radarData {
  title: string;
  TotalBPI: number;
  rivalTotalBPI: number;
  details: D[];
  rivalDetails: D[];
  ObjectiveBPI: number;
  rank: number;
}

export const songs: { [key: string]: [string, string][] } = radarSongs;

export const getRadar = async (
  withRivalData: withRivalData[] | null = null
): Promise<radarData[]> => {
  const objective = _goalBPI(),
    isSingle = _isSingle(),
    currentStore = _currentStore();
  const db = new scoresDB(isSingle, currentStore);
  const fillArray = (p: number[], len: number) => {
    if (p.length < len) {
      const l = len - p.length;
      for (let j = 0; j < l; ++j) {
        p.push(-15);
      }
    }
    return p;
  };
  return await Object.keys(songs).reduce(
    async (obj: Promise<radarData[]>, title: string) => {
      const collection = await obj;
      const len = songs[title].length;
      const bpi = new bpiCalcuator();
      let pusher: number[] = [];
      let details: D[] = [];
      let rivalDetails: D[] = [];
      let rivalPusher: number[] = [];

      for (let i = 0; i < len; ++i) {
        const ind = await db.getItem(
          unescape(songs[title][i][0]),
          songs[title][i][1],
          currentStore,
          isSingle
        );
        ind.length > 0 && pusher.push(ind[0]["currentBPI"]);
        details.push({
          title: songs[title][i][0],
          difficulty: songs[title][i][1],
          exScore: ind.length > 0 ? ind[0].exScore : 0,
          currentBPI: ind.length > 0 ? ind[0].currentBPI : -15,
        });
        if (withRivalData) {
          let currentBPI = -15;
          const rivalData = withRivalData.find(
            (item: withRivalData) =>
              item.title === unescape(songs[title][i][0]) &&
              item.difficulty === songs[title][i][1]
          );
          if (rivalData) {
            const res = await bpi.calc(
              rivalData.title,
              rivalData.difficulty,
              rivalData.rivalEx
            );
            currentBPI = !res.error ? res.bpi : -15;
            rivalPusher.push(currentBPI);
          }
          rivalDetails.push({
            title: songs[title][i][0],
            difficulty: songs[title][i][1],
            exScore: rivalData ? rivalData.rivalEx : 0,
            currentBPI: currentBPI,
          });
        }
      }
      fillArray(pusher, len);
      fillArray(rivalPusher, len);

      bpi.allTwelvesBPI = pusher;
      bpi.allTwelvesLength = pusher.length;
      const total = bpi.totalBPI();
      bpi.allTwelvesBPI = rivalPusher;
      bpi.allTwelvesLength = rivalPusher.length;
      const rivalTotal = bpi.totalBPI();
      collection.push({
        title: title,
        TotalBPI: total,
        details: details,
        rivalTotalBPI: rivalTotal,
        rivalDetails: rivalDetails,
        ObjectiveBPI: objective,
        rank: (bpi.rank(total, false) / bpi.getTotalKaidens()) * 100,
      });
      return Promise.resolve(obj);
    },
    Promise.resolve([])
  );
};

export class Details extends React.Component<
  {
    closeModal: (key: string) => void;
    withRival: boolean;
    data: radarData[];
    title: string;
  },
  {}
> {
  componentDidMount() {
    window.history.pushState(null, "Detail", null);
    window.addEventListener("popstate", this.overridePopstate, false);
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.overridePopstate, false);
  }

  overridePopstate = () => this.props.closeModal("");

  render() {
    const { closeModal, withRival, data, title } = this.props;
    const target = data.find((item: radarData) => item.title === title);
    if (!target) {
      return;
    }
    return (
      <Dialog open={true} onClose={() => closeModal("")}>
        <DialogTitle className="narrowDialogTitle">{title}</DialogTitle>
        <DialogContent className="narrowDialogContent">
          <Table size="small">
            <TableHead>
              <TableRow className="detailModalTableRow">
                <TableCell component="th">楽曲</TableCell>
                {withRival && <TableCell align="right">ライバル</TableCell>}
                <TableCell align="right">あなた</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {target.details &&
                target.details.map((item: D) => {
                  const rival =
                    withRival && target.rivalDetails
                      ? target.rivalDetails.find(
                          (rd: D) => rd.title === item.title
                        )
                      : { exScore: 0, currentBPI: 0 };
                  return (
                    <TableRow key={item.title}>
                      <TableCell component="th" style={{ width: "100%" }}>
                        {item.title}
                        {_prefix(item.difficulty)}
                      </TableCell>
                      {withRival && rival && (
                        <TableCell align="right">
                          {rival.exScore}
                          <br />
                          BPI:{rival.currentBPI.toFixed(2)}
                        </TableCell>
                      )}
                      <TableCell align="right">
                        {item.exScore}
                        <br />
                        BPI:{item.currentBPI.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>
    );
  }
}
