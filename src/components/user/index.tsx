import fbActions from "../firebase/actions";
import { _currentStore, _isSingle } from "../settings";

export default class getUserData {
  private fbStores: fbActions = new fbActions();

  constructor() {
    this.fbStores.setColName(`${_currentStore()}_${_isSingle()}`);
  }

  private all: any;

  async rivalScores(res: any) {
    try {
      const store = await this.fbStores.setDocName(res.uid).load();
      if (!store) {
        return [];
      }
      this.all = store;
      return this.all ? (this.all.scores || []) : [];
    } catch (e: any) {
      console.log(e);
      return [];
    }
  }

  getAll = () => this.all;

  scoreHistory = () => this.all ? (this.all.scoresHistory || []) : [];
  score = () => this.all ? (this.all.scores || []) : [];


}
