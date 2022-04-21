//

import { songData } from "@/types/data";
import { _isSingle } from "../settings";
import { songsDB } from "../indexedDB";
import { genTitle, _prefixFromNum } from "./filter";

export default class songsAPI {
  private allSongs: Map<String, songData> = new Map();

  async load() {
    const songs = await new songsDB().getAll(_isSingle());
    for (let i = 0; i < songs.length; ++i) {
      const prefix: string = _prefixFromNum(songs[i]["difficulty"]);
      this.allSongs.set(songs[i]["title"] + prefix, songs[i]);
    }
    return this;
  }

  all = () => this.allSongs;
  get = (title: string) => this.allSongs.get(title);
  set = (title: string, value: songData) => this.allSongs.set(title, value);

  genTitle = (title: string, diff: string) => genTitle(title, diff);
}
