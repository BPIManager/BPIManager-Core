import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage, injectIntl } from 'react-intl';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import { Subscribe } from 'unstated';
import GlobalContainer from '@/components/context/global';
import Button from '@material-ui/core/Button';
import UpdateIcon from '@material-ui/icons/Update';
import { _currentVersion, _currentDefinitionURL, _setCurrentDefinitionURL, _setAutoSync, _autoSync } from '@/components/settings';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Switch from '@material-ui/core/Switch';
import { area } from '@/config';
import TextField from '@material-ui/core/TextField';
import {Link as RefLink} from '@material-ui/core/';
import Loader from '@/view/components/common/loader';
import { updateDefFile } from '@/components/settings/updateDef';

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
  autoSync:boolean,
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
      autoSync:_autoSync(),
    }
  }

  toggleURLDialog = ()=> this.setState({isURLDialogOpen:!this.state.isURLDialogOpen})

  changeDefinitionURL = (url:string):void=> {
    return _setCurrentDefinitionURL(url);
  }

  updateDef = async()=>{
    const end = ()=>{this.props.global.setMove(false);}
    try{
      this.props.global.setMove(true);
      this.setState({disableUpdateBtn:true,message:""});
      const updater = await updateDefFile();
      end();
      this.setState({currentVersion:updater.newVersion,disableUpdateBtn:false,message:updater.message});
    }catch(e){
      console.log(e);
      this.setState({disableUpdateBtn:false,message:"更新に失敗しました:" + e.message});
    }
    end();
    return;
  }

  render(){
    const {isLoading,isURLDialogOpen,disableUpdateBtn,message,autoSync} = this.state;
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <Subscribe to={[GlobalContainer]}>
        {({state,setLang,setStore,setTheme,setIsSingle,setGoalBPI,setGoalPercentage,setArea}:GlobalContainer)=> (
          <Container fixed  style={{padding:0}}>
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
                  <MenuItem value="deepsea">Deep Sea</MenuItem>
                </Select>
              </FormControl>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.Themes"/>
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
                  {/*<MenuItem value="28">28 BISTROVER</MenuItem>*/}
                  <MenuItem value="INF">INFINITAS</MenuItem>
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
                Auto-sync
              </Typography>
              <Switch
                checked={autoSync}
                onChange={(e:React.ChangeEvent<HTMLInputElement>,)=>{
                  if(typeof e.target.checked === "boolean"){
                    _setAutoSync(e.target.checked);
                    return this.setState({autoSync:e.target.checked})
                  }
                }}
              />
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.AutoSync1"/><br/>
                <FormattedMessage id="Settings.AutoSync2"/><br/>
                <FormattedMessage id="Settings.AutoSync3"/>
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
                  {disableUpdateBtn && <Loader isInner/>}
                </div>
              </FormControl>
              <Typography variant="caption" display="block">
                {message}
              </Typography>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.currentVersion"/>{this.state.currentVersion}
              </Typography>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.updateWarning"/><br/>
                <RefLink component="a" onClick={this.toggleURLDialog} color="secondary" ><FormattedMessage id="Settings.defFileURLButton"/></RefLink>
              </Typography>
              <Typography variant="caption" display="block">
                <RefLink color="secondary" href="https://github.com/potakusan/bpim-score-repo">定義ファイルに誤りなどを発見した場合、GitHubにてプルリクエストを送信することができます。</RefLink>
              </Typography>
              {isURLDialogOpen && <URLDialog isDialogOpen={isURLDialogOpen} exec={this.changeDefinitionURL} close={this.toggleURLDialog}/>}
              <Divider style={{margin:"10px 0"}}/>
              <FormControl>
                <InputLabel><FormattedMessage id="Settings.AreaTitle"/></InputLabel>
                <Select value={state.area} onChange={(e:React.ChangeEvent<{ value: unknown }>,)=>{
                  if(typeof e.target.value === "number"){
                    setArea(e.target.value)
                  }
                }}>
                {area.map((item,i)=><MenuItem key={item} value={i}>{item}</MenuItem>)}
                </Select>
              </FormControl>
              <Typography variant="caption" display="block">
                <FormattedMessage id="Settings.Area"/>
              </Typography>
            </Paper>
          </Container>
        )}
      </Subscribe>
    );
  }
}

export default injectIntl(Settings);

interface UP {isDialogOpen:boolean,exec:(url:string)=>void,close:()=>void};

class URLDialog extends React.Component<UP,{url:string}> {

  constructor(props:UP){
    super(props);
    this.state = {
      url:_currentDefinitionURL()
    }
  }

  handleOk = () => {
    this.props.exec(this.state.url);
    this.props.close();
  };

  handleClose = () => {
    this.props.close();
  };

  render(){
    const {isDialogOpen} = this.props;
    return (
      <div>
        <Dialog
          open={isDialogOpen}
          onClose={this.handleClose}>
          <DialogTitle>定義URLの変更</DialogTitle>
          <DialogContent>
            <DialogContentText>
              <FormattedMessage id="Settings.ChangeDefinitionURL"/>
              <RefLink color="secondary" href="https://gist.github.com/potakusan/365b8176ee6634e00fb93cdd8e6bf7a9" target="_blank" rel="noopener noreferrer">
                <FormattedMessage id="Settings.ChangeDefinitionURL2"/>
              </RefLink>
              <FormattedMessage id="Settings.ChangeDefinitionURL3"/><br/>
              <FormattedMessage id="Settings.ChangeDefinitionURL4"/>
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="定義データURL"
              type="text"
              value={this.state.url}
              onChange={(e:React.ChangeEvent<HTMLInputElement>)=>this.setState({url:e.target.value})}
              fullWidth
            />
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
