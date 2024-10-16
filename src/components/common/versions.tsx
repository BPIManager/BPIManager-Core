import { _currentStore } from "../settings";

export const versionTitles: { num: string; title: string }[] = [
  { num: "26", title: "26 Rootage" },
  { num: "27", title: "27 HEROIC VERSE" },
  { num: "28", title: "28 BISTROVER" },
  { num: "29", title: "29 CastHour" },
  { num: "30", title: "30 RESIDENT" },
  { num: "31", title: "31 EPOLIS" },
  { num: "32", title: "32 Pinky Crush" },
  { num: "INF", title: "INFINITAS" },
];

export const versionConverter: { [key: string]: string } = {
  "26": "26 Rootage",
  "27": "27 HEROIC VERSE",
  "28": "28 BISTROVER",
  "29": "29 CastHour",
  "30": "30 RESIDENT",
  "31": "31 EPOLIS",
  "32": "32 Pinky Crush",
  INF: "INFINITAS",
};

export const isOlderVersion = () =>
  ["26", "27", "28", "29", "30", "31"].indexOf(_currentStore()) > -1;
