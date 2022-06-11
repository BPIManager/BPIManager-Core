import { songsDB, scoreHistoryDB, scoresDB } from "../indexedDB";
import { songData } from "@/types/data";
import { _currentDefinitionURL } from ".";
import { config } from "@/config";
import { _prefixFromNum } from "../songs/filter";

export const _pText = (ref: React.MutableRefObject<any> | null, newText: string) => {
  if (!ref) {
    const m = document.getElementById("_progressText");
    // deprecated
    if (m) {
      m.innerText = newText;
    }
    return;
  }
  if (ref.current) {
    ref.current.innerText = newText;
  }
};

export const updateDefFile = async (progressRef: React.MutableRefObject<any> | null, forceUpdate: boolean = false) => {
  let res = { version: "unknown", requireVersion: "unknown", body: [] };
  const response = (mes: string) => {
    return { message: mes, newVersion: res.version };
  };
  const url = _currentDefinitionURL();

  const sdb = new songsDB();
  const schDB = new scoreHistoryDB();
  const scDB = new scoresDB();

  const reducer = (t: songData[]) =>
    t.reduce((result: { [key: string]: songData }, current: songData) => {
      result[current.title + current.difficulty + (current["dpLevel"] === "0" ? "1" : "0")] = current;
      return result;
    }, {});

  const allSongs = await sdb.getAllWithAllPlayModes().then((t) => reducer(t));

  try {
    _pText(progressRef, "定義ファイルをダウンロード中");
    res = await fetch(url).then((t) => t.json());
  } catch (e: any) {
    return response("定義データの取得に失敗しました");
  }
  const updatedSongs: string[] = [];

  if (!res.body) {
    return response("定義データの形式が不正です");
  }

  if (Number(res.requireVersion) > Number(config.versionNumber)) {
    return response("最新の定義データを導入するために本体を更新する必要があります:要求バージョン>=" + res.requireVersion);
  }
  _pText(progressRef, "定義ファイルをチェック中");

  const promiseProducer = (body: any[]) => {
    return body.map((t: songData) => {
      return new Promise<void>(async (resolve) => {
        const pfx = t["title"] + t["difficulty"] + (t["dpLevel"] === "0" ? "1" : "0");
        _pText(progressRef, "チェック中 : " + t["title"] + _prefixFromNum(t["difficulty"]));
        if (allSongs[pfx] && allSongs[pfx]["dpLevel"] === t["dpLevel"]) {
          //既存曲

          if (t["removed"]) {
            //削除フラグが立っている場合削除する
            await sdb.removeItem(t["title"]);
            await scDB.removeSpecificItemAtAllStores(t["title"], t["difficulty"]);
            await schDB.removeSpecificItemAtAllStores(t["title"], t["difficulty"]);
            resolve();
          }

          //なんらかの要素が新しい場合、データベースを更新する
          if (
            allSongs[pfx]["wr"] !== Number(t["wr"]) ||
            allSongs[pfx]["avg"] !== Number(t["avg"]) ||
            (t["coef"] && allSongs[pfx]["coef"] && allSongs[pfx]["coef"] !== t["coef"]) ||
            allSongs[pfx]["bpm"] !== t["bpm"] ||
            allSongs[pfx]["notes"] !== Number(t["notes"]) ||
            allSongs[pfx]["textage"] !== t["textage"]
          ) {
            updatedSongs.push(pfx);
            await sdb.updateItem(t);
          }
          resolve();
        } else {
          //新曲
          await sdb.setItem(t);
          resolve();
        }
      });
    });
  };
  await Promise.all(promiseProducer(res.body));
  scDB.setNewSongsDBRawData(reducer(res.body));
  await scDB.recalculateBPI(updatedSongs, forceUpdate);
  await schDB.recalculateBPI(updatedSongs, forceUpdate);
  localStorage.setItem("lastDefFileVer", res.version);
  _pText(progressRef, "");
  return response("更新完了");
};
