import fbActions from "../firebase/actions";
import { _currentStore, _isSingle } from "../settings";

export default class getUserData{
  private fbStores:fbActions = new fbActions();

  constructor(){
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
  }

  async rivalScores(res:any){
    try{
      const store = await this.fbStores.setDocName(res.uid).load();
      if(!store){
        return [];
      }
      return store.scores || [];
    }catch(e){
      console.log(e);
      return [];
    }
  }


}
