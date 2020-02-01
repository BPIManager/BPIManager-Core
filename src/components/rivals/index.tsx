import fbActions from '../firebase/actions';
import { _isSingle, _currentStore } from '../settings';
import { rivalListsDB } from '../indexedDB';
import { DBRivalStoreData } from '../../types/data';

export const updateRivalScore = async (rivalMeta:DBRivalStoreData):Promise<string>=>{

  const fbA:fbActions = new fbActions();
  const fbStores:fbActions = new fbActions();
  const rdb = new rivalListsDB();

  try{
    const res = await fbA.searchRivalByUid(rivalMeta.uid);

    if(!res){
      throw new Error("対象ユーザーが見つかりませんでした");
    }
    if(res.displayName === ""){
      throw new Error("対象ユーザーはデータを非公開に設定しています");
    }
    if(res.timeStamp === rivalMeta.updatedAt){
      throw new Error("すでに最新です");
    }
    const data = await fbStores.setDocName(rivalMeta.uid).load();
    if(!data){
      throw new Error("該当ユーザーは当該バージョン/モードにおけるスコアを登録していません。");
    }
    const putResult = await rdb.addUser({
      rivalName:res.displayName,
      uid:res.uid,
      photoURL:res.photoURL,
      profile:res.profile,
      updatedAt:res.timeStamp,
      lastUpdatedAt:rivalMeta.updatedAt,
      isSingle:_isSingle(),
      storedAt:_currentStore(),
    },data.scores);
    if(!putResult){
      throw new Error("追加に失敗しました");
    }
    return "";
  }catch(e){
    return e.message;
  }
}
