import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import {scoresDB, importer} from "@/components/indexedDB";
import TextField from '@material-ui/core/TextField';
import importCSV from "@/components/import/csv";
import bpiCalculator, { showBpiDist } from "@/components/bpi";
import { _currentStore, _isSingle, _currentStoreWithFullName } from '@/components/settings';
import { _autoSync } from '../../components/settings';
import Link from '@material-ui/core/Link';
import {Link as RLink, withRouter, RouteComponentProps} from "react-router-dom";
import { scoreData } from '@/types/data';
import importJSON from '@/components/import/json';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { config } from '@/config';
import { timeCompare } from '@/components/common/timeFormatter';
import Loader from "@/view/components/common/loader";
import Divider from '@material-ui/core/Divider';
import AdsCard from '@/components/ad';
import bpiCalcuator from '@/components/bpi';
import statMain from '@/components/stats/main';
import dayjs from 'dayjs';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import LinkIcon from '@material-ui/icons/Link';
import { getUA } from '@/components/common';

interface P{
  global:any,
  updateGlobal:(uid:string)=>void
}

class Index extends React.Component<P&RouteComponentProps,{
  raw:string,
  stateText:string,
  errors:string[],
  isSaving:boolean,
  currentState:string,
  progress:number,
  uid:string,
  displayName:string,
  isLoading:boolean,
  updated:number,
  totalBPIBefore:number,
  totalBPIAfter:number,
  noName:boolean,
  updatedText:string,
}> {

  constructor(props:P&RouteComponentProps){
    super(props);
    this.state = {
      isLoading:true,
      raw: "",
      stateText:"Data.Success",
      errors:[],
      isSaving:false,
      currentState:"",
      progress:0,
      uid:"",
      displayName:"",
      updated:0,
      totalBPIBefore:0,
      totalBPIAfter:0,
      noName:false,
      updatedText:"",
    }
    this.execute = this.execute.bind(this);
  }

  async componentDidMount(){
    const user = JSON.parse(localStorage.getItem("social") || "{}");
    if(user){
      const bpi = new bpiCalcuator();
      const exec = await new statMain(12).load();
      const totalBPI = bpi.setSongs(exec.at(),exec.at().length);
      this.setState({
        uid:user.uid || user.photoURL,
        noName:!user.uid,
        isLoading:false,
        displayName: user.displayName || "",
        totalBPIBefore:totalBPI,
        totalBPIAfter:0,
      });
    }else{
      this.setState({isLoading:false});
    }
  }

  isJSON = (arg:any)=>{
    arg = (typeof arg === "function") ? arg() : arg;
    if (typeof arg  !== "string") {
      return false;
    }
    try {
      arg = (!JSON) ? false : JSON.parse(arg);
      return true;
    } catch (e) {
        return false;
    }
  }

  getText = async ()=>{
    let text = this.state.raw;
    const ua = getUA();
    if(ua !== "chrome"){
      try{
        return await navigator.clipboard.readText();
      }catch(e){
        return text;
      }
    }

    const permission = await navigator.permissions.query({name: ("clipboard-read" as PermissionName)});

    if(permission.state === "granted" || permission.state === "prompt"){
      if (text === "") {
        try{
          text = await navigator.clipboard.readText();
        }catch(e){
          text = this.state.raw;
        }
      }
    }else{
      throw new Error("クリップボードの内容を読み取れません。フィールドにデータをコピーし、再度取り込み実行してください。");
    }

    return text;
  }

  async execute(){
    try{
      const {uid,noName} = this.state;
      this.props.global.setMove(true);
      this.setState({isSaving:true});
      let errors = [];
      const isSingle:number = _isSingle();
      const currentStore:string = _currentStore();
      let text = await this.getText();
      
      const isJSON = this.isJSON(text);
      const executor:importJSON|importCSV = isJSON ? new importJSON(text,isSingle,currentStore) : new importCSV(text,isSingle,currentStore);
      const calc:bpiCalculator = new bpiCalculator();
      const exec:number = await executor.execute();
      const scores = [];
      const histories = [];
      if(!exec){
        throw new Error("データの形式が正しくありません");
      }

      const result = executor.getResult(),resultHistory = executor.getResultHistory();
      const s = new scoresDB(isSingle,currentStore);
      let updated = 0, skipped = 0, errorOccured = 0;
      const all = await s.getAll().then(t=>t.reduce((result:{[key:string]:scoreData}, current:scoreData) => {
        result[current.title + current.difficulty] = current;
        return result;
      }, {}));
      for(let i = 0;i < result.length;++i){
        const calcData = await calc.calc(result[i]["title"],result[i]["difficulty"],result[i]["exScore"]);
        if(calcData.error && calcData.reason){
          const suffix = result[i]["difficulty"] === "hyper" ? "(H)" : result[i]["difficulty"] === "leggendaria" ? "(†)" : "(A)";
          errors.push(result[i]["title"] + suffix + " - " + calcData.reason);
          ++errorOccured;
          continue;
        }
        const item = all[result[i]["title"] + result[i]["difficulty"]];
        if(
          item && (
            (
              item["exScore"] === 0 ||
              Number.isNaN(item["exScore"])) ||
              (item["exScore"] >= result[i]["exScore"] && item["clearState"] === result[i]["clearState"]) ||
              timeCompare(result[i]["updatedAt"],item["updatedAt"]) <= 0
            )
          ){
            //データ更新がない場合、スキップ
            ++skipped;
            continue;
        }
        //データ更新がある場合、更新キューに追加
        scores.push(Object.assign(
          result[i],
          {
            difficultyLevel:calcData.difficultyLevel,
            currentBPI : calcData.bpi,
            lastScore: item ? item["exScore"] : 0,
            willModified:item ? item["isSingle"] === isSingle : false
          }
        ));
        histories.push(Object.assign(resultHistory[i],{difficultyLevel:calcData.difficultyLevel},{currentBPI:calcData.bpi,exScore:resultHistory[i].exScore}));
        ++updated;
      }
      await new importer().setHistory(histories).setScores(scores).exec();
      // if autosync is enabled && already logged in
      if(_autoSync() && uid !== "" && !noName){
        this.props.updateGlobal(uid);
      }
      this.props.global.setMove(false);
      errors.unshift(result.length + "件処理しました," + updated + "件更新しました," + skipped + "件スキップされました,"+ errorOccured + "件追加できませんでした");

      const bpi = new bpiCalcuator();
      const statsAPI = await new statMain(12).load();
      const totalBPI = bpi.setSongs(statsAPI.at(),statsAPI.at().length);
      const lastDay = await statsAPI.eachDaySum(4,dayjs().subtract(1, 'day').format());
      const lastWeek = await statsAPI.eachDaySum(4,dayjs().subtract(1, 'week').format());
      const rank = bpi.rank(totalBPI,false);
      const rankPer = Math.round(rank / bpi.getTotalKaidens() * 1000000) / 10000;
      const updatedText = `BPIManagerでスコアを${updated}件更新しました%0a総合BPI:${totalBPI}(前日比:${showBpiDist(totalBPI,lastDay)},前週比:${showBpiDist(totalBPI,lastWeek)})%0a推定順位:${rank}位,皆伝上位${rankPer}％`;
      return this.setState({isSaving:false,raw:"",stateText:"Data.Success",errors:errors,updated:updated,updatedText:updatedText});

    }catch(e){
      console.log(e);
      this.props.global.setMove(false);
      return this.setState({isSaving:false,stateText:"Data.Failed",errors:[e.message],raw:""});
    }
  }

  onChangeText = (e: React.ChangeEvent<HTMLInputElement>)=> this.setState({raw:e.target.value});

  render(){
    const spdp = _isSingle() ? "SP" : "DP";
    const {stateText,errors,isSaving,displayName,isLoading,updatedText} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Container fixed  className="commonLayout">
        {(_currentStore() !== config.latestStore && _currentStore() !== "INF") && (
          <Alert severity="error" style={{margin:"10px 0"}}>
            <AlertTitle>スコア保存先をご確認ください</AlertTitle>
            <p>
              スコアデータの保存先が最新のIIDXバージョンではありません。保存先が間違っていませんか？<br/>
              <RLink to="/settings" style={{textDecoration:"none"}}><Link color="secondary" component="span">設定画面からスコアの保存先を変更する</Link></RLink>。
            </p>
          </Alert>
        )}
        <Stepper orientation="vertical" className="vertStepper">
          <Step active>
            <StepLabel>公式サイトからCSVをコピー</StepLabel>
            <StepContent>
              <Typography variant="caption">
                <Link color="secondary" href={"https://p.eagate.573.jp/game/2dx/"+_currentStore()+"/djdata/score_download.html?style=" + spdp} target="_blank" rel="noopener noreferrer">
                  ここをクリック<LinkIcon style={{ fontSize: 15 }} />
                </Link>
                してCSVをテキストデータでクリップボードにコピーします。
              </Typography>
              <Navigation/>
            </StepContent>
          </Step>
            <Step active>
              <StepLabel>インポート</StepLabel>
              <StepContent>
                <Typography variant="caption">
                  下のボタンをタップし、BPIManagerにスコアをインポートします。
                </Typography>
                  <React.Fragment>

                    <Typography variant="caption" style={{margin:"8px 0 0 0",display:"block"}}>
                      ＊インポートがうまく行かない場合、下のテキストボックスにテキストをペーストして再度取り込み実行してください。
                    </Typography>
                    <TextField
                      onChange={this.onChangeText}
                      value={this.state.raw}
                      style={{width:"100%"}}
                      margin="dense"
                      variant="outlined"
                      multiline
                      rowsMax="4"/>
                  </React.Fragment>

                <div style={{position:"relative"}}>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={this.execute}
                    disabled={isSaving}
                    style={{margin:"5px 0"}}>
                      <FormattedMessage id="Data.Execute"/><br/>
                      (-{">"}{_currentStoreWithFullName() }&nbsp;/&nbsp;
                      {_isSingle() === 1 ? "SP" : "DP"})
                  </Button>
                  {isSaving && <Loader isInner/>}
                </div>
              </StepContent>
            </Step>
            <Step active={errors.length > 0}>
              <StepLabel>インポート結果</StepLabel>
              <StepContent>
                <Typography variant="caption">
                下記にインポート結果を表示しています。
                </Typography>
              </StepContent>
            </Step>
        </Stepper>
        {(errors.length > 0 && stateText !== "Data.Failed") &&
          <Alert severity="success" style={{margin:"10px 0"}}>
            <AlertTitle style={{marginTop:"0px",fontWeight:"bold"}}>処理が終了しました</AlertTitle>
            <div style={{width:"100%"}}>
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={()=>this.props.history.push("/songs")}
                style={{margin:"5px 0"}}>
                  楽曲一覧を表示
              </Button>
              { ( displayName ) &&
              <Button
                fullWidth
                variant="outlined"
                color="secondary"
                onClick={()=>window.open(`https://twitter.com/share?text=${updatedText}%0a&url=${config.baseUrl}/u/${displayName}`)}
                style={{margin:"5px 0"}}>
                  更新をツイート
              </Button>
              }
            </div>
          </Alert>
        }
        {errors.length > 0 &&
          <Alert severity="error" style={{margin:"8px 0"}}>
            {errors.map(item=><span key={item}>{item}<br/></span>)}
          </Alert>
        }
        <AdsCard/>
        <Divider style={{margin:"15px 0"}}/>
        {(this.state.uid === "") && (
          <Alert severity="error" style={{margin:"10px 0"}}>
            <AlertTitle>ログインしていません</AlertTitle>
            <p>Sync機能を用いることで、スコアデータをクラウドと同期することが可能です。<br/>
              不慮のデータ消失に備えるためにも、常にログイン状態を維持することをおすすめします。<RLink to="/sync" style={{textDecoration:"none"}}><Link color="secondary" component="span">こちらからログインしてください</Link></RLink>。
            </p>
          </Alert>
        )}
        {(!_autoSync() && this.state.uid !== "") && (
          <Alert severity="warning" style={{margin:"10px 0"}}>
            <AlertTitle>ご存知ですか？</AlertTitle>
            <p>設定画面より「Auto-sync」を有効にすることで、最新のスコアデータをクラウドと自動同期できます。<br/>
              不慮のデータ消失に備えられるほか、新たなライバルを探すためにも有用です。<RLink to="/settings" style={{textDecoration:"none"}}><Link color="secondary" component="span">こちらから有効化してください</Link></RLink>。
            </p>
          </Alert>
        )}
      </Container>
    );
  }
}


class Navigation extends React.Component<{},{open:boolean}>{

  constructor(props:{}){
    super(props);
    this.state = {open:false};
  }

  handleClose = ()=>{
    this.setState({open:!this.state.open});
  }

  render(){
    return (
      <React.Fragment>
        <Divider style={{margin:"15px"}}/>
        <Typography variant="caption" component="p" style={{margin:"8px 0"}}>
          <Link color="secondary" onClick={this.handleClose}>ブックマークレットでスコアを取り込む<br/>(eAMUベーシック会員向け)</Link>
        </Typography>
        {this.state.open && (
        <div>
          <pre style={{background:"#eaeaea",color:"#000",padding:"15px",margin:"10px",wordBreak:"break-all",whiteSpace:"pre-line"}}>
            &#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#40;&#102;&#117;&#110;&#99;&#116;&#105;&#111;&#110;&#40;&#41;&#32;&#123;&#32;&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#32;&#40;&#102;&#117;&#110;&#99;&#116;&#105;&#111;&#110;&#40;&#100;&#44;&#32;&#115;&#41;&#32;&#123;&#32;&#115;&#32;&#61;&#32;&#100;&#46;&#99;&#114;&#101;&#97;&#116;&#101;&#69;&#108;&#101;&#109;&#101;&#110;&#116;&#40;&#39;&#115;&#99;&#114;&#105;&#112;&#116;&#39;&#41;&#59;&#32;&#115;&#46;&#115;&#114;&#99;&#32;&#61;&#32;&#39;&#104;&#116;&#116;&#112;&#115;&#58;&#47;&#47;&#102;&#105;&#108;&#101;&#115;&#46;&#112;&#111;&#121;&#97;&#115;&#104;&#105;&#46;&#109;&#101;&#47;&#98;&#112;&#105;&#109;&#47;&#105;&#110;&#100;&#101;&#120;&#46;&#106;&#115;&#63;&#118;&#61;&#39;&#32;&#43;&#32;&#78;&#117;&#109;&#98;&#101;&#114;&#40;&#77;&#97;&#116;&#104;&#46;&#102;&#108;&#111;&#111;&#114;&#40;&#77;&#97;&#116;&#104;&#46;&#114;&#97;&#110;&#100;&#111;&#109;&#40;&#41;&#32;&#42;&#32;&#49;&#48;&#48;&#48;&#48;&#48;&#48;&#48;&#41;&#41;&#59;&#32;&#100;&#46;&#98;&#111;&#100;&#121;&#46;&#97;&#112;&#112;&#101;&#110;&#100;&#67;&#104;&#105;&#108;&#100;&#40;&#115;&#41;&#59;&#32;&#125;&#41;&#40;&#100;&#111;&#99;&#117;&#109;&#101;&#110;&#116;&#41;&#32;&#125;&#41;&#40;&#41;&#59;
          </pre>
          <Typography variant="caption" component="p">
            1.ブラウザに上記ブックマークレットを登録します。
            <Link color="secondary" href="http://yomahigoto.blogspot.com/2017/10/androidchrome.html" target="_blank" rel="noopener noreferrer">登録方法はこちらのサイトを参照してください。</Link>
          </Typography>
          <Typography variant="caption" component="p">
            2.<Link color="secondary" href="https://p.eagate.573.jp/game/2dx/27/top/index.html" target="_blank" rel="noopener noreferrer">IIDX公式サイト</Link>
            を開きます。
          </Typography>
          <Typography variant="caption" component="p">
            3.登録したブックマークレットを実行します。
          </Typography>
          <img src="https://files.poyashi.me/bpim/sample_completed.jpg" alt="完了画面" style={{display:"block",margin:"10px auto",width:"350px",maxWidth:"100%",border:"1px solid #ccc"}}/>
          <Typography variant="caption" component="p">
            4.処理が完了したら、テキストボックスが画面に表示されますので、その中のテキストをコピーします。
          </Typography>
          <Typography variant="caption" component="p">6.下の「取り込み実行」ボタンをクリックします。</Typography>
          <Alert severity="warning">
            <AlertTitle>
              注意事項
            </AlertTitle>
            <Typography variant="caption" component="p">
              IIDX公式サイトの仕様変更によりブックマークレットが機能しなくなるかもしれません。その場合はお問い合わせください。<br/>
              ブックマークレットにより更新できる情報はEXスコアとクリアランプのみです。ミスカウントなどは集計されません。<br/>
              更新日時は最終プレイ日時ではなく、取り込み日時となります。<br/>
              ブックマークレットは現段階ではSPのみ対応しています。
            </Typography>
          </Alert>
        </div>
      )}
      </React.Fragment>
    )
  }
}

export default withRouter(Index);
