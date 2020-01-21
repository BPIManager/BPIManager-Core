import * as React from 'react';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import { FormattedMessage } from "react-intl";
import {songsDB} from "../../../../components/indexedDB";

import { injectIntl } from "react-intl";
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import BackspaceIcon from '@material-ui/icons/Backspace';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import FilterListIcon from '@material-ui/icons/FilterList';
import SongsTable from "./tablePlayed";
import Input from '@material-ui/core/Input';

import {scoreData, songData} from "../../../../types/data";
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { _prefix, _prefixFromNum } from '../../../../components/songs/filter';
import equal from 'fast-deep-equal'
import CircularProgress from '@material-ui/core/CircularProgress';
import { _isSingle } from '../../../../components/settings';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import SongsFilter, { B, BPIR } from '../common/filter';
import { bpmFilter,bpiFilter,verArr } from '../common';
import OrderControl from "../common/orders";
import { commonFunc } from '../../../../components/common';
import FilterByLevelAndDiff from '../../common/selector';
import { withRouter, RouteComponentProps } from 'react-router-dom';

interface stateInt {
  isLoading:boolean,
  filterByName:string,
  scoreData:scoreData[],
  allSongsData:{[key:string]:songData},
  options:{[key:string]:string[]},
  mode:number,
  range:number,
  page:number,
  filterOpen:boolean,
  bpm:B,
  bpi:BPIR,
  orderTitle:number,
  orderMode:number,
  versions:number[]
}

interface P{
  title:string,
  full:scoreData[],
  updateScoreData:()=>Promise<void>,
  intl:any,
}

const ranges = [{val:0,label:"全期間"},{val:1,label:"本日更新"},{val:2,label:"前日更新"},{val:3,label:"今週更新"},{val:4,label:"1ヶ月以上未更新"}]

class SongsList extends React.Component<P&RouteComponentProps,stateInt> {

  constructor(props:P&RouteComponentProps){
    super(props);
    const search = new URLSearchParams(props.location.search);
    const initialBPIRange = search.get("initialBPIRange");
    this.state = {
      isLoading:true,
      filterByName:"",
      scoreData:[],
      allSongsData:{},
      mode:0,
      options:{
        level:["11","12"],
        difficulty:["0","1","2"],
      },
      bpm:{
        noSoflan:true,
        min:"",
        max:"",
        soflan:true,
      },
      bpi:{
        min:initialBPIRange ? Number(initialBPIRange) : "",
        max:initialBPIRange ? Number(initialBPIRange) + 10 : "",
      },
      range:0,
      page:0,
      filterOpen:false,
      orderTitle:2,
      orderMode:1,
      versions:verArr()
    }
    this.updateScoreData = this.updateScoreData.bind(this);
  }

  handleChangePage = (_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.setState({page:newPage});

  async componentDidMount(){
    let allSongs:{[key:string]:songData} = {};
    const allSongsRawData = await new songsDB().getAll(_isSingle());
    for(let i =0; i < allSongsRawData.length; ++i){
      const prefix:string = _prefixFromNum(allSongsRawData[i]["difficulty"]);
      allSongs[allSongsRawData[i]["title"] + prefix] = allSongsRawData[i];
    }
    this.setState({
      scoreData:this.props.full,
      allSongsData:allSongs,
      isLoading:false,
    });
  }

  componentDidUpdate(prevProps:P){
    if(!equal(prevProps.full,this.props.full)){
      return this.setState({scoreData:this.songFilter()});
    }
  }

  updateScoreData():Promise<void>{
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

  songFilter = (newState:stateInt = this.state) =>{
    const diffs:string[] = ["hyper","another","leggendaria"];
    const m = newState.mode;
    const r = newState.range;
    const b = newState.bpm;
    const bpir = newState.bpi;
    const v = newState.versions;
    const f = this.state.allSongsData;

    const evaluateRange = (data:scoreData):boolean=>{
      const format = (t:string|Date|moment.Moment)=>moment(t).format("YYYYMMDD");
      return r === 0 ? true :
      r === 1 ? format(data.updatedAt) === format(new Date()) :
      r === 2 ? format(data.updatedAt) === format(moment().subtract(1, 'day')) :
      r === 3 ? moment(data.updatedAt).week() === moment(new Date()).week() :
      moment(data.updatedAt).isBefore(moment().subtract(1, 'month'))
    }

    const evaluateMode = (data:scoreData,max:number):boolean=>{
      return m === 0 ? true :
      m === 1 ? data.exScore / max < 2 / 3 :
      m === 2 ? data.exScore / max < 7 / 9 && 2/3 < data.exScore / max :
      m === 3 ? data.exScore / max < 8 / 9 && 7/9 < data.exScore / max :
      m === 4 ? data.exScore / max < 17 / 18 && 8/9 < data.exScore / max :
      m === 5 ? true :
      m === 6 ? data.clearState <= 3 :
      m === 7 ? data.clearState <= 4 :
      m === 8 ? data.clearState <= 5 : true
    }

    const evaluateVersion = (song:string):boolean=>{
      const songVer = song.split("/")[0];
      if(songVer === "s"){
        return v.indexOf(1.5) > -1;
      }
      return v.indexOf(Number(songVer)) > -1;
    }

    if(Object.keys(this.state.allSongsData).length === 0) return [];
    return this.props.full.filter((data)=>{
      const _f = f[data.title + _prefix(data["difficulty"])];
      if(!_f){return false;}
      const max = _f["notes"] * 2;
      return (
        bpmFilter(_f.bpm,b) &&
        bpiFilter(data.currentBPI,bpir) &&
        evaluateRange(data) &&
        evaluateMode(data,max) &&
        evaluateVersion(_f.textage) &&
        newState["options"]["level"].some((item:string)=>{
          return item === data.difficultyLevel }) &&
        newState["options"]["difficulty"].some((item:string)=>{
          return diffs[Number(item)] === data.difficulty} ) &&
        data.title.toLowerCase().indexOf(newState["filterByName"].toLowerCase()) > -1
      )
    })
  }

  handleOrderTitleChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    const val = event.target.value;
    if (typeof val !== "number") { return; }
    return this.setState({orderTitle:val,page:0});
  }

  handleOrderModeChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    const val = event.target.value;
    if (typeof val !== "number") { return; }
    return this.setState({orderMode:val,page:0});
  }

  sortedData = ():scoreData[]=>{
    const {scoreData,orderMode,orderTitle,allSongsData} = this.state;
    const res = scoreData.sort((a,b)=> {
      const aFull = allSongsData[a.title + _prefix(a.difficulty)];
      const bFull = allSongsData[b.title + _prefix(b.difficulty)];
      switch(orderTitle){
        case 0:
        default:
        return b.title.localeCompare(a.title, "ja", {numeric:true});
        case 1:
        return Number(a.difficultyLevel) - Number(b.difficultyLevel);
        case 2:
        return a.currentBPI - b.currentBPI;
        case 3:
        const am = !a.missCount ? Infinity : Number.isNaN(a.missCount) ? Infinity : a.missCount,
        bm = !b.missCount ? Infinity : Number.isNaN(b.missCount) ? Infinity : b.missCount;
        return  am-bm;
        case 4:
        return a.exScore - b.exScore;
        case 5:
        return a.exScore / aFull["notes"] * 2 - b.exScore / bFull["notes"] * 2;
        case 6:
        return moment(a.updatedAt).diff(b.updatedAt);
        case 7:
        case 8:
        let aBpm = aFull["bpm"];
        let bBpm = bFull["bpm"];
        if(/-/.test(aBpm)) aBpm = orderTitle === 7 ? aBpm.split("-")[1] : aBpm.split("-")[0];
        if(/-/.test(bBpm)) bBpm = orderTitle === 7 ? bBpm.split("-")[1] : bBpm.split("-")[0];
        return Number(aBpm) - Number(bBpm);
        case 9:
        let aVer = aFull["textage"].replace(/\/.*?$/,"");
        let bVer = bFull["textage"].replace(/\/.*?$/,"");
        return Number(aVer) - Number(bVer);
      }
    });
    return orderMode === 0  ? res : res.reverse();
  }

  handleModeChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    if (typeof event.target.value !== "number") { return; }
    let newState = this.clone();
    newState.mode = event.target.value;
    return this.setState({scoreData:this.songFilter(newState),mode:event.target.value,page:0});
  }

  handleRangeCange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    if (typeof event.target.value !== "number") { return; }
    let newState = this.clone();
    newState.range = event.target.value;
    return this.setState({scoreData:this.songFilter(newState),range:event.target.value,page:0});
  }

  applyFilter = (state:{bpm:B,versions:number[]}):void=>{
    let newState = this.clone();
    newState.bpm = state.bpm;
    newState.versions = state.versions;
    return this.setState({scoreData:this.songFilter(newState),bpm:state.bpm,versions:state.versions,page:0});
  }

  handleToggleFilterScreen = ()=> this.setState({filterOpen:!this.state.filterOpen});

  clone = ()=>{
    return new commonFunc().set(this.state).clone();
  }

  render(){
    const {formatMessage} = this.props.intl;
    const {isLoading,filterByName,options,orderMode,orderTitle,mode,range,page,filterOpen,versions} = this.state;
    const orders = [
      formatMessage({id:"Orders.Title"}),
      formatMessage({id:"Orders.Level"}),
      formatMessage({id:"Orders.BPI"}),
      formatMessage({id:"Orders.MissCount"}),
      formatMessage({id:"Orders.EX"}),
      formatMessage({id:"Orders.Percentage"}),
      formatMessage({id:"Orders.LastUpdate"}),
      formatMessage({id:"Orders.MaxBPM"}),
      formatMessage({id:"Orders.MinBPM"}),
      formatMessage({id:"Orders.Version"}),
    ];
    if(isLoading){
      return (
        <Container className="loaderCentered">
          <CircularProgress />
        </Container>);
    }
    return (
      <Container className="commonLayout" fixed id="songsVil">
        <Typography component="h5" variant="h5" color="textPrimary" gutterBottom
          style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <FormattedMessage id={this.props.title}/>
          <div style={{display:"flex"}}>
            <Button
              className="filterButton"
              onClick={this.handleToggleFilterScreen} variant="outlined" color="primary" style={{marginRight:"10px",minWidth:"40px",padding:"5px 6px"}}>
              <FilterListIcon/>
            </Button>
            <FormControl>
              <Select value={range} displayEmpty onChange={this.handleRangeCange}>
                {ranges.map(item=>(
                  <MenuItem value={item.val} key={item.val}>{item.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </Typography>
        <Grid container spacing={1} style={{margin:"5px 0"}}>
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
                    <IconButton onClick={()=>this.handleInputChange(null)}>
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

        <SongsTable
          page={page} handleChangePage={this.handleChangePage}
          data={this.sortedData()} mode={mode}
          allSongsData={this.state.allSongsData}
          updateScoreData={this.updateScoreData}/>
        {filterOpen && <SongsFilter versions={versions} handleToggle={this.handleToggleFilterScreen} applyFilter={this.applyFilter} bpi={this.state.bpi} bpm={this.state.bpm}/>}
      </Container>
    );
  }
}

export default withRouter(injectIntl(SongsList));
