import * as React from 'react';
import html2canvas from "html2canvas";
import Backdrop from '@material-ui/core/Backdrop';
import Loader from '../../common/loader';
import { saveAsImage } from '@/components/common/saveImage';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import List from '@material-ui/core/List';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import TwitterIcon from '@material-ui/icons/Twitter';
import { DefListCard } from '@/view/pages/user';
import CancelIcon from '@material-ui/icons/Cancel';
import bpiCalcuator, { showBpiDist } from '@/components/bpi';
import statMain from '@/components/stats/main';
import dayjs from 'dayjs';
import { config } from '@/config';

interface P{
  close:()=>void
}

interface S {
  capturing:boolean,
  completed:boolean,
  uploading:boolean,
  result:string,
  token:string,
  userName:string,
}

class Captured extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state ={
      capturing:true,
      completed:false,
      uploading:false,
      result:"",
      token:"",
      userName:""
    }
  }

  async componentDidMount(){
    this.captureUpdates();
  }

  captureUpdates = async()=>{
    const target = document.getElementById("screenCaptureTarget");
    if(!target) return;
    this.setState({capturing:true});
    const s = await (await this.fetcher("token","")).json();
    const token = s.token;
    const user = JSON.parse(localStorage.getItem("social") || "{}");

    document.documentElement.classList.add("hide-scrollbar");
    html2canvas(target,{scale:2,width:target.clientWidth,height:target.clientHeight}).then(canvas => {
      const targetImgUri = canvas.toDataURL("image/jpeg");
      document.documentElement.classList.remove("hide-scrollbar");
      this.setState({capturing:false,completed:true,result:targetImgUri,token:token,userName:(user && user.displayName) ? user.displayName : ""});
    });
  }

  save = ()=>{
    saveAsImage(this.state.result);
    this.props.close();
  }

  fetcher = async(endpoint:string,data:string)=>{
    const v = window.location.href.indexOf("localhost") > -1  ? "test" : "v2";
    return await fetch("https://proxy.poyashi.me/" + v + "/" + endpoint, {
      method: 'POST',
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'same-origin',
      body:JSON.stringify({data:data,token:this.state.token}),
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      referrerPolicy: 'no-referrer',
    });
  }

  upload = async()=>{
    this.setState({uploading:true});
    const t = await this.fetcher("tweet/upload",this.state.result.replace("data:image/jpeg;base64,",""));

    const body = await t.json();
    if(!body || !body.extended_entities || !body.extended_entities.media[0] || !body.extended_entities.media[0].display_url){
      alert("画像のアップロードに失敗しました。\n少し経ってからもう一度お試しください。\n(楽曲の表示件数により、画像サイズが大きすぎてアップロードできない場合があります)");

      this.setState({uploading:false});
      return;
    }
    const bpi = new bpiCalcuator();
    const statsAPI = await new statMain(12).load();
    const totalBPI = bpi.setSongs(statsAPI.at(),statsAPI.at().length);
    const lastDay = await statsAPI.eachDaySum(4,dayjs().subtract(1, 'day').format());
    const lastWeek = await statsAPI.eachDaySum(4,dayjs().subtract(1, 'week').format());
    const rank = bpi.rank(totalBPI,false);
    const rankPer = Math.round(rank / bpi.getTotalKaidens() * 1000000) / 10000;
    const profileURL = this.state.userName ? config.baseUrl + "/r/u/" + this.state.userName : "";
    const url = body.extended_entities.media[0].display_url;
    const updates = await statsAPI.updatedAtToday();
    window.open(`https://twitter.com/intent/tweet?text=${(
      `本日のスコア更新数：${updates.length || 0}件%0a` +
      `総合BPI:${totalBPI}(前日比:${showBpiDist(totalBPI,lastDay)},前週比:${showBpiDist(totalBPI,lastWeek)})%0a推定順位:${rank}位,皆伝上位${rankPer}％%0a`
    )}${encodeURIComponent(profileURL)}%0a${encodeURIComponent(url)}&related=BPIManager&hashtags=BPIM`);

    this.setState({uploading:false});
    this.props.close();
  }

  render(){
    const {capturing,completed,uploading} = this.state;

    const buttons = [
      {icon:<SaveAltIcon/>,primary:"カメラロールに保存",secondary:"画像を端末に保存します",onClick:()=>this.save()},
      {icon:<TwitterIcon />,primary:"Twitterでシェア",secondary:"本日のスコア更新数などのデータとともに画像を共有します",onClick:()=>this.upload()},
      {icon:<CancelIcon />,primary:"閉じる",secondary:"何もしないで終了します",onClick:()=>this.props.close()},
    ];

    return (
      <React.Fragment>
        <Backdrop open={capturing}>
          <Loader text="準備しています"/>
        </Backdrop>
        <Backdrop open={uploading}>
          <Loader text="画像をアップロードしています"/>
        </Backdrop>
        {completed && (
          <Dialog open={true}>
            <DialogTitle>{"キャプチャを共有"}</DialogTitle>
            <DialogContent>
              <DialogContentText>
                現在表示中のスコア一覧を画像として保存するか、Twitterでシェアできます。
              </DialogContentText>
                <List>
                  {buttons.map((item,i)=>{
                    return (
                        <DefListCard key={i} onAction={item.onClick} disabled={false} icon={item.icon}
                          primaryText={item.primary} secondaryText={item.secondary}/>
                      )
                    })
                  }
                </List>
            </DialogContent>
          </Dialog>
        )}
      </React.Fragment>
    );
  }
}

export default Captured;
