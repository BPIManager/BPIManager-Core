import { _currentTheme } from "../settings";
import { untilDate, isBeforeSpecificDate } from "./timeFormatter";

export const commonFunc = class {

  private s: any;

  set = (s: any): this => {
    this.s = s;
    return this;
  }

  clone = () => JSON.parse(JSON.stringify(this.s));
}

export const borderColor = (): string => {
  if (themeColor === "light") {
    return "#ff2222";
  }
  if (themeColor === "dark") {
    return "rgb(255 104 46)";
  }
  return "#0095ff";
}

export const versionString = (input: string | number): string => {
  const i = String(input);
  if (i === "28") {
    return "28 BISTROVER"
  }
  if (i === "27") {
    return "27 HEROIC VERSE"
  }
  if (i === "26") {
    return "26 Rootage"
  }
  if (i === "INF") {
    return "INFINITAS"
  }
  return "UNKNOWN";
}

export const arenaRankColor = (rank: string) => {
  switch (rank) {
    case "A1":
      return "#DA4453";
    case "A2":
    case "A3":
      return "#E9573F"
    case "A4":
    case "A5":
      return "#D770AD"
    case "B1":
    case "B2":
      return "#8CC152"
    case "B3":
    case "B4":
      return "#4A89DB"
    case "B5":
      return "#3BAFDA"
  }
}

export const bgColorByBPI = (totalBPI: number) => {
  if (totalBPI < 0) return "#967ADC";
  if (totalBPI < 10) return "#3BAFDA";
  if (totalBPI < 20) return "#4A89DB";
  if (totalBPI < 30) return "#8CC152";
  if (totalBPI < 40) return "#D770AD";
  if (totalBPI < 50) return "#E9573F";
  if (totalBPI >= 50) return "#DA4453";
  return "green";
}

export const noimg = "https://files.poyashi.me/noimg.png"
export const alternativeImg = (input: string) => {
  const namebased = () => {
    if (!input) {
      return "frogideas";
    }
    switch (input[0].toLowerCase()) {
      case "a":
      case "k":
      case "u":
        return "frogideas";
      case "b":
      case "l":
        return "sugarsweets";
      case "c":
      case "m":
      case "v":
        return "berrypie";
      case "d":
      case "n":
      case "w":
        return "heatwave";
      case "e":
      case "o":
        return "daisygarden";
      case "f":
      case "p":
      case "x":
        return "seascape";
      case "g":
      case "q":
      case "y":
        return "summerwarmth";
      case "h":
      case "r":
        return "bythepool";
      case "i":
      case "s":
      case "z":
      default:
        return "duskfalling"
      case "j":
      case "t":
        return "base";
    }
  }
  return "https://www.tinygraphs.com/squares/" + input + "?theme=" + namebased() + "&numcolors=3&size=240&fmt=svg";
}

const themeColor = _currentTheme();
export const avatarBgColor = themeColor === "light" ? "#efefef" : "rgba(255, 255, 255, 0.05)";
export const avatarFontColor = themeColor === "light" ? "#222" : "#efefef";


export const timeDiff = (seconds: number) => {
  if (isBeforeSpecificDate(new Date(), seconds)) { // 今日の日付が終了日付より前か？
    return "残り" + untilDate(seconds) + "";
  }
  return "終了済み";
}

export const rivalBgColor = (d: number) => {
  //d = 0:rival , 2:you
  const theme = _currentTheme();
  if (theme === "light") {
    if (d === 0) return "rgb(255 18 18)";
    if (d === 1) return "rgb(253 202 202)";
    if (d === 2) return "rgb(255 145 145)";
    if (d === 3) return "rgb(136 0 0)";
  }
  if (theme === "dark") {
    if (d === 0) return "#c56c16";
    if (d === 1) return "rgb(82 66 50)";
    if (d === 2) return "#653200";
    if (d === 3) return "rgb(45 22 0)";
  }
  if (theme === "deepsea") {
    if (d === 0) return "#4057ff";
    if (d === 1) return "rgb(14 43 62)";
    if (d === 2) return "rgb(0 154 255)";
    if (d === 3) return "#75bcff";
  }
  return "#000";
}

export const getUA = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('iphone') !== -1) {
    return "ios";
  } else if (userAgent.indexOf('ipad') !== -1) {
    return "ios";
  } else if (userAgent.indexOf('android') !== -1) {
    return "chrome";
  }
  if (userAgent.indexOf('chrome') !== -1) {
    return "chrome";
  } else if (userAgent.indexOf('safari') !== -1) {
    return "ios";
  } else if (userAgent.indexOf('edg') !== -1) {
    return "chrome";
  }
  return "other";
}

export const blurredBackGround = () => (
  {
    backgroundColor: _currentTheme() === "light" ? "#ffffff00" : _currentTheme() === "dark" ? "#00000030" : "#001625ab",
    backdropFilter: "blur(4px)"
  }
);


export const historyBgColor = () => _currentTheme() === "light" ? "#e2e2e2" : _currentTheme() === "dark" ? "#2f2f2f" : "#003961";
