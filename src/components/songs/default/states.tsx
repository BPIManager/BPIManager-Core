import timeFormatter from "@/components/common/timeFormatter";
import { _showRichView } from "@/components/settings";
import { verArr, clearArr } from "@/view/components/songs/common";
import { songsList_stateInt } from "@/view/components/songs/played/songsList";

export const defaultState_songsList = (initialBPIRange: string = "", defToday: boolean = false): songsList_stateInt => {
  return {
    isLoading: true,
    filterByName: "",
    scoreData: [],
    allSongsData: new Map(),
    mode: 0,
    options: {
      level: ["11", "12"],
      difficulty: ["0", "1", "2"],
    },
    bpm: {
      noSoflan: true,
      min: "",
      max: "",
      soflan: true,
    },
    bpi: {
      min: initialBPIRange ? Number(initialBPIRange) : "",
      max: initialBPIRange && initialBPIRange !== "100" ? Number(initialBPIRange) + 10 : "",
    },
    dateRange: {
      from: timeFormatter(1, new Date()),
      to: timeFormatter(1, new Date()),
    },
    memo: false,
    showLatestOnly: false,
    range: defToday ? 1 : 0,
    page: 0,
    filterOpen: false,
    timeRangeOpen: false,
    orderTitle: 2,
    orderMode: 1,
    versions: verArr(),
    clearType: clearArr(),
    openCaptureScr: false,
    showRichView: _showRichView(),
  }
}
