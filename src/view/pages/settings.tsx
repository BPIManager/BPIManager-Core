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
import { _currentVersion, _isSingle } from '../../components/settings';
import { songsDB, scoresDB } from '../../components/indexedDB';
import { songData } from '../../types/data';
import PromisePool from "es6-promise-pool";

interface S {
  isLoading:boolean,
  disableUpdateBtn:boolean,
  currentVersion:string,
  message:string,
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
    }
  }

  async componentDidMount(){
  }

  updateDef = async()=>{
    const end = ()=>{this.props.global.setMove(false);}
    try{
      this.props.global.setMove(true);
      this.setState({disableUpdateBtn:true,message:""});
      const sdb = new songsDB();
      const reducer = (t:songData[])=>t.reduce((result:{[key:string]:songData}, current:songData) => {result[current.title] = current;return result;}, {});
      const allSongs = await sdb.getAll(_isSingle()).then(t=>reducer(t));

      const res = await fetch("https://files.poyashi.me/json/songs.json").then(t=>t.json());
      if(res.version === this.state.currentVersion){
        end();
        return this.setState({disableUpdateBtn:false,message:"定義データはすでに最新です"});
      }
      const promiseProducer = ()=>{
        return res.body.map((t:songData) => {
          return new Promise(resolve=>{
            console.log(t["title"]);
            if(allSongs[t["title"]]){
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
      localStorage.setItem("lastDefFileVer",res.version);
      this.setState({currentVersion:res.version,disableUpdateBtn:false,message:"更新完了"});
    }catch(e){
      console.log(e);
    }
    end();
    return;
  }

  render(){
    const {isLoading,disableUpdateBtn,message} = this.state;
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>
      );
    }
    return (
      <Subscribe to={[GlobalContainer]}>
        {({state,setLang,setStore}:GlobalContainer)=> (
          <Container className="commonLayout" fixed>
            <Typography component="h4" variant="h4" color="textPrimary" gutterBottom>
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
            </Paper>
          </Container>
        )}
      </Subscribe>
    );
  }
}

export default injectIntl(Settings);
