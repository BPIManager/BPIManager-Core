import { groupedArray, perDate } from "../../types/stats";
import { songsDB, scoresDB, scoreHistoryDB } from "../indexedDB";
import { songData, scoreData, historyData, rivalScoreData } from "../../types/data";
import { _isSingle, _currentStore } from "../settings";
import { _DiscriminateRanksByNumber } from "../common/djRank";
import { difficultyDiscriminator, difficultyParser } from "../songs/filter";
import bpiCalcuator from "../bpi";
import timeFormatter, { timeCompare, isSameDay } from "../common/timeFormatter";
import dayjs from "dayjs";
import { distBPMI, BPMDIST, bpmFilter, distSongs, distScores } from "./bpmDist";
const isSingle = _isSingle();

export const BPITicker = [-20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
interface P {
  title: string;
}
type shiftType = P & scoreData;

export default class statMain {
  private twelves: scoreData[] = [];
  private elevens: scoreData[] = [];

  private twelvesLast: scoreData[] = [];
  private elevensLast: scoreData[] = [];

  private songs: songData[] = [];

  private targetLevel: number;
  private store: string = _currentStore();
  private db = new scoresDB(isSingle, this.store);

  constructor(targetLevel: number) {
    this.targetLevel = targetLevel;
    this.store = _currentStore();
  }

  isLast: boolean = false;

  getData = (targetLevel: number = this.targetLevel, isLast: boolean = this.isLast) => {
    if (targetLevel === 12) {
      return isLast ? this.twelvesLast : this.twelves;
    }
    if (targetLevel === 11) {
      return isLast ? this.elevensLast : this.elevens;
    }
    return this.elevens;
  };

  reduceData = (data: scoreData[]) => data.filter((item) => item.currentBPI !== Infinity);

  async load(_derived?: rivalScoreData[]): Promise<this> {
    await this.db.loadStore();
    this.songs = (await new songsDB().getAll(isSingle)).filter((item: songData) => item.wr !== -1);
    this.twelves = this.reduceData(await this.db.getItemsBySongDifficulty("12"));
    this.elevens = this.reduceData(await this.db.getItemsBySongDifficulty("11"));
    return this;
  }

  async setLastData(version: string): Promise<this> {
    const db = await new scoresDB(isSingle, version).loadStore();
    this.twelvesLast = this.reduceData(await db.getItemsBySongDifficulty("12"));
    this.elevensLast = this.reduceData(await db.getItemsBySongDifficulty("11"));
    return this;
  }

  getTwelvesLast = () => this.twelvesLast;
  getElevensLast = () => this.elevensLast;

  setPropData(_derived: any) {
    this.twelves = _derived.filter((item: any) => item.difficultyLevel === "12");
    this.elevens = _derived.filter((item: any) => item.difficultyLevel === "11");
    return this;
  }

  async updatedAtToday() {
    const scores = await new scoresDB(isSingle, _currentStore()).getAll();
    return scores.filter((item: scoreData) => isSameDay(item.updatedAt, new Date()));
  }

  async songsByClearState() {
    const songsByClearState: groupedArray[] = [
      { name: "FAILED", "☆11": 0, "☆12": 0 },
      { name: "ASSISTED", "☆11": 0, "☆12": 0 },
      { name: "EASY", "☆11": 0, "☆12": 0 },
      { name: "CLEAR", "☆11": 0, "☆12": 0 },
      { name: "HARD", "☆11": 0, "☆12": 0 },
      { name: "EXHARD", "☆11": 0, "☆12": 0 },
      { name: "FC", "☆11": 0, "☆12": 0 },
    ];
    this.songs.reduce((groups: groupedArray[], item: songData) => {
      const score = this.songFinder(item["difficultyLevel"], item["title"], item["difficulty"]);
      if (score) {
        const lev = ("☆" + item["difficultyLevel"]) as "☆11" | "☆12";
        if (score.clearState > 0) {
          score.clearState < 7 && songsByClearState[score.clearState][lev]++;
        }
      }
      return groups;
    }, []);

    return songsByClearState.reverse();
  }

  makeGraphSentence(data: groupedArray[]) {
    let res = [];
    for (let i: number = 0; i < data.length; ++i) {
      const d = data[i];
      const lev = ("☆" + String(this.targetLevel)) as "☆11" | "☆12";
      if (d[lev] !== 0) {
        res.push({ name: d["name"], [lev]: d[lev] });
      }
    }
    return res;
  }

  async songsByDJRank() {
    const songsByDJRank: groupedArray[] = [
      { name: "F", "☆11": 0, "☆12": 0 },
      { name: "E", "☆11": 0, "☆12": 0 },
      { name: "D", "☆11": 0, "☆12": 0 },
      { name: "C", "☆11": 0, "☆12": 0 },
      { name: "B", "☆11": 0, "☆12": 0 },
      { name: "A", "☆11": 0, "☆12": 0 },
      { name: "AA", "☆11": 0, "☆12": 0 },
      { name: "AAA", "☆11": 0, "☆12": 0 },
    ];

    this.songs.reduce((groups: groupedArray[], item: songData) => {
      const score = this.songFinder(item["difficultyLevel"], item["title"], item["difficulty"]);
      if (score) {
        const p = score.exScore / (item["notes"] * 2);
        const lev = ("☆" + item["difficultyLevel"]) as "☆11" | "☆12";
        songsByDJRank[_DiscriminateRanksByNumber(p)][lev]++;
      }
      return groups;
    }, []);

    return songsByDJRank.reverse();
  }

  async groupedByLevel(derivedData: any = null) {
    let bpis = BPITicker;
    let groupedByLevel = [];
    const exec = (diff: number, isLast: boolean) => this.groupBy(this.bpiMapper(derivedData && isLast ? derivedData : this.getData(diff, isLast)));

    for (let i = 0; i < bpis.length; ++i) {
      let obj: {
        name: number;
        "☆11": number;
        "☆12": number;
        "☆11(比較対象)": number;
        "☆12(比較対象)": number;
      } = { name: bpis[i], "☆11": 0, "☆12": 0, "☆11(比較対象)": 0, "☆12(比較対象)": 0 };
      obj["☆11"] = exec(11, false)[bpis[i]] || 0;
      obj["☆12"] = exec(12, false)[bpis[i]] || 0;
      obj["☆11(比較対象)"] = exec(12, true)[bpis[i]] || 0;
      obj["☆12(比較対象)"] = exec(11, true)[bpis[i]] || 0;
      groupedByLevel.push(obj);
    }

    return groupedByLevel;
  }

  eachDayShift: { [key: string]: shiftType[] } = {};

  async eachDaySumRawData(period: number, last?: string | Date, propdata?: any, range: number = 10): Promise<{ [key: string]: shiftType[] }> {
    await this.eachDaySum(period, last, propdata, range);
    return this.eachDayShift;
  }

  async eachDaySum(period: number, last?: string | Date, propdata?: any, range: number = 10): Promise<perDate[]> {
    const data = propdata || (await new scoreHistoryDB().getAll(String(this.targetLevel)));
    let eachDaySum: perDate[] = [];

    const sortByDate = (data: historyData[]): { [key: string]: historyData[] } => {
      return data.reduce((groups: { [key: string]: historyData[] }, item: historyData) => {
        if (item.BPI === Infinity) {
          return groups;
        }
        const date = timeFormatter(period, item.updatedAt);
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(item);
        return groups;
      }, {});
    };

    const allDiffs = this.objectSort(sortByDate(data));
    const _bpi = new bpiCalcuator();
    const total = (item: historyData[]): number => {
      let t = item.reduce((sum: number, item: historyData) => {
        sum += item.BPI;
        return sum;
      }, 0);
      return t;
    };
    const getBPIArray = (item: historyData[]): number[] => {
      let t = item.reduce((array: number[], item: historyData) => {
        array.push(item.BPI);
        return array;
      }, []);
      return t;
    };
    let lastDay: string;

    const songsLen = await new songsDB().getSongsNum(String(this.targetLevel));
    Object.keys(allDiffs).map((item) => {
      if (!last || dayjs(item).isBefore(last)) {
        this.eachDayShift[item] = lastDay ? this.eachDayShift[lastDay].concat() : [];
        const p = allDiffs[item].reduce((a: number[], val: historyData) => {
          this.eachDayShift[item] = this.eachDayShift[item].filter((elm) => {
            return elm.mergedTitle !== String(val.title + val.difficulty);
          }); //重複削除
          this.eachDayShift[item].push({
            ...val,
            mergedTitle: val.title + val.difficulty,
            currentBPI: val.BPI,
            lastScore: 0,
            clearState: 0,
          }); //改めて追加
          if (val.BPI) {
            a.push(val.BPI);
          }
          lastDay = item;
          return a;
        }, []);

        const shift = this.getBPIShifts(this.eachDayShift[item]);
        const BPIsArray = getBPIArray(allDiffs[item]);
        eachDaySum.push({
          name: item,
          sum: allDiffs[item].length,
          shiftedBPI: _bpi.setBPIs(shift).setLength(songsLen).totalBPI(),
          max: Math.max(...BPIsArray),
          min: Math.min(...BPIsArray),
          med: this.getMedian(BPIsArray),
          avg: _bpi.setBPIs(p).setLength(p.length).totalBPI() || Math.round((total(allDiffs[item]) / allDiffs[item].length) * 100) / 100,
        });
      }
      return 0;
    });
    return eachDaySum.sort((a, b) => timeCompare(a.name, b.name)).slice(-1 * range);
  }

  getBPIShifts = (array: shiftType[]) => {
    return array.reduce((groups: number[], val: shiftType) => {
      groups.push(val.BPI);
      return groups;
    }, []);
  };

  getMedian = (array: number[]) => {
    const mid = Math.floor(array.length / 2),
      nums = [...array].sort((a, b) => a - b);
    return Math.round((array.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2) * 100) / 100;
  };

  at = (isLast: boolean = false) => {
    if (isLast) {
      return this.bpiMapper(this.targetLevel === 12 ? this.twelvesLast : this.elevensLast);
    }
    return this.bpiMapper(this.targetLevel === 12 ? this.twelves : this.elevens);
  };

  songFinder = (level: string, title: string, difficulty: string) => this.getData(Number(level)).find((elm: scoreData) => elm.title === title && elm.difficulty === difficultyDiscriminator(difficulty));

  bpiMapper = (t: scoreData[]) => t.map((item: scoreData) => item.currentBPI).filter((item) => !isNaN(item) && item !== Infinity);

  groupBy = (array: number[]) => {
    return array.reduce((groups: { [key: number]: number }, item: number) => {
      let _ = Math.floor(item / 10) * 10;
      if (_ > 100) _ = 100;
      if (!groups[_]) {
        groups[_] = 1;
      } else {
        groups[_]++;
      }
      return groups;
    }, {});
  };

  objectSort = (object: any) => {
    var sorted: any = {};
    var array: string[] = [];
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        array.push(key);
      }
    }
    array.sort();
    for (var i = 0; i < array.length; i++) {
      sorted[array[i]] = object[array[i]];
    }
    return sorted;
  };

  bpmDist = async (difficulty: "11" | "12" = "12", derived?: any): Promise<distBPMI[]> => {
    let distByBPM: { [key in BPMDIST]: number[] } = {
      "~139": [],
      "~159": [],
      "~179": [],
      "~199": [],
      "200~": [],
      SOF: [],
    };
    let numDistByBPM = {
      "~139": 0,
      "~159": 0,
      "~179": 0,
      "~199": 0,
      "200~": 0,
      SOF: 0,
    };
    let result: { [key in BPMDIST]: number } = {
      "~139": -15,
      "~159": -15,
      "~179": -15,
      "~199": -15,
      "200~": -15,
      SOF: -15,
    };
    const sdb = new songsDB();
    const allSongs: distSongs = (await sdb.getAll())
      .filter((item: songData) => item.difficultyLevel === difficulty && item.wr !== -1)
      .reduce((groups: distSongs, item: songData) => {
        const b = bpmFilter(item.bpm);
        groups[item.title + item.difficulty] = b;
        numDistByBPM[b]++;
        return groups;
      }, {});
    (derived || this.getData(Number(difficulty))).reduce((groups: distScores, item: scoreData) => {
      if (!isNaN(item.currentBPI) && isFinite(item.currentBPI) && allSongs[item.title + difficultyParser(item.difficulty, isSingle)]) {
        distByBPM[allSongs[item.title + difficultyParser(item.difficulty, isSingle)]].push(item.currentBPI);
      }
      return groups;
    }, {});
    const bpi = new bpiCalcuator();
    const keys = Object.keys(distByBPM) as BPMDIST[];
    for (let i = 0; i < keys.length; ++i) {
      const item = distByBPM[keys[i]];
      result[keys[i]] = await bpi.setSongs(item, null, item.length);
    }
    return Object.keys(result).reduce((groups: distBPMI[], item: string) => {
      const name = item as BPMDIST;
      groups.push({
        name: name,
        BPI: result[name],
      });
      return groups;
    }, []);
  };
}
