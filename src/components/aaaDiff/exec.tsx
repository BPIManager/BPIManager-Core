import { songsDB } from "../indexedDB";
import { CLOrigInt, CLOrigin } from "./data";
import { songData } from "@/types/data";
import bpiCalcuator from "../bpi";
import { difficultyDiscriminator } from "../songs/filter";
import { _traditionalMode } from "../settings";

export default class aaaDiffCalc {
  private songsDB = new songsDB();
  private calc = new bpiCalcuator();

  async exec(diff: number, target: number = 0): Promise<CLOrigInt> {
    const songs: songData[] = (await this.songsDB.getAll()).filter((item: songData) => item.difficultyLevel === String(diff));
    let results: CLOrigInt = {
      "50": [],
      "40": [],
      "30": [],
      "20": [],
      "10": [],
      "0": [],
      "-10": [],
      "-20": []
    }
    const t = target === 0 ? 8 / 9 : 17 / 18;

    for (let i = 0; i < songs.length; ++i) {
      const s = songs[i];
      const coef = _traditionalMode() ? this.calc.defaultCoef() : s.coef;
      const res = this.calc.setManual(s.wr, s.avg, s.notes, Math.ceil((s.notes * 2) * t), coef);
      if (res === Infinity || s.wr === 0 || s.avg === 0) {
        continue;
      }

      const temp: CLOrigin = {
        "title": s.title,
        "difficulty": difficultyDiscriminator(s.difficulty),
        "bpi": res
      }
      if (res > 50) {
        results["50"].push(temp);
      } else {
        if (!Number.isNaN(res)) {
          results[Math.floor(res / 10) * 10].push(temp);
        } else {
          console.log(res, s);
        }
      }
    }
    return this.rangeSort(results);
  }

  rangeSort(results: CLOrigInt) {
    Object.keys(results).map((item) => {
      results[item] = results[item].sort((a: CLOrigin, b: CLOrigin) => b.bpi - a.bpi);
      return 0;
    });
    return results;
  }

}
