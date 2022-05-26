import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { injectIntl, FormattedMessage } from "react-intl";
import Paper from "@mui/material/Paper";
import FormControl from "@mui/material/FormControl";
import {
  _currentViewComponents,
  _setCurrentViewComponents,
  _setShowLatestSongs,
  _showLatestSongs,
  _currentQuickAccessComponents,
  _setQuickAccessComponents,
  _showRichView,
  _setShowRichView,
  _foregroundNotification,
  _setForegroundNotification,
  _setUseActionMenu,
  _useActionMenu,
} from "@/components/settings";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Checkbox from "@mui/material/Checkbox";
import FormLabel from "@mui/material/FormLabel";
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import Loader from "@/view/components/common/loader";
import { quickAccessTable } from "@/components/common/quickAccess";

interface S {
  isLoading: boolean;
  currentVersion: string[];
  quickAccess: string[];
  showLatestSongs: boolean;
  showRichView: boolean;
  foregroundNotification: boolean;
  useActionMenu: boolean;
}

interface P {
  intl: any;
  global: any;
}

class Settings extends React.Component<P, S> {
  constructor(props: P) {
    super(props);
    this.state = {
      isLoading: false,
      currentVersion: _currentViewComponents().split(","),
      quickAccess: _currentQuickAccessComponents().split(","),
      showLatestSongs: _showLatestSongs(),
      showRichView: _showRichView(),
      useActionMenu: _useActionMenu(),
      foregroundNotification: _foregroundNotification(),
    };
  }

  indexOf = (needle: string): boolean => {
    return this.state.currentVersion.indexOf(needle) > -1;
  };

  indexOfQA = (needle: string): boolean => {
    return this.state.quickAccess.indexOf(needle) > -1;
  };

  changeQA =
    (value: string) =>
    (_e: React.ChangeEvent<HTMLInputElement>): void => {
      let p = Array.from(this.state.quickAccess);
      if (this.indexOfQA(value)) {
        p = p.filter((v) => v !== value);
      } else {
        p.push(value);
      }
      return this.setState({ quickAccess: _setQuickAccessComponents(p) });
    };

  changeView =
    (value: string) =>
    (_e: React.ChangeEvent<HTMLInputElement>): void => {
      let p = Array.from(this.state.currentVersion);
      if (this.indexOf(value)) {
        p = p.filter((v) => v !== value);
      } else {
        p.push(value);
      }
      return this.setState({ currentVersion: _setCurrentViewComponents(p) });
    };

  render() {
    const { isLoading, showLatestSongs, showRichView, foregroundNotification, useActionMenu } = this.state;
    if (isLoading) {
      return <Loader />;
    }
    return (
      <Container fixed style={{ padding: 0 }}>
        <Paper style={{ padding: "15px" }}>
          <FormControl fullWidth>
            <FormLabel component="legend">
              <FormattedMessage id="Settings.View" />
            </FormLabel>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("last")} onChange={this.changeView("last")} value="last" />} label="前回スコアからの更新点数" />
            </FormGroup>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("djLevel")} onChange={this.changeView("djLevel")} value="djLevel" />} label="DJレベル参考表示" />
            </FormGroup>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("estRank")} onChange={this.changeView("estRank")} value="estRank" />} label="推定順位" />
            </FormGroup>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("lastVer")} onChange={this.changeView("lastVer")} value="lastVer" />} label="前作スコアからの更新点数" />
            </FormGroup>
            <FormGroup>
              <FormControlLabel control={<Checkbox checked={this.indexOf("percentage")} onChange={this.changeView("percentage")} value="percentage" />} label="単曲スコアレート" />
            </FormGroup>
          </FormControl>
          <Typography variant="caption" display="block">
            <FormattedMessage id="Settings.View1" />
            <br />
            <FormattedMessage id="Settings.View2" />
            <br />
            画面サイズ・補助表示の表示項目数・曲名の長さにより、項目の表示が重なることがあります。
          </Typography>
          <Divider style={{ margin: "10px 0" }} />
          <FormLabel component="legend">楽曲リスト/BPI非対応曲の表示</FormLabel>
          <Switch
            checked={showLatestSongs}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (typeof e.target.checked === "boolean") {
                _setShowLatestSongs(e.target.checked);
                return this.setState({ showLatestSongs: e.target.checked });
              }
            }}
          />
          <Typography variant="caption" display="block">
            リリースされたばかりの楽曲を楽曲リストに表示します。
            <br />
            これらの楽曲はBPIが算出されませんが、スコアログの記録には対応しています。
            <br />
            <br />
            (リストから非表示にしても、内部的にスコアは記録され続けます)
          </Typography>
          <Divider style={{ margin: "10px 0" }} />
          <FormControl fullWidth>
            <FormLabel component="legend">クイックアクセス</FormLabel>
            {quickAccessTable.map((item: any) => {
              return (
                <FormGroup key={item.name}>
                  <FormControlLabel control={<Checkbox checked={this.indexOfQA(item.com)} onChange={this.changeQA(item.com)} value={item.com} />} label={item.name} />
                </FormGroup>
              );
            })}
          </FormControl>
          <Typography variant="caption" display="block">
            トップページ「クイックアクセス」に表示する機能を編集します。
            <br />
            よく使う機能をお好みで選択してください。
          </Typography>
          <Divider style={{ margin: "10px 0" }} />
          <FormLabel component="legend">楽曲名長押しでアクションメニューを表示</FormLabel>
          <Switch
            checked={useActionMenu}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (typeof e.target.checked === "boolean") {
                _setUseActionMenu(e.target.checked);
                return this.setState({ useActionMenu: e.target.checked });
              }
            }}
          />
          <Typography variant="caption" display="block">
            楽曲一覧・未プレイ楽曲の両ページにてリスト内の楽曲名を長押しすることで外部サイト連携およびリストの編集操作が可能なメニューを表示します。
          </Typography>
          <Divider style={{ margin: "10px 0" }} />
          <FormLabel component="legend">詳細ビューを使用 (beta)</FormLabel>
          <Switch
            checked={showRichView}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (typeof e.target.checked === "boolean") {
                _setShowRichView(e.target.checked);
                return this.setState({ showRichView: e.target.checked });
              }
            }}
          />
          <Typography variant="caption" display="block">
            プレイ済み楽曲リストにおいて、グラフィカルな楽曲一覧表示を使用します。
            <br />
            (補助表示の設定項目は無視されます)
          </Typography>
          <Divider style={{ margin: "10px 0" }} />
          <FormLabel component="legend">フォアグラウンドで ArenaMatch の通知を表示</FormLabel>
          <Switch
            checked={foregroundNotification}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (typeof e.target.checked === "boolean") {
                _setForegroundNotification(e.target.checked);
                return this.setState({ foregroundNotification: e.target.checked });
              }
            }}
          />
          <Typography variant="caption" display="block">
            自分が作成した ArenaMatch のルームに他のプレイヤーがコメントした際、アプリ内にて通知を表示します。
          </Typography>
        </Paper>
      </Container>
    );
  }
}

export default injectIntl(Settings);
