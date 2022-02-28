import { songFuncCommon } from "./common";
import { songsList_stateInt } from "@/view/components/songs/played/songsList";
import { scoreData } from "@/types/data";
import { isSameDay, subtract, isSameWeek, _isBetween, isBefore } from "@/components/common/timeFormatter";

export class songFuncInList extends songFuncCommon {

  private state: songsList_stateInt;
  private data: scoreData | null;

  constructor(newState: songsList_stateInt) {
    super();
    this.state = newState;
    this.data = null;
  }

  setData(data: scoreData) {
    this.data = data;
  }

  evaluateRange = (): boolean => {
    const data = this.data;

    if (!data) return false;

    const r = this.state.range;
    const rb = this.state.dateRange;

    return r === 0 ? true :
      r === 1 ? isSameDay(data.updatedAt) :
        r === 2 ? isSameDay(data.updatedAt, subtract(1, 'day')) :
          r === 3 ? isSameWeek(data.updatedAt, new Date()) :
            r === 5 ? _isBetween(data.updatedAt, rb.from, rb.to) :
              isBefore(data.updatedAt);
  }

  evaluateMode = (max: number): boolean => {
    const data = this.data;

    if (!data) return false;

    const m = this.state.mode;

    return m === 0 ? true :
      m === 1 ? data.exScore / max < 2 / 3 :
        m === 2 ? data.exScore / max < 7 / 9 && 2 / 3 < data.exScore / max :
          m === 3 ? data.exScore / max < 8 / 9 && 7 / 9 < data.exScore / max :
            m === 4 ? data.exScore / max < 17 / 18 && 8 / 9 < data.exScore / max :
              m === 5 ? true :
                m === 6 ? data.clearState <= 3 :
                  m === 7 ? data.clearState <= 4 :
                    m === 8 ? data.clearState <= 5 : true
  }

  evaluateVersion = (song: string): boolean => {
    const v = this.state.versions;

    const songVer = song.split("/")[0];
    if (songVer === "s") {
      return v.indexOf(1.5) > -1;
    }
    return v.indexOf(Number(songVer)) > -1;
  }

  evaluateClearType = (clearType: number): boolean => {
    const c = this.state.clearType;
    return c.indexOf(clearType) > -1;
  }

  availableMemo = (memo?: string) => {
    const _memo = this.state.memo;
    if (!_memo) {
      return true;
    } else {
      return memo !== "" && memo !== undefined;
    }
  }


}
