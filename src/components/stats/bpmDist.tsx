import { scoreData } from "../../types/data";

export type BPMDIST = "SOF" | "~139" | "~159" | "~179" | "~199" | "200~"

export interface distSongs { [key: string]: BPMDIST };
export interface distScores { [key: string]: scoreData };
export type distBPMI = { "name": BPMDIST, "BPI": number }

export const bpmFilter = (bpm: string): BPMDIST => {
  if (bpm.indexOf("-") > -1) {
    return "SOF";
  }
  const bnum = Number(bpm);
  switch (true) {
    case bnum < 140:
      return "~139";
    case (bnum >= 140 && bnum < 160):
      return "~159";
    case (bnum >= 160 && bnum < 180):
      return "~179";
    case (bnum >= 180 && bnum < 200):
      return "~199";
    case (bnum >= 200):
    default:
      return "200~";
  }
}
