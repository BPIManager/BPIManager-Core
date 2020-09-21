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
        BPIManagerは、☆11および☆12のスコアを、BPI(を改変した定義式)という指標を用いながら管理することができるツールです。<br/>
        本ツールは、スマートフォンのホーム画面に追加して利用することが想定されていますが、PCなどあらゆる端末でご利用いただけます。
      </div>
    },{
      "title":"Help.AboutBPI",
      "body":
        <div>
          BPIとは、norimiso様が考案された、beatmaniaIIDXのスコア力を数値として表現する公式です。<br/>
          皆伝平均を0、全国歴代1位を100として、あなたの実力を示します。<br/>
          <RefLink color="secondary" href="http://norimiso.web.fc2.com/aboutBPI.html">BPIに関する詳細はこちらのウェブサイトをご確認ください。</RefLink>
          <Divider style={{margin:"5px 0"}}/>
          <Typography variant="h6">BPI計算式の改変について</Typography>
          BPIManagerでは、上記定義式を基準とした上で、一部を改変してIIDXの実力を推定しています。<br/>
          具体的には、次のような変更を施しています。
          <ul>
            <li>譜面ごとに、統計的に得られた譜面係数を設定し、当該値をBPI算出に使用</li>
            <li>一部楽曲については、上記譜面係数を補正</li>
          </ul>
          <RefLink color="secondary" href="https://gist.github.com/potakusan/30004f4c05e6887399e779afe0fac4e6">これらの値の算出については、こちらのページに詳細を記載しています</RefLink>。<br/>
          このようにBPIManagerが本来の定義から逸れた算出方法を用いている意図は、BPI考案時に比して全国トップのインフレが進行しスコアが過小評価される状況を改善するためです。<br/>
          設定画面に、本来の定義を用いてBPIを計算する「従来の計算方式を利用する」オプションを追加済みですので、お好みに合わせてお使いいただきますようお願いいたします。<br/>
          より良い評価方法に関するアイディアをお持ちの方は、ぜひともTwitter(@BPIManager)までお寄せください。
        </div>
    },{
      "title":"Help.Functions",
      "body":
        <div>
          本ツールでは「beatmaniaIIDXのスコア力向上」に必要な機能をBPIを軸として拡充しています。
          <ul>
            <li>☆11および☆12の楽曲のスコア管理（BPIによる実力推定や、統計機能による実力変遷の可視化）</li>
            <li>バージョンをまたいだ自己スコアの比較、全1や皆伝平均との比較</li>
            <li>レーダーを用いた得意な譜面傾向の分析など</li>
            <li>ライバルとのスコア勝敗比較や、総合BPIを用いた実力の近いライバルの発掘</li>
            <li>BPIに基づくAAA達成難易度表や、自由に楽曲を追加できるリスト機能によるKPI管理</li>
            <li>楽曲に関する攻略情報の共有(楽曲一覧より個別楽曲画面を開き、「攻略情報」タブより自由に書き込み可能)</li>
          </ul>
        </div>
    },{
      "title":"Help.HowToUse",
      "body":
        <div>
          eAMUSEMENTプレミアムコースに加入済みの場合は、「データ」より公式サイトからCSVをインポートしてください。<br/>
          eAMUSEMENTベーシックコースに加入済みの場合は、「データ取り込み」ページ記載のブックマークレットをご使用ください。<br/>
          有料サービスに加入していない場合は、「未プレイ楽曲」より各楽曲のスコアを個別に登録することができます。<br/><br/>
          CSVやブックマークレットを用いたデータの一括インポートについては、「データ取り込み」ページに詳細が記載されています。
        </div>
    },{
      "title":"Help.Sync",
      "body":
        <div>
          本機能を用いることで、スコアデータをクラウド上に保管し不慮の事故による消失を防いだり、「ライバル」機能を用いて他の人にスコアを公開することができます。<br/>
          TwitterまたはGoogleアカウントによるソーシャルログインに対応しています。
        </div>
    },{
      "title":"Help.Contact",
      "body":
        <div>
          <FormattedMessage id="Help.E.1"/><br/>
          なお、その際には設定画面「デバッグ情報」タブ記載の説明に従い、デバッグ情報を共有いただけますと早期の問題解決が可能です。
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
          material-ui : Copyright (c) 2014 Call-Em-All / <RefLink color="secondary" href="https://opensource.org/licenses/mit-license.php" target="_blank" rel="noreferrer noopener">The MIT License (MIT)</RefLink><br/>
          Dexie.js : Copyright (c) dfahlander / <RefLink color="secondary" href="http://www.apache.org/licenses/LICENSE-2.0" target="_blank" rel="noreferrer noopener">Apache License</RefLink><br/>
          fast-deep-equal : Copyright (c) epoberezkin / MIT<br/>
          firebase : Copyright (c) firebase / Apache License<br/>
          dayjs : Copyright (c) iamkun / MIT<br/>
          date-io Copyright (c) 2017 Dmitriy Kovalenko / MIT<br/>
          material-ui-pickers Copyright (c) 2017 Dmitriy Kovalenko / MIT<br/>
          react : Copyright (c) Facebook / MIT<br/>
          react-app-rewired : Copyright (c) 2016 Tim Arney / MIT<br/>
          react-dom : Copyright (c) 2017 Tylor Steinberger / MIT<br/>
          react-router : Copyright (c) React Training 2016-2018 / MIT<br/>
          react-share : Copyright (c) Klaus Nygard<br/>
          react-intl : Copyright (c) Yahoo! / BSD License<br/>
          recharts : Copyright (c) recharts / MIT<br/>
          typescript : Copyright (c) Microsoft / Apache License<br/>
          unstated : Copyright (c) 2018-present James Kyle / MIT<br/>
          react-google-recaptcha : Copyright (c) 2015 Hugo Dozois / MIT<br/>
          react-helmet : Copyright (c) 2015 NFL / MIT
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
          ・利用状況調査<br/>
        利用状況調査のため、本サービスではGoogle Analyticsを利用しています。Google AnalyticsはCookieを利用して利用情報を収集します。<br/>
        Google Analyticsの利用規約は、こちら（https://marketingplatform.google.com/about/analytics/terms/jp/）をご覧ください。<br/><br/>
        ・広告について<br/>
        本サービスはGoogle及びGoogleのパートナーが提供する広告を設置しています。この広告配信にはCookieが使用されており、過去のWeb閲覧履歴に基づいた広告が配信されています。<br/>
        これが不要である場合、Googleアカウントの広告設定ページ（https://adssettings.google.com/u/0/authenticated）からパーソナライズ広告を無効にできます。<br/>
        また、aboutads.infoにアクセスしてパーソナライズ広告掲載に使用される第三者配信事業者のCookieを無効にできます。<br/><br/>
        ・reCAPTCHAについて<br/>
        This site is protected by reCAPTCHA and the Google <RefLink color="secondary" href="https://policies.google.com/privacy">Privacy Policy</RefLink> and <RefLink color="secondary" href="https://policies.google.com/terms">Terms of Service</RefLink> apply.
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
