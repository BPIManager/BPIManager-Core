import bpiCalcuator from "@/components/bpi";
import importCSV from "@/components/import/csv";
import importJSON from "@/components/import/json";
import bpiCalculator, { showBpiDist } from "@/components/bpi";
import { _currentStore, _isSingle } from "@/components/settings";
import { _autoSync } from "@/components/settings";
import { getUA } from "@/components/common";
import { scoresDB, importer } from "@/components/indexedDB";
import statMain from "@/components/stats/main";
import { scoreData } from "@/types/data";
import { _prefix } from "@/components/songs/filter";
import { timeCompare } from "@/components/common/timeFormatter";
import dayjs from "dayjs";
import { isOlderVersion } from "../common/versions";

export interface ImportResult {
  stateText: string;
  errors: string[];
  updated: number;
  updatedText: string;
}

const _ = async (
  raw: string,
  uid: string = "",
  updateGlobal: (u: string) => void
): Promise<ImportResult> => {
  const detectJSON = (arg: string) => {
    try {
      arg = !JSON ? false : JSON.parse(arg);
      return true;
    } catch (e) {
      return false;
    }
  };

  const getText = async (): Promise<string> => {
    if (raw !== "") {
      return raw;
    }
    const ua = getUA();
    if (ua !== "chrome") {
      try {
        return await navigator.clipboard.readText();
      } catch (e: any) {
        console.log(e);
        return raw;
      }
    }

    const permission = await navigator.permissions.query({
      name: "clipboard-read" as PermissionName,
    });

    if (permission.state === "granted" || permission.state === "prompt") {
      try {
        return await navigator.clipboard.readText();
      } catch (e: any) {
        return raw;
      }
    } else {
      throw new Error(
        "クリップボードの内容を読み取れません。フィールドにデータをコピーし、再度取り込み実行してください。"
      );
    }
  };

  try {
    let errors = [];
    const isSingle: number = _isSingle();
    const currentStore: string = _currentStore();
    let text = await getText();
    const isJSON = detectJSON(text);
    const executor: importJSON | importCSV = isJSON
      ? new importJSON(text, isSingle, currentStore)
      : new importCSV(text, isSingle, currentStore);
    const calc: bpiCalculator = new bpiCalculator();
    const exec: number = await executor.execute();
    const scores = [];
    const histories = [];
    if (!exec) {
      throw new Error("データの形式が正しくありません");
    }

    const result = executor.getResult(),
      resultHistory = executor.getResultHistory();
    const s = new scoresDB(isSingle, currentStore);
    let updated = 0,
      skipped = 0,
      errorOccured = 0;
    const all = await s.getAll().then((t) =>
      t.reduce((result: { [key: string]: scoreData }, current: scoreData) => {
        result[current.title + current.difficulty] = current;
        return result;
      }, {})
    );
    for (let i = 0; i < result.length; ++i) {
      const calcData = await calc.calc(
        result[i]["title"],
        result[i]["difficulty"],
        result[i]["exScore"]
      );
      if (calcData.error && calcData.reason) {
        const suffix = _prefix(result[i]["difficulty"], true);
        errors.push(result[i]["title"] + suffix + " - " + calcData.reason);
        ++errorOccured;
        continue;
      }
      const item = all[result[i]["title"] + result[i]["difficulty"]];
      if (
        item &&
        (item["exScore"] === 0 ||
          Number.isNaN(item["exScore"]) ||
          (item["exScore"] >= result[i]["exScore"] &&
            item["clearState"] === result[i]["clearState"]) ||
          timeCompare(result[i]["updatedAt"], item["updatedAt"]) <= 0)
      ) {
        //データ更新がない場合、スキップ
        ++skipped;
        continue;
      }
      //データ更新がある場合、更新キューに追加
      scores.push(
        Object.assign(result[i], {
          difficultyLevel: calcData.difficultyLevel,
          currentBPI: calcData.bpi,
          lastScore: item ? item["exScore"] : 0,
          willModified: item ? item["isSingle"] === isSingle : false,
        })
      );
      histories.push(
        Object.assign(
          resultHistory[i],
          { difficultyLevel: calcData.difficultyLevel },
          { currentBPI: calcData.bpi, exScore: resultHistory[i].exScore }
        )
      );
      ++updated;
    }
    await new importer().setHistory(histories).setScores(scores).exec();
    // if autosync is enabled && already logged in
    if (_autoSync() && uid !== "" && updated > 0 && !isOlderVersion()) {
      updateGlobal(uid);
    }
    errors.unshift(
      result.length +
        "件処理しました," +
        updated +
        "件更新しました," +
        skipped +
        "件スキップされました," +
        errorOccured +
        "件追加できませんでした"
    );

    const bpi = new bpiCalcuator();
    const statsAPI = await new statMain(12).load();
    const totalBPI = await bpi.setSongs(statsAPI.at());
    const lastDay = await statsAPI.eachDaySum(
      4,
      dayjs().subtract(1, "day").format()
    );
    const lastWeek = await statsAPI.eachDaySum(
      4,
      dayjs().subtract(1, "week").format()
    );
    const rank = bpi.rank(totalBPI, false);
    const rankPer =
      Math.round((rank / bpi.getTotalKaidens()) * 1000000) / 10000;
    const updatedText = `BPIManagerでスコアを${updated}件更新しました%0a総合BPI:${totalBPI}(前日比:${showBpiDist(
      totalBPI,
      lastDay
    )},前週比:${showBpiDist(
      totalBPI,
      lastWeek
    )})%0a推定順位:${rank}位,皆伝上位${rankPer}％`;

    return {
      stateText: "Data.Success",
      errors: errors,
      updated: updated,
      updatedText: updatedText,
    };
  } catch (e: any) {
    console.log(e);
    return {
      stateText: "Data.Failed",
      errors: [e.message],
      updated: 0,
      updatedText: "",
    };
  }
};

export default _;
