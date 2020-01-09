import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import { FormattedMessage } from "react-intl";
import {scoresDB,scoreHistoryDB,importer} from "../../components/indexedDB";
import TextField from '@material-ui/core/TextField';
import Divider from '@material-ui/core/Divider';
import Snackbar from '@material-ui/core/Snackbar';
import importCSV from "../../components/csv/import";
import bpiCalculator from "../../components/bpi";
import { _currentStore, _isSingle, _currentStoreWithFullName } from '../../components/settings';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import {Link as RLink} from "react-router-dom";
import moment from "moment";

export default class Index extends React.Component<{global:any},{raw:string,isSnackbarOpen:boolean,stateText:string,errors:string[],isSaving:boolean,currentState:string,progress:number}> {

  constructor(props:{global:any}){
    super(props);
    this.state = {
      raw: "",
      isSnackbarOpen:false,
      stateText:"Data.Success",
      errors:[],
      isSaving:false,
      currentState:"",
      progress:0,
    }
    this.execute = this.execute.bind(this);
  }

  async execute(){
    try{
      this.props.global.setMove(true);
      this.setState({isSaving:true});
      let updated = 0, skipped = 0, errorOccured = 0;
      let errors = [];
      const isSingle:number = _isSingle();
      const currentStore:string = _currentStore();
      const s = new scoresDB(isSingle,currentStore);
      const schDB = new scoreHistoryDB();
      const executor:importCSV = new importCSV(this.state.raw,isSingle,currentStore);
      const calc:bpiCalculator = new bpiCalculator();
      const exec:number = await executor.execute();
      const scores = [];
      const histories = [];
      const result = executor.getResult(),resultHistory = executor.getResultHistory();
      if(!exec){
        throw new Error("CSVデータの形式が正しくありません");
      }

      const all = await s.getAll().then(t=>t.reduce((result:any, current:any) => {
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
        if(item && ((item["exScore"] >= result[i]["exScore"] && item["clearState"] === result[i]["clearState"]) || moment(result[i]["updatedAt"]).diff(item["updatedAt"],"seconds") <= 0)){
          ++skipped;
          continue;
        }
        const body = Object.assign(
          result[i],
          {
            difficultyLevel:calcData.difficultyLevel,
            currentBPI : calcData.bpi,
            lastScore: item ? item["exScore"] : 0,
            willModified:item ? item["isSingle"] === isSingle : false
          }
        );
        //更新件数100件以上の場合はこの手法、更新が少ない場合はPromise,all
        body.willModified ? s.setItem(body) : s.putItem(body);
        schDB._add(Object.assign(resultHistory[i],{difficultyLevel:calcData.difficultyLevel},{currentBPI:calcData.bpi,exScore:resultHistory[i].exScore}),true);
        ++updated;
      }

      //await new importer().setHistory(histories).setScores(scores).exec();

      this.props.global.setMove(false);
      errors.unshift(result.length + "件処理しました," + updated + "件更新しました," + skipped + "件スキップされました,"+ errorOccured + "件追加できませんでした");
      return this.setState({isSaving:false,raw:"",isSnackbarOpen:true,stateText:"Data.Success",errors:errors});

    }catch(e){
      console.log(e);
      this.props.global.setMove(false);
      return this.setState({isSaving:false,isSnackbarOpen:true,stateText:"Data.Failed",errors:[e.message]});
    }
  }

  onChangeText = (e: React.ChangeEvent<HTMLInputElement>)=> this.setState({raw:e.target.value});
  handleClose = ()=> this.setState({isSnackbarOpen:false});

  render(){
    const spdp = _isSingle() ? "SP" : "DP";
    const {raw,isSnackbarOpen,stateText,errors,isSaving} = this.state;
    return (
      <Container className="commonLayout" fixed>
        <Snackbar
          open={isSnackbarOpen}
          onClose={this.handleClose}
          ContentProps={{
            'aria-describedby': 'message-id',
          }}
          message={<span id="message-id"><FormattedMessage id={stateText}/></span>}
        />
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <FormattedMessage id="Data.add"/>
        </Typography>
        <FormattedMessage id="Data.infoBulk"/><br/>
        <FormattedMessage id="Data.howToBulk1"/>
        <Link color="secondary" href={"https://p.eagate.573.jp/game/2dx/"+_currentStore()+"/djdata/score_download.html?style=" + spdp} target="_blank" rel="noopener noreferrer">
          <FormattedMessage id="Data.CSVURL"/>
        </Link>
        <FormattedMessage id="Data.howToBulk2"/>
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
            variant="contained"
            color="primary"
            onClick={this.execute}
            disabled={isSaving}
            style={{width:"100%",margin:"5px 0"}}>
            <FormattedMessage id="Data.Execute"/>
            (->{_currentStoreWithFullName() }&nbsp;/&nbsp;
            {_isSingle() === 1 ? "SP" : "DP"})
          </Button>
          {isSaving && <CircularProgress size={24} style={{color:"#777",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />}
        </div>
        {errors && errors.map(item=><span key={item}>{item}<br/></span>)}
        <Divider variant="middle" style={{margin:"10px 0"}}/>
        <FormattedMessage id="Data.notPremium1"/>
        <Divider variant="middle" style={{margin:"10px 0"}}/>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          <FormattedMessage id="Data.edit"/>
        </Typography>
        <FormattedMessage id="Data.howToEdit"/>
        <ol>
          {[1,2,3].map(item=>(
            <li key={item}><FormattedMessage id={`Data.howToEdit${item}`}/></li>
          ))}
        </ol>
        <Divider variant="middle" style={{margin:"10px 0"}}/>
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
          データを同期
        </Typography>
        <RLink to="/sync"><Link color="secondary" component="span">「Sync」</Link></RLink>から、端末に保管されているデータをクラウド上にアップロードすることができます。<br/>
        アップロードされたデータは他の端末と同期することが可能です。<br/>
        注意:端末内に保管されているデータは、ブラウザのキャッシュをクリアすると削除される場合があります(Google Chromeで「Cookieとサイトデータの削除」を実行した場合など)。<br/>
        定期的に本機能を用いてデータのバックアップを取ることをおすすめしています。
      </Container>
    );
  }
}
