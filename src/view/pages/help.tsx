import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import { FormattedMessage } from 'react-intl';
import Divider from '@material-ui/core/Divider';
import {Link as RefLink} from '@material-ui/core/';


  const helps = [
    {"title":"Help.AboutThisSite",
      "body":
      <div>
        <FormattedMessage id="Help.A.1"/><br/>
        <FormattedMessage id="Help.A.2"/><br/>
        <FormattedMessage id="Help.A.3"/>
      </div>
    },{
      "title":"Help.Functions",
      "body":
        <div>
          <FormattedMessage id="Help.B.1"/><br/>
          <FormattedMessage id="Help.B.2"/><br/>
          <FormattedMessage id="Help.B.3"/><br/>
          <FormattedMessage id="Help.B.4"/><br/>
          <FormattedMessage id="Help.B.4.1"/>
          <Divider style={{margin:"10px 0"}}/>
          <FormattedMessage id="Help.B.5"/>
        </div>
    },{
      "title":"Help.HowToUse",
      "body":
        <div>
          <FormattedMessage id="Help.C.1"/>
          <Divider style={{margin:"10px 0"}}/>
          <FormattedMessage id="Help.C.2"/><br/>
          <FormattedMessage id="Help.C.3"/><br/>
          <FormattedMessage id="Help.C.4"/><br/>
          <FormattedMessage id="Help.C.5"/><br/>
          <FormattedMessage id="Help.C.6"/>
          <Divider style={{margin:"10px 0"}}/>
          <FormattedMessage id="Help.C.7"/><br/>
          <FormattedMessage id="Help.C.8"/><br/>
          <FormattedMessage id="Help.C.9"/><br/>
          <FormattedMessage id="Help.C.10"/>
          <FormattedMessage id="Help.C.11"/>
        </div>
    },{
      "title":"Help.Settings",
      "body":
        <div>
          <FormattedMessage id="Help.D.1"/><br/>
          <FormattedMessage id="Help.D.1.1"/><br/>
          <FormattedMessage id="Help.D.2"/><br/>
          <FormattedMessage id="Help.D.2.1"/><br/>
          <FormattedMessage id="Help.D.3"/><br/>
          <FormattedMessage id="Help.D.3.1"/><br/>
          <FormattedMessage id="Help.D.3.2"/><br/>
          <FormattedMessage id="Help.D.4"/><br/>
          <FormattedMessage id="Help.D.5"/><br/>
          <FormattedMessage id="Help.D.6"/><br/>
          <FormattedMessage id="Help.D.7"/><br/>
          <FormattedMessage id="Help.D.8"/><br/>
          <FormattedMessage id="Help.D.9"/><br/>
          <FormattedMessage id="Help.D.10"/>
        </div>
    },{
      "title":"Help.Sync",
      "body":
        <div>
          <FormattedMessage id="Help.DD.1"/><br/>
          <FormattedMessage id="Help.DD.2"/><br/>
          <FormattedMessage id="Help.DD.3"/><br/>
          <FormattedMessage id="Help.DD.4"/><br/>
          <FormattedMessage id="Help.DD.5"/><br/>
          <FormattedMessage id="Help.DD.6"/><br/>
        </div>
    },{
      "title":"Help.AboutBPI",
      "body":
        <div>
          <Typography variant="h6">BPIとは？</Typography>
          BPIとは、<RefLink color="secondary" href="http://norimiso.web.fc2.com/aboutBPI.html">norimiso様が考案された</RefLink>、beatmaniaIIDXのスコア力を数値として表現する公式です。<br/>
          皆伝平均を0、全国歴代1位を100として、あなたの実力を示します。<br/>
          BPIに関する詳細は上記ウェブサイトをご確認ください。
          <Divider style={{margin:"5px 0"}}/>
          <Typography variant="h6">BPI計算式の改変について</Typography>
          BPIManagerでは、<RefLink color="secondary" href="http://norimiso.web.fc2.com/aboutBPI.html">こちらのページの記述</RefLink>を基準とした上で、定義を改変してIIDXの実力を推定しています。<br/>
          具体的には、次のような変更を施しています。
          <ul>
            <li>譜面ごとに、統計的に得られた譜面係数を設定し、当該値をBPI算出に使用</li>
            <li>一部楽曲については、上記譜面係数を補正</li>
          </ul>
          <RefLink color="secondary" href="https://gist.github.com/potakusan/30004f4c05e6887399e779afe0fac4e6">これらの値の算出については、こちらのページに詳細を記載しています</RefLink>。<br/><br/>
          このように、BPIManagerは本来の定義から逸れた算出方法を用いています。<br/>
          意図としては、BPI考案時に比して全国トップのインフレが進行し、スコアが過小評価される状況を改善するためです。<br/>
          そのため、客観的指標として実ランキングデータを用いた計算式の補正を行うことを決定いたしました。<br/><br/>
          なお、設定画面に「従来の計算方式を利用する」オプションを追加済みです。<br/>
          お好みに合わせてお使いいただきますよう、お願いいたします。<br/><br/>
          より良い評価方法に関するアイディアをお持ちの方は、ぜひともTwitter(@BPIManager)までお寄せいただければ幸甚です。
        </div>
    },{
      "title":"Help.Contact",
      "body":
        <div>
          <FormattedMessage id="Help.E.1"/>
        </div>
    },{
      "title":"Help.Requirements",
      "body":
        <div>
          <FormattedMessage id="Help.F.1"/>
          <Divider style={{margin:"10px 0"}}/>
          <FormattedMessage id="Help.F.2"/><br/>
          <FormattedMessage id="Help.F.3"/><br/>
          <FormattedMessage id="Help.F.4"/><br/>
          *iPhone 5,iPhone SEでは一部画面のレイアウトに崩れが生じる場合があります
        </div>
    },{
      "title":"Help.Licenses",
      "body":
        <div>
          material-ui : Copyright (c) 2014 Call-Em-All <RefLink color="secondary" href="https://opensource.org/licenses/mit-license.php" target="_blank" rel="noreferrer noopener">The MIT License (MIT)</RefLink><br/>
          Dexie.js : Copyright (c) dfahlander <RefLink color="secondary" href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer noopener">Apache License</RefLink><br/>
          fast-deep-equal : Copyright (c) epoberezkin MIT<br/>
          firebase : Copyright (c) firebase Apache License<br/>
          dayjs : Copyright (c) iamkun MIT<br/>
          date-io Copyright (c) 2017 Dmitriy Kovalenko MIT<br/>
          material-ui-pickers Copyright (c) 2017 Dmitriy Kovalenko MIT<br/>
          react : Copyright (c) Facebook MIT<br/>
          react-app-rewired : Copyright (c) 2016 Tim Arney MIT<br/>
          react-dom : Copyright (c) 2017 Tylor Steinberger MIT<br/>
          react-router : Copyright (c) React Training 2016-2018 MIT<br/>
          react-share : Copyright (c) Klaus Nygard<br/>
          react-intl : Copyright (c) Yahoo! BSD License<br/>
          recharts : Copyright (c) recharts MIT<br/>
          typescript : Copyright (c) Microsoft Apache License<br/>
          unstated : Copyright (c) 2018-present James Kyle MIT
          <Divider style={{margin:"10px 0"}}/>
          Services used in BPIManager:<br/>
          <RefLink color="secondary" href="https://www.tinygraphs.com/">TinyGraphs</RefLink>
        </div>
    },
    {
      "title":"Help.Updates",
      "body":
        <div>
          <RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager(Twitter)</RefLink>にて更新情報をツイートしています。
        </div>
    },{
      "title":"Help.Disclaimer",
      "body":
        <div>
          <FormattedMessage id="Help.G"/><br/>
          <FormattedMessage id="Help.G.2"/><br/>
          <FormattedMessage id="Help.G.3"/><br/>
          <FormattedMessage id="Help.G.4"/><br/>
          <FormattedMessage id="Help.G.5"/><br/>
          <FormattedMessage id="Help.G.6"/><br/>
          <FormattedMessage id="Help.G.7"/><br/>
          <FormattedMessage id="Help.G.8"/><br/>
          <FormattedMessage id="Help.G.9"/><br/>
          <FormattedMessage id="Help.G.10"/><br/>
          <FormattedMessage id="Help.G.11"/><br/>
          <FormattedMessage id="Help.G.12"/><br/>
          <FormattedMessage id="Help.G.13"/><br/>
          <FormattedMessage id="Help.G.14"/><br/>
        </div>
    },{
      "title":"Help.PrivacyPolicy",
      "body":
        <div style={{wordBreak:"break-all"}}>
        利用状況調査のため、本サービスではGoogle Analyticsを利用しています。Google AnalyticsはCookieを利用して利用情報を収集します。<br/>
        Google Analyticsの利用規約は、こちら（https://marketingplatform.google.com/about/analytics/terms/jp/）をご覧ください。<br/>
        </div>
    },{
      "title":"Help.Donations",
      "body":
        <div style={{wordBreak:"break-all"}}>
          <p>
            本サービスは非営利で運用されているファンメイドツールです。<br/>
            もし本サービスを気に入っていただけているのであれば、継続的なサービス運用のため、以下の方法でご支援いただけますと非常に助かります。
          </p>
          <ul>
            <li>ご友人にこのサービスをおすすめする</li>
            <li>バグや不具合の報告、新規機能の要望や既存機能の改善案を<RefLink color="secondary" href="https://twitter.com/BPIManager">@BPIManager</RefLink>宛や<RefLink color="secondary" href="https://forms.gle/yVCa8sP2ndEQNaxg8">アンケート</RefLink>で提出する</li>
            <li>金銭的なサポート(Amazon ギフト券などをmsqkn310@gmail.comに送付)</li>
          </ul>
          <p>よろしくお願いいたします。</p>
        </div>
    }
  ]

export default class Index extends React.Component<{},{}> {

  render(){
    return (
      <div>
        <Container fixed  className="commonLayout">
        {helps.map(item=>{
          const {title,body} = item;
          return (
            <ExpansionPanel key={title}>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>
                  <FormattedMessage id={title}/>
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
              {body}
              </ExpansionPanelDetails>
            </ExpansionPanel>
          );
        })}
        </Container>
      </div>
    );
  }
}
