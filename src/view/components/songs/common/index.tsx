import { lampCSVArray } from "@/components/songs/filter";
import { B, BPIR } from "./filter";
import { scoreData, songData } from "@/types/data";

export const diffColor = (
  i: number,
  clearState: number,
  alternative: number = 0
): string => {
  if (i !== alternative) {
    return "transparent";
  }
  switch (clearState) {
    case 0:
      return "#e0dede";
    case 1:
      return "#ea63ff";
    case 2:
      return "#acffab";
    case 3:
      return "#ff707a";
    case 4:
      return "#ff4545";
    case 5:
      return "#fff373";
    case 6:
      return "#ff793b";
    default:
      return "rgba(255,255,255,.55)";
  }
};

export const behindScore = (
  row: scoreData,
  songData: songData,
  mode: number
) => {
  try {
    const ghost = [1, 2 / 3, 7 / 9, 8 / 9, 17 / 18, 1];
    if (!songData) return 0;
    const max = songData["notes"] * 2;
    return Math.ceil(max * ghost[mode] - row.exScore);
  } catch (e: any) {
    return;
  }
};

export const verArr = (include: boolean = true): number[] => {
  let t = include ? [1.5] : [];
  for (let i = 3; i < verNameArr.length; ++i) {
    t.push(i);
  }
  return t;
};

export const clearArr = (): number[] => {
  return [...Array(lampCSVArray.length)].reduce((_, __, i) => {
    _.push(i);
    return _;
  }, []);
};

export const verNameArr = [
  "",
  "",
  "",
  "3rd style",
  "4th style",
  "5th style",
  "6th style",
  "7th style",
  "8th style",
  "9th style",
  "10th style",
  "11 RED",
  "12 HAPPY SKY",
  "13 DistorteD",
  "14 GOLD",
  "15 DJ TROOPERS",
  "16 EMPRESS",
  "17 SIRIUS",
  "18 Resort Anthem",
  "19 Lincle",
  "20 Tricoro",
  "21 SPADA",
  "22 PENDUAL",
  "23 copula",
  "24 SINOBUZ",
  "25 CANNON BALLERS",
  "26 Rootage",
  "27 HEROIC VERSE",
  "28 BISTROVER",
  "29 CastHour",
  "30 RESIDENT",
];

export const bp = (bp: number): string => {
  if (Number.isNaN(bp)) {
    return "-";
  }
  return String(bp);
};

export const bpmFilter = (songBPM: string, b: B): boolean => {
  if (/-/.test(songBPM)) {
    //ソフラン判定
    return b.soflan; //ソフラン曲表示->true 非表示->false
  }
  if (!b.noSoflan) {
    return false;
  }
  const num = Number(songBPM); //150
  if (b.min !== "" && b.max !== "") {
    //最小BPM判定&最大BPM判定
    return num >= b.min && num <= b.max;
  }
  return b.min !== "" ? num >= b.min : b.max !== "" ? num <= b.max : true;
};

export const bpiFilter = (songBPI: number, b: BPIR): boolean => {
  const num = Number(songBPI);
  if (b.min !== "" && b.max !== "") {
    //最小BPI判定&最大BPI判定
    return num >= b.min && num <= b.max;
  }
  if ((b.min !== "" || b.max !== "") && songBPI === Infinity) {
    return false;
  }
  return b.min !== "" ? num >= b.min : b.max !== "" ? num <= b.max : true;
};
