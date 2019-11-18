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
import Divider from '@material-ui/core/Divider';
import { Subscribe } from 'unstated';
import GlobalContainer from '../../components/context/global';
import Button from '@material-ui/core/Button';
import UpdateIcon from '@material-ui/icons/Update';
import { _currentVersion } from '../../components/settings';
import { songsDB, scoresDB, scoreHistoryDB } from '../../components/indexedDB';
import { songData } from '../../types/data';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Switch from '@material-ui/core/Switch';
import { config } from '../../config';
import TextField from '@material-ui/core/TextField';
import LockOpenIcon from '@material-ui/icons/LockOpen';
import { Link } from 'react-router-dom';

interface S {
  isLoading:boolean,
  disableUpdateBtn:boolean,
  disableDeleteBtn:boolean,
  currentVersion:string,
  message:string,
  message2:string,
  currentResetStore:string,
  isDialogOpen:boolean,
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
    }
  }

  deleteDef = async()=>{
    try{
      this.props.global.setMove(true);
      this.setState({disableDeleteBtn:true,message2:""});
      const sdb = new scoresDB(), shdb = new scoreHistoryDB(),sodb = new songsDB();
      const target = this.state.currentResetStore;
      if(target === "Songs Database"){
        await sodb.deleteAll();
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

  updateDef = async()=>{
    const end = ()=>{this.props.global.setMove(false);}
    try{
      this.props.global.setMove(true);
      this.setState({disableUpdateBtn:true,message:""});
      const sdb = new songsDB();
      const schDB = new scoreHistoryDB();
      const reducer = (t:songData[])=>t.reduce((result:{[key:string]:songData}, current:songData) => {result[current.title + current.difficulty + current.dpLevel] = current;return result;}, {});
      const allSongs = await sdb.getAllWithAllPlayModes().then(t=>reducer(t));
      const res = await fetch("https://files.poyashi.me/json/songsWithDP.json").then(t=>t.json());
      if(Number(res.requireVersion) > Number(config.versionNumber) ){
        end();
        return this.setState({disableUpdateBtn:false,message:"最新の定義データを導入するために本体を更新する必要があります:要求バージョン>="+ res.requireVersion });
      }
      if(res.version === this.state.currentVersion){
        end();
        return this.setState({disableUpdateBtn:false,message:"定義データはすでに最新です"});
      }
      const promiseProducer = ()=>{
        return res.body.map((t:songData) => {
          return new Promise(resolve=>{
            const pfx = t["title"] + t["difficulty"] + t["dpLevel"];
            if(allSongs[pfx] && allSongs[pfx]["dpLevel"] === t["dpLevel"]){
              //既存曲
              sdb.updateItem(t).then(()=>resolve());
            }else{
              //新曲
              sdb.setItem(t).then(()=>resolve());
            }
          });
        });
      }
      await Promise.all(promiseProducer());
      const scDB = new scoresDB();
      scDB.setNewSongsDBRawData(reducer(res.body));
      await scDB.recalculateBPI();
      await schDB.recalculateBPI();
      localStorage.setItem("lastDefFileVer",res.version);
      this.setState({currentVersion:res.version,disableUpdateBtn:false,message:"更新完了"});
    }catch(e){
      console.log(e);
      this.setState({disableUpdateBtn:false,message:"更新に失敗しました"});
    }
    end();
    return;
  }

  render(){
    const {isLoading,isDialogOpen,disableUpdateBtn,message,message2,currentResetStore,disableDeleteBtn} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Subscribe to={[GlobalContainer]}>
        {({state,setLang,setStore,setTheme,setIsSingle,setGoalBPI,setGoalPercentage}:GlobalContainer)=> (
          <Container className="commonLayout" fixed>
            <Typography component="h5" variant="h5" color="textPrimary" gutterBottom>
              <FormattedMessage id="Settings.title"/>
            </Typography>
            <Paper style={{padding:"15px"}}>
              <FormControl>
                <InputLabel><FormattedMessage id="Settings.language"/></InputLabel>
                <Select value={state.lang} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                  if(typeof e.target.value === "string"){
                    setLang(e.target.value)
                  }
                }}>
                  <MenuItem value="ja">日本語</MenuItem>
                  <MenuItem value="en">English</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.noteLang"/>
              </Typography>
              <Divider style={{margin:"10px 0"}}/>
              <FormControl>
                <InputLabel><FormattedMessage id="Settings.theme"/></InputLabel>
                <Select value={state.theme} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                  if(typeof e.target.value === "string"){
                    setTheme(e.target.value)
                  }
                }}>
                  <MenuItem value="light">Light</MenuItem>
                  <MenuItem value="dark">Dark</MenuItem>
                </Select>
              </FormControl>
              <Divider style={{margin:"10px 0"}}/>
              <FormControl>
                <InputLabel><FormattedMessage id="Settings.dataStore"/></InputLabel>
                <Select value={state.store} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                  if(typeof e.target.value === "string"){
                    setStore(e.target.value)
                  }
                }}>
                  <MenuItem value="26">26 Rootage</MenuItem>
                  <MenuItem value="27">27 HEROIC VERSE</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.noteMes1"/>
              </Typography>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.inaccurateMes"/>
              </Typography>
              <Divider style={{margin:"10px 0"}}/>
              <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
                <FormattedMessage id="Settings.DPMode"/>(beta)
              </Typography>
              <Switch
                checked={state.isSingle === 0 ? true : false}
                onChange={(e:React.ChangeEvent<HTMLInputElement>,)=>{
                  if(typeof e.target.checked === "boolean"){
                    setIsSingle(e.target.checked === true ? 0 : 1);
                  }
                }}
              />
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.dpDescription"/>
              </Typography>
              <Divider style={{margin:"10px 0"}}/>
              <TextField
                value={state.goalBPI}
                label={<FormattedMessage id="Settings.MyGoalBPI"/>}
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e:React.ChangeEvent<HTMLInputElement>,)=>{
                  if(typeof e.target.value === "string"){
                    setGoalBPI(Number(e.target.value) > 100 ? 100 : Number(e.target.value));
                  }
                }}
                style={{margin:"0 0 5px 0",width:"100%"}}
              />
              <TextField
                value={state.goalPercentage}
                label={<FormattedMessage id="Settings.MyGoalPercentage"/>}
                type="number"
                InputLabelProps={{
                  shrink: true,
                }}
                onChange={(e:React.ChangeEvent<HTMLInputElement>,)=>{
                  if(typeof e.target.value === "string"){
                    setGoalPercentage(Number(e.target.value) > 100 ? 100 : Number(e.target.value));
                  }
                }}
                style={{margin:"0 0 5px 0",width:"100%"}}
              />
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.MyGoalDescription"/>
              </Typography>
              <Divider style={{margin:"10px 0"}}/>
              <FormControl>
                <Typography variant="caption" display="block" className="MuiFormLabel-root MuiInputLabel-animated MuiInputLabel-shrink">
                  <FormattedMessage id="Settings.Update"/>
                </Typography>
                <div style={{position:"relative"}}>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={this.updateDef}
                    disabled={disableUpdateBtn}
                    startIcon={<UpdateIcon />}>
                    <FormattedMessage id="Settings.UpdateResourcePacks"/>
                  </Button>
                  {disableUpdateBtn && <CircularProgress size={24} style={{color:"#777",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />}
                </div>
              </FormControl>
              <Typography variant="caption" display="block">
                {message}
              </Typography>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.currentVersion"/>{this.state.currentVersion}
              </Typography>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.updateWarning"/>
              </Typography>
              <Divider style={{margin:"10px 0"}}/>
              <FormControl>
                <InputLabel><FormattedMessage id="Settings.dataClear"/></InputLabel>
                <Select value={currentResetStore} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                  if(typeof e.target.value !== "string"){return;}
                  this.setState({currentResetStore:e.target.value});
                }}>
                  <MenuItem value="26">26 Rootage</MenuItem>
                  <MenuItem value="27">27 HEROIC VERSE</MenuItem>
                  <MenuItem value="Songs Database">Songs Database</MenuItem>
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
                <AlertDialog isDialogOpen={isDialogOpen} exec={this.deleteDef} close={this.toggleDialog} currentResetStore={currentResetStore}/>
                {disableDeleteBtn && <CircularProgress size={24} style={{color:"#777",position:"absolute",top:"50%",left:"50%",marginTop:-12,marginLeft:-12}} />}
              </div>
              <Divider style={{margin:"10px 0"}}/>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.syncTitle"/>
              </Typography>
              <Link to="/sync" style={{textDecoration:"none"}}>
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<LockOpenIcon />}>
                  <FormattedMessage id="Settings.syncButton"/>
                </Button>
              </Link>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.syncDescription"/>
              </Typography>
            </Paper>
          </Container>
        )}
      </Subscribe>
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
              {currentResetStore === "26" ? "26 Rootage" : currentResetStore === "27" ? "27 HEROIC VERSE" : "Songs Database"}
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
