import { distBPMI } from "../components/stats/bpmDist";

export interface groupedArray {
  "name":string|number,
  "☆11":number,
  "☆12":number,
}

export interface groupedByLevel extends groupedArray {
  "name":number
}

export interface perDate {
  name:string,
  sum:number,
  avg:number
}

export interface S {
  isLoading:boolean,
  totalBPI:number,
  totalRank:number,
  perDate:perDate[],
  groupedByLevel:groupedByLevel[],
  groupedByDiff:groupedArray[],
  groupedByBPM:distBPMI[],
  groupedByDJRank:groupedArray[],
  groupedByClearState:groupedArray[],
  targetLevel:number,
}
