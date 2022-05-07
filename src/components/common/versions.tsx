import { _currentStore } from "../settings";

export const versionTitles: { num: string; title: string }[] = [
  { num: "26", title: "26 Rootage" },
  { num: "27", title: "27 HEROIC VERSE" },
  { num: "28", title: "28 BISTROVER" },
  { num: "29", title: "29 CastHour" },
];

export const versionConverter: { [key: string]: string } = {
  "26": "26 Rootage",
  "27": "27 HEROIC VERSE",
  "28": "28 BISTROVER",
  "29": "29 CastHour",
};

export const isOlderVersion = () =>
  ["26", "27", "28"].indexOf(_currentStore()) > -1;
