import * as React from 'react';
import { scoresDB, songsDB } from '@/components/indexedDB';
import {_isSingle, _goalBPI, _goalPercentage, _currentStore} from "@/components/settings";
import Container from "@material-ui/core/Container";
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import { FormattedMessage, injectIntl } from "react-intl";
import CompareTable from "@/view/components/compare/table";
import bpiCalcuator from '@/components/bpi';
import { commonFunc } from '@/components/common';
import FilterByLevelAndDiff from '@/view/components/common/selector';
import { compareData } from '@/types/compare';
import { scoreData } from '@/types/data';
import OrderControl from "@/view/components/songs/common/orders";
import { timeCompare } from '@/components/common/timeFormatter';
import songsAPI from '@/components/songs/api';

interface S {
  [key: string]: any,
  isLoading:boolean,
  full:compareData[],
  filtered:compareData[],
  sort:number,
  isDesc:boolean,
  options:{[key:string]:string[]},
  filterByName:string,
  compareFrom:string,
  compareTo:string,
  page:number,
  rowsPerPage:number,
  displayMode:string,
  total12BPI:number,
  total11BPI:number,
  orderTitle:number,
  orderMode:number,
}

class Compare extends React.Component<{intl:any},S> {
  _mounted: boolean = false;

  constructor(props:{intl:any}){
    super(props);
    this.state ={
      isLoading:true,
      full:[],
      filtered:[],
      sort:4,
      isDesc:true,
      options:{
        level:["11","12"],
        difficulty:["0","1","2"],
        pm:["+","-"],
      },
      filterByName:"",
      compareFrom:"28",
      compareTo:"27",
      page:0,
      rowsPerPage:10,
      displayMode:"exScore",
      total12BPI:0,
      total11BPI:0,
      orderTitle:2,
      orderMode:1,
    }
  }

  async componentDidMount(){
    this._mounted = true;
    const bpi12 = new bpiCalcuator(), bpi11 = new bpiCalcuator();
    const isSingle = _isSingle();
    const db = await new scoresDB(isSingle,_currentStore()).loadStore();
    const bpiMapper = (t:scoreData[])=>t.map((item:scoreData)=>item.currentBPI);
    const twelves = await db.getItemsBySongDifficulty("12");
    bpi12.allTwelvesBPI = bpiMapper(twelves);
    bpi12.allTwelvesLength = await new songsDB().getSongsNum();
    const elevens = await db.getItemsBySongDifficulty("11");
    bpi11.allTwelvesBPI = bpiMapper(elevens);
    bpi11.allTwelvesLength = await new songsDB().getSongsNum("11");
    this.setState({
      total12BPI:bpi12.totalBPI(),
      total11BPI:bpi11.totalBPI()
    });
    this.dataHandler();
  }

  componentWillUnmount(){
    this._mounted = false;
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

  handleSelectorChange = (name:string,target:string) => (e:React.ChangeEvent<HTMLInputElement>) =>{
    this.handleExec(name,e.target.checked,target);
  }

  handleExec = (name:string,checked:boolean,target:string)=>{
    let newState:S = this.state;
    if(checked){
      newState["options"][target].push(name);
    }else{
      newState["options"][target] = newState["options"][target].filter((t:string)=> t !== name);
    }
    this.setState({options:newState["options"],page:0});
    return this.filter();
  }

  changeSort = (newNum:number):void=>{
    const {sort,isDesc} = this.state;
    if(sort === newNum){
      return this.setState({isDesc:!isDesc});
    }
    this.setState({sort:newNum,isDesc:true});
  }

  clone = ():S=>{
    return new commonFunc().set(this.state).clone();
  }

  handleChange = (target:"compareFrom"|"compareTo"|"displayMode") => async (event:React.ChangeEvent<{name?:string|undefined; value:unknown;}>):Promise<void> =>{
    const val = event.target.value;
    if (typeof val !== "string") { return; }
    let newState:S = this.clone();
    newState[target] = val;
    this.setState({[target]:val,isLoading:true,page:0});
    return this.dataHandler(newState);
  }

  filter = ():compareData[]=>{
    const {options,full} = this.state;
    const diffs:string[] = ["hyper","another","leggendaria"];
    return full.filter((data)=>
        options["level"].some((item:string)=>item === data.difficultyLevel) &&
        options["difficulty"].some((item:string)=>diffs[Number(item)] === data.difficulty )
    )
  }

  async dataHandler(newState:S = this.state):Promise<void>{
    console.time("a");
    let result:compareData[] = [];
    const f = newState.compareFrom;
    const t = newState.compareTo;
    const isSingle = _isSingle();
    const scores = new scoresDB(isSingle,f);
    const sdb = await new songsAPI().load();
    const calc = new bpiCalcuator();
    const fData = await scores.getSpecificVersionAll();
    const goalBPI = _goalBPI(), goalPerc = _goalPercentage();
    const {displayMode} = this.state;
    for(let i =0; i < fData.length; ++i){
      let tScore = 0;
      if(fData[i]["currentBPI"] === Infinity){continue;}
      const tData = await scores.getItem(fData[i]["title"],fData[i]["difficulty"],t,isSingle);
      const songData = sdb.get(sdb.genTitle(fData[i]["title"],fData[i]["difficulty"]));
      if(!songData){continue;}
      const max = songData["notes"] * 2;
      calc.setData(songData["notes"] * 2,songData["avg"],songData["wr"]);
      calc.setCoef(songData["coef"] || -1);
      const percentager = (exScore:number):number =>{
        return Math.ceil(exScore / max * 10000) / 100;
      }
      if(!tData || tData.length === 0){
        if (t !== "BPI" && t !== "PERCENTAGE" && t !== "WR" && t !== "AVERAGE") continue;
        tScore = 0;
      }else{
        tScore = displayMode === "exScore" ? tData[0]["exScore"] :
        displayMode === "bpi" ? calc.setPropData(songData,tData[0]["exScore"],isSingle) :
        displayMode === "percentage" ? percentager(tData[0]["exScore"]) : 0;
      }
      if(t === "WR"){
        tScore = displayMode === "exScore" ? songData["wr"] :
        displayMode === "bpi" ? 100 :
        displayMode === "percentage" ? percentager(songData["wr"]) : 0;
      }
      if(t === "AVERAGE"){
        tScore = displayMode === "exScore" ? songData["avg"] :
        displayMode === "bpi" ? 0 :
        displayMode === "percentage" ? percentager(songData["avg"]) : 0;
      }
      if(t === "BPI"){
        tScore = displayMode === "exScore" ? calc.calcFromBPI(goalBPI,true) :
        displayMode === "bpi" ? goalBPI :
        displayMode === "percentage" ? percentager(calc.calcFromBPI(goalBPI,true)) : 0;
      }
      if(t === "PERCENTAGE"){
        tScore = displayMode === "exScore" ? Math.ceil(songData["notes"] * 2 * goalPerc / 100) :
        displayMode === "bpi" ? calc.setPropData(songData,Math.ceil(songData["notes"] * 2 * goalPerc / 100),isSingle) :
        displayMode === "percentage" ? goalPerc : 0;
      }
      const percentage = percentager(fData[i]["exScore"]);
      const gap = (Math.ceil(
        displayMode === "exScore" ? (fData[i]["exScore"] - tScore) * 10000 :
        displayMode === "bpi" ? (fData[i]["currentBPI"] - tScore) * 10000 :
        displayMode === "percentage" ? (percentage - tScore)  * 10000 : 0
      ) / 10000)
      result.push({
        title:fData[i]["title"],
        songData: songData,
        scoreData: fData[i],
        difficulty:fData[i]["difficulty"],
        difficultyLevel:fData[i]["difficultyLevel"],
        exScore:displayMode === "exScore" ? fData[i]["exScore"] : displayMode === "bpi" ? fData[i]["currentBPI"] : percentage,
        compareData:tScore,
        gap: gap
      });
    }
    if(!this._mounted){return;}
    console.timeEnd("a");
    return this.setState({full:result,isLoading:false});
  }

  sortedData = ():compareData[]=>{
    const {orderTitle,orderMode} = this.state;
    const sortedData:compareData[] = this.filter().sort((a,b)=>{
      switch(orderTitle){
        case 0:
        default:
        return b.gap - a.gap;
        case 1:
        return a.title.localeCompare(b.title, "ja", {numeric:true});
        case 2:
        return Number(b.difficultyLevel) - Number(a.difficultyLevel);
        case 3:
        return b.scoreData.currentBPI - a.scoreData.currentBPI;
        case 4:
        return b.scoreData.clearState - a.scoreData.clearState;
        case 5:
        return (b.scoreData.missCount || -1) - (a.scoreData.missCount || -1);
        case 6:
        return b.scoreData.exScore - a.scoreData.exScore;
        case 7:
        return (b.scoreData.exScore / (b.songData.notes * 2)) - (a.scoreData.exScore / (a.songData.notes * 2));
        case 8:
        return timeCompare(a.scoreData.updatedAt,b.scoreData.updatedAt);
        case 9:
        let aVer = a.songData["textage"].replace(/\/.*?$/,"");
        let bVer = b.songData["textage"].replace(/\/.*?$/,"");
        return Number(bVer) - Number(aVer);
      }
    }).filter((t:compareData)=>{
      const pm:string[] = this.state.options.pm;
      if(pm.indexOf("+") === -1 && pm.indexOf("-") > -1){
        return t.gap <= 0;
      }
      if(pm.indexOf("+") > -1 && pm.indexOf("-") === -1){
        return t.gap > 0;
      }
      return pm.indexOf("+") > -1 && pm.indexOf("-") > -1 ? true : false;
    });
    return orderMode === 0 ? sortedData.reverse() : sortedData;
  }

  handleChangePage = (newPage:number):void => this.setState({page:newPage});

  handleChangeRowsPerPage = (value:string):void => this.setState({page:0,rowsPerPage:+value});

  render(){
    const {formatMessage} = this.props.intl;
    const {compareFrom,compareTo,orderMode,orderTitle,displayMode,isLoading,page,rowsPerPage,options} = this.state;
    const orders = [
      "選択中の表示項目の差",
      formatMessage({id:"Orders.Title"}),
      formatMessage({id:"Orders.Level"}),
      formatMessage({id:"Orders.BPI"}) + "(比較元)",
      formatMessage({id:"Orders.ClearLamp"}) + "(比較元)",
      formatMessage({id:"Orders.MissCount"}) + "(比較元)",
      formatMessage({id:"Orders.EX"}) + "(比較元)",
      formatMessage({id:"Orders.Percentage"}) + "(比較元)",
      formatMessage({id:"Orders.LastUpdate"}) + "(比較元)",
      formatMessage({id:"Orders.Version"}),
    ];
    if(!this.state.full){
      return (null);
    }
    return (
      <Container fixed className="commonLayout">
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={6}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Compare.From"/></InputLabel>
              <Select value={compareFrom} onChange={this.handleChange("compareFrom")}>
                <MenuItem value={"28"}>28 BISTROVER</MenuItem>
                <MenuItem value={"27"}>27 HEROIC VERSE</MenuItem>
                <MenuItem value={"26"}>26 Rootage</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Compare.To"/></InputLabel>
              <Select value={compareTo} onChange={this.handleChange("compareTo")}>
                <MenuItem value={"28"}>28 BISTROVER</MenuItem>
                <MenuItem value={"27"}>27 HEROIC VERSE</MenuItem>
                <MenuItem value={"26"}>26 Rootage</MenuItem>
                <MenuItem value={"BPI"}>TARGET BPI</MenuItem>
                <MenuItem value={"PERCENTAGE"}>TARGET PERCENTAGE</MenuItem>
                <MenuItem value={"WR"}>WORLD RECORD</MenuItem>
                <MenuItem value={"AVERAGE"}>KAIDEN AVERAGE</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={1} style={{margin:"5px 0"}}>
          <Grid item xs={12}>
            <FormControl style={{width:"100%"}}>
              <InputLabel><FormattedMessage id="Compare.Display"/></InputLabel>
              <Select value={displayMode} onChange={this.handleChange("displayMode")}>
                <MenuItem value={"exScore"}>EXスコア</MenuItem>
                <MenuItem value={"bpi"}>BPI</MenuItem>
                <MenuItem value={"percentage"}>パーセンテージ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <OrderControl
          orderTitles={orders}
          orderMode={orderMode} orderTitle={orderTitle} handleOrderModeChange={this.handleOrderModeChange} handleOrderTitleChange={this.handleOrderTitleChange}/>
        <FilterByLevelAndDiff options={options} handleChange={this.handleSelectorChange} includePMButtons={true}/>
        <CompareTable full={this.sortedData()} isLoading={isLoading} page={page} rowsPerPage={rowsPerPage}
        changeSort={this.changeSort} displayMode={displayMode}
        handleChangeRowsPerPage={this.handleChangeRowsPerPage} handleChangePage={this.handleChangePage}/>
      </Container>
    );
  }
}

export default injectIntl(Compare);
