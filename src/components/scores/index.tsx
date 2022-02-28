import { scoresDB } from "../indexedDB";
import { scoreData } from "@/types/data";


export default class scoresAPI {

  private scores: Set<scoreData> = new Set();

  async load(includeLatestSongs: boolean = false) {
    const songs = await new scoresDB().getAll();
    this.scores = new Set([...songs]);
    if (!includeLatestSongs) {
      this.scores.forEach((item) => {
        if (item.wr === Infinity) {
          this.scores.delete(item);
        }
      })
    }
    return this;
  }

  all = () => this.scores;

}
