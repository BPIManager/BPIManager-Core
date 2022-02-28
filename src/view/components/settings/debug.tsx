import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Loader from '@/view/components/common/loader';
import Link from '@mui/material/Link';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import fbActions from '@/components/firebase/actions';
import { songsDB, scoresDB } from '@/components/indexedDB';
import { songData, scoreData } from '@/types/data';
import { config } from '@/config';
import Button from '@mui/material/Button';

interface P { }
interface S {
  isLoading: boolean,
  text: string
}

class DebugData extends React.Component<P, S> {

  constructor(props: P) {
    super(props);
    this.state = {
      isLoading: true,
      text: ""
    }
  }

  async componentDidMount() {
    const randomizer = (max: number, rnds: number = 5) => {
      let log = [];
      let res = [];
      for (let i = 0; i < max; i++) {
        log[i] = i + 1;
      }

      for (let j = 0, len = log.length; j < rnds; j++ , len--) {
        let rnd = Math.floor(Math.random() * len);
        res.push(log[rnd]);
        log[rnd] = log[len - 1];
      }
      return res;
    }
    const inspection = (title: string = "", arr: songData[] | scoreData[], mode: number = 0) => {
      const rnds = randomizer(arr.length, 6);
      return rnds.map((item: number, i: number) => {
        let rp = "";
        rp += `### ${mode === 0 ? "SongsDB" : "ScoresDB"}(${title}) Sampling inspection of song information #${i + 1}\n`;
        rp += JSON.stringify(arr[item]) + `\n`;
        return rp;
      });
    }
    new fbActions().auth().onAuthStateChanged(async (user: any) => {
      const _config = config;
      const songs = await new songsDB().getAll();
      const songsDP = await new songsDB().getAll(0);
      const scores = await new scoresDB().getAll();
      console.log(scores.filter((item) => item.difficultyLevel === "12" && item.isSingle === 1));
      const sp11 = songs.filter((item: songData) => item.dpLevel === "0" && item.difficultyLevel === "11");
      const sp12 = songs.filter((item: songData) => item.dpLevel === "0" && item.difficultyLevel === "12" && item.coef && item.coef !== -1);
      const dp11 = songsDP.filter((item: songData) => item.difficulty === "9" && item.difficultyLevel === "11");
      const dp12 = songsDP.filter((item: songData) => item.difficulty === "9" && item.difficultyLevel === "12");
      const n = window.navigator;
      let res = `debugger results generated at : ${new Date().toString()}\n\n### general configures\n`;
      res += JSON.stringify(_config) + "\n\n";
      res += `### user environment\n`;
      res += "userAgent:" + n.userAgent + "\n";
      res += "cookieEnabled:" + n.cookieEnabled + "\n";
      res += "onLine:" + n.onLine + "\n";
      res += "indexedDB availability:" + !!window.indexedDB + "\n";
      res += "localStorage availability:" + !!window.localStorage + "\n";
      res += `\n### localStorage\n`;
      // localStorage
      res += JSON.stringify(localStorage) + `\n\n`;
      // firebase
      res += `### firebase authentication data\n`;
      if (user) {
        let p = JSON.parse(JSON.stringify(user));
        p.phoneNumber = "*SECRET*";
        p.email = "*SECRET*";
        p.providerData[0].phoneNumber = "*SECRET*";
        p.providerData[0].email = "*SECRET*";
        p.stsTokenManager.apiKey = "*SECRET*";
        p.stsTokenManager.refreshToken = "*SECRET*";
        p.stsTokenManager.accessToken = "*SECRET*";
        p.apiKey = "*SECRET*";
        res += JSON.stringify(p) + `\n\n`;
      } else {
        res += "no authentication available.\n\n";
      }
      res += `********************************************\n`;
      res += inspection("Single Play Level 11", sp11);
      res += inspection("Single Play Level 12", sp12);
      res += inspection("Double Play Level 11", dp11);
      res += inspection("Double Play Level 12", dp12);
      res += `********************************************\n`;
      res += inspection("Single Play Level 12", scores.filter((item) => item.difficultyLevel === "12" && item.isSingle === 1), 1);
      res += `********************************************\n\n`;
      const db = await new songsDB().getDBInfo();
      res += `### indexedDB data\n`;
      res += "dbver:" + JSON.stringify(db.verno) + `\n`;
      return this.setState({
        isLoading: false,
        text: res
      })
    });
  }

  copy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(this.state.text);
      alert("出力内容をクリップボードにコピーしました");
    } else {
      alert("非対応ブラウザです");
    }
  }

  render() {
    const { isLoading, text } = this.state;
    if (isLoading) {
      return (<Loader />);
    }
    return (
      <Container fixed style={{ padding: 0 }}>
        <Paper style={{ padding: "15px" }}>
          <Typography variant="caption">以下の情報は、BPIManager上で発生した問題を解決する際に必要となるデバッグ情報です。<br />
            問題が発生した場合、お手数ですが以下のテキストを<Link href="https://twitter.com/BPIManager" color="secondary" target="_blank">@BPIManager</Link>までお寄せください(内容の書き換えはしないようお願いします)。<br />
            長大なテキストとなりますので、<Link href="https://pastebin.pl/" color="secondary" target="_blank">Pastebin</Link>のご利用を推奨します。<br />
            送信されたデータはソフトウェアの問題解決のためにのみ利用され、その他の利用目的に供されることはありません。</Typography>
          <Button color="secondary" fullWidth variant="outlined" onClick={this.copy} style={{ marginTop: "10px" }}>表示内容をコピー</Button>
          <Divider style={{ margin: "10px 0" }} />
          <TextField
            label="result"
            fullWidth
            multiline
            value={text}
            disabled
          />
        </Paper>
      </Container>
    );
  }
}

export default DebugData;
