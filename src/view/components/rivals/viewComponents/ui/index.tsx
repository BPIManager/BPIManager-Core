import * as React from 'react';
import { FormattedMessage, injectIntl } from "react-intl";
import { songsDB } from "../../../../../components/indexedDB";

import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import BackspaceIcon from '@material-ui/icons/Backspace';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Table from "../table";
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { _prefix, _prefixFromNum } from '../../../../../components/songs/filter';
import { _isSingle } from '../../../../../components/settings';
import moment from 'moment';
import OrderControl from "../../../songs/common/orders";
import Button from '@material-ui/core/Button';
import FilterListIcon from '@material-ui/icons/FilterList';
import { verArr, bpmFilter } from '../../../songs/common';
import SongsFilter, { B } from '../../../songs/common/filter';
import { commonFunc } from '../../../../../components/common';
import FilterByLevelAndDiff from "../../../common/selector";
import { withRivalData } from '../../../../../components/stats/radar';
import { songData } from '../../../../../types/data';
import Loader from '../../../common/loader';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { toMoment } from '../../../../../components/common/timeFormatter';
import Alert from '@material-ui/lab/Alert';
import AlertTitle from '@material-ui/lab/AlertTitle';
import Link from '@material-ui/core/Link';
import { config } from '../../../../../config';

interface stateInt {
  isLoading:boolean,
  filterByName:string,
  scoreData:withRivalData[],
  allSongsData:{[key:string]:songData},
  options:{[key:string]:string[]},
  page:number,
  mode:number,
  filterOpen:boolean,
  orderTitle:number,
  orderMode:number,
  versions:number[],
  bpm:B,
  todayOnly:boolean
}

interface P{
  type:number,
  full:withRivalData[],
  intl:any,
  showAllScore:boolean,
  rivalName:()=>string
}

class SongsUI extends React.Component<P&RouteComponentProps,stateInt> {

  constructor(props:P&RouteComponentProps){
    super(props);
    const search = new URLSearchParams(props.location.search);
    const initialView = search.get("init");
    this.state = {
      isLoading:true,
      filterByName:"",
      mode:0,
      scoreData:[],
      options:{
        level:["11","12"],
        difficulty:["0","1","2"],
        pm:["+","-"],
      },
      filterOpen:false,
      allSongsData:{},
      page:0,
      orderTitle:initialView === "1" ? 11 : 2,
      orderMode:1,
      bpm:{
        noSoflan:true,
        min:"",
        max:"",
        soflan:true,
      },
      versions:verArr(),
      todayOnly:initialView === "1" ? true : false
    }
  }

  handleChangePage = (_e:React.MouseEvent<HTMLButtonElement, MouseEvent> | null, newPage:number):void => this.setState({page:newPage});

  async componentDidMount(){
    let allSongs:{[key:string]:songData} = {};
    const allSongsRawData:songData[] = await new songsDB().getAll(_isSingle());
    for(let i =0; i < allSongsRawData.length; ++i){
      const prefix:string = _prefixFromNum(allSongsRawData[i]["difficulty"]);
      allSongs[allSongsRawData[i]["title"] + prefix] = allSongsRawData[i];
    }
    let newState = this.clone();
    newState.allSongsData = allSongs;
    this.setState({
      isLoading:false,
      allSongsData:allSongs,
      scoreData:this.songFilter(newState),
    });
  }

  handleToggleFilterScreen = ()=> this.setState({filterOpen:!this.state.filterOpen});

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

  toggleTodayOnly = () => {
    let newState = this.clone();
    newState.todayOnly = !this.state.todayOnly;
    return this.setState({scoreData:this.songFilter(newState),todayOnly:newState.todayOnly,page:0});
  }

  songFilter = (newState:stateInt = this.state) =>{
    const diffs:string[] = ["hyper","another","leggendaria"];
    const v = newState.versions;
    const b = newState.bpm;
    const f = newState.allSongsData;
    const todayOnly = newState.todayOnly;

    const evaluateVersion = (song:string):boolean=>{
      const songVer = song.split("/")[0];
      if(songVer === "s"){
        return v.indexOf(1.5) > -1;
      }
      return v.indexOf(Number(songVer)) > -1;
    }

    return this.props.full.filter((data)=>{
      const _f = f[data.title + _prefix(data["difficulty"])];
      const pm:string[] = this.state.options.pm;
      if(!_f){return false;}
      const evaluateGap = ()=>{
        const plus = pm.indexOf("+") > -1;
        const minus = pm.indexOf("-") > -1;
        if(!plus && minus) return data.myEx - data.rivalEx <= 0;
        if(plus && !minus) return data.myEx - data.rivalEx > 0;
        return plus && minus ? true : false;
      }
      const isTodayOnly = ()=>{
        if(!todayOnly){
          return true;
        }else{
          return toMoment(data.rivalLastUpdate) === toMoment(new Date());
        }
      }
      return (
        bpmFilter(_f.bpm,b) &&
        evaluateVersion(_f.textage) &&
        evaluateGap() &&
        isTodayOnly() &&
        newState["options"]["level"].some((item:string)=>{
          return item === data.difficultyLevel }) &&
        newState["options"]["difficulty"].some((item:string)=>{
          return diffs[Number(item)] === data.difficulty} ) &&
        data.title.toLowerCase().indexOf(newState["filterByName"].toLowerCase()) > -1
      )
    })
  }

  sortedData = ():withRivalData[]=>{
    const {scoreData,orderMode,orderTitle,allSongsData} = this.state;
    const res = scoreData.sort((a,b)=> {
      const aFull = allSongsData[a.title + _prefix(a.difficulty)];
      const bFull = allSongsData[b.title + _prefix(b.difficulty)];
      if(aFull && bFull){
        const aMax = aFull["notes"] * 2;
        const bMax = bFull["notes"] * 2;
        let aBpm = aFull["bpm"];
        let bBpm = bFull["bpm"];
        switch(orderTitle){
          case 0:
          default:
            return b.title.localeCompare(a.title, "ja", {numeric:true});
          case 1:
            return Number(a.difficultyLevel) - Number(b.difficultyLevel);
          case 2:
            return (a.myEx - a.rivalEx) - (b.myEx - b.rivalEx)
          case 3:
            return (a.myEx - b.myEx);
          case 4:
            return (a.rivalEx - b.rivalEx);
          case 5:
            return a.myEx / aMax - b.myEx / bMax;
          case 6:
            return a.rivalEx / aMax - b.rivalEx / bMax;
          case 7:
            return (a.myEx / aMax - a.rivalEx / aMax) - (b.myEx / bMax - b.rivalEx / bMax);
          case 8:
            const am = !a.myMissCount ? Infinity : Number.isNaN(a.myMissCount) ? Infinity : a.myMissCount,
            bm = !b.myMissCount ? Infinity : Number.isNaN(b.myMissCount) ? Infinity : b.myMissCount;
            return  am-bm;
          case 9:
            const arm = !a.rivalMissCount ? Infinity : Number.isNaN(a.rivalMissCount) ? Infinity : a.rivalMissCount,
            brm = !b.rivalMissCount ? Infinity : Number.isNaN(b.rivalMissCount) ? Infinity : b.rivalMissCount;
            return  arm-brm;
          case 10:
            return moment(a.myLastUpdate).diff(b.myLastUpdate);
          case 11:
            return moment(a.rivalLastUpdate).diff(b.rivalLastUpdate);
          case 12:
            return a.myClearState - b.myClearState;
          case 13:
            return a.rivalClearState - b.rivalClearState;
          case 14:
          case 15:
            if(/-/.test(aBpm)) aBpm = orderTitle === 14 ? aBpm.split("-")[1] : aBpm.split("-")[0];
            if(/-/.test(bBpm)) bBpm = orderTitle === 14 ? bBpm.split("-")[1] : bBpm.split("-")[0];
            return Number(aBpm) - Number(bBpm);
          case 16:
            let aVer = aFull["textage"].replace(/\/.*?$/,"");
            let bVer = bFull["textage"].replace(/\/.*?$/,"");
            return Number(aVer) - Number(bVer);
        }
      }
      return 0;
    });
    return orderMode === 0  ? res : res.reverse();
  }

  clone = ()=>{
    return new commonFunc().set(this.state).clone();
  }

  handleModeChange = (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):void =>{
    if (typeof event.target.value !== "number") { return; }
    let newState = this.clone();
    newState.mode = event.target.value;
    return this.setState({scoreData:this.songFilter(newState),mode:event.target.value,page:0});
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

  applyFilter = (state:{bpm:B,versions:number[]}):void=>{
    let newState = this.clone();
    newState.bpm = state.bpm;
    newState.versions = state.versions;
    return this.setState({scoreData:this.songFilter(newState),bpm:state.bpm,versions:state.versions,page:0});
  }

  render(){
    const {formatMessage} = this.props.intl;
    const {isLoading,filterByName,options,orderMode,orderTitle,page,mode,filterOpen,versions,todayOnly} = this.state;
    const _my = formatMessage({id:"Orders.My"}), _rival = formatMessage({id:"Orders.Rival"});
    let orders = [
      formatMessage({id:"Orders.Title"}),
      formatMessage({id:"Orders.Level"}),
      formatMessage({id:"Orders.Gap"}),
      _my + formatMessage({id:"Orders.EX"}),
      _rival + formatMessage({id:"Orders.EX"}),
      _my + formatMessage({id:"Orders.Percentage"}),
      _rival + formatMessage({id:"Orders.Percentage"}),
      formatMessage({id:"Orders.PercentageGap"}),
      _my + formatMessage({id:"Orders.MissCount"}),
      _rival + formatMessage({id:"Orders.MissCount"}),
      _my + formatMessage({id:"Orders.LastUpdate"}),
      _rival + formatMessage({id:"Orders.LastUpdate"}),
      _my + formatMessage({id:"Orders.ClearLamp"}),
      _rival + formatMessage({id:"Orders.ClearLamp"}),
      formatMessage({id:"Orders.MaxBPM"}),
      formatMessage({id:"Orders.MinBPM"}),
      formatMessage({id:"Orders.Version"}),
    ]
    if(this.props.showAllScore){
      delete orders[10];
    }
    if(isLoading){
      return (<Loader/>);
    }
    return (
      <div>
        {todayOnly && (
          <Alert severity="info" style={{margin:"10px 0"}}>
            <AlertTitle style={{marginTop:"0px",fontWeight:"bold"}}>今日の更新</AlertTitle>
            <p>
              本日の更新だけを表示しています。<br/>
              <Link onClick={this.toggleTodayOnly} color="textSecondary">すべてのデータを表示するにはこちらをクリック</Link><br/>
              <Link href={`https://twitter.com/share?text=BPIManagerのスコアを更新しました&url=${config.baseUrl}/u/${this.props.rivalName()}%3Finit%3D1`} target="_blank" color="textSecondary">Twitterでシェア</Link>
            </p>
          </Alert>
        )}
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={10}>
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
          <Grid item xs={2}>
            <Button
              className="filterButton"
              fullWidth
              onClick={this.handleToggleFilterScreen} variant="outlined" color="primary"
              style={{marginRight:"10px",padding:"5px 6px",height:"100%",minWidth:"auto"}}>
              <FilterListIcon/>
            </Button>
          </Grid>
        </Grid>
        <OrderControl
          orderTitles={orders}
          orderMode={orderMode} orderTitle={orderTitle} handleOrderModeChange={this.handleOrderModeChange} handleOrderTitleChange={this.handleOrderTitleChange}/>
        <FilterByLevelAndDiff options={options} handleChange={this.handleChange} includePMButtons={true}/>

        <Table
          page={page} handleChangePage={this.handleChangePage}
          data={this.sortedData()} mode={mode}/>
        {filterOpen && <SongsFilter versions={versions} handleToggle={this.handleToggleFilterScreen} applyFilter={this.applyFilter} bpm={this.state.bpm}/>}
      </div>
    );
  }
}

export default withRouter(injectIntl(SongsUI));
