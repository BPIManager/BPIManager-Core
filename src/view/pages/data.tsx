import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import {scoresDB, importer} from "../../components/indexedDB";
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import importCSV from "../../components/import/csv";
import bpiCalculator from "../../components/bpi";
import { _currentStore, _isSingle, _currentStoreWithFullName } from '../../components/settings';
import { _autoSync } from '../../components/settings';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import {Link as RLink, withRouter, RouteComponentProps} from "react-router-dom";
import moment from "moment";
import { scoreData } from '../../types/data';
import fbActions from '../../components/firebase/actions';
import importJSON from '../../components/import/json';
import FormControl from '@material-ui/core/FormControl';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Radio from '@material-ui/core/Radio';
import Paper from '@material-ui/core/Paper';
import Alert from '@material-ui/lab/Alert/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import { config } from '../../config';
import timeFormatter from '../../components/common/timeFormatter';
import {AdShort} from "../components/slot";

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
}> {

  constructor(props:P&RouteComponentProps){
    super(props);
    this.state = {
      raw: "",
      stateText:"Data.Success",
      errors:[],
      isSaving:false,
      currentState:"",
      progress:0,
      uid:"",
      displayName:""
    }
    this.execute = this.execute.bind(this);
  }

  componentDidMount(){
    new fbActions().auth().onAuthStateChanged(async (user: any)=> {
      if(user){
        const t = await new fbActions().setColName("users").setDocName(user.uid).load();
        this.setState({
          uid:user.uid,
          displayName: t ? t.displayName : ""
        });
      }
    });
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

  async execute(){
    try{
      const {uid} = this.state;
      this.props.global.setMove(true);
      this.setState({isSaving:true});
      let errors = [];
      const isSingle:number = _isSingle();
      const currentStore:string = _currentStore();
      const isJSON = this.isJSON(this.state.raw);
      const executor:importJSON|importCSV = isJSON ? new importJSON(this.state.raw,isSingle,currentStore) : new importCSV(this.state.raw,isSingle,currentStore);
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
        if(item && ((item["exScore"] === 0 || Number.isNaN(item["exScore"])) || (item["exScore"] >= result[i]["exScore"] && item["clearState"] === result[i]["clearState"]) || moment(result[i]["updatedAt"]).diff(item["updatedAt"],"seconds") <= 0)){
          ++skipped;
          continue;
        }
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
      if(_autoSync() && uid !== ""){
        this.props.updateGlobal(uid);
      }
      this.props.global.setMove(false);
      errors.unshift(result.length + "件処理しました," + updated + "件更新しました," + skipped + "件スキップされました,"+ errorOccured + "件追加できませんでした");
      return this.setState({isSaving:false,raw:"",stateText:"Data.Success",errors:errors});
    }catch(e){
      console.log(e);
      this.props.global.setMove(false);
      return this.setState({isSaving:false,stateText:"Data.Failed",errors:[e.message],raw:""});
    }
  }

  onChangeText = (e: React.ChangeEvent<HTMLInputElement>)=> this.setState({raw:e.target.value});

  render(){
    const spdp = _isSingle() ? "SP" : "DP";
    const {raw,stateText,errors,isSaving,displayName} = this.state;
    return (
      <Container className="commonLayout" fixed>
        <Paper style={{padding:"15px"}}>
          <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
            <FormattedMessage id="Data.add"/>
          </Typography>
          <Link color="secondary" href={"https://p.eagate.573.jp/game/2dx/"+_currentStore()+"/djdata/score_download.html?style=" + spdp} target="_blank" rel="noopener noreferrer">
            CSVダウンロードはこちら
          </Link>
          <TextField
            onChange={this.onChangeText}
            value={raw}
            style={{width:"100%"}}
            label="Paste here"
            margin="dense"
            variant="outlined"
            multiline
            rowsMax="4"/>
            <div style={{position:"relative"}}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={this.execute}
                disabled={isSaving}
                style={{width:"100%",margin:"5px 0"}}>
                  <FormattedMessage id="Data.Execute"/><br/>
                  (->{_currentStoreWithFullName() }&nbsp;/&nbsp;
                  {_isSingle() === 1 ? "SP" : "DP"})
              </Button>
              {isSaving && <CircularProgress size={24} style={{color:"#777",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />}
            </div>
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
                  { ( _autoSync() && displayName ) &&
                  <Button
                    fullWidth
                    variant="outlined"
                    color="secondary"
                    onClick={()=>window.open(`https://twitter.com/share?text=BPIManagerのスコアを更新しました&url=${config.baseUrl}/u/${displayName}%3Finit%3D${timeFormatter(1)}`)}
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
        </Paper>
        <AdShort/>
        <Paper style={{padding:"15px",margin:"10px 0 0 0"}}>
            <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
              取り込み方
            </Typography>
            <Navigation/>
        </Paper>
        <Paper style={{padding:"15px",margin:"10px 0 0 0"}}>
            <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
              データを同期
            </Typography>
            <RLink to="/sync" style={{textDecoration:"none"}}><Link color="secondary" component="span">「Sync」</Link></RLink>から、端末に保管されているデータをクラウド上にアップロードすることができます。<br/>
            アップロードされたデータは他の端末と同期することが可能です。<br/>
            注意:端末内に保管されているデータは、ブラウザのキャッシュをクリアすると削除される場合があります(Google Chromeで「Cookieとサイトデータの削除」を実行した場合など)。<br/>
            定期的に本機能を用いてデータのバックアップを取ることをおすすめしています。
            <Divider variant="middle" style={{margin:"10px 0"}}/>
            <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
              <FormattedMessage id="Data.edit"/>
            </Typography>
            <FormattedMessage id="Data.howToEdit"/>
            <ol>
              <li><FormattedMessage id="Data.howToEdit1"/></li>
              <li><FormattedMessage id="Data.howToEdit2"/></li>
              <li><FormattedMessage id="Data.howToEdit3"/></li>
            </ol>
        </Paper>
      </Container>
    );
  }
}


class Navigation extends React.Component<{},{currentTab:number}>{

  constructor(props:{}){
    super(props);
    this.state = {currentTab:0};
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({currentTab:Number(e.target.value)});
  };

  render(){
    const {currentTab} = this.state;
    return (
      <div>
        <FormControl component="fieldset">
          <RadioGroup aria-label="position" name="position" value={currentTab} onChange={this.handleChange} row>
            <FormControlLabel
              value={0}
              control={<Radio color="primary" />}
              label="CSV(プレミアム会員向け)"
              labelPlacement="end"
            />
            <FormControlLabel
              value={1}
              control={<Radio color="primary" />}
              label="ブックマークレット(非プレミアム会員向け)"
              labelPlacement="end"
            />
          </RadioGroup>
        </FormControl>
        {currentTab === 0 && (
          <div>
            <ol>
              <li>上記「CSVダウンロードページへ」へアクセスします。</li>
              <li>テキストボックスにCSVデータが表示されますので、それをコピーします。</li>
              <li>上記テキストボックスにコピーしたデータを貼り付けます。</li>
              <li>「取り込み実行」ボタンをクリックします。</li>
              <li>以上！</li>
            </ol>
          </div>
        )}
        {currentTab === 1 && (
          <div>
            <pre style={{background:"#eaeaea",color:"#000",padding:"15px",margin:"10px",wordBreak:"break-all",whiteSpace:"pre-line"}}>
              &#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#40;&#102;&#117;&#110;&#99;&#116;&#105;&#111;&#110;&#40;&#41;&#32;&#123;&#32;&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#32;&#40;&#102;&#117;&#110;&#99;&#116;&#105;&#111;&#110;&#40;&#100;&#44;&#32;&#115;&#41;&#32;&#123;&#32;&#115;&#32;&#61;&#32;&#100;&#46;&#99;&#114;&#101;&#97;&#116;&#101;&#69;&#108;&#101;&#109;&#101;&#110;&#116;&#40;&#39;&#115;&#99;&#114;&#105;&#112;&#116;&#39;&#41;&#59;&#32;&#115;&#46;&#115;&#114;&#99;&#32;&#61;&#32;&#39;&#104;&#116;&#116;&#112;&#115;&#58;&#47;&#47;&#102;&#105;&#108;&#101;&#115;&#46;&#112;&#111;&#121;&#97;&#115;&#104;&#105;&#46;&#109;&#101;&#47;&#98;&#112;&#105;&#109;&#47;&#105;&#110;&#100;&#101;&#120;&#46;&#106;&#115;&#63;&#118;&#61;&#39;&#32;&#43;&#32;&#78;&#117;&#109;&#98;&#101;&#114;&#40;&#77;&#97;&#116;&#104;&#46;&#102;&#108;&#111;&#111;&#114;&#40;&#77;&#97;&#116;&#104;&#46;&#114;&#97;&#110;&#100;&#111;&#109;&#40;&#41;&#32;&#42;&#32;&#49;&#48;&#48;&#48;&#48;&#48;&#48;&#48;&#41;&#41;&#59;&#32;&#100;&#46;&#98;&#111;&#100;&#121;&#46;&#97;&#112;&#112;&#101;&#110;&#100;&#67;&#104;&#105;&#108;&#100;&#40;&#115;&#41;&#59;&#32;&#125;&#41;&#40;&#100;&#111;&#99;&#117;&#109;&#101;&#110;&#116;&#41;&#32;&#125;&#41;&#40;&#41;&#59;
            </pre>
            <p>
              1.ブラウザに上記ブックマークレットを登録します。
              <Link color="secondary" href="http://yomahigoto.blogspot.com/2017/10/androidchrome.html" target="_blank" rel="noopener noreferrer">登録方法はこちらのサイトを参照してください。</Link>
            </p>
            <p>
              2.<Link color="secondary" href="https://p.eagate.573.jp/game/2dx/27/top/index.html" target="_blank" rel="noopener noreferrer">IIDX公式サイト</Link>
              を開きます。
            </p>
            <p>
              3.登録したブックマークレットを実行します。
            </p>
            <p>
              <img src="https://files.poyashi.me/bpim/sample_completed.jpg" alt="完了画面" style={{display:"block",margin:"10px auto",width:"350px",maxWidth:"100%",border:"1px solid #ccc"}}/>
              4.処理が完了したら、テキストボックスが画面に表示されます(上画像参照)ので、その中のテキストをコピーします。
            </p>
            <p>5.上記テキストボックスにコピーしたデータを貼り付けます。</p>
            <p>6.「取り込み実行」ボタンをクリックします。</p>
            <p>7.以上！</p>
            <p>注意事項<br/>
            IIDX公式サイトの仕様変更によりブックマークレットが機能しなくなるかもしれません。その場合はお問い合わせください。<br/>
            ブックマークレットにより更新できる情報はEXスコアとクリアランプのみです。ミスカウントなどは集計されません。<br/>
            更新日時は最終プレイ日時ではなく、取り込み日時となります。<br/>
            ブックマークレットは現段階ではSPのみ対応しています。
            </p>
          </div>
        )}
      </div>
    )
  }
}

export default withRouter(Index);
