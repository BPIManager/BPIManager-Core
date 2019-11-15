import React from "react";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";

import { scoreData, songData } from "../../../types/data";
import { _prefixFromNum, getSongSuffixForIIDXInfo } from "../../../components/songs/filter";
import Grid from "@material-ui/core/Grid";
import Divider from "@material-ui/core/Divider";
import TextField from "@material-ui/core/TextField";
import { FormattedMessage, injectIntl } from "react-intl";
import Paper from "@material-ui/core/Paper";
import bpiCalcuator, { B } from "../../../components/bpi";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import StarIcon from '@material-ui/icons/Star';
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import {songsDB,scoresDB,scoreHistoryDB} from "../../../components/indexedDB";
import ShowSnackBar from "../snackBar";
import {Tooltip as TooltipMUI, Button, CircularProgress, Tooltip} from '@material-ui/core';
import BPIChart from "./bpiChart";
import SongDetails from "./songDetails";
import SongDiffs from "./songDiffs";
import { withRouter,RouteComponentProps } from "react-router-dom";
import { UnregisterCallback } from "history";
import TabPanel from "./common/tabPanel";
import { _currentTheme } from "../../../components/settings";

interface P{
  isOpen:boolean,
  song:songData|null,
  score:scoreData|null,
  handleOpen:(flag:boolean,row?:any,willDeleteItems?:any)=>void,
  toggleEditScreen:()=>void,
}

interface S{
  isError:boolean,
  currentTab:number,
  errorSnack:boolean,
  errorSnackMessage:string,
  isSaving:boolean,
}

class EditScreen extends React.Component<P & {intl?:any} & RouteComponentProps,S> {

  private unlisten:UnregisterCallback|null = null;

  constructor(props:P & {intl?:any} & RouteComponentProps){
    super(props);
    this.state = {
      isError:false,
      currentTab:0,
      errorSnack:false,
      errorSnackMessage:"",
      isSaving:false,
    }
    this.unlisten = this.props.history.listen((_newLocation, action) => {
      if (action === "POP") {
        this.props.history.go(1);
        this.props.handleOpen(false);
      }
    });
  }

  componentWillUnmount(){
    if(this.unlisten){
      this.unlisten();
    }
  }

  toggleErrorSnack = ()=>this.setState({errorSnack:!this.state.errorSnack});
  handleTabChange = (_e:React.ChangeEvent<{}>, newValue:number)=> this.setState({currentTab:newValue});

  saveAndClose = async()=>{
    try{
      const {score,song} = this.props;
      if(!song || !score){return;}
      this.setState({isSaving:true});
      //const scores = new scoresDB(), scoreHist = new scoreHistoryDB();
      this.props.handleOpen(true,null,null);
    }catch(e){
      return this.setState({errorSnack:true,errorSnackMessage:e});
    }
  }

  render(){
    const {formatMessage} = this.props.intl;
    const {isOpen,handleOpen,song,score,toggleEditScreen} = this.props;
    const {isSaving,currentTab,errorSnack,errorSnackMessage} = this.state;
    if(!song || !score){
      return (null);
    }
    return (
      <Dialog id="detailedScreen" className={_currentTheme() === "dark" ? "darkDetailedScreen" : "lightDetailedScreen"} fullScreen open={isOpen}
        onClose={toggleEditScreen} style={{overflowX:"hidden",width:"100%"}}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" color="inherit" onClick={toggleEditScreen} aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h6" className="be-ellipsis" style={{flexGrow:1}}>
              <FormattedMessage id="EditScreen.Title"/>
              {song.title + _prefixFromNum(song.difficulty)}
            </Typography>
          </Toolbar>
        </AppBar>
        <Toolbar/>
        <Tabs
          value={currentTab}
          variant="fullWidth"
          indicatorColor="primary"
          textColor="primary"
          onChange={this.handleTabChange}>
          <Tab label={<FormattedMessage id="EditScreen.Details"/>} />
          <Tab label={<FormattedMessage id="EditScreen.Histories"/>} />
        </Tabs>
        <TabPanel value={currentTab} index={0}>
          a
        </TabPanel>
        <TabPanel value={currentTab} index={1}>
          b
        </TabPanel>
        <ShowSnackBar message={errorSnackMessage} variant="warning"
            handleClose={this.toggleErrorSnack} open={errorSnack} autoHideDuration={3000}/>
      </Dialog>
    );
  }
}

export default withRouter(injectIntl(EditScreen));
