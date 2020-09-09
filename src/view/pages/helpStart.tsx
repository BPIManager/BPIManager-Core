import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import {Link as RefLink, Paper, TableContainer, Table, TableHead, TableCell, TableRow, TableBody, Button} from '@material-ui/core/';
import { _currentTheme } from '@/components/settings';
import ContactSupportIcon from '@material-ui/icons/ContactSupport';
import FavoriteIcon from '@material-ui/icons/Favorite';
import { Link } from 'react-router-dom';
import ExtensionIcon from '@material-ui/icons/Extension';
import MenuBookIcon from '@material-ui/icons/MenuBook';

export default class HelpStart extends React.Component<{},{
  showRank:boolean
}> {

  constructor(props:{}){
    super(props);
    this.state = {
      showRank:false
    }
  }

  render(){
    const {showRank} = this.state;
    const themeColor = _currentTheme();
    return (
      <div>
          <div style={{background:`url("/images/background/${themeColor}.svg")`,backgroundSize:"cover"}}>
            <div style={{background:themeColor === "light" ? "rgba(255,255,255,.1)" : "rgba(0,0,0,.4)",display:"flex",padding:"7vh 0",alignItems:"center",justifyContent:"center",flexDirection:"column"}}>
              <Typography variant="h4">BPIManager</Typography>
            </div>
          </div>
          <Container fixed style={{marginTop:"15px"}}>
            <Typography variant="h4" style={{display: 'flex',alignItems: 'center'}}><ContactSupportIcon/>&nbsp;BPIManagerとは</Typography>
            <p>
              BPIManagerは、beatmania IIDXの楽曲スコアを数値で評価する指標(BPI)を用いて実力を推定したり、様々な機能を通して更に実力を高めるお手伝いをするためのツールです。
            </p>
            <Typography variant="h5" style={{display: 'flex',alignItems: 'center'}}><MenuBookIcon/>&nbsp;BPIとは?</Typography>
            <p>
              <RefLink color="secondary" href="http://norimiso.web.fc2.com/aboutBPI.html">norimiso様</RefLink>が考案された、各楽曲の皆伝平均を0、全国1位のスコアを100として、入力されたスコアの「上手さ」を相対的に評価する指標です。<br/>
              自分のベストスコアが世間一般の相場と比べてどれくらい上手だったのかを客観的に示すため、目標管理に非常に有用です。<br/>
              いわゆる「お上手ライン」は人によって異なりますが、BPIManagerにおけるBPI算出は、実順位を参考に概ね以下の順位を取るように改変されています(SPの場合)。
            </p>
            {!showRank && <Button fullWidth variant="outlined" onClick={()=>this.setState({showRank:true})}>BPI順位対応表を表示</Button>}
            {showRank && BPIRanks()}
            <Divider style={{margin:"10px 0"}}/>
            <Typography variant="h4" style={{display: 'flex',alignItems: 'center'}}><FavoriteIcon/>&nbsp;必要なもの</Typography>
            <p>BPIManagerをお使いいただくにあたって必要なものは、beatmania IIDXのプレイデータのみです。</p>
            <p>eAMUSEMENTプレミアムコースに加入しているとCSVによるスコアデータの取り込みが可能になり便利ですが、eAMUSEMENTベーシックコースへの加入のみ、または有料プランへ未加入の場合でもご利用いただくことが可能です。</p>
            <p>BPIManagerへのスコア登録方法は「CSV取り込み」「ブックマークレット取り込み」「手動登録」の3種類があり、eAMUSEMENT各コースにおいてご利用いただける機能対応表は以下のようになっています。</p>
            {eAmusementCompare()}
            <p>各取り込み方法の使い方については、「<Link to="/data"><RefLink component="span" color="secondary">データ取り込み</RefLink></Link>」ページを御覧ください。<br/>
            コナミアミューズメントが提供するeAMUSEMENT有料プランの詳細は、<RefLink href="https://p.eagate.573.jp/gate/pub/course/eapremium/index.html" color="secondary">こちらのページ(コナミアミューズメント公式サイト)</RefLink>をご確認ください。</p>
            {/*
            <Divider style={{margin:"10px 0"}}/>
            <Typography variant="h4" style={{display: 'flex',alignItems: 'center'}}><ExtensionIcon/>&nbsp;機能のご紹介</Typography>
            <p>
              BPIManagerは、beatmania IIDXのスコア詰めが一層楽しくなるようなサービスを目指して鋭意開発中です。<br/>
              本稿では、BPIManagerに搭載されている機能の一部をピックアップしてご紹介します。
            </p>
            */}
          </Container>
      </div>
    );
  }
}

function createDataCompare(name: string, premium: boolean, basic: boolean, free: boolean) {
  return { name, premium, basic, free };
}

function createDataRanks(bpi:number,rank:number) {
  return { bpi, rank };
}

const rows:any = [
  createDataCompare("CSV取り込み",true,false,false),
  createDataCompare("ブックマークレット取り込み",true,true,false),
  createDataCompare("手動登録",true,true,true),
];

const bpiRows:any = [
  createDataRanks(100,1),
  createDataRanks(90,2.2),
  createDataRanks(80,4.84),
  createDataRanks(70,10.64),
  createDataRanks(60,23.39),
  createDataRanks(50,51.43),
  createDataRanks(40,113.1),
  createDataRanks(30,248.72),
  createDataRanks(20,546.95),
  createDataRanks(10,1202.78),
  createDataRanks(0,2645),
]

function BPIRanks() {

  return (
    <TableContainer component={Paper}>
      <Table >
        <TableHead>
          <TableRow>
            <TableCell className="auto">BPI</TableCell>
            <TableCell >順位</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {bpiRows.map((row:any) => (
            <TableRow key={row.bpi}>
              <TableCell className="auto">{row.bpi}</TableCell>
              <TableCell align="center">{row.rank}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function eAmusementCompare() {

  return (
    <TableContainer component={Paper}>
      <Table >
        <TableHead>
          <TableRow>
            <TableCell className="auto">利用できる機能</TableCell>
            <TableCell align="right">プレミアム</TableCell>
            <TableCell align="right">ベーシック</TableCell>
            <TableCell align="right">無料</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row:any) => (
            <TableRow key={row.name}>
              <TableCell className="auto" component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="center">{row.premium ? "○" : "×"}</TableCell>
              <TableCell align="center">{row.basic ? "○" : "×"}</TableCell>
              <TableCell align="center">{row.free ? "○" : "×"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
