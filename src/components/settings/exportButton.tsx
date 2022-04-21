import React from "react";
import Button from "@mui/material/Button";
import { scoresDB, songsDB } from "../indexedDB";
import { _isSingle, _currentStore } from ".";
import { difficultyDiscriminator, lampArray } from "../songs/filter";
import { FormattedMessage } from "react-intl";

export default class ExportButton extends React.Component<{}, {}> {
  export = async () => {
    const scores = new scoresDB();
    const songs = new songsDB();
    const allScores = await scores.getAll();
    const allSongs = await songs.getAll(_isSingle());
    let songsArray = [
      "楽曲名,難易度,難易度(12段階),EXSCORE,BPI,ミスカウント,クリアランプ,最終更新日時,ノート数,皆伝平均,全国1位",
    ];
    for (let i = 0; i < allSongs.length; ++i) {
      const c = allSongs[i];
      const title = c["title"];
      const difficulty = difficultyDiscriminator(c["difficulty"]);
      const scores = allScores.find(
        (item) => item.title === title && item.difficulty === difficulty
      );
      songsArray.push(
        [
          title,
          difficulty.toUpperCase(),
          c.difficultyLevel,
          scores ? scores.exScore : 0,
          scores ? scores.currentBPI : -15,
          scores
            ? scores.missCount || scores.missCount === 0
              ? scores.missCount
              : "-"
            : "-",
          scores ? lampArray[scores.clearState] : "-",
          scores ? scores.updatedAt : "-",
          c.notes,
          c.avg,
          c.wr,
        ].join(",")
      );
    }
    const csvData = songsArray.join("\r\n");
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csvData], {
      type: "text/csv",
    });
    const anchor = document.createElement("a");
    anchor.href = (window.URL || window.webkitURL).createObjectURL(blob);
    anchor.download = `${_currentStore()}_${_isSingle()}_${new Date().getTime()}.csv`;
    anchor.click();
  };

  render() {
    return (
      <div>
        <Button
          onClick={this.export}
          style={{ margin: "5px 0" }}
          variant="outlined"
          color="secondary"
        >
          <FormattedMessage id="Settings.Export" />
        </Button>
      </div>
    );
  }
}
