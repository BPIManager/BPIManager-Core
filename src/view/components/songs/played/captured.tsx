import * as React from 'react';
import html2canvas from "html2canvas";
import Backdrop from '@mui/material/Backdrop';
import Loader from '../../common/loader';
import { saveAsImage } from '@/components/common/saveImage';
import List from '@mui/material/List';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import TwitterIcon from '@mui/icons-material/Twitter';
import { DefListCard } from '@/view/pages/user';
import CancelIcon from '@mui/icons-material/Cancel';
import bpiCalcuator, { showBpiDist } from '@/components/bpi';
import statMain from '@/components/stats/main';
import dayjs from 'dayjs';
import { config } from '@/config';
import ListSubheader from '@mui/material/ListSubheader';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

interface P {
  close: () => void
}

interface S {
  capturing: boolean,
  completed: boolean,
  uploading: boolean,
  result: HTMLCanvasElement | null,
  token: string,
  userName: string,
}

class Captured extends React.Component<P, S> {

  private stat: statMain = new statMain(12);
  private bpi: bpiCalcuator = new bpiCalcuator();

  constructor(props: P) {
    super(props);
    this.state = {
      capturing: true,
      completed: false,
      uploading: false,
      result: null,
      token: "",
      userName: ""
    }
  }

  async componentDidMount() {
    await this.stat.load();
    this.captureUpdates();
  }

  captureUpdates = async () => {
    const target = document.getElementById("screenCaptureTarget");
    if (!target) {
      console.log("Capture target not found");
      return;
    }
    this.setState({ capturing: true });
    const s = await (await this.fetcher("token", "")).json();
    const token = s.token;
    const user = JSON.parse(localStorage.getItem("social") || "{}");

    document.documentElement.classList.add("hide-scrollbar");
    html2canvas(target, { scale: 2, width: target.clientWidth, height: target.clientHeight }).then(canvas => {
      const targetImgUri = canvas;
      document.documentElement.classList.remove("hide-scrollbar");

      if (this.isMobile()) {
        //Android or iPhone の場合はネイティブAPIを利用
        this.setState({ capturing: false });
        return this.shareWithNativeAPI(targetImgUri);
      }
      this.setState({ capturing: false, completed: true, result: targetImgUri, token: token, userName: (user && user.displayName) ? user.displayName : "" });
    });
  }

  save = () => {
    if (this.state.result) {
      saveAsImage(this.state.result.toDataURL("image/jpeg"));
      this.props.close();
    }
  }

  shareWithNativeAPI = (targetImgUri: HTMLCanvasElement | null) => {
    if (!targetImgUri) return alert("Error");
    targetImgUri.toBlob(async (blob) => {
      if (!blob) return alert("An error occured while converting image into blob!");

      const totalBPI = await this.bpi.setSongs(this.stat.at());
      const rank = this.bpi.rank(totalBPI, false);
      const lastDay = await this.getLastDay();
      const lastWeek = await this.getLastWeek();
      const updates = await this.getUpdatesToday();
      const rankPer = this.getRankPer(rank);
      const profileURL = this.state.userName ? config.baseUrl + "/r/u/" + this.state.userName : "";

      const image = new File([blob], 'tmp.png', { type: 'image/png' });
      navigator.share({
        text: `本日のスコア更新数：${updates.length || 0}件\n` +
          `総合BPI:${totalBPI}(前日比:${showBpiDist(totalBPI, lastDay)},前週比:${showBpiDist(totalBPI, lastWeek)})\n推定順位:${rank}位,皆伝上位${rankPer}％\n#BPIM`,
        url: profileURL,
        files: [image]
      }).catch((error) => {
        console.log(error)
      })
    })
    return;
  }

  fetcher = async (endpoint: string, data: string) => {
    const v = window.location.href.indexOf("localhost") > -1 ? "test" : "v2";
    return await fetch("https://proxy.poyashi.me/" + v + "/" + endpoint, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body: JSON.stringify({ data: data, token: this.state.token }),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
  }

  isMobile = () => navigator.userAgent.match(/iPhone|Android.+Mobile/)

  getUpdatesToday = () => new statMain(12).load().then(s => s.updatedAtToday());
  getLastDay = () => this.stat.eachDaySum(4, dayjs().subtract(1, 'day').format());
  getLastWeek = () => this.stat.eachDaySum(4, dayjs().subtract(1, 'week').format());
  getRankPer = (rank: number) => Math.round(rank / this.bpi.getTotalKaidens() * 1000000) / 10000;

  upload = async () => {
    if (!this.state.result) {
      return;
    }
    const totalBPI = await this.bpi.setSongs(this.stat.at());
    const rank = this.bpi.rank(totalBPI, false);
    const lastDay = await this.getLastDay();
    const lastWeek = await this.getLastWeek();
    const updates = await this.getUpdatesToday();
    const rankPer = this.getRankPer(rank);
    const profileURL = this.state.userName ? config.baseUrl + "/r/u/" + this.state.userName : "";

    this.setState({ uploading: true });
    const t = await this.fetcher("tweet/upload", this.state.result.toDataURL("image/jpeg").replace("data:image/jpeg;base64,", ""));

    const body = await t.json();
    if (!body || !body.extended_entities || !body.extended_entities.media[0] || !body.extended_entities.media[0].display_url) {
      alert("画像のアップロードに失敗しました。\n少し経ってからもう一度お試しください。\n(楽曲の表示件数により、画像サイズが大きすぎてアップロードできない場合があります)");

      this.setState({ uploading: false });
      return;
    }
    const url = body.extended_entities.media[0].display_url;
    window.open(`https://twitter.com/intent/tweet?text=${(
      `本日のスコア更新数：${updates.length || 0}件%0a` +
      `総合BPI:${totalBPI}(前日比:${showBpiDist(totalBPI, lastDay)},前週比:${showBpiDist(totalBPI, lastWeek)})%0a推定順位:${rank}位,皆伝上位${rankPer}％%0a`
    )}${encodeURIComponent(profileURL)}%0a${encodeURIComponent(url)}&related=BPIManager&hashtags=BPIM`);

    this.setState({ uploading: false });
    this.props.close();
  }

  modalClose = () => {
    //アニメーション表示のため
    if (this.state.uploading) return;
    this.setState({ completed: false });
    setTimeout(() => {
      this.props.close();
    }, 600)
  }

  render() {
    const { capturing, completed, uploading } = this.state;

    const buttons = [
      { icon: <SaveAltIcon />, primary: "カメラロールに保存", secondary: "画像を端末に保存します", onClick: () => this.save() },
      { icon: <TwitterIcon />, primary: this.isMobile() ? "ソーシャルメディアに共有" : "Twitter でシェア", secondary: "本日のスコア更新数などのデータとともに画像を共有します", onClick: () => this.upload() },
      { icon: <CancelIcon />, primary: "閉じる", secondary: "何もしないで終了します", onClick: () => this.modalClose() },
    ];

    return (
      <React.Fragment>
        <Backdrop open={capturing}>
          <Loader text="準備しています" />
        </Backdrop>
        <Backdrop open={uploading}>
          <Loader text="画像をアップロードしています" />
        </Backdrop>
        <SwipeableDrawer
          anchor="bottom"
          open={completed}
          onClose={() => this.modalClose()}
          onOpen={() => null}
        >
          <List
            subheader={
              <ListSubheader component="div">
                ライバル管理
                </ListSubheader>
            }>
            {buttons.map((item, i) => {
              return (
                <DefListCard key={i} onAction={item.onClick} disabled={false} icon={item.icon}
                  primaryText={item.primary} secondaryText={item.secondary} />
              )
            })
            }
          </List>
        </SwipeableDrawer>
      </React.Fragment>
    );
  }
}

export default Captured;
