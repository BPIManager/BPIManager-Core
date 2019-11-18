import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { FormattedMessage } from 'react-intl';
import Divider from '@material-ui/core/Divider';

export default class Index extends React.Component<{},{}> {

  render(){
    return (
      <div>
        <Container className="commonLayout" fixed>
          <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
            <FormattedMessage id="Help.title"/>
          </Typography>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.AboutThisSite"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography display="block">
                <FormattedMessage id="Help.A.1"/><br/>
                <FormattedMessage id="Help.A.2"/><br/>
                <FormattedMessage id="Help.A.3"/>
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Functions"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography display="block">
                <FormattedMessage id="Help.B.1"/><br/>
                <FormattedMessage id="Help.B.2"/><br/>
                <FormattedMessage id="Help.B.3"/><br/>
                <FormattedMessage id="Help.B.4"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.B.5"/>
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.HowToUse"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography display="block">
                <FormattedMessage id="Help.C.1"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.C.2"/><br/>
                <FormattedMessage id="Help.C.3"/><br/>
                <FormattedMessage id="Help.C.4"/><br/>
                <FormattedMessage id="Help.C.5"/><br/>
                <FormattedMessage id="Help.C.6"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.C.7"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.C.8"/>
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Settings"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography display="block">
                <FormattedMessage id="Help.D.1"/><br/>
                <FormattedMessage id="Help.D.2"/><br/>
                <FormattedMessage id="Help.D.3"/><br/>
                <FormattedMessage id="Help.D.4"/>
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Contact"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography display="block">
                <FormattedMessage id="Help.E.1"/>
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Requirements"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography display="block">
                <FormattedMessage id="Help.F.1"/>
                <Divider style={{margin:"10px 0"}}/>
                <FormattedMessage id="Help.F.2"/><br/>
                <FormattedMessage id="Help.F.3"/>
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                <FormattedMessage id="Help.Licenses"/>
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography display="block">

                <Divider style={{margin:"10px 0"}}/>
                material-ui : Copyright (c) 2014 Call-Em-All <a href="https://opensource.org/licenses/mit-license.php" target="_blank" rel="noreferrer noopener">The MIT License (MIT)</a><br/>
                Dexie.js : Copyright (c) dfahlander <a href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer noopener">Apache License</a><br/>
                fast-deep-equal : Copyright (c) epoberezkin MIT<br/>
                moment,moment-timezone : Copyright (c) JS Foundation and other contributors MIT<br/>
                react : Copyright (c) Facebook MIT<br/>
                react-dom : Copyright (c) 2017 Tylor Steinberger MIT<br/>
                react-router : Copyright (c) React Training 2016-2018 MIT<br/>
                react-intl : Copyright (c) Yahoo! BSD License<br/>
                recharts : Copyright (c) recharts MIT<br/>
                typescript : Copyright (c) Microsoft Apache License<br/>
                unstated : Copyright (c) 2018-present James Kyle MIT<br/>
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
          <ExpansionPanel>
            <ExpansionPanelSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography>
                Updates
              </Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
              <Typography display="block">
                <p>2019/11/19 : v0.0.0.8 CSVインポート時に取り込み失敗した楽曲について、難易度まで表記するようにした,データバックアップ機能実装(仮)</p>
                <p>2019/11/17 : v0.0.0.7 クリアタイプ,BPの手動入力をできるようにした(楽曲詳細画面→詳細タブ),Rootage CSV読み込み時に一部レジェンダリアを読み込まない問題を修正,その他バグ修正</p>
                <p>2019/11/17 : v0.0.0.6 バグ修正</p>
                <p>2019/11/15 : v0.0.0.5 同曲別難易度を読み込まない問題を修正,楽曲一覧にMAX-モードを追加,バグ修正,プログラム内の一部の記述を改善</p>
                <p>2019/11/09 : v0.0.0.4 目標BPI/パーセンテージ機能追加,DP対応(β版),未プレイ楽曲絞り込みに関するバグを修正,定義データ更新時に自動でBPIが再計算されない問題を修正</p>
                <p>2019/11/07 : v0.0.0.3 データリセット機能の追加,定義データ更新の処理を変更,絞り込み条件変更時にテーブルを1ページ目に戻すようにした,例外処理諸々,とか</p>
                <p>2019/11/06 : v0.0.0.2 ダークテーマの追加,シェアボタンの設置(シェアお願いします!)</p>
                <p>2019/11/06 : v0.0.0.1 公開した</p>
              </Typography>
            </ExpansionPanelDetails>
          </ExpansionPanel>
        </Container>
      </div>
    );
  }
}
