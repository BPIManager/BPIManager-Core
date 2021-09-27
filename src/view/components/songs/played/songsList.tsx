import * as React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { FormattedMessage } from "react-intl";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { injectIntl } from "react-intl";
import Grid from '@mui/material/Grid';
import FormControl from '@mui/material/FormControl';
import BackspaceIcon from '@mui/icons-material/Backspace';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import FilterListIcon from '@mui/icons-material/FilterList';
import SongsTable from "./tablePlayed";
import Input from '@mui/material/Input';

import {scoreData, songData} from "@/types/data";
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import equal from 'fast-deep-equal'
import { _showLatestSongs } from '@/components/settings';
import Button from '@mui/material/Button';
import { bpmFilter,bpiFilter } from '../common';
import SongsFilter, { B, BPIR } from '../common/filter';
import OrderControl from "../common/orders";
import { commonFunc } from '@/components/common';
import FilterByLevelAndDiff from '@/view/components/common/selector';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import Loader from '@/view/components/common/loader';
import { timeCompare } from '@/components/common/timeFormatter';
import TimeRangeDialog from '../common/timeRange';
import { songFuncInList } from '@/components/songs/func/songList';
import { defaultState_songsList } from '@/components/songs/default/states';
import LinkedCameraIcon from '@mui/icons-material/LinkedCamera';
import Captured from './captured';

import songsAPI from '@/components/songs/api';
import { genTitle } from '@/components/songs/filter';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export interface songsList_stateInt {
  isLoading:boolean,
  filterByName:string,
  scoreData:scoreData[],
  allSongsData:Map<String,songData>,
  options:{[key:string]:string[]},
  mode:number,
  range:number,
  page:number,
  filterOpen:boolean,
  timeRangeOpen:boolean,
  bpm:B,
  bpi:BPIR,
  dateRange:{
    from:string,
    to:string,
  },
  memo:boolean,
  showLatestOnly:boolean,
  orderTitle:number,
  orderMode:number,
  versions:number[],
  clearType:number[],
  openCaptureScr:boolean
}

interface P{
  title:string,
  full:scoreData[],
  updateScoreData:()=>Promise<void>,
  intl:any,
  isFav:boolean,
  defToday?:boolean
}

const ranges = [{val:0,label:"全期間"},{val:1,label:"本日更新"},{val:2,label:"前日更新"},{val:3,label:"今週更新"},{val:5,label:"期間指定"},{val:4,label:"1ヶ月以上未更新"}]

class SongsList extends React.Component<P&RouteComponentProps,songsList_stateInt> {

  constructor(props:P&RouteComponentProps){
    super(props);
    const search = new URLSearchParams(props.location.search);
    const initialBPIRange = search.get("initialBPIRange") || undefined;
    this.state = defaultState_songsList(initialBPIRange,this.props.defToday || false);
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  handleChangePage = (_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.setState({page:newPage});

  async componentDidMount(){
    let allSongs = (await new songsAPI().load()).all();
    this.setState({
      scoreData:this.props.full,
      allSongsData:allSongs,
      isLoading:false,
    });
    if(this.props.defToday){
      this.setState({
        scoreData:this.songFilter()
      });
    }
  }

  componentDidUpdate(prevProps:P){
    if(!equal(prevProps.full,this.props.full)){
      return this.setState({scoreData:this.songFilter()});
    }
  }

  updateScoreData(row:songData):Promise<void>{
    if(row){
      const allSongsData = this.state.allSongsData;
      const title = genTitle(row["title"],row["difficulty"]);
      allSongsData.set(title,row);
      this.setState({
        allSongsData:allSongsData
      })
    }
    return this.props.updateScoreData();
  }

  handleChange = (name:string,target:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,target);
  }

  handleExec = (name:string,checked:boolean,target:string)=>{
    let newState = this.state;
    if(checked){
      newState["options"][target].push(name);
    }else{
      newState["options"][target] = newState["options"][target].filter((t:string)=> t !== name);
    }
    return this.setState({scoreData:this.songFilter(newState),options:newState["options"],page:0});
  }

  handleInputChange = (e:React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>|null)=>{
    let newState = this.clone();
    newState.filterByName = e ? e.target.value : "";
    return this.setState({scoreData:this.songFilter(newState),filterByName:newState.filterByName,page:0});
  }

  songFilter = (newState:songsList_stateInt = this.state) =>{
    const diffs:string[] = ["hyper","another","leggendaria"];
    const b = newState.bpm;
    const bpir = newState.bpi;
    const f = this.state.allSongsData;

    const sFunc = new songFuncInList(newState);

    if(this.state.allSongsData.size === 0) return [];
    return this.props.full.filter((data)=>{
      const _f = f.get(genTitle(data.title,data["difficulty"]));

      sFunc.setData(data);
      if(!_f){return false;}

      const max = _f["notes"] * 2;
      return (
        bpmFilter(_f.bpm,b) &&
        bpiFilter(data.currentBPI,bpir) &&
        sFunc.evaluateRange() &&
        sFunc.evaluateMode(max) &&
        sFunc.evaluateVersion(_f.textage) &&
        sFunc.availableMemo(_f.memo) &&
        sFunc.evaluateClearType(data.clearState) &&
        newState["options"]["level"].some((item:string)=>{
          return item === data.difficultyLevel }) &&
        newState["options"]["difficulty"].some((item:string)=>{
          return diffs[Number(item)] === data.difficulty} ) &&
        data.title.toLowerCase().indexOf(newState["filterByName"].toLowerCase()) > -1
      )
    })
  }

  handleOrderTitleChange = (event:SelectChangeEvent<number>):void =>{
    const val = event.target.value;
    if (typeof val !== "number") { return; }
    return this.setState({orderTitle:val,page:0});
  }

  handleOrderModeChange = (event:SelectChangeEvent<number>):void =>{
    const val = event.target.value;
    if (typeof val !== "number") { return; }
    return this.setState({orderMode:val,page:0});
  }

  sortedData = ():scoreData[]=>{
    const {scoreData,orderMode,orderTitle,allSongsData,showLatestOnly} = this.state;
    let s = scoreData;
    let res = scoreData.sort((a,b)=> {
      const aFull = allSongsData.get(genTitle(a.title,a.difficulty));
      const bFull = allSongsData.get(genTitle(b.title,b.difficulty));
      if(!aFull || !bFull) return -1;
      switch(orderTitle){
        case 0:
        default:
        return b.title.localeCompare(a.title, "ja", {numeric:true});
        case 1:
        return Number(a.difficultyLevel) - Number(b.difficultyLevel);
        case 2:
        return a.currentBPI - b.currentBPI;
        case 3:
        const isUndefinedPlayState = 7;
        const convertPlayState = (st:number)=>(st === isUndefinedPlayState || isNaN(st) ? -1 : st)
        return convertPlayState(a.clearState) - convertPlayState(b.clearState);
        case 4:
        const am = !a.missCount ? Infinity : Number.isNaN(a.missCount) ? Infinity : a.missCount,
        bm = !b.missCount ? Infinity : Number.isNaN(b.missCount) ? Infinity : b.missCount;
        return  am-bm;
        case 5:
        return a.exScore - b.exScore;
        case 6:
        return a.exScore / aFull["notes"] * 2 - b.exScore / bFull["notes"] * 2;
        case 7:
        return timeCompare(a.updatedAt,b.updatedAt);
        case 8:
        case 9:
        const isMaxBPM = 8;
        let aBpm = aFull["bpm"];
        let bBpm = bFull["bpm"];
        if(/-/.test(aBpm)) aBpm = orderTitle === isMaxBPM ? aBpm.split("-")[1] : aBpm.split("-")[0];
        if(/-/.test(bBpm)) bBpm = orderTitle === isMaxBPM ? bBpm.split("-")[1] : bBpm.split("-")[0];
        return Number(aBpm) - Number(bBpm);
        case 10:
        let aVer = aFull["textage"].replace(/\/.*?$/,"");
        let bVer = bFull["textage"].replace(/\/.*?$/,"");
        return Number(aVer) - Number(bVer);
      }
    });
    if(_showLatestSongs() && orderTitle === 2){
      s = scoreData.filter((item)=>item.currentBPI === Infinity).sort((a,b)=>{
        const aFull = allSongsData.get(genTitle(a.title,a.difficulty));
        const bFull = allSongsData.get(genTitle(b.title,b.difficulty));
        if(!aFull || !bFull) return -1;
        return b.exScore / bFull["notes"] * 2 - a.exScore / aFull["notes"] * 2;
      });
      if(showLatestOnly){
        return s;
      }else{
        res = res.filter((item)=>item.currentBPI !== Infinity);
        return orderMode === 0  ? res.concat(s) : res.reverse().concat(s);
      }
    }
    return orderMode === 0  ? res : res.reverse();
  }

  handleModeChange = (event:SelectChangeEvent<number>):void =>{
    if (typeof event.target.value !== "number") { return; }
    let newState = this.clone();
    newState.mode = event.target.value;
    return this.setState({scoreData:this.songFilter(newState),mode:event.target.value,page:0});
  }

  handleRangeChange = (event:SelectChangeEvent<number>):void =>{
    if (typeof event.target.value !== "number") { return; }
    if(event.target.value === 5){
      this.toggleTimeRangeDialog();
      return;
    }
    let newState = this.clone();
    newState.range = event.target.value;
    return this.setState({scoreData:this.songFilter(newState),range:event.target.value,page:0});
  }

  applyFilter = (state:{bpm:B,versions:number[],memo:boolean|null,showLatestOnly:boolean|null,clearType:number[]}):void=>{
    let newState = this.clone();
    newState.bpm = state.bpm;
    newState.versions = state.versions;
    newState.clearType = state.clearType;
    newState.memo = typeof state.memo !== "boolean" ? false : state.memo;
    newState.showLatestOnly = typeof state.showLatestOnly !== "boolean" ? false : state.showLatestOnly;
    return this.setState({scoreData:this.songFilter(newState),bpm:state.bpm,versions:state.versions,clearType:state.clearType,memo:newState.memo,showLatestOnly:newState.showLatestOnly,page:0});
  }

  applyTimeFilter = (state:{from:string,to:string}):void=>{
    let newState = this.clone();
    newState.dateRange.from = state.from;
    newState.dateRange.to = state.to;
    newState.range = 5;
    return this.setState({scoreData:this.songFilter(newState),range:5,dateRange:state,page:0});
  }

  handleToggleFilterScreen = ()=> this.setState({filterOpen:!this.state.filterOpen});
  toggleTimeRangeDialog = ()=> this.setState({timeRangeOpen:!this.state.timeRangeOpen})

  clone = ()=>{
    return new commonFunc().set(this.state).clone();
  }

  openCaptureScr = ()=> this.setState({openCaptureScr:!this.state.openCaptureScr});

  render(){
    const {formatMessage} = this.props.intl;
    const {isFav} = this.props;
    const {openCaptureScr,isLoading,filterByName,options,orderMode,orderTitle,mode,range,page,filterOpen,versions,timeRangeOpen,showLatestOnly,clearType} = this.state;
    const orders = [
      formatMessage({id:"Orders.Title"}),
      formatMessage({id:"Orders.Level"}),
      formatMessage({id:"Orders.BPI"}),
      formatMessage({id:"Orders.ClearLamp"}),
      formatMessage({id:"Orders.MissCount"}),
      formatMessage({id:"Orders.EX"}),
      formatMessage({id:"Orders.Percentage"}),
      formatMessage({id:"Orders.LastUpdate"}),
      formatMessage({id:"Orders.MaxBPM"}),
      formatMessage({id:"Orders.MinBPM"}),
      formatMessage({id:"Orders.Version"}),
    ];
    if(isLoading){
      return (<Loader/>);
    }
    const scores = this.sortedData();
    return (
      <Container fixed  className="commonLayout" id="songsVil">
        {openCaptureScr && <Captured close={this.openCaptureScr}/>}
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom
          style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            {isFav &&
              <Button onClick={()=>this.props.history.push("/lists")} style={{minWidth:"auto",padding:"6px 0px"}}><ArrowBackIcon/></Button>
            }
            {isFav && this.props.title}
          </div>
          <div style={{display:"flex"}}>
            <Button
              startIcon={<LinkedCameraIcon/>}
              onClick={this.openCaptureScr} size="small" color="secondary" style={{marginRight:"10px",minWidth:"40px",padding:"5px 6px"}}>
              共有
            </Button>
            <IconButton
              onClick={this.handleToggleFilterScreen} color="secondary" size="small">
              <FilterListIcon/>
            </IconButton >
            <FormControl>
              <Select value={range} displayEmpty onChange={this.handleRangeChange}>
                {ranges.map(item=>(
                  <MenuItem value={item.val} key={item.val}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Typography>
        <Grid container spacing={1} alignItems={"center"} style={{margin:"5px 0"}}>
          <Grid item xs={6}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Songs.mode"/></InputLabel>
              <Select value={mode} onChange={this.handleModeChange}>
                {[0,1,2,3,4,5,6,7,8].map(item=>(
                  <MenuItem key={item} value={item}><FormattedMessage id={`Songs.mode${item}`}/></MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl component="fieldset" style={{width:"100%"}}>
            <InputLabel><FormattedMessage id="Songs.filterByName"/></InputLabel>
              <Input
                style={{width:"100%"}}
                placeholder={"(ex.)255"}
                value={filterByName}
                onChange={this.handleInputChange}
                endAdornment={
                  filterByName &&
                  <InputAdornment position="end">
                    <IconButton onClick={()=>this.handleInputChange(null)} size="large">
                      <BackspaceIcon/>
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>
          </Grid>
        </Grid>
        <OrderControl
          orderTitles={orders}
          orderMode={orderMode} orderTitle={orderTitle} handleOrderModeChange={this.handleOrderModeChange} handleOrderTitleChange={this.handleOrderTitleChange}/>
        <FilterByLevelAndDiff options={options} handleChange={this.handleChange}/>
        {scores.length === 0 && (
          <Alert severity="warning" style={{margin:"10px 0"}}>
            <AlertTitle>表示対象がありません</AlertTitle>
            <p>
            条件に合致する楽曲がありませんでした。<br/>
            フィルタ条件を変更してみてください。
            </p>
          </Alert>
        )}
        {scores.length > 0 && (
          <SongsTable
            page={page} handleChangePage={this.handleChangePage}
            data={scores} mode={mode}
            allSongsData={this.state.allSongsData}
            updateScoreData={this.updateScoreData}/>
        )}
        {filterOpen && <SongsFilter versions={versions} clearType={clearType} handleToggle={this.handleToggleFilterScreen} applyFilter={this.applyFilter} bpi={this.state.bpi} bpm={this.state.bpm} memo={this.state.memo} showLatestOnly={showLatestOnly}/>}
        {timeRangeOpen && <TimeRangeDialog handleToggle={this.toggleTimeRangeDialog} dateRange={this.state.dateRange} applyTimeFilter={this.applyTimeFilter}/>}
      </Container>
    );
  }
}

export default withRouter(injectIntl(SongsList));
