import { historyData } from "../data";

export interface historyDataWithLastScore extends historyData{
  lastScore:number,
  lastBPI:number,
}
