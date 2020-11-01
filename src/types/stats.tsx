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
  shiftedBPI:number,
  sum:number,
  avg:number,
  max:number,
  min:number,
  med:number
}

export interface S {
  isLoading:boolean,
  totalBPI:number,
  lastVerTotalBPI:number|null,
  totalRank:number,
  groupedByLevel:groupedByLevel[],
  groupedByDiff:groupedArray[],
  groupedByBPM:distBPMI[],
  groupedByDJRank:groupedArray[],
  groupedByClearState:groupedArray[],
  targetLevel:number,
  showDisplayDataConfig:boolean,
  displayData:number[],
  graphLastUpdated:number,
  lastWeek:any,
  lastMonth:any,
  compareWithLastVer:boolean,
}

export interface ShiftType {
  isLoading:boolean,
  perDate:perDate[],
  targetLevel:number,
  showDisplayDataConfig:boolean,
  displayData:number[],
  graphLastUpdated:number,
  currentPeriod:number,
}
