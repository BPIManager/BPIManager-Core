import { scoreData, historyData } from "../../types/data";

export default class importCommon {

  result: scoreData[] = [];
  resultHistory: historyData[] = [];

  getResult(): scoreData[] {
    return this.result;
  }

  getResultHistory(): historyData[] {
    return this.resultHistory;
  }

  setResult(input: scoreData): void {
    this.result.push(input);
    return;
  }

  setResultHistory(input: historyData): void {
    this.resultHistory.push(input);
    return;
  }

  nameEscape(name: string, isBookmarklet: boolean = false): string {
    name = name.replace(/ +$/g, "");
    if (name === "炎影") name = "火影";
    if (name === "Rave*it!! Rave*it!!") name = "Rave*it!! Rave*it!! ";
    if (name === "Close the World feat. a☆ru") name = "Close the World feat.a☆ru";
    if (isBookmarklet) {
      if (name === "Blind Justice ～Torn souls, Hurt Faiths ～") name = "Blind Justice ～Torn souls， Hurt Faiths ～";
      if (name === "ROCK女 feat. 大山愛未, Ken") name = "ROCK女 feat. 大山愛未， Ken";
    }
    return name;
  }


}
