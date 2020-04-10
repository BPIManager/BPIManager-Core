import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Button from '@material-ui/core/Button';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import { _currentVersion, _setTraditionalMode, _traditionalMode, _currentStore, _isSingle } from '../../../components/settings';
import { scoresDB, scoreHistoryDB, songsDB, rivalListsDB } from '../../../components/indexedDB';
import Divider from '@material-ui/core/Divider';
import { Switch, Backdrop } from '@material-ui/core';
import CachedIcon from '@material-ui/icons/Cached';
import LinearProgress from '@material-ui/core/LinearProgress';
import Loader from '../common/loader';
import fbActions from '../../../components/firebase/actions';
import ExportButton from '../../../components/settings/exportButton';

interface S {
  isLoading:boolean,
  disableUpdateBtn:boolean,
  disableDeleteBtn:boolean,
  currentVersion:string,
  message:string,
  message2:string,
  currentResetStore:string,
  isDialogOpen:boolean,
  isURLDialogOpen:boolean,
  traditionalMode:number,
  initialT:number,
  recalculating:boolean,
  quota:number,
  usage:number,
}

interface P{
  intl:any,
  global:any
}

class Settings extends React.Component<P,S> {

  constructor(props:P){
    super(props);
    this.state ={
      isLoading:false,
      disableUpdateBtn:false,
      currentVersion:_currentVersion(),
      message:"",
      message2:"",
      currentResetStore:"27",
      disableDeleteBtn:false,
      isDialogOpen:false,
      isURLDialogOpen:false,
      traditionalMode:_traditionalMode(),
      initialT:_traditionalMode(),
      recalculating:false,
      quota:0,
      usage:0,
    }
  }

  componentDidMount(){
    const self = this;
    if(navigator.storage && navigator.storage.estimate){
      navigator.storage.estimate().then(function(estimate) {
        if(estimate.quota && estimate.usage){
          self.setState({
            quota:estimate.quota,
            usage:estimate.usage,
          })
        }
      });
    }
  }

  deleteDef = async()=>{
    try{
      this.props.global.setMove(true);
      this.setState({disableDeleteBtn:true,message2:""});
      const sdb = new scoresDB(), shdb = new scoreHistoryDB(),sodb = new songsDB(),ridb = new rivalListsDB();
      const target = this.state.currentResetStore;
      if(target === "Songs Database"){
        await sodb.deleteAll();
      }else if(target === "Rivals"){
        new fbActions().auth().onAuthStateChanged(async(user: any)=> {
          new fbActions().setDocName(user.uid).syncUploadRival([],false);
          await ridb.deleteAll();
        });
      }else{
        await sdb.resetItems(target);
        await shdb.reset(target);
      }
      this.setState({disableDeleteBtn:false,message2:"正常に削除しました"});
    }catch(e){
      console.log(e);
      this.setState({disableDeleteBtn:false,message2:"更新に失敗しました"});
    }
    this.props.global.setMove(false);
  }

  toggleDialog = ()=> this.setState({isDialogOpen:!this.state.isDialogOpen})

  recalc = async ()=>{
    try{
      const scDB = new scoresDB(), schDB = new scoreHistoryDB();
      _setTraditionalMode(this.state.traditionalMode);
      this.setState({recalculating:true});
      await scDB.recalculateBPI();
      await schDB.recalculateBPI();
      this.setState({recalculating:false,initialT:this.state.traditionalMode});
    }catch(e){
      console.log(e);
      this.setState({recalculating:false});
    }
  }

  persistency = ()=>{
    if(navigator.storage && navigator.storage.persist){
      navigator.storage.persisted().then(persistent=>{
        if(!persistent){
          navigator.storage.persist().then(granted=>{
            if(granted){
              alert("ストレージ永続化が許可されました");
            }else{
              alert("ストレージ永続化は許可されません。");
            }
          })
        }else{
          alert("すでに永続化が許可されています");
        }
      })
    }else{
      alert("お使いの端末では本機能をご利用いただけません。");
    }
  }

  render(){
    const {isLoading,isDialogOpen,message2,currentResetStore,disableDeleteBtn,traditionalMode,recalculating,initialT,usage,quota} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Container fixed style={{padding:0}}>
        <Paper style={{padding:"15px"}}>
          <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
            従来の計算方式を利用
          </Typography>
          <Switch
            checked={traditionalMode === 1 ? true : false}
            onChange={(e:React.ChangeEvent<HTMLInputElement>,)=>{
              if(typeof e.target.checked !== "boolean"){
                return;
              }
              this.setState({traditionalMode:e.target.checked === true ? 1 : 0});
            }}
          />
          <Typography variant="caption" display="block">
            計算式上における係数を1.5に固定してBPIを計算します。<br/>
            全数値を再計算するため、変更の適用には時間がかかります。
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={this.recalc}
            disabled={traditionalMode === initialT}
            startIcon={<CachedIcon />}>
            適用
          </Button>
          <Divider style={{margin:"10px 0"}}/>
          <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
            ストレージ占有率
          </Typography>
          {(usage === 0 && quota === 0) && <p>お使いの端末ではサポートされていない機能です。</p>}
          {(usage || quota) && <div>
            <LinearProgress
              variant="determinate"
              color="secondary"
              style={{margin:"15px 0"}}
              value={(usage / quota) * 100}
            />
            <p style={{textAlign:"center"}}>{usage} / {quota} ({((usage / quota) * 100).toFixed(5)}%)</p>
          </div>}
          <Typography variant="caption" display="block">
            ストレージ使用の永続化を許可しておらず、ストレージが上限まで使用された場合、古いデータから自動的にデータが削除されます。<br/>
            データの削除を防ぐために、ライバルスコアの削除などをお試しください。
          </Typography>
          <Button
            variant="outlined"
            color="secondary"
            onClick={this.persistency}>
            永続化リクエスト
          </Button>
          <Divider style={{margin:"10px 0"}}/>
          <FormControl>
            <InputLabel><FormattedMessage id="Settings.dataClear"/></InputLabel>
            <Select value={currentResetStore} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
              if(typeof e.target.value !== "string") return;
              this.setState({currentResetStore:e.target.value});
            }}>
              <MenuItem value="26">26 Rootage</MenuItem>
              <MenuItem value="27">27 HEROIC VERSE</MenuItem>
              <MenuItem value="Songs Database">Songs Database</MenuItem>
              <MenuItem value="Rivals">Rivals</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="caption" display="block">
            <FormattedMessage id="Settings.resetWarning"/>
          </Typography>
          <div style={{position:"relative"}}>
            <Button
              variant="contained"
              color="secondary"
              style={{background:"#dc004e"}}
              onClick={this.toggleDialog}
              disabled={disableDeleteBtn}
              startIcon={<DeleteForeverIcon />}>
              <FormattedMessage id="Settings.DeleteExec"/>
            </Button>
            <Typography variant="caption" display="block">
              {message2}
            </Typography>
            <Divider style={{margin:"10px 0"}}/>
            <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
              エクスポート
            </Typography>
            <ExportButton/>
            <Typography variant="caption" display="block">
              現在のバージョン({_currentStore()}/{_isSingle() ? "SP" : "DP"})に登録されたスコアデータおよびメタデータをCSVで書き出します。
            </Typography>
            <AlertDialog isDialogOpen={isDialogOpen} exec={this.deleteDef} close={this.toggleDialog} currentResetStore={currentResetStore}/>
            {disableDeleteBtn && <CircularProgress size={24} style={{color:"#777",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />}
          </div>
        </Paper>
        {recalculating &&
          <Backdrop open style={{flexDirection:"column"}}>
            <div>
              <CircularProgress color="secondary"/>
            </div>
            <div>
              <p style={{textAlign:"center"}}>再計算中です</p>
            </div>
          </Backdrop>
        }
      </Container>
    );
  }
}

export default injectIntl(Settings);

class AlertDialog extends React.Component<{isDialogOpen:boolean,exec:()=>void,close:()=>void,currentResetStore:string},{}> {

  handleOk = () => {
    this.props.exec();
    this.props.close();
  };

  handleClose = () => {
    this.props.close();
  };

  render(){
    const {isDialogOpen,currentResetStore} = this.props;
    return (
      <div>
        <Dialog
          open={isDialogOpen}
          onClose={this.handleClose}>
          <DialogTitle>Confirm</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <FormattedMessage id="Settings.DeleteDialogBody"/><br/>
              <FormattedMessage id="Settings.DeleteDialogBody2"/><br/>
              {currentResetStore === "26" ? "26 Rootage" : currentResetStore === "27" ? "27 HEROIC VERSE" :  currentResetStore === "Songs Database" ? "Songs Database" : "Rivals"}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={this.handleOk} color="secondary" autoFocus>
              Continue
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
