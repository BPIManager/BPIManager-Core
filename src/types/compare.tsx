import { scoreData, songData } from "./data";

export interface compareData {
  [key: string]: any,
  title: string,
  songData: songData,
  scoreData: scoreData,
  difficulty: string,
  difficultyLevel: string,
  exScore: number,
  compareData: number,
  gap: number
}
