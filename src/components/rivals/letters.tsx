import { scoresDB, rivalListsDB } from "../indexedDB";
import { scoreData, rivalScoreData, songData } from "../../types/data";
import bpiCalcuator from "../bpi";
import { difficultyDiscriminator } from "../songs/filter";
import fbActions from "../firebase/actions";

interface rivalScoreObject { [key: string]: rivalScoreData[] };

export interface datasets {
  rivalName: string,
  icon: string,
  exScore: number,
  BPI: number,
}

const loadLocalScore = async (): Promise<scoreData[]> => {
  return (await new scoresDB().getAll());
}

const loadRivalScore = async (): Promise<rivalScoreObject> => {
  return (await new rivalListsDB().getAllUserScores()).reduce((groups: rivalScoreObject, item: rivalScoreData) => {
    const p = item.title + item.difficulty;
    if (!groups[p]) {
      groups[p] = [];
    }
    groups[p].push(item);
    return groups;
  }, {});
}

export const loader = async () => {
  const local = await loadLocalScore();
  const rivals = await loadRivalScore();
  let scoreObj: any[] = [];
  local.map((item: scoreData) => {
    const p = item.title + item.difficulty;
    const obj = {
      win: 0,
      lose: 0,
      rate: 0,
      exScore: item.exScore,
      currentBPI: item.currentBPI,
      title: item.title,
      difficulty: item.difficulty,
      difficultyLevel: item.difficultyLevel,
      updatedAt: item.updatedAt,
    }
    if (rivals[p]) {
      rivals[p].map((rItem: rivalScoreData) => {
        const vs = item.exScore - rItem.exScore;
        if (vs > 0) {
          obj["win"]++;
        } else if (vs < 0) {
          obj["lose"]++;
        }
        return 0;
      });
      const rate = Number(obj["win"] / (obj["lose"] + obj["win"]) * 100);
      obj["rate"] = Math.round(Number.isNaN(rate) ? 0 : rate);
      scoreObj.push(obj);
    }
    return 0;
  });
  return scoreObj;
}

export const rivalShow = async (song: songData, score: scoreData | { exScore: number, currentBPI: number }): Promise<datasets[]> => {
  let list: datasets[] = [];

  const listsDB = new rivalListsDB();

  const rivals = await listsDB.getAllScoresWithTitle(song.title, difficultyDiscriminator(song.difficulty));
  for (let i = 0; i < rivals.length; ++i) {
    const item = rivals[i];
    const data = await listsDB.getDisplayData(item.rivalName);
    list.push({
      rivalName: data.name,
      icon: data.icon,
      exScore: item.exScore,
      BPI: new bpiCalcuator().setPropData(song, item.exScore, item.isSingle)
    });
  }
  list.push({
    rivalName: "あなた",
    icon: new fbActions().currentIcon(),
    exScore: score.exScore,
    BPI: score.currentBPI
  });
  return list.sort((a, b) => b.exScore - a.exScore);
}
