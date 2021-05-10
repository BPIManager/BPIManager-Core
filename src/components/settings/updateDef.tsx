import { songsDB, scoreHistoryDB, scoresDB } from "../indexedDB";
import { songData } from "@/types/data";
import { _currentDefinitionURL } from ".";
import { config } from "@/config";

export const updateDefFile = async()=>{
  let res = {version:"unknown",requireVersion:"unknown",body:[]};
  const response = (mes:string)=>{
    return {"message":mes,"newVersion":res.version};
  }
  const sdb = new songsDB();
  const schDB = new scoreHistoryDB();
  const scDB = new scoresDB();
  const reducer = (t:songData[])=>t.reduce((result:{[key:string]:songData}, current:songData) => {
    result[current.title + current.difficulty + (current["dpLevel"] === "0" ? "1" : "0")] = current;
    return result;
  }, {});
  const allSongs = await sdb.getAllWithAllPlayModes().then(t=>reducer(t));
  const url = _currentDefinitionURL();
  try{
    res = await fetch(url).then(t=>t.json());
  }catch(e){
    return response("定義データの取得に失敗しました");
  }
  const updatedSongs:string[] = [];
  if(Number(res.requireVersion) > Number(config.versionNumber) ){
    return response("最新の定義データを導入するために本体を更新する必要があります:要求バージョン>="+ res.requireVersion);
  }
  /*
  if(Number(res.version) === Number(currentVersion)){
    return response("定義データはすでに最新です");
  }
  */
  const promiseProducer = ()=>{
    return res.body.map((t:songData) => {
      return new Promise(async(resolve)=>{
        const pfx = t["title"] + t["difficulty"] + (t["dpLevel"] === "0" ? "1" : "0");
        if(allSongs[pfx] && allSongs[pfx]["dpLevel"] === t["dpLevel"]){
          //既存曲

          if(t["removed"]){ //削除フラグが立っている場合削除する
            console.log(t)
            await sdb.removeItem(t["title"]);
            await scDB.removeSpecificItemAtAllStores(t["title"]);
            await schDB.removeSpecificItemAtAllStores(t["title"]);
            resolve();
          }

          //なんらかの要素が新しい場合、データベースを更新する
          if(
            allSongs[pfx]["wr"] !== Number(t["wr"]) || allSongs[pfx]["avg"] !== Number(t["avg"]) ||
            (t["coef"] && allSongs[pfx]["coef"] && allSongs[pfx]["coef"] !== t["coef"]) ||
            allSongs[pfx]["bpm"] !== t["bpm"] || allSongs[pfx]["notes"] !== Number(t["notes"]) ||
            allSongs[pfx]["textage"] !== t["textage"]
          ){
            updatedSongs.push(pfx);
            await sdb.updateItem(t);
          }
          resolve();
        }else{
          //新曲
          await sdb.setItem(t);
          resolve();
        }
      });
    });
  }
  await Promise.all(promiseProducer());
  scDB.setNewSongsDBRawData(reducer(res.body));
  console.log("WillUpdated:",updatedSongs)
  await scDB.recalculateBPI(updatedSongs);
  await schDB.recalculateBPI(updatedSongs);
  localStorage.setItem("lastDefFileVer",res.version);
  return response("更新完了");
}
